import * as THREE from 'three';
import { GravityVehicleState } from '../types/manifold';
import {
  TRAVERSAL_VEHICLE_CATALOG,
  TraversalVehicleType,
} from '../types/portalAndBiodepth';

export interface FlightInputState {
  forward: boolean;
  backward: boolean;
  strafeLeft: boolean;
  strafeRight: boolean;
  elevateUp: boolean;
  elevateDown: boolean;
  yawLeft: boolean;
  yawRight: boolean;
  boost: boolean;
}

const VEHICLE_ORDER: TraversalVehicleType[] = [
  'twin-turbine-hover-bike',
  'hexapod-spider-walker',
  'delta-rift-glider',
  'aether-rider-5d',
];

export class GravityVehicle5DRig {
  public root: THREE.Group;
  public chassisMesh: THREE.Group;
  public activeVehicleType: TraversalVehicleType = 'twin-turbine-hover-bike';

  // Sub-chassis groups for the 4 traversal vehicles
  private aetherRiderGroup = new THREE.Group();
  private hoverBikeGroup = new THREE.Group();
  private spiderWalkerGroup = new THREE.Group();
  private riftGliderGroup = new THREE.Group();

  // Animated sub-parts
  public reactorRing: THREE.Mesh;
  public leftThruster: THREE.Group;
  public rightThruster: THREE.Group;
  public leftPlume: THREE.Mesh;
  public rightPlume: THREE.Mesh;
  public headlightL: THREE.SpotLight;
  public headlightR: THREE.SpotLight;

  private bikeLeftTurbine!: THREE.Mesh;
  private bikeRightTurbine!: THREE.Mesh;
  private bikeFrontVanes!: THREE.Group;
  private bikeExhaustPlume!: THREE.Mesh;

  private spiderLegs: {
    hipPivot: THREE.Group;
    kneePivot: THREE.Group;
    side: number;
    row: number;
    phaseOffset: number;
  }[] = [];
  private spiderTurretHead!: THREE.Group;

  private gliderLeftWing!: THREE.Group;
  private gliderRightWing!: THREE.Group;
  private gliderTailFin!: THREE.Mesh;

  private state: GravityVehicleState;
  private velocity = new THREE.Vector3();
  private euler = new THREE.Euler(0, 0, 0, 'YXZ');
  private walkGaitPhase = 0;

  constructor(initialPos: [number, number, number] = [0, 6, 0]) {
    this.root = new THREE.Group();
    this.root.name = 'multi-traversal-vehicle-rig';

    this.state = {
      isConstructed: true,
      isMounted: false,
      pos: [...initialPos],
      vel: [0, 0, 0],
      rotation: [0, 0, 0],
      closedLoopPowerMW: 850,
      gravitationalCompression: 1.0,
      airspeedKmh: 0,
      altitudeM: initialPos[1],
      flightMode: 'ground-skimmer',
      closedLoopEnergyCharge: 100,
      spaceShiftCooldown: 0,
      lastCosmicShiftTimestamp: 0,
    };

    this.chassisMesh = new THREE.Group();

    // 1. Build 5D Aether-Rider Interceptor Group
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.28,
      metalness: 0.85,
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.65, 4.2), bodyMat);
    body.castShadow = true;
    this.aetherRiderGroup.add(body);

    const noseGeo = new THREE.ConeGeometry(1.2, 2.2, 4);
    noseGeo.rotateX(Math.PI / 2);
    noseGeo.rotateY(Math.PI / 4);
    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.position.set(0, -0.05, -2.8);
    this.aetherRiderGroup.add(nose);

    const canopyGeo = new THREE.CapsuleGeometry(0.55, 1.2, 8, 16);
    canopyGeo.rotateX(Math.PI / 2);
    const canopyMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.85,
      transparent: true,
      opacity: 0.9,
      clearcoat: 1.0,
    });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 0.42, -0.4);
    this.aetherRiderGroup.add(canopy);

    const wing = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.08, 1.6), bodyMat);
    wing.position.set(0, 0.05, 0.4);
    this.aetherRiderGroup.add(wing);

    const torusGeo = new THREE.TorusGeometry(0.75, 0.18, 16, 32);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.95,
      metalness: 0.9,
      roughness: 0.1,
    });
    this.reactorRing = new THREE.Mesh(torusGeo, torusMat);
    this.reactorRing.position.set(0, 0.1, 1.2);
    this.reactorRing.rotation.x = Math.PI / 2;
    this.aetherRiderGroup.add(this.reactorRing);

    const thrusterPodGeo = new THREE.CylinderGeometry(0.32, 0.38, 1.2, 16);
    thrusterPodGeo.rotateX(Math.PI / 2);
    const thrusterMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2,
    });

    this.leftThruster = new THREE.Group();
    this.leftThruster.add(new THREE.Mesh(thrusterPodGeo, thrusterMat));
    this.leftThruster.position.set(-1.6, 0.0, 1.6);

    this.rightThruster = new THREE.Group();
    this.rightThruster.add(new THREE.Mesh(thrusterPodGeo, thrusterMat));
    this.rightThruster.position.set(1.6, 0.0, 1.6);

    const plumeGeo = new THREE.ConeGeometry(0.28, 1.8, 12, 1, true);
    plumeGeo.rotateX(-Math.PI / 2);
    plumeGeo.translate(0, 0, 0.9);
    const plumeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.leftPlume = new THREE.Mesh(plumeGeo, plumeMat);
    this.leftThruster.add(this.leftPlume);
    this.rightPlume = new THREE.Mesh(plumeGeo, plumeMat);
    this.rightThruster.add(this.rightPlume);

    this.aetherRiderGroup.add(this.leftThruster);
    this.aetherRiderGroup.add(this.rightThruster);

    // 2. Build Twin-Turbine Hover-Bike Group
    this.buildHoverBikeMesh(canopyMat, plumeMat);

    // 3. Build 6-Legged Hexapod Spider-Walker Group
    this.buildSpiderWalkerMesh();

    // 4. Build Delta-Wing Rift-Glider Group
    this.buildRiftGliderMesh(canopyMat);

    // Shared Headlights
    this.headlightL = new THREE.SpotLight(
      0xe0f2fe,
      4.5,
      65,
      Math.PI / 6,
      0.45,
      1.2
    );
    this.headlightL.position.set(-0.6, 0.2, -1.8);
    this.headlightL.target.position.set(-0.6, -0.5, -30);
    this.chassisMesh.add(this.headlightL);
    this.chassisMesh.add(this.headlightL.target);

    this.headlightR = new THREE.SpotLight(
      0xe0f2fe,
      4.5,
      65,
      Math.PI / 6,
      0.45,
      1.2
    );
    this.headlightR.position.set(0.6, 0.2, -1.8);
    this.headlightR.target.position.set(0.6, -0.5, -30);
    this.chassisMesh.add(this.headlightR);
    this.chassisMesh.add(this.headlightR.target);

    this.chassisMesh.add(this.aetherRiderGroup);
    this.chassisMesh.add(this.hoverBikeGroup);
    this.chassisMesh.add(this.spiderWalkerGroup);
    this.chassisMesh.add(this.riftGliderGroup);

    this.root.add(this.chassisMesh);
    this.root.position.set(...initialPos);
    this.setVehicleType('twin-turbine-hover-bike');
  }

  private buildHoverBikeMesh(
    canopyMat: THREE.Material,
    plumeMat: THREE.Material
  ): void {
    const hullMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      metalness: 0.88,
      roughness: 0.2,
      clearcoat: 0.8,
    });
    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x22d3ee,
      emissiveIntensity: 1.1,
      metalness: 0.7,
      roughness: 0.2,
    });

    // Sleek central spine & straddle saddle
    const spine = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.32, 2.6, 8, 16),
      hullMat
    );
    spine.rotation.x = Math.PI / 2;
    this.hoverBikeGroup.add(spine);

    // Front split nose prongs & steering vanes
    this.bikeFrontVanes = new THREE.Group();
    this.bikeFrontVanes.position.set(0, 0, -1.4);
    for (const side of [-1, 1]) {
      const prong = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.26, 1.85),
        hullMat
      );
      prong.position.set(side * 0.42, -0.05, -0.6);
      this.bikeFrontVanes.add(prong);

      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.12, 1.75),
        cyanGlowMat
      );
      strip.position.set(side * 0.52, -0.05, -0.6);
      this.bikeFrontVanes.add(strip);
    }
    this.hoverBikeGroup.add(this.bikeFrontVanes);

    // Twin Outrigger Hover Turbines
    const turbGeo = new THREE.TorusGeometry(0.46, 0.11, 12, 24);
    turbGeo.rotateX(Math.PI / 2);
    this.bikeLeftTurbine = new THREE.Mesh(turbGeo, cyanGlowMat);
    this.bikeLeftTurbine.position.set(-0.78, -0.18, -0.85);
    this.hoverBikeGroup.add(this.bikeLeftTurbine);

    this.bikeRightTurbine = new THREE.Mesh(turbGeo, cyanGlowMat);
    this.bikeRightTurbine.position.set(0.78, -0.18, -0.85);
    this.hoverBikeGroup.add(this.bikeRightTurbine);

    // Windshield Fairing & Handlebars
    const fairing = new THREE.Mesh(
      new THREE.ConeGeometry(0.45, 1.1, 6),
      canopyMat
    );
    fairing.rotation.x = -Math.PI * 0.35;
    fairing.position.set(0, 0.42, -0.75);
    this.hoverBikeGroup.add(fairing);

    // Rear Plasma Afterburner Cone
    const bikePlumeGeo = new THREE.ConeGeometry(0.32, 2.2, 12, 1, true);
    bikePlumeGeo.rotateX(-Math.PI / 2);
    bikePlumeGeo.translate(0, 0, 1.1);
    this.bikeExhaustPlume = new THREE.Mesh(bikePlumeGeo, plumeMat);
    this.bikeExhaustPlume.position.set(0, 0.05, 1.5);
    this.hoverBikeGroup.add(this.bikeExhaustPlume);
  }

  private buildSpiderWalkerMesh(): void {
    const carapaceMat = new THREE.MeshPhysicalMaterial({
      color: 0x1c1917,
      metalness: 0.85,
      roughness: 0.26,
      clearcoat: 0.65,
    });
    const amberJointMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.85,
      metalness: 0.8,
      roughness: 0.2,
    });

    // Armored Cephalothorax Hull
    const thorax = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.15, 1),
      carapaceMat
    );
    thorax.scale.set(1.2, 0.58, 1.45);
    thorax.position.set(0, 0.35, 0.1);
    this.spiderWalkerGroup.add(thorax);

    // Articulated Multi-Ocular Sensor Turret Head
    this.spiderTurretHead = new THREE.Group();
    this.spiderTurretHead.position.set(0, 0.55, -1.15);
    const headPod = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.48, 0.85),
      carapaceMat
    );
    this.spiderTurretHead.add(headPod);
    for (let eye = -2; eye <= 2; eye++) {
      const lens = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 10, 10),
        amberJointMat
      );
      lens.position.set(eye * 0.18, 0.04, -0.44);
      this.spiderTurretHead.add(lens);
    }
    this.spiderWalkerGroup.add(this.spiderTurretHead);

    // 6 Articulated 3-Segment Inverse-Kinematic Legs (3 Left, 3 Right)
    for (const side of [-1, 1]) {
      for (let row = 0; row < 3; row++) {
        const zOffset = (row - 1) * 1.05;
        const hipPivot = new THREE.Group();
        hipPivot.position.set(side * 0.95, 0.22, zOffset);

        // Upper Femur Segment
        const femur = new THREE.Mesh(
          new THREE.CylinderGeometry(0.11, 0.09, 1.35, 10),
          carapaceMat
        );
        femur.rotation.z = -side * 1.15;
        femur.position.set(side * 0.58, 0.32, 0);
        hipPivot.add(femur);

        const kneeJoint = new THREE.Mesh(
          new THREE.SphereGeometry(0.15, 10, 10),
          amberJointMat
        );
        kneeJoint.position.set(side * 1.15, 0.62, 0);
        hipPivot.add(kneeJoint);

        // Lower Tibia Talon Segment
        const kneePivot = new THREE.Group();
        kneePivot.position.set(side * 1.15, 0.62, 0);
        const tibia = new THREE.Mesh(
          new THREE.ConeGeometry(0.12, 1.65, 8),
          carapaceMat
        );
        tibia.rotation.z = side * Math.PI * 0.88;
        tibia.position.set(side * 0.32, -0.72, 0);
        kneePivot.add(tibia);

        hipPivot.add(kneePivot);
        this.spiderWalkerGroup.add(hipPivot);

        // Alternating Tripod Gait Phase (Legs L0, R1, L2 in Phase 0; R0, L1, R2 in Phase PI)
        const isTripodA = (side === -1 && row !== 1) || (side === 1 && row === 1);
        this.spiderLegs.push({
          hipPivot,
          kneePivot,
          side,
          row,
          phaseOffset: isTripodA ? 0 : Math.PI,
        });
      }
    }
  }

  private buildRiftGliderMesh(canopyMat: THREE.Material): void {
    const frameMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e1b4b,
      metalness: 0.9,
      roughness: 0.18,
      clearcoat: 0.9,
    });
    const featherMat = new THREE.MeshPhysicalMaterial({
      color: 0xa855f7,
      emissive: 0xc084fc,
      emissiveIntensity: 0.9,
      roughness: 0.15,
      transmission: 0.55,
      transparent: true,
      opacity: 0.92,
    });

    const fuselage = new THREE.Mesh(
      new THREE.ConeGeometry(0.48, 3.8, 6),
      frameMat
    );
    fuselage.rotation.x = Math.PI / 2;
    this.riftGliderGroup.add(fuselage);

    const cockpit = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.38, 1.1, 8, 14),
      canopyMat
    );
    cockpit.rotation.x = Math.PI / 2;
    cockpit.position.set(0, 0.28, -0.35);
    this.riftGliderGroup.add(cockpit);

    // Articulated Left & Right Swept Delta Wings with Pinion Feathers
    this.gliderLeftWing = new THREE.Group();
    this.gliderRightWing = new THREE.Group();
    for (const side of [-1, 1]) {
      const wingGroup = side === -1 ? this.gliderLeftWing : this.gliderRightWing;
      wingGroup.position.set(side * 0.35, 0.08, 0.1);

      const mainSpar = new THREE.Mesh(
        new THREE.BoxGeometry(2.9, 0.07, 0.42),
        frameMat
      );
      mainSpar.position.set(side * 1.45, 0, 0.25);
      mainSpar.rotation.y = -side * 0.28;
      wingGroup.add(mainSpar);

      for (let f = 0; f < 5; f++) {
        const feather = new THREE.Mesh(
          new THREE.BoxGeometry(0.45, 0.04, 1.45 - f * 0.15),
          featherMat
        );
        feather.position.set(
          side * (0.65 + f * 0.52),
          -0.02,
          0.55 + f * 0.18
        );
        feather.rotation.y = -side * 0.22;
        wingGroup.add(feather);
      }
      this.riftGliderGroup.add(wingGroup);
    }

    this.gliderTailFin = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.95, 1.2),
      featherMat
    );
    this.gliderTailFin.position.set(0, 0.48, 1.45);
    this.riftGliderGroup.add(this.gliderTailFin);
  }

  public setVehicleType(type: TraversalVehicleType): void {
    this.activeVehicleType = type;
    this.aetherRiderGroup.visible = type === 'aether-rider-5d';
    this.hoverBikeGroup.visible = type === 'twin-turbine-hover-bike';
    this.spiderWalkerGroup.visible = type === 'hexapod-spider-walker';
    this.riftGliderGroup.visible = type === 'delta-rift-glider';
  }

  public cycleVehicleType(): TraversalVehicleType {
    const idx = VEHICLE_ORDER.indexOf(this.activeVehicleType);
    const next = VEHICLE_ORDER[(idx + 1) % VEHICLE_ORDER.length];
    this.setVehicleType(next);
    return next;
  }

  public getActiveVehicleSpec() {
    return TRAVERSAL_VEHICLE_CATALOG[this.activeVehicleType];
  }

  public getState(): GravityVehicleState {
    return { ...this.state };
  }

  public setMounted(mounted: boolean) {
    this.state.isMounted = mounted;
  }

  public setPosition(x: number, y: number, z: number) {
    this.root.position.set(x, y, z);
    this.state.pos = [x, y, z];
  }

  public triggerCosmicShiftPulse(): boolean {
    const now = Date.now();
    if (this.state.spaceShiftCooldown > 0) return false;
    this.state.spaceShiftCooldown = 6.0;
    this.state.lastCosmicShiftTimestamp = now;
    this.state.closedLoopEnergyCharge = Math.max(
      15,
      this.state.closedLoopEnergyCharge - 20
    );
    return true;
  }

  public update(
    inputs: FlightInputState,
    evaluateTerrainHeightFn: (x: number, z: number) => number,
    dt: number,
    nowSec: number
  ) {
    if (this.state.spaceShiftCooldown > 0) {
      this.state.spaceShiftCooldown = Math.max(
        0,
        this.state.spaceShiftCooldown - dt
      );
    }
    if (this.state.closedLoopEnergyCharge < 100) {
      this.state.closedLoopEnergyCharge = Math.min(
        100,
        this.state.closedLoopEnergyCharge + dt * 8.5
      );
    }

    this.reactorRing.rotation.z += (this.state.isMounted ? 9.5 : 2.5) * dt;
    if (this.bikeLeftTurbine && this.bikeRightTurbine) {
      const spin = (this.state.isMounted ? 14.0 : 3.0) * dt;
      this.bikeLeftTurbine.rotation.y += spin;
      this.bikeRightTurbine.rotation.y -= spin;
    }

    const currentGroundY = evaluateTerrainHeightFn(
      this.root.position.x,
      this.root.position.z
    );

    if (!this.state.isMounted) {
      const parkOffset =
        this.activeVehicleType === 'hexapod-spider-walker' ? 0.95 : 0.65;
      this.root.position.y = THREE.MathUtils.lerp(
        this.root.position.y,
        currentGroundY + parkOffset,
        dt * 6.0
      );
      this.leftPlume.visible = false;
      this.rightPlume.visible = false;
      if (this.bikeExhaustPlume) this.bikeExhaustPlume.visible = false;
      this.state.airspeedKmh = 0;
      this.state.altitudeM = this.root.position.y;
      this.state.pos = [
        this.root.position.x,
        this.root.position.y,
        this.root.position.z,
      ];
      return;
    }

    this.leftPlume.visible = true;
    this.rightPlume.visible = true;
    if (this.bikeExhaustPlume) this.bikeExhaustPlume.visible = true;

    const altitudeAboveGround = this.root.position.y - currentGroundY;
    this.state.altitudeM = Math.max(0, this.root.position.y);

    if (altitudeAboveGround < 8.0) {
      this.state.flightMode = 'ground-skimmer';
    } else if (this.root.position.y < 95.0) {
      this.state.flightMode = 'atmospheric-glide';
    } else {
      this.state.flightMode = 'orbital-vacuum';
    }

    const forwardVec = new THREE.Vector3(0, 0, -1).applyQuaternion(
      this.root.quaternion
    );
    const rightVec = new THREE.Vector3(1, 0, 0).applyQuaternion(
      this.root.quaternion
    );
    const upVec = new THREE.Vector3(0, 1, 0).applyQuaternion(
      this.root.quaternion
    );

    const vType = this.activeVehicleType;
    const boostFactor = inputs.boost ? 2.45 : 1.0;
    const baseAccel =
      vType === 'twin-turbine-hover-bike'
        ? 40.0
        : vType === 'delta-rift-glider'
        ? 34.0
        : vType === 'hexapod-spider-walker'
        ? 26.0
        : 32.0;
    const accelRate = baseAccel * boostFactor;
    const turnRate = vType === 'twin-turbine-hover-bike' ? 1.95 : 1.45;

    if (inputs.yawLeft) this.euler.y += turnRate * dt;
    if (inputs.yawRight) this.euler.y -= turnRate * dt;

    let targetPitch = 0;
    let targetRoll = 0;
    const bankStrength = vType === 'twin-turbine-hover-bike' ? 0.62 : 0.38;

    if (inputs.forward) targetPitch -= 0.18;
    if (inputs.backward) targetPitch += 0.15;
    if (inputs.strafeLeft || inputs.yawLeft) targetRoll += bankStrength;
    if (inputs.strafeRight || inputs.yawRight) targetRoll -= bankStrength;

    this.euler.x = THREE.MathUtils.lerp(this.euler.x, targetPitch, dt * 5.0);
    this.euler.z = THREE.MathUtils.lerp(this.euler.z, targetRoll, dt * 6.5);
    this.root.quaternion.setFromEuler(this.euler);

    const thrust = new THREE.Vector3();
    if (inputs.forward) thrust.addScaledVector(forwardVec, accelRate);
    if (inputs.backward) thrust.addScaledVector(forwardVec, -accelRate * 0.65);
    if (inputs.strafeLeft) thrust.addScaledVector(rightVec, -accelRate * 0.72);
    if (inputs.strafeRight) thrust.addScaledVector(rightVec, accelRate * 0.72);
    if (inputs.elevateUp) thrust.addScaledVector(upVec, accelRate * 0.9);
    if (inputs.elevateDown) thrust.addScaledVector(upVec, -accelRate * 0.65);

    // Delta Rift-Glider generates natural aerodynamic lift proportional to forward speed
    const horizSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    if (vType === 'delta-rift-glider' && horizSpeed > 4.0) {
      thrust.y += horizSpeed * 0.55;
    }

    this.velocity.addScaledVector(thrust, dt);

    // Vehicle-specific ground interaction & suspension
    if (vType === 'hexapod-spider-walker') {
      // Spider-Walker hugs and climbs terrain/cliffs smoothly with hydraulic step-up!
      const targetSpiderY = currentGroundY + 1.15;
      if (inputs.elevateUp && this.root.position.y <= targetSpiderY + 0.6) {
        this.velocity.y = 14.5; // Hydraulic Spider-Leap!
      } else {
        this.root.position.y = THREE.MathUtils.lerp(
          this.root.position.y,
          Math.max(targetSpiderY, this.root.position.y + this.velocity.y * dt),
          dt * 10.0
        );
        this.velocity.y -= 18.0 * dt;
      }

      // Animate 6 Inverse-Kinematic Spider Legs in alternating tripod gait
      this.walkGaitPhase += dt * (2.5 + horizSpeed * 1.15);
      for (const leg of this.spiderLegs) {
        const phase = this.walkGaitPhase + leg.phaseOffset;
        const swing = Math.sin(phase) * Math.min(1.0, horizSpeed * 0.18);
        const lift = Math.max(0, Math.cos(phase)) * Math.min(1.0, horizSpeed * 0.22);
        leg.hipPivot.rotation.y = swing * 0.48 * leg.side;
        leg.hipPivot.rotation.z = lift * 0.38 * leg.side;
        leg.kneePivot.rotation.z = -lift * 0.55 * leg.side;
      }
      if (this.spiderTurretHead) {
        this.spiderTurretHead.rotation.y = Math.sin(nowSec * 2.2) * 0.22;
      }
    } else if (this.state.flightMode === 'ground-skimmer') {
      const hoverHeight = vType === 'twin-turbine-hover-bike' ? 1.55 : 2.2;
      const targetHoverY = currentGroundY + hoverHeight;
      const heightDiff = targetHoverY - this.root.position.y;
      if (heightDiff > 0) {
        this.velocity.y += heightDiff * 15.0 * dt;
      }
    }

    // Animate Delta Rift-Glider wing flex
    if (vType === 'delta-rift-glider' && this.gliderLeftWing && this.gliderRightWing) {
      const wingFlap =
        Math.sin(nowSec * (inputs.boost ? 7.5 : 3.2)) *
        (0.12 + Math.min(0.18, horizSpeed * 0.01));
      this.gliderLeftWing.rotation.z = wingFlap;
      this.gliderRightWing.rotation.z = -wingFlap;
    }

    // Animate Hover-Bike front steering vanes
    if (vType === 'twin-turbine-hover-bike' && this.bikeFrontVanes) {
      const steerTarget =
        (inputs.strafeLeft || inputs.yawLeft ? 0.28 : 0) +
        (inputs.strafeRight || inputs.yawRight ? -0.28 : 0);
      this.bikeFrontVanes.rotation.y = THREE.MathUtils.lerp(
        this.bikeFrontVanes.rotation.y,
        steerTarget,
        dt * 10
      );
    }

    const dragCoeff = this.state.flightMode === 'orbital-vacuum' ? 0.998 : 0.962;
    this.velocity.multiplyScalar(dragCoeff);
    this.root.position.addScaledVector(this.velocity, dt);

    if (this.root.position.y < currentGroundY + 0.55) {
      this.root.position.y = currentGroundY + 0.55;
      if (this.velocity.y < 0) this.velocity.y = 0;
    }

    const speed = this.velocity.length();
    const plumeScale = THREE.MathUtils.clamp(
      speed * 0.08 + (inputs.forward ? 0.6 : 0.2),
      0.3,
      2.5
    );
    this.leftPlume.scale.setScalar(plumeScale);
    this.rightPlume.scale.setScalar(plumeScale);
    if (this.bikeExhaustPlume) {
      this.bikeExhaustPlume.scale.setScalar(plumeScale * 1.15);
    }

    this.leftThruster.rotation.x = inputs.forward
      ? 0.2
      : inputs.backward
      ? -0.2
      : 0;
    this.rightThruster.rotation.x = this.leftThruster.rotation.x;

    this.state.airspeedKmh = Math.round(speed * 3.6);
    this.state.closedLoopPowerMW = Math.round(
      750 + speed * 12.0 + (inputs.boost ? 450 : 0)
    );
    this.state.gravitationalCompression = Number(
      (1.0 + (speed / 45.0) * 0.8).toFixed(2)
    );
    this.state.pos = [
      this.root.position.x,
      this.root.position.y,
      this.root.position.z,
    ];
    this.state.vel = [this.velocity.x, this.velocity.y, this.velocity.z];
    this.state.rotation = [this.euler.x, this.euler.y, this.euler.z];
  }
}

