import * as THREE from 'three';
import {
  InterdimensionalChemicalElement,
  StateOfMatter,
} from '../types/manifold';

/**
 * THE INTERDIMENSIONAL PERIODIC TABLE & CHEMICAL ALGORITHM INDEX
 * Defines 7 distinct xenochemical elemental baselines across the dimensional spectrum (D1 to D7+),
 * each with authentic states of matter, micro-grain dimensions, friction, restitution, and PBR traits.
 */
export const INTERDIMENSIONAL_PERIODIC_TABLE: InterdimensionalChemicalElement[] = [
  {
    id: 'elem-d1-piezo',
    symbol: 'Ψ₁-Te',
    name: 'Chrono-Telluride / Piezo-Silicate',
    dimensionIndex: 1,
    atomicMass: 124.6,
    stateOfMatter: 'solid-crystalline-lattice',
    grainSizeMicrons: 450, // Coarse crystalline facets
    frictionCoefficient: 0.26, // Slick vitreous crystal plane
    restitution: 0.78, // High elastic bounce
    hardnessMohs: 8.5,
    primaryColor: '#475569',
    specularSheen: '#38bdf8',
    reactionAffinity: 'Piezoelectric Harmonic Resonator',
    miningYieldResId: 'vitreous-aether',
    energyConductivity: 0.94,
    lore: 'Rigid interlinked tetrahedral silica-telluride crystals vibrating at quantum frequencies. Fractures along planar cleavage lines.',
  },
  {
    id: 'elem-d2-ferro',
    symbol: 'Φ₂-Hg',
    name: 'Hydrargyrum-Plasm / Magneto-Colloid',
    dimensionIndex: 2,
    atomicMass: 200.59,
    stateOfMatter: 'viscous-ferro-superfluid',
    grainSizeMicrons: 12, // Sub-microscopic magnetic colloids
    frictionCoefficient: 0.84, // Heavy viscous fluid drag
    restitution: 0.04, // Dead fluid absorption
    hardnessMohs: 1.2,
    primaryColor: '#4b5563',
    specularSheen: '#94a3b8',
    reactionAffinity: 'Paramagnetic Flux Fluid',
    miningYieldResId: 'ferro-chitin',
    energyConductivity: 0.88,
    lore: 'A dense, mirror-reflective ferro-superfluid that pools in valleys with thick meniscus tension, rippling under planetary electromagnetic tides.',
  },
  {
    id: 'elem-d3-aerogel',
    symbol: 'Θ₃-Zeo',
    name: 'Aether-Zeolite / Sub-Zero Phlogiston',
    dimensionIndex: 3,
    atomicMass: 42.1,
    stateOfMatter: 'vesicular-pumice-aerogel',
    grainSizeMicrons: 28, // Micro-porous foam cells
    frictionCoefficient: 1.14, // Ultra-high traction and surface roughness
    restitution: 0.32,
    hardnessMohs: 2.8,
    primaryColor: '#57534e',
    specularSheen: '#ca8a04',
    reactionAffinity: 'Vesicular Gas Entrapment Sponge',
    miningYieldResId: 'biolum-mycelium',
    energyConductivity: 0.72,
    lore: 'Extremely lightweight, porous vesicular matter filled with trapped zero-point gas bubbles. Dampens acoustic shockwaves and cushions kinetic impacts.',
  },
  {
    id: 'elem-d4-fermion',
    symbol: 'Ω₄-FeQ',
    name: 'Bose-Einstein Fermion Glass',
    dimensionIndex: 4,
    atomicMass: 289.4,
    stateOfMatter: 'quantum-condensate-strata',
    grainSizeMicrons: 0.5, // Sub-atomic condensate coherence
    frictionCoefficient: 0.42,
    restitution: 0.02, // Quantum-locked dead impact
    hardnessMohs: 9.4,
    primaryColor: '#c084fc',
    specularSheen: '#a855f7',
    reactionAffinity: 'Cherenkov Light Conductor',
    miningYieldResId: 'calcified-memory',
    energyConductivity: 0.99,
    lore: 'Coherent atomic condensate frozen at fractional kelvin temperatures, emitting pale violet Cherenkov glow when stressed. Highly receptive to 5D gravity wells.',
  },
  {
    id: 'elem-d5-regolith',
    symbol: 'Σ₅-Bas',
    name: 'Heavy-Isotope Basaltic Regolith',
    dimensionIndex: 5,
    atomicMass: 156.2,
    stateOfMatter: 'hyper-granular-regolith',
    grainSizeMicrons: 180, // Planetary silt and sand grains
    frictionCoefficient: 0.66,
    restitution: 0.22,
    hardnessMohs: 4.8,
    primaryColor: '#ea580c',
    specularSheen: '#f97316',
    reactionAffinity: 'Granular Avalanche Matrix',
    miningYieldResId: 'ferro-chitin',
    energyConductivity: 0.64,
    lore: 'Weathered pulverized planetary crust composed of heavy iron-magnesium silicate granules. Kicks up billows of reddish soil particles upon wheel or boot contact.',
  },
  {
    id: 'elem-d6-fulgurite',
    symbol: 'Γ₆-Obs',
    name: 'Superheated Fulgurite Obsidian',
    dimensionIndex: 6,
    atomicMass: 242.0,
    stateOfMatter: 'vitreous-plasma-glass',
    grainSizeMicrons: 5, // Amorphous fused glass
    frictionCoefficient: 0.36,
    restitution: 0.62,
    hardnessMohs: 7.8,
    primaryColor: '#090d16',
    specularSheen: '#f59e0b',
    reactionAffinity: 'Thermal Magma Conduit',
    miningYieldResId: 'vitreous-aether',
    energyConductivity: 0.85,
    lore: 'Vitrified volcanic obsidian fused by atmospheric plasma lightning strikes. Razor-sharp vitreous fractures with incandescent magma filaments coursing below.',
  },
  {
    id: 'elem-d7-void',
    symbol: 'Λ∞-Drk',
    name: 'Void-Folded Singularity Matter',
    dimensionIndex: 7,
    atomicMass: 999.9,
    stateOfMatter: 'solid-crystalline-lattice',
    grainSizeMicrons: 0.01,
    frictionCoefficient: 0.12, // Frictionless anti-gravity slipstream
    restitution: 0.94, // Super-elastic recoil
    hardnessMohs: 10.0,
    primaryColor: '#1e1b4b',
    specularSheen: '#818cf8',
    reactionAffinity: 'Metric Inversion Core',
    miningYieldResId: 'void-singularity-dust',
    energyConductivity: 1.0,
    lore: 'Compressed dark baryon matter stabilized by micro-singularity tidal forces. Levitates loose debris and warps local gravitational geodesics.',
  },
];

/**
 * Resolves the xenochemical element and physical soil profile corresponding to a continuous dimensional index (1.0 to 7.0+).
 */
export function resolveChemicalElementForDimension(dimIndex: number): InterdimensionalChemicalElement {
  const clamped = Math.max(1, Math.min(7, dimIndex));
  const floorIdx = Math.floor(clamped);
  const ceilIdx = Math.min(7, floorIdx + 1);
  const t = clamped - floorIdx;

  const baseElem = INTERDIMENSIONAL_PERIODIC_TABLE[floorIdx - 1];
  const nextElem = INTERDIMENSIONAL_PERIODIC_TABLE[ceilIdx - 1];

  if (t === 0 || floorIdx === ceilIdx) {
    return baseElem;
  }

  // Interpolate physical properties for seamless spectrum transitioning
  const blendedFriction = baseElem.frictionCoefficient * (1 - t) + nextElem.frictionCoefficient * t;
  const blendedRestitution = baseElem.restitution * (1 - t) + nextElem.restitution * t;
  const blendedHardness = baseElem.hardnessMohs * (1 - t) + nextElem.hardnessMohs * t;
  const blendedConductivity = baseElem.energyConductivity * (1 - t) + nextElem.energyConductivity * t;
  const blendedGrain = Math.round(baseElem.grainSizeMicrons * (1 - t) + nextElem.grainSizeMicrons * t);

  const baseCol = new THREE.Color(baseElem.primaryColor);
  const nextCol = new THREE.Color(nextElem.primaryColor);
  const blendedColorHex = '#' + baseCol.lerp(nextCol, t).getHexString();

  const baseSheen = new THREE.Color(baseElem.specularSheen);
  const nextSheen = new THREE.Color(nextElem.specularSheen);
  const blendedSheenHex = '#' + baseSheen.lerp(nextSheen, t).getHexString();

  return {
    ...baseElem,
    id: `elem-blend-${dimIndex.toFixed(2)}`,
    symbol: t < 0.5 ? baseElem.symbol : nextElem.symbol,
    name: t < 0.5 ? baseElem.name : nextElem.name,
    dimensionIndex: Number(dimIndex.toFixed(2)),
    grainSizeMicrons: blendedGrain,
    frictionCoefficient: Number(blendedFriction.toFixed(3)),
    restitution: Number(blendedRestitution.toFixed(3)),
    hardnessMohs: Number(blendedHardness.toFixed(1)),
    energyConductivity: Number(blendedConductivity.toFixed(3)),
    primaryColor: blendedColorHex,
    specularSheen: blendedSheenHex,
    stateOfMatter: t < 0.5 ? baseElem.stateOfMatter : nextElem.stateOfMatter,
    lore: `Interstitial blend across Dimension ${floorIdx} and ${ceilIdx}. Transitioning from ${baseElem.stateOfMatter} into ${nextElem.stateOfMatter}.`,
  };
}

/**
 * Cache of procedural PBR texture sets per state of matter.
 */
interface StateOfMatterTextureSet {
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  aoMap: THREE.CanvasTexture;
}

const textureCache = new Map<StateOfMatter, StateOfMatterTextureSet>();

/**
 * Generates tailored seamless PBR textures specifically tuned to the physical state of matter:
 * - Crystalline: Sharp geometric Voronoi cleavage facets
 * - Superfluid: Smooth viscous meniscus fluid ripple patterns
 * - Pumice Aerogel: High-frequency porous micro-cavities & vesicles
 * - Quantum Condensate: Planar non-Euclidean crystalline bands
 * - Granular Regolith: Multi-scale silt and sand grain noise
 * - Vitreous Plasma Glass: Smooth mirror obsidian with fracture cracks
 */
export function getProceduralStateOfMatterTextures(state: StateOfMatter): StateOfMatterTextureSet {
  const existing = textureCache.get(state);
  if (existing) return existing;

  const size = 128;
  const nCanvas = document.createElement('canvas');
  nCanvas.width = size;
  nCanvas.height = size;
  const nCtx = nCanvas.getContext('2d')!;
  const nImg = nCtx.createImageData(size, size);

  const rCanvas = document.createElement('canvas');
  rCanvas.width = size;
  rCanvas.height = size;
  const rCtx = rCanvas.getContext('2d')!;
  const rImg = rCtx.createImageData(size, size);

  const aoCanvas = document.createElement('canvas');
  aoCanvas.width = size;
  aoCanvas.height = size;
  const aoCtx = aoCanvas.getContext('2d')!;
  const aoImg = aoCtx.createImageData(size, size);

  const heightfield = new Float32Array(size * size);

  for (let y = 0; y < size; y++) {
    const ny = (y / size) * Math.PI * 2;
    for (let x = 0; x < size; x++) {
      const nx = (x / size) * Math.PI * 2;
      const idx = y * size + x;

      let val = 0;

      if (state === 'solid-crystalline-lattice') {
        // Faceted crystal cleavage: Triangular/hexagonal planar cuts
        const p1 = Math.sin(nx * 4) * Math.cos(ny * 4);
        const p2 = Math.sin(nx * 8 + ny * 6) * 0.5;
        val = Math.abs(p1 + p2);
      } else if (state === 'viscous-ferro-superfluid') {
        // Fluid meniscus ripples and gentle magnetic swells
        const r1 = Math.sin(Math.sqrt(nx * nx + ny * ny) * 5);
        const r2 = Math.sin(nx * 3 - ny * 3) * 0.4;
        val = (r1 + r2) * 0.5 + 0.5;
      } else if (state === 'vesicular-pumice-aerogel') {
        // Ultra-porous vesicular sponge with cellular pockets
        const f1 = Math.sin(nx * 12) * Math.sin(ny * 12);
        const f2 = Math.cos(nx * 24 + ny * 18) * 0.35;
        val = Math.max(0, (f1 + f2 + 1.0) * 0.5);
      } else if (state === 'quantum-condensate-strata') {
        // Planar quantum wave interference
        const q1 = Math.sin(nx * 6 + Math.sin(ny * 4));
        const q2 = Math.cos(ny * 8);
        val = (q1 + q2 + 2) * 0.25;
      } else if (state === 'hyper-granular-regolith') {
        // Silt and sand grain noise with wind-blown ripples
        const g1 = Math.sin(nx * 16 + ny * 4) * 0.6;
        const g2 = (Math.random() - 0.5) * 0.4;
        val = (g1 + g2 + 1.0) * 0.5;
      } else {
        // Vitreous plasma glass: mostly smooth with razor fractures
        const crack = Math.abs(Math.sin(nx * 3 + ny * 2)) < 0.08 ? 0.9 : 0.1;
        val = crack;
      }

      heightfield[idx] = val;
    }
  }

  // Generate Normal, Roughness, and AO maps from heightfield
  const bump = state === 'solid-crystalline-lattice' ? 5.5 : state === 'viscous-ferro-superfluid' ? 2.0 : 4.0;

  for (let y = 0; y < size; y++) {
    const yp = (y - 1 + size) % size;
    const yn = (y + 1) % size;
    for (let x = 0; x < size; x++) {
      const xp = (x - 1 + size) % size;
      const xn = (x + 1) % size;
      const idx = y * size + x;
      const pIdx = idx * 4;

      const hl = heightfield[y * size + xp];
      const hr = heightfield[y * size + xn];
      const ht = heightfield[yp * size + x];
      const hb = heightfield[yn * size + x];
      const hc = heightfield[idx];

      const dx = (hr - hl) * bump;
      const dy = (hb - ht) * bump;
      const dz = 1.0;
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1.0;

      // Normal map
      nImg.data[pIdx] = Math.floor((-dx / len * 0.5 + 0.5) * 255);
      nImg.data[pIdx + 1] = Math.floor((-dy / len * 0.5 + 0.5) * 255);
      nImg.data[pIdx + 2] = Math.floor((dz / len * 0.5 + 0.5) * 255);
      nImg.data[pIdx + 3] = 255;

      // Roughness map based on state
      let rVal = 180;
      if (state === 'viscous-ferro-superfluid') {
        rVal = Math.floor(THREE.MathUtils.clamp((0.15 + hc * 0.2) * 255, 30, 95)); // Mirror liquid
      } else if (state === 'solid-crystalline-lattice') {
        rVal = Math.floor(THREE.MathUtils.clamp((0.25 + hc * 0.3) * 255, 45, 140)); // Vitreous
      } else if (state === 'vesicular-pumice-aerogel') {
        rVal = Math.floor(THREE.MathUtils.clamp((0.85 + hc * 0.15) * 255, 200, 255)); // Matte sponge
      } else if (state === 'vitreous-plasma-glass') {
        rVal = Math.floor(THREE.MathUtils.clamp((0.18 + hc * 0.25) * 255, 35, 110));
      } else {
        rVal = Math.floor(THREE.MathUtils.clamp((0.65 + hc * 0.2) * 255, 120, 220));
      }
      rImg.data[pIdx] = rVal;
      rImg.data[pIdx + 1] = rVal;
      rImg.data[pIdx + 2] = rVal;
      rImg.data[pIdx + 3] = 255;

      // AO map
      const aoVal = Math.floor(THREE.MathUtils.clamp((0.4 + hc * 0.6) * 255, 80, 255));
      aoImg.data[pIdx] = aoVal;
      aoImg.data[pIdx + 1] = aoVal;
      aoImg.data[pIdx + 2] = aoVal;
      aoImg.data[pIdx + 3] = 255;
    }
  }

  nCtx.putImageData(nImg, 0, 0);
  rCtx.putImageData(rImg, 0, 0);
  aoCtx.putImageData(aoImg, 0, 0);

  const normalMap = new THREE.CanvasTexture(nCanvas);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(16, 16);
  normalMap.colorSpace = THREE.NoColorSpace;

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(16, 16);
  roughnessMap.colorSpace = THREE.NoColorSpace;

  const aoMap = new THREE.CanvasTexture(aoCanvas);
  aoMap.wrapS = THREE.RepeatWrapping;
  aoMap.wrapT = THREE.RepeatWrapping;
  aoMap.repeat.set(16, 16);
  aoMap.colorSpace = THREE.NoColorSpace;

  const set: StateOfMatterTextureSet = { normalMap, roughnessMap, aoMap };
  textureCache.set(state, set);
  return set;
}

/**
 * Applies a complete, photorealistic PBR ground overhaul across the main terrain mesh and procedural sector meshes
 * whenever the dimension range shifts!
 */
export function applyDimensionalGroundOverhaul(
  terrainMesh: THREE.Mesh | null,
  sectorTerrainMeshes: THREE.Mesh[],
  dimIndex: number
) {
  const elem = resolveChemicalElementForDimension(dimIndex);
  const textures = getProceduralStateOfMatterTextures(elem.stateOfMatter);

  const intDim = Math.max(1, Math.min(7, Math.round(dimIndex)));

  // Grounded, high-contrast dimensional PBR differentiation (zero self-emissive wash-out so directional shadows & craters read clearly)
  let targetRoughness = 0.76;
  let targetMetalness = 0.14;
  let normalScale = 2.2;
  let envIntensity = 0.22;
  let emissiveCol = new THREE.Color('#000000');
  let emissiveIntensity = 0.0;

  if (intDim === 1) {
    // D1: Crystalline Hyperbolic Saddle - dark slate-quartz with crisp facets
    targetRoughness = 0.64;
    targetMetalness = 0.22;
    normalScale = 2.6;
    envIntensity = 0.24;
  } else if (intDim === 2) {
    // D2: Viscous Ferro-Superfluid - dark gunmetal ferro-basalt
    targetRoughness = 0.52;
    targetMetalness = 0.48;
    normalScale = 1.6;
    envIntensity = 0.28;
  } else if (intDim === 3) {
    // D3: Aether-Zeolite Aerogel - matte porous pumice stone
    targetRoughness = 0.92;
    targetMetalness = 0.05;
    normalScale = 2.0;
    envIntensity = 0.16;
  } else if (intDim === 4) {
    // D4: Quantum Fermion Condensate - dark indigo-violet slate
    targetRoughness = 0.62;
    targetMetalness = 0.32;
    normalScale = 2.2;
    envIntensity = 0.24;
  } else if (intDim === 5) {
    // D5: Basaltic Heavy Regolith - rough volcanic iron-sand
    targetRoughness = 0.88;
    targetMetalness = 0.15;
    normalScale = 3.0;
    envIntensity = 0.18;
  } else if (intDim === 6) {
    // D6: Fulgurite Vitreous Magma - dark volcanic obsidian
    targetRoughness = 0.58;
    targetMetalness = 0.35;
    normalScale = 2.5;
    envIntensity = 0.24;
    emissiveCol = new THREE.Color('#7c2d12');
    emissiveIntensity = 0.04;
  } else {
    // D7: Void Singularity - deep obsidian-indigo baryon stone
    targetRoughness = 0.6;
    targetMetalness = 0.38;
    normalScale = 2.8;
    envIntensity = 0.25;
  }

  const colorPrimary = new THREE.Color('#94a3b8').lerp(
    new THREE.Color(elem.primaryColor),
    0.35
  );

  const updateMat = (mesh: THREE.Mesh) => {
    if (!mesh.material) return;
    const mat = mesh.material as THREE.MeshStandardMaterial;

    mat.normalMap = textures.normalMap;
    mat.roughnessMap = textures.roughnessMap;
    mat.aoMap = textures.aoMap;
    mat.roughness = targetRoughness;
    mat.metalness = targetMetalness;
    mat.normalScale.set(normalScale, normalScale);
    mat.envMapIntensity = envIntensity;
    mat.color.copy(colorPrimary);
    mat.emissive.copy(emissiveCol);
    mat.emissiveIntensity = emissiveIntensity;
    mat.needsUpdate = true;
  };

  if (terrainMesh) {
    updateMat(terrainMesh);
  }

  for (const sMesh of sectorTerrainMeshes) {
    updateMat(sMesh);
  }
}

/**
 * Interactive Dimension-Specific Soil Particle Emitter Rig:
 * Emits reactive particles from boots, landing impacts, or vehicle skids matching the local xenochemical grains:
 * - Crystalline: Glittering shard prisms
 * - Ferro-Superfluid: Liquid mercury globule splashes
 * - Pumice Aerogel: Billowing porous dust puffs
 * - Condensate: Violet Cherenkov ionization sparks
 * - Regolith: Reddish-brown silt sand clouds
 */
export class DimensionalSoilParticleRig {
  public points: THREE.Points;
  private particleCount = 220;
  private positions: Float32Array;
  private velocities: Float32Array;
  private lifespans: Float32Array;
  private currentElem: InterdimensionalChemicalElement;

  constructor(initialDimIndex = 1.0) {
    this.currentElem = resolveChemicalElementForDimension(initialDimIndex);
    this.positions = new Float32Array(this.particleCount * 3);
    this.velocities = new Float32Array(this.particleCount * 3);
    this.lifespans = new Float32Array(this.particleCount);

    // Initialize all offscreen / inactive
    for (let i = 0; i < this.particleCount; i++) {
      this.positions[i * 3 + 1] = -999;
      this.lifespans[i] = 0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    const mat = new THREE.PointsMaterial({
      color: new THREE.Color(this.currentElem.specularSheen),
      size: 0.22,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
  }

  public setDimension(dimIndex: number) {
    this.currentElem = resolveChemicalElementForDimension(dimIndex);
    const mat = this.points.material as THREE.PointsMaterial;
    mat.color.set(this.currentElem.specularSheen);
    mat.size = this.currentElem.grainSizeMicrons > 200 ? 0.32 : 0.18;
  }

  public emitFootstepBurst(origin: THREE.Vector3, velocityDir: THREE.Vector3, intensity = 1.0) {
    const burstCount = Math.min(18, Math.floor(10 * intensity));
    let spawned = 0;

    for (let i = 0; i < this.particleCount && spawned < burstCount; i++) {
      if (this.lifespans[i] <= 0) {
        const idx = i * 3;
        this.positions[idx] = origin.x + (Math.random() - 0.5) * 0.4;
        this.positions[idx + 1] = origin.y + 0.05;
        this.positions[idx + 2] = origin.z + (Math.random() - 0.5) * 0.4;

        const upward = Math.random() * 2.2 * intensity;
        const spreadX = (Math.random() - 0.5) * 1.5 - velocityDir.x * 0.4;
        const spreadZ = (Math.random() - 0.5) * 1.5 - velocityDir.z * 0.4;

        this.velocities[idx] = spreadX;
        this.velocities[idx + 1] = upward;
        this.velocities[idx + 2] = spreadZ;

        this.lifespans[i] = 0.45 + Math.random() * 0.35;
        spawned++;
      }
    }
  }

  public update(dt: number) {
    const posAttr = this.points.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;
    const gravity = -9.8;

    for (let i = 0; i < this.particleCount; i++) {
      if (this.lifespans[i] > 0) {
        this.lifespans[i] -= dt;
        const idx = i * 3;

        // Apply velocities
        array[idx] += this.velocities[idx] * dt;
        array[idx + 1] += this.velocities[idx + 1] * dt;
        array[idx + 2] += this.velocities[idx + 2] * dt;

        // Gravity & air drag
        this.velocities[idx + 1] += gravity * dt;
        this.velocities[idx] *= 0.94;
        this.velocities[idx + 2] *= 0.94;

        if (this.lifespans[i] <= 0) {
          array[idx + 1] = -999;
        }
      }
    }

    posAttr.needsUpdate = true;
  }
}
