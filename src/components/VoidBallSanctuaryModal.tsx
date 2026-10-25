import React, { useState } from 'react';
import {
  AstraArgonSynthesisParadigm,
  BuildingBlockShape,
  BuildingPresetBlock,
  BuildingPresetBlueprint,
  CraftingRecipe,
  ManifoldGameVersionLog,
  PlayableCharacterSpec,
  ResourceId,
  WorldTopologyArchetype,
} from '../types/manifold';
import {
  CRAFTING_RECIPES,
  RESOURCE_CATALOG,
} from '../utils/manifoldGenerator';
import {
  ASTRA_ARGON_ARCHITECTURAL_CODEX,
  synthesizeAstraArgonArchitecturalBlueprint,
} from '../utils/architecturalWisdomEngine';
import {
  ALL_ANOMALOUS_ARCHETYPES,
  ANOMALOUS_OBJECT_CATALOG,
} from '../utils/dimensionalBleedAndAnomalyEngine';
import {
  Compass,
  Hammer,
  History,
  Layers,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';

interface VoidBallSanctuaryModalProps {
  mode: 'hand-inventory' | 'inner-void-sanctuary';
  onSwitchMode: (mode: 'hand-inventory' | 'inner-void-sanctuary') => void;
  onClose: () => void;
  playableCharacter: PlayableCharacterSpec;
  inventory: Record<ResourceId, number>;
  buildingPresets: BuildingPresetBlueprint[];
  activePresetId: string;
  onSelectActivePreset: (presetId: string) => void;
  onSaveNewBuildingPreset: (preset: BuildingPresetBlueprint) => void;
  onDeleteBuildingPreset: (presetId: string) => void;
  onCraftRecipe: (recipe: CraftingRecipe) => void;
  gameVersionArchive: ManifoldGameVersionLog[];
  activeVersionId: string;
  onTeleportToNewDimension: (preferredArchetype?: WorldTopologyArchetype) => void;
  onTeleportToSavedGameVersion: (versionLog: ManifoldGameVersionLog) => void;
}

const BLOCK_SHAPES: { id: BuildingBlockShape; label: string }[] = [
  { id: 'gyroid-minimal-shell', label: 'Schoen TPMS Gyroid' },
  { id: 'metabolist-capsule-pod', label: 'Kurokawa Capsule Pod' },
  { id: 'scarpa-ziggurat-stair', label: 'Scarpa Stepped Corbel' },
  { id: 'tensegrity-strut-prism', label: 'Fuller Tensegrity Prism' },
  { id: 'jansen-kinetic-rib', label: 'Jansen-Choe Kinetic Rib' },
  { id: 'calabi-yau-portal', label: 'Calabi-Yau 5D Rosette' },
  { id: 'pillar', label: 'Fluted Scarpa Column' },
  { id: 'cantilever-deck', label: 'Diagrid Waffle Deck' },
  { id: 'arch', label: 'Catenary Vault Arch' },
  { id: 'dome', label: 'Geodesic Oculus Dome' },
  { id: 'ring-conduit', label: 'Gimbal Solenoid Ring' },
  { id: 'spire-tip', label: 'Hyperbolic Pseudosphere' },
];

const BLOCK_COLORS = [
  '#e2e8f0',
  '#38bdf8',
  '#f59e0b',
  '#10b981',
  '#f43f5e',
  '#a855f7',
];

export const VoidBallSanctuaryModal: React.FC<VoidBallSanctuaryModalProps> = ({
  mode,
  onSwitchMode,
  onClose,
  playableCharacter,
  inventory,
  buildingPresets,
  activePresetId,
  onSelectActivePreset,
  onSaveNewBuildingPreset,
  onDeleteBuildingPreset,
  onCraftRecipe,
  gameVersionArchive,
  activeVersionId,
  onTeleportToNewDimension,
  onTeleportToSavedGameVersion,
}) => {
  const [voidTab, setVoidTab] = useState<
    'architect' | 'astra-argon-codex' | 'teleport-archive'
  >('architect');
  const [selectedParadigm, setSelectedParadigm] =
    useState<AstraArgonSynthesisParadigm>('astra-argon-dialectic-fusion');

  // Void Building Preset Architect state
  const [presetName, setPresetName] = useState('Aether-Bone Sanctuary');
  const [presetDesc, setPresetDesc] = useState(
    'Multi-dimensional shelter forged inside the Left-Hand Pocket Void.'
  );
  const [selectedShape, setSelectedShape] =
    useState<BuildingBlockShape>('pillar');
  const [selectedColor, setSelectedColor] = useState<string>('#38bdf8');
  const [selectedEmissive, setSelectedEmissive] = useState<boolean>(true);
  const [selectedLayerY, setSelectedLayerY] = useState<number>(0);
  const [draftBlocks, setDraftBlocks] = useState<BuildingPresetBlock[]>([
    { id: 'd1', gx: -1, gy: 0, gz: -1, shape: 'pillar', color: '#e2e8f0', emissive: false },
    { id: 'd2', gx: 1, gy: 0, gz: -1, shape: 'pillar', color: '#e2e8f0', emissive: false },
    { id: 'd3', gx: -1, gy: 0, gz: 1, shape: 'pillar', color: '#e2e8f0', emissive: false },
    { id: 'd4', gx: 1, gy: 0, gz: 1, shape: 'pillar', color: '#e2e8f0', emissive: false },
    { id: 'd5', gx: 0, gy: 1, gz: 0, shape: 'cantilever-deck', color: '#38bdf8', emissive: true },
    { id: 'd6', gx: 0, gy: 2, gz: 0, shape: 'dome', color: '#a855f7', emissive: true },
  ]);

  const canAfford = (cost: Partial<Record<ResourceId, number>>) => {
    for (const [resId, needed] of Object.entries(cost)) {
      if ((inventory[resId as ResourceId] ?? 0) < (needed ?? 0)) {
        return false;
      }
    }
    return true;
  };

  const handleToggleGridCell = (gx: number, gz: number) => {
    setDraftBlocks((prev) => {
      const existingIdx = prev.findIndex(
        (b) => b.gx === gx && b.gy === selectedLayerY && b.gz === gz
      );
      if (existingIdx >= 0) {
        return prev.filter((_, idx) => idx !== existingIdx);
      }
      return [
        ...prev,
        {
          id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          gx,
          gy: selectedLayerY,
          gz,
          shape: selectedShape,
          color: selectedColor,
          emissive: selectedEmissive,
        },
      ];
    });
  };

  const handleSavePreset = () => {
    if (!presetName.trim() || draftBlocks.length === 0) return;
    const newPreset: BuildingPresetBlueprint = {
      id: `preset-custom-${Date.now()}`,
      name: presetName.trim(),
      description: presetDesc.trim() || 'Custom Pocket Void architectural preset.',
      paradigm: selectedParadigm,
      blocks: [...draftBlocks],
      cost: { 'ferro-chitin': 2, 'vitreous-aether': 1 },
      createdAt: Date.now(),
    };
    onSaveNewBuildingPreset(newPreset);
    onSelectActivePreset(newPreset.id);
  };

  const handleSynthesizeWithSuperpower = (
    paradigm: AstraArgonSynthesisParadigm
  ) => {
    const generated = synthesizeAstraArgonArchitecturalBlueprint(
      paradigm,
      Math.floor(Math.random() * 899999 + 100000),
      playableCharacter.voidOrbColor
    );
    setSelectedParadigm(paradigm);
    setPresetName(generated.name);
    setPresetDesc(generated.description);
    setDraftBlocks(generated.blocks);
    onSaveNewBuildingPreset(generated);
    onSelectActivePreset(generated.id);
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-950/94 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4 text-slate-100 overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-3.5 h-3.5 rounded-full shrink-0"
            style={{
              backgroundColor: playableCharacter.voidOrbColor,
              boxShadow: `0 0 12px ${playableCharacter.voidOrbColor}`,
            }}
          />
          <div>
            <h2 className="text-sm font-bold font-display text-white tracking-wide">
              {mode === 'hand-inventory'
                ? `Left-Hand Elemental Void Sphere (${playableCharacter.voidOrbElement})`
                : 'Inner Pocket Void Dimension — Architect & Dimensional Nexus'}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'hand-inventory'
                ? 'Cradled in the 5 articulated fingers of your left hand · Stores mined elements & biological synthesis'
                : 'Suspended inside your elemental singularity · Forge cross-dimensional building presets or jump across safe-logged game epochs'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pr-8">
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-white/10">
            <button
              onClick={() => onSwitchMode('hand-inventory')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                mode === 'hand-inventory'
                  ? 'bg-purple-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Left-Hand Fingers Inventory
            </button>
            <button
              onClick={() => onSwitchMode('inner-void-sanctuary')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                mode === 'inner-void-sanctuary'
                  ? 'bg-purple-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Enter Inner Pocket Void
            </button>
          </div>
        </div>
      </div>

      {mode === 'hand-inventory' ? (
        /* MODE 1: Left-Hand Fingers Inventory, Playable Biology & Crafting */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto pr-1">
          {/* Column 1: Mined Elemental & Biological Resources */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-3 bg-slate-900/75 border border-white/10 rounded-lg p-4">
            <div className="space-y-2.5">
              <div>
                <h3 className="text-xs font-semibold text-white font-display tracking-wide">
                  Void-Suspended Elemental Inventory
                </h3>
                <p className="text-xs text-slate-400">
                  Use the Terrain Extractor (Key E or Mine Mode) to excavate ground craters & harvest matter
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {(Object.keys(RESOURCE_CATALOG) as ResourceId[]).map((resId) => {
                  const meta = RESOURCE_CATALOG[resId];
                  const count = inventory[resId] ?? 0;
                  return (
                    <div
                      key={resId}
                      className="p-2.5 rounded-lg bg-slate-950/85 border border-white/10 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: meta.color }}
                          />
                          <span className="text-xs font-semibold text-white truncate">
                            {meta.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {meta.biologicalOrigin}
                        </p>
                      </div>
                      <span className="font-mono-tabular text-sm font-bold text-amber-400 shrink-0">
                        ×{count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => onSwitchMode('inner-void-sanctuary')}
              className="w-full py-2.5 px-4 bg-purple-500 hover:bg-purple-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Step Into Inner Pocket Void (Architect & Teleport)
            </button>
          </div>

          {/* Column 2: Biological & Dimensional Crafting Matrix */}
          <div className="lg:col-span-5 flex flex-col gap-3 bg-slate-900/75 border border-white/10 rounded-lg p-4">
            <div>
              <h3 className="text-xs font-semibold text-white font-display tracking-wide">
                Elemental & Biological Synthesis (Crafting)
              </h3>
              <p className="text-xs text-slate-400">
                Combine harvested terrain substrates inside the left-hand singularity
              </p>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
              {CRAFTING_RECIPES.map((recipe) => {
                const affordable = canAfford(recipe.cost);
                const costText = Object.entries(recipe.cost)
                  .map(
                    ([k, v]) =>
                      `${v} ${RESOURCE_CATALOG[k as ResourceId].name.split(' ')[0]}`
                  )
                  .join(' · ');

                return (
                  <div
                    key={recipe.id}
                    className="p-3 rounded-lg bg-slate-950/85 border border-white/10 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-semibold text-white">
                          {recipe.name}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {recipe.description}
                        </p>
                      </div>
                      <button
                        disabled={!affordable}
                        onClick={() => onCraftRecipe(recipe)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors shrink-0 ${
                          affordable
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Synthesize
                      </button>
                    </div>
                    <div className="text-[11px] font-mono-tabular text-slate-400">
                      Requires: {costText}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 3: Playable Character Biological & Human Profile */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-3 bg-slate-900/75 border border-white/10 rounded-lg p-4">
            <div className="space-y-3">
              <div>
                <div className="text-xs text-purple-400 font-medium">
                  Active Playable Host
                </div>
                <h3 className="text-base font-bold font-display text-white">
                  {playableCharacter.name}
                </h3>
                <div className="text-xs text-slate-400">
                  {playableCharacter.title}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-slate-950/80 border border-white/5">
                  <div className="text-[11px] text-amber-400 font-medium mb-0.5">
                    Physical & Biological Morphology
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {playableCharacter.biologicalTrait}
                  </p>
                </div>

                <div className="p-2.5 rounded bg-slate-950/80 border border-white/5">
                  <div className="text-[11px] text-cyan-400 font-medium mb-0.5">
                    Subtle Human Resonance
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {playableCharacter.humanEchoTrait}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-xs font-mono-tabular text-slate-300 pt-1">
                <div>
                  Stature Scale: {playableCharacter.heightScale}x · Radius{' '}
                  {playableCharacter.collisionRadius}m
                </div>
                <div>
                  Jump Impulse: {playableCharacter.jumpImpulse} m/s · Speed{' '}
                  {playableCharacter.moveSpeedMultiplier}x
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <div className="text-[11px] text-slate-400 mb-1">
                Active Building Preset for Placement:
              </div>
              <select
                value={activePresetId}
                onChange={(e) => onSelectActivePreset(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-md px-2.5 py-1.5 text-xs text-white"
              >
                {buildingPresets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.blocks.length} modules)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2: Inner Pocket Void Sanctuary (Building Preset Architect & Dimensional Teleportation Archive) */
        <div className="flex-1 flex flex-col min-h-0 gap-3">
          {/* Sub-Tabs inside the Pocket Void */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-white/10">
              <button
                onClick={() => setVoidTab('architect')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  voidTab === 'architect'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Void BIM Architect ({buildingPresets.length})
              </button>
              <button
                onClick={() => setVoidTab('astra-argon-codex')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  voidTab === 'astra-argon-codex'
                    ? 'bg-cyan-400 text-slate-950 font-semibold'
                    : 'text-cyan-300 hover:text-white'
                }`}
              >
                Astra × Argon Architectural Wisdom Codex (Superpower)
              </button>
              <button
                onClick={() => setVoidTab('teleport-archive')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  voidTab === 'teleport-archive'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Dimensional Teleportation & Epochs ({gameVersionArchive.length})
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  handleSynthesizeWithSuperpower('astra-tectonic-grammar')
                }
                className="px-2.5 py-1 text-[11px] font-mono-tabular rounded border border-amber-400/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 cursor-pointer"
                title="Generate new building preset with GPT-6 Astra Tectonic-Compositional Grammar (Metabolist + Scarpa)"
              >
                + Synth Astra Tectonic
              </button>
              <button
                onClick={() =>
                  handleSynthesizeWithSuperpower('argon-implicit-morphogenesis')
                }
                className="px-2.5 py-1 text-[11px] font-mono-tabular rounded border border-cyan-400/40 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 cursor-pointer"
                title="Generate new building preset with Gemini Argon Implicit Morphogenesis (Schoen Gyroid + Jansen Kinetic)"
              >
                + Synth Argon Morphogenesis
              </button>
              <button
                onClick={() =>
                  handleSynthesizeWithSuperpower('astra-argon-dialectic-fusion')
                }
                className="px-2.5 py-1 text-[11px] font-mono-tabular rounded border border-purple-400/40 bg-purple-500/20 hover:bg-purple-500/35 text-purple-200 cursor-pointer"
                title="Fuse Astra Tectonic Skeletons with Argon Gyroidal Minimal Surfaces & Kinetic Linkages"
              >
                + Fuse Astra × Argon
              </button>
            </div>
          </div>

          {voidTab === 'architect' ? (
            /* Void Building Preset Architect */
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto pr-1">
              {/* Left 5 Cols: Interactive 5x5 Modular Layer Grid */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-3 bg-slate-900/75 border border-white/10 rounded-lg p-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-white font-display">
                      Pocket Void Lattice Grid (Layer Y={selectedLayerY})
                    </h3>
                    <span className="text-xs font-mono-tabular text-amber-400">
                      {draftBlocks.length} blocks placed
                    </span>
                  </div>

                  {/* Elevation Layer Selector (Y = 0 to 4) */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 mr-1">
                      Vertical Tier:
                    </span>
                    {[0, 1, 2, 3, 4].map((ly) => (
                      <button
                        key={ly}
                        onClick={() => setSelectedLayerY(ly)}
                        className={`px-2.5 py-1 text-xs font-mono-tabular rounded border transition-colors cursor-pointer ${
                          selectedLayerY === ly
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-semibold'
                            : 'bg-slate-950 text-slate-300 border-white/10 hover:bg-slate-800'
                        }`}
                      >
                        Y={ly}
                      </button>
                    ))}
                  </div>

                  {/* 5x5 Spatial Architect Matrix */}
                  <div className="grid grid-cols-5 gap-1.5 pt-1 max-w-[260px] mx-auto">
                    {[-2, -1, 0, 1, 2].map((gz) =>
                      [-2, -1, 0, 1, 2].map((gx) => {
                        const cellBlock = draftBlocks.find(
                          (b) =>
                            b.gx === gx &&
                            b.gy === selectedLayerY &&
                            b.gz === gz
                        );
                        const lowerBlocksCount = draftBlocks.filter(
                          (b) =>
                            b.gx === gx &&
                            b.gz === gz &&
                            b.gy < selectedLayerY
                        ).length;

                        return (
                          <button
                            key={`${gx}-${gz}`}
                            onClick={() => handleToggleGridCell(gx, gz)}
                            className={`h-11 rounded-md border flex flex-col items-center justify-center text-[10px] font-mono-tabular transition-all cursor-pointer ${
                              cellBlock
                                ? 'border-white shadow-sm text-slate-950 font-bold'
                                : lowerBlocksCount > 0
                                ? 'bg-slate-900/90 border-amber-500/30 text-slate-400 hover:border-white/40'
                                : 'bg-slate-950/80 border-white/10 text-slate-500 hover:border-white/30'
                            }`}
                            style={
                              cellBlock
                                ? { backgroundColor: cellBlock.color }
                                : undefined
                            }
                            title={`Grid (${gx}, Y=${selectedLayerY}, ${gz})`}
                          >
                            <span>
                              {cellBlock
                                ? cellBlock.shape.slice(0, 4).toUpperCase()
                                : `${gx},${gz}`}
                            </span>
                            {lowerBlocksCount > 0 && !cellBlock && (
                              <span className="text-[9px] text-amber-400">
                                ↑{lowerBlocksCount}
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-slate-400">
                  <span>Click cells to toggle modules on Layer Y={selectedLayerY}</span>
                  <button
                    onClick={() => setDraftBlocks([])}
                    className="text-rose-400 hover:text-rose-300 underline cursor-pointer"
                  >
                    Clear Grid
                  </button>
                </div>
              </div>

              {/* Center 4 Cols: Module Palette & Save Preset Form */}
              <div className="lg:col-span-4 flex flex-col justify-between gap-3 bg-slate-900/75 border border-white/10 rounded-lg p-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      Structural Module Geometry
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {BLOCK_SHAPES.map((sh) => (
                        <button
                          key={sh.id}
                          onClick={() => setSelectedShape(sh.id)}
                          className={`px-2.5 py-1.5 text-xs font-medium rounded border text-left truncate transition-colors cursor-pointer ${
                            selectedShape === sh.id
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                              : 'bg-slate-950 border-white/10 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {sh.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Material Pigment
                      </label>
                      <div className="flex items-center gap-1.5">
                        {BLOCK_COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => setSelectedColor(c)}
                            className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                              selectedColor === c
                                ? 'border-white scale-110'
                                : 'border-transparent'
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-4">
                      <input
                        type="checkbox"
                        checked={selectedEmissive}
                        onChange={(e) => setSelectedEmissive(e.target.checked)}
                        className="accent-amber-500"
                      />
                      Bioluminescent
                    </label>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Building Preset Name
                      </label>
                      <input
                        type="text"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        className="w-full bg-slate-950 border border-white/15 rounded-md px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Architectural Purpose
                      </label>
                      <input
                        type="text"
                        value={presetDesc}
                        onChange={(e) => setPresetDesc(e.target.value)}
                        className="w-full bg-slate-950 border border-white/15 rounded-md px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSavePreset}
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Save Building Preset to Cross-Dimensional Void
                </button>
              </div>

              {/* Right 3 Cols: Saved Cross-Dimensional Building Presets */}
              <div className="lg:col-span-3 flex flex-col gap-2.5 bg-slate-900/75 border border-white/10 rounded-lg p-4">
                <div>
                  <h3 className="text-xs font-semibold text-white font-display">
                    Saved Void Building Presets
                  </h3>
                  <p className="text-xs text-slate-400">
                    Select active preset to deploy in any dimension
                  </p>
                </div>

                <div className="space-y-2 overflow-y-auto flex-1 pr-1 max-h-60">
                  {buildingPresets.map((p) => {
                    const isAct = p.id === activePresetId;
                    return (
                      <div
                        key={p.id}
                        onClick={() => onSelectActivePreset(p.id)}
                        className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
                          isAct
                            ? 'bg-amber-500/15 border-amber-400'
                            : 'bg-slate-950/80 border-white/10 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-white truncate">
                            {p.name}
                          </span>
                          {buildingPresets.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteBuildingPreset(p.id);
                              }}
                              className="text-slate-400 hover:text-rose-400 p-0.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {p.description}
                        </p>
                        <div className="text-[10px] font-mono-tabular text-amber-400 mt-1">
                          {p.blocks.length} modules · {isAct ? 'Equipped for Build Mode' : 'Click to Equip'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : voidTab === 'astra-argon-codex' ? (
            /* Tab 2: Astra × Argon Architectural Wisdom Codex & Asset Generation Superpower */
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/80 border border-white/10 rounded-xl p-3.5">
                <div className="p-3 rounded-lg bg-amber-950/25 border border-amber-400/30 space-y-1">
                  <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-amber-300 font-semibold">
                    GPT-6 Astra Paradigm · Tectonic Grammar
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Hierarchical part-whole structural assembly inspired by{' '}
                    <strong>Kisho Kurokawa’s Metabolist Capsules</strong>,{' '}
                    <strong>Carlo Scarpa’s stepped béton-brut corbels</strong>,
                    and <strong>Buckminster Fuller tensegrity</strong>.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-cyan-950/25 border border-cyan-400/30 space-y-1">
                  <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-cyan-300 font-semibold">
                    Gemini Argon Paradigm · Implicit Morphogenesis
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Continuous mathematical surface synthesis using{' '}
                    <strong>Alan Schoen TPMS Gyroids (H=0)</strong>,{' '}
                    <strong>Beltrami hyperbolic pseudospheres</strong>,{' '}
                    <strong>differential-growth coral ruffles</strong>, and{' '}
                    <strong>Theo Jansen / U-Ram Choe kinetic linkages</strong>.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-950/25 border border-purple-400/30 flex flex-col justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-purple-300 font-semibold">
                      Dialectical Superpower Competition
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      Fuses permanent tectonic skeletons with zero-mean-curvature
                      minimal surfaces and living clockwork linkages across all
                      world landmarks, BIM structures, and entity anatomies.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleSynthesizeWithSuperpower(
                        'astra-argon-dialectic-fusion'
                      );
                      setVoidTab('architect');
                    }}
                    className="w-full py-1.5 px-3 rounded-md bg-purple-500 hover:bg-purple-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Synthesize New Hybrid Megastructure into Architect Grid
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ASTRA_ARGON_ARCHITECTURAL_CODEX.map((entry) => {
                  const isEquipped =
                    activePresetId === entry.presetBlueprint.id;
                  return (
                    <div
                      key={entry.id}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                        isEquipped
                          ? 'bg-slate-900/95 border-cyan-400 shadow-lg'
                          : 'bg-slate-900/70 border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span
                              className="inline-block text-[10px] font-mono-tabular uppercase tracking-wider px-2 py-0.5 rounded border mb-1"
                              style={{
                                color: entry.accentHex,
                                borderColor: `${entry.accentHex}55`,
                                backgroundColor: `${entry.accentHex}15`,
                              }}
                            >
                              {entry.paradigm.replace(/-/g, ' ')}
                            </span>
                            <h4 className="text-sm font-bold text-white font-display">
                              {entry.name}
                            </h4>
                          </div>
                        </div>

                        <div className="text-[11px] text-amber-300 font-medium">
                          Lineage: {entry.realWorldLineage}
                        </div>

                        <div className="p-2 rounded bg-slate-950/90 border border-white/5 font-mono text-[10px] text-cyan-300 truncate">
                          {entry.mathematicalSurfaceFormula}
                        </div>

                        <div className="space-y-1.5 text-[11px]">
                          <p className="text-slate-300 leading-relaxed">
                            <strong className="text-amber-300">Astra:</strong>{' '}
                            {entry.astraTectonicContribution}
                          </p>
                          <p className="text-slate-300 leading-relaxed">
                            <strong className="text-cyan-300">Argon:</strong>{' '}
                            {entry.argonMorphogenesisContribution}
                          </p>
                          <p className="text-slate-400 italic leading-relaxed">
                            “{entry.architecturalWisdomPrinciple}”
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        <button
                          onClick={() => {
                            const exists = buildingPresets.some(
                              (p) => p.id === entry.presetBlueprint.id
                            );
                            if (!exists) {
                              onSaveNewBuildingPreset(entry.presetBlueprint);
                            }
                            onSelectActivePreset(entry.presetBlueprint.id);
                            setDraftBlocks([...entry.presetBlueprint.blocks]);
                            setPresetName(entry.presetBlueprint.name);
                            setPresetDesc(entry.presetBlueprint.description);
                          }}
                          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            isEquipped
                              ? 'bg-cyan-400 text-slate-950'
                              : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                        >
                          {isEquipped
                            ? 'Equipped for 3D Build Mode'
                            : 'Equip Master Blueprint'}
                        </button>
                        <button
                          onClick={() => {
                            setDraftBlocks([...entry.presetBlueprint.blocks]);
                            setPresetName(entry.presetBlueprint.name);
                            setPresetDesc(entry.presetBlueprint.description);
                            setVoidTab('architect');
                          }}
                          className="py-1.5 px-2.5 rounded-lg text-xs font-medium bg-slate-950 hover:bg-slate-800 text-slate-300 border border-white/15 cursor-pointer"
                        >
                          Edit in Grid
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Section 2: Creepypasta / Abstract Art Anomalous Behavioral Objects & Originality Gradients */}
              <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 space-y-3 mt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-emerald-300 font-semibold">
                      Live Worldspace Anomalies · Smooth-Minimum (smin) Form-Bleed & Gradients of Originality
                    </div>
                    <h4 className="text-sm font-bold text-white font-display">
                      6 Behavioral World Objects (From Sandbox Utility Basis 0.42 → Pure Avant-Garde Anomaly 0.97)
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono-tabular text-slate-400">
                    Active in 3D Worldspace · Reacts to Camera FOV, W-Phase & Proximity
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {ALL_ANOMALOUS_ARCHETYPES.map((arch) => {
                    const meta = ANOMALOUS_OBJECT_CATALOG[arch];
                    const gradPct = Math.round(meta.originalityGradient * 100);
                    return (
                      <div
                        key={arch}
                        className="p-3 rounded-lg bg-slate-950/85 border border-white/10 flex flex-col justify-between gap-2"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="text-[10px] font-mono-tabular px-2 py-0.5 rounded border font-semibold"
                              style={{
                                color: meta.accentHex,
                                borderColor: `${meta.accentHex}55`,
                                backgroundColor: `${meta.accentHex}15`,
                              }}
                            >
                              Originality {meta.originalityGradient.toFixed(2)} ({gradPct}%)
                            </span>
                            <span className="text-[10px] font-mono-tabular text-slate-400 truncate">
                              {meta.sandboxBasisLabel.split('(')[0]}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white font-display">
                            {meta.title}
                          </div>
                          <div className="text-[10px] text-amber-300 font-medium">
                            {meta.artAndGameLineage}
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {meta.creepypastaBehavioralLaw}
                          </p>
                        </div>
                        <div className="pt-1.5 border-t border-white/10 text-[10px] font-mono-tabular text-cyan-300">
                          Form-Bleed: {meta.spatialBleedRelationship}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Tab 2: Dimensional Teleportation & Safe-Logged Game Versions Archive */
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto pr-1">
              {/* Left 5 Cols: Dimensional Teleportation Conduit */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-4 bg-slate-900/75 border border-white/10 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="text-xs font-medium text-purple-400">
                    Void Singularity Teleportation Conduit
                  </div>
                  <h3 className="text-base font-bold font-display text-white">
                    Safe-Log Current Game & Leap to a New Dimension
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Every time you fold the manifold to enter a new dimension, the entire current version of the game—including its terrain excavations, placed structures, playable biology, and original title—is permanently safe-logged in the Version Archive with its own display typography.
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 pt-2">
                    {(
                      [
                        ['non-euclidean-spires', 'Spire-Lung Dimension'],
                        ['gyro-lattice-basin', 'Ferro-Marrow Dimension'],
                        ['crystalline-hyper-mesa', 'Vitreous Pleura Mesa'],
                        ['brutalist-pendulum-foundry', '68-BPM Ossuary Foundry'],
                        ['biomech-coral-atoll', 'Mycelial Tide Atoll'],
                        ['quantum-basalt-trench', 'Abyssal Synapse Trench'],
                      ] as [WorldTopologyArchetype, string][]
                    ).map(([arch, label]) => (
                      <button
                        key={arch}
                        onClick={() => {
                          onTeleportToNewDimension(arch);
                          onClose();
                        }}
                        className="p-2 text-left text-xs font-medium rounded-lg bg-slate-950/85 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400 text-slate-200 transition-colors cursor-pointer"
                      >
                        Teleport → {label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    onTeleportToNewDimension(undefined);
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Safe-Log Current Version & Teleport to Uncharted Dimension
                </button>
              </div>

              {/* Right 7 Cols: Safe-Logged Older Versions of the Game (with Special Fonts & Meaningful Names) */}
              <div className="lg:col-span-7 flex flex-col gap-3 bg-slate-900/75 border border-white/10 rounded-lg p-4 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-white font-display">
                      Safe-Logged Manifold Game Versions ({gameVersionArchive.length})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Anchored by SEED-000 (Original Seed) · Each version preserves its special typography, world biology & excavations
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 overflow-y-auto max-h-64 pr-1">
                  {gameVersionArchive.map((ver) => {
                    const isCurrent = ver.id === activeVersionId;
                    return (
                      <div
                        key={ver.id}
                        className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                          isCurrent
                            ? 'bg-amber-500/15 border-amber-400'
                            : 'bg-slate-950/85 border-white/10 hover:border-white/25'
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 text-[11px] font-mono-tabular text-slate-400">
                            <span className="text-amber-400 font-semibold">
                              {ver.versionCode}
                            </span>
                            <span>·</span>
                            <span>{ver.world.name}</span>
                            <span>·</span>
                            <span>Host: {ver.world.playableCharacter.name}</span>
                          </div>

                          {/* Original Version Title rendered in its Special Display Font! */}
                          <div
                            style={{ fontFamily: ver.fontFamily }}
                            className="text-lg font-bold text-white tracking-wide truncate"
                          >
                            {ver.gameTitle}
                          </div>

                          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                            {ver.meaningAndLore}
                          </p>

                          <div className="flex items-center gap-2 text-[11px] font-mono-tabular text-slate-400 pt-0.5">
                            <span>Font: {ver.fontFamily.split(',')[0].replace(/'/g, '')}</span>
                            <span>·</span>
                            <span>{ver.excavations.length} Mined Craters</span>
                            <span>·</span>
                            <span>{ver.placedBuildings.length} Structures</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            onTeleportToSavedGameVersion(ver);
                            onClose();
                          }}
                          className={`px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                            isCurrent
                              ? 'bg-white/15 text-white'
                              : 'bg-purple-500 hover:bg-purple-400 text-slate-950'
                          }`}
                        >
                          {isCurrent ? 'Active Version' : 'Restore Game Version'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
