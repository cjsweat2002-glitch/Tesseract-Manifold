import * as THREE from 'three';
import {
  LSystemArtformGrammarSpec,
  LSystemVitalityPhase,
  LSystemWEvolutionRegime,
  ManifoldWorldSpec,
  WorldspaceArtformArchetype,
  WorldspaceProceduralArtform,
} from '../types/manifold';
import {
  createCalabiYauRosetteGeometry,
  createDifferentialGrowthRibbonGeometry,
  createHyperbolicPseudosphereGeometry,
  createTPMSGyroidShellGeometry,
} from './architecturalWisdomEngine';

const GOLDEN_RATIO = 1.618033988749895;
const GOLDEN_ANGLE_RAD = 2.399963229728653; // 137.507764 deg in radians
const SILVER_RATIO = 2.414213562373095;

export interface LSystemToken {
  symbol:
    | 'F'
    | 'G'
    | 'A'
    | 'X'
    | 'Y'
    | 'J'
    | 'B'
    | '+'
    | '-'
    | '&'
    | '^'
    | '/'
    | '\\'
    | '['
    | ']';
  length: number;
  radius: number;
  angleRad: number;
  generation: number;
  hashSeed: number;
  chirality: number;
}

export interface LSystemBranchSegment3D {
  start: THREE.Vector3;
  control: THREE.Vector3;
  end: THREE.Vector3;
  upNormal: THREE.Vector3;
  startRadius: number;
  endRadius: number;
  generation: number;
  maxGeneration: number;
  twistRad: number;
  isCantileverStrut: boolean;
  hashSeed: number;
}

export interface LSystemArticulatedOrganNode {
  kind: 'bifurcation-calyx' | 'apical-bloom' | 'aerial-satellite';
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: number;
  generation: number;
  hashSeed: number;
}

export interface WCoordinateInfluenceEvaluation {
  /** Signed W-coordinate influence factor in [-1.0 (Deep Wither), +1.0 (Full Efflorescent Bloom)] */
  wCoordinateInfluenceFactor: number;
  /** Continuous fractal recursion depth (e.g. 1.35 to 4.85) */
  continuousRecursionDepth: number;
  /** Integer L-system rewriting iterations (1 to 5) */
  modulatedRecursionDepth: number;
  /** Fractional growth of the outermost frontier generation in [0.15, 1.0] for smooth sprouting/withering */
  frontierGenerationSproutScale: number;
  /** Dynamic branch-angle variance in degrees modulated by W-coordinate influence */
  branchAngleVarianceDeg: number;
  /** Dynamic branch-angle variance in radians */
  branchAngleVarianceRad: number;
  /** Canopy divergence angle multiplier (contracts/gnarls when withering, opens wide when blooming) */
  divergenceSpreadMultiplier: number;
  /** Downward desiccation droop & gnarl curl in radians when withering (W < 0) */
  witherDroopCurlRad: number;
  /** Active bloom vs. wither vitality state */
  vitalityPhase: LSystemVitalityPhase;
  vitalityLabel: string;
  regime: LSystemWEvolutionRegime;
  regimeLabel: string;
  effectiveW: number;
  quantizedBand: number;
}

export interface LSystemInstancedOrganRecord {
  instanceIndex: number;
  isBloomMesh: boolean;
  basePos: THREE.Vector3;
  baseQuat: THREE.Quaternion;
  baseScale: number;
  kind: LSystemArticulatedOrganNode['kind'];
  generation: number;
  hashSeed: number;
}

export interface LSystemArtformRigEntry {
  id: string;
  artform: WorldspaceProceduralArtform;
  group: THREE.Group;
  vascularExoskeletonMesh: THREE.Mesh;
  tensionWebLines: THREE.LineSegments;
  organNodesGroup: THREE.Group;
  calyxInstancedMesh?: THREE.InstancedMesh;
  bloomInstancedMesh?: THREE.InstancedMesh;
  instancedOrganRecords: LSystemInstancedOrganRecord[];
  organMeshes: {
    mesh: THREE.Object3D;
    basePos: THREE.Vector3;
    baseQuat: THREE.Quaternion;
    baseScale: number;
    kind: LSystemArticulatedOrganNode['kind'];
    generation: number;
    hashSeed: number;
  }[];
  exoskeletonMat: THREE.MeshPhysicalMaterial;
  bloomMat: THREE.MeshPhysicalMaterial;
  calyxMat: THREE.MeshStandardMaterial;
  webLineMat: THREE.LineBasicMaterial;
  lastQuantizedWBand: number;
  activeRegime: LSystemWEvolutionRegime;
  activeVitalityPhase: LSystemVitalityPhase;
  lastWInfluenceFactor: number;
  lastModulatedRecursionDepth: number;
  lastBranchAngleVarianceDeg: number;
  branchCount: number;
}

const _instancedOrganDummy = new THREE.Object3D();
const _scratchColorPrimary = new THREE.Color();
const _scratchColorAccent = new THREE.Color();
const _scratchColorEvolved = new THREE.Color();
const _scratchWitherCol = new THREE.Color('#78350f');
const _scratchKataBloomCol = new THREE.Color('#fbbf24');

/**
 * Deterministic non-repeating hash in [0, 1) combining two parent timeline seeds,
 * node index, generation depth, and golden-ratio irrational phase.
 */
function deterministicQuasiRandom(
  seedA: number,
  seedB: number,
  index: number,
  salt: number = 0
): number {
  const combined =
    Math.imul(seedA ^ (seedB << 5), 0x45d9f3b) +
    Math.imul(index + 1, 0x27d4eb2d) +
    Math.imul(salt + 7, 0x165667b1);
  const hashed =
    Math.sin(combined * 0.000173 + index * GOLDEN_RATIO) * 43758.5453;
  return hashed - Math.floor(hashed);
}

/**
 * Evaluates the W-Coordinate Influence Factor (`wCoordinateInfluenceFactor`) for a
 * `WorldspaceProceduralArtform` at the current 4D `wCoord`.
 *
 * This factor dynamically modulates:
 * 1. Fractal recursion depth (`modulatedRecursionDepth` & `frontierGenerationSproutScale`)
 * 2. Branch-angle variance (`branchAngleVarianceDeg`, `divergenceSpreadMultiplier`, `witherDroopCurlRad`)
 * causing the 3D L-system structure to visibly 'bloom' (sprout high-order fractal canopies and wide
 * golden-angle blossoms) or 'wither' (retract outer generations, contort with high angular gnarl variance,
 * and droop inward) based on its dimensional position along W.
 */
export function evaluateWCoordinateInfluenceFactor(
  wCoord: number,
  artform?: Partial<WorldspaceProceduralArtform>
): WCoordinateInfluenceEvaluation {
  const artformWPhase = artform?.wPhase ?? 0;
  const grammar = artform?.lSystemGrammar;
  const intrinsicSensitivity =
    grammar?.wCoordinateInfluenceFactor ?? grammar?.wRegimeSensitivity ?? 0.92;
  const baseIterations = grammar?.baseIterations ?? 3;
  const baseAngleVarDeg = grammar?.branchAngleVarianceDeg ?? 18.5;

  // Compute dimensional position coupling: combines global W-axis elevation with phase resonance
  // relative to the artform's native dimensional anchor (`artformWPhase`).
  const phaseDelta = wCoord - artformWPhase;
  const phaseResonance = Math.exp(-(phaseDelta * phaseDelta) / 0.58); // Peaks at 1.0 when wCoord aligns with artform.wPhase
  const rawSignedInfluence =
    (wCoord * 0.78 + artformWPhase * 0.28 + (phaseResonance - 0.45) * 0.38) *
    intrinsicSensitivity;

  const wCoordinateInfluenceFactor = Number(
    THREE.MathUtils.clamp(rawSignedInfluence, -1.0, 1.0).toFixed(3)
  );

  // 1. Dynamic Fractal Recursion Depth Modulation:
  // Scrubbing W from -1.0 (Wither) to +1.0 (Bloom) sweeps continuous recursion depth from ~1.35 to ~4.65
  const continuousRecursionDepth = THREE.MathUtils.clamp(
    baseIterations + wCoordinateInfluenceFactor * 1.45,
    1.3,
    4.75
  );
  const modulatedRecursionDepth = Math.max(
    1,
    Math.min(5, Math.ceil(continuousRecursionDepth))
  );
  // Fractional sprout scale controls the physical extension of the outermost fractal generation
  const rawFrac =
    continuousRecursionDepth - Math.floor(continuousRecursionDepth);
  const frontierGenerationSproutScale =
    rawFrac < 0.001
      ? 1.0
      : THREE.MathUtils.lerp(0.22, 1.0, rawFrac);

  // 2. Dynamic Branch-Angle Variance & Bloom/Wither Tropism Modulation:
  // - When blooming (wCoordinateInfluenceFactor > 0): wide, harmonious phyllotactic canopy spread
  // - When withering (wCoordinateInfluenceFactor < 0): high gnarled angular variance + inward/downward droop
  const witherIntensity = Math.max(0, -wCoordinateInfluenceFactor);
  const bloomIntensity = Math.max(0, wCoordinateInfluenceFactor);

  const branchAngleVarianceDeg = Number(
    (
      baseAngleVarDeg *
      (1.0 + witherIntensity * 1.15 + bloomIntensity * 0.45)
    ).toFixed(1)
  );
  const branchAngleVarianceRad = THREE.MathUtils.degToRad(
    branchAngleVarianceDeg
  );

  const divergenceSpreadMultiplier = Number(
    (1.0 + bloomIntensity * 0.38 - witherIntensity * 0.28).toFixed(3)
  );
  const witherDroopCurlRad = Number((witherIntensity * 0.64).toFixed(3));

  // 3. Resolve Vitality Phase (Bloom vs. Wither) and Structural Regime
  let vitalityPhase: LSystemVitalityPhase = 'homeostatic-arbor';
  let vitalityLabel = 'Homeostatic Equilibrium Arbor';
  if (wCoordinateInfluenceFactor <= -0.2) {
    vitalityPhase = 'dimensional-wither';
    vitalityLabel = `Dimensional Wither (Depth ${modulatedRecursionDepth} · Gnarl ±${branchAngleVarianceDeg}°)`;
  } else if (wCoordinateInfluenceFactor >= 0.2) {
    vitalityPhase = 'efflorescent-bloom';
    vitalityLabel = `Efflorescent Bloom (Depth ${modulatedRecursionDepth} · Spread ±${branchAngleVarianceDeg}°)`;
  } else {
    vitalityLabel = `Homeostatic Arbor (Depth ${modulatedRecursionDepth} · Var ±${branchAngleVarianceDeg}°)`;
  }

  const effectiveW = THREE.MathUtils.clamp(
    wCoord + artformWPhase * 0.32,
    -1.25,
    1.25
  );
  // Fine quantization band (0.09 W-units) so scrubbing W smoothly triggers fractal sprouting/withering
  const quantizedBand = Math.round(wCoordinateInfluenceFactor / 0.09);

  let regime: LSystemWEvolutionRegime = 'continuum-cantilever-arbor';
  let regimeLabel = 'Present-Continuum Cantilevered Tensegrity Arbor';
  if (wCoordinateInfluenceFactor < -0.22) {
    regime = 'ana-rhizome-buttress';
    regimeLabel = 'Ana-Substratum Withering Rhizome & Gnarled Buttress';
  } else if (wCoordinateInfluenceFactor > 0.22) {
    regime = 'kata-hyper-efflorescence';
    regimeLabel = 'Kata-Future Blooming Spire & Calabi-Yau Efflorescence';
  }

  return {
    wCoordinateInfluenceFactor,
    continuousRecursionDepth,
    modulatedRecursionDepth,
    frontierGenerationSproutScale,
    branchAngleVarianceDeg,
    branchAngleVarianceRad,
    divergenceSpreadMultiplier,
    witherDroopCurlRad,
    vitalityPhase,
    vitalityLabel,
    regime,
    regimeLabel,
    effectiveW,
    quantizedBand,
  };
}

/**
 * Resolves the active W-coordinate aesthetic evolution regime and influence factor.
 */
export function resolveLSystemWEvolutionRegime(
  wCoord: number,
  artformWPhase: number = 0
): {
  regime: LSystemWEvolutionRegime;
  label: string;
  effectiveW: number;
  quantizedBand: number;
  wCoordinateInfluenceFactor: number;
  modulatedRecursionDepth: number;
  branchAngleVarianceDeg: number;
  vitalityLabel: string;
} {
  const evalResult = evaluateWCoordinateInfluenceFactor(wCoord, {
    wPhase: artformWPhase,
  });
  return {
    regime: evalResult.regime,
    label: evalResult.regimeLabel,
    effectiveW: evalResult.effectiveW,
    quantizedBand: evalResult.quantizedBand,
    wCoordinateInfluenceFactor: evalResult.wCoordinateInfluenceFactor,
    modulatedRecursionDepth: evalResult.modulatedRecursionDepth,
    branchAngleVarianceDeg: evalResult.branchAngleVarianceDeg,
    vitalityLabel: evalResult.vitalityLabel,
  };
}

/**
 * Synthesizes the formal Parametric Context-Sensitive L-System Grammar specification
 * for a WorldspaceProceduralArtform based on its archetype and parent continuum seeds,
 * including `wCoordinateInfluenceFactor` and `branchAngleVarianceDeg`.
 */
export function synthesizeLSystemGrammarSpec(
  archetype: WorldspaceArtformArchetype,
  parentSeedA: number,
  parentSeedB: number,
  biocomplexityScore: number = 68
): LSystemArtformGrammarSpec {
  const q1 = deterministicQuasiRandom(parentSeedA, parentSeedB, 1, 11);
  const q2 = deterministicQuasiRandom(parentSeedA, parentSeedB, 2, 23);

  const baseIterations = biocomplexityScore >= 78 ? 3 : 3;
  const goldenTorsionRatio = Number(
    (GOLDEN_RATIO + (q1 - 0.5) * 0.18).toFixed(3)
  );
  const wRegimeSensitivity = Number((0.82 + q2 * 0.34).toFixed(2));
  const wCoordinateInfluenceFactor = Number((0.85 + q1 * 0.3).toFixed(2));
  const branchAngleVarianceDeg = Number((16.0 + q2 * 12.0).toFixed(1));

  switch (archetype) {
    case 'chiral-chrono-helix':
      return {
        variantName: 'Chiral Phyllotactic Helix-Arbor L-System (4D-Parametric)',
        axiom: 'F(1.1,0.22) J A(0) [/+(137.5) X(0)] [\\-(137.5) Y(0)]',
        primaryProductionRule:
          'A(g) : g < D(η_W) → /(φ·η_W) ^(18°·η_W) F J [+&(28°+σ_θ(η_W)) F G B] [-^(24°-σ_θ(η_W)) F A(g+1)]',
        secondaryProductionRule:
          'X(g) | Y(g) → \\(δ_S) F [+(ψ±σ_θ(η_W)) &(32°) F B] [-(ψ) ^(19°·η_W) X(g+1)]',
        baseIterations,
        divergenceAngleDeg: Number((137.508 + (q1 - 0.5) * 14).toFixed(1)),
        goldenTorsionRatio,
        wRegimeSensitivity,
        wCoordinateInfluenceFactor,
        branchAngleVarianceDeg,
      };

    case 'karmic-tensegrity-loom':
      return {
        variantName: 'Cantilevered Tensegrity Space-Loom L-System (Context-Sensitive)',
        axiom: 'J [+(60°) &(26°) F A(0)] [-(120°) &(26°) F X(0)] [+(180°) ^(22°) F Y(0)]',
        primaryProductionRule:
          'A(g) : g < D(η_W) → F J [++&(42°+σ_θ(η_W)) G F B] [--^(36°·η_W) F X(g+1)] /(φ) A(g+1)',
        secondaryProductionRule:
          'X(g) → ^(20°·η_W) G J [&(34°+σ_θ(η_W)) F B] [+(137.5°) F A(g+1)]',
        baseIterations,
        divergenceAngleDeg: Number((112.5 + q1 * 28).toFixed(1)),
        goldenTorsionRatio,
        wRegimeSensitivity,
        wCoordinateInfluenceFactor,
        branchAngleVarianceDeg,
      };

    case 'biocomplex-gyroid-stele':
      return {
        variantName: 'Schoen-TPMS Trabecular Coral & Gyroid Foliation L-System',
        axiom: 'F(0.95,0.26) J [+&(34°) A(0)] [-&(34°) X(0)] [/(137.5°) ^(16°) Y(0)]',
        primaryProductionRule:
          'A(g) : g < D(η_W) → &(14°·η_W) F J [/(φ) +&(38°+σ_θ(η_W)) F J B] [\\(φ) -^(30°·η_W) F A(g+1)]',
        secondaryProductionRule:
          'Y(g) → F [+(ψ±σ_θ(η_W)) G B] [-(ψ) &(25°-15°·η_W) J A(g+1)]',
        baseIterations,
        divergenceAngleDeg: Number((128.0 + q2 * 22).toFixed(1)),
        goldenTorsionRatio,
        wRegimeSensitivity,
        wCoordinateInfluenceFactor,
        branchAngleVarianceDeg,
      };

    case 'omniversal-substrate-obelisk':
    default:
      return {
        variantName: 'Non-Euclidean Hyperbolic Dendrite & Substrate Vault L-System',
        axiom: 'F(1.2,0.25) J [+(90°) &(24°) X(0)] [-(90°) &(24°) Y(0)] ^(12°·η_W) A(0)',
        primaryProductionRule:
          'A(g) : g < D(η_W) → /(137.5°) F J [+&(30°+σ_θ(η_W)) F G B] [-&(30°+σ_θ(η_W)) F G B] ^(15°·η_W) A(g+1)',
        secondaryProductionRule:
          'X(g) | Y(g) → F J [+(φ·60°±σ_θ(η_W)) ^(28°·η_W) F B] [&(35°) F A(g+1)]',
        baseIterations,
        divergenceAngleDeg: Number((144.0 + (q1 - 0.5) * 18).toFixed(1)),
        goldenTorsionRatio,
        wRegimeSensitivity,
        wCoordinateInfluenceFactor,
        branchAngleVarianceDeg,
      };
  }
}

/**
 * Expands the L-System axiom through non-repeating, context-sensitive production rules
 * dynamically modulated by `wCoordinateInfluenceFactor`:
 * - Modulates fractal recursion depth (`modulatedRecursionDepth` + `frontierGenerationSproutScale`)
 * - Modulates branch-angle variance (`branchAngleVarianceRad`, `divergenceSpreadMultiplier`, `witherDroopCurlRad`)
 * causing the structure to bloom or wither as the user scrubs the W-axis.
 */
export function deriveNonRepeatingLSystemTokenStream(
  artform: WorldspaceProceduralArtform,
  wCoord: number
): {
  tokens: LSystemToken[];
  wEval: WCoordinateInfluenceEvaluation;
  regime: LSystemWEvolutionRegime;
  regimeLabel: string;
  effectiveW: number;
  quantizedBand: number;
} {
  const grammar =
    artform.lSystemGrammar ??
    synthesizeLSystemGrammarSpec(
      artform.archetype,
      artform.parentSeedA,
      artform.parentSeedB,
      artform.biocomplexityScore
    );

  const wEval = evaluateWCoordinateInfluenceFactor(wCoord, artform);
  const {
    wCoordinateInfluenceFactor: wInfluence,
    modulatedRecursionDepth: iterations,
    frontierGenerationSproutScale,
    branchAngleVarianceRad,
    divergenceSpreadMultiplier,
    witherDroopCurlRad,
    regime,
    regimeLabel,
    effectiveW,
    quantizedBand,
  } = wEval;

  const seedA = artform.parentSeedA;
  const seedB = artform.parentSeedB;
  const baseDivRad =
    THREE.MathUtils.degToRad(grammar.divergenceAngleDeg) *
    divergenceSpreadMultiplier;

  // W-Influence morphological scaling:
  // - In Wither (wInfluence < 0): shortened, gnarled limbs, drooping pitch, shriveled frontier segments
  // - In Bloom (wInfluence > 0): elongated, ascending limbs, multi-tiered fractal canopy expansion
  const lengthWFactor = 1.0 + wInfluence * 0.28;
  const radiusWFactor = 1.0 - wInfluence * 0.14;
  const pitchBiasRad = -wInfluence * 0.38 + witherDroopCurlRad * 0.55;

  let stream: LSystemToken[] = [];
  const pushTok = (
    symbol: LSystemToken['symbol'],
    length: number,
    radius: number,
    angleRad: number,
    generation: number,
    salt: number
  ) => {
    const q = deterministicQuasiRandom(
      seedA,
      seedB,
      stream.length + salt,
      generation
    );
    stream.push({
      symbol,
      length,
      radius,
      angleRad,
      generation,
      hashSeed: q,
      chirality: q > 0.5 ? 1 : -1,
    });
  };

  // Seed Trunk + Basal Buttress / Cantilever Root Collar
  const trunkLen = (1.02 + (seedA % 17) * 0.015) * lengthWFactor;
  const trunkRad = (0.21 + (seedB % 13) * 0.004) * radiusWFactor;

  pushTok('F', trunkLen * 0.68, trunkRad, 0, 0, 1);
  pushTok('J', 1.0, trunkRad * 1.08, 0, 0, 2);

  // Basal lateral branches modulated by branchAngleVarianceRad
  const basalBranches = wInfluence >= 0.25 ? 4 : 3;
  for (let b = 0; b < basalBranches; b++) {
    const qAngle = deterministicQuasiRandom(seedA, seedB, b, 101);
    const angleVarianceOffset = (qAngle - 0.5) * 2.0 * branchAngleVarianceRad;
    const yaw =
      (b / basalBranches) * Math.PI * 2 +
      angleVarianceOffset +
      wInfluence * 0.42;
    const pitch =
      0.44 +
      qAngle * 0.22 +
      pitchBiasRad * 0.65 +
      Math.abs(angleVarianceOffset) * 0.35;

    pushTok('[', 0, trunkRad * 0.78, 0, 0, 10 + b);
    pushTok('/', 0, trunkRad * 0.78, yaw, 0, 20 + b);
    pushTok('&', 0, trunkRad * 0.78, pitch, 0, 30 + b);
    pushTok(
      'F',
      trunkLen * (0.62 + qAngle * 0.2),
      trunkRad * 0.74,
      0,
      1,
      40 + b
    );
    pushTok(
      b % 2 === 0 ? 'X' : 'Y',
      trunkLen * 0.58,
      trunkRad * 0.62,
      0,
      1,
      50 + b
    );
    pushTok(']', 0, trunkRad * 0.78, 0, 0, 60 + b);
  }

  // Central ascending apical meristem
  pushTok('/', 0, trunkRad * 0.85, GOLDEN_ANGLE_RAD + wInfluence * 0.55, 0, 70);
  pushTok('^', 0, trunkRad * 0.85, 0.16 - pitchBiasRad * 0.4, 0, 71);
  pushTok('F', trunkLen * 0.74, trunkRad * 0.82, 0, 0, 72);
  pushTok('J', 0.95, trunkRad * 0.85, 0, 0, 73);
  pushTok('A', trunkLen * 0.72, trunkRad * 0.75, 0, 1, 74);

  // Iterative Context-Sensitive & Non-Repeating Rewriting with W-Modulated Recursion Depth
  for (let iter = 0; iter < iterations; iter++) {
    const nextStream: LSystemToken[] = [];
    const isFrontierIteration = iter === iterations - 1;
    // Scale the outermost frontier generation smoothly by `frontierGenerationSproutScale`
    // so scrubbing W causes sub-branches to visibly sprout or wither!
    const iterSproutScale = isFrontierIteration
      ? frontierGenerationSproutScale
      : 1.0;

    for (let idx = 0; idx < stream.length; idx++) {
      const tok = stream[idx];
      const prevSymbol = idx > 0 ? stream[idx - 1].symbol : null;
      const nextSymbol =
        idx + 1 < stream.length ? stream[idx + 1].symbol : null;

      const qA = deterministicQuasiRandom(
        seedA,
        seedB,
        idx + iter * 131,
        iter + 1
      );
      const qB = deterministicQuasiRandom(
        seedB,
        seedA,
        idx * 7 + iter * 53,
        iter + 19
      );

      // Dynamic Branch-Angle Variance driven by wCoordinateInfluenceFactor:
      const signedAngleVarA = (qA - 0.5) * 2.0 * branchAngleVarianceRad;
      const signedAngleVarB = (qB - 0.5) * 2.0 * branchAngleVarianceRad;

      const contextAngleShift =
        (prevSymbol === 'J' || nextSymbol === 'B'
          ? (qA - 0.5) * SILVER_RATIO * 0.35
          : (qB - 0.5) * GOLDEN_RATIO * 0.25) + signedAngleVarA * 0.65;

      if (tok.symbol === 'A') {
        const childGen = tok.generation + 1;
        const childLen =
          tok.length *
          (0.75 + qA * 0.15) *
          (1.0 + wInfluence * 0.09) *
          iterSproutScale;
        const childRad = Math.max(
          0.02,
          tok.radius * (0.72 + qB * 0.08) * (0.65 + 0.35 * iterSproutScale)
        );

        // 1. Primary helical torsion + forward calligraphic segment
        const rollAngle =
          baseDivRad * grammar.goldenTorsionRatio * 0.55 +
          contextAngleShift +
          wInfluence * 0.48;
        const pitchAngle =
          0.26 + signedAngleVarB * 0.75 + pitchBiasRad * 0.7;

        nextStream.push({
          symbol: tok.chirality > 0 ? '/' : '\\',
          length: 0,
          radius: childRad,
          angleRad: rollAngle,
          generation: childGen,
          hashSeed: qA,
          chirality: tok.chirality,
        });
        nextStream.push({
          symbol: '&',
          length: 0,
          radius: childRad,
          angleRad: pitchAngle * 0.5,
          generation: childGen,
          hashSeed: qB,
          chirality: tok.chirality,
        });
        nextStream.push({
          symbol: 'F',
          length: childLen,
          radius: childRad,
          angleRad: 0,
          generation: childGen,
          hashSeed: qA,
          chirality: tok.chirality,
        });
        nextStream.push({
          symbol: 'J',
          length: 0,
          radius: childRad * 1.12,
          angleRad: 0,
          generation: childGen,
          hashSeed: qB,
          chirality: tok.chirality,
        });

        // 2. First asymmetric lateral bifurcation branch (modulated by branchAngleVarianceRad)
        const branchYaw1 =
          baseDivRad * (0.65 + qA * 0.4) + signedAngleVarA;
        const branchPitch1 =
          0.46 +
          qB * 0.28 +
          witherDroopCurlRad * 0.85 -
          wInfluence * 0.2 +
          Math.abs(signedAngleVarB) * 0.4;

        nextStream.push({
          symbol: '[',
          length: 0,
          radius: childRad * 0.82,
          angleRad: 0,
          generation: childGen,
          hashSeed: qA,
          chirality: 1,
        });
        nextStream.push({
          symbol: '+',
          length: 0,
          radius: childRad * 0.82,
          angleRad: branchYaw1,
          generation: childGen,
          hashSeed: qB,
          chirality: 1,
        });
        nextStream.push({
          symbol: '&',
          length: 0,
          radius: childRad * 0.82,
          angleRad: branchPitch1,
          generation: childGen,
          hashSeed: qA,
          chirality: 1,
        });
        nextStream.push({
          symbol: artform.archetype === 'karmic-tensegrity-loom' ? 'G' : 'F',
          length: childLen * (0.74 + qB * 0.18),
          radius: childRad * 0.76,
          angleRad: 0,
          generation: childGen,
          hashSeed: qB,
          chirality: 1,
        });
        if (isFrontierIteration || (wInfluence < -0.15 && qA > 0.35)) {
          nextStream.push({
            symbol: 'B',
            length: 0,
            radius: childRad * (1.35 + wInfluence * 0.45),
            angleRad: 0,
            generation: childGen,
            hashSeed: qA,
            chirality: 1,
          });
        } else {
          nextStream.push({
            symbol: 'X',
            length: childLen * 0.72,
            radius: childRad * 0.72,
            angleRad: 0,
            generation: childGen,
            hashSeed: qA,
            chirality: -1,
          });
        }
        nextStream.push({
          symbol: ']',
          length: 0,
          radius: childRad * 0.82,
          angleRad: 0,
          generation: childGen,
          hashSeed: qA,
          chirality: 1,
        });

        // 3. Second counter-chiral cantilever branch (suppressed in deep wither at outer iterations, expanded in bloom)
        if (wInfluence > -0.65 || iter === 0) {
          const branchYaw2 =
            -baseDivRad * (0.78 + qB * 0.38) +
            GOLDEN_ANGLE_RAD * 0.35 +
            signedAngleVarB;
          const branchPitch2 =
            0.36 +
            qA * 0.26 +
            witherDroopCurlRad * 0.7 -
            wInfluence * 0.24;

          nextStream.push({
            symbol: '[',
            length: 0,
            radius: childRad * 0.85,
            angleRad: 0,
            generation: childGen,
            hashSeed: qB,
            chirality: -1,
          });
          nextStream.push({
            symbol: '-',
            length: 0,
            radius: childRad * 0.85,
            angleRad: Math.abs(branchYaw2),
            generation: childGen,
            hashSeed: qA,
            chirality: -1,
          });
          nextStream.push({
            symbol: wInfluence < -0.25 ? '&' : '^',
            length: 0,
            radius: childRad * 0.85,
            angleRad: branchPitch2,
            generation: childGen,
            hashSeed: qB,
            chirality: -1,
          });
          nextStream.push({
            symbol: 'F',
            length: childLen * (0.82 + qA * 0.16),
            radius: childRad * 0.8,
            angleRad: 0,
            generation: childGen,
            hashSeed: qA,
            chirality: -1,
          });
          nextStream.push({
            symbol: isFrontierIteration ? 'B' : 'A',
            length: childLen * 0.78,
            radius: childRad * 0.76,
            angleRad: 0,
            generation: childGen,
            hashSeed: qB,
            chirality: -tok.chirality,
          });
          nextStream.push({
            symbol: ']',
            length: 0,
            radius: childRad * 0.85,
            angleRad: 0,
            generation: childGen,
            hashSeed: qB,
            chirality: -1,
          });
        }

        // 4. Apical continuation spire (blooms vigorously when wInfluence > -0.2, withers into a curled bud when wInfluence <= -0.35)
        if (wInfluence > -0.35 || iter === 0) {
          nextStream.push({
            symbol: '/',
            length: 0,
            radius: childRad * 0.78,
            angleRad: GOLDEN_ANGLE_RAD + contextAngleShift,
            generation: childGen,
            hashSeed: qA,
            chirality: tok.chirality,
          });
          nextStream.push({
            symbol: wInfluence < -0.15 ? '&' : '^',
            length: 0,
            radius: childRad * 0.78,
            angleRad: 0.18 + Math.abs(wInfluence) * 0.2 + Math.abs(signedAngleVarA) * 0.35,
            generation: childGen,
            hashSeed: qB,
            chirality: tok.chirality,
          });
          nextStream.push({
            symbol: 'F',
            length: childLen * (0.78 + wInfluence * 0.18),
            radius: childRad * 0.75,
            angleRad: 0,
            generation: childGen,
            hashSeed: qB,
            chirality: tok.chirality,
          });
          nextStream.push({
            symbol: isFrontierIteration ? 'B' : 'A',
            length: childLen * 0.74,
            radius: childRad * 0.72,
            angleRad: 0,
            generation: childGen,
            hashSeed: qA,
            chirality: tok.chirality,
          });
        } else {
          // Terminal withered thorn / bud
          nextStream.push({
            symbol: 'B',
            length: 0,
            radius: childRad * 0.9,
            angleRad: 0,
            generation: childGen,
            hashSeed: qA,
            chirality: tok.chirality,
          });
        }
      } else if (tok.symbol === 'X' || tok.symbol === 'Y') {
        const childGen = tok.generation + 1;
        const childLen =
          tok.length * (0.72 + qB * 0.16) * iterSproutScale;
        const childRad = Math.max(0.02, tok.radius * 0.74);

        const latYaw =
          (tok.symbol === 'X' ? 1 : -1) *
          (0.55 + qA * 0.45 + signedAngleVarA * 0.85);
        const latPitch =
          0.32 +
          witherDroopCurlRad * 0.9 -
          wInfluence * 0.22 +
          signedAngleVarB * 0.5;

        nextStream.push({
          symbol: tok.symbol === 'X' ? '+' : '-',
          length: 0,
          radius: childRad,
          angleRad: Math.abs(latYaw),
          generation: childGen,
          hashSeed: qA,
          chirality: tok.chirality,
        });
        nextStream.push({
          symbol: '&',
          length: 0,
          radius: childRad,
          angleRad: latPitch,
          generation: childGen,
          hashSeed: qB,
          chirality: tok.chirality,
        });
        nextStream.push({
          symbol: qA > 0.62 ? 'G' : 'F',
          length: childLen,
          radius: childRad,
          angleRad: 0,
          generation: childGen,
          hashSeed: qA,
          chirality: tok.chirality,
        });

        // Secondary fork on lateral limbs (sprouts in bloom/equilibrium, prunes in deep wither)
        if (wInfluence > -0.45) {
          nextStream.push({
            symbol: '[',
            length: 0,
            radius: childRad * 0.8,
            angleRad: 0,
            generation: childGen,
            hashSeed: qB,
            chirality: -tok.chirality,
          });
          nextStream.push({
            symbol: '/',
            length: 0,
            radius: childRad * 0.8,
            angleRad: GOLDEN_ANGLE_RAD * 0.7 + signedAngleVarA,
            generation: childGen,
            hashSeed: qA,
            chirality: -tok.chirality,
          });
          nextStream.push({
            symbol: wInfluence < 0 ? '&' : '^',
            length: 0,
            radius: childRad * 0.8,
            angleRad: 0.38 + Math.abs(wInfluence) * 0.24 + Math.abs(signedAngleVarB) * 0.4,
            generation: childGen,
            hashSeed: qB,
            chirality: -tok.chirality,
          });
          nextStream.push({
            symbol: 'F',
            length: childLen * 0.68,
            radius: childRad * 0.72,
            angleRad: 0,
            generation: childGen,
            hashSeed: qB,
            chirality: -tok.chirality,
          });
          nextStream.push({
            symbol: 'B',
            length: 0,
            radius: childRad * (1.25 + wInfluence * 0.35),
            angleRad: 0,
            generation: childGen,
            hashSeed: qA,
            chirality: -tok.chirality,
          });
          nextStream.push({
            symbol: ']',
            length: 0,
            radius: childRad * 0.8,
            angleRad: 0,
            generation: childGen,
            hashSeed: qB,
            chirality: -tok.chirality,
          });
        }

        if (!isFrontierIteration && qB > 0.32 - wInfluence * 0.2) {
          nextStream.push({
            symbol: 'J',
            length: 0,
            radius: childRad * 1.05,
            angleRad: 0,
            generation: childGen,
            hashSeed: qA,
            chirality: tok.chirality,
          });
          nextStream.push({
            symbol: tok.symbol === 'X' ? 'Y' : 'A',
            length: childLen * 0.75,
            radius: childRad * 0.74,
            angleRad: 0,
            generation: childGen,
            hashSeed: qB,
            chirality: tok.chirality,
          });
        } else {
          nextStream.push({
            symbol: 'B',
            length: 0,
            radius: childRad * (1.3 + wInfluence * 0.4),
            angleRad: 0,
            generation: childGen,
            hashSeed: qB,
            chirality: tok.chirality,
          });
        }
      } else {
        nextStream.push(tok);
      }
    }

    stream = nextStream;
  }

  return {
    tokens: stream,
    wEval,
    regime,
    regimeLabel,
    effectiveW,
    quantizedBand,
  };
}

interface TurtleState3D {
  pos: THREE.Vector3;
  heading: THREE.Vector3; // H (forward growth axis)
  left: THREE.Vector3; // L (lateral axis)
  up: THREE.Vector3; // U (normal axis)
  radius: number;
  generation: number;
}

/**
 * Interprets the derived L-System token stream using a 3D Quaternion / Orthonormal Frame Turtle
 * with continuous W-coordinate influence bending (blooming heliotropism vs. withering geotropic curl).
 */
export function interpretLSystemTurtle3D(
  tokens: LSystemToken[],
  artform: WorldspaceProceduralArtform,
  wEval: WCoordinateInfluenceEvaluation
): {
  segments: LSystemBranchSegment3D[];
  organs: LSystemArticulatedOrganNode[];
  tensionChords: [THREE.Vector3, THREE.Vector3][];
} {
  const segments: LSystemBranchSegment3D[] = [];
  const organs: LSystemArticulatedOrganNode[] = [];
  const tensionChords: [THREE.Vector3, THREE.Vector3][] = [];

  const stack: TurtleState3D[] = [];
  let state: TurtleState3D = {
    pos: new THREE.Vector3(0, 0.05, 0),
    heading: new THREE.Vector3(0, 1, 0),
    left: new THREE.Vector3(-1, 0, 0),
    up: new THREE.Vector3(0, 0, 1),
    radius: 0.22,
    generation: 0,
  };

  let maxGen = 1;
  for (const t of tokens) {
    if (t.generation > maxGen) maxGen = t.generation;
  }

  const wInfluence = wEval.wCoordinateInfluenceFactor;
  // Tropism target modulated by wCoordinateInfluenceFactor:
  // - When blooming (wInfluence > 0): strong upward & outward heliotropic ascension
  // - When withering (wInfluence < 0): downward & inward-curling desiccation droop
  const tropismTarget = new THREE.Vector3(
    Math.sin(artform.wPhase * Math.PI) * (0.22 + wEval.witherDroopCurlRad * 0.4),
    wInfluence >= 0 ? 1.0 : -0.65 - wEval.witherDroopCurlRad * 0.5,
    Math.cos(artform.wPhase * Math.PI) * (0.22 + wEval.witherDroopCurlRad * 0.4)
  ).normalize();
  const tropismStrength = 0.14 + Math.abs(wInfluence) * 0.24;

  const rotQuat = new THREE.Quaternion();
  const cousinNodesByGen = new Map<number, THREE.Vector3[]>();

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];

    switch (tok.symbol) {
      case '[': {
        stack.push({
          pos: state.pos.clone(),
          heading: state.heading.clone(),
          left: state.left.clone(),
          up: state.up.clone(),
          radius: state.radius,
          generation: state.generation,
        });
        break;
      }
      case ']': {
        const popped = stack.pop();
        if (popped) state = popped;
        break;
      }
      case '+':
      case '-': {
        const sign = tok.symbol === '+' ? 1 : -1;
        rotQuat.setFromAxisAngle(state.up, sign * tok.angleRad);
        state.heading.applyQuaternion(rotQuat).normalize();
        state.left.applyQuaternion(rotQuat).normalize();
        break;
      }
      case '&':
      case '^': {
        const sign = tok.symbol === '&' ? 1 : -1;
        rotQuat.setFromAxisAngle(state.left, sign * tok.angleRad);
        state.heading.applyQuaternion(rotQuat).normalize();
        state.up.applyQuaternion(rotQuat).normalize();
        break;
      }
      case '/':
      case '\\': {
        const sign = tok.symbol === '/' ? 1 : -1;
        rotQuat.setFromAxisAngle(state.heading, sign * tok.angleRad);
        state.left.applyQuaternion(rotQuat).normalize();
        state.up.applyQuaternion(rotQuat).normalize();
        break;
      }
      case 'F':
      case 'G': {
        const startPos = state.pos.clone();
        const startRadius = state.radius;
        // When withering (wInfluence < 0), distal branches taper more sharply like gnarled thorns
        const taperFactor = wInfluence < 0 ? 0.76 : 0.85;
        const endRadius = Math.max(0.016, tok.radius * taperFactor);

        // Apply smooth Hermite / quadratic Bezier curvature via W-influence tropism + branchAngleVariance swirl
        const midHeading = state.heading.clone();
        const gnarlAmplitude =
          (tok.hashSeed - 0.5) * (0.35 + wEval.branchAngleVarianceRad * 0.75) +
          wInfluence * 0.24;
        const chiralSwirl = new THREE.Vector3()
          .crossVectors(state.heading, state.up)
          .multiplyScalar(gnarlAmplitude);

        const controlPos = startPos
          .clone()
          .addScaledVector(midHeading, tok.length * 0.52)
          .addScaledVector(chiralSwirl, tok.length * 0.32);

        // Bend heading toward tropismTarget (stronger at higher generations)
        state.heading
          .lerp(tropismTarget, tropismStrength * (0.38 + tok.generation * 0.16))
          .normalize();
        // Re-orthogonalize left & up
        state.left.crossVectors(state.up, state.heading).normalize();
        if (state.left.lengthSq() < 0.001) {
          state.left.set(1, 0, 0);
        }
        state.up.crossVectors(state.heading, state.left).normalize();

        const endPos = startPos
          .clone()
          .addScaledVector(
            controlPos.clone().sub(startPos).normalize(),
            tok.length * 0.5
          )
          .addScaledVector(state.heading, tok.length * 0.52);

        // Keep branches above bedrock floor with a graceful arch
        if (endPos.y < 0.08) {
          endPos.y = 0.08 + Math.abs(endPos.y) * 0.35;
        }
        if (controlPos.y < 0.06) {
          controlPos.y = 0.08;
        }

        segments.push({
          start: startPos,
          control: controlPos,
          end: endPos,
          upNormal: state.up.clone(),
          startRadius,
          endRadius,
          generation: tok.generation,
          maxGeneration: maxGen,
          twistRad:
            (tok.hashSeed - 0.5) * Math.PI +
            wInfluence * 1.35 +
            wEval.witherDroopCurlRad * 1.2,
          isCantileverStrut: tok.symbol === 'G',
          hashSeed: tok.hashSeed,
        });

        // Track cousin branch nodes at the same generation for Naum Gabo / Tensegrity cross-webbing
        const genList = cousinNodesByGen.get(tok.generation) ?? [];
        if (genList.length > 0) {
          const prevCousin = genList[genList.length - 1];
          const dist = prevCousin.distanceTo(endPos);
          if (dist > 0.35 && dist < 2.8) {
            tensionChords.push([prevCousin.clone(), endPos.clone()]);
          }
        }
        genList.push(endPos.clone());
        cousinNodesByGen.set(tok.generation, genList);

        state.pos.copy(endPos);
        state.radius = endRadius;
        state.generation = tok.generation;
        break;
      }
      case 'J': {
        const basisMat = new THREE.Matrix4().makeBasis(
          state.left,
          state.heading,
          state.up
        );
        const quat = new THREE.Quaternion().setFromRotationMatrix(basisMat);
        organs.push({
          kind: 'bifurcation-calyx',
          position: state.pos.clone(),
          quaternion: quat,
          scale: Math.max(0.11, tok.radius * (2.0 + wInfluence * 0.25)),
          generation: tok.generation,
          hashSeed: tok.hashSeed,
        });
        break;
      }
      case 'B': {
        const basisMat = new THREE.Matrix4().makeBasis(
          state.left,
          state.heading,
          state.up
        );
        const quat = new THREE.Quaternion().setFromRotationMatrix(basisMat);
        // Scale apical blooms by wCoordinateInfluenceFactor: large radiant blossoms in bloom, contracted buds in wither
        const bloomRadiusMultiplier = THREE.MathUtils.lerp(
          1.35,
          3.45,
          (wInfluence + 1.0) * 0.5
        );
        organs.push({
          kind: 'apical-bloom',
          position: state.pos.clone(),
          quaternion: quat,
          scale: Math.max(0.11, tok.radius * bloomRadiusMultiplier),
          generation: tok.generation,
          hashSeed: tok.hashSeed,
        });

        // When blooming (wInfluence > 0.18), nucleate detached levitating 4D phase satellites beyond the apical bloom!
        if (wInfluence > 0.18 && tok.hashSeed > 0.48) {
          const satPos = state.pos
            .clone()
            .addScaledVector(state.heading, 0.32 + wInfluence * 0.34);
          organs.push({
            kind: 'aerial-satellite',
            position: satPos,
            quaternion: quat.clone(),
            scale: Math.max(0.12, tok.radius * (1.5 + wInfluence * 0.65)),
            generation: tok.generation + 1,
            hashSeed: tok.hashSeed,
          });
          tensionChords.push([state.pos.clone(), satPos.clone()]);
        }
        break;
      }
      default:
        break;
    }
  }

  return { segments, organs, tensionChords };
}

/**
 * Builds a single unified, sculpted, fluted calligraphic & trabecular exoskeleton BufferGeometry
 * from all curved 3D L-System branch segments (zero primitive Cylinders/Boxes).
 */
function buildUnifiedLSystemExoskeletonGeometry(
  segments: LSystemBranchSegment3D[],
  primaryColor: THREE.Color,
  accentColor: THREE.Color,
  wInfluence: number
): THREE.BufferGeometry {
  const radialSegs = 8;
  const tubularSegs = 5;

  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  let vertexCursor = 0;
  const wNorm = THREE.MathUtils.clamp((wInfluence + 1) * 0.5, 0, 1);
  const witherAmount = Math.max(0, -wInfluence);
  const goldColor = new THREE.Color('#f59e0b');
  const witheredAshColor = new THREE.Color('#3f2e21');
  const deepCreviceColor = new THREE.Color('#090d16');

  for (let s = 0; s < segments.length; s++) {
    const seg = segments[s];
    const genRatio = seg.generation / Math.max(1, seg.maxGeneration);

    // Construct orthonormal Frenet-like frames along the quadratic Bezier curve
    for (let tStep = 0; tStep <= tubularSegs; tStep++) {
      const t = tStep / tubularSegs;
      const invT = 1 - t;

      // Quadratic Bezier point B(t)
      const px =
        invT * invT * seg.start.x +
        2 * invT * t * seg.control.x +
        t * t * seg.end.x;
      const py =
        invT * invT * seg.start.y +
        2 * invT * t * seg.control.y +
        t * t * seg.end.y;
      const pz =
        invT * invT * seg.start.z +
        2 * invT * t * seg.control.z +
        t * t * seg.end.z;

      // Tangent B'(t)
      const tx =
        2 * invT * (seg.control.x - seg.start.x) +
        2 * t * (seg.end.x - seg.control.x);
      const ty =
        2 * invT * (seg.control.y - seg.start.y) +
        2 * t * (seg.end.y - seg.control.y);
      const tz =
        2 * invT * (seg.control.z - seg.start.z) +
        2 * t * (seg.end.z - seg.control.z);
      const tangent = new THREE.Vector3(tx, ty, tz).normalize();

      const binormal = new THREE.Vector3()
        .crossVectors(tangent, seg.upNormal)
        .normalize();
      if (binormal.lengthSq() < 0.001) {
        binormal.set(1, 0, 0);
      }
      const normal = new THREE.Vector3()
        .crossVectors(binormal, tangent)
        .normalize();

      // Base tapered radius with joint collar flare at ends (t=0 and t=1)
      const collarFlare = 1.0 + Math.pow(Math.abs(t - 0.5) * 2, 3) * 0.18;
      const baseR =
        THREE.MathUtils.lerp(seg.startRadius, seg.endRadius, t) * collarFlare;

      const twistAngle = seg.twistRad * t;

      for (let rStep = 0; rStep <= radialSegs; rStep++) {
        const u = rStep / radialSegs;
        const theta = u * Math.PI * 2 + twistAngle;

        // Calligraphic oval cross-section + structural fluting ribs (sharper desiccated ridges when withering)
        const fluteDepth = 0.22 + witherAmount * 0.14;
        const fluteMod =
          1.0 +
          fluteDepth * Math.cos(theta * (seg.isCantileverStrut ? 3 : 4)) +
          0.08 * Math.sin(t * Math.PI * 3 + theta * 2);

        const rx = baseR * fluteMod * (seg.isCantileverStrut ? 0.72 : 1.18);
        const ry = baseR * fluteMod * (seg.isCantileverStrut ? 1.15 : 0.82);

        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        const offsetVec = new THREE.Vector3()
          .addScaledVector(binormal, cosT * rx)
          .addScaledVector(normal, sinT * ry);

        positions.push(px + offsetVec.x, py + offsetVec.y, pz + offsetVec.z);

        const vNorm = offsetVec.clone().normalize();
        normals.push(vNorm.x, vNorm.y, vNorm.z);

        // Topological crevice weathering + W-influence bloom/wither chromatic gradient in vertex colors
        const fluteCrevice = 0.5 + 0.5 * Math.cos(theta * 4);
        const vertColor = primaryColor
          .clone()
          .lerp(accentColor, genRatio * 0.75 + t * 0.25)
          .lerp(goldColor, wNorm * 0.4 * fluteCrevice)
          .lerp(witheredAshColor, witherAmount * 0.55 * genRatio)
          .lerp(deepCreviceColor, (1 - fluteCrevice) * 0.42);

        colors.push(vertColor.r, vertColor.g, vertColor.b);
      }
    }

    const ringVerts = radialSegs + 1;
    for (let tStep = 0; tStep < tubularSegs; tStep++) {
      for (let rStep = 0; rStep < radialSegs; rStep++) {
        const a = vertexCursor + tStep * ringVerts + rStep;
        const b = a + ringVerts;
        const c = a + 1;
        const d = b + 1;
        indices.push(a, b, c);
        indices.push(c, b, d);
      }
    }

    vertexCursor += (tubularSegs + 1) * ringVerts;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// Shared sculpted organ geometries cached for crisp performance
let cachedPseudosphereCalyxGeo: THREE.BufferGeometry | null = null;
let cachedGyroidCalyxGeo: THREE.BufferGeometry | null = null;
let cachedCalabiBloomGeo: THREE.BufferGeometry | null = null;
let cachedDiffRibbonBloomGeo: THREE.BufferGeometry | null = null;

function getSharedOrganGeometries() {
  if (!cachedPseudosphereCalyxGeo) {
    cachedPseudosphereCalyxGeo = createHyperbolicPseudosphereGeometry(
      0.16,
      0.34,
      10,
      8,
      1.6
    );
  }
  if (!cachedGyroidCalyxGeo) {
    cachedGyroidCalyxGeo = createTPMSGyroidShellGeometry(
      0.18,
      0.32,
      12,
      10,
      2.6,
      0.32
    );
  }
  if (!cachedCalabiBloomGeo) {
    cachedCalabiBloomGeo = createCalabiYauRosetteGeometry(0.24, 5);
  }
  if (!cachedDiffRibbonBloomGeo) {
    cachedDiffRibbonBloomGeo = createDifferentialGrowthRibbonGeometry(
      0.22,
      0.36,
      3,
      1.8,
      14,
      10
    );
  }
  return {
    pseudosphereCalyxGeo: cachedPseudosphereCalyxGeo,
    gyroidCalyxGeo: cachedGyroidCalyxGeo,
    calabiBloomGeo: cachedCalabiBloomGeo,
    diffRibbonBloomGeo: cachedDiffRibbonBloomGeo,
  };
}

/**
 * Re-synthesizes the 3D L-System Exoskeleton, Tension Webbing, and Articulated Calyx/Bloom Organs
 * inside an existing `LSystemArtformRigEntry` whenever the artform is spawned or crosses a W-coordinate
 * influence band.
 */
export function rebuildLSystemArtformTopologyForW(
  entry: LSystemArtformRigEntry,
  wCoord: number
): void {
  const {
    tokens,
    wEval,
    regime,
    quantizedBand,
  } = deriveNonRepeatingLSystemTokenStream(entry.artform, wCoord);

  const { segments, organs, tensionChords } = interpretLSystemTurtle3D(
    tokens,
    entry.artform,
    wEval
  );

  entry.lastQuantizedWBand = quantizedBand;
  entry.activeRegime = regime;
  entry.activeVitalityPhase = wEval.vitalityPhase;
  entry.lastWInfluenceFactor = wEval.wCoordinateInfluenceFactor;
  entry.lastModulatedRecursionDepth = wEval.modulatedRecursionDepth;
  entry.lastBranchAngleVarianceDeg = wEval.branchAngleVarianceDeg;
  entry.branchCount = segments.length;

  // 1. Update Unified Swept Calligraphic Exoskeleton Mesh
  const primaryCol = new THREE.Color(entry.artform.primaryColor);
  const accentCol = new THREE.Color(entry.artform.accentColor);
  const newExoGeo = buildUnifiedLSystemExoskeletonGeometry(
    segments,
    primaryCol,
    accentCol,
    wEval.wCoordinateInfluenceFactor
  );
  if (entry.vascularExoskeletonMesh.geometry) {
    entry.vascularExoskeletonMesh.geometry.dispose();
  }
  entry.vascularExoskeletonMesh.geometry = newExoGeo;

  // 2. Update Naum Gabo / Tensegrity Inter-Branch Tension Chords
  const lineCoords: number[] = [];
  for (const [ptA, ptB] of tensionChords) {
    lineCoords.push(ptA.x, ptA.y, ptA.z, ptB.x, ptB.y, ptB.z);
  }
  const newLineGeo = new THREE.BufferGeometry();
  newLineGeo.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(lineCoords, 3)
  );
  if (entry.tensionWebLines.geometry) {
    entry.tensionWebLines.geometry.dispose();
  }
  entry.tensionWebLines.geometry = newLineGeo;

  // 3. Rebuild Articulated Bifurcation Calyxes & Apical Blooms using GPU Object Instancing (THREE.InstancedMesh)
  while (entry.organNodesGroup.children.length > 0) {
    entry.organNodesGroup.remove(entry.organNodesGroup.children[0]);
  }
  entry.organMeshes = [];
  entry.instancedOrganRecords = [];

  const {
    pseudosphereCalyxGeo,
    gyroidCalyxGeo,
    calabiBloomGeo,
    diffRibbonBloomGeo,
  } = getSharedOrganGeometries();

  const maxOrgans = 38;
  const stride = Math.max(1, Math.ceil(organs.length / maxOrgans));

  const calyxOrgs: LSystemArticulatedOrganNode[] = [];
  const bloomOrgs: LSystemArticulatedOrganNode[] = [];

  for (let i = 0; i < organs.length; i += stride) {
    const org = organs[i];
    if (org.kind === 'apical-bloom') {
      bloomOrgs.push(org);
    } else {
      calyxOrgs.push(org);
    }
  }

  const calyxGeo =
    entry.artform.archetype === 'biocomplex-gyroid-stele'
      ? gyroidCalyxGeo
      : pseudosphereCalyxGeo;
  const bloomGeo =
    entry.artform.archetype === 'chiral-chrono-helix'
      ? diffRibbonBloomGeo
      : calabiBloomGeo;

  const calyxCount = Math.max(1, calyxOrgs.length);
  const bloomCount = Math.max(1, bloomOrgs.length);

  const calyxInstanced = new THREE.InstancedMesh(
    calyxGeo,
    entry.calyxMat,
    calyxCount
  );
  calyxInstanced.count = calyxOrgs.length;
  calyxInstanced.castShadow = false;
  calyxInstanced.receiveShadow = true;

  const bloomInstanced = new THREE.InstancedMesh(
    bloomGeo,
    entry.bloomMat,
    bloomCount
  );
  bloomInstanced.count = bloomOrgs.length;
  bloomInstanced.castShadow = false;
  bloomInstanced.receiveShadow = true;

  for (let i = 0; i < calyxOrgs.length; i++) {
    const org = calyxOrgs[i];
    _instancedOrganDummy.position.copy(org.position);
    _instancedOrganDummy.quaternion.copy(org.quaternion);
    _instancedOrganDummy.scale.setScalar(org.scale);
    _instancedOrganDummy.updateMatrix();
    calyxInstanced.setMatrixAt(i, _instancedOrganDummy.matrix);

    entry.instancedOrganRecords.push({
      instanceIndex: i,
      isBloomMesh: false,
      basePos: org.position.clone(),
      baseQuat: org.quaternion.clone(),
      baseScale: org.scale,
      kind: org.kind,
      generation: org.generation,
      hashSeed: org.hashSeed,
    });
  }
  calyxInstanced.instanceMatrix.needsUpdate = true;

  for (let i = 0; i < bloomOrgs.length; i++) {
    const org = bloomOrgs[i];
    _instancedOrganDummy.position.copy(org.position);
    _instancedOrganDummy.quaternion.copy(org.quaternion);
    _instancedOrganDummy.scale.setScalar(org.scale);
    _instancedOrganDummy.updateMatrix();
    bloomInstanced.setMatrixAt(i, _instancedOrganDummy.matrix);

    entry.instancedOrganRecords.push({
      instanceIndex: i,
      isBloomMesh: true,
      basePos: org.position.clone(),
      baseQuat: org.quaternion.clone(),
      baseScale: org.scale,
      kind: org.kind,
      generation: org.generation,
      hashSeed: org.hashSeed,
    });
  }
  bloomInstanced.instanceMatrix.needsUpdate = true;

  entry.calyxInstancedMesh = calyxInstanced;
  entry.bloomInstancedMesh = bloomInstanced;
  entry.organNodesGroup.add(calyxInstanced);
  entry.organNodesGroup.add(bloomInstanced);
}

/**
 * Creates a complete 3D L-System Procedural Artform Rig Entry in worldspace.
 */
export function buildLSystemProceduralArtform3DMesh(
  artform: WorldspaceProceduralArtform,
  world: ManifoldWorldSpec,
  initialWCoord: number,
  evaluateTerrainHeightFn: (x: number, z: number, w: ManifoldWorldSpec) => number
): LSystemArtformRigEntry {
  if (!artform.lSystemGrammar) {
    artform.lSystemGrammar = synthesizeLSystemGrammarSpec(
      artform.archetype,
      artform.parentSeedA,
      artform.parentSeedB,
      artform.biocomplexityScore
    );
  }

  const group = new THREE.Group();
  group.name = `lsystem-artform-${artform.id}`;
  const groundY = evaluateTerrainHeightFn(artform.x, artform.z, world);
  group.position.set(artform.x, groundY, artform.z);
  group.scale.setScalar(artform.scale);

  const primaryCol = new THREE.Color(artform.primaryColor);
  const accentCol = new THREE.Color(artform.accentColor);
  const goldCol = new THREE.Color('#f59e0b');

  const exoskeletonMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#ffffff'),
    vertexColors: true,
    emissive: primaryCol.clone().lerp(accentCol, 0.4),
    emissiveIntensity: 0.35,
    metalness: 0.42,
    roughness: 0.22,
    clearcoat: 0.88,
    iridescence: 0.72,
  });

  const bloomMat = new THREE.MeshPhysicalMaterial({
    color: accentCol,
    emissive: accentCol.clone().lerp(goldCol, 0.35),
    emissiveIntensity: 0.65,
    metalness: 0.35,
    roughness: 0.16,
    clearcoat: 0.95,
    iridescence: 0.9,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  });

  const calyxMat = new THREE.MeshStandardMaterial({
    color: goldCol.clone().lerp(primaryCol, 0.35),
    emissive: goldCol,
    emissiveIntensity: 0.5,
    metalness: 0.82,
    roughness: 0.24,
  });

  const webLineMat = new THREE.LineBasicMaterial({
    color: accentCol.clone().lerp(goldCol, 0.45),
    transparent: true,
    opacity: 0.58,
    blending: THREE.AdditiveBlending,
  });

  const vascularExoskeletonMesh = new THREE.Mesh(
    new THREE.BufferGeometry(),
    exoskeletonMat
  );
  vascularExoskeletonMesh.castShadow = true;
  vascularExoskeletonMesh.receiveShadow = true;
  group.add(vascularExoskeletonMesh);

  const tensionWebLines = new THREE.LineSegments(
    new THREE.BufferGeometry(),
    webLineMat
  );
  group.add(tensionWebLines);

  const organNodesGroup = new THREE.Group();
  group.add(organNodesGroup);

  const entry: LSystemArtformRigEntry = {
    id: artform.id,
    artform,
    group,
    vascularExoskeletonMesh,
    tensionWebLines,
    organNodesGroup,
    instancedOrganRecords: [],
    organMeshes: [],
    exoskeletonMat,
    bloomMat,
    calyxMat,
    webLineMat,
    lastQuantizedWBand: -999,
    activeRegime: 'continuum-cantilever-arbor',
    activeVitalityPhase: 'homeostatic-arbor',
    lastWInfluenceFactor: 0,
    lastModulatedRecursionDepth: 3,
    lastBranchAngleVarianceDeg: 18.5,
    branchCount: 0,
  };

  rebuildLSystemArtformTopologyForW(entry, initialWCoord);
  return entry;
}

/**
 * Updates an L-System Procedural Artform using hardware-instanced organ matrices and zero per-frame allocations:
 * 1. Evaluates `wCoordinateInfluenceFactor` and dynamically re-grows/withers the fractal recursion
 *    depth and branch-angle variance when `wCoord` crosses a quantized influence threshold.
 * 2. Smoothly articulates instanced apical blooms and bifurcation calyxes via `THREE.InstancedMesh`.
 */
export function updateLSystemProceduralArtformEntry(
  entry: LSystemArtformRigEntry,
  world: ManifoldWorldSpec,
  wCoord: number,
  nowSec: number,
  evaluateTerrainHeightFn: (x: number, z: number, w: ManifoldWorldSpec) => number
): void {
  const wEval = evaluateWCoordinateInfluenceFactor(wCoord, entry.artform);

  // Re-derive the L-System 3D structure when W-coordinate influence shifts across a quantization band
  if (wEval.quantizedBand !== entry.lastQuantizedWBand) {
    rebuildLSystemArtformTopologyForW(entry, wCoord);
  }

  entry.lastWInfluenceFactor = wEval.wCoordinateInfluenceFactor;
  entry.lastModulatedRecursionDepth = wEval.modulatedRecursionDepth;
  entry.lastBranchAngleVarianceDeg = wEval.branchAngleVarianceDeg;
  entry.activeVitalityPhase = wEval.vitalityPhase;

  const groundY = evaluateTerrainHeightFn(
    entry.artform.x,
    entry.artform.z,
    world
  );
  entry.group.position.set(entry.artform.x, groundY, entry.artform.z);

  const wInfluence = wEval.wCoordinateInfluenceFactor; // [-1.0, +1.0]
  const wNorm = (wInfluence + 1.0) * 0.5; // 0 at Deep Wither, 1 at Full Bloom
  const witherIntensity = Math.max(0, -wInfluence);
  const bloomIntensity = Math.max(0, wInfluence);

  // Whole-arbor posture modulation: expands & stands tall in bloom, contracts & hunches slightly in wither
  const dynamicScaleY =
    entry.artform.scale * (1.0 + bloomIntensity * 0.16 - witherIntensity * 0.18);
  const dynamicScaleXZ =
    entry.artform.scale * (1.0 + bloomIntensity * 0.12 - witherIntensity * 0.1);
  entry.group.scale.set(dynamicScaleXZ, dynamicScaleY, dynamicScaleXZ);

  // Heliotropic torsion & breathing driven by wCoordinateInfluenceFactor
  entry.vascularExoskeletonMesh.rotation.y =
    Math.sin(nowSec * 0.35 + entry.artform.wPhase) * 0.08 + wInfluence * 0.32;
  entry.vascularExoskeletonMesh.rotation.z =
    Math.sin(nowSec * 0.25 + entry.artform.parentSeedA) * 0.04 -
    witherIntensity * 0.12;
  entry.tensionWebLines.rotation.copy(entry.vascularExoskeletonMesh.rotation);
  entry.organNodesGroup.rotation.copy(entry.vascularExoskeletonMesh.rotation);

  // Dynamic Chromatic & Material Evolution using zero-allocation scratch colors
  _scratchColorPrimary.set(entry.artform.primaryColor);
  _scratchColorAccent.set(entry.artform.accentColor);
  _scratchColorEvolved
    .copy(_scratchColorAccent)
    .lerp(
      wInfluence < 0 ? _scratchWitherCol : _scratchKataBloomCol,
      Math.abs(wInfluence) * 0.62
    );

  entry.bloomMat.color.copy(_scratchColorEvolved);
  entry.bloomMat.emissive.copy(_scratchColorEvolved);
  entry.bloomMat.emissiveIntensity =
    0.22 + wNorm * 0.78 + bloomIntensity * 0.25;
  entry.bloomMat.iridescence = 0.25 + wNorm * 0.75;
  entry.bloomMat.roughness = THREE.MathUtils.lerp(0.55, 0.12, wNorm);

  entry.exoskeletonMat.emissive
    .copy(_scratchColorPrimary)
    .lerp(_scratchColorEvolved, 0.35 + wNorm * 0.45);
  entry.exoskeletonMat.emissiveIntensity =
    0.16 +
    wNorm * 0.38 +
    Math.sin(nowSec * 1.4 + entry.artform.wPhase) * 0.06;
  entry.exoskeletonMat.roughness = THREE.MathUtils.lerp(0.52, 0.14, wNorm);

  entry.webLineMat.opacity = THREE.MathUtils.lerp(0.18, 0.82, wNorm);

  // Update GPU Instanced Organ Nodes (calyxInstancedMesh & bloomInstancedMesh)
  const calyxInst = entry.calyxInstancedMesh;
  const bloomInst = entry.bloomInstancedMesh;
  if (!calyxInst || !bloomInst) return;

  for (let i = 0; i < entry.instancedOrganRecords.length; i++) {
    const node = entry.instancedOrganRecords[i];
    const phase =
      nowSec * (0.85 + wNorm * 0.75) +
      node.hashSeed * Math.PI * 2 +
      node.generation * 0.6;

    if (node.kind === 'apical-bloom') {
      const unfurlFactor =
        THREE.MathUtils.lerp(0.38, 1.58, wNorm) +
        Math.sin(phase) * (0.04 + bloomIntensity * 0.08);
      _instancedOrganDummy.position.set(
        node.basePos.x,
        node.basePos.y - witherIntensity * 0.14 + bloomIntensity * 0.08,
        node.basePos.z
      );
      _instancedOrganDummy.rotation.set(
        witherIntensity * 0.65 - bloomIntensity * 0.25,
        phase * 0.45 + wInfluence * 1.25,
        Math.sin(phase * 0.7) * (0.12 + wNorm * 0.24) + witherIntensity * 0.35
      );
      _instancedOrganDummy.scale.setScalar(node.baseScale * unfurlFactor);
      _instancedOrganDummy.updateMatrix();
      bloomInst.setMatrixAt(node.instanceIndex, _instancedOrganDummy.matrix);
    } else if (node.kind === 'aerial-satellite') {
      const hoverOffset =
        0.12 + bloomIntensity * 0.34 + Math.sin(phase * 1.4) * 0.09;
      _instancedOrganDummy.position.set(
        node.basePos.x,
        node.basePos.y + hoverOffset,
        node.basePos.z
      );
      _instancedOrganDummy.rotation.set(phase * 0.8, -phase * 1.1, 0);
      _instancedOrganDummy.scale.setScalar(
        node.baseScale * (0.75 + bloomIntensity * 0.65)
      );
      _instancedOrganDummy.updateMatrix();
      calyxInst.setMatrixAt(node.instanceIndex, _instancedOrganDummy.matrix);
    } else {
      const calyxPulse =
        THREE.MathUtils.lerp(0.74, 1.22, wNorm) + Math.sin(phase * 0.9) * 0.05;
      _instancedOrganDummy.position.copy(node.basePos);
      _instancedOrganDummy.quaternion.copy(node.baseQuat);
      _instancedOrganDummy.scale.setScalar(node.baseScale * calyxPulse);
      _instancedOrganDummy.updateMatrix();
      calyxInst.setMatrixAt(node.instanceIndex, _instancedOrganDummy.matrix);
    }
  }

  calyxInst.instanceMatrix.needsUpdate = true;
  bloomInst.instanceMatrix.needsUpdate = true;
}
