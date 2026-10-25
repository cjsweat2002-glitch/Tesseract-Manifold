import React, { useState } from 'react';
import {
  ConceptualNoveltySeedId,
  DamageGoreModality,
  EcologicalDietRole,
  EntityBlueprint,
  EntityManifoldSnapshot,
  EntityMorphology,
  EntityRuntimeTelemetry,
  FavoritedManifoldAnchor,
  GeometryCarvingStyle,
  ManifoldGameVersionLog,
  ManifoldWorldSpec,
  PainPleasureNodeId,
  SkinTopologyStyle,
  WorldTopologyArchetype,
} from '../types/manifold';
import {
  harmonicSoundscape,
  PAIN_PLEASURE_VOCAL_NODES,
} from '../utils/harmonicSoundscapeEngine';
import {
  Anchor,
  Bookmark,
  Camera,
  History,
  Plus,
  RefreshCw,
  Star,
  Trash2,
  Zap,
  RotateCcw,
  BookOpen,
  Sparkles,
  Activity,
} from 'lucide-react';
import {
  forgeEntityBlueprintFromLexiconTriad,
  LEXICON_DICTIONARY_A_TO_Z,
  synthesizeLexiconTriad,
} from '../utils/lexiconOntologyEngine';
import {
  ALL_SKIN_TOPOLOGY_STYLES,
  resolveCharacterSkinTopology,
  SKIN_TOPOLOGY_CATALOG,
} from '../utils/skinTopologyEngine';
import {
  ALL_CONCEPTUAL_NOVELTY_SEEDS,
  CONCEPTUAL_NOVELTY_SEED_CATALOG,
} from '../utils/conceptualNoveltyEngine';

interface ManifoldSynthesizerDrawerProps {
  currentWorld: ManifoldWorldSpec;
  worldHistory: ManifoldWorldSpec[];
  gameVersionArchive: ManifoldGameVersionLog[];
  activeVersionId: string;
  onSelectGameVersion: (ver: ManifoldGameVersionLog) => void;
  favoritedManifolds: FavoritedManifoldAnchor[];
  onToggleFavoriteManifold: (
    ver: ManifoldGameVersionLog,
    anchorNote?: string
  ) => void;
  onRemoveFavoriteManifold: (anchorId: string) => void;
  onRestoreFromFavoriteAnchor: (anchor: FavoritedManifoldAnchor) => void;
  onJumpToExactSeed: (
    seed: number,
    preferredArchetype?: WorldTopologyArchetype
  ) => void;
  entityTelemetry: EntityRuntimeTelemetry[];
  selectedEntityId: string | null;
  onSelectEntity: (entityId: string) => void;
  entitySnapshots: EntityManifoldSnapshot[];
  onCaptureEntitySnapshot: (entityId: string) => void;
  onRestoreFromSnapshot: (snapshot: EntityManifoldSnapshot) => void;
  onDeleteSnapshot: (snapshotId: string) => void;
  onClearAllSnapshots: () => void;
  activeTab: 'worlds' | 'entities';
  onSetTab: (tab: 'worlds' | 'entities') => void;
  onGenerateNewWorld: (preferredArchetype?: WorldTopologyArchetype) => void;
  onSelectWorldFromHistory: (world: ManifoldWorldSpec) => void;
  onSpawnEntityFromBlueprint: (blueprint: EntityBlueprint, count?: number) => void;
  onSynthesizeCustomEntity: (
    morphology: EntityMorphology,
    carvingStyle: GeometryCarvingStyle,
    headStyle: EntityBlueprint['headStyle'],
    limbLength: number,
    baseStiffness: number,
    skinTopology?: SkinTopologyStyle,
    ecologicalRole?: EcologicalDietRole,
    specializedAttackDamage?: DamageGoreModality
  ) => void;
  onApplyEntityImpulse: (entityId: string) => void;
  onClearAndRepopulateEntities: () => void;
  strainHeatmapEnabled?: boolean;
  onToggleStrainHeatmap?: () => void;
  onApplyCharacterSkinTopology?: (style: SkinTopologyStyle) => void;
  activeNoveltySeedId?: ConceptualNoveltySeedId;
  onChangeNoveltySeed?: (seedId: ConceptualNoveltySeedId) => void;
}

const ARCHETYPE_LABELS: { id: WorldTopologyArchetype; label: string }[] = [
  { id: 'non-euclidean-spires', label: 'Non-Euclidean Spires' },
  { id: 'gyro-lattice-basin', label: 'Gyro-Lattice Basin' },
  { id: 'crystalline-hyper-mesa', label: 'Crystalline Hyper-Mesa' },
  { id: 'brutalist-pendulum-foundry', label: 'Brutalist Pendulum Foundry' },
  { id: 'biomech-coral-atoll', label: 'Biomech Coral Atoll' },
  { id: 'quantum-basalt-trench', label: 'Quantum Basalt Trench' },
];

export const ManifoldSynthesizerDrawer: React.FC<ManifoldSynthesizerDrawerProps> = ({
  currentWorld,
  worldHistory,
  gameVersionArchive,
  activeVersionId,
  onSelectGameVersion,
  favoritedManifolds,
  onToggleFavoriteManifold,
  onRemoveFavoriteManifold,
  onRestoreFromFavoriteAnchor,
  onJumpToExactSeed,
  entityTelemetry,
  selectedEntityId,
  onSelectEntity,
  entitySnapshots,
  onCaptureEntitySnapshot,
  onRestoreFromSnapshot,
  onDeleteSnapshot,
  onClearAllSnapshots,
  activeTab,
  onSetTab,
  onGenerateNewWorld,
  onSelectWorldFromHistory,
  onSpawnEntityFromBlueprint,
  onSynthesizeCustomEntity,
  onApplyEntityImpulse,
  onClearAndRepopulateEntities,
  strainHeatmapEnabled = false,
  onToggleStrainHeatmap,
  onApplyCharacterSkinTopology,
  activeNoveltySeedId = 'grunge-typography-graffiti-dirt',
  onChangeNoveltySeed,
}) => {
  const [selectedArchetype, setSelectedArchetype] = useState<
    WorldTopologyArchetype | 'random'
  >('random');
  const [epochSubTab, setEpochSubTab] = useState<'favorites' | 'history'>(
    'favorites'
  );
  const [anchorNoteInput, setAnchorNoteInput] = useState<string>('');
  const [customSeedInput, setCustomSeedInput] = useState<string>(() =>
    String(currentWorld.seed)
  );

  const activeGameVersionLog =
    gameVersionArchive.find((v) => v.id === activeVersionId) ??
    gameVersionArchive[0];

  const isCurrentWorldAnchored = favoritedManifolds.some(
    (fav) => fav.seed === currentWorld.seed
  );

  // Custom Entity Synthesizer state
  const [customMorphology, setCustomMorphology] =
    useState<EntityMorphology>('hexapod-arachnid');
  const [customCarving, setCustomCarving] =
    useState<GeometryCarvingStyle>('hyper-ringed');
  const [customHead, setCustomHead] =
    useState<EntityBlueprint['headStyle']>('gyro-core');
  const [customSkin, setCustomSkin] = useState<SkinTopologyStyle>(
    'chromatophore-pulsing-dermis'
  );
  const [customEcologicalRole, setCustomEcologicalRole] =
    useState<EcologicalDietRole>('hemophagic-stalker');
  const [customGoreAttack, setCustomGoreAttack] =
    useState<DamageGoreModality>('laceration-hemorrhage');
  const [customLimbLen, setCustomLimbLen] = useState<number>(1.35);
  const [customStiffness, setCustomStiffness] = useState<number>(0.82);

  // Active sub-view inside Entity Forge ('skin-topology' | 'lexicon' | 'forge' | 'snapshots')
  const [entitySubView, setEntitySubView] = useState<
    'skin-topology' | 'lexicon' | 'forge' | 'snapshots'
  >('skin-topology');
  const [inspectedSkinStyle, setInspectedSkinStyle] =
    useState<SkinTopologyStyle>('myofibril-striated-cuticle');
  const [inspectedSnapshotId, setInspectedSnapshotId] = useState<string | null>(
    null
  );

  // A-to-Z Combinatorial Lexicon Loom State (3 Word Slots: Foundation, Retrospection, Resolution)
  const [lexSlotA, setLexSlotA] = useState<number>(0); // A: Aphelion-Anamnesis
  const [lexSlotB, setLexSlotB] = useState<number>(12); // M: Mycelium-Monstrance
  const [lexSlotC, setLexSlotC] = useState<number>(21); // V: Vesper-Vitreous
  const [activeLexSlot, setActiveLexSlot] = useState<'A' | 'B' | 'C'>('A');

  const entryA =
    LEXICON_DICTIONARY_A_TO_Z[lexSlotA] ?? LEXICON_DICTIONARY_A_TO_Z[0];
  const entryB =
    LEXICON_DICTIONARY_A_TO_Z[lexSlotB] ?? LEXICON_DICTIONARY_A_TO_Z[12];
  const entryC =
    LEXICON_DICTIONARY_A_TO_Z[lexSlotC] ?? LEXICON_DICTIONARY_A_TO_Z[21];
  const activeCombinatorialLore = synthesizeLexiconTriad(
    entryA,
    entryB,
    entryC
  );

  const effectiveSelectedEntityId =
    selectedEntityId && entityTelemetry.some((e) => e.id === selectedEntityId)
      ? selectedEntityId
      : entityTelemetry[0]?.id ?? null;

  const selectedEntity =
    entityTelemetry.find((e) => e.id === effectiveSelectedEntityId) ?? null;

  const inspectedSnapshot =
    entitySnapshots.find((s) => s.id === inspectedSnapshotId) ??
    entitySnapshots[0] ??
    null;

  return (
    <div className="flex flex-col w-full h-full bg-slate-950/92 backdrop-blur-md border border-white/10 rounded-xl p-4 text-slate-100 overflow-hidden">
      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-white/10">
          <button
            onClick={() => onSetTab('worlds')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'worlds'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Manifold World Synthesizer
          </button>
          <button
            onClick={() => onSetTab('entities')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'entities'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            3D Entity & Ragdoll Rig Forge ({entityTelemetry.length})
          </button>
        </div>

        {activeTab === 'entities' ? (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-white/10">
              <button
                onClick={() => setEntitySubView('skin-topology')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                  entitySubView === 'skin-topology'
                    ? 'bg-emerald-400 text-slate-950 font-semibold'
                    : 'text-emerald-300 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Skin Topology & Dermis Lab
              </button>
              <button
                onClick={() => setEntitySubView('lexicon')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                  entitySubView === 'lexicon'
                    ? 'bg-cyan-400 text-slate-950 font-semibold'
                    : 'text-cyan-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                A–Z Lexicon Loom (26³)
              </button>
              <button
                onClick={() => setEntitySubView('forge')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                  entitySubView === 'forge'
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Live Rigs & Forge
              </button>
              <button
                onClick={() => setEntitySubView('snapshots')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                  entitySubView === 'snapshots'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Manifold Snapshots ({entitySnapshots.length})
              </button>
            </div>

            {effectiveSelectedEntityId && (
              <button
                onClick={() => {
                  onCaptureEntitySnapshot(effectiveSelectedEntityId);
                  setEntitySubView('snapshots');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                title="Capture a 3D viewport manifold snapshot of the currently selected entity"
              >
                <Camera className="w-3.5 h-3.5" />
                Capture Manifold Snapshot
              </button>
            )}
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono-tabular">
            <span>Seed #{currentWorld.seed}</span>
            <span>·</span>
            <span>Gravity {currentWorld.gravity} m/s²</span>
          </div>
        )}
      </div>

      {activeTab === 'worlds' ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto pr-1">
          {/* Column 1: Generate New World, Manifold Anchor & Seed Dial */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4 bg-slate-900/70 border border-white/10 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-medium text-amber-400">
                    Active Manifold Coordinate
                  </span>
                  <div className="font-mono-tabular text-xs text-slate-300">
                    Seed #{currentWorld.seed} · [{currentWorld.manifoldCoord.join(', ')}]
                  </div>
                </div>

                {/* Manifold Anchor Bookmark Button for Current World */}
                <button
                  onClick={() => {
                    if (activeGameVersionLog) {
                      onToggleFavoriteManifold(
                        activeGameVersionLog,
                        anchorNoteInput.trim() || undefined
                      );
                      setAnchorNoteInput('');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    isCurrentWorldAnchored
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                      : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border-amber-400/35'
                  }`}
                  title={
                    isCurrentWorldAnchored
                      ? 'This dimensional seed is bookmarked in Favorited Manifolds (click to unanchor)'
                      : 'Anchor this dimensional seed to your Favorited Manifolds list in localStorage'
                  }
                >
                  <Anchor className="w-3.5 h-3.5" />
                  {isCurrentWorldAnchored
                    ? `Anchored #${currentWorld.seed}`
                    : `Anchor Seed #${currentWorld.seed}`}
                </button>
              </div>

              {/* Optional Custom Anchor Note Input when bookmarking */}
              {!isCurrentWorldAnchored && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={anchorNoteInput}
                    onChange={(e) => setAnchorNoteInput(e.target.value)}
                    placeholder="Optional Manifold Anchor note (e.g. 'High Caustic Spires Oasis')..."
                    className="flex-1 bg-slate-950/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold font-display text-white">
                  {currentWorld.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentWorld.subtitle}
                </p>
                <div className="mt-2 p-2 rounded bg-slate-950/80 border border-white/5 space-y-1 text-xs">
                  <div className="text-emerald-400 font-medium">
                    Biology:{' '}
                    <span className="text-slate-300 font-normal">
                      {currentWorld.biologicalSignature}
                    </span>
                  </div>
                  <div className="text-cyan-400 font-medium">
                    Human Echo:{' '}
                    <span className="text-slate-300 font-normal">
                      {currentWorld.subtleHumanTrace}
                    </span>
                  </div>
                  <div className="text-purple-400 font-medium">
                    Playable Host:{' '}
                    <span className="text-white font-semibold">
                      {currentWorld.playableCharacter.name}
                    </span>{' '}
                    ({currentWorld.playableCharacter.title})
                  </div>
                  {currentWorld.lexiconLore && (
                    <div className="pt-1 border-t border-white/10 text-amber-300 font-medium">
                      Lexicon Triad (
                      {currentWorld.lexiconLore.triadWords.join(' × ')}):{' '}
                      <span className="text-slate-300 font-normal">
                        {currentWorld.lexiconLore.hypotheticalDepthNarrative}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-1 space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  Target Manifold Topology Archetype
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setSelectedArchetype('random')}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded border text-left truncate transition-colors cursor-pointer ${
                      selectedArchetype === 'random'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-950/60 border-white/10 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Stochastic 4D Jump
                  </button>
                  {ARCHETYPE_LABELS.map((arch) => (
                    <button
                      key={arch.id}
                      onClick={() => setSelectedArchetype(arch.id)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded border text-left truncate transition-colors cursor-pointer ${
                        selectedArchetype === arch.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-slate-950/60 border-white/10 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {arch.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2.5">
              {/* Direct Seed Coordinate Dial */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 flex-1 bg-slate-950/90 border border-white/10 rounded-lg px-2.5 py-1.5">
                  <span className="text-[11px] font-mono-tabular text-slate-400">
                    Seed #
                  </span>
                  <input
                    type="number"
                    value={customSeedInput}
                    onChange={(e) => setCustomSeedInput(e.target.value)}
                    placeholder="408291"
                    className="w-full bg-transparent text-xs font-mono-tabular text-white focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => {
                    const parsed = parseInt(customSeedInput, 10);
                    if (!Number.isNaN(parsed) && parsed > 0) {
                      onJumpToExactSeed(
                        parsed,
                        selectedArchetype === 'random'
                          ? undefined
                          : selectedArchetype
                      );
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-200 border border-cyan-400/35 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  title="Jump directly to this exact dimensional seed number"
                >
                  Dial Seed
                </button>
              </div>

              <button
                onClick={() =>
                  onGenerateNewWorld(
                    selectedArchetype === 'random'
                      ? undefined
                      : selectedArchetype
                  )
                }
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Synthesize New Manifold World & 3D Models
              </button>
            </div>
          </div>

          {/* Column 2: Unique 3D Structural Models Generated for This World */}
          <div className="lg:col-span-3 flex flex-col gap-3 bg-slate-900/70 border border-white/10 rounded-lg p-4">
            <div>
              <h4 className="text-xs font-semibold text-white font-display tracking-wide">
                World-Specific Procedural 3D Models
              </h4>
              <p className="text-xs text-slate-400">
                Synthesized directly from seed #{currentWorld.seed}
              </p>
            </div>

            <div className="space-y-2.5 flex-1">
              {currentWorld.propModels.map((prop, index) => (
                <div
                  key={prop.id}
                  className="p-2.5 rounded-lg bg-slate-950/80 border border-white/10 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white truncate">
                      0{index + 1}. {prop.name}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: prop.emissiveColor }}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono-tabular">
                    <span>{prop.radialSegments}-gon symmetry</span>
                    <span>·</span>
                    <span>{prop.ringCount} tiers</span>
                    <span>·</span>
                    <span>Twist {prop.twistAngle}rad</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Manifold Anchors (Favorited Manifolds) & Safe-Logged Epochs */}
          <div className="lg:col-span-4 flex flex-col gap-3 bg-slate-900/70 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-white/10 w-full">
                <button
                  onClick={() => setEpochSubTab('favorites')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    epochSubTab === 'favorites'
                      ? 'bg-amber-400 text-slate-950 font-semibold'
                      : 'text-amber-300 hover:text-white'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  Favorited Manifolds ({favoritedManifolds.length})
                </button>
                <button
                  onClick={() => setEpochSubTab('history')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    epochSubTab === 'history'
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  All Epochs ({gameVersionArchive.length})
                </button>
              </div>
            </div>

            {epochSubTab === 'favorites' ? (
              <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-80 pr-1">
                {favoritedManifolds.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-5 rounded-lg bg-slate-950/60 border border-dashed border-white/10 space-y-2">
                    <Anchor className="w-6 h-6 text-amber-400/70" />
                    <div className="text-xs font-semibold text-white">
                      No Manifold Anchors Bookmarked Yet
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Click <strong>Anchor Seed #{currentWorld.seed}</strong> on
                      the left or click the bookmark icon on any epoch to save
                      your favorite dimensional seeds in localStorage for
                      instant return.
                    </p>
                  </div>
                ) : (
                  favoritedManifolds.map((anchor) => {
                    const ver = anchor.versionLog;
                    const isActive = ver.world.seed === currentWorld.seed;
                    return (
                      <div
                        key={anchor.id}
                        className={`p-3 rounded-lg border transition-colors space-y-2 ${
                          isActive
                            ? 'bg-amber-500/15 border-amber-400'
                            : 'bg-slate-950/80 border-white/10 hover:border-amber-400/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-[10px] font-mono-tabular text-amber-400">
                              <Anchor className="w-3 h-3 shrink-0" />
                              <span>SEED #{anchor.seed}</span>
                              <span>·</span>
                              <span>{ver.versionCode}</span>
                            </div>
                            <div
                              style={{ fontFamily: ver.fontFamily }}
                              className="text-sm font-bold text-white truncate mt-0.5"
                            >
                              {ver.gameTitle}
                            </div>
                          </div>
                          <button
                            onClick={() => onRemoveFavoriteManifold(anchor.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                            title="Remove Manifold Anchor from Favorited Manifolds"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {anchor.anchorNote && (
                          <div className="px-2 py-1 rounded bg-amber-500/10 border border-amber-400/20 text-[11px] text-amber-200 italic">
                            “{anchor.anchorNote}”
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] font-mono-tabular text-slate-400">
                          <span>{ver.world.name}</span>
                          <span>
                            W={ver.wCoord >= 0 ? `+${ver.wCoord.toFixed(2)}` : ver.wCoord.toFixed(2)} ·{' '}
                            {ver.placedBuildings?.length ?? 0} bld
                          </span>
                        </div>

                        <button
                          onClick={() => onRestoreFromFavoriteAnchor(anchor)}
                          className={`w-full py-1.5 px-3 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/40'
                              : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                          }`}
                        >
                          {isActive
                            ? 'Active Dimension (Click to Reload Anchor State)'
                            : `Return to Seed #${anchor.seed}`}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto max-h-80 pr-1">
                {gameVersionArchive.map((ver) => {
                  const isCurrent = ver.id === activeVersionId;
                  const isAnchored = favoritedManifolds.some(
                    (f) => f.seed === ver.world.seed
                  );
                  return (
                    <div
                      key={ver.id}
                      className={`p-2.5 rounded-lg border transition-colors flex items-start justify-between gap-2 ${
                        isCurrent
                          ? 'bg-amber-500/15 border-amber-400 text-white'
                          : 'bg-slate-950/70 border-white/10 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <button
                        onClick={() => onSelectGameVersion(ver)}
                        className="flex-1 text-left min-w-0 cursor-pointer"
                      >
                        <div className="text-[10px] font-mono-tabular text-amber-400">
                          {ver.versionCode} · Seed #{ver.world.seed} ·{' '}
                          {ver.world.playableCharacter.name}
                        </div>
                        <div
                          style={{ fontFamily: ver.fontFamily }}
                          className="text-sm font-bold text-white truncate mt-0.5"
                        >
                          {ver.gameTitle}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {ver.meaningAndLore}
                        </div>
                      </button>

                      <button
                        onClick={() => onToggleFavoriteManifold(ver)}
                        className={`p-1.5 rounded-lg border transition-colors shrink-0 cursor-pointer ${
                          isAnchored
                            ? 'bg-amber-400 text-slate-950 border-amber-300'
                            : 'bg-slate-900 text-slate-400 hover:text-amber-300 border-white/10'
                        }`}
                        title={
                          isAnchored
                            ? 'Anchored in Favorited Manifolds (Click to remove)'
                            : 'Bookmark this dimensional seed to Favorited Manifolds'
                        }
                      >
                        <Star
                          className="w-3.5 h-3.5"
                          fill={isAnchored ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : entitySubView === 'skin-topology' ? (
        /* Researched Complex Character Mesh & Skin Topology Interaction Lab */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto pr-1">
          {/* Left 5 Columns: 6-Archetype Complex Skin Topology Library */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3 bg-slate-900/70 border border-white/10 rounded-lg p-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-semibold text-emerald-400 font-display tracking-wide uppercase">
                    6 Complex Dermal & Epidermal Topologies
                  </h4>
                  <p className="text-xs text-slate-400">
                    Quad-looped vertex deformation, wrinkle maps, subsurface scattering & piloerection
                  </p>
                </div>
                {onToggleStrainHeatmap && (
                  <button
                    onClick={onToggleStrainHeatmap}
                    className={`px-2.5 py-1 text-[11px] font-mono-tabular font-semibold rounded border transition-colors whitespace-nowrap cursor-pointer ${
                      strainHeatmapEnabled
                        ? 'bg-rose-500 text-white border-rose-300'
                        : 'bg-slate-950 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/15'
                    }`}
                    title="Visualize real-time vertex Tension (Cyan) vs Compression Wrinkle Folds (Crimson) across all 3D character and entity skins"
                  >
                    {strainHeatmapEnabled
                      ? 'Strain Heatmap: ON'
                      : 'Strain Heatmap: OFF'}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {ALL_SKIN_TOPOLOGY_STYLES.map((styleId) => {
                  const meta = SKIN_TOPOLOGY_CATALOG[styleId];
                  const isSel = inspectedSkinStyle === styleId;
                  const isCharActive =
                    resolveCharacterSkinTopology(
                      currentWorld.playableCharacter
                    ) === styleId;
                  return (
                    <button
                      key={styleId}
                      onClick={() => setInspectedSkinStyle(styleId)}
                      className={`text-left p-2 rounded-lg border transition-colors cursor-pointer ${
                        isSel
                          ? 'bg-emerald-500/15 border-emerald-400 text-white'
                          : 'bg-slate-950/80 border-white/10 text-slate-300 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold truncate">
                          {meta.label}
                        </span>
                        {isCharActive && (
                          <span className="text-[9px] font-mono-tabular px-1.5 py-0.5 rounded bg-emerald-500/25 text-emerald-300">
                            POV
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono-tabular text-slate-400 mt-0.5">
                        Clearcoat {Math.round(meta.clearcoat * 100)}% · Irid{' '}
                        {Math.round(meta.iridescence * 100)}%
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Detailed Breakdown of Selected Skin Topology */}
              {(() => {
                const meta = SKIN_TOPOLOGY_CATALOG[inspectedSkinStyle];
                return (
                  <div className="p-3 rounded-lg bg-slate-950/90 border border-emerald-500/25 space-y-1.5 text-xs">
                    <div className="font-semibold text-emerald-300">
                      {meta.label}
                    </div>
                    <p className="text-[11px] text-slate-200 leading-snug">
                      <span className="text-slate-400">Typographic & Dermal Basis:</span>{' '}
                      {meta.anatomicalBasis}
                    </p>
                    <p className="text-[11px] text-cyan-200/90 leading-snug">
                      <span className="text-slate-400">
                        Deformation & Ink-Trap Mechanic:
                      </span>{' '}
                      {meta.deformationMechanic}
                    </p>
                    <p className="text-[11px] text-amber-200/90 leading-snug">
                      <span className="text-slate-400">
                        Topological Graffiti-Dirt Contrast:
                      </span>{' '}
                      {meta.surfaceMicrostructure}
                    </p>
                  </div>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10">
              {onApplyCharacterSkinTopology && (
                <button
                  onClick={() =>
                    onApplyCharacterSkinTopology(inspectedSkinStyle)
                  }
                  className="py-2 px-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Graft onto Playable Character
                </button>
              )}
              <button
                onClick={() =>
                  onSynthesizeCustomEntity(
                    customMorphology,
                    customCarving,
                    customHead,
                    customLimbLen,
                    customStiffness,
                    inspectedSkinStyle
                  )
                }
                className="py-2 px-3 bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-200 border border-cyan-500/40 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                + Spawn Entity with Dermis
              </button>
            </div>
          </div>

          {/* Right 7 Columns: Live 6-Axis Skin Topology & Biomechanical Strain Telemetry */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-3 bg-slate-900/70 border border-white/10 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <div>
                  <span className="text-[11px] font-mono-tabular text-emerald-400 uppercase tracking-wider">
                    Live Epidermal & Sub-Dermal Telemetry
                  </span>
                  <h3 className="text-base font-bold font-display text-white mt-0.5">
                    {selectedEntity
                      ? `${selectedEntity.name} — ${
                          selectedEntity.skinTelemetry?.styleLabel ??
                          'Complex Dermis'
                        }`
                      : `Playable Explorer (${currentWorld.playableCharacter.name})`}
                  </h3>
                </div>
                {selectedEntity?.skinTelemetry && (
                  <span className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono-tabular text-emerald-300">
                    {selectedEntity.skinTelemetry.activeDermalInteraction}
                  </span>
                )}
              </div>

              {/* Entity Selector Pills for Live Dermal Inspection */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {entityTelemetry.map((ent) => {
                  const isSel = ent.id === effectiveSelectedEntityId;
                  return (
                    <button
                      key={ent.id}
                      onClick={() => onSelectEntity(ent.id)}
                      className={`px-2.5 py-1 rounded text-xs font-mono-tabular whitespace-nowrap border transition-colors cursor-pointer ${
                        isSel
                          ? 'bg-amber-500 text-slate-950 font-semibold border-amber-400'
                          : 'bg-slate-950/80 text-slate-300 border-white/10 hover:text-white'
                      }`}
                    >
                      {ent.name}
                    </button>
                  );
                })}
              </div>

              {/* 6-Axis Real-Time Skin Deformation Gauges */}
              {(() => {
                const st = selectedEntity?.skinTelemetry ?? {
                  style: inspectedSkinStyle,
                  styleLabel: SKIN_TOPOLOGY_CATALOG[inspectedSkinStyle].label,
                  epidermalTensionStrain: 0.42,
                  compressionWrinkleDepth: 0.38,
                  myofibrilBulgeRatio: 0.54,
                  subsurfaceVascularFlush: 0.61,
                  piloerectionScaleFlare: 0.29,
                  chromatophoreWaveHz: 3.2,
                  activeDermalInteraction: 'Harmonic Resting Tonus',
                };
                const metrics = [
                  {
                    label: 'Epidermal Tension Strain (Outer Curve Stretch)',
                    val: st.epidermalTensionStrain,
                    barColor: 'bg-cyan-400',
                    textColor: 'text-cyan-300',
                  },
                  {
                    label: 'Compression Wrinkle Depth (Inner Joint Accordion)',
                    val: st.compressionWrinkleDepth,
                    barColor: 'bg-rose-400',
                    textColor: 'text-rose-300',
                  },
                  {
                    label: 'Myofibril Sarcomere Bulge (Muscle Belly Volume)',
                    val: st.myofibrilBulgeRatio,
                    barColor: 'bg-amber-400',
                    textColor: 'text-amber-300',
                  },
                  {
                    label: 'Subsurface Vascular Ichor Flush (SSS Capillary Glow)',
                    val: st.subsurfaceVascularFlush,
                    barColor: 'bg-emerald-400',
                    textColor: 'text-emerald-300',
                  },
                  {
                    label: 'Piloerection / Piezo-Scale Flare (Wind & Shock Bristle)',
                    val: st.piloerectionScaleFlare,
                    barColor: 'bg-purple-400',
                    textColor: 'text-purple-300',
                  },
                ];

                return (
                  <div className="space-y-2.5 bg-slate-950/85 border border-white/10 rounded-lg p-3">
                    {metrics.map((m) => (
                      <div key={m.label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono-tabular">
                          <span className="text-slate-300">{m.label}</span>
                          <span className={`font-semibold ${m.textColor}`}>
                            {Math.round(m.val * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${m.barColor} transition-all duration-150`}
                            style={{
                              width: `${Math.min(100, Math.round(m.val * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="pt-1.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tabular text-slate-300">
                      <span>
                        Chromatophore Turing Wave:{' '}
                        <strong className="text-cyan-300">
                          {st.chromatophoreWaveHz} Hz
                        </strong>
                      </span>
                      <span>
                        Playable Character Dermis:{' '}
                        <strong className="text-emerald-300">
                          {
                            SKIN_TOPOLOGY_CATALOG[
                              resolveCharacterSkinTopology(
                                currentWorld.playableCharacter
                              )
                            ].label
                          }
                        </strong>
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Internal Visceral Gore, Predator Ecology & Somatic Pain/Pleasure Vocalization Inspector */}
              {(() => {
                const dmg = selectedEntity?.internalDamage;
                const vocalNodeList = Object.values(PAIN_PLEASURE_VOCAL_NODES);
                return (
                  <div className="p-3 rounded-lg bg-slate-950/95 border border-rose-500/35 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-mono-tabular text-rose-400 font-semibold uppercase tracking-wider">
                          Internal Visceral Trauma, Gore & Predator Ecology
                        </span>
                        <div className="text-xs font-bold text-white mt-0.5">
                          {dmg
                            ? `${dmg.ecologicalRole.toUpperCase()} · Gore State: ${dmg.dominantGoreType}`
                            : 'Select an entity to inspect internal organ integrity & arterial bleed'}
                        </div>
                      </div>
                      {dmg && (
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-mono-tabular font-semibold border ${
                            dmg.painPleasureGradient < -0.15
                              ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                              : dmg.painPleasureGradient > 0.15
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                              : 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          }`}
                        >
                          {dmg.activeVocalNodeLabel} (Valence{' '}
                          {dmg.painPleasureGradient >= 0
                            ? `+${dmg.painPleasureGradient.toFixed(2)}`
                            : dmg.painPleasureGradient.toFixed(2)}
                          )
                        </span>
                      )}
                    </div>

                    {dmg && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-tabular">
                        <div className="p-2 rounded bg-slate-900/90 border border-white/10">
                          <div className="text-[10px] text-slate-400">
                            INTERNAL INTEGRITY
                          </div>
                          <div className="text-sm font-bold text-emerald-300 mt-0.5">
                            {Math.round(dmg.structuralHealth * 100)}%
                          </div>
                        </div>
                        <div className="p-2 rounded bg-slate-900/90 border border-white/10">
                          <div className="text-[10px] text-slate-400">
                            ARTERIAL BLEED
                          </div>
                          <div className="text-sm font-bold text-rose-400 mt-0.5">
                            {(dmg.activeBleedRate * 10).toFixed(1)} mL/s
                          </div>
                        </div>
                        <div className="p-2 rounded bg-slate-900/90 border border-white/10">
                          <div className="text-[10px] text-slate-400">
                            VISCERA EXPOSURE
                          </div>
                          <div className="text-sm font-bold text-amber-300 mt-0.5">
                            {Math.round(dmg.exposedVisceraRatio * 100)}%
                          </div>
                        </div>
                        <div className="p-2 rounded bg-slate-900/90 border border-white/10">
                          <div className="text-[10px] text-slate-400">
                            SEVERED TENDONS
                          </div>
                          <div className="text-sm font-bold text-purple-300 mt-0.5">
                            {dmg.severedTendonsCount} ·{' '}
                            {dmg.predatorTargetName
                              ? `Hunts ${dmg.predatorTargetName}`
                              : 'No Prey Lock'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Somatic Pain / Pleasure Gradient Acoustic Node Soundboard */}
                    <div className="pt-1.5 border-t border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono-tabular text-slate-300">
                        <span>
                          Audition Somatic Pain / Pleasure Formant Vocalizations:
                        </span>
                        <span className="text-rose-300">
                          WebAudio Formant Tract Synth
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {vocalNodeList.map((nodeMeta) => {
                          const midValence = Number(
                            (
                              (nodeMeta.gradientRange[0] +
                                nodeMeta.gradientRange[1]) *
                              0.5
                            ).toFixed(2)
                          );
                          const isCurrentNode =
                            dmg?.activeVocalNodeLabel === nodeMeta.label;
                          return (
                            <button
                              key={nodeMeta.id}
                              onClick={() => {
                                harmonicSoundscape.setEnabled(true);
                                harmonicSoundscape.triggerPainPleasureVocalization(
                                  {
                                    painPleasureGradient: midValence,
                                    goreType:
                                      dmg?.dominantGoreType ??
                                      'laceration-hemorrhage',
                                    creatureMass: 78,
                                    distanceToListener: 4,
                                  }
                                );
                              }}
                              className={`text-left px-2 py-1.5 rounded border text-[11px] transition-colors cursor-pointer ${
                                isCurrentNode
                                  ? 'bg-rose-500/25 border-rose-400 text-white font-semibold'
                                  : midValence >= 0
                                  ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-200 hover:bg-emerald-900/60'
                                  : 'bg-rose-950/50 border-rose-500/30 text-rose-200 hover:bg-rose-900/60'
                              }`}
                              title={nodeMeta.acousticDescription}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="truncate">{nodeMeta.label}</span>
                                <span className="font-mono-tabular text-[10px] opacity-80">
                                  {midValence >= 0
                                    ? `+${midValence}`
                                    : midValence}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 6 Active Conceptual Novelty Seeds (Behavior · 3D Modelling · Visual Boundaries) */}
              {(() => {
                const activeSeed =
                  CONCEPTUAL_NOVELTY_SEED_CATALOG[activeNoveltySeedId];
                return (
                  <div className="p-3 rounded-lg bg-slate-950/90 border border-amber-500/30 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-mono-tabular text-amber-400 font-semibold">
                          Conceptual Novelty Seed Engine · Active Worldspace Mutator
                        </span>
                        <div className="text-xs font-bold text-white">
                          {activeSeed.glyphSymbol} {activeSeed.title}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono-tabular text-slate-400">
                        {activeSeed.promptOriginLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {ALL_CONCEPTUAL_NOVELTY_SEEDS.map((seed) => {
                        const isAct = seed.id === activeNoveltySeedId;
                        return (
                          <button
                            key={seed.id}
                            onClick={() => onChangeNoveltySeed?.(seed.id)}
                            className={`text-left px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                              isAct
                                ? 'bg-amber-400/20 border-amber-400 text-white font-semibold'
                                : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-white/25'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="truncate">{seed.title}</span>
                              <span
                                className="font-mono-tabular text-[10px]"
                                style={{ color: seed.accentHex }}
                              >
                                {seed.glyphSymbol}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                      <div className="p-2 rounded bg-slate-900/90 border border-white/5">
                        <div className="font-mono-tabular text-amber-300 font-semibold">
                          1. Behavior Mutation
                        </div>
                        <div className="text-white font-medium mt-0.5">
                          {activeSeed.behaviorMutation.name}
                        </div>
                        <p className="text-slate-400 mt-0.5 leading-snug">
                          {activeSeed.behaviorMutation.description}
                        </p>
                      </div>
                      <div className="p-2 rounded bg-slate-900/90 border border-white/5">
                        <div className="font-mono-tabular text-cyan-300 font-semibold">
                          2. 3D Modelling Form
                        </div>
                        <div className="text-white font-medium mt-0.5">
                          {activeSeed.modellingMutation.name}
                        </div>
                        <p className="text-slate-400 mt-0.5 leading-snug">
                          {activeSeed.modellingMutation.description}
                        </p>
                      </div>
                      <div className="p-2 rounded bg-slate-900/90 border border-white/5">
                        <div className="font-mono-tabular text-purple-300 font-semibold">
                          3. Visual Boundary Seam
                        </div>
                        <div className="text-white font-medium mt-0.5">
                          {activeSeed.visualBoundaryMutation.name}
                        </div>
                        <p className="text-slate-400 mt-0.5 leading-snug">
                          {activeSeed.visualBoundaryMutation.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {selectedEntity && (
              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  onClick={() => onApplyEntityImpulse(selectedEntity.id)}
                  className="px-3 py-2 text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/35 text-rose-200 border border-rose-500/40 rounded-lg transition-colors cursor-pointer"
                >
                  Trigger Impact Piloerection & Wrinkle Spike
                </button>
                <button
                  onClick={() => {
                    onCaptureEntitySnapshot(selectedEntity.id);
                    setEntitySubView('snapshots');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Snapshot Dermal State
                </button>
              </div>
            )}
          </div>
        </div>
      ) : entitySubView === 'lexicon' ? (
        /* A–Z Ontological Lexicon & Retrospective Combinatorial Synthesis Loom */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto pr-1">
          {/* Left 5 Cols: Complete A-to-Z Dictionary Matrix Selector */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3 bg-slate-900/70 border border-white/10 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white font-display tracking-wide">
                    A–Z Ontological Dictionary Matrix
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Select any 3 letters to weave their retrospective depth & 3D entity anatomy
                  </p>
                </div>
                <button
                  onClick={() => {
                    const len = LEXICON_DICTIONARY_A_TO_Z.length;
                    const a = Math.floor(Math.random() * len);
                    const b = (a + 3 + Math.floor(Math.random() * (len - 6))) % len;
                    const c = (b + 5 + Math.floor(Math.random() * (len - 8))) % len;
                    setLexSlotA(a);
                    setLexSlotB(b);
                    setLexSlotC(c);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-200 border border-cyan-500/30 rounded-md transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Random Triad
                </button>
              </div>

              {/* 3 Word Slot Selector Pills */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setActiveLexSlot('A')}
                  className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                    activeLexSlot === 'A'
                      ? 'bg-amber-500/20 border-amber-400 text-white'
                      : 'bg-slate-950/70 border-white/10 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="text-[10px] font-mono-tabular text-amber-400">
                    I. FOUNDATION [{entryA.letter}]
                  </div>
                  <div className="text-xs font-bold truncate mt-0.5">
                    {entryA.word}
                  </div>
                </button>

                <button
                  onClick={() => setActiveLexSlot('B')}
                  className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                    activeLexSlot === 'B'
                      ? 'bg-cyan-500/20 border-cyan-400 text-white'
                      : 'bg-slate-950/70 border-white/10 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="text-[10px] font-mono-tabular text-cyan-400">
                    II. RETROSPECT [{entryB.letter}]
                  </div>
                  <div className="text-xs font-bold truncate mt-0.5">
                    {entryB.word}
                  </div>
                </button>

                <button
                  onClick={() => setActiveLexSlot('C')}
                  className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                    activeLexSlot === 'C'
                      ? 'bg-purple-500/20 border-purple-400 text-white'
                      : 'bg-slate-950/70 border-white/10 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="text-[10px] font-mono-tabular text-purple-400">
                    III. RESOLUTION [{entryC.letter}]
                  </div>
                  <div className="text-xs font-bold truncate mt-0.5">
                    {entryC.word}
                  </div>
                </button>
              </div>

              {/* 26-Letter Alphabetical Grid */}
              <div className="grid grid-cols-6 sm:grid-cols-9 gap-1">
                {LEXICON_DICTIONARY_A_TO_Z.map((item, idx) => {
                  const isA = idx === lexSlotA;
                  const isB = idx === lexSlotB;
                  const isC = idx === lexSlotC;
                  return (
                    <button
                      key={item.letter}
                      onClick={() => {
                        if (activeLexSlot === 'A') {
                          setLexSlotA(idx);
                          setActiveLexSlot('B');
                        } else if (activeLexSlot === 'B') {
                          setLexSlotB(idx);
                          setActiveLexSlot('C');
                        } else {
                          setLexSlotC(idx);
                          setActiveLexSlot('A');
                        }
                      }}
                      title={`${item.letter}: ${item.word} (${item.etymologyDomain}) — ${item.coreDefinition}`}
                      className={`py-1.5 px-1 rounded border text-center font-mono-tabular text-xs font-bold transition-colors cursor-pointer ${
                        isA
                          ? 'bg-amber-500 text-slate-950 border-amber-300'
                          : isB
                          ? 'bg-cyan-400 text-slate-950 border-cyan-200'
                          : isC
                          ? 'bg-purple-500 text-white border-purple-300'
                          : 'bg-slate-950/80 text-slate-300 border-white/10 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {item.letter}
                    </button>
                  );
                })}
              </div>

              {/* Individual Word Definitions for the Selected Triad */}
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {[
                  { role: 'I. Foundation', entry: entryA, color: 'text-amber-400' },
                  { role: 'II. Retrospect', entry: entryB, color: 'text-cyan-400' },
                  { role: 'III. Resolution', entry: entryC, color: 'text-purple-400' },
                ].map(({ role, entry, color }) => (
                  <div
                    key={role}
                    className="p-2 rounded bg-slate-950/80 border border-white/10 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${color}`}>
                        {role}: {entry.word}
                      </span>
                      <span className="text-[10px] font-mono-tabular text-slate-400">
                        {entry.etymologyDomain}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                      {entry.coreDefinition}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Retrospective Combinatorial Narrative, 3D Visual Genome & Direct Manifestation */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-4 bg-slate-900/70 border border-white/10 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <div>
                  <span className="text-[11px] font-mono-tabular text-cyan-400 uppercase tracking-wider">
                    Combinatorial Retrospection [{entryA.letter} ⊗ {entryB.letter} ⊗ {entryC.letter}]
                  </span>
                  <h3 className="text-lg font-bold font-display text-white mt-0.5">
                    {activeCombinatorialLore.synthesizedTitle}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20"
                    style={{ backgroundColor: entryA.primaryHex }}
                    title={`Primary: ${entryA.primaryHex}`}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20"
                    style={{ backgroundColor: entryB.secondaryHex }}
                    title={`Secondary: ${entryB.secondaryHex}`}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20"
                    style={{ backgroundColor: entryC.glowHex }}
                    title={`Bioluminescent Joint/Oculus: ${entryC.glowHex}`}
                  />
                </div>
              </div>

              {/* Hypothetical Depth & Story Potential Narrative */}
              <div className="p-3 rounded-lg bg-slate-950/85 border border-cyan-500/20 space-y-2">
                <div className="text-xs font-semibold text-amber-300">
                  Hypothetical Depth & Retrospective Story
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {activeCombinatorialLore.hypotheticalDepthNarrative}
                </p>
                <p className="text-[11px] text-cyan-300/90 font-mono-tabular leading-relaxed pt-1 border-t border-white/10">
                  {activeCombinatorialLore.retrospectiveDialectic}
                </p>
              </div>

              {/* 3D Visual Engine & Anatomical Apparatus Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/75 border border-white/10">
                  <div className="text-[10px] font-mono-tabular text-slate-400">
                    3D SKELETAL MORPHOLOGY
                  </div>
                  <div className="font-semibold text-white mt-0.5">
                    {entryA.preferredMorphology}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/75 border border-white/10">
                  <div className="text-[10px] font-mono-tabular text-slate-400">
                    CARVING & RELIEF
                  </div>
                  <div className="font-semibold text-white mt-0.5">
                    {entryB.preferredCarving}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/75 border border-white/10">
                  <div className="text-[10px] font-mono-tabular text-slate-400">
                    CRANIAL OCULUS
                  </div>
                  <div className="font-semibold text-white mt-0.5">
                    {entryC.preferredHead}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/75 border border-white/10">
                  <div className="text-[10px] font-mono-tabular text-amber-400">
                    3D DORSAL APPARATUS
                  </div>
                  <div className="font-semibold text-white mt-0.5">
                    {entryA.dorsalApparatus}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/75 border border-white/10">
                  <div className="text-[10px] font-mono-tabular text-cyan-400">
                    3D CAUDAL / TAIL RIG
                  </div>
                  <div className="font-semibold text-white mt-0.5">
                    {entryB.tailApparatus}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/75 border border-white/10">
                  <div className="text-[10px] font-mono-tabular text-purple-400">
                    ORBITING AURA GLYPHS
                  </div>
                  <div className="font-semibold text-white mt-0.5">
                    {entryC.auraOrbit}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons: Spawn Lexicon Creature or Shift into Lexicon World */}
            <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  const forgedBp = forgeEntityBlueprintFromLexiconTriad(
                    currentWorld.id,
                    entryA,
                    entryB,
                    entryC
                  );
                  onSpawnEntityFromBlueprint(forgedBp, 1);
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Manifest Lexicon Entity in 3D Sandbox
              </button>

              <button
                onClick={() =>
                  onGenerateNewWorld(entryA.worldArchetypeAffinity)
                }
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 border border-amber-500/40 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Shift to [{entryA.letter}×{entryB.letter}×{entryC.letter}] Dimension
              </button>
            </div>
          </div>
        </div>
      ) : entitySubView === 'forge' ? (
        /* Entities & Ragdoll Forge Sub-View */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto pr-1">
          {/* Left: World's Native Entity Blueprints */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-3 bg-slate-900/70 border border-white/10 rounded-lg p-4">
            <div className="space-y-2.5">
              <div>
                <h4 className="text-xs font-semibold text-white font-display tracking-wide">
                  World Native 3D Entity Archetypes
                </h4>
                <p className="text-xs text-slate-400">
                  Unique multi-limb rigs generated for {currentWorld.name}
                </p>
              </div>

              {currentWorld.entityBlueprints.map((bp) => (
                <div
                  key={bp.id}
                  className="p-2.5 rounded-lg bg-slate-950/80 border border-white/10 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      {bp.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono-tabular">
                      {bp.morphology} · {bp.legCount} limbs · {bp.carvingStyle}
                    </div>
                  </div>
                  <button
                    onClick={() => onSpawnEntityFromBlueprint(bp, 1)}
                    className="px-2.5 py-1.5 text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-md whitespace-nowrap transition-colors cursor-pointer"
                  >
                    + Spawn
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={onClearAndRepopulateEntities}
              className="w-full py-2 px-3 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-white/10 transition-colors cursor-pointer"
            >
              Reset & Repopulate World Entities
            </button>
          </div>

          {/* Center: Custom Procedural 3D Entity Synthesizer */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-3 bg-slate-900/70 border border-white/10 rounded-lg p-4">
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-white font-display tracking-wide">
                  Custom 3D Entity Rig Synthesizer
                </h4>
                <p className="text-xs text-slate-400">
                  Configure skeletal topology, procedural mesh carving & P-D stiffness
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Skeletal Morphology
                  </label>
                  <select
                    value={customMorphology}
                    onChange={(e) =>
                      setCustomMorphology(e.target.value as EntityMorphology)
                    }
                    className="w-full bg-slate-950 border border-white/15 rounded-md px-2 py-1.5 text-xs text-white"
                  >
                    <option value="seraph-cantilever">Seraph Cantilever (Winged)</option>
                    <option value="reliquary-golem">Reliquary Golem (4 Limbs)</option>
                    <option value="mycelial-dryad">Mycelial Dryad (3 Limbs)</option>
                    <option value="abyssal-cetacean">Abyssal Cetacean</option>
                    <option value="biped-construct">Biped Construct (2 Legs)</option>
                    <option value="tri-gyro-walker">Tri-Gyro Walker (3 Legs)</option>
                    <option value="quadruped-strider">Quadruped Strider (4 Legs)</option>
                    <option value="hexapod-arachnid">Hexapod Arachnid (6 Legs)</option>
                    <option value="serpentine-leviathan">Serpentine Leviathan</option>
                    <option value="avian-tensor-raptor">Avian Tensor Raptor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    3D Mesh Carving Style
                  </label>
                  <select
                    value={customCarving}
                    onChange={(e) =>
                      setCustomCarving(e.target.value as GeometryCarvingStyle)
                    }
                    className="w-full bg-slate-950 border border-white/15 rounded-md px-2 py-1.5 text-xs text-white"
                  >
                    <option value="cathedral-ribbed">Cathedral Ribbed Vault</option>
                    <option value="nacre-filigree">Nacre Iridescent Filigree</option>
                    <option value="obsidian-reliquary">Obsidian Reliquary</option>
                    <option value="faceted-poly">Faceted Polyhedron</option>
                    <option value="hyper-ringed">Hyper-Ringed Toroid</option>
                    <option value="monolith-plate">Monolith Armor Plate</option>
                    <option value="lathe-turbine">Lathe Turbine</option>
                    <option value="tubular-exoskeleton">Tubular Exoskeleton</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 items-center">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Cranium Unit
                  </label>
                  <select
                    value={customHead}
                    onChange={(e) =>
                      setCustomHead(
                        e.target.value as EntityBlueprint['headStyle']
                      )
                    }
                    className="w-full bg-slate-950 border border-white/15 rounded-md px-2 py-1.5 text-xs text-white"
                  >
                    <option value="rose-window-oculus">Rose-Window Oculus</option>
                    <option value="antler-crown">Dendritic Antler Crown</option>
                    <option value="seraph-halo-mask">Seraph Halo Mask</option>
                    <option value="gyro-core">Gyro Core</option>
                    <option value="cyclops-prism">Cyclops Prism</option>
                    <option value="binaural-horn">Binaural Horn</option>
                    <option value="crowned-octa">Crowned Octa</option>
                    <option value="mandible-visor">Mandible Visor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Limb Span ({customLimbLen}m)
                  </label>
                  <input
                    type="range"
                    min={0.85}
                    max={1.85}
                    step={0.05}
                    value={customLimbLen}
                    onChange={(e) => setCustomLimbLen(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Stiffness ({Math.round(customStiffness * 100)}%)
                  </label>
                  <input
                    type="range"
                    min={0.15}
                    max={0.98}
                    step={0.03}
                    value={customStiffness}
                    onChange={(e) =>
                      setCustomStiffness(parseFloat(e.target.value))
                    }
                    className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-emerald-400 mb-1">
                    Complex Dermal Topology
                  </label>
                  <select
                    value={customSkin}
                    onChange={(e) =>
                      setCustomSkin(e.target.value as SkinTopologyStyle)
                    }
                    className="w-full bg-slate-950 border border-emerald-500/30 rounded-md px-2 py-1.5 text-xs text-white"
                  >
                    {ALL_SKIN_TOPOLOGY_STYLES.map((styleId) => (
                      <option key={styleId} value={styleId}>
                        {SKIN_TOPOLOGY_CATALOG[styleId].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-rose-400 mb-1">
                    Ecological Predator Role
                  </label>
                  <select
                    value={customEcologicalRole}
                    onChange={(e) =>
                      setCustomEcologicalRole(
                        e.target.value as EcologicalDietRole
                      )
                    }
                    className="w-full bg-slate-950 border border-rose-500/30 rounded-md px-2 py-1.5 text-xs text-white"
                  >
                    <option value="hemophagic-stalker">
                      Hemophagic Stalker (Blood Predator)
                    </option>
                    <option value="osteophagic-crusher">
                      Osteophagic Crusher (Marrow Predator)
                    </option>
                    <option value="viscera-siphon-leviathan">
                      Viscera-Siphon Leviathan
                    </option>
                    <option value="synaptic-parasite-raptor">
                      Synaptic Parasite Raptor
                    </option>
                    <option value="symbiont-grazer">Symbiont Grazer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-amber-400 mb-1">
                    Gore Attack Modality
                  </label>
                  <select
                    value={customGoreAttack}
                    onChange={(e) =>
                      setCustomGoreAttack(e.target.value as DamageGoreModality)
                    }
                    className="w-full bg-slate-950 border border-amber-500/30 rounded-md px-2 py-1.5 text-xs text-white"
                  >
                    <option value="laceration-hemorrhage">
                      Laceration Hemorrhage
                    </option>
                    <option value="hydrostatic-viscera-rupture">
                      Hydrostatic Viscera Rupture
                    </option>
                    <option value="corrosive-ichor-dissolution">
                      Corrosive Ichor Dissolution
                    </option>
                    <option value="calcified-marrow-shatter">
                      Calcified Marrow Shatter
                    </option>
                    <option value="neural-synapse-hemolysis">
                      Neural Synapse Hemolysis
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                onSynthesizeCustomEntity(
                  customMorphology,
                  customCarving,
                  customHead,
                  customLimbLen,
                  customStiffness,
                  customSkin,
                  customEcologicalRole,
                  customGoreAttack
                )
              }
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Synthesize & Spawn Custom 3D Entity / Predator
            </button>
          </div>

          {/* Right: Active Entities Selection, Snapshot Trigger & Ragdoll Impulse Tester */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-2.5 bg-slate-900/70 border border-white/10 rounded-lg p-4">
            <div className="space-y-2.5 flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-white font-display tracking-wide">
                  Select Entity for Manifold Snapshot
                </h4>
                <span className="text-[11px] text-slate-400 font-mono-tabular">
                  {entityTelemetry.length} active
                </span>
              </div>

              <div className="space-y-2 overflow-y-auto flex-1 pr-1 max-h-56">
                {entityTelemetry.map((ent) => {
                  const isSel = ent.id === effectiveSelectedEntityId;
                  return (
                    <div
                      key={ent.id}
                      onClick={() => onSelectEntity(ent.id)}
                      className={`p-2 rounded-lg border flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                        isSel
                          ? 'bg-amber-500/15 border-amber-400'
                          : 'bg-slate-950/80 border-white/10 hover:bg-slate-900'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">
                          {ent.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono-tabular">
                          {ent.ragdollState} · kP={Math.round(ent.currentStiffness * 100)}% · Pos [{ent.position.join(', ')}]
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEntity(ent.id);
                            onCaptureEntitySnapshot(ent.id);
                            setEntitySubView('snapshots');
                          }}
                          className="p-1.5 text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded transition-colors cursor-pointer"
                          title={`Capture 3D Manifold Snapshot of ${ent.name}`}
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onApplyEntityImpulse(ent.id);
                          }}
                          className="px-2 py-1 text-xs font-medium bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded whitespace-nowrap transition-colors cursor-pointer"
                          title="Inject physical ragdoll impulse"
                        >
                          Impulse
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedEntity && (
              <div className="pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="text-xs text-slate-300 truncate font-mono-tabular">
                  Target: <span className="text-white font-semibold">{selectedEntity.name}</span>
                </div>
                <button
                  onClick={() => {
                    onCaptureEntitySnapshot(selectedEntity.id);
                    setEntitySubView('snapshots');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md whitespace-nowrap transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Save Snapshot
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Saved Manifold Snapshots (Local Browser History) Sub-View */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto pr-1">
          {/* Left 7 Columns: Saved Snapshots Grid */}
          <div className="lg:col-span-7 flex flex-col gap-3 bg-slate-900/70 border border-white/10 rounded-lg p-4 overflow-y-auto">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-semibold text-white font-display tracking-wide">
                  Browser-Saved Manifold Snapshots ({entitySnapshots.length})
                </h4>
                <p className="text-xs text-slate-400">
                  Persisted locally in your browser with 3D viewport capture, skeletal blueprint & 4D kinematics
                </p>
              </div>
              {entitySnapshots.length > 0 && (
                <button
                  onClick={onClearAllSnapshots}
                  className="px-2.5 py-1 text-xs font-medium text-rose-300 hover:text-white hover:bg-rose-500/20 border border-rose-500/30 rounded transition-colors whitespace-nowrap cursor-pointer"
                >
                  Clear History
                </button>
              )}
            </div>

            {entitySnapshots.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-lg bg-slate-950/50 space-y-2.5">
                <Camera className="w-6 h-6 text-amber-400/70" />
                <div className="text-xs font-semibold text-white">
                  No Manifold Snapshots Captured Yet
                </div>
                <p className="text-xs text-slate-400 max-w-sm">
                  Select any entity in the Entity Forge and click Capture Manifold Snapshot to record its live 3D viewport frame, ragdoll posture, and 4D coordinate to your browser history.
                </p>
                {effectiveSelectedEntityId && (
                  <button
                    onClick={() =>
                      onCaptureEntitySnapshot(effectiveSelectedEntityId)
                    }
                    className="px-3.5 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors cursor-pointer"
                  >
                    Capture Current Selected Entity
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 max-h-64">
                {entitySnapshots.map((snap) => {
                  const isInspected = snap.id === inspectedSnapshot?.id;
                  const timeStr = new Date(snap.createdAt).toLocaleTimeString(
                    [],
                    { hour: '2-digit', minute: '2-digit', second: '2-digit' }
                  );

                  return (
                    <div
                      key={snap.id}
                      onClick={() => setInspectedSnapshotId(snap.id)}
                      className={`group rounded-lg border overflow-hidden flex flex-col transition-colors cursor-pointer ${
                        isInspected
                          ? 'bg-amber-500/15 border-amber-400'
                          : 'bg-slate-950/85 border-white/10 hover:border-white/25'
                      }`}
                    >
                      {/* 3D Viewport Thumbnail with Zero-Broken-Image Fallback */}
                      <div className="relative h-28 w-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 overflow-hidden flex items-center justify-center">
                        {snap.imageDataUrl ? (
                          <img
                            src={snap.imageDataUrl}
                            alt={`3D manifold snapshot of ${snap.entityName}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-xs text-slate-400 font-mono-tabular">
                            3D Frame · Seed #{snap.worldSeed}
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-2.5 py-1.5 flex items-center justify-between text-[11px] font-mono-tabular text-slate-200">
                          <span>W={snap.wCoord >= 0 ? `+${snap.wCoord.toFixed(2)}` : snap.wCoord.toFixed(2)}</span>
                          <span>{timeStr}</span>
                        </div>
                      </div>

                      <div className="p-2.5 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate">
                            {snap.entityName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono-tabular truncate">
                            {snap.telemetry.morphology} · kP={Math.round(snap.telemetry.currentStiffness * 100)}%
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRestoreFromSnapshot(snap);
                            }}
                            className="px-2 py-1 text-[11px] font-semibold bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 rounded transition-colors whitespace-nowrap cursor-pointer"
                            title="Re-spawn this captured entity blueprint & restore its 4D W-coordinate"
                          >
                            Restore
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSnapshot(snap.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                            title="Remove snapshot from browser history"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right 5 Columns: Detailed Manifold Snapshot Telemetry Inspector */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3 bg-slate-900/70 border border-white/10 rounded-lg p-4">
            {inspectedSnapshot ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs text-amber-400 font-medium">
                        Manifold Snapshot Record
                      </div>
                      <h4 className="text-sm font-bold font-display text-white">
                        {inspectedSnapshot.entityName}
                      </h4>
                    </div>
                    <span className="text-xs font-mono-tabular text-slate-400">
                      {new Date(inspectedSnapshot.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Preview Frame */}
                  <div className="relative h-32 w-full rounded-lg overflow-hidden border border-white/10 bg-slate-950 flex items-center justify-center">
                    {inspectedSnapshot.imageDataUrl ? (
                      <img
                        src={inspectedSnapshot.imageDataUrl}
                        alt={`Detailed 3D snapshot of ${inspectedSnapshot.entityName}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-xs text-slate-400 font-mono-tabular">
                        Seed #{inspectedSnapshot.worldSeed} Viewport Record
                      </div>
                    )}
                  </div>

                  {/* Unboxed Metadata with '·' Separators */}
                  <div className="space-y-1.5 text-xs text-slate-300 font-mono-tabular">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-slate-400">World:</span>
                      <span className="text-white">{inspectedSnapshot.worldName}</span>
                      <span>·</span>
                      <span>Seed #{inspectedSnapshot.worldSeed}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-slate-400">3D Pose:</span>
                      <span>Pos [{inspectedSnapshot.telemetry.position.join(', ')}]</span>
                      <span>·</span>
                      <span>{inspectedSnapshot.telemetry.velocityMagnitude} m/s</span>
                      <span>·</span>
                      <span>{inspectedSnapshot.telemetry.jointCount} joints</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-slate-400">4D State:</span>
                      <span className="text-amber-400">
                        W={inspectedSnapshot.wCoord >= 0 ? `+${inspectedSnapshot.wCoord.toFixed(2)}` : inspectedSnapshot.wCoord.toFixed(2)}
                      </span>
                      <span>·</span>
                      <span>{inspectedSnapshot.telemetry.ragdollState}</span>
                      <span>·</span>
                      <span>Stiffness {Math.round(inspectedSnapshot.telemetry.currentStiffness * 100)}%</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-slate-400">Rig Spec:</span>
                      <span>{inspectedSnapshot.blueprint.morphology}</span>
                      <span>·</span>
                      <span>{inspectedSnapshot.blueprint.carvingStyle}</span>
                      <span>·</span>
                      <span>{inspectedSnapshot.blueprint.headStyle}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                  <button
                    onClick={() => onRestoreFromSnapshot(inspectedSnapshot)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Re-Materialize Entity & 4D State
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400 text-center">
                Capture a snapshot to inspect its 3D viewport state and telemetry.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
