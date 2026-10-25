import React, { useState } from 'react';
import {
  AutonomousDenizenSimState,
  BASE_DIMENSIONAL_ELEMENTS,
  BaseDimensionalElementId,
  DIMENSIONAL_PERK_TREE,
  DimensionalPerkNode,
  EmergentCulturalQuestline,
  EpistemologicalPerceptionStage,
  PerkBranchId,
  VOID_SEED_ORIGINS,
  VoidBallActivationMode,
  VoidwalkerCustomizationConfig,
} from '../utils/multiversalEmergenceAndCultureEngine';
import { CRAFTING_RECIPES, RESOURCE_CATALOG } from '../utils/manifoldGenerator';
import { CraftingRecipe, ResourceId } from '../types/manifold';
import {
  BiodepthUiAndGraphicsConfig,
  DEFAULT_BIODEPTH_UI_GRAPHICS_CONFIG,
  DIFFERENTIAL_UNIVERSE_BOUNDARIES,
  formatKeyCodeLabel,
  PORTAL_ROOM_MODULE_BLUEPRINTS,
  PortalRoomGravityMode,
  PortalRoomModuleKind,
  PortalRoomRuntimeTelemetry,
} from '../types/portalAndBiodepth';
import { BiodepthInteractiveCanvasBackground } from './BiodepthMenuArt';

interface DimensionalDevianceHudAndModalsProps {
  voidwalkerConfig: VoidwalkerCustomizationConfig;
  voidBallMode: VoidBallActivationMode;
  onChangeVoidBallMode: (mode: VoidBallActivationMode) => void;
  activeBaseElement: BaseDimensionalElementId;
  onSelectBaseElement: (elem: BaseDimensionalElementId) => void;
  unlockedPerkIds: string[];
  devianceXP: number;
  devianceLevel: number;
  onUnlockPerk: (perk: DimensionalPerkNode) => void;
  isPerkTreeOpen: boolean;
  onTogglePerkTree: () => void;
  onOpenOriginModal: () => void;
  isStealthCrouching: boolean;
  onToggleStealthCrouch: () => void;
  heldObjectName: string | null;
  onTriggerGrabOrDrop: () => void;
  onTriggerThrowObject: () => void;
  lastCombatBanner: string;
  denizenSims: AutonomousDenizenSimState[];
  activeQuest: EmergentCulturalQuestline | null;
  epistemologyMap: Record<BaseDimensionalElementId, EpistemologicalPerceptionStage>;
  onDecodeOrCounterSabotage: () => void;
  onGenerateNextQuest: () => void;
  inventory: Record<ResourceId, number>;
  onCraftRecipe: (recipe: CraftingRecipe) => void;
  biodepthConfig?: BiodepthUiAndGraphicsConfig;
  portalTelemetry?: PortalRoomRuntimeTelemetry;
  onOpenBiodepthCrucibleModal?: () => void;
  onEnterOrExitPortalRoomNow?: () => void;
  onSelectRoomModuleKind?: (kind: PortalRoomModuleKind) => void;
  onPlaceRoomModuleNow?: (kind?: PortalRoomModuleKind) => void;
  onInstallCompleteWingLayout?: () => void;
  onRemoveLastRoomModule?: () => void;
  onChangePortalRoomGravityMode?: (mode: PortalRoomGravityMode) => void;
  isAnyModalOpen?: boolean;
}

const ELEMENT_GLYPHS: Record<BaseDimensionalElementId, string> = {
  'lithic-crystalline': '◈',
  'hydro-superfluid': '≈',
  'aero-cymatic': '∿',
  'pyro-vitreous': '✦',
  'chrono-phase': '⧗',
  'bio-miasmic': '☣',
};

export const DimensionalDevianceHudAndModals: React.FC<
  DimensionalDevianceHudAndModalsProps
> = ({
  voidwalkerConfig,
  voidBallMode,
  onChangeVoidBallMode,
  activeBaseElement,
  onSelectBaseElement,
  unlockedPerkIds,
  devianceXP,
  devianceLevel,
  onUnlockPerk,
  isPerkTreeOpen,
  onTogglePerkTree,
  onOpenOriginModal,
  isStealthCrouching,
  onToggleStealthCrouch,
  heldObjectName,
  onTriggerGrabOrDrop,
  onTriggerThrowObject,
  lastCombatBanner,
  denizenSims,
  activeQuest,
  epistemologyMap,
  onDecodeOrCounterSabotage,
  onGenerateNextQuest,
  inventory,
  onCraftRecipe,
  biodepthConfig = DEFAULT_BIODEPTH_UI_GRAPHICS_CONFIG,
  portalTelemetry,
  onOpenBiodepthCrucibleModal,
  onEnterOrExitPortalRoomNow,
  onSelectRoomModuleKind,
  onPlaceRoomModuleNow,
  onInstallCompleteWingLayout,
  onRemoveLastRoomModule,
  onChangePortalRoomGravityMode,
  isAnyModalOpen = false,
}) => {
  const [selectedPerkBranch, setSelectedPerkBranch] = useState<
    'all' | PerkBranchId
  >('all');
  const [showQuestPopover, setShowQuestPopover] = useState<boolean>(false);

  const activeSeed =
    VOID_SEED_ORIGINS[voidwalkerConfig.voidSeedId] ??
    VOID_SEED_ORIGINS['singularity-graviton'];
  const activeElemSpec =
    BASE_DIMENSIONAL_ELEMENTS[activeBaseElement] ??
    BASE_DIMENSIONAL_ELEMENTS['lithic-crystalline'];
  const currentPerception =
    epistemologyMap[activeBaseElement] ?? 'incomprehensible-alien-horror';

  const kb = biodepthConfig.keybinds;
  const activeBoundary =
    DIFFERENTIAL_UNIVERSE_BOUNDARIES[biodepthConfig.activeUniverseBoundary] ??
    DIFFERENTIAL_UNIVERSE_BOUNDARIES['hadal-biodepth-abyss'];

  if (isAnyModalOpen && !isPerkTreeOpen) {
    return null;
  }

  return (
    <>
      {/* 0. Legacy top bar superseded by VoidBallDialAndMindspaceHUD */}
      {false && portalTelemetry &&
        (portalTelemetry.isPlayerInsidePortalRoom ||
          portalTelemetry.isPortalOpenInWorld) && (
          <div
            style={{
              opacity: biodepthConfig.hudOpacity,
              transform: `scale(${biodepthConfig.hudScale})`,
              transformOrigin: 'top center',
            }}
            className="pointer-events-auto absolute top-14 left-1/2 -translate-x-1/2 z-20 flex flex-col gap-1.5 rounded-lg border border-amber-500/45 bg-[#06080E]/95 px-3.5 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.85)] max-w-3xl w-[94vw] sm:w-auto"
          >
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rotate-45 shrink-0"
                  style={{ backgroundColor: activeBoundary.portalRimPrimaryHex }}
                />
                <div>
                  <div className="text-[11px] font-mono font-bold text-amber-200 flex items-center gap-2">
                    <span>
                      {portalTelemetry.isPlayerInsidePortalRoom
                        ? `36m×36m PORTAL SANCTUM (Tier ${portalTelemetry.portalRoomTier}) · ${portalTelemetry.focusedStationLabel}`
                        : `REALITY-TEAR PORTAL OPEN (${Math.round(
                            portalTelemetry.portalOpenProgress * 100
                          )}%) · Live Sightline into 36m×36m Square Room`}
                    </span>
                    {portalTelemetry.isPlayerInsidePortalRoom && (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 text-[9px] text-cyan-200">
                        {(portalTelemetry.effectiveGravityG ?? 1).toFixed(2)}G · Elev +
                        {(portalTelemetry.currentFloorElevationM ?? 0).toFixed(1)}m
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-slate-300">
                    {portalTelemetry.isPlayerInsidePortalRoom
                      ? portalTelemetry.focusedStationHint
                      : `Walk straight through the reality tear or click "Step Inside" to enter your customizable Square Room`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {onEnterOrExitPortalRoomNow && (
                  <button
                    onClick={onEnterOrExitPortalRoomNow}
                    className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 cursor-pointer"
                  >
                    {portalTelemetry.isPlayerInsidePortalRoom
                      ? '⇪ Exit to Exterior'
                      : '🚪 Step Inside Room'}
                  </button>
                )}
                {onOpenBiodepthCrucibleModal && (
                  <button
                    onClick={onOpenBiodepthCrucibleModal}
                    className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer"
                  >
                    ⚡ Crucible & Architect [
                    {formatKeyCodeLabel(kb.toggleCrucible)}]
                  </button>
                )}
              </div>
            </div>

            {/* Seamless In-Room Interior Section Builder & Gravity Bar when inside the Portal Room */}
            {portalTelemetry.isPlayerInsidePortalRoom && (
              <div className="pt-1.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-slate-400 uppercase tracking-wider mr-1">
                    Section:
                  </span>
                  {PORTAL_ROOM_MODULE_BLUEPRINTS.slice(0, 6).map((bp) => {
                    const isSel = portalTelemetry.activeModuleKind === bp.kind;
                    return (
                      <button
                        key={bp.kind}
                        onClick={() => onSelectRoomModuleKind?.(bp.kind)}
                        className={`px-2 py-0.5 rounded border transition-all cursor-pointer ${
                          isSel
                            ? 'bg-amber-500/30 border-amber-400 text-amber-200 font-bold'
                            : 'bg-slate-900/90 border-white/10 text-slate-300 hover:text-white'
                        }`}
                        title={bp.description}
                      >
                        {bp.name.split(' ')[0]}
                      </button>
                    );
                  })}
                  <button
                    onClick={() =>
                      onPlaceRoomModuleNow?.(portalTelemetry.activeModuleKind)
                    }
                    className="px-2.5 py-0.5 rounded bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold cursor-pointer ml-0.5"
                    title="Snap-place selected walkable interior section 6m ahead [Key B]"
                  >
                    + Snap Section [B]
                  </button>
                  {onInstallCompleteWingLayout && (
                    <button
                      onClick={onInstallCompleteWingLayout}
                      className="px-2 py-0.5 rounded bg-purple-500/25 hover:bg-purple-500/40 border border-purple-400/40 text-purple-200 font-semibold cursor-pointer"
                      title="Auto-furnish all 6 walkable interior sections around the 36m×36m perimeter"
                    >
                      Furnish All Wings
                    </button>
                  )}
                  {onRemoveLastRoomModule &&
                    portalTelemetry.placedModulesCount > 0 && (
                      <button
                        onClick={onRemoveLastRoomModule}
                        className="px-1.5 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/35 text-rose-200 cursor-pointer"
                        title="Remove last placed interior section"
                      >
                        Undo ({portalTelemetry.placedModulesCount})
                      </button>
                    )}
                </div>

                {/* Gravity Mode Selector inside Portal Room */}
                {onChangePortalRoomGravityMode && (
                  <div className="flex items-center gap-1 bg-slate-900/90 px-1.5 py-0.5 rounded border border-white/10">
                    <span className="text-slate-400">Gravity:</span>
                    {(
                      [
                        { id: 'stabilized-1g', label: '1.0G Standard' },
                        { id: 'low-g-architect', label: '0.38G Low-G' },
                        { id: 'boundary-linked', label: 'Dim-Linked' },
                      ] as const
                    ).map((gm) => (
                      <button
                        key={gm.id}
                        onClick={() => onChangePortalRoomGravityMode(gm.id)}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          (portalTelemetry.portalRoomGravityMode ??
                            'stabilized-1g') === gm.id
                            ? 'bg-cyan-400 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {gm.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      {/* 1. In-Hand Inventory Bloom Container (Combat toast & bottom HUD are unified in VoidBallDialAndMindspaceHUD) */}
      <div
        style={{
          opacity: biodepthConfig.hudOpacity,
          transform: `scale(${biodepthConfig.hudScale})`,
          transformOrigin: 'bottom right',
        }}
        className="pointer-events-auto absolute bottom-16 right-3 z-20 flex flex-col gap-1 max-w-[54vw]"
      >
        {/* Legacy horizontal control bar superseded by VoidBallDialAndMindspaceHUD */}
        {false && (
        <div className="bg-slate-950/95 border border-white/15 rounded-xl px-2.5 py-1 shadow-xl flex flex-wrap items-center gap-1.5">
          {/* 3-State Left-Hand Void Ball & Reality-Tear Portal Selector */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-white/10">
            <button
              onClick={() => onChangeVoidBallMode('dormant-clenched')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-all cursor-pointer ${
                voidBallMode === 'dormant-clenched'
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Left Hand Clenched (Dormant) — Both hands free for grabbing & combat"
            >
              ✊ Fist
            </button>
            <button
              onClick={() =>
                onChangeVoidBallMode(
                  voidBallMode === 'hand-inventory-bloom'
                    ? 'dormant-clenched'
                    : 'hand-inventory-bloom'
                )
              }
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-all cursor-pointer ${
                voidBallMode === 'hand-inventory-bloom'
                  ? 'bg-purple-500/35 text-purple-200 border border-purple-400/40 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={`Open 3D Void Ball in Left Palm [${formatKeyCodeLabel(
                kb.handInventory
              )}]`}
            >
              ✋ Hand [{formatKeyCodeLabel(kb.handInventory)}]
            </button>
            <button
              onClick={() =>
                onChangeVoidBallMode(
                  voidBallMode === 'walk-in-sanctum-portal'
                    ? 'dormant-clenched'
                    : 'walk-in-sanctum-portal'
                )
              }
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-all cursor-pointer ${
                voidBallMode === 'walk-in-sanctum-portal'
                  ? 'bg-cyan-500/35 text-cyan-200 border border-cyan-400/40 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={`Tear Open Reality-Tear Portal & Square Room Sightline [${formatKeyCodeLabel(
                kb.openPortal
              )}]`}
            >
              🌀 Portal [{formatKeyCodeLabel(kb.openPortal)}]
            </button>
          </div>

          {/* Biodepth Crucible & Portal Room Upgrade Button */}
          {onOpenBiodepthCrucibleModal && (
            <button
              onClick={onOpenBiodepthCrucibleModal}
              className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/45 text-amber-200 font-bold cursor-pointer"
              title={`Open Dimensional Crafting Crucible & Square Portal Room Upgrades [${formatKeyCodeLabel(
                kb.toggleCrucible
              )}]`}
            >
              Crucible [{formatKeyCodeLabel(kb.toggleCrucible)}]
            </button>
          )}

          {/* 6 Base Dimensional Elements Mini Dots ([1]-[6]) */}
          <div className="flex items-center gap-0.5 bg-slate-900/90 rounded-lg px-1.5 py-0.5 border border-white/10">
            {(
              Object.keys(
                BASE_DIMENSIONAL_ELEMENTS
              ) as BaseDimensionalElementId[]
            ).map((elemId, idx) => {
              const el = BASE_DIMENSIONAL_ELEMENTS[elemId];
              const isSelected = activeBaseElement === elemId;
              return (
                <button
                  key={elemId}
                  onClick={() => onSelectBaseElement(elemId)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/15 text-white font-bold ring-1 ring-amber-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={`[${idx + 1}] ${el.name} (${el.fieldEquationFormula})`}
                >
                  <span style={{ color: el.colorHex }}>
                    {ELEMENT_GLYPHS[elemId]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Physical Grab & Throw & Stealth & Boundary/Decode Compact Badges */}
          <button
            onClick={onTriggerGrabOrDrop}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono border transition-all cursor-pointer ${
              heldObjectName
                ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold'
                : 'bg-slate-900/80 border-white/10 text-slate-300 hover:text-white'
            }`}
            title={`Grab/Interact [${formatKeyCodeLabel(kb.interactGrab)}]`}
          >
            {heldObjectName
              ? `🪨 ${heldObjectName.split(' ')[0]}`
              : `Grab [${formatKeyCodeLabel(kb.interactGrab)}]`}
          </button>

          {heldObjectName && (
            <button
              onClick={onTriggerThrowObject}
              className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-rose-500/25 border border-rose-400/50 text-rose-200 font-bold cursor-pointer"
              title={`Ballistic Impale Throw [${formatKeyCodeLabel(
                kb.throwObject
              )}]`}
            >
              Throw [{formatKeyCodeLabel(kb.throwObject)}]
            </button>
          )}

          {!biodepthConfig.minimalDiegeticHud && (
            <>
              <button
                onClick={onToggleStealthCrouch}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono border transition-all cursor-pointer ${
                  isStealthCrouching
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 font-bold'
                    : 'bg-slate-900/80 border-white/10 text-slate-300 hover:text-white'
                }`}
                title={`Toggle Stealth Crouch [${formatKeyCodeLabel(
                  kb.stealthCrouch
                )}]`}
              >
                {isStealthCrouching
                  ? '👁 Stealth'
                  : `Crouch [${formatKeyCodeLabel(kb.stealthCrouch)}]`}
              </button>

              <button
                onClick={onDecodeOrCounterSabotage}
                className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/35 text-cyan-200 cursor-pointer"
                title={`Decode Alien Magic / Shift Boundary [${formatKeyCodeLabel(
                  kb.dimensionalShift
                )}]`}
              >
                Decode [{formatKeyCodeLabel(kb.dimensionalShift)}]
              </button>

              <button
                onClick={() => setShowQuestPopover((prev) => !prev)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono border transition-all cursor-pointer ${
                  showQuestPopover
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                    : 'bg-slate-900/80 border-white/10 text-amber-300 hover:bg-white/10'
                }`}
                title="Toggle Cultural Sims Ecology & Sabotage Quest Tracker"
              >
                Sims ({denizenSims.length})
              </button>

              <button
                onClick={onTogglePerkTree}
                className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-purple-500/20 hover:bg-purple-500/35 border border-purple-400/40 text-purple-200 font-semibold cursor-pointer"
                title={`Open Dimensional Deviance Perk Tree [${formatKeyCodeLabel(
                  kb.perkTree
                )}]`}
              >
                Perks [{formatKeyCodeLabel(kb.perkTree)}] · {devianceXP}XP
              </button>

              <button
                onClick={onOpenOriginModal}
                className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-white/10 hover:bg-white/20 border border-white/15 text-white cursor-pointer"
                title={`Open Live 3D Voidwalker Character Studio [${formatKeyCodeLabel(
                  kb.avatarStudio
                )}]`}
              >
                Avatar [{formatKeyCodeLabel(kb.avatarStudio)}]
              </button>
            </>
          )}
        </div>
        )}

        {/* 2. IN-HAND 3D INVENTORY BLOOM QUICK-CRAFT POPUP (Only when Hand Inventory is active) */}
        {voidBallMode === 'hand-inventory-bloom' && (
          <div className="bg-slate-950/90 backdrop-blur-xl border border-purple-400/40 rounded-xl p-2.5 shadow-2xl space-y-2 max-w-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold">
                ✋ Left-Hand Void Ball Inventory Bloom
              </span>
              <span className="text-[9px] font-mono text-slate-400">
                Press [{formatKeyCodeLabel(kb.handInventory)}] to Clench Shut
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {(Object.keys(RESOURCE_CATALOG) as ResourceId[]).map((rId) => {
                const meta = RESOURCE_CATALOG[rId];
                const count = inventory[rId] ?? 0;
                return (
                  <div
                    key={rId}
                    className="bg-slate-900/80 border border-white/10 rounded p-1 text-center"
                  >
                    <div
                      className="text-xs font-mono font-bold"
                      style={{ color: meta.color }}
                    >
                      {count}
                    </div>
                    <div className="text-[8px] text-slate-400 truncate">
                      {meta.name.split(' ')[0]}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {CRAFTING_RECIPES.slice(0, 4).map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => onCraftRecipe(rec)}
                  className="text-left px-2 py-1 rounded bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/30 text-[9px] text-purple-100 cursor-pointer truncate"
                >
                  ⚡ {rec.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. ON-DEMAND CULTURAL SIMS & TROJAN SABOTAGE QUEST POPOVER */}
      {showQuestPopover && (
        <div className="pointer-events-auto absolute top-14 right-3 z-20 w-72 bg-slate-950/90 backdrop-blur-xl border border-white/15 rounded-2xl p-3 shadow-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold">
              Cultural Sims & Questline
            </span>
            <button
              onClick={() => setShowQuestPopover(false)}
              className="text-[10px] font-mono text-slate-400 hover:text-white cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <div className="text-[10px] text-slate-300 bg-slate-900/70 rounded-lg p-2 border border-white/10">
            <div className="font-mono text-cyan-300 font-semibold">
              {activeElemSpec.name} ({currentPerception.replace(/-/g, ' ')})
            </div>
            <p className="mt-0.5 text-slate-300 leading-snug">
              {currentPerception === 'incomprehensible-alien-horror'
                ? activeElemSpec.outsiderHorrorAppearance
                : currentPerception === 'arcane-dimensional-magic'
                ? activeElemSpec.nativeSurvivalRoutine
                : activeElemSpec.decodedMasteryMechanic}
            </p>
          </div>

          {activeQuest && (
            <div
              className={`rounded-xl p-2.5 border space-y-1.5 ${
                activeQuest.sabotageRevealedToPlayer &&
                activeQuest.isDeceptiveSabotage
                  ? 'bg-rose-950/40 border-rose-400/50'
                  : 'bg-slate-900/70 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate">
                  {activeQuest.title}
                </span>
                <span className="text-[9px] font-mono text-amber-300 shrink-0">
                  {activeQuest.sabotageRevealedToPlayer &&
                  activeQuest.isDeceptiveSabotage
                    ? '⚠ SABOTAGE'
                    : 'QUEST'}
                </span>
              </div>
              <p className="text-[10px] text-slate-300 leading-snug">
                {activeQuest.sabotageRevealedToPlayer
                  ? activeQuest.hiddenSabotageTruth
                  : activeQuest.statedCulturalObjective}
              </p>
              <div className="flex gap-1.5 pt-1">
                <button
                  onClick={onDecodeOrCounterSabotage}
                  className="flex-1 px-2 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-[10px] font-mono text-cyan-200 cursor-pointer"
                >
                  [{formatKeyCodeLabel(kb.dimensionalShift)}] Decode / Counter
                </button>
                <button
                  onClick={onGenerateNextQuest}
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] font-mono text-slate-300 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          <div className="max-h-36 overflow-y-auto space-y-1">
            {denizenSims.slice(0, 5).map((sim) => (
              <div
                key={sim.entityId}
                className="bg-slate-900/60 border border-white/5 rounded-lg p-1.5 flex items-center justify-between text-[10px]"
              >
                <span className="text-white font-medium truncate">
                  {sim.isScarredNemesis ? '💀 ' : ''}
                  {sim.entityName}
                </span>
                <span className="font-mono text-cyan-300 text-[9px] shrink-0 ml-1">
                  {sim.currentActivity.replace(/-/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. FAR CRY × BIODEPTH DIMENSIONAL DEVIANCE PERK TREE MODAL */}
      {isPerkTreeOpen && (
        <div
          onClick={onTogglePerkTree}
          className="pointer-events-auto fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[84vh] bg-slate-950 border border-purple-400/35 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Living Biodepth Background Art */}
            <BiodepthInteractiveCanvasBackground
              boundaryId={biodepthConfig.activeUniverseBoundary}
              intensity={0.9}
            />

            <div className="relative z-10 px-5 py-3.5 border-b border-white/15 flex items-center justify-between bg-slate-950/75 backdrop-blur-md">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-purple-300">
                  Biodepth × Multiversal Deviance Skill Tree · {activeSeed.name}
                </div>
                <h2 className="text-lg font-bold text-white">
                  Dimensional Deviance Perks & Square Portal Room Mastery
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-amber-300 font-bold">
                  {devianceXP} Deviance XP Available (Lv.{devianceLevel})
                </span>
                <button
                  onClick={onTogglePerkTree}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-white cursor-pointer"
                >
                  Close [{formatKeyCodeLabel(kb.perkTree)}]
                </button>
              </div>
            </div>

            <div className="relative z-10 px-5 py-2 bg-slate-950/70 border-b border-white/10 flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'all', label: 'All Branches (12)' },
                  { id: 'predator-lethality', label: 'I. Predator & Gore' },
                  { id: 'dimensional-phase', label: 'II. Dimensional Phase' },
                  {
                    id: 'biomechanical-assimilation',
                    label: 'III. Bio-Assimilation',
                  },
                  {
                    id: 'sanctum-cultural-mastery',
                    label: 'IV. Sanctum & Culture',
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedPerkBranch(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    selectedPerkBranch === tab.id
                      ? 'bg-purple-500 text-white font-bold'
                      : 'bg-slate-900/90 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {DIMENSIONAL_PERK_TREE.filter(
                (p) =>
                  selectedPerkBranch === 'all' ||
                  p.branch === selectedPerkBranch
              ).map((perk) => {
                const isUnlocked = unlockedPerkIds.includes(perk.id);
                const canAfford = devianceXP >= perk.costXP;
                return (
                  <div
                    key={perk.id}
                    className={`rounded-xl border p-3.5 flex flex-col justify-between transition-all backdrop-blur-md ${
                      isUnlocked
                        ? 'bg-purple-950/55 border-purple-400/60'
                        : 'bg-slate-950/85 border-white/15'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-amber-300">
                          Tier {perk.tier} · {perk.costXP} XP
                        </span>
                        {isUnlocked && (
                          <span className="text-[9px] font-mono text-emerald-300 font-bold">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white">
                        {perk.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {perk.description}
                      </p>
                      <div className="text-[10px] text-cyan-200 bg-slate-900/80 rounded p-1.5 border border-white/5">
                        Sanctum: {perk.sanctumUpgradeEffect}
                      </div>
                    </div>

                    <div className="pt-2.5 mt-2.5 border-t border-white/10">
                      {isUnlocked ? (
                        <div className="text-center text-[10px] font-mono text-emerald-300">
                          ✓ Deviance Active
                        </div>
                      ) : (
                        <button
                          disabled={!canAfford}
                          onClick={() => onUnlockPerk(perk)}
                          className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all ${
                            canAfford
                              ? 'bg-gradient-to-r from-purple-500 to-amber-500 text-slate-950 cursor-pointer'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {canAfford
                            ? `Unlock (${perk.costXP} XP)`
                            : `Need ${perk.costXP} XP`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
