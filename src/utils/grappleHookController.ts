import * as THREE from 'three';
import { ArticulatedRagdollEntity } from './ragdollPhysics';
import { spatialCollisionSolver } from './graphicsMeshAndCollisionEngine';

export type GrappleTraversalState =
  | 'dormant'
  | 'ranging-surface'
  | 'pendulum-swing'
  | 'zip-reel-winch'
  | 'aerial-catapult-vault';

export interface GrappleSurfaceRangeTelemetry {
  hasSurfaceHit: boolean;
  distanceMeters: number;
  maxRangeMeters: number;
  inGrappleRange: boolean;
  surfaceLabel: string;
  surfacePoint: [number, number, number];
  traversalState: GrappleTraversalState;
  isAttached: boolean;
  anchorLabel: string;
  ropeLengthMeters: number;
  currentTensionG: number;
}

export interface SurfaceRangeQueryParams {
  cameraPos: THREE.Vector3;
  cameraLookDir: THREE.Vector3;
  terrainMesh?: THREE.Object3D | null;
  sectorMeshes?: THREE.Object3D[];
  extraTargetRoot?: THREE.Object3D | null;
  entities?: ArticulatedRagdollEntity[];
  evalTerrainHeight?: (x: number, z: number) => number;
}

/**
 * GrappleHookController
 * ---------------------
 * Continuously calculates distance to 3D surfaces (terrain meshes, procedural heightfields,
 * timeline monuments, sintered buildings, and entities) along the player's aim vector,
 * renders a 3D surface rangefinder reticle, and drives a physics-based pendulum swing
 * and motorized zip-reel traversal state machine when the grapple tool is active.
 */
export class GrappleHookController {
  public readonly rootGroup: THREE.Group;
  public traversalState: GrappleTraversalState = 'dormant';
  public active = false;
  public anchorPoint = new THREE.Vector3();
  public anchorNormal = new THREE.Vector3(0, 1, 0);
  public attachedEntity: ArticulatedRagdollEntity | null = null;
  public ropeLength = 0;
  public readonly maxRange = 88.0;
  public readonly minRopeLength = 2.2;
  public zipReeling = false;
  public anchorLabel = 'None';
  public currentTensionG = 0;

  // Latest surface rangefinder state
  public hasSurfaceHit = false;
  public targetSurfaceDistance = 0;
  public inGrappleRange = false;
  public targetSurfaceLabel = 'Scanning...';
  public targetSurfacePoint = new THREE.Vector3();
  public targetSurfaceNormal = new THREE.Vector3(0, 1, 0);

  private catapultTimer = 0;
  private clawMesh: THREE.Group;
  private rangefinderGroup: THREE.Group;
  private rangeOuterRing: THREE.Mesh;
  private rangeInnerDisc: THREE.Mesh;
  private cableSegments: THREE.Mesh[] = [];
  private readonly segmentCount = 16;
  private raycaster = new THREE.Raycaster();

  // Zero-GC scratch vectors
  private scratchToPlayer = new THREE.Vector3();
  private scratchRadialDir = new THREE.Vector3();
  private scratchRight = new THREE.Vector3();
  private scratchUp = new THREE.Vector3(0, 1, 0);
  private scratchPullDir = new THREE.Vector3();
  private scratchSegPos = new THREE.Vector3();
  private scratchNextPos = new THREE.Vector3();
  private scratchProbe = new THREE.Vector3();
  private scratchQuat = new THREE.Quaternion();

  constructor() {
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'GrappleHookControllerRig';

    // 1. 3D Articulated Grapple Claw Anchor
    this.clawMesh = new THREE.Group();
    const coreMat = new THREE.MeshStandardMaterial({
      color: '#0ea5e9',
      emissive: '#38bdf8',
      emissiveIntensity: 1.35,
      metalness: 0.88,
      roughness: 0.18,
    });
    const coreHead = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.26, 1),
      coreMat
    );
    this.clawMesh.add(coreHead);

    const prongGeo = new THREE.ConeGeometry(0.075, 0.44, 6);
    for (let i = 0; i < 4; i++) {
      const prong = new THREE.Mesh(prongGeo, coreMat);
      const angle = (i / 4) * Math.PI * 2;
      prong.position.set(Math.cos(angle) * 0.22, 0, Math.sin(angle) * 0.22);
      prong.rotation.z = Math.cos(angle) * 0.65;
      prong.rotation.x = -Math.sin(angle) * 0.65;
      this.clawMesh.add(prong);
    }
    this.clawMesh.visible = false;
    this.rootGroup.add(this.clawMesh);

    // 2. 3D Surface Laser Rangefinder Ring (projected onto surfaces when grapple tool is active)
    this.rangefinderGroup = new THREE.Group();
    this.rangeOuterRing = new THREE.Mesh(
      new THREE.RingGeometry(0.38, 0.52, 28),
      new THREE.MeshBasicMaterial({
        color: '#38bdf8',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      })
    );
    this.rangeInnerDisc = new THREE.Mesh(
      new THREE.RingGeometry(0.08, 0.16, 16),
      new THREE.MeshBasicMaterial({
        color: '#34d399',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      })
    );
    this.rangefinderGroup.add(this.rangeOuterRing, this.rangeInnerDisc);
    this.rangefinderGroup.visible = false;
    this.rootGroup.add(this.rangefinderGroup);

    // 3. 16-Segment Catenary Tension Cable
    const segGeo = new THREE.CylinderGeometry(0.036, 0.036, 1.0, 6);
    segGeo.rotateX(Math.PI / 2);
    const segMat = new THREE.MeshBasicMaterial({
      color: '#38bdf8',
      transparent: true,
      opacity: 0.92,
    });

    for (let i = 0; i < this.segmentCount; i++) {
      const seg = new THREE.Mesh(segGeo, segMat.clone());
      seg.visible = false;
      this.cableSegments.push(seg);
      this.rootGroup.add(seg);
    }
  }

  /**
   * Continuously calculates distance from the player's camera/eye to the nearest
   * grappleable surface along `cameraLookDir`, updating the 3D surface rangefinder reticle.
   */
  public calculateDistanceToSurface(
    params: SurfaceRangeQueryParams,
    isGrappleToolActive: boolean,
    nowSec: number
  ): GrappleSurfaceRangeTelemetry {
    const {
      cameraPos,
      cameraLookDir,
      terrainMesh,
      sectorMeshes,
      extraTargetRoot,
      entities,
      evalTerrainHeight,
    } = params;

    let bestDist = Infinity;
    let bestPoint: THREE.Vector3 | null = null;
    let bestNormal = this.scratchUp;
    let bestLabel = 'Out of Range';

    // 1. Check live 3D entities via Sub-Stepped Anatomical Limb Capsules first
    if (entities && entities.length > 0) {
      const rayEnd = this.scratchProbe
        .copy(cameraPos)
        .addScaledVector(cameraLookDir, this.maxRange);
      const limbHit = spatialCollisionSolver.raycastSubSteppedAnatomicalLimbs(
        cameraPos,
        rayEnd,
        0.58,
        entities
      );
      if (limbHit) {
        const dist = cameraPos.distanceTo(limbHit.hitPoint);
        if (dist > 1.8 && dist < bestDist) {
          bestDist = dist;
          bestPoint = limbHit.hitPoint.clone();
          bestNormal = cameraLookDir.clone().negate();
          bestLabel = `${limbHit.entity.blueprint.name} (${limbHit.limbName})`;
        }
      }
    }

    // 2. Raycast against 3D scene meshes (terrain, sectors, timeline monuments)
    this.raycaster.set(cameraPos, cameraLookDir);
    this.raycaster.near = 1.5;
    this.raycaster.far = this.maxRange;

    const candidateObjects: THREE.Object3D[] = [];
    if (extraTargetRoot) candidateObjects.push(extraTargetRoot);
    if (terrainMesh) candidateObjects.push(terrainMesh);
    if (sectorMeshes && sectorMeshes.length > 0) {
      for (let i = 0; i < sectorMeshes.length; i++) {
        candidateObjects.push(sectorMeshes[i]);
      }
    }

    if (candidateObjects.length > 0) {
      const hits = this.raycaster.intersectObjects(candidateObjects, true);
      for (let i = 0; i < hits.length; i++) {
        const hit = hits[i];
        if (hit.distance >= 2.0 && hit.distance < bestDist) {
          bestDist = hit.distance;
          bestPoint = hit.point.clone();
          if (hit.face?.normal) {
            bestNormal = hit.face.normal.clone();
          }
          const isMonument =
            extraTargetRoot &&
            this.isDescendantOf(hit.object, extraTargetRoot);
          bestLabel = isMonument ? 'Timeline Monument' : 'Terrain Surface';
          break;
        }
      }
    }

    // 3. Analytical heightfield ray-marching fallback (catches distant procedural ridges & overhangs)
    if (!bestPoint && evalTerrainHeight) {
      const stepSize = 2.0;
      for (let d = 3.0; d <= this.maxRange; d += stepSize) {
        this.scratchProbe
          .copy(cameraPos)
          .addScaledVector(cameraLookDir, d);
        const groundY = evalTerrainHeight(
          this.scratchProbe.x,
          this.scratchProbe.z
        );
        if (this.scratchProbe.y <= groundY + 0.65) {
          bestDist = d;
          bestPoint = new THREE.Vector3(
            this.scratchProbe.x,
            groundY + 0.25,
            this.scratchProbe.z
          );
          bestNormal = new THREE.Vector3(0, 1, 0);
          bestLabel =
            groundY > cameraPos.y + 3.5
              ? 'Elevated Cliff Ridge'
              : 'Terrain Surface';
          break;
        }
      }
    }

    if (bestPoint && bestDist <= this.maxRange) {
      this.hasSurfaceHit = true;
      this.targetSurfaceDistance = bestDist;
      this.inGrappleRange = bestDist >= 2.0 && bestDist <= this.maxRange;
      this.targetSurfaceLabel = bestLabel;
      this.targetSurfacePoint.copy(bestPoint);
      this.targetSurfaceNormal.copy(bestNormal).normalize();
    } else {
      this.hasSurfaceHit = false;
      this.targetSurfaceDistance = this.maxRange;
      this.inGrappleRange = false;
      this.targetSurfaceLabel = 'Out of Range (>88m)';
      this.targetSurfacePoint
        .copy(cameraPos)
        .addScaledVector(cameraLookDir, this.maxRange);
      this.targetSurfaceNormal.set(0, 1, 0);
    }

    // Update 3D Rangefinder Ring visibility & orientation when Grapple Tool is active
    if (isGrappleToolActive && !this.active && this.hasSurfaceHit) {
      this.rangefinderGroup.visible = true;
      this.rangefinderGroup.position
        .copy(this.targetSurfacePoint)
        .addScaledVector(this.targetSurfaceNormal, 0.08);
      this.scratchQuat.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        this.targetSurfaceNormal
      );
      this.rangefinderGroup.quaternion.copy(this.scratchQuat);
      const pulse = 1.0 + Math.sin(nowSec * 8.0) * 0.14;
      const distScale = Math.max(
        0.65,
        Math.min(2.6, this.targetSurfaceDistance * 0.035)
      );
      this.rangefinderGroup.scale.setScalar(pulse * distScale);
      const outerMat = this.rangeOuterRing.material as THREE.MeshBasicMaterial;
      outerMat.color.set(this.inGrappleRange ? '#38bdf8' : '#f59e0b');
    } else {
      this.rangefinderGroup.visible = false;
    }

    // Update traversal state when not actively attached
    if (!this.active && this.catapultTimer <= 0) {
      this.traversalState = isGrappleToolActive
        ? 'ranging-surface'
        : 'dormant';
    }

    return this.getTelemetry();
  }

  /**
   * Fires or detaches the grapple hook using the latest surface calculation or an immediate query.
   */
  public toggleOrFireGrapple(params: SurfaceRangeQueryParams & {
    forceZipReelOnAttach?: boolean;
  }): {
    attached: boolean;
    label: string;
    distance: number;
    traversalState: GrappleTraversalState;
  } {
    if (this.active) {
      this.detach();
      return {
        attached: false,
        label: 'Detached',
        distance: 0,
        traversalState: this.traversalState,
      };
    }

    // Perform an immediate surface distance calculation along the aim vector
    const {
      cameraPos,
      cameraLookDir,
      entities,
    } = params;

    // Check if an entity is locked along the aim vector
    let hitEntity: ArticulatedRagdollEntity | null = null;
    let bestEntDist = this.maxRange;
    if (entities) {
      for (const ent of entities) {
        const torsoPos = ent.particles[1]?.pos ?? ent.particles[0].pos;
        const toEnt = torsoPos.clone().sub(cameraPos);
        const dist = toEnt.length();
        if (dist > 2.2 && dist < bestEntDist) {
          const dirDot = toEnt.normalize().dot(cameraLookDir);
          if (dirDot > 0.94) {
            bestEntDist = dist;
            hitEntity = ent;
          }
        }
      }
    }

    if (hitEntity) {
      const torsoPos =
        hitEntity.particles[1]?.pos ?? hitEntity.particles[0].pos;
      this.active = true;
      this.attachedEntity = hitEntity;
      this.anchorPoint.copy(torsoPos);
      this.ropeLength = Math.max(this.minRopeLength, bestEntDist * 0.92);
      this.zipReeling = Boolean(params.forceZipReelOnAttach);
      this.traversalState = this.zipReeling
        ? 'zip-reel-winch'
        : 'pendulum-swing';
      this.anchorLabel = `Entity: ${hitEntity.blueprint.name}`;
      this.clawMesh.visible = true;
      this.rangefinderGroup.visible = false;
      return {
        attached: true,
        label: this.anchorLabel,
        distance: this.ropeLength,
        traversalState: this.traversalState,
      };
    }

    // Evaluate surface distance via calculateDistanceToSurface
    this.calculateDistanceToSurface(params, true, performance.now() * 0.001);

    if (this.hasSurfaceHit && this.inGrappleRange) {
      this.active = true;
      this.attachedEntity = null;
      this.anchorPoint.copy(this.targetSurfacePoint);
      this.anchorNormal.copy(this.targetSurfaceNormal);
      this.ropeLength = Math.max(
        this.minRopeLength,
        this.targetSurfaceDistance * 0.93
      );
      this.zipReeling = Boolean(params.forceZipReelOnAttach);
      this.traversalState = this.zipReeling
        ? 'zip-reel-winch'
        : 'pendulum-swing';
      this.anchorLabel = `${this.targetSurfaceLabel} (${this.targetSurfaceDistance.toFixed(1)}m)`;
      this.clawMesh.visible = true;
      this.rangefinderGroup.visible = false;
      return {
        attached: true,
        label: this.anchorLabel,
        distance: this.ropeLength,
        traversalState: this.traversalState,
      };
    }

    // Fallback sky-anchor grapple if aiming high into the sky canopy so aerial pendulum swings always feel responsive
    if (cameraLookDir.y > 0.08) {
      const fallbackDist = 36.0;
      this.active = true;
      this.attachedEntity = null;
      this.anchorPoint
        .copy(cameraPos)
        .addScaledVector(cameraLookDir, fallbackDist);
      this.ropeLength = fallbackDist * 0.9;
      this.zipReeling = Boolean(params.forceZipReelOnAttach);
      this.traversalState = this.zipReeling
        ? 'zip-reel-winch'
        : 'pendulum-swing';
      this.anchorLabel = `Atmospheric Sky-Anchor (${fallbackDist.toFixed(0)}m)`;
      this.clawMesh.visible = true;
      this.rangefinderGroup.visible = false;
      return {
        attached: true,
        label: this.anchorLabel,
        distance: this.ropeLength,
        traversalState: this.traversalState,
      };
    }

    return {
      attached: false,
      label: 'No Surface In Range',
      distance: 0,
      traversalState: this.traversalState,
    };
  }

  public detach(): void {
    this.active = false;
    this.attachedEntity = null;
    this.zipReeling = false;
    this.currentTensionG = 0;
    this.clawMesh.visible = false;
    for (const seg of this.cableSegments) {
      seg.visible = false;
    }
    if (this.catapultTimer <= 0) {
      this.traversalState = 'ranging-surface';
    }
  }

  /**
   * Steps pendulum swing physics, motorized zip-reel winching, air-strafe steering torque,
   * and 16-segment 3D catenary cable rendering.
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
    isGrappleToolActive?: boolean;
  }): {
    isActive: boolean;
    tensionRatio: number;
    traversalState: GrappleTraversalState;
  } {
    const {
      dt,
      nowSec,
      playerPos,
      playerVel,
      handOriginWorld,
      cameraLookDir,
      isZipReelHeld,
      isJumpReleasePressed,
      isGrappleToolActive = false,
    } = params;

    if (this.catapultTimer > 0) {
      this.catapultTimer = Math.max(0, this.catapultTimer - dt);
      if (this.catapultTimer === 0 && !this.active) {
        this.traversalState = isGrappleToolActive
          ? 'ranging-surface'
          : 'dormant';
      }
    }

    if (!this.active) {
      return {
        isActive: false,
        tensionRatio: 0,
        traversalState: this.traversalState,
      };
    }

    if (this.attachedEntity) {
      const torso =
        this.attachedEntity.particles[1]?.pos ??
        this.attachedEntity.particles[0]?.pos;
      if (torso) {
        this.anchorPoint.copy(torso);
      }
    }

    // Jump key while swinging triggers an Aerial Catapult Vault release!
    if (isJumpReleasePressed) {
      playerVel.y = Math.max(playerVel.y + 9.2, 13.8);
      playerVel.x += cameraLookDir.x * 9.5;
      playerVel.z += cameraLookDir.z * 9.5;
      this.catapultTimer = 0.65;
      this.traversalState = 'aerial-catapult-vault';
      this.detach();
      return {
        isActive: false,
        tensionRatio: 0,
        traversalState: 'aerial-catapult-vault',
      };
    }

    this.scratchToPlayer.subVectors(playerPos, this.anchorPoint);
    const currentDist = this.scratchToPlayer.length();

    // Update active traversal mode: Motorized Zip-Reel Winch vs Pendulum Swing
    this.zipReeling = isZipReelHeld;
    this.traversalState = isZipReelHeld ? 'zip-reel-winch' : 'pendulum-swing';

    if (isZipReelHeld) {
      // High-torque motorized zip-reel winch: reels cable at 32 m/s and pulls player toward anchor
      this.ropeLength = Math.max(
        this.minRopeLength,
        Math.min(this.ropeLength, currentDist) - 32.0 * dt
      );
      this.scratchPullDir
        .subVectors(this.anchorPoint, playerPos)
        .normalize();
      playerVel.addScaledVector(this.scratchPullDir, 42.0 * dt);
      playerVel.y += 6.5 * dt; // Slight anti-gravity lift during zip-reel

      // Auto-vault over crest if player reaches within 2.5m of anchor while zip-reeling
      if (currentDist <= 2.55) {
        playerVel.y = Math.max(playerVel.y, 9.5);
        playerVel.x += cameraLookDir.x * 5.0;
        playerVel.z += cameraLookDir.z * 5.0;
        this.catapultTimer = 0.45;
        this.traversalState = 'aerial-catapult-vault';
        this.detach();
        return {
          isActive: false,
          tensionRatio: 0,
          traversalState: 'aerial-catapult-vault',
        };
      }
    }

    let tensionRatio = 0;
    if (currentDist > this.ropeLength && currentDist > 0.001) {
      this.scratchRadialDir
        .copy(this.scratchToPlayer)
        .divideScalar(currentDist);
      const stretch = currentDist - this.ropeLength;
      tensionRatio = Math.min(1.0, stretch / 4.2);

      // Spring-damper radial rope constraint (pendulum arc physics)
      const springPull = stretch * 28.0;
      playerVel.addScaledVector(this.scratchRadialDir, -springPull * dt);

      // Remove outward radial velocity to preserve tangential swing speed
      const radialVel = playerVel.dot(this.scratchRadialDir);
      if (radialVel > 0) {
        playerVel.addScaledVector(this.scratchRadialDir, -radialVel * 0.92);
      }

      // Air-strafe / camera-aim pendulum pump so looking in swing direction accelerates arc
      this.scratchRight
        .crossVectors(cameraLookDir, this.scratchUp)
        .normalize();
      playerVel.addScaledVector(cameraLookDir, 9.2 * dt);

      // If attached to a lightweight creature, apply reciprocal tug impulse
      if (this.attachedEntity) {
        this.attachedEntity.applyKineticImpulse(
          this.scratchRadialDir.clone().multiplyScalar(14.0 * dt),
          0.35
        );
      }
    }

    this.currentTensionG = Number((1.0 + tensionRatio * 3.8).toFixed(2));

    // Render 3D Claw & 16-Segment Catenary Cable
    this.clawMesh.position.copy(this.anchorPoint);
    this.clawMesh.rotation.y = nowSec * 5.0;

    for (let i = 0; i < this.segmentCount; i++) {
      const t0 = i / this.segmentCount;
      const t1 = (i + 1) / this.segmentCount;

      this.scratchSegPos.lerpVectors(handOriginWorld, this.anchorPoint, t0);
      this.scratchNextPos.lerpVectors(handOriginWorld, this.anchorPoint, t1);

      // Catenary sag diminishes as tension increases or during zip-reeling
      const slack = Math.max(0, 1.0 - tensionRatio * 0.92);
      const sagAmp = this.zipReeling ? 0.03 : 0.48 * slack;
      const wave0 =
        Math.sin(t0 * Math.PI) *
        (sagAmp + Math.sin(nowSec * 20.0 + i * 0.7) * 0.045);
      const wave1 =
        Math.sin(t1 * Math.PI) *
        (sagAmp + Math.sin(nowSec * 20.0 + (i + 1) * 0.7) * 0.045);
      this.scratchSegPos.y -= wave0;
      this.scratchNextPos.y -= wave1;

      const seg = this.cableSegments[i];
      seg.visible = true;
      seg.position
        .copy(this.scratchSegPos)
        .lerp(this.scratchNextPos, 0.5);
      seg.lookAt(this.scratchNextPos);
      const segLen = Math.max(
        0.01,
        this.scratchSegPos.distanceTo(this.scratchNextPos)
      );
      seg.scale.set(1, 1, segLen);

      const mat = seg.material as THREE.MeshBasicMaterial;
      mat.color.set(
        this.zipReeling
          ? '#34d399'
          : tensionRatio > 0.45
          ? '#f43f5e'
          : '#38bdf8'
      );
    }

    return {
      isActive: true,
      tensionRatio,
      traversalState: this.traversalState,
    };
  }

  public getTelemetry(): GrappleSurfaceRangeTelemetry {
    return {
      hasSurfaceHit: this.hasSurfaceHit,
      distanceMeters: Number(this.targetSurfaceDistance.toFixed(1)),
      maxRangeMeters: this.maxRange,
      inGrappleRange: this.inGrappleRange,
      surfaceLabel: this.targetSurfaceLabel,
      surfacePoint: [
        Number(this.targetSurfacePoint.x.toFixed(1)),
        Number(this.targetSurfacePoint.y.toFixed(1)),
        Number(this.targetSurfacePoint.z.toFixed(1)),
      ],
      traversalState: this.traversalState,
      isAttached: this.active,
      anchorLabel: this.anchorLabel,
      ropeLengthMeters: Number(this.ropeLength.toFixed(1)),
      currentTensionG: this.currentTensionG,
    };
  }

  private isDescendantOf(
    obj: THREE.Object3D | null,
    root: THREE.Object3D
  ): boolean {
    let cur: THREE.Object3D | null = obj;
    while (cur) {
      if (cur === root) return true;
      cur = cur.parent;
    }
    return false;
  }
}
