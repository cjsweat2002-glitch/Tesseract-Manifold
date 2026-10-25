import React, { useEffect, useState } from 'react';
import {
  FreeLookMode,
  GameOptionsConfig,
  GifTypographyStyle,
  PlayableCharacterSpec,
  ReticleStyle,
  RetinalFilterStyle,
} from '../types/manifold';
import {
  ALL_DIFFERENTIAL_BOUNDARY_IDS,
  BiodepthUiAndGraphicsConfig,
  CustomKeybindAction,
  DEFAULT_BIODEPTH_UI_GRAPHICS_CONFIG,
  DEFAULT_KEYBINDS_CONFIG,
  DIFFERENTIAL_UNIVERSE_BOUNDARIES,
  formatKeyCodeLabel,
  GraphicsQualityPreset,
  KEYBIND_ACTION_LABELS,
} from '../types/portalAndBiodepth';
import { BiodepthInteractiveCanvasBackground } from './BiodepthMenuArt';
import { ShapeshiftText } from './ShapeshiftText';
import { Eye, Compass, Sparkles, RotateCcw, Keyboard, Cpu } from 'lucide-react';

interface OpticCalibrationMenuModalProps {
  options: GameOptionsConfig;
  onUpdateOptions: (updated: GameOptionsConfig) => void;
  onResetDefaults: () => void;
  playableCharacter: PlayableCharacterSpec;
  onRequestPointerLockNow: () => void;
  biodepthConfig?: BiodepthUiAndGraphicsConfig;
  onUpdateBiodepthConfig?: (updated: BiodepthUiAndGraphicsConfig) => void;
}

type SomaticOrganSection =
  | 'quick-keys-ui'
  | 'runtime-graphics'
  | 'vestibular-look'
  | 'optic-retinal'
  | 'gif-linguistics';

export const OpticCalibrationMenuModal: React.FC<
  OpticCalibrationMenuModalProps
> = ({
  options,
  onUpdateOptions,
  onResetDefaults,
  playableCharacter,
  onRequestPointerLockNow,
  biodepthConfig = DEFAULT_BIODEPTH_UI_GRAPHICS_CONFIG,
  onUpdateBiodepthConfig,
}) => {
  const [activeOrgan, setActiveOrgan] =
    useState<SomaticOrganSection>('quick-keys-ui');
  const [listeningAction, setListeningAction] =
    useState<CustomKeybindAction | null>(null);

  // Listen for next keypress when rebinding a Quick-Key
  useEffect(() => {
    if (!listeningAction || !onUpdateBiodepthConfig) return;
    const handleKeyCapture = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.code === 'Escape') {
        setListeningAction(null);
        return;
      }
      onUpdateBiodepthConfig({
        ...biodepthConfig,
        keybinds: {
          ...biodepthConfig.keybinds,
          [listeningAction]: e.code,
        },
      });
      setListeningAction(null);
    };
    window.addEventListener('keydown', handleKeyCapture, true);
    return () => window.removeEventListener('keydown', handleKeyCapture, true);
  }, [listeningAction, biodepthConfig, onUpdateBiodepthConfig]);

  const applySensoryPreset = (
    preset: 'glider' | 'fps-lock' | 'gif-fever' | 'cinema'
  ) => {
    if (preset === 'glider') {
      onUpdateOptions({
        ...options,
        freeLookMode: 'cursor-gliding',
        lookSensitivity: 1.25,
        cursorDeadzone: 0.05,
        retinalFilter: 'none',
        gifTypographyStyle: 'per-word-gif',
        gifFrameRateFps: 4,
      });
    } else if (preset === 'fps-lock') {
      onUpdateOptions({
        ...options,
        freeLookMode: 'pointer-lock',
        lookSensitivity: 1.5,
        cursorDeadzone: 0.0,
        reticleStyle: 'tri-laser',
        gifTypographyStyle: 'per-word-gif',
      });
      onRequestPointerLockNow();
    } else if (preset === 'gif-fever') {
      onUpdateOptions({
        ...options,
        retinalFilter: 'chromatic-pulse',
        gifTypographyStyle: 'per-char-gif',
        gifFrameRateFps: 8,
        gifChromaticSplit: true,
        gifSkewMorph: true,
      });
    } else {
      onUpdateOptions({
        ...options,
        hudOpacity: 0.65,
        retinalFilter: 'ossuary-sepia',
        reticleStyle: 'minimal-dot',
        gifTypographyStyle: 'whole-phrase-gif',
        gifFrameRateFps: 2,
      });
    }
  };

  const applyGraphicsPreset = (preset: GraphicsQualityPreset) => {
    if (!onUpdateBiodepthConfig) return;
    if (preset === 'performance') {
      onUpdateBiodepthConfig({
        ...biodepthConfig,
        graphicsPreset: 'performance',
        portalRenderTargetSize: 512,
        enablePortalShaderDistortion: true,
      });
      onUpdateOptions({ ...options, bloomIntensity: 0.85, fogMultiplier: 0.85 });
    } else if (preset === 'balanced') {
      onUpdateBiodepthConfig({
        ...biodepthConfig,
        graphicsPreset: 'balanced',
        portalRenderTargetSize: 768,
        enablePortalShaderDistortion: true,
      });
      onUpdateOptions({ ...options, bloomIntensity: 1.25, fogMultiplier: 1.0 });
    } else {
      onUpdateBiodepthConfig({
        ...biodepthConfig,
        graphicsPreset: 'ultra-biodepth',
        portalRenderTargetSize: 1024,
        enablePortalShaderDistortion: true,
      });
      onUpdateOptions({ ...options, bloomIntensity: 1.55, fogMultiplier: 1.1 });
    }
  };

  return (
    <div className="relative flex flex-col w-full h-full bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/35 rounded-xl p-5 text-slate-100 overflow-hidden shadow-2xl">
      {/* Iconic Living Biodepth Art Canvas Background */}
      <BiodepthInteractiveCanvasBackground
        boundaryId={biodepthConfig.activeUniverseBoundary}
        intensity={0.85}
      />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-4 border-b border-white/15 pr-8">
        <div>
          <div className="text-xs font-mono-tabular text-cyan-300">
            BIODEPTH SOMATIC & QUICK-KEY CALIBRATION · HOST: {playableCharacter.name.toUpperCase()}
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide mt-0.5">
            <ShapeshiftText
              text="Quick-Keys, UI Customizer, Portal Sightline & Sensory Options"
              options={options}
              phaseSeed={3}
            />
          </h2>
        </div>

        {/* Curated Videogame Sensory Presets */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-white/10">
          <button
            onClick={() => applySensoryPreset('glider')}
            className="px-2.5 py-1 text-xs font-medium rounded text-slate-200 hover:bg-amber-500 hover:text-slate-950 transition-colors whitespace-nowrap cursor-pointer"
          >
            Preset: Effortless Glider
          </button>
          <button
            onClick={() => applySensoryPreset('fps-lock')}
            className="px-2.5 py-1 text-xs font-medium rounded text-slate-200 hover:bg-cyan-400 hover:text-slate-950 transition-colors whitespace-nowrap cursor-pointer"
          >
            Preset: 360° FPS Lock
          </button>
          <button
            onClick={() => applySensoryPreset('cinema')}
            className="px-2.5 py-1 text-xs font-medium rounded text-slate-200 hover:bg-emerald-400 hover:text-slate-950 transition-colors whitespace-nowrap cursor-pointer"
          >
            Preset: Clean Diegetic Cinema
          </button>
          <button
            onClick={() => {
              onResetDefaults();
              if (onUpdateBiodepthConfig) {
                onUpdateBiodepthConfig(DEFAULT_BIODEPTH_UI_GRAPHICS_CONFIG);
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Reset all controls, UI, and sensory calibrations to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Main 12-Column Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* Left 4 Columns: Navigation Matrix */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-slate-900/80 border border-white/15 rounded-xl p-4 overflow-y-auto backdrop-blur-md">
          <div className="space-y-2">
            <div className="text-xs font-mono-tabular uppercase tracking-wider text-cyan-300 mb-2">
              BIODEPTH CALIBRATION SECTORS
            </div>

            <button
              onClick={() => setActiveOrgan('quick-keys-ui')}
              className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                activeOrgan === 'quick-keys-ui'
                  ? 'bg-cyan-500/20 border-cyan-400 text-white'
                  : 'bg-slate-950/80 border-white/10 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <div className="text-xs font-semibold flex items-center justify-between">
                <span>01. Quick-Key Bindings & UI Customizer</span>
                <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Rebind Portal [V], Crucible [K], Grab [E] · HUD scale & clutter-free mode
              </p>
            </button>

            <button
              onClick={() => setActiveOrgan('runtime-graphics')}
              className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                activeOrgan === 'runtime-graphics'
                  ? 'bg-emerald-500/20 border-emerald-400 text-white'
                  : 'bg-slate-950/80 border-white/10 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <div className="text-xs font-semibold flex items-center justify-between">
                <span>02. Runtime Graphics & Portal Shader</span>
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                PBR Lighting presets · Splitgate Portal sightline resolution · Biodepth realms
              </p>
            </button>

            <button
              onClick={() => setActiveOrgan('vestibular-look')}
              className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                activeOrgan === 'vestibular-look'
                  ? 'bg-amber-500/15 border-amber-400 text-white'
                  : 'bg-slate-950/80 border-white/10 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <div className="text-xs font-semibold flex items-center justify-between">
                <span>03. Vestibular Free-Look & Motor Cortex</span>
                <Compass className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Look around without clicking & holding · Sensitivity · Pointer-Lock
              </p>
            </button>

            <button
              onClick={() => setActiveOrgan('optic-retinal')}
              className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                activeOrgan === 'optic-retinal'
                  ? 'bg-sky-500/15 border-sky-400 text-white'
                  : 'bg-slate-950/80 border-white/10 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <div className="text-xs font-semibold flex items-center justify-between">
                <span>04. Optic Nerve & Retinal Display</span>
                <Eye className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Retinal post-FX filters · Diegetic HUD opacity · Reticle geometry
              </p>
            </button>

            <button
              onClick={() => setActiveOrgan('gif-linguistics')}
              className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                activeOrgan === 'gif-linguistics'
                  ? 'bg-purple-500/15 border-purple-400 text-white'
                  : 'bg-slate-950/80 border-white/10 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <div className="text-xs font-semibold flex items-center justify-between">
                <span>05. Shapeshifting GIF-Glyph Synapse</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Frame-stepped font metamorphosis · Kinetic skew · Chromatic split
              </p>
            </button>
          </div>
        </div>

        {/* Right 8 Columns: Active Calibration Matrix */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-slate-900/80 border border-white/15 rounded-xl p-5 overflow-y-auto backdrop-blur-md">
          {activeOrgan === 'quick-keys-ui' ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white">
                    01. Quick-Key Option Keys & Diegetic UI Customizer
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Click any Quick-Key badge below and press a key to rebind. Customize HUD scale, opacity, and ultra-minimal diegetic layout.
                  </p>
                </div>
                {onUpdateBiodepthConfig && (
                  <button
                    onClick={() =>
                      onUpdateBiodepthConfig({
                        ...biodepthConfig,
                        keybinds: DEFAULT_KEYBINDS_CONFIG,
                      })
                    }
                    className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 cursor-pointer"
                  >
                    Restore Default Keys
                  </button>
                )}
              </div>

              {/* Click-to-Rebind Quick-Key Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {(
                  Object.keys(KEYBIND_ACTION_LABELS) as CustomKeybindAction[]
                ).map((actionKey) => {
                  const meta = KEYBIND_ACTION_LABELS[actionKey];
                  const boundCode = biodepthConfig.keybinds[actionKey];
                  const isListening = listeningAction === actionKey;

                  return (
                    <div
                      key={actionKey}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/85 border border-white/10"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {meta.label}
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                          {meta.description}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setListeningAction(isListening ? null : actionKey)
                        }
                        className={`shrink-0 px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${
                          isListening
                            ? 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse'
                            : 'bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-200 border-cyan-400/40'
                        }`}
                      >
                        {isListening
                          ? 'Press Key...'
                          : `[${formatKeyCodeLabel(boundCode)}]`}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* UI Scale, Opacity & Minimal Clutter-Free Diegetic Toggle */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-white/10">
                <div className="p-3.5 rounded-xl bg-slate-950/85 border border-white/10 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">HUD Scale</span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {Math.round((biodepthConfig.hudScale ?? 1.0) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.75}
                    max={1.25}
                    step={0.05}
                    value={biodepthConfig.hudScale ?? 1.0}
                    onChange={(e) =>
                      onUpdateBiodepthConfig?.({
                        ...biodepthConfig,
                        hudScale: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/85 border border-white/10 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">HUD Opacity</span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {Math.round(options.hudOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.3}
                    max={1.0}
                    step={0.05}
                    value={options.hudOpacity}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onUpdateOptions({ ...options, hudOpacity: val });
                      onUpdateBiodepthConfig?.({
                        ...biodepthConfig,
                        hudOpacity: val,
                      });
                    }}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <label className="p-3.5 rounded-xl bg-slate-950/85 border border-white/10 flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-white">
                      Ultra-Clean Diegetic HUD
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Collapses secondary telemetry bars for maximum 3D immersion
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={biodepthConfig.minimalDiegeticHud}
                    onChange={(e) =>
                      onUpdateBiodepthConfig?.({
                        ...biodepthConfig,
                        minimalDiegeticHud: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-cyan-400"
                  />
                </label>
              </div>
            </div>
          ) : activeOrgan === 'runtime-graphics' ? (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-white">
                  02. Runtime Graphics, Lighting & Splitgate Portal Sightline Pipeline
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Configure modern ACESFilmic PBR lighting, live WebGLRenderTarget portal sightline resolution, and Differential Universe Boundaries.
                </p>
              </div>

              {/* 3 Graphics Quality Presets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(
                  [
                    {
                      id: 'performance',
                      title: 'Performance (60+ FPS Fast)',
                      desc: '512×512 Portal RenderTarget, streamlined bloom & high-speed chunk culling.',
                    },
                    {
                      id: 'balanced',
                      title: 'Balanced High-Fidelity',
                      desc: '768×768 Portal RenderTarget, calibrated ACESFilmic PBR & soft PCF shadows.',
                    },
                    {
                      id: 'ultra-biodepth',
                      title: 'Ultra Biodepth (Recommended)',
                      desc: '1024×1024 Live Square Room Portal Sightline, full FBM reality-tear shader & volumetric sun shafts.',
                    },
                  ] as { id: GraphicsQualityPreset; title: string; desc: string }[]
                ).map((g) => {
                  const isSel = biodepthConfig.graphicsPreset === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => applyGraphicsPreset(g.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSel
                          ? 'bg-emerald-500/20 border-emerald-400 text-white'
                          : 'bg-slate-950/85 border-white/10 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="text-xs font-bold text-emerald-300 mb-1">
                        {g.title}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {g.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Portal Shader & Sightline Resolution Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/85 border border-white/10 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200 font-semibold">
                      Portal Room Live Sightline Resolution
                    </span>
                    <span className="font-mono text-emerald-300 font-bold">
                      {biodepthConfig.portalRenderTargetSize}×
                      {biodepthConfig.portalRenderTargetSize}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {[512, 768, 1024].map((res) => (
                      <button
                        key={res}
                        onClick={() =>
                          onUpdateBiodepthConfig?.({
                            ...biodepthConfig,
                            portalRenderTargetSize: res,
                          })
                        }
                        className={`flex-1 py-1.5 rounded-lg font-mono text-xs border cursor-pointer ${
                          biodepthConfig.portalRenderTargetSize === res
                            ? 'bg-emerald-400 text-slate-950 border-emerald-300 font-bold'
                            : 'bg-slate-900 text-slate-300 border-white/10'
                        }`}
                      >
                        {res}px
                      </button>
                    ))}
                  </div>
                </div>

                <label className="p-3.5 rounded-xl bg-slate-950/85 border border-white/10 flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-white">
                      FBM Reality-Tear Shader Distortion
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Jagged spacetime fracture edges & gravitational chromatic lensing on portals
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={biodepthConfig.enablePortalShaderDistortion}
                    onChange={(e) =>
                      onUpdateBiodepthConfig?.({
                        ...biodepthConfig,
                        enablePortalShaderDistortion: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-emerald-400"
                  />
                </label>
              </div>

              {/* Differential Universe Boundary Selector */}
              <div className="p-3.5 rounded-xl bg-slate-950/85 border border-white/10 space-y-2.5">
                <div className="text-xs font-bold text-cyan-300 font-mono uppercase tracking-wider">
                  Active Biodepth Differential Universe Boundary
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {ALL_DIFFERENTIAL_BOUNDARY_IDS.map((bId) => {
                    const bSpec = DIFFERENTIAL_UNIVERSE_BOUNDARIES[bId];
                    const isCurrent =
                      biodepthConfig.activeUniverseBoundary === bId;
                    return (
                      <button
                        key={bId}
                        onClick={() =>
                          onUpdateBiodepthConfig?.({
                            ...biodepthConfig,
                            activeUniverseBoundary: bId,
                          })
                        }
                        className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                          isCurrent
                            ? 'border-cyan-400 bg-cyan-950/50 text-white font-bold'
                            : 'border-white/10 bg-slate-900/80 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div
                          className="text-[10px] font-mono truncate"
                          style={{ color: bSpec.primaryAccentHex }}
                        >
                          {bSpec.name.split(' ')[0]}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate mt-0.5">
                          -{bSpec.biodepthStratumDepthKm}km
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : activeOrgan === 'vestibular-look' ? (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-white">
                  <ShapeshiftText
                    text="03. Vestibular Free-Look & Camera Kinematics"
                    options={options}
                  />
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure how your gaze rotates the 1st-person and 3rd-person manifold camera without holding mouse buttons
                </p>
              </div>

              {/* Free-Look Mode Selector Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(
                  [
                    {
                      id: 'cursor-gliding',
                      title: 'Effortless Hover-Look (Active)',
                      desc: 'Move your cursor freely across the screen to look around—zero clicking or holding required.',
                    },
                    {
                      id: 'pointer-lock',
                      title: '360° Raw Pointer-Lock FPS',
                      desc: 'Locks the mouse cursor into the 3D viewport for infinite 360-degree first/third-person turning.',
                    },
                    {
                      id: 'click-drag',
                      title: 'Classic Click & Hold Orbit',
                      desc: 'Only rotates the camera while holding down the primary mouse button.',
                    },
                  ] as { id: FreeLookMode; title: string; desc: string }[]
                ).map((m) => {
                  const isSel = options.freeLookMode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        onUpdateOptions({ ...options, freeLookMode: m.id });
                        if (m.id === 'pointer-lock') {
                          onRequestPointerLockNow();
                        }
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSel
                          ? 'bg-amber-500/20 border-amber-400 text-white'
                          : 'bg-slate-950/80 border-white/10 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="text-xs font-bold text-amber-400 mb-1">
                        {m.title}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {m.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Sliders for Sensitivity, Deadzone, Camera Roll & FOV Warp */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-lg bg-slate-950/80 border border-white/10 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Gaze Look Sensitivity</span>
                    <span className="font-mono-tabular text-amber-400">
                      {options.lookSensitivity.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={3.0}
                    step={0.05}
                    value={options.lookSensitivity}
                    onChange={(e) =>
                      onUpdateOptions({
                        ...options,
                        lookSensitivity: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950/80 border border-white/10 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">
                      Center Rest Deadzone (Hover-Look)
                    </span>
                    <span className="font-mono-tabular text-amber-400">
                      {Math.round(options.cursorDeadzone * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={0.25}
                    step={0.01}
                    value={options.cursorDeadzone}
                    onChange={(e) =>
                      onUpdateOptions({
                        ...options,
                        cursorDeadzone: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950/80 border border-white/10 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">
                      Manifold Collision & Strafe Roll
                    </span>
                    <span className="font-mono-tabular text-cyan-400">
                      {Math.round(options.cameraRollIntensity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={2.0}
                    step={0.1}
                    value={options.cameraRollIntensity}
                    onChange={(e) =>
                      onUpdateOptions({
                        ...options,
                        cameraRollIntensity: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950/80 border border-white/10 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">
                      Velocity & 4D W-Phase FOV Warp
                    </span>
                    <span className="font-mono-tabular text-cyan-400">
                      {Math.round(options.fovWarpIntensity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={2.0}
                    step={0.1}
                    value={options.fovWarpIntensity}
                    onChange={(e) =>
                      onUpdateOptions({
                        ...options,
                        fovWarpIntensity: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950/80 border border-white/10">
                <div>
                  <div className="text-xs font-semibold text-white">
                    Invert Vertical Pitch Axis (Y-Axis)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Flight-stick style pitch inversion when looking up or down
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={options.invertPitchY}
                  onChange={(e) =>
                    onUpdateOptions({
                      ...options,
                      invertPitchY: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          ) : activeOrgan === 'optic-retinal' ? (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-white">
                  <ShapeshiftText
                    text="04. Optic Nerve & Retinal Display Calibration"
                    options={options}
                  />
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tune ocular post-processing shaders, reticle symbology, and diegetic HUD transparency
                </p>
              </div>

              {/* Retinal Post-Processing Filter */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Retinal Optical Filter
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(
                    [
                      ['none', 'Pure Manifold'],
                      ['chromatic-pulse', 'Chromatic Split'],
                      ['biolum-contrast', 'Biolum Nocturne'],
                      ['vitreous-crt', 'Vitreous Scanline'],
                      ['ossuary-sepia', 'Ossuary Memory'],
                    ] as [RetinalFilterStyle, string][]
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() =>
                        onUpdateOptions({ ...options, retinalFilter: id })
                      }
                      className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-colors cursor-pointer ${
                        options.retinalFilter === id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-semibold'
                          : 'bg-slate-950/80 border-white/10 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Center Aiming Reticle Symbology */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Ocular Reticle Symbology
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      ['tesseract-cross', '4D Tesseract Cross'],
                      ['biological-iris', 'Somatic Iris Ring'],
                      ['tri-laser', 'Tri-Vector Predator'],
                      ['minimal-dot', 'Pinpoint Singularity'],
                    ] as [ReticleStyle, string][]
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() =>
                        onUpdateOptions({ ...options, reticleStyle: id })
                      }
                      className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-colors cursor-pointer ${
                        options.reticleStyle === id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-semibold'
                          : 'bg-slate-950/80 border-white/10 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-lg bg-slate-950/80 border border-amber-400/40 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-amber-200 font-semibold">
                      Global Post-Processing Bloom Intensity
                    </span>
                    <span className="font-mono-tabular text-amber-400 font-bold">
                      {(options.bloomIntensity ?? 1.35).toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={3.0}
                    step={0.05}
                    value={options.bloomIntensity ?? 1.35}
                    onChange={(e) =>
                      onUpdateOptions({
                        ...options,
                        bloomIntensity: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-400 leading-tight">
                    Amplifies HDR UnrealBloom radiance on portals and 4D artforms
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950/80 border border-white/10 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Diegetic HUD Opacity</span>
                    <span className="font-mono-tabular text-cyan-400">
                      {Math.round(options.hudOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.25}
                    max={1.0}
                    step={0.05}
                    value={options.hudOpacity}
                    onChange={(e) =>
                      onUpdateOptions({
                        ...options,
                        hudOpacity: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950/80 border border-white/10 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">
                      Atmospheric Fog Density Multiplier
                    </span>
                    <span className="font-mono-tabular text-cyan-400">
                      {options.fogMultiplier.toFixed(1)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={2.2}
                    step={0.1}
                    value={options.fogMultiplier}
                    onChange={(e) =>
                      onUpdateOptions({
                        ...options,
                        fogMultiplier: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Organ 5: Shapeshifting GIF-Glyph Synapse */
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-white">
                  <ShapeshiftText
                    text="05. Shapeshifting GIF-Glyph Typography Engine"
                    options={options}
                  />
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Make the fonts and text of the application itself shapeshift and cycle across dimensional typefaces like a living animated GIF
                </p>
              </div>

              {/* Live Interactive GIF-Typography Oscilloscope Preview Box */}
              <div className="p-4 rounded-xl bg-[#060810] border border-purple-500/40 flex flex-col items-center justify-center text-center min-h-[104px] space-y-1.5">
                <div className="text-[11px] font-mono-tabular text-purple-400">
                  LIVE GIF-GLYPH METAMORPHOSIS PREVIEW ({options.gifFrameRateFps} FPS)
                </div>
                <div className="text-2xl font-bold text-white tracking-wide">
                  <ShapeshiftText
                    text="THE MANIFOLD REMEMBERS EVERY FORM"
                    options={options}
                  />
                </div>
              </div>

              {/* GIF Typography Granularity Mode */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(
                  [
                    [
                      'per-char-gif',
                      'Per-Letter GIF Wave',
                      'Every individual character cycles through the 7 dimensional fonts.',
                    ],
                    [
                      'per-word-gif',
                      'Per-Word GIF Cycle',
                      'Words shapeshift independently like kinetic ransom-cut frames.',
                    ],
                    [
                      'whole-phrase-gif',
                      'Unified Title Card GIF',
                      'Entire headings step-morph in unison on each frame beat.',
                    ],
                    [
                      'calm-static',
                      'Epoch Anchor (Static)',
                      'Locks typography to the active Game Version’s signature font.',
                    ],
                  ] as [GifTypographyStyle, string, string][]
                ).map(([id, title, desc]) => (
                  <button
                    key={id}
                    onClick={() =>
                      onUpdateOptions({ ...options, gifTypographyStyle: id })
                    }
                    className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      options.gifTypographyStyle === id
                        ? 'bg-purple-500/20 border-purple-400 text-white'
                        : 'bg-slate-950/80 border-white/10 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="text-xs font-bold text-purple-300 mb-1">
                      {title}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {desc}
                    </p>
                  </button>
                ))}
              </div>

              {/* Frame Rate & Kinetic Modifiers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg bg-slate-950/80 border border-white/10 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">GIF Morph Speed</span>
                    <span className="font-mono-tabular text-purple-400">
                      {options.gifFrameRateFps} FPS
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    step={1}
                    value={options.gifFrameRateFps}
                    onChange={(e) =>
                      onUpdateOptions({
                        ...options,
                        gifFrameRateFps: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <label className="p-3.5 rounded-lg bg-slate-950/80 border border-white/10 flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Chromatic RGB Split
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Cyan/Rose stereo edge fringe
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={options.gifChromaticSplit}
                    onChange={(e) =>
                      onUpdateOptions({
                        ...options,
                        gifChromaticSplit: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-purple-500"
                  />
                </label>

                <label className="p-3.5 rounded-lg bg-slate-950/80 border border-white/10 flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Kinetic Italic Shear
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Frame-stepped angular glyph skew
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={options.gifSkewMorph}
                    onChange={(e) =>
                      onUpdateOptions({
                        ...options,
                        gifSkewMorph: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-purple-500"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Footer Hint */}
          <div className="pt-4 mt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 font-mono-tabular">
            <span>
              Portal Quick-Key: <strong className="text-cyan-300">[{formatKeyCodeLabel(biodepthConfig.keybinds.openPortal)}]</strong> · Crucible/Room: <strong className="text-amber-300">[{formatKeyCodeLabel(biodepthConfig.keybinds.toggleCrucible)}]</strong>
            </span>
            <span>
              Graphics Pipeline: <strong className="text-emerald-300">{biodepthConfig.graphicsPreset.toUpperCase()}</strong> ({biodepthConfig.portalRenderTargetSize}px Sightline)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
