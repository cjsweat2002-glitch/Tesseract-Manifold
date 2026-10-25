import React, { useEffect, useRef, useState } from 'react';
import {
  ALL_DIFFERENTIAL_BOUNDARY_IDS,
  DIFFERENTIAL_UNIVERSE_BOUNDARIES,
  DifferentialUniverseBoundaryId,
  DIMENSIONAL_CRUCIBLE_RECIPES,
  DimensionalCrucibleItemRecipe,
  MULTIVERSAL_MATTER_CATALOG,
  MultiversalMatterId,
  PORTAL_ROOM_MODULE_BLUEPRINTS,
  PORTAL_ROOM_TIERS,
  PortalRoomGravityMode,
  PortalRoomModuleKind,
  PortalRoomRuntimeTelemetry,
  PortalRoomTierId,
} from '../types/portalAndBiodepth';
import { CraftingRecipe, ResourceId } from '../types/manifold';
import { CRAFTING_RECIPES, RESOURCE_CATALOG } from '../utils/manifoldGenerator';

interface BiodepthInteractiveArtProps {
  boundaryId: DifferentialUniverseBoundaryId;
  intensity?: number;
  className?: string;
}

/**
 * Living procedural Biodepth background canvas:
 * Combines deep-oceanic bioluminescent cellular topography, bathymetric contour isolines,
 * and non-Euclidean tesseractic horizon vectors that shift with the active Differential Universe Boundary.
 */
export const BiodepthInteractiveCanvasBackground: React.FC<
  BiodepthInteractiveArtProps
> = ({ boundaryId, intensity = 1.0, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boundary =
    DIFFERENTIAL_UNIVERSE_BOUNDARIES[boundaryId] ??
    DIFFERENTIAL_UNIVERSE_BOUNDARIES['hadal-biodepth-abyss'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();

    const resize = () => {
      if (!canvas) return;
      canvas.width = canvas.clientWidth || 960;
      canvas.height = canvas.clientHeight || 600;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = (now: number) => {
      animId = requestAnimationFrame(render);
      const t = (now - startTime) * 0.001;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Deep Biodepth Bathyal Gradient Base
      const grad = ctx.createRadialGradient(
        w * 0.5 + Math.sin(t * 0.3) * 60,
        h * 0.42 + Math.cos(t * 0.25) * 40,
        20,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.78
      );
      grad.addColorStop(0, boundary.fogColorHex);
      grad.addColorStop(0.55, boundary.skyColorHex);
      grad.addColorStop(1, '#020409');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // 2. Bathymetric Biodepth Topographic Strata Contours
      ctx.save();
      ctx.lineWidth = 1.1;
      const contourCount = 11;
      for (let i = 0; i < contourCount; i++) {
        const ratio = i / contourCount;
        ctx.strokeStyle =
          i % 2 === 0
            ? `${boundary.primaryAccentHex}28`
            : `${boundary.secondaryAccentHex}22`;
        ctx.beginPath();
        const baseY = h * (0.12 + ratio * 0.78);
        for (let x = 0; x <= w; x += 24) {
          const nx = x / w;
          const wave =
            Math.sin(nx * 6.0 + t * 0.65 + i * 0.7) * 18 * intensity +
            Math.cos(nx * 13.0 - t * 0.4 + i * 1.3) * 9 * intensity;
          const y = baseY + wave;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();

      // 3. Non-Euclidean Square Portal Chamber Perspective Wireframe & Bioluminescent Spores
      ctx.save();
      const cx = w * 0.5;
      const cy = h * 0.48;
      for (let r = 1; r <= 4; r++) {
        const pulse = ((t * 0.18 + r * 0.25) % 1.0);
        const size = pulse * Math.min(w, h) * 0.72;
        const alpha = Math.sin(pulse * Math.PI) * 0.22 * intensity;
        ctx.strokeStyle = boundary.portalRimPrimaryHex;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 1.25;
        ctx.strokeRect(cx - size * 0.5, cy - size * 0.5, size, size);
      }

      // Cyber-Occult Wrought-Iron Chains & Diamond Singularity Astrolabe (from voidwalker_glitch_stealth.png)
      const astrolabeX = w * 0.78;
      const astrolabeY = h * 0.32;
      const chainAnchors = [
        [w * 0.5, 0],
        [w, 0],
        [w, h * 0.65],
        [w * 0.52, h * 0.68],
      ];
      for (const [ax, ay] of chainAnchors) {
        ctx.save();
        ctx.strokeStyle = '#475569';
        ctx.globalAlpha = 0.38 * intensity;
        ctx.lineWidth = 2.0;
        ctx.setLineDash([7, 4]);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(astrolabeX, astrolabeY);
        ctx.stroke();
        ctx.restore();
      }

      ctx.save();
      ctx.translate(astrolabeX, astrolabeY);
      ctx.rotate(Math.sin(t * 0.5) * 0.12);
      ctx.strokeStyle = '#f97316';
      ctx.globalAlpha = 0.65 * intensity;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, -44);
      ctx.lineTo(32, 0);
      ctx.lineTo(0, 44);
      ctx.lineTo(-32, 0);
      ctx.closePath();
      ctx.stroke();

      const starGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 28);
      starGrad.addColorStop(0, '#ffffff');
      starGrad.addColorStop(0.45, '#f97316');
      starGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = starGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Horizontal RGB-Split Datamosh Glitch Shear Slices (signature motif from voidwalker_glitch_stealth.png)
      const glitchSlices = [
        { y: h * 0.2, w: 135, x: w * 0.66, color: '#ff2a6d' },
        { y: h * 0.22, w: 92, x: w * 0.72, color: '#00f0ff' },
        { y: h * 0.58, w: 160, x: w * 0.14, color: '#f97316' },
        { y: h * 0.6, w: 105, x: w * 0.18, color: '#ff2a6d' },
      ];
      for (let i = 0; i < glitchSlices.length; i++) {
        const gs = glitchSlices[i];
        const jitterX = Math.sin(t * 7.2 + i * 2.1) * 14;
        ctx.fillStyle = gs.color;
        ctx.globalAlpha = 0.28 * intensity;
        ctx.fillRect(gs.x + jitterX, gs.y, gs.w, 2.5);
      }

      // Golden Runic Halo Mandala & Vertical Ferrofluid Reality-Tear Seam (from voidwalker_brand_anchor.png)
      ctx.save();
      ctx.translate(cx, cy * 0.85);
      ctx.rotate(t * 0.22);
      ctx.strokeStyle = '#fde047';
      ctx.globalAlpha = 0.34 * intensity;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, 56, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Anamorphic Violet-Cyan Horizon Lens Flare Streak (from voidwalkers_title_art.png)
      const flareGrad = ctx.createLinearGradient(w * 0.15, 0, w * 0.85, 0);
      flareGrad.addColorStop(0, 'transparent');
      flareGrad.addColorStop(0.42, '#a855f766');
      flareGrad.addColorStop(0.5, '#f8fafcbb');
      flareGrad.addColorStop(0.58, '#38bdf866');
      flareGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = flareGrad;
      ctx.globalAlpha = 0.55 * intensity;
      ctx.fillRect(w * 0.15, h * 0.16, w * 0.7, 1.8);

      // Bioluminescent & Furnace-Ember Cellular Nodes
      for (let n = 0; n < 22; n++) {
        const px =
          ((Math.sin(n * 73.1 + t * 0.14) * 0.5 + 0.5) * w) % w;
        const py =
          ((Math.cos(n * 41.7 - t * 0.19) * 0.5 + 0.5) * h) % h;
        const rad = 1.5 + (n % 3) * 1.4;
        ctx.fillStyle =
          n % 3 === 0
            ? '#f97316'
            : n % 2 === 0
              ? boundary.primaryAccentHex
              : boundary.secondaryAccentHex;
        ctx.globalAlpha =
          (0.25 + 0.25 * Math.sin(t * 2.2 + n)) * intensity;
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [boundary, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
    />
  );
};

interface BiodepthCrucibleAndPortalRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  portalTelemetry: PortalRoomRuntimeTelemetry;
  matterInventory: Record<MultiversalMatterId, number>;
  baseInventory: Record<ResourceId, number>;
  unlockedCrucibleRecipeIds: string[];
  activeBoundaryId: DifferentialUniverseBoundaryId;
  onSelectBoundary: (boundaryId: DifferentialUniverseBoundaryId) => void;
  onUpgradePortalRoomTier: () => void;
  onCraftCrucibleRecipe: (recipe: DimensionalCrucibleItemRecipe) => void;
  onCraftBaseRecipe: (recipe: CraftingRecipe) => void;
  onSelectRoomModuleKind: (kind: PortalRoomModuleKind) => void;
  onPlaceRoomModuleNow: (kind: PortalRoomModuleKind) => void;
  onInstallCompleteWingLayout?: () => void;
  onRemoveLastRoomModule?: () => void;
  onChangePortalRoomGravityMode?: (mode: PortalRoomGravityMode) => void;
  onTogglePortalOpen: () => void;
  onEnterOrExitPortalRoomNow: () => void;
}

export const BiodepthCrucibleAndPortalRoomModal: React.FC<
  BiodepthCrucibleAndPortalRoomModalProps
> = ({
  isOpen,
  onClose,
  portalTelemetry,
  matterInventory,
  baseInventory,
  unlockedCrucibleRecipeIds,
  activeBoundaryId,
  onSelectBoundary,
  onUpgradePortalRoomTier,
  onCraftCrucibleRecipe,
  onCraftBaseRecipe,
  onSelectRoomModuleKind,
  onPlaceRoomModuleNow,
  onInstallCompleteWingLayout,
  onRemoveLastRoomModule,
  onChangePortalRoomGravityMode,
  onTogglePortalOpen,
  onEnterOrExitPortalRoomNow,
}) => {
  const [activeTab, setActiveTab] = useState<
    'portal-room' | 'crucible-forge' | 'biodepth-boundaries'
  >('portal-room');

  if (!isOpen) return null;

  const currentTier = portalTelemetry.portalRoomTier;
  const currentTierSpec = PORTAL_ROOM_TIERS[currentTier];
  const nextTier = (currentTier < 3 ? currentTier + 1 : null) as
    | PortalRoomTierId
    | null;
  const nextTierSpec = nextTier !== null ? PORTAL_ROOM_TIERS[nextTier] : null;

  const canAffordRoomUpgrade = nextTierSpec
    ? (
        Object.entries(nextTierSpec.costMatters) as [
          MultiversalMatterId,
          number
        ][]
      ).every(([mId, req]) => (matterInventory[mId] ?? 0) >= (req ?? 0))
    : false;

  const activeBoundary = DIFFERENTIAL_UNIVERSE_BOUNDARIES[activeBoundaryId];

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4">
      <div className="relative w-full max-w-5xl max-h-[88vh] overflow-hidden rounded-2xl border border-cyan-400/35 bg-slate-950 shadow-[0_0_80px_rgba(6,182,212,0.22)] flex flex-col">
        {/* Iconic Living Biodepth Art Canvas Background */}
        <BiodepthInteractiveCanvasBackground
          boundaryId={activeBoundaryId}
          intensity={1.0}
        />

        {/* Top Editorial Header */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/15 bg-slate-950/75 px-6 py-4 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: activeBoundary.primaryAccentHex }}
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300">
                BIODEPTH NEXUS · SPLITGATE REALITY-TEAR & SQUARE PORTAL CHAMBER
              </span>
            </div>
            <h2 className="mt-0.5 text-xl font-bold tracking-tight text-white">
              {currentTierSpec.name} ({currentTierSpec.dimensionsLabel})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePortalOpen}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer ${
                portalTelemetry.isPortalOpenInWorld
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-100'
                  : 'bg-slate-900/90 border-white/15 text-slate-300 hover:text-white'
              }`}
            >
              {portalTelemetry.isPortalOpenInWorld
                ? '🌀 Reality-Tear Open (Sightline Active)'
                : 'Tear Open World Portal [V]'}
            </button>
            <button
              onClick={() => {
                onEnterOrExitPortalRoomNow();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all cursor-pointer"
            >
              {portalTelemetry.isPlayerInsidePortalRoom
                ? '⇪ Step Outside to World'
                : '🚪 Step Inside Square Portal Room'}
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/10 hover:bg-white/20 text-white border border-white/15 cursor-pointer"
            >
              ✕ Close [Esc]
            </button>
          </div>
        </div>

        {/* Navigation Sub-Bar + Multiversal Matter Strip */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-950/85 px-6 py-2.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('portal-room')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeTab === 'portal-room'
                  ? 'bg-cyan-400 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              1 · Square Portal Room & Upgrades
            </button>
            <button
              onClick={() => setActiveTab('crucible-forge')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeTab === 'crucible-forge'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              2 · Dimensional Synthesis Crucible
            </button>
            <button
              onClick={() => setActiveTab('biodepth-boundaries')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeTab === 'biodepth-boundaries'
                  ? 'bg-purple-400 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              3 · Biodepth Universe Boundaries (5)
            </button>
          </div>

          {/* Live Multiversal Matter Ledger Strip */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              Object.keys(MULTIVERSAL_MATTER_CATALOG) as MultiversalMatterId[]
            ).map((mId) => {
              const spec = MULTIVERSAL_MATTER_CATALOG[mId];
              const count = matterInventory[mId] ?? 0;
              return (
                <div
                  key={mId}
                  className="flex items-center gap-1 rounded bg-slate-900/90 border border-white/10 px-2 py-0.5 text-[10px] font-mono"
                  title={`${spec.name} (${spec.atomicSignature}): ${spec.description}`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: spec.colorHex }}
                  />
                  <span className="text-slate-300">{spec.shortName}:</span>
                  <span className="font-bold text-white">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Scrollable Content Area */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'portal-room' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Square Portal Room Evolution Tiers */}
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-xl border border-white/15 bg-slate-950/85 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-wider text-cyan-300 font-bold">
                      Foundational 36m × 36m Square Room Architecture
                    </span>
                    <span className="font-mono text-xs text-amber-300">
                      Current Tier: {currentTier} / 3
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentTierSpec.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {currentTierSpec.unlockedFeatures.map((feat, i) => (
                      <div
                        key={i}
                        className="rounded-lg bg-slate-900/80 border border-cyan-500/25 px-3 py-1.5 text-[11px] font-mono text-cyan-100"
                      >
                        ✓ {feat}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Room Upgrade Card */}
                {nextTierSpec ? (
                  <div className="rounded-xl border border-amber-400/40 bg-slate-950/90 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-amber-300">
                          NEXT ARCHITECTURAL EVOLUTION
                        </div>
                        <h3 className="text-sm font-bold text-white">
                          {nextTierSpec.name}
                        </h3>
                      </div>
                      <button
                        onClick={onUpgradePortalRoomTier}
                        disabled={!canAffordRoomUpgrade}
                        className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          canAffordRoomUpgrade
                            ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg'
                            : 'bg-slate-800 text-slate-500 border border-white/10 cursor-not-allowed'
                        }`}
                      >
                        {canAffordRoomUpgrade
                          ? `⚡ Infuse Matters & Upgrade to Tier ${nextTierSpec.tier}`
                          : 'Insufficient Multiversal Matters'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-300">
                      {nextTierSpec.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(
                        Object.entries(nextTierSpec.costMatters) as [
                          MultiversalMatterId,
                          number
                        ][]
                      ).map(([mId, req]) => {
                        const mSpec = MULTIVERSAL_MATTER_CATALOG[mId];
                        const have = matterInventory[mId] ?? 0;
                        const met = have >= (req ?? 0);
                        return (
                          <div
                            key={mId}
                            className={`px-2.5 py-1 rounded-md text-xs font-mono border ${
                              met
                                ? 'bg-emerald-950/60 border-emerald-400/50 text-emerald-200'
                                : 'bg-rose-950/60 border-rose-400/50 text-rose-200'
                            }`}
                          >
                            {mSpec.name}: {have} / {req}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-400/40 bg-emerald-950/30 p-4 text-xs font-mono text-emerald-200">
                    ★ Maximum Tier 3 Multiversal Nexus Citadel Achieved! All 5
                    Universe Boundary Stargates and Apex Crucible Overclocks are
                    active inside your 36m × 36m Square Room.
                  </div>
                )}
              </div>

              {/* Right Column: Seamless Interior Section & Modular Room Architect */}
              <div className="lg:col-span-5 rounded-xl border border-orange-500/30 bg-slate-950/90 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-orange-400 font-bold">
                      Seamless Interior Section Architect [Key B]
                    </span>
                    <div className="text-[10px] font-mono text-slate-400">
                      Gravity: {(portalTelemetry.effectiveGravityG ?? 1.0).toFixed(2)}G · Elevation: +{(portalTelemetry.currentFloorElevationM ?? 0).toFixed(1)}m · Active Sections: {portalTelemetry.placedModulesCount}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {onRemoveLastRoomModule &&
                      portalTelemetry.placedModulesCount > 0 && (
                        <button
                          onClick={onRemoveLastRoomModule}
                          className="px-2 py-1 rounded text-[10px] font-mono bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/40 text-rose-200 cursor-pointer"
                        >
                          Undo Last
                        </button>
                      )}
                    <button
                      onClick={() => {
                        if (onInstallCompleteWingLayout) {
                          onInstallCompleteWingLayout();
                        } else {
                          onPlaceRoomModuleNow('interior-mezzanine-catwalk');
                          onPlaceRoomModuleNow('interior-sanctum-alcove');
                          onPlaceRoomModuleNow('interior-command-bridge-deck');
                        }
                      }}
                      className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-orange-500 hover:bg-orange-400 text-slate-950 shadow cursor-pointer"
                      title="Instantly furnishes all 6 Walkable Interior Wings inside your 36m×36m Portal Room"
                    >
                      + Furnish All 6 Wings
                    </button>
                  </div>
                </div>
                {onChangePortalRoomGravityMode && (
                  <div className="flex items-center justify-between bg-slate-900/90 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-mono">
                    <span className="text-slate-300">
                      Portal Room Gravity Calibration:
                    </span>
                    <div className="flex items-center gap-1">
                      {(
                        [
                          { id: 'stabilized-1g', label: '1.0G Standard' },
                          { id: 'low-g-architect', label: '0.38G Low-G' },
                          { id: 'boundary-linked', label: 'Dim-Coupled' },
                        ] as const
                      ).map((gm) => (
                        <button
                          key={gm.id}
                          onClick={() => onChangePortalRoomGravityMode(gm.id)}
                          className={`px-2 py-0.5 rounded cursor-pointer ${
                            (portalTelemetry.portalRoomGravityMode ??
                              'stabilized-1g') === gm.id
                              ? 'bg-cyan-400 text-slate-950 font-bold'
                              : 'bg-white/5 text-slate-300 hover:text-white'
                          }`}
                        >
                          {gm.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-slate-300">
                  Add walkable second-story mezzanines, cyber-occult reliquary sanctums, liminal anomaly tear corridors, foundry wings, and graviton lifts directly inside your 36m × 36m Portal Room—or press <span className="text-orange-300 font-mono">[B]</span> while walking inside the room to snap sections to the 2m grid in front of you.
                </p>
                <div className="max-h-[420px] overflow-y-auto pr-1 space-y-2">
                  {PORTAL_ROOM_MODULE_BLUEPRINTS.map((mod) => {
                    const isSelected =
                      portalTelemetry.activeModuleKind === mod.kind;
                    const isWalkableSection =
                      mod.category === 'walkable-interior-section';
                    return (
                      <div
                        key={mod.kind}
                        className={`rounded-lg border p-2.5 transition-all ${
                          isSelected
                            ? 'border-orange-400 bg-orange-950/35'
                            : 'border-white/10 bg-slate-900/75 hover:border-white/25'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white">
                                {mod.name}
                              </span>
                              <span
                                className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                                  isWalkableSection
                                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                    : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25'
                                }`}
                              >
                                {mod.footprintLabel}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => onSelectRoomModuleKind(mod.kind)}
                              className={`px-2 py-1 rounded text-[10px] font-mono cursor-pointer ${
                                isSelected
                                  ? 'bg-orange-500/30 text-orange-200 border border-orange-400/50'
                                  : 'bg-white/10 hover:bg-white/20 text-white'
                              }`}
                            >
                              {isSelected ? 'Active [B]' : 'Select'}
                            </button>
                            <button
                              onClick={() => onPlaceRoomModuleNow(mod.kind)}
                              className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 cursor-pointer"
                            >
                              + Add Section
                            </button>
                          </div>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-300">
                          {mod.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'crucible-forge' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DIMENSIONAL_CRUCIBLE_RECIPES.map((rec) => {
                  const isUnlocked = unlockedCrucibleRecipeIds.includes(rec.id);
                  const tierMet = currentTier >= rec.requiredRoomTier;
                  const mattersMet = (
                    Object.entries(rec.matterCosts) as [
                      MultiversalMatterId,
                      number
                    ][]
                  ).every(
                    ([mId, req]) => (matterInventory[mId] ?? 0) >= (req ?? 0)
                  );
                  const canForge = tierMet && mattersMet;

                  return (
                    <div
                      key={rec.id}
                      className="rounded-xl border border-white/15 bg-slate-950/88 p-4 flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border"
                            style={{
                              color: rec.accentHex,
                              borderColor: `${rec.accentHex}55`,
                              backgroundColor: `${rec.accentHex}15`,
                            }}
                          >
                            {rec.category.replace(/-/g, ' ')}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            Requires Room Tier {rec.requiredRoomTier}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white">
                          {rec.name}
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {rec.description}
                        </p>
                        <div className="rounded-lg bg-slate-900/90 border border-white/10 px-3 py-1.5 font-mono text-[11px] text-amber-300">
                          ⚡ {rec.gameplayEffectSummary}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-white/10">
                        <div className="flex flex-wrap gap-1.5">
                          {(
                            Object.entries(rec.matterCosts) as [
                              MultiversalMatterId,
                              number
                            ][]
                          ).map(([mId, req]) => {
                            const mSpec = MULTIVERSAL_MATTER_CATALOG[mId];
                            const have = matterInventory[mId] ?? 0;
                            const ok = have >= (req ?? 0);
                            return (
                              <span
                                key={mId}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                  ok
                                    ? 'bg-emerald-950/60 border-emerald-400/40 text-emerald-200'
                                    : 'bg-rose-950/60 border-rose-400/40 text-rose-200'
                                }`}
                              >
                                {mSpec.shortName}: {have}/{req}
                              </span>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => onCraftCrucibleRecipe(rec)}
                          disabled={!canForge}
                          className={`w-full py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                            canForge
                              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {isUnlocked
                            ? `⚡ Synthesize Again (${rec.name})`
                            : canForge
                            ? `⚡ Forge in Dimensional Crucible`
                            : !tierMet
                            ? `Requires Portal Room Tier ${rec.requiredRoomTier}`
                            : 'Collect Required Multiversal Matters in Outer Worlds'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Base Elemental & Structural Recipes */}
              <div className="rounded-xl border border-white/15 bg-slate-950/85 p-4 space-y-3">
                <div className="font-mono text-xs uppercase tracking-wider text-cyan-300 font-bold">
                  Foundational Manifold Somatic & Structural Synthesis
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {CRAFTING_RECIPES.map((rec) => {
                    const canAfford = (
                      Object.entries(rec.cost) as [ResourceId, number][]
                    ).every(
                      ([rId, qty]) => (baseInventory[rId] ?? 0) >= (qty ?? 0)
                    );
                    return (
                      <div
                        key={rec.id}
                        className="rounded-lg border border-white/10 bg-slate-900/80 p-3 flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="text-xs font-bold text-white">
                            {rec.name}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {rec.description}
                          </div>
                        </div>
                        <button
                          onClick={() => onCraftBaseRecipe(rec)}
                          className={`w-full py-1.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                            canAfford
                              ? 'bg-cyan-500/30 hover:bg-cyan-500/45 border border-cyan-400 text-cyan-100'
                              : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300'
                          }`}
                        >
                          Synthesize {rec.name.split(' ')[0]}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'biodepth-boundaries' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ALL_DIFFERENTIAL_BOUNDARY_IDS.map((bId) => {
                const spec = DIFFERENTIAL_UNIVERSE_BOUNDARIES[bId];
                const isCurrent = activeBoundaryId === bId;
                const primaryMatter =
                  MULTIVERSAL_MATTER_CATALOG[spec.primaryMatterYield];
                const secondaryMatter =
                  MULTIVERSAL_MATTER_CATALOG[spec.secondaryMatterYield];

                return (
                  <div
                    key={bId}
                    className={`rounded-xl border p-4 flex flex-col justify-between gap-3 transition-all ${
                      isCurrent
                        ? 'border-cyan-400 bg-cyan-950/35 shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                        : 'border-white/15 bg-slate-950/85 hover:border-white/30'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border"
                          style={{
                            color: spec.primaryAccentHex,
                            borderColor: `${spec.primaryAccentHex}55`,
                            backgroundColor: `${spec.primaryAccentHex}18`,
                          }}
                        >
                          {spec.genreClassification}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          Depth: -{spec.biodepthStratumDepthKm} km
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white">
                        {spec.name}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {spec.tagline}
                      </p>
                      <div className="text-[11px] font-mono text-slate-400 bg-slate-900/80 rounded-lg p-2 border border-white/10">
                        <div>Shader: {spec.visualShaderSignature}</div>
                        <div className="mt-1 text-cyan-300">
                          Matters: {primaryMatter.shortName} ·{' '}
                          {secondaryMatter.shortName}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectBoundary(bId)}
                      className={`w-full py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-cyan-400 text-slate-950'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                      }`}
                    >
                      {isCurrent
                        ? '✓ Active Universe Boundary'
                        : `Shift Portal & World to ${spec.name.split(' ')[0]}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
