import * as THREE from 'three';
import {
  DamageGoreModality,
  DimensionalGoreGenre,
  EntityBlueprint,
  EntityGeneticDNA,
  EvolutionaryLineageRecord,
  FrontierComplexSite,
  WorldCaveNestComplex,
  WorldFertilizedFloraPatch,
  WorldTopologyArchetype,
} from '../types/manifold';

export interface DimensionalGoreGenreSpec {
  id: DimensionalGoreGenre;
  title: string;
  subtitle: string;
  viscosity: number; // 0.05 (watery/buoyant) to 0.95 (molten resin)
  surfaceTension: number; // 0.1 to 1.0 (beading & magnetic spike coalescence)
  buoyancyLift: number; // -1.0 (heavy mercury sink) to +0.85 (anti-gravity abyssal drift)
  shearThickening: number; // 0.0 to 1.0 (crystallizes/shatters on high-impulse impact)
  dropletStretchFactor: number; // Elongation along velocity vector
  primaryLiquidHex: string;
  secondaryClotHex: string;
  emissiveIntensity: number;
  physicsDescription: string;
}

export const DIMENSIONAL_GORE_GENRE_CATALOG: Record<
  DimensionalGoreGenre,
  DimensionalGoreGenreSpec
> = {
  'ferro-mercury-coagulation': {
    id: 'ferro-mercury-coagulation',
    title: 'Ferro-Mercury Magnetic Coagulation',
    subtitle: 'High-Surface-Tension Ferrofluid & Metallic Spike Clots',
    viscosity: 0.42,
    surfaceTension: 0.96,
    buoyancyLift: -0.65,
    shearThickening: 0.35,
    dropletStretchFactor: 2.2,
    primaryLiquidHex: '#e11d48',
    secondaryClotHex: '#94a3b8',
    emissiveIntensity: 0.85,
    physicsDescription:
      'Dense metallic-crimson ferrofluid that arcs under gravity and snaps together via magnetic surface tension into spiked, mirror-like pools on contact.',
  },
  'bioluminescent-abyssal-ichor': {
    id: 'bioluminescent-abyssal-ichor',
    title: 'Bioluminescent Abyssal Ichor',
    subtitle: 'Buoyant Anti-Gravity Hemolymph Ribbons',
    viscosity: 0.18,
    surfaceTension: 0.48,
    buoyancyLift: 0.62,
    shearThickening: 0.12,
    dropletStretchFactor: 3.4,
    primaryLiquidHex: '#06b6d4',
    secondaryClotHex: '#ec4899',
    emissiveIntensity: 1.75,
    physicsDescription:
      'Low-viscosity pelagic hemolymph that unspools into glowing cyan-magenta filaments, drifting upward in buoyant eddies before condensing on surfaces.',
  },
  'vitreous-amber-crystallization': {
    id: 'vitreous-amber-crystallization',
    title: 'Vitreous Amber Shear-Crystallization',
    subtitle: 'Non-Newtonian Resinous Blood & Glass Spall',
    viscosity: 0.84,
    surfaceTension: 0.72,
    buoyancyLift: -0.25,
    shearThickening: 0.94,
    dropletStretchFactor: 1.45,
    primaryLiquidHex: '#f59e0b',
    secondaryClotHex: '#fb7185',
    emissiveIntensity: 1.35,
    physicsDescription:
      'Non-Newtonian resinous plasma: oozes like warm amber under slow laceration, but instantaneously shear-thickens and shatters into razor-sharp glass crystals under high-impulse trauma.',
  },
  'mycelial-spore-hemolymph': {
    id: 'mycelial-spore-hemolymph',
    title: 'Mycelial Spore-Nutrient Hemolymph',
    subtitle: 'Bio-Fertile Arterial Mist & Hyphal Clotting',
    viscosity: 0.56,
    surfaceTension: 0.64,
    buoyancyLift: 0.18,
    shearThickening: 0.28,
    dropletStretchFactor: 2.0,
    primaryLiquidHex: '#f43f5e',
    secondaryClotHex: '#10b981',
    emissiveIntensity: 1.2,
    physicsDescription:
      'Arterial crimson-emerald hemolymph rich in symbiotic spores; ground splatter rapidly cross-links into pulsing fungal capillary mats that fertilize nearby flora.',
  },
  'hyperbolic-void-plasm': {
    id: 'hyperbolic-void-plasm',
    title: 'Hyperbolic Void-Vortex Plasm',
    subtitle: 'Negative-Pressure Orbital Eddies & Chromatic Bleed',
    viscosity: 0.3,
    surfaceTension: 0.88,
    buoyancyLift: 0.38,
    shearThickening: 0.52,
    dropletStretchFactor: 2.85,
    primaryLiquidHex: '#a855f7',
    secondaryClotHex: '#38bdf8',
    emissiveIntensity: 1.9,
    physicsDescription:
      'Higher-dimensional dark-matter fluid that spirals in Lorentz-like orbital eddies around the ruptured organ before collapsing into iridescent rings.',
  },
};

export const ALL_DIMENSIONAL_GORE_GENRES: DimensionalGoreGenre[] = [
  'ferro-mercury-coagulation',
  'bioluminescent-abyssal-ichor',
  'vitreous-amber-crystallization',
  'mycelial-spore-hemolymph',
  'hyperbolic-void-plasm',
];

export function resolveDimensionalGoreGenre(
  archetype: WorldTopologyArchetype,
  overrideGenre?: DimensionalGoreGenre | null
): DimensionalGoreGenreSpec {
  if (overrideGenre && DIMENSIONAL_GORE_GENRE_CATALOG[overrideGenre]) {
    return DIMENSIONAL_GORE_GENRE_CATALOG[overrideGenre];
  }
  switch (archetype) {
    case 'brutalist-pendulum-foundry':
    case 'gyro-lattice-basin':
      return DIMENSIONAL_GORE_GENRE_CATALOG['ferro-mercury-coagulation'];
    case 'biomech-coral-atoll':
      return DIMENSIONAL_GORE_GENRE_CATALOG['bioluminescent-abyssal-ichor'];
    case 'crystalline-hyper-mesa':
      return DIMENSIONAL_GORE_GENRE_CATALOG['vitreous-amber-crystallization'];
    case 'non-euclidean-spires':
      return DIMENSIONAL_GORE_GENRE_CATALOG['mycelial-spore-hemolymph'];
    case 'quantum-basalt-trench':
    default:
      return DIMENSIONAL_GORE_GENRE_CATALOG['hyperbolic-void-plasm'];
  }
}

/**
 * Computes complex multi-modality damage interaction multipliers when a new attack hits
 * an entity that already suffers from an active gore modality.
 */
export function evaluateComplexDamageInteraction(
  previousGore: DamageGoreModality | 'intact-homeostasis',
  incomingGore: DamageGoreModality,
  goreGenre: DimensionalGoreGenreSpec
): {
  synergyLabel: string;
  bleedJetMultiplier: number;
  visceraExposureDelta: number;
  dropletVelocityBoost: number;
} {
  if (previousGore === 'intact-homeostasis') {
    return {
      synergyLabel: `Primary ${incomingGore} Trauma`,
      bleedJetMultiplier: 1.0,
      visceraExposureDelta: 0.18,
      dropletVelocityBoost: 1.0,
    };
  }
  if (
    (previousGore === 'laceration-hemorrhage' &&
      incomingGore === 'hydrostatic-viscera-rupture') ||
    (previousGore === 'hydrostatic-viscera-rupture' &&
      incomingGore === 'laceration-hemorrhage')
  ) {
    return {
      synergyLabel: 'Pressurized Arterial Evisceration Jet (Laceration × Hydrostatic)',
      bleedJetMultiplier: 2.15,
      visceraExposureDelta: 0.36,
      dropletVelocityBoost: 1.65,
    };
  }
  if (
    previousGore === 'calcified-marrow-shatter' &&
    incomingGore === 'corrosive-ichor-dissolution'
  ) {
    return {
      synergyLabel: 'Exothermic Osteo-Dissolution Boil (Marrow Shatter × Corrosive)',
      bleedJetMultiplier: 1.85,
      visceraExposureDelta: 0.42,
      dropletVelocityBoost: 1.35,
    };
  }
  if (incomingGore === 'neural-synapse-hemolysis') {
    return {
      synergyLabel: 'Myoclonic Hemolytic Arc Spasm',
      bleedJetMultiplier: 1.65 + goreGenre.shearThickening * 0.4,
      visceraExposureDelta: 0.25,
      dropletVelocityBoost: 1.5,
    };
  }
  return {
    synergyLabel: `Compound ${previousGore.split('-')[0]}-${incomingGore.split('-')[0]} Rupture`,
    bleedJetMultiplier: 1.45,
    visceraExposureDelta: 0.24,
    dropletVelocityBoost: 1.25,
  };
}

/**
 * Generates initial Genetic DNA for an entity blueprint.
 */
export function synthesizeInitialEntityDNA(
  blueprint: EntityBlueprint,
  worldSeed: number
): EntityGeneticDNA {
  if (blueprint.geneticDNA) {
    return { ...blueprint.geneticDNA };
  }
  const hashNum =
    (worldSeed * 31 + blueprint.name.length * 997 + blueprint.legCount * 131) %
    999999;
  const dnaHash = `DNA-${hashNum.toString(16).toUpperCase().padStart(5, '0')}`;
  const isPredator =
    blueprint.ecologicalRole && blueprint.ecologicalRole !== 'symbiont-grazer';

  return {
    dnaHash,
    generation: 1,
    ancestralBlueprintId: blueprint.id,
    parentName: blueprint.name,
    exploredFrontierComplexId: null,
    torsoScaleMorph: [1.0, 1.0, 1.0],
    limbElongationFactor: 1.0,
    elevationAdaptation: Number(((hashNum % 45) / 100 + 0.2).toFixed(2)),
    husbandryCognitionScore: Number(((hashNum % 50) / 100 + 0.25).toFixed(2)),
    dnaNutritionalValue: Number(
      (isPredator ? 0.42 : 0.52 + ((hashNum % 35) / 100)).toFixed(2)
    ),
    mutationSummary: 'Native Gen-1 Manifold Genome',
  };
}

/**
 * Mutates an entity's Genetic DNA & Blueprint when it explores a Frontier Complex,
 * adapts to a high-elevation cave, or gets selectively bred in a Tech-Species Husbandry Paddock.
 */
export function mutateEntityGenomeAndBlueprint(
  blueprint: EntityBlueprint,
  currentDNA: EntityGeneticDNA,
  worldSeed: number,
  worldName: string,
  trigger: EvolutionaryLineageRecord['evolutionTrigger'],
  frontierComplex?: FrontierComplexSite | null
): {
  mutatedDNA: EntityGeneticDNA;
  mutatedBlueprint: EntityBlueprint;
  lineageRecord: EvolutionaryLineageRecord;
} {
  const nextGen = currentDNA.generation + 1;
  const salt = Math.floor(Math.random() * 89999 + 10000);
  const newHash = `DNA-G${nextGen}-${salt.toString(16).toUpperCase()}`;

  let [sx, sy, sz] = currentDNA.torsoScaleMorph;
  let limbElong = currentDNA.limbElongationFactor;
  let elevAdapt = currentDNA.elevationAdaptation;
  let cognition = currentDNA.husbandryCognitionScore;
  let nutrition = currentDNA.dnaNutritionalValue;
  let mutationSummary = '';

  if (trigger === 'tech-husbandry-domestication') {
    const techBoost = (frontierComplex?.techAdvancementLevel ?? 1.5) * 0.08;
    sx = Number(Math.min(1.55, sx + 0.08 + techBoost * 0.5).toFixed(2));
    sy = Number(Math.min(1.48, sy + 0.06).toFixed(2));
    cognition = Number(Math.min(1.0, cognition + 0.16 + techBoost).toFixed(2));
    nutrition = Number(Math.min(1.0, nutrition + 0.18).toFixed(2));
    mutationSummary = `Tech-Husbandry Selective Differentiation (Tier ${(
      frontierComplex?.techAdvancementLevel ?? 1.5
    ).toFixed(1)}): +Bio-Yield & Neural Cognition`;
  } else if (trigger === 'frontier-biome-migration') {
    limbElong = Number(Math.min(1.45, limbElong + 0.09).toFixed(2));
    sz = Number(Math.min(1.5, sz + 0.1).toFixed(2));
    nutrition = Number(Math.min(1.0, nutrition + 0.12).toFixed(2));
    mutationSummary = `Frontier Biome Morphogenesis at ${
      frontierComplex?.name ?? 'Perimeter Complex'
    }: Elongated Stride & Streamlined Thorax`;
  } else if (trigger === 'elevation-cave-adaptation') {
    elevAdapt = Number(Math.min(1.0, elevAdapt + 0.22).toFixed(2));
    limbElong = Number(Math.min(1.45, limbElong + 0.07).toFixed(2));
    sy = Number(Math.max(0.78, sy - 0.05).toFixed(2));
    mutationSummary =
      'Vertical Elevation & Troglodytic Cave-Nest Adaptation: High-Grip Tendons & Low-Center Torso';
  } else {
    sx = Number(Math.min(1.5, sx + 0.06).toFixed(2));
    sy = Number(Math.min(1.5, sy + 0.07).toFixed(2));
    nutrition = Number(Math.min(1.0, nutrition + 0.15).toFixed(2));
    mutationSummary = `Fertile Sanctuary Differentiation (Gen ${nextGen}): High-Density Visceral Vitality`;
  }

  const mutatedDNA: EntityGeneticDNA = {
    dnaHash: newHash,
    generation: nextGen,
    ancestralBlueprintId: currentDNA.ancestralBlueprintId,
    parentName: blueprint.name,
    exploredFrontierComplexId:
      frontierComplex?.id ?? currentDNA.exploredFrontierComplexId,
    torsoScaleMorph: [sx, sy, sz],
    limbElongationFactor: limbElong,
    elevationAdaptation: elevAdapt,
    husbandryCognitionScore: cognition,
    dnaNutritionalValue: nutrition,
    mutationSummary,
  };

  // Shift hue slightly to visually reflect genetic speciation
  const baseColor = new THREE.Color(blueprint.primaryColor);
  baseColor.offsetHSL(
    trigger === 'tech-husbandry-domestication' ? 0.08 : -0.06,
    0.08,
    0.03
  );
  const newPrimaryHex = `#${baseColor.getHexString()}`;

  const baseNameRoot = blueprint.name.replace(/\s+Gen-\d+.*$/i, '');
  const mutatedName = `${baseNameRoot} Gen-${nextGen}`;

  const mutatedBlueprint: EntityBlueprint = {
    ...blueprint,
    id: `${blueprint.id}-gen${nextGen}-${salt}`,
    name: mutatedName,
    torsoScale: [
      Number((blueprint.torsoScale[0] * sx).toFixed(2)),
      Number((blueprint.torsoScale[1] * sy).toFixed(2)),
      Number((blueprint.torsoScale[2] * sz).toFixed(2)),
    ],
    limbLength: Number(
      Math.min(2.1, blueprint.limbLength * limbElong).toFixed(2)
    ),
    primaryColor: newPrimaryHex,
    geneticDNA: mutatedDNA,
  };

  const lineageRecord: EvolutionaryLineageRecord = {
    id: `lineage-${Date.now()}-${salt}`,
    timestamp: Date.now(),
    worldSeed,
    worldName,
    entityName: mutatedName,
    ancestralName: blueprint.name,
    generation: nextGen,
    dna: mutatedDNA,
    blueprint: mutatedBlueprint,
    evolutionTrigger: trigger,
    loreSummary: `${mutatedName} evolved from ${blueprint.name} via ${mutationSummary}.`,
  };

  return {
    mutatedDNA,
    mutatedBlueprint,
    lineageRecord,
  };
}

/**
 * Procedurally generates a Frontier Biocomplex Nature Sanctuary OR a Technologically Advancing
 * Species Husbandry Paddock at the edge of the map when entities explore outward.
 */
export function generateFrontierComplexAtEdge(
  worldSeed: number,
  index: number,
  angleRad: number,
  terrainHeightFn: (x: number, z: number) => number,
  forceKind?: FrontierComplexSite['kind']
): FrontierComplexSite {
  const dist = 31 + ((worldSeed + index * 17) % 13);
  const x = Number((Math.cos(angleRad) * dist).toFixed(1));
  const z = Number((Math.sin(angleRad) * dist).toFixed(1));
  const y = Number(terrainHeightFn(x, z).toFixed(2));

  const kind: FrontierComplexSite['kind'] =
    forceKind ??
    ((worldSeed + index) % 2 === 0
      ? 'biocomplex-nature-sanctuary'
      : 'tech-species-husbandry-paddock');

  const natureNames = [
    'Symbiotic Spore-Caldera Grove',
    'Bioluminescent Mycelial Oasis',
    'Chiral Nectary Fertility Basin',
    'Abyssal Thermal Vent Sanctuary',
  ];
  const techNames = [
    'Autonomous Neural-Husbandry Paddock',
    'Cyber-Chitin Domestication Spire',
    'Resonant Bio-Yield Harvester Ring',
    'Cognitive Symbiont Ranching Matrix',
  ];

  const nameList =
    kind === 'biocomplex-nature-sanctuary' ? natureNames : techNames;
  const name = `${nameList[(worldSeed + index) % nameList.length]} #${
    (worldSeed + index * 37) % 900 + 100
  }`;

  return {
    id: `frontier-${kind}-${Date.now()}-${index}`,
    name,
    kind,
    x,
    y,
    z,
    radius: 7.5,
    fertilityIndex: Number((0.62 + ((worldSeed + index * 13) % 35) / 100).toFixed(2)),
    techAdvancementLevel: kind === 'tech-species-husbandry-paddock' ? 1.4 : 1.0,
    farmedSpeciesCount: 1,
    residentEntityIds: [],
    isUnderPredatorPackRaid: false,
    packAttackPattern: 'none',
    primaryHex: kind === 'biocomplex-nature-sanctuary' ? '#10b981' : '#38bdf8',
    accentHex: kind === 'biocomplex-nature-sanctuary' ? '#f59e0b' : '#a855f7',
    createdAt: Date.now(),
  };
}

/**
 * Builds the 3D sculptural architecture for a Frontier Biocomplex Nature Sanctuary
 * or a Technologically Advancing Species Husbandry Paddock on the map perimeter.
 */
export function buildFrontierComplexMesh(
  site: FrontierComplexSite
): THREE.Group {
  const group = new THREE.Group();
  group.position.set(site.x, site.y, site.z);
  group.name = `frontier-complex-${site.id}`;

  const primaryMat = new THREE.MeshPhysicalMaterial({
    color: site.primaryHex,
    emissive: site.primaryHex,
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: site.kind === 'tech-species-husbandry-paddock' ? 0.78 : 0.18,
    clearcoat: 0.65,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: site.accentHex,
    emissive: site.accentHex,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.5,
  });

  // Perimeter Boundary Ring
  const ringGeo = new THREE.TorusGeometry(site.radius, 0.14, 10, 48);
  ringGeo.rotateX(Math.PI / 2);
  const ringMesh = new THREE.Mesh(ringGeo, primaryMat);
  ringMesh.position.y = 0.25;
  group.add(ringMesh);

  if (site.kind === 'tech-species-husbandry-paddock') {
    // Technologically Advancing Species Paddock: 6 containment pylons + rotating cognitive harvester halo
    const pylonCount = 6;
    for (let i = 0; i < pylonCount; i++) {
      const a = (i / pylonCount) * Math.PI * 2;
      const px = Math.cos(a) * (site.radius * 0.85);
      const pz = Math.sin(a) * (site.radius * 0.85);
      const pylonGeo = new THREE.CylinderGeometry(0.14, 0.28, 3.2, 8);
      const pylon = new THREE.Mesh(pylonGeo, primaryMat);
      pylon.position.set(px, 1.6, pz);
      group.add(pylon);

      const nodeGeo = new THREE.OctahedronGeometry(0.32, 1);
      const node = new THREE.Mesh(nodeGeo, accentMat);
      node.position.set(px, 3.4, pz);
      group.add(node);
    }

    // Central Smart-Farming Neural Beacon Spire
    const spirePts = [
      new THREE.Vector2(0.02, 0),
      new THREE.Vector2(0.65, 0.4),
      new THREE.Vector2(0.28, 2.2),
      new THREE.Vector2(0.52, 3.8),
      new THREE.Vector2(0.08, 5.2),
    ];
    const spireGeo = new THREE.LatheGeometry(spirePts, 12);
    const spireMesh = new THREE.Mesh(spireGeo, accentMat);
    spireMesh.name = 'tech-husbandry-spire';
    group.add(spireMesh);
  } else {
    // Biocomplex Nature Sanctuary: Organic maternal spore-chalice + 5 curvilinear bio-fronds
    const chalicePts = [
      new THREE.Vector2(0.05, 0),
      new THREE.Vector2(0.95, 0.5),
      new THREE.Vector2(0.45, 1.6),
      new THREE.Vector2(1.25, 2.8),
      new THREE.Vector2(0.85, 3.4),
      new THREE.Vector2(0.1, 3.7),
    ];
    const chaliceGeo = new THREE.LatheGeometry(chalicePts, 14);
    const chaliceMesh = new THREE.Mesh(chaliceGeo, primaryMat);
    group.add(chaliceMesh);

    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const frondCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(Math.cos(a) * 1.2, 0.2, Math.sin(a) * 1.2),
        new THREE.Vector3(Math.cos(a + 0.3) * 3.2, 1.8, Math.sin(a + 0.3) * 3.2),
        new THREE.Vector3(Math.cos(a + 0.6) * 4.6, 3.1, Math.sin(a + 0.6) * 4.6),
      ]);
      const frondGeo = new THREE.TubeGeometry(frondCurve, 12, 0.16, 7, false);
      const frond = new THREE.Mesh(frondGeo, accentMat);
      group.add(frond);
    }
  }

  return group;
}

/**
 * Builds a 3D High-Elevation Excavated Cave & Organic Nest Complex where vertically adapted
 * creatures shelter and incubate their differentiated offspring.
 */
export function buildCaveNestComplexMesh(
  cave: WorldCaveNestComplex
): THREE.Group {
  const group = new THREE.Group();
  const cx = Number.isFinite(cave.x) ? cave.x : 0;
  const cy = Number.isFinite(cave.y) ? cave.y : 0;
  const cz = Number.isFinite(cave.z) ? cave.z : 0;
  const radius = Number.isFinite(cave.caveRadius)
    ? Math.max(0.8, cave.caveRadius)
    : 2.2;
  const eggCount = Number.isFinite(cave.nestEggCount)
    ? Math.max(1, Math.min(12, Math.round(cave.nestEggCount)))
    : 3;
  const accentColor = cave.accentHex || '#38bdf8';

  group.position.set(cx, cy, cz);
  group.name = `cave-nest-${cave.id}`;

  // 1. Sculpted Basalt/Chitin Cave Hood Arch
  const archGeo = new THREE.TorusGeometry(
    radius,
    radius * 0.38,
    12,
    24,
    Math.PI
  );
  const rockMat = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.85,
    metalness: 0.22,
  });
  const archMesh = new THREE.Mesh(archGeo, rockMat);
  archMesh.position.y = 0.2;
  group.add(archMesh);

  // Dark Interior Cave Hollow Dome
  const hollowGeo = new THREE.SphereGeometry(
    radius * 0.92,
    14,
    12,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.55
  );
  const hollowMat = new THREE.MeshBasicMaterial({
    color: '#020617',
    side: THREE.DoubleSide,
  });
  const hollowMesh = new THREE.Mesh(hollowGeo, hollowMat);
  hollowMesh.scale.set(1.0, 0.85, 0.75);
  group.add(hollowMesh);

  // 2. Woven Biocomplex Nest Torus inside the Cave Mouth
  const nestGeo = new THREE.TorusGeometry(radius * 0.52, 0.24, 10, 24);
  nestGeo.rotateX(Math.PI / 2);
  const nestMat = new THREE.MeshStandardMaterial({
    color: '#78350f',
    emissive: accentColor,
    emissiveIntensity: 0.25,
    roughness: 0.75,
  });
  const nestMesh = new THREE.Mesh(nestGeo, nestMat);
  nestMesh.position.set(0, 0.22, 0.35);
  group.add(nestMesh);

  // 3. Bioluminescent Incubating Genetic Eggs inside the Nest
  const eggMat = new THREE.MeshPhysicalMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 0.75,
    roughness: 0.15,
    transmission: 0.45,
    clearcoat: 0.9,
  });

  for (let i = 0; i < eggCount; i++) {
    const a = (i / Math.max(1, eggCount)) * Math.PI * 2;
    const r = radius * 0.24;
    const eggGeo = new THREE.SphereGeometry(0.22, 10, 10);
    eggGeo.scale(0.85, 1.35, 0.85);
    const egg = new THREE.Mesh(eggGeo, eggMat);
    egg.position.set(Math.cos(a) * r, 0.38, 0.35 + Math.sin(a) * r);
    group.add(egg);
  }

  return group;
}

/**
 * Builds a 3D Biocomplex Vegetation Cluster sprouted from creature defecation / nutrient deposition.
 */
export function buildFertilizedFloraPatchMesh(
  patch: WorldFertilizedFloraPatch
): THREE.Group {
  const group = new THREE.Group();
  const px = Number.isFinite(patch.x) ? patch.x : 0;
  const py = Number.isFinite(patch.y) ? patch.y : 0;
  const pz = Number.isFinite(patch.z) ? patch.z : 0;
  const potency = Number.isFinite(patch.nutrientPotency)
    ? Math.max(0.35, patch.nutrientPotency)
    : 1.0;
  const growthStage = Number.isFinite(patch.growthStage)
    ? Math.max(0.25, patch.growthStage)
    : 1.0;
  const stemCount = Number.isFinite(patch.stemCount)
    ? Math.max(1, Math.min(16, Math.round(patch.stemCount)))
    : 6;
  const primaryHex = patch.primaryHex || '#10b981';
  const sporeHex = patch.sporeHex || '#38bdf8';

  group.position.set(px, py, pz);
  group.name = `flora-patch-${patch.id}`;

  // Nutrient Guano-Humus Mound Base
  const moundGeo = new THREE.SphereGeometry(0.65 * potency, 10, 8);
  moundGeo.scale(1.2, 0.32, 1.2);
  const moundMat = new THREE.MeshStandardMaterial({
    color: '#3f2e21',
    roughness: 0.9,
  });
  const mound = new THREE.Mesh(moundGeo, moundMat);
  group.add(mound);

  const stemMat = new THREE.MeshStandardMaterial({
    color: primaryHex,
    emissive: primaryHex,
    emissiveIntensity: 0.3,
    roughness: 0.4,
  });
  const capMat = new THREE.MeshPhysicalMaterial({
    color: sporeHex,
    emissive: sporeHex,
    emissiveIntensity: 0.7,
    roughness: 0.2,
    clearcoat: 0.8,
  });

  for (let i = 0; i < stemCount; i++) {
    const angle = i * 2.39996; // Golden angle phyllotaxis
    const dist = 0.15 + Math.sqrt(i) * 0.28;
    const h = Math.max(0.25, (0.7 + (i % 3) * 0.45) * growthStage);
    const sx = Math.cos(angle) * dist;
    const sz = Math.sin(angle) * dist;

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx, 0.05, sz),
      new THREE.Vector3(sx * 1.25, h * 0.55, sz * 1.25),
      new THREE.Vector3(sx * 1.4, h, sz * 1.4),
    ]);
    const tubeGeo = new THREE.TubeGeometry(curve, 8, 0.06, 6, false);
    const stem = new THREE.Mesh(tubeGeo, stemMat);
    group.add(stem);

    // Bioluminescent Spore Blossom Cap
    const blossomGeo = new THREE.OctahedronGeometry(0.16 * growthStage, 1);
    blossomGeo.scale(1.3, 0.65, 1.3);
    const blossom = new THREE.Mesh(blossomGeo, capMat);
    blossom.position.set(sx * 1.4, h + 0.05, sz * 1.4);
    group.add(blossom);
  }

  return group;
}
