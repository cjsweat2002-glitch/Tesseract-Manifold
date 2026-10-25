import * as THREE from 'three';
import {
  InterconnectednessTelemetry,
  ManifoldWorldSpec,
  PlacedWorldBuilding,
} from '../types/manifold';
import { ArticulatedRagdollEntity } from './ragdollPhysics';

export interface MycelialFootstepNode {
  pos: THREE.Vector3;
  ringMesh: THREE.Mesh;
  budMesh: THREE.Mesh;
  age: number;
  maxAge: number;
}

export interface SymbioticFilamentLine {
  line: THREE.Line;
  positions: Float32Array;
  pulseBead: THREE.Mesh;
}

export interface InterconnectednessWebRig {
  group: THREE.Group;
  playerFilaments: SymbioticFilamentLine[];
  buildingFilaments: THREE.Line[];
  entityBondLines: THREE.Line[];
  zenithChordLine: THREE.Line;
  zenithChordPositions: Float32Array;
  mycelialTrailLine: THREE.Line;
  mycelialTrailPositions: Float32Array;
  footstepNodes: MycelialFootstepNode[];
  lastFootstepPos: THREE.Vector3;
  pinnedEntityIds: Set<string>;
}

const MAX_PLAYER_FILAMENTS = 6;
const FILAMENT_SEGMENTS = 24;
const MAX_ENTITY_BONDS = 10;
const BOND_SEGMENTS = 14;
const MAX_BUILDING_FILAMENTS = 4;
const MAX_FOOTSTEP_NODES = 18;

/**
 * Builds the 3D Interconnectedness Web:
 * - Luminous symbiotic filaments linking the player's body/hands to nearby fauna
 * - Travelling synaptic pulse beads along each filament
 * - Inter-entity neural constellation threads across the biome
 * - 5D Zenith umbilical filament connecting the player to the 5D Cloud Canopy
 * - Mycelial footstep root-nodes and ground-web trail planted as the character moves
 */
export function buildInterconnectednessWebRig(
  world: ManifoldWorldSpec
): InterconnectednessWebRig {
  const group = new THREE.Group();
  group.name = 'interconnectedness-web-rig';

  const primaryCol = new THREE.Color(world.playableCharacter.voidOrbColor);
  const secondaryCol = new THREE.Color(world.palette.accentColor);
  const blendCol = primaryCol.clone().lerp(secondaryCol, 0.45);

  // 1. Player-to-Entity Symbiotic Filaments + Synaptic Pulse Beads
  const playerFilaments: SymbioticFilamentLine[] = [];
  for (let i = 0; i < MAX_PLAYER_FILAMENTS; i++) {
    const positions = new Float32Array(FILAMENT_SEGMENTS * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.LineBasicMaterial({
      color: i % 2 === 0 ? primaryCol : secondaryCol,
      transparent: true,
      opacity: 0.44,
      blending: THREE.AdditiveBlending,
    });

    const line = new THREE.Line(geo, mat);
    line.frustumCulled = false;
    line.visible = false;
    group.add(line);

    const beadGeo = new THREE.OctahedronGeometry(0.08, 1);
    const beadMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const pulseBead = new THREE.Mesh(beadGeo, beadMat);
    pulseBead.visible = false;
    group.add(pulseBead);

    playerFilaments.push({ line, positions, pulseBead });
  }

  // 2. Player-to-Building Resonance Threads
  const buildingFilaments: THREE.Line[] = [];
  for (let i = 0; i < MAX_BUILDING_FILAMENTS; i++) {
    const positions = new Float32Array(BOND_SEGMENTS * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({
      color: blendCol,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const line = new THREE.Line(geo, mat);
    line.frustumCulled = false;
    line.visible = false;
    group.add(line);
    buildingFilaments.push(line);
  }

  // 3. Entity-to-Entity Neural Constellation Bonds
  const entityBondLines: THREE.Line[] = [];
  for (let i = 0; i < MAX_ENTITY_BONDS; i++) {
    const positions = new Float32Array(BOND_SEGMENTS * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({
      color: secondaryCol,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });
    const line = new THREE.Line(geo, mat);
    line.frustumCulled = false;
    line.visible = false;
    group.add(line);
    entityBondLines.push(line);
  }

  // 4. 5D Zenith Umbilical Chord (links explorer's crown to the 5D Cloud Canopy)
  const zenithChordPositions = new Float32Array(FILAMENT_SEGMENTS * 3);
  const zenithGeo = new THREE.BufferGeometry();
  zenithGeo.setAttribute(
    'position',
    new THREE.BufferAttribute(zenithChordPositions, 3)
  );
  const zenithMat = new THREE.LineBasicMaterial({
    color: primaryCol,
    transparent: true,
    opacity: 0.14,
    blending: THREE.AdditiveBlending,
  });
  const zenithChordLine = new THREE.Line(zenithGeo, zenithMat);
  zenithChordLine.frustumCulled = false;
  group.add(zenithChordLine);

  // 5. Mycelial Footstep Root-Ripple Pool & Sub-Surface Thread
  const footstepNodes: MycelialFootstepNode[] = [];
  const ringGeo = new THREE.RingGeometry(0.18, 0.42, 20);
  const budGeo = new THREE.OctahedronGeometry(0.09, 0);

  for (let i = 0; i < MAX_FOOTSTEP_NODES; i++) {
    const ringMat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? primaryCol : secondaryCol,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.visible = false;
    group.add(ringMesh);

    const budMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const budMesh = new THREE.Mesh(budGeo, budMat);
    budMesh.visible = false;
    group.add(budMesh);

    footstepNodes.push({
      pos: new THREE.Vector3(),
      ringMesh,
      budMesh,
      age: 999,
      maxAge: 9.0,
    });
  }

  const mycelialTrailPositions = new Float32Array(MAX_FOOTSTEP_NODES * 3);
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute(
    'position',
    new THREE.BufferAttribute(mycelialTrailPositions, 3)
  );
  const trailMat = new THREE.LineBasicMaterial({
    color: primaryCol,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
  });
  const mycelialTrailLine = new THREE.Line(trailGeo, trailMat);
  mycelialTrailLine.frustumCulled = false;
  mycelialTrailLine.visible = false;
  group.add(mycelialTrailLine);

  return {
    group,
    playerFilaments,
    buildingFilaments,
    entityBondLines,
    zenithChordLine,
    zenithChordPositions,
    mycelialTrailLine,
    mycelialTrailPositions,
    footstepNodes,
    lastFootstepPos: new THREE.Vector3(999, 999, 999),
    pinnedEntityIds: new Set<string>(),
  };
}

/**
 * Toggles or weaves an explicit Harmonic Tether between the player and the target/nearest entity,
 * harmonizing their movement, restoring ragdoll balance, and emitting a resonant pulse.
 */
export function weaveHarmonicTetherWithEntity(
  rig: InterconnectednessWebRig,
  entities: ArticulatedRagdollEntity[],
  explorerPos: THREE.Vector3,
  lookDir: THREE.Vector3
): { tetheredEntity: ArticulatedRagdollEntity | null; isNewlyPinned: boolean } {
  let bestEntity: ArticulatedRagdollEntity | null = null;
  let bestScore = Infinity;

  for (const ent of entities) {
    const torso = ent.particles[1]?.pos ?? ent.particles[0].pos;
    const toEnt = torso.clone().sub(explorerPos);
    const dist = toEnt.length();
    if (dist > 65) continue;
    const dir = toEnt.clone().normalize();
    const alignment = lookDir.dot(dir); // -1 to +1
    const score = dist * (1.35 - Math.max(0, alignment) * 0.75);
    if (score < bestScore) {
      bestScore = score;
      bestEntity = ent;
    }
  }

  if (!bestEntity) {
    return { tetheredEntity: null, isNewlyPinned: false };
  }

  const alreadyPinned = rig.pinnedEntityIds.has(bestEntity.id);
  if (!alreadyPinned) {
    if (rig.pinnedEntityIds.size >= MAX_PLAYER_FILAMENTS) {
      const oldest = rig.pinnedEntityIds.values().next().value;
      if (oldest) rig.pinnedEntityIds.delete(oldest);
    }
    rig.pinnedEntityIds.add(bestEntity.id);
  }

  // Immediate harmonic uplift: recover ragdoll stun, align heading, and gently lift toward equilibrium
  bestEntity.stunTimer = Math.max(0, bestEntity.stunTimer * 0.25);
  bestEntity.forcedRagdoll = false;
  bestEntity.interactionMode = 'symbiotic-ritual';
  bestEntity.activeBehaviorLabel = 'Tethered Kinship Resonance';

  const pullTowardPlayer = explorerPos
    .clone()
    .sub(bestEntity.particles[0].pos)
    .setY(0);
  if (pullTowardPlayer.lengthSq() > 16) {
    pullTowardPlayer.normalize().multiplyScalar(0.18);
    for (const p of bestEntity.particles) {
      p.pos.add(new THREE.Vector3(pullTowardPlayer.x, 0.08, pullTowardPlayer.z));
    }
  }

  return { tetheredEntity: bestEntity, isNewlyPinned: !alreadyPinned };
}

/**
 * Updates the 3D Interconnectedness Web every frame and computes mutual movement physics
 * (slipstream boost, ragdoll co-regulation, mycelial footstep ripples, and telemetry).
 */
export function updateInterconnectednessWeb(
  rig: InterconnectednessWebRig,
  explorerPos: THREE.Vector3,
  explorerVel: THREE.Vector3,
  explorerYaw: number,
  isGrounded: boolean,
  groundY: number,
  entities: ArticulatedRagdollEntity[],
  placedBuildings: PlacedWorldBuilding[],
  wCoord: number,
  vCoord5D: number,
  timeSec: number,
  dt: number
): InterconnectednessTelemetry {
  // 1. Track footstep cadence for interconnectedness telemetry without cluttering the floor with flat ground rings
  const horizDistFromLastStep = Math.hypot(
    explorerPos.x - rig.lastFootstepPos.x,
    explorerPos.z - rig.lastFootstepPos.z
  );

  if (isGrounded && horizDistFromLastStep > 2.35) {
    rig.lastFootstepPos.set(explorerPos.x, groundY, explorerPos.z);
    let oldestNode = rig.footstepNodes[0];
    for (const node of rig.footstepNodes) {
      if (node.age > oldestNode.age) {
        oldestNode = node;
      }
    }
    oldestNode.pos.set(explorerPos.x, groundY + 0.06, explorerPos.z);
    oldestNode.age = 0;
    oldestNode.ringMesh.visible = false;
    oldestNode.budMesh.visible = false;
  }

  const activeStepNodes: MycelialFootstepNode[] = [];
  for (const node of rig.footstepNodes) {
    if (node.age < node.maxAge) {
      node.age += dt;
      activeStepNodes.push(node);
    }
    node.ringMesh.visible = false;
    node.budMesh.visible = false;
  }
  rig.mycelialTrailLine.visible = false;

  // 2. Rank entities for Player-to-Entity Symbiotic Filaments (pinned entities first, then closest within 38m)
  const scoredEntities = entities
    .map((ent) => {
      const torsoPos = ent.particles[1]?.pos ?? ent.particles[0].pos;
      const dist = torsoPos.distanceTo(explorerPos);
      const isPinned = rig.pinnedEntityIds.has(ent.id);
      return { ent, torsoPos, dist, isPinned };
    })
    .filter((item) => item.isPinned || item.dist < 38)
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return a.dist - b.dist;
    })
    .slice(0, MAX_PLAYER_FILAMENTS);

  const playerHeartOrigin = new THREE.Vector3(
    explorerPos.x,
    explorerPos.y - 0.32,
    explorerPos.z
  );

  let totalAlignment = 0;
  const explorerHorizSpeed = Math.hypot(explorerVel.x, explorerVel.z);
  const explorerForward = new THREE.Vector3(
    -Math.sin(explorerYaw),
    0,
    -Math.cos(explorerYaw)
  );

  for (let i = 0; i < MAX_PLAYER_FILAMENTS; i++) {
    const fil = rig.playerFilaments[i];
    const target = scoredEntities[i];

    if (!target) {
      fil.line.visible = false;
      fil.pulseBead.visible = false;
      continue;
    }

    fil.line.visible = true;
    fil.pulseBead.visible = true;

    const { ent, torsoPos, dist, isPinned } = target;

    // Mutual Interconnected Kinesthetics:
    // - If the entity is stumbling or stunned, the player's tether helps co-regulate and lift its spine!
    if (ent.stunTimer > 0) {
      ent.stunTimer = Math.max(0, ent.stunTimer - dt * (isPinned ? 0.9 : 0.45));
      ent.particles[1].pos.y += dt * 0.45;
      ent.particles[2].pos.y += dt * 0.55;
    }

    // - If the player is moving, connected entities gently entrain their heading and velocity with the player's flow
    if (explorerHorizSpeed > 1.2) {
      const desiredHeading = Math.atan2(explorerVel.x, explorerVel.z);
      let angleDiff = desiredHeading - ent.headingAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      ent.headingAngle += angleDiff * dt * (isPinned ? 1.8 : 0.85);
    }

    // Compute alignment between player heading and entity heading for Entrainment Coherence
    const entForward = new THREE.Vector3(
      Math.sin(ent.headingAngle),
      0,
      Math.cos(ent.headingAngle)
    );
    const headingAlignment =
      (explorerForward.dot(entForward) + 1) * 0.5; // 0 to 1
    totalAlignment += isPinned
      ? Math.max(0.75, headingAlignment)
      : headingAlignment;

    // Render sinusoidal / catenary 3D filament between player and entity
    const archHeight = Math.min(3.6, dist * 0.14) + Math.sin(timeSec * 2.2 + i) * 0.35;
    const perpX = -(torsoPos.z - playerHeartOrigin.z) / Math.max(1, dist);
    const perpZ = (torsoPos.x - playerHeartOrigin.x) / Math.max(1, dist);

    for (let s = 0; s < FILAMENT_SEGMENTS; s++) {
      const t = s / (FILAMENT_SEGMENTS - 1);
      const env = Math.sin(t * Math.PI); // 0 at ends, 1 in middle
      const wave =
        Math.sin(t * Math.PI * 3 - timeSec * 4.2 + i * 1.3) *
        0.28 *
        env *
        (1 + Math.abs(wCoord) * 0.5);

      const px =
        THREE.MathUtils.lerp(playerHeartOrigin.x, torsoPos.x, t) +
        perpX * wave;
      const py =
        THREE.MathUtils.lerp(playerHeartOrigin.y, torsoPos.y, t) +
        env * archHeight;
      const pz =
        THREE.MathUtils.lerp(playerHeartOrigin.z, torsoPos.z, t) +
        perpZ * wave;

      fil.positions[s * 3] = px;
      fil.positions[s * 3 + 1] = py;
      fil.positions[s * 3 + 2] = pz;
    }

    fil.line.geometry.attributes.position.needsUpdate = true;
    const mat = fil.line.material as THREE.LineBasicMaterial;
    mat.opacity = isPinned
      ? 0.88
      : Math.max(0.22, (1 - dist / 38) * 0.72);

    // Animate Synaptic Pulse Bead travelling along the filament
    const beadT = (timeSec * (isPinned ? 0.95 : 0.65) + i * 0.27) % 1;
    const segIdx = Math.min(
      FILAMENT_SEGMENTS - 1,
      Math.floor(beadT * FILAMENT_SEGMENTS)
    );
    fil.pulseBead.position.set(
      fil.positions[segIdx * 3],
      fil.positions[segIdx * 3 + 1],
      fil.positions[segIdx * 3 + 2]
    );
    fil.pulseBead.scale.setScalar(
      (isPinned ? 1.35 : 0.95) + Math.sin(timeSec * 8 + i) * 0.25
    );
  }

  // 3. Player-to-Placed-Structures Resonance Filaments
  for (let i = 0; i < MAX_BUILDING_FILAMENTS; i++) {
    const bLine = rig.buildingFilaments[i];
    const bld = placedBuildings[i];
    if (!bld) {
      bLine.visible = false;
      continue;
    }
    const bPos = new THREE.Vector3(bld.x, bld.y + 2.2, bld.z);
    const dist = bPos.distanceTo(playerHeartOrigin);
    if (dist > 55) {
      bLine.visible = false;
      continue;
    }
    bLine.visible = true;
    const arr = (
      bLine.geometry.attributes.position as THREE.BufferAttribute
    ).array as Float32Array;
    for (let s = 0; s < BOND_SEGMENTS; s++) {
      const t = s / (BOND_SEGMENTS - 1);
      const env = Math.sin(t * Math.PI);
      arr[s * 3] = THREE.MathUtils.lerp(playerHeartOrigin.x, bPos.x, t);
      arr[s * 3 + 1] =
        THREE.MathUtils.lerp(playerHeartOrigin.y, bPos.y, t) + env * 2.4;
      arr[s * 3 + 2] = THREE.MathUtils.lerp(playerHeartOrigin.z, bPos.z, t);
    }
    bLine.geometry.attributes.position.needsUpdate = true;
  }

  // 4. Entity-to-Entity Ecological Neural Web (connects nearby fauna pairs)
  let bondIdx = 0;
  for (let i = 0; i < entities.length && bondIdx < MAX_ENTITY_BONDS; i++) {
    const pA = entities[i].particles[1]?.pos ?? entities[i].particles[0].pos;
    for (
      let j = i + 1;
      j < entities.length && bondIdx < MAX_ENTITY_BONDS;
      j++
    ) {
      const pB = entities[j].particles[1]?.pos ?? entities[j].particles[0].pos;
      const d = pA.distanceTo(pB);
      if (d < 22) {
        const line = rig.entityBondLines[bondIdx++];
        line.visible = true;
        const arr = (
          line.geometry.attributes.position as THREE.BufferAttribute
        ).array as Float32Array;
        const arch = Math.min(2.2, d * 0.12) + Math.sin(timeSec * 3 + bondIdx) * 0.2;
        for (let s = 0; s < BOND_SEGMENTS; s++) {
          const t = s / (BOND_SEGMENTS - 1);
          const env = Math.sin(t * Math.PI);
          arr[s * 3] = THREE.MathUtils.lerp(pA.x, pB.x, t);
          arr[s * 3 + 1] = THREE.MathUtils.lerp(pA.y, pB.y, t) + env * arch;
          arr[s * 3 + 2] = THREE.MathUtils.lerp(pA.z, pB.z, t);
        }
        line.geometry.attributes.position.needsUpdate = true;
        (line.material as THREE.LineBasicMaterial).opacity = Math.max(
          0.15,
          (1 - d / 22) * 0.55
        );
      }
    }
  }
  for (let k = bondIdx; k < MAX_ENTITY_BONDS; k++) {
    rig.entityBondLines[k].visible = false;
  }

  // 5. 5D Zenith Umbilical Chord (Player Crown -> 5D Cloud Canopy overhead)
  for (let s = 0; s < FILAMENT_SEGMENTS; s++) {
    const t = s / (FILAMENT_SEGMENTS - 1);
    const spiralAngle = t * Math.PI * 4 + timeSec * 1.4 + wCoord * 2.0;
    const spiralRadius = t * (1.8 + Math.abs(vCoord5D) * 2.2);
    rig.zenithChordPositions[s * 3] =
      explorerPos.x + Math.cos(spiralAngle) * spiralRadius;
    rig.zenithChordPositions[s * 3 + 1] =
      explorerPos.y + 0.5 + t * 52;
    rig.zenithChordPositions[s * 3 + 2] =
      explorerPos.z + Math.sin(spiralAngle) * spiralRadius;
  }
  rig.zenithChordLine.geometry.attributes.position.needsUpdate = true;

  // 6. Compute Entrainment Coherence & Symbiotic Slipstream Speed Multiplier
  const activePlayerTethers = scoredEntities.length;
  const baseCoherence =
    activePlayerTethers > 0
      ? Math.min(
          1,
          0.32 +
            (totalAlignment / Math.max(1, activePlayerTethers)) * 0.42 +
            Math.min(0.26, activePlayerTethers * 0.06)
        )
      : 0.22;

  const entrainmentCoherence = Number(
    Math.min(
      1,
      baseCoherence + Math.min(0.15, activeStepNodes.length * 0.012)
    ).toFixed(2)
  );

  // Moving in harmony with tethered fauna & mycelial footsteps grants up to +38% slipstream flow
  const slipstreamSpeedMultiplier = Number(
    (1.0 + entrainmentCoherence * 0.36).toFixed(2)
  );

  const nearestTetheredEntityName =
    scoredEntities[0]?.ent.blueprint.name ?? null;

  let resonanceStateLabel = 'Solitary Axis Attunement';
  if (rig.pinnedEntityIds.size > 0 && activePlayerTethers >= 2) {
    resonanceStateLabel = 'Harmonic Kinship Choir (Locked)';
  } else if (activePlayerTethers >= 3 && bondIdx >= 2) {
    resonanceStateLabel = 'Polyphonic Biome Entrainment';
  } else if (activePlayerTethers >= 1) {
    resonanceStateLabel = 'Symbiotic Slipstream Link';
  } else if (activeStepNodes.length >= 4) {
    resonanceStateLabel = 'Mycelial Root-Step Resonance';
  }

  return {
    activePlayerTethers,
    interEntityBonds: bondIdx,
    entrainmentCoherence,
    slipstreamSpeedMultiplier,
    footstepRootNodesCount: activeStepNodes.length,
    nearestTetheredEntityName,
    resonanceStateLabel,
  };
}
