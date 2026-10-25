import * as THREE from 'three';
import {
  AbsurdTimelineSpec,
  BODY_MOD_CATALOG,
  BodyModId,
  TimelineCreatureAIArchetype,
  TimelineCreatureFactionId,
} from '../types/portalAndBiodepth';
import { evaluateTerrainHeight } from './manifoldGenerator';
import { ArticulatedRagdollEntity } from './ragdollPhysics';

// ============================================================================
// 1. PHYSICS GRAPPLE HOOK RIG (Pendulum Swing, Zip-Reel & Aerial Catapult)
// ============================================================================

export interface GrappleHookTelemetry {
  active: boolean;
  isZipReeling: boolean;
  anchorPoint: [number, number, number] | null;
  anchorLabel: string;
  cableLength: number;
  currentDistance: number;
  tensionForce: number;
}

const _grappleRayOrigin = new THREE.Vector3();
const _grappleRayDir = new THREE.Vector3();
const _grappleSamplePos = new THREE.Vector3();
const _grappleToAnchor = new THREE.Vector3();
const _grappleDir = new THREE.Vector3();

export class PhysicsGrappleHookRig {
  public rootGroup: THREE.Group;
  private cableSegmentMeshes: THREE.Mesh[] = [];
  private clawGroup: THREE.Group;
  private clawProngs: THREE.Mesh[] = [];
  private impactRingMesh: THREE.Mesh;

  public active = false;
  public isZipReeling = false;
  public anchorPoint = new THREE.Vector3();
  public anchorLabel = 'None';
  public attachedEntityRef: ArticulatedRagdollEntity | null = null;
  public cableLength = 18.0;
  public currentDistance = 0;
  public tensionForce = 0;
  private launchProgress = 0; // 0 -> 1 over 0.14s when fired

  constructor() {
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'physics-grapple-hook-rig';
    this.rootGroup.visible = false;

    const cableMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#38bdf8'),
      emissive: new THREE.Color('#0284c7'),
      emissiveIntensity: 1.4,
      metalness: 0.7,
      roughness: 0.2,
      clearcoat: 1.0,
    });

    const segGeo = new THREE.CylinderGeometry(0.022, 0.022, 1.0, 8, 1);
    segGeo.rotateX(Math.PI / 2);

    for (let i = 0; i < 16; i++) {
      const seg = new THREE.Mesh(segGeo, cableMat);
      this.cableSegmentMeshes.push(seg);
      this.rootGroup.add(seg);
    }

    // 3-Prong Articulated Magnetic Grapple Claw
    this.clawGroup = new THREE.Group();
    const clawBodyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#f8fafc'),
      metalness: 0.88,
      roughness: 0.18,
      clearcoat: 0.9,
    });
    const clawCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.055, 0.28, 10),
      clawBodyMat
    );
    clawCore.rotation.x = Math.PI / 2;
    this.clawGroup.add(clawCore);

    const prongGeo = new THREE.BoxGeometry(0.032, 0.16, 0.22);
    for (let p = 0; p < 3; p++) {
      const ang = (p / 3) * Math.PI * 2;
      const prong = new THREE.Mesh(prongGeo, cableMat);
      prong.position.set(Math.cos(ang) * 0.09, Math.sin(ang) * 0.09, 0.08);
      prong.rotation.z = ang;
      this.clawProngs.push(prong);
      this.clawGroup.add(prong);
    }

    this.impactRingMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.028, 8, 24),
      cableMat
    );
    this.clawGroup.add(this.impactRingMesh);
    this.rootGroup.add(this.clawGroup);
  }

  /**
   * Fires or releases the Physics Grapple Hook along the player's camera look vector.
   * Can latch onto Leviathan/Creature entities, floating timeline islands/monoliths, or canyon terrain up to 68m away.
   */
  public toggleOrFireGrapple(params: {
    cameraPos: THREE.Vector3;
    cameraLookDir: THREE.Vector3;
    entities: ArticulatedRagdollEntity[];
    extraTargetRoot?: THREE.Object3D | null;
  }): { attached: boolean; label: string; distance: number } {
    if (this.active) {
      this.detach();
      return { attached: false, label: 'Grapple Detached', distance: 0 };
    }

    const { cameraPos, cameraLookDir, entities, extraTargetRoot } = params;
    _grappleRayOrigin.copy(cameraPos);
    _grappleRayDir.copy(cameraLookDir).normalize();

    // 1. Check Creature Entities (especially towering Leviathans or Stalkers) along the aim ray
    let bestEntity: ArticulatedRagdollEntity | null = null;
    let bestEntityDist = 68.0;
    for (const ent of entities) {
      const pelvis = ent.particles[0]?.pos;
      if (!pelvis) continue;
      _grappleToAnchor.subVectors(pelvis, _grappleRayOrigin);
      const proj = _grappleToAnchor.dot(_grappleRayDir);
      if (proj > 3.5 && proj < bestEntityDist) {
        const perpSq = Math.max(
          0,
          _grappleToAnchor.lengthSq() - proj * proj
        );
        const hitRadius = (ent.rootGroup.userData.isLeviathan ? 3.8 : 2.1);
        if (perpSq <= hitRadius * hitRadius) {
          bestEntity = ent;
          bestEntityDist = proj;
        }
      }
    }

    if (bestEntity && bestEntity.particles[1]) {
      this.active = true;
      this.isZipReeling = false;
      this.attachedEntityRef = bestEntity;
      this.anchorPoint.copy(bestEntity.particles[1].pos);
      this.cableLength = Math.max(4.5, bestEntityDist * 0.92);
      this.currentDistance = bestEntityDist;
      this.anchorLabel = `${bestEntity.blueprint.name} (${
        bestEntity.rootGroup.userData.aiArchetype ?? 'Entity'
      })`;
      this.launchProgress = 0;
      this.rootGroup.visible = true;
      return {
        attached: true,
        label: this.anchorLabel,
        distance: Number(bestEntityDist.toFixed(1)),
      };
    }

    // 2. Check Raycast against Timeline Floating Islands / Monoliths / Props
    if (extraTargetRoot) {
      const raycaster = new THREE.Raycaster(
        _grappleRayOrigin,
        _grappleRayDir,
        3.0,
        68.0
      );
      const hits = raycaster.intersectObject(extraTargetRoot, true);
      const validHit = hits.find(
        (h) => h.object.name !== 'absurd-timeline-vibrant-sky-dome'
      );
      if (validHit) {
        this.active = true;
        this.isZipReeling = false;
        this.attachedEntityRef = null;
        this.anchorPoint.copy(validHit.point);
        this.cableLength = Math.max(4.5, validHit.distance * 0.94);
        this.currentDistance = validHit.distance;
        this.anchorLabel = 'Timeline Anomaly Spire';
        this.launchProgress = 0;
        this.rootGroup.visible = true;
        return {
          attached: true,
          label: this.anchorLabel,
          distance: Number(validHit.distance.toFixed(1)),
        };
      }
    }

    // 3. Ray-march against 3D Terrain Topography & Canyon Walls up to 68m
    const maxDist = 68.0;
    const stepSize = 1.15;
    for (let d = 4.0; d <= maxDist; d += stepSize) {
      _grappleSamplePos
        .copy(_grappleRayOrigin)
        .addScaledVector(_grappleRayDir, d);
      const groundY = evaluateTerrainHeight(
        _grappleSamplePos.x,
        _grappleSamplePos.z
      );
      if (_grappleSamplePos.y <= groundY + 0.35) {
        this.active = true;
        this.isZipReeling = false;
        this.attachedEntityRef = null;
        this.anchorPoint.set(
          _grappleSamplePos.x,
          groundY + 0.15,
          _grappleSamplePos.z
        );
        this.cableLength = Math.max(4.5, d * 0.94);
        this.currentDistance = d;
        this.anchorLabel =
          groundY > _grappleRayOrigin.y + 2.5
            ? 'High Canyon Ridge Anchor'
            : 'Terrain Crag Anchor';
        this.launchProgress = 0;
        this.rootGroup.visible = true;
        return {
          attached: true,
          label: this.anchorLabel,
          distance: Number(d.toFixed(1)),
        };
      }
    }

    // 4. High-Altitude Sky-Hook Anchor if aiming skyward so players can always swing across wide chasms!
    if (_grappleRayDir.y > 0.12) {
      const skyHookDist = 36.0;
      this.active = true;
      this.isZipReeling = false;
      this.attachedEntityRef = null;
      this.anchorPoint
        .copy(_grappleRayOrigin)
        .addScaledVector(_grappleRayDir, skyHookDist);
      this.cableLength = skyHookDist * 0.88;
      this.currentDistance = skyHookDist;
      this.anchorLabel = 'Quantum Rift Sky-Anchor';
      this.launchProgress = 0;
      this.rootGroup.visible = true;
      return {
        attached: true,
        label: this.anchorLabel,
        distance: skyHookDist,
      };
    }

    return { attached: false, label: 'No Anchor in Range', distance: 0 };
  }

  public detach(): void {
    this.active = false;
    this.isZipReeling = false;
    this.attachedEntityRef = null;
    this.tensionForce = 0;
    this.rootGroup.visible = false;
  }

  /**
   * Steps Pendulum Swing Constraint, Motorized Zip-Reel, and 3D Segmented Tether Cable Mesh
   */
  public stepPhysicsAndRender(params: {
    dt: number;
    nowSec: number;
    playerPos: THREE.Vector3;
    playerVel: THREE.Vector3;
    handOriginWorld: THREE.Vector3;
    cameraLookDir: THREE.Vector3;
    isZipReelHeld: boolean;
    isJumpReleasePressed: boolean;
  }): { catapultLaunched: boolean } {
    if (!this.active) {
      this.rootGroup.visible = false;
      return { catapultLaunched: false };
    }

    const {
      dt,
      nowSec,
      playerPos,
      playerVel,
      handOriginWorld,
      cameraLookDir,
      isZipReelHeld,
      isJumpReleasePressed,
    } = params;

    const safeDt = Math.min(0.033, dt);
    this.launchProgress = Math.min(1.0, this.launchProgress + safeDt * 8.5);
    this.isZipReeling = isZipReelHeld;

    // Follow moving creature if grappled onto a Leviathan/Stalker
    if (this.attachedEntityRef && this.attachedEntityRef.particles[1]) {
      this.anchorPoint.copy(this.attachedEntityRef.particles[1].pos);
    }

    // Aerial Catapult Jump Release: pressing Space while swinging launches the player forward & upward!
    if (isJumpReleasePressed && this.launchProgress >= 0.5) {
      playerVel.y = Math.max(playerVel.y + 7.5, 11.8);
      playerVel.x += cameraLookDir.x * 8.5;
      playerVel.z += cameraLookDir.z * 8.5;
      this.detach();
      return { catapultLaunched: true };
    }

    _grappleToAnchor.subVectors(this.anchorPoint, playerPos);
    const dist = _grappleToAnchor.length();
    this.currentDistance = dist;

    if (dist < 1.8 || dist > 85.0) {
      this.detach();
      return { catapultLaunched: false };
    }

    _grappleDir.copy(_grappleToAnchor).divideScalar(dist);

    if (isZipReelHeld) {
      // High-torque motorized winch reel-in toward anchor
      this.cableLength = Math.max(2.5, dist - 22.0 * safeDt);
      const reelSpeed = 24.5;
      const targetReelVel = _grappleDir.clone().multiplyScalar(reelSpeed);
      playerVel.lerp(targetReelVel, Math.min(1, safeDt * 6.5));
      playerVel.y += 4.5 * safeDt;
      this.tensionForce = 95.0;
    } else {
      // Pendulum Swing Physics Constraint when tether is taut
      if (dist > this.cableLength) {
        const stretch = dist - this.cableLength;
        // Remove outward radial velocity component so player swings in a smooth arc
        const radialVel = playerVel.dot(_grappleDir);
        if (radialVel < 0) {
          playerVel.addScaledVector(_grappleDir, -radialVel * 0.94);
        }
        // Apply elastic spring tension + gentle forward steering influence
        const springPull = Math.min(42.0, stretch * 18.5);
        playerVel.addScaledVector(_grappleDir, springPull * safeDt);
        playerVel.x += cameraLookDir.x * 6.2 * safeDt;
        playerVel.z += cameraLookDir.z * 6.2 * safeDt;
        this.tensionForce = Number((springPull * 2.2).toFixed(1));
      } else {
        // Gently take up slack while airborne
        this.cableLength = THREE.MathUtils.lerp(
          this.cableLength,
          Math.max(4.5, dist),
          safeDt * 1.8
        );
        this.tensionForce = 12.0;
      }
    }

    // Update 3D Segmented Tether Cable & Claw Visuals from handOriginWorld -> anchorPoint
    const effectiveEnd = new THREE.Vector3().lerpVectors(
      handOriginWorld,
      this.anchorPoint,
      this.launchProgress
    );
    const segCount = this.cableSegmentMeshes.length;
    for (let i = 0; i < segCount; i++) {
      const t0 = i / segCount;
      const t1 = (i + 1) / segCount;
      const tm = (t0 + t1) * 0.5;

      const p0 = new THREE.Vector3().lerpVectors(handOriginWorld, effectiveEnd, t0);
      const p1 = new THREE.Vector3().lerpVectors(handOriginWorld, effectiveEnd, t1);

      // Add subtle high-frequency kinetic wave while firing/reeling
      const waveAmp =
        (1.0 - this.launchProgress) * 0.28 + (isZipReelHeld ? 0.04 : 0.012);
      const waveOffset =
        Math.sin(tm * Math.PI) *
        Math.sin(nowSec * 24.0 + i * 0.9) *
        waveAmp;
      p0.y += waveOffset;
      p1.y += waveOffset;

      const segMesh = this.cableSegmentMeshes[i];
      segMesh.position.lerpVectors(p0, p1, 0.5);
      segMesh.lookAt(p1);
      const segLen = p0.distanceTo(p1);
      segMesh.scale.set(1, 1, Math.max(0.05, segLen));
    }

    this.clawGroup.position.copy(effectiveEnd);
    this.clawGroup.lookAt(handOriginWorld);
    this.impactRingMesh.rotation.z = nowSec * 6.5;
    this.impactRingMesh.scale.setScalar(1.0 + Math.sin(nowSec * 12.0) * 0.15);

    return { catapultLaunched: false };
  }

  public getTelemetry(): GrappleHookTelemetry {
    return {
      active: this.active,
      isZipReeling: this.isZipReeling,
      anchorPoint: this.active
        ? [
            Number(this.anchorPoint.x.toFixed(1)),
            Number(this.anchorPoint.y.toFixed(1)),
            Number(this.anchorPoint.z.toFixed(1)),
          ]
        : null,
      anchorLabel: this.anchorLabel,
      cableLength: Number(this.cableLength.toFixed(1)),
      currentDistance: Number(this.currentDistance.toFixed(1)),
      tensionForce: Number(this.tensionForce.toFixed(1)),
    };
  }
}

// ============================================================================
// 2. ANIMATED 3D BODY MODIFICATIONS RIG (Cyber-Wings, Mantis Blades, Thruster Legs, Wall-Run Boots)
// ============================================================================

export interface BodyModRuntimeTelemetry {
  equippedMods: BodyModId[];
  isCyberWingGliding: boolean;
  isMantisFlurryActive: boolean;
  isWallRunning: boolean;
  wallRunSide: 'left' | 'right' | 'none';
  wallRunTiltRad: number;
  thrusterBoostCooldown: number;
}

export class AnimatedBodyModificationsRig {
  public equippedMods = new Set<BodyModId>([
    'cyber-wings',
    'mantis-blades',
    'thruster-legs',
    'wall-run-boots',
  ]);

  // 1st-Person Attached Meshes
  private fpLeftMantisGroup: THREE.Group;
  private fpRightMantisGroup: THREE.Group;
  private fpPeripheralWingsGroup: THREE.Group;

  // 3rd-Person Avatar Attached Meshes
  private tpBackWingsGroup: THREE.Group;
  private tpLeftWingPivot: THREE.Group;
  private tpRightWingPivot: THREE.Group;
  private tpThrusterCalfGroup: THREE.Group;

  public mantisFlurryTimer = 0;
  public mantisFlurryDuration = 0.54;
  public thrusterBoostTimer = 0;
  public thrusterBoostCooldown = 0;
  public isCyberWingGliding = false;
  public isWallRunning = false;
  public wallRunSide: 'left' | 'right' | 'none' = 'none';
  public wallRunTiltRad = 0;
  private doubleJumpAvailable = true;

  constructor() {
    this.fpLeftMantisGroup = this.buildForearmMantisBladeMesh(-1);
    this.fpRightMantisGroup = this.buildForearmMantisBladeMesh(1);
    this.fpPeripheralWingsGroup = this.buildFirstPersonPeripheralWings();

    const tpWings = this.buildThirdPersonCyberWings();
    this.tpBackWingsGroup = tpWings.root;
    this.tpLeftWingPivot = tpWings.leftPivot;
    this.tpRightWingPivot = tpWings.rightPivot;
    this.tpThrusterCalfGroup = this.buildThirdPersonThrusterPods();
  }

  private buildForearmMantisBladeMesh(side: -1 | 1): THREE.Group {
    const group = new THREE.Group();
    group.name = `fp-mantis-blade-${side < 0 ? 'left' : 'right'}`;

    const carbonMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#18181b'),
      metalness: 0.85,
      roughness: 0.24,
      clearcoat: 0.8,
    });
    const thermalEdgeMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#f43f5e'),
      emissive: new THREE.Color('#e11d48'),
      emissiveIntensity: 1.5,
      metalness: 0.4,
      roughness: 0.15,
      clearcoat: 1.0,
    });

    // Forearm Hydraulic Sheath Housing
    const housing = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, 0.048, 0.28),
      carbonMat
    );
    housing.position.set(side * 0.06, 0.03, 0.08);
    group.add(housing);

    // Articulated Hinged Strut + Swept Mantis Scythe Blade
    const bladePivot = new THREE.Group();
    bladePivot.name = 'mantis-hinge-pivot';
    bladePivot.position.set(side * 0.06, 0.055, -0.02);

    const strut = new THREE.Mesh(
      new THREE.BoxGeometry(0.024, 0.18, 0.036),
      carbonMat
    );
    strut.position.set(0, 0.08, -0.04);
    strut.rotation.x = 0.45;
    bladePivot.add(strut);

    const scytheBlade = new THREE.Mesh(
      new THREE.BoxGeometry(0.016, 0.052, 0.46),
      carbonMat
    );
    scytheBlade.position.set(0, 0.14, -0.22);
    scytheBlade.rotation.x = 0.18;
    bladePivot.add(scytheBlade);

    const plasmaEdge = new THREE.Mesh(
      new THREE.BoxGeometry(0.009, 0.018, 0.48),
      thermalEdgeMat
    );
    plasmaEdge.position.set(0, 0.12, -0.23);
    plasmaEdge.rotation.x = 0.18;
    bladePivot.add(plasmaEdge);

    group.add(bladePivot);
    return group;
  }

  private buildFirstPersonPeripheralWings(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'fp-peripheral-cyber-wings';
    const pinionMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#38bdf8'),
      emissive: new THREE.Color('#0284c7'),
      emissiveIntensity: 1.15,
      transparent: true,
      opacity: 0.72,
      roughness: 0.15,
      metalness: 0.5,
    });

    for (const side of [-1, 1]) {
      const tipGroup = new THREE.Group();
      tipGroup.name = side < 0 ? 'fp-wing-left' : 'fp-wing-right';
      tipGroup.position.set(side * 0.58, 0.24, -0.34);
      for (let f = 0; f < 4; f++) {
        const feather = new THREE.Mesh(
          new THREE.BoxGeometry(0.24 - f * 0.03, 0.016, 0.045),
          pinionMat
        );
        feather.position.set(side * (0.08 + f * 0.04), -f * 0.045, -f * 0.03);
        feather.rotation.z = side * (-0.25 - f * 0.12);
        tipGroup.add(feather);
      }
      group.add(tipGroup);
    }
    group.visible = false;
    return group;
  }

  private buildThirdPersonCyberWings(): {
    root: THREE.Group;
    leftPivot: THREE.Group;
    rightPivot: THREE.Group;
  } {
    const root = new THREE.Group();
    root.name = 'tp-articulated-cyber-wings';
    root.position.set(0, 1.35, 0.22);

    const frameMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#1e293b'),
      metalness: 0.88,
      roughness: 0.22,
      clearcoat: 0.9,
    });
    const featherMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#38bdf8'),
      emissive: new THREE.Color('#0284c7'),
      emissiveIntensity: 1.25,
      roughness: 0.15,
      metalness: 0.4,
      transparent: true,
      opacity: 0.88,
    });

    const leftPivot = new THREE.Group();
    const rightPivot = new THREE.Group();
    leftPivot.position.set(-0.14, 0, 0);
    rightPivot.position.set(0.14, 0, 0);

    for (const [side, pivot] of [
      [-1, leftPivot],
      [1, rightPivot],
    ] as const) {
      const spar = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.055, 0.045),
        frameMat
      );
      spar.position.set(side * 0.48, 0.14, 0);
      spar.rotation.z = side * 0.22;
      pivot.add(spar);

      for (let i = 0; i < 6; i++) {
        const pinion = new THREE.Mesh(
          new THREE.BoxGeometry(0.042, 0.58 - i * 0.06, 0.018),
          featherMat
        );
        pinion.position.set(
          side * (0.18 + i * 0.14),
          -0.08 + i * 0.02,
          0.02
        );
        pinion.rotation.z = side * (0.18 + i * 0.08);
        pivot.add(pinion);
      }
    }

    root.add(leftPivot, rightPivot);
    return { root, leftPivot, rightPivot };
  }

  private buildThirdPersonThrusterPods(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'tp-hydraulic-thruster-pods';
    const podMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#f59e0b'),
      emissive: new THREE.Color('#d97706'),
      emissiveIntensity: 0.85,
      metalness: 0.82,
      roughness: 0.25,
    });
    for (const side of [-1, 1]) {
      const calfPod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.085, 0.34, 10),
        podMat
      );
      calfPod.position.set(side * 0.22, 0.48, 0.12);
      group.add(calfPod);
    }
    return group;
  }

  public attachToPlayerRigs(params: {
    camera: THREE.Camera;
    fpLeftHandGroup: THREE.Group | null;
    fpRightHandGroup: THREE.Group | null;
    tpCharacterGroup: THREE.Group | null;
  }): void {
    const { camera, fpLeftHandGroup, fpRightHandGroup, tpCharacterGroup } =
      params;
    if (fpLeftHandGroup && !fpLeftHandGroup.getObjectByName(this.fpLeftMantisGroup.name)) {
      fpLeftHandGroup.add(this.fpLeftMantisGroup);
    }
    if (fpRightHandGroup && !fpRightHandGroup.getObjectByName(this.fpRightMantisGroup.name)) {
      fpRightHandGroup.add(this.fpRightMantisGroup);
    }
    if (!camera.getObjectByName(this.fpPeripheralWingsGroup.name)) {
      camera.add(this.fpPeripheralWingsGroup);
    }
    if (tpCharacterGroup) {
      if (!tpCharacterGroup.getObjectByName(this.tpBackWingsGroup.name)) {
        tpCharacterGroup.add(this.tpBackWingsGroup);
      }
      if (!tpCharacterGroup.getObjectByName(this.tpThrusterCalfGroup.name)) {
        tpCharacterGroup.add(this.tpThrusterCalfGroup);
      }
    }
  }

  public toggleBodyMod(modId: BodyModId): boolean {
    if (this.equippedMods.has(modId)) {
      this.equippedMods.delete(modId);
      return false;
    }
    this.equippedMods.add(modId);
    return true;
  }

  /**
   * Triggers Forearm Mantis Blades Dual Cross-Slash Flurry + Thruster Lunge ([Key J])
   */
  public triggerMantisBladeFlurryAndLunge(params: {
    playerPos: THREE.Vector3;
    playerVel: THREE.Vector3;
    cameraLookDir: THREE.Vector3;
    entities: ArticulatedRagdollEntity[];
  }): { hitCount: number; activeModLabel: string } {
    if (!this.equippedMods.has('mantis-blades')) {
      this.equippedMods.add('mantis-blades');
    }

    this.mantisFlurryTimer = this.mantisFlurryDuration;
    const { playerPos, playerVel, cameraLookDir, entities } = params;

    // Propel player forward with hydraulic mantis lunge
    playerVel.x += cameraLookDir.x * 11.5;
    playerVel.z += cameraLookDir.z * 11.5;
    playerVel.y = Math.max(playerVel.y, 3.2);

    let hitCount = 0;
    const strikeReach = 6.2;
    const toEnt = new THREE.Vector3();
    for (const ent of entities) {
      const pelvis = ent.particles[0]?.pos;
      if (!pelvis) continue;
      toEnt.subVectors(pelvis, playerPos);
      const dist = toEnt.length();
      if (dist <= strikeReach) {
        toEnt.normalize();
        if (toEnt.dot(cameraLookDir) > 0.25 || dist < 2.8) {
          ent.applyInternalGoreTrauma(
            'laceration-hemorrhage',
            0.48,
            cameraLookDir.clone().multiplyScalar(16.5),
            playerPos
          );
          hitCount++;
        }
      }
    }

    return {
      hitCount,
      activeModLabel:
        hitCount > 0
          ? `Mantis Cross-Slash Lacerated ${hitCount} Target${hitCount > 1 ? 's' : ''}!`
          : 'Forearm Mantis Blades Cross-Slash Flurry',
    };
  }

  /**
   * Steps all 4 Body Modifications (Cyber-Wings glide, Mantis Blade unfolding, Thruster Legs double-jump, and Wall-Running boots)
   */
  public stepBodyModifications(params: {
    dt: number;
    nowSec: number;
    playerPos: THREE.Vector3;
    playerVel: THREE.Vector3;
    grounded: boolean;
    isSprintHeld: boolean;
    isJumpJustPressed: boolean;
    cameraYaw: number;
    cameraLookDir: THREE.Vector3;
  }): {
    shouldShowLeftHandForMantis: boolean;
    wallRunCameraRollRad: number;
    triggeredThrusterDoubleJump: boolean;
  } {
    const {
      dt,
      nowSec,
      playerPos,
      playerVel,
      grounded,
      isSprintHeld,
      isJumpJustPressed,
      cameraYaw,
      cameraLookDir,
    } = params;
    const safeDt = Math.min(0.033, dt);

    if (grounded) {
      this.doubleJumpAvailable = true;
    }

    if (this.mantisFlurryTimer > 0) {
      this.mantisFlurryTimer = Math.max(0, this.mantisFlurryTimer - safeDt);
    }
    if (this.thrusterBoostTimer > 0) {
      this.thrusterBoostTimer = Math.max(0, this.thrusterBoostTimer - safeDt);
    }
    if (this.thrusterBoostCooldown > 0) {
      this.thrusterBoostCooldown = Math.max(
        0,
        this.thrusterBoostCooldown - safeDt
      );
    }

    // 1. Forearm Mantis Blades Animation (unfolds on sprint, airborne, or flurry)
    const hasMantis = this.equippedMods.has('mantis-blades');
    this.fpLeftMantisGroup.visible = hasMantis;
    this.fpRightMantisGroup.visible = hasMantis;
    if (hasMantis) {
      const flurryPhase =
        this.mantisFlurryTimer > 0
          ? 1.0 - this.mantisFlurryTimer / this.mantisFlurryDuration
          : 0;
      const deployAngle =
        this.mantisFlurryTimer > 0
          ? 0.45 + Math.sin(flurryPhase * Math.PI * 3) * 0.55
          : isSprintHeld
          ? 0.25
          : -0.35;

      const leftPivot = this.fpLeftMantisGroup.getObjectByName(
        'mantis-hinge-pivot'
      );
      const rightPivot = this.fpRightMantisGroup.getObjectByName(
        'mantis-hinge-pivot'
      );
      if (leftPivot) leftPivot.rotation.x = deployAngle;
      if (rightPivot) rightPivot.rotation.x = deployAngle;
    }

    // 2. Articulated Cyber-Wings Vector Glide (holding Shift while airborne reduces descent & adds forward vector thrust)
    const hasWings = this.equippedMods.has('cyber-wings');
    this.tpBackWingsGroup.visible = hasWings;
    this.isCyberWingGliding =
      hasWings && !grounded && isSprintHeld && playerVel.y < 1.5;

    if (this.isCyberWingGliding) {
      playerVel.y = Math.max(-2.6, playerVel.y * 0.86);
      playerVel.x += cameraLookDir.x * 9.5 * safeDt;
      playerVel.z += cameraLookDir.z * 9.5 * safeDt;
    }

    if (hasWings) {
      const wingFlap = this.isCyberWingGliding
        ? Math.sin(nowSec * 9.5) * 0.32 + 0.35
        : !grounded
        ? 0.22
        : Math.sin(nowSec * 2.2) * 0.08 - 0.35;
      this.tpLeftWingPivot.rotation.y = -wingFlap;
      this.tpRightWingPivot.rotation.y = wingFlap;
      this.fpPeripheralWingsGroup.visible = this.isCyberWingGliding;
      if (this.isCyberWingGliding) {
        this.fpPeripheralWingsGroup.position.y = Math.sin(nowSec * 9.5) * 0.03;
      }
    } else {
      this.fpPeripheralWingsGroup.visible = false;
    }

    // 3. Hydraulic Thruster Legs Double-Jump / Air-Dash
    const hasThrusters = this.equippedMods.has('thruster-legs');
    this.tpThrusterCalfGroup.visible = hasThrusters;
    let triggeredThrusterDoubleJump = false;
    if (
      hasThrusters &&
      !grounded &&
      isJumpJustPressed &&
      this.doubleJumpAvailable &&
      this.thrusterBoostCooldown <= 0
    ) {
      this.doubleJumpAvailable = false;
      this.thrusterBoostTimer = 0.45;
      this.thrusterBoostCooldown = 1.25;
      playerVel.y = 11.4;
      playerVel.x += cameraLookDir.x * 7.5;
      playerVel.z += cameraLookDir.z * 7.5;
      triggeredThrusterDoubleJump = true;
    }

    // 4. Wall-Running & Zero-G Magnetic Tether Boots (detect steep terrain walls on left/right while airborne & moving)
    const hasWallBoots = this.equippedMods.has('wall-run-boots');
    this.isWallRunning = false;
    this.wallRunSide = 'none';

    const horizSpeed = Math.hypot(playerVel.x, playerVel.z);
    if (hasWallBoots && !grounded && horizSpeed > 3.2) {
      const rightX = Math.cos(cameraYaw);
      const rightZ = Math.sin(cameraYaw);
      const probeDist = 2.6;

      const leftGroundY = evaluateTerrainHeight(
        playerPos.x - rightX * probeDist,
        playerPos.z - rightZ * probeDist
      );
      const rightGroundY = evaluateTerrainHeight(
        playerPos.x + rightX * probeDist,
        playerPos.z + rightZ * probeDist
      );

      if (leftGroundY > playerPos.y + 1.1) {
        this.isWallRunning = true;
        this.wallRunSide = 'left';
      } else if (rightGroundY > playerPos.y + 1.1) {
        this.isWallRunning = true;
        this.wallRunSide = 'right';
      }

      if (this.isWallRunning) {
        // Lock vertical descent and boost horizontal wall-stride velocity
        playerVel.y = Math.max(-0.45, playerVel.y * 0.5);
        playerVel.x += cameraLookDir.x * 8.0 * safeDt;
        playerVel.z += cameraLookDir.z * 8.0 * safeDt;
        this.doubleJumpAvailable = true;
      }
    }

    const targetTilt =
      this.wallRunSide === 'left'
        ? -0.24
        : this.wallRunSide === 'right'
        ? 0.24
        : 0;
    this.wallRunTiltRad +=
      (targetTilt - this.wallRunTiltRad) * Math.min(1, safeDt * 10.0);

    return {
      shouldShowLeftHandForMantis: this.mantisFlurryTimer > 0,
      wallRunCameraRollRad: this.wallRunTiltRad,
      triggeredThrusterDoubleJump,
    };
  }

  public getTelemetry(): BodyModRuntimeTelemetry {
    return {
      equippedMods: Array.from(this.equippedMods),
      isCyberWingGliding: this.isCyberWingGliding,
      isMantisFlurryActive: this.mantisFlurryTimer > 0,
      isWallRunning: this.isWallRunning,
      wallRunSide: this.wallRunSide,
      wallRunTiltRad: Number(this.wallRunTiltRad.toFixed(3)),
      thrusterBoostCooldown: Number(this.thrusterBoostCooldown.toFixed(2)),
    };
  }
}

// ============================================================================
// 3. TIMELINE CREATURE FACTION AI DIRECTOR (Swarmer, Stalker, Leviathan, Mimic + Inter-Faction Skirmishes)
// ============================================================================

export interface FactionSkirmishTelemetry {
  activeSkirmishCount: number;
  lastSkirmishSummary: string;
  archetypeCounts: Record<TimelineCreatureAIArchetype, number>;
}

const FACTION_COLOR_MAP: Record<TimelineCreatureFactionId, string> = {
  'apex-chronos-pack': '#facc15',
  'parasitic-cob-swarm': '#a855f7',
  'citadel-synth-drones': '#f43f5e',
};

const FACTION_LABELS: Record<TimelineCreatureFactionId, string> = {
  'apex-chronos-pack': 'Apex Chronos Pack',
  'parasitic-cob-swarm': 'Parasitic Cob Swarm',
  'citadel-synth-drones': 'Citadel Synth-Drones',
};

export class TimelineCreatureFactionAIDirector {
  private lastSkirmishSummary = 'Factions patrolling timeline sector';
  private activeSkirmishCount = 0;

  /**
   * Assigns procedural Creature AI Archetypes (Swarmer, Stalker, Leviathan, Mimic) and rival Factions
   * to all entities in the world whenever a timeline is loaded or mutated.
   */
  public applyTimelineArchetypesToEntities(
    entities: ArticulatedRagdollEntity[],
    timeline: AbsurdTimelineSpec
  ): void {
    const archetypes: TimelineCreatureAIArchetype[] = [
      'swarmer',
      'stalker',
      'leviathan',
      'mimic',
    ];
    const factions: TimelineCreatureFactionId[] = [
      'apex-chronos-pack',
      'parasitic-cob-swarm',
      'citadel-synth-drones',
    ];

    entities.forEach((ent, idx) => {
      // Bias first entity toward the timeline's dominant archetype, then distribute across all 4 archetypes
      const archetype =
        idx === 0
          ? timeline.dominantCreatureArchetype
          : archetypes[(idx + Math.abs(timeline.seedHash)) % archetypes.length];
      const faction = factions[(idx + Math.abs(timeline.seedHash)) % factions.length];

      ent.rootGroup.userData.aiArchetype = archetype;
      ent.rootGroup.userData.factionId = faction;
      ent.rootGroup.userData.isLeviathan = archetype === 'leviathan';
      ent.rootGroup.userData.isMimicDisguised = archetype === 'mimic';

      // Remove old archetype badge/disguise mesh if present
      const oldBadge = ent.rootGroup.getObjectByName(
        'creature-archetype-ornament'
      );
      if (oldBadge) ent.rootGroup.remove(oldBadge);

      const badgeGroup = new THREE.Group();
      badgeGroup.name = 'creature-archetype-ornament';

      const factionColor = new THREE.Color(FACTION_COLOR_MAP[faction]);

      if (archetype === 'leviathan') {
        // Scale torso/pelvis/head meshes for towering Leviathan presence + dorsal energy spines
        ent.pelvisMesh.scale.setScalar(1.75);
        ent.torsoMesh.scale.setScalar(1.85);
        ent.headMesh.scale.setScalar(1.75);
        ent.selectionRing.scale.setScalar(2.1);

        const spineMat = new THREE.MeshPhysicalMaterial({
          color: factionColor,
          emissive: factionColor,
          emissiveIntensity: 1.6,
          roughness: 0.2,
        });
        for (let s = 0; s < 3; s++) {
          const dorsalFin = new THREE.Mesh(
            new THREE.ConeGeometry(0.18, 0.95 - s * 0.15, 6),
            spineMat
          );
          dorsalFin.position.set(0, 0.45 + s * 0.25, -0.25 - s * 0.12);
          dorsalFin.rotation.x = -0.45;
          badgeGroup.add(dorsalFin);
        }
      } else if (archetype === 'swarmer') {
        ent.pelvisMesh.scale.setScalar(0.74);
        ent.torsoMesh.scale.setScalar(0.74);
        ent.headMesh.scale.setScalar(0.85);
        ent.selectionRing.scale.setScalar(0.78);
      } else if (archetype === 'stalker') {
        ent.pelvisMesh.scale.setScalar(1.05);
        ent.torsoMesh.scale.setScalar(1.08);
        ent.headMesh.scale.setScalar(1.05);
        ent.selectionRing.scale.setScalar(1.0);
      } else if (archetype === 'mimic') {
        // Build Golden Crystalline Loot-Relic Disguise Shell around the Mimic
        ent.pelvisMesh.scale.setScalar(0.95);
        ent.torsoMesh.scale.setScalar(0.95);
        ent.headMesh.scale.setScalar(0.95);
        const mimicRelicShell = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.85, 1),
          new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#facc15'),
            emissive: new THREE.Color('#eab308'),
            emissiveIntensity: 1.35,
            metalness: 0.75,
            roughness: 0.12,
            wireframe: false,
            transparent: true,
            opacity: 0.88,
          })
        );
        mimicRelicShell.name = 'mimic-disguise-shell';
        badgeGroup.add(mimicRelicShell);
      }

      // Faction Halo Beacon above creature
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.32, 0.025, 8, 20),
        new THREE.MeshBasicMaterial({
          color: factionColor,
          transparent: true,
          opacity: 0.85,
        })
      );
      halo.rotation.x = Math.PI / 2;
      halo.name = 'faction-halo-ring';
      badgeGroup.add(halo);

      ent.rootGroup.add(badgeGroup);

      // Tint selection ring to faction color
      const ringMat = ent.selectionRing.material as THREE.MeshBasicMaterial;
      if (ringMat && ringMat.color) {
        ringMat.color.copy(factionColor);
      }
    });
  }

  /**
   * Steps real-time Archetype AI (Swarmer flocking leaps, Stalker optical cloak pounce,
   * Leviathan seismic charge, Mimic ambush unfold) AND Inter-Faction Combat between rival creatures!
   */
  public stepCreatureFactionAI(params: {
    dt: number;
    nowSec: number;
    entities: ArticulatedRagdollEntity[];
    playerPos: THREE.Vector3;
  }): FactionSkirmishTelemetry {
    const { dt, nowSec, entities, playerPos } = params;
    const safeDt = Math.min(0.033, dt);

    const archetypeCounts: Record<TimelineCreatureAIArchetype, number> = {
      swarmer: 0,
      stalker: 0,
      leviathan: 0,
      mimic: 0,
    };

    let skirmishes = 0;
    const toTarget = new THREE.Vector3();

    for (let i = 0; i < entities.length; i++) {
      const ent = entities[i];
      const pelvis = ent.particles[0];
      const head = ent.particles[2];
      if (!pelvis || !head) continue;

      const archetype: TimelineCreatureAIArchetype =
        ent.rootGroup.userData.aiArchetype ?? 'swarmer';
      const faction: TimelineCreatureFactionId =
        ent.rootGroup.userData.factionId ?? 'apex-chronos-pack';
      archetypeCounts[archetype] = (archetypeCounts[archetype] ?? 0) + 1;

      // Update ornament position to follow head/torso
      const ornament = ent.rootGroup.getObjectByName(
        'creature-archetype-ornament'
      );
      if (ornament) {
        ornament.position.copy(head.pos).add(new THREE.Vector3(0, 0.55, 0));
        ornament.rotation.y = nowSec * 2.4 + i;
      }

      const distToPlayer = pelvis.pos.distanceTo(playerPos);

      // 1. Archetype-Specific Stealth / Disguise / Leap Behaviors
      if (archetype === 'stalker') {
        // Optical Camouflage: semi-invisible beyond 12m, shimmers & uncloaks for pounce inside 12m
        const cloaked = distToPlayer > 12.0;
        const targetOpacity = cloaked ? 0.22 : 0.96;
        ent.torsoMesh.traverse((ch) => {
          if ((ch as THREE.Mesh).isMesh) {
            const mat = (ch as THREE.Mesh).material as THREE.Material;
            if (mat) {
              mat.transparent = true;
              mat.opacity = targetOpacity;
            }
          }
        });
      } else if (archetype === 'mimic') {
        const shell = ornament?.getObjectByName('mimic-disguise-shell');
        const isDisguised = distToPlayer > 9.5 && ent.structuralHealth > 0.92;
        ent.rootGroup.userData.isMimicDisguised = isDisguised;
        if (shell) {
          shell.visible = isDisguised;
          shell.position.set(0, -0.65, 0);
        }
        ent.pelvisMesh.visible = !isDisguised;
        ent.torsoMesh.visible = !isDisguised;
        ent.headMesh.visible = !isDisguised;
      }

      // 2. Scan for nearest Rival Faction Creature within 24m for Inter-Faction Combat
      let nearestRival: ArticulatedRagdollEntity | null = null;
      let nearestRivalDist = 24.0;

      for (let j = 0; j < entities.length; j++) {
        if (i === j) continue;
        const other = entities[j];
        const otherFaction: TimelineCreatureFactionId =
          other.rootGroup.userData.factionId ?? 'parasitic-cob-swarm';
        if (otherFaction === faction) continue;
        const otherPelvis = other.particles[0];
        if (!otherPelvis) continue;
        const d = pelvis.pos.distanceTo(otherPelvis.pos);
        if (d < nearestRivalDist) {
          nearestRivalDist = d;
          nearestRival = other;
        }
      }

      if (nearestRival && nearestRival.particles[0]) {
        skirmishes++;
        const rivalPos = nearestRival.particles[0].pos;
        toTarget.subVectors(rivalPos, pelvis.pos);
        toTarget.y = 0;
        const horizDist = Math.max(0.001, toTarget.length());
        toTarget.divideScalar(horizDist);

        // Steer heading toward rival faction enemy
        ent.targetHeading = Math.atan2(toTarget.x, toTarget.z);
        const speedMult =
          archetype === 'swarmer'
            ? 6.5
            : archetype === 'stalker'
            ? 5.8
            : archetype === 'leviathan'
            ? 4.2
            : 5.0;

        pelvis.pos.addScaledVector(toTarget, speedMult * safeDt);
        ent.activeBehaviorLabel = `[${archetype.toUpperCase()}] Hunting Rival ${
          nearestRival.blueprint.name
        }`;

        // Exchange Faction Combat Strikes when within 3.4m
        if (horizDist < 3.4 && Math.sin(nowSec * 7.0 + i * 2.1) > 0.88) {
          const strikeForce = archetype === 'leviathan' ? 14.5 : 8.2;
          nearestRival.applyInternalGoreTrauma(
            ent.getSpecializedAttackModality(),
            archetype === 'leviathan' ? 0.28 : 0.16,
            toTarget
              .clone()
              .multiplyScalar(strikeForce)
              .add(new THREE.Vector3(0, 3.5, 0)),
            playerPos
          );
          this.lastSkirmishSummary = `${FACTION_LABELS[faction]} (${archetype}) clashed with ${nearestRival.blueprint.name}!`;
        }
      } else if (
        archetype === 'swarmer' &&
        distToPlayer < 18.0 &&
        Math.sin(nowSec * 5.2 + i) > 0.94
      ) {
        // Swarmers perform coordinated pack leaps toward the explorer
        toTarget.subVectors(playerPos, pelvis.pos).normalize();
        pelvis.pos.addScaledVector(toTarget, 4.5 * safeDt);
        ent.activeBehaviorLabel = '[SWARMER] Pack Leap Assault';
      }
    }

    this.activeSkirmishCount = Math.floor(skirmishes / 2);
    return {
      activeSkirmishCount: this.activeSkirmishCount,
      lastSkirmishSummary: this.lastSkirmishSummary,
      archetypeCounts,
    };
  }
}

export { BODY_MOD_CATALOG };
