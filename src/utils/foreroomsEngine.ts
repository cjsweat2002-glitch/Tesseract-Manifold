import * as THREE from 'three';
import {
  BiocomplexInterstitialOrigin,
  CameraPerspective,
  ContinuumNovelEvent,
  EntityBlueprint,
  EntityMorphology,
  FavoritedManifoldAnchor,
  ForeroomsDispositionLocus,
  ForeroomsTelemetry,
  GeometryCarvingStyle,
  ManifoldGameVersionLog,
  ManifoldWorldSpec,
  SkinTopologyStyle,
  WorldspaceArtformArchetype,
  WorldspaceProceduralArtform,
} from '../types/manifold';
import {
  evaluateTerrainHeight,
  generateEntityBlueprintForWorld,
} from './manifoldGenerator';
import {
  createCalabiYauRosetteGeometry,
  createHyperbolicPseudosphereGeometry,
} from './architecturalWisdomEngine';
import {
  buildLSystemProceduralArtform3DMesh,
  LSystemArtformRigEntry,
  resolveLSystemWEvolutionRegime,
  synthesizeLSystemGrammarSpec,
  updateLSystemProceduralArtformEntry,
} from './lSystemArtformEngine';

export interface ForeroomsSpellingVariant {
  spelling: string;
  phoneticSigil: string;
  ideologicalMeaning: string;
  dominantCellName: string;
}

/**
 * Polymorphic spellings of "The Forerooms" ("4RumEs") that shift as the 8 cubic cells
 * of the player's internal sheathed 4D Tesseract rotate across continuum time.
 */
export const FOREROOMS_SPELLING_VARIANTS: ForeroomsSpellingVariant[] = [
  {
    spelling: '4RumEs',
    phoneticSigil: 'IV · R U M E S',
    ideologicalMeaning:
      'Sheathed Continuum Core — encoding player action time and cross-timeline novel events inside the host vessel.',
    dominantCellName: '+W Kata-Future Cell (Cell I)',
  },
  {
    spelling: 'Forerooms',
    phoneticSigil: 'F O R E · R O O M S',
    ideologicalMeaning:
      'The 4D Directional Anteroom where past novel events in alternate continuums combine with present action time.',
    dominantCellName: '-W Ana-Memory Cell (Cell II)',
  },
  {
    spelling: 'Fore-Rûms',
    phoneticSigil: 'F O R E · R Û M S',
    ideologicalMeaning:
      'Omnidirectional Exterior Void encoding the Present Continuum Spacetime from all 24 faces simultaneously.',
    dominantCellName: '+X Zenith-Shear Cell (Cell III)',
  },
  {
    spelling: 'IV-Rhuems',
    phoneticSigil: 'I V · R H U E M S',
    ideologicalMeaning:
      'Boundary-condition differential bleed streams forming new biocomplex originalities in between timelines.',
    dominantCellName: '-X Nadir-Basalt Cell (Cell IV)',
  },
  {
    spelling: 'Phor-Romes',
    phoneticSigil: 'P H O R · R O M E S',
    ideologicalMeaning:
      'Phoronomic 5D-to-4D matter translation conduits crystallizing karmic events and worldspace artforms.',
    dominantCellName: '+Y Canopy-Crown Cell (Cell V)',
  },
  {
    spelling: 'Foure-Wombs',
    phoneticSigil: 'F O U R E · W O M B S',
    ideologicalMeaning:
      'The Deeper-Than-Inside meta-locus sheathed within—the shared foundation that all other Insides sit on.',
    dominantCellName: '-Y Sub-Foundation Cell (Cell VI)',
  },
  {
    spelling: '4-RoamZ',
    phoneticSigil: '4 · R O A M Z',
    ideologicalMeaning:
      'Perspective-driven procedural evolution across the multiversal local group toward biocomplexity.',
    dominantCellName: '+Z Horizon-Aperture Cell (Cell VII)',
  },
  {
    spelling: 'For-Rhomb-s',
    phoneticSigil: 'F O R · R H O M B S',
    ideologicalMeaning:
      'Omniversal Substrate Identification — where foundations between a multiversal local group unify into one substrate.',
    dominantCellName: '-Z Deep-Interior Cell (Cell VIII)',
  },
];

export interface ForeroomsDispositionMetadata {
  id: ForeroomsDispositionLocus;
  title: string;
  shortLabel: string;
  spatialEquation: string;
  ontologicalThesis: string;
  matterTranslationEffect: string;
  accentHex: string;
}

export const FOREROOMS_DISPOSITION_CATALOG: Record<
  ForeroomsDispositionLocus,
  ForeroomsDispositionMetadata
> = {
  'beyond-future-void': {
    id: 'beyond-future-void',
    title: 'BEYOND · Exterior Future Continuum Encoding',
    shortLabel: 'Beyond (Future Encoding)',
    spatialEquation: 'r > ∂𝒯₄ · ∀ n̂ ∈ S³ (8-Cell Omnidirectional Future)',
    ontologicalThesis:
      'The sheathed tesseract perceives the entire outside across all 8 cells as the Future, encoding present continuum spacetime from every angle rather than inverting on one side.',
    matterTranslationEffect:
      'Accelerates cross-timeline boundary bleed and lightens effective world gravity (0.84x).',
    accentHex: '#a855f7',
  },
  'below-foundation-bleed': {
    id: 'below-foundation-bleed',
    title: 'BELOW · Sub-Foundation Boundary Bleed',
    shortLabel: 'Below (Substrate Bleed)',
    spatialEquation: 'Δ∂ℳ_ij 滲 y < y_bedrock (Multiversal Substrate Coupling)',
    ontologicalThesis:
      'Differentials between alternate timelines bleed through sub-terrain boundary conditions, progressively unifying the foundations of the multiversal local group.',
    matterTranslationEffect:
      'Reinforces foundation bearing pressure, stabilizes ragdoll posture (1.18x), and feeds substrate identification.',
    accentHex: '#10b981',
  },
  'inside-present-continuum': {
    id: 'inside-present-continuum',
    title: 'INSIDE · Sheathed Action-Time Continuum',
    shortLabel: 'Inside (Sheathed Core)',
    spatialEquation: '𝒫_int = ∫ τ_action × ∑ NovelEvents_k d⁴ξ',
    ontologicalThesis:
      'Housed within the player model’s translucent sheath, the tesseract encodes every novel player action in time, combining them with alternate continuums to birth karmic events.',
    matterTranslationEffect:
      'Harmonizes locomotion, symbiotic tethers, and real-time karmic event synthesis.',
    accentHex: '#38bdf8',
  },
  'deeper-than-inside-nexus': {
    id: 'deeper-than-inside-nexus',
    title: 'DEEPER-THAN-INSIDE · Omniversal Substrate Locus (Ω)',
    shortLabel: 'Deeper-Than-Inside (Ω-Substrate)',
    spatialEquation: 'Ω_sub = ⋂_{k ∈ LocalGroup} Foundation(Timeline_k)',
    ontologicalThesis:
      'Deeper than Inside is the shared ontological point where all other Insides sit—where boundary bleeds between timelines nucleate new biocomplex originalities and omniversal substrate identity.',
    matterTranslationEffect:
      'Catalyzes in-between biocomplex entities, worldspace 3D artforms, and Omniversal Substrate Identification.',
    accentHex: '#f59e0b',
  },
};

export const ALL_FOREROOMS_DISPOSITIONS: ForeroomsDispositionLocus[] = [
  'beyond-future-void',
  'below-foundation-bleed',
  'inside-present-continuum',
  'deeper-than-inside-nexus',
];

// Canonical 16 vertices of a 4D Tesseract in [-1, +1]^4
const TESSERACT_VERTICES_4D: [number, number, number, number][] = [];
for (let i = 0; i < 16; i++) {
  TESSERACT_VERTICES_4D.push([
    i & 1 ? 1 : -1,
    i & 2 ? 1 : -1,
    i & 4 ? 1 : -1,
    i & 8 ? 1 : -1,
  ]);
}

// Canonical 32 edges of a 4D Tesseract
const TESSERACT_EDGES: [number, number][] = [];
for (let i = 0; i < 16; i++) {
  for (let j = i + 1; j < 16; j++) {
    const diff = i ^ j;
    if (diff === 1 || diff === 2 || diff === 4 || diff === 8) {
      TESSERACT_EDGES.push([i, j]);
    }
  }
}

export type SpawnedArtformMeshEntry = LSystemArtformRigEntry;

export interface ForeroomsTesseractRig {
  group: THREE.Group;
  /**
   * SHEATHED INSIDE THE PLAYER MODEL'S TORSO CAVITY (radius ~0.11m at y=1.18m).
   * Never floating outside as clutter or painted on the exterior like graffiti.
   */
  sheathedPlayerCoreGroup: THREE.Group;
  sheathedTesseractLines: THREE.LineSegments;
  sheathedEdgePositions: Float32Array;
  sheathedInnerOmegaCore: THREE.Mesh;
  sheathedMicroInsides: THREE.Mesh[];
  /**
   * Worldspace 3D Procedural Artforms materialized out of cross-timeline karmic events
   */
  worldspaceArtformsGroup: THREE.Group;
  spawnedArtformEntries: Map<string, SpawnedArtformMeshEntry>;
  /**
   * Subtle sub-foundation substrate ring that awakens as Omniversal Substrate Identification approaches
   */
  substrateFoundationRing: THREE.Mesh;
  evolutionAccum: number;
  playerActionTimeAccum: number;
  activeDisposition: ForeroomsDispositionLocus;
}

function rotate4DOmnidirectional(
  pt: [number, number, number, number],
  angleXW: number,
  angleYW: number,
  angleZW: number,
  angleXY: number
): [number, number, number, number] {
  let [x, y, z, w] = pt;

  const cosXW = Math.cos(angleXW);
  const sinXW = Math.sin(angleXW);
  const nx1 = x * cosXW - w * sinXW;
  const nw1 = x * sinXW + w * cosXW;
  x = nx1;
  w = nw1;

  const cosYW = Math.cos(angleYW);
  const sinYW = Math.sin(angleYW);
  const ny2 = y * cosYW - w * sinYW;
  const nw2 = y * sinYW + w * cosYW;
  y = ny2;
  w = nw2;

  const cosZW = Math.cos(angleZW);
  const sinZW = Math.sin(angleZW);
  const nz3 = z * cosZW - w * sinZW;
  const nw3 = z * sinZW + w * cosYW;
  z = nz3;
  w = nw3;

  const cosXY = Math.cos(angleXY);
  const sinXY = Math.sin(angleXY);
  const nx4 = x * cosXY - y * sinXY;
  const ny4 = x * sinXY + y * cosXY;
  x = nx4;
  y = ny4;

  return [x, y, z, w];
}

function project4DToLocal3D(
  pt4: [number, number, number, number],
  scale: number
): THREE.Vector3 {
  const [x, y, z, w] = pt4;
  const wDist = 2.65;
  const denom = Math.max(0.75, wDist - w * 0.72);
  const factor = (scale * 1.55) / denom;
  return new THREE.Vector3(x * factor, y * factor, z * factor);
}

/**
 * Builds the Sheathed 4D Continuum Core (housed INSIDE the player model's chest cavity)
 * and the Worldspace Procedural Artforms container.
 */
export function buildForeroomsTesseractRig(
  world: ManifoldWorldSpec,
  otherInsidesCount: number = 4
): ForeroomsTesseractRig {
  const group = new THREE.Group();
  group.name = 'forerooms-sheathed-and-artforms-rig';

  const voidColor = new THREE.Color(world.playableCharacter.voidOrbColor);
  const accentColor = new THREE.Color(world.palette.accentColor);
  const goldColor = new THREE.Color('#f59e0b');

  // 1. SHEATHED 4D TESSERACT CORE (Strictly enclosed inside the player's torso sheath at r ~ 0.11m)
  const sheathedPlayerCoreGroup = new THREE.Group();
  sheathedPlayerCoreGroup.name = 'sheathed-player-continuum-core';

  const sheathedEdgePositions = new Float32Array(
    TESSERACT_EDGES.length * 2 * 3
  );
  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute(
    'position',
    new THREE.BufferAttribute(sheathedEdgePositions, 3)
  );

  const edgeMat = new THREE.LineBasicMaterial({
    color: accentColor.clone().lerp(voidColor, 0.5),
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
  });

  const sheathedTesseractLines = new THREE.LineSegments(edgeGeo, edgeMat);
  sheathedTesseractLines.frustumCulled = false;
  sheathedPlayerCoreGroup.add(sheathedTesseractLines);

  // Deeper-Than-Inside Omega Core inside the center of the sheathed tesseract (Calabi-Yau Rosette instead of Icosahedron)
  const sheathedInnerOmegaCore = new THREE.Mesh(
    createCalabiYauRosetteGeometry(0.048, 5),
    new THREE.MeshBasicMaterial({
      color: '#fde68a',
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    })
  );
  sheathedPlayerCoreGroup.add(sheathedInnerOmegaCore);

  // Micro-nodes inside the player's chest sheath representing other Insides seated on the Deeper-Than-Inside locus
  const sheathedMicroInsides: THREE.Mesh[] = [];
  const microCount = Math.max(4, Math.min(8, otherInsidesCount));
  const microGeo = createHyperbolicPseudosphereGeometry(0.016, 0.032, 6, 5, 1.2);
  for (let s = 0; s < microCount; s++) {
    const m = new THREE.Mesh(
      microGeo,
      new THREE.MeshBasicMaterial({
        color: s % 2 === 0 ? '#38bdf8' : '#f59e0b',
        transparent: true,
        opacity: 0.85,
      })
    );
    sheathedPlayerCoreGroup.add(m);
    sheathedMicroInsides.push(m);
  }

  group.add(sheathedPlayerCoreGroup);

  // 2. Worldspace Procedural 3D Artforms Group (Emergent sculptures created from cross-timeline karmic events)
  const worldspaceArtformsGroup = new THREE.Group();
  worldspaceArtformsGroup.name = 'worldspace-karmic-artforms';
  group.add(worldspaceArtformsGroup);

  // Substrate identification is a theoretical & generative foundation between continuums, not a literal floor ring
  const substrateFoundationRing = new THREE.Mesh(
    new THREE.BufferGeometry(),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  substrateFoundationRing.visible = false;

  return {
    group,
    sheathedPlayerCoreGroup,
    sheathedTesseractLines,
    sheathedEdgePositions,
    sheathedInnerOmegaCore,
    sheathedMicroInsides,
    worldspaceArtformsGroup,
    spawnedArtformEntries: new Map(),
    substrateFoundationRing,
    evolutionAccum: 0,
    playerActionTimeAccum: 0,
    activeDisposition: 'inside-present-continuum',
  };
}

/**
 * Mathematically synthesizes an In-Between Biocomplex Originality where the boundary conditions
 * of two alternate timelines (Version A & Version B) bleed into one another over Player Action Time.
 */
export function synthesizeBiocomplexInterstitialOrigin(params: {
  versionA: ManifoldGameVersionLog;
  versionB: ManifoldGameVersionLog;
  novelEvents: ContinuumNovelEvent[];
  playerActionTimeSec: number;
  pairIndex: number;
}): BiocomplexInterstitialOrigin {
  const { versionA, versionB, novelEvents, playerActionTimeSec, pairIndex } =
    params;

  const seedA = versionA.world.seed;
  const seedB = versionB.world.seed;
  const interstitialSeed =
    (Math.abs(((seedA * 31) ^ (seedB * 17)) + pairIndex * 1009) % 899999) +
    100000;

  const eventsInA = novelEvents.filter(
    (e) => e.worldSeed === seedA || e.timelineVersionId === versionA.id
  ).length;
  const eventsInB = novelEvents.filter(
    (e) => e.worldSeed === seedB || e.timelineVersionId === versionB.id
  ).length;

  const wDiff = Math.abs((versionA.wCoord ?? 0) - (versionB.wCoord ?? 0));
  const rawBleed =
    0.34 +
    Math.min(0.45, (eventsInA + eventsInB) * 0.065) +
    Math.min(0.22, playerActionTimeSec * 0.0025) +
    wDiff * 0.12;
  const boundaryBleedDifferential = Number(
    THREE.MathUtils.clamp(rawBleed, 0.24, 0.99).toFixed(2)
  );

  const wMidpoint = Number(
    (((versionA.wCoord ?? 0) + (versionB.wCoord ?? 0)) * 0.5).toFixed(2)
  );

  const archetypes: WorldspaceArtformArchetype[] = [
    'chiral-chrono-helix',
    'karmic-tensegrity-loom',
    'biocomplex-gyroid-stele',
    'omniversal-substrate-obelisk',
  ];
  const artArchetype =
    archetypes[(interstitialSeed + pairIndex) % archetypes.length];

  const artTitles: Record<WorldspaceArtformArchetype, string> = {
    'chiral-chrono-helix': 'Chiral Chrono-Helix Monument',
    'karmic-tensegrity-loom': 'Karmic Tensegrity Loom',
    'biocomplex-gyroid-stele': 'Biocomplex Gyroidal Stele',
    'omniversal-substrate-obelisk': 'Omniversal Substrate Obelisk',
  };

  const karmicNames = [
    'Cross-Continuum Piezoelectric Convergence',
    'Chiral Action-Time Harmonic Inversion',
    'Interstitial Boundary-Bleed Morphogenesis',
    'Omniversal Substrate Foundation Lock',
  ];
  const karmicDescs = [
    'Past excavations and architectural sinterings across both continuums crystallize into a standing harmonic wave.',
    'Locomotion and symbiotic tethers encoded in alternate time streams merge to elevate joint torque and jump coherence.',
    'Differential boundary bleed between timelines nucleates an autonomous biocomplex organism and kinetic monument.',
    'The foundational bedrock of both worldspaces identifies as a single shared omniversal substrate.',
  ];

  const kIdx = (interstitialSeed + pairIndex) % karmicNames.length;
  const angle = ((pairIndex * 137.5) % 360) * (Math.PI / 180);
  const dist = 12 + (pairIndex % 4) * 6.5;

  const bioScore = Math.round(boundaryBleedDifferential * 100);
  const lSystemGrammar = synthesizeLSystemGrammarSpec(
    artArchetype,
    seedA,
    seedB,
    bioScore
  );

  const emergentArtform: WorldspaceProceduralArtform = {
    id: `artform-${seedA}-${seedB}`,
    title: `${artTitles[artArchetype]} #${interstitialSeed % 1000}`,
    archetype: artArchetype,
    parentSeedA: seedA,
    parentSeedB: seedB,
    karmicOriginSummary: `Grown via ${lSystemGrammar.variantName} from ${
      eventsInA + eventsInB
    } continuum events bleeding between Seed #${seedA} and Seed #${seedB}.`,
    x: Number((Math.cos(angle) * dist).toFixed(1)),
    z: Number((Math.sin(angle) * dist).toFixed(1)),
    scale: Number((0.9 + boundaryBleedDifferential * 0.45).toFixed(2)),
    primaryColor: versionA.world.palette.accentColor,
    accentColor: versionB.world.playableCharacter.voidOrbColor,
    wPhase: wMidpoint,
    biocomplexityScore: bioScore,
    lSystemGrammar,
    createdAt: Date.now(),
  };

  const morphologies: EntityMorphology[] = [
    'biped-construct',
    'quadruped-strider',
    'hexapod-arachnid',
    'serpentine-leviathan',
    'seraph-cantilever',
    'avian-tensor-raptor',
  ];
  const carvings: GeometryCarvingStyle[] = [
    'faceted-poly',
    'cathedral-ribbed',
    'nacre-filigree',
    'hyper-ringed',
    'obsidian-reliquary',
  ];
  const skins: SkinTopologyStyle[] = [
    'myofibril-striated-cuticle',
    'chromatophore-pulsing-dermis',
    'piezo-scale-imbrication',
    'subsurface-vascular-velvet',
    'chitin-suture-plates',
    'vitreous-tensegrity-membrane',
  ];

  const morph = morphologies[interstitialSeed % morphologies.length];
  const baseBp = generateEntityBlueprintForWorld(
    `interstitial-${interstitialSeed}`,
    interstitialSeed,
    pairIndex + 1,
    versionA.world.palette.accentColor,
    morph
  );

  const emergentEntityBlueprint: EntityBlueprint = {
    ...baseBp,
    name: `Interstitial ${baseBp.name.split(' ')[0]} · Ω-${
      interstitialSeed % 100
    }`,
    carvingStyle: carvings[(interstitialSeed >> 2) % carvings.length],
    skinTopology: skins[(interstitialSeed >> 3) % skins.length],
    baseStiffness: Number(
      THREE.MathUtils.clamp(
        0.58 + boundaryBleedDifferential * 0.32,
        0.4,
        0.95
      ).toFixed(2)
    ),
  };

  return {
    id: `interstitial-${seedA}-${seedB}`,
    interstitialSeed,
    title: `Inter-Timeline Ω-${interstitialSeed % 1000}`,
    parentVersionIdA: versionA.id,
    parentVersionIdB: versionB.id,
    parentSeedA: seedA,
    parentSeedB: seedB,
    parentNameA: versionA.world.name,
    parentNameB: versionB.world.name,
    boundaryBleedDifferential,
    wMidpoint,
    karmicEventName: karmicNames[kIdx],
    karmicMechanicDescription: karmicDescs[kIdx],
    emergentArtform,
    emergentEntityBlueprint,
    manifestedInWorld: true,
    createdAt: Date.now(),
  };
}

/**
 * Updates the Sheathed 4D Continuum Core inside the player model, animates Worldspace
 * Procedural 3D Artforms, and computes Omniversal Substrate Identification telemetry.
 */
export function updateForeroomsTesseractRig(params: {
  rig: ForeroomsTesseractRig;
  world: ManifoldWorldSpec;
  wCoord: number;
  playerPos: THREE.Vector3;
  playerYaw: number;
  playerPitch: number;
  playerSpeed?: number;
  cameraMode: CameraPerspective;
  isInsideVoidBall: boolean;
  overrideDisposition: ForeroomsDispositionLocus | null;
  favoritedAnchors: FavoritedManifoldAnchor[];
  epochCount: number;
  novelEventsCount?: number;
  worldArtforms?: WorldspaceProceduralArtform[];
  nowSec: number;
  dt: number;
}): {
  telemetry: ForeroomsTelemetry;
  gravityModulator: number;
  stiffnessModulator: number;
} {
  const {
    rig,
    world,
    wCoord,
    playerPos,
    playerYaw,
    playerPitch,
    playerSpeed = 0,
    cameraMode,
    isInsideVoidBall,
    overrideDisposition,
    favoritedAnchors,
    epochCount,
    novelEventsCount = 4,
    worldArtforms = [],
    nowSec,
    dt,
  } = params;

  // 1. Accumulate Player Action Time
  const actionRate =
    1.0 + Math.min(2.2, playerSpeed * 0.25) + Math.abs(wCoord) * 0.45;
  rig.playerActionTimeAccum += dt * actionRate;

  const radialDistFromOrigin = Math.hypot(playerPos.x, playerPos.z);
  const perspectiveFactor =
    cameraMode === 'orbital-director'
      ? 1.45
      : cameraMode === 'first-person'
      ? 1.15
      : 1.0;

  rig.evolutionAccum +=
    dt *
    (0.18 + Math.abs(wCoord) * 0.32 + radialDistFromOrigin * 0.004) *
    perspectiveFactor;

  const angleXW =
    rig.evolutionAccum * 0.65 + wCoord * 1.35 + Math.sin(playerYaw) * 0.42;
  const angleYW =
    rig.evolutionAccum * 0.45 -
    wCoord * 0.95 +
    Math.sin(playerPitch) * 0.48;
  const angleZW =
    rig.evolutionAccum * 0.52 +
    Math.cos(playerYaw) * 0.38 +
    (radialDistFromOrigin / 45) * 0.65;
  const angleXY = Math.sin(nowSec * 0.3 + wCoord) * 0.28;

  // 2. Resolve Active Ontological Disposition
  let activeDisposition: ForeroomsDispositionLocus = 'inside-present-continuum';
  if (overrideDisposition) {
    activeDisposition = overrideDisposition;
  } else if (isInsideVoidBall) {
    activeDisposition = 'deeper-than-inside-nexus';
  } else if (cameraMode === 'orbital-director' || radialDistFromOrigin > 36) {
    activeDisposition = 'beyond-future-void';
  } else if (wCoord < -0.35) {
    activeDisposition = 'below-foundation-bleed';
  } else {
    activeDisposition = 'inside-present-continuum';
  }
  rig.activeDisposition = activeDisposition;

  // 3. Update the SHEATHED 4D TESSERACT CORE inside the Player Model's Torso Cavity
  rig.sheathedPlayerCoreGroup.visible = cameraMode !== 'first-person';
  const charHeightScale = world.playableCharacter.heightScale || 1.0;
  rig.sheathedPlayerCoreGroup.position.set(
    playerPos.x,
    playerPos.y + 1.18 * charHeightScale,
    playerPos.z
  );

  // Strictly confined to 0.11m scale so it stays 100% sheathed inside the player's body!
  const internalSheathScale = 0.11 * charHeightScale;
  const projectedVertices: THREE.Vector3[] = [];
  for (let v = 0; v < 16; v++) {
    const rot4 = rotate4DOmnidirectional(
      TESSERACT_VERTICES_4D[v],
      angleXW,
      angleYW,
      angleZW,
      angleXY
    );
    projectedVertices.push(project4DToLocal3D(rot4, internalSheathScale));
  }

  for (let e = 0; e < TESSERACT_EDGES.length; e++) {
    const [va, vb] = TESSERACT_EDGES[e];
    const pa = projectedVertices[va];
    const pb = projectedVertices[vb];
    const idx = e * 6;
    rig.sheathedEdgePositions[idx] = pa.x;
    rig.sheathedEdgePositions[idx + 1] = pa.y;
    rig.sheathedEdgePositions[idx + 2] = pa.z;
    rig.sheathedEdgePositions[idx + 3] = pb.x;
    rig.sheathedEdgePositions[idx + 4] = pb.y;
    rig.sheathedEdgePositions[idx + 5] = pb.z;
  }
  rig.sheathedTesseractLines.geometry.attributes.position.needsUpdate = true;

  rig.sheathedInnerOmegaCore.rotation.set(angleXW, angleYW, angleZW);
  rig.sheathedMicroInsides.forEach((node, idx) => {
    const ang =
      nowSec * 1.4 + (idx / rig.sheathedMicroInsides.length) * Math.PI * 2;
    const r = 0.068 * charHeightScale;
    node.position.set(
      Math.cos(ang) * r,
      Math.sin(nowSec * 2.2 + idx) * 0.035,
      Math.sin(ang) * r
    );
  });

  // 4. Synchronize, Grow, and Evolve Worldspace 3D L-System Procedural Artforms by W-Coordinate
  const activeArtIds = new Set(worldArtforms.map((a) => a.id));
  for (const [id, entry] of rig.spawnedArtformEntries.entries()) {
    if (!activeArtIds.has(id)) {
      rig.worldspaceArtformsGroup.remove(entry.group);
      rig.spawnedArtformEntries.delete(id);
    }
  }
  let totalLSystemBranches = 0;
  for (const art of worldArtforms) {
    let entry = rig.spawnedArtformEntries.get(art.id);
    if (!entry) {
      entry = buildLSystemProceduralArtform3DMesh(
        art,
        world,
        wCoord,
        evaluateTerrainHeight
      );
      rig.worldspaceArtformsGroup.add(entry.group);
      rig.spawnedArtformEntries.set(art.id, entry);
    }
    updateLSystemProceduralArtformEntry(
      entry,
      world,
      wCoord,
      nowSec,
      evaluateTerrainHeight
    );
    totalLSystemBranches += entry.branchCount;
  }

  const activeWRegime = resolveLSystemWEvolutionRegime(wCoord, 0);

  // 5. Compute Biocomplexity & Omniversal Substrate Identification Progress
  const seatedOtherInsidesCount = Math.max(
    1,
    favoritedAnchors.length + epochCount
  );
  const interstitialCount = Math.max(1, seatedOtherInsidesCount - 1);

  const fractionalMetricBleed = Number(
    THREE.MathUtils.clamp(
      0.34 +
        Math.abs(wCoord) * 0.28 +
        Math.min(0.28, novelEventsCount * 0.03) +
        Math.sin(rig.evolutionAccum * 0.7) * 0.08,
      0.12,
      0.99
    ).toFixed(2)
  );

  const biocomplexityIndex = Number(
    (
      1.0 +
      novelEventsCount * 0.24 +
      worldArtforms.length * 0.65 +
      seatedOtherInsidesCount * 0.38 +
      rig.playerActionTimeAccum * 0.012
    ).toFixed(2)
  );

  const omniversalSubstratePct = Math.round(
    THREE.MathUtils.clamp(
      26 +
        seatedOtherInsidesCount * 9 +
        novelEventsCount * 4.5 +
        worldArtforms.length * 8 +
        rig.playerActionTimeAccum * 0.18,
      18,
      100
    )
  );
  const isOmniversallyIdentified = omniversalSubstratePct >= 100;

  const cellIndex =
    Math.abs(
      Math.floor(
        (angleXW + angleYW * 1.3 + angleZW * 0.7 + wCoord * 2.5) * 1.8
      )
    ) % FOREROOMS_SPELLING_VARIANTS.length;
  const activeVariant = FOREROOMS_SPELLING_VARIANTS[cellIndex];
  const dispMeta = FOREROOMS_DISPOSITION_CATALOG[activeDisposition];

  const matter5DTranslationRate = Math.round(
    THREE.MathUtils.clamp(
      48 + fractionalMetricBleed * 42 + worldArtforms.length * 3,
      20,
      100
    )
  );

  const futureSurfaceEncodingPct = Math.round(
    THREE.MathUtils.clamp(
      62 + Math.cos(angleXW - angleZW) * 18 + Math.min(20, novelEventsCount * 2),
      25,
      100
    )
  );

  const gravityModulator =
    activeDisposition === 'beyond-future-void'
      ? 0.84
      : activeDisposition === 'below-foundation-bleed'
      ? 1.14
      : activeDisposition === 'deeper-than-inside-nexus'
      ? 0.92
      : 1.0;

  const stiffnessModulator =
    activeDisposition === 'below-foundation-bleed'
      ? 1.18
      : activeDisposition === 'deeper-than-inside-nexus' ||
        isOmniversallyIdentified
      ? 1.15
      : 1.0;

  return {
    telemetry: {
      activeSpelling: activeVariant.spelling,
      spellingMeaning: activeVariant.ideologicalMeaning,
      activeDisposition,
      dispositionLabel: dispMeta.shortLabel,
      fractionalMetricBleed,
      matter5DTranslationRate,
      futureSurfaceEncodingPct,
      proceduralEvolutionEpoch: Number((rig.evolutionAccum * 0.25).toFixed(2)),
      dominantTesseractCell: activeVariant.dominantCellName,
      seatedOtherInsidesCount,
      perspectiveAngle4D: [
        Number(angleXW.toFixed(2)),
        Number(angleYW.toFixed(2)),
        Number(angleZW.toFixed(2)),
      ],
      playerActionTimeSec: Number(rig.playerActionTimeAccum.toFixed(1)),
      biocomplexityIndex,
      omniversalSubstratePct,
      isOmniversallyIdentified,
      encodedEventsCount: novelEventsCount,
      interstitialOriginsCount: interstitialCount,
      spawnedArtformsCount: worldArtforms.length,
      activeLSystemRegimeLabel: activeWRegime.label,
      activeLSystemTotalBranches: totalLSystemBranches,
      activeWCoordinateInfluenceFactor:
        activeWRegime.wCoordinateInfluenceFactor,
      activeLSystemRecursionDepth: activeWRegime.modulatedRecursionDepth,
      activeBranchAngleVarianceDeg: activeWRegime.branchAngleVarianceDeg,
      activeVitalityStateLabel: activeWRegime.vitalityLabel,
    },
    gravityModulator,
    stiffnessModulator,
  };
}
