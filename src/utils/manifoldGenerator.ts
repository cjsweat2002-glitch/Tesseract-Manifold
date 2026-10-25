import * as THREE from 'three';
import {
  BuildingPresetBlock,
  BuildingPresetBlueprint,
  CraftingRecipe,
  DamageGoreModality,
  DimensionalWeatherSystemSpec,
  EcologicalDietRole,
  EntityAuraOrbitStyle,
  EntityBlueprint,
  EntityDorsalApparatus,
  EntityHeadStyle,
  EntityMorphology,
  EntityTailApparatus,
  GeometryCarvingStyle,
  ManifoldWorldSpec,
  PlayableBodyArchetype,
  PlayableCharacterSpec,
  ProceduralPropModelSpec,
  ProceduralTerrainSectorSpec,
  ResourceId,
  ResourceMetadata,
  TerrainExcavationSpot,
  VoidElementType,
  WorldTopologyArchetype,
} from '../types/manifold';
import {
  DIFFERENTIAL_UNIVERSE_BOUNDARIES,
  DifferentialUniverseBoundaryId,
  TimelineLandformArchetype,
} from '../types/portalAndBiodepth';
import { proceduralEnvironmentEngine } from './proceduralEnvironmentEngine';
import {
  applyBlenderLaplacianSmoothModifier,
  evaluateProceduralSectorElevationDelta,
} from './blenderProceduralWorldEngine';
import {
  pickSeededLexiconTriad,
  synthesizeLexiconTriad,
} from './lexiconOntologyEngine';
import {
  ALL_SKIN_TOPOLOGY_STYLES,
  buildDermalTopologyOverlayGroup,
  createComplexSkinMaterial,
  prepareDeformableSkinGeometry,
  resolveCharacterSkinTopology,
  resolveEntitySkinTopology,
} from './skinTopologyEngine';
import {
  ASTRA_ARGON_ARCHITECTURAL_CODEX,
  buildMasterArchitecturalModuleMesh,
  buildMonumentalWorldPropMesh,
  buildRelationalArchitecturalJoinery,
  buildScarpaSteppedCorbelGroup,
  buildTheoJansenKineticLinkageGroup,
  createCalabiYauRosetteGeometry,
  createDifferentialGrowthRibbonGeometry,
  createHyperbolicPseudosphereGeometry,
  createTPMSGyroidShellGeometry,
} from './architecturalWisdomEngine';
import {
  buildNaumGaboStringedConstructGroup,
  createBoccioniSpatialContinuityGeometry,
  createImplicitMetaballPiercedGeometry,
} from './dimensionalBleedAndAnomalyEngine';
import {
  enhanceMaterialWithSurfaceWearAndVeins,
  sharedGeometryPool,
  spatialCollisionSolver,
} from './graphicsMeshAndCollisionEngine';
import { autonomicEquationEngine } from './autonomicArchitectureAndEquationEngine';

export const RESOURCE_CATALOG: Record<ResourceId, ResourceMetadata> = {
  'ferro-chitin': {
    id: 'ferro-chitin',
    name: 'Ferro-Chitin Carapace',
    biologicalOrigin: 'Mineralized exoskeletal plates shed by subterranean tectonic fauna.',
    color: '#f59e0b',
  },
  'biolum-mycelium': {
    id: 'biolum-mycelium',
    name: 'Bioluminescent Mycelium',
    biologicalOrigin: 'Neural fungal threads that pulse with faint human circadian rhythms.',
    color: '#10b981',
  },
  'calcified-memory': {
    id: 'calcified-memory',
    name: 'Calcified Memory Coral',
    biologicalOrigin: 'Porous calcium-ivory formations preserving acoustic human echoes.',
    color: '#f43f5e',
  },
  'vitreous-aether': {
    id: 'vitreous-aether',
    name: 'Vitreous Aether Silica',
    biologicalOrigin: 'Refractive vascular glass formed under 4D phase compression.',
    color: '#38bdf8',
  },
  'void-singularity-dust': {
    id: 'void-singularity-dust',
    name: 'Void Singularity Condensate',
    biologicalOrigin: 'Zero-point elemental ash harvested from dimensional fold seams.',
    color: '#a855f7',
  },
};

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'craft-void-catalyst',
    name: 'Distill Void Singularity Condensate',
    category: 'void-catalyst',
    description: 'Transmutes raw terrain minerals inside your Left-Hand Void Ball into pure dimensional teleportation fuel.',
    cost: { 'ferro-chitin': 2, 'biolum-mycelium': 2 },
    effectType: 'synthesize-void-dust',
  },
  {
    id: 'craft-tendon-augment',
    name: 'Pneumatic Tendon Graft',
    category: 'augmentation',
    description: 'Biologically augments your playable character’s jump impulse (+22%) and manifold stride velocity (+15%).',
    cost: { 'biolum-mycelium': 3, 'calcified-memory': 2 },
    effectType: 'boost-jump-biology',
  },
  {
    id: 'craft-symbiotic-entity',
    name: 'Incubate Symbiotic Manifold Entity',
    category: 'augmentation',
    description: 'Synthesizes a high-stiffness multi-limbed biological guardian entity directly at your coordinates.',
    cost: { 'ferro-chitin': 3, 'calcified-memory': 2, 'vitreous-aether': 1 },
    effectType: 'spawn-symbiotic-entity',
  },
  {
    id: 'craft-deploy-structure',
    name: 'Materialize Active Void Building Preset',
    category: 'dimensional-structure',
    description: 'Projects your currently selected Pocket Void Building Preset onto the terrain in front of you.',
    cost: { 'ferro-chitin': 2, 'vitreous-aether': 2 },
    effectType: 'place-active-preset',
  },
];

export const DEFAULT_BUILDING_PRESETS: BuildingPresetBlueprint[] = [
  ...ASTRA_ARGON_ARCHITECTURAL_CODEX.map((entry) => entry.presetBlueprint),
  {
    id: 'preset-mycelial-observatory',
    name: 'Bioluminescent Void Observatory',
    description:
      'Elevated mycelial ring-conduit platform for cross-dimensional horizon scanning.',
    paradigm: 'argon-implicit-morphogenesis',
    architecturalLineage: 'Biomimetic Mycelial Canopy & Solenoid Gimbal',
    mathematicalFormula: 'Torus(R, r) ⊕ GeodesicVault(S²)',
    cost: { 'biolum-mycelium': 2, 'vitreous-aether': 2 },
    createdAt: 1728160050000,
    blocks: [
      { id: 'm1', gx: 0, gy: 0, gz: 0, shape: 'gyroid-minimal-shell', color: '#1e293b', emissive: false },
      { id: 'm2', gx: 0, gy: 1, gz: 0, shape: 'tensegrity-strut-prism', color: '#1e293b', emissive: false },
      { id: 'm3', gx: 0, gy: 2, gz: 0, shape: 'cantilever-deck', color: '#0f172a', emissive: false },
      { id: 'm4', gx: -1, gy: 2, gz: 0, shape: 'cantilever-deck', color: '#10b981', emissive: true },
      { id: 'm5', gx: 1, gy: 2, gz: 0, shape: 'cantilever-deck', color: '#10b981', emissive: true },
      { id: 'm6', gx: 0, gy: 3, gz: 0, shape: 'ring-conduit', color: '#a855f7', emissive: true },
      { id: 'm7', gx: 0, gy: 4, gz: 0, shape: 'dome', color: '#38bdf8', emissive: true },
    ],
  },
];

// Deterministic Mulberry32 PRNG
export function createSeededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let activeProceduralSectorsRegistry: ProceduralTerrainSectorSpec[] = [];
let activeHyperbolicCurvatureRegistry: number = 0;
let activePortalRoomFloorCallback:
  | ((x: number, z: number, currentY: number) => number)
  | null = null;

export function setActiveProceduralSectorsForTerrain(
  sectors: ProceduralTerrainSectorSpec[]
): void {
  activeProceduralSectorsRegistry = sectors;
}

export function getActiveProceduralSectorsForTerrain(): ProceduralTerrainSectorSpec[] {
  return activeProceduralSectorsRegistry;
}

let activeDimensionIndexRegistry = 1.0;
let activeTimelineLandformRegistry: TimelineLandformArchetype = 'sky-atoll-archipelago';
let activeTimelineSeedRegistry: number = 137;
let activeSuperflatModeRegistry: boolean = true;

export function setActiveSuperflatMode(enabled: boolean): void {
  activeSuperflatModeRegistry = enabled;
}

export function getActiveSuperflatMode(): boolean {
  return activeSuperflatModeRegistry;
}

export function setActiveHyperbolicCurvature(k: number): void {
  activeHyperbolicCurvatureRegistry = k;
}

export function setActiveDimensionIndex(dimIndex: number): void {
  activeDimensionIndexRegistry = dimIndex;
}

export function getActiveDimensionIndex(): number {
  return activeDimensionIndexRegistry;
}

export function setActiveTimelineLandform(
  archetype: TimelineLandformArchetype,
  timelineSeed: number
): void {
  activeTimelineLandformRegistry = archetype;
  activeTimelineSeedRegistry = timelineSeed;
}

export function setActivePortalRoomFloorEvaluator(
  evaluator: ((x: number, z: number, currentY: number) => number) | null
): void {
  activePortalRoomFloorCallback = evaluator;
}

/**
 * Evaluates 8 radically distinct timeline-specific 3D geographies so every timeline coordinate
 * completely transforms the planet's canyons, islands, spires, mesas, and valleys.
 */
function evaluateTimelineLandformTopography(
  x: number,
  z: number,
  archetype: TimelineLandformArchetype,
  timelineSeed: number
): number {
  const phaseX = ((timelineSeed % 997) - 498) * 0.037;
  const phaseZ = (((timelineSeed >> 5) % 991) - 495) * 0.041;
  const rotAngle = (timelineSeed % 360) * (Math.PI / 180);
  const cosA = Math.cos(rotAngle);
  const sinA = Math.sin(rotAngle);
  const rx = x * cosA - z * sinA + phaseX;
  const rz = x * sinA + z * cosA + phaseZ;
  const r = Math.hypot(x, z);
  const theta = Math.atan2(rz, rx);

  switch (archetype) {
    case 'sky-atoll-archipelago': {
      // Stepped floating sky-atoll plateaus with deep abyssal trenches and natural causeway bridges
      const islandField =
        Math.cos(rx * 0.065) * Math.cos(rz * 0.065) +
        0.45 * Math.sin(rx * 0.11 + rz * 0.09);
      if (islandField > 0.15) {
        const terrace = Math.round(islandField * 4.0) * 3.2;
        return terrace + Math.sin(rx * 0.22) * 0.8;
      }
      const bridge =
        Math.abs(Math.sin(theta * 3.0)) < 0.22 ? 1.5 : -11.5 + islandField * 6.0;
      return bridge;
    }
    case 'spiral-nautilus-terraces': {
      // Fibonacci logarithmic spiral canyons and stepped golden-ratio ziggurat shelves
      const spiralArm = Math.sin(r * 0.11 - theta * 3.0 + phaseX);
      const steppedShelf = Math.round(spiralArm * 3.5) * 2.6;
      const radialWell = Math.cos(r * 0.045) * 5.2;
      return steppedShelf + radialWell;
    }
    case 'twisted-mobius-canyons': {
      // Deep winding serpentine river-gorges flanked by towering overhanging canyon walls
      const canyonMeander = Math.sin(rx * 0.048 + Math.cos(rz * 0.052) * 2.4);
      const gorgeDepth =
        Math.abs(canyonMeander) < 0.34
          ? -12.5 * (1.0 - Math.abs(canyonMeander) / 0.34)
          : Math.pow(Math.min(1.4, Math.abs(canyonMeander) - 0.34), 0.75) * 13.5;
      const hoodooSpire =
        Math.max(0, Math.sin(rx * 0.19) * Math.cos(rz * 0.19) - 0.55) * 18.0;
      return gorgeDepth + hoodooSpire;
    }
    case 'hex-basalt-organ-pipes': {
      // Giant hexagonal columnar basalt towers and sunken geothermal caldera pools
      const k1 = rx * 0.12;
      const k2 = (rx * 0.5 + rz * 0.866) * 0.12;
      const k3 = (rx * 0.5 - rz * 0.866) * 0.12;
      const hexCell = Math.cos(k1) + Math.cos(k2) + Math.cos(k3);
      const columnHeight = Math.round(hexCell * 2.2) * 2.85;
      return columnHeight;
    }
    case 'inverted-crater-caldera': {
      // Concentric ring-mountains surrounding a central high-altitude levitating caldera peak
      const ring1 = Math.exp(-Math.pow((r - 36) / 11, 2)) * 15.5;
      const ring2 = Math.exp(-Math.pow((r - 78) / 14, 2)) * 19.0;
      const moat = -Math.exp(-Math.pow((r - 55) / 10, 2)) * 10.5;
      const azimuthalNotch = Math.sin(theta * 5.0 + phaseZ) * 3.2;
      return ring1 + ring2 + moat + azimuthalNotch;
    }
    case 'colossal-ribcage-badlands': {
      // Fossilized titan spine ridge down the axis with periodic sweeping rib-arches and marrow trenches
      const spineDist = Math.abs(rx);
      const ribWave = Math.cos(rz * 0.16) * Math.exp(-spineDist * 0.028) * 14.0;
      const valley = Math.sin(rx * 0.07) * 5.5 - (spineDist < 12 ? -3.5 : 4.0);
      return ribWave + valley;
    }
    case 'voronoi-shattered-mesas': {
      // Tectonic flat-topped mesas separated by glowing fissure chasms
      const cellX = Math.sin(rx * 0.075) + 0.5 * Math.cos(rz * 0.11);
      const cellZ = Math.cos(rz * 0.075) - 0.5 * Math.sin(rx * 0.11);
      const mesa = cellX * cellZ;
      if (Math.abs(mesa) < 0.18) {
        return -10.5; // Deep tectonic fissure chasm
      }
      return Math.sign(mesa) * 7.8 + Math.round(mesa * 2.0) * 2.4;
    }
    case 'crystalline-harmonic-dunes':
    default: {
      // Sweeping interference-wave desert dunes punctuated by towering quartz needles
      const dune =
        Math.pow(Math.abs(Math.sin(rx * 0.055 + Math.sin(rz * 0.04) * 1.5)), 1.6) *
          11.0 -
        4.0;
      const quartzSpire =
        Math.sin(rx * 0.17) * Math.cos(rz * 0.17) > 0.68 ? 16.5 : 0;
      return dune + quartzSpire;
    }
  }
}

/**
 * Evaluates a distinct 3D spatial landform architecture for integer dimension `d` (D1..D7+),
 * so shifting dimensions transforms the physical 3D place, elevation architecture, canyons,
 * Escher ziggurats, and non-Euclidean basins — not just textures!
 */
function evaluateIntegerDimensionSpatialLandform(
  x: number,
  z: number,
  intDim: number
): number {
  const r = Math.hypot(x, z);
  const theta = Math.atan2(z, x);
  const mode = ((Math.abs(intDim - 1) % 7) + 7) % 7;

  if (mode === 0) {
    // D1: Crystalline Hyper-Mesa — Stepped hexagonal tablelands & flat-topped plateau shelves
    const hexWave =
      Math.cos(x * 0.085) +
      Math.cos((x * 0.5 + z * 0.866) * 0.085) +
      Math.cos((x * 0.5 - z * 0.866) * 0.085);
    return Math.round(hexWave * 1.4) * 1.85;
  } else if (mode === 1) {
    // D2: Ferro-Superfluid Toroidal Amphitheater — Concentric standing-wave rings & spiral channels
    const ringWave = Math.sin(r * 0.16 - theta * 2.0) * 4.2;
    const meniscus = Math.cos(r * 0.075) * 3.4;
    return ringWave + meniscus;
  } else if (mode === 2) {
    // D3: Zeolite Karst Spire Cathedral — Soaring vertical karst needles & deep alveolar hollows
    const spireGrid = Math.sin(x * 0.13) * Math.sin(z * 0.13);
    const needle =
      spireGrid > 0 ? Math.pow(spireGrid, 1.8) * 11.5 : spireGrid * 4.2;
    return needle;
  } else if (mode === 3) {
    // D4: Escher-Psychotropic Labyrinth & Hyperbolic Saddle Canyons — Stepped 90° orthogonal terraces
    const stepX = Math.round(Math.sin(x * 0.09) * 3.0) * 1.65;
    const stepZ = Math.round(Math.cos(z * 0.09) * 3.0) * 1.65;
    const saddle = ((x * x - z * z) * 0.0028) / (1.0 + 0.0008 * r * r);
    return stepX + stepZ - saddle;
  } else if (mode === 4) {
    // D5: Basaltic Subduction Rift & Cardinal Ziggurat Causeways — Deep chasm bisected by 4 raised bridges
    const chasm = -Math.exp(-Math.pow(Math.sin(x * 0.055 + z * 0.035), 2) * 5.0) * 8.5;
    const causeway =
      Math.min(Math.abs(x), Math.abs(z)) < 5.5
        ? 3.2
        : Math.round(Math.cos(r * 0.11) * 2.5) * 1.8;
    return chasm + causeway;
  } else if (mode === 5) {
    // D6: Fulgurite Brutalist Foundry — Sunken orthogonal courts & monolithic stepped plinths
    const blockX = Math.floor(Math.abs(x) / 14) % 2 === 0 ? 1 : -1;
    const blockZ = Math.floor(Math.abs(z) / 14) % 2 === 0 ? 1 : -1;
    const court = blockX * blockZ * 3.6;
    const ridge = Math.sin(x * 0.18) * Math.cos(z * 0.18) * 2.2;
    return court + ridge;
  } else {
    // D7+: Calabi-Yau 6D Rosette Nexus — 6-fold harmonic petal ridges & inverted gravity crater
    const petal = Math.cos(theta * 6.0 + r * 0.06) * Math.sin(r * 0.09) * 6.8;
    const rim = Math.sin(r * 0.05) * 4.5;
    return petal + rim;
  }
}

/**
 * Evaluates the raw analytical heightfield at a single (x, z) point (used for mesh vertex generation
 * and bilinear triangle interpolation). Enforces a persistent dimensional bedrock floor plane (-36m)
 * and guards against NaN/Infinity in all dimensions.
 */
export function evaluateRawPointTerrainHeight(
  x: number,
  z: number,
  world: ManifoldWorldSpec,
  excavations?: TerrainExcavationSpot[],
  hyperbolicK?: number
): number {
  if (!Number.isFinite(x) || !Number.isFinite(z) || !world?.terrainConfig) {
    return 0;
  }

  // Superflat Proving Ground Mode: Pure Y = 0.0m testing plane across the entire map while preserving player-dug excavations!
  if (activeSuperflatModeRegistry) {
    let flatH = 0.0;
    if (excavations && excavations.length > 0) {
      for (let i = 0; i < excavations.length; i++) {
        const ex = excavations[i];
        const dx = x - ex.x;
        const dz = z - ex.z;
        const distSq = dx * dx + dz * dz;
        const rSq = ex.radius * ex.radius;
        if (distSq < rSq) {
          const dist = Math.sqrt(distSq);
          const normD = dist / ex.radius;
          if (normD < 0.82) {
            const bowlT = 1.0 - normD / 0.82;
            flatH -= ex.depth * Math.pow(Math.sin(bowlT * Math.PI * 0.5), 1.15);
          } else {
            const rimT = (normD - 0.82) / 0.18;
            flatH += ex.depth * 0.16 * Math.sin(rimT * Math.PI);
          }
        }
      }
    }
    return Math.max(-36.0, flatH);
  }

  const {
    amplitude,
    frequency,
    octaves,
    ridgeSharpness,
    terraceSteps,
    craterDensity,
  } = world.terrainConfig;
  const seedOffset =
    ((world.seed + activeTimelineSeedRegistry) % 1000) * 0.173;

  let total = 0;
  let amp = amplitude;
  let freq = frequency;

  for (let i = 0; i < octaves; i++) {
    const nx = x * freq + seedOffset * (i + 1) + world.manifoldCoord[3] * 1.7;
    const nz = z * freq - seedOffset * (i + 1.5) + world.manifoldCoord[0] * 0.9;

    const raw =
      Math.sin(nx) * Math.cos(nz) +
      0.5 * Math.sin(nx * 1.618 + nz * 1.31) +
      0.25 * Math.cos(nx * 2.41 - nz * 1.93);

    const normalized = raw / 1.75;
    const ridged = 1.0 - Math.abs(normalized);
    const shaped =
      normalized * (1 - ridgeSharpness) +
      (ridged * ridged * 2 - 1) * ridgeSharpness;

    total += shaped * amp;
    amp *= 0.48;
    freq *= 2.07;
  }

  let height = total;

  if (terraceSteps > 1) {
    const stepSize = amplitude / terraceSteps;
    const quantized = Math.round(height / stepSize) * stepSize;
    height = height * 0.35 + quantized * 0.65;
  }

  if (craterDensity > 0.1) {
    const gridX =
      Math.sin(x * 0.055 + seedOffset) * Math.cos(z * 0.055 - seedOffset);
    if (gridX > 0.55) {
      const rim = (gridX - 0.55) / 0.45;
      height -= Math.sin(rim * Math.PI) * amplitude * 0.6 * craterDensity;
    }
  }

  const distFromCenter = Math.hypot(x, z);
  const centerFlatten = Math.min(1, Math.max(0.18, (distFromCenter - 8) / 28));
  let finalH = height * centerFlatten;

  // Apply Dimension-Specific Spatial Landform + ProceduralEnvironmentEngine Multi-Layered Timeline Heightmap!
  const dim = activeDimensionIndexRegistry;
  const dimLow = Math.floor(dim);
  const dimHigh = Math.ceil(dim);
  const dimFrac = dim - dimLow;
  const landformLow = evaluateIntegerDimensionSpatialLandform(x, z, dimLow);
  const landformHigh =
    dimHigh === dimLow
      ? landformLow
      : evaluateIntegerDimensionSpatialLandform(x, z, dimHigh);
  const blendedDimLandform = THREE.MathUtils.lerp(
    landformLow,
    landformHigh,
    dimFrac
  );

  const activeEnvProfile = proceduralEnvironmentEngine.getActiveProfile();
  if (activeEnvProfile) {
    // Use the ProceduralEnvironmentEngine's seed-unique domain-warped multi-octave heightmap as the primary geography!
    const procHeight = proceduralEnvironmentEngine.evaluateHeightAt(
      x,
      z,
      activeEnvProfile
    );
    finalH = procHeight + blendedDimLandform * 0.14 + finalH * 0.12;
  } else {
    const timelineLandform = evaluateTimelineLandformTopography(
      x,
      z,
      activeTimelineLandformRegistry,
      activeTimelineSeedRegistry
    );
    const dimSpatialWeight = Math.min(
      1,
      Math.max(0.12, (distFromCenter - 6) / 18)
    );
    finalH =
      finalH * 0.34 +
      (blendedDimLandform * 0.35 + timelineLandform * 0.85) * dimSpatialWeight;
  }

  // Apply dramatic tectonic elevation differences from procedurally generated map-edge sectors
  if (activeProceduralSectorsRegistry.length > 0) {
    finalH += evaluateProceduralSectorElevationDelta(
      x,
      z,
      activeProceduralSectorsRegistry
    );
  }

  // Apply Self-Evolving Nonlinear Coupled Differential Tensor (Hamiltonian Geodesic + Reaction-Diffusion Morphogen)
  finalH += autonomicEquationEngine.evaluateCoupledTerrainDifferentialDelta(
    x,
    z,
    world.seed
  );

  // Apply player-mined excavations (supports both micro-scoops and deep cumulative trenches)
  if (excavations && excavations.length > 0) {
    for (let i = 0; i < excavations.length; i++) {
      const ex = excavations[i];
      const dx = x - ex.x;
      const dz = z - ex.z;
      const distSq = dx * dx + dz * dz;
      const rSq = ex.radius * ex.radius;
      if (distSq < rSq) {
        const dist = Math.sqrt(distSq);
        const normD = dist / ex.radius;
        if (normD < 0.82) {
          const bowlT = 1.0 - normD / 0.82;
          finalH -= ex.depth * Math.pow(Math.sin(bowlT * Math.PI * 0.5), 1.15);
        } else {
          const rimT = (normD - 0.82) / 0.18;
          finalH += ex.depth * 0.16 * Math.sin(rimT * Math.PI);
        }
      }
    }
  }

  // 5. Non-Euclidean Hyperbolic Riemannian Metric Saddle & Poincaré Horocycle Waves
  const effK =
    hyperbolicK !== undefined ? hyperbolicK : activeHyperbolicCurvatureRegistry;
  if (Math.abs(effK) > 0.0001) {
    const rSq = x * x + z * z;
    const saddle = (effK * (x * x - z * z)) / (1.0 + 0.0014 * rSq);
    const horoWave =
      Math.sin(x * 0.12) *
      Math.sinh(Math.min(2.0, Math.abs(z) * 0.03)) *
      (effK * 16.0);
    finalH += saddle + horoWave;
  }

  if (!Number.isFinite(finalH)) return 0;
  // Enforce persistent bedrock safety floor plane so no entity or player can ever fall into infinite void
  return Math.max(-36.0, finalH);
}

const TERRAIN_HALF_SIZE = 140;
const TERRAIN_SEGS = 180;
const TERRAIN_STRIDE = TERRAIN_SEGS + 1; // 181x181 vertices
const activeBakedTerrainGrid = new Float32Array(TERRAIN_STRIDE * TERRAIN_STRIDE);
const activeBakedBaseGrid = new Float32Array(TERRAIN_STRIDE * TERRAIN_STRIDE);
let bakedGridWorldId = '';
let bakedGridExcavationCount = -1;
let bakedGridLastExcavationDepth = -1;
let bakedGridDimIndex = -999;
let bakedGridHyperbolicK = -999;
let bakedGridTimelineLandform = '';
let bakedGridTimelineSeed = -999;
let bakedGridSuperflatMode = true;

/**
 * Bakes the 181x181 vertex heightfield once when terrain is built, excavated, dimension-shifted, or timeline-jumped.
 * Eliminates >200,000 redundant trig evaluations during terrain deformation and makes per-frame
 * physics/ragdoll/foliage height queries O(1) array lookups!
 */
export function bakeActiveTerrainHeightGrid(
  world: ManifoldWorldSpec,
  excavations?: TerrainExcavationSpot[],
  hyperbolicK?: number
): { baseGrid: Float32Array; dugGrid: Float32Array } {
  const effK =
    hyperbolicK !== undefined ? hyperbolicK : activeHyperbolicCurvatureRegistry;
  const exCount = excavations ? excavations.length : 0;
  const lastDepth =
    exCount > 0 && excavations ? excavations[exCount - 1].depth : 0;

  const cellSize = (TERRAIN_HALF_SIZE * 2) / TERRAIN_SEGS;
  for (let iz = 0; iz <= TERRAIN_SEGS; iz++) {
    const vz = -TERRAIN_HALF_SIZE + iz * cellSize;
    const rowOffset = iz * TERRAIN_STRIDE;
    for (let ix = 0; ix <= TERRAIN_SEGS; ix++) {
      const vx = -TERRAIN_HALF_SIZE + ix * cellSize;
      const baseY = evaluateRawPointTerrainHeight(
        vx,
        vz,
        world,
        undefined,
        effK
      );
      activeBakedBaseGrid[rowOffset + ix] = baseY;

      let dugY = baseY;
      if (excavations && exCount > 0) {
        for (let i = 0; i < exCount; i++) {
          const ex = excavations[i];
          const dx = vx - ex.x;
          const dz = vz - ex.z;
          const distSq = dx * dx + dz * dz;
          const rSq = ex.radius * ex.radius;
          if (distSq < rSq) {
            const dist = Math.sqrt(distSq);
            const normD = dist / ex.radius;
            if (normD < 0.82) {
              const bowlT = 1.0 - normD / 0.82;
              dugY -= ex.depth * Math.pow(Math.sin(bowlT * Math.PI * 0.5), 1.15);
            } else {
              const rimT = (normD - 0.82) / 0.18;
              dugY += ex.depth * 0.16 * Math.sin(rimT * Math.PI);
            }
          }
        }
        dugY = Math.max(-36.0, dugY);
      }
      activeBakedTerrainGrid[rowOffset + ix] = dugY;
    }
  }

  bakedGridWorldId = world.id;
  bakedGridExcavationCount = exCount;
  bakedGridLastExcavationDepth = lastDepth;
  bakedGridDimIndex = activeDimensionIndexRegistry;
  bakedGridHyperbolicK = effK;
  bakedGridTimelineLandform = activeTimelineLandformRegistry;
  bakedGridTimelineSeed = activeTimelineSeedRegistry;
  bakedGridSuperflatMode = activeSuperflatModeRegistry;

  return { baseGrid: activeBakedBaseGrid, dugGrid: activeBakedTerrainGrid };
}

/**
 * Uniform Floor-Snap Terrain Evaluator:
 * Inside the central 280x280m terrain mesh (180x180 segments), interpolates across the exact
 * Three.js PlaneGeometry triangle vertices using the O(1) baked heightfield grid so the physics
 * ground plane matches the rendered 3D triangle geometry with 0.0mm discrepancy and zero trig overhead!
 */
export function evaluateTerrainHeight(
  x: number,
  z: number,
  world?: ManifoldWorldSpec,
  excavations?: TerrainExcavationSpot[],
  hyperbolicK?: number
): number {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return 0;
  if (!world) {
    if (activeSuperflatModeRegistry) {
      return 0;
    }
    if (
      bakedGridWorldId &&
      Math.abs(x) < TERRAIN_HALF_SIZE &&
      Math.abs(z) < TERRAIN_HALF_SIZE
    ) {
      const cellSize = (TERRAIN_HALF_SIZE * 2) / TERRAIN_SEGS;
      const gx = (x + TERRAIN_HALF_SIZE) / cellSize;
      const gz = (z + TERRAIN_HALF_SIZE) / cellSize;
      const ix = Math.max(0, Math.min(TERRAIN_SEGS - 1, Math.floor(gx)));
      const iz = Math.max(0, Math.min(TERRAIN_SEGS - 1, Math.floor(gz)));
      return activeBakedTerrainGrid[iz * TERRAIN_STRIDE + ix] ?? 0;
    }
    return proceduralEnvironmentEngine.evaluateHeightAt(x, z);
  }

  if (Math.abs(x) < TERRAIN_HALF_SIZE && Math.abs(z) < TERRAIN_HALF_SIZE) {
    const effK =
      hyperbolicK !== undefined ? hyperbolicK : activeHyperbolicCurvatureRegistry;
    const exCount = excavations ? excavations.length : 0;
    const lastDepth =
      exCount > 0 && excavations ? excavations[exCount - 1].depth : 0;

    // Ensure the O(1) baked grid is fresh for the active world, dimension, timeline geography, superflat state, and excavation state
    if (
      bakedGridWorldId !== world.id ||
      bakedGridDimIndex !== activeDimensionIndexRegistry ||
      bakedGridTimelineLandform !== activeTimelineLandformRegistry ||
      bakedGridTimelineSeed !== activeTimelineSeedRegistry ||
      bakedGridSuperflatMode !== activeSuperflatModeRegistry ||
      Math.abs(bakedGridHyperbolicK - effK) > 1e-6 ||
      (excavations !== undefined &&
        (bakedGridExcavationCount !== exCount ||
          bakedGridLastExcavationDepth !== lastDepth))
    ) {
      bakeActiveTerrainHeightGrid(world, excavations, effK);
    }

    const grid =
      excavations === undefined && exCount > 0
        ? activeBakedBaseGrid
        : activeBakedTerrainGrid;

    const cellSize = (TERRAIN_HALF_SIZE * 2) / TERRAIN_SEGS;
    const gx = (x + TERRAIN_HALF_SIZE) / cellSize;
    const gz = (z + TERRAIN_HALF_SIZE) / cellSize;
    const ix = Math.min(TERRAIN_SEGS - 1, Math.max(0, Math.floor(gx)));
    const iz = Math.min(TERRAIN_SEGS - 1, Math.max(0, Math.floor(gz)));
    const fx = gx - ix;
    const fz = gz - iz;

    const row0 = iz * TERRAIN_STRIDE;
    const row1 = (iz + 1) * TERRAIN_STRIDE;
    const h00 = grid[row0 + ix];
    const h10 = grid[row0 + ix + 1];
    const h01 = grid[row1 + ix];
    const h11 = grid[row1 + ix + 1];

    // Three.js PlaneGeometry splits each quad (0,0)-(1,0)-(0,1)-(1,1) along the (1,0)-(0,1) diagonal:
    // Triangle A (fx + fz <= 1): (0,0), (1,0), (0,1)
    // Triangle B (fx + fz > 1):  (1,0), (1,1), (0,1)
    if (fx + fz <= 1.0) {
      return h00 + fx * (h10 - h00) + fz * (h01 - h00);
    } else {
      return h11 + (1.0 - fx) * (h01 - h11) + (1.0 - fz) * (h10 - h11);
    }
  }

  return evaluateRawPointTerrainHeight(x, z, world, excavations, hyperbolicK);
}

/**
 * Authoritative Cross-Dimensional & Portal-Room Unified Floor Evaluator:
 * Automatically detects whether an entity, player, or physics object is inside the
 * 36m×36m Square Portal Room vertical domain (Y >= 520, centered at Y = 600) or in the
 * exterior manifold dimension, and returns the exact persistent floor elevation.
 */
export function evaluateUnifiedAuthoritativeFloorY(
  x: number,
  z: number,
  currentY: number | undefined,
  world: ManifoldWorldSpec,
  excavations?: TerrainExcavationSpot[],
  hyperbolicK?: number
): number {
  if (currentY !== undefined && currentY >= 520) {
    if (activePortalRoomFloorCallback) {
      return activePortalRoomFloorCallback(x, z, currentY);
    }
    return 600.0;
  }
  const baseTerrainY = evaluateTerrainHeight(x, z, world, excavations, hyperbolicK);
  if (currentY !== undefined) {
    return spatialCollisionSolver.evaluateWalkableSupportElevation(
      x,
      z,
      currentY,
      baseTerrainY
    );
  }
  return baseTerrainY;
}

const WORLD_PREFIXES = [
  'Aethel',
  'Khoros',
  'Vespera',
  'Tesseract',
  'Solenoid',
  'Hyperion',
  'Calabi',
  'Valkyr',
  'Zeno',
  'Minkowski',
  'Ouroboros',
  'Thalassa',
  'Sanguis',
  'Nephele',
];

const WORLD_SUFFIXES = [
  'Prime Manifold',
  'Marrow Basin',
  'Ossuary Reach',
  'Mycelial Lattice',
  'Vascular Foundry',
  'Choir Expanse',
  'Chitin Ridge',
  'Pleura Fold',
];

const BIOLOGICAL_SIGNATURES = [
  'Endoskeletal basalt ribs pulsing with low-frequency bio-electric lymph.',
  'Photosynthetic glass kelp forests rooted in ferro-fluid tidal silt.',
  'Calcified tracheal spires that exhale warm spore-laden mist at dusk.',
  'Chitinous tectonic plates stitched together by luminescent tendon fibers.',
  'Vitreous coral alveoli that crystallize ambient kinetic shockwaves.',
  'Sub-dermal magnetic cartilage dunes shifting with the 4D W-phase.',
];

const SUBTLE_HUMAN_TRACES = [
  'Faint resonant lullaby harmonics hum inside the hollow wind-spires when wind crosses W=0.',
  'Worn stair-like terraces carved at the exact stride-length of a human memory.',
  'Translucent porcelain-like landmarks arranged in a quiet amphitheater of conversation.',
  'Warm hearth-colored bioluminescence that brightens whenever a traveler stands still.',
  'Pendulum monuments beating at 68 BPM—the resting pulse of an ancient human sleeper.',
  'Weathered archway proportions mirroring childhood doorways across forgotten latitudes.',
];

const ARCHETYPE_PRESETS: Record<
  WorldTopologyArchetype,
  {
    subtitle: string;
    primaryResource: ResourceId;
    secondaryResource: ResourceId;
    palette: ManifoldWorldSpec['palette'];
    propCategories: ProceduralPropModelSpec['category'][];
  }
> = {
  'non-euclidean-spires': {
    subtitle: 'Twisted Monolithic Obelisks & High-Relief Ridge Topology',
    primaryResource: 'vitreous-aether',
    secondaryResource: 'ferro-chitin',
    palette: {
      skyTop: '#070b14',
      skyHorizon: '#16243b',
      fogColor: '#111c2f',
      fogDensity: 0.0085,
      terrainLow: '#111827',
      terrainMid: '#1e293b',
      terrainHigh: '#38bdf8',
      gridLine: '#0ea5e9',
      accentColor: '#38bdf8',
      sunColor: '#e0f2fe',
    },
    propCategories: ['monolith-spire', 'tesseract-cage', 'hyper-arch'],
  },
  'gyro-lattice-basin': {
    subtitle: 'Ferro-Chitin Gyroscopic Organs & Terraced Marrow Conduits',
    primaryResource: 'ferro-chitin',
    secondaryResource: 'calcified-memory',
    palette: {
      skyTop: '#0c0a09',
      skyHorizon: '#291d12',
      fogColor: '#1f1610',
      fogDensity: 0.008,
      terrainLow: '#18130f',
      terrainMid: '#29221b',
      terrainHigh: '#f59e0b',
      gridLine: '#f59e0b',
      accentColor: '#f59e0b',
      sunColor: '#fef3c7',
    },
    propCategories: ['gyro-resonator', 'pendulum-rig', 'helix-conduit'],
  },
  'crystalline-hyper-mesa': {
    subtitle: 'Vitreous Vascular Plateaus & Refracting Tensor Pleura',
    primaryResource: 'vitreous-aether',
    secondaryResource: 'biolum-mycelium',
    palette: {
      skyTop: '#061214',
      skyHorizon: '#0f2e33',
      fogColor: '#0b2226',
      fogDensity: 0.0075,
      terrainLow: '#0d1f22',
      terrainMid: '#16353a',
      terrainHigh: '#2dd4bf',
      gridLine: '#14b8a6',
      accentColor: '#2dd4bf',
      sunColor: '#ccfbf1',
    },
    propCategories: ['tesseract-cage', 'monolith-spire', 'helix-conduit'],
  },
  'brutalist-pendulum-foundry': {
    subtitle: 'Calcified Ossuary Arches & Heartbeat Pendulum Craters',
    primaryResource: 'calcified-memory',
    secondaryResource: 'ferro-chitin',
    palette: {
      skyTop: '#0d0d11',
      skyHorizon: '#251a24',
      fogColor: '#1a131b',
      fogDensity: 0.009,
      terrainLow: '#141418',
      terrainMid: '#27272f',
      terrainHigh: '#fb7185',
      gridLine: '#f43f5e',
      accentColor: '#fb7185',
      sunColor: '#ffe4e6',
    },
    propCategories: ['pendulum-rig', 'hyper-arch', 'gyro-resonator'],
  },
  'biomech-coral-atoll': {
    subtitle: 'Bioluminescent Mycelial Spines & Living Exoskeletal Basin',
    primaryResource: 'biolum-mycelium',
    secondaryResource: 'calcified-memory',
    palette: {
      skyTop: '#07110d',
      skyHorizon: '#132e23',
      fogColor: '#0d2119',
      fogDensity: 0.008,
      terrainLow: '#0f1f18',
      terrainMid: '#1b362b',
      terrainHigh: '#4ade80',
      gridLine: '#22c55e',
      accentColor: '#4ade80',
      sunColor: '#dcfce7',
    },
    propCategories: ['helix-conduit', 'hyper-arch', 'gyro-resonator'],
  },
  'quantum-basalt-trench': {
    subtitle: 'Abyssal Singularity Faults & Neural Tesseract Cradles',
    primaryResource: 'void-singularity-dust',
    secondaryResource: 'vitreous-aether',
    palette: {
      skyTop: '#090910',
      skyHorizon: '#1c1d30',
      fogColor: '#131424',
      fogDensity: 0.0085,
      terrainLow: '#121320',
      terrainMid: '#22243a',
      terrainHigh: '#a78bfa',
      gridLine: '#8b5cf6',
      accentColor: '#a78bfa',
      sunColor: '#ede9fe',
    },
    propCategories: ['tesseract-cage', 'pendulum-rig', 'monolith-spire'],
  },
};

export const WEATHER_PRESETS_BY_ARCHETYPE: Record<
  WorldTopologyArchetype,
  DimensionalWeatherSystemSpec
> = {
  'non-euclidean-spires': {
    id: 'graviton-shear-squall',
    name: 'Tesseract Graviton Shear & Phase Sleet',
    biomePhysicsLawName: 'Spatial Folding & Angular Updraft Wells',
    biomePhysicsDescription:
      'Periodic graviton shear gusts tilt entity posture vectors, curve airborne trajectories, and invert vertical draft polarity across W=0.',
    cloud5DStyle: 'clifford-torus-billows',
    cloud5DName: '5D Clifford-Torus Hyper-Cumulus',
    scentBreezeName: 'Ozone-Silica Phase Breeze',
    particlePrimaryColor: '#38bdf8',
    particleSecondaryColor: '#e0f2fe',
    cloud5DColor: '#0ea5e9',
    causticRayColor: '#7dd3fc',
    scentBreezeColor: '#38bdf8',
    baseWindSpeed: 9.5,
    fluidViscosity: 0.14,
    vorticityTorque: 0.65,
    verticalDraftAmplitude: 4.8,
  },
  'gyro-lattice-basin': {
    id: 'coriolis-magneto-hail',
    name: 'Coriolis Magneto-Hail & Ferro-Squalls',
    biomePhysicsLawName: 'Lorentz Tangential Vortex Torque',
    biomePhysicsDescription:
      'Cyclonic magnetic flux winds apply tangential orbital torque to all biome entities, accelerating gyro rotors and spiraling loose matter.',
    cloud5DStyle: 'ferro-vortex-strata',
    cloud5DName: '5D Solenoid Gyro-Strata Canopy',
    scentBreezeName: 'Warm Iron-Marrow Slipstream',
    particlePrimaryColor: '#f59e0b',
    particleSecondaryColor: '#fef3c7',
    cloud5DColor: '#d97706',
    causticRayColor: '#fcd34d',
    scentBreezeColor: '#fbbf24',
    baseWindSpeed: 12.4,
    fluidViscosity: 0.18,
    vorticityTorque: 1.45,
    verticalDraftAmplitude: 2.6,
  },
  'crystalline-hyper-mesa': {
    id: 'piezoelectric-crystal-dust',
    name: 'Piezoelectric Prismatic Dust & Singing Gale',
    biomePhysicsLawName: 'Acoustic Vitrification & Harmonic Lift',
    biomePhysicsDescription:
      'Standing-wave pressure fronts vitrify entity joint stiffness into hyper-crystalline rebound or resonant shatter while refracting 5D sky caustics.',
    cloud5DStyle: 'prismatic-vault-sheets',
    cloud5DName: '5D Birefringent Silica Cloud Vault',
    scentBreezeName: 'Piezoelectric Petrichor Zephyr',
    particlePrimaryColor: '#2dd4bf',
    particleSecondaryColor: '#ccfbf1',
    cloud5DColor: '#14b8a6',
    causticRayColor: '#5eead4',
    scentBreezeColor: '#2dd4bf',
    baseWindSpeed: 8.2,
    fluidViscosity: 0.12,
    vorticityTorque: 0.45,
    verticalDraftAmplitude: 3.9,
  },
  'brutalist-pendulum-foundry': {
    id: 'thermobaric-cinder-ash',
    name: 'Thermobaric Cinder Ashfall & Piston Drafts',
    biomePhysicsLawName: 'Barometric Compression & Thermal Chimneys',
    biomePhysicsDescription:
      'Rhythmic 68-BPM barometric downbursts compress biome gravity, alternating with incandescent thermal updraft plumes that loft ash and entities.',
    cloud5DStyle: 'furnace-anvil-cumulus',
    cloud5DName: '5D Ossuary Anvil Super-Stratum',
    scentBreezeName: 'Calcified Ember & Myrrh Draft',
    particlePrimaryColor: '#fb7185',
    particleSecondaryColor: '#fda4af',
    cloud5DColor: '#e11d48',
    causticRayColor: '#fda4af',
    scentBreezeColor: '#f43f5e',
    baseWindSpeed: 10.8,
    fluidViscosity: 0.22,
    vorticityTorque: 0.55,
    verticalDraftAmplitude: 5.4,
  },
  'biomech-coral-atoll': {
    id: 'biolum-spore-monsoon',
    name: 'Bioluminescent Spore Monsoon & Synovial Tide',
    biomePhysicsLawName: 'Hydro-Viscous Buoyancy & Pheromone Bloom',
    biomePhysicsDescription:
      'The atmosphere behaves as a breathable non-Newtonian fluid whose viscosity cushions falls, buoys leaps, and carries symbiotic pheromone trails.',
    cloud5DStyle: 'synovial-medusa-canopy',
    cloud5DName: '5D Bioluminescent Medusa Over-Sea',
    scentBreezeName: 'Nectar-Spore Pheromone Current',
    particlePrimaryColor: '#4ade80',
    particleSecondaryColor: '#dcfce7',
    cloud5DColor: '#10b981',
    causticRayColor: '#86efac',
    scentBreezeColor: '#34d399',
    baseWindSpeed: 6.8,
    fluidViscosity: 0.62,
    vorticityTorque: 0.85,
    verticalDraftAmplitude: 3.5,
  },
  'quantum-basalt-trench': {
    id: 'singularity-inversion-rain',
    name: 'Event-Horizon Inversion Rain & Time-Mist',
    biomePhysicsLawName: 'Relativistic Tidal Dilation & Attractor Wells',
    biomePhysicsDescription:
      'Inverted void droplets fall skyward into the 5D event canopy while roaming micro-attractor wells tug entities and dilate skeletal recovery.',
    cloud5DStyle: 'event-horizon-accretion',
    cloud5DName: '5D Hawking Accretion Cloud Manifold',
    scentBreezeName: 'Chrono-Aether Memory Whisper',
    particlePrimaryColor: '#a78bfa',
    particleSecondaryColor: '#ede9fe',
    cloud5DColor: '#8b5cf6',
    causticRayColor: '#c4b5fd',
    scentBreezeColor: '#a855f7',
    baseWindSpeed: 11.2,
    fluidViscosity: 0.28,
    vorticityTorque: 1.25,
    verticalDraftAmplitude: 5.8,
  },
};

export function resolveWorldWeather(
  world: ManifoldWorldSpec
): DimensionalWeatherSystemSpec {
  return (
    world.weatherSystem ??
    WEATHER_PRESETS_BY_ARCHETYPE[world.archetype] ??
    WEATHER_PRESETS_BY_ARCHETYPE['non-euclidean-spires']
  );
}

export function generatePlayableCharacterForWorld(
  seed: number,
  accentColor: string,
  isOriginalSeed: boolean = false
): PlayableCharacterSpec {
  if (isOriginalSeed || seed === 408291) {
    return {
      id: 'char-original-seed-408291',
      name: 'Kaelen-09 Voidwalker',
      title: 'Cyber-Occult Singularity Stalker',
      bodyArchetype: 'original-construct',
      biologicalTrait:
        'Cowled obsidian brigandine chassis with wrought-iron occult chains, sternum diamond singularity core, and tattered stealth mantle.',
      humanEchoTrait:
        'Calibrated to human binocular eye-height (1.82m) and silent assassin stride cadence.',
      heightScale: 1.0,
      collisionRadius: 0.65,
      jumpImpulse: 8.8,
      moveSpeedMultiplier: 1.0,
      primaryColor: '#1e2536',
      secondaryColor: '#0f1420',
      visorOrOrganColor: '#f97316',
      voidOrbElement: 'aether-singularity',
      voidOrbColor: '#a855f7',
    };
  }

  const rng = createSeededRandom(seed + 991);
  const archetypes: PlayableBodyArchetype[] = [
    'chitin-nomad',
    'vitreous-diver',
    'mycelial-symbiont',
    'ossified-cantor',
    'ferro-seraph',
  ];
  const bodyArchetype = archetypes[Math.floor(rng() * archetypes.length)];

  const voidElements: { type: VoidElementType; color: string }[] = [
    { type: 'aether-singularity', color: '#a855f7' },
    { type: 'pyro-plasma', color: '#f97316' },
    { type: 'abyssal-biolume', color: '#10b981' },
    { type: 'chrono-amber', color: '#eab308' },
    { type: 'ferro-vortex', color: '#38bdf8' },
  ];
  const chosenVoid = voidElements[Math.floor(rng() * voidElements.length)];

  const charProfiles: Record<
    PlayableBodyArchetype,
    {
      names: string[];
      title: string;
      bio: string;
      human: string;
      primary: string;
      secondary: string;
    }
  > = {
    'original-construct': {
      names: ['Vanguard Construct'],
      title: 'Prime Manifold Explorer',
      bio: 'Articulated polyhedral chassis.',
      human: 'Bipedal human eye-level calibration.',
      primary: '#f8fafc',
      secondary: '#1e293b',
    },
    'chitin-nomad': {
      names: ['Khor-Vex', 'Scarab-9', 'Myrmex Wanderer', 'Tecton Strider'],
      title: 'Segmented Chitin-Weave Nomad',
      bio: 'Layered dorsal carapace plates with pneumatic locust-tendon femurs.',
      human: 'Carries a woven traveler’s mantle and pauses to face the horizon sunset.',
      primary: '#fbbf24',
      secondary: '#292524',
    },
    'vitreous-diver': {
      names: ['Aurelia-Glass', 'Silica-Vein', 'Pleura-7', 'Vesper Diver'],
      title: 'Vitreous Vascular Bathysphere',
      bio: 'Translucent silica ribcage housing a bioluminescent arterial heart-core.',
      human: 'Breathes with a visible 14-breath-per-minute human tidal sigh.',
      primary: '#bae6fd',
      secondary: '#0f172a',
    },
    'mycelial-symbiont': {
      names: ['Hyphae-4', 'Spore-Cantor', 'Sylvan-Loom', 'Cordyceps Pilgrim'],
      title: 'Spore-Loomed Mycelial Symbiont',
      bio: 'Fibrous fungal musculature crowned with a fruiting-body sensory canopy.',
      human: 'Hums soft two-note folk intervals when gathering living flora.',
      primary: '#6ee7b7',
      secondary: '#064e3b',
    },
    'ossified-cantor': {
      names: ['Marrow-Voiced', 'Ivory-22', 'Reliquary Pilgrim', 'Clavicle Walker'],
      title: 'Calcified Acoustic Cantor',
      bio: 'Porous bone-ivory exo-spine that resonates like a cello chamber.',
      human: 'Gestures with expressive, piano-fingered left-hand articulation.',
      primary: '#f5f5f4',
      secondary: '#44403c',
    },
    'ferro-seraph': {
      names: ['Solenoid-Wing', 'Flux-Seraph', 'Magnetar-3', 'Valence Walker'],
      title: 'Ferro-Fluid Magnetic Seraph',
      bio: 'Suspended magnetic Halo-blades orbiting a liquid-metal spinal column.',
      human: 'Retains the upright poise of a classical marble figure.',
      primary: '#c4b5fd',
      secondary: '#1e1b4b',
    },
  };

  const prof = charProfiles[bodyArchetype];
  const name = prof.names[Math.floor(rng() * prof.names.length)];

  return {
    id: `char-${seed}`,
    name,
    title: prof.title,
    bodyArchetype,
    biologicalTrait: prof.bio,
    humanEchoTrait: prof.human,
    heightScale: Number((0.88 + rng() * 0.34).toFixed(2)),
    collisionRadius: Number((0.55 + rng() * 0.3).toFixed(2)),
    jumpImpulse: Number((8.0 + rng() * 3.8).toFixed(1)),
    moveSpeedMultiplier: Number((0.9 + rng() * 0.35).toFixed(2)),
    primaryColor: prof.primary,
    secondaryColor: prof.secondary,
    visorOrOrganColor: accentColor,
    voidOrbElement: chosenVoid.type,
    voidOrbColor: chosenVoid.color,
    skinTopology:
      ALL_SKIN_TOPOLOGY_STYLES[
        Math.floor(rng() * ALL_SKIN_TOPOLOGY_STYLES.length)
      ],
  };
}

export function generateGameVersionNaming(
  world: ManifoldWorldSpec,
  epochNumber: number,
  isOriginalSeed: boolean = false
): {
  versionCode: string;
  gameTitle: string;
  fontFamily: string;
  meaningAndLore: string;
} {
  if (isOriginalSeed || world.seed === 408291) {
    return {
      versionCode: 'SEED-000 (Original Seed)',
      gameTitle: 'Tesseract Manifold',
      fontFamily: "'Chakra Petch', sans-serif",
      meaningAndLore:
        'The Prime Kinematic Cradle: Where non-Euclidean monolith spires and active-ragdoll constructs first awakened along the W-axis.',
    };
  }

  const rng = createSeededRandom(world.seed + 313);
  const fonts = [
    "'Cinzel', serif",
    "'Cormorant Garamond', serif",
    "'Syne', sans-serif",
    "'Fraunces', serif",
    "'Orbitron', sans-serif",
    "'Chakra Petch', sans-serif",
  ];
  const fontFamily = fonts[epochNumber % fonts.length];

  const poeticTitles: Record<WorldTopologyArchetype, string[]> = {
    'non-euclidean-spires': [
      ' Glass Horizon of the Spire-Lung',
      'The Calabi-Yau Wind Harp',
      'Obelisks of the Fourth Ventricle',
    ],
    'gyro-lattice-basin': [
      'Canticle of Ferro-Marrow',
      'The Chitin Gyroscope',
      'Locust-Tendon Foundry',
    ],
    'crystalline-hyper-mesa': [
      'Pleura of the Vitreous Mesa',
      'Silica Artery & Sky',
      'The Refracting Alveoli',
    ],
    'brutalist-pendulum-foundry': [
      'Ossuary of the 68-BPM Pendulum',
      'The Calcified Amphitheater',
      'Ribcage of the Iron Choir',
    ],
    'biomech-coral-atoll': [
      'Mycelia of the Seventh Tide',
      'The Bioluminescent Cradle',
      'Spore-Loomed Archipelago',
    ],
    'quantum-basalt-trench': [
      'Elegy of the Basalt Synapse',
      'The Abyssal Singularity Loom',
      'Vespera’s Folded Trench',
    ],
  };

  const titleList = poeticTitles[world.archetype];
  const chosenTitle =
    titleList[Math.floor(rng() * titleList.length)].trim();

  return {
    versionCode: `EPOCH-${String(epochNumber).padStart(3, '0')}`,
    gameTitle: chosenTitle,
    fontFamily,
    meaningAndLore: `${world.biologicalSignature} ${world.subtleHumanTrace}`,
  };
}

const ENTITY_PREFIXES = [
  'Valkyr',
  'Strider',
  'Kinetix',
  'Torsion',
  'Arachne',
  'Marrow',
  'Pleura',
  'Mycelia',
  'Chitin',
  'Seraph',
];

const ENTITY_ROLES = [
  'Symbiont',
  'Forager',
  'Cantor',
  'Stalker',
  'Graft-Walker',
  'Leviathan',
  'Drifter',
];

const BIOLOGICAL_ORGANS = [
  'Dorsal bioluminescent gill-slits that flare during acceleration.',
  'Segmented chitinous knee-pods filled with pressurized synovial amber.',
  'Acoustic cranium chamber that clicks in echolocation bursts.',
  'Translucent vascular belly-sac refracting terrain light.',
  'Magnetic cartilage spine suspended by twin tendon cables.',
];

export function generateEntityBlueprintForWorld(
  worldId: string,
  worldSeed: number,
  index: number,
  accentColor: string,
  overrideMorphology?: EntityMorphology
): EntityBlueprint {
  const rng = createSeededRandom(worldSeed + index * 7919 + 101);
  const [lexA, lexB, lexC] = pickSeededLexiconTriad(worldSeed + index * 317);
  const lexLore = synthesizeLexiconTriad(lexA, lexB, lexC);

  const morphologies: EntityMorphology[] = [
    'biped-construct',
    'quadruped-strider',
    'hexapod-arachnid',
    'tri-gyro-walker',
    'serpentine-leviathan',
    'avian-tensor-raptor',
    'seraph-cantilever',
    'reliquary-golem',
    'mycelial-dryad',
    'abyssal-cetacean',
  ];
  const carvingStyles: GeometryCarvingStyle[] = [
    'faceted-poly',
    'lathe-turbine',
    'tubular-exoskeleton',
    'hyper-ringed',
    'monolith-plate',
    'cathedral-ribbed',
    'nacre-filigree',
    'obsidian-reliquary',
  ];
  const headStyles: EntityHeadStyle[] = [
    'cyclops-prism',
    'binaural-horn',
    'gyro-core',
    'crowned-octa',
    'mandible-visor',
    'rose-window-oculus',
    'antler-crown',
    'seraph-halo-mask',
  ];
  const dorsalStyles: EntityDorsalApparatus[] = [
    'solar-sail-fins',
    'cathedral-organ-pipes',
    'floating-halo-shards',
    'weeping-filament-veil',
    'gyro-astrolabe-wheel',
    'mycelial-spore-canopy',
  ];
  const tailStyles: EntityTailApparatus[] = [
    'segmented-censer',
    'twin-ribbon-flukes',
    'pendulum-metronome',
    'helical-stinger',
  ];
  const auraStyles: EntityAuraOrbitStyle[] = [
    'double-helix-glyphs',
    'toroidal-rose-shards',
    'epicyclic-planets',
    'weeping-ember-halo',
  ];

  const morphology =
    overrideMorphology ??
    (rng() < 0.55
      ? lexA.preferredMorphology
      : morphologies[Math.floor(rng() * morphologies.length)]);
  const carvingStyle =
    rng() < 0.55
      ? lexB.preferredCarving
      : carvingStyles[Math.floor(rng() * carvingStyles.length)];
  const headStyle =
    rng() < 0.55
      ? lexC.preferredHead
      : headStyles[Math.floor(rng() * headStyles.length)];
  const dorsalApparatus =
    rng() < 0.65
      ? lexA.dorsalApparatus
      : dorsalStyles[Math.floor(rng() * dorsalStyles.length)];
  const tailApparatus =
    rng() < 0.65
      ? lexB.tailApparatus
      : tailStyles[Math.floor(rng() * tailStyles.length)];
  const auraOrbit =
    rng() < 0.65
      ? lexC.auraOrbit
      : auraStyles[Math.floor(rng() * auraStyles.length)];

  let legCount = 2;
  if (morphology === 'quadruped-strider' || morphology === 'reliquary-golem')
    legCount = 4;
  else if (morphology === 'hexapod-arachnid') legCount = 6;
  else if (morphology === 'tri-gyro-walker' || morphology === 'mycelial-dryad')
    legCount = 3;
  else if (
    morphology === 'serpentine-leviathan' ||
    morphology === 'abyssal-cetacean'
  )
    legCount = 4;
  else if (
    morphology === 'avian-tensor-raptor' ||
    morphology === 'seraph-cantilever'
  )
    legCount = 2;

  const palettes = [
    { primary: lexA.primaryHex, secondary: lexB.secondaryHex },
    { primary: '#e2e8f0', secondary: '#334155' },
    { primary: '#fde68a', secondary: '#451a03' },
    { primary: '#a7f3d0', secondary: '#064e3b' },
    { primary: '#fecdd3', secondary: '#4c0519' },
    { primary: '#bae6fd', secondary: '#0c4a6e' },
  ];
  const chosenPalette = palettes[Math.floor(rng() * palettes.length)];

  // Derive natural predator / symbiont ecological role and specialized gore attack from morphology & index
  let ecologicalRole: EcologicalDietRole = 'symbiont-grazer';
  let specializedAttackDamage: DamageGoreModality = 'laceration-hemorrhage';

  if (
    morphology === 'hexapod-arachnid' ||
    morphology === 'avian-tensor-raptor' ||
    index === 1
  ) {
    ecologicalRole =
      morphology === 'avian-tensor-raptor'
        ? 'synaptic-parasite-raptor'
        : 'hemophagic-stalker';
    specializedAttackDamage =
      morphology === 'avian-tensor-raptor'
        ? 'neural-synapse-hemolysis'
        : 'laceration-hemorrhage';
  } else if (
    morphology === 'reliquary-golem' ||
    morphology === 'quadruped-strider' ||
    index === 2
  ) {
    ecologicalRole = 'osteophagic-crusher';
    specializedAttackDamage = 'calcified-marrow-shatter';
  } else if (
    morphology === 'serpentine-leviathan' ||
    morphology === 'abyssal-cetacean'
  ) {
    ecologicalRole = 'viscera-siphon-leviathan';
    specializedAttackDamage =
      rng() < 0.5
        ? 'hydrostatic-viscera-rupture'
        : 'corrosive-ichor-dissolution';
  }

  return {
    id: `bp-${worldSeed}-${index}-${Math.floor(rng() * 10000)}`,
    name: lexLore.synthesizedTitle,
    worldId,
    seed: Math.floor(rng() * 999999),
    morphology,
    carvingStyle,
    legCount,
    limbLength: Number((1.05 + rng() * 0.68).toFixed(2)),
    torsoScale: [
      Number((0.78 + rng() * 0.55).toFixed(2)),
      Number((0.88 + rng() * 0.62).toFixed(2)),
      Number((0.78 + rng() * 0.82).toFixed(2)),
    ],
    headStyle,
    dorsalApparatus,
    tailApparatus,
    auraOrbit,
    lexiconTriad: lexLore.triadWords,
    lexiconStoryLore: lexLore.hypotheticalDepthNarrative,
    baseStiffness: Number((0.72 + rng() * 0.22).toFixed(2)),
    mass: Number((45 + rng() * 75).toFixed(0)),
    strideFrequency: Number((1.65 + rng() * 1.35).toFixed(2)),
    primaryColor: chosenPalette.primary,
    secondaryColor: chosenPalette.secondary,
    jointGlowColor: rng() < 0.5 ? lexC.glowHex : accentColor,
    biologicalOrganNote: `${lexLore.retrospectiveDialectic} — ${lexLore.anatomicalManifestation}`,
    skinTopology:
      ALL_SKIN_TOPOLOGY_STYLES[
        Math.floor(rng() * ALL_SKIN_TOPOLOGY_STYLES.length)
      ],
    ecologicalRole,
    specializedAttackDamage,
  };
}

export function generateManifoldWorld(
  customSeed?: number,
  preferredArchetype?: WorldTopologyArchetype
): ManifoldWorldSpec {
  const seed = customSeed ?? Math.floor(Math.random() * 899999 + 100000);
  const isOriginal = seed === 408291;
  const rng = createSeededRandom(seed);

  const archetypes: WorldTopologyArchetype[] = [
    'non-euclidean-spires',
    'gyro-lattice-basin',
    'crystalline-hyper-mesa',
    'brutalist-pendulum-foundry',
    'biomech-coral-atoll',
    'quantum-basalt-trench',
  ];

  const archetype =
    preferredArchetype ?? archetypes[Math.floor(rng() * archetypes.length)];
  const preset = ARCHETYPE_PRESETS[archetype];

  const prefix = WORLD_PREFIXES[Math.floor(rng() * WORLD_PREFIXES.length)];
  const suffix = WORLD_SUFFIXES[Math.floor(rng() * WORLD_SUFFIXES.length)];
  const sectorNum = Math.floor(rng() * 900 + 100);

  const manifoldCoord: [number, number, number, number] = [
    Number(((rng() - 0.5) * 180).toFixed(1)),
    Number(((rng() - 0.5) * 180).toFixed(1)),
    Number(((rng() - 0.5) * 180).toFixed(1)),
    Number(((rng() - 0.5) * 2.0).toFixed(2)),
  ];

  const worldId = `world-${seed}`;

  const propModels: ProceduralPropModelSpec[] = preset.propCategories.map(
    (category, idx) => {
      const pRng = createSeededRandom(seed + (idx + 1) * 3571);
      return {
        id: `prop-${seed}-${idx}`,
        name: `${prefix} ${category.replace('-', ' ').toUpperCase()} MK-${idx + 1}`,
        category,
        seed: Math.floor(pRng() * 99999),
        scale: [
          Number((1.2 + pRng() * 1.4).toFixed(2)),
          Number((2.2 + pRng() * 3.2).toFixed(2)),
          Number((1.2 + pRng() * 1.4).toFixed(2)),
        ],
        ringCount: Math.floor(2 + pRng() * 4),
        twistAngle: Number((0.4 + pRng() * 2.2).toFixed(2)),
        radialSegments: Math.floor(4 + pRng() * 5),
        kineticSpinSpeed: Number(((pRng() - 0.3) * 1.6).toFixed(2)),
        floatingAmplitude: Number((0.15 + pRng() * 0.65).toFixed(2)),
        primaryColor: preset.palette.terrainMid,
        emissiveColor: preset.palette.accentColor,
        metalness: Number((0.45 + pRng() * 0.4).toFixed(2)),
        roughness: Number((0.2 + pRng() * 0.45).toFixed(2)),
      };
    }
  );

  const morphologiesForWorld: EntityMorphology[] = [
    'seraph-cantilever',
    'reliquary-golem',
    'mycelial-dryad',
    'abyssal-cetacean',
    'biped-construct',
    'quadruped-strider',
    'hexapod-arachnid',
    'tri-gyro-walker',
    'serpentine-leviathan',
    'avian-tensor-raptor',
  ];
  const shuffledMorphs = [...morphologiesForWorld].sort(() => rng() - 0.5);

  const entityBlueprints: EntityBlueprint[] = [0, 1, 2, 3].map((idx) =>
    generateEntityBlueprintForWorld(
      worldId,
      seed,
      idx,
      preset.palette.accentColor,
      shuffledMorphs[idx]
    )
  );

  const biologicalSignature =
    BIOLOGICAL_SIGNATURES[Math.floor(rng() * BIOLOGICAL_SIGNATURES.length)];
  const subtleHumanTrace =
    SUBTLE_HUMAN_TRACES[Math.floor(rng() * SUBTLE_HUMAN_TRACES.length)];

  const playableCharacter = generatePlayableCharacterForWorld(
    seed,
    preset.palette.accentColor,
    isOriginal
  );

  const [wLexA, wLexB, wLexC] = pickSeededLexiconTriad(seed);
  const worldLexiconLore = synthesizeLexiconTriad(wLexA, wLexB, wLexC);

  return {
    id: worldId,
    name: `${prefix}-${sectorNum} ${suffix}`,
    subtitle: `${preset.subtitle} · [${wLexA.letter}×${wLexB.letter}×${wLexC.letter}]`,
    seed,
    manifoldCoord,
    archetype,
    gravity: Number((6.2 + rng() * 6.4).toFixed(2)),
    biologicalSignature,
    subtleHumanTrace,
    primaryResource: preset.primaryResource,
    secondaryResource: preset.secondaryResource,
    weatherSystem: WEATHER_PRESETS_BY_ARCHETYPE[archetype],
    lexiconLore: worldLexiconLore,
    terrainConfig: {
      amplitude: Number((5.2 + rng() * 7.5).toFixed(2)),
      frequency: Number((0.02 + rng() * 0.025).toFixed(4)),
      octaves: 3,
      ridgeSharpness:
        archetype === 'non-euclidean-spires' || archetype === 'crystalline-hyper-mesa'
          ? Number((0.55 + rng() * 0.35).toFixed(2))
          : Number((0.15 + rng() * 0.35).toFixed(2)),
      terraceSteps:
        archetype === 'crystalline-hyper-mesa' || archetype === 'quantum-basalt-trench'
          ? Math.floor(3 + rng() * 4)
          : 0,
      craterDensity:
        archetype === 'brutalist-pendulum-foundry' || archetype === 'gyro-lattice-basin'
          ? Number((0.45 + rng() * 0.5).toFixed(2))
          : Number((rng() * 0.25).toFixed(2)),
    },
    palette: preset.palette,
    propModels,
    entityBlueprints,
    playableCharacter,
    createdAt: Date.now(),
  };
}

/**
 * Generates an anatomical Fusiform Muscle-Belly & Calligraphic Stroke-Modulated Bone Segment Geometry.
 * Replaces raw CylinderGeometry tubes with true 3D thick-to-thin calligraphic stroke modulation:
 * - Slender, high-tension origin/insertion tendon necks at both articular ends
 * - Asymmetric bulging gastrocnemius / biceps muscle belly along the mid-shaft
 * - Sharp chiselled anterior shin/ulna bone crest contrasting with recessed tendon grooves
 */
export function createCalligraphicMuscleSegmentGeometry(
  topRadius: number,
  bottomRadius: number,
  length: number,
  bellyBulge: number = 0.38,
  crestSharpness: number = 1.15
): THREE.BufferGeometry {
  // High-subdivision organic muscle-fascia envelope (22 radial x 18 height) for smooth, non-geometric biological flow
  const geo = new THREE.CylinderGeometry(
    topRadius,
    bottomRadius,
    length,
    22,
    18,
    false
  );
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const halfLen = Math.max(0.0001, length * 0.5);

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);

    // Normalized longitudinal coordinate t in [0 (top origin), 1 (bottom insertion)]
    const t = THREE.MathUtils.clamp((halfLen - vy) / length, 0, 1);
    const angle = Math.atan2(vz, vx);

    // Smooth smin-style articular capsule rounding at both ends so joints blend seamlessly without hard cylinder caps
    const capsuleEndFade = Math.sin(t * Math.PI);
    const smoothOriginInsertion =
      0.82 + 0.18 * Math.sin(Math.pow(t, 0.75) * Math.PI);

    // Organic twin-belly gastrocnemius / biceps brachii muscle curve peaking at t = 0.36
    const asymmetricBelly =
      Math.pow(capsuleEndFade, 0.78) *
      (1.0 + 0.32 * Math.cos((t - 0.36) * Math.PI));

    // Smooth anatomical fascia curve instead of polygonal facets
    const anteriorGastrocnemius =
      vz > 0 ? Math.pow(Math.cos(angle * 0.5), crestSharpness) * 0.18 : 0.06;
    const helicalFasciaTwist =
      0.08 * Math.sin(angle * 2.0 + t * Math.PI * 1.4) * capsuleEndFade;

    const radialScale =
      (0.76 +
        bellyBulge * asymmetricBelly +
        anteriorGastrocnemius * capsuleEndFade +
        helicalFasciaTwist) *
      smoothOriginInsertion;

    // Natural S-curve biological bow along the bone-muscle shaft
    const shaftBowZ = Math.sin(t * Math.PI) * length * 0.055;
    const shaftBowX = Math.sin(t * Math.PI * 2.0) * length * 0.018;

    pos.setXYZ(
      i,
      vx * radialScale + shaftBowX,
      vy,
      vz * radialScale + shaftBowZ
    );
  }

  applyBlenderLaplacianSmoothModifier(geo, 1, 0.32);
  geo.computeVertexNormals();
  return prepareDeformableSkinGeometry(geo);
}

/**
 * Generates a sculpted Cranial / Zygomatic / Mandibular Skull Geometry.
 * Replaces raw OctahedronGeometry / BoxGeometry heads with a true anatomical cranium
 * featuring supraorbital brow ridges, zygomatic cheek arches, temporal fossae, and a tapered jaw.
 */
export function createSculptedCraniumGeometry(
  baseRadius: number,
  variant:
    | 'cyclops-pierced'
    | 'zygomatic-crest'
    | 'mitre-crest'
    | 'mandibular-arch'
    | 'navigator-helm'
): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(baseRadius, 22, 18);
  const pos = geo.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const len = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1;
    const nx = vx / len;
    const ny = vy / len;
    const nz = vz / len;

    // Cranial vault elongation (occipital back-sweep + tapered jaw)
    let sx = 0.88 + 0.22 * Math.exp(-Math.pow(ny - 0.1, 2) * 4.0); // Zygomatic arch flare
    let sy = 1.18;
    let sz = 1.12 + (ny > 0 ? 0.18 * ny : -0.15 * Math.abs(ny));

    // Supraorbital brow ridge + recessed ocular socket / ink-trap fossa on anterior face (nz > 0.35)
    let socketCarve = 0;
    if (nz > 0.3) {
      if (variant === 'cyclops-pierced') {
        const dEye = Math.hypot(nx, ny - 0.06);
        if (dEye < 0.48) {
          socketCarve = -0.34 * Math.cos((dEye / 0.48) * Math.PI * 0.5);
        } else if (dEye < 0.68) {
          socketCarve = 0.14; // Raised calligraphic brow rim
        }
      } else {
        // Binocular zygomatic orbital sockets
        const dEyeL = Math.hypot(Math.abs(nx) - 0.34, ny - 0.08);
        if (dEyeL < 0.3) {
          socketCarve = -0.24 * Math.cos((dEyeL / 0.3) * Math.PI * 0.5);
        }
      }
    }

    if (variant === 'mitre-crest' && ny > 0.2) {
      sy += Math.pow(ny - 0.2, 1.3) * 0.65;
      sx *= 1.0 - (ny - 0.2) * 0.35;
    } else if (variant === 'mandibular-arch' && ny < -0.15 && nz > 0) {
      sz += Math.abs(ny + 0.15) * 0.45;
    }

    const r = baseRadius * (1.0 + socketCarve);
    pos.setXYZ(i, nx * r * sx, ny * r * sy, nz * r * sz);
  }

  geo.computeVertexNormals();
  return prepareDeformableSkinGeometry(geo);
}

/**
 * Generates a high-resolution, spline-interpolated anatomical or armor LatheGeometry
 * with smooth vertex normals to eliminate polygonal faceting.
 */
function createSmoothAnatomicalLatheGeometry(
  controlProfile: [number, number][],
  radialSegments: number = 28,
  phiStart: number = 0,
  phiLength: number = Math.PI * 2
): THREE.BufferGeometry {
  const vec2Points = controlProfile.map(
    ([r, y]) => new THREE.Vector2(Math.max(0.001, r), y)
  );
  const spline = new THREE.SplineCurve(vec2Points);
  const sampledPoints = spline.getPoints(20);
  const geo = new THREE.LatheGeometry(
    sampledPoints,
    radialSegments,
    phiStart,
    phiLength
  );
  geo.computeVertexNormals();
  return geo;
}

/**
 * Generates a smoothly contoured anatomical armor shell plate (for vambraces, brigandine chest lames,
 * pauldrons, thigh cuisses, and shin greaves) with rolled edges, medial dorsal crest, and smooth normals.
 */
function createCurvedArmorShellGeometry(
  rTop: number,
  rBot: number,
  height: number,
  arcAngle: number = Math.PI * 1.35,
  radialSegs: number = 24,
  heightSegs: number = 8,
  flareRim: number = 0.012
): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(
    rTop,
    rBot,
    height,
    radialSegs,
    heightSegs,
    true,
    -arcAngle * 0.5,
    arcAngle
  );
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const halfH = Math.max(0.001, height * 0.5);

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const theta = Math.atan2(vx, vz);
    const uNorm = vy / halfH; // [-1, 1]
    const absU = Math.abs(uNorm);

    // Rolled lip flare at top and bottom margins + subtle anatomical medial ridge along center
    const rimFlare = Math.pow(absU, 2.2) * flareRim;
    const medialCrest =
      Math.cos((theta / (arcAngle * 0.5)) * (Math.PI * 0.5)) *
      0.014 *
      (1.0 - absU * 0.35);
    const r = Math.hypot(vx, vz) || 1;
    const newR = r + rimFlare + Math.max(0, medialCrest);
    const scale = newR / r;

    pos.setXYZ(i, vx * scale, vy, vz * scale);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Generates a smooth, cambered aerodynamic seraphic feather plume blade geometry
 * to replace harsh 4-sided ConeGeometry pyramids on the Ophanim wings.
 */
function createSculptedFeatherPlumeGeometry(
  length: number,
  width: number,
  archCurvature: number = 0.042
): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(width, length, width * 0.18, 6, 16, 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const halfL = Math.max(0.001, length * 0.5);

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);

    // Normalized longitudinal coordinate t from 0 (quill root at +halfL) to 1 (feather tip at -halfL)
    const t = THREE.MathUtils.clamp((halfL - vy) / length, 0, 1);

    // Smooth aerodynamic vane silhouette: widens rapidly from calamus root, peaks at t=0.42, tapers smoothly to tip
    const vaneProfile =
      Math.sin(Math.pow(t, 0.68) * Math.PI) * (1.0 - 0.18 * t * t);
    // Razor-thin feather barbs at lateral edges, thicker central rachis shaft
    const lateralFrac = Math.min(1, Math.abs(vx) / Math.max(0.0001, width * 0.5));
    const thicknessProfile =
      (1.0 - 0.72 * Math.pow(lateralFrac, 0.85)) * Math.sin(t * Math.PI);

    // Natural graceful dorsal camber & sweeping tip curve
    const camberZ =
      Math.sin(t * Math.PI) * archCurvature -
      Math.pow(t, 2.2) * archCurvature * 0.65;
    const sweepX = Math.pow(t, 1.8) * width * 0.16;

    pos.setXYZ(
      i,
      vx * vaneProfile + sweepX,
      vy,
      vz * thicknessProfile + camberZ
    );
  }

  applyBlenderLaplacianSmoothModifier(geo, 1, 0.28);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Generates a smoothed, beveled cabochon / gothic shield-sigil geometry
 * to replace raw detail-0 OctahedronGeometry on knuckle guards, knee poleyns, and chest sigils.
 */
function createBeveledOctaSigilGeometry(
  radius: number,
  scaleX: number = 1.0,
  scaleY: number = 1.25,
  scaleZ: number = 0.45
): THREE.BufferGeometry {
  const geo = new THREE.OctahedronGeometry(radius, 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    // Preserve crisp medial bevels while smoothing harsh corners via superellipsoid projection
    const nx = Math.sign(vx) * Math.pow(Math.abs(vx / radius), 0.82) * radius;
    const ny = Math.sign(vy) * Math.pow(Math.abs(vy / radius), 0.85) * radius;
    const nz = Math.sign(vz) * Math.pow(Math.abs(vz / radius), 0.78) * radius;
    pos.setXYZ(i, nx * scaleX, ny * scaleY, nz * scaleZ);
  }
  applyBlenderLaplacianSmoothModifier(geo, 1, 0.25);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds the 3D Articulated Left Hand with 5 3-phalanx multi-jointed fingers
 * cradling the Magic Elemental Void Ball!
 * Exposes `userData.fingerPivots`, `userData.fingerChains`, and `userData.voidBallGroup`
 * so the animation loop can curl, splay, ripple, and gesture each phalanx joint.
 */
export function buildLeftHandVoidBallRig(
  charSpec: PlayableCharacterSpec,
  boundaryId?: DifferentialUniverseBoundaryId
): THREE.Group {
  const root = new THREE.Group();
  const bSpec = boundaryId ? DIFFERENTIAL_UNIVERSE_BOUNDARIES[boundaryId] : undefined;
  const bio = bSpec?.biologyProfile as { morphologyId: string } | undefined;
  const skinStyle = resolveCharacterSkinTopology(charSpec);

  const skinMat = createComplexSkinMaterial(
    skinStyle,
    charSpec.primaryColor,
    charSpec.voidOrbColor
  );
  const jointMat = createComplexSkinMaterial(
    skinStyle,
    charSpec.secondaryColor,
    charSpec.visorOrOrganColor
  );
  const voidCoreMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#05050a'),
    emissive: new THREE.Color(charSpec.voidOrbColor),
    emissiveIntensity: 0.55,
    roughness: 0.1,
    metalness: 0.9,
  });
  const voidRingMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(charSpec.voidOrbColor),
    emissive: new THREE.Color(charSpec.voidOrbColor),
    emissiveIntensity: 1.25,
    roughness: 0.15,
    metalness: 0.4,
  });

  // High-Craft Anisotropic Obsidian & Brushed Gold-Brass Gauntlet Materials
  const obsidianArmorMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#131722'),
    metalness: 0.88,
    roughness: 0.22,
    clearcoat: 0.82,
    clearcoatRoughness: 0.14,
    iridescence: 0.24,
  });
  const etchedBrassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#d97706'),
    emissive: new THREE.Color('#b45309'),
    emissiveIntensity: 0.38,
    metalness: 0.92,
    roughness: 0.18,
    clearcoat: 0.65,
  });

  // Forearm / Wrist Cuff with Sculpted Calligraphic Muscle-Tendon Belly + 3 Smooth Contoured Vambrace Shell Plates
  const forearm = new THREE.Mesh(
    createCalligraphicMuscleSegmentGeometry(0.052, 0.068, 0.28, 0.34, 1.35),
    obsidianArmorMat
  );
  forearm.rotation.x = Math.PI * 0.42;
  forearm.position.set(-0.04, -0.12, 0.16);
  root.add(forearm);

  for (let vp = 0; vp < 3; vp++) {
    const vambracePlate = new THREE.Mesh(
      createCurvedArmorShellGeometry(
        0.058 + vp * 0.005,
        0.064 + vp * 0.005,
        0.068,
        Math.PI * 1.45,
        22,
        6,
        0.005
      ),
      vp === 1 ? etchedBrassMat : obsidianArmorMat
    );
    vambracePlate.position.set(0, -0.072 + vp * 0.072, 0);
    forearm.add(vambracePlate);
  }

  // Articulated Wrist Carpal Gimbal Ring & Glowing Radius/Ulna Energy Conduit
  const wristGimbalRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.056, 0.0065, 10, 28),
    etchedBrassMat
  );
  wristGimbalRing.rotation.x = Math.PI * 0.5;
  wristGimbalRing.position.set(0, 0.13, 0);
  forearm.add(wristGimbalRing);

  const forearmOverlay = buildDermalTopologyOverlayGroup(
    skinStyle,
    charSpec.primaryColor,
    charSpec.secondaryColor,
    charSpec.voidOrbColor,
    0.068
  );
  forearm.add(forearmOverlay);

  // Sculpted Left Metacarpal Palm Arch + Smooth Beveled Dorsal Gauntlet Backplate
  const palmGeo = createImplicitMetaballPiercedGeometry(0.082, 0.42, 307, 0.45);
  palmGeo.scale(1.12, 0.46, 1.2);
  const palm = new THREE.Mesh(palmGeo, obsidianArmorMat);
  palm.rotation.x = 0.25;
  palm.rotation.z = -0.2;
  root.add(palm);

  const dorsalKnuckleGuard = new THREE.Mesh(
    createBeveledOctaSigilGeometry(0.064, 1.26, 0.32, 0.96),
    etchedBrassMat
  );
  dorsalKnuckleGuard.position.set(0, 0.016, -0.025);
  root.add(dorsalKnuckleGuard);

  // 5 Articulated 3-Phalanx Fingers with Knuckle Caps, Interphalangeal Joint Rings & Calligraphic Tapered Phalanges
  const fingerSpecs = [
    { name: 'thumb', x: 0.074, z: 0.022, baseYaw: -0.68, len: 0.046 },
    { name: 'index', x: 0.052, z: -0.07, baseYaw: -0.22, len: 0.055 },
    { name: 'middle', x: 0.015, z: -0.082, baseYaw: 0.0, len: 0.061 },
    { name: 'ring', x: -0.022, z: -0.076, baseYaw: 0.18, len: 0.055 },
    { name: 'pinky', x: -0.056, z: -0.06, baseYaw: 0.38, len: 0.046 },
  ];

  const fingerPivots: THREE.Group[] = [];
  const fingerChains: {
    proximal: THREE.Group;
    intermediate: THREE.Group;
    distal: THREE.Group;
    baseFlare: number;
  }[] = [];

  const knuckleCapGeo = new THREE.SphereGeometry(0.014, 12, 10);
  const phalanxJointRingGeo = new THREE.TorusGeometry(0.0105, 0.0024, 8, 16);

  for (const f of fingerSpecs) {
    const knucklePivot = new THREE.Group();
    knucklePivot.position.set(f.x, 0.012, f.z);
    knucklePivot.rotation.y = f.baseYaw;

    const knuckleCap = new THREE.Mesh(knuckleCapGeo, etchedBrassMat);
    knuckleCap.scale.set(1.05, 0.75, 1.05);
    knucklePivot.add(knuckleCap);

    // 1. Proximal phalanx (Sculpted Calligraphic Bone-Tendon Segment)
    const phalanx1 = new THREE.Mesh(
      createCalligraphicMuscleSegmentGeometry(0.0115, 0.0145, f.len, 0.28, 1.4),
      skinMat
    );
    phalanx1.position.y = f.len * 0.5;
    knucklePivot.add(phalanx1);

    // 2. Intermediate (Middle) phalanx pivot + articulated joint ring
    const midPivot = new THREE.Group();
    midPivot.position.y = f.len;
    midPivot.rotation.x = 0.38;

    const pipJointRing = new THREE.Mesh(phalanxJointRingGeo, etchedBrassMat);
    pipJointRing.rotation.x = Math.PI * 0.5;
    midPivot.add(pipJointRing);

    const midLen = f.len * 0.78;
    const phalanx2 = new THREE.Mesh(
      createCalligraphicMuscleSegmentGeometry(0.0095, 0.012, midLen, 0.25, 1.4),
      jointMat
    );
    phalanx2.position.y = midLen * 0.5;
    midPivot.add(phalanx2);

    // 3. Distal phalanx & curved calligraphic ungual talon
    const tipPivot = new THREE.Group();
    tipPivot.position.y = midLen;
    tipPivot.rotation.x = 0.45;

    const distLen = f.len * 0.64;
    const phalanx3 = new THREE.Mesh(
      createHyperbolicPseudosphereGeometry(0.0098, distLen, 12, 8, 1.2),
      skinMat
    );
    phalanx3.position.y = distLen * 0.5;
    tipPivot.add(phalanx3);

    midPivot.add(tipPivot);
    knucklePivot.add(midPivot);

    knucklePivot.userData.midPivot = midPivot;
    knucklePivot.userData.tipPivot = tipPivot;
    knucklePivot.userData.baseYaw = f.baseYaw;
    root.add(knucklePivot);
    fingerPivots.push(knucklePivot);
    fingerChains.push({
      proximal: knucklePivot,
      intermediate: midPivot,
      distal: tipPivot,
      baseFlare: f.baseYaw,
    });
  }

  // Pocket Void Singularity inside the Left Palm: Schoen TPMS Gyroid Shell + Calabi-Yau Core
  const voidBallGroup = new THREE.Group();
  voidBallGroup.position.set(0.01, 0.095, -0.02);
  root.add(voidBallGroup);

  const gyroidShell = new THREE.Mesh(
    createTPMSGyroidShellGeometry(0.056, 0.095, 20, 14, 3.2, 0.35),
    voidCoreMat
  );
  voidBallGroup.add(gyroidShell);

  const calabiCore = new THREE.Mesh(
    createCalabiYauRosetteGeometry(0.042, 5),
    voidRingMat
  );
  voidBallGroup.add(calabiCore);

  // Cyber-Occult Faceted Octahedral Obsidian-Iron Filigree Reliquary Cage & Molten Furnace-Amber / Diamond Singularity Core
  const reliquaryObsidianCage = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.082, 1),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#141720'),
      emissive: new THREE.Color('#f97316'),
      emissiveIntensity: 0.65,
      metalness: 0.92,
      roughness: 0.16,
      wireframe: true,
    })
  );
  reliquaryObsidianCage.scale.set(0.95, 1.32, 0.95);
  voidBallGroup.add(reliquaryObsidianCage);

  const moltenAmberInnerOcta = new THREE.Mesh(
    createBeveledOctaSigilGeometry(0.048, 0.9, 1.25, 0.9),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f97316'),
      emissive: new THREE.Color('#ea580c'),
      emissiveIntensity: 1.65,
      metalness: 0.35,
      roughness: 0.15,
    })
  );
  voidBallGroup.add(moltenAmberInnerOcta);

  const coldDiamondStar = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.024, 2),
    new THREE.MeshBasicMaterial({ color: '#ffffff' })
  );
  voidBallGroup.add(coldDiamondStar);

  // Taut Wrought-Iron Micro-Chains tethering the floating Reliquary to the wrist gauntlet
  const chainIronMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1e2430'),
    metalness: 0.9,
    roughness: 0.3,
  });
  for (const cSide of [-1, 1]) {
    for (let lk = 0; lk < 5; lk++) {
      const linkMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.009, 0.0028, 8, 14),
        lk === 2 ? voidRingMat : chainIronMat
      );
      const t = (lk + 0.5) / 5;
      linkMesh.position.set(
        cSide * (0.045 * (1 - t) + 0.022 * t),
        -0.06 * (1 - t) + 0.075 * t,
        0.05 * (1 - t) - 0.02 * t
      );
      linkMesh.rotation.y = (lk % 2) * (Math.PI * 0.5);
      root.add(linkMesh);
    }
  }

  // Horizontal RGB-Split Datamosh Glitch Shear Slices around the Reliquary & Forearm
  const glitchColors = ['#ff2a6d', '#f97316', '#00f0ff'];
  for (let g = 0; g < 3; g++) {
    const glitchBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.095 - g * 0.018, 0.0045, 0.0045),
      new THREE.MeshBasicMaterial({
        color: glitchColors[g],
        transparent: true,
        opacity: 0.82,
      })
    );
    glitchBar.position.set(
      (g === 1 ? -1 : 1) * 0.028,
      0.035 + g * 0.026,
      -0.04
    );
    voidBallGroup.add(glitchBar);
  }

  if (bio && bSpec) {
    // Dimension-Specific 1st-Person Left Forearm Evolutionary Biology Organ Mutation
    const bioGroup = new THREE.Group();
    bioGroup.name = `left-forearm-bio-${bio.morphologyId}`;
    const bioMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(bSpec.primaryAccentHex),
      emissive: new THREE.Color(bSpec.secondaryAccentHex),
      emissiveIntensity: 0.9,
      roughness: 0.18,
      metalness: 0.45,
      clearcoat: 0.85,
      transparent: true,
      opacity: 0.88,
    });
    if (bio.morphologyId === 'planck-0d-quantum-monad') {
      const foamCage = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.088, 1),
        new THREE.MeshBasicMaterial({ color: bSpec.primaryAccentHex, wireframe: true })
      );
      foamCage.position.set(-0.04, -0.06, 0.12);
      bioGroup.add(foamCage);
    } else if (bio.morphologyId === 'flatland-2d-ribbon-planarian') {
      // Flatten forearm into a 2D chromatic ribbon membrane with lateral cilia
      root.scale.set(1.22, 1.0, 0.36);
      for (let c = 0; c < 4; c++) {
        const cilium = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.008, 0.012),
          bioMat
        );
        cilium.position.set(-0.09, -0.14 + c * 0.04, 0.14);
        bioGroup.add(cilium);
      }
    } else if (bio.morphologyId === 'hadal-bathyal-cephalopod') {
      // Bioluminescent abyssal luciferin gill-fronds along wrist
      for (let g = 0; g < 3; g++) {
        const gill = new THREE.Mesh(
          new THREE.TorusGeometry(0.068 + g * 0.006, 0.005, 8, 20, Math.PI),
          bioMat
        );
        gill.position.set(-0.04, -0.15 + g * 0.04, 0.15);
        bioGroup.add(gill);
      }
    } else if (
      bio.morphologyId === 'tesseractic-4d-hyper-arachnid' ||
      bio.morphologyId === 'e8-8d-quasicrystal-polytope'
    ) {
      // 4D/8D Hyper-Dimensional Schlegel Exoskeletal Frame around forearm
      const hyperFrame = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.22, 0.14),
        new THREE.MeshBasicMaterial({ color: bSpec.primaryAccentHex, wireframe: true })
      );
      hyperFrame.position.set(-0.04, -0.11, 0.15);
      bioGroup.add(hyperFrame);
    } else if (bio.morphologyId === 'mycelial-silicon-fungoid-network') {
      // Glowing fiber-optic hyphae tendrils growing around gauntlet
      for (let h = 0; h < 3; h++) {
        const hypha = new THREE.Mesh(
          new THREE.TorusKnotGeometry(0.052, 0.004, 24, 6, 2, 3),
          bioMat
        );
        hypha.position.set(-0.04, -0.1 + h * 0.03, 0.14);
        bioGroup.add(hypha);
      }
    } else {
      // Higher-Dimensional (5D/6D/7D/10D/11D) Harmonic Calabi-Yau / Brane Cuff Halo
      const braneHalo = new THREE.Mesh(
        createCalabiYauRosetteGeometry(0.072, 5),
        bioMat
      );
      braneHalo.position.set(-0.04, -0.09, 0.14);
      bioGroup.add(braneHalo);
    }
    root.add(bioGroup);
  }

  root.userData.fingerPivots = fingerPivots;
  root.userData.fingerChains = fingerChains;
  root.userData.voidBallGroup = voidBallGroup;
  root.userData.voidSphereGroup = voidBallGroup;

  return root;
}

/**
 * Builds the 3D Articulated Right Hand Tool & Mudra Rig with 5 3-phalanx digits
 * and a palm Tool Catalyst Prism that shifts and gestures during Impulse, Mining,
 * Building Materialization, and Scent-Breeze Feathering!
 */
export function buildRightHandToolRig(
  charSpec: PlayableCharacterSpec,
  boundaryId?: DifferentialUniverseBoundaryId
): THREE.Group {
  const root = new THREE.Group();
  const bSpec = boundaryId ? DIFFERENTIAL_UNIVERSE_BOUNDARIES[boundaryId] : undefined;
  const bio = bSpec?.biologyProfile as { morphologyId: string } | undefined;
  const skinStyle = resolveCharacterSkinTopology(charSpec);

  const skinMat = createComplexSkinMaterial(
    skinStyle,
    charSpec.primaryColor,
    charSpec.visorOrOrganColor
  );
  const jointMat = createComplexSkinMaterial(
    skinStyle,
    charSpec.secondaryColor,
    charSpec.visorOrOrganColor
  );
  const catalystMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(charSpec.visorOrOrganColor),
    emissive: new THREE.Color(charSpec.visorOrOrganColor),
    emissiveIntensity: 1.1,
    roughness: 0.15,
    metalness: 0.5,
  });

  const obsidianRightArmorMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#131722'),
    metalness: 0.88,
    roughness: 0.22,
    clearcoat: 0.82,
    clearcoatRoughness: 0.14,
    iridescence: 0.24,
  });
  const etchedRightBrassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#d97706'),
    emissive: new THREE.Color('#b45309'),
    emissiveIntensity: 0.38,
    metalness: 0.92,
    roughness: 0.18,
    clearcoat: 0.65,
  });

  // Forearm / Wrist Conduit with Sculpted Calligraphic Muscle-Tendon Belly + 3 Smooth Contoured Vambrace Shell Plates
  const forearm = new THREE.Mesh(
    createCalligraphicMuscleSegmentGeometry(0.052, 0.068, 0.28, 0.34, 1.35),
    obsidianRightArmorMat
  );
  forearm.rotation.x = Math.PI * 0.42;
  forearm.position.set(0.04, -0.12, 0.16);
  root.add(forearm);

  for (let vp = 0; vp < 3; vp++) {
    const vambracePlate = new THREE.Mesh(
      createCurvedArmorShellGeometry(
        0.058 + vp * 0.005,
        0.064 + vp * 0.005,
        0.068,
        Math.PI * 1.45,
        22,
        6,
        0.005
      ),
      vp === 1 ? etchedRightBrassMat : obsidianRightArmorMat
    );
    vambracePlate.position.set(0, -0.072 + vp * 0.072, 0);
    forearm.add(vambracePlate);
  }

  const rightWristGimbal = new THREE.Mesh(
    new THREE.TorusGeometry(0.056, 0.0065, 10, 28),
    etchedRightBrassMat
  );
  rightWristGimbal.rotation.x = Math.PI * 0.5;
  rightWristGimbal.position.set(0, 0.13, 0);
  forearm.add(rightWristGimbal);

  const forearmOverlay = buildDermalTopologyOverlayGroup(
    skinStyle,
    charSpec.primaryColor,
    charSpec.secondaryColor,
    charSpec.visorOrOrganColor,
    0.068
  );
  forearm.add(forearmOverlay);

  // Sculpted Right Metacarpal Palm Arch + Smooth Beveled Dorsal Gauntlet Backplate
  const palmGeo = createImplicitMetaballPiercedGeometry(0.082, 0.42, 409, 0.45);
  palmGeo.scale(1.12, 0.46, 1.2);
  const palm = new THREE.Mesh(palmGeo, obsidianRightArmorMat);
  palm.rotation.x = 0.25;
  palm.rotation.z = 0.2;
  root.add(palm);

  const rightKnuckleGuard = new THREE.Mesh(
    createBeveledOctaSigilGeometry(0.064, 1.26, 0.32, 0.96),
    etchedRightBrassMat
  );
  rightKnuckleGuard.position.set(0, 0.016, -0.025);
  root.add(rightKnuckleGuard);

  // 5 Articulated 3-Phalanx Right Hand Digits with Knuckle Caps & Joint Rings
  const fingerSpecs = [
    { name: 'thumb', x: -0.074, z: 0.022, baseYaw: 0.68, len: 0.046 },
    { name: 'index', x: -0.052, z: -0.07, baseYaw: 0.22, len: 0.055 },
    { name: 'middle', x: -0.015, z: -0.082, baseYaw: 0.0, len: 0.061 },
    { name: 'ring', x: 0.022, z: -0.076, baseYaw: -0.18, len: 0.055 },
    { name: 'pinky', x: 0.056, z: -0.06, baseYaw: -0.38, len: 0.046 },
  ];

  const fingerPivots: THREE.Group[] = [];
  const fingerChains: {
    proximal: THREE.Group;
    intermediate: THREE.Group;
    distal: THREE.Group;
    baseFlare: number;
  }[] = [];

  const rightKnuckleCapGeo = new THREE.SphereGeometry(0.014, 12, 10);
  const rightJointRingGeo = new THREE.TorusGeometry(0.0105, 0.0024, 8, 16);

  for (const f of fingerSpecs) {
    const knucklePivot = new THREE.Group();
    knucklePivot.position.set(f.x, 0.012, f.z);
    knucklePivot.rotation.y = f.baseYaw;

    const knuckleCap = new THREE.Mesh(rightKnuckleCapGeo, etchedRightBrassMat);
    knuckleCap.scale.set(1.05, 0.75, 1.05);
    knucklePivot.add(knuckleCap);

    const phalanx1 = new THREE.Mesh(
      createCalligraphicMuscleSegmentGeometry(0.0115, 0.0145, f.len, 0.28, 1.4),
      skinMat
    );
    phalanx1.position.y = f.len * 0.5;
    knucklePivot.add(phalanx1);

    const midPivot = new THREE.Group();
    midPivot.position.y = f.len;
    midPivot.rotation.x = 0.32;

    const pipJointRing = new THREE.Mesh(rightJointRingGeo, etchedRightBrassMat);
    pipJointRing.rotation.x = Math.PI * 0.5;
    midPivot.add(pipJointRing);

    const midLen = f.len * 0.78;
    const phalanx2 = new THREE.Mesh(
      createCalligraphicMuscleSegmentGeometry(0.0095, 0.012, midLen, 0.25, 1.4),
      jointMat
    );
    phalanx2.position.y = midLen * 0.5;
    midPivot.add(phalanx2);

    const tipPivot = new THREE.Group();
    tipPivot.position.y = midLen;
    tipPivot.rotation.x = 0.36;

    const distLen = f.len * 0.64;
    const phalanx3 = new THREE.Mesh(
      createHyperbolicPseudosphereGeometry(0.0098, distLen, 12, 8, 1.2),
      skinMat
    );
    phalanx3.position.y = distLen * 0.5;
    tipPivot.add(phalanx3);

    midPivot.add(tipPivot);
    knucklePivot.add(midPivot);

    knucklePivot.userData.midPivot = midPivot;
    knucklePivot.userData.tipPivot = tipPivot;
    knucklePivot.userData.baseYaw = f.baseYaw;
    root.add(knucklePivot);
    fingerPivots.push(knucklePivot);
    fingerChains.push({
      proximal: knucklePivot,
      intermediate: midPivot,
      distal: tipPivot,
      baseFlare: f.baseYaw,
    });
  }

  // Sculpted Calabi-Yau & Hyperbolic Palm Catalyst
  const palmCatalystGroup = new THREE.Group();
  palmCatalystGroup.position.set(-0.01, 0.09, -0.025);
  root.add(palmCatalystGroup);

  const catalystPrism = new THREE.Mesh(
    createCalabiYauRosetteGeometry(0.036, 5),
    catalystMat
  );
  palmCatalystGroup.add(catalystPrism);

  const tensorRing = new THREE.Mesh(
    createHyperbolicPseudosphereGeometry(0.044, 0.035, 16, 8, 1.6),
    catalystMat
  );
  tensorRing.rotation.x = Math.PI * 0.35;
  palmCatalystGroup.add(tensorRing);

  // Chromatic 20-Face Spectral Icosahedron Prism hovering near the Right Gauntlet
  const spectralIcosaGeo = new THREE.IcosahedronGeometry(0.046, 0).toNonIndexed();
  const icosaPos = spectralIcosaGeo.attributes.position as THREE.BufferAttribute;
  const icosaColors = new Float32Array(icosaPos.count * 3);
  const faceSpectrum = [
    new THREE.Color('#ff2a6d'),
    new THREE.Color('#f97316'),
    new THREE.Color('#eab308'),
    new THREE.Color('#10b981'),
    new THREE.Color('#00f0ff'),
    new THREE.Color('#a855f7'),
  ];
  for (let i = 0; i < icosaPos.count; i += 3) {
    const fc = faceSpectrum[Math.floor(i / 3) % faceSpectrum.length];
    for (let k = 0; k < 3; k++) {
      icosaColors[(i + k) * 3] = fc.r;
      icosaColors[(i + k) * 3 + 1] = fc.g;
      icosaColors[(i + k) * 3 + 2] = fc.b;
    }
  }
  spectralIcosaGeo.setAttribute('color', new THREE.BufferAttribute(icosaColors, 3));
  spectralIcosaGeo.computeVertexNormals();

  const spectralIcosaPrism = new THREE.Mesh(
    spectralIcosaGeo,
    new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.14,
      metalness: 0.35,
      clearcoat: 1.0,
    })
  );
  spectralIcosaPrism.position.set(0.035, 0.03, 0.015);
  palmCatalystGroup.add(spectralIcosaPrism);

  const icosaGoldCage = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.052, 1),
    etchedRightBrassMat
  );
  (icosaGoldCage.material as THREE.MeshPhysicalMaterial).wireframe = true;
  icosaGoldCage.position.copy(spectralIcosaPrism.position);
  palmCatalystGroup.add(icosaGoldCage);

  if (bio && bSpec && bio.morphologyId === 'flatland-2d-ribbon-planarian') {
    root.scale.set(1.22, 1.0, 0.36);
  }

  root.userData.fingerPivots = fingerPivots;
  root.userData.fingerChains = fingerChains;
  root.userData.palmCatalystGroup = palmCatalystGroup;
  root.userData.focusCrystal = catalystPrism;
  root.userData.emitterRing = tensorRing;
  root.userData.spectralIcosaPrism = spectralIcosaPrism;
  root.userData.catalystMat = catalystMat;

  return root;
}

/**
 * Builds the 3rd-Person Playable Character Mesh based on `PlayableCharacterSpec`
 * advancing the Seraphic Voidwalker blueprint into a smooth, high-resolution,
 * fully articulated anatomical-mechanical character with:
 * - Contoured Pelvic-Iliac Girdle Saddle & 28-segment Brigandine Thoracic Cuirass
 * - Full Upper-Arm (Biceps/Triceps + Rerebrace) & Elbow Couter Kinematic Chain
 * - Sweeping Catmull-Rom TubeGeometry Wing Spars & Cambered Airfoil Feather Plumes
 * - Sculpted Neuro-Cranial Helm Base + 3 Smooth Phase-Morphing Cranial Crowns
 * - 3-Segment Legs (Thigh Cuisse -> Winged Knee Poleyn -> Shin Greave -> Articulated Ankle Sabaton & 3 Talon Digits)
 */
export function buildPlayableCharacterMesh(
  spec: PlayableCharacterSpec,
  boundaryId?: DifferentialUniverseBoundaryId
): {
  root: THREE.Group;
  torsoGroup: THREE.Group;
  headGroup: THREE.Group;
  leftLeg: THREE.Object3D;
  rightLeg: THREE.Object3D;
  leftHandVoidRig: THREE.Group;
  rightHandToolRig: THREE.Group;
  packRotor: THREE.Object3D;
} {
  const root = new THREE.Group();
  const bSpec = boundaryId ? DIFFERENTIAL_UNIVERSE_BOUNDARIES[boundaryId] : undefined;
  const bio = bSpec?.biologyProfile as
    | { morphologyId: string }
    | undefined;
  root.scale.setScalar(spec.heightScale);
  const skinStyle = resolveCharacterSkinTopology(spec);

  const primaryMat = createComplexSkinMaterial(
    skinStyle,
    spec.primaryColor,
    spec.visorOrOrganColor,
    { translucent: spec.bodyArchetype === 'vitreous-diver' }
  );

  const secondaryMat = createComplexSkinMaterial(
    skinStyle,
    spec.secondaryColor,
    spec.voidOrbColor
  );

  const organMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(spec.visorOrOrganColor),
    emissive: new THREE.Color(spec.visorOrOrganColor),
    emissiveIntensity: 0.85,
  });

  // Articulated Upper-Body Spine/Thorax Pivot Group (Enables smooth breathing, wind-lean, slope-adaptation & sprint/landing compression)
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.78, 0);
  root.add(torsoGroup);

  // Smooth Anatomical Pelvic-Iliac Girdle Saddle & Lumbar Fascia Transition Envelope
  const pelvicGirdleGeo = createSmoothAnatomicalLatheGeometry(
    [
      [0.16, -0.14],
      [0.25, -0.06],
      [0.29, 0.03],
      [0.26, 0.14],
      [0.28, 0.26],
      [0.32, 0.38],
    ],
    28
  );
  pelvicGirdleGeo.scale(1.08, 1.0, 0.82);
  const lumbarEnvelope = new THREE.Mesh(pelvicGirdleGeo, secondaryMat);
  lumbarEnvelope.position.set(0, 0.04, 0);
  torsoGroup.add(lumbarEnvelope);

  // Attach 3D Sub-Dermal / Epidermal Topology Overlay around the Playable Character Torso
  const torsoDermalOverlay = buildDermalTopologyOverlayGroup(
    skinStyle,
    spec.primaryColor,
    spec.secondaryColor,
    spec.visorOrOrganColor,
    0.34
  );
  torsoDermalOverlay.position.y = 0.4;
  torsoGroup.add(torsoDermalOverlay);

  // Torso varies by biological/physical archetype using smooth biomorphic implicit surfaces
  if (spec.bodyArchetype === 'chitin-nomad') {
    const thoraxMesh = new THREE.Mesh(
      createImplicitMetaballPiercedGeometry(0.36, 1.32, 701, 0.72),
      primaryMat
    );
    thoraxMesh.position.y = 0.4;
    thoraxMesh.castShadow = true;
    torsoGroup.add(thoraxMesh);
  } else if (spec.bodyArchetype === 'vitreous-diver') {
    const bell = new THREE.Mesh(
      createImplicitMetaballPiercedGeometry(0.35, 1.35, 809, 0.82),
      primaryMat
    );
    bell.position.y = 0.4;
    torsoGroup.add(bell);

    const heartCore = new THREE.Mesh(
      createCalabiYauRosetteGeometry(0.16, 5),
      organMat
    );
    heartCore.position.y = 0.4;
    torsoGroup.add(heartCore);
  } else if (spec.bodyArchetype === 'mycelial-symbiont') {
    const stalk = new THREE.Mesh(
      createDifferentialGrowthRibbonGeometry(0.32, 0.84, 5, 1.2, 28, 18),
      secondaryMat
    );
    stalk.position.y = 0.37;
    torsoGroup.add(stalk);

    const canopy = new THREE.Mesh(
      createHyperbolicPseudosphereGeometry(0.46, 0.34, 22, 14, 1.3),
      primaryMat
    );
    canopy.position.y = 0.76;
    torsoGroup.add(canopy);
  } else if (spec.bodyArchetype === 'ossified-cantor') {
    const gyroidRibcage = new THREE.Mesh(
      createTPMSGyroidShellGeometry(0.32, 0.86, 26, 18, 3.2, 0.35),
      primaryMat
    );
    gyroidRibcage.position.y = 0.4;
    torsoGroup.add(gyroidRibcage);
  } else if (spec.bodyArchetype === 'ferro-seraph') {
    const boccioniCore = new THREE.Mesh(
      createBoccioniSpatialContinuityGeometry(0.42),
      primaryMat
    );
    boccioniCore.position.y = 0.42;
    torsoGroup.add(boccioniCore);
  } else {
    const sculptedTorso = new THREE.Mesh(
      createImplicitMetaballPiercedGeometry(0.36, 1.35, 911, 0.68),
      primaryMat
    );
    sculptedTorso.position.y = 0.4;
    sculptedTorso.castShadow = true;
    torsoGroup.add(sculptedTorso);
  }

  // ============================================================================
  // ADVANCED SERAPHIC VOIDWALKER HIGH-RESOLUTION STUDIO MATERIALS
  // ============================================================================
  const obsidianPlateMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#0d1017'),
    metalness: 0.88,
    roughness: 0.2,
    clearcoat: 0.86,
    clearcoatRoughness: 0.14,
    iridescence: 0.22,
  });
  const shroudClothMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#080a11'),
    metalness: 0.14,
    roughness: 0.82,
    sheen: 0.55,
    sheenColor: new THREE.Color('#1e293b'),
    side: THREE.DoubleSide,
  });
  const sacredGoldTrimMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#eab308'),
    emissive: new THREE.Color('#ca8a04'),
    emissiveIntensity: 0.48,
    metalness: 0.94,
    roughness: 0.16,
    clearcoat: 0.75,
  });
  const furnaceEmberSeamMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#f97316'),
    emissive: new THREE.Color('#ea580c'),
    emissiveIntensity: 0.92,
    metalness: 0.45,
    roughness: 0.16,
  });
  const aetherCyanSeamMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#38bdf8'),
    emissive: new THREE.Color('#0284c7'),
    emissiveIntensity: 0.92,
    metalness: 0.45,
    roughness: 0.16,
  });

  // 1. Smoothly Contoured 28-Segment Obsidian Brigandine Thoracic Lames & Hieroglyphic Pectoral Cartouches
  for (let lame = 0; lame < 5; lame++) {
    const lameProgress = lame / 4;
    const wTop = 0.29 + lameProgress * 0.095;
    const wBot = 0.25 + lameProgress * 0.085;
    const lameMesh = new THREE.Mesh(
      createCurvedArmorShellGeometry(
        wTop,
        wBot,
        0.122,
        Math.PI * 1.92,
        28,
        6,
        0.009
      ),
      obsidianPlateMat
    );
    lameMesh.scale.set(1.12, 1.0, 0.78);
    lameMesh.position.set(0, 0.18 + lame * 0.125, 0.01);
    torsoGroup.add(lameMesh);

    const seamRing = new THREE.Mesh(
      new THREE.TorusGeometry(wTop * 0.95, 0.0075, 10, 32),
      lame % 2 === 0 ? sacredGoldTrimMat : furnaceEmberSeamMat
    );
    seamRing.rotation.x = Math.PI / 2;
    seamRing.scale.set(1.12, 0.78, 1.0);
    seamRing.position.set(0, 0.23 + lame * 0.125, 0.01);
    torsoGroup.add(seamRing);
  }

  // Beveled Egyptian-Cyber Gold Hieroglyphic Pectoral Cartouche Tablets across the Upper Chest
  const cartoucheGeo = createBeveledOctaSigilGeometry(0.038, 0.85, 1.28, 0.34);
  for (let col = -2; col <= 2; col++) {
    for (let row = 0; row < 2; row++) {
      const cartouche = new THREE.Mesh(cartoucheGeo, sacredGoldTrimMat);
      cartouche.position.set(
        col * 0.072,
        0.55 + row * 0.105 - Math.abs(col) * 0.015,
        -0.238 + Math.abs(col) * 0.018
      );
      cartouche.rotation.y = -col * 0.14;
      torsoGroup.add(cartouche);
    }
  }

  // Twin Flanked Amethyst Geode Crystal Clusters with Sacred-Geometry Wireframe Cages at the Waist/Hip Flanks
  const amethystCrystalMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#9333ea'),
    emissive: new THREE.Color('#7e22ce'),
    emissiveIntensity: 0.68,
    roughness: 0.12,
    metalness: 0.25,
    clearcoat: 1.0,
    transmission: 0.35,
  });
  for (const gSide of [-1, 1]) {
    const geodeCluster = new THREE.Group();
    geodeCluster.position.set(gSide * 0.36, 0.28, -0.06);
    for (let c = 0; c < 5; c++) {
      const crystalSpike = new THREE.Mesh(
        new THREE.ConeGeometry(0.032, 0.145 - c * 0.015, 8),
        amethystCrystalMat
      );
      crystalSpike.position.set(
        gSide * (c % 2) * 0.025,
        (c - 2) * 0.028,
        ((c % 3) - 1) * 0.025
      );
      crystalSpike.rotation.z = -gSide * (0.95 + c * 0.18);
      crystalSpike.rotation.x = (c - 2) * 0.22;
      geodeCluster.add(crystalSpike);
    }
    const sacredGeodeFrame = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.11, 1),
      new THREE.MeshBasicMaterial({
        color: '#fde047',
        wireframe: true,
        transparent: true,
        opacity: 0.72,
      })
    );
    geodeCluster.add(sacredGeodeFrame);
    torsoGroup.add(geodeCluster);
  }

  // Smooth Flared High-Collared Gold-Banded Neck Gorget Collar
  for (let gc = 0; gc < 3; gc++) {
    const gorgetBand = new THREE.Mesh(
      createCurvedArmorShellGeometry(
        0.24 + gc * 0.032,
        0.26 + gc * 0.032,
        0.048,
        Math.PI * 1.95,
        28,
        4,
        0.006
      ),
      gc % 2 === 0 ? sacredGoldTrimMat : obsidianPlateMat
    );
    gorgetBand.position.set(0, 0.78 + gc * 0.048, 0.01);
    torsoGroup.add(gorgetBand);
  }

  const spineMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#262d3d'),
    metalness: 0.88,
    roughness: 0.24,
  });
  const pistonShaftMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#94a3b8'),
    metalness: 0.96,
    roughness: 0.1,
  });

  // 2. 3-Tier Articulated Shoulder Pauldrons + Complete Upper Arm (Humerus Bicep/Tricep & Rerebrace) & Elbow Couter Rig
  const buildUpperArmAndShoulderAssembly = (side: -1 | 1) => {
    const deltoidPod = new THREE.Mesh(
      createImplicitMetaballPiercedGeometry(0.16, 0.9, 500 + side * 19, 0.25),
      secondaryMat
    );
    deltoidPod.position.set(side * 0.28, 0.58, -0.04);
    deltoidPod.rotation.z = -side * 0.45;
    torsoGroup.add(deltoidPod);

    const pauldronGroup = new THREE.Group();
    pauldronGroup.position.set(side * 0.35, 0.65, -0.01);
    pauldronGroup.rotation.z = -side * 0.32;

    for (let tier = 0; tier < 3; tier++) {
      const pPlate = new THREE.Mesh(
        createCurvedArmorShellGeometry(
          0.11 + tier * 0.025,
          0.145 + tier * 0.028,
          0.098,
          Math.PI * 1.32,
          22,
          6,
          0.008
        ),
        obsidianPlateMat
      );
      pPlate.rotation.y = side > 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
      pPlate.position.set(side * tier * 0.022, -tier * 0.072, 0);
      pauldronGroup.add(pPlate);

      const pTrim = new THREE.Mesh(
        new THREE.TorusGeometry(
          0.135 + tier * 0.025,
          0.0085,
          8,
          24,
          Math.PI * 1.22
        ),
        sacredGoldTrimMat
      );
      pTrim.rotation.x = Math.PI / 2;
      pTrim.rotation.z = side > 0 ? -Math.PI * 0.12 : Math.PI * 0.88;
      pTrim.position.set(side * tier * 0.022, -tier * 0.072 - 0.042, 0);
      pauldronGroup.add(pTrim);
    }

    const shoulderFin = new THREE.Mesh(
      createBeveledOctaSigilGeometry(0.085, 0.48, 1.15, 0.82),
      sacredGoldTrimMat
    );
    shoulderFin.position.set(side * 0.02, 0.085, -0.01);
    pauldronGroup.add(shoulderFin);
    torsoGroup.add(pauldronGroup);

    // Sculpted Upper-Arm Humerus (Biceps Brachii / Triceps + Fluted Rerebrace Armor + Elbow Couter Guard)
    // Pivots at the glenohumeral shoulder socket and aims continuously toward the articulated forearm/hand rig
    const upperArmPivot = new THREE.Group();
    upperArmPivot.position.set(side * 0.33, 0.56, -0.04);
    torsoGroup.add(upperArmPivot);

    const humerusMuscle = new THREE.Mesh(
      createCalligraphicMuscleSegmentGeometry(0.086, 0.068, 0.32, 0.38, 1.25),
      primaryMat
    );
    humerusMuscle.rotation.x = Math.PI * 0.5;
    humerusMuscle.position.set(0, 0, 0.15);
    upperArmPivot.add(humerusMuscle);

    const rerebracePlate = new THREE.Mesh(
      createCurvedArmorShellGeometry(0.088, 0.074, 0.24, Math.PI * 1.35, 20, 6, 0.006),
      obsidianPlateMat
    );
    rerebracePlate.rotation.x = Math.PI * 0.5;
    rerebracePlate.position.set(0, 0, 0.14);
    upperArmPivot.add(rerebracePlate);

    const rerebraceGoldBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.082, 0.006, 8, 22),
      sacredGoldTrimMat
    );
    rerebraceGoldBand.position.set(0, 0, 0.14);
    upperArmPivot.add(rerebraceGoldBand);

    // Sculpted Winged Elbow Couter Joint Cap + Hydraulic Flexor Piston
    const elbowCouter = new THREE.Mesh(
      createBeveledOctaSigilGeometry(0.064, 0.92, 0.85, 1.15),
      obsidianPlateMat
    );
    elbowCouter.position.set(side * 0.015, -0.015, 0.29);
    upperArmPivot.add(elbowCouter);

    const elbowGoldTrim = new THREE.Mesh(
      new THREE.TorusGeometry(0.056, 0.0055, 8, 18),
      side < 0 ? furnaceEmberSeamMat : aetherCyanSeamMat
    );
    elbowGoldTrim.position.set(0, 0, 0.28);
    upperArmPivot.add(elbowGoldTrim);

    return { pauldronGroup, upperArmPivot };
  };

  const leftShoulderAsm = buildUpperArmAndShoulderAssembly(-1);
  const rightShoulderAsm = buildUpperArmAndShoulderAssembly(1);
  torsoGroup.userData.leftUpperArmPivot = leftShoulderAsm.upperArmPivot;
  torsoGroup.userData.rightUpperArmPivot = rightShoulderAsm.upperArmPivot;
  torsoGroup.userData.leftPauldronGroup = leftShoulderAsm.pauldronGroup;
  torsoGroup.userData.rightPauldronGroup = rightShoulderAsm.pauldronGroup;

  // 3. 4-Winged Seraphic Ophanim Feather Rig with Sweeping Catmull-Rom Golden Spars, Cambered Airfoil Feathers & 12 All-Seeing Eyes
  const seraphicWingsGroup = new THREE.Group();
  seraphicWingsGroup.name = 'seraphic-ophanim-wings-rig';
  seraphicWingsGroup.position.set(0, 0.56, 0.22);
  torsoGroup.add(seraphicWingsGroup);

  const wingPivots: THREE.Group[] = [];
  const wingEyeIrises: THREE.Mesh[] = [];
  const rainbowFeatherColors = [
    '#ff2a6d',
    '#f97316',
    '#eab308',
    '#10b981',
    '#00f0ff',
    '#a855f7',
    '#ec4899',
  ];

  for (let pairIdx = 0; pairIdx < 2; pairIdx++) {
    for (const wSide of [-1, 1]) {
      const wingPivot = new THREE.Group();
      wingPivot.position.set(
        wSide * (pairIdx === 0 ? 0.18 : 0.15),
        pairIdx === 0 ? 0.14 : -0.18,
        pairIdx * 0.03
      );
      const baseRoll = wSide * (pairIdx === 0 ? 0.42 : -0.36);
      wingPivot.rotation.z = baseRoll;
      wingPivot.rotation.y = -wSide * 0.22;
      wingPivot.userData.wSide = wSide;
      wingPivot.userData.pairIdx = pairIdx;
      wingPivot.userData.baseRoll = baseRoll;

      // Sweeping Anatomical Golden Wing-Bone Arch (Catmull-Rom TubeGeometry instead of flat BoxGeometry)
      const sparCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(wSide * 0.26, 0.09, -0.02),
        new THREE.Vector3(wSide * 0.62, 0.06, 0.02),
        new THREE.Vector3(wSide * 0.96, -0.04, 0.06),
      ]);
      const sparBar = new THREE.Mesh(
        new THREE.TubeGeometry(sparCurve, 24, 0.025, 12, false),
        sacredGoldTrimMat
      );
      wingPivot.add(sparBar);

      const wingRootSocket = new THREE.Mesh(
        createBeveledOctaSigilGeometry(0.058, 1.1, 0.9, 0.7),
        sacredGoldTrimMat
      );
      wingPivot.add(wingRootSocket);

      // 7 Layered Primary Black-Obsidian & Prismatic Rainbow Cambered Feathers per Wing
      for (let f = 0; f < 7; f++) {
        const fFrac = f / 6;
        const featherLen = (pairIdx === 0 ? 1.18 : 0.96) - fFrac * 0.34;
        const featherGroup = new THREE.Group();
        const anchorPt = sparCurve.getPoint(0.14 + fFrac * 0.82);
        featherGroup.position.copy(anchorPt);
        featherGroup.rotation.z = wSide * (-0.32 - fFrac * 0.55);

        // Central Golden Rachis Quill Spine
        const rachisQuill = new THREE.Mesh(
          new THREE.CylinderGeometry(0.007, 0.002, featherLen * 0.92, 8),
          sacredGoldTrimMat
        );
        rachisQuill.position.y = -featherLen * 0.46;
        featherGroup.add(rachisQuill);

        // Inner Rainbow-Spectrum Cambered Covert Feather Plume
        const prismColor =
          rainbowFeatherColors[(f + pairIdx * 2) % rainbowFeatherColors.length];
        const innerPrismBlade = new THREE.Mesh(
          createSculptedFeatherPlumeGeometry(featherLen * 0.66, 0.135, 0.036),
          new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(prismColor),
            emissive: new THREE.Color(prismColor),
            emissiveIntensity: 0.62,
            roughness: 0.22,
            metalness: 0.32,
            clearcoat: 0.75,
          })
        );
        innerPrismBlade.position.y = -featherLen * 0.33;
        featherGroup.add(innerPrismBlade);

        // Outer Jet-Black Obsidian Primary Flight Feather Plume
        const outerBlackBlade = new THREE.Mesh(
          createSculptedFeatherPlumeGeometry(featherLen * 0.68, 0.118, 0.048),
          shroudClothMat
        );
        outerBlackBlade.position.set(0, -featherLen * 0.66, 0.008);
        featherGroup.add(outerBlackBlade);

        // Smooth Tapered Obsidian Ink Tendril at Feather Tip
        if (f % 2 === 0) {
          const inkDrip = new THREE.Mesh(
            new THREE.CylinderGeometry(0.005, 0.0015, 0.24, 8),
            shroudClothMat
          );
          inkDrip.position.set(0, -featherLen * 0.96, 0.012);
          featherGroup.add(inkDrip);
        }

        // All-Seeing Polychromatic Ophanim Eyes with Golden Eyelid Bezels embedded on Feathers 1, 3, 5
        if (f === 1 || f === 3 || f === 5) {
          const eyeGroup = new THREE.Group();
          eyeGroup.position.set(0, -featherLen * 0.44, -0.026);

          const eyelidBezel = new THREE.Mesh(
            new THREE.TorusGeometry(0.044, 0.0055, 8, 20),
            sacredGoldTrimMat
          );
          eyelidBezel.scale.set(1.32, 0.78, 0.65);
          eyeGroup.add(eyelidBezel);

          const sclera = new THREE.Mesh(
            new THREE.SphereGeometry(0.042, 16, 14),
            new THREE.MeshBasicMaterial({ color: '#f8fafc' })
          );
          sclera.scale.set(1.35, 0.78, 0.45);
          eyeGroup.add(sclera);

          const irisCol =
            rainbowFeatherColors[(f * 2 + pairIdx) % rainbowFeatherColors.length];
          const iris = new THREE.Mesh(
            new THREE.SphereGeometry(0.025, 14, 12),
            new THREE.MeshBasicMaterial({ color: irisCol })
          );
          iris.position.z = -0.015;
          iris.scale.set(1.0, 1.0, 0.5);
          eyeGroup.add(iris);
          wingEyeIrises.push(iris);

          const pupil = new THREE.Mesh(
            new THREE.SphereGeometry(0.012, 12, 10),
            new THREE.MeshBasicMaterial({ color: '#020617' })
          );
          pupil.position.z = -0.026;
          eyeGroup.add(pupil);

          featherGroup.add(eyeGroup);
        }

        wingPivot.add(featherGroup);
      }

      seraphicWingsGroup.add(wingPivot);
      wingPivots.push(wingPivot);
    }
  }
  torsoGroup.userData.seraphicWingsGroup = seraphicWingsGroup;
  torsoGroup.userData.wingPivots = wingPivots;
  torsoGroup.userData.wingEyeIrises = wingEyeIrises;

  // Articulated Hard-Surface Cybernetic Spine Vertebrae
  const cyberSpineGroup = new THREE.Group();
  cyberSpineGroup.name = 'cybernetic-lumbar-spine';
  cyberSpineGroup.position.set(0, 0.18, 0.21);

  for (let v = 0; v < 5; v++) {
    const vertGeo = createHyperbolicPseudosphereGeometry(
      0.056 - v * 0.005,
      0.08,
      14,
      10,
      1.2
    );
    const vertMesh = new THREE.Mesh(vertGeo, spineMat);
    vertMesh.position.set(0, v * 0.095, 0);
    vertMesh.rotation.x = -0.25;
    cyberSpineGroup.add(vertMesh);
  }
  torsoGroup.add(cyberSpineGroup);

  // Smooth Contoured Gold-Filigree Occult War-Belt, 3 Glowing Reliquary Vials & Curved Thigh-Guard Tassets
  const warBelt = new THREE.Mesh(
    createCurvedArmorShellGeometry(0.305, 0.325, 0.115, Math.PI * 2, 28, 6, 0.01),
    obsidianPlateMat
  );
  warBelt.scale.set(1.1, 1.0, 0.82);
  warBelt.position.set(0, 0.06, 0);
  torsoGroup.add(warBelt);

  const beltBuckleSigil = new THREE.Mesh(
    createBeveledOctaSigilGeometry(0.068, 1.15, 1.15, 0.42),
    sacredGoldTrimMat
  );
  beltBuckleSigil.position.set(0, 0.06, -0.26);
  torsoGroup.add(beltBuckleSigil);

  const vialColors = ['#f43f5e', '#38bdf8', '#f97316'];
  for (let vl = 0; vl < 3; vl++) {
    const vialMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.095, 14),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(vialColors[vl]),
        emissive: new THREE.Color(vialColors[vl]),
        emissiveIntensity: 0.78,
        roughness: 0.08,
        metalness: 0.2,
        clearcoat: 1.0,
      })
    );
    vialMesh.position.set(-0.26 - vl * 0.035, -0.02, -0.14 + vl * 0.065);
    vialMesh.rotation.z = 0.22;
    torsoGroup.add(vialMesh);
  }

  for (const tSide of [-1, 1]) {
    for (let tl = 0; tl < 2; tl++) {
      const tassetPlate = new THREE.Mesh(
        createCurvedArmorShellGeometry(
          0.11 - tl * 0.012,
          0.13 - tl * 0.012,
          0.145,
          Math.PI * 0.85,
          18,
          5,
          0.007
        ),
        obsidianPlateMat
      );
      tassetPlate.rotation.y = tSide * Math.PI * 0.5;
      tassetPlate.position.set(
        tSide * (0.24 + tl * 0.018),
        -0.05 - tl * 0.12,
        0
      );
      tassetPlate.rotation.z = -tSide * (0.18 + tl * 0.08);
      torsoGroup.add(tassetPlate);
    }
  }

  // Dorsal Calabi-Yau & Schoen Gyroid Organ Rotor
  const packRotor = new THREE.Mesh(
    createCalabiYauRosetteGeometry(0.24, 5),
    organMat
  );
  packRotor.position.set(0, 0.46, 0.26);
  torsoGroup.add(packRotor);

  // ============================================================================
  // 4. DYNAMIC SHAPESHIFTING CRANIAL HEAD GROUP (Smooth Neuro-Cranial Helm + 3 Phase Crowns!)
  // ============================================================================
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.88, 0);
  torsoGroup.add(headGroup);

  const cervicalNeck = new THREE.Mesh(
    createCalligraphicMuscleSegmentGeometry(0.11, 0.14, 0.22, 0.32, 1.1),
    obsidianPlateMat
  );
  cervicalNeck.position.y = 0.02;
  headGroup.add(cervicalNeck);

  // Smooth Sculpted Neuro-Cranial Obsidian Helm Core + Golden Visor Brow Arch
  const cranialHelmCore = new THREE.Mesh(
    createSculptedCraniumGeometry(0.155, 'navigator-helm'),
    obsidianPlateMat
  );
  cranialHelmCore.position.set(0, 0.16, -0.01);
  headGroup.add(cranialHelmCore);

  const helmVisorArch = new THREE.Mesh(
    new THREE.TorusGeometry(0.148, 0.011, 10, 28, Math.PI * 0.85),
    sacredGoldTrimMat
  );
  helmVisorArch.rotation.x = Math.PI * 0.52;
  helmVisorArch.rotation.z = -Math.PI * 0.92;
  helmVisorArch.position.set(0, 0.18, -0.02);
  headGroup.add(helmVisorArch);

  // --- CRANIAL PHASE A: Burning Vascular Dendritic Tree-Crown & White Porcelain Mask ---
  const vascularTreeCrownGroup = new THREE.Group();
  vascularTreeCrownGroup.name = 'vascular-dendritic-tree-crown';
  headGroup.add(vascularTreeCrownGroup);

  const innerWhiteFlameCore = new THREE.Mesh(
    new THREE.ConeGeometry(0.14, 0.48, 16),
    new THREE.MeshBasicMaterial({
      color: '#fffbeb',
      transparent: true,
      opacity: 0.92,
    })
  );
  innerWhiteFlameCore.position.set(0, 0.24, 0);
  vascularTreeCrownGroup.add(innerWhiteFlameCore);

  const outerAmberFlameShell = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.21, 2),
    furnaceEmberSeamMat
  );
  outerAmberFlameShell.scale.set(0.88, 1.45, 0.88);
  outerAmberFlameShell.position.set(0, 0.22, 0);
  vascularTreeCrownGroup.add(outerAmberFlameShell);

  // 10 Bifurcating Crimson Arterial Tree Branches erupting upward from the collar
  const arterialBranchMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#dc2626'),
    emissive: new THREE.Color('#991b1b'),
    emissiveIntensity: 0.75,
    roughness: 0.24,
    metalness: 0.22,
  });
  for (let b = 0; b < 10; b++) {
    const bAngle = (b / 10) * Math.PI * 2;
    const branchPivot = new THREE.Group();
    branchPivot.position.set(
      Math.cos(bAngle) * 0.06,
      0.06,
      Math.sin(bAngle) * 0.06
    );
    branchPivot.rotation.y = -bAngle;
    branchPivot.rotation.z = 0.38 + (b % 3) * 0.14;

    const mainLimb = new THREE.Mesh(
      createCalligraphicMuscleSegmentGeometry(0.026, 0.011, 0.44, 0.28, 1.3),
      arterialBranchMat
    );
    mainLimb.position.y = 0.22;
    branchPivot.add(mainLimb);

    for (const forkSide of [-1, 1]) {
      const twig = new THREE.Mesh(
        createCalligraphicMuscleSegmentGeometry(0.011, 0.004, 0.24, 0.22, 1.2),
        arterialBranchMat
      );
      twig.position.set(0, 0.34, forkSide * 0.06);
      twig.rotation.x = forkSide * 0.58;
      branchPivot.add(twig);
    }

    vascularTreeCrownGroup.add(branchPivot);
  }

  // Floating Sculpted White Porcelain Classical Mask Orbiting at the Upper-Right of the Flame Crown
  const floatingPorcelainMaskGroup = new THREE.Group();
  floatingPorcelainMaskGroup.position.set(0.34, 0.32, -0.14);
  floatingPorcelainMaskGroup.rotation.y = -0.32;
  const porcelainMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#f1f5f9'),
    roughness: 0.18,
    metalness: 0.08,
    clearcoat: 0.92,
    clearcoatRoughness: 0.1,
  });
  const maskFace = new THREE.Mesh(
    createSculptedCraniumGeometry(0.14, 'zygomatic-crest'),
    porcelainMat
  );
  maskFace.scale.set(0.88, 1.18, 0.52);
  floatingPorcelainMaskGroup.add(maskFace);

  const maskHaloRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.135, 0.006, 8, 24),
    sacredGoldTrimMat
  );
  maskHaloRim.scale.set(0.88, 1.18, 1.0);
  maskHaloRim.position.set(0, 0, -0.01);
  floatingPorcelainMaskGroup.add(maskHaloRim);

  for (const mSide of [-1, 1]) {
    const maskEye = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 14, 12),
      new THREE.MeshBasicMaterial({ color: '#0f172a' })
    );
    maskEye.scale.set(1.3, 0.65, 0.5);
    maskEye.position.set(mSide * 0.042, 0.025, -0.068);
    floatingPorcelainMaskGroup.add(maskEye);
  }
  const maskNose = new THREE.Mesh(
    createBeveledOctaSigilGeometry(0.022, 0.68, 1.45, 0.85),
    porcelainMat
  );
  maskNose.rotation.x = -Math.PI * 0.12;
  maskNose.position.set(0, -0.005, -0.076);
  floatingPorcelainMaskGroup.add(maskNose);
  headGroup.add(floatingPorcelainMaskGroup);

  // --- CRANIAL PHASE B: Escher-Jade Pyramid-Eye Cranium ---
  const pyramidEyeHeadGroup = new THREE.Group();
  pyramidEyeHeadGroup.name = 'escher-jade-pyramid-eye-cranium';
  pyramidEyeHeadGroup.position.set(0, 0.22, 0);
  const jadeEmeraldMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#10b981'),
    emissive: new THREE.Color('#047857'),
    emissiveIntensity: 0.42,
    roughness: 0.2,
    metalness: 0.35,
    clearcoat: 0.88,
  });
  const pyramidSkull = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 0.42, 4, 4),
    jadeEmeraldMat
  );
  pyramidSkull.rotation.x = Math.PI;
  pyramidSkull.rotation.y = Math.PI * 0.25;
  pyramidEyeHeadGroup.add(pyramidSkull);

  const pyramidGoldWire = new THREE.Mesh(
    new THREE.ConeGeometry(0.29, 0.43, 4, 2),
    new THREE.MeshBasicMaterial({
      color: '#fde047',
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    })
  );
  pyramidGoldWire.rotation.copy(pyramidSkull.rotation);
  pyramidEyeHeadGroup.add(pyramidGoldWire);

  // Giant Central All-Seeing Cyan/Emerald Eye on the front face of the Pyramid Head
  const pyramidSclera = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 18, 16),
    new THREE.MeshBasicMaterial({ color: '#f8fafc' })
  );
  pyramidSclera.scale.set(1.4, 0.82, 0.45);
  pyramidSclera.position.set(0, 0.04, -0.14);
  pyramidSclera.rotation.x = -0.35;
  pyramidEyeHeadGroup.add(pyramidSclera);

  const pyramidIris = new THREE.Mesh(
    new THREE.SphereGeometry(0.042, 16, 14),
    new THREE.MeshBasicMaterial({ color: '#06b6d4' })
  );
  pyramidIris.position.set(0, 0.045, -0.168);
  pyramidEyeHeadGroup.add(pyramidIris);

  const pyramidPupil = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 12, 12),
    new THREE.MeshBasicMaterial({ color: '#020617' })
  );
  pyramidPupil.position.set(0, 0.048, -0.185);
  pyramidEyeHeadGroup.add(pyramidPupil);
  headGroup.add(pyramidEyeHeadGroup);

  // --- CRANIAL PHASE C: Sacred-Geometry Golden Metatron Astrolabe Halo Crown behind the Head ---
  const runicHaloGoldMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#fde047'),
    emissive: new THREE.Color('#f59e0b'),
    emissiveIntensity: 0.85,
    metalness: 0.88,
    roughness: 0.14,
  });
  const cranialRunicHalo = new THREE.Mesh(
    new THREE.TorusGeometry(0.38, 0.012, 12, 48),
    runicHaloGoldMat
  );
  cranialRunicHalo.position.set(0, 0.24, 0.18);
  headGroup.add(cranialRunicHalo);

  const metatronStarA = new THREE.Mesh(
    new THREE.RingGeometry(0.28, 0.3, 3),
    new THREE.MeshBasicMaterial({
      color: '#fde047',
      side: THREE.DoubleSide,
      wireframe: true,
    })
  );
  metatronStarA.position.set(0, 0.24, 0.18);
  headGroup.add(metatronStarA);

  const metatronStarB = new THREE.Mesh(
    new THREE.RingGeometry(0.28, 0.3, 3),
    new THREE.MeshBasicMaterial({
      color: '#fde047',
      side: THREE.DoubleSide,
      wireframe: true,
    })
  );
  metatronStarB.rotation.z = Math.PI;
  metatronStarB.position.set(0, 0.24, 0.18);
  headGroup.add(metatronStarB);

  headGroup.userData.vascularTreeCrownGroup = vascularTreeCrownGroup;
  headGroup.userData.floatingPorcelainMaskGroup = floatingPorcelainMaskGroup;
  headGroup.userData.pyramidEyeHeadGroup = pyramidEyeHeadGroup;
  headGroup.userData.cranialRunicHalo = cranialRunicHalo;
  headGroup.userData.metatronStarA = metatronStarA;
  headGroup.userData.metatronStarB = metatronStarB;

  // Smooth Beveled Sternum Sacred-Geometry Ankh-Diamond Core & RGB Pixelated Glitch Mosaic Cubes
  const chestSigilBezel = new THREE.Mesh(
    createBeveledOctaSigilGeometry(0.095, 1.15, 1.4, 0.36),
    sacredGoldTrimMat
  );
  chestSigilBezel.position.set(0, 0.44, -0.245);
  torsoGroup.add(chestSigilBezel);

  const chestSigilCore = new THREE.Mesh(
    createBeveledOctaSigilGeometry(0.062, 1.0, 1.3, 0.46),
    furnaceEmberSeamMat
  );
  chestSigilCore.position.set(0, 0.44, -0.255);
  torsoGroup.add(chestSigilCore);

  // Floating Pixel-Glitch Mosaic Voxels around the Neck & Wings
  const charGlitchColors = ['#ff2a6d', '#f97316', '#eab308', '#00f0ff', '#a855f7'];
  const glitchVoxels: THREE.Mesh[] = [];
  for (let g = 0; g < 8; g++) {
    const voxel = new THREE.Mesh(
      new THREE.BoxGeometry(0.042, 0.042, 0.014),
      new THREE.MeshBasicMaterial({
        color: charGlitchColors[g % charGlitchColors.length],
        transparent: true,
        opacity: 0.85,
      })
    );
    const side = g % 2 === 0 ? 1 : -1;
    voxel.position.set(
      side * (0.22 + (g % 3) * 0.06),
      0.74 + Math.floor(g / 2) * 0.08,
      0.08
    );
    torsoGroup.add(voxel);
    glitchVoxels.push(voxel);
  }
  torsoGroup.userData.glitchVoxels = glitchVoxels;

  // 5. Articulated 3-Segment Armored Cuisse, Greave & Ankle Sabaton Legs with Winged Knee Poleyns & 3-Talon Sabatons
  const buildLegWithDigits = (xOffset: number) => {
    const legGroup = new THREE.Group();
    legGroup.position.set(xOffset, 0.78, 0);
    const sideSign = xOffset < 0 ? -1 : 1;

    const hipCapsule = new THREE.Mesh(
      createImplicitMetaballPiercedGeometry(0.138, 0.85, 311, 0.2),
      obsidianPlateMat
    );
    hipCapsule.position.set(0, 0.02, 0);
    legGroup.add(hipCapsule);

    const thighMesh = new THREE.Mesh(
      createCalligraphicMuscleSegmentGeometry(0.132, 0.096, 0.44, 0.44, 1.15),
      obsidianPlateMat
    );
    thighMesh.position.y = -0.2;
    thighMesh.castShadow = true;
    legGroup.add(thighMesh);

    // Smoothly Contoured Outer Thigh Cuisse Shell Plate
    const cuissePlate = new THREE.Mesh(
      createCurvedArmorShellGeometry(0.122, 0.098, 0.35, Math.PI * 1.25, 22, 6, 0.008),
      spineMat
    );
    cuissePlate.rotation.y = sideSign * Math.PI * 0.35;
    cuissePlate.position.set(0, -0.19, -0.01);
    legGroup.add(cuissePlate);

    const kneeGroup = new THREE.Group();
    kneeGroup.position.set(0, -0.4, 0.01);
    legGroup.add(kneeGroup);

    // Smooth Beveled Winged Gothic/Cyber-Occult Knee Poleyn Armor Guard
    const kneePoleyn = new THREE.Mesh(
      createBeveledOctaSigilGeometry(0.096, 0.95, 1.28, 0.85),
      obsidianPlateMat
    );
    kneePoleyn.position.set(0, 0.01, -0.038);
    kneeGroup.add(kneePoleyn);

    const kneeGoldChevron = new THREE.Mesh(
      new THREE.TorusGeometry(0.078, 0.008, 8, 22, Math.PI),
      sacredGoldTrimMat
    );
    kneeGoldChevron.position.set(0, 0.01, -0.075);
    kneeGroup.add(kneeGoldChevron);

    const kneePiston = new THREE.Mesh(
      createCalligraphicMuscleSegmentGeometry(0.018, 0.014, 0.22, 0.2, 1.1),
      pistonShaftMat
    );
    kneePiston.position.set(0, -0.05, 0.065);
    kneePiston.rotation.x = 0.32;
    kneeGroup.add(kneePiston);

    const crusMesh = new THREE.Mesh(
      createCalligraphicMuscleSegmentGeometry(0.098, 0.068, 0.42, 0.38, 1.2),
      obsidianPlateMat
    );
    crusMesh.position.set(0, -0.18, 0.01);
    crusMesh.castShadow = true;
    kneeGroup.add(crusMesh);

    // Contoured Anterior Shin Greave Shell & Glowing Seam Channel
    const greaveShell = new THREE.Mesh(
      createCurvedArmorShellGeometry(0.096, 0.07, 0.32, Math.PI * 1.1, 20, 6, 0.006),
      obsidianPlateMat
    );
    greaveShell.rotation.y = Math.PI;
    greaveShell.position.set(0, -0.18, -0.008);
    kneeGroup.add(greaveShell);

    const shinSeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.007, 0.005, 0.32, 10),
      sideSign < 0 ? furnaceEmberSeamMat : aetherCyanSeamMat
    );
    shinSeam.position.set(0, -0.18, -0.074);
    kneeGroup.add(shinSeam);

    // Articulated Ankle Joint & Sculpted Armored Sabaton Foot Arch + Calcaneus Heel Spur
    const ankleGroup = new THREE.Group();
    ankleGroup.position.set(0, -0.35, 0.0);
    kneeGroup.add(ankleGroup);

    const ankleMalleolusRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.062, 0.007, 8, 20),
      sacredGoldTrimMat
    );
    ankleMalleolusRing.rotation.x = Math.PI * 0.5;
    ankleMalleolusRing.position.set(0, 0.01, 0);
    ankleGroup.add(ankleMalleolusRing);

    const sabatonFootArch = new THREE.Mesh(
      createBeveledOctaSigilGeometry(0.074, 0.92, 0.52, 1.45),
      obsidianPlateMat
    );
    sabatonFootArch.position.set(0, -0.015, -0.038);
    sabatonFootArch.rotation.x = 0.18;
    ankleGroup.add(sabatonFootArch);

    const heelSpur = new THREE.Mesh(
      createHyperbolicPseudosphereGeometry(0.024, 0.11, 10, 6, 1.2),
      sacredGoldTrimMat
    );
    heelSpur.rotation.x = Math.PI * 0.45;
    heelSpur.position.set(0, -0.01, 0.068);
    ankleGroup.add(heelSpur);

    const pedalDigits: THREE.Group[] = [];
    for (let d = -1; d <= 1; d++) {
      const toePivot = new THREE.Group();
      toePivot.position.set(d * 0.05, -0.01, -0.06);
      toePivot.rotation.y = -d * 0.25;
      const toeClaw = new THREE.Mesh(
        createHyperbolicPseudosphereGeometry(0.028, 0.16, 12, 8, 1.2),
        obsidianPlateMat
      );
      toeClaw.rotation.x = -Math.PI * 0.42;
      toeClaw.position.z = -0.06;
      toePivot.add(toeClaw);
      ankleGroup.add(toePivot);
      pedalDigits.push(toePivot);
    }
    legGroup.userData.kneeGroup = kneeGroup;
    legGroup.userData.ankleGroup = ankleGroup;
    legGroup.userData.pedalDigits = pedalDigits;
    return legGroup;
  };

  const leftLeg = buildLegWithDigits(-0.18);
  root.add(leftLeg);

  const rightLeg = buildLegWithDigits(0.18);
  root.add(rightLeg);

  // Left Arm & Left-Hand Void Ball Rig mounted to Torso Group so arms breathe and lean with chest
  const leftHandVoidRig = buildLeftHandVoidBallRig(spec, boundaryId);
  leftHandVoidRig.scale.multiplyScalar(1.85);
  leftHandVoidRig.position.set(-0.44, 0.4, -0.26);
  torsoGroup.add(leftHandVoidRig);

  // Right Arm & Right-Hand Tool Catalyst Rig mounted to Torso Group
  const rightHandToolRig = buildRightHandToolRig(spec, boundaryId);
  rightHandToolRig.scale.multiplyScalar(1.85);
  rightHandToolRig.position.set(0.44, 0.4, -0.26);
  torsoGroup.add(rightHandToolRig);

  // ============================================================================
  // 6. EVOLUTIONARY DIMENSIONAL BIOLOGY & SENSORY MORPHOLOGY MUTATION
  // Physically mutates the player's 3D anatomy, torso scale axes, limb elongation,
  // and sensory organs to match the theoretical evolutionary biology of the active dimension!
  // ============================================================================
  if (bio && bSpec) {
    const bioExt = bio as {
      morphologyId: string;
      torsoScaleAxes?: [number, number, number];
      limbElongation?: number;
    };
    const [tsx, tsy, tsz] = bioExt.torsoScaleAxes ?? [1.0, 1.0, 1.0];
    torsoGroup.scale.set(tsx, tsy, tsz);
    const limbScaleY = bioExt.limbElongation ?? 1.0;
    leftLeg.scale.set(1.0, limbScaleY, 1.0);
    rightLeg.scale.set(1.0, limbScaleY, 1.0);

    const bioOrganGroup = new THREE.Group();
    bioOrganGroup.name = `dimensional-biology-mutation-${bio.morphologyId}`;
    const bioAccentMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(bSpec.primaryAccentHex),
      emissive: new THREE.Color(bSpec.secondaryAccentHex),
      emissiveIntensity: 0.95,
      metalness: 0.45,
      roughness: 0.16,
      clearcoat: 0.9,
      transparent: true,
      opacity: 0.9,
    });

    if (bio.morphologyId === 'planck-0d-quantum-monad') {
      // 0D Planck Quantum-Foam Monad: Orbiting Casimir zero-point shell & Wheeler wormhole rings
      const monadShell = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.62, 1),
        new THREE.MeshBasicMaterial({
          color: bSpec.primaryAccentHex,
          wireframe: true,
          transparent: true,
          opacity: 0.78,
        })
      );
      monadShell.position.y = 0.45;
      bioOrganGroup.add(monadShell);
    } else if (bio.morphologyId === 'flatland-2d-ribbon-planarian') {
      // 2D Flatland Chromatic Planarian: Razor-thin planar ribbon body with glowing perimeter cilia
      for (let c = 0; c < 12; c++) {
        const angle = (c / 12) * Math.PI * 2;
        const cilium = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, 0.025, 0.02),
          bioAccentMat
        );
        cilium.position.set(
          Math.cos(angle) * 0.52,
          0.48 + Math.sin(angle) * 0.48,
          0
        );
        cilium.rotation.z = angle;
        bioOrganGroup.add(cilium);
      }
    } else if (bio.morphologyId === 'hadal-bathyal-cephalopod') {
      // Hadal Bathyal Cephalopod: Pressurized luciferin gill-mantle & dorsal bathyal siphon bells
      for (const side of [-1, 1]) {
        const gillFrond = new THREE.Mesh(
          createDifferentialGrowthRibbonGeometry(0.24, 0.58, 5, 1.2, 20, 12),
          bioAccentMat
        );
        gillFrond.position.set(side * 0.38, 0.48, 0.16);
        bioOrganGroup.add(gillFrond);
      }
    } else if (bio.morphologyId === 'brutalist-piezo-golem') {
      // Monolithic Piezo-Basalt Golem: Counter-balanced gravitational pendulum ribs & slab buttresses
      for (const side of [-1, 1]) {
        const slab = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 0.92, 0.34),
          bioAccentMat
        );
        slab.position.set(side * 0.44, 0.45, 0.08);
        bioOrganGroup.add(slab);
      }
    } else if (bio.morphologyId === 'mycelial-silicon-fungoid-network') {
      // Mycelial Silicon Fungoid: Bioluminescent spore-cap canopy & branching optical hyphae
      const sporeCanopy = new THREE.Mesh(
        createHyperbolicPseudosphereGeometry(0.58, 0.36, 22, 12, 1.5),
        bioAccentMat
      );
      sporeCanopy.position.set(0, 1.22, 0.05);
      bioOrganGroup.add(sporeCanopy);
    } else if (
      bio.morphologyId === 'tesseractic-4d-hyper-arachnid' ||
      bio.morphologyId === 'e8-8d-quasicrystal-polytope'
    ) {
      // 4D/8D Hyper-Dimensional Schlegel Projection Exoskeleton Cage surrounding the player
      const schlegelCage = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.78, 1),
        new THREE.MeshBasicMaterial({
          color: bSpec.primaryAccentHex,
          wireframe: true,
          transparent: true,
          opacity: 0.72,
        })
      );
      schlegelCage.position.y = 0.48;
      bioOrganGroup.add(schlegelCage);
    } else if (
      bio.morphologyId === 'kaluza-5d-electromagnetic-leviathan' ||
      bio.morphologyId === 'calabi-6d-folded-origami-symbiont'
    ) {
      // 5D/6D Compactified Helical Gauge-Flux Coils & Calabi-Yau Petal Wings
      const calabiMandala = new THREE.Mesh(
        createCalabiYauRosetteGeometry(0.54, 6),
        bioAccentMat
      );
      calabiMandala.position.set(0, 0.56, 0.28);
      bioOrganGroup.add(calabiMandala);
    } else if (
      bio.morphologyId === 'ads-cft-10d-holographic-interference' ||
      bio.morphologyId === 'm-theory-11d-omniscient-brane-seraph'
    ) {
      // 10D/11D/12D+ Holographic Interference Envelope & Triple Ophanim Throne Wheels
      for (let r = 0; r < 3; r++) {
        const throneWheel = new THREE.Mesh(
          new THREE.TorusGeometry(0.68 + r * 0.14, 0.018, 10, 36),
          bioAccentMat
        );
        throneWheel.position.set(0, 0.54, 0.18);
        throneWheel.rotation.set(r * 0.8, r * 1.1, r * 0.5);
        bioOrganGroup.add(throneWheel);
      }
    }

    torsoGroup.add(bioOrganGroup);
    torsoGroup.userData.dimensionalBiologyGroup = bioOrganGroup;
  }

  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  return {
    root,
    torsoGroup,
    headGroup,
    leftLeg,
    rightLeg,
    leftHandVoidRig,
    rightHandToolRig,
    packRotor,
  };
}

/**
 * Builds a 3D mesh for a PlacedWorldBuilding or Void Architect Building Preset.
 */
export function buildPlacedBuildingMesh(
  blocks: BuildingPresetBlock[]
): THREE.Group {
  const group = new THREE.Group();
  const unit = 1.6; // 1.6m per grid cell

  const accentHex = blocks.find((b) => b.emissive)?.color ?? '#38bdf8';

  const steelFrameMat =
    sharedGeometryPool.getOrCreateNoiseBlendedArchitecturalMaterial({
      key: `bld-steel-frame-${accentHex}`,
      baseColor: '#1e293b',
      veinColor: accentHex,
      wearTintColor: '#64748b',
      emissiveColor: '#090d16',
      emissiveIntensity: 0.1,
      metalness: 0.85,
      roughness: 0.22,
      clearcoat: 0.65,
      wearIntensity: 0.5,
      wearScale: 0.86,
      veinDensity: 1.7,
      veinEmissiveStrength: 0.82,
    });

  const mepVascularMat =
    sharedGeometryPool.getOrCreateNoiseBlendedArchitecturalMaterial({
      key: `bld-mep-vascular-${accentHex}`,
      baseColor: accentHex,
      veinColor: '#f8fafc',
      wearTintColor: '#e2e8f0',
      emissiveColor: accentHex,
      emissiveIntensity: 0.62,
      metalness: 0.45,
      roughness: 0.16,
      clearcoat: 0.9,
      wearIntensity: 0.36,
      wearScale: 1.15,
      veinDensity: 2.25,
      veinEmissiveStrength: 0.95,
    });

  // 1. Central Schoen TPMS Gyroid Vascular Spine Riser (Pooled Geometry)
  const mepCoreGeo = sharedGeometryPool.getOrCreateGeometry(
    'bld-central-gyroid-spine-riser',
    () => createTPMSGyroidShellGeometry(0.42, 4.8, 22, 16, 3.0, 0.32)
  );
  const mepCore = new THREE.Mesh(mepCoreGeo, mepVascularMat);
  mepCore.position.y = 2.4;
  group.add(mepCore);

  // 2. Relational Architectural Joinery Graph (Flying Buttresses, Space-Frame Chords & Under-Slung Cantilever Brackets)
  const relationalJoinery = buildRelationalArchitecturalJoinery(
    blocks,
    unit,
    steelFrameMat,
    mepVascularMat
  );
  group.add(relationalJoinery);

  // 3. Astra × Argon Parametric & Tectonic Architectural Sub-Assemblies
  for (const b of blocks) {
    const moduleGroup = buildMasterArchitecturalModuleMesh(b, unit);
    moduleGroup.position.set(
      b.gx * unit,
      b.gy * unit + unit * 0.5,
      b.gz * unit
    );
    group.add(moduleGroup);
  }

  return group;
}

export function buildWorldPropMesh(spec: ProceduralPropModelSpec): THREE.Group {
  const group = buildMonumentalWorldPropMesh(spec);
  const baseScale = Array.isArray(spec.scale)
    ? spec.scale[0]
    : Number(spec.scale) || 1.5;

  // Add Grounded Contact Shadow Decal beneath the prop for realistic ambient grounding
  const contactShadow = sharedGeometryPool.createGroundedContactShadowMesh(
    Math.max(1.8, baseScale * 1.15),
    0.52
  );
  group.add(contactShadow);

  // Add Multi-Part Beveled Extrude Plinth Collar & Lathe Resonance Finial from Shared Material & Geometry Pool
  const collarMat =
    sharedGeometryPool.getOrCreateNoiseBlendedArchitecturalMaterial({
      key: `prop-plinth-collar-${spec.primaryColor}-${spec.emissiveColor}`,
      baseColor: spec.primaryColor,
      veinColor: spec.emissiveColor,
      emissiveColor: spec.emissiveColor,
      emissiveIntensity: 0.22,
      metalness: 0.68,
      roughness: 0.38,
      clearcoat: 0.72,
      wearIntensity: 0.48,
      wearScale: 0.95,
      veinDensity: 1.85,
      veinEmissiveStrength: 0.88,
    });

  const beveledPlinth = new THREE.Mesh(
    sharedGeometryPool.getBeveledArmorPlateGeometry(
      baseScale * 0.48,
      baseScale * 0.48,
      0.18
    ),
    collarMat
  );
  beveledPlinth.rotation.x = -Math.PI / 2;
  beveledPlinth.position.y = 0.12;
  group.add(beveledPlinth);

  const latheSpindle = new THREE.Mesh(
    sharedGeometryPool.getLatheSpindleGeometry(
      baseScale * 0.22,
      baseScale * 0.95,
      14
    ),
    collarMat
  );
  latheSpindle.position.y = baseScale * 0.55;
  group.add(latheSpindle);

  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      if (
        obj.geometry.index &&
        obj.geometry.attributes.position &&
        obj.geometry.attributes.normal &&
        obj.geometry.attributes.uv &&
        !obj.geometry.attributes.tangent
      ) {
        try {
          obj.geometry.computeTangents();
        } catch {
          // Ignore non-indexed or degenerate UV subsets
        }
      }
    }
  });

  return group;
}

export function buildEntityBodyPartMesh(
  part: 'head' | 'torso' | 'pelvis' | 'upper-limb' | 'lower-limb',
  blueprint: EntityBlueprint
): THREE.Object3D {
  const group = new THREE.Group();
  const skinStyle = resolveEntitySkinTopology(blueprint);

  const primaryMat = createComplexSkinMaterial(
    skinStyle,
    blueprint.primaryColor,
    blueprint.jointGlowColor,
    { flatShading: blueprint.carvingStyle === 'faceted-poly' }
  );
  enhanceMaterialWithSurfaceWearAndVeins(
    primaryMat,
    blueprint.jointGlowColor,
    0.42
  );

  const secondaryMat = createComplexSkinMaterial(
    skinStyle,
    blueprint.secondaryColor,
    blueprint.jointGlowColor
  );
  enhanceMaterialWithSurfaceWearAndVeins(
    secondaryMat,
    blueprint.jointGlowColor,
    0.36
  );

  const glowMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(blueprint.jointGlowColor),
    emissive: new THREE.Color(blueprint.jointGlowColor),
    emissiveIntensity: 0.75,
    metalness: 0.3,
    roughness: 0.2,
  });

  const sootDirtMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1f1b18'),
    roughness: 0.94,
    metalness: 0.08,
  });

  if (part === 'head') {
    if (blueprint.headStyle === 'cyclops-prism') {
      // Pierced Biomorphic Cranium with recessed Barbara Hepworth ocular socket
      const helm = new THREE.Mesh(
        createSculptedCraniumGeometry(0.32, 'cyclops-pierced'),
        primaryMat
      );
      group.add(helm);

      const eye = new THREE.Mesh(
        createCalabiYauRosetteGeometry(0.12, 4),
        glowMat
      );
      eye.position.set(0, 0.02, 0.22);
      group.add(eye);
    } else if (blueprint.headStyle === 'binaural-horn') {
      // Sculpted Zygomatic Skull + Twin Hyperbolic Pseudosphere Acoustic Horns (No BoxGeometry!)
      const skull = new THREE.Mesh(
        createSculptedCraniumGeometry(0.3, 'zygomatic-crest'),
        primaryMat
      );
      group.add(skull);

      const hornGeo = createHyperbolicPseudosphereGeometry(0.08, 0.42, 12, 8, 1.5);
      const leftHorn = new THREE.Mesh(hornGeo, secondaryMat);
      leftHorn.position.set(-0.22, 0.24, -0.04);
      leftHorn.rotation.z = 0.38;
      group.add(leftHorn);

      const rightHorn = new THREE.Mesh(hornGeo, secondaryMat);
      rightHorn.position.set(0.22, 0.24, -0.04);
      rightHorn.rotation.z = -0.38;
      group.add(rightHorn);
    } else if (blueprint.headStyle === 'gyro-core') {
      // Schoen TPMS Gyroidal Cranial Shell enclosing a Calabi-Yau sensory core
      const gyroidSkull = new THREE.Mesh(
        createTPMSGyroidShellGeometry(0.26, 0.36, 18, 12, 3.2, 0.35),
        secondaryMat
      );
      group.add(gyroidSkull);
      const core = new THREE.Mesh(
        createCalabiYauRosetteGeometry(0.16, 5),
        glowMat
      );
      group.add(core);
    } else if (blueprint.headStyle === 'crowned-octa') {
      const base = new THREE.Mesh(
        createSculptedCraniumGeometry(0.28, 'mitre-crest'),
        primaryMat
      );
      group.add(base);
      const crown = new THREE.Mesh(
        createDifferentialGrowthRibbonGeometry(0.24, 0.14, 5, 1.1, 16, 8),
        glowMat
      );
      crown.position.y = 0.22;
      group.add(crown);
    } else if (blueprint.headStyle === 'rose-window-oculus') {
      const chalice = new THREE.Mesh(
        createHyperbolicPseudosphereGeometry(0.28, 0.38, 16, 10, 1.3),
        secondaryMat
      );
      group.add(chalice);
      const stainedGlassCore = new THREE.Mesh(
        createCalabiYauRosetteGeometry(0.18, 6),
        glowMat
      );
      stainedGlassCore.position.set(0, 0.06, 0.16);
      group.add(stainedGlassCore);
    } else if (blueprint.headStyle === 'antler-crown') {
      const skull = new THREE.Mesh(
        createSculptedCraniumGeometry(0.27, 'zygomatic-crest'),
        primaryMat
      );
      group.add(skull);
      for (const side of [-1, 1]) {
        const antlerGroup = new THREE.Group();
        antlerGroup.position.set(side * 0.16, 0.18, 0);
        antlerGroup.rotation.z = -side * 0.42;
        const mainBranch = new THREE.Mesh(
          createCalligraphicMuscleSegmentGeometry(0.018, 0.038, 0.48, 0.22, 1.6),
          secondaryMat
        );
        mainBranch.position.y = 0.24;
        antlerGroup.add(mainBranch);
        for (let tine = 0; tine < 2; tine++) {
          const tineMesh = new THREE.Mesh(
            createHyperbolicPseudosphereGeometry(0.024, 0.22, 8, 6, 1.4),
            glowMat
          );
          tineMesh.position.set(side * 0.08, 0.18 + tine * 0.16, 0.05);
          tineMesh.rotation.z = -side * 0.55;
          antlerGroup.add(tineMesh);
        }
        group.add(antlerGroup);
      }
    } else if (blueprint.headStyle === 'seraph-halo-mask') {
      const maskCore = new THREE.Mesh(
        createBoccioniSpatialContinuityGeometry(0.26),
        primaryMat
      );
      group.add(maskCore);
      const rosette = new THREE.Mesh(
        createCalabiYauRosetteGeometry(0.22, 5),
        glowMat
      );
      rosette.position.z = 0.12;
      group.add(rosette);
    } else {
      const cranium = new THREE.Mesh(
        createSculptedCraniumGeometry(0.29, 'mandibular-arch'),
        primaryMat
      );
      group.add(cranium);
      for (const side of [-1, 1]) {
        const mandible = new THREE.Mesh(
          createHyperbolicPseudosphereGeometry(0.06, 0.26, 10, 6, side * 1.4),
          glowMat
        );
        mandible.rotation.x = Math.PI * 0.45;
        mandible.position.set(side * 0.13, -0.1, 0.2);
        group.add(mandible);
      }
    }

    // Articulated Olfactory / Sensory Head Filaments that orient toward Scent Breezes
    const sensoryDigits: THREE.Group[] = [];
    for (const side of [-1, 1]) {
      const feelerPivot = new THREE.Group();
      feelerPivot.position.set(side * 0.16, 0.14, 0.18);
      feelerPivot.rotation.y = side * 0.3;

      const seg1 = new THREE.Mesh(
        createCalligraphicMuscleSegmentGeometry(0.012, 0.022, 0.24, 0.25, 1.4),
        secondaryMat
      );
      seg1.position.y = 0.12;
      seg1.rotation.x = 0.35;
      feelerPivot.add(seg1);

      group.add(feelerPivot);
      sensoryDigits.push(feelerPivot);
    }
    group.userData.sensoryDigits = sensoryDigits;
  } else if (part === 'torso') {
    const [sx, sy, sz] = blueprint.torsoScale;
    if (
      blueprint.carvingStyle === 'faceted-poly' ||
      blueprint.carvingStyle === 'nacre-filigree'
    ) {
      // Spore (2008) / Barbara Hepworth Smooth-Minimum (smin) Pierced Biomorphic Torso
      const piercedTorso = new THREE.Mesh(
        createImplicitMetaballPiercedGeometry(
          0.42 * sx,
          1.35 * sy,
          blueprint.seed,
          0.78
        ),
        primaryMat
      );
      piercedTorso.scale.z = sz * 0.92;
      group.add(piercedTorso);

      // Naum Gabo Constructivist Ruled-Surface Strings inside the pierced chest cavity
      const gaboStrings = buildNaumGaboStringedConstructGroup(
        0.16 * sx,
        0.22 * sy,
        10,
        1.7,
        glowMat,
        blueprint.jointGlowColor
      );
      gaboStrings.rotation.x = Math.PI / 2;
      gaboStrings.position.set(0, 0.08 * sy, 0);
      group.add(gaboStrings);
    } else if (
      blueprint.carvingStyle === 'hyper-ringed' ||
      blueprint.carvingStyle === 'cathedral-ribbed'
    ) {
      // Alan Schoen TPMS Gyroid & Beksiński Bone-Cathedral Ribbed Torso
      const gyroidSpine = new THREE.Mesh(
        createTPMSGyroidShellGeometry(
          0.34 * sx,
          0.84 * sy,
          20,
          14,
          3.4,
          0.36
        ),
        primaryMat
      );
      group.add(gyroidSpine);

      const gaboRibWeb = buildNaumGaboStringedConstructGroup(
        0.38 * sx,
        0.74 * sy,
        14,
        2.1,
        glowMat,
        blueprint.jointGlowColor
      );
      group.add(gaboRibWeb);
    } else if (
      blueprint.carvingStyle === 'monolith-plate' ||
      blueprint.carvingStyle === 'obsidian-reliquary'
    ) {
      // Umberto Boccioni "Unique Forms of Continuity in Space" Velocity-Wake Torso
      const boccioniTorso = new THREE.Mesh(
        createBoccioniSpatialContinuityGeometry(0.46 * sx),
        primaryMat
      );
      boccioniTorso.scale.set(1.0, sy * 0.9, sz * 0.95);
      group.add(boccioniTorso);

      const coreStrip = new THREE.Mesh(
        createHyperbolicPseudosphereGeometry(0.18 * sx, 0.72 * sy, 14, 10, 1.6),
        glowMat
      );
      group.add(coreStrip);
    } else {
      // Differential-Growth Coral Pleura & Metaball Torso
      const diffHull = new THREE.Mesh(
        createDifferentialGrowthRibbonGeometry(
          0.36 * sx,
          0.82 * sy,
          5,
          1.4,
          20,
          14
        ),
        primaryMat
      );
      group.add(diffHull);
      const heart = new THREE.Mesh(
        createCalabiYauRosetteGeometry(0.18 * sx, 5),
        glowMat
      );
      heart.position.set(0, 0.05, 0.22 * sz);
      group.add(heart);
    }

    // Attach Internal Sheathed Sub-Dermal Continuum Lattice to Entity Torso (Zero external torus/cone clutter!)
    const entityTorsoOverlay = buildDermalTopologyOverlayGroup(
      skinStyle,
      blueprint.primaryColor,
      blueprint.secondaryColor,
      blueprint.jointGlowColor,
      0.38 * sx
    );
    group.add(entityTorsoOverlay);

    // Internal Visceral Organ & Rib-Cavity Gore Rig (Exposed & animated during laceration, hydrostatic rupture, or marrow shatter!)
    const internalVisceraGroup = new THREE.Group();
    internalVisceraGroup.name = 'internal-viscera-gore-rig';
    internalVisceraGroup.position.set(0, 0.04 * sy, 0.14 * sz);

    const visceraBloodMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#9f1239'),
      emissive: new THREE.Color('#e11d48'),
      emissiveIntensity: 0.72,
      roughness: 0.12,
      metalness: 0.15,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.92,
    });

    const calcifiedRibMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#fef3c7'),
      emissive: new THREE.Color(blueprint.jointGlowColor),
      emissiveIntensity: 0.3,
      roughness: 0.32,
      metalness: 0.25,
    });

    // Pulsating Dual-Chambered Visceral Heart & Peristaltic Gut Sac
    const visceralHeartMesh = new THREE.Mesh(
      createImplicitMetaballPiercedGeometry(
        0.18 * sx,
        0.95 * sy,
        blueprint.seed + 77,
        0.55
      ),
      visceraBloodMat
    );
    internalVisceraGroup.add(visceralHeartMesh);

    const herniatedGutRibbon = new THREE.Mesh(
      createDifferentialGrowthRibbonGeometry(
        0.16 * sx,
        0.34 * sy,
        5,
        1.8,
        14,
        10
      ),
      visceraBloodMat
    );
    herniatedGutRibbon.position.set(0, -0.1 * sy, 0.08 * sz);
    internalVisceraGroup.add(herniatedGutRibbon);

    // 4 Articulated Calcified Trabecular Ribs that splay open when visceral trauma / gore occurs
    const ribFlaps: THREE.Mesh[] = [];
    for (let r = 0; r < 4; r++) {
      const side = r % 2 === 0 ? -1 : 1;
      const row = Math.floor(r / 2);
      const rib = new THREE.Mesh(
        createHyperbolicPseudosphereGeometry(
          0.038 * sx,
          0.26 * sx,
          8,
          6,
          side * 1.4
        ),
        calcifiedRibMat
      );
      rib.position.set(
        side * 0.14 * sx,
        (row - 0.5) * 0.14 * sy,
        0.08 * sz
      );
      rib.rotation.z = side * 0.75;
      rib.rotation.x = 0.45;
      internalVisceraGroup.add(rib);
      ribFlaps.push(rib);
    }

    internalVisceraGroup.scale.setScalar(0.35); // Recessed inside chest until wounded
    group.add(internalVisceraGroup);
    group.userData.internalVisceraGroup = internalVisceraGroup;
    group.userData.visceralHeartMesh = visceralHeartMesh;
    group.userData.herniatedGutRibbon = herniatedGutRibbon;
    group.userData.ribFlaps = ribFlaps;
    group.userData.visceraBloodMat = visceraBloodMat;

    // Deep Lexicon 3D Dorsal Apparatus mounted on the spine/shoulders
    const dorsalGroup = new THREE.Group();
    dorsalGroup.position.set(0, 0.12 * sy, -0.22 * sz);
    const dorsalType = blueprint.dorsalApparatus ?? 'solar-sail-fins';

    if (dorsalType === 'solar-sail-fins') {
      // U-Ram Choe & Calatrava Articulated Feather-Linkage Wings + Differential-Growth Pleura Sails
      for (const side of [-1, 1]) {
        const wingPivot = new THREE.Group();
        wingPivot.position.set(side * 0.22 * sx, 0.14 * sy, 0);
        wingPivot.rotation.y = -side * 0.35;
        wingPivot.rotation.z = -side * 0.25;
        for (let b = 0; b < 4; b++) {
          const blade = new THREE.Mesh(
            createHyperbolicPseudosphereGeometry(
              0.085,
              0.64 - b * 0.11,
              12,
              8,
              side * 1.4
            ),
            b === 0 ? glowMat : primaryMat
          );
          blade.position.set(
            side * (0.12 + b * 0.13),
            0.2 - b * 0.05,
            -b * 0.04
          );
          blade.rotation.z = -side * (0.35 + b * 0.2);
          wingPivot.add(blade);
        }
        dorsalGroup.add(wingPivot);
      }
    } else if (dorsalType === 'cathedral-organ-pipes') {
      // Beltrami Hyperbolic Pseudosphere Acoustic Organ Bells + Schoen Gyroid Resonance Chamber
      for (let p = -2; p <= 2; p++) {
        const pipeH = 0.72 - Math.abs(p) * 0.11;
        const pipe = new THREE.Mesh(
          createHyperbolicPseudosphereGeometry(0.065, pipeH, 12, 8, 1.2),
          p === 0 ? glowMat : secondaryMat
        );
        pipe.position.set(p * 0.1, pipeH * 0.45, -Math.abs(p) * 0.03);
        dorsalGroup.add(pipe);
      }
    } else if (dorsalType === 'gyro-astrolabe-wheel') {
      // Theo Jansen / U-Ram Choe Dorsal Clockwork Linkage + Calabi-Yau Astrolabe Core
      const jansenRig = buildTheoJansenKineticLinkageGroup(
        0.34 * sx,
        secondaryMat,
        primaryMat,
        glowMat
      );
      jansenRig.position.set(0, 0.22 * sy, -0.08);
      dorsalGroup.add(jansenRig);

      const calabiWheel = new THREE.Mesh(
        createCalabiYauRosetteGeometry(0.28 * sx, 5),
        glowMat
      );
      calabiWheel.position.set(0, 0.22 * sy, -0.12);
      dorsalGroup.add(calabiWheel);
    } else if (dorsalType === 'mycelial-spore-canopy') {
      // Differential-Growth Coral Ruffled Canopy + Schoen Gyroid Gill Chamber
      const cap = new THREE.Mesh(
        createDifferentialGrowthRibbonGeometry(
          0.46 * sx,
          0.32,
          6,
          1.2,
          20,
          10
        ),
        primaryMat
      );
      cap.position.set(0, 0.42 * sy, 0);
      dorsalGroup.add(cap);
    } else {
      // 'floating-halo-shards' or 'weeping-filament-veil': Schoen Gyroid Crown + Hyperbolic Spines
      const gyroidCrown = new THREE.Mesh(
        createTPMSGyroidShellGeometry(0.22 * sx, 0.28 * sy, 16, 10, 3.2, 0.35),
        glowMat
      );
      gyroidCrown.position.set(0, 0.26 * sy, -0.06);
      dorsalGroup.add(gyroidCrown);

      for (let s = 0; s < 5; s++) {
        const angle = (s / 5) * Math.PI - Math.PI * 0.5;
        const shard = new THREE.Mesh(
          createHyperbolicPseudosphereGeometry(0.075, 0.38, 10, 6, 1.5),
          s % 2 === 0 ? glowMat : primaryMat
        );
        shard.position.set(
          Math.sin(angle) * 0.48 * sx,
          0.25 + Math.cos(angle) * 0.28 * sy,
          -0.06
        );
        shard.rotation.z = -angle * 0.6;
        dorsalGroup.add(shard);
      }
    }
    group.add(dorsalGroup);
    group.userData.dorsalApparatusGroup = dorsalGroup;

    // Articulated Upper Manipulator Arms with Sculpted Calligraphic Muscle Bellies & 4-Digit Claws
    const forelimbArms: {
      shoulder: THREE.Group;
      elbow: THREE.Group;
      digits: THREE.Group[];
      side: number;
    }[] = [];

    for (const side of [-1, 1]) {
      const shoulder = new THREE.Group();
      shoulder.position.set(side * (0.34 * sx), 0.18 * sy, 0.06 * sz);
      shoulder.rotation.z = side * 0.28;

      const humerus = new THREE.Mesh(
        createCalligraphicMuscleSegmentGeometry(0.058, 0.044, 0.34, 0.34, 1.4),
        primaryMat
      );
      humerus.position.y = -0.17;
      shoulder.add(humerus);

      const elbow = new THREE.Group();
      elbow.position.set(0, -0.34, 0);
      elbow.rotation.x = -0.55;

      const ulna = new THREE.Mesh(
        createCalligraphicMuscleSegmentGeometry(0.048, 0.034, 0.32, 0.28, 1.4),
        secondaryMat
      );
      ulna.position.y = -0.16;
      elbow.add(ulna);

      // 4 Articulated 2-Phalanx Manipulator Digits / Claws at the Wrist
      const wristGroup = new THREE.Group();
      wristGroup.position.set(0, -0.32, 0);
      elbow.add(wristGroup);

      const digits: THREE.Group[] = [];
      for (let d = 0; d < 4; d++) {
        const dAngle = ((d - 1.5) / 1.5) * 0.65;
        const digitKnuckle = new THREE.Group();
        digitKnuckle.position.set(Math.sin(dAngle) * 0.045, 0, Math.cos(dAngle) * 0.03);
        digitKnuckle.rotation.z = dAngle * 0.45;

        const proxSeg = new THREE.Mesh(
          createCalligraphicMuscleSegmentGeometry(0.012, 0.009, 0.11, 0.22, 1.3),
          primaryMat
        );
        proxSeg.position.y = -0.055;
        digitKnuckle.add(proxSeg);

        const distTip = new THREE.Group();
        distTip.position.y = -0.11;
        distTip.rotation.x = -0.45;

        const clawSeg = new THREE.Mesh(
          createHyperbolicPseudosphereGeometry(0.012, 0.095, 6, 5, 1.2),
          glowMat
        );
        clawSeg.rotation.x = Math.PI;
        clawSeg.position.y = -0.048;
        distTip.add(clawSeg);

        digitKnuckle.add(distTip);
        digitKnuckle.userData.distTip = distTip;
        digitKnuckle.userData.baseSpread = dAngle * 0.45;
        wristGroup.add(digitKnuckle);
        digits.push(digitKnuckle);
      }

      shoulder.add(elbow);
      group.add(shoulder);
      forelimbArms.push({ shoulder, elbow, digits, side });
    }
    group.userData.forelimbArms = forelimbArms;
  } else if (part === 'pelvis') {
    // Sculpted Ilium / Pelvic Girdle Bowl (replaces raw CylinderGeometry + TorusGeometry)
    const pelvisGeo = createImplicitMetaballPiercedGeometry(0.28, 0.72, blueprint.seed + 31, 0.45);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, secondaryMat);
    group.add(pelvisMesh);

    // Articulated Caudal / Tail Apparatus mounted on the rear Pelvis
    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, -0.04, -0.22);
    const tailType = blueprint.tailApparatus ?? 'segmented-censer';

    if (tailType === 'twin-ribbon-flukes') {
      for (const side of [-1, 1]) {
        const fluke = new THREE.Mesh(
          createHyperbolicPseudosphereGeometry(0.13, 0.62, 10, 8, side * 1.4),
          side === -1 ? primaryMat : glowMat
        );
        fluke.rotation.x = -Math.PI * 0.38;
        fluke.rotation.z = side * 0.42;
        fluke.position.set(side * 0.16, -0.12, -0.26);
        tailPivot.add(fluke);
      }
    } else if (tailType === 'pendulum-metronome') {
      const rod = new THREE.Mesh(
        createCalligraphicMuscleSegmentGeometry(0.024, 0.018, 0.48, 0.2, 1.3),
        secondaryMat
      );
      rod.position.set(0, -0.22, -0.12);
      rod.rotation.x = 0.35;
      tailPivot.add(rod);
      const bob = new THREE.Mesh(
        createCalabiYauRosetteGeometry(0.13, 5),
        glowMat
      );
      bob.position.set(0, -0.44, -0.22);
      tailPivot.add(bob);
    } else {
      for (let s = 0; s < 3; s++) {
        const seg = new THREE.Mesh(
          createCalligraphicMuscleSegmentGeometry(
            0.068 - s * 0.014,
            0.052 - s * 0.012,
            0.22,
            0.3,
            1.4
          ),
          s === 2 ? glowMat : primaryMat
        );
        seg.rotation.x = 1.25;
        seg.position.set(0, s * 0.07, -0.14 - s * 0.16);
        tailPivot.add(seg);
      }
    }
    group.add(tailPivot);
    group.userData.tailApparatusGroup = tailPivot;
  } else if (part === 'upper-limb' || part === 'lower-limb') {
    const isUpper = part === 'upper-limb';
    const rTop = isUpper ? 0.125 : 0.098;
    const rBot = isUpper ? 0.092 : 0.064;
    // Smooth Continuous Fusiform Muscle-Fascia & Articular Joint Capsule Envelope
    const segGeo = createCalligraphicMuscleSegmentGeometry(
      rTop,
      rBot,
      1.0,
      isUpper ? 0.44 : 0.36,
      1.15
    );
    const segMesh = new THREE.Mesh(
      segGeo,
      isUpper ? primaryMat : secondaryMat
    );
    group.add(segMesh);

    // Smooth Articular Synovial Joint Capsule Bulb at the proximal joint origin to eliminate geometric seams
    const jointCapsule = new THREE.Mesh(
      createImplicitMetaballPiercedGeometry(
        rTop * 1.08,
        0.85,
        blueprint.seed + (isUpper ? 13 : 29),
        0.25
      ),
      secondaryMat
    );
    jointCapsule.position.y = -0.46;
    group.add(jointCapsule);

    if (isUpper) {
      const limbOverlay = buildDermalTopologyOverlayGroup(
        skinStyle,
        blueprint.primaryColor,
        blueprint.secondaryColor,
        blueprint.jointGlowColor,
        rTop * 1.05
      );
      group.add(limbOverlay);
    }

    // Multi-part Beveled Extrude Carapace Guard & Lathe Spindle Joint Collar from Shared Pool
    const limbGuardPlate = new THREE.Mesh(
      sharedGeometryPool.getBeveledArmorPlateGeometry(
        rTop * 1.15,
        0.38,
        0.032
      ),
      secondaryMat
    );
    limbGuardPlate.position.set(0, 0.05, rTop * 0.88);
    group.add(limbGuardPlate);

    const latheJointCollar = new THREE.Mesh(
      sharedGeometryPool.getLatheSpindleGeometry(rTop * 0.92, 0.22, 12),
      primaryMat
    );
    latheJointCollar.position.y = -0.38;
    group.add(latheJointCollar);

    // Add 3 Articulated Pedal Digits / Talons to every lower-limb extremity
    if (!isUpper) {
      const pedalDigits: THREE.Group[] = [];
      for (let t = -1; t <= 1; t++) {
        const talonPivot = new THREE.Group();
        talonPivot.position.set(t * 0.045, 0.48, 0.04);
        talonPivot.rotation.z = t * 0.32;

        const talonMesh = new THREE.Mesh(
          createHyperbolicPseudosphereGeometry(0.024, 0.16, 8, 6, 1.3),
          glowMat
        );
        talonMesh.rotation.x = Math.PI * 0.4;
        talonMesh.position.z = 0.07;
        talonPivot.add(talonMesh);

        group.add(talonPivot);
        pedalDigits.push(talonPivot);
      }
      group.userData.pedalDigits = pedalDigits;
    }
  }

  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
      if (
        obj.geometry.index &&
        obj.geometry.attributes.position &&
        obj.geometry.attributes.normal &&
        obj.geometry.attributes.uv &&
        !obj.geometry.attributes.tangent
      ) {
        try {
          obj.geometry.computeTangents();
        } catch {
          // Ignore non-indexed or degenerate UV subsets
        }
      }
    }
  });

  return group;
}
