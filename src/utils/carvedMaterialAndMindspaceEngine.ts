import * as THREE from 'three';
import { BaseDimensionalElementId } from './multiversalEmergenceAndCultureEngine';
import { DimensionalItemDefinition } from './bethesdaScaleCompendiumEngine';
import { PlayerInteractionTool } from '../types/manifold';

// ============================================================================
// 1. CUSTOM RELIC HUD THEMES, [V] DIAL MODES & HUMAN / MORPH TYPES
// ============================================================================

export type RelicHudThemeId =
  | 'carved-obsidian-runes'
  | 'biomech-chitin-bone'
  | 'ancient-brass-astrolabe'
  | 'minimal-diegetic-projection';

export interface RelicHudThemeSpec {
  id: RelicHudThemeId;
  name: string;
  subtitle: string;
  description: string;
  panelBgCss: string;
  borderCss: string;
  accentHex: string;
  secondaryHex: string;
  textPrimaryCss: string;
  textMutedCss: string;
  glyphSymbol: string;
  cornerOrnament: string;
}

export const RELIC_HUD_THEME_CATALOG: Record<
  RelicHudThemeId,
  RelicHudThemeSpec
> = {
  'carved-obsidian-runes': {
    id: 'carved-obsidian-runes',
    name: 'Carved Obsidian & Runes',
    subtitle: 'Chiselled Basalt Slabs & Molten Amber Inlays',
    description:
      'Replaces modern tech panels with weathered volcanic basalt tablets, bevelled iron corners, and warm hearth-amber runic inscriptions.',
    panelBgCss:
      'bg-[#0b0a09]/92 shadow-[inset_0_1px_0_rgba(245,158,11,0.22),0_10px_28px_rgba(0,0,0,0.88)]',
    borderCss: 'border-amber-700/50',
    accentHex: '#f59e0b',
    secondaryHex: '#78350f',
    textPrimaryCss: 'text-amber-100',
    textMutedCss: 'text-stone-400',
    glyphSymbol: 'ᛟ',
    cornerOrnament: '◆',
  },
  'biomech-chitin-bone': {
    id: 'biomech-chitin-bone',
    name: 'Biomechanical Chitin & Bone',
    subtitle: 'Fluted Ossuary Ivory & Arterial Tendon Trim',
    description:
      'Sculpted bone-ivory reliquary frames bound with dark chitinous ribs and deep crimson synovial luminescence.',
    panelBgCss:
      'bg-[#110b0d]/92 shadow-[inset_0_1px_0_rgba(244,63,94,0.25),0_10px_28px_rgba(0,0,0,0.9)]',
    borderCss: 'border-rose-800/55',
    accentHex: '#f43f5e',
    secondaryHex: '#881337',
    textPrimaryCss: 'text-stone-100',
    textMutedCss: 'text-rose-200/60',
    glyphSymbol: 'Ψ',
    cornerOrnament: '❖',
  },
  'ancient-brass-astrolabe': {
    id: 'ancient-brass-astrolabe',
    name: 'Ancient Brass Astrolabe',
    subtitle: 'Engraved Celestial Brass & Verdigris Slate',
    description:
      'Precision-etched astronomical brass rings, oxidized copper patina, and classical celestial dial calibrations.',
    panelBgCss:
      'bg-[#081012]/92 shadow-[inset_0_1px_0_rgba(234,179,8,0.28),0_10px_28px_rgba(0,0,0,0.88)]',
    borderCss: 'border-yellow-600/50',
    accentHex: '#eab308',
    secondaryHex: '#0d9488',
    textPrimaryCss: 'text-amber-50',
    textMutedCss: 'text-teal-200/65',
    glyphSymbol: '☉',
    cornerOrnament: '✧',
  },
  'minimal-diegetic-projection': {
    id: 'minimal-diegetic-projection',
    name: 'Minimal Diegetic Whisper',
    subtitle: 'Zero-Frame In-World Reticle & Micro-Glyphs',
    description:
      'Strips away all outer frames so 97% of the 3D viewport and Portal Room remain completely unobstructed until the Void Ball is opened.',
    panelBgCss: 'bg-black/55 backdrop-blur-sm',
    borderCss: 'border-stone-700/35',
    accentHex: '#e2e8f0',
    secondaryHex: '#64748b',
    textPrimaryCss: 'text-stone-200',
    textMutedCss: 'text-stone-400',
    glyphSymbol: '◇',
    cornerOrnament: '·',
  },
};

export type VoidDialControlSchemeId =
  | 'toggle-dial-quickkeys'
  | 'hold-dial-tap-portal'
  | 'wheel-dial-click-confirm';

export interface VoidDialControlSchemeSpec {
  id: VoidDialControlSchemeId;
  name: string;
  shortLabel: string;
  description: string;
}

export const VOID_DIAL_CONTROL_SCHEMES: Record<
  VoidDialControlSchemeId,
  VoidDialControlSchemeSpec
> = {
  'toggle-dial-quickkeys': {
    id: 'toggle-dial-quickkeys',
    name: 'Toggle Dial + 1–4 Dynamic Quick Keys',
    shortLabel: 'Toggle [V] + Quick Keys',
    description:
      'Tap [V] to bloom the Void Ball Menu Dial in your left palm. Keys [1]–[4] dynamically transform to trigger the active sector or portal/substrate actions.',
  },
  'hold-dial-tap-portal': {
    id: 'hold-dial-tap-portal',
    name: 'Hold [V] for Dial / Tap [V] for Active Portal',
    shortLabel: 'Hold [V] Dial / Tap Portal',
    description:
      'Quick-tap [V] to immediately tear open or close your active Portal. Hold [V] (>220ms) to open the radial Void Ball Menu Dial.',
  },
  'wheel-dial-click-confirm': {
    id: 'wheel-dial-click-confirm',
    name: 'Scroll-Wheel Dial + Click to Pull',
    shortLabel: 'Wheel Rotate + Click Pull',
    description:
      'Open the Void Ball with [V], rotate through sectors and weapons using the Mouse Scroll Wheel or [←/→], and Left-Click to pull the item from the Void Ball.',
  },
};

export type VoidDialSectorId =
  | 'weapons-and-tools'
  | 'portals-and-mazes'
  | 'substrate-synthesis'
  | 'character-morphs';

export type PlayerMorphModeId =
  | 'human-default'
  | 'ophanim-seraph'
  | 'escher-pyramid-eye'
  | 'vascular-flame-crown'
  | 'hadal-cephalopod'
  | 'tesseractic-hypercage';

export interface PlayerMorphModeSpec {
  id: PlayerMorphModeId;
  name: string;
  subtitle: string;
  description: string;
  speedBonus: number;
  jumpBonus: number;
  specialAbilityLabel: string;
  accentHex: string;
  isDefaultHuman?: boolean;
}

export const PLAYER_MORPH_MODE_CATALOG: Record<
  PlayerMorphModeId,
  PlayerMorphModeSpec
> = {
  'human-default': {
    id: 'human-default',
    name: 'Human Explorer (Default)',
    subtitle: 'Anatomical Human Arms, 5-Finger Phalanges & Carved Bracers',
    description:
      'Natural human body and realistic articulated hands with tendons, knuckles, and fingernails. Can channel the Void Ball and shift into unlocked non-human forms at will.',
    speedBonus: 1.0,
    jumpBonus: 1.0,
    specialAbilityLabel: 'Adaptive Tool Mastery & Clean Sightline',
    accentHex: '#d97706',
    isDefaultHuman: true,
  },
  'ophanim-seraph': {
    id: 'ophanim-seraph',
    name: '4-Winged Ophanim Seraph',
    subtitle: 'Catmull-Rom Golden Wing Spars & 12 All-Seeing Eyes',
    description:
      'Unfurls four cambered obsidian-and-gold feather wings with polychromatic Ophanim eyes and a rotating Metatron astrolabe halo.',
    speedBonus: 1.18,
    jumpBonus: 1.32,
    specialAbilityLabel: 'Seraphic Thermal Updraft & Halo Resonance',
    accentHex: '#eab308',
  },
  'escher-pyramid-eye': {
    id: 'escher-pyramid-eye',
    name: 'Escher Jade Pyramid-Eye',
    subtitle: 'Non-Euclidean Emerald Monolith & All-Seeing Oculus',
    description:
      'Morphs the cranium into an inverted jade pyramid housing an unblinking cyan dimensional oculus that decodes labyrinth anomalies.',
    speedBonus: 1.12,
    jumpBonus: 1.15,
    specialAbilityLabel: 'Labyrinth Noclip Sight & Anomaly Gaze',
    accentHex: '#10b981',
  },
  'vascular-flame-crown': {
    id: 'vascular-flame-crown',
    name: 'Vascular Dendritic Flame-Crown',
    subtitle: 'Bifurcating Arterial Antlers & Orbiting Porcelain Mask',
    description:
      'Erupts a burning white-amber furnace core and tencrimson arterial branches while a classical porcelain mask orbits your shoulder.',
    speedBonus: 1.24,
    jumpBonus: 1.18,
    specialAbilityLabel: 'Pyro-Arterial Cleave & Somatic Overdrive',
    accentHex: '#f97316',
  },
  'hadal-cephalopod': {
    id: 'hadal-cephalopod',
    name: 'Hadal Bioluminescent Diver',
    subtitle: 'Abyssal Luciferin Gill-Fronds & Hydro-Chitin Carapace',
    description:
      'Adapts forearms and thorax with abyssal bioluminescent gill slits and high-pressure chitinous plates.',
    speedBonus: 1.15,
    jumpBonus: 1.25,
    specialAbilityLabel: 'Hydro-Viscous Slipstream & Abyssal Pulse',
    accentHex: '#06b6d4',
  },
  'tesseractic-hypercage': {
    id: 'tesseractic-hypercage',
    name: '4D Tesseractic Construct',
    subtitle: 'Schlegel Wireframe Exoskeleton & W-Axis Phase Step',
    description:
      'Encloses the human frame inside a 4-dimensional rotating hypercube lattice that bends local gravity.',
    speedBonus: 1.22,
    jumpBonus: 1.28,
    specialAbilityLabel: '4D W-Axis Phase Dash & Gravity Shear',
    accentHex: '#a855f7',
  },
};

export type HumanGloveStyleId =
  | 'stitched-leather-bracers'
  | 'bare-anatomical-hands'
  | 'carved-obsidian-cuffs'
  | 'runic-astrolabe-wraps';

export interface HumanSkinTonePreset {
  id: string;
  label: string;
  skinHex: string;
  subdermalHex: string;
  nailHex: string;
}

export const HUMAN_SKIN_TONE_PRESETS: HumanSkinTonePreset[] = [
  {
    id: 'warm-amber-bronze',
    label: 'Warm Amber Bronze',
    skinHex: '#c68652',
    subdermalHex: '#9a5b32',
    nailHex: '#d8a47f',
  },
  {
    id: 'mediterranean-olive',
    label: 'Weathered Olive Umber',
    skinHex: '#b8845c',
    subdermalHex: '#8c5a38',
    nailHex: '#cfa17e',
  },
  {
    id: 'deep-espresso-ochre',
    label: 'Deep Espresso Ochre',
    skinHex: '#6b4228',
    subdermalHex: '#4a2a16',
    nailHex: '#8c5d41',
  },
  {
    id: 'nordic-ivory-rose',
    label: 'Highland Ivory',
    skinHex: '#dfa985',
    subdermalHex: '#b57856',
    nailHex: '#ecc4a8',
  },
  {
    id: 'ashen-void-touched',
    label: 'Void-Touched Alabaster',
    skinHex: '#b4aca5',
    subdermalHex: '#7d756f',
    nailHex: '#cdc6c0',
  },
];

export type MindspaceFocusTargetId =
  | 'overview-all'
  | 'human-anatomy'
  | 'special-morph'
  | 'hands-and-weapon';

export interface MindspaceAndVoidDialConfig {
  hudTheme: RelicHudThemeId;
  dialControlScheme: VoidDialControlSchemeId;
  activeDialSector: VoidDialSectorId;
  selectedSectorItemIndex: number;
  isVoidDialOpen: boolean;
  isMindspaceOpen: boolean;
  hidePortalRoomBanners: boolean;
  humanSkinToneId: string;
  humanGloveStyle: HumanGloveStyleId;
  activeMorphMode: PlayerMorphModeId;
  unlockedMorphModes: PlayerMorphModeId[];
  combatResonancePct: number;
  autoMetamorphosisOnFullResonance: boolean;
  metamorphosisTimerSec: number;
  mindspaceFocusTarget?: MindspaceFocusTargetId;
  mindspaceTurntableOffset?: number;
}

export const DEFAULT_MINDSPACE_AND_VOID_DIAL_CONFIG: MindspaceAndVoidDialConfig =
  {
    hudTheme: 'carved-obsidian-runes',
    dialControlScheme: 'toggle-dial-quickkeys',
    activeDialSector: 'weapons-and-tools',
    selectedSectorItemIndex: 0,
    isVoidDialOpen: false,
    isMindspaceOpen: false,
    hidePortalRoomBanners: false,
    humanSkinToneId: 'warm-amber-bronze',
    humanGloveStyle: 'stitched-leather-bracers',
    activeMorphMode: 'human-default',
    unlockedMorphModes: [
      'human-default',
      'ophanim-seraph',
      'escher-pyramid-eye',
      'vascular-flame-crown',
      'hadal-cephalopod',
      'tesseractic-hypercage',
    ],
    combatResonancePct: 35,
    autoMetamorphosisOnFullResonance: true,
    metamorphosisTimerSec: 0,
    mindspaceFocusTarget: 'overview-all',
    mindspaceTurntableOffset: 0,
  };

// ============================================================================
// 2. PROCEDURAL CARVED BUMP / ROUGHNESS TEXTURE MAP GENERATOR (NO PLASTIC!)
// ============================================================================

export type CarvedSurfaceStyleId =
  | 'carved-obsidian-runes'
  | 'forged-damascus-steel'
  | 'biomech-chitin-striations'
  | 'anatomical-human-skin'
  | 'stitched-leather-bracer'
  | 'etched-ancient-brass';

interface CachedSurfaceMaps {
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
}

const _surfaceMapCache = new Map<CarvedSurfaceStyleId, CachedSurfaceMaps>();

export function getProceduralCarvedTexturePair(
  style: CarvedSurfaceStyleId
): CachedSurfaceMaps {
  const existing = _surfaceMapCache.get(style);
  if (existing) return existing;

  const size = 256;
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;

  // Base mid-height for bump, high-mid for roughness so nothing looks like shiny plastic
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);
  rCtx.fillStyle = '#a8a8a8';
  rCtx.fillRect(0, 0, size, size);

  // Deterministic pseudo-random helper
  let seed =
    style.split('').reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 17) >>> 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  if (style === 'anatomical-human-skin') {
    // Realistic human skin pores, fine epidermal cross-hatching, and knuckle crease lines
    rCtx.fillStyle = '#b8b8b8'; // Matte-satin natural skin roughness (~0.72)
    rCtx.fillRect(0, 0, size, size);

    for (let i = 0; i < 1600; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const r = 0.6 + rand() * 1.4;
      bCtx.fillStyle = rand() > 0.45 ? '#686868' : '#969696';
      bCtx.beginPath();
      bCtx.arc(x, y, r, 0, Math.PI * 2);
      bCtx.fill();
    }
    // Fine diamond Langer's skin tension lines & knuckle flexion creases
    bCtx.strokeStyle = '#5c5c5c';
    bCtx.lineWidth = 1.1;
    for (let i = 0; i < 48; i++) {
      const y = (i / 48) * size;
      bCtx.beginPath();
      bCtx.moveTo(0, y);
      bCtx.quadraticCurveTo(
        size * 0.5,
        y + (rand() - 0.5) * 14,
        size,
        y + (rand() - 0.5) * 6
      );
      bCtx.stroke();
    }
  } else if (style === 'stitched-leather-bracer') {
    // Pebbled full-grain hide + recessed saddle-stitch seams
    rCtx.fillStyle = '#c4c4c4';
    rCtx.fillRect(0, 0, size, size);
    for (let i = 0; i < 950; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const rad = 1.4 + rand() * 2.6;
      bCtx.fillStyle = rand() > 0.5 ? '#525252' : '#a4a4a4';
      bCtx.beginPath();
      bCtx.arc(x, y, rad, 0, Math.PI * 2);
      bCtx.fill();
    }
    // Twin stitched border channels
    for (const seamX of [32, size - 32]) {
      bCtx.fillStyle = '#262626';
      bCtx.fillRect(seamX - 3, 0, 6, size);
      bCtx.fillStyle = '#e5e5e5';
      for (let y = 6; y < size; y += 14) {
        bCtx.fillRect(seamX - 1.5, y, 3, 7);
      }
    }
  } else if (style === 'forged-damascus-steel') {
    // Wavy Damascus fold bands, hammer peening marks, and deep chiselled fuller grooves
    rCtx.fillStyle = '#787878';
    rCtx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 4) {
      const lum = 105 + Math.floor(Math.sin(y * 0.14) * 38);
      bCtx.strokeStyle = `rgb(${lum},${lum},${lum})`;
      bCtx.lineWidth = 2.2;
      bCtx.beginPath();
      for (let x = 0; x <= size; x += 16) {
        const wy =
          y +
          Math.sin(x * 0.08 + y * 0.05) * 9 +
          Math.cos(x * 0.18 - y * 0.09) * 4;
        if (x === 0) bCtx.moveTo(x, wy);
        else bCtx.lineTo(x, wy);
      }
      bCtx.stroke();
    }
    // Deep recessed central fuller blood-groove & carved cross-notches
    bCtx.fillStyle = '#222222';
    bCtx.fillRect(size * 0.44, 0, size * 0.12, size);
    rCtx.fillStyle = '#d4d4d4';
    rCtx.fillRect(size * 0.44, 0, size * 0.12, size);
    bCtx.strokeStyle = '#ffffff';
    bCtx.lineWidth = 2;
    bCtx.strokeRect(size * 0.44, 0, size * 0.12, size);
  } else if (
    style === 'carved-obsidian-runes' ||
    style === 'etched-ancient-brass'
  ) {
    // Chiselled stone / engraved metal facets + recessed geometric rune channels
    rCtx.fillStyle = style === 'carved-obsidian-runes' ? '#8c8c8c' : '#6e6e6e';
    rCtx.fillRect(0, 0, size, size);

    // Chisel facet strokes
    for (let i = 0; i < 320; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const w = 8 + rand() * 24;
      const h = 4 + rand() * 14;
      const shade = Math.floor(90 + (rand() - 0.5) * 70);
      bCtx.fillStyle = `rgb(${shade},${shade},${shade})`;
      bCtx.fillRect(x, y, w, h);
    }

    // Deeply carved angular runic glyphs & fluted channels
    bCtx.strokeStyle = '#181818';
    bCtx.lineWidth = 3.5;
    rCtx.strokeStyle = '#e2e2e2';
    rCtx.lineWidth = 3.5;
    for (let row = 1; row <= 4; row++) {
      const y = (row / 5) * size;
      bCtx.beginPath();
      bCtx.moveTo(0, y);
      bCtx.lineTo(size, y);
      bCtx.stroke();
      for (let col = 1; col <= 6; col++) {
        const x = (col / 7) * size;
        bCtx.beginPath();
        bCtx.moveTo(x, y - 16);
        bCtx.lineTo(x + 10, y);
        bCtx.lineTo(x, y + 16);
        bCtx.lineTo(x - 10, y);
        bCtx.closePath();
        bCtx.stroke();
        rCtx.beginPath();
        rCtx.moveTo(x, y - 16);
        rCtx.lineTo(x + 10, y);
        rCtx.lineTo(x, y + 16);
        rCtx.stroke();
      }
    }
  } else {
    // 'biomech-chitin-striations': organic ribbed carapace plates & fluted bone pores
    for (let y = 0; y < size; y += 6) {
      const shade = y % 12 === 0 ? '#323232' : '#c8c8c8';
      bCtx.fillStyle = shade;
      bCtx.fillRect(0, y, size, 3);
    }
  }

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 2);
  bumpMap.needsUpdate = true;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(2, 2);
  roughnessMap.needsUpdate = true;

  const pair = { bumpMap, roughnessMap };
  _surfaceMapCache.set(style, pair);
  return pair;
}

/**
 * Traverses any 3D Group (weapons, hands, character armor, world props) and replaces
 * flat plastic shading with carved micro-relief bump/roughness maps and calibrated PBR values.
 */
export function applyCarvedRelicSurfaceToGroup(
  root: THREE.Object3D,
  defaultStyle: CarvedSurfaceStyleId = 'carved-obsidian-runes'
): void {
  const defaultMaps = getProceduralCarvedTexturePair(defaultStyle);
  const brassMaps = getProceduralCarvedTexturePair('etched-ancient-brass');
  const steelMaps = getProceduralCarvedTexturePair('forged-damascus-steel');

  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const mat of mats) {
      if (
        mat instanceof THREE.MeshStandardMaterial ||
        mat instanceof THREE.MeshPhysicalMaterial
      ) {
        if (mat.userData?.hasCarvedReliefApplied) continue;
        mat.userData = { ...mat.userData, hasCarvedReliefApplied: true };

        // Pick appropriate carved texture based on material metallic/color profile
        const chosenMaps =
          mat.metalness > 0.82
            ? brassMaps
            : mat.metalness > 0.45
            ? steelMaps
            : defaultMaps;

        if (!mat.bumpMap) {
          mat.bumpMap = chosenMaps.bumpMap;
          mat.bumpScale = mat.metalness > 0.6 ? 0.018 : 0.024;
        }
        if (!mat.roughnessMap && mat.emissiveIntensity < 0.75) {
          mat.roughnessMap = chosenMaps.roughnessMap;
          // Clamp overly glossy roughness so surfaces look like carved stone/forged metal/skin rather than wet plastic
          mat.roughness = Math.max(0.32, mat.roughness);
        }
        if (
          mat instanceof THREE.MeshPhysicalMaterial &&
          mat.transmission < 0.1
        ) {
          // Reduce excessive clearcoat that causes a "toy plastic" specular sheen
          mat.clearcoat = Math.min(0.24, mat.clearcoat);
          mat.clearcoatRoughness = Math.max(0.38, mat.clearcoatRoughness);
        }
        mat.needsUpdate = true;
      }
    }
  });
}

/**
 * Adds physical 3D carved features (recessed fuller channels, crossguard rune lugs,
 * fluted grip rings, and pommel astrolabe bevels) to any weapon mesh.
 */
export function augmentWeaponWithCarvedReliefGeometry(
  weaponRoot: THREE.Group,
  item: DimensionalItemDefinition
): void {
  if (weaponRoot.userData.hasCarvedGeometryAugmented) return;
  weaponRoot.userData.hasCarvedGeometryAugmented = true;

  const steelMaps = getProceduralCarvedTexturePair('forged-damascus-steel');
  const runeMaps = getProceduralCarvedTexturePair('carved-obsidian-runes');
  const leatherMaps = getProceduralCarvedTexturePair('stitched-leather-bracer');

  const carvedDarkIronMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1c1917'),
    metalness: 0.78,
    roughness: 0.42,
    bumpMap: runeMaps.bumpMap,
    bumpScale: 0.026,
    roughnessMap: runeMaps.roughnessMap,
  });

  const carvedRuneInlayMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(item.visualSpec.accentEmissiveHex),
    emissive: new THREE.Color(item.visualSpec.accentEmissiveHex),
    emissiveIntensity: 0.85,
    roughness: 0.28,
    metalness: 0.5,
  });

  const gripLeatherMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#292018'),
    roughness: 0.78,
    metalness: 0.12,
    bumpMap: leatherMaps.bumpMap,
    bumpScale: 0.022,
    roughnessMap: leatherMaps.roughnessMap,
  });

  const reliefGroup = new THREE.Group();
  reliefGroup.name = 'carved-weapon-relief-details';

  // 1. 4 Raised Cord-Wrapped Grip Ridges along the hilt
  for (let r = 0; r < 4; r++) {
    const gripRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.031, 0.0045, 8, 16),
       r % 2 === 0 ? gripLeatherMat : carvedDarkIronMat
    );
    gripRing.rotation.x = Math.PI * 0.5;
    gripRing.position.set(0, -0.21 + r * 0.068, 0);
    reliefGroup.add(gripRing);
  }

  // 2. Chiselled Crossguard Quillons with Recessed Rune Channels
  const crossguard = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.028, 0.048),
    carvedDarkIronMat
  );
  crossguard.position.set(0, 0.135, 0);
  reliefGroup.add(crossguard);

  for (const side of [-1, 1]) {
    const runeSlot = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.012, 0.052),
      carvedRuneInlayMat
    );
    runeSlot.position.set(side * 0.046, 0.135, 0);
    reliefGroup.add(runeSlot);
  }

  // 3. Recessed Blood-Fuller Groove & Runic Spine Etchings along the upper weapon body
  for (let g = 0; g < 3; g++) {
    const runeNotch = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.016, 0),
      carvedRuneInlayMat
    );
    runeNotch.scale.set(0.6, 1.4, 0.6);
    runeNotch.position.set(0, 0.24 + g * 0.11, 0.024);
    reliefGroup.add(runeNotch);
  }

  weaponRoot.add(reliefGroup);

  // Apply carved Damascus & Rune bump/roughness maps to all existing sub-meshes on the weapon
  applyCarvedRelicSurfaceToGroup(weaponRoot, 'forged-damascus-steel');
  void steelMaps;
}

// ============================================================================
// 3. REALISTIC HUMAN ARMS, 5-FINGER ANATOMY & SPECIAL TRANSFORMATION MODES
// ============================================================================

/**
 * Enhances a 1st-person or 3rd-person hand rig with realistic human anatomy:
 * - Sculpted human skin material with epidermal pore/crease bump map
 * - Realistic fingernail plates on all 5 distal phalanges
 * - Knuckle extensor tendons along the dorsal metacarpals
 * - Selectable glove/bracer style (Bare Anatomical Hands, Stitched Leather Bracers, Carved Obsidian Cuffs, or Runic Wraps)
 */
export function applyRealisticHumanAnatomyToHandRig(
  handRoot: THREE.Group | null,
  isLeftHand: boolean,
  config: MindspaceAndVoidDialConfig
): void {
  if (!handRoot) return;

  const skinPreset =
    HUMAN_SKIN_TONE_PRESETS.find((p) => p.id === config.humanSkinToneId) ??
    HUMAN_SKIN_TONE_PRESETS[0];
  const isHumanMode = config.activeMorphMode === 'human-default';
  const morphSpec = PLAYER_MORPH_MODE_CATALOG[config.activeMorphMode];

  const skinMaps = getProceduralCarvedTexturePair('anatomical-human-skin');
  const leatherMaps = getProceduralCarvedTexturePair('stitched-leather-bracer');
  const runeMaps = getProceduralCarvedTexturePair('carved-obsidian-runes');
  const brassMaps = getProceduralCarvedTexturePair('etched-ancient-brass');

  const activeSkinHex = isHumanMode ? skinPreset.skinHex : '#1e2430';
  const activeSubdermalHex = isHumanMode
    ? skinPreset.subdermalHex
    : morphSpec.accentHex;

  const humanSkinMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(activeSkinHex),
    roughness: isHumanMode ? 0.68 : 0.42,
    metalness: isHumanMode ? 0.04 : 0.45,
    bumpMap: isHumanMode ? skinMaps.bumpMap : runeMaps.bumpMap,
    bumpScale: isHumanMode ? 0.014 : 0.024,
    roughnessMap: isHumanMode ? skinMaps.roughnessMap : runeMaps.roughnessMap,
    sheen: isHumanMode ? 0.35 : 0.15,
    sheenColor: new THREE.Color(activeSubdermalHex),
    clearcoat: isHumanMode ? 0.06 : 0.25,
  });

  const fingernailMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(
      isHumanMode ? skinPreset.nailHex : morphSpec.accentHex
    ),
    roughness: 0.32,
    metalness: isHumanMode ? 0.05 : 0.65,
    clearcoat: 0.45,
  });

  const bracerMat =
    config.humanGloveStyle === 'stitched-leather-bracers'
      ? new THREE.MeshStandardMaterial({
          color: new THREE.Color('#3b2618'),
          roughness: 0.76,
          metalness: 0.12,
          bumpMap: leatherMaps.bumpMap,
          bumpScale: 0.025,
          roughnessMap: leatherMaps.roughnessMap,
        })
      : config.humanGloveStyle === 'runic-astrolabe-wraps'
      ? new THREE.MeshStandardMaterial({
          color: new THREE.Color('#78521a'),
          roughness: 0.38,
          metalness: 0.78,
          bumpMap: brassMaps.bumpMap,
          bumpScale: 0.022,
          roughnessMap: brassMaps.roughnessMap,
        })
      : new THREE.MeshStandardMaterial({
          color: new THREE.Color('#1c1917'),
          roughness: 0.48,
          metalness: 0.62,
          bumpMap: runeMaps.bumpMap,
          bumpScale: 0.026,
          roughnessMap: runeMaps.roughnessMap,
        });

  const showBracers =
    !isHumanMode || config.humanGloveStyle !== 'bare-anatomical-hands';

  // Update forearm, palm, and finger phalanx materials + attach realistic fingernails & extensor tendons once
  const fingerChains = handRoot.userData.fingerChains as
    | {
        proximal: THREE.Group;
        intermediate: THREE.Group;
        distal: THREE.Group;
        baseFlare: number;
      }[]
    | undefined;

  if (fingerChains) {
    fingerChains.forEach((chain, fIdx) => {
      // Hide robotic brass knuckle caps & PIP rings when in realistic human mode
      chain.proximal.children.forEach((ch) => {
        if (ch instanceof THREE.Mesh) {
          if (ch.geometry instanceof THREE.SphereGeometry) {
            ch.visible = !isHumanMode;
          } else {
            ch.material = humanSkinMat;
          }
        }
      });
      chain.intermediate.children.forEach((ch) => {
        if (ch instanceof THREE.Mesh) {
          if (ch.geometry instanceof THREE.TorusGeometry) {
            ch.visible = !isHumanMode;
          } else {
            ch.material = humanSkinMat;
          }
        }
      });
      chain.distal.children.forEach((ch) => {
        if (ch instanceof THREE.Mesh && !ch.userData.isFingernailPlate) {
          ch.material = humanSkinMat;
        }
      });

      // Add anatomical fingernail bed on distal phalanx if not yet present
      let nailMesh = chain.distal.getObjectByName(
        `anatomical-nail-${fIdx}`
      ) as THREE.Mesh | null;
      if (!nailMesh) {
        const nailGeo = new THREE.BoxGeometry(0.011, 0.013, 0.003);
        nailMesh = new THREE.Mesh(nailGeo, fingernailMat);
        nailMesh.name = `anatomical-nail-${fIdx}`;
        nailMesh.userData.isFingernailPlate = true;
        nailMesh.position.set(0, 0.022, isLeftHand ? -0.007 : -0.007);
        nailMesh.rotation.x = 0.14;
        chain.distal.add(nailMesh);
      } else {
        nailMesh.material = fingernailMat;
      }
    });
  }

  // Add 4 anatomical dorsal metacarpal extensor tendon ridges across back of hand
  let tendonGroup = handRoot.getObjectByName(
    'human-dorsal-tendons'
  ) as THREE.Group | null;
  if (!tendonGroup) {
    tendonGroup = new THREE.Group();
    tendonGroup.name = 'human-dorsal-tendons';
    const xPositions = isLeftHand
      ? [0.044, 0.014, -0.018, -0.048]
      : [-0.044, -0.014, 0.018, 0.048];
    xPositions.forEach((tx, idx) => {
      const tendon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0045, 0.006, 0.078, 8),
        humanSkinMat
      );
      tendon.rotation.x = Math.PI * 0.45;
      tendon.rotation.z = (isLeftHand ? -1 : 1) * (idx - 1.5) * 0.08;
      tendon.position.set(tx, 0.008, -0.028);
      tendonGroup!.add(tendon);
    });
    handRoot.add(tendonGroup);
  } else {
    tendonGroup.traverse((ch) => {
      if (ch instanceof THREE.Mesh) ch.material = humanSkinMat;
    });
  }

  // Update forearm & palm meshes so bare skin vs stitched bracers look authentic
  handRoot.children.forEach((child) => {
    if (
      child.name.startsWith('left-forearm-bio-') ||
      child.name.startsWith('right-forearm-bio-')
    ) {
      child.visible = !isHumanMode;
    }
    if (child instanceof THREE.Mesh) {
      // Forearm is positioned around z = 0.16, palm is at (0,0,0), knuckle guard is at z = -0.025
      if (Math.abs(child.position.z - 0.16) < 0.05) {
        child.material = humanSkinMat;
        child.children.forEach((sub) => {
          if (sub instanceof THREE.Mesh) {
            sub.visible = showBracers;
            sub.material = bracerMat;
          } else if (sub instanceof THREE.Group) {
            // Dermal topology overlay on forearm: hide in default human mode
            sub.visible = !isHumanMode;
          }
        });
      } else if (Math.abs(child.position.z - -0.025) < 0.02) {
        // Dorsal knuckle guard plate
        child.visible = showBracers;
        child.material = bracerMat;
      } else {
        // Metacarpal palm mesh
        child.material = humanSkinMat;
      }
    }
  });
}

/**
 * Synchronizes the 3rd-person Playable Character Rig and 1st-person hands between
 * the Realistic Default Human Explorer and the unlocked Special Transformation Modes.
 */
export function syncCharacterMorphAndHumanAppearance(params: {
  avatarRig: {
    root: THREE.Group;
    torsoGroup: THREE.Group;
    headGroup: THREE.Group;
    leftLeg: THREE.Object3D;
    rightLeg: THREE.Object3D;
    leftHandVoidRig: THREE.Group;
    rightHandToolRig: THREE.Group;
    packRotor: THREE.Object3D;
  } | null;
  fpLeftHandRig: THREE.Group | null;
  fpRightHandRig: THREE.Group | null;
  config: MindspaceAndVoidDialConfig;
}): void {
  const { avatarRig, fpLeftHandRig, fpRightHandRig, config } = params;

  applyRealisticHumanAnatomyToHandRig(fpLeftHandRig, true, config);
  applyRealisticHumanAnatomyToHandRig(fpRightHandRig, false, config);

  if (!avatarRig) return;
  applyRealisticHumanAnatomyToHandRig(avatarRig.leftHandVoidRig, true, config);
  applyRealisticHumanAnatomyToHandRig(
    avatarRig.rightHandToolRig,
    false,
    config
  );

  const isHuman = config.activeMorphMode === 'human-default';
  const mode = config.activeMorphMode;

  const skinPreset =
    HUMAN_SKIN_TONE_PRESETS.find((p) => p.id === config.humanSkinToneId) ??
    HUMAN_SKIN_TONE_PRESETS[0];
  const skinMaps = getProceduralCarvedTexturePair('anatomical-human-skin');

  // Ensure a sculpted Realistic Human Face & Explorer Hood/Hair exists on headGroup for Default Human mode
  let humanHeadOverlay = avatarRig.headGroup.getObjectByName(
    'realistic-human-head-group'
  ) as THREE.Group | null;
  if (!humanHeadOverlay) {
    humanHeadOverlay = new THREE.Group();
    humanHeadOverlay.name = 'realistic-human-head-group';
    humanHeadOverlay.position.set(0, 0.16, 0);

    const faceMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(skinPreset.skinHex),
      roughness: 0.65,
      metalness: 0.04,
      bumpMap: skinMaps.bumpMap,
      bumpScale: 0.012,
      sheen: 0.35,
      sheenColor: new THREE.Color(skinPreset.subdermalHex),
    });

    const cranium = new THREE.Mesh(
      new THREE.SphereGeometry(0.145, 22, 18),
      faceMat
    );
    cranium.scale.set(0.92, 1.12, 0.98);
    humanHeadOverlay.add(cranium);

    // Sculpted brow ridge, nose bridge, and jawline
    const noseBridge = new THREE.Mesh(
      new THREE.ConeGeometry(0.024, 0.068, 6),
      faceMat
    );
    noseBridge.rotation.x = -Math.PI * 0.18;
    noseBridge.position.set(0, 0.01, -0.142);
    humanHeadOverlay.add(noseBridge);

    for (const side of [-1, 1]) {
      const eyeSclera = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 12, 10),
        new THREE.MeshBasicMaterial({ color: '#f8fafc' })
      );
      eyeSclera.scale.set(1.25, 0.75, 0.5);
      eyeSclera.position.set(side * 0.046, 0.028, -0.132);
      humanHeadOverlay.add(eyeSclera);

      const eyeIris = new THREE.Mesh(
        new THREE.SphereGeometry(0.01, 10, 8),
        new THREE.MeshBasicMaterial({ color: '#475569' })
      );
      eyeIris.position.set(side * 0.046, 0.028, -0.141);
      humanHeadOverlay.add(eyeIris);
    }

    // Carved Leather & Obsidian Wayfarer Cowl Collar
    const leatherMaps = getProceduralCarvedTexturePair(
      'stitched-leather-bracer'
    );
    const cowlMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#231c16'),
      roughness: 0.78,
      metalness: 0.15,
      bumpMap: leatherMaps.bumpMap,
      bumpScale: 0.024,
      side: THREE.DoubleSide,
    });
    const hairOrCowl = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.156,
        18,
        14,
        0,
        Math.PI * 2,
        0,
        Math.PI * 0.62
      ),
      cowlMat
    );
    hairOrCowl.rotation.x = -0.28;
    hairOrCowl.position.set(0, 0.02, 0.015);
    humanHeadOverlay.add(hairOrCowl);

    avatarRig.headGroup.add(humanHeadOverlay);
  } else {
    // Update skin color on human head
    humanHeadOverlay.children.forEach((ch, idx) => {
      if (ch instanceof THREE.Mesh && (idx === 0 || idx === 1)) {
        (ch.material as THREE.MeshPhysicalMaterial).color.set(
          skinPreset.skinHex
        );
      }
    });
  }

  humanHeadOverlay.visible = isHuman;

  // Toggle non-human Special Transformation Mode attachments on torsoGroup and headGroup
  const tData = avatarRig.torsoGroup.userData;
  const hData = avatarRig.headGroup.userData;

  if (tData.seraphicWingsGroup) {
    tData.seraphicWingsGroup.visible = mode === 'ophanim-seraph';
  }
  if (Array.isArray(tData.glitchVoxels)) {
    tData.glitchVoxels.forEach((v: THREE.Object3D) => {
      v.visible = mode === 'tesseractic-hypercage' || mode === 'ophanim-seraph';
    });
  }
  avatarRig.packRotor.visible = !isHuman;

  if (hData.vascularTreeCrownGroup) {
    hData.vascularTreeCrownGroup.visible = mode === 'vascular-flame-crown';
  }
  if (hData.floatingPorcelainMaskGroup) {
    hData.floatingPorcelainMaskGroup.visible = mode === 'vascular-flame-crown';
  }
  if (hData.pyramidEyeHeadGroup) {
    hData.pyramidEyeHeadGroup.visible = mode === 'escher-pyramid-eye';
  }
  if (hData.cranialRunicHalo) {
    hData.cranialRunicHalo.visible =
      mode === 'ophanim-seraph' || mode === 'tesseractic-hypercage';
  }
  if (hData.metatronStarA) {
    hData.metatronStarA.visible = mode === 'ophanim-seraph';
  }
  if (hData.metatronStarB) {
    hData.metatronStarB.visible = mode === 'ophanim-seraph';
  }

  // Upgrade all character armor & tunic surfaces with carved bump/roughness relief so nothing looks plastic
  applyCarvedRelicSurfaceToGroup(
    avatarRig.root,
    isHuman ? 'stitched-leather-bracer' : 'carved-obsidian-runes'
  );
}

// ============================================================================
// 4. RIGHT-HAND PULL-FROM-VOID-BALL ANIMATION CONTROLLER
// ============================================================================

export interface VoidBallWeaponPullAnimationState {
  active: boolean;
  timerSec: number;
  durationSec: number;
  pulledItemName: string;
  pulledItemSubType: string;
  accentHex: string;
}

export function createInitialVoidBallWeaponPullState(): VoidBallWeaponPullAnimationState {
  return {
    active: false,
    timerSec: 0,
    durationSec: 0.72,
    pulledItemName: '',
    pulledItemSubType: '',
    accentHex: '#f59e0b',
  };
}

/**
 * Steps the choreographed dual-hand animation where the Right Hand physically reaches across
 * into the Left-Hand Void Ball core, grasps the weapon/tool hilt inside the singularity,
 * and pulls it out into the right-hand combat stance while scaling the weapon from the void!
 */
export function stepRightHandPullFromVoidBallAnimation(params: {
  pullState: VoidBallWeaponPullAnimationState;
  dt: number;
  fpLeftHandRig: THREE.Group | null;
  fpRightHandRig: THREE.Group | null;
  activeWeaponMesh: THREE.Group | null;
}): void {
  const { pullState, dt, fpLeftHandRig, fpRightHandRig, activeWeaponMesh } =
    params;
  if (!pullState.active) return;

  pullState.timerSec = Math.max(0, pullState.timerSec - dt);
  const u =
    1.0 - pullState.timerSec / Math.max(0.1, pullState.durationSec);

  if (pullState.timerSec <= 0) {
    pullState.active = false;
    if (activeWeaponMesh) {
      activeWeaponMesh.scale.setScalar(1.0);
    }
    return;
  }

  // 3-Stage Choreography:
  // u in [0.0 .. 0.34]: Right hand reaches across into Left Palm Void Ball (-0.42 X, +0.08 Y)
  // u in [0.34 .. 0.68]: Right hand clamps hilt inside Void Ball; weapon emerges from 0.15 -> 1.08 scale
  // u in [0.68 .. 1.0]: Right hand draws weapon across into combat guard with flourish
  let reachBlend = 0;
  let weaponScale = 1.0;
  let voidBallSurge = 1.0;

  if (u < 0.34) {
    reachBlend = Math.sin((u / 0.34) * (Math.PI * 0.5));
    weaponScale = 0.12 + 0.25 * reachBlend;
    voidBallSurge = 1.0 + 0.85 * reachBlend;
  } else if (u < 0.72) {
    const p = (u - 0.34) / 0.38;
    reachBlend = 1.0 - p * 0.65;
    weaponScale = THREE.MathUtils.lerp(0.37, 1.12, p);
    voidBallSurge = 1.85 - p * 0.55;
  } else {
    const p = (u - 0.72) / 0.28;
    reachBlend = 0.35 * (1.0 - p);
    weaponScale = THREE.MathUtils.lerp(1.12, 1.0, p);
    voidBallSurge = 1.3 - p * 0.3;
  }

  if (fpLeftHandRig) {
    fpLeftHandRig.visible = true;
    fpLeftHandRig.position.x = THREE.MathUtils.lerp(
      fpLeftHandRig.position.x,
      -0.14,
      reachBlend * 0.85
    );
    fpLeftHandRig.position.y = THREE.MathUtils.lerp(
      fpLeftHandRig.position.y,
      -0.11,
      reachBlend * 0.85
    );
    fpLeftHandRig.position.z = THREE.MathUtils.lerp(
      fpLeftHandRig.position.z,
      -0.36,
      reachBlend * 0.85
    );
    fpLeftHandRig.rotation.y = THREE.MathUtils.lerp(
      fpLeftHandRig.rotation.y,
      0.82,
      reachBlend
    );
    const voidBall = fpLeftHandRig.userData.voidBallGroup as
      | THREE.Group
      | undefined;
    if (voidBall) {
      voidBall.scale.multiplyScalar(voidBallSurge);
      voidBall.rotation.y += dt * 14.0;
    }
  }

  if (fpRightHandRig) {
    fpRightHandRig.visible = true;
    // Move right hand across viewport to meet the left-palm Void Ball at (-0.12, -0.11, -0.38)
    fpRightHandRig.position.x = THREE.MathUtils.lerp(
      fpRightHandRig.position.x,
      -0.11,
      reachBlend
    );
    fpRightHandRig.position.y = THREE.MathUtils.lerp(
      fpRightHandRig.position.y,
      -0.1,
      reachBlend
    );
    fpRightHandRig.position.z = THREE.MathUtils.lerp(
      fpRightHandRig.position.z,
      -0.38,
      reachBlend
    );
    fpRightHandRig.rotation.x = THREE.MathUtils.lerp(
      fpRightHandRig.rotation.x,
      0.68,
      reachBlend
    );
    fpRightHandRig.rotation.y = THREE.MathUtils.lerp(
      fpRightHandRig.rotation.y,
      0.74,
      reachBlend
    );
    fpRightHandRig.rotation.z = THREE.MathUtils.lerp(
      fpRightHandRig.rotation.z,
      -0.62,
      reachBlend
    );
  }

  if (activeWeaponMesh) {
    activeWeaponMesh.visible = true;
    activeWeaponMesh.scale.setScalar(weaponScale);
  }
}

// ============================================================================
// 5. DYNAMIC CONTEXT-SENSITIVE QUICK KEYS (1-4) & MUDRA GESTURE RESOLVER
// ============================================================================

export interface DynamicQuickKeyBinding {
  keyNumber: 1 | 2 | 3 | 4;
  label: string;
  subLabel: string;
  glyph: string;
  accentHex: string;
  actionId: string;
}

export function resolveDynamicQuickKeyBindings(params: {
  dialConfig: MindspaceAndVoidDialConfig;
  isPortalOpenInWorld: boolean;
  isInsidePortalRoom: boolean;
  isInsideMazeDimension: boolean;
  isInnerMazePortalOpen: boolean;
  heldObjectName: string | null;
  activeElement: BaseDimensionalElementId;
  quickbarWeapons: DimensionalItemDefinition[];
  activeTool: PlayerInteractionTool;
}): DynamicQuickKeyBinding[] {
  const {
    dialConfig,
    isPortalOpenInWorld,
    isInsidePortalRoom,
    isInsideMazeDimension,
    isInnerMazePortalOpen,
    heldObjectName,
    quickbarWeapons,
  } = params;

  // 1. When the Void Ball Menu Dial is OPEN, keys [1]-[4] directly execute or pull from the active sector!
  if (dialConfig.isVoidDialOpen) {
    if (dialConfig.activeDialSector === 'weapons-and-tools') {
      return [0, 1, 2, 3].map((idx) => {
        const w = quickbarWeapons[idx];
        return {
          keyNumber: (idx + 1) as 1 | 2 | 3 | 4,
          label: w ? `Pull ${w.name.split(' ')[0]}` : `Pull Tool #${idx + 1}`,
          subLabel: w ? w.subTypeLabel : 'Right-Hand Void Extraction',
          glyph: '⚔',
          accentHex: w?.visualSpec.accentEmissiveHex ?? '#f59e0b',
          actionId: `pull-weapon-slot-${idx}`,
        };
      });
    }
    if (dialConfig.activeDialSector === 'portals-and-mazes') {
      return [
        {
          keyNumber: 1,
          label: isInsidePortalRoom
            ? 'Toggle Maze Gate'
            : 'Tear Sanctum Portal',
          subLabel: isInsidePortalRoom
            ? 'South Inner Maze Portal'
            : '36m×36m Square Room Tear',
          glyph: '🚪',
          accentHex: '#38bdf8',
          actionId: 'portal-toggle-main',
        },
        {
          keyNumber: 2,
          label: isInsidePortalRoom ? 'Exit Sanctum' : 'Step Into Room',
          subLabel: 'Instant Threshold Transit',
          glyph: '⇪',
          accentHex: '#2dd4bf',
          actionId: 'portal-step-inside',
        },
        {
          keyNumber: 3,
          label: 'In-Between Rift',
          subLabel: 'Zero-G Timeline Hub',
          glyph: '🛸',
          accentHex: '#a855f7',
          actionId: 'portal-timeline-rift',
        },
        {
          keyNumber: 4,
          label: 'Shift Boundary',
          subLabel: 'Cycle Universe Physics',
          glyph: '◈',
          accentHex: '#f59e0b',
          actionId: 'portal-shift-boundary',
        },
      ];
    }
    if (dialConfig.activeDialSector === 'substrate-synthesis') {
      return [
        {
          keyNumber: 1,
          label: 'Pull Excavate Lance',
          subLabel: 'Granular Terrain Carve',
          glyph: '⛏',
          accentHex: '#f59e0b',
          actionId: 'tool-mine-terrain',
        },
        {
          keyNumber: 2,
          label: isInsideMazeDimension
            ? 'Deploy Maze Tech'
            : isInsidePortalRoom
            ? 'Snap Wing Section'
            : 'Synthesize Structure',
          subLabel: 'Materialize from Substrate',
          glyph: '🏛',
          accentHex: '#10b981',
          actionId: 'tool-place-building',
        },
        {
          keyNumber: 3,
          label: 'Pull Grapple Hook',
          subLabel: 'Pendulum & Zip-Reel',
          glyph: '⚓',
          accentHex: '#38bdf8',
          actionId: 'tool-grapple-hook',
        },
        {
          keyNumber: 4,
          label: 'Harmonic Tether',
          subLabel: 'Weave Substrate Lattice',
          glyph: '∿',
          accentHex: '#a855f7',
          actionId: 'tool-harmonic-tether',
        },
      ];
    }
    // 'character-morphs'
    return [
      {
        keyNumber: 1,
        label: 'Human Default',
        subLabel: 'Realistic Arms & Fingers',
        glyph: '✋',
        accentHex: '#d97706',
        actionId: 'morph-human-default',
      },
      {
        keyNumber: 2,
        label: 'Ophanim Seraph',
        subLabel: '4 Golden Wings & Halo',
        glyph: '🪽',
        accentHex: '#eab308',
        actionId: 'morph-ophanim-seraph',
      },
      {
        keyNumber: 3,
        label: 'Escher Pyramid',
        subLabel: 'Jade Oculus Cranium',
        glyph: '👁',
        accentHex: '#10b981',
        actionId: 'morph-escher-pyramid-eye',
      },
      {
        keyNumber: 4,
        label: 'Vascular Flame',
        subLabel: 'Arterial Antler Crown',
        glyph: '🔥',
        accentHex: '#f97316',
        actionId: 'morph-vascular-flame-crown',
      },
    ];
  }

  // 2. When holding a physical substrate object in the world, keys [1]-[4] transform into Substrate Object Manipulations
  if (heldObjectName) {
    return [
      {
        keyNumber: 1,
        label: 'Ballistic Impale',
        subLabel: `Throw ${heldObjectName.split(' ')[0]}`,
        glyph: '☄',
        accentHex: '#f43f5e',
        actionId: 'held-throw-object',
      },
      {
        keyNumber: 2,
        label: 'Infuse Lithic/Pyro',
        subLabel: 'Transmute Held Substrate',
        glyph: '✦',
        accentHex: '#f59e0b',
        actionId: 'held-infuse-element',
      },
      {
        keyNumber: 3,
        label: 'Assimilate Matter',
        subLabel: 'Deconstruct into Void Ball',
        glyph: '🔮',
        accentHex: '#a855f7',
        actionId: 'held-assimilate-matter',
      },
      {
        keyNumber: 4,
        label: 'Release Grip',
        subLabel: 'Place Substrate Object',
        glyph: '✊',
        accentHex: '#94a3b8',
        actionId: 'held-drop-object',
      },
    ];
  }

  // 3. Inside the Procedural Maze Dimension
  if (isInsideMazeDimension) {
    return [
      {
        keyNumber: 1,
        label: 'Deploy Tech [B]',
        subLabel: 'CCTV / Pylon / Turret',
        glyph: '📹',
        accentHex: '#10b981',
        actionId: 'maze-deploy-tech',
      },
      {
        keyNumber: 2,
        label: 'Cycle Tech Rig',
        subLabel: 'Switch Assimilation Gear',
        glyph: '⚙',
        accentHex: '#38bdf8',
        actionId: 'maze-cycle-tech',
      },
      {
        keyNumber: 3,
        label: 'Pull Primary Arm',
        subLabel: quickbarWeapons[0]?.name.split(' ')[0] ?? 'Draw Weapon',
        glyph: '⚔',
        accentHex: '#f59e0b',
        actionId: 'pull-weapon-slot-0',
      },
      {
        keyNumber: 4,
        label: 'Return to Sanctum',
        subLabel: 'Step Back to Portal Room',
        glyph: '🚪',
        accentHex: '#f43f5e',
        actionId: 'maze-exit-to-room',
      },
    ];
  }

  // 4. Inside the 36m×36m Square Portal Room
  if (isInsidePortalRoom) {
    return [
      {
        keyNumber: 1,
        label: isInnerMazePortalOpen ? 'Next Maze [→]' : 'Open Maze Gate',
        subLabel: '100+ Procedural Labyrinths',
        glyph: '🌀',
        accentHex: '#a855f7',
        actionId: isInnerMazePortalOpen
          ? 'room-next-maze'
          : 'room-toggle-maze-gate',
      },
      {
        keyNumber: 2,
        label: isInnerMazePortalOpen ? 'Enter Maze Now' : 'Snap Wing Module',
        subLabel: isInnerMazePortalOpen
          ? 'Step Into Selected Maze'
          : 'Build Walkable Section',
        glyph: '🏛',
        accentHex: '#10b981',
        actionId: isInnerMazePortalOpen
          ? 'room-enter-maze'
          : 'room-snap-module',
      },
      {
        keyNumber: 3,
        label: 'Mindspace [⇧V]',
        subLabel: 'Sink into 3D Customizer',
        glyph: 'ᛟ',
        accentHex: '#f59e0b',
        actionId: 'open-mindspace-sink',
      },
      {
        keyNumber: 4,
        label: 'Exit to World',
        subLabel: 'Step Out of South Tear',
        glyph: '⇪',
        accentHex: '#38bdf8',
        actionId: 'portal-step-inside',
      },
    ];
  }

  // 5. Exterior World with Reality-Tear Portal Open
  if (isPortalOpenInWorld) {
    return [
      {
        keyNumber: 1,
        label: 'Step Inside Room',
        subLabel: 'Enter 36m×36m Sanctum',
        glyph: '🚪',
        accentHex: '#38bdf8',
        actionId: 'portal-step-inside',
      },
      {
        keyNumber: 2,
        label: `Pull ${quickbarWeapons[0]?.name.split(' ')[0] ?? 'Blade'}`,
        subLabel: 'Draw from Void Ball',
        glyph: '⚔',
        accentHex: '#f59e0b',
        actionId: 'pull-weapon-slot-0',
      },
      {
        keyNumber: 3,
        label: `Pull ${quickbarWeapons[1]?.name.split(' ')[0] ?? 'Sidearm'}`,
        subLabel: 'Draw from Void Ball',
        glyph: '⌖',
        accentHex: '#10b981',
        actionId: 'pull-weapon-slot-1',
      },
      {
        keyNumber: 4,
        label: 'Seal Reality Tear',
        subLabel: 'Clench Void Ball Shut',
        glyph: '✊',
        accentHex: '#f43f5e',
        actionId: 'portal-toggle-main',
      },
    ];
  }

  // 6. Standard Exterior Exploration: Quick-Pull Weapons & Tools or Shift Element/Morph
  return [
    {
      keyNumber: 1,
      label: `Pull ${quickbarWeapons[0]?.name.split(' ')[0] ?? 'Cleaver'}`,
      subLabel: 'Right-Hand Void Draw',
      glyph: '⚔',
      accentHex: quickbarWeapons[0]?.visualSpec.accentEmissiveHex ?? '#f59e0b',
      actionId: 'pull-weapon-slot-0',
    },
    {
      keyNumber: 2,
      label: `Pull ${quickbarWeapons[1]?.name.split(' ')[0] ?? 'Pistol'}`,
      subLabel: 'Right-Hand Void Draw',
      glyph: '⌖',
      accentHex: quickbarWeapons[1]?.visualSpec.accentEmissiveHex ?? '#38bdf8',
      actionId: 'pull-weapon-slot-1',
    },
    {
      keyNumber: 3,
      label: 'Grapple / Excavate',
      subLabel: 'Toggle Substrate Tool',
      glyph: '⚓',
      accentHex: '#10b981',
      actionId: 'cycle-substrate-tool',
    },
    {
      keyNumber: 4,
      label:
        dialConfig.activeMorphMode === 'human-default'
          ? 'Morph Form'
          : 'Human Form',
      subLabel:
        dialConfig.activeMorphMode === 'human-default'
          ? 'Shift into Special Mode'
          : 'Return to Human Default',
      glyph: '🪽',
      accentHex: '#a855f7',
      actionId: 'toggle-quick-morph',
    },
  ];
}

// ============================================================================
// 6. [SHIFT + V] 3D MINDSPACE BACKGROUND CHAMBER & EXAMPLE FIGURES RIG
// ============================================================================

export const MINDSPACE_CHAMBER_ORIGIN = new THREE.Vector3(0, -260, 0);

export interface MindspaceCustomization3DRig {
  rootGroup: THREE.Group;
  humanExamplePlinth: THREE.Group;
  morphExamplePlinth: THREE.Group;
  weaponVoidExamplePlinth: THREE.Group;
  astrolabeRings: THREE.Mesh[];
  floatingMonoliths: THREE.Mesh[];
  sinkBlend: number;
  savedCameraPos: THREE.Vector3;
  savedCameraQuat: THREE.Quaternion;
}

/**
 * Builds the 3D Mindspace Chamber beneath the world where pressing [Shift + V]
 * sinks the player's camera perspective into an obsidian-and-astrolabe mindscape
 * with 3 live 3D example figures showcasing Human Anatomy, Special Transformation Morphs,
 * and Carved Weapon / Void Ball Extraction.
 */
export function buildMindspaceCustomization3DRig(): MindspaceCustomization3DRig {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'shift-v-mindspace-customization-chamber';
  rootGroup.position.copy(MINDSPACE_CHAMBER_ORIGIN);
  rootGroup.visible = false;

  const runeMaps = getProceduralCarvedTexturePair('carved-obsidian-runes');
  const brassMaps = getProceduralCarvedTexturePair('etched-ancient-brass');
  const skinMaps = getProceduralCarvedTexturePair('anatomical-human-skin');

  const obsidianFloorMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#090807'),
    roughness: 0.36,
    metalness: 0.72,
    bumpMap: runeMaps.bumpMap,
    bumpScale: 0.032,
    roughnessMap: runeMaps.roughnessMap,
  });

  const brassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#d97706'),
    emissive: new THREE.Color('#92400e'),
    emissiveIntensity: 0.38,
    roughness: 0.3,
    metalness: 0.88,
    bumpMap: brassMaps.bumpMap,
    bumpScale: 0.022,
  });

  const runeGlowMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#f59e0b'),
    emissive: new THREE.Color('#d97706'),
    emissiveIntensity: 1.15,
    roughness: 0.22,
    metalness: 0.4,
  });

  // 1. Carved Obsidian Sanctuary Floor Disc & Astrolabe Inlay Rings
  const floorDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(18, 19, 0.6, 48),
    obsidianFloorMat
  );
  floorDisc.position.set(0, -0.3, 0);
  rootGroup.add(floorDisc);

  const astrolabeRings: THREE.Mesh[] = [];
  for (let r = 0; r < 4; r++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.2 + r * 2.4, 0.045, 10, 64),
      r % 2 === 0 ? brassMat : runeGlowMat
    );
    ring.rotation.x = Math.PI * 0.5;
    ring.position.set(0, 0.03 + r * 0.02, 0);
    rootGroup.add(ring);
    astrolabeRings.push(ring);
  }

  // Dedicated warm studio key & rim point lights inside the Mindspace
  const keyLight = new THREE.PointLight('#fbbf24', 5.5, 28);
  keyLight.position.set(0, 5.2, 4.5);
  rootGroup.add(keyLight);

  const rimLightLeft = new THREE.PointLight('#38bdf8', 3.5, 22);
  rimLightLeft.position.set(-6.0, 3.8, -3.5);
  rootGroup.add(rimLightLeft);

  const rimLightRight = new THREE.PointLight('#f43f5e', 3.5, 22);
  rimLightRight.position.set(6.0, 3.8, -3.5);
  rootGroup.add(rimLightRight);

  // 2. Circle of 8 Carved Runic Basalt Monoliths framing the Mindspace Horizon
  const floatingMonoliths: THREE.Mesh[] = [];
  for (let m = 0; m < 8; m++) {
    const ang = (m / 8) * Math.PI * 2;
    const dist = 10.5;
    const monolith = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 5.4, 0.48),
      obsidianFloorMat
    );
    monolith.position.set(
      Math.cos(ang) * dist,
      2.6,
      Math.sin(ang) * dist - 1.5
    );
    monolith.rotation.y = -ang + Math.PI * 0.5;

    const runeStrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 4.2, 0.52),
      runeGlowMat
    );
    monolith.add(runeStrip);
    rootGroup.add(monolith);
    floatingMonoliths.push(monolith);
  }

  // Helper to build a Carved Display Plinth
  const buildCarvedPlinth = (x: number, z: number): THREE.Group => {
    const plinthGroup = new THREE.Group();
    plinthGroup.position.set(x, 0, z);

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.05, 1.25, 0.42, 24),
      obsidianFloorMat
    );
    base.position.y = 0.21;
    plinthGroup.add(base);

    const brassCollar = new THREE.Mesh(
      new THREE.TorusGeometry(1.06, 0.035, 10, 36),
      brassMat
    );
    brassCollar.rotation.x = Math.PI * 0.5;
    brassCollar.position.y = 0.42;
    plinthGroup.add(brassCollar);

    rootGroup.add(plinthGroup);
    return plinthGroup;
  };

  // 3A. Left Example Figure: Realistic Human Explorer Figure (Sculpted Head, Eyes, Brow, Hair, Bracers & 5-Finger Hands)
  const humanExamplePlinth = buildCarvedPlinth(-2.85, -1.8);
  const leatherMaps = getProceduralCarvedTexturePair('stitched-leather-bracer');
  const steelMaps = getProceduralCarvedTexturePair('forged-damascus-steel');
  const humanSkinMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#c68652'),
    roughness: 0.64,
    metalness: 0.04,
    bumpMap: skinMaps.bumpMap,
    bumpScale: 0.016,
    roughnessMap: skinMaps.roughnessMap,
    sheen: 0.35,
    sheenColor: new THREE.Color('#9a5b32'),
  });
  const stitchedLeatherMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#3b2618'),
    roughness: 0.72,
    metalness: 0.14,
    bumpMap: leatherMaps.bumpMap,
    bumpScale: 0.026,
    roughnessMap: leatherMaps.roughnessMap,
  });
  const forgedSteelMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#475569'),
    roughness: 0.36,
    metalness: 0.84,
    bumpMap: steelMaps.bumpMap,
    bumpScale: 0.022,
    roughnessMap: steelMaps.roughnessMap,
  });

  const humanFigureGroup = new THREE.Group();
  humanFigureGroup.name = 'mindspace-human-figure';
  humanFigureGroup.position.y = 0.44;

  const hTorso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.21, 0.78, 20),
    stitchedLeatherMat
  );
  hTorso.position.y = 0.95;
  humanFigureGroup.add(hTorso);

  // Carved Chest Baldric & Brass Buckle
  const chestBaldric = new THREE.Mesh(
    new THREE.TorusGeometry(0.255, 0.028, 10, 24),
    brassMat
  );
  chestBaldric.rotation.set(Math.PI * 0.35, 0.3, 0);
  chestBaldric.position.set(0, 1.02, 0.02);
  humanFigureGroup.add(chestBaldric);

  // Sculpted Human Head with Brow Ridge, Nose Bridge, Eyes & Hair Crown
  const hHeadGroup = new THREE.Group();
  hHeadGroup.position.y = 1.54;
  const hSkull = new THREE.Mesh(
    new THREE.SphereGeometry(0.165, 24, 20),
    humanSkinMat
  );
  hSkull.scale.set(0.92, 1.12, 0.98);
  hHeadGroup.add(hSkull);

  const hJaw = new THREE.Mesh(
    new THREE.CylinderGeometry(0.115, 0.082, 0.14, 14),
    humanSkinMat
  );
  hJaw.position.set(0, -0.09, 0.02);
  hHeadGroup.add(hJaw);

  const hBrow = new THREE.Mesh(
    new THREE.BoxGeometry(0.21, 0.032, 0.09),
    humanSkinMat
  );
  hBrow.position.set(0, 0.042, 0.125);
  hHeadGroup.add(hBrow);

  const hNose = new THREE.Mesh(
    new THREE.ConeGeometry(0.028, 0.085, 6),
    humanSkinMat
  );
  hNose.rotation.x = Math.PI * 0.18;
  hNose.position.set(0, 0.0, 0.165);
  hHeadGroup.add(hNose);

  const hairMat = new THREE.MeshStandardMaterial({
    color: '#1c1613',
    roughness: 0.82,
    bumpMap: runeMaps.bumpMap,
    bumpScale: 0.018,
  });
  const hHair = new THREE.Mesh(
    new THREE.SphereGeometry(0.174, 18, 14),
    hairMat
  );
  hHair.scale.set(0.96, 0.92, 1.04);
  hHair.position.set(0, 0.045, -0.022);
  hHeadGroup.add(hHair);

  const scleraMat = new THREE.MeshStandardMaterial({
    color: '#f8fafc',
    roughness: 0.2,
  });
  const irisMat = new THREE.MeshStandardMaterial({
    color: '#d97706',
    emissive: '#92400e',
    emissiveIntensity: 0.45,
  });
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 12, 10),
      scleraMat
    );
    eye.position.set(side * 0.056, 0.018, 0.142);
    const iris = new THREE.Mesh(
      new THREE.SphereGeometry(0.012, 10, 8),
      irisMat
    );
    iris.position.z = 0.014;
    eye.add(iris);
    hHeadGroup.add(eye);
  }
  humanFigureGroup.add(hHeadGroup);

  for (const side of [-1, 1]) {
    const hArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.068, 0.054, 0.56, 16),
      humanSkinMat
    );
    hArm.position.set(side * 0.36, 0.98, 0.08);
    hArm.rotation.z = -side * 0.26;
    hArm.rotation.x = -0.42;

    const bracerCuff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.064, 0.058, 0.24, 16),
      stitchedLeatherMat
    );
    bracerCuff.position.y = -0.12;
    hArm.add(bracerCuff);

    // 5 Articulated Fingers on each showcase hand
    const handPalm = new THREE.Mesh(
      new THREE.BoxGeometry(0.085, 0.09, 0.032),
      humanSkinMat
    );
    handPalm.position.set(0, -0.31, 0.02);
    for (let f = 0; f < 5; f++) {
      const finger = new THREE.Mesh(
        new THREE.CylinderGeometry(0.009, 0.007, 0.065, 8),
        humanSkinMat
      );
      finger.position.set((f - 2) * 0.017, -0.065, 0.008);
      finger.rotation.x = 0.28;
      handPalm.add(finger);
    }
    hArm.add(handPalm);
    humanFigureGroup.add(hArm);

    const hLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.095, 0.068, 0.62, 16),
      obsidianFloorMat
    );
    hLeg.position.set(side * 0.14, 0.32, 0);
    humanFigureGroup.add(hLeg);
  }
  humanExamplePlinth.add(humanFigureGroup);

  // 3B. Center Example Figure: Active Special Transformation Morph Figure (6 Seraphic Wings, Astrolabe Rings & Crown)
  const morphExamplePlinth = buildCarvedPlinth(0, -2.35);
  const morphFigureGroup = new THREE.Group();
  morphFigureGroup.name = 'mindspace-morph-figure';
  morphFigureGroup.position.y = 0.44;

  const mTorso = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.34, 1),
    obsidianFloorMat
  );
  mTorso.scale.set(0.95, 1.65, 0.72);
  mTorso.position.y = 1.05;
  morphFigureGroup.add(mTorso);

  const mCrown = new THREE.Mesh(
    new THREE.ConeGeometry(0.24, 0.44, 4),
    runeGlowMat
  );
  mCrown.rotation.x = Math.PI;
  mCrown.position.y = 1.68;
  morphFigureGroup.add(mCrown);

  const mHalo = new THREE.Mesh(
    new THREE.TorusGeometry(0.48, 0.022, 12, 42),
    brassMat
  );
  mHalo.position.set(0, 1.65, -0.14);
  morphFigureGroup.add(mHalo);

  const mCrossHalo = new THREE.Mesh(
    new THREE.TorusGeometry(0.38, 0.016, 10, 36),
    runeGlowMat
  );
  mCrossHalo.rotation.y = Math.PI * 0.35;
  mCrossHalo.position.set(0, 1.65, -0.14);
  morphFigureGroup.add(mCrossHalo);

  for (const side of [-1, 1]) {
    for (let wTier = 0; wTier < 3; wTier++) {
      const wing = new THREE.Mesh(
        new THREE.ConeGeometry(0.24 - wTier * 0.04, 1.38 - wTier * 0.18, 5),
        wTier % 2 === 0 ? brassMat : runeGlowMat
      );
      wing.position.set(
        side * (0.56 + wTier * 0.14),
        1.32 - wTier * 0.22,
        -0.14 - wTier * 0.05
      );
      wing.rotation.z = side * (0.68 + wTier * 0.28);
      morphFigureGroup.add(wing);
    }
  }
  morphExamplePlinth.add(morphFigureGroup);

  // 3C. Right Example Figure: Articulated 5-Finger Hands, Void Ball Singularity & Carved Damascus Weapon Pull Showcase
  const weaponVoidExamplePlinth = buildCarvedPlinth(2.85, -1.8);
  const voidShowcaseGroup = new THREE.Group();
  voidShowcaseGroup.name = 'mindspace-void-weapon-figure';
  voidShowcaseGroup.position.y = 1.28;

  // Left-Palm Void Singularity & Gimbal Rings
  const voidCore = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.22, 2),
    new THREE.MeshStandardMaterial({
      color: '#090612',
      emissive: '#7e22ce',
      emissiveIntensity: 0.9,
      roughness: 0.15,
    })
  );
  voidCore.position.set(-0.22, -0.05, 0);
  voidShowcaseGroup.add(voidCore);

  const voidCage = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.38, 1),
    new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      emissive: '#d97706',
      emissiveIntensity: 0.85,
      wireframe: true,
    })
  );
  voidCage.position.set(-0.22, -0.05, 0);
  voidShowcaseGroup.add(voidCage);

  // Sculpted Left Hand cradling the Void Ball
  const leftShowcaseHand = new THREE.Group();
  leftShowcaseHand.position.set(-0.28, -0.34, 0.12);
  const lPalm = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.16, 0.05),
    humanSkinMat
  );
  leftShowcaseHand.add(lPalm);
  for (let f = 0; f < 5; f++) {
    const fMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.012, 0.12, 10),
      humanSkinMat
    );
    fMesh.position.set((f - 2) * 0.028, 0.11, -0.02);
    fMesh.rotation.x = -0.38;
    leftShowcaseHand.add(fMesh);
  }
  voidShowcaseGroup.add(leftShowcaseHand);

  // Carved Damascus & Rune Greatsword / Relic Blade being pulled by the Right Hand
  const carvedWeaponAssembly = new THREE.Group();
  carvedWeaponAssembly.name = 'mindspace-carved-weapon-assembly';
  carvedWeaponAssembly.position.set(0.16, 0.18, 0.08);
  carvedWeaponAssembly.rotation.z = -0.38;

  const bladeCore = new THREE.Mesh(
    new THREE.BoxGeometry(0.13, 1.18, 0.036),
    forgedSteelMat
  );
  carvedWeaponAssembly.add(bladeCore);

  // Recessed Blood-Fuller Groove & Runic Inlays
  const fullerGroove = new THREE.Mesh(
    new THREE.BoxGeometry(0.036, 0.88, 0.042),
    runeGlowMat
  );
  fullerGroove.position.set(0, 0.08, 0);
  carvedWeaponAssembly.add(fullerGroove);

  // Chiselled Crossguard Quillons
  const crossguard = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.055, 0.075),
    brassMat
  );
  crossguard.position.set(0, -0.44, 0);
  carvedWeaponAssembly.add(crossguard);

  // Cord-Wrapped Leather Grip & Pommel
  const gripCyl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.036, 0.28, 14),
    stitchedLeatherMat
  );
  gripCyl.position.set(0, -0.62, 0);
  carvedWeaponAssembly.add(gripCyl);

  const pommelWheel = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.065, 0),
    brassMat
  );
  pommelWheel.position.set(0, -0.78, 0);
  carvedWeaponAssembly.add(pommelWheel);

  voidShowcaseGroup.add(carvedWeaponAssembly);
  weaponVoidExamplePlinth.add(voidShowcaseGroup);

  return {
    rootGroup,
    humanExamplePlinth,
    morphExamplePlinth,
    weaponVoidExamplePlinth,
    astrolabeRings,
    floatingMonoliths,
    sinkBlend: 0,
    savedCameraPos: new THREE.Vector3(),
    savedCameraQuat: new THREE.Quaternion(),
  };
}

/**
 * Updates the [Shift + V] Mindspace Camera Sink transition and animates the 3 live example figures
 * in the background while the player customizes their HUD theme, [V] dial mode, and human/morph forms.
 * Supports close-up camera focus on any individual plinth + turntable rotation for visual quality verification.
 */
export function updateMindspaceCustomizationCameraAndFigures(params: {
  rig: MindspaceCustomization3DRig;
  config: MindspaceAndVoidDialConfig;
  camera: THREE.PerspectiveCamera;
  playerPos: THREE.Vector3;
  dt: number;
  nowSec: number;
}): boolean {
  const { rig, config, camera, playerPos, dt, nowSec } = params;

  const targetSink = config.isMindspaceOpen ? 1.0 : 0.0;
  if (!config.isMindspaceOpen && rig.sinkBlend <= 0.005) {
    rig.sinkBlend = 0;
    rig.rootGroup.visible = false;
    return false;
  }

  if (config.isMindspaceOpen && rig.sinkBlend <= 0.01) {
    rig.savedCameraPos.copy(camera.position);
    rig.savedCameraQuat.copy(camera.quaternion);
  }

  rig.sinkBlend += (targetSink - rig.sinkBlend) * Math.min(1, dt * 7.5);
  rig.rootGroup.visible = true;

  // Position Mindspace Chamber directly beneath the player's X/Z so sinking feels like descending into one's own mindspace
  rig.rootGroup.position.set(
    playerPos.x,
    MINDSPACE_CHAMBER_ORIGIN.y,
    playerPos.z
  );

  // Animate astrolabe rings & example plinths
  rig.astrolabeRings.forEach((ring, idx) => {
    ring.rotation.z = nowSec * (idx % 2 === 0 ? 0.25 : -0.18);
  });

  const skinPreset =
    HUMAN_SKIN_TONE_PRESETS.find((p) => p.id === config.humanSkinToneId) ??
    HUMAN_SKIN_TONE_PRESETS[0];
  const morphSpec = PLAYER_MORPH_MODE_CATALOG[config.activeMorphMode];
  const turntableYaw = config.mindspaceTurntableOffset ?? 0;

  const humanFig = rig.humanExamplePlinth.getObjectByName(
    'mindspace-human-figure'
  );
  if (humanFig) {
    humanFig.rotation.y =
      Math.sin(nowSec * 0.65) * 0.38 + 0.32 + turntableYaw;
    humanFig.traverse((ch) => {
      if (
        ch instanceof THREE.Mesh &&
        ch.material instanceof THREE.MeshPhysicalMaterial
      ) {
        ch.material.color.set(skinPreset.skinHex);
      }
    });
  }

  const morphFig = rig.morphExamplePlinth.getObjectByName(
    'mindspace-morph-figure'
  );
  if (morphFig) {
    morphFig.rotation.y = nowSec * 0.55 + turntableYaw;
    morphFig.position.y = 0.44 + Math.sin(nowSec * 2.2) * 0.08;
    morphFig.traverse((ch) => {
      if (
        ch instanceof THREE.Mesh &&
        ch.material instanceof THREE.MeshStandardMaterial &&
        ch.material.emissiveIntensity > 0.5
      ) {
        ch.material.color.set(morphSpec.accentHex);
        ch.material.emissive.set(morphSpec.accentHex);
      }
    });
  }

  const voidWeaponFig = rig.weaponVoidExamplePlinth.getObjectByName(
    'mindspace-void-weapon-figure'
  );
  if (voidWeaponFig) {
    voidWeaponFig.rotation.y = -nowSec * 0.65 + turntableYaw;
    voidWeaponFig.position.y = 1.28 + Math.cos(nowSec * 2.4) * 0.06;
    const weaponAsm = voidWeaponFig.getObjectByName(
      'mindspace-carved-weapon-assembly'
    );
    if (weaponAsm) {
      // Continuous pull-from-void-ball demonstration oscillation
      const pullPulse = 0.5 + 0.5 * Math.sin(nowSec * 2.8);
      weaponAsm.position.set(
        -0.08 + pullPulse * 0.28,
        0.02 + pullPulse * 0.24,
        0.08
      );
      weaponAsm.rotation.z = -0.65 + pullPulse * 0.35;
    }
  }

  // Smoothly focus camera on either All 3 Plinths or a specific close-up Plinth for Visual Quality Verification!
  const focusMode = config.mindspaceFocusTarget ?? 'overview-all';
  const mindspaceCamPos = new THREE.Vector3();
  const mindspaceLookTarget = new THREE.Vector3();

  if (focusMode === 'human-anatomy') {
    mindspaceCamPos.set(
      playerPos.x - 2.85 + Math.sin(nowSec * 0.3) * 0.12,
      MINDSPACE_CHAMBER_ORIGIN.y + 1.72,
      playerPos.z + 0.15
    );
    mindspaceLookTarget.set(
      playerPos.x - 2.85,
      MINDSPACE_CHAMBER_ORIGIN.y + 1.55,
      playerPos.z - 1.8
    );
  } else if (focusMode === 'special-morph') {
    mindspaceCamPos.set(
      playerPos.x + Math.sin(nowSec * 0.3) * 0.15,
      MINDSPACE_CHAMBER_ORIGIN.y + 1.75,
      playerPos.z - 0.15
    );
    mindspaceLookTarget.set(
      playerPos.x,
      MINDSPACE_CHAMBER_ORIGIN.y + 1.55,
      playerPos.z - 2.35
    );
  } else if (focusMode === 'hands-and-weapon') {
    mindspaceCamPos.set(
      playerPos.x + 2.85 + Math.sin(nowSec * 0.3) * 0.12,
      MINDSPACE_CHAMBER_ORIGIN.y + 1.68,
      playerPos.z + 0.15
    );
    mindspaceLookTarget.set(
      playerPos.x + 2.85,
      MINDSPACE_CHAMBER_ORIGIN.y + 1.42,
      playerPos.z - 1.8
    );
  } else {
    mindspaceCamPos.set(
      playerPos.x + Math.sin(nowSec * 0.22) * 0.35,
      MINDSPACE_CHAMBER_ORIGIN.y + 1.85,
      playerPos.z + 3.25
    );
    mindspaceLookTarget.set(
      playerPos.x,
      MINDSPACE_CHAMBER_ORIGIN.y + 1.25,
      playerPos.z - 2.1
    );
  }

  const smoothS = rig.sinkBlend * rig.sinkBlend * (3 - 2 * rig.sinkBlend);
  camera.position.lerpVectors(rig.savedCameraPos, mindspaceCamPos, smoothS);

  const tempCam = camera.clone();
  tempCam.position.copy(mindspaceCamPos);
  tempCam.lookAt(mindspaceLookTarget);
  camera.quaternion.slerpQuaternions(
    rig.savedCameraQuat,
    tempCam.quaternion,
    smoothS
  );

  return true;
}
