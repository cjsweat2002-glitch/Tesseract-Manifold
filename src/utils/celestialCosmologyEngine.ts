import * as THREE from 'three';
import {
  CelestialCosmologySpec,
  CelestialPlanetaryShape,
  WorldTopologyArchetype,
} from '../types/manifold';

/**
 * 12 Distinct Celestial Cosmology Profiles corresponding to the expanded dimensional spectrum (D1 to D12+).
 * Each features authentic non-spherical cosmic architecture, relativistic accretion rings, or higher-dimensional manifolds.
 */
export const CELESTIAL_COSMOLOGY_PROFILES: CelestialCosmologySpec[] = [
  {
    id: 'cosmo-d1-torus',
    title: 'Planck-Torus Prime / 1D String Filament World',
    dimensionIndex: 1,
    celestialShape: 'toroidal-donut-planet',
    coreColor: '#38bdf8',
    ringColor: '#7dd3fc',
    coronaGlow: '#0284c7',
    orbitalRadius: 320,
    rotationPeriodSec: 140,
    gravitationalLensing: 0.72,
    cosmicDiscoveryTier: 1,
    atmosphereDensity: 0.95,
    outerSpaceTitle: 'Planck-Foam Quantum Filament Horizon',
    lore: 'A quantized pre-geometric ring-world where 1D cosmic strings weave a rotating toroidal probability horizon.',
  },
  {
    id: 'cosmo-d2-klein',
    title: 'Flatland-Klein / 2D Planar Ribbon Manifold',
    dimensionIndex: 2,
    celestialShape: 'mobius-halo-superstructure',
    coreColor: '#f43f5e',
    ringColor: '#fde047',
    coronaGlow: '#e11d48',
    orbitalRadius: 350,
    rotationPeriodSec: 90,
    gravitationalLensing: 0.35,
    cosmicDiscoveryTier: 2,
    atmosphereDensity: 0.62,
    outerSpaceTitle: 'Anamorphic Planar-Slice Expanse',
    lore: 'A razor-thin planar ribbon world whose inhabitants experience space as iridescent 2D cross-sections.',
  },
  {
    id: 'cosmo-d3-dyson',
    title: 'Hadal-Pelagios / Abyssal Hydro-Torus',
    dimensionIndex: 3,
    celestialShape: 'toroidal-donut-planet',
    coreColor: '#06b6d4',
    ringColor: '#2dd4bf',
    coronaGlow: '#0891b2',
    orbitalRadius: 340,
    rotationPeriodSec: 165,
    gravitationalLensing: 0.28,
    cosmicDiscoveryTier: 3,
    atmosphereDensity: 0.98,
    outerSpaceTitle: 'Bathyal Pressurized Pelagic Orbit',
    lore: 'An ocean-wrapped toroidal planet suspended in bioluminescent brine currents at 420 MPa hydrostatic pressure.',
  },
  {
    id: 'cosmo-d4-singularity',
    title: 'Gargantua-Scarpa / Kerr Brutalist Singularity',
    dimensionIndex: 4,
    celestialShape: 'accretion-singularity',
    coreColor: '#000000',
    ringColor: '#f97316',
    coronaGlow: '#fb923c',
    orbitalRadius: 400,
    rotationPeriodSec: 45,
    gravitationalLensing: 0.88,
    cosmicDiscoveryTier: 4,
    atmosphereDensity: 0.18,
    outerSpaceTitle: 'Photon Sphere Frame-Dragged Ergoregion',
    lore: 'A rotating Kerr black hole ringed by cyclopean concrete-basalt megastructures and relativistic Einstein rings.',
  },
  {
    id: 'cosmo-d5-pulsar',
    title: 'Chroma-Vettoria / Spectral Dyson Polyhedron',
    dimensionIndex: 5,
    celestialShape: 'dyson-polyhedron-swarm',
    coreColor: '#f43f5e',
    ringColor: '#a855f7',
    coronaGlow: '#ec4899',
    orbitalRadius: 365,
    rotationPeriodSec: 110,
    gravitationalLensing: 0.32,
    cosmicDiscoveryTier: 5,
    atmosphereDensity: 0.42,
    outerSpaceTitle: 'Quantized Vector-Prism Helio-Orbit',
    lore: 'Thousands of dichroic vector-glass solar sails splitting stellar light into quantized RGB laser highways.',
  },
  {
    id: 'cosmo-d6-mobius',
    title: 'Mycelia-Silicium / Tachyon Spore Knot',
    dimensionIndex: 6,
    celestialShape: 'klein-stellar-knot',
    coreColor: '#10b981',
    ringColor: '#eab308',
    coronaGlow: '#059669',
    orbitalRadius: 375,
    rotationPeriodSec: 95,
    gravitationalLensing: 0.48,
    cosmicDiscoveryTier: 6,
    atmosphereDensity: 0.76,
    outerSpaceTitle: 'Retrocausal Mycelial Spore Nebula',
    lore: 'A living biomechanical Klein-bottle world where fossilized silicon server cathedrals breathe tachyon spores.',
  },
  {
    id: 'cosmo-d7-tesseract',
    title: 'Octachoron-Prime / 4D Tesseractic Reliquary',
    dimensionIndex: 7,
    celestialShape: 'dyson-polyhedron-swarm',
    coreColor: '#a855f7',
    ringColor: '#fde047',
    coronaGlow: '#7e22ce',
    orbitalRadius: 395,
    rotationPeriodSec: 80,
    gravitationalLensing: 0.65,
    cosmicDiscoveryTier: 7,
    atmosphereDensity: 0.35,
    outerSpaceTitle: 'Orthogonal W-Axis Hyper-Sanctum',
    lore: 'An 8-cell hypercubic planetary reliquary continuously turning inside-out along the fourth spatial coordinate.',
  },
  {
    id: 'cosmo-d8-calabi',
    title: 'Calabi-Yau Quintic / 6D Holomorphic Fold',
    dimensionIndex: 8,
    celestialShape: 'calabi-yau-stellar-nexus',
    coreColor: '#818cf8',
    ringColor: '#f472b6',
    coronaGlow: '#4f46e5',
    orbitalRadius: 415,
    rotationPeriodSec: 70,
    gravitationalLensing: 0.82,
    cosmicDiscoveryTier: 8,
    atmosphereDensity: 0.25,
    outerSpaceTitle: 'Ricci-Flat 6D Compactified Horizon',
    lore: 'A 3D stereographic projection of a 6-dimensional Calabi-Yau manifold vibrating with holomorphic string harmonics.',
  },
  {
    id: 'cosmo-d9-twistor',
    title: 'Penrose-Twistor / Null-Geodesic Pulsar',
    dimensionIndex: 9,
    celestialShape: 'binary-pulsar-beam',
    coreColor: '#22d3ee',
    ringColor: '#f59e0b',
    coronaGlow: '#0891b2',
    orbitalRadius: 385,
    rotationPeriodSec: 22,
    gravitationalLensing: 0.92,
    cosmicDiscoveryTier: 9,
    atmosphereDensity: 0.14,
    outerSpaceTitle: 'Relativistic Light-Cone Spinor Continuum',
    lore: 'Twin co-orbiting twistor singularities sweeping null-geodesic lightcones that couple velocity directly to time dilation.',
  },
  {
    id: 'cosmo-d10-banach',
    title: 'Banach-Tarski / Self-Similar Paradox Swarm',
    dimensionIndex: 10,
    celestialShape: 'dyson-polyhedron-swarm',
    coreColor: '#34d399',
    ringColor: '#c084fc',
    coronaGlow: '#059669',
    orbitalRadius: 405,
    rotationPeriodSec: 65,
    gravitationalLensing: 0.58,
    cosmicDiscoveryTier: 10,
    atmosphereDensity: 0.45,
    outerSpaceTitle: 'Non-Measurable Recursive Set Archipelago',
    lore: 'A fractal planetary cluster that decomposes and reassembles into twin identical spheres via paradoxical rotations.',
  },
  {
    id: 'cosmo-d11-adscft',
    title: 'Maldacena-Bulk / AdS-CFT Holographic Horizon',
    dimensionIndex: 11,
    celestialShape: 'accretion-singularity',
    coreColor: '#1d4ed8',
    ringColor: '#2dd4bf',
    coronaGlow: '#3b82f6',
    orbitalRadius: 430,
    rotationPeriodSec: 55,
    gravitationalLensing: 0.95,
    cosmicDiscoveryTier: 11,
    atmosphereDensity: 0.15,
    outerSpaceTitle: 'Entangled Holographic Boundary Bulk',
    lore: 'A hyperbolic bulk interior projected entirely from quantum entanglement threads on its celestial boundary shell.',
  },
  {
    id: 'cosmo-d12-mbrane',
    title: 'Omniversal M-Brane / 11D Supergravity Crown',
    dimensionIndex: 12,
    celestialShape: 'calabi-yau-stellar-nexus',
    coreColor: '#fbbf24',
    ringColor: '#e879f9',
    coronaGlow: '#d97706',
    orbitalRadius: 445,
    rotationPeriodSec: 50,
    gravitationalLensing: 0.99,
    cosmicDiscoveryTier: 12,
    atmosphereDensity: 0.1,
    outerSpaceTitle: '11D M2/M5 Supermembrane Nexus',
    lore: 'The apex 11-dimensional supergravity intersection where M2 and M5 branes collide in dual-time harmonic resonance.',
  },
];

export function resolveCosmologyForDimension(dimIndex: number): CelestialCosmologySpec {
  const clamped = Math.max(
    1,
    Math.min(CELESTIAL_COSMOLOGY_PROFILES.length, Math.round(dimIndex))
  );
  return CELESTIAL_COSMOLOGY_PROFILES[clamped - 1];
}

export interface InnerWorldExpansionMetrics {
  sectorCount: number;
  excavationCount: number;
  exploredFrontierCount: number;
  playerAltitudeM: number;
  discoveryTier: number;
  infrastructureComplexity?: number;
  closedLoopPowerMW?: number;
}

/**
 * Procedural Parametric 4D Clifford Torus Geometry generator:
 * Maps the 4D Clifford Torus (S1 x S1 embedded in 4-space) stereographically into 3D,
 * tied to manifold topology styles with multi-harmonic procedural elevation and color stratification.
 * Scales segment resolution and displacement octaves dynamically with inner world expansion detail level.
 */
export function createCliffordTorusGeometry(
  majorRadius = 32,
  tubeRadius = 10,
  segmentsU = 48,
  segmentsV = 32,
  topology: WorldTopologyArchetype = 'crystalline-hyper-mesa',
  detailLevel = 1.0
): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  // Segments scale smoothly with detailLevel up to 2.8x
  const uCount = Math.floor(segmentsU * Math.min(2.8, Math.max(1.0, detailLevel)));
  const vCount = Math.floor(segmentsV * Math.min(2.8, Math.max(1.0, detailLevel)));
  const vertexCount = (uCount + 1) * (vCount + 1);

  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const colors = new Float32Array(vertexCount * 3);
  const indices: number[] = [];

  let ptr = 0;
  let uvPtr = 0;

  for (let i = 0; i <= uCount; i++) {
    const u = (i / uCount) * Math.PI * 2;
    const cosU = Math.cos(u);
    const sinU = Math.sin(u);

    for (let j = 0; j <= vCount; j++) {
      const v = (j / vCount) * Math.PI * 2;
      const cosV = Math.cos(v);
      const sinV = Math.sin(v);

      // Topology-specific multi-harmonic surface displacement & planetary color bands
      let displacement = 0;
      let colR = 0.3;
      let colG = 0.6;
      let colB = 0.9;

      if (topology === 'crystalline-hyper-mesa') {
        // Multi-frequency faceted crystal cleavage planes with stepped terrace plateaus
        const f1 = Math.sin(u * 6) * Math.cos(v * 6);
        const f2 = Math.sin(u * 18 + v * 12) * 0.32;
        const rawDisp = f1 + (detailLevel > 1.2 ? f2 : 0);
        // Quantize terraces for crystalline cleavage
        displacement = (Math.sign(rawDisp) * Math.pow(Math.abs(rawDisp), 0.75)) * 2.8 * Math.min(1.8, detailLevel);
        const iridescent = Math.sin(u * 3 + v * 5);
        colR = THREE.MathUtils.clamp(0.68 + rawDisp * 0.25 + iridescent * 0.1, 0.4, 1.0);
        colG = THREE.MathUtils.clamp(0.85 + rawDisp * 0.15, 0.5, 1.0);
        colB = 1.0;
      } else if (topology === 'quantum-basalt-trench') {
        // Hexagonal columnar basalt steps with glowing tectonic rift trenches
        const hex = Math.cos(u * 12) + Math.sin(v * 12);
        const rift = Math.sin(u * 3);
        const isRiftTrench = Math.abs(rift) < 0.25;
        displacement = (Math.floor(hex * 3) / 3) * 1.8 * Math.min(1.6, detailLevel);
        if (isRiftTrench) {
          displacement -= 1.6;
          colR = 0.1;
          colG = 0.85; // Quantum cyan fissure
          colB = 0.95;
        } else {
          colR = 0.18 + hex * 0.08;
          colG = 0.35 + hex * 0.08;
          colB = 0.65;
        }
      } else if (topology === 'gyro-lattice-basin') {
        // Concentric dual-spiral gyroscopic vortex ripples
        const wave1 = Math.sin(u * 4 + v * 8);
        const wave2 = Math.sin(u * 12 - v * 16) * 0.4;
        displacement = (wave1 + (detailLevel > 1.2 ? wave2 : 0)) * 1.6 * Math.min(1.5, detailLevel);
        colR = 0.2 + wave1 * 0.15;
        colG = 0.75 + wave1 * 0.18;
        colB = 0.8;
      } else if (topology === 'non-euclidean-spires') {
        // Hyperbolic saddle-point spires protruding outwards from equatorial perimeter
        const saddle = Math.sin(u * 8) * Math.cos(v * 4);
        const spike = Math.pow(Math.max(0, saddle), 2.2) * 4.2;
        displacement = (saddle * 1.2 + spike) * Math.min(1.8, detailLevel);
        colR = 0.72 + saddle * 0.25;
        colG = 0.2 + saddle * 0.15;
        colB = 0.95;
      } else if (topology === 'brutalist-pendulum-foundry') {
        // Monolithic stepped megastructure ribs & angular buttress cantilevers
        const rib = Math.cos(u * 16);
        const stepped = Math.floor(rib * 4) / 4;
        displacement = stepped * 2.4 * Math.min(1.6, detailLevel);
        colR = 0.45 + stepped * 0.2;
        colG = 0.38 + stepped * 0.15;
        colB = 0.32;
      } else if (topology === 'biomech-coral-atoll') {
        // Porous cellular spongiform hollows & bioluminescent coral filaments
        const porous = Math.sin(u * 8) * Math.cos(v * 8) + Math.sin(u * 16) * Math.sin(v * 16) * 0.5;
        displacement = porous * 1.9 * Math.min(1.7, detailLevel);
        colR = 0.15;
        colG = 0.72 + porous * 0.22;
        colB = 0.65 + porous * 0.25;
      } else {
        // Default continental elevation displacement
        const n1 = Math.sin(u * 3) * Math.cos(v * 4);
        const n2 = Math.sin(u * 9 + v * 7) * 0.35;
        displacement = (n1 + n2) * 1.8 * Math.min(1.6, detailLevel);
        colR = 0.35 + n1 * 0.2;
        colG = 0.65;
        colB = 0.95;
      }

      const currentTube = Math.max(3, tubeRadius + displacement);
      const x = (majorRadius + currentTube * cosV) * cosU;
      const y = currentTube * sinV;
      const z = (majorRadius + currentTube * cosV) * sinU;

      positions[ptr] = x;
      positions[ptr + 1] = y;
      positions[ptr + 2] = z;

      // Surface normal pointing outwards from the central torus ring
      const cx = majorRadius * cosU;
      const cz = majorRadius * sinU;
      const dx = x - cx;
      const dy = y;
      const dz = z - cz;
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

      normals[ptr] = dx / len;
      normals[ptr + 1] = dy / len;
      normals[ptr + 2] = dz / len;

      colors[ptr] = THREE.MathUtils.clamp(colR, 0, 1);
      colors[ptr + 1] = THREE.MathUtils.clamp(colG, 0, 1);
      colors[ptr + 2] = THREE.MathUtils.clamp(colB, 0, 1);

      ptr += 3;

      uvs[uvPtr] = i / uCount;
      uvs[uvPtr + 1] = j / vCount;
      uvPtr += 2;
    }
  }

  const rowSize = vCount + 1;
  for (let i = 0; i < uCount; i++) {
    for (let j = 0; j < vCount; j++) {
      const a = i * rowSize + j;
      const b = (i + 1) * rowSize + j;
      const c = (i + 1) * rowSize + (j + 1);
      const d = i * rowSize + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setIndex(indices);
  return geo;
}

/**
 * Procedural Toroidal Planetary Atmospheric Cloud Shell:
 * Translucent concentric atmosphere with contra-rotating cloud bands.
 */
export function createToroidAtmosphereGeometry(
  majorRadius = 32,
  tubeRadius = 11.2,
  segmentsU = 36,
  segmentsV = 24
): THREE.BufferGeometry {
  const geo = new THREE.TorusGeometry(majorRadius, tubeRadius, segmentsV, segmentsU);
  return geo;
}

/**
 * Procedural Parametric 4D Klein-Bottle Surface generator:
 * Implements the continuous non-orientable immersion of the Klein bottle into 3-space,
 * with topological twist harmonics tied directly to the manifold archetype and detail level.
 * Features 4D hyperspace phase rotation theta4D for dynamic topological precession.
 */
export function createFigure8KleinBottleGeometry(
  scale = 26,
  segmentsU = 52,
  segmentsV = 36,
  topology: WorldTopologyArchetype = 'non-euclidean-spires',
  detailLevel = 1.0,
  theta4D = 0.0
): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const uCount = Math.floor(segmentsU * Math.min(2.8, Math.max(1.0, detailLevel)));
  const vCount = Math.floor(segmentsV * Math.min(2.8, Math.max(1.0, detailLevel)));
  const vertexCount = (uCount + 1) * (vCount + 1);

  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const colors = new Float32Array(vertexCount * 3);
  const indices: number[] = [];

  const r0 = 3.4;
  let ptr = 0;
  let uvPtr = 0;

  const cosTheta = Math.cos(theta4D);
  const sinTheta = Math.sin(theta4D);

  for (let i = 0; i <= uCount; i++) {
    const u = (i / uCount) * Math.PI * 2;
    const cosU = Math.cos(u);
    const sinU = Math.sin(u);
    const cosU2 = Math.cos(u / 2);
    const sinU2 = Math.sin(u / 2);

    for (let j = 0; j <= vCount; j++) {
      const v = (j / vCount) * Math.PI * 2;
      const sinV = Math.sin(v);
      const sin2V = Math.sin(2 * v);
      const cosV = Math.cos(v);

      // Topological modulation based on archetype
      let radMod = 0;
      let col = new THREE.Color('#c084fc');

      if (topology === 'non-euclidean-spires') {
        // Twisting hyperbolic filaments along the non-orientable neck
        radMod = Math.sin(u * 5 + v * 3) * 0.55 * Math.min(1.8, detailLevel);
        const tColor = (sinV + 1) * 0.5;
        col = new THREE.Color('#a855f7').lerp(new THREE.Color('#f472b6'), tColor);
      } else if (topology === 'crystalline-hyper-mesa') {
        // Faceted crystal plates along the single-sided boundary
        const crystalFolds = Math.sin(u * 6) * Math.cos(v * 4);
        radMod = Math.sign(crystalFolds) * Math.pow(Math.abs(crystalFolds), 0.8) * 0.6 * detailLevel;
        col = new THREE.Color('#38bdf8').lerp(new THREE.Color('#c084fc'), (cosU + 1) * 0.5);
      } else if (topology === 'quantum-basalt-trench') {
        // Deep quantum cooling seams radiating through self-intersection
        const seam = Math.abs(cosU2 * sinV - sinU2 * sin2V) < 0.2;
        radMod = Math.cos(u * 8) * 0.35;
        col = seam ? new THREE.Color('#22d3ee') : new THREE.Color('#64748b');
      } else if (topology === 'gyro-lattice-basin') {
        // Standing orbital wave harmonics
        radMod = Math.sin(u * 4 + v * 6) * 0.45;
        col = new THREE.Color('#06b6d4').lerp(new THREE.Color('#8b5cf6'), (sin2V + 1) * 0.5);
      } else if (topology === 'brutalist-pendulum-foundry') {
        // Structural interlocking containment ribs
        const rib = Math.floor(Math.cos(u * 12) * 3) / 3;
        radMod = rib * 0.45;
        col = new THREE.Color('#f97316').lerp(new THREE.Color('#78716c'), (sinV + 1) * 0.5);
      } else if (topology === 'biomech-coral-atoll') {
        // Bio-synthetic vesicular pores
        radMod = Math.cos(u * 8) * Math.sin(v * 8) * 0.55 * detailLevel;
        col = new THREE.Color('#38bdf8').lerp(new THREE.Color('#a855f7'), (cosU + 1) * 0.5);
      } else {
        radMod = Math.sin(u * 3) * 0.35;
        col = new THREE.Color('#818cf8');
      }

      const rad = (r0 + radMod) + cosU2 * sinV - sinU2 * sin2V;
      const x4 = rad * cosU * (scale * 0.14);
      const y4 = rad * sinU * (scale * 0.14);
      const z4 = (sinU2 * sinV + cosU2 * sin2V) * (scale * 0.14);
      const w4 = cosU2 * cosV * (scale * 0.14);

      // 4D-to-3D projection with phase rotation in X-W plane
      const x = x4 * cosTheta - w4 * sinTheta;
      const y = y4;
      const z = z4;

      positions[ptr] = x;
      positions[ptr + 1] = y;
      positions[ptr + 2] = z;

      // Analytical normal vector calculation for smooth dual-sided lighting
      const len = Math.sqrt(x * x + y * y + z * z) || 1;
      normals[ptr] = x / len;
      normals[ptr + 1] = y / len;
      normals[ptr + 2] = z / len;

      colors[ptr] = col.r;
      colors[ptr + 1] = col.g;
      colors[ptr + 2] = col.b;

      ptr += 3;

      uvs[uvPtr] = i / uCount;
      uvs[uvPtr + 1] = j / vCount;
      uvPtr += 2;
    }
  }

  const rowSize = vCount + 1;
  for (let i = 0; i < uCount; i++) {
    for (let j = 0; j < vCount; j++) {
      const a = i * rowSize + j;
      const b = (i + 1) * rowSize + j;
      const c = (i + 1) * rowSize + (j + 1);
      const d = i * rowSize + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setIndex(indices);
  return geo;
}

/**
 * Procedural Parametric Möbius-Halo Ribbon Superstructure (D6):
 * Single-sided non-orientable ribbon circling an orbital center with a 180-degree half-twist.
 */
export function createMobiusHaloGeometry(
  radius = 36,
  width = 9,
  segmentsU = 72,
  segmentsV = 16
): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const vertexCount = (segmentsU + 1) * (segmentsV + 1);
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const colors = new Float32Array(vertexCount * 3);
  const indices: number[] = [];

  let ptr = 0;
  let uvPtr = 0;

  for (let i = 0; i <= segmentsU; i++) {
    const u = (i / segmentsU) * Math.PI * 2;
    const cosU = Math.cos(u);
    const sinU = Math.sin(u);
    const halfU = u / 2;

    for (let j = 0; j <= segmentsV; j++) {
      const v = (j / segmentsV - 0.5) * width;
      const x = (radius + v * Math.cos(halfU)) * cosU;
      const y = (radius + v * Math.cos(halfU)) * sinU;
      const z = v * Math.sin(halfU);

      positions[ptr] = x;
      positions[ptr + 1] = z;
      positions[ptr + 2] = y;

      const len = Math.sqrt(x * x + y * y + z * z) || 1;
      normals[ptr] = x / len;
      normals[ptr + 1] = z / len;
      normals[ptr + 2] = y / len;

      const col = new THREE.Color('#f59e0b').lerp(new THREE.Color('#fbbf24'), j / segmentsV);
      colors[ptr] = col.r;
      colors[ptr + 1] = col.g;
      colors[ptr + 2] = col.b;

      ptr += 3;

      uvs[uvPtr] = i / segmentsU;
      uvs[uvPtr + 1] = j / segmentsV;
      uvPtr += 2;
    }
  }

  const rowSize = segmentsV + 1;
  for (let i = 0; i < segmentsU; i++) {
    for (let j = 0; j < segmentsV; j++) {
      const a = i * rowSize + j;
      const b = (i + 1) * rowSize + j;
      const c = (i + 1) * rowSize + (j + 1);
      const d = i * rowSize + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setIndex(indices);
  return geo;
}

/**
 * Procedural Parametric 6D Calabi-Yau Quintic Threefold Projection (D7):
 * Complex multi-sheeted manifold cross-section with Ricci-flat metric harmonics.
 */
export function createCalabiYauManifoldGeometry(
  scale = 30,
  segments = 48,
  detailLevel = 1.0
): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const uCount = Math.floor(segments * Math.min(2.5, detailLevel));
  const vCount = Math.floor(segments * Math.min(2.5, detailLevel));
  const vertexCount = (uCount + 1) * (vCount + 1);

  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const colors = new Float32Array(vertexCount * 3);
  const indices: number[] = [];

  let ptr = 0;
  let uvPtr = 0;

  const n = 5; // Quintic threefold power
  for (let i = 0; i <= uCount; i++) {
    const u = (i / uCount) * Math.PI * 2;
    for (let j = 0; j <= vCount; j++) {
      const v = (j / vCount) * Math.PI * 2;

      // Cross-sectional projection of z1^5 + z2^5 = 1
      const r = Math.pow(Math.abs(Math.cos((n / 2) * u)), 2 / n);
      const x = scale * r * Math.cos(u) * Math.sin(v);
      const y = scale * r * Math.sin(u) * Math.sin(v);
      const z = scale * Math.cos(v) * Math.cos(u * 2);

      positions[ptr] = x;
      positions[ptr + 1] = y;
      positions[ptr + 2] = z;

      const len = Math.sqrt(x * x + y * y + z * z) || 1;
      normals[ptr] = x / len;
      normals[ptr + 1] = y / len;
      normals[ptr + 2] = z / len;

      const col = new THREE.Color('#818cf8').lerp(new THREE.Color('#c7d2fe'), (Math.sin(u * 3) + 1) * 0.5);
      colors[ptr] = col.r;
      colors[ptr + 1] = col.g;
      colors[ptr + 2] = col.b;

      ptr += 3;

      uvs[uvPtr] = i / uCount;
      uvs[uvPtr + 1] = j / vCount;
      uvPtr += 2;
    }
  }

  const rowSize = vCount + 1;
  for (let i = 0; i < uCount; i++) {
    for (let j = 0; j < vCount; j++) {
      const a = i * rowSize + j;
      const b = (i + 1) * rowSize + j;
      const c = (i + 1) * rowSize + (j + 1);
      const d = i * rowSize + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setIndex(indices);
  return geo;
}

/**
 * Builds the comprehensive Procedural 3D Outer Space Cosmos & Non-Spherical Celestial Rig:
 * 1. Deep Space Multi-Spectral Starfield (1,400+ stars)
 * 2. Galactic Nebular Dust Veil
 * 3. 3D Toroidal Donut Planet tied to Manifold Topology with detail scaling and cloud bands
 * 4. 4D Klein-Bottle Stellar Knot with twisting coronal plasma filaments & 4D rotation precession
 * 5. Geodesic Dyson Polyhedral Swarm with collector arrays
 * 6. Relativistic Accretion Singularity (Black Hole with Doppler Beaming & Gravitational Lensing)
 * 7. Binary Pulsar Conduit
 * 8. Möbius-Halo Superstructure (D6)
 * 9. Calabi-Yau 6D Manifold Hyper-Body (D7)
 * 10. Dynamic Atmospheric Vacuum Transition
 */
export class CelestialCosmologyRig {
  public root: THREE.Group;
  public starfield: THREE.Points;
  public nebulaMesh: THREE.Mesh;
  public torusGroup: THREE.Group;
  public kleinGroup: THREE.Group;
  public dysonGroup: THREE.Group;
  public singularityGroup: THREE.Group;
  public pulsarGroup: THREE.Group;
  public mobiusGroup: THREE.Group;
  public calabiGroup: THREE.Group;

  // Detail scaling dynamic elements
  private torusMesh: THREE.Mesh;
  private torusAtmosphereMesh: THREE.Mesh;
  private torusRingsGroup: THREE.Group;
  private torusAuroralLoopsGroup: THREE.Group;
  private torusMoonsGroup: THREE.Group;

  private kleinMesh: THREE.Mesh;
  private kleinWireMesh: THREE.Mesh;
  private kleinCoronalJetsGroup: THREE.Group;
  private kleinCausticLineMesh: THREE.LineSegments | null = null;

  private currentShape: CelestialPlanetaryShape = 'toroidal-donut-planet';
  private currentSpec: CelestialCosmologySpec;
  private currentTopology: WorldTopologyArchetype = 'crystalline-hyper-mesa';
  private expansionScale = 1.0;
  private cosmicDiscoveryTier = 1;
  private detailFactor = 1.0;
  private theta4D = 0.0;
  private lastRebuildDetail = 1.0;

  constructor(initialDimIndex = 1.0, initialTopology: WorldTopologyArchetype = 'crystalline-hyper-mesa') {
    this.root = new THREE.Group();
    this.root.name = 'celestial-cosmology-root';
    this.currentTopology = initialTopology;
    this.currentSpec = resolveCosmologyForDimension(initialDimIndex);

    // 1. Deep-Space Multi-Spectral Starfield (1400 stars)
    const starCount = 1400;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const spectralPalettes = [
      new THREE.Color('#93c5fd'), // O/B class blue giants
      new THREE.Color('#f8fafc'), // A-class pure white
      new THREE.Color('#fde047'), // G-class yellow dwarf
      new THREE.Color('#fb923c'), // K-class orange
      new THREE.Color('#f87171'), // M-class red dwarf
    ];

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 500 + Math.random() * 80;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = Math.abs(r * Math.cos(phi)) + 15;
      const z = r * Math.sin(phi) * Math.sin(theta);

      starPositions[i * 3] = x;
      starPositions[i * 3 + 1] = y;
      starPositions[i * 3 + 2] = z;

      const col = spectralPalettes[Math.floor(Math.random() * spectralPalettes.length)];
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      vertexColors: true,
      size: 1.8,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.starfield = new THREE.Points(starGeo, starMat);
    this.root.add(this.starfield);

    // 2. Cosmic Galactic Nebular Dust Veil
    const nebGeo = new THREE.SphereGeometry(480, 24, 16);
    const nebMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#1e1b4b'),
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.nebulaMesh = new THREE.Mesh(nebGeo, nebMat);
    this.root.add(this.nebulaMesh);

    // 3. Toroidal Donut Planet ("Torus Prime")
    this.torusGroup = new THREE.Group();
    const torusCoreGeo = createCliffordTorusGeometry(32, 10, 48, 32, this.currentTopology, 1.0);
    const torusCoreMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.45,
      metalness: 0.35,
      emissive: new THREE.Color(this.currentSpec.coronaGlow),
      emissiveIntensity: 0.45,
      flatShading: false,
    });
    this.torusMesh = new THREE.Mesh(torusCoreGeo, torusCoreMat);
    this.torusGroup.add(this.torusMesh);

    // Toroidal Atmospheric Cloud Shell
    const torusAtmGeo = createToroidAtmosphereGeometry(32, 11.2, 36, 24);
    const torusAtmMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#7dd3fc'),
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      wireframe: false,
      depthWrite: false,
    });
    this.torusAtmosphereMesh = new THREE.Mesh(torusAtmGeo, torusAtmMat);
    this.torusGroup.add(this.torusAtmosphereMesh);

    // Multi-tiered Planetary Ring Discs passing through center void
    this.torusRingsGroup = new THREE.Group();
    const ringGeo = new THREE.RingGeometry(16, 68, 64);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.currentSpec.ringColor),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mainRing = new THREE.Mesh(ringGeo, ringMat);
    this.torusRingsGroup.add(mainRing);

    // Secondary Cassini ring with darker gap
    const cassiniGeo = new THREE.RingGeometry(72, 88, 64);
    cassiniGeo.rotateX(Math.PI / 2);
    const cassiniMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#38bdf8'),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.torusRingsGroup.add(new THREE.Mesh(cassiniGeo, cassiniMat));
    this.torusGroup.add(this.torusRingsGroup);

    // Auroral Poloidal Magnetosphere Loops through the donut hole
    this.torusAuroralLoopsGroup = new THREE.Group();
    const loopCount = 8;
    for (let l = 0; l < loopCount; l++) {
      const loopAng = (l / loopCount) * Math.PI;
      const loopGeo = new THREE.TorusGeometry(32, 1.2, 12, 48);
      loopGeo.rotateY(loopAng);
      const loopMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#38bdf8'),
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      this.torusAuroralLoopsGroup.add(new THREE.Mesh(loopGeo, loopMat));
    }
    this.torusGroup.add(this.torusAuroralLoopsGroup);

    // Co-orbiting Toroidal Moonlets
    this.torusMoonsGroup = new THREE.Group();
    const moonCount = 3;
    for (let m = 0; m < moonCount; m++) {
      const moonGeo = new THREE.TorusGeometry(2.4, 0.8, 12, 24);
      const moonMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#cbd5e1'),
        metalness: 0.6,
        roughness: 0.3,
      });
      const moon = new THREE.Mesh(moonGeo, moonMat);
      moon.position.set(Math.cos((m / moonCount) * Math.PI * 2) * 58, (m - 1) * 12, Math.sin((m / moonCount) * Math.PI * 2) * 58);
      this.torusMoonsGroup.add(moon);
    }
    this.torusGroup.add(this.torusMoonsGroup);

    this.torusGroup.position.set(120, 260, -220);
    this.torusGroup.rotation.set(0.65, 0.4, 0.2);
    this.root.add(this.torusGroup);

    // 4. Parametric Klein-Bottle Stellar Knot
    this.kleinGroup = new THREE.Group();
    const kleinGeo = createFigure8KleinBottleGeometry(28, 52, 36, this.currentTopology, 1.0, 0.0);
    const kleinMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.28,
      metalness: 0.65,
      emissive: new THREE.Color('#9333ea'),
      emissiveIntensity: 0.85,
      side: THREE.DoubleSide,
    });
    this.kleinMesh = new THREE.Mesh(kleinGeo, kleinMat);
    this.kleinGroup.add(this.kleinMesh);

    // Coronal Plasma Wireframe Aura
    const kleinWireMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#e9d5ff'),
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    this.kleinWireMesh = new THREE.Mesh(kleinGeo, kleinWireMat);
    this.kleinWireMesh.scale.multiplyScalar(1.05);
    this.kleinGroup.add(this.kleinWireMesh);

    // Coronal Plasma Ejection Jets
    this.kleinCoronalJetsGroup = new THREE.Group();
    for (let j = 0; j < 6; j++) {
      const jetAngle = (j / 6) * Math.PI * 2;
      const jetConeGeo = new THREE.ConeGeometry(3, 48, 16, 1, true);
      jetConeGeo.translate(0, 24, 0);
      const jetConeMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#c084fc'),
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const jet = new THREE.Mesh(jetConeGeo, jetConeMat);
      jet.position.set(Math.cos(jetAngle) * 14, Math.sin(jetAngle * 2) * 9, Math.sin(jetAngle) * 14);
      jet.rotation.set(Math.sin(jetAngle) * 0.8, jetAngle, Math.cos(jetAngle) * 0.8);
      this.kleinCoronalJetsGroup.add(jet);
    }
    this.kleinGroup.add(this.kleinCoronalJetsGroup);

    this.kleinGroup.position.set(-140, 280, -200);
    this.root.add(this.kleinGroup);

    // 5. Dyson Polyhedral Swarm
    this.dysonGroup = new THREE.Group();
    const starGeoCore = new THREE.SphereGeometry(14, 24, 24);
    const starMatCore = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#fef08a'),
    });
    const centralStar = new THREE.Mesh(starGeoCore, starMatCore);
    this.dysonGroup.add(centralStar);

    const ringCount = 3;
    for (let r = 0; r < ringCount; r++) {
      const swarmRing = new THREE.Group();
      const nodeCount = 12 + r * 6;
      const radius = 28 + r * 16;
      for (let n = 0; n < nodeCount; n++) {
        const ang = (n / nodeCount) * Math.PI * 2;
        const panelGeo = new THREE.OctahedronGeometry(2.5, 0);
        const panelMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#f59e0b'),
          metalness: 0.9,
          roughness: 0.15,
          emissive: new THREE.Color('#b45309'),
          emissiveIntensity: 0.5,
        });
        const panel = new THREE.Mesh(panelGeo, panelMat);
        panel.position.set(Math.cos(ang) * radius, (Math.sin(ang * 2) * radius) * 0.25, Math.sin(ang) * radius);
        panel.rotation.set(ang, ang * 2, 0);
        swarmRing.add(panel);
      }
      swarmRing.rotation.set(r * 0.6, r * 0.4, 0);
      this.dysonGroup.add(swarmRing);
    }
    this.dysonGroup.position.set(160, 270, -180);
    this.root.add(this.dysonGroup);

    // 6. Relativistic Accretion-Singularity (Black Hole with Doppler Beaming)
    this.singularityGroup = new THREE.Group();
    const horizonGeo = new THREE.SphereGeometry(16, 32, 32);
    const horizonMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const horizonMesh = new THREE.Mesh(horizonGeo, horizonMat);
    this.singularityGroup.add(horizonMesh);

    const discGeo = new THREE.RingGeometry(18, 54, 64);
    discGeo.rotateX(Math.PI / 2.3);
    const discColors = new Float32Array(discGeo.attributes.position.count * 3);
    const discPos = discGeo.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < discPos.count; i++) {
      const x = discPos.getX(i);
      const dopplerBoost = x < 0 ? 1.6 : 0.45;
      const col = x < 0 ? new THREE.Color('#38bdf8') : new THREE.Color('#ea580c');
      col.multiplyScalar(dopplerBoost);

      discColors[i * 3] = col.r;
      discColors[i * 3 + 1] = col.g;
      discColors[i * 3 + 2] = col.b;
    }
    discGeo.setAttribute('color', new THREE.BufferAttribute(discColors, 3));

    const discMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const discMesh = new THREE.Mesh(discGeo, discMat);
    this.singularityGroup.add(discMesh);

    const lensRingGeo = new THREE.TorusGeometry(17.2, 0.9, 16, 64);
    const lensRingMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ffffff'),
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const lensRing = new THREE.Mesh(lensRingGeo, lensRingMat);
    lensRing.lookAt(0, 0, 1);
    this.singularityGroup.add(lensRing);

    const jetGeo = new THREE.CylinderGeometry(0.5, 4.5, 120, 16, 1, true);
    const jetMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#38bdf8'),
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const jetTop = new THREE.Mesh(jetGeo, jetMat);
    jetTop.position.set(0, 60, 0);
    const jetBottom = new THREE.Mesh(jetGeo, jetMat);
    jetBottom.position.set(0, -60, 0);
    this.singularityGroup.add(jetTop);
    this.singularityGroup.add(jetBottom);

    this.singularityGroup.position.set(0, 310, -240);
    this.root.add(this.singularityGroup);

    // 7. Binary Pulsar Conduit
    this.pulsarGroup = new THREE.Group();
    const pulsarAGeo = new THREE.SphereGeometry(6, 16, 16);
    const pulsarAMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const pulsarA = new THREE.Mesh(pulsarAGeo, pulsarAMat);
    pulsarA.position.set(-16, 0, 0);

    const pulsarB = new THREE.Mesh(pulsarAGeo, pulsarAMat);
    pulsarB.position.set(16, 0, 0);
    this.pulsarGroup.add(pulsarA);
    this.pulsarGroup.add(pulsarB);

    const beamGeo = new THREE.ConeGeometry(8, 70, 16, 1, true);
    beamGeo.translate(0, 35, 0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const beam1 = new THREE.Mesh(beamGeo, beamMat);
    const beam2 = new THREE.Mesh(beamGeo, beamMat);
    beam2.rotation.x = Math.PI;
    pulsarA.add(beam1);
    pulsarB.add(beam2);

    this.pulsarGroup.position.set(0, 270, -220);
    this.root.add(this.pulsarGroup);

    // 8. Möbius-Halo Superstructure (D6)
    this.mobiusGroup = new THREE.Group();
    const mobiusGeo = createMobiusHaloGeometry(36, 9, 72, 16);
    const mobiusMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      metalness: 0.85,
      roughness: 0.25,
      emissive: new THREE.Color('#d97706'),
      emissiveIntensity: 0.5,
    });
    const mobiusMesh = new THREE.Mesh(mobiusGeo, mobiusMat);
    this.mobiusGroup.add(mobiusMesh);
    this.mobiusGroup.position.set(-100, 290, -210);
    this.root.add(this.mobiusGroup);

    // 9. Calabi-Yau 6D Manifold Hyper-Body (D7)
    this.calabiGroup = new THREE.Group();
    const calabiGeo = createCalabiYauManifoldGeometry(30, 48, 1.0);
    const calabiMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      metalness: 0.95,
      roughness: 0.15,
      emissive: new THREE.Color('#4338ca'),
      emissiveIntensity: 0.8,
      wireframe: false,
    });
    const calabiMesh = new THREE.Mesh(calabiGeo, calabiMat);
    this.calabiGroup.add(calabiMesh);
    this.calabiGroup.position.set(0, 320, -230);
    this.root.add(this.calabiGroup);

    // Initial shape visibility
    this.updateVisibleCelestialBody(this.currentSpec.celestialShape);
  }

  public setDimension(dimIndex: number, manifoldTopology?: WorldTopologyArchetype) {
    if (manifoldTopology) {
      this.currentTopology = manifoldTopology;
    }
    this.currentSpec = resolveCosmologyForDimension(dimIndex);
    this.updateVisibleCelestialBody(this.currentSpec.celestialShape);
    this.rebuildGeometriesForTopologyAndDetail();
  }

  public setTopology(manifoldTopology: WorldTopologyArchetype) {
    this.currentTopology = manifoldTopology;
    this.rebuildGeometriesForTopologyAndDetail();
  }

  /**
   * Rebuilds the parametric non-spherical geometries (Clifford Torus & Figure-8 Klein Bottle)
   * with high-precision tessellation, harmonic surface waves, and vertex color banding matching
   * the active dimension's manifold topology and the inner world's expansion detail level!
   */
  public rebuildGeometriesForTopologyAndDetail() {
    this.lastRebuildDetail = this.detailFactor;

    // 1. Rebuild Toroidal Donut Geometry
    const oldTorusGeo = this.torusMesh.geometry;
    const newTorusGeo = createCliffordTorusGeometry(32, 10, 48, 32, this.currentTopology, this.detailFactor);
    this.torusMesh.geometry = newTorusGeo;
    oldTorusGeo.dispose();

    // 2. Rebuild Klein-Bottle Geometry with 4D phase angle
    const oldKleinGeo = this.kleinMesh.geometry;
    const newKleinGeo = createFigure8KleinBottleGeometry(28, 52, 36, this.currentTopology, this.detailFactor, this.theta4D);
    this.kleinMesh.geometry = newKleinGeo;
    this.kleinWireMesh.geometry = newKleinGeo;
    oldKleinGeo.dispose();
  }

  /**
   * Scales celestial geometry detail, auroral loops, and planetary ring tiers
   * in direct response to the inner world expanding (sectors streamed, bedrock excavated, frontiers explored)!
   */
  public updateInnerWorldExpansionDetail(metrics: InnerWorldExpansionMetrics) {
    const {
      sectorCount,
      excavationCount,
      exploredFrontierCount,
      playerAltitudeM,
      discoveryTier,
      infrastructureComplexity = 0,
    } = metrics;

    // Calculate composite inner-world expansion factor
    const expansionScore =
      1.0 +
      Math.log2(Math.max(1, sectorCount)) * 0.32 +
      (excavationCount / 18) * 0.18 +
      exploredFrontierCount * 0.14 +
      (discoveryTier - 1) * 0.38 +
      infrastructureComplexity * 0.08 +
      Math.max(0, playerAltitudeM / 90) * 0.3;

    const clampedFactor = THREE.MathUtils.clamp(expansionScore, 1.0, 2.8);

    // If detail level changed significantly, regenerate higher-fidelity tessellation
    if (Math.abs(clampedFactor - this.lastRebuildDetail) > 0.18) {
      this.detailFactor = clampedFactor;
      this.rebuildGeometriesForTopologyAndDetail();
    }

    // Scale overall celestial presence and visibility of sub-systems
    this.expansionScale = 1.0 + (clampedFactor - 1.0) * 0.45;
    this.root.scale.set(this.expansionScale, this.expansionScale, this.expansionScale);

    // Expand auroral poloidal loops and ring visibility as world expands
    this.torusAuroralLoopsGroup.visible = sectorCount > 1;
    this.torusMoonsGroup.visible = sectorCount > 2 || excavationCount > 5;
    this.torusAtmosphereMesh.visible = sectorCount > 1;

    // Scale auroral loops opacity and energy
    for (let i = 0; i < this.torusAuroralLoopsGroup.children.length; i++) {
      const child = this.torusAuroralLoopsGroup.children[i] as THREE.Mesh;
      if (child.material && child.material instanceof THREE.MeshBasicMaterial) {
        child.material.opacity = Math.min(0.75, 0.25 + (clampedFactor - 1.0) * 0.3);
      }
    }

    // Scale coronal jets on Klein body
    for (let j = 0; j < this.kleinCoronalJetsGroup.children.length; j++) {
      const jet = this.kleinCoronalJetsGroup.children[j] as THREE.Mesh;
      const s = 1.0 + (clampedFactor - 1.0) * 0.5;
      jet.scale.set(s, s * 1.2, s);
    }
  }

  public updateVisibleCelestialBody(shape: CelestialPlanetaryShape) {
    this.currentShape = shape;
    this.torusGroup.visible = shape === 'toroidal-donut-planet';
    this.kleinGroup.visible = shape === 'klein-stellar-knot';
    this.dysonGroup.visible = shape === 'dyson-polyhedron-swarm';
    this.singularityGroup.visible = shape === 'accretion-singularity';
    this.pulsarGroup.visible = shape === 'binary-pulsar-beam';
    this.mobiusGroup.visible = shape === 'mobius-halo-superstructure';
    this.calabiGroup.visible = shape === 'calabi-yau-stellar-nexus';
  }

  /**
   * Advances the outer space cosmic discovery tier and expands the celestial horizon!
   */
  public advanceCosmicExpansion(tierIncrement = 1) {
    this.cosmicDiscoveryTier += tierIncrement;
    this.detailFactor = Math.min(2.8, this.detailFactor + 0.35 * tierIncrement);
    this.rebuildGeometriesForTopologyAndDetail();
    this.expansionScale = 1.0 + (this.cosmicDiscoveryTier - 1) * 0.35;
    this.root.scale.set(this.expansionScale, this.expansionScale, this.expansionScale);
  }

  public getCosmicDiscoveryTier(): number {
    return this.cosmicDiscoveryTier;
  }

  public getActiveSpec(): CelestialCosmologySpec {
    return this.currentSpec;
  }

  /**
   * Updates orbital mechanics, pulsar lighthouse sweeping, and atmospheric sky attenuation.
   */
  public update(playerPos: THREE.Vector3, scene: THREE.Scene, dt: number, nowSec: number) {
    // Keep outer space celestial dome locked to player position with slight parallax
    this.root.position.set(playerPos.x * 0.15, playerPos.y * 0.05, playerPos.z * 0.15);

    // 4D precession phase for non-orientable Klein bottle
    this.theta4D += dt * 0.12;

    // Slow celestial rotation
    if (this.torusGroup.visible) {
      this.torusGroup.rotation.y += 0.045 * dt;
      this.torusGroup.rotation.x += 0.015 * dt;
      this.torusAtmosphereMesh.rotation.y += 0.08 * dt; // Contra-rotating atmospheric cloud bands
      this.torusMoonsGroup.rotation.y += 0.12 * dt;
      this.torusAuroralLoopsGroup.rotation.y -= 0.03 * dt;
    }
    if (this.kleinGroup.visible) {
      this.kleinGroup.rotation.y += 0.07 * dt;
      this.kleinGroup.rotation.z += 0.04 * dt;
      this.kleinCoronalJetsGroup.rotation.y += 0.15 * dt;
    }
    if (this.dysonGroup.visible) {
      this.dysonGroup.rotation.y += 0.035 * dt;
      for (let i = 1; i < this.dysonGroup.children.length; i++) {
        this.dysonGroup.children[i].rotation.y += (i * 0.06) * dt;
      }
    }
    if (this.singularityGroup.visible) {
      this.singularityGroup.rotation.y += 0.18 * dt; // Relativistic spin
    }
    if (this.pulsarGroup.visible) {
      this.pulsarGroup.rotation.y += 1.8 * dt; // Rapid pulsar sweep
    }
    if (this.mobiusGroup.visible) {
      this.mobiusGroup.rotation.y += 0.05 * dt;
      this.mobiusGroup.rotation.z += 0.02 * dt;
    }
    if (this.calabiGroup.visible) {
      this.calabiGroup.rotation.y += 0.06 * dt;
      this.calabiGroup.rotation.x += 0.03 * dt;
    }

    // Atmospheric scattering transition into deep space:
    // As player climbs to altitude (e.g. in 5D gravity vehicle or geyser),
    // atmospheric fog density attenuates smoothly so outer space becomes crystalline and clear!
    const altitude = playerPos.y;
    if (scene.fog && scene.fog instanceof THREE.FogExp2) {
      const baseDensity = 0.0085;
      const altitudeFactor = Math.max(0, Math.min(1.0, (altitude - 20) / 90));
      // Attenuate fog by up to 90% in upper stratosphere/orbital vacuum
      scene.fog.density = baseDensity * (1.0 - altitudeFactor * 0.9);
    }
  }
}
