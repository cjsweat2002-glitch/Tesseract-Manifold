import * as THREE from 'three';
import {
  ResourceId,
  StateOfMatter,
  WorldTopologyArchetype,
} from '../types/manifold';

/**
 * Xenochemical Element Definition across the Continuous Dimensional Multiverse.
 */
export interface ProceduralChemicalElement {
  id: string;
  symbol: string;
  name: string;
  dimensionIndex: number;
  branchIteration: number;
  atomicMass: number;
  valenceElectrons: number;
  stateOfMatter: StateOfMatter;
  densityGcm3: number; // 0.12 (aerogel) to 22.8 (void baryon)
  grainSizeMicrons: number; // 0.01 nm to 500 µm
  packingFraction: number; // 0.35 to 0.74 (close packing)
  shearModulusGPa: number; // 0.1 to 190 GPa
  cohesionKPa: number; // 0.5 to 980 kPa
  mohsHardness: number; // 0.5 to 10.0
  frictionCoefficient: number; // 0.12 to 1.18
  restitution: number; // 0.02 to 0.95
  fractureToughnessMpaM: number; // 0.15 (brittle crystal) to 8.5 (ductile alloy)
  primaryColor: string;
  specularSheen: string;
  glowColor: string;
  emissiveIntensity: number;
  miningYieldResId: ResourceId;
  energyConductivity: number; // 0 to 1.0 (5D closed-loop reactor coupling)
  reactionAffinity: string;
  lore: string;
}

export interface SoilPhysicalProperties {
  element: ProceduralChemicalElement;
  bulkDensityGcm3: number;
  porosityFraction: number;
  effectiveHardnessMohs: number;
  shatterFractureThreshold: number; // Force magnitude needed to fracture cleanly vs crumble
  excavationTextureStyle: 'faceted-cleavage' | 'columnar-jointed' | 'granular-regolith' | 'viscous-fluid' | 'porous-aerogel';
  viscousDampingFactor: number;
  reactionPotential: number;
}

export interface CrossDimensionReactionResult {
  elementA: ProceduralChemicalElement;
  elementB: ProceduralChemicalElement;
  affinity: number; // 0 to 1
  enthalpyChangeKJ: number; // Negative = exothermic release, positive = endothermic absorption
  metricAnomalyFactor: number; // Spacetime distortion factor (0 to 1)
  catalyticReactorBoostMW: number; // Power surge delivered to 5D Gravity Vehicle
  transmutationTriggered: boolean;
  transmutedResourceId?: ResourceId;
  shockwaveWaveform: 'shatter-resonance' | 'viscous-surge' | 'quantum-cascade' | 'thermodynamic-flash';
  scientificDescription: string;
}

/**
 * Base Archetype Elemental Roots for Dimensions 1 through 7+
 */
const BASE_ELEMENT_ARCHETYPES: Array<{
  rootSymbol: string;
  rootName: string;
  baseState: StateOfMatter;
  baseHardness: number;
  baseDensity: number;
  baseYield: ResourceId;
  baseColor: string;
  baseSheen: string;
  baseGlow: string;
}> = [
  {
    rootSymbol: 'Ψ-Te',
    rootName: 'Chrono-Telluride',
    baseState: 'solid-crystalline-lattice',
    baseHardness: 8.5,
    baseDensity: 6.25,
    baseYield: 'vitreous-aether',
    baseColor: '#e0f2fe',
    baseSheen: '#38bdf8',
    baseGlow: '#0284c7',
  },
  {
    rootSymbol: 'Φ-Hg',
    rootName: 'Hydrargyrum-Plasm',
    baseState: 'viscous-ferro-superfluid',
    baseHardness: 1.2,
    baseDensity: 13.53,
    baseYield: 'ferro-chitin',
    baseColor: '#94a3b8',
    baseSheen: '#cbd5e1',
    baseGlow: '#64748b',
  },
  {
    rootSymbol: 'Θ-Zeo',
    rootName: 'Aether-Zeolite',
    baseState: 'vesicular-pumice-aerogel',
    baseHardness: 2.8,
    baseDensity: 0.42,
    baseYield: 'biolum-mycelium',
    baseColor: '#fef08a',
    baseSheen: '#ca8a04',
    baseGlow: '#eab308',
  },
  {
    rootSymbol: 'Ω-FeQ',
    rootName: 'Bose-Einstein Fermion',
    baseState: 'quantum-condensate-strata',
    baseHardness: 9.4,
    baseDensity: 8.92,
    baseYield: 'calcified-memory',
    baseColor: '#c084fc',
    baseSheen: '#a855f7',
    baseGlow: '#7e22ce',
  },
  {
    rootSymbol: 'Σ-Bas',
    rootName: 'Heavy Basaltic Regolith',
    baseState: 'hyper-granular-regolith',
    baseHardness: 5.2,
    baseDensity: 3.15,
    baseYield: 'ferro-chitin',
    baseColor: '#ea580c',
    baseSheen: '#f97316',
    baseGlow: '#c2410c',
  },
  {
    rootSymbol: 'Γ-Obs',
    rootName: 'Fulgurite Obsidian',
    baseState: 'vitreous-plasma-glass',
    baseHardness: 7.8,
    baseDensity: 2.74,
    baseYield: 'vitreous-aether',
    baseColor: '#090d16',
    baseSheen: '#f59e0b',
    baseGlow: '#d97706',
  },
  {
    rootSymbol: 'Λ-Drk',
    rootName: 'Singularity Condensate',
    baseState: 'solid-crystalline-lattice',
    baseHardness: 10.0,
    baseDensity: 22.4,
    baseYield: 'void-singularity-dust',
    baseColor: '#1e1b4b',
    baseSheen: '#818cf8',
    baseGlow: '#4f46e5',
  },
];

/**
 * Higher Unbounded Dimension Elemental Roots (D8+)
 */
const UNBOUNDED_HIGH_ELEMENT_ROOTS: Array<{
  rootSymbol: string;
  rootName: string;
  baseState: StateOfMatter;
  baseHardness: number;
  baseDensity: number;
  baseYield: ResourceId;
  baseColor: string;
  baseSheen: string;
  baseGlow: string;
}> = [
  {
    rootSymbol: 'Ξ-Tess',
    rootName: 'Tesseract-Fullerene',
    baseState: 'solid-crystalline-lattice',
    baseHardness: 9.8,
    baseDensity: 14.8,
    baseYield: 'void-singularity-dust',
    baseColor: '#38bdf8',
    baseSheen: '#818cf8',
    baseGlow: '#c084fc',
  },
  {
    rootSymbol: 'Ϙ-Tach',
    rootName: 'Tachyonic Cherenkov Glass',
    baseState: 'vitreous-plasma-glass',
    baseHardness: 8.9,
    baseDensity: 5.12,
    baseYield: 'vitreous-aether',
    baseColor: '#06b6d4',
    baseSheen: '#22d3ee',
    baseGlow: '#0891b2',
  },
  {
    rootSymbol: 'ϖ-Void',
    rootName: 'Graviton Super-Plasm',
    baseState: 'quantum-condensate-strata',
    baseHardness: 10.0,
    baseDensity: 26.5,
    baseYield: 'void-singularity-dust',
    baseColor: '#4338ca',
    baseSheen: '#e0e7ff',
    baseGlow: '#6366f1',
  },
];

/**
 * Dimensional Branching History & Novelty Registry
 * Records every crossed dimension and generates branching revisions when visited again.
 */
class DimensionalBranchingRegistry {
  private visitedDimensionHistory: Map<number, number> = new Map();
  private generatedElementCache: Map<string, ProceduralChemicalElement> = new Map();
  private totalShiftsCount = 0;

  /**
   * Registers a dimension shift. Returns the branch revision index.
   * If this dimension was previously crossed, increments and returns a new branch index!
   */
  public registerDimensionVisit(dimIndex: number): number {
    this.totalShiftsCount++;
    const roundedDim = Math.round(dimIndex * 10) / 10;
    const currentVisits = this.visitedDimensionHistory.get(roundedDim) || 0;
    const newBranch = currentVisits + 1;
    this.visitedDimensionHistory.set(roundedDim, newBranch);
    return newBranch;
  }

  public getBranchIteration(dimIndex: number): number {
    const roundedDim = Math.round(dimIndex * 10) / 10;
    return this.visitedDimensionHistory.get(roundedDim) || 1;
  }

  public getTotalShiftsCount(): number {
    return this.totalShiftsCount;
  }

  public getCachedElement(key: string): ProceduralChemicalElement | undefined {
    return this.generatedElementCache.get(key);
  }

  public setCachedElement(key: string, elem: ProceduralChemicalElement) {
    this.generatedElementCache.set(key, elem);
  }
}

export const DIMENSION_BRANCH_REGISTRY = new DimensionalBranchingRegistry();

/**
 * Procedural Pseudo-random Hash from seed coordinates
 */
function proceduralHash(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

/**
 * Synthesizes a completely original Procedural Periodic Table element
 * based on dimIndex, manifold topology, and branch iteration.
 */
export function generateProceduralElement(
  dimIndex: number,
  topology: WorldTopologyArchetype = 'crystalline-hyper-mesa',
  branchOverride?: number
): ProceduralChemicalElement {
  const branch = branchOverride ?? DIMENSION_BRANCH_REGISTRY.getBranchIteration(dimIndex);
  const cacheKey = `${dimIndex.toFixed(2)}_${topology}_b${branch}`;
  const cached = DIMENSION_BRANCH_REGISTRY.getCachedElement(cacheKey);
  if (cached) return cached;

  const intDim = Math.max(1, Math.floor(dimIndex));
  const fracDim = dimIndex - intDim;
  const hashVal = proceduralHash(dimIndex * 100 + branch * 37 + 13.37);

  // Pick base archetype or unbounded higher dimensional root
  let baseTemplate = BASE_ELEMENT_ARCHETYPES[Math.min(BASE_ELEMENT_ARCHETYPES.length - 1, intDim - 1)];
  if (intDim > 7) {
    const highIdx = (intDim - 8) % UNBOUNDED_HIGH_ELEMENT_ROOTS.length;
    baseTemplate = UNBOUNDED_HIGH_ELEMENT_ROOTS[highIdx];
  }

  // Branch mutation modifiers
  const isBranched = branch > 1;
  const branchSuffix = isBranched ? `-${String.fromCharCode(65 + ((branch - 1) % 26))}${branch > 26 ? Math.floor(branch / 26) : ''}` : '';
  const atomicMass = Number((intDim * 28.4 + fracDim * 34.2 + (branch - 1) * 7.85 + hashVal * 4.2).toFixed(2));
  const valence = Math.floor(1 + ((intDim * 3 + branch) % 8));

  // Topology-driven adjustments
  let state = baseTemplate.baseState;
  let hardness = baseTemplate.baseHardness;
  let density = baseTemplate.baseDensity;
  let yieldRes = baseTemplate.baseYield;

  if (topology === 'crystalline-hyper-mesa') {
    hardness = Math.min(10.0, hardness * 1.08 + 0.4);
    density *= 1.12;
  } else if (topology === 'quantum-basalt-trench') {
    state = 'solid-crystalline-lattice';
    hardness = Math.min(10.0, hardness + 0.8);
    density *= 1.25;
  } else if (topology === 'gyro-lattice-basin') {
    if (intDim === 2 || intDim === 3) state = 'viscous-ferro-superfluid';
    hardness = Math.max(0.8, hardness * 0.88);
  } else if (topology === 'biomech-coral-atoll') {
    state = 'vesicular-pumice-aerogel';
    density = Math.max(0.2, density * 0.45);
    hardness = Math.max(1.0, hardness * 0.65);
    yieldRes = 'biolum-mycelium';
  } else if (topology === 'brutalist-pendulum-foundry') {
    density *= 1.4;
    hardness = Math.min(10.0, hardness * 1.15);
  }

  // Branch anomalies
  if (isBranched) {
    hardness = Number(THREE.MathUtils.clamp(hardness + (hashVal - 0.5) * 1.6, 0.5, 10.0).toFixed(1));
    density = Number(THREE.MathUtils.clamp(density + (hashVal - 0.5) * 2.5, 0.15, 25.0).toFixed(2));
  }

  // Calculate grain size and friction
  let grainMicrons = 100;
  let friction = 0.6;
  let restitution = 0.3;
  let shearModulus = 40; // GPa
  let cohesion = 250; // kPa

  if (state === 'solid-crystalline-lattice') {
    grainMicrons = 380 + Math.floor(hashVal * 120);
    friction = 0.28 + hashVal * 0.12;
    restitution = 0.75 + hashVal * 0.18;
    shearModulus = 75 + hashVal * 40;
    cohesion = 680 + hashVal * 200;
  } else if (state === 'viscous-ferro-superfluid') {
    grainMicrons = 8 + Math.floor(hashVal * 15);
    friction = 0.82 + hashVal * 0.15; // Viscous drag
    restitution = 0.04;
    shearModulus = 0.2;
    cohesion = 80;
  } else if (state === 'vesicular-pumice-aerogel') {
    grainMicrons = 24 + Math.floor(hashVal * 20);
    friction = 1.05 + hashVal * 0.12;
    restitution = 0.28;
    shearModulus = 4.5;
    cohesion = 15;
  } else if (state === 'quantum-condensate-strata') {
    grainMicrons = 0.2 + hashVal * 0.8;
    friction = 0.38;
    restitution = 0.02; // Dead quantum impact absorption
    shearModulus = 120 + hashVal * 50;
    cohesion = 920;
  } else if (state === 'vitreous-plasma-glass') {
    grainMicrons = 6 + Math.floor(hashVal * 10);
    friction = 0.34;
    restitution = 0.65;
    shearModulus = 65;
    cohesion = 520;
  } else {
    // hyper-granular-regolith
    grainMicrons = 160 + Math.floor(hashVal * 90);
    friction = 0.64;
    restitution = 0.22;
    shearModulus = 25;
    cohesion = 95;
  }

  // Color blending across dimensions with branch variation
  const baseCol = new THREE.Color(baseTemplate.baseColor);
  if (isBranched) {
    const shiftHue = ((branch * 0.19) % 1.0);
    baseCol.offsetHSL(shiftHue * 0.35 - 0.17, 0.1, (hashVal - 0.5) * 0.15);
  }
  const hexCol = '#' + baseCol.getHexString();

  const element: ProceduralChemicalElement = {
    id: `elem-d${dimIndex.toFixed(1)}-b${branch}`,
    symbol: `${baseTemplate.rootSymbol}${branchSuffix}`,
    name: `${baseTemplate.rootName}${branchSuffix}${intDim > 7 ? ' Hyper-Strata' : ''}`,
    dimensionIndex: dimIndex,
    branchIteration: branch,
    atomicMass,
    valenceElectrons: valence,
    stateOfMatter: state,
    densityGcm3: density,
    grainSizeMicrons: grainMicrons,
    packingFraction: state === 'viscous-ferro-superfluid' ? 0.72 : (state === 'vesicular-pumice-aerogel' ? 0.36 : 0.64),
    shearModulusGPa: shearModulus,
    cohesionKPa: cohesion,
    mohsHardness: hardness,
    frictionCoefficient: Number(friction.toFixed(2)),
    restitution: Number(restitution.toFixed(2)),
    fractureToughnessMpaM: Number((hardness * 0.65 + (state === 'solid-crystalline-lattice' ? 0.8 : 0.1)).toFixed(2)),
    primaryColor: hexCol,
    specularSheen: baseTemplate.baseSheen,
    glowColor: baseTemplate.baseGlow,
    emissiveIntensity: intDim >= 4 ? 0.75 : 0.35,
    miningYieldResId: yieldRes,
    energyConductivity: Number(Math.min(1.0, 0.5 + intDim * 0.08 + (branch - 1) * 0.05).toFixed(2)),
    reactionAffinity: `Valence-${valence} ${topology.replace(/-/g, ' ')} Resonator`,
    lore: `Synthesized at Dimension ${dimIndex.toFixed(2)} (Branch ${branch}) within ${topology}. Exhibits ${state.replace(/-/g, ' ')} cohesion with Mohs hardness ${hardness}.`,
  };

  DIMENSION_BRANCH_REGISTRY.setCachedElement(cacheKey, element);
  return element;
}

/**
 * Computes authoritative soil physical properties for terrain excavation.
 */
export function getSoilPropertiesForDimension(
  dimIndex: number,
  topology: WorldTopologyArchetype = 'crystalline-hyper-mesa'
): SoilPhysicalProperties {
  const element = generateProceduralElement(dimIndex, topology);

  let textureStyle: SoilPhysicalProperties['excavationTextureStyle'] = 'granular-regolith';
  if (element.stateOfMatter === 'solid-crystalline-lattice') {
    textureStyle = element.mohsHardness >= 8.0 ? 'faceted-cleavage' : 'columnar-jointed';
  } else if (element.stateOfMatter === 'viscous-ferro-superfluid') {
    textureStyle = 'viscous-fluid';
  } else if (element.stateOfMatter === 'vesicular-pumice-aerogel') {
    textureStyle = 'porous-aerogel';
  } else if (element.stateOfMatter === 'vitreous-plasma-glass') {
    textureStyle = 'faceted-cleavage';
  }

  const shatterThreshold = element.mohsHardness * 0.85;
  const porosity = 1.0 - element.packingFraction;

  return {
    element,
    bulkDensityGcm3: element.densityGcm3 * element.packingFraction,
    porosityFraction: porosity,
    effectiveHardnessMohs: element.mohsHardness,
    shatterFractureThreshold: shatterThreshold,
    excavationTextureStyle: textureStyle,
    viscousDampingFactor: element.stateOfMatter === 'viscous-ferro-superfluid' ? 0.88 : (element.stateOfMatter === 'vesicular-pumice-aerogel' ? 0.65 : 0.15),
    reactionPotential: element.energyConductivity,
  };
}

/**
 * Inter-Dimensional Interaction Matrix:
 * Computes reaction thermodynamics, catalytic metric anomalies, and transmutation
 * when materials from dimension A unfold or react with dimension B.
 */
export function calculateCrossDimensionInteraction(
  elemA: ProceduralChemicalElement,
  elemB: ProceduralChemicalElement
): CrossDimensionReactionResult {
  const deltaDim = Math.abs(elemA.dimensionIndex - elemB.dimensionIndex);
  const deltaHardness = Math.abs(elemA.mohsHardness - elemB.mohsHardness);
  const valenceDiff = Math.abs(elemA.valenceElectrons - elemB.valenceElectrons);

  // Valence affinity: Complementary valences (sum to 8) yield maximum affinity
  const valenceSum = elemA.valenceElectrons + elemB.valenceElectrons;
  const isComplementary = valenceSum === 8 || valenceSum === 4 || valenceSum === 12;
  const baseAffinity = isComplementary ? 0.85 : Math.max(0.15, 1.0 - (valenceDiff / 8));
  const affinity = Number(Math.min(1.0, baseAffinity + (deltaDim * 0.08)).toFixed(2));

  // Enthalpy change (exothermic if high affinity and high deltaDim)
  const enthalpyChange = Number((-450 * affinity + deltaHardness * 42).toFixed(1));

  // Metric anomaly factor (warps local gravitational metric)
  const metricAnomaly = Number(Math.min(1.0, (deltaDim / 6.0) * 0.7 + (elemA.energyConductivity * elemB.energyConductivity) * 0.35).toFixed(2));

  // Catalytic boost for 5D Gravity Vehicle closed-loop reactor (up to 120 MW surge)
  const reactorBoost = Number((metricAnomaly * 110 + affinity * 35).toFixed(1));

  // Transmutation trigger (spontaneous xenolith vein synthesis)
  const transmutationTriggered = affinity > 0.65 && deltaDim >= 1.5;
  let transmutedRes: ResourceId | undefined;
  if (transmutationTriggered) {
    if (deltaDim >= 3.0 || elemA.mohsHardness >= 9.0) {
      transmutedRes = 'void-singularity-dust';
    } else if (elemA.stateOfMatter === 'solid-crystalline-lattice') {
      transmutedRes = 'vitreous-aether';
    } else {
      transmutedRes = 'calcified-memory';
    }
  }

  // Determine shockwave waveform based on states of matter
  let waveform: CrossDimensionReactionResult['shockwaveWaveform'] = 'thermodynamic-flash';
  if (elemA.mohsHardness >= 7.0 || elemB.mohsHardness >= 7.0) {
    waveform = 'shatter-resonance';
  } else if (elemA.stateOfMatter === 'viscous-ferro-superfluid' || elemB.stateOfMatter === 'viscous-ferro-superfluid') {
    waveform = 'viscous-surge';
  } else if (metricAnomaly > 0.6) {
    waveform = 'quantum-cascade';
  }

  const description = `Cross-unfolding of ${elemA.symbol} (D${elemA.dimensionIndex.toFixed(1)}) and ${elemB.symbol} (D${elemB.dimensionIndex.toFixed(1)}): ${
    enthalpyChange < 0 ? 'Exothermic metric release' : 'Endothermic metric absorption'
  } (${Math.abs(enthalpyChange)} kJ/mol), inducing ${Math.round(metricAnomaly * 100)}% spacetime distortion. Delivered +${reactorBoost} MW zero-point reactor surge.${
    transmutationTriggered ? ` Catalyzed spontaneous transmutation into ${transmutedRes}!` : ''
  }`;

  return {
    elementA: elemA,
    elementB: elemB,
    affinity,
    enthalpyChangeKJ: enthalpyChange,
    metricAnomalyFactor: metricAnomaly,
    catalyticReactorBoostMW: reactorBoost,
    transmutationTriggered,
    transmutedResourceId: transmutedRes,
    shockwaveWaveform: waveform,
    scientificDescription: description,
  };
}
