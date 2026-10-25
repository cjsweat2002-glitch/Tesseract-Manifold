import * as THREE from 'three';
import {
  PlayableCharacterSpec,
  SkinTopologyStyle,
  SkinTopologyTelemetry,
} from '../types/manifold';

export interface SkinTopologyMetadata {
  style: SkinTopologyStyle;
  label: string;
  anatomicalBasis: string;
  deformationMechanic: string;
  surfaceMicrostructure: string;
  baseRoughness: number;
  baseMetalness: number;
  clearcoat: number;
  iridescence: number;
  bumpScale: number;
}

export const SKIN_TOPOLOGY_CATALOG: Record<
  SkinTopologyStyle,
  SkinTopologyMetadata
> = {
  'myofibril-striated-cuticle': {
    style: 'myofibril-striated-cuticle',
    label: 'Serif-Striated Myofibril & Ink-Trap Grime',
    anatomicalBasis:
      'High-contrast Bodoni/Didot calligraphic stress striations paired with gritty aerosol soot trapped in recessed sarcomere ink-traps.',
    deformationMechanic:
      'Calligraphic stroke-weight swells under tension while recessed ink-trap valleys accumulate matte graffiti-dirt patina.',
    surfaceMicrostructure:
      'Sharp typographic serif ridges contrasting against charcoal street-grime crevices.',
    baseRoughness: 0.42,
    baseMetalness: 0.28,
    clearcoat: 0.65,
    iridescence: 0.25,
    bumpScale: 0.085,
  },
  'chromatophore-pulsing-dermis': {
    style: 'chromatophore-pulsing-dermis',
    label: 'Grunge-Stencil Counter-Voids & Overspray Dermis',
    anatomicalBasis:
      'Distressed 90s grunge-font counter-void apertures (hollow glyph bowls) contrasted with aerosol overspray haloes and pigment spatter.',
    deformationMechanic:
      'Glyph counter-apertures dilate with locomotion speed while aerosol spatter rings shift contrast across the boundary.',
    surfaceMicrostructure:
      'Stencil-cut negative spaces rimmed by raw aerosol spatter and weathered pigment grit.',
    baseRoughness: 0.38,
    baseMetalness: 0.22,
    clearcoat: 0.72,
    iridescence: 0.65,
    bumpScale: 0.07,
  },
  'piezo-scale-imbrication': {
    style: 'piezo-scale-imbrication',
    label: 'Blackletter Spur Scutes & Asphalt Soot Crust',
    anatomicalBasis:
      'Angular Gothic blackletter diamond-terminals and serif spurs contrasted topologically with rough asphalt graffiti-dirt in the under-scute recesses.',
    deformationMechanic:
      'Piezoelectric blackletter spurs catch specular light on outer ridges while deep undercuts stay caked in matte soot.',
    surfaceMicrostructure:
      'Razor-edged typographic spurs over coarse, weathered concrete-and-soot grit.',
    baseRoughness: 0.34,
    baseMetalness: 0.62,
    clearcoat: 0.78,
    iridescence: 0.55,
    bumpScale: 0.11,
  },
  'subsurface-vascular-velvet': {
    style: 'subsurface-vascular-velvet',
    label: 'Ligature-Bridge Velvet & Dripping Ink Patina',
    anatomicalBasis:
      'Sweeping typographic ligature arcs and ball-terminals contrasted with vertical ink-drip stalactites and weathered chalk dust.',
    deformationMechanic:
      'Subsurface continuum cores glow through translucent ligature bridges while lower extremities carry heavy street-dirt tooth.',
    surfaceMicrostructure:
      'Smooth calligraphic arches meeting raw, dripping pigment sediment.',
    baseRoughness: 0.48,
    baseMetalness: 0.18,
    clearcoat: 0.52,
    iridescence: 0.35,
    bumpScale: 0.065,
  },
  'chitin-suture-plates': {
    style: 'chitin-suture-plates',
    label: 'Brutalist Woodtype Plates & Graffiti Tagging Grit',
    anatomicalBasis:
      'Heavy distressed woodtype block-serif plates separated by deep ink-trap sutures packed with raw mineral and aerosol grime.',
    deformationMechanic:
      'Woodtype plates articulate along distressed stencil seams, exposing high-contrast grime in the joint folds.',
    surfaceMicrostructure:
      'Chiseled slab-serif carapace contrasted with gritty aerosol-tagged suture trenches.',
    baseRoughness: 0.44,
    baseMetalness: 0.48,
    clearcoat: 0.68,
    iridescence: 0.3,
    bumpScale: 0.095,
  },
  'vitreous-tensegrity-membrane': {
    style: 'vitreous-tensegrity-membrane',
    label: 'Hairline-Serif Vitreous Sheath & Soot Sediment',
    anatomicalBasis:
      'Translucent hairline-serif glass sheath housing the internal 4D continuum core, contrasted with gritty soot sediment along basal contours.',
    deformationMechanic:
      'Internal 4D tesseract shines through the upper vitreous glyph-sheath while basal edges ground into dark street-grit.',
    surfaceMicrostructure:
      'Polished typographic glass-lines emerging from raw, porous carbon-dirt foundations.',
    baseRoughness: 0.18,
    baseMetalness: 0.25,
    clearcoat: 0.92,
    iridescence: 0.8,
    bumpScale: 0.055,
  },
};

export const ALL_SKIN_TOPOLOGY_STYLES: SkinTopologyStyle[] = [
  'myofibril-striated-cuticle',
  'chromatophore-pulsing-dermis',
  'piezo-scale-imbrication',
  'subsurface-vascular-velvet',
  'chitin-suture-plates',
  'vitreous-tensegrity-membrane',
];

export function resolveEntitySkinTopology(
  seedOrBlueprint:
    | number
    | {
        seed: number;
        carvingStyle: string;
        skinTopology?: SkinTopologyStyle;
      },
  carvingStyleArg?: string
): SkinTopologyStyle {
  if (typeof seedOrBlueprint === 'object' && seedOrBlueprint !== null) {
    if (seedOrBlueprint.skinTopology) {
      return seedOrBlueprint.skinTopology;
    }
    return resolveEntitySkinTopology(
      seedOrBlueprint.seed,
      seedOrBlueprint.carvingStyle
    );
  }
  const seed = seedOrBlueprint;
  const carvingStyle = carvingStyleArg ?? 'faceted-poly';
  switch (carvingStyle) {
    case 'tubular-exoskeleton':
    case 'monolith-plate':
      return 'chitin-suture-plates';
    case 'faceted-poly':
    case 'obsidian-reliquary':
      return 'piezo-scale-imbrication';
    case 'nacre-filigree':
      return 'chromatophore-pulsing-dermis';
    case 'hyper-ringed':
      return 'vitreous-tensegrity-membrane';
    case 'cathedral-ribbed':
      return 'myofibril-striated-cuticle';
    default:
      return ALL_SKIN_TOPOLOGY_STYLES[
        Math.abs(seed) % ALL_SKIN_TOPOLOGY_STYLES.length
      ];
  }
}

export function resolveCharacterSkinTopology(
  spec: PlayableCharacterSpec
): SkinTopologyStyle {
  if (spec.skinTopology) return spec.skinTopology;
  switch (spec.bodyArchetype) {
    case 'chitin-nomad':
      return 'chitin-suture-plates';
    case 'vitreous-diver':
      return 'vitreous-tensegrity-membrane';
    case 'mycelial-symbiont':
      return 'chromatophore-pulsing-dermis';
    case 'ossified-cantor':
      return 'myofibril-striated-cuticle';
    case 'ferro-seraph':
      return 'piezo-scale-imbrication';
    default:
      return 'subsurface-vascular-velvet';
  }
}

interface CachedSkinTextures {
  albedoDirtMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
}

const skinTextureCache = new Map<string, CachedSkinTextures>();

/**
 * Generates and caches procedural micro-topological maps that contrast:
 * 1. Calligraphic Stroke-Weight Structural Ridges (smooth, variable-width sculptural swells & chiselled bevel crests)
 * 2. Topological Crevice Weathering & Mineral Dirt (matte sediment and soot settled inside recessed anatomical sutures)
 * (No literal 2D letters stamped onto the surface—typography inspires the 3D stroke-weight modulation and ink-trap crevices themselves!)
 */
export function getProceduralSkinTextures(
  style: SkinTopologyStyle,
  glowHex: string
): CachedSkinTextures {
  const cacheKey = `${style}:${glowHex}:photoreal-pbr-v5`;
  const existing = skinTextureCache.get(cacheKey);
  if (existing) return existing;

  const size = 128;
  const heightfield = new Float32Array(size * size);

  // 1. Generate multi-layered heightfield (anisotropic alloy striations, Voronoi chitin plates & hydraulic conduits)
  for (let y = 0; y < size; y++) {
    const ny = y / size;
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const idx = y * size + x;

      // Micro-scratches & directional brushed metal grain
      const brushed = Math.sin(nx * 180.0 + Math.sin(ny * 24.0) * 1.5) * 0.08;
      // Articulated chitin/carapace polygonal plates
      const plateU = Math.sin(nx * 28.0 + Math.cos(ny * 22.0) * 2.0);
      const plateV = Math.cos(ny * 36.0 + Math.sin(nx * 26.0) * 1.8);
      const plateCell = Math.abs(plateU * 0.55 + plateV * 0.45);
      // High-frequency skin grain
      const microGrain = (Math.sin(nx * 256.0 + ny * 128.0) + Math.cos(nx * 128.0 - ny * 256.0)) * 0.06;

      const rawHeight = plateCell * 0.72 + brushed + microGrain;
      heightfield[idx] = THREE.MathUtils.clamp(rawHeight, 0.0, 1.0);
    }
  }

  // 2. Build Canvas Buffers
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const aCtx = albedoCanvas.getContext('2d')!;
  const aImg = aCtx.createImageData(size, size);

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;
  const bImg = bCtx.createImageData(size, size);

  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = size;
  normalCanvas.height = size;
  const nCtx = normalCanvas.getContext('2d')!;
  const nImg = nCtx.createImageData(size, size);

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;
  const rImg = rCtx.createImageData(size, size);

  const bumpStrength = 3.6;

  for (let y = 0; y < size; y++) {
    const yPrev = (y - 1 + size) % size;
    const yNext = (y + 1) % size;

    for (let x = 0; x < size; x++) {
      const xPrev = (x - 1 + size) % size;
      const xNext = (x + 1) % size;
      const idx = y * size + x;
      const pIdx = idx * 4;
      const hCenter = heightfield[idx];

      // Tangent-space Sobel normal filter
      const hLeft = heightfield[y * size + xPrev];
      const hRight = heightfield[y * size + xNext];
      const hTop = heightfield[yPrev * size + x];
      const hBottom = heightfield[yNext * size + x];

      const dx = (hRight - hLeft) * bumpStrength;
      const dy = (hBottom - hTop) * bumpStrength;
      const dz = 1.0;
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1.0;
      const nx = -dx / len;
      const ny = -dy / len;
      const nz = dz / len;

      nImg.data[pIdx] = Math.floor((nx * 0.5 + 0.5) * 255);
      nImg.data[pIdx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      nImg.data[pIdx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
      nImg.data[pIdx + 3] = 255;

      // Bump height
      const bumpVal = Math.floor(hCenter * 255);
      bImg.data[pIdx] = bumpVal;
      bImg.data[pIdx + 1] = bumpVal;
      bImg.data[pIdx + 2] = bumpVal;
      bImg.data[pIdx + 3] = 255;

      // Roughness: Polished alloy bevel ridges (~0.22 - 0.35), matte cavity grime in seams (~0.85 - 0.95)
      const rVal = Math.floor(THREE.MathUtils.clamp((0.88 - hCenter * 0.58) * 255, 55, 240));
      rImg.data[pIdx] = rVal;
      rImg.data[pIdx + 1] = rVal;
      rImg.data[pIdx + 2] = rVal;
      rImg.data[pIdx + 3] = 255;

      // Stratified epidermal / weathered alloy albedo with soot in crevices
      const dirt = 1.0 - smoothstep(0.25, 0.75, hCenter);
      const baseTone = Math.floor(215 - dirt * 75);
      aImg.data[pIdx] = baseTone;
      aImg.data[pIdx + 1] = Math.floor(baseTone * 0.98);
      aImg.data[pIdx + 2] = Math.floor(baseTone * 0.94);
      aImg.data[pIdx + 3] = 255;
    }
  }

  function smoothstep(edge0: number, edge1: number, x: number) {
    const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
  }

  aCtx.putImageData(aImg, 0, 0);
  bCtx.putImageData(bImg, 0, 0);
  nCtx.putImageData(nImg, 0, 0);
  rCtx.putImageData(rImg, 0, 0);

  const albedoDirtMap = new THREE.CanvasTexture(albedoCanvas);
  albedoDirtMap.wrapS = THREE.RepeatWrapping;
  albedoDirtMap.wrapT = THREE.RepeatWrapping;
  albedoDirtMap.repeat.set(3, 3);
  albedoDirtMap.colorSpace = THREE.SRGBColorSpace;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(3, 3);

  const normalMap = new THREE.CanvasTexture(normalCanvas);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(3, 3);
  normalMap.colorSpace = THREE.NoColorSpace;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(3, 3);
  roughnessMap.colorSpace = THREE.NoColorSpace;

  const result = { albedoDirtMap, bumpMap, normalMap, roughnessMap };
  skinTextureCache.set(cacheKey, result);
  return result;
}

/**
 * Builds a multi-layer THREE.MeshPhysicalMaterial that contrasts smooth, sharp
 * typographic glyph ridges against gritty, matte graffiti-dirt crevices while keeping
 * a semi-translucent biological sheath for internal continuum cores.
 */
export function createComplexSkinMaterial(
  style: SkinTopologyStyle,
  baseHex: string,
  glowHex: string,
  options?: {
    flatShading?: boolean;
    translucent?: boolean;
    emissiveBoost?: number;
  }
): THREE.MeshPhysicalMaterial {
  const meta = SKIN_TOPOLOGY_CATALOG[style];
  const textures = getProceduralSkinTextures(style, glowHex);

  const isTranslucent = Boolean(options?.translucent);
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(baseHex),
    map: textures.albedoDirtMap,
    metalness: meta.baseMetalness,
    roughness: meta.baseRoughness,
    roughnessMap: textures.roughnessMap,
    normalMap: textures.normalMap,
    normalScale: new THREE.Vector2(1.25, 1.25),
    clearcoat: meta.clearcoat,
    clearcoatRoughness: 0.22,
    iridescence: meta.iridescence * 0.65,
    iridescenceIOR: 1.42,
    bumpMap: textures.bumpMap,
    bumpScale: meta.bumpScale * 0.45,
    emissive: new THREE.Color(glowHex),
    emissiveIntensity: (options?.emissiveBoost ?? 0.12) + 0.05,
    flatShading: options?.flatShading ?? false,
    transparent: isTranslucent,
    opacity: isTranslucent ? 0.75 : 1.0,
  });

  mat.userData.isComplexSkinMaterial = true;
  mat.userData.skinStyle = style;
  mat.userData.baseColor = new THREE.Color(baseHex);
  mat.userData.glowColor = new THREE.Color(glowHex);
  mat.userData.baseRoughness = meta.baseRoughness;
  mat.userData.baseBumpScale = meta.bumpScale * 0.65;

  return mat;
}

/**
 * Sculpts a geometry ONCE at creation time with:
 * 1. Font-Library Typographic Serif Flutes, Ink-Trap Notches, and Calligraphic Stress Swells
 * 2. Topological Vertex Color Contrast:
 *    - Extruded typographic ridges & upper crests gleam with crisp glyphic contrast
 *    - Recessed ink-trap valleys & lower ground-contact zones are caked in dark, earthy Graffiti Dirt & Soot
 * (Zero per-frame CPU vertex buffer loops, keeping 60FPS POV buttery-smooth!)
 */
export function prepareDeformableSkinGeometry<T extends THREE.BufferGeometry>(
  geo: T
): T {
  const posAttr = geo.attributes.position;
  if (!posAttr) return geo;
  geo.computeVertexNormals();
  const normAttr = geo.attributes.normal;

  const vCount = posAttr.count;
  const colors = new Float32Array(vCount * 3);

  // Compute vertical bounds for topological dirt gradient
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < vCount; i++) {
    const y = posAttr.getY(i);
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const spanY = Math.max(0.05, maxY - minY);

  // Colors for topological contrast:
  // Crisp ivory-tinted glyphic highlight on extruded serifs vs. charcoal/ochre graffiti-dirt in recessed ink-traps
  const ridgeColor = new THREE.Color('#ffffff');
  const sootDirtColor = new THREE.Color('#27231f');
  const rustTagColor = new THREE.Color('#573b26');
  const tempCol = new THREE.Color();

  for (let i = 0; i < vCount; i++) {
    const bx = posAttr.getX(i);
    const by = posAttr.getY(i);
    const bz = posAttr.getZ(i);

    const nx = normAttr ? normAttr.getX(i) : 0;
    const ny = normAttr ? normAttr.getY(i) : 0;
    const nz = normAttr ? normAttr.getZ(i) : 0;

    const normY = (by - minY) / spanY; // 0 at base (graffiti dirt zone), 1 at apex
    const radialAngle = Math.atan2(bz, bx);

    // Font-library serif bracket flare at top/bottom terminals + ink-trap flute channels
    const serifTerminalFlare =
      Math.pow(Math.abs(normY - 0.5) * 2.0, 3.0) * 0.018;
    const inkTrapFlute = Math.cos(radialAngle * 6.0 + by * 14.0);
    const displacement =
      serifTerminalFlare + (inkTrapFlute > 0.25 ? 0.012 : -0.01);

    posAttr.setXYZ(
      i,
      bx + nx * displacement,
      by + ny * displacement * 0.4,
      bz + nz * displacement
    );

    // Topological Dirt Factor: higher in recessed ink-trap valleys (inkTrapFlute < 0) and near the base (normY < 0.35)
    const valleyDirt = inkTrapFlute < 0 ? Math.abs(inkTrapFlute) * 0.72 : 0;
    const basalGrime = Math.max(0, 1.0 - normY * 2.1) * 0.65;
    const dirtBlend = Math.min(1.0, valleyDirt + basalGrime);

    if (dirtBlend > 0.45) {
      tempCol
        .copy(rustTagColor)
        .lerp(sootDirtColor, (dirtBlend - 0.45) / 0.55);
      tempCol.lerp(ridgeColor, 0.25);
    } else {
      tempCol.copy(ridgeColor).lerp(rustTagColor, dirtBlend / 0.45 * 0.45);
    }

    colors[i * 3] = tempCol.r;
    colors[i * 3 + 1] = tempCol.g;
    colors[i * 3 + 2] = tempCol.b;
  }

  posAttr.needsUpdate = true;
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  geo.userData.isDeformableSkinGeo = true;
  return geo;
}

/**
 * Builds an internal Sub-Dermal Continuum Vascular Lattice SHEATHED INSIDE a torso or limb segment
 * (at 42% of the outer radius so it is completely enclosed inside the translucent outer skin sheath).
 * Uses a continuous parametric double-helical vascular knot rather than primitive octahedra or rings.
 */
export function buildDermalTopologyOverlayGroup(
  style: SkinTopologyStyle,
  primaryHex: string,
  secondaryHex: string,
  glowHex: string,
  radiusScale: number = 0.36
): THREE.Group {
  const overlay = new THREE.Group();
  overlay.userData.isDermalOverlay = true;
  overlay.userData.skinStyle = style;

  const innerSheathedRadius = radiusScale * 0.42;

  const scaleMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(secondaryHex),
    emissive: new THREE.Color(glowHex),
    emissiveIntensity: 0.45,
    metalness: 0.55,
    roughness: 0.22,
    transparent: true,
    opacity: 0.62,
  });

  const vascularMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(glowHex),
    emissive: new THREE.Color(glowHex),
    emissiveIntensity: 0.78,
    roughness: 0.2,
    metalness: 0.3,
    transparent: true,
    opacity: 0.72,
  });

  const dermalNodes: THREE.Object3D[] = [];

  // Continuous Parametric Trefoil / Helical Vascular Core sheathed inside the translucent anatomy
  const vascularKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(
      innerSheathedRadius * 0.52,
      Math.max(0.005, innerSheathedRadius * 0.11),
      28,
      6,
      2,
      3
    ),
    vascularMat
  );
  overlay.add(vascularKnot);
  dermalNodes.push(vascularKnot);

  overlay.userData.dermalNodes = dermalNodes;
  overlay.userData.scaleMat = scaleMat;
  overlay.userData.vascularMat = vascularMat;
  return overlay;
}

const HEATMAP_TENSION_COLOR = new THREE.Color('#22d3ee');
const HEATMAP_COMPRESSION_COLOR = new THREE.Color('#f43f5e');
const HEATMAP_NEUTRAL_COLOR = new THREE.Color('#10b981');
const TEMP_COLOR = new THREE.Color();

/**
 * Lightweight O(1) Material & Sheathed-Core State Updater (Zero CPU per-vertex loops!).
 * Keeps frame times under 1ms so camera POV and locomotion never lag.
 */
export function updateSkinTopologyAndDeformation(
  rootGroup: THREE.Object3D,
  style: SkinTopologyStyle,
  animTime: number,
  params: {
    flexionAngle: number;
    locomotionSpeed: number;
    muscleStiffness: number;
    windSpeed: number;
    stunIntensity: number;
    entrainmentCoherence: number;
    strainHeatmapEnabled?: boolean;
  }
): SkinTopologyTelemetry {
  const meta = SKIN_TOPOLOGY_CATALOG[style];

  const epidermalTensionStrain = THREE.MathUtils.clamp(
    Math.abs(params.flexionAngle) * 0.52 +
      Math.min(1, params.locomotionSpeed / 10) * 0.35 +
      params.entrainmentCoherence * 0.15,
    0.04,
    1.0
  );

  const compressionWrinkleDepth = THREE.MathUtils.clamp(
    Math.abs(params.flexionAngle) * 0.68 +
      (1 - params.muscleStiffness) * 0.25 +
      Math.abs(Math.sin(animTime * 3.2)) * 0.12,
    0.05,
    1.0
  );

  const myofibrilBulgeRatio = THREE.MathUtils.clamp(
    params.muscleStiffness * 0.55 +
      Math.min(1, params.locomotionSpeed / 9) * 0.38 +
      Math.sin(animTime * 4.5) * 0.07,
    0.08,
    1.0
  );

  const subsurfaceVascularFlush = THREE.MathUtils.clamp(
    params.entrainmentCoherence * 0.55 +
      Math.min(1, params.locomotionSpeed / 8) * 0.32 +
      0.15 +
      Math.sin(animTime * 2.8) * 0.08,
    0.1,
    1.0
  );

  const piloerectionScaleFlare = THREE.MathUtils.clamp(
    Math.min(1, params.windSpeed / 18) * 0.58 +
      params.stunIntensity * 0.65 +
      params.entrainmentCoherence * 0.2,
    0.02,
    1.0
  );

  const chromatophoreWaveHz = Number(
    (
      1.8 +
      params.entrainmentCoherence * 3.4 +
      Math.min(2.5, params.locomotionSpeed * 0.25)
    ).toFixed(2)
  );

  let activeDermalInteraction = 'Typographic Ridge / Graffiti-Dirt Equilibrium';
  if (params.stunIntensity > 0.25) {
    activeDermalInteraction = 'Aerosol-Grit Spatter Shock & Serif Bristling';
  } else if (params.entrainmentCoherence > 0.62) {
    activeDermalInteraction = 'Calligraphic Ligature & Subsurface Entrainment';
  } else if (params.windSpeed > 11.5) {
    activeDermalInteraction = 'Wind-Weathered Soot Erosion & Spur Flare';
  } else if (compressionWrinkleDepth > 0.58) {
    activeDermalInteraction = 'Deep Ink-Trap Crevice Compression';
  } else if (myofibrilBulgeRatio > 0.62) {
    activeDermalInteraction = 'Bold Stroke-Weight Sarcomere Swell';
  }

  // Cache material & overlay list on rootGroup.userData on first pass so we don't even traverse the tree every frame!
  let cachedMats = rootGroup.userData._cachedSkinMats as
    | THREE.MeshPhysicalMaterial[]
    | undefined;
  let cachedOverlays = rootGroup.userData._cachedDermalOverlays as
    | THREE.Object3D[]
    | undefined;

  if (!cachedMats || !cachedOverlays) {
    cachedMats = [];
    cachedOverlays = [];
    rootGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const m = obj.material as THREE.MeshPhysicalMaterial;
        if (m && m.userData?.isComplexSkinMaterial && !cachedMats!.includes(m)) {
          cachedMats!.push(m);
        }
      }
      if (obj.userData?.isDermalOverlay) {
        cachedOverlays!.push(obj);
      }
    });
    rootGroup.userData._cachedSkinMats = cachedMats;
    rootGroup.userData._cachedDermalOverlays = cachedOverlays;
  }

  for (let mIdx = 0; mIdx < cachedMats.length; mIdx++) {
    const mat = cachedMats[mIdx];
    const baseColor = mat.userData.baseColor as THREE.Color;
    const glowColor = mat.userData.glowColor as THREE.Color;
    const baseRoughness = (mat.userData.baseRoughness as number) ?? 0.4;
    const baseBump = (mat.userData.baseBumpScale as number) ?? 0.05;

    mat.bumpScale =
      baseBump *
      (0.85 + compressionWrinkleDepth * 0.9 + piloerectionScaleFlare * 0.5);
    mat.roughness = THREE.MathUtils.clamp(
      baseRoughness +
        compressionWrinkleDepth * 0.14 -
        epidermalTensionStrain * 0.1,
      0.08,
      0.95
    );

    if (params.strainHeatmapEnabled) {
      const strainDelta = epidermalTensionStrain - compressionWrinkleDepth;
      if (strainDelta >= 0) {
        TEMP_COLOR.copy(HEATMAP_NEUTRAL_COLOR).lerp(
          HEATMAP_TENSION_COLOR,
          Math.min(1, strainDelta * 2.2 + 0.35)
        );
      } else {
        TEMP_COLOR.copy(HEATMAP_NEUTRAL_COLOR).lerp(
          HEATMAP_COMPRESSION_COLOR,
          Math.min(1, Math.abs(strainDelta) * 2.2 + 0.35)
        );
      }
      mat.color.copy(TEMP_COLOR);
      mat.emissive.copy(TEMP_COLOR);
      mat.emissiveIntensity = 0.75;
    } else if (baseColor && glowColor) {
      mat.color.copy(baseColor);
      mat.emissive.copy(glowColor);
      mat.emissiveIntensity =
        0.12 + subsurfaceVascularFlush * 0.35 + piloerectionScaleFlare * 0.18;
    }
  }

  for (let oIdx = 0; oIdx < cachedOverlays.length; oIdx++) {
    const obj = cachedOverlays[oIdx];
    const nodes = obj.userData.dermalNodes as THREE.Object3D[] | undefined;
    if (nodes) {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const wave = Math.sin(animTime * chromatophoreWaveHz * 1.8 + i * 1.1);
        if (i === 0) {
          node.rotation.x = animTime * 0.8 + params.flexionAngle * 0.4;
          node.rotation.y = animTime * 1.1;
          node.scale.setScalar(
            1.0 + subsurfaceVascularFlush * 0.14 + wave * 0.05
          );
        } else {
          const pleatIdx = (node.userData.pleatIndex as number) ?? 0;
          node.rotation.z = animTime * 0.6 * pleatIdx;
          node.scale.setScalar(1.0 + myofibrilBulgeRatio * 0.12 + wave * 0.04);
        }
      }
    }
  }

  return {
    style,
    styleLabel: meta.label,
    epidermalTensionStrain: Number(epidermalTensionStrain.toFixed(2)),
    compressionWrinkleDepth: Number(compressionWrinkleDepth.toFixed(2)),
    myofibrilBulgeRatio: Number(myofibrilBulgeRatio.toFixed(2)),
    subsurfaceVascularFlush: Number(subsurfaceVascularFlush.toFixed(2)),
    piloerectionScaleFlare: Number(piloerectionScaleFlare.toFixed(2)),
    chromatophoreWaveHz,
    activeDermalInteraction,
  };
}
