import * as THREE from 'three';
import { SoilPhysicalProperties } from './interdimensionalChemistry';

/**
 * Procedural GLSL Fracture & Shatter Decal Shader.
 * Generates Voronoi brittle cracks for high-hardness crystalline rocks,
 * turbulent crumbling fissures for granular regolith, or ripple meniscus waves for superfluids.
 */
const EXCAVATION_FRACTURE_VERTEX_SHADER = `
varying vec2 vUv;
varying vec3 vWorldPosition;
uniform float u_time;
uniform float u_hardness;

void main() {
  vUv = uv;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const EXCAVATION_FRACTURE_FRAGMENT_SHADER = `
varying vec2 vUv;
varying vec3 vWorldPosition;
uniform float u_age;
uniform float u_maxAge;
uniform float u_hardness;
uniform int u_style; // 0 = faceted-cleavage, 1 = columnar, 2 = granular-regolith, 3 = viscous-fluid, 4 = porous-aerogel
uniform vec3 u_primaryColor;
uniform vec3 u_glowColor;
uniform float u_radius;

// Procedural cellular Voronoi 2D
vec2 hash2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

float voronoi(vec2 p, out vec2 minOffset) {
  vec2 i_st = floor(p);
  vec2 f_st = fract(p);
  float m_dist = 1.0;
  minOffset = vec2(0.0);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point = hash2(i_st + neighbor);
      vec2 diff = neighbor + point - f_st;
      float dist = length(diff);
      if (dist < m_dist) {
        m_dist = dist;
        minOffset = point;
      }
    }
  }
  return m_dist;
}

void main() {
  vec2 centeredUv = (vUv - 0.5) * 2.0;
  float dist = length(centeredUv);
  if (dist > 1.0) discard;

  float progress = u_age / u_maxAge;
  float fade = 1.0 - smoothstep(0.0, 1.0, progress);
  float edgeFade = 1.0 - smoothstep(0.7, 1.0, dist);

  vec3 finalColor = u_primaryColor;
  float alpha = 0.0;
  vec2 minOff = vec2(0.0);

  if (u_style == 0 || u_style == 1) {
    // 0 = Faceted crystal cleavage / 1 = Columnar basalt (High Hardness Mohs >= 7.0)
    // Sharp branching Voronoi fracture lines with bright emissive glow
    float cellScale = 4.0 + u_hardness * 1.8;
    float v1 = voronoi(vUv * cellScale, minOff);
    float crackIntensity = smoothstep(0.08, 0.02, v1);

    // Secondary micro-cracks
    float v2 = voronoi(vUv * (cellScale * 2.8), minOff);
    float microCrack = smoothstep(0.06, 0.01, v2) * 0.65;

    // Shockwave expansion wave
    float wavePos = progress * 1.2;
    float waveRing = smoothstep(0.08, 0.0, abs(dist - wavePos)) * 1.4;

    vec3 crackGlow = mix(u_primaryColor, u_glowColor, 0.65);
    finalColor = mix(u_primaryColor * 0.4, crackGlow * 2.2, crackIntensity + microCrack + waveRing);
    alpha = (crackIntensity * 1.8 + microCrack * 0.9 + waveRing) * fade * edgeFade;
  } else if (u_style == 3) {
    // 3 = Viscous ferro-superfluid (Low Hardness Mohs < 3.0)
    // Expanding concentric ripple rings with metallic meniscus sheen
    float ripple = sin((dist * 18.0) - (u_age * 16.0)) * 0.5 + 0.5;
    float dropletSpray = voronoi(vUv * 12.0, minOff);
    float droplets = smoothstep(0.15, 0.08, dropletSpray);

    vec3 sheen = mix(u_primaryColor, vec3(1.0), ripple * 0.4);
    finalColor = mix(sheen, u_glowColor, droplets);
    alpha = (ripple * 0.6 + droplets * 0.8) * fade * edgeFade;
  } else {
    // 2 = Granular Regolith / 4 = Porous Aerogel (Medium Hardness Mohs 3.0 - 6.5)
    // Crumbling pulverized grain noise & eroding rim
    float grain = voronoi(vUv * 24.0, minOff);
    float crumble = smoothstep(0.35, 0.05, grain);
    float radialBlast = smoothstep(1.0, 0.2, dist + progress * 0.5);

    finalColor = mix(u_primaryColor, u_glowColor, crumble * 0.5);
    alpha = (crumble * 0.85 + radialBlast * 0.4) * fade * edgeFade;
  }

  gl_FragColor = vec4(finalColor, clamp(alpha, 0.0, 1.0));
}
`;

interface ActiveFractureDecal {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  age: number;
  maxAge: number;
}

interface ActiveDebrisShard {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  rotVel: THREE.Vector3;
  age: number;
  maxAge: number;
  damping: number;
  bounces: number;
  initialY: number;
}

interface ActiveShockRing {
  mesh: THREE.Mesh;
  age: number;
  maxAge: number;
  initialScale: number;
  targetScale: number;
}

/**
 * Excavation Shatter & Fracture Animation Rig.
 * Manages procedural GPU shader decals, multi-hardness fragment bursts, and shock rings.
 */
export class ExcavationShatterShaderRig {
  private activeDecals: ActiveFractureDecal[] = [];
  private activeShards: ActiveDebrisShard[] = [];
  private activeShockRings: ActiveShockRing[] = [];
  private containerGroup: THREE.Group;

  constructor() {
    this.containerGroup = new THREE.Group();
    this.containerGroup.name = 'excavation-shatter-container';
  }

  public getRootGroup(): THREE.Group {
    return this.containerGroup;
  }

  /**
   * Triggers the procedural shatter/crumble/splash animation at the excavation spot,
   * faithfully reflecting the material's Mohs hardness, density, and state of matter.
   */
  public triggerExcavation(
    position: THREE.Vector3,
    soilProps: SoilPhysicalProperties,
    radius = 3.5
  ) {
    const hardness = soilProps.effectiveHardnessMohs;
    const elem = soilProps.element;
    const style = soilProps.excavationTextureStyle;

    let styleId = 2; // granular-regolith default
    if (style === 'faceted-cleavage') styleId = 0;
    else if (style === 'columnar-jointed') styleId = 1;
    else if (style === 'viscous-fluid') styleId = 3;
    else if (style === 'porous-aerogel') styleId = 4;

    const primaryCol = new THREE.Color(elem.primaryColor);
    const glowCol = new THREE.Color(elem.glowColor);

    // 1. Procedural Fracture Decal Mesh
    const decalGeo = new THREE.PlaneGeometry(radius * 2.2, radius * 2.2, 8, 8);
    const decalMat = new THREE.ShaderMaterial({
      vertexShader: EXCAVATION_FRACTURE_VERTEX_SHADER,
      fragmentShader: EXCAVATION_FRACTURE_FRAGMENT_SHADER,
      uniforms: {
        u_time: { value: 0 },
        u_age: { value: 0 },
        u_maxAge: { value: hardness >= 7.0 ? 1.6 : 1.2 },
        u_hardness: { value: hardness },
        u_style: { value: styleId },
        u_primaryColor: { value: new THREE.Vector3(primaryCol.r, primaryCol.g, primaryCol.b) },
        u_glowColor: { value: new THREE.Vector3(glowCol.r, glowCol.g, glowCol.b) },
        u_radius: { value: radius },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    const decalMesh = new THREE.Mesh(decalGeo, decalMat);
    decalMesh.rotation.x = -Math.PI / 2;
    decalMesh.position.set(position.x, position.y + 0.08, position.z);
    this.containerGroup.add(decalMesh);

    this.activeDecals.push({
      mesh: decalMesh,
      material: decalMat,
      age: 0,
      maxAge: decalMat.uniforms.u_maxAge.value,
    });

    // 2. Multi-Hardness Debris Particle Bursts
    const shardCount = hardness >= 7.0 ? 18 : (style === 'viscous-fluid' ? 14 : 10);
    for (let i = 0; i < shardCount; i++) {
      let shardGeo: THREE.BufferGeometry;
      let shardMat: THREE.Material;

      if (hardness >= 7.0) {
        // High hardness: Brittle sharp polyhedra (octahedron / tetrahedron shards)
        shardGeo = new THREE.TetrahedronGeometry(0.18 + Math.random() * 0.22, 0);
        shardMat = new THREE.MeshStandardMaterial({
          color: primaryCol,
          emissive: glowCol,
          emissiveIntensity: 0.8,
          roughness: 0.15,
          metalness: 0.75,
          flatShading: true,
        });
      } else if (style === 'viscous-fluid') {
        // Low hardness superfluid: Droplets
        shardGeo = new THREE.SphereGeometry(0.12 + Math.random() * 0.14, 8, 8);
        shardMat = new THREE.MeshStandardMaterial({
          color: primaryCol,
          roughness: 0.1,
          metalness: 0.9,
          emissive: glowCol,
          emissiveIntensity: 0.4,
        });
      } else {
        // Medium hardness regolith/pumice: Irregular tumbling rock granules
        shardGeo = new THREE.DodecahedronGeometry(0.14 + Math.random() * 0.18, 0);
        shardMat = new THREE.MeshStandardMaterial({
          color: primaryCol,
          roughness: 0.85,
          metalness: 0.15,
          flatShading: true,
        });
      }

      const shardMesh = new THREE.Mesh(shardGeo, shardMat);
      const angle = (i / shardCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
      const speed = hardness >= 7.0 ? (5.5 + Math.random() * 6.5) : (3.5 + Math.random() * 3.5);
      const launchAngle = Math.PI * 0.25 + (Math.random() * 0.35);

      const vx = Math.cos(angle) * Math.cos(launchAngle) * speed;
      const vy = Math.sin(launchAngle) * speed + (hardness >= 7.0 ? 2.5 : 1.2);
      const vz = Math.sin(angle) * Math.cos(launchAngle) * speed;

      shardMesh.position.set(
        position.x + (Math.random() - 0.5) * 0.8,
        position.y + 0.3,
        position.z + (Math.random() - 0.5) * 0.8
      );

      this.containerGroup.add(shardMesh);

      this.activeShards.push({
        mesh: shardMesh,
        vel: new THREE.Vector3(vx, vy, vz),
        rotVel: new THREE.Vector3(
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 16
        ),
        age: 0,
        maxAge: 1.8 + Math.random() * 0.8,
        damping: soilProps.viscousDampingFactor,
        bounces: 0,
        initialY: position.y,
      });
    }

    // 3. Volumetric Shockwave Ring
    const shockGeo = new THREE.RingGeometry(0.3, 0.7, 32);
    const shockMat = new THREE.MeshBasicMaterial({
      color: glowCol,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: hardness >= 7.0 ? 0.95 : 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const shockMesh = new THREE.Mesh(shockGeo, shockMat);
    shockMesh.rotation.x = -Math.PI / 2;
    shockMesh.position.set(position.x, position.y + 0.12, position.z);
    this.containerGroup.add(shockMesh);

    this.activeShockRings.push({
      mesh: shockMesh,
      age: 0,
      maxAge: 0.65,
      initialScale: 0.5,
      targetScale: radius * (hardness >= 7.0 ? 1.6 : 1.1),
    });
  }

  /**
   * Per-frame animation update. Updates physics, shader uniforms, and auto-disposes finished elements.
   */
  public update(dt: number) {
    const gravity = -19.6;

    // 1. Update Decals
    for (let i = this.activeDecals.length - 1; i >= 0; i--) {
      const decal = this.activeDecals[i];
      decal.age += dt;
      decal.material.uniforms.u_age.value = decal.age;
      decal.material.uniforms.u_time.value += dt;

      if (decal.age >= decal.maxAge) {
        this.containerGroup.remove(decal.mesh);
        decal.mesh.geometry.dispose();
        decal.material.dispose();
        this.activeDecals.splice(i, 1);
      }
    }

    // 2. Update Shards
    for (let i = this.activeShards.length - 1; i >= 0; i--) {
      const shard = this.activeShards[i];
      shard.age += dt;

      // Gravity & Drag
      shard.vel.y += gravity * dt;
      shard.vel.x *= Math.max(0, 1.0 - shard.damping * dt * 0.8);
      shard.vel.z *= Math.max(0, 1.0 - shard.damping * dt * 0.8);

      shard.mesh.position.addScaledVector(shard.vel, dt);
      shard.mesh.rotation.x += shard.rotVel.x * dt;
      shard.mesh.rotation.y += shard.rotVel.y * dt;
      shard.mesh.rotation.z += shard.rotVel.z * dt;

      // Ground bounce
      if (shard.mesh.position.y <= shard.initialY && shard.vel.y < 0) {
        shard.mesh.position.y = shard.initialY;
        shard.vel.y = -shard.vel.y * 0.35;
        shard.vel.x *= 0.6;
        shard.vel.z *= 0.6;
        shard.bounces++;
      }

      // Fade out near end of life
      if (shard.age > shard.maxAge * 0.65) {
        const remaining = (shard.maxAge - shard.age) / (shard.maxAge * 0.35);
        shard.mesh.scale.setScalar(Math.max(0.01, remaining));
      }

      if (shard.age >= shard.maxAge) {
        this.containerGroup.remove(shard.mesh);
        shard.mesh.geometry.dispose();
        if (Array.isArray(shard.mesh.material)) {
          shard.mesh.material.forEach((m) => m.dispose());
        } else {
          shard.mesh.material.dispose();
        }
        this.activeShards.splice(i, 1);
      }
    }

    // 3. Update Shock Rings
    for (let i = this.activeShockRings.length - 1; i >= 0; i--) {
      const ring = this.activeShockRings[i];
      ring.age += dt;
      const progress = ring.age / ring.maxAge;
      const scale = THREE.MathUtils.lerp(ring.initialScale, ring.targetScale, Math.pow(progress, 0.65));
      ring.mesh.scale.set(scale, scale, scale);

      const mat = ring.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = (1.0 - progress) * 0.85;

      if (ring.age >= ring.maxAge) {
        this.containerGroup.remove(ring.mesh);
        ring.mesh.geometry.dispose();
        mat.dispose();
        this.activeShockRings.splice(i, 1);
      }
    }
  }

  /**
   * Cleanup all resources.
   */
  public dispose() {
    for (const decal of this.activeDecals) {
      this.containerGroup.remove(decal.mesh);
      decal.mesh.geometry.dispose();
      decal.material.dispose();
    }
    this.activeDecals = [];

    for (const shard of this.activeShards) {
      this.containerGroup.remove(shard.mesh);
      shard.mesh.geometry.dispose();
      if (Array.isArray(shard.mesh.material)) {
        shard.mesh.material.forEach((m) => m.dispose());
      } else {
        shard.mesh.material.dispose();
      }
    }
    this.activeShards = [];

    for (const ring of this.activeShockRings) {
      this.containerGroup.remove(ring.mesh);
      ring.mesh.geometry.dispose();
      (ring.mesh.material as THREE.Material).dispose();
    }
    this.activeShockRings = [];
  }
}
