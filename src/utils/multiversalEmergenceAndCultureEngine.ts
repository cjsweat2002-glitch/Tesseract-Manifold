import * as THREE from 'three';
import { ManifoldWorldSpec } from '../types/manifold';

// ============================================================================
// 1. SIX BASE DIMENSIONAL ELEMENTS & FIVE VOID SEED ORIGINS
// ============================================================================

export type BaseDimensionalElementId =
  | 'lithic-crystalline'
  | 'hydro-superfluid'
  | 'aero-cymatic'
  | 'pyro-vitreous'
  | 'chrono-phase'
  | 'bio-miasmic';

export interface BaseDimensionalElementSpec {
  id: BaseDimensionalElementId;
  name: string;
  shortName: string;
  nativeDimensions: string;
  colorHex: string;
  emissiveHex: string;
  fieldEquationFormula: string;
  playerCombatEffect: string;
  nativeSurvivalRoutine: string;
  outsiderHorrorAppearance: string;
  decodedMasteryMechanic: string;
  damageMultiplier: number;
  stealthNoiseModifier: number;
}

const RAW_BASE_DIMENSIONAL_ELEMENTS: Record<
  BaseDimensionalElementId,
  BaseDimensionalElementSpec
> = {
  'lithic-crystalline': {
    id: 'lithic-crystalline',
    name: 'Lithic-Crystalline Lattice',
    shortName: 'Lithic',
    nativeDimensions: '1D–2D Planar Shear',
    colorHex: '#f59e0b',
    emissiveHex: '#d97706',
    fieldEquationFormula: '∇²Φ_lattice − κ·∂²u/∂t² = σ_cleave',
    playerCombatEffect:
      'Calcifies held weapons for +45% limb-severing cleave and shatters enemy armor.',
    nativeSurvivalRoutine:
      'Villagers petrify their own skin and grow interlocking quartz plates over their huts during razor-shard squalls.',
    outsiderHorrorAppearance:
      'Horrific living statues violently snapping their own calcified joints with deafening stone-shatter cracks.',
    decodedMasteryMechanic:
      'Instant Carapace Calcification: Absorb fatal shear strikes and crystallize spilled blood into jagged caltrops.',
    damageMultiplier: 1.45,
    stealthNoiseModifier: 1.15,
  },
  'hydro-superfluid': {
    id: 'hydro-superfluid',
    name: 'Hydro-Superfluid Vortex',
    shortName: 'Superfluid',
    nativeDimensions: '3D Laminar Basin',
    colorHex: '#06b6d4',
    emissiveHex: '#0891b2',
    fieldEquationFormula: '∂ω/∂t + (v·∇)ω = (ω·∇)v (ν → 0)',
    playerCombatEffect:
      'Zero-viscosity hydraulic whip strikes and frictionless slide-dashes.',
    nativeSurvivalRoutine:
      'Denizens liquefy their lower extremities into frictionless mercury-like jets to glide across toxic mudflats.',
    outsiderHorrorAppearance:
      'Boneless gelatinous entities slithering at impossible velocities while pumping pressurized ichor through external tubes.',
    decodedMasteryMechanic:
      'Laminar Slide-Slip: Zero-friction ground dashing and high-pressure arterial siphon jets.',
    damageMultiplier: 1.25,
    stealthNoiseModifier: 0.65,
  },
  'aero-cymatic': {
    id: 'aero-cymatic',
    name: 'Aero-Cymatic Resonance',
    shortName: 'Cymatic',
    nativeDimensions: '3D–4D Barometric Choir',
    colorHex: '#38bdf8',
    emissiveHex: '#0284c7',
    fieldEquationFormula: '∂²P/∂t² − c²∇²P = S_standing(ω_0)',
    playerCombatEffect:
      'Silent acoustic cavitation waves that rupture internal organs without alerting nearby patrols.',
    nativeSurvivalRoutine:
      'Settlements hum standing-wave chords that bend lethal barometric thunder around their camps in shimmering domes.',
    outsiderHorrorAppearance:
      'Faceless choirs whose throats balloon like translucent amphibians, levitating boulders with eerie silent vibrations.',
    decodedMasteryMechanic:
      'Null-Acoustic Shroud: Mute all footstep/combat noise and project organ-rupturing standing waves.',
    damageMultiplier: 1.3,
    stealthNoiseModifier: 0.25,
  },
  'pyro-vitreous': {
    id: 'pyro-vitreous',
    name: 'Pyro-Vitreous Fulgurite',
    shortName: 'Vitreous',
    nativeDimensions: '6D Magmatic Core',
    colorHex: '#f43f5e',
    emissiveHex: '#e11d48',
    fieldEquationFormula: '∂T/∂t = α∇²T + J²/σ_obsidian',
    playerCombatEffect:
      'Superheats improvised weapons into white-hot obsidian lances that cauterize and vaporize tissue.',
    nativeSurvivalRoutine:
      'Harvesters exhale plasma arcs to spin molten sand into insulated obsidian-glass domes before ash storms hit.',
    outsiderHorrorAppearance:
      'Incandescent wraiths vomiting liquid glass and welding their own severed limbs back together with lightning.',
    decodedMasteryMechanic:
      'Fulgurite Flash-Weld: Cauterize bleeding wounds instantly and vitrify enemy limbs into brittle glass.',
    damageMultiplier: 1.55,
    stealthNoiseModifier: 1.25,
  },
  'chrono-phase': {
    id: 'chrono-phase',
    name: 'Chrono-Phase Slip',
    shortName: 'Chrono',
    nativeDimensions: '4D–5D Hyperbolic Fold',
    colorHex: '#a855f7',
    emissiveHex: '#9333ea',
    fieldEquationFormula: 'ds² = −e^{2Φ}dt² + e^{-2kr}(dx² + dy² + dz²)',
    playerCombatEffect:
      'Phase-shifts strikes past shields and freezes severed limbs in mid-air as stepping stones.',
    nativeSurvivalRoutine:
      'Nomads step sideways into yesterday’s shadow for three seconds whenever an apex leviathan sweeps their ridge.',
    outsiderHorrorAppearance:
      'Flickering multi-limbed phantoms that appear in three places at once and reach inside your chest without touching your skin.',
    decodedMasteryMechanic:
      'Hyperbolic Phase-Step: Blink-dodge through incoming attacks and delay kinetic trauma on struck targets.',
    damageMultiplier: 1.35,
    stealthNoiseModifier: 0.45,
  },
  'bio-miasmic': {
    id: 'bio-miasmic',
    name: 'Bio-Miasmic Symbiosis',
    shortName: 'Bio-Miasma',
    nativeDimensions: '7D Chitinous Abyss',
    colorHex: '#10b981',
    emissiveHex: '#059669',
    fieldEquationFormula: '∂C/∂t = D∇²C + μC(1 − C/K) − γ_graft',
    playerCombatEffect:
      'Infects wounds with parasitic tendrils that puppets staggered enemies and accelerates organ harvesting.',
    nativeSurvivalRoutine:
      'Clansweaver families share circulatory systems through umbilical spore-vines to survive sub-zero void nights.',
    outsiderHorrorAppearance:
      'Grotesque flesh-weavers stitching living breathing organs onto their walls and drinking pheromonal spore-ichor.',
    decodedMasteryMechanic:
      'Pheromonal Camouflage & Live Graft: Mask your outworlder scent so natives treat you as kin, and graft severed limbs mid-combat.',
    damageMultiplier: 1.4,
    stealthNoiseModifier: 0.5,
  },
};

export const BASE_DIMENSIONAL_ELEMENTS: Record<
  BaseDimensionalElementId,
  BaseDimensionalElementSpec
> = new Proxy(RAW_BASE_DIMENSIONAL_ELEMENTS, {
  get(target, prop: string | symbol) {
    if (typeof prop === 'string' && prop in target) {
      return target[prop as BaseDimensionalElementId];
    }
    return target['chrono-phase'];
  },
});


export type VoidSeedElementId =
  | 'singularity-graviton'
  | 'vitreous-chronoplasm'
  | 'abyssal-bio-miasma'
  | 'aetherial-fulmination'
  | 'null-acoustic-resonance';

export interface VoidSeedOriginSpec {
  id: VoidSeedElementId;
  name: string;
  subtitle: string;
  coreColor: string;
  rimColor: string;
  traumaTitle: string;
  traumaCutscenePhases: {
    phaseTitle: string;
    narration: string;
    visualCue: string;
    psychologicalImprint: string;
  }[];
  startingBaseElement: BaseDimensionalElementId;
  uniqueVoidPower: string;
  sanctumArchitectureStyle: string;
}

export const VOID_SEED_ORIGINS: Record<VoidSeedElementId, VoidSeedOriginSpec> = {
  'singularity-graviton': {
    id: 'singularity-graviton',
    name: 'Graviton Shear Seed',
    subtitle: 'High-Mass Telekinetic Implosion & Structural Severance',
    coreColor: '#c084fc',
    rimColor: '#6366f1',
    traumaTitle: 'Trauma of the Imploded Hearth',
    traumaCutscenePhases: [
      {
        phaseTitle: 'I. The Euclidean Collapse',
        narration:
          'When the 7th-Dimensional Rift tore through your home spire, you reached out with your bare left hand to hold the collapsing support beam above your kin.',
        visualCue: 'Golden architectural columns bending inward toward a pitch-black micro-singularity.',
        psychologicalImprint: 'Survivors Guilt Weight: Heavy footsteps generate micro-seismic tremors when adrenaline peaks.',
      },
      {
        phaseTitle: 'II. The Singularity Graft',
        narration:
          'Instead of crushing you, the runaway Graviton Seed burrowed into your left metacarpals—compressing an entire collapsed city block into a spinning obsidian sphere inside your palm.',
        visualCue: 'Left hand skeletal phalanges glowing violet as metallic tendons fuse around a miniature event horizon.',
        psychologicalImprint: 'Spatial Paranoia: You instinctively sense structural weak points in every creature and wall.',
      },
      {
        phaseTitle: 'III. Exile into the Manifold',
        narration:
          'Hurled across the dimensional membrane, native cultures now recoil from the gravitational lensing warping the air around your left fist.',
        visualCue: 'Waking on alien hyperbolic soil as native sentinels watch from the ridge in terrified awe.',
        psychologicalImprint: 'Graviton Dominance: +35% dismemberment force and long-range telekinetic object ripping.',
      },
    ],
    startingBaseElement: 'lithic-crystalline',
    uniqueVoidPower: 'Graviton Crush & Telekinetic Limb Rip',
    sanctumArchitectureStyle: 'Floating Basalt Monoliths & Inverted Gravity Wells',
  },
  'vitreous-chronoplasm': {
    id: 'vitreous-chronoplasm',
    name: 'Vitreous Chronoplasm Seed',
    subtitle: 'Temporal Phase-Locking & Crystalline Shatter Gore',
    coreColor: '#38bdf8',
    rimColor: '#f43f5e',
    traumaTitle: 'Trauma of the Frozen Eon',
    traumaCutscenePhases: [
      {
        phaseTitle: 'I. The Glass Cataclysm',
        narration:
          'Time vitrified in your origin sector. For four hundred subjective years, you were trapped fully conscious inside a block of chronoplasmic glass while your world burned outside.',
        visualCue: 'Refracted crimson flames frozen mid-flicker across a fractured crystalline horizon.',
        psychologicalImprint: 'Chrono-Dissociation: Crisis states slow perceived enemy motion by 40%.',
      },
      {
        phaseTitle: 'II. Shattering the Amber',
        narration:
          'You tore your left arm free by absorbing the core of the Chronoplasm anomaly directly into your radial artery, replacing your pulse with a ticking relativistic clock.',
        visualCue: 'Shards of glowing cyan-crimson glass orbiting a clockwork singularity in the left palm.',
        psychologicalImprint: 'Entropy Vision: You see temporal echoes of where NPCs stood moments ago.',
      },
      {
        phaseTitle: 'III. The Out-of-Sync Stranger',
        narration:
          'To native denizens, your movements stutter like a scratched hologram—marking you immediately as an unnatural anomaly from beyond time.',
        visualCue: 'Stepping out of a shattered time-mirror onto the Prime Genesis Basin.',
        psychologicalImprint: 'Chrono-Shatter: Freeze bleeding wounds into brittle glass and shatter limbs on impact.',
      },
    ],
    startingBaseElement: 'chrono-phase',
    uniqueVoidPower: 'Temporal Stasis Bubble & Brittle Shatter Strike',
    sanctumArchitectureStyle: 'Refractive Prismatic Conservatory & Stasis Vaults',
  },
  'abyssal-bio-miasma': {
    id: 'abyssal-bio-miasma',
    name: 'Abyssal Bio-Miasma Seed',
    subtitle: 'Visceral Tissue Assimilation & Pheromonal Hive Shroud',
    coreColor: '#10b981',
    rimColor: '#fbbf24',
    traumaTitle: 'Trauma of the Flesh-Cradle',
    traumaCutscenePhases: [
      {
        phaseTitle: 'I. The Symbiotic Plague',
        narration:
          'When the Abyssal Spore-Tide swallowed your research outpost, every survivor was dissolved into a single collective biomass—except you.',
        visualCue: 'Bioluminescent emerald mycelium tendrils weaving through ruined titanium bulkheads.',
        psychologicalImprint: 'Somatic Hunger: Freshly severed organs restore vitality and calm your Void tremor.',
      },
      {
        phaseTitle: 'II. Mastering the Parasite',
        narration:
          'You bound the Queen-Nucleus inside your left palm, forcing its ravenous mutagenic helices to obey your nervous system at the cost of constant biological metamorphosis.',
        visualCue: 'Chitinous plates and pulsing emerald veins wrapping around the left forearm.',
        psychologicalImprint: 'Visceral Empathy: You can smell the fear, hunger, and deceit of every living creature.',
      },
      {
        phaseTitle: 'III. The Walking Chimera',
        narration:
          'Native tribes see your mutating silhouette as either a sacred flesh-deity or an existential contagion that must be lured into a purifying fire.',
        visualCue: 'Flexing articulated claws as spore-mist rises from the left palm.',
        psychologicalImprint: 'Apex Assimilation: Instant field-grafting of severed creature limbs and pheromonal stealth.',
      },
    ],
    startingBaseElement: 'bio-miasmic',
    uniqueVoidPower: 'Parasitic Tendril Lash & Instant Limb Assimilation',
    sanctumArchitectureStyle: 'Living Bioluminescent Hive-Cathedral & Gene Pools',
  },
  'aetherial-fulmination': {
    id: 'aetherial-fulmination',
    name: 'Aetherial Fulmination Seed',
    subtitle: 'Relativistic Arc-Severing & Neural Synapse Hijacking',
    coreColor: '#f59e0b',
    rimColor: '#38bdf8',
    traumaTitle: 'Trauma of the Arc-Shattered Sky',
    traumaCutscenePhases: [
      {
        phaseTitle: 'I. The Ionospheric Collapse',
        narration:
          'A 6th-dimensional fulgurite storm discharging a billion volts struck your high-altitude skimmer, vaporizing the hull around you.',
        visualCue: 'Branching violet-gold lightning freezing in mid-air around a falling cockpit.',
        psychologicalImprint: 'Hyper-Conductive Nerves: Reflexive arc-parry discharges when struck in melee.',
      },
      {
        phaseTitle: 'II. Capturing the Ball-Lightning',
        narration:
          'Your left gauntlet fused with the relativistic plasma core, turning your left hand into a living magnetic containment bottle.',
        visualCue: 'Crackling golden-cyan plasma arcs bridging between the five fingertips.',
        psychologicalImprint: 'Synaptic Readout: You sense electrical nervous impulses of nearby ambushers through walls.',
      },
      {
        phaseTitle: 'III. The Stormbringer Outcast',
        narration:
          'Wherever you walk, compasses spin and native cymatic totemshum with static—drawing both awe and covert sabotage from local shamans.',
        visualCue: 'Grounded lightning scorching a geometric sigil around your boots.',
        psychologicalImprint: 'Fulmination Cleave: Chain-lightning dismemberment and high-voltage object infusion.',
      },
    ],
    startingBaseElement: 'pyro-vitreous',
    uniqueVoidPower: 'Relativistic Plasma Cleave & Neural Hijack',
    sanctumArchitectureStyle: 'Fulgurite Glass Dynamo Spire & Tesla Sanctum',
  },
  'null-acoustic-resonance': {
    id: 'null-acoustic-resonance',
    name: 'Null-Acoustic Resonance Seed',
    subtitle: 'Silent Cymatic Cavitation & Total Sound Cancellation',
    coreColor: '#22d3ee',
    rimColor: '#a855f7',
    traumaTitle: 'Trauma of the Silent Choir',
    traumaCutscenePhases: [
      {
        phaseTitle: 'I. The Frequency That Erased a World',
        narration:
          'An antagonist Resonant Leviathan sang the anti-frequency of your home continuum, causing mountains and cities to liquefy into silent dust.',
        visualCue: 'Cymatic Chladni patterns rippling across terrain before dissolving into mist.',
        psychologicalImprint: 'Absolute Silence: Your footsteps make zero acoustic noise while crouching.',
      },
      {
        phaseTitle: 'II. Swallowing the Anti-Chord',
        narration:
          'You trapped the inverted standing wave inside a hollow cymatic sphere in your left palm, forever muting your own voice in exchange for command over wave physics.',
        visualCue: 'Concentric harmonic rings rotating silently inside a translucent dark-matter orb.',
        psychologicalImprint: 'Echolocation Sight: Every sound in the world paints a glowing ripple in your peripheral vision.',
      },
      {
        phaseTitle: 'III. Ghost of the Manifold',
        narration:
          'Because you cast no acoustic shadow, native creatures cannot hear you approach—and when they finally see you, they believe you are a vengeful spirit.',
        visualCue: 'Emerging unseen behind a native patrol amidst swirling cymatic dust.',
        psychologicalImprint: 'Cavitation Rupture: Silent internal organ implosions and acoustic distraction lures.',
      },
    ],
    startingBaseElement: 'aero-cymatic',
    uniqueVoidPower: 'Silent Cavitation Implosion & Acoustic Decoy Projection',
    sanctumArchitectureStyle: 'Suspended Cymatic Chladni Amphitheater',
  },
};

export type VoidBallActivationMode =
  | 'dormant-clenched'
  | 'hand-inventory-bloom'
  | 'walk-in-sanctum-portal';

export interface VoidwalkerCustomizationConfig {
  walkerName: string;
  voidSeedId: VoidSeedElementId;
  primaryBaseElement: BaseDimensionalElementId;
  exoskeletalBuild: 'lithe-stalker' | 'balanced-strider' | 'juggernaut-carapace';
  carapaceWeathering: 'obsidian-scarred' | 'iridescent-chitin' | 'calcified-bone' | 'fulgurite-chrome';
  visorSpectrum: 'infrared-predator' | 'cymatic-echolocation' | 'temporal-phase' | 'tri-optic-tactical';
  bodyArchetype:
    | 'chitin-nomad'
    | 'vitreous-diver'
    | 'mycelial-symbiont'
    | 'ossified-cantor'
    | 'ferro-seraph'
    | 'original-construct';
  skinTopology: import('../types/manifold').SkinTopologyStyle;
  heightScale: number;
  shoulderBreadth: number;
  cranialCrestHeight: number;
  traumaChoice: 'embrace-chaos' | 'suppress-pain' | 'fracture-ego';
  hasCompletedOriginCutscene: boolean;
}

export const DEFAULT_VOIDWALKER_CUSTOMIZATION: VoidwalkerCustomizationConfig = {
  walkerName: 'Kaelen-7 (Voidwalker)',
  voidSeedId: 'singularity-graviton',
  primaryBaseElement: 'lithic-crystalline',
  exoskeletalBuild: 'balanced-strider',
  carapaceWeathering: 'obsidian-scarred',
  visorSpectrum: 'tri-optic-tactical',
  bodyArchetype: 'ferro-seraph',
  skinTopology: 'myofibril-striated-cuticle',
  heightScale: 1.0,
  shoulderBreadth: 1.0,
  cranialCrestHeight: 1.0,
  traumaChoice: 'embrace-chaos',
  hasCompletedOriginCutscene: false,
};

// ============================================================================
// 2. FAR CRY-INSPIRED DIMENSIONAL DEVIANCE PERK TREES
// ============================================================================

export type PerkBranchId =
  | 'predator-lethality'
  | 'dimensional-phase'
  | 'biomechanical-assimilation'
  | 'sanctum-cultural-mastery';

export interface DimensionalPerkNode {
  id: string;
  branch: PerkBranchId;
  tier: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  costXP: number;
  description: string;
  somaticMutationVisual: string;
  sanctumUpgradeEffect: string;
  prerequisiteId?: string;
}

export const DIMENSIONAL_PERK_TREE: DimensionalPerkNode[] = [
  // Branch 1: Predator & Somatic Lethality (1D–2D Shear)
  {
    id: 'perk-silent-execution',
    branch: 'predator-lethality',
    tier: 1,
    title: 'Silent Void-Shear Takedown',
    subtitle: 'Stealth Assassination & Instant Severance',
    costXP: 1,
    description:
      'Striking an unaware or suspicious enemy from behind or crouch-stealth instantly severs their cervical spine or primary locomotion limb without alerting nearby kin.',
    somaticMutationVisual: 'Elongated obsidian wrist-mantis blades along the right forearm.',
    sanctumUpgradeEffect: 'Unlocks the Predator Trophy Rack in your Personal Void Sanctum.',
  },
  {
    id: 'perk-improvised-impale',
    branch: 'predator-lethality',
    tier: 2,
    title: 'Ballistic Limb & Boulder Impale',
    subtitle: 'Heavy Thrown Object Lethality (+75% Throw Force)',
    costXP: 2,
    description:
      'Hurling grabbed world rocks, crystalline spires, or severed enemy limbs deals massive dismemberment trauma and pins targets to terrain.',
    somaticMutationVisual: 'Pneumatic tendon coils braided across both deltoids.',
    sanctumUpgradeEffect: 'Adds a Ballistic Weapon Rack inside the Sanctum Armory.',
    prerequisiteId: 'perk-silent-execution',
  },
  {
    id: 'perk-chain-severance',
    branch: 'predator-lethality',
    tier: 3,
    title: 'Far-Strike Chain Takedown',
    subtitle: 'Multi-Target Relativistic Follow-Up',
    costXP: 3,
    description:
      'After dismembering an enemy in melee, automatically hurl a Void-infused shard at the nearest secondary witness within 14m.',
    somaticMutationVisual: 'Twin predatory optic laser-lenses emerge on the helmet brow.',
    sanctumUpgradeEffect: 'Expands the Sanctum Combat Crucible with live holo-targets.',
    prerequisiteId: 'perk-improvised-impale',
  },
  {
    id: 'perk-aerial-void-drop',
    branch: 'predator-lethality',
    tier: 4,
    title: 'Apex Singularity Death-From-Above',
    subtitle: 'Aerial Slam Dismemberment & Shockwave',
    costXP: 4,
    description:
      'Striking while airborne slams down with a gravitational shear wave that cleaves the target below and knocks down all surrounding enemies.',
    somaticMutationVisual: 'Dorsal raptor-stabilizer fins unfurl from the spine pack.',
    sanctumUpgradeEffect: 'Crowns the Sanctum Zenith with an Apex Leviathan Skull Monolith.',
    prerequisiteId: 'perk-chain-severance',
  },

  // Branch 2: Dimensional Phase & Matter State (3D–5D Manifold)
  {
    id: 'perk-superfluid-slide',
    branch: 'dimensional-phase',
    tier: 1,
    title: 'Superfluid Laminar Dash',
    subtitle: 'Zero-Friction Crouch Slide & Dodge',
    costXP: 1,
    description:
      'Sprinting into stealth-crouch triggers a zero-viscosity superfluid burst (+40% mobility) that slips underneath horizontal attacks.',
    somaticMutationVisual: 'Iridescent superfluid channels glow along the knee and ankle joints.',
    sanctumUpgradeEffect: 'Floods the Sanctum floor rim with laminar reflection pools.',
  },
  {
    id: 'perk-telekinetic-snatch',
    branch: 'dimensional-phase',
    tier: 2,
    title: 'Long-Range Graviton Snatch',
    subtitle: 'Pull World Objects & Severed Organs from 18m',
    costXP: 2,
    description:
      'Grab boulders, volatile ampoules, or freshly severed limbs from up to 18 meters away directly into your grip.',
    somaticMutationVisual: 'Rotating graviton rings orbit the left wrist cuff.',
    sanctumUpgradeEffect: 'Installs a Floating Orbital Storage Ring in the Sanctum.',
    prerequisiteId: 'perk-superfluid-slide',
  },
  {
    id: 'perk-phase-step-blink',
    branch: 'dimensional-phase',
    tier: 3,
    title: 'Non-Euclidean Phase-Step',
    subtitle: 'Fold Space to Blink Behind Enemies',
    costXP: 3,
    description:
      'Channel Chrono-Phase physics to step sideways through 4D curvature, reappearing behind hostiles or escaping sabotage ambushes.',
    somaticMutationVisual: 'Translucent 4D afterimage trails shimmer behind the shoulders.',
    sanctumUpgradeEffect: 'Opens the 4D Tesseract Observatory balcony inside the Sanctum.',
    prerequisiteId: 'perk-telekinetic-snatch',
  },
  {
    id: 'perk-riemannian-singularity',
    branch: 'dimensional-phase',
    tier: 4,
    title: 'Horizon Rupture Cataclysm',
    subtitle: 'Weaponize Dimensional Curvature',
    costXP: 4,
    description:
      'Elemental infusions trigger cross-dimensional chain reactions that warp local gravity and crystallize or vaporize enemy squads.',
    somaticMutationVisual: 'A radiant dimensional halo crown levitates behind the cervical spine.',
    sanctumUpgradeEffect: 'Unlocks the Multiversal Stargate Spire inside the Sanctum.',
    prerequisiteId: 'perk-phase-step-blink',
  },

  // Branch 3: Biomechanical Assimilation & Survival (6D–7D Entropic)
  {
    id: 'perk-visceral-hemostasis',
    branch: 'biomechanical-assimilation',
    tier: 1,
    title: 'Arterial Siphon & Trauma Surge',
    subtitle: 'Heal from Dismemberment & Adrenaline Recovery',
    costXP: 1,
    description:
      'Severing enemy limbs or harvesting organs siphons pressurized ichor to restore player Somatic Integrity and clear trauma distortion.',
    somaticMutationVisual: 'Pulsing crimson-emerald vascular conduits weave across the chest plate.',
    sanctumUpgradeEffect: 'Constructs the Bio-Regeneration Basin inside the Sanctum.',
  },
  {
    id: 'perk-live-limb-graft',
    branch: 'biomechanical-assimilation',
    tier: 2,
    title: 'Field Chimera Limb-Grafting',
    subtitle: 'Assimilate Severed Creature Limbs for Active Buffs',
    costXP: 2,
    description:
      'Grafting a severed creature limb or organ grants +25% bonus speed/jump and adopts that creature’s native elemental resistance.',
    somaticMutationVisual: 'Asymmetric chitinous shoulder spikes and grafted tendon bundles.',
    sanctumUpgradeEffect: 'Unlocks the Somatic Gene-Splicing Vivarium in the Sanctum.',
    prerequisiteId: 'perk-visceral-hemostasis',
  },
  {
    id: 'perk-reactive-carapace',
    branch: 'biomechanical-assimilation',
    tier: 3,
    title: 'Fulgurite Reflex Carapace',
    subtitle: 'Auto-Counter & Shockwave on Incoming Strike',
    costXP: 3,
    description:
      'When struck by an antagonist or ambusher, your carapace discharges a vitrifying blast that staggers and exposes the attacker’s tendons.',
    somaticMutationVisual: 'Hexagonal obsidian-glass scales armor the thoracic ribcage.',
    sanctumUpgradeEffect: 'Adds the Obsidian Forge & Carapace Anvil to the Sanctum.',
    prerequisiteId: 'perk-live-limb-graft',
  },
  {
    id: 'perk-scarred-nemesis-dominion',
    branch: 'biomechanical-assimilation',
    tier: 4,
    title: 'Abyssal Overlord Pheromones',
    subtitle: 'Subjugate Wounded Enemies into Faction Thralls',
    costXP: 4,
    description:
      'Critically wounded enemies can be infected with Bio-Miasmic spores to fight alongside you against their own settlement or apex antagonists.',
    somaticMutationVisual: 'Bioluminescent spore-vents crown the pauldrons.',
    sanctumUpgradeEffect: 'Creates a Thrall & Companion Stasis Alcove in the Sanctum.',
    prerequisiteId: 'perk-reactive-carapace',
  },

  // Branch 4: Sanctum Architect & Cultural Mastery (Multiversal)
  {
    id: 'perk-clarkean-decoder',
    branch: 'sanctum-cultural-mastery',
    tier: 1,
    title: 'Epistemological Lens (Decode Alien Magic)',
    subtitle: '2x Faster Decoding of Native Elemental Routines',
    costXP: 1,
    description:
      'Observing native denizens performing seeming "magic" or "alien horrors" rapidly decodes the underlying Base Dimensional Element for your own use.',
    somaticMutationVisual: 'Multi-spectral analytical iris rings etched into the visor.',
    sanctumUpgradeEffect: 'Builds the Cultural Epistemology Archive in the Sanctum.',
  },
  {
    id: 'perk-trojan-betrayal-sense',
    branch: 'sanctum-cultural-mastery',
    tier: 2,
    title: 'Xenophobic Deceit Detector',
    subtitle: 'Sense Sabotage Quest Traps & Eavesdrop from 22m',
    costXP: 2,
    description:
      'Reveals micro-tremors and pheromonal deceit when native NPCs attempt to manipulate you into a Trojan Sabotage Questline.',
    somaticMutationVisual: 'Acoustic cymatic antennae flare from the helmet temples.',
    sanctumUpgradeEffect: 'Installs the Conspiracy & Faction Holomap Table in the Sanctum.',
    prerequisiteId: 'perk-clarkean-decoder',
  },
  {
    id: 'perk-sanctum-crucible-expansion',
    branch: 'sanctum-cultural-mastery',
    tier: 3,
    title: 'Pocket Continuum Expansion (Tier-II Sanctum)',
    subtitle: 'Expand Walk-In Void Portal with Elemental Forge',
    costXP: 3,
    description:
      'Expands the interior geometry of your Walk-In Personal Void Sanctum with an Elemental Weapon Infusion Crucible and Stasis Armory.',
    somaticMutationVisual: 'Left-hand Void Ball gains a triple-gimbal astrolabe containment ring.',
    sanctumUpgradeEffect: 'Physically expands the 3D Walk-In Sanctum radius and adds outer sanctum pillars.',
    prerequisiteId: 'perk-trojan-betrayal-sense',
  },
  {
    id: 'perk-counter-sabotage-mastery',
    branch: 'sanctum-cultural-mastery',
    tier: 4,
    title: 'Architect of the Reversed Trap',
    subtitle: 'Turn Sabotage Questlines into Faction Cataclysms',
    costXP: 4,
    description:
      'Reversing a native faction’s sabotage trap triggers a dimensional cascade that converts their settlement totem into your permanent Void Anchor.',
    somaticMutationVisual: 'Radiant multiversal glyphs inscribed across the entire exoskeleton.',
    sanctumUpgradeEffect: 'Completes the Grand Citadel Sanctum Ring with autonomous Void Turrets.',
    prerequisiteId: 'perk-sanctum-crucible-expansion',
  },
];

// ============================================================================
// 3. DEEP "SIMS-SCALE" AUTONOMOUS LIFE, CULTURE & DECEPTIVE QUESTLINES
// ============================================================================

export type DenizenCulturalRole =
  | 'cymatic-storm-weaver'
  | 'lithic-shutter-mason'
  | 'bio-graft-apothecarist'
  | 'chrono-ridge-sentinel'
  | 'vitreous-hearth-keeper';

export type DenizenDailyActivity =
  | 'gathering-elemental-shards'
  | 'fortifying-noise-shelter'
  | 'performing-mundane-magic-ritual'
  | 'running-goods-and-services-bazaar'
  | 'communal-kinship-feast'
  | 'mourning-severed-kin'
  | 'plotting-outworlder-sabotage'
  | 'fleeing-antagonist-raid';

export type EpistemologicalPerceptionStage =
  | 'incomprehensible-alien-horror'
  | 'arcane-dimensional-magic'
  | 'decoded-shared-survival-mechanic';

export interface AutonomousDenizenSimState {
  entityId: string;
  entityName: string;
  culturalRole: DenizenCulturalRole;
  nativeElement: BaseDimensionalElementId;
  // 5 Sims-scale Needs (0 to 100)
  somaticHunger: number;
  noiseShieldComfort: number;
  socialKinship: number;
  ritualFulfillment: number;
  outworlderXenophobia: number; // Higher = more likely to fear/manipulate the player
  // Current activity & social bond
  currentActivity: DenizenDailyActivity;
  activityDescription: string;
  outsiderPerceivedDescription: string;
  bondedKinEntityId: string | null;
  isPlottingSabotage: boolean;
  isScarredNemesis: boolean;
  scarredMissingLimb?: string;
}

export interface EmergentCulturalQuestline {
  id: string;
  settlementName: string;
  giverEntityId: string;
  giverName: string;
  nativeElement: BaseDimensionalElementId;
  title: string;
  // What the NPC tells the player (bounded cultural framing)
  statedCulturalObjective: string;
  statedRewardPromise: string;
  // Underlying reality: genuine mutual survival OR deceptive Trojan sabotage!
  isDeceptiveSabotage: boolean;
  hiddenSabotageTruth: string;
  sabotageRevealedToPlayer: boolean;
  // Progress & coordinates
  targetCoords: [number, number];
  currentStep: 1 | 2 | 3;
  totalSteps: 3;
  stepLabels: [string, string, string];
  status: 'active' | 'completed-ally' | 'sabotage-triggered' | 'sabotage-reversed';
}

export interface CulturalSettlement3DRig {
  rootGroup: THREE.Group;
  settlementName: string;
  cultureTitle: string;
  nativeElement: BaseDimensionalElementId;
  centerPos: THREE.Vector3;
  totemMesh: THREE.Object3D;
  noiseDomeMesh: THREE.Mesh;
  shelterHuts: THREE.Object3D[];
  urbanDistrictGroup: THREE.Group;
  denseCitySpireGroup: THREE.Group;
  denizenPlumbobs: Map<string, THREE.Group>;
  socialTetherLines: THREE.LineSegments;
  environmentalNoiseLevel: number; // 0 to 1 (sweeping barometric/dimensional noise)
  noiseStormActive: boolean;
  // Sims Goods & Services + Urbanization Progression (Hearth-Village -> Urban District -> Dense City)
  urbanizationScore: number; // 0 to 100
  urbanizationTier: 'hearth-village' | 'urban-district' | 'dense-city';
  goodsAndServicesRate: number;
  hasSpawnedShadowMaze: boolean;
  urbanNoclipCooldownSec: number;
}

const CULTURAL_ROLES: DenizenCulturalRole[] = [
  'cymatic-storm-weaver',
  'lithic-shutter-mason',
  'bio-graft-apothecarist',
  'chrono-ridge-sentinel',
  'vitreous-hearth-keeper',
];

export function resolveNativeElementForDimension(
  dimIndex: number,
  seed: number
): BaseDimensionalElementId {
  const idx = Math.floor(Math.abs(dimIndex * 1.7 + seed)) % 6;
  const keys = Object.keys(BASE_DIMENSIONAL_ELEMENTS) as BaseDimensionalElementId[];
  return keys[idx] ?? 'lithic-crystalline';
}

export function createAutonomousDenizenSimState(
  entityId: string,
  entityName: string,
  dimIndex: number,
  index: number,
  seed: number
): AutonomousDenizenSimState {
  const nativeElement = resolveNativeElementForDimension(dimIndex, seed + index);
  const elemSpec = BASE_DIMENSIONAL_ELEMENTS[nativeElement];
  const role = CULTURAL_ROLES[(seed + index) % CULTURAL_ROLES.length];
  const xenoBase = 38 + ((seed * 17 + index * 29) % 52); // 38..90
  const isPlotting = xenoBase >= 64;

  return {
    entityId,
    entityName,
    culturalRole: role,
    nativeElement,
    somaticHunger: 65 + (index * 11) % 30,
    noiseShieldComfort: 70 + (index * 7) % 25,
    socialKinship: 60 + (index * 13) % 35,
    ritualFulfillment: 55 + (index * 19) % 40,
    outworlderXenophobia: xenoBase,
    currentActivity: isPlotting
      ? 'plotting-outworlder-sabotage'
      : 'performing-mundane-magic-ritual',
    activityDescription: elemSpec.nativeSurvivalRoutine,
    outsiderPerceivedDescription: elemSpec.outsiderHorrorAppearance,
    bondedKinEntityId: null,
    isPlottingSabotage: isPlotting,
    isScarredNemesis: false,
  };
}

export function generateEmergentCulturalQuestline(
  world: ManifoldWorldSpec,
  dimIndex: number,
  denizens: AutonomousDenizenSimState[],
  settlementPos: [number, number],
  questCounter: number
): EmergentCulturalQuestline {
  const giver =
    denizens[questCounter % Math.max(1, denizens.length)] ?? {
      entityId: 'elder-0',
      entityName: 'High Weaver Vael',
      nativeElement: resolveNativeElementForDimension(dimIndex, world.seed),
      outworlderXenophobia: 75,
      isPlottingSabotage: true,
    };

  const elemSpec = BASE_DIMENSIONAL_ELEMENTS[giver.nativeElement];
  const isDeceptive = giver.isPlottingSabotage || questCounter % 2 === 0;
  const angle = (questCounter * 2.1 + world.seed * 0.4) % (Math.PI * 2);
  const targetX = Number((settlementPos[0] + Math.cos(angle) * 26).toFixed(1));
  const targetZ = Number((settlementPos[1] + Math.sin(angle) * 26).toFixed(1));

  if (isDeceptive) {
    return {
      id: `quest-trojan-${Date.now()}-${questCounter}`,
      settlementName: `${world.name.split(' ')[0]} Hearth-Hold`,
      giverEntityId: giver.entityId,
      giverName: `${giver.entityName} (${elemSpec.shortName} Elder)`,
      nativeElement: giver.nativeElement,
      title: `The ${elemSpec.shortName} Convergence Rite`,
      statedCulturalObjective: `"Outworlder, our ${elemSpec.shortName} Noise-Shield is failing against the Barometric Squall. Carry our Resonance Offering to the Altar at (${targetX}, ${targetZ}) and channel your left-hand Void Seed into the conduit to save our kin!"`,
      statedRewardPromise: `Promised Reward: Full ${elemSpec.name} Mastery & Kinship Sanctuary`,
      isDeceptiveSabotage: true,
      hiddenSabotageTruth: `TROJAN SABOTAGE TRAP: ${giver.entityName} terrified by your "from-another-place" aura has rigged the conduit at (${targetX}, ${targetZ}) with an inverted ${elemSpec.shortName} Shear Bomb to sever your Void arm and summon an Apex Antagonist! (Crouch [C] near the Elder or press [X] at the conduit to Reverse the Trap!)`,
      sabotageRevealedToPlayer: false,
      targetCoords: [targetX, targetZ],
      currentStep: 1,
      totalSteps: 3,
      stepLabels: [
        `Observe ${giver.entityName}'s settlement routine or eavesdrop in stealth [C]`,
        `Travel to the Resonant Conduit at (${targetX}, ${targetZ})`,
        `Activate Conduit (or Press [X] to Reverse Sabotage Trap if uncovered!)`,
      ],
      status: 'active',
    };
  }

  return {
    id: `quest-ally-${Date.now()}-${questCounter}`,
    settlementName: `${world.name.split(' ')[0]} Hearth-Hold`,
    giverEntityId: giver.entityId,
    giverName: `${giver.entityName} (${elemSpec.shortName} Artisan)`,
    nativeElement: giver.nativeElement,
    title: `Shielding Against the ${elemSpec.shortName} Noise`,
    statedCulturalObjective: `"Traveler from beyond the fold—environmental noise is fracturing our ${elemSpec.shortName} shutters. Help us calibrate the outer harmonic pylon at (${targetX}, ${targetZ}) before the antagonist pack strikes!"`,
    statedRewardPromise: `Reward: Decoded ${elemSpec.name} Survival Technique + +2 Deviance XP`,
    isDeceptiveSabotage: false,
    hiddenSabotageTruth: `GENUINE SURVIVAL PACT: Their kinship aura is sincere. Calibrating the pylon will shield the settlement and teach you their mundane ${elemSpec.shortName} survival art.`,
    sabotageRevealedToPlayer: false,
    targetCoords: [targetX, targetZ],
    currentStep: 1,
    totalSteps: 3,
    stepLabels: [
      `Witness ${giver.entityName}'s ${elemSpec.shortName} survival routine [X]`,
      `Reach the Outer Harmonic Pylon at (${targetX}, ${targetZ})`,
      `Infuse Pylon with ${elemSpec.shortName} resonance [E / Click]`,
    ],
    status: 'active',
  };
}

// ============================================================================
// 4. 3D CULTURAL SETTLEMENT, NOISE DOME & SIMS INTENT SIGIL BUILDER
// ============================================================================

export function buildCulturalSettlement3DRig(
  world: ManifoldWorldSpec,
  dimIndex: number,
  evalHeight: (x: number, z: number) => number
): CulturalSettlement3DRig {
  const rootGroup = new THREE.Group();
  const nativeElement = resolveNativeElementForDimension(dimIndex, world.seed);
  const elemSpec = BASE_DIMENSIONAL_ELEMENTS[nativeElement];

  const centerX = 14;
  const centerZ = -14;
  const centerY = evalHeight(centerX, centerZ);
  const centerPos = new THREE.Vector3(centerX, centerY, centerZ);

  // 1. Central Cultural Totem & Noise-Canceling Resonator Spire
  const totemGroup = new THREE.Group();
  totemGroup.position.copy(centerPos);

  const plinthMat = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.45,
    metalness: 0.65,
  });
  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(1.8, 2.3, 1.1, 8),
    plinthMat
  );
  plinth.position.y = 0.55;
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  totemGroup.add(plinth);

  const coreMat = new THREE.MeshStandardMaterial({
    color: elemSpec.colorHex,
    emissive: elemSpec.emissiveHex,
    emissiveIntensity: 0.85,
    roughness: 0.2,
    metalness: 0.8,
  });
  const spire = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.15, 1),
    coreMat
  );
  spire.scale.set(0.75, 2.4, 0.75);
  spire.position.y = 3.2;
  spire.castShadow = true;
  totemGroup.add(spire);

  // Rotating Cymatic Shield Rings around the Totem
  for (let r = 0; r < 2; r++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.65 + r * 0.45, 0.07, 12, 36),
      coreMat
    );
    ring.position.y = 3.2;
    ring.rotation.x = Math.PI / 3 + r * 0.6;
    ring.userData.isTotemRing = true;
    totemGroup.add(ring);
  }
  rootGroup.add(totemGroup);

  // 2. Environmental Noise-Shielding Harmonic Dome (Translucent Crystalline Canopy)
  const domeGeo = new THREE.SphereGeometry(16.5, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.52);
  const domeMat = new THREE.MeshBasicMaterial({
    color: elemSpec.colorHex,
    wireframe: true,
    transparent: true,
    opacity: 0.14,
    blending: THREE.AdditiveBlending,
  });
  const noiseDomeMesh = new THREE.Mesh(domeGeo, domeMat);
  noiseDomeMesh.position.copy(centerPos);
  rootGroup.add(noiseDomeMesh);

  // 3. Three Cultural Shelter Huts / Bio-Basins around the Hearth
  const shelterHuts: THREE.Object3D[] = [];
  for (let h = 0; h < 3; h++) {
    const angle = (h / 3) * Math.PI * 2 + 0.4;
    const hx = centerX + Math.cos(angle) * 9.5;
    const hz = centerZ + Math.sin(angle) * 9.5;
    const hy = evalHeight(hx, hz);

    const hutGroup = new THREE.Group();
    hutGroup.position.set(hx, hy, hz);
    hutGroup.rotation.y = -angle + Math.PI / 2;

    const wallMat = new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.55,
      metalness: 0.4,
    });
    const arch = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 2.5, 2.4, 7, 1, true),
      wallMat
    );
    arch.position.y = 1.2;
    arch.castShadow = true;
    hutGroup.add(arch);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(2.4, 1.5, 7),
      coreMat
    );
    roof.position.y = 3.0;
    roof.castShadow = true;
    hutGroup.add(roof);

    rootGroup.add(hutGroup);
    shelterHuts.push(hutGroup);
  }

  // 3B. Emergent Urban District Bazaar Stalls & Dense City Towers (unfold as Sims run Goods & Services!)
  const urbanDistrictGroup = new THREE.Group();
  for (let u = 0; u < 6; u++) {
    const ang = (u / 6) * Math.PI * 2 + 0.15;
    const ux = centerX + Math.cos(ang) * 14.5;
    const uz = centerZ + Math.sin(ang) * 14.5;
    const uy = evalHeight(ux, uz);
    const stallGroup = new THREE.Group();
    stallGroup.position.set(ux, uy, uz);
    stallGroup.rotation.y = -ang + Math.PI / 2;

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 2.6, 2.2),
      plinthMat
    );
    frame.position.y = 1.3;
    stallGroup.add(frame);

    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(3.1, 0.25, 2.6),
      coreMat
    );
    awning.position.y = 2.75;
    stallGroup.add(awning);
    urbanDistrictGroup.add(stallGroup);
  }
  urbanDistrictGroup.visible = false;
  rootGroup.add(urbanDistrictGroup);

  const denseCitySpireGroup = new THREE.Group();
  for (let c = 0; c < 8; c++) {
    const ang = (c / 8) * Math.PI * 2 + 0.38;
    const cx = centerX + Math.cos(ang) * 19.5;
    const cz = centerZ + Math.sin(ang) * 19.5;
    const cy = evalHeight(cx, cz);
    const towerGroup = new THREE.Group();
    towerGroup.position.set(cx, cy, cz);
    towerGroup.rotation.y = -ang;

    const towerH = 6.5 + (c % 3) * 2.2;
    const towerBody = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, towerH, 3.2),
      plinthMat
    );
    towerBody.position.y = towerH * 0.5;
    towerGroup.add(towerBody);

    const neonSign = new THREE.Mesh(
      new THREE.BoxGeometry(3.35, 0.45, 3.35),
      coreMat
    );
    neonSign.position.y = towerH - 0.8;
    towerGroup.add(neonSign);
    denseCitySpireGroup.add(towerGroup);
  }
  denseCitySpireGroup.visible = false;
  rootGroup.add(denseCitySpireGroup);

  // 4. Social Kinship Tether Lines connecting communicating Sims denizens
  const lineGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(12 * 2 * 3);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: elemSpec.colorHex,
    transparent: true,
    opacity: 0.45,
  });
  const socialTetherLines = new THREE.LineSegments(lineGeo, lineMat);
  rootGroup.add(socialTetherLines);

  return {
    rootGroup,
    settlementName: `${world.name.split(' ')[0]} Hearth-Hold`,
    cultureTitle: `Order of the ${elemSpec.shortName} Lattice`,
    nativeElement,
    centerPos,
    totemMesh: totemGroup,
    noiseDomeMesh,
    shelterHuts,
    urbanDistrictGroup,
    denseCitySpireGroup,
    denizenPlumbobs: new Map(),
    socialTetherLines,
    environmentalNoiseLevel: 0.22,
    noiseStormActive: false,
    urbanizationScore: 28,
    urbanizationTier: 'hearth-village',
    goodsAndServicesRate: 12,
    hasSpawnedShadowMaze: false,
    urbanNoclipCooldownSec: 0,
  };
}

export function updateCulturalSettlementAndSimsAI(params: {
  rig: CulturalSettlement3DRig;
  denizens: AutonomousDenizenSimState[];
  entityPositions: Map<string, THREE.Vector3>;
  playerPos: THREE.Vector3;
  playerSpeed?: number;
  playerStealthActive: boolean;
  playerVoidBallOpen: boolean;
  nowSec: number;
  dt: number;
}): {
  nearestDenizen: AutonomousDenizenSimState | null;
  nearestDist: number;
  eavesdroppedSabotageClue?: string;
  justReachedDenseCity?: boolean;
  triggeredUrbanNoclip?: boolean;
  urbanNoclipRiskPct: number;
} {
  const {
    rig,
    denizens,
    entityPositions,
    playerPos,
    playerStealthActive,
    playerVoidBallOpen,
    nowSec,
    dt,
  } = params;

  // 1. Oscillate Environmental Noise Level (periodic barometric/dimensional squalls)
  const noiseWave = 0.5 + 0.5 * Math.sin(nowSec * 0.14);
  rig.environmentalNoiseLevel = Number(noiseWave.toFixed(2));
  rig.noiseStormActive = noiseWave > 0.72;

  // Pulse Totem & Noise Shield Dome
  rig.totemMesh.children.forEach((ch) => {
    if (ch.userData.isTotemRing) {
      ch.rotation.y += dt * (1.4 + noiseWave * 2.2);
      ch.rotation.z += dt * 0.9;
    }
  });
  const domeMat = rig.noiseDomeMesh.material as THREE.MeshBasicMaterial;
  domeMat.opacity = rig.noiseStormActive
    ? 0.24 + Math.sin(nowSec * 6) * 0.06
    : 0.09;

  // 2. Step each Denizen's Sims-like Need Bars, Cultural Routines & Plumbob Sigils
  let nearestDenizen: AutonomousDenizenSimState | null = null;
  let nearestDist = Infinity;

  const posAttr = rig.socialTetherLines.geometry.getAttribute(
    'position'
  ) as THREE.BufferAttribute;
  let lineIdx = 0;

  for (let i = 0; i < denizens.length; i++) {
    const sim = denizens[i];
    const ePos = entityPositions.get(sim.entityId);
    if (!ePos) continue;

    // Gradually evolve Sims needs
    sim.somaticHunger = Math.max(
      15,
      Math.min(100, sim.somaticHunger - dt * 0.45 + (sim.currentActivity === 'communal-kinship-feast' ? dt * 3.5 : 0))
    );
    sim.noiseShieldComfort = Math.max(
      10,
      Math.min(
        100,
        sim.noiseShieldComfort +
          (rig.noiseStormActive ? -dt * 1.6 : dt * 1.1) +
          (ePos.distanceTo(rig.centerPos) < 16 ? dt * 1.8 : 0)
      )
    );
    sim.socialKinship = Math.max(
      20,
      Math.min(100, sim.socialKinship + Math.sin(nowSec * 0.3 + i) * dt * 0.8)
    );

    const distToPlayer = ePos.distanceTo(playerPos);
    if (distToPlayer < nearestDist) {
      nearestDist = distToPlayer;
      nearestDenizen = sim;
    }

    // If player flashes an open Void Ball nearby without stealth, xenophobia spikes!
    if (distToPlayer < 16 && playerVoidBallOpen && !playerStealthActive) {
      sim.outworlderXenophobia = Math.min(100, sim.outworlderXenophobia + dt * 6.5);
      sim.isPlottingSabotage = sim.outworlderXenophobia >= 68;
    }

    // Select dynamic Sims activity based on environmental noise & needs (including Goods & Services trade!)
    if (rig.noiseStormActive) {
      sim.currentActivity = 'fortifying-noise-shelter';
    } else if (sim.isPlottingSabotage && distToPlayer < 26) {
      sim.currentActivity = 'plotting-outworlder-sabotage';
    } else if (sim.somaticHunger < 42) {
      sim.currentActivity = 'communal-kinship-feast';
    } else if (i % 2 === 0) {
      sim.currentActivity = 'running-goods-and-services-bazaar';
    } else {
      sim.currentActivity = 'performing-mundane-magic-ritual';
    }

    // Ensure 3D Sims Intent Plumbob Sigil exists for this denizen
    let plumbob = rig.denizenPlumbobs.get(sim.entityId);
    if (!plumbob) {
      plumbob = new THREE.Group();
      const diamond = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.24, 0),
        new THREE.MeshBasicMaterial({
          color: '#10b981',
          wireframe: false,
          transparent: true,
          opacity: 0.88,
        })
      );
      diamond.scale.set(0.75, 1.45, 0.75);
      plumbob.add(diamond);

      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.28, 0.36, 16),
        new THREE.MeshBasicMaterial({
          color: '#38bdf8',
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        })
      );
      halo.rotation.x = Math.PI / 2;
      plumbob.add(halo);

      rig.rootGroup.add(plumbob);
      rig.denizenPlumbobs.set(sim.entityId, plumbob);
    }

    plumbob.position.set(
      ePos.x,
      ePos.y + 2.35 + Math.sin(nowSec * 3.2 + i) * 0.12,
      ePos.z
    );
    plumbob.rotation.y = nowSec * 2.1 + i;

    const diamondMesh = plumbob.children[0] as THREE.Mesh;
    const diamondMat = diamondMesh.material as THREE.MeshBasicMaterial;
    if (sim.isScarredNemesis) {
      diamondMat.color.set('#ef4444'); // Crimson Nemesis
    } else if (sim.currentActivity === 'plotting-outworlder-sabotage') {
      diamondMat.color.set('#f59e0b'); // Amber Deceit / Manipulation
    } else if (rig.noiseStormActive) {
      diamondMat.color.set('#38bdf8'); // Cyan Storm Shielding
    } else {
      diamondMat.color.set('#10b981'); // Emerald Harmonious Sims Life
    }

    // Connect social kinship tether to next denizen if close
    if (i + 1 < denizens.length && lineIdx < 12) {
      const nextPos = entityPositions.get(denizens[i + 1].entityId);
      if (nextPos && ePos.distanceTo(nextPos) < 18) {
        posAttr.setXYZ(lineIdx * 2, ePos.x, ePos.y + 1.1, ePos.z);
        posAttr.setXYZ(lineIdx * 2 + 1, nextPos.x, nextPos.y + 1.1, nextPos.z);
        lineIdx++;
      }
    }
  }

  for (let k = lineIdx; k < 12; k++) {
    posAttr.setXYZ(k * 2, 0, -999, 0);
    posAttr.setXYZ(k * 2 + 1, 0, -999, 0);
  }
  posAttr.needsUpdate = true;

  // 3. Evolve Sims Goods & Services Commerce and Settlement Urbanization (Village -> Urban District -> Dense City)
  const bazaarTradersCount = denizens.filter(
    (d) => d.currentActivity === 'running-goods-and-services-bazaar'
  ).length;
  rig.goodsAndServicesRate = Number(
    (10 + bazaarTradersCount * 6.5 + lineIdx * 3.2).toFixed(1)
  );
  rig.urbanizationScore = Math.min(
    100,
    rig.urbanizationScore + dt * (0.45 + bazaarTradersCount * 0.22)
  );

  let justReachedDenseCity = false;
  if (rig.urbanizationScore >= 72) {
    if (rig.urbanizationTier !== 'dense-city') {
      rig.urbanizationTier = 'dense-city';
      if (!rig.hasSpawnedShadowMaze) {
        rig.hasSpawnedShadowMaze = true;
        justReachedDenseCity = true;
      }
    }
  } else if (rig.urbanizationScore >= 42) {
    rig.urbanizationTier = 'urban-district';
  } else {
    rig.urbanizationTier = 'hearth-village';
  }

  rig.urbanDistrictGroup.visible =
    rig.urbanizationTier === 'urban-district' ||
    rig.urbanizationTier === 'dense-city';
  rig.denseCitySpireGroup.visible = rig.urbanizationTier === 'dense-city';

  // 4. Evaluate Rare Urban Noclip Risk in Urban/City Districts around the Settlement
  if (rig.urbanNoclipCooldownSec > 0) {
    rig.urbanNoclipCooldownSec = Math.max(0, rig.urbanNoclipCooldownSec - dt);
  }
  const distToSettlement = playerPos.distanceTo(rig.centerPos);
  let urbanNoclipRiskPct = 0;
  let triggeredUrbanNoclip = false;

  if (
    distToSettlement < 26 &&
    (rig.urbanizationTier === 'urban-district' ||
      rig.urbanizationTier === 'dense-city')
  ) {
    const baseRisk = rig.urbanizationTier === 'dense-city' ? 6.8 : 1.8;
    const speedFactor = Math.min(2.2, (params.playerSpeed ?? 0) / 8.0);
    urbanNoclipRiskPct = Number((baseRisk * (0.6 + speedFactor * 0.6)).toFixed(1));

    // Rare dimensional Noclip slip when sprinting tightly against urban/city structures
    if (
      rig.urbanNoclipCooldownSec <= 0 &&
      (params.playerSpeed ?? 0) > 10.5 &&
      Math.random() < (urbanNoclipRiskPct * 0.00035 * dt)
    ) {
      rig.urbanNoclipCooldownSec = 45.0;
      triggeredUrbanNoclip = true;
    }
  }

  return {
    nearestDenizen,
    nearestDist,
    justReachedDenseCity,
    triggeredUrbanNoclip,
    urbanNoclipRiskPct,
  };
}
