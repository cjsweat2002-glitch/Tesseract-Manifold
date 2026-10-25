/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BiocomplexInterstitialOrigin,
  BiomeWeatherTelemetry,
  BuildingPresetBlueprint,
  CameraPerspective,
  ConceptualNoveltySeedId,
  ContinuumNovelEvent,
  CraftingRecipe,
  DamageGoreModality,
  DimensionalGoreGenre,
  Edge4D,
  EntityBlueprint,
  EntityManifoldSnapshot,
  EntityMorphology,
  EntityRuntimeTelemetry,
  EvolutionaryLineageRecord,
  FavoritedManifoldAnchor,
  ForeroomsDispositionLocus,
  FrontierComplexSite,
  GameOptionsConfig,
  GeometryCarvingStyle,
  ManifoldGameVersionLog,
  ManifoldWorldSpec,
  Node4D,
  PlacedWorldBuilding,
  PlayerInteractionTool,
  ResourceId,
  SkinTopologyStyle,
  TerrainExcavationSpot,
  WorldCaveNestComplex,
  WorldFertilizedFloraPatch,
  WorldspaceArtformArchetype,
  WorldspaceProceduralArtform,
  WorldTopologyArchetype,
} from './types/manifold';
import { synthesizeLSystemGrammarSpec } from './utils/lSystemArtformEngine';
import {
  DEFAULT_BUILDING_PRESETS,
  generateEntityBlueprintForWorld,
  generateGameVersionNaming,
  generateManifoldWorld,
  resolveWorldWeather,
  RESOURCE_CATALOG,
} from './utils/manifoldGenerator';
import {
  evaluate4DNodeGraph,
  INITIAL_4D_EDGES,
  INITIAL_4D_NODES,
  NodeGraphPreset,
} from './utils/node4dSystem';
import {
  generateFrontierComplexAtEdge,
  mutateEntityGenomeAndBlueprint,
  resolveDimensionalGoreGenre,
  synthesizeInitialEntityDNA,
} from './utils/evolutionaryEcologyEngine';
import { ManifoldSandboxViewport } from './components/ManifoldSandboxViewport';
import { Node4DGraphPanel } from './components/Node4DGraphPanel';
import { ManifoldSynthesizerDrawer } from './components/ManifoldSynthesizerDrawer';
import { VoidBallSanctuaryModal } from './components/VoidBallSanctuaryModal';
import { OpticCalibrationMenuModal } from './components/OpticCalibrationMenuModal';
import { EvolutionaryModMenuModal } from './components/EvolutionaryModMenuModal';
import { ShapeshiftText } from './components/ShapeshiftText';
import { InterconnectednessWebOverlay } from './components/InterconnectednessWebOverlay';
import { InterdimensionalAssayHUD } from './components/InterdimensionalAssayHUD';
import { GravityVehicleFlightHUD } from './components/GravityVehicleFlightHUD';
import { GravityVehicleState } from './types/manifold';
import { resolveCosmologyForDimension } from './utils/celestialCosmologyEngine';
import {
  ALL_CONCEPTUAL_NOVELTY_SEEDS,
  CONCEPTUAL_NOVELTY_SEED_CATALOG,
} from './utils/conceptualNoveltyEngine';
import { harmonicSoundscape } from './utils/harmonicSoundscapeEngine';
import {
  BiodepthUiAndGraphicsConfig,
  DEFAULT_BIODEPTH_UI_GRAPHICS_CONFIG,
  formatKeyCodeLabel,
} from './types/portalAndBiodepth';
import { BiodepthInteractiveCanvasBackground } from './components/BiodepthMenuArt';
import { Volume2, VolumeX, X } from 'lucide-react';

type ActiveOverlayPanel =
  | 'none'
  | 'node-4d'
  | 'synthesizer-worlds'
  | 'synthesizer-entities'
  | 'void-hand-inventory'
  | 'void-inner-sanctuary'
  | 'somatic-options'
  | 'evolutionary-mod-menu';

const SNAPSHOT_STORAGE_KEY = 'tesseract_manifold_entity_snapshots_v1';
const VERSIONS_STORAGE_KEY = 'tesseract_manifold_game_versions_v2';
const FAVORITED_MANIFOLDS_STORAGE_KEY = 'tesseract_manifold_favorited_anchors_v1';
const PRESETS_STORAGE_KEY = 'tesseract_manifold_building_presets_v1';
const OPTIONS_STORAGE_KEY = 'tesseract_manifold_somatic_options_v3';
const BIODEPTH_CONFIG_STORAGE_KEY = 'tesseract_manifold_biodepth_config_v1';
const LINEAGE_STORAGE_KEY = 'tesseract_manifold_evolutionary_lineage_v1';

const DEFAULT_GAME_OPTIONS: GameOptionsConfig = {
  freeLookMode: 'cursor-gliding',
  lookSensitivity: 1.25,
  invertPitchY: false,
  cursorDeadzone: 0.04,
  cameraRollIntensity: 1.0,
  fovWarpIntensity: 1.0,
  retinalFilter: 'none',
  hudOpacity: 0.92,
  reticleStyle: 'tesseract-cross',
  showWorldWireframe: false,
  fogMultiplier: 1.0,
  bloomIntensity: 0.85,
  gifTypographyStyle: 'calm-static',
  gifFrameRateFps: 4,
  gifChromaticSplit: false,
  gifSkewMorph: false,
};

function createInitialMonumentalBuildings(
  world: ManifoldWorldSpec
): PlacedWorldBuilding[] {
  const presets = DEFAULT_BUILDING_PRESETS;
  const p0 = presets[0]; // Kurokawa Metabolist Capsule Spire
  const p1 = presets[1]; // Schoen TPMS Gyroid Sanctuary
  const p3 = presets[3]; // Jansen-Choe Kinetic Rib Foundry

  const coords: {
    preset: BuildingPresetBlueprint;
    x: number;
    z: number;
    rot: number;
  }[] = [
    { preset: p0, x: -16, z: -14, rot: 0.45 },
    { preset: p1, x: 18, z: -12, rot: -0.62 },
    { preset: p3, x: -14, z: 16, rot: 1.15 },
  ];

  return coords
    .filter((c) => Boolean(c.preset))
    .map((c, idx) => ({
      id: `bldg-seed-monument-${idx}`,
      presetId: c.preset.id,
      presetName: c.preset.name,
      x: c.x,
      y: 0,
      z: c.z,
      rotationY: c.rot,
      blocks: c.preset.blocks,
      paradigm: c.preset.paradigm,
    }));
}

function createInitialOriginalSeedVersion(): ManifoldGameVersionLog {
  const originalWorld = generateManifoldWorld(408291, 'non-euclidean-spires');
  const naming = generateGameVersionNaming(originalWorld, 0, true);
  return {
    id: 'version-seed-000-original',
    versionCode: naming.versionCode,
    gameTitle: naming.gameTitle,
    fontFamily: naming.fontFamily,
    meaningAndLore: naming.meaningAndLore,
    world: originalWorld,
    excavations: [],
    placedBuildings: createInitialMonumentalBuildings(originalWorld),
    wCoord: 0.0,
    savedAt: Date.now(),
    isOriginalSeed: true,
  };
}

export default function App() {
  // 1. Safe-Logged Manifold Game Versions Archive (Anchored by SEED-000 Original Seed)
  const [gameVersionArchive, setGameVersionArchive] = useState<
    ManifoldGameVersionLog[]
  >(() => {
    const seed000 = createInitialOriginalSeedVersion();
    try {
      const raw = window.localStorage.getItem(VERSIONS_STORAGE_KEY);
      if (!raw) return [seed000];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasOriginal = parsed.some((v) => v.isOriginalSeed);
        return hasOriginal ? parsed : [...parsed, seed000];
      }
      return [seed000];
    } catch {
      return [seed000];
    }
  });

  const [activeVersionId, setActiveVersionId] = useState<string>(
    () => gameVersionArchive[0].id
  );
  const [currentWorld, setCurrentWorld] = useState<ManifoldWorldSpec>(
    () => gameVersionArchive[0].world
  );
  const [excavations, setExcavations] = useState<TerrainExcavationSpot[]>(
    () => gameVersionArchive[0].excavations ?? []
  );
  const [placedBuildings, setPlacedBuildings] = useState<PlacedWorldBuilding[]>(
    () => {
      const saved = gameVersionArchive[0].placedBuildings ?? [];
      return saved.length > 0
        ? saved
        : createInitialMonumentalBuildings(gameVersionArchive[0].world);
    }
  );

  const activeGameVersion =
    gameVersionArchive.find((v) => v.id === activeVersionId) ??
    gameVersionArchive[0];

  // Persist Safe-Logged Game Versions to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(
        VERSIONS_STORAGE_KEY,
        JSON.stringify(gameVersionArchive.slice(0, 18))
      );
    } catch {
      // Ignore quota errors
    }
  }, [gameVersionArchive]);

  // 1B. Favorited Manifolds (Manifold Anchors) Persisted in localStorage
  const [favoritedManifolds, setFavoritedManifolds] = useState<
    FavoritedManifoldAnchor[]
  >(() => {
    try {
      const raw = window.localStorage.getItem(FAVORITED_MANIFOLDS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(
        FAVORITED_MANIFOLDS_STORAGE_KEY,
        JSON.stringify(favoritedManifolds.slice(0, 32))
      );
    } catch {
      // Ignore quota errors
    }
  }, [favoritedManifolds]);

  // 2. Camera Perspective & Active Interaction Tool ('harmonic-tether' | 'kinetic-impulse' | 'mine-terrain' | 'place-building')
  const [cameraMode, setCameraMode] =
    useState<CameraPerspective>('third-person');
  const [activeTool, setActiveTool] =
    useState<PlayerInteractionTool>('harmonic-tether');
  const [activeNoveltySeedId, setActiveNoveltySeedId] =
    useState<ConceptualNoveltySeedId>('grunge-typography-graffiti-dirt');

  // 3. Left-Hand Void Ball Inventory, Crafting & Pocket Void Building Presets
  const [inventory, setInventory] = useState<Record<ResourceId, number>>({
    'ferro-chitin': 4,
    'biolum-mycelium': 3,
    'calcified-memory': 3,
    'vitreous-aether': 3,
    'void-singularity-dust': 2,
  });
  const [biologicalJumpBoost, setBiologicalJumpBoost] = useState<number>(1.0);

  const [buildingPresets, setBuildingPresets] = useState<
    BuildingPresetBlueprint[]
  >(() => {
    try {
      const raw = window.localStorage.getItem(PRESETS_STORAGE_KEY);
      if (!raw) return DEFAULT_BUILDING_PRESETS;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((p: BuildingPresetBlueprint) => p.id));
        const missingDefaults = DEFAULT_BUILDING_PRESETS.filter(
          (d) => !existingIds.has(d.id)
        );
        return [...missingDefaults, ...parsed];
      }
      return DEFAULT_BUILDING_PRESETS;
    } catch {
      return DEFAULT_BUILDING_PRESETS;
    }
  });
  const [activePresetId, setActivePresetId] = useState<string>(
    () => buildingPresets[0]?.id ?? DEFAULT_BUILDING_PRESETS[0].id
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(
        PRESETS_STORAGE_KEY,
        JSON.stringify(buildingPresets)
      );
    } catch {
      // Ignore quota errors
    }
  }, [buildingPresets]);

  const activeBuildingPreset =
    buildingPresets.find((p) => p.id === activePresetId) ??
    buildingPresets[0] ??
    DEFAULT_BUILDING_PRESETS[0];

  // 4. 4D Spatiotemporal Node Graph State
  const [nodes4D, setNodes4D] = useState<Node4D[]>(INITIAL_4D_NODES);
  const [edges4D, setEdges4D] = useState<Edge4D[]>(INITIAL_4D_EDGES);
  const [wCoord, setWCoord] = useState<number>(0.0);
  const [autoOscillateW, setAutoOscillateW] = useState<boolean>(false);
  const [impactShockLevel, setImpactShockLevel] = useState<number>(0);
  const [globalRagdollActive, setGlobalRagdollActive] =
    useState<boolean>(false);
  const [temporalLoopActive, setTemporalLoopActive] = useState<boolean>(false);
  const [temporalLoopProgress, setTemporalLoopProgress] = useState<number>(0);
  const [dimIndex, setDimIndex] = useState<number>(1.0);
  const [isAssayHUDOpen, setIsAssayHUDOpen] = useState<boolean>(false);
  const [isVehicleHUDOpen, setIsVehicleHUDOpen] = useState<boolean>(false);
  const [vehicleTelemetry, setVehicleTelemetry] = useState<GravityVehicleState | null>(null);

  const handleDimensionChange = useCallback((newDim: number) => {
    setDimIndex(newDim);
    setWCoord(Number(((newDim - 1) / 5.5 - 1).toFixed(2)));
  }, []);

  const handleShiftRandomDimension = useCallback(() => {
    setDimIndex((prevDim) => {
      const curInt = Math.round(prevDim);
      const jump = 1 + Math.floor(Math.random() * 10);
      const nextInt = ((curInt - 1 + jump) % 12) + 1;
      const nextDim = Number((nextInt + (Math.random() - 0.5) * 0.18).toFixed(2));
      const clampedDim = Math.max(1.0, Math.min(12.0, nextDim));
      setWCoord(Number(((clampedDim - 1) / 5.5 - 1).toFixed(2)));
      return clampedDim;
    });
  }, []);

  // Keep active game version's excavations, placedBuildings, and wCoord synced in archive & favorited anchors
  useEffect(() => {
    setGameVersionArchive((prev) =>
      prev.map((ver) =>
        ver.id === activeVersionId
          ? {
              ...ver,
              world: currentWorld,
              excavations,
              placedBuildings,
              wCoord,
            }
          : ver
      )
    );
    setFavoritedManifolds((prev) =>
      prev.map((anchor) =>
        anchor.seed === currentWorld.seed
          ? {
              ...anchor,
              versionLog: {
                ...anchor.versionLog,
                world: currentWorld,
                excavations,
                placedBuildings,
                wCoord,
              },
            }
          : anchor
      )
    );
  }, [activeVersionId, currentWorld, excavations, placedBuildings, wCoord]);

  const [behaviorEval, setBehaviorEval] = useState(() =>
    evaluate4DNodeGraph(INITIAL_4D_NODES, INITIAL_4D_EDGES, 0.0, 0, 0).output
  );

  // 5. UI Overlay Panel & Somatic / Optic Calibration Options State
  const [activeOverlay, setActiveOverlay] =
    useState<ActiveOverlayPanel>('none');
  const [pointerLockRequestCount, setPointerLockRequestCount] =
    useState<number>(0);

  const [gameOptions, setGameOptions] = useState<GameOptionsConfig>(() => {
    try {
      const raw = window.localStorage.getItem(OPTIONS_STORAGE_KEY);
      if (!raw) return DEFAULT_GAME_OPTIONS;
      return { ...DEFAULT_GAME_OPTIONS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_GAME_OPTIONS;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(
        OPTIONS_STORAGE_KEY,
        JSON.stringify(gameOptions)
      );
    } catch {
      // Ignore quota errors
    }
  }, [gameOptions]);

  const [biodepthConfig, setBiodepthConfig] =
    useState<BiodepthUiAndGraphicsConfig>(() => {
      try {
        const raw = window.localStorage.getItem(BIODEPTH_CONFIG_STORAGE_KEY);
        if (!raw) return DEFAULT_BIODEPTH_UI_GRAPHICS_CONFIG;
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_BIODEPTH_UI_GRAPHICS_CONFIG,
          ...parsed,
          keybinds: {
            ...DEFAULT_BIODEPTH_UI_GRAPHICS_CONFIG.keybinds,
            ...(parsed.keybinds ?? {}),
          },
        };
      } catch {
        return DEFAULT_BIODEPTH_UI_GRAPHICS_CONFIG;
      }
    });

  useEffect(() => {
    try {
      window.localStorage.setItem(
        BIODEPTH_CONFIG_STORAGE_KEY,
        JSON.stringify(biodepthConfig)
      );
    } catch {
      // Ignore quota errors
    }
  }, [biodepthConfig]);

  const isVoidBallOpen =
    activeOverlay === 'void-hand-inventory' ||
    activeOverlay === 'void-inner-sanctuary';

  // Keyboard shortcuts respecting customizable Quick-Keys
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }
      if (e.code === 'Escape') {
        setActiveOverlay('none');
      } else if (e.code === 'F5' || e.code === 'Backquote') {
        e.preventDefault();
        setCameraMode((prev) =>
          prev === 'third-person'
            ? 'first-person'
            : prev === 'first-person'
            ? 'orbital-director'
            : 'third-person'
        );
      } else if (e.code === 'KeyO') {
        setActiveOverlay((prev) =>
          prev === 'somatic-options' ? 'none' : 'somatic-options'
        );
      } else if (e.code === 'KeyL') {
        setActiveOverlay((prev) =>
          prev === 'synthesizer-entities' ? 'none' : 'synthesizer-entities'
        );
      } else if (e.code === 'KeyM' && e.shiftKey) {
        setActiveOverlay((prev) =>
          prev === 'evolutionary-mod-menu' ? 'none' : 'evolutionary-mod-menu'
        );
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // 6. Entity Spawning, Selection, Snapshot History & Ragdoll Impulse Triggers
  const [spawnQueue, setSpawnQueue] = useState<
    { blueprint: EntityBlueprint; count: number }[]
  >([]);
  const [impulseTargetEntityId, setImpulseTargetEntityId] = useState<
    string | null
  >(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [snapshotRequestEntityId, setSnapshotRequestEntityId] = useState<
    string | null
  >(null);
  const [entitySnapshots, setEntitySnapshots] = useState<
    EntityManifoldSnapshot[]
  >(() => {
    try {
      const raw = window.localStorage.getItem(SNAPSHOT_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [shockwaveTriggerCount, setShockwaveTriggerCount] = useState<number>(0);
  const [repopulateTriggerCount, setRepopulateTriggerCount] =
    useState<number>(0);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        SNAPSHOT_STORAGE_KEY,
        JSON.stringify(entitySnapshots.slice(0, 24))
      );
    } catch {
      try {
        window.localStorage.setItem(
          SNAPSHOT_STORAGE_KEY,
          JSON.stringify(entitySnapshots.slice(0, 10))
        );
      } catch {
        // Ignore
      }
    }
  }, [entitySnapshots]);

  // 7. Live Telemetry from 3D Sandbox
  const [entityTelemetry, setEntityTelemetry] = useState<
    EntityRuntimeTelemetry[]
  >([]);
  const [explorerCoords, setExplorerCoords] = useState<[number, number, number]>([
    0, 4, 14,
  ]);
  const [explorerSpeed, setExplorerSpeed] = useState<number>(0);
  const [weatherTelemetry, setWeatherTelemetry] =
    useState<BiomeWeatherTelemetry | null>(null);
  const activeWeatherSpec = resolveWorldWeather(currentWorld);

  // Continuous 4D Node Graph evaluation loop (12Hz, including Spring-Damper transitions when globalRagdollActive is true)
  useEffect(() => {
    const startTime = performance.now();
    const interval = setInterval(() => {
      const elapsedSec = (performance.now() - startTime) / 1000;

      setWCoord((prevW) => {
        const nextW = autoOscillateW
          ? Number((Math.sin(elapsedSec * 0.65) * 0.88).toFixed(2))
          : prevW;

        setImpactShockLevel((prevShock) => {
          const decayedShock = prevShock * 0.82;
          setNodes4D((prevNodes) => {
            const { updatedNodes, output } = evaluate4DNodeGraph(
              prevNodes,
              edges4D,
              nextW,
              elapsedSec,
              decayedShock,
              globalRagdollActive
            );
            setBehaviorEval(output);
            return updatedNodes;
          });
          return decayedShock < 0.02 ? 0 : decayedShock;
        });

        return nextW;
      });
    }, 85);

    return () => clearInterval(interval);
  }, [autoOscillateW, edges4D, globalRagdollActive]);

  // Safe-Log Current Version & Synthesize New Manifold Dimension
  const handleGenerateNewWorld = useCallback(
    (preferredArchetype?: WorldTopologyArchetype) => {
      const newWorld = generateManifoldWorld(undefined, preferredArchetype);
      const nextEpochNum = gameVersionArchive.length;
      const naming = generateGameVersionNaming(newWorld, nextEpochNum, false);

      const newVersionLog: ManifoldGameVersionLog = {
        id: `version-epoch-${nextEpochNum}-${newWorld.seed}`,
        versionCode: naming.versionCode,
        gameTitle: naming.gameTitle,
        fontFamily: naming.fontFamily,
        meaningAndLore: naming.meaningAndLore,
        world: newWorld,
        excavations: [],
        placedBuildings: [],
        wCoord: Math.max(
          -1,
          Math.min(1, Number((newWorld.manifoldCoord[3] * 0.5).toFixed(2)))
        ),
        savedAt: Date.now(),
        isOriginalSeed: false,
      };

      setGameVersionArchive((prev) => [newVersionLog, ...prev]);
      setActiveVersionId(newVersionLog.id);
      setCurrentWorld(newWorld);
      setExcavations([]);
      setPlacedBuildings([]);
      setTemporalLoopActive(false);
      setWCoord(newVersionLog.wCoord);
      harmonicSoundscape.triggerArchitecturalChord(newWorld.seed % 5);
    },
    [gameVersionArchive.length]
  );

  // Restore any Safe-Logged Older Game Version (including SEED-000 Original Seed)
  const handleSelectGameVersion = useCallback(
    (versionLog: ManifoldGameVersionLog) => {
      setTemporalLoopActive(false);
      setActiveVersionId(versionLog.id);
      setCurrentWorld(versionLog.world);
      setExcavations(versionLog.excavations ?? []);
      setPlacedBuildings(versionLog.placedBuildings ?? []);
      setWCoord(versionLog.wCoord ?? 0);
      harmonicSoundscape.triggerChime(4, 0.65);
    },
    []
  );

  // Manifold Anchor Handlers: Bookmark / Unbookmark Specific Dimensional Seeds in localStorage
  const handleToggleFavoriteManifold = useCallback(
    (versionLog: ManifoldGameVersionLog, anchorNote?: string) => {
      setFavoritedManifolds((prev) => {
        const exists = prev.some((f) => f.seed === versionLog.world.seed);
        if (exists) {
          return prev.filter((f) => f.seed !== versionLog.world.seed);
        }
        const newAnchor: FavoritedManifoldAnchor = {
          id: `anchor-${versionLog.world.seed}-${Date.now()}`,
          seed: versionLog.world.seed,
          anchorNote,
          versionLog: {
            ...versionLog,
            excavations:
              versionLog.id === activeVersionId
                ? excavations
                : versionLog.excavations ?? [],
            placedBuildings:
              versionLog.id === activeVersionId
                ? placedBuildings
                : versionLog.placedBuildings ?? [],
            wCoord:
              versionLog.id === activeVersionId
                ? wCoord
                : versionLog.wCoord ?? 0,
          },
          anchoredAt: Date.now(),
        };
        return [newAnchor, ...prev];
      });
      harmonicSoundscape.triggerChime(6, 0.6);
    },
    [activeVersionId, excavations, placedBuildings, wCoord]
  );

  const handleRemoveFavoriteManifold = useCallback((anchorId: string) => {
    setFavoritedManifolds((prev) => prev.filter((f) => f.id !== anchorId));
  }, []);

  const handleRestoreFromFavoriteAnchor = useCallback(
    (anchor: FavoritedManifoldAnchor) => {
      const ver = anchor.versionLog;
      setGameVersionArchive((prev) => {
        const exists = prev.some((v) => v.id === ver.id);
        return exists ? prev : [ver, ...prev];
      });
      setTemporalLoopActive(false);
      setActiveVersionId(ver.id);
      setCurrentWorld(ver.world);
      setExcavations(ver.excavations ?? []);
      setPlacedBuildings(ver.placedBuildings ?? []);
      setWCoord(ver.wCoord ?? 0);
      harmonicSoundscape.triggerArchitecturalChord(anchor.seed % 5);
    },
    []
  );

  const handleJumpToExactSeed = useCallback(
    (seed: number, preferredArchetype?: WorldTopologyArchetype) => {
      // First check if this seed is already in Favorited Manifolds or Epoch Archive
      const existingAnchor = favoritedManifolds.find((f) => f.seed === seed);
      if (existingAnchor) {
        handleRestoreFromFavoriteAnchor(existingAnchor);
        return;
      }
      const existingVer = gameVersionArchive.find((v) => v.world.seed === seed);
      if (existingVer) {
        handleSelectGameVersion(existingVer);
        return;
      }

      const newWorld = generateManifoldWorld(seed, preferredArchetype);
      const nextEpochNum = gameVersionArchive.length;
      const naming = generateGameVersionNaming(newWorld, nextEpochNum, false);

      const newVersionLog: ManifoldGameVersionLog = {
        id: `version-seed-${seed}-${Date.now()}`,
        versionCode: naming.versionCode,
        gameTitle: naming.gameTitle,
        fontFamily: naming.fontFamily,
        meaningAndLore: naming.meaningAndLore,
        world: newWorld,
        excavations: [],
        placedBuildings: [],
        wCoord: Math.max(
          -1,
          Math.min(1, Number((newWorld.manifoldCoord[3] * 0.5).toFixed(2)))
        ),
        savedAt: Date.now(),
        isOriginalSeed: false,
      };

      setGameVersionArchive((prev) => [newVersionLog, ...prev]);
      setActiveVersionId(newVersionLog.id);
      setCurrentWorld(newWorld);
      setExcavations([]);
      setPlacedBuildings([]);
      setTemporalLoopActive(false);
      setWCoord(newVersionLog.wCoord);
      harmonicSoundscape.triggerArchitecturalChord(seed % 5);
    },
    [
      favoritedManifolds,
      gameVersionArchive,
      handleRestoreFromFavoriteAnchor,
      handleSelectGameVersion,
    ]
  );

  const handleSyncTemporalLoopState = useCallback(
    (loopProgress: number, loopedWCoord?: number) => {
      setTemporalLoopProgress(loopProgress);
      if (typeof loopedWCoord === 'number') {
        setWCoord(loopedWCoord);
      }
    },
    []
  );

  // Mining & Building Placement Handlers
  const [novelEvents, setNovelEvents] = useState<ContinuumNovelEvent[]>(() => [
    {
      id: 'ev-init-1',
      timelineVersionId: 'version-seed-000-original',
      worldSeed: 408291,
      worldName: 'Initial Continuum',
      actionType: 'dimension-phase-shift',
      label: 'Continuum Seed #408291 Initialized',
      wCoord: 0.0,
      position: [0, 4, 14],
      actionTimeSec: 2.4,
      karmicResonanceWeight: 1.0,
      createdAt: Date.now() - 12000,
    },
    {
      id: 'ev-init-2',
      timelineVersionId: 'version-seed-000-original',
      worldSeed: 408291,
      worldName: 'Initial Continuum',
      actionType: 'weave-symbiotic-tether',
      label: 'Symbiotic Kinship Chord Woven',
      wCoord: 0.18,
      position: [-6, 3, 6],
      actionTimeSec: 8.6,
      karmicResonanceWeight: 1.2,
      createdAt: Date.now() - 6000,
    },
  ]);

  const [worldArtforms, setWorldArtforms] = useState<
    WorldspaceProceduralArtform[]
  >(() => [
    {
      id: 'artform-initial-helix',
      title: 'Chiral Chrono-Helix Arbor #408',
      archetype: 'chiral-chrono-helix',
      parentSeedA: 408291,
      parentSeedB: 408399,
      karmicOriginSummary:
        'Grown via Chiral Phyllotactic Helix-Arbor L-System (4D-Parametric) from cross-continuum action time.',
      x: 11.5,
      z: 3.5,
      scale: 1.15,
      primaryColor: '#38bdf8',
      accentColor: '#a855f7',
      wPhase: 0.15,
      biocomplexityScore: 76,
      lSystemGrammar: synthesizeLSystemGrammarSpec(
        'chiral-chrono-helix',
        408291,
        408399,
        76
      ),
      createdAt: Date.now(),
    },
    {
      id: 'artform-initial-loom',
      title: 'Karmic Tensegrity Space-Loom #719',
      archetype: 'karmic-tensegrity-loom',
      parentSeedA: 719402,
      parentSeedB: 408291,
      karmicOriginSummary:
        'Grown via Cantilevered Tensegrity Space-Loom L-System with non-repeating golden-angle struts.',
      x: -10.5,
      z: 5.5,
      scale: 1.1,
      primaryColor: '#10b981',
      accentColor: '#38bdf8',
      wPhase: -0.24,
      biocomplexityScore: 72,
      lSystemGrammar: synthesizeLSystemGrammarSpec(
        'karmic-tensegrity-loom',
        719402,
        408291,
        72
      ),
      createdAt: Date.now(),
    },
    {
      id: 'artform-initial-gyroid',
      title: 'Biocomplex Gyroidal Coral Stele #903',
      archetype: 'biocomplex-gyroid-stele',
      parentSeedA: 903117,
      parentSeedB: 512884,
      karmicOriginSummary:
        'Grown via Schoen-TPMS Trabecular Coral & Gyroid Foliation L-System evolving across the W-axis.',
      x: 3.0,
      z: -11.5,
      scale: 1.2,
      primaryColor: '#f59e0b',
      accentColor: '#ec4899',
      wPhase: 0.42,
      biocomplexityScore: 81,
      lSystemGrammar: synthesizeLSystemGrammarSpec(
        'biocomplex-gyroid-stele',
        903117,
        512884,
        81
      ),
      createdAt: Date.now(),
    },
  ]);

  const playerActionTimeSecRef = useRef<number>(12);
  useEffect(() => {
    playerActionTimeSecRef.current =
      weatherTelemetry?.foreroomsTelemetry?.playerActionTimeSec ?? 12;
  }, [weatherTelemetry?.foreroomsTelemetry?.playerActionTimeSec]);

  const handleMineTerrainAt = useCallback(
    (spot: TerrainExcavationSpot, harvested: ResourceId[]) => {
      setExcavations((prev) => [...prev, spot]);
      setInventory((prev) => {
        const next = { ...prev };
        for (const r of harvested) {
          next[r] = (next[r] ?? 0) + 1;
        }
        return next;
      });
      setNovelEvents((prev) => [
        {
          id: `ev-mine-${Date.now()}`,
          timelineVersionId: activeVersionId,
          worldSeed: currentWorld.seed,
          worldName: currentWorld.name,
          actionType: 'excavate-matter',
          label: `Excavated Bedrock (${harvested.length} Shards)`,
          wCoord,
          position: [spot.x, 0, spot.z],
          actionTimeSec: playerActionTimeSecRef.current + 1.5,
          karmicResonanceWeight: 1.15,
          createdAt: Date.now(),
        },
        ...prev.slice(0, 29),
      ]);
      harmonicSoundscape.triggerChime(2, 0.55);
    },
    [activeVersionId, currentWorld.name, currentWorld.seed, wCoord]
  );

  const handlePlaceBuildingAt = useCallback(
    (newBuilding: PlacedWorldBuilding) => {
      setPlacedBuildings((prev) => [...prev, newBuilding]);
      setNovelEvents((prev) => [
        {
          id: `ev-build-${Date.now()}`,
          timelineVersionId: activeVersionId,
          worldSeed: currentWorld.seed,
          worldName: currentWorld.name,
          actionType: 'sinter-architecture',
          label: `Sintered ${newBuilding.presetName}`,
          wCoord,
          position: [newBuilding.x, newBuilding.y, newBuilding.z],
          actionTimeSec: playerActionTimeSecRef.current + 2.2,
          karmicResonanceWeight: 1.45,
          createdAt: Date.now(),
        },
        ...prev.slice(0, 29),
      ]);
      harmonicSoundscape.triggerArchitecturalChord(2);
    },
    [activeVersionId, currentWorld.name, currentWorld.seed, wCoord]
  );

  // Crafting inside Left-Hand Void Ball
  const handleCraftRecipe = useCallback(
    (recipe: CraftingRecipe) => {
      // Deduct resources
      setInventory((prev) => {
        const next = { ...prev };
        for (const [resId, cost] of Object.entries(recipe.cost)) {
          if ((next[resId as ResourceId] ?? 0) < (cost ?? 0)) {
            return prev;
          }
          next[resId as ResourceId] =
            (next[resId as ResourceId] ?? 0) - (cost ?? 0);
        }
        if (recipe.effectType === 'synthesize-void-dust') {
          next['void-singularity-dust'] =
            (next['void-singularity-dust'] ?? 0) + 2;
        }
        return next;
      });

      if (recipe.effectType === 'boost-jump-biology') {
        setBiologicalJumpBoost((prev) => Number((prev + 0.18).toFixed(2)));
      } else if (recipe.effectType === 'spawn-symbiotic-entity') {
        const bp = currentWorld.entityBlueprints[0];
        if (bp) {
          setSpawnQueue((prev) => [...prev, { blueprint: bp, count: 1 }]);
        }
      } else if (recipe.effectType === 'place-active-preset') {
        const newBld: PlacedWorldBuilding = {
          id: `bld-${Date.now()}`,
          presetId: activeBuildingPreset.id,
          presetName: activeBuildingPreset.name,
          x: explorerCoords[0],
          y: explorerCoords[1] - 1.5,
          z: explorerCoords[2] - 6,
          rotationY: 0,
          blocks: activeBuildingPreset.blocks,
        };
        setPlacedBuildings((prev) => [...prev, newBld]);
      }
    },
    [currentWorld.entityBlueprints, activeBuildingPreset, explorerCoords]
  );

  // Handlers for Entity Synthesis & Ragdoll Actions
  const handleSpawnFromBlueprint = useCallback(
    (blueprint: EntityBlueprint, count: number = 1) => {
      setSpawnQueue((prev) => [...prev, { blueprint, count }]);
    },
    []
  );

  const handleSynthesizeCustomEntity = useCallback(
    (
      morphology: EntityMorphology,
      carvingStyle: GeometryCarvingStyle,
      headStyle: EntityBlueprint['headStyle'],
      limbLength: number,
      baseStiffness: number,
      skinTopology?: SkinTopologyStyle,
      ecologicalRole?: EntityBlueprint['ecologicalRole'],
      specializedAttackDamage?: EntityBlueprint['specializedAttackDamage']
    ) => {
      const customSeed = Math.floor(Math.random() * 899999 + 100000);
      const baseBp = generateEntityBlueprintForWorld(
        currentWorld.id,
        customSeed,
        currentWorld.entityBlueprints.length + 1,
        currentWorld.palette.accentColor,
        morphology
      );

      const customBp: EntityBlueprint = {
        ...baseBp,
        carvingStyle,
        headStyle,
        limbLength,
        baseStiffness,
        ...(skinTopology ? { skinTopology } : {}),
        ...(ecologicalRole ? { ecologicalRole } : {}),
        ...(specializedAttackDamage ? { specializedAttackDamage } : {}),
      };

      setCurrentWorld((prev) => ({
        ...prev,
        entityBlueprints: [customBp, ...prev.entityBlueprints],
      }));
      setSpawnQueue((prev) => [...prev, { blueprint: customBp, count: 1 }]);
    },
    [currentWorld]
  );

  const [strainHeatmapEnabled, setStrainHeatmapEnabled] =
    useState<boolean>(false);
  const [superflatMode, setSuperflatMode] = useState<boolean>(true);
  const [summonVoidBallCount, setSummonVoidBallCount] = useState<number>(0);
  const [openMindspaceTriggerCount, setOpenMindspaceTriggerCount] =
    useState<number>(0);
  const [openVoidDialTriggerCount, setOpenVoidDialTriggerCount] =
    useState<number>(0);
  const [hudCompact, setHudCompact] = useState<boolean>(true);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [foreroomsDispositionOverride, setForeroomsDispositionOverride] =
    useState<ForeroomsDispositionLocus | null>(null);

  // Evolutionary Ecology, Liquid Gore Genres, Frontier Complexes, Cave-Nests & Defecation Flora State
  const [goreGenreOverride, setGoreGenreOverride] =
    useState<DimensionalGoreGenre | null>(null);
  const [liquidViscosityMultiplier, setLiquidViscosityMultiplier] =
    useState<number>(1.0);
  const [evolutionarySpeedMultiplier, setEvolutionarySpeedMultiplier] =
    useState<number>(1.25);

  const [frontierComplexes, setFrontierComplexes] = useState<
    FrontierComplexSite[]
  >(() => [
    generateFrontierComplexAtEdge(
      currentWorld.seed,
      0,
      0.85,
      () => 0,
      'biocomplex-nature-sanctuary'
    ),
    generateFrontierComplexAtEdge(
      currentWorld.seed,
      1,
      3.95,
      () => 0,
      'tech-species-husbandry-paddock'
    ),
  ]);

  const [caveNestComplexes, setCaveNestComplexes] = useState<
    WorldCaveNestComplex[]
  >([
    {
      id: `cave-seed-${currentWorld.seed}-0`,
      builderEntityName:
        currentWorld.entityBlueprints[0]?.name ?? 'Apex Lithic Stalker',
      dnaHash: 'DNA-SEED-01',
      x: -22,
      y: 2.2,
      z: 19,
      elevationTier: 2.2,
      caveRadius: 2.6,
      nestEggCount: 4,
      accentHex: currentWorld.palette.accentColor,
      createdAt: Date.now(),
    },
  ]);

  const [fertilizedFloraPatches, setFertilizedFloraPatches] = useState<
    WorldFertilizedFloraPatch[]
  >([
    {
      id: `flora-seed-${currentWorld.seed}-0`,
      depositorEntityName:
        currentWorld.entityBlueprints[1]?.name ?? 'Symbiotic Spore Grazer',
      x: 15,
      y: 0,
      z: 18,
      nutrientPotency: 1.15,
      growthStage: 1.0,
      stemCount: 8,
      primaryHex: '#34d399',
      sporeHex: currentWorld.palette.accentColor,
      createdAt: Date.now(),
    },
  ]);

  // Reset or regenerate frontier complexes when currentWorld changes
  useEffect(() => {
    setFrontierComplexes([
      generateFrontierComplexAtEdge(
        currentWorld.seed,
        0,
        0.85,
        () => 0,
        'biocomplex-nature-sanctuary'
      ),
      generateFrontierComplexAtEdge(
        currentWorld.seed,
        1,
        3.95,
        () => 0,
        'tech-species-husbandry-paddock'
      ),
    ]);
  }, [currentWorld.seed]);

  // Persistent Evolutionary DNA Lineage Archive
  const [lineageArchive, setLineageArchive] = useState<
    EvolutionaryLineageRecord[]
  >(() => {
    try {
      const raw = window.localStorage.getItem(LINEAGE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    // Seed initial lineage records from initial world blueprints
    const initialSites = [
      generateFrontierComplexAtEdge(
        currentWorld.seed,
        0,
        0.85,
        () => 0,
        'biocomplex-nature-sanctuary'
      ),
      generateFrontierComplexAtEdge(
        currentWorld.seed,
        1,
        3.95,
        () => 0,
        'tech-species-husbandry-paddock'
      ),
    ];
    return currentWorld.entityBlueprints.slice(0, 2).map((bp, idx) => {
      const baseDna = synthesizeInitialEntityDNA(bp, currentWorld.seed);
      const site = initialSites[idx % initialSites.length];
      const mutated = mutateEntityGenomeAndBlueprint(
        bp,
        baseDna,
        currentWorld.seed,
        currentWorld.name,
        idx === 0
          ? 'frontier-biome-migration'
          : 'tech-husbandry-domestication',
        site
      );
      return mutated.lineageRecord;
    });
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(
        LINEAGE_STORAGE_KEY,
        JSON.stringify(lineageArchive.slice(0, 36))
      );
    } catch {
      // ignore
    }
  }, [lineageArchive]);

  const handleDiscoverFrontierComplex = useCallback(
    (site: FrontierComplexSite) => {
      setFrontierComplexes((prev) => [site, ...prev.slice(0, 11)]);
      harmonicSoundscape.triggerArchitecturalChord(2);
    },
    []
  );

  const handleLogEvolutionaryLineage = useCallback(
    (record: EvolutionaryLineageRecord) => {
      setLineageArchive((prev) => [record, ...prev.slice(0, 35)]);
    },
    []
  );

  const handleExcavateCaveNest = useCallback((cave: WorldCaveNestComplex) => {
    setCaveNestComplexes((prev) => [cave, ...prev.slice(0, 15)]);
  }, []);

  const handleDepositFertilizedFlora = useCallback(
    (patch: WorldFertilizedFloraPatch) => {
      setFertilizedFloraPatches((prev) => [patch, ...prev.slice(0, 23)]);
    },
    []
  );

  const handleSpawnFrontierComplexManual = useCallback(
    (kind: FrontierComplexSite['kind']) => {
      const angle = Math.random() * Math.PI * 2;
      const site = generateFrontierComplexAtEdge(
        currentWorld.seed,
        frontierComplexes.length + 1,
        angle,
        () => 0,
        kind
      );
      setFrontierComplexes((prev) => [site, ...prev.slice(0, 11)]);
      harmonicSoundscape.triggerArchitecturalChord(3);
    },
    [currentWorld.seed, frontierComplexes.length]
  );

  const handleAdvanceHusbandryTechLevel = useCallback((siteId: string) => {
    setFrontierComplexes((prev) =>
      prev.map((s) =>
        s.id === siteId
          ? {
              ...s,
              techAdvancementLevel: Number(
                Math.min(5.0, s.techAdvancementLevel + 0.5).toFixed(2)
              ),
              fertilityIndex: Number(
                Math.min(0.99, s.fertilityIndex + 0.06).toFixed(2)
              ),
              farmedSpeciesCount: s.farmedSpeciesCount + 1,
            }
          : s
      )
    );
    harmonicSoundscape.triggerChime(5, 0.65);
  }, []);

  const handleTriggerForcedMutationWave = useCallback(() => {
    const bp =
      currentWorld.entityBlueprints[
        Math.floor(Math.random() * currentWorld.entityBlueprints.length)
      ];
    const site =
      frontierComplexes[Math.floor(Math.random() * frontierComplexes.length)];
    if (!bp) return;
    const baseDna = bp.geneticDNA
      ? bp.geneticDNA
      : synthesizeInitialEntityDNA(bp, currentWorld.seed);
    const mutated = mutateEntityGenomeAndBlueprint(
      bp,
      baseDna,
      currentWorld.seed,
      currentWorld.name,
      site?.kind === 'tech-species-husbandry-paddock'
        ? 'tech-husbandry-domestication'
        : 'frontier-biome-migration',
      site
    );
    setLineageArchive((prev) => [mutated.lineageRecord, ...prev.slice(0, 35)]);
    setCurrentWorld((prev) => ({
      ...prev,
      entityBlueprints: [
        mutated.mutatedBlueprint,
        ...prev.entityBlueprints.slice(0, 11),
      ],
    }));
    setSpawnQueue((prev) => [
      ...prev,
      { blueprint: mutated.mutatedBlueprint, count: 1 },
    ]);
    harmonicSoundscape.triggerArchitecturalChord(4);
  }, [
    currentWorld.entityBlueprints,
    currentWorld.name,
    currentWorld.seed,
    frontierComplexes,
  ]);

  const handleSpawnPredatorRaid = useCallback(
    (attackModality: DamageGoreModality) => {
      const raidSeed = Math.floor(Math.random() * 899999 + 100000);
      const basePred = generateEntityBlueprintForWorld(
        currentWorld.id,
        raidSeed,
        currentWorld.entityBlueprints.length + 1,
        '#f43f5e',
        'quadruped-strider'
      );
      const dna = synthesizeInitialEntityDNA(basePred, raidSeed);
      const raidPredBp: EntityBlueprint = {
        ...basePred,
        name: `Pack Raid Stalker · ${attackModality.split('-')[0].toUpperCase()}`,
        ecologicalRole: 'hemophagic-stalker',
        specializedAttackDamage: attackModality,
        geneticDNA: dna,
      };
      setSpawnQueue((prev) => [...prev, { blueprint: raidPredBp, count: 2 }]);
      harmonicSoundscape.triggerPainPleasureVocalization({
        painPleasureGradient: 0.95,
        goreType: attackModality,
        creatureMass: 85,
      });
    },
    [currentWorld.id, currentWorld.entityBlueprints.length]
  );

  const handleExcavateCaveNestManual = useCallback(() => {
    const cave: WorldCaveNestComplex = {
      id: `cave-manual-${Date.now()}`,
      builderEntityName:
        currentWorld.entityBlueprints[0]?.name ?? 'High-Elevation Brood',
      dnaHash: `DNA-G2-${(currentWorld.seed % 9000 + 1000).toString(16).toUpperCase()}`,
      x: Number((explorerCoords[0] + (Math.random() - 0.5) * 10).toFixed(2)),
      y: Number(Math.max(1.2, explorerCoords[1] + 0.5).toFixed(2)),
      z: Number((explorerCoords[2] - 6 + (Math.random() - 0.5) * 10).toFixed(2)),
      elevationTier: 3.0,
      caveRadius: Number((2.1 + Math.random() * 1.1).toFixed(2)),
      nestEggCount: 4 + Math.floor(Math.random() * 4),
      accentHex: currentWorld.palette.accentColor,
      createdAt: Date.now(),
    };
    setCaveNestComplexes((prev) => [cave, ...prev.slice(0, 15)]);
    harmonicSoundscape.triggerChime(3, 0.7);
  }, [
    currentWorld.entityBlueprints,
    currentWorld.palette.accentColor,
    currentWorld.seed,
    explorerCoords,
  ]);

  const handleDepositFloraPatchManual = useCallback(() => {
    const patch: WorldFertilizedFloraPatch = {
      id: `flora-manual-${Date.now()}`,
      depositorEntityName:
        currentWorld.entityBlueprints[0]?.name ?? 'Bio-Fertile Symbiont',
      x: Number((explorerCoords[0] + (Math.random() - 0.5) * 10).toFixed(2)),
      y: Math.max(-2.5, explorerCoords[1] - 1.4),
      z: Number((explorerCoords[2] - 5 + (Math.random() - 0.5) * 10).toFixed(2)),
      nutrientPotency: Number((0.95 + Math.random() * 0.65).toFixed(2)),
      growthStage: Number((0.85 + Math.random() * 0.45).toFixed(2)),
      stemCount: 6 + Math.floor(Math.random() * 5),
      primaryHex: '#34d399',
      sporeHex: currentWorld.palette.accentColor,
      createdAt: Date.now(),
    };
    setFertilizedFloraPatches((prev) => [patch, ...prev.slice(0, 23)]);
    harmonicSoundscape.triggerChime(4, 0.65);
  }, [
    currentWorld.entityBlueprints,
    explorerCoords,
    currentWorld.palette.accentColor,
  ]);

  const handleCondense5DMatterToFoundation = useCallback(() => {
    setInventory((prev) => ({
      ...prev,
      [currentWorld.primaryResource]:
        (prev[currentWorld.primaryResource] ?? 0) + 1,
      [currentWorld.secondaryResource]:
        (prev[currentWorld.secondaryResource] ?? 0) + 1,
      'void-singularity-dust': (prev['void-singularity-dust'] ?? 0) + 1,
    }));
    const archetypes: WorldspaceArtformArchetype[] = [
      'chiral-chrono-helix',
      'karmic-tensegrity-loom',
      'biocomplex-gyroid-stele',
      'omniversal-substrate-obelisk',
    ];
    const seedSalt = Math.floor(Math.random() * 899999 + 100000);
    const chosenArch = archetypes[seedSalt % archetypes.length];
    const bioScore = 68 + (seedSalt % 28);
    const grammar = synthesizeLSystemGrammarSpec(
      chosenArch,
      currentWorld.seed,
      seedSalt,
      bioScore
    );
    const spawnedArt: WorldspaceProceduralArtform = {
      id: `artform-lsys-${Date.now()}`,
      title: `L-System ${chosenArch
        .split('-')
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' ')} #${seedSalt % 1000}`,
      archetype: chosenArch,
      parentSeedA: currentWorld.seed,
      parentSeedB: seedSalt,
      karmicOriginSummary: `Grown via ${grammar.variantName} at W=${wCoord.toFixed(
        2
      )}.`,
      x: Number((explorerCoords[0] + (Math.random() - 0.5) * 14).toFixed(1)),
      z: Number((explorerCoords[2] - 6 + (Math.random() - 0.5) * 10).toFixed(1)),
      scale: Number((0.95 + (seedSalt % 35) * 0.01).toFixed(2)),
      primaryColor: currentWorld.palette.accentColor,
      accentColor: currentWorld.playableCharacter.voidOrbColor,
      wPhase: wCoord,
      biocomplexityScore: bioScore,
      lSystemGrammar: grammar,
      createdAt: Date.now(),
    };
    setWorldArtforms((prev) => [spawnedArt, ...prev.slice(0, 11)]);
    setNovelEvents((prev) => [
      {
        id: `ev-karmic-${Date.now()}`,
        timelineVersionId: activeVersionId,
        worldSeed: currentWorld.seed,
        worldName: currentWorld.name,
        actionType: 'karmic-synthesis',
        label: `Nucleated ${spawnedArt.title}`,
        wCoord,
        position: [...explorerCoords] as [number, number, number],
        actionTimeSec:
          (weatherTelemetry?.foreroomsTelemetry?.playerActionTimeSec ?? 16) + 3,
        karmicResonanceWeight: 1.6,
        createdAt: Date.now(),
      },
      ...prev.slice(0, 29),
    ]);
    harmonicSoundscape.triggerArchitecturalChord(3);
  }, [
    activeVersionId,
    currentWorld.name,
    currentWorld.palette.accentColor,
    currentWorld.playableCharacter.voidOrbColor,
    currentWorld.primaryResource,
    currentWorld.secondaryResource,
    currentWorld.seed,
    explorerCoords,
    wCoord,
    weatherTelemetry?.foreroomsTelemetry?.playerActionTimeSec,
  ]);

  const handleManifestInterstitialInWorld = useCallback(
    (origin: BiocomplexInterstitialOrigin) => {
      // 1. Materialize the emergent 3D Procedural Artform in the active worldspace
      setWorldArtforms((prev) => {
        const exists = prev.some((a) => a.id === origin.emergentArtform.id);
        if (exists) {
          // Place a new variant near the explorer if already placed
          const offsetArt: WorldspaceProceduralArtform = {
            ...origin.emergentArtform,
            id: `${origin.emergentArtform.id}-${Date.now().toString().slice(-3)}`,
            x: Number(
              (explorerCoords[0] + (Math.random() - 0.5) * 14).toFixed(1)
            ),
            z: Number(
              (explorerCoords[2] - 7 + (Math.random() - 0.5) * 10).toFixed(1)
            ),
          };
          return [offsetArt, ...prev.slice(0, 9)];
        }
        return [origin.emergentArtform, ...prev.slice(0, 9)];
      });

      // 2. Spawn the emergent hybrid Biocomplex Entity into the active worldspace
      setSpawnQueue((prev) => [
        ...prev,
        { blueprint: origin.emergentEntityBlueprint, count: 1 },
      ]);

      // 3. Record the Karmic Synthesis Event
      setNovelEvents((prev) => [
        {
          id: `ev-interstitial-${Date.now()}`,
          timelineVersionId: activeVersionId,
          worldSeed: currentWorld.seed,
          worldName: currentWorld.name,
          actionType: 'karmic-synthesis',
          label: `Manifested ${origin.emergentArtform.title} & ${origin.emergentEntityBlueprint.name}`,
          wCoord: origin.wMidpoint,
          position: [...explorerCoords] as [number, number, number],
          actionTimeSec:
            (weatherTelemetry?.foreroomsTelemetry?.playerActionTimeSec ?? 20) +
            4,
          karmicResonanceWeight: 1.85,
          createdAt: Date.now(),
        },
        ...prev.slice(0, 29),
      ]);

      harmonicSoundscape.triggerArchitecturalChord(
        origin.interstitialSeed % 5
      );
      setActiveOverlay('none');
    },
    [
      activeVersionId,
      currentWorld.name,
      currentWorld.seed,
      explorerCoords,
      weatherTelemetry?.foreroomsTelemetry?.playerActionTimeSec,
    ]
  );

  const handleJumpToInterstitialOrigin = useCallback(
    (origin: BiocomplexInterstitialOrigin) => {
      handleJumpToExactSeed(origin.interstitialSeed);
      setWorldArtforms((prev) => [
        origin.emergentArtform,
        ...prev.filter((a) => a.id !== origin.emergentArtform.id).slice(0, 8),
      ]);
      setSpawnQueue((prev) => [
        ...prev,
        { blueprint: origin.emergentEntityBlueprint, count: 1 },
      ]);
      setActiveOverlay('none');
    },
    [handleJumpToExactSeed]
  );

  // Continuously modulate generative Web Audio ambient resonance with 4D W-coord, wind, and Void Sphere immersion
  useEffect(() => {
    if (!audioEnabled) return;
    harmonicSoundscape.updateWorldResonance({
      worldSeed: currentWorld.seed,
      wCoord,
      windSpeed: weatherTelemetry?.windSpeed ?? 3.5,
      isInsideVoidBall: Boolean(
        weatherTelemetry?.structuralTelemetry?.isInsideVoidBall
      ),
      coherence:
        weatherTelemetry?.interconnectedness?.entrainmentCoherence ?? 0.35,
    });
  }, [audioEnabled, currentWorld.seed, wCoord, weatherTelemetry]);

  const handleApplyCharacterSkinTopology = useCallback(
    (style: SkinTopologyStyle) => {
      setCurrentWorld((prev) => ({
        ...prev,
        playableCharacter: {
          ...prev.playableCharacter,
          skinTopology: style,
        },
      }));
    },
    []
  );

  const handleConsumeSpawnQueue = useCallback(() => {
    setSpawnQueue([]);
  }, []);

  const handleUpdateTelemetry = useCallback(
    (
      entities: EntityRuntimeTelemetry[],
      pos: [number, number, number],
      speed: number,
      weather?: BiomeWeatherTelemetry
    ) => {
      setEntityTelemetry(entities);
      setExplorerCoords(pos);
      setExplorerSpeed(speed);
      if (weather) {
        setWeatherTelemetry(weather);
      }
    },
    []
  );

  const handleImpactSpike = useCallback((magnitude: number) => {
    setImpactShockLevel((prev) => Math.min(1, Math.max(prev, magnitude)));
  }, []);

  // Manifold Snapshot Capture & Browser History Handlers
  const handleCaptureEntitySnapshot = useCallback((entityId: string) => {
    setSelectedEntityId(entityId);
    setSnapshotRequestEntityId(entityId);
  }, []);

  const handleCompleteSnapshotCapture = useCallback(
    (snapshot: EntityManifoldSnapshot | null) => {
      setSnapshotRequestEntityId(null);
      if (!snapshot) return;
      setEntitySnapshots((prev) => [snapshot, ...prev.slice(0, 23)]);
    },
    []
  );

  const handleRestoreFromSnapshot = useCallback(
    (snapshot: EntityManifoldSnapshot) => {
      setAutoOscillateW(false);
      setWCoord(snapshot.wCoord);
      setSpawnQueue((prev) => [
        ...prev,
        { blueprint: snapshot.blueprint, count: 1 },
      ]);
    },
    []
  );

  const handleDeleteSnapshot = useCallback((snapshotId: string) => {
    setEntitySnapshots((prev) => prev.filter((s) => s.id !== snapshotId));
  }, []);

  const handleClearAllSnapshots = useCallback(() => {
    setEntitySnapshots([]);
  }, []);

  // 4D Node Graph Editing Handlers
  const handleUpdateNode = useCallback((updated: Node4D) => {
    setNodes4D((prev) =>
      prev.map((n) => (n.id === updated.id ? updated : n))
    );
  }, []);

  const handleAddNode = useCallback(
    (newNode: Node4D, connectFromId?: string, connectToId?: string) => {
      setNodes4D((prev) => [...prev, newNode]);
      setEdges4D((prev) => {
        const next = [...prev];
        if (connectFromId) {
          next.push({
            id: `e-${Date.now()}-1`,
            from: connectFromId,
            to: newNode.id,
            weight: 1.15,
            phaseLag: 0.1,
          });
        }
        if (connectToId) {
          next.push({
            id: `e-${Date.now()}-2`,
            from: newNode.id,
            to: connectToId,
            weight: 1.2,
            phaseLag: 0.15,
          });
        }
        return next;
      });
    },
    []
  );

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes4D((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges4D((prev) =>
      prev.filter((e) => e.from !== nodeId && e.to !== nodeId)
    );
  }, []);

  const handleLoadPreset = useCallback((preset: NodeGraphPreset) => {
    setNodes4D(preset.nodes);
    setEdges4D(preset.edges);
    setWCoord(preset.defaultW);
    setAutoOscillateW(false);
    setGlobalRagdollActive(false);
  }, []);

  const cycleCameraPerspective = () => {
    setCameraMode((prev) =>
      prev === 'third-person'
        ? 'first-person'
        : prev === 'first-person'
        ? 'orbital-director'
        : 'third-person'
    );
  };

  const cycleFreeLookMode = () => {
    setGameOptions((prev) => {
      const next =
        prev.freeLookMode === 'cursor-gliding'
          ? 'pointer-lock'
          : prev.freeLookMode === 'pointer-lock'
          ? 'click-drag'
          : 'cursor-gliding';
      if (next === 'pointer-lock') {
        setPointerLockRequestCount((c) => c + 1);
      }
      return { ...prev, freeLookMode: next };
    });
  };

  const gifCycleDurationSec = `${(
    7 / Math.max(1, gameOptions.gifFrameRateFps)
  ).toFixed(2)}s`;

  return (
    <div
      style={
        {
          '--gif-cycle-duration': gifCycleDurationSec,
        } as React.CSSProperties
      }
      className={`relative w-screen h-screen flex flex-col bg-[#070b14] text-slate-100 overflow-hidden select-none ${
        gameOptions.gifTypographyStyle !== 'calm-static' ? 'gif-ui-cascade' : ''
      }`}
    >
      {/* Carved Obsidian & Weathered Bronze Relic Top Studio Bar (Single Non-Overlapping Top Shell) */}
      <header className="pointer-events-auto absolute top-2 inset-x-3 z-20 flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#0B0908]/96 border border-[#5C4938] rounded-sm shadow-[0_10px_28px_rgba(0,0,0,0.92)]">
        {/* Zone 1: Carved Relic Seal, World Title & Lore Toggle */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded-sm bg-[#241B14] border border-[#C89D54] text-[10px] font-mono font-bold tracking-widest text-[#E8D8B9] uppercase shrink-0">
            VOIDWALKERS
          </span>
          <a
            href="#viewport"
            onClick={(e) => {
              e.preventDefault();
              setActiveOverlay('none');
            }}
            style={{ fontFamily: activeGameVersion.fontFamily }}
            className="text-xs font-bold tracking-wide text-[#F4EFE6] whitespace-nowrap truncate max-w-[140px]"
            title={`${activeGameVersion.versionCode}: ${activeGameVersion.meaningAndLore}`}
          >
            <ShapeshiftText
              text={activeGameVersion.gameTitle}
              options={gameOptions}
              fallbackFont={activeGameVersion.fontFamily}
              phaseSeed={1}
            />
          </a>
          <button
            onClick={() => setHudCompact((prev) => !prev)}
            className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#16120E] hover:bg-[#221C15] border border-[#4A3B2C] text-[10px] font-mono-tabular text-[#D6C7B2] transition-colors cursor-pointer"
            title="Toggle world lore & biome telemetry stone tablet"
          >
            <span className="text-[#C89D54] font-semibold">
              {activeGameVersion.versionCode}
            </span>
            <span className="text-[#6E5A4F]">·</span>
            <span className="text-[#8CA89E] truncate max-w-[100px]">
              {weatherTelemetry?.weatherName ?? activeWeatherSpec.name}
            </span>
          </button>
        </div>

        {/* Zone 2: Unmistakable 3-Way POV Switcher + [V] Void Dial + [⇧V] 3D Models & HUD Studio */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-[#14100D] border border-[#5C4938] rounded-sm p-0.5">
            <span className="px-1.5 text-[9px] font-mono uppercase tracking-wider text-[#C89D54] font-bold">
              POV [F5]:
            </span>
            <button
              onClick={() => setCameraMode('first-person')}
              className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-sm transition-colors cursor-pointer ${
                cameraMode === 'first-person'
                  ? 'bg-[#C89D54] text-[#0B0908] shadow-sm'
                  : 'text-[#A39281] hover:text-[#F4EFE6]'
              }`}
              title="1st-Person POV: View sculpted 5-finger articulated hands, stitched leather bracers, Void Ball & carved weapons"
            >
              1st Hands
            </button>
            <button
              onClick={() => setCameraMode('third-person')}
              className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-sm transition-colors cursor-pointer ${
                cameraMode === 'third-person'
                  ? 'bg-[#C89D54] text-[#0B0908] shadow-sm'
                  : 'text-[#A39281] hover:text-[#F4EFE6]'
              }`}
              title="3rd-Person POV: View full sculpted human character or active non-human morph body"
            >
              3rd Body
            </button>
            <button
              onClick={() => setCameraMode('orbital-director')}
              className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-sm transition-colors cursor-pointer ${
                cameraMode === 'orbital-director'
                  ? 'bg-[#C89D54] text-[#0B0908] shadow-sm'
                  : 'text-[#A39281] hover:text-[#F4EFE6]'
              }`}
              title="Orbital Free-Camera Director POV"
            >
              Orbit
            </button>
          </div>

          <button
            onClick={() => {
              setActiveOverlay('none');
              setOpenVoidDialTriggerCount((c) => c + 1);
            }}
            className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-sm border bg-[#261B12] hover:bg-[#362619] text-[#F3E5AB] border-[#C89D54] transition-colors whitespace-nowrap cursor-pointer"
            title="Open the Left-Hand Void Ball Radial Dial [V] to pull carved weapons, morph forms, or open portals"
          >
            [V] Void Dial
          </button>

          <button
            onClick={() => {
              setActiveOverlay('none');
              setOpenMindspaceTriggerCount((c) => c + 1);
            }}
            className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-sm border bg-[#16201D] hover:bg-[#1F2E2A] text-[#A7F3D0] border-[#4E7A6B] transition-colors whitespace-nowrap cursor-pointer"
            title="Sink into the 3D Mindspace Model Inspector & Relic HUD Customizer [Shift + V]"
          >
            [⇧V] 3D Models & HUD
          </button>

          <button
            onClick={() => setSuperflatMode((prev) => !prev)}
            className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-sm border transition-colors whitespace-nowrap cursor-pointer ${
              superflatMode
                ? 'bg-[#C89D54] text-[#0B0908] border-[#F3E5AB] shadow-sm'
                : 'bg-[#14100D] hover:bg-[#221C15] text-[#D6C7B2] border-[#5C4938]'
            }`}
            title="Toggle between the Y=0.0m Superflat Proving Ground (with rangefinder rings, target dummies & front entity lineup) and Procedural Mountains"
          >
            {superflatMode ? 'Superflat: ON' : 'Superflat: OFF'}
          </button>

          <button
            onClick={() => {
              const bps = currentWorld.entityBlueprints;
              if (bps.length > 0) {
                const pick = bps[Math.floor(Math.random() * bps.length)];
                handleSpawnFromBlueprint(pick, 1);
              }
            }}
            className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-sm border bg-[#291717] hover:bg-[#3B2020] text-[#FCA5A5] border-[#991B1B] transition-colors whitespace-nowrap cursor-pointer"
            title="Spawn a live articulated 3D entity directly in front of you on the flat plane to test weapons & animations"
          >
            + Spawn Entity
          </button>
        </div>

        {/* Zone 3: Carved Relic Studio Drawers & Dimensional Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              setActiveOverlay((prev) =>
                prev === 'void-hand-inventory' ? 'none' : 'void-hand-inventory'
              )
            }
            className={`px-2 py-1 text-[10px] font-mono rounded-sm border transition-colors whitespace-nowrap cursor-pointer ${
              activeOverlay === 'void-hand-inventory' ||
              activeOverlay === 'void-inner-sanctuary'
                ? 'bg-[#2C1D33] text-[#E9D5FF] border-[#9333EA] font-bold'
                : 'bg-[#14100D] hover:bg-[#211B16] text-[#C2B5A3] border-[#3D3127]'
            }`}
          >
            Sanctum
          </button>
          <button
            onClick={() =>
              setActiveOverlay((prev) =>
                prev === 'node-4d' ? 'none' : 'node-4d'
              )
            }
            className={`hidden md:inline-flex px-2 py-1 text-[10px] font-mono rounded-sm border transition-colors whitespace-nowrap cursor-pointer ${
              activeOverlay === 'node-4d'
                ? 'bg-[#2E2213] text-[#FDE68A] border-[#D97706] font-bold'
                : 'bg-[#14100D] hover:bg-[#211B16] text-[#C2B5A3] border-[#3D3127]'
            }`}
          >
            4D Map
          </button>
          <button
            onClick={() =>
              setActiveOverlay((prev) =>
                prev === 'synthesizer-entities'
                  ? 'none'
                  : 'synthesizer-entities'
              )
            }
            className={`hidden md:inline-flex px-2 py-1 text-[10px] font-mono rounded-sm border transition-colors whitespace-nowrap cursor-pointer ${
              activeOverlay === 'synthesizer-entities'
                ? 'bg-[#16272B] text-[#A5F3FC] border-[#0891B2] font-bold'
                : 'bg-[#14100D] hover:bg-[#211B16] text-[#C2B5A3] border-[#3D3127]'
            }`}
          >
            Forge [L]
          </button>
          <button
            onClick={() =>
              setActiveOverlay((prev) =>
                prev === 'synthesizer-worlds' ? 'none' : 'synthesizer-worlds'
              )
            }
            className={`hidden xl:inline-flex px-2 py-1 text-[10px] font-mono rounded-sm border transition-colors whitespace-nowrap cursor-pointer ${
              activeOverlay === 'synthesizer-worlds'
                ? 'bg-[#14291F] text-[#A7F3D0] border-[#059669] font-bold'
                : 'bg-[#14100D] hover:bg-[#211B16] text-[#C2B5A3] border-[#3D3127]'
            }`}
          >
            Epochs ({gameVersionArchive.length})
          </button>
          <button
            onClick={() =>
              setActiveOverlay((prev) =>
                prev === 'evolutionary-mod-menu'
                  ? 'none'
                  : 'evolutionary-mod-menu'
              )
            }
            className={`hidden xl:inline-flex px-2 py-1 text-[10px] font-mono rounded-sm border transition-colors whitespace-nowrap cursor-pointer ${
              activeOverlay === 'evolutionary-mod-menu'
                ? 'bg-[#33161E] text-[#FECDD3] border-[#E11D48] font-bold'
                : 'bg-[#14100D] hover:bg-[#211B16] text-[#D8A8B0] border-[#3D3127]'
            }`}
          >
            Evo [⇧M]
          </button>
          <button
            onClick={() => setIsAssayHUDOpen((prev) => !prev)}
            className={`px-2 py-1 text-[10px] font-mono rounded-sm border transition-colors whitespace-nowrap cursor-pointer ${
              isAssayHUDOpen
                ? 'bg-[#261B12] text-[#F3E5AB] border-[#C89D54] font-bold'
                : 'bg-[#14100D] hover:bg-[#211B16] text-[#C2B5A3] border-[#3D3127]'
            }`}
            title="Toggle Dimensional Assay & W-Axis Scrubber"
          >
            D{dimIndex.toFixed(1)}
          </button>
          <button
            onClick={() => setIsVehicleHUDOpen((prev) => !prev)}
            className={`hidden lg:inline-flex px-2 py-1 text-[10px] font-mono rounded-sm border transition-colors whitespace-nowrap cursor-pointer ${
              isVehicleHUDOpen
                ? 'bg-[#2C1D33] text-[#E9D5FF] border-[#9333EA] font-bold'
                : 'bg-[#14100D] hover:bg-[#211B16] text-[#C2B5A3] border-[#3D3127]'
            }`}
          >
            5D Rider [G]
          </button>
          <button
            onClick={() => {
              setActiveOverlay('none');
              setSummonVoidBallCount((c) => c + 1);
            }}
            className="px-2 py-1 text-[10px] font-mono font-bold rounded-sm border bg-[#23192E] hover:bg-[#312240] text-[#E9D5FF] border-[#7E57C2] transition-colors whitespace-nowrap cursor-pointer"
            title="Tear open the 36m Square Portal Room directly in front of you"
          >
            Tear Portal
          </button>
          <button
            onClick={() => handleShiftRandomDimension()}
            className="px-2.5 py-1 text-[10px] font-mono font-bold text-[#0B0908] bg-[#C89D54] hover:bg-[#DAB26B] rounded-sm transition-colors whitespace-nowrap cursor-pointer shadow-sm"
          >
            Shift Dim
          </button>
          <button
            onClick={() =>
              setActiveOverlay((prev) =>
                prev === 'somatic-options' ? 'none' : 'somatic-options'
              )
            }
            className={`px-2 py-1 text-[10px] font-mono rounded-sm border transition-colors whitespace-nowrap cursor-pointer ${
              activeOverlay === 'somatic-options'
                ? 'bg-[#C89D54] text-[#0B0908] border-[#E8D8B9] font-bold'
                : 'bg-[#14100D] hover:bg-[#211B16] text-[#C2B5A3] border-[#3D3127]'
            }`}
          >
            Opt [O]
          </button>
        </div>
      </header>

      {/* Main 3D Spatial Viewport & Clean Contextual Overlays */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {/* Full-Viewport Three.js Sandbox Canvas */}
        <ManifoldSandboxViewport
          world={currentWorld}
          cameraMode={cameraMode}
          onSetCameraMode={setCameraMode}
          onCycleCameraPerspective={cycleCameraPerspective}
          onCycleFreeLookMode={cycleFreeLookMode}
          audioEnabled={audioEnabled}
          onToggleAudio={() => {
            const next = harmonicSoundscape.toggle();
            setAudioEnabled(next);
          }}
          onSelectTool={setActiveTool}
          openMindspaceTriggerCount={openMindspaceTriggerCount}
          openVoidDialTriggerCount={openVoidDialTriggerCount}
          superflatMode={superflatMode}
          gameOptions={gameOptions}
          pointerLockRequestCount={pointerLockRequestCount}
          isOverlayOpen={activeOverlay !== 'none'}
          activeTool={activeTool}
          activeNoveltySeedId={activeNoveltySeedId}
          activeBuildingPreset={activeBuildingPreset}
          excavations={excavations}
          placedBuildings={placedBuildings}
          onMineTerrainAt={handleMineTerrainAt}
          onPlaceBuildingAt={handlePlaceBuildingAt}
          voidBallOpen={isVoidBallOpen}
          biologicalJumpBoost={biologicalJumpBoost}
          behaviorOutput={behaviorEval}
          wCoord={wCoord}
          globalRagdollActive={globalRagdollActive}
          temporalLoopActive={temporalLoopActive}
          onSyncTemporalLoopState={handleSyncTemporalLoopState}
          spawnQueue={spawnQueue}
          onConsumeSpawnQueue={handleConsumeSpawnQueue}
          impulseTargetEntityId={impulseTargetEntityId}
          onClearImpulseTarget={() => setImpulseTargetEntityId(null)}
          selectedEntityId={selectedEntityId}
          snapshotRequestEntityId={snapshotRequestEntityId}
          onCompleteSnapshotCapture={handleCompleteSnapshotCapture}
          shockwaveTriggerCount={shockwaveTriggerCount}
          repopulateTriggerCount={repopulateTriggerCount}
          strainHeatmapEnabled={strainHeatmapEnabled}
          summonVoidBallCount={summonVoidBallCount}
          foreroomsDispositionOverride={foreroomsDispositionOverride}
          favoritedManifolds={favoritedManifolds}
          epochCount={gameVersionArchive.length}
          novelEventsCount={novelEvents.length}
          worldArtforms={worldArtforms}
          goreGenreOverride={goreGenreOverride}
          evolutionSpeedMultiplier={evolutionarySpeedMultiplier}
          frontierComplexes={frontierComplexes}
          caveNestComplexes={caveNestComplexes}
          fertilizedFloraPatches={fertilizedFloraPatches}
          onDiscoverFrontierComplex={handleDiscoverFrontierComplex}
          onLogEvolutionaryLineage={handleLogEvolutionaryLineage}
          onSpawnCaveNestComplex={handleExcavateCaveNest}
          onSpawnFertilizedFloraPatch={handleDepositFertilizedFlora}
          onCraftRecipeFromVoidStation={handleCraftRecipe}
          onShiftDimensionFromVoidStation={() => handleGenerateNewWorld()}
          onToggleStrainHeatmapFromVoidStation={() =>
            setStrainHeatmapEnabled((prev) => !prev)
          }
          onUpdateTelemetry={handleUpdateTelemetry}
          onImpactSpike={handleImpactSpike}
          dimIndex={dimIndex}
          onChangeDimension={handleDimensionChange}
          onUpdateVehicleTelemetry={setVehicleTelemetry}
          inventory={inventory}
          biodepthConfig={biodepthConfig}
          onUpdateBiodepthConfig={setBiodepthConfig}
        />

        {/* Subtle Perimeter Symbiotic Frame (Leaves center 3D viewport 100% clear) */}
        <InterconnectednessWebOverlay
          telemetry={weatherTelemetry?.interconnectedness ?? null}
          wCoord={wCoord}
          explorerSpeed={explorerSpeed}
          voidOrbColor={currentWorld.playableCharacter.voidOrbColor}
          accentColor={currentWorld.palette.accentColor}
          hudOpacity={gameOptions.hudOpacity}
        />

        {/* Optional Expandable World Lore & Biome Card (Hidden by default to keep 3D viewport serene) */}
        {!hudCompact && activeOverlay === 'none' && (
          <div
            style={{ opacity: gameOptions.hudOpacity }}
            className="pointer-events-auto absolute top-4 left-4 z-10 max-w-xs bg-slate-950/94 border border-white/10 rounded-xl p-3.5 space-y-2 shadow-xl"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono-tabular text-amber-400 font-semibold">
                {activeGameVersion.versionCode} · Seed #{currentWorld.seed}
              </span>
              <button
                onClick={() => setHudCompact(true)}
                className="text-[10px] text-slate-400 hover:text-white uppercase tracking-wider cursor-pointer"
              >
                Hide
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeGameVersion.meaningAndLore}
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono-tabular text-cyan-300">
              <span>
                {weatherTelemetry
                  ? `${weatherTelemetry.effectiveGravity.toFixed(1)}m/s² · Wind ${weatherTelemetry.windSpeed.toFixed(1)}m/s`
                  : `${currentWorld.gravity.toFixed(1)}m/s²`}
              </span>
              <span className="text-purple-300">
                {weatherTelemetry?.foreroomsTelemetry?.activeSpelling ?? '4RumEs'} ·{' '}
                {weatherTelemetry?.foreroomsTelemetry?.dispositionLabel ??
                  'Inside Continuum'}
              </span>
            </div>
            {weatherTelemetry?.dimensionalBleedTelemetry && (
              <div className="pt-2 border-t border-white/10 space-y-1 text-[10px] font-mono-tabular">
                <div className="flex items-center justify-between text-emerald-300">
                  <span className="truncate">
                    {weatherTelemetry.dimensionalBleedTelemetry.activeBleedModeLabel}
                  </span>
                  <span className="text-amber-300 shrink-0 ml-1">
                    Evo {weatherTelemetry.dimensionalBleedTelemetry.aestheticEvolutionStage.toFixed(1)}
                  </span>
                </div>
                {weatherTelemetry.dimensionalBleedTelemetry.nearestAnomaly && (
                  <div className="text-slate-300 truncate">
                    <span className="text-cyan-300 font-semibold">
                      {weatherTelemetry.dimensionalBleedTelemetry.nearestAnomaly.title}
                    </span>{' '}
                    (Grad {weatherTelemetry.dimensionalBleedTelemetry.nearestAnomaly.originalityGradient.toFixed(2)}) ·{' '}
                    <span className="text-amber-300">
                      {weatherTelemetry.dimensionalBleedTelemetry.nearestAnomaly.statusLabel}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Compact Top-Right Worldspace Form-Bleed & Anomalous Object Pill (Shown only when HUD expanded) */}
        {!hudCompact && activeOverlay === 'none' && weatherTelemetry?.dimensionalBleedTelemetry && (
          <div
            style={{ opacity: gameOptions.hudOpacity }}
            onClick={() => setActiveOverlay('void-inner-sanctuary')}
            className="pointer-events-auto absolute top-14 right-4 z-10 bg-slate-950/94 hover:bg-slate-900/95 border border-white/10 rounded-xl px-3 py-1.5 shadow-lg cursor-pointer transition-colors max-w-md"
            title="Click to inspect Anomalous Behavioral Objects, Smooth-Minimum (smin) Form-Bleed & Astra × Argon Codex"
          >
            <div className="flex items-center gap-2 text-[10px] font-mono-tabular">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  weatherTelemetry.dimensionalBleedTelemetry.coalescenceStrength >= 0
                    ? 'bg-emerald-400'
                    : 'bg-purple-400'
                }`}
              />
              <span className="text-slate-200 font-semibold truncate">
                {weatherTelemetry.dimensionalBleedTelemetry.coalescenceStrength >= 0
                  ? `smin Bleed (${weatherTelemetry.dimensionalBleedTelemetry.activeBridgesCount} Bridges)`
                  : `Schism Cleave (${weatherTelemetry.dimensionalBleedTelemetry.activeSchismShardsCount} Shards)`}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-amber-300 shrink-0">
                Aesthetic Stage {weatherTelemetry.dimensionalBleedTelemetry.aestheticEvolutionStage.toFixed(1)}
              </span>
            </div>
          </div>
        )}

        {/* Floating Interdimensional Periodic Assay HUD */}
        {isAssayHUDOpen && activeOverlay === 'none' && (
          <div className="absolute top-14 left-4 z-20">
            <InterdimensionalAssayHUD
              dimIndex={dimIndex}
              onChangeDimension={handleDimensionChange}
              onShiftRandomDimension={handleShiftRandomDimension}
            />
          </div>
        )}

        {/* Floating 5D Gravity Vehicle ("Aether-Rider") Flight Telemetry HUD */}
        {isVehicleHUDOpen && activeOverlay === 'none' && vehicleTelemetry && (
          <div className="absolute top-14 right-4 z-20">
            <GravityVehicleFlightHUD
              vehicleState={vehicleTelemetry}
              onMountToggle={() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyG' }));
              }}
              onTriggerCosmicShift={() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyR' }));
              }}
              activeCosmologyTitle={resolveCosmologyForDimension(dimIndex).title}
            />
          </div>
        )}

        {/* Contextual Spatial Prompt Pill (Appears only when inside the Walk-In Void Sphere or in Build Mode) */}
        {(weatherTelemetry?.structuralTelemetry?.isInsideVoidBall ||
          activeTool === 'place-building') &&
          activeOverlay === 'none' && (
            <div
              style={{ opacity: gameOptions.hudOpacity }}
              className="pointer-events-auto absolute bottom-20 inset-x-4 z-10 max-w-2xl mx-auto bg-slate-950/94 border border-cyan-400/30 rounded-2xl px-4 py-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {weatherTelemetry?.structuralTelemetry?.isInsideVoidBall
                      ? weatherTelemetry.structuralTelemetry.focusedStationTitle
                      : `3D BIM Projection · ${activeBuildingPreset.name} (${
                          weatherTelemetry?.structuralTelemetry
                            ?.constructionStageLabel ?? 'Full 5-System Assembly'
                        })`}
                  </div>
                  <div className="text-[11px] text-amber-300 truncate">
                    {weatherTelemetry?.structuralTelemetry?.isInsideVoidBall
                      ? weatherTelemetry.structuralTelemetry
                          .focusedStationActionHint
                      : 'Click or Press B to sinter structure onto terrain · Press E to level bedrock'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono-tabular text-[11px] text-slate-300 shrink-0">
                <span>
                  Bearing{' '}
                  <strong className="text-emerald-300">
                    {weatherTelemetry?.structuralTelemetry?.soilBearingKPa ??
                      340}
                    kPa
                  </strong>
                </span>
                <span>·</span>
                <span>
                  Integrity{' '}
                  <strong className="text-cyan-300">
                    {weatherTelemetry?.structuralTelemetry
                      ?.structuralIntegrityPct ?? 92}
                    %
                  </strong>
                </span>
                <button
                  onClick={() => setActiveOverlay('void-inner-sanctuary')}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/25 hover:bg-purple-500/40 text-purple-200 border border-purple-400/30 transition-colors cursor-pointer"
                >
                  CAD Grid
                </button>
              </div>
            </div>
          )}

        {/* Center Modal / Drawer Overlay with Living Biodepth Backdrop Art */}
        {activeOverlay !== 'none' && (
          <div
            onClick={() => setActiveOverlay('none')}
            className="pointer-events-auto absolute inset-0 z-20 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-hidden"
          >
            <BiodepthInteractiveCanvasBackground
              boundaryId={biodepthConfig.activeUniverseBoundary}
              intensity={0.85}
            />
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-6xl h-[82vh] flex flex-col"
            >
              <button
                onClick={() => setActiveOverlay('none')}
                className="absolute top-3.5 right-3.5 z-30 p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Close Panel (Esc)"
              >
                <X className="w-4 h-4" />
              </button>

              {activeOverlay === 'somatic-options' ? (
                <OpticCalibrationMenuModal
                  options={gameOptions}
                  onUpdateOptions={setGameOptions}
                  onResetDefaults={() => setGameOptions(DEFAULT_GAME_OPTIONS)}
                  playableCharacter={currentWorld.playableCharacter}
                  onRequestPointerLockNow={() => {
                    setActiveOverlay('none');
                    setPointerLockRequestCount((c) => c + 1);
                  }}
                  biodepthConfig={biodepthConfig}
                  onUpdateBiodepthConfig={setBiodepthConfig}
                />
              ) : activeOverlay === 'evolutionary-mod-menu' ? (
                <EvolutionaryModMenuModal
                  currentWorld={currentWorld}
                  entityTelemetry={entityTelemetry}
                  lineageArchive={lineageArchive}
                  frontierComplexes={frontierComplexes}
                  caveNestComplexes={caveNestComplexes}
                  fertilizedFloraPatches={fertilizedFloraPatches}
                  goreGenreOverride={goreGenreOverride}
                  onChangeGoreGenreOverride={setGoreGenreOverride}
                  evolutionSpeedMultiplier={evolutionarySpeedMultiplier}
                  onChangeEvolutionSpeedMultiplier={
                    setEvolutionarySpeedMultiplier
                  }
                  globalRagdollActive={globalRagdollActive}
                  onToggleGlobalRagdoll={() =>
                    setGlobalRagdollActive((prev) => !prev)
                  }
                  onSpawnEntityFromBlueprint={handleSpawnFromBlueprint}
                  onForceSpawnFrontierComplex={handleSpawnFrontierComplexManual}
                  onUpgradeTechHusbandryAll={() => {
                    frontierComplexes.forEach((fc) =>
                      handleAdvanceHusbandryTechLevel(fc.id)
                    );
                  }}
                  onTriggerOrganizedPredatorRaid={() =>
                    handleSpawnPredatorRaid('laceration-hemorrhage')
                  }
                  onForceSpawnCaveNest={handleExcavateCaveNestManual}
                  onForceDefecationFloraBloom={handleDepositFloraPatchManual}
                  onTriggerComplexGoreSynergy={(modality) => {
                    handleSpawnPredatorRaid(modality);
                    setShockwaveTriggerCount((c) => c + 1);
                  }}
                />
              ) : activeOverlay === 'void-hand-inventory' ||
                activeOverlay === 'void-inner-sanctuary' ? (
                <VoidBallSanctuaryModal
                  mode={
                    activeOverlay === 'void-inner-sanctuary'
                      ? 'inner-void-sanctuary'
                      : 'hand-inventory'
                  }
                  onSwitchMode={(m) =>
                    setActiveOverlay(
                      m === 'inner-void-sanctuary'
                        ? 'void-inner-sanctuary'
                        : 'void-hand-inventory'
                    )
                  }
                  onClose={() => setActiveOverlay('none')}
                  playableCharacter={currentWorld.playableCharacter}
                  inventory={inventory}
                  buildingPresets={buildingPresets}
                  activePresetId={activePresetId}
                  onSelectActivePreset={(id) => setActivePresetId(id)}
                  onSaveNewBuildingPreset={(preset) =>
                    setBuildingPresets((prev) => [preset, ...prev])
                  }
                  onDeleteBuildingPreset={(id) =>
                    setBuildingPresets((prev) =>
                      prev.filter((p) => p.id !== id)
                    )
                  }
                  onCraftRecipe={handleCraftRecipe}
                  gameVersionArchive={gameVersionArchive}
                  activeVersionId={activeVersionId}
                  onTeleportToNewDimension={handleGenerateNewWorld}
                  onTeleportToSavedGameVersion={handleSelectGameVersion}
                />
              ) : activeOverlay === 'node-4d' ? (
                <Node4DGraphPanel
                  nodes={nodes4D}
                  edges={edges4D}
                  wCoord={wCoord}
                  autoOscillateW={autoOscillateW}
                  evaluationOutput={behaviorEval}
                  onChangeWCoord={(w) => {
                    setAutoOscillateW(false);
                    setWCoord(w);
                  }}
                  onToggleAutoOscillateW={() =>
                    setAutoOscillateW((prev) => !prev)
                  }
                  onUpdateNode={handleUpdateNode}
                  onAddNode={handleAddNode}
                  onDeleteNode={handleDeleteNode}
                  onLoadPreset={handleLoadPreset}
                  onTriggerShockwave={() =>
                    setShockwaveTriggerCount((c) => c + 1)
                  }
                  onToggleGlobalRagdoll={() =>
                    setGlobalRagdollActive((prev) => !prev)
                  }
                  globalRagdollActive={globalRagdollActive}
                  foreroomsTelemetry={
                    weatherTelemetry?.foreroomsTelemetry ?? null
                  }
                  foreroomsDispositionOverride={foreroomsDispositionOverride}
                  onChangeForeroomsDisposition={setForeroomsDispositionOverride}
                  favoritedManifolds={favoritedManifolds}
                  gameVersionArchive={gameVersionArchive}
                  activeVersionId={activeVersionId}
                  novelEvents={novelEvents}
                  onSelectGameVersion={handleSelectGameVersion}
                  onJumpToInterstitialOrigin={handleJumpToInterstitialOrigin}
                  onManifestInterstitialInWorld={
                    handleManifestInterstitialInWorld
                  }
                  onCondense5DMatterToFoundation={
                    handleCondense5DMatterToFoundation
                  }
                />
              ) : (
                <ManifoldSynthesizerDrawer
                  currentWorld={currentWorld}
                  worldHistory={gameVersionArchive.map((v) => v.world)}
                  gameVersionArchive={gameVersionArchive}
                  activeVersionId={activeVersionId}
                  onSelectGameVersion={handleSelectGameVersion}
                  favoritedManifolds={favoritedManifolds}
                  onToggleFavoriteManifold={handleToggleFavoriteManifold}
                  onRemoveFavoriteManifold={handleRemoveFavoriteManifold}
                  onRestoreFromFavoriteAnchor={handleRestoreFromFavoriteAnchor}
                  onJumpToExactSeed={handleJumpToExactSeed}
                  entityTelemetry={entityTelemetry}
                  selectedEntityId={selectedEntityId}
                  onSelectEntity={(id) => setSelectedEntityId(id)}
                  entitySnapshots={entitySnapshots}
                  onCaptureEntitySnapshot={handleCaptureEntitySnapshot}
                  onRestoreFromSnapshot={handleRestoreFromSnapshot}
                  onDeleteSnapshot={handleDeleteSnapshot}
                  onClearAllSnapshots={handleClearAllSnapshots}
                  activeTab={
                    activeOverlay === 'synthesizer-entities'
                      ? 'entities'
                      : 'worlds'
                  }
                  onSetTab={(tab) =>
                    setActiveOverlay(
                      tab === 'entities'
                        ? 'synthesizer-entities'
                        : 'synthesizer-worlds'
                    )
                  }
                  onGenerateNewWorld={handleGenerateNewWorld}
                  onSelectWorldFromHistory={(w) => {
                    const match = gameVersionArchive.find(
                      (v) => v.world.id === w.id
                    );
                    if (match) handleSelectGameVersion(match);
                  }}
                  onSpawnEntityFromBlueprint={handleSpawnFromBlueprint}
                  onSynthesizeCustomEntity={handleSynthesizeCustomEntity}
                  onApplyEntityImpulse={(id) => setImpulseTargetEntityId(id)}
                  onClearAndRepopulateEntities={() =>
                    setRepopulateTriggerCount((c) => c + 1)
                  }
                  strainHeatmapEnabled={strainHeatmapEnabled}
                  onToggleStrainHeatmap={() =>
                    setStrainHeatmapEnabled((prev) => !prev)
                  }
                  onApplyCharacterSkinTopology={handleApplyCharacterSkinTopology}
                  activeNoveltySeedId={activeNoveltySeedId}
                  onChangeNoveltySeed={setActiveNoveltySeedId}
                />
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
