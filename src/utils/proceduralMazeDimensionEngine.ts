import * as THREE from 'three';
import {
  ALL_MAZE_HORROR_ARCHETYPE_IDS,
  ALL_MAZE_TECH_EQUIPMENT_KINDS,
  MAZE_ENTITY_THEME_CATALOG,
  MAZE_TECH_EQUIPMENT_CATALOG,
  MazeEntityThemeSpec,
  MazeHorrorArchetypeId,
  MazeSpatialTraitId,
  MazeTechEquipmentKind,
  MULTIVERSAL_MATTER_CATALOG,
  MultiversalMatterId,
  PlacedMazeTechEquipment,
  ProceduralMazeLevelSpec,
  ProceduralMazeLootNode,
} from '../types/portalAndBiodepth';

export const MAZE_DIMENSION_ORIGIN = new THREE.Vector3(0, 1250, 0);
export const MAZE_HALF_EXTENT = 26.0; // 13x13 grid * 4.0m = 52m x 52m vast interior

// ============================================================================
// 1. CUSTOM TRIPLANAR GLSL SHADERS FOR MULTI-THEMED ENTITY WALLPAPERS & FLOORS
//    (No yellow Backrooms clichés — 8 bespoke horror-entity architectural themes)
// ============================================================================

const MAZE_TRIPLANAR_VERTEX_SHADER = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    #ifdef USE_INSTANCING
      worldPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
    #endif
    vWorldPos = worldPosition.xyz;

    vec3 transformedNormal = normal;
    #ifdef USE_INSTANCING
      transformedNormal = mat3(instanceMatrix) * normal;
    #endif
    vWorldNormal = normalize(mat3(modelMatrix) * transformedNormal);

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const MAZE_WALLPAPER_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uPatternIndex;
  uniform float uAutonomicPulse;
  uniform vec3 uPrimaryColor;
  uniform vec3 uSecondaryColor;
  uniform vec3 uVeinEmissiveColor;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float evaluateWallpaperPattern(vec2 uv, float idx) {
    vec2 p = uv * 2.2;
    if (idx < 0.5) {
      // 0: Vitreous Arterial Damask Brocade
      float damask = sin(p.x * 6.2831) * cos(p.y * 6.2831) + 0.5 * cos((p.x + p.y) * 12.566);
      float arterialVein = smoothstep(0.82, 0.96, abs(sin(p.y * 3.1415 + sin(p.x * 4.0 + uTime * 0.8))));
      return clamp(damask * 0.5 + 0.5 + arterialVein * 0.45, 0.0, 1.0);
    } else if (idx < 1.5) {
      // 1: Bioluminescent Chitin Hexagonal Brocade
      vec2 hex = abs(fract(p * vec2(1.732, 1.0)) - 0.5);
      float hDist = max(hex.x * 0.866 + hex.y * 0.5, hex.y);
      return smoothstep(0.38, 0.48, hDist);
    } else if (idx < 2.5) {
      // 2: Chrono-Brass Art-Deco Escapement Filigree
      vec2 cell = fract(p * 1.4) - 0.5;
      float fan = abs(cos(atan(cell.y, cell.x) * 6.0 + uTime * 0.4));
      float chevron = step(0.35, fract((p.x + abs(cell.x) * 1.8) * 2.0));
      return mix(fan, chevron, 0.5);
    } else if (idx < 3.5) {
      // 3: Fluted Cymatic Barometric Silk
      float flute = 0.5 + 0.5 * sin(p.x * 18.0 + sin(p.y * 3.5 + uTime * 1.1) * 0.6);
      float chladni = abs(sin(p.x * 4.0) * sin(p.y * 4.0) - cos(p.x * 2.0) * cos(p.y * 2.0));
      return mix(flute, smoothstep(0.15, 0.45, chladni), 0.45);
    } else if (idx < 4.5) {
      // 4: Brutalist Incised Basalt Weave
      vec2 grid = abs(fract(p * vec2(0.8, 1.6)) - 0.5);
      float seam = smoothstep(0.44, 0.49, max(grid.x, grid.y));
      return seam;
    } else if (idx < 5.5) {
      // 5: Iridescent Mercury Contour Rib
      float rib = 0.5 + 0.5 * sin(p.y * 10.0 + sin(p.x * 5.0 - uTime * 1.5) * 1.4);
      return smoothstep(0.3, 0.85, rib);
    } else if (idx < 6.5) {
      // 6: Prismatic Faceted Reliquary Tile
      vec2 d = abs(fract(p * 1.8) - 0.5);
      float diamond = smoothstep(0.35, 0.48, d.x + d.y);
      return diamond;
    } else {
      // 7: Bathyal Ribbed Carapace Velvet
      float rib = abs(sin(p.x * 8.0 + cos(p.y * 4.0) * 0.8));
      float pore = smoothstep(0.75, 0.92, sin(p.x * 16.0) * sin(p.y * 16.0));
      return clamp(rib * 0.65 + pore * 0.5, 0.0, 1.0);
    }
  }

  void main() {
    // Triplanar world-space projection along X/Z wall planes
    vec3 blend = abs(vWorldNormal);
    blend = pow(blend, vec3(4.0));
    blend /= dot(blend, vec3(1.0)) + 0.0001;

    float localY = vWorldPos.y - 1250.0;
    vec2 uvX = vec2(vWorldPos.z, localY) * 0.42;
    vec2 uvZ = vec2(vWorldPos.x, localY) * 0.42;
    float patX = evaluateWallpaperPattern(uvX, uPatternIndex);
    float patZ = evaluateWallpaperPattern(uvZ, uPatternIndex);
    float pat = patX * blend.x + patZ * blend.z + patX * blend.y;

    // Architectural baseboard wainscot (bottom 0.42m) & crown molding (top 0.35m)
    float baseboard = 1.0 - smoothstep(0.0, 0.42, localY);
    float crown = smoothstep(4.35, 4.78, localY);
    float dadoRail = exp(-pow((localY - 1.15) * 9.0, 2.0));

    vec3 wallCol = mix(uPrimaryColor, uSecondaryColor, pat);
    wallCol = mix(wallCol, uPrimaryColor * 0.45, max(baseboard, crown) * 0.75);

    // Living entity emissive veins & dado rail accent
    float veinMask = smoothstep(0.78, 0.96, pat) * (0.55 + 0.45 * sin(uTime * 2.4 + vWorldPos.x * 0.35 + vWorldPos.z * 0.35));
    vec3 emissiveTerm = uVeinEmissiveColor * (veinMask * (0.65 + uAutonomicPulse * 0.5) + dadoRail * 0.55);

    // Subtle vertical ambient occlusion near floor and ceiling
    float ao = smoothstep(0.0, 0.55, localY) * (1.0 - smoothstep(4.2, 4.85, localY) * 0.45);
    vec3 finalColor = wallCol * (0.68 + 0.32 * ao) + emissiveTerm;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const MAZE_FLOOR_CARPET_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uFloorIndex;
  uniform vec3 uFloorPrimary;
  uniform vec3 uFloorSecondary;
  uniform vec3 uVeinEmissiveColor;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;

  float hash21(vec2 p) {
    p = fract(p * vec2(234.19, 512.83));
    p += dot(p, p + 33.71);
    return fract(p.x * p.y);
  }

  void main() {
    vec2 wp = vWorldPos.xz * 0.75;
    float microPile = hash21(floor(wp * 28.0)) * 0.14;
    float pattern = 0.0;

    if (uFloorIndex < 0.5) {
      // 0: Crimson Velvet Vascular Pile
      pattern = 0.5 + 0.5 * sin(wp.x * 5.0 + sin(wp.y * 4.0)) * cos(wp.y * 5.0);
    } else if (uFloorIndex < 1.5) {
      // 1: Emerald Spore Tufted Berber
      vec2 b = fract(wp * 3.5) - 0.5;
      pattern = smoothstep(0.18, 0.42, length(b));
    } else if (uFloorIndex < 2.5) {
      // 2: Obsidian-Gold Chevron Parquet
      float chev = fract(wp.y * 2.0 + abs(fract(wp.x * 1.5) - 0.5) * 2.0);
      pattern = smoothstep(0.42, 0.52, chev);
    } else if (uFloorIndex < 3.5) {
      // 3: Acoustic Slate Harmonic Weave
      pattern = abs(sin(wp.x * 6.283) * sin(wp.y * 6.283));
    } else if (uFloorIndex < 4.5) {
      // 4: Charcoal-Iron Grated Tread
      vec2 g = abs(fract(wp * 2.5) - 0.5);
      pattern = smoothstep(0.38, 0.46, max(g.x, g.y));
    } else if (uFloorIndex < 5.5) {
      // 5: Laminar Quicksilver Terrazzo
      pattern = 0.5 + 0.5 * sin(wp.x * 3.2 + wp.y * 2.8 + sin(uTime * 0.8 + length(wp)));
    } else if (uFloorIndex < 6.5) {
      // 6: Dichroic Prism Mosaic Weave
      vec2 m = abs(fract(wp * 2.2) - 0.5);
      pattern = smoothstep(0.32, 0.48, m.x + m.y);
    } else {
      // 7: Abyssal Bioluminescent Silt Carpet
      pattern = 0.5 + 0.5 * sin(wp.x * 4.5 + cos(wp.y * 4.5 + uTime * 0.6) * 1.5);
    }

    vec3 col = mix(uFloorPrimary, uFloorSecondary, pattern) + vec3(microPile * 0.25);
    float seamGlow = smoothstep(0.88, 0.98, pattern) * (0.35 + 0.25 * sin(uTime * 2.0 + wp.x + wp.y));
    col += uVeinEmissiveColor * seamGlow * 0.55;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createMazeWallpaperMaterial(
  theme: MazeEntityThemeSpec
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPatternIndex: { value: theme.wallPatternIndex },
      uAutonomicPulse: { value: 0.25 },
      uPrimaryColor: { value: new THREE.Color(theme.wallPrimaryHex) },
      uSecondaryColor: { value: new THREE.Color(theme.wallSecondaryHex) },
      uVeinEmissiveColor: { value: new THREE.Color(theme.wallVeinEmissiveHex) },
    },
    vertexShader: MAZE_TRIPLANAR_VERTEX_SHADER,
    fragmentShader: MAZE_WALLPAPER_FRAGMENT_SHADER,
  });
}

export function createMazeFloorCarpetMaterial(
  theme: MazeEntityThemeSpec
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uFloorIndex: { value: theme.floorShaderIndex },
      uFloorPrimary: { value: new THREE.Color(theme.floorPrimaryHex) },
      uFloorSecondary: { value: new THREE.Color(theme.floorSecondaryHex) },
      uVeinEmissiveColor: { value: new THREE.Color(theme.wallVeinEmissiveHex) },
    },
    vertexShader: MAZE_TRIPLANAR_VERTEX_SHADER,
    fragmentShader: MAZE_FLOOR_CARPET_FRAGMENT_SHADER,
  });
}

// ============================================================================
// 2. DETERMINISTIC CATALOG OF 100 STARTING VAST LOOT-FILLED MAZES + CITY SHADOW-MAZES
// ============================================================================

const MAZE_ARCHITECTURAL_PREFIXES = [
  'Vesperal',
  'Non-Euclidean',
  'Hyperbolic',
  'Ouroboros',
  'Catacomb',
  'Chladni',
  'Fulgurite',
  'Mycelial',
  'Tesseractic',
  'Bathyal',
];

const MAZE_ARCHITECTURAL_NOUNS = [
  'Reliquary Vault',
  'Gallery Labyrinth',
  'Conduit Cloister',
  'Resonance Ward',
  'Filigree Arcade',
  'Siphon Catacombs',
  'Panopticon Annex',
  'Archive Matrix',
  'Crucible Maze',
  'Sanctuary Fold',
];

function seededRandom(seed: number): () => number {
  let s = Math.abs(Math.floor(seed)) % 2147483647;
  if (s <= 0) s = 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateStarting100ProceduralMazes(
  baseWorldSeed: number = 1337
): ProceduralMazeLevelSpec[] {
  const mazes: ProceduralMazeLevelSpec[] = [];
  const allTraits: MazeSpatialTraitId[] = [
    'frustum-shifting-partitions',
    'vertical-sub-level-pitfalls',
    'autonomic-heartbeat-corridors',
    'high-density-reliquary-vault',
  ];

  for (let i = 0; i < 100; i++) {
    const mazeNum = i + 1;
    const seed = baseWorldSeed * 97 + mazeNum * 7919;
    const rng = seededRandom(seed);
    const archetypeId =
      ALL_MAZE_HORROR_ARCHETYPE_IDS[
        (i + Math.floor(rng() * 3)) % ALL_MAZE_HORROR_ARCHETYPE_IDS.length
      ];
    const theme = MAZE_ENTITY_THEME_CATALOG[archetypeId];
    const prefix =
      MAZE_ARCHITECTURAL_PREFIXES[i % MAZE_ARCHITECTURAL_PREFIXES.length];
    const noun =
      MAZE_ARCHITECTURAL_NOUNS[
        Math.floor(i / 10) % MAZE_ARCHITECTURAL_NOUNS.length
      ];

    const traitA = allTraits[i % allTraits.length];
    const traitB = allTraits[(i + 2) % allTraits.length];
    const numStr = String(mazeNum).padStart(3, '0');
    const totalLoot = 14 + (i % 7) * 2; // 14 to 26 loot caches per vast maze

    mazes.push({
      id: `maze-level-${numStr}`,
      mazeNumber: mazeNum,
      code: `MZ-${numStr}`,
      title: `${prefix} ${noun} #${numStr}`,
      seed,
      gridCols: 13,
      gridRows: 13,
      cellSizeM: 4.0,
      wallHeightM: 4.8,
      horrorArchetypeId: archetypeId,
      spatialTraits: [traitA, traitB],
      originKind: 'starting-known-100',
      assimilationPct: i === 0 ? 15 : 0,
      entityControlPct: i === 0 ? 10 : 0,
      entityBehaviorMode: 'stalking',
      totalLootCaches: totalLoot,
      harvestedLootCaches: 0,
    });
  }

  return mazes;
}

export function synthesizeCityShadowLabyrinthMaze(
  mazeNumber: number,
  settlementName: string,
  nativeElementId: string,
  seed: number
): ProceduralMazeLevelSpec {
  const elemToArchetype: Record<string, MazeHorrorArchetypeId> = {
    'pyro-vitreous': 'vitreous-arterial-weaver',
    'bio-miasmic': 'mycelial-chitin-stalker',
    'chrono-phase': 'chrono-escapement-wraith',
    'aero-cymatic': 'cymatic-choir-husher',
    'lithic-crystalline': 'hyperbolic-basalt-executioner',
    'hydro-superfluid': 'superfluid-mercury-amalgam',
  };
  const archetypeId =
    elemToArchetype[nativeElementId] ??
    ALL_MAZE_HORROR_ARCHETYPE_IDS[
      mazeNumber % ALL_MAZE_HORROR_ARCHETYPE_IDS.length
    ];
  const numStr = String(mazeNumber).padStart(3, '0');

  return {
    id: `maze-shadow-${numStr}-${Date.now()}`,
    mazeNumber,
    code: `SHDW-${numStr}`,
    title: `${settlementName} Shadow-Labyrinth #${numStr}`,
    seed: seed + mazeNumber * 4099,
    gridCols: 13,
    gridRows: 13,
    cellSizeM: 4.0,
    wallHeightM: 4.8,
    horrorArchetypeId: archetypeId,
    spatialTraits: [
      'frustum-shifting-partitions',
      'vertical-sub-level-pitfalls',
      'high-density-reliquary-vault',
    ],
    originKind: 'emergent-city-shadow-labyrinth',
    originSettlementName: settlementName,
    assimilationPct: 0,
    entityControlPct: 0,
    entityBehaviorMode: 'stalking',
    totalLootCaches: 24,
    harvestedLootCaches: 0,
  };
}

// ============================================================================
// 3. BLENDER GEOMETRY-NODES STYLE PROCEDURAL MAZE RIG & RUNTIME ENGINE
// ============================================================================

export interface MazeWallSegmentCollider {
  id: string;
  cx: number;
  cz: number;
  halfW: number;
  halfD: number;
  isShiftingPartition: boolean;
  lockedByCamera: boolean;
  altCx: number;
  altCz: number;
  altHalfW: number;
  altHalfD: number;
  meshIndex: number;
}

export interface MazePitfallCell {
  cellX: number;
  cellZ: number;
  worldX: number;
  worldZ: number;
  halfSpan: number;
  hasBridgeX: boolean;
}

export class ProceduralMazeDimensionRig {
  public readonly rootGroup: THREE.Group;
  public activeMazeSpec: ProceduralMazeLevelSpec;
  public activeTheme: MazeEntityThemeSpec;
  public wallpaperMaterial: THREE.ShaderMaterial;
  public floorMaterial: THREE.ShaderMaterial;

  public wallColliders: MazeWallSegmentCollider[] = [];
  public pitfallCells: MazePitfallCell[] = [];
  public lootNodes: ProceduralMazeLootNode[] = [];
  public lootMeshes: Map<string, THREE.Group> = new Map();

  public placedTechGroup: THREE.Group;
  public placedTechItems: PlacedMazeTechEquipment[] = [];
  public activeTechKind: MazeTechEquipmentKind = 'surveillance-camera-rig';

  public returnPortalGroup: THREE.Group;
  public returnPortalMaterial: THREE.ShaderMaterial | null = null;

  public horrorEntityGroup: THREE.Group;
  public horrorEntityPos: THREE.Vector3 = new THREE.Vector3();
  public horrorEntityYaw: number = 0;
  public horrorEntityTargetPos: THREE.Vector3 = new THREE.Vector3();

  private wallsInstancedMesh: THREE.InstancedMesh | null = null;
  private columnsInstancedMesh: THREE.InstancedMesh | null = null;
  private luminairesInstancedMesh: THREE.InstancedMesh | null = null;
  private interiorGroup: THREE.Group;
  private passiveSiphonTimer: number = 0;

  constructor(initialMaze: ProceduralMazeLevelSpec) {
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'procedural-maze-dimension-rig';
    this.rootGroup.position.copy(MAZE_DIMENSION_ORIGIN);

    this.activeMazeSpec = initialMaze;
    this.activeTheme =
      MAZE_ENTITY_THEME_CATALOG[initialMaze.horrorArchetypeId];
    this.wallpaperMaterial = createMazeWallpaperMaterial(this.activeTheme);
    this.floorMaterial = createMazeFloorCarpetMaterial(this.activeTheme);

    this.interiorGroup = new THREE.Group();
    this.rootGroup.add(this.interiorGroup);

    this.placedTechGroup = new THREE.Group();
    this.rootGroup.add(this.placedTechGroup);

    this.returnPortalGroup = new THREE.Group();
    this.returnPortalGroup.position.set(0, 0, 0);
    this.rootGroup.add(this.returnPortalGroup);

    this.horrorEntityGroup = new THREE.Group();
    this.rootGroup.add(this.horrorEntityGroup);

    this.rebuildMazeGeometryForSpec(initialMaze);
  }

  /**
   * Rebuilds the Blender Geometry Nodes–style procedural maze (Dual-Graph Spanning Tree + Braided Loops,
   * Instanced Wall Partitions, Corner Columns, Recessed Ceiling Luminaires, Localized Pitfall Vaults,
   * Multiversal Loot Caches, and the Resident Horror Entity).
   */
  public rebuildMazeGeometryForSpec(spec: ProceduralMazeLevelSpec): void {
    this.activeMazeSpec = spec;
    this.activeTheme = MAZE_ENTITY_THEME_CATALOG[spec.horrorArchetypeId];

    // Clear previous interior geometry
    while (this.interiorGroup.children.length > 0) {
      const ch = this.interiorGroup.children[0];
      this.interiorGroup.remove(ch);
    }
    this.wallColliders = [];
    this.pitfallCells = [];
    this.lootNodes = [];
    this.lootMeshes.clear();

    this.wallpaperMaterial = createMazeWallpaperMaterial(this.activeTheme);
    this.floorMaterial = createMazeFloorCarpetMaterial(this.activeTheme);

    const cols = spec.gridCols; // 13
    const rows = spec.gridRows; // 13
    const cellW = spec.cellSizeM; // 4.0m
    const wallH = spec.wallHeightM; // 4.8m
    const totalW = cols * cellW; // 52m
    const totalD = rows * cellW; // 52m
    const halfW = totalW * 0.5;
    const halfD = totalD * 0.5;
    const rng = seededRandom(spec.seed);

    // 1. Floor & Sub-Level Pitfall Vaults
    const mainFloor = new THREE.Mesh(
      new THREE.BoxGeometry(totalW + 2, 0.4, totalD + 2),
      this.floorMaterial
    );
    mainFloor.position.set(0, -0.2, 0);
    mainFloor.receiveShadow = true;
    this.interiorGroup.add(mainFloor);

    // Ceiling Slab
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: this.activeTheme.wallPrimaryHex,
      roughness: 0.72,
      metalness: 0.25,
    });
    const ceilingSlab = new THREE.Mesh(
      new THREE.BoxGeometry(totalW + 2, 0.4, totalD + 2),
      ceilingMat
    );
    ceilingSlab.position.set(0, wallH + 0.2, 0);
    this.interiorGroup.add(ceilingSlab);

    // Ambient Point Lights inside the Maze Dimension
    const centerLight = new THREE.PointLight(
      this.activeTheme.ceilingLuminaireHex,
      1.35,
      62,
      1.2
    );
    centerLight.position.set(0, wallH - 0.5, 0);
    this.interiorGroup.add(centerLight);

    for (const [lx, lz] of [
      [-14, -14],
      [14, -14],
      [-14, 14],
      [14, 14],
    ]) {
      const pLight = new THREE.PointLight(
        this.activeTheme.wallVeinEmissiveHex,
        0.95,
        36,
        1.35
      );
      pLight.position.set(lx, wallH - 0.8, lz);
      this.interiorGroup.add(pLight);
    }

    // 2. Randomized Depth-First Spanning Tree + Braided Loops (Blender Geometry Nodes Shortest-Path / Spanning Tree equivalent)
    const centerCellX = Math.floor(cols / 2); // 6
    const centerCellZ = Math.floor(rows / 2); // 6

    // Track horizontal walls (between row r and r+1) and vertical walls (between col c and c+1)
    const hWalls: boolean[][] = Array.from({ length: rows + 1 }, () =>
      Array(cols).fill(true)
    );
    const vWalls: boolean[][] = Array.from({ length: rows }, () =>
      Array(cols + 1).fill(true)
    );
    const visited: boolean[][] = Array.from({ length: rows }, () =>
      Array(cols).fill(false)
    );

    const stack: [number, number][] = [[centerCellX, centerCellZ]];
    visited[centerCellZ][centerCellX] = true;

    // Open a 3x3 central arrival plaza around (centerCellX, centerCellZ) so the Return Portal has breathing room
    for (let dz = -1; dz <= 1; dz++) {
      for (let dx = -1; dx <= 1; dx++) {
        const cx = centerCellX + dx;
        const cz = centerCellZ + dz;
        visited[cz][cx] = true;
        if (dx < 1) vWalls[cz][cx + 1] = false;
        if (dz < 1) hWalls[cz + 1][cx] = false;
      }
    }

    while (stack.length > 0) {
      const [cx, cz] = stack[stack.length - 1];
      const neighbors: { nx: number; nz: number; dir: 'N' | 'S' | 'E' | 'W' }[] =
        [];
      if (cz > 0 && !visited[cz - 1][cx])
        neighbors.push({ nx: cx, nz: cz - 1, dir: 'N' });
      if (cz < rows - 1 && !visited[cz + 1][cx])
        neighbors.push({ nx: cx, nz: cz + 1, dir: 'S' });
      if (cx < cols - 1 && !visited[cz][cx + 1])
        neighbors.push({ nx: cx + 1, nz: cz, dir: 'E' });
      if (cx > 0 && !visited[cz][cx - 1])
        neighbors.push({ nx: cx - 1, nz: cz, dir: 'W' });

      if (neighbors.length > 0) {
        const chosen =
          neighbors[Math.floor(rng() * neighbors.length)];
        if (chosen.dir === 'N') hWalls[cz][cx] = false;
        else if (chosen.dir === 'S') hWalls[cz + 1][cx] = false;
        else if (chosen.dir === 'E') vWalls[cz][cx + 1] = false;
        else if (chosen.dir === 'W') vWalls[cz][cx] = false;

        visited[chosen.nz][chosen.nx] = true;
        stack.push([chosen.nx, chosen.nz]);
      } else {
        stack.pop();
      }
    }

    // Braided Maze Loops: Remove ~28% of internal dead-end walls so exploration has multiple tactical flanking routes
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        if (rng() < 0.28) hWalls[r][c] = false;
        if (rng() < 0.28) vWalls[r][c] = false;
      }
    }

    // 3. Collect Wall Segments for GPU Instancing & Collision
    const wallThickness = 0.36;
    const wallTransforms: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();

    // Horizontal wall segments
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!hWalls[r][c]) continue;
        const wx = -halfW + (c + 0.5) * cellW;
        const wz = -halfD + r * cellW;
        const isBorder = r === 0 || r === rows;
        const isShifting =
          !isBorder &&
          spec.spatialTraits.includes('frustum-shifting-partitions') &&
          rng() < 0.18;

        dummy.position.set(wx, wallH * 0.5, wz);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(cellW, wallH, wallThickness);
        dummy.updateMatrix();
        const meshIndex = wallTransforms.length;
        wallTransforms.push(dummy.matrix.clone());

        this.wallColliders.push({
          id: `hwall-${r}-${c}`,
          cx: wx,
          cz: wz,
          halfW: cellW * 0.5,
          halfD: wallThickness * 0.5,
          isShiftingPartition: isShifting,
          lockedByCamera: false,
          altCx: -halfW + c * cellW,
          altCz: -halfD + (Math.min(rows - 1, r) + 0.5) * cellW,
          altHalfW: wallThickness * 0.5,
          altHalfD: cellW * 0.5,
          meshIndex,
        });
      }
    }

    // Vertical wall segments
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c <= cols; c++) {
        if (!vWalls[r][c]) continue;
        const wx = -halfW + c * cellW;
        const wz = -halfD + (r + 0.5) * cellW;
        const isBorder = c === 0 || c === cols;
        const isShifting =
          !isBorder &&
          spec.spatialTraits.includes('frustum-shifting-partitions') &&
          rng() < 0.18;

        dummy.position.set(wx, wallH * 0.5, wz);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(wallThickness, wallH, cellW);
        dummy.updateMatrix();
        const meshIndex = wallTransforms.length;
        wallTransforms.push(dummy.matrix.clone());

        this.wallColliders.push({
          id: `vwall-${r}-${c}`,
          cx: wx,
          cz: wz,
          halfW: wallThickness * 0.5,
          halfD: cellW * 0.5,
          isShiftingPartition: isShifting,
          lockedByCamera: false,
          altCx: -halfW + (Math.min(cols - 1, c) + 0.5) * cellW,
          altCz: -halfD + r * cellW,
          altHalfW: cellW * 0.5,
          altHalfD: wallThickness * 0.5,
          meshIndex,
        });
      }
    }

    const unitBoxGeo = new THREE.BoxGeometry(1, 1, 1);
    this.wallsInstancedMesh = new THREE.InstancedMesh(
      unitBoxGeo,
      this.wallpaperMaterial,
      wallTransforms.length
    );
    this.wallsInstancedMesh.castShadow = true;
    this.wallsInstancedMesh.receiveShadow = true;
    wallTransforms.forEach((mat, i) => {
      this.wallsInstancedMesh!.setMatrixAt(i, mat);
    });
    this.wallsInstancedMesh.instanceMatrix.needsUpdate = true;
    this.interiorGroup.add(this.wallsInstancedMesh);

    // 4. Instanced Corner Columns (Geometry Nodes Vertex Instance equivalent)
    const colGeo = new THREE.CylinderGeometry(0.26, 0.3, wallH, 8);
    const colMat = new THREE.MeshStandardMaterial({
      color: this.activeTheme.wallSecondaryHex,
      emissive: this.activeTheme.wallVeinEmissiveHex,
      emissiveIntensity: 0.28,
      metalness: 0.72,
      roughness: 0.28,
    });
    const colCount = (rows + 1) * (cols + 1);
    this.columnsInstancedMesh = new THREE.InstancedMesh(
      colGeo,
      colMat,
      colCount
    );
    let colIdx = 0;
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        dummy.position.set(
          -halfW + c * cellW,
          wallH * 0.5,
          -halfD + r * cellW
        );
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        this.columnsInstancedMesh.setMatrixAt(colIdx++, dummy.matrix);
      }
    }
    this.columnsInstancedMesh.instanceMatrix.needsUpdate = true;
    this.interiorGroup.add(this.columnsInstancedMesh);

    // 5. Instanced Recessed Ceiling Luminaires (Themed to the Entity, never yellow fluorescent tubes)
    const lumGeo = new THREE.BoxGeometry(1.35, 0.08, 1.35);
    const lumMat = new THREE.MeshBasicMaterial({
      color: this.activeTheme.ceilingLuminaireHex,
    });
    const lumCount = rows * cols;
    this.luminairesInstancedMesh = new THREE.InstancedMesh(
      lumGeo,
      lumMat,
      lumCount
    );
    let lumIdx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dummy.position.set(
          -halfW + (c + 0.5) * cellW,
          wallH - 0.05,
          -halfD + (r + 0.5) * cellW
        );
        dummy.rotation.set(0, (r + c) * 0.25, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        this.luminairesInstancedMesh.setMatrixAt(lumIdx++, dummy.matrix);
      }
    }
    this.luminairesInstancedMesh.instanceMatrix.needsUpdate = true;
    this.interiorGroup.add(this.luminairesInstancedMesh);

    // 6. Localized Sub-Level Pitfall Vaults & Catwalk Bridges (Additive Exploration Feature)
    if (spec.spatialTraits.includes('vertical-sub-level-pitfalls')) {
      const pitCoords: [number, number][] = [
        [2, 2],
        [cols - 3, 2],
        [2, rows - 3],
        [cols - 3, rows - 3],
      ];
      const bridgeMat = new THREE.MeshStandardMaterial({
        color: '#1e293b',
        emissive: this.activeTheme.wallVeinEmissiveHex,
        emissiveIntensity: 0.45,
        metalness: 0.85,
        roughness: 0.22,
      });

      for (const [pc, pr] of pitCoords) {
        const wx = -halfW + (pc + 0.5) * cellW;
        const wz = -halfD + (pr + 0.5) * cellW;
        this.pitfallCells.push({
          cellX: pc,
          cellZ: pr,
          worldX: wx,
          worldZ: wz,
          halfSpan: cellW * 0.45,
          hasBridgeX: (pc + pr) % 2 === 0,
        });

        // Glowing Sub-Level Vault Rim & Narrow Catwalk Bridge across the pit
        const rimFrame = new THREE.Mesh(
          new THREE.RingGeometry(cellW * 0.36, cellW * 0.46, 4),
          new THREE.MeshBasicMaterial({
            color: this.activeTheme.wallVeinEmissiveHex,
            side: THREE.DoubleSide,
          })
        );
        rimFrame.rotation.x = -Math.PI / 2;
        rimFrame.rotation.z = Math.PI / 4;
        rimFrame.position.set(wx, 0.03, wz);
        this.interiorGroup.add(rimFrame);

        const bridgePlank = new THREE.Mesh(
          new THREE.BoxGeometry(cellW, 0.14, 0.95),
          bridgeMat
        );
        bridgePlank.position.set(wx, 0.07, wz);
        if ((pc + pr) % 2 !== 0) {
          bridgePlank.rotation.y = Math.PI / 2;
        }
        this.interiorGroup.add(bridgePlank);
      }
    }

    // 7. Populate Vast Multiversal Loot Caches across the Maze Corridors
    const matterPool: MultiversalMatterId[] = [
      this.activeTheme.primaryMatterYield,
      this.activeTheme.secondaryMatterYield,
      'astral-singularity-core',
      'chronos-lattice-quartz',
    ];
    let placedLoot = 0;
    for (let r = 0; r < rows && placedLoot < spec.totalLootCaches; r++) {
      for (let c = 0; c < cols && placedLoot < spec.totalLootCaches; c++) {
        if (Math.abs(c - centerCellX) <= 1 && Math.abs(r - centerCellZ) <= 1) {
          continue; // Keep central portal plaza clear
        }
        if ((r * 7 + c * 13 + spec.mazeNumber) % 5 === 0) {
          const wx = -halfW + (c + 0.5) * cellW;
          const wz = -halfD + (r + 0.5) * cellW;
          const matterId = matterPool[placedLoot % matterPool.length];
          const mSpec = MULTIVERSAL_MATTER_CATALOG[matterId];
          const nodeId = `${spec.id}-loot-${placedLoot}`;

          const lootGroup = new THREE.Group();
          lootGroup.position.set(wx, 0, wz);

          const plinth = new THREE.Mesh(
            new THREE.CylinderGeometry(0.42, 0.58, 0.45, 6),
            new THREE.MeshStandardMaterial({
              color: '#0f172a',
              metalness: 0.85,
              roughness: 0.2,
            })
          );
          plinth.position.y = 0.225;
          lootGroup.add(plinth);

          const crystal = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.42, 0),
            new THREE.MeshStandardMaterial({
              color: mSpec.colorHex,
              emissive: mSpec.emissiveHex,
              emissiveIntensity: 1.4,
              metalness: 0.5,
              roughness: 0.15,
            })
          );
          crystal.position.y = 1.1;
          crystal.userData.isLootCrystal = true;
          lootGroup.add(crystal);

          const halo = new THREE.Mesh(
            new THREE.TorusGeometry(0.55, 0.035, 8, 24),
            new THREE.MeshBasicMaterial({ color: mSpec.colorHex })
          );
          halo.rotation.x = Math.PI / 2;
          halo.position.y = 1.1;
          lootGroup.add(halo);

          this.interiorGroup.add(lootGroup);
          this.lootMeshes.set(nodeId, lootGroup);
          this.lootNodes.push({
            id: nodeId,
            cellX: c,
            cellZ: r,
            worldX: wx,
            worldY: 0,
            worldZ: wz,
            matterId,
            matterAmount: placedLoot % 4 === 0 ? 2 : 1,
            collected: false,
          });
          placedLoot++;
        }
      }
    }

    // 8. Build Resident Horror Entity 3D Mesh & Set Starting Patrol Coordinate
    this.buildResidentHorrorEntityMesh();
    this.horrorEntityPos.set(-halfW + 2.5 * cellW, 0, -halfD + 2.5 * cellW);
    this.horrorEntityTargetPos.set(
      halfW - 2.5 * cellW,
      0,
      halfD - 2.5 * cellW
    );
    this.horrorEntityGroup.position.copy(this.horrorEntityPos);

    // Re-render any Tech Equipment already placed in this specific Maze
    this.rebuildPlacedTechMeshesForCurrentMaze();
  }

  private buildResidentHorrorEntityMesh(): void {
    while (this.horrorEntityGroup.children.length > 0) {
      this.horrorEntityGroup.remove(this.horrorEntityGroup.children[0]);
    }

    const theme = this.activeTheme;
    const carapaceMat = new THREE.MeshPhysicalMaterial({
      color: theme.wallSecondaryHex,
      emissive: theme.wallVeinEmissiveHex,
      emissiveIntensity: 0.85,
      metalness: 0.78,
      roughness: 0.2,
      clearcoat: 1.0,
    });
    const coreMat = new THREE.MeshBasicMaterial({
      color: theme.ceilingLuminaireHex,
    });

    // Multi-limbed Eldritch Predator Silhouette (2.8m tall)
    const torso = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.65, 1),
      carapaceMat
    );
    torso.scale.set(0.85, 2.1, 0.75);
    torso.position.y = 1.65;
    this.horrorEntityGroup.add(torso);

    const crownHalo = new THREE.Mesh(
      new THREE.TorusGeometry(0.78, 0.055, 8, 28),
      coreMat
    );
    crownHalo.position.y = 2.65;
    crownHalo.userData.isEntityCrown = true;
    this.horrorEntityGroup.add(crownHalo);

    // 6 Articulated Stalker Scythe Limbs
    for (let i = 0; i < 6; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const tier = Math.floor(i / 2);
      const limb = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 1.65, 6),
        carapaceMat
      );
      limb.position.set(side * 0.68, 1.1 + tier * 0.48, -0.2);
      limb.rotation.z = side * (0.65 + tier * 0.2);
      limb.rotation.x = 0.35;
      limb.userData.isEntityLimb = true;
      limb.userData.limbIndex = i;
      this.horrorEntityGroup.add(limb);
    }
  }

  /**
   * Cycles the active In-Maze Tech Equipment kind (`surveillance-camera-rig`, `maze-assimilation-pylon`,
   * `entity-command-beacon`, `loot-siphon-transponder`).
   */
  public cycleActiveTechEquipmentKind(): MazeTechEquipmentKind {
    const idx = ALL_MAZE_TECH_EQUIPMENT_KINDS.indexOf(this.activeTechKind);
    this.activeTechKind =
      ALL_MAZE_TECH_EQUIPMENT_KINDS[
        (idx + 1) % ALL_MAZE_TECH_EQUIPMENT_KINDS.length
      ];
    return this.activeTechKind;
  }

  /**
   * Deploys a Surveillance Camera Rig, Maze Assimilation Pylon, Entity Command Beacon, or Loot Siphon Transponder
   * at the player's current position inside the Maze Dimension.
   */
  public deployTechEquipmentInActiveMaze(
    playerWorldPos: THREE.Vector3,
    playerYaw: number,
    overrideKind?: MazeTechEquipmentKind
  ): {
    placedItem: PlacedMazeTechEquipment;
    updatedSpec: ProceduralMazeLevelSpec;
    siphonedMatterId?: MultiversalMatterId;
    siphonedAmount?: number;
  } {
    const kind = overrideKind ?? this.activeTechKind;
    const bp = MAZE_TECH_EQUIPMENT_CATALOG[kind];
    const localX = THREE.MathUtils.clamp(
      playerWorldPos.x - MAZE_DIMENSION_ORIGIN.x - Math.sin(playerYaw) * 2.2,
      -MAZE_HALF_EXTENT + 1.5,
      MAZE_HALF_EXTENT - 1.5
    );
    const localZ = THREE.MathUtils.clamp(
      playerWorldPos.z - MAZE_DIMENSION_ORIGIN.z - Math.cos(playerYaw) * 2.2,
      -MAZE_HALF_EXTENT + 1.5,
      MAZE_HALF_EXTENT - 1.5
    );

    const newItem: PlacedMazeTechEquipment = {
      id: `maze-tech-${Date.now()}-${Math.floor(Math.random() * 999)}`,
      mazeId: this.activeMazeSpec.id,
      kind,
      worldX: localX,
      worldY: 0,
      worldZ: localZ,
      yaw: playerYaw,
    };
    this.placedTechItems.push(newItem);
    this.placedTechGroup.add(this.buildTechEquipmentMesh(newItem));

    // Boost Maze Assimilation % and Entity Control %
    this.activeMazeSpec.assimilationPct = Math.min(
      100,
      this.activeMazeSpec.assimilationPct + bp.assimilationBoostPct
    );
    this.activeMazeSpec.entityControlPct = Math.min(
      100,
      this.activeMazeSpec.entityControlPct + bp.entityControlBoostPct
    );
    if (this.activeMazeSpec.entityControlPct >= 75) {
      this.activeMazeSpec.entityBehaviorMode = 'allied-guardian';
    } else if (this.activeMazeSpec.entityControlPct >= 40) {
      this.activeMazeSpec.entityBehaviorMode = 'pacified';
    }

    // Lock any non-euclidean shifting walls within the equipment's lock radius!
    for (const wall of this.wallColliders) {
      if (
        Math.hypot(wall.cx - localX, wall.cz - localZ) <= bp.lockRadiusMeters
      ) {
        wall.lockedByCamera = true;
      }
    }

    // If Loot Siphon Transponder (or 100% Assimilation), immediately siphon nearest uncollected loot cache
    let siphonedMatterId: MultiversalMatterId | undefined;
    let siphonedAmount = 0;
    if (
      kind === 'loot-siphon-transponder' ||
      this.activeMazeSpec.assimilationPct >= 100
    ) {
      for (const loot of this.lootNodes) {
        if (
          !loot.collected &&
          Math.hypot(loot.worldX - localX, loot.worldZ - localZ) <=
            bp.lockRadiusMeters
        ) {
          loot.collected = true;
          this.activeMazeSpec.harvestedLootCaches++;
          siphonedMatterId = loot.matterId;
          siphonedAmount += loot.matterAmount;
          const mesh = this.lootMeshes.get(loot.id);
          if (mesh) mesh.visible = false;
        }
      }
    }

    return {
      placedItem: newItem,
      updatedSpec: { ...this.activeMazeSpec },
      siphonedMatterId,
      siphonedAmount,
    };
  }

  private rebuildPlacedTechMeshesForCurrentMaze(): void {
    while (this.placedTechGroup.children.length > 0) {
      this.placedTechGroup.remove(this.placedTechGroup.children[0]);
    }
    const itemsForMaze = this.placedTechItems.filter(
      (t) => t.mazeId === this.activeMazeSpec.id
    );
    for (const item of itemsForMaze) {
      this.placedTechGroup.add(this.buildTechEquipmentMesh(item));
    }
  }

  private buildTechEquipmentMesh(item: PlacedMazeTechEquipment): THREE.Group {
    const bp = MAZE_TECH_EQUIPMENT_CATALOG[item.kind];
    const group = new THREE.Group();
    group.position.set(item.worldX, item.worldY, item.worldZ);
    group.rotation.y = item.yaw;

    const tripodMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      metalness: 0.88,
      roughness: 0.22,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: bp.accentHex,
      emissive: bp.accentHex,
      emissiveIntensity: 1.35,
      metalness: 0.5,
      roughness: 0.15,
    });

    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.28, 2.2, 8),
      tripodMat
    );
    mast.position.y = 1.1;
    group.add(mast);

    if (item.kind === 'surveillance-camera-rig') {
      const camHousing = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.32, 0.68),
        tripodMat
      );
      camHousing.position.set(0, 2.25, 0);
      group.add(camHousing);

      const lens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.2, 12),
        accentMat
      );
      lens.rotation.x = Math.PI / 2;
      lens.position.set(0, 2.25, -0.38);
      group.add(lens);

      // Optical Surveillance Frustum Cone locking non-euclidean walls
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(1.4, 4.2, 16, 1, true),
        new THREE.MeshBasicMaterial({
          color: bp.accentHex,
          transparent: true,
          opacity: 0.18,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        })
      );
      cone.rotation.x = Math.PI / 2;
      cone.position.set(0, 2.25, -2.4);
      group.add(cone);
    } else if (item.kind === 'maze-assimilation-pylon') {
      const spire = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.52, 0),
        accentMat
      );
      spire.scale.set(0.7, 2.1, 0.7);
      spire.position.y = 2.4;
      spire.userData.isSpinningTech = true;
      group.add(spire);
    } else if (item.kind === 'entity-command-beacon') {
      for (let r = 0; r < 2; r++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.58 + r * 0.22, 0.04, 8, 24),
          accentMat
        );
        ring.position.y = 2.35;
        ring.rotation.x = r * 0.8;
        ring.userData.isSpinningTech = true;
        group.add(ring);
      }
    } else {
      // loot-siphon-transponder
      const dish = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
        accentMat
      );
      dish.position.y = 2.2;
      dish.userData.isSpinningTech = true;
      group.add(dish);
    }

    return group;
  }

  /**
   * Evaluates authoritative floor height, sub-level pitfall vaults, and wall AABB push-out
   * when the player is inside the Procedural Maze Dimension.
   */
  public evaluateMazeGroundAndCollision(
    worldX: number,
    worldZ: number,
    currentFeetY: number,
    playerRadius: number = 0.45
  ): {
    groundY: number;
    pushOutX: number;
    pushOutZ: number;
  } {
    const localX = worldX - MAZE_DIMENSION_ORIGIN.x;
    const localZ = worldZ - MAZE_DIMENSION_ORIGIN.z;
    let groundY = MAZE_DIMENSION_ORIGIN.y;

    // 1. Check Localized Sub-Level Pitfall Vaults
    for (const pit of this.pitfallCells) {
      const dx = Math.abs(localX - pit.worldX);
      const dz = Math.abs(localZ - pit.worldZ);
      if (dx < pit.halfSpan && dz < pit.halfSpan) {
        const onBridge = pit.hasBridgeX ? dz < 0.52 : dx < 0.52;
        if (!onBridge && currentFeetY < MAZE_DIMENSION_ORIGIN.y + 0.15) {
          // Smooth ramp at pit edges so player can always climb back out of the sub-level vault!
          const edgeRatio = Math.max(dx, dz) / pit.halfSpan;
          if (edgeRatio > 0.72) {
            const rampT = (edgeRatio - 0.72) / 0.28;
            groundY = MAZE_DIMENSION_ORIGIN.y - (1.0 - rampT) * 2.4;
          } else {
            groundY = MAZE_DIMENSION_ORIGIN.y - 2.4;
          }
        }
      }
    }

    // 2. Resolve 2D Box Collision against active Maze Wall Segments
    let pushOutX = 0;
    let pushOutZ = 0;
    if (currentFeetY < MAZE_DIMENSION_ORIGIN.y + this.activeMazeSpec.wallHeightM) {
      for (const wall of this.wallColliders) {
        const dx = localX - wall.cx;
        const dz = localZ - wall.cz;
        const overlapX = wall.halfW + playerRadius - Math.abs(dx);
        const overlapZ = wall.halfD + playerRadius - Math.abs(dz);
        if (overlapX > 0 && overlapZ > 0) {
          if (overlapX < overlapZ) {
            pushOutX += dx >= 0 ? overlapX : -overlapX;
          } else {
            pushOutZ += dz >= 0 ? overlapZ : -overlapZ;
          }
        }
      }
    }

    return { groundY, pushOutX, pushOutZ };
  }

  /**
   * Steps the Maze Dimension shaders, non-euclidean frustum wall shifts (when unobserved by player & cameras),
   * loot harvesting, passive assimilation matter siphoning, and Resident Horror Entity AI.
   */
  public update(params: {
    dt: number;
    nowSec: number;
    isPlayerInsideMaze: boolean;
    playerPos: THREE.Vector3;
    playerYaw: number;
    onHarvestMazeLoot?: (
      matterId: MultiversalMatterId,
      amount: number,
      label: string
    ) => void;
    onExitMazeToPortalRoom?: () => void;
  }): void {
    const {
      dt,
      nowSec,
      isPlayerInsideMaze,
      playerPos,
      playerYaw,
      onHarvestMazeLoot,
      onExitMazeToPortalRoom,
    } = params;

    this.wallpaperMaterial.uniforms.uTime.value = nowSec;
    this.floorMaterial.uniforms.uTime.value = nowSec;
    if (this.returnPortalMaterial) {
      this.returnPortalMaterial.uniforms.uTime.value = nowSec;
      this.returnPortalMaterial.uniforms.uOpenProgress.value = 1.0;
    }

    // Passive Multiversal Matter Siphon when Maze Assimilation >= 50%
    if (this.activeMazeSpec.assimilationPct >= 50 && onHarvestMazeLoot) {
      this.passiveSiphonTimer += dt;
      if (this.passiveSiphonTimer >= 22.0) {
        this.passiveSiphonTimer = 0;
        const mId = this.activeTheme.primaryMatterYield;
        onHarvestMazeLoot(
          mId,
          1,
          `Assimilated ${this.activeMazeSpec.code} Siphon (+1 ${MULTIVERSAL_MATTER_CATALOG[mId].shortName})`
        );
      }
    }

    if (!isPlayerInsideMaze) return;

    const localPlayerX = playerPos.x - MAZE_DIMENSION_ORIGIN.x;
    const localPlayerZ = playerPos.z - MAZE_DIMENSION_ORIGIN.z;

    // 1. Check Return Portal at Center Plaza (0, 0) to step back into the Square Portal Room
    if (
      Math.hypot(localPlayerX, localPlayerZ) < 1.65 &&
      onExitMazeToPortalRoom
    ) {
      onExitMazeToPortalRoom();
      return;
    }

    // 2. Check Proximity to Multiversal Loot Caches inside the Maze
    for (const loot of this.lootNodes) {
      const mesh = this.lootMeshes.get(loot.id);
      if (mesh && !loot.collected) {
        mesh.children.forEach((ch) => {
          if (ch.userData.isLootCrystal) {
            ch.rotation.y = nowSec * 2.1;
            ch.position.y = 1.1 + Math.sin(nowSec * 3.0 + loot.cellX) * 0.14;
          }
        });
        if (
          Math.hypot(localPlayerX - loot.worldX, localPlayerZ - loot.worldZ) <
          2.1
        ) {
          loot.collected = true;
          this.activeMazeSpec.harvestedLootCaches++;
          mesh.visible = false;
          if (onHarvestMazeLoot) {
            onHarvestMazeLoot(
              loot.matterId,
              loot.matterAmount,
              `${this.activeMazeSpec.code} Vault Cache (+${loot.matterAmount} ${MULTIVERSAL_MATTER_CATALOG[loot.matterId].shortName})`
            );
          }
        }
      }
    }

    // 3. Non-Euclidean Frustum-Gated Wall Shifts (Only shifts walls behind the player that are NOT locked by Surveillance Cameras!)
    if (
      this.activeMazeSpec.spatialTraits.includes(
        'frustum-shifting-partitions'
      ) &&
      this.wallsInstancedMesh &&
      Math.floor(nowSec * 60) % 90 === 0
    ) {
      const lookX = -Math.sin(playerYaw);
      const lookZ = -Math.cos(playerYaw);
      const dummy = new THREE.Object3D();
      let matrixChanged = false;

      for (const wall of this.wallColliders) {
        if (!wall.isShiftingPartition || wall.lockedByCamera) continue;
        const dx = wall.cx - localPlayerX;
        const dz = wall.cz - localPlayerZ;
        const dist = Math.hypot(dx, dz);
        if (dist < 6.0 || dist > 22.0) continue;

        const dot = (dx * lookX + dz * lookZ) / Math.max(0.001, dist);
        // Only shift when behind the player's field of view (dot < -0.35)
        if (dot < -0.35) {
          const tmpCx = wall.cx;
          const tmpCz = wall.cz;
          const tmpHW = wall.halfW;
          const tmpHD = wall.halfD;
          wall.cx = wall.altCx;
          wall.cz = wall.altCz;
          wall.halfW = wall.altHalfW;
          wall.halfD = wall.altHalfD;
          wall.altCx = tmpCx;
          wall.altCz = tmpCz;
          wall.altHalfW = tmpHW;
          wall.altHalfD = tmpHD;

          dummy.position.set(
            wall.cx,
            this.activeMazeSpec.wallHeightM * 0.5,
            wall.cz
          );
          dummy.scale.set(
            wall.halfW * 2,
            this.activeMazeSpec.wallHeightM,
            wall.halfD * 2
          );
          dummy.updateMatrix();
          this.wallsInstancedMesh.setMatrixAt(wall.meshIndex, dummy.matrix);
          matrixChanged = true;
        }
      }
      if (matrixChanged) {
        this.wallsInstancedMesh.instanceMatrix.needsUpdate = true;
      }
    }

    // 4. Step Resident Horror Entity AI (Stalking vs. Pacified vs. Allied Guardian via Tech Control)
    const toTargetX =
      this.activeMazeSpec.entityBehaviorMode === 'stalking'
        ? localPlayerX - this.horrorEntityPos.x
        : this.horrorEntityTargetPos.x - this.horrorEntityPos.x;
    const toTargetZ =
      this.activeMazeSpec.entityBehaviorMode === 'stalking'
        ? localPlayerZ - this.horrorEntityPos.z
        : this.horrorEntityTargetPos.z - this.horrorEntityPos.z;
    const distToTarget = Math.hypot(toTargetX, toTargetZ);

    if (
      this.activeMazeSpec.entityBehaviorMode !== 'stalking' &&
      distToTarget < 2.5
    ) {
      const angle = nowSec * 0.7;
      this.horrorEntityTargetPos.set(
        Math.cos(angle) * 16,
        0,
        Math.sin(angle) * 16
      );
    }

    const moveSpeed =
      this.activeMazeSpec.entityBehaviorMode === 'stalking' ? 3.8 : 2.6;
    if (distToTarget > 1.8) {
      this.horrorEntityPos.x += (toTargetX / distToTarget) * moveSpeed * dt;
      this.horrorEntityPos.z += (toTargetZ / distToTarget) * moveSpeed * dt;
      this.horrorEntityYaw = Math.atan2(toTargetX, toTargetZ);
    }

    this.horrorEntityGroup.position.set(
      this.horrorEntityPos.x,
      Math.sin(nowSec * 3.2) * 0.18,
      this.horrorEntityPos.z
    );
    this.horrorEntityGroup.rotation.y = this.horrorEntityYaw;
    this.horrorEntityGroup.children.forEach((ch) => {
      if (ch.userData.isEntityCrown) {
        ch.rotation.z = nowSec * 2.4;
      }
      if (ch.userData.isEntityLimb) {
        const idx = ch.userData.limbIndex ?? 0;
        ch.rotation.x = 0.35 + Math.sin(nowSec * 5.0 + idx) * 0.35;
      }
    });

    // Animate spinning deployed Tech Equipment
    this.placedTechGroup.traverse((ch) => {
      if (ch.userData.isSpinningTech) {
        ch.rotation.y = nowSec * 2.2;
      }
    });
  }
}
