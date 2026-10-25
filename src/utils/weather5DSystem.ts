import * as THREE from 'three';
import {
  BiomeWeatherTelemetry,
  DimensionalWeatherSystemSpec,
  ManifoldWorldSpec,
  TerrainExcavationSpot,
} from '../types/manifold';
import {
  createSeededRandom,
  evaluateTerrainHeight,
  resolveWorldWeather,
} from './manifoldGenerator';

export interface BiomeWeatherFieldSample {
  windVec: THREE.Vector3;
  scentVec: THREE.Vector3;
  effectiveGravityMultiplier: number;
  atmosphericViscosity: number;
  piezoStiffnessMultiplier: number;
  squallIntensity: number;
  in5DCausticBeam: boolean;
  nearestCausticBeamCenter: THREE.Vector3;
  activeEcologicalEvent: string;
}

export interface Cloud5DLobeInstance {
  mesh: THREE.Mesh;
  basePositions: Float32Array;
  wCoords: Float32Array;
  vCoords: Float32Array;
  orbitAngle: number;
  orbitRadius: number;
  baseY: number;
  orbitSpeed: number;
}

export interface CausticBeamInstance {
  coneMesh: THREE.Mesh;
  groundRingMesh: THREE.Mesh;
  orbitAngle: number;
  orbitRadius: number;
  orbitSpeed: number;
  worldGroundPos: THREE.Vector3;
}

export interface Cloud5DCanopyRig {
  group: THREE.Group;
  lobes: Cloud5DLobeInstance[];
  causticBeams: CausticBeamInstance[];
  celestialArcs: THREE.Line[];
}

export interface WeatherParticleRig {
  group: THREE.Group;
  points: THREE.Points;
  velocities: Float32Array;
  phases: Float32Array;
  macroMotes: THREE.Mesh[];
}

export interface ScentBreezeRibbonInstance {
  line: THREE.Line;
  positions: Float32Array;
  anchorX: number;
  anchorZ: number;
  altitudeOffset: number;
  phaseOffset: number;
  isEntityScentTrail: boolean;
}

export interface ScentBreezeRig {
  group: THREE.Group;
  ribbons: ScentBreezeRibbonInstance[];
}

/**
 * Evaluates the live 3D/4D/5D Weather & Ecosystem Physics field at any 3D coordinate.
 * Affects entities, ragdolls, projectiles, resource shards, world rotors, and the player.
 */
export function evaluateBiomeWeatherField(
  world: ManifoldWorldSpec,
  wCoord: number,
  timeSec: number,
  queryPos: THREE.Vector3,
  causticBeams?: CausticBeamInstance[]
): BiomeWeatherFieldSample {
  const weather: DimensionalWeatherSystemSpec = resolveWorldWeather(world);
  const vPhase = Math.sin(timeSec * 0.38 + wCoord * 1.9);

  // Squall intensity oscillates with 4D W-coordinate and 5D V-phase
  const squallWave =
    0.5 +
    0.35 * Math.sin(timeSec * 0.55 + wCoord * 2.4) +
    0.15 * Math.cos(timeSec * 1.2 - queryPos.x * 0.03);
  const squallIntensity = Math.max(
    0.1,
    Math.min(1.0, squallWave * (0.65 + Math.abs(wCoord) * 0.55))
  );

  // Prevailing 4D/5D directional wind angle
  const baseAngle =
    (world.seed % 360) * (Math.PI / 180) +
    Math.sin(timeSec * 0.14) * 0.55 +
    wCoord * 0.85;

  const windSpeed =
    weather.baseWindSpeed * (0.7 + squallIntensity * 0.75 + Math.abs(wCoord) * 0.4);

  let wx = Math.cos(baseAngle) * windSpeed;
  let wz = Math.sin(baseAngle) * windSpeed;
  let wy = 0;

  // Tangential Coriolis / Lorentz Vortex component around origin
  const distFromCenter = Math.hypot(queryPos.x, queryPos.z);
  if (distFromCenter > 0.5) {
    const tangentX = -queryPos.z / distFromCenter;
    const tangentZ = queryPos.x / distFromCenter;
    const vortexSpeed =
      weather.vorticityTorque *
      (4.5 + Math.abs(wCoord) * 5.5) *
      Math.min(1.4, distFromCenter / 24);
    wx += tangentX * vortexSpeed;
    wz += tangentZ * vortexSpeed;
  }

  // Phenomenon-specific Whole-Biome Physics Laws
  let effectiveGravityMultiplier = 1.0;
  let piezoStiffnessMultiplier = 1.0;
  let activeEcologicalEvent = `${weather.name}`;

  if (weather.id === 'graviton-shear-squall') {
    // Spatial folding & graviton updraft columns
    const columnWave =
      Math.sin(queryPos.x * 0.08 + timeSec * 1.1) *
      Math.cos(queryPos.z * 0.08 - timeSec * 0.9);
    wy =
      (wCoord * 4.5 + columnWave * weather.verticalDraftAmplitude) *
      (0.6 + squallIntensity * 0.6);
    effectiveGravityMultiplier = Math.max(
      0.22,
      1.0 - Math.max(0, wCoord) * 0.55 - Math.max(0, columnWave) * 0.35
    );
    activeEcologicalEvent =
      wCoord > 0.25
        ? 'Graviton Updraft Inversion · Low-G Stride'
        : squallIntensity > 0.72
        ? 'Tesseract Shear Gust · Trajectory Curvature'
        : 'Harmonic Graviton Drift';
  } else if (weather.id === 'coriolis-magneto-hail') {
    // Lorentz tangential cyclone torque
    wy = Math.sin(distFromCenter * 0.12 - timeSec * 2.0) * weather.verticalDraftAmplitude;
    effectiveGravityMultiplier = 0.92 + 0.18 * Math.cos(timeSec * 0.9 + wCoord);
    activeEcologicalEvent =
      squallIntensity > 0.68
        ? 'Coriolis Ferro-Squall · Orbital Torque Surge'
        : 'Lorentz Magnetic Slipstream';
  } else if (weather.id === 'piezoelectric-crystal-dust') {
    // Acoustic vitrification & harmonic standing waves
    const standingWave = Math.sin(
      distFromCenter * 0.15 - timeSec * 2.4 + wCoord * 3.14
    );
    wy = standingWave * weather.verticalDraftAmplitude;
    piezoStiffnessMultiplier =
      standingWave > 0.35 ? 1.28 : standingWave < -0.55 ? 0.62 : 1.0;
    effectiveGravityMultiplier = 0.85 - Math.max(0, standingWave) * 0.28;
    activeEcologicalEvent =
      standingWave > 0.35
        ? 'Piezoelectric Crest · Crystalline Joint Vitrification'
        : 'Refractive Singing Gale';
  } else if (weather.id === 'thermobaric-cinder-ash') {
    // 68-BPM heartbeat barometric compression & thermal chimneys
    const pulse68Bpm = Math.sin(timeSec * ((68 / 60) * Math.PI * 2));
    const chimneyWave = Math.cos(queryPos.x * 0.07) * Math.cos(queryPos.z * 0.07);
    if (chimneyWave > 0.45) {
      wy = weather.verticalDraftAmplitude * 1.35;
      effectiveGravityMultiplier = 0.52;
      activeEcologicalEvent = 'Thermal Cinder Chimney · Buoyant Plume';
    } else {
      wy = -pulse68Bpm * 2.2;
      effectiveGravityMultiplier = 1.0 + Math.max(0, pulse68Bpm) * 0.38;
      activeEcologicalEvent =
        pulse68Bpm > 0.5
          ? '68-BPM Barometric Downburst · Heavy Gravity'
          : 'Incandescent Ashfall Drift';
    }
  } else if (weather.id === 'biolum-spore-monsoon') {
    // Hydro-viscous non-Newtonian fluid atmosphere & pheromone bloom
    wy =
      Math.sin(timeSec * 0.8 + queryPos.x * 0.05) *
      weather.verticalDraftAmplitude *
      0.85;
    effectiveGravityMultiplier = Math.max(
      0.38,
      0.68 - Math.abs(wCoord) * 0.2
    );
    activeEcologicalEvent =
      squallIntensity > 0.65
        ? 'Bioluminescent Pheromone Bloom · Pack Convergence'
        : 'Hydro-Viscous Synovial Tide';
  } else {
    // 'singularity-inversion-rain'
    wy = (0.45 + Math.abs(wCoord) * 0.65) * weather.verticalDraftAmplitude;
    effectiveGravityMultiplier = Math.max(
      0.28,
      0.78 - wCoord * 0.35 + vPhase * 0.15
    );
    activeEcologicalEvent =
      wCoord > 0.2
        ? 'Singularity Skyward Rain · Relativistic Lift'
        : 'Event-Horizon Time-Mist';
  }

  // Check if queryPos is inside any 5D Cloud Caustic Zenith Beam
  let in5DCausticBeam = false;
  const nearestCausticBeamCenter = new THREE.Vector3(0, queryPos.y, 0);
  let minBeamDist = 999;

  if (causticBeams && causticBeams.length > 0) {
    for (const beam of causticBeams) {
      const d = Math.hypot(
        queryPos.x - beam.worldGroundPos.x,
        queryPos.z - beam.worldGroundPos.z
      );
      if (d < minBeamDist) {
        minBeamDist = d;
        nearestCausticBeamCenter.copy(beam.worldGroundPos);
      }
      if (d < 6.2) {
        in5DCausticBeam = true;
      }
    }
  }

  if (in5DCausticBeam) {
    effectiveGravityMultiplier *= 0.55;
    wy += 3.2;
    activeEcologicalEvent = '5D Cloud Caustic Communion · Zenith Uplift';
  }

  const windVec = new THREE.Vector3(wx, wy, wz);
  // Scent breeze flows along the horizontal wind + subtle harmonic curl
  const scentAngle = baseAngle + Math.sin(timeSec * 0.4 + queryPos.z * 0.04) * 0.42;
  const scentVec = new THREE.Vector3(
    Math.cos(scentAngle),
    0.12 * Math.sin(timeSec * 0.9),
    Math.sin(scentAngle)
  ).normalize();

  return {
    windVec,
    scentVec,
    effectiveGravityMultiplier,
    atmosphericViscosity: weather.fluidViscosity,
    piezoStiffnessMultiplier,
    squallIntensity,
    in5DCausticBeam,
    nearestCausticBeamCenter,
    activeEcologicalEvent,
  };
}

/**
 * Generates a true multi-lobed volumetric Cumulus / Lenticular Cloud Stratum Geometry
 * using polynomial smooth-minimum (smin) union of 6 billowing upper domes over a
 * sheared condensation base plane, with vertex-color underside self-shadowing.
 */
function createVolumetricCloudStratumGeometry(
  baseRadius: number,
  seed: number,
  isLenticularShear: boolean
): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(baseRadius, 3);
  const posAttr = geo.attributes.position;
  const count = posAttr.count;
  const colors = new Float32Array(count * 3);

  // 6 deterministic cloud billow turret centers
  const lobes: { x: number; y: number; z: number; r: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + (seed % 13) * 0.41;
    const dist = i === 0 ? 0 : baseRadius * (0.42 + ((seed + i * 7) % 10) * 0.038);
    const turretHeight = i === 0 ? baseRadius * 0.35 : baseRadius * (0.12 + ((i * 3) % 5) * 0.06);
    lobes.push({
      x: Math.cos(angle) * dist * (isLenticularShear ? 1.35 : 1.0),
      y: turretHeight,
      z: Math.sin(angle) * dist * (isLenticularShear ? 0.78 : 1.0),
      r: baseRadius * (i === 0 ? 0.62 : 0.44 + (i % 3) * 0.08),
    });
  }

  for (let i = 0; i < count; i++) {
    const vx = posAttr.getX(i);
    const vy = posAttr.getY(i);
    const vz = posAttr.getZ(i);
    const len = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1;
    const nx = vx / len;
    const ny = vy / len;
    const nz = vz / len;

    // Evaluate smooth multi-lobe billow envelope
    let field = 0;
    for (const l of lobes) {
      const dx = nx * baseRadius - l.x;
      const dy = ny * baseRadius - l.y;
      const dz = nz * baseRadius - l.z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      field += Math.exp(-d / (l.r * 0.85));
    }

    const billowScale = 0.72 + 0.36 * Math.min(1.6, field);
    let px = nx * baseRadius * billowScale * (isLenticularShear ? 1.45 : 1.15);
    let py = ny * baseRadius * billowScale * 0.42;
    let pz = nz * baseRadius * billowScale;

    // High-frequency turbulent anvil curl & wispy margin displacement
    const curl =
      Math.sin(nx * 5.2 + seed) * Math.cos(nz * 4.8 - seed * 0.5) * (baseRadius * 0.09);
    px += curl * 1.3;
    pz -= curl * 0.9;

    // Realistic atmospheric condensation level: flatten the cloud underside while keeping billowed turrets on top
    if (py < -baseRadius * 0.08) {
      py = -baseRadius * 0.08 + (py + baseRadius * 0.08) * 0.22;
    } else {
      // Windward anvil shear on upper turrets
      px += (py / baseRadius) * baseRadius * 0.32;
    }

    posAttr.setXYZ(i, px, py, pz);

    // Self-shadowing vertex colors: bright sunlit crest on top, deep indigo-slate occlusion on the flat underside
    const heightNorm = Math.max(0, Math.min(1, (ny + 0.55) / 1.45));
    const shade = 0.42 + 0.58 * Math.pow(heightNorm, 0.85);
    colors[i * 3] = shade;
    colors[i * 3 + 1] = shade;
    colors[i * 3 + 2] = Math.min(1, shade * 1.06);
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds the 5D Universe Cloud Canopy over the 4D Terrain Floor:
 * - 14 Multi-Lobed Volumetric Cumulus & Lenticular Cloud Strata whose billows fold in 5D (x,y,z,w,v)
 * - 6 Volumetric 5D Caustic God-Ray Pillars projecting down onto the 4D floor
 * - 3 Celestial 5D Clifford-Torus Horizon Ribbons
 */
export function build5DCloudCanopy(world: ManifoldWorldSpec): Cloud5DCanopyRig {
  const weather = resolveWorldWeather(world);
  const rng = createSeededRandom(world.seed + 5055);
  const group = new THREE.Group();

  const lobes: Cloud5DLobeInstance[] = [];
  const cloudColor = new THREE.Color(weather.cloud5DColor);
  const causticColor = new THREE.Color(weather.causticRayColor);

  // 1. Build 14 Multi-Lobed Volumetric Cloud Strata suspended at Y = 38..56 (Zero primitive torus donuts!)
  for (let i = 0; i < 14; i++) {
    const isLenticular =
      weather.cloud5DStyle === 'clifford-torus-billows' ||
      weather.cloud5DStyle === 'ferro-vortex-strata' ||
      i % 3 === 0;

    const geo = createVolumetricCloudStratumGeometry(
      7.5 + rng() * 6.5,
      world.seed + i * 37,
      isLenticular
    );

    const posAttr = geo.attributes.position;
    const count = posAttr.count;
    const basePositions = new Float32Array(count * 3);
    const wCoords = new Float32Array(count);
    const vCoords = new Float32Array(count);

    for (let v = 0; v < count; v++) {
      const vx = posAttr.getX(v);
      const vy = posAttr.getY(v);
      const vz = posAttr.getZ(v);
      basePositions[v * 3] = vx;
      basePositions[v * 3 + 1] = vy;
      basePositions[v * 3 + 2] = vz;

      // 4th (W) and 5th (V) dimensional coordinates for hyper-cloud folding
      wCoords[v] = Math.sin(vx * 0.22 + vz * 0.22) * 2.1;
      vCoords[v] = Math.cos(vx * 0.19 - vz * 0.24) * 1.8;
    }

    const mat = new THREE.MeshStandardMaterial({
      color: cloudColor,
      emissive: causticColor,
      emissiveIntensity: 0.08 + (i % 3) * 0.03,
      vertexColors: true,
      roughness: 0.85,
      metalness: 0.06,
      transparent: true,
      opacity: 0.42 + (i % 4) * 0.05,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geo, mat);
    const orbitAngle = (i / 14) * Math.PI * 2 + rng() * 0.4;
    const orbitRadius = i === 0 ? 4 : 16 + rng() * 48;
    const baseY = 39 + (i % 4) * 4.2;

    mesh.position.set(
      Math.cos(orbitAngle) * orbitRadius,
      baseY,
      Math.sin(orbitAngle) * orbitRadius
    );
    group.add(mesh);

    lobes.push({
      mesh,
      basePositions,
      wCoords,
      vCoords,
      orbitAngle,
      orbitRadius,
      baseY,
      orbitSpeed: (0.025 + rng() * 0.035) * (i % 2 === 0 ? 1 : -1),
    });
  }

  // 2. Build 6 Volumetric 5D Caustic God-Ray Pillars from the 5D Clouds to the 4D Floor
  const causticBeams: CausticBeamInstance[] = [];
  const coneGeo = new THREE.CylinderGeometry(1.3, 5.4, 46, 16, 1, true);
  const ringGeo = new THREE.RingGeometry(1.8, 4.8, 28);

  for (let b = 0; b < 6; b++) {
    const coneMat = new THREE.MeshBasicMaterial({
      color: causticColor,
      transparent: true,
      opacity: 0.025,
      side: THREE.FrontSide,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);

    const ringMat = new THREE.MeshBasicMaterial({
      color: causticColor,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const groundRingMesh = new THREE.Mesh(ringGeo, ringMat);
    groundRingMesh.rotation.x = -Math.PI / 2;
    groundRingMesh.visible = false;

    const orbitAngle = (b / 6) * Math.PI * 2;
    const orbitRadius = 14 + b * 7.5;
    const worldGroundPos = new THREE.Vector3(
      Math.cos(orbitAngle) * orbitRadius,
      0,
      Math.sin(orbitAngle) * orbitRadius
    );

    group.add(coneMesh);

    causticBeams.push({
      coneMesh,
      groundRingMesh,
      orbitAngle,
      orbitRadius,
      orbitSpeed: 0.045 * (b % 2 === 0 ? 1 : -0.8),
      worldGroundPos,
    });
  }

  // 3. Build 3 Celestial 5D Clifford-Torus Lattice Arcs high above the clouds
  const celestialArcs: THREE.Line[] = [];
  for (let a = 0; a < 3; a++) {
    const pts: THREE.Vector3[] = [];
    const segments = 64;
    const rad = 52 + a * 12;
    for (let s = 0; s <= segments; s++) {
      const t = (s / segments) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          Math.cos(t) * rad,
          48 + Math.sin(t * 3 + a) * 4.5,
          Math.sin(t) * rad
        )
      );
    }
    const arcGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const arcMat = new THREE.LineBasicMaterial({
      color: causticColor,
      transparent: true,
      opacity: 0.24,
    });
    const arcLine = new THREE.Line(arcGeo, arcMat);
    group.add(arcLine);
    celestialArcs.push(arcLine);
  }

  return { group, lobes, causticBeams, celestialArcs };
}

/**
 * Updates the 5D Cloud Canopy, folding cloud vertices through the 4th (W) and 5th (V)
 * dimensions and sweeping 5D Caustic God-Ray pillars across the 4D terrain floor.
 */
export function update5DCloudCanopy(
  canopy: Cloud5DCanopyRig,
  world: ManifoldWorldSpec,
  wCoord: number,
  timeSec: number,
  excavations?: TerrainExcavationSpot[]
) {
  const cosW = Math.cos(wCoord * 0.85 + timeSec * 0.22);
  const sinW = Math.sin(wCoord * 0.85 + timeSec * 0.22);
  const cosV = Math.cos(timeSec * 0.31);
  const sinV = Math.sin(timeSec * 0.31);

  const updateVerticesThisFrame = Math.floor(timeSec * 60) % 3 === 0;

  for (let i = 0; i < canopy.lobes.length; i++) {
    const lobe = canopy.lobes[i];
    const angle = lobe.orbitAngle + timeSec * lobe.orbitSpeed;
    lobe.mesh.position.x = Math.cos(angle) * lobe.orbitRadius;
    lobe.mesh.position.z = Math.sin(angle) * lobe.orbitRadius;
    lobe.mesh.position.y =
      lobe.baseY + Math.sin(timeSec * 0.45 + i) * 1.4 + wCoord * 2.2;
    lobe.mesh.rotation.y = timeSec * 0.06 * (i % 2 === 0 ? 1 : -1);

    if (updateVerticesThisFrame) {
      const posAttr = lobe.mesh.geometry.attributes.position;
      const base = lobe.basePositions;
      const wArr = lobe.wCoords;
      const vArr = lobe.vCoords;

      for (let k = 0; k < posAttr.count; k++) {
        const bx = base[k * 3];
        const by = base[k * 3 + 1];
        const bz = base[k * 3 + 2];
        const bw = wArr[k];
        const bv = vArr[k];

        // Rotate in X-W (4D) and Y-V (5D) planes
        const rx = bx * cosW - bw * sinW * 0.45;
        const ry = by * cosV - bv * sinV * 0.38;
        const rz = bz + (bx * sinW + bv * cosV) * 0.18;

        posAttr.setXYZ(k, rx, ry, rz);
      }
      posAttr.needsUpdate = true;
    }
  }

  // Update 6 Sweeping 5D Caustic God-Ray Pillars & Ground Caustic Rings
  for (let b = 0; b < canopy.causticBeams.length; b++) {
    const beam = canopy.causticBeams[b];
    const angle =
      beam.orbitAngle + timeSec * beam.orbitSpeed + wCoord * 0.45;
    const gx = Math.cos(angle) * beam.orbitRadius;
    const gz = Math.sin(angle) * beam.orbitRadius;
    const gy = evaluateTerrainHeight(gx, gz, world, excavations);

    beam.worldGroundPos.set(gx, gy, gz);

    beam.coneMesh.position.set(gx, gy + 22, gz);
    // Subtle tilt matching 4D W-shear
    beam.coneMesh.rotation.z = Math.sin(timeSec * 0.3 + b) * 0.08 + wCoord * 0.09;
    beam.coneMesh.rotation.x = Math.cos(timeSec * 0.25 + b) * 0.06;

    const pulse = 0.022 + 0.012 * Math.sin(timeSec * 1.6 + b * 1.3);
    (beam.coneMesh.material as THREE.MeshBasicMaterial).opacity = pulse;

    beam.groundRingMesh.position.set(gx, gy + 0.14, gz);
    const ringScale = 1.0 + 0.18 * Math.sin(timeSec * 2.2 + b);
    beam.groundRingMesh.scale.setScalar(ringScale);
  }

  for (let a = 0; a < canopy.celestialArcs.length; a++) {
    const arc = canopy.celestialArcs[a];
    arc.rotation.y = timeSec * 0.05 * (a % 2 === 0 ? 1 : -1) + wCoord * 0.4;
    arc.rotation.z = Math.sin(timeSec * 0.2 + a) * 0.12;
  }
}

/**
 * Builds the Particle-Based Dimensional Weather System (1,100 particles + 24 sculpted aerodynamic precipitation spindles).
 */
export function buildWeatherParticleField(
  world: ManifoldWorldSpec
): WeatherParticleRig {
  const weather = resolveWorldWeather(world);
  const rng = createSeededRandom(world.seed + 7717);
  const group = new THREE.Group();

  const particleCount = 450;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const phases = new Float32Array(particleCount);

  const c1 = new THREE.Color(weather.particlePrimaryColor);
  const c2 = new THREE.Color(weather.particleSecondaryColor);
  const tempColor = new THREE.Color();

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (rng() - 0.5) * 115;
    positions[i * 3 + 1] = rng() * 40;
    positions[i * 3 + 2] = (rng() - 0.5) * 115;

    velocities[i * 3] = (rng() - 0.5) * 2.0;
    velocities[i * 3 + 1] = -3.5 - rng() * 4.5;
    velocities[i * 3 + 2] = (rng() - 0.5) * 2.0;
    phases[i] = rng() * Math.PI * 2;

    tempColor.copy(c1).lerp(c2, rng());
    colors[i * 3] = tempColor.r;
    colors[i * 3 + 1] = tempColor.g;
    colors[i * 3 + 2] = tempColor.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size:
      weather.id === 'biolum-spore-monsoon' ||
      weather.id === 'piezoelectric-crystal-dust'
        ? 0.36
        : 0.28,
    vertexColors: true,
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);
  group.add(points);

  // 24 Sculpted Aerodynamic Precipitation Spindles / Spores (replaces raw OctahedronGeometry!)
  const macroMotes: THREE.Mesh[] = [];
  const moteGeo = new THREE.ConeGeometry(0.045, 0.34, 6, 1);
  moteGeo.scale(1.0, 1.4, 0.45);
  const moteMat = new THREE.MeshStandardMaterial({
    color: c1,
    emissive: c1,
    emissiveIntensity: 0.85,
    roughness: 0.2,
    metalness: 0.65,
    transparent: true,
    opacity: 0.75,
  });

  for (let m = 0; m < 24; m++) {
    const mesh = new THREE.Mesh(moteGeo, moteMat);
    mesh.position.set(
      (rng() - 0.5) * 75,
      2 + rng() * 24,
      (rng() - 0.5) * 75
    );
    mesh.userData.phase = rng() * Math.PI * 2;
    group.add(mesh);
    macroMotes.push(mesh);
  }

  return { group, points, velocities, phases, macroMotes };
}

/**
 * Steps the 3D Weather Particle System according to the active dimension's physics law and W-coordinate.
 */
export function updateWeatherParticleField(
  rig: WeatherParticleRig,
  world: ManifoldWorldSpec,
  wCoord: number,
  dt: number,
  timeSec: number,
  playerPos: THREE.Vector3,
  sampleField: BiomeWeatherFieldSample
) {
  const weather = resolveWorldWeather(world);
  const posAttr = rig.points.geometry.attributes.position;
  const count = posAttr.count;
  const wind = sampleField.windVec;

  for (let i = 0; i < count; i++) {
    let px = posAttr.getX(i);
    let py = posAttr.getY(i);
    let pz = posAttr.getZ(i);
    const phase = rig.phases[i];

    // Phenomenon-specific particle kinematics
    let vx = wind.x * 0.55 + Math.sin(timeSec * 1.4 + phase) * 1.2;
    let vz = wind.z * 0.55 + Math.cos(timeSec * 1.4 + phase) * 1.2;
    let vy = rig.velocities[i * 3 + 1];

    if (weather.id === 'graviton-shear-squall') {
      // Reverses vertical direction when W > 0.15!
      vy = wCoord > 0.15 ? 6.5 + wCoord * 6.0 : -7.5 + wCoord * 5.0;
      vx += Math.sin(py * 0.25 + timeSec * 3.0) * 4.5 * (0.4 + Math.abs(wCoord));
    } else if (weather.id === 'coriolis-magneto-hail') {
      // Strong cyclonic swirl around origin
      const r = Math.max(2, Math.hypot(px, pz));
      vx += (-pz / r) * (11.0 + Math.abs(wCoord) * 8.0);
      vz += (px / r) * (11.0 + Math.abs(wCoord) * 8.0);
      vy = -8.5 + wind.y * 0.5;
    } else if (weather.id === 'piezoelectric-crystal-dust') {
      // Shimmering harmonic standing wave curtains
      vy = Math.sin(px * 0.12 + pz * 0.12 + timeSec * 2.2) * 3.2 + wCoord * 2.5;
    } else if (weather.id === 'thermobaric-cinder-ash') {
      // Half embers rising in thermal chimneys, half heavy ash falling
      vy = i % 2 === 0 ? 5.2 + Math.sin(timeSec + phase) * 2.0 : -4.8;
    } else if (weather.id === 'biolum-spore-monsoon') {
      // Buoyant underwater-like spore drift
      vy = Math.sin(timeSec * 1.1 + phase) * 1.8 + wCoord * 1.5;
      vx *= 0.65;
      vz *= 0.65;
    } else {
      // 'singularity-inversion-rain': falls UPWARD into the 5D accretion canopy
      vy = 7.2 + Math.abs(wCoord) * 6.5;
    }

    px += vx * dt;
    py += vy * dt;
    pz += vz * dt;

    // Wrap particles around a 110m cylinder centered near the explorer/origin
    const centerX = playerPos.x * 0.5;
    const centerZ = playerPos.z * 0.5;
    if (px - centerX > 58) px -= 116;
    if (px - centerX < -58) px += 116;
    if (pz - centerZ > 58) pz -= 116;
    if (pz - centerZ < -58) pz += 116;

    if (py < 0.2) py = 38.5;
    if (py > 40.0) py = 0.5;

    posAttr.setXYZ(i, px, py, pz);
  }
  posAttr.needsUpdate = true;

  // Animate 3D polyhedral macro-motes
  for (let m = 0; m < rig.macroMotes.length; m++) {
    const mote = rig.macroMotes[m];
    const p = (mote.userData.phase as number) || 0;
    mote.position.x += wind.x * 0.32 * dt;
    mote.position.z += wind.z * 0.32 * dt;
    mote.position.y +=
      (Math.sin(timeSec * 1.8 + p) * 1.5 + wind.y * 0.25) * dt;
    mote.rotation.x += dt * 1.8;
    mote.rotation.y += dt * 2.2;

    if (mote.position.x > 45) mote.position.x = -45;
    if (mote.position.x < -45) mote.position.x = 45;
    if (mote.position.z > 45) mote.position.z = -45;
    if (mote.position.z < -45) mote.position.z = 45;
    if (mote.position.y < 1.2) mote.position.y = 24;
    if (mote.position.y > 26) mote.position.y = 1.5;
  }
}

/**
 * Builds 16 3D Scent-Like Breeze & Higher-Dimensional Pheromone Ribbons
 * that visibly weave through the 3D airspace and carry ecological scent signals!
 */
export function buildScentBreezeRibbons(
  world: ManifoldWorldSpec
): ScentBreezeRig {
  const weather = resolveWorldWeather(world);
  const rng = createSeededRandom(world.seed + 9091);
  const group = new THREE.Group();
  const ribbons: ScentBreezeRibbonInstance[] = [];

  const cScent = new THREE.Color(weather.scentBreezeColor);
  const cCaustic = new THREE.Color(weather.causticRayColor);
  const segCount = 22;

  for (let r = 0; r < 16; r++) {
    const positions = new Float32Array(segCount * 3);
    const colors = new Float32Array(segCount * 3);

    const isEntityScentTrail = r >= 10;
    const baseColor = isEntityScentTrail ? cCaustic : cScent;

    for (let s = 0; s < segCount; s++) {
      const t = s / (segCount - 1);
      // Taper brightness along the scent ribbon
      const intensity = Math.sin(t * Math.PI);
      colors[s * 3] = baseColor.r * intensity + 0.15;
      colors[s * 3 + 1] = baseColor.g * intensity + 0.15;
      colors[s * 3 + 2] = baseColor.b * intensity + 0.15;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: isEntityScentTrail ? 0.68 : 0.48,
      blending: THREE.AdditiveBlending,
    });

    const line = new THREE.Line(geo, mat);
    group.add(line);

    ribbons.push({
      line,
      positions,
      anchorX: (rng() - 0.5) * 68,
      anchorZ: (rng() - 0.5) * 68,
      altitudeOffset: 1.1 + rng() * 3.2,
      phaseOffset: rng() * Math.PI * 2,
      isEntityScentTrail,
    });
  }

  return { group, ribbons };
}

/**
 * Animates the 3D Scent-Like Breeze Ribbons so they flow downwind across the terrain
 * and visually link living entities, mined resource craters, and 5D phase currents.
 */
export function updateScentBreezeRibbons(
  rig: ScentBreezeRig,
  world: ManifoldWorldSpec,
  wCoord: number,
  timeSec: number,
  sampleField: BiomeWeatherFieldSample,
  entityPositions: THREE.Vector3[],
  excavations?: TerrainExcavationSpot[]
) {
  const segCount = 22;
  const scentDir = sampleField.scentVec;
  const perpX = -scentDir.z;
  const perpZ = scentDir.x;

  for (let r = 0; r < rig.ribbons.length; r++) {
    const rib = rig.ribbons[r];
    const posAttr = rib.line.geometry.attributes.position;

    let startX = rib.anchorX + Math.cos(timeSec * 0.18 + rib.phaseOffset) * 6;
    let startZ = rib.anchorZ + Math.sin(timeSec * 0.18 + rib.phaseOffset) * 6;

    // Anchor entity scent trails directly to live entities or mined craters so you can see their scent breeze!
    if (rib.isEntityScentTrail && entityPositions.length > 0) {
      const entPos = entityPositions[r % entityPositions.length];
      startX = entPos.x;
      startZ = entPos.z;
    }

    for (let s = 0; s < segCount; s++) {
      const distAlong = s * 1.15;
      // Traveling wave along the breeze ribbon
      const wavePhase =
        s * 0.45 - timeSec * 4.2 + rib.phaseOffset + wCoord * 1.8;
      const sway = Math.sin(wavePhase) * (0.65 + s * 0.045);
      const verticalWave = Math.cos(wavePhase * 0.85) * 0.42;

      const vx = startX + scentDir.x * distAlong + perpX * sway;
      const vz = startZ + scentDir.z * distAlong + perpZ * sway;
      const groundY = evaluateTerrainHeight(vx, vz, world, excavations);
      const vy =
        groundY +
        (rib.isEntityScentTrail ? 1.15 : rib.altitudeOffset) +
        verticalWave +
        Math.max(0, wCoord) * 0.8;

      posAttr.setXYZ(s, vx, vy, vz);
    }

    posAttr.needsUpdate = true;
  }
}

export function buildBiomeWeatherTelemetry(
  world: ManifoldWorldSpec,
  sample: BiomeWeatherFieldSample
): BiomeWeatherTelemetry {
  const weather = resolveWorldWeather(world);
  return {
    weatherName: weather.name,
    physicsLawName: weather.biomePhysicsLawName,
    cloud5DName: weather.cloud5DName,
    scentBreezeName: weather.scentBreezeName,
    windSpeed: Number(sample.windVec.length().toFixed(1)),
    effectiveGravity: Number(
      (world.gravity * sample.effectiveGravityMultiplier).toFixed(2)
    ),
    squallIntensity: Number(sample.squallIntensity.toFixed(2)),
    activeEcologicalEvent: sample.activeEcologicalEvent,
  };
}
