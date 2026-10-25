import React, { useState } from 'react';
import {
  AbsurdTimelineSpec,
  ALL_PORTAL_GATE_SHAPE_IDS,
  BODY_MOD_CATALOG,
  BodyModId,
  PORTAL_GATE_SHAPE_CATALOG,
  PortalGateShapeId,
  TRAVERSAL_VEHICLE_CATALOG,
  TraversalVehicleType,
  VOID_ANOMALY_RESOURCE_CATALOG,
  VOID_BALL_UPGRADE_BRANCHES,
  VoidAnomalyResourceId,
  VoidBallActiveBeamMode,
  VoidBallEvolutionState,
  VoidBallUpgradeBranchId,
} from '../types/portalAndBiodepth';
import {
  generateRandomAbsurdCoordinate,
  PRESET_TIMELINE_COORDINATES,
  spliceTwoTimelines,
  synthesizeInfiniteTimelineFromCoordinate,
  synthesizeProceduralTimelineItems,
} from '../utils/infiniteTimelineAndVoidEngine';
import { DimensionalItemDefinition } from '../utils/bethesdaScaleCompendiumEngine';
import { GrappleSurfaceRangeTelemetry } from '../utils/grappleHookController';

interface InfiniteTimelineCompactHUDProps {
  voidState: VoidBallEvolutionState;
  onToggleTimelinePortal: () => void;
  onEnterOrExitInBetweenVoidNow: () => void;
  onFireVoidBeam: () => void;
  onCycleVoidBeamMode: () => void;
  onQuickJumpRandomTimeline: () => void;
  onOpenTimelineModal: () => void;
  activeVehicleType?: TraversalVehicleType;
  isVehicleMounted?: boolean;
  onCycleVehicleType?: () => void;
  onFireGrappleHook?: () => void;
  grappleActive?: boolean;
  grappleAnchorLabel?: string;
  grappleRangeTelemetry?: GrappleSurfaceRangeTelemetry | null;
  equippedBodyMods?: BodyModId[];
  onTriggerMantisFlurry?: () => void;
  onTriggerBodyModFlurry?: () => void;
  hudOpacity?: number;
  isAnyModalOpen?: boolean;
}

export const InfiniteTimelineCompactHUD: React.FC<
  InfiniteTimelineCompactHUDProps
> = ({
  voidState,
  onToggleTimelinePortal,
  onEnterOrExitInBetweenVoidNow,
  onFireVoidBeam,
  onCycleVoidBeamMode,
  onQuickJumpRandomTimeline,
  onOpenTimelineModal,
  activeVehicleType = 'twin-turbine-hover-bike',
  isVehicleMounted = false,
  onCycleVehicleType,
  onFireGrappleHook,
  grappleActive = false,
  grappleAnchorLabel = 'None',
  grappleRangeTelemetry = null,
  onTriggerMantisFlurry,
  onTriggerBodyModFlurry,
  hudOpacity = 0.94,
  isAnyModalOpen = false,
}) => {
  if (isAnyModalOpen) return null;

  const { activeTimeline, pendingDestinationTimeline, activeGateShape } =
    voidState;
  const gateSpec = PORTAL_GATE_SHAPE_CATALOG[activeGateShape];
  const vehicleSpec = TRAVERSAL_VEHICLE_CATALOG[activeVehicleType];
  const beamLabel =
    voidState.activeBeamMode === 'gravity-inversion-beam'
      ? 'Zero-G Beam'
      : voidState.activeBeamMode === 'temporal-dilation-beam'
      ? 'Stasis Beam'
      : 'Mutation Ray';

  return (
    <>
      {/* Top-Center Contextual Banner when inside the Playable Zero-G In-Between Timeline Void */}
      {voidState.isPlayerInsideInBetweenVoid && (
        <div
          style={{ opacity: hudOpacity }}
          className="pointer-events-auto absolute top-16 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4"
        >
          <div className="bg-[#050C0A]/94 border border-emerald-400/50 rounded-xl px-4 py-3 shadow-2xl">
            <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-emerald-300">
              <span>
                IN-BETWEEN TIMELINE VOID · ZERO-G ANOMALY RIFT ·{' '}
                {voidState.discoveredTimelines.length} TIMELINES MAPPED
              </span>
              <button
                onClick={onEnterOrExitInBetweenVoidNow}
                className="px-2.5 py-1 rounded-md bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold cursor-pointer"
              >
                Complete Jump → {pendingDestinationTimeline.coordinateCode}
              </button>
            </div>
            <div className="mt-1 text-xs text-slate-200">
              Glide with{' '}
              <span className="font-mono text-emerald-300">
                [WASD + Space/Shift]
              </span>{' '}
              to harvest floating Void Shards · Walk through{' '}
              <span className="text-emerald-300 font-semibold">
                North Gate ({pendingDestinationTimeline.title})
              </span>{' '}
              or South Gate to return.
            </div>
          </div>
        </div>
      )}

      {/* Timeline & Traversal controls are unified inside VoidBallDialAndMindspaceHUD's single Command Shell */}
    </>
  );
};

interface InfiniteTimelineAndVoidBallModalProps {
  isOpen: boolean;
  onClose: () => void;
  voidState: VoidBallEvolutionState;
  onDialTimelineCoordinate: (
    timeline: AbsurdTimelineSpec,
    jumpImmediately: boolean
  ) => void;
  onSelectGateShape: (shapeId: PortalGateShapeId) => void;
  onSelectBeamMode: (mode: VoidBallActiveBeamMode) => void;
  onUpgradeBranch: (branchId: VoidBallUpgradeBranchId) => void;
  onEnterOrExitInBetweenVoidNow: () => void;
  onClaimAndEquipProceduralItem?: (item: DimensionalItemDefinition) => void;
  activeVehicleType?: TraversalVehicleType;
  isVehicleMounted?: boolean;
  onSelectVehicleType?: (vType: TraversalVehicleType, mountNow: boolean) => void;
  equippedBodyMods?: BodyModId[];
  onToggleBodyMod?: (modId: BodyModId) => void;
  onTriggerMantisFlurry?: () => void;
}

export const InfiniteTimelineAndVoidBallModal: React.FC<
  InfiniteTimelineAndVoidBallModalProps
> = ({
  isOpen,
  onClose,
  voidState,
  onDialTimelineCoordinate,
  onSelectGateShape,
  onSelectBeamMode,
  onUpgradeBranch,
  onEnterOrExitInBetweenVoidNow,
  onClaimAndEquipProceduralItem,
  activeVehicleType = 'twin-turbine-hover-bike',
  isVehicleMounted = false,
  onSelectVehicleType,
  equippedBodyMods = [
    'cyber-wings',
    'mantis-blades',
    'thruster-legs',
    'wall-run-boots',
  ],
  onToggleBodyMod,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'dialer-splicer'
    | 'vehicles-bodymods'
    | 'gate-shapes'
    | 'void-ball-upgrades'
  >('dialer-splicer');
  const [customCoordInput, setCustomCoordInput] = useState<string>(
    voidState.pendingDestinationTimeline.coordinateCode
  );
  const [spliceCoordA, setSpliceCoordA] = useState<string>('COB-994');
  const [spliceCoordB, setSpliceCoordB] = useState<string>('J19-ZETA-7');

  if (!isOpen) return null;

  const previewTimeline =
    synthesizeInfiniteTimelineFromCoordinate(customCoordInput);
  const previewProceduralItems =
    synthesizeProceduralTimelineItems(previewTimeline);
  const spliceUnlocked =
    (voidState.branchTiers['reality-splicing-coordinates'] ?? 1) >= 2;
  const omniversalGateMastery =
    (voidState.branchTiers['reality-splicing-coordinates'] ?? 1) >= 4;

  const handleSynthesizeSplicedTimeline = (jumpNow: boolean) => {
    const tA = synthesizeInfiniteTimelineFromCoordinate(spliceCoordA);
    const tB = synthesizeInfiniteTimelineFromCoordinate(spliceCoordB);
    const hybrid = spliceTwoTimelines(tA, tB);
    setCustomCoordInput(hybrid.coordinateCode);
    onDialTimelineCoordinate(hybrid, jumpNow);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="w-full max-w-6xl max-h-[90vh] bg-[#070B12] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-emerald-400">
              CENTRAL FINITE CURVE & BEYOND ·{' '}
              {voidState.discoveredTimelines.length} TIMELINES DISCOVERED
            </div>
            <h2 className="text-xl font-bold text-white mt-0.5">
              Infinite Timelines, Procedural Weapons, Traversal Vehicles & Body Mods
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onEnterOrExitInBetweenVoidNow();
                onClose();
              }}
              className="px-3.5 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-mono font-bold cursor-pointer"
            >
              {voidState.isPlayerInsideInBetweenVoid
                ? `Emerge in ${voidState.pendingDestinationTimeline.coordinateCode}`
                : 'Enter Zero-G In-Between Void'}
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono cursor-pointer"
            >
              Close [Esc]
            </button>
          </div>
        </div>

        {/* Navigation Tabs & Anomaly Resource Bar */}
        <div className="px-6 py-3 bg-[#0A101B] border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('dialer-splicer')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'dialer-splicer'
                  ? 'bg-emerald-400 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Timeline Geography, Atmospheres & Loot
            </button>
            <button
              onClick={() => setActiveTab('vehicles-bodymods')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'vehicles-bodymods'
                  ? 'bg-emerald-400 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Vehicles, Grapple Hook & Body Mods (8)
            </button>
            <button
              onClick={() => setActiveTab('gate-shapes')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'gate-shapes'
                  ? 'bg-emerald-400 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Portal Gate Shapes (7)
            </button>
            <button
              onClick={() => setActiveTab('void-ball-upgrades')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'void-ball-upgrades'
                  ? 'bg-emerald-400 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Void Ball Evolution (4 Branches)
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-slate-300">
            {(
              Object.keys(
                VOID_ANOMALY_RESOURCE_CATALOG
              ) as VoidAnomalyResourceId[]
            ).map((resId, idx) => {
              const spec = VOID_ANOMALY_RESOURCE_CATALOG[resId];
              return (
                <React.Fragment key={resId}>
                  {idx > 0 && (
                    <span aria-hidden="true" className="text-slate-600">
                      ·
                    </span>
                  )}
                  <span>
                    <span style={{ color: spec.colorHex }}>●</span>{' '}
                    {spec.shortName}:{' '}
                    <strong className="text-white">
                      {voidState.anomalyInventory[resId] ?? 0}
                    </strong>
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Main Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'dialer-splicer' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Coordinate Dialer, Landform/Atmosphere & Procedural Weapons */}
              <div className="lg:col-span-7 space-y-5">
                <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">
                      01. Infinite Timeline Dialer (Distinct Geography & Non-Black Atmospheres)
                    </h3>
                    <span className="text-xs font-mono text-slate-400">
                      Active: {voidState.activeTimeline.coordinateCode}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={customCoordInput}
                      onChange={(e) =>
                        setCustomCoordInput(e.target.value.toUpperCase())
                      }
                      placeholder="Enter Coordinate (e.g. C-137, COB-994, ZETA-88)"
                      className="flex-1 min-w-[200px] px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm font-mono text-emerald-300 focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      onClick={() => {
                        const rnd = generateRandomAbsurdCoordinate(
                          Date.now() + Math.random() * 10000
                        );
                        setCustomCoordInput(rnd);
                      }}
                      className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 cursor-pointer"
                    >
                      Random Coordinate
                    </button>
                  </div>

                  {/* Quick Curated Presets */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-mono text-slate-400 mr-1">
                      Curated Sectors:
                    </span>
                    {PRESET_TIMELINE_COORDINATES.map((code) => (
                      <button
                        key={code}
                        onClick={() => setCustomCoordInput(code)}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                          customCoordInput === code
                            ? 'bg-emerald-400 text-slate-950 font-bold'
                            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {code}
                      </button>
                    ))}
                  </div>

                  {/* Synthesized Timeline Readout */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-white">
                        {previewTimeline.title}
                      </span>
                      <span className="text-xs font-mono text-emerald-400 tabular-nums">
                        Seed #{previewTimeline.seedHash.toString(16).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {previewTimeline.satiricalLore}
                    </p>

                    <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                        <div className="text-[10px] font-mono text-slate-400">
                          3D PLANETARY TOPOGRAPHY
                        </div>
                        <div className="text-sky-300 font-semibold mt-0.5">
                          {previewTimeline.landformLabel}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                        <div className="text-[10px] font-mono text-slate-400">
                          VIBRANT ATMOSPHERE SKY
                        </div>
                        <div className="text-amber-300 font-semibold mt-0.5 flex items-center gap-1.5">
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: previewTimeline.skyHorizonHex }}
                          />
                          {previewTimeline.atmosphereLabel}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                        <div className="text-[10px] font-mono text-slate-400">
                          BIOLOGY & CREATURE AI
                        </div>
                        <div className="text-emerald-300 font-medium mt-0.5">
                          {previewTimeline.biologyLabel} ·{' '}
                          {previewTimeline.dominantCreatureArchetype.toUpperCase()} AI
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                        <div className="text-[10px] font-mono text-slate-400">
                          PHYSICS & CIVILIZATION RELICS
                        </div>
                        <div className="text-rose-300 font-medium mt-0.5">
                          {previewTimeline.physicsLabel} · {previewTimeline.relicLabel}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() => {
                          onDialTimelineCoordinate(previewTimeline, false);
                          onClose();
                        }}
                        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-semibold text-emerald-300 border border-emerald-500/40 cursor-pointer"
                      >
                        Open Portal Gate to {previewTimeline.coordinateCode}
                      </button>
                      <button
                        onClick={() => {
                          onDialTimelineCoordinate(previewTimeline, true);
                          onClose();
                        }}
                        className="px-4 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-mono font-bold cursor-pointer"
                      >
                        Jump Directly to Timeline {previewTimeline.coordinateCode}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Procedural Timeline Items & Weapons Synthesized for this Coordinate */}
                <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">
                      02. Procedural Timeline Weapons & Relics ({previewTimeline.coordinateCode})
                    </h3>
                    <span className="text-xs font-mono text-emerald-300">
                      Also Spawned in 3D World Caches
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {previewProceduralItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-white truncate">
                              {item.name}
                            </span>
                            <span className="text-[10px] font-mono uppercase text-amber-300 shrink-0">
                              {item.rarity}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-sky-300 mt-0.5">
                            {item.category.toUpperCase()} ·{' '}
                            {item.weaponSubType ?? 'Relic'} · Pwr{' '}
                            {item.stats.damage}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            onClaimAndEquipProceduralItem?.(item);
                            onClose();
                          }}
                          className="w-full py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/40 text-emerald-200 text-[10px] font-mono font-semibold cursor-pointer"
                        >
                          Synthesize & Equip in Loadout
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Dual-Timeline Splicer & Discovered Timelines Archive */}
              <div className="lg:col-span-5 space-y-5">
                {/* Dual-Timeline Splicer */}
                <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">
                      03. Dual-Timeline Reality Splicer
                    </h3>
                    <span className="text-xs font-mono text-amber-300">
                      {spliceUnlocked
                        ? 'Splicing Matrix Online'
                        : 'Unlock Reality-Splicing Tier 2 to Splice'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Fuse the biological ecosystem and relics of Timeline A with
                    the landform geography, gravity, and vibrant sky of Timeline B.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">
                        TIMELINE A (BIOLOGY & RELICS)
                      </label>
                      <input
                        type="text"
                        value={spliceCoordA}
                        onChange={(e) =>
                          setSpliceCoordA(e.target.value.toUpperCase())
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">
                        TIMELINE B (GEOGRAPHY & SKY)
                      </label>
                      <input
                        type="text"
                        value={spliceCoordB}
                        onChange={(e) =>
                          setSpliceCoordB(e.target.value.toUpperCase())
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                      />
                    </div>
                  </div>
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      disabled={!spliceUnlocked}
                      onClick={() => handleSynthesizeSplicedTimeline(true)}
                      className={`px-4 py-2 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                        spliceUnlocked
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Splice & Jump to Hybrid ({spliceCoordA.slice(0, 5)}⊕
                      {spliceCoordB.slice(0, 5)})
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">
                      04. Mapped Timelines ({voidState.discoveredTimelines.length})
                    </h3>
                    <span className="text-xs font-mono text-slate-400">
                      Unlocks Gate Shapes
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                    {voidState.discoveredTimelines.map((tl) => {
                      const isCurrent =
                        tl.coordinateCode ===
                        voidState.activeTimeline.coordinateCode;
                      return (
                        <div
                          key={tl.coordinateCode}
                          className={`p-3 rounded-lg border transition-colors ${
                            isCurrent
                              ? 'bg-emerald-950/30 border-emerald-400/60'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white">
                              {tl.title}
                            </span>
                            <button
                              onClick={() => {
                                onDialTimelineCoordinate(tl, true);
                                onClose();
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-300 text-[10px] font-mono font-semibold cursor-pointer shrink-0"
                            >
                              {isCurrent ? 'Active' : 'Jump Here'}
                            </button>
                          </div>
                          <div className="text-[11px] text-sky-300 font-mono mt-0.5">
                            {tl.landformLabel ?? 'Divergent Canyons'} ·{' '}
                            {tl.atmosphereLabel ?? 'Vibrant Sky'}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {(tl.biologyLabel ?? 'Mutant').split(' ')[0]} ·{' '}
                            {tl.gravityMultiplier ?? 1}G · Scale{' '}
                            {tl.propScaleMultiplier ?? 1}×
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vehicles-bodymods' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: 4 Traversal Vehicles */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Multi-Chassis Traversal Vehicles ([G] Mount · [B] Cycle Chassis)
                  </h3>
                  <p className="text-xs text-slate-300">
                    Deploy and pilot 4 specialized 3D traversal vehicles with
                    unique suspension, articulated hexapod legs, and aero-wing
                    animations.
                  </p>
                </div>

                <div className="space-y-3">
                  {(
                    Object.keys(
                      TRAVERSAL_VEHICLE_CATALOG
                    ) as TraversalVehicleType[]
                  ).map((vType) => {
                    const spec = TRAVERSAL_VEHICLE_CATALOG[vType];
                    const isSelected = activeVehicleType === vType;
                    return (
                      <div
                        key={vType}
                        className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-950/30 border-emerald-400'
                            : 'bg-slate-900/70 border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span
                              style={{ color: spec.accentHex }}
                              className="text-sm font-bold"
                            >
                              {spec.name}
                            </span>
                            <span className="text-xs font-mono text-slate-300">
                              {spec.locomotionSignature}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">
                            {spec.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              onSelectVehicleType?.(vType, true);
                              onClose();
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-mono font-bold cursor-pointer"
                          >
                            {isSelected && isVehicleMounted
                              ? 'Currently Piloting'
                              : `Deploy & Pilot ${spec.shortName}`}
                          </button>
                          <button
                            onClick={() => onSelectVehicleType?.(vType, false)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono cursor-pointer"
                          >
                            Set Default Chassis
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: 4 Animated Body Modifications & Physics Grapple Hook */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Animated 3D Cyber-Somatic Body Modifications ([J] Flurry)
                  </h3>
                  <p className="text-xs text-slate-300">
                    Toggle articulated 3D body modifications rendered on your
                    first-person forearms, peripheral HUD, and third-person
                    character rig.
                  </p>
                </div>

                <div className="space-y-3">
                  {(Object.keys(BODY_MOD_CATALOG) as BodyModId[]).map(
                    (modId) => {
                      const spec = BODY_MOD_CATALOG[modId];
                      const isEquipped = equippedBodyMods.includes(modId);
                      return (
                        <div
                          key={modId}
                          className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                            isEquipped
                              ? 'bg-slate-900/90 border-sky-400/60'
                              : 'bg-slate-950/60 border-slate-800 opacity-75'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                style={{ color: spec.accentHex }}
                                className="text-sm font-bold"
                              >
                                {spec.name}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                {spec.activeAbilitySummary}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300">
                              {spec.description}
                            </p>
                          </div>

                          <button
                            onClick={() => onToggleBodyMod?.(modId)}
                            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold shrink-0 cursor-pointer ${
                              isEquipped
                                ? 'bg-sky-400 text-slate-950'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            {isEquipped ? 'Active' : 'Enable'}
                          </button>
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-sky-500/40 space-y-1.5">
                  <div className="text-xs font-mono text-sky-300 font-semibold">
                    PHYSICS GRAPPLE HOOK & PENDULUM TETHER [KEY F]
                  </div>
                  <p className="text-xs text-slate-300">
                    Press <span className="font-mono text-white">[F]</span> at
                    any canyon ridge, floating island, or Leviathan creature up
                    to 68m away to latch your 3D magnetic tether. Swing in a
                    real pendulum arc, hold{' '}
                    <span className="font-mono text-white">[C]</span> to
                    zip-reel at high velocity, or press{' '}
                    <span className="font-mono text-white">[Space]</span> mid-arc
                    for an aerial catapult launch!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gate-shapes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Unlockable Portal Gate Silhouettes
                  </h3>
                  <p className="text-xs text-slate-300">
                    Customize the GLSL Signed-Distance-Field aperture and 3D
                    orbiting frame shards of both your Reality-Tear Portal Room
                    doorway and Timeline Rift Gates.
                  </p>
                </div>
                <div className="text-xs font-mono text-emerald-400 tabular-nums">
                  Timelines Discovered: {voidState.discoveredTimelines.length}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ALL_PORTAL_GATE_SHAPE_IDS.map((shapeId) => {
                  const spec = PORTAL_GATE_SHAPE_CATALOG[shapeId];
                  const isUnlocked =
                    omniversalGateMastery ||
                    voidState.unlockedGateShapes.includes(shapeId) ||
                    voidState.discoveredTimelines.length >=
                      spec.unlockTimelinesCount;
                  const isSelected = voidState.activeGateShape === shapeId;

                  return (
                    <div
                      key={shapeId}
                      className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-colors ${
                        isSelected
                          ? 'bg-emerald-950/30 border-emerald-400'
                          : isUnlocked
                          ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-950/50 border-slate-900 opacity-65'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 text-xs font-mono">
                          <span
                            style={{ color: spec.defaultPrimaryHex }}
                            className="font-semibold"
                          >
                            0{spec.shaderShapeIndex + 1}. {spec.name}
                          </span>
                          <span className="text-slate-400 tabular-nums">
                            {isUnlocked
                              ? 'Unlocked'
                              : `Req ${spec.unlockTimelinesCount} Timelines`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {spec.description}
                        </p>
                        <div className="text-[11px] font-mono text-slate-400">
                          Rim Architecture: {spec.rimGeometryStyle}
                        </div>
                      </div>

                      <button
                        disabled={!isUnlocked}
                        onClick={() => onSelectGateShape(shapeId)}
                        className={`w-full py-2 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-400 text-slate-950'
                            : isUnlocked
                            ? 'bg-slate-800 hover:bg-slate-700 text-white'
                            : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        {isSelected
                          ? 'Active Portal Gate Shape'
                          : isUnlocked
                          ? 'Apply Gate Silhouette'
                          : `Discover ${Math.max(
                              1,
                              spec.unlockTimelinesCount -
                                voidState.discoveredTimelines.length
                            )} More Timeline(s)`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'void-ball-upgrades' && (
            <div className="space-y-6">
              {/* Active Void Ball Beam Mode Selector */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-sky-400">
                    LEFT-HAND VOID BALL ACTIVE BEAM [KEY Z]
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    Select Active Physics & Biological Mutation Ray Mode
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      {
                        id: 'gravity-inversion-beam',
                        label: 'Zero-G Levitation Beam',
                      },
                      {
                        id: 'temporal-dilation-beam',
                        label: 'Temporal Stasis Beam',
                      },
                      {
                        id: 'matter-mutation-ray',
                        label: 'Cob / Cronenberg Mutation Ray',
                      },
                    ] as { id: VoidBallActiveBeamMode; label: string }[]
                  ).map((bm) => (
                    <button
                      key={bm.id}
                      onClick={() => onSelectBeamMode(bm.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                        voidState.activeBeamMode === bm.id
                          ? 'bg-sky-400 text-slate-950'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {bm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Void Ball Evolution Branches */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(
                  Object.keys(
                    VOID_BALL_UPGRADE_BRANCHES
                  ) as VoidBallUpgradeBranchId[]
                ).map((branchId) => {
                  const spec = VOID_BALL_UPGRADE_BRANCHES[branchId];
                  const curTier = voidState.branchTiers[branchId] ?? 1;
                  const isMax = curTier >= spec.maxTier;
                  const costPrimary = curTier * 2;
                  const costSecondary = curTier;
                  const havePrimary =
                    voidState.anomalyInventory[spec.primaryResource] ?? 0;
                  const haveSecondary =
                    voidState.anomalyInventory[spec.secondaryResource] ?? 0;
                  const canAfford =
                    !isMax &&
                    havePrimary >= costPrimary &&
                    haveSecondary >= costSecondary;

                  return (
                    <div
                      key={branchId}
                      className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4
                            style={{ color: spec.accentHex }}
                            className="text-sm font-bold"
                          >
                            {spec.name}
                          </h4>
                          <span className="text-xs font-mono text-white tabular-nums">
                            Tier {curTier} / {spec.maxTier}
                          </span>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          {spec.tierDescriptions.map((desc, idx) => {
                            const tierNum = idx + 1;
                            const unlocked = curTier >= tierNum;
                            return (
                              <div
                                key={tierNum}
                                className={`text-xs leading-relaxed ${
                                  unlocked
                                    ? 'text-slate-100 font-medium'
                                    : 'text-slate-500'
                                }`}
                              >
                                {unlocked ? '✓ ' : '○ '}
                                {desc}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                        {isMax ? (
                          <span className="text-xs font-mono text-emerald-400 font-semibold">
                            Maximum Evolution Reached
                          </span>
                        ) : (
                          <div className="text-[11px] font-mono text-slate-300 tabular-nums">
                            Cost: {costPrimary}{' '}
                            {
                              VOID_ANOMALY_RESOURCE_CATALOG[spec.primaryResource]
                                .shortName
                            }{' '}
                            · {costSecondary}{' '}
                            {
                              VOID_ANOMALY_RESOURCE_CATALOG[
                                spec.secondaryResource
                              ].shortName
                            }
                          </div>
                        )}

                        <button
                          disabled={!canAfford}
                          onClick={() => onUpgradeBranch(branchId)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer shrink-0 ${
                            isMax
                              ? 'bg-slate-800 text-emerald-400 cursor-default'
                              : canAfford
                              ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {isMax ? 'Maxed' : `Evolve to Tier ${curTier + 1}`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
