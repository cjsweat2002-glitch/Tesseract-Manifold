export type CameraPerspective = 'first-person' | 'third-person' | 'orbital-director';

export type WorldTopologyArchetype =
  | 'non-euclidean-spires'
  | 'gyro-lattice-basin'
  | 'crystalline-hyper-mesa'
  | 'brutalist-pendulum-foundry'
  | 'biomech-coral-atoll'
  | 'quantum-basalt-trench';

export type EntityMorphology =
  | 'biped-construct'
  | 'quadruped-strider'
  | 'hexapod-arachnid'
  | 'tri-gyro-walker'
  | 'serpentine-leviathan'
  | 'avian-tensor-raptor'
  | 'seraph-cantilever'
  | 'reliquary-golem'
  | 'mycelial-dryad'
  | 'abyssal-cetacean';

export type GeometryCarvingStyle =
  | 'faceted-poly'
  | 'lathe-turbine'
  | 'tubular-exoskeleton'
  | 'hyper-ringed'
  | 'monolith-plate'
  | 'cathedral-ribbed'
  | 'nacre-filigree'
  | 'obsidian-reliquary';

export type EntityHeadStyle =
  | 'cyclops-prism'
  | 'binaural-horn'
  | 'gyro-core'
  | 'crowned-octa'
  | 'mandible-visor'
  | 'rose-window-oculus'
  | 'antler-crown'
  | 'seraph-halo-mask';

export type EntityDorsalApparatus =
  | 'solar-sail-fins'
  | 'cathedral-organ-pipes'
  | 'floating-halo-shards'
  | 'weeping-filament-veil'
  | 'gyro-astrolabe-wheel'
  | 'mycelial-spore-canopy';

export type EntityTailApparatus =
  | 'segmented-censer'
  | 'twin-ribbon-flukes'
  | 'pendulum-metronome'
  | 'helical-stinger';

export type EntityAuraOrbitStyle =
  | 'double-helix-glyphs'
  | 'toroidal-rose-shards'
  | 'epicyclic-planets'
  | 'weeping-ember-halo';

export type SkinTopologyStyle =
  | 'myofibril-striated-cuticle'
  | 'chromatophore-pulsing-dermis'
  | 'piezo-scale-imbrication'
  | 'subsurface-vascular-velvet'
  | 'chitin-suture-plates'
  | 'vitreous-tensegrity-membrane';

export type DamageGoreModality =
  | 'laceration-hemorrhage'
  | 'hydrostatic-viscera-rupture'
  | 'corrosive-ichor-dissolution'
  | 'calcified-marrow-shatter'
  | 'neural-synapse-hemolysis';

export type EcologicalDietRole =
  | 'symbiont-grazer'
  | 'hemophagic-stalker'
  | 'osteophagic-crusher'
  | 'viscera-siphon-leviathan'
  | 'synaptic-parasite-raptor';

export type PainPleasureNodeId =
  | 'agonal-hemorrhage-scream'
  | 'marrow-fracture-stridor'
  | 'corrosive-viscera-spasm'
  | 'homeostatic-purr-cadence'
  | 'predatory-satiation-thrill'
  | 'ecstatic-symbiotic-choir';

export type DimensionalGoreGenre =
  | 'ferro-mercury-coagulation'
  | 'bioluminescent-abyssal-ichor'
  | 'vitreous-amber-crystallization'
  | 'mycelial-spore-hemolymph'
  | 'hyperbolic-void-plasm';

export interface EntityGeneticDNA {
  dnaHash: string;
  generation: number;
  ancestralBlueprintId: string;
  parentName: string;
  exploredFrontierComplexId: string | null;
  torsoScaleMorph: [number, number, number]; // Formlike organic morphing [width, height, depth]
  limbElongationFactor: number; // 0.75 to 1.45
  elevationAdaptation: number; // 0.0 to 1.0 (vertical mountain/cave climbing adaptation)
  husbandryCognitionScore: number; // 0.0 to 1.0 (technological species farming intelligence)
  dnaNutritionalValue: number; // 0.0 to 1.0 (attracts organized predator pack raids when >= 0.65)
  mutationSummary: string;
}

export interface FrontierComplexSite {
  id: string;
  name: string;
  kind: 'biocomplex-nature-sanctuary' | 'tech-species-husbandry-paddock';
  x: number;
  y: number;
  z: number;
  radius: number;
  fertilityIndex: number; // 0.0 to 1.0 (triggers reproduction & differentiation when >= 0.58)
  techAdvancementLevel: number; // 1.0 to 5.0 (increases as tech-species farm other mobs smarter)
  farmedSpeciesCount: number;
  residentEntityIds: string[];
  isUnderPredatorPackRaid: boolean;
  packAttackPattern:
    | 'none'
    | 'flanking-pincer-pack'
    | 'high-ground-ambush-dive'
    | 'synaptic-herd-cull';
  primaryHex: string;
  accentHex: string;
  createdAt: number;
}

export interface WorldCaveNestComplex {
  id: string;
  builderEntityName: string;
  dnaHash: string;
  x: number;
  y: number;
  z: number;
  elevationTier: number; // Vertical elevation level where excavated
  caveRadius: number;
  nestEggCount: number;
  accentHex: string;
  createdAt: number;
}

export interface WorldFertilizedFloraPatch {
  id: string;
  depositorEntityName: string;
  x: number;
  y: number;
  z: number;
  nutrientPotency: number; // 0.5 to 2.0
  growthStage: number; // 0.2 to 1.5
  stemCount: number;
  primaryHex: string;
  sporeHex: string;
  createdAt: number;
}

export interface EvolutionaryLineageRecord {
  id: string;
  timestamp: number;
  worldSeed: number;
  worldName: string;
  entityName: string;
  ancestralName: string;
  generation: number;
  dna: EntityGeneticDNA;
  blueprint: EntityBlueprint;
  evolutionTrigger:
    | 'frontier-biome-migration'
    | 'tech-husbandry-domestication'
    | 'fertile-habitat-reproduction'
    | 'elevation-cave-adaptation'
    | 'predator-selection-pressure';
  loreSummary: string;
}

export interface InternalDamageTelemetry {
  structuralHealth: number; // 0.0 to 1.0
  activeBleedRate: number; // 0.0 to 1.0 (ichor/hemolymph liters/sec)
  exposedVisceraRatio: number; // 0.0 to 1.0 (herniated/exposed internal organs & ribs)
  severedTendonsCount: number; // 0 to 6 (limping/dragging limbs)
  dominantGoreType: DamageGoreModality | 'intact-homeostasis';
  goreGenre?: DimensionalGoreGenre;
  painPleasureGradient: number; // -1.0 (Agonal Trauma/Pain) to +1.0 (Satiation/Ecstatic Pleasure)
  activeVocalNodeLabel: string;
  ecologicalRole: EcologicalDietRole;
  predatorTargetName: string | null;
}

export interface SkinTopologyTelemetry {
  style: SkinTopologyStyle;
  styleLabel: string;
  epidermalTensionStrain: number; // 0.0 to 1.0 (stretching on outer joint curves)
  compressionWrinkleDepth: number; // 0.0 to 1.0 (accordion folding on inner joint bends)
  myofibrilBulgeRatio: number; // 0.0 to 1.0 (sarcomere contraction volume)
  subsurfaceVascularFlush: number; // 0.0 to 1.0 (capillary bioluminescence & blood/ichor flow)
  piloerectionScaleFlare: number; // 0.0 to 1.0 (dermal scale/pore bristling in wind/tethers)
  chromatophoreWaveHz: number; // Hz of traveling reaction-diffusion skin waves
  activeDermalInteraction: string;
}

export interface LexiconWordEntry {
  letter: string; // 'A' .. 'Z'
  word: string;
  etymologyDomain:
    | 'Cosmology'
    | 'Anatomy'
    | 'Chronology'
    | 'Architecture'
    | 'Elegy'
    | 'Metamaterial';
  coreDefinition: string;
  retrospectiveThesis: string; // How this word reinterprets other words in combination
  symbolicMotif: string;
  preferredMorphology: EntityMorphology;
  preferredCarving: GeometryCarvingStyle;
  preferredHead: EntityHeadStyle;
  dorsalApparatus: EntityDorsalApparatus;
  tailApparatus: EntityTailApparatus;
  auraOrbit: EntityAuraOrbitStyle;
  primaryHex: string;
  secondaryHex: string;
  glowHex: string;
  worldArchetypeAffinity: WorldTopologyArchetype;
}

export interface LexiconCombinatorialLore {
  triadWords: [string, string, string];
  synthesizedTitle: string;
  hypotheticalDepthNarrative: string;
  retrospectiveDialectic: string;
  anatomicalManifestation: string;
  architecturalMonumentName: string;
}

export type PlayableBodyArchetype =
  | 'original-construct'
  | 'chitin-nomad'
  | 'vitreous-diver'
  | 'mycelial-symbiont'
  | 'ossified-cantor'
  | 'ferro-seraph';

export type VoidElementType =
  | 'aether-singularity'
  | 'pyro-plasma'
  | 'abyssal-biolume'
  | 'chrono-amber'
  | 'ferro-vortex';

export interface PlayableCharacterSpec {
  id: string;
  name: string;
  title: string;
  bodyArchetype: PlayableBodyArchetype;
  biologicalTrait: string;
  humanEchoTrait: string;
  heightScale: number;
  collisionRadius: number;
  jumpImpulse: number;
  moveSpeedMultiplier: number;
  primaryColor: string;
  secondaryColor: string;
  visorOrOrganColor: string;
  voidOrbElement: VoidElementType;
  voidOrbColor: string;
  skinTopology?: SkinTopologyStyle;
}

export type ResourceId =
  | 'ferro-chitin'
  | 'biolum-mycelium'
  | 'calcified-memory'
  | 'vitreous-aether'
  | 'void-singularity-dust';

export interface ResourceMetadata {
  id: ResourceId;
  name: string;
  biologicalOrigin: string;
  color: string;
}

export interface TerrainExcavationSpot {
  x: number;
  z: number;
  radius: number;
  depth: number;
}

export type BuildingBlockShape =
  | 'pillar'
  | 'dome'
  | 'arch'
  | 'ring-conduit'
  | 'cantilever-deck'
  | 'spire-tip'
  | 'gyroid-minimal-shell'
  | 'metabolist-capsule-pod'
  | 'scarpa-ziggurat-stair'
  | 'tensegrity-strut-prism'
  | 'jansen-kinetic-rib'
  | 'calabi-yau-portal';

export type AstraArgonSynthesisParadigm =
  | 'astra-tectonic-grammar'
  | 'argon-implicit-morphogenesis'
  | 'astra-argon-dialectic-fusion';

export interface ArchitecturalWisdomBlueprintSpec {
  id: string;
  name: string;
  subtitle: string;
  paradigm: AstraArgonSynthesisParadigm;
  realWorldLineage: string;
  mathematicalSurfaceFormula: string;
  astraTectonicContribution: string;
  argonMorphogenesisContribution: string;
  architecturalWisdomPrinciple: string;
  accentHex: string;
  secondaryHex: string;
  presetBlueprint: BuildingPresetBlueprint;
}

export interface BuildingPresetBlock {
  id: string;
  gx: number; // grid X (-3 to +3)
  gy: number; // grid Y (0 to 5)
  gz: number; // grid Z (-3 to +3)
  shape: BuildingBlockShape;
  color: string;
  emissive: boolean;
}

export interface BuildingPresetBlueprint {
  id: string;
  name: string;
  description: string;
  blocks: BuildingPresetBlock[];
  cost: Partial<Record<ResourceId, number>>;
  createdAt: number;
  paradigm?: AstraArgonSynthesisParadigm;
  architecturalLineage?: string;
  mathematicalFormula?: string;
}

export interface PlacedWorldBuilding {
  id: string;
  presetId: string;
  presetName: string;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  blocks: BuildingPresetBlock[];
  paradigm?: AstraArgonSynthesisParadigm;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  category: 'augmentation' | 'dimensional-structure' | 'void-catalyst';
  description: string;
  cost: Partial<Record<ResourceId, number>>;
  effectType:
    | 'unlock-preset'
    | 'boost-jump-biology'
    | 'synthesize-void-dust'
    | 'spawn-symbiotic-entity'
    | 'place-active-preset';
}

export interface ProceduralPropModelSpec {
  id: string;
  name: string;
  category: 'monolith-spire' | 'gyro-resonator' | 'hyper-arch' | 'tesseract-cage' | 'pendulum-rig' | 'helix-conduit';
  seed: number;
  scale: [number, number, number];
  ringCount: number;
  twistAngle: number;
  radialSegments: number;
  kineticSpinSpeed: number;
  floatingAmplitude: number;
  primaryColor: string;
  emissiveColor: string;
  metalness: number;
  roughness: number;
}

export interface EntityBlueprint {
  id: string;
  name: string;
  worldId: string;
  seed: number;
  morphology: EntityMorphology;
  carvingStyle: GeometryCarvingStyle;
  legCount: number;
  limbLength: number;
  torsoScale: [number, number, number];
  headStyle: EntityHeadStyle;
  dorsalApparatus?: EntityDorsalApparatus;
  tailApparatus?: EntityTailApparatus;
  auraOrbit?: EntityAuraOrbitStyle;
  lexiconTriad?: [string, string, string];
  lexiconStoryLore?: string;
  baseStiffness: number;
  mass: number;
  strideFrequency: number;
  primaryColor: string;
  secondaryColor: string;
  jointGlowColor: string;
  biologicalOrganNote?: string;
  skinTopology?: SkinTopologyStyle;
  ecologicalRole?: EcologicalDietRole;
  specializedAttackDamage?: DamageGoreModality;
  geneticDNA?: EntityGeneticDNA;
}

export type WeatherPhenomenonType =
  | 'graviton-shear-squall'
  | 'coriolis-magneto-hail'
  | 'piezoelectric-crystal-dust'
  | 'thermobaric-cinder-ash'
  | 'biolum-spore-monsoon'
  | 'singularity-inversion-rain';

export type Cloud5DCanopyStyle =
  | 'clifford-torus-billows'
  | 'ferro-vortex-strata'
  | 'prismatic-vault-sheets'
  | 'furnace-anvil-cumulus'
  | 'synovial-medusa-canopy'
  | 'event-horizon-accretion';

export interface DimensionalWeatherSystemSpec {
  id: WeatherPhenomenonType;
  name: string;
  biomePhysicsLawName: string;
  biomePhysicsDescription: string;
  cloud5DStyle: Cloud5DCanopyStyle;
  cloud5DName: string;
  scentBreezeName: string;
  particlePrimaryColor: string;
  particleSecondaryColor: string;
  cloud5DColor: string;
  causticRayColor: string;
  scentBreezeColor: string;
  baseWindSpeed: number; // m/s
  fluidViscosity: number; // 0.05 to 0.85 atmospheric fluid drag/buoyancy
  vorticityTorque: number; // Coriolis / Lorentz swirl strength across the biome
  verticalDraftAmplitude: number; // Updraft/downdraft wave amplitude
}

export interface InterconnectednessTelemetry {
  activePlayerTethers: number;
  interEntityBonds: number;
  entrainmentCoherence: number; // 0.0 to 1.0
  slipstreamSpeedMultiplier: number; // 1.0 to 1.45
  footstepRootNodesCount: number;
  nearestTetheredEntityName: string | null;
  resonanceStateLabel: string;
}

export interface SpatialVoidAndBimTelemetry {
  isInsideVoidBall: boolean;
  voidBallDistance: number;
  focusedVoidStation: string;
  focusedStationTitle: string;
  focusedStationActionHint: string;
  activeBimLayer: string;
  activeRecipeIndex: number;
  soilBearingKPa: number;
  terrainSlopeDeg: number;
  windShearLoadKN: number;
  structuralIntegrityPct: number;
  constructionStageLabel: string;
}

export type ForeroomsDispositionLocus =
  | 'beyond-future-void'
  | 'below-foundation-bleed'
  | 'inside-present-continuum'
  | 'deeper-than-inside-nexus';

export type ContinuumEventActionType =
  | 'excavate-matter'
  | 'sinter-architecture'
  | 'weave-symbiotic-tether'
  | 'kinetic-impulse-wave'
  | 'dimension-phase-shift'
  | 'karmic-synthesis';

export interface ContinuumNovelEvent {
  id: string;
  timelineVersionId: string;
  worldSeed: number;
  worldName: string;
  actionType: ContinuumEventActionType;
  label: string;
  wCoord: number;
  position: [number, number, number];
  actionTimeSec: number;
  karmicResonanceWeight: number; // 0.1 to 2.0
  createdAt: number;
}

export type WorldspaceArtformArchetype =
  | 'chiral-chrono-helix'
  | 'karmic-tensegrity-loom'
  | 'biocomplex-gyroid-stele'
  | 'omniversal-substrate-obelisk';

export type LSystemWEvolutionRegime =
  | 'ana-rhizome-buttress'
  | 'continuum-cantilever-arbor'
  | 'kata-hyper-efflorescence';

export type LSystemVitalityPhase =
  | 'dimensional-wither'
  | 'homeostatic-arbor'
  | 'efflorescent-bloom';

export interface LSystemArtformGrammarSpec {
  variantName: string;
  axiom: string;
  primaryProductionRule: string;
  secondaryProductionRule: string;
  baseIterations: number;
  divergenceAngleDeg: number;
  goldenTorsionRatio: number;
  wRegimeSensitivity: number;
  wCoordinateInfluenceFactor?: number;
  branchAngleVarianceDeg?: number;
}

export interface WorldspaceProceduralArtform {
  id: string;
  title: string;
  archetype: WorldspaceArtformArchetype;
  parentSeedA: number;
  parentSeedB: number;
  karmicOriginSummary: string;
  x: number;
  z: number;
  scale: number;
  primaryColor: string;
  accentColor: string;
  wPhase: number;
  biocomplexityScore: number;
  lSystemGrammar?: LSystemArtformGrammarSpec;
  createdAt: number;
}

export interface BiocomplexInterstitialOrigin {
  id: string;
  interstitialSeed: number;
  title: string;
  parentVersionIdA: string;
  parentVersionIdB: string;
  parentSeedA: number;
  parentSeedB: number;
  parentNameA: string;
  parentNameB: string;
  boundaryBleedDifferential: number; // 0.0 to 1.0
  wMidpoint: number;
  karmicEventName: string;
  karmicMechanicDescription: string;
  emergentArtform: WorldspaceProceduralArtform;
  emergentEntityBlueprint: EntityBlueprint;
  manifestedInWorld: boolean;
  createdAt: number;
}

export interface ForeroomsTelemetry {
  activeSpelling: string;
  spellingMeaning: string;
  activeDisposition: ForeroomsDispositionLocus;
  dispositionLabel: string;
  fractionalMetricBleed: number; // 0 to 1
  matter5DTranslationRate: number; // 0 to 100%
  futureSurfaceEncodingPct: number; // 0 to 100%
  proceduralEvolutionEpoch: number; // Continuous evolutionary index
  dominantTesseractCell: string; // Which of the 8 cubic cells faces the observer's perspective vector
  seatedOtherInsidesCount: number; // Number of other Insides seated on the Deeper-Than-Inside locus
  perspectiveAngle4D: [number, number, number]; // [XW, YW, ZW] rotation angles in radians
  playerActionTimeSec?: number;
  biocomplexityIndex?: number;
  omniversalSubstratePct?: number; // 0 to 100% toward Omniversal Substrate Identification
  isOmniversallyIdentified?: boolean;
  encodedEventsCount?: number;
  interstitialOriginsCount?: number;
  spawnedArtformsCount?: number;
  activeLSystemRegimeLabel?: string;
  activeLSystemTotalBranches?: number;
  activeWCoordinateInfluenceFactor?: number;
  activeLSystemRecursionDepth?: number;
  activeBranchAngleVarianceDeg?: number;
  activeVitalityStateLabel?: string;
}

export type ConceptualNoveltySeedId =
  | 'grunge-typography-graffiti-dirt'
  | 'walk-in-void-bim-workforce'
  | 'lexicon-26-cubed-shapeshift'
  | 'manifold-anchor-crystallization'
  | 'forerooms-4rumes-metric-bleed'
  | 'karmic-artform-omniversal-substrate';

export interface ConceptualNoveltySeedSpec {
  id: ConceptualNoveltySeedId;
  promptOriginLabel: string;
  title: string;
  glyphSymbol: string;
  accentHex: string;
  behaviorMutation: {
    name: string;
    description: string;
    kinematicModulator: string;
  };
  modellingMutation: {
    name: string;
    description: string;
    topologySignature: string;
  };
  visualBoundaryMutation: {
    name: string;
    description: string;
    boundaryShaderMechanic: string;
  };
}

export interface POVFlowStateTelemetry {
  activeFlowState:
    | 'grounded-continuum-flow'
    | 'ballistic-apex-glide'
    | 'dimensional-slipstream-morph'
    | 'void-crucible-immersion';
  continuityBlendAlpha: number; // 0 to 1 smooth transition without popping
  elevationSpringResidual: number; // Smooth vertical suspension damper
  activeNoveltySeedId: ConceptualNoveltySeedId;
  activeNoveltyBoundaryLabel: string;
}

export interface DimensionalBleedTelemetry {
  activeBleedModeLabel: string;
  coalescenceStrength: number; // -1.0 (Non-Euclidean Schism Separation) to +1.0 (Viscous smin Coalescence Bleed)
  aestheticEvolutionStage: number; // 1.0 to 4.0 continuous morphogenesis
  activeBridgesCount: number;
  activeSchismShardsCount: number;
  nearestAnomaly: {
    archetype: string;
    title: string;
    originalityGradient: number;
    statusLabel: string;
    distance: number;
  } | null;
}

export interface BiomeWeatherTelemetry {
  weatherName: string;
  physicsLawName: string;
  cloud5DName: string;
  scentBreezeName: string;
  windSpeed: number;
  effectiveGravity: number;
  squallIntensity: number;
  activeEcologicalEvent: string;
  interconnectedness?: InterconnectednessTelemetry;
  structuralTelemetry?: SpatialVoidAndBimTelemetry;
  foreroomsTelemetry?: ForeroomsTelemetry;
  povFlowTelemetry?: POVFlowStateTelemetry;
  dimensionalBleedTelemetry?: DimensionalBleedTelemetry;
}

export interface ManifoldWorldSpec {
  id: string;
  name: string;
  subtitle: string;
  seed: number;
  manifoldCoord: [number, number, number, number]; // [X, Y, Z, W]
  archetype: WorldTopologyArchetype;
  gravity: number; // m/s^2
  biologicalSignature: string;
  subtleHumanTrace: string;
  primaryResource: ResourceId;
  secondaryResource: ResourceId;
  weatherSystem?: DimensionalWeatherSystemSpec;
  lexiconLore?: LexiconCombinatorialLore;
  terrainConfig: {
    amplitude: number;
    frequency: number;
    octaves: number;
    ridgeSharpness: number;
    terraceSteps: number;
    craterDensity: number;
  };
  palette: {
    skyTop: string;
    skyHorizon: string;
    fogColor: string;
    fogDensity: number;
    terrainLow: string;
    terrainMid: string;
    terrainHigh: string;
    gridLine: string;
    accentColor: string;
    sunColor: string;
  };
  propModels: ProceduralPropModelSpec[];
  entityBlueprints: EntityBlueprint[];
  playableCharacter: PlayableCharacterSpec;
  createdAt: number;
}

export interface ManifoldGameVersionLog {
  id: string;
  versionCode: string; // e.g. "SEED-000 (Original)", "EPOCH-002", etc.
  gameTitle: string; // Original game title for this version
  fontFamily: string; // Special display font CSS family for this game version
  meaningAndLore: string; // Philosophical, physical & biological meaning of this version
  world: ManifoldWorldSpec;
  excavations: TerrainExcavationSpot[];
  placedBuildings: PlacedWorldBuilding[];
  wCoord: number;
  savedAt: number;
  isOriginalSeed?: boolean;
}

export interface FavoritedManifoldAnchor {
  id: string;
  seed: number;
  anchorNote?: string;
  versionLog: ManifoldGameVersionLog;
  anchoredAt: number;
}

export type PlayerInteractionTool =
  | 'kinetic-impulse'
  | 'mine-terrain'
  | 'place-building'
  | 'harmonic-tether'
  | 'grapple-hook';

export type FreeLookMode =
  | 'cursor-gliding' // Look around freely just by moving the mouse without clicking/holding
  | 'pointer-lock'   // Click canvas once to lock cursor for infinite 360 FPS look
  | 'click-drag';    // Classic click and hold

export type RetinalFilterStyle =
  | 'none'
  | 'chromatic-pulse'
  | 'biolum-contrast'
  | 'vitreous-crt'
  | 'ossuary-sepia';

export type ReticleStyle =
  | 'tesseract-cross'
  | 'biological-iris'
  | 'tri-laser'
  | 'minimal-dot';

export type GifTypographyStyle =
  | 'per-char-gif'
  | 'per-word-gif'
  | 'whole-phrase-gif'
  | 'calm-static';

export interface GameOptionsConfig {
  // 1. Vestibular Free-Look & Motor Cortex
  freeLookMode: FreeLookMode;
  lookSensitivity: number; // 0.2 to 3.0
  invertPitchY: boolean;
  cursorDeadzone: number; // 0.0 to 0.25 of screen center
  cameraRollIntensity: number; // 0.0 to 2.0
  fovWarpIntensity: number; // 0.0 to 2.0

  // 2. Optic Nerve & Retinal Display
  retinalFilter: RetinalFilterStyle;
  hudOpacity: number; // 0.25 to 1.0
  reticleStyle: ReticleStyle;
  showWorldWireframe: boolean;
  fogMultiplier: number; // 0.2 to 2.0
  bloomIntensity: number; // 0.0 to 3.0 (Global Post-Processing Bloom Intensity)

  // 3. Shapeshifting GIF Typography Engine
  gifTypographyStyle: GifTypographyStyle;
  gifFrameRateFps: number; // 1 to 12 FPS
  gifChromaticSplit: boolean;
  gifSkewMorph: boolean;
}

export type Node4DCategory =
  | 'sensor-4d'
  | 'gateway-4d'
  | 'behavior-driver'
  | 'ragdoll-actuator';

export interface Node4D {
  id: string;
  label: string;
  category: Node4DCategory;
  subtype: string;
  x: number;
  y: number;
  anchorX?: number;
  anchorY?: number;
  vx?: number;
  vy?: number;
  elasticStretch?: number;
  zWeight: number;
  wPhase: number;
  wSigma: number;
  temporalFreq: number;
  paramValue: number;
  activation: number;
  description: string;
}

export interface Edge4D {
  id: string;
  from: string;
  to: string;
  weight: number;
  phaseLag: number;
}

export interface BehaviorEvaluationOutput {
  muscleStiffness: number;
  locomotionSpeed: number;
  strideAmplitude: number;
  steeringMode: 'patrol' | 'seek-player' | 'flock' | 'evade' | 'vortex-orbit';
  antiGravityLift: number;
  angularImpulseBurst: number;
  selfRightingTorque: number;
  activeBranchLabel: string;
  dominantNodeId: string | null;
  limbSwayPhase?: number;
  elasticDeformationRatio?: number;
  springEnergy?: number;
}

export interface EntityRuntimeTelemetry {
  id: string;
  name: string;
  blueprintId: string;
  morphology: EntityMorphology;
  position: [number, number, number];
  velocityMagnitude: number;
  ragdollState: 'active-balanced' | 'stumbling-recovery' | 'full-ragdoll-limp' | 'zero-g-suspended';
  currentStiffness: number;
  activeBehavior: string;
  jointCount: number;
  wPhaseOffset: number;
  skinTelemetry?: SkinTopologyTelemetry;
  internalDamage?: InternalDamageTelemetry;
  geneticDNA?: EntityGeneticDNA;
  activeEcologicalActivity?: string;
}

export interface EntityManifoldSnapshot {
  id: string;
  createdAt: number;
  entityId: string;
  entityName: string;
  blueprint: EntityBlueprint;
  telemetry: EntityRuntimeTelemetry;
  worldName: string;
  worldSeed: number;
  manifoldCoord: [number, number, number, number];
  wCoord: number;
  cameraMode: CameraPerspective;
  imageDataUrl: string;
}

export type TectonicElevationRegime =
  | 'alpine-karst-spire-highlands'
  | 'abyssal-subduction-canyon'
  | 'cantilever-mesa-ziggurat'
  | 'biocomplex-caldera-amphitheater'
  | 'blender-bmesh-arch-labyrinth';

export interface ProceduralTerrainSectorSpec {
  id: string;
  gridX: number; // Integer chunk coordinate (e.g. -1, 0, 1, 2...)
  gridZ: number;
  centerX: number;
  centerZ: number;
  size: number; // e.g. 96m x 96m
  seed: number;
  name: string;
  elevationRegime: TectonicElevationRegime;
  baseElevationOffset: number; // -24m to +32m dramatic vertical relief
  reliefAmplitude: number; // 8m to 28m local height variance
  terraceStepCount: number;
  primaryHex: string;
  secondaryHex: string;
  accentHex: string;
  geyserCoords: [number, number]; // Physical 3D thermal updraft geyser in this sector
  pylonCoords: [number, number]; // Physical 3D 4D-Node Actuator Pylon in this sector
  cradleCoords: [number, number]; // Physical 3D Lexicon Synthesis & DNA Fusion Altar
  spawnedMobCount: number;
  discoveredAt: number;
}

export interface PlayerSomaticGraftTelemetry {
  graftCount: number;
  activeOrganTitle: string;
  limbScaleMultiplier: number;
  speedBoostMultiplier: number;
  jumpBoostMultiplier: number;
  lastWorldMechanicEvent: string;
  exploredSectorCount: number;
  currentSectorName: string;
  currentSectorElevationRegime: string;
}

export type StateOfMatter =
  | 'solid-crystalline-lattice'
  | 'viscous-ferro-superfluid'
  | 'vesicular-pumice-aerogel'
  | 'quantum-condensate-strata'
  | 'hyper-granular-regolith'
  | 'vitreous-plasma-glass';

export interface InterdimensionalChemicalElement {
  id: string;
  symbol: string;
  name: string;
  dimensionIndex: number; // Dimension 1 to 7+
  atomicMass: number;
  stateOfMatter: StateOfMatter;
  grainSizeMicrons: number;
  frictionCoefficient: number; // 0.15 (superfluid/ice) to 1.15 (porous aerogel/pumice)
  restitution: number; // 0.05 (dead clay/sludge) to 0.85 (elastic crystal)
  hardnessMohs: number;
  primaryColor: string;
  specularSheen: string;
  reactionAffinity: string;
  miningYieldResId: ResourceId;
  energyConductivity: number; // Closed-loop reactor compatibility factor
  lore: string;
}

export type CelestialPlanetaryShape =
  | 'toroidal-donut-planet'
  | 'klein-stellar-knot'
  | 'dyson-polyhedron-swarm'
  | 'accretion-singularity'
  | 'binary-pulsar-beam'
  | 'mobius-halo-superstructure'
  | 'calabi-yau-stellar-nexus';

export interface CelestialCosmologySpec {
  id: string;
  title: string;
  dimensionIndex: number;
  celestialShape: CelestialPlanetaryShape;
  coreColor: string;
  ringColor: string;
  coronaGlow: string;
  orbitalRadius: number;
  rotationPeriodSec: number;
  gravitationalLensing: number;
  cosmicDiscoveryTier: number;
  atmosphereDensity: number;
  outerSpaceTitle: string;
  lore: string;
}

export interface GravityVehicleState {
  isConstructed: boolean;
  isMounted: boolean;
  pos: [number, number, number];
  vel: [number, number, number];
  rotation: [number, number, number]; // pitch, yaw, roll
  closedLoopPowerMW: number;
  gravitationalCompression: number;
  airspeedKmh: number;
  altitudeM: number;
  flightMode: 'ground-skimmer' | 'atmospheric-glide' | 'orbital-vacuum';
  closedLoopEnergyCharge: number; // 0 to 100%
  spaceShiftCooldown: number;
  lastCosmicShiftTimestamp: number;
}

