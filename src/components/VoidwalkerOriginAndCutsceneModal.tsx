import React from 'react';
import {
  BASE_DIMENSIONAL_ELEMENTS,
  BaseDimensionalElementId,
  DEFAULT_VOIDWALKER_CUSTOMIZATION,
  VOID_SEED_ORIGINS,
  VoidSeedElementId,
  VoidwalkerCustomizationConfig,
} from '../utils/multiversalEmergenceAndCultureEngine';
import { CharacterStudioPoseId } from '../utils/granularDirtAndInEngineCharacterRig';
import { ALL_SKIN_TOPOLOGY_STYLES } from '../utils/skinTopologyEngine';
import { SkinTopologyStyle } from '../types/manifold';

export interface VoidwalkerOriginAndCutsceneModalProps {
  config: VoidwalkerCustomizationConfig;
  studioMode: 'character-creation' | 'trauma-cutscene';
  studioPose: CharacterStudioPoseId;
  studioTurntableYaw: number;
  cutsceneElapsedSec: number;
  onUpdateConfig: (next: VoidwalkerCustomizationConfig) => void;
  onChangePose: (pose: CharacterStudioPoseId) => void;
  onChangeTurntableYaw: (yaw: number) => void;
  onStart3DCutscene: () => void;
  onCompleteOriginSpawn: (finalConfig: VoidwalkerCustomizationConfig) => void;
}

const STUDIO_POSES: { id: CharacterStudioPoseId; label: string }[] = [
  { id: 'combat-ready-breathe', label: '1. Idle & Breathe' },
  { id: 'void-ball-hand-bloom', label: '2. Hand Void Bloom' },
  { id: 'visceral-cleave-combo', label: '3. Visceral Cleave' },
  { id: 'stealth-predator-prowl', label: '4. Stealth Stalk' },
  { id: 'multiversal-rupture-channel', label: '5. Void Rupture' },
];

const ELEMENT_GLYPHS: Record<BaseDimensionalElementId, string> = {
  'lithic-crystalline': '◈',
  'hydro-superfluid': '≈',
  'aero-cymatic': '∿',
  'pyro-vitreous': '✦',
  'chrono-phase': '⧗',
  'bio-miasmic': '☣',
};

export const VoidwalkerOriginAndCutsceneModal: React.FC<
  VoidwalkerOriginAndCutsceneModalProps
> = ({
  config,
  studioMode,
  studioPose,
  studioTurntableYaw,
  cutsceneElapsedSec,
  onUpdateConfig,
  onChangePose,
  onChangeTurntableYaw,
  onStart3DCutscene,
  onCompleteOriginSpawn,
}) => {
  // Defensive fallbacks in case an older localStorage config is missing new 3D morph fields
  const safeConfig: VoidwalkerCustomizationConfig = {
    ...DEFAULT_VOIDWALKER_CUSTOMIZATION,
    ...config,
    heightScale: Number(config?.heightScale ?? 1.0),
    shoulderBreadth: Number(config?.shoulderBreadth ?? 1.0),
    cranialCrestHeight: Number(config?.cranialCrestHeight ?? 1.0),
    bodyArchetype: config?.bodyArchetype ?? 'ferro-seraph',
    skinTopology: config?.skinTopology ?? 'myofibril-striated-cuticle',
    traumaChoice: config?.traumaChoice ?? 'embrace-chaos',
  };

  const activeSeed =
    VOID_SEED_ORIGINS[safeConfig.voidSeedId] ??
    VOID_SEED_ORIGINS['singularity-graviton'];
  const activeBaseElem =
    BASE_DIMENSIONAL_ELEMENTS[safeConfig.primaryBaseElement] ??
    BASE_DIMENSIONAL_ELEMENTS['lithic-crystalline'];

  // Mode B: IN-ENGINE 3D ANIMATED TRAUMA CUTSCENE LETTERBOX OVERLAY
  if (studioMode === 'trauma-cutscene') {
    const phaseIndex =
      cutsceneElapsedSec < 4.0 ? 0 : cutsceneElapsedSec < 8.5 ? 1 : 2;
    const progressPct = Math.min(100, ((cutsceneElapsedSec ?? 0) / 12.0) * 100);
    const activePhase =
      activeSeed.traumaCutscenePhases[phaseIndex] ??
      activeSeed.traumaCutscenePhases[0];

    return (
      <div className="pointer-events-none absolute inset-0 z-40 flex flex-col justify-between p-4 sm:p-6">
        {/* Top Cinematic Letterbox Header */}
        <div className="pointer-events-auto flex items-center justify-between max-w-3xl mx-auto w-full bg-slate-950/75 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 shadow-xl">
          <div className="flex items-center gap-2.5">
            <span
              className="w-2.5 h-2.5 rounded-full animate-ping"
              style={{ backgroundColor: activeSeed.coreColor }}
            />
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-300 font-bold">
              3D Origin Cutscene · {activePhase.phaseTitle}
            </span>
          </div>
          <button
            onClick={() => onCompleteOriginSpawn(safeConfig)}
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-mono text-white border border-white/15 cursor-pointer transition-colors"
          >
            Skip Cutscene → Play Now
          </button>
        </div>

        {/* Bottom Cinematic Subtitle & Interactive Trauma Imprint Bar (Leaves center 3D Cutscene 100% clear!) */}
        <div className="pointer-events-auto max-w-2xl mx-auto w-full bg-slate-950/82 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl space-y-2.5">
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-150"
              style={{
                width: `${progressPct}%`,
                backgroundColor: activeSeed.coreColor,
              }}
            />
          </div>

          <div className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
            {activePhase.narration}
          </div>
          <div className="text-[11px] font-mono text-cyan-300/90">
            Imprint: {activePhase.psychologicalImprint}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mr-1">
                Trauma Response:
              </span>
              {(
                [
                  {
                    id: 'embrace-chaos',
                    label: 'Embrace Chaos (+25% Gore)',
                  },
                  {
                    id: 'suppress-pain',
                    label: 'Suppress Pain (-35% Stealth Noise)',
                  },
                  {
                    id: 'fracture-ego',
                    label: 'Fracture Ego (2× Decode)',
                  },
                ] as const
              ).map((ch) => (
                <button
                  key={ch.id}
                  onClick={() =>
                    onUpdateConfig({ ...safeConfig, traumaChoice: ch.id })
                  }
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-all cursor-pointer ${
                    safeConfig.traumaChoice === ch.id
                      ? 'bg-amber-400/25 border-amber-300 text-amber-200 font-bold'
                      : 'bg-slate-900/70 border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => onCompleteOriginSpawn(safeConfig)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-xs shadow-lg cursor-pointer"
            >
              Enter World Now →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mode A: LIVE 3D IN-ENGINE CHARACTER CREATION STUDIO (Compact Left Blade + Bottom Pose Bar, 75%+ Open 3D Viewport!)
  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex flex-col justify-between p-3 sm:p-4">
      {/* Top Floating Banner */}
      <div className="pointer-events-auto flex items-center justify-between max-w-4xl w-full bg-slate-950/75 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2 shadow-lg">
        <div className="flex items-center gap-2.5">
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: activeSeed.coreColor }}
          />
          <div>
            <span className="text-xs font-bold text-white tracking-wide">
              LIVE 3D VOIDWALKER CHARACTER CREATION
            </span>
            <span className="hidden sm:inline text-[11px] font-mono text-cyan-300 ml-2">
              · Live 3D Turntable Stage · Customize Body, Seed & Animations
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onStart3DCutscene}
            className="px-3 py-1 rounded-lg bg-purple-500/30 hover:bg-purple-500/45 border border-purple-400/50 text-purple-100 text-xs font-semibold cursor-pointer transition-colors"
          >
            ▶ Play 3D Origin Cutscene
          </button>
          <button
            onClick={() => onCompleteOriginSpawn(safeConfig)}
            className="px-3.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
          >
            Spawn Directly →
          </button>
        </div>
      </div>

      {/* Middle Row: Sleek Left Customization Blade (w-80) leaving the Center & Right 3D Character Stage 100% Open! */}
      <div className="flex-1 flex items-center min-h-0 my-2">
        <div className="pointer-events-auto w-80 max-h-full overflow-y-auto bg-slate-950/80 backdrop-blur-xl border border-white/15 rounded-2xl p-3.5 space-y-3 shadow-2xl">
          {/* Name & Archetype */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] font-mono uppercase text-slate-400 mb-0.5">
                Walker Name
              </label>
              <input
                type="text"
                value={safeConfig.walkerName}
                onChange={(e) =>
                  onUpdateConfig({ ...safeConfig, walkerName: e.target.value })
                }
                className="w-full px-2 py-1 rounded-lg bg-slate-900/90 border border-white/15 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[9px] font-mono uppercase text-slate-400 mb-0.5">
                3D Body Chassis
              </label>
              <select
                value={safeConfig.bodyArchetype}
                onChange={(e) =>
                  onUpdateConfig({
                    ...safeConfig,
                    bodyArchetype: e.target
                      .value as VoidwalkerCustomizationConfig['bodyArchetype'],
                  })
                }
                className="w-full px-2 py-1 rounded-lg bg-slate-900/90 border border-white/15 text-xs text-white font-mono"
              >
                <option value="chitin-nomad">Chitin Nomad</option>
                <option value="vitreous-diver">Vitreous Diver</option>
                <option value="mycelial-symbiont">Mycelial Symbiont</option>
                <option value="ossified-cantor">Ossified Cantor</option>
                <option value="ferro-seraph">Ferro-Seraph</option>
                <option value="original-construct">Vanguard Construct</option>
              </select>
            </div>
          </div>

          {/* 3D Live Skeletal Morph Sliders */}
          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-2.5 space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-semibold">
              Live 3D Anatomy Morphing
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="flex justify-between text-[9px] font-mono text-slate-300">
                  <span>Height</span>
                  <span>{safeConfig.heightScale.toFixed(2)}×</span>
                </div>
                <input
                  type="range"
                  min={0.82}
                  max={1.32}
                  step={0.02}
                  value={safeConfig.heightScale}
                  onChange={(e) =>
                    onUpdateConfig({
                      ...safeConfig,
                      heightScale: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[9px] font-mono text-slate-300">
                  <span>Shoulders</span>
                  <span>{safeConfig.shoulderBreadth.toFixed(2)}×</span>
                </div>
                <input
                  type="range"
                  min={0.82}
                  max={1.38}
                  step={0.02}
                  value={safeConfig.shoulderBreadth}
                  onChange={(e) =>
                    onUpdateConfig({
                      ...safeConfig,
                      shoulderBreadth: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-amber-400 h-1 bg-slate-800 rounded cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[9px] font-mono text-slate-300">
                  <span>Cranium</span>
                  <span>{safeConfig.cranialCrestHeight.toFixed(2)}×</span>
                </div>
                <input
                  type="range"
                  min={0.85}
                  max={1.45}
                  step={0.02}
                  value={safeConfig.cranialCrestHeight}
                  onChange={(e) =>
                    onUpdateConfig({
                      ...safeConfig,
                      cranialCrestHeight: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-purple-400 h-1 bg-slate-800 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Suit Skin Topology */}
            <div>
              <label className="block text-[9px] font-mono uppercase text-slate-400 mb-0.5">
                Dermal Suit Topology
              </label>
              <select
                value={safeConfig.skinTopology}
                onChange={(e) =>
                  onUpdateConfig({
                    ...safeConfig,
                    skinTopology: e.target.value as SkinTopologyStyle,
                  })
                }
                className="w-full px-2 py-1 rounded-lg bg-slate-950 border border-white/15 text-[11px] text-cyan-200 font-mono"
              >
                {ALL_SKIN_TOPOLOGY_STYLES.map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/-/g, ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Void Seed Origin Selector (Compact Cards) */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-semibold">
              1. Left-Hand Void Seed & Trauma Origin
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {(Object.keys(VOID_SEED_ORIGINS) as VoidSeedElementId[]).map(
                (seedId) => {
                  const seed = VOID_SEED_ORIGINS[seedId];
                  const selected = safeConfig.voidSeedId === seedId;
                  return (
                    <button
                      key={seedId}
                      onClick={() =>
                        onUpdateConfig({
                          ...safeConfig,
                          voidSeedId: seedId,
                          primaryBaseElement: seed.startingBaseElement,
                        })
                      }
                      className={`text-left p-2 rounded-xl border transition-all cursor-pointer ${
                        selected
                          ? 'bg-white/15 border-amber-400 shadow-md'
                          : 'bg-slate-900/50 border-white/10 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: seed.coreColor }}
                          />
                          {seed.name}
                        </span>
                        <span className="text-[9px] font-mono text-amber-300">
                          {seed.subtitle.split(' ')[0]}
                        </span>
                      </div>
                      {selected && (
                        <div className="text-[10px] text-slate-300 mt-1 leading-snug">
                          {seed.uniqueVoidPower} — {seed.traumaTitle}
                        </div>
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* 6 Base Dimensional Elements (Compact 3x2 Grid) */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-semibold">
              2. Base Dimensional Element Attunement
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                Object.keys(
                  BASE_DIMENSIONAL_ELEMENTS
                ) as BaseDimensionalElementId[]
              ).map((elemId) => {
                const el = BASE_DIMENSIONAL_ELEMENTS[elemId];
                const isSelected = safeConfig.primaryBaseElement === elemId;
                return (
                  <button
                    key={elemId}
                    onClick={() =>
                      onUpdateConfig({
                        ...safeConfig,
                        primaryBaseElement: elemId,
                      })
                    }
                    className={`p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-300 text-white font-semibold'
                        : 'bg-slate-900/60 border-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[10px] truncate">
                      <span>{ELEMENT_GLYPHS[elemId]}</span>
                      <span className="truncate">{el.shortName}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] text-slate-300 bg-slate-900/70 rounded-lg p-2 border border-white/5">
              <strong className="text-amber-300">
                {activeBaseElem.name}:
              </strong>{' '}
              {activeBaseElem.outsiderHorrorAppearance}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Live 3D Animation Pose & Turntable Control Bar */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-2 max-w-4xl w-full bg-slate-950/80 backdrop-blur-xl border border-white/15 rounded-xl px-3.5 py-2 shadow-xl">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] font-mono uppercase text-slate-400 mr-1">
            3D Pose Animation:
          </span>
          {STUDIO_POSES.map((pose) => (
            <button
              key={pose.id}
              onClick={() => onChangePose(pose.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                studioPose === pose.id
                  ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {pose.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400">
            3D Spin:
          </span>
          <input
            type="range"
            min={-Math.PI}
            max={Math.PI}
            step={0.05}
            value={studioTurntableYaw ?? 0.35}
            onChange={(e) => onChangeTurntableYaw(parseFloat(e.target.value))}
            className="w-24 accent-amber-400 h-1.5 bg-slate-800 rounded cursor-pointer"
          />
          <button
            onClick={onStart3DCutscene}
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
          >
            Begin 3D Cutscene →
          </button>
        </div>
      </div>
    </div>
  );
};
