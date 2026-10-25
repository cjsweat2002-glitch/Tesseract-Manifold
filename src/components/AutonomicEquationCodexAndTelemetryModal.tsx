import React, { useState } from 'react';
import {
  AutonomicArchitectureSnapshot,
  AutonomicSelfTuningParameters,
  GameplayDiscoveryTriggerKind,
  NonlinearOperatorId,
} from '../utils/autonomicArchitectureAndEquationEngine';
import { Activity, Cpu, Compass, Sliders, Sparkles, RotateCcw, X } from 'lucide-react';

interface AutonomicHudCompactBadgeProps {
  snapshot: AutonomicArchitectureSnapshot;
  onOpenInspectorModal: () => void;
  onSynthesizeDiscoveryNow: (kind: GameplayDiscoveryTriggerKind) => void;
}

export const AutonomicHudCompactBadge: React.FC<AutonomicHudCompactBadgeProps> = ({
  snapshot,
  onOpenInspectorModal,
}) => {
  const { fieldState, stats, latestToastMutation, tuning } = snapshot;

  return (
    <div className="pointer-events-auto flex flex-col items-end gap-1.5">
      {/* Compact Top-Bar Telemetry & Equation Codex Trigger Button (Zero Blur for Max WebGL Fill-Rate) */}
      <button
        onClick={onOpenInspectorModal}
        className="px-2.5 py-1.5 rounded-lg bg-[#090D16] hover:bg-[#111827] border border-sky-400/35 text-left transition-colors shadow-xl flex items-center gap-2.5 cursor-pointer"
        title="Open Self-Evolving Mathematical Equation Codex & Consumer-Experience Telemetry Inspector [Key U]"
      >
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="text-[11px] font-bold tracking-tight text-white whitespace-nowrap">
            Gen-{fieldState.generationTier} Equation
          </span>
        </div>

        <span className="text-slate-600">|</span>

        <div className="flex items-center gap-2 font-mono tabular-nums text-[10px]">
          <span className="text-emerald-300 font-semibold whitespace-nowrap">
            Flow {stats.playerFlowIndex}%
          </span>
          <span className="text-amber-300 font-semibold whitespace-nowrap">
            R={fieldState.kuramotoOrderParameterR.toFixed(2)}
          </span>
          <span
            className={`font-semibold whitespace-nowrap ${
              stats.fps >= 48
                ? 'text-sky-300'
                : stats.fps >= 30
                ? 'text-amber-300'
                : 'text-rose-400'
            }`}
          >
            {stats.fps} FPS
          </span>
        </div>

        <span className="px-1.5 py-0.5 rounded bg-sky-500/15 border border-sky-400/30 text-[9px] font-mono tabular-nums text-sky-200">
          {tuning.autonomicModeEnabled ? 'AUTO-PID' : 'MANUAL'} [U]
        </span>
      </button>

      {/* Non-Intrusive Symbolic Equation Discovery Toast */}
      {latestToastMutation && (
        <div
          onClick={onOpenInspectorModal}
          className="max-w-xs px-3 py-2 rounded-lg bg-[#090D16] border border-amber-400/50 shadow-2xl cursor-pointer transition-opacity"
        >
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              Equation Mutated · Gen-{latestToastMutation.generationTier}
            </span>
            <span className="text-[10px] font-mono tabular-nums text-sky-300">
              +{latestToastMutation.deltaCoupling.toFixed(2)} Coupling
            </span>
          </div>
          <div className="text-xs font-semibold text-white truncate">
            {latestToastMutation.mutationTitle}
          </div>
          <div className="mt-0.5 font-mono tabular-nums text-[10px] text-sky-300 truncate">
            {latestToastMutation.synthesizedTermSymbol}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-300 line-clamp-2">
            {latestToastMutation.architecturalEffectSummary}
          </div>
        </div>
      )}
    </div>
  );
};

interface AutonomicEquationCodexAndTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: AutonomicArchitectureSnapshot;
  onToggleOperator: (id: NonlinearOperatorId) => void;
  onChangeOperatorWeight: (id: NonlinearOperatorId, weight: number) => void;
  onUpdateTuning: (patch: Partial<AutonomicSelfTuningParameters>) => void;
  onSynthesizeDiscoveryNow: (kind: GameplayDiscoveryTriggerKind) => void;
  onResculptTerrainWithEvolvedEquations: () => void;
  onResetDefaults: () => void;
}

export const AutonomicEquationCodexAndTelemetryModal: React.FC<
  AutonomicEquationCodexAndTelemetryModalProps
> = ({
  isOpen,
  onClose,
  snapshot,
  onToggleOperator,
  onChangeOperatorWeight,
  onUpdateTuning,
  onSynthesizeDiscoveryNow,
  onResculptTerrainWithEvolvedEquations,
  onResetDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<'equation-codex' | 'autonomic-pid'>(
    'equation-codex'
  );

  if (!isOpen) return null;

  const { fieldState, operators, tuning, stats, mutationLog, totalDiscoveriesCount } =
    snapshot;

  const operatorList = Object.values(operators);

  return (
    <div
      onClick={onClose}
      className="pointer-events-auto fixed inset-0 z-40 bg-black/80 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl max-h-[88vh] bg-[#090D16] border border-slate-700/80 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Top Modal Header */}
        <div className="px-5 py-4 bg-[#111827] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                Autonomic Architecture & Persistent Mathematical Codex
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-400/30 font-mono tabular-nums text-[11px] text-amber-300">
                {totalDiscoveriesCount} Discovered Mutations
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              {fieldState.generationTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('equation-codex')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'equation-codex'
                  ? 'bg-sky-400 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Symbolic Equation Codex
            </button>
            <button
              onClick={() => setActiveTab('autonomic-pid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'autonomic-pid'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Consumer-Experience & Runtime PID
            </button>
            <button
              onClick={onResetDefaults}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Reset Codex & Autonomic Tuning to Baseline"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Close Inspector (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Master Coupled Symbolic Equation Banner */}
        <div className="px-5 py-3 bg-[#060911] border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Active Master Coupled Nonlinear Differential Law
            </div>
            <div className="font-mono tabular-nums text-xs sm:text-sm text-sky-300 font-semibold truncate mt-0.5">
              {fieldState.masterSymbolicEquation}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSynthesizeDiscoveryNow('kinetic-grapple-apex')}
              className="px-2.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              + Synthesize Symbolic Term
            </button>
            <button
              onClick={onResculptTerrainWithEvolvedEquations}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Apply Equations to 3D Terrain
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'equation-codex' ? (
            <>
              {/* 4 Coupled Nonlinear Differential & Tensor Operators */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Coupled Nonlinear Differential & Tensor Operators
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Directly coupled to 3D terrain relief, PBR shader wear/veins, grapple apex physics, and 4D AI
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {operatorList.map((op) => (
                    <div
                      key={op.id}
                      className={`p-4 rounded-xl border transition-colors ${
                        op.enabled
                          ? 'bg-[#111827] border-sky-500/35'
                          : 'bg-[#0B0F19] border-slate-800 opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              {op.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono tabular-nums text-[10px] text-amber-300">
                              Gen-{op.mutationGeneration}
                            </span>
                          </div>
                          <div className="font-mono tabular-nums text-xs text-sky-300 mt-1">
                            {op.symbolicFormula}
                          </div>
                        </div>

                        <button
                          onClick={() => onToggleOperator(op.id)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                            op.enabled
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {op.enabled ? 'COUPLED' : 'BYPASSED'}
                        </button>
                      </div>

                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        {op.coupledDomainSummary}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <div className="font-mono tabular-nums text-[11px] text-amber-300">
                          {op.liveStateReadout}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">
                            Weight:
                          </span>
                          <input
                            type="range"
                            min={0}
                            max={2.4}
                            step={0.05}
                            value={op.couplingWeight}
                            onChange={(e) =>
                              onChangeOperatorWeight(
                                op.id,
                                parseFloat(e.target.value)
                              )
                            }
                            className="w-24 accent-sky-400 cursor-pointer"
                          />
                          <span className="font-mono tabular-nums text-xs text-white w-9 text-right">
                            {op.couplingWeight.toFixed(2)}×
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trigger Specific Domain Equation Synthesis */}
              <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
                  Synthesize Domain-Specific Symbolic Mutation
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {(
                    [
                      ['kinetic-grapple-apex', 'Grapple Geodesic'],
                      ['visceral-limb-cleave', 'Vein Morphogen'],
                      ['tectonic-excavation', 'Tectonic Biharmonic'],
                      ['non-euclidean-portal-transit', 'Portal Holonomy'],
                      ['dimensional-w-shift', '4D W-Attractor'],
                      ['architectural-sintering', 'TPMS Gyroid Sinter'],
                    ] as [GameplayDiscoveryTriggerKind, string][]
                  ).map(([kind, label]) => (
                    <button
                      key={kind}
                      onClick={() => onSynthesizeDiscoveryNow(kind)}
                      className="px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-white transition-colors text-center cursor-pointer"
                    >
                      + {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Persistent Cross-Session Equation Discovery Lineage */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
                  Persistent Equation Discovery Lineage (Compounds Across Updates & Sessions)
                </h3>
                {mutationLog.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 text-xs text-slate-400">
                    Perform high-velocity grapple swings, excavate terrain, cleave enemies, or transit non-Euclidean portals to automatically synthesize higher-order symbolic equation mutations.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {mutationLog.map((rec) => (
                      <div
                        key={rec.id}
                        className="px-3.5 py-2.5 rounded-lg bg-[#111827] border border-slate-800 flex flex-wrap items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-sky-500/15 font-mono tabular-nums text-[10px] text-sky-300">
                              Gen-{rec.generationTier}
                            </span>
                            <span className="text-xs font-bold text-white">
                              {rec.mutationTitle}
                            </span>
                            <span className="font-mono tabular-nums text-xs text-amber-300">
                              {rec.synthesizedTermSymbol}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300 mt-0.5">
                            {rec.architecturalEffectSummary}
                          </div>
                        </div>
                        <div className="font-mono tabular-nums text-[11px] text-emerald-300 shrink-0">
                          +{rec.deltaCoupling.toFixed(2)}× Coupling
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Dual Telemetry Cards: Hardware FPS Budget vs. Player Flow-State Psychology */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 1: Player Psychology & Consumer-Experience Ergonomics */}
                <div className="p-4 rounded-xl bg-[#111827] border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        Player Flow-State & Ergonomics
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-400/30 text-[11px] font-semibold text-emerald-200">
                      {stats.activeFlowStateClassification}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono tabular-nums">
                    <div className="p-2.5 rounded-lg bg-[#090D16] border border-slate-800">
                      <div className="text-[10px] text-slate-400">
                        Composite Flow Index
                      </div>
                      <div className="text-base font-bold text-emerald-300 mt-0.5">
                        {stats.playerFlowIndex}%
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#090D16] border border-slate-800">
                      <div className="text-[10px] text-slate-400">
                        Momentum Continuity
                      </div>
                      <div className="text-base font-bold text-sky-300 mt-0.5">
                        {stats.traversalMomentumContinuity}%
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#090D16] border border-slate-800">
                      <div className="text-[10px] text-slate-400">
                        Camera Stability
                      </div>
                      <div className="text-base font-bold text-white mt-0.5">
                        {stats.cameraErgonomicStability}%
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#090D16] border border-slate-800">
                      <div className="text-[10px] text-slate-400">
                        Grapple Rhythm
                      </div>
                      <div className="text-base font-bold text-amber-300 mt-0.5">
                        {stats.grappleHarmonicRhythm}%
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#090D16] border border-slate-800">
                      <div className="text-[10px] text-slate-400">
                        Combat Hit Cadence
                      </div>
                      <div className="text-base font-bold text-rose-300 mt-0.5">
                        {stats.combatHitCadenceScore}%
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#090D16] border border-slate-800">
                      <div className="text-[10px] text-slate-400">
                        Apex Conservation
                      </div>
                      <div className="text-base font-bold text-purple-300 mt-0.5">
                        {fieldState.geodesicApexConservation.toFixed(2)}×
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Hardware Frame-Pacing & Rendering Pipeline Telemetry */}
                <div className="p-4 rounded-xl bg-[#111827] border border-sky-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
                        Hardware Frame-Budget & Pipeline Stats
                      </span>
                    </div>
                    <span className="font-mono tabular-nums text-xs font-bold text-white">
                      {stats.fps} FPS ({stats.emaFrameTimeMs.toFixed(1)} ms)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono tabular-nums">
                    <div className="p-2.5 rounded-lg bg-[#090D16] border border-slate-800">
                      <div className="text-[10px] text-slate-400">
                        95th-Pct Frame Time
                      </div>
                      <div className="text-base font-bold text-sky-300 mt-0.5">
                        {stats.p95FrameTimeMs.toFixed(1)} ms
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#090D16] border border-slate-800">
                      <div className="text-[10px] text-slate-400">
                        Frame Jitter
                      </div>
                      <div className="text-base font-bold text-emerald-300 mt-0.5">
                        ±{stats.frameJitterMs.toFixed(1)} ms
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#090D16] border border-slate-800">
                      <div className="text-[10px] text-slate-400">
                        Adaptive Pixel Ratio
                      </div>
                      <div className="text-base font-bold text-amber-300 mt-0.5">
                        {stats.activePixelRatio.toFixed(2)}×
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#090D16] border border-slate-800">
                      <div className="text-[10px] text-slate-400">
                        Pooled PBR Materials
                      </div>
                      <div className="text-base font-bold text-white mt-0.5">
                        {stats.pooledMaterialCount}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#090D16] border border-slate-800">
                      <div className="text-[10px] text-slate-400">
                        Spatial Colliders
                      </div>
                      <div className="text-base font-bold text-purple-300 mt-0.5">
                        {stats.spatialColliderCount}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#090D16] border border-slate-800">
                      <div className="text-[10px] text-slate-400">
                        Physics Sub-Steps
                      </div>
                      <div className="text-base font-bold text-cyan-300 mt-0.5">
                        {tuning.physicsSolverSubSteps}× / frame
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Closed-Loop Autonomic PID Self-Tuning Parameters */}
              <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Closed-Loop Autonomic PID Self-Tuning Parameters
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      When Autonomic Mode is active, the architecture continuously self-tunes camera springs, step-up tolerances, shader octaves, and AI pacing from live telemetry.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      onUpdateTuning({
                        autonomicModeEnabled: !tuning.autonomicModeEnabled,
                      })
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      tuning.autonomicModeEnabled
                        ? 'bg-emerald-400 text-slate-950'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {tuning.autonomicModeEnabled
                      ? 'AUTONOMIC SELF-TUNING: ON'
                      : 'MANUAL OVERRIDE MODE'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-3 rounded-lg bg-[#090D16] border border-slate-800">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">
                        Camera Spring Stiffness
                      </span>
                      <span className="font-mono tabular-nums text-sky-300">
                        {tuning.cameraSpringStiffnessMultiplier.toFixed(2)}×
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.7}
                      max={1.45}
                      step={0.02}
                      value={tuning.cameraSpringStiffnessMultiplier}
                      onChange={(e) =>
                        onUpdateTuning({
                          autonomicModeEnabled: false,
                          cameraSpringStiffnessMultiplier: parseFloat(
                            e.target.value
                          ),
                        })
                      }
                      className="w-full accent-sky-400 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-[#090D16] border border-slate-800">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">FOV Warp Damping</span>
                      <span className="font-mono tabular-nums text-sky-300">
                        {tuning.fovWarpDampingMultiplier.toFixed(2)}×
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.6}
                      max={1.3}
                      step={0.02}
                      value={tuning.fovWarpDampingMultiplier}
                      onChange={(e) =>
                        onUpdateTuning({
                          autonomicModeEnabled: false,
                          fovWarpDampingMultiplier: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-sky-400 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-[#090D16] border border-slate-800">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">
                        Step-Up Ledge Clearance
                      </span>
                      <span className="font-mono tabular-nums text-emerald-300">
                        {tuning.stepUpHeightAllowanceM.toFixed(2)} m
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={0.86}
                      step={0.02}
                      value={tuning.stepUpHeightAllowanceM}
                      onChange={(e) =>
                        onUpdateTuning({
                          autonomicModeEnabled: false,
                          stepUpHeightAllowanceM: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-[#090D16] border border-slate-800">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">
                        Slope Traction Multiplier
                      </span>
                      <span className="font-mono tabular-nums text-emerald-300">
                        {tuning.slopeSlideFrictionMultiplier.toFixed(2)}×
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.75}
                      max={1.4}
                      step={0.02}
                      value={tuning.slopeSlideFrictionMultiplier}
                      onChange={(e) =>
                        onUpdateTuning({
                          autonomicModeEnabled: false,
                          slopeSlideFrictionMultiplier: parseFloat(
                            e.target.value
                          ),
                        })
                      }
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-[#090D16] border border-slate-800">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">
                        Shader Noise Octave Budget
                      </span>
                      <span className="font-mono tabular-nums text-amber-300">
                        {tuning.shaderNoiseOctaveBudget.toFixed(2)} Oct
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1.0}
                      max={3.0}
                      step={0.1}
                      value={tuning.shaderNoiseOctaveBudget}
                      onChange={(e) =>
                        onUpdateTuning({
                          autonomicModeEnabled: false,
                          shaderNoiseOctaveBudget: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-[#090D16] border border-slate-800">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">
                        Adaptive AI Encounter Pacing
                      </span>
                      <span className="font-mono tabular-nums text-amber-300">
                        {tuning.aiEncounterPacingMultiplier.toFixed(2)}×
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.65}
                      max={1.45}
                      step={0.02}
                      value={tuning.aiEncounterPacingMultiplier}
                      onChange={(e) =>
                        onUpdateTuning({
                          autonomicModeEnabled: false,
                          aiEncounterPacingMultiplier: parseFloat(
                            e.target.value
                          ),
                        })
                      }
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
