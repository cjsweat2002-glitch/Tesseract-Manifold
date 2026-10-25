import { DifferentialUniverseBoundaryId, MultiversalMatterId } from '../types/portalAndBiodepth';
import { BaseDimensionalElementId } from './multiversalEmergenceAndCultureEngine';

export type CompendiumItemCategory =
  | 'weapon'
  | 'apparel'
  | 'tool'
  | 'reagent'
  | 'relic'
  | 'blueprint';

export type CompositeWeaponSubType =
  | 'cleaver-halberd'
  | 'excavating-lance'
  | 'resonance-pistol'
  | 'chrono-tuning-fork'
  | 'spore-caster'
  | 'gravity-hammer'
  | 'prism-saber'
  | 'void-arbalest';

export type CompendiumRarityTier =
  | 'Mundane'
  | 'Resonant'
  | 'Boundary-Forged'
  | 'Divergent'
  | 'Mythic Anchor';

export interface CompendiumItemVisualSpec {
  weaponSubType: CompositeWeaponSubType;
  primaryHex: string;
  secondaryHex: string;
  accentEmissiveHex: string;
  metalness: number;
  roughness: number;
  transmission: number;
  scaleLength: number;
  hasOpticalCrystal: boolean;
  hasCoiledConduit: boolean;
}

export interface DimensionalItemDefinition {
  id: string;
  catalogNumber: number;
  name: string;
  category: CompendiumItemCategory;
  subTypeLabel: string;
  weaponSubType: CompositeWeaponSubType;
  originBoundary: DifferentialUniverseBoundaryId;
  elementAffinity: BaseDimensionalElementId;
  rarity: CompendiumRarityTier;
  stats: {
    damage: number;
    excavationPower: number;
    swingSpeedHz: number;
    stabilityBonus: number;
    massKg: number;
    reachMeters: number;
  };
  craftCost: {
    primaryMatter: MultiversalMatterId;
    primaryCount: number;
    secondaryMatter?: MultiversalMatterId;
    secondaryCount?: number;
  };
  loreProvenance: string;
  groundingConnection: string;
  visualSpec: CompendiumItemVisualSpec;
  affixPrefix?: string;
  affixSuffix?: string;
}

export interface CompendiumLoadoutAndMuseumState {
  discoveredItemIds: string[];
  ownedQuantities: Record<string, number>;
  customForgedItems: DimensionalItemDefinition[];
  equippedRightHandId: string;
  equippedLeftCatalystId: string;
  equippedApparelId: string;
  quickbarItemIds: [string, string, string, string, string];
  /** Maps Portal Room Museum Plinth slot (0..23) to a DimensionalItemDefinition.id */
  mountedMuseumPlinths: Record<number, string>;
}

export const RARITY_COLORS: Record<
  CompendiumRarityTier,
  { text: string; border: string; bg: string; hex: string }
> = {
  Mundane: {
    text: 'text-slate-300',
    border: 'border-slate-500/40',
    bg: 'bg-slate-800/60',
    hex: '#94a3b8',
  },
  Resonant: {
    text: 'text-cyan-300',
    border: 'border-cyan-400/45',
    bg: 'bg-cyan-950/50',
    hex: '#06b6d4',
  },
  'Boundary-Forged': {
    text: 'text-emerald-300',
    border: 'border-emerald-400/45',
    bg: 'bg-emerald-950/50',
    hex: '#10b981',
  },
  Divergent: {
    text: 'text-purple-300',
    border: 'border-purple-400/50',
    bg: 'bg-purple-950/50',
    hex: '#a855f7',
  },
  'Mythic Anchor': {
    text: 'text-amber-300',
    border: 'border-amber-400/65',
    bg: 'bg-amber-950/55',
    hex: '#f59e0b',
  },
};

export const CATEGORY_LABELS: Record<CompendiumItemCategory, string> = {
  weapon: 'Weapons & Staves',
  apparel: 'Apparel & Carapace',
  tool: 'Excavation & Tuning Tools',
  reagent: 'Alchemical & Matter Reagents',
  relic: 'Dimensional Relics',
  blueprint: 'Construct Blueprints',
};

interface DimensionTaxonomySeed {
  boundary: DifferentialUniverseBoundaryId;
  originTitle: string;
  element: BaseDimensionalElementId;
  primaryMatter: MultiversalMatterId;
  secondaryMatter: MultiversalMatterId;
  primaryHex: string;
  secondaryHex: string;
  accentHex: string;
  materialNouns: string[];
  architecturalDescriptors: string[];
  weaponArchetypes: {
    name: string;
    subType: CompositeWeaponSubType;
    subTypeLabel: string;
    baseDmg: number;
    baseReach: number;
    speed: number;
    lore: string;
  }[];
  apparelArchetypes: {
    name: string;
    subTypeLabel: string;
    stability: number;
    mass: number;
    lore: string;
  }[];
  toolArchetypes: {
    name: string;
    subType: CompositeWeaponSubType;
    subTypeLabel: string;
    excavation: number;
    lore: string;
  }[];
  reagentArchetypes: {
    name: string;
    subTypeLabel: string;
    lore: string;
  }[];
  relicArchetypes: {
    name: string;
    subTypeLabel: string;
    lore: string;
  }[];
  blueprintArchetypes: {
    name: string;
    subTypeLabel: string;
    lore: string;
  }[];
}

const DIMENSION_TAXONOMY_SEEDS: DimensionTaxonomySeed[] = [
  {
    boundary: 'hadal-biodepth-abyss',
    originTitle: 'Hadal Biodepth Abyss',
    element: 'hydro-superfluid',
    primaryMatter: 'abyssal-biodepth-chitin',
    secondaryMatter: 'luminous-bathyal-gel',
    primaryHex: '#0e293b',
    secondaryHex: '#0f766e',
    accentHex: '#06b6d4',
    materialNouns: [
      'Bathyal Chitin',
      'Pelagic Pressurized Brass',
      'Hadopelagic Bone',
      'Luciferin Carapace',
      'Abyssal Vent Obsidian',
      'Mariana Siphon Alloy',
      'Bioluminescent Cartilage',
      'Hydrostatic Coral-Iron',
      'Cetacean Reliquary Bronze',
      'Superfluid Brine-Glass',
      'Trench-Forged Titanium',
    ],
    architecturalDescriptors: [
      'recovered from a crushed bathyscaphe bell at 11.4km depth',
      'anchored to a hydrothermal luciferin vent column',
      'carved from the rib-arch of an ancient pelagic leviathan',
      'calibrated to withstand 1,100 atmospheres of hydrostatic shear',
    ],
    weaponArchetypes: [
      {
        name: 'Bathyscaphe Cleaver-Halberd',
        subType: 'cleaver-halberd',
        subTypeLabel: 'Heavy Trench Polearm',
        baseDmg: 48,
        baseReach: 3.4,
        speed: 1.15,
        lore: 'Heavy brass-and-chitin boarding halberd used by deep-trench divers to sever leviathan tendons.',
      },
      {
        name: 'Pelagic Luciferin Harpoon-Lance',
        subType: 'excavating-lance',
        subTypeLabel: 'Hydrostatic Piercing Lance',
        baseDmg: 42,
        baseReach: 3.8,
        speed: 1.35,
        lore: 'Telescoping pressurized harpoon lance that injects superfluid bathyal gel on impact.',
      },
      {
        name: 'Cavitation Piezo-Coil Pistol',
        subType: 'resonance-pistol',
        subTypeLabel: 'Acoustic Cavitation Sidearm',
        baseDmg: 34,
        baseReach: 18.0,
        speed: 2.1,
        lore: 'Fires collapsing superfluid cavitation bubbles that implode with blinding sonoluminescence.',
      },
      {
        name: 'Abyssal Sonar Tuning Fork',
        subType: 'chrono-tuning-fork',
        subTypeLabel: 'Bathymetric Resonance Staff',
        baseDmg: 31,
        baseReach: 6.5,
        speed: 1.65,
        lore: 'Twin-tined bronze resonator that maps crushed trench geometry through low-frequency pings.',
      },
    ],
    apparelArchetypes: [
      {
        name: 'Diving Bell Atmospheric Cuirass',
        subTypeLabel: 'Heavy Pressure Rig',
        stability: 28,
        mass: 16.5,
        lore: 'Riveted phosphor-bronze breastplate reinforced with abyssal chitin gaskets.',
      },
      {
        name: 'Luciferin Gill-Mantle Rebreather',
        subTypeLabel: 'Symbiotic Shoulder Rig',
        stability: 19,
        mass: 6.8,
        lore: 'Living bioluminescent gill filaments that filter oxygen from crushed dimensional brine.',
      },
    ],
    toolArchetypes: [
      {
        name: 'Hydrothermal Core-Siphon Auger',
        subType: 'excavating-lance',
        subTypeLabel: 'Deep-Strata Rotary Drill',
        excavation: 2.4,
        lore: 'Bores through pressurized seabed basalt while extracting intact luciferin nodules.',
      },
      {
        name: 'Bathyscaphe Ballast Breaker',
        subType: 'gravity-hammer',
        subTypeLabel: 'Hydraulic Trench Maul',
        excavation: 2.8,
        lore: 'Piston-driven demolition maul engineered for fracturing hydrothermal chimney crusts.',
      },
    ],
    reagentArchetypes: [
      {
        name: 'Pressurized Luciferin Photophore',
        subTypeLabel: 'Bioluminescent Organ',
        lore: 'Cold-light cellular sac harvested from hadal angler fauna; glows indefinitely in vacuum.',
      },
      {
        name: 'Crystallized Black-Smoker Precipitate',
        subTypeLabel: 'Hydrothermal Mineral',
        lore: 'Sulfurous metallic salt condensed around superheated abyssal vents.',
      },
    ],
    relicArchetypes: [
      {
        name: 'Astrolabe of the Eleventh Trench',
        subTypeLabel: 'Hadal Navigation Relic',
        lore: 'Gyroscopic brass bathysphere compass whose needles point toward dimensional pressure minima.',
      },
      {
        name: 'Reliquary Bell of Saint Nereus',
        subTypeLabel: 'Abyssal Monument Artifact',
        lore: 'Miniature diving bell cast from resonant bronze; rings silently when reality tears open nearby.',
      },
    ],
    blueprintArchetypes: [
      {
        name: 'Codex: Bathyscaphe Pressure Reliquary',
        subTypeLabel: 'Architectural Grounding Draft',
        lore: 'Structural plans for anchoring a pressurized diving-bell sanctum against bathyal currents.',
      },
    ],
  },
  {
    boundary: 'monolithic-brutalist-singularity',
    originTitle: 'Monolithic Brutalist Singularity',
    element: 'lithic-crystalline',
    primaryMatter: 'non-euclidean-void-basalt',
    secondaryMatter: 'graviton-alloy',
    primaryHex: '#1e293b',
    secondaryHex: '#475569',
    accentHex: '#f59e0b',
    materialNouns: [
      'Scarpa Stepped Basalt',
      'Board-Formed Obsidian',
      'Graviton Shear Brass',
      'Cyclopean Aggregate',
      'Anisotropic Gunmetal',
      'Cantilevered Tungsten',
      'Brutalist Tensor Steel',
      'Post-Tensioned Slate',
      'Monolithic Plinth Iron',
      'Sodium-Lit Bronze',
      'Hyperbolic Concrete',
    ],
    architecturalDescriptors: [
      'cast within a cyclopean board-formed concrete ziggurat',
      'counterbalanced inside a Brutalist pendulum seismograph tower',
      'machined with Carlo Scarpa stepped brass reveal joints',
      'stabilized against spin-2 graviton shear waves',
    ],
    weaponArchetypes: [
      {
        name: 'Scarpa Stepped Tensor Halberd',
        subType: 'cleaver-halberd',
        subTypeLabel: 'Architectural Cleaving Polearm',
        baseDmg: 54,
        baseReach: 3.6,
        speed: 1.05,
        lore: 'Stepped obsidian-and-brass blade whose notched geometry concentrates shear along fault lines.',
      },
      {
        name: 'Cantilevered Graviton Maul',
        subType: 'gravity-hammer',
        subTypeLabel: 'Monolithic Impact Hammer',
        baseDmg: 64,
        baseReach: 2.9,
        speed: 0.88,
        lore: 'A block of post-tensioned void basalt mounted on a hydraulic brass torsion shaft.',
      },
      {
        name: 'Pendulum Mass-Driver Pistol',
        subType: 'resonance-pistol',
        subTypeLabel: 'Lorentz Rail Sidearm',
        baseDmg: 39,
        baseReach: 22.0,
        speed: 1.85,
        lore: 'Accelerates dense tungsten-basalt flechettes along twin stepped brass rails.',
      },
      {
        name: 'Torsion-truss Void Arbalest',
        subType: 'void-arbalest',
        subTypeLabel: 'Structural Siege Crossbow',
        baseDmg: 58,
        baseReach: 28.0,
        speed: 0.95,
        lore: 'Built like a cantilevered bridge truss; fires rebar-scale graviton anchor bolts.',
      },
    ],
    apparelArchetypes: [
      {
        name: 'Ziggurat Cantilever Pauldrons',
        subTypeLabel: 'Architectural Exo-Rig',
        stability: 34,
        mass: 19.0,
        lore: 'Layered concrete-slate shoulder plates joined by exposed brass turnbuckles.',
      },
      {
        name: 'Seismograph Counterweight Harness',
        subTypeLabel: 'Inertial Dampening Vest',
        stability: 26,
        mass: 12.4,
        lore: 'Internal gimballed pendulums absorb knockback and ground the wearer during tremors.',
      },
    ],
    toolArchetypes: [
      {
        name: 'Monolithic Core-Boring Lance',
        subType: 'excavating-lance',
        subTypeLabel: 'Geotechnical Percussion Drill',
        excavation: 2.9,
        lore: 'Extracts cylindrical core samples from non-euclidean basalt foundations.',
      },
      {
        name: 'Plumb-Line Resonance Caliper',
        subType: 'chrono-tuning-fork',
        subTypeLabel: 'Metric Surveying Instrument',
        excavation: 2.1,
        lore: 'Measures local gravitational tilt and shatters unstable rock seams via harmonic locks.',
      },
    ],
    reagentArchetypes: [
      {
        name: 'Vitrified Aggregate Core',
        subTypeLabel: 'Structural Substrate',
        lore: 'Polished cylinder of void basalt laced with golden pyrite and graviton alloy threads.',
      },
      {
        name: 'Liquid Mercury-Sodium Amalgam',
        subTypeLabel: 'Dampening Fluid',
        lore: 'Heavy reflective fluid siphoned from the basin of a Brutalist pendulum monument.',
      },
    ],
    relicArchetypes: [
      {
        name: 'Carlo’s Stepped Brass Keystone',
        subTypeLabel: 'Master Architect Relic',
        lore: 'Interlocking five-piece brass joint that prevents non-euclidean walls from folding inward.',
      },
      {
        name: 'Foucault’s Singularity Bob',
        subTypeLabel: 'Gravitational Grounding Relic',
        lore: 'A 40-kilogram sphere of spun gunmetal that traces the rotation of the fourth dimension.',
      },
    ],
    blueprintArchetypes: [
      {
        name: 'Codex: Pendulum Seismograph Tower',
        subTypeLabel: 'Architectural Grounding Draft',
        lore: 'Complete elevations for a kinetic monolith that dampens dimensional bleed.',
      },
    ],
  },
  {
    boundary: 'cel-traced-chromatic-steppe',
    originTitle: 'Chromatic Vector Hyper-Steppe',
    element: 'pyro-vitreous',
    primaryMatter: 'prismatic-vector-glass',
    secondaryMatter: 'chronos-lattice-quartz',
    primaryHex: '#3b0764',
    secondaryHex: '#9d174d',
    accentHex: '#f43f5e',
    materialNouns: [
      'Refractive Vector-Glass',
      'Dichroic Quartz',
      'Birefringent Obsidian',
      'Spectral Crown Flint',
      'Laser-Sintered Rhodium',
      'Chromatic Tourmaline',
      'Optical Waveguide Brass',
      'Prismatic Silica',
      'Solar-Cured Enamel',
      'Phase-Grating Silver',
      'Fused Fluorite',
    ],
    architecturalDescriptors: [
      'focused through a refractive sundial obelisk on the Hyper-Steppe',
      'tuned inside a desert wind-harp acoustic resonator',
      'etched with sub-wavelength diffraction gratings',
      'annealed in the focal beam of a binary solar lens',
    ],
    weaponArchetypes: [
      {
        name: 'Diffraction Prism-Saber',
        subType: 'prism-saber',
        subTypeLabel: 'Refractive Sabre',
        baseDmg: 46,
        baseReach: 2.8,
        speed: 1.75,
        lore: 'A blade of optically pure vector-glass that splits sunlight into a searing ultraviolet edge.',
      },
      {
        name: 'Heliograph Coherence Pistol',
        subType: 'resonance-pistol',
        subTypeLabel: 'Optical Discharge Sidearm',
        baseDmg: 37,
        baseReach: 25.0,
        speed: 2.25,
        lore: 'Pumps a ruby-quartz rod with ambient skylight to fire collimated chromatic pulses.',
      },
      {
        name: 'Birefringent Glaive-Halberd',
        subType: 'cleaver-halberd',
        subTypeLabel: 'Spectral Polearm',
        baseDmg: 49,
        baseReach: 3.5,
        speed: 1.3,
        lore: 'Sweeping attacks leave trailing afterimages that slice targets a split-second later.',
      },
      {
        name: 'Aeolian Wind-Harp Bow',
        subType: 'void-arbalest',
        subTypeLabel: 'Acoustic-Optical Arbalest',
        baseDmg: 51,
        baseReach: 30.0,
        speed: 1.2,
        lore: 'Strung with fiber-optic filaments that sing in steppe gales and loose vitrified light bolts.',
      },
    ],
    apparelArchetypes: [
      {
        name: 'Dichroic Mirror-Scale Lorica',
        subTypeLabel: 'Optical Deflection Armor',
        stability: 22,
        mass: 9.2,
        lore: 'Overlapping facets of iridescent vector-glass that scatter incoming kinetic vectors.',
      },
      {
        name: 'Sundial Gnomon Crest Helm',
        subTypeLabel: 'Refractive Visor Rig',
        stability: 18,
        mass: 4.5,
        lore: 'Projects real-time solar azimuths and highlights hidden dimensional seams.',
      },
    ],
    toolArchetypes: [
      {
        name: 'Thermal-Lens Vitrification Lance',
        subType: 'excavating-lance',
        subTypeLabel: 'Optical Mining Beam',
        excavation: 2.6,
        lore: 'Melts sand and bedrock into smooth glass tunnels while crystallizing rare quartz.',
      },
      {
        name: 'Chromatic Spectrometer Fork',
        subType: 'chrono-tuning-fork',
        subTypeLabel: 'Optical Assay Instrument',
        excavation: 1.9,
        lore: 'Splits mineral emissions into spectral lines to pinpoint buried relic veins.',
      },
    ],
    reagentArchetypes: [
      {
        name: 'Fulgurite Lightning-Tube Shard',
        subTypeLabel: 'Vitrified Mineral',
        lore: 'Hollow glass tube formed where chromatic sky-discharges struck desert silica.',
      },
      {
        name: 'Colloidal Gold-Ruby Suspension',
        subTypeLabel: 'Optical Alchemical Fluid',
        lore: 'Nanoparticle elixir used to silver the mirrors of dimensional astrolabes.',
      },
    ],
    relicArchetypes: [
      {
        name: 'Orrery Lens of the Chromatic Steppe',
        subTypeLabel: 'Refractive Horizon Relic',
        lore: 'A ground fluorite triplet lens that reveals the wireframe skeleton of distant worlds.',
      },
      {
        name: 'Aeolian Glass-Harp Soundboard',
        subTypeLabel: 'Cymatic Grounding Relic',
        lore: 'Plays a self-sustaining harmonic fifth whenever two dimensional boundaries align.',
      },
    ],
    blueprintArchetypes: [
      {
        name: 'Codex: Refractive Sundial Obelisk',
        subTypeLabel: 'Architectural Grounding Draft',
        lore: 'Optical geometry for erecting a glass obelisk that pins local time to solar noon.',
      },
    ],
  },
  {
    boundary: 'mycelial-silicon-necropolis',
    originTitle: 'Mycelial-Silicon Necropolis',
    element: 'bio-miasmic',
    primaryMatter: 'tachyon-mycelium',
    secondaryMatter: 'abyssal-biodepth-chitin',
    primaryHex: '#064e3b',
    secondaryHex: '#115e59',
    accentHex: '#10b981',
    materialNouns: [
      'Tachyon Hyphae-Weave',
      'Fossilized Silicon-Bark',
      'Amber Synaptic Resin',
      'Ossified Spore-Chitin',
      'Mycelial Copper-Loom',
      'Biomechanical Bone-Steel',
      'Lichen-Etched Wafer',
      'Cordyceps Tendon-Wire',
      'Necropolis Reliquary Jade',
      'Spore-Sintered Basalt',
      'Neural Rhizome Brass',
    ],
    architecturalDescriptors: [
      'grown inside a fossilized data-cathedral stele',
      'harvested from a rhythmic bioluminescent spore-bellows organ',
      'encapsulated in golden Precambrian synaptic amber',
      'colonized by tachyon-conducting mycelial root networks',
    ],
    weaponArchetypes: [
      {
        name: 'Rhizome Spore-Caster Rifle',
        subType: 'spore-caster',
        subTypeLabel: 'Bio-Ballistic Launcher',
        baseDmg: 44,
        baseReach: 20.0,
        speed: 1.6,
        lore: 'Peristaltic chitin barrel that launches pressurized tachyon-spore capsules.',
      },
      {
        name: 'Ossified Data-Scythe Halberd',
        subType: 'cleaver-halberd',
        subTypeLabel: 'Necropolis Harvesting Polearm',
        baseDmg: 52,
        baseReach: 3.7,
        speed: 1.18,
        lore: 'Curved silicon-bone blade overgrown with conductive copper hyphae.',
      },
      {
        name: 'Amber-Synapse Needle Pistol',
        subType: 'resonance-pistol',
        subTypeLabel: 'Neural Dart Sidearm',
        baseDmg: 35,
        baseReach: 19.0,
        speed: 2.3,
        lore: 'Fires crystallized amber thorns that hijack target motor-ganglia on contact.',
      },
      {
        name: 'Mycelial Graft-Splicer Saber',
        subType: 'prism-saber',
        subTypeLabel: 'Surgical Bio-Blade',
        baseDmg: 43,
        baseReach: 2.7,
        speed: 1.85,
        lore: 'Serrated wafer-edge scalpel designed to cleanly harvest intact visceral organs.',
      },
    ],
    apparelArchetypes: [
      {
        name: 'Symbiotic Spore-Bellows Carapace',
        subTypeLabel: 'Living Chitin Cuirass',
        stability: 27,
        mass: 11.0,
        lore: 'Breathing dorsal pods vent healing emerald spores whenever the wearer takes impact trauma.',
      },
      {
        name: 'Silicon-Necropolis Archivist Robe',
        subTypeLabel: 'Conductive Hyphae Mantle',
        stability: 21,
        mass: 5.8,
        lore: 'Woven from gold-doped fungal threads that store ancestral memory logs.',
      },
    ],
    toolArchetypes: [
      {
        name: 'Enzymatic Root-Auger Lance',
        subType: 'excavating-lance',
        subTypeLabel: 'Bio-Acidic Soil Excavator',
        excavation: 2.7,
        lore: 'Secretes chelating fungal enzymes that soften bedrock into rich harvestable loam.',
      },
      {
        name: 'Synaptic Bellows Resonator',
        subType: 'spore-caster',
        subTypeLabel: 'Spore-Cloud Disperser',
        excavation: 2.2,
        lore: 'Seeds barren craters with fast-growing bioluminescent flora patches.',
      },
    ],
    reagentArchetypes: [
      {
        name: 'Tachyon Fruiting-Body Cap',
        subTypeLabel: 'Temporal Fungus',
        lore: 'Releases spores that arrive in the collector’s pouch three seconds before being picked.',
      },
      {
        name: 'Fossilized Silicon-Amber Node',
        subTypeLabel: 'Memory Resin',
        lore: 'Translucent golden resin containing a preserved micro-circuit and prehistoric wasp.',
      },
    ],
    relicArchetypes: [
      {
        name: 'Censer of the Spore-Chorus',
        subTypeLabel: 'Necropolis Liturgical Relic',
        lore: 'Swinging perforated bronze censer that exhales harmonic emerald memory-mist.',
      },
      {
        name: 'Root-Crowned Skull of the First Arborist',
        subTypeLabel: 'Biomechanical Anchor Relic',
        lore: 'A cranium fused with gold-traced silicon wafers and living emerald mycelium.',
      },
    ],
    blueprintArchetypes: [
      {
        name: 'Codex: Bioluminescent Spore-Bellows',
        subTypeLabel: 'Architectural Grounding Draft',
        lore: 'Cultivation matrix for growing a respiring fungal organ monument.',
      },
    ],
  },
  {
    boundary: 'tesseractic-4d-reliquary',
    originTitle: '4D Tesseractic Reliquary',
    element: 'chrono-phase',
    primaryMatter: 'chronos-lattice-quartz',
    secondaryMatter: 'astral-singularity-core',
    primaryHex: '#1e1b4b',
    secondaryHex: '#4c1d95',
    accentHex: '#a855f7',
    materialNouns: [
      'Tesseractic Gold-Obsidian',
      '8-Cell Chrono-Brass',
      'Riemannian Quartz',
      'Ouroboros Platinum',
      'Hyper-Eulerian Bronze',
      'Phase-Locked Iridium',
      'Astral Horizon Glass',
      'Non-Orientable Silver',
      'Quaternion Electrum',
      'Causality-Tempered Steel',
      'Calabi-Yau Amber',
    ],
    architecturalDescriptors: [
      'suspended inside a folding 8-cell hyper-astrolabe',
      'recovered from a time-dilated reliquary vault at W = +0.95',
      'forged along a closed timelike curve in the Tesseractic Sanctum',
      'inscribed with fourth-dimensional Eulerian rotation glyphs',
    ],
    weaponArchetypes: [
      {
        name: 'Ouroboros Chrono-Tuning Fork',
        subType: 'chrono-tuning-fork',
        subTypeLabel: '4D Phase Polearm',
        baseDmg: 50,
        baseReach: 3.9,
        speed: 1.55,
        lore: 'Strikes resonate across adjacent W-coordinates, hitting enemies in both past and present frames.',
      },
      {
        name: '8-Cell Hyper-Lance',
        subType: 'excavating-lance',
        subTypeLabel: 'Dimensional Folding Lance',
        baseDmg: 55,
        baseReach: 4.1,
        speed: 1.25,
        lore: 'Nested polyhedral shaft that unfolds through 4D space to bypass physical shields.',
      },
      {
        name: 'Quaternion Singularity Arbalest',
        subType: 'void-arbalest',
        subTypeLabel: 'Reliquary Heavy Crossbow',
        baseDmg: 62,
        baseReach: 32.0,
        speed: 1.0,
        lore: 'Looses micro-horizon bolts that briefly pin targets to a fixed 4D spacetime coordinate.',
      },
      {
        name: 'Astrolabe Phase-Blade Saber',
        subType: 'prism-saber',
        subTypeLabel: 'Chronos Duelist Blade',
        baseDmg: 47,
        baseReach: 2.9,
        speed: 1.9,
        lore: 'Clockwork brass hilt projecting a golden-violet blade of solidified time-salt.',
      },
    ],
    apparelArchetypes: [
      {
        name: '8-Cell Gimballed Reliquary Cuirass',
        subTypeLabel: '4D Phase Armor',
        stability: 36,
        mass: 10.5,
        lore: 'Concentric rotating brass rings around the torso deflect blows into orthogonal W-planes.',
      },
      {
        name: 'Chrono-Walker Horizon Mantle',
        subTypeLabel: 'Temporal Stabilizer Cloak',
        stability: 29,
        mass: 6.0,
        lore: 'Prevents temporal paradoxes and preserves momentum across sudden dimension shifts.',
      },
    ],
    toolArchetypes: [
      {
        name: 'Riemannian Metric-Shatter Pick',
        subType: 'gravity-hammer',
        subTypeLabel: '4D Geodesic Excavator',
        excavation: 3.1,
        lore: 'Unfolds buried mineral seams into 3D space without disturbing surrounding topsoil.',
      },
      {
        name: 'Tesseractic Phase Caliper',
        subType: 'chrono-tuning-fork',
        subTypeLabel: 'W-Axis Harmonic Tuner',
        excavation: 2.5,
        lore: 'Locks unstable reality tears and extracts pure Chronos-Lattice Quartz.',
      },
    ],
    reagentArchetypes: [
      {
        name: 'Vitrified Time-Salt Octahedron',
        subTypeLabel: 'Temporal Crystal',
        lore: 'Warm golden crystal whose internal inclusions fall upward in reversed entropy.',
      },
      {
        name: 'Pinched Micro-Horizon Droplet',
        subTypeLabel: 'Singularity Condensate',
        lore: 'Suspended in a magnetic brass vial; bends light into a miniature Einstein ring.',
      },
    ],
    relicArchetypes: [
      {
        name: 'The Grand 8-Cell Hyper-Astrolabe',
        subTypeLabel: 'Supreme Tesseractic Relic',
        lore: 'Four nested brass armillary spheres that rotate through W-space to chart all known seeds.',
      },
      {
        name: 'Hourglass of the Unborn Epoch',
        subTypeLabel: 'Chrono-Anchor Relic',
        lore: 'Twin bulbs of blown vector-glass joined by a zero-gravity singularity aperture.',
      },
    ],
    blueprintArchetypes: [
      {
        name: 'Codex: Folding 8-Cell Hyper-Astrolabe',
        subTypeLabel: 'Architectural Grounding Draft',
        lore: 'Sacred geometric proofs for constructing a 4D tesseractic grounding monument.',
      },
    ],
  },
];

const NAMED_MYTHIC_RELICS: {
  name: string;
  category: CompendiumItemCategory;
  subType: CompositeWeaponSubType;
  subTypeLabel: string;
  boundary: DifferentialUniverseBoundaryId;
  element: BaseDimensionalElementId;
  lore: string;
}[] = [
  {
    name: 'Sunderer of the Ninth Bathyscaphe',
    category: 'weapon',
    subType: 'cleaver-halberd',
    subTypeLabel: 'Mythic Abyssal Polearm',
    boundary: 'hadal-biodepth-abyss',
    element: 'hydro-superfluid',
    lore: 'Forged from the keel of the first bathyscaphe to breach the Hadal Singularity. Its edge weeps luminescent brine.',
  },
  {
    name: 'Scarpa’s Monolithic Verdict',
    category: 'weapon',
    subType: 'gravity-hammer',
    subTypeLabel: 'Mythic Brutalist Great-Maul',
    boundary: 'monolithic-brutalist-singularity',
    element: 'lithic-crystalline',
    lore: 'A stepped obsidian-and-brass architectural keystone mounted on a seismic pendulum shaft. Every strike rings like a cathedral bell.',
  },
  {
    name: 'Solstice Vector-Lance of Aethelgard',
    category: 'weapon',
    subType: 'excavating-lance',
    subTypeLabel: 'Mythic Prismatic Lance',
    boundary: 'cel-traced-chromatic-steppe',
    element: 'pyro-vitreous',
    lore: 'Spun from a single kilometer-long fiber of chromatic vector-glass. Bores through bedrock and reality membranes alike.',
  },
  {
    name: 'Voice of the Mycelial Choir',
    category: 'weapon',
    subType: 'spore-caster',
    subTypeLabel: 'Mythic Bio-Resonance Cannon',
    boundary: 'mycelial-silicon-necropolis',
    element: 'bio-miasmic',
    lore: 'A living pipe-organ barrel grown from fossilized silicon-bone that harmonizes with the world’s ecological web.',
  },
  {
    name: 'Chronos-Anchor of the Prime Seed (SEED-000)',
    category: 'relic',
    subType: 'chrono-tuning-fork',
    subTypeLabel: 'Prime Omniversal Relic',
    boundary: 'tesseractic-4d-reliquary',
    element: 'chrono-phase',
    lore: 'The original tuning instrument used to lock SEED-000 into the continuum. Displays a live 4D shadow when mounted in the Portal Room.',
  },
];

/**
 * Deterministically builds the 325-item Bethesda-Mod-Scale Compendium
 * (inspired by Legacy of the Dragonborn & Immersive Weapons/Armors)
 */
function buildDeterministic325Compendium(): DimensionalItemDefinition[] {
  const items: DimensionalItemDefinition[] = [];
  let catalogCounter = 1;

  // 1. Add the 5 Signature Mythic Anchor Relics & Weapons (#1 - #5)
  for (const mythic of NAMED_MYTHIC_RELICS) {
    const seedGroup =
      DIMENSION_TAXONOMY_SEEDS.find((s) => s.boundary === mythic.boundary) ??
      DIMENSION_TAXONOMY_SEEDS[0];
    items.push({
      id: `compendium-mythic-${catalogCounter}`,
      catalogNumber: catalogCounter,
      name: mythic.name,
      category: mythic.category,
      subTypeLabel: mythic.subTypeLabel,
      weaponSubType: mythic.subType,
      originBoundary: mythic.boundary,
      elementAffinity: mythic.element,
      rarity: 'Mythic Anchor',
      stats: {
        damage: 78 + catalogCounter * 3,
        excavationPower: 3.6,
        swingSpeedHz: 1.45,
        stabilityBonus: 42,
        massKg: 8.5,
        reachMeters: 3.8,
      },
      craftCost: {
        primaryMatter: seedGroup.primaryMatter,
        primaryCount: 3,
        secondaryMatter: 'astral-singularity-core',
        secondaryCount: 1,
      },
      loreProvenance: mythic.lore,
      groundingConnection: `Primary Dimensional Anchor for ${seedGroup.originTitle}`,
      visualSpec: {
        weaponSubType: mythic.subType,
        primaryHex: seedGroup.primaryHex,
        secondaryHex: '#f59e0b',
        accentEmissiveHex: seedGroup.accentHex,
        metalness: 0.88,
        roughness: 0.18,
        transmission: 0.35,
        scaleLength: 1.22,
        hasOpticalCrystal: true,
        hasCoiledConduit: true,
      },
    });
    catalogCounter++;
  }

  const rarities: CompendiumRarityTier[] = [
    'Mundane',
    'Resonant',
    'Boundary-Forged',
    'Divergent',
    'Mythic Anchor',
  ];

  // 2. For each of the 5 Dimension Taxonomies, generate 64 richly differentiated items (5 * 64 = 320 + 5 = 325 total!)
  for (let dIdx = 0; dIdx < DIMENSION_TAXONOMY_SEEDS.length; dIdx++) {
    const dim = DIMENSION_TAXONOMY_SEEDS[dIdx];

    // 2A. 16 Weapons per dimension (80 weapons)
    for (let w = 0; w < 16; w++) {
      const arch = dim.weaponArchetypes[w % dim.weaponArchetypes.length];
      const matNoun = dim.materialNouns[w % dim.materialNouns.length];
      const desc =
        dim.architecturalDescriptors[w % dim.architecturalDescriptors.length];
      const tierIdx = Math.min(4, Math.floor(w / 3.5));
      const rarity = rarities[tierIdx];
      const tierMult = 1 + tierIdx * 0.22 + (w % 3) * 0.05;

      const variantName =
        w < 4
          ? `${matNoun} ${arch.name}`
          : w < 8
          ? `Masterwork ${matNoun} ${arch.name.split(' ').slice(-1)[0]}`
          : w < 12
          ? `Boundary-Tempered ${arch.name} of ${matNoun.split(' ')[0]}`
          : ` Sovereign ${matNoun} ${arch.name}`.trim();

      items.push({
        id: `compendium-wpn-${dim.boundary}-${w}`,
        catalogNumber: catalogCounter++,
        name: variantName,
        category: 'weapon',
        subTypeLabel: arch.subTypeLabel,
        weaponSubType: arch.subType,
        originBoundary: dim.boundary,
        elementAffinity: dim.element,
        rarity,
        stats: {
          damage: Math.round(arch.baseDmg * tierMult),
          excavationPower: Number((1.1 + tierIdx * 0.35).toFixed(2)),
          swingSpeedHz: Number(
            (arch.speed * (0.94 + (w % 4) * 0.04)).toFixed(2)
          ),
          stabilityBonus: Math.round(8 + tierIdx * 6),
          massKg: Number((3.2 + (w % 5) * 1.4).toFixed(1)),
          reachMeters: Number((arch.baseReach * (0.95 + tierIdx * 0.04)).toFixed(2)),
        },
        craftCost: {
          primaryMatter: dim.primaryMatter,
          primaryCount: Math.max(1, tierIdx + 1),
          secondaryMatter: dim.secondaryMatter,
          secondaryCount: Math.max(1, Math.floor(tierIdx / 2) + 1),
        },
        loreProvenance: `${arch.lore} Forged from ${matNoun.toLowerCase()} and ${desc}.`,
        groundingConnection: `Resonates with ${dim.originTitle} Grounding Monoliths`,
        visualSpec: {
          weaponSubType: arch.subType,
          primaryHex: dim.primaryHex,
          secondaryHex: w % 2 === 0 ? dim.secondaryHex : '#d97706',
          accentEmissiveHex: dim.accentHex,
          metalness: Number((0.55 + (w % 4) * 0.1).toFixed(2)),
          roughness: Number((0.18 + (w % 5) * 0.1).toFixed(2)),
          transmission: arch.subType === 'prism-saber' ? 0.65 : 0.15,
          scaleLength: Number((0.92 + (w % 4) * 0.08).toFixed(2)),
          hasOpticalCrystal: w % 2 === 0 || tierIdx >= 2,
          hasCoiledConduit: w % 3 === 0 || tierIdx >= 3,
        },
      });
    }

    // 2B. 10 Apparel & Carapace Rigs per dimension (50 apparel)
    for (let a = 0; a < 10; a++) {
      const arch = dim.apparelArchetypes[a % dim.apparelArchetypes.length];
      const matNoun = dim.materialNouns[(a + 3) % dim.materialNouns.length];
      const desc =
        dim.architecturalDescriptors[
          (a + 1) % dim.architecturalDescriptors.length
        ];
      const tierIdx = Math.min(4, Math.floor(a / 2.2));
      const rarity = rarities[tierIdx];

      items.push({
        id: `compendium-app-${dim.boundary}-${a}`,
        catalogNumber: catalogCounter++,
        name: `${matNoun} ${arch.name} Mk.${a + 1}`,
        category: 'apparel',
        subTypeLabel: arch.subTypeLabel,
        weaponSubType: 'gravity-hammer',
        originBoundary: dim.boundary,
        elementAffinity: dim.element,
        rarity,
        stats: {
          damage: 12 + tierIdx * 4,
          excavationPower: 1.0,
          swingSpeedHz: 1.2,
          stabilityBonus: Math.round(arch.stability * (1 + tierIdx * 0.25)),
          massKg: Number((arch.mass * (0.9 + (a % 3) * 0.08)).toFixed(1)),
          reachMeters: 2.2,
        },
        craftCost: {
          primaryMatter: dim.primaryMatter,
          primaryCount: Math.max(1, tierIdx + 1),
          secondaryMatter: dim.secondaryMatter,
          secondaryCount: 1,
        },
        loreProvenance: `${arch.lore} Reinforced with ${matNoun.toLowerCase()} ${desc}.`,
        groundingConnection: `Provides atmospheric & metric shielding in ${dim.originTitle}`,
        visualSpec: {
          weaponSubType: 'gravity-hammer',
          primaryHex: dim.primaryHex,
          secondaryHex: dim.secondaryHex,
          accentEmissiveHex: dim.accentHex,
          metalness: 0.72,
          roughness: 0.28,
          transmission: 0.1,
          scaleLength: 1.0,
          hasOpticalCrystal: tierIdx >= 2,
          hasCoiledConduit: true,
        },
      });
    }

    // 2C. 10 Excavation & Tuning Tools per dimension (50 tools)
    for (let t = 0; t < 10; t++) {
      const arch = dim.toolArchetypes[t % dim.toolArchetypes.length];
      const matNoun = dim.materialNouns[(t + 5) % dim.materialNouns.length];
      const tierIdx = Math.min(4, Math.floor(t / 2.2));
      const rarity = rarities[tierIdx];

      items.push({
        id: `compendium-tool-${dim.boundary}-${t}`,
        catalogNumber: catalogCounter++,
        name: `${matNoun} ${arch.name}Cal.${(t + 1) * 10}`,
        category: 'tool',
        subTypeLabel: arch.subTypeLabel,
        weaponSubType: arch.subType,
        originBoundary: dim.boundary,
        elementAffinity: dim.element,
        rarity,
        stats: {
          damage: 24 + tierIdx * 6,
          excavationPower: Number(
            (arch.excavation * (1 + tierIdx * 0.22)).toFixed(2)
          ),
          swingSpeedHz: 1.55,
          stabilityBonus: 14 + tierIdx * 5,
          massKg: 5.4,
          reachMeters: 3.5,
        },
        craftCost: {
          primaryMatter: dim.primaryMatter,
          primaryCount: 1 + Math.floor(tierIdx / 2),
          secondaryMatter: dim.secondaryMatter,
          secondaryCount: 1,
        },
        loreProvenance: `${arch.lore} Calibrated with ${matNoun.toLowerCase()} bearings for zero-popping terrain excavation.`,
        groundingConnection: `Harvests intact relics from ${dim.originTitle} Grounding Objects`,
        visualSpec: {
          weaponSubType: arch.subType,
          primaryHex: dim.secondaryHex,
          secondaryHex: '#f59e0b',
          accentEmissiveHex: dim.accentHex,
          metalness: 0.82,
          roughness: 0.22,
          transmission: 0.2,
          scaleLength: 1.08,
          hasOpticalCrystal: true,
          hasCoiledConduit: true,
        },
      });
    }

    // 2D. 12 Alchemical & Matter Reagents per dimension (60 reagents)
    for (let r = 0; r < 12; r++) {
      const arch = dim.reagentArchetypes[r % dim.reagentArchetypes.length];
      const matNoun = dim.materialNouns[(r + 2) % dim.materialNouns.length];
      const tierIdx = Math.min(4, Math.floor(r / 2.6));
      const rarity = rarities[tierIdx];

      items.push({
        id: `compendium-reagent-${dim.boundary}-${r}`,
        catalogNumber: catalogCounter++,
        name: `Purified ${matNoun} ${arch.name}`,
        category: 'reagent',
        subTypeLabel: arch.subTypeLabel,
        weaponSubType: 'spore-caster',
        originBoundary: dim.boundary,
        elementAffinity: dim.element,
        rarity,
        stats: {
          damage: 10,
          excavationPower: 1.0,
          swingSpeedHz: 1.0,
          stabilityBonus: 10 + tierIdx * 4,
          massKg: 0.8,
          reachMeters: 1.5,
        },
        craftCost: {
          primaryMatter: dim.primaryMatter,
          primaryCount: 1,
        },
        loreProvenance: `${arch.lore} Extracted from ${matNoun.toLowerCase()} nodes in ${dim.originTitle}.`,
        groundingConnection: `Catalyst for Boundary-Forged synthesis at the Portal Room Crucible`,
        visualSpec: {
          weaponSubType: 'spore-caster',
          primaryHex: dim.accentHex,
          secondaryHex: dim.primaryHex,
          accentEmissiveHex: dim.accentHex,
          metalness: 0.35,
          roughness: 0.15,
          transmission: 0.75,
          scaleLength: 0.85,
          hasOpticalCrystal: true,
          hasCoiledConduit: false,
        },
      });
    }

    // 2E. 10 Named Museum Relics per dimension (50 + 5 = 55 relics)
    for (let rel = 0; rel < 10; rel++) {
      const arch = dim.relicArchetypes[rel % dim.relicArchetypes.length];
      const matNoun = dim.materialNouns[(rel + 6) % dim.materialNouns.length];
      const desc =
        dim.architecturalDescriptors[
          (rel + 2) % dim.architecturalDescriptors.length
        ];
      const tierIdx = Math.min(4, 1 + Math.floor(rel / 2.5));
      const rarity = rarities[tierIdx];

      items.push({
        id: `compendium-relic-${dim.boundary}-${rel}`,
        catalogNumber: catalogCounter++,
        name: `${arch.name} of ${matNoun.split(' ')[0]} (#${rel + 1})`,
        category: 'relic',
        subTypeLabel: arch.subTypeLabel,
        weaponSubType: 'chrono-tuning-fork',
        originBoundary: dim.boundary,
        elementAffinity: dim.element,
        rarity,
        stats: {
          damage: 30 + tierIdx * 8,
          excavationPower: 1.8,
          swingSpeedHz: 1.4,
          stabilityBonus: 25 + tierIdx * 9,
          massKg: 4.2,
          reachMeters: 3.0,
        },
        craftCost: {
          primaryMatter: dim.primaryMatter,
          primaryCount: 2,
          secondaryMatter: dim.secondaryMatter,
          secondaryCount: 1,
        },
        loreProvenance: `${arch.lore} Originally ${desc}. Mount on a Portal Room Museum Plinth to radiate dimensional stability.`,
        groundingConnection: `Physical Museum Artifact of ${dim.originTitle}`,
        visualSpec: {
          weaponSubType: 'chrono-tuning-fork',
          primaryHex: '#f59e0b',
          secondaryHex: dim.primaryHex,
          accentEmissiveHex: dim.accentHex,
          metalness: 0.9,
          roughness: 0.14,
          transmission: 0.45,
          scaleLength: 1.05,
          hasOpticalCrystal: true,
          hasCoiledConduit: true,
        },
      });
    }

    // 2F. 6 Construct Blueprints per dimension (30 blueprints)
    for (let b = 0; b < 6; b++) {
      const arch = dim.blueprintArchetypes[b % dim.blueprintArchetypes.length];
      const matNoun = dim.materialNouns[(b + 4) % dim.materialNouns.length];
      const tierIdx = Math.min(4, 1 + Math.floor(b / 1.6));
      const rarity = rarities[tierIdx];

      items.push({
        id: `compendium-blueprint-${dim.boundary}-${b}`,
        catalogNumber: catalogCounter++,
        name: `${arch.name} · ${matNoun} Plate ${b + 1}`,
        category: 'blueprint',
        subTypeLabel: arch.subTypeLabel,
        weaponSubType: 'prism-saber',
        originBoundary: dim.boundary,
        elementAffinity: dim.element,
        rarity,
        stats: {
          damage: 20,
          excavationPower: 2.0,
          swingSpeedHz: 1.4,
          stabilityBonus: 30 + b * 4,
          massKg: 1.5,
          reachMeters: 2.5,
        },
        craftCost: {
          primaryMatter: dim.primaryMatter,
          primaryCount: 1,
          secondaryMatter: dim.secondaryMatter,
          secondaryCount: 1,
        },
        loreProvenance: `${arch.lore} Etched onto a ${matNoun.toLowerCase()} plate for Portal Room fabrication.`,
        groundingConnection: `Unlocks ${dim.originTitle} structural modules`,
        visualSpec: {
          weaponSubType: 'prism-saber',
          primaryHex: '#06b6d4',
          secondaryHex: dim.primaryHex,
          accentEmissiveHex: '#38bdf8',
          metalness: 0.75,
          roughness: 0.2,
          transmission: 0.6,
          scaleLength: 0.95,
          hasOpticalCrystal: true,
          hasCoiledConduit: false,
        },
      });
    }
  }

  return items;
}

export const BETHESDA_SCALE_COMPENDIUM_CATALOG: DimensionalItemDefinition[] =
  buildDeterministic325Compendium();

export const COMPENDIUM_ITEM_BY_ID: Record<string, DimensionalItemDefinition> =
  Object.fromEntries(
    BETHESDA_SCALE_COMPENDIUM_CATALOG.map((item) => [item.id, item])
  );

const AFFIX_PREFIXES: {
  label: string;
  dmgMult: number;
  excavMult: number;
  speedMult: number;
}[] = [
  { label: 'Hyperbolic', dmgMult: 1.24, excavMult: 1.15, speedMult: 1.05 },
  { label: 'Bathyal-Tempered', dmgMult: 1.18, excavMult: 1.32, speedMult: 1.0 },
  { label: 'Scarpa-Notched', dmgMult: 1.3, excavMult: 1.2, speedMult: 0.96 },
  { label: 'Chrono-Dilated', dmgMult: 1.15, excavMult: 1.1, speedMult: 1.28 },
  { label: 'Piezo-Harmonic', dmgMult: 1.22, excavMult: 1.25, speedMult: 1.12 },
  { label: 'Singularity-Spun', dmgMult: 1.38, excavMult: 1.35, speedMult: 1.08 },
];

const AFFIX_SUFFIXES: {
  label: string;
  stabilityAdd: number;
  element: BaseDimensionalElementId;
}[] = [
  {
    label: 'of the Eleventh Trench',
    stabilityAdd: 18,
    element: 'hydro-superfluid',
  },
  {
    label: 'of Cyclopean Shear',
    stabilityAdd: 24,
    element: 'lithic-crystalline',
  },
  {
    label: 'of Chromatic Refraction',
    stabilityAdd: 16,
    element: 'pyro-vitreous',
  },
  {
    label: 'of Synaptic Spore-Weave',
    stabilityAdd: 20,
    element: 'bio-miasmic',
  },
  {
    label: 'of the 8-Cell Reliquary',
    stabilityAdd: 28,
    element: 'chrono-phase',
  },
];

/**
 * Procedural Dimensional Affix & Imbuement Engine:
 * Forges a unique Boundary-Forged or Mythic Anchor variant from any base compendium item.
 */
export function forgeBoundaryAffixedItem(
  baseItem: DimensionalItemDefinition,
  seedSalt: number
): DimensionalItemDefinition {
  const prefix = AFFIX_PREFIXES[Math.abs(seedSalt) % AFFIX_PREFIXES.length];
  const suffix =
    AFFIX_SUFFIXES[Math.abs(seedSalt * 7 + 3) % AFFIX_SUFFIXES.length];
  const newId = `${baseItem.id}-forged-${Date.now().toString().slice(-4)}`;

  return {
    ...baseItem,
    id: newId,
    name: `${prefix.label} ${baseItem.name.replace(/^Masterwork\s+/i, '')} ${suffix.label}`,
    rarity:
      baseItem.rarity === 'Mythic Anchor'
        ? 'Mythic Anchor'
        : 'Boundary-Forged',
    elementAffinity: suffix.element,
    affixPrefix: prefix.label,
    affixSuffix: suffix.label,
    stats: {
      damage: Math.round(baseItem.stats.damage * prefix.dmgMult),
      excavationPower: Number(
        (baseItem.stats.excavationPower * prefix.excavMult).toFixed(2)
      ),
      swingSpeedHz: Number(
        (baseItem.stats.swingSpeedHz * prefix.speedMult).toFixed(2)
      ),
      stabilityBonus: baseItem.stats.stabilityBonus + suffix.stabilityAdd,
      massKg: baseItem.stats.massKg,
      reachMeters: Number((baseItem.stats.reachMeters * 1.06).toFixed(2)),
    },
  };
}

export function createInitialCompendiumLoadoutState(): CompendiumLoadoutAndMuseumState {
  // Give the player a curated starter kit of 20 iconic items across all 5 dimensions & categories
  // so they can immediately swap 3D weapons/tools in the hotbar and view mounted relics in the Portal Room Museum!
  const starterItems: DimensionalItemDefinition[] = [
    BETHESDA_SCALE_COMPENDIUM_CATALOG[0], // Sunderer of the Ninth Bathyscaphe (cleaver-halberd)
    BETHESDA_SCALE_COMPENDIUM_CATALOG[1], // Scarpa's Monolithic Verdict (gravity-hammer)
    BETHESDA_SCALE_COMPENDIUM_CATALOG[2], // Solstice Vector-Lance (excavating-lance)
    BETHESDA_SCALE_COMPENDIUM_CATALOG[3], // Voice of the Mycelial Choir (spore-caster)
    BETHESDA_SCALE_COMPENDIUM_CATALOG[4], // Chronos-Anchor of the Prime Seed (chrono-tuning-fork)
    BETHESDA_SCALE_COMPENDIUM_CATALOG.find(
      (i) => i.weaponSubType === 'resonance-pistol' && i.category === 'weapon'
    ) ?? BETHESDA_SCALE_COMPENDIUM_CATALOG[7],
    BETHESDA_SCALE_COMPENDIUM_CATALOG.find(
      (i) => i.weaponSubType === 'prism-saber' && i.category === 'weapon'
    ) ?? BETHESDA_SCALE_COMPENDIUM_CATALOG[133],
    BETHESDA_SCALE_COMPENDIUM_CATALOG.find(
      (i) => i.weaponSubType === 'void-arbalest' && i.category === 'weapon'
    ) ?? BETHESDA_SCALE_COMPENDIUM_CATALOG[72],
    ...BETHESDA_SCALE_COMPENDIUM_CATALOG.filter(
      (i) => i.category === 'tool'
    ).slice(0, 4),
    ...BETHESDA_SCALE_COMPENDIUM_CATALOG.filter(
      (i) => i.category === 'apparel'
    ).slice(0, 3),
    ...BETHESDA_SCALE_COMPENDIUM_CATALOG.filter(
      (i) => i.category === 'relic'
    ).slice(0, 6),
    ...BETHESDA_SCALE_COMPENDIUM_CATALOG.filter(
      (i) => i.category === 'reagent'
    ).slice(0, 4),
  ];

  const uniqueIds = Array.from(new Set(starterItems.map((i) => i.id)));
  const quantities: Record<string, number> = {};
  uniqueIds.forEach((id) => {
    quantities[id] = 1;
  });

  // Pre-mount 8 iconic relics & weapons onto the Portal Room Museum Plinths so the 36m×36m Portal Room Gallery is immediately alive!
  const mountedMuseumPlinths: Record<number, string> = {};
  uniqueIds.slice(0, 8).forEach((id, idx) => {
    mountedMuseumPlinths[idx] = id;
  });

  return {
    discoveredItemIds: uniqueIds,
    ownedQuantities: quantities,
    customForgedItems: [],
    equippedRightHandId: uniqueIds[0],
    equippedLeftCatalystId: uniqueIds[4],
    equippedApparelId:
      starterItems.find((i) => i.category === 'apparel')?.id ?? uniqueIds[0],
    quickbarItemIds: [
      uniqueIds[0], // 1: Cleaver-Halberd
      uniqueIds[2], // 2: Excavating-Lance
      uniqueIds[5], // 3: Resonance-Pistol
      uniqueIds[6], // 4: Prism-Saber
      uniqueIds[1], // 5: Gravity-Hammer
    ],
    mountedMuseumPlinths,
  };
}

export function resolveCompendiumItemById(
  id: string,
  state?: CompendiumLoadoutAndMuseumState
): DimensionalItemDefinition {
  if (COMPENDIUM_ITEM_BY_ID[id]) {
    return COMPENDIUM_ITEM_BY_ID[id];
  }
  const custom = state?.customForgedItems.find((c) => c.id === id);
  if (custom) return custom;
  return BETHESDA_SCALE_COMPENDIUM_CATALOG[0];
}
