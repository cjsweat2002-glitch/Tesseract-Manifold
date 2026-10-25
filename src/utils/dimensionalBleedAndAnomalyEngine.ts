import * as THREE from 'three';
import {
  ManifoldWorldSpec,
  PlacedWorldBuilding,
  TerrainExcavationSpot,
  WorldTopologyArchetype,
} from '../types/manifold';
import { evaluateTerrainHeight } from './manifoldGenerator';
import { prepareDeformableSkinGeometry } from './skinTopologyEngine';
import {
  buildScarpaSteppedCorbelGroup,
  createCalabiYauRosetteGeometry,
  createDifferentialGrowthRibbonGeometry,
  createHyperbolicPseudosphereGeometry,
  createTPMSGyroidShellGeometry,
} from './architecturalWisdomEngine';

export {
  buildScarpaSteppedCorbelGroup,
  createCalabiYauRosetteGeometry,
  createDifferentialGrowthRibbonGeometry,
  createHyperbolicPseudosphereGeometry,
  createTPMSGyroidShellGeometry,
};

/**
 * ============================================================================
 * DIMENSIONAL BLEED, IMPLICIT SMIN MESH SYNTHESIS, ABSTRACT ART TOPOLOGY &
 * CREEPYPASTA / ANOMALOUS BEHAVIORAL OBJECTS ENGINE
 * ============================================================================
 * Synthesizes:
 * 1. Video Game Compute Wisdom (1980s-2020s):
 *    - Jim Blinn / Spore (2008) / Dreams (2020) Smooth-Minimum (smin) Implicit
 *      Metaball & Negative-Cavity Boolean Field Meshes
 *    - Rain World (2017) & Shadow of the Colossus Procedural Stalk/Tentacle IK
 * 2. Abstract Art Library Topologies:
 *    - Barbara Hepworth Pierced Biomorphic Monoliths (smooth negative ovoid cavities)
 *    - Naum Gabo Constructivist Ruled-Surface Stringed Hyperboloids
 *    - Umberto Boccioni "Unique Forms of Continuity in Space" Velocity-Wake Fins
 *    - Zdzisław Beksiński / H.R. Giger Trabecular Bone-Cathedral Lattices
 * 3. Creepypasta / Anomalous Behavioral Objects (with Gradients of Originality):
 *    - Quantum Observation-Locked Weeping Monolith (moves only outside camera FOV)
 *    - Monument Mythos "Special Tree" (bends at non-Euclidean lightning angles)
 *    - Mystery Flesh Pit Bronchial Superorganism Vent (peristaltic breathing & smin tendrils)
 *    - Siren-Babel Utility Pylon (familiar sandbox basis -> acoustic Chladni broadcaster)
 *    - House of Leaves Impossible Threshold (view-dependent interior depth dilation)
 *    - Boccioni-Matta Morphogenesis Totem (aesthetically evolves its 3D mesh over time)
 * 4. Worldspace Form-Bleed & Separation Field:
 *    - Bleeds nearby world forms together via viscous catenoid smin bridges in
 *      Coalescence Zones, and cleaves them apart with floating fracture shards in
 *      Schism Zones depending on thematic location & 4D W-coordinate.
 */

export type AnomalousBehaviorArchetype =
  | 'quantum-weeping-hepworth-monolith'
  | 'monument-mythos-special-tree'
  | 'flesh-pit-bronchial-geyser'
  | 'siren-babel-utility-pylon'
  | 'house-of-leaves-impossible-threshold'
  | 'boccioni-matta-coalescence-totem';

export interface AnomalousObjectCatalogMeta {
  archetype: AnomalousBehaviorArchetype;
  title: string;
  sandboxBasisLabel: string;
  originalityGradient: number; // 0.0 (General Sandbox Basis) -> 1.0 (Pure Avant-Garde Anomaly)
  artAndGameLineage: string;
  creepypastaBehavioralLaw: string;
  spatialBleedRelationship: string;
  accentHex: string;
}

export const ANOMALOUS_OBJECT_CATALOG: Record<
  AnomalousBehaviorArchetype,
  AnomalousObjectCatalogMeta
> = {
  'siren-babel-utility-pylon': {
    archetype: 'siren-babel-utility-pylon',
    title: 'Acoustic Siren-Loom Utility Pylon',
    sandboxBasisLabel: 'Grounded Sandbox Utility Truss (Gradient 0.42)',
    originalityGradient: 0.42,
    artAndGameLineage:
      'Half-Life 2 Industrial Trusses × Umberto Boccioni Velocity Fins',
    creepypastaBehavioralLaw:
      'Tracks the fastest moving organism with its upper hyperbolic horns and projects standing Chladni acoustic rings that entrain nearby limb cadences.',
    spatialBleedRelationship:
      'Anchors conductive Naum Gabo wire-tethers to nearby buildings and monoliths.',
    accentHex: '#f59e0b',
  },
  'quantum-weeping-hepworth-monolith': {
    archetype: 'quantum-weeping-hepworth-monolith',
    title: 'Observation-Locked Pierced Monolith',
    sandboxBasisLabel: 'Sculpted Survey Cairn → Quantum Anomaly (Gradient 0.68)',
    originalityGradient: 0.68,
    artAndGameLineage:
      'Barbara Hepworth Pierced Forms × SCP-173 / Outer Wilds Quantum Moon',
    creepypastaBehavioralLaw:
      'Strictly frozen in stone while inside the player camera frustum (cos θ > 0.36). When unobserved, it steps silently across the terrain and rotates its pierced ocular cavity toward your back.',
    spatialBleedRelationship:
      'Extrudes smooth-minimum (smin) calcified marrow bridges to whichever landmark it stalks beside.',
    accentHex: '#e2e8f0',
  },
  'monument-mythos-special-tree': {
    archetype: 'monument-mythos-special-tree',
    title: 'Non-Euclidean Special Dendrite Spire',
    sandboxBasisLabel: 'Petrified Flora → Dimensional Conduit (Gradient 0.78)',
    originalityGradient: 0.78,
    artAndGameLineage:
      'Monument Mythos Special Trees × Naum Gabo Stringed Hyperboloids',
    creepypastaBehavioralLaw:
      'Appears as a stark petrified lightning-tree until W-phase or player proximity triggers a 45° non-Euclidean arc-snap, inverting its canopy and discharging interdimensional metric arcs.',
    spatialBleedRelationship:
      'Cleaves local space during arc-snaps, separating nearby forms into floating schism shards.',
    accentHex: '#a855f7',
  },
  'flesh-pit-bronchial-geyser': {
    archetype: 'flesh-pit-bronchial-geyser',
    title: 'Permian Bronchial Superorganism Vent',
    sandboxBasisLabel: 'Geothermal Fumarole → Living Alveoli (Gradient 0.84)',
    originalityGradient: 0.84,
    artAndGameLineage:
      'Mystery Flesh Pit National Park × Spore (2008) Implicit Metaballs & Beksiński',
    creepypastaBehavioralLaw:
      'Breathes with a deep peristaltic tidal rhythm. Dilates its smooth-minimum metaball orifices when approached, extending a symbiotic catenoid tendril and thermal updraft.',
    spatialBleedRelationship:
      'Viscously fuses its lower metaball roots into surrounding terrain craters and nearby entities.',
    accentHex: '#f43f5e',
  },
  'house-of-leaves-impossible-threshold': {
    archetype: 'house-of-leaves-impossible-threshold',
    title: '5½-Minute Non-Euclidean Threshold',
    sandboxBasisLabel: 'Freestanding Doorway → Impossible Corridor (Gradient 0.89)',
    originalityGradient: 0.89,
    artAndGameLineage:
      'House of Leaves / Antichamber (2013) × Carlo Scarpa Portal Joinery',
    creepypastaBehavioralLaw:
      'Paper-thin from the side, but looking directly through its aperture dilates its interior depth into a telescopic non-Euclidean hallway. Walking through phase-shifts local W-momentum.',
    spatialBleedRelationship:
      'Folds worldspace distance between itself and the nearest Placed Building.',
    accentHex: '#38bdf8',
  },
  'boccioni-matta-coalescence-totem': {
    archetype: 'boccioni-matta-coalescence-totem',
    title: 'Boccioni-Matta Aesthetic Evolution Nucleus',
    sandboxBasisLabel: 'Pure Avant-Garde Morphogenesis Seed (Gradient 0.97)',
    originalityGradient: 0.97,
    artAndGameLineage:
      'Umberto Boccioni × Roberto Matta × Demoscene 64k Implicit SDF Morphing',
    creepypastaBehavioralLaw:
      'Continuously evolves its 3D mesh topology across 4 aesthetic stages as player action time, excavations, and W-shifts accumulate.',
    spatialBleedRelationship:
      'Generates multi-way smooth-minimum (smin) form-bleed bridges that fuse nearby entities and landmarks into a shared visual symphony.',
    accentHex: '#10b981',
  },
};

export const ALL_ANOMALOUS_ARCHETYPES: AnomalousBehaviorArchetype[] = [
  'siren-babel-utility-pylon',
  'quantum-weeping-hepworth-monolith',
  'monument-mythos-special-tree',
  'flesh-pit-bronchial-geyser',
  'house-of-leaves-impossible-threshold',
  'boccioni-matta-coalescence-totem',
];

/**
 * Inigo Quilez Polynomial Smooth-Minimum (smin) for organic implicit surface blending:
 * Smoothly merges two signed distance fields a and b with blending radius k.
 */
export function sminPolynomial(a: number, b: number, k: number): number {
  const h = Math.max(k - Math.abs(a - b), 0.0) / Math.max(0.0001, k);
  return Math.min(a, b) - h * h * k * 0.25;
}

/**
 * Smooth-Maximum (smax) for carving smooth Barbara Hepworth / Beksiński hollow cavities
 * out of an implicit solid field.
 */
export function smaxPolynomial(a: number, b: number, k: number): number {
  return -sminPolynomial(-a, -b, k);
}

/**
 * 1. SPORE (2008) / JIM BLINN IMPLICIT METABALL & BARBARA HEPWORTH PIERCED CAVITY GEOMETRY
 * Evaluates a multi-lobe smooth-minimum (smin) scalar field with negative carving spheres
 * to sculpt organic biomorphic masses pierced by smooth topological apertures.
 */
export function createImplicitMetaballPiercedGeometry(
  baseRadius: number = 1.15,
  heightScale: number = 1.65,
  seed: number = 101,
  piercedCavityDepth: number = 0.68
): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(baseRadius, 30, 24);
  const pos = geo.attributes.position as THREE.BufferAttribute;

  // Deterministic lobes based on seed
  const s1 = ((seed % 17) / 17) * Math.PI * 2;
  const s2 = (((seed >> 4) % 19) / 19) * Math.PI * 2;

  const positiveLobes = [
    new THREE.Vector3(0, -0.35 * baseRadius, 0),
    new THREE.Vector3(
      Math.cos(s1) * 0.38 * baseRadius,
      0.28 * baseRadius,
      Math.sin(s1) * 0.25 * baseRadius
    ),
    new THREE.Vector3(
      Math.cos(s2) * -0.34 * baseRadius,
      0.08 * baseRadius,
      Math.sin(s2) * 0.32 * baseRadius
    ),
  ];

  // Barbara Hepworth Negative Piercing Cavity Center (carves a smooth concave tunnel/oculus)
  const cavityCenter = new THREE.Vector3(0, 0.18 * baseRadius, 0);

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const p = new THREE.Vector3(vx, vy, vz);
    const dir = p.clone().normalize();

    // Evaluate smooth-minimum (smin) union of positive metaball lobes
    let dPositive = 999;
    for (let l = 0; l < positiveLobes.length; l++) {
      const distToLobe = p.distanceTo(positiveLobes[l]) - baseRadius * (0.62 - l * 0.08);
      dPositive =
        l === 0
          ? distToLobe
          : sminPolynomial(dPositive, distToLobe, baseRadius * 0.55);
    }

    // Evaluate smooth-maximum (smax) subtraction for the Barbara Hepworth pierced aperture along Z
    const radialFromCavityZ = Math.hypot(
      vx - cavityCenter.x,
      vy - cavityCenter.y
    );
    const cavityTunnelSDF = radialFromCavityZ - baseRadius * 0.36;

    // Combine positive metaball body with negative pierced tunnel
    const combinedField = smaxPolynomial(
      dPositive,
      -cavityTunnelSDF * piercedCavityDepth,
      baseRadius * 0.35
    );

    // Displace vertex along radial normal and apply Beksiński trabecular fluting
    const trabFlute =
      0.06 *
      baseRadius *
      Math.sin(vx * 6.5 + vy * 4.2) *
      Math.cos(vz * 6.5 - vy * 3.8);

    const newRadius = Math.max(
      baseRadius * 0.22,
      baseRadius - combinedField * 0.48 + trabFlute
    );

    // Pinch Z tightly inside the pierced eye-cavity so the hole is unmistakably sculptural
    const zPinch =
      radialFromCavityZ < baseRadius * 0.42
        ? 0.22 + 0.78 * (radialFromCavityZ / (baseRadius * 0.42))
        : 1.0;

    pos.setXYZ(
      i,
      dir.x * newRadius,
      dir.y * newRadius * heightScale,
      dir.z * newRadius * zPinch
    );
  }

  geo.computeVertexNormals();
  return prepareDeformableSkinGeometry(geo);
}

/**
 * 2. NAUM GABO CONSTRUCTIVIST STRINGED RULED-SURFACE HYPERBOLOID RIG
 * Creates a curved 3D hyperbolic/saddle surface entirely out of taut intersecting
 * straight strings between skewed structural arcs (inspired by Naum Gabo's
 * "Linear Construction in Space No. 2" & 1980s vector arcade compute wisdom).
 */
export function buildNaumGaboStringedConstructGroup(
  radius: number,
  height: number,
  arg3: number | string = 16,
  arg4: number | string = 2.1,
  arg5?: THREE.Material | number,
  arg6?: string
): THREE.Group {
  const group = new THREE.Group();

  const isColorOverload = typeof arg3 === 'string';
  const stringCount = isColorOverload
    ? typeof arg5 === 'number'
      ? arg5
      : 16
    : (arg3 as number);
  const twistAngle = isColorOverload ? 2.15 : (arg4 as number);
  const stringColorHex = isColorOverload
    ? (arg4 as string)
    : arg6 ?? '#38bdf8';
  const frameMat: THREE.Material =
    !isColorOverload && arg5 instanceof THREE.Material
      ? arg5
      : new THREE.MeshStandardMaterial({
          color: new THREE.Color(isColorOverload ? (arg3 as string) : '#94a3b8'),
          emissive: new THREE.Color(stringColorHex),
          emissiveIntensity: 0.35,
          metalness: 0.78,
          roughness: 0.22,
        });

  // Top & Bottom Skewed Differential Growth Structural Arcs (replaces raw TorusGeometry)
  const botRing = new THREE.Mesh(
    createDifferentialGrowthRibbonGeometry(radius, radius * 0.14, 7, 0.22),
    frameMat
  );
  botRing.rotation.x = 0.22;
  botRing.position.y = -height * 0.5;
  group.add(botRing);

  const topRing = new THREE.Mesh(
    createDifferentialGrowthRibbonGeometry(radius * 0.88, radius * 0.14, 7, 0.22),
    frameMat
  );
  topRing.rotation.x = -0.22;
  topRing.position.y = height * 0.5;
  group.add(topRing);

  // Intersecting Ruled-Surface Strings (Dual-Familia Hyperboloid of One Sheet)
  const positions = new Float32Array(stringCount * 4 * 3);
  let ptr = 0;

  for (let i = 0; i < stringCount; i++) {
    const a0 = (i / stringCount) * Math.PI * 2;
    const a1 = a0 + twistAngle;
    const a2 = a0 - twistAngle;

    const x0 = Math.cos(a0) * radius;
    const z0 = Math.sin(a0) * radius;
    const y0 = -height * 0.5 + Math.sin(a0) * radius * 0.22;

    // Family +1 ruled line
    const x1 = Math.cos(a1) * radius * 0.88;
    const z1 = Math.sin(a1) * radius * 0.88;
    const y1 = height * 0.5 - Math.sin(a1) * radius * 0.2;

    positions[ptr++] = x0;
    positions[ptr++] = y0;
    positions[ptr++] = z0;
    positions[ptr++] = x1;
    positions[ptr++] = y1;
    positions[ptr++] = z1;

    // Family -1 counter-ruled line
    const x2 = Math.cos(a2) * radius * 0.88;
    const z2 = Math.sin(a2) * radius * 0.88;
    const y2 = height * 0.5 - Math.sin(a2) * radius * 0.2;

    positions[ptr++] = x0;
    positions[ptr++] = y0;
    positions[ptr++] = z0;
    positions[ptr++] = x2;
    positions[ptr++] = y2;
    positions[ptr++] = z2;
  }

  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(stringColorHex),
    transparent: true,
    opacity: 0.72,
  });
  const stringedSurface = new THREE.LineSegments(lineGeo, lineMat);
  group.add(stringedSurface);

  return group;
}

/**
 * 3. UMBERTO BOCCIONI "UNIQUE FORMS OF CONTINUITY IN SPACE" VELOCITY-WAKE GEOMETRY
 * Sweeps aerodynamic bronze/aether flutter-fins that crystallize momentum trajectories into 3D form.
 */
export function createBoccioniSpatialContinuityGeometry(
  scale: number = 1.0
): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(
    0.28 * scale,
    0.58 * scale,
    2.2 * scale,
    24,
    20,
    false
  );
  const pos = geo.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);

    const theta = Math.atan2(vz, vx);
    const yNorm = (vy + 1.1 * scale) / (2.2 * scale);

    // Forward lunging S-curve stride + trailing aerodynamic wake fins
    const forwardSweep = Math.sin(yNorm * Math.PI * 1.35) * 0.42 * scale;
    const wakeFlutter =
      vz < 0
        ? Math.pow(Math.abs(Math.sin(theta * 3 + yNorm * 5)), 1.6) *
          0.65 *
          scale
        : 0.12 * scale * Math.cos(theta * 4);

    pos.setXYZ(
      i,
      vx * (1.0 + 0.35 * Math.sin(yNorm * Math.PI * 2)),
      vy,
      vz + forwardSweep - wakeFlutter
    );
  }

  geo.computeVertexNormals();
  return prepareDeformableSkinGeometry(geo);
}

/**
 * 4. LIVE ANOMALOUS BEHAVIORAL OBJECT INSTANCE IN THE 3D WORLDSPACE
 */
export interface AnomalousObjectInstance {
  id: string;
  archetype: AnomalousBehaviorArchetype;
  meta: AnomalousObjectCatalogMeta;
  rootGroup: THREE.Group;
  upperArticulatedPart: THREE.Group;
  innerPortalOrCore: THREE.Object3D;
  position: THREE.Vector3;
  basePosition: THREE.Vector3;
  targetPosition: THREE.Vector3;
  yaw: number;
  isObservationLocked: boolean;
  cameraCosAngle: number;
  aestheticEvolutionStage: number; // 1.0 -> 4.0 continuous aesthetic evolution
  behaviorPhase: number;
  activeStatusLabel: string;
}

/**
 * Builds the 3D Mesh Hierarchy for an Anomalous Behavioral Object
 */
export function buildAnomalousBehavioralObject(
  id: string,
  archetype: AnomalousBehaviorArchetype,
  pos: THREE.Vector3,
  world: ManifoldWorldSpec,
  seed: number
): AnomalousObjectInstance {
  const meta = ANOMALOUS_OBJECT_CATALOG[archetype];
  const rootGroup = new THREE.Group();
  rootGroup.position.copy(pos);

  const primaryMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(world.palette.terrainMid).lerp(
      new THREE.Color('#e2e8f0'),
      0.45
    ),
    metalness: 0.58,
    roughness: 0.28,
    clearcoat: 0.72,
  });

  const darkTectonicMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#111827'),
    metalness: 0.82,
    roughness: 0.32,
  });

  const accentGlowMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(meta.accentHex),
    emissive: new THREE.Color(meta.accentHex),
    emissiveIntensity: 0.75,
    metalness: 0.45,
    roughness: 0.18,
    clearcoat: 0.9,
  });

  const upperArticulatedPart = new THREE.Group();
  rootGroup.add(upperArticulatedPart);

  let innerPortalOrCore: THREE.Object3D = new THREE.Group();

  if (archetype === 'quantum-weeping-hepworth-monolith') {
    // Barbara Hepworth Pierced Biomorphic Monolith
    const piercedGeo = createImplicitMetaballPiercedGeometry(
      1.25,
      1.75,
      seed,
      0.85
    );
    const monolithMesh = new THREE.Mesh(piercedGeo, primaryMat);
    monolithMesh.position.y = 1.95;
    monolithMesh.castShadow = true;
    monolithMesh.receiveShadow = true;
    upperArticulatedPart.add(monolithMesh);

    // Naum Gabo Strings threaded right through the pierced ocular cavity!
    const cavityStrings = buildNaumGaboStringedConstructGroup(
      0.42,
      0.45,
      14,
      1.8,
      accentGlowMat,
      meta.accentHex
    );
    cavityStrings.rotation.x = Math.PI / 2;
    cavityStrings.position.set(0, 2.45, 0);
    upperArticulatedPart.add(cavityStrings);
    innerPortalOrCore = cavityStrings;
  } else if (archetype === 'monument-mythos-special-tree') {
    // Monument Mythos "Special Tree" — Stark Lightning-Bent Dendrite + Naum Gabo Stringed Hyperboloid Trunk
    const rootMound = new THREE.Mesh(
      createImplicitMetaballPiercedGeometry(1.1, 0.55, seed + 7, 0.2),
      darkTectonicMat
    );
    rootMound.position.y = 0.35;
    rootGroup.add(rootMound);

    // Lower Trunk
    const lowerTrunk = buildNaumGaboStringedConstructGroup(
      0.55,
      2.8,
      18,
      2.1,
      primaryMat,
      meta.accentHex
    );
    lowerTrunk.position.y = 1.6;
    rootGroup.add(lowerTrunk);

    // Upper Bending Dendrite Crown (Articulates at impossible 45-degree lightning angles!)
    upperArticulatedPart.position.y = 3.0;
    const upperSpine = new THREE.Mesh(
      new THREE.ConeGeometry(0.38, 3.6, 7),
      primaryMat
    );
    upperSpine.position.y = 1.7;
    upperSpine.castShadow = true;
    upperArticulatedPart.add(upperSpine);

    // Horned Serpent / Dendrite Branches
    for (let b = 0; b < 5; b++) {
      const ang = (b / 5) * Math.PI * 2;
      const branch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.11, 2.1, 6),
        b % 2 === 0 ? accentGlowMat : darkTectonicMat
      );
      branch.position.set(
        Math.cos(ang) * 0.65,
        1.2 + b * 0.38,
        Math.sin(ang) * 0.65
      );
      branch.rotation.z = Math.cos(ang) * 0.72;
      branch.rotation.x = -Math.sin(ang) * 0.72;
      upperArticulatedPart.add(branch);
    }
    innerPortalOrCore = upperSpine;
  } else if (archetype === 'flesh-pit-bronchial-geyser') {
    // Mystery Flesh Pit Superorganism Vent — Smooth-Minimum Metaball Alveoli + Peristaltic Tendril
    const alveoliGeo = createImplicitMetaballPiercedGeometry(
      1.45,
      0.95,
      seed + 19,
      0.55
    );
    const alveoliMesh = new THREE.Mesh(alveoliGeo, primaryMat);
    alveoliMesh.position.y = 0.95;
    alveoliMesh.rotation.x = Math.PI / 2;
    alveoliMesh.castShadow = true;
    upperArticulatedPart.add(alveoliMesh);

    // Beksiński Trabecular Rib Arch Ring around the orifice
    for (let r = 0; r < 6; r++) {
      const ang = (r / 6) * Math.PI * 2;
      const rib = new THREE.Mesh(
        new THREE.TorusGeometry(0.85, 0.08, 6, 14, Math.PI * 0.85),
        r % 2 === 0 ? accentGlowMat : darkTectonicMat
      );
      rib.position.set(Math.cos(ang) * 0.55, 0.9, Math.sin(ang) * 0.55);
      rib.rotation.y = -ang;
      rib.rotation.z = 0.45;
      rootGroup.add(rib);
    }

    // Symbiotic Catenoid Tendril Core
    const tendril = new THREE.Mesh(
      createBoccioniSpatialContinuityGeometry(0.75),
      accentGlowMat
    );
    tendril.position.y = 2.1;
    upperArticulatedPart.add(tendril);
    innerPortalOrCore = tendril;
  } else if (archetype === 'siren-babel-utility-pylon') {
    // Grounded Sandbox Utility Truss Base + Boccioni Continuity Fins + Rotating Acoustic Megaphones
    for (let leg = 0; leg < 4; leg++) {
      const ang = (leg / 4) * Math.PI * 2 + Math.PI / 4;
      const strut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.16, 4.2, 6),
        darkTectonicMat
      );
      strut.position.set(Math.cos(ang) * 0.78, 2.0, Math.sin(ang) * 0.78);
      strut.rotation.z = Math.cos(ang) * 0.16;
      strut.rotation.x = -Math.sin(ang) * 0.16;
      strut.castShadow = true;
      rootGroup.add(strut);
    }

    upperArticulatedPart.position.y = 4.1;
    // Twin Counter-Directed Hyperbolic Acoustic Horns
    for (const dirSign of [-1, 1]) {
      const horn = new THREE.Mesh(
        new THREE.ConeGeometry(0.58, 1.45, 14, 1, true),
        dirSign > 0 ? accentGlowMat : primaryMat
      );
      horn.rotation.z = dirSign * (Math.PI * 0.5 - 0.18);
      horn.position.set(dirSign * 0.75, 0.25 + (dirSign > 0 ? 0.35 : 0), 0);
      upperArticulatedPart.add(horn);
    }

    // Elevated Calabi-Yau Acoustic Standing-Wave Resonator (replaces flat floor RingGeometry)
    const chladniRing = new THREE.Mesh(
      createCalabiYauRosetteGeometry(0.65, 5),
      accentGlowMat
    );
    chladniRing.position.y = 4.35;
    upperArticulatedPart.add(chladniRing);
    innerPortalOrCore = chladniRing;
  } else if (archetype === 'house-of-leaves-impossible-threshold') {
    // Freestanding Carlo Scarpa Stepped Ziggurat Portal + Non-Euclidean Telescopic Interior Tunnel
    const frameW = 2.1;
    const frameH = 3.4;

    for (const side of [-1, 1]) {
      const scarpaPillar = buildScarpaSteppedCorbelGroup(
        0.52,
        frameH,
        0.56,
        7,
        darkTectonicMat,
        accentGlowMat
      );
      scarpaPillar.position.set(side * (frameW * 0.5), 0, 0);
      rootGroup.add(scarpaPillar);
    }
    const lintel = buildScarpaSteppedCorbelGroup(
      frameW + 0.72,
      0.52,
      0.64,
      5,
      primaryMat,
      accentGlowMat
    );
    lintel.position.set(0, frameH, 0);
    rootGroup.add(lintel);

    // Telescopic Non-Euclidean Interior Corridor (scales its Z-depth dynamically based on player view angle!)
    const corridorGroup = new THREE.Group();
    corridorGroup.position.set(0, frameH * 0.5, 0);
    for (let slice = 0; slice < 6; slice++) {
      const ratio = 1.0 - slice * 0.12;
      const sliceFrame = new THREE.Mesh(
        createDifferentialGrowthRibbonGeometry(frameW * 0.52 * ratio, 0.18, 8, 0.22),
        slice % 2 === 0 ? accentGlowMat : darkTectonicMat
      );
      sliceFrame.rotation.x = Math.PI * 0.5;
      sliceFrame.scale.set(1.0, 1.0, 1.45);
      sliceFrame.position.z = -slice * 0.42;
      corridorGroup.add(sliceFrame);
    }
    upperArticulatedPart.add(corridorGroup);
    innerPortalOrCore = corridorGroup;
  } else {
    // 'boccioni-matta-coalescence-totem': Pure Avant-Garde Boccioni Continuity + Matta Biomorphic Totem
    const boccioniCore = new THREE.Mesh(
      createBoccioniSpatialContinuityGeometry(1.15),
      primaryMat
    );
    boccioniCore.position.y = 1.65;
    boccioniCore.castShadow = true;
    upperArticulatedPart.add(boccioniCore);

    const gaboCage = buildNaumGaboStringedConstructGroup(
      1.35,
      2.6,
      20,
      2.3,
      accentGlowMat,
      meta.accentHex
    );
    gaboCage.position.y = 1.85;
    rootGroup.add(gaboCage);
    innerPortalOrCore = gaboCage;
  }

  return {
    id,
    archetype,
    meta,
    rootGroup,
    upperArticulatedPart,
    innerPortalOrCore,
    position: pos.clone(),
    basePosition: pos.clone(),
    targetPosition: pos.clone(),
    yaw: (seed % 628) / 100,
    isObservationLocked: false,
    cameraCosAngle: 0,
    aestheticEvolutionStage: 1.0,
    behaviorPhase: (seed % 100) * 0.1,
    activeStatusLabel: 'Dormant Equilibrium',
  };
}

/**
 * 5. WORLDSPACE FORM-BLEED & THEMATIC SEPARATION ENGINE
 * Dynamically connects nearby world forms (Anomalous Objects, Landmarks, Placed Buildings, Entities)
 * with 3D Smooth-Minimum (smin) Catenoid Bridges in Coalescence Zones, and separates them with
 * floating Schism Fracture Shards in Repulsive Zones.
 */
export interface WorldspaceBleedRig {
  group: THREE.Group;
  anomalousObjects: AnomalousObjectInstance[];
  sminBridgeMeshes: THREE.Mesh[];
  schismShardMeshes: THREE.Mesh[];
  activeBleedModeLabel: string;
  coalescenceStrength: number; // -1.0 (Thematic Separation/Schism) to +1.0 (Smooth-Minimum Fusion Bleed)
  aestheticEvolutionStage: number;
  activeBridgesCount: number;
  activeSchismShardsCount: number;
  nearestAnomalyTelemetry: {
    archetype: string;
    title: string;
    originalityGradient: number;
    statusLabel: string;
    distance: number;
  } | null;
}

const MAX_SMIN_BRIDGES = 8;
const MAX_SCHISM_SHARDS = 12;

/**
 * Creates a reusable Catenoid Smooth-Minimum (smin) necking cylinder geometry
 * whose waist narrows smoothly like two merging metaballs: r(y) = r0 * (0.42 + 0.58 * (2y)^2).
 */
function createCatenoidSminBridgeGeometry(): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(0.32, 0.32, 1.0, 12, 14, true);
  const pos = geo.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i); // in [-0.5, +0.5]
    const vz = pos.getZ(i);

    // Parabolic/Catenoid smin waist profile: thick flares at both ends, slender viscous waist at vy=0
    const waistProfile = 0.28 + 1.35 * (vy * vy * 4.0);
    const tendrilFlute = 1.0 + 0.18 * Math.sin(Math.atan2(vz, vx) * 5 + vy * 8);
    pos.setXYZ(
      i,
      vx * waistProfile * tendrilFlute,
      vy,
      vz * waistProfile * tendrilFlute
    );
  }

  geo.computeVertexNormals();
  return geo;
}

export function buildWorldspaceBleedAndAnomalyRig(
  world: ManifoldWorldSpec,
  excavations: TerrainExcavationSpot[]
): WorldspaceBleedRig {
  const group = new THREE.Group();
  group.name = 'worldspace-bleed-and-anomalies-rig';

  const anomalousObjects: AnomalousObjectInstance[] = [];

  // Spawn all 6 Anomalous Behavioral Objects around the thematic zones of the world
  ALL_ANOMALOUS_ARCHETYPES.forEach((arch, idx) => {
    const angle = (idx / ALL_ANOMALOUS_ARCHETYPES.length) * Math.PI * 2 + 0.38;
    const dist = 15 + (idx % 3) * 8.5;
    const ax = Math.cos(angle) * dist;
    const az = Math.sin(angle) * dist;
    const ay = evaluateTerrainHeight(ax, az, world, excavations);

    const inst = buildAnomalousBehavioralObject(
      `anomaly-${world.seed}-${idx}`,
      arch,
      new THREE.Vector3(ax, ay, az),
      world,
      world.seed + idx * 919
    );
    group.add(inst.rootGroup);
    anomalousObjects.push(inst);
  });

  // Pool of 3D Catenoid Smooth-Minimum (smin) Form-Bleed Bridges
  const bridgeGeo = createCatenoidSminBridgeGeometry();
  const sminBridgeMeshes: THREE.Mesh[] = [];
  for (let i = 0; i < MAX_SMIN_BRIDGES; i++) {
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(world.palette.accentColor),
      emissive: new THREE.Color(world.playableCharacter.voidOrbColor),
      emissiveIntensity: 0.48,
      metalness: 0.45,
      roughness: 0.2,
      clearcoat: 0.85,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide,
    });
    const m = new THREE.Mesh(bridgeGeo, mat);
    m.visible = false;
    m.frustumCulled = false;
    group.add(m);
    sminBridgeMeshes.push(m);
  }

  // Pool of 3D Thematic Separation / Schism Fracture Splinters (sculpted hyperbolic spindles in cleaved gaps)
  const shardGeo = createHyperbolicPseudosphereGeometry(0.18, 0.58, 8, 6, 1.45);
  const schismShardMeshes: THREE.Mesh[] = [];
  for (let s = 0; s < MAX_SCHISM_SHARDS; s++) {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(
        s % 2 === 0 ? world.palette.accentColor : '#f59e0b'
      ),
      emissive: new THREE.Color(world.palette.accentColor),
      emissiveIntensity: 0.65,
      metalness: 0.8,
      roughness: 0.15,
    });
    const sm = new THREE.Mesh(shardGeo, mat);
    sm.visible = false;
    group.add(sm);
    schismShardMeshes.push(sm);
  }

  return {
    group,
    anomalousObjects,
    sminBridgeMeshes,
    schismShardMeshes,
    activeBleedModeLabel: 'Harmonic Coalescence',
    coalescenceStrength: 0.5,
    aestheticEvolutionStage: 1.0,
    activeBridgesCount: 0,
    activeSchismShardsCount: 0,
    nearestAnomalyTelemetry: null,
  };
}

/**
 * Evaluates the Thematic Location Bleed vs. Separation Coefficient in [-1, +1]
 * based on world archetype, spatial coordinates (x, z), and 4D W-coordinate.
 * - Positive (+0.15 to +1.0): Coalescence Zone — forms bleed together via viscous smin catenoid bridges.
 * - Negative (-1.0 to -0.15): Schism / Cleave Zone — forms separate and fracture along non-Euclidean planes.
 */
export function evaluateThematicBleedCoefficient(
  x: number,
  z: number,
  wCoord: number,
  archetype: WorldTopologyArchetype,
  nowSec: number
): {
  coefficient: number;
  zoneLabel: string;
} {
  const spatialWave =
    Math.sin(x * 0.065 + wCoord * 2.2 + nowSec * 0.25) *
    Math.cos(z * 0.065 - wCoord * 1.8);

  let archetypeBias = 0.25;
  if (
    archetype === 'biomech-coral-atoll' ||
    archetype === 'gyro-lattice-basin'
  ) {
    archetypeBias = 0.45; // Strongly biomorphic smooth-minimum fusion
  } else if (
    archetype === 'non-euclidean-spires' ||
    archetype === 'quantum-basalt-trench'
  ) {
    archetypeBias = -0.15; // High non-Euclidean spatial separation & schism
  }

  const coeff = THREE.MathUtils.clamp(
    spatialWave * 0.75 + archetypeBias + wCoord * 0.35,
    -1.0,
    1.0
  );

  const zoneLabel =
    coeff > 0.25
      ? 'Viscous smin Coalescence Bleed (Forms Merging)'
      : coeff < -0.2
        ? 'Non-Euclidean Schism Fault (Forms Separating)'
        : 'Liminal Boundary Equilibrium';

  return { coefficient: coeff, zoneLabel };
}

/**
 * Updates all 6 Anomalous Behavioral Objects, Aesthetic Evolution stages, and
 * Real-Time Worldspace Form-Bleed / Separation Bridges at 60fps.
 */
export function updateWorldspaceBleedAndAnomalies(params: {
  rig: WorldspaceBleedRig;
  world: ManifoldWorldSpec;
  explorerPos: THREE.Vector3;
  cameraPos: THREE.Vector3;
  cameraForward: THREE.Vector3;
  entityPositions: THREE.Vector3[];
  placedBuildings: PlacedWorldBuilding[];
  excavations: TerrainExcavationSpot[];
  wCoord: number;
  nowSec: number;
  dt: number;
}): void {
  const {
    rig,
    world,
    explorerPos,
    cameraPos,
    cameraForward,
    entityPositions,
    placedBuildings,
    excavations,
    wCoord,
    nowSec,
    dt,
  } = params;

  // 1. Evaluate Thematic Location Bleed vs. Separation at Explorer Position
  const bleedEval = evaluateThematicBleedCoefficient(
    explorerPos.x,
    explorerPos.z,
    wCoord,
    world.archetype,
    nowSec
  );
  rig.coalescenceStrength = bleedEval.coefficient;
  rig.activeBleedModeLabel = bleedEval.zoneLabel;

  // Aesthetic Evolution Factor grows continuously with excavations, placed buildings, W-depth, and time
  const globalAestheticEvolution = THREE.MathUtils.clamp(
    1.0 +
      excavations.length * 0.18 +
      placedBuildings.length * 0.22 +
      Math.abs(wCoord) * 1.15 +
      Math.sin(nowSec * 0.15) * 0.25,
    1.0,
    4.0
  );

  let nearestDist = 999;
  let nearestInst: AnomalousObjectInstance | null = null;

  // 2. Update each Anomalous Behavioral Object's State Machine
  for (const inst of rig.anomalousObjects) {
    inst.aestheticEvolutionStage = globalAestheticEvolution;
    inst.behaviorPhase += dt * (1.0 + Math.abs(wCoord));

    const toObj = new THREE.Vector3().subVectors(inst.position, cameraPos);
    const distToCam = toObj.length();
    const dirToObj = toObj.clone().divideScalar(Math.max(0.001, distToCam));
    const cosAngle = cameraForward.dot(dirToObj);
    inst.cameraCosAngle = cosAngle;

    const distToExplorer = inst.position.distanceTo(explorerPos);
    if (distToExplorer < nearestDist) {
      nearestDist = distToExplorer;
      nearestInst = inst;
    }

    if (inst.archetype === 'quantum-weeping-hepworth-monolith') {
      // QUANTUM OBSERVATION LOCK: Frozen while inside player camera FOV (cosAngle > 0.36)
      const isObserved = cosAngle > 0.36 && distToCam < 68;
      inst.isObservationLocked = isObserved;

      if (isObserved) {
        inst.activeStatusLabel =
          'OBSERVATION-LOCKED · Frozen Barbara Hepworth Stone';
      } else {
        inst.activeStatusLabel =
          'UNOBSERVED QUANTUM CREEP · Shifting Across Manifold';
        // Silently glide toward a point 7m behind the explorer when unobserved!
        const behindExplorer = explorerPos
          .clone()
          .addScaledVector(cameraForward, -7.5);
        const stepVec = new THREE.Vector3().subVectors(
          behindExplorer,
          inst.position
        );
        stepVec.y = 0;
        const stepLen = stepVec.length();
        if (stepLen > 2.2 && stepLen < 42) {
          stepVec.normalize();
          inst.position.x += stepVec.x * dt * 4.6;
          inst.position.z += stepVec.z * dt * 4.6;
          inst.position.y = evaluateTerrainHeight(
            inst.position.x,
            inst.position.z,
            world,
            excavations
          );
          inst.rootGroup.position.copy(inst.position);
        }
        // Rotate pierced ocular cavity to face the player while unobserved
        inst.rootGroup.lookAt(
          explorerPos.x,
          inst.position.y + 1.5,
          explorerPos.z
        );
      }
    } else if (inst.archetype === 'monument-mythos-special-tree') {
      // MONUMENT MYTHOS SPECIAL TREE: Non-Euclidean 45° lightning-bend when W crosses threshold or player nears
      const bendTrigger = Math.abs(wCoord) > 0.28 || distToExplorer < 12.0;
      const targetBend = bendTrigger
        ? Math.sin(nowSec * 3.8) * 0.68 + 0.42
        : Math.sin(nowSec * 0.5) * 0.08;
      inst.upperArticulatedPart.rotation.z +=
        (targetBend - inst.upperArticulatedPart.rotation.z) *
        Math.min(1, dt * 8);
      inst.upperArticulatedPart.rotation.x =
        Math.cos(nowSec * 2.4) * (bendTrigger ? 0.38 : 0.05);
      inst.activeStatusLabel = bendTrigger
        ? 'NON-EUCLIDEAN ARC-SNAP · Discharging Dimensional Bleed'
        : 'Dormant Dendrite Symmetry';
    } else if (inst.archetype === 'flesh-pit-bronchial-geyser') {
      // MYSTERY FLESH PIT BRONCHIAL VENT: Peristaltic tidal breathing + symbiotic tendril reach
      const breath = 1.0 + Math.sin(nowSec * 2.1) * 0.22;
      const dilated = distToExplorer < 11.5 ? 1.32 : 1.0;
      inst.upperArticulatedPart.scale.set(
        breath * dilated,
        (2.0 - breath) * dilated,
        breath * dilated
      );
      inst.innerPortalOrCore.rotation.y = nowSec * 1.4;
      inst.activeStatusLabel =
        distToExplorer < 11.5
          ? 'ORIFICE DILATED · Exhaling Symbiotic Updraft'
          : 'Peristaltic Respiration (14 BPM)';
    } else if (inst.archetype === 'siren-babel-utility-pylon') {
      // SIREN-BABEL PYLON: Tracks explorer / entities and pulses Chladni ground rings
      const targetLook =
        entityPositions.length > 0 ? entityPositions[0] : explorerPos;
      const dx = targetLook.x - inst.position.x;
      const dz = targetLook.z - inst.position.z;
      const desiredYaw = Math.atan2(dx, dz);
      inst.upperArticulatedPart.rotation.y = desiredYaw;

      const ringScale = 1.0 + ((nowSec * 1.6) % 2.4);
      inst.innerPortalOrCore.scale.set(ringScale, ringScale, 1);
      inst.activeStatusLabel =
        'BROADCASTING CHLADNI CADENCE · Entraining Biome Limbs';
    } else if (inst.archetype === 'house-of-leaves-impossible-threshold') {
      // HOUSE OF LEAVES IMPOSSIBLE THRESHOLD: View-angle dependent interior corridor depth dilation!
      const portalNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(
        inst.rootGroup.quaternion
      );
      const viewAlignment = Math.abs(portalNormal.dot(dirToObj));
      // When looking straight through the doorway, its interior depth stretches 4.5x! From the side, it collapses flat!
      const impossibleDepthScale = 0.18 + Math.pow(viewAlignment, 2) * 4.4;
      inst.innerPortalOrCore.scale.set(1.0, 1.0, impossibleDepthScale);
      inst.activeStatusLabel =
        viewAlignment > 0.65
          ? `IMPOSSIBLE CORRIDOR DILATED (${(impossibleDepthScale * 5.5).toFixed(1)}m Internal Depth)`
          : 'Exterior Thin-Profile Compression';
    } else {
      // BOCCIONI-MATTA COALESCENCE TOTEM: Aesthetic evolution & multi-axis continuity spin
      const evoScale = 0.85 + (globalAestheticEvolution - 1.0) * 0.28;
      inst.upperArticulatedPart.scale.setScalar(evoScale);
      inst.upperArticulatedPart.rotation.y += dt * 1.25;
      inst.innerPortalOrCore.rotation.y -= dt * 0.85;
      inst.innerPortalOrCore.rotation.z = Math.sin(nowSec * 0.9) * 0.35;
      inst.activeStatusLabel = `AESTHETIC EVOLUTION STAGE ${globalAestheticEvolution.toFixed(1)} · Active Morphogenesis`;
    }
  }

  rig.aestheticEvolutionStage = Number(globalAestheticEvolution.toFixed(2));
  rig.nearestAnomalyTelemetry = nearestInst
    ? {
        archetype: nearestInst.archetype,
        title: nearestInst.meta.title,
        originalityGradient: nearestInst.meta.originalityGradient,
        statusLabel: nearestInst.activeStatusLabel,
        distance: Number(nearestDist.toFixed(1)),
      }
    : null;

  // 3. Collect Active Worldspace Forms (Anomalies + Placed Buildings + Entities + Explorer)
  //    to compute Real-Time Smooth-Minimum (smin) Form-Bleed Bridges vs. Thematic Separation Shards!
  const worldNodes: THREE.Vector3[] = [];
  for (const an of rig.anomalousObjects) {
    worldNodes.push(
      new THREE.Vector3(an.position.x, an.position.y + 1.8, an.position.z)
    );
  }
  for (const bld of placedBuildings.slice(0, 6)) {
    const by =
      bld.y === 0
        ? evaluateTerrainHeight(bld.x, bld.z, world, excavations)
        : bld.y;
    worldNodes.push(new THREE.Vector3(bld.x, by + 2.2, bld.z));
  }
  for (const ep of entityPositions.slice(0, 6)) {
    worldNodes.push(new THREE.Vector3(ep.x, ep.y + 1.2, ep.z));
  }
  worldNodes.push(
    new THREE.Vector3(explorerPos.x, explorerPos.y + 1.35, explorerPos.z)
  );

  // Update Catenoid Smooth-Minimum (smin) Form-Bleed Bridges
  let bridgeIdx = 0;
  let shardIdx = 0;
  const upVec = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i < worldNodes.length; i++) {
    for (let j = i + 1; j < worldNodes.length; j++) {
      const pA = worldNodes[i];
      const pB = worldNodes[j];
      const dist = pA.distanceTo(pB);

      if (dist > 2.2 && dist < 24.0) {
        const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
        const localBleed = evaluateThematicBleedCoefficient(
          mid.x,
          mid.z,
          wCoord,
          world.archetype,
          nowSec
        ).coefficient;

        if (localBleed >= -0.05 && bridgeIdx < rig.sminBridgeMeshes.length) {
          // COALESCENCE ZONE: Viscous Smooth-Minimum (smin) Catenoid Bridge bleeding the two forms together!
          const bridge = rig.sminBridgeMeshes[bridgeIdx++];
          bridge.visible = true;
          bridge.position.copy(mid);

          const dir = new THREE.Vector3().subVectors(pB, pA);
          const len = dir.length();
          bridge.quaternion.setFromUnitVectors(upVec, dir.normalize());

          // Waist thickness pulses with smin proximity and thematic bleed strength
          const proximityFactor = 1.0 - dist / 24.0;
          const thickness =
            (0.35 + Math.max(0, localBleed) * 0.85) *
            (0.5 + proximityFactor * 0.9) *
            (1.0 + Math.sin(nowSec * 3.2 + i) * 0.15);

          bridge.scale.set(thickness, len, thickness);
        } else if (
          localBleed < -0.05 &&
          shardIdx < rig.schismShardMeshes.length
        ) {
          // SCHISM / SEPARATION ZONE: Forms cleave apart, suspending non-Euclidean fracture shards in the gap!
          const shard = rig.schismShardMeshes[shardIdx++];
          shard.visible = true;
          const hoverOffset = Math.sin(nowSec * 2.8 + shardIdx) * 0.65;
          shard.position.set(mid.x, mid.y + hoverOffset, mid.z);
          shard.rotation.x = nowSec * 1.8 + shardIdx;
          shard.rotation.y = nowSec * 1.4;
          const sScale = 0.85 + Math.abs(localBleed) * 1.1;
          shard.scale.set(sScale * 0.5, sScale * 2.2, sScale * 0.5);
        }
      }
    }
  }

  rig.activeBridgesCount = bridgeIdx;
  rig.activeSchismShardsCount = shardIdx;

  for (let b = bridgeIdx; b < rig.sminBridgeMeshes.length; b++) {
    rig.sminBridgeMeshes[b].visible = false;
  }
  for (let s = shardIdx; s < rig.schismShardMeshes.length; s++) {
    rig.schismShardMeshes[s].visible = false;
  }
}
