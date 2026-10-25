import {
  BehaviorEvaluationOutput,
  Edge4D,
  Node4D,
} from '../types/manifold';
import { autonomicEquationEngine } from './autonomicArchitectureAndEquationEngine';

export interface NodeGraphPreset {
  id: string;
  name: string;
  description: string;
  defaultW: number;
  nodes: Node4D[];
  edges: Edge4D[];
}

export const INITIAL_4D_NODES: Node4D[] = [
  // 1. 4D Sensor / Phase Inputs (Left column)
  {
    id: 'sensor-w-neg',
    label: 'Sub-Space Phase (W < 0)',
    category: 'sensor-4d',
    subtype: 'w-resonance',
    x: 68,
    y: 72,
    zWeight: 1.2,
    wPhase: -0.72,
    wSigma: 0.42,
    temporalFreq: 0.4,
    paramValue: 1.0,
    activation: 0,
    description: 'Resonates when 4th-dimension W coordinate shifts toward negative entropy.',
  },
  {
    id: 'sensor-w-zero',
    label: 'Manifold Equilibrium (W ≈ 0)',
    category: 'sensor-4d',
    subtype: 'w-resonance',
    x: 68,
    y: 196,
    zWeight: 1.35,
    wPhase: 0.0,
    wSigma: 0.48,
    temporalFreq: 0.8,
    paramValue: 1.0,
    activation: 0,
    description: 'Resonates at central W=0 manifold plane for stable active-ragdoll locomotion.',
  },
  {
    id: 'sensor-w-pos',
    label: 'Hyper-Phase Surge (W > 0)',
    category: 'sensor-4d',
    subtype: 'w-resonance',
    x: 68,
    y: 320,
    zWeight: 1.3,
    wPhase: 0.72,
    wSigma: 0.45,
    temporalFreq: 1.8,
    paramValue: 1.0,
    activation: 0,
    description: 'Resonates in positive W-space, unlocking high-frequency pursuit & anti-gravity leaps.',
  },
  {
    id: 'sensor-impact',
    label: 'Kinetic Shockwave Sensor',
    category: 'sensor-4d',
    subtype: 'impact-detector',
    x: 68,
    y: 438,
    zWeight: 1.6,
    wPhase: -0.2,
    wSigma: 1.2,
    temporalFreq: 2.5,
    paramValue: 0.85,
    activation: 0,
    description: 'Spikes on physical projectile collision, terrain drop, or shockwave blast.',
  },

  // 2. 4D Possibility Gateways (Center-Left column)
  {
    id: 'gate-entropy',
    label: 'Ragdoll Decoherence Gate',
    category: 'gateway-4d',
    subtype: 'quantum-fork',
    x: 310,
    y: 95,
    zWeight: 1.15,
    wPhase: -0.65,
    wSigma: 0.5,
    temporalFreq: 0.6,
    paramValue: 0.9,
    activation: 0,
    description: 'Routes negative W-phase or heavy kinetic shock into full joint torque release.',
  },
  {
    id: 'gate-homeostasis',
    label: 'Spinal P-D Stabilizer Gate',
    category: 'gateway-4d',
    subtype: 'superposition-blender',
    x: 310,
    y: 225,
    zWeight: 1.3,
    wPhase: 0.05,
    wSigma: 0.55,
    temporalFreq: 1.0,
    paramValue: 0.88,
    activation: 0,
    description: 'Maintains bipedal/multiped upright equilibrium and inverse-stride rhythm.',
  },
  {
    id: 'gate-hyperdrive',
    label: 'Tesseract Overclock Gate',
    category: 'gateway-4d',
    subtype: 'hysteresis-latch',
    x: 310,
    y: 355,
    zWeight: 1.25,
    wPhase: 0.68,
    wSigma: 0.5,
    temporalFreq: 2.2,
    paramValue: 1.1,
    activation: 0,
    description: 'Amplifies stride velocity, vortex steering, and upward tensor buoyancy.',
  },

  // 3. Behavior & Locomotion Drivers (Center-Right column)
  {
    id: 'beh-patrol',
    label: 'Harmonic Stride & Flock',
    category: 'behavior-driver',
    subtype: 'inverse-stride',
    x: 560,
    y: 165,
    zWeight: 1.2,
    wPhase: 0.0,
    wSigma: 0.6,
    temporalFreq: 1.4,
    paramValue: 4.5, // Base speed m/s
    activation: 0,
    description: 'Drives multi-legged procedural foot placement and terrain-following navigation.',
  },
  {
    id: 'beh-vortex',
    label: 'Apex Pursuit & Vortex Leap',
    category: 'behavior-driver',
    subtype: 'seek-player',
    x: 560,
    y: 310,
    zWeight: 1.35,
    wPhase: 0.65,
    wSigma: 0.52,
    temporalFreq: 2.4,
    paramValue: 8.2, // High speed m/s
    activation: 0,
    description: 'Locks onto explorer coordinates with high-impulse bounding strides.',
  },

  // 4. Ragdoll & Physical Actuators (Right column)
  {
    id: 'act-limp',
    label: 'Full Ragdoll Collapse',
    category: 'ragdoll-actuator',
    subtype: 'ragdoll-release',
    x: 810,
    y: 88,
    zWeight: 1.5,
    wPhase: -0.7,
    wSigma: 0.48,
    temporalFreq: 0.5,
    paramValue: 0.04, // Target stiffness near 0
    activation: 0,
    description: 'Drops joint P-D stiffness to zero; skeleton tumbles freely under gravity and terrain normals.',
  },
  {
    id: 'act-pd-balance',
    label: 'Active P-D Muscle Torque',
    category: 'ragdoll-actuator',
    subtype: 'pd-muscle',
    x: 810,
    y: 230,
    zWeight: 1.4,
    wPhase: 0.1,
    wSigma: 0.62,
    temporalFreq: 1.1,
    paramValue: 0.86, // Target stiffness 0.86
    activation: 0,
    description: 'Applies proportional-derivative angular springs to keep pelvis, torso, and head upright.',
  },
  {
    id: 'act-antigrav',
    label: 'Tensor Buoyancy & Impulse',
    category: 'ragdoll-actuator',
    subtype: 'antigrav-torque',
    x: 810,
    y: 375,
    zWeight: 1.25,
    wPhase: 0.75,
    wSigma: 0.45,
    temporalFreq: 2.8,
    paramValue: 0.65, // Lift & twitch factor
    activation: 0,
    description: 'Injects upward 4D buoyancy force and angularacrobatic recovery torque.',
  },
];

export const INITIAL_4D_EDGES: Edge4D[] = [
  { id: 'e1', from: 'sensor-w-neg', to: 'gate-entropy', weight: 1.25, phaseLag: 0.1 },
  { id: 'e2', from: 'sensor-impact', to: 'gate-entropy', weight: 1.45, phaseLag: 0.0 },
  { id: 'e3', from: 'sensor-w-zero', to: 'gate-homeostasis', weight: 1.3, phaseLag: 0.15 },
  { id: 'e4', from: 'sensor-w-pos', to: 'gate-hyperdrive', weight: 1.35, phaseLag: 0.1 },
  { id: 'e5', from: 'gate-entropy', to: 'act-limp', weight: 1.4, phaseLag: 0.05 },
  { id: 'e6', from: 'gate-entropy', to: 'act-pd-balance', weight: -0.95, phaseLag: 0.05 },
  { id: 'e7', from: 'gate-homeostasis', to: 'beh-patrol', weight: 1.2, phaseLag: 0.2 },
  { id: 'e8', from: 'gate-homeostasis', to: 'act-pd-balance', weight: 1.35, phaseLag: 0.1 },
  { id: 'e9', from: 'gate-hyperdrive', to: 'beh-vortex', weight: 1.35, phaseLag: 0.15 },
  { id: 'e10', from: 'gate-hyperdrive', to: 'act-pd-balance', weight: 1.1, phaseLag: 0.1 },
  { id: 'e11', from: 'gate-hyperdrive', to: 'act-antigrav', weight: 1.3, phaseLag: 0.2 },
];

export const NODE_4D_PRESETS: NodeGraphPreset[] = [
  {
    id: 'preset-continuum',
    name: '4D Superposition Continuum',
    description: 'Full 4D possibility spectrum: W < -0.35 triggers Ragdoll Collapse, W ≈ 0 stabilizes Active-Ragdoll Stride, W > +0.35 engages Hyper-Kinetic Pursuit.',
    defaultW: 0.0,
    nodes: INITIAL_4D_NODES,
    edges: INITIAL_4D_EDGES,
  },
  {
    id: 'preset-ragdoll-chaos',
    name: 'Entropy Collapse (Full Ragdoll)',
    description: 'Shifts manifold into negative W-phase decoherence: joint torque releases and entities tumble down terrain slopes.',
    defaultW: -0.78,
    nodes: INITIAL_4D_NODES,
    edges: INITIAL_4D_EDGES,
  },
  {
    id: 'preset-hyper-swarm',
    name: 'Hyper-Phase Vortex Swarm',
    description: 'Positive W-phase resonance: high-frequency bounding strides, low-gravity suspension bursts, and player convergence.',
    defaultW: 0.76,
    nodes: INITIAL_4D_NODES,
    edges: INITIAL_4D_EDGES,
  },
];

/**
 * Evaluates the 4D Node Graph at a given 4th-dimension possibility coordinate `wCoord` [-1, 1],
 * temporal coordinate `timeSec`, and recent kinetic `impactShock` [0, 1].
 * When `globalRagdollActive` is enabled, integrates Hookean spring-damper physics across
 * the 4D node graph positions and edge couplings, generating procedural limb-sway
 * and subtle elastic deformation ratios for formlike character/entity movement.
 */
export function evaluate4DNodeGraph(
  nodes: Node4D[],
  edges: Edge4D[],
  wCoord: number,
  timeSec: number,
  impactShock: number,
  globalRagdollActive: boolean = false
): {
  updatedNodes: Node4D[];
  output: BehaviorEvaluationOutput;
} {
  const activationMap = new Map<string, number>();

  // Step 1: Compute base 4D Gaussian resonance for Sensor nodes
  for (const node of nodes) {
    const dw = wCoord - node.wPhase;
    const sigma = Math.max(0.15, node.wSigma);
    const wResonance = Math.exp(-(dw * dw) / (2 * sigma * sigma));
    const harmonic = 0.82 + 0.18 * Math.sin(timeSec * node.temporalFreq * Math.PI * 2);

    if (node.category === 'sensor-4d') {
      if (node.subtype === 'impact-detector') {
        const val = Math.min(
          1,
          impactShock * 1.35 +
            (wCoord < -0.55 || globalRagdollActive ? 0.55 : 0.05)
        );
        activationMap.set(node.id, val);
      } else {
        const val = Math.min(1, Math.max(0, wResonance * harmonic * node.zWeight));
        activationMap.set(node.id, val);
      }
    } else {
      // Base intrinsic 4D field resonance for downstream nodes
      activationMap.set(node.id, wResonance * 0.22 * harmonic);
    }
  }

  // Step 2: Propagate through Gateway -> Behavior -> Actuator layers (2 topological passes)
  for (let pass = 0; pass < 2; pass++) {
    const nextMap = new Map<string, number>(activationMap);
    for (const edge of edges) {
      const srcAct = activationMap.get(edge.from) ?? 0;
      const dstPrev = nextMap.get(edge.to) ?? 0;
      const dstNode = nodes.find((n) => n.id === edge.to);
      if (!dstNode) continue;

      const dw = wCoord - dstNode.wPhase;
      const sigma = Math.max(0.18, dstNode.wSigma);
      const wGate = Math.exp(-(dw * dw) / (2 * sigma * sigma * 1.6));
      const phaseMod =
        0.9 + 0.1 * Math.cos(timeSec * dstNode.temporalFreq * Math.PI * 2 - edge.phaseLag * 4);

      const delta = srcAct * edge.weight * (0.45 + 0.55 * wGate) * phaseMod;
      nextMap.set(edge.to, Math.max(0, Math.min(1, dstPrev + delta * 0.55)));
    }
    for (const [k, v] of nextMap.entries()) {
      activationMap.set(k, v);
    }
  }

  // Step 2.5: Second-Order Spring-Damper Position Transitions when `globalRagdollActive` is enabled
  const dt = 0.085; // 12Hz evaluation step
  let totalSpringEnergy = 0;

  const updatedNodes = nodes.map((n, idx) => {
    const act = Number((activationMap.get(n.id) ?? 0).toFixed(3));
    const anchorX = n.anchorX ?? n.x;
    const anchorY = n.anchorY ?? n.y;
    let vx = n.vx ?? 0;
    let vy = n.vy ?? 0;
    let curX = n.x;
    let curY = n.y;

    if (globalRagdollActive) {
      // Target ragdoll-displaced equilibrium: gravitational sag + harmonic pendulum sway + W-shear
      const pendulumPhase = timeSec * (1.8 + n.temporalFreq * 0.55) + idx * 0.95;
      const ragdollTargetX =
        anchorX +
        Math.sin(pendulumPhase) * (22 + act * 26) +
        wCoord * 18 * n.zWeight;
      const ragdollTargetY =
        anchorY +
        26 * (1.15 - act * 0.45) +
        Math.cos(pendulumPhase * 1.3) * (16 + impactShock * 34);

      // Edge-coupled Hookean tension from connected neighbor nodes
      let edgeForceX = 0;
      let edgeForceY = 0;
      for (const edge of edges) {
        if (edge.from === n.id || edge.to === n.id) {
          const otherId = edge.from === n.id ? edge.to : edge.from;
          const other = nodes.find((o) => o.id === otherId);
          if (other) {
            const otherAnchorX = other.anchorX ?? other.x;
            const otherAnchorY = other.anchorY ?? other.y;
            const restDx = otherAnchorX - anchorX;
            const restDy = otherAnchorY - anchorY;
            const curDx = other.x - curX;
            const curDy = other.y - curY;
            edgeForceX += (curDx - restDx) * 1.65 * Math.abs(edge.weight);
            edgeForceY += (curDy - restDy) * 1.65 * Math.abs(edge.weight);
          }
        }
      }

      // Spring stiffness k and viscous damper c
      const kSpring = 18.5;
      const cDamper = 4.2;
      const ax =
        (ragdollTargetX - curX) * kSpring + edgeForceX - vx * cDamper;
      const ay =
        (ragdollTargetY - curY) * kSpring + edgeForceY - vy * cDamper;

      vx = (vx + ax * dt) * 0.92;
      vy = (vy + ay * dt) * 0.92;
      curX = Number((curX + vx * dt).toFixed(1));
      curY = Number((curY + vy * dt).toFixed(1));
    } else {
      // Smooth overdamped return to anchor position when globalRagdollActive is turned off
      const dx = anchorX - curX;
      const dy = anchorY - curY;
      if (Math.hypot(dx, dy) > 0.4 || Math.hypot(vx, vy) > 0.4) {
        const ax = dx * 24.0 - vx * 7.5;
        const ay = dy * 24.0 - vy * 7.5;
        vx = (vx + ax * dt) * 0.82;
        vy = (vy + ay * dt) * 0.82;
        curX = Number((curX + vx * dt).toFixed(1));
        curY = Number((curY + vy * dt).toFixed(1));
      } else {
        curX = anchorX;
        curY = anchorY;
        vx = 0;
        vy = 0;
      }
    }

    const dispMag = Math.hypot(curX - anchorX, curY - anchorY);
    const velMag = Math.hypot(vx, vy);
    const elasticStretch = Number(
      Math.min(1.0, dispMag / 52 + velMag / 160).toFixed(3)
    );
    totalSpringEnergy += elasticStretch;

    return {
      ...n,
      x: curX,
      y: curY,
      anchorX,
      anchorY,
      vx: Number(vx.toFixed(2)),
      vy: Number(vy.toFixed(2)),
      elasticStretch,
      activation: act,
    };
  });

  // Step 3: Aggregate physical & behavioral outputs from active nodes
  const limpNode = updatedNodes.find((n) => n.subtype === 'ragdoll-release');
  const pdNode = updatedNodes.find((n) => n.subtype === 'pd-muscle');
  const antigravNode = updatedNodes.find((n) => n.subtype === 'antigrav-torque');
  const patrolNode = updatedNodes.find((n) => n.subtype === 'inverse-stride');
  const seekNode = updatedNodes.find((n) => n.subtype === 'seek-player');

  const limpAct = limpNode?.activation ?? 0;
  const pdAct = pdNode?.activation ?? 0.7;
  const antigravAct = antigravNode?.activation ?? 0;
  const patrolAct = patrolNode?.activation ?? 0.5;
  const seekAct = seekNode?.activation ?? 0;

  const coupledField = autonomicEquationEngine.fieldState;
  const autonomicTuning = autonomicEquationEngine.getTuning();
  const kuramotoBoost = 0.88 + coupledField.kuramotoOrderParameterR * 0.24;
  const aiPacingMult = autonomicTuning.aiEncounterPacingMultiplier ?? 1.0;

  // Compute effective muscle stiffness [0.02 .. 0.98] coupled with Kuramoto phase coherence
  const rawStiffness =
    pdAct *
    (pdNode?.paramValue ?? 0.85) *
    (1 - limpAct * 0.92) *
    kuramotoBoost;
  const muscleStiffness = Number(
    Math.max(0.02, Math.min(0.98, rawStiffness)).toFixed(3)
  );

  // Compute locomotion speed modulated by Autonomic AI Encounter Pacing
  const baseSpeed =
    (patrolAct * (patrolNode?.paramValue ?? 4.5) +
      seekAct * (seekNode?.paramValue ?? 8.0) * 0.75) *
    aiPacingMult;
  const locomotionSpeed = Number(
    (baseSpeed * (muscleStiffness > 0.28 ? 1.0 : 0.08)).toFixed(2)
  );

  // Determine dominant steering mode
  let steeringMode: BehaviorEvaluationOutput['steeringMode'] = 'patrol';
  if (seekAct > patrolAct + 0.15) {
    steeringMode = wCoord > 0.6 ? 'vortex-orbit' : 'seek-player';
  } else if (wCoord < -0.45) {
    steeringMode = 'evade';
  } else if (patrolAct > 0.4) {
    steeringMode = 'flock';
  }

  // Find highest activation node for HUD telemetry
  let dominantNode: Node4D | null = null;
  for (const n of updatedNodes) {
    if (!dominantNode || n.activation > dominantNode.activation) {
      dominantNode = n;
    }
  }

  const avgSpringStretch =
    updatedNodes.length > 0 ? totalSpringEnergy / updatedNodes.length : 0;
  const limbSwayPhase = Number(
    (
      Math.sin(timeSec * (globalRagdollActive ? 3.4 : 2.1)) *
      (0.35 + avgSpringStretch * 0.85)
    ).toFixed(3)
  );
  const elasticDeformationRatio = Number(
    Math.min(
      1.0,
      (globalRagdollActive ? 0.38 : 0.14) +
        avgSpringStretch * 0.62 +
        impactShock * 0.35
    ).toFixed(3)
  );

  let activeBranchLabel = 'Equilibrium Active-Ragdoll Stride';
  if (globalRagdollActive) {
    activeBranchLabel = `Spring-Damper Elastic Ragdoll (Stretch ${(
      elasticDeformationRatio * 100
    ).toFixed(0)}%)`;
  } else if (muscleStiffness < 0.25) {
    activeBranchLabel = 'Decoherent Ragdoll Collapse (Zero Torque)';
  } else if (antigravAct > 0.55) {
    activeBranchLabel = 'Hyper-Phase Vortex & Tensor Lift';
  } else if (seekAct > 0.5) {
    activeBranchLabel = 'Apex Kinetic Pursuit Branch';
  }

  return {
    updatedNodes,
    output: {
      muscleStiffness,
      locomotionSpeed,
      strideAmplitude: Number((0.45 + patrolAct * 0.5 + seekAct * 0.65).toFixed(2)),
      steeringMode,
      antiGravityLift: Number((antigravAct * (antigravNode?.paramValue ?? 0.65)).toFixed(2)),
      angularImpulseBurst: Number((limpAct * 0.4 + antigravAct * 0.5).toFixed(2)),
      selfRightingTorque: Number((muscleStiffness * 1.15).toFixed(2)),
      activeBranchLabel,
      dominantNodeId: dominantNode?.id ?? null,
      limbSwayPhase,
      elasticDeformationRatio,
      springEnergy: Number(avgSpringStretch.toFixed(3)),
    },
  };
}
