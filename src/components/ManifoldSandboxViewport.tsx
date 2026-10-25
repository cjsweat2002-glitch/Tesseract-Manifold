import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {
  BehaviorEvaluationOutput,
  BiomeWeatherTelemetry,
  BuildingPresetBlueprint,
  CameraPerspective,
  ConceptualNoveltySeedId,
  CraftingRecipe,
  DamageGoreModality,
  DimensionalGoreGenre,
  EntityBlueprint,
  EntityManifoldSnapshot,
  EntityRuntimeTelemetry,
  EvolutionaryLineageRecord,
  FavoritedManifoldAnchor,
  ForeroomsDispositionLocus,
  FrontierComplexSite,
  GameOptionsConfig,
  ManifoldWorldSpec,
  PlacedWorldBuilding,
  PlayerInteractionTool,
  PlayerSomaticGraftTelemetry,
  ProceduralTerrainSectorSpec,
  ResourceId,
  SpatialVoidAndBimTelemetry,
  TerrainExcavationSpot,
  WorldCaveNestComplex,
  WorldFertilizedFloraPatch,
  WorldspaceProceduralArtform,
  GravityVehicleState,
} from '../types/manifold';
import {
  CelestialCosmologyRig,
  resolveCosmologyForDimension,
} from '../utils/celestialCosmologyEngine';
import {
  GravityVehicle5DRig,
  FlightInputState,
} from '../utils/gravityVehicle5DEngine';
import {
  DimensionalSoilParticleRig,
  applyDimensionalGroundOverhaul,
  resolveChemicalElementForDimension,
} from '../utils/interdimensionalChemicalEngine';
import {
  DIMENSION_BRANCH_REGISTRY,
  getSoilPropertiesForDimension,
  calculateCrossDimensionInteraction,
} from '../utils/interdimensionalChemistry';
import {
  ExcavationShatterShaderRig,
} from '../utils/excavationShatterShaderRig';
import {
  buildCaveNestComplexMesh,
  buildFertilizedFloraPatchMesh,
  buildFrontierComplexMesh,
  generateFrontierComplexAtEdge,
  mutateEntityGenomeAndBlueprint,
} from '../utils/evolutionaryEcologyEngine';
import {
  buildPhysicalVisceralOrganPickup,
  buildProceduralSectorCompleteRig,
  PhysicalVisceralOrganPickup,
  SECTOR_CHUNK_SIZE,
  synthesizeProceduralTerrainSector,
  synthesizeSectorNativeEntityBlueprint,
} from '../utils/blenderProceduralWorldEngine';
import {
  bakeActiveTerrainHeightGrid,
  buildLeftHandVoidBallRig,
  buildPlacedBuildingMesh,
  buildPlayableCharacterMesh,
  buildRightHandToolRig,
  buildWorldPropMesh,
  CRAFTING_RECIPES,
  createSeededRandom,
  evaluateTerrainHeight,
  evaluateUnifiedAuthoritativeFloorY,
  getActiveSuperflatMode,
  resolveWorldWeather,
  RESOURCE_CATALOG,
  setActiveDimensionIndex,
  setActiveHyperbolicCurvature,
  setActivePortalRoomFloorEvaluator,
  setActiveProceduralSectorsForTerrain,
  setActiveSuperflatMode,
  setActiveTimelineLandform,
} from '../utils/manifoldGenerator';
import {
  applyDimensionalLightingAndAtmosphere,
  AtmosphericSunShaftRig,
  bakeVertexAmbientOcclusionAndLightmap,
  buildDimensionalPlaceArchitecture,
  createPhotorealisticTerrainMaterial,
  MicroGroundCoverRig,
  PhotorealisticPostProcessingPipeline,
  resolveDimensionalLightingSpec,
  setupPhotorealisticRendererAndPipeline,
  terrainPhaseUniforms,
} from '../utils/engineImmersionPipeline';
import { ArticulatedRagdollEntity } from '../utils/ragdollPhysics';
import {
  build5DCloudCanopy,
  buildBiomeWeatherTelemetry,
  buildScentBreezeRibbons,
  buildWeatherParticleField,
  Cloud5DCanopyRig,
  evaluateBiomeWeatherField,
  ScentBreezeRig,
  update5DCloudCanopy,
  updateScentBreezeRibbons,
  updateWeatherParticleField,
  WeatherParticleRig,
} from '../utils/weather5DSystem';
import {
  buildInterconnectednessWebRig,
  InterconnectednessWebRig,
  updateInterconnectednessWeb,
  weaveHarmonicTetherWithEntity,
} from '../utils/interconnectednessSystem';
import {
  resolveCharacterSkinTopology,
  updateSkinTopologyAndDeformation,
} from '../utils/skinTopologyEngine';
import {
  BIM_LAYER_SEQUENCE,
  buildEngineeredArchitectureMesh,
  buildWalkInVoidSanctuaryRig,
  updateWalkInVoidAndBuildHologram,
  WalkInVoidSanctuaryRig,
} from '../utils/spatialVoidHologramSystem';
import {
  buildForeroomsTesseractRig,
  ForeroomsTesseractRig,
  updateForeroomsTesseractRig,
} from '../utils/foreroomsEngine';
import {
  buildConceptualNoveltyBoundaryRig,
  ConceptualNoveltyBoundaryRig,
  updateConceptualNoveltyEngine,
} from '../utils/conceptualNoveltyEngine';
import {
  buildWorldspaceBleedAndAnomalyRig,
  updateWorldspaceBleedAndAnomalies,
  WorldspaceBleedRig,
} from '../utils/dimensionalBleedAndAnomalyEngine';
import { harmonicSoundscape } from '../utils/harmonicSoundscapeEngine';
import {
  AutonomousDenizenSimState,
  BASE_DIMENSIONAL_ELEMENTS,
  BaseDimensionalElementId,
  buildCulturalSettlement3DRig,
  createAutonomousDenizenSimState,
  CulturalSettlement3DRig,
  DEFAULT_VOIDWALKER_CUSTOMIZATION,
  DimensionalPerkNode,
  EmergentCulturalQuestline,
  EpistemologicalPerceptionStage,
  generateEmergentCulturalQuestline,
  updateCulturalSettlementAndSimsAI,
  VOID_SEED_ORIGINS,
  VoidBallActivationMode,
  VoidwalkerCustomizationConfig,
} from '../utils/multiversalEmergenceAndCultureEngine';
import {
  buildVisceralCombatAndGrabRig,
  grabOrDropWorldObject,
  infuseObjectWithBaseElement,
  spawnAcousticStealthWave,
  spawnArterialGoreAndDismemberment,
  throwHeldWorldObject,
  updateVisceralCombatAndGrabRig,
  VisceralCombatAndGrabRig,
} from '../utils/visceralCombatAndGrabEngine';
import {
  buildGranularDirtExcavationRig,
  buildInEngine3DCharacterStageRig,
  CharacterStudioPoseId,
  GranularDirtExcavationRig,
  InEngine3DCharacterStageRig,
  triggerGranularDirtExcavationBurst,
  updateGranularDirtExcavationRig,
  updateVoidwalker3DAnimationAndStage,
} from '../utils/granularDirtAndInEngineCharacterRig';
import { VoidwalkerOriginAndCutsceneModal } from './VoidwalkerOriginAndCutsceneModal';
import { DimensionalDevianceHudAndModals } from './DimensionalDevianceHudAndModals';
import {
  AbsurdTimelineSpec,
  ALL_DIFFERENTIAL_BOUNDARY_IDS,
  ALL_PORTAL_GATE_SHAPE_IDS,
  BiodepthUiAndGraphicsConfig,
  DEFAULT_BIODEPTH_UI_GRAPHICS_CONFIG,
  DIFFERENTIAL_UNIVERSE_BOUNDARIES,
  DifferentialUniverseBoundaryId,
  DimensionalCrucibleItemRecipe,
  MULTIVERSAL_MATTER_CATALOG,
  MultiversalMatterId,
  PlacedPortalRoomModule,
  PORTAL_GATE_SHAPE_CATALOG,
  PORTAL_ROOM_MODULE_BLUEPRINTS,
  PORTAL_ROOM_TIERS,
  PortalGateShapeId,
  PortalRoomGravityMode,
  PortalRoomModuleKind,
  PortalRoomRuntimeTelemetry,
  PortalRoomTierId,
  TraversalVehicleType,
  BodyModId,
  TRAVERSAL_VEHICLE_CATALOG,
  BODY_MOD_CATALOG,
  VOID_ANOMALY_RESOURCE_CATALOG,
  VOID_BALL_UPGRADE_BRANCHES,
  VoidAnomalyResourceId,
  VoidBallActiveBeamMode,
  VoidBallEvolutionState,
  VoidBallUpgradeBranchId,
  MAZE_ENTITY_THEME_CATALOG,
  MAZE_TECH_EQUIPMENT_CATALOG,
} from '../types/portalAndBiodepth';
import {
  MAZE_DIMENSION_ORIGIN,
  MAZE_HALF_EXTENT,
  synthesizeCityShadowLabyrinthMaze,
} from '../utils/proceduralMazeDimensionEngine';
import {
  buildExteriorMultiversalMatterNodes,
  buildPlacedPortalRoomModuleMesh,
  buildRealityTearPortalAndSquareRoomRig,
  DEFAULT_PORTAL_ROOM_STARTER_MODULES,
  evaluatePortalRoomInteriorGroundAndGravity,
  PORTAL_ROOM_ORIGIN,
  RealityTearPortalAndSquareRoomRig,
  updateRealityTearPortalAndSquareRoom,
} from '../utils/realityTearAndPortalRoomEngine';
import { BiodepthCrucibleAndPortalRoomModal } from './BiodepthMenuArt';
import {
  BETHESDA_SCALE_COMPENDIUM_CATALOG,
  CompendiumLoadoutAndMuseumState,
  CompositeWeaponSubType,
  createInitialCompendiumLoadoutState,
  DimensionalItemDefinition,
  forgeBoundaryAffixedItem,
  resolveCompendiumItemById,
} from '../utils/bethesdaScaleCompendiumEngine';
import {
  ActiveWeaponCombatState,
  DimensionalGroundingWorldRig,
  FirstPersonActionSpringRig,
  FocusedGroundingObjectTelemetry,
  isMagazineFedRangedWeapon,
  isTwoHandedWeapon,
  PortalRoomMuseumGalleryRig,
} from '../utils/compositeModelAndGroundingEngine';
import {
  BethesdaCompendiumAndLoadoutModal,
  DimensionalGroundingAndLoadoutHUD,
} from './BethesdaCompendiumAndLoadoutModal';
import {
  AbsurdTimelineWorldDecoratorRig,
  createInitialVoidBallEvolutionState,
  generateRandomAbsurdCoordinate,
  IN_BETWEEN_VOID_ORIGIN,
  InBetweenTimelineVoidRig,
  SentientVoidBallSymbioteRig,
  synthesizeInfiniteTimelineFromCoordinate,
  synthesizeProceduralTimelineItems,
} from '../utils/infiniteTimelineAndVoidEngine';
import {
  InfiniteTimelineAndVoidBallModal,
  InfiniteTimelineCompactHUD,
} from './InfiniteTimelineAndVoidBallModal';
import {
  AnimatedBodyModificationsRig,
  TimelineCreatureFactionAIDirector,
} from '../utils/grappleBodyModsAndCreatureAIEngine';
import {
  GrappleHookController,
  GrappleSurfaceRangeTelemetry,
} from '../utils/grappleHookController';
import { WeaponHandAnimationController } from '../utils/weaponHandAnimationController';
import { proceduralEnvironmentEngine } from '../utils/proceduralEnvironmentEngine';
import {
  AdaptiveDRSAndLODController,
  InstancedWorldScatterRig,
  sharedGeometryPool,
  spatialCollisionSolver,
} from '../utils/graphicsMeshAndCollisionEngine';
import {
  AutonomicArchitectureSnapshot,
  autonomicEquationEngine,
  AutonomicSelfTuningParameters,
  GameplayDiscoveryTriggerKind,
  NonlinearOperatorId,
} from '../utils/autonomicArchitectureAndEquationEngine';
import {
  AutonomicEquationCodexAndTelemetryModal,
  AutonomicHudCompactBadge,
} from './AutonomicEquationCodexAndTelemetryModal';
import { VoidBallDialAndMindspaceHUD } from './VoidBallDialAndMindspaceHUD';
import {
  applyCarvedRelicSurfaceToGroup,
  buildMindspaceCustomization3DRig,
  createInitialVoidBallWeaponPullState,
  DEFAULT_MINDSPACE_AND_VOID_DIAL_CONFIG,
  DynamicQuickKeyBinding,
  MindspaceAndVoidDialConfig,
  MindspaceCustomization3DRig,
  PLAYER_MORPH_MODE_CATALOG,
  PlayerMorphModeId,
  resolveDynamicQuickKeyBindings,
  stepRightHandPullFromVoidBallAnimation,
  syncCharacterMorphAndHumanAppearance,
  updateMindspaceCustomizationCameraAndFigures,
  VoidBallWeaponPullAnimationState,
} from '../utils/carvedMaterialAndMindspaceEngine';

interface ProjectileInstance {
  mesh: THREE.Object3D;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  age: number;
  maxAge?: number;
  weaponSubType?: CompositeWeaponSubType;
  elementId?: BaseDimensionalElementId;
  damageScale?: number;
  carveCraterRadius?: number;
  isSpentCasing?: boolean;
}

// Pre-allocated zero-GC scratch vectors for the requestAnimationFrame render loop
const _rafForwardFlat = new THREE.Vector3();
const _rafRightFlat = new THREE.Vector3();
const _rafWishDir = new THREE.Vector3();
const _rafHoldDir = new THREE.Vector3();
const _rafEyePos = new THREE.Vector3();
const _rafLookDir = new THREE.Vector3();
const _rafTargetHandPos = new THREE.Vector3();
const _rafToHand = new THREE.Vector3();
const _rafBlastVec = new THREE.Vector3();

interface ResourceShardParticle {
  mesh: THREE.Mesh;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  age: number;
  resourceId: ResourceId;
}

interface ShockwaveRingInstance {
  mesh: THREE.Mesh;
  age: number;
  maxAge: number;
}

interface TemporalEntityPose {
  id: string;
  headingAngle: number;
  gaitCycle: number;
  currentStiffness: number;
  activeBehaviorLabel: string;
  particlePositions: [number, number, number][];
}

interface TemporalLoopFrame {
  timeSec: number;
  wCoord: number;
  entities: TemporalEntityPose[];
}

interface ManifoldSandboxViewportProps {
  world: ManifoldWorldSpec;
  cameraMode: CameraPerspective;
  gameOptions: GameOptionsConfig;
  pointerLockRequestCount: number;
  isOverlayOpen: boolean;
  activeTool: PlayerInteractionTool;
  activeBuildingPreset: BuildingPresetBlueprint;
  excavations: TerrainExcavationSpot[];
  placedBuildings: PlacedWorldBuilding[];
  onMineTerrainAt: (spot: TerrainExcavationSpot, harvested: ResourceId[]) => void;
  onPlaceBuildingAt: (building: PlacedWorldBuilding) => void;
  voidBallOpen: boolean;
  biologicalJumpBoost: number;
  behaviorOutput: BehaviorEvaluationOutput;
  wCoord: number;
  globalRagdollActive: boolean;
  temporalLoopActive: boolean;
  onSyncTemporalLoopState: (
    loopProgress: number,
    loopedWCoord?: number
  ) => void;
  spawnQueue: { blueprint: EntityBlueprint; count: number }[];
  onConsumeSpawnQueue: () => void;
  impulseTargetEntityId: string | null;
  onClearImpulseTarget: () => void;
  selectedEntityId: string | null;
  snapshotRequestEntityId: string | null;
  onCompleteSnapshotCapture: (snapshot: EntityManifoldSnapshot | null) => void;
  shockwaveTriggerCount: number;
  repopulateTriggerCount: number;
  strainHeatmapEnabled?: boolean;
  summonVoidBallCount?: number;
  foreroomsDispositionOverride?: ForeroomsDispositionLocus | null;
  favoritedManifolds?: FavoritedManifoldAnchor[];
  epochCount?: number;
  novelEventsCount?: number;
  worldArtforms?: WorldspaceProceduralArtform[];
  activeNoveltySeedId?: ConceptualNoveltySeedId;
  goreGenreOverride?: DimensionalGoreGenre | null;
  frontierComplexes?: FrontierComplexSite[];
  caveNestComplexes?: WorldCaveNestComplex[];
  fertilizedFloraPatches?: WorldFertilizedFloraPatch[];
  evolutionSpeedMultiplier?: number;
  onDiscoverFrontierComplex?: (site: FrontierComplexSite) => void;
  onSpawnCaveNestComplex?: (cave: WorldCaveNestComplex) => void;
  onSpawnFertilizedFloraPatch?: (patch: WorldFertilizedFloraPatch) => void;
  onLogEvolutionaryLineage?: (
    record: EvolutionaryLineageRecord,
    complexId?: string
  ) => void;
  onCraftRecipeFromVoidStation?: (recipe: CraftingRecipe) => void;
  onShiftDimensionFromVoidStation?: () => void;
  onToggleStrainHeatmapFromVoidStation?: () => void;
  onUpdateTelemetry: (
    entities: EntityRuntimeTelemetry[],
    explorerPos: [number, number, number],
    explorerSpeed: number,
    weatherTelemetry?: BiomeWeatherTelemetry
  ) => void;
  onImpactSpike: (magnitude: number) => void;
  dimIndex?: number;
  onChangeDimension?: (newDim: number) => void;
  onUpdateVehicleTelemetry?: (vehicleState: GravityVehicleState) => void;
  inventory?: Record<ResourceId, number>;
  biodepthConfig?: BiodepthUiAndGraphicsConfig;
  onUpdateBiodepthConfig?: (updated: BiodepthUiAndGraphicsConfig) => void;
  onSetCameraMode?: (mode: CameraPerspective) => void;
  onCycleCameraPerspective?: () => void;
  onCycleFreeLookMode?: () => void;
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
  onSelectTool?: (tool: PlayerInteractionTool) => void;
  openMindspaceTriggerCount?: number;
  openVoidDialTriggerCount?: number;
  superflatMode?: boolean;
}

/**
 * Builds the 3D Superflat Proving Ground Testing Stage at Y = 0.0m:
 * - Weathered bronze concentric rangefinder rings (8m, 16m, 26m, 38m) centered at (0, 0, 0)
 * - 4 Carved Basalt & Bronze Ballistic/Melee Target Dummies with glowing runic bullseyes in front of spawn
 * - High-Elevation Carved Obsidian & Bronze Grapple/Parkour Calibration Gantry at (-12m, 0, -2m)
 */
function buildSuperflatProvingGround3DStage(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'SuperflatProvingGroundStage';

  const bronzeMat = new THREE.MeshStandardMaterial({
    color: '#c89d54',
    roughness: 0.32,
    metalness: 0.82,
    emissive: '#78531a',
    emissiveIntensity: 0.18,
  });
  const basaltMat = new THREE.MeshStandardMaterial({
    color: '#1c1815',
    roughness: 0.72,
    metalness: 0.22,
  });
  const runeGlowMat = new THREE.MeshBasicMaterial({
    color: '#f59e0b',
  });
  const cyanBullseyeMat = new THREE.MeshBasicMaterial({
    color: '#38bdf8',
  });

  // 1. Concentric Rangefinder Rings on the Y = 0.0m Floor
  const radii = [8, 16, 26, 38];
  for (const r of radii) {
    const ringGeo = new THREE.RingGeometry(r - 0.08, r + 0.08, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, bronzeMat);
    ringMesh.position.set(0, 0.02, 0);
    group.add(ringMesh);
  }

  // Player Spawn Pad Ring at (0, 0, 14)
  const spawnRingGeo = new THREE.RingGeometry(2.1, 2.35, 48);
  spawnRingGeo.rotateX(-Math.PI / 2);
  const spawnRing = new THREE.Mesh(spawnRingGeo, cyanBullseyeMat);
  spawnRing.position.set(0, 0.025, 14);
  group.add(spawnRing);

  // 2. 4 Carved Stone & Bronze Ballistic/Melee Target Dummies (Flanking the Entity Testing Lineup)
  const dummyCoords: [number, number][] = [
    [-9.5, 5.0],
    [-6.5, -1.5],
    [6.5, -1.5],
    [9.5, 5.0],
  ];
  for (let i = 0; i < dummyCoords.length; i++) {
    const [dx, dz] = dummyCoords[i];
    const dummy = new THREE.Group();
    dummy.position.set(dx, 0, dz);
    dummy.lookAt(0, 0, 14);

    // Base Pedestal
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.8, 0.35, 12),
      basaltMat
    );
    base.position.y = 0.175;
    base.castShadow = true;
    base.receiveShadow = true;
    dummy.add(base);

    // Central Post
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.16, 2.1, 10),
      bronzeMat
    );
    post.position.y = 1.1;
    post.castShadow = true;
    dummy.add(post);

    // Armored Torso Plate
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 1.05, 0.38),
      basaltMat
    );
    torso.position.y = 1.45;
    torso.castShadow = true;
    dummy.add(torso);

    // Glowing Runic Bullseye on Chest
    const bullseyeOuter = new THREE.Mesh(
      new THREE.RingGeometry(0.22, 0.3, 24),
      runeGlowMat
    );
    bullseyeOuter.position.set(0, 1.45, 0.2);
    dummy.add(bullseyeOuter);

    const bullseyeCore = new THREE.Mesh(
      new THREE.CircleGeometry(0.11, 20),
      cyanBullseyeMat
    );
    bullseyeCore.position.set(0, 1.45, 0.205);
    dummy.add(bullseyeCore);

    // Carved Head Block
    const head = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.28, 1),
      bronzeMat
    );
    head.position.y = 2.25;
    head.castShadow = true;
    dummy.add(head);

    // Shoulder Crossbar Arms
    const arms = new THREE.Mesh(
      new THREE.BoxGeometry(1.45, 0.16, 0.18),
      bronzeMat
    );
    arms.position.y = 1.75;
    arms.castShadow = true;
    dummy.add(arms);

    group.add(dummy);
  }

  // 3. Grapple Hook & Aerial Combat Calibration Gantry at (-13, 0, -2)
  const gantry = new THREE.Group();
  gantry.position.set(-13, 0, -2);

  const pillarL = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 11.0, 0.6),
    basaltMat
  );
  pillarL.position.set(0, 5.5, -3.2);
  pillarL.castShadow = true;
  gantry.add(pillarL);

  const pillarR = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 11.0, 0.6),
    basaltMat
  );
  pillarR.position.set(0, 5.5, 3.2);
  pillarR.castShadow = true;
  gantry.add(pillarR);

  const crossBeam = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.55, 7.2),
    bronzeMat
  );
  crossBeam.position.set(0, 11.0, 0);
  crossBeam.castShadow = true;
  gantry.add(crossBeam);

  // Suspended Glowing Grapple Anchor Rings at Y = 6.5m and Y = 10.2m
  const grappleRingHigh = new THREE.Mesh(
    new THREE.TorusGeometry(0.85, 0.1, 12, 28),
    runeGlowMat
  );
  grappleRingHigh.rotation.y = Math.PI / 2;
  grappleRingHigh.position.set(0.8, 9.8, 0);
  gantry.add(grappleRingHigh);

  const grappleRingMid = new THREE.Mesh(
    new THREE.TorusGeometry(0.7, 0.09, 12, 24),
    cyanBullseyeMat
  );
  grappleRingMid.rotation.y = Math.PI / 2;
  grappleRingMid.position.set(0.8, 6.2, -1.8);
  gantry.add(grappleRingMid);

  group.add(gantry);

  return group;
}

export const ManifoldSandboxViewport: React.FC<ManifoldSandboxViewportProps> = ({
  world,
  cameraMode,
  gameOptions,
  pointerLockRequestCount,
  isOverlayOpen,
  activeTool,
  activeBuildingPreset,
  excavations,
  placedBuildings,
  onMineTerrainAt,
  onPlaceBuildingAt,
  voidBallOpen,
  biologicalJumpBoost,
  behaviorOutput,
  wCoord,
  globalRagdollActive,
  temporalLoopActive,
  onSyncTemporalLoopState,
  spawnQueue,
  onConsumeSpawnQueue,
  impulseTargetEntityId,
  onClearImpulseTarget,
  selectedEntityId,
  snapshotRequestEntityId,
  onCompleteSnapshotCapture,
  shockwaveTriggerCount,
  repopulateTriggerCount,
  strainHeatmapEnabled = false,
  summonVoidBallCount = 0,
  foreroomsDispositionOverride = null,
  favoritedManifolds = [],
  epochCount = 1,
  novelEventsCount = 4,
  worldArtforms = [],
  activeNoveltySeedId = 'grunge-typography-graffiti-dirt',
  goreGenreOverride = null,
  frontierComplexes = [],
  caveNestComplexes = [],
  fertilizedFloraPatches = [],
  evolutionSpeedMultiplier = 1.0,
  onDiscoverFrontierComplex,
  onSpawnCaveNestComplex,
  onSpawnFertilizedFloraPatch,
  onLogEvolutionaryLineage,
  onCraftRecipeFromVoidStation,
  onShiftDimensionFromVoidStation,
  onToggleStrainHeatmapFromVoidStation,
  onUpdateTelemetry,
  onImpactSpike,
  dimIndex = 1.0,
  onChangeDimension,
  onUpdateVehicleTelemetry,
  inventory = {
    'ferro-chitin': 4,
    'biolum-mycelium': 3,
    'calcified-memory': 3,
    'vitreous-aether': 3,
    'void-singularity-dust': 2,
  },
  biodepthConfig = DEFAULT_BIODEPTH_UI_GRAPHICS_CONFIG,
  onUpdateBiodepthConfig,
  onSetCameraMode,
  onCycleCameraPerspective,
  onCycleFreeLookMode,
  audioEnabled = false,
  onToggleAudio,
  onSelectTool,
  openMindspaceTriggerCount = 0,
  openVoidDialTriggerCount = 0,
  superflatMode = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const superflatModeRef = useRef<boolean>(superflatMode);
  superflatModeRef.current = superflatMode;
  setActiveSuperflatMode(superflatMode);
  const superflatStageGroupRef = useRef<THREE.Group | null>(null);
  const [webglLost, setWebglLost] = useState(false);
  const [isPointerDragging, setIsPointerDragging] = useState(false);
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  // Voidwalker Origin Customization, Trauma Cutscene, 3-State Left-Hand Void Ball, Base Elements, Far Cry Perks & Cultural Sims State
  const [voidwalkerConfig, setVoidwalkerConfig] =
    useState<VoidwalkerCustomizationConfig>(() => {
      try {
        const raw = window.localStorage.getItem('VOIDWALKER_ORIGIN_CONFIG_V2');
        if (raw) return { ...DEFAULT_VOIDWALKER_CUSTOMIZATION, ...JSON.parse(raw) };
      } catch {
        // Ignore
      }
      return DEFAULT_VOIDWALKER_CUSTOMIZATION;
    });
  const voidwalkerConfigRef =
    useRef<VoidwalkerCustomizationConfig>(voidwalkerConfig);
  voidwalkerConfigRef.current = voidwalkerConfig;

  // Start directly in active gameplay ('none') so the overhauled 3D world, models, and HUD are immediately visible (press [U] anytime for the 3D Character Creation Turntable)
  const [studioMode, setStudioMode] = useState<
    'none' | 'character-creation' | 'trauma-cutscene'
  >('none');
  const studioModeRef = useRef<
    'none' | 'character-creation' | 'trauma-cutscene'
  >(studioMode);
  studioModeRef.current = studioMode;

  const [studioPose, setStudioPose] = useState<CharacterStudioPoseId>(
    'combat-ready-breathe'
  );
  const studioPoseRef = useRef<CharacterStudioPoseId>(studioPose);
  studioPoseRef.current = studioPose;

  const [studioTurntableYaw, setStudioTurntableYaw] = useState<number>(0);
  const studioTurntableYawRef = useRef<number>(0);
  studioTurntableYawRef.current = studioTurntableYaw;

  const [cutsceneElapsedSec, setCutsceneElapsedSec] = useState<number>(0);
  const cutsceneElapsedSecRef = useRef<number>(0);

  const [voidBallMode, setVoidBallMode] =
    useState<VoidBallActivationMode>('dormant-clenched');
  const voidBallModeRef = useRef<VoidBallActivationMode>('dormant-clenched');
  voidBallModeRef.current = voidBallMode;

  const [activeBaseElement, setActiveBaseElement] =
    useState<BaseDimensionalElementId>(voidwalkerConfig.primaryBaseElement);
  const activeBaseElementRef =
    useRef<BaseDimensionalElementId>(activeBaseElement);
  activeBaseElementRef.current = activeBaseElement;

  const [unlockedPerkIds, setUnlockedPerkIds] = useState<string[]>([
    'perk-silent-execution',
  ]);
  const unlockedPerkIdsRef = useRef<string[]>(unlockedPerkIds);
  unlockedPerkIdsRef.current = unlockedPerkIds;

  const [devianceXP, setDevianceXP] = useState<number>(3);
  const [isPerkTreeOpen, setIsPerkTreeOpen] = useState<boolean>(false);
  const [isStealthCrouching, setIsStealthCrouching] = useState<boolean>(false);
  const isStealthCrouchingRef = useRef<boolean>(false);
  isStealthCrouchingRef.current = isStealthCrouching;

  const [heldObjectName, setHeldObjectName] = useState<string | null>(null);
  const [lastCombatBanner, setLastCombatBanner] = useState<string>(
    'Aim at Ground & Click (Mine) for Deep Granular Dirt Scoop · [E] Grab Weapon · [F] Throw · [I] Hand Void · [V] Portal'
  );
  const [denizenSims, setDenizenSims] = useState<AutonomousDenizenSimState[]>([]);
  const denizenSimsRef = useRef<AutonomousDenizenSimState[]>([]);
  const [activeQuest, setActiveQuest] =
    useState<EmergentCulturalQuestline | null>(null);
  const activeQuestRef = useRef<EmergentCulturalQuestline | null>(null);
  activeQuestRef.current = activeQuest;
  const questCounterRef = useRef<number>(0);

  const [epistemologyMap, setEpistemologyMap] = useState<
    Record<BaseDimensionalElementId, EpistemologicalPerceptionStage>
  >({
    'lithic-crystalline': 'decoded-shared-survival-mechanic',
    'hydro-superfluid': 'arcane-dimensional-magic',
    'aero-cymatic': 'incomprehensible-alien-horror',
    'pyro-vitreous': 'incomprehensible-alien-horror',
    'chrono-phase': 'arcane-dimensional-magic',
    'bio-miasmic': 'incomprehensible-alien-horror',
  });

  const culturalSettlementRigRef = useRef<CulturalSettlement3DRig | null>(null);
  const visceralCombatRigRef = useRef<VisceralCombatAndGrabRig | null>(null);
  const granularDirtRigRef = useRef<GranularDirtExcavationRig | null>(null);
  const characterStageRigRef = useRef<InEngine3DCharacterStageRig | null>(null);
  const realityTearPortalRigRef =
    useRef<RealityTearPortalAndSquareRoomRig | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());

  // Biodepth Portal Room, Multiversal Matters & Crucible State
  const biodepthConfigRef = useRef<BiodepthUiAndGraphicsConfig>(biodepthConfig);
  biodepthConfigRef.current = biodepthConfig;

  const [isBiodepthCrucibleModalOpen, setIsBiodepthCrucibleModalOpen] =
    useState<boolean>(false);
  const [isAutonomicInspectorOpen, setIsAutonomicInspectorOpen] =
    useState<boolean>(false);
  const [autonomicSnapshot, setAutonomicSnapshot] =
    useState<AutonomicArchitectureSnapshot>(() =>
      autonomicEquationEngine.getSnapshot()
    );
  const [portalRoomTier, setPortalRoomTier] = useState<PortalRoomTierId>(0);
  const portalRoomTierRef = useRef<PortalRoomTierId>(0);
  portalRoomTierRef.current = portalRoomTier;

  const [matterInventory, setMatterInventory] = useState<
    Record<MultiversalMatterId, number>
  >(() => ({
    'abyssal-biodepth-chitin': 3,
    'luminous-bathyal-gel': 2,
    'non-euclidean-void-basalt': 3,
    'graviton-alloy': 2,
    'prismatic-vector-glass': 2,
    'tachyon-mycelium': 2,
    'chronos-lattice-quartz': 2,
    'astral-singularity-core': 1,
  }));

  const [unlockedCrucibleRecipeIds, setUnlockedCrucibleRecipeIds] = useState<
    string[]
  >([]);
  const [placedRoomModules, setPlacedRoomModules] = useState<
    PlacedPortalRoomModule[]
  >(DEFAULT_PORTAL_ROOM_STARTER_MODULES);
  const placedRoomModulesRef = useRef<PlacedPortalRoomModule[]>(
    DEFAULT_PORTAL_ROOM_STARTER_MODULES
  );
  placedRoomModulesRef.current = placedRoomModules;

  const [portalRoomGravityMode, setPortalRoomGravityMode] =
    useState<PortalRoomGravityMode>('stabilized-1g');
  const portalRoomGravityModeRef =
    useRef<PortalRoomGravityMode>('stabilized-1g');
  portalRoomGravityModeRef.current = portalRoomGravityMode;
  const currentPortalElevationRef = useRef<number>(0);
  const currentPortalGravityGRef = useRef<number>(1.0);

  const [portalTelemetry, setPortalTelemetry] =
    useState<PortalRoomRuntimeTelemetry>({
      isPortalOpenInWorld: false,
      portalOpenProgress: 0,
      isPlayerInsidePortalRoom: false,
      portalRoomTier: 0,
      focusedRoomStation: 'none',
      focusedStationLabel: PORTAL_ROOM_TIERS[0].name,
      focusedStationHint:
        'Press [V] to tear open your Reality-Tear Portal & view the 36m×36m Square Room',
      activeModuleKind: 'interior-mezzanine-catwalk',
      placedModulesCount: DEFAULT_PORTAL_ROOM_STARTER_MODULES.length,
      effectiveGravityG: 1.0,
      currentFloorElevationM: 0,
      portalRoomGravityMode: 'stabilized-1g',
    });

  // Bethesda-Scale 325-Item Compendium, Active 3D Weapon Loadout, Grounding Objects & Portal Room Museum State
  const [compendiumState, setCompendiumState] =
    useState<CompendiumLoadoutAndMuseumState>(() => {
      const fallback = createInitialCompendiumLoadoutState();
      try {
        const raw = window.localStorage.getItem(
          'BETHESDA_COMPENDIUM_LOADOUT_V1'
        );
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return {
          ...fallback,
          ...parsed,
          mountedMuseumPlinths:
            parsed.mountedMuseumPlinths ?? fallback.mountedMuseumPlinths,
        };
      } catch {
        return fallback;
      }
    });
  const compendiumStateRef =
    useRef<CompendiumLoadoutAndMuseumState>(compendiumState);
  compendiumStateRef.current = compendiumState;

  useEffect(() => {
    try {
      window.localStorage.setItem(
        'BETHESDA_COMPENDIUM_LOADOUT_V1',
        JSON.stringify(compendiumState)
      );
    } catch {
      // Ignore quota errors
    }
  }, [compendiumState]);

  const [isCompendiumModalOpen, setIsCompendiumModalOpen] =
    useState<boolean>(false);
  const [focusedGroundingAnchor, setFocusedGroundingAnchor] =
    useState<FocusedGroundingObjectTelemetry | null>(null);
  const focusedGroundingAnchorRef =
    useRef<FocusedGroundingObjectTelemetry | null>(null);
  focusedGroundingAnchorRef.current = focusedGroundingAnchor;

  const fpSpringRigRef = useRef<FirstPersonActionSpringRig>(
    new FirstPersonActionSpringRig()
  );
  const [weaponCombatState, setWeaponCombatState] =
    useState<ActiveWeaponCombatState>(() =>
      fpSpringRigRef.current.getCombatState()
    );
  const grappledEnemyRef = useRef<ArticulatedRagdollEntity | null>(null);
  const [grappledEnemyName, setGrappledEnemyName] = useState<string | null>(
    null
  );
  const groundingWorldRigRef = useRef<DimensionalGroundingWorldRig>(
    new DimensionalGroundingWorldRig()
  );
  const portalMuseumGalleryRigRef =
    useRef<PortalRoomMuseumGalleryRig | null>(null);

  // Infinite Absurd Timelines, Playable Zero-G In-Between Void & 4-Branch Void Ball Evolution State
  const [voidBallEvolutionState, setVoidBallEvolutionState] =
    useState<VoidBallEvolutionState>(() => {
      const fallback = createInitialVoidBallEvolutionState();
      try {
        const raw = window.localStorage.getItem(
          'TESSERACT_VOID_BALL_EVOLUTION_V1'
        );
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        const upgradeTimeline = (
          tl: Partial<AbsurdTimelineSpec> | undefined
        ): AbsurdTimelineSpec => {
          const base = synthesizeInfiniteTimelineFromCoordinate(
            tl?.coordinateCode || 'C-137'
          );
          return { ...base, ...tl };
        };
        return {
          ...fallback,
          ...parsed,
          activeTimeline: upgradeTimeline(parsed.activeTimeline),
          pendingDestinationTimeline: upgradeTimeline(
            parsed.pendingDestinationTimeline
          ),
          discoveredTimelines: Array.isArray(parsed.discoveredTimelines)
            ? parsed.discoveredTimelines.map(upgradeTimeline)
            : fallback.discoveredTimelines,
          isPlayerInsideInBetweenVoid: false,
          isInBetweenPortalOpen: false,
        };
      } catch {
        return fallback;
      }
    });
  const voidBallEvolutionStateRef = useRef<VoidBallEvolutionState>(
    voidBallEvolutionState
  );
  voidBallEvolutionStateRef.current = voidBallEvolutionState;

  useEffect(() => {
    try {
      window.localStorage.setItem(
        'TESSERACT_VOID_BALL_EVOLUTION_V1',
        JSON.stringify({
          ...voidBallEvolutionState,
          discoveredTimelines:
            voidBallEvolutionState.discoveredTimelines.slice(0, 24),
        })
      );
    } catch {
      // Ignore quota errors
    }
  }, [voidBallEvolutionState]);

  const [isTimelineModalOpen, setIsTimelineModalOpen] =
    useState<boolean>(false);
  const inBetweenVoidRigRef = useRef<InBetweenTimelineVoidRig | null>(null);
  const absurdTimelineDecoratorRef = useRef<AbsurdTimelineWorldDecoratorRig>(
    new AbsurdTimelineWorldDecoratorRig()
  );
  const sentientSymbioteRigRef = useRef<SentientVoidBallSymbioteRig>(
    new SentientVoidBallSymbioteRig()
  );
  const voidBeamHandRaiseTimerRef = useRef<number>(0);

  // Physics Grapple Hook Controller, Multi-Vehicle Traversal & Animated Body Modifications State & Rigs
  const grappleHookRigRef = useRef<GrappleHookController>(
    new GrappleHookController()
  );
  const isRightClickZipReelHeldRef = useRef<boolean>(false);
  const bodyModsRigRef = useRef<AnimatedBodyModificationsRig>(
    new AnimatedBodyModificationsRig()
  );
  const creatureFactionAIDirectorRef = useRef<TimelineCreatureFactionAIDirector>(
    new TimelineCreatureFactionAIDirector()
  );
  const weaponHandControllerRef = useRef<WeaponHandAnimationController>(
    new WeaponHandAnimationController()
  );
  const drsAndLodControllerRef = useRef<AdaptiveDRSAndLODController>(
    new AdaptiveDRSAndLODController()
  );
  const instancedScatterRigRef = useRef<InstancedWorldScatterRig>(
    new InstancedWorldScatterRig()
  );
  const [activeVehicleType, setActiveVehicleType] =
    useState<TraversalVehicleType>('twin-turbine-hover-bike');
  const activeVehicleTypeRef = useRef<TraversalVehicleType>(
    'twin-turbine-hover-bike'
  );
  activeVehicleTypeRef.current = activeVehicleType;

  const [grappleActive, setGrappleActive] = useState<boolean>(false);
  const [grappleAnchorLabel, setGrappleAnchorLabel] =
    useState<string>('Ready');
  const [grappleRangeTelemetry, setGrappleRangeTelemetry] =
    useState<GrappleSurfaceRangeTelemetry | null>(null);
  const [equippedBodyMods, setEquippedBodyMods] = useState<BodyModId[]>([
    'cyber-wings',
    'mantis-blades',
    'thruster-legs',
    'wall-run-boots',
  ]);
  const equippedBodyModsRef = useRef<BodyModId[]>(equippedBodyMods);
  equippedBodyModsRef.current = equippedBodyMods;

  const [mindspaceDialConfig, setMindspaceDialConfig] =
    useState<MindspaceAndVoidDialConfig>(() => {
      try {
        const raw = window.localStorage.getItem(
          'TESSERACT_MINDSPACE_VOID_DIAL_V1'
        );
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            ...DEFAULT_MINDSPACE_AND_VOID_DIAL_CONFIG,
            ...parsed,
            isMindspaceOpen: false,
            isVoidDialOpen: false,
          };
        }
      } catch {
        // Ignore storage errors
      }
      return DEFAULT_MINDSPACE_AND_VOID_DIAL_CONFIG;
    });
  const mindspaceDialConfigRef =
    useRef<MindspaceAndVoidDialConfig>(mindspaceDialConfig);
  mindspaceDialConfigRef.current = mindspaceDialConfig;

  useEffect(() => {
    try {
      window.localStorage.setItem(
        'TESSERACT_MINDSPACE_VOID_DIAL_V1',
        JSON.stringify({
          ...mindspaceDialConfig,
          isMindspaceOpen: false,
          isVoidDialOpen: false,
        })
      );
    } catch {
      // Ignore quota errors
    }
  }, [mindspaceDialConfig]);

  const mindspace3DRigRef = useRef<MindspaceCustomization3DRig | null>(null);
  const voidWeaponPullStateRef = useRef<VoidBallWeaponPullAnimationState>(
    createInitialVoidBallWeaponPullState()
  );
  const vKeyDownAtMsRef = useRef<number>(0);

  // Sync top-bar Mindspace & Void Dial triggers
  useEffect(() => {
    if (openMindspaceTriggerCount <= 0) return;
    setMindspaceDialConfig((prev) => {
      const next = {
        ...prev,
        isMindspaceOpen: !prev.isMindspaceOpen,
        isVoidDialOpen: false,
      };
      mindspaceDialConfigRef.current = next;
      return next;
    });
  }, [openMindspaceTriggerCount]);

  useEffect(() => {
    if (openVoidDialTriggerCount <= 0) return;
    setMindspaceDialConfig((prev) => {
      const next = {
        ...prev,
        isVoidDialOpen: !prev.isVoidDialOpen,
        isMindspaceOpen: false,
      };
      mindspaceDialConfigRef.current = next;
      return next;
    });
  }, [openVoidDialTriggerCount]);

  // Mutable refs for animation loop
  const worldRef = useRef<ManifoldWorldSpec>(world);
  worldRef.current = world;

  const cameraModeRef = useRef<CameraPerspective>(cameraMode);
  cameraModeRef.current = cameraMode;

  const gameOptionsRef = useRef<GameOptionsConfig>(gameOptions);
  gameOptionsRef.current = gameOptions;

  const isOverlayOpenRef = useRef<boolean>(
    isOverlayOpen ||
      studioMode !== 'none' ||
      isPerkTreeOpen ||
      isBiodepthCrucibleModalOpen ||
      isCompendiumModalOpen ||
      isTimelineModalOpen ||
      mindspaceDialConfig.isMindspaceOpen
  );
  isOverlayOpenRef.current =
    isOverlayOpen ||
    studioMode !== 'none' ||
    isPerkTreeOpen ||
    isBiodepthCrucibleModalOpen ||
    isCompendiumModalOpen ||
    isTimelineModalOpen ||
    mindspaceDialConfig.isMindspaceOpen;

  // Normalized cursor position (-1 to +1) for effortless edge-gliding free-look
  const cursorNormRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const lastHoverPointRef = useRef<{ x: number; y: number } | null>(null);

  const [dialOverrideTool, setDialOverrideTool] =
    useState<PlayerInteractionTool | null>(null);
  useEffect(() => {
    setDialOverrideTool(null);
  }, [activeTool]);
  const effectiveActiveTool = dialOverrideTool ?? activeTool;

  const activeToolRef = useRef<PlayerInteractionTool>(effectiveActiveTool);
  activeToolRef.current = effectiveActiveTool;

  const activeBuildingPresetRef =
    useRef<BuildingPresetBlueprint>(activeBuildingPreset);
  activeBuildingPresetRef.current = activeBuildingPreset;

  const excavationsRef = useRef<TerrainExcavationSpot[]>(excavations);
  excavationsRef.current = excavations;

  const placedBuildingsRef = useRef<PlacedWorldBuilding[]>(placedBuildings);
  placedBuildingsRef.current = placedBuildings;

  const voidBallOpenRef = useRef<boolean>(
    voidBallOpen ||
      voidBallMode !== 'dormant-clenched' ||
      mindspaceDialConfig.isVoidDialOpen
  );
  voidBallOpenRef.current =
    voidBallOpen ||
    voidBallMode !== 'dormant-clenched' ||
    mindspaceDialConfig.isVoidDialOpen;

  const biologicalJumpBoostRef = useRef<number>(biologicalJumpBoost);
  biologicalJumpBoostRef.current = biologicalJumpBoost;

  const behaviorRef = useRef<BehaviorEvaluationOutput>(behaviorOutput);
  behaviorRef.current = behaviorOutput;

  const wCoordRef = useRef<number>(wCoord);
  wCoordRef.current = wCoord;

  const globalRagdollRef = useRef<boolean>(globalRagdollActive);
  globalRagdollRef.current = globalRagdollActive;

  const temporalLoopActiveRef = useRef<boolean>(temporalLoopActive);
  temporalLoopActiveRef.current = temporalLoopActive;

  const selectedEntityIdRef = useRef<string | null>(selectedEntityId);
  selectedEntityIdRef.current = selectedEntityId;

  const strainHeatmapRef = useRef<boolean>(strainHeatmapEnabled);
  strainHeatmapRef.current = strainHeatmapEnabled;

  const foreroomsDispositionRef = useRef<ForeroomsDispositionLocus | null>(
    foreroomsDispositionOverride
  );
  foreroomsDispositionRef.current = foreroomsDispositionOverride;

  const favoritedManifoldsRef =
    useRef<FavoritedManifoldAnchor[]>(favoritedManifolds);
  favoritedManifoldsRef.current = favoritedManifolds;

  const epochCountRef = useRef<number>(epochCount);
  epochCountRef.current = epochCount;

  const novelEventsCountRef = useRef<number>(novelEventsCount);
  novelEventsCountRef.current = novelEventsCount;

  const worldArtformsRef =
    useRef<WorldspaceProceduralArtform[]>(worldArtforms);
  worldArtformsRef.current = worldArtforms;

  const activeNoveltySeedIdRef =
    useRef<ConceptualNoveltySeedId>(activeNoveltySeedId);
  activeNoveltySeedIdRef.current = activeNoveltySeedId;

  const goreGenreOverrideRef = useRef<DimensionalGoreGenre | null>(
    goreGenreOverride
  );
  goreGenreOverrideRef.current = goreGenreOverride;

  const frontierComplexesRef =
    useRef<FrontierComplexSite[]>(frontierComplexes);
  frontierComplexesRef.current = frontierComplexes;

  const caveNestComplexesRef =
    useRef<WorldCaveNestComplex[]>(caveNestComplexes);
  caveNestComplexesRef.current = caveNestComplexes;

  const fertilizedFloraPatchesRef = useRef<WorldFertilizedFloraPatch[]>(
    fertilizedFloraPatches
  );
  fertilizedFloraPatchesRef.current = fertilizedFloraPatches;

  const evolutionSpeedMultiplierRef = useRef<number>(evolutionSpeedMultiplier);
  evolutionSpeedMultiplierRef.current = evolutionSpeedMultiplier;

  const onDiscoverFrontierComplexRef = useRef(onDiscoverFrontierComplex);
  onDiscoverFrontierComplexRef.current = onDiscoverFrontierComplex;
  const onSpawnCaveNestComplexRef = useRef(onSpawnCaveNestComplex);
  onSpawnCaveNestComplexRef.current = onSpawnCaveNestComplex;
  const onSpawnFertilizedFloraPatchRef = useRef(onSpawnFertilizedFloraPatch);
  onSpawnFertilizedFloraPatchRef.current = onSpawnFertilizedFloraPatch;
  const onLogEvolutionaryLineageRef = useRef(onLogEvolutionaryLineage);
  onLogEvolutionaryLineageRef.current = onLogEvolutionaryLineage;

  // Stable Callback Refs so the WebGL scene & animation loop NEVER tear down or pop on state updates
  const onMineTerrainAtRef = useRef(onMineTerrainAt);
  onMineTerrainAtRef.current = onMineTerrainAt;
  const onPlaceBuildingAtRef = useRef(onPlaceBuildingAt);
  onPlaceBuildingAtRef.current = onPlaceBuildingAt;
  const onUpdateTelemetryRef = useRef(onUpdateTelemetry);
  onUpdateTelemetryRef.current = onUpdateTelemetry;
  const onImpactSpikeRef = useRef(onImpactSpike);
  onImpactSpikeRef.current = onImpactSpike;
  const onSyncTemporalLoopStateRef = useRef(onSyncTemporalLoopState);
  onSyncTemporalLoopStateRef.current = onSyncTemporalLoopState;
  const onCraftRecipeFromVoidStationRef = useRef(onCraftRecipeFromVoidStation);
  onCraftRecipeFromVoidStationRef.current = onCraftRecipeFromVoidStation;
  const onShiftDimensionFromVoidStationRef = useRef(
    onShiftDimensionFromVoidStation
  );
  onShiftDimensionFromVoidStationRef.current = onShiftDimensionFromVoidStation;
  const onToggleStrainHeatmapFromVoidStationRef = useRef(
    onToggleStrainHeatmapFromVoidStation
  );
  onToggleStrainHeatmapFromVoidStationRef.current =
    onToggleStrainHeatmapFromVoidStation;

  // Rolling 5-second spatiotemporal buffer & playback state
  const temporalBufferRef = useRef<TemporalLoopFrame[]>([]);
  const loopPhaseTimeRef = useRef<number>(0);

  // Scene & entity refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const terrainMeshRef = useRef<THREE.Mesh | null>(null);
  const buildingsGroupRef = useRef<THREE.Group | null>(null);
  const evolutionaryEcologyGroupRef = useRef<THREE.Group | null>(null);
  const proceduralSectorsGroupRef = useRef<THREE.Group | null>(null);
  const generatedSectorsRef = useRef<Map<string, ProceduralTerrainSectorSpec>>(
    new Map()
  );
  const sectorTerrainMeshesRef = useRef<THREE.Mesh[]>([]);
  const organPickupsRef = useRef<PhysicalVisceralOrganPickup[]>([]);
  const somaticGraftStateRef = useRef<PlayerSomaticGraftTelemetry>({
    graftCount: 0,
    activeOrganTitle: 'Base Explorer Anatomy',
    limbScaleMultiplier: 1.0,
    speedBoostMultiplier: 1.0,
    jumpBoostMultiplier: 1.0,
    lastWorldMechanicEvent: 'Aim at Ground & Click to Excavate Granular Dirt Strata',
    exploredSectorCount: 1,
    currentSectorName: 'Prime Genesis Basin (Sector 0,0)',
    currentSectorElevationRegime: 'biocomplex-caldera-amphitheater',
  });
  const [liveGraftTelemetry, setLiveGraftTelemetry] =
    useState<PlayerSomaticGraftTelemetry>(somaticGraftStateRef.current);
  const cradleSynthesisCooldownRef = useRef<number>(0);
  const pylonShiftCooldownRef = useRef<number>(0);
  const entitiesRef = useRef<ArticulatedRagdollEntity[]>([]);
  const projectilesRef = useRef<ProjectileInstance[]>([]);
  const shardsRef = useRef<ResourceShardParticle[]>([]);
  const shockwavesRef = useRef<ShockwaveRingInstance[]>([]);
  const worldGroupRef = useRef<THREE.Group | null>(null);
  const dimensionalPlaceGroupRef = useRef<THREE.Group | null>(null);
  const worldPropsListRef = useRef<
    { mesh: THREE.Object3D; baseAngle: number; baseDist: number; baseScale: number }[]
  >([]);
  const escherMonumentsListRef = useRef<
    { mesh: THREE.Object3D; baseAngle: number; baseDist: number }[]
  >([]);
  const kineticRotorsRef = useRef<THREE.Object3D[]>([]);
  const pendulumsRef = useRef<THREE.Object3D[]>([]);
  const propCollidersRef = useRef<{ x: number; z: number; radius: number }[]>(
    []
  );

  // Playable character, Left-Hand Void Ball & Right-Hand Tool Mudra 3D rig refs
  const avatarRigRef = useRef<ReturnType<
    typeof buildPlayableCharacterMesh
  > | null>(null);
  const fpLeftHandRigRef = useRef<THREE.Group | null>(null);
  const fpRightHandRigRef = useRef<THREE.Group | null>(null);
  const voidOpenBlendRef = useRef<number>(0);
  const rightHandGestureTimerRef = useRef<number>(0);

  // 5D Cloud Canopy, Weather Particle Field, Scent Breeze Ribbons, Interconnectedness Web & Wonder Lighting Refs
  const cloud5DCanopyRef = useRef<Cloud5DCanopyRig | null>(null);
  const weatherParticlesRef = useRef<WeatherParticleRig | null>(null);
  const scentBreezeRef = useRef<ScentBreezeRig | null>(null);
  const interconnectedWebRef = useRef<InterconnectednessWebRig | null>(null);
  const walkInVoidRigRef = useRef<WalkInVoidSanctuaryRig | null>(null);
  const foreroomsRigRef = useRef<ForeroomsTesseractRig | null>(null);
  const noveltyBoundaryRigRef = useRef<ConceptualNoveltyBoundaryRig | null>(
    null
  );
  const worldspaceBleedRigRef = useRef<WorldspaceBleedRig | null>(null);
  const latestStructuralTelemetryRef =
    useRef<SpatialVoidAndBimTelemetry | null>(null);
  const slipstreamBoostRef = useRef<number>(1.0);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const zenithCausticLightRef = useRef<THREE.PointLight | null>(null);
  const immersionPipelineRef = useRef<PhotorealisticPostProcessingPipeline | null>(null);
  const sunShaftRigRef = useRef<AtmosphericSunShaftRig | null>(null);
  const microGroundCoverRef = useRef<MicroGroundCoverRig | null>(null);
  const latestImpactRef = useRef<number>(0);
  const celestialCosmologyRigRef = useRef<CelestialCosmologyRig | null>(null);
  const gravityVehicleRigRef = useRef<GravityVehicle5DRig | null>(null);
  const dimensionalSoilParticleRigRef = useRef<DimensionalSoilParticleRig | null>(null);
  const excavationShatterRigRef = useRef<ExcavationShatterShaderRig | null>(null);
  const isVehicleMountedRef = useRef<boolean>(false);
  const currentDimIndexRef = useRef<number>(dimIndex);
  currentDimIndexRef.current = dimIndex;
  const onUpdateVehicleTelemetryRef = useRef(onUpdateVehicleTelemetry);
  onUpdateVehicleTelemetryRef.current = onUpdateVehicleTelemetry;

  // Experimental Manifold POV & Explorer physics state + Non-Popping Continuous Spatiotemporal Flow State Machine
  const explorerStateRef = useRef({
    pos: new THREE.Vector3(0, 4, 14),
    vel: new THREE.Vector3(0, 0, 0),
    yaw: Math.PI,
    pitch: -0.12,
    manifoldRoll: 0,
    fovPulse: 0,
    thirdPersonDist: 7.2,
    grounded: false,
    walkCycle: 0,
  });

  const povFlowStateRef = useRef({
    initialized: false,
    lastBuiltWorldId: '',
    lastSkinTopology: '',
    elevationSpringOffset: 0,
    continuityBlendAlpha: 0,
    smoothVisualY: 4,
    smoothCamPos: new THREE.Vector3(0, 6, 18),
    smoothLookAt: new THREE.Vector3(0, 4, 10),
    yawVel: 0,
    pitchVel: 0,
  });

  const keysPressedRef = useRef<Set<string>>(new Set());
  const executePrimaryToolActionRef = useRef<
    (overrideTool?: PlayerInteractionTool) => void
  >(() => {});
  const executeDestructiveWeaponFireRef = useRef<
    (triggerSource: 'left-click' | 'right-click') => void
  >(() => {});

  // Helper to update 3D terrain mesh vertices whenever excavations change
  const deformTerrainGeometry = useCallback(
    (targetWorld: ManifoldWorldSpec, currentExcavations: TerrainExcavationSpot[]) => {
      const terrainMesh = terrainMeshRef.current;
      if (!terrainMesh) return;
      const terrainGeo = terrainMesh.geometry as THREE.BufferGeometry;
      const posAttr = terrainGeo.attributes.position;
      const colorAttr = terrainGeo.attributes.color;

      const tempColor = new THREE.Color();

      // Synchronize ProceduralEnvironmentEngine with the active timeline so heightmaps & 7-band strata palettes are seed-unique
      const activeTimelineNow =
        voidBallEvolutionStateRef.current.activeTimeline;
      proceduralEnvironmentEngine.setActiveTimelineSpec(activeTimelineNow);
      setActiveTimelineLandform(
        activeTimelineNow.landformArchetype,
        activeTimelineNow.seedHash
      );

      const lightSpec = resolveDimensionalLightingSpec(currentDimIndexRef.current);
      const hyperbolicK = lightSpec.hyperbolicK;
      // Synchronize authoritative dimension index, superflat mode & hyperbolic curvature so EVERY evaluateTerrainHeight call in physics/ragdolls matches 100%!
      setActiveDimensionIndex(currentDimIndexRef.current);
      setActiveSuperflatMode(superflatModeRef.current);
      setActiveHyperbolicCurvature(superflatModeRef.current ? 0 : hyperbolicK);

      // Bake the 181x181 terrain heightfield once in O(N) instead of 8x redundant per-vertex triangle evaluations
      const { baseGrid, dugGrid } = bakeActiveTerrainHeightGrid(
        targetWorld,
        currentExcavations,
        superflatModeRef.current ? 0 : hyperbolicK
      );
      const stride = 181;
      const cellSpanM = 280 / 180;

      for (let i = 0; i < posAttr.count; i++) {
        const vx = posAttr.getX(i);
        const vz = posAttr.getZ(i);
        const col = Math.min(
          180,
          Math.max(0, Math.round(((vx + 140) / 280) * 180))
        );
        const row = Math.min(
          180,
          Math.max(0, Math.round(((vz + 140) / 280) * 180))
        );
        const gridIdx = row * stride + col;
        const baseVy = baseGrid[gridIdx];
        const vy = dugGrid[gridIdx];
        posAttr.setY(i, vy);

        // Compute local terrain slope gradient |∇h| from adjacent grid cells for realistic cliff escarpment coloring
        const colLeft = Math.max(0, col - 1);
        const colRight = Math.min(180, col + 1);
        const rowUp = Math.max(0, row - 1);
        const rowDown = Math.min(180, row + 1);
        const dhdx =
          (dugGrid[row * stride + colRight] -
            dugGrid[row * stride + colLeft]) /
          (2 * cellSpanM);
        const dhdz =
          (dugGrid[rowDown * stride + col] -
            dugGrid[rowUp * stride + col]) /
          (2 * cellSpanM);
        const slopeGradient = Math.hypot(dhdx, dhdz);

        if (superflatModeRef.current && Math.abs(baseVy - vy) <= 0.04) {
          // Clean Carved Basalt & Weathered Bronze Rangefinder Proving Ground Grid on the Y = 0.0m plane
          const tileX = Math.floor((vx + 140) / 5.0);
          const tileZ = Math.floor((vz + 140) / 5.0);
          const isAltTile = (tileX + tileZ) % 2 === 0;
          tempColor.set(isAltTile ? '#1e1915' : '#171310');

          const mod5X = Math.abs(vx % 5.0);
          const mod5Z = Math.abs(vz % 5.0);
          const onMinorGrid =
            mod5X < 0.45 || mod5X > 4.55 || mod5Z < 0.45 || mod5Z > 4.55;
          const mod20X = Math.abs(vx % 20.0);
          const mod20Z = Math.abs(vz % 20.0);
          const onMajorGrid =
            mod20X < 0.55 || mod20X > 19.45 || mod20Z < 0.55 || mod20Z > 19.45;
          const distCenter = Math.hypot(vx, vz);
          const onRangeRing =
            Math.abs(distCenter - 8) < 0.55 ||
            Math.abs(distCenter - 16) < 0.55 ||
            Math.abs(distCenter - 26) < 0.55 ||
            Math.abs(distCenter - 38) < 0.55;

          if (onRangeRing) {
            tempColor.set('#c89d54');
          } else if (onMajorGrid) {
            tempColor.set('#6e5536');
          } else if (onMinorGrid) {
            tempColor.set('#2c241d');
          }
        } else {
          proceduralEnvironmentEngine.evaluateSlopeAndStrataColorAt(
            vx,
            vz,
            baseVy,
            vy,
            slopeGradient,
            tempColor
          );
        }

        if (colorAttr) {
          colorAttr.setXYZ(i, tempColor.r, tempColor.g, tempColor.b);
        }
      }

      posAttr.needsUpdate = true;
      if (colorAttr) colorAttr.needsUpdate = true;
      terrainGeo.computeVertexNormals();

      // Update vertex heights on any distant frontier sector terrain meshes
      for (const secMesh of sectorTerrainMeshesRef.current) {
        const sGeo = secMesh.geometry as THREE.BufferGeometry;
        const sPos = sGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < sPos.count; i++) {
          const wx = sPos.getX(i);
          const wz = sPos.getZ(i);
          sPos.setY(
            i,
            evaluateTerrainHeight(wx, wz, targetWorld, currentExcavations, hyperbolicK)
          );
        }
        sPos.needsUpdate = true;
        sGeo.computeVertexNormals();
      }
    },
    []
  );

  // Spawn helper
  const spawnEntityInstance = useCallback(
    (blueprint: EntityBlueprint, customPos?: THREE.Vector3) => {
      const scene = sceneRef.current;
      if (!scene) return;
      const activeWorld = worldRef.current;
      let sx = 0;
      let sz = 0;
      if (customPos) {
        sx = customPos.x;
        sz = customPos.z;
      } else if (superflatModeRef.current) {
        // In Superflat Proving Ground mode, spawn new entities directly in front of the player's gaze on the flat plane!
        const ex = explorerStateRef.current;
        const forwardDist = 9.0 + Math.random() * 6.5;
        const lateralSpread = (Math.random() - 0.5) * 9.0;
        const fwdX = -Math.sin(ex.yaw);
        const fwdZ = -Math.cos(ex.yaw);
        const rightX = Math.cos(ex.yaw);
        const rightZ = -Math.sin(ex.yaw);
        sx = ex.pos.x + fwdX * forwardDist + rightX * lateralSpread;
        sz = ex.pos.z + fwdZ * forwardDist + rightZ * lateralSpread;
      } else {
        const angle = Math.random() * Math.PI * 2;
        const radius = 7 + Math.random() * 26;
        sx = Math.cos(angle) * radius;
        sz = Math.sin(angle) * radius;
      }
      const sy = evaluateTerrainHeight(
        sx,
        sz,
        activeWorld,
        excavationsRef.current
      );

      const id = `ent-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const entity = new ArticulatedRagdollEntity(
        id,
        blueprint,
        new THREE.Vector3(sx, sy + 0.25, sz),
        Number(((Math.random() - 0.5) * 0.4).toFixed(2))
      );
      entity.forcedRagdoll = globalRagdollRef.current;
      scene.add(entity.rootGroup);
      entitiesRef.current.push(entity);

      // Register autonomous Sims cultural denizen state for this creature/character
      const simState = createAutonomousDenizenSimState(
        id,
        blueprint.name,
        currentDimIndexRef.current,
        entitiesRef.current.length,
        activeWorld.seed
      );
      denizenSimsRef.current.push(simState);
    },
    []
  );

  // Rebuild world terrain, playable character rig, lighting, and world-specific 3D models
  const rebuildWorldEnvironment = useCallback(
    (targetWorld: ManifoldWorldSpec) => {
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      if (!scene || !camera) return;

      // Clear previous world group
      if (worldGroupRef.current) {
        scene.remove(worldGroupRef.current);
        worldGroupRef.current.traverse((obj) => {
          if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
            if (!obj.geometry.userData?.isSharedPooledGeometry) {
              obj.geometry.dispose();
            }
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => {
                if (!m.userData?.isSharedPooledMaterial) {
                  m.dispose();
                }
              });
            } else if (!obj.material.userData?.isSharedPooledMaterial) {
              obj.material.dispose();
            }
          }
        });
      }

      // Clear previous avatar rig & 1st-person left/right hand rigs
      if (avatarRigRef.current) {
        scene.remove(avatarRigRef.current.root);
      }
      if (fpLeftHandRigRef.current) {
        camera.remove(fpLeftHandRigRef.current);
      }
      if (fpRightHandRigRef.current) {
        camera.remove(fpRightHandRigRef.current);
      }

      // Clear previous entities
      for (const ent of entitiesRef.current) {
        ent.dispose(scene);
      }
      entitiesRef.current = [];
      denizenSimsRef.current = [];
      kineticRotorsRef.current = [];
      pendulumsRef.current = [];
      propCollidersRef.current = [];
      spatialCollisionSolver.clear();
      worldPropsListRef.current = [];
      escherMonumentsListRef.current = [];
      temporalBufferRef.current = [];
      loopPhaseTimeRef.current = 0;

      // Register authoritative Portal Room floor callback and active dimension index
      setActiveDimensionIndex(currentDimIndexRef.current);
      setActivePortalRoomFloorEvaluator((x, z, curY) =>
        evaluatePortalRoomInteriorGroundAndGravity(
          x,
          z,
          curY,
          placedRoomModulesRef.current,
          portalRoomGravityModeRef.current
        ).groundY
      );

      // Physical ACESFilmic studio lighting, volumetric light shafts, sky dome & exponential fog
      if (rendererRef.current) {
        applyDimensionalLightingAndAtmosphere(
          scene,
          rendererRef.current,
          {
            hemiLight: hemiLightRef.current,
            keyLight: keyLightRef.current,
            rimLight: rimLightRef.current,
            zenithCausticLight: zenithCausticLightRef.current,
          },
          sunShaftRigRef.current,
          currentDimIndexRef.current
        );
      } else {
        const lightSpec = resolveDimensionalLightingSpec(currentDimIndexRef.current);
        scene.background = new THREE.Color(lightSpec.skyColor);
        scene.fog = new THREE.FogExp2(lightSpec.fogColor, lightSpec.fogDensity);
        if (hemiLightRef.current) {
          hemiLightRef.current.color.set(lightSpec.skyColor);
          hemiLightRef.current.groundColor.set(lightSpec.groundHemiColor);
          hemiLightRef.current.intensity = lightSpec.hemiIntensity;
        }
        if (keyLightRef.current) {
          keyLightRef.current.color.set(lightSpec.sunColor);
          keyLightRef.current.intensity = lightSpec.sunIntensity;
        }
        if (rimLightRef.current) {
          rimLightRef.current.color.set(lightSpec.rimColor);
          rimLightRef.current.intensity = lightSpec.rimIntensity;
        }
        if (zenithCausticLightRef.current) {
          zenithCausticLightRef.current.color.set(lightSpec.causticZenithColor);
          zenithCausticLightRef.current.intensity = lightSpec.causticIntensity;
        }
      }

      const worldGroup = new THREE.Group();
      worldGroupRef.current = worldGroup;
      scene.add(worldGroup);

      // 1. Build New Playable Character 3D Mesh & 1st-Person Left/Right Articulated Hand Rigs
      const builtAvatar = buildPlayableCharacterMesh(
        targetWorld.playableCharacter
      );
      avatarRigRef.current = builtAvatar;
      scene.add(builtAvatar.root);

      const fpLeftHand = buildLeftHandVoidBallRig(
        targetWorld.playableCharacter
      );
      fpLeftHand.position.set(-0.32, -0.21, -0.46);
      fpLeftHand.rotation.set(0.28, 0.32, -0.15);
      fpLeftHandRigRef.current = fpLeftHand;
      camera.add(fpLeftHand);

      const fpRightHand = buildRightHandToolRig(
        targetWorld.playableCharacter
      );
      fpRightHand.position.set(0.32, -0.23, -0.46);
      fpRightHand.rotation.set(0.24, -0.28, 0.12);
      fpRightHandRigRef.current = fpRightHand;
      camera.add(fpRightHand);

      // Attach Active Composite 3D Weapon / Tool Mesh from 325-Item Compendium
      const activeRightWeapon = resolveCompendiumItemById(
        compendiumStateRef.current.equippedRightHandId,
        compendiumStateRef.current
      );
      fpSpringRigRef.current.equipWeaponOnHandRigs(
        activeRightWeapon,
        fpRightHand,
        builtAvatar.rightHandToolRig
      );

      // Apply Realistic Human Default Anatomy (Articulated 5-Finger Phalanges, Fingernails, Dorsal Tendons & Gloves) or Active Special Transformation Mode!
      syncCharacterMorphAndHumanAppearance({
        avatarRig: builtAvatar,
        fpLeftHandRig: fpLeftHand,
        fpRightHandRig: fpRightHand,
        config: mindspaceDialConfigRef.current,
      });

      // 1B. Build 5D Cloud Canopy Over 4D Floor, Weather Particle Field, Scent Breeze Ribbons & 3D Interconnectedness Web
      const cloudCanopy = build5DCloudCanopy(targetWorld);
      cloud5DCanopyRef.current = cloudCanopy;
      worldGroup.add(cloudCanopy.group);

      const weatherParticles = buildWeatherParticleField(targetWorld);
      weatherParticlesRef.current = weatherParticles;
      worldGroup.add(weatherParticles.group);

      const scentBreeze = buildScentBreezeRibbons(targetWorld);
      scentBreezeRef.current = scentBreeze;
      worldGroup.add(scentBreeze.group);

      const interconnectedWeb = buildInterconnectednessWebRig(targetWorld);
      interconnectedWebRef.current = interconnectedWeb;
      worldGroup.add(interconnectedWeb.group);

      // 1C. Build Inviting Walk-In 3D Void Ball Sanctuary & Full-Scale Build-Space BIM Hologram
      const initialVoidCenter = new THREE.Vector3(
        -7.5,
        evaluateTerrainHeight(-7.5, 5.5, targetWorld, excavationsRef.current),
        5.5
      );
      const walkInVoid = buildWalkInVoidSanctuaryRig(
        targetWorld,
        initialVoidCenter,
        activeBuildingPresetRef.current
      );
      walkInVoid.root.visible = false; // Replaced by the Splitgate/Portal Reality-Tear & 36m×36m Square Portal Room!
      walkInVoidRigRef.current = walkInVoid;
      worldGroup.add(walkInVoid.root);
      worldGroup.add(walkInVoid.buildSpaceGhostGroup);

      // 1C-II. Build Reality-Tear Portal Shader Rig, Large 36m×36m×12m Square Portal Room & 100+ Procedural Maze Dimension Rig
      const wasPlayerInsideRoom =
        realityTearPortalRigRef.current?.isPlayerInsidePortalRoom ?? false;
      const wasPlayerInsideMaze =
        realityTearPortalRigRef.current?.isPlayerInsideMazeDimension ?? false;
      const wasInnerMazeOpen =
        realityTearPortalRigRef.current?.isInnerMazePortalOpen ?? false;
      const prevSelectedMazeIdx =
        realityTearPortalRigRef.current?.selectedMazeIndex ?? 0;
      const prevKnownMazes = realityTearPortalRigRef.current?.knownMazes;
      if (realityTearPortalRigRef.current) {
        realityTearPortalRigRef.current.portalRenderTarget.dispose();
      }
      const portalRig = buildRealityTearPortalAndSquareRoomRig(
        targetWorld,
        biodepthConfigRef.current.activeUniverseBoundary,
        activeBaseElementRef.current,
        portalRoomTierRef.current,
        biodepthConfigRef.current.portalRenderTargetSize
      );
      if (prevKnownMazes && prevKnownMazes.length >= 100) {
        portalRig.knownMazes = prevKnownMazes;
      }
      portalRig.selectedMazeIndex = Math.min(
        portalRig.knownMazes.length - 1,
        Math.max(0, prevSelectedMazeIdx)
      );
      portalRig.isPlayerInsidePortalRoom = wasPlayerInsideRoom;
      portalRig.isPlayerInsideMazeDimension = wasPlayerInsideMaze;
      portalRig.isInnerMazePortalOpen = wasInnerMazeOpen;
      portalRig.innerMazePortalProgress = wasInnerMazeOpen ? 1.0 : 0.0;
      if (portalRig.knownMazes[portalRig.selectedMazeIndex]) {
        portalRig.mazeDimensionRig.rebuildMazeGeometryForSpec(
          portalRig.knownMazes[portalRig.selectedMazeIndex]
        );
      }
      portalRig.isPortalOpenInWorld =
        voidBallModeRef.current === 'walk-in-sanctum-portal';
      portalRig.portalOpenProgress = portalRig.isPortalOpenInWorld ? 1.0 : 0.0;
      for (const mod of placedRoomModulesRef.current) {
        portalRig.placedModulesGroup.add(buildPlacedPortalRoomModuleMesh(mod));
      }
      applyCarvedRelicSurfaceToGroup(
        portalRig.squareRoomGroup,
        'carved-obsidian-runes'
      );

      // Build 3D Mindspace Customization Sanctuary (Shift + V Perspective Sink with 3 Live Example Figures)
      const mindspaceRig = buildMindspaceCustomization3DRig();
      mindspace3DRigRef.current = mindspaceRig;
      worldGroup.add(mindspaceRig.rootGroup);
      realityTearPortalRigRef.current = portalRig;
      worldGroup.add(portalRig.worldPortalGroup);
      worldGroup.add(portalRig.squareRoomGroup);
      worldGroup.add(portalRig.mazeDimensionRig.rootGroup);
      worldGroup.add(portalRig.matterNodesGroup);

      // 1C-III. Build 24-Plinth 3D Portal Room Museum & Armory Gallery Wing inside the 36m×36m Square Room
      const museumGalleryRig = new PortalRoomMuseumGalleryRig();
      museumGalleryRig.syncMountedItems(compendiumStateRef.current);
      portalMuseumGalleryRigRef.current = museumGalleryRig;
      worldGroup.add(museumGalleryRig.galleryRootGroup);

      // 1C-IV. Build Dimension-Specific 3D Grounding Anchor Monuments (18 Signature Archetypes across 5 Boundaries)
      groundingWorldRigRef.current.rebuildForBoundary(
        biodepthConfigRef.current.activeUniverseBoundary,
        targetWorld.seed,
        (x, z) =>
          evaluateTerrainHeight(x, z, targetWorld, excavationsRef.current)
      );
      worldGroup.add(groundingWorldRigRef.current.rootGroup);
      for (const gInst of groundingWorldRigRef.current.instances) {
        propCollidersRef.current.push({
          x: gInst.position.x,
          z: gInst.position.z,
          radius: gInst.spec.collisionRadius,
        });
        spatialCollisionSolver.registerCylinderProp(
          `grounding-${gInst.spec.id}`,
          gInst.position.x,
          gInst.position.y,
          gInst.position.z,
          gInst.spec.collisionRadius,
          3.4,
          true
        );
      }

      // 1C-V. Build Playable Zero-G In-Between Timeline Void Rift & Hub + ProceduralEnvironmentEngine + Absurd Timeline Decorator + Symbiote + Grapple + Body Mods
      const activeTimelineInit = voidBallEvolutionStateRef.current.activeTimeline;
      const envProfileInit =
        proceduralEnvironmentEngine.setActiveTimelineSpec(activeTimelineInit);
      setActiveTimelineLandform(
        activeTimelineInit.landformArchetype,
        activeTimelineInit.seedHash
      );
      targetWorld.palette.terrainLow =
        envProfileInit.colorPalette.lowlandBasinHex;
      targetWorld.palette.terrainMid =
        envProfileInit.colorPalette.midslopePrimaryHex;
      targetWorld.palette.terrainHigh =
        envProfileInit.colorPalette.highlandPlateauHex;
      targetWorld.palette.skyTop = envProfileInit.atmosphere.skyZenithHex;
      targetWorld.palette.skyHorizon = envProfileInit.atmosphere.skyHorizonHex;
      targetWorld.palette.fogColor = envProfileInit.atmosphere.fogTintHex;
      targetWorld.palette.accentColor =
        envProfileInit.colorPalette.mineralVeinEmissiveHex;
      proceduralEnvironmentEngine.applyAtmosphereAndShaderToScene({
        scene,
        hemiLight: hemiLightRef.current,
        keyLight: keyLightRef.current,
        rimLight: rimLightRef.current,
        zenithLight: zenithCausticLightRef.current,
        shaderUniforms: terrainPhaseUniforms,
      });

      if (!inBetweenVoidRigRef.current) {
        inBetweenVoidRigRef.current = new InBetweenTimelineVoidRig();
      }
      worldGroup.add(inBetweenVoidRigRef.current.rootGroup);

      absurdTimelineDecoratorRef.current.rebuildForTimeline(
        activeTimelineInit,
        targetWorld,
        (x, z) =>
          evaluateTerrainHeight(x, z, targetWorld, excavationsRef.current)
      );
      absurdTimelineDecoratorRef.current.rootGroup.visible =
        !superflatModeRef.current;
      groundingWorldRigRef.current.rootGroup.visible =
        !superflatModeRef.current;
      worldGroup.add(absurdTimelineDecoratorRef.current.rootGroup);
      worldGroup.add(sentientSymbioteRigRef.current.worldBeamGroup);
      worldGroup.add(grappleHookRigRef.current.rootGroup);

      bodyModsRigRef.current.attachToPlayerRigs({
        camera,
        fpLeftHandGroup: fpLeftHand,
        fpRightHandGroup: fpRightHand,
        tpCharacterGroup: builtAvatar.torsoGroup,
      });

      // 1D. Build The Forerooms ("4RumEs") 4D Directional Void, Omnidirectional 8-Cell Tesseract & Deeper-Than-Inside Meta-Locus
      const foreroomsRig = buildForeroomsTesseractRig(
        targetWorld,
        Math.max(4, favoritedManifoldsRef.current.length + epochCountRef.current)
      );
      foreroomsRigRef.current = foreroomsRig;
      worldGroup.add(foreroomsRig.group);

      // 1E. Build Conceptual Novelty Seed Visual Boundary & 3D Manifold Anchor Reliquary Rig
      const noveltyRig = buildConceptualNoveltyBoundaryRig();
      noveltyBoundaryRigRef.current = noveltyRig;
      worldGroup.add(noveltyRig.group);

      // 1F. Build Worldspace Form-Bleed & Separation Field + 6 Creepypasta / Abstract Art Anomalous Behavioral Objects
      const bleedRig = buildWorldspaceBleedAndAnomalyRig(
        targetWorld,
        excavationsRef.current
      );
      bleedRig.group.visible = !superflatModeRef.current;
      worldspaceBleedRigRef.current = bleedRig;
      worldGroup.add(bleedRig.group);

      // 2. High-Density Seamless Displaced & Micro-Mineable Terrain Heightfield Mesh (280x280m, 180x180 subdivisions)
      const size = 280;
      const segs = 180;
      const terrainGeo = new THREE.PlaneGeometry(size, size, segs, segs);
      terrainGeo.rotateX(-Math.PI / 2);

      const colors = new Float32Array(
        terrainGeo.attributes.position.count * 3
      );
      terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const terrainMat = createPhotorealisticTerrainMaterial(0.74, 0.12);
      const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
      terrainMesh.userData.skipAoShader = terrainMat;
      terrainMesh.receiveShadow = true;
      terrainMesh.castShadow = true;
      terrainMeshRef.current = terrainMesh;
      worldGroup.add(terrainMesh);

      deformTerrainGeometry(targetWorld, excavationsRef.current);

      // 2A-II. Build 3D Superflat Proving Ground Testing Stage (Rangefinder Rings, Target Dummies & Grapple Gantry)
      const superflatStage = buildSuperflatProvingGround3DStage();
      superflatStage.visible = superflatModeRef.current;
      superflatStageGroupRef.current = superflatStage;
      worldGroup.add(superflatStage);

      // 2B. Atmospheric Volumetric Sun Shaft Rig & Tactile Micro-Ground Cover
      const sunDir = new THREE.Vector3(38, 64, 28).normalize();
      const sunShaftRig = new AtmosphericSunShaftRig(
        sunDir,
        targetWorld.palette.sunColor
      );
      worldGroup.add(sunShaftRig.root);
      sunShaftRigRef.current = sunShaftRig;

      const groundCover = new MicroGroundCoverRig(
        targetWorld.palette.accentColor
      );
      groundCover.mesh.visible = !superflatModeRef.current;
      worldGroup.add(groundCover.mesh);
      microGroundCoverRef.current = groundCover;

      // 2C. InstancedMesh World Scatter Rig (144 Multi-Part Boulders, Lathe Crystal Spires & Beveled Collar Rings in 3 Draw Calls)
      instancedScatterRigRef.current.rebuildForSeed(
        targetWorld.seed,
        targetWorld.palette.terrainMid,
        targetWorld.palette.accentColor,
        (x, z) =>
          evaluateTerrainHeight(x, z, targetWorld, excavationsRef.current)
      );
      instancedScatterRigRef.current.rootGroup.visible =
        !superflatModeRef.current;
      worldGroup.add(instancedScatterRigRef.current.rootGroup);

      // 3. Container for Placed Cross-Dimensional Void Buildings & Evolutionary Ecology (Frontier Biomes, Tech Paddocks, Cave-Nests, Flora)
      const buildingsGroup = new THREE.Group();
      buildingsGroupRef.current = buildingsGroup;
      worldGroup.add(buildingsGroup);

      const evoGroup = new THREE.Group();
      evoGroup.visible = !superflatModeRef.current;
      evolutionaryEcologyGroupRef.current = evoGroup;
      worldGroup.add(evoGroup);

      // 3B. Procedural Map-Edge Sector Streaming Container & Origin Sector (0,0) World Mechanics
      const sectorsGroup = new THREE.Group();
      proceduralSectorsGroupRef.current = sectorsGroup;
      worldGroup.add(sectorsGroup);
      generatedSectorsRef.current.clear();
      sectorTerrainMeshesRef.current = [];
      organPickupsRef.current = [];

      const originSector = synthesizeProceduralTerrainSector(
        targetWorld.seed,
        0,
        0,
        targetWorld.palette
      );
      generatedSectorsRef.current.set('0,0', originSector);
      setActiveProceduralSectorsForTerrain([originSector]);

      const originRig = buildProceduralSectorCompleteRig(
        originSector,
        targetWorld,
        (x, z) =>
          evaluateTerrainHeight(x, z, targetWorld, excavationsRef.current)
      );
      // Origin sector already has the 280x280 central terrain mesh, so hide duplicate origin terrain tile while keeping its 3D Geyser, 4D Pylon & Lexicon Cradle!
      originRig.terrainMesh.visible = false;
      originRig.rootGroup.visible = !superflatModeRef.current;
      originRig.pylonRig.traverse((ch) => {
        if (ch.userData.isKineticRotor) kineticRotorsRef.current.push(ch);
      });
      sectorsGroup.add(originRig.rootGroup);

      // 4. Instantiate 18 Bespoke Procedural 3D Landmark Models with Collision Radii (pushed to horizon ring in Superflat Mode)
      const rng = createSeededRandom(targetWorld.seed + 505);
      const propCount = 18;
      for (let i = 0; i < propCount; i++) {
        const spec = targetWorld.propModels[i % targetWorld.propModels.length];
        const propMesh = buildWorldPropMesh(spec);

        const angle = (i / propCount) * Math.PI * 2 + (rng() - 0.5) * 0.35;
        const dist = superflatModeRef.current
          ? 78 + rng() * 26
          : 14 + rng() * 48;
        const px = Math.cos(angle) * dist;
        const pz = Math.sin(angle) * dist;
        const py = evaluateTerrainHeight(
          px,
          pz,
          targetWorld,
          excavationsRef.current
        );

        propMesh.position.set(px, py - 0.2, pz);
        propMesh.rotation.y = rng() * Math.PI * 2;
        const scaleVar = 0.8 + rng() * 0.55;
        propMesh.scale.setScalar(scaleVar);

        const basePropScale = Array.isArray(spec.scale)
          ? spec.scale[0]
          : Number(spec.scale) || 1.5;
        const propRadius = basePropScale * scaleVar * 1.15;
        propCollidersRef.current.push({
          x: px,
          z: pz,
          radius: propRadius,
        });
        spatialCollisionSolver.registerCylinderProp(
          `prop-${i}`,
          px,
          py - 0.2,
          pz,
          propRadius,
          Math.max(2.2, basePropScale * scaleVar * 2.4),
          true
        );

        propMesh.traverse((child) => {
          if (child.userData.isKineticRotor) {
            kineticRotorsRef.current.push(child);
          }
          if (child.userData.isPendulum) {
            pendulumsRef.current.push(child);
          }
        });

        worldPropsListRef.current.push({
          mesh: propMesh,
          baseAngle: angle,
          baseDist: dist,
          baseScale: scaleVar,
        });
        worldGroup.add(propMesh);
      }

      // 4B. Instantiate 6 Escher-Psychotropic Stepped Ziggurat & Seraphic Ophanim Eye-Wheel Phase-Change Monuments
      const escherPalette = [
        '#10b981', // Escher Jade
        '#3b82f6', // Cosmic Cobalt
        '#ec4899', // Seraphic Magenta
        '#eab308', // Sacred Gold
        '#a855f7', // Void Violet
        '#06b6d4', // Aether Cyan
      ];
      const goldFiligreeMat =
        sharedGeometryPool.getOrCreateNoiseBlendedArchitecturalMaterial({
          key: 'escher-monument-gold-filigree',
          baseColor: '#eab308',
          veinColor: '#fef08a',
          wearTintColor: '#78350f',
          emissiveColor: '#d97706',
          emissiveIntensity: 0.42,
          metalness: 0.9,
          roughness: 0.16,
          clearcoat: 0.85,
          wearIntensity: 0.44,
          wearScale: 1.05,
          veinDensity: 2.15,
          veinEmissiveStrength: 0.92,
        });

      for (let m = 0; m < 6; m++) {
        const mAngle = (m / 6) * Math.PI * 2 + 0.35;
        const mDist = superflatModeRef.current
          ? 64 + (m % 2) * 8
          : 23 + (m % 2) * 8;
        const mx = Math.cos(mAngle) * mDist;
        const mz = Math.sin(mAngle) * mDist;
        const my = evaluateTerrainHeight(
          mx,
          mz,
          targetWorld,
          excavationsRef.current
        );

        const monumentGroup = new THREE.Group();
        monumentGroup.position.set(mx, my - 0.15, mz);
        monumentGroup.rotation.y = -mAngle + Math.PI * 0.5;

        // Grounded Contact Shadow beneath each Stepped Monument
        const monShadow = sharedGeometryPool.createGroundedContactShadowMesh(
          2.25,
          0.58
        );
        monumentGroup.add(monShadow);

        // 1. Stepped Escher Ziggurat & Impossible Labyrinth Staircase Tiers (Shared Geometry + Procedural Noise-Blended Wear & Veins)
        for (let tier = 0; tier < 4; tier++) {
          const tSize = 2.6 - tier * 0.52;
          const tierCol = escherPalette[(m + tier) % escherPalette.length];
          const veinCol = escherPalette[(m + tier + 2) % escherPalette.length];
          const tierMat =
            sharedGeometryPool.getOrCreateNoiseBlendedArchitecturalMaterial({
              key: `escher-ziggurat-tier-${tierCol}-${veinCol}`,
              baseColor: tierCol,
              veinColor: veinCol,
              wearTintColor: '#f8fafc',
              emissiveColor: tierCol,
              emissiveIntensity: 0.22,
              roughness: 0.25,
              metalness: 0.45,
              clearcoat: 0.78,
              wearIntensity: 0.5,
              wearScale: 0.92,
              veinDensity: 1.85,
              veinEmissiveStrength: 0.88,
            });
          const tierGeo = sharedGeometryPool.getBeveledArmorPlateGeometry(
            tSize,
            tSize,
            0.48
          );
          const tierBlock = new THREE.Mesh(tierGeo, tierMat);
          tierBlock.rotation.x = -Math.PI / 2;
          tierBlock.position.set(0, tier * 0.48 + 0.24, 0);
          tierBlock.rotation.z = tier * 0.18;
          tierBlock.castShadow = true;
          tierBlock.receiveShadow = true;
          monumentGroup.add(tierBlock);

          // Golden Sacred-Geometry Trim Frame on each Ziggurat Tier
          const tierWireGeo = sharedGeometryPool.getOrCreateGeometry(
            `escher-ziggurat-wire-${tier}`,
            () => new THREE.BoxGeometry(tSize + 0.04, 0.5, tSize + 0.04)
          );
          const tierWire = new THREE.Mesh(
            tierWireGeo,
            new THREE.MeshBasicMaterial({
              color: '#fde047',
              wireframe: true,
              transparent: true,
              opacity: 0.45,
            })
          );
          tierWire.position.set(0, tier * 0.48 + 0.24, 0);
          tierWire.rotation.y = tier * 0.18;
          tierWire.userData.isSecondaryLodDetail = true;
          monumentGroup.add(tierWire);
        }

        // 2. Levitating Inverted Escher-Jade Pyramid-Eye Monolith & Counter-Rotating Ophanim Eye-Wheels
        const apexAssembly = new THREE.Group();
        apexAssembly.position.set(0, 3.35, 0);
        apexAssembly.userData.isKineticRotor = true;
        apexAssembly.userData.spinAxis = 'y';

        const pyrBaseCol = escherPalette[m % escherPalette.length];
        const pyrVeinCol = escherPalette[(m + 2) % escherPalette.length];
        const pyrMat =
          sharedGeometryPool.getOrCreateNoiseBlendedArchitecturalMaterial({
            key: `escher-apex-pyramid-${pyrBaseCol}-${pyrVeinCol}`,
            baseColor: pyrBaseCol,
            veinColor: pyrVeinCol,
            wearTintColor: '#fef08a',
            emissiveColor: pyrVeinCol,
            emissiveIntensity: 0.36,
            roughness: 0.2,
            metalness: 0.52,
            clearcoat: 0.9,
            wearIntensity: 0.42,
            wearScale: 1.15,
            veinDensity: 2.1,
            veinEmissiveStrength: 0.95,
          });
        const apexPyramidGeo = sharedGeometryPool.getOrCreateGeometry(
          'escher-apex-pyramid-cone',
          () => new THREE.ConeGeometry(0.85, 1.45, 4)
        );
        const apexPyramid = new THREE.Mesh(apexPyramidGeo, pyrMat);
        apexPyramid.rotation.x = m % 2 === 0 ? Math.PI : 0;
        apexAssembly.add(apexPyramid);

        // All-Seeing Ocular Core on the Pyramid Face
        const eyeSclera = new THREE.Mesh(
          sharedGeometryPool.getOrCreateGeometry(
            'escher-eye-sclera',
            () => new THREE.SphereGeometry(0.26, 12, 12)
          ),
          new THREE.MeshBasicMaterial({ color: '#f8fafc' })
        );
        eyeSclera.scale.set(1.35, 0.85, 0.5);
        eyeSclera.position.set(0, 0, 0.48);
        apexAssembly.add(eyeSclera);

        const eyeIris = new THREE.Mesh(
          sharedGeometryPool.getOrCreateGeometry(
            'escher-eye-iris',
            () => new THREE.SphereGeometry(0.15, 10, 10)
          ),
          new THREE.MeshBasicMaterial({
            color: escherPalette[(m + 3) % escherPalette.length],
          })
        );
        eyeIris.position.set(0, 0, 0.59);
        apexAssembly.add(eyeIris);

        const eyePupil = new THREE.Mesh(
          sharedGeometryPool.getOrCreateGeometry(
            'escher-eye-pupil',
            () => new THREE.SphereGeometry(0.075, 8, 8)
          ),
          new THREE.MeshBasicMaterial({ color: '#020617' })
        );
        eyePupil.position.set(0, 0, 0.66);
        apexAssembly.add(eyePupil);

        // Counter-Rotating Seraphic Ophanim Gold Astrolabe Ring
        const ophanimWheel = new THREE.Mesh(
          sharedGeometryPool.getOrCreateGeometry(
            'escher-ophanim-wheel-torus',
            () => new THREE.TorusGeometry(1.32, 0.045, 8, 32)
          ),
          goldFiligreeMat
        );
        ophanimWheel.userData.isKineticRotor = true;
        ophanimWheel.userData.spinAxis = 'z';
        apexAssembly.add(ophanimWheel);

        monumentGroup.add(apexAssembly);
        kineticRotorsRef.current.push(apexAssembly);
        kineticRotorsRef.current.push(ophanimWheel);

        propCollidersRef.current.push({
          x: mx,
          z: mz,
          radius: 1.55,
        });
        // Register 4-tier walkable stepped ziggurat monument in 3D Spatial Hash Grid
        spatialCollisionSolver.registerSteppedMonument(mx, my - 0.15, mz);

        escherMonumentsListRef.current.push({
          mesh: monumentGroup,
          baseAngle: mAngle,
          baseDist: mDist,
        });
        worldGroup.add(monumentGroup);
      }

      // 4C. Instantiate Dimension-Specific 3D Non-Euclidean Place Megastructures & Skyline Architecture
      const dimPlaceRig = buildDimensionalPlaceArchitecture(
        currentDimIndexRef.current,
        (x, z) => evaluateTerrainHeight(x, z, targetWorld, excavationsRef.current)
      );
      dimPlaceRig.group.visible = !superflatModeRef.current;
      dimensionalPlaceGroupRef.current = dimPlaceRig.group;
      for (const r of dimPlaceRig.rotors) {
        kineticRotorsRef.current.push(r);
      }
      if (!superflatModeRef.current) {
        for (let cIdx = 0; cIdx < dimPlaceRig.colliders.length; cIdx++) {
          const c = dimPlaceRig.colliders[cIdx];
          propCollidersRef.current.push(c);
          const cy = evaluateTerrainHeight(
            c.x,
            c.z,
            targetWorld,
            excavationsRef.current
          );
          spatialCollisionSolver.registerCylinderProp(
            `dim-place-${cIdx}`,
            c.x,
            cy,
            c.z,
            c.radius,
            4.2,
            true
          );
        }
      }
      for (const bld of placedBuildingsRef.current) {
        if (superflatModeRef.current && bld.id.startsWith('bldg-seed-monument-')) {
          continue;
        }
        const bGroundY =
          bld.y === 0
            ? evaluateTerrainHeight(
                bld.x,
                bld.z,
                targetWorld,
                excavationsRef.current
              ) - 0.25
            : bld.y;
        spatialCollisionSolver.registerPlacedBuilding(
          bld.id,
          bld.x,
          bGroundY,
          bld.z,
          bld.rotationY,
          bld.blocks
        );
      }
      worldGroup.add(dimPlaceRig.group);

      // 5. Spawn Initial Cohort of 9 Articulated 3D Entities & Assign Faction Creature AI Archetypes
      if (superflatModeRef.current) {
        // In Superflat Proving Ground mode, arrange initial entities in a clear semicircle lineup directly in front of player spawn (0, 0, 14) facing -Z!
        let spawnIdx = 0;
        const totalToSpawn = Math.max(1, targetWorld.entityBlueprints.length * 3);
        for (const bp of targetWorld.entityBlueprints) {
          for (let k = 0; k < 3; k++) {
            const normT =
              totalToSpawn > 1 ? spawnIdx / (totalToSpawn - 1) : 0.5;
            const arcAngle = (normT - 0.5) * 1.55; // Semicircle arc ahead of player
            const rowDist = spawnIdx % 2 === 0 ? 10.5 : 16.0;
            const sx = Math.sin(arcAngle) * rowDist;
            const sz = 14.0 - Math.cos(arcAngle) * rowDist;
            spawnEntityInstance(bp, new THREE.Vector3(sx, 0, sz));
            spawnIdx++;
          }
        }
      } else {
        for (const bp of targetWorld.entityBlueprints) {
          for (let k = 0; k < 3; k++) {
            spawnEntityInstance(bp);
          }
        }
      }
      creatureFactionAIDirectorRef.current.applyTimelineArchetypesToEntities(
        entitiesRef.current,
        voidBallEvolutionStateRef.current.activeTimeline
      );
      setDenizenSims([...denizenSimsRef.current]);

      // 5A-II. Build 3D Cultural Settlement, Noise-Shield Dome & Sims Plumbob Rig + Emergent Cultural/Sabotage Questline
      const evalH = (x: number, z: number) =>
        evaluateTerrainHeight(x, z, targetWorld, excavationsRef.current);
      const settlementRig = buildCulturalSettlement3DRig(
        targetWorld,
        currentDimIndexRef.current,
        evalH
      );
      settlementRig.rootGroup.visible = !superflatModeRef.current;
      culturalSettlementRigRef.current = settlementRig;
      worldGroup.add(settlementRig.rootGroup);

      const initialQuest = generateEmergentCulturalQuestline(
        targetWorld,
        currentDimIndexRef.current,
        denizenSimsRef.current,
        [settlementRig.centerPos.x, settlementRig.centerPos.z],
        questCounterRef.current
      );
      setActiveQuest(initialQuest);

      // 5A-III. Build Visceral Combat, Physical Object Grabbing & 3D Left-Hand Inventory Carousel Rig
      const combatRig = buildVisceralCombatAndGrabRig(targetWorld, evalH);
      visceralCombatRigRef.current = combatRig;
      worldGroup.add(combatRig.rootGroup);
      fpLeftHand.add(combatRig.handInventoryCarouselGroup);
      setHeldObjectName(null);

      // 5A-IV. Build Deep Granular Dirt-Like Particle & Micro-Scoop Excavation Rig + Seed Initial Soil Clods
      const dirtRig = buildGranularDirtExcavationRig();
      granularDirtRigRef.current = dirtRig;
      worldGroup.add(dirtRig.rootGroup);
      for (let s = 0; s < 6; s++) {
        const sa = (s / 6) * Math.PI * 2;
        const sx = Math.cos(sa) * 5.5;
        const sz = 10 + Math.sin(sa) * 5.5;
        const sy = evalH(sx, sz);
        triggerGranularDirtExcavationBurst({
          rig: dirtRig,
          hitPos: new THREE.Vector3(sx, sy, sz),
          world: targetWorld,
          scoopRadius: 1.15,
          scoopDepth: 0.45,
          evalHeight: evalH,
        });
      }

      // 5A-V. Build In-Engine 3D Character Creation Turntable Pedestal & 3D Animated Cutscene Stage Rig
      const stageRig = buildInEngine3DCharacterStageRig();
      characterStageRigRef.current = stageRig;
      worldGroup.add(stageRig.rootGroup);

      // 5B. Dynamic Procedural Outer Space Celestial Rig & Non-Spherical Planetary Geometries
      if (celestialCosmologyRigRef.current) {
        scene.remove(celestialCosmologyRigRef.current.root);
      }
      const cosmoRig = new CelestialCosmologyRig(currentDimIndexRef.current, targetWorld.archetype);
      scene.add(cosmoRig.root);
      celestialCosmologyRigRef.current = cosmoRig;

      // 5C. Master Void Walker Multi-Vehicle Traversal Rig (Hover-Bike, Spider-Walker, Rift-Glider, 5D Aether-Rider)
      if (gravityVehicleRigRef.current) {
        scene.remove(gravityVehicleRigRef.current.root);
      }
      const vY = evaluateTerrainHeight(4.5, 4.5, targetWorld, excavationsRef.current);
      const vehicleRig = new GravityVehicle5DRig([4.5, vY + 0.6, 4.5]);
      vehicleRig.setVehicleType(activeVehicleTypeRef.current);
      scene.add(vehicleRig.root);
      gravityVehicleRigRef.current = vehicleRig;

      // 5D. Dimensional Soil Particle Emitter Rig & Initial Ground PBR Overhaul
      if (dimensionalSoilParticleRigRef.current) {
        scene.remove(dimensionalSoilParticleRigRef.current.points);
      }
      const soilParticleRig = new DimensionalSoilParticleRig(currentDimIndexRef.current);
      scene.add(soilParticleRig.points);
      dimensionalSoilParticleRigRef.current = soilParticleRig;

      applyDimensionalGroundOverhaul(
        terrainMesh,
        sectorTerrainMeshesRef.current,
        currentDimIndexRef.current
      );

      // 5E. Procedural Excavation Shatter & Fracture Animation Rig
      if (excavationShatterRigRef.current) {
        scene.remove(excavationShatterRigRef.current.getRootGroup());
        excavationShatterRigRef.current.dispose();
      }
      const excavationShatterRig = new ExcavationShatterShaderRig();
      scene.add(excavationShatterRig.getRootGroup());
      excavationShatterRigRef.current = excavationShatterRig;

      // 5F. Bake Per-Vertex Ambient Occlusion & Indirect Lightmap Shaders across all environment geometry
      bakeVertexAmbientOcclusionAndLightmap(worldGroup, currentDimIndexRef.current);

      // 6. Continuous Spatiotemporal POV State Machinery:
      // Keep time and momentum flowing across world/dimension transitions rather than popping the character POV!
      const ex = explorerStateRef.current;
      const povFlow = povFlowStateRef.current;
      const prevVisualY = ex.pos.y + povFlow.elevationSpringOffset;
      const isCurrentlyInsidePortalRoom = Boolean(
        realityTearPortalRigRef.current?.isPlayerInsidePortalRoom
      );
      const newGroundY = isCurrentlyInsidePortalRoom
        ? evaluatePortalRoomInteriorGroundAndGravity(
            ex.pos.x,
            ex.pos.z,
            ex.pos.y,
            placedRoomModulesRef.current,
            portalRoomGravityModeRef.current
          ).groundY
        : evaluateTerrainHeight(
            ex.pos.x,
            ex.pos.z,
            targetWorld,
            excavationsRef.current
          );

      if (!povFlow.initialized) {
        ex.pos.y = newGroundY;
        povFlow.smoothVisualY = newGroundY;
        povFlow.elevationSpringOffset = 0;
        povFlow.continuityBlendAlpha = 0;
        povFlow.initialized = true;
      } else {
        // Absorb the elevation difference into the critically-damped spring offset so the camera & avatar glide smoothly without popping!
        ex.pos.y = newGroundY;
        povFlow.elevationSpringOffset = THREE.MathUtils.clamp(
          prevVisualY - newGroundY,
          -12.0,
          12.0
        );
        povFlow.continuityBlendAlpha = 1.0;
        // Preserve horizontal flow momentum instead of zeroing velocity
        ex.vel.x *= 0.88;
        ex.vel.z *= 0.88;
        ex.vel.y = Math.max(-2.0, ex.vel.y * 0.5);
      }
      povFlow.lastBuiltWorldId = targetWorld.id;
      povFlow.lastSkinTopology =
        targetWorld.playableCharacter.skinTopology ?? '';
    },
    [deformTerrainGeometry, spawnEntityInstance]
  );

  // Rebuild world environment when superflatMode toggles so the flat proving ground or procedural mountains update immediately
  useEffect(() => {
    setActiveSuperflatMode(superflatMode);
    if (sceneRef.current && worldRef.current) {
      rebuildWorldEnvironment(worldRef.current);
    }
  }, [superflatMode, rebuildWorldEnvironment]);

  // Re-deform terrain mesh whenever `excavations` list updates, absorbing any underfoot crater delta into the POV spring so mining never pops the camera
  useEffect(() => {
    const ex = explorerStateRef.current;
    const povFlow = povFlowStateRef.current;
    const prevGround = ex.pos.y;
    deformTerrainGeometry(world, excavations);
    const nextGround = evaluateTerrainHeight(
      ex.pos.x,
      ex.pos.z,
      world,
      excavations
    );
    if (ex.grounded && Math.abs(prevGround - nextGround) > 0.01) {
      povFlow.elevationSpringOffset += prevGround - nextGround;
      ex.pos.y = nextGround;
    }
  }, [world.id, excavations, deformTerrainGeometry]);

  // Dynamically overhaul terrain materials, lighting, sky dome, outer space cosmology, hyperbolic geometry, and soil particles when dimension spectrum changes
  useEffect(() => {
    currentDimIndexRef.current = dimIndex;
    DIMENSION_BRANCH_REGISTRY.registerDimensionVisit(dimIndex);
    applyDimensionalGroundOverhaul(
      terrainMeshRef.current,
      sectorTerrainMeshesRef.current,
      dimIndex
    );
    celestialCosmologyRigRef.current?.setDimension(dimIndex, worldRef.current.archetype);
    dimensionalSoilParticleRigRef.current?.setDimension(dimIndex);

    // Apply physically calibrated studio lighting, atmospheric fog, and sky dome for the active dimension
    const scene = sceneRef.current;
    if (scene) {
      if (rendererRef.current) {
        applyDimensionalLightingAndAtmosphere(
          scene,
          rendererRef.current,
          {
            hemiLight: hemiLightRef.current,
            keyLight: keyLightRef.current,
            rimLight: rimLightRef.current,
            zenithCausticLight: zenithCausticLightRef.current,
          },
          sunShaftRigRef.current,
          dimIndex
        );
      } else {
        const lightSpec = resolveDimensionalLightingSpec(dimIndex);
        scene.background = new THREE.Color(lightSpec.skyColor);
        scene.fog = new THREE.FogExp2(lightSpec.fogColor, lightSpec.fogDensity);
        if (hemiLightRef.current) {
          hemiLightRef.current.color.set(lightSpec.skyColor);
          hemiLightRef.current.groundColor.set(lightSpec.groundHemiColor);
          hemiLightRef.current.intensity = lightSpec.hemiIntensity;
        }
        if (keyLightRef.current) {
          keyLightRef.current.color.set(lightSpec.sunColor);
          keyLightRef.current.intensity = lightSpec.sunIntensity;
        }
        if (rimLightRef.current) {
          rimLightRef.current.color.set(lightSpec.rimColor);
          rimLightRef.current.intensity = lightSpec.rimIntensity;
        }
        if (zenithCausticLightRef.current) {
          zenithCausticLightRef.current.color.set(lightSpec.causticZenithColor);
          zenithCausticLightRef.current.intensity = lightSpec.causticIntensity;
        }
      }
    }

    // Re-evaluate terrain deformation with the new dimension's landform architecture & hyperbolic Riemannian curvature
    if (worldRef.current) {
      const targetWorld = worldRef.current;
      const ex = explorerStateRef.current;
      const prevGround = evaluateTerrainHeight(
        ex.pos.x,
        ex.pos.z,
        targetWorld,
        excavationsRef.current
      );
      setActiveDimensionIndex(dimIndex);
      deformTerrainGeometry(targetWorld, excavationsRef.current);
      const lightSpec = resolveDimensionalLightingSpec(dimIndex);
      const evalH = (x: number, z: number) =>
        evaluateTerrainHeight(
          x,
          z,
          targetWorld,
          excavationsRef.current,
          lightSpec.hyperbolicK
        );
      const nextGround = evalH(ex.pos.x, ex.pos.z);
      povFlowStateRef.current.elevationSpringOffset += prevGround - nextGround;
      ex.pos.y = nextGround;

      // Dynamically morph & reposition world props, Escher monuments, buildings, and dimension-specific 3D place architecture!
      const dimPhaseAngle = (dimIndex - 1.0) * 0.68;
      const dimRadialStretch = 1.0 + Math.sin((dimIndex - 1.0) * 1.15) * 0.22;

      for (let i = 0; i < worldPropsListRef.current.length; i++) {
        const item = worldPropsListRef.current[i];
        if (!item?.mesh) continue;
        const newAngle = item.baseAngle + dimPhaseAngle * (i % 2 === 0 ? 1 : -1);
        const newDist = Math.max(12, item.baseDist * dimRadialStretch);
        const px = Math.cos(newAngle) * newDist;
        const pz = Math.sin(newAngle) * newDist;
        const py = evalH(px, pz);
        item.mesh.position.set(px, py - 0.2, pz);
        item.mesh.rotation.y = newAngle + dimPhaseAngle;
        const scaleMorph =
          item.baseScale * (0.85 + 0.3 * Math.sin(dimIndex * 1.3 + i));
        item.mesh.scale.setScalar(scaleMorph);
      }

      for (let m = 0; m < escherMonumentsListRef.current.length; m++) {
        const mon = escherMonumentsListRef.current[m];
        if (!mon?.mesh) continue;
        const newAngle = mon.baseAngle - dimPhaseAngle * 0.75;
        const newDist = mon.baseDist * (0.92 + 0.18 * Math.cos(dimIndex + m));
        const mx = Math.cos(newAngle) * newDist;
        const mz = Math.sin(newAngle) * newDist;
        const my = evalH(mx, mz);
        mon.mesh.position.set(mx, my - 0.15, mz);
        mon.mesh.rotation.y = -newAngle + Math.PI * 0.5;
      }

      // Snap placed buildings & grounding monuments to the new dimension's 3D landform height
      if (buildingsGroupRef.current) {
        for (let b = 0; b < buildingsGroupRef.current.children.length; b++) {
          const bMesh = buildingsGroupRef.current.children[b];
          const bSpec = placedBuildingsRef.current[b];
          if (bMesh && bSpec && bSpec.y === 0) {
            bMesh.position.y = evalH(bMesh.position.x, bMesh.position.z) - 0.25;
          }
        }
      }
      for (const gInst of groundingWorldRigRef.current.instances) {
        if (!gInst?.position) continue;
        const gy = evalH(gInst.position.x, gInst.position.z);
        gInst.position.y = gy;
        if (gInst.group) {
          gInst.group.position.y = gy;
        }
      }

      // Rebuild the Dimension-Specific 3D Non-Euclidean Place Megastructures & Skyline Architecture
      if (worldGroupRef.current) {
        if (dimensionalPlaceGroupRef.current) {
          worldGroupRef.current.remove(dimensionalPlaceGroupRef.current);
          dimensionalPlaceGroupRef.current.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
              obj.geometry.dispose();
              if (Array.isArray(obj.material)) {
                obj.material.forEach((m) => m.dispose());
              } else {
                obj.material.dispose();
              }
            }
          });
        }
        const nextPlaceRig = buildDimensionalPlaceArchitecture(dimIndex, evalH);
        nextPlaceRig.group.visible = !superflatModeRef.current;
        dimensionalPlaceGroupRef.current = nextPlaceRig.group;
        for (const r of nextPlaceRig.rotors) {
          kineticRotorsRef.current.push(r);
        }
        worldGroupRef.current.add(nextPlaceRig.group);
      }
    }
  }, [dimIndex, deformTerrainGeometry]);

  // Re-sync placed buildings meshes whenever `placedBuildings` or `superflatMode` updates
  useEffect(() => {
    const bGroup = buildingsGroupRef.current;
    if (!bGroup) return;
    while (bGroup.children.length > 0) {
      const ch = bGroup.children[0];
      bGroup.remove(ch);
      ch.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
          if (!obj.geometry.userData?.isSharedPooledGeometry) {
            obj.geometry.dispose();
          }
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    }
    for (const bld of placedBuildings) {
      if (superflatMode && bld.id.startsWith('bldg-seed-monument-')) {
        continue;
      }
      const mesh = buildPlacedBuildingMesh(bld.blocks);
      const groundY =
        bld.y === 0
          ? evaluateTerrainHeight(
              bld.x,
              bld.z,
              world,
              excavationsRef.current
            ) - 0.25
          : bld.y;
      mesh.position.set(bld.x, groundY, bld.z);
      mesh.rotation.y = bld.rotationY;
      bGroup.add(mesh);
      spatialCollisionSolver.registerPlacedBuilding(
        bld.id,
        bld.x,
        groundY,
        bld.z,
        bld.rotationY,
        bld.blocks
      );
    }
    bakeVertexAmbientOcclusionAndLightmap(bGroup, currentDimIndexRef.current);
  }, [placedBuildings, world.id, superflatMode]);

  // Re-sync 3D Frontier Complexes, High-Elevation Cave-Nests & Defecation-Fertilized Flora Clusters
  useEffect(() => {
    const eGroup = evolutionaryEcologyGroupRef.current;
    if (!eGroup) return;
    while (eGroup.children.length > 0) {
      const ch = eGroup.children[0];
      eGroup.remove(ch);
      ch.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    }
    for (const site of frontierComplexes) {
      const mesh = buildFrontierComplexMesh(site);
      const gy = evaluateTerrainHeight(
        site.x,
        site.z,
        world,
        excavationsRef.current
      );
      mesh.position.set(site.x, gy, site.z);
      eGroup.add(mesh);
    }
    for (const cave of caveNestComplexes) {
      const mesh = buildCaveNestComplexMesh(cave);
      const gy = evaluateTerrainHeight(
        cave.x,
        cave.z,
        world,
        excavationsRef.current
      );
      mesh.position.set(cave.x, gy, cave.z);
      eGroup.add(mesh);
    }
    for (const patch of fertilizedFloraPatches) {
      const mesh = buildFertilizedFloraPatchMesh(patch);
      const gy = evaluateTerrainHeight(
        patch.x,
        patch.z,
        world,
        excavationsRef.current
      );
      mesh.position.set(patch.x, gy, patch.z);
      eGroup.add(mesh);
    }
    bakeVertexAmbientOcclusionAndLightmap(eGroup, currentDimIndexRef.current);
  }, [
    frontierComplexes,
    caveNestComplexes,
    fertilizedFloraPatches,
    world.id,
    world,
  ]);

  // Helper callbacks for 3-State Left-Hand Void Ball, Reality-Tear Portal, Square Room Upgrades & Multiversal Matters
  const handleChangeVoidBallMode = useCallback(
    (nextMode: VoidBallActivationMode) => {
      setVoidBallMode(nextMode);
      voidBallModeRef.current = nextMode;
      const combatRig = visceralCombatRigRef.current;
      if (combatRig) {
        combatRig.handInventoryCarouselGroup.visible =
          nextMode === 'hand-inventory-bloom';
      }
      const portalRig = realityTearPortalRigRef.current;
      const ex = explorerStateRef.current;
      if (portalRig) {
        if (nextMode === 'walk-in-sanctum-portal') {
          if (!portalRig.isPlayerInsidePortalRoom) {
            const forwardDist = 4.2;
            const targetX = ex.pos.x - Math.sin(ex.yaw) * forwardDist;
            const targetZ = ex.pos.z - Math.cos(ex.yaw) * forwardDist;
            const groundY = evaluateTerrainHeight(
              targetX,
              targetZ,
              worldRef.current,
              excavationsRef.current
            );
            portalRig.worldPortalPos.set(targetX, groundY, targetZ);
            portalRig.worldPortalYaw = ex.yaw;
          }
          portalRig.isPortalOpenInWorld = true;
          setLastCombatBanner(
            `🌀 Tore Open Reality-Tear Portal ahead! Look through the tear to see your 36m×36m Square Portal Room or walk inside!`
          );
        } else {
          portalRig.isPortalOpenInWorld = false;
        }
      }
      harmonicSoundscape.triggerChime(
        nextMode === 'dormant-clenched' ? 1 : 3,
        0.55
      );
    },
    []
  );

  const handleEnterOrExitPortalRoomNow = useCallback(() => {
    const portalRig = realityTearPortalRigRef.current;
    const ex = explorerStateRef.current;
    if (!portalRig) return;

    if (!portalRig.isPlayerInsidePortalRoom) {
      portalRig.savedExteriorPos.copy(ex.pos);
      portalRig.savedExteriorYaw = ex.yaw;
      portalRig.isPlayerInsidePortalRoom = true;
      portalRig.isPortalOpenInWorld = true;
      portalRig.portalOpenProgress = 1.0;
      portalRig.portalTeleportCooldown = 1.2;
      setVoidBallMode('walk-in-sanctum-portal');
      voidBallModeRef.current = 'walk-in-sanctum-portal';
      ex.pos.set(
        PORTAL_ROOM_ORIGIN.x,
        PORTAL_ROOM_ORIGIN.y,
        PORTAL_ROOM_ORIGIN.z + 13.2
      );
      ex.vel.set(0, 0, 0);
      ex.yaw = 0; // Face North across the 36m×36m Square Room
      povFlowStateRef.current.smoothVisualY = PORTAL_ROOM_ORIGIN.y;
      povFlowStateRef.current.elevationSpringOffset = 0;
      setLastCombatBanner(
        `🚪 Entered 36m×36m Square Portal Room (${PORTAL_ROOM_TIERS[portalRig.currentTier].name})! Walk to North Crucible or press [K] to craft.`
      );
    } else {
      portalRig.isPlayerInsidePortalRoom = false;
      portalRig.portalTeleportCooldown = 1.2;
      const outX = portalRig.savedExteriorPos.x;
      const outZ = portalRig.savedExteriorPos.z;
      const outY = evaluateTerrainHeight(
        outX,
        outZ,
        worldRef.current,
        excavationsRef.current
      );
      ex.pos.set(outX, outY, outZ);
      ex.vel.set(0, 0, 0);
      povFlowStateRef.current.smoothVisualY = outY;
      povFlowStateRef.current.elevationSpringOffset = 0;
      setLastCombatBanner(
        `⇪ Stepped out of Square Portal Room back into ${worldRef.current.name}`
      );
    }
    harmonicSoundscape.triggerArchitecturalChord(3);
  }, []);

  const handleUpgradePortalRoomTier = useCallback(() => {
    const curTier = portalRoomTierRef.current;
    if (curTier >= 3) return;
    const nextTier = (curTier + 1) as PortalRoomTierId;
    const nextSpec = PORTAL_ROOM_TIERS[nextTier];

    setMatterInventory((prev) => {
      const next = { ...prev };
      for (const [mId, req] of Object.entries(nextSpec.costMatters) as [
        MultiversalMatterId,
        number
      ][]) {
        if ((next[mId] ?? 0) < (req ?? 0)) return prev;
        next[mId] = (next[mId] ?? 0) - (req ?? 0);
      }
      return next;
    });

    setPortalRoomTier(nextTier);
    portalRoomTierRef.current = nextTier;
    const portalRig = realityTearPortalRigRef.current;
    if (portalRig) {
      portalRig.currentTier = nextTier;
      portalRig.tier1ConduitsGroup.visible = nextTier >= 1;
      portalRig.tier2BiodepthDomeGroup.visible = nextTier >= 2;
      portalRig.tier3NexusBaysGroup.visible = nextTier >= 3;
    }
    setDevianceXP((xp) => xp + 3);
    setLastCombatBanner(
      `⚡ Upgraded 36m×36m Square Portal Room to ${nextSpec.name} (+3 Deviance XP)!`
    );
    harmonicSoundscape.triggerArchitecturalChord(4);
  }, []);

  const handleCraftCrucibleRecipe = useCallback(
    (recipe: DimensionalCrucibleItemRecipe) => {
      setMatterInventory((prev) => {
        const next = { ...prev };
        for (const [mId, req] of Object.entries(recipe.matterCosts) as [
          MultiversalMatterId,
          number
        ][]) {
          if ((next[mId] ?? 0) < (req ?? 0)) return prev;
          next[mId] = (next[mId] ?? 0) - (req ?? 0);
        }
        return next;
      });

      setUnlockedCrucibleRecipeIds((prev) =>
        prev.includes(recipe.id) ? prev : [...prev, recipe.id]
      );

      const gs = somaticGraftStateRef.current;
      if (recipe.category === 'somatic-biodepth-graft') {
        gs.speedBoostMultiplier = Number(
          Math.min(1.85, gs.speedBoostMultiplier + 0.14).toFixed(2)
        );
        gs.jumpBoostMultiplier = Number(
          Math.min(1.9, gs.jumpBoostMultiplier + 0.14).toFixed(2)
        );
      }
      setDevianceXP((xp) => xp + 2);
      setLastCombatBanner(
        `⚡ Forged "${recipe.name}" in Dimensional Crucible! (${recipe.gameplayEffectSummary})`
      );
      harmonicSoundscape.triggerArchitecturalChord(4);
    },
    []
  );

  const handlePlacePortalRoomModule = useCallback(
    (kind?: PortalRoomModuleKind) => {
      const portalRig = realityTearPortalRigRef.current;
      if (!portalRig) return;
      const targetKind = kind ?? portalRig.activeModuleKind;
      const blueprint =
        PORTAL_ROOM_MODULE_BLUEPRINTS.find((b) => b.kind === targetKind) ??
        PORTAL_ROOM_MODULE_BLUEPRINTS[0];

      setMatterInventory((prev) => {
        const have = prev[blueprint.costMatter] ?? 0;
        if (have < blueprint.costAmount) return prev;
        return {
          ...prev,
          [blueprint.costMatter]: have - blueprint.costAmount,
        };
      });

      const ex = explorerStateRef.current;
      let gx = 0;
      let gz = 0;
      if (portalRig.isPlayerInsidePortalRoom) {
        const rawX =
          ex.pos.x - PORTAL_ROOM_ORIGIN.x - Math.sin(ex.yaw) * 4.0;
        const rawZ =
          ex.pos.z - PORTAL_ROOM_ORIGIN.z - Math.cos(ex.yaw) * 4.0;
        gx = Math.max(-14, Math.min(14, Math.round(rawX / 2) * 2));
        gz = Math.max(-14, Math.min(14, Math.round(rawZ / 2) * 2));
      } else {
        const idx = placedRoomModulesRef.current.length;
        gx = -8 + (idx % 5) * 4;
        gz = -4 + Math.floor(idx / 5) * 4;
      }

      const boundary =
        DIFFERENTIAL_UNIVERSE_BOUNDARIES[
          biodepthConfigRef.current.activeUniverseBoundary
        ];
      const newMod: PlacedPortalRoomModule = {
        id: `room-mod-${Date.now()}`,
        kind: targetKind,
        name: blueprint.name,
        gx,
        gz,
        rotationY: ex.yaw,
        accentHex: boundary.primaryAccentHex,
      };

      setPlacedRoomModules((prev) => {
        const next = [...prev, newMod];
        placedRoomModulesRef.current = next;
        return next;
      });
      portalRig.placedModulesGroup.add(buildPlacedPortalRoomModuleMesh(newMod));
      setLastCombatBanner(
        `🏛️ Installed ${blueprint.name} at Square Room Grid (${gx}m, ${gz}m)!`
      );
      harmonicSoundscape.triggerChime(3, 0.65);
    },
    []
  );

  // One-Click Furnish Complete 6-Wing Interior Layout inside the 36m×36m Square Portal Room
  const handleInstallCompleteWingLayout = useCallback(() => {
    const rig = realityTearPortalRigRef.current;
    if (!rig) return;
    while (rig.placedModulesGroup.children.length > 0) {
      rig.placedModulesGroup.remove(rig.placedModulesGroup.children[0]);
    }
    const fullWings: PlacedPortalRoomModule[] = [
      ...DEFAULT_PORTAL_ROOM_STARTER_MODULES,
      {
        id: `wing-armory-${Date.now()}`,
        kind: 'interior-voidwalker-armory-vault',
        name: 'Cyber-Occult Armory & Chain Reliquary',
        gx: 0,
        gz: 8,
        rotationY: 0,
        accentHex: '#ff2a6d',
      },
    ];
    for (const mod of fullWings) {
      rig.placedModulesGroup.add(buildPlacedPortalRoomModuleMesh(mod));
    }
    placedRoomModulesRef.current = fullWings;
    setPlacedRoomModules(fullWings);
    setLastCombatBanner(
      '🏛️ Furnished all 6 Walkable Interior Wings (Mezzanine, Sanctum, Liminal Corridor, Foundry, Command Bridge, Voidwalker Armory)!'
    );
    harmonicSoundscape.triggerArchitecturalChord(4);
  }, []);

  const handleRemoveLastPortalRoomModule = useCallback(() => {
    const rig = realityTearPortalRigRef.current;
    setPlacedRoomModules((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.slice(0, -1);
      placedRoomModulesRef.current = next;
      if (rig && rig.placedModulesGroup.children.length > 0) {
        rig.placedModulesGroup.remove(
          rig.placedModulesGroup.children[
            rig.placedModulesGroup.children.length - 1
          ]
        );
      }
      return next;
    });
    setLastCombatBanner('↩ Removed last placed Portal Room interior section');
    harmonicSoundscape.triggerChime(1, 0.35);
  }, []);

  const handleChangePortalRoomGravityMode = useCallback(
    (mode: PortalRoomGravityMode) => {
      setPortalRoomGravityMode(mode);
      portalRoomGravityModeRef.current = mode;
      setPortalTelemetry((prev) => ({
        ...prev,
        portalRoomGravityMode: mode,
      }));
      setLastCombatBanner(
        mode === 'stabilized-1g'
          ? '⚖️ Portal Room Gravity locked to 1.0G Standard Architecture'
          : mode === 'low-g-architect'
          ? '🪶 Portal Room Gravity set to 0.38G Low-G Upper-Tier Architect Mode'
          : '🌌 Portal Room Gravity coupled to Active Exterior Dimension'
      );
      harmonicSoundscape.triggerChime(2, 0.45);
    },
    []
  );

  const handleSelectUniverseBoundary = useCallback(
    (boundaryId: DifferentialUniverseBoundaryId) => {
      const spec = DIFFERENTIAL_UNIVERSE_BOUNDARIES[boundaryId];
      onUpdateBiodepthConfig?.({
        ...biodepthConfigRef.current,
        activeUniverseBoundary: boundaryId,
      });
      const portalRig = realityTearPortalRigRef.current;
      if (portalRig) {
        portalRig.matterNodes = buildExteriorMultiversalMatterNodes(
          worldRef.current,
          boundaryId,
          excavationsRef.current,
          portalRig.matterNodesGroup
        );
      }
      groundingWorldRigRef.current.rebuildForBoundary(
        boundaryId,
        worldRef.current.seed,
        (x, z) =>
          evaluateTerrainHeight(
            x,
            z,
            worldRef.current,
            excavationsRef.current
          )
      );
      const bIdx = ALL_DIFFERENTIAL_BOUNDARY_IDS.indexOf(boundaryId);
      if (onChangeDimension && bIdx >= 0) {
        onChangeDimension(bIdx + 1);
      }
      setLastCombatBanner(
        `Shifted Universe Boundary to ${spec.name} · Spawned ${spec.name} Grounding Monuments`
      );
      harmonicSoundscape.triggerArchitecturalChord(2);
    },
    [onUpdateBiodepthConfig, onChangeDimension]
  );

  // Synchronize Realistic Human Default Character vs. 5 Special Transformation Modes whenever Mindspace/Morph config changes
  useEffect(() => {
    syncCharacterMorphAndHumanAppearance({
      avatarRig: avatarRigRef.current,
      fpLeftHandRig: fpLeftHandRigRef.current,
      fpRightHandRig: fpRightHandRigRef.current,
      config: mindspaceDialConfig,
    });
  }, [
    mindspaceDialConfig.activeMorphMode,
    mindspaceDialConfig.humanSkinToneId,
    mindspaceDialConfig.humanGloveStyle,
    mindspaceDialConfig.hudTheme,
  ]);

  // Compendium Loadout, Grounding Anchor Attunement & Portal Room Museum Handlers
  const handleEquipRightHandItem = useCallback((itemId: string) => {
    setCompendiumState((prev) => {
      const next = { ...prev, equippedRightHandId: itemId };
      compendiumStateRef.current = next;
      const item = resolveCompendiumItemById(itemId, next);
      fpSpringRigRef.current.setSheathed(false);
      grappledEnemyRef.current = null;
      setGrappledEnemyName(null);
      fpSpringRigRef.current.equipWeaponOnHandRigs(
        item,
        fpRightHandRigRef.current,
        avatarRigRef.current?.rightHandToolRig
      );
      // Trigger Choreographed Right-Hand Pull-From-Void-Ball Animation!
      voidWeaponPullStateRef.current = {
        active: true,
        timerSec: 0.72,
        durationSec: 0.72,
        pulledItemName: item.name,
        pulledItemSubType: item.subTypeLabel,
        accentHex: item.visualSpec.accentEmissiveHex,
      };
      setWeaponCombatState(fpSpringRigRef.current.getCombatState());
      setLastCombatBanner(
        `✋ Pulled "${item.name}" from Left-Palm Void Singularity (${item.subTypeLabel} · DMG ${item.stats.damage} · EXCAV ${item.stats.excavationPower}x)`
      );
      return next;
    });
    harmonicSoundscape.triggerChime(3, 0.55);
  }, []);

  const handlePullWeaponFromVoidBall = useCallback(
    (item: DimensionalItemDefinition) => {
      handleEquipRightHandItem(item.id);
    },
    [handleEquipRightHandItem]
  );

  const handlePullToolFromVoidBall = useCallback(
    (tool: PlayerInteractionTool) => {
      setDialOverrideTool(tool);
      activeToolRef.current = tool;
      onSelectTool?.(tool);
      voidWeaponPullStateRef.current = {
        active: true,
        timerSec: 0.62,
        durationSec: 0.62,
        pulledItemName: tool.replace(/-/g, ' ').toUpperCase(),
        pulledItemSubType: 'Substrate Tool',
        accentHex: '#f59e0b',
      };
      weaponHandControllerRef.current.triggerToolActionAnimation(tool);
      setLastCombatBanner(
        `✋ Pulled Substrate Tool [${tool.replace(/-/g, ' ').toUpperCase()}] from Left-Palm Void Ball!`
      );
      harmonicSoundscape.triggerChime(2, 0.5);
    },
    [onSelectTool]
  );

  const handleCycleMazeSelection = useCallback((delta: -1 | 1) => {
    const portalRig = realityTearPortalRigRef.current;
    if (!portalRig) return;
    const total = portalRig.knownMazes.length;
    portalRig.selectedMazeIndex =
      (portalRig.selectedMazeIndex + delta + total) % total;
    const selMaze = portalRig.knownMazes[portalRig.selectedMazeIndex];
    if (selMaze) {
      portalRig.mazeDimensionRig.rebuildMazeGeometryForSpec(selMaze);
      const themeSpec = MAZE_ENTITY_THEME_CATALOG[selMaze.horrorArchetypeId];
      setLastCombatBanner(
        `🌀 Selected ${selMaze.code} "${selMaze.title}" [${
          portalRig.selectedMazeIndex + 1
        }/${total}] · Entity: ${themeSpec.entityName} · Assimilation: ${Math.round(
          selMaze.assimilationPct
        )}%`
      );
      harmonicSoundscape.triggerChime(
        (portalRig.selectedMazeIndex % 5) + 1,
        0.5
      );
    }
  }, []);

  const handleReloadActiveWeapon = useCallback(() => {
    const ex = explorerStateRef.current;
    const horizSpd = Math.hypot(ex.vel.x, ex.vel.z);
    const eqItem = resolveCompendiumItemById(
      compendiumStateRef.current.equippedRightHandId,
      compendiumStateRef.current
    );
    const res = fpSpringRigRef.current.triggerMovementAdaptiveReload(
      horizSpd,
      ex.grounded,
      isStealthCrouchingRef.current
    );
    setWeaponCombatState(fpSpringRigRef.current.getCombatState());

    if (res.started) {
      // Eject a physical 3D spent brass/crystal energy cell casing that arcs and bounces on the terrain!
      const scene = sceneRef.current;
      const cam = cameraRef.current;
      if (scene && cam) {
        const casingGroup = new THREE.Group();
        const shellMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.022, 0.022, 0.095, 10),
          new THREE.MeshStandardMaterial({
            color: eqItem.visualSpec.secondaryHex,
            metalness: 0.9,
            roughness: 0.2,
          })
        );
        shellMesh.rotation.z = Math.PI / 2;
        casingGroup.add(shellMesh);

        const residualGlow = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.018, 0),
          new THREE.MeshBasicMaterial({
            color: eqItem.visualSpec.accentEmissiveHex,
          })
        );
        casingGroup.add(residualGlow);

        const ejectOrigin = ex.pos
          .clone()
          .add(new THREE.Vector3(0, 1.45, 0));
        const rightVec = new THREE.Vector3(
          Math.cos(ex.yaw),
          0,
          -Math.sin(ex.yaw)
        );
        casingGroup.position.copy(ejectOrigin);
        scene.add(casingGroup);

        projectilesRef.current.push({
          mesh: casingGroup,
          pos: ejectOrigin,
          vel: rightVec
            .multiplyScalar(3.6 + Math.random() * 2.2)
            .add(new THREE.Vector3(0, 3.8 + Math.random() * 1.5, 0)),
          age: 0,
          maxAge: 3.5,
          isSpentCasing: true,
        });
      }

      setLastCombatBanner(
        `🔄 Reloading ${eqItem.name} — ${res.label}!`
      );
      harmonicSoundscape.triggerChime(4, 0.6);
    } else if (
      fpSpringRigRef.current.currentAmmo >= fpSpringRigRef.current.maxMagazine
    ) {
      setLastCombatBanner(
        `${eqItem.name} Magazine Full (${fpSpringRigRef.current.currentAmmo}/${fpSpringRigRef.current.maxMagazine} Cells)`
      );
    }
  }, []);

  const handleToggleSheathWeapon = useCallback(() => {
    const nowSheathed = fpSpringRigRef.current.toggleSheathWeapon();
    if (!nowSheathed) {
      grappledEnemyRef.current = null;
      setGrappledEnemyName(null);
    }
    setWeaponCombatState(fpSpringRigRef.current.getCombatState());
    const eqItem = resolveCompendiumItemById(
      compendiumStateRef.current.equippedRightHandId,
      compendiumStateRef.current
    );
    setLastCombatBanner(
      nowSheathed
        ? `✋ Sheathed ${eqItem.name} — Bare Hands Active: [Space] Parkour Clamber · [L-Click/E] Grapple Ragdoll · [R-Click] Catapult Enemy!`
        : `⚔️ Drew ${eqItem.name} (${fpSpringRigRef.current.currentAmmo}/${fpSpringRigRef.current.maxMagazine} Cells Ready)`
    );
    harmonicSoundscape.triggerChime(nowSheathed ? 1 : 3, 0.5);
  }, []);

  const handleEquipApparelItem = useCallback((itemId: string) => {
    setCompendiumState((prev) => {
      const next = { ...prev, equippedApparelId: itemId };
      compendiumStateRef.current = next;
      const item = resolveCompendiumItemById(itemId, next);
      somaticGraftStateRef.current.speedBoostMultiplier = Number(
        Math.min(
          1.85,
          1.0 + item.stats.stabilityBonus * 0.008
        ).toFixed(2)
      );
      setLastCombatBanner(
        `Donned Apparel Carapace: ${item.name} (+${item.stats.stabilityBonus} Metric Stability)`
      );
      return next;
    });
    harmonicSoundscape.triggerChime(2, 0.55);
  }, []);

  const handleAssignQuickbarSlot = useCallback(
    (slotIndex: number, itemId: string) => {
      setCompendiumState((prev) => {
        const nextQuick: [string, string, string, string, string] = [
          ...prev.quickbarItemIds,
        ] as [string, string, string, string, string];
        nextQuick[Math.max(0, Math.min(4, slotIndex))] = itemId;
        const next = { ...prev, quickbarItemIds: nextQuick };
        compendiumStateRef.current = next;
        return next;
      });
      handleEquipRightHandItem(itemId);
    },
    [handleEquipRightHandItem]
  );

  const handleToggleMountOnMuseumPlinth = useCallback(
    (itemId: string, preferredSlot?: number) => {
      setCompendiumState((prev) => {
        const nextPlinths = { ...prev.mountedMuseumPlinths };
        const existingEntry = Object.entries(nextPlinths).find(
          ([, id]) => id === itemId
        );
        if (existingEntry) {
          delete nextPlinths[Number(existingEntry[0])];
          const next = { ...prev, mountedMuseumPlinths: nextPlinths };
          compendiumStateRef.current = next;
          portalMuseumGalleryRigRef.current?.syncMountedItems(next);
          setLastCombatBanner(
            `Removed item from Portal Room Museum Plinth #${Number(existingEntry[0]) + 1}`
          );
          return next;
        }

        let targetSlot = preferredSlot;
        if (targetSlot === undefined) {
          for (let s = 0; s < 24; s++) {
            if (!nextPlinths[s]) {
              targetSlot = s;
              break;
            }
          }
          if (targetSlot === undefined) targetSlot = 0;
        }
        nextPlinths[targetSlot] = itemId;
        const next = { ...prev, mountedMuseumPlinths: nextPlinths };
        compendiumStateRef.current = next;
        portalMuseumGalleryRigRef.current?.syncMountedItems(next);
        const item = resolveCompendiumItemById(itemId, next);
        setLastCombatBanner(
          `Mounted "${item.name}" onto 3D Portal Room Museum Plinth #${targetSlot + 1}!`
        );
        return next;
      });
      harmonicSoundscape.triggerArchitecturalChord(3);
    },
    []
  );

  const handleCraftOrSynthesizeCompendiumItem = useCallback(
    (item: DimensionalItemDefinition) => {
      setMatterInventory((prev) => {
        const have = prev[item.craftCost.primaryMatter] ?? 0;
        const cost = item.craftCost.primaryCount;
        if (have < cost) return prev;
        return {
          ...prev,
          [item.craftCost.primaryMatter]: have - cost,
        };
      });

      setCompendiumState((prev) => {
        const nextDiscovered = prev.discoveredItemIds.includes(item.id)
          ? prev.discoveredItemIds
          : [...prev.discoveredItemIds, item.id];
        const nextQty = {
          ...prev.ownedQuantities,
          [item.id]: (prev.ownedQuantities[item.id] ?? 0) + 1,
        };
        const next = {
          ...prev,
          discoveredItemIds: nextDiscovered,
          ownedQuantities: nextQty,
        };
        compendiumStateRef.current = next;
        return next;
      });
      setDevianceXP((xp) => xp + 2);
      setLastCombatBanner(
        `Synthesized "${item.name}" in Compendium Crucible (+2 Deviance XP)!`
      );
      harmonicSoundscape.triggerArchitecturalChord(4);
    },
    []
  );

  const handleBoundaryForgeAffixedVariant = useCallback(
    (baseItem: DimensionalItemDefinition) => {
      const forged = forgeBoundaryAffixedItem(
        baseItem,
        worldRef.current.seed + Date.now()
      );
      setCompendiumState((prev) => {
        const next = {
          ...prev,
          customForgedItems: [forged, ...prev.customForgedItems],
          discoveredItemIds: [forged.id, ...prev.discoveredItemIds],
          ownedQuantities: { ...prev.ownedQuantities, [forged.id]: 1 },
          equippedRightHandId:
            forged.category === 'weapon' || forged.category === 'tool'
              ? forged.id
              : prev.equippedRightHandId,
        };
        compendiumStateRef.current = next;
        if (forged.category === 'weapon' || forged.category === 'tool') {
          fpSpringRigRef.current.equipWeaponOnHandRigs(
            forged,
            fpRightHandRigRef.current,
            avatarRigRef.current?.rightHandToolRig
          );
        }
        return next;
      });
      setDevianceXP((xp) => xp + 3);
      setLastCombatBanner(
        `Boundary-Forged "${forged.name}" (DMG ${forged.stats.damage} · EXCAV ${forged.stats.excavationPower}x)!`
      );
      harmonicSoundscape.triggerArchitecturalChord(4);
    },
    []
  );

  const handleUnlockAllCompendiumItems = useCallback(() => {
    const allIds = BETHESDA_SCALE_COMPENDIUM_CATALOG.map((i) => i.id);
    const nextQty: Record<string, number> = {};
    allIds.forEach((id) => {
      nextQty[id] = 1;
    });
    const nextPlinths: Record<number, string> = {};
    for (let s = 0; s < 24; s++) {
      nextPlinths[s] = BETHESDA_SCALE_COMPENDIUM_CATALOG[s * 12]?.id ?? allIds[s];
    }
    setCompendiumState((prev) => {
      const next = {
        ...prev,
        discoveredItemIds: allIds,
        ownedQuantities: { ...nextQty, ...prev.ownedQuantities },
        mountedMuseumPlinths: nextPlinths,
      };
      compendiumStateRef.current = next;
      portalMuseumGalleryRigRef.current?.syncMountedItems(next);
      return next;
    });
    setLastCombatBanner(
      `Unlocked all 325 Compendium Items & populated all 24 Portal Room 3D Museum Plinths!`
    );
    harmonicSoundscape.triggerArchitecturalChord(4);
  }, []);

  const handleAttuneFocusedGroundingAnchor = useCallback(() => {
    const focused = focusedGroundingAnchorRef.current;
    if (!focused) return;
    const res = groundingWorldRigRef.current.attuneAndHarvestAnchor(
      focused.instanceId
    );
    if (!res) return;

    const { anchor, rewardedItems } = res;
    setCompendiumState((prev) => {
      const nextDiscovered = [...prev.discoveredItemIds];
      const nextQty = { ...prev.ownedQuantities };
      const nextPlinths = { ...prev.mountedMuseumPlinths };

      for (const rItem of rewardedItems) {
        if (!nextDiscovered.includes(rItem.id)) {
          nextDiscovered.push(rItem.id);
        }
        nextQty[rItem.id] = (nextQty[rItem.id] ?? 0) + 1;

        // Auto-mount newly discovered Relics on an empty Portal Room Museum Plinth!
        if (
          rItem.category === 'relic' &&
          !Object.values(nextPlinths).includes(rItem.id)
        ) {
          for (let s = 0; s < 24; s++) {
            if (!nextPlinths[s]) {
              nextPlinths[s] = rItem.id;
              break;
            }
          }
        }
      }

      const next = {
        ...prev,
        discoveredItemIds: nextDiscovered,
        ownedQuantities: nextQty,
        mountedMuseumPlinths: nextPlinths,
      };
      compendiumStateRef.current = next;
      portalMuseumGalleryRigRef.current?.syncMountedItems(next);
      return next;
    });

    // Spawn a visual golden-cyan harmonic stabilization shockwave ring at the grounding monument
    const scene = sceneRef.current;
    if (scene) {
      const ringGeo = new THREE.RingGeometry(0.9, 1.4, 36);
      const ringMat = new THREE.MeshBasicMaterial({
        color: '#f59e0b',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(
        anchor.position.x,
        anchor.position.y + 0.4,
        anchor.position.z
      );
      scene.add(ringMesh);
      shockwavesRef.current.push({ mesh: ringMesh, age: 0, maxAge: 1.05 });
    }

    setDevianceXP((xp) => xp + 2);
    autonomicEquationEngine.recordGameplayEquationDiscovery(
      'architectural-sintering',
      1.25
    );
    const primaryReward = rewardedItems[0];
    setLastCombatBanner(
      `Attuned ${anchor.spec.name} · Recovered "${primaryReward.name}" (${primaryReward.rarity}) into Compendium [J]!`
    );
    harmonicSoundscape.triggerArchitecturalChord(3);
  }, []);

  // ============================================================================
  // INFINITE TIMELINES, IN-BETWEEN VOID RIFTS & VOID BALL EVOLUTION HANDLERS
  // ============================================================================

  const handleHarvestVoidAnomaly = useCallback(
    (resId: VoidAnomalyResourceId, amount: number = 1) => {
      setVoidBallEvolutionState((prev) => {
        const nextInv = {
          ...prev.anomalyInventory,
          [resId]: (prev.anomalyInventory[resId] ?? 0) + amount,
        };
        const next = { ...prev, anomalyInventory: nextInv };
        voidBallEvolutionStateRef.current = next;
        return next;
      });
      setDevianceXP((xp) => xp + 1);
      const spec = VOID_ANOMALY_RESOURCE_CATALOG[resId];
      setLastCombatBanner(
        `✨ Harvested In-Between Void Anomaly: +${amount} ${spec.name} (Press [M] to Evolve Void Ball)`
      );
      harmonicSoundscape.triggerChime(4, 0.55);
    },
    []
  );

  const handleSynthesizeAndEquipProceduralItem = useCallback(
    (item: DimensionalItemDefinition) => {
      setCompendiumState((prev) => {
        const existsCustom = prev.customForgedItems.some(
          (c) => c.id === item.id
        );
        const nextCustom = existsCustom
          ? prev.customForgedItems
          : [item, ...prev.customForgedItems];
        const nextDiscovered = prev.discoveredItemIds.includes(item.id)
          ? prev.discoveredItemIds
          : [item.id, ...prev.discoveredItemIds];
        const nextQty = {
          ...prev.ownedQuantities,
          [item.id]: (prev.ownedQuantities[item.id] ?? 0) + 1,
        };
        const shouldEquipRight =
          item.category === 'weapon' || item.category === 'tool';
        const next = {
          ...prev,
          customForgedItems: nextCustom,
          discoveredItemIds: nextDiscovered,
          ownedQuantities: nextQty,
          equippedRightHandId: shouldEquipRight
            ? item.id
            : prev.equippedRightHandId,
          equippedApparelId:
            item.category === 'apparel' ? item.id : prev.equippedApparelId,
        };
        compendiumStateRef.current = next;
        if (shouldEquipRight) {
          fpSpringRigRef.current.equipWeaponOnHandRigs(
            item,
            fpRightHandRigRef.current,
            avatarRigRef.current?.rightHandToolRig
          );
          setWeaponCombatState(fpSpringRigRef.current.getCombatState());
        }
        return next;
      });
      setDevianceXP((xp) => xp + 2);
      setLastCombatBanner(
        `⚡ Synthesized & Equipped Timeline Item: "${item.name}" (${item.subTypeLabel} · DMG ${item.stats.damage})`
      );
      harmonicSoundscape.triggerArchitecturalChord(4);
    },
    []
  );

  const handleApplyActiveTimelineToWorld = useCallback(
    (timeline: AbsurdTimelineSpec) => {
      // Synthesize 2 procedural timeline weapons/items into the player's Compendium automatically upon discovering a timeline!
      const proceduralItems = synthesizeProceduralTimelineItems(timeline, 3);
      setCompendiumState((prev) => {
        const existingCustomIds = new Set(
          prev.customForgedItems.map((i) => i.id)
        );
        const newCustoms = proceduralItems.filter(
          (i) => !existingCustomIds.has(i.id)
        );
        if (newCustoms.length === 0) return prev;
        const nextDiscovered = [...prev.discoveredItemIds];
        const nextQty = { ...prev.ownedQuantities };
        for (const pi of newCustoms) {
          if (!nextDiscovered.includes(pi.id)) nextDiscovered.push(pi.id);
          nextQty[pi.id] = (nextQty[pi.id] ?? 0) + 1;
        }
        const next = {
          ...prev,
          customForgedItems: [...newCustoms, ...prev.customForgedItems],
          discoveredItemIds: nextDiscovered,
          ownedQuantities: nextQty,
        };
        compendiumStateRef.current = next;
        return next;
      });

      setVoidBallEvolutionState((prev) => {
        const exists = prev.discoveredTimelines.some(
          (t) => t.coordinateCode === timeline.coordinateCode
        );
        const nextDiscovered = exists
          ? prev.discoveredTimelines
          : [timeline, ...prev.discoveredTimelines];

        // Unlock any Portal Gate Shapes whose unlockTimelinesCount threshold is now met!
        const nextUnlockedShapes = [...prev.unlockedGateShapes];
        for (const shapeId of ALL_PORTAL_GATE_SHAPE_IDS) {
          const req = PORTAL_GATE_SHAPE_CATALOG[shapeId].unlockTimelinesCount;
          if (
            nextDiscovered.length >= req &&
            !nextUnlockedShapes.includes(shapeId)
          ) {
            nextUnlockedShapes.push(shapeId);
          }
        }

        const next: VoidBallEvolutionState = {
          ...prev,
          activeTimeline: timeline,
          pendingDestinationTimeline: timeline,
          discoveredTimelines: nextDiscovered,
          unlockedGateShapes: nextUnlockedShapes,
          isPlayerInsideInBetweenVoid: false,
        };
        voidBallEvolutionStateRef.current = next;
        return next;
      });

      // 1. Radically Reshape 3D Planetary Geography, Multi-Octave Heightmap & 7-Band Palette via ProceduralEnvironmentEngine!
      const activeWorld = worldRef.current;
      const ex = explorerStateRef.current;
      const prevGround = ex.pos.y;
      const envProfile =
        proceduralEnvironmentEngine.setActiveTimelineSpec(timeline);
      setActiveTimelineLandform(timeline.landformArchetype, timeline.seedHash);

      activeWorld.palette.terrainLow = envProfile.colorPalette.lowlandBasinHex;
      activeWorld.palette.terrainMid =
        envProfile.colorPalette.midslopePrimaryHex;
      activeWorld.palette.terrainHigh =
        envProfile.colorPalette.highlandPlateauHex;
      activeWorld.palette.skyTop = envProfile.atmosphere.skyZenithHex;
      activeWorld.palette.skyHorizon = envProfile.atmosphere.skyHorizonHex;
      activeWorld.palette.fogColor = envProfile.atmosphere.fogTintHex;
      activeWorld.palette.accentColor =
        envProfile.colorPalette.mineralVeinEmissiveHex;

      deformTerrainGeometry(activeWorld, excavationsRef.current);

      const evalH = (x: number, z: number) =>
        evaluateTerrainHeight(x, z, activeWorld, excavationsRef.current);

      const nextGround = evalH(ex.pos.x, ex.pos.z);
      povFlowStateRef.current.elevationSpringOffset += prevGround - nextGround;
      ex.pos.y = nextGround;

      // 2. Rebuild Crash-Proof GPU-Instanced Absurd Timeline Decorator, Vibrant Sky Dome & 3D Loot Caches
      absurdTimelineDecoratorRef.current.rebuildForTimeline(
        timeline,
        activeWorld,
        evalH
      );

      // 3. Apply Seed-Unique Non-Black Planetary Sky, Fog, Sun Vector & GLSL Terrain Shader Uniforms
      proceduralEnvironmentEngine.applyAtmosphereAndShaderToScene({
        scene: sceneRef.current,
        hemiLight: hemiLightRef.current,
        keyLight: keyLightRef.current,
        rimLight: rimLightRef.current,
        zenithLight: zenithCausticLightRef.current,
        shaderUniforms: terrainPhaseUniforms,
      });

      // 4. Reposition & Scale World Landmarks, Monuments & Grounding Anchors onto the new 3D Landform
      const phaseShift = (timeline.seedHash % 360) * (Math.PI / 180);
      for (let i = 0; i < worldPropsListRef.current.length; i++) {
        const item = worldPropsListRef.current[i];
        if (!item?.mesh) continue;
        const newAngle = item.baseAngle + phaseShift * (i % 2 === 0 ? 1 : -1);
        const px = Math.cos(newAngle) * item.baseDist;
        const pz = Math.sin(newAngle) * item.baseDist;
        const py = evalH(px, pz);
        item.mesh.position.set(px, py - 0.2, pz);
        item.mesh.scale.setScalar(
          item.baseScale * timeline.propScaleMultiplier
        );
      }
      for (let m = 0; m < escherMonumentsListRef.current.length; m++) {
        const mon = escherMonumentsListRef.current[m];
        if (!mon?.mesh) continue;
        const newAngle = mon.baseAngle - phaseShift * 0.5;
        const mx = Math.cos(newAngle) * mon.baseDist;
        const mz = Math.sin(newAngle) * mon.baseDist;
        const my = evalH(mx, mz);
        mon.mesh.position.set(mx, my - 0.15, mz);
      }
      for (const gInst of groundingWorldRigRef.current.instances) {
        if (!gInst?.position) continue;
        const gy = evalH(gInst.position.x, gInst.position.z);
        gInst.position.y = gy;
        if (gInst.group) {
          gInst.group.position.y = gy;
        }
      }

      // 5. Assign Timeline Creature AI Archetypes (Swarmer, Stalker, Leviathan, Mimic) & Rival Factions
      for (const ent of entitiesRef.current) {
        const p0 = ent.particles[0].pos;
        const gy = evalH(p0.x, p0.z);
        const dy = gy + 1.0 - p0.y;
        for (const p of ent.particles) {
          p.pos.y += dy;
          p.prevPos.y += dy;
        }
      }
      creatureFactionAIDirectorRef.current.applyTimelineArchetypesToEntities(
        entitiesRef.current,
        timeline
      );

      setDevianceXP((xp) => xp + 3);
      setLastCombatBanner(
        `🌌 Arrived in ${timeline.title}! (${timeline.landformLabel} · ${timeline.atmosphereLabel} · ${timeline.gravityMultiplier}G)`
      );
      harmonicSoundscape.triggerArchitecturalChord(4);
    },
    [deformTerrainGeometry]
  );

  const handleDialTimelineCoordinate = useCallback(
    (timeline: AbsurdTimelineSpec, jumpImmediately: boolean) => {
      if (jumpImmediately) {
        handleApplyActiveTimelineToWorld(timeline);
        return;
      }

      const ex = explorerStateRef.current;
      inBetweenVoidRigRef.current?.openPortalInFrontOfPlayer(
        ex.pos,
        ex.yaw,
        (x, z) =>
          evaluateTerrainHeight(x, z, worldRef.current, excavationsRef.current)
      );
      voidBeamHandRaiseTimerRef.current = 1.2;

      setVoidBallEvolutionState((prev) => {
        const next: VoidBallEvolutionState = {
          ...prev,
          pendingDestinationTimeline: timeline,
          isInBetweenPortalOpen: true,
          inBetweenPortalProgress: 1.0,
        };
        voidBallEvolutionStateRef.current = next;
        return next;
      });

      setLastCombatBanner(
        `🌀 Opened ${PORTAL_GATE_SHAPE_CATALOG[voidBallEvolutionStateRef.current.activeGateShape].name} to ${timeline.title}! Walk through to enter the Zero-G In-Between Void!`
      );
      harmonicSoundscape.triggerArchitecturalChord(3);
    },
    [handleApplyActiveTimelineToWorld]
  );

  const handleToggleTimelinePortal = useCallback(() => {
    const curOpen = voidBallEvolutionStateRef.current.isInBetweenPortalOpen;
    const ex = explorerStateRef.current;
    if (!curOpen) {
      inBetweenVoidRigRef.current?.openPortalInFrontOfPlayer(
        ex.pos,
        ex.yaw,
        (x, z) =>
          evaluateTerrainHeight(x, z, worldRef.current, excavationsRef.current)
      );
      voidBeamHandRaiseTimerRef.current = 1.2;
    }
    setVoidBallEvolutionState((prev) => {
      const next = {
        ...prev,
        isInBetweenPortalOpen: !curOpen,
        inBetweenPortalProgress: !curOpen ? 1.0 : 0.0,
      };
      voidBallEvolutionStateRef.current = next;
      return next;
    });
    setLastCombatBanner(
      !curOpen
        ? `🌀 Tore Open ${PORTAL_GATE_SHAPE_CATALOG[voidBallEvolutionStateRef.current.activeGateShape].name} ahead! Step inside to traverse the Zero-G In-Between Void!`
        : 'Closed Timeline Rift Gate'
    );
    harmonicSoundscape.triggerChime(!curOpen ? 3 : 1, 0.55);
  }, []);

  const handleEnterOrExitInBetweenVoidNow = useCallback(() => {
    const ex = explorerStateRef.current;
    const vRig = inBetweenVoidRigRef.current;
    const curInside =
      voidBallEvolutionStateRef.current.isPlayerInsideInBetweenVoid;

    if (!curInside) {
      if (vRig) {
        vRig.savedExteriorPos.copy(ex.pos);
        vRig.savedExteriorYaw = ex.yaw;
        vRig.portalTeleportCooldown = 1.4;
      }
      ex.pos.set(
        IN_BETWEEN_VOID_ORIGIN.x,
        IN_BETWEEN_VOID_ORIGIN.y + 0.8,
        IN_BETWEEN_VOID_ORIGIN.z + 12.5
      );
      ex.vel.set(0, 0, 0);
      ex.yaw = 0; // Face North toward the Singularity Loom & Destination Timeline Gate
      povFlowStateRef.current.smoothVisualY = IN_BETWEEN_VOID_ORIGIN.y + 0.8;
      povFlowStateRef.current.elevationSpringOffset = 0;

      setVoidBallEvolutionState((prev) => {
        const next = {
          ...prev,
          isPlayerInsideInBetweenVoid: true,
          isInBetweenPortalOpen: true,
        };
        voidBallEvolutionStateRef.current = next;
        return next;
      });
      setLastCombatBanner(
        `🛸 Entered Zero-G In-Between Timeline Void! Glide with [WASD + Space/Shift] to harvest Void Shards or walk through the North Gate to enter ${voidBallEvolutionStateRef.current.pendingDestinationTimeline.coordinateCode}!`
      );
      harmonicSoundscape.triggerArchitecturalChord(3);
    } else {
      // Complete jump into pendingDestinationTimeline!
      const outX = vRig ? vRig.savedExteriorPos.x : 0;
      const outZ = vRig ? vRig.savedExteriorPos.z : 12;
      const outY = evaluateTerrainHeight(
        outX,
        outZ,
        worldRef.current,
        excavationsRef.current
      );
      ex.pos.set(outX, outY + 0.4, outZ);
      ex.vel.set(0, 0, 0);
      povFlowStateRef.current.smoothVisualY = outY + 0.4;
      povFlowStateRef.current.elevationSpringOffset = 0;
      handleApplyActiveTimelineToWorld(
        voidBallEvolutionStateRef.current.pendingDestinationTimeline
      );
    }
  }, [handleApplyActiveTimelineToWorld]);

  const handleQuickJumpRandomTimeline = useCallback(() => {
    const rndCode = generateRandomAbsurdCoordinate(
      Date.now() + Math.floor(Math.random() * 99999)
    );
    const newTimeline = synthesizeInfiniteTimelineFromCoordinate(rndCode);
    handleApplyActiveTimelineToWorld(newTimeline);
  }, [handleApplyActiveTimelineToWorld]);

  const handleFireVoidBallActiveBeam = useCallback(() => {
    const ex = explorerStateRef.current;
    voidBeamHandRaiseTimerRef.current = 0.95;
    sentientSymbioteRigRef.current.fireActiveVoidBeam({
      playerPos: ex.pos,
      playerYaw: ex.yaw,
      playerPitch: ex.pitch,
      entities: entitiesRef.current,
      voidState: voidBallEvolutionStateRef.current,
      onHarvestAnomaly: handleHarvestVoidAnomaly,
      onBannerMessage: (msg) => setLastCombatBanner(msg),
    });
    onImpactSpikeRef.current(0.65);
    harmonicSoundscape.triggerChime(4, 0.65);
  }, [handleHarvestVoidAnomaly]);

  const handleCycleVoidBeamMode = useCallback(() => {
    const modes: VoidBallActiveBeamMode[] = [
      'gravity-inversion-beam',
      'temporal-dilation-beam',
      'matter-mutation-ray',
    ];
    setVoidBallEvolutionState((prev) => {
      const idx = modes.indexOf(prev.activeBeamMode);
      const nextMode = modes[(idx + 1) % modes.length];
      const next = { ...prev, activeBeamMode: nextMode };
      voidBallEvolutionStateRef.current = next;
      setLastCombatBanner(
        `Switched Left-Hand Void Ball Beam to ${nextMode.replace(/-/g, ' ').toUpperCase()} [Key Z]`
      );
      return next;
    });
    harmonicSoundscape.triggerChime(2, 0.45);
  }, []);

  const handleSelectGateShape = useCallback((shapeId: PortalGateShapeId) => {
    setVoidBallEvolutionState((prev) => {
      const next = { ...prev, activeGateShape: shapeId };
      voidBallEvolutionStateRef.current = next;
      return next;
    });
    const spec = PORTAL_GATE_SHAPE_CATALOG[shapeId];
    setLastCombatBanner(
      `Customized Portal Gate Silhouette to "${spec.name}" (${spec.rimGeometryStyle})`
    );
    harmonicSoundscape.triggerChime(3, 0.55);
  }, []);

  const handleUpgradeVoidBallBranch = useCallback(
    (branchId: VoidBallUpgradeBranchId) => {
      const spec = VOID_BALL_UPGRADE_BRANCHES[branchId];
      setVoidBallEvolutionState((prev) => {
        const curTier = prev.branchTiers[branchId] ?? 1;
        if (curTier >= spec.maxTier) return prev;
        const costPrimary = curTier * 2;
        const costSecondary = curTier;
        const havePrimary = prev.anomalyInventory[spec.primaryResource] ?? 0;
        const haveSecondary =
          prev.anomalyInventory[spec.secondaryResource] ?? 0;
        if (havePrimary < costPrimary || haveSecondary < costSecondary) {
          return prev;
        }
        const nextTier = curTier + 1;
        const nextUnlockedShapes =
          branchId === 'reality-splicing-coordinates' && nextTier >= 4
            ? [...ALL_PORTAL_GATE_SHAPE_IDS]
            : prev.unlockedGateShapes;
        const next: VoidBallEvolutionState = {
          ...prev,
          unlockedGateShapes: nextUnlockedShapes,
          branchTiers: {
            ...prev.branchTiers,
            [branchId]: nextTier,
          },
          anomalyInventory: {
            ...prev.anomalyInventory,
            [spec.primaryResource]: havePrimary - costPrimary,
            [spec.secondaryResource]: haveSecondary - costSecondary,
          },
        };
        voidBallEvolutionStateRef.current = next;
        return next;
      });
      setDevianceXP((xp) => xp + 3);
      setLastCombatBanner(
        `⚡ Evolved Void Ball Branch "${spec.name}" (+3 Deviance XP)!`
      );
      harmonicSoundscape.triggerArchitecturalChord(4);
    },
    []
  );

  // ============================================================================
  // PHYSICS GRAPPLE HOOK, MULTI-VEHICLE TRAVERSAL & ANIMATED BODY MOD HANDLERS
  // ============================================================================

  const handleFireGrappleHook = useCallback((forceZipReel?: boolean) => {
    const ex = explorerStateRef.current;
    voidBeamHandRaiseTimerRef.current = 0.85;
    weaponHandControllerRef.current.triggerToolActionAnimation('grapple-hook');
    const cameraLookDir = new THREE.Vector3(
      -Math.sin(ex.yaw) * Math.cos(ex.pitch),
      Math.sin(ex.pitch),
      -Math.cos(ex.yaw) * Math.cos(ex.pitch)
    ).normalize();
    const res = grappleHookRigRef.current.toggleOrFireGrapple({
      cameraPos:
        cameraRef.current?.position ??
        ex.pos.clone().add(new THREE.Vector3(0, 1.75, 0)),
      cameraLookDir,
      terrainMesh: terrainMeshRef.current,
      sectorMeshes: sectorTerrainMeshesRef.current,
      entities: entitiesRef.current,
      extraTargetRoot: absurdTimelineDecoratorRef.current.rootGroup,
      evalTerrainHeight: (x, z) =>
        evaluateTerrainHeight(x, z, worldRef.current, excavationsRef.current),
      forceZipReelOnAttach: forceZipReel,
    });
    setGrappleActive(res.attached);
    setGrappleAnchorLabel(res.attached ? res.label : 'Detached');
    setGrappleRangeTelemetry(grappleHookRigRef.current.getTelemetry());
    setLastCombatBanner(
      res.attached
        ? `🪝 Grapple Hook Locked onto ${res.label} (${res.distance.toFixed(1)}m · Hold [C/RMB] to Zip-Reel · [Space] Catapult)`
        : `🪝 Grapple Hook ${res.label}`
    );
    harmonicSoundscape.triggerChime(res.attached ? 4 : 1, 0.55);
  }, []);

  const handleSelectVehicleType = useCallback(
    (vType: TraversalVehicleType, mountImmediately?: boolean) => {
      setActiveVehicleType(vType);
      activeVehicleTypeRef.current = vType;
      gravityVehicleRigRef.current?.setVehicleType(vType);
      const label = TRAVERSAL_VEHICLE_CATALOG[vType].name;
      if (mountImmediately && gravityVehicleRigRef.current) {
        const ex = explorerStateRef.current;
        gravityVehicleRigRef.current.root.position.set(
          ex.pos.x,
          ex.pos.y + 0.85,
          ex.pos.z
        );
        gravityVehicleRigRef.current.setMounted(true);
        isVehicleMountedRef.current = true;
      }
      setLastCombatBanner(
        `🛸 Reconfigured Traversal Vehicle Chassis to ${label} ([G] Mount/Dismount · [B] Cycle Chassis)`
      );
      harmonicSoundscape.triggerArchitecturalChord(3);
    },
    []
  );

  const handleCycleVehicleType = useCallback(() => {
    const vRig = gravityVehicleRigRef.current;
    if (!vRig) return;
    const nextType = vRig.cycleVehicleType();
    setActiveVehicleType(nextType);
    activeVehicleTypeRef.current = nextType;
    const spec = TRAVERSAL_VEHICLE_CATALOG[nextType];
    setLastCombatBanner(
      `🛸 Switched Traversal Vehicle Chassis to ${spec.name} (${spec.locomotionSignature} · Press [G] to Mount)`
    );
    harmonicSoundscape.triggerChime(3, 0.55);
  }, []);

  const handleToggleBodyMod = useCallback((modId: BodyModId) => {
    const isNowActive = bodyModsRigRef.current.toggleBodyMod(modId);
    const nextMods = Array.from(bodyModsRigRef.current.equippedMods);
    setEquippedBodyMods(nextMods);
    equippedBodyModsRef.current = nextMods;
    const spec = BODY_MOD_CATALOG[modId];
    setLastCombatBanner(
      `${isNowActive ? '🦾 Activated' : 'Deactivated'} Body Modification: ${spec.name} (${spec.activeAbilitySummary})`
    );
    harmonicSoundscape.triggerChime(isNowActive ? 4 : 1, 0.55);
  }, []);

  const handleTriggerBodyModFlurry = useCallback(() => {
    const ex = explorerStateRef.current;
    if (!equippedBodyModsRef.current.includes('mantis-blades')) {
      handleToggleBodyMod('mantis-blades');
    }
    rightHandGestureTimerRef.current = 0.65;
    voidBeamHandRaiseTimerRef.current = 0.65;
    fpSpringRigRef.current.triggerPrimaryStrikeImpulse(2.4, 'prism-saber');
    const forward = new THREE.Vector3(
      -Math.sin(ex.yaw) * Math.cos(ex.pitch),
      Math.sin(ex.pitch),
      -Math.cos(ex.yaw) * Math.cos(ex.pitch)
    ).normalize();
    const res = bodyModsRigRef.current.triggerMantisBladeFlurryAndLunge({
      playerPos: ex.pos,
      playerVel: ex.vel,
      cameraLookDir: forward,
      entities: entitiesRef.current,
    });
    if (res.hitCount > 0) {
      setDevianceXP((xp) => xp + res.hitCount * 2);
      onImpactSpikeRef.current(0.95);
    }
    setLastCombatBanner(
      `⚔️ ${res.activeModLabel}! (${res.hitCount} target${res.hitCount === 1 ? '' : 's'} lacerated)`
    );
    harmonicSoundscape.triggerArchitecturalChord(4);
  }, [handleToggleBodyMod]);

  const handleSelectBaseElement = useCallback(
    (elemId: BaseDimensionalElementId) => {
      setActiveBaseElement(elemId);
      activeBaseElementRef.current = elemId;
      const combatRig = visceralCombatRigRef.current;
      if (combatRig?.heldObject) {
        infuseObjectWithBaseElement(combatRig.heldObject, elemId);
        setLastCombatBanner(
          `Infused ${combatRig.heldObject.name} with ${BASE_DIMENSIONAL_ELEMENTS[elemId].name}!`
        );
      } else {
        setLastCombatBanner(
          `Attuned to ${BASE_DIMENSIONAL_ELEMENTS[elemId].name} (${BASE_DIMENSIONAL_ELEMENTS[elemId].fieldEquationFormula})`
        );
      }
      harmonicSoundscape.triggerChime(2, 0.5);
    },
    []
  );

  const handleTriggerGrabOrDrop = useCallback(() => {
    const combatRig = visceralCombatRigRef.current;
    if (!combatRig) return;
    const ex = explorerStateRef.current;
    const forward = new THREE.Vector3(
      -Math.sin(ex.yaw) * Math.cos(ex.pitch),
      Math.sin(ex.pitch),
      -Math.cos(ex.yaw) * Math.cos(ex.pitch)
    ).normalize();
    const maxReach = unlockedPerkIdsRef.current.includes(
      'perk-telekinetic-snatch'
    )
      ? 18.0
      : 6.8;
    const grabbed = grabOrDropWorldObject(
      combatRig,
      ex.pos,
      forward,
      maxReach,
      activeBaseElementRef.current
    );
    setHeldObjectName(grabbed ? grabbed.name : null);
    setLastCombatBanner(combatRig.lastCombatEventBanner);
  }, []);

  const handleTriggerThrowObject = useCallback(() => {
    const combatRig = visceralCombatRigRef.current;
    if (!combatRig || !combatRig.heldObject) return;
    const ex = explorerStateRef.current;
    const forward = new THREE.Vector3(
      -Math.sin(ex.yaw) * Math.cos(ex.pitch),
      Math.sin(ex.pitch),
      -Math.cos(ex.yaw) * Math.cos(ex.pitch)
    ).normalize();
    const throwMult = unlockedPerkIdsRef.current.includes(
      'perk-improvised-impale'
    )
      ? 1.75
      : 1.0;
    const thrown = throwHeldWorldObject(
      combatRig,
      ex.pos,
      forward,
      throwMult
    );
    if (thrown) {
      setHeldObjectName(null);
      setLastCombatBanner(combatRig.lastCombatEventBanner);
    }
  }, []);

  const handleTriggerDynamicQuickKey = useCallback(
    (binding: DynamicQuickKeyBinding) => {
      const portalRig = realityTearPortalRigRef.current;
      const act = binding.actionId;

      if (act.startsWith('pull-weapon-slot-')) {
        const slotIdx = Number(act.replace('pull-weapon-slot-', '')) || 0;
        const targetId =
          compendiumStateRef.current.quickbarItemIds[slotIdx] ??
          compendiumStateRef.current.equippedRightHandId;
        if (targetId) {
          handleEquipRightHandItem(targetId);
        }
        return;
      }

      if (act.startsWith('morph-')) {
        const targetMorph = act.replace('morph-', '') as PlayerMorphModeId;
        const spec =
          PLAYER_MORPH_MODE_CATALOG[targetMorph] ??
          PLAYER_MORPH_MODE_CATALOG['human-default'];
        setMindspaceDialConfig((prev) => ({
          ...prev,
          activeMorphMode: targetMorph,
        }));
        somaticGraftStateRef.current.speedBoostMultiplier = spec.speedBonus;
        somaticGraftStateRef.current.jumpBoostMultiplier = spec.jumpBonus;
        setLastCombatBanner(
          `🧬 Shifted Form: ${spec.name} (${spec.specialAbilityLabel})`
        );
        harmonicSoundscape.triggerArchitecturalChord(4);
        return;
      }

      if (act.startsWith('tool-')) {
        const toolId = act.replace('tool-', '') as PlayerInteractionTool;
        handlePullToolFromVoidBall(toolId);
        return;
      }

      switch (act) {
        case 'portal-toggle-main': {
          if (portalRig?.isPlayerInsidePortalRoom) {
            portalRig.isInnerMazePortalOpen = !portalRig.isInnerMazePortalOpen;
            harmonicSoundscape.triggerArchitecturalChord(3);
          } else {
            handleChangeVoidBallMode(
              voidBallModeRef.current === 'walk-in-sanctum-portal'
                ? 'dormant-clenched'
                : 'walk-in-sanctum-portal'
            );
          }
          break;
        }
        case 'portal-step-inside': {
          handleEnterOrExitPortalRoomNow();
          break;
        }
        case 'portal-timeline-rift': {
          handleToggleTimelinePortal();
          break;
        }
        case 'portal-shift-boundary': {
          const curIdx = ALL_DIFFERENTIAL_BOUNDARY_IDS.indexOf(
            biodepthConfigRef.current.activeUniverseBoundary
          );
          const nextB =
            ALL_DIFFERENTIAL_BOUNDARY_IDS[
              (curIdx + 1) % ALL_DIFFERENTIAL_BOUNDARY_IDS.length
            ];
          handleSelectUniverseBoundary(nextB);
          break;
        }
        case 'held-throw-object': {
          handleTriggerThrowObject();
          break;
        }
        case 'held-infuse-element': {
          handleSelectBaseElement(activeBaseElementRef.current);
          break;
        }
        case 'held-assimilate-matter':
        case 'held-drop-object': {
          handleTriggerGrabOrDrop();
          break;
        }
        case 'maze-deploy-tech': {
          if (portalRig?.isPlayerInsideMazeDimension) {
            const deployRes =
              portalRig.mazeDimensionRig.deployTechEquipmentInActiveMaze(
                explorerStateRef.current.pos,
                explorerStateRef.current.yaw
              );
            portalRig.knownMazes[portalRig.selectedMazeIndex] = {
              ...deployRes.updatedSpec,
            };
            const eqSpec =
              MAZE_TECH_EQUIPMENT_CATALOG[deployRes.placedItem.kind];
            setLastCombatBanner(
              `📹 Deployed ${eqSpec.name} in ${deployRes.updatedSpec.code}! Assimilation: ${Math.round(
                deployRes.updatedSpec.assimilationPct
              )}%`
            );
            harmonicSoundscape.triggerArchitecturalChord(4);
          }
          break;
        }
        case 'maze-cycle-tech': {
          if (portalRig?.isPlayerInsideMazeDimension) {
            const nextK =
              portalRig.mazeDimensionRig.cycleActiveTechEquipmentKind();
            setLastCombatBanner(
              `📹 Selected In-Maze Tech: ${MAZE_TECH_EQUIPMENT_CATALOG[nextK].name}`
            );
          }
          break;
        }
        case 'maze-exit-to-room': {
          if (portalRig?.isPlayerInsideMazeDimension) {
            portalRig.isPlayerInsideMazeDimension = false;
            portalRig.isPlayerInsidePortalRoom = true;
            portalRig.portalTeleportCooldown = 1.2;
            explorerStateRef.current.pos.set(
              PORTAL_ROOM_ORIGIN.x + 6.8,
              PORTAL_ROOM_ORIGIN.y,
              PORTAL_ROOM_ORIGIN.z + 12.2
            );
            explorerStateRef.current.vel.set(0, 0, 0);
            povFlowStateRef.current.smoothVisualY = PORTAL_ROOM_ORIGIN.y;
            setLastCombatBanner(
              '⇪ Returned from Maze Dimension to 36m×36m Square Portal Room!'
            );
          }
          break;
        }
        case 'room-next-maze': {
          handleCycleMazeSelection(1);
          break;
        }
        case 'room-toggle-maze-gate': {
          if (portalRig) {
            portalRig.isInnerMazePortalOpen = !portalRig.isInnerMazePortalOpen;
            harmonicSoundscape.triggerArchitecturalChord(3);
          }
          break;
        }
        case 'room-enter-maze': {
          if (portalRig) {
            const selM = portalRig.knownMazes[portalRig.selectedMazeIndex];
            portalRig.mazeDimensionRig.rebuildMazeGeometryForSpec(selM);
            portalRig.isPlayerInsidePortalRoom = false;
            portalRig.isPlayerInsideMazeDimension = true;
            portalRig.portalTeleportCooldown = 1.2;
            explorerStateRef.current.pos.set(
              MAZE_DIMENSION_ORIGIN.x,
              MAZE_DIMENSION_ORIGIN.y,
              MAZE_DIMENSION_ORIGIN.z + 19.0
            );
            explorerStateRef.current.vel.set(0, 0, 0);
            explorerStateRef.current.yaw = 0;
            povFlowStateRef.current.smoothVisualY = MAZE_DIMENSION_ORIGIN.y;
            harmonicSoundscape.triggerArchitecturalChord(3);
          }
          break;
        }
        case 'room-snap-module': {
          handlePlacePortalRoomModule();
          break;
        }
        case 'open-mindspace-sink': {
          setMindspaceDialConfig((prev) => ({
            ...prev,
            isMindspaceOpen: !prev.isMindspaceOpen,
            isVoidDialOpen: false,
          }));
          harmonicSoundscape.triggerArchitecturalChord(3);
          break;
        }
        case 'cycle-substrate-tool': {
          const tools: PlayerInteractionTool[] = [
            'mine-terrain',
            'grapple-hook',
            'place-building',
            'harmonic-tether',
          ];
          const nextT =
            tools[(tools.indexOf(activeToolRef.current) + 1) % tools.length];
          handlePullToolFromVoidBall(nextT);
          break;
        }
        case 'toggle-quick-morph': {
          const nextM: PlayerMorphModeId =
            mindspaceDialConfigRef.current.activeMorphMode === 'human-default'
              ? 'ophanim-seraph'
              : 'human-default';
          const spec = PLAYER_MORPH_MODE_CATALOG[nextM];
          setMindspaceDialConfig((prev) => ({
            ...prev,
            activeMorphMode: nextM,
          }));
          somaticGraftStateRef.current.speedBoostMultiplier = spec.speedBonus;
          somaticGraftStateRef.current.jumpBoostMultiplier = spec.jumpBonus;
          setLastCombatBanner(
            `🧬 Shifted Form: ${spec.name} (${spec.specialAbilityLabel})`
          );
          harmonicSoundscape.triggerArchitecturalChord(4);
          break;
        }
      }
    },
    [
      handleEquipRightHandItem,
      handlePullToolFromVoidBall,
      handleChangeVoidBallMode,
      handleEnterOrExitPortalRoomNow,
      handleToggleTimelinePortal,
      handleSelectUniverseBoundary,
      handleTriggerThrowObject,
      handleSelectBaseElement,
      handleTriggerGrabOrDrop,
      handleCycleMazeSelection,
      handlePlacePortalRoomModule,
    ]
  );

  const handleDecodeOrCounterSabotage = useCallback(() => {
    const curElem = activeBaseElementRef.current;
    const q = activeQuestRef.current;
    const ex = explorerStateRef.current;

    // 1. Advance Epistemological Perception of the current Base Dimensional Element
    setEpistemologyMap((prev) => {
      const curStage = prev[curElem] ?? 'incomprehensible-alien-horror';
      const nextStage: EpistemologicalPerceptionStage =
        curStage === 'incomprehensible-alien-horror'
          ? 'arcane-dimensional-magic'
          : 'decoded-shared-survival-mechanic';
      return { ...prev, [curElem]: nextStage };
    });

    // 2. Check if active quest is a Trojan Sabotage Questline
    if (q) {
      if (!q.sabotageRevealedToPlayer) {
        const revealed: EmergentCulturalQuestline = {
          ...q,
          sabotageRevealedToPlayer: true,
          currentStep: 2,
        };
        setActiveQuest(revealed);
        setDevianceXP((xp) => xp + 1);
        setLastCombatBanner(
          q.isDeceptiveSabotage
            ? `⚠ EAVESDROPPED ON ${q.giverName.toUpperCase()}: Uncovered Trojan Sabotage Plot! Press [X] again to Reverse Trap!`
            : `✓ Verified ${q.giverName}'s Genuine Cultural Survival Pact (+1 Deviance XP)`
        );
        harmonicSoundscape.triggerArchitecturalChord(3);
        return;
      }

      if (q.isDeceptiveSabotage && q.status === 'active') {
        const reversed: EmergentCulturalQuestline = {
          ...q,
          currentStep: 3,
          status: 'sabotage-reversed',
        };
        setActiveQuest(reversed);
        setDevianceXP((xp) => xp + 3);
        setLastCombatBanner(
          `⚡ REVERSED TROJAN SABOTAGE TRAP on ${q.giverName}! Detonated ${BASE_DIMENSIONAL_ELEMENTS[curElem].shortName} Shear Cascade (+3 Deviance XP)!`
        );
        // Trigger physical shockwave on plotting entities
        for (const ent of entitiesRef.current) {
          const d = ent.particles[0].pos.distanceTo(ex.pos);
          if (d < 28) {
            ent.applyInternalGoreTrauma(
              'calcified-marrow-shatter',
              0.55,
              new THREE.Vector3(0, 12, 0),
              ex.pos
            );
          }
        }
        onImpactSpikeRef.current(1.0);
        harmonicSoundscape.triggerArchitecturalChord(4);
        return;
      } else if (!q.isDeceptiveSabotage && q.status === 'active') {
        const completed: EmergentCulturalQuestline = {
          ...q,
          currentStep: 3,
          status: 'completed-ally',
        };
        setActiveQuest(completed);
        setDevianceXP((xp) => xp + 2);
        setLastCombatBanner(
          `✓ Completed Cultural Survival Pact "${q.title}" (+2 Deviance XP & Mastered ${BASE_DIMENSIONAL_ELEMENTS[curElem].shortName})!`
        );
        harmonicSoundscape.triggerArchitecturalChord(2);
        return;
      }
    }

    setDevianceXP((xp) => xp + 1);
    setLastCombatBanner(
      `Decoded ${BASE_DIMENSIONAL_ELEMENTS[curElem].name}: "${BASE_DIMENSIONAL_ELEMENTS[curElem].decodedMasteryMechanic}" (+1 XP)`
    );
    harmonicSoundscape.triggerChime(4, 0.65);
  }, []);

  const handleGenerateNextQuest = useCallback(() => {
    questCounterRef.current += 1;
    const settlementPos: [number, number] = culturalSettlementRigRef.current
      ? [
          culturalSettlementRigRef.current.centerPos.x,
          culturalSettlementRigRef.current.centerPos.z,
        ]
      : [14, -14];
    const nextQ = generateEmergentCulturalQuestline(
      worldRef.current,
      currentDimIndexRef.current,
      denizenSimsRef.current,
      settlementPos,
      questCounterRef.current
    );
    setActiveQuest(nextQ);
    setLastCombatBanner(`New Cultural Encounter: ${nextQ.title}`);
  }, []);

  const handleUnlockPerk = useCallback((perk: DimensionalPerkNode) => {
    setDevianceXP((prev) => Math.max(0, prev - perk.costXP));
    setUnlockedPerkIds((prev) => {
      const next = prev.includes(perk.id) ? prev : [...prev, perk.id];
      unlockedPerkIdsRef.current = next;
      return next;
    });
    // Mutate player 3D body scale & speed slightly with each unlocked Deviance Perk
    const gs = somaticGraftStateRef.current;
    gs.limbScaleMultiplier = Number(
      Math.min(1.48, gs.limbScaleMultiplier + 0.035).toFixed(2)
    );
    gs.speedBoostMultiplier = Number(
      Math.min(1.75, gs.speedBoostMultiplier + 0.05).toFixed(2)
    );
    gs.lastWorldMechanicEvent = `Unlocked Deviance Perk: ${perk.title} → ${perk.somaticMutationVisual}`;
    setLastCombatBanner(
      `Unlocked "${perk.title}"! ${perk.sanctumUpgradeEffect}`
    );
    harmonicSoundscape.triggerArchitecturalChord(4);
  }, []);

  const handleCompleteOriginSpawn = useCallback(
    (finalConfig: VoidwalkerCustomizationConfig) => {
      const updated = { ...finalConfig, hasCompletedOriginCutscene: true };
      setVoidwalkerConfig(updated);
      voidwalkerConfigRef.current = updated;
      setActiveBaseElement(updated.primaryBaseElement);
      activeBaseElementRef.current = updated.primaryBaseElement;
      setStudioMode('none');
      studioModeRef.current = 'none';
      setCutsceneElapsedSec(0);
      cutsceneElapsedSecRef.current = 0;

      try {
        window.localStorage.setItem(
          'VOIDWALKER_ORIGIN_CONFIG_V2',
          JSON.stringify(updated)
        );
      } catch {
        // Ignore
      }

      const seedSpec = VOID_SEED_ORIGINS[updated.voidSeedId];
      const charSpec = worldRef.current.playableCharacter;
      charSpec.name = updated.walkerName;
      charSpec.bodyArchetype = updated.bodyArchetype;
      charSpec.skinTopology = updated.skinTopology;
      charSpec.heightScale = updated.heightScale;
      charSpec.voidOrbColor = seedSpec.coreColor;
      charSpec.visorOrOrganColor = seedSpec.rimColor;

      // Hot-swap the 3D character mesh so the customized 3D chassis & skin topology persist in gameplay!
      const scene = sceneRef.current;
      if (scene && avatarRigRef.current) {
        scene.remove(avatarRigRef.current.root);
        const builtAvatar = buildPlayableCharacterMesh(charSpec);
        avatarRigRef.current = builtAvatar;
        scene.add(builtAvatar.root);
      }

      setLastCombatBanner(
        `Awakened as ${updated.walkerName} (${seedSpec.name} · Aim at Ground & Click to Dig Granular Dirt)`
      );
      harmonicSoundscape.triggerArchitecturalChord(3);
    },
    []
  );

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 1280;
    const height = container.clientHeight || 720;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(64, width / height, 0.12, 260);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    // Full Photorealistic Cinematic Rendering Pipeline:
    // RoomEnvironment PMREM reflections + HDR EffectComposer + Bloom + Vignette + OpticalImmersion + FXAA
    const pipeline = setupPhotorealisticRendererAndPipeline(
      renderer,
      scene,
      camera,
      width,
      height,
      gameOptionsRef.current.bloomIntensity ?? 1.35
    );
    immersionPipelineRef.current = pipeline;
    composerRef.current = pipeline.composer;
    bloomPassRef.current = pipeline.bloomPass;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const canvasEl = renderer.domElement;
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglLost(true);
    };
    const handleContextRestored = () => {
      setWebglLost(false);
      rebuildWorldEnvironment(worldRef.current);
    };
    canvasEl.addEventListener('webglcontextlost', handleContextLost);
    canvasEl.addEventListener('webglcontextrestored', handleContextRestored);

    // Four-Point Atmospheric Wonder & 5D Caustic Lighting Rig (Calibrated for crisp geometric relief)
    const ambientLight = new THREE.HemisphereLight('#e2e8f0', '#0f172a', 0.55);
    hemiLightRef.current = ambientLight;
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#fffbeb', 1.25);
    keyLight.position.set(38, 64, 28);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0003;
    keyLight.shadow.normalBias = 0.025;
    keyLight.shadow.camera.near = 5;
    keyLight.shadow.camera.far = 160;
    const d = 55;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLightRef.current = keyLight;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#38bdf8', 0.55);
    rimLight.position.set(-45, 28, -40);
    rimLightRef.current = rimLight;
    scene.add(rimLight);

    const zenithLight = new THREE.PointLight('#a855f7', 0.62, 110, 1.4);
    zenithLight.position.set(0, 46, 0);
    zenithCausticLightRef.current = zenithLight;
    scene.add(zenithLight);

    // 1st-Person Right-Hand Peripheral Kinetic & Mining Extractor Emitter
    const fpEmitterGroup = new THREE.Group();
    camera.add(fpEmitterGroup);
    scene.add(camera);

    // Execute Destructive Weapon Discharge, Bare-Handed Ragdoll Grapple/Catapult, or Parkour Vault (Used by Right-Click & Ranged Left-Click)
    executeDestructiveWeaponFireRef.current = (
      triggerSource: 'left-click' | 'right-click'
    ) => {
      const ex = explorerStateRef.current;
      const mode = cameraModeRef.current;
      const activeWorld = worldRef.current;
      const forward = new THREE.Vector3(
        -Math.sin(ex.yaw) * Math.cos(ex.pitch),
        Math.sin(ex.pitch),
        -Math.cos(ex.yaw) * Math.cos(ex.pitch)
      ).normalize();
      const rightVec = new THREE.Vector3(
        Math.cos(ex.yaw),
        0,
        -Math.sin(ex.yaw)
      ).normalize();

      // 1. BARE-HANDED MODE (Weapon Sheathed): Grapple Enemy Ragdoll, Catapult-Throw Enemy, or Execute Parkour Ledge Clamber!
      if (fpSpringRigRef.current.isSheathed) {
        rightHandGestureTimerRef.current = 0.55;

        // If already grappling a live enemy ragdoll, slam or catapult-hurl them!
        if (grappledEnemyRef.current) {
          const heldEnt = grappledEnemyRef.current;
          grappledEnemyRef.current = null;
          setGrappledEnemyName(null);

          const isCatapult = triggerSource === 'right-click';
          const launchVec = isCatapult
            ? forward
                .clone()
                .multiplyScalar(38)
                .add(new THREE.Vector3(0, 12.5, 0))
            : forward
                .clone()
                .multiplyScalar(16)
                .add(new THREE.Vector3(0, -24.0, 0));

          heldEnt.applyInternalGoreTrauma(
            'calcified-marrow-shatter',
            0.78,
            launchVec,
            ex.pos
          );

          if (visceralCombatRigRef.current) {
            spawnArterialGoreAndDismemberment({
              rig: visceralCombatRigRef.current,
              targetEntity: heldEnt,
              hitPos: heldEnt.particles[1].pos.clone(),
              strikeDir: forward,
              activeElement: activeBaseElementRef.current,
              forceSeverLimb: true,
              evalHeight: (x, z) =>
                evaluateTerrainHeight(
                  x,
                  z,
                  activeWorld,
                  excavationsRef.current
                ),
            });
          }

          // Carve an impact crater if suplex-slammed into the ground
          if (!isCatapult) {
            const impactPos = heldEnt.particles[0].pos;
            onMineTerrainAtRef.current(
              {
                x: Number(impactPos.x.toFixed(2)),
                z: Number(impactPos.z.toFixed(2)),
                radius: 2.1,
                depth: 0.75,
              },
              [activeWorld.primaryResource]
            );
          }

          setDevianceXP((xp) => xp + 2);
          setLastCombatBanner(
            isCatapult
              ? `💥 BARE-HANDED RAGDOLL CATAPULT! Hurled ${heldEnt.blueprint.name} at 38 m/s (+2 Deviance XP)!`
              : `💥 BARE-HANDED SUPLEX CRATER SLAM! Shattered ${heldEnt.blueprint.name} into the strata (+2 Deviance XP)!`
          );
          onImpactSpikeRef.current(1.0);
          harmonicSoundscape.triggerArchitecturalChord(4);
          return;
        }

        // Try to Grapple a nearby enemy ragdoll within 7.8m
        let nearestEnt: ArticulatedRagdollEntity | null = null;
        let bestDist = 7.8;
        for (const ent of entitiesRef.current) {
          const d = ent.particles[1].pos.distanceTo(ex.pos);
          if (d < bestDist) {
            bestDist = d;
            nearestEnt = ent;
          }
        }

        if (nearestEnt && triggerSource === 'left-click') {
          grappledEnemyRef.current = nearestEnt;
          setGrappledEnemyName(nearestEnt.blueprint.name);
          fpSpringRigRef.current.triggerClamberOrParkourImpulse();
          setLastCombatBanner(
            `🤼 GRAPPLED ${nearestEnt.blueprint.name.toUpperCase()} BY THE TORSO! [R-Click] Catapult-Throw Ragdoll · [L-Click] Suplex Crater Slam!`
          );
          harmonicSoundscape.triggerChime(2, 0.65);
          return;
        }

        // Otherwise, Right-Click (or Left-Click with no enemy nearby) executes an athletic 2-Handed Parkour Vault / Clamber!
        const graftState = somaticGraftStateRef.current;
        ex.vel.y = 13.8 * graftState.jumpBoostMultiplier;
        ex.vel.x += forward.x * 11.5 * graftState.speedBoostMultiplier;
        ex.vel.z += forward.z * 11.5 * graftState.speedBoostMultiplier;
        ex.grounded = false;
        fpSpringRigRef.current.triggerClamberOrParkourImpulse();
        setLastCombatBanner(
          `🤸 Bare-Handed Parkour Ledge Vault & Clamber Impulse!`
        );
        harmonicSoundscape.triggerChime(3, 0.5);
        return;
      }

      // 2. WEAPON DRAWN MODE: Check Magazine Ammo & Fire SubType-Specific Destructive Munitions!
      const equippedWeapon = resolveCompendiumItemById(
        compendiumStateRef.current.equippedRightHandId,
        compendiumStateRef.current
      );
      const usesMag = isMagazineFedRangedWeapon(equippedWeapon);

      if (usesMag) {
        if (fpSpringRigRef.current.reloadTimer > 0) {
          return;
        }
        if (fpSpringRigRef.current.currentAmmo <= 0) {
          handleReloadActiveWeapon();
          return;
        }
        fpSpringRigRef.current.consumeAmmoOnFire();
      }

      rightHandGestureTimerRef.current = 0.48;
      fpSpringRigRef.current.triggerRangedFireRecoil(
        equippedWeapon.weaponSubType
      );
      weaponHandControllerRef.current.triggerWeaponRecoilFlick(
        equippedWeapon.weaponSubType,
        triggerSource === 'right-click'
      );
      setWeaponCombatState(fpSpringRigRef.current.getCombatState());

      const elemId =
        equippedWeapon.elementAffinity ?? activeBaseElementRef.current;
      const elemSpec =
        BASE_DIMENSIONAL_ELEMENTS[elemId] ??
        BASE_DIMENSIONAL_ELEMENTS['chrono-phase'];
      const accentHex =
        equippedWeapon.visualSpec.accentEmissiveHex || elemSpec.emissiveHex;
      const primaryHex =
        equippedWeapon.visualSpec.primaryHex || elemSpec.colorHex;

      const muzzleOrigin =
        mode === 'first-person'
          ? camera.position
              .clone()
              .addScaledVector(forward, 0.95)
              .addScaledVector(rightVec, 0.22)
              .add(new THREE.Vector3(0, -0.14, 0))
          : ex.pos
              .clone()
              .add(new THREE.Vector3(0, 1.48, 0))
              .addScaledVector(forward, 1.15);

      // Spawn 3D Muzzle Flash Shock-Ring at Barrel Tip
      const flashRing = new THREE.Mesh(
        new THREE.RingGeometry(0.08, 0.28, 20),
        new THREE.MeshBasicMaterial({
          color: accentHex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.92,
          blending: THREE.AdditiveBlending,
        })
      );
      flashRing.position.copy(muzzleOrigin);
      flashRing.lookAt(muzzleOrigin.clone().add(forward));
      scene.add(flashRing);
      shockwavesRef.current.push({ mesh: flashRing, age: 0, maxAge: 0.22 });

      const subType = equippedWeapon.weaponSubType;
      const isHeavyAlt = triggerSource === 'right-click';
      const dmgScale =
        Math.max(0.85, equippedWeapon.stats.damage / 38) *
        (isHeavyAlt ? 1.35 : 1.0);

      // Build SubType-Specific Multi-Part 3D Destructive Ordinance
      const shotCount =
        subType === 'spore-caster'
          ? 3
          : subType === 'resonance-pistol' && isHeavyAlt
          ? 2
          : 1;

      for (let s = 0; s < shotCount; s++) {
        const projGroup = new THREE.Group();
        const coreMat = new THREE.MeshStandardMaterial({
          color: primaryHex,
          emissive: accentHex,
          emissiveIntensity: 1.5,
          roughness: 0.1,
          metalness: 0.8,
        });
        const haloMat = new THREE.MeshBasicMaterial({
          color: accentHex,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
        });

        let speed = 46;
        let craterRadius = isHeavyAlt ? 1.65 : 0.95;

        if (subType === 'void-arbalest') {
          // Heavy Singularity Harpoon Bolt + Gravitational Torus Wake
          const lance = new THREE.Mesh(
            new THREE.ConeGeometry(0.12, 0.95, 8),
            coreMat
          );
          lance.rotation.x = Math.PI / 2;
          projGroup.add(lance);
          const wakeRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.28, 0.035, 8, 20),
            haloMat
          );
          projGroup.add(wakeRing);
          speed = 54;
          craterRadius = 2.25;
        } else if (subType === 'excavating-lance') {
          // Geotechnical Plasma Auger Beam + Helical Cutter Ring
          const beam = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.14, 1.15, 10),
            coreMat
          );
          beam.rotation.x = Math.PI / 2;
          projGroup.add(beam);
          const cutter = new THREE.Mesh(
            new THREE.TorusKnotGeometry(0.22, 0.03, 24, 6),
            haloMat
          );
          projGroup.add(cutter);
          speed = 42;
          craterRadius = 2.6;
        } else if (subType === 'spore-caster') {
          // Bioluminescent Volatile Spore Ampoule Cluster
          const sac = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.22, 1),
            coreMat
          );
          projGroup.add(sac);
          const aura = new THREE.Mesh(
            new THREE.RingGeometry(0.24, 0.34, 14),
            haloMat
          );
          projGroup.add(aura);
          speed = 34;
          craterRadius = 1.45;
        } else if (
          subType === 'cleaver-halberd' ||
          subType === 'gravity-hammer' ||
          subType === 'prism-saber'
        ) {
          // Seismic Cleave / Refractive Crescent Shock-Wave Blade
          const crescent = new THREE.Mesh(
            new THREE.TorusGeometry(0.62, 0.065, 8, 24, Math.PI),
            coreMat
          );
          crescent.rotation.x = Math.PI / 2;
          projGroup.add(crescent);
          const innerCore = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.24, 0),
            haloMat
          );
          projGroup.add(innerCore);
          speed = 38;
          craterRadius = 2.1;
        } else {
          // Resonance Pistol / Chrono Tuning Fork: High-Velocity Piezo-Rail Slug + Plasma Helix
          const slug = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.2, 1),
            coreMat
          );
          projGroup.add(slug);
          const coil = new THREE.Mesh(
            new THREE.TorusGeometry(0.24, 0.025, 8, 16),
            haloMat
          );
          projGroup.add(coil);
          speed = 50;
          craterRadius = isHeavyAlt ? 1.75 : 1.15;
        }

        const spreadDir = forward.clone();
        if (shotCount > 1) {
          const offset = (s - (shotCount - 1) * 0.5) * 0.065;
          spreadDir.addScaledVector(rightVec, offset);
          spreadDir.y += (Math.random() - 0.5) * 0.03;
          spreadDir.normalize();
        }

        projGroup.position.copy(muzzleOrigin);
        projGroup.lookAt(muzzleOrigin.clone().add(spreadDir));
        scene.add(projGroup);

        projectilesRef.current.push({
          mesh: projGroup,
          pos: muzzleOrigin.clone(),
          vel: spreadDir.multiplyScalar(speed),
          age: 0,
          maxAge: 2.8,
          weaponSubType: subType,
          elementId: elemId,
          damageScale: dmgScale,
          carveCraterRadius: craterRadius,
        });
      }

      onImpactSpikeRef.current(isHeavyAlt ? 0.65 : 0.42);
      harmonicSoundscape.triggerArchitecturalChord(isHeavyAlt ? 3 : 1);

      if (usesMag && fpSpringRigRef.current.currentAmmo === 0) {
        setLastCombatBanner(
          `🔥 Fired Last Cell of ${equippedWeapon.name} — Press [R] to Reload!`
        );
      } else {
        setLastCombatBanner(
          `🔥 Discharged ${equippedWeapon.name} (${
            usesMag
              ? `${fpSpringRigRef.current.currentAmmo}/${fpSpringRigRef.current.maxMagazine} Cells`
              : 'Seismic Wave'
          })`
        );
      }
    };

    // Execute Primary Tool Action: Kinetic Impulse OR Precision Granular Dirt Mining OR Place Void Building OR Weave Harmonic Tether
    executePrimaryToolActionRef.current = (
      overrideTool?: PlayerInteractionTool
    ) => {
      const ex = explorerStateRef.current;
      const mode = cameraModeRef.current;
      const activeWorld = worldRef.current;

      // If weapon is sheathed (Bare-Handed Mode) and no explicit override tool was passed, Left-Click executes Bare-Handed Ragdoll Grapple / Suplex!
      if (!overrideTool && fpSpringRigRef.current.isSheathed) {
        executeDestructiveWeaponFireRef.current('left-click');
        return;
      }

      const equippedCompendiumWeapon = resolveCompendiumItemById(
        compendiumStateRef.current.equippedRightHandId,
        compendiumStateRef.current
      );

      const forward = new THREE.Vector3(
        -Math.sin(ex.yaw) * Math.cos(ex.pitch),
        Math.sin(ex.pitch),
        -Math.cos(ex.yaw) * Math.cos(ex.pitch)
      ).normalize();

      // Determine whether the player is aiming at the ground to excavate a micro-portion of dirt!
      let raycastGroundPoint: THREE.Vector3 | null = null;
      if (terrainMeshRef.current) {
        const rayOrigin =
          mode === 'first-person'
            ? camera.position.clone()
            : ex.pos.clone().add(new THREE.Vector3(0, 1.55, 0));
        const raycaster = new THREE.Raycaster(rayOrigin, forward, 0.2, 13.5);
        const hits = raycaster.intersectObject(terrainMeshRef.current, false);
        if (hits.length > 0) {
          raycastGroundPoint = hits[0].point;
        }
      }

      let tool = overrideTool ?? activeToolRef.current;
      if (tool === 'grapple-hook') {
        handleFireGrappleHook(false);
        return;
      }
      // If no overrideTool was forced and the player is looking down at nearby ground (< 9.5m away) without an enemy right in front, automatically scoop granular dirt!
      if (
        !overrideTool &&
        tool === 'kinetic-impulse' &&
        raycastGroundPoint &&
        ex.pitch < -0.22 &&
        raycastGroundPoint.distanceTo(ex.pos) <= 9.5 &&
        !visceralCombatRigRef.current?.heldObject
      ) {
        const hasCloseEnemy = entitiesRef.current.some(
          (ent) => ent.particles[1].pos.distanceTo(ex.pos) <= 5.5
        );
        if (!hasCloseEnemy) {
          tool = 'mine-terrain';
        }
      }

      // RANGED GUN / ARBALEST / LANCE / CASTER CHECK:
      // When holding a ranged weapon and not digging dirt at feet or placing a building, Left-Click fires the weapon with its authentic ballistic recoil & barrel blowback animation (NOT a fist punch)!
      const isRangedGun = isMagazineFedRangedWeapon(equippedCompendiumWeapon);
      if (
        isRangedGun &&
        !overrideTool &&
        tool === 'kinetic-impulse' &&
        !visceralCombatRigRef.current?.heldObject
      ) {
        executeDestructiveWeaponFireRef.current('left-click');
        return;
      }

      // Otherwise (Melee Weapons, Improvised Limbs, or Excavation Tools), trigger the 3-Stage Directional Melee Slash Combo & WeaponHandAnimationController!
      rightHandGestureTimerRef.current = 0.55;
      fpSpringRigRef.current.triggerPrimaryStrikeImpulse(
        equippedCompendiumWeapon.stats.swingSpeedHz,
        equippedCompendiumWeapon.weaponSubType
      );
      if (tool !== 'kinetic-impulse') {
        weaponHandControllerRef.current.triggerToolActionAnimation(tool);
      } else {
        weaponHandControllerRef.current.triggerMeleeWeaponSwing(
          equippedCompendiumWeapon.weaponSubType,
          fpSpringRigRef.current.meleeComboStage,
          equippedCompendiumWeapon.stats.swingSpeedHz
        );
      }
      setWeaponCombatState(fpSpringRigRef.current.getCombatState());
      if (visceralCombatRigRef.current) {
        visceralCombatRigRef.current.meleeSwingTimer =
          visceralCombatRigRef.current.meleeSwingDuration;
      }

      // VISCERAL MELEE DISMEMBERMENT, IMPROVISED WEAPON CLEAVE & STEALTH EXECUTION CHECK:
      // If holding a physical improvised weapon/limb OR striking an entity within close melee range (< 5.6m), perform anatomical cleave!
      const combatRig = visceralCombatRigRef.current;
      if (
        combatRig &&
        (combatRig.heldObject || tool === 'kinetic-impulse')
      ) {
        const baseReach = Math.max(
          5.6,
          equippedCompendiumWeapon.stats.reachMeters * 1.65
        );
        const meleeReach =
          !ex.grounded &&
          unlockedPerkIdsRef.current.includes('perk-aerial-void-drop')
            ? baseReach + 2.4
            : baseReach;
        const meleeOrigin =
          mode === 'first-person'
            ? camera.position.clone()
            : ex.pos.clone().add(new THREE.Vector3(0, 1.45, 0));
        const meleeRayEnd = meleeOrigin
          .clone()
          .addScaledVector(forward, meleeReach);
        const limbMeleeHit =
          spatialCollisionSolver.raycastSubSteppedAnatomicalLimbs(
            meleeOrigin,
            meleeRayEnd,
            0.78,
            entitiesRef.current
          );
        const targetEnt =
          limbMeleeHit?.entity ??
          entitiesRef.current.find(
            (ent) => ent.particles[1].pos.distanceTo(ex.pos) <= meleeReach
          );

        if (targetEnt) {
          const elemId =
            combatRig.heldObject?.infusedElement ??
            equippedCompendiumWeapon.elementAffinity ??
            activeBaseElementRef.current;
          const elemSpec =
            BASE_DIMENSIONAL_ELEMENTS[elemId] ??
            BASE_DIMENSIONAL_ELEMENTS['chrono-phase'];
          const isStealthKill =
            isStealthCrouchingRef.current &&
            unlockedPerkIdsRef.current.includes('perk-silent-execution');
          const isAerialSlam =
            !ex.grounded &&
            unlockedPerkIdsRef.current.includes('perk-aerial-void-drop');

          const weaponDmgScale = Math.max(
            0.85,
            equippedCompendiumWeapon.stats.damage / 42
          );
          const strikeForce =
            (isStealthKill ? 32 : isAerialSlam ? 38 : 24) *
            elemSpec.damageMultiplier *
            weaponDmgScale;
          const blastVec = forward
            .clone()
            .multiplyScalar(strikeForce)
            .add(new THREE.Vector3(0, 9.5, 0));

          targetEnt.applyInternalGoreTrauma(
            'laceration-hemorrhage',
            0.55 * elemSpec.damageMultiplier,
            blastVec,
            ex.pos
          );

          // Trigger physical Melee Swing Impact Rebound & Hit-Stop on the WeaponHandAnimationController!
          weaponHandControllerRef.current.triggerMeleeSwingImpactRebound(
            isAerialSlam ? 1.45 : isStealthKill ? 1.25 : 1.0
          );

          const { didSeverLimb, severedPartName } =
            spawnArterialGoreAndDismemberment({
              rig: combatRig,
              targetEntity: targetEnt,
              hitPos: targetEnt.particles[1].pos.clone(),
              strikeDir: forward,
              activeElement: elemId,
              forceSeverLimb:
                isStealthKill ||
                isAerialSlam ||
                Boolean(combatRig.heldObject),
              evalHeight: (x, z) =>
                evaluateTerrainHeight(
                  x,
                  z,
                  activeWorld,
                  excavationsRef.current
                ),
            });

          // Promote surviving dismembered creature into a Scarred Anomaly Nemesis in the Sims registry!
          const simEntry = denizenSimsRef.current.find(
            (s) => s.entityId === targetEnt.id
          );
          if (simEntry && didSeverLimb) {
            simEntry.isScarredNemesis = true;
            simEntry.scarredMissingLimb = severedPartName;
            simEntry.outworlderXenophobia = 100;
            simEntry.isPlottingSabotage = true;
            setDenizenSims([...denizenSimsRef.current]);
          }

          const weaponLabel = combatRig.heldObject
            ? combatRig.heldObject.name
            : equippedCompendiumWeapon.name;
          const prefix = isStealthKill
            ? 'SILENT VOID-SHEAR EXECUTION!'
            : isAerialSlam
            ? 'APEX DEATH-FROM-ABOVE SLAM!'
            : didSeverLimb
            ? 'VISCERAL DISMEMBERMENT!'
            : 'MELEE CLEAVE!';

          const xpGain = isStealthKill || didSeverLimb ? 2 : 1;
          setDevianceXP((xp) => xp + xpGain);
          autonomicEquationEngine.recordGameplayEquationDiscovery(
            'visceral-limb-cleave',
            didSeverLimb ? 1.35 : 0.85
          );
          const bannerMsg = `${prefix} ${
            didSeverLimb
              ? `Severed ${severedPartName} with ${weaponLabel}`
              : `Struck ${targetEnt.blueprint.name} with ${weaponLabel}`
          } (+${xpGain} Deviance XP)`;
          combatRig.lastCombatEventBanner = bannerMsg;
          setLastCombatBanner(bannerMsg);
          onImpactSpikeRef.current(isAerialSlam ? 1.0 : 0.85);
          return;
        }
      }

      // If Player is physically inside the Walk-In 3D Void Ball Sanctuary, clicking or pressing action keys interacts directly with the 3D Holographic Workstations!
      const structTel = latestStructuralTelemetryRef.current;
      const voidRig = walkInVoidRigRef.current;
      if (
        structTel &&
        structTel.isInsideVoidBall &&
        voidRig &&
        !overrideTool &&
        tool !== 'place-building'
      ) {
        const station = structTel.focusedVoidStation;
        if (station === 'bim-structural-table') {
          const curIdx = BIM_LAYER_SEQUENCE.findIndex(
            (b) => b.id === voidRig.activeBimLayer
          );
          const nextLayer =
            BIM_LAYER_SEQUENCE[(curIdx + 1) % BIM_LAYER_SEQUENCE.length].id;
          voidRig.activeBimLayer = nextLayer;

          const preset = activeBuildingPresetRef.current;
          const newMini = buildEngineeredArchitectureMesh(
            preset,
            activeWorld.palette.accentColor,
            nextLayer,
            true,
            performance.now() * 0.001
          );
          newMini.scale.setScalar(0.32);
          newMini.position.y = 1.05;
          if (voidRig.bimTableGroup.children.length > 2) {
            voidRig.bimTableGroup.remove(
              voidRig.bimTableGroup.children[
                voidRig.bimTableGroup.children.length - 1
              ]
            );
          }
          voidRig.bimTableGroup.add(newMini);

          const newFullGhost = buildEngineeredArchitectureMesh(
            preset,
            activeWorld.palette.accentColor,
            nextLayer,
            true,
            performance.now() * 0.001
          );
          if (voidRig.buildSpaceGhostGroup.children.length > 0) {
            voidRig.buildSpaceGhostGroup.remove(
              voidRig.buildSpaceGhostGroup.children[0]
            );
          }
          voidRig.buildSpaceGhostGroup.children.unshift(newFullGhost);
          return;
        } else if (station === 'recipe-synthesis-crucible') {
          const rec =
            CRAFTING_RECIPES[
              voidRig.activeRecipeIndex % CRAFTING_RECIPES.length
            ];
          if (rec && onCraftRecipeFromVoidStationRef.current) {
            onCraftRecipeFromVoidStationRef.current(rec);
          }
          return;
        } else if (station === 'dermal-lexicon-holoprojector') {
          if (onToggleStrainHeatmapFromVoidStationRef.current) {
            onToggleStrainHeatmapFromVoidStationRef.current();
          }
          return;
        } else if (station === 'dimensional-stargate-ring') {
          if (onShiftDimensionFromVoidStationRef.current) {
            onShiftDimensionFromVoidStationRef.current();
          }
          return;
        }
      }

      if (tool === 'harmonic-tether') {
        for (const sec of generatedSectorsRef.current.values()) {
          const [px, pz] = sec.pylonCoords;
          if (Math.hypot(ex.pos.x - px, ex.pos.z - pz) < 9.5) {
            const nextW = Number(
              Math.max(-1, Math.min(1, Math.sin(performance.now() * 0.0017))).toFixed(2)
            );
            onSyncTemporalLoopStateRef.current(0, nextW);
            somaticGraftStateRef.current.lastWorldMechanicEvent = `Tethered 3D 4D-Node Pylon in ${sec.name} → Shifted W=${nextW}`;
            harmonicSoundscape.triggerArchitecturalChord(4);
          }
        }
        for (const org of organPickupsRef.current) {
          if (org.pos.distanceTo(ex.pos) < 14.0) {
            org.vel
              .subVectors(ex.pos, org.pos)
              .normalize()
              .multiplyScalar(18.0);
          }
        }

        if (interconnectedWebRef.current) {
          const { tetheredEntity } = weaveHarmonicTetherWithEntity(
            interconnectedWebRef.current,
            entitiesRef.current,
            ex.pos,
            forward
          );
          const ringOrigin = tetheredEntity
            ? tetheredEntity.particles[0].pos.clone()
            : ex.pos.clone();
          const ringGeo = new THREE.RingGeometry(0.45, 1.15, 28);
          const ringMat = new THREE.MeshBasicMaterial({
            color: activeWorld.playableCharacter.voidOrbColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.92,
            blending: THREE.AdditiveBlending,
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = -Math.PI / 2;
          ringMesh.position.set(ringOrigin.x, ringOrigin.y + 0.15, ringOrigin.z);
          scene.add(ringMesh);
          shockwavesRef.current.push({ mesh: ringMesh, age: 0, maxAge: 0.75 });
        }
        return;
      }

      if (tool === 'mine-terrain') {
        // Precision Crosshair Micro-Portion Dirt Excavation:
        // Use exact raycast intersection on the terrain mesh when available, otherwise strike 3.8m ahead of the player!
        const reach = 3.8;
        const targetX = raycastGroundPoint
          ? raycastGroundPoint.x
          : ex.pos.x - Math.sin(ex.yaw) * reach;
        const targetZ = raycastGroundPoint
          ? raycastGroundPoint.z
          : ex.pos.z - Math.cos(ex.yaw) * reach;

        // Small, crisp granular scoop radius scaled by equipped Compendium Tool/Weapon excavationPower!
        const excavMult = Math.max(
          0.85,
          Math.min(1.65, equippedCompendiumWeapon.stats.excavationPower * 0.55)
        );
        const spot: TerrainExcavationSpot = {
          x: Number(targetX.toFixed(2)),
          z: Number(targetZ.toFixed(2)),
          radius: Number((1.65 * excavMult).toFixed(2)),
          depth: Number((0.68 * excavMult).toFixed(2)),
        };

        const groundY = evaluateTerrainHeight(
          targetX,
          targetZ,
          activeWorld,
          excavationsRef.current
        );

        const soilProps = getSoilPropertiesForDimension(
          currentDimIndexRef.current,
          activeWorld.archetype
        );

        const harvested: ResourceId[] = [
          soilProps.element.miningYieldResId,
          activeWorld.primaryResource,
          Math.random() < 0.55
            ? activeWorld.secondaryResource
            : 'calcified-memory',
        ];
        if (soilProps.effectiveHardnessMohs >= 8.5 || Math.random() < 0.35) {
          harvested.push('void-singularity-dust');
        }

        // 1. Trigger Deep Dirt-Like Granular Soil Burst (550+ instanced soil grains + 3D flying soil clods + persistent rim dirt mounds)
        if (granularDirtRigRef.current) {
          triggerGranularDirtExcavationBurst({
            rig: granularDirtRigRef.current,
            hitPos: new THREE.Vector3(targetX, groundY, targetZ),
            world: activeWorld,
            scoopRadius: spot.radius,
            scoopDepth: spot.depth,
            evalHeight: (x, z) =>
              evaluateTerrainHeight(
                x,
                z,
                activeWorld,
                excavationsRef.current
              ),
          });
        }

        // 2. Also trigger elemental mineral shatter rig
        if (excavationShatterRigRef.current) {
          excavationShatterRigRef.current.triggerExcavation(
            new THREE.Vector3(targetX, groundY, targetZ),
            soilProps,
            spot.radius
          );
        }

        const impactMagnitude =
          0.45 + (soilProps.effectiveHardnessMohs / 10.0) * 0.65;
        onImpactSpikeRef.current(impactMagnitude);

        // Spawn glowing 3D Resource Shards flying toward the player's Left-Hand Void Ball
        for (const resId of harvested) {
          const meta = RESOURCE_CATALOG[resId];
          const shardMesh = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.18, 0),
            new THREE.MeshStandardMaterial({
              color: meta.color,
              emissive: meta.color,
              emissiveIntensity: 0.9,
            })
          );
          const startPos = new THREE.Vector3(
            targetX + (Math.random() - 0.5) * 0.9,
            groundY + 0.35,
            targetZ + (Math.random() - 0.5) * 0.9
          );
          shardMesh.position.copy(startPos);
          scene.add(shardMesh);
          shardsRef.current.push({
            mesh: shardMesh,
            pos: startPos,
            vel: new THREE.Vector3(0, 4.8 + Math.random() * 1.8, 0),
            age: 0,
            resourceId: resId,
          });
        }

        onMineTerrainAtRef.current(spot, harvested);
        // Also harvest Multiversal Matter from the active Differential Universe Boundary when excavating deep strata!
        const activeBoundary =
          DIFFERENTIAL_UNIVERSE_BOUNDARIES[
            biodepthConfigRef.current.activeUniverseBoundary
          ];
        const minedMatter =
          Math.random() < 0.65
            ? activeBoundary.primaryMatterYield
            : activeBoundary.secondaryMatterYield;
        setMatterInventory((prev) => ({
          ...prev,
          [minedMatter]: (prev[minedMatter] ?? 0) + 1,
        }));
        setLastCombatBanner(
          `⛏️ Excavated Soil Strata at (${spot.x}m, ${spot.z}m) · +1 ${MULTIVERSAL_MATTER_CATALOG[minedMatter].shortName}`
        );
        return;
      }

      if (tool === 'place-building') {
        const preset = activeBuildingPresetRef.current;
        const reach = 7.5;
        const bx = ex.pos.x - Math.sin(ex.yaw) * reach;
        const bz = ex.pos.z - Math.cos(ex.yaw) * reach;
        const by = evaluateTerrainHeight(
          bx,
          bz,
          activeWorld,
          excavationsRef.current
        );

        const newBuilding: PlacedWorldBuilding = {
          id: `bld-${Date.now()}`,
          presetId: preset.id,
          presetName: preset.name,
          x: Number(bx.toFixed(2)),
          y: Number(by.toFixed(2)),
          z: Number(bz.toFixed(2)),
          rotationY: ex.yaw,
          blocks: preset.blocks,
        };
        onPlaceBuildingAtRef.current(newBuilding);
        return;
      }

      // Default: Fire Equipped Weapon's Multi-Part Destructive Ballistic Discharge!
      executeDestructiveWeaponFireRef.current('left-click');
    };

    // Build initial world environment
    rebuildWorldEnvironment(worldRef.current);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 1280;
      const h = container.clientHeight || 720;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      pipeline.updateSize(w, h, renderer.getPixelRatio());
    };
    window.addEventListener('resize', handleResize);

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }
      const code = e.code;
      keysPressedRef.current.add(code);

      // [Shift + V]: Sink Player Perspective into 3D Mindspace Customization Chamber with 3 Live Example Figures!
      if (e.shiftKey && code === 'KeyV') {
        e.preventDefault();
        setMindspaceDialConfig((prev) => {
          const nextOpen = !prev.isMindspaceOpen;
          setLastCombatBanner(
            nextOpen
              ? '🧠 Sinking Perspective into 3D Mindspace Chamber — Customize Relic HUD Themes, [V] Void Dial & Morphs!'
              : '⇪ Returned from 3D Mindspace to Active Manifold Perspective.'
          );
          return {
            ...prev,
            isMindspaceOpen: nextOpen,
            isVoidDialOpen: false,
          };
        });
        harmonicSoundscape.triggerArchitecturalChord(3);
        return;
      }

      // Dynamic Quick Keys [1] - [4] (Context-sensitive to Void Ball Dial Sector, Open Portal, Maze Gate, or Held Substrate)
      if (
        code === 'Digit1' ||
        code === 'Digit2' ||
        code === 'Digit3' ||
        code === 'Digit4'
      ) {
        const keyNum = Number(code.replace('Digit', '')) as 1 | 2 | 3 | 4;
        const quickbarWeapons = compendiumStateRef.current.quickbarItemIds
          .slice(0, 4)
          .map((id) =>
            resolveCompendiumItemById(id, compendiumStateRef.current)
          );
        const bindings = resolveDynamicQuickKeyBindings({
          dialConfig: mindspaceDialConfigRef.current,
          isPortalOpenInWorld:
            realityTearPortalRigRef.current?.isPortalOpenInWorld ?? false,
          isInsidePortalRoom:
            realityTearPortalRigRef.current?.isPlayerInsidePortalRoom ?? false,
          isInnerMazePortalOpen:
            realityTearPortalRigRef.current?.isInnerMazePortalOpen ?? false,
          isInsideMazeDimension:
            realityTearPortalRigRef.current?.isPlayerInsideMazeDimension ??
            false,
          heldObjectName: visceralCombatRigRef.current?.heldObject?.name ?? null,
          activeElement: activeBaseElementRef.current,
          quickbarWeapons,
          activeTool: activeToolRef.current,
        });
        const targetBinding = bindings[keyNum - 1];
        if (targetBinding) {
          handleTriggerDynamicQuickKey(targetBinding);
          return;
        }
      }

      // Base Dimensional Element hotkeys [5] - [6]
      const elementKeys: Record<string, BaseDimensionalElementId> = {
        Digit5: 'chrono-phase',
        Digit6: 'bio-miasmic',
      };
      if (elementKeys[code]) {
        handleSelectBaseElement(elementKeys[code]);
        return;
      }

      const kb = biodepthConfigRef.current.keybinds;

      const portalRig = realityTearPortalRigRef.current;

      // Flick through the 100+ Procedural Mazes with Left/Right Arrow keys when the Secondary Inner Maze Portal is open inside the Portal Room!
      if (
        portalRig &&
        portalRig.isPlayerInsidePortalRoom &&
        portalRig.isInnerMazePortalOpen &&
        (code === 'ArrowLeft' || code === 'ArrowRight')
      ) {
        e.preventDefault();
        handleCycleMazeSelection(code === 'ArrowRight' ? 1 : -1);
        return;
      }

      if (code === kb.handInventory) {
        handleChangeVoidBallMode(
          voidBallModeRef.current === 'hand-inventory-bloom'
            ? 'dormant-clenched'
            : 'hand-inventory-bloom'
        );
        return;
      } else if (code === kb.openPortal) {
        if (e.repeat) return;
        vKeyDownAtMsRef.current = performance.now();
        const scheme = mindspaceDialConfigRef.current.dialControlScheme;

        // Inside the Maze Dimension: [V] returns the player directly to the 36m×36m Square Portal Room
        if (portalRig?.isPlayerInsideMazeDimension) {
          portalRig.isPlayerInsideMazeDimension = false;
          portalRig.isPlayerInsidePortalRoom = true;
          portalRig.portalTeleportCooldown = 1.2;
          explorerStateRef.current.pos.set(
            PORTAL_ROOM_ORIGIN.x + 6.8,
            PORTAL_ROOM_ORIGIN.y,
            PORTAL_ROOM_ORIGIN.z + 12.2
          );
          explorerStateRef.current.vel.set(0, 0, 0);
          explorerStateRef.current.yaw = 0;
          povFlowStateRef.current.smoothVisualY = PORTAL_ROOM_ORIGIN.y;
          povFlowStateRef.current.elevationSpringOffset = 0;
          setLastCombatBanner(
            `⇪ Returned from Maze Dimension to 36m×36m Square Portal Room!`
          );
          harmonicSoundscape.triggerArchitecturalChord(2);
          return;
        }

        // Inside the 36m×36m Square Portal Room: [V] toggles the Secondary Inner Maze Selection Portal AND opens the Void Ball Dial!
        if (portalRig?.isPlayerInsidePortalRoom) {
          portalRig.isInnerMazePortalOpen = !portalRig.isInnerMazePortalOpen;
          const selMaze =
            portalRig.knownMazes[portalRig.selectedMazeIndex] ??
            portalRig.knownMazes[0];
          const themeSpec =
            MAZE_ENTITY_THEME_CATALOG[selMaze.horrorArchetypeId];
          setMindspaceDialConfig((prev) => ({
            ...prev,
            isVoidDialOpen: portalRig.isInnerMazePortalOpen,
            activeDialSector: 'portals-and-mazes',
          }));
          setLastCombatBanner(
            portalRig.isInnerMazePortalOpen
              ? `🚪 Opened Secondary Maze Gate & Void Dial! Active: ${selMaze.code} "${selMaze.title}" (${themeSpec.themeName}) · Press [←/→] or [1-4] Quick Keys!`
              : `Closed Secondary Inner Maze Selection Portal & Void Dial.`
          );
          harmonicSoundscape.triggerArchitecturalChord(3);
          return;
        }

        if (scheme === 'hold-dial-tap-portal') {
          setMindspaceDialConfig((prev) => ({
            ...prev,
            isVoidDialOpen: true,
          }));
          harmonicSoundscape.triggerChime(2, 0.45);
          return;
        }

        // Default ('toggle-dial-quickkeys' or 'wheel-dial-click-confirm'): Toggle the Void Ball Menu Dial!
        setMindspaceDialConfig((prev) => {
          const nextOpen = !prev.isVoidDialOpen;
          return {
            ...prev,
            isVoidDialOpen: nextOpen,
          };
        });
        harmonicSoundscape.triggerChime(3, 0.45);
        return;
      } else if (code === kb.toggleCrucible) {
        setIsBiodepthCrucibleModalOpen((prev) => !prev);
        return;
      } else if (code === kb.stealthCrouch) {
        setIsStealthCrouching((prev) => {
          const next = !prev;
          isStealthCrouchingRef.current = next;
          setLastCombatBanner(
            next
              ? '👁️ Entered Predator Stealth Prowl (Silent Footsteps & Trojan Quest Eavesdropping Active)'
              : 'Exited Stealth Prowl'
          );
          return next;
        });
        return;
      } else if (code === kb.perkTree) {
        setIsPerkTreeOpen((prev) => !prev);
        return;
      } else if (code === kb.avatarStudio) {
        setStudioMode((prev) => {
          const next =
            prev === 'none' ? 'character-creation' : 'none';
          studioModeRef.current = next;
          return next;
        });
        return;
      } else if (code === kb.dimensionalShift) {
        if (portalRig?.isPlayerInsideMazeDimension) {
          const nextKind =
            portalRig.mazeDimensionRig.cycleActiveTechEquipmentKind();
          const eqSpec = MAZE_TECH_EQUIPMENT_CATALOG[nextKind];
          setLastCombatBanner(
            `📹 Selected In-Maze Tech Equipment: ${eqSpec.name} (+${eqSpec.assimilationBoostPct}% Assimilation · +${eqSpec.entityControlBoostPct}% Entity Control) · Press [B] to deploy`
          );
          harmonicSoundscape.triggerChime(3, 0.5);
        } else if (portalRig?.isPlayerInsidePortalRoom) {
          const curIdx = ALL_DIFFERENTIAL_BOUNDARY_IDS.indexOf(
            biodepthConfigRef.current.activeUniverseBoundary
          );
          const nextB =
            ALL_DIFFERENTIAL_BOUNDARY_IDS[
              (curIdx + 1) % ALL_DIFFERENTIAL_BOUNDARY_IDS.length
            ];
          handleSelectUniverseBoundary(nextB);
        } else {
          handleDecodeOrCounterSabotage();
        }
        return;
      } else if (code === kb.throwObject && !isVehicleMountedRef.current) {
        handleTriggerThrowObject();
        return;
      }

      if (code === 'Tab') {
        e.preventDefault();
        setIsCompendiumModalOpen((prev) => !prev);
        return;
      } else if (code === 'KeyJ') {
        e.preventDefault();
        handleTriggerBodyModFlurry();
        return;
      } else if (code === 'KeyB') {
        e.preventDefault();
        if (portalRig?.isPlayerInsideMazeDimension) {
          const deployRes =
            portalRig.mazeDimensionRig.deployTechEquipmentInActiveMaze(
              explorerStateRef.current.pos,
              explorerStateRef.current.yaw
            );
          if (deployRes.siphonedMatterId && deployRes.siphonedAmount) {
            const mId = deployRes.siphonedMatterId;
            const amt = deployRes.siphonedAmount;
            setMatterInventory((prev) => ({
              ...prev,
              [mId]: (prev[mId] ?? 0) + amt,
            }));
          }
          portalRig.knownMazes[portalRig.selectedMazeIndex] = {
            ...deployRes.updatedSpec,
          };
          const eqSpec = MAZE_TECH_EQUIPMENT_CATALOG[deployRes.placedItem.kind];
          setLastCombatBanner(
            `📹 Deployed ${eqSpec.name} in ${deployRes.updatedSpec.code}! Assimilation: ${Math.round(
              deployRes.updatedSpec.assimilationPct
            )}% · Entity Control: ${Math.round(
              deployRes.updatedSpec.entityControlPct
            )}% (${deployRes.updatedSpec.entityBehaviorMode})`
          );
          harmonicSoundscape.triggerArchitecturalChord(4);
          return;
        }
        if (portalRig?.isPlayerInsidePortalRoom) {
          handlePlacePortalRoomModule();
          return;
        }
        handleCycleVehicleType();
        return;
      } else if (code === 'KeyM') {
        e.preventDefault();
        setIsTimelineModalOpen((prev) => !prev);
        return;
      } else if (code === 'KeyU') {
        e.preventDefault();
        setIsAutonomicInspectorOpen((prev) => !prev);
        setAutonomicSnapshot(autonomicEquationEngine.getSnapshot());
        return;
      } else if (code === 'KeyN') {
        e.preventDefault();
        handleToggleTimelinePortal();
        return;
      } else if (code === 'KeyZ') {
        e.preventDefault();
        handleFireVoidBallActiveBeam();
        return;
      } else if (code === 'KeyH') {
        handleToggleSheathWeapon();
        return;
      } else if (code === 'KeyY') {
        fpSpringRigRef.current.triggerInspectFlourish();
        const eqItem = resolveCompendiumItemById(
          compendiumStateRef.current.equippedRightHandId,
          compendiumStateRef.current
        );
        setLastCombatBanner(
          `Inspecting 3D Rig: ${eqItem.name} (${eqItem.subTypeLabel} · ${eqItem.rarity})`
        );
        harmonicSoundscape.triggerChime(2, 0.45);
        return;
      } else if (
        code === 'F1' ||
        code === 'F2' ||
        code === 'F3' ||
        code === 'F4' ||
        code === 'F5'
      ) {
        e.preventDefault();
        const slotIdx = Number(code.replace('F', '')) - 1;
        const targetId = compendiumStateRef.current.quickbarItemIds[slotIdx];
        if (targetId) {
          handleEquipRightHandItem(targetId);
        }
        return;
      }

      if (code === 'KeyF') {
        e.preventDefault();
        handleFireGrappleHook();
      } else if (code === kb.interactGrab) {
        if (realityTearPortalRigRef.current?.isPlayerInsidePortalRoom) {
          setIsBiodepthCrucibleModalOpen(true);
          return;
        }
        // 1. First check if player is focused on a Signature Dimensional Grounding World Object!
        if (
          focusedGroundingAnchorRef.current &&
          focusedGroundingAnchorRef.current.cooldownSec <= 0
        ) {
          handleAttuneFocusedGroundingAnchor();
          return;
        }
        // 2. If weapon is sheathed (Bare Hands Mode), allow [E] to grapple or suplex nearby enemy ragdolls!
        if (fpSpringRigRef.current.isSheathed) {
          const nearEnt = entitiesRef.current.find(
            (ent) =>
              ent.particles[1].pos.distanceTo(explorerStateRef.current.pos) <=
              7.8
          );
          if (nearEnt || grappledEnemyRef.current) {
            executeDestructiveWeaponFireRef.current('left-click');
            return;
          }
        }
        // 3. Otherwise try to Grab or Drop a physical 3D world weapon/severed limb; if none nearby and hands empty, mine granular dirt!
        const combatRig = visceralCombatRigRef.current;
        const maxReach = unlockedPerkIdsRef.current.includes(
          'perk-telekinetic-snatch'
        )
          ? 18.0
          : 6.8;
        const hasNearbyGrabbable =
          combatRig &&
          (combatRig.heldObject ||
            combatRig.grabbableObjects.some(
              (o) =>
                !o.isHeldByPlayer &&
                o.pos.distanceTo(explorerStateRef.current.pos) <= maxReach
            ));
        if (hasNearbyGrabbable) {
          handleTriggerGrabOrDrop();
        } else {
          executePrimaryToolActionRef.current('mine-terrain');
        }
      } else if (code === kb.roomArchitectMode) {
        if (realityTearPortalRigRef.current?.isPlayerInsidePortalRoom) {
          handlePlacePortalRoomModule();
        } else {
          executePrimaryToolActionRef.current('place-building');
        }
      } else if (code === 'KeyT') {
        executePrimaryToolActionRef.current('harmonic-tether');
      } else if (code === 'KeyG') {
        // Mount or Dismount 5D Closed-Loop Gravity Vehicle ("Aether-Rider")
        const vehicle = gravityVehicleRigRef.current;
        if (vehicle) {
          const nextMounted = !isVehicleMountedRef.current;
          isVehicleMountedRef.current = nextMounted;
          vehicle.setMounted(nextMounted);
          if (nextMounted) {
            const dist = vehicle.root.position.distanceTo(explorerStateRef.current.pos);
            if (dist > 15.0) {
              vehicle.setPosition(
                explorerStateRef.current.pos.x,
                explorerStateRef.current.pos.y + 0.8,
                explorerStateRef.current.pos.z
              );
            }
            somaticGraftStateRef.current.lastWorldMechanicEvent =
              'Mounted 5D Closed-Loop Gravity Vehicle ("Aether-Rider")!';
          } else {
            explorerStateRef.current.pos.copy(vehicle.root.position).add(new THREE.Vector3(2.5, 0.5, 0));
            somaticGraftStateRef.current.lastWorldMechanicEvent =
              'Dismounted 5D Gravity Vehicle (Parked on terrain).';
          }
        }
      } else if (code === 'KeyR') {
        if (isVehicleMountedRef.current && gravityVehicleRigRef.current) {
          const fired = gravityVehicleRigRef.current.triggerCosmicShiftPulse();
          if (fired) {
            celestialCosmologyRigRef.current?.advanceCosmicExpansion(1);
            somaticGraftStateRef.current.lastWorldMechanicEvent =
              'Fired 5D Cosmic Shift Mass Driver: Spacetime Metric Expanded & Celestial Aligned!';
            onImpactSpikeRef.current(1.0);
          }
        } else if (
          latestStructuralTelemetryRef.current?.isInsideVoidBall &&
          walkInVoidRigRef.current
        ) {
          walkInVoidRigRef.current.activeRecipeIndex =
            (walkInVoidRigRef.current.activeRecipeIndex + 1) %
            CRAFTING_RECIPES.length;
        } else {
          handleReloadActiveWeapon();
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current.delete(e.code);
      const kb = biodepthConfigRef.current.keybinds;
      if (
        e.code === kb.openPortal &&
        !e.shiftKey &&
        mindspaceDialConfigRef.current.dialControlScheme ===
          'hold-dial-tap-portal' &&
        !realityTearPortalRigRef.current?.isPlayerInsidePortalRoom &&
        !realityTearPortalRigRef.current?.isPlayerInsideMazeDimension
      ) {
        const heldMs = performance.now() - vKeyDownAtMsRef.current;
        setMindspaceDialConfig((prev) => ({
          ...prev,
          isVoidDialOpen: false,
        }));
        if (heldMs < 240) {
          handleChangeVoidBallMode(
            voidBallModeRef.current === 'walk-in-sanctum-portal'
              ? 'dormant-clenched'
              : 'walk-in-sanctum-portal'
          );
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationFrameId: number;
    let prevTime = performance.now();
    let telemetryTimer = 0;

    const animate = (now: number) => {
      animationFrameId = requestAnimationFrame(animate);
      if (document.hidden) {
        prevTime = now;
        return;
      }
      const dt = Math.min(0.05, (now - prevTime) / 1000);
      prevTime = now;
      const nowSec = now * 0.001;
      const activeWorld = worldRef.current;
      const activeBehavior = behaviorRef.current;
      const currentW = wCoordRef.current;
      const charSpec = activeWorld.playableCharacter;

      // 0. Step Adaptive Dynamic Resolution Scaling (DRS) & Frame-Pacing Governor
      drsAndLodControllerRef.current.stepFramePacingAndDRS(
        dt * 1000,
        renderer,
        composerRef.current,
        containerRef.current?.clientWidth || window.innerWidth,
        containerRef.current?.clientHeight || window.innerHeight
      );
      sharedGeometryPool.stepShaderPulse(nowSec);

      // 1. Evaluate Whole-Biome 5D/4D Weather Physics & Update Playable Character Movement
      const ex = explorerStateRef.current;
      const keys = keysPressedRef.current;
      const weatherSample = evaluateBiomeWeatherField(
        activeWorld,
        currentW,
        nowSec,
        ex.pos,
        cloud5DCanopyRef.current?.causticBeams
      );

      let moveForward = 0;
      let moveRight = 0;
      const isVehicleMounted = isVehicleMountedRef.current;
      const vehicle = gravityVehicleRigRef.current;

      if (isVehicleMounted && vehicle) {
        const flightInputs: FlightInputState = {
          forward: keys.has('KeyW') || keys.has('ArrowUp'),
          backward: keys.has('KeyS') || keys.has('ArrowDown'),
          strafeLeft: keys.has('KeyA') || keys.has('ArrowLeft'),
          strafeRight: keys.has('KeyD') || keys.has('ArrowRight'),
          elevateUp: keys.has('Space'),
          elevateDown: keys.has('ShiftLeft') || keys.has('ShiftRight'),
          yawLeft: keys.has('KeyQ'),
          yawRight: keys.has('KeyE'),
          boost: keys.has('Tab'),
        };

        vehicle.update(
          flightInputs,
          (x, z) => evaluateTerrainHeight(x, z, activeWorld, excavationsRef.current),
          dt,
          nowSec
        );

        ex.pos.copy(vehicle.root.position);
        ex.vel.set(vehicle.getState().vel[0], vehicle.getState().vel[1], vehicle.getState().vel[2]);
        ex.grounded = vehicle.getState().flightMode === 'ground-skimmer';

        if (avatarRigRef.current) {
          avatarRigRef.current.root.position.copy(vehicle.root.position);
          avatarRigRef.current.root.visible = false;
        }

        if (vehicle.getState().flightMode === 'ground-skimmer') {
          const vState = vehicle.getState();
          const spd = Math.hypot(vState.vel[0], vState.vel[2]);
          if (spd > 3.0) {
            dimensionalSoilParticleRigRef.current?.emitFootstepBurst(
              vehicle.root.position,
              new THREE.Vector3(vState.vel[0], 0, vState.vel[2]).normalize(),
              1.2
            );
          }
        }
      } else {
        if (avatarRigRef.current) {
          avatarRigRef.current.root.visible = true;
        }
        if (vehicle) {
          const idleInputs: FlightInputState = {
            forward: false,
            backward: false,
            strafeLeft: false,
            strafeRight: false,
            elevateUp: false,
            elevateDown: false,
            yawLeft: false,
            yawRight: false,
            boost: false,
          };
          vehicle.update(
            idleInputs,
            (x, z) => evaluateTerrainHeight(x, z, activeWorld, excavationsRef.current),
            dt,
            nowSec
          );
        }

        const isFlickingMazeArrows = Boolean(
          realityTearPortalRigRef.current?.isPlayerInsidePortalRoom &&
            realityTearPortalRigRef.current?.isInnerMazePortalOpen
        );
        if (keys.has('KeyW') || keys.has('ArrowUp')) moveForward += 1;
        if (keys.has('KeyS') || keys.has('ArrowDown')) moveForward -= 1;
        if (
          keys.has('KeyD') ||
          (!isFlickingMazeArrows && keys.has('ArrowRight'))
        )
          moveRight += 1;
        if (
          keys.has('KeyA') ||
          (!isFlickingMazeArrows && keys.has('ArrowLeft'))
        )
          moveRight -= 1;

        const isSprinting = keys.has('ShiftLeft') || keys.has('ShiftRight');
        // Character speed is amplified by Interconnected Slipstream Coherence, Somatic 3D Organ Grafts, AND Active Absurd Timeline Physics!
        const graftState = somaticGraftStateRef.current;
        const timelineSpeedMult =
          voidBallEvolutionStateRef.current.activeTimeline
            .moveSpeedMultiplier ?? 1.0;
        const baseSpeed =
          (isSprinting ? 14.5 : 8.5) *
          charSpec.moveSpeedMultiplier *
          slipstreamBoostRef.current *
          graftState.speedBoostMultiplier *
          timelineSpeedMult;

        const forwardFlat = _rafForwardFlat
          .set(-Math.sin(ex.yaw), 0, -Math.cos(ex.yaw))
          .normalize();
        const rightFlat = _rafRightFlat
          .set(Math.cos(ex.yaw), 0, -Math.sin(ex.yaw))
          .normalize();

        const wishDir = _rafWishDir
          .set(0, 0, 0)
          .addScaledVector(forwardFlat, moveForward)
          .addScaledVector(rightFlat, moveRight);

        if (wishDir.lengthSq() > 0.001) {
          wishDir.normalize();
          ex.vel.x += (wishDir.x * baseSpeed - ex.vel.x) * Math.min(1, dt * 10);
          ex.vel.z += (wishDir.z * baseSpeed - ex.vel.z) * Math.min(1, dt * 10);
          ex.walkCycle += dt * (isSprinting ? 12 : 8) * slipstreamBoostRef.current;

          if (ex.grounded) {
            dimensionalSoilParticleRigRef.current?.emitFootstepBurst(
              ex.pos,
              wishDir,
              isSprinting ? 1.5 : 0.8
            );
          }
        } else {
          ex.vel.x *= Math.pow(0.08, dt);
          ex.vel.z *= Math.pow(0.08, dt);
        }

        const isInsidePortalRoomNow = Boolean(
          realityTearPortalRigRef.current?.isPlayerInsidePortalRoom
        );
        const portalGroundPreEval = isInsidePortalRoomNow
          ? evaluatePortalRoomInteriorGroundAndGravity(
              ex.pos.x,
              ex.pos.z,
              ex.pos.y,
              placedRoomModulesRef.current,
              portalRoomGravityModeRef.current
            )
          : null;

        // Subtle atmospheric wind & scent drift coupling (ONLY outside the sealed 36m×36m Portal Room!)
        if (!isInsidePortalRoomNow) {
          ex.vel.x += weatherSample.windVec.x * 0.08 * dt;
          ex.vel.z += weatherSample.windVec.z * 0.08 * dt;
        }

        // Jump OR Bare-Handed Parkour Ledge Clamber & Mantle when weapon is sheathed!
        if (keys.has('Space')) {
          if (ex.grounded) {
            const isBareHanded = fpSpringRigRef.current.isSheathed;
            const aheadX = ex.pos.x + forwardFlat.x * 2.4;
            const aheadZ = ex.pos.z + forwardFlat.z * 2.4;
            const aheadGroundY = evaluateTerrainHeight(
              aheadX,
              aheadZ,
              activeWorld,
              excavationsRef.current
            );
            const hasLedgeAhead = aheadGroundY - ex.pos.y > 0.55;

            ex.vel.y =
              charSpec.jumpImpulse *
              biologicalJumpBoostRef.current *
              graftState.jumpBoostMultiplier *
              (isBareHanded ? 1.18 : 1.0) *
              (0.92 + slipstreamBoostRef.current * 0.12);

            if (isBareHanded && (hasLedgeAhead || moveForward > 0)) {
              ex.vel.x += forwardFlat.x * 7.5;
              ex.vel.z += forwardFlat.z * 7.5;
              fpSpringRigRef.current.triggerClamberOrParkourImpulse();
            } else {
              fpSpringRigRef.current.triggerJumpTakeoffImpulse(ex.vel.y);
            }
            ex.grounded = false;
          } else if (
            fpSpringRigRef.current.isSheathed &&
            fpSpringRigRef.current.clamberTimer <= 0
          ) {
            // Bare-handed midair ledge mantle check against nearby steep terrain or structures
            const aheadX = ex.pos.x + forwardFlat.x * 2.2;
            const aheadZ = ex.pos.z + forwardFlat.z * 2.2;
            const aheadY = evaluateTerrainHeight(
              aheadX,
              aheadZ,
              activeWorld,
              excavationsRef.current
            );
            const nearBuilding = placedBuildingsRef.current.some(
              (b) => Math.hypot(ex.pos.x - b.x, ex.pos.z - b.z) < 3.6
            );
            if (aheadY > ex.pos.y + 0.35 || nearBuilding) {
              ex.vel.y = 12.2 * graftState.jumpBoostMultiplier;
              ex.vel.x += forwardFlat.x * 8.5;
              ex.vel.z += forwardFlat.z * 8.5;
              fpSpringRigRef.current.triggerClamberOrParkourImpulse();
              setLastCombatBanner(
                '🤸 Bare-Handed Ledge Clamber & Wall Mantle!'
              );
            }
          }
        }
        const isInsideInBetweenVoidNow =
          voidBallEvolutionStateRef.current.isPlayerInsideInBetweenVoid;
        if (isInsideInBetweenVoidNow) {
          // Zero-G / Low-G Jet-Swim Thrusters inside the Playable In-Between Timeline Void!
          if (keys.has('Space')) {
            ex.vel.y = Math.min(11.0, ex.vel.y + 22.0 * dt);
            ex.grounded = false;
          } else if (keys.has('ShiftLeft') || keys.has('ShiftRight')) {
            ex.vel.y = Math.max(-11.0, ex.vel.y - 22.0 * dt);
          } else {
            ex.vel.y -= 2.2 * dt; // Gentle 0.22G drift
          }
          ex.pos.addScaledVector(ex.vel, dt);
        } else {
          const timelineGravMult =
            voidBallEvolutionStateRef.current.activeTimeline
              .gravityMultiplier ?? 1.0;
          const effectiveGrav = portalGroundPreEval
            ? portalGroundPreEval.effectiveGravity
            : activeWorld.gravity *
              weatherSample.effectiveGravityMultiplier *
              timelineGravMult;
          ex.vel.y -= effectiveGrav * dt;

          // Step GrappleHookController: continuous surface distance calculation + pendulum swing / zip-reel physics
          const isGrappleToolActive = activeToolRef.current === 'grapple-hook';
          const camLookVec = new THREE.Vector3(
            -Math.sin(ex.yaw) * Math.cos(ex.pitch),
            Math.sin(ex.pitch),
            -Math.cos(ex.yaw) * Math.cos(ex.pitch)
          ).normalize();
          grappleHookRigRef.current.calculateDistanceToSurface(
            {
              cameraPos: camera.position,
              cameraLookDir: camLookVec,
              terrainMesh: terrainMeshRef.current,
              sectorMeshes: sectorTerrainMeshesRef.current,
              extraTargetRoot: absurdTimelineDecoratorRef.current.rootGroup,
              entities: entitiesRef.current,
              evalTerrainHeight: (x, z) =>
                evaluateTerrainHeight(
                  x,
                  z,
                  activeWorld,
                  excavationsRef.current
                ),
            },
            isGrappleToolActive,
            nowSec
          );

          const wasGrappleActive = grappleHookRigRef.current.active;
          const grappleStep = grappleHookRigRef.current.stepPhysicsAndRender({
            dt,
            nowSec,
            playerPos: ex.pos,
            playerVel: ex.vel,
            handOriginWorld: ex.pos
              .clone()
              .add(new THREE.Vector3(0, 1.35, 0)),
            cameraLookDir: forwardFlat,
            isZipReelHeld:
              keys.has('KeyC') || isRightClickZipReelHeldRef.current,
            isJumpReleasePressed: keys.has('Space') && !ex.grounded,
            isGrappleToolActive,
          });
          if (wasGrappleActive && !grappleStep.isActive) {
            setGrappleActive(false);
            setGrappleAnchorLabel('Detached');
            autonomicEquationEngine.recordGameplayEquationDiscovery(
              'kinetic-grapple-apex',
              1.1
            );
          } else if (grappleStep.isActive) {
            const apexConservation =
              autonomicEquationEngine.fieldState.geodesicApexConservation;
            if (apexConservation > 1.02) {
              ex.vel.multiplyScalar(1.0 + (apexConservation - 1.0) * dt * 0.45);
            }
          }

          // Step Animated Body Modifications (Cyber-Wings Glide, Hydraulic Thruster Double-Jump, Wall-Run / Mag-Boots)
          bodyModsRigRef.current.stepBodyModifications({
            dt,
            nowSec,
            playerPos: ex.pos,
            playerVel: ex.vel,
            grounded: ex.grounded,
            isSprintHeld: keys.has('ShiftLeft') || keys.has('ShiftRight'),
            isJumpJustPressed: keys.has('Space'),
            cameraYaw: ex.yaw,
            cameraLookDir: forwardFlat,
          });

          ex.pos.addScaledVector(ex.vel, dt);
        }
      }

      // 3D Spatial Hash Grid Capsule-vs-OBB / Cylinder Collision, Auto-Step-Up & Terrain Slope Sliding
      const playerRadius = charSpec.collisionRadius;
      const playerHeight = 1.82 * charSpec.heightScale;
      const isInSpecialRoom =
        Boolean(realityTearPortalRigRef.current?.isPlayerInsidePortalRoom) ||
        voidBallEvolutionStateRef.current.isPlayerInsideInBetweenVoid;
      const collisionResult =
        spatialCollisionSolver.resolveCapsuleCollisionAndSlopeSlide(
          ex.pos,
          ex.vel,
          playerRadius,
          playerHeight,
          ex.grounded,
          (x, z) =>
            evaluateTerrainHeight(x, z, activeWorld, excavationsRef.current),
          dt,
          isInSpecialRoom
        );
      const collisionRollImpulse = collisionResult.collisionRollImpulse;
      if (collisionResult.steppedUpDeltaY > 0.01) {
        povFlowStateRef.current.elevationSpringOffset -= Math.min(
          0.35,
          collisionResult.steppedUpDeltaY * 0.65
        );
      }

      // 0B. Step Unified Autonomic Architecture & Self-Evolving Nonlinear Mathematical Engine
      autonomicEquationEngine.stepAutonomicArchitectureAndEquations({
        dt,
        nowSec,
        wCoord: currentW,
        dimIndex: currentDimIndexRef.current,
        playerPos: ex.pos,
        playerVel: ex.vel,
        playerYaw: ex.yaw,
        playerPitch: ex.pitch,
        playerGrounded: ex.grounded,
        grappleActive: grappleHookRigRef.current.active,
        steppedUpDeltaY: collisionResult.steppedUpDeltaY,
        emaFrameTimeMs: drsAndLodControllerRef.current.emaFrameTimeMs,
        activePixelRatio: renderer.getPixelRatio(),
        activeEntityCount: entitiesRef.current.length,
        spatialColliderCount: spatialCollisionSolver.getColliderCount(),
        pooledMaterialCount: sharedGeometryPool.getPooledMaterialCount(),
      });

      // Dynamic Map-Edge Procedural Sector Generation, Square Portal Room, Procedural Maze Dimension, OR Playable In-Between Timeline Void Clamping!
      const isInsidePortalRoom = Boolean(
        realityTearPortalRigRef.current?.isPlayerInsidePortalRoom
      );
      const isInsideMazeDimension = Boolean(
        realityTearPortalRigRef.current?.isPlayerInsideMazeDimension
      );
      const isInsideInBetweenVoid =
        voidBallEvolutionStateRef.current.isPlayerInsideInBetweenVoid;
      if (isInsideInBetweenVoid) {
        ex.pos.x = Math.max(
          IN_BETWEEN_VOID_ORIGIN.x - 21.5,
          Math.min(IN_BETWEEN_VOID_ORIGIN.x + 21.5, ex.pos.x)
        );
        ex.pos.z = Math.max(
          IN_BETWEEN_VOID_ORIGIN.z - 21.5,
          Math.min(IN_BETWEEN_VOID_ORIGIN.z + 21.5, ex.pos.z)
        );
        ex.pos.y = Math.max(
          IN_BETWEEN_VOID_ORIGIN.y,
          Math.min(IN_BETWEEN_VOID_ORIGIN.y + 18.0, ex.pos.y)
        );
      } else if (isInsideMazeDimension) {
        ex.pos.x = Math.max(
          MAZE_DIMENSION_ORIGIN.x - (MAZE_HALF_EXTENT - 0.8),
          Math.min(MAZE_DIMENSION_ORIGIN.x + (MAZE_HALF_EXTENT - 0.8), ex.pos.x)
        );
        ex.pos.z = Math.max(
          MAZE_DIMENSION_ORIGIN.z - (MAZE_HALF_EXTENT - 0.8),
          Math.min(MAZE_DIMENSION_ORIGIN.z + (MAZE_HALF_EXTENT - 0.8), ex.pos.z)
        );
      } else if (isInsidePortalRoom) {
        ex.pos.x = Math.max(
          PORTAL_ROOM_ORIGIN.x - 16.8,
          Math.min(PORTAL_ROOM_ORIGIN.x + 16.8, ex.pos.x)
        );
        ex.pos.z = Math.max(
          PORTAL_ROOM_ORIGIN.z - 16.8,
          Math.min(PORTAL_ROOM_ORIGIN.z + 17.0, ex.pos.z)
        );
      } else {
        ex.pos.x = Math.max(-380, Math.min(380, ex.pos.x));
        ex.pos.z = Math.max(-380, Math.min(380, ex.pos.z));
      }

      const curGridX =
        isInsidePortalRoom || isInsideMazeDimension || isInsideInBetweenVoid
          ? 0
          : Math.round(ex.pos.x / SECTOR_CHUNK_SIZE);
      const curGridZ =
        isInsidePortalRoom || isInsideMazeDimension || isInsideInBetweenVoid
          ? 0
          : Math.round(ex.pos.z / SECTOR_CHUNK_SIZE);
      const localOffsetX =
        isInsidePortalRoom || isInsideMazeDimension || isInsideInBetweenVoid
          ? 0
          : ex.pos.x - curGridX * SECTOR_CHUNK_SIZE;
      const localOffsetZ =
        isInsidePortalRoom || isInsideMazeDimension || isInsideInBetweenVoid
          ? 0
          : ex.pos.z - curGridZ * SECTOR_CHUNK_SIZE;
      const edgeTriggerThreshold = SECTOR_CHUNK_SIZE * 0.28; // Generate neighbor sector as player approaches within 27m of edge

      const candidateCoords: [number, number][] = [[curGridX, curGridZ]];
      if (Math.abs(localOffsetX) > edgeTriggerThreshold) {
        candidateCoords.push([
          curGridX + Math.sign(localOffsetX),
          curGridZ,
        ]);
      }
      if (Math.abs(localOffsetZ) > edgeTriggerThreshold) {
        candidateCoords.push([
          curGridX,
          curGridZ + Math.sign(localOffsetZ),
        ]);
      }
      if (
        Math.abs(localOffsetX) > edgeTriggerThreshold &&
        Math.abs(localOffsetZ) > edgeTriggerThreshold
      ) {
        candidateCoords.push([
          curGridX + Math.sign(localOffsetX),
          curGridZ + Math.sign(localOffsetZ),
        ]);
      }

      for (const [cgx, cgz] of candidateCoords) {
        if (Math.abs(cgx) > 3 || Math.abs(cgz) > 3) continue;
        const secKey = `${cgx},${cgz}`;
        if (
          !generatedSectorsRef.current.has(secKey) &&
          proceduralSectorsGroupRef.current
        ) {
          const newSector = synthesizeProceduralTerrainSector(
            activeWorld.seed,
            cgx,
            cgz,
            activeWorld.palette
          );
          generatedSectorsRef.current.set(secKey, newSector);
          const allSectorsList = Array.from(
            generatedSectorsRef.current.values()
          );
          setActiveProceduralSectorsForTerrain(allSectorsList);

          // Rebuild / stitch terrain heightfields so the dramatic elevation difference is immediately physical
          deformTerrainGeometry(activeWorld, excavationsRef.current);

          const sectorRig = buildProceduralSectorCompleteRig(
            newSector,
            activeWorld,
            (x, z) =>
              evaluateTerrainHeight(x, z, activeWorld, excavationsRef.current)
          );
          // Prevent overlapping Z-fighting with the high-density 280x280m central terrain mesh for inner sectors!
          sectorRig.terrainMesh.visible =
            Math.abs(cgx) > 1 || Math.abs(cgz) > 1;
          sectorRig.pylonRig.traverse((ch) => {
            if (ch.userData.isKineticRotor) kineticRotorsRef.current.push(ch);
          });
          proceduralSectorsGroupRef.current.add(sectorRig.rootGroup);
          sectorTerrainMeshesRef.current.push(sectorRig.terrainMesh);

          // Automatically spawn 2-3 new elevation-adapted Frontier Mobs in this newly generated sector!
          const mobCount = newSector.spawnedMobCount;
          for (let m = 0; m < mobCount; m++) {
            const baseBp =
              activeWorld.entityBlueprints[
                (Math.abs(cgx + cgz) + m) % activeWorld.entityBlueprints.length
              ];
            if (baseBp && entitiesRef.current.length < 22) {
              const evolvedBp = synthesizeSectorNativeEntityBlueprint(
                baseBp,
                newSector,
                m
              );
              const spawnAngle = (m / mobCount) * Math.PI * 2 + newSector.seed;
              const sx = newSector.centerX + Math.cos(spawnAngle) * 14;
              const sz = newSector.centerZ + Math.sin(spawnAngle) * 14;
              const sy = evaluateTerrainHeight(
                sx,
                sz,
                activeWorld,
                excavationsRef.current
              );
              spawnEntityInstance(evolvedBp, new THREE.Vector3(sx, sy, sz));
            }
          }

          // Also materialize a Frontier Biocomplex or Tech-Husbandry Paddock in the newly generated sector
          if (onDiscoverFrontierComplexRef.current) {
            const secAngle = Math.atan2(newSector.centerZ, newSector.centerX);
            const frontierSite = generateFrontierComplexAtEdge(
              activeWorld.seed + newSector.seed,
              allSectorsList.length,
              secAngle,
              (x, z) =>
                evaluateTerrainHeight(x, z, activeWorld, excavationsRef.current)
            );
            frontierSite.x = Number((newSector.centerX + 12).toFixed(1));
            frontierSite.z = Number((newSector.centerZ - 12).toFixed(1));
            frontierSite.y = Number(
              evaluateTerrainHeight(
                frontierSite.x,
                frontierSite.z,
                activeWorld,
                excavationsRef.current
              ).toFixed(2)
            );
            onDiscoverFrontierComplexRef.current(frontierSite);
          }

          somaticGraftStateRef.current.exploredSectorCount =
            allSectorsList.length;
          somaticGraftStateRef.current.lastWorldMechanicEvent = `Generated ${newSector.name} (${
            newSector.baseElevationOffset >= 0 ? '+' : ''
          }${newSector.baseElevationOffset}m Elevation · +${mobCount} Frontier Mobs)`;
          harmonicSoundscape.triggerArchitecturalChord(
            Math.abs(cgx + cgz) % 5
          );
        }
      }

      const activePlayerSector =
        generatedSectorsRef.current.get(`${curGridX},${curGridZ}`) ??
        generatedSectorsRef.current.get('0,0');
      if (activePlayerSector) {
        somaticGraftStateRef.current.currentSectorName =
          activePlayerSector.name;
        somaticGraftStateRef.current.currentSectorElevationRegime =
          activePlayerSector.elevationRegime;
      }

      // Authoritative Ground Collision: Lock feet seamlessly to terrain slopes, the 36m×36m Square Portal Room, OR the Procedural Maze Dimension!
      const mazeGroundEval =
        isInsideMazeDimension && realityTearPortalRigRef.current
          ? realityTearPortalRigRef.current.mazeDimensionRig.evaluateMazeGroundAndCollision(
              ex.pos.x,
              ex.pos.z,
              ex.pos.y,
              0.52
            )
          : null;
      if (mazeGroundEval) {
        ex.pos.x += mazeGroundEval.pushOutX;
        ex.pos.z += mazeGroundEval.pushOutZ;
      }
      const portalGroundEval = isInsidePortalRoom
        ? evaluatePortalRoomInteriorGroundAndGravity(
            ex.pos.x,
            ex.pos.z,
            ex.pos.y,
            placedRoomModulesRef.current,
            portalRoomGravityModeRef.current
          )
        : null;
      const groundH = isInsideInBetweenVoid
        ? IN_BETWEEN_VOID_ORIGIN.y
        : mazeGroundEval
        ? mazeGroundEval.groundY
        : portalGroundEval
        ? portalGroundEval.groundY
        : evaluateUnifiedAuthoritativeFloorY(
            ex.pos.x,
            ex.pos.z,
            ex.pos.y,
            activeWorld,
            excavationsRef.current
          );
      if (portalGroundEval) {
        currentPortalElevationRef.current = Math.max(
          0,
          portalGroundEval.groundY - PORTAL_ROOM_ORIGIN.y
        );
        currentPortalGravityGRef.current = Number(
          (portalGroundEval.effectiveGravity / 9.81).toFixed(2)
        );
      }
      const downhillStickMargin =
        ex.grounded && ex.vel.y <= 0
          ? isInsidePortalRoom || isInsideInBetweenVoid
            ? 0.72
            : 0.52
          : 0.06;
      const wasGroundedPreCollision = ex.grounded;
      const preCollisionVertVel = ex.vel.y;
      if (ex.pos.y <= groundH + downhillStickMargin) {
        const bounceRestitution =
          !isInsidePortalRoom && !isInsideInBetweenVoid
            ? voidBallEvolutionStateRef.current.activeTimeline
                .groundBounceRestitution ?? 0
            : 0;
        if (!wasGroundedPreCollision && preCollisionVertVel < -1.8) {
          const impactSpeed = Math.abs(preCollisionVertVel);
          fpSpringRigRef.current.triggerLandingImpulse(impactSpeed);
          povFlowStateRef.current.elevationSpringOffset -= Math.min(
            0.24,
            impactSpeed * 0.016
          );
          if (bounceRestitution > 0.45 && impactSpeed > 5.0) {
            ex.pos.y = groundH + 0.1;
            ex.vel.y = impactSpeed * bounceRestitution;
            ex.grounded = false;
          } else {
            ex.pos.y = groundH;
            ex.vel.y = 0;
            ex.grounded = true;
          }
        } else {
          ex.pos.y = groundH;
          ex.vel.y = 0;
          ex.grounded = true;
        }
      } else {
        ex.grounded = false;
      }

      // Check Graviton Lift Pads inside the Square Portal Room
      if (portalGroundEval && portalGroundEval.updraftBoost > 0) {
        ex.vel.y = Math.max(ex.vel.y, portalGroundEval.updraftBoost);
        ex.grounded = false;
      }

      // Physical 3D World Mechanics per Sector:
      for (const sec of generatedSectorsRef.current.values()) {
        const [gx, gz] = sec.geyserCoords;
        if (Math.hypot(ex.pos.x - gx, ex.pos.z - gz) < 3.1) {
          ex.vel.y = Math.max(ex.vel.y, 17.5);
          ex.grounded = false;
          somaticGraftStateRef.current.lastWorldMechanicEvent = `Thermal Updraft Geyser Launch in ${sec.name}!`;
        }

        const [px, pz] = sec.pylonCoords;
        if (
          pylonShiftCooldownRef.current <= 0 &&
          Math.hypot(ex.pos.x - px, ex.pos.z - pz) < 2.85
        ) {
          pylonShiftCooldownRef.current = 12.0;
          if (onShiftDimensionFromVoidStationRef.current) {
            onShiftDimensionFromVoidStationRef.current();
          }
          for (const ent of entitiesRef.current) {
            const dEnt = Math.hypot(
              ent.particles[0].pos.x - px,
              ent.particles[0].pos.z - pz
            );
            if (dEnt < 24) {
              ent.applyKineticImpulse(
                new THREE.Vector3(
                  (ent.particles[0].pos.x - px) * 0.9,
                  9.5,
                  (ent.particles[0].pos.z - pz) * 0.9
                ),
                0.55
              );
            }
          }
          somaticGraftStateRef.current.lastWorldMechanicEvent = `Actuated 3D 4D-Node Pylon in ${sec.name} (W-Shift + Resonance Wave)!`;
          harmonicSoundscape.triggerArchitecturalChord(2);
        }

        const [cx, cz] = sec.cradleCoords;
        if (
          cradleSynthesisCooldownRef.current <= 0 &&
          somaticGraftStateRef.current.graftCount > 0 &&
          Math.hypot(ex.pos.x - cx, ex.pos.z - cz) < 3.2 &&
          entitiesRef.current.length < 20
        ) {
          cradleSynthesisCooldownRef.current = 16.0;
          const baseBp =
            activeWorld.entityBlueprints[
              somaticGraftStateRef.current.graftCount %
                activeWorld.entityBlueprints.length
            ];
          if (baseBp) {
            const chimeraBp = synthesizeSectorNativeEntityBlueprint(
              baseBp,
              sec,
              somaticGraftStateRef.current.graftCount
            );
            const cY = evaluateTerrainHeight(
              cx,
              cz,
              activeWorld,
              excavationsRef.current
            );
            spawnEntityInstance(
              chimeraBp,
              new THREE.Vector3(cx, cY + 1.4, cz)
            );
            somaticGraftStateRef.current.lastWorldMechanicEvent = `3D Somatic Cradle Materialized ${chimeraBp.name} from Player Graft DNA!`;
            harmonicSoundscape.triggerArchitecturalChord(4);
          }
        }
      }

      // 1B. Step 5D Cloud Canopy, Weather Particles, Scent Breeze Ribbons & 3D Interconnectedness Web
      if (cloud5DCanopyRef.current) {
        update5DCloudCanopy(
          cloud5DCanopyRef.current,
          activeWorld,
          currentW,
          nowSec,
          excavationsRef.current
        );
      }
      if (weatherParticlesRef.current) {
        updateWeatherParticleField(
          weatherParticlesRef.current,
          activeWorld,
          currentW,
          dt,
          nowSec,
          ex.pos,
          weatherSample
        );
      }
      const frameParity = Math.floor(nowSec * 60) % 2;
      if (scentBreezeRef.current && frameParity === 0) {
        const entityPosList = entitiesRef.current.map((e) => e.particles[0].pos);
        updateScentBreezeRibbons(
          scentBreezeRef.current,
          activeWorld,
          currentW,
          nowSec,
          weatherSample,
          entityPosList,
          excavationsRef.current
        );
      }

      // Step Atmospheric Volumetric Sun Shafts & Micro-Ground Cover
      if (sunShaftRigRef.current) {
        sunShaftRigRef.current.update(
          ex.pos,
          weatherSample.windVec,
          dt,
          nowSec
        );
      }
      if (microGroundCoverRef.current) {
        microGroundCoverRef.current.update(
          ex.pos,
          (x, z) => evaluateTerrainHeight(x, z, activeWorld, excavationsRef.current),
          weatherSample.windVec,
          nowSec
        );
      }
      if (celestialCosmologyRigRef.current) {
        celestialCosmologyRigRef.current.update(ex.pos, scene, dt, nowSec);
        const distFromOrigin = Math.sqrt(ex.pos.x * ex.pos.x + ex.pos.z * ex.pos.z);
        celestialCosmologyRigRef.current.updateInnerWorldExpansionDetail({
          sectorCount: (sectorTerrainMeshesRef.current ? sectorTerrainMeshesRef.current.length : 0) + 1,
          excavationCount: excavationsRef.current ? excavationsRef.current.length : 0,
          exploredFrontierCount: Math.floor(distFromOrigin / 24),
          playerAltitudeM: Math.max(0, ex.pos.y),
          discoveryTier: Math.round(currentDimIndexRef.current),
          infrastructureComplexity: placedBuildingsRef.current ? placedBuildingsRef.current.length : 0,
        });
      }
      if (dimensionalSoilParticleRigRef.current) {
        dimensionalSoilParticleRigRef.current.update(dt);
      }
      if (excavationShatterRigRef.current) {
        excavationShatterRigRef.current.update(dt);
      }
      if (granularDirtRigRef.current) {
        updateGranularDirtExcavationRig({
          rig: granularDirtRigRef.current,
          dt,
          evalHeight: (x, z) =>
            evaluateTerrainHeight(x, z, activeWorld, excavationsRef.current),
        });
      }

      const vCoord5D = Math.sin(nowSec * 0.38 + currentW * 1.9);
      const interconnectedTelemetry = interconnectedWebRef.current
        ? updateInterconnectednessWeb(
            interconnectedWebRef.current,
            ex.pos,
            ex.vel,
            ex.yaw,
            ex.grounded,
            groundH,
            entitiesRef.current,
            placedBuildingsRef.current,
            currentW,
            vCoord5D,
            nowSec,
            dt
          )
        : undefined;

      if (interconnectedTelemetry) {
        slipstreamBoostRef.current =
          interconnectedTelemetry.slipstreamSpeedMultiplier;
      }

      // Update Walk-In 3D Void Ball Sanctuary & Full-Scale Build-Space BIM Hologram
      const structuralTelemetry = walkInVoidRigRef.current
        ? updateWalkInVoidAndBuildHologram(
            walkInVoidRigRef.current,
            activeWorld,
            ex.pos,
            ex.yaw,
            ex.pitch,
            activeToolRef.current,
            weatherSample.windVec.length(),
            excavationsRef.current,
            CRAFTING_RECIPES,
            nowSec,
            dt
          )
        : undefined;
      if (structuralTelemetry) {
        latestStructuralTelemetryRef.current = structuralTelemetry;
      }

      // Update Reality-Tear Portal GLSL Shader (with Customizable Gate Shape!), Splitgate/Portal Render-to-Texture Sightline & 36m×36m Square Portal Room
      const livePortalTelemetry = realityTearPortalRigRef.current
        ? updateRealityTearPortalAndSquareRoom({
            rig: realityTearPortalRigRef.current,
            renderer,
            scene,
            mainCamera: camera,
            world: activeWorld,
            playerPos: ex.pos,
            playerVel: ex.vel,
            playerYaw: ex.yaw,
            playerPitch: ex.pitch,
            boundaryId: biodepthConfigRef.current.activeUniverseBoundary,
            activeElement: activeBaseElementRef.current,
            enableShaderDistortion:
              biodepthConfigRef.current.enablePortalShaderDistortion,
            targetRenderSize:
              biodepthConfigRef.current.portalRenderTargetSize,
            gateShapeId: voidBallEvolutionStateRef.current.activeGateShape,
            customRimPrimaryHex:
              voidBallEvolutionStateRef.current.activeTimeline
                .portalFluidPrimaryHex,
            customRimSecondaryHex:
              voidBallEvolutionStateRef.current.activeTimeline
                .portalFluidSecondaryHex,
            excavations: excavationsRef.current,
            onHarvestMatterNode: (matterId, nodeName) => {
              setMatterInventory((prev) => ({
                ...prev,
                [matterId]: (prev[matterId] ?? 0) + 1,
              }));
              setDevianceXP((xp) => xp + 1);
              setLastCombatBanner(
                `🔮 Harvested Multiversal Matter: +1 ${nodeName} (+1 Deviance XP · Use in Square Portal Room [K])`
              );
              harmonicSoundscape.triggerChime(4, 0.7);
            },
            onEnterOrExitPortalRoom: (entered) => {
              povFlowStateRef.current.smoothVisualY = ex.pos.y;
              povFlowStateRef.current.elevationSpringOffset = 0;
              autonomicEquationEngine.recordGameplayEquationDiscovery(
                'non-euclidean-portal-transit',
                1.35
              );
              setLastCombatBanner(
                entered
                  ? `🚪 Stepped through Reality-Tear into 36m×36m Square Portal Room! Walk to North Crucible or press [K]`
                  : `⇪ Stepped out of Square Portal Room back into ${activeWorld.name}`
              );
              harmonicSoundscape.triggerArchitecturalChord(3);
            },
            nowSec,
            dt,
          })
        : undefined;

      // Step Playable Zero-G In-Between Timeline Void Rift & Hub, Crash-Proof Absurd Timeline Decorator, and Sentient Void Ball Symbiote!
      if (voidBeamHandRaiseTimerRef.current > 0) {
        voidBeamHandRaiseTimerRef.current = Math.max(
          0,
          voidBeamHandRaiseTimerRef.current - dt
        );
      }
      inBetweenVoidRigRef.current?.update({
        dt,
        nowSec,
        playerPos: ex.pos,
        playerVel: ex.vel,
        voidState: voidBallEvolutionStateRef.current,
        evalExteriorGroundY: (x, z) =>
          evaluateTerrainHeight(x, z, activeWorld, excavationsRef.current),
        onHarvestVoidAnomaly: handleHarvestVoidAnomaly,
        onEnterInBetweenVoid: () => {
          povFlowStateRef.current.smoothVisualY = ex.pos.y;
          povFlowStateRef.current.elevationSpringOffset = 0;
          setVoidBallEvolutionState((prev) => {
            const next = { ...prev, isPlayerInsideInBetweenVoid: true };
            voidBallEvolutionStateRef.current = next;
            return next;
          });
          setLastCombatBanner(
            `🛸 Stepped into Zero-G In-Between Timeline Void! Harvest floating Void Shards or walk through North Gate to arrive in ${voidBallEvolutionStateRef.current.pendingDestinationTimeline.coordinateCode}!`
          );
          harmonicSoundscape.triggerArchitecturalChord(3);
        },
        onArriveInDestinationTimeline: (destTimeline) => {
          povFlowStateRef.current.smoothVisualY = ex.pos.y;
          povFlowStateRef.current.elevationSpringOffset = 0;
          handleApplyActiveTimelineToWorld(destTimeline);
        },
        onReturnFromInBetweenVoid: () => {
          povFlowStateRef.current.smoothVisualY = ex.pos.y;
          povFlowStateRef.current.elevationSpringOffset = 0;
          setVoidBallEvolutionState((prev) => {
            const next = { ...prev, isPlayerInsideInBetweenVoid: false };
            voidBallEvolutionStateRef.current = next;
            return next;
          });
          setLastCombatBanner(
            `⇪ Returned from In-Between Timeline Void to ${voidBallEvolutionStateRef.current.activeTimeline.title}`
          );
          harmonicSoundscape.triggerChime(2, 0.55);
        },
      });
      absurdTimelineDecoratorRef.current.update(
        nowSec,
        ex.pos,
        dt,
        handleSynthesizeAndEquipProceduralItem
      );
      sentientSymbioteRigRef.current.update({
        dt,
        nowSec,
        playerPos: ex.pos,
        entities: entitiesRef.current,
        voidState: voidBallEvolutionStateRef.current,
        fpLeftHandRig: fpLeftHandRigRef.current,
        tpLeftHandRig: avatarRigRef.current?.leftHandVoidRig ?? null,
        onHarvestAnomaly: handleHarvestVoidAnomaly,
        onTendrilStrikeBanner: (msg) => setLastCombatBanner(msg),
      });

      // Update The Forerooms ("4RumEs") Sheathed Continuum Core, Worldspace Artforms & Omniversal Substrate
      const foreroomsResult = foreroomsRigRef.current
        ? updateForeroomsTesseractRig({
            rig: foreroomsRigRef.current,
            world: activeWorld,
            wCoord: currentW,
            playerPos: ex.pos,
            playerYaw: ex.yaw,
            playerPitch: ex.pitch,
            playerSpeed: Math.hypot(ex.vel.x, ex.vel.z),
            cameraMode: cameraModeRef.current,
            isInsideVoidBall: Boolean(structuralTelemetry?.isInsideVoidBall),
            overrideDisposition: foreroomsDispositionRef.current,
            favoritedAnchors: favoritedManifoldsRef.current,
            epochCount: epochCountRef.current,
            novelEventsCount: novelEventsCountRef.current,
            worldArtforms: worldArtformsRef.current,
            nowSec,
            dt,
          })
        : undefined;

      // Step Conceptual Novelty Seed Engine (Behavior, 3D Modelling & Visual Boundaries + POV Flow State)
      const povFlow = povFlowStateRef.current;
      povFlow.elevationSpringOffset *= Math.exp(-dt * 9.5);
      if (Math.abs(povFlow.elevationSpringOffset) < 0.002) {
        povFlow.elevationSpringOffset = 0;
      }
      povFlow.continuityBlendAlpha = Math.max(
        0,
        povFlow.continuityBlendAlpha - dt * 1.45
      );
      const continuousVisualY = ex.pos.y + povFlow.elevationSpringOffset;
      povFlow.smoothVisualY +=
        (continuousVisualY - povFlow.smoothVisualY) * Math.min(1, dt * 32);
      // Never allow smoothVisualY to dip below groundH so the character's feet never clip into hills or pit rims!
      if (ex.grounded) {
        povFlow.smoothVisualY = Math.max(groundH, povFlow.smoothVisualY);
      }

      const noveltyResult = noveltyBoundaryRigRef.current
        ? updateConceptualNoveltyEngine({
            rig: noveltyBoundaryRigRef.current,
            activeSeedId: activeNoveltySeedIdRef.current,
            world: activeWorld,
            playerPos: ex.pos,
            playerVel: ex.vel,
            playerGrounded: ex.grounded,
            isInsideVoidBall: Boolean(structuralTelemetry?.isInsideVoidBall),
            continuityBlendAlpha: povFlow.continuityBlendAlpha,
            elevationSpringResidual: povFlow.elevationSpringOffset,
            entities: entitiesRef.current,
            placedBuildings: placedBuildingsRef.current,
            favoritedAnchors: favoritedManifoldsRef.current,
            worldArtforms: worldArtformsRef.current,
            excavations: excavationsRef.current,
            nowSec,
            dt,
          })
        : undefined;

      if (noveltyResult) {
        weatherSample.effectiveGravityMultiplier *=
          noveltyResult.gravityModulator;
      }

      // Step Worldspace Form-Bleed (Smooth-Minimum smin Catenoid Bridges vs. Schism Shards) & 6 Anomalous Behavioral Objects on alternating frames
      if (worldspaceBleedRigRef.current && frameParity === 1) {
        const camForward = new THREE.Vector3(
          -Math.sin(ex.yaw) * Math.cos(ex.pitch),
          Math.sin(ex.pitch),
          -Math.cos(ex.yaw) * Math.cos(ex.pitch)
        ).normalize();
        const entPosArray = entitiesRef.current.map((e) => e.particles[0].pos);
        updateWorldspaceBleedAndAnomalies({
          rig: worldspaceBleedRigRef.current,
          world: activeWorld,
          explorerPos: ex.pos,
          cameraPos: camera.position,
          cameraForward: camForward,
          entityPositions: entPosArray,
          placedBuildings: placedBuildingsRef.current,
          excavations: excavationsRef.current,
          wCoord: currentW,
          nowSec,
          dt: dt * 2,
        });
      }

      if (zenithCausticLightRef.current) {
        zenithCausticLightRef.current.position.set(
          ex.pos.x + Math.sin(nowSec * 0.4) * 14,
          44 + Math.cos(nowSec * 0.6) * 4,
          ex.pos.z + Math.cos(nowSec * 0.4) * 14
        );
        const baseCaustic = resolveDimensionalLightingSpec(
          currentDimIndexRef.current
        ).causticIntensity;
        zenithCausticLightRef.current.intensity =
          baseCaustic + weatherSample.squallIntensity * 0.25;
      }

      // 1G. Step Cultural Settlement, Sims Goods & Services Urbanization (Village -> Urban -> City), Shadow-Labyrinth Emergence & Rare Urban Noclip
      if (culturalSettlementRigRef.current && frameParity === 0) {
        const entityPosMap = new Map<string, THREE.Vector3>();
        for (const ent of entitiesRef.current) {
          entityPosMap.set(ent.id, ent.particles[0].pos);
        }
        const settlementStep = updateCulturalSettlementAndSimsAI({
          rig: culturalSettlementRigRef.current,
          denizens: denizenSimsRef.current,
          entityPositions: entityPosMap,
          playerPos: ex.pos,
          playerSpeed: Math.hypot(ex.vel.x, ex.vel.z),
          playerStealthActive: isStealthCrouchingRef.current,
          playerVoidBallOpen: voidBallOpenRef.current,
          nowSec,
          dt: dt * 2,
        });

        const pRig = realityTearPortalRigRef.current;
        if (settlementStep.justReachedDenseCity && pRig) {
          const nextMazeNumber = pRig.knownMazes.length + 1;
          const shadowMaze = synthesizeCityShadowLabyrinthMaze(
            nextMazeNumber,
            `${activeWorld.name} Spire`,
            activeBaseElementRef.current,
            activeWorld.seed
          );
          pRig.knownMazes.push(shadowMaze);
          setLastCombatBanner(
            `🏙️ Sims Settlement Evolved into a DENSE CITY! Shadow Entities formed ${shadowMaze.code} "${shadowMaze.title}" (Selectable on Inner Portal Room Gate [V])!`
          );
          harmonicSoundscape.triggerArchitecturalChord(4);
        }

        if (
          settlementStep.triggeredUrbanNoclip &&
          pRig &&
          !pRig.isPlayerInsidePortalRoom &&
          !pRig.isPlayerInsideMazeDimension &&
          !isInsideInBetweenVoid
        ) {
          pRig.savedExteriorPos.copy(ex.pos);
          pRig.savedExteriorYaw = ex.yaw;
          // Select the latest City Shadow-Labyrinth Maze if one exists
          pRig.selectedMazeIndex = pRig.knownMazes.length - 1;
          const targetMaze = pRig.knownMazes[pRig.selectedMazeIndex];
          pRig.mazeDimensionRig.rebuildMazeGeometryForSpec(targetMaze);
          pRig.isPlayerInsideMazeDimension = true;
          pRig.isInnerMazePortalOpen = true;
          pRig.innerMazePortalProgress = 1.0;
          pRig.portalTeleportCooldown = 1.6;
          ex.pos.set(
            MAZE_DIMENSION_ORIGIN.x,
            MAZE_DIMENSION_ORIGIN.y,
            MAZE_DIMENSION_ORIGIN.z + 19.0
          );
          ex.vel.set(0, 0, 0);
          ex.yaw = 0;
          povFlowStateRef.current.smoothVisualY = MAZE_DIMENSION_ORIGIN.y;
          povFlowStateRef.current.elevationSpringOffset = 0;
          setLastCombatBanner(
            `⚠️ URBAN REALITY NOCLIP! Dense City spatial seam slipped you into ${targetMaze.code} "${targetMaze.title}"! Deploy CCTV/Pylons [B] or Return South to Portal Room!`
          );
          harmonicSoundscape.triggerArchitecturalChord(1);
        }
      }

      if (visceralCombatRigRef.current) {
        updateVisceralCombatAndGrabRig({
          rig: visceralCombatRigRef.current,
          playerPos: ex.pos,
          playerYaw: ex.yaw,
          playerPitch: ex.pitch,
          cameraPos: camera.position,
          cameraMode: cameraModeRef.current,
          entities: entitiesRef.current,
          activeElement: activeBaseElementRef.current,
          evalHeight: (x, z) =>
            evaluateTerrainHeight(x, z, activeWorld, excavationsRef.current),
          onSeveranceXP: (xpGain, banner, entityId) => {
            setDevianceXP((xp) => xp + xpGain);
            setLastCombatBanner(banner);
            onImpactSpikeRef.current(0.95);
            const simEntry = denizenSimsRef.current.find(
              (s) => s.entityId === entityId
            );
            if (simEntry) {
              simEntry.isScarredNemesis = true;
              simEntry.outworlderXenophobia = 100;
              setDenizenSims([...denizenSimsRef.current]);
            }
          },
          nowSec,
          dt,
        });
      }

      // 2. Animate 5-Finger 3-Phalanx Left-Hand Void Ball Rig & Right-Hand Tool Mudra Rig
      const targetOpen = voidBallOpenRef.current ? 1.0 : 0.0;
      voidOpenBlendRef.current +=
        (targetOpen - voidOpenBlendRef.current) * Math.min(1, dt * 8);
      const openBlend = voidOpenBlendRef.current;

      if (rightHandGestureTimerRef.current > 0) {
        rightHandGestureTimerRef.current = Math.max(
          0,
          rightHandGestureTimerRef.current - dt
        );
      }
      const gesturePulse = rightHandGestureTimerRef.current / 0.55;

      const animateVoidHandRig = (handGroup: THREE.Group | null) => {
        if (!handGroup) return;
        const fingerChains = handGroup.userData.fingerChains as
          | {
              proximal: THREE.Group;
              intermediate: THREE.Group;
              distal: THREE.Group;
              baseFlare: number;
            }[]
          | undefined;
        const voidBall = handGroup.userData.voidBallGroup as
          | THREE.Group
          | undefined;

        if (fingerChains) {
          fingerChains.forEach((chain, idx) => {
            const windTremor =
              Math.sin(now * 0.004 + idx * 1.1) *
              0.08 *
              (1 + weatherSample.squallIntensity);
            chain.proximal.rotation.x = -0.38 * openBlend + windTremor;
            chain.intermediate.rotation.x =
              0.55 * (1.0 - openBlend * 0.85) + windTremor * 0.6;
            chain.distal.rotation.x =
              0.48 * (1.0 - openBlend * 0.9) + windTremor * 0.5;
          });
        }
        if (voidBall) {
          const scalePulse =
            0.35 + openBlend * 1.35 + Math.sin(now * 0.006) * 0.06;
          voidBall.scale.setScalar(scalePulse);
          voidBall.position.y = 0.065 + openBlend * 0.085;
          voidBall.rotation.y += dt * (1.8 + openBlend * 4.5);
          voidBall.rotation.z += dt * (1.1 + openBlend * 2.5);
        }
      };

      const animateRightHandToolRig = (handGroup: THREE.Group | null) => {
        if (!handGroup) return;
        const fingerChains = handGroup.userData.fingerChains as
          | {
              proximal: THREE.Group;
              intermediate: THREE.Group;
              distal: THREE.Group;
              baseFlare: number;
            }[]
          | undefined;
        const crystal = handGroup.userData.focusCrystal as
          | THREE.Mesh
          | undefined;
        const ring = handGroup.userData.emitterRing as THREE.Mesh | undefined;
        const tool = activeToolRef.current;

        if (fingerChains) {
          fingerChains.forEach((chain, idx) => {
            const wave = Math.sin(now * 0.005 + idx * 0.9) * 0.07;
            if (tool === 'harmonic-tether') {
              chain.proximal.rotation.x = -0.22 - gesturePulse * 0.35 + wave;
              chain.intermediate.rotation.x = 0.18 - gesturePulse * 0.12 + wave;
              chain.distal.rotation.x = 0.12 + wave;
            } else if (tool === 'mine-terrain') {
              chain.proximal.rotation.x = 0.25 + gesturePulse * 0.45 + wave;
              chain.intermediate.rotation.x = 0.65 + gesturePulse * 0.3;
              chain.distal.rotation.x = 0.55 + gesturePulse * 0.25;
            } else if (tool === 'place-building') {
              chain.proximal.rotation.x = 0.35 - gesturePulse * 0.25 + wave;
              chain.intermediate.rotation.x = 0.42;
              chain.distal.rotation.x = 0.35;
            } else {
              chain.proximal.rotation.x = -0.15 - gesturePulse * 0.45 + wave;
              chain.intermediate.rotation.x = 0.35 * (1 - gesturePulse);
              chain.distal.rotation.x = 0.3 * (1 - gesturePulse);
            }
          });
        }
        if (crystal) {
          crystal.rotation.y += dt * (2.5 + gesturePulse * 8);
          crystal.rotation.x += dt * 1.8;
          crystal.scale.setScalar(1.0 + gesturePulse * 0.45);
        }
        if (ring) {
          ring.rotation.z -= dt * 2.2;
          ring.scale.setScalar(1.0 + gesturePulse * 0.35);
        }
      };

      animateVoidHandRig(fpLeftHandRigRef.current);
      animateRightHandToolRig(fpRightHandRigRef.current);
      if (avatarRigRef.current) {
        animateVoidHandRig(avatarRigRef.current.leftHandVoidRig);
        animateRightHandToolRig(avatarRigRef.current.rightHandToolRig);
      }

      // Sync 3rd-Person Playable Character Rig with Smooth, Environmentally Reactive Biological Animations
      const mode = cameraModeRef.current;
      const horizSpeed = Math.hypot(ex.vel.x, ex.vel.z);
      const isSprintingNow =
        (keys.has('ShiftLeft') || keys.has('ShiftRight')) &&
        horizSpeed > 3.2;
      const forwardLookX = -Math.sin(ex.yaw);
      const forwardLookZ = -Math.cos(ex.yaw);
      const rightLookX = Math.cos(ex.yaw);
      const rightLookZ = -Math.sin(ex.yaw);
      const forwardSpeed = ex.vel.x * forwardLookX + ex.vel.z * forwardLookZ;
      const strafeSpeed = ex.vel.x * rightLookX + ex.vel.z * rightLookZ;
      const stealthCrouchOffset = isStealthCrouchingRef.current ? -0.32 : 0;
      const landingDipOffset = Math.min(
        0,
        povFlow.elevationSpringOffset * 0.85
      );

      if (avatarRigRef.current) {
        const av = avatarRigRef.current;
        av.root.visible =
          mode !== 'first-person' || studioModeRef.current !== 'none';
        av.root.position.set(ex.pos.x, povFlow.smoothVisualY, ex.pos.z);
        av.root.rotation.y = ex.yaw;
        av.packRotor.rotation.z = now * 0.003 * (1 + Math.max(0, currentW));

        const gAhead = evaluateTerrainHeight(
          ex.pos.x + forwardLookX * 1.1,
          ex.pos.z + forwardLookZ * 1.1,
          activeWorld,
          excavationsRef.current
        );
        const gHere = evaluateTerrainHeight(
          ex.pos.x,
          ex.pos.z,
          activeWorld,
          excavationsRef.current
        );
        const slopePitch = THREE.MathUtils.clamp(
          (gAhead - gHere) * 0.25,
          -0.32,
          0.32
        );

        const sprintLeanBoost = fpSpringRigRef.current.sprintBlend * 0.14;
        const breathCycle = Math.sin(nowSec * 2.4) * 0.035;
        const actionLungePitch = Math.sin(gesturePulse * Math.PI) * 0.28;
        const windLeanPitch =
          Math.min(0.28, weatherSample.windVec.length() * 0.015) +
          Math.min(0.26, horizSpeed * 0.022) +
          sprintLeanBoost +
          slopePitch * 0.5 +
          actionLungePitch -
          landingDipOffset * 0.85 +
          (isStealthCrouchingRef.current ? 0.32 : 0);
        const spineTwistYaw =
          Math.cos(ex.walkCycle) *
            Math.min(1.2, horizSpeed / 6) *
            (0.14 + fpSpringRigRef.current.sprintBlend * 0.08) +
          Math.sin(gesturePulse * Math.PI) * 0.42;
        const strafeTiltRoll = THREE.MathUtils.clamp(
          -strafeSpeed * 0.018,
          -0.14,
          0.14
        );

        av.torsoGroup.position.y =
          0.78 +
          stealthCrouchOffset +
          landingDipOffset +
          Math.abs(Math.sin(ex.walkCycle)) * 0.042 * Math.min(1.2, horizSpeed / 6) +
          breathCycle * 0.5;
        av.torsoGroup.rotation.x = windLeanPitch + breathCycle;
        av.torsoGroup.rotation.y = spineTwistYaw;
        av.torsoGroup.rotation.z = -ex.manifoldRoll * 0.85 + strafeTiltRoll;

        av.headGroup.rotation.x = THREE.MathUtils.clamp(
          -ex.pitch * 0.65 - windLeanPitch * 0.5,
          -0.55,
          0.55
        );
        av.headGroup.rotation.y = -spineTwistYaw * 0.6;

        // Articulated 3-Segment Leg Stride + Knee Flexion + Ankle Sabaton Flexion + Upper/Lower Arm Kinematics
        const swingAmp =
          Math.min(1.25, horizSpeed / 7) *
          (0.62 + fpSpringRigRef.current.sprintBlend * 0.16);
        const leftPhase = Math.sin(ex.walkCycle);
        const rightPhase = -leftPhase;
        const springSway = (activeBehavior.limbSwayPhase ?? 0) * 0.22;
        const elasticDef = activeBehavior.elasticDeformationRatio ?? 0.15;
        const charElasticWave =
          Math.sin(ex.walkCycle * 2 + springSway * 3.0) * 0.08 * elasticDef +
          landingDipOffset * 0.35;
        const charStretchY =
          (1.0 + charElasticWave) * somaticGraftStateRef.current.limbScaleMultiplier;
        const charSquashXZ =
          (1.0 / Math.sqrt(Math.max(0.78, 1.0 + charElasticWave))) *
          Math.sqrt(somaticGraftStateRef.current.limbScaleMultiplier);
        av.torsoGroup.scale.set(charSquashXZ, charStretchY, charSquashXZ);

        const landingKneeFlex = Math.abs(landingDipOffset) * 2.2;
        av.leftLeg.rotation.x =
          leftPhase * swingAmp - slopePitch * 0.35 - landingKneeFlex * 0.55;
        av.rightLeg.rotation.x =
          rightPhase * swingAmp - slopePitch * 0.35 - landingKneeFlex * 0.55;
        av.leftLeg.rotation.z = springSway * 0.45 - strafeTiltRoll * 0.5;
        av.rightLeg.rotation.z = -springSway * 0.45 - strafeTiltRoll * 0.5;

        // 3rd-Person Left & Right Arm Locomotion Swing + Sprint Pump + Mining Scoop + Melee Cleave Arc
        const slashArc = Math.sin(gesturePulse * Math.PI);
        const sprintArmPump = fpSpringRigRef.current.sprintBlend;
        const tpLeftEngage = fpSpringRigRef.current.leftHandRaiseBlend;
        av.leftHandVoidRig.position.set(
          -0.44 + sprintArmPump * 0.05,
          THREE.MathUtils.lerp(0.25, 0.4 + openBlend * 0.22, tpLeftEngage) +
            rightPhase * swingAmp * (0.14 + sprintArmPump * 0.08),
          THREE.MathUtils.lerp(-0.08, -0.26 - openBlend * 0.16, tpLeftEngage) -
            rightPhase * swingAmp * (0.22 + sprintArmPump * 0.12)
        );
        av.leftHandVoidRig.rotation.set(
          THREE.MathUtils.lerp(0.12, 0.35 + openBlend * 0.55, tpLeftEngage) +
            sprintArmPump * 0.22 +
            rightPhase * swingAmp * 0.5,
          THREE.MathUtils.lerp(0.08, 0.25 + openBlend * 0.2, tpLeftEngage) +
            sprintArmPump * 0.15,
          -0.2
        );
        av.rightHandToolRig.position.set(
          0.44 - slashArc * 0.24 - sprintArmPump * 0.06,
          0.4 +
            slashArc * 0.22 +
            leftPhase * swingAmp * (0.14 + sprintArmPump * 0.08),
          -0.26 -
            slashArc * 0.28 -
            leftPhase * swingAmp * (0.22 + sprintArmPump * 0.12)
        );
        av.rightHandToolRig.rotation.set(
          0.35 -
            slashArc * 1.25 +
            sprintArmPump * 0.24 +
            leftPhase * swingAmp * 0.5,
          -0.25 + slashArc * 0.65 - sprintArmPump * 0.28,
          0.2 + slashArc * 0.45 - sprintArmPump * 0.18
        );

        // Drive Sculpted Upper-Arm Humerus & Elbow Couter Pivots so shoulders bridge seamlessly to forearms!
        const leftUpperArm = av.torsoGroup.userData.leftUpperArmPivot as
          | THREE.Group
          | undefined;
        const rightUpperArm = av.torsoGroup.userData.rightUpperArmPivot as
          | THREE.Group
          | undefined;
        if (leftUpperArm) {
          leftUpperArm.rotation.set(
            THREE.MathUtils.lerp(0.18, 0.52 - openBlend * 0.35, tpLeftEngage) +
              rightPhase * swingAmp * 0.42,
            THREE.MathUtils.lerp(0.08, 0.22 - openBlend * 0.15, tpLeftEngage),
            -0.18
          );
        }
        if (rightUpperArm) {
          rightUpperArm.rotation.set(
            0.52 + leftPhase * swingAmp * 0.42 - slashArc * 0.85,
            -0.22 + slashArc * 0.45 + sprintArmPump * 0.2,
            0.18
          );
        }

        const leftPauldron = av.torsoGroup.userData.leftPauldronGroup as
          | THREE.Group
          | undefined;
        const rightPauldron = av.torsoGroup.userData.rightPauldronGroup as
          | THREE.Group
          | undefined;
        if (leftPauldron) {
          leftPauldron.rotation.z =
            0.32 + breathCycle * 0.8 + rightPhase * swingAmp * 0.12;
        }
        if (rightPauldron) {
          rightPauldron.rotation.z =
            -0.32 - breathCycle * 0.8 - leftPhase * swingAmp * 0.12 - slashArc * 0.25;
        }

        const leftKnee = av.leftLeg.userData.kneeGroup as
          | THREE.Group
          | undefined;
        const rightKnee = av.rightLeg.userData.kneeGroup as
          | THREE.Group
          | undefined;
        if (leftKnee) {
          leftKnee.rotation.x =
            Math.max(0, -Math.cos(ex.walkCycle)) * swingAmp * 1.15 +
            0.12 +
            landingKneeFlex;
        }
        if (rightKnee) {
          rightKnee.rotation.x =
            Math.max(0, Math.cos(ex.walkCycle)) * swingAmp * 1.15 +
            0.12 +
            landingKneeFlex;
        }

        // Articulated Ankle Sabaton Foot Dorsiflexion & Plantarflexion
        const leftAnkle = av.leftLeg.userData.ankleGroup as
          | THREE.Group
          | undefined;
        const rightAnkle = av.rightLeg.userData.ankleGroup as
          | THREE.Group
          | undefined;
        if (leftAnkle) {
          leftAnkle.rotation.x =
            -leftPhase * swingAmp * 0.45 - landingKneeFlex * 0.45 + slopePitch * 0.3;
        }
        if (rightAnkle) {
          rightAnkle.rotation.x =
            -rightPhase * swingAmp * 0.45 - landingKneeFlex * 0.45 + slopePitch * 0.3;
        }

        const leftDigits = av.leftLeg.userData.pedalDigits as
          | THREE.Group[]
          | undefined;
        const rightDigits = av.rightLeg.userData.pedalDigits as
          | THREE.Group[]
          | undefined;
        if (leftDigits) {
          leftDigits.forEach((d) => {
            d.rotation.x = leftPhase * 0.35;
          });
        }
        if (rightDigits) {
          rightDigits.forEach((d) => {
            d.rotation.x = rightPhase * 0.35;
          });
        }
      }

      // Contextual Left-Hand Visibility:
      // The left hand shows when holding a 2-handed weapon (bracing foregrip), holding a world object, firing grapple hook, slashing mantis blades, performing an animation, or opening portals/menus
      const activeRightWeaponNow = resolveCompendiumItemById(
        compendiumStateRef.current.equippedRightHandId,
        compendiumStateRef.current
      );
      const isBracingTwoHandedWeapon =
        !fpSpringRigRef.current.isSheathed &&
        isTwoHandedWeapon(activeRightWeaponNow);
      const isHoldingLeftHandWeaponOrObject =
        isBracingTwoHandedWeapon ||
        Boolean(visceralCombatRigRef.current?.heldObject) ||
        Boolean(grappledEnemyRef.current) ||
        grappleHookRigRef.current.active ||
        bodyModsRigRef.current.mantisFlurryTimer > 0;
      const isUsingLeftHandInAnimation =
        fpSpringRigRef.current.isAnimatingAction() ||
        (visceralCombatRigRef.current?.meleeSwingTimer ?? 0) > 0 ||
        rightHandGestureTimerRef.current > 0 ||
        shardsRef.current.length > 0 ||
        activeToolRef.current === 'place-building';
      const isOpeningPortalsOrVoidBall =
        voidBallOpenRef.current ||
        voidBallModeRef.current !== 'dormant-clenched' ||
        Boolean(realityTearPortalRigRef.current?.isPortalOpenInWorld) ||
        (realityTearPortalRigRef.current?.portalOpenProgress ?? 0) > 0.02 ||
        voidBallEvolutionStateRef.current.isInBetweenPortalOpen ||
        voidBallEvolutionStateRef.current.isPlayerInsideInBetweenVoid ||
        voidBeamHandRaiseTimerRef.current > 0;
      const isOpeningMenusOrLoadout =
        isOverlayOpenRef.current || studioModeRef.current !== 'none';
      const shouldShowLeftHand =
        isHoldingLeftHandWeaponOrObject ||
        isUsingLeftHandInAnimation ||
        isOpeningPortalsOrVoidBall ||
        isOpeningMenusOrLoadout;

      fpEmitterGroup.visible = false;
      if (fpRightHandRigRef.current) {
        fpRightHandRigRef.current.visible =
          mode === 'first-person' && studioModeRef.current === 'none';
      }

      // Step Dual-Channel Second-Order Spring-Mass-Damper First-Person Viewmodel Kinematics
      fpSpringRigRef.current.stepSpringKinematics({
        dt,
        nowSec,
        yaw: ex.yaw,
        pitch: ex.pitch,
        horizSpeed,
        vertVel: ex.vel.y,
        walkCycle: ex.walkCycle,
        grounded: ex.grounded,
        isStealthCrouching: isStealthCrouchingRef.current,
        isSprinting: isSprintingNow,
        strafeSpeed,
        forwardSpeed,
        shouldShowLeftHand,
        isVoidHandOpen: isOpeningPortalsOrVoidBall || isOpeningMenusOrLoadout,
        isFirstPersonMode:
          mode === 'first-person' && studioModeRef.current === 'none',
        fpRightHandGroup: fpRightHandRigRef.current,
        fpLeftHandGroup: fpLeftHandRigRef.current,
        onReloadComplete: (refilledAmmo, weaponName) => {
          setWeaponCombatState(fpSpringRigRef.current.getCombatState());
          setLastCombatBanner(
            `✓ Reload Complete: ${weaponName} (${refilledAmmo}/${fpSpringRigRef.current.maxMagazine} Cells Chambered)`
          );
          harmonicSoundscape.triggerChime(5, 0.55);
        },
      });

      // Step Authoritative WeaponHandAnimationController:
      // Maps active weapon & tool to specific 5-finger 3-phalanx hand poses, ballistic wrist recoil flicking,
      // two-handed foregrip/pommel coupling, and physical melee swing impact rebounds!
      const curReloadProgress =
        fpSpringRigRef.current.reloadTimer > 0
          ? 1.0 -
            fpSpringRigRef.current.reloadTimer /
              Math.max(0.1, fpSpringRigRef.current.reloadDuration)
          : 0;
      weaponHandControllerRef.current.updateHandAndWeaponPoses({
        dt,
        nowSec,
        equippedItem: activeRightWeaponNow,
        activeTool: activeToolRef.current,
        isSheathed: fpSpringRigRef.current.isSheathed,
        voidOpenBlend: Math.max(
          openBlend,
          mindspaceDialConfigRef.current.isVoidDialOpen ? 1.0 : 0
        ),
        isReloading: fpSpringRigRef.current.reloadTimer > 0,
        reloadProgress: curReloadProgress,
        squallIntensity: weatherSample.squallIntensity,
        isGrapplingEnemy: Boolean(grappledEnemyRef.current),
        fpRightHandGroup: fpRightHandRigRef.current,
        fpLeftHandGroup: fpLeftHandRigRef.current,
        tpRightHandGroup: avatarRigRef.current?.rightHandToolRig ?? null,
        tpLeftHandGroup: avatarRigRef.current?.leftHandVoidRig ?? null,
      });

      // Step Choreographed Right-Hand Pull-From-Void-Ball Animation when drawing a weapon or tool from the Void Ball!
      if (voidWeaponPullStateRef.current.active) {
        stepRightHandPullFromVoidBallAnimation({
          pullState: voidWeaponPullStateRef.current,
          dt,
          fpLeftHandRig: fpLeftHandRigRef.current,
          fpRightHandRig: fpRightHandRigRef.current,
          activeWeaponMesh: fpSpringRigRef.current.fpEquippedMeshGroup,
        });
        voidOpenBlendRef.current = Math.max(voidOpenBlendRef.current, 1.0);
      }

      // If bare-handed grappling a live enemy ragdoll, hold their pelvis & torso suspended in front of the player's hands!
      if (grappledEnemyRef.current && fpSpringRigRef.current.isSheathed) {
        const gEnt = grappledEnemyRef.current;
        if (!entitiesRef.current.includes(gEnt)) {
          grappledEnemyRef.current = null;
        } else {
          _rafHoldDir
            .set(
              -Math.sin(ex.yaw) * Math.cos(ex.pitch),
              Math.sin(ex.pitch),
              -Math.cos(ex.yaw) * Math.cos(ex.pitch)
            )
            .normalize();
          const grapplePos = _rafTargetHandPos
            .copy(ex.pos)
            .add(new THREE.Vector3(0, 1.35, 0))
            .addScaledVector(_rafHoldDir, 2.05);
          gEnt.particles[0].pos.lerp(grapplePos, Math.min(1, dt * 18));
          gEnt.particles[1].pos.lerp(
            grapplePos.clone().add(new THREE.Vector3(0, 0.45, 0)),
            Math.min(1, dt * 18)
          );
          gEnt.activeBehaviorLabel = 'Grappled by Bare-Handed Voidwalker';
        }
      }

      // Step Signature Dimensional Grounding World Objects & Portal Room 3D Museum Displays
      const focusedGrounding = isInsidePortalRoom
        ? null
        : groundingWorldRigRef.current.updateAndFindFocusedAnchor({
            dt,
            nowSec,
            playerPos: ex.pos,
            playerYaw: ex.yaw,
            evalHeight: (x, z) =>
              evaluateTerrainHeight(
                x,
                z,
                activeWorld,
                excavationsRef.current
              ),
          });
      focusedGroundingAnchorRef.current = focusedGrounding;
      portalMuseumGalleryRigRef.current?.animateDisplays(nowSec);

      // Real-Time Complex Skin Topology Deformation on Playable Character & 1st-Person Hands (throttled to alternate frames for high FPS)
      if (frameParity === 0) {
        const charSkinStyle = resolveCharacterSkinTopology(charSpec);
        const charSkinParams = {
          flexionAngle:
            Math.abs(Math.sin(ex.walkCycle)) * 0.8 +
            openBlend * 0.65 +
            gesturePulse * 0.75,
          locomotionSpeed: horizSpeed,
          muscleStiffness: activeBehavior.muscleStiffness,
          windSpeed: weatherSample.windVec.length(),
          stunIntensity: Math.min(1, Math.abs(collisionRollImpulse) * 2.5),
          entrainmentCoherence:
            interconnectedTelemetry?.entrainmentCoherence ?? 0.45,
          strainHeatmapEnabled: strainHeatmapRef.current,
        };
        if (avatarRigRef.current) {
          updateSkinTopologyAndDeformation(
            avatarRigRef.current.root,
            charSkinStyle,
            nowSec,
            charSkinParams
          );
        }
        if (fpLeftHandRigRef.current && mode === 'first-person') {
          updateSkinTopologyAndDeformation(
            fpLeftHandRigRef.current,
            charSkinStyle,
            nowSec,
            charSkinParams
          );
        }
        if (fpRightHandRigRef.current && mode === 'first-person') {
          updateSkinTopologyAndDeformation(
            fpRightHandRigRef.current,
            charSkinStyle,
            nowSec,
            charSkinParams
          );
        }
      }

      // 3. Experimental Manifold Camera Choreography, Free-Look Edge Gliding & Collision Response
      const opts = gameOptionsRef.current;
      if (
        opts.freeLookMode === 'cursor-gliding' &&
        cursorNormRef.current.active &&
        !isOverlayOpenRef.current &&
        studioModeRef.current === 'none'
      ) {
        const nx = cursorNormRef.current.x;
        const ny = cursorNormRef.current.y;
        const edgeThreshold = Math.max(0.45, 0.72 - opts.cursorDeadzone);
        if (Math.abs(nx) > edgeThreshold) {
          const rimStrength =
            (Math.abs(nx) - edgeThreshold) / (1 - edgeThreshold);
          ex.yaw -=
            Math.sign(nx) *
            rimStrength *
            1.85 *
            opts.lookSensitivity *
            dt;
        }
        if (Math.abs(ny) > 0.78) {
          const rimPitch = (Math.abs(ny) - 0.78) / 0.22;
          const pitchDir = opts.invertPitchY ? Math.sign(ny) : -Math.sign(ny);
          ex.pitch = Math.max(
            -Math.PI * 0.42,
            Math.min(
              Math.PI * 0.42,
              ex.pitch + pitchDir * rimPitch * 0.85 * opts.lookSensitivity * dt
            )
          );
        }
      }

      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.density =
          activeWorld.palette.fogDensity * Math.max(0.2, opts.fogMultiplier);
      }

      const autonomicTuning = autonomicEquationEngine.getTuning();
      const camSpringStiff =
        autonomicTuning.cameraSpringStiffnessMultiplier ?? 1.0;
      const fovWarpDamp = autonomicTuning.fovWarpDampingMultiplier ?? 1.0;

      const targetRoll =
        (-moveRight * 0.035 +
          collisionRollImpulse +
          Math.sin(now * 0.0015) * 0.012 * Math.abs(currentW)) *
        opts.cameraRollIntensity *
        fovWarpDamp;
      ex.manifoldRoll +=
        (targetRoll - ex.manifoldRoll) * Math.min(1, dt * 8 * camSpringStiff);

      const targetFov =
        64 +
        (Math.min(10, horizSpeed * 0.45) + Math.abs(currentW) * 4.5) *
          opts.fovWarpIntensity *
          fovWarpDamp;
      camera.fov +=
        (targetFov - camera.fov) * Math.min(1, dt * 6 * camSpringStiff);
      camera.updateProjectionMatrix();

      if (Math.abs(povFlow.yawVel) > 0.00001 || Math.abs(povFlow.pitchVel) > 0.00001) {
        const stepFactor = Math.min(1, dt * 28);
        ex.yaw += povFlow.yawVel * stepFactor;
        ex.pitch = Math.max(
          -Math.PI * 0.42,
          Math.min(Math.PI * 0.42, ex.pitch + povFlow.pitchVel * stepFactor)
        );
        povFlow.yawVel *= 1 - stepFactor;
        povFlow.pitchVel *= 1 - stepFactor;
      }

      // Advance 3D Cutscene clock when in `'trauma-cutscene'` mode
      if (studioModeRef.current === 'trauma-cutscene') {
        cutsceneElapsedSecRef.current += dt;
        setCutsceneElapsedSec(cutsceneElapsedSecRef.current);
      }

      // If in Live 3D Character Creation Studio or 3-Act 3D Animated Trauma Cutscene, run the 3D Stage & Camera Choreography!
      if (characterStageRigRef.current) {
        updateVoidwalker3DAnimationAndStage({
          stageRig: characterStageRigRef.current,
          avatarRig: avatarRigRef.current,
          fpLeftHandRig: fpLeftHandRigRef.current,
          fpRightHandRig: fpRightHandRigRef.current,
          camera,
          playerPos: new THREE.Vector3(ex.pos.x, groundH, ex.pos.z),
          playerYaw: ex.yaw,
          config: voidwalkerConfigRef.current,
          studioMode: studioModeRef.current,
          studioPose: studioPoseRef.current,
          studioTurntableYaw: studioTurntableYawRef.current,
          cutsceneElapsedSec: cutsceneElapsedSecRef.current,
          voidBallMode: voidBallModeRef.current,
          meleeSwingTimer: visceralCombatRigRef.current?.meleeSwingTimer ?? 0,
          meleeSwingDuration:
            visceralCombatRigRef.current?.meleeSwingDuration ?? 0.38,
          nowSec,
        });
      }

      // Update [Shift + V] 3D Mindspace Perspective Sink & 3 Live Example Figures!
      const isMindspaceSinking =
        mindspace3DRigRef.current &&
        updateMindspaceCustomizationCameraAndFigures({
          rig: mindspace3DRigRef.current,
          camera,
          config: mindspaceDialConfigRef.current,
          playerPos: ex.pos,
          dt,
          nowSec,
        });
      if (fpLeftHandRigRef.current && fpRightHandRigRef.current) {
        const showFpHands =
          mode === 'first-person' &&
          studioModeRef.current === 'none' &&
          !isMindspaceSinking;
        fpLeftHandRigRef.current.visible = showFpHands;
        fpRightHandRigRef.current.visible = showFpHands;
      }

      if (isMindspaceSinking) {
        // Camera is sunk into the 3D Mindspace Customization Sanctuary framing the 3 Live Example Figures!
      } else if (studioModeRef.current !== 'none') {
        // Camera is actively choreographed by updateVoidwalker3DAnimationAndStage on the 3D Pedestal / Cutscene!
      } else if (isVehicleMountedRef.current && gravityVehicleRigRef.current) {
        const v = gravityVehicleRigRef.current;
        const vPos = v.root.position;
        const vQuat = v.root.quaternion;
        const chaseDist = mode === 'first-person' ? 0.35 : 7.8;
        const chaseHeight = mode === 'first-person' ? 0.55 : 2.5;
        const camOffset = new THREE.Vector3(0, chaseHeight, chaseDist).applyQuaternion(vQuat);
        const desiredCamPos = vPos.clone().add(camOffset);
        camera.position.lerp(desiredCamPos, 1 - Math.exp(-dt * 20));
        const lookTarget = vPos.clone().add(new THREE.Vector3(0, 0.4, -6.0).applyQuaternion(vQuat));
        camera.lookAt(lookTarget);
      } else if (mode === 'first-person') {
        const eyeHeight =
          (isStealthCrouchingRef.current ? 1.18 : 1.82) * charSpec.heightScale;
        const bobScale = Math.min(1.0, horizSpeed / 5.5);
        const bobY = ex.grounded ? Math.sin(ex.walkCycle * 2) * 0.046 * bobScale : 0;
        const swayX = ex.grounded ? Math.cos(ex.walkCycle) * 0.022 * bobScale : 0;
        const eyePos = new THREE.Vector3(
          ex.pos.x + swayX,
          povFlow.smoothVisualY + eyeHeight + bobY,
          ex.pos.z
        );
        const camBlend = 1 - Math.exp(-dt * 26);
        camera.position.lerp(eyePos, camBlend);

        const lookDir = new THREE.Vector3(
          -Math.sin(ex.yaw) * Math.cos(ex.pitch),
          Math.sin(ex.pitch),
          -Math.cos(ex.yaw) * Math.cos(ex.pitch)
        );
        camera.lookAt(camera.position.clone().add(lookDir));
        camera.rotation.z += ex.manifoldRoll + (ex.grounded ? Math.sin(ex.walkCycle) * 0.012 * bobScale : 0);
      } else if (mode === 'third-person') {
        const dist = ex.thirdPersonDist;
        const bobScale = Math.min(1.0, horizSpeed / 5.5);
        const bobY = ex.grounded ? Math.sin(ex.walkCycle * 2) * 0.028 * bobScale : 0;
        const smoothOrigin = new THREE.Vector3(
          ex.pos.x,
          povFlow.smoothVisualY + bobY,
          ex.pos.z
        );
        const camOffset = new THREE.Vector3(
          Math.sin(ex.yaw) * Math.cos(ex.pitch) * dist,
          -Math.sin(ex.pitch) * dist + 2.4 * charSpec.heightScale,
          Math.cos(ex.yaw) * Math.cos(ex.pitch) * dist
        );
        const desiredCamPos = smoothOrigin.clone().add(camOffset);

        const camGroundY = evaluateTerrainHeight(
          desiredCamPos.x,
          desiredCamPos.z,
          activeWorld,
          excavationsRef.current
        );
        desiredCamPos.y = Math.max(camGroundY + 0.95, desiredCamPos.y);

        const camBlend = 1 - Math.exp(-dt * 16);
        camera.position.lerp(desiredCamPos, camBlend);
        const desiredLookTarget = smoothOrigin
          .clone()
          .add(new THREE.Vector3(0, 1.55 * charSpec.heightScale, 0));
        povFlow.smoothLookAt.lerp(desiredLookTarget, 1 - Math.exp(-dt * 22));
        camera.lookAt(povFlow.smoothLookAt);
      } else {
        const orbitAngle = now * 0.00018 + ex.yaw;
        const radius = 38;
        const desiredOrbital = new THREE.Vector3(
          Math.sin(orbitAngle) * radius,
          24 - ex.pitch * 15,
          Math.cos(orbitAngle) * radius
        );
        camera.position.lerp(desiredOrbital, 1 - Math.exp(-dt * 6));
        camera.lookAt(0, 2, 0);
      }

      // 4. Animate Mined Elemental Resource Shards flying into Left-Hand Void Ball
      for (let i = shardsRef.current.length - 1; i >= 0; i--) {
        const sh = shardsRef.current[i];
        sh.age += dt;
        const targetHandPos = ex.pos
          .clone()
          .add(new THREE.Vector3(0, 1.35, 0));
        const toHand = new THREE.Vector3().subVectors(targetHandPos, sh.pos);
        const distToHand = toHand.length();
        sh.vel.lerp(toHand.normalize().multiplyScalar(18), dt * 6);
        sh.pos.addScaledVector(sh.vel, dt);
        sh.mesh.position.copy(sh.pos);
        sh.mesh.rotation.x += dt * 6;
        sh.mesh.rotation.y += dt * 6;

        if (distToHand < 0.65 || sh.age > 1.6) {
          scene.remove(sh.mesh);
          sh.mesh.geometry.dispose();
          (sh.mesh.material as THREE.Material).dispose();
          shardsRef.current.splice(i, 1);
        }
      }

      // 5. Animate World Landmark & Placed Architectural Megastructure Rotors & Linkages
      const wSpeedFactor = 1.0 + Math.abs(currentW) * 1.8;
      for (const rotor of kineticRotorsRef.current) {
        const axis = rotor.userData.spinAxis || 'y';
        if (axis === 'x') rotor.rotation.x += dt * 1.1 * wSpeedFactor;
        else if (axis === 'z') rotor.rotation.z += dt * 1.1 * wSpeedFactor;
        else rotor.rotation.y += dt * 1.1 * wSpeedFactor;
      }
      for (const pend of pendulumsRef.current) {
        pend.rotation.z =
          Math.sin(now * 0.0022 * wSpeedFactor) *
          (0.38 + Math.abs(currentW) * 0.3);
      }
      if (buildingsGroupRef.current) {
        buildingsGroupRef.current.traverse((child) => {
          if (child.userData.isKineticRotor) {
            const axis = child.userData.spinAxis || 'y';
            if (axis === 'x') child.rotation.x += dt * 1.15 * wSpeedFactor;
            else if (axis === 'z') child.rotation.z += dt * 1.15 * wSpeedFactor;
            else child.rotation.y += dt * 1.15 * wSpeedFactor;
          }
          if (child.userData.isPendulum) {
            child.rotation.z =
              Math.sin(now * 0.0024 * wSpeedFactor) *
              (0.32 + Math.abs(currentW) * 0.25);
          }
        });
      }

      // 6. Update Destructive Weapon Projectiles, Spent Casings & Ragdoll/Terrain Crater Collisions
      for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
        const proj = projectilesRef.current[i];
        proj.age += dt;
        const gravScale = proj.isSpentCasing ? 1.15 : 0.25;
        proj.vel.y -= activeWorld.gravity * gravScale * dt;
        proj.pos.addScaledVector(proj.vel, dt);
        proj.mesh.position.copy(proj.pos);
        proj.mesh.rotation.x += dt * (proj.isSpentCasing ? 14 : 9);
        proj.mesh.rotation.z += dt * (proj.isSpentCasing ? 11 : 7);

        const gY = evaluateTerrainHeight(
          proj.pos.x,
          proj.pos.z,
          activeWorld,
          excavationsRef.current
        );

        // Spent brass/crystal casings bounce physically on the terrain before despawning
        if (proj.isSpentCasing) {
          if (proj.pos.y <= gY + 0.08) {
            proj.pos.y = gY + 0.08;
            proj.vel.y = Math.abs(proj.vel.y) * 0.42;
            proj.vel.x *= 0.68;
            proj.vel.z *= 0.68;
          }
          if (proj.age > (proj.maxAge ?? 3.5)) {
            scene.remove(proj.mesh);
            proj.mesh.traverse((ch) => {
              if (ch instanceof THREE.Mesh) {
                ch.geometry.dispose();
                if (Array.isArray(ch.material)) {
                  ch.material.forEach((m) => m.dispose());
                } else {
                  ch.material.dispose();
                }
              }
            });
            projectilesRef.current.splice(i, 1);
          }
          continue;
        }

        let hit = false;
        let hitTerrain = false;
        if (proj.pos.y <= gY + 0.22) {
          hit = true;
          hitTerrain = true;
        }

        // Check if projectile strikes a Physical 3D In-World 4D Node Actuator Pylon!
        for (const sec of generatedSectorsRef.current.values()) {
          const [px, pz] = sec.pylonCoords;
          if (Math.hypot(proj.pos.x - px, proj.pos.z - pz) < 2.2) {
            hit = true;
            const shiftedW = Number(
              Math.max(-1, Math.min(1, Math.cos(nowSec * 1.3))).toFixed(2)
            );
            onSyncTemporalLoopStateRef.current(0, shiftedW);
            autonomicEquationEngine.recordGameplayEquationDiscovery(
              'dimensional-w-shift',
              1.4
            );
            somaticGraftStateRef.current.lastWorldMechanicEvent = `Struck 3D 4D-Node Pylon → Shifted W=${shiftedW} & Pulsed Ragdoll Springs`;
            harmonicSoundscape.triggerArchitecturalChord(3);
            break;
          }
        }

        const elemId = proj.elementId ?? activeBaseElementRef.current;
        const elemSpec =
          BASE_DIMENSIONAL_ELEMENTS[elemId] ??
          BASE_DIMENSIONAL_ELEMENTS['chrono-phase'];
        const dmgScale = proj.damageScale ?? 1.0;

        // Sub-Stepped Anatomical Limb Capsule Raycast (Head Weak-Point, Torso, Upper/Lower Limbs)
        const prevProjPos = _rafTargetHandPos
          .copy(proj.pos)
          .addScaledVector(proj.vel, -dt);
        const limbHit =
          spatialCollisionSolver.raycastSubSteppedAnatomicalLimbs(
            prevProjPos,
            proj.pos,
            0.42,
            entitiesRef.current
          );

        if (limbHit) {
          const ent = limbHit.entity;
          const totalMult =
            dmgScale * elemSpec.damageMultiplier * limbHit.damageMultiplier;
          const blastVec = _rafBlastVec
            .copy(proj.vel)
            .normalize()
            .multiplyScalar(28 * totalMult)
            .add(new THREE.Vector3(0, 10.5 * dmgScale, 0));

          const goreModalities: DamageGoreModality[] = [
            'laceration-hemorrhage',
            'hydrostatic-viscera-rupture',
            'calcified-marrow-shatter',
            'corrosive-ichor-dissolution',
            'neural-synapse-hemolysis',
          ];
          const chosenGore =
            limbHit.limbKind === 'head'
              ? 'neural-synapse-hemolysis'
              : limbHit.limbKind === 'upper-limb' ||
                limbHit.limbKind === 'lower-limb'
              ? 'calcified-marrow-shatter'
              : goreModalities[
                  Math.abs(Math.floor(now)) % goreModalities.length
                ];
          ent.applyInternalGoreTrauma(
            chosenGore,
            0.52 * totalMult,
            blastVec.clone(),
            ex.pos
          );

          if (
            (limbHit.limbKind === 'upper-limb' ||
              limbHit.limbKind === 'lower-limb') &&
            limbHit.limbIndex >= 0 &&
            ent.limbs[limbHit.limbIndex]
          ) {
            ent.limbs[limbHit.limbIndex].tendonIntegrity = Math.max(
              0.12,
              ent.limbs[limbHit.limbIndex].tendonIntegrity - 0.65
            );
          }

          if (visceralCombatRigRef.current) {
            const { didSeverLimb, severedPartName } =
              spawnArterialGoreAndDismemberment({
                rig: visceralCombatRigRef.current,
                targetEntity: ent,
                hitPos: limbHit.hitPoint.clone(),
                strikeDir: proj.vel.clone().normalize(),
                activeElement: elemId,
                forceSeverLimb:
                  dmgScale >= 1.15 ||
                  limbHit.limbKind === 'upper-limb' ||
                  limbHit.limbKind === 'lower-limb',
                evalHeight: (x, z) =>
                  evaluateTerrainHeight(
                    x,
                    z,
                    activeWorld,
                    excavationsRef.current
                  ),
              });
            if (didSeverLimb || limbHit.limbKind === 'head') {
              setDevianceXP((xp) => xp + 2);
              setLastCombatBanner(
                limbHit.limbKind === 'head'
                  ? `🎯 CRANIAL WEAK-POINT CRIT (1.85×)! Struck ${ent.blueprint.name}'s ${limbHit.limbName} (+2 Deviance XP)!`
                  : `💥 LIMB HITBOX DISMEMBERMENT! Severed ${severedPartName} (${limbHit.limbName}) on ${ent.blueprint.name} (+2 Deviance XP)!`
              );
            }
          }

          onImpactSpikeRef.current(limbHit.limbKind === 'head' ? 1.0 : 0.92);
          hit = true;
        }

        // Destructive Terrain Crater & Shockwave on Impact!
        if (hit) {
          const ringGeo = new THREE.RingGeometry(0.35, 0.95, 24);
          const ringMat = new THREE.MeshBasicMaterial({
            color: elemSpec.emissiveHex,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = -Math.PI / 2;
          ringMesh.position.set(proj.pos.x, gY + 0.18, proj.pos.z);
          scene.add(ringMesh);
          shockwavesRef.current.push({ mesh: ringMesh, age: 0, maxAge: 0.55 });

          if (
            hitTerrain &&
            proj.carveCraterRadius &&
            proj.carveCraterRadius >= 1.25 &&
            !isInsidePortalRoom
          ) {
            const spot: TerrainExcavationSpot = {
              x: Number(proj.pos.x.toFixed(2)),
              z: Number(proj.pos.z.toFixed(2)),
              radius: Number(proj.carveCraterRadius.toFixed(2)),
              depth: Number((proj.carveCraterRadius * 0.34).toFixed(2)),
            };
            if (granularDirtRigRef.current) {
              triggerGranularDirtExcavationBurst({
                rig: granularDirtRigRef.current,
                hitPos: new THREE.Vector3(spot.x, gY, spot.z),
                world: activeWorld,
                scoopRadius: spot.radius,
                scoopDepth: spot.depth,
                evalHeight: (x, z) =>
                  evaluateTerrainHeight(
                    x,
                    z,
                    activeWorld,
                    excavationsRef.current
                  ),
              });
            }
            onMineTerrainAtRef.current(spot, [activeWorld.primaryResource]);
            autonomicEquationEngine.recordGameplayEquationDiscovery(
              'tectonic-excavation',
              1.0
            );
          }
        }

        if (hit || proj.age > (proj.maxAge ?? 2.8)) {
          scene.remove(proj.mesh);
          proj.mesh.traverse((ch) => {
            if (ch instanceof THREE.Mesh) {
              ch.geometry.dispose();
              if (Array.isArray(ch.material)) {
                ch.material.forEach((m) => m.dispose());
              } else {
                ch.material.dispose();
              }
            }
          });
          projectilesRef.current.splice(i, 1);
        }
      }

      // 7. Update Visual Shockwave Rings
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        sw.age += dt;
        const progress = sw.age / sw.maxAge;
        const scale = 1 + progress * 14;
        sw.mesh.scale.set(scale, scale, 1);
        (sw.mesh.material as THREE.MeshBasicMaterial).opacity =
          (1 - progress) * 0.75;
        if (sw.age >= sw.maxAge) {
          scene.remove(sw.mesh);
          sw.mesh.geometry.dispose();
          (sw.mesh.material as THREE.Material).dispose();
          shockwavesRef.current.splice(i, 1);
        }
      }

      // 8. Step All Articulated 3D Ragdoll Entities OR Replay 5-Second Temporal Loop
      const currentSelectedId = selectedEntityIdRef.current;
      const isLooping =
        temporalLoopActiveRef.current && temporalBufferRef.current.length > 20;
      let replayedWCoord: number | undefined = undefined;
      let currentLoopProgress = 0;

      if (isLooping) {
        const buffer = temporalBufferRef.current;
        const firstTime = buffer[0].timeSec;
        const lastTime = buffer[buffer.length - 1].timeSec;
        const duration = Math.max(0.5, lastTime - firstTime);

        loopPhaseTimeRef.current = (loopPhaseTimeRef.current + dt) % duration;
        currentLoopProgress = loopPhaseTimeRef.current / duration;
        const targetTime = firstTime + loopPhaseTimeRef.current;

        let idxA = 0;
        for (let i = 0; i < buffer.length - 1; i++) {
          if (buffer[i + 1].timeSec >= targetTime) {
            idxA = i;
            break;
          }
        }
        const idxB = Math.min(buffer.length - 1, idxA + 1);
        const frameA = buffer[idxA];
        const frameB = buffer[idxB];
        const span = Math.max(0.0001, frameB.timeSec - frameA.timeSec);
        const alpha = Math.max(
          0,
          Math.min(1, (targetTime - frameA.timeSec) / span)
        );

        const seamBlend =
          currentLoopProgress > 0.88 ? (currentLoopProgress - 0.88) / 0.12 : 0;
        const frameStart = buffer[0];

        const rawW = frameA.wCoord + (frameB.wCoord - frameA.wCoord) * alpha;
        replayedWCoord = Number(
          (rawW * (1 - seamBlend) + frameStart.wCoord * seamBlend).toFixed(2)
        );

        for (const ent of entitiesRef.current) {
          const poseA = frameA.entities.find((e) => e.id === ent.id);
          const poseB = frameB.entities.find((e) => e.id === ent.id) ?? poseA;
          const poseStart =
            frameStart.entities.find((e) => e.id === ent.id) ?? poseA;

          if (poseA && poseB && poseStart) {
            ent.headingAngle =
              (poseA.headingAngle +
                (poseB.headingAngle - poseA.headingAngle) * alpha) *
                (1 - seamBlend) +
              poseStart.headingAngle * seamBlend;
            ent.currentStiffness =
              poseA.currentStiffness +
              (poseB.currentStiffness - poseA.currentStiffness) * alpha;
            ent.activeBehaviorLabel = `Temporal Loop (${poseA.activeBehaviorLabel})`;

            for (
              let pIdx = 0;
              pIdx < ent.particles.length &&
              pIdx < poseA.particlePositions.length;
              pIdx++
            ) {
              const pA = poseA.particlePositions[pIdx];
              const pB = poseB.particlePositions[pIdx] ?? pA;
              const p0 = poseStart.particlePositions[pIdx] ?? pA;

              const ix = pA[0] + (pB[0] - pA[0]) * alpha;
              const iy = pA[1] + (pB[1] - pA[1]) * alpha;
              const iz = pA[2] + (pB[2] - pA[2]) * alpha;

              const fx = ix * (1 - seamBlend) + p0[0] * seamBlend;
              const fy = iy * (1 - seamBlend) + p0[1] * seamBlend;
              const fz = iz * (1 - seamBlend) + p0[2] * seamBlend;

              ent.particles[pIdx].pos.set(fx, fy, fz);
              ent.particles[pIdx].prevPos.set(fx, fy, fz);
            }

            const pelvis = ent.particles[0].pos;
            const groundY = evaluateTerrainHeight(
              pelvis.x,
              pelvis.z,
              activeWorld,
              excavationsRef.current
            );
            ent.syncMeshesToSkeleton(groundY);
          }

          const isSel = ent.id === currentSelectedId;
          const ringMat = ent.selectionRing.material as THREE.MeshBasicMaterial;
          ringMat.opacity = isSel ? 0.92 : 0.32;
          ent.selectionRing.scale.setScalar(isSel ? 1.45 : 1.0);
        }
      } else {
        loopPhaseTimeRef.current = 0;
        // Step Faction-Based Timeline Creature AI Director (Swarmer, Stalker, Leviathan, Mimic & Inter-Faction Combat!)
        creatureFactionAIDirectorRef.current.stepCreatureFactionAI({
          dt,
          nowSec,
          entities: entitiesRef.current,
          playerPos: ex.pos,
        });
        for (const ent of entitiesRef.current) {
          const entWeather = evaluateBiomeWeatherField(
            activeWorld,
            currentW,
            nowSec,
            ent.particles[0].pos,
            cloud5DCanopyRef.current?.causticBeams
          );
          ent.latestWindSpeed = entWeather.windVec.length();
          ent.strainHeatmapEnabled = strainHeatmapRef.current;
          ent.forcedRagdoll = globalRagdollRef.current;
          ent.stepPhysics(
            dt,
            activeWorld,
            activeBehavior,
            ex.pos,
            entitiesRef.current,
            entWeather,
            excavationsRef.current,
            worldspaceBleedRigRef.current?.anomalousObjects,
            worldspaceBleedRigRef.current?.coalescenceStrength ?? 0,
            goreGenreOverrideRef.current,
            frontierComplexesRef.current
          );

          // Autonomous Ecological & Evolutionary Simulation: Frontier Discovery, DNA Mutation, Cave-Nests & Defecation Flora
          const pPos = ent.particles[0].pos;
          const distFromOrigin = Math.hypot(pPos.x, pPos.z);
          const evoMult = Math.max(0.5, evolutionSpeedMultiplierRef.current);

          // 1. Frontier Edge Exploration -> Generate New Biocomplex or Tech-Husbandry Paddock
          if (
            distFromOrigin >= 29 &&
            frontierComplexesRef.current.length < 8 &&
            onDiscoverFrontierComplexRef.current
          ) {
            const hasNearby = frontierComplexesRef.current.some(
              (fc) => Math.hypot(pPos.x - fc.x, pPos.z - fc.z) < 15.0
            );
            if (!hasNearby) {
              const angle = Math.atan2(pPos.z, pPos.x);
              const newSite = generateFrontierComplexAtEdge(
                activeWorld.seed,
                frontierComplexesRef.current.length + 1,
                angle,
                (x, z) =>
                  evaluateTerrainHeight(
                    x,
                    z,
                    activeWorld,
                    excavationsRef.current
                  )
              );
              onDiscoverFrontierComplexRef.current(newSite);
            }
          }

          // 2. Frontier Complex DNA Mutation, Reproduction & Tech-Species Husbandry Domestication
          if (ent.frontierMutationTimer <= 0) {
            const insideComplex = frontierComplexesRef.current.find(
              (fc) =>
                Math.hypot(pPos.x - fc.x, pPos.z - fc.z) <= fc.radius + 3.0
            );
            if (insideComplex && onLogEvolutionaryLineageRef.current) {
              ent.frontierMutationTimer = (22 + Math.random() * 14) / evoMult;
              const trigger =
                insideComplex.kind === 'tech-species-husbandry-paddock'
                  ? 'tech-husbandry-domestication'
                  : insideComplex.fertilityIndex >= 0.62
                  ? 'fertile-habitat-reproduction'
                  : 'frontier-biome-migration';
              const { mutatedDNA, mutatedBlueprint, lineageRecord } =
                mutateEntityGenomeAndBlueprint(
                  ent.blueprint,
                  ent.geneticDNA,
                  activeWorld.seed,
                  activeWorld.name,
                  trigger,
                  insideComplex
                );
              ent.geneticDNA = mutatedDNA;
              ent.blueprint = mutatedBlueprint;
              ent.activeEcologicalActivity =
                insideComplex.kind === 'tech-species-husbandry-paddock'
                  ? `Domesticated Gen-${mutatedDNA.generation} (${insideComplex.name.split('#')[0].trim()})`
                  : `Evolved Gen-${mutatedDNA.generation} in ${insideComplex.name.split('#')[0].trim()}`;
              onLogEvolutionaryLineageRef.current(
                lineageRecord,
                insideComplex.id
              );

              // Reproduce differentiated offspring if complex is fertile and population allows
              if (
                insideComplex.fertilityIndex >= 0.58 &&
                entitiesRef.current.length < 13
              ) {
                spawnEntityInstance(mutatedBlueprint);
              }
            } else {
              ent.frontierMutationTimer = 6.0 / evoMult;
            }
          }

          // 3. Vertical Elevation Advancement -> Spawn 3D Cave & Nest Complex
          if (ent.caveExcavationTimer <= 0) {
            const groundYHere = evaluateTerrainHeight(
              pPos.x,
              pPos.z,
              activeWorld,
              excavationsRef.current
            );
            if (
              groundYHere > 1.35 &&
              caveNestComplexesRef.current.length < 8 &&
              onSpawnCaveNestComplexRef.current
            ) {
              const nearCave = caveNestComplexesRef.current.some(
                (c) => Math.hypot(pPos.x - c.x, pPos.z - c.z) < 10.0
              );
              if (!nearCave) {
                ent.caveExcavationTimer = (28 + Math.random() * 18) / evoMult;
                const newCave: WorldCaveNestComplex = {
                  id: `cave-${Date.now()}-${Math.floor(Math.random() * 999)}`,
                  builderEntityName: ent.blueprint.name,
                  dnaHash: ent.geneticDNA.dnaHash,
                  x: Number(pPos.x.toFixed(1)),
                  y: Number(groundYHere.toFixed(2)),
                  z: Number(pPos.z.toFixed(1)),
                  elevationTier: Number(groundYHere.toFixed(1)),
                  caveRadius: 1.85,
                  nestEggCount: 3 + (activeWorld.seed % 3),
                  accentHex: ent.blueprint.jointGlowColor,
                  createdAt: Date.now(),
                };
                onSpawnCaveNestComplexRef.current(newCave);
                ent.activeEcologicalActivity = `Excavated High-Elevation Cave & Nest (${groundYHere.toFixed(
                  1
                )}m)`;
                if (onLogEvolutionaryLineageRef.current) {
                  const { mutatedDNA, mutatedBlueprint, lineageRecord } =
                    mutateEntityGenomeAndBlueprint(
                      ent.blueprint,
                      ent.geneticDNA,
                      activeWorld.seed,
                      activeWorld.name,
                      'elevation-cave-adaptation',
                      null
                    );
                  ent.geneticDNA = mutatedDNA;
                  ent.blueprint = mutatedBlueprint;
                  onLogEvolutionaryLineageRef.current(lineageRecord);
                }
              } else {
                ent.caveExcavationTimer = 10.0 / evoMult;
              }
            } else {
              ent.caveExcavationTimer = 8.0 / evoMult;
            }
          }

          // 4. Defecation / Nutrient Guano-Spore Deposition -> Sprout Vegetation Cluster
          if (
            ent.defecationTimer <= 0 &&
            fertilizedFloraPatchesRef.current.length < 18 &&
            onSpawnFertilizedFloraPatchRef.current
          ) {
            ent.defecationTimer = (18 + Math.random() * 14) / evoMult;
            const groundYHere = evaluateTerrainHeight(
              pPos.x,
              pPos.z,
              activeWorld,
              excavationsRef.current
            );
            const newFlora: WorldFertilizedFloraPatch = {
              id: `flora-${Date.now()}-${Math.floor(Math.random() * 999)}`,
              depositorEntityName: ent.blueprint.name,
              x: Number(pPos.x.toFixed(1)),
              y: Number(groundYHere.toFixed(2)),
              z: Number(pPos.z.toFixed(1)),
              nutrientPotency: Number(
                (0.75 + ent.geneticDNA.dnaNutritionalValue * 0.85).toFixed(2)
              ),
              growthStage: 1.0,
              stemCount: 4 + (Math.floor(Math.abs(pPos.x + pPos.z)) % 4),
              primaryHex: '#10b981',
              sporeHex: ent.blueprint.jointGlowColor,
              createdAt: Date.now(),
            };
            onSpawnFertilizedFloraPatchRef.current(newFlora);
            ent.activeEcologicalActivity =
              'Fertilized Terrain via Nutrient Spore Defecation';
          }

          // 5. Eject Physical 3D Visceral Organ & DNA Helix Pickup when entity takes gore trauma!
          if (
            ent.pendingOrganEjection &&
            organPickupsRef.current.length < 14
          ) {
            const ej = ent.pendingOrganEjection;
            ent.pendingOrganEjection = null;
            const pickup = buildPhysicalVisceralOrganPickup(
              ej.pos,
              ent.blueprint.name,
              ent.geneticDNA.dnaHash,
              ej.modality,
              ent.blueprint.jointGlowColor
            );
            scene.add(pickup.mesh);
            organPickupsRef.current.push(pickup);
          }

          // 6. Physical 3D Sector Thermal Geysers & Lexicon DNA Fusion Cradles for Entities!
          for (const sec of generatedSectorsRef.current.values()) {
            const [gx, gz] = sec.geyserCoords;
            if (Math.hypot(pPos.x - gx, pPos.z - gz) < 2.8) {
              ent.applyKineticImpulse(new THREE.Vector3(0, 14, 0), 0.6);
              ent.activeEcologicalActivity = `Riding Thermal Updraft Geyser (${sec.name})`;
            }
            const [cx, cz] = sec.cradleCoords;
            if (
              cradleSynthesisCooldownRef.current <= 0 &&
              Math.hypot(pPos.x - cx, pPos.z - cz) < 4.5 &&
              entitiesRef.current.length < 18
            ) {
              const partner = entitiesRef.current.find(
                (other) =>
                  other.id !== ent.id &&
                  Math.hypot(
                    other.particles[0].pos.x - cx,
                    other.particles[0].pos.z - cz
                  ) < 6.5
              );
              if (partner) {
                cradleSynthesisCooldownRef.current = 18.0;
                const { mutatedDNA, mutatedBlueprint, lineageRecord } =
                  mutateEntityGenomeAndBlueprint(
                    ent.blueprint,
                    ent.geneticDNA,
                    activeWorld.seed,
                    activeWorld.name,
                    'fertile-habitat-reproduction',
                    null
                  );
                ent.geneticDNA = mutatedDNA;
                const cY = evaluateTerrainHeight(
                  cx,
                  cz,
                  activeWorld,
                  excavationsRef.current
                );
                spawnEntityInstance(
                  mutatedBlueprint,
                  new THREE.Vector3(cx, cY + 1.2, cz)
                );
                if (onLogEvolutionaryLineageRef.current) {
                  onLogEvolutionaryLineageRef.current(lineageRecord);
                }
                somaticGraftStateRef.current.lastWorldMechanicEvent = `3D Lexicon Cradle Fused ${ent.blueprint.name.split(' ')[0]} × ${partner.blueprint.name.split(' ')[0]} → ${mutatedBlueprint.name}!`;
                harmonicSoundscape.triggerArchitecturalChord(4);
              }
            }
          }

          const isSel = ent.id === currentSelectedId;
          const ringMat = ent.selectionRing.material as THREE.MeshBasicMaterial;
          ringMat.opacity = isSel ? 0.92 : 0.32;
          ent.selectionRing.scale.setScalar(isSel ? 1.45 : 1.0);
        }

        const recordedEntities: TemporalEntityPose[] = entitiesRef.current.map(
          (ent) => ({
            id: ent.id,
            headingAngle: ent.headingAngle,
            gaitCycle: ent.gaitCycle,
            currentStiffness: ent.currentStiffness,
            activeBehaviorLabel: ent.activeBehaviorLabel,
            particlePositions: ent.particles.map((p) => [
              p.pos.x,
              p.pos.y,
              p.pos.z,
            ]),
          })
        );

        temporalBufferRef.current.push({
          timeSec: nowSec,
          wCoord: currentW,
          entities: recordedEntities,
        });

        const cutoff = nowSec - 5.0;
        while (
          temporalBufferRef.current.length > 2 &&
          temporalBufferRef.current[0].timeSec < cutoff
        ) {
          temporalBufferRef.current.shift();
        }
      }

      // 8A-II. Distance-Based 3-Tier 3D Level of Detail (LOD) Culling on Entities & World Props
      if (frameParity === 0) {
        drsAndLodControllerRef.current.updateEntityAndPropLOD(
          ex.pos,
          entitiesRef.current,
          worldPropsListRef.current
        );
      }

      // 8B. Step Physical 3D Visceral Organ & DNA Helix Pickups + Somatic Player Body Grafting!
      if (cradleSynthesisCooldownRef.current > 0) {
        cradleSynthesisCooldownRef.current = Math.max(
          0,
          cradleSynthesisCooldownRef.current - dt
        );
      }
      if (pylonShiftCooldownRef.current > 0) {
        pylonShiftCooldownRef.current = Math.max(
          0,
          pylonShiftCooldownRef.current - dt
        );
      }

      for (let i = organPickupsRef.current.length - 1; i >= 0; i--) {
        const org = organPickupsRef.current[i];
        org.age += dt;
        org.vel.y -= activeWorld.gravity * 0.65 * dt;
        org.pos.addScaledVector(org.vel, dt);
        const orgGroundY = evaluateTerrainHeight(
          org.pos.x,
          org.pos.z,
          activeWorld,
          excavationsRef.current
        );
        if (org.pos.y < orgGroundY + 0.45) {
          org.pos.y = orgGroundY + 0.45;
          org.vel.y = Math.abs(org.vel.y) * 0.45;
          org.vel.x *= 0.78;
          org.vel.z *= 0.78;
        }
        org.mesh.position.copy(org.pos);
        org.mesh.rotation.y += dt * 2.6;
        const pulseScale = 1.0 + Math.sin(nowSec * 9.0 + i) * 0.16;
        org.mesh.scale.setScalar(pulseScale);

        // Player walks over the 3D Visceral Organ -> Physically grafts it onto the Player's 3D Character Rig!
        const distToPlayer = org.pos.distanceTo(ex.pos);
        if (distToPlayer < 2.35) {
          const gs = somaticGraftStateRef.current;
          gs.graftCount += 1;
          gs.activeOrganTitle = `${org.organTitle} (${org.dnaHash})`;
          gs.limbScaleMultiplier = Number(
            Math.min(1.42, gs.limbScaleMultiplier + 0.045).toFixed(2)
          );
          gs.speedBoostMultiplier = Number(
            Math.min(1.65, gs.speedBoostMultiplier + 0.06).toFixed(2)
          );
          gs.jumpBoostMultiplier = Number(
            Math.min(1.75, gs.jumpBoostMultiplier + 0.07).toFixed(2)
          );
          gs.lastWorldMechanicEvent = `Grafted 3D ${org.organTitle} from ${
            org.sourceEntityName.split(' ')[0]
          } (+Speed/Jump & 3D Body Morph)`;
          harmonicSoundscape.triggerPainPleasureVocalization({
            painPleasureGradient: 0.88,
            goreType: org.goreModality,
            creatureMass: 65,
            distanceToListener: 1.0,
          });
          scene.remove(org.mesh);
          organPickupsRef.current.splice(i, 1);
          continue;
        }

        if (org.age > 35) {
          scene.remove(org.mesh);
          organPickupsRef.current.splice(i, 1);
        }
      }

      // 9. Emit Telemetry to React UI (throttled to 4Hz so React HUD updates never steal frame time from WebGL)
      telemetryTimer += dt;
      if (telemetryTimer >= 0.25) {
        telemetryTimer = 0;
        const snapshots = entitiesRef.current.map((e) => e.getTelemetry());
        const weatherTelemetry = buildBiomeWeatherTelemetry(
          activeWorld,
          weatherSample
        );
        weatherTelemetry.interconnectedness = interconnectedTelemetry;
        weatherTelemetry.structuralTelemetry = structuralTelemetry;
        weatherTelemetry.foreroomsTelemetry = foreroomsResult?.telemetry;
        weatherTelemetry.povFlowTelemetry = noveltyResult?.povFlowTelemetry;
        if (worldspaceBleedRigRef.current) {
          const bRig = worldspaceBleedRigRef.current;
          weatherTelemetry.dimensionalBleedTelemetry = {
            activeBleedModeLabel: bRig.activeBleedModeLabel,
            coalescenceStrength: Number(bRig.coalescenceStrength.toFixed(2)),
            aestheticEvolutionStage: bRig.aestheticEvolutionStage,
            activeBridgesCount: bRig.activeBridgesCount,
            activeSchismShardsCount: bRig.activeSchismShardsCount,
            nearestAnomaly: bRig.nearestAnomalyTelemetry,
          };
        }

        onUpdateTelemetryRef.current(
          snapshots,
          [
            Number(ex.pos.x.toFixed(1)),
            Number(povFlow.smoothVisualY.toFixed(1)),
            Number(ex.pos.z.toFixed(1)),
          ],
          Number(horizSpeed.toFixed(1)),
          weatherTelemetry
        );
        setLiveGraftTelemetry({ ...somaticGraftStateRef.current });
        setDenizenSims([...denizenSimsRef.current]);
        if (livePortalTelemetry) {
          const settlementRig = culturalSettlementRigRef.current;
          setPortalTelemetry({
            ...livePortalTelemetry,
            placedModulesCount: placedRoomModulesRef.current.length,
            effectiveGravityG: currentPortalGravityGRef.current,
            currentFloorElevationM: currentPortalElevationRef.current,
            portalRoomGravityMode: portalRoomGravityModeRef.current,
            activeSettlementTierLabel:
              settlementRig?.urbanizationTier === 'dense-city'
                ? 'Dense City Spire'
                : settlementRig?.urbanizationTier === 'urban-district'
                ? 'Urban Bazaar District'
                : 'Hearth Village',
            activeSettlementGoodsRate: Number(
              (settlementRig?.goodsAndServicesRate ?? 1.0).toFixed(2)
            ),
            urbanNoclipRiskPct:
              settlementRig?.urbanizationTier === 'dense-city'
                ? 4.8
                : settlementRig?.urbanizationTier === 'urban-district'
                ? 1.4
                : 0,
          });
        }
        setFocusedGroundingAnchor(focusedGroundingAnchorRef.current);
        setWeaponCombatState(fpSpringRigRef.current.getCombatState());
        setGrappleRangeTelemetry(grappleHookRigRef.current.getTelemetry());
        setAutonomicSnapshot(autonomicEquationEngine.getSnapshot());
        if (gravityVehicleRigRef.current && onUpdateVehicleTelemetryRef.current) {
          onUpdateVehicleTelemetryRef.current(gravityVehicleRigRef.current.getState());
        }
        if (isLooping) {
          onSyncTemporalLoopStateRef.current(
            currentLoopProgress,
            replayedWCoord
          );
        }
      }

      // 10. Update Photorealistic Post-Processing Pipeline (Calibrated so 3D geometry never washes out)
      const userBloom = Math.min(1.5, gameOptionsRef.current.bloomIntensity ?? 0.85);
      const highWBoost =
        currentW > 0 ? Math.min(0.12, Math.pow(currentW, 1.2) * 0.08 * userBloom) : 0;
      if (bloomPassRef.current) {
        bloomPassRef.current.strength = Math.max(
          0,
          Math.min(0.32, userBloom * 0.18 + highWBoost)
        );
        bloomPassRef.current.radius =
          0.32 + Math.min(0.14, Math.max(0, currentW) * 0.08);
        bloomPassRef.current.threshold = Math.max(
          0.84,
          0.92 - Math.max(0, currentW) * 0.04 - userBloom * 0.02
        );
      }
      if (immersionPipelineRef.current) {
        immersionPipelineRef.current.updateImmersionEffects(
          Math.min(1.0, horizSpeed / 7.5),
          latestImpactRef.current,
          nowSec
        );
        latestImpactRef.current = Math.max(0, latestImpactRef.current - dt * 2.5);
      }
      renderer.toneMappingExposure =
        0.86 + Math.min(0.06, userBloom * 0.03) + Math.min(0.06, Math.max(0, currentW) * 0.04);
      if (composerRef.current) {
        composerRef.current.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvasEl.removeEventListener('webglcontextlost', handleContextLost);
      canvasEl.removeEventListener(
        'webglcontextrestored',
        handleContextRestored
      );
      if (excavationShatterRigRef.current) {
        scene.remove(excavationShatterRigRef.current.getRootGroup());
        excavationShatterRigRef.current.dispose();
      }
      renderer.dispose();
    };
  }, [rebuildWorldEnvironment]);

  // Trigger environment rebuild ONLY when `world.id` changes, and hot-swap avatar skin in-place without popping POV when only skinTopology changes!
  useEffect(() => {
    const povFlow = povFlowStateRef.current;
    if (povFlow.lastBuiltWorldId !== world.id) {
      rebuildWorldEnvironment(world);
      return;
    }
    const nextSkin = world.playableCharacter.skinTopology ?? '';
    if (povFlow.lastSkinTopology !== nextSkin) {
      povFlow.lastSkinTopology = nextSkin;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      if (scene && camera) {
        if (avatarRigRef.current) {
          scene.remove(avatarRigRef.current.root);
        }
        if (fpLeftHandRigRef.current) {
          camera.remove(fpLeftHandRigRef.current);
        }
        if (fpRightHandRigRef.current) {
          camera.remove(fpRightHandRigRef.current);
        }
        const builtAvatar = buildPlayableCharacterMesh(world.playableCharacter);
        avatarRigRef.current = builtAvatar;
        scene.add(builtAvatar.root);

        const fpLeftHand = buildLeftHandVoidBallRig(world.playableCharacter);
        fpLeftHand.position.set(-0.32, -0.21, -0.46);
        fpLeftHand.rotation.set(0.28, 0.32, -0.15);
        fpLeftHandRigRef.current = fpLeftHand;
        camera.add(fpLeftHand);

        const fpRightHand = buildRightHandToolRig(world.playableCharacter);
        fpRightHand.position.set(0.32, -0.23, -0.46);
        fpRightHand.rotation.set(0.24, -0.28, 0.12);
        fpRightHandRigRef.current = fpRightHand;
        camera.add(fpRightHand);
      }
    }
  }, [
    world.id,
    world.playableCharacter.skinTopology,
    world,
    rebuildWorldEnvironment,
  ]);

  // Project / Summon Walk-In 3D Void Ball Sanctuary directly in front of the player when requested (V key or button)
  useEffect(() => {
    if (summonVoidBallCount <= 0) return;
    const voidRig = walkInVoidRigRef.current;
    const ex = explorerStateRef.current;
    if (!voidRig) return;

    const forwardDist = 4.2;
    const targetX = ex.pos.x - Math.sin(ex.yaw) * forwardDist;
    const targetZ = ex.pos.z - Math.cos(ex.yaw) * forwardDist;
    const groundY = evaluateTerrainHeight(
      targetX,
      targetZ,
      worldRef.current,
      excavationsRef.current
    );
    voidRig.portalCenter.set(targetX, groundY, targetZ);
    voidRig.root.position.copy(voidRig.portalCenter);
  }, [summonVoidBallCount]);

  // Process queued entity spawns
  useEffect(() => {
    if (spawnQueue.length === 0) return;
    for (const item of spawnQueue) {
      for (let i = 0; i < item.count; i++) {
        spawnEntityInstance(item.blueprint);
      }
    }
    onConsumeSpawnQueue();
  }, [spawnQueue, spawnEntityInstance, onConsumeSpawnQueue]);

  // Process individual entity ragdoll impulse button
  useEffect(() => {
    if (!impulseTargetEntityId) return;
    const target = entitiesRef.current.find(
      (e) => e.id === impulseTargetEntityId
    );
    if (target) {
      const randomHoriz = new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        12,
        (Math.random() - 0.5) * 20
      );
      target.applyInternalGoreTrauma(
        'calcified-marrow-shatter',
        0.38,
        randomHoriz,
        explorerStateRef.current.pos
      );
      onImpactSpike(0.85);
    }
    onClearImpulseTarget();
  }, [impulseTargetEntityId, onClearImpulseTarget, onImpactSpike]);

  // Process Manifold Snapshot Capture of a Selected Entity
  useEffect(() => {
    if (!snapshotRequestEntityId) return;
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const mainCamera = cameraRef.current;
    if (!scene || !renderer || !mainCamera) {
      onCompleteSnapshotCapture(null);
      return;
    }

    const targetEntity =
      entitiesRef.current.find((e) => e.id === snapshotRequestEntityId) ??
      entitiesRef.current[0];

    if (!targetEntity) {
      onCompleteSnapshotCapture(null);
      return;
    }

    const pelvisPos = targetEntity.particles[0].pos;
    const torsoPos = targetEntity.particles[1].pos;
    const focusPoint = pelvisPos.clone().lerp(torsoPos, 0.55);

    const heading = targetEntity.headingAngle + 0.55;
    const dist = Math.max(2.8, targetEntity.blueprint.limbLength * 2.5);
    const snapCam = new THREE.PerspectiveCamera(
      52,
      mainCamera.aspect,
      0.1,
      220
    );
    const camPos = new THREE.Vector3(
      focusPoint.x + Math.sin(heading) * dist,
      focusPoint.y + 1.15,
      focusPoint.z + Math.cos(heading) * dist
    );
    const groundAtCam = evaluateTerrainHeight(
      camPos.x,
      camPos.z,
      worldRef.current,
      excavationsRef.current
    );
    camPos.y = Math.max(groundAtCam + 0.6, camPos.y);

    snapCam.position.copy(camPos);
    snapCam.lookAt(focusPoint);

    renderer.render(scene, snapCam);
    let imageDataUrl = '';
    try {
      imageDataUrl = renderer.domElement.toDataURL('image/jpeg', 0.82);
    } catch {
      imageDataUrl = '';
    }
    renderer.render(scene, mainCamera);

    const activeWorld = worldRef.current;
    const snapshot: EntityManifoldSnapshot = {
      id: `snap-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: Date.now(),
      entityId: targetEntity.id,
      entityName: targetEntity.blueprint.name,
      blueprint: {
        ...targetEntity.blueprint,
        torsoScale: [...targetEntity.blueprint.torsoScale] as [
          number,
          number,
          number
        ],
      },
      telemetry: targetEntity.getTelemetry(),
      worldName: activeWorld.name,
      worldSeed: activeWorld.seed,
      manifoldCoord: [...activeWorld.manifoldCoord] as [
        number,
        number,
        number,
        number
      ],
      wCoord: wCoordRef.current,
      cameraMode: cameraModeRef.current,
      imageDataUrl,
    };

    onCompleteSnapshotCapture(snapshot);
  }, [snapshotRequestEntityId, onCompleteSnapshotCapture]);

  // Process Radial Shockwave Blast
  useEffect(() => {
    if (shockwaveTriggerCount === 0) return;
    const scene = sceneRef.current;
    const ex = explorerStateRef.current;
    if (!scene) return;

    const ringGeo = new THREE.RingGeometry(0.8, 1.25, 36);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#f43f5e',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.set(ex.pos.x, ex.pos.y + 0.35, ex.pos.z);
    scene.add(ringMesh);
    shockwavesRef.current.push({ mesh: ringMesh, age: 0, maxAge: 0.9 });

    for (const ent of entitiesRef.current) {
      const pelvisPos = ent.particles[0].pos;
      const dir = new THREE.Vector3().subVectors(pelvisPos, ex.pos);
      dir.y = 0;
      const dist = Math.max(1, dir.length());
      dir.normalize();
      const force = Math.max(8, 28 - dist * 0.35);
      ent.applyInternalGoreTrauma(
        'hydrostatic-viscera-rupture',
        0.45,
        dir.multiplyScalar(force).add(new THREE.Vector3(0, 11, 0)),
        ex.pos
      );
    }
    onImpactSpike(1.0);
  }, [shockwaveTriggerCount, onImpactSpike]);

  // Process Reset & Repopulate Entities
  useEffect(() => {
    if (repopulateTriggerCount === 0) return;
    const scene = sceneRef.current;
    if (!scene) return;
    for (const ent of entitiesRef.current) {
      ent.dispose(scene);
    }
    entitiesRef.current = [];
    for (const bp of worldRef.current.entityBlueprints) {
      for (let k = 0; k < 3; k++) {
        spawnEntityInstance(bp);
      }
    }
  }, [repopulateTriggerCount, spawnEntityInstance]);

  // Handle Pointer Lock requests and state changes with cooldown & async rejection guard
  const lastPointerUnlockAtRef = useRef<number>(0);
  const wasPointerLockedRef = useRef<boolean>(false);

  const safelyRequestPointerLock = useCallback(() => {
    const el = containerRef.current;
    if (!el || typeof el.requestPointerLock !== 'function') return;
    if (document.pointerLockElement === el) return;
    // Browser security blocks re-acquiring pointer lock within ~1.25s of user exit
    if (performance.now() - lastPointerUnlockAtRef.current < 1350) return;
    try {
      const maybePromise = el.requestPointerLock() as unknown;
      if (
        maybePromise &&
        typeof (maybePromise as Promise<void>).catch === 'function'
      ) {
        (maybePromise as Promise<void>).catch(() => {
          // Ignore SecurityError when pointer lock is declined or in cooldown
        });
      }
    } catch {
      // Ignore synchronous errors if sandboxed or declined
    }
  }, []);

  useEffect(() => {
    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === containerRef.current;
      if (wasPointerLockedRef.current && !locked) {
        lastPointerUnlockAtRef.current = performance.now();
      }
      wasPointerLockedRef.current = locked;
      setIsPointerLocked(locked);
    };
    const handlePointerLockError = () => {
      lastPointerUnlockAtRef.current = performance.now();
      setIsPointerLocked(false);
    };
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('pointerlockerror', handlePointerLockError);
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('pointerlockerror', handlePointerLockError);
    };
  }, []);

  useEffect(() => {
    if (pointerLockRequestCount === 0) return;
    safelyRequestPointerLock();
  }, [pointerLockRequestCount, safelyRequestPointerLock]);

  // Effortless Free-Look (Without Clicking/Holding) + Pointer-Lock + Click-to-Execute Tool Action
  const dragStartRef = useRef<{ x: number; y: number; moved: boolean }>({
    x: 0,
    y: 0,
    moved: false,
  });

  const applyLookDelta = (dx: number, dy: number) => {
    const opts = gameOptionsRef.current;
    const sens = 0.0048 * opts.lookSensitivity;
    const ex = explorerStateRef.current;
    const povFlow = povFlowStateRef.current;
    // Feed 65% directly and 35% into sub-frame velocity reservoir so gaze flows smoothly without micro-stutter
    const yawDelta = -dx * sens;
    const pitchDelta = opts.invertPitchY ? dy * sens : -dy * sens;
    ex.yaw += yawDelta * 0.65;
    ex.pitch = Math.max(
      -Math.PI * 0.42,
      Math.min(Math.PI * 0.42, ex.pitch + pitchDelta * 0.65)
    );
    povFlow.yawVel += yawDelta * 0.35;
    povFlow.pitchVel += pitchDelta * 0.35;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const opts = gameOptionsRef.current;

    // Right-Click (button 2): Engage Grapple Zip-Reel Winch if Grapple Tool is active or currently tethered; otherwise fire Alt-Fire Ordinance!
    if (e.button === 2) {
      e.preventDefault();
      if (!isOverlayOpenRef.current) {
        if (
          grappleHookRigRef.current.active ||
          activeToolRef.current === 'grapple-hook'
        ) {
          isRightClickZipReelHeldRef.current = true;
          if (!grappleHookRigRef.current.active) {
            handleFireGrappleHook(true);
          }
        } else {
          executeDestructiveWeaponFireRef.current('right-click');
        }
      }
      return;
    }

    if (e.button !== 0) return;

    if (opts.freeLookMode === 'pointer-lock' && !isPointerLocked) {
      safelyRequestPointerLock();
    }

    setIsPointerDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, moved: false };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const opts = gameOptionsRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    const normY = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
    cursorNormRef.current = { x: normX, y: normY, active: true };

    if (isPointerDragging) {
      const movedDist = Math.hypot(
        e.clientX - dragStartRef.current.x,
        e.clientY - dragStartRef.current.y
      );
      if (movedDist > 6) {
        dragStartRef.current.moved = true;
      }
    }

    // Mode 1: Raw Pointer Lock 360° FPS
    if (isPointerLocked) {
      applyLookDelta(e.movementX || 0, e.movementY || 0);
      return;
    }

    // Mode 2: Effortless Hover-Look (Look around freely WITHOUT clicking or holding!)
    if (opts.freeLookMode === 'cursor-gliding' && !isOverlayOpenRef.current) {
      const radialDist = Math.hypot(normX, normY);
      if (lastHoverPointRef.current) {
        const dx =
          e.movementX !== undefined && e.movementX !== 0
            ? e.movementX
            : e.clientX - lastHoverPointRef.current.x;
        const dy =
          e.movementY !== undefined && e.movementY !== 0
            ? e.movementY
            : e.clientY - lastHoverPointRef.current.y;

        if (radialDist >= opts.cursorDeadzone && Math.hypot(dx, dy) < 120) {
          applyLookDelta(dx * 0.88, dy * 0.88);
        }
      }
      lastHoverPointRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Mode 3: Classic Click-and-Hold Drag Orbit
    if (isPointerDragging) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      dragStartRef.current.x = e.clientX;
      dragStartRef.current.y = e.clientY;
      applyLookDelta(dx, dy);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.button === 2) {
      isRightClickZipReelHeldRef.current = false;
      return;
    }
    const opts = gameOptionsRef.current;
    if (
      opts.freeLookMode === 'cursor-gliding' ||
      isPointerLocked ||
      (isPointerDragging && !dragStartRef.current.moved)
    ) {
      executePrimaryToolActionRef.current();
    }
    setIsPointerDragging(false);
  };

  const handlePointerLeave = () => {
    setIsPointerDragging(false);
    isRightClickZipReelHeldRef.current = false;
    cursorNormRef.current.active = false;
    lastHoverPointRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (cameraModeRef.current === 'third-person') {
      const ex = explorerStateRef.current;
      ex.thirdPersonDist = Math.max(
        3.2,
        Math.min(16.0, ex.thirdPersonDist + e.deltaY * 0.006)
      );
    }
  };

  // Retinal Optical Filter CSS mapping
  const retinalFilterCss =
    gameOptions.retinalFilter === 'chromatic-pulse'
      ? 'contrast(1.12) saturate(1.35) hue-rotate(-6deg)'
      : gameOptions.retinalFilter === 'biolum-contrast'
      ? 'contrast(1.24) brightness(1.06) saturate(1.45)'
      : gameOptions.retinalFilter === 'vitreous-crt'
      ? 'contrast(1.15) brightness(0.96) saturate(0.88)'
      : gameOptions.retinalFilter === 'ossuary-sepia'
      ? 'sepia(0.42) contrast(1.12) brightness(0.96)'
      : 'none';

  const toolColor =
    activeTool === 'grapple-hook'
      ? '#38bdf8'
      : activeTool === 'harmonic-tether'
      ? '#22d3ee'
      : activeTool === 'mine-terrain'
      ? '#10b981'
      : activeTool === 'place-building'
      ? '#a855f7'
      : '#f59e0b';

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-[#070b14]"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Three.js Canvas Mount with Retinal Optical Filter */}
      <div
        ref={containerRef}
        style={{ filter: retinalFilterCss }}
        className="w-full h-full cursor-crosshair"
      />

      {/* Vitreous Scanline Overlay when vitreous-crt or chromatic-pulse is active */}
      {(gameOptions.retinalFilter === 'vitreous-crt' ||
        gameOptions.retinalFilter === 'chromatic-pulse') && (
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 3px)',
          }}
        />
      )}

      {/* Center Ocular Reticle Symbology + Grapple Surface Rangefinder Readout */}
      {cameraMode !== 'orbital-director' && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {gameOptions.reticleStyle === 'tesseract-cross' ? (
            <div className="relative flex items-center justify-center w-10 h-10">
              <div
                className="w-2 h-2 rotate-45"
                style={{ backgroundColor: toolColor }}
              />
              <div className="absolute inset-1 border border-white/35 rotate-45" />
              <div className="absolute inset-0 border border-white/20" />
            </div>
          ) : gameOptions.reticleStyle === 'biological-iris' ? (
            <div className="relative flex items-center justify-center w-9 h-9">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: toolColor }}
              />
              <div
                className="absolute inset-0 rounded-full border-2 border-dashed"
                style={{ borderColor: `${toolColor}88` }}
              />
            </div>
          ) : gameOptions.reticleStyle === 'tri-laser' ? (
            <div className="relative flex items-center justify-center w-10 h-10">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: toolColor }}
              />
              <div
                className="absolute top-0 w-0.5 h-2.5"
                style={{ backgroundColor: toolColor }}
              />
              <div
                className="absolute bottom-1 left-1 w-2.5 h-0.5 rotate-30"
                style={{ backgroundColor: toolColor }}
              />
              <div
                className="absolute bottom-1 right-1 w-2.5 h-0.5 -rotate-30"
                style={{ backgroundColor: toolColor }}
              />
            </div>
          ) : (
            <div
              className="w-2 h-2 rounded-full shadow-md"
              style={{ backgroundColor: toolColor }}
            />
          )}

          {/* Live GrappleHookController Surface Distance & Traversal State Readout */}
          {(activeTool === 'grapple-hook' || grappleActive) &&
            grappleRangeTelemetry && (
              <div className="mt-3 px-2.5 py-1 rounded-md bg-slate-950/85 border border-sky-400/40 text-[10px] font-mono tabular-nums text-sky-200 shadow-lg flex items-center gap-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    grappleActive
                      ? 'bg-emerald-400'
                      : grappleRangeTelemetry.inGrappleRange
                      ? 'bg-sky-400'
                      : 'bg-amber-400'
                  }`}
                />
                {grappleActive ? (
                  <span>
                    <strong className="text-emerald-300">
                      {grappleRangeTelemetry.traversalState === 'zip-reel-winch'
                        ? 'ZIP-REEL WINCH'
                        : 'PENDULUM SWING'}
                    </strong>{' '}
                    · {grappleRangeTelemetry.ropeLengthMeters.toFixed(1)}m ·{' '}
                    {grappleRangeTelemetry.currentTensionG.toFixed(1)}G ·{' '}
                    <span className="text-slate-300">
                      [RMB/C] Reel · [Space] Vault
                    </span>
                  </span>
                ) : (
                  <span>
                    <strong className="text-sky-300">
                      {grappleRangeTelemetry.hasSurfaceHit
                        ? `${grappleRangeTelemetry.distanceMeters.toFixed(1)}m`
                        : '>88.0m'}
                    </strong>{' '}
                    · {grappleRangeTelemetry.surfaceLabel} ·{' '}
                    <span className="text-slate-300">
                      [LMB/F] Swing · [RMB] Zip-Reel
                    </span>
                  </span>
                )}
              </div>
            )}
        </div>
      )}

      {/* Ultra-Compact (<3% screen area) Diegetic Voidwalker & Sims HUD */}
      {studioMode === 'none' && (
        <DimensionalDevianceHudAndModals
          voidwalkerConfig={voidwalkerConfig}
          voidBallMode={voidBallMode}
          onChangeVoidBallMode={handleChangeVoidBallMode}
          activeBaseElement={activeBaseElement}
          onSelectBaseElement={handleSelectBaseElement}
          unlockedPerkIds={unlockedPerkIds}
          devianceXP={devianceXP}
          devianceLevel={1 + unlockedPerkIds.length}
          onUnlockPerk={handleUnlockPerk}
          isPerkTreeOpen={isPerkTreeOpen}
          onTogglePerkTree={() => setIsPerkTreeOpen((p) => !p)}
          onOpenOriginModal={() => {
            setStudioMode('character-creation');
            studioModeRef.current = 'character-creation';
          }}
          isStealthCrouching={isStealthCrouching}
          onToggleStealthCrouch={() => {
            setIsStealthCrouching((prev) => {
              const next = !prev;
              isStealthCrouchingRef.current = next;
              return next;
            });
          }}
          heldObjectName={heldObjectName}
          onTriggerGrabOrDrop={handleTriggerGrabOrDrop}
          onTriggerThrowObject={handleTriggerThrowObject}
          lastCombatBanner={lastCombatBanner}
          denizenSims={denizenSims}
          activeQuest={activeQuest}
          epistemologyMap={epistemologyMap}
          onDecodeOrCounterSabotage={handleDecodeOrCounterSabotage}
          onGenerateNextQuest={handleGenerateNextQuest}
          inventory={inventory}
          onCraftRecipe={(rec) => onCraftRecipeFromVoidStationRef.current?.(rec)}
          biodepthConfig={biodepthConfig}
          portalTelemetry={portalTelemetry}
          onOpenBiodepthCrucibleModal={() => {
            setIsCompendiumModalOpen(false);
            setIsPerkTreeOpen(false);
            setIsBiodepthCrucibleModalOpen(true);
          }}
          onEnterOrExitPortalRoomNow={handleEnterOrExitPortalRoomNow}
          onSelectRoomModuleKind={(kind) => {
            if (realityTearPortalRigRef.current) {
              realityTearPortalRigRef.current.activeModuleKind = kind;
            }
            setPortalTelemetry((prev) => ({ ...prev, activeModuleKind: kind }));
          }}
          onPlaceRoomModuleNow={(kind) => handlePlacePortalRoomModule(kind)}
          onInstallCompleteWingLayout={handleInstallCompleteWingLayout}
          onRemoveLastRoomModule={handleRemoveLastPortalRoomModule}
          onChangePortalRoomGravityMode={handleChangePortalRoomGravityMode}
          isAnyModalOpen={
            isOverlayOpen ||
            isBiodepthCrucibleModalOpen ||
            isCompendiumModalOpen ||
            isPerkTreeOpen
          }
        />
      )}

      {/* Biodepth Dimensional Crucible & 36m×36m Square Portal Room Upgrade Modal [Key K] */}
      <BiodepthCrucibleAndPortalRoomModal
        isOpen={isBiodepthCrucibleModalOpen}
        onClose={() => setIsBiodepthCrucibleModalOpen(false)}
        portalTelemetry={portalTelemetry}
        matterInventory={matterInventory}
        baseInventory={inventory}
        unlockedCrucibleRecipeIds={unlockedCrucibleRecipeIds}
        activeBoundaryId={biodepthConfig.activeUniverseBoundary}
        onSelectBoundary={handleSelectUniverseBoundary}
        onUpgradePortalRoomTier={handleUpgradePortalRoomTier}
        onCraftCrucibleRecipe={handleCraftCrucibleRecipe}
        onCraftBaseRecipe={(rec) =>
          onCraftRecipeFromVoidStationRef.current?.(rec)
        }
        onSelectRoomModuleKind={(kind) => {
          if (realityTearPortalRigRef.current) {
            realityTearPortalRigRef.current.activeModuleKind = kind;
          }
          setPortalTelemetry((prev) => ({ ...prev, activeModuleKind: kind }));
        }}
        onPlaceRoomModuleNow={(kind) => handlePlacePortalRoomModule(kind)}
        onInstallCompleteWingLayout={handleInstallCompleteWingLayout}
        onRemoveLastRoomModule={handleRemoveLastPortalRoomModule}
        onChangePortalRoomGravityMode={handleChangePortalRoomGravityMode}
        onTogglePortalOpen={() =>
          handleChangeVoidBallMode(
            voidBallMode === 'walk-in-sanctum-portal'
              ? 'dormant-clenched'
              : 'walk-in-sanctum-portal'
          )
        }
        onEnterOrExitPortalRoomNow={handleEnterOrExitPortalRoomNow}
      />

      {/* Dimensional Grounding Reticle Prompt & First-Person Weapon Loadout / Compendium Bar */}
      {studioMode === 'none' && (
        <DimensionalGroundingAndLoadoutHUD
          compendiumState={compendiumState}
          focusedGroundingAnchor={focusedGroundingAnchor}
          onEquipRightHandItem={handleEquipRightHandItem}
          onInspectActiveWeapon={() => {
            fpSpringRigRef.current.triggerInspectFlourish();
            harmonicSoundscape.triggerChime(2, 0.45);
          }}
          onReloadActiveWeapon={handleReloadActiveWeapon}
          onToggleSheathWeapon={handleToggleSheathWeapon}
          weaponCombatState={weaponCombatState}
          grappledEnemyName={grappledEnemyName}
          onAttuneFocusedGroundingAnchor={handleAttuneFocusedGroundingAnchor}
          onOpenCompendiumModal={() => {
            setIsBiodepthCrucibleModalOpen(false);
            setIsPerkTreeOpen(false);
            setIsTimelineModalOpen(false);
            setIsCompendiumModalOpen(true);
          }}
          hudOpacity={biodepthConfig.hudOpacity}
          isAnyModalOpen={
            isOverlayOpen ||
            isBiodepthCrucibleModalOpen ||
            isCompendiumModalOpen ||
            isPerkTreeOpen ||
            isTimelineModalOpen
          }
        />
      )}

      {/* Infinite Absurd Timelines, Customizable Gate Shapes, Vehicles, Grapple & Body Mods HUD & Modal [Key M / Key N / Key Z / Key F / Key B / Key J] */}
      {studioMode === 'none' && (
        <InfiniteTimelineCompactHUD
          voidState={voidBallEvolutionState}
          onToggleTimelinePortal={handleToggleTimelinePortal}
          onEnterOrExitInBetweenVoidNow={handleEnterOrExitInBetweenVoidNow}
          onFireVoidBeam={handleFireVoidBallActiveBeam}
          onCycleVoidBeamMode={handleCycleVoidBeamMode}
          onQuickJumpRandomTimeline={handleQuickJumpRandomTimeline}
          onOpenTimelineModal={() => {
            setIsBiodepthCrucibleModalOpen(false);
            setIsCompendiumModalOpen(false);
            setIsPerkTreeOpen(false);
            setIsTimelineModalOpen(true);
          }}
          hudOpacity={biodepthConfig.hudOpacity}
          isAnyModalOpen={
            isOverlayOpen ||
            isBiodepthCrucibleModalOpen ||
            isCompendiumModalOpen ||
            isPerkTreeOpen ||
            isTimelineModalOpen
          }
          activeVehicleType={activeVehicleType}
          onCycleVehicleType={handleCycleVehicleType}
          grappleActive={grappleActive}
          grappleAnchorLabel={grappleAnchorLabel}
          grappleRangeTelemetry={grappleRangeTelemetry}
          onFireGrappleHook={() => handleFireGrappleHook(false)}
          equippedBodyMods={equippedBodyMods}
          onTriggerMantisFlurry={handleTriggerBodyModFlurry}
        />
      )}

      <InfiniteTimelineAndVoidBallModal
        isOpen={isTimelineModalOpen}
        onClose={() => setIsTimelineModalOpen(false)}
        voidState={voidBallEvolutionState}
        onDialTimelineCoordinate={handleDialTimelineCoordinate}
        onSelectGateShape={handleSelectGateShape}
        onSelectBeamMode={(mode) => {
          setVoidBallEvolutionState((prev) => {
            const next = { ...prev, activeBeamMode: mode };
            voidBallEvolutionStateRef.current = next;
            return next;
          });
        }}
        onUpgradeBranch={handleUpgradeVoidBallBranch}
        onEnterOrExitInBetweenVoidNow={handleEnterOrExitInBetweenVoidNow}
        activeVehicleType={activeVehicleType}
        onSelectVehicleType={handleSelectVehicleType}
        equippedBodyMods={equippedBodyMods}
        onToggleBodyMod={handleToggleBodyMod}
        onTriggerMantisFlurry={handleTriggerBodyModFlurry}
        onClaimAndEquipProceduralItem={
          handleSynthesizeAndEquipProceduralItem
        }
      />

      {/* 325-Item Bethesda-Scale Compendium, Armory & Portal Room Museum Modal [Key J / Tab] */}
      <BethesdaCompendiumAndLoadoutModal
        isOpen={isCompendiumModalOpen}
        onClose={() => setIsCompendiumModalOpen(false)}
        compendiumState={compendiumState}
        matterInventory={matterInventory}
        onEquipRightHandItem={handleEquipRightHandItem}
        onEquipApparelItem={handleEquipApparelItem}
        onAssignQuickbarSlot={handleAssignQuickbarSlot}
        onToggleMountOnMuseumPlinth={handleToggleMountOnMuseumPlinth}
        onCraftOrSynthesizeItem={handleCraftOrSynthesizeCompendiumItem}
        onBoundaryForgeAffixedVariant={handleBoundaryForgeAffixedVariant}
        onUnlockAllCompendiumItems={handleUnlockAllCompendiumItems}
        onEnterOrExitPortalRoomNow={handleEnterOrExitPortalRoomNow}
        isPlayerInsidePortalRoom={portalTelemetry.isPlayerInsidePortalRoom}
      />

      {/* Unified Carved Relic HUD, [V] Void Ball Menu Dial, POV Switcher & [Shift + V] 3D Mindspace Studio */}
      {studioMode === 'none' && (
        <VoidBallDialAndMindspaceHUD
          config={mindspaceDialConfig}
          onUpdateConfig={(updater) => {
            setMindspaceDialConfig((prev) => {
              const next = updater(prev);
              mindspaceDialConfigRef.current = next;
              return next;
            });
          }}
          dynamicQuickKeys={resolveDynamicQuickKeyBindings({
            dialConfig: mindspaceDialConfig,
            isPortalOpenInWorld: portalTelemetry.isPortalOpenInWorld,
            isInsidePortalRoom: portalTelemetry.isPlayerInsidePortalRoom,
            isInsideMazeDimension: Boolean(
              portalTelemetry.isPlayerInsideMazeDimension
            ),
            isInnerMazePortalOpen: Boolean(
              portalTelemetry.isInnerMazePortalOpen
            ),
            heldObjectName,
            activeElement: activeBaseElement,
            quickbarWeapons: compendiumState.quickbarItemIds.map((id) =>
              resolveCompendiumItemById(id, compendiumState)
            ),
            activeTool: effectiveActiveTool,
          })}
          onTriggerDynamicQuickKey={handleTriggerDynamicQuickKey}
          availableWeapons={[
            ...compendiumState.quickbarItemIds.map((id) =>
              resolveCompendiumItemById(id, compendiumState)
            ),
            ...compendiumState.customForgedItems.filter(
              (i) => i.category === 'weapon' || i.category === 'tool'
            ),
          ]}
          equippedWeaponId={compendiumState.equippedRightHandId}
          onPullWeaponFromVoidBall={handlePullWeaponFromVoidBall}
          activeTool={effectiveActiveTool}
          onPullToolFromVoidBall={handlePullToolFromVoidBall}
          pullAnimState={voidWeaponPullStateRef.current}
          portalTelemetry={portalTelemetry}
          onEnterOrExitPortalRoomNow={handleEnterOrExitPortalRoomNow}
          onToggleSecondaryMazeGate={() => {
            const pRig = realityTearPortalRigRef.current;
            if (pRig?.isPlayerInsidePortalRoom) {
              pRig.isInnerMazePortalOpen = !pRig.isInnerMazePortalOpen;
              harmonicSoundscape.triggerArchitecturalChord(3);
            } else {
              handleEnterOrExitPortalRoomNow();
            }
          }}
          onCycleMazeSelection={handleCycleMazeSelection}
          onSelectRoomModuleKind={(kind) => {
            if (realityTearPortalRigRef.current) {
              realityTearPortalRigRef.current.activeModuleKind = kind;
            }
            setPortalTelemetry((prev) => ({ ...prev, activeModuleKind: kind }));
          }}
          onPlaceRoomModuleNow={(kind) => handlePlacePortalRoomModule(kind)}
          onChangePortalRoomGravityMode={handleChangePortalRoomGravityMode}
          onOpenCrucibleModal={() => {
            setIsCompendiumModalOpen(false);
            setIsPerkTreeOpen(false);
            setIsTimelineModalOpen(false);
            setIsBiodepthCrucibleModalOpen(true);
          }}
          onOpenFullCompendium={() => {
            setIsBiodepthCrucibleModalOpen(false);
            setIsPerkTreeOpen(false);
            setIsTimelineModalOpen(false);
            setIsCompendiumModalOpen(true);
          }}
          onOpenTimelineModal={() => {
            setIsBiodepthCrucibleModalOpen(false);
            setIsCompendiumModalOpen(false);
            setIsPerkTreeOpen(false);
            setIsTimelineModalOpen(true);
          }}
          onTogglePerkTree={() => {
            setIsBiodepthCrucibleModalOpen(false);
            setIsCompendiumModalOpen(false);
            setIsTimelineModalOpen(false);
            setIsPerkTreeOpen((p) => !p);
          }}
          onOpenEquationCodex={() => {
            setIsAutonomicInspectorOpen(true);
          }}
          cameraMode={cameraMode}
          onSetCameraMode={onSetCameraMode}
          onCycleCameraPerspective={onCycleCameraPerspective}
          freeLookMode={gameOptions.freeLookMode}
          onCycleFreeLookMode={onCycleFreeLookMode}
          audioEnabled={audioEnabled}
          onToggleAudio={onToggleAudio}
          weaponCombatState={weaponCombatState}
          grappledEnemyName={grappledEnemyName}
          onReloadActiveWeapon={handleReloadActiveWeapon}
          onToggleSheathWeapon={handleToggleSheathWeapon}
          onInspectActiveWeapon={() => {
            fpSpringRigRef.current.triggerInspectFlourish();
            harmonicSoundscape.triggerChime(2, 0.45);
          }}
          lastCombatBanner={lastCombatBanner ?? undefined}
        />
      )}

      {/* Secondary Inner Portal Room Maze Selector & In-Maze Tech Equipment / Entity Control HUD */}
      {studioMode === 'none' &&
        !isOverlayOpen &&
        !mindspaceDialConfig.isMindspaceOpen &&
        !mindspaceDialConfig.hidePortalRoomBanners &&
        ((portalTelemetry.isPlayerInsidePortalRoom &&
          portalTelemetry.isInnerMazePortalOpen) ||
          portalTelemetry.isPlayerInsideMazeDimension) &&
        portalTelemetry.selectedMazeCode && (
          <div className="pointer-events-auto absolute top-22 left-1/2 -translate-x-1/2 z-20 w-[min(94vw,640px)] rounded-sm bg-[#0b0a09]/95 border border-amber-700/55 px-3.5 py-2.5 shadow-2xl text-xs text-amber-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-sm bg-amber-500/20 border border-amber-500/50 font-mono font-bold text-amber-300">
                  {portalTelemetry.selectedMazeCode}
                </span>
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{portalTelemetry.selectedMazeTitle}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({(portalTelemetry.selectedMazeIndex ?? 0) + 1} /{' '}
                      {portalTelemetry.knownMazesCount ?? 100})
                    </span>
                  </div>
                  <div className="text-[10px] text-cyan-200/90">
                    {portalTelemetry.selectedMazeThemeTitle} · Entity:{' '}
                    <strong className="text-amber-300">
                      {portalTelemetry.selectedMazeEntityTitle}
                    </strong>{' '}
                    (Control:{' '}
                    {Math.round(portalTelemetry.selectedMazeEntityControlPct ?? 0)}
                    %)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {portalTelemetry.isPlayerInsidePortalRoom && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const pRig = realityTearPortalRigRef.current;
                        if (!pRig) return;
                        const total = pRig.knownMazes.length;
                        pRig.selectedMazeIndex =
                          (pRig.selectedMazeIndex - 1 + total) % total;
                        const nextM = pRig.knownMazes[pRig.selectedMazeIndex];
                        pRig.mazeDimensionRig.rebuildMazeGeometryForSpec(nextM);
                        harmonicSoundscape.triggerChime(2, 0.45);
                      }}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[11px] font-semibold"
                    >
                      ← Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const pRig = realityTearPortalRigRef.current;
                        if (!pRig) return;
                        const total = pRig.knownMazes.length;
                        pRig.selectedMazeIndex =
                          (pRig.selectedMazeIndex + 1) % total;
                        const nextM = pRig.knownMazes[pRig.selectedMazeIndex];
                        pRig.mazeDimensionRig.rebuildMazeGeometryForSpec(nextM);
                        harmonicSoundscape.triggerChime(4, 0.45);
                      }}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[11px] font-semibold"
                    >
                      Next →
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const pRig = realityTearPortalRigRef.current;
                    const ex = explorerStateRef.current;
                    if (!pRig) return;
                    if (!pRig.isPlayerInsideMazeDimension) {
                      const selM = pRig.knownMazes[pRig.selectedMazeIndex];
                      pRig.mazeDimensionRig.rebuildMazeGeometryForSpec(selM);
                      pRig.isPlayerInsidePortalRoom = false;
                      pRig.isPlayerInsideMazeDimension = true;
                      pRig.portalTeleportCooldown = 1.2;
                      ex.pos.set(
                        MAZE_DIMENSION_ORIGIN.x,
                        MAZE_DIMENSION_ORIGIN.y,
                        MAZE_DIMENSION_ORIGIN.z + 19.0
                      );
                      ex.vel.set(0, 0, 0);
                      ex.yaw = 0;
                      povFlowStateRef.current.smoothVisualY =
                        MAZE_DIMENSION_ORIGIN.y;
                    } else {
                      pRig.isPlayerInsideMazeDimension = false;
                      pRig.isPlayerInsidePortalRoom = true;
                      pRig.portalTeleportCooldown = 1.2;
                      ex.pos.set(
                        PORTAL_ROOM_ORIGIN.x + 6.8,
                        PORTAL_ROOM_ORIGIN.y,
                        PORTAL_ROOM_ORIGIN.z + 12.2
                      );
                      ex.vel.set(0, 0, 0);
                      ex.yaw = 0;
                      povFlowStateRef.current.smoothVisualY =
                        PORTAL_ROOM_ORIGIN.y;
                    }
                    harmonicSoundscape.triggerArchitecturalChord(3);
                  }}
                  className="px-2.5 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px]"
                >
                  {portalTelemetry.isPlayerInsideMazeDimension
                    ? '⇪ Exit Maze to Portal Room [V]'
                    : '🌀 Step Into Selected Maze'}
                </button>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
              <div className="rounded bg-slate-900/90 border border-slate-800 px-2 py-1">
                <div className="text-slate-400 flex justify-between">
                  <span>Portal Assimilation</span>
                  <span className="font-mono text-emerald-300">
                    {Math.round(portalTelemetry.selectedMazeAssimilationPct ?? 0)}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        portalTelemetry.selectedMazeAssimilationPct ?? 0
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="rounded bg-slate-900/90 border border-slate-800 px-2 py-1 flex items-center justify-between">
                <span className="text-slate-400">Remaining Loot</span>
                <span className="font-mono font-bold text-amber-300">
                  {portalTelemetry.selectedMazeLootCount ?? 0} Caches
                </span>
              </div>

              <div className="rounded bg-slate-900/90 border border-slate-800 px-2 py-1 flex items-center justify-between">
                <span className="text-slate-400">Deployed Tech</span>
                <span className="font-mono font-bold text-sky-300">
                  {portalTelemetry.placedMazeTechCount ?? 0} Units
                </span>
              </div>
            </div>

            {portalTelemetry.isPlayerInsideMazeDimension && (
              <div className="mt-2 pt-1.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                <span className="text-slate-300">
                  Active Tech:{' '}
                  <strong className="text-sky-300">
                    {
                      MAZE_TECH_EQUIPMENT_CATALOG[
                        portalTelemetry.activeMazeTechKind ??
                          'surveillance-camera-rig'
                      ].name
                    }
                  </strong>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const pRig = realityTearPortalRigRef.current;
                      if (!pRig) return;
                      const nextK =
                        pRig.mazeDimensionRig.cycleActiveTechEquipmentKind();
                      setLastCombatBanner(
                        `📹 Cycled Tech Equipment: ${MAZE_TECH_EQUIPMENT_CATALOG[nextK].name}`
                      );
                    }}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200"
                  >
                    Cycle Tech [X]
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const pRig = realityTearPortalRigRef.current;
                      const ex = explorerStateRef.current;
                      if (!pRig) return;
                      const res =
                        pRig.mazeDimensionRig.deployTechEquipmentInActiveMaze(
                          ex.pos,
                          ex.yaw
                        );
                      if (res.siphonedMatterId && res.siphonedAmount) {
                        const mId = res.siphonedMatterId;
                        const amt = res.siphonedAmount;
                        setMatterInventory((prev) => ({
                          ...prev,
                          [mId]: (prev[mId] ?? 0) + amt,
                        }));
                      }
                      pRig.knownMazes[pRig.selectedMazeIndex] = {
                        ...res.updatedSpec,
                      };
                      const eqSpec =
                        MAZE_TECH_EQUIPMENT_CATALOG[res.placedItem.kind];
                      setLastCombatBanner(
                        `📹 Deployed ${eqSpec.name} in ${res.updatedSpec.code}! Assimilation: ${Math.round(
                          res.updatedSpec.assimilationPct
                        )}%`
                      );
                      harmonicSoundscape.triggerArchitecturalChord(4);
                    }}
                    className="px-2.5 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                  >
                    Deploy Tech Here [B]
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      <AutonomicEquationCodexAndTelemetryModal
        isOpen={isAutonomicInspectorOpen}
        onClose={() => setIsAutonomicInspectorOpen(false)}
        snapshot={autonomicSnapshot}
        onToggleOperator={(id: NonlinearOperatorId) => {
          autonomicEquationEngine.toggleOperator(id);
          setAutonomicSnapshot(autonomicEquationEngine.getSnapshot());
          deformTerrainGeometry(worldRef.current, excavationsRef.current);
        }}
        onChangeOperatorWeight={(id: NonlinearOperatorId, weight: number) => {
          autonomicEquationEngine.setOperatorCouplingWeight(id, weight);
          setAutonomicSnapshot(autonomicEquationEngine.getSnapshot());
        }}
        onUpdateTuning={(patch: Partial<AutonomicSelfTuningParameters>) => {
          autonomicEquationEngine.updateTuning(patch);
          setAutonomicSnapshot(autonomicEquationEngine.getSnapshot());
        }}
        onSynthesizeDiscoveryNow={(kind: GameplayDiscoveryTriggerKind) => {
          const rec = autonomicEquationEngine.recordGameplayEquationDiscovery(
            kind,
            1.5,
            true
          );
          setAutonomicSnapshot(autonomicEquationEngine.getSnapshot());
          deformTerrainGeometry(worldRef.current, excavationsRef.current);
          if (rec) {
            setLastCombatBanner(
              `📐 Synthesized Gen-${rec.generationTier} Equation: ${rec.mutationTitle} (${rec.synthesizedTermSymbol})`
            );
          }
          harmonicSoundscape.triggerArchitecturalChord(3);
        }}
        onResculptTerrainWithEvolvedEquations={() => {
          deformTerrainGeometry(worldRef.current, excavationsRef.current);
          instancedScatterRigRef.current.populateForWorld({
            seed: worldRef.current.seed,
            lowHex: worldRef.current.palette.terrainLow,
            midHex: worldRef.current.palette.terrainMid,
            accentHex: worldRef.current.palette.accentColor,
            evalHeight: (x, z) =>
              evaluateTerrainHeight(
                x,
                z,
                worldRef.current,
                excavationsRef.current
              ),
          });
          setLastCombatBanner(
            `⛰️ Re-sculpted 3D Terrain & Instanced Monuments with ${autonomicSnapshot.fieldState.generationTitle}!`
          );
          harmonicSoundscape.triggerArchitecturalChord(4);
        }}
        onResetDefaults={() => {
          autonomicEquationEngine.resetToBaselineDefaults();
          setAutonomicSnapshot(autonomicEquationEngine.getSnapshot());
          deformTerrainGeometry(worldRef.current, excavationsRef.current);
        }}
      />

      {/* Live 3D In-Engine Voidwalker Character Creation Studio & 3-Act 3D Animated Trauma Cutscene */}
      {studioMode !== 'none' && (
        <VoidwalkerOriginAndCutsceneModal
          config={voidwalkerConfig}
          studioMode={studioMode}
          studioPose={studioPose}
          studioTurntableYaw={studioTurntableYaw}
          cutsceneElapsedSec={cutsceneElapsedSec}
          onUpdateConfig={(nextCfg) => {
            const prevCfg = voidwalkerConfigRef.current;
            setVoidwalkerConfig(nextCfg);
            voidwalkerConfigRef.current = nextCfg;
            setActiveBaseElement(nextCfg.primaryBaseElement);
            activeBaseElementRef.current = nextCfg.primaryBaseElement;

            // Live 3D Mesh Hot-Swap whenever Body Archetype, Skin Topology, or Void Seed changes!
            if (
              prevCfg.bodyArchetype !== nextCfg.bodyArchetype ||
              prevCfg.skinTopology !== nextCfg.skinTopology ||
              prevCfg.voidSeedId !== nextCfg.voidSeedId
            ) {
              const seedSpec = VOID_SEED_ORIGINS[nextCfg.voidSeedId];
              const charSpec = worldRef.current.playableCharacter;
              charSpec.name = nextCfg.walkerName;
              charSpec.bodyArchetype = nextCfg.bodyArchetype;
              charSpec.skinTopology = nextCfg.skinTopology;
              charSpec.heightScale = nextCfg.heightScale;
              charSpec.voidOrbColor = seedSpec.coreColor;
              charSpec.visorOrOrganColor = seedSpec.rimColor;

              const scene = sceneRef.current;
              if (scene && avatarRigRef.current) {
                scene.remove(avatarRigRef.current.root);
                const builtAvatar = buildPlayableCharacterMesh(charSpec);
                avatarRigRef.current = builtAvatar;
                scene.add(builtAvatar.root);
                handleEquipRightHandItem(
                  compendiumStateRef.current.equippedRightHandId
                );
              }
            }
          }}
          onChangePose={(pose) => {
            setStudioPose(pose);
            studioPoseRef.current = pose;
          }}
          onChangeTurntableYaw={(yaw) => {
            setStudioTurntableYaw(yaw);
            studioTurntableYawRef.current = yaw;
          }}
          onStart3DCutscene={() => {
            setCutsceneElapsedSec(0);
            cutsceneElapsedSecRef.current = 0;
            setStudioMode('trauma-cutscene');
            studioModeRef.current = 'trauma-cutscene';
            harmonicSoundscape.triggerArchitecturalChord(2);
          }}
          onCompleteOriginSpawn={handleCompleteOriginSpawn}
        />
      )}

      {/* WebGL Context Lost Fallback Safety */}
      {webglLost && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6">
          <div className="max-w-md text-center space-y-3">
            <h2 className="text-lg font-bold font-display text-white">
              3D Manifold Viewport Suspended
            </h2>
            <p className="text-xs text-slate-300">
              WebGL rendering context was interrupted. Click below to restore the
              current manifold sector ({world.name}).
            </p>
            <button
              onClick={() => {
                setWebglLost(false);
                rebuildWorldEnvironment(world);
              }}
              className="px-4 py-2 bg-amber-500 text-slate-950 font-semibold text-xs rounded-lg"
            >
              Restore 3D Viewport
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
