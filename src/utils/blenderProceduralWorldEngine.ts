import * as THREE from 'three';
import {
  DamageGoreModality,
  EntityBlueprint,
  ManifoldWorldSpec,
  ProceduralTerrainSectorSpec,
  TectonicElevationRegime,
  TerrainExcavationSpot,
} from '../types/manifold';
import { createPhotorealisticTerrainMaterial } from './engineImmersionPipeline';

export const SECTOR_CHUNK_SIZE = 96; // 96m x 96m per procedural map sector

export interface PhysicalVisceralOrganPickup {
  id: string;
  sourceEntityName: string;
  dnaHash: string;
  goreModality: DamageGoreModality;
  organTitle: string;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  mesh: THREE.Group;
  age: number;
  accentHex: string;
}

/**
 * ============================================================================
 * 1. BLENDER GEOMETRY-NODES & NON-DESTRUCTIVE MODIFIER STACK PIPELINE
 * ============================================================================
 * Implements procedural 3D mesh operators equivalent to Blender's Modifier Stack:
 * - Laplacian Smooth / Catmull-Clark Subdivision relaxation
 * - SimpleDeform (Twist, Taper, Bend)
 * - Displace (Multi-fractal Musgrave / Voronoi Ridged Normal Displacement)
 * - Curve-to-Mesh with custom fluted profile & radius taper
 */

export function applyBlenderLaplacianSmoothModifier(
  geo: THREE.BufferGeometry,
  iterations: number = 2,
  lambda: number = 0.42
): THREE.BufferGeometry {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const count = pos.count;
  if (count < 4) return geo;

  // Build spatial vertex adjacency by quantized coordinate hash + index connectivity
  const indexAttr = geo.getIndex();
  const neighbors: Set<number>[] = Array.from({ length: count }, () => new Set<number>());

  if (indexAttr) {
    const idxArray = indexAttr.array;
    for (let i = 0; i < idxArray.length; i += 3) {
      const a = idxArray[i];
      const b = idxArray[i + 1];
      const c = idxArray[i + 2];
      neighbors[a]?.add(b);
      neighbors[a]?.add(c);
      neighbors[b]?.add(a);
      neighbors[b]?.add(c);
      neighbors[c]?.add(a);
      neighbors[c]?.add(b);
    }
  }

  const temp = new Float32Array(count * 3);

  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < count; i++) {
      const nSet = neighbors[i];
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      if (!nSet || nSet.size === 0) {
        temp[i * 3] = vx;
        temp[i * 3 + 1] = vy;
        temp[i * 3 + 2] = vz;
        continue;
      }
      let avgX = 0;
      let avgY = 0;
      let avgZ = 0;
      nSet.forEach((nIdx) => {
        avgX += pos.getX(nIdx);
        avgY += pos.getY(nIdx);
        avgZ += pos.getZ(nIdx);
      });
      const inv = 1 / nSet.size;
      avgX *= inv;
      avgY *= inv;
      avgZ *= inv;

      temp[i * 3] = vx + (avgX - vx) * lambda;
      temp[i * 3 + 1] = vy + (avgY - vy) * lambda;
      temp[i * 3 + 2] = vz + (avgZ - vz) * lambda;
    }

    for (let i = 0; i < count; i++) {
      pos.setXYZ(i, temp[i * 3], temp[i * 3 + 1], temp[i * 3 + 2]);
    }
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export function applyBlenderSimpleDeformModifier(
  geo: THREE.BufferGeometry,
  mode: 'twist' | 'taper' | 'bend',
  factor: number,
  heightSpan: number = 4.0
): THREE.BufferGeometry {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const halfH = Math.max(0.01, heightSpan * 0.5);

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    const normY = THREE.MathUtils.clamp(y / halfH, -1, 1);

    if (mode === 'twist') {
      const angle = normY * factor;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const nx = x * cosA - z * sinA;
      const nz = x * sinA + z * cosA;
      x = nx;
      z = nz;
    } else if (mode === 'taper') {
      const scale = Math.max(0.12, 1.0 + normY * factor);
      x *= scale;
      z *= scale;
    } else if (mode === 'bend') {
      const bendOffset = normY * normY * factor;
      x += bendOffset;
      y -= Math.abs(bendOffset) * 0.18;
    }

    pos.setXYZ(i, x, y, z);
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export function applyBlenderMusgraveDisplaceModifier(
  geo: THREE.BufferGeometry,
  strength: number = 0.28,
  scale: number = 2.2,
  seed: number = 101
): THREE.BufferGeometry {
  geo.computeVertexNormals();
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const norm = geo.attributes.normal as THREE.BufferAttribute;
  const phase = (seed % 997) * 0.13;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const nx = norm.getX(i);
    const ny = norm.getY(i);
    const nz = norm.getZ(i);

    // Multi-fractal ridged Musgrave procedural signal
    const n1 = Math.sin(x * scale + phase) * Math.cos(y * scale - phase) * Math.sin(z * scale + phase * 0.5);
    const n2 = Math.cos(x * scale * 2.13 - z * scale * 1.97 + phase);
    const ridged = 1.0 - Math.abs(n1 * 0.65 + n2 * 0.35);
    const disp = (ridged * ridged - 0.45) * strength;

    pos.setXYZ(i, x + nx * disp, y + ny * disp, z + nz * disp);
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/**
 * Blender Geometry-Nodes style `Curve to Mesh` extrusion with custom fluted cross-section,
 * organic taper profile, and longitudinal torsion twist.
 */
export function buildBlenderCurveToMeshExtrusion(
  curvePoints: THREE.Vector3[],
  baseRadius: number,
  tipRadius: number,
  twistTurns: number = 1.0,
  radialSegs: number = 14,
  tubularSegs: number = 28,
  fluteCount: number = 5,
  fluteDepth: number = 0.22
): THREE.BufferGeometry {
  const validPts = curvePoints.filter(
    (p) => p && Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z)
  );
  if (validPts.length < 2) {
    return new THREE.CylinderGeometry(tipRadius, baseRadius, 1, radialSegs, 4);
  }

  const curve = new THREE.CatmullRomCurve3(validPts);
  const frames = curve.computeFrenetFrames(tubularSegs, false);

  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const P = new THREE.Vector3();
  const N = new THREE.Vector3();
  const B = new THREE.Vector3();
  const vertex = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (let i = 0; i <= tubularSegs; i++) {
    const u = i / tubularSegs;
    curve.getPointAt(u, P);
    N.copy(frames.normals[i]);
    B.copy(frames.binormals[i]);

    // Smooth Blender proportional radius falloff with subtle organic muscle swell
    const organicSwell = 1.0 + 0.18 * Math.sin(u * Math.PI);
    const rBase = THREE.MathUtils.lerp(baseRadius, tipRadius, Math.pow(u, 0.85)) * organicSwell;

    for (let j = 0; j <= radialSegs; j++) {
      const v = j / radialSegs;
      const theta = v * Math.PI * 2 + u * twistTurns * Math.PI * 2;
      const fluteMod = 1.0 + fluteDepth * Math.cos(theta * fluteCount);
      const r = Math.max(0.015, rBase * fluteMod);

      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      normal.x = cosT * N.x + sinT * B.x;
      normal.y = cosT * N.y + sinT * B.y;
      normal.z = cosT * N.z + sinT * B.z;
      normal.normalize();

      vertex.x = P.x + r * normal.x;
      vertex.y = P.y + r * normal.y;
      vertex.z = P.z + r * normal.z;

      vertices.push(vertex.x, vertex.y, vertex.z);
      normals.push(normal.x, normal.y, normal.z);
      uvs.push(u, v);
    }
  }

  const stride = radialSegs + 1;
  for (let i = 0; i < tubularSegs; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * stride + j;
      const b = (i + 1) * stride + j;
      const c = (i + 1) * stride + (j + 1);
      const d = i * stride + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setIndex(indices);
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}

/**
 * ============================================================================
 * 2. PROCEDURAL MAP-EDGE SECTOR GENERATOR & TECTONIC ELEVATION DIFFERENCES
 * ============================================================================
 */

const REGIME_LIST: TectonicElevationRegime[] = [
  'alpine-karst-spire-highlands',
  'abyssal-subduction-canyon',
  'cantilever-mesa-ziggurat',
  'biocomplex-caldera-amphitheater',
  'blender-bmesh-arch-labyrinth',
];

const SECTOR_TITLES: Record<TectonicElevationRegime, string[]> = {
  'alpine-karst-spire-highlands': [
    'Karst Spire Highlands',
    'Osteo-Needle Escarpment',
    'Sky-Cantilever Crags',
  ],
  'abyssal-subduction-canyon': [
    'Abyssal Subduction Trench',
    'Pelagic Ichor Rift',
    'Hadal Basalt Chasm',
  ],
  'cantilever-mesa-ziggurat': [
    'Terraced Hyper-Mesa Plateau',
    'Stepped Ziggurat Citadel',
    'Hanging Stratum Tableland',
  ],
  'biocomplex-caldera-amphitheater': [
    'Mycelial Caldera Basin',
    'Spore-Geyser Amphitheater',
    'Symbiotic Incubator Crater',
  ],
  'blender-bmesh-arch-labyrinth': [
    'Catenary Arch Labyrinth',
    'Boolean-Carved Monolith Span',
    'Twisted BMesh Vaults',
  ],
};

export function synthesizeProceduralTerrainSector(
  worldSeed: number,
  gridX: number,
  gridZ: number,
  palette: ManifoldWorldSpec['palette']
): ProceduralTerrainSectorSpec {
  const hash =
    Math.abs(
      (worldSeed * 73856093) ^ (gridX * 19349663) ^ (gridZ * 83492791)
    ) % 999983;

  const isOrigin = gridX === 0 && gridZ === 0;
  const distSteps = Math.max(1, Math.hypot(gridX, gridZ));
  const regime: TectonicElevationRegime = isOrigin
    ? 'biocomplex-caldera-amphitheater'
    : REGIME_LIST[hash % REGIME_LIST.length];

  const titles = SECTOR_TITLES[regime];
  const title = isOrigin
    ? 'Prime Genesis Basin (Sector 0,0)'
    : `${titles[hash % titles.length]} [${gridX >= 0 ? `+${gridX}` : gridX}, ${
        gridZ >= 0 ? `+${gridZ}` : gridZ
      }]`;

  // Dramatic elevation differences that scale as the player explores outward!
  let baseElevationOffset = 0;
  let reliefAmplitude = 10;
  let terraceStepCount = 0;

  if (!isOrigin) {
    const scaleWithDist = Math.min(2.2, 0.85 + distSteps * 0.35);
    if (regime === 'alpine-karst-spire-highlands') {
      baseElevationOffset = Number((13.5 * scaleWithDist).toFixed(2));
      reliefAmplitude = Number((18.0 * scaleWithDist).toFixed(2));
      terraceStepCount = 0;
    } else if (regime === 'abyssal-subduction-canyon') {
      baseElevationOffset = Number((-12.0 * scaleWithDist).toFixed(2));
      reliefAmplitude = Number((14.5 * scaleWithDist).toFixed(2));
      terraceStepCount = 3;
    } else if (regime === 'cantilever-mesa-ziggurat') {
      baseElevationOffset = Number((11.0 * scaleWithDist).toFixed(2));
      reliefAmplitude = Number((15.0 * scaleWithDist).toFixed(2));
      terraceStepCount = 5;
    } else if (regime === 'biocomplex-caldera-amphitheater') {
      baseElevationOffset = Number((4.5 * scaleWithDist).toFixed(2));
      reliefAmplitude = Number((16.0 * scaleWithDist).toFixed(2));
      terraceStepCount = 2;
    } else {
      baseElevationOffset = Number((8.5 * scaleWithDist).toFixed(2));
      reliefAmplitude = Number((16.5 * scaleWithDist).toFixed(2));
      terraceStepCount = 4;
    }
  }

  const centerX = gridX * SECTOR_CHUNK_SIZE;
  const centerZ = gridZ * SECTOR_CHUNK_SIZE;

  // Deterministic coordinates inside the sector for the 3 physical 3D world-mechanic structures
  const geyserAngle = ((hash % 360) * Math.PI) / 180;
  const pylonAngle = geyserAngle + 2.1;
  const cradleAngle = geyserAngle + 4.2;

  return {
    id: `sector-${gridX}-${gridZ}-${worldSeed}`,
    gridX,
    gridZ,
    centerX,
    centerZ,
    size: SECTOR_CHUNK_SIZE,
    seed: hash,
    name: title,
    elevationRegime: regime,
    baseElevationOffset,
    reliefAmplitude,
    terraceStepCount,
    primaryHex: palette.terrainMid,
    secondaryHex: palette.terrainHigh,
    accentHex: palette.accentColor,
    geyserCoords: [
      Number((centerX + Math.cos(geyserAngle) * 20).toFixed(1)),
      Number((centerZ + Math.sin(geyserAngle) * 20).toFixed(1)),
    ],
    pylonCoords: [
      Number((centerX + Math.cos(pylonAngle) * 24).toFixed(1)),
      Number((centerZ + Math.sin(pylonAngle) * 24).toFixed(1)),
    ],
    cradleCoords: [
      Number((centerX + Math.cos(cradleAngle) * 18).toFixed(1)),
      Number((centerZ + Math.sin(cradleAngle) * 18).toFixed(1)),
    ],
    spawnedMobCount: isOrigin ? 9 : 2 + (hash % 2),
    discoveredAt: Date.now(),
  };
}

/**
 * Evaluates smooth tectonic elevation deltas from procedurally generated sectors
 * so walking into new sectors creates towering highlands, terraced mesas, deep canyons,
 * and caldera bowls with zero seams!
 */
export function evaluateProceduralSectorElevationDelta(
  x: number,
  z: number,
  sectors?: ProceduralTerrainSectorSpec[]
): number {
  if (!sectors || sectors.length === 0) return 0;

  let totalDelta = 0;
  const halfSize = SECTOR_CHUNK_SIZE * 0.68;

  for (let i = 0; i < sectors.length; i++) {
    const s = sectors[i];
    if (s.gridX === 0 && s.gridZ === 0) continue; // Origin sector uses base terrain

    const dx = x - s.centerX;
    const dz = z - s.centerZ;
    const dist = Math.hypot(dx, dz);
    if (dist > halfSize) continue;

    // Smooth C1 falloff weight w in [0, 1]
    const normDist = dist / halfSize;
    const smoothW = Math.pow(1.0 - normDist * normDist, 2);

    let localFeature = s.baseElevationOffset;

    if (s.elevationRegime === 'alpine-karst-spire-highlands') {
      // Towering sharp karst pinnacles & mountain ridges
      const spireWave =
        Math.pow(
          Math.abs(Math.sin(dx * 0.085 + s.seed * 0.01) * Math.cos(dz * 0.085)),
          0.65
        ) * s.reliefAmplitude;
      localFeature += spireWave;
    } else if (s.elevationRegime === 'abyssal-subduction-canyon') {
      // Deep winding chasm trench with stepped canyon walls
      const canyonAxis = Math.sin(dx * 0.045 + dz * 0.035 + s.seed * 0.01);
      const trenchDepth = (1.0 - Math.min(1, Math.abs(canyonAxis) * 2.2)) * s.reliefAmplitude;
      localFeature -= trenchDepth;
    } else if (s.elevationRegime === 'cantilever-mesa-ziggurat') {
      // Stepped ziggurat plateau terraces
      const radialTier = Math.max(0, 1.0 - dist / (halfSize * 0.85));
      const steps = Math.max(2, s.terraceStepCount);
      const quantizedTier = Math.round(radialTier * steps) / steps;
      localFeature += quantizedTier * s.reliefAmplitude;
    } else if (s.elevationRegime === 'biocomplex-caldera-amphitheater') {
      // Raised volcanic/mycelial caldera rim around a sunken fertile amphitheater
      const rimRing = Math.exp(-Math.pow(( normDist - 0.58 ) / 0.18, 2));
      const bowlDip = normDist < 0.48 ? -0.45 * (1 - normDist / 0.48) : 0;
      localFeature += (rimRing * 1.15 + bowlDip) * s.reliefAmplitude;
    } else {
      // Blender BMesh Arch Labyrinth undulating ridges
      const archWave =
        Math.sin(dx * 0.07) * Math.cos(dz * 0.07) * s.reliefAmplitude * 0.75;
      localFeature += archWave;
    }

    totalDelta += localFeature * smoothW;
  }

  return totalDelta;
}

/**
 * Synthesizes an elevation-adapted or abyss-adapted EntityBlueprint specifically evolved
 * for a newly generated map-edge sector!
 */
export function synthesizeSectorNativeEntityBlueprint(
  baseBlueprint: EntityBlueprint,
  sector: ProceduralTerrainSectorSpec,
  spawnIdx: number
): EntityBlueprint {
  const salt = (sector.seed + spawnIdx * 997) % 99999;
  const nextGen = (baseBlueprint.geneticDNA?.generation ?? 1) + 1;
  const isHighAltitude =
    sector.elevationRegime === 'alpine-karst-spire-highlands' ||
    sector.elevationRegime === 'cantilever-mesa-ziggurat';
  const isAbyssal = sector.elevationRegime === 'abyssal-subduction-canyon';

  const limbFactor = isHighAltitude ? 1.32 : isAbyssal ? 0.92 : 1.16;
  const torsoMorph: [number, number, number] = isHighAltitude
    ? [0.95, 1.28, 1.18]
    : isAbyssal
    ? [1.35, 0.88, 1.32]
    : [1.14, 1.14, 1.14];

  const col = new THREE.Color(baseBlueprint.primaryColor);
  col.offsetHSL(
    ((sector.gridX * 0.11 + sector.gridZ * 0.07) % 1 + 1) % 1,
    0.12,
    isHighAltitude ? 0.06 : -0.04
  );

  const sectorTag =
    sector.elevationRegime === 'alpine-karst-spire-highlands'
      ? 'Alpine Spire'
      : sector.elevationRegime === 'abyssal-subduction-canyon'
      ? 'Hadal Trench'
      : sector.elevationRegime === 'cantilever-mesa-ziggurat'
      ? 'Ziggurat Mesa'
      : sector.elevationRegime === 'biocomplex-caldera-amphitheater'
      ? 'Caldera Basin'
      : 'BMesh Arch';

  const baseRootName = baseBlueprint.name.replace(/\s+Gen-\d+.*$/i, '');

  return {
    ...baseBlueprint,
    id: `${baseBlueprint.id}-sec-${sector.gridX}-${sector.gridZ}-${salt}`,
    name: `${sectorTag} ${baseRootName} Gen-${nextGen}`,
    primaryColor: `#${col.getHexString()}`,
    limbLength: Number(
      Math.min(2.2, baseBlueprint.limbLength * limbFactor).toFixed(2)
    ),
    torsoScale: [
      Number((baseBlueprint.torsoScale[0] * torsoMorph[0]).toFixed(2)),
      Number((baseBlueprint.torsoScale[1] * torsoMorph[1]).toFixed(2)),
      Number((baseBlueprint.torsoScale[2] * torsoMorph[2]).toFixed(2)),
    ],
    geneticDNA: {
      dnaHash: `DNA-S${Math.abs(sector.gridX)}${Math.abs(sector.gridZ)}-${salt
        .toString(16)
        .toUpperCase()}`,
      generation: nextGen,
      ancestralBlueprintId: baseBlueprint.id,
      parentName: baseBlueprint.name,
      exploredFrontierComplexId: sector.id,
      torsoScaleMorph: torsoMorph,
      limbElongationFactor: limbFactor,
      elevationAdaptation: isHighAltitude ? 0.94 : 0.58,
      husbandryCognitionScore: 0.68,
      dnaNutritionalValue: 0.76,
      mutationSummary: `Procedural Sector Speciation (${sector.name}): ${
        isHighAltitude
          ? 'High-Altitude Karst Tendon Elongation (+32% Stride)'
          : isAbyssal
          ? 'Abyssal Trench Hydrostatic Carapace'
          : 'Frontier Tectonic Adaptation'
      }`,
    },
  };
}

/**
 * ============================================================================
 * 3. BLENDER-SCULPTED 3D SECTOR CHUNK MESH + PHYSICAL 3D WORLD MECHANICS
 * ============================================================================
 * Builds:
 * 1. Seamless Displaced 3D Terrain Chunk for sector (gridX, gridZ)
 * 2. Blender Geometry-Nodes Tectonic Megastructures (Catenary Sky-Bridges, Twisted Karst Spires, Ziggurat Ramps)
 * 3. Physical 3D Thermal Updraft Geyser (Launches player & mobs to high elevations)
 * 4. Physical 3D In-World 4D Node Pylon (Physically shifts W-coord & ragdoll springs when struck/tethered)
 * 5. Physical 3D Lexicon Synthesis & DNA Fusion Cradle (Physically cross-breeds & evolves entities in 3D space)
 */
export function buildProceduralSectorCompleteRig(
  sector: ProceduralTerrainSectorSpec,
  world: ManifoldWorldSpec,
  evaluateHeightFn: (x: number, z: number) => number
): {
  rootGroup: THREE.Group;
  terrainMesh: THREE.Mesh;
  geyserRig: THREE.Group;
  pylonRig: THREE.Group;
  cradleRig: THREE.Group;
} {
  const rootGroup = new THREE.Group();
  rootGroup.name = `procedural-sector-${sector.gridX}-${sector.gridZ}`;

  // 1. Displaced 3D Sector Terrain Mesh
  const segs = 44;
  const terrainGeo = new THREE.PlaneGeometry(
    sector.size,
    sector.size,
    segs,
    segs
  );
  terrainGeo.rotateX(-Math.PI / 2);

  const posAttr = terrainGeo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(posAttr.count * 3);
  const cLow = new THREE.Color(world.palette.terrainLow);
  const cMid = new THREE.Color(world.palette.terrainMid);
  const cHigh = new THREE.Color(world.palette.terrainHigh);
  const cAccent = new THREE.Color(world.palette.accentColor);
  const cAbyss = new THREE.Color('#090d16');
  const cPeak = new THREE.Color('#f8fafc');
  const tmpColor = new THREE.Color();

  for (let i = 0; i < posAttr.count; i++) {
    const wx = posAttr.getX(i) + sector.centerX;
    const wz = posAttr.getZ(i) + sector.centerZ;
    const wy = evaluateHeightFn(wx, wz);
    posAttr.setXYZ(i, wx, wy, wz);

    // Rich elevation-stratified coloration
    const normH = THREE.MathUtils.clamp((wy + 16) / 42, 0, 1);
    if (wy < -6) {
      tmpColor.copy(cAbyss).lerp(cLow, THREE.MathUtils.clamp((wy + 24) / 18, 0, 1));
      // Bioluminescent trench veins at the bottom of canyons
      if (Math.abs(Math.sin(wx * 0.25) * Math.cos(wz * 0.25)) > 0.72) {
        tmpColor.lerp(cAccent, 0.55);
      }
    } else if (normH < 0.55) {
      tmpColor.copy(cLow).lerp(cMid, normH / 0.55);
    } else {
      tmpColor.copy(cMid).lerp(cHigh, (normH - 0.55) / 0.45);
      if (wy > 14) {
        tmpColor.lerp(cPeak, Math.min(0.75, (wy - 14) / 22));
      }
    }

    colors[i * 3] = tmpColor.r;
    colors[i * 3 + 1] = tmpColor.g;
    colors[i * 3 + 2] = tmpColor.b;
  }

  terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  terrainGeo.computeVertexNormals();

  const terrainMat = createPhotorealisticTerrainMaterial(0.68, 0.15);
  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  terrainMesh.receiveShadow = true;
  terrainMesh.castShadow = true;
  rootGroup.add(terrainMesh);

  // 2. Blender Modifier Stack Megastructure Landmark at Sector Center (for non-origin sectors)
  if (sector.gridX !== 0 || sector.gridZ !== 0) {
    const centerGroundY = evaluateHeightFn(sector.centerX, sector.centerZ);
    const megaGroup = new THREE.Group();
    megaGroup.position.set(sector.centerX, centerGroundY, sector.centerZ);

    const stoneMat = new THREE.MeshPhysicalMaterial({
      color: world.palette.terrainHigh,
      emissive: world.palette.accentColor,
      emissiveIntensity: 0.18,
      roughness: 0.38,
      metalness: 0.45,
      clearcoat: 0.5,
    });

    // Build 2 interlocking Blender Curve-to-Mesh Catenary Sky-Bridges / Rib Arches spanning the sector
    for (let aIdx = 0; aIdx < 2; aIdx++) {
      const rot = (aIdx * Math.PI) / 2 + (sector.seed % 10) * 0.1;
      const span = 18;
      const archH = 11 + (aIdx * 3.5);
      const pts = [
        new THREE.Vector3(-Math.cos(rot) * span, -1.5, -Math.sin(rot) * span),
        new THREE.Vector3(-Math.cos(rot) * (span * 0.5), archH * 0.72, -Math.sin(rot) * (span * 0.5)),
        new THREE.Vector3(0, archH, 0),
        new THREE.Vector3(Math.cos(rot) * (span * 0.5), archH * 0.72, Math.sin(rot) * (span * 0.5)),
        new THREE.Vector3(Math.cos(rot) * span, -1.5, Math.sin(rot) * span),
      ];
      let archGeo = buildBlenderCurveToMeshExtrusion(
        pts,
        1.45,
        0.95,
        1.5,
        14,
        30,
        6,
        0.24
      );
      archGeo = applyBlenderMusgraveDisplaceModifier(archGeo, 0.22, 1.4, sector.seed + aIdx);
      const archMesh = new THREE.Mesh(archGeo, stoneMat);
      archMesh.castShadow = true;
      archMesh.receiveShadow = true;
      megaGroup.add(archMesh);
    }

    rootGroup.add(megaGroup);
  }

  // 3. Physical 3D Thermal Updraft Geyser (Launches player & entities +24m into the air!)
  const [gx, gz] = sector.geyserCoords;
  const gy = evaluateHeightFn(gx, gz);
  const geyserRig = new THREE.Group();
  geyserRig.position.set(gx, gy, gz);
  geyserRig.name = `geyser-${sector.id}`;

  let nozzleGeo: THREE.BufferGeometry = new THREE.CylinderGeometry(1.1, 2.3, 1.8, 18, 8, true);
  nozzleGeo = applyBlenderSimpleDeformModifier(nozzleGeo, 'twist', 1.2, 1.8);
  nozzleGeo = applyBlenderMusgraveDisplaceModifier(nozzleGeo, 0.18, 2.5, sector.seed);
  const nozzleMat = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    emissive: sector.accentHex,
    emissiveIntensity: 0.45,
    roughness: 0.5,
    metalness: 0.4,
    side: THREE.DoubleSide,
  });
  const nozzleMesh = new THREE.Mesh(nozzleGeo, nozzleMat);
  nozzleMesh.position.y = 0.7;
  geyserRig.add(nozzleMesh);

  // Spiraling Updraft Plume Rings
  const plumeMat = new THREE.MeshBasicMaterial({
    color: sector.accentHex,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
  });
  for (let r = 0; r < 4; r++) {
    const ringGeo = new THREE.TorusGeometry(0.95 + r * 0.35, 0.07, 8, 24);
    ringGeo.rotateX(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, plumeMat);
    ring.position.y = 1.6 + r * 2.4;
    ring.userData.isGeyserPlumeRing = true;
    ring.userData.ringIndex = r;
    geyserRig.add(ring);
  }
  rootGroup.add(geyserRig);

  // 4. Physical 3D In-World 4D Node Actuator Pylon (Strike or Tether in 3D to shift W-coordinate & Ragdoll Springs!)
  const [px, pz] = sector.pylonCoords;
  const py = evaluateHeightFn(px, pz);
  const pylonRig = new THREE.Group();
  pylonRig.position.set(px, py, pz);
  pylonRig.name = `pylon-4d-${sector.id}`;

  const pylonCurvePts = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.35, 1.8, -0.25),
    new THREE.Vector3(-0.35, 3.6, 0.25),
    new THREE.Vector3(0, 5.4, 0),
  ];
  const pylonSpineGeo = buildBlenderCurveToMeshExtrusion(
    pylonCurvePts,
    0.65,
    0.18,
    2.2,
    14,
    26,
    5,
    0.28
  );
  const pylonMat = new THREE.MeshPhysicalMaterial({
    color: '#0f172a',
    emissive: '#f59e0b',
    emissiveIntensity: 0.75,
    metalness: 0.85,
    roughness: 0.18,
    clearcoat: 0.9,
  });
  const pylonSpine = new THREE.Mesh(pylonSpineGeo, pylonMat);
  pylonSpine.castShadow = true;
  pylonRig.add(pylonSpine);

  let coreGeo: THREE.BufferGeometry = new THREE.IcosahedronGeometry(0.85, 2);
  coreGeo = applyBlenderLaplacianSmoothModifier(coreGeo, 2, 0.45);
  coreGeo = applyBlenderSimpleDeformModifier(coreGeo, 'twist', 1.8, 1.7);
  const coreMat = new THREE.MeshStandardMaterial({
    color: '#fbbf24',
    emissive: '#f59e0b',
    emissiveIntensity: 1.4,
    wireframe: false,
    roughness: 0.15,
    metalness: 0.6,
  });
  const pylonCore = new THREE.Mesh(coreGeo, coreMat);
  pylonCore.position.y = 5.6;
  pylonCore.userData.isKineticRotor = true;
  pylonRig.add(pylonCore);
  rootGroup.add(pylonRig);

  // 5. Physical 3D Lexicon Synthesis & DNA Fusion Cradle (Cross-breeds & evolves entities in 3D space!)
  const [cx, cz] = sector.cradleCoords;
  const cy = evaluateHeightFn(cx, cz);
  const cradleRig = new THREE.Group();
  cradleRig.position.set(cx, cy, cz);
  cradleRig.name = `lexicon-cradle-${sector.id}`;

  let chaliceGeo: THREE.BufferGeometry = new THREE.CylinderGeometry(2.4, 1.2, 1.6, 20, 8, false);
  chaliceGeo = applyBlenderSimpleDeformModifier(chaliceGeo, 'taper', 0.45, 1.6);
  chaliceGeo = applyBlenderMusgraveDisplaceModifier(chaliceGeo, 0.16, 1.8, sector.seed + 77);
  const chaliceMat = new THREE.MeshPhysicalMaterial({
    color: '#1e1b4b',
    emissive: '#a855f7',
    emissiveIntensity: 0.65,
    roughness: 0.25,
    metalness: 0.6,
    clearcoat: 0.8,
  });
  const chaliceBase = new THREE.Mesh(chaliceGeo, chaliceMat);
  chaliceBase.position.y = 0.6;
  cradleRig.add(chaliceBase);

  // 3 Sculpted Tendril Ribs arching over the Synthesis Basin
  for (let t = 0; t < 3; t++) {
    const a = (t / 3) * Math.PI * 2;
    const ribPts = [
      new THREE.Vector3(Math.cos(a) * 2.1, 0.8, Math.sin(a) * 2.1),
      new THREE.Vector3(Math.cos(a + 0.5) * 1.4, 2.8, Math.sin(a + 0.5) * 1.4),
      new THREE.Vector3(0, 3.8, 0),
    ];
    const ribGeo = buildBlenderCurveToMeshExtrusion(ribPts, 0.26, 0.08, 1.2, 10, 18, 4, 0.2);
    const ribMesh = new THREE.Mesh(ribGeo, chaliceMat);
    cradleRig.add(ribMesh);
  }
  rootGroup.add(cradleRig);

  return {
    rootGroup,
    terrainMesh,
    geyserRig,
    pylonRig,
    cradleRig,
  };
}

/**
 * ============================================================================
 * 4. PHYSICAL 3D VISCERAL ORGAN & DNA HELIX DROP BUILDER
 * ============================================================================
 * When an entity suffers heavy internal damage or rupture, it physically ejects
 * a beating 3D Visceral Organ + DNA Helix pickup into the 3D world.
 * Walking over it or tethering it grafts that creature's 3D anatomy & DNA directly
 * onto the player's 3D character rig (or evolves a tethered creature)!
 */
export function buildPhysicalVisceralOrganPickup(
  pos: THREE.Vector3,
  sourceEntityName: string,
  dnaHash: string,
  goreModality: DamageGoreModality,
  accentHex: string
): PhysicalVisceralOrganPickup {
  const group = new THREE.Group();
  group.position.copy(pos);

  let organGeo: THREE.BufferGeometry = new THREE.OctahedronGeometry(0.36, 2);
  organGeo = applyBlenderLaplacianSmoothModifier(organGeo, 2, 0.48);
  organGeo = applyBlenderSimpleDeformModifier(organGeo, 'twist', 1.35, 0.72);
  organGeo = applyBlenderMusgraveDisplaceModifier(organGeo, 0.09, 4.2, pos.x * 100);

  const organColor =
    goreModality === 'corrosive-ichor-dissolution'
      ? '#10b981'
      : goreModality === 'neural-synapse-hemolysis'
      ? '#38bdf8'
      : goreModality === 'calcified-marrow-shatter'
      ? '#f59e0b'
      : '#f43f5e';

  const organMat = new THREE.MeshPhysicalMaterial({
    color: organColor,
    emissive: organColor,
    emissiveIntensity: 1.15,
    roughness: 0.18,
    metalness: 0.25,
    clearcoat: 0.95,
    transmission: 0.35,
  });

  const heartMesh = new THREE.Mesh(organGeo, organMat);
  heartMesh.name = 'visceral-heart-core';
  group.add(heartMesh);

  // Orbiting 3D DNA Helix Ribbon around the Organ
  const helixPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const a = t * Math.PI * 4;
    helixPts.push(
      new THREE.Vector3(
        Math.cos(a) * 0.48,
        (t - 0.5) * 0.75,
        Math.sin(a) * 0.48
      )
    );
  }
  const helixGeo = buildBlenderCurveToMeshExtrusion(
    helixPts,
    0.045,
    0.045,
    0.5,
    8,
    24,
    3,
    0.15
  );
  const helixMat = new THREE.MeshBasicMaterial({
    color: accentHex || '#a855f7',
  });
  const helixMesh = new THREE.Mesh(helixGeo, helixMat);
  group.add(helixMesh);

  const organTitleMap: Record<DamageGoreModality, string> = {
    'laceration-hemorrhage': 'Arterial Ventricle Graft',
    'hydrostatic-viscera-rupture': 'Pressurized Pleura Siphon',
    'calcified-marrow-shatter': 'Osteo-Marrow Exoskeleton Spur',
    'corrosive-ichor-dissolution': 'Acidic Bile-Gland Sac',
    'neural-synapse-hemolysis': 'Synaptic Ganglion Node',
  };

  return {
    id: `organ-drop-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
    sourceEntityName,
    dnaHash,
    goreModality,
    organTitle: organTitleMap[goreModality] ?? 'Visceral Genome Core',
    pos: pos.clone(),
    vel: new THREE.Vector3(
      (Math.random() - 0.5) * 6.5,
      4.5 + Math.random() * 3.5,
      (Math.random() - 0.5) * 6.5
    ),
    mesh: group,
    age: 0,
    accentHex: organColor,
  };
}
