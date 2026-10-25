import * as THREE from 'three';
import { PlacedWorldBuilding } from '../types/manifold';
import { ArticulatedRagdollEntity } from './ragdollPhysics';
import { autonomicEquationEngine } from './autonomicArchitectureAndEquationEngine';

// ============================================================================
// 1. SOFTWARE-WEBGL DETECTION & ADAPTIVE DYNAMIC RESOLUTION SCALING (DRS) + LOD
// ============================================================================

export const IS_SOFTWARE_WEBGL: boolean = (() => {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
})();

export interface GraphicsPerformanceTelemetry {
  fps: number;
  frameTimeMs: number;
  activePixelRatio: number;
  lodTier0Count: number;
  lodTier1Count: number;
  lodTier2Count: number;
  instancedScatterCount: number;
  spatialColliderCount: number;
}

/**
 * AdaptiveDRSAndLODController
 * ---------------------------
 * Monitors rolling frame time (EMA) to dynamically adjust WebGL pixel ratio
 * between 0.65x and 2.0x without visual popping, and orchestrates 3-Tier
 * distance Level of Detail (LOD) for creatures, props, and monuments.
 */
export class AdaptiveDRSAndLODController {
  public emaFrameTimeMs = 16.6;
  public currentFps = 60;
  public currentScaleFactor = 1.0;
  public lodTierCounts: [number, number, number] = [0, 0, 0];

  private drsCooldownSec = 0;
  private readonly minScale = IS_SOFTWARE_WEBGL ? 0.65 : 0.72;
  private readonly maxScale = IS_SOFTWARE_WEBGL ? 1.0 : 1.35;

  public stepFramePacingAndDRS(
    dtOrFrameTimeMs: number,
    renderer: THREE.WebGLRenderer,
    composerOrCallback?:
      | { setSize: (w: number, h: number) => void }
      | ((w: number, h: number, dpr: number) => void)
      | null,
    explicitWidth?: number,
    explicitHeight?: number
  ): void {
    // Support both seconds (dt < 1.5) and milliseconds (frameTimeMs >= 1.5)
    const rawMs =
      dtOrFrameTimeMs > 1.5
        ? Math.min(100, Math.max(4, dtOrFrameTimeMs))
        : Math.min(100, Math.max(4, dtOrFrameTimeMs * 1000));
    const dtSec = rawMs * 0.001;

    this.emaFrameTimeMs = this.emaFrameTimeMs * 0.92 + rawMs * 0.08;
    this.currentFps = Math.min(
      120,
      Math.max(15, Math.round(1000 / Math.max(1, this.emaFrameTimeMs)))
    );

    if (this.drsCooldownSec > 0) {
      this.drsCooldownSec = Math.max(0, this.drsCooldownSec - dtSec);
      return;
    }

    const baseDeviceDpr = IS_SOFTWARE_WEBGL
      ? 1.0
      : Math.min(window.devicePixelRatio || 1, 1.75);

    let nextScale = this.currentScaleFactor;
    if (this.emaFrameTimeMs > 23.5 && this.currentScaleFactor > this.minScale) {
      nextScale = Math.max(this.minScale, this.currentScaleFactor - 0.12);
    } else if (
      this.emaFrameTimeMs < 14.2 &&
      this.currentScaleFactor < this.maxScale
    ) {
      nextScale = Math.min(this.maxScale, this.currentScaleFactor + 0.08);
    }

    if (Math.abs(nextScale - this.currentScaleFactor) >= 0.07) {
      this.currentScaleFactor = nextScale;
      this.drsCooldownSec = 1.65;
      const targetDpr = Number(
        (baseDeviceDpr * this.currentScaleFactor).toFixed(2)
      );
      renderer.setPixelRatio(targetDpr);

      const w = explicitWidth || renderer.domElement.clientWidth || 1280;
      const h = explicitHeight || renderer.domElement.clientHeight || 720;

      if (typeof composerOrCallback === 'function') {
        composerOrCallback(w, h, targetDpr);
      } else if (
        composerOrCallback &&
        typeof composerOrCallback.setSize === 'function'
      ) {
        composerOrCallback.setSize(
          Math.max(1, Math.floor(w * targetDpr)),
          Math.max(1, Math.floor(h * targetDpr))
        );
      }
    }
  }

  private internalParity = 0;

  /**
   * Evaluates 3-Tier Distance LOD for all articulated entities and world props:
   * - Tier 0 (< 38m): Full multi-part geometry, contact shadow visible, full physics
   * - Tier 1 (38m - 82m): Secondary ornamental details hidden, reduced constraint iterations
   * - Tier 2 (> 82m): Silhouette core only, contact shadow hidden
   */
  public updateEntityAndPropLOD(
    cameraPos: THREE.Vector3,
    entities: ArticulatedRagdollEntity[],
    worldProps: { mesh: THREE.Object3D }[],
    frameParity?: number
  ): void {
    const parity =
      frameParity !== undefined
        ? frameParity
        : (this.internalParity = (this.internalParity + 1) & 1);
    let t0 = 0;
    let t1 = 0;
    let t2 = 0;

    for (let i = 0; i < entities.length; i++) {
      const ent = entities[i];
      const pelvisPos = ent.particles[0]?.pos;
      if (!pelvisPos) continue;
      const dx = pelvisPos.x - cameraPos.x;
      const dz = pelvisPos.z - cameraPos.z;
      const distSq = dx * dx + dz * dz;

      if (distSq < 38 * 38) {
        t0++;
        ent.selectionRing.visible = true;
        this.setSecondaryDetailVisibility(ent.torsoMesh, true);
        this.setSecondaryDetailVisibility(ent.headMesh, true);
      } else if (distSq < 82 * 82) {
        t1++;
        ent.selectionRing.visible = false;
        this.setSecondaryDetailVisibility(ent.torsoMesh, true);
        this.setSecondaryDetailVisibility(ent.headMesh, false);
      } else {
        t2++;
        ent.selectionRing.visible = false;
        this.setSecondaryDetailVisibility(ent.torsoMesh, false);
        this.setSecondaryDetailVisibility(ent.headMesh, false);
      }
    }

    // Throttle world prop secondary detail LOD checks to alternating frames
    if (parity === 0) {
      for (let i = 0; i < worldProps.length; i++) {
        const prop = worldProps[i]?.mesh;
        if (!prop) continue;
        const dx = prop.position.x - cameraPos.x;
        const dz = prop.position.z - cameraPos.z;
        const distSq = dx * dx + dz * dz;
        prop.visible = distSq < 155 * 155;
        if (prop.visible) {
          this.setSecondaryDetailVisibility(prop, distSq < 68 * 68);
        }
      }
    }

    this.lodTierCounts = [t0, t1, t2];
  }

  private setSecondaryDetailVisibility(
    root: THREE.Object3D | undefined,
    visible: boolean
  ): void {
    if (!root) return;
    const children = root.children;
    for (let i = 0; i < children.length; i++) {
      if (children[i].userData.isSecondaryLodDetail) {
        children[i].visible = visible;
      }
    }
  }
}

// ============================================================================
// 2. SHARED GEOMETRY & MATERIAL CACHE POOL + PROCEDURAL NOISE-BLENDING SHADER
// ============================================================================

export interface NoiseBlendedMaterialOptions {
  key: string;
  baseColor: string;
  veinColor: string;
  wearTintColor?: string;
  emissiveColor?: string;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
  clearcoat?: number;
  wearIntensity?: number;
  wearScale?: number;
  veinDensity?: number;
  veinEmissiveStrength?: number;
  flatShading?: boolean;
  normalMap?: THREE.Texture | null;
  normalScale?: number;
  roughnessMap?: THREE.Texture | null;
  aoMap?: THREE.Texture | null;
  aoMapIntensity?: number;
}

class SharedGeometryAndMaterialPool {
  private geometries = new Map<string, THREE.BufferGeometry>();
  private materials = new Map<
    string,
    THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial
  >();
  private contactShadowTexture: THREE.CanvasTexture | null = null;
  private contactShadowGeo: THREE.PlaneGeometry | null = null;

  /**
   * Shared O(1) time and coupled equation uniforms bound to every noise-blended material
   * in the pool so a single uniform assignment per frame animates travelling emissive vein pulses,
   * Reaction-Diffusion surface wear, and Kuramoto vein resonance across all instanced meshes.
   */
  public readonly sharedPulseUniform = { value: 0.0 };
  public readonly sharedWearMultiplierUniform = { value: 1.0 };
  public readonly sharedVeinHarmonicUniform = { value: 1.0 };

  public stepShaderPulse(elapsedSec: number): void {
    const field = autonomicEquationEngine.fieldState;
    this.sharedPulseUniform.value =
      elapsedSec * (0.88 + field.kuramotoOrderParameterR * 0.35);
    this.sharedWearMultiplierUniform.value =
      0.75 + field.surfaceWearModulation * 0.65;
    this.sharedVeinHarmonicUniform.value =
      0.7 + field.emissiveVeinHarmonicDensity * 0.25;
  }

  public getPooledMaterialCount(): number {
    return this.materials.size;
  }

  public getOrCreateGeometry(
    key: string,
    factory: () => THREE.BufferGeometry
  ): THREE.BufferGeometry {
    let geo = this.geometries.get(key);
    if (!geo) {
      geo = factory();
      if (!geo.attributes.normal) {
        geo.computeVertexNormals();
      }
      // Only compute tangents when geometry is indexed and has position, normal, and uv attributes
      // (prevents Three.js from logging `.computeTangents() failed. Missing required attributes`)
      if (
        geo.index !== null &&
        geo.attributes.position &&
        geo.attributes.normal &&
        geo.attributes.uv &&
        !geo.attributes.tangent
      ) {
        geo.computeTangents();
      }
      geo.userData.isSharedPooledGeometry = true;
      this.geometries.set(key, geo);
    }
    return geo;
  }

  /**
   * Retrieves or creates a pooled PBR material enhanced with the Procedural 3D Noise-Blending
   * Shader that dynamically synthesizes per-instance 'surface wear' (edge abrasion, cavity grime,
   * roughness modulation, and per-instance albedo shift) and animated branching 'emissive veins'
   * in world/instance space—guaranteeing visual variety across instances sharing the same geometry.
   */
  public getOrCreateNoiseBlendedArchitecturalMaterial(
    opts: NoiseBlendedMaterialOptions
  ): THREE.MeshPhysicalMaterial {
    const existing = this.materials.get(opts.key) as
      | THREE.MeshPhysicalMaterial
      | undefined;
    if (existing) {
      return existing;
    }

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(opts.baseColor),
      emissive: new THREE.Color(opts.emissiveColor ?? opts.veinColor),
      emissiveIntensity: opts.emissiveIntensity ?? 0.16,
      metalness: opts.metalness ?? 0.62,
      roughness: opts.roughness ?? 0.28,
      clearcoat: opts.clearcoat ?? 0.72,
      flatShading: Boolean(opts.flatShading),
      normalMap: opts.normalMap ?? null,
      normalScale: opts.normalScale
        ? new THREE.Vector2(opts.normalScale, opts.normalScale)
        : new THREE.Vector2(1.0, 1.0),
      roughnessMap: opts.roughnessMap ?? null,
      aoMap: opts.aoMap ?? null,
      aoMapIntensity: opts.aoMapIntensity ?? 0.8,
    });

    enhanceMaterialWithSurfaceWearAndVeins(
      mat,
      opts.veinColor,
      opts.wearIntensity ?? 0.42,
      {
        wearTintHex: opts.wearTintColor,
        wearScale: opts.wearScale ?? 0.85,
        veinDensity: opts.veinDensity ?? 1.65,
        veinEmissiveStrength: opts.veinEmissiveStrength ?? 0.78,
      }
    );

    mat.userData.isSharedPooledMaterial = true;
    this.materials.set(opts.key, mat);
    return mat;
  }

  /**
   * Creates a beveled ExtrudeGeometry armor/fin plate with computed tangents and normals.
   */
  public getBeveledArmorPlateGeometry(
    width: number,
    height: number,
    depth: number
  ): THREE.BufferGeometry {
    const safeW = Number.isFinite(width) && width > 0 ? width : 0.6;
    const safeH = Number.isFinite(height) && height > 0 ? height : 0.6;
    const safeD = Number.isFinite(depth) && depth > 0 ? depth : 0.18;
    const key = `bevel-plate-${safeW.toFixed(2)}-${safeH.toFixed(2)}-${safeD.toFixed(2)}`;
    return this.getOrCreateGeometry(key, () => {
      const w = safeW * 0.5;
      const h = safeH * 0.5;
      const chamfer = Math.min(w, h) * 0.28;
      const shape = new THREE.Shape();
      shape.moveTo(-w + chamfer, -h);
      shape.lineTo(w - chamfer, -h);
      shape.lineTo(w, -h + chamfer);
      shape.lineTo(w, h - chamfer);
      shape.lineTo(w - chamfer, h);
      shape.lineTo(-w + chamfer, h);
      shape.lineTo(-w, h - chamfer);
      shape.lineTo(-w, -h + chamfer);
      shape.closePath();

      const geo = new THREE.ExtrudeGeometry(shape, {
        steps: 1,
        depth: safeD * 0.7,
        bevelEnabled: true,
        bevelThickness: safeD * 0.22,
        bevelSize: chamfer * 0.45,
        bevelSegments: 2,
      });
      geo.center();
      return geo;
    });
  }

  /**
   * Creates a sculpted LatheGeometry biomechanical spindle / carapace segment.
   */
  public getLatheSpindleGeometry(
    radius: number,
    length: number,
    segments = 14
  ): THREE.BufferGeometry {
    const safeR = Number.isFinite(radius) && radius > 0 ? radius : 0.25;
    const safeL = Number.isFinite(length) && length > 0 ? length : 1.0;
    const key = `lathe-spindle-${safeR.toFixed(2)}-${safeL.toFixed(2)}-${segments}`;
    return this.getOrCreateGeometry(key, () => {
      const pts: THREE.Vector2[] = [
        new THREE.Vector2(0.001, -safeL * 0.5),
        new THREE.Vector2(safeR * 0.62, -safeL * 0.36),
        new THREE.Vector2(safeR * 1.0, -safeL * 0.08),
        new THREE.Vector2(safeR * 0.84, safeL * 0.18),
        new THREE.Vector2(safeR * 0.48, safeL * 0.42),
        new THREE.Vector2(0.001, safeL * 0.5),
      ];
      return new THREE.LatheGeometry(pts, segments);
    });
  }

  /**
   * Creates a soft radial grounded Contact Shadow mesh (`depthWrite: false`, `polygonOffset: true`)
   * so actors, vehicles, and props sit solidly on the terrain or roof with zero Z-fighting.
   */
  public createGroundedContactShadowMesh(
    radius: number,
    opacity = 0.68
  ): THREE.Mesh {
    if (!this.contactShadowTexture) {
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createRadialGradient(
        size * 0.5,
        size * 0.5,
        size * 0.06,
        size * 0.5,
        size * 0.5,
        size * 0.48
      );
      grad.addColorStop(0, 'rgba(2, 4, 10, 0.62)');
      grad.addColorStop(0.55, 'rgba(4, 8, 18, 0.28)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      this.contactShadowTexture = new THREE.CanvasTexture(canvas);
      this.contactShadowTexture.colorSpace = THREE.SRGBColorSpace;
    }
    if (!this.contactShadowGeo) {
      this.contactShadowGeo = new THREE.PlaneGeometry(1, 1);
      this.contactShadowGeo.rotateX(-Math.PI / 2);
      this.contactShadowGeo.userData.isSharedPooledGeometry = true;
    }

    const safeRadius = Number.isFinite(radius) && radius > 0 ? radius : 1.5;
    const mat = new THREE.MeshBasicMaterial({
      map: this.contactShadowTexture,
      transparent: true,
      depthWrite: false,
      opacity,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -2,
    });
    const mesh = new THREE.Mesh(this.contactShadowGeo, mat);
    mesh.scale.set(safeRadius * 2.2, 1, safeRadius * 2.2);
    mesh.position.y = 0.03;
    mesh.renderOrder = 1;
    mesh.userData.isContactShadow = true;
    return mesh;
  }
}

export const sharedGeometryPool = new SharedGeometryAndMaterialPool();

export interface SurfaceWearAndVeinShaderTuning {
  wearTintHex?: string;
  wearScale?: number;
  veinDensity?: number;
  veinEmissiveStrength?: number;
}

/**
 * Injects a procedural 3D domain-warped noise-blending shader into a `MeshStandardMaterial`
 * or `MeshPhysicalMaterial` via `onBeforeCompile`.
 *
 * Key visual variety features for shared-geometry & instanced meshes:
 * 1. Extracts per-instance world-space coordinates (`modelMatrix * instanceMatrix`) AND hashes
 *    the instance's world translation (`vInstanceNoisePhase`) so every building block, monument tier,
 *    or `InstancedMesh` element samples a distinct 3D noise domain.
 * 2. Synthesizes dynamic 'surface wear': edge-curvature abrasion, sky-facing patina, recessed cavity
 *    grime, per-instance subtle albedo shift, and physical micro-roughness modulation (`roughnessFactor`).
 * 3. Synthesizes branching 'emissive veins': primary arterial zero-crossing filaments and secondary
 *    capillary fissures injected directly into `totalEmissiveRadiance` with a travelling harmonic pulse.
 */
export function enhanceMaterialWithSurfaceWearAndVeins(
  mat: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial,
  veinHex: string,
  wearIntensity = 0.36,
  tuning?: SurfaceWearAndVeinShaderTuning
): void {
  const veinCol = new THREE.Color(veinHex);
  const wearTintCol = tuning?.wearTintHex
    ? new THREE.Color(tuning.wearTintHex)
    : mat.color.clone().lerp(new THREE.Color('#e2e8f0'), 0.55);
  const wearScale = tuning?.wearScale ?? 0.82;
  const veinDensity = tuning?.veinDensity ?? 1.55;
  const veinEmissiveStrength = tuning?.veinEmissiveStrength ?? 0.72;

  // Store uniform references on userData so callers (like InstancedWorldScatterRig) can retint live
  const uVeinColor = { value: veinCol };
  const uWearTintColor = { value: wearTintCol };
  const uWearIntensity = { value: wearIntensity };
  const uWearScale = { value: wearScale };
  const uVeinDensity = { value: veinDensity };
  const uVeinEmissiveStrength = { value: veinEmissiveStrength };

  mat.userData.noiseShaderUniforms = {
    uVeinColor,
    uWearTintColor,
    uWearIntensity,
    uWearScale,
    uVeinDensity,
    uVeinEmissiveStrength,
  };

  mat.customProgramCacheKey = () =>
    `proc-wear-veins-v2-${mat.type}-${Boolean(mat.normalMap)}-${Boolean(mat.roughnessMap)}-${Boolean(mat.flatShading)}`;

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uVeinColor = uVeinColor;
    shader.uniforms.uWearTintColor = uWearTintColor;
    shader.uniforms.uWearIntensity = uWearIntensity;
    shader.uniforms.uWearScale = uWearScale;
    shader.uniforms.uVeinDensity = uVeinDensity;
    shader.uniforms.uVeinEmissiveStrength = uVeinEmissiveStrength;
    shader.uniforms.uPulsePhase = sharedGeometryPool.sharedPulseUniform;
    shader.uniforms.uCoupledWearMult =
      sharedGeometryPool.sharedWearMultiplierUniform;
    shader.uniforms.uCoupledVeinMult =
      sharedGeometryPool.sharedVeinHarmonicUniform;

    shader.vertexShader =
      `varying vec3 vLocalWearPos;\nvarying vec3 vLocalWearNormal;\nvarying vec3 vWorldWearPos;\nvarying vec3 vWorldWearNormal;\nvarying vec3 vInstanceNoisePhase;\n` +
      shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vLocalWearPos = position;
        vLocalWearNormal = normal;
        mat4 procInstMat = mat4(1.0);
        #ifdef USE_INSTANCING
          procInstMat = instanceMatrix;
        #endif
        mat4 procTotalWorldMat = modelMatrix * procInstMat;
        vec4 procWorldPos4 = procTotalWorldMat * vec4(transformed, 1.0);
        vWorldWearPos = procWorldPos4.xyz;
        vWorldWearNormal = normalize(mat3(procTotalWorldMat) * normal);
        vec3 procInstOrigin = procTotalWorldMat[3].xyz;
        vInstanceNoisePhase = fract(sin(vec3(
          dot(procInstOrigin, vec3(12.9898, 78.233, 37.719)),
          dot(procInstOrigin, vec3(39.346, 11.135, 83.155)),
          dot(procInstOrigin, vec3(73.156, 52.235, 9.151))
        )) * 43758.5453) * 37.0;`
      );

    shader.fragmentShader =
      `uniform vec3 uVeinColor;
uniform vec3 uWearTintColor;
uniform float uWearIntensity;
uniform float uWearScale;
uniform float uVeinDensity;
uniform float uVeinEmissiveStrength;
uniform float uPulsePhase;
uniform float uCoupledWearMult;
uniform float uCoupledVeinMult;
varying vec3 vLocalWearPos;
varying vec3 vLocalWearNormal;
varying vec3 vWorldWearPos;
varying vec3 vWorldWearNormal;
varying vec3 vInstanceNoisePhase;

float procGyroidNoiseLayer(vec3 p) {
  return dot(sin(p), cos(p.yzx));
}

float procWearFbm3D(vec3 p) {
  float v = 0.0;
  float amp = 0.5;
  vec3 shift = vec3(13.7, 29.3, 47.1);
  for (int i = 0; i < 3; i++) {
    v += amp * (procGyroidNoiseLayer(p) * 0.3333 + 0.5);
    p = p * 2.07 + shift;
    amp *= 0.5;
  }
  return clamp(v, 0.0, 1.0);
}
` +
      shader.fragmentShader
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
          // 1. 3D Domain-Warped Noise Sampling in World + Per-Instance Space
          vec3 uProcSampleCoord = vWorldWearPos * uWearScale + vLocalWearPos * (uWearScale * 0.85) + vInstanceNoisePhase;
          vec3 uProcWarpOffset = vec3(
            procGyroidNoiseLayer(uProcSampleCoord * 0.9),
            procGyroidNoiseLayer(uProcSampleCoord * 0.9 + vec3(11.3, 5.7, 19.1)),
            procGyroidNoiseLayer(uProcSampleCoord * 0.9 + vec3(23.4, 17.8, 3.2))
          ) * 0.55;
          float uProcMacroNoise = procWearFbm3D(uProcSampleCoord + uProcWarpOffset);
          float uProcMicroGrain = procWearFbm3D(uProcSampleCoord * 3.35 - uProcWarpOffset * 1.45);

          // 2. Per-Instance Subtle Albedo Shift + Dynamic Surface Edge Wear & Cavity Weathering
          float uProcEdgeCurvature = clamp(1.0 - abs(vLocalWearNormal.y) * 0.68, 0.0, 1.0);
          float uProcSkyFacing = clamp(vWorldWearNormal.y * 0.5 + 0.5, 0.0, 1.0);
          float uProcInstHueShift = (fract(vInstanceNoisePhase.x * 0.173) - 0.5) * 0.16;
          diffuseColor.rgb = clamp(diffuseColor.rgb * (1.0 + uProcInstHueShift), 0.0, 1.0);

          float uEffectiveWearInt = clamp(uWearIntensity * uCoupledWearMult, 0.05, 0.95);
          float uProcWearMask = smoothstep(0.42, 0.85, uProcMacroNoise * 0.58 + uProcMicroGrain * 0.22 + uProcEdgeCurvature * 0.32) * uEffectiveWearInt;
          float uProcCavityGrime = smoothstep(0.54, 0.15, uProcMacroNoise * 0.68 + uProcSkyFacing * 0.32) * (uEffectiveWearInt * 0.65);

          diffuseColor.rgb *= (1.0 - uProcCavityGrime * 0.42);
          vec3 uProcWornAlbedo = mix(diffuseColor.rgb * 1.42 + vec3(0.07), uWearTintColor, 0.46);
          diffuseColor.rgb = mix(diffuseColor.rgb, uProcWornAlbedo, uProcWearMask);

          // 3. Evaluate Branching Emissive Vein Field (coupled with Reaction-Diffusion & Kuramoto harmonics)
          float uEffectiveVeinDens = uVeinDensity * uCoupledVeinMult;
          vec3 uProcVeinCoord = vWorldWearPos * uEffectiveVeinDens + vLocalWearPos * (uEffectiveVeinDens * 0.65) + vInstanceNoisePhase * 1.35;
          float uProcPrimaryVeinField = abs(procGyroidNoiseLayer(uProcVeinCoord + uProcWarpOffset * 1.15));
          float uProcCapillaryField = abs(procGyroidNoiseLayer(uProcVeinCoord * 2.35 - uProcWarpOffset * 0.85));
          float uProcPrimaryVeinMask = 1.0 - smoothstep(0.015, 0.18, uProcPrimaryVeinField);
          float uProcCapillaryMask = (1.0 - smoothstep(0.01, 0.11, uProcCapillaryField)) * smoothstep(0.36, 0.86, uProcMacroNoise);
          float uProcCombinedVeinMask = clamp(uProcPrimaryVeinMask + uProcCapillaryMask * 0.58, 0.0, 1.0);

          diffuseColor.rgb = mix(diffuseColor.rgb, uVeinColor, uProcCombinedVeinMask * 0.44);`
        )
        .replace(
          '#include <roughnessmap_fragment>',
          `#include <roughnessmap_fragment>
          // Abraded wear increases surface roughness, while vitrified emissive veins polish smooth
          roughnessFactor = clamp(roughnessFactor + uProcWearMask * 0.24 - uProcCombinedVeinMask * 0.28, 0.06, 0.98);`
        )
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
          float uProcVeinPulse = 0.72 + 0.28 * sin(uPulsePhase * 2.6 + dot(vWorldWearPos, vec3(0.42, 0.85, 0.42)) + vInstanceNoisePhase.y);
          totalEmissiveRadiance += uVeinColor * (uProcCombinedVeinMask * uVeinEmissiveStrength * uProcVeinPulse);`
        );
  };
}

// ============================================================================
// 3. INSTANCEDMESH WORLD SCATTER RIG (ZERO EXTRA DRAW CALLS FOR 192+ DETAILS)
// ============================================================================

/**
 * InstancedWorldScatterRig
 * ------------------------
 * Renders 192 composite biomechanical rock outcrops, crystalline mineral spires,
 * beveled collar rings, and stepped monument obelisks across the terrain using 4
 * hardware-instanced `THREE.InstancedMesh` batches with per-instance color tinting
 * and the procedural noise-blending 'surface wear' + 'emissive veins' shader.
 */
export class InstancedWorldScatterRig {
  public readonly rootGroup = new THREE.Group();
  private boulderInstanced: THREE.InstancedMesh;
  private crystalSpireInstanced: THREE.InstancedMesh;
  private trimRingInstanced: THREE.InstancedMesh;
  private monumentObeliskInstanced: THREE.InstancedMesh;
  private boulderMat: THREE.MeshStandardMaterial;
  private spireMat: THREE.MeshPhysicalMaterial;
  private ringMat: THREE.MeshStandardMaterial;
  private obeliskMat: THREE.MeshPhysicalMaterial;
  public readonly instanceCount = 48;

  private dummy = new THREE.Object3D();
  private scratchColor = new THREE.Color();

  constructor() {
    this.rootGroup.name = 'InstancedWorldScatterRig';

    const boulderGeo = sharedGeometryPool.getOrCreateGeometry(
      'instanced-boulder-dodeca',
      () => {
        const g = new THREE.DodecahedronGeometry(0.85, 1);
        g.scale(1.25, 0.72, 1.1);
        return g;
      }
    );
    this.boulderMat = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.74,
      metalness: 0.22,
    });
    enhanceMaterialWithSurfaceWearAndVeins(this.boulderMat, '#38bdf8', 0.48, {
      wearScale: 0.95,
      veinDensity: 1.45,
      veinEmissiveStrength: 0.65,
    });

    const spireGeo = sharedGeometryPool.getLatheSpindleGeometry(0.32, 2.2, 8);
    this.spireMat = new THREE.MeshPhysicalMaterial({
      color: '#f8fafc',
      roughness: 0.22,
      metalness: 0.65,
      clearcoat: 0.85,
    });
    enhanceMaterialWithSurfaceWearAndVeins(this.spireMat, '#38bdf8', 0.38, {
      wearScale: 1.15,
      veinDensity: 2.1,
      veinEmissiveStrength: 0.92,
    });

    const ringGeo = sharedGeometryPool.getBeveledArmorPlateGeometry(
      0.75,
      0.24,
      0.75
    );
    this.ringMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#0284c7',
      emissiveIntensity: 0.35,
      roughness: 0.32,
      metalness: 0.82,
    });
    enhanceMaterialWithSurfaceWearAndVeins(this.ringMat, '#f59e0b', 0.45, {
      wearScale: 1.35,
      veinDensity: 2.4,
      veinEmissiveStrength: 0.85,
    });

    const obeliskGeo = sharedGeometryPool.getBeveledArmorPlateGeometry(
      0.42,
      1.65,
      0.42
    );
    this.obeliskMat = new THREE.MeshPhysicalMaterial({
      color: '#1e293b',
      roughness: 0.28,
      metalness: 0.78,
      clearcoat: 0.75,
    });
    enhanceMaterialWithSurfaceWearAndVeins(this.obeliskMat, '#38bdf8', 0.52, {
      wearScale: 0.88,
      veinDensity: 1.85,
      veinEmissiveStrength: 0.95,
    });

    this.boulderInstanced = new THREE.InstancedMesh(
      boulderGeo,
      this.boulderMat,
      this.instanceCount
    );
    this.boulderInstanced.castShadow = true;
    this.boulderInstanced.receiveShadow = true;

    this.crystalSpireInstanced = new THREE.InstancedMesh(
      spireGeo,
      this.spireMat,
      this.instanceCount
    );
    this.crystalSpireInstanced.castShadow = true;
    this.crystalSpireInstanced.receiveShadow = true;

    this.trimRingInstanced = new THREE.InstancedMesh(
      ringGeo,
      this.ringMat,
      this.instanceCount
    );

    this.monumentObeliskInstanced = new THREE.InstancedMesh(
      obeliskGeo,
      this.obeliskMat,
      this.instanceCount
    );
    this.monumentObeliskInstanced.castShadow = true;
    this.monumentObeliskInstanced.receiveShadow = true;

    this.rootGroup.add(
      this.boulderInstanced,
      this.crystalSpireInstanced,
      this.trimRingInstanced,
      this.monumentObeliskInstanced
    );
  }

  public rebuildForSeed(
    seed: number,
    midHex: string,
    accentHex: string,
    evalHeight: (x: number, z: number) => number
  ): void {
    this.populateForWorld({
      seed,
      lowHex: midHex,
      midHex,
      accentHex,
      evalHeight,
    });
  }

  public populateForWorld(params: {
    seed: number;
    lowHex: string;
    midHex: string;
    accentHex: string;
    evalHeight: (x: number, z: number) => number;
  }): void {
    const { seed, lowHex, midHex, accentHex, evalHeight } = params;
    const baseLow = new THREE.Color(lowHex);
    const baseMid = new THREE.Color(midHex);
    const baseAccent = new THREE.Color(accentHex);

    // Dynamically sync the procedural noise-blending shader vein & wear colors to the active timeline/world palette
    for (const mat of [
      this.boulderMat,
      this.spireMat,
      this.ringMat,
      this.obeliskMat,
    ]) {
      const uniforms = mat.userData.noiseShaderUniforms;
      if (uniforms) {
        uniforms.uVeinColor.value.copy(baseAccent);
        uniforms.uWearTintColor.value.copy(baseMid).lerp(baseAccent, 0.35);
      }
    }

    let s = (seed ^ 0x6d2b79f5) >>> 0;
    const nextRng = () => {
      s = (Math.imul(s ^ (s >>> 15), 1 | s) + 0x9e3779b9) >>> 0;
      return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
    };

    for (let i = 0; i < this.instanceCount; i++) {
      const angle =
        (i / this.instanceCount) * Math.PI * 2 + (nextRng() - 0.5) * 0.25;
      const dist = 16 + nextRng() * 88;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const y = evalHeight(x, z);
      const scale = 0.75 + nextRng() * 0.65;

      // 1. Primary Silhouette: Grounded Strata Outcrop Boulder
      this.dummy.position.set(x, y + 0.22 * scale, z);
      this.dummy.rotation.set(
        (nextRng() - 0.5) * 0.25,
        nextRng() * Math.PI * 2,
        (nextRng() - 0.5) * 0.25
      );
      this.dummy.scale.setScalar(scale);
      this.dummy.updateMatrix();
      this.boulderInstanced.setMatrixAt(i, this.dummy.matrix);

      this.scratchColor
        .copy(baseLow)
        .lerp(baseMid, 0.25 + nextRng() * 0.65);
      this.boulderInstanced.setColorAt(i, this.scratchColor);

      // 2. Secondary Read: Lathe Crystal Spire rising from the outcrop
      this.dummy.position.set(x, y + 0.95 * scale, z);
      this.dummy.rotation.set(
        (nextRng() - 0.5) * 0.18,
        nextRng() * Math.PI * 2,
        (nextRng() - 0.5) * 0.18
      );
      this.dummy.scale.setScalar(scale * 0.88);
      this.dummy.updateMatrix();
      this.crystalSpireInstanced.setMatrixAt(i, this.dummy.matrix);

      this.scratchColor
        .copy(baseMid)
        .lerp(baseAccent, 0.35 + nextRng() * 0.55);
      this.crystalSpireInstanced.setColorAt(i, this.scratchColor);

      // 3. Accent Detail: Beveled Collar Ring around the spire base
      this.dummy.position.set(x, y + 0.52 * scale, z);
      this.dummy.rotation.set(Math.PI * 0.5, 0, nextRng() * Math.PI);
      this.dummy.scale.setScalar(scale * 0.92);
      this.dummy.updateMatrix();
      this.trimRingInstanced.setMatrixAt(i, this.dummy.matrix);
      this.trimRingInstanced.setColorAt(i, baseAccent);

      // 4. Instanced Architectural Monument Obelisk Buttress flanking the outcrop
      const obAngle = angle + 0.45;
      const obX = x + Math.cos(obAngle) * (1.05 * scale);
      const obZ = z + Math.sin(obAngle) * (1.05 * scale);
      const obY = evalHeight(obX, obZ);
      this.dummy.position.set(obX, obY + 0.68 * scale, obZ);
      this.dummy.rotation.set(
        (nextRng() - 0.5) * 0.12,
        obAngle,
        (nextRng() - 0.5) * 0.12
      );
      this.dummy.scale.set(scale * 0.82, scale * (0.9 + nextRng() * 0.45), scale * 0.82);
      this.dummy.updateMatrix();
      this.monumentObeliskInstanced.setMatrixAt(i, this.dummy.matrix);
      this.scratchColor.copy(baseLow).lerp(baseAccent, 0.22 + nextRng() * 0.38);
      this.monumentObeliskInstanced.setColorAt(i, this.scratchColor);
    }

    for (const inst of [
      this.boulderInstanced,
      this.crystalSpireInstanced,
      this.trimRingInstanced,
      this.monumentObeliskInstanced,
    ]) {
      inst.instanceMatrix.needsUpdate = true;
      if (inst.instanceColor) {
        inst.instanceColor.needsUpdate = true;
      }
      inst.computeBoundingSphere();
    }
  }
}

// ============================================================================
// 4. 3D SPATIAL HASH GRID, WALKABLE ROOFS/MONUMENTS, SLOPE SLIDE & LIMB HITBOXES
// ============================================================================

export interface StepTierPlatform {
  halfWidth: number;
  halfDepth: number;
  minY: number;
  topY: number;
}

export interface SpatialColliderVolume {
  id: string;
  kind: 'obb-building' | 'stepped-monument' | 'cylinder-prop';
  x: number;
  z: number;
  minY: number;
  maxY: number;
  walkableTopY: number;
  radius: number;
  halfWidth: number;
  halfDepth: number;
  cosYaw: number;
  sinYaw: number;
  stepTiers?: StepTierPlatform[];
}

export interface AnatomicalLimbHitResult {
  entity: ArticulatedRagdollEntity;
  hitPoint: THREE.Vector3;
  distance: number;
  limbKind: 'head' | 'torso' | 'pelvis' | 'upper-limb' | 'lower-limb';
  limbName: string;
  partCategory:
    | 'head-weakpoint'
    | 'torso-core'
    | 'pelvis-core'
    | 'articulated-limb';
  partLabel: string;
  damageMultiplier: number;
  limbIndex: number; // -1 if head/torso/pelvis, >= 0 if specific limb chain
}

/**
 * SpatialCollisionGridAndSolver
 * -----------------------------
 * 1. Indexes all 3D world colliders (OBB buildings, 4-tier stepped Escher ziggurats,
 *    cylindrical megastructure pillars, and landmark props) into an `8m × 8m` Spatial Hash Grid.
 * 2. Evaluates walkable rooftop and stepped monument elevations so players and creatures
 *    can climb, grapple onto, and walk across roofs and ziggurat steps.
 * 3. Resolves 3D Capsule-vs-OBB & Cylinder collisions with automatic `0.68m` step-up
 *    and smooth terrain-slope tangential sliding (preventing vertical cliff walking or clipping).
 * 4. Performs sub-stepped 3D ray-vs-capsule anatomical limb hit detection for weapons and grapple hooks.
 */
export class SpatialCollisionGridAndSolver {
  private readonly cellSize = 8.0;
  private grid = new Map<string, SpatialColliderVolume[]>();
  private allColliders: SpatialColliderVolume[] = [];

  // Zero-GC scratch vectors for ray/capsule math
  private scratchSegA = new THREE.Vector3();
  private scratchSegB = new THREE.Vector3();
  private scratchRayPt = new THREE.Vector3();
  private scratchClosest = new THREE.Vector3();
  private scratchRayDir = new THREE.Vector3();

  public clear(): void {
    this.grid.clear();
    this.allColliders = [];
  }

  public getColliderCount(): number {
    return this.allColliders.length;
  }

  public registerCylinderProp(
    idOrParams:
      | string
      | {
          id: string;
          x: number;
          z: number;
          baseY: number;
          height: number;
          radius: number;
          walkableTop?: boolean;
        },
    x?: number,
    baseY?: number,
    z?: number,
    radius?: number,
    height = 3.2,
    walkableTop = true
  ): void {
    const p =
      typeof idOrParams === 'string'
        ? {
            id: idOrParams,
            x: x ?? 0,
            baseY: baseY ?? 0,
            z: z ?? 0,
            radius: Number.isFinite(radius) && (radius as number) > 0 ? (radius as number) : 1.5,
            height: Number.isFinite(height) && height > 0 ? height : 3.2,
            walkableTop,
          }
        : idOrParams;

    const vol: SpatialColliderVolume = {
      id: p.id,
      kind: 'cylinder-prop',
      x: p.x,
      z: p.z,
      minY: p.baseY - 0.5,
      maxY: p.baseY + p.height,
      walkableTopY: p.walkableTop ? p.baseY + p.height : -9999,
      radius: p.radius,
      halfWidth: p.radius,
      halfDepth: p.radius,
      cosYaw: 1,
      sinYaw: 0,
    };
    this.insertVolume(vol);
  }

  public registerSteppedMonument(
    xOrParams:
      | number
      | {
          id: string;
          x: number;
          z: number;
          baseY: number;
          yaw: number;
        },
    baseY?: number,
    z?: number,
    yaw = 0
  ): void {
    const p =
      typeof xOrParams === 'number'
        ? {
            id: `monument-${this.allColliders.length}`,
            x: xOrParams,
            baseY: baseY ?? 0,
            z: z ?? 0,
            yaw,
          }
        : xOrParams;

    const tiers: StepTierPlatform[] = [];
    for (let t = 0; t < 4; t++) {
      const halfSize = (2.6 - t * 0.52) * 0.5 + 0.12;
      tiers.push({
        halfWidth: halfSize,
        halfDepth: halfSize,
        minY: p.baseY + t * 0.48,
        topY: p.baseY + (t + 1) * 0.48,
      });
    }
    const vol: SpatialColliderVolume = {
      id: p.id,
      kind: 'stepped-monument',
      x: p.x,
      z: p.z,
      minY: p.baseY - 0.4,
      maxY: p.baseY + 4 * 0.48,
      walkableTopY: p.baseY + 4 * 0.48,
      radius: 1.85,
      halfWidth: 1.45,
      halfDepth: 1.45,
      cosYaw: Math.cos(-p.yaw),
      sinYaw: Math.sin(-p.yaw),
      stepTiers: tiers,
    };
    this.insertVolume(vol);
  }

  public registerPlacedBuilding(
    idOrBld: string | PlacedWorldBuilding,
    xOrEval?: number | ((x: number, z: number) => number),
    baseYArg?: number,
    zArg?: number,
    rotationYArg?: number,
    blocksArg?: { gx: number; gy: number; gz: number }[]
  ): void {
    let id: string;
    let x: number;
    let z: number;
    let baseY: number;
    let rotationY: number;
    let blocks: { gx: number; gy: number; gz: number }[] = [];

    if (typeof idOrBld === 'string') {
      id = idOrBld;
      x = typeof xOrEval === 'number' ? xOrEval : 0;
      baseY = baseYArg ?? 0;
      z = zArg ?? 0;
      rotationY = rotationYArg ?? 0;
      blocks = blocksArg ?? [];
    } else {
      id = idOrBld.id;
      x = idOrBld.x;
      z = idOrBld.z;
      const evalFn = typeof xOrEval === 'function' ? xOrEval : () => 0;
      baseY = idOrBld.y === 0 ? evalFn(idOrBld.x, idOrBld.z) - 0.25 : idOrBld.y;
      rotationY = idOrBld.rotationY;
      blocks = idOrBld.blocks ?? [];
    }

    const unit = 1.6;
    let maxBlockTop = 3.2;
    let maxHorizExtent = 1.95;
    if (blocks && blocks.length > 0) {
      for (let i = 0; i < blocks.length; i++) {
        const blk = blocks[i];
        const top = (blk.gy + 1) * unit;
        if (top > maxBlockTop) maxBlockTop = top;
        const extX = Math.abs(blk.gx) * unit + unit * 0.55;
        const extZ = Math.abs(blk.gz) * unit + unit * 0.55;
        maxHorizExtent = Math.max(maxHorizExtent, extX, extZ);
      }
    }

    const tiers: StepTierPlatform[] = [
      {
        halfWidth: maxHorizExtent,
        halfDepth: maxHorizExtent,
        minY: baseY,
        topY: baseY + maxBlockTop,
      },
    ];

    const vol: SpatialColliderVolume = {
      id,
      kind: 'obb-building',
      x,
      z,
      minY: baseY - 0.5,
      maxY: baseY + maxBlockTop,
      walkableTopY: baseY + maxBlockTop,
      radius: maxHorizExtent * 1.35,
      halfWidth: maxHorizExtent,
      halfDepth: maxHorizExtent,
      cosYaw: Math.cos(-rotationY),
      sinYaw: Math.sin(-rotationY),
      stepTiers: tiers,
    };
    this.insertVolume(vol);
  }

  private insertVolume(vol: SpatialColliderVolume): void {
    this.allColliders.push(vol);
    const minCellX = Math.floor((vol.x - vol.radius - 1.0) / this.cellSize);
    const maxCellX = Math.floor((vol.x + vol.radius + 1.0) / this.cellSize);
    const minCellZ = Math.floor((vol.z - vol.radius - 1.0) / this.cellSize);
    const maxCellZ = Math.floor((vol.z + vol.radius + 1.0) / this.cellSize);

    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cz = minCellZ; cz <= maxCellZ; cz++) {
        const key = `${cx},${cz}`;
        let bucket = this.grid.get(key);
        if (!bucket) {
          bucket = [];
          this.grid.set(key, bucket);
        }
        bucket.push(vol);
      }
    }
  }

  private queryNearbyVolumes(x: number, z: number): SpatialColliderVolume[] {
    const cx = Math.floor(x / this.cellSize);
    const cz = Math.floor(z / this.cellSize);
    return this.grid.get(`${cx},${cz}`) ?? [];
  }

  /**
   * Evaluates the highest walkable surface elevation (terrain + building roofs + stepped ziggurat tiers)
   * at `(x, z)` for an actor whose feet are currently at `currentFeetY`.
   */
  public evaluateWalkableSupportElevation(
    x: number,
    z: number,
    currentFeetY: number,
    baseTerrainY: number
  ): number {
    let supportY = baseTerrainY;
    const stepUpTolerance = 0.68;
    const nearby = this.queryNearbyVolumes(x, z);

    for (let i = 0; i < nearby.length; i++) {
      const col = nearby[i];
      const dx = x - col.x;
      const dz = z - col.z;

      if (col.stepTiers && col.stepTiers.length > 0) {
        const localX = dx * col.cosYaw - dz * col.sinYaw;
        const localZ = dx * col.sinYaw + dz * col.cosYaw;

        for (let t = 0; t < col.stepTiers.length; t++) {
          const tier = col.stepTiers[t];
          if (
            Math.abs(localX) <= tier.halfWidth + 0.28 &&
            Math.abs(localZ) <= tier.halfDepth + 0.28
          ) {
            if (currentFeetY + stepUpTolerance >= tier.topY) {
              if (tier.topY > supportY) {
                supportY = tier.topY;
              }
            }
          }
        }
      } else if (col.walkableTopY > -900) {
        const dist = Math.hypot(dx, dz);
        if (
          dist <= col.radius + 0.25 &&
          currentFeetY + stepUpTolerance >= col.walkableTopY
        ) {
          if (col.walkableTopY > supportY) {
            supportY = col.walkableTopY;
          }
        }
      }
    }

    return supportY;
  }

  /**
   * Resolves 3D Capsule-vs-OBB/Cylinder collisions, automatic step-up onto ledges (`<= 0.68m`),
   * walkable rooftop standing, and smooth terrain-slope tangential sliding.
   */
  public resolveCapsuleCollisionAndSlopeSlide(
    posOrParams:
      | THREE.Vector3
      | {
          pos: THREE.Vector3;
          vel: THREE.Vector3;
          capsuleRadius: number;
          capsuleHeight: number;
          grounded: boolean;
          evalTerrainHeight: (x: number, z: number) => number;
          dt: number;
          isInSpecialRoom?: boolean;
        },
    velArg?: THREE.Vector3,
    capsuleRadiusArg?: number,
    capsuleHeightArg?: number,
    groundedArg?: boolean,
    evalTerrainHeightArg?: (x: number, z: number) => number,
    dtArg?: number,
    isInSpecialRoomArg = false
  ): {
    supportGroundY: number;
    collisionRollImpulse: number;
    steppedUp: boolean;
    steppedUpDeltaY: number;
  } {
    const isVector = posOrParams instanceof THREE.Vector3;
    const pos = isVector ? posOrParams : posOrParams.pos;
    const vel = isVector ? velArg! : posOrParams.vel;
    const capsuleRadius = isVector
      ? (capsuleRadiusArg ?? 0.45)
      : posOrParams.capsuleRadius;
    const capsuleHeight = isVector
      ? (capsuleHeightArg ?? 1.75)
      : posOrParams.capsuleHeight;
    const evalTerrainHeight = isVector
      ? evalTerrainHeightArg!
      : posOrParams.evalTerrainHeight;
    const dt = isVector ? (dtArg ?? 0.016) : posOrParams.dt;
    const isInSpecialRoom = isVector
      ? isInSpecialRoomArg
      : Boolean(posOrParams.isInSpecialRoom);

    if (isInSpecialRoom) {
      const roomGroundY = evalTerrainHeight(pos.x, pos.z);
      return {
        supportGroundY: roomGroundY,
        collisionRollImpulse: 0,
        steppedUp: false,
        steppedUpDeltaY: 0,
      };
    }

    let collisionRollImpulse = 0;
    let steppedUp = false;
    let steppedUpDeltaY = 0;
    const autonomicTuning = autonomicEquationEngine.getTuning();
    const stepUpMax = autonomicTuning.stepUpHeightAllowanceM ?? 0.68;
    const slopeFrictionMult =
      autonomicTuning.slopeSlideFrictionMultiplier ?? 1.0;

    // 1. Query O(1) Spatial Hash Cell for 3D OBB / Stepped Monument / Cylinder Colliders
    const nearby = this.queryNearbyVolumes(pos.x, pos.z);
    for (let i = 0; i < nearby.length; i++) {
      const col = nearby[i];

      // Vertical interval overlap check: if actor's feet are above the roof, they stand ON it!
      if (pos.y >= col.maxY - 0.12 || pos.y + capsuleHeight < col.minY) {
        continue;
      }

      if (col.kind === 'obb-building' || col.kind === 'stepped-monument') {
        const dx = pos.x - col.x;
        const dz = pos.z - col.z;
        const localX = dx * col.cosYaw - dz * col.sinYaw;
        const localZ = dx * col.sinYaw + dz * col.cosYaw;

        // Check if stepping up onto a monument tier or low roof ledge
        if (col.stepTiers) {
          let climbedTier = false;
          for (let t = 0; t < col.stepTiers.length; t++) {
            const tier = col.stepTiers[t];
            if (
              Math.abs(localX) <= tier.halfWidth + capsuleRadius * 0.85 &&
              Math.abs(localZ) <= tier.halfDepth + capsuleRadius * 0.85
            ) {
              const heightDiff = tier.topY - pos.y;
              if (heightDiff > 0.02 && heightDiff <= stepUpMax) {
                steppedUpDeltaY = Math.max(steppedUpDeltaY, heightDiff);
                pos.y = tier.topY;
                if (vel.y < 0) vel.y = 0;
                steppedUp = true;
                climbedTier = true;
              }
            }
          }
          if (climbedTier && pos.y >= col.maxY - 0.05) {
            continue;
          }
        }

        // Closest point on OBB in local space
        const clampedX = Math.max(
          -col.halfWidth,
          Math.min(col.halfWidth, localX)
        );
        const clampedZ = Math.max(
          -col.halfDepth,
          Math.min(col.halfDepth, localZ)
        );
        const diffX = localX - clampedX;
        const diffZ = localZ - clampedZ;
        const distSq = diffX * diffX + diffZ * diffZ;

        if (distSq < capsuleRadius * capsuleRadius) {
          const dist = Math.sqrt(distSq);
          let pushLocalX = 0;
          let pushLocalZ = 0;

          if (dist > 0.0001) {
            const overlap = capsuleRadius - dist;
            pushLocalX = (diffX / dist) * overlap;
            pushLocalZ = (diffZ / dist) * overlap;
          } else {
            // Inside OBB core: push out along shallowest axis
            const penX = col.halfWidth + capsuleRadius - Math.abs(localX);
            const penZ = col.halfDepth + capsuleRadius - Math.abs(localZ);
            if (penX < penZ) {
              pushLocalX = (localX >= 0 ? 1 : -1) * penX;
            } else {
              pushLocalZ = (localZ >= 0 ? 1 : -1) * penZ;
            }
          }

          // Rotate push vector back to world space
          const worldPushX =
            pushLocalX * col.cosYaw + pushLocalZ * col.sinYaw;
          const worldPushZ =
            -pushLocalX * col.sinYaw + pushLocalZ * col.cosYaw;

          pos.x += worldPushX;
          pos.z += worldPushZ;

          // Smooth tangential wall slide (strip only inward normal velocity component)
          const normLen = Math.hypot(worldPushX, worldPushZ) || 1;
          const nx = worldPushX / normLen;
          const nz = worldPushZ / normLen;
          const vn = vel.x * nx + vel.z * nz;
          if (vn < 0) {
            vel.x -= nx * vn * 1.05;
            vel.z -= nz * vn * 1.05;
          }
          collisionRollImpulse = (nx > 0 ? 1 : -1) * 0.045;
        }
      } else {
        // Cylindrical collider resolution
        const dx = pos.x - col.x;
        const dz = pos.z - col.z;
        const dist = Math.hypot(dx, dz);
        const minDist = capsuleRadius + col.radius;
        if (dist < minDist && dist > 0.0001) {
          const heightDiff = col.maxY - pos.y;
          if (
            heightDiff > 0 &&
            heightDiff <= stepUpMax &&
            col.walkableTopY > -900
          ) {
            steppedUpDeltaY = Math.max(steppedUpDeltaY, heightDiff);
            pos.y = col.walkableTopY;
            if (vel.y < 0) vel.y = 0;
            steppedUp = true;
            continue;
          }
          const overlap = minDist - dist;
          const nx = dx / dist;
          const nz = dz / dist;
          pos.x += nx * overlap;
          pos.z += nz * overlap;

          const vn = vel.x * nx + vel.z * nz;
          if (vn < 0) {
            vel.x -= nx * vn * 1.05;
            vel.z -= nz * vn * 1.05;
          }
          collisionRollImpulse = (nx > 0 ? 1 : -1) * 0.045;
        }
      }
    }

    // 2. Terrain-Slope Gradient Evaluation & Smooth Cliff-Slide Physics
    const baseTerrainY = evalTerrainHeight(pos.x, pos.z);
    const supportGroundY = this.evaluateWalkableSupportElevation(
      pos.x,
      pos.z,
      pos.y,
      baseTerrainY
    );

    // If standing on natural terrain (not a flat building roof), check slope steepness
    if (
      Math.abs(supportGroundY - baseTerrainY) < 0.08 &&
      pos.y <= baseTerrainY + 0.35
    ) {
      const eps = 0.65;
      const hxPlus = evalTerrainHeight(pos.x + eps, pos.z);
      const hxMinus = evalTerrainHeight(pos.x - eps, pos.z);
      const hzPlus = evalTerrainHeight(pos.x, pos.z + eps);
      const hzMinus = evalTerrainHeight(pos.x, pos.z - eps);

      const gradX = (hxPlus - hxMinus) / (2 * eps);
      const gradZ = (hzPlus - hzMinus) / (2 * eps);
      const slopeMag = Math.hypot(gradX, gradZ);

      // Steep cliff threshold (~50 degrees: slopeMag > 1.22): smoothly slide downhill along contour
      if (slopeMag > 1.22) {
        const downX = -gradX / slopeMag;
        const downZ = -gradZ / slopeMag;
        const excessSlope = Math.min(2.5, slopeMag - 1.22);

        // Deflect uphill velocity into tangential contour slide (modulated by autonomic slope friction)
        const intoCliff = -(vel.x * downX + vel.z * downZ);
        if (intoCliff > 0) {
          vel.x += downX * intoCliff * 0.85;
          vel.z += downZ * intoCliff * 0.85;
        }
        const slideAccel = (14.0 / Math.max(0.5, slopeFrictionMult)) * dt;
        vel.x += downX * excessSlope * slideAccel;
        vel.z += downZ * excessSlope * slideAccel;
      }
    }

    return {
      supportGroundY,
      collisionRollImpulse,
      steppedUp,
      steppedUpDeltaY,
    };
  }

  /**
   * Sub-stepped 3D Ray-vs-Capsule Anatomical Limb Hitbox Tester:
   * Accepts either `(segStart, segEnd, projectileRadius, entities)` or an object parameter.
   */
  public raycastSubSteppedAnatomicalLimbs(
    segStartOrParams:
      | THREE.Vector3
      | {
          rayOrigin: THREE.Vector3;
          rayDir: THREE.Vector3;
          maxDistance: number;
          projectileRadius?: number;
          entities: ArticulatedRagdollEntity[];
        },
    segEndArg?: THREE.Vector3,
    projectileRadiusArg?: number,
    entitiesArg?: ArticulatedRagdollEntity[]
  ): AnatomicalLimbHitResult | null {
    let rayOrigin: THREE.Vector3;
    let rayDir: THREE.Vector3;
    let maxDistance: number;
    let projectileRadius: number;
    let entities: ArticulatedRagdollEntity[];

    if (segStartOrParams instanceof THREE.Vector3) {
      rayOrigin = segStartOrParams;
      this.scratchRayDir.subVectors(segEndArg!, segStartOrParams);
      maxDistance = this.scratchRayDir.length();
      if (maxDistance < 0.0001) {
        this.scratchRayDir.set(0, 0, -1);
        maxDistance = 0.5;
      } else {
        this.scratchRayDir.divideScalar(maxDistance);
      }
      rayDir = this.scratchRayDir;
      projectileRadius = projectileRadiusArg ?? 0.22;
      entities = entitiesArg ?? [];
    } else {
      rayOrigin = segStartOrParams.rayOrigin;
      rayDir = segStartOrParams.rayDir;
      maxDistance = segStartOrParams.maxDistance;
      projectileRadius = segStartOrParams.projectileRadius ?? 0.22;
      entities = segStartOrParams.entities;
    }

    let bestHit: AnatomicalLimbHitResult | null = null;
    let bestDist = maxDistance;

    for (let eIdx = 0; eIdx < entities.length; eIdx++) {
      const ent = entities[eIdx];
      const pelvis = ent.particles[0]?.pos;
      const torso = ent.particles[1]?.pos;
      const head = ent.particles[2]?.pos;
      if (!pelvis || !torso || !head) continue;

      // Fast bounding-sphere broadphase check around the entity
      const toTorsoX = torso.x - rayOrigin.x;
      const toTorsoY = torso.y - rayOrigin.y;
      const toTorsoZ = torso.z - rayOrigin.z;
      const proj =
        toTorsoX * rayDir.x + toTorsoY * rayDir.y + toTorsoZ * rayDir.z;
      if (proj < -2.5 || proj > bestDist + 4.5) continue;

      const perpSq =
        toTorsoX * toTorsoX +
        toTorsoY * toTorsoY +
        toTorsoZ * toTorsoZ -
        proj * proj;
      const broadRadius = Math.max(3.8, ent.blueprint.limbLength * 2.6);
      if (perpSq > broadRadius * broadRadius) continue;

      // 1. Test Head Weak-Point Sphere/Capsule
      const headRadius =
        (ent.particles[2].radius || 0.34) * 1.45 + projectileRadius;
      const headHitDist = this.intersectRayCapsule(
        rayOrigin,
        rayDir,
        torso,
        head,
        headRadius,
        bestDist
      );
      if (headHitDist !== null && headHitDist < bestDist) {
        bestDist = headHitDist;
        bestHit = {
          entity: ent,
          hitPoint: rayOrigin.clone().addScaledVector(rayDir, headHitDist),
          distance: headHitDist,
          limbKind: 'head',
          limbName: 'Cranial Weak-Point',
          partCategory: 'head-weakpoint',
          partLabel: 'Cranial Weak-Point',
          damageMultiplier: 1.85,
          limbIndex: -1,
        };
      }

      // 2. Test Torso Core Capsule (Pelvis -> Torso)
      const torsoRadius =
        Math.max(0.38, ent.blueprint.torsoScale[0] * 0.55) + projectileRadius;
      const torsoHitDist = this.intersectRayCapsule(
        rayOrigin,
        rayDir,
        pelvis,
        torso,
        torsoRadius,
        bestDist
      );
      if (torsoHitDist !== null && torsoHitDist < bestDist) {
        bestDist = torsoHitDist;
        bestHit = {
          entity: ent,
          hitPoint: rayOrigin.clone().addScaledVector(rayDir, torsoHitDist),
          distance: torsoHitDist,
          limbKind: 'torso',
          limbName: 'Thoracic Core',
          partCategory: 'torso-core',
          partLabel: 'Thoracic Core',
          damageMultiplier: 1.15,
          limbIndex: -1,
        };
      }

      // 3. Test Articulated Upper & Lower Limb Capsules (Pelvis -> Knee -> Foot)
      for (let lIdx = 0; lIdx < ent.limbs.length; lIdx++) {
        const limb = ent.limbs[lIdx];
        const kneePos = ent.particles[limb.kneeIdx]?.pos;
        const footPos = ent.particles[limb.footIdx]?.pos;
        if (!kneePos || !footPos) continue;

        const limbRadius = 0.24 + projectileRadius;
        const upperDist = this.intersectRayCapsule(
          rayOrigin,
          rayDir,
          pelvis,
          kneePos,
          limbRadius,
          bestDist
        );
        if (upperDist !== null && upperDist < bestDist) {
          bestDist = upperDist;
          bestHit = {
            entity: ent,
            hitPoint: rayOrigin.clone().addScaledVector(rayDir, upperDist),
            distance: upperDist,
            limbKind: 'upper-limb',
            limbName: `Upper Limb #${lIdx + 1}`,
            partCategory: 'articulated-limb',
            partLabel: `Upper Limb #${lIdx + 1}`,
            damageMultiplier: 1.35,
            limbIndex: lIdx,
          };
        }

        const lowerDist = this.intersectRayCapsule(
          rayOrigin,
          rayDir,
          kneePos,
          footPos,
          limbRadius,
          bestDist
        );
        if (lowerDist !== null && lowerDist < bestDist) {
          bestDist = lowerDist;
          bestHit = {
            entity: ent,
            hitPoint: rayOrigin.clone().addScaledVector(rayDir, lowerDist),
            distance: lowerDist,
            limbKind: 'lower-limb',
            limbName: `Distal Tendon #${lIdx + 1}`,
            partCategory: 'articulated-limb',
            partLabel: `Distal Tendon #${lIdx + 1}`,
            damageMultiplier: 1.4,
            limbIndex: lIdx,
          };
        }
      }
    }

    return bestHit;
  }

  /**
   * Exact closest-approach distance between a ray `(rayOrigin, rayDir)` and a 3D capsule segment `(segA, segB, radius)`.
   */
  private intersectRayCapsule(
    rayOrigin: THREE.Vector3,
    rayDir: THREE.Vector3,
    segA: THREE.Vector3,
    segB: THREE.Vector3,
    radius: number,
    maxDist: number
  ): number | null {
    this.scratchSegA.copy(segA);
    this.scratchSegB.copy(segB);

    // Sample 4 sub-steps along the bone segment for fast, zero-GC exact capsule coverage
    const radiusSq = radius * radius;
    let bestRayT: number | null = null;

    for (let s = 0; s <= 3; s++) {
      const alpha = s / 3;
      this.scratchClosest.lerpVectors(this.scratchSegA, this.scratchSegB, alpha);
      const vx = this.scratchClosest.x - rayOrigin.x;
      const vy = this.scratchClosest.y - rayOrigin.y;
      const vz = this.scratchClosest.z - rayOrigin.z;

      const t = vx * rayDir.x + vy * rayDir.y + vz * rayDir.z;
      if (t < 0.05 || t > maxDist) continue;

      this.scratchRayPt.copy(rayOrigin).addScaledVector(rayDir, t);
      const distSq = this.scratchRayPt.distanceToSquared(this.scratchClosest);
      if (distSq <= radiusSq) {
        if (bestRayT === null || t < bestRayT) {
          bestRayT = t;
        }
      }
    }

    return bestRayT;
  }
}

export const spatialCollisionSolver = new SpatialCollisionGridAndSolver();
