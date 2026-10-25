import * as THREE from 'three';
import {
  BuildingPresetBlueprint,
  CraftingRecipe,
  ManifoldWorldSpec,
  PlacedWorldBuilding,
  ResourceId,
} from '../types/manifold';
import { evaluateTerrainHeight } from './manifoldGenerator';
import {
  buildMasterArchitecturalModuleMesh,
  buildRelationalArchitecturalJoinery,
  createHansmeyerSubdividedColumnGeometry,
} from './architecturalWisdomEngine';
import {
  buildNaumGaboStringedConstructGroup,
  createDifferentialGrowthRibbonGeometry,
  createHyperbolicPseudosphereGeometry,
  createImplicitMetaballPiercedGeometry,
  createTPMSGyroidShellGeometry,
} from './dimensionalBleedAndAnomalyEngine';

export type BimStructuralLayerId =
  | 'all-assembled'
  | 'exploded-bim'
  | '1-foundation-pilings'
  | '2-diagrid-frame'
  | '3-vascular-mep-core'
  | '4-kinetic-envelope'
  | '5-zenith-crown';

export interface StructuralEngineeringTelemetry {
  isInsideVoidBall: boolean;
  voidBallDistance: number;
  focusedVoidStation:
    | 'none'
    | 'bim-structural-table'
    | 'recipe-synthesis-crucible'
    | 'dermal-lexicon-holoprojector'
    | 'dimensional-stargate-ring';
  focusedStationTitle: string;
  focusedStationActionHint: string;
  activeBimLayer: BimStructuralLayerId;
  activeRecipeIndex: number;
  soilBearingKPa: number;
  terrainSlopeDeg: number;
  windShearLoadKN: number;
  structuralIntegrityPct: number;
  constructionStageLabel: string;
}

export interface WalkInVoidSanctuaryRig {
  root: THREE.Group;
  portalCenter: THREE.Vector3;
  outerInviteShell: THREE.Mesh;
  thresholdRings: THREE.Mesh[];
  interiorFloorGrid: THREE.Group;
  bimTableGroup: THREE.Group;
  bimExplodedLayers: THREE.Group[];
  recipeCrucibleGroup: THREE.Group;
  recipeOrbitalMeshes: THREE.Mesh[];
  dermalHoloGroup: THREE.Group;
  stargateRingGroup: THREE.Group;
  buildSpaceGhostGroup: THREE.Group;
  loadVectorArrows: THREE.Group;
  laserScanPlane: THREE.Mesh;
  activeBimLayer: BimStructuralLayerId;
  activeRecipeIndex: number;
  interiorBlend: number; // 0 = outside, 1 = walked inside Void Ball
}

export const BIM_LAYER_SEQUENCE: {
  id: BimStructuralLayerId;
  label: string;
  engineeringRole: string;
}[] = [
  {
    id: 'all-assembled',
    label: 'Complete 5-System BIM Assembly',
    engineeringRole:
      'Integrated Substructure, Diagrid Frame, Vascular MEP Core, Kinetic Envelope & Zenith Array.',
  },
  {
    id: 'exploded-bim',
    label: 'Exploded 3D Workforce Training View',
    engineeringRole:
      'Vertically separates all 5 structural & MEP systems with live load-path force vectors.',
  },
  {
    id: '1-foundation-pilings',
    label: 'CSI Div 03 · Geodesic Foundation & Pilings',
    engineeringRole:
      'Deep bedrock anchor caissons and seismic grade-beams that transfer dead/live loads into the terrain.',
  },
  {
    id: '2-diagrid-frame',
    label: 'CSI Div 05 · Primary Diagrid Structural Frame',
    engineeringRole:
      'Triangulated tension-compression columns and Moment-Resisting space trusses resisting 5D wind shear.',
  },
  {
    id: '3-vascular-mep-core',
    label: 'CSI Div 22/26 · Vascular MEP & Conduit Core',
    engineeringRole:
      'Pressurized arterial fluid risers, piezoelectric busbars, and atmospheric scent-exchange plenums.',
  },
  {
    id: '4-kinetic-envelope',
    label: 'CSI Div 08 · Actuated Curtain-Wall Envelope',
    engineeringRole:
      'Weather-responsive louver facade and acoustic shear-damping cladding.',
  },
  {
    id: '5-zenith-crown',
    label: 'CSI Div 13 · Zenith Harmonic Crown',
    engineeringRole:
      '5D caustic collector spire and planetary mycelial network transponder.',
  },
];

/**
 * Builds a realistic, multi-layered 5-System Structural Engineering & Architectural BIM Mesh
 * (Foundation Caissons -> Diagrid Steel/Chitin Frame -> Vascular MEP Core -> Kinetic Louvers -> Zenith Crown)
 * so buildings look like sophisticated, engineered architectural structures rather than toy blocks.
 */
export function buildEngineeredArchitectureMesh(
  preset: BuildingPresetBlueprint | PlacedWorldBuilding,
  accentHex: string,
  layerFilter: BimStructuralLayerId = 'all-assembled',
  isHologramGhost: boolean = false,
  animTime: number = 0
): THREE.Group {
  const root = new THREE.Group();
  const isExploded = layerFilter === 'exploded-bim';

  const frameMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(isHologramGhost ? '#38bdf8' : '#1e293b'),
    emissive: new THREE.Color(isHologramGhost ? '#0284c7' : '#0f172a'),
    emissiveIntensity: isHologramGhost ? 0.65 : 0.15,
    metalness: 0.82,
    roughness: 0.22,
    clearcoat: 0.7,
    transparent: isHologramGhost,
    opacity: isHologramGhost ? 0.62 : 1.0,
    wireframe: false,
  });

  const foundationMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(isHologramGhost ? '#f59e0b' : '#334155'),
    emissive: new THREE.Color(isHologramGhost ? '#d97706' : '#000000'),
    emissiveIntensity: isHologramGhost ? 0.45 : 0,
    metalness: 0.55,
    roughness: 0.55,
    transparent: isHologramGhost,
    opacity: isHologramGhost ? 0.65 : 1.0,
  });

  const mepVascularMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(accentHex),
    emissive: new THREE.Color(accentHex),
    emissiveIntensity: isHologramGhost ? 1.1 : 0.78,
    metalness: 0.4,
    roughness: 0.15,
    clearcoat: 0.9,
    transparent: true,
    opacity: isHologramGhost ? 0.8 : 0.92,
  });

  const envelopeGlassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(isHologramGhost ? '#a5f3fc' : '#64748b'),
    emissive: new THREE.Color(accentHex),
    emissiveIntensity: isHologramGhost ? 0.35 : 0.12,
    metalness: 0.25,
    roughness: 0.12,
    clearcoat: 1.0,
    iridescence: 0.65,
    transparent: true,
    opacity: isHologramGhost ? 0.38 : 0.68,
  });

  // 1. LAYER 1: RELATIONAL TECTONIC JOINERY & FLYING BUTTRESS GRAPH (Replaces literal floor pilings)
  if (
    layerFilter === 'all-assembled' ||
    layerFilter === 'exploded-bim' ||
    layerFilter === '1-foundation-pilings'
  ) {
    const fGroup = buildRelationalArchitecturalJoinery(
      preset.blocks,
      1.15,
      frameMat,
      mepVascularMat
    );
    fGroup.name = 'layer-1-foundation';
    root.add(fGroup);
  }

  // 2. LAYER 2: PRIMARY HANSMEYER SUBDIVIDED DIAGRID COLONNADE (CSI Div 05)
  if (
    layerFilter === 'all-assembled' ||
    layerFilter === 'exploded-bim' ||
    layerFilter === '2-diagrid-frame'
  ) {
    const sGroup = new THREE.Group();
    sGroup.name = 'layer-2-diagrid';
    if (isExploded) sGroup.position.y = 1.6;

    const frameHeight = 5.0;
    const radius = 2.65;
    const colGeo = createHansmeyerSubdividedColumnGeometry(0.18, frameHeight, 6);
    for (let c = 0; c < 6; c++) {
      const ang = (c / 6) * Math.PI * 2;
      const col = new THREE.Mesh(colGeo, frameMat);
      col.position.set(
        Math.cos(ang) * radius,
        0.45 + frameHeight * 0.5,
        Math.sin(ang) * radius
      );
      col.rotation.z = Math.cos(ang) * 0.1;
      col.rotation.x = -Math.sin(ang) * 0.1;
      sGroup.add(col);
    }
    root.add(sGroup);
  }

    // 3. LAYER 3: VASCULAR MEP & CONDUIT CORE (CSI Div 22/26)
  if (
    layerFilter === 'all-assembled' ||
    layerFilter === 'exploded-bim' ||
    layerFilter === '3-vascular-mep-core'
  ) {
    const mGroup = new THREE.Group();
    mGroup.name = 'layer-3-mep';
    if (isExploded) mGroup.position.y = 3.2;

    // Central Schoen TPMS Gyroid Arterial Riser Core (replaces CylinderGeometry pipe)
    const corePipe = new THREE.Mesh(
      createTPMSGyroidShellGeometry(0.68, 5.2, 18, 12, 3.2, 0.34),
      mepVascularMat
    );
    corePipe.position.y = 3.2;
    mGroup.add(corePipe);

    // 2 Differential Growth Vascular Heat-Exchanger Ribbons (replaces TorusGeometry)
    for (let r = 0; r < 2; r++) {
      const plenum = new THREE.Mesh(
        createDifferentialGrowthRibbonGeometry(1.05 - r * 0.18, 0.35, 9 + r * 2, 0.32),
        mepVascularMat
      );
      plenum.position.y = 2.0 + r * 2.1;
      mGroup.add(plenum);
    }
    root.add(mGroup);
  }

  // 4. LAYER 4: KINETIC LOUVER CURTAIN-WALL ENVELOPE (CSI Div 08)
  if (
    layerFilter === 'all-assembled' ||
    layerFilter === 'exploded-bim' ||
    layerFilter === '4-kinetic-envelope'
  ) {
    const eGroup = new THREE.Group();
    eGroup.name = 'layer-4-envelope';
    if (isExploded) eGroup.position.y = 4.8;

    // 12 Sculpted Hyperbolic Cambered Curtain-Wall Louver Blades (replaces BoxGeometry)
    const bladeGeo = createHyperbolicPseudosphereGeometry(0.42, 4.4, 8, 8, 1.15);
    bladeGeo.scale(0.18, 1.0, 1.1);
    for (let f = 0; f < 12; f++) {
      const ang = (f / 12) * Math.PI * 2;
      const louverAngle = Math.sin(animTime * 1.5 + f * 0.5) * 0.25;
      const panel = new THREE.Mesh(bladeGeo, envelopeGlassMat);
      panel.position.set(
        Math.cos(ang) * 2.85,
        3.0,
        Math.sin(ang) * 2.85
      );
      panel.rotation.y = -ang + louverAngle;
      eGroup.add(panel);
    }

    // Custom Preset Modules rendered using high-value Master Architectural Sub-Assemblies
    const unit = 1.15;
    for (const b of preset.blocks) {
      const modMesh = buildMasterArchitecturalModuleMesh(b, unit * 0.72);
      modMesh.position.set(
        b.gx * unit,
        b.gy * unit + unit * 0.5,
        b.gz * unit
      );
      eGroup.add(modMesh);
    }
    root.add(eGroup);
  }

  // 5. LAYER 5: ZENITH HARMONIC CROWN & TELEMETRY ARRAY (CSI Div 13)
  if (
    layerFilter === 'all-assembled' ||
    layerFilter === 'exploded-bim' ||
    layerFilter === '5-zenith-crown'
  ) {
    const zGroup = new THREE.Group();
    zGroup.name = 'layer-5-zenith';
    if (isExploded) zGroup.position.y = 6.6;

    const domeCrown = new THREE.Mesh(
      createHyperbolicPseudosphereGeometry(2.55, 1.9, 16, 10, 1.6),
      frameMat
    );
    domeCrown.position.y = 6.2;
    zGroup.add(domeCrown);

    const spireBeacon = new THREE.Mesh(
      createTPMSGyroidShellGeometry(0.52, 0.95, 14, 10, 3.4, 0.35),
      mepVascularMat
    );
    spireBeacon.position.y = 7.6;
    spireBeacon.userData.isKineticRotor = true;
    zGroup.add(spireBeacon);

    const collectorRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.45, 0.06, 8, 24),
      mepVascularMat
    );
    collectorRing.rotation.x = Math.PI * 0.35;
    collectorRing.position.y = 7.6;
    collectorRing.userData.isKineticRotor = true;
    zGroup.add(collectorRing);

    root.add(zGroup);
  }

  if (!isHologramGhost) {
    root.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }

  return root;
}

/**
 * Builds the Inviting Walk-In 3D Void Ball Sanctuary & Spatial Holographic BIM Workshop
 * directly inside the 3D world!
 * Players can literally walk inside the glowing Void Sphere to inspect 3D exploded building
 * makeups, develop recipes at the 3D Crucible, and project full-scale holograms into build space.
 */
export function buildWalkInVoidSanctuaryRig(
  world: ManifoldWorldSpec,
  initialCenter: THREE.Vector3,
  activePreset: BuildingPresetBlueprint
): WalkInVoidSanctuaryRig {
  const root = new THREE.Group();
  const voidHex = world.playableCharacter.voidOrbColor;
  const accentHex = world.palette.accentColor;

  // 1. Inviting Outer Walk-In Schoen TPMS Gyroid Sanctuary Envelope & Differential Growth Threshold Ribbons
  const shellGeo = createTPMSGyroidShellGeometry(7.2, 9.6, 26, 18, 2.8, 0.28);
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#090d16'),
    emissive: new THREE.Color(voidHex),
    emissiveIntensity: 0.28,
    roughness: 0.1,
    metalness: 0.2,
    clearcoat: 1.0,
    iridescence: 0.85,
    transparent: true,
    opacity: 0.26,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const outerInviteShell = new THREE.Mesh(shellGeo, shellMat);
  outerInviteShell.position.y = 3.2;
  root.add(outerInviteShell);

  const thresholdRings: THREE.Mesh[] = [];
  const ringMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#fde68a'),
    emissive: new THREE.Color(voidHex),
    emissiveIntensity: 1.15,
    roughness: 0.2,
    metalness: 0.8,
  });

  for (let r = 0; r < 3; r++) {
    const ring = new THREE.Mesh(
      createDifferentialGrowthRibbonGeometry(6.8 - r * 0.45, 0.32, 9 + r * 2, 0.35),
      ringMat
    );
    ring.position.y = 3.2;
    ring.rotation.x = r * 0.55;
    root.add(ring);
    thresholdRings.push(ring);
  }

  // 2. Interior Sanctuary Container (No flat floor wireframe disc!)
  const interiorFloorGrid = new THREE.Group();
  root.add(interiorFloorGrid);

  // 3. STATION NORTH (Z = -4.2): 3D Holographic BIM Structural Makeup & Exploded Assembly Table
  const bimTableGroup = new THREE.Group();
  bimTableGroup.position.set(0, 0.1, -4.2);

  const tablePedestal = new THREE.Mesh(
    createHyperbolicPseudosphereGeometry(1.65, 0.85, 16, 10, 1.15),
    new THREE.MeshStandardMaterial({
      color: '#0f172a',
      metalness: 0.85,
      roughness: 0.2,
    })
  );
  tablePedestal.position.y = 0.42;
  bimTableGroup.add(tablePedestal);

  const holoEmitterRing = new THREE.Mesh(
    createDifferentialGrowthRibbonGeometry(1.45, 0.18, 9, 0.25),
    ringMat
  );
  holoEmitterRing.position.y = 0.88;
  bimTableGroup.add(holoEmitterRing);

  // Miniature 3D Exploded BIM Model floating above the North Hologram Table
  const miniBimModel = buildEngineeredArchitectureMesh(
    activePreset,
    accentHex,
    'exploded-bim',
    true,
    0
  );
  miniBimModel.scale.setScalar(0.32);
  miniBimModel.position.y = 1.05;
  bimTableGroup.add(miniBimModel);
  root.add(bimTableGroup);

  // 4. STATION EAST (X = +4.2): 3D Recipe & Material Synthesis Crucible
  const recipeCrucibleGroup = new THREE.Group();
  recipeCrucibleGroup.position.set(4.2, 0.1, 0);

  const crucibleBase = new THREE.Mesh(
    createHyperbolicPseudosphereGeometry(1.3, 0.9, 14, 10, -1.15),
    new THREE.MeshStandardMaterial({
      color: '#0f172a',
      metalness: 0.85,
      roughness: 0.22,
    })
  );
  crucibleBase.position.y = 0.45;
  recipeCrucibleGroup.add(crucibleBase);

  const recipeOrbitalMeshes: THREE.Mesh[] = [];
  const orbColors = ['#f59e0b', '#10b981', '#38bdf8', '#a855f7', '#f43f5e'];
  for (let o = 0; o < 5; o++) {
    const orb = new THREE.Mesh(
      createImplicitMetaballPiercedGeometry(0.18, 0.42, world.seed + o * 37, 0.5),
      new THREE.MeshStandardMaterial({
        color: orbColors[o],
        emissive: orbColors[o],
        emissiveIntensity: 0.95,
        metalness: 0.5,
        roughness: 0.15,
      })
    );
    recipeCrucibleGroup.add(orb);
    recipeOrbitalMeshes.push(orb);
  }

  // Central synthesized product hologram floating in the Crucible (Schoen TPMS Gyroid Shell)
  const productHolo = new THREE.Mesh(
    createTPMSGyroidShellGeometry(0.42, 0.72, 16, 12, 3.2, 0.35),
    new THREE.MeshPhysicalMaterial({
      color: '#fde68a',
      emissive: accentHex,
      emissiveIntensity: 0.85,
      wireframe: false,
      roughness: 0.15,
      metalness: 0.5,
    })
  );
  productHolo.position.y = 1.85;
  recipeCrucibleGroup.add(productHolo);
  root.add(recipeCrucibleGroup);

  // 5. STATION WEST (X = -4.2): 3D Dermal Calligraphic Topology & Anatomical Holoprojector
  const dermalHoloGroup = new THREE.Group();
  dermalHoloGroup.position.set(-4.2, 0.1, 0);

  const dermalPedestal = new THREE.Mesh(
    createHyperbolicPseudosphereGeometry(1.3, 0.9, 14, 10, 1.25),
    new THREE.MeshStandardMaterial({
      color: '#0f172a',
      metalness: 0.85,
      roughness: 0.22,
    })
  );
  dermalPedestal.position.y = 0.45;
  dermalHoloGroup.add(dermalPedestal);

  // Sculpted Biomorphic Pierced Anatomy + Naum Gabo Stringed Construct (replaces raw SphereGeometry nodes!)
  const helixDouble = new THREE.Group();
  helixDouble.position.y = 1.9;
  const piercedTorsoHolo = new THREE.Mesh(
    createImplicitMetaballPiercedGeometry(0.58, 0.46, world.seed + 911, 0.56),
    ringMat
  );
  helixDouble.add(piercedTorsoHolo);
  const gaboConstruct = buildNaumGaboStringedConstructGroup(
    0.48,
    0.72,
    '#38bdf8',
    '#e879f9',
    14
  );
  gaboConstruct.position.y = 0.35;
  helixDouble.add(gaboConstruct);
  dermalHoloGroup.add(helixDouble);
  dermalHoloGroup.userData.helixDouble = helixDouble;
  root.add(dermalHoloGroup);

  // 6. STATION SOUTH (Z = +4.2): Dimensional Stargate Portal Ring
  const stargateRingGroup = new THREE.Group();
  stargateRingGroup.position.set(0, 2.2, 4.2);
  const stargateTorus = new THREE.Mesh(
    createDifferentialGrowthRibbonGeometry(1.65, 0.28, 11, 0.3),
    ringMat
  );
  stargateTorus.rotation.x = Math.PI * 0.5;
  stargateRingGroup.add(stargateTorus);
  const stargateHorizon = new THREE.Mesh(
    new THREE.CircleGeometry(1.58, 24),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(accentHex),
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
    })
  );
  stargateRingGroup.add(stargateHorizon);
  root.add(stargateRingGroup);

  // 7. Full-Scale Build-Space 3D Hologram Ghost (Projected outside onto the terrain where player builds)
  const buildSpaceGhostGroup = new THREE.Group();
  const initialGhostMesh = buildEngineeredArchitectureMesh(
    activePreset,
    accentHex,
    'all-assembled',
    true,
    0
  );
  buildSpaceGhostGroup.add(initialGhostMesh);

  // Animated 3D Structural Load-Path Force Vector Spindles on the Build-Space Hologram
  const loadVectorArrows = new THREE.Group();
  const arrowMat = new THREE.MeshBasicMaterial({
    color: '#fbbf24',
    transparent: true,
    opacity: 0.85,
  });
  for (let a = 0; a < 6; a++) {
    const ang = (a / 6) * Math.PI * 2;
    const arrowCone = new THREE.Mesh(
      createHyperbolicPseudosphereGeometry(0.16, 0.52, 8, 6, 1.2),
      arrowMat
    );
    arrowCone.rotation.x = Math.PI; // Pointing downward along gravity load path into foundation
    arrowCone.position.set(Math.cos(ang) * 2.8, 3.0, Math.sin(ang) * 2.8);
    loadVectorArrows.add(arrowCone);
  }
  buildSpaceGhostGroup.add(loadVectorArrows);

  // Hidden placeholder for laserScanPlane so no flat ring sits on the floor
  const laserScanPlane = new THREE.Mesh(
    new THREE.BufferGeometry(),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  laserScanPlane.visible = false;

  root.position.copy(initialCenter);

  return {
    root,
    portalCenter: initialCenter.clone(),
    outerInviteShell,
    thresholdRings,
    interiorFloorGrid,
    bimTableGroup,
    bimExplodedLayers: [],
    recipeCrucibleGroup,
    recipeOrbitalMeshes,
    dermalHoloGroup,
    stargateRingGroup,
    buildSpaceGhostGroup,
    loadVectorArrows,
    laserScanPlane,
    activeBimLayer: 'all-assembled',
    activeRecipeIndex: 0,
    interiorBlend: 0,
  };
}

/**
 * Updates the Walk-In 3D Void Ball Sanctuary, its 4 interactive 3D Holographic Workstations,
 * and the Full-Scale Build-Space BIM Hologram projected into the terrain.
 */
export function updateWalkInVoidAndBuildHologram(
  rig: WalkInVoidSanctuaryRig,
  world: ManifoldWorldSpec,
  playerPos: THREE.Vector3,
  playerYaw: number,
  playerPitch: number,
  activeTool: string,
  windSpeed: number,
  excavations: { x: number; z: number; radius: number; depth: number }[],
  recipes: CraftingRecipe[],
  nowSec: number,
  dt: number
): StructuralEngineeringTelemetry {
  // 1. Keep Walk-In Void Sanctuary grounded smoothly on the terrain
  const portalGroundY = evaluateTerrainHeight(
    rig.portalCenter.x,
    rig.portalCenter.z,
    world,
    excavations
  );
  rig.portalCenter.y = portalGroundY;
  rig.root.position.copy(rig.portalCenter);

  // 2. Check if player has physically walked inside the Void Ball Sanctuary (radius 7.2m)
  const horizDist = Math.hypot(
    playerPos.x - rig.portalCenter.x,
    playerPos.z - rig.portalCenter.z
  );
  const isInsideVoidBall = horizDist < 6.8;
  const targetBlend = isInsideVoidBall ? 1.0 : 0.0;
  rig.interiorBlend += (targetBlend - rig.interiorBlend) * Math.min(1, dt * 5);

  // Smooth proximity scale: sleek 2.4m inviting orb from afar, expanding smoothly to full 7.2m dome as you walk near
  const proximityFactor = Math.max(
    0,
    Math.min(1, (11.5 - horizDist) / 5.0)
  );
  const domeScale = 0.34 + 0.66 * proximityFactor;
  rig.outerInviteShell.scale.setScalar(domeScale);
  rig.outerInviteShell.position.y = 1.6 + 1.6 * proximityFactor;

  // Animate inviting threshold rings & shell
  for (let i = 0; i < rig.thresholdRings.length; i++) {
    const r = rig.thresholdRings[i];
    r.scale.setScalar(domeScale);
    r.position.y = rig.outerInviteShell.position.y;
    r.rotation.y = nowSec * (0.35 + i * 0.18) * (i % 2 === 0 ? 1 : -1);
    r.rotation.z = Math.sin(nowSec * 0.5 + i) * 0.25;
  }
  const shellMat = rig.outerInviteShell.material as THREE.MeshPhysicalMaterial;
  shellMat.opacity = 0.11 + rig.interiorBlend * 0.18 + Math.sin(nowSec * 2.0) * 0.02;

  // Smoothly reveal the 4 interior 3D Holographic Workstations as the player steps inside the Void Sphere
  const stationScale = Math.max(0.001, rig.interiorBlend);
  const showStations = rig.interiorBlend > 0.03;
  rig.interiorFloorGrid.visible = showStations;
  rig.bimTableGroup.visible = showStations;
  rig.recipeCrucibleGroup.visible = showStations;
  rig.dermalHoloGroup.visible = showStations;
  rig.stargateRingGroup.visible = showStations;

  if (showStations) {
    rig.bimTableGroup.scale.setScalar(stationScale);
    rig.recipeCrucibleGroup.scale.setScalar(stationScale);
    rig.dermalHoloGroup.scale.setScalar(stationScale);
    rig.stargateRingGroup.scale.setScalar(stationScale);
  }

  // Animate 3D Workstations inside the Void Sanctuary
  rig.bimTableGroup.children.forEach((child) => {
    if (child instanceof THREE.Group) {
      child.rotation.y = nowSec * 0.45;
    }
  });

  // Animate Recipe Crucible 3D Orbitals
  rig.recipeOrbitalMeshes.forEach((orb, idx) => {
    const ang = nowSec * 1.6 + (idx / rig.recipeOrbitalMeshes.length) * Math.PI * 2;
    const rad = 0.85 + Math.sin(nowSec * 2.4 + idx) * 0.15;
    orb.position.set(
      Math.cos(ang) * rad,
      1.55 + Math.sin(nowSec * 3.0 + idx) * 0.22,
      Math.sin(ang) * rad
    );
    orb.rotation.x += dt * 2.5;
    orb.rotation.y += dt * 3.0;
  });

  const helix = rig.dermalHoloGroup.userData.helixDouble as THREE.Group | undefined;
  if (helix) {
    helix.rotation.y = nowSec * 1.1;
  }
  rig.stargateRingGroup.rotation.z = nowSec * 0.6;

  // 3. Determine which 3D Holographic Workstation the player is facing or standing near inside the Void Ball
  let focusedVoidStation: StructuralEngineeringTelemetry['focusedVoidStation'] =
    'none';
  let focusedStationTitle = 'Walk-In Void Ball Sanctuary';
  let focusedStationActionHint =
    'Walk into the glowing Void Sphere (or press V to summon it here) to enter the 3D Holographic Workshop';

  if (isInsideVoidBall) {
    const lookDir = new THREE.Vector3(
      -Math.sin(playerYaw) * Math.cos(playerPitch),
      0,
      -Math.cos(playerYaw) * Math.cos(playerPitch)
    ).normalize();

    const stations: {
      id: StructuralEngineeringTelemetry['focusedVoidStation'];
      offset: THREE.Vector3;
      title: string;
      hint: string;
    }[] = [
      {
        id: 'bim-structural-table',
        offset: new THREE.Vector3(0, 0, -4.2),
        title: `North Station · 3D BIM Structural Table (${
          BIM_LAYER_SEQUENCE.find((b) => b.id === rig.activeBimLayer)?.label ??
          'All Layers'
        })`,
        hint: 'Click or Press F/B to cycle 3D Exploded Structural Makeup Layers (Foundation → Diagrid → Vascular MEP → Envelope)',
      },
      {
        id: 'recipe-synthesis-crucible',
        offset: new THREE.Vector3(4.2, 0, 0),
        title: `East Station · 3D Recipe Crucible (${
          recipes[rig.activeRecipeIndex % Math.max(1, recipes.length)]?.name ??
          'Catalyst'
        })`,
        hint: 'Click or Press E to synthesize active 3D Recipe · Press R to cycle Recipe Hologram',
      },
      {
        id: 'dermal-lexicon-holoprojector',
        offset: new THREE.Vector3(-4.2, 0, 0),
        title: 'West Station · 3D Dermal Strain & Lexicon Holoprojector',
        hint: 'Click or Press T to toggle Live 3D Epidermal Tension/Compression Strain Heatmap',
      },
      {
        id: 'dimensional-stargate-ring',
        offset: new THREE.Vector3(0, 0, 4.2),
        title: 'South Station · Dimensional Epoch Stargate Ring',
        hint: 'Click or Walk through the Stargate Ring to shift into a new 4D Manifold World',
      },
    ];

    let bestScore = -999;
    for (const st of stations) {
      const worldStPos = rig.portalCenter.clone().add(st.offset);
      const toSt = new THREE.Vector3(
        worldStPos.x - playerPos.x,
        0,
        worldStPos.z - playerPos.z
      );
      const dist = toSt.length();
      const align = dist > 0.01 ? lookDir.dot(toSt.clone().normalize()) : 1;
      const score = align * 2.0 - dist * 0.22;
      if (score > bestScore) {
        bestScore = score;
        focusedVoidStation = st.id;
        focusedStationTitle = st.title;
        focusedStationActionHint = st.hint;
      }
    }
  }

  // 4. Position & Evaluate Full-Scale Build-Space 3D BIM Hologram ahead of the player
  const forwardDist = 9.5;
  const targetBuildX = playerPos.x - Math.sin(playerYaw) * forwardDist;
  const targetBuildZ = playerPos.z - Math.cos(playerYaw) * forwardDist;
  const centerGroundY = evaluateTerrainHeight(
    targetBuildX,
    targetBuildZ,
    world,
    excavations
  );

  // Sample terrain gradient for real-world structural engineering slope & soil bearing intuition
  const hEast = evaluateTerrainHeight(
    targetBuildX + 2.5,
    targetBuildZ,
    world,
    excavations
  );
  const hNorth = evaluateTerrainHeight(
    targetBuildX,
    targetBuildZ - 2.5,
    world,
    excavations
  );
  const slopeGrad = Math.hypot(
    (hEast - centerGroundY) / 2.5,
    (hNorth - centerGroundY) / 2.5
  );
  const terrainSlopeDeg = Number(
    ((Math.atan(slopeGrad) * 180) / Math.PI).toFixed(1)
  );

  // Excavating/leveling bedrock increases soil bearing capacity!
  const isExcavatedBedrock = excavations.some(
    (ex) => Math.hypot(ex.x - targetBuildX, ex.z - targetBuildZ) < ex.radius + 3.0
  );
  const soilBearingKPa = Math.round(
    (isExcavatedBedrock ? 480 : 310) - Math.min(180, terrainSlopeDeg * 4.5)
  );
  const windShearLoadKN = Number((windSpeed * 8.4).toFixed(1));
  const structuralIntegrityPct = Math.round(
    THREE.MathUtils.clamp(
      (soilBearingKPa / 420) * 85 +
        (isExcavatedBedrock ? 15 : 5) -
        windShearLoadKN * 0.08,
      42,
      100
    )
  );

  // Show full-scale Build-Space 3D Hologram only when player is actively in Construct ('place-building') mode
  const showBuildGhost = activeTool === 'place-building';
  rig.buildSpaceGhostGroup.visible = showBuildGhost;

  if (showBuildGhost) {
    rig.buildSpaceGhostGroup.position.set(
      targetBuildX,
      centerGroundY,
      targetBuildZ
    );
    rig.buildSpaceGhostGroup.rotation.y = playerYaw;

    // Sweep Laser Sintering Scan Plane up and down
    const scanY = ((nowSec * 1.8) % 1) * 7.2;
    rig.laserScanPlane.position.y = scanY;

    // Animate downward Structural Load-Path Arrows
    rig.loadVectorArrows.children.forEach((arrow, idx) => {
      arrow.position.y = 5.5 - (((nowSec * 2.2 + idx * 0.3) % 1) * 4.8);
    });
  }

  const activeLayerMeta =
    BIM_LAYER_SEQUENCE.find((b) => b.id === rig.activeBimLayer) ??
    BIM_LAYER_SEQUENCE[0];

  return {
    isInsideVoidBall,
    voidBallDistance: Number(horizDist.toFixed(1)),
    focusedVoidStation,
    focusedStationTitle,
    focusedStationActionHint,
    activeBimLayer: rig.activeBimLayer,
    activeRecipeIndex: rig.activeRecipeIndex,
    soilBearingKPa,
    terrainSlopeDeg,
    windShearLoadKN,
    structuralIntegrityPct,
    constructionStageLabel: activeLayerMeta.label,
  };
}
