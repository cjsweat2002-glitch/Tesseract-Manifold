import { BaseDimensionalElementId } from '../utils/multiversalEmergenceAndCultureEngine';
import { ResourceId } from './manifold';

export type MultiversalMatterId =
  | 'abyssal-biodepth-chitin'
  | 'luminous-bathyal-gel'
  | 'non-euclidean-void-basalt'
  | 'graviton-alloy'
  | 'prismatic-vector-glass'
  | 'tachyon-mycelium'
  | 'chronos-lattice-quartz'
  | 'astral-singularity-core';

export type DifferentialUniverseBoundaryId =
  | 'planck-0d-point-singularity'
  | 'flatland-2d-chromatic-ribbon'
  | 'hadal-biodepth-abyss'
  | 'monolithic-brutalist-singularity'
  | 'cel-traced-chromatic-steppe'
  | 'mycelial-silicon-necropolis'
  | 'tesseractic-4d-reliquary'
  | 'calabi-yau-6d-folded-garden'
  | 'penrose-twistor-lightcone'
  | 'banach-tarski-fractal-atoll'
  | 'ads-cft-holographic-bulk'
  | 'm-theory-11d-brane-cathedral';

export type DimensionalBiologyMorphologyId =
  | 'planck-photonic-nucleoid'
  | 'flatland-origami-membrane'
  | 'hadal-piezo-cephalopod'
  | 'brutalist-hydraulic-tensor'
  | 'chromatic-vector-prism'
  | 'mycelial-hyphae-exocortex'
  | 'tesseractic-8cell-hypercage'
  | 'calabi-yau-holomorphic-rosette'
  | 'penrose-lorentz-helical'
  | 'banach-tarski-fractal-colony'
  | 'ads-cft-holographic-projection'
  | 'm-theory-supermembrane-seraph';

export interface DimensionalBiologyProfile {
  morphologyId: DimensionalBiologyMorphologyId;
  speciesDesignation: string;
  anatomicalAdaptationSummary: string;
  sensoryPovTitle: string;
  sensoryPovDescription: string;
  torsoScaleAxes: [number, number, number];
  limbRadialScale: number;
  wingSpanMultiplier: number;
  baseFovDegrees: number;
  velocityFovAberration: number;
  horizonRollCoupling: number;
  retinalTintHex: string;
}

export type GroundingTaxonomyClass =
  | 'gravity-inertial-anchor'
  | 'temporal-causal-regulator'
  | 'thermodynamic-pressure-pylon';

export type GroundingBehaviorLayerMode =
  | 'base-survival-auras'
  | 'creative-silhouette-mutation'
  | 'custom-void-portal-tuning';

export interface CustomVoidPortalTuningState {
  isOpen: boolean;
  isPlayerInsideCustomVoid: boolean;
  portalWorldPos: [number, number, number];
  customVoidSeed: number;
  tunedGravityMultiplier: number; // 0.15x to 3.0x
  tunedTimeDilationGamma: number; // 0.2x to 2.5x
  tunedPressureBuoyancy: number;  // 0.2x to 2.5x
  creativeSilhouetteSeedOffset: number;
  behaviorLayerMode: GroundingBehaviorLayerMode;
}

export interface MultiversalMatterSpec {
  id: MultiversalMatterId;
  name: string;
  shortName: string;
  originBoundary: DifferentialUniverseBoundaryId;
  colorHex: string;
  emissiveHex: string;
  atomicSignature: string;
  description: string;
}

const RAW_MULTIVERSAL_MATTER_CATALOG: Record<
  MultiversalMatterId,
  MultiversalMatterSpec
> = {
  'abyssal-biodepth-chitin': {
    id: 'abyssal-biodepth-chitin',
    name: 'Abyssal Biodepth Chitin',
    shortName: 'Biodepth Chitin',
    originBoundary: 'hadal-biodepth-abyss',
    colorHex: '#06b6d4',
    emissiveHex: '#0891b2',
    atomicSignature: 'C₁₆H₂₆N₂O₁₀ · Hadal-Ψ',
    description:
      'Pressure-forged bioluminescent carapace harvested from leviathan ribs in Hadal Biodepth trenches.',
  },
  'luminous-bathyal-gel': {
    id: 'luminous-bathyal-gel',
    name: 'Luminous Bathyal Gel',
    shortName: 'Bathyal Gel',
    originBoundary: 'hadal-biodepth-abyss',
    colorHex: '#2dd4bf',
    emissiveHex: '#14b8a6',
    atomicSignature: 'Luciferin-Ω · 420 MPa',
    description:
      'Subsurface-scattering cellular plasma that sustains living architectural conduits inside Portal Rooms.',
  },
  'non-euclidean-void-basalt': {
    id: 'non-euclidean-void-basalt',
    name: 'Non-Euclidean Void Basalt',
    shortName: 'Void Basalt',
    originBoundary: 'monolithic-brutalist-singularity',
    colorHex: '#64748b',
    emissiveHex: '#38bdf8',
    atomicSignature: 'SiO₂·FeO · Metric-K(-1.4)',
    description:
      'Ultra-dense monolithic structural stone whose crystal planes fold across hyperbolic angles.',
  },
  'graviton-alloy': {
    id: 'graviton-alloy',
    name: 'Graviton Shear Alloy',
    shortName: 'Graviton Alloy',
    originBoundary: 'monolithic-brutalist-singularity',
    colorHex: '#f59e0b',
    emissiveHex: '#d97706',
    atomicSignature: 'Ti-Graviton-7 · Spin-2',
    description:
      'Zero-strain metallic lattice capable of anchoring reality tears and inverted gravity walkways.',
  },
  'prismatic-vector-glass': {
    id: 'prismatic-vector-glass',
    name: 'Prismatic Vector Glass',
    shortName: 'Vector Glass',
    originBoundary: 'cel-traced-chromatic-steppe',
    colorHex: '#f43f5e',
    emissiveHex: '#e11d48',
    atomicSignature: 'Chroma-SiO₄ · Δλ',
    description:
      'Refractive contour-etched crystal that splits incoming light into quantized spectral vectors.',
  },
  'tachyon-mycelium': {
    id: 'tachyon-mycelium',
    name: 'Tachyon Mycelium Spore-Weave',
    shortName: 'Tachyon Mycelium',
    originBoundary: 'mycelial-silicon-necropolis',
    colorHex: '#10b981',
    emissiveHex: '#059669',
    atomicSignature: 'Bio-Si-Hyphae · v > c',
    description:
      'Biomechanical neural filaments that transmit synthesis signals backward across local time.',
  },
  'chronos-lattice-quartz': {
    id: 'chronos-lattice-quartz',
    name: 'Chronos-Lattice Quartz',
    shortName: 'Chronos Quartz',
    originBoundary: 'tesseractic-4d-reliquary',
    colorHex: '#eab308',
    emissiveHex: '#ca8a04',
    atomicSignature: 'τ-SiO₂ · 8-Cell',
    description:
      'Time-dilated piezo-crystal harvested from folding 4D tesseractic reliquary spires.',
  },
  'astral-singularity-core': {
    id: 'astral-singularity-core',
    name: 'Astral Singularity Core',
    shortName: 'Singularity Core',
    originBoundary: 'tesseractic-4d-reliquary',
    colorHex: '#a855f7',
    emissiveHex: '#9333ea',
    atomicSignature: 'Ω-Horizon · κ=∞',
    description:
      'Compressed micro-horizon seed dropped by apex dimensional anomalies and deep-world monoliths.',
  },
};

export const MULTIVERSAL_MATTER_CATALOG: Record<
  MultiversalMatterId,
  MultiversalMatterSpec
> = new Proxy(RAW_MULTIVERSAL_MATTER_CATALOG, {
  get(target, prop: string | symbol) {
    if (typeof prop === 'string' && prop in target) {
      return target[prop as MultiversalMatterId];
    }
    return target['astral-singularity-core'];
  },
});

export interface DifferentialUniverseBoundarySpec {
  id: DifferentialUniverseBoundaryId;
  dimensionTierNumber: number; // 0 to 12
  dimensionLabel: string;      // e.g. 'D0–D1', 'D2', 'D3', ..., 'D11–D12'
  name: string;
  genreClassification: string;
  tagline: string;
  biodepthStratumDepthKm: number;
  skyColorHex: string;
  fogColorHex: string;
  fogDensity: number;
  primaryAccentHex: string;
  secondaryAccentHex: string;
  portalRimPrimaryHex: string;
  portalRimSecondaryHex: string;
  terrainRoughness: number;
  terrainMetalness: number;
  gravityScale: number;
  timeDilationGamma: number; // Relativistic world proper-time multiplier (0.25x to 1.65x)
  lorentzVelocityCoupling: number; // Relativistic contraction / aberration with movement speed
  atmosphericPressureAtm: number;
  hyperbolicCurvature: number;
  primaryMatterYield: MultiversalMatterId;
  secondaryMatterYield: MultiversalMatterId;
  visualShaderSignature: string;
  biologyProfile: DimensionalBiologyProfile;
}

const RAW_DIFFERENTIAL_UNIVERSE_BOUNDARIES: Record<
  DifferentialUniverseBoundaryId,
  DifferentialUniverseBoundarySpec
> = {
  'planck-0d-point-singularity': {
    id: 'planck-0d-point-singularity',
    dimensionTierNumber: 1,
    dimensionLabel: 'D0–D1 · Planck Foam',
    name: 'Planck 0D/1D String Singularity',
    genreClassification: 'Quantum-Foam Pre-Geometric String Lattice',
    tagline:
      'Quantized Planck-scale probability wells, 1D harmonic cosmic strings, and extreme gravitational time dilation.',
    biodepthStratumDepthKm: 99.9,
    skyColorHex: '#02020a',
    fogColorHex: '#08071a',
    fogDensity: 0.012,
    primaryAccentHex: '#38bdf8',
    secondaryAccentHex: '#e0f2fe',
    portalRimPrimaryHex: '#7dd3fc',
    portalRimSecondaryHex: '#6366f1',
    terrainRoughness: 0.14,
    terrainMetalness: 0.92,
    gravityScale: 0.52,
    timeDilationGamma: 0.34,
    lorentzVelocityCoupling: 0.85,
    atmosphericPressureAtm: 0.05,
    hyperbolicCurvature: -0.65,
    primaryMatterYield: 'astral-singularity-core',
    secondaryMatterYield: 'chronos-lattice-quartz',
    visualShaderSignature:
      'Sub-Planck standing-wave interference rings, zero-point Cherenkov corona, and 1D string filaments.',
    biologyProfile: {
      morphologyId: 'planck-photonic-nucleoid',
      speciesDesignation: 'Homo Planckianus · 1D String-Oscillator Nucleoid',
      anatomicalAdaptationSummary:
        'Compressed photonic wave-packet core with radial quantum probability shells and vibrating 1D string tendrils in place of macro-limbs.',
      sensoryPovTitle: 'Quantum Wave-Function Interference Aperture (γ = 0.34×)',
      sensoryPovDescription:
        'External world clocks crawl at 34% speed due to Planck horizon gravity; movement induces strong phase-wave FOV aberration.',
      torsoScaleAxes: [0.68, 0.82, 0.68],
      limbRadialScale: 0.55,
      wingSpanMultiplier: 1.35,
      baseFovDegrees: 78,
      velocityFovAberration: 16.0,
      horizonRollCoupling: 1.4,
      retinalTintHex: '#38bdf8',
    },
  },
  'flatland-2d-chromatic-ribbon': {
    id: 'flatland-2d-chromatic-ribbon',
    dimensionTierNumber: 2,
    dimensionLabel: 'D2 · Planar Flatland',
    name: 'Flatland 2D Chromatic Membrane',
    genreClassification: 'Anamorphic Planar-Slice Origami Biosphere',
    tagline:
      'Paper-thin iridescent perimeter organisms, Euclidean graph horizons, and accelerated planar time flow.',
    biodepthStratumDepthKm: 2.4,
    skyColorHex: '#18061c',
    fogColorHex: '#2d0b36',
    fogDensity: 0.0045,
    primaryAccentHex: '#f43f5e',
    secondaryAccentHex: '#fde047',
    portalRimPrimaryHex: '#fb7185',
    portalRimSecondaryHex: '#facc15',
    terrainRoughness: 0.25,
    terrainMetalness: 0.58,
    gravityScale: 0.68,
    timeDilationGamma: 1.38,
    lorentzVelocityCoupling: 0.45,
    atmosphericPressureAtm: 0.42,
    hyperbolicCurvature: 0.0,
    primaryMatterYield: 'prismatic-vector-glass',
    secondaryMatterYield: 'luminous-bathyal-gel',
    visualShaderSignature:
      'Razor-thin origami cross-sections, iridescent soap-film interference, and bold planar perimeter outlines.',
    biologyProfile: {
      morphologyId: 'flatland-origami-membrane',
      speciesDesignation: 'Planaria Geometrica · 2D Origami Membrane Morph',
      anatomicalAdaptationSummary:
        'Body and limbs flatten along the sagittal Z-plane into a razor-thin translucent membrane with visible internal vascular circuitry.',
      sensoryPovTitle: 'Anamorphic Planar-Slice Horizon Optics (γ = 1.38×)',
      sensoryPovDescription:
        'Wide-aperture planar projection with accelerated 1.38× temporal cadence and crisp cross-sectional depth perception.',
      torsoScaleAxes: [1.32, 1.08, 0.22],
      limbRadialScale: 0.62,
      wingSpanMultiplier: 1.55,
      baseFovDegrees: 84,
      velocityFovAberration: 9.0,
      horizonRollCoupling: 0.4,
      retinalTintHex: '#fb7185',
    },
  },
  'hadal-biodepth-abyss': {
    id: 'hadal-biodepth-abyss',
    dimensionTierNumber: 3,
    dimensionLabel: 'D3 · Hadal Biodepth',
    name: 'Hadal Biodepth Abyss',
    genreClassification: 'Sub-Oceanic Bioluminescent Bio-Horror',
    tagline:
      'Crushing bathyal trenches, translucent leviathan ribs, and bioluminescent cellular currents.',
    biodepthStratumDepthKm: 11.4,
    skyColorHex: '#020b14',
    fogColorHex: '#041827',
    fogDensity: 0.011,
    primaryAccentHex: '#06b6d4',
    secondaryAccentHex: '#2dd4bf',
    portalRimPrimaryHex: '#00f2fe',
    portalRimSecondaryHex: '#059669',
    terrainRoughness: 0.32,
    terrainMetalness: 0.45,
    gravityScale: 0.86,
    timeDilationGamma: 0.85,
    lorentzVelocityCoupling: 0.25,
    atmosphericPressureAtm: 110.0,
    hyperbolicCurvature: -0.25,
    primaryMatterYield: 'abyssal-biodepth-chitin',
    secondaryMatterYield: 'luminous-bathyal-gel',
    visualShaderSignature:
      'High-gloss wet chitin normal strata, cyan-emerald bioluminescent veins, and deep aquatic caustics.',
    biologyProfile: {
      morphologyId: 'hadal-piezo-cephalopod',
      speciesDesignation: 'Architeuthis Seraphicus · Bathyal Piezo-Chitin Walker',
      anatomicalAdaptationSummary:
        'Pressure-forged chitinous carapace plates, pressurized luciferin photophore sacs along the ribs, and hydro-fin wing membranes.',
      sensoryPovTitle: 'Bathyal Echolocation & Luciferin Caustic Vision (γ = 0.85×)',
      sensoryPovDescription:
        'Dense hydrostatic medium cushions vertical descent and slows ambient temporal currents to 0.85×.',
      torsoScaleAxes: [1.08, 1.0, 1.12],
      limbRadialScale: 1.08,
      wingSpanMultiplier: 1.15,
      baseFovDegrees: 68,
      velocityFovAberration: 6.5,
      horizonRollCoupling: 0.85,
      retinalTintHex: '#06b6d4',
    },
  },
  'monolithic-brutalist-singularity': {
    id: 'monolithic-brutalist-singularity',
    dimensionTierNumber: 4,
    dimensionLabel: 'D3.5 · Kerr Horizon',
    name: 'Monolithic Brutalist Singularity',
    genreClassification: 'Architectural Hard-Sci-Fi Megastructure',
    tagline:
      'Stark cyclopean concrete-obsidian slabs, razor-sharp shadow cascades, and graviton shear wells.',
    biodepthStratumDepthKm: 24.0,
    skyColorHex: '#090b10',
    fogColorHex: '#11151f',
    fogDensity: 0.0075,
    primaryAccentHex: '#f59e0b',
    secondaryAccentHex: '#38bdf8',
    portalRimPrimaryHex: '#fbbf24',
    portalRimSecondaryHex: '#38bdf8',
    terrainRoughness: 0.78,
    terrainMetalness: 0.28,
    gravityScale: 1.38,
    timeDilationGamma: 0.58,
    lorentzVelocityCoupling: 0.55,
    atmosphericPressureAtm: 2.8,
    hyperbolicCurvature: 0.0,
    primaryMatterYield: 'non-euclidean-void-basalt',
    secondaryMatterYield: 'graviton-alloy',
    visualShaderSignature:
      'High-contrast architectural concrete-basalt joints, warm amber sodium rim lights, and crisp geometric shadows.',
    biologyProfile: {
      morphologyId: 'brutalist-hydraulic-tensor',
      speciesDesignation: 'Titanus Scarpa · High-G Hydraulic Tensor Frame',
      anatomicalAdaptationSummary:
        'Reinforced basalt-iron exoskeletal buttresses, twin-piston hydraulic femurs, and gyroscopic spinal counterweights built for 1.38G shear.',
      sensoryPovTitle: 'High-Inertia Telecentric Gravity Lens (γ = 0.58×)',
      sensoryPovDescription:
        'Heavy gravitational well compresses proper time to 0.58× and adds authoritative mass to every footstep and landing.',
      torsoScaleAxes: [1.24, 0.96, 1.18],
      limbRadialScale: 1.28,
      wingSpanMultiplier: 0.92,
      baseFovDegrees: 64,
      velocityFovAberration: 5.0,
      horizonRollCoupling: 0.5,
      retinalTintHex: '#f59e0b',
    },
  },
  'cel-traced-chromatic-steppe': {
    id: 'cel-traced-chromatic-steppe',
    dimensionTierNumber: 5,
    dimensionLabel: 'D4 · Vector Steppe',
    name: 'Chromatic Vector Hyper-Steppe',
    genreClassification: 'Stylized Graphic-Novel Spectral Frontier',
    tagline:
      'High-saturation prismatic wind spires, quantized contour horizons, and refractive glass canyons.',
    biodepthStratumDepthKm: 6.8,
    skyColorHex: '#160724',
    fogColorHex: '#270b3a',
    fogDensity: 0.0065,
    primaryAccentHex: '#f43f5e',
    secondaryAccentHex: '#a855f7',
    portalRimPrimaryHex: '#ff2a85',
    portalRimSecondaryHex: '#38bdf8',
    terrainRoughness: 0.22,
    terrainMetalness: 0.65,
    gravityScale: 0.88,
    timeDilationGamma: 1.22,
    lorentzVelocityCoupling: 0.65,
    atmosphericPressureAtm: 0.75,
    hyperbolicCurvature: 0.35,
    primaryMatterYield: 'prismatic-vector-glass',
    secondaryMatterYield: 'chronos-lattice-quartz',
    visualShaderSignature:
      'Iridescent vector-glass reflections, magenta-cyan chromatic dispersion, and sharp ridge contours.',
    biologyProfile: {
      morphologyId: 'chromatic-vector-prism',
      speciesDesignation: 'Lux Vettoria · Faceted Spectral-Glass Strider',
      anatomicalAdaptationSummary:
        'Crystalline dichroic prism musculature and swept photonic collector fins that refract ambient light into RGB spectral wakes.',
      sensoryPovTitle: 'Quantized Spectral-Vector Tetrachromacy (γ = 1.22×)',
      sensoryPovDescription:
        'Crisp high-contrast spectral optics with rapid 1.22× radiative time flow and aerodynamic sprint banking.',
      torsoScaleAxes: [0.94, 1.14, 0.92],
      limbRadialScale: 0.9,
      wingSpanMultiplier: 1.28,
      baseFovDegrees: 76,
      velocityFovAberration: 12.5,
      horizonRollCoupling: 1.15,
      retinalTintHex: '#e879f9',
    },
  },
  'mycelial-silicon-necropolis': {
    id: 'mycelial-silicon-necropolis',
    dimensionTierNumber: 6,
    dimensionLabel: 'D5 · Tachyon Mycelium',
    name: 'Mycelial-Silicon Necropolis',
    genreClassification: 'Biomechanical Cyber-Organic Reliquary',
    tagline:
      'Interwoven neural spore-trees, fossilized data-cathedrals, and amber synaptic fog.',
    biodepthStratumDepthKm: 18.2,
    skyColorHex: '#06120c',
    fogColorHex: '#0b2116',
    fogDensity: 0.0095,
    primaryAccentHex: '#10b981',
    secondaryAccentHex: '#eab308',
    portalRimPrimaryHex: '#10b981',
    portalRimSecondaryHex: '#f59e0b',
    terrainRoughness: 0.52,
    terrainMetalness: 0.38,
    gravityScale: 0.96,
    timeDilationGamma: 0.92,
    lorentzVelocityCoupling: 0.35,
    atmosphericPressureAtm: 1.45,
    hyperbolicCurvature: -0.18,
    primaryMatterYield: 'tachyon-mycelium',
    secondaryMatterYield: 'abyssal-biodepth-chitin',
    visualShaderSignature:
      'Pulsing emerald-amber mycelial vascular networks embedded in dark silicon-basalt strata.',
    biologyProfile: {
      morphologyId: 'mycelial-hyphae-exocortex',
      speciesDesignation: 'Cordyceps Silicium · Symbiotic Hyphae Exocortex',
      anatomicalAdaptationSummary:
        'Fossilized silicon-bone arches braided with living copper-emerald mycelial hyphae and respiring dorsal spore-bellows.',
      sensoryPovTitle: 'Synaptic Chemotaxis & Retrocausal Spore Sense (γ = 0.92×)',
      sensoryPovDescription:
        'Perceives airborne spore currents and biomechanical neural links across a slightly retrocausal 0.92× time field.',
      torsoScaleAxes: [1.05, 1.04, 1.08],
      limbRadialScale: 1.05,
      wingSpanMultiplier: 1.18,
      baseFovDegrees: 72,
      velocityFovAberration: 7.5,
      horizonRollCoupling: 0.9,
      retinalTintHex: '#10b981',
    },
  },
  'tesseractic-4d-reliquary': {
    id: 'tesseractic-4d-reliquary',
    dimensionTierNumber: 7,
    dimensionLabel: 'D6 · 8-Cell Reliquary',
    name: '4D Tesseractic Reliquary',
    genreClassification: 'Higher-Dimensional Non-Euclidean Sanctum',
    tagline:
      'Folding 8-cell hyper-corridors, floating polyhedral shrines, and time-dilated golden twilight.',
    biodepthStratumDepthKm: 42.0,
    skyColorHex: '#0c071c',
    fogColorHex: '#160d30',
    fogDensity: 0.007,
    primaryAccentHex: '#a855f7',
    secondaryAccentHex: '#fde047',
    portalRimPrimaryHex: '#c084fc',
    portalRimSecondaryHex: '#fde047',
    terrainRoughness: 0.18,
    terrainMetalness: 0.82,
    gravityScale: 0.78,
    timeDilationGamma: 1.0,
    lorentzVelocityCoupling: 0.6,
    atmosphericPressureAtm: 0.65,
    hyperbolicCurvature: 0.55,
    primaryMatterYield: 'chronos-lattice-quartz',
    secondaryMatterYield: 'astral-singularity-core',
    visualShaderSignature:
      'Mirror-polished obsidian-gold tesseractic facets with floating 4D phase geometry.',
    biologyProfile: {
      morphologyId: 'tesseractic-8cell-hypercage',
      speciesDesignation: 'Seraphim Octachoron · 4D Folding Hyper-Polytope',
      anatomicalAdaptationSummary:
        'Nested 8-cell hypercubic thoracic cages and quaternion-gimballed limbs that rotate continuously through the orthogonal W-axis.',
      sensoryPovTitle: '4D Stereographic Hyper-Projection (γ = 1.00×)',
      sensoryPovDescription:
        'Simultaneous multi-angle W-axis spatial awareness with low-gravity 0.78G buoyant elevation.',
      torsoScaleAxes: [1.06, 1.06, 1.06],
      limbRadialScale: 1.0,
      wingSpanMultiplier: 1.32,
      baseFovDegrees: 75,
      velocityFovAberration: 10.0,
      horizonRollCoupling: 1.25,
      retinalTintHex: '#c084fc',
    },
  },
  'calabi-yau-6d-folded-garden': {
    id: 'calabi-yau-6d-folded-garden',
    dimensionTierNumber: 8,
    dimensionLabel: 'D7 · 6D Calabi-Yau',
    name: 'Calabi-Yau 6D Compactified Garden',
    genreClassification: 'Ricci-Flat Holomorphic Algebraic Biosphere',
    tagline:
      'Six-dimensional curled quintic manifolds, iridescent harmonic rosettes, and non-local spatial shortcuts.',
    biodepthStratumDepthKm: 64.0,
    skyColorHex: '#090418',
    fogColorHex: '#150934',
    fogDensity: 0.0055,
    primaryAccentHex: '#818cf8',
    secondaryAccentHex: '#f472b6',
    portalRimPrimaryHex: '#a5b4fc',
    portalRimSecondaryHex: '#f472b6',
    terrainRoughness: 0.16,
    terrainMetalness: 0.76,
    gravityScale: 0.64,
    timeDilationGamma: 1.45,
    lorentzVelocityCoupling: 0.72,
    atmosphericPressureAtm: 0.5,
    hyperbolicCurvature: -0.48,
    primaryMatterYield: 'chronos-lattice-quartz',
    secondaryMatterYield: 'prismatic-vector-glass',
    visualShaderSignature:
      'Holomorphic 6-fold rosette petals, Ricci-flat pearlescent sheen, and compactified phase iridescence.',
    biologyProfile: {
      morphologyId: 'calabi-yau-holomorphic-rosette',
      speciesDesignation: 'Flora Calabi · 6-Fold Holomorphic Rosette Entity',
      anatomicalAdaptationSummary:
        'Six-fold symmetrical petal-shell anatomy and chiral multi-jointed limbs that curl through compactified algebraic sub-loops.',
      sensoryPovTitle: '6D Holomorphic Kaleidoscopic Curvature (γ = 1.45×)',
      sensoryPovDescription:
        'Compactified dimensions accelerate local proper time to 1.45× and bend peripheral sightlines along Ricci-flat geodesics.',
      torsoScaleAxes: [1.14, 1.02, 1.14],
      limbRadialScale: 0.92,
      wingSpanMultiplier: 1.45,
      baseFovDegrees: 80,
      velocityFovAberration: 13.5,
      horizonRollCoupling: 1.35,
      retinalTintHex: '#818cf8',
    },
  },
  'penrose-twistor-lightcone': {
    id: 'penrose-twistor-lightcone',
    dimensionTierNumber: 9,
    dimensionLabel: 'D8 · Twistor Lightcone',
    name: 'Penrose Twistor Null-Lightcone',
    genreClassification: 'Relativistic Null-Geodesic Spinor Continuum',
    tagline:
      'Causality-woven light-cones, celestial spinor helices, and velocity-coupled Lorentz time dilation.',
    biodepthStratumDepthKm: 88.0,
    skyColorHex: '#020916',
    fogColorHex: '#071936',
    fogDensity: 0.004,
    primaryAccentHex: '#22d3ee',
    secondaryAccentHex: '#f59e0b',
    portalRimPrimaryHex: '#38bdf8',
    portalRimSecondaryHex: '#fbbf24',
    terrainRoughness: 0.12,
    terrainMetalness: 0.88,
    gravityScale: 0.58,
    timeDilationGamma: 0.42,
    lorentzVelocityCoupling: 1.25,
    atmosphericPressureAtm: 0.18,
    hyperbolicCurvature: 0.68,
    primaryMatterYield: 'astral-singularity-core',
    secondaryMatterYield: 'graviton-alloy',
    visualShaderSignature:
      'Doppler blueshift/redshift horizon cones, golden twistor null-fibers, and relativistic spinor trails.',
    biologyProfile: {
      morphologyId: 'penrose-lorentz-helical',
      speciesDesignation: 'Spinor Nullius · Lorentz-Contracted Light-Ribbon Being',
      anatomicalAdaptationSummary:
        'Zero-rest-mass chiral spinor ribbons and double-helical light-cone limbs that physically Lorentz-contract along the direction of motion.',
      sensoryPovTitle: 'Relativistic Light-Cone Doppler Aberration (γ = 0.42×)',
      sensoryPovDescription:
        'Sprinting approaches the local speed of light, dynamically compressing forward FOV and slowing external world clocks down to 0.42×.',
      torsoScaleAxes: [0.82, 1.26, 0.82],
      limbRadialScale: 0.78,
      wingSpanMultiplier: 1.48,
      baseFovDegrees: 82,
      velocityFovAberration: 22.0,
      horizonRollCoupling: 1.65,
      retinalTintHex: '#22d3ee',
    },
  },
  'banach-tarski-fractal-atoll': {
    id: 'banach-tarski-fractal-atoll',
    dimensionTierNumber: 10,
    dimensionLabel: 'D9 · Fractal Paradox',
    name: 'Banach-Tarski Recursive Atoll',
    genreClassification: 'Non-Measurable Self-Similar Set-Theory Archipelago',
    tagline:
      'Infinitely subdivided Menger-Sierpinski monoliths that duplicate volume without conservation of mass.',
    biodepthStratumDepthKm: 112.0,
    skyColorHex: '#081410',
    fogColorHex: '#0f2920',
    fogDensity: 0.006,
    primaryAccentHex: '#34d399',
    secondaryAccentHex: '#c084fc',
    portalRimPrimaryHex: '#10b981',
    portalRimSecondaryHex: '#a855f7',
    terrainRoughness: 0.36,
    terrainMetalness: 0.68,
    gravityScale: 0.82,
    timeDilationGamma: 1.18,
    lorentzVelocityCoupling: 0.5,
    atmosphericPressureAtm: 0.88,
    hyperbolicCurvature: -0.38,
    primaryMatterYield: 'tachyon-mycelium',
    secondaryMatterYield: 'non-euclidean-void-basalt',
    visualShaderSignature:
      'Recursive Menger-sponge perforations, golden-ratio phyllotaxis spirals, and self-similar crystal clusters.',
    biologyProfile: {
      morphologyId: 'banach-tarski-fractal-colony',
      speciesDesignation: 'Colonia Sierpinski · Self-Similar Fractal Swarm-Body',
      anatomicalAdaptationSummary:
        'Composite organism made of self-similar micro-avatars and recursively subdivided octahedral limb clusters that split and recombine.',
      sensoryPovTitle: 'Multi-Scale Compound Fractal Optics (γ = 1.18×)',
      sensoryPovDescription:
        'Compound self-similar depth perception across micro and macro scales with 1.18× recursive cadence.',
      torsoScaleAxes: [1.1, 1.05, 1.1],
      limbRadialScale: 1.15,
      wingSpanMultiplier: 1.25,
      baseFovDegrees: 77,
      velocityFovAberration: 11.0,
      horizonRollCoupling: 1.05,
      retinalTintHex: '#34d399',
    },
  },
  'ads-cft-holographic-bulk': {
    id: 'ads-cft-holographic-bulk',
    dimensionTierNumber: 11,
    dimensionLabel: 'D10 · AdS/CFT Bulk',
    name: 'AdS/CFT Holographic Boundary Bulk',
    genreClassification: 'Quantum-Entangled Holographic Horizon Interior',
    tagline:
      'Hyperbolic Escher bulk geometry projected from a lower-dimensional quantum boundary via entanglement threads.',
    biodepthStratumDepthKm: 160.0,
    skyColorHex: '#040a18',
    fogColorHex: '#0a1632',
    fogDensity: 0.005,
    primaryAccentHex: '#60a5fa',
    secondaryAccentHex: '#2dd4bf',
    portalRimPrimaryHex: '#3b82f6',
    portalRimSecondaryHex: '#14b8a6',
    terrainRoughness: 0.2,
    terrainMetalness: 0.84,
    gravityScale: 0.72,
    timeDilationGamma: 0.72,
    lorentzVelocityCoupling: 0.78,
    atmosphericPressureAtm: 0.32,
    hyperbolicCurvature: -0.78,
    primaryMatterYield: 'luminous-bathyal-gel',
    secondaryMatterYield: 'astral-singularity-core',
    visualShaderSignature:
      'Holographic phase-interference fringes, Ryu-Takayanagi entanglement geodesics, and cyan-indigo horizon grids.',
    biologyProfile: {
      morphologyId: 'ads-cft-holographic-projection',
      speciesDesignation: 'Tensor Maldacena · Entangled Bulk Hologram Entity',
      anatomicalAdaptationSummary:
        'Translucent interference-hologram anatomy tethered by glowing quantum-entanglement filaments to the celestial boundary.',
      sensoryPovTitle: 'Holographic Boundary-to-Bulk Projection (γ = 0.72×)',
      sensoryPovDescription:
        'Experiences 3D depth as a quantum entanglement projection from the sky horizon at 0.72× bulk proper time.',
      torsoScaleAxes: [0.96, 1.16, 0.96],
      limbRadialScale: 0.88,
      wingSpanMultiplier: 1.4,
      baseFovDegrees: 79,
      velocityFovAberration: 14.0,
      horizonRollCoupling: 1.2,
      retinalTintHex: '#60a5fa',
    },
  },
  'm-theory-11d-brane-cathedral': {
    id: 'm-theory-11d-brane-cathedral',
    dimensionTierNumber: 12,
    dimensionLabel: 'D11–D12 · M-Brane',
    name: '11D M-Theory Supermembrane Cathedral',
    genreClassification: 'Omniversal Supergravity P-Brane Sanctum',
    tagline:
      'Colliding 11-dimensional M2/M5 supermembranes, E8×E8 heterotic gauge crowns, and dual-time harmonic resonance.',
    biodepthStratumDepthKm: 256.0,
    skyColorHex: '#12071f',
    fogColorHex: '#220d38',
    fogDensity: 0.0045,
    primaryAccentHex: '#fbbf24',
    secondaryAccentHex: '#c084fc',
    portalRimPrimaryHex: '#fde047',
    portalRimSecondaryHex: '#e879f9',
    terrainRoughness: 0.14,
    terrainMetalness: 0.92,
    gravityScale: 0.62,
    timeDilationGamma: 1.65,
    lorentzVelocityCoupling: 0.95,
    atmosphericPressureAtm: 0.25,
    hyperbolicCurvature: 0.82,
    primaryMatterYield: 'astral-singularity-core',
    secondaryMatterYield: 'graviton-alloy',
    visualShaderSignature:
      'Radiant golden-violet M2/M5 membrane sheets, E8 Lie-algebraic polyhedral halos, and harmonic flux-tubes.',
    biologyProfile: {
      morphologyId: 'm-theory-supermembrane-seraph',
      speciesDesignation: 'Ophanim Undecim · 11D Supermembrane Sovereign',
      anatomicalAdaptationSummary:
        'Multi-tiered harmonic p-brane wings, floating E8 Lie-algebraic crown rings, and luminous flux-tube limbs resonating across 11 dimensions.',
      sensoryPovTitle: '11D Omnidirectional Brane-Tension Perception (γ = 1.65×)',
      sensoryPovDescription:
        'Dual-time supergravity harmonics elevate temporal flow to 1.65× with panoramic 86° multidimensional sightlines.',
      torsoScaleAxes: [1.12, 1.18, 1.12],
      limbRadialScale: 1.06,
      wingSpanMultiplier: 1.65,
      baseFovDegrees: 86,
      velocityFovAberration: 15.0,
      horizonRollCoupling: 1.45,
      retinalTintHex: '#fbbf24',
    },
  },
};

export const DIFFERENTIAL_UNIVERSE_BOUNDARIES: Record<
  DifferentialUniverseBoundaryId,
  DifferentialUniverseBoundarySpec
> = new Proxy(RAW_DIFFERENTIAL_UNIVERSE_BOUNDARIES, {
  get(target, prop: string | symbol) {
    if (typeof prop === 'string' && prop in target) {
      return target[prop as DifferentialUniverseBoundaryId];
    }
    return target['tesseractic-4d-reliquary'];
  },
});

export const ALL_DIFFERENTIAL_BOUNDARY_IDS: DifferentialUniverseBoundaryId[] = [
  'planck-0d-point-singularity',
  'flatland-2d-chromatic-ribbon',
  'hadal-biodepth-abyss',
  'monolithic-brutalist-singularity',
  'cel-traced-chromatic-steppe',
  'mycelial-silicon-necropolis',
  'tesseractic-4d-reliquary',
  'calabi-yau-6d-folded-garden',
  'penrose-twistor-lightcone',
  'banach-tarski-fractal-atoll',
  'ads-cft-holographic-bulk',
  'm-theory-11d-brane-cathedral',
];

export function resolveBoundaryForDimensionIndex(
  dimIndex: number
): DifferentialUniverseBoundarySpec {
  const idx = Math.max(
    0,
    Math.min(
      ALL_DIFFERENTIAL_BOUNDARY_IDS.length - 1,
      Math.round(dimIndex) - 1
    )
  );
  const id = ALL_DIFFERENTIAL_BOUNDARY_IDS[idx];
  return DIFFERENTIAL_UNIVERSE_BOUNDARIES[id];
}

export type PortalRoomTierId = 0 | 1 | 2 | 3;

export interface PortalRoomTierSpec {
  tier: PortalRoomTierId;
  name: string;
  subtitle: string;
  dimensionsLabel: string;
  description: string;
  costMatters: Partial<Record<MultiversalMatterId, number>>;
  unlockedFeatures: string[];
}

export const PORTAL_ROOM_TIERS: Record<PortalRoomTierId, PortalRoomTierSpec> = {
  0: {
    tier: 0,
    name: 'Tier 0 · Unedited Foundational Square Chamber',
    subtitle: 'Monumental 36m × 36m × 12m Architectural Void Room',
    dimensionsLabel: '36m × 36m × 12m',
    description:
      'The stark, cavernous square architectural chamber on the other side of your reality tear. Features clean Brutalist-dimensional grid joints, high-contrast perimeter skylighting, and the core Dimensional Synthesis Crucible.',
    costMatters: {},
    unlockedFeatures: [
      'Live Splitgate/Portal Render-to-Texture Sightline',
      '36m × 36m Walkable Square Chamber Floor',
      'North Dimensional Synthesis Crucible',
      'East Room Evolution & Matter Infuser',
    ],
  },
  1: {
    tier: 1,
    name: 'Tier 1 · Elemental Conduit & Resonance Chamber',
    subtitle: 'Active Elemental Seed Channels & Armory Pedestals',
    dimensionsLabel: '36m × 36m × 12m (Infused)',
    description:
      'Infuses the square room’s floor and wall joints with your active Elemental Seed and Destination Boundary shaders, awakening glowing energy veins and physical Armory & Graft Display Pedestals.',
    costMatters: {
      'abyssal-biodepth-chitin': 2,
      'non-euclidean-void-basalt': 2,
    },
    unlockedFeatures: [
      'Live Elemental Floor & Wall Conduit Veins',
      'West Armory & Somatic Graft Display Pedestals',
      '+15% Dimensional Crafting Yield Efficiency',
    ],
  },
  2: {
    tier: 2,
    name: 'Tier 2 · Biodepth Sanctuary & Matter Extractor',
    subtitle: 'Bioluminescent Observation Dome & Passive Matter Harvester',
    dimensionsLabel: '36m × 36m × 14m (Biodepth Crown)',
    description:
      'Opens a recessed bioluminescent ceiling observation aperture above the square room and installs automated Multiversal Matter extractors that passively synthesize rare matter while you explore.',
    costMatters: {
      'luminous-bathyal-gel': 3,
      'prismatic-vector-glass': 2,
      'tachyon-mycelium': 2,
    },
    unlockedFeatures: [
      'Recessed Biodepth Ceiling Skylight & Leviathan Rib Truss',
      'Automated Multiversal Matter Harvester Pylons',
      'Harmonic Anti-Gravity Mobility Pads inside Room',
    ],
  },
  3: {
    tier: 3,
    name: 'Tier 3 · Multiversal Nexus Citadel',
    subtitle: 'Multi-Portal Fast-Travel Bays & Apex Singularity Forge',
    dimensionsLabel: '36m × 36m × 16m (Omniversal Citadel)',
    description:
      'Transforms the square room into a full Multiversal Nexus with secondary Portal Bays along the West/North walls linked to every Differential Universe Boundary, plus Apex Singularity crafting.',
    costMatters: {
      'graviton-alloy': 3,
      'chronos-lattice-quartz': 3,
      'astral-singularity-core': 2,
    },
    unlockedFeatures: [
      'Multi-Portal Fast-Travel Stargate Bays to All 5 Universe Boundaries',
      'Apex Singularity Core Overclock at the Synthesis Crucible',
      'Full 4D Tesseractic Ceiling Reliquary Crown',
    ],
  },
};

export type PortalRoomModuleKind =
  | 'interior-mezzanine-catwalk'
  | 'interior-sanctum-alcove'
  | 'interior-liminal-backrooms-corridor'
  | 'interior-furnace-foundry-bay'
  | 'interior-command-bridge-deck'
  | 'interior-voidwalker-armory-vault'
  | 'biodepth-light-pylon'
  | 'matter-containment-plinth'
  | 'brutalist-partition-wall'
  | 'harmonic-gravity-pad'
  | 'synaptic-conduit-arch';

export interface PlacedPortalRoomModule {
  id: string;
  kind: PortalRoomModuleKind;
  name: string;
  gx: number; // Snapped to 2m square grid inside [-15, 15]
  gz: number;
  rotationY: number;
  accentHex: string;
}

export interface PortalRoomModuleBlueprint {
  kind: PortalRoomModuleKind;
  name: string;
  shortLabel: string;
  category: 'walkable-interior-section' | 'architectural-module';
  footprintLabel: string;
  walkableElevationM: number;
  description: string;
  costMatter: MultiversalMatterId;
  costAmount: number;
}

export const PORTAL_ROOM_MODULE_BLUEPRINTS: PortalRoomModuleBlueprint[] = [
  {
    kind: 'interior-mezzanine-catwalk',
    name: 'Mezzanine Gallery & Access Ramp',
    shortLabel: 'Mezzanine + Ramp',
    category: 'walkable-interior-section',
    footprintLabel: '6m × 4m · +2.6m Walkable Deck',
    walkableElevationM: 2.6,
    description:
      'Seamless walkable second-story charcoal-iron mezzanine deck with integrated sloped access ramps and wrought-iron chain railings.',
    costMatter: 'non-euclidean-void-basalt',
    costAmount: 0,
  },
  {
    kind: 'interior-sanctum-alcove',
    name: 'Cyber-Occult Reliquary Sanctum Room',
    shortLabel: 'Sanctum Alcove',
    category: 'walkable-interior-section',
    footprintLabel: '6m × 6m · Walk-In Chamber',
    walkableElevationM: 0.25,
    description:
      'Enclosed faceted obsidian interior room with sacred-geometry floor incisions and a wrought-iron chain-suspended diamond singularity core.',
    costMatter: 'abyssal-biodepth-chitin',
    costAmount: 0,
  },
  {
    kind: 'interior-liminal-backrooms-corridor',
    name: 'Liminal Anomaly Tear Corridor',
    shortLabel: 'Liminal Tear Wing',
    category: 'walkable-interior-section',
    footprintLabel: '6m × 4m · Liminal Rift Wing',
    walkableElevationM: 0.2,
    description:
      'Surreal ochre-partitioned liminal corridor with buzzing fluorescent ceiling panels bisected by a viscous black ferrofluid reality tear and golden runic halo.',
    costMatter: 'chronos-lattice-quartz',
    costAmount: 0,
  },
  {
    kind: 'interior-furnace-foundry-bay',
    name: 'Furnace-Amber Crucible Foundry Wing',
    shortLabel: 'Foundry Wing',
    category: 'walkable-interior-section',
    footprintLabel: '6m × 4m · +0.6m Forging Dais',
    walkableElevationM: 0.6,
    description:
      'Walkable raised forging platform with molten furnace-amber conduits, obsidian anvils, and heavy wrought-iron suspension chains.',
    costMatter: 'graviton-alloy',
    costAmount: 0,
  },
  {
    kind: 'interior-command-bridge-deck',
    name: 'Elevated Astral Command Bridge',
    shortLabel: 'Command Bridge',
    category: 'walkable-interior-section',
    footprintLabel: '8m × 4m · +1.8m Bridge Deck',
    walkableElevationM: 1.8,
    description:
      'Elevated command overlook with dual approach ramps, holo-astrolabe tactical table, and horizontal datamosh glitch holoscreens.',
    costMatter: 'chronos-lattice-quartz',
    costAmount: 0,
  },
  {
    kind: 'interior-voidwalker-armory-vault',
    name: 'Voidwalker Stealth Armory Section',
    shortLabel: 'Armory Vault',
    category: 'walkable-interior-section',
    footprintLabel: '6m × 4m · Walk-In Vault',
    walkableElevationM: 0.3,
    description:
      'Partitioned interior armory wing housing faceted charcoal-iron helm displays, biomechanical cable racks, and containment lockers.',
    costMatter: 'prismatic-vector-glass',
    costAmount: 0,
  },
  {
    kind: 'biodepth-light-pylon',
    name: 'Furnace-Amber & Biodepth Pylon',
    shortLabel: 'Light Pylon',
    category: 'architectural-module',
    footprintLabel: '2m × 2m · Vertical Column',
    walkableElevationM: 0,
    description:
      'Casts high-contrast furnace-amber and cold diamond-white rim illumination across the chamber.',
    costMatter: 'luminous-bathyal-gel',
    costAmount: 0,
  },
  {
    kind: 'matter-containment-plinth',
    name: 'Chain-Suspended Reliquary Plinth',
    shortLabel: 'Reliquary Plinth',
    category: 'architectural-module',
    footprintLabel: '2m × 2m · Pedestal',
    walkableElevationM: 1.35,
    description:
      'Displays a levitating octahedral obsidian-iron reliquary anchored by taut wrought-iron chains.',
    costMatter: 'non-euclidean-void-basalt',
    costAmount: 0,
  },
  {
    kind: 'brutalist-partition-wall',
    name: 'Faceted Obsidian Partition Wall',
    shortLabel: 'Obsidian Wall',
    category: 'architectural-module',
    footprintLabel: '3.6m × 0.5m · Partition',
    walkableElevationM: 0,
    description:
      'Subdivides the 36m × 36m chamber into custom rooms with incised furnace-orange sacred geometry seams.',
    costMatter: 'abyssal-biodepth-chitin',
    costAmount: 0,
  },
  {
    kind: 'harmonic-gravity-pad',
    name: 'Graviton Updraft & Stabilizer Pad',
    shortLabel: 'Gravity Pad',
    category: 'architectural-module',
    footprintLabel: '2.4m × 2.4m · Gravity Well',
    walkableElevationM: 0.15,
    description:
      'Projects a localized low-gravity updraft column to effortlessly reach upper mezzanine sections.',
    costMatter: 'graviton-alloy',
    costAmount: 0,
  },
  {
    kind: 'synaptic-conduit-arch',
    name: 'Cyber-Occult Chain & Conduit Arch',
    shortLabel: 'Conduit Arch',
    category: 'architectural-module',
    footprintLabel: '4m Span · Portal Archway',
    walkableElevationM: 0,
    description:
      'Frames interior corridors with ribbed biomechanical conduits, wrought-iron chains, and datamosh glitch bars.',
    costMatter: 'tachyon-mycelium',
    costAmount: 0,
  },
];

export interface DimensionalCrucibleItemRecipe {
  id: string;
  name: string;
  category: 'dimensional-weapon' | 'somatic-biodepth-graft' | 'portal-anchor-tech';
  description: string;
  gameplayEffectSummary: string;
  matterCosts: Partial<Record<MultiversalMatterId, number>>;
  baseResourceCosts?: Partial<Record<ResourceId, number>>;
  requiredRoomTier: PortalRoomTierId;
  accentHex: string;
}

export const DIMENSIONAL_CRUCIBLE_RECIPES: DimensionalCrucibleItemRecipe[] = [
  {
    id: 'crucible-hadal-rift-cleaver',
    name: 'Hadal Biodepth Rift-Cleaver',
    category: 'dimensional-weapon',
    description:
      'Forged from Abyssal Biodepth Chitin and Graviton Alloy. Melee strikes tear micro-rifts that detonate hydrostatic shockwaves.',
    gameplayEffectSummary: '+45% Melee Cleave Reach & Hydrostatic Gore Shockwave',
    matterCosts: {
      'abyssal-biodepth-chitin': 2,
      'graviton-alloy': 1,
    },
    requiredRoomTier: 0,
    accentHex: '#06b6d4',
  },
  {
    id: 'crucible-bathyal-somatic-carapace',
    name: 'Bathyal Subsurface Somatic Carapace',
    category: 'somatic-biodepth-graft',
    description:
      'Grafts Luminous Bathyal Gel and Tachyon Mycelium into the Voidwalker dermis, boosting sprint velocity and jump impulse.',
    gameplayEffectSummary: '+25% Sprint Speed, +20% Jump Impulse & Bioluminescent Dermis',
    matterCosts: {
      'luminous-bathyal-gel': 2,
      'tachyon-mycelium': 1,
    },
    requiredRoomTier: 0,
    accentHex: '#2dd4bf',
  },
  {
    id: 'crucible-vector-prism-lance',
    name: 'Chromatic Vector-Glass Rail Lance',
    category: 'dimensional-weapon',
    description:
      'Focuses Prismatic Vector Glass and Chronos Quartz into a high-velocity spectral beam that pierces multi-entity formations.',
    gameplayEffectSummary: 'High-Velocity Spectral Impulse & Chromatic Refraction',
    matterCosts: {
      'prismatic-vector-glass': 2,
      'chronos-lattice-quartz': 1,
    },
    requiredRoomTier: 1,
    accentHex: '#f43f5e',
  },
  {
    id: 'crucible-omnidirectional-portal-anchor',
    name: 'Tesseractic Deep-World Portal Anchor',
    category: 'portal-anchor-tech',
    description:
      'Stabilizes Reality-Tear Portals with Non-Euclidean Void Basalt and Astral Singularity Cores, expanding portal sightline clarity and fast-travel range.',
    gameplayEffectSummary: 'Unlocks Instant Deep-World Boundary Shift & +3 Deviance XP',
    matterCosts: {
      'non-euclidean-void-basalt': 2,
      'astral-singularity-core': 1,
    },
    requiredRoomTier: 1,
    accentHex: '#a855f7',
  },
];

export type CustomKeybindAction =
  | 'openPortal'
  | 'handInventory'
  | 'toggleCrucible'
  | 'roomArchitectMode'
  | 'dimensionalShift'
  | 'interactGrab'
  | 'throwObject'
  | 'stealthCrouch'
  | 'perkTree'
  | 'avatarStudio';

export interface CustomKeybindsConfig {
  openPortal: string; // Default: 'KeyV'
  handInventory: string; // Default: 'KeyI'
  toggleCrucible: string; // Default: 'KeyK'
  roomArchitectMode: string; // Default: 'KeyB'
  dimensionalShift: string; // Default: 'KeyX'
  interactGrab: string; // Default: 'KeyE'
  throwObject: string; // Default: 'KeyQ'
  stealthCrouch: string; // Default: 'KeyC'
  perkTree: string; // Default: 'KeyP'
  avatarStudio: string; // Default: 'KeyU'
}

export const DEFAULT_KEYBINDS_CONFIG: CustomKeybindsConfig = {
  openPortal: 'KeyV',
  handInventory: 'KeyI',
  toggleCrucible: 'KeyK',
  roomArchitectMode: 'KeyB',
  dimensionalShift: 'KeyX',
  interactGrab: 'KeyE',
  throwObject: 'KeyQ',
  stealthCrouch: 'KeyC',
  perkTree: 'KeyP',
  avatarStudio: 'KeyU',
};

export const KEYBIND_ACTION_LABELS: Record<
  CustomKeybindAction,
  { label: string; description: string }
> = {
  openPortal: {
    label: 'Tear Open Portal / Square Room Sightline',
    description:
      'Opens the shader-distorted reality tear in front of you with a live view into your large Square Portal Room.',
  },
  handInventory: {
    label: 'Left-Hand Void Inventory Bloom',
    description:
      'Opens or clenches the diegetic 3D left-hand Void Ball inventory.',
  },
  toggleCrucible: {
    label: 'Dimensional Crafting & Portal Room Ledger',
    description:
      'Opens the Biodepth Dimensional Crafting Crucible, Multiversal Matter inventory, and Room Upgrade interface.',
  },
  roomArchitectMode: {
    label: 'Place Module / Room Architect Mode',
    description:
      'Places architectural modules inside the Square Portal Room or constructs BIM structures in the exterior world.',
  },
  dimensionalShift: {
    label: 'Shift Differential Universe Boundary / Decode',
    description:
      'Shifts across Differential Universe Boundaries (or decodes cultural anomalies when near settlements).',
  },
  interactGrab: {
    label: 'Interact with Station / Grab / Excavate',
    description:
      'Activates 3D Portal Room crafting stations, grabs physical weapons, or mines granular soil.',
  },
  throwObject: {
    label: 'Ballistic Impale Throw',
    description: 'Hurls held world weapons or severed limbs along your aim vector.',
  },
  stealthCrouch: {
    label: 'Predator Stealth Prowl',
    description: 'Crouches silently and eavesdrops on Trojan sabotage plots.',
  },
  perkTree: {
    label: 'Dimensional Deviance Perk Tree',
    description: 'Opens the somatic mutation and perk progression overlay.',
  },
  avatarStudio: {
    label: 'Live 3D Character Studio & Origin Cutscene',
    description: 'Opens the in-engine 3D turntable avatar customizer.',
  },
};

export type GraphicsQualityPreset = 'performance' | 'balanced' | 'ultra-biodepth';

export interface BiodepthUiAndGraphicsConfig {
  keybinds: CustomKeybindsConfig;
  hudScale: number; // 0.75 to 1.25
  hudOpacity: number; // 0.35 to 1.0
  minimalDiegeticHud: boolean;
  graphicsPreset: GraphicsQualityPreset;
  portalRenderTargetSize: number; // 512, 768, or 1024
  enablePortalShaderDistortion: boolean;
  activeUniverseBoundary: DifferentialUniverseBoundaryId;
}

export const DEFAULT_BIODEPTH_UI_GRAPHICS_CONFIG: BiodepthUiAndGraphicsConfig = {
  keybinds: DEFAULT_KEYBINDS_CONFIG,
  hudScale: 1.0,
  hudOpacity: 0.92,
  minimalDiegeticHud: false,
  graphicsPreset: 'ultra-biodepth',
  portalRenderTargetSize: 1024,
  enablePortalShaderDistortion: true,
  activeUniverseBoundary: 'hadal-biodepth-abyss',
};

export function formatKeyCodeLabel(code: string): string {
  if (!code) return '?';
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code === 'Space') return 'SPACE';
  if (code === 'ShiftLeft' || code === 'ShiftRight') return 'SHIFT';
  if (code === 'Tab') return 'TAB';
  return code.toUpperCase();
}

export type PortalRoomGravityMode =
  | 'stabilized-1g'
  | 'boundary-linked'
  | 'low-g-architect';

export interface PortalRoomRuntimeTelemetry {
  isPortalOpenInWorld: boolean;
  portalOpenProgress: number; // 0 -> 1 reality-tear growth animation
  isPlayerInsidePortalRoom: boolean;
  portalRoomTier: PortalRoomTierId;
  focusedRoomStation:
    | 'none'
    | 'synthesis-crucible'
    | 'room-evolution-infuser'
    | 'armory-graft-rack'
    | 'return-world-portal'
    | 'boundary-stargate-bay'
    | 'inner-maze-portal';
  focusedStationLabel: string;
  focusedStationHint: string;
  activeModuleKind: PortalRoomModuleKind;
  placedModulesCount: number;
  effectiveGravityG?: number;
  currentFloorElevationM?: number;
  portalRoomGravityMode?: PortalRoomGravityMode;
  // Secondary Inner Maze Portal & Procedural Maze Dimension Telemetry
  isInnerMazePortalOpen?: boolean;
  innerMazePortalProgress?: number;
  selectedMazeIndex?: number; // 0-indexed into knownMazes
  knownMazesCount?: number;   // Starts at 100, grows as City Shadow-Mazes are discovered
  selectedMazeCode?: string;
  selectedMazeTitle?: string;
  selectedMazeThemeTitle?: string;
  selectedMazeEntityTitle?: string;
  selectedMazeAssimilationPct?: number;
  selectedMazeEntityControlPct?: number;
  selectedMazeLootCount?: number;
  isPlayerInsideMazeDimension?: boolean;
  activeMazeTechKind?: MazeTechEquipmentKind;
  placedMazeTechCount?: number;
  activeSettlementTierLabel?: string;
  activeSettlementGoodsRate?: number;
  urbanNoclipRiskPct?: number;
}

// ============================================================================
// PROCEDURAL GEOMETRY-NODES MAZE DIMENSIONS, ENTITY WALLPAPER/CARPET SHADERS,
// SURVEILLANCE CAMERAS, ASSIMILATION TECH & SIMS CITY SHADOW-LABYRINTHS
// ============================================================================

export type MazeHorrorArchetypeId =
  | 'vitreous-arterial-weaver'
  | 'mycelial-chitin-stalker'
  | 'chrono-escapement-wraith'
  | 'cymatic-choir-husher'
  | 'hyperbolic-basalt-executioner'
  | 'superfluid-mercury-amalgam'
  | 'prismatic-glass-harvester'
  | 'hadal-piezo-leviathan-spawn';

export type MazeWallPatternKind =
  | 'arterial-damask-brocade'
  | 'biolum-chitin-hex-lattice'
  | 'chrono-brass-art-deco-filigree'
  | 'cymatic-fluted-barometric-silk'
  | 'brutalist-incised-basalt-weave'
  | 'iridescent-mercury-contour-rib'
  | 'prismatic-faceted-reliquary-tile'
  | 'bathyal-ribbed-carapace-velvet';

export type MazeFloorShaderKind =
  | 'crimson-velvet-vascular-pile'
  | 'emerald-spore-tufted-berber'
  | 'obsidian-gold-chevron-parquet'
  | 'acoustic-slate-harmonic-weave'
  | 'charcoal-iron-grated-tread'
  | 'laminar-quicksilver-terrazzo'
  | 'dichroic-prism-mosaic-weave'
  | 'abyssal-biolum-silt-carpet';

export interface MazeEntityThemeSpec {
  archetypeId: MazeHorrorArchetypeId;
  entityName: string;
  entityTitle: string;
  themeName: string;
  wallPatternKind: MazeWallPatternKind;
  wallPatternIndex: number; // 0..7 in GLSL shader
  floorShaderKind: MazeFloorShaderKind;
  floorShaderIndex: number; // 0..7 in GLSL shader
  wallPrimaryHex: string;
  wallSecondaryHex: string;
  wallVeinEmissiveHex: string;
  floorPrimaryHex: string;
  floorSecondaryHex: string;
  ceilingLuminaireHex: string;
  portalRimPrimaryHex: string;
  portalRimSecondaryHex: string;
  primaryMatterYield: MultiversalMatterId;
  secondaryMatterYield: MultiversalMatterId;
  entityLore: string;
}

export const MAZE_ENTITY_THEME_CATALOG: Record<
  MazeHorrorArchetypeId,
  MazeEntityThemeSpec
> = {
  'vitreous-arterial-weaver': {
    archetypeId: 'vitreous-arterial-weaver',
    entityName: 'Sanguine Fulgurite Weaver',
    entityTitle: 'Vitreous Arterial Stalker',
    themeName: 'Crimson Obsidian Damask & Vascular Velvet Pile',
    wallPatternKind: 'arterial-damask-brocade',
    wallPatternIndex: 0,
    floorShaderKind: 'crimson-velvet-vascular-pile',
    floorShaderIndex: 0,
    wallPrimaryHex: '#1c0b12',
    wallSecondaryHex: '#4c1122',
    wallVeinEmissiveHex: '#f43f5e',
    floorPrimaryHex: '#14070c',
    floorSecondaryHex: '#3b0a18',
    ceilingLuminaireHex: '#fb7185',
    portalRimPrimaryHex: '#f43f5e',
    portalRimSecondaryHex: '#fb923c',
    primaryMatterYield: 'prismatic-vector-glass',
    secondaryMatterYield: 'graviton-alloy',
    entityLore:
      'Spins superheated obsidian-glass damask across labyrinth partitions and listens for footstep vibrations through crimson velvet carpet pile.',
  },
  'mycelial-chitin-stalker': {
    archetypeId: 'mycelial-chitin-stalker',
    entityName: 'Cordyceps Chitin Sovereign',
    entityTitle: 'Bioluminescent Hyphae Predator',
    themeName: 'Iridescent Chitin Brocade & Mycelial Tufted Pile',
    wallPatternKind: 'biolum-chitin-hex-lattice',
    wallPatternIndex: 1,
    floorShaderKind: 'emerald-spore-tufted-berber',
    floorShaderIndex: 1,
    wallPrimaryHex: '#071a14',
    wallSecondaryHex: '#0f382a',
    wallVeinEmissiveHex: '#10b981',
    floorPrimaryHex: '#05120e',
    floorSecondaryHex: '#0d2e22',
    ceilingLuminaireHex: '#34d399',
    portalRimPrimaryHex: '#10b981',
    portalRimSecondaryHex: '#2dd4bf',
    primaryMatterYield: 'tachyon-mycelium',
    secondaryMatterYield: 'abyssal-biodepth-chitin',
    entityLore:
      'Cultivates hexagonal chitinous wall tapestries and spore-tufted floors that feed retrocausal neural telemetry to the hive.',
  },
  'chrono-escapement-wraith': {
    archetypeId: 'chrono-escapement-wraith',
    entityName: 'Ouroboros Escapement Wraith',
    entityTitle: '4D Clockwork Phase-Hunter',
    themeName: 'Chrono-Brass Filigree & Obsidian-Gold Chevron Parquet',
    wallPatternKind: 'chrono-brass-art-deco-filigree',
    wallPatternIndex: 2,
    floorShaderKind: 'obsidian-gold-chevron-parquet',
    floorShaderIndex: 2,
    wallPrimaryHex: '#131024',
    wallSecondaryHex: '#2c224d',
    wallVeinEmissiveHex: '#eab308',
    floorPrimaryHex: '#0c0a18',
    floorSecondaryHex: '#241c3d',
    ceilingLuminaireHex: '#fde047',
    portalRimPrimaryHex: '#c084fc',
    portalRimSecondaryHex: '#facc15',
    primaryMatterYield: 'chronos-lattice-quartz',
    secondaryMatterYield: 'astral-singularity-core',
    entityLore:
      'Steps sideways through Art-Deco brass gear filigree walls when unobserved; only active surveillance cameras lock its timeline phase.',
  },
  'cymatic-choir-husher': {
    archetypeId: 'cymatic-choir-husher',
    entityName: 'Null-Acoustic Choir Cantor',
    entityTitle: 'Standing-Wave Barometric Entity',
    themeName: 'Fluted Cymatic Silk & Acoustic Slate Weave',
    wallPatternKind: 'cymatic-fluted-barometric-silk',
    wallPatternIndex: 3,
    floorShaderKind: 'acoustic-slate-harmonic-weave',
    floorShaderIndex: 3,
    wallPrimaryHex: '#081826',
    wallSecondaryHex: '#12334d',
    wallVeinEmissiveHex: '#38bdf8',
    floorPrimaryHex: '#06111c',
    floorSecondaryHex: '#0f273d',
    ceilingLuminaireHex: '#7dd3fc',
    portalRimPrimaryHex: '#38bdf8',
    portalRimSecondaryHex: '#818cf8',
    primaryMatterYield: 'luminous-bathyal-gel',
    secondaryMatterYield: 'chronos-lattice-quartz',
    entityLore:
      'Absorbs all ambient sound inside fluted Chladni-silk halls and hunts by barometric pressure differentials.',
  },
  'hyperbolic-basalt-executioner': {
    archetypeId: 'hyperbolic-basalt-executioner',
    entityName: 'Scarpa Tensor Executioner',
    entityTitle: 'High-G Monolithic Sentinel',
    themeName: 'Incised Void-Basalt Weave & Charcoal-Iron Tread',
    wallPatternKind: 'brutalist-incised-basalt-weave',
    wallPatternIndex: 4,
    floorShaderKind: 'charcoal-iron-grated-tread',
    floorShaderIndex: 4,
    wallPrimaryHex: '#11151f',
    wallSecondaryHex: '#1e293b',
    wallVeinEmissiveHex: '#f59e0b',
    floorPrimaryHex: '#0b0e14',
    floorSecondaryHex: '#18202c',
    ceilingLuminaireHex: '#fbbf24',
    portalRimPrimaryHex: '#f59e0b',
    portalRimSecondaryHex: '#38bdf8',
    primaryMatterYield: 'non-euclidean-void-basalt',
    secondaryMatterYield: 'graviton-alloy',
    entityLore:
      'Patrols stark architectural basalt corridors with furnace-amber joints, folding local corridors around intruders.',
  },
  'superfluid-mercury-amalgam': {
    archetypeId: 'superfluid-mercury-amalgam',
    entityName: 'Laminar Quicksilver Amalgam',
    entityTitle: 'Zero-Viscosity Mimic Entity',
    themeName: 'Iridescent Mercury Ribbing & Quicksilver Terrazzo',
    wallPatternKind: 'iridescent-mercury-contour-rib',
    wallPatternIndex: 5,
    floorShaderKind: 'laminar-quicksilver-terrazzo',
    floorShaderIndex: 5,
    wallPrimaryHex: '#071c24',
    wallSecondaryHex: '#0e3a47',
    wallVeinEmissiveHex: '#06b6d4',
    floorPrimaryHex: '#051318',
    floorSecondaryHex: '#0b2b36',
    ceilingLuminaireHex: '#22d3ee',
    portalRimPrimaryHex: '#06b6d4',
    portalRimSecondaryHex: '#c084fc',
    primaryMatterYield: 'luminous-bathyal-gel',
    secondaryMatterYield: 'abyssal-biodepth-chitin',
    entityLore:
      'Flows through mirror-veined terrazzo floors and forms vertical mercury ribs that shift behind the player’s peripheral vision.',
  },
  'prismatic-glass-harvester': {
    archetypeId: 'prismatic-glass-harvester',
    entityName: 'Dichroic Vector Harvester',
    entityTitle: 'Spectral-Glass Refraction Stalker',
    themeName: 'Faceted Reliquary Tile & Dichroic Prism Carpet',
    wallPatternKind: 'prismatic-faceted-reliquary-tile',
    wallPatternIndex: 6,
    floorShaderKind: 'dichroic-prism-mosaic-weave',
    floorShaderIndex: 6,
    wallPrimaryHex: '#1d092b',
    wallSecondaryHex: '#3b1254',
    wallVeinEmissiveHex: '#e879f9',
    floorPrimaryHex: '#14061f',
    floorSecondaryHex: '#2b0d3d',
    ceilingLuminaireHex: '#f472b6',
    portalRimPrimaryHex: '#e879f9',
    portalRimSecondaryHex: '#38bdf8',
    primaryMatterYield: 'prismatic-vector-glass',
    secondaryMatterYield: 'astral-singularity-core',
    entityLore:
      'Refracts its silhouette across dichroic crystal wall tiles, hoarding high-rarity multiversal caches inside dead-end vaults.',
  },
  'hadal-piezo-leviathan-spawn': {
    archetypeId: 'hadal-piezo-leviathan-spawn',
    entityName: 'Bathyal Piezo-Carapace Spawn',
    entityTitle: 'Deep-Trench Luciferin Hunter',
    themeName: 'Ribbed Carapace Velvet & Bioluminescent Silt Weave',
    wallPatternKind: 'bathyal-ribbed-carapace-velvet',
    wallPatternIndex: 7,
    floorShaderKind: 'abyssal-biolum-silt-carpet',
    floorShaderIndex: 7,
    wallPrimaryHex: '#04151f',
    wallSecondaryHex: '#082c3d',
    wallVeinEmissiveHex: '#2dd4bf',
    floorPrimaryHex: '#030e14',
    floorSecondaryHex: '#072230',
    ceilingLuminaireHex: '#5eead4',
    portalRimPrimaryHex: '#2dd4bf',
    portalRimSecondaryHex: '#0284c7',
    primaryMatterYield: 'abyssal-biodepth-chitin',
    secondaryMatterYield: 'luminous-bathyal-gel',
    entityLore:
      'Pressurized deep-trench offshoot whose luciferin wall veins pulse in synchrony with its predatory heartbeat.',
  },
};

export const ALL_MAZE_HORROR_ARCHETYPE_IDS: MazeHorrorArchetypeId[] = [
  'vitreous-arterial-weaver',
  'mycelial-chitin-stalker',
  'chrono-escapement-wraith',
  'cymatic-choir-husher',
  'hyperbolic-basalt-executioner',
  'superfluid-mercury-amalgam',
  'prismatic-glass-harvester',
  'hadal-piezo-leviathan-spawn',
];

export type MazeSpatialTraitId =
  | 'frustum-shifting-partitions'
  | 'vertical-sub-level-pitfalls'
  | 'autonomic-heartbeat-corridors'
  | 'high-density-reliquary-vault';

export type MazeTechEquipmentKind =
  | 'surveillance-camera-rig'
  | 'maze-assimilation-pylon'
  | 'entity-command-beacon'
  | 'loot-siphon-transponder';

export interface MazeTechEquipmentBlueprint {
  kind: MazeTechEquipmentKind;
  name: string;
  shortLabel: string;
  accentHex: string;
  assimilationBoostPct: number;
  entityControlBoostPct: number;
  lockRadiusMeters: number;
  description: string;
}

export const MAZE_TECH_EQUIPMENT_CATALOG: Record<
  MazeTechEquipmentKind,
  MazeTechEquipmentBlueprint
> = {
  'surveillance-camera-rig': {
    kind: 'surveillance-camera-rig',
    name: 'Pan-Tilt Optical Surveillance Camera Rig',
    shortLabel: 'CCTV Camera Rig',
    accentHex: '#38bdf8',
    assimilationBoostPct: 18,
    entityControlBoostPct: 12,
    lockRadiusMeters: 18.0,
    description:
      'Projects an optical frustum laser cone that permanently locks non-euclidean shifting maze walls in sight and streams telemetry to the Portal Room.',
  },
  'maze-assimilation-pylon': {
    kind: 'maze-assimilation-pylon',
    name: 'Portal-Room Metric Assimilation Pylon',
    shortLabel: 'Assimilation Pylon',
    accentHex: '#10b981',
    assimilationBoostPct: 32,
    entityControlBoostPct: 10,
    lockRadiusMeters: 22.0,
    description:
      'Anchors local labyrinth geometry into the main 36m×36m Square Portal Room metric, accelerating full maze assimilation (100% = passive matter yield).',
  },
  'entity-command-beacon': {
    kind: 'entity-command-beacon',
    name: 'Neural-Cymatic Entity Command Beacon',
    shortLabel: 'Entity Command Beacon',
    accentHex: '#f43f5e',
    assimilationBoostPct: 12,
    entityControlBoostPct: 35,
    lockRadiusMeters: 20.0,
    description:
      'Overrides the predator instincts of the maze’s resident horror entity, pacifying or commanding it to guard your assimilated labyrinth.',
  },
  'loot-siphon-transponder': {
    kind: 'loot-siphon-transponder',
    name: 'Multiversal Loot Siphon Transponder',
    shortLabel: 'Loot Transponder',
    accentHex: '#eab308',
    assimilationBoostPct: 20,
    entityControlBoostPct: 15,
    lockRadiusMeters: 26.0,
    description:
      'Automatically locates and siphons uncollected Multiversal Matter caches across the maze directly into your Portal Room vault.',
  },
};

export const ALL_MAZE_TECH_EQUIPMENT_KINDS: MazeTechEquipmentKind[] = [
  'surveillance-camera-rig',
  'maze-assimilation-pylon',
  'entity-command-beacon',
  'loot-siphon-transponder',
];

export interface PlacedMazeTechEquipment {
  id: string;
  mazeId: string;
  kind: MazeTechEquipmentKind;
  worldX: number;
  worldY: number;
  worldZ: number;
  yaw: number;
}

export interface ProceduralMazeLootNode {
  id: string;
  cellX: number;
  cellZ: number;
  worldX: number;
  worldY: number;
  worldZ: number;
  matterId: MultiversalMatterId;
  matterAmount: number;
  collected: boolean;
}

export interface ProceduralMazeLevelSpec {
  id: string;
  mazeNumber: number; // #001..#100 starting catalog, #101+ emergent City Shadow-Mazes
  code: string;       // e.g. 'MZ-001 · VITREOUS-VAULT'
  title: string;
  seed: number;
  gridCols: number;   // e.g. 13 x 13 cells (4.0m per cell = 52m x 52m vast maze)
  gridRows: number;
  cellSizeM: number;
  wallHeightM: number;
  horrorArchetypeId: MazeHorrorArchetypeId;
  spatialTraits: MazeSpatialTraitId[];
  originKind: 'starting-known-100' | 'emergent-city-shadow-labyrinth';
  originSettlementName?: string;
  assimilationPct: number;   // 0 to 100%
  entityControlPct: number;  // 0 to 100%
  entityBehaviorMode: 'stalking' | 'pacified' | 'allied-guardian';
  totalLootCaches: number;
  harvestedLootCaches: number;
}

export type SettlementUrbanizationTier =
  | 'hearth-village'
  | 'urban-district'
  | 'dense-city';


// ============================================================================
// INFINITE ABSURD TIMELINES, IN-BETWEEN VOID RIFTS & CUSTOMIZABLE GATE SHAPES
// ============================================================================

export type PortalGateShapeId =
  | 'rectangular-rift'
  | 'fluid-vortex-ellipse'
  | 'hexagram-merkaba'
  | 'biomorphic-iris'
  | 'mandelbrot-slit'
  | 'tesseract-cross-gate'
  | 'ouroboros-chrono-ring';

export interface PortalGateShapeSpec {
  id: PortalGateShapeId;
  shaderShapeIndex: number; // 0 to 6 in GLSL SDF
  name: string;
  unlockTimelinesCount: number;
  description: string;
  rimGeometryStyle: string;
  defaultPrimaryHex: string;
  defaultSecondaryHex: string;
}

export const PORTAL_GATE_SHAPE_CATALOG: Record<
  PortalGateShapeId,
  PortalGateShapeSpec
> = {
  'rectangular-rift': {
    id: 'rectangular-rift',
    shaderShapeIndex: 0,
    name: 'Jagged Reality Tear',
    unlockTimelinesCount: 0,
    description:
      'Standard fractured non-Euclidean doorway torn directly through local spacetime.',
    rimGeometryStyle: '14 Fractured Obsidian Chitin Shards',
    defaultPrimaryHex: '#06b6d4',
    defaultSecondaryHex: '#a855f7',
  },
  'fluid-vortex-ellipse': {
    id: 'fluid-vortex-ellipse',
    shaderShapeIndex: 1,
    name: 'Swirling Portal-Fluid Vortex',
    unlockTimelinesCount: 1,
    description:
      'Classic interdimensional green-plasma elliptical vortex with centrifugal fluid swirls.',
    rimGeometryStyle: '16 Swirling Plasma Droplet Nodes',
    defaultPrimaryHex: '#22c55e',
    defaultSecondaryHex: '#a3e635',
  },
  'hexagram-merkaba': {
    id: 'hexagram-merkaba',
    shaderShapeIndex: 2,
    name: 'Hexagram Merkaba Tessellation',
    unlockTimelinesCount: 2,
    description:
      'Six-pointed sacred geometric star aperture that harmonizes chaotic timeline phase drift.',
    rimGeometryStyle: '12 Interlocking Golden Prism Pylons',
    defaultPrimaryHex: '#f59e0b',
    defaultSecondaryHex: '#38bdf8',
  },
  'biomorphic-iris': {
    id: 'biomorphic-iris',
    shaderShapeIndex: 3,
    name: 'Biomorphic Cronenberg Iris',
    unlockTimelinesCount: 3,
    description:
      'Pulsing organic sphincter-iris rimmed with breathing cartilaginous ribs and ocular veins.',
    rimGeometryStyle: '14 Pulsing Visceral Cartilage Ribs',
    defaultPrimaryHex: '#f43f5e',
    defaultSecondaryHex: '#fb923c',
  },
  'mandelbrot-slit': {
    id: 'mandelbrot-slit',
    shaderShapeIndex: 4,
    name: 'Mandelbrot Fractal Cardioid',
    unlockTimelinesCount: 5,
    description:
      'Recursive diamond-cardioid slit whose boundary bifurcates infinitely across scales.',
    rimGeometryStyle: '16 Recursive Bifurcated Crystal Spines',
    defaultPrimaryHex: '#c084fc',
    defaultSecondaryHex: '#2dd4bf',
  },
  'tesseract-cross-gate': {
    id: 'tesseract-cross-gate',
    shaderShapeIndex: 5,
    name: 'Tesseractic 8-Cell Hyper-Cross',
    unlockTimelinesCount: 7,
    description:
      'Orthogonal 4D hypercube cross-section gate projecting eight folded cubic facets.',
    rimGeometryStyle: '16 Orthogonal Hyper-Strut Brackets',
    defaultPrimaryHex: '#38bdf8',
    defaultSecondaryHex: '#facc15',
  },
  'ouroboros-chrono-ring': {
    id: 'ouroboros-chrono-ring',
    shaderShapeIndex: 6,
    name: 'Ouroboros Paradox Chrono-Ring',
    unlockTimelinesCount: 10,
    description:
      'Counter-rotating temporal clockwork iris that locks closed-timelike-curve trajectories.',
    rimGeometryStyle: '18 Clockwork Escapement Gear Teeth',
    defaultPrimaryHex: '#eab308',
    defaultSecondaryHex: '#ec4899',
  },
};

export const ALL_PORTAL_GATE_SHAPE_IDS: PortalGateShapeId[] = [
  'rectangular-rift',
  'fluid-vortex-ellipse',
  'hexagram-merkaba',
  'biomorphic-iris',
  'mandelbrot-slit',
  'tesseract-cross-gate',
  'ouroboros-chrono-ring',
];

export type VoidAnomalyResourceId =
  | 'portal-fluid-globule'
  | 'chrono-paradox-shard'
  | 'causal-splice-matrix'
  | 'symbiote-void-ichor';

export interface VoidAnomalyResourceSpec {
  id: VoidAnomalyResourceId;
  name: string;
  shortName: string;
  colorHex: string;
  emissiveHex: string;
  description: string;
}

export const VOID_ANOMALY_RESOURCE_CATALOG: Record<
  VoidAnomalyResourceId,
  VoidAnomalyResourceSpec
> = {
  'portal-fluid-globule': {
    id: 'portal-fluid-globule',
    name: 'Raw Portal-Fluid Globule',
    shortName: 'Portal Fluid',
    colorHex: '#22c55e',
    emissiveHex: '#84cc16',
    description:
      'Volatile hyper-luminescent green plasma condensed inside In-Between Timeline Voids.',
  },
  'chrono-paradox-shard': {
    id: 'chrono-paradox-shard',
    name: 'Chrono-Paradox Crystal Shard',
    shortName: 'Paradox Shard',
    colorHex: '#38bdf8',
    emissiveHex: '#0284c7',
    description:
      'Crystallized causal loop fragment harvested from colliding timeline branches.',
  },
  'causal-splice-matrix': {
    id: 'causal-splice-matrix',
    name: 'Causal Splice Matrix Core',
    shortName: 'Splice Matrix',
    colorHex: '#f59e0b',
    emissiveHex: '#d97706',
    description:
      'Non-Euclidean logic lattice used to splice rules from two different timelines together.',
  },
  'symbiote-void-ichor': {
    id: 'symbiote-void-ichor',
    name: 'Sentient Void-Symbiote Ichor',
    shortName: 'Symbiote Ichor',
    colorHex: '#f43f5e',
    emissiveHex: '#e11d48',
    description:
      'Living abyssal neuro-plasma that evolves the Left-Hand Void Ball into an autonomous symbiote.',
  },
};

export type VoidBallUpgradeBranchId =
  | 'reality-splicing-coordinates'
  | 'active-physics-mutation-beams'
  | 'pocket-sanctum-containment'
  | 'sentient-symbiote-tendrils';

export type VoidBallActiveBeamMode =
  | 'gravity-inversion-beam'
  | 'temporal-dilation-beam'
  | 'matter-mutation-ray';

export interface VoidBallUpgradeBranchSpec {
  id: VoidBallUpgradeBranchId;
  name: string;
  maxTier: number;
  accentHex: string;
  primaryResource: VoidAnomalyResourceId;
  secondaryResource: VoidAnomalyResourceId;
  tierDescriptions: [string, string, string, string];
}

export const VOID_BALL_UPGRADE_BRANCHES: Record<
  VoidBallUpgradeBranchId,
  VoidBallUpgradeBranchSpec
> = {
  'reality-splicing-coordinates': {
    id: 'reality-splicing-coordinates',
    name: 'Reality-Splicing & Coordinate Dialer',
    maxTier: 4,
    accentHex: '#22c55e',
    primaryResource: 'portal-fluid-globule',
    secondaryResource: 'causal-splice-matrix',
    tierDescriptions: [
      'Tier 1: Unlocks Custom Alphanumeric Timeline Coordinate Dialing & Direct In-Between Void Rift Entry.',
      'Tier 2: Unlocks Dual-Timeline Rule Splicing (Combine Biology of Timeline A with Physics of Timeline B).',
      'Tier 3: Stabilizes Portal Gate Aperture & Doubles Harvest Yield from Timeline Anomalies.',
      'Tier 4: Omniversal Curve Mastery — Unlocks All Portal Gate Shapes & Zero-Cooldown Timeline Jumps.',
    ],
  },
  'active-physics-mutation-beams': {
    id: 'active-physics-mutation-beams',
    name: 'Active Gravity, Time & Mutation Beams',
    maxTier: 4,
    accentHex: '#38bdf8',
    primaryResource: 'chrono-paradox-shard',
    secondaryResource: 'portal-fluid-globule',
    tierDescriptions: [
      'Tier 1: Unlocks Left-Hand Void Beam [Key Z] — Anti-Gravity Levitation & Zero-G Anomaly Tractor.',
      'Tier 2: Unlocks Temporal Dilation Beam Mode — Freezes or hyper-accelerates targeted entities in local time.',
      'Tier 3: Unlocks Matter-Mutation Ray Mode — Physically mutates enemies/props into On-A-Cob or Cronenberg forms.',
      'Tier 4: Tri-Beam Singularity Convergence — Fires chained multi-target physics & biological mutation arcs.',
    ],
  },
  'pocket-sanctum-containment': {
    id: 'pocket-sanctum-containment',
    name: 'Pocket-Sanctum Capacity & Void Magnet',
    maxTier: 4,
    accentHex: '#f59e0b',
    primaryResource: 'causal-splice-matrix',
    secondaryResource: 'chrono-paradox-shard',
    tierDescriptions: [
      'Tier 1: Expands In-Between Void Anomaly Magnet Radius to 14m & adds Void Hub Jetpack Thrusters.',
      'Tier 2: Expands Anomaly Magnet Radius to 24m & synthesizes +1 Passive Void Shard every 25s.',
      'Tier 3: Installs Timeline Specimen Containment Pods inside the In-Between Void Hub.',
      'Tier 4: Deep-Void Singularity Reservoir — 38m Magnet Pull & +2x Multiversal Matter Conversion.',
    ],
  },
  'sentient-symbiote-tendrils': {
    id: 'sentient-symbiote-tendrils',
    name: 'Sentient Symbiote & Combat Tendrils',
    maxTier: 4,
    accentHex: '#f43f5e',
    primaryResource: 'symbiote-void-ichor',
    secondaryResource: 'causal-splice-matrix',
    tierDescriptions: [
      'Tier 1: Sprouts 3 Articulated Symbiote Tendrils & an Ocular Iris on the Left-Hand Void Ball.',
      'Tier 2: Autonomous Tendril Whip — Lashes nearby hostiles within 7.5m for visceral knockback.',
      'Tier 3: Symbiote Harvester — Tendrils automatically snatch floating Void Shards & Organ Pickups.',
      'Tier 4: Apex Eldritch Symbiote — 6 Writhing Bio-Tendrils with vampiric kinetic siphon & auto-parry.',
    ],
  },
};

export type AbsurdBiologyArchetype =
  | 'everything-on-a-cob'
  | 'cronenberg-flesh-mutants'
  | 'recursive-fractal-crustaceans'
  | 'sentient-furniture-bipeds'
  | 'screaming-photonic-flora'
  | 'hyper-elastic-gelatinous-amoebas';

export type AbsurdPhysicsTwist =
  | 'reverse-buoyancy-updrafts'
  | 'micro-verse-colossal-scale'
  | 'titan-verse-miniature-diorama'
  | 'hyper-elastic-rubber-ground'
  | 'non-euclidean-coriolis-twist'
  | 'chrono-stutter-hyper-speed';

export type AbsurdSkyPhenomenon =
  | 'screaming-cyber-sun'
  | 'omniscient-eyeball-nebula'
  | 'boiling-portal-fluid-vortex'
  | 'clockwork-citadel-gear-rings'
  | 'fractured-tesseract-mirrors'
  | 'giant-floating-heads-sky';

export type AbsurdCivilizationRelic =
  | 'plumbus-synthesis-mega-vats'
  | 'citadel-bureaucracy-obelisks'
  | 'meeseeks-fulfillment-pylons'
  | 'gazorpazorp-matriarch-totems'
  | 'blips-and-chitz-arcade-spires'
  | 'cronenberg-bio-alembics';

export type AbsurdGlitchModality =
  | 'vhs-chromatic-tracking'
  | 'portal-fluid-acid-rain'
  | 'quantum-scale-oscillation'
  | 'schrodinger-ghost-echoes';

export type TimelineLandformArchetype =
  | 'sky-atoll-archipelago'
  | 'spiral-nautilus-terraces'
  | 'twisted-mobius-canyons'
  | 'hex-basalt-organ-pipes'
  | 'inverted-crater-caldera'
  | 'colossal-ribcage-badlands'
  | 'voronoi-shattered-mesas'
  | 'crystalline-harmonic-dunes';

export type TimelineAtmospherePreset =
  | 'daylight-azure-scatter'
  | 'sunset-amber-crimson'
  | 'bioluminescent-emerald-dusk'
  | 'gas-giant-ringed-teal'
  | 'binary-violet-magenta'
  | 'aurora-prismatic-day';

export type TimelineCreatureAIArchetype =
  | 'swarmer'
  | 'stalker'
  | 'leviathan'
  | 'mimic';

export type TimelineCreatureFactionId =
  | 'apex-chronos-pack'
  | 'parasitic-cob-swarm'
  | 'citadel-synth-drones';

export type TraversalVehicleType =
  | 'twin-turbine-hover-bike'
  | 'hexapod-spider-walker'
  | 'delta-rift-glider'
  | 'aether-rider-5d';

export type BodyModId =
  | 'cyber-wings'
  | 'mantis-blades'
  | 'thruster-legs'
  | 'wall-run-boots';

export interface BodyModSpec {
  id: BodyModId;
  name: string;
  shortName: string;
  slotLabel: string;
  accentHex: string;
  description: string;
  activeAbilitySummary: string;
}

export const BODY_MOD_CATALOG: Record<BodyModId, BodyModSpec> = {
  'cyber-wings': {
    id: 'cyber-wings',
    name: 'Seraphim Articulated Cyber-Wings',
    shortName: 'Cyber-Wings',
    slotLabel: 'Dorsal Flight Rig',
    accentHex: '#38bdf8',
    description:
      'Multi-pinion articulated titanium-plasma wings that unfurl on aerial takeoff, enabling mid-air wing-flaps and low-descent thermal gliding.',
    activeAbilitySummary: 'Hold [Space] in mid-air to Glide & Double-Flap Ascend',
  },
  'mantis-blades': {
    id: 'mantis-blades',
    name: 'Chitin-Plasma Forearm Mantis Blades',
    shortName: 'Mantis Blades',
    slotLabel: 'Forearm Scissor Rig',
    accentHex: '#f43f5e',
    description:
      'Dual hinged forearm scythes that snap forward during melee strikes, adding a rapid dual-handed X-slash flurry and +45% dismemberment cleave.',
    activeAbilitySummary: 'Deploys Dual Forearm Scythes on Melee & [Key J] Flurry',
  },
  'thruster-legs': {
    id: 'thruster-legs',
    name: 'Digitigrade Hydraulic Thruster Greaves',
    shortName: 'Thruster Legs',
    slotLabel: 'Lower-Limb Afterburners',
    accentHex: '#f59e0b',
    description:
      'Reverse-jointed pneumatic leg pistons with heel plasma nozzles that boost sprint velocity (+35%) and launch explosive jump takeoffs.',
    activeAbilitySummary: '+35% Sprint Velocity & Heel-Jet Surge Impulse',
  },
  'wall-run-boots': {
    id: 'wall-run-boots',
    name: 'Magnetic Tether & Cliff Wall-Run Sabatons',
    shortName: 'Wall-Run Boots',
    slotLabel: 'Pedal Gravity Anchors',
    accentHex: '#10b981',
    description:
      'High-flux Lorentz sole clamps that automatically lock onto steep canyon walls for lateral wall-running and zero-G surface walking.',
    activeAbilitySummary: 'Sprint along steep cliffs to Wall-Run + Zero-G Grip',
  },
};

export const TRAVERSAL_VEHICLE_CATALOG: Record<
  TraversalVehicleType,
  {
    id: TraversalVehicleType;
    name: string;
    shortName: string;
    accentHex: string;
    description: string;
    locomotionSignature: string;
  }
> = {
  'twin-turbine-hover-bike': {
    id: 'twin-turbine-hover-bike',
    name: 'Viper-X Twin-Turbine Grav-Bike',
    shortName: 'Hover-Bike',
    accentHex: '#06b6d4',
    description:
      'Low-slung straddle-cockpit speeder bike with articulated front split-vanes, aggressive corner banking, and ground-skimming boost thrusters.',
    locomotionSignature: 'High-Speed Ground Drift & 42° Banking Turns',
  },
  'hexapod-spider-walker': {
    id: 'hexapod-spider-walker',
    name: 'Arachne-VI All-Terrain Spider-Walker',
    shortName: 'Spider-Walker',
    accentHex: '#f59e0b',
    description:
      'Armored 6-legged inverse-kinematic crawler mech that steps over jagged canyons, climbs steep cliffs, and cushions drops with hydraulic legs.',
    locomotionSignature: '6-Legged Tripod Gait & Vertical Cliff Scaling',
  },
  'delta-rift-glider': {
    id: 'delta-rift-glider',
    name: 'Aether-Wing Delta Rift-Glider',
    shortName: 'Rift-Glider',
    accentHex: '#a855f7',
    description:
      'Wide-span swept delta-wing atmospheric glider with articulated aileron feathers, soaring thermal lift, and low-stall dive recovery.',
    locomotionSignature: 'Aerodynamic Thermal Soaring & Ribbon Trails',
  },
  'aether-rider-5d': {
    id: 'aether-rider-5d',
    name: '5D Closed-Loop Aether-Rider Interceptor',
    shortName: '5D Interceptor',
    accentHex: '#38bdf8',
    description:
      'Relativistic toroidal-reactor aerospace craft capable of transitioning from ground-skimmer hover to orbital vacuum flight.',
    locomotionSignature: '6-DOF Closed-Loop Gravity Flight & Cosmic Pulse',
  },
};

export interface AbsurdTimelineSpec {
  coordinateCode: string; // e.g. 'C-137', 'COB-994', 'J19-ZETA-7'
  seedHash: number;
  title: string;
  subtitle: string;
  satiricalLore: string;
  biologyArchetype: AbsurdBiologyArchetype;
  biologyLabel: string;
  physicsTwist: AbsurdPhysicsTwist;
  physicsLabel: string;
  skyPhenomenon: AbsurdSkyPhenomenon;
  skyLabel: string;
  civilizationRelic: AbsurdCivilizationRelic;
  relicLabel: string;
  glitchModality: AbsurdGlitchModality;
  glitchLabel: string;
  // Radically distinct geography & vibrant non-black atmosphere fields
  landformArchetype: TimelineLandformArchetype;
  landformLabel: string;
  atmospherePreset: TimelineAtmospherePreset;
  atmosphereLabel: string;
  skyZenithHex: string;
  skyHorizonHex: string;
  sunDiscHex: string;
  terrainLowHex: string;
  terrainMidHex: string;
  terrainHighHex: string;
  dominantCreatureArchetype: TimelineCreatureAIArchetype;
  proceduralItemsCount: number;
  // Physical & visual multipliers
  propScaleMultiplier: number; // 0.35x (Titan-Verse) to 3.8x (Micro-Verse)
  entityScaleMultiplier: number;
  gravityMultiplier: number; // 0.25x to 2.2x
  groundBounceRestitution: number; // 0.0 to 0.88
  moveSpeedMultiplier: number;
  timeDilationFactor: number;
  skyTintHex: string;
  fogTintHex: string;
  portalFluidPrimaryHex: string;
  portalFluidSecondaryHex: string;
  accentHex: string;
  isSplicedHybrid?: boolean;
  splicedParentCodes?: [string, string];
}

export interface VoidBallEvolutionState {
  activeGateShape: PortalGateShapeId;
  unlockedGateShapes: PortalGateShapeId[];
  activeBeamMode: VoidBallActiveBeamMode;
  branchTiers: Record<VoidBallUpgradeBranchId, number>;
  anomalyInventory: Record<VoidAnomalyResourceId, number>;
  discoveredTimelines: AbsurdTimelineSpec[];
  activeTimeline: AbsurdTimelineSpec;
  pendingDestinationTimeline: AbsurdTimelineSpec;
  isPlayerInsideInBetweenVoid: boolean;
  isInBetweenPortalOpen: boolean;
  inBetweenPortalProgress: number;
}


