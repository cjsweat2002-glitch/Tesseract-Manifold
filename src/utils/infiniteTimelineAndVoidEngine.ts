import * as THREE from 'three';
import {
  AbsurdBiologyArchetype,
  AbsurdCivilizationRelic,
  AbsurdGlitchModality,
  AbsurdPhysicsTwist,
  AbsurdSkyPhenomenon,
  AbsurdTimelineSpec,
  ALL_PORTAL_GATE_SHAPE_IDS,
  PORTAL_GATE_SHAPE_CATALOG,
  PortalGateShapeId,
  TimelineAtmospherePreset,
  TimelineCreatureAIArchetype,
  TimelineLandformArchetype,
  VOID_ANOMALY_RESOURCE_CATALOG,
  VoidAnomalyResourceId,
  VoidBallActiveBeamMode,
  VoidBallEvolutionState,
  DifferentialUniverseBoundaryId,
} from '../types/portalAndBiodepth';
import { ManifoldWorldSpec } from '../types/manifold';
import { createRealityTearShaderMaterial } from './realityTearAndPortalRoomEngine';
import { ArticulatedRagdollEntity } from './ragdollPhysics';
import {
  CompositeWeaponSubType,
  DimensionalItemDefinition,
} from './bethesdaScaleCompendiumEngine';
import { buildCompositeItem3DMesh } from './compositeModelAndGroundingEngine';

export const IN_BETWEEN_VOID_ORIGIN = new THREE.Vector3(0, 1200, 0);
export const IN_BETWEEN_VOID_RADIUS = 24.0;

/**
 * Recursive, zero-leak GPU resource disposal helper.
 * Ensures switching across thousands of infinite timelines never accumulates orphaned geometries or materials.
 */
export function disposeObject3DResources(root: THREE.Object3D | null): void {
  if (!root) return;
  root.traverse((obj) => {
    if (
      obj instanceof THREE.Mesh ||
      obj instanceof THREE.InstancedMesh ||
      obj instanceof THREE.LineSegments ||
      obj instanceof THREE.Points
    ) {
      if (obj.geometry && !obj.userData.sharedPooledGeometry) {
        obj.geometry.dispose();
      }
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => {
          if (!m.userData?.sharedPooledMaterial) m.dispose();
        });
      } else if (
        obj.material &&
        !obj.material.userData?.sharedPooledMaterial
      ) {
        obj.material.dispose();
      }
    }
  });
}

/**
 * Fast deterministic FNV-1a 32-bit string hash for alphanumeric timeline coordinates (e.g. 'C-137', 'COB-994')
 */
export function hashTimelineCoordinate(coord: string): number {
  const clean = (coord || 'C-137').trim().toUpperCase();
  let h = 0x811c9dc5;
  for (let i = 0; i < clean.length; i++) {
    h ^= clean.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return Math.abs(h >>> 0) || 137408;
}

function seededFloat(seed: number, salt: number): number {
  let t = (seed + Math.imul(salt, 0x9e3779b9)) >>> 0;
  t = Math.imul(t ^ (t >>> 16), 0x85ebca6b);
  t = Math.imul(t ^ (t >>> 13), 0xc2b2ae35);
  return ((t ^ (t >>> 16)) >>> 0) / 4294967296;
}

const BIOLOGY_ARCHETYPES: {
  id: AbsurdBiologyArchetype;
  label: string;
  loreFragment: string;
}[] = [
  {
    id: 'everything-on-a-cob',
    label: 'Everything-On-A-Cob Molecular Lattice',
    loreFragment:
      'Every mountain, organism, and subatomic nucleus is structured on a cylindrical cob lattice—evacuate before your DNA kernelizes.',
  },
  {
    id: 'cronenberg-flesh-mutants',
    label: 'Cronenberg Visceral Flesh-Ecology',
    loreFragment:
      'A botched genetic love-potion cascade mutated the entire biosphere into writhing, multi-ocular cartilaginous chimeras.',
  },
  {
    id: 'recursive-fractal-crustaceans',
    label: 'Recursive Mandelbrot Carcinization',
    loreFragment:
      'Evolution converged on infinite self-similar fractal crab-spires whose claws sprout smaller sentient claws.',
  },
  {
    id: 'sentient-furniture-bipeds',
    label: 'Inverted Bipedal Upholstery & Pizza Fauna',
    loreFragment:
      'Ergonomic lounge chairs walk on elongated vertebrate legs and order slices of weeping cellular telephone.',
  },
  {
    id: 'screaming-photonic-flora',
    label: 'Acoustic Screaming Neon Flora',
    loreFragment:
      'Photosynthesis operates via continuous harmonic screaming; crystalline sunflowers emit pressurized synth-wave shockwaves.',
  },
  {
    id: 'hyper-elastic-gelatinous-amoebas',
    label: 'Non-Newtonian Flubber-Protoplasm Fauna',
    loreFragment:
      'Anatomical skeletons were outlawed in favor of hyper-elastic gelatinous membranes that bounce across hills.',
  },
];

const PHYSICS_TWISTS: {
  id: AbsurdPhysicsTwist;
  label: string;
  propScale: number;
  entityScale: number;
  gravityMult: number;
  bounce: number;
  speedMult: number;
  timeDilation: number;
}[] = [
  {
    id: 'reverse-buoyancy-updrafts',
    label: 'Feather-Gravity & Reverse Atmospheric Buoyancy (0.38G)',
    propScale: 1.25,
    entityScale: 1.15,
    gravityMult: 0.38,
    bounce: 0.35,
    speedMult: 1.22,
    timeDilation: 0.92,
  },
  {
    id: 'micro-verse-colossal-scale',
    label: 'Micro-Verse Battery Scale (2.8× Colossal Monoliths)',
    propScale: 2.65,
    entityScale: 1.75,
    gravityMult: 0.72,
    bounce: 0.2,
    speedMult: 1.32,
    timeDilation: 1.18,
  },
  {
    id: 'titan-verse-miniature-diorama',
    label: 'Titan-Verse Giant Walker Scale (0.48× Diorama Props)',
    propScale: 0.48,
    entityScale: 0.62,
    gravityMult: 0.55,
    bounce: 0.25,
    speedMult: 1.45,
    timeDilation: 0.85,
  },
  {
    id: 'hyper-elastic-rubber-ground',
    label: 'Hyper-Elastic Trampoline Strata (82% Kinetic Bounce)',
    propScale: 1.1,
    entityScale: 1.05,
    gravityMult: 0.68,
    bounce: 0.82,
    speedMult: 1.28,
    timeDilation: 1.05,
  },
  {
    id: 'non-euclidean-coriolis-twist',
    label: 'Escher Coriolis Shear & Hyper-Dense Gravity (1.45G)',
    propScale: 1.45,
    entityScale: 1.25,
    gravityMult: 1.45,
    bounce: 0.15,
    speedMult: 1.12,
    timeDilation: 0.78,
  },
  {
    id: 'chrono-stutter-hyper-speed',
    label: 'Tachyon Overclocked Proper-Time (1.65× Speed & Time)',
    propScale: 1.18,
    entityScale: 0.95,
    gravityMult: 0.82,
    bounce: 0.45,
    speedMult: 1.55,
    timeDilation: 1.65,
  },
];

const SKY_PHENOMENA: {
  id: AbsurdSkyPhenomenon;
  label: string;
}[] = [
  {
    id: 'screaming-cyber-sun',
    label: '42-Hour Screaming Binary Cyber-Sun',
  },
  {
    id: 'omniscient-eyeball-nebula',
    label: 'Omniscient Watching Ocular Nebula',
  },
  {
    id: 'boiling-portal-fluid-vortex',
    label: 'Boiling Acid-Green Portal-Fluid Maelstrom',
  },
  {
    id: 'clockwork-citadel-gear-rings',
    label: 'Gear-World Intermeshed Planetary Escapements',
  },
  {
    id: 'fractured-tesseract-mirrors',
    label: 'Shattered 4D Tesseract Mirror Zenith',
  },
  {
    id: 'giant-floating-heads-sky',
    label: 'Colossal Celestial Cromulon Judging Heads',
  },
];

const CIVILIZATION_RELICS: {
  id: AbsurdCivilizationRelic;
  label: string;
}[] = [
  {
    id: 'plumbus-synthesis-mega-vats',
    label: 'Automated Plumbus & Fleeb-Juice Synthesis Vats',
  },
  {
    id: 'citadel-bureaucracy-obelisks',
    label: 'Citadel Trans-Dimensional Customs & Tax Obelisks',
  },
  {
    id: 'meeseeks-fulfillment-pylons',
    label: 'Existential Task-Fulfillment Induction Boxes',
  },
  {
    id: 'gazorpazorp-matriarch-totems',
    label: 'Gazorpian Sonic-Kinetic Matriarch Totems',
  },
  {
    id: 'blips-and-chitz-arcade-spires',
    label: 'Roy: A Life Well Lived Neural Arcade Spires',
  },
  {
    id: 'cronenberg-bio-alembics',
    label: 'Genetic Mutagenic Distillation Alembics',
  },
];

const GLITCH_MODALITIES: {
  id: AbsurdGlitchModality;
  label: string;
}[] = [
  {
    id: 'vhs-chromatic-tracking',
    label: 'Interdimensional Cable VHS Chromatic Drift',
  },
  {
    id: 'portal-fluid-acid-rain',
    label: 'Luminescent Green Portal-Ion Effervescence',
  },
  {
    id: 'quantum-scale-oscillation',
    label: 'Planck-Scale Breathing Harmonic Oscillation',
  },
  {
    id: 'schrodinger-ghost-echoes',
    label: 'Schrödinger Phase-Split Probability Echoes',
  },
];

const LANDFORM_ARCHETYPES: {
  id: TimelineLandformArchetype;
  label: string;
}[] = [
  {
    id: 'sky-atoll-archipelago',
    label: 'Stepped Sky-Atoll Archipelago & Causeway Bridges',
  },
  {
    id: 'spiral-nautilus-terraces',
    label: 'Fibonacci Logarithmic Spiral Ziggurat Terraces',
  },
  {
    id: 'twisted-mobius-canyons',
    label: 'Twisted Möbius River-Gorges & Hoodoo Arches',
  },
  {
    id: 'hex-basalt-organ-pipes',
    label: 'Hexagonal Columnar Basalt Organ-Pipe Citadel',
  },
  {
    id: 'inverted-crater-caldera',
    label: 'Concentric Ring-Mountain Caldera & Central Spire',
  },
  {
    id: 'colossal-ribcage-badlands',
    label: 'Fossilized Titan Ribcage Arches & Marrow Ravines',
  },
  {
    id: 'voronoi-shattered-mesas',
    label: 'Voronoi-Shattered Tectonic Mesas & Fissure Chasms',
  },
  {
    id: 'crystalline-harmonic-dunes',
    label: 'Harmonic Interference Dunes & Quartz Monoliths',
  },
];

const ATMOSPHERE_PRESETS: {
  id: TimelineAtmospherePreset;
  label: string;
  zenith: string;
  horizon: string;
  sun: string;
  fog: string;
  terrainLow: string;
  terrainMid: string;
  terrainHigh: string;
  primary: string;
  secondary: string;
  accent: string;
}[] = [
  {
    id: 'daylight-azure-scatter',
    label: 'Golden-Azure Planetary Daylight & Sunlit Cirrus',
    zenith: '#0284c7',
    horizon: '#7dd3fc',
    sun: '#fef08a',
    fog: '#38bdf8',
    terrainLow: '#0f766e',
    terrainMid: '#d97706',
    terrainHigh: '#fef3c7',
    primary: '#38bdf8',
    secondary: '#facc15',
    accent: '#2dd4bf',
  },
  {
    id: 'sunset-amber-crimson',
    label: 'Binary Tangerine-Crimson Sunset & Violet Zenith',
    zenith: '#4c1d95',
    horizon: '#fb923c',
    sun: '#fde047',
    fog: '#f97316',
    terrainLow: '#451a03',
    terrainMid: '#ea580c',
    terrainHigh: '#fde68a',
    primary: '#fb923c',
    secondary: '#f43f5e',
    accent: '#facc15',
  },
  {
    id: 'bioluminescent-emerald-dusk',
    label: 'Luminous Emerald-Mint Spore Nebula & Ion Sky',
    zenith: '#065f46',
    horizon: '#6ee7b7',
    sun: '#d9f99d',
    fog: '#10b981',
    terrainLow: '#064e3b',
    terrainMid: '#10b981',
    terrainHigh: '#bef264',
    primary: '#22c55e',
    secondary: '#a3e635',
    accent: '#4ade80',
  },
  {
    id: 'gas-giant-ringed-teal',
    label: 'High-Albedo Ringed Gas-Giant Cerulean-Gold Sky',
    zenith: '#0e7490',
    horizon: '#fde68a',
    sun: '#38bdf8',
    fog: '#2dd4bf',
    terrainLow: '#164e63',
    terrainMid: '#0d9488',
    terrainHigh: '#fef08a',
    primary: '#14b8a6',
    secondary: '#eab308',
    accent: '#22d3ee',
  },
  {
    id: 'binary-violet-magenta',
    label: 'Synth-Wave Coral-Magenta Horizon & Twin Rose Suns',
    zenith: '#581c87',
    horizon: '#f472b6',
    sun: '#fbcfe8',
    fog: '#e879f9',
    terrainLow: '#3b0764',
    terrainMid: '#c026d3',
    terrainHigh: '#f9a8d4',
    primary: '#e879f9',
    secondary: '#38bdf8',
    accent: '#f472b6',
  },
  {
    id: 'aurora-prismatic-day',
    label: 'Prismatic Cobalt-Turquoise Day Sky & Aurora Ribbons',
    zenith: '#1d4ed8',
    horizon: '#5eead4',
    sun: '#ffffff',
    fog: '#38bdf8',
    terrainLow: '#1e3a8a',
    terrainMid: '#0284c7',
    terrainHigh: '#a7f3d0',
    primary: '#2dd4bf',
    secondary: '#818cf8',
    accent: '#5eead4',
  },
];

const CREATURE_AI_ARCHETYPES: TimelineCreatureAIArchetype[] = [
  'swarmer',
  'stalker',
  'leviathan',
  'mimic',
];

const CURATED_PRESET_COORDINATES: Record<
  string,
  Partial<AbsurdTimelineSpec>
> = {
  'C-137': {
    title: 'Timeline C-137 · Prime Cronenberg Ruin',
    subtitle: 'Mutagenic Flesh-Badlands Under Bioluminescent Emerald Sky',
    biologyArchetype: 'cronenberg-flesh-mutants',
    physicsTwist: 'reverse-buoyancy-updrafts',
    skyPhenomenon: 'boiling-portal-fluid-vortex',
    civilizationRelic: 'cronenberg-bio-alembics',
    landformArchetype: 'colossal-ribcage-badlands',
    atmospherePreset: 'bioluminescent-emerald-dusk',
  },
  'COB-994': {
    title: 'Timeline COB-994 · Everything-On-A-Cob Planet',
    subtitle: 'Sunlit Golden-Tangerine Sky & Hexagonal Cob Columns',
    biologyArchetype: 'everything-on-a-cob',
    physicsTwist: 'hyper-elastic-rubber-ground',
    skyPhenomenon: 'screaming-cyber-sun',
    civilizationRelic: 'plumbus-synthesis-mega-vats',
    landformArchetype: 'hex-basalt-organ-pipes',
    atmospherePreset: 'sunset-amber-crimson',
  },
  'J19-ZETA-7': {
    title: 'Timeline J19-ZETA-7 · Micro-Verse Clockwork Matrix',
    subtitle: 'Daylight Azure Sky-Atolls & Planetary Gear Escapements',
    biologyArchetype: 'recursive-fractal-crustaceans',
    physicsTwist: 'micro-verse-colossal-scale',
    skyPhenomenon: 'clockwork-citadel-gear-rings',
    civilizationRelic: 'citadel-bureaucracy-obelisks',
    landformArchetype: 'sky-atoll-archipelago',
    atmospherePreset: 'daylight-azure-scatter',
  },
  'CROM-88': {
    title: 'Timeline CROM-88 · Acoustic Cromulon Trial',
    subtitle: 'Ringed Gas-Giant Horizon & Spiral Nautilus Amphitheater',
    biologyArchetype: 'screaming-photonic-flora',
    physicsTwist: 'reverse-buoyancy-updrafts',
    skyPhenomenon: 'giant-floating-heads-sky',
    civilizationRelic: 'blips-and-chitz-arcade-spires',
    landformArchetype: 'spiral-nautilus-terraces',
    atmospherePreset: 'gas-giant-ringed-teal',
  },
  'PLUMBUS-42': {
    title: 'Timeline PLUMBUS-42 · Industrial Fleeb Foundry',
    subtitle: 'Coral-Magenta Synth Sky & Twisted Möbius Canyons',
    biologyArchetype: 'hyper-elastic-gelatinous-amoebas',
    physicsTwist: 'chrono-stutter-hyper-speed',
    skyPhenomenon: 'omniscient-eyeball-nebula',
    civilizationRelic: 'plumbus-synthesis-mega-vats',
    landformArchetype: 'twisted-mobius-canyons',
    atmospherePreset: 'binary-violet-magenta',
  },
};

export const PRESET_TIMELINE_COORDINATES = [
  'C-137',
  'COB-994',
  'J19-ZETA-7',
  'CROM-88',
  'PLUMBUS-42',
];

export function generateRandomAbsurdCoordinate(salt: number = Date.now()): string {
  const prefixes = [
    'C',
    'COB',
    'J19',
    'Ω',
    'ZETA',
    'RICK',
    'CRON',
    'FLB',
    'GAZ',
    'K-8',
    'PSI',
    'X-404',
  ];
  const suffixes = [
    'PRIME',
    'ALPHA',
    '7B',
    '99',
    'COB',
    'VOID',
    '137',
    '808',
    'X',
    'DELTA',
  ];
  const h = Math.abs(Math.floor(salt * 1664525 + 1013904223));
  const p = prefixes[h % prefixes.length];
  const num = 100 + ((h >>> 4) % 899);
  const s = suffixes[(h >>> 8) % suffixes.length];
  return `${p}-${num}-${s}`;
}

export function synthesizeInfiniteTimelineFromCoordinate(
  rawCoord: string
): AbsurdTimelineSpec {
  const coordinateCode = (rawCoord || 'C-137').trim().toUpperCase();
  const seedHash = hashTimelineCoordinate(coordinateCode);
  const preset = CURATED_PRESET_COORDINATES[coordinateCode];

  const bioIdx = Math.floor(seededFloat(seedHash, 1) * BIOLOGY_ARCHETYPES.length);
  const physIdx = Math.floor(seededFloat(seedHash, 2) * PHYSICS_TWISTS.length);
  const skyIdx = Math.floor(seededFloat(seedHash, 3) * SKY_PHENOMENA.length);
  const relicIdx = Math.floor(
    seededFloat(seedHash, 4) * CIVILIZATION_RELICS.length
  );
  const glitchIdx = Math.floor(
    seededFloat(seedHash, 5) * GLITCH_MODALITIES.length
  );
  const landformIdx = Math.floor(
    seededFloat(seedHash, 6) * LANDFORM_ARCHETYPES.length
  );
  const atmoIdx = Math.floor(
    seededFloat(seedHash, 7) * ATMOSPHERE_PRESETS.length
  );
  const creatureIdx = Math.floor(
    seededFloat(seedHash, 8) * CREATURE_AI_ARCHETYPES.length
  );

  const bioSpec =
    BIOLOGY_ARCHETYPES.find((b) => b.id === preset?.biologyArchetype) ??
    BIOLOGY_ARCHETYPES[bioIdx];
  const physSpec =
    PHYSICS_TWISTS.find((p) => p.id === preset?.physicsTwist) ??
    PHYSICS_TWISTS[physIdx];
  const skySpec =
    SKY_PHENOMENA.find((s) => s.id === preset?.skyPhenomenon) ??
    SKY_PHENOMENA[skyIdx];
  const relicSpec =
    CIVILIZATION_RELICS.find((r) => r.id === preset?.civilizationRelic) ??
    CIVILIZATION_RELICS[relicIdx];
  const glitchSpec = GLITCH_MODALITIES[glitchIdx];
  const landformSpec =
    LANDFORM_ARCHETYPES.find((l) => l.id === preset?.landformArchetype) ??
    LANDFORM_ARCHETYPES[landformIdx];
  const atmoSpec =
    ATMOSPHERE_PRESETS.find((a) => a.id === preset?.atmospherePreset) ??
    ATMOSPHERE_PRESETS[atmoIdx];
  const dominantCreature = CREATURE_AI_ARCHETYPES[creatureIdx];

  const titleAdj = [
    'Sunlit',
    'Cronenberged',
    'Hyper-Kernelized',
    'Bioluminescent',
    'Schrödinger',
    'Gelatinous',
    'Prismatic',
    'Paradoxical',
  ][seedHash % 8];

  const titleNoun = [
    'Sky-Atoll',
    'Cob-Archipelago',
    'Fleeb-Caldera',
    'Micro-Verse',
    'Nautilus-Steppe',
    'Squanch-Canyon',
    'Basalt-Spire',
    'Cromulon-Reach',
  ][(seedHash >>> 3) % 8];

  return {
    coordinateCode,
    seedHash,
    title:
      preset?.title ??
      `Timeline ${coordinateCode} · ${titleAdj} ${titleNoun}`,
    subtitle:
      preset?.subtitle ??
      `${landformSpec.label.split(' ')[0]} Geography × ${atmoSpec.label}`,
    satiricalLore: `${bioSpec.loreFragment} Geography shaped into ${landformSpec.label.toLowerCase()} beneath ${atmoSpec.label.toLowerCase()}.`,
    biologyArchetype: bioSpec.id,
    biologyLabel: bioSpec.label,
    physicsTwist: physSpec.id,
    physicsLabel: physSpec.label,
    skyPhenomenon: skySpec.id,
    skyLabel: skySpec.label,
    civilizationRelic: relicSpec.id,
    relicLabel: relicSpec.label,
    glitchModality: glitchSpec.id,
    glitchLabel: glitchSpec.label,
    landformArchetype: landformSpec.id,
    landformLabel: landformSpec.label,
    atmospherePreset: atmoSpec.id,
    atmosphereLabel: atmoSpec.label,
    skyZenithHex: atmoSpec.zenith,
    skyHorizonHex: atmoSpec.horizon,
    sunDiscHex: atmoSpec.sun,
    terrainLowHex: atmoSpec.terrainLow,
    terrainMidHex: atmoSpec.terrainMid,
    terrainHighHex: atmoSpec.terrainHigh,
    dominantCreatureArchetype: dominantCreature,
    proceduralItemsCount: 4,
    propScaleMultiplier: physSpec.propScale,
    entityScaleMultiplier: physSpec.entityScale,
    gravityMultiplier: physSpec.gravityMult,
    groundBounceRestitution: physSpec.bounce,
    moveSpeedMultiplier: physSpec.speedMult,
    timeDilationFactor: physSpec.timeDilation,
    skyTintHex: atmoSpec.zenith,
    fogTintHex: atmoSpec.fog,
    portalFluidPrimaryHex: atmoSpec.primary,
    portalFluidSecondaryHex: atmoSpec.secondary,
    accentHex: atmoSpec.accent,
  };
}

/**
 * Splices two timelines together (Unlocked at Reality-Splicing Branch Tier 2):
 * Combines the Biology, Relics & Landform Geography of Timeline A with the Physics, Scale & Vibrant Atmosphere of Timeline B!
 */
export function spliceTwoTimelines(
  timelineA: AbsurdTimelineSpec,
  timelineB: AbsurdTimelineSpec
): AbsurdTimelineSpec {
  const splicedCode = `${timelineA.coordinateCode.slice(0, 5)}⊕${timelineB.coordinateCode.slice(0, 5)}`;
  const seedHash = hashTimelineCoordinate(splicedCode);
  return {
    coordinateCode: splicedCode,
    seedHash,
    title: `Spliced Hybrid ${splicedCode}`,
    subtitle: `${timelineA.landformLabel.split(' ')[0]} Geography ⊕ ${timelineB.atmosphereLabel.split(' ')[0]} Sky`,
    satiricalLore: `Reality-spliced continuum fusing ${timelineA.coordinateCode}'s ${timelineA.landformLabel.toLowerCase()} and ${timelineA.biologyLabel.toLowerCase()} directly under ${timelineB.coordinateCode}'s ${timelineB.atmosphereLabel.toLowerCase()}.`,
    biologyArchetype: timelineA.biologyArchetype,
    biologyLabel: timelineA.biologyLabel,
    physicsTwist: timelineB.physicsTwist,
    physicsLabel: timelineB.physicsLabel,
    skyPhenomenon: timelineB.skyPhenomenon,
    skyLabel: timelineB.skyLabel,
    civilizationRelic: timelineA.civilizationRelic,
    relicLabel: timelineA.relicLabel,
    glitchModality: timelineB.glitchModality,
    glitchLabel: timelineB.glitchLabel,
    landformArchetype: timelineA.landformArchetype,
    landformLabel: timelineA.landformLabel,
    atmospherePreset: timelineB.atmospherePreset,
    atmosphereLabel: timelineB.atmosphereLabel,
    skyZenithHex: timelineB.skyZenithHex,
    skyHorizonHex: timelineB.skyHorizonHex,
    sunDiscHex: timelineB.sunDiscHex,
    terrainLowHex: timelineA.terrainLowHex,
    terrainMidHex: timelineB.terrainMidHex,
    terrainHighHex: timelineB.terrainHighHex,
    dominantCreatureArchetype: timelineA.dominantCreatureArchetype,
    proceduralItemsCount: 6,
    propScaleMultiplier: timelineB.propScaleMultiplier,
    entityScaleMultiplier: Number(
      ((timelineA.entityScaleMultiplier + timelineB.entityScaleMultiplier) * 0.5).toFixed(2)
    ),
    gravityMultiplier: timelineB.gravityMultiplier,
    groundBounceRestitution: Math.max(
      timelineA.groundBounceRestitution,
      timelineB.groundBounceRestitution
    ),
    moveSpeedMultiplier: Math.max(
      timelineA.moveSpeedMultiplier,
      timelineB.moveSpeedMultiplier
    ),
    timeDilationFactor: timelineB.timeDilationFactor,
    skyTintHex: timelineB.skyZenithHex,
    fogTintHex: timelineB.fogTintHex,
    portalFluidPrimaryHex: timelineA.portalFluidPrimaryHex,
    portalFluidSecondaryHex: timelineB.portalFluidSecondaryHex,
    accentHex: timelineA.accentHex,
    isSplicedHybrid: true,
    splicedParentCodes: [timelineA.coordinateCode, timelineB.coordinateCode],
  };
}

/**
 * Infinite Procedural Timeline Item & Absurd Weapon Synthesizer:
 * Deterministically synthesizes 4 unique weapons, tools, armor carapaces, and relics
 * for ANY timeline coordinate so infinite timelines yield infinite playable loot!
 */
export function synthesizeProceduralTimelineItems(
  timeline: AbsurdTimelineSpec,
  count: number = 4
): DimensionalItemDefinition[] {
  const weaponSubTypes: CompositeWeaponSubType[] = [
    'resonance-pistol',
    'void-arbalest',
    'spore-caster',
    'excavating-lance',
    'cleaver-halberd',
    'gravity-hammer',
    'prism-saber',
    'chrono-tuning-fork',
  ];

  const absurdWeaponPrefixes = [
    'Plumbus-Infused',
    'Kernelized On-A-Cob',
    'Cronenberg-Mutated',
    'Meeseeks-Box',
    'Micro-Verse Battery',
    'Kalaxian-Crystal',
    'Squanch-Overclocked',
    'Cromulon-Harmonic',
    'Gazorpian-Sonic',
    'Fleeb-Juice Pressurized',
    'Citadel-Contraband',
    'Tachyon-Spliced',
  ];

  const absurdWeaponNouns: Record<CompositeWeaponSubType, string> = {
    'resonance-pistol': 'Portal-Fluid Blaster Pistol',
    'void-arbalest': 'Singularity Harpoon Arbalest',
    'spore-caster': 'Mutagenic Fleeb-Spore Launcher',
    'excavating-lance': 'Sub-Atomic Auger Lance',
    'cleaver-halberd': 'Bipedal-Chair Cleaver Halberd',
    'gravity-hammer': 'Graviton Dinglebop Maul',
    'prism-saber': 'Schrödinger Phase Katana',
    'chrono-tuning-fork': 'Time-Crystal Tuning Pike',
  };

  const items: DimensionalItemDefinition[] = [];
  for (let slot = 0; slot < count; slot++) {
    const h = Math.abs(timeline.seedHash + slot * 7919);
    const subType = weaponSubTypes[h % weaponSubTypes.length];
    const prefix = absurdWeaponPrefixes[(h >>> 3) % absurdWeaponPrefixes.length];
    const noun = absurdWeaponNouns[subType];
    const category =
      slot === 0 || slot === 1
        ? 'weapon'
        : slot === 2
        ? 'tool'
        : 'relic';

    const dmg = 52 + (h % 48);
    const swingHz = Number((1.15 + ((h % 9) * 0.1)).toFixed(2));
    const reach = Number((3.4 + ((h % 6) * 0.55)).toFixed(2));

    const validBoundaries: DifferentialUniverseBoundaryId[] = [
      'hadal-biodepth-abyss',
      'tesseractic-4d-reliquary',
      'monolithic-brutalist-singularity',
      'mycelial-silicon-necropolis',
      'cel-traced-chromatic-steppe',
    ];
    const validElements = [
      'chrono-phase',
      'lithic-crystalline',
      'hydro-superfluid',
      'aero-cymatic',
      'pyro-vitreous',
      'bio-miasmic',
    ] as const;

    items.push({
      id: `timeline-item-${timeline.coordinateCode.toLowerCase()}-${slot}`,
      catalogNumber: 400 + (h % 599),
      name: `[${timeline.coordinateCode}] ${prefix} ${noun}`,
      category,
      subTypeLabel: noun,
      weaponSubType: subType,
      originBoundary: validBoundaries[h % validBoundaries.length],
      elementAffinity: validElements[h % validElements.length],
      rarity: slot === 0 ? 'Mythic Anchor' : 'Divergent',
      stats: {
        damage: dmg,
        excavationPower: Number((2.2 + slot * 0.45).toFixed(2)),
        swingSpeedHz: swingHz,
        stabilityBonus: Number((1.25 + (h % 5) * 0.15).toFixed(2)),
        massKg: Number((2.4 + (h % 6) * 0.6).toFixed(1)),
        reachMeters: reach,
      },
      craftCost: {
        primaryMatter: 'chronos-lattice-quartz',
        primaryCount: 2,
      },
      loreProvenance: `Procedurally synthesized in ${timeline.title}. Channeling ${timeline.biologyLabel} and ${timeline.physicsLabel}.`,
      groundingConnection: `${timeline.landformLabel} · ${timeline.atmosphereLabel}`,
      visualSpec: {
        weaponSubType: subType,
        primaryHex: timeline.portalFluidPrimaryHex,
        secondaryHex: timeline.portalFluidSecondaryHex,
        accentEmissiveHex: timeline.accentHex,
        metalness: 0.84,
        roughness: 0.18,
        transmission: 0.45,
        scaleLength: Number(
          THREE.MathUtils.clamp(timeline.propScaleMultiplier * 0.85, 0.85, 1.45).toFixed(2)
        ),
        hasOpticalCrystal: true,
        hasCoiledConduit: true,
      },
    });
  }
  return items;
}

export function createInitialVoidBallEvolutionState(): VoidBallEvolutionState {
  const c137 = synthesizeInfiniteTimelineFromCoordinate('C-137');
  const cob994 = synthesizeInfiniteTimelineFromCoordinate('COB-994');
  return {
    activeGateShape: 'fluid-vortex-ellipse',
    unlockedGateShapes: ['rectangular-rift', 'fluid-vortex-ellipse'],
    activeBeamMode: 'matter-mutation-ray',
    branchTiers: {
      'reality-splicing-coordinates': 1,
      'active-physics-mutation-beams': 1,
      'pocket-sanctum-containment': 1,
      'sentient-symbiote-tendrils': 1,
    },
    anomalyInventory: {
      'portal-fluid-globule': 6,
      'chrono-paradox-shard': 4,
      'causal-splice-matrix': 3,
      'symbiote-void-ichor': 3,
    },
    discoveredTimelines: [c137, cob994],
    activeTimeline: c137,
    pendingDestinationTimeline: cob994,
    isPlayerInsideInBetweenVoid: false,
    isInBetweenPortalOpen: false,
    inBetweenPortalProgress: 0,
  };
}

// ============================================================================
// 1. PLAYABLE ZERO-G IN-BETWEEN TIMELINE VOID RIFT & HUB RIG
// ============================================================================

export interface InBetweenVoidAnomalyNode {
  id: string;
  resourceId: VoidAnomalyResourceId;
  mesh: THREE.Group;
  baseOrbitAngle: number;
  baseOrbitRadius: number;
  baseHeightOffset: number;
  currentPos: THREE.Vector3;
  respawnCooldown: number;
}

export class InBetweenTimelineVoidRig {
  public rootGroup = new THREE.Group();
  // Exterior Timeline Portal (opens in the exterior world or inside the Portal Room)
  public exteriorPortalGroup = new THREE.Group();
  public exteriorPortalMaterial: THREE.ShaderMaterial;
  public exteriorPortalFrameGroup = new THREE.Group();
  public exteriorPortalPos = new THREE.Vector3(6, 0, 8);
  public exteriorPortalYaw = 0;

  // Interior Zero-G In-Between Void Hub at IN_BETWEEN_VOID_ORIGIN [0, 1200, 0]
  public voidInteriorGroup = new THREE.Group();
  public singularityLoomGroup = new THREE.Group();
  public destinationGateGroup = new THREE.Group();
  public destinationGateMaterial: THREE.ShaderMaterial;
  public returnGateGroup = new THREE.Group();
  public returnGateMaterial: THREE.ShaderMaterial;
  public containmentPodsGroup = new THREE.Group();
  public anomalyNodes: InBetweenVoidAnomalyNode[] = [];

  public portalTeleportCooldown = 0;
  public savedExteriorPos = new THREE.Vector3(0, 2, 10);
  public savedExteriorYaw = 0;

  constructor() {
    this.rootGroup.name = 'in-between-timeline-void-rig';

    // Procedural fallback texture for portal fluid vortex
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
      grad.addColorStop(0, '#bef264');
      grad.addColorStop(0.45, '#22c55e');
      grad.addColorStop(0.8, '#065f46');
      grad.addColorStop(1, '#022c22');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    const vortexTex = new THREE.CanvasTexture(canvas);

    this.exteriorPortalMaterial = createRealityTearShaderMaterial(
      vortexTex,
      '#22c55e',
      '#a3e635',
      '#38bdf8',
      1
    );
    this.destinationGateMaterial = createRealityTearShaderMaterial(
      vortexTex,
      '#22c55e',
      '#fde047',
      '#f43f5e',
      1
    );
    this.returnGateMaterial = createRealityTearShaderMaterial(
      vortexTex,
      '#38bdf8',
      '#a855f7',
      '#22c55e',
      0
    );

    this.buildExteriorTimelinePortal();
    this.buildInBetweenVoidInterior();
  }

  private buildExteriorTimelinePortal(): void {
    const planeGeo = new THREE.PlaneGeometry(3.8, 4.4, 24, 24);
    const mesh = new THREE.Mesh(planeGeo, this.exteriorPortalMaterial);
    mesh.position.set(0, 2.2, 0);
    this.exteriorPortalGroup.add(mesh);

    // 16 perimeter frame nodes that morph with the chosen PortalGateShapeId
    const shardGeo = new THREE.OctahedronGeometry(0.16, 0);
    shardGeo.scale(0.7, 2.1, 0.6);
    const matA = new THREE.MeshStandardMaterial({
      color: '#14532d',
      emissive: '#22c55e',
      emissiveIntensity: 1.1,
      metalness: 0.8,
      roughness: 0.2,
    });
    const matB = new THREE.MeshStandardMaterial({
      color: '#365314',
      emissive: '#a3e635',
      emissiveIntensity: 1.2,
      metalness: 0.7,
      roughness: 0.2,
    });

    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2;
      const rx = Math.cos(ang) * 1.65;
      const ry = Math.sin(ang) * 1.95;
      const shard = new THREE.Mesh(shardGeo, i % 2 === 0 ? matA : matB);
      shard.position.set(rx, ry, 0);
      shard.rotation.z = ang + Math.PI * 0.5;
      shard.userData.baseAngle = ang;
      shard.userData.baseRx = rx;
      shard.userData.baseRy = ry;
      this.exteriorPortalFrameGroup.add(shard);
    }
    this.exteriorPortalFrameGroup.position.set(0, 2.2, 0);
    this.exteriorPortalGroup.add(this.exteriorPortalFrameGroup);
    this.exteriorPortalGroup.visible = false;
    this.rootGroup.add(this.exteriorPortalGroup);
  }

  private buildInBetweenVoidInterior(): void {
    this.voidInteriorGroup.position.copy(IN_BETWEEN_VOID_ORIGIN);

    // 1. Translucent Fractured Void Archipelago Floor & Zero-G Ley-Line Rings
    const platformMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#090d16'),
      emissive: new THREE.Color('#064e3b'),
      emissiveIntensity: 0.35,
      metalness: 0.85,
      roughness: 0.18,
      clearcoat: 0.9,
    });

    const mainDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(23.5, 19.5, 1.2, 32),
      platformMat
    );
    mainDisc.position.set(0, -0.6, 0);
    mainDisc.receiveShadow = true;
    this.voidInteriorGroup.add(mainDisc);

    // Glowing green/cyan portal-fluid concentric floor rings
    for (let r = 1; r <= 4; r++) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(r * 5.2 - 0.12, r * 5.2 + 0.12, 48),
        new THREE.MeshBasicMaterial({
          color: r % 2 === 0 ? '#22c55e' : '#38bdf8',
          side: THREE.DoubleSide,
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.03;
      this.voidInteriorGroup.add(ring);
    }

    // 8 Floating Fractured Timeline Stepping Islands around the Void perimeter
    const islandGeo = new THREE.CylinderGeometry(2.6, 1.4, 0.8, 7);
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const dist = 14.5;
      const island = new THREE.Mesh(islandGeo, platformMat);
      island.position.set(
        Math.cos(ang) * dist,
        1.2 + (i % 3) * 0.9,
        Math.sin(ang) * dist
      );
      island.userData.isFloatingVoidIsland = true;
      island.userData.baseY = island.position.y;
      island.userData.phase = i * 0.9;
      this.voidInteriorGroup.add(island);
    }

    // 2. Central Void Ball Singularity Loom (Upgrades the Void Ball & Splices Timelines)
    this.singularityLoomGroup.position.set(0, 0, 0);
    const loomPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 2.4, 0.9, 12),
      platformMat
    );
    loomPedestal.position.y = 0.45;
    this.singularityLoomGroup.add(loomPedestal);

    const loomCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.95, 1),
      new THREE.MeshPhysicalMaterial({
        color: '#22c55e',
        emissive: '#10b981',
        emissiveIntensity: 1.15,
        metalness: 0.3,
        roughness: 0.1,
        wireframe: false,
      })
    );
    loomCore.position.y = 2.6;
    loomCore.userData.isLoomCore = true;
    this.singularityLoomGroup.add(loomCore);

    for (let g = 0; g < 3; g++) {
      const gimbal = new THREE.Mesh(
        new THREE.TorusGeometry(1.45 + g * 0.38, 0.05, 8, 36),
        new THREE.MeshBasicMaterial({
          color: g === 0 ? '#22c55e' : g === 1 ? '#38bdf8' : '#f43f5e',
        })
      );
      gimbal.position.y = 2.6;
      gimbal.userData.isLoomGimbal = true;
      gimbal.userData.gimbalIndex = g;
      this.singularityLoomGroup.add(gimbal);
    }
    this.voidInteriorGroup.add(this.singularityLoomGroup);

    // 3. North Destination Timeline Gate at [0, 0, -18.5] (Walk through to emerge in Pending Destination Timeline!)
    this.destinationGateGroup.position.set(0, 0, -18.5);
    const destPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 5.2, 24, 24),
      this.destinationGateMaterial
    );
    destPlane.position.set(0, 2.6, 0);
    this.destinationGateGroup.add(destPlane);

    const destArch = new THREE.Mesh(
      new THREE.TorusGeometry(2.45, 0.14, 10, 36),
      new THREE.MeshStandardMaterial({
        color: '#14532d',
        emissive: '#22c55e',
        emissiveIntensity: 0.9,
      })
    );
    destArch.position.set(0, 2.6, 0);
    this.destinationGateGroup.add(destArch);
    this.voidInteriorGroup.add(this.destinationGateGroup);

    // 4. South Return Gate at [0, 0, +18.5] (Returns to Previous Exterior Position)
    this.returnGateGroup.position.set(0, 0, 18.5);
    const retPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 4.4, 20, 20),
      this.returnGateMaterial
    );
    retPlane.position.set(0, 2.2, 0);
    this.returnGateGroup.add(retPlane);
    this.voidInteriorGroup.add(this.returnGateGroup);

    // 5. Specimen Containment Pods (Unlocked at Pocket-Sanctum Branch Tier 3)
    const podMat = new THREE.MeshPhysicalMaterial({
      color: '#38bdf8',
      emissive: '#0284c7',
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
    });
    for (let p = 0; p < 4; p++) {
      const ang = (p / 4) * Math.PI * 2 + Math.PI * 0.25;
      const podGroup = new THREE.Group();
      podGroup.position.set(Math.cos(ang) * 8.5, 0, Math.sin(ang) * 8.5);
      const cyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.95, 0.95, 3.2, 16),
        podMat
      );
      cyl.position.y = 1.6;
      podGroup.add(cyl);

      const specimen = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.38, 0.12, 32, 8),
        new THREE.MeshStandardMaterial({
          color: p % 2 === 0 ? '#f43f5e' : '#a3e635',
          emissive: p % 2 === 0 ? '#e11d48' : '#22c55e',
          emissiveIntensity: 0.85,
        })
      );
      specimen.position.y = 1.6;
      specimen.userData.isContainedSpecimen = true;
      podGroup.add(specimen);
      this.containmentPodsGroup.add(podGroup);
    }
    this.voidInteriorGroup.add(this.containmentPodsGroup);

    // 6. Spawn 20 Floating Zero-G Void Anomaly Resource Nodes around the Void Rift
    const resourceIds: VoidAnomalyResourceId[] = [
      'portal-fluid-globule',
      'chrono-paradox-shard',
      'causal-splice-matrix',
      'symbiote-void-ichor',
    ];

    for (let n = 0; n < 20; n++) {
      const resId = resourceIds[n % resourceIds.length];
      const spec = VOID_ANOMALY_RESOURCE_CATALOG[resId];
      const nodeGroup = new THREE.Group();

      const coreGeo =
        resId === 'portal-fluid-globule'
          ? new THREE.SphereGeometry(0.34, 12, 12)
          : resId === 'chrono-paradox-shard'
          ? new THREE.OctahedronGeometry(0.38, 0)
          : resId === 'causal-splice-matrix'
          ? new THREE.BoxGeometry(0.45, 0.45, 0.45)
          : new THREE.DodecahedronGeometry(0.36, 0);

      const coreMesh = new THREE.Mesh(
        coreGeo,
        new THREE.MeshStandardMaterial({
          color: spec.colorHex,
          emissive: spec.emissiveHex,
          emissiveIntensity: 1.15,
          roughness: 0.15,
          metalness: 0.7,
        })
      );
      nodeGroup.add(coreMesh);

      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.46, 0.56, 16),
        new THREE.MeshBasicMaterial({
          color: spec.colorHex,
          side: THREE.DoubleSide,
        })
      );
      nodeGroup.add(halo);

      const orbitAngle = (n / 20) * Math.PI * 2;
      const orbitRadius = 5.5 + (n % 4) * 3.8;
      const heightOffset = 1.4 + (n % 3) * 1.35;
      const pos = new THREE.Vector3(
        IN_BETWEEN_VOID_ORIGIN.x + Math.cos(orbitAngle) * orbitRadius,
        IN_BETWEEN_VOID_ORIGIN.y + heightOffset,
        IN_BETWEEN_VOID_ORIGIN.z + Math.sin(orbitAngle) * orbitRadius
      );
      nodeGroup.position.copy(pos).sub(IN_BETWEEN_VOID_ORIGIN);
      this.voidInteriorGroup.add(nodeGroup);

      this.anomalyNodes.push({
        id: `void-anom-${n}`,
        resourceId: resId,
        mesh: nodeGroup,
        baseOrbitAngle: orbitAngle,
        baseOrbitRadius: orbitRadius,
        baseHeightOffset: heightOffset,
        currentPos: pos,
        respawnCooldown: 0,
      });
    }

    this.rootGroup.add(this.voidInteriorGroup);
  }

  public openPortalInFrontOfPlayer(
    playerPos: THREE.Vector3,
    playerYaw: number,
    evalGroundY: (x: number, z: number) => number
  ): void {
    const dist = 4.4;
    const tx = playerPos.x - Math.sin(playerYaw) * dist;
    const tz = playerPos.z - Math.cos(playerYaw) * dist;
    const ty = evalGroundY(tx, tz);
    this.exteriorPortalPos.set(tx, ty, tz);
    this.exteriorPortalYaw = playerYaw;
    this.exteriorPortalGroup.position.copy(this.exteriorPortalPos);
    this.exteriorPortalGroup.rotation.y = playerYaw;
    this.exteriorPortalGroup.visible = true;
  }

  public update(params: {
    dt: number;
    nowSec: number;
    playerPos: THREE.Vector3;
    playerVel: THREE.Vector3;
    voidState: VoidBallEvolutionState;
    evalExteriorGroundY: (x: number, z: number) => number;
    onHarvestVoidAnomaly: (resId: VoidAnomalyResourceId, amount: number) => void;
    onEnterInBetweenVoid: () => void;
    onArriveInDestinationTimeline: (dest: AbsurdTimelineSpec) => void;
    onReturnFromInBetweenVoid: () => void;
  }): void {
    const {
      dt,
      nowSec,
      playerPos,
      playerVel,
      voidState,
      evalExteriorGroundY,
      onHarvestVoidAnomaly,
      onEnterInBetweenVoid,
      onArriveInDestinationTimeline,
      onReturnFromInBetweenVoid,
    } = params;

    if (this.portalTeleportCooldown > 0) {
      this.portalTeleportCooldown = Math.max(0, this.portalTeleportCooldown - dt);
    }

    const gateSpec =
      PORTAL_GATE_SHAPE_CATALOG[voidState.activeGateShape] ??
      PORTAL_GATE_SHAPE_CATALOG['fluid-vortex-ellipse'];
    const destTimeline = voidState.pendingDestinationTimeline;

    // Update shader uniforms on Exterior, Destination & Return gates
    for (const mat of [
      this.exteriorPortalMaterial,
      this.destinationGateMaterial,
      this.returnGateMaterial,
    ]) {
      mat.uniforms.uTime.value = nowSec;
      mat.uniforms.uGateShapeIndex.value = gateSpec.shaderShapeIndex;
      mat.uniforms.uPrimaryColor.value.set(destTimeline.portalFluidPrimaryHex);
      mat.uniforms.uSecondaryColor.value.set(
        destTimeline.portalFluidSecondaryHex
      );
      mat.uniforms.uOpenProgress.value = 1.0;
    }

    this.exteriorPortalGroup.visible = voidState.isInBetweenPortalOpen;
    if (voidState.isInBetweenPortalOpen) {
      const gy = evalExteriorGroundY(
        this.exteriorPortalPos.x,
        this.exteriorPortalPos.z
      );
      this.exteriorPortalPos.y = gy;
      this.exteriorPortalGroup.position.copy(this.exteriorPortalPos);

      // Animate exterior portal frame shards
      this.exteriorPortalFrameGroup.children.forEach((ch, idx) => {
        const baseA = ch.userData.baseAngle ?? 0;
        const spin = baseA + nowSec * 1.25;
        ch.position.x = Math.cos(spin) * 1.62;
        ch.position.y = Math.sin(spin) * 1.92;
        ch.rotation.z = spin + Math.PI * 0.5;
        if (idx % 2 === 0 && ch instanceof THREE.Mesh) {
          (ch.material as THREE.MeshStandardMaterial).emissive.set(
            destTimeline.portalFluidPrimaryHex
          );
        }
      });

      // Check if player walks into the Exterior Timeline Portal to enter the In-Between Timeline Void!
      if (
        !voidState.isPlayerInsideInBetweenVoid &&
        this.portalTeleportCooldown <= 0
      ) {
        const dPortal = Math.hypot(
          playerPos.x - this.exteriorPortalPos.x,
          playerPos.z - this.exteriorPortalPos.z
        );
        if (
          dPortal < 1.65 &&
          Math.abs(playerPos.y - this.exteriorPortalPos.y) < 3.4
        ) {
          this.savedExteriorPos.copy(playerPos);
          this.portalTeleportCooldown = 1.4;
          playerPos.set(
            IN_BETWEEN_VOID_ORIGIN.x,
            IN_BETWEEN_VOID_ORIGIN.y + 0.5,
            IN_BETWEEN_VOID_ORIGIN.z + 14.0
          );
          playerVel.set(0, 0, 0);
          onEnterInBetweenVoid();
        }
      }
    }

    // Animate In-Between Void Hub Interior
    const sanctumTier = voidState.branchTiers['pocket-sanctum-containment'] ?? 1;
    this.containmentPodsGroup.visible = sanctumTier >= 3;

    this.voidInteriorGroup.traverse((ch) => {
      if (ch.userData.isLoomCore) {
        ch.rotation.y = nowSec * 1.4;
        ch.rotation.x = nowSec * 0.9;
      }
      if (ch.userData.isLoomGimbal) {
        const gIdx = ch.userData.gimbalIndex ?? 0;
        ch.rotation.x = nowSec * (1.2 + gIdx * 0.4);
        ch.rotation.y = -nowSec * (0.9 + gIdx * 0.3);
      }
      if (ch.userData.isFloatingVoidIsland) {
        ch.position.y =
          (ch.userData.baseY ?? 1.2) +
          Math.sin(nowSec * 1.6 + (ch.userData.phase ?? 0)) * 0.35;
      }
      if (ch.userData.isContainedSpecimen) {
        ch.rotation.y = nowSec * 1.8;
        ch.rotation.z = nowSec * 1.1;
      }
    });

    // Magnet pull radius based on Pocket-Sanctum branch tier
    const magnetRadius =
      sanctumTier >= 4
        ? 38.0
        : sanctumTier === 3
        ? 28.0
        : sanctumTier === 2
        ? 20.0
        : 12.0;
    const yieldMult =
      (voidState.branchTiers['reality-splicing-coordinates'] ?? 1) >= 3 ? 2 : 1;

    // Update 20 Zero-G Floating Anomaly Resource Nodes
    for (const node of this.anomalyNodes) {
      if (node.respawnCooldown > 0) {
        node.respawnCooldown = Math.max(0, node.respawnCooldown - dt);
        node.mesh.visible = node.respawnCooldown <= 0;
        continue;
      }
      node.mesh.visible = true;
      const ang = node.baseOrbitAngle + nowSec * 0.28;
      const targetX = Math.cos(ang) * node.baseOrbitRadius;
      const targetY =
        node.baseHeightOffset + Math.sin(nowSec * 2.1 + node.baseOrbitAngle) * 0.55;
      const targetZ = Math.sin(ang) * node.baseOrbitRadius;

      node.mesh.position.x += (targetX - node.mesh.position.x) * Math.min(1, dt * 4);
      node.mesh.position.y += (targetY - node.mesh.position.y) * Math.min(1, dt * 4);
      node.mesh.position.z += (targetZ - node.mesh.position.z) * Math.min(1, dt * 4);
      node.mesh.rotation.y = nowSec * 2.2;
      node.mesh.rotation.x = nowSec * 1.5;

      node.currentPos
        .copy(IN_BETWEEN_VOID_ORIGIN)
        .add(node.mesh.position);

      if (voidState.isPlayerInsideInBetweenVoid) {
        const distToPlayer = node.currentPos.distanceTo(playerPos);
        if (distToPlayer < magnetRadius) {
          // Pull anomaly node smoothly toward the player's Left-Hand Void Ball!
          const pullLocal = playerPos
            .clone()
            .sub(IN_BETWEEN_VOID_ORIGIN)
            .add(new THREE.Vector3(0, 1.2, 0));
          node.mesh.position.lerp(pullLocal, Math.min(1, dt * 7.5));
        }
        if (distToPlayer < 2.2) {
          node.respawnCooldown = 9.0;
          node.mesh.visible = false;
          onHarvestVoidAnomaly(node.resourceId, yieldMult);
        }
      }
    }

    // If player is inside the In-Between Timeline Void, check North Destination Gate & South Return Gate!
    if (
      voidState.isPlayerInsideInBetweenVoid &&
      this.portalTeleportCooldown <= 0
    ) {
      const localX = playerPos.x - IN_BETWEEN_VOID_ORIGIN.x;
      const localZ = playerPos.z - IN_BETWEEN_VOID_ORIGIN.z;

      // North Destination Gate at [0, 0, -18.5] -> Emerge into newly dialed Infinite Timeline!
      if (Math.hypot(localX, localZ - -18.5) < 2.3) {
        this.portalTeleportCooldown = 1.5;
        const outX = this.savedExteriorPos.x;
        const outZ = this.savedExteriorPos.z;
        const outY = evalExteriorGroundY(outX, outZ);
        playerPos.set(outX, outY + 0.5, outZ);
        onArriveInDestinationTimeline(voidState.pendingDestinationTimeline);
      }
      // South Return Gate at [0, 0, +18.5] -> Return to current timeline without switching
      else if (Math.hypot(localX, localZ - 18.5) < 2.2) {
        this.portalTeleportCooldown = 1.5;
        const outX = this.savedExteriorPos.x;
        const outZ = this.savedExteriorPos.z;
        const outY = evalExteriorGroundY(outX, outZ);
        playerPos.set(outX, outY + 0.5, outZ);
        onReturnFromInBetweenVoid();
      }
    }
  }
}

// ============================================================================
// 2. CRASH-PROOF ABSURD TIMELINE WORLD DECORATOR RIG (InstancedMesh + Zero-Leak)
// ============================================================================

const VIBRANT_ATMOSPHERE_VERTEX_SHADER = `
  varying vec3 vWorldDir;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldDir = normalize(position);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const VIBRANT_ATMOSPHERE_FRAGMENT_SHADER = `
  uniform vec3 uZenithColor;
  uniform vec3 uHorizonColor;
  uniform vec3 uSunColor;
  uniform vec3 uAccentColor;
  uniform float uTime;
  uniform int uPresetMode;
  varying vec3 vWorldDir;

  void main() {
    vec3 dir = normalize(vWorldDir);
    float elev = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
    float horizonGlow = pow(1.0 - abs(dir.y), 2.6);

    // Base vibrant atmospheric Rayleigh/Mie scatter gradient (never pitch black!)
    vec3 skyCol = mix(uHorizonColor, uZenithColor, pow(elev, 0.72));
    skyCol += uHorizonColor * horizonGlow * 0.38;

    // Primary Sun Disc & Corona
    vec3 sunDir = normalize(vec3(0.25, 0.48, -0.84));
    float sunDot = max(0.0, dot(dir, sunDir));
    float sunDisc = smoothstep(0.992, 0.997, sunDot);
    float sunHalo = pow(sunDot, 14.0) * 0.55 + pow(sunDot, 4.0) * 0.22;
    skyCol += uSunColor * (sunDisc * 1.45 + sunHalo);

    if (uPresetMode == 0) {
      // Daylight Azure Scatter: High-altitude sunlit cirrus wisps
      float cirrus = sin(dir.x * 9.0 + uTime * 0.18) * cos(dir.z * 7.0 - uTime * 0.12);
      float cloudMask = smoothstep(0.15, 0.85, cirrus) * smoothstep(0.05, 0.45, dir.y);
      skyCol = mix(skyCol, mix(vec3(1.0), uSunColor, 0.35), cloudMask * 0.32);
    } else if (uPresetMode == 1 || uPresetMode == 4) {
      // Binary Sunset Crimson / Violet-Magenta: Second Binary Companion Sun + Synth-Wave Horizon Bands
      vec3 sun2Dir = normalize(vec3(-0.42, 0.34, -0.84));
      float s2Dot = max(0.0, dot(dir, sun2Dir));
      float s2Disc = smoothstep(0.994, 0.998, s2Dot);
      skyCol += uAccentColor * (s2Disc * 1.3 + pow(s2Dot, 10.0) * 0.45);
    } else if (uPresetMode == 2) {
      // Bioluminescent Emerald Dusk: Swirling luminous spore nebula bands
      float neb = sin(dir.x * 6.0 + dir.y * 5.0 + uTime * 0.25) * cos(dir.z * 6.0 - uTime * 0.2);
      skyCol += uAccentColor * max(0.0, neb) * 0.35 * smoothstep(-0.1, 0.6, dir.y);
    } else if (uPresetMode == 3) {
      // Gas-Giant Ringed Teal: Colossal banded gas-giant planet & planetary ring arch across the sky
      vec3 planetDir = normalize(vec3(-0.35, 0.55, -0.75));
      float pDot = dot(dir, planetDir);
      if (pDot > 0.86) {
        float band = sin((dir.y - planetDir.y) * 65.0 + sin(dir.x * 20.0) * 2.0);
        vec3 gasCol = mix(uHorizonColor, uAccentColor, band * 0.5 + 0.5);
        float limb = smoothstep(0.86, 0.89, pDot);
        skyCol = mix(skyCol, gasCol, limb * 0.85);
      }
      float ringBand = abs(dir.y * 0.85 + dir.x * 0.45 - 0.32);
      if (ringBand < 0.085 && dir.y > 0.0) {
        float ringStripes = sin(ringBand * 260.0) * 0.5 + 0.5;
        skyCol += mix(uSunColor, uAccentColor, ringStripes) * (1.0 - ringBand / 0.085) * 0.48;
      }
    } else if (uPresetMode == 5) {
      // Aurora Prismatic Day: Shimmering aurora borealis curtains overhead
      float curtain = sin(dir.x * 14.0 + sin(dir.z * 8.0 + uTime * 0.4) * 2.5 + uTime * 0.35);
      float auroraMask = smoothstep(0.2, 0.95, curtain) * smoothstep(0.15, 0.75, dir.y);
      skyCol += mix(uAccentColor, uSunColor, sin(dir.z * 6.0 + uTime) * 0.5 + 0.5) * auroraMask * 0.45;
    }

    gl_FragColor = vec4(skyCol, 1.0);
  }
`;

export interface TimelineProceduralLootCacheNode {
  item: DimensionalItemDefinition;
  group: THREE.Group;
  mountGroup: THREE.Group;
  position: THREE.Vector3;
  collected: boolean;
  respawnTimer: number;
}

export class AbsurdTimelineWorldDecoratorRig {
  public rootGroup = new THREE.Group();
  private atmosphereDomeMesh: THREE.Mesh | null = null;
  private atmosphereShaderMat: THREE.ShaderMaterial | null = null;
  private skyPhenomenonGroup = new THREE.Group();
  private relicsGroup = new THREE.Group();
  private instancedBiologyGroup = new THREE.Group();
  private lootCachesGroup = new THREE.Group();
  public lootCaches: TimelineProceduralLootCacheNode[] = [];
  private activeCoordinateCode = '';

  constructor() {
    this.rootGroup.name = 'absurd-timeline-world-decorator-rig';
    this.buildAtmosphereSkyDome();
    this.rootGroup.add(this.skyPhenomenonGroup);
    this.rootGroup.add(this.relicsGroup);
    this.rootGroup.add(this.instancedBiologyGroup);
    this.rootGroup.add(this.lootCachesGroup);
  }

  private buildAtmosphereSkyDome(): void {
    const domeGeo = new THREE.SphereGeometry(215, 36, 24);
    this.atmosphereShaderMat = new THREE.ShaderMaterial({
      vertexShader: VIBRANT_ATMOSPHERE_VERTEX_SHADER,
      fragmentShader: VIBRANT_ATMOSPHERE_FRAGMENT_SHADER,
      uniforms: {
        uZenithColor: { value: new THREE.Color('#0284c7') },
        uHorizonColor: { value: new THREE.Color('#7dd3fc') },
        uSunColor: { value: new THREE.Color('#fef08a') },
        uAccentColor: { value: new THREE.Color('#2dd4bf') },
        uTime: { value: 0 },
        uPresetMode: { value: 0 },
      },
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.atmosphereShaderMat.userData.sharedPooledMaterial = true;
    domeGeo.userData.sharedPooledGeometry = true;
    this.atmosphereDomeMesh = new THREE.Mesh(domeGeo, this.atmosphereShaderMat);
    this.atmosphereDomeMesh.renderOrder = -10;
    this.rootGroup.add(this.atmosphereDomeMesh);
  }

  public rebuildForTimeline(
    timeline: AbsurdTimelineSpec,
    world: ManifoldWorldSpec,
    evalGroundY: (x: number, z: number) => number
  ): DimensionalItemDefinition[] {
    // Dispose all previous timeline meshes/materials to guarantee zero GPU memory leaks
    disposeObject3DResources(this.skyPhenomenonGroup);
    disposeObject3DResources(this.relicsGroup);
    disposeObject3DResources(this.instancedBiologyGroup);
    disposeObject3DResources(this.lootCachesGroup);
    this.skyPhenomenonGroup.clear();
    this.relicsGroup.clear();
    this.instancedBiologyGroup.clear();
    this.lootCachesGroup.clear();
    this.lootCaches = [];

    this.activeCoordinateCode = timeline.coordinateCode;

    // 0. Update Vibrant Atmospheric Sky Dome Uniforms
    if (this.atmosphereShaderMat) {
      this.atmosphereShaderMat.uniforms.uZenithColor.value.set(
        timeline.skyZenithHex || '#0284c7'
      );
      this.atmosphereShaderMat.uniforms.uHorizonColor.value.set(
        timeline.skyHorizonHex || '#7dd3fc'
      );
      this.atmosphereShaderMat.uniforms.uSunColor.value.set(
        timeline.sunDiscHex || '#fef08a'
      );
      this.atmosphereShaderMat.uniforms.uAccentColor.value.set(
        timeline.accentHex || '#2dd4bf'
      );
      const presetMap: Record<TimelineAtmospherePreset, number> = {
        'daylight-azure-scatter': 0,
        'sunset-amber-crimson': 1,
        'bioluminescent-emerald-dusk': 2,
        'gas-giant-ringed-teal': 3,
        'binary-violet-magenta': 4,
        'aurora-prismatic-day': 5,
      };
      this.atmosphereShaderMat.uniforms.uPresetMode.value =
        presetMap[timeline.atmospherePreset] ?? 0;
    }

    // 1. Build Bizarre Sky Phenomenon at y = 58..72m
    this.buildSkyPhenomenon(timeline);

    // 2. Build 6 Satirical Civilization Relics on the terrain
    this.buildSatiricalRelics(timeline, evalGroundY);

    // 3. Build GPU-Instanced Absurd Biology Clusters (<= 48 instances, single draw call per part)
    this.buildInstancedBiologyClusters(timeline, evalGroundY);

    // 4. Synthesize & Spawn 4 Interactive 3D Procedural Timeline Loot Caches on the terrain
    const synthesizedItems = synthesizeProceduralTimelineItems(timeline);
    this.buildProceduralTimelineLootCaches(
      timeline,
      synthesizedItems,
      evalGroundY
    );
    return synthesizedItems;
  }

  private buildProceduralTimelineLootCaches(
    timeline: AbsurdTimelineSpec,
    items: DimensionalItemDefinition[],
    evalGroundY: (x: number, z: number) => number
  ): void {
    const plinthMat = new THREE.MeshPhysicalMaterial({
      color: '#0f172a',
      metalness: 0.85,
      roughness: 0.2,
      clearcoat: 0.7,
    });
    const beaconMat = new THREE.MeshBasicMaterial({
      color: timeline.accentHex,
      transparent: true,
      opacity: 0.75,
    });

    items.forEach((item, idx) => {
      const ang = (idx / items.length) * Math.PI * 2 + 0.85;
      const dist = 13.5 + (idx % 2) * 6.5;
      const lx = Math.cos(ang) * dist;
      const lz = Math.sin(ang) * dist;
      const ly = evalGroundY(lx, lz);

      const cacheGroup = new THREE.Group();
      cacheGroup.position.set(lx, ly, lz);

      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.68, 0.88, 0.9, 12),
        plinthMat
      );
      pedestal.position.y = 0.45;
      cacheGroup.add(pedestal);

      const holoRing = new THREE.Mesh(
        new THREE.RingGeometry(0.55, 0.72, 24),
        beaconMat
      );
      holoRing.rotation.x = -Math.PI / 2;
      holoRing.position.y = 0.92;
      cacheGroup.add(holoRing);

      const mountGroup = new THREE.Group();
      mountGroup.position.set(0, 1.55, 0);
      const itemMesh = buildCompositeItem3DMesh(item, false);
      itemMesh.scale.setScalar(1.25);
      mountGroup.add(itemMesh);
      cacheGroup.add(mountGroup);

      this.lootCachesGroup.add(cacheGroup);
      this.lootCaches.push({
        item,
        group: cacheGroup,
        mountGroup,
        position: new THREE.Vector3(lx, ly, lz),
        collected: false,
        respawnTimer: 0,
      });
    });
  }

  private buildSkyPhenomenon(timeline: AbsurdTimelineSpec): void {
    this.skyPhenomenonGroup.position.set(0, 62, -48);

    const primaryMat = new THREE.MeshStandardMaterial({
      color: timeline.portalFluidPrimaryHex,
      emissive: timeline.portalFluidPrimaryHex,
      emissiveIntensity: 0.95,
      roughness: 0.25,
    });
    const secondaryMat = new THREE.MeshStandardMaterial({
      color: timeline.portalFluidSecondaryHex,
      emissive: timeline.portalFluidSecondaryHex,
      emissiveIntensity: 0.85,
      roughness: 0.3,
    });

    switch (timeline.skyPhenomenon) {
      case 'screaming-cyber-sun': {
        // Iconic Screaming Sun: Golden-orange solar sphere + wide-open screaming mouth cavity + 2 bulging eyes + 12 corona spikes
        const sunBody = new THREE.Mesh(
          new THREE.SphereGeometry(9.5, 24, 24),
          new THREE.MeshStandardMaterial({
            color: '#facc15',
            emissive: '#f97316',
            emissiveIntensity: 1.1,
          })
        );
        this.skyPhenomenonGroup.add(sunBody);

        // Bulging Left & Right Eyes
        for (const side of [-1, 1]) {
          const sclera = new THREE.Mesh(
            new THREE.SphereGeometry(2.1, 14, 14),
            new THREE.MeshBasicMaterial({ color: '#ffffff' })
          );
          sclera.position.set(side * 3.4, 2.8, 8.2);
          this.skyPhenomenonGroup.add(sclera);

          const pupil = new THREE.Mesh(
            new THREE.SphereGeometry(0.85, 10, 10),
            new THREE.MeshBasicMaterial({ color: '#020617' })
          );
          pupil.position.set(side * 3.4, 2.8, 9.9);
          this.skyPhenomenonGroup.add(pupil);
        }

        // Oscillating Screaming Jaw Cavity
        const mouthGroup = new THREE.Group();
        mouthGroup.position.set(0, -2.2, 8.4);
        mouthGroup.userData.isScreamingMouth = true;
        const mouthCavity = new THREE.Mesh(
          new THREE.CylinderGeometry(3.2, 2.6, 2.2, 16),
          new THREE.MeshBasicMaterial({ color: '#450a0a' })
        );
        mouthCavity.rotation.x = Math.PI / 2;
        mouthGroup.add(mouthCavity);
        this.skyPhenomenonGroup.add(mouthGroup);

        // 12 Solar Flare Corona Spikes
        const spikeGeo = new THREE.ConeGeometry(1.6, 6.5, 6);
        for (let i = 0; i < 12; i++) {
          const ang = (i / 12) * Math.PI * 2;
          const spike = new THREE.Mesh(spikeGeo, secondaryMat);
          spike.position.set(Math.cos(ang) * 11.5, Math.sin(ang) * 11.5, 0);
          spike.rotation.z = ang - Math.PI * 0.5;
          this.skyPhenomenonGroup.add(spike);
        }
        break;
      }

      case 'omniscient-eyeball-nebula': {
        const eyeball = new THREE.Mesh(
          new THREE.SphereGeometry(10.5, 24, 24),
          new THREE.MeshStandardMaterial({
            color: '#f8fafc',
            emissive: '#38bdf8',
            emissiveIntensity: 0.25,
          })
        );
        this.skyPhenomenonGroup.add(eyeball);

        const iris = new THREE.Mesh(
          new THREE.CylinderGeometry(4.8, 4.8, 1.2, 24),
          primaryMat
        );
        iris.rotation.x = Math.PI / 2;
        iris.position.z = 9.8;
        this.skyPhenomenonGroup.add(iris);

        const pupil = new THREE.Mesh(
          new THREE.CylinderGeometry(2.1, 2.1, 1.4, 20),
          new THREE.MeshBasicMaterial({ color: '#020617' })
        );
        pupil.rotation.x = Math.PI / 2;
        pupil.position.z = 10.1;
        this.skyPhenomenonGroup.add(pupil);

        // 8 Optic Nerve Tendrils trailing behind
        for (let t = 0; t < 8; t++) {
          const ang = (t / 8) * Math.PI * 2;
          const nerve = new THREE.Mesh(
            new THREE.CylinderGeometry(0.45, 0.15, 16, 8),
            secondaryMat
          );
          nerve.position.set(
            Math.cos(ang) * 7.5,
            Math.sin(ang) * 7.5,
            -9.0
          );
          nerve.rotation.x = 0.4;
          this.skyPhenomenonGroup.add(nerve);
        }
        break;
      }

      case 'giant-floating-heads-sky': {
        // 3 Colossal Cromulon Monolith Heads observing the world
        for (let h = -1; h <= 1; h++) {
          const headGroup = new THREE.Group();
          headGroup.position.set(h * 26, Math.abs(h) * -4, Math.abs(h) * 10);
          headGroup.rotation.y = -h * 0.35;
          headGroup.userData.isFloatingSkyHead = true;
          headGroup.userData.headIndex = h;

          const cranium = new THREE.Mesh(
            new THREE.DodecahedronGeometry(6.8, 1),
            new THREE.MeshStandardMaterial({
              color: '#eab308',
              emissive: '#ca8a04',
              emissiveIntensity: 0.45,
              roughness: 0.35,
              metalness: 0.6,
            })
          );
          cranium.scale.set(0.88, 1.35, 0.92);
          headGroup.add(cranium);

          const brow = new THREE.Mesh(
            new THREE.BoxGeometry(7.5, 1.4, 3.2),
            primaryMat
          );
          brow.position.set(0, 2.4, 5.2);
          headGroup.add(brow);

          const mouthBar = new THREE.Mesh(
            new THREE.BoxGeometry(5.2, 1.2, 2.4),
            secondaryMat
          );
          mouthBar.position.set(0, -3.2, 5.4);
          headGroup.add(mouthBar);

          this.skyPhenomenonGroup.add(headGroup);
        }
        break;
      }

      case 'clockwork-citadel-gear-rings': {
        for (let g = 0; g < 4; g++) {
          const gearGroup = new THREE.Group();
          gearGroup.userData.isSkyGear = true;
          gearGroup.userData.gearSpeed = (g % 2 === 0 ? 1 : -1) * (0.4 + g * 0.15);
          const radius = 8 + g * 4.5;
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(radius, 0.65, 8, 32),
            g % 2 === 0 ? primaryMat : secondaryMat
          );
          gearGroup.add(ring);

          const toothGeo = new THREE.BoxGeometry(1.4, 2.2, 1.2);
          for (let k = 0; k < 12; k++) {
            const a = (k / 12) * Math.PI * 2;
            const tooth = new THREE.Mesh(toothGeo, primaryMat);
            tooth.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0);
            tooth.rotation.z = a;
            gearGroup.add(tooth);
          }
          this.skyPhenomenonGroup.add(gearGroup);
        }
        break;
      }

      default: {
        // Boiling Portal-Fluid Vortex or Fractured Tesseract Mirrors
        for (let r = 0; r < 5; r++) {
          const vortexRing = new THREE.Mesh(
            new THREE.TorusKnotGeometry(4.5 + r * 2.8, 0.45, 48, 8, 2, 3),
            r % 2 === 0 ? primaryMat : secondaryMat
          );
          vortexRing.userData.isSkyGear = true;
          vortexRing.userData.gearSpeed = (r % 2 === 0 ? 1 : -1) * 0.65;
          this.skyPhenomenonGroup.add(vortexRing);
        }
        break;
      }
    }
  }

  private buildSatiricalRelics(
    timeline: AbsurdTimelineSpec,
    evalGroundY: (x: number, z: number) => number
  ): void {
    const primaryMat = new THREE.MeshPhysicalMaterial({
      color: timeline.portalFluidPrimaryHex,
      emissive: timeline.portalFluidPrimaryHex,
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.65,
    });
    const secondaryMat = new THREE.MeshPhysicalMaterial({
      color: timeline.portalFluidSecondaryHex,
      emissive: timeline.portalFluidSecondaryHex,
      emissiveIntensity: 0.55,
      roughness: 0.3,
      metalness: 0.4,
    });

    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 + 0.42;
      const dist = 20 + (i % 2) * 11;
      const rx = Math.cos(ang) * dist;
      const rz = Math.sin(ang) * dist;
      const ry = evalGroundY(rx, rz);

      const relicGroup = new THREE.Group();
      relicGroup.position.set(rx, ry, rz);
      relicGroup.scale.setScalar(timeline.propScaleMultiplier);

      if (timeline.civilizationRelic === 'plumbus-synthesis-mega-vats') {
        // Sculpted Giant Plumbus Monument: Bulbous Chumble base + Floob torus + Dinglebop crown
        const basePedestal = new THREE.Mesh(
          new THREE.CylinderGeometry(1.4, 1.8, 0.8, 14),
          secondaryMat
        );
        basePedestal.position.y = 0.4;
        relicGroup.add(basePedestal);

        const floob = new THREE.Mesh(
          new THREE.SphereGeometry(1.15, 16, 16),
          new THREE.MeshPhysicalMaterial({
            color: '#f472b6',
            roughness: 0.35,
            clearcoat: 0.8,
          })
        );
        floob.position.y = 1.65;
        relicGroup.add(floob);

        const grodusShaft = new THREE.Mesh(
          new THREE.CylinderGeometry(0.42, 0.58, 2.2, 12),
          primaryMat
        );
        grodusShaft.position.y = 3.1;
        relicGroup.add(grodusShaft);

        const chumbleCrown = new THREE.Mesh(
          new THREE.TorusGeometry(0.85, 0.24, 10, 24),
          secondaryMat
        );
        chumbleCrown.rotation.x = Math.PI / 2;
        chumbleCrown.position.y = 4.2;
        relicGroup.add(chumbleCrown);
      } else if (timeline.civilizationRelic === 'meeseeks-fulfillment-pylons') {
        // Blue Task-Fulfillment Box with oversized top button & glowing plasma arcs
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(2.2, 2.2, 2.2),
          new THREE.MeshPhysicalMaterial({
            color: '#38bdf8',
            emissive: '#0284c7',
            emissiveIntensity: 0.4,
            roughness: 0.2,
          })
        );
        box.position.y = 1.1;
        relicGroup.add(box);

        const button = new THREE.Mesh(
          new THREE.CylinderGeometry(0.65, 0.75, 0.45, 16),
          primaryMat
        );
        button.position.y = 2.4;
        relicGroup.add(button);
      } else {
        // Citadel Bureaucracy Obelisk / Blips & Chitz Arcade Spire / Cronenberg Alembic
        const spire = new THREE.Mesh(
          new THREE.CylinderGeometry(0.65, 1.55, 4.8, 8),
          primaryMat
        );
        spire.position.y = 2.4;
        relicGroup.add(spire);

        const halo = new THREE.Mesh(
          new THREE.TorusGeometry(1.65, 0.14, 8, 24),
          secondaryMat
        );
        halo.position.y = 3.8;
        halo.userData.isRelicSpinner = true;
        relicGroup.add(halo);
      }

      this.relicsGroup.add(relicGroup);
    }
  }

  private buildInstancedBiologyClusters(
    timeline: AbsurdTimelineSpec,
    evalGroundY: (x: number, z: number) => number
  ): void {
    const instanceCount = 36;
    const dummy = new THREE.Object3D();

    if (timeline.biologyArchetype === 'everything-on-a-cob') {
      // Instanced Giant Cob Stalks & Golden Kernel Rings across the terrain!
      const stalkGeo = new THREE.CylinderGeometry(0.42, 0.52, 3.2, 10);
      const kernelGeo = new THREE.TorusGeometry(0.54, 0.22, 8, 14);
      kernelGeo.rotateX(Math.PI / 2);

      const stalkMat = new THREE.MeshStandardMaterial({
        color: '#fef08a',
        roughness: 0.4,
      });
      const kernelMat = new THREE.MeshStandardMaterial({
        color: '#eab308',
        emissive: '#ca8a04',
        emissiveIntensity: 0.45,
        roughness: 0.25,
      });

      const stalkInst = new THREE.InstancedMesh(
        stalkGeo,
        stalkMat,
        instanceCount
      );
      const kernelInst = new THREE.InstancedMesh(
        kernelGeo,
        kernelMat,
        instanceCount * 3
      );

      let kIdx = 0;
      for (let i = 0; i < instanceCount; i++) {
        const ang = (i / instanceCount) * Math.PI * 2 + seededFloat(timeline.seedHash, i);
        const dist = 10 + seededFloat(timeline.seedHash, i + 100) * 44;
        const x = Math.cos(ang) * dist;
        const z = Math.sin(ang) * dist;
        const y = evalGroundY(x, z);
        const s =
          (0.65 + seededFloat(timeline.seedHash, i + 200) * 0.9) *
          timeline.propScaleMultiplier;

        dummy.position.set(x, y + 1.5 * s, z);
        dummy.rotation.set(
          (seededFloat(timeline.seedHash, i + 300) - 0.5) * 0.3,
          ang,
          (seededFloat(timeline.seedHash, i + 400) - 0.5) * 0.3
        );
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        stalkInst.setMatrixAt(i, dummy.matrix);

        for (let ring = 0; ring < 3; ring++) {
          dummy.position.set(x, y + (0.7 + ring * 0.85) * s, z);
          dummy.updateMatrix();
          kernelInst.setMatrixAt(kIdx++, dummy.matrix);
        }
      }
      stalkInst.instanceMatrix.needsUpdate = true;
      kernelInst.instanceMatrix.needsUpdate = true;
      this.instancedBiologyGroup.add(stalkInst);
      this.instancedBiologyGroup.add(kernelInst);
    } else {
      // Instanced Cronenberg Flesh Nodes / Fractal Crustacean Spires / Screaming Flora
      const geo =
        timeline.biologyArchetype === 'cronenberg-flesh-mutants'
          ? new THREE.DodecahedronGeometry(0.85, 1)
          : timeline.biologyArchetype === 'recursive-fractal-crustaceans'
          ? new THREE.OctahedronGeometry(0.95, 0)
          : new THREE.IcosahedronGeometry(0.8, 1);

      const mat = new THREE.MeshPhysicalMaterial({
        color: timeline.portalFluidPrimaryHex,
        emissive: timeline.accentHex,
        emissiveIntensity: 0.55,
        roughness: 0.25,
        metalness: 0.45,
        clearcoat: 0.8,
      });

      const inst = new THREE.InstancedMesh(geo, mat, instanceCount);
      for (let i = 0; i < instanceCount; i++) {
        const ang = (i / instanceCount) * Math.PI * 2 + seededFloat(timeline.seedHash, i);
        const dist = 11 + seededFloat(timeline.seedHash, i + 50) * 45;
        const x = Math.cos(ang) * dist;
        const z = Math.sin(ang) * dist;
        const y = evalGroundY(x, z);
        const s =
          (0.6 + seededFloat(timeline.seedHash, i + 90) * 0.95) *
          timeline.propScaleMultiplier;

        dummy.position.set(x, y + 0.75 * s, z);
        dummy.rotation.set(i * 0.4, ang, i * 0.25);
        dummy.scale.set(s, s * 1.45, s);
        dummy.updateMatrix();
        inst.setMatrixAt(i, dummy.matrix);
      }
      inst.instanceMatrix.needsUpdate = true;
      this.instancedBiologyGroup.add(inst);
    }
  }

  public update(
    nowSec: number,
    playerPos: THREE.Vector3,
    dt: number = 0.016,
    onCollectTimelineItem?: (item: DimensionalItemDefinition) => void
  ): void {
    if (this.atmosphereDomeMesh) {
      this.atmosphereDomeMesh.position.set(playerPos.x, playerPos.y, playerPos.z);
    }
    if (this.atmosphereShaderMat) {
      this.atmosphereShaderMat.uniforms.uTime.value = nowSec;
    }

    // Keep Sky Phenomenon anchored relative to player XZ so it looms on the horizon
    this.skyPhenomenonGroup.position.x = playerPos.x * 0.65;
    this.skyPhenomenonGroup.position.z = playerPos.z * 0.65 - 52;

    this.skyPhenomenonGroup.traverse((ch) => {
      if (ch.userData.isScreamingMouth) {
        const screamOpen = 0.85 + Math.abs(Math.sin(nowSec * 6.5)) * 0.95;
        ch.scale.set(1.0, screamOpen, 1.0);
      }
      if (ch.userData.isSkyGear) {
        ch.rotation.z = nowSec * (ch.userData.gearSpeed ?? 0.5);
      }
      if (ch.userData.isFloatingSkyHead) {
        const idx = ch.userData.headIndex ?? 0;
        ch.position.y =
          Math.abs(idx) * -4 + Math.sin(nowSec * 1.4 + idx) * 1.8;
      }
    });

    this.relicsGroup.traverse((ch) => {
      if (ch.userData.isRelicSpinner) {
        ch.rotation.x = nowSec * 1.5;
        ch.rotation.y = nowSec * 1.9;
      }
    });

    // Animate & check collection for 3D Procedural Timeline Loot Caches
    for (let i = 0; i < this.lootCaches.length; i++) {
      const cache = this.lootCaches[i];
      if (cache.collected) {
        cache.respawnTimer -= dt;
        if (cache.respawnTimer <= 0) {
          cache.collected = false;
          cache.mountGroup.visible = true;
        }
        continue;
      }
      cache.mountGroup.rotation.y = nowSec * 1.65 + i * 0.8;
      cache.mountGroup.position.y = 1.55 + Math.sin(nowSec * 2.4 + i) * 0.14;

      const d = Math.hypot(
        playerPos.x - cache.position.x,
        playerPos.z - cache.position.z
      );
      if (d < 3.2 && Math.abs(playerPos.y - cache.position.y) < 4.5) {
        cache.collected = true;
        cache.respawnTimer = 28.0;
        cache.mountGroup.visible = false;
        onCollectTimelineItem?.(cache.item);
      }
    }
  }
}

// ============================================================================
// 3. SENTIENT VOID BALL SYMBIOTE TENDRILS & ACTIVE PHYSICS / MUTATION BEAMS
// ============================================================================

export class SentientVoidBallSymbioteRig {
  public worldBeamGroup = new THREE.Group();
  private beamCylinder: THREE.Mesh;
  private beamImpactSphere: THREE.Mesh;
  private beamActiveTimer = 0;
  private tendrilLashCooldown = 0;
  private passiveSynthesisTimer = 0;

  constructor() {
    this.worldBeamGroup.name = 'void-ball-active-physics-mutation-beam';
    const cylGeo = new THREE.CylinderGeometry(0.08, 0.22, 1.0, 12);
    cylGeo.rotateX(Math.PI / 2);
    cylGeo.translate(0, 0, 0.5);
    const beamMat = new THREE.MeshBasicMaterial({
      color: '#22c55e',
      transparent: true,
      opacity: 0.85,
    });
    this.beamCylinder = new THREE.Mesh(cylGeo, beamMat);
    this.worldBeamGroup.add(this.beamCylinder);

    this.beamImpactSphere = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.55, 1),
      new THREE.MeshBasicMaterial({
        color: '#a3e635',
        wireframe: true,
      })
    );
    this.worldBeamGroup.add(this.beamImpactSphere);
    this.worldBeamGroup.visible = false;
  }

  /**
   * Attaches or updates Sentient Void Ball Symbiote Tendrils & Ocular Iris on the Left-Hand Void Ball group
   */
  public syncSymbioteOnHandRig(
    handGroup: THREE.Group | null,
    symbioteTier: number,
    nowSec: number
  ): void {
    if (!handGroup) return;
    const voidBall = handGroup.userData.voidBallGroup as
      | THREE.Group
      | undefined;
    if (!voidBall) return;

    let symbioteGroup = voidBall.getObjectByName(
      'sentient-symbiote-attachment'
    ) as THREE.Group | undefined;

    if (!symbioteGroup) {
      symbioteGroup = new THREE.Group();
      symbioteGroup.name = 'sentient-symbiote-attachment';

      // Watching Symbiote Eye in the center of the Void Ball
      const eyeIris = new THREE.Mesh(
        new THREE.SphereGeometry(0.032, 10, 10),
        new THREE.MeshBasicMaterial({ color: '#f43f5e' })
      );
      eyeIris.position.set(0, 0, 0.045);
      symbioteGroup.add(eyeIris);

      // 6 Articulated Biomechanical Tendrils
      const tendrilMat = new THREE.MeshStandardMaterial({
        color: '#be123c',
        emissive: '#f43f5e',
        emissiveIntensity: 0.85,
        roughness: 0.25,
      });
      const segGeo = new THREE.ConeGeometry(0.014, 0.14, 6);
      for (let t = 0; t < 6; t++) {
        const tPivot = new THREE.Group();
        const ang = (t / 6) * Math.PI * 2;
        tPivot.position.set(Math.cos(ang) * 0.04, Math.sin(ang) * 0.04, 0);
        tPivot.rotation.z = ang;
        tPivot.userData.tendrilIndex = t;
        const cone = new THREE.Mesh(segGeo, tendrilMat);
        cone.position.y = 0.07;
        tPivot.add(cone);
        symbioteGroup.add(tPivot);
      }
      voidBall.add(symbioteGroup);
    }

    symbioteGroup.visible = symbioteTier >= 1;
    const activeTendrilCount = symbioteTier >= 4 ? 6 : symbioteTier >= 2 ? 4 : 3;

    symbioteGroup.children.forEach((ch) => {
      const tIdx = ch.userData.tendrilIndex;
      if (typeof tIdx === 'number') {
        ch.visible = tIdx < activeTendrilCount;
        ch.rotation.x =
          0.35 + Math.sin(nowSec * 5.2 + tIdx * 1.1) * 0.45;
      }
    });
  }

  /**
   * Fires the Left-Hand Void Ball's Active Gravity, Time-Dilation, or Matter-Mutation Beam (`[Key Z]`)!
   */
  public fireActiveVoidBeam(params: {
    playerPos: THREE.Vector3;
    playerYaw: number;
    playerPitch: number;
    entities: ArticulatedRagdollEntity[];
    voidState: VoidBallEvolutionState;
    onHarvestAnomaly: (resId: VoidAnomalyResourceId, amount: number) => void;
    onBannerMessage: (msg: string) => void;
  }): void {
    const {
      playerPos,
      playerYaw,
      playerPitch,
      entities,
      voidState,
      onHarvestAnomaly,
      onBannerMessage,
    } = params;

    const beamMode: VoidBallActiveBeamMode = voidState.activeBeamMode;
    const beamTier = voidState.branchTiers['active-physics-mutation-beams'] ?? 1;
    const forward = new THREE.Vector3(
      -Math.sin(playerYaw) * Math.cos(playerPitch),
      Math.sin(playerPitch),
      -Math.cos(playerYaw) * Math.cos(playerPitch)
    ).normalize();

    const startOrigin = playerPos
      .clone()
      .add(new THREE.Vector3(0, 1.42, 0))
      .addScaledVector(forward, 0.6);

    // Find closest entity along aim cone or within 18m
    let hitEntity: ArticulatedRagdollEntity | null = null;
    let bestScore = Infinity;
    for (const ent of entities) {
      const toEnt = ent.particles[1].pos.clone().sub(startOrigin);
      const dist = toEnt.length();
      if (dist <= 22.0) {
        const dot = toEnt.normalize().dot(forward);
        if (dot > 0.65 || dist < 5.5) {
          const score = dist * (1.5 - dot);
          if (score < bestScore) {
            bestScore = score;
            hitEntity = ent;
          }
        }
      }
    }

    const endPos = hitEntity
      ? hitEntity.particles[1].pos.clone()
      : startOrigin.clone().addScaledVector(forward, 15.0);

    const beamLen = Math.max(1.0, startOrigin.distanceTo(endPos));
    this.worldBeamGroup.position.copy(startOrigin);
    this.worldBeamGroup.lookAt(endPos);
    this.beamCylinder.scale.set(1, 1, beamLen);
    this.beamImpactSphere.position.set(0, 0, beamLen);

    const beamHex =
      beamMode === 'gravity-inversion-beam'
        ? '#38bdf8'
        : beamMode === 'temporal-dilation-beam'
        ? '#eab308'
        : '#22c55e';
    (this.beamCylinder.material as THREE.MeshBasicMaterial).color.set(beamHex);
    (this.beamImpactSphere.material as THREE.MeshBasicMaterial).color.set(
      beamHex
    );
    this.worldBeamGroup.visible = true;
    this.beamActiveTimer = 0.45;

    if (hitEntity) {
      if (beamMode === 'gravity-inversion-beam') {
        hitEntity.applyKineticImpulse(
          new THREE.Vector3(0, 16.5 + beamTier * 3.5, 0),
          0.85
        );
        hitEntity.activeBehaviorLabel = 'Zero-G Void Beam Levitation';
        onHarvestAnomaly('chrono-paradox-shard', 1);
        onBannerMessage(
          `🌀 VOID GRAVITY-INVERSION BEAM! Levitated ${hitEntity.blueprint.name} into Zero-G (+1 Paradox Shard)`
        );
      } else if (beamMode === 'temporal-dilation-beam') {
        hitEntity.currentStiffness = 0.98;
        for (const p of hitEntity.particles) {
          p.prevPos.copy(p.pos);
        }
        hitEntity.activeBehaviorLabel = 'Temporal Stasis Bubble (γ = 0.05×)';
        onHarvestAnomaly('chrono-paradox-shard', 1);
        onBannerMessage(
          `⏳ TEMPORAL DILATION BEAM! Locked ${hitEntity.blueprint.name} in Causal Stasis (+1 Paradox Shard)`
        );
      } else {
        // Matter-Mutation Ray: Mutates the target entity's 3D scale & anatomy into an On-A-Cob or Cronenberg Chimera!
        const isCob =
          voidState.activeTimeline.biologyArchetype === 'everything-on-a-cob';
        hitEntity.rootGroup.traverse((ch) => {
          if (ch instanceof THREE.Mesh && ch !== hitEntity.selectionRing) {
            ch.scale.set(
              isCob ? 0.85 : 1.38,
              isCob ? 1.65 : 0.78,
              isCob ? 0.85 : 1.42
            );
            if (ch.material instanceof THREE.MeshStandardMaterial) {
              ch.material.color.set(isCob ? '#facc15' : '#f43f5e');
              ch.material.emissive.set(isCob ? '#ca8a04' : '#be123c');
              ch.material.emissiveIntensity = 0.75;
            }
          }
        });
        hitEntity.applyKineticImpulse(
          forward.clone().multiplyScalar(12).add(new THREE.Vector3(0, 8, 0)),
          0.65
        );
        hitEntity.blueprint.name = isCob
          ? `Cob-Kernelized ${hitEntity.blueprint.name.split(' ').slice(-1)[0]}`
          : `Cronenberg-Mutated ${hitEntity.blueprint.name.split(' ').slice(-1)[0]}`;
        hitEntity.activeBehaviorLabel = isCob
          ? 'Mutated into On-A-Cob Genome'
          : 'Mutated into Cronenberg Chimera';
        onHarvestAnomaly('portal-fluid-globule', 1);
        onHarvestAnomaly('symbiote-void-ichor', 1);
        onBannerMessage(
          `🧬 MATTER-MUTATION RAY! Spliced ${hitEntity.blueprint.name} (+1 Portal Fluid, +1 Symbiote Ichor)`
        );
      }
    } else {
      onBannerMessage(
        `⚡ Discharged Void Ball ${beamMode.replace(/-/g, ' ').toUpperCase()} (Aim at creatures to mutate or invert physics)`
      );
    }
  }

  public update(params: {
    dt: number;
    nowSec: number;
    playerPos: THREE.Vector3;
    entities: ArticulatedRagdollEntity[];
    voidState: VoidBallEvolutionState;
    fpLeftHandRig: THREE.Group | null;
    tpLeftHandRig: THREE.Group | null;
    onHarvestAnomaly: (resId: VoidAnomalyResourceId, amount: number) => void;
    onTendrilStrikeBanner: (msg: string) => void;
  }): void {
    const {
      dt,
      nowSec,
      playerPos,
      entities,
      voidState,
      fpLeftHandRig,
      tpLeftHandRig,
      onHarvestAnomaly,
      onTendrilStrikeBanner,
    } = params;

    if (this.beamActiveTimer > 0) {
      this.beamActiveTimer = Math.max(0, this.beamActiveTimer - dt);
      this.beamImpactSphere.rotation.y += dt * 12;
      this.beamImpactSphere.scale.setScalar(
        0.8 + Math.sin(nowSec * 30) * 0.35
      );
      if (this.beamActiveTimer <= 0) {
        this.worldBeamGroup.visible = false;
      }
    }

    const symbioteTier =
      voidState.branchTiers['sentient-symbiote-tendrils'] ?? 1;
    this.syncSymbioteOnHandRig(fpLeftHandRig, symbioteTier, nowSec);
    this.syncSymbioteOnHandRig(tpLeftHandRig, symbioteTier, nowSec);

    // Passive Void Anomaly Shard synthesis when Pocket-Sanctum Tier >= 2
    const sanctumTier =
      voidState.branchTiers['pocket-sanctum-containment'] ?? 1;
    if (sanctumTier >= 2) {
      this.passiveSynthesisTimer += dt;
      if (this.passiveSynthesisTimer >= 24.0) {
        this.passiveSynthesisTimer = 0;
        onHarvestAnomaly('portal-fluid-globule', 1);
      }
    }

    // Autonomous Symbiote Tendril Whip when Symbiote Tier >= 2 and an enemy approaches within 6.8m
    if (symbioteTier >= 2) {
      if (this.tendrilLashCooldown > 0) {
        this.tendrilLashCooldown = Math.max(0, this.tendrilLashCooldown - dt);
      } else {
        const closeHostile = entities.find(
          (e) => e.particles[1].pos.distanceTo(playerPos) < 6.4
        );
        if (closeHostile) {
          this.tendrilLashCooldown = symbioteTier >= 4 ? 3.2 : 5.5;
          const pushDir = closeHostile.particles[1].pos
            .clone()
            .sub(playerPos)
            .normalize();
          closeHostile.applyKineticImpulse(
            pushDir.multiplyScalar(18).add(new THREE.Vector3(0, 7.5, 0)),
            0.55
          );
          if (symbioteTier >= 3) {
            onHarvestAnomaly('symbiote-void-ichor', 1);
          }
          onTendrilStrikeBanner(
            `🦑 Sentient Void Symbiote lashed ${closeHostile.blueprint.name}${
              symbioteTier >= 3 ? ' & siphoned +1 Symbiote Ichor!' : '!'
            }`
          );
        }
      }
    }
  }
}
