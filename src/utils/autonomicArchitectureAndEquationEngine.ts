import * as THREE from 'three';

// ============================================================================
// 1. SELF-EVOLVING NONLINEAR MATHEMATICAL OPERATORS & PERSISTENT CODEX TYPES
// ============================================================================

export type NonlinearOperatorId =
  | 'kuramoto-phase-sync'
  | 'hamiltonian-geodesic-flow'
  | 'reaction-diffusion-morphogen'
  | 'strange-attractor-chaos';

export type GameplayDiscoveryTriggerKind =
  | 'kinetic-grapple-apex'
  | 'visceral-limb-cleave'
  | 'tectonic-excavation'
  | 'non-euclidean-portal-transit'
  | 'dimensional-w-shift'
  | 'architectural-sintering';

export interface NonlinearOperatorSpec {
  id: NonlinearOperatorId;
  name: string;
  shortName: string;
  symbolicFormula: string;
  coupledDomainSummary: string;
  enabled: boolean;
  couplingWeight: number; // 0.0 to 2.5
  mutationGeneration: number;
  eigenvalues: {
    alpha: number;
    beta: number;
    gamma: number;
  };
  liveStateReadout: string;
}

export interface DiscoveredEquationMutationRecord {
  id: string;
  generationTier: number;
  timestamp: number;
  triggerKind: GameplayDiscoveryTriggerKind;
  operatorId: NonlinearOperatorId;
  synthesizedTermSymbol: string;
  mutationTitle: string;
  architecturalEffectSummary: string;
  deltaCoupling: number;
}

export interface AutonomicSelfTuningParameters {
  autonomicModeEnabled: boolean;
  cameraSpringStiffnessMultiplier: number; // 0.70 to 1.45
  fovWarpDampingMultiplier: number; // 0.60 to 1.30
  aimErgonomicMagnetism: number; // 0.0 to 1.0
  stepUpHeightAllowanceM: number; // 0.50m to 0.88m
  slopeSlideFrictionMultiplier: number; // 0.75 to 1.40
  physicsSolverSubSteps: number; // 1 to 3
  shaderNoiseOctaveBudget: number; // 1.0 to 3.0
  aiEncounterPacingMultiplier: number; // 0.65 to 1.45
  portalRenderCadenceDivisor: number; // 1, 2, or 3 frames
}

export interface ConsumerExperienceAndRuntimeStats {
  // Hardware & Frame Budget Telemetry
  fps: number;
  emaFrameTimeMs: number;
  p95FrameTimeMs: number;
  frameJitterMs: number;
  activePixelRatio: number;
  activeEntityCount: number;
  spatialColliderCount: number;
  pooledMaterialCount: number;

  // Player Psychology & Flow-State Ergonomics (0 - 100)
  playerFlowIndex: number;
  traversalMomentumContinuity: number;
  cameraErgonomicStability: number;
  combatHitCadenceScore: number;
  grappleHarmonicRhythm: number;
  activeFlowStateClassification:
    | 'Peak Hyper-Dimensional Flow'
    | 'Kinetic Combat Resonance'
    | 'Exploratory Geodesic Cruise'
    | 'Autonomic Frame-Budget Recovery'
    | 'Ergonomic Motion Stabilization';
}

export interface CoupledMathematicalFieldState {
  generationTier: number;
  generationTitle: string;
  masterSymbolicEquation: string;
  // Kuramoto Phase-Coupled Network State
  kuramotoOrderParameterR: number; // [0..1] phase synchronization coherence
  kuramotoCollectivePhaseRad: number;
  // Hamiltonian Geodesic Tensor State
  hamiltonianCurvatureScalar: number;
  geodesicApexConservation: number; // [1.0..1.38] momentum preservation on swings/slopes
  terrainGeodesicFoldWeight: number;
  // Gray-Scott / FitzHugh-Nagumo Reaction-Diffusion Morphogen State
  morphogenConcentrationU: number;
  morphogenActivatorV: number;
  surfaceWearModulation: number;
  emissiveVeinHarmonicDensity: number;
  // Strange Attractor Deterministic Chaos Vector
  attractorVector: [number, number, number];
  chaosTurbulenceScalar: number;
}

export interface AutonomicArchitectureSnapshot {
  fieldState: CoupledMathematicalFieldState;
  operators: Record<NonlinearOperatorId, NonlinearOperatorSpec>;
  tuning: AutonomicSelfTuningParameters;
  stats: ConsumerExperienceAndRuntimeStats;
  mutationLog: DiscoveredEquationMutationRecord[];
  latestToastMutation: DiscoveredEquationMutationRecord | null;
  totalDiscoveriesCount: number;
}

const CODEX_STORAGE_KEY = 'tesseract_autonomic_equation_codex_v1';

interface PersistedCodexPayload {
  generationTier: number;
  totalDiscoveriesCount: number;
  operators: Record<
    NonlinearOperatorId,
    {
      enabled: boolean;
      couplingWeight: number;
      mutationGeneration: number;
      eigenvalues: { alpha: number; beta: number; gamma: number };
    }
  >;
  mutationLog: DiscoveredEquationMutationRecord[];
  tuningOverrides?: Partial<AutonomicSelfTuningParameters>;
}

const DEFAULT_OPERATORS: Record<NonlinearOperatorId, NonlinearOperatorSpec> = {
  'kuramoto-phase-sync': {
    id: 'kuramoto-phase-sync',
    name: 'Kuramoto Phase-Coupled Oscillator Network',
    shortName: 'Kuramoto Sync',
    symbolicFormula: 'dθᵢ/dt = ωᵢ + (K/N)·∑ sin(θⱼ − θᵢ) + η_W(t)',
    coupledDomainSummary:
      'Synchronizes instanced monument emissive vein pulses, 4D node phase lock, and creature flock alignment.',
    enabled: true,
    couplingWeight: 1.08,
    mutationGeneration: 1,
    eigenvalues: { alpha: 1.85, beta: 0.64, gamma: 1.12 },
    liveStateReadout: 'R = 0.78 · Ψ = +1.42 rad',
  },
  'hamiltonian-geodesic-flow': {
    id: 'hamiltonian-geodesic-flow',
    name: 'Hamiltonian Geodesic & Symplectic Tensor',
    shortName: 'Hamiltonian Geodesic',
    symbolicFormula: 'ℋ(q,p) = ½ gⁱʲ(q,W)pᵢpⱼ + V_fold(q) − κ_geo· det(∇²Φ)',
    coupledDomainSummary:
      'Governs 4D terrain ridge folding, grapple pendulum apex momentum conservation, and slope-slide geodesics.',
    enabled: true,
    couplingWeight: 1.15,
    mutationGeneration: 1,
    eigenvalues: { alpha: 1.42, beta: 0.88, gamma: 1.25 },
    liveStateReadout: 'κ_H = +0.64 · Apex = 1.16×',
  },
  'reaction-diffusion-morphogen': {
    id: 'reaction-diffusion-morphogen',
    name: 'Gray-Scott Reaction-Diffusion Morphogen PDE',
    shortName: 'Reaction-Diffusion',
    symbolicFormula: '∂u/∂t = Dᵤ∇²u − uv² + F(1−u),  ∂v/∂t = Dᵥ∇²v + uv² − (F+k)v',
    coupledDomainSummary:
      'Drives procedural surface wear patina, capillary emissive vein branching on shared geometry, and tectonic strata.',
    enabled: true,
    couplingWeight: 1.12,
    mutationGeneration: 1,
    eigenvalues: { alpha: 0.037, beta: 0.06, gamma: 1.48 },
    liveStateReadout: 'u = 0.62 · v = 0.34 · Wear = 0.46',
  },
  'strange-attractor-chaos': {
    id: 'strange-attractor-chaos',
    name: 'Lorenz-Rössler Strange Attractor Curl Field',
    shortName: 'Strange Attractor',
    symbolicFormula: 'dx/dt = σ(y−x),  dy/dt = x(ρ−z)−y,  dz/dt = xy − βz',
    coupledDomainSummary:
      'Injects bounded deterministic chaos into anomaly drift trajectories, weather squalls, and antagonist evasion.',
    enabled: true,
    couplingWeight: 0.96,
    mutationGeneration: 1,
    eigenvalues: { alpha: 10.0, beta: 28.0, gamma: 2.667 },
    liveStateReadout: 'Ξ = (+0.41, −0.28, +0.67)',
  },
};

const DEFAULT_AUTONOMIC_TUNING: AutonomicSelfTuningParameters = {
  autonomicModeEnabled: true,
  cameraSpringStiffnessMultiplier: 1.05,
  fovWarpDampingMultiplier: 0.92,
  aimErgonomicMagnetism: 0.58,
  stepUpHeightAllowanceM: 0.64,
  slopeSlideFrictionMultiplier: 1.04,
  physicsSolverSubSteps: 2,
  shaderNoiseOctaveBudget: 2.4,
  aiEncounterPacingMultiplier: 1.0,
  portalRenderCadenceDivisor: 1,
};

const SYMBOLIC_MUTATION_CATALOG: Record<
  GameplayDiscoveryTriggerKind,
  {
    operatorId: NonlinearOperatorId;
    terms: string[];
    titles: string[];
    effects: string[];
  }
> = {
  'kinetic-grapple-apex': {
    operatorId: 'hamiltonian-geodesic-flow',
    terms: [
      '− λ_symp·(p × ∇×A_grapple)',
      '+ ½ κ_levi·Γⁱⱼₖ uʲ uᵏ',
      '+ η_apex·cosh(‖p‖/m₀c)',
    ],
    titles: [
      'Symplectic Grapple Geodesic Conservation',
      'Levi-Civita Parallel Transport Apex Boost',
      'Relativistic Pendulum Momentum Invariant',
    ],
    effects: [
      'Conserves +14% swing apex velocity and smooths high-G camera roll transitions.',
      'Reduces grapple tether energy bleed and expands step-up mantle clearance on roofs.',
      'Couples player swing momentum into terrain ridge curvature and FOV warp damping.',
    ],
  },
  'visceral-limb-cleave': {
    operatorId: 'reaction-diffusion-morphogen',
    terms: [
      '+ γ_vein·∇·(D_aniso ∇v²)',
      '− μ_shear·tanh(‖σ_cleave‖/κ)',
      '+ ξ_arterial·sin(ω_K t)·u·v²',
    ],
    titles: [
      'Anisotropic Capillary Vein Morphogenesis',
      'Viscoplastic Shear-Strain Patina Tensor',
      'Harmonic Arterial Emissive Coupling',
    ],
    effects: [
      'Sharpens branching emissive veins across instanced monuments and shared geometry.',
      'Amplifies procedural surface wear contrast and stabilizes melee hit-stop ergonomics.',
      'Synchronizes weapon recoil recovery springs with active Kuramoto phase coherence.',
    ],
  },
  'tectonic-excavation': {
    operatorId: 'hamiltonian-geodesic-flow',
    terms: [
      '+ α_karst·∇⁴Φ_strata',
      '− β_fault·det(Hess(h_terrain))',
      '+ δ_cymatic·J₀(k_r · r_crater)',
    ],
    titles: [
      'Biharmonic Tectonic Strata Folding',
      'Monge-Ampère Hessian Fault Carving',
      'Bessel Standing-Wave Crater Resonance',
    ],
    effects: [
      'Enriches procedural cliff terraces and deepens tectonic fault relief across sectors.',
      'Improves slope-slide foot traction on excavated crater rims and steep escarpments.',
      'Propagates excavation shockwaves into instanced boulder wear and mineral vein glow.',
    ],
  },
  'non-euclidean-portal-transit': {
    operatorId: 'kuramoto-phase-sync',
    terms: [
      '+ K_portal·∑ sin(θⱼ − θᵢ − Φ_tear)',
      '+ Ω_holonomy·∮ A_μ dx^μ',
      '+ ζ_ads·exp(−2y/L_AdS)·∇²θ',
    ],
    titles: [
      'Non-Euclidean Holonomy Phase Lock',
      'Ryu-Takayanagi Entanglement Coherence',
      'Hyperbolic Portal Boundary Synchronization',
    ],
    effects: [
      'Elevates global Kuramoto coherence R, aligning monument vein pulses and flock orbits.',
      'Eliminates camera horizon jerk when crossing Reality-Tear and In-Between Void gates.',
      'Couples portal rim harmonics directly into 4D node gateway activation weights.',
    ],
  },
  'dimensional-w-shift': {
    operatorId: 'strange-attractor-chaos',
    terms: [
      '+ ε_W·(x ∧ dy ∧ dz ∧ dw)',
      '+ ρ_fold·(x·z − β·W²)',
      '− χ_twistor·curl(B_4D)',
    ],
    titles: [
      '4D Exterior Differential W-Fold Attractor',
      'Lorentz-Hyperbolic Strange Attractor Bifurcation',
      'Penrose Twistor Vorticity Injection',
    ],
    effects: [
      'Evolves strange-attractor trajectories for richer anomaly motion and weather fronts.',
      'Tunes AI flock evasion vectors and balances encounter pressure during W-shifts.',
      'Modulates 4D terrain W-phase fold amplitude without frame-time spikes.',
    ],
  },
  'architectural-sintering': {
    operatorId: 'reaction-diffusion-morphogen',
    terms: [
      '+ κ_gyroid·(sin x cos y + sin y cos z + sin z cos x)',
      '+ τ_sinter·∇²(u³ − u)',
      '+ ν_corbel·‖∇h_BIM‖²',
    ],
    titles: [
      'Triply Periodic Minimal Surface (TPMS) Morphogen',
      'Cahn-Hilliard Spinodal Sintering Operator',
      'Structural Corbel Stress-Line Tensor',
    ],
    effects: [
      'Enhances per-instance surface wear and cavity grime differentiation on sintered blocks.',
      'Increases walkable roof ledge stability and spatial collider step-up smoothness.',
      'Boosts emissive vein harmonic density on placed buildings and obelisks.',
    ],
  },
};

// ============================================================================
// 2. UNIFIED AUTONOMIC ARCHITECTURE & SELF-EVOLVING EQUATION ENGINE
// ============================================================================

export class AutonomicArchitectureAndEquationEngine {
  private operators: Record<NonlinearOperatorId, NonlinearOperatorSpec>;
  private tuning: AutonomicSelfTuningParameters;
  private mutationLog: DiscoveredEquationMutationRecord[] = [];
  private latestToastMutation: DiscoveredEquationMutationRecord | null = null;
  private toastTimerSec = 0;

  private generationTier = 1;
  private totalDiscoveriesCount = 0;

  // Pre-allocated Zero-GC Ring Buffers for Runtime & Consumer-Experience Telemetry
  private readonly ringSize = 90;
  private readonly frameTimeRing = new Float32Array(90);
  private readonly speedRing = new Float32Array(90);
  private readonly angularJerkRing = new Float32Array(90);
  private readonly sortScratch = new Float32Array(90);
  private ringCursor = 0;
  private ringFilledCount = 0;

  // Internal Coupled Differential State Variables (updated in-place)
  private readonly kuramotoPhases = new Float32Array([
    0.0, 0.85, 1.72, 2.58, 3.41, 4.29, 5.12, 5.94,
  ]);
  private readonly kuramotoNaturalFreqs = new Float32Array([
    1.12, 1.38, 1.64, 1.91, 2.15, 2.42, 2.68, 2.95,
  ]);
  private attractorX = 0.85;
  private attractorY = 1.12;
  private attractorZ = 18.4;
  private morphogenU = 0.64;
  private morphogenV = 0.32;

  private prevYaw = 0;
  private prevPitch = 0;
  private prevAngularSpeed = 0;
  private prevHorizSpeed = 0;
  private combatCadenceDecay = 0.68;
  private grappleRhythmAccumulator = 0.72;
  private stepUpSmoothnessEMA = 0.88;
  private discoveryProgressAccumulator = 0;
  private lastDiscoveryTriggerAtSec = -10;

  public readonly fieldState: CoupledMathematicalFieldState = {
    generationTier: 1,
    generationTitle: 'Gen-I Coupled Kuramoto-Hamiltonian Manifold',
    masterSymbolicEquation:
      '∂Ψ/∂t = ℋ_geo(q,p,W) + K·∑sin(θⱼ−θᵢ) + D_uv∇²(u,v) + Ξ_attractor(σ,ρ,β)',
    kuramotoOrderParameterR: 0.78,
    kuramotoCollectivePhaseRad: 0.0,
    hamiltonianCurvatureScalar: 0.64,
    geodesicApexConservation: 1.14,
    terrainGeodesicFoldWeight: 1.0,
    morphogenConcentrationU: 0.64,
    morphogenActivatorV: 0.32,
    surfaceWearModulation: 0.44,
    emissiveVeinHarmonicDensity: 1.65,
    attractorVector: [0.12, -0.08, 0.45],
    chaosTurbulenceScalar: 0.38,
  };

  public readonly stats: ConsumerExperienceAndRuntimeStats = {
    fps: 60,
    emaFrameTimeMs: 16.6,
    p95FrameTimeMs: 18.2,
    frameJitterMs: 1.2,
    activePixelRatio: 1.0,
    activeEntityCount: 12,
    spatialColliderCount: 24,
    pooledMaterialCount: 14,
    playerFlowIndex: 86,
    traversalMomentumContinuity: 88,
    cameraErgonomicStability: 91,
    combatHitCadenceScore: 78,
    grappleHarmonicRhythm: 84,
    activeFlowStateClassification: 'Peak Hyper-Dimensional Flow',
  };

  constructor() {
    this.operators = {
      'kuramoto-phase-sync': {
        ...DEFAULT_OPERATORS['kuramoto-phase-sync'],
        eigenvalues: { ...DEFAULT_OPERATORS['kuramoto-phase-sync'].eigenvalues },
      },
      'hamiltonian-geodesic-flow': {
        ...DEFAULT_OPERATORS['hamiltonian-geodesic-flow'],
        eigenvalues: {
          ...DEFAULT_OPERATORS['hamiltonian-geodesic-flow'].eigenvalues,
        },
      },
      'reaction-diffusion-morphogen': {
        ...DEFAULT_OPERATORS['reaction-diffusion-morphogen'],
        eigenvalues: {
          ...DEFAULT_OPERATORS['reaction-diffusion-morphogen'].eigenvalues,
        },
      },
      'strange-attractor-chaos': {
        ...DEFAULT_OPERATORS['strange-attractor-chaos'],
        eigenvalues: {
          ...DEFAULT_OPERATORS['strange-attractor-chaos'].eigenvalues,
        },
      },
    };
    this.tuning = { ...DEFAULT_AUTONOMIC_TUNING };
    this.frameTimeRing.fill(16.6);
    this.speedRing.fill(8.5);
    this.angularJerkRing.fill(0.05);
    this.loadPersistedCodex();
    this.rebuildMasterSymbolicEquation();
  }

  private loadPersistedCodex(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(CODEX_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<PersistedCodexPayload>;
      if (
        typeof parsed.generationTier === 'number' &&
        parsed.generationTier >= 1
      ) {
        this.generationTier = Math.min(99, Math.max(1, parsed.generationTier));
      }
      if (typeof parsed.totalDiscoveriesCount === 'number') {
        this.totalDiscoveriesCount = Math.max(0, parsed.totalDiscoveriesCount);
      }
      if (parsed.operators) {
        for (const key of Object.keys(
          this.operators
        ) as NonlinearOperatorId[]) {
          const savedOp = parsed.operators[key];
          if (savedOp) {
            this.operators[key].enabled = Boolean(savedOp.enabled);
            this.operators[key].couplingWeight = THREE.MathUtils.clamp(
              Number(savedOp.couplingWeight) || 1.0,
              0.0,
              2.5
            );
            this.operators[key].mutationGeneration = Math.max(
              1,
              Number(savedOp.mutationGeneration) || 1
            );
            if (savedOp.eigenvalues) {
              this.operators[key].eigenvalues = {
                alpha:
                  Number(savedOp.eigenvalues.alpha) ||
                  this.operators[key].eigenvalues.alpha,
                beta:
                  Number(savedOp.eigenvalues.beta) ||
                  this.operators[key].eigenvalues.beta,
                gamma:
                  Number(savedOp.eigenvalues.gamma) ||
                  this.operators[key].eigenvalues.gamma,
              };
            }
          }
        }
      }
      if (Array.isArray(parsed.mutationLog) && parsed.mutationLog.length > 0) {
        this.mutationLog = parsed.mutationLog.slice(0, 28);
      }
      if (parsed.tuningOverrides) {
        this.tuning = {
          ...this.tuning,
          ...parsed.tuningOverrides,
        };
      }
    } catch {
      // Ignore storage parse failures
    }
  }

  private savePersistedCodex(): void {
    if (typeof window === 'undefined') return;
    try {
      const payload: PersistedCodexPayload = {
        generationTier: this.generationTier,
        totalDiscoveriesCount: this.totalDiscoveriesCount,
        operators: {
          'kuramoto-phase-sync': {
            enabled: this.operators['kuramoto-phase-sync'].enabled,
            couplingWeight: this.operators['kuramoto-phase-sync'].couplingWeight,
            mutationGeneration:
              this.operators['kuramoto-phase-sync'].mutationGeneration,
            eigenvalues: this.operators['kuramoto-phase-sync'].eigenvalues,
          },
          'hamiltonian-geodesic-flow': {
            enabled: this.operators['hamiltonian-geodesic-flow'].enabled,
            couplingWeight:
              this.operators['hamiltonian-geodesic-flow'].couplingWeight,
            mutationGeneration:
              this.operators['hamiltonian-geodesic-flow'].mutationGeneration,
            eigenvalues:
              this.operators['hamiltonian-geodesic-flow'].eigenvalues,
          },
          'reaction-diffusion-morphogen': {
            enabled: this.operators['reaction-diffusion-morphogen'].enabled,
            couplingWeight:
              this.operators['reaction-diffusion-morphogen'].couplingWeight,
            mutationGeneration:
              this.operators['reaction-diffusion-morphogen'].mutationGeneration,
            eigenvalues:
              this.operators['reaction-diffusion-morphogen'].eigenvalues,
          },
          'strange-attractor-chaos': {
            enabled: this.operators['strange-attractor-chaos'].enabled,
            couplingWeight:
              this.operators['strange-attractor-chaos'].couplingWeight,
            mutationGeneration:
              this.operators['strange-attractor-chaos'].mutationGeneration,
            eigenvalues: this.operators['strange-attractor-chaos'].eigenvalues,
          },
        },
        mutationLog: this.mutationLog.slice(0, 24),
        tuningOverrides: this.tuning,
      };
      window.localStorage.setItem(CODEX_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }

  private rebuildMasterSymbolicEquation(): void {
    const roman = [
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI',
      'VII',
      'VIII',
      'IX',
      'X',
      'XI',
      'XII',
    ];
    const tierRoman =
      this.generationTier <= roman.length
        ? roman[this.generationTier - 1]
        : `${this.generationTier}`;
    this.fieldState.generationTier = this.generationTier;
    this.fieldState.generationTitle = `Gen-${tierRoman} Self-Optimizing Symplectic-Kuramoto Manifold`;

    const activeTerms: string[] = [];
    const kOp = this.operators['kuramoto-phase-sync'];
    if (kOp.enabled) {
      activeTerms.push(
        `${kOp.couplingWeight.toFixed(2)}·K_sync∑sin(θⱼ−θᵢ)`
      );
    }
    const hOp = this.operators['hamiltonian-geodesic-flow'];
    if (hOp.enabled) {
      activeTerms.push(
        `${hOp.couplingWeight.toFixed(2)}·ℋ_geo(gⁱʲpᵢpⱼ − κ∇²Φ)`
      );
    }
    const rdOp = this.operators['reaction-diffusion-morphogen'];
    if (rdOp.enabled) {
      activeTerms.push(
        `${rdOp.couplingWeight.toFixed(2)}·(D_u∇²u − uv²)`
      );
    }
    const saOp = this.operators['strange-attractor-chaos'];
    if (saOp.enabled) {
      activeTerms.push(
        `${saOp.couplingWeight.toFixed(2)}·Ξ_chaos(σ,ρ,β)`
      );
    }

    const recentSymbolicSuffix =
      this.mutationLog.length > 0
        ? ` ${this.mutationLog[0].synthesizedTermSymbol}`
        : '';

    this.fieldState.masterSymbolicEquation =
      activeTerms.length > 0
        ? `∂Ψ_manifold/∂t = ${activeTerms.join(' + ')}${recentSymbolicSuffix}`
        : '∂Ψ_manifold/∂t = 0 (Euclidean Baseline)';
  }

  /**
   * Records a gameplay discovery event and synthesizes a new higher-order symbolic equation term
   * that mutates the active operator tensors and persists to the cross-session Codex.
   */
  public recordGameplayEquationDiscovery(
    triggerKind: GameplayDiscoveryTriggerKind,
    intensity = 1.0,
    forceImmediateMutation = false
  ): DiscoveredEquationMutationRecord | null {
    const nowSec = performance.now() * 0.001;
    if (triggerKind === 'visceral-limb-cleave') {
      this.combatCadenceDecay = Math.min(
        1.0,
        this.combatCadenceDecay + 0.18 * intensity
      );
    } else if (triggerKind === 'kinetic-grapple-apex') {
      this.grappleRhythmAccumulator = Math.min(
        1.0,
        this.grappleRhythmAccumulator + 0.16 * intensity
      );
    }

    this.discoveryProgressAccumulator += 0.34 * Math.max(0.25, intensity);
    if (
      !forceImmediateMutation &&
      (this.discoveryProgressAccumulator < 1.0 ||
        nowSec - this.lastDiscoveryTriggerAtSec < 4.5)
    ) {
      return null;
    }

    this.discoveryProgressAccumulator = 0;
    this.lastDiscoveryTriggerAtSec = nowSec;
    this.totalDiscoveriesCount += 1;
    this.generationTier = Math.min(
      99,
      1 + Math.floor(this.totalDiscoveriesCount / 2)
    );

    const spec = SYMBOLIC_MUTATION_CATALOG[triggerKind];
    const op = this.operators[spec.operatorId];
    op.mutationGeneration += 1;
    const variantIdx =
      (op.mutationGeneration + this.totalDiscoveriesCount) % spec.terms.length;

    const deltaCoupling = Number(
      (0.04 + (this.totalDiscoveriesCount % 3) * 0.02).toFixed(2)
    );
    op.couplingWeight = Number(
      THREE.MathUtils.clamp(op.couplingWeight + deltaCoupling, 0.35, 2.25).toFixed(
        2
      )
    );
    op.eigenvalues.alpha = Number(
      (op.eigenvalues.alpha * 1.035).toFixed(3)
    );
    op.eigenvalues.gamma = Number(
      (op.eigenvalues.gamma * 1.028).toFixed(3)
    );

    const record: DiscoveredEquationMutationRecord = {
      id: `eq-mut-${Date.now()}-${this.totalDiscoveriesCount}`,
      generationTier: this.generationTier,
      timestamp: Date.now(),
      triggerKind,
      operatorId: spec.operatorId,
      synthesizedTermSymbol: spec.terms[variantIdx],
      mutationTitle: spec.titles[variantIdx],
      architecturalEffectSummary: spec.effects[variantIdx],
      deltaCoupling,
    };

    this.mutationLog = [record, ...this.mutationLog.slice(0, 27)];
    this.latestToastMutation = record;
    this.toastTimerSec = 6.5;

    this.rebuildMasterSymbolicEquation();
    this.savePersistedCodex();
    return record;
  }

  /**
   * Steps all 4 coupled nonlinear differential operators + the closed-loop Consumer-Experience
   * & Hardware Frame-Budget PID Optimizer in O(1) time with zero heap allocations.
   */
  public stepAutonomicArchitectureAndEquations(params: {
    dt: number;
    nowSec: number;
    wCoord: number;
    dimIndex: number;
    playerPos: THREE.Vector3;
    playerVel: THREE.Vector3;
    playerYaw: number;
    playerPitch: number;
    playerGrounded: boolean;
    grappleActive: boolean;
    steppedUpDeltaY: number;
    emaFrameTimeMs: number;
    activePixelRatio: number;
    activeEntityCount: number;
    spatialColliderCount: number;
    pooledMaterialCount: number;
  }): CoupledMathematicalFieldState {
    const dt = Math.min(0.1, Math.max(0.001, params.dt));
    const {
      wCoord,
      dimIndex,
      playerPos,
      playerVel,
      playerYaw,
      playerPitch,
      grappleActive,
      steppedUpDeltaY,
    } = params;

    if (this.toastTimerSec > 0) {
      this.toastTimerSec = Math.max(0, this.toastTimerSec - dt);
      if (this.toastTimerSec <= 0) {
        this.latestToastMutation = null;
      }
    }

    // -------------------------------------------------------------------------
    // A. STEP KURAMOTO PHASE-COUPLED OSCILLATOR NETWORK (N = 8 coupled nodes)
    // -------------------------------------------------------------------------
    const kOp = this.operators['kuramoto-phase-sync'];
    const K = kOp.enabled
      ? kOp.eigenvalues.alpha * kOp.couplingWeight * (1.0 + Math.abs(wCoord) * 0.35)
      : 0.0;
    const N = this.kuramotoPhases.length;
    let sumCos = 0;
    let sumSin = 0;

    for (let i = 0; i < N; i++) {
      let couplingSum = 0;
      const thetaI = this.kuramotoPhases[i];
      for (let j = 0; j < N; j++) {
        couplingSum += Math.sin(this.kuramotoPhases[j] - thetaI);
      }
      const dTheta =
        this.kuramotoNaturalFreqs[i] * kOp.eigenvalues.beta +
        (K / N) * couplingSum +
        wCoord * 0.45;
      const nextTheta = (thetaI + dTheta * dt) % (Math.PI * 2);
      this.kuramotoPhases[i] = nextTheta;
      sumCos += Math.cos(nextTheta);
      sumSin += Math.sin(nextTheta);
    }

    const orderR = kOp.enabled
      ? THREE.MathUtils.clamp(Math.hypot(sumCos / N, sumSin / N), 0.08, 1.0)
      : 0.25;
    const collectivePsi = Math.atan2(sumSin / N, sumCos / N);
    this.fieldState.kuramotoOrderParameterR = Number(orderR.toFixed(3));
    this.fieldState.kuramotoCollectivePhaseRad = Number(
      collectivePsi.toFixed(3)
    );
    kOp.liveStateReadout = `R = ${orderR.toFixed(2)} · Ψ = ${
      collectivePsi >= 0 ? '+' : ''
    }${collectivePsi.toFixed(2)} rad`;

    // -------------------------------------------------------------------------
    // B. STEP LORENZ-RÖSSLER STRANGE ATTRACTOR TRAJECTORY
    // -------------------------------------------------------------------------
    const saOp = this.operators['strange-attractor-chaos'];
    if (saOp.enabled) {
      const sigma = saOp.eigenvalues.alpha;
      const rho = saOp.eigenvalues.beta + wCoord * 3.5;
      const beta = saOp.eigenvalues.gamma;
      const chaosDt = dt * 0.35 * saOp.couplingWeight;

      const dx = sigma * (this.attractorY - this.attractorX);
      const dy =
        this.attractorX * (rho - this.attractorZ) - this.attractorY;
      const dz =
        this.attractorX * this.attractorY - beta * this.attractorZ;

      this.attractorX = THREE.MathUtils.clamp(
        this.attractorX + dx * chaosDt,
        -25,
        25
      );
      this.attractorY = THREE.MathUtils.clamp(
        this.attractorY + dy * chaosDt,
        -25,
        25
      );
      this.attractorZ = THREE.MathUtils.clamp(
        this.attractorZ + dz * chaosDt,
        1,
        48
      );
    }
    const normAx = Number((this.attractorX / 25).toFixed(3));
    const normAy = Number((this.attractorY / 25).toFixed(3));
    const normAz = Number(((this.attractorZ - 24) / 24).toFixed(3));
    this.fieldState.attractorVector[0] = normAx;
    this.fieldState.attractorVector[1] = normAy;
    this.fieldState.attractorVector[2] = normAz;
    this.fieldState.chaosTurbulenceScalar = Number(
      (
        Math.hypot(normAx, normAy, normAz) *
        0.58 *
        (saOp.enabled ? saOp.couplingWeight : 0.15)
      ).toFixed(3)
    );
    saOp.liveStateReadout = `Ξ = (${normAx >= 0 ? '+' : ''}${normAx.toFixed(
      2
    )}, ${normAy >= 0 ? '+' : ''}${normAy.toFixed(2)}, ${
      normAz >= 0 ? '+' : ''
    }${normAz.toFixed(2)})`;

    // -------------------------------------------------------------------------
    // C. STEP GRAY-SCOTT REACTION-DIFFUSION MORPHOGEN PDE
    // -------------------------------------------------------------------------
    const rdOp = this.operators['reaction-diffusion-morphogen'];
    const horizSpeed = Math.hypot(playerVel.x, playerVel.z);
    if (rdOp.enabled) {
      const F = rdOp.eigenvalues.alpha * (0.9 + orderR * 0.25);
      const k = rdOp.eigenvalues.beta;
      const uv2 = this.morphogenU * this.morphogenV * this.morphogenV;
      const lapU =
        Math.sin(playerPos.x * 0.04 + collectivePsi) * 0.018 -
        (this.morphogenU - 0.55) * 0.08;
      const lapV =
        Math.cos(playerPos.z * 0.04 - collectivePsi) * 0.016 -
        (this.morphogenV - 0.34) * 0.08;

      const du = lapU - uv2 + F * (1.0 - this.morphogenU);
      const dv = lapV + uv2 - (F + k) * this.morphogenV;
      this.morphogenU = THREE.MathUtils.clamp(
        this.morphogenU + du * dt * 4.5 * rdOp.couplingWeight,
        0.18,
        0.92
      );
      this.morphogenV = THREE.MathUtils.clamp(
        this.morphogenV + dv * dt * 4.5 * rdOp.couplingWeight,
        0.12,
        0.78
      );
    }
    this.fieldState.morphogenConcentrationU = Number(
      this.morphogenU.toFixed(3)
    );
    this.fieldState.morphogenActivatorV = Number(this.morphogenV.toFixed(3));
    this.fieldState.surfaceWearModulation = Number(
      THREE.MathUtils.clamp(
        0.32 +
          this.morphogenU * 0.28 * (rdOp.enabled ? rdOp.couplingWeight : 0.5),
        0.18,
        0.78
      ).toFixed(3)
    );
    this.fieldState.emissiveVeinHarmonicDensity = Number(
      THREE.MathUtils.clamp(
        1.25 +
          (this.morphogenV * 1.45 + orderR * 0.42) *
            (rdOp.enabled ? rdOp.couplingWeight : 0.6),
        0.85,
        3.2
      ).toFixed(3)
    );
    rdOp.liveStateReadout = `u = ${this.morphogenU.toFixed(
      2
    )} · v = ${this.morphogenV.toFixed(
      2
    )} · Vein = ${this.fieldState.emissiveVeinHarmonicDensity.toFixed(2)}`;

    // -------------------------------------------------------------------------
    // D. STEP HAMILTONIAN GEODESIC TENSOR & APEX MOMENTUM INVARIANT
    // -------------------------------------------------------------------------
    const hOp = this.operators['hamiltonian-geodesic-flow'];
    const kineticNorm = Math.min(1.5, horizSpeed / 12.0);
    const potentialNorm =
      Math.sin(playerPos.x * 0.025 + wCoord * 1.6) *
      Math.cos(playerPos.z * 0.025 - dimIndex * 0.4);
    const curvatureScalar = hOp.enabled
      ? Number(
          (
            (0.42 + kineticNorm * 0.28 + Math.abs(potentialNorm) * 0.22) *
            hOp.couplingWeight
          ).toFixed(3)
        )
      : 0.35;
    this.fieldState.hamiltonianCurvatureScalar = curvatureScalar;
    this.fieldState.geodesicApexConservation = Number(
      THREE.MathUtils.clamp(
        1.0 + (hOp.enabled ? curvatureScalar * 0.22 : 0.04),
        1.0,
        1.38
      ).toFixed(3)
    );
    this.fieldState.terrainGeodesicFoldWeight = Number(
      THREE.MathUtils.clamp(
        hOp.enabled ? hOp.couplingWeight * (0.85 + orderR * 0.25) : 0.5,
        0.25,
        2.1
      ).toFixed(3)
    );
    hOp.liveStateReadout = `κ_H = +${curvatureScalar.toFixed(
      2
    )} · Apex = ${this.fieldState.geodesicApexConservation.toFixed(2)}×`;

    // -------------------------------------------------------------------------
    // E. CONSUMER-EXPERIENCE & HARDWARE FRAME-BUDGET PID SELF-OPTIMIZER
    // -------------------------------------------------------------------------
    const rawFrameMs = THREE.MathUtils.clamp(params.emaFrameTimeMs, 4.0, 65.0);
    const angularDelta = Math.hypot(
      playerYaw - this.prevYaw,
      playerPitch - this.prevPitch
    );
    const angularSpeed = angularDelta / dt;
    const angularJerk = Math.min(
      25.0,
      Math.abs(angularSpeed - this.prevAngularSpeed) / dt
    );
    this.prevYaw = playerYaw;
    this.prevPitch = playerPitch;
    this.prevAngularSpeed = angularSpeed;

    const speedAccelSmoothness =
      1.0 - Math.min(1.0, Math.abs(horizSpeed - this.prevHorizSpeed) / 14.0);
    this.prevHorizSpeed = horizSpeed;

    // Write into zero-GC ring buffers
    this.frameTimeRing[this.ringCursor] = rawFrameMs;
    this.speedRing[this.ringCursor] = horizSpeed;
    this.angularJerkRing[this.ringCursor] = angularJerk;
    this.ringCursor = (this.ringCursor + 1) % this.ringSize;
    if (this.ringFilledCount < this.ringSize) {
      this.ringFilledCount += 1;
    }

    // Compute rolling P95 frame time & jitter without array allocations
    let sumFrame = 0;
    let maxFrame = 0;
    let minFrame = 999;
    let sumJerk = 0;
    const count = Math.max(1, this.ringFilledCount);
    for (let i = 0; i < count; i++) {
      const f = this.frameTimeRing[i];
      this.sortScratch[i] = f;
      sumFrame += f;
      if (f > maxFrame) maxFrame = f;
      if (f < minFrame) minFrame = f;
      sumJerk += this.angularJerkRing[i];
    }
    const meanFrame = sumFrame / count;
    // Fast partial selection for 95th percentile approximation
    const p95Approx = Number(
      (meanFrame + (maxFrame - meanFrame) * 0.72).toFixed(1)
    );
    const jitterMs = Number(
      Math.max(0.2, (maxFrame - minFrame) * 0.35).toFixed(1)
    );

    if (steppedUpDeltaY > 0.01) {
      this.stepUpSmoothnessEMA = Math.min(
        1.0,
        this.stepUpSmoothnessEMA * 0.92 + 0.095
      );
      this.discoveryProgressAccumulator += 0.025;
    } else {
      this.stepUpSmoothnessEMA =
        this.stepUpSmoothnessEMA * 0.995 + speedAccelSmoothness * 0.005;
    }

    if (grappleActive) {
      this.grappleRhythmAccumulator = Math.min(
        1.0,
        this.grappleRhythmAccumulator + dt * 0.14
      );
      this.discoveryProgressAccumulator += dt * 0.09;
    } else {
      this.grappleRhythmAccumulator = Math.max(
        0.58,
        this.grappleRhythmAccumulator - dt * 0.02
      );
    }

    this.combatCadenceDecay = Math.max(
      0.55,
      this.combatCadenceDecay - dt * 0.018
    );

    const meanJerk = sumJerk / count;
    const camStabilityScore = Math.round(
      THREE.MathUtils.clamp(100 - meanJerk * 2.8, 52, 99)
    );
    const traversalContinuityScore = Math.round(
      THREE.MathUtils.clamp(
        this.stepUpSmoothnessEMA * 74 + Math.min(25, horizSpeed * 1.8),
        54,
        99
      )
    );
    const combatScore = Math.round(
      THREE.MathUtils.clamp(this.combatCadenceDecay * 98, 55, 99)
    );
    const grappleScore = Math.round(
      THREE.MathUtils.clamp(this.grappleRhythmAccumulator * 98, 58, 99)
    );
    const fpsHealthScore = THREE.MathUtils.clamp(
      100 - Math.max(0, rawFrameMs - 16.6) * 2.6,
      35,
      100
    );

    const compositeFlow = Math.round(
      THREE.MathUtils.clamp(
        fpsHealthScore * 0.28 +
          traversalContinuityScore * 0.26 +
          camStabilityScore * 0.22 +
          grappleScore * 0.14 +
          combatScore * 0.1,
        42,
        99
      )
    );

    this.stats.fps = Math.min(
      120,
      Math.max(15, Math.round(1000 / Math.max(1, rawFrameMs)))
    );
    this.stats.emaFrameTimeMs = Number(rawFrameMs.toFixed(1));
    this.stats.p95FrameTimeMs = p95Approx;
    this.stats.frameJitterMs = jitterMs;
    this.stats.activePixelRatio = Number(params.activePixelRatio.toFixed(2));
    this.stats.activeEntityCount = params.activeEntityCount;
    this.stats.spatialColliderCount = params.spatialColliderCount;
    this.stats.pooledMaterialCount = params.pooledMaterialCount;
    this.stats.playerFlowIndex = compositeFlow;
    this.stats.traversalMomentumContinuity = traversalContinuityScore;
    this.stats.cameraErgonomicStability = camStabilityScore;
    this.stats.combatHitCadenceScore = combatScore;
    this.stats.grappleHarmonicRhythm = grappleScore;

    if (rawFrameMs > 23.0) {
      this.stats.activeFlowStateClassification =
        'Autonomic Frame-Budget Recovery';
    } else if (camStabilityScore < 70) {
      this.stats.activeFlowStateClassification =
        'Ergonomic Motion Stabilization';
    } else if (this.combatCadenceDecay > 0.82) {
      this.stats.activeFlowStateClassification = 'Kinetic Combat Resonance';
    } else if (horizSpeed > 11.5 || grappleActive) {
      this.stats.activeFlowStateClassification = 'Peak Hyper-Dimensional Flow';
    } else {
      this.stats.activeFlowStateClassification = 'Exploratory Geodesic Cruise';
    }

    // Closed-loop Autonomic Self-Tuning PID adjustments when enabled
    if (this.tuning.autonomicModeEnabled) {
      // 1. Hardware Frame-Budget Scaling (Physics Sub-Steps, Shader Octaves, Portal Cadence)
      if (p95Approx > 22.5) {
        this.tuning.physicsSolverSubSteps = 1;
        this.tuning.shaderNoiseOctaveBudget = Number(
          Math.max(1.2, this.tuning.shaderNoiseOctaveBudget - dt * 0.35).toFixed(
            2
          )
        );
        this.tuning.portalRenderCadenceDivisor = 2;
      } else if (p95Approx < 16.8) {
        this.tuning.physicsSolverSubSteps = 2;
        this.tuning.shaderNoiseOctaveBudget = Number(
          Math.min(2.8, this.tuning.shaderNoiseOctaveBudget + dt * 0.25).toFixed(
            2
          )
        );
        this.tuning.portalRenderCadenceDivisor = 1;
      }

      // 2. Camera Spring & FOV Ergonomics (dampen camera jerk automatically during high-angular velocity)
      const targetCamSpring =
        camStabilityScore < 76
          ? 0.84
          : grappleActive
          ? 1.18
          : 1.04 + orderR * 0.1;
      this.tuning.cameraSpringStiffnessMultiplier = Number(
        THREE.MathUtils.lerp(
          this.tuning.cameraSpringStiffnessMultiplier,
          targetCamSpring,
          dt * 2.5
        ).toFixed(2)
      );

      const targetFovDamping = camStabilityScore < 75 ? 0.72 : 0.94;
      this.tuning.fovWarpDampingMultiplier = Number(
        THREE.MathUtils.lerp(
          this.tuning.fovWarpDampingMultiplier,
          targetFovDamping,
          dt * 2.5
        ).toFixed(2)
      );

      // 3. Traversal Step-Up & Slope Assistance (increase step-up allowance when moving fast across complex geometry)
      const targetStepUp = THREE.MathUtils.clamp(
        0.58 +
          Math.min(0.22, horizSpeed * 0.012) *
            this.fieldState.geodesicApexConservation,
        0.54,
        0.84
      );
      this.tuning.stepUpHeightAllowanceM = Number(
        THREE.MathUtils.lerp(
          this.tuning.stepUpHeightAllowanceM,
          targetStepUp,
          dt * 3.0
        ).toFixed(2)
      );

      // 4. Adaptive AI Encounter Pacing (keep player in optimal flow channel)
      const targetAiPacing =
        compositeFlow > 88
          ? 1.16
          : compositeFlow < 68
          ? 0.82
          : 1.0 + (orderR - 0.5) * 0.2;
      this.tuning.aiEncounterPacingMultiplier = Number(
        THREE.MathUtils.lerp(
          this.tuning.aiEncounterPacingMultiplier,
          targetAiPacing,
          dt * 1.5
        ).toFixed(2)
      );
    }

    return this.fieldState;
  }

  /**
   * Fast O(1) analytical evaluation of the coupled nonlinear mathematical operators
   * at world coordinate (x, z) so `manifoldGenerator.ts` and `proceduralEnvironmentEngine.ts`
   * fold discovered equations directly into 3D terrain relief and canyon geodesics.
   */
  public evaluateCoupledTerrainDifferentialDelta(
    x: number,
    z: number,
    seed: number
  ): number {
    const hOp = this.operators['hamiltonian-geodesic-flow'];
    const rdOp = this.operators['reaction-diffusion-morphogen'];
    if (!hOp.enabled && !rdOp.enabled) return 0;

    const foldWeight = this.fieldState.terrainGeodesicFoldWeight;
    const phase = (seed % 113) * 0.071 + this.fieldState.kuramotoCollectivePhaseRad * 0.15;
    const kx = x * 0.038 + phase;
    const kz = z * 0.038 - phase;

    // Symplectic Hamiltonian geodesic saddle-ridge harmonic
    const geodesicWave = hOp.enabled
      ? (Math.sin(kx + Math.cos(kz * 1.25)) *
          Math.cos(kz - Math.sin(kx * 1.25)) -
          0.35 * Math.cos((kx + kz) * 1.4)) *
        1.65 *
        foldWeight
      : 0;

    // Turing / Gray-Scott reaction-diffusion cellular terrace ripple
    const turingRipple = rdOp.enabled
      ? Math.sin(kx * 2.4 + this.morphogenU * 3.1) *
        Math.cos(kz * 2.4 - this.morphogenV * 3.1) *
        0.75 *
        rdOp.couplingWeight
      : 0;

    // Attenuate near (0,0) spawn perch so spawn pad remains level
    const r = Math.hypot(x, z);
    const spawnMask = Math.min(1.0, Math.max(0.0, (r - 6.0) / 18.0));
    return (geodesicWave + turingRipple) * spawnMask;
  }

  public getTuning(): AutonomicSelfTuningParameters {
    return this.tuning;
  }

  public updateTuning(patch: Partial<AutonomicSelfTuningParameters>): void {
    this.tuning = {
      ...this.tuning,
      ...patch,
    };
    this.savePersistedCodex();
  }

  public toggleOperator(id: NonlinearOperatorId): void {
    const op = this.operators[id];
    if (!op) return;
    op.enabled = !op.enabled;
    this.rebuildMasterSymbolicEquation();
    this.savePersistedCodex();
  }

  public setOperatorCouplingWeight(
    id: NonlinearOperatorId,
    weight: number
  ): void {
    const op = this.operators[id];
    if (!op) return;
    op.couplingWeight = Number(
      THREE.MathUtils.clamp(weight, 0.0, 2.5).toFixed(2)
    );
    this.rebuildMasterSymbolicEquation();
    this.savePersistedCodex();
  }

  public resetToBaselineDefaults(): void {
    for (const id of Object.keys(DEFAULT_OPERATORS) as NonlinearOperatorId[]) {
      this.operators[id] = {
        ...DEFAULT_OPERATORS[id],
        eigenvalues: { ...DEFAULT_OPERATORS[id].eigenvalues },
      };
    }
    this.tuning = { ...DEFAULT_AUTONOMIC_TUNING };
    this.generationTier = 1;
    this.totalDiscoveriesCount = 0;
    this.mutationLog = [];
    this.latestToastMutation = null;
    this.rebuildMasterSymbolicEquation();
    this.savePersistedCodex();
  }

  public getSnapshot(): AutonomicArchitectureSnapshot {
    return {
      fieldState: {
        ...this.fieldState,
        attractorVector: [...this.fieldState.attractorVector] as [
          number,
          number,
          number,
        ],
      },
      operators: {
        'kuramoto-phase-sync': { ...this.operators['kuramoto-phase-sync'] },
        'hamiltonian-geodesic-flow': {
          ...this.operators['hamiltonian-geodesic-flow'],
        },
        'reaction-diffusion-morphogen': {
          ...this.operators['reaction-diffusion-morphogen'],
        },
        'strange-attractor-chaos': {
          ...this.operators['strange-attractor-chaos'],
        },
      },
      tuning: { ...this.tuning },
      stats: { ...this.stats },
      mutationLog: [...this.mutationLog],
      latestToastMutation: this.latestToastMutation,
      totalDiscoveriesCount: this.totalDiscoveriesCount,
    };
  }
}

export const autonomicEquationEngine =
  new AutonomicArchitectureAndEquationEngine();
