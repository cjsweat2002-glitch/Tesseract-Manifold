import * as THREE from 'three';
import { ManifoldWorldSpec, TerrainExcavationSpot } from '../types/manifold';
import {
  BASE_DIMENSIONAL_ELEMENTS,
  VOID_SEED_ORIGINS,
  VoidBallActivationMode,
  VoidwalkerCustomizationConfig,
} from './multiversalEmergenceAndCultureEngine';

// ============================================================================
// 1. DEEP GRANULAR DIRT-LIKE PARTICLE & MICRO-PORTION EXCAVATION ENGINE
// ============================================================================

export interface DirtClodParticle {
  active: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  rotVel: THREE.Vector3;
  scale: number;
  color: THREE.Color;
  age: number;
  maxAge: number;
  settled: boolean;
}

export interface PersistentDirtMoundClod {
  pos: THREE.Vector3;
  rot: THREE.Euler;
  scale: THREE.Vector3;
  color: THREE.Color;
}

export interface GranularDirtExcavationRig {
  rootGroup: THREE.Group;
  flyingClodsInstanced: THREE.InstancedMesh;
  settledMoundsInstanced: THREE.InstancedMesh;
  fineSoilDustPoints: THREE.Points;
  crosshairMiningCursor: THREE.Group;
  flyingParticles: DirtClodParticle[];
  settledClods: PersistentDirtMoundClod[];
  dustPositions: Float32Array;
  dustVelocities: Float32Array;
  dustColors: Float32Array;
  dustAges: Float32Array;
  maxFlyingCount: number;
  maxSettledCount: number;
  maxDustCount: number;
  settledCursor: number;
  dustCursor: number;
}

export function buildGranularDirtExcavationRig(): GranularDirtExcavationRig {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'granular-dirt-excavation-rig';

  // Irregular sculpted dirt clod geometry (non-uniform dodecahedron with rough facets)
  const clodGeo = new THREE.DodecahedronGeometry(0.11, 1);
  const posAttr = clodGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vy = posAttr.getY(i);
    const vz = posAttr.getZ(i);
    const warp =
      0.78 +
      0.32 * Math.sin(vx * 18.0 + vy * 14.0) * Math.cos(vz * 16.0);
    posAttr.setXYZ(i, vx * warp, vy * warp * 0.82, vz * warp);
  }
  clodGeo.computeVertexNormals();

  const clodMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.94,
    metalness: 0.06,
    flatShading: true,
  });

  const maxFlyingCount = 480;
  const flyingClodsInstanced = new THREE.InstancedMesh(
    clodGeo,
    clodMat,
    maxFlyingCount
  );
  flyingClodsInstanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  flyingClodsInstanced.castShadow = true;
  flyingClodsInstanced.receiveShadow = true;
  flyingClodsInstanced.frustumCulled = false;

  const maxSettledCount = 900;
  const settledMoundsInstanced = new THREE.InstancedMesh(
    clodGeo,
    clodMat.clone(),
    maxSettledCount
  );
  settledMoundsInstanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  settledMoundsInstanced.castShadow = true;
  settledMoundsInstanced.receiveShadow = true;
  settledMoundsInstanced.frustumCulled = false;

  const dummyZero = new THREE.Object3D();
  dummyZero.scale.setScalar(0.0001);
  dummyZero.updateMatrix();
  const defaultDirtCol = new THREE.Color('#4a3525');

  for (let i = 0; i < maxFlyingCount; i++) {
    flyingClodsInstanced.setMatrixAt(i, dummyZero.matrix);
    flyingClodsInstanced.setColorAt(i, defaultDirtCol);
  }
  flyingClodsInstanced.instanceMatrix.needsUpdate = true;
  if (flyingClodsInstanced.instanceColor)
    flyingClodsInstanced.instanceColor.needsUpdate = true;

  for (let i = 0; i < maxSettledCount; i++) {
    settledMoundsInstanced.setMatrixAt(i, dummyZero.matrix);
    settledMoundsInstanced.setColorAt(i, defaultDirtCol);
  }
  settledMoundsInstanced.instanceMatrix.needsUpdate = true;
  if (settledMoundsInstanced.instanceColor)
    settledMoundsInstanced.instanceColor.needsUpdate = true;

  rootGroup.add(flyingClodsInstanced);
  rootGroup.add(settledMoundsInstanced);

  // Fine granular soil & dirt spray point cloud (900 fine grains)
  const maxDustCount = 900;
  const dustGeo = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(maxDustCount * 3);
  const dustVelocities = new Float32Array(maxDustCount * 3);
  const dustColors = new Float32Array(maxDustCount * 3);
  const dustAges = new Float32Array(maxDustCount);
  for (let i = 0; i < maxDustCount; i++) {
    dustPositions[i * 3 + 1] = -999;
    dustAges[i] = 999;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

  const dustMat = new THREE.PointsMaterial({
    size: 0.14,
    vertexColors: true,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
  });
  const fineSoilDustPoints = new THREE.Points(dustGeo, dustMat);
  fineSoilDustPoints.frustumCulled = false;
  rootGroup.add(fineSoilDustPoints);

  // 3D Diegetic Ground Mining Target Ring (shows exact micro-portion of dirt about to be scooped)
  const crosshairMiningCursor = new THREE.Group();
  const innerRing = new THREE.Mesh(
    new THREE.RingGeometry(0.55, 0.68, 28),
    new THREE.MeshBasicMaterial({
      color: '#10b981',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    })
  );
  innerRing.rotation.x = -Math.PI / 2;
  crosshairMiningCursor.add(innerRing);

  const outerTicks = new THREE.Mesh(
    new THREE.RingGeometry(0.95, 1.04, 16),
    new THREE.MeshBasicMaterial({
      color: '#fbbf24',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
      wireframe: true,
    })
  );
  outerTicks.rotation.x = -Math.PI / 2;
  crosshairMiningCursor.add(outerTicks);
  crosshairMiningCursor.visible = false;
  rootGroup.add(crosshairMiningCursor);

  const flyingParticles: DirtClodParticle[] = Array.from(
    { length: maxFlyingCount },
    () => ({
      active: false,
      pos: new THREE.Vector3(0, -999, 0),
      vel: new THREE.Vector3(),
      rot: new THREE.Euler(),
      rotVel: new THREE.Vector3(),
      scale: 1,
      color: new THREE.Color('#4a3525'),
      age: 0,
      maxAge: 1.5,
      settled: false,
    })
  );

  return {
    rootGroup,
    flyingClodsInstanced,
    settledMoundsInstanced,
    fineSoilDustPoints,
    crosshairMiningCursor,
    flyingParticles,
    settledClods: [],
    dustPositions,
    dustVelocities,
    dustColors,
    dustAges,
    maxFlyingCount,
    maxSettledCount,
    maxDustCount,
    settledCursor: 0,
    dustCursor: 0,
  };
}

/**
 * Triggers a rich, deep granular dirt & soil clod excavation burst at `hitPos`.
 * Works for micro-portions (radius 0.85m - 1.35m) as well as deep trenches!
 */
export function triggerGranularDirtExcavationBurst(params: {
  rig: GranularDirtExcavationRig;
  hitPos: THREE.Vector3;
  world: ManifoldWorldSpec;
  scoopRadius: number;
  scoopDepth: number;
  evalHeight: (x: number, z: number) => number;
}): void {
  const { rig, hitPos, world, scoopRadius, evalHeight } = params;

  // Multi-strata organic soil palette: rich dark humus topsoil, iron-ochre clay loam, deep root-subsoil, and mineral veins
  const topsoilHumus = new THREE.Color('#2b2118').lerp(
    new THREE.Color(world.palette.terrainLow),
    0.35
  );
  const clayLoam = new THREE.Color('#5c3d28').lerp(
    new THREE.Color(world.palette.terrainMid),
    0.35
  );
  const deepSubsoil = new THREE.Color('#3b271a');
  const mineralFleck = new THREE.Color(world.palette.accentColor);

  // 1. Spawn 65 flying 3D dirt clods & soil chunks that fountain up and bounce onto the rim
  let spawnedClods = 0;
  for (let i = 0; i < rig.maxFlyingCount && spawnedClods < 65; i++) {
    const p = rig.flyingParticles[i];
    if (p.active) continue;

    p.active = true;
    p.settled = false;
    p.age = 0;
    p.maxAge = 1.1 + Math.random() * 0.9;

    const angle = Math.random() * Math.PI * 2;
    const radial = Math.random() * scoopRadius * 0.78;
    p.pos.set(
      hitPos.x + Math.cos(angle) * radial,
      hitPos.y + 0.05 + Math.random() * 0.15,
      hitPos.z + Math.sin(angle) * radial
    );

    const outSpeed = 1.6 + Math.random() * 4.2;
    p.vel.set(
      Math.cos(angle) * outSpeed + (Math.random() - 0.5) * 1.4,
      3.8 + Math.random() * 5.6,
      Math.sin(angle) * outSpeed + (Math.random() - 0.5) * 1.4
    );

    p.rot.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    p.rotVel.set(
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12
    );
    p.scale = 0.55 + Math.random() * 1.35;

    const roll = Math.random();
    if (roll < 0.42) p.color.copy(topsoilHumus);
    else if (roll < 0.78) p.color.copy(clayLoam);
    else if (roll < 0.92) p.color.copy(deepSubsoil);
    else p.color.copy(mineralFleck);

    spawnedClods++;
  }

  // 2. Immediately deposit a ring of 28 physical 3D loose dirt clods around the excavated rim
  // so even a small scoop visually piles up real 3D soil around the hole!
  const dummy = new THREE.Object3D();
  const rimClodCount = 28;
  for (let r = 0; r < rimClodCount; r++) {
    const idx = rig.settledCursor % rig.maxSettledCount;
    rig.settledCursor++;

    const rimAngle =
      (r / rimClodCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
    const rimDist = scoopRadius * (0.72 + Math.random() * 0.42);
    const cx = hitPos.x + Math.cos(rimAngle) * rimDist;
    const cz = hitPos.z + Math.sin(rimAngle) * rimDist;
    const cy = evalHeight(cx, cz);

    dummy.position.set(cx, cy + 0.04, cz);
    dummy.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    const sx = 0.75 + Math.random() * 1.25;
    const sy = 0.55 + Math.random() * 0.85;
    const sz = 0.75 + Math.random() * 1.25;
    dummy.scale.set(sx, sy, sz);
    dummy.updateMatrix();

    const col =
      r % 6 === 0
        ? mineralFleck
        : r % 2 === 0
        ? clayLoam
        : topsoilHumus;

    rig.settledMoundsInstanced.setMatrixAt(idx, dummy.matrix);
    rig.settledMoundsInstanced.setColorAt(idx, col);
  }
  rig.settledMoundsInstanced.instanceMatrix.needsUpdate = true;
  if (rig.settledMoundsInstanced.instanceColor) {
    rig.settledMoundsInstanced.instanceColor.needsUpdate = true;
  }

  // 3. Emit 180 fine granular soil particles & dirt spray grains
  for (let d = 0; d < 180; d++) {
    const idx = rig.dustCursor % rig.maxDustCount;
    rig.dustCursor++;

    const angle = Math.random() * Math.PI * 2;
    const rDist = Math.random() * scoopRadius * 0.85;
    rig.dustPositions[idx * 3] = hitPos.x + Math.cos(angle) * rDist;
    rig.dustPositions[idx * 3 + 1] = hitPos.y + 0.08 + Math.random() * 0.25;
    rig.dustPositions[idx * 3 + 2] = hitPos.z + Math.sin(angle) * rDist;

    const spd = 0.9 + Math.random() * 3.8;
    rig.dustVelocities[idx * 3] = Math.cos(angle) * spd;
    rig.dustVelocities[idx * 3 + 1] = 2.2 + Math.random() * 5.2;
    rig.dustVelocities[idx * 3 + 2] = Math.sin(angle) * spd;

    const c =
      d % 7 === 0 ? mineralFleck : d % 2 === 0 ? clayLoam : topsoilHumus;
    rig.dustColors[idx * 3] = c.r;
    rig.dustColors[idx * 3 + 1] = c.g;
    rig.dustColors[idx * 3 + 2] = c.b;
    rig.dustAges[idx] = 0;
  }
}

export function updateGranularDirtExcavationRig(params: {
  rig: GranularDirtExcavationRig;
  dt: number;
  evalHeight: (x: number, z: number) => number;
}): void {
  const { rig, dt, evalHeight } = params;
  const dummy = new THREE.Object3D();
  let anyFlyingUpdated = false;
  let anySettledUpdated = false;

  for (let i = 0; i < rig.maxFlyingCount; i++) {
    const p = rig.flyingParticles[i];
    if (!p.active) continue;
    anyFlyingUpdated = true;

    p.age += dt;
    p.vel.y -= 13.5 * dt; // Rich weighty soil gravity
    p.pos.addScaledVector(p.vel, dt);
    p.rot.x += p.rotVel.x * dt;
    p.rot.y += p.rotVel.y * dt;
    p.rot.z += p.rotVel.z * dt;

    const groundY = evalHeight(p.pos.x, p.pos.z);
    if (p.pos.y <= groundY + 0.04) {
      p.pos.y = groundY + 0.04;
      if (Math.abs(p.vel.y) > 1.8) {
        // Bounce & scatter across the dirt slope
        p.vel.y = -p.vel.y * 0.32;
        p.vel.x *= 0.62;
        p.vel.z *= 0.62;
      } else {
        // Settle permanently into the 3D settled dirt mound instanced mesh!
        p.active = false;
        const sIdx = rig.settledCursor % rig.maxSettledCount;
        rig.settledCursor++;
        dummy.position.copy(p.pos);
        dummy.rotation.copy(p.rot);
        dummy.scale.set(p.scale * 1.1, p.scale * 0.68, p.scale * 1.1);
        dummy.updateMatrix();
        rig.settledMoundsInstanced.setMatrixAt(sIdx, dummy.matrix);
        rig.settledMoundsInstanced.setColorAt(sIdx, p.color);
        anySettledUpdated = true;

        dummy.scale.setScalar(0.0001);
        dummy.updateMatrix();
        rig.flyingClodsInstanced.setMatrixAt(i, dummy.matrix);
        continue;
      }
    }

    if (p.age >= p.maxAge) {
      p.active = false;
      dummy.scale.setScalar(0.0001);
      dummy.updateMatrix();
      rig.flyingClodsInstanced.setMatrixAt(i, dummy.matrix);
      continue;
    }

    dummy.position.copy(p.pos);
    dummy.rotation.copy(p.rot);
    dummy.scale.setScalar(p.scale);
    dummy.updateMatrix();
    rig.flyingClodsInstanced.setMatrixAt(i, dummy.matrix);
    rig.flyingClodsInstanced.setColorAt(i, p.color);
  }

  if (anyFlyingUpdated) {
    rig.flyingClodsInstanced.instanceMatrix.needsUpdate = true;
    if (rig.flyingClodsInstanced.instanceColor) {
      rig.flyingClodsInstanced.instanceColor.needsUpdate = true;
    }
  }
  if (anySettledUpdated) {
    rig.settledMoundsInstanced.instanceMatrix.needsUpdate = true;
    if (rig.settledMoundsInstanced.instanceColor) {
      rig.settledMoundsInstanced.instanceColor.needsUpdate = true;
    }
  }

  // Update fine soil grain particles
  let anyDustActive = false;
  for (let i = 0; i < rig.maxDustCount; i++) {
    const age = rig.dustAges[i];
    if (age >= 1.6) continue;
    anyDustActive = true;
    rig.dustAges[i] = age + dt;

    rig.dustVelocities[i * 3 + 1] -= 9.8 * dt;
    const nx = rig.dustPositions[i * 3] + rig.dustVelocities[i * 3] * dt;
    let ny = rig.dustPositions[i * 3 + 1] + rig.dustVelocities[i * 3 + 1] * dt;
    const nz = rig.dustPositions[i * 3 + 2] + rig.dustVelocities[i * 3 + 2] * dt;

    const gy = evalHeight(nx, nz);
    if (ny < gy + 0.03) {
      ny = gy + 0.03;
      rig.dustVelocities[i * 3] *= 0.4;
      rig.dustVelocities[i * 3 + 1] = 0;
      rig.dustVelocities[i * 3 + 2] *= 0.4;
    }

    rig.dustPositions[i * 3] = nx;
    rig.dustPositions[i * 3 + 1] = ny;
    rig.dustPositions[i * 3 + 2] = nz;
  }

  if (anyDustActive) {
    const posAttr = rig.fineSoilDustPoints.geometry.attributes
      .position as THREE.BufferAttribute;
    const colAttr = rig.fineSoilDustPoints.geometry.attributes
      .color as THREE.BufferAttribute;
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  }
}

// ============================================================================
// 2. IN-ENGINE 3D CHARACTER CREATION STAGE, LIVE ANATOMY MORPHING & 3D CUTSCENE
// ============================================================================

export type CharacterStudioPoseId =
  | 'combat-ready-breathe'
  | 'void-ball-hand-bloom'
  | 'visceral-cleave-combo'
  | 'stealth-predator-prowl'
  | 'multiversal-rupture-channel';

export interface InEngine3DCharacterStageRig {
  rootGroup: THREE.Group;
  pedestalGroup: THREE.Group;
  outerRuneRing: THREE.Mesh;
  innerVoidVortex: THREE.Points;
  ruptureColumnMesh: THREE.Mesh;
  keySpotLight: THREE.PointLight;
  rimSpotLight: THREE.PointLight;
  orbitShards: THREE.Mesh[];
  vortexPositions: Float32Array;
}

export function buildInEngine3DCharacterStageRig(): InEngine3DCharacterStageRig {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'in-engine-3d-character-stage-rig';

  const pedestalGroup = new THREE.Group();
  rootGroup.add(pedestalGroup);

  // Sculpted Obsidian & Void-Crystal Turntable Pedestal under the 3D character
  const baseDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(1.65, 1.95, 0.18, 36),
    new THREE.MeshPhysicalMaterial({
      color: '#0f172a',
      metalness: 0.85,
      roughness: 0.2,
      clearcoat: 0.9,
    })
  );
  baseDisc.position.y = -0.09;
  pedestalGroup.add(baseDisc);

  const outerRuneRing = new THREE.Mesh(
    new THREE.RingGeometry(1.72, 2.05, 48),
    new THREE.MeshBasicMaterial({
      color: '#a855f7',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.82,
    })
  );
  outerRuneRing.rotation.x = -Math.PI / 2;
  outerRuneRing.position.y = 0.03;
  pedestalGroup.add(outerRuneRing);

  // 8 Orbiting 3D Void Seed Monolith Shards around the character
  const orbitShards: THREE.Mesh[] = [];
  for (let i = 0; i < 8; i++) {
    const shard = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.14, 0),
      new THREE.MeshStandardMaterial({
        color: '#a855f7',
        emissive: '#38bdf8',
        emissiveIntensity: 1.2,
        metalness: 0.8,
        roughness: 0.15,
      })
    );
    pedestalGroup.add(shard);
    orbitShards.push(shard);
  }

  // Swirling 3D Elemental Vortex Particles around the character
  const pCount = 240;
  const vortexGeo = new THREE.BufferGeometry();
  const vortexPositions = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const a = (i / pCount) * Math.PI * 12;
    const r = 0.8 + (i / pCount) * 1.8;
    vortexPositions[i * 3] = Math.cos(a) * r;
    vortexPositions[i * 3 + 1] = (i / pCount) * 3.4;
    vortexPositions[i * 3 + 2] = Math.sin(a) * r;
  }
  vortexGeo.setAttribute(
    'position',
    new THREE.BufferAttribute(vortexPositions, 3)
  );
  const innerVoidVortex = new THREE.Points(
    vortexGeo,
    new THREE.PointsMaterial({
      color: '#a855f7',
      size: 0.09,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    })
  );
  rootGroup.add(innerVoidVortex);

  // Dramatic 3D Multiversal Rupture Energy Column (flares during the 3D Trauma Cutscene!)
  const ruptureColumnMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 1.45, 28, 24, 1, true),
    new THREE.MeshBasicMaterial({
      color: '#a855f7',
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
  );
  ruptureColumnMesh.position.y = 14;
  rootGroup.add(ruptureColumnMesh);

  // Dedicated 3D Studio Rim & Key Lights so the 3D character looks sharp and dramatic during creation & cutscene
  const keySpotLight = new THREE.PointLight('#f8fafc', 1.15, 10, 1.5);
  keySpotLight.position.set(1.6, 2.4, 2.2);
  rootGroup.add(keySpotLight);

  const rimSpotLight = new THREE.PointLight('#a855f7', 1.35, 10, 1.5);
  rimSpotLight.position.set(-1.8, 2.2, -1.8);
  rootGroup.add(rimSpotLight);

  rootGroup.visible = false;

  return {
    rootGroup,
    pedestalGroup,
    outerRuneRing,
    innerVoidVortex,
    ruptureColumnMesh,
    keySpotLight,
    rimSpotLight,
    orbitShards,
    vortexPositions,
  };
}

/**
 * Animates the 3D Voidwalker Character Model, its Left-Hand Void Ball, Right-Hand Weapon,
 * and the 3D Camera during:
 * - Mode A: Live 3D Character Creation Studio (`'character-creation'`)
 * - Mode B: In-Engine 3D Animated Trauma Cutscene (`'trauma-cutscene'`)
 * - Mode C: Active Gameplay 1st-Person & 3rd-Person Hand/Body Animations (`'active-gameplay'`)
 */
export function updateVoidwalker3DAnimationAndStage(params: {
  stageRig: InEngine3DCharacterStageRig;
  avatarRig: {
    root: THREE.Group;
    torsoGroup: THREE.Group;
    headGroup: THREE.Group;
    leftLeg: THREE.Object3D;
    rightLeg: THREE.Object3D;
    leftHandVoidRig: THREE.Group;
    rightHandToolRig: THREE.Group;
    packRotor: THREE.Object3D;
  } | null;
  fpLeftHandRig: THREE.Group | null;
  fpRightHandRig: THREE.Group | null;
  camera: THREE.PerspectiveCamera;
  playerPos: THREE.Vector3;
  playerYaw: number;
  config: VoidwalkerCustomizationConfig;
  studioMode: 'none' | 'character-creation' | 'trauma-cutscene';
  studioPose: CharacterStudioPoseId;
  studioTurntableYaw: number;
  cutsceneElapsedSec: number;
  voidBallMode: VoidBallActivationMode;
  meleeSwingTimer: number;
  meleeSwingDuration: number;
  nowSec: number;
}): void {
  const {
    stageRig,
    avatarRig,
    fpLeftHandRig,
    fpRightHandRig,
    camera,
    playerPos,
    playerYaw,
    config,
    studioMode,
    studioPose,
    studioTurntableYaw,
    cutsceneElapsedSec,
    voidBallMode,
    meleeSwingTimer,
    meleeSwingDuration,
    nowSec,
  } = params;

  const voidSeed =
    VOID_SEED_ORIGINS[config.voidSeedId] ??
    VOID_SEED_ORIGINS['singularity-graviton'];
  const baseElem =
    BASE_DIMENSIONAL_ELEMENTS[config.primaryBaseElement] ??
    BASE_DIMENSIONAL_ELEMENTS['lithic-crystalline'];
  const hScale = config.heightScale ?? 1.0;
  const sBreadth = config.shoulderBreadth ?? 1.0;
  const cCrest = config.cranialCrestHeight ?? 1.0;

  // 1. Apply Live 3D Anatomical Proportions & Dynamic Shapeshifting Phase-Morphing to the 3D Avatar Rig
  if (avatarRig) {
    avatarRig.root.scale.set(
      hScale * sBreadth,
      hScale,
      hScale * (0.9 + (sBreadth - 1.0) * 0.5)
    );
    avatarRig.headGroup.scale.set(
      1.0,
      cCrest,
      1.0 + (cCrest - 1.0) * 0.25
    );

    // 1A. Animate 4-Winged Seraphic Ophanim Feather Rig & 12 Blinking All-Seeing Polychromatic Eyes (from 26.webp!)
    const wingPivots = avatarRig.torsoGroup.userData.wingPivots as
      | THREE.Group[]
      | undefined;
    const wingEyeIrises = avatarRig.torsoGroup.userData.wingEyeIrises as
      | THREE.Mesh[]
      | undefined;
    const glitchVoxels = avatarRig.torsoGroup.userData.glitchVoxels as
      | THREE.Mesh[]
      | undefined;

    if (wingPivots) {
      const isChanneling =
        studioPose === 'multiversal-rupture-channel' ||
        voidBallMode !== 'dormant-clenched' ||
        meleeSwingTimer > 0;
      const flapFreq = isChanneling ? 4.2 : 2.1;
      const flapAmp = isChanneling ? 0.34 : 0.16;

      for (let i = 0; i < wingPivots.length; i++) {
        const wp = wingPivots[i];
        const wSide = (wp.userData.wSide as number) ?? 1;
        const pairIdx = (wp.userData.pairIdx as number) ?? 0;
        const baseRoll = (wp.userData.baseRoll as number) ?? 0;
        const wave = Math.sin(nowSec * flapFreq - pairIdx * 0.85);
        const sweep = Math.cos(nowSec * flapFreq - pairIdx * 0.65);

        wp.rotation.z =
          baseRoll + wSide * wave * flapAmp + (isChanneling ? wSide * 0.18 : 0);
        wp.rotation.y =
          -wSide * (0.22 + sweep * (isChanneling ? 0.28 : 0.14));
      }
    }

    if (wingEyeIrises) {
      for (let i = 0; i < wingEyeIrises.length; i++) {
        const iris = wingEyeIrises[i];
        // Asynchronous Ophanim eye blink & pupil dilation pulse
        const blinkWave = Math.sin(nowSec * 3.1 + i * 1.37);
        const blinkScaleY = blinkWave > 0.92 ? 0.08 : 1.0;
        iris.scale.set(
          1.0 + Math.sin(nowSec * 5.0 + i) * 0.12,
          blinkScaleY,
          0.5
        );
      }
    }

    if (glitchVoxels) {
      // Discrete quantum pixel-glitch mosaic stepping around neck & wings (from 26.webp)
      const glitchTick = Math.floor(nowSec * 14);
      for (let g = 0; g < glitchVoxels.length; g++) {
        const voxel = glitchVoxels[g];
        const side = g % 2 === 0 ? 1 : -1;
        const hash = Math.sin(glitchTick * 12.9898 + g * 78.233) * 43758.5453;
        const frac = hash - Math.floor(hash);
        voxel.position.set(
          side * (0.2 + (g % 3) * 0.065 + (frac - 0.5) * 0.08),
          0.72 + Math.floor(g / 2) * 0.085 + Math.sin(nowSec * 6 + g) * 0.03,
          0.06 + (frac - 0.5) * 0.06
        );
        voxel.scale.setScalar(frac > 0.2 ? 0.85 + frac * 0.5 : 0.01);
      }
    }

    // 1B. Dynamic Cranial Shapeshifting Morph between:
    //   Phase A: Burning Vascular Dendritic Tree-Crown + Orbiting White Porcelain Mask (26.webp)
    //   Phase B: Escher-Jade Pyramid-Eye Cranium (Screenshot_20261018_030835_Photos.jpg)
    //   Phase C: Sacred-Geometry Golden Metatron Star Halos
    const vascularTreeCrownGroup = avatarRig.headGroup.userData
      .vascularTreeCrownGroup as THREE.Group | undefined;
    const floatingPorcelainMaskGroup = avatarRig.headGroup.userData
      .floatingPorcelainMaskGroup as THREE.Group | undefined;
    const pyramidEyeHeadGroup = avatarRig.headGroup.userData
      .pyramidEyeHeadGroup as THREE.Group | undefined;
    const cranialRunicHalo = avatarRig.headGroup.userData.cranialRunicHalo as
      | THREE.Mesh
      | undefined;
    const metatronStarA = avatarRig.headGroup.userData.metatronStarA as
      | THREE.Mesh
      | undefined;
    const metatronStarB = avatarRig.headGroup.userData.metatronStarB as
      | THREE.Mesh
      | undefined;

    // Smooth trippy phase-change wave (0 = Pure Seraphic Vascular Crown & Porcelain Mask, 1 = Escher-Jade Pyramid-Eye Resonance)
    const rawMorphWave =
      studioPose === 'stealth-predator-prowl'
        ? 0.92
        : studioPose === 'combat-ready-breathe'
        ? 0.15
        : (Math.sin(nowSec * 0.65) * 0.5 + 0.5) * 0.78;

    if (vascularTreeCrownGroup) {
      const crownScale = THREE.MathUtils.lerp(1.08, 0.72, rawMorphWave);
      vascularTreeCrownGroup.scale.set(
        crownScale,
        crownScale * (1.0 + Math.sin(nowSec * 7.5) * 0.06),
        crownScale
      );
      vascularTreeCrownGroup.rotation.y = Math.sin(nowSec * 1.4) * 0.12;
    }

    if (floatingPorcelainMaskGroup) {
      // Orbit & bob the sculpted White Porcelain Mask to the upper-right of the flame crown (from 26.webp)
      floatingPorcelainMaskGroup.position.set(
        0.34 + Math.cos(nowSec * 1.8) * 0.04,
        0.32 + Math.sin(nowSec * 2.7) * 0.05,
        -0.14 + Math.sin(nowSec * 1.8) * 0.04
      );
      floatingPorcelainMaskGroup.rotation.y =
        -0.32 + Math.sin(nowSec * 1.5) * 0.18;
      floatingPorcelainMaskGroup.rotation.z = Math.cos(nowSec * 2.1) * 0.08;
    }

    if (pyramidEyeHeadGroup) {
      // Scale & rotate the Escher-Jade Pyramid-Eye Cranium as it phase-shifts through the flame crown!
      const pyrScale = THREE.MathUtils.lerp(0.58, 1.16, rawMorphWave);
      pyramidEyeHeadGroup.scale.setScalar(pyrScale);
      pyramidEyeHeadGroup.position.y =
        0.22 + Math.sin(nowSec * 3.2) * 0.03 + rawMorphWave * 0.06;
      pyramidEyeHeadGroup.rotation.y =
        Math.sin(nowSec * 1.2) * 0.24 * rawMorphWave;
    }

    if (cranialRunicHalo) {
      cranialRunicHalo.rotation.z = nowSec * 0.85;
    }
    if (metatronStarA) {
      metatronStarA.rotation.z = nowSec * 1.25;
      metatronStarA.scale.setScalar(1.0 + Math.sin(nowSec * 3.0) * 0.08);
    }
    if (metatronStarB) {
      metatronStarB.rotation.z = Math.PI - nowSec * 1.25;
      metatronStarB.scale.setScalar(1.0 + Math.cos(nowSec * 3.0) * 0.08);
    }
  }

  // 2. Expressive 3D Left-Hand & Right-Hand Animations (for BOTH 1st-person and 3rd-person hands!)
  const animateHandRig = (
    leftHand: THREE.Group | null,
    rightHand: THREE.Group | null,
    isFirstPerson: boolean
  ) => {
    if (leftHand) {
      const fingerChains = leftHand.userData.fingerChains as
        | {
            proximal: THREE.Group;
            intermediate: THREE.Group;
            distal: THREE.Group;
            baseFlare: number;
          }[]
        | undefined;
      const voidSphereGroup = leftHand.userData.voidSphereGroup as
        | THREE.Group
        | undefined;

      // Determine target finger curl and void sphere scale from Void Ball Mode or Studio Pose
      const effectiveMode: VoidBallActivationMode =
        studioMode === 'character-creation' &&
        studioPose === 'void-ball-hand-bloom'
          ? 'hand-inventory-bloom'
          : studioMode === 'trauma-cutscene' && cutsceneElapsedSec > 3.2
          ? 'hand-inventory-bloom'
          : voidBallMode;

      const isHandOpen =
        effectiveMode === 'hand-inventory-bloom' ||
        effectiveMode === 'walk-in-sanctum-portal';

      // Curl fingers tightly when dormant; spread fingers wide with energy tremor when open!
      if (fingerChains) {
        for (let i = 0; i < fingerChains.length; i++) {
          const fc = fingerChains[i];
          const phase = nowSec * 4.5 + i * 0.7;
          if (isHandOpen) {
            // Unfurl fingers wide into a dramatic open lotus claw around the blooming Void Ball
            fc.proximal.rotation.x = THREE.MathUtils.lerp(
              fc.proximal.rotation.x,
              -0.38 + Math.sin(phase) * 0.08,
              0.18
            );
            fc.intermediate.rotation.x = THREE.MathUtils.lerp(
              fc.intermediate.rotation.x,
              0.18 + Math.cos(phase) * 0.06,
              0.18
            );
            fc.distal.rotation.x = THREE.MathUtils.lerp(
              fc.distal.rotation.x,
              0.15,
              0.18
            );
            fc.proximal.rotation.y =
              fc.baseFlare * 1.45 + Math.sin(phase) * 0.05;
          } else {
            // Dormant Clench: Curl all 3 phalanges inward into a tight fist sealing the Void Seed
            fc.proximal.rotation.x = THREE.MathUtils.lerp(
              fc.proximal.rotation.x,
              1.18 + Math.sin(nowSec * 2.0 + i) * 0.03,
              0.18
            );
            fc.intermediate.rotation.x = THREE.MathUtils.lerp(
              fc.intermediate.rotation.x,
              1.25,
              0.18
            );
            fc.distal.rotation.x = THREE.MathUtils.lerp(
              fc.distal.rotation.x,
              1.1,
              0.18
            );
            fc.proximal.rotation.y = fc.baseFlare * 0.4;
          }
        }
      }

      if (voidSphereGroup) {
        const targetOrbScale =
          effectiveMode === 'hand-inventory-bloom'
            ? 1.45 + Math.sin(nowSec * 5.0) * 0.12
            : effectiveMode === 'walk-in-sanctum-portal'
            ? 1.85 + Math.sin(nowSec * 8.0) * 0.18
            : 0.18; // Tiny sealed ember inside clenched fist when dormant
        const curS = voidSphereGroup.scale.x;
        const nextS = THREE.MathUtils.lerp(curS, targetOrbScale, 0.16);
        voidSphereGroup.scale.setScalar(nextS);
        voidSphereGroup.rotation.y = nowSec * 2.4;
        voidSphereGroup.rotation.z = nowSec * 1.7;
      }

      if (isFirstPerson && isHandOpen) {
        // Rotate 1st-person left hand palm-up toward the player's eyes when Inventory Bloom or Portal Channeling is open!
        const targetPosX = -0.22;
        const targetPosY = -0.14;
        const targetPosZ = -0.38;
        const targetRotX = 0.65;
        const targetRotY = 0.68;
        const targetRotZ = 0.35;

        leftHand.position.x = THREE.MathUtils.lerp(
          leftHand.position.x,
          targetPosX,
          0.18
        );
        leftHand.position.y = THREE.MathUtils.lerp(
          leftHand.position.y,
          targetPosY + Math.sin(nowSec * 2.6) * 0.008,
          0.18
        );
        leftHand.position.z = THREE.MathUtils.lerp(
          leftHand.position.z,
          targetPosZ,
          0.18
        );
        leftHand.rotation.x = THREE.MathUtils.lerp(
          leftHand.rotation.x,
          targetRotX,
          0.18
        );
        leftHand.rotation.y = THREE.MathUtils.lerp(
          leftHand.rotation.y,
          targetRotY,
          0.18
        );
        leftHand.rotation.z = THREE.MathUtils.lerp(
          leftHand.rotation.z,
          targetRotZ,
          0.18
        );
      }
    }

    if (rightHand && isFirstPerson) {
      // Visceral 1st-Person Right-Hand Melee Cleave / Mine / Throw Whip Animation
      if (meleeSwingTimer > 0) {
        const p = 1.0 - meleeSwingTimer / Math.max(0.01, meleeSwingDuration);
        // Wind up (0..0.25), violent diagonal cleave across screen (0.25..0.65), recovery (0.65..1.0)
        const cleaveArc = Math.sin(p * Math.PI);
        const crossSlash = Math.cos(p * Math.PI * 1.5);
        rightHand.position.set(
          0.32 - cleaveArc * 0.36,
          -0.2 + Math.sin(p * Math.PI * 2) * 0.14,
          -0.46 - cleaveArc * 0.28
        );
        rightHand.rotation.set(
          0.24 - cleaveArc * 1.35,
          -0.28 + cleaveArc * 0.95,
          0.12 + crossSlash * 0.75
        );
      }
    }
  };

  animateHandRig(fpLeftHandRig, fpRightHandRig, true);
  if (avatarRig) {
    animateHandRig(
      avatarRig.leftHandVoidRig,
      avatarRig.rightHandToolRig,
      false
    );
  }

  // 3. If NOT in Character Creation or Trauma Cutscene, hide stage rig and return
  if (studioMode === 'none') {
    stageRig.rootGroup.visible = false;
    return;
  }

  // 4. Position & Animate the 3D Stage Pedestal right at the player's coordinates
  stageRig.rootGroup.visible = true;
  stageRig.rootGroup.position.copy(playerPos);

  const seedCol = new THREE.Color(voidSeed.coreColor);
  const elemCol = new THREE.Color(baseElem.colorHex);
  (stageRig.outerRuneRing.material as THREE.MeshBasicMaterial).color.copy(
    seedCol
  );
  stageRig.outerRuneRing.rotation.z = nowSec * 0.65;
  (stageRig.innerVoidVortex.material as THREE.PointsMaterial).color.copy(
    elemCol
  );
  stageRig.innerVoidVortex.rotation.y = nowSec * 1.25;
  stageRig.rimSpotLight.color.copy(seedCol);
  stageRig.keySpotLight.color.lerpColors(
    new THREE.Color('#ffffff'),
    elemCol,
    0.35
  );

  for (let i = 0; i < stageRig.orbitShards.length; i++) {
    const sh = stageRig.orbitShards[i];
    const a = nowSec * 1.4 + (i / stageRig.orbitShards.length) * Math.PI * 2;
    const rad =
      studioMode === 'trauma-cutscene'
        ? 1.2 + Math.sin(cutsceneElapsedSec * 2.5 + i) * 0.85
        : 1.55;
    sh.position.set(
      Math.cos(a) * rad,
      0.95 + Math.sin(nowSec * 2.8 + i) * 0.45,
      Math.sin(a) * rad
    );
    sh.rotation.x = nowSec * 2.2 + i;
    sh.rotation.y = nowSec * 1.8;
    const mat = sh.material as THREE.MeshStandardMaterial;
    mat.color.copy(seedCol);
    mat.emissive.copy(elemCol);
  }

  if (!avatarRig) return;

  // Force the 3D character body to be visible during Character Creation & Cutscene (even if player uses 1st-person in gameplay)
  avatarRig.root.visible = true;
  if (fpLeftHandRig) fpLeftHandRig.visible = false;
  if (fpRightHandRig) fpRightHandRig.visible = false;

  const leftKnee = avatarRig.leftLeg.userData.kneeGroup as
    | THREE.Group
    | undefined;
  const rightKnee = avatarRig.rightLeg.userData.kneeGroup as
    | THREE.Group
    | undefined;

  if (studioMode === 'character-creation') {
    stageRig.ruptureColumnMesh.visible = false;
    avatarRig.root.position.set(playerPos.x, playerPos.y, playerPos.z);
    avatarRig.root.rotation.set(0, playerYaw + studioTurntableYaw, 0);

    // Animate the selected 3D Pose on the character!
    if (studioPose === 'combat-ready-breathe') {
      const breath = Math.sin(nowSec * 2.8);
      avatarRig.torsoGroup.position.y = 0.78 + breath * 0.03;
      avatarRig.torsoGroup.rotation.set(0.08, Math.sin(nowSec * 1.1) * 0.12, 0);
      avatarRig.headGroup.rotation.set(
        -0.05 + breath * 0.04,
        Math.sin(nowSec * 0.9) * 0.18,
        0
      );
      avatarRig.leftHandVoidRig.position.set(
        -0.44,
        0.42 + breath * 0.04,
        -0.28
      );
      avatarRig.leftHandVoidRig.rotation.set(0.45, 0.3, -0.25);
      avatarRig.rightHandToolRig.position.set(
        0.44,
        0.38 - breath * 0.03,
        -0.28
      );
      avatarRig.rightHandToolRig.rotation.set(0.35, -0.25, 0.2);
      avatarRig.leftLeg.rotation.x = -0.12;
      avatarRig.rightLeg.rotation.x = 0.12;
      if (leftKnee) leftKnee.rotation.x = 0.22;
      if (rightKnee) rightKnee.rotation.x = 0.18;
    } else if (studioPose === 'void-ball-hand-bloom') {
      const pulse = Math.sin(nowSec * 3.6);
      avatarRig.torsoGroup.position.y = 0.8 + pulse * 0.025;
      avatarRig.torsoGroup.rotation.set(-0.08, 0.25, 0.05);
      avatarRig.headGroup.rotation.set(0.18, 0.28, 0);
      // Raise Left Hand high displaying the blooming Void Ball & 3D Item Carousel
      avatarRig.leftHandVoidRig.position.set(
        -0.36,
        0.68 + pulse * 0.05,
        -0.44
      );
      avatarRig.leftHandVoidRig.rotation.set(0.85, 0.45, 0.35);
      avatarRig.rightHandToolRig.position.set(0.46, 0.28, -0.18);
      avatarRig.rightHandToolRig.rotation.set(-0.2, -0.4, 0.35);
    } else if (studioPose === 'visceral-cleave-combo') {
      // Dynamic continuous martial slash & lunge animation loop
      const cycle = nowSec * 3.8;
      const slash = Math.sin(cycle);
      const twist = Math.cos(cycle);
      avatarRig.torsoGroup.position.y = 0.72 + Math.abs(slash) * 0.08;
      avatarRig.torsoGroup.rotation.set(0.24, slash * 0.58, twist * 0.12);
      avatarRig.headGroup.rotation.set(-0.15, -slash * 0.35, 0);
      avatarRig.rightHandToolRig.position.set(
        0.38 - slash * 0.28,
        0.52 + twist * 0.22,
        -0.38 - Math.abs(slash) * 0.2
      );
      avatarRig.rightHandToolRig.rotation.set(
        0.8 - slash * 1.4,
        -0.3 + slash * 0.8,
        0.4
      );
      avatarRig.leftHandVoidRig.position.set(-0.44, 0.44, -0.32);
      avatarRig.leftLeg.rotation.x = slash * 0.45;
      avatarRig.rightLeg.rotation.x = -slash * 0.45;
      if (leftKnee) leftKnee.rotation.x = Math.max(0.1, -slash * 0.55);
      if (rightKnee) rightKnee.rotation.x = Math.max(0.1, slash * 0.55);
    } else if (studioPose === 'stealth-predator-prowl') {
      // Deep Far Cry predator crouch & stalk cycle
      const prowl = Math.sin(nowSec * 3.2);
      avatarRig.torsoGroup.position.y = 0.52 + Math.abs(prowl) * 0.04;
      avatarRig.torsoGroup.rotation.set(0.48, prowl * 0.22, 0);
      avatarRig.headGroup.rotation.set(-0.32, Math.sin(nowSec * 1.6) * 0.35, 0);
      avatarRig.leftLeg.rotation.x = -0.68 + prowl * 0.25;
      avatarRig.rightLeg.rotation.x = -0.45 - prowl * 0.25;
      if (leftKnee) leftKnee.rotation.x = 1.15;
      if (rightKnee) rightKnee.rotation.x = 0.95;
      avatarRig.leftHandVoidRig.position.set(-0.38, 0.28, -0.38);
      avatarRig.rightHandToolRig.position.set(0.38, 0.26, -0.38);
    } else {
      // 'multiversal-rupture-channel' levitation & dorsal wing/rotor flare
      const hover = Math.sin(nowSec * 3.0);
      avatarRig.root.position.y = playerPos.y + 0.42 + hover * 0.14;
      avatarRig.torsoGroup.rotation.set(-0.28, Math.sin(nowSec * 1.5) * 0.2, 0);
      avatarRig.headGroup.rotation.set(-0.38, 0, 0);
      avatarRig.leftHandVoidRig.position.set(-0.56, 0.72 + hover * 0.08, -0.22);
      avatarRig.leftHandVoidRig.rotation.set(1.1, 0.6, -0.6);
      avatarRig.rightHandToolRig.position.set(0.56, 0.72 + hover * 0.08, -0.22);
      avatarRig.rightHandToolRig.rotation.set(1.1, -0.6, 0.6);
    }

    // Position 3D Camera in a framing studio orbit offset slightly to the left so the right side of the screen (and center) showcases the full 3D character!
    const camAngle = playerYaw + Math.PI + 0.18;
    const camDist = 3.35;
    const targetCamPos = new THREE.Vector3(
      playerPos.x + Math.sin(camAngle) * camDist,
      playerPos.y + 1.38 + Math.sin(nowSec * 1.1) * 0.04,
      playerPos.z + Math.cos(camAngle) * camDist
    );
    const lookTarget = new THREE.Vector3(
      playerPos.x - Math.cos(camAngle) * 0.42,
      playerPos.y + 1.12,
      playerPos.z + Math.sin(camAngle) * 0.42
    );
    camera.position.lerp(targetCamPos, 0.18);
    camera.lookAt(lookTarget);
  } else if (studioMode === 'trauma-cutscene') {
    // 3-ACT IN-ENGINE 3D ANIMATED ORIGIN & TRAUMA CUTSCENE (0s -> 12s)
    const t = cutsceneElapsedSec;
    stageRig.ruptureColumnMesh.visible = true;
    const colMat = stageRig.ruptureColumnMesh
      .material as THREE.MeshBasicMaterial;
    colMat.color.copy(seedCol);

    if (t < 4.0) {
      // ACT I (0s - 4s): The Multiversal Rupture — Character drops to knees clutching head, then levitates into the Void Pillar
      const p = t / 4.0;
      colMat.opacity = Math.sin(p * Math.PI) * 0.48;
      stageRig.ruptureColumnMesh.scale.set(
        0.6 + p * 1.8,
        1.0,
        0.6 + p * 1.8
      );

      const kneelToLevitate =
        p < 0.45
          ? -Math.sin((p / 0.45) * Math.PI * 0.5) * 0.35
          : -0.35 + ((p - 0.45) / 0.55) * 1.15;
      avatarRig.root.position.set(
        playerPos.x,
        playerPos.y + Math.max(-0.3, kneelToLevitate),
        playerPos.z
      );
      avatarRig.root.rotation.set(0, playerYaw + Math.sin(t * 1.5) * 0.25, 0);
      avatarRig.torsoGroup.rotation.set(
        p < 0.45 ? 0.55 : -0.42,
        Math.sin(t * 6.0) * 0.12,
        0
      );
      avatarRig.headGroup.rotation.set(p < 0.45 ? 0.45 : -0.55, 0, 0);
      avatarRig.leftHandVoidRig.position.set(-0.48, 0.68, -0.32);
      avatarRig.rightHandToolRig.position.set(0.48, 0.68, -0.32);

      // Sweeping low-angle 360° cinematic camera orbit
      const orbitA = playerYaw + Math.PI - 0.9 + p * 1.9;
      const dist = 4.6 - p * 1.1;
      camera.position.set(
        playerPos.x + Math.sin(orbitA) * dist,
        playerPos.y + 0.9 + p * 1.6,
        playerPos.z + Math.cos(orbitA) * dist
      );
      camera.lookAt(
        playerPos.x,
        playerPos.y + 1.2 + Math.max(0, kneelToLevitate),
        playerPos.z
      );
    } else if (t < 8.5) {
      // ACT II (4s - 8.5s): Left-Hand Void Seed Condensation & Trauma Imprint — Close-up on the Voidwalker & Blooming Left-Hand Void Ball
      const p = (t - 4.0) / 4.5;
      colMat.opacity = 0.28 + Math.sin(t * 8.0) * 0.12;
      const hoverY = 0.55 + Math.sin(t * 3.2) * 0.12;
      avatarRig.root.position.set(playerPos.x, playerPos.y + hoverY, playerPos.z);
      avatarRig.root.rotation.set(0, playerYaw, 0);
      avatarRig.torsoGroup.rotation.set(-0.15, 0.28, 0);
      avatarRig.headGroup.rotation.set(0.15, 0.25, 0);
      // Thrust Left Hand forward as the Void Seed violently condenses into the palm
      avatarRig.leftHandVoidRig.position.set(
        -0.32,
        0.64 + Math.sin(t * 5.0) * 0.05,
        -0.48
      );
      avatarRig.leftHandVoidRig.rotation.set(0.95, 0.45, 0.35);

      const closeAngle = playerYaw + Math.PI + 0.35 - p * 0.55;
      const closeDist = 2.35;
      camera.position.set(
        playerPos.x + Math.sin(closeAngle) * closeDist,
        playerPos.y + hoverY + 1.35,
        playerPos.z + Math.cos(closeAngle) * closeDist
      );
      camera.lookAt(
        playerPos.x - Math.sin(playerYaw) * 0.35,
        playerPos.y + hoverY + 1.18,
        playerPos.z - Math.cos(playerYaw) * 0.35
      );
    } else {
      // ACT III (8.5s - 12s): Touchdown & Seamless Camera Dive into Gameplay Perspective
      const p = Math.min(1.0, (t - 8.5) / 3.5);
      colMat.opacity = (1.0 - p) * 0.25;
      const landY = (1.0 - p) * 0.55;
      avatarRig.root.position.set(playerPos.x, playerPos.y + landY, playerPos.z);
      avatarRig.root.rotation.set(0, playerYaw, 0);
      avatarRig.torsoGroup.rotation.set(0.1 * (1 - p), 0, 0);
      avatarRig.leftHandVoidRig.position.set(-0.42, 0.42, -0.28);
      avatarRig.rightHandToolRig.position.set(0.42, 0.42, -0.28);

      const startCam = new THREE.Vector3(
        playerPos.x + Math.sin(playerYaw + Math.PI) * 2.5,
        playerPos.y + 1.75,
        playerPos.z + Math.cos(playerYaw + Math.PI) * 2.5
      );
      const endCam = new THREE.Vector3(
        playerPos.x,
        playerPos.y + 1.68,
        playerPos.z
      );
      camera.position.lerpVectors(startCam, endCam, p);
      const lookAhead = new THREE.Vector3(
        playerPos.x - Math.sin(playerYaw) * 6.0,
        playerPos.y + 1.5,
        playerPos.z - Math.cos(playerYaw) * 6.0
      );
      camera.lookAt(lookAhead);
    }
  }
}
