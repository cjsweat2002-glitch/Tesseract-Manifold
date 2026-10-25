import React, { useMemo, useState } from 'react';
import {
  BETHESDA_SCALE_COMPENDIUM_CATALOG,
  CATEGORY_LABELS,
  CompendiumItemCategory,
  CompendiumLoadoutAndMuseumState,
  DimensionalItemDefinition,
  RARITY_COLORS,
  resolveCompendiumItemById,
} from '../utils/bethesdaScaleCompendiumEngine';
import {
  ActiveWeaponCombatState,
  FocusedGroundingObjectTelemetry,
  isMagazineFedRangedWeapon,
} from '../utils/compositeModelAndGroundingEngine';
import {
  ALL_DIFFERENTIAL_BOUNDARY_IDS,
  DIFFERENTIAL_UNIVERSE_BOUNDARIES,
  DifferentialUniverseBoundaryId,
  MULTIVERSAL_MATTER_CATALOG,
  MultiversalMatterId,
} from '../types/portalAndBiodepth';
import { BiodepthInteractiveCanvasBackground } from './BiodepthMenuArt';

interface DimensionalGroundingAndLoadoutHUDProps {
  compendiumState: CompendiumLoadoutAndMuseumState;
  focusedGroundingAnchor: FocusedGroundingObjectTelemetry | null;
  onEquipRightHandItem: (itemId: string) => void;
  onInspectActiveWeapon: () => void;
  onReloadActiveWeapon?: () => void;
  onToggleSheathWeapon?: () => void;
  weaponCombatState?: ActiveWeaponCombatState;
  grappledEnemyName?: string | null;
  onAttuneFocusedGroundingAnchor: () => void;
  onOpenCompendiumModal: () => void;
  hudOpacity?: number;
  isAnyModalOpen?: boolean;
}

export const DimensionalGroundingAndLoadoutHUD: React.FC<
  DimensionalGroundingAndLoadoutHUDProps
> = ({
  compendiumState,
  focusedGroundingAnchor,
  onEquipRightHandItem,
  onInspectActiveWeapon,
  onReloadActiveWeapon,
  onToggleSheathWeapon,
  weaponCombatState,
  grappledEnemyName,
  onAttuneFocusedGroundingAnchor,
  onOpenCompendiumModal,
  hudOpacity = 0.94,
  isAnyModalOpen = false,
}) => {
  if (isAnyModalOpen) return null;

  const activeWeapon = resolveCompendiumItemById(
    compendiumState.equippedRightHandId,
    compendiumState
  );
  const mountedCount = Object.keys(compendiumState.mountedMuseumPlinths).length;
  const usesMag = isMagazineFedRangedWeapon(activeWeapon);
  const isSheathed = weaponCombatState?.isSheathed ?? false;
  const isReloading = weaponCombatState?.isReloading ?? false;
  const curAmmo = weaponCombatState?.currentAmmo ?? 8;
  const maxMag = weaponCombatState?.maxMagazine ?? 8;

  return (
    <>
      {/* 1. Contextual Diegetic Reticle Prompt when near a Signature Dimensional Grounding World Object */}
      {focusedGroundingAnchor && (
        <div
          style={{ opacity: hudOpacity }}
          className="pointer-events-auto absolute top-[57%] left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4"
        >
          <div className="bg-[#080B11]/92 border border-amber-400/50 rounded-xl px-4 py-3 shadow-2xl">
            <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-amber-300">
              <span className="uppercase tracking-wider font-semibold">
                {focusedGroundingAnchor.categoryLabel} ·{' '}
                {focusedGroundingAnchor.originBoundaryName}
              </span>
              <span className="text-slate-400 tabular-nums">
                {focusedGroundingAnchor.distanceMeters}m
              </span>
            </div>
            <div className="mt-0.5 text-sm font-bold text-white">
              {focusedGroundingAnchor.name}
            </div>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              {focusedGroundingAnchor.loreSummary}
            </p>
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <div className="text-[11px] font-mono text-cyan-300 truncate">
                Yields: <span className="text-white font-semibold">{focusedGroundingAnchor.rewardItemName}</span> ({focusedGroundingAnchor.rewardItemRarity})
              </div>
              <button
                onClick={onAttuneFocusedGroundingAnchor}
                disabled={focusedGroundingAnchor.cooldownSec > 0}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer shrink-0 ${
                  focusedGroundingAnchor.cooldownSec > 0
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                }`}
              >
                {focusedGroundingAnchor.cooldownSec > 0
                  ? `Recharging (${focusedGroundingAnchor.cooldownSec}s)`
                  : `[E] ${focusedGroundingAnchor.interactionVerb.split('&')[0].trim()}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Right-Hand Weapon & Stance controls are now unified inside VoidBallDialAndMindspaceHUD's single Bottom Command Dock */}
    </>
  );
};

interface BethesdaCompendiumAndLoadoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  compendiumState: CompendiumLoadoutAndMuseumState;
  matterInventory: Record<MultiversalMatterId, number>;
  onEquipRightHandItem: (itemId: string) => void;
  onEquipApparelItem: (itemId: string) => void;
  onAssignQuickbarSlot: (slotIndex: number, itemId: string) => void;
  onToggleMountOnMuseumPlinth: (itemId: string, preferredSlot?: number) => void;
  onCraftOrSynthesizeItem: (item: DimensionalItemDefinition) => void;
  onBoundaryForgeAffixedVariant: (baseItem: DimensionalItemDefinition) => void;
  onUnlockAllCompendiumItems: () => void;
  onEnterOrExitPortalRoomNow?: () => void;
  isPlayerInsidePortalRoom?: boolean;
}

export const BethesdaCompendiumAndLoadoutModal: React.FC<
  BethesdaCompendiumAndLoadoutModalProps
> = ({
  isOpen,
  onClose,
  compendiumState,
  matterInventory,
  onEquipRightHandItem,
  onEquipApparelItem,
  onAssignQuickbarSlot,
  onToggleMountOnMuseumPlinth,
  onCraftOrSynthesizeItem,
  onBoundaryForgeAffixedVariant,
  onUnlockAllCompendiumItems,
  onEnterOrExitPortalRoomNow,
  isPlayerInsidePortalRoom = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | CompendiumItemCategory
  >('all');
  const [selectedBoundary, setSelectedBoundary] = useState<
    'all' | DifferentialUniverseBoundaryId
  >('all');
  const [filterMode, setFilterMode] = useState<
    'all' | 'discovered' | 'mounted'
  >('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>(
    compendiumState.equippedRightHandId
  );

  const allItems = useMemo(() => {
    return [
      ...compendiumState.customForgedItems,
      ...BETHESDA_SCALE_COMPENDIUM_CATALOG,
    ];
  }, [compendiumState.customForgedItems]);

  const discoveredSet = useMemo(
    () => new Set(compendiumState.discoveredItemIds),
    [compendiumState.discoveredItemIds]
  );

  const mountedSlotByItemId = useMemo(() => {
    const map: Record<string, number> = {};
    Object.entries(compendiumState.mountedMuseumPlinths).forEach(
      ([slotStr, id]) => {
        map[id] = Number(slotStr);
      }
    );
    return map;
  }, [compendiumState.mountedMuseumPlinths]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allItems.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (
        selectedBoundary !== 'all' &&
        item.originBoundary !== selectedBoundary
      ) {
        return false;
      }
      if (filterMode === 'discovered' && !discoveredSet.has(item.id)) {
        return false;
      }
      if (
        filterMode === 'mounted' &&
        mountedSlotByItemId[item.id] === undefined
      ) {
        return false;
      }
      if (
        q &&
        !item.name.toLowerCase().includes(q) &&
        !item.subTypeLabel.toLowerCase().includes(q) &&
        !item.loreProvenance.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [
    allItems,
    selectedCategory,
    selectedBoundary,
    filterMode,
    searchQuery,
    discoveredSet,
    mountedSlotByItemId,
  ]);

  if (!isOpen) return null;

  const selectedItem =
    allItems.find((i) => i.id === selectedItemId) ??
    filteredItems[0] ??
    allItems[0];

  const isSelectedDiscovered = discoveredSet.has(selectedItem.id);
  const mountedSlot = mountedSlotByItemId[selectedItem.id];
  const equippedRightHand = resolveCompendiumItemById(
    compendiumState.equippedRightHandId,
    compendiumState
  );
  const equippedApparel = resolveCompendiumItemById(
    compendiumState.equippedApparelId,
    compendiumState
  );

  const primaryMatterSpec =
    MULTIVERSAL_MATTER_CATALOG[selectedItem.craftCost.primaryMatter];
  const havePrimary =
    matterInventory[selectedItem.craftCost.primaryMatter] ?? 0;
  const canAffordCraft = havePrimary >= selectedItem.craftCost.primaryCount;

  return (
    <div
      onClick={onClose}
      className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/82 backdrop-blur-md p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl h-[86vh] bg-[#06080E] border border-amber-500/35 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        <BiodepthInteractiveCanvasBackground
          boundaryId={
            selectedBoundary === 'all'
              ? 'hadal-biodepth-abyss'
              : selectedBoundary
          }
          intensity={0.85}
        />
        {/* Top Archival Header */}
        <div className="relative z-10 px-6 py-3.5 bg-[#080B11]/90 backdrop-blur-md border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold tracking-wide text-white">
                Dimensional Compendium, Armory & Portal Room Museum
              </h2>
              <span className="px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-xs font-mono text-amber-300 tabular-nums">
                {compendiumState.discoveredItemIds.length} /{' '}
                {BETHESDA_SCALE_COMPENDIUM_CATALOG.length} Discovered
              </span>
              <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 text-xs font-mono text-cyan-300 tabular-nums">
                {Object.keys(compendiumState.mountedMuseumPlinths).length} / 24
                Museum Plinths Mounted
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Equip multi-part 3D weapons & excavation tools, synthesize
              Boundary-Forged variants, or mount relics onto physical 3D
              pedestals inside the 36m × 36m Portal Room.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onEnterOrExitPortalRoomNow && (
              <button
                onClick={() => {
                  onEnterOrExitPortalRoomNow();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-xs font-mono font-semibold text-cyan-200 cursor-pointer"
              >
                {isPlayerInsidePortalRoom
                  ? 'Step Out of Portal Room'
                  : 'Visit 3D Museum in Portal Room'}
              </button>
            )}
            <button
              onClick={onUnlockAllCompendiumItems}
              className="px-3 py-1.5 rounded-lg bg-white/8 hover:bg-white/15 border border-white/15 text-xs font-mono text-amber-300 cursor-pointer"
              title="Unlock all 325 items in the Compendium for instant testing & museum curation"
            >
              Unlock All 325 Items
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-mono text-white cursor-pointer"
            >
              Close [Esc]
            </button>
          </div>
        </div>

        {/* Active Loadout Strip */}
        <div className="relative z-10 px-6 py-2.5 bg-[#080B11]/88 backdrop-blur-md border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-slate-400 font-mono">Right-Hand 3D Rig: </span>
              <span className="text-amber-300 font-semibold">
                {equippedRightHand.name}
              </span>
              <span className="text-slate-500 font-mono ml-1.5">
                (DMG {equippedRightHand.stats.damage} · EXCAV{' '}
                {equippedRightHand.stats.excavationPower}x)
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-mono">Apparel Carapace: </span>
              <span className="text-cyan-300 font-semibold">
                {equippedApparel.name}
              </span>
              <span className="text-slate-500 font-mono ml-1.5">
                (+{equippedApparel.stats.stabilityBonus} Stability)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 325+ weapons, relics, tools, lore..."
              className="w-64 px-3 py-1 rounded-lg bg-[#111622] border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Category & Dimension Filter Tabs */}
        <div className="relative z-10 px-6 py-2.5 bg-[#0c101a]/88 backdrop-blur-md border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              All ({allItems.length})
            </button>
            {(Object.keys(CATEGORY_LABELS) as CompendiumItemCategory[]).map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={selectedBoundary}
              onChange={(e) =>
                setSelectedBoundary(
                  e.target.value as 'all' | DifferentialUniverseBoundaryId
                )
              }
              className="px-2.5 py-1 rounded-lg bg-[#080B11] border border-white/15 text-xs font-mono text-slate-200"
            >
              <option value="all">All 5 Dimensional Origins</option>
              {ALL_DIFFERENTIAL_BOUNDARY_IDS.map((bId) => (
                <option key={bId} value={bId}>
                  {DIFFERENTIAL_UNIVERSE_BOUNDARIES[bId].name}
                </option>
              ))}
            </select>

            <div className="flex items-center bg-[#080B11] rounded-lg p-0.5 border border-white/10 text-xs font-mono">
              {(
                [
                  ['all', 'Full Catalog'],
                  ['discovered', 'Owned'],
                  ['mounted', 'In Museum'],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    filterMode === mode
                      ? 'bg-cyan-500/25 text-cyan-200 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Split Body: Left Scrollable Compendium List + Right Item Inspector & Museum Controls */}
        <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden bg-[#06080E]/75 backdrop-blur-sm">
          {/* Left 7 Columns: Catalog Grid */}
          <div className="lg:col-span-7 border-r border-white/10 overflow-y-auto p-4 space-y-1.5">
            {filteredItems.map((item) => {
              const rStyle = RARITY_COLORS[item.rarity];
              const isDiscovered = discoveredSet.has(item.id);
              const isEquipped =
                compendiumState.equippedRightHandId === item.id ||
                compendiumState.equippedApparelId === item.id;
              const mountedPlinth = mountedSlotByItemId[item.id];
              const isSelected = selectedItem.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#172033] border-amber-400/70 shadow-md'
                      : 'bg-[#111622]/80 hover:bg-[#151c2c] border-white/8'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                        #{String(item.catalogNumber).padStart(3, '0')}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${rStyle.bg} ${rStyle.border} ${rStyle.text}`}
                      >
                        {item.rarity}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 truncate">
                        {item.subTypeLabel}
                      </span>
                      {isEquipped && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-mono font-bold">
                          EQUIPPED
                        </span>
                      )}
                      {mountedPlinth !== undefined && (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/25 border border-cyan-400/50 text-cyan-200 text-[10px] font-mono">
                          PLINTH #{mountedPlinth + 1}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white truncate">
                      {item.name}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-400 truncate">
                      Origin:{' '}
                      {DIFFERENTIAL_UNIVERSE_BOUNDARIES[item.originBoundary]?.name}
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs shrink-0 space-y-0.5">
                    <div className="text-amber-300 tabular-nums">
                      DMG {item.stats.damage} · EXCAV{' '}
                      {item.stats.excavationPower}x
                    </div>
                    <div
                      className={`text-[10px] ${
                        isDiscovered ? 'text-emerald-300' : 'text-slate-500'
                      }`}
                    >
                      {isDiscovered
                        ? `Owned (${compendiumState.ownedQuantities[item.id] ?? 1})`
                        : 'Undiscovered Schematic'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right 5 Columns: Selected Item Provenance, 3D Visual Spec, Loadout & Museum Controls */}
          <div className="lg:col-span-5 p-6 overflow-y-auto bg-[#0b0f18] flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-slate-400 tabular-nums">
                  Catalog Entry #{String(selectedItem.catalogNumber).padStart(3, '0')}
                </span>
                <span
                  className={`text-xs font-mono px-2.5 py-0.5 rounded border ${
                    RARITY_COLORS[selectedItem.rarity].bg
                  } ${RARITY_COLORS[selectedItem.rarity].border} ${
                    RARITY_COLORS[selectedItem.rarity].text
                  }`}
                >
                  {selectedItem.rarity}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white leading-snug">
                  {selectedItem.name}
                </h3>
                <div className="text-xs font-mono text-cyan-300 mt-1">
                  {CATEGORY_LABELS[selectedItem.category]} ·{' '}
                  {selectedItem.subTypeLabel} ·{' '}
                  {
                    DIFFERENTIAL_UNIVERSE_BOUNDARIES[selectedItem.originBoundary]
                      ?.name
                  }
                </div>
              </div>

              {/* Lore & Dimensional Grounding Provenance */}
              <div className="p-3.5 rounded-xl bg-[#111622] border border-white/10 space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-300">
                  Dimensional Provenance & Grounding
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {selectedItem.loreProvenance}
                </p>
                <div className="pt-2 border-t border-white/10 text-xs font-mono text-emerald-300">
                  Anchor Role: {selectedItem.groundingConnection}
                </div>
              </div>

              {/* Tabular Telemetry Grid */}
              <div className="grid grid-cols-3 gap-2 font-mono">
                <div className="p-2.5 rounded-lg bg-[#111622] border border-white/8">
                  <div className="text-[10px] text-slate-400">Strike Damage</div>
                  <div className="text-base font-bold text-white tabular-nums">
                    {selectedItem.stats.damage}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111622] border border-white/8">
                  <div className="text-[10px] text-slate-400">
                    Excavation Yield
                  </div>
                  <div className="text-base font-bold text-cyan-300 tabular-nums">
                    {selectedItem.stats.excavationPower}x
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111622] border border-white/8">
                  <div className="text-[10px] text-slate-400">Cadence / Reach</div>
                  <div className="text-base font-bold text-amber-300 tabular-nums">
                    {selectedItem.stats.swingSpeedHz}Hz ·{' '}
                    {selectedItem.stats.reachMeters}m
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111622] border border-white/8">
                  <div className="text-[10px] text-slate-400">
                    Metric Stability
                  </div>
                  <div className="text-sm font-bold text-emerald-300 tabular-nums">
                    +{selectedItem.stats.stabilityBonus}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111622] border border-white/8">
                  <div className="text-[10px] text-slate-400">Physical Mass</div>
                  <div className="text-sm font-bold text-slate-200 tabular-nums">
                    {selectedItem.stats.massKg} kg
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111622] border border-white/8">
                  <div className="text-[10px] text-slate-400">3D Rig Class</div>
                  <div className="text-xs font-bold text-purple-300 truncate">
                    {selectedItem.visualSpec.weaponSubType}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Equip / Hotbar / Portal Room Museum / Boundary-Forge */}
              <div className="space-y-2.5 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  {(selectedItem.category === 'weapon' ||
                    selectedItem.category === 'tool' ||
                    selectedItem.category === 'relic') && (
                    <button
                      onClick={() => onEquipRightHandItem(selectedItem.id)}
                      className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono text-xs font-bold cursor-pointer"
                    >
                      Equip in Right Hand (3D Rig)
                    </button>
                  )}
                  {selectedItem.category === 'apparel' && (
                    <button
                      onClick={() => onEquipApparelItem(selectedItem.id)}
                      className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold cursor-pointer"
                    >
                      Equip Apparel Carapace
                    </button>
                  )}
                  <button
                    onClick={() =>
                      onToggleMountOnMuseumPlinth(selectedItem.id)
                    }
                    className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold border cursor-pointer ${
                      mountedSlot !== undefined
                        ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                        : 'bg-[#111622] hover:bg-white/10 border-white/20 text-white'
                    }`}
                  >
                    {mountedSlot !== undefined
                      ? `Unmount from Plinth #${mountedSlot + 1}`
                      : 'Mount in Portal Room Museum'}
                  </button>
                </div>

                {/* Assign to Hotbar Slots F1-F5 */}
                <div className="p-2.5 rounded-xl bg-[#111622] border border-white/10 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-slate-400">
                    Assign to Quickbar:
                  </span>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map((slotIdx) => (
                      <button
                        key={slotIdx}
                        onClick={() =>
                          onAssignQuickbarSlot(slotIdx, selectedItem.id)
                        }
                        className="px-2.5 py-1 rounded bg-white/8 hover:bg-amber-400 hover:text-slate-950 text-xs font-mono text-slate-200 cursor-pointer"
                      >
                        F{slotIdx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Crucible Synthesis & Procedural Boundary-Forge Affix Crafting */}
                <div className="p-3.5 rounded-xl bg-[#111622] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">
                      Crucible Matter Cost:
                    </span>
                    <span
                      className={
                        canAffordCraft ? 'text-emerald-300' : 'text-rose-300'
                      }
                    >
                      {selectedItem.craftCost.primaryCount}{' '}
                      {primaryMatterSpec?.shortName} (Have {havePrimary})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onCraftOrSynthesizeItem(selectedItem)}
                      className="px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 text-xs font-mono font-semibold cursor-pointer"
                    >
                      {isSelectedDiscovered
                        ? 'Synthesize Duplicate'
                        : 'Synthesize & Unlock'}
                    </button>
                    <button
                      onClick={() => onBoundaryForgeAffixedVariant(selectedItem)}
                      className="px-3 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 text-purple-200 text-xs font-mono font-semibold cursor-pointer"
                    >
                      Boundary-Forge Affix Variant
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
