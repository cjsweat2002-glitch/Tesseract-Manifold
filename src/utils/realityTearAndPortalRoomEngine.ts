import * as THREE from 'three';
import {
  ALL_DIFFERENTIAL_BOUNDARY_IDS,
  DIFFERENTIAL_UNIVERSE_BOUNDARIES,
  DifferentialUniverseBoundaryId,
  MAZE_ENTITY_THEME_CATALOG,
  MAZE_TECH_EQUIPMENT_CATALOG,
  MULTIVERSAL_MATTER_CATALOG,
  MultiversalMatterId,
  PlacedPortalRoomModule,
  PORTAL_GATE_SHAPE_CATALOG,
  PORTAL_ROOM_TIERS,
  PortalGateShapeId,
  PortalRoomModuleKind,
  PortalRoomRuntimeTelemetry,
  PortalRoomTierId,
  ProceduralMazeLevelSpec,
} from '../types/portalAndBiodepth';
import {
  BASE_DIMENSIONAL_ELEMENTS,
  BaseDimensionalElementId,
} from './multiversalEmergenceAndCultureEngine';
import {
  generateStarting100ProceduralMazes,
  MAZE_DIMENSION_ORIGIN,
  ProceduralMazeDimensionRig,
} from './proceduralMazeDimensionEngine';
import { ManifoldWorldSpec } from '../types/manifold';
import { evaluateTerrainHeight } from './manifoldGenerator';

export const PORTAL_ROOM_ORIGIN = new THREE.Vector3(0, 600, 0);
export const PORTAL_ROOM_HALF_EXTENT = 17.5; // 36m x 36m total interior (wall to wall = 36m, playable clamp = [-17.2, 17.2])
export const PORTAL_ROOM_HEIGHT = 12.0;

/**
 * Custom GLSL Vertex & Fragment Shader for the Reality-Tear Portal:
 * - Grows organically from a jagged fracture (uOpenProgress = 0) into a 3.6m x 4.2m doorway (uOpenProgress = 1)
 * - Displaces perimeter vertices along normal vectors with multi-octave harmonic/simplex turbulence
 * - Samples the live WebGLRenderTarget (uPortalMap) showing the large Square Portal Room on the other side
 * - Applies FBM reality-tear edge masking, radial chromatic dispersion, and elemental/boundary plasma rim glow
 */
const REALITY_TEAR_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uOpenProgress;
  uniform float uDistortionStrength;
  varying vec2 vUv;
  varying vec3 vLocalPos;

  float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  void main() {
    vUv = uv;
    vLocalPos = position;

    // Radial distance from portal center in UV space [-1, 1]
    vec2 centered = (uv - 0.5) * 2.0;
    float radial = length(centered);

    // Tear edge organic breathing displacement
    float edgeBand = smoothstep(0.55, 1.0, radial);
    float wave1 = sin(centered.y * 9.0 + uTime * 3.8) * cos(centered.x * 7.0 - uTime * 2.9);
    float wave2 = sin(atan(centered.y, centered.x) * 8.0 + uTime * 4.5) * 0.5;
    float disp = (wave1 + wave2) * 0.085 * edgeBand * uDistortionStrength * uOpenProgress;

    // Scale portal geometry smoothly as the tear opens
    float openScale = max(0.001, smoothstep(0.0, 1.0, uOpenProgress));
    vec3 pos = position;
    pos.x *= mix(0.08, 1.0, openScale) + disp * 0.35;
    pos.y *= openScale + disp * 0.25;
    pos.z += disp;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const REALITY_TEAR_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uPortalMap;
  uniform float uTime;
  uniform float uOpenProgress;
  uniform float uDistortionStrength;
  uniform float uGateShapeIndex;
  uniform vec3 uPrimaryColor;
  uniform vec3 uSecondaryColor;
  uniform vec3 uElementColor;
  varying vec2 vUv;
  varying vec3 vLocalPos;

  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float val = 0.0;
    float amp = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 4; i++) {
      val += amp * noise2D(p);
      p = rot * p * 2.04 + vec2(uTime * 0.32, -uTime * 0.24);
      amp *= 0.5;
    }
    return val;
  }

  float evaluateGateShapeSDF(vec2 p, float shapeIdx, float angle, float r) {
    vec2 absP = abs(p);
    if (shapeIdx < 0.5) {
      // 0: Jagged Reality Tear (Rounded Rectangle)
      return length(max(absP - vec2(0.58, 0.68), 0.0)) + min(max(absP.x - 0.58, absP.y - 0.68), 0.0);
    } else if (shapeIdx < 1.5) {
      // 1: Swirling Portal-Fluid Vortex Ellipse (Rick & Morty inspired oval fluid vortex)
      vec2 ellip = p / vec2(0.76, 0.88);
      float spiralWave = sin(angle * 4.0 - r * 7.5 + uTime * 4.2) * 0.035;
      return length(ellip) - 0.78 + spiralWave;
    } else if (shapeIdx < 2.5) {
      // 2: Hexagram Merkaba Tessellation (6-pointed geometric star)
      float starWave = cos(angle * 6.0 + sin(uTime * 0.8) * 0.5) * 0.14;
      return r * (0.95 - starWave) - 0.68;
    } else if (shapeIdx < 3.5) {
      // 3: Biomorphic Cronenberg Iris (Pulsing organic sphincter-iris with peristaltic folds)
      float folds = sin(angle * 9.0 + sin(uTime * 2.4 + r * 4.0)) * 0.065 + cos(angle * 5.0 - uTime * 1.8) * 0.04;
      float breathe = sin(uTime * 3.2) * 0.045;
      return length(p / vec2(0.82, 0.86)) - (0.74 + breathe) + folds;
    } else if (shapeIdx < 4.5) {
      // 4: Mandelbrot Fractal Cardioid Slit
      float diamond = (absP.x * 0.88 + absP.y * 0.72);
      float bifurcation = abs(sin(angle * 8.0 + uTime * 1.5)) * 0.085;
      return diamond - 0.76 + bifurcation;
    } else if (shapeIdx < 5.5) {
      // 5: Tesseractic 8-Cell Hyper-Cross
      float armX = max(absP.x - 0.78, absP.y - 0.36);
      float armY = max(absP.x - 0.36, absP.y - 0.84);
      float crossDist = min(armX, armY);
      return crossDist + 0.14;
    } else {
      // 6: Ouroboros Paradox Chrono-Ring (Clockwork gear-toothed circular iris)
      float gearTeeth = smoothstep(-0.2, 0.2, sin(angle * 14.0 + uTime * 2.2)) * 0.055;
      return r - 0.75 + gearTeeth;
    }
  }

  void main() {
    if (uOpenProgress <= 0.01) discard;

    // Centered coordinates in [-1, 1]
    vec2 p = (vUv - 0.5) * 2.0;
    float angle = atan(p.y, p.x);
    float r = length(p);

    // Evaluate active customizable Portal Gate Shape SDF
    float boxDist = evaluateGateShapeSDF(p, uGateShapeIndex, angle, r);

    // Jagged FBM reality-tear distortion along the perimeter
    float tearNoise = fbm(vec2(angle * 2.6, r * 3.5 - uTime * 0.9));
    float crackle = fbm(p * 4.5 + vec2(0.0, uTime * 1.4));

    // Dynamic tear threshold based on uOpenProgress
    float shapeNoiseScale = (uGateShapeIndex > 0.5 && uGateShapeIndex < 1.5) ? 0.14 : 0.24;
    float distortedDist = boxDist + (tearNoise - 0.48) * shapeNoiseScale * uDistortionStrength;
    float outerCutoff = 0.22 * uOpenProgress;

    if (distortedDist > outerCutoff) {
      discard;
    }

    // Distance from the jagged outer tear edge inward
    float rimDepth = outerCutoff - distortedDist;

    // Gravitational lensing & chromatic dispersion near the reality-tear boundary
    float edgeFactor = smoothstep(0.24, 0.0, rimDepth);
    vec2 lensOffset = normalize(p + vec2(0.0001)) * (edgeFactor * 0.032 * uDistortionStrength) * sin(uTime * 4.0 + tearNoise * 6.28);

    // Mirror X slightly so looking into the portal matches direct sightline orientation
    vec2 sampleUv = vec2(1.0 - vUv.x, vUv.y) + lensOffset;
    sampleUv = clamp(sampleUv, 0.01, 0.99);

    float chromaShift = (0.0025 + edgeFactor * 0.014) * uDistortionStrength;
    float texR = texture2D(uPortalMap, clamp(sampleUv + vec2(chromaShift, 0.0), 0.01, 0.99)).r;
    float texG = texture2D(uPortalMap, sampleUv).g;
    float texB = texture2D(uPortalMap, clamp(sampleUv - vec2(chromaShift, 0.0), 0.01, 0.99)).b;
    vec3 roomSightlineColor = vec3(texR, texG, texB);

    // Slightly boost clarity & contrast of the live square room view inside the portal
    roomSightlineColor = pow(roomSightlineColor, vec3(0.92)) * 1.12;

    // Swirling Portal-Fluid Vortex overlay when Fluid Vortex or Ouroboros shape is active
    if (uGateShapeIndex > 0.5 && uGateShapeIndex < 1.5) {
      float swirl = fbm(vec2(angle * 3.0 - uTime * 2.2, r * 5.0 - uTime * 1.6));
      vec3 fluidSwirl = mix(uPrimaryColor, uSecondaryColor, swirl);
      roomSightlineColor = mix(roomSightlineColor, fluidSwirl * 1.35, edgeFactor * 0.48);
    }

    // Dual-band Reality-Tear Plasma Rim (Elemental Seed + Destination Universe Boundary)
    float outerRimMask = smoothstep(0.095, 0.0, rimDepth);
    float innerPlasmaMask = smoothstep(0.19, 0.04, rimDepth) * (0.65 + 0.35 * crackle);

    vec3 rimPalette = mix(uPrimaryColor, uSecondaryColor, 0.5 + 0.5 * sin(angle * 3.0 + uTime * 2.5));
    rimPalette = mix(rimPalette, uElementColor, 0.42 * crackle);

    vec3 finalColor = mix(roomSightlineColor, rimPalette * 1.65, innerPlasmaMask * 0.72);
    finalColor = mix(finalColor, vec3(1.0, 0.98, 0.95) * 2.2, outerRimMask * 0.85);

    // Subtle reality-tear scanline shimmer only on the extreme perimeter
    float alpha = smoothstep(0.0, 0.022, rimDepth);
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export interface HarvestableMatterNodeInstance {
  id: string;
  matterId: MultiversalMatterId;
  mesh: THREE.Group;
  pos: THREE.Vector3;
  harvestedCooldown: number;
}

export interface RealityTearPortalAndSquareRoomRig {
  // World-side Reality-Tear Portal (opens in front of the player in the exterior world)
  worldPortalGroup: THREE.Group;
  worldPortalPlaneMesh: THREE.Mesh;
  worldPortalFrameGroup: THREE.Group;
  worldPortalMaterial: THREE.ShaderMaterial;
  worldPortalPos: THREE.Vector3;
  worldPortalYaw: number;

  // Large 36m x 36m x 12m Square Portal Room at PORTAL_ROOM_ORIGIN [0, 600, 0]
  squareRoomGroup: THREE.Group;
  returnPortalGroup: THREE.Group;
  returnPortalPlaneMesh: THREE.Mesh;
  returnPortalMaterial: THREE.ShaderMaterial;

  // Secondary Reality-Tear Maze Portal inside the Square Portal Room (right beside South Return Entrance at x = +6.8, z = +15.8)
  innerMazePortalGroup: THREE.Group;
  innerMazePortalPlaneMesh: THREE.Mesh;
  innerMazePortalFrameGroup: THREE.Group;
  innerMazePortalMaterial: THREE.ShaderMaterial;
  innerMazeMonitorScreenMesh: THREE.Mesh;
  mazeDimensionRig: ProceduralMazeDimensionRig;
  knownMazes: ProceduralMazeLevelSpec[];
  selectedMazeIndex: number;
  isInnerMazePortalOpen: boolean;
  innerMazePortalProgress: number;
  isPlayerInsideMazeDimension: boolean;

  // Upgradeable Room Tier Visual Groups
  tier1ConduitsGroup: THREE.Group;
  tier2BiodepthDomeGroup: THREE.Group;
  tier3NexusBaysGroup: THREE.Group;

  // Interactive 3D Stations inside the Square Portal Room
  crucibleStationGroup: THREE.Group;
  crucibleOrbitalMeshes: THREE.Mesh[];
  infuserStationGroup: THREE.Group;
  armoryStationGroup: THREE.Group;
  placedModulesGroup: THREE.Group;

  // Live Render-to-Texture Sightline Camera & Target (Splitgate / Portal style)
  portalRenderTarget: THREE.WebGLRenderTarget;
  portalEyeCamera: THREE.PerspectiveCamera;

  // Exterior World Harvestable Multiversal Matter Nodes
  matterNodesGroup: THREE.Group;
  matterNodes: HarvestableMatterNodeInstance[];

  // Runtime state
  portalOpenProgress: number; // 0 = closed, 1 = fully torn open
  isPortalOpenInWorld: boolean;
  isPlayerInsidePortalRoom: boolean;
  savedExteriorPos: THREE.Vector3;
  savedExteriorYaw: number;
  portalTeleportCooldown: number;
  currentTier: PortalRoomTierId;
  activeModuleKind: PortalRoomModuleKind;
  lastRenderTargetSize: number;
}

export function createRealityTearShaderMaterial(
  renderTargetTexture: THREE.Texture,
  primaryHex: string,
  secondaryHex: string,
  elementHex: string,
  gateShapeIndex: number = 0
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uPortalMap: { value: renderTargetTexture },
      uTime: { value: 0 },
      uOpenProgress: { value: 0 },
      uDistortionStrength: { value: 1.0 },
      uGateShapeIndex: { value: gateShapeIndex },
      uPrimaryColor: { value: new THREE.Color(primaryHex) },
      uSecondaryColor: { value: new THREE.Color(secondaryHex) },
      uElementColor: { value: new THREE.Color(elementHex) },
    },
    vertexShader: REALITY_TEAR_VERTEX_SHADER,
    fragmentShader: REALITY_TEAR_FRAGMENT_SHADER,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: true,
  });
}

/**
 * Builds the 3D fractured chitin/obsidian reality-tear frame shards that orbit the portal rim
 */
function buildRealityTearFrameGroup(
  primaryHex: string,
  secondaryHex: string
): THREE.Group {
  const frameGroup = new THREE.Group();
  const shardMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#0f172a'),
    emissive: new THREE.Color(primaryHex),
    emissiveIntensity: 0.95,
    metalness: 0.85,
    roughness: 0.18,
    clearcoat: 1.0,
  });

  const secondaryMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(secondaryHex),
    emissive: new THREE.Color(secondaryHex),
    emissiveIntensity: 1.25,
    metalness: 0.6,
    roughness: 0.2,
  });

  // 14 fractured perimeter reality-tear shards framing the 3.6m x 4.2m portal aperture
  const shardGeo = new THREE.OctahedronGeometry(0.18, 0);
  shardGeo.scale(0.65, 2.4, 0.55);
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2;
    const rx = Math.cos(angle) * 1.72;
    const ry = Math.sin(angle) * 2.02;
    const shard = new THREE.Mesh(
      shardGeo,
      i % 2 === 0 ? shardMat : secondaryMat
    );
    shard.position.set(rx, ry, 0);
    shard.rotation.z = angle + Math.PI * 0.5;
    shard.userData.baseAngle = angle;
    shard.userData.baseRx = rx;
    shard.userData.baseRy = ry;
    frameGroup.add(shard);
  }

  return frameGroup;
}

/**
 * Builds a taut wrought-iron chain segment between two 3D points (inspired by voidwalker_glitch_stealth.png)
 */
function buildWroughtIronChainSpan(
  start: THREE.Vector3,
  end: THREE.Vector3,
  linkCount: number,
  ironMat: THREE.Material,
  emberMat?: THREE.Material
): THREE.Group {
  const chainGroup = new THREE.Group();
  const dir = end.clone().sub(start);
  const totalLen = dir.length();
  const linkGeo = new THREE.TorusGeometry(0.085, 0.026, 6, 12);
  linkGeo.scale(1.0, 1.55, 0.7);

  const up = new THREE.Vector3(0, 1, 0);
  const quat = new THREE.Quaternion().setFromUnitVectors(
    up,
    dir.clone().normalize()
  );

  for (let i = 0; i < linkCount; i++) {
    const t = (i + 0.5) / linkCount;
    const pos = start.clone().lerp(end, t);
    const link = new THREE.Mesh(
      linkGeo,
      emberMat && i % 5 === 2 ? emberMat : ironMat
    );
    link.position.copy(pos);
    link.quaternion.copy(quat);
    link.rotateY((i % 2) * (Math.PI * 0.5));
    chainGroup.add(link);
  }
  // Central occult sigil medallion along the chain span
  if (totalLen > 2.2) {
    const mid = start.clone().lerp(end, 0.5);
    const sigil = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.16, 0),
      emberMat || ironMat
    );
    sigil.scale.set(1.2, 1.2, 0.35);
    sigil.position.copy(mid);
    sigil.quaternion.copy(quat);
    chainGroup.add(sigil);
  }
  return chainGroup;
}

/**
 * Starter Interior Sections pre-installed in the 36m x 36m Portal Room so the room immediately has walkable multi-elevation depth
 */
export const DEFAULT_PORTAL_ROOM_STARTER_MODULES: PlacedPortalRoomModule[] = [
  {
    id: 'starter-mezzanine-west',
    kind: 'interior-mezzanine-catwalk',
    name: 'Mezzanine Gallery & Access Ramp',
    gx: -8,
    gz: -4,
    rotationY: 0,
    accentHex: '#f97316',
  },
  {
    id: 'starter-sanctum-east',
    kind: 'interior-sanctum-alcove',
    name: 'Cyber-Occult Reliquary Sanctum Room',
    gx: 8,
    gz: -6,
    rotationY: 0,
    accentHex: '#f97316',
  },
  {
    id: 'starter-liminal-tear-southeast',
    kind: 'interior-liminal-backrooms-corridor',
    name: 'Liminal Anomaly Tear Corridor',
    gx: 8,
    gz: 4,
    rotationY: 0,
    accentHex: '#eab308',
  },
  {
    id: 'starter-gravity-pad-center',
    kind: 'harmonic-gravity-pad',
    name: 'Graviton Updraft & Stabilizer Pad',
    gx: -4,
    gz: 2,
    rotationY: 0,
    accentHex: '#38bdf8',
  },
];

/**
 * Evaluates the walkable floor elevation (including sloped ramps, mezzanine decks, command bridges,
 * forging daises, and graviton lift updrafts) inside the 36m x 36m Portal Room.
 */
export function evaluatePortalRoomInteriorGroundAndGravity(
  worldX: number,
  worldZ: number,
  currentFeetY: number,
  placedModules: PlacedPortalRoomModule[],
  gravityModeOrScale: string | number = 'stabilized-1g',
  exteriorGravityOrMode: number | string = 1.0
): {
  groundY: number;
  ceilingY: number;
  effectiveGravityScale: number;
  effectiveGravity: number;
  updraftAcceleration: number;
  updraftBoost: number;
  activeSectionName: string | null;
  pushOutX: number;
  pushOutZ: number;
} {
  const baseFloorY = PORTAL_ROOM_ORIGIN.y;
  const ceilingY = PORTAL_ROOM_ORIGIN.y + PORTAL_ROOM_HEIGHT - 1.85;
  const localX = worldX - PORTAL_ROOM_ORIGIN.x;
  const localZ = worldZ - PORTAL_ROOM_ORIGIN.z;

  let highestWalkableY = baseFloorY;
  let updraftAcceleration = 0;
  let activeSectionName: string | null = null;
  let pushOutX = 0;
  let pushOutZ = 0;

  const gravityMode =
    typeof gravityModeOrScale === 'string'
      ? gravityModeOrScale
      : typeof exteriorGravityOrMode === 'string'
        ? exteriorGravityOrMode
        : 'stabilized-1g';
  const boundaryGravityScale =
    typeof gravityModeOrScale === 'number'
      ? gravityModeOrScale
      : typeof exteriorGravityOrMode === 'number'
        ? exteriorGravityOrMode / 9.81
        : 1.0;

  // Base gravity inside the Portal Room:
  // By default 'stabilized-1g' / 'calibrated-1g' provides crisp 1.0G sanctuary gravity so jumping and walking feel grounded and predictable!
  let effectiveGravityScale =
    gravityMode === 'stabilized-1g' || gravityMode === 'calibrated-1g'
      ? 1.0
      : gravityMode === 'low-g-architect' || gravityMode === 'zero-g-levitation'
        ? 0.42
        : THREE.MathUtils.clamp(boundaryGravityScale, 0.55, 1.35);

  // Also check the North Synthesis Crucible dais and East/West station plinths
  if (Math.hypot(localX - 0, localZ - -12.5) < 2.55) {
    if (currentFeetY >= baseFloorY + 0.2) {
      highestWalkableY = Math.max(highestWalkableY, baseFloorY + 0.75);
      activeSectionName = 'Synthesis Crucible Dais';
    }
  }

  for (const mod of placedModules) {
    // Transform player position into the module's local rotated frame
    const dx = localX - mod.gx;
    const dz = localZ - mod.gz;
    const cosR = Math.cos(-mod.rotationY);
    const sinR = Math.sin(-mod.rotationY);
    const mx = dx * cosR - dz * sinR;
    const mz = dx * sinR + dz * cosR;

    if (mod.kind === 'interior-mezzanine-catwalk') {
      // Main 6m x 4m elevated deck (mx in [-3.1, 3.1], mz in [-2.1, 2.1]) at +2.6m
      // Plus integrated sloped access ramp on the +X side (mx in [3.1, 6.5], mz in [-1.5, 1.5])
      if (Math.abs(mx) <= 3.1 && Math.abs(mz) <= 2.1) {
        const deckY = baseFloorY + 2.6;
        if (currentFeetY + 0.85 >= deckY) {
          if (deckY > highestWalkableY) {
            highestWalkableY = deckY;
            activeSectionName = 'Mezzanine Gallery Deck (+2.6m)';
          }
        }
      } else if (mx > 3.1 && mx <= 6.6 && Math.abs(mz) <= 1.55) {
        const rampT = 1.0 - (mx - 3.1) / 3.5; // 1.0 at mx=3.1 (top), 0.0 at mx=6.6 (bottom)
        const rampY = baseFloorY + THREE.MathUtils.clamp(rampT, 0, 1) * 2.6;
        if (currentFeetY + 1.1 >= rampY && rampY > highestWalkableY) {
          highestWalkableY = rampY;
          activeSectionName = 'Mezzanine Access Ramp';
        }
      }
    } else if (mod.kind === 'interior-command-bridge-deck') {
      // 8m x 4m elevated command bridge at +1.8m (mx in [-4.0, 4.0], mz in [-2.0, 2.0])
      // Plus dual side approach ramps at mz in [2.0, 4.8]
      if (Math.abs(mx) <= 4.0 && Math.abs(mz) <= 2.0) {
        const bridgeY = baseFloorY + 1.8;
        if (currentFeetY + 0.85 >= bridgeY && bridgeY > highestWalkableY) {
          highestWalkableY = bridgeY;
          activeSectionName = 'Astral Command Bridge (+1.8m)';
        }
      } else if (Math.abs(mx) <= 3.6 && mz > 2.0 && mz <= 4.8) {
        const rampT = 1.0 - (mz - 2.0) / 2.8;
        const rampY = baseFloorY + THREE.MathUtils.clamp(rampT, 0, 1) * 1.8;
        if (currentFeetY + 1.1 >= rampY && rampY > highestWalkableY) {
          highestWalkableY = rampY;
          activeSectionName = 'Command Bridge Approach Ramp';
        }
      }
    } else if (mod.kind === 'interior-furnace-foundry-bay') {
      // 6m x 4m raised forging dais at +0.6m (step-up walkable from floor!)
      if (Math.abs(mx) <= 3.1 && Math.abs(mz) <= 2.1) {
        const daisY = baseFloorY + 0.6;
        if (currentFeetY + 0.95 >= daisY && daisY > highestWalkableY) {
          highestWalkableY = daisY;
          activeSectionName = 'Furnace-Amber Foundry Wing (+0.6m)';
        }
      }
    } else if (mod.kind === 'interior-sanctum-alcove') {
      // 6m x 6m obsidian sanctum floor at +0.25m
      if (Math.abs(mx) <= 3.0 && Math.abs(mz) <= 3.0) {
        const sanctumY = baseFloorY + 0.25;
        if (sanctumY > highestWalkableY) {
          highestWalkableY = sanctumY;
          activeSectionName = 'Cyber-Occult Reliquary Sanctum';
        }
      }
    } else if (mod.kind === 'interior-liminal-backrooms-corridor') {
      // 6m x 4m Liminal Anomaly Tear Corridor at +0.2m
      if (Math.abs(mx) <= 3.0 && Math.abs(mz) <= 2.0) {
        const liminalY = baseFloorY + 0.2;
        if (liminalY > highestWalkableY) {
          highestWalkableY = liminalY;
          activeSectionName = 'Liminal Anomaly Tear Corridor';
        }
      }
    } else if (mod.kind === 'interior-voidwalker-armory-vault') {
      // 6m x 4m armory vault floor at +0.3m
      if (Math.abs(mx) <= 3.0 && Math.abs(mz) <= 2.0) {
        const vaultY = baseFloorY + 0.3;
        if (vaultY > highestWalkableY) {
          highestWalkableY = vaultY;
          activeSectionName = 'Voidwalker Stealth Armory Vault';
        }
      }
    } else if (mod.kind === 'matter-containment-plinth') {
      if (Math.abs(mx) <= 0.85 && Math.abs(mz) <= 0.85) {
        const plinthY = baseFloorY + 1.25;
        if (currentFeetY + 0.75 >= plinthY && plinthY > highestWalkableY) {
          highestWalkableY = plinthY;
          activeSectionName = 'Reliquary Containment Plinth';
        }
      }
    } else if (mod.kind === 'harmonic-gravity-pad') {
      const distPad = Math.hypot(mx, mz);
      if (distPad <= 1.65) {
        const padY = baseFloorY + 0.18;
        if (padY > highestWalkableY) {
          highestWalkableY = padY;
        }
        // Localized low-gravity updraft column so players can float up to Mezzanine Decks effortlessly!
        effectiveGravityScale = 0.35;
        updraftAcceleration = 13.5;
        activeSectionName = 'Graviton Lift Column (Low-G Updraft)';
      }
    } else if (mod.kind === 'brutalist-partition-wall') {
      // Solid horizontal wall collision (3.8m wide x 0.45m thick) unless player is above 4.4m
      if (
        currentFeetY < baseFloorY + 4.3 &&
        Math.abs(mx) < 1.95 &&
        Math.abs(mz) < 0.55
      ) {
        const signZ = mz >= 0 ? 1 : -1;
        const penZ = 0.55 - Math.abs(mz);
        const worldPushX = -sinR * (signZ * penZ);
        const worldPushZ = cosR * (signZ * penZ);
        pushOutX += worldPushX;
        pushOutZ += worldPushZ;
      }
    }
  }

  return {
    groundY: highestWalkableY,
    ceilingY,
    effectiveGravityScale,
    effectiveGravity: effectiveGravityScale * 9.81,
    updraftAcceleration,
    updraftBoost: updraftAcceleration,
    activeSectionName,
    pushOutX,
    pushOutZ,
  };
}

/**
 * Builds a custom placed 3D module or Walkable Interior Section inside the Square Portal Room,
 * deeply inspired by the Cyber-Occult Glitch Stealth art direction (voidwalker_glitch_stealth.png).
 */
export function buildPlacedPortalRoomModuleMesh(
  mod: PlacedPortalRoomModule
): THREE.Group {
  const group = new THREE.Group();
  const accent = new THREE.Color(mod.accentHex || '#f97316');

  const obsidianMat = new THREE.MeshPhysicalMaterial({
    color: '#0c0e14',
    metalness: 0.86,
    roughness: 0.22,
    clearcoat: 0.75,
  });
  const charcoalIronMat = new THREE.MeshStandardMaterial({
    color: '#1b1f2a',
    metalness: 0.88,
    roughness: 0.34,
  });
  const furnaceEmberMat = new THREE.MeshStandardMaterial({
    color: '#f97316',
    emissive: '#ea580c',
    emissiveIntensity: 1.45,
    metalness: 0.35,
    roughness: 0.2,
  });
  const glowMat = new THREE.MeshStandardMaterial({
    color: accent,
    emissive: accent,
    emissiveIntensity: 1.25,
    metalness: 0.4,
    roughness: 0.18,
  });
  const diamondWhiteMat = new THREE.MeshBasicMaterial({
    color: '#f8fafc',
  });

  if (mod.kind === 'interior-mezzanine-catwalk') {
    // 1. Walkable 6m x 4m Second-Story Deck at y = +2.6m
    const deckSlab = new THREE.Mesh(
      new THREE.BoxGeometry(6.0, 0.28, 4.0),
      obsidianMat
    );
    deckSlab.position.set(0, 2.46, 0);
    group.add(deckSlab);

    // Incised furnace-amber sacred geometry perimeter trim on deck
    const deckRim = new THREE.Mesh(
      new THREE.BoxGeometry(6.08, 0.06, 4.08),
      furnaceEmberMat
    );
    deckRim.position.set(0, 2.58, 0);
    group.add(deckRim);

    // 4 Faceted Charcoal-Iron Support Columns
    for (const cx of [-2.7, 2.7]) {
      for (const cz of [-1.7, 1.7]) {
        const col = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.24, 2.5, 6),
          charcoalIronMat
        );
        col.position.set(cx, 1.25, cz);
        group.add(col);

        // Guardrail stanchion posts on top of deck
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.07, 0.09, 1.1, 6),
          charcoalIronMat
        );
        post.position.set(cx, 3.15, cz);
        group.add(post);
      }
    }

    // Wrought-Iron Chain Guardrails along North, South, and West deck edges
    group.add(
      buildWroughtIronChainSpan(
        new THREE.Vector3(-2.7, 3.45, -1.7),
        new THREE.Vector3(2.7, 3.45, -1.7),
        14,
        charcoalIronMat,
        furnaceEmberMat
      )
    );
    group.add(
      buildWroughtIronChainSpan(
        new THREE.Vector3(-2.7, 3.45, 1.7),
        new THREE.Vector3(2.7, 3.45, 1.7),
        14,
        charcoalIronMat,
        furnaceEmberMat
      )
    );

    // Sloped Walk-Up Access Ramp on +X side (from x=3.0, y=2.6 down to x=6.5, y=0.0)
    const rampLen = Math.hypot(3.5, 2.6);
    const rampAngle = Math.atan2(2.6, 3.5);
    const rampGroup = new THREE.Group();
    rampGroup.position.set(4.75, 1.3, 0);
    rampGroup.rotation.z = -rampAngle;

    const rampMesh = new THREE.Mesh(
      new THREE.BoxGeometry(rampLen, 0.22, 2.8),
      charcoalIronMat
    );
    rampGroup.add(rampMesh);

    // Glowing furnace-amber anti-slip tread bars along the ramp
    for (let t = -0.42; t <= 0.42; t += 0.14) {
      const tread = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.25, 2.65),
        t === 0 ? glowMat : furnaceEmberMat
      );
      tread.position.x = t * rampLen;
      rampGroup.add(tread);
    }
    group.add(rampGroup);
  } else if (mod.kind === 'interior-sanctum-alcove') {
    // 2. Cyber-Occult Reliquary Sanctum Room (6m x 6m walk-in chamber inspired by voidwalker_glitch_stealth.png)
    const sanctumFloor = new THREE.Mesh(
      new THREE.BoxGeometry(6.0, 0.25, 6.0),
      obsidianMat
    );
    sanctumFloor.position.y = 0.125;
    group.add(sanctumFloor);

    // Sacred geometry incised floor rings
    for (const rad of [1.4, 2.35]) {
      const floorRing = new THREE.Mesh(
        new THREE.RingGeometry(rad - 0.05, rad, 32),
        rad < 1.8 ? furnaceEmberMat : glowMat
      );
      floorRing.rotation.x = -Math.PI / 2;
      floorRing.position.y = 0.26;
      group.add(floorRing);
    }

    // 4 Faceted Obsidian Corner Monolith Pillars + Upper Architrave Crown
    for (const cx of [-2.75, 2.75]) {
      for (const cz of [-2.75, 2.75]) {
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.28, 0.38, 4.6, 6),
          charcoalIronMat
        );
        pillar.position.set(cx, 2.3, cz);
        group.add(pillar);

        // Diagonal Wrought-Iron Chain from pillar top to central suspended diamond reliquary
        group.add(
          buildWroughtIronChainSpan(
            new THREE.Vector3(cx, 4.35, cz),
            new THREE.Vector3(cx * 0.18, 2.85, cz * 0.18),
            11,
            charcoalIronMat,
            furnaceEmberMat
          )
        );
      }
    }

    // Suspended Octahedral Obsidian-Iron Filigree Reliquary with Diamond-White Singularity Core
    const reliquaryCage = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.68, 0),
      new THREE.MeshStandardMaterial({
        color: '#1e293b',
        emissive: '#f97316',
        emissiveIntensity: 0.7,
        metalness: 0.9,
        roughness: 0.15,
        wireframe: true,
      })
    );
    reliquaryCage.position.y = 2.65;
    reliquaryCage.userData.isFloatingCrystal = true;
    group.add(reliquaryCage);

    const innerStar = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.32, 1),
      diamondWhiteMat
    );
    innerStar.position.y = 2.65;
    innerStar.userData.isFloatingCrystal = true;
    group.add(innerStar);
  } else if (mod.kind === 'interior-liminal-backrooms-corridor') {
    // 2B. Liminal Anomaly Tear Corridor (Directly inspired by voidwalker_brand_anchor.png:
    // Left half = damp ochre institutional corridor + buzzing fluorescent panel;
    // Center = viscous black ferrofluid reality tear + blazing golden runic halo;
    // Right half = cosmic void monolith + palm stigmata reticle)
    const ochreCarpetMat = new THREE.MeshStandardMaterial({
      color: '#5c4d26',
      roughness: 0.92,
      metalness: 0.05,
    });
    const ochreWallMat = new THREE.MeshStandardMaterial({
      color: '#857135',
      roughness: 0.82,
      metalness: 0.08,
    });
    const goldHaloMat = new THREE.MeshStandardMaterial({
      color: '#fde047',
      emissive: '#eab308',
      emissiveIntensity: 1.75,
      metalness: 0.6,
      roughness: 0.15,
    });

    // Left Half: Liminal Ochre Floor & Wall Partition + Fluorescent Ceiling Tile
    const leftFloor = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 0.2, 4.0),
      ochreCarpetMat
    );
    leftFloor.position.set(-1.5, 0.1, 0);
    group.add(leftFloor);

    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 3.8, 3.9),
      ochreWallMat
    );
    leftWall.position.set(-2.85, 2.0, 0);
    group.add(leftWall);

    const leftCeiling = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 0.18, 4.0),
      ochreWallMat
    );
    leftCeiling.position.set(-1.5, 3.9, 0);
    group.add(leftCeiling);

    const fluorescentPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.06, 1.35),
      diamondWhiteMat
    );
    fluorescentPanel.position.set(-1.4, 3.8, 0);
    group.add(fluorescentPanel);

    // Right Half: Fractured Cosmic Obsidian Floor & Floating Door Monolith
    const rightFloor = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 0.2, 4.0),
      obsidianMat
    );
    rightFloor.position.set(1.5, 0.1, 0);
    group.add(rightFloor);

    const floatingDoor = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.85, 0.14),
      charcoalIronMat
    );
    floatingDoor.position.set(2.1, 1.45, -1.1);
    floatingDoor.rotation.z = -0.24;
    floatingDoor.rotation.y = -0.35;
    group.add(floatingDoor);

    // Center Bisection: Viscous Black Ferrofluid Tendrils + Blazing Golden Runic Halo Crown + Palm Stigmata Reticle
    for (let t = 0; t < 7; t++) {
      const tendril = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.14, 3.9, 7),
        obsidianMat
      );
      tendril.position.set(
        Math.sin(t * 1.7) * 0.25,
        2.0,
        -1.5 + t * 0.5
      );
      tendril.rotation.z = Math.cos(t * 2.1) * 0.18;
      group.add(tendril);
    }

    const runicHaloOuter = new THREE.Mesh(
      new THREE.TorusGeometry(0.68, 0.045, 10, 32),
      goldHaloMat
    );
    runicHaloOuter.position.set(0, 2.35, -0.4);
    group.add(runicHaloOuter);

    const runicHaloInner = new THREE.Mesh(
      new THREE.RingGeometry(0.42, 0.52, 24),
      goldHaloMat
    );
    runicHaloInner.position.set(0, 2.35, -0.4);
    group.add(runicHaloInner);
  } else if (mod.kind === 'interior-furnace-foundry-bay') {
    // 3. Furnace-Amber Crucible Foundry Wing (6m x 4m raised +0.6m forging dais)
    const dais = new THREE.Mesh(
      new THREE.BoxGeometry(6.0, 0.6, 4.0),
      charcoalIronMat
    );
    dais.position.y = 0.3;
    group.add(dais);

    const emberChannel = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 0.63, 0.32),
      furnaceEmberMat
    );
    emberChannel.position.y = 0.3;
    group.add(emberChannel);

    // Central Faceted Obsidian Dimensional Anvil
    const anvilBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.72, 0.95, 6),
      obsidianMat
    );
    anvilBase.position.set(0, 1.05, 0);
    group.add(anvilBase);

    const anvilHorn = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.62, 0),
      charcoalIronMat
    );
    anvilHorn.scale.set(1.6, 0.45, 0.85);
    anvilHorn.position.set(0, 1.55, 0);
    group.add(anvilHorn);

    // Twin Molten Furnace Smelting Columns on left/right
    for (const side of [-2.2, 2.2]) {
      const vat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.54, 3.2, 8),
        obsidianMat
      );
      vat.position.set(side, 2.2, -1.2);
      group.add(vat);

      const core = new THREE.Mesh(
        new THREE.CylinderGeometry(0.51, 0.51, 1.4, 8),
        furnaceEmberMat
      );
      core.position.set(side, 2.1, -1.2);
      group.add(core);
    }
  } else if (mod.kind === 'interior-command-bridge-deck') {
    // 4. Elevated Astral Command Bridge (8m x 4m deck at +1.8m with front approach ramp)
    const bridgeDeck = new THREE.Mesh(
      new THREE.BoxGeometry(8.0, 0.26, 4.0),
      obsidianMat
    );
    bridgeDeck.position.set(0, 1.67, 0);
    group.add(bridgeDeck);

    // Approach ramp on +Z side (mz from 2.0 to 4.8)
    const rLen = Math.hypot(2.8, 1.8);
    const rAng = Math.atan2(1.8, 2.8);
    const ramp = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.2, rLen),
      charcoalIronMat
    );
    ramp.position.set(0, 0.9, 3.4);
    ramp.rotation.x = rAng;
    group.add(ramp);

    // Central Holo-Astrolabe Tactical Table on the bridge deck
    const tablePlinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 1.15, 0.85, 8),
      charcoalIronMat
    );
    tablePlinth.position.set(0, 2.22, 0);
    group.add(tablePlinth);

    const holoRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.82, 0.045, 8, 28),
      glowMat
    );
    holoRing.rotation.x = Math.PI / 2;
    holoRing.position.set(0, 2.85, 0);
    group.add(holoRing);

    // Horizontal RGB-Split Datamosh Glitch Holoscreen Bars behind the bridge
    for (let b = 0; b < 5; b++) {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(3.6 - b * 0.35, 0.09, 0.04),
        b % 2 === 0 ? furnaceEmberMat : glowMat
      );
      bar.position.set((b % 2 === 0 ? 1 : -1) * 0.22, 2.5 + b * 0.28, -1.85);
      group.add(bar);
    }
  } else if (mod.kind === 'interior-voidwalker-armory-vault') {
    // 5. Voidwalker Stealth Armory Section (6m x 4m walk-in vault)
    const vaultBase = new THREE.Mesh(
      new THREE.BoxGeometry(6.0, 0.3, 4.0),
      obsidianMat
    );
    vaultBase.position.y = 0.15;
    group.add(vaultBase);

    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(5.8, 3.8, 0.35),
      charcoalIronMat
    );
    backWall.position.set(0, 2.05, -1.8);
    group.add(backWall);

    // 3 Faceted Voidwalker Armor & Weapon Display Lockers along the back wall
    for (const lx of [-1.85, 0, 1.85]) {
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.35, 2.8, 0.45),
        obsidianMat
      );
      frame.position.set(lx, 1.7, -1.55);
      group.add(frame);

      // Faceted Angular Voidwalker Helm Display bust inside each locker
      const helmBust = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.28, 0),
        charcoalIronMat
      );
      helmBust.scale.set(0.85, 1.35, 1.05);
      helmBust.position.set(lx, 2.15, -1.32);
      group.add(helmBust);

      const helmOcular = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        furnaceEmberMat
      );
      helmOcular.position.set(lx - 0.08, 2.18, -1.08);
      group.add(helmOcular);
    }
  } else if (mod.kind === 'biodepth-light-pylon') {
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.6, 0.4, 8),
      obsidianMat
    );
    base.position.y = 0.2;
    group.add(base);

    const column = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.24, 4.6, 8),
      furnaceEmberMat
    );
    column.position.y = 2.5;
    group.add(column);

    const ribRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.06, 8, 20),
      charcoalIronMat
    );
    ribRing.rotation.x = Math.PI / 2;
    ribRing.position.y = 3.6;
    group.add(ribRing);
  } else if (mod.kind === 'matter-containment-plinth') {
    const pedestal = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.25, 1.2),
      obsidianMat
    );
    pedestal.position.y = 0.625;
    group.add(pedestal);

    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.44, 0),
      furnaceEmberMat
    );
    crystal.position.y = 1.95;
    crystal.userData.isFloatingCrystal = true;
    group.add(crystal);

    // 2 taut wrought-iron chains anchoring the floating reliquary crystal to the plinth
    group.add(
      buildWroughtIronChainSpan(
        new THREE.Vector3(-0.48, 1.25, 0),
        new THREE.Vector3(-0.15, 1.85, 0),
        6,
        charcoalIronMat,
        furnaceEmberMat
      )
    );
    group.add(
      buildWroughtIronChainSpan(
        new THREE.Vector3(0.48, 1.25, 0),
        new THREE.Vector3(0.15, 1.85, 0),
        6,
        charcoalIronMat,
        furnaceEmberMat
      )
    );
  } else if (mod.kind === 'brutalist-partition-wall') {
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 4.4, 0.45),
      obsidianMat
    );
    slab.position.y = 2.2;
    group.add(slab);

    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(3.84, 0.14, 0.5),
      furnaceEmberMat
    );
    trim.position.y = 2.2;
    group.add(trim);
  } else if (mod.kind === 'harmonic-gravity-pad') {
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(1.45, 1.6, 0.18, 16),
      obsidianMat
    );
    pad.position.y = 0.09;
    group.add(pad);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.75, 1.28, 24),
      glowMat
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.2;
    group.add(ring);

    const innerEmberRing = new THREE.Mesh(
      new THREE.RingGeometry(0.32, 0.52, 20),
      furnaceEmberMat
    );
    innerEmberRing.rotation.x = -Math.PI / 2;
    innerEmberRing.position.y = 0.21;
    group.add(innerEmberRing);
  } else {
    // synaptic-conduit-arch (Cyber-Occult Chain & Conduit Arch)
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(1.9, 0.16, 10, 24, Math.PI),
      charcoalIronMat
    );
    arch.position.y = 0.1;
    group.add(arch);

    const emberVein = new THREE.Mesh(
      new THREE.TorusGeometry(1.9, 0.06, 8, 24, Math.PI),
      furnaceEmberMat
    );
    emberVein.position.set(0, 0.1, 0.14);
    group.add(emberVein);
  }

  group.position.set(
    PORTAL_ROOM_ORIGIN.x + mod.gx,
    PORTAL_ROOM_ORIGIN.y,
    PORTAL_ROOM_ORIGIN.z + mod.gz
  );
  group.rotation.y = mod.rotationY;
  return group;
}

/**
 * Builds the Harvestable Multiversal Matter Nodes in the exterior world
 */
export function buildExteriorMultiversalMatterNodes(
  world: ManifoldWorldSpec,
  boundaryId: DifferentialUniverseBoundaryId,
  excavations: { x: number; z: number; radius: number; depth: number }[],
  targetGroup: THREE.Group
): HarvestableMatterNodeInstance[] {
  while (targetGroup.children.length > 0) {
    targetGroup.remove(targetGroup.children[0]);
  }

  const boundary = DIFFERENTIAL_UNIVERSE_BOUNDARIES[boundaryId];
  const matters: MultiversalMatterId[] = [
    boundary.primaryMatterYield,
    boundary.secondaryMatterYield,
    'astral-singularity-core',
  ];

  const instances: HarvestableMatterNodeInstance[] = [];
  const nodeCount = 10;

  for (let i = 0; i < nodeCount; i++) {
    const matterId = matters[i % (i === 9 ? 3 : 2)];
    const spec = MULTIVERSAL_MATTER_CATALOG[matterId];
    const angle = (i / nodeCount) * Math.PI * 2 + (world.seed % 17) * 0.2;
    const dist = 12 + (i % 3) * 9.5;
    const nx = Math.cos(angle) * dist;
    const nz = Math.sin(angle) * dist;
    const ny = evaluateTerrainHeight(nx, nz, world, excavations);

    const nodeGroup = new THREE.Group();
    const baseMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      metalness: 0.8,
      roughness: 0.25,
    });
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(spec.colorHex),
      emissive: new THREE.Color(spec.emissiveHex),
      emissiveIntensity: 1.1,
      roughness: 0.15,
      metalness: 0.45,
      clearcoat: 1.0,
    });

    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.85, 0.45, 7),
      baseMat
    );
    plinth.position.y = 0.22;
    nodeGroup.add(plinth);

    const spire = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.52, 1),
      crystalMat
    );
    spire.scale.set(0.75, 1.85, 0.75);
    spire.position.y = 1.25;
    spire.userData.isMatterCrystal = true;
    nodeGroup.add(spire);

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.04, 8, 24),
      crystalMat
    );
    halo.rotation.x = Math.PI * 0.35;
    halo.position.y = 1.25;
    halo.userData.isMatterHalo = true;
    nodeGroup.add(halo);

    nodeGroup.position.set(nx, ny, nz);
    targetGroup.add(nodeGroup);

    instances.push({
      id: `matter-node-${i}`,
      matterId,
      mesh: nodeGroup,
      pos: new THREE.Vector3(nx, ny, nz),
      harvestedCooldown: 0,
    });
  }

  return instances;
}

/**
 * Builds the Complete Reality-Tear Portal & Large 36m x 36m x 12m Square Portal Room Rig
 */
export function buildRealityTearPortalAndSquareRoomRig(
  world: ManifoldWorldSpec,
  boundaryId: DifferentialUniverseBoundaryId,
  activeElement: BaseDimensionalElementId,
  initialTier: PortalRoomTierId = 0,
  renderTargetSize: number = 1024
): RealityTearPortalAndSquareRoomRig {
  const boundary = DIFFERENTIAL_UNIVERSE_BOUNDARIES[boundaryId];
  const elemSpec = BASE_DIMENSIONAL_ELEMENTS[activeElement];

  // 1. WebGLRenderTarget & Secondary Portal Eye Camera for live Splitgate/Portal sightline
  const portalRenderTarget = new THREE.WebGLRenderTarget(
    renderTargetSize,
    renderTargetSize,
    {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      depthBuffer: true,
    }
  );
  const portalEyeCamera = new THREE.PerspectiveCamera(64, 1.0, 0.15, 220);

  // 2. World-Side Reality-Tear Portal Group (3.6m wide x 4.2m tall aperture)
  const worldPortalGroup = new THREE.Group();
  worldPortalGroup.name = 'world-reality-tear-portal';

  const worldPortalMaterial = createRealityTearShaderMaterial(
    portalRenderTarget.texture,
    boundary.portalRimPrimaryHex,
    boundary.portalRimSecondaryHex,
    elemSpec.colorHex
  );

  const portalPlaneGeo = new THREE.PlaneGeometry(3.6, 4.2, 32, 32);
  const worldPortalPlaneMesh = new THREE.Mesh(
    portalPlaneGeo,
    worldPortalMaterial
  );
  worldPortalPlaneMesh.position.y = 2.15;
  worldPortalGroup.add(worldPortalPlaneMesh);

  const worldPortalFrameGroup = buildRealityTearFrameGroup(
    boundary.portalRimPrimaryHex,
    boundary.portalRimSecondaryHex
  );
  worldPortalFrameGroup.position.y = 2.15;
  worldPortalGroup.add(worldPortalFrameGroup);

  // 3. Large Unedited Foundational Square Portal Room (36m x 36m x 12m at [0, 600, 0])
  const squareRoomGroup = new THREE.Group();
  squareRoomGroup.name = 'large-square-portal-room';
  squareRoomGroup.position.copy(PORTAL_ROOM_ORIGIN);

  const roomW = 36;
  const roomD = 36;
  const roomH = PORTAL_ROOM_HEIGHT;

  // High-contrast Cyber-Occult Obsidian & Brushed Charcoal-Iron materials inspired by voidwalker_glitch_stealth.png
  const floorMat = new THREE.MeshStandardMaterial({
    color: '#0e1118',
    roughness: 0.34,
    metalness: 0.55,
  });
  const wallMat = new THREE.MeshStandardMaterial({
    color: '#151924',
    roughness: 0.48,
    metalness: 0.42,
  });
  const ceilingMat = new THREE.MeshStandardMaterial({
    color: '#090b10',
    roughness: 0.6,
    metalness: 0.4,
  });
  const architecturalJointMat = new THREE.MeshStandardMaterial({
    color: '#262d3d',
    emissive: '#1e293b',
    emissiveIntensity: 0.4,
    roughness: 0.28,
    metalness: 0.78,
  });
  const furnaceAccentMat = new THREE.MeshStandardMaterial({
    color: '#f97316',
    emissive: '#ea580c',
    emissiveIntensity: 0.65,
    roughness: 0.28,
    metalness: 0.45,
  });
  const skylightStripMat = new THREE.MeshBasicMaterial({
    color: '#f8fafc',
  });

  // Floor Slab (36m x 36m)
  const floorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(roomW, 0.5, roomD),
    floorMat
  );
  floorMesh.position.set(0, -0.25, 0);
  floorMesh.receiveShadow = true;
  squareRoomGroup.add(floorMesh);

  // Crisp Architectural Square Grid Joints + Sacred-Geometry Incised Floor Rings (inspired by voidwalker_glitch_stealth.png)
  const gridGroup = new THREE.Group();
  for (let g = -13.5; g <= 13.5; g += 4.5) {
    const lineX = new THREE.Mesh(
      new THREE.BoxGeometry(roomW - 0.4, 0.03, 0.08),
      architecturalJointMat
    );
    lineX.position.set(0, 0.015, g);
    gridGroup.add(lineX);

    const lineZ = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.03, roomD - 0.4),
      architecturalJointMat
    );
    lineZ.position.set(g, 0.015, 0);
    gridGroup.add(lineZ);
  }
  for (const r of [3.8, 7.6, 11.4]) {
    const sacredRing = new THREE.Mesh(
      new THREE.RingGeometry(r - 0.06, r, 48),
      r === 7.6 ? furnaceAccentMat : architecturalJointMat
    );
    sacredRing.rotation.x = -Math.PI / 2;
    sacredRing.position.y = 0.02;
    gridGroup.add(sacredRing);
  }
  squareRoomGroup.add(gridGroup);

  // Ceiling Slab (36m x 36m at y = 12m)
  const ceilingMesh = new THREE.Mesh(
    new THREE.BoxGeometry(roomW, 0.5, roomD),
    ceilingMat
  );
  ceilingMesh.position.set(0, roomH + 0.25, 0);
  squareRoomGroup.add(ceilingMesh);

  // Cyber-Occult Wrought-Iron Chain Suspended Diamond Singularity Astrolabe in the Upper Vault (from voidwalker_glitch_stealth.png)
  const astrolabeCenter = new THREE.Vector3(0, 8.2, -2.0);
  for (const cx of [-11.5, 11.5]) {
    for (const cz of [-11.5, 7.5]) {
      squareRoomGroup.add(
        buildWroughtIronChainSpan(
          new THREE.Vector3(cx, roomH - 0.2, cz),
          astrolabeCenter.clone().add(new THREE.Vector3(cx * 0.08, 0.4, cz * 0.08)),
          18,
          architecturalJointMat,
          furnaceAccentMat
        )
      );
    }
  }
  const astrolabeDiamondFrame = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.55, 0),
    furnaceAccentMat
  );
  astrolabeDiamondFrame.scale.set(1.0, 1.45, 0.35);
  astrolabeDiamondFrame.position.copy(astrolabeCenter);
  squareRoomGroup.add(astrolabeDiamondFrame);

  const astrolabeColdStar = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.65, 1),
    skylightStripMat
  );
  astrolabeColdStar.position.copy(astrolabeCenter);
  squareRoomGroup.add(astrolabeColdStar);

  // 4 Monumental Square Walls (North, South, East, West) with architectural pilaster ribs
  const wallNorth = new THREE.Mesh(
    new THREE.BoxGeometry(roomW, roomH, 0.6),
    wallMat
  );
  wallNorth.position.set(0, roomH * 0.5, -roomD * 0.5);
  squareRoomGroup.add(wallNorth);

  const wallSouth = new THREE.Mesh(
    new THREE.BoxGeometry(roomW, roomH, 0.6),
    wallMat
  );
  wallSouth.position.set(0, roomH * 0.5, roomD * 0.5);
  squareRoomGroup.add(wallSouth);

  const wallEast = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, roomH, roomD),
    wallMat
  );
  wallEast.position.set(roomW * 0.5, roomH * 0.5, 0);
  squareRoomGroup.add(wallEast);

  const wallWest = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, roomH, roomD),
    wallMat
  );
  wallWest.position.set(-roomW * 0.5, roomH * 0.5, 0);
  squareRoomGroup.add(wallWest);

  // Perimeter Architectural Skylight Strips & Structural Columns (makes the large square room well-lit and geometrically iconic)
  for (let i = -13.5; i <= 13.5; i += 9.0) {
    // Ceiling light beams running North-South
    const lightBeam = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.12, roomD - 4),
      skylightStripMat
    );
    lightBeam.position.set(i, roomH - 0.08, 0);
    squareRoomGroup.add(lightBeam);

    // Wall pilasters on North, East, West walls
    const pilasterN = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, roomH, 0.45),
      architecturalJointMat
    );
    pilasterN.position.set(i, roomH * 0.5, -roomD * 0.5 + 0.35);
    squareRoomGroup.add(pilasterN);

    const pilasterE = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, roomH, 0.55),
      architecturalJointMat
    );
    pilasterE.position.set(roomW * 0.5 - 0.35, roomH * 0.5, i);
    squareRoomGroup.add(pilasterE);

    const pilasterW = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, roomH, 0.55),
      architecturalJointMat
    );
    pilasterW.position.set(-roomW * 0.5 + 0.35, roomH * 0.5, i);
    squareRoomGroup.add(pilasterW);
  }

  // Dedicated Interior Illumination (Cold Diamond-White Center + Furnace-Amber Rim + Boundary Accent)
  const roomCenterLight = new THREE.PointLight('#f8fafc', 1.15, 48, 1.35);
  roomCenterLight.position.set(0, 10.2, 0);
  squareRoomGroup.add(roomCenterLight);

  const roomFurnaceLight = new THREE.PointLight('#f97316', 0.92, 34, 1.4);
  roomFurnaceLight.position.set(-8, 5.5, -4);
  squareRoomGroup.add(roomFurnaceLight);

  const roomNorthLight = new THREE.PointLight(
    boundary.primaryAccentHex,
    0.98,
    32,
    1.4
  );
  roomNorthLight.position.set(0, 6.5, -11.5);
  squareRoomGroup.add(roomNorthLight);

  // 4. Return Reality-Tear Portal on the South Wall (z = +16.4, facing North into the room)
  const returnPortalGroup = new THREE.Group();
  returnPortalGroup.position.set(0, 0, 16.4);
  returnPortalGroup.rotation.y = Math.PI;

  const returnPortalMaterial = createRealityTearShaderMaterial(
    portalRenderTarget.texture,
    boundary.portalRimPrimaryHex,
    boundary.portalRimSecondaryHex,
    elemSpec.colorHex
  );
  returnPortalMaterial.uniforms.uOpenProgress.value = 1.0;

  const returnPortalPlaneMesh = new THREE.Mesh(
    portalPlaneGeo,
    returnPortalMaterial
  );
  returnPortalPlaneMesh.position.y = 2.15;
  returnPortalGroup.add(returnPortalPlaneMesh);

  const returnFrame = buildRealityTearFrameGroup(
    boundary.portalRimPrimaryHex,
    boundary.portalRimSecondaryHex
  );
  returnFrame.position.y = 2.15;
  returnPortalGroup.add(returnFrame);
  squareRoomGroup.add(returnPortalGroup);

  // 4B. SECONDARY INNER MAZE PORTAL (Right beside South Return Entrance at x = +6.8, z = +15.8, facing North into the room)
  // Toggled by pressing [V] while inside the Portal Room; flicked through 100+ Mazes via Left/Right Arrow keys!
  const knownMazes = generateStarting100ProceduralMazes(world.seed);
  const initialMaze = knownMazes[0];
  const initialMazeTheme =
    MAZE_ENTITY_THEME_CATALOG[initialMaze.horrorArchetypeId];

  const innerMazePortalGroup = new THREE.Group();
  innerMazePortalGroup.position.set(6.8, 0, 15.8);
  innerMazePortalGroup.rotation.y = Math.PI;
  innerMazePortalGroup.visible = false;

  const innerMazePortalMaterial = createRealityTearShaderMaterial(
    portalRenderTarget.texture,
    initialMazeTheme.portalRimPrimaryHex,
    initialMazeTheme.portalRimSecondaryHex,
    initialMazeTheme.wallVeinEmissiveHex
  );
  innerMazePortalMaterial.uniforms.uOpenProgress.value = 0.0;

  const innerMazePortalPlaneMesh = new THREE.Mesh(
    portalPlaneGeo,
    innerMazePortalMaterial
  );
  innerMazePortalPlaneMesh.position.y = 2.15;
  innerMazePortalGroup.add(innerMazePortalPlaneMesh);

  const innerMazePortalFrameGroup = buildRealityTearFrameGroup(
    initialMazeTheme.portalRimPrimaryHex,
    initialMazeTheme.portalRimSecondaryHex
  );
  innerMazePortalFrameGroup.position.y = 2.15;
  innerMazePortalGroup.add(innerMazePortalFrameGroup);

  // Surveillance & Maze Assimilation Console Plinth beside the Inner Maze Portal (x = +3.6, z = +15.2)
  const mazeConsoleGroup = new THREE.Group();
  mazeConsoleGroup.position.set(3.6, 0, 15.2);
  const consolePedestal = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.15, 0.8),
    new THREE.MeshStandardMaterial({
      color: '#0f172a',
      metalness: 0.85,
      roughness: 0.22,
    })
  );
  consolePedestal.position.y = 0.575;
  mazeConsoleGroup.add(consolePedestal);

  const innerMazeMonitorScreenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 0.68),
    new THREE.MeshBasicMaterial({
      color: initialMazeTheme.wallVeinEmissiveHex,
      side: THREE.DoubleSide,
    })
  );
  innerMazeMonitorScreenMesh.position.set(0, 1.55, 0);
  innerMazeMonitorScreenMesh.rotation.y = Math.PI;
  mazeConsoleGroup.add(innerMazeMonitorScreenMesh);
  squareRoomGroup.add(mazeConsoleGroup);
  squareRoomGroup.add(innerMazePortalGroup);

  // Build the Procedural Maze Dimension Rig at MAZE_DIMENSION_ORIGIN [0, 1250, 0] + its Return Reality-Tear Portal
  const mazeDimensionRig = new ProceduralMazeDimensionRig(initialMaze);
  const mazeReturnMat = createRealityTearShaderMaterial(
    portalRenderTarget.texture,
    initialMazeTheme.portalRimPrimaryHex,
    initialMazeTheme.portalRimSecondaryHex,
    initialMazeTheme.wallVeinEmissiveHex
  );
  mazeReturnMat.uniforms.uOpenProgress.value = 1.0;
  mazeDimensionRig.returnPortalMaterial = mazeReturnMat;

  const mazeReturnPlane = new THREE.Mesh(portalPlaneGeo, mazeReturnMat);
  mazeReturnPlane.position.y = 2.15;
  mazeDimensionRig.returnPortalGroup.add(mazeReturnPlane);

  const mazeReturnFrame = buildRealityTearFrameGroup(
    initialMazeTheme.portalRimPrimaryHex,
    initialMazeTheme.portalRimSecondaryHex
  );
  mazeReturnFrame.position.y = 2.15;
  mazeDimensionRig.returnPortalGroup.add(mazeReturnFrame);

  // 5. STATION 1 (NORTH, z = -12.5): Dimensional Synthesis Crucible (Where Dimensional Crafting Comes to Life!)
  const crucibleStationGroup = new THREE.Group();
  crucibleStationGroup.position.set(0, 0, -12.5);

  const crucibleBase = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.8, 0.75, 12),
    new THREE.MeshStandardMaterial({
      color: '#0f172a',
      metalness: 0.85,
      roughness: 0.2,
    })
  );
  crucibleBase.position.y = 0.38;
  crucibleStationGroup.add(crucibleBase);

  const crucibleContainRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.85, 0.1, 12, 36),
    new THREE.MeshStandardMaterial({
      color: boundary.primaryAccentHex,
      emissive: boundary.primaryAccentHex,
      emissiveIntensity: 1.2,
      metalness: 0.7,
      roughness: 0.15,
    })
  );
  crucibleContainRing.rotation.x = Math.PI / 2;
  crucibleContainRing.position.y = 1.1;
  crucibleStationGroup.add(crucibleContainRing);

  // 6 Orbiting Multiversal Matter Cores around the Synthesis Crucible
  const crucibleOrbitalMeshes: THREE.Mesh[] = [];
  const matterKeys = Object.keys(
    MULTIVERSAL_MATTER_CATALOG
  ) as MultiversalMatterId[];
  for (let m = 0; m < 6; m++) {
    const mSpec = MULTIVERSAL_MATTER_CATALOG[matterKeys[m % matterKeys.length]];
    const orb = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.24, 1),
      new THREE.MeshStandardMaterial({
        color: mSpec.colorHex,
        emissive: mSpec.emissiveHex,
        emissiveIntensity: 1.15,
        metalness: 0.5,
        roughness: 0.15,
      })
    );
    crucibleStationGroup.add(orb);
    crucibleOrbitalMeshes.push(orb);
  }

  // Central Harmonic Core inside the Crucible
  const centralForgeCore = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.62, 1),
    new THREE.MeshPhysicalMaterial({
      color: '#fde68a',
      emissive: boundary.primaryAccentHex,
      emissiveIntensity: 0.55,
      wireframe: true,
      roughness: 0.15,
      metalness: 0.8,
    })
  );
  centralForgeCore.position.y = 2.4;
  centralForgeCore.userData.isCrucibleCore = true;
  crucibleStationGroup.add(centralForgeCore);
  squareRoomGroup.add(crucibleStationGroup);

  // 6. STATION 2 (EAST, x = +13.2): Room Evolution & Multiversal Matter Infuser
  const infuserStationGroup = new THREE.Group();
  infuserStationGroup.position.set(13.2, 0, 0);

  const infuserPillar = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 3.6, 1.8),
    new THREE.MeshStandardMaterial({
      color: '#0f172a',
      metalness: 0.82,
      roughness: 0.22,
    })
  );
  infuserPillar.position.y = 1.8;
  infuserStationGroup.add(infuserPillar);

  const infuserHoloCube = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 1.15, 1.15),
    new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#0284c7',
      emissiveIntensity: 1.1,
      wireframe: true,
    })
  );
  infuserHoloCube.position.y = 4.4;
  infuserHoloCube.userData.isInfuserHolo = true;
  infuserStationGroup.add(infuserHoloCube);
  squareRoomGroup.add(infuserStationGroup);

  // 7. STATION 3 (WEST, x = -13.2): Armory & Somatic Graft Display Pedestals
  const armoryStationGroup = new THREE.Group();
  armoryStationGroup.position.set(-13.2, 0, 0);

  for (let p = -1; p <= 1; p++) {
    const stand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.8, 1.1, 8),
      new THREE.MeshStandardMaterial({
        color: '#1e293b',
        metalness: 0.75,
        roughness: 0.25,
      })
    );
    stand.position.set(0, 0.55, p * 3.4);
    armoryStationGroup.add(stand);

    const weaponHolo = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.38, 0),
      new THREE.MeshStandardMaterial({
        color: p === 0 ? '#f43f5e' : '#2dd4bf',
        emissive: p === 0 ? '#e11d48' : '#14b8a6',
        emissiveIntensity: 1.0,
      })
    );
    weaponHolo.scale.set(0.45, 2.2, 0.45);
    weaponHolo.position.set(0, 1.95, p * 3.4);
    weaponHolo.userData.isArmoryHolo = true;
    armoryStationGroup.add(weaponHolo);
  }
  squareRoomGroup.add(armoryStationGroup);

  // 8. UPGRADEABLE ROOM TIER VISUAL LAYERS (Tiers 1, 2, 3)
  // Tier 1: Elemental Conduit Veins across floor and walls
  const tier1ConduitsGroup = new THREE.Group();
  const conduitMat = new THREE.MeshBasicMaterial({
    color: elemSpec.colorHex,
  });
  for (let c = -9; c <= 9; c += 9) {
    const floorVeinX = new THREE.Mesh(
      new THREE.BoxGeometry(roomW - 1, 0.05, 0.16),
      conduitMat
    );
    floorVeinX.position.set(0, 0.025, c);
    tier1ConduitsGroup.add(floorVeinX);

    const floorVeinZ = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.05, roomD - 1),
      conduitMat
    );
    floorVeinZ.position.set(c, 0.025, 0);
    tier1ConduitsGroup.add(floorVeinZ);
  }
  tier1ConduitsGroup.visible = initialTier >= 1;
  squareRoomGroup.add(tier1ConduitsGroup);

  // Tier 2: Biodepth Bioluminescent Observation Dome & Automated Matter Extractors
  const tier2BiodepthDomeGroup = new THREE.Group();
  const domeMat = new THREE.MeshPhysicalMaterial({
    color: '#06b6d4',
    emissive: '#0891b2',
    emissiveIntensity: 0.75,
    wireframe: true,
    transparent: true,
    opacity: 0.65,
  });
  const biodepthCrown = new THREE.Mesh(
    new THREE.SphereGeometry(9.5, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
    domeMat
  );
  biodepthCrown.position.set(0, roomH - 2.5, 0);
  tier2BiodepthDomeGroup.add(biodepthCrown);

  // 4 Corner Matter Extractor Pylons
  const corners = [
    [-14, -14],
    [14, -14],
    [-14, 14],
    [14, 14],
  ];
  for (const [cx, cz] of corners) {
    const ext = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.55, roomH - 0.5, 8),
      new THREE.MeshStandardMaterial({
        color: '#2dd4bf',
        emissive: '#0d9488',
        emissiveIntensity: 0.9,
        metalness: 0.7,
        roughness: 0.2,
      })
    );
    ext.position.set(cx, roomH * 0.5, cz);
    tier2BiodepthDomeGroup.add(ext);
  }
  tier2BiodepthDomeGroup.visible = initialTier >= 2;
  squareRoomGroup.add(tier2BiodepthDomeGroup);

  // Tier 3: Multiversal Nexus Citadel Stargate Bays (North-East & North-West walls)
  const tier3NexusBaysGroup = new THREE.Group();
  ALL_DIFFERENTIAL_BOUNDARY_IDS.forEach((bId, idx) => {
    const bSpec = DIFFERENTIAL_UNIVERSE_BOUNDARIES[bId];
    const bayGroup = new THREE.Group();
    const bx = -15.4 + idx * 2.8;
    bayGroup.position.set(bx, 2.2, -16.8);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.95, 0.08, 10, 28),
      new THREE.MeshStandardMaterial({
        color: bSpec.primaryAccentHex,
        emissive: bSpec.primaryAccentHex,
        emissiveIntensity: 1.25,
      })
    );
    bayGroup.add(ring);

    const horizon = new THREE.Mesh(
      new THREE.CircleGeometry(0.88, 24),
      new THREE.MeshBasicMaterial({
        color: bSpec.portalRimPrimaryHex,
        transparent: true,
        opacity: 0.42,
        side: THREE.DoubleSide,
      })
    );
    bayGroup.add(horizon);
    tier3NexusBaysGroup.add(bayGroup);
  });
  tier3NexusBaysGroup.visible = initialTier >= 3;
  squareRoomGroup.add(tier3NexusBaysGroup);

  // 9. Container for Player-Placed Custom Modular Room Blocks
  const placedModulesGroup = new THREE.Group();
  squareRoomGroup.add(placedModulesGroup);

  // 10. Container for Exterior Harvestable Multiversal Matter Nodes
  const matterNodesGroup = new THREE.Group();
  const matterNodes = buildExteriorMultiversalMatterNodes(
    world,
    boundaryId,
    [],
    matterNodesGroup
  );

  const initialWorldPortalPos = new THREE.Vector3(0, 0, -5.5);

  return {
    worldPortalGroup,
    worldPortalPlaneMesh,
    worldPortalFrameGroup,
    worldPortalMaterial,
    worldPortalPos: initialWorldPortalPos,
    worldPortalYaw: 0,
    squareRoomGroup,
    returnPortalGroup,
    returnPortalPlaneMesh,
    returnPortalMaterial,
    innerMazePortalGroup,
    innerMazePortalPlaneMesh,
    innerMazePortalFrameGroup,
    innerMazePortalMaterial,
    innerMazeMonitorScreenMesh,
    mazeDimensionRig,
    knownMazes,
    selectedMazeIndex: 0,
    isInnerMazePortalOpen: false,
    innerMazePortalProgress: 0,
    isPlayerInsideMazeDimension: false,
    tier1ConduitsGroup,
    tier2BiodepthDomeGroup,
    tier3NexusBaysGroup,
    crucibleStationGroup,
    crucibleOrbitalMeshes,
    infuserStationGroup,
    armoryStationGroup,
    placedModulesGroup,
    portalRenderTarget,
    portalEyeCamera,
    matterNodesGroup,
    matterNodes,
    portalOpenProgress: 0,
    isPortalOpenInWorld: false,
    isPlayerInsidePortalRoom: false,
    savedExteriorPos: new THREE.Vector3(0, 2, 0),
    savedExteriorYaw: 0,
    portalTeleportCooldown: 0,
    currentTier: initialTier,
    activeModuleKind: 'biodepth-light-pylon',
    lastRenderTargetSize: renderTargetSize,
  };
}

/**
 * Updates the Reality-Tear Portal Shader, Splitgate/Portal Render-to-Texture Sightline Camera,
 * Walk-In Teleportation into the 36m x 36m Square Room, and 3D Crafting Stations.
 */
export function updateRealityTearPortalAndSquareRoom(params: {
  rig: RealityTearPortalAndSquareRoomRig;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  mainCamera: THREE.PerspectiveCamera;
  world: ManifoldWorldSpec;
  playerPos: THREE.Vector3;
  playerVel: THREE.Vector3;
  playerYaw: number;
  playerPitch: number;
  boundaryId: DifferentialUniverseBoundaryId;
  activeElement: BaseDimensionalElementId;
  enableShaderDistortion: boolean;
  targetRenderSize: number;
  gateShapeId?: PortalGateShapeId;
  customRimPrimaryHex?: string;
  customRimSecondaryHex?: string;
  excavations: { x: number; z: number; radius: number; depth: number }[];
  onHarvestMatterNode?: (matterId: MultiversalMatterId, nodeName: string) => void;
  onEnterOrExitPortalRoom?: (enteredRoom: boolean) => void;
  onEnterOrExitMazeDimension?: (enteredMaze: boolean, mazeSpec: ProceduralMazeLevelSpec) => void;
  nowSec: number;
  dt: number;
}): PortalRoomRuntimeTelemetry {
  const {
    rig,
    renderer,
    scene,
    mainCamera,
    world,
    playerPos,
    playerYaw,
    playerPitch,
    boundaryId,
    activeElement,
    enableShaderDistortion,
    targetRenderSize,
    gateShapeId = 'rectangular-rift',
    customRimPrimaryHex,
    customRimSecondaryHex,
    excavations,
    onHarvestMatterNode,
    onEnterOrExitPortalRoom,
    onEnterOrExitMazeDimension,
    nowSec,
    dt,
  } = params;

  // Resize WebGLRenderTarget dynamically if Graphics Quality Preset changed
  if (rig.lastRenderTargetSize !== targetRenderSize && targetRenderSize >= 256) {
    rig.lastRenderTargetSize = targetRenderSize;
    rig.portalRenderTarget.setSize(targetRenderSize, targetRenderSize);
  }

  const boundary =
    DIFFERENTIAL_UNIVERSE_BOUNDARIES[boundaryId] ??
    DIFFERENTIAL_UNIVERSE_BOUNDARIES['hadal-biodepth-abyss'];
  const elemSpec =
    BASE_DIMENSIONAL_ELEMENTS[activeElement] ??
    BASE_DIMENSIONAL_ELEMENTS['lithic-crystalline'];
  const gateSpec =
    PORTAL_GATE_SHAPE_CATALOG[gateShapeId] ??
    PORTAL_GATE_SHAPE_CATALOG['rectangular-rift'];

  // 1. Smoothly animate Reality-Tear Portal opening / closing (0 -> 1)
  const targetOpen = rig.isPortalOpenInWorld ? 1.0 : 0.0;
  rig.portalOpenProgress +=
    (targetOpen - rig.portalOpenProgress) * Math.min(1, dt * 5.2);
  if (rig.portalOpenProgress < 0.005 && !rig.isPortalOpenInWorld) {
    rig.portalOpenProgress = 0;
  }

  rig.worldPortalGroup.visible = rig.portalOpenProgress > 0.005;

  // Keep exterior portal grounded on terrain
  const portalGroundY = evaluateTerrainHeight(
    rig.worldPortalPos.x,
    rig.worldPortalPos.z,
    world,
    excavations
  );
  rig.worldPortalPos.y = portalGroundY;
  rig.worldPortalGroup.position.copy(rig.worldPortalPos);
  rig.worldPortalGroup.rotation.y = rig.worldPortalYaw;

  // Update Shader Uniforms for both World Portal and Return Room Portal
  const distortionVal = enableShaderDistortion ? 1.0 : 0.15;
  const primaryHex =
    customRimPrimaryHex ??
    (gateShapeId !== 'rectangular-rift'
      ? gateSpec.defaultPrimaryHex
      : boundary.portalRimPrimaryHex);
  const secondaryHex =
    customRimSecondaryHex ??
    (gateShapeId !== 'rectangular-rift'
      ? gateSpec.defaultSecondaryHex
      : boundary.portalRimSecondaryHex);

  for (const mat of [rig.worldPortalMaterial, rig.returnPortalMaterial]) {
    mat.uniforms.uTime.value = nowSec;
    mat.uniforms.uDistortionStrength.value = distortionVal;
    if (mat.uniforms.uGateShapeIndex) {
      mat.uniforms.uGateShapeIndex.value = gateSpec.shaderShapeIndex;
    }
    mat.uniforms.uPrimaryColor.value.set(primaryHex);
    mat.uniforms.uSecondaryColor.value.set(secondaryHex);
    mat.uniforms.uElementColor.value.set(elemSpec.colorHex);
  }
  rig.worldPortalMaterial.uniforms.uOpenProgress.value = rig.portalOpenProgress;
  rig.returnPortalMaterial.uniforms.uOpenProgress.value = 1.0;

  // Animate perimeter reality-tear shards to match the customizable Portal Gate Shape silhouette!
  const openScale = Math.max(0.01, rig.portalOpenProgress);
  rig.worldPortalFrameGroup.scale.set(
    0.15 + 0.85 * openScale,
    openScale,
    openScale
  );
  rig.worldPortalFrameGroup.children.forEach((child, idx) => {
    const baseAngle = child.userData.baseAngle ?? 0;
    const pulse = Math.sin(nowSec * 3.6 + idx * 0.9) * 0.07 * distortionVal;
    let rx = child.userData.baseRx ?? 0;
    let ry = child.userData.baseRy ?? 0;
    let rotOffset = 0;

    if (gateShapeId === 'fluid-vortex-ellipse') {
      const spinAng = baseAngle + nowSec * 1.4;
      rx = Math.cos(spinAng) * 1.52;
      ry = Math.sin(spinAng) * 1.85;
      rotOffset = nowSec * 1.4;
    } else if (gateShapeId === 'hexagram-merkaba') {
      const starR = 1.65 + (idx % 2 === 0 ? 0.32 : -0.22);
      rx = Math.cos(baseAngle) * starR;
      ry = Math.sin(baseAngle) * starR * 1.12;
    } else if (gateShapeId === 'biomorphic-iris') {
      const breathe = 1.0 + Math.sin(nowSec * 3.2 + idx * 0.5) * 0.14;
      rx = Math.cos(baseAngle) * 1.62 * breathe;
      ry = Math.sin(baseAngle) * 1.82 * breathe;
    } else if (gateShapeId === 'mandelbrot-slit') {
      const cardioidR = 1.35 + Math.abs(Math.sin(baseAngle * 2.0)) * 0.55;
      rx = Math.cos(baseAngle) * cardioidR;
      ry = Math.sin(baseAngle) * cardioidR * 1.18;
    } else if (gateShapeId === 'tesseract-cross-gate') {
      const snapA = Math.round(baseAngle / (Math.PI * 0.25)) * (Math.PI * 0.25);
      const crossR = idx % 2 === 0 ? 1.85 : 1.25;
      rx = Math.cos(snapA) * crossR;
      ry = Math.sin(snapA) * crossR * 1.12;
    } else if (gateShapeId === 'ouroboros-chrono-ring') {
      const gearDir = idx % 2 === 0 ? 1 : -1;
      const gearAng = baseAngle + nowSec * 0.85 * gearDir;
      rx = Math.cos(gearAng) * 1.68;
      ry = Math.sin(gearAng) * 1.88;
      rotOffset = nowSec * 2.2 * gearDir;
    }

    child.position.x = rx * (1 + pulse);
    child.position.y = ry * (1 + pulse);
    child.rotation.z = baseAngle + Math.PI * 0.5 + pulse * 1.5 + rotOffset;
  });

  // 2. Check Seamless Walk-In Threshold Transition between Exterior World and Large Square Portal Room!
  if (rig.portalTeleportCooldown > 0) {
    rig.portalTeleportCooldown = Math.max(0, rig.portalTeleportCooldown - dt);
  }

  if (!rig.isPlayerInsidePortalRoom) {
    // Player is in the exterior world: check if they walk into the open World Portal plane
    if (
      rig.portalOpenProgress > 0.65 &&
      rig.portalTeleportCooldown <= 0
    ) {
      const horizDist = Math.hypot(
        playerPos.x - rig.worldPortalPos.x,
        playerPos.z - rig.worldPortalPos.z
      );
      if (horizDist < 1.55 && Math.abs(playerPos.y - rig.worldPortalPos.y) < 3.2) {
        // Save exterior coordinates and step directly into the South entrance of the 36m x 36m Square Portal Room!
        rig.savedExteriorPos.copy(rig.worldPortalPos);
        rig.savedExteriorYaw = rig.worldPortalYaw;
        rig.isPlayerInsidePortalRoom = true;
        rig.portalTeleportCooldown = 1.35;

        // Place player just inside the South Portal entrance looking North across the large square room
        playerPos.set(
          PORTAL_ROOM_ORIGIN.x,
          PORTAL_ROOM_ORIGIN.y,
          PORTAL_ROOM_ORIGIN.z + 13.6
        );
        if (onEnterOrExitPortalRoom) {
          onEnterOrExitPortalRoom(true);
        }
      }
    }

    // Check proximity to Exterior Harvestable Multiversal Matter Nodes
    for (const node of rig.matterNodes) {
      if (node.harvestedCooldown > 0) {
        node.harvestedCooldown = Math.max(0, node.harvestedCooldown - dt);
        node.mesh.scale.setScalar(
          0.35 + 0.65 * (1 - node.harvestedCooldown / 14.0)
        );
      } else {
        node.mesh.scale.setScalar(1.0);
        const dNode = Math.hypot(
          playerPos.x - node.pos.x,
          playerPos.z - node.pos.z
        );
        if (dNode < 2.45) {
          node.harvestedCooldown = 14.0;
          if (onHarvestMatterNode) {
            onHarvestMatterNode(
              node.matterId,
              MULTIVERSAL_MATTER_CATALOG[node.matterId].name
            );
          }
        }
      }
      node.mesh.children.forEach((ch) => {
        if (ch.userData.isMatterCrystal) {
          ch.rotation.y = nowSec * 1.8;
          ch.position.y = 1.25 + Math.sin(nowSec * 2.5) * 0.14;
        }
        if (ch.userData.isMatterHalo) {
          ch.rotation.z = nowSec * 2.2;
        }
      });
    }
  } else {
    // Player is INSIDE the 36m x 36m Square Portal Room!
    // Check if player walks through the South Return Portal to exit back to the Exterior World
    const returnPortalWorldPos = new THREE.Vector3(
      PORTAL_ROOM_ORIGIN.x,
      PORTAL_ROOM_ORIGIN.y,
      PORTAL_ROOM_ORIGIN.z + 16.4
    );
    const distToExit = Math.hypot(
      playerPos.x - returnPortalWorldPos.x,
      playerPos.z - returnPortalWorldPos.z
    );
    if (distToExit < 1.65 && rig.portalTeleportCooldown <= 0) {
      rig.isPlayerInsidePortalRoom = false;
      rig.portalTeleportCooldown = 1.35;
      // Step out 2.4m in front of the exterior portal
      const outX =
        rig.savedExteriorPos.x + Math.sin(rig.savedExteriorYaw) * 2.4;
      const outZ =
        rig.savedExteriorPos.z + Math.cos(rig.savedExteriorYaw) * 2.4;
      const outY = evaluateTerrainHeight(outX, outZ, world, excavations);
      playerPos.set(outX, outY, outZ);
      if (onEnterOrExitPortalRoom) {
        onEnterOrExitPortalRoom(false);
      }
    }

    // Check if player walks through the Secondary Inner Maze Portal (at x = +6.8, z = +15.8) to enter the selected Maze Dimension!
    if (
      rig.isInnerMazePortalOpen &&
      rig.innerMazePortalProgress > 0.65 &&
      rig.portalTeleportCooldown <= 0
    ) {
      const innerMazeWorldPos = new THREE.Vector3(
        PORTAL_ROOM_ORIGIN.x + 6.8,
        PORTAL_ROOM_ORIGIN.y,
        PORTAL_ROOM_ORIGIN.z + 15.8
      );
      const distToMazePortal = Math.hypot(
        playerPos.x - innerMazeWorldPos.x,
        playerPos.z - innerMazeWorldPos.z
      );
      if (distToMazePortal < 1.65) {
        rig.isPlayerInsidePortalRoom = false;
        rig.isPlayerInsideMazeDimension = true;
        rig.portalTeleportCooldown = 1.35;
        // Place player in the central arrival plaza of the Procedural Maze Dimension (3.2m North of the Return Portal)
        playerPos.set(
          MAZE_DIMENSION_ORIGIN.x,
          MAZE_DIMENSION_ORIGIN.y,
          MAZE_DIMENSION_ORIGIN.z - 3.2
        );
        const activeMaze =
          rig.knownMazes[rig.selectedMazeIndex] ?? rig.knownMazes[0];
        if (onEnterOrExitMazeDimension) {
          onEnterOrExitMazeDimension(true, activeMaze);
        }
      }
    }
  }

  // 2B. Animate Secondary Inner Maze Portal & Step Active Procedural Maze Dimension Rig
  const targetInnerMazeOpen = rig.isInnerMazePortalOpen ? 1.0 : 0.0;
  rig.innerMazePortalProgress +=
    (targetInnerMazeOpen - rig.innerMazePortalProgress) *
    Math.min(1, dt * 5.5);
  if (rig.innerMazePortalProgress < 0.005 && !rig.isInnerMazePortalOpen) {
    rig.innerMazePortalProgress = 0;
  }
  rig.innerMazePortalGroup.visible = rig.innerMazePortalProgress > 0.005;

  const selectedMaze =
    rig.knownMazes[rig.selectedMazeIndex] ?? rig.knownMazes[0];
  const selectedMazeTheme =
    MAZE_ENTITY_THEME_CATALOG[selectedMaze.horrorArchetypeId];

  rig.innerMazePortalMaterial.uniforms.uTime.value = nowSec;
  rig.innerMazePortalMaterial.uniforms.uOpenProgress.value =
    rig.innerMazePortalProgress;
  rig.innerMazePortalMaterial.uniforms.uDistortionStrength.value =
    distortionVal;
  if (rig.innerMazePortalMaterial.uniforms.uGateShapeIndex) {
    rig.innerMazePortalMaterial.uniforms.uGateShapeIndex.value =
      gateSpec.shaderShapeIndex;
  }
  rig.innerMazePortalMaterial.uniforms.uPrimaryColor.value.set(
    selectedMazeTheme.portalRimPrimaryHex
  );
  rig.innerMazePortalMaterial.uniforms.uSecondaryColor.value.set(
    selectedMazeTheme.portalRimSecondaryHex
  );
  rig.innerMazePortalMaterial.uniforms.uElementColor.value.set(
    selectedMazeTheme.wallVeinEmissiveHex
  );
  (rig.innerMazeMonitorScreenMesh.material as THREE.MeshBasicMaterial).color.set(
    selectedMazeTheme.wallVeinEmissiveHex
  );

  const innerScale = Math.max(0.01, rig.innerMazePortalProgress);
  rig.innerMazePortalFrameGroup.scale.set(
    0.15 + 0.85 * innerScale,
    innerScale,
    innerScale
  );

  rig.mazeDimensionRig.update({
    dt,
    nowSec,
    isPlayerInsideMaze: rig.isPlayerInsideMazeDimension,
    playerPos,
    playerYaw,
    onHarvestMazeLoot: (matterId, _amount, label) => {
      if (onHarvestMatterNode) {
        onHarvestMatterNode(matterId, label);
      }
    },
    onExitMazeToPortalRoom: () => {
      if (rig.portalTeleportCooldown <= 0) {
        rig.isPlayerInsideMazeDimension = false;
        rig.isPlayerInsidePortalRoom = true;
        rig.portalTeleportCooldown = 1.35;
        playerPos.set(
          PORTAL_ROOM_ORIGIN.x + 6.8,
          PORTAL_ROOM_ORIGIN.y,
          PORTAL_ROOM_ORIGIN.z + 12.8
        );
        if (onEnterOrExitMazeDimension) {
          onEnterOrExitMazeDimension(false, selectedMaze);
        }
      }
    },
  });

  // 3. Animate 3D Stations & Orbiting Multiversal Matters inside the Square Portal Room
  rig.crucibleOrbitalMeshes.forEach((orb, idx) => {
    const ang =
      nowSec * 1.45 + (idx / rig.crucibleOrbitalMeshes.length) * Math.PI * 2;
    const rad = 1.45 + Math.sin(nowSec * 2.2 + idx) * 0.18;
    orb.position.set(
      Math.cos(ang) * rad,
      1.65 + Math.sin(nowSec * 3.1 + idx) * 0.25,
      Math.sin(ang) * rad
    );
    orb.rotation.x = nowSec * 2.0;
    orb.rotation.y = nowSec * 2.6;
  });

  rig.crucibleStationGroup.children.forEach((ch) => {
    if (ch.userData.isCrucibleCore) {
      ch.rotation.y = nowSec * 1.1;
      ch.rotation.x = Math.sin(nowSec * 0.8) * 0.4;
    }
  });

  rig.infuserStationGroup.children.forEach((ch) => {
    if (ch.userData.isInfuserHolo) {
      ch.rotation.y = -nowSec * 1.25;
      ch.rotation.z = nowSec * 0.75;
    }
  });

  rig.armoryStationGroup.children.forEach((ch) => {
    if (ch.userData.isArmoryHolo) {
      ch.rotation.y = nowSec * 1.6;
    }
  });

  rig.placedModulesGroup.traverse((ch) => {
    if (ch.userData.isFloatingCrystal) {
      ch.rotation.y = nowSec * 1.9;
      ch.position.y = 1.85 + Math.sin(nowSec * 2.8) * 0.12;
    }
  });

  // 4. Splitgate / Portal Live Sightline Render-to-Texture Pass:
  // Synchronize `portalEyeCamera` with the player's relative view angle and render into `portalRenderTarget`
  const eyeCam = rig.portalEyeCamera;
  eyeCam.fov = mainCamera.fov;
  eyeCam.aspect = 1.0;
  eyeCam.updateProjectionMatrix();

  if (!rig.isPlayerInsidePortalRoom && rig.portalOpenProgress > 0.03) {
    // Player is outside looking THROUGH the World Portal INTO the Large 36m x 36m Square Room!
    const distToPortal = mainCamera.position.distanceTo(rig.worldPortalPos);
    if (distToPortal < 68) {
      // Compute player camera offset relative to the World Portal frame
      const relPos = mainCamera.position
        .clone()
        .sub(rig.worldPortalPos)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), -rig.worldPortalYaw);

      // Map to the Return Portal entrance at the South end of the Square Room [0, 600, 16.0] looking North (-Z)
      const roomEntryOrigin = new THREE.Vector3(
        PORTAL_ROOM_ORIGIN.x,
        PORTAL_ROOM_ORIGIN.y,
        PORTAL_ROOM_ORIGIN.z + 15.6
      );
      eyeCam.position.set(
        roomEntryOrigin.x + THREE.MathUtils.clamp(relPos.x * 0.65, -8, 8),
        roomEntryOrigin.y + THREE.MathUtils.clamp(relPos.y, 1.2, 8.5),
        roomEntryOrigin.z - Math.min(2.5, Math.max(-4.0, relPos.z * 0.35))
      );

      // Match relative yaw and pitch so moving side-to-side produces true Splitgate/Portal 3D parallax inside the square room!
      const relYaw = playerYaw - rig.worldPortalYaw;
      const lookDir = new THREE.Vector3(
        -Math.sin(relYaw) * Math.cos(playerPitch),
        Math.sin(playerPitch),
        -Math.cos(relYaw) * Math.cos(playerPitch)
      );
      // Ensure the sightline always looks Northward (-Z) into the heart of the 36m x 36m square room
      lookDir.z = -Math.abs(lookDir.z) - 0.35;
      lookDir.normalize();
      eyeCam.lookAt(eyeCam.position.clone().add(lookDir.multiplyScalar(20)));

      // Throttle secondary render-to-texture pass to every 4th frame when within 36m and never mutate scene.fog (avoids Three.js shader fog re-validation!)
      const distToPortalSq = playerPos.distanceToSquared(rig.worldPortalPos);
      if (distToPortalSq < 1296 && Math.floor(nowSec * 60) % 4 === 0) {
        rig.worldPortalPlaneMesh.visible = false;
        rig.returnPortalPlaneMesh.visible = false;

        const prevTarget = renderer.getRenderTarget();
        renderer.setRenderTarget(rig.portalRenderTarget);
        renderer.clear();
        renderer.render(scene, eyeCam);
        renderer.setRenderTarget(prevTarget);

        rig.worldPortalPlaneMesh.visible = true;
        rig.returnPortalPlaneMesh.visible = true;
      }
    }
  } else if (rig.isPlayerInsidePortalRoom && Math.floor(nowSec * 60) % 4 === 0) {
    // Player is INSIDE the Square Room: render the live exterior world onto the South Return Portal every 4th frame!
    const exteriorPortalEye = new THREE.Vector3(
      rig.savedExteriorPos.x + Math.sin(rig.savedExteriorYaw) * 1.8,
      rig.savedExteriorPos.y + 1.8,
      rig.savedExteriorPos.z + Math.cos(rig.savedExteriorYaw) * 1.8
    );
    eyeCam.position.copy(exteriorPortalEye);
    const outLook = new THREE.Vector3(
      Math.sin(rig.savedExteriorYaw + Math.sin(nowSec * 0.3) * 0.15),
      -0.05,
      Math.cos(rig.savedExteriorYaw + Math.sin(nowSec * 0.3) * 0.15)
    );
    eyeCam.lookAt(exteriorPortalEye.clone().add(outLook.multiplyScalar(25)));

    rig.worldPortalPlaneMesh.visible = false;
    rig.returnPortalPlaneMesh.visible = false;
    const prevTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(rig.portalRenderTarget);
    renderer.clear();
    renderer.render(scene, eyeCam);
    renderer.setRenderTarget(prevTarget);
    rig.worldPortalPlaneMesh.visible = true;
    rig.returnPortalPlaneMesh.visible = true;
  }

  // 5. Evaluate which 3D Station inside the Square Portal Room the player is facing or standing near
  let focusedRoomStation: PortalRoomRuntimeTelemetry['focusedRoomStation'] =
    'none';
  let focusedStationLabel = `${PORTAL_ROOM_TIERS[rig.currentTier].name}`;
  let focusedStationHint =
    'Walk to North Crucible [K/E] to craft · East Infuser to upgrade room · Press [B] to place 3D Room Modules';

  if (rig.isPlayerInsidePortalRoom) {
    const localX = playerPos.x - PORTAL_ROOM_ORIGIN.x;
    const localZ = playerPos.z - PORTAL_ROOM_ORIGIN.z;

    if (Math.hypot(localX - 0, localZ - -12.5) < 5.5) {
      focusedRoomStation = 'synthesis-crucible';
      focusedStationLabel =
        'North Station · 3D Dimensional Synthesis Crucible';
      focusedStationHint =
        'Press [E] or [K] to open Multiversal Matter Synthesis & Forge Weapons/Grafts';
    } else if (Math.hypot(localX - 13.2, localZ - 0) < 5.5) {
      focusedRoomStation = 'room-evolution-infuser';
      focusedStationLabel = `East Station · Square Room Evolution Infuser (Tier ${rig.currentTier}/3)`;
      focusedStationHint =
        'Press [E] or [K] to infuse Multiversal Matters and upgrade the Square Portal Room architecture';
    } else if (Math.hypot(localX - -13.2, localZ - 0) < 5.5) {
      focusedRoomStation = 'armory-graft-rack';
      focusedStationLabel =
        'West Station · Dimensional Armory & Somatic Graft Pedestals';
      focusedStationHint =
        'Press [E] or [K] to inspect forged weapons and somatic biodepth grafts';
    } else if (localZ < -14.2 && rig.currentTier >= 3) {
      focusedRoomStation = 'boundary-stargate-bay';
      focusedStationLabel =
        'North Citadel Bay · Differential Universe Boundary Stargates';
      focusedStationHint =
        'Press [X] to shift the exterior world to a new Differential Universe Boundary';
    } else if (Math.hypot(localX - 6.8, localZ - 15.8) < 4.5) {
      focusedRoomStation = 'inner-maze-portal';
      focusedStationLabel = `Inner Maze Gate · ${selectedMaze.code}: ${selectedMaze.title} (${rig.selectedMazeIndex + 1}/${rig.knownMazes.length})`;
      focusedStationHint = rig.isInnerMazePortalOpen
        ? 'Press [← / →] Arrow Keys to flick through Mazes · Walk inside to explore & deploy CCTV/Assimilation Tech [B]'
        : 'Press [V] inside the Portal Room to tear open the Secondary Maze Selection Portal · [← / →] to flick through 100+ Mazes';
    } else if (Math.hypot(localX - 0, localZ - 16.4) < 4.2) {
      focusedRoomStation = 'return-world-portal';
      focusedStationLabel = `South Exit · Reality-Tear Portal to ${boundary.name}`;
      focusedStationHint =
        'Walk through the Reality-Tear Portal to step back out into the exterior dimension (or Press [V] to open the Inner Maze Portal beside you!)';
    }
  } else if (rig.isPlayerInsideMazeDimension) {
    const activeTechBp =
      MAZE_TECH_EQUIPMENT_CATALOG[rig.mazeDimensionRig.activeTechKind];
    focusedRoomStation = 'inner-maze-portal';
    focusedStationLabel = `${selectedMaze.code} · ${selectedMaze.title} (${selectedMazeTheme.themeName})`;
    focusedStationHint = `Assimilated ${selectedMaze.assimilationPct}% · Entity Control ${selectedMaze.entityControlPct}% (${selectedMaze.entityBehaviorMode.toUpperCase()}) · [B] Deploy ${activeTechBp.shortLabel} · [X] Cycle Tech · Walk to Center Tear to Return`;
  }

  return {
    isPortalOpenInWorld: rig.isPortalOpenInWorld,
    portalOpenProgress: Number(rig.portalOpenProgress.toFixed(2)),
    isPlayerInsidePortalRoom: rig.isPlayerInsidePortalRoom,
    portalRoomTier: rig.currentTier,
    focusedRoomStation,
    focusedStationLabel,
    focusedStationHint,
    activeModuleKind: rig.activeModuleKind,
    placedModulesCount: rig.placedModulesGroup.children.length,
    isInnerMazePortalOpen: rig.isInnerMazePortalOpen,
    innerMazePortalProgress: Number(rig.innerMazePortalProgress.toFixed(2)),
    selectedMazeIndex: rig.selectedMazeIndex,
    knownMazesCount: rig.knownMazes.length,
    selectedMazeCode: selectedMaze.code,
    selectedMazeTitle: selectedMaze.title,
    selectedMazeThemeTitle: selectedMazeTheme.themeName,
    selectedMazeEntityTitle: `${selectedMazeTheme.entityName} (${selectedMaze.entityBehaviorMode})`,
    selectedMazeAssimilationPct: selectedMaze.assimilationPct,
    selectedMazeEntityControlPct: selectedMaze.entityControlPct,
    selectedMazeLootCount:
      selectedMaze.totalLootCaches - selectedMaze.harvestedLootCaches,
    isPlayerInsideMazeDimension: rig.isPlayerInsideMazeDimension,
    activeMazeTechKind: rig.mazeDimensionRig.activeTechKind,
    placedMazeTechCount: rig.mazeDimensionRig.placedTechItems.filter(
      (t) => t.mazeId === selectedMaze.id
    ).length,
  };
}
