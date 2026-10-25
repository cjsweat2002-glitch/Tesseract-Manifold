import * as THREE from 'three';
import { EntityBlueprint, ManifoldWorldSpec } from '../types/manifold';
import { ArticulatedRagdollEntity } from './ragdollPhysics';
import {
  BASE_DIMENSIONAL_ELEMENTS,
  BaseDimensionalElementId,
} from './multiversalEmergenceAndCultureEngine';
import { harmonicSoundscape } from './harmonicSoundscapeEngine';
import { applyCarvedRelicSurfaceToGroup } from './carvedMaterialAndMindspaceEngine';

export type ImprovisedWeaponKind =
  | 'basalt-cleaver'
  | 'cymatic-lance'
  | 'volatile-ampoule'
  | 'leviathan-rib-club'
  | 'severed-creature-limb';

export interface GrabbableWorldObject {
  id: string;
  kind: ImprovisedWeaponKind;
  name: string;
  mesh: THREE.Group;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  massKg: number;
  baseDamage: number;
  cleaveChance: number;
  durability: number;
  maxDurability: number;
  infusedElement: BaseDimensionalElementId | null;
  isHeldByPlayer: boolean;
  isThrownProjectile: boolean;
  sourceCreatureName?: string;
}

export interface PersistentBloodDecal {
  mesh: THREE.Group;
  pos: THREE.Vector3;
  age: number;
  matterState: BaseDimensionalElementId;
}

export interface ArterialSprayParticle {
  mesh: THREE.Mesh;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  age: number;
  maxAge: number;
  colorHex: string;
  matterState: BaseDimensionalElementId;
}

export interface AcousticNoiseWave {
  mesh: THREE.Mesh;
  origin: THREE.Vector3;
  radius: number;
  maxRadius: number;
  age: number;
  maxAge: number;
}

export interface VisceralCombatAndGrabRig {
  rootGroup: THREE.Group;
  grabbableObjects: GrabbableWorldObject[];
  heldObject: GrabbableWorldObject | null;
  bloodDecals: PersistentBloodDecal[];
  arterialParticles: ArterialSprayParticle[];
  acousticWaves: AcousticNoiseWave[];
  handInventoryCarouselGroup: THREE.Group;
  meleeSwingTimer: number;
  meleeSwingDuration: number;
  lastCombatEventBanner: string;
}

export function buildImprovisedWeaponMesh(
  kind: ImprovisedWeaponKind,
  accentHex: string = '#f59e0b'
): THREE.Group {
  const group = new THREE.Group();

  const stoneMat = new THREE.MeshStandardMaterial({
    color: '#334155',
    roughness: 0.65,
    metalness: 0.35,
  });
  const edgeMat = new THREE.MeshStandardMaterial({
    color: accentHex,
    emissive: accentHex,
    emissiveIntensity: 0.45,
    roughness: 0.25,
    metalness: 0.8,
  });

  if (kind === 'basalt-cleaver') {
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 0.65, 8),
      stoneMat
    );
    handle.position.y = 0.2;
    group.add(handle);

    const blade = new THREE.Mesh(
      new THREE.ConeGeometry(0.24, 0.72, 4),
      edgeMat
    );
    blade.scale.set(0.35, 1.0, 1.15);
    blade.position.set(0, 0.62, 0.08);
    blade.rotation.x = 0.15;
    blade.castShadow = true;
    blade.userData.isInfusableBlade = true;
    group.add(blade);
  } else if (kind === 'cymatic-lance') {
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.04, 1.25, 10),
      stoneMat
    );
    shaft.position.y = 0.5;
    group.add(shaft);

    const prongs = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.03, 8, 18, Math.PI * 1.3),
      edgeMat
    );
    prongs.position.y = 1.15;
    prongs.userData.isInfusableBlade = true;
    group.add(prongs);
  } else if (kind === 'volatile-ampoule') {
    const flask = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.24, 1),
      edgeMat
    );
    flask.position.y = 0.26;
    flask.userData.isInfusableBlade = true;
    group.add(flask);

    const cage = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.22, 0.42, 6, 1, true),
      stoneMat
    );
    cage.position.y = 0.26;
    group.add(cage);
  } else if (kind === 'leviathan-rib-club') {
    const boneMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      roughness: 0.4,
      metalness: 0.2,
    });
    const rib = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.04, 0.95, 9),
      boneMat
    );
    rib.position.y = 0.45;
    rib.rotation.z = 0.12;
    group.add(rib);

    const ridge = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.18, 0),
      edgeMat
    );
    ridge.position.set(0.06, 0.82, 0);
    ridge.userData.isInfusableBlade = true;
    group.add(ridge);
  } else {
    // 'severed-creature-limb'
    const fleshMat = new THREE.MeshStandardMaterial({
      color: '#991b1b',
      roughness: 0.3,
      metalness: 0.15,
    });
    const boneCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.78, 8),
      new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.35 })
    );
    boneCore.position.y = 0.38;
    group.add(boneCore);

    const muscleSheath = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.07, 0.58, 10),
      fleshMat
    );
    muscleSheath.position.y = 0.42;
    group.add(muscleSheath);

    const clawTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.09, 0.32, 5),
      edgeMat
    );
    clawTip.position.y = 0.82;
    clawTip.userData.isInfusableBlade = true;
    group.add(clawTip);
  }

  applyCarvedRelicSurfaceToGroup(
    group,
    kind === 'leviathan-rib-club' || kind === 'severed-creature-limb'
      ? 'biomech-chitin-striations'
      : 'carved-obsidian-runes'
  );
  return group;
}

export function buildVisceralCombatAndGrabRig(
  world: ManifoldWorldSpec,
  evalHeight: (x: number, z: number) => number
): VisceralCombatAndGrabRig {
  const rootGroup = new THREE.Group();
  const grabbableObjects: GrabbableWorldObject[] = [];

  const kinds: {
    kind: ImprovisedWeaponKind;
    name: string;
    massKg: number;
    baseDamage: number;
    cleaveChance: number;
    color: string;
  }[] = [
    {
      kind: 'basalt-cleaver',
      name: 'Fractured Basalt Cleaver',
      massKg: 6.5,
      baseDamage: 0.48,
      cleaveChance: 0.85,
      color: '#f59e0b',
    },
    {
      kind: 'cymatic-lance',
      name: 'Resonant Cymatic Tuning-Lance',
      massKg: 4.2,
      baseDamage: 0.42,
      cleaveChance: 0.65,
      color: '#38bdf8',
    },
    {
      kind: 'volatile-ampoule',
      name: 'Volatile Vitreous Spore-Ampoule',
      massKg: 3.0,
      baseDamage: 0.62,
      cleaveChance: 0.9,
      color: '#f43f5e',
    },
    {
      kind: 'leviathan-rib-club',
      name: 'Calcified Leviathan Rib-Maul',
      massKg: 8.5,
      baseDamage: 0.54,
      cleaveChance: 0.75,
      color: '#10b981',
    },
  ];

  // Scatter 10 interactive physical weapons/objects around the starting basin
  for (let i = 0; i < 10; i++) {
    const spec = kinds[i % kinds.length];
    const angle = (i / 10) * Math.PI * 2 + 0.35;
    const dist = 7.5 + (i % 3) * 6.5;
    const ox = Math.cos(angle) * dist;
    const oz = Math.sin(angle) * dist + 6;
    const oy = evalHeight(ox, oz);

    const mesh = buildImprovisedWeaponMesh(spec.kind, spec.color);
    mesh.position.set(ox, oy + 0.15, oz);
    mesh.rotation.set(0.25, angle, 0.18);
    rootGroup.add(mesh);

    grabbableObjects.push({
      id: `grab-obj-${i}-${world.seed}`,
      kind: spec.kind,
      name: spec.name,
      mesh,
      pos: new THREE.Vector3(ox, oy + 0.15, oz),
      vel: new THREE.Vector3(),
      massKg: spec.massKg,
      baseDamage: spec.baseDamage,
      cleaveChance: spec.cleaveChance,
      durability: 6,
      maxDurability: 6,
      infusedElement: null,
      isHeldByPlayer: false,
      isThrownProjectile: false,
    });
  }

  // Build 3D Left-Hand Inventory Bloom Carousel (orbits above the open left palm)
  const handInventoryCarouselGroup = new THREE.Group();
  handInventoryCarouselGroup.visible = false;
  const itemColors = ['#f59e0b', '#06b6d4', '#38bdf8', '#f43f5e', '#a855f7', '#10b981'];
  for (let c = 0; c < 6; c++) {
    const miniGeo =
      c % 2 === 0
        ? new THREE.OctahedronGeometry(0.028, 0)
        : new THREE.TorusKnotGeometry(0.018, 0.006, 24, 6);
    const miniMat = new THREE.MeshStandardMaterial({
      color: itemColors[c],
      emissive: itemColors[c],
      emissiveIntensity: 0.95,
      roughness: 0.15,
      metalness: 0.8,
    });
    const miniMesh = new THREE.Mesh(miniGeo, miniMat);
    const a = (c / 6) * Math.PI * 2;
    miniMesh.position.set(Math.cos(a) * 0.095, 0.06, Math.sin(a) * 0.095);
    handInventoryCarouselGroup.add(miniMesh);
  }

  return {
    rootGroup,
    grabbableObjects,
    heldObject: null,
    bloodDecals: [],
    arterialParticles: [],
    acousticWaves: [],
    handInventoryCarouselGroup,
    meleeSwingTimer: 0,
    meleeSwingDuration: 0.38,
    lastCombatEventBanner:
      'Press [E] to Grab World Objects/Limbs · [1-6] Infuse Base Element · [Click/F] Dismember Strike · [Q] Hurl Object',
  };
}

export function grabOrDropWorldObject(
  rig: VisceralCombatAndGrabRig,
  playerPos: THREE.Vector3,
  playerForward: THREE.Vector3,
  maxReach: number = 6.5,
  activeElement: BaseDimensionalElementId = 'lithic-crystalline'
): GrabbableWorldObject | null {
  // If already holding an object, drop it gently in front of player
  if (rig.heldObject) {
    const dropped = rig.heldObject;
    dropped.isHeldByPlayer = false;
    dropped.isThrownProjectile = false;
    dropped.pos
      .copy(playerPos)
      .add(new THREE.Vector3(0, 1.1, 0))
      .addScaledVector(playerForward, 1.2);
    dropped.vel.copy(playerForward).multiplyScalar(3.5);
    rig.heldObject = null;
    rig.lastCombatEventBanner = `Dropped ${dropped.name}`;
    return null;
  }

  // Find closest available object within reach
  let bestObj: GrabbableWorldObject | null = null;
  let bestScore = Infinity;

  for (const obj of rig.grabbableObjects) {
    if (obj.isHeldByPlayer) continue;
    const dist = obj.pos.distanceTo(playerPos);
    if (dist <= maxReach) {
      const toObj = new THREE.Vector3().subVectors(obj.pos, playerPos).normalize();
      const align = playerForward.dot(toObj);
      const score = dist * (1.35 - align * 0.5);
      if (score < bestScore) {
        bestScore = score;
        bestObj = obj;
      }
    }
  }

  if (bestObj) {
    bestObj.isHeldByPlayer = true;
    bestObj.isThrownProjectile = false;
    infuseObjectWithBaseElement(bestObj, activeElement);
    rig.heldObject = bestObj;
    harmonicSoundscape.triggerChime(2, 0.55);
    rig.lastCombatEventBanner = `Grabbed ${bestObj.name} (Infused with ${(BASE_DIMENSIONAL_ELEMENTS[activeElement] ?? BASE_DIMENSIONAL_ELEMENTS['lithic-crystalline']).shortName})`;
    return bestObj;
  }

  return null;
}

export function infuseObjectWithBaseElement(
  obj: GrabbableWorldObject,
  elementId: BaseDimensionalElementId
) {
  obj.infusedElement = elementId;
  const spec =
    BASE_DIMENSIONAL_ELEMENTS[elementId] ??
    BASE_DIMENSIONAL_ELEMENTS['lithic-crystalline'];
  obj.mesh.traverse((ch) => {
    if (ch instanceof THREE.Mesh && ch.userData.isInfusableBlade) {
      const mat = ch.material as THREE.MeshStandardMaterial;
      mat.color.set(spec.colorHex);
      mat.emissive.set(spec.emissiveHex);
      mat.emissiveIntensity = 1.1;
    }
  });
}

export function throwHeldWorldObject(
  rig: VisceralCombatAndGrabRig,
  playerPos: THREE.Vector3,
  playerForward: THREE.Vector3,
  throwForceMultiplier: number = 1.0
): boolean {
  const held = rig.heldObject;
  if (!held) return false;

  held.isHeldByPlayer = false;
  held.isThrownProjectile = true;
  held.pos
    .copy(playerPos)
    .add(new THREE.Vector3(0, 1.45, 0))
    .addScaledVector(playerForward, 0.9);
  held.vel
    .copy(playerForward)
    .multiplyScalar(32 * throwForceMultiplier)
    .add(new THREE.Vector3(0, 3.2, 0));

  rig.heldObject = null;
  rig.meleeSwingTimer = rig.meleeSwingDuration;
  harmonicSoundscape.triggerArchitecturalChord(1);
  rig.lastCombatEventBanner = `Hurled ${held.name} along ballistic trajectory!`;
  return true;
}

export function spawnArterialGoreAndDismemberment(params: {
  rig: VisceralCombatAndGrabRig;
  targetEntity: ArticulatedRagdollEntity;
  hitPos: THREE.Vector3;
  strikeDir: THREE.Vector3;
  activeElement: BaseDimensionalElementId;
  forceSeverLimb: boolean;
  evalHeight: (x: number, z: number) => number;
}): {
  didSeverLimb: boolean;
  severedPartName: string;
} {
  const {
    rig,
    targetEntity,
    hitPos,
    strikeDir,
    activeElement,
    forceSeverLimb,
    evalHeight,
  } = params;
  const elemSpec =
    BASE_DIMENSIONAL_ELEMENTS[activeElement] ??
    BASE_DIMENSIONAL_ELEMENTS['lithic-crystalline'];

  // 1. Spawn 14 Directional Arterial Blood / Matter-State Ichor Spray Particles
  const bloodColor =
    activeElement === 'bio-miasmic'
      ? '#10b981'
      : activeElement === 'hydro-superfluid'
      ? '#06b6d4'
      : activeElement === 'chrono-phase'
      ? '#a855f7'
      : '#dc2626';

  for (let p = 0; p < 14; p++) {
    const dropGeo = new THREE.DodecahedronGeometry(
      0.06 + Math.random() * 0.06,
      0
    );
    const dropMat = new THREE.MeshStandardMaterial({
      color: bloodColor,
      emissive: elemSpec.emissiveHex,
      emissiveIntensity: 0.45,
      roughness: 0.2,
    });
    const dropMesh = new THREE.Mesh(dropGeo, dropMat);
    dropMesh.position.copy(hitPos);
    rig.rootGroup.add(dropMesh);

    const spreadVel = strikeDir
      .clone()
      .multiplyScalar(6 + Math.random() * 8)
      .add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 7,
          3.5 + Math.random() * 5.5,
          (Math.random() - 0.5) * 7
        )
      );

    rig.arterialParticles.push({
      mesh: dropMesh,
      pos: hitPos.clone(),
      vel: spreadVel,
      age: 0,
      maxAge: 0.85 + Math.random() * 0.5,
      colorHex: bloodColor,
      matterState: activeElement,
    });
  }

  // 2. Spawn Persistent Ground Blood & Matter-State Splatter Decal under the wound
  if (rig.bloodDecals.length > 28) {
    const oldest = rig.bloodDecals.shift();
    if (oldest) rig.rootGroup.remove(oldest.mesh);
  }
  const groundY = evalHeight(hitPos.x, hitPos.z);
  const decalGroup = new THREE.Group();
  decalGroup.position.set(hitPos.x, groundY + 0.03, hitPos.z);

  const poolMesh = new THREE.Mesh(
    new THREE.CircleGeometry(0.65 + Math.random() * 0.55, 14),
    new THREE.MeshStandardMaterial({
      color: '#7f1d1d',
      emissive: bloodColor,
      emissiveIntensity: 0.25,
      roughness: 0.15,
      metalness: 0.35,
      side: THREE.DoubleSide,
    })
  );
  poolMesh.rotation.x = -Math.PI / 2;
  decalGroup.add(poolMesh);

  // Dimension-reactive gore crystal spikes or spore pustules rising from the blood pool!
  if (
    activeElement === 'lithic-crystalline' ||
    activeElement === 'chrono-phase' ||
    activeElement === 'pyro-vitreous'
  ) {
    for (let s = 0; s < 3; s++) {
      const shard = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.42, 5),
        new THREE.MeshStandardMaterial({
          color: elemSpec.colorHex,
          emissive: bloodColor,
          emissiveIntensity: 0.7,
          roughness: 0.1,
        })
      );
      shard.position.set(
        (Math.random() - 0.5) * 0.5,
        0.18,
        (Math.random() - 0.5) * 0.5
      );
      shard.rotation.set(
        (Math.random() - 0.5) * 0.5,
        0,
        (Math.random() - 0.5) * 0.5
      );
      decalGroup.add(shard);
    }
  }
  rig.rootGroup.add(decalGroup);
  rig.bloodDecals.push({
    mesh: decalGroup,
    pos: new THREE.Vector3(hitPos.x, groundY, hitPos.z),
    age: 0,
    matterState: activeElement,
  });

  // 3. Dynamic Limb Severance / Dismemberment
  let didSeverLimb = false;
  let severedPartName = '';

  const intactLimb = targetEntity.limbs.find((l) => l.tendonIntegrity > 0.15);
  if (intactLimb && (forceSeverLimb || Math.random() < 0.75)) {
    intactLimb.tendonIntegrity = 0.0;
    intactLimb.upperMesh.visible = false;
    intactLimb.lowerMesh.visible = false;
    didSeverLimb = true;
    severedPartName = `${targetEntity.blueprint.name.split(' ')[0]} Severed Limb #${
      intactLimb.legIndex + 1
    }`;

    // Attach an exposed Anatomical Bone & Arterial Stump onto the creature's pelvis/torso
    const stumpGroup = new THREE.Group();
    const fleshRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 0.14, 10),
      new THREE.MeshStandardMaterial({
        color: '#991b1b',
        emissive: '#dc2626',
        emissiveIntensity: 0.5,
        roughness: 0.3,
      })
    );
    stumpGroup.add(fleshRing);
    const boneStick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.26, 8),
      new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3 })
    );
    boneStick.position.y = -0.1;
    stumpGroup.add(boneStick);
    targetEntity.pelvisMesh.add(stumpGroup);

    // Spawn a Grabbable Physical 3D Severed Creature Limb on the ground!
    const limbMesh = buildImprovisedWeaponMesh(
      'severed-creature-limb',
      targetEntity.blueprint.jointGlowColor
    );
    limbMesh.position.copy(hitPos);
    rig.rootGroup.add(limbMesh);

    rig.grabbableObjects.push({
      id: `severed-limb-${Date.now()}-${Math.floor(Math.random() * 999)}`,
      kind: 'severed-creature-limb',
      name: severedPartName,
      mesh: limbMesh,
      pos: hitPos.clone(),
      vel: strikeDir
        .clone()
        .multiplyScalar(5.5)
        .add(new THREE.Vector3(0, 5.0, 0)),
      massKg: 5.0,
      baseDamage: 0.52,
      cleaveChance: 0.85,
      durability: 5,
      maxDurability: 5,
      infusedElement: activeElement,
      isHeldByPlayer: false,
      isThrownProjectile: false,
      sourceCreatureName: targetEntity.blueprint.name,
    });
  }

  return { didSeverLimb, severedPartName };
}

export function spawnAcousticStealthWave(
  rig: VisceralCombatAndGrabRig,
  origin: THREE.Vector3,
  maxRadius: number,
  colorHex: string = '#38bdf8'
) {
  const ringGeo = new THREE.RingGeometry(0.35, 0.55, 28);
  const ringMat = new THREE.MeshBasicMaterial({
    color: colorHex,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  });
  const mesh = new THREE.Mesh(ringGeo, ringMat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(origin.x, origin.y + 0.18, origin.z);
  rig.rootGroup.add(mesh);

  rig.acousticWaves.push({
    mesh,
    origin: origin.clone(),
    radius: 0.5,
    maxRadius,
    age: 0,
    maxAge: 0.95,
  });
}

export function updateVisceralCombatAndGrabRig(params: {
  rig: VisceralCombatAndGrabRig;
  playerPos: THREE.Vector3;
  playerYaw: number;
  playerPitch: number;
  cameraPos: THREE.Vector3;
  cameraMode: string;
  entities: ArticulatedRagdollEntity[];
  activeElement: BaseDimensionalElementId;
  evalHeight: (x: number, z: number) => number;
  onSeveranceXP: (xpGain: number, banner: string, entityId: string) => void;
  nowSec: number;
  dt: number;
}) {
  const {
    rig,
    playerPos,
    playerYaw,
    playerPitch,
    cameraPos,
    cameraMode,
    entities,
    activeElement,
    evalHeight,
    onSeveranceXP,
    nowSec,
    dt,
  } = params;

  if (rig.meleeSwingTimer > 0) {
    rig.meleeSwingTimer = Math.max(0, rig.meleeSwingTimer - dt);
  }

  // Rotate 3D Hand Inventory Carousel items when visible
  if (rig.handInventoryCarouselGroup.visible) {
    rig.handInventoryCarouselGroup.rotation.y = nowSec * 1.4;
    rig.handInventoryCarouselGroup.children.forEach((ch, idx) => {
      ch.rotation.x = nowSec * 2.2 + idx;
      ch.rotation.z = nowSec * 1.7;
    });
  }

  const forward = new THREE.Vector3(
    -Math.sin(playerYaw) * Math.cos(playerPitch),
    Math.sin(playerPitch),
    -Math.cos(playerYaw) * Math.cos(playerPitch)
  ).normalize();
  const right = new THREE.Vector3(
    Math.cos(playerYaw),
    0,
    -Math.sin(playerYaw)
  ).normalize();

  // 1. Update Grabbable & Thrown Objects
  for (let i = rig.grabbableObjects.length - 1; i >= 0; i--) {
    const obj = rig.grabbableObjects[i];

    if (obj.isHeldByPlayer) {
      const swingPhase =
        rig.meleeSwingTimer > 0
          ? Math.sin(
              (1 - rig.meleeSwingTimer / rig.meleeSwingDuration) * Math.PI
            )
          : 0;

      if (cameraMode === 'first-person') {
        const holdPos = cameraPos
          .clone()
          .addScaledVector(forward, 0.62 + swingPhase * 0.35)
          .addScaledVector(right, -0.32 + swingPhase * 0.28)
          .add(new THREE.Vector3(0, -0.22 - swingPhase * 0.12, 0));
        obj.pos.copy(holdPos);
        obj.mesh.position.copy(holdPos);
        obj.mesh.rotation.set(
          playerPitch - 0.35 - swingPhase * 1.35,
          playerYaw - swingPhase * 0.85,
          0.2 - swingPhase * 0.65
        );
      } else {
        const holdPos = playerPos
          .clone()
          .add(new THREE.Vector3(0, 1.25, 0))
          .addScaledVector(forward, 0.72 + swingPhase * 0.45)
          .addScaledVector(right, -0.44 + swingPhase * 0.35);
        obj.pos.copy(holdPos);
        obj.mesh.position.copy(holdPos);
        obj.mesh.rotation.set(
          -0.4 - swingPhase * 1.4,
          playerYaw - swingPhase * 0.9,
          0
        );
      }
      continue;
    }

    // Physics step for free or thrown world objects
    const gY = evalHeight(obj.pos.x, obj.pos.z);
    if (obj.pos.y > gY + 0.18 || obj.vel.lengthSq() > 0.05) {
      obj.vel.y -= 18.5 * dt;
      obj.pos.addScaledVector(obj.vel, dt);

      if (obj.pos.y <= gY + 0.16) {
        obj.pos.y = gY + 0.16;
        if (obj.isThrownProjectile) {
          obj.isThrownProjectile = false;
          // Emit acoustic stealth distraction wave where the thrown object lands!
          spawnAcousticStealthWave(rig, obj.pos, 18.0, '#f59e0b');
          // Lure nearby unaware/suspicious AI entities toward the noise impact!
          for (const ent of entities) {
            if (ent.particles[0].pos.distanceTo(obj.pos) < 22) {
              const dx = obj.pos.x - ent.particles[0].pos.x;
              const dz = obj.pos.z - ent.particles[0].pos.z;
              ent.targetHeading = Math.atan2(dx, dz);
              ent.activeBehaviorLabel = 'Investigating Thrown Object Sound';
            }
          }
        }
        obj.vel.y = Math.abs(obj.vel.y) * 0.28;
        obj.vel.x *= 0.65;
        obj.vel.z *= 0.65;
      }

      obj.mesh.position.copy(obj.pos);
      if (obj.isThrownProjectile) {
        obj.mesh.rotation.x += dt * 14;
        obj.mesh.rotation.z += dt * 9;

        // Check thrown weapon collision with any entity!
        for (const ent of entities) {
          const torsoPos = ent.particles[1].pos;
          if (obj.pos.distanceTo(torsoPos) < 1.55) {
            obj.isThrownProjectile = false;
            obj.vel.multiplyScalar(-0.25);
            const elem = obj.infusedElement ?? activeElement;
            const elemSpec = BASE_DIMENSIONAL_ELEMENTS[elem];
            const impulse = forward
              .clone()
              .multiplyScalar(26 * elemSpec.damageMultiplier)
              .add(new THREE.Vector3(0, 9.5, 0));

            ent.applyInternalGoreTrauma(
              'laceration-hemorrhage',
              obj.baseDamage * elemSpec.damageMultiplier,
              impulse,
              playerPos
            );

            const { didSeverLimb, severedPartName } =
              spawnArterialGoreAndDismemberment({
                rig,
                targetEntity: ent,
                hitPos: torsoPos.clone(),
                strikeDir: forward,
                activeElement: elem,
                forceSeverLimb: true,
                evalHeight,
              });

            const msg = didSeverLimb
              ? `BALLISTIC IMPALE DISMEMBERMENT! Severed ${severedPartName} with ${obj.name} (+2 Deviance XP)`
              : `Ballistic Strike on ${ent.blueprint.name} with ${obj.name} (+1 Deviance XP)`;
            rig.lastCombatEventBanner = msg;
            onSeveranceXP(didSeverLimb ? 2 : 1, msg, ent.id);
            break;
          }
        }
      }
    } else {
      // Gentle idle hover glow so grabbable weapons are visually readable
      obj.mesh.position.set(
        obj.pos.x,
        gY + 0.16 + Math.sin(nowSec * 2.5 + i) * 0.03,
        obj.pos.z
      );
    }
  }

  // 2. Step Arterial Blood Spray Particles
  for (let i = rig.arterialParticles.length - 1; i >= 0; i--) {
    const p = rig.arterialParticles[i];
    p.age += dt;
    p.vel.y -= 16.0 * dt;
    p.pos.addScaledVector(p.vel, dt);
    p.mesh.position.copy(p.pos);
    if (p.age >= p.maxAge) {
      rig.rootGroup.remove(p.mesh);
      p.mesh.geometry.dispose();
      (p.mesh.material as THREE.Material).dispose();
      rig.arterialParticles.splice(i, 1);
    }
  }

  // 3. Step Acoustic Noise Waves
  for (let i = rig.acousticWaves.length - 1; i >= 0; i--) {
    const w = rig.acousticWaves[i];
    w.age += dt;
    const prog = w.age / w.maxAge;
    const s = 1 + prog * w.maxRadius;
    w.mesh.scale.set(s, s, 1);
    (w.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - prog) * 0.75;
    if (w.age >= w.maxAge) {
      rig.rootGroup.remove(w.mesh);
      w.mesh.geometry.dispose();
      (w.mesh.material as THREE.Material).dispose();
      rig.acousticWaves.splice(i, 1);
    }
  }
}
