import React from 'react';
import {
  DynamicQuickKeyBinding,
  HUMAN_SKIN_TONE_PRESETS,
  HumanGloveStyleId,
  MindspaceAndVoidDialConfig,
  PLAYER_MORPH_MODE_CATALOG,
  PlayerMorphModeId,
  RELIC_HUD_THEME_CATALOG,
  RelicHudThemeId,
  VOID_DIAL_CONTROL_SCHEMES,
  VoidBallWeaponPullAnimationState,
  VoidDialControlSchemeId,
  VoidDialSectorId,
} from '../utils/carvedMaterialAndMindspaceEngine';
import { DimensionalItemDefinition } from '../utils/bethesdaScaleCompendiumEngine';
import {
  PORTAL_ROOM_MODULE_BLUEPRINTS,
  PortalRoomGravityMode,
  PortalRoomModuleKind,
  PortalRoomRuntimeTelemetry,
} from '../types/portalAndBiodepth';
import {
  CameraPerspective,
  PlayerInteractionTool,
} from '../types/manifold';
import {
  ActiveWeaponCombatState,
  isMagazineFedRangedWeapon,
} from '../utils/compositeModelAndGroundingEngine';
import { MindspaceFocusTargetId } from '../utils/carvedMaterialAndMindspaceEngine';

interface VoidBallDialAndMindspaceHUDProps {
  config: MindspaceAndVoidDialConfig;
  onUpdateConfig: (
    updater: (prev: MindspaceAndVoidDialConfig) => MindspaceAndVoidDialConfig
  ) => void;
  dynamicQuickKeys: DynamicQuickKeyBinding[];
  onTriggerDynamicQuickKey: (binding: DynamicQuickKeyBinding) => void;
  availableWeapons: DimensionalItemDefinition[];
  equippedWeaponId: string;
  onPullWeaponFromVoidBall: (item: DimensionalItemDefinition) => void;
  activeTool: PlayerInteractionTool;
  onPullToolFromVoidBall: (tool: PlayerInteractionTool) => void;
  pullAnimState: VoidBallWeaponPullAnimationState;
  portalTelemetry?: PortalRoomRuntimeTelemetry;
  onEnterOrExitPortalRoomNow?: () => void;
  onToggleSecondaryMazeGate?: () => void;
  onCycleMazeSelection?: (delta: -1 | 1) => void;
  onSelectRoomModuleKind?: (kind: PortalRoomModuleKind) => void;
  onPlaceRoomModuleNow?: (kind?: PortalRoomModuleKind) => void;
  onChangePortalRoomGravityMode?: (mode: PortalRoomGravityMode) => void;
  onOpenFullCompendium?: () => void;
  onOpenCrucibleModal?: () => void;
  onOpenTimelineModal?: () => void;
  onTogglePerkTree?: () => void;
  onOpenEquationCodex?: () => void;
  cameraMode?: CameraPerspective;
  onSetCameraMode?: (mode: CameraPerspective) => void;
  onCycleCameraPerspective?: () => void;
  freeLookMode?: 'cursor-gliding' | 'pointer-lock' | 'click-drag';
  onCycleFreeLookMode?: () => void;
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
  weaponCombatState?: ActiveWeaponCombatState;
  grappledEnemyName?: string | null;
  onReloadActiveWeapon?: () => void;
  onToggleSheathWeapon?: () => void;
  onInspectActiveWeapon?: () => void;
  lastCombatBanner?: string;
}

const GLOVE_STYLE_OPTIONS: {
  id: HumanGloveStyleId;
  label: string;
  desc: string;
}[] = [
  {
    id: 'bare-anatomical-hands',
    label: 'Bare Anatomical Hands',
    desc: 'Unadorned human forearms, dorsal tendons, knuckles & fingernails',
  },
  {
    id: 'stitched-leather-bracers',
    label: 'Stitched Leather Bracers',
    desc: 'Pebbled hide forearm vambraces with bare articulated human fingers',
  },
  {
    id: 'carved-obsidian-cuffs',
    label: 'Carved Obsidian Cuffs',
    desc: 'Chiselled volcanic stone wrist guards with runic bevels',
  },
  {
    id: 'runic-astrolabe-wraps',
    label: 'Ancient Brass Astrolabe Wraps',
    desc: 'Etched celestial brass wrist gimbals & leather straps',
  },
];

const SECTOR_TABS: {
  id: VoidDialSectorId;
  label: string;
  shortLabel: string;
  glyph: string;
}[] = [
  {
    id: 'weapons-and-tools',
    label: 'Weapons & Tools Vault',
    shortLabel: 'Weapons',
    glyph: '⚔',
  },
  {
    id: 'portals-and-mazes',
    label: 'Portals & 100 Mazes',
    shortLabel: 'Portals',
    glyph: '🌀',
  },
  {
    id: 'substrate-synthesis',
    label: 'Substrate & Architect',
    shortLabel: 'Substrate',
    glyph: '🏛',
  },
  {
    id: 'character-morphs',
    label: 'Human & Special Morphs',
    shortLabel: 'Morphs',
    glyph: '🪽',
  },
];

export const VoidBallDialAndMindspaceHUD: React.FC<
  VoidBallDialAndMindspaceHUDProps
> = ({
  config,
  onUpdateConfig,
  dynamicQuickKeys,
  onTriggerDynamicQuickKey,
  availableWeapons,
  equippedWeaponId,
  onPullWeaponFromVoidBall,
  activeTool,
  onPullToolFromVoidBall,
  pullAnimState,
  portalTelemetry,
  onEnterOrExitPortalRoomNow,
  onToggleSecondaryMazeGate,
  onCycleMazeSelection,
  onSelectRoomModuleKind,
  onPlaceRoomModuleNow,
  onChangePortalRoomGravityMode,
  onOpenFullCompendium,
  onOpenCrucibleModal,
  onOpenTimelineModal,
  onTogglePerkTree,
  onOpenEquationCodex,
  cameraMode = 'third-person',
  onSetCameraMode,
  onCycleCameraPerspective,
  freeLookMode = 'cursor-gliding',
  onCycleFreeLookMode,
  audioEnabled = false,
  onToggleAudio,
  weaponCombatState,
  grappledEnemyName,
  onReloadActiveWeapon,
  onToggleSheathWeapon,
  onInspectActiveWeapon,
  lastCombatBanner,
}) => {
  const theme =
    RELIC_HUD_THEME_CATALOG[config.hudTheme] ??
    RELIC_HUD_THEME_CATALOG['carved-obsidian-runes'];
  const activeMorph =
    PLAYER_MORPH_MODE_CATALOG[config.activeMorphMode] ??
    PLAYER_MORPH_MODE_CATALOG['human-default'];
  const activeScheme =
    VOID_DIAL_CONTROL_SCHEMES[config.dialControlScheme] ??
    VOID_DIAL_CONTROL_SCHEMES['toggle-dial-quickkeys'];

  const isMinimalTheme = config.hudTheme === 'minimal-diegetic-projection';

  const equippedWeapon =
    availableWeapons.find((w) => w.id === equippedWeaponId) ??
    availableWeapons[0];
  const usesMag = equippedWeapon
    ? isMagazineFedRangedWeapon(equippedWeapon)
    : false;
  const isSheathed = weaponCombatState?.isSheathed ?? false;
  const isReloading = weaponCombatState?.isReloading ?? false;
  const curAmmo = weaponCombatState?.currentAmmo ?? 8;
  const maxMag = weaponCombatState?.maxMagazine ?? 8;

  return (
    <>
      {/* ====================================================================
          1. RIGHT-HAND PULL-FROM-VOID-BALL EXTRACTION TOAST BANNER
      ==================================================================== */}
      {pullAnimState.active && (
        <div
          className={`pointer-events-none fixed bottom-28 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded border ${theme.panelBgCss} ${theme.borderCss} flex items-center gap-2.5`}
        >
          <span
            className="text-sm font-serif"
            style={{ color: pullAnimState.accentHex }}
          >
            {theme.glyphSymbol}
          </span>
          <div className="text-[11px] font-mono tracking-wide">
            <span className={`font-bold ${theme.textPrimaryCss}`}>
              Right Hand Drawing from Void Ball:{' '}
            </span>
            <span style={{ color: pullAnimState.accentHex }} className="font-bold">
              {pullAnimState.pulledItemName}
            </span>
            <span className={`ml-1.5 ${theme.textMutedCss}`}>
              ({pullAnimState.pulledItemSubType})
            </span>
          </div>
        </div>
      )}

      {/* ====================================================================
          2. UNOBTRUSIVE CARVED RELIC PORTAL ROOM RIBBON (Never blocks sightline!)
      ==================================================================== */}
      {portalTelemetry &&
        (portalTelemetry.isPlayerInsidePortalRoom ||
          portalTelemetry.isPortalOpenInWorld) &&
        !config.isMindspaceOpen &&
        !config.hidePortalRoomBanners && (
          <div
            className={`pointer-events-auto fixed top-12 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded border ${theme.panelBgCss} ${theme.borderCss} flex flex-wrap items-center gap-2.5 max-w-2xl`}
          >
            <span
              className="text-xs font-serif"
              style={{ color: theme.accentHex }}
            >
              {theme.cornerOrnament}
            </span>
            <span className={`text-[10px] font-mono font-bold ${theme.textPrimaryCss}`}>
              {portalTelemetry.isPlayerInsidePortalRoom
                ? `SANCTUM TIER ${portalTelemetry.portalRoomTier} · ${
                    portalTelemetry.isInnerMazePortalOpen
                      ? `${portalTelemetry.selectedMazeCode} "${portalTelemetry.selectedMazeTitle}"`
                      : portalTelemetry.focusedStationLabel
                  }`
                : `REALITY TEAR OPEN (${Math.round(
                    portalTelemetry.portalOpenProgress * 100
                  )}%)`}
            </span>

            {portalTelemetry.isPlayerInsidePortalRoom &&
              portalTelemetry.isInnerMazePortalOpen &&
              onCycleMazeSelection && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onCycleMazeSelection(-1)}
                    className="px-1.5 py-0.5 rounded bg-stone-900/90 border border-stone-700/60 text-[10px] font-mono text-amber-200 hover:bg-stone-800 cursor-pointer"
                  >
                    ←
                  </button>
                  <span className="text-[9px] font-mono text-stone-400">
                    {portalTelemetry.knownMazesCount} Mazes
                  </span>
                  <button
                    onClick={() => onCycleMazeSelection(1)}
                    className="px-1.5 py-0.5 rounded bg-stone-900/90 border border-stone-700/60 text-[10px] font-mono text-amber-200 hover:bg-stone-800 cursor-pointer"
                  >
                    →
                  </button>
                </div>
              )}

            <div className="flex items-center gap-1">
              {onEnterOrExitPortalRoomNow && (
                <button
                  onClick={onEnterOrExitPortalRoomNow}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-600/30 hover:bg-amber-600/45 border border-amber-500/50 text-amber-100 cursor-pointer"
                >
                  {portalTelemetry.isPlayerInsidePortalRoom
                    ? '⇪ Exit Sanctum'
                    : '🚪 Step Inside'}
                </button>
              )}
              {portalTelemetry.isPlayerInsidePortalRoom &&
                onToggleSecondaryMazeGate && (
                  <button
                    onClick={onToggleSecondaryMazeGate}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-900/80 hover:bg-stone-800 border border-stone-600/50 text-stone-200 cursor-pointer"
                  >
                    {portalTelemetry.isInnerMazePortalOpen
                      ? 'Close Maze Gate'
                      : '🌀 Maze Gate [V]'}
                  </button>
                )}
              <button
                onClick={() =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    isMindspaceOpen: true,
                  }))
                }
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-900/80 hover:bg-stone-800 border border-amber-600/40 text-amber-200 cursor-pointer"
                title="Sink into 3D Mindspace Customization [Shift + V]"
              >
                {theme.glyphSymbol} Mindspace [⇧V]
              </button>
            </div>
          </div>
        )}

      {/* ====================================================================
          3. RADIAL LEFT-HAND VOID BALL MENU DIAL ([V]) & WEAPONS/TOOLS VAULT
      ==================================================================== */}
      {config.isVoidDialOpen && !config.isMindspaceOpen && (
        <div
          onWheel={(e) => {
            if (config.dialControlScheme === 'wheel-dial-click-confirm') {
              e.stopPropagation();
              const dir = e.deltaY > 0 ? 1 : -1;
              onUpdateConfig((prev) => ({
                ...prev,
                selectedSectorItemIndex: Math.max(
                  0,
                  (prev.selectedSectorItemIndex + dir + 8) % 8
                ),
              }));
            }
          }}
          className={`pointer-events-auto fixed bottom-16 left-4 z-30 w-[370px] sm:w-[410px] rounded-xl border ${theme.panelBgCss} ${theme.borderCss} p-3 transition-all`}
        >
          {/* Carved Relic Header & [V] Control Mode Switcher */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-700/45">
            <div className="flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-serif border border-amber-500/50 bg-stone-950"
                style={{ color: theme.accentHex }}
              >
                {theme.glyphSymbol}
              </span>
              <div>
                <div
                  className={`text-xs font-serif font-bold tracking-wide uppercase ${theme.textPrimaryCss}`}
                >
                  Left-Palm Void Ball Dial
                </div>
                <div className={`text-[9px] font-mono ${theme.textMutedCss}`}>
                  {activeScheme.shortLabel} · [1–4] Dynamic Quick Keys
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    isMindspaceOpen: true,
                    isVoidDialOpen: false,
                  }))
                }
                className="px-2 py-0.5 rounded bg-amber-700/25 hover:bg-amber-700/40 border border-amber-500/45 text-[9px] font-mono text-amber-200 cursor-pointer"
                title="Open 3D Mindspace Customization [Shift + V]"
              >
                ⇧V Mindspace
              </button>
              <button
                onClick={() =>
                  onUpdateConfig((prev) => ({ ...prev, isVoidDialOpen: false }))
                }
                className="px-2 py-0.5 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700 text-[9px] font-mono text-stone-300 cursor-pointer"
              >
                ✕ [V]
              </button>
            </div>
          </div>

          {/* 3 Selectable [V] Dial Control Modes Bar */}
          <div className="mt-2 flex items-center gap-1 bg-black/45 p-1 rounded-lg border border-stone-800/80">
            {(
              Object.keys(
                VOID_DIAL_CONTROL_SCHEMES
              ) as VoidDialControlSchemeId[]
            ).map((schemeId) => {
              const sc = VOID_DIAL_CONTROL_SCHEMES[schemeId];
              const isSel = config.dialControlScheme === schemeId;
              return (
                <button
                  key={schemeId}
                  onClick={() =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      dialControlScheme: schemeId,
                    }))
                  }
                  className={`flex-1 py-1 px-1.5 rounded text-[9px] font-mono transition-all cursor-pointer truncate ${
                    isSel
                      ? 'bg-amber-600/35 border border-amber-500/60 text-amber-100 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  title={sc.description}
                >
                  {sc.shortLabel}
                </button>
              );
            })}
          </div>

          {/* 4 Radial Sector Tabs */}
          <div className="mt-2 grid grid-cols-4 gap-1">
            {SECTOR_TABS.map((sec) => {
              const isAct = config.activeDialSector === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      activeDialSector: sec.id,
                      selectedSectorItemIndex: 0,
                    }))
                  }
                  className={`py-1.5 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                    isAct
                      ? 'bg-amber-600/25 border-amber-500/70 text-amber-100 font-bold shadow-inner'
                      : 'bg-stone-950/80 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <div className="text-xs">{sec.glyph}</div>
                  <div className="text-[9px] font-mono mt-0.5 truncate">
                    {sec.shortLabel}
                  </div>
                </button>
              );
            })}
          </div>

          {/* SECTOR I: WEAPONS & TOOLS VAULT (Right-Hand Pull From Void Ball!) */}
          {config.activeDialSector === 'weapons-and-tools' && (
            <div className="mt-2.5 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-amber-200/90 font-bold">
                  ✋ Right-Hand Pull From Void Singularity:
                </span>
                {onOpenFullCompendium && (
                  <button
                    onClick={onOpenFullCompendium}
                    className="text-[9px] text-amber-300 hover:underline cursor-pointer"
                  >
                    325-Item Armory [Tab] →
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-0.5">
                {availableWeapons.slice(0, 6).map((w, idx) => {
                  const isEquipped = w.id === equippedWeaponId;
                  const isWheelFocused =
                    config.selectedSectorItemIndex % 6 === idx;
                  return (
                    <button
                      key={w.id}
                      onClick={() => onPullWeaponFromVoidBall(w)}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isEquipped
                          ? 'bg-amber-700/30 border-amber-400 text-amber-50'
                          : isWheelFocused &&
                            config.dialControlScheme ===
                              'wheel-dial-click-confirm'
                          ? 'bg-stone-800/90 border-amber-500/60 text-stone-100'
                          : 'bg-stone-950/85 border-stone-800 hover:border-stone-600 text-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/60 border border-stone-700 text-amber-300">
                          {idx < 4 ? `[${idx + 1}]` : 'PULL'}
                        </span>
                        <span
                          className="text-[9px] font-mono truncate"
                          style={{ color: w.visualSpec.accentEmissiveHex }}
                        >
                          {w.subTypeLabel}
                        </span>
                      </div>
                      <div className="text-[11px] font-bold mt-1 truncate">
                        {w.name}
                      </div>
                      <div className="text-[9px] font-mono text-stone-400 flex items-center justify-between mt-0.5">
                        <span>DMG {w.stats.damage}</span>
                        <span>
                          {isEquipped ? '✓ In Right Hand' : 'Pull from Void ↗'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Substrate Tools Row */}
              <div className="pt-1.5 border-t border-stone-800 grid grid-cols-4 gap-1">
                {(
                  [
                    {
                      id: 'mine-terrain',
                      label: 'Excavate',
                      glyph: '⛏',
                    },
                    {
                      id: 'grapple-hook',
                      label: 'Grapple',
                      glyph: '⚓',
                    },
                    {
                      id: 'place-building',
                      label: 'Construct',
                      glyph: '🏛',
                    },
                    {
                      id: 'harmonic-tether',
                      label: 'Tether',
                      glyph: '∿',
                    },
                  ] as const
                ).map((t) => {
                  const isAct = activeTool === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => onPullToolFromVoidBall(t.id)}
                      className={`py-1 px-1.5 rounded border text-[9px] font-mono cursor-pointer text-center ${
                        isAct
                          ? 'bg-amber-600/30 border-amber-400 text-amber-100 font-bold'
                          : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:text-white'
                      }`}
                    >
                      {t.glyph} {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTOR II: PORTALS & 100 PROCEDURAL MAZES */}
          {config.activeDialSector === 'portals-and-mazes' && (
            <div className="mt-2.5 space-y-2 text-[10px] font-mono">
              <div className="grid grid-cols-2 gap-1.5">
                {dynamicQuickKeys.map((qk) => (
                  <button
                    key={qk.keyNumber}
                    onClick={() => onTriggerDynamicQuickKey(qk)}
                    className="p-2 rounded-lg bg-stone-950/90 hover:bg-stone-900 border border-stone-700/80 text-left cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-200 font-bold">
                        [{qk.keyNumber}]
                      </span>
                      <span>{qk.glyph}</span>
                    </div>
                    <div className="text-[11px] font-bold text-stone-100 mt-1">
                      {qk.label}
                    </div>
                    <div className="text-[9px] text-stone-400 truncate">
                      {qk.subLabel}
                    </div>
                  </button>
                ))}
              </div>

              {portalTelemetry && (
                <div className="p-2 rounded-lg bg-black/50 border border-stone-800 flex items-center justify-between">
                  <div>
                    <div className="text-amber-200 font-bold">
                      Maze Gate: {portalTelemetry.selectedMazeCode}{' '}
                      {portalTelemetry.selectedMazeTitle}
                    </div>
                    <div className="text-[9px] text-stone-400">
                      {portalTelemetry.selectedMazeThemeTitle} · Assimilation{' '}
                      {Math.round(portalTelemetry.selectedMazeAssimilationPct ?? 0)}%
                    </div>
                  </div>
                  {onCycleMazeSelection && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onCycleMazeSelection(-1)}
                        className="px-2 py-1 rounded bg-stone-900 border border-stone-700 text-amber-200 cursor-pointer"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => onCycleMazeSelection(1)}
                        className="px-2 py-1 rounded bg-stone-900 border border-stone-700 text-amber-200 cursor-pointer"
                      >
                        →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SECTOR III: SUBSTRATE SYNTHESIS & SANCTUM ARCHITECT */}
          {config.activeDialSector === 'substrate-synthesis' && (
            <div className="mt-2.5 space-y-2 text-[10px] font-mono">
              <div className="text-amber-200 font-bold">
                Sanctum Wing Modules & Substrate Fabrication:
              </div>
              <div className="grid grid-cols-3 gap-1">
                {PORTAL_ROOM_MODULE_BLUEPRINTS.slice(0, 6).map((bp) => {
                  const isSel = portalTelemetry?.activeModuleKind === bp.kind;
                  return (
                    <button
                      key={bp.kind}
                      onClick={() => {
                        onSelectRoomModuleKind?.(bp.kind);
                        onPlaceRoomModuleNow?.(bp.kind);
                      }}
                      className={`p-1.5 rounded border text-left cursor-pointer ${
                        isSel
                          ? 'bg-amber-600/30 border-amber-400 text-amber-100 font-bold'
                          : 'bg-stone-950/80 border-stone-800 text-stone-300 hover:text-white'
                      }`}
                    >
                      <div className="truncate font-bold">
                        {bp.name.split(' ')[0]}
                      </div>
                      <div className="text-[8px] text-stone-400 truncate">
                        Snap [B]
                      </div>
                    </button>
                  );
                })}
              </div>

              {onChangePortalRoomGravityMode && (
                <div className="flex items-center justify-between bg-black/45 p-1.5 rounded border border-stone-800">
                  <span className="text-stone-400">Sanctum Gravity:</span>
                  <div className="flex gap-1">
                    {(
                      [
                        { id: 'stabilized-1g', label: '1.0G' },
                        { id: 'low-g-architect', label: '0.38G' },
                        { id: 'boundary-linked', label: 'Dim-Linked' },
                      ] as const
                    ).map((gm) => (
                      <button
                        key={gm.id}
                        onClick={() => onChangePortalRoomGravityMode(gm.id)}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          (portalTelemetry?.portalRoomGravityMode ??
                            'stabilized-1g') === gm.id
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'bg-stone-900 text-stone-400'
                        }`}
                      >
                        {gm.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {onOpenCrucibleModal && (
                <button
                  onClick={onOpenCrucibleModal}
                  className="w-full py-1.5 rounded bg-amber-600/25 hover:bg-amber-600/40 border border-amber-500/50 text-amber-100 font-bold cursor-pointer"
                >
                  ⚒ Open Full Crucible & Matter Transmuter [K]
                </button>
              )}
            </div>
          )}

          {/* SECTOR IV: HUMAN DEFAULT & SPECIAL TRANSFORMATION MODES */}
          {config.activeDialSector === 'character-morphs' && (
            <div className="mt-2.5 space-y-2 text-[10px] font-mono">
              <div className="flex items-center justify-between">
                <span className="text-amber-200 font-bold">
                  Shift Form (Default Human vs. Special Modes):
                </span>
                <span className="text-[9px] text-stone-400">
                  Resonance: {Math.round(config.combatResonancePct)}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto">
                {(
                  Object.keys(
                    PLAYER_MORPH_MODE_CATALOG
                  ) as PlayerMorphModeId[]
                ).map((mId, idx) => {
                  const mSpec = PLAYER_MORPH_MODE_CATALOG[mId];
                  const isAct = config.activeMorphMode === mId;
                  return (
                    <button
                      key={mId}
                      onClick={() =>
                        onUpdateConfig((prev) => ({
                          ...prev,
                          activeMorphMode: mId,
                        }))
                      }
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        isAct
                          ? 'bg-amber-600/30 border-amber-400 text-amber-50 font-bold'
                          : 'bg-stone-950/85 border-stone-800 text-stone-300 hover:border-stone-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[9px] font-bold"
                          style={{ color: mSpec.accentHex }}
                        >
                          {idx < 4 ? `[${idx + 1}] ` : ''}
                          {mSpec.isDefaultHuman ? 'HUMAN' : 'MORPH'}
                        </span>
                        {isAct && (
                          <span className="text-[8px] text-emerald-300">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-bold text-stone-100 truncate mt-0.5">
                        {mSpec.name}
                      </div>
                      <div className="text-[8px] text-stone-400 truncate">
                        {mSpec.specialAbilityLabel}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          4. UNIFIED BOTTOM CARVED-RELIC COMMAND SHELL (Zero Overlapping Bars!)
             Combines:
             - Left Wing: [V] Void Ball Dial, [1-4] Dynamic Quick Keys, Human/Morph Form, [⇧V] 3D Model Studio
             - Center Wing: Dedicated 3-Way POV Switcher (1st Hands | 3rd Body | Orbit [F5]) + Gaze + Audio
             - Right Wing: Equipped Right-Hand Carved Weapon, Ammo/DMG, [R] Reload, [H] Sheath, [Y] Inspect, [Tab] Armory
      ==================================================================== */}
      {!config.isMindspaceOpen && (
        <div className="pointer-events-none fixed bottom-2.5 inset-x-3 z-20 flex flex-col gap-1">
          {/* Combat / Event Toast Banner — only shown when the [V] Dial popup is closed so it never overlaps */}
          {lastCombatBanner && !isMinimalTheme && !config.isVoidDialOpen && (
            <div
              className={`pointer-events-auto px-2.5 py-0.5 rounded-sm border ${theme.panelBgCss} ${theme.borderCss} text-[10px] font-mono ${theme.textPrimaryCss} flex items-center gap-1.5 w-fit max-w-xl truncate`}
            >
              <span style={{ color: theme.accentHex }}>
                {theme.cornerOrnament}
              </span>
              <span className="truncate">{lastCombatBanner}</span>
            </div>
          )}

          {/* Unified Carved Obsidian & Brass Relic Dock */}
          <div
            className={`pointer-events-auto w-full px-2.5 py-1.5 rounded-sm border ${theme.panelBgCss} ${theme.borderCss} flex flex-wrap items-center justify-between gap-2`}
          >
            {/* LEFT WING: [V] Void Ball Dial, [1-4] Dynamic Quick Keys, Human/Morph Form & [⇧V] Mindspace */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    isVoidDialOpen: !prev.isVoidDialOpen,
                  }))
                }
                className={`px-2.5 py-1 rounded-sm text-[10px] font-mono border transition-all cursor-pointer flex items-center gap-1.5 ${
                  config.isVoidDialOpen
                    ? 'bg-amber-600/40 border-amber-400 text-amber-100 font-bold'
                    : 'bg-stone-950/90 border-stone-700/80 text-stone-200 hover:border-amber-500/60'
                }`}
                title={`Open Left-Palm Void Ball Menu Dial [V] (${activeScheme.name})`}
              >
                <span style={{ color: theme.accentHex }}>
                  {theme.glyphSymbol}
                </span>
                <span>Void Dial [V]</span>
              </button>

              {/* Dynamic Context-Sensitive Quick Keys [1] - [4] */}
              <div className="flex items-center gap-1">
                {dynamicQuickKeys.map((qk) => (
                  <button
                    key={qk.keyNumber}
                    onClick={() => onTriggerDynamicQuickKey(qk)}
                    className="px-2 py-0.5 rounded-sm bg-stone-950/90 hover:bg-stone-900 border border-stone-700/70 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all"
                    title={`${qk.label}: ${qk.subLabel}`}
                  >
                    <span
                      className="font-bold"
                      style={{ color: qk.accentHex }}
                    >
                      [{qk.keyNumber}]
                    </span>
                    <span
                      className={`${theme.textPrimaryCss} truncate max-w-[86px]`}
                    >
                      {qk.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Active Character Form (Human Default vs Special Morph) + Resonance Meter */}
              <button
                onClick={() =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    activeMorphMode:
                      prev.activeMorphMode === 'human-default'
                        ? 'ophanim-seraph'
                        : 'human-default',
                  }))
                }
                className="px-2 py-0.5 rounded-sm bg-stone-950/90 hover:bg-stone-900 border border-stone-700/70 text-[10px] font-mono flex items-center gap-1.5 cursor-pointer"
                title="Click to shift between Realistic Human Explorer and Active Special Transformation Mode"
              >
                <span
                  className="w-2 h-2 rotate-45"
                  style={{ backgroundColor: activeMorph.accentHex }}
                />
                <span className={theme.textPrimaryCss}>
                  {activeMorph.isDefaultHuman
                    ? 'Human'
                    : activeMorph.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-amber-400/90">
                  {Math.round(config.combatResonancePct)}%
                </span>
              </button>

              {/* [Shift + V] 3D Mindspace & Visual Model Quality Inspector Button */}
              <button
                onClick={() =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    isMindspaceOpen: !prev.isMindspaceOpen,
                  }))
                }
                className="px-2 py-0.5 rounded-sm bg-amber-950/45 hover:bg-amber-900/60 border border-amber-500/60 text-[10px] font-mono font-bold text-amber-200 cursor-pointer"
                title="Sink perspective into 3D Mindspace & Live Visual Model Quality Inspector [Shift + V]"
              >
                ⇧V 3D Models & HUD
              </button>
            </div>

            {/* CENTER WING: Prominent Segmented Camera POV Switcher (1st Hands | 3rd Body | Orbit [F5]) & Gaze/Audio */}
            <div className="flex items-center gap-1.5 border-x border-stone-800 px-2.5">
              <div className="flex items-center bg-black/70 border border-stone-700/80 p-0.5 rounded-sm">
                <span className="px-1.5 text-[9px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  POV [F5]:
                </span>
                {(
                  [
                    {
                      id: 'first-person',
                      label: '1st Hands',
                      hint: '1st-Person Articulated Human Hands, Void Ball & Weapon Pull',
                    },
                    {
                      id: 'third-person',
                      label: '3rd Body',
                      hint: '3rd-Person Full Realistic Human / Special Morph Character',
                    },
                    {
                      id: 'orbital-director',
                      label: 'Orbit',
                      hint: '360° Orbital Director Camera',
                    },
                  ] as const
                ).map((pov) => {
                  const isAct = cameraMode === pov.id;
                  return (
                    <button
                      key={pov.id}
                      onClick={() => {
                        if (onSetCameraMode) {
                          onSetCameraMode(pov.id);
                        } else if (onCycleCameraPerspective) {
                          onCycleCameraPerspective();
                        }
                      }}
                      className={`px-2 py-0.5 text-[10px] font-mono transition-all cursor-pointer rounded-sm ${
                        isAct
                          ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                          : 'text-stone-300 hover:text-amber-200 hover:bg-stone-900'
                      }`}
                      title={pov.hint}
                    >
                      {pov.label}
                    </button>
                  );
                })}
              </div>

              {onCycleFreeLookMode && (
                <button
                  onClick={onCycleFreeLookMode}
                  className="px-2 py-0.5 rounded-sm bg-stone-950/90 hover:bg-stone-900 border border-stone-700/70 text-[10px] font-mono text-amber-200/90 cursor-pointer"
                  title="Cycle Camera Gaze Control Mode (Hover Free-Look / Pointer-Lock / Click-Drag)"
                >
                  Gaze:{' '}
                  {freeLookMode === 'cursor-gliding'
                    ? 'Hover'
                    : freeLookMode === 'pointer-lock'
                    ? 'Lock'
                    : 'Drag'}
                </button>
              )}

              {onToggleAudio && (
                <button
                  onClick={onToggleAudio}
                  className={`px-2 py-0.5 rounded-sm border text-[10px] font-mono cursor-pointer ${
                    audioEnabled
                      ? 'bg-amber-600/30 border-amber-500/60 text-amber-100 font-bold'
                      : 'bg-stone-950/90 border-stone-700/70 text-stone-400 hover:text-stone-200'
                  }`}
                  title="Toggle Harmonic Soundscape Audio"
                >
                  {audioEnabled ? '🔊 Audio' : '🔇 Mute'}
                </button>
              )}
            </div>

            {/* RIGHT WING: Equipped Right-Hand Carved Weapon, Ammo/DMG & Quick Drawers */}
            <div className="flex items-center gap-1.5">
              {equippedWeapon && (
                <div className="flex items-center gap-2 bg-black/55 border border-stone-800 px-2 py-0.5 rounded-sm">
                  <div className="text-right">
                    <div className="text-[10px] font-serif font-bold text-amber-100 truncate max-w-[145px]">
                      {isSheathed
                        ? grappledEnemyName
                          ? `Grappling: ${grappledEnemyName}`
                          : 'Bare Hands [Sheathed]'
                        : equippedWeapon.name}
                    </div>
                    <div className="text-[9px] font-mono text-stone-400 tabular-nums">
                      {isSheathed ? (
                        <span className="text-emerald-300">Parkour Mode</span>
                      ) : usesMag ? (
                        <span
                          className={
                            curAmmo === 0
                              ? 'text-rose-400 font-bold'
                              : 'text-amber-300'
                          }
                        >
                          {isReloading
                            ? `Reloading ${Math.round(
                                (weaponCombatState?.reloadProgress ?? 0) * 100
                              )}%`
                            : `${curAmmo}/${maxMag} Cells`}
                        </span>
                      ) : (
                        <span>
                          DMG {equippedWeapon.stats.damage} ·{' '}
                          {activeTool.split('-')[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {usesMag && !isSheathed && onReloadActiveWeapon && (
                      <button
                        onClick={onReloadActiveWeapon}
                        className="px-1.5 py-0.5 rounded-sm bg-stone-900 hover:bg-stone-800 border border-stone-700 text-[9px] font-mono text-amber-200 cursor-pointer"
                        title="Reload Weapon [R]"
                      >
                        [R]
                      </button>
                    )}
                    {onToggleSheathWeapon && (
                      <button
                        onClick={onToggleSheathWeapon}
                        className="px-1.5 py-0.5 rounded-sm bg-stone-900 hover:bg-stone-800 border border-stone-700 text-[9px] font-mono text-stone-200 cursor-pointer"
                        title="Sheath / Draw Weapon [H]"
                      >
                        [H]
                      </button>
                    )}
                    {onInspectActiveWeapon && (
                      <button
                        onClick={onInspectActiveWeapon}
                        className="px-1.5 py-0.5 rounded-sm bg-stone-900 hover:bg-stone-800 border border-stone-700 text-[9px] font-mono text-stone-200 cursor-pointer"
                        title="Inspect Carved Weapon Flourish [Y]"
                      >
                        [Y]
                      </button>
                    )}
                  </div>
                </div>
              )}

              {onOpenFullCompendium && (
                <button
                  onClick={onOpenFullCompendium}
                  className="px-2 py-1 rounded-sm bg-amber-600/30 hover:bg-amber-600/45 border border-amber-500/55 text-[10px] font-mono font-bold text-amber-100 cursor-pointer"
                  title="Open 325-Item Armory & Portal Room Museum [Tab]"
                >
                  Armory [Tab]
                </button>
              )}

              {onOpenTimelineModal && (
                <button
                  onClick={onOpenTimelineModal}
                  className="px-2 py-1 rounded-sm bg-stone-900 hover:bg-stone-800 border border-stone-700 text-[10px] font-mono text-amber-200 cursor-pointer"
                  title="Open Infinite Timelines, Gate Shapes, Vehicles & Body Mods [M]"
                >
                  Timelines [M]
                </button>
              )}

              {onTogglePerkTree && (
                <button
                  onClick={onTogglePerkTree}
                  className="px-2 py-1 rounded-sm bg-stone-900 hover:bg-stone-800 border border-stone-700 text-[10px] font-mono text-stone-200 cursor-pointer"
                  title="Open Dimensional Deviance Perks [P]"
                >
                  Perks [P]
                </button>
              )}

              {onOpenEquationCodex && (
                <button
                  onClick={onOpenEquationCodex}
                  className="px-2 py-1 rounded-sm bg-stone-900 hover:bg-stone-800 border border-stone-700 text-[10px] font-mono text-stone-300 cursor-pointer"
                  title="Open Autonomic Nonlinear Equation Codex"
                >
                  Codex
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          5. [SHIFT + V] 3D MINDSPACE PERSPECTIVE SINK & LIVE 3D MODEL QUALITY VERIFICATION
             Frames the Left & Right edges so the 3 Live 3D Figures in
             the Mindspace Chamber remain clearly visible in the center!
      ==================================================================== */}
      {config.isMindspaceOpen && (
        <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-4 sm:p-5">
          {/* Top Mindspace Header Banner with Close-Up Camera Focus Controls */}
          <div
            className={`pointer-events-auto mx-auto px-4 py-2 rounded-sm border ${theme.panelBgCss} ${theme.borderCss} flex flex-wrap items-center justify-between gap-3 max-w-5xl w-full`}
          >
            <div className="flex items-center gap-3">
              <span
                className="text-xl font-serif"
                style={{ color: theme.accentHex }}
              >
                {theme.glyphSymbol}
              </span>
              <div>
                <div
                  className={`text-xs sm:text-sm font-serif font-bold tracking-wider uppercase ${theme.textPrimaryCss}`}
                >
                  3D Mindspace Sanctuary · Live Visual Model Quality Inspector &
                  Relic HUD Studio
                </div>
                <div className={`text-[10px] font-mono ${theme.textMutedCss}`}>
                  Click any camera focus target below to zoom in and verify
                  carved relief textures, 5-finger hands & character models
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  onSetCameraMode?.('first-person');
                  onUpdateConfig((prev) => ({ ...prev, isMindspaceOpen: false }));
                }}
                className="px-2.5 py-1 rounded-sm bg-stone-900 hover:bg-stone-800 border border-amber-500/60 text-amber-200 font-mono text-[10px] font-bold cursor-pointer"
              >
                ▶ Play in 1st-Person Hands POV
              </button>
              <button
                onClick={() => {
                  onSetCameraMode?.('third-person');
                  onUpdateConfig((prev) => ({ ...prev, isMindspaceOpen: false }));
                }}
                className="px-2.5 py-1 rounded-sm bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-[10px] font-bold cursor-pointer"
              >
                ▶ Play in 3rd-Person Body POV [⇧V]
              </button>
            </div>
          </div>

          {/* Left & Right Mindspace Columns (Center stays open for the 3D Example Figures!) */}
          <div className="flex-1 my-3 flex flex-col lg:flex-row items-stretch justify-between gap-4 overflow-hidden">
            {/* LEFT PANEL: Relic HUD Theme & [V] Void Dial Control Scheme */}
            <div
              className={`pointer-events-auto w-full lg:w-[360px] rounded-xl border ${theme.panelBgCss} ${theme.borderCss} p-4 flex flex-col gap-3 overflow-y-auto`}
            >
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  I. Relic HUD Theme (Portal Room & World)
                </div>
                <div className="mt-1.5 space-y-1.5">
                  {(
                    Object.keys(RELIC_HUD_THEME_CATALOG) as RelicHudThemeId[]
                  ).map((tId) => {
                    const tSpec = RELIC_HUD_THEME_CATALOG[tId];
                    const isSel = config.hudTheme === tId;
                    return (
                      <button
                        key={tId}
                        onClick={() =>
                          onUpdateConfig((prev) => ({
                            ...prev,
                            hudTheme: tId,
                          }))
                        }
                        className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          isSel
                            ? 'bg-amber-600/25 border-amber-400 text-amber-50'
                            : 'bg-stone-950/80 border-stone-800 text-stone-300 hover:border-stone-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-serif font-bold">
                            {tSpec.glyphSymbol} {tSpec.name}
                          </span>
                          {isSel && (
                            <span className="text-[9px] font-mono text-amber-300 font-bold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5 leading-snug">
                          {tSpec.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800">
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  II. [V] Void Ball Dial Control Mode
                </div>
                <div className="mt-1.5 space-y-1.5">
                  {(
                    Object.keys(
                      VOID_DIAL_CONTROL_SCHEMES
                    ) as VoidDialControlSchemeId[]
                  ).map((sId) => {
                    const sSpec = VOID_DIAL_CONTROL_SCHEMES[sId];
                    const isSel = config.dialControlScheme === sId;
                    return (
                      <button
                        key={sId}
                        onClick={() =>
                          onUpdateConfig((prev) => ({
                            ...prev,
                            dialControlScheme: sId,
                          }))
                        }
                        className={`w-full p-2 rounded-lg border text-left transition-all cursor-pointer ${
                          isSel
                            ? 'bg-amber-600/25 border-amber-400 text-amber-50'
                            : 'bg-stone-950/80 border-stone-800 text-stone-300 hover:border-stone-600'
                        }`}
                      >
                        <div className="text-xs font-mono font-bold">
                          {sSpec.name}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5 leading-snug">
                          {sSpec.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs font-mono">
                <span className="text-stone-300">
                  Hide Top Banner in Portal Room
                </span>
                <button
                  onClick={() =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      hidePortalRoomBanners: !prev.hidePortalRoomBanners,
                    }))
                  }
                  className={`px-2.5 py-1 rounded border cursor-pointer ${
                    config.hidePortalRoomBanners
                      ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                      : 'bg-stone-900 text-stone-400 border-stone-700'
                  }`}
                >
                  {config.hidePortalRoomBanners ? 'Hidden' : 'Visible'}
                </button>
              </div>
            </div>

            {/* RIGHT PANEL: Realistic Human Anatomy, Gloves & Special Transformation Modes */}
            <div
              className={`pointer-events-auto w-full lg:w-[380px] rounded-xl border ${theme.panelBgCss} ${theme.borderCss} p-4 flex flex-col gap-3 overflow-y-auto`}
            >
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  III. Default Human Skin & Articulated Fingers
                </div>
                <div className="mt-1.5 grid grid-cols-5 gap-1.5">
                  {HUMAN_SKIN_TONE_PRESETS.map((tone) => {
                    const isSel = config.humanSkinToneId === tone.id;
                    return (
                      <button
                        key={tone.id}
                        onClick={() =>
                          onUpdateConfig((prev) => ({
                            ...prev,
                            humanSkinToneId: tone.id,
                          }))
                        }
                        className={`p-1.5 rounded-lg border text-center cursor-pointer transition-all ${
                          isSel
                            ? 'border-amber-400 ring-1 ring-amber-400 bg-stone-900'
                            : 'border-stone-800 bg-stone-950/80'
                        }`}
                        title={tone.label}
                      >
                        <div
                          className="w-6 h-6 rounded-full mx-auto border border-white/20"
                          style={{ backgroundColor: tone.skinHex }}
                        />
                        <div className="text-[8px] font-mono text-stone-300 mt-1 truncate">
                          {tone.label.split(' ')[1] ?? tone.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  IV. Forearm Bracers & Hand Styling
                </div>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                  {GLOVE_STYLE_OPTIONS.map((gOpt) => {
                    const isSel = config.humanGloveStyle === gOpt.id;
                    return (
                      <button
                        key={gOpt.id}
                        onClick={() =>
                          onUpdateConfig((prev) => ({
                            ...prev,
                            humanGloveStyle: gOpt.id,
                          }))
                        }
                        className={`p-2 rounded-lg border text-left cursor-pointer ${
                          isSel
                            ? 'bg-amber-600/25 border-amber-400 text-amber-50 font-bold'
                            : 'bg-stone-950/80 border-stone-800 text-stone-300'
                        }`}
                      >
                        <div className="text-[10px] font-mono truncate">
                          {gOpt.label}
                        </div>
                        <div className="text-[8px] text-stone-400 mt-0.5 line-clamp-2">
                          {gOpt.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    V. Character Form & Special Morphs
                  </span>
                  <button
                    onClick={() =>
                      onUpdateConfig((prev) => ({
                        ...prev,
                        autoMetamorphosisOnFullResonance:
                          !prev.autoMetamorphosisOnFullResonance,
                      }))
                    }
                    className="text-[9px] font-mono text-amber-300 hover:underline cursor-pointer"
                  >
                    Auto-Morph @ 100%: {config.autoMetamorphosisOnFullResonance ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="mt-1.5 space-y-1.5">
                  {(
                    Object.keys(
                      PLAYER_MORPH_MODE_CATALOG
                    ) as PlayerMorphModeId[]
                  ).map((mId) => {
                    const mSpec = PLAYER_MORPH_MODE_CATALOG[mId];
                    const isSel = config.activeMorphMode === mId;
                    return (
                      <button
                        key={mId}
                        onClick={() =>
                          onUpdateConfig((prev) => ({
                            ...prev,
                            activeMorphMode: mId,
                          }))
                        }
                        className={`w-full p-2 rounded-lg border text-left transition-all cursor-pointer ${
                          isSel
                            ? 'bg-amber-600/25 border-amber-400 text-amber-50'
                            : 'bg-stone-950/80 border-stone-800 text-stone-300 hover:border-stone-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-xs font-bold"
                            style={{ color: mSpec.accentHex }}
                          >
                            {mSpec.name}
                          </span>
                          <span className="text-[9px] font-mono text-stone-400">
                            {(mSpec.speedBonus * 100).toFixed(0)}% SPD ·{' '}
                            {(mSpec.jumpBonus * 100).toFixed(0)}% JMP
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5 leading-snug">
                          {mSpec.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom-Center 3D Visual Model Quality Verification Camera Focus & Turntable Bar */}
          <div
            className={`pointer-events-auto mx-auto px-4 py-2 rounded-sm border ${theme.panelBgCss} ${theme.borderCss} flex flex-wrap items-center justify-between gap-3 max-w-4xl w-full`}
          >
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold mr-1">
                3D Model Zoom:
              </span>
              {(
                [
                  {
                    id: 'overview-all',
                    label: 'All 3 Plinths',
                  },
                  {
                    id: 'human-anatomy',
                    label: '1. Human Face & Hands',
                  },
                  {
                    id: 'special-morph',
                    label: '2. Special Morph Form',
                  },
                  {
                    id: 'hands-and-weapon',
                    label: '3. Void Pull & Carved Blade',
                  },
                ] as { id: MindspaceFocusTargetId; label: string }[]
              ).map((foc) => {
                const isAct =
                  (config.mindspaceFocusTarget ?? 'overview-all') === foc.id;
                return (
                  <button
                    key={foc.id}
                    onClick={() =>
                      onUpdateConfig((prev) => ({
                        ...prev,
                        mindspaceFocusTarget: foc.id,
                      }))
                    }
                    className={`px-2.5 py-1 rounded-sm text-[10px] font-mono border cursor-pointer transition-all ${
                      isAct
                        ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                        : 'bg-stone-950/90 text-stone-300 border-stone-700 hover:border-amber-500/50'
                    }`}
                  >
                    {foc.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-stone-300">
                360° Turntable:
              </span>
              <input
                type="range"
                min={-3.14}
                max={3.14}
                step={0.05}
                value={config.mindspaceTurntableOffset ?? 0}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateConfig((prev) => ({
                    ...prev,
                    mindspaceTurntableOffset: val,
                  }));
                }}
                className="w-28 accent-amber-500 h-1 bg-stone-800 rounded cursor-pointer"
              />
              <button
                onClick={() =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    mindspaceTurntableOffset: 0,
                  }))
                }
                className="px-2 py-0.5 rounded-sm bg-stone-900 border border-stone-700 text-[9px] font-mono text-stone-300 hover:text-white cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
