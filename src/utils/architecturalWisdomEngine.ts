import * as THREE from 'three';
import {
  ArchitecturalWisdomBlueprintSpec,
  AstraArgonSynthesisParadigm,
  BuildingBlockShape,
  BuildingPresetBlock,
  BuildingPresetBlueprint,
  ProceduralPropModelSpec,
} from '../types/manifold';
import { prepareDeformableSkinGeometry } from './skinTopologyEngine';
import { getProceduralPhotorealisticTerrainTextures } from './engineImmersionPipeline';
import { sharedGeometryPool } from './graphicsMeshAndCollisionEngine';

// Deterministic Mulberry32 PRNG for architectural synthesis
function createArchRng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 1. ALAN SCHOEN TPMS GYROID & SCHWARZ-P MINIMAL SURFACE SHELL GEOMETRY
 * Evaluates g(x,y,z) = sin(kx)cos(ky) + sin(ky)cos(kz) + sin(kz)cos(kx)
 * across a parametric architectural shell to carve zero-mean-curvature structural ribs
 * and acoustic hyperbolic flutes.
 */
export function createTPMSGyroidShellGeometry(
  radius: number = 1.2,
  height: number = 2.4,
  radialSegs: number = 28,
  heightSegs: number = 20,
  gyroidFreq: number = 2.6,
  modulationDepth: number = 0.34
): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(
    radius * 0.88,
    radius * 1.08,
    height,
    radialSegs,
    heightSegs,
    false
  );
  const pos = geo.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);

    const rHoriz = Math.hypot(vx, vz);
    if (rHoriz < 0.001) continue;

    const nx = vx / rHoriz;
    const nz = vz / rHoriz;

    const kx = vx * gyroidFreq;
    const ky = vy * gyroidFreq;
    const kz = vz * gyroidFreq;

    // Alan Schoen Gyroid + Hermann Schwarz P harmonic superposition
    const gyroid =
      Math.sin(kx) * Math.cos(ky) +
      Math.sin(ky) * Math.cos(kz) +
      Math.sin(kz) * Math.cos(kx);
    const schwarzP = (Math.cos(kx) + Math.cos(ky) + Math.cos(kz)) * 0.35;

    // Quantized architectural Brutalist step-ribbing mixed with smooth minimal surface
    const combined = gyroid * 0.75 + schwarzP * 0.25;
    const ribStep = Math.round(combined * 3.0) / 3.0;
    const displacement =
      (combined * 0.65 + ribStep * 0.35) * radius * modulationDepth;

    // Taper modulation at top and bottom capitals for clean structural seating
    const yNorm = Math.abs(vy) / (height * 0.5);
    const capitalEnvelope = 1.0 - Math.pow(Math.min(1, yNorm), 4) * 0.65;

    const newR = Math.max(radius * 0.28, rHoriz + displacement * capitalEnvelope);
    pos.setXYZ(i, nx * newR, vy, nz * newR);
  }

  geo.computeVertexNormals();
  return prepareDeformableSkinGeometry(geo);
}

/**
 * 2. BELTRAMI NON-EUCLIDEAN HYPERBOLIC PSEUDOSPHERE GEOMETRY
 * Generates a constant negative Gaussian curvature (K = -1/R^2) tractrix trumpet
 * with chiral architectural fluting.
 */
export function createHyperbolicPseudosphereGeometry(
  scaleRadius: number = 1.1,
  height: number = 2.6,
  uSegs: number = 24,
  vSegs: number = 18,
  chiralTwist: number = 1.4
): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(
    scaleRadius * 0.18,
    scaleRadius * 1.25,
    height,
    uSegs,
    vSegs,
    false
  );
  const pos = geo.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);

    const rHoriz = Math.hypot(vx, vz);
    if (rHoriz < 0.0005) continue;

    const baseAngle = Math.atan2(vz, vx);
    // Map vy in [-height/2, +height/2] to tractrix parameter u in [0.18, 2.35]
    const t = (vy + height * 0.5) / Math.max(0.01, height);
    const u = 0.18 + t * 2.15;

    // sech(u) = 1 / cosh(u)
    const sechU = 1.0 / Math.cosh(u);
    const flute =
      1.0 + 0.14 * Math.cos(baseAngle * 6 + t * chiralTwist * Math.PI);
    const pseudoR = scaleRadius * 1.32 * sechU * flute;

    const twistedAngle = baseAngle + t * chiralTwist;
    pos.setXYZ(
      i,
      Math.cos(twistedAngle) * pseudoR,
      vy,
      Math.sin(twistedAngle) * pseudoR
    );
  }

  geo.computeVertexNormals();
  return prepareDeformableSkinGeometry(geo);
}

/**
 * 3. DIFFERENTIAL GROWTH & REACTION-DIFFUSION CORAL PLEURA RIBBON GEOMETRY
 * Simulates differential edge-growth buckling where outer perimeters expand faster
 * than the central spine, folding into undulating hyperbolic ruffles.
 */
export function createDifferentialGrowthRibbonGeometry(
  radius: number = 1.0,
  height: number = 2.2,
  lobeFreq: number = 5,
  twistTurns: number = 1.5,
  radialSegs: number = 28,
  heightSegs: number = 22
): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(
    radius * 0.65,
    radius * 0.85,
    height,
    radialSegs,
    heightSegs,
    false
  );
  const pos = geo.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const rHoriz = Math.hypot(vx, vz);
    if (rHoriz < 0.001) continue;

    const theta = Math.atan2(vz, vx);
    const yNorm = (vy + height * 0.5) / Math.max(0.01, height);

    // Multi-octave differential buckling wave
    const phase = theta * lobeFreq + yNorm * twistTurns * Math.PI * 2;
    const primaryFold = Math.sin(phase);
    const secondaryRuffle = 0.42 * Math.sin(phase * 2.0 - theta * 2.0);
    const tertiaryCrenellation = 0.18 * Math.cos(phase * 3.0 + vy * 3.2);

    const rMod =
      radius *
      (0.72 +
        0.38 * primaryFold +
        0.22 * secondaryRuffle +
        0.12 * tertiaryCrenellation);
    const yBuckle =
      vy + 0.14 * height * Math.cos(phase) * Math.sin(theta * lobeFreq);

    pos.setXYZ(i, Math.cos(theta) * rMod, yBuckle, Math.sin(theta) * rMod);
  }

  geo.computeVertexNormals();
  return prepareDeformableSkinGeometry(geo);
}

/**
 * 4. CALABI-YAU QUINTIC MANIFOLD ROSETTE GEOMETRY
 * Projects complex Fermat/Calabi-Yau cross-sections into a 3D multi-petalled
 * topological portal sculpture.
 */
export function createCalabiYauRosetteGeometry(
  radius: number = 1.0,
  nFold: number = 5
): THREE.BufferGeometry {
  const geo = new THREE.TorusKnotGeometry(
    radius * 0.68,
    radius * 0.22,
    72,
    14,
    nFold,
    nFold - 2
  );
  const pos = geo.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const r = Math.hypot(vx, vy, vz);
    if (r < 0.001) continue;

    const phi = Math.atan2(vy, vx);
    const psi = Math.atan2(vz, Math.hypot(vx, vy));
    const calabiWave =
      1.0 +
      0.18 * Math.cos(nFold * phi) * Math.sin(nFold * psi) +
      0.08 * Math.sin((nFold + 2) * (phi + psi));

    pos.setXYZ(i, vx * calabiWave, vy * calabiWave, vz * calabiWave);
  }

  geo.computeVertexNormals();
  return prepareDeformableSkinGeometry(geo);
}

/**
 * 5. CARLO SCARPA STEPPED BRUTALIST CORBEL & BRASS WATER-CHANNEL ASSEMBLY
 * Inspired by Carlo Scarpa's Brion Sanctuary & Castelvecchio Museum:
 * Stepped béton-brut ziggurat corbels with recessed gilded brass water-channels.
 */
export function buildScarpaSteppedCorbelGroup(
  width: number,
  height: number,
  depth: number,
  steps: number,
  concreteMat: THREE.Material,
  brassMat: THREE.Material
): THREE.Group {
  const group = new THREE.Group();
  const stepH = height / Math.max(2, steps);

  for (let s = 0; s < steps; s++) {
    const ratio = (s + 1) / steps;
    const w = width * (0.42 + 0.58 * ratio);
    const d = depth * (0.42 + 0.58 * ratio);

    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(w, stepH * 0.88, d),
      concreteMat
    );
    slab.position.y = s * stepH + stepH * 0.44;
    slab.castShadow = true;
    slab.receiveShadow = true;
    group.add(slab);

    // Recessed Carlo Scarpa brass reveal seam between concrete steps
    if (s % 2 === 0) {
      const reveal = new THREE.Mesh(
        new THREE.BoxGeometry(w * 1.03, stepH * 0.14, d * 1.03),
        brassMat
      );
      reveal.position.y = (s + 1) * stepH - stepH * 0.06;
      group.add(reveal);
    }
  }

  return group;
}

/**
 * 6. BUCKMINSTER FULLER / KENNETH SNELSON DISCONTINUOUS-COMPRESSION TENSEGRITY TOWER
 * Compression struts float inside a continuous prestressed tension-cable hyperboloid net.
 */
export function buildTensegrityPrismTowerGroup(
  radius: number,
  height: number,
  tiers: number,
  strutMat: THREE.Material,
  cableMat: THREE.Material,
  nodeMat: THREE.Material
): THREE.Group {
  const group = new THREE.Group();
  const tierH = height / Math.max(1, tiers);

  for (let t = 0; t < tiers; t++) {
    const tierGroup = new THREE.Group();
    tierGroup.position.y = t * tierH;
    const chirality = t % 2 === 0 ? 1 : -1;

    // 3 Skewed Floating Compression Struts per Tensegrity Simplex Tier
    for (let i = 0; i < 3; i++) {
      const a0 = (i / 3) * Math.PI * 2 + t * 0.52;
      const a1 = a0 + chirality * ((Math.PI * 2) / 3 + 0.48);

      const p0 = new THREE.Vector3(
        Math.cos(a0) * radius,
        0.08 * tierH,
        Math.sin(a0) * radius
      );
      const p1 = new THREE.Vector3(
        Math.cos(a1) * radius * 0.92,
        0.95 * tierH,
        Math.sin(a1) * radius * 0.92
      );

      const dir = new THREE.Vector3().subVectors(p1, p0);
      const len = dir.length();
      const mid = new THREE.Vector3().addVectors(p0, p1).multiplyScalar(0.5);

      const strut = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.065, radius * 0.065, len, 6),
        strutMat
      );
      strut.position.copy(mid);
      strut.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir.normalize()
      );
      strut.castShadow = true;
      tierGroup.add(strut);

      // End-cap tensegrity tendons & sculpted hyperbolic clevis nodes (replaces OctahedronGeometry)
      const nodeGeo = createHyperbolicPseudosphereGeometry(radius * 0.1, radius * 0.22, 8, 6, 1.3);
      const nodeBot = new THREE.Mesh(nodeGeo, nodeMat);
      nodeBot.position.copy(p0);
      tierGroup.add(nodeBot);

      const nodeTop = new THREE.Mesh(nodeGeo, nodeMat);
      nodeTop.position.copy(p1);
      tierGroup.add(nodeTop);
    }

    // Prestressed Differential-Growth Tension Cable Ribbon
    const tensionRing = new THREE.Mesh(
      createDifferentialGrowthRibbonGeometry(radius * 0.96, radius * 0.12, 7, 0.25, 20, 8),
      cableMat
    );
    tensionRing.position.y = tierH * 0.92;
    tierGroup.add(tensionRing);

    group.add(tierGroup);
  }

  return group;
}

/**
 * 7. THEO JANSEN STRANDBEEST & U-RAM CHOE KINETIC CLOCKWORK RIB LINKAGE
 * Exposed mechanical linkage with counter-rotating planetary gears and articulated
 * breathing ribs that animate automatically in the 60fps viewport loop.
 */
export function buildTheoJansenKineticLinkageGroup(
  scale: number,
  frameMat: THREE.Material,
  brassMat: THREE.Material,
  glowMat: THREE.Material
): THREE.Group {
  const group = new THREE.Group();

  // Central Crankshaft Spine
  const spine = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12 * scale, 0.12 * scale, 2.2 * scale, 8),
    frameMat
  );
  spine.rotation.z = Math.PI / 2;
  group.add(spine);

  // Counter-Rotating Epicyclic Gear Wheels (tagged with isKineticRotor for 60fps spin)
  for (const side of [-1, 1]) {
    const gearGroup = new THREE.Group();
    gearGroup.position.x = side * 0.72 * scale;
    gearGroup.userData.isKineticRotor = true;
    gearGroup.userData.spinAxis = 'x';
    group.add(gearGroup);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.58 * scale, 0.055 * scale, 8, 18),
      brassMat
    );
    rim.rotation.y = Math.PI / 2;
    gearGroup.add(rim);

    // 6 Planar Linkage Triangles (Theo Jansen Holy Numbers proportion approximation)
    for (let k = 0; k < 6; k++) {
      const ang = (k / 6) * Math.PI * 2;
      const spoke = new THREE.Mesh(
        new THREE.BoxGeometry(0.04 * scale, 1.12 * scale, 0.06 * scale),
        k % 2 === 0 ? frameMat : glowMat
      );
      spoke.rotation.x = ang;
      gearGroup.add(spoke);
    }
  }

  // U-Ram Choe Articulated Breathing Rib Pairs (tagged with isPendulum for harmonic oscillation)
  const ribPivot = new THREE.Group();
  ribPivot.userData.isPendulum = true;
  group.add(ribPivot);

  for (let r = 0; r < 6; r++) {
    const xOff = (r - 2.5) * 0.34 * scale;
    const ribArc = new THREE.Mesh(
      new THREE.TorusGeometry(
        0.82 * scale * (1 - Math.abs(r - 2.5) * 0.08),
        0.042 * scale,
        6,
        16,
        Math.PI * 1.25
      ),
      r % 2 === 0 ? brassMat : glowMat
    );
    ribArc.position.set(xOff, 0, 0);
    ribArc.rotation.y = Math.PI / 2;
    ribArc.rotation.z = -Math.PI * 0.12;
    ribPivot.add(ribArc);
  }

  return group;
}

/**
 * 7B. MICHAEL HANSMEYER COMPUTATIONAL SUBDIVIDED COLUMN & DENDRIFORM CAPITAL GEOMETRY
 * Multi-tier harmonic pleat subdivision with classical entasis and flaring vault capital.
 */
export function createHansmeyerSubdividedColumnGeometry(
  radius: number = 0.42,
  height: number = 1.6,
  pleatOrder: number = 8
): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(
    radius * 0.92,
    radius * 1.08,
    height,
    32,
    20,
    false
  );
  const pos = geo.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const rHoriz = Math.hypot(vx, vz);
    if (rHoriz < 0.001) continue;

    const theta = Math.atan2(vz, vx);
    const yNorm = (vy + height * 0.5) / Math.max(0.01, height); // 0 at base, 1 at capital

    // Classical entasis belly + flaring dendriform vault capital at top (yNorm > 0.72)
    const entasis = 1.0 + 0.14 * Math.sin(yNorm * Math.PI);
    const capitalFlare =
      yNorm > 0.72 ? Math.pow((yNorm - 0.72) / 0.28, 1.6) * 0.68 : 0;
    const baseSpread =
      yNorm < 0.18 ? Math.pow((0.18 - yNorm) / 0.18, 1.5) * 0.32 : 0;

    // Recursive multi-frequency Hansmeyer pleat bifurcation
    const f1 = Math.cos(theta * pleatOrder);
    const f2 = 0.48 * Math.cos(theta * pleatOrder * 2 + yNorm * Math.PI * 2);
    const f3 = 0.24 * Math.cos(theta * pleatOrder * 4 - yNorm * Math.PI * 4);
    const pleatMod = 1.0 + (0.16 * f1 + 0.09 * f2 + 0.05 * f3) * (1.0 + capitalFlare * 0.6);

    const finalR = rHoriz * (entasis + capitalFlare + baseSpread) * pleatMod;
    pos.setXYZ(i, Math.cos(theta) * finalR, vy, Math.sin(theta) * finalR);
  }

  geo.computeVertexNormals();
  return prepareDeformableSkinGeometry(geo);
}

/**
 * 7C. ZAHA HADID CODE / FREI OTTO DOUBLY-CURVED COFFERED VAULT SHELL GEOMETRY
 * Generates a tension-cambered structural deck with recessed acoustic coffers along its soffit
 * and swept aerodynamic edge beams (replaces raw BoxGeometry slabs).
 */
export function createZahaCofferedVaultShellGeometry(
  span: number = 1.6,
  thickness: number = 0.24,
  camberArch: number = 0.22
): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(span, thickness, span, 14, 4, 14);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const halfSpan = span * 0.5;

  for (let i = 0; i < pos.count; i++) {
    let vx = pos.getX(i);
    let vy = pos.getY(i);
    let vz = pos.getZ(i);

    const nx = vx / halfSpan; // [-1, 1]
    const nz = vz / halfSpan; // [-1, 1]
    const rNorm = Math.min(1.4, Math.hypot(nx, nz));

    // Swept Zaha Hadid parabolic pinched waist along mid-edges & flared corner cantilevers
    const edgeSweep = 0.92 + 0.14 * (nx * nx * nz * nz);
    vx *= edgeSweep;
    vz *= edgeSweep;

    // Funicular arch camber (lifts center soffit into a self-supporting shell vault)
    const archLift = (1.0 - Math.min(1, rNorm * rNorm)) * camberArch;
    vy += archLift;

    // Recessed coffered waffle ribs on underside soffit (vy < 0)
    if (vy < archLift) {
      const cofferGrid =
        Math.sin(nx * Math.PI * 3) * Math.sin(nz * Math.PI * 3);
      if (cofferGrid > 0.2) {
        vy += cofferGrid * thickness * 0.42; // Carve recessed coffer pocket upward into soffit
      }
    }

    pos.setXYZ(i, vx, vy, vz);
  }

  geo.computeVertexNormals();
  return prepareDeformableSkinGeometry(geo);
}

/**
 * 7D. SANTIAGO CALATRAVA RIBBED PARABOLIC ARCH & FLYING BUTTRESS GEOMETRY
 * Sweeps a variable-section parabolic funicular arch with cantilevered radial rib-fins.
 */
export function createCalatravaRibbedParabolicArchGeometry(
  span: number = 1.5,
  height: number = 1.25
): THREE.BufferGeometry {
  const geo = new THREE.TorusGeometry(span * 0.48, span * 0.085, 14, 32, Math.PI);
  const pos = geo.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);

    const archAngle = Math.atan2(vy, vx); // [0, PI]
    const sinA = Math.sin(archAngle);

    // Parabolic apex sharpening + rhythmic Calatrava radial rib-fin flutes along the extrados
    const ribFin = 1.0 + 0.34 * Math.pow(Math.max(0, Math.cos(archAngle * 14)), 2.0);
    const apexStretch = 1.0 + 0.28 * Math.pow(sinA, 1.8);

    pos.setXYZ(
      i,
      vx * (0.95 + 0.08 * ribFin),
      vy * apexStretch * (height / Math.max(0.1, span * 0.48)) * (0.94 + 0.12 * ribFin),
      vz * ribFin
    );
  }

  geo.computeVertexNormals();
  return prepareDeformableSkinGeometry(geo);
}

/**
 * 7E. NERI OXMAN / KUROKAWA BIOPOLYMER MONOCOQUE CAPSULE GEOMETRY
 * Replaces raw BoxGeometry habitat pods with an aerodynamic pleated monocoque shell
 * featuring a recessed refractive oculus aperture.
 */
export function createOxmanBiopolymerCapsuleGeometry(
  width: number = 1.4,
  height: number = 1.0,
  depth: number = 1.2
): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.5, 24, 18);
  const pos = geo.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i) * 2; // [-1, 1]
    const vy = pos.getY(i) * 2; // [-1, 1]
    const vz = pos.getZ(i) * 2; // [-1, 1]

    // Superquadric monocoque hull envelope (rounded tectonic chamfer instead of raw box or sphere)
    const signX = Math.sign(vx) || 1;
    const signY = Math.sign(vy) || 1;
    const signZ = Math.sign(vz) || 1;
    let sx = signX * Math.pow(Math.abs(vx), 0.68) * width * 0.5;
    let sy = signY * Math.pow(Math.abs(vy), 0.72) * height * 0.5;
    let sz = signZ * Math.pow(Math.abs(vz), 0.68) * depth * 0.5;

    // Neri Oxman chitin-pleat longitudinal structural ribs
    const pleat = 1.0 + 0.06 * Math.cos(vy * Math.PI * 5) * Math.sin(vx * Math.PI * 3);
    sx *= pleat;
    sy *= pleat;

    // Recessed circular oculus window funnel on front face (vz > 0.45)
    if (vz > 0.45) {
      const rOculus = Math.hypot(vx, vy);
      if (rOculus < 0.46) {
        // Smooth inward bezel funnel
        const recess = Math.cos((rOculus / 0.46) * Math.PI * 0.5);
        sz -= recess * depth * 0.22;
      } else if (rOculus < 0.62) {
        // Raised oculus cowling rim
        sz += 0.06 * depth;
      }
    }

    pos.setXYZ(i, sx, sy, sz);
  }

  geo.computeVertexNormals();
  return prepareDeformableSkinGeometry(geo);
}

/**
 * 8. MODULAR ARCHITECTURAL BLOCK SUB-ASSEMBLIES (High-value computational architectural forms)
 */
export function buildMasterArchitecturalModuleMesh(
  block: BuildingPresetBlock,
  unit: number
): THREE.Group {
  const modGroup = new THREE.Group();

  const primaryMat =
    sharedGeometryPool.getOrCreateNoiseBlendedArchitecturalMaterial({
      key: `arch-mod-primary-${block.color}-${block.emissive ? 'em' : 'std'}`,
      baseColor: block.color,
      veinColor: block.emissive ? '#f8fafc' : block.color,
      emissiveColor: block.emissive ? block.color : '#020617',
      emissiveIntensity: block.emissive ? 0.48 : 0.06,
      metalness: 0.58,
      roughness: 0.24,
      clearcoat: 0.78,
      wearIntensity: 0.46,
      wearScale: 0.92,
      veinDensity: 1.75,
      veinEmissiveStrength: block.emissive ? 0.95 : 0.68,
    });

  const darkTectonicMat =
    sharedGeometryPool.getOrCreateNoiseBlendedArchitecturalMaterial({
      key: `arch-mod-tectonic-dark-${block.color}`,
      baseColor: '#141c2b',
      veinColor: block.color,
      wearTintColor: '#475569',
      emissiveColor: '#090d16',
      emissiveIntensity: 0.08,
      metalness: 0.84,
      roughness: 0.28,
      clearcoat: 0.65,
      wearIntensity: 0.52,
      wearScale: 0.85,
      veinDensity: 1.6,
      veinEmissiveStrength: 0.75,
    });

  const brassAccentMat =
    sharedGeometryPool.getOrCreateNoiseBlendedArchitecturalMaterial({
      key: `arch-mod-brass-accent-${block.color}`,
      baseColor: '#f59e0b',
      veinColor: block.color,
      wearTintColor: '#fef3c7',
      emissiveColor: block.color,
      emissiveIntensity: 0.32,
      metalness: 0.88,
      roughness: 0.2,
      clearcoat: 0.82,
      wearIntensity: 0.38,
      wearScale: 1.15,
      veinDensity: 2.1,
      veinEmissiveStrength: 0.88,
    });

  const shape: BuildingBlockShape = block.shape;
  const uKey = unit.toFixed(2);

  switch (shape) {
    case 'pillar': {
      // Michael Hansmeyer Computational Subdivided Column with Dendriform Vault Capital
      const shaftGeo = sharedGeometryPool.getOrCreateGeometry(
        `arch-pillar-shaft-${uKey}`,
        () => createHansmeyerSubdividedColumnGeometry(unit * 0.28, unit * 0.98, 8)
      );
      const shaft = new THREE.Mesh(shaftGeo, primaryMat);
      shaft.castShadow = true;
      shaft.receiveShadow = true;
      modGroup.add(shaft);

      const collarGeo = sharedGeometryPool.getOrCreateGeometry(
        `arch-pillar-collar-${uKey}`,
        () =>
          createDifferentialGrowthRibbonGeometry(
            unit * 0.34,
            unit * 0.14,
            8,
            0.25,
            20,
            8
          )
      );
      const collarRing = new THREE.Mesh(collarGeo, brassAccentMat);
      collarRing.position.y = unit * 0.34;
      modGroup.add(collarRing);
      break;
    }

    case 'cantilever-deck': {
      // Zaha Hadid CODE / Frei Otto Doubly-Curved Coffered Funicular Vault Shell Deck
      const deckGeo = sharedGeometryPool.getOrCreateGeometry(
        `arch-cantilever-deck-${uKey}`,
        () =>
          createZahaCofferedVaultShellGeometry(
            unit * 1.08,
            unit * 0.18,
            unit * 0.16
          )
      );
      const deckVault = new THREE.Mesh(deckGeo, darkTectonicMat);
      deckVault.castShadow = true;
      deckVault.receiveShadow = true;
      modGroup.add(deckVault);

      // Swept Parabolic Under-Slung Tension Rib Arch supporting the cantilever soffit
      const soffitGeo = sharedGeometryPool.getOrCreateGeometry(
        `arch-cantilever-soffit-${uKey}`,
        () => createCalatravaRibbedParabolicArchGeometry(unit * 0.96, unit * 0.32)
      );
      const soffitArch = new THREE.Mesh(soffitGeo, primaryMat);
      soffitArch.position.y = -unit * 0.24;
      modGroup.add(soffitArch);

      // Aerodynamic Perimeter Balustrade Ribbon
      const railGeo = sharedGeometryPool.getOrCreateGeometry(
        `arch-cantilever-rail-${uKey}`,
        () =>
          createDifferentialGrowthRibbonGeometry(
            unit * 0.56,
            unit * 0.1,
            4,
            0.18,
            24,
            6
          )
      );
      const rail = new THREE.Mesh(railGeo, brassAccentMat);
      rail.position.y = unit * 0.14;
      modGroup.add(rail);
      break;
    }

    case 'arch': {
      // Santiago Calatrava Ribbed Parabolic Funicular Vault Arch + Calabi-Yau Keystone
      const archGeo = sharedGeometryPool.getOrCreateGeometry(
        `arch-main-parabolic-${uKey}`,
        () => createCalatravaRibbedParabolicArchGeometry(unit * 0.98, unit * 0.62)
      );
      const mainArch = new THREE.Mesh(archGeo, primaryMat);
      mainArch.position.y = -unit * 0.22;
      mainArch.castShadow = true;
      modGroup.add(mainArch);

      const keystoneGeo = sharedGeometryPool.getOrCreateGeometry(
        `arch-keystone-rosette-${uKey}`,
        () => createCalabiYauRosetteGeometry(unit * 0.16, 5)
      );
      const keystone = new THREE.Mesh(keystoneGeo, brassAccentMat);
      keystone.position.y = unit * 0.38;
      modGroup.add(keystone);
      break;
    }

    case 'dome': {
      // Schoen TPMS Gyroid & Ribbed Oculus Vault Dome
      const domeGeo = sharedGeometryPool.getOrCreateGeometry(
        `arch-dome-gyroid-${uKey}`,
        () =>
          createTPMSGyroidShellGeometry(
            unit * 0.54,
            unit * 0.72,
            22,
            14,
            3.0,
            0.32
          )
      );
      const domeShell = new THREE.Mesh(domeGeo, primaryMat);
      domeShell.position.y = -unit * 0.06;
      domeShell.castShadow = true;
      modGroup.add(domeShell);

      const oculusGeo = sharedGeometryPool.getOrCreateGeometry(
        `arch-dome-oculus-${uKey}`,
        () => createCalabiYauRosetteGeometry(unit * 0.24, 5)
      );
      const oculusCrown = new THREE.Mesh(oculusGeo, brassAccentMat);
      oculusCrown.rotation.x = Math.PI / 2;
      oculusCrown.position.y = unit * 0.38;
      modGroup.add(oculusCrown);
      break;
    }

    case 'ring-conduit': {
      // Gimballed Differential-Growth & Calabi-Yau Phase Conduit
      const outerGeo = sharedGeometryPool.getOrCreateGeometry(
        `arch-ring-conduit-outer-${uKey}`,
        () =>
          createDifferentialGrowthRibbonGeometry(
            unit * 0.54,
            unit * 0.24,
            7,
            0.45,
            24,
            12
          )
      );
      const outerRibbon = new THREE.Mesh(outerGeo, primaryMat);
      modGroup.add(outerRibbon);

      const innerGeo = sharedGeometryPool.getOrCreateGeometry(
        `arch-ring-conduit-inner-${uKey}`,
        () => createCalabiYauRosetteGeometry(unit * 0.36, 5)
      );
      const innerGimbal = new THREE.Mesh(innerGeo, brassAccentMat);
      innerGimbal.userData.isKineticRotor = true;
      innerGimbal.userData.spinAxis = 'z';
      modGroup.add(innerGimbal);
      break;
    }

    case 'spire-tip': {
      // Beltrami Non-Euclidean Hyperbolic Pseudosphere Spire + Calabi-Yau Finial
      const pseudoGeo = sharedGeometryPool.getOrCreateGeometry(
        `arch-spire-tip-pseudo-${uKey}`,
        () =>
          createHyperbolicPseudosphereGeometry(
            unit * 0.48,
            unit * 1.45,
            20,
            14,
            1.8
          )
      );
      const spireMesh = new THREE.Mesh(pseudoGeo, primaryMat);
      spireMesh.position.y = unit * 0.22;
      spireMesh.castShadow = true;
      modGroup.add(spireMesh);

      const finialGeo = sharedGeometryPool.getOrCreateGeometry(
        `arch-spire-tip-finial-${uKey}`,
        () => createCalabiYauRosetteGeometry(unit * 0.2, 5)
      );
      const finial = new THREE.Mesh(finialGeo, brassAccentMat);
      finial.position.y = unit * 1.05;
      finial.userData.isKineticRotor = true;
      finial.userData.spinAxis = 'y';
      modGroup.add(finial);
      break;
    }

    case 'gyroid-minimal-shell': {
      // Alan Schoen TPMS Gyroid Minimal-Surface Pavilion Module
      const gyroidGeo = sharedGeometryPool.getOrCreateGeometry(
        `arch-gyroid-pavilion-${uKey}`,
        () =>
          createTPMSGyroidShellGeometry(
            unit * 0.52,
            unit * 0.98,
            24,
            16,
            3.2,
            0.36
          )
      );
      const gyroidMesh = new THREE.Mesh(gyroidGeo, primaryMat);
      gyroidMesh.castShadow = true;
      gyroidMesh.receiveShadow = true;
      modGroup.add(gyroidMesh);
      break;
    }

    case 'metabolist-capsule-pod': {
      // Neri Oxman / Kisho Kurokawa Pleated Biopolymer Monocoque Habitat Capsule
      const podGeo = sharedGeometryPool.getOrCreateGeometry(
        `arch-metabolist-pod-${uKey}`,
        () =>
          createOxmanBiopolymerCapsuleGeometry(
            unit * 0.94,
            unit * 0.72,
            unit * 0.84
          )
      );
      const podBody = new THREE.Mesh(podGeo, primaryMat);
      podBody.castShadow = true;
      podBody.receiveShadow = true;
      modGroup.add(podBody);

      const oculusRosetteGeo = sharedGeometryPool.getOrCreateGeometry(
        `arch-metabolist-oculus-${uKey}`,
        () => createCalabiYauRosetteGeometry(unit * 0.19, 5)
      );
      const oculusRosette = new THREE.Mesh(oculusRosetteGeo, brassAccentMat);
      oculusRosette.position.z = unit * 0.38;
      modGroup.add(oculusRosette);
      break;
    }

    case 'scarpa-ziggurat-stair': {
      // Carlo Scarpa Stepped Cantilever Corbel Node
      const scarpaGroup = buildScarpaSteppedCorbelGroup(
        unit * 0.96,
        unit * 0.88,
        unit * 0.96,
        5,
        primaryMat,
        brassAccentMat
      );
      scarpaGroup.position.y = -unit * 0.44;
      modGroup.add(scarpaGroup);
      break;
    }

    case 'tensegrity-strut-prism': {
      // Buckminster Fuller 3-Strut Tensegrity Simplex Module
      const tensGroup = buildTensegrityPrismTowerGroup(
        unit * 0.46,
        unit * 0.96,
        1,
        darkTectonicMat,
        brassAccentMat,
        primaryMat
      );
      tensGroup.position.y = -unit * 0.48;
      modGroup.add(tensGroup);
      break;
    }

    case 'jansen-kinetic-rib': {
      // Theo Jansen / U-Ram Choe Kinetic Clockwork Rib Module
      const kineticGroup = buildTheoJansenKineticLinkageGroup(
        unit * 0.46,
        darkTectonicMat,
        brassAccentMat,
        primaryMat
      );
      modGroup.add(kineticGroup);
      break;
    }

    case 'calabi-yau-portal': {
      // Calabi-Yau Quintic Rosette Manifold Portal
      const calabiGeo = sharedGeometryPool.getOrCreateGeometry(
        `arch-calabi-portal-${uKey}`,
        () => createCalabiYauRosetteGeometry(unit * 0.52, 5)
      );
      const calabiMesh = new THREE.Mesh(calabiGeo, primaryMat);
      calabiMesh.userData.isKineticRotor = true;
      calabiMesh.userData.spinAxis = 'z';
      modGroup.add(calabiMesh);
      break;
    }
  }

  return modGroup;
}

/**
 * 8B. RELATIONAL ARCHITECTURAL ASSET GRAPH & TECTONIC JOINERY ENGINE
 * Evaluates spatial relationships between all modules in a building blueprint so they
 * lock together into a cohesive, studio-grade megastructure via:
 * - Flying Buttress Catenary Struts & Space-Frame Chords between neighboring modules
 * - Under-Slung Parabolic Cantilever Brackets under overhanging pods/decks
 * - Cast-Steel Pin-Clevis Moment Nodes at structural intersections
 */
export function buildRelationalArchitecturalJoinery(
  blocks: BuildingPresetBlock[],
  unit: number,
  tectonicMat: THREE.Material,
  accentMat: THREE.Material
): THREE.Group {
  const joineryGroup = new THREE.Group();
  joineryGroup.name = 'relational-tectonic-joinery-graph';

  const coords = blocks.map((b) => ({
    block: b,
    pos: new THREE.Vector3(
      b.gx * unit,
      b.gy * unit + unit * 0.5,
      b.gz * unit
    ),
  }));

  const clevisGeo = createHyperbolicPseudosphereGeometry(
    unit * 0.12,
    unit * 0.24,
    8,
    6,
    1.4
  );

  // 1. Inter-Module Space-Frame Chords & Flying Buttress Struts between related neighbors
  for (let i = 0; i < coords.length; i++) {
    for (let j = i + 1; j < coords.length; j++) {
      const a = coords[i];
      const b = coords[j];
      const dist = a.pos.distanceTo(b.pos);

      // Connect adjacent or diagonal structural neighbors within 2.35 grid units
      if (dist > 0.1 && dist <= unit * 2.35) {
        const dir = new THREE.Vector3().subVectors(b.pos, a.pos);
        const mid = new THREE.Vector3().addVectors(a.pos, b.pos).multiplyScalar(0.5);

        // Tapered Hyperbolic Space-Frame Chord / Flying Buttress Strut
        const strutGeo = createHyperbolicPseudosphereGeometry(
          unit * 0.075,
          dist * 0.92,
          8,
          8,
          1.2
        );
        const isDiagonalButtress =
          Math.abs(a.block.gy - b.block.gy) === 1 &&
          (a.block.gx !== b.block.gx || a.block.gz !== b.block.gz);

        const strutMesh = new THREE.Mesh(
          strutGeo,
          isDiagonalButtress ? accentMat : tectonicMat
        );
        strutMesh.position.copy(mid);
        strutMesh.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.clone().normalize()
        );
        strutMesh.castShadow = true;
        joineryGroup.add(strutMesh);

        // Mid-span Cast-Steel Pin-Clevis Tension Ring Node
        const clevisNode = new THREE.Mesh(clevisGeo, accentMat);
        clevisNode.position.copy(mid);
        clevisNode.quaternion.copy(strutMesh.quaternion);
        joineryGroup.add(clevisNode);
      }
    }
  }

  // 2. Cantilever Under-Slung Parabolic Brackets for overhanging modules (gx != 0 or gz != 0)
  for (const item of coords) {
    const { block, pos } = item;
    if (block.gy > 0 && (block.gx !== 0 || block.gz !== 0)) {
      const hasDirectSupportBelow = blocks.some(
        (other) =>
          other.gx === block.gx &&
          other.gz === block.gz &&
          other.gy === block.gy - 1
      );
      if (!hasDirectSupportBelow) {
        // Anchor back to central spine at (0, block.gy - 0.5, 0)
        const spineAnchor = new THREE.Vector3(
          0,
          Math.max(unit * 0.35, pos.y - unit * 0.85),
          0
        );
        const spanVec = new THREE.Vector3().subVectors(pos, spineAnchor);
        const spanLen = spanVec.length();
        const midBracket = new THREE.Vector3()
          .addVectors(pos, spineAnchor)
          .multiplyScalar(0.5);

        const bracketMesh = new THREE.Mesh(
          createHyperbolicPseudosphereGeometry(
            unit * 0.095,
            spanLen * 0.94,
            10,
            8,
            1.65
          ),
          accentMat
        );
        bracketMesh.position.copy(midBracket);
        bracketMesh.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          spanVec.normalize()
        );
        bracketMesh.castShadow = true;
        joineryGroup.add(bracketMesh);
      }
    }
  }

  return joineryGroup;
}

/**
 * 9. MONUMENTAL WORLD LANDMARK SYNTHESIZER (Replaces primitive "example figures" in buildWorldPropMesh)
 * Combines Astra Tectonic-Compositional Grammar with Argon Implicit-Biomimetic Morphogenesis.
 */
export function buildMonumentalWorldPropMesh(
  spec: ProceduralPropModelSpec
): THREE.Group {
  const group = new THREE.Group();
  const rng = createArchRng(spec.seed);

  const textures = getProceduralPhotorealisticTerrainTextures();

  const primaryMat =
    sharedGeometryPool.getOrCreateNoiseBlendedArchitecturalMaterial({
      key: `monument-prop-primary-${spec.primaryColor}-${spec.emissiveColor}-${spec.metalness.toFixed(2)}-${spec.roughness.toFixed(2)}-${spec.radialSegments <= 5}`,
      baseColor: spec.primaryColor,
      veinColor: spec.emissiveColor,
      emissiveColor: spec.emissiveColor,
      emissiveIntensity: 0.14,
      metalness: spec.metalness,
      roughness: spec.roughness,
      clearcoat: 0.68,
      wearIntensity: 0.48,
      wearScale: 0.78,
      veinDensity: 1.65,
      veinEmissiveStrength: 0.85,
      flatShading: spec.radialSegments <= 5,
      normalMap: textures.normalMap,
      normalScale: 1.5,
      roughnessMap: textures.roughnessMap,
      aoMap: textures.aoMap,
      aoMapIntensity: 0.85,
    });

  const accentMat =
    sharedGeometryPool.getOrCreateNoiseBlendedArchitecturalMaterial({
      key: `monument-prop-accent-${spec.emissiveColor}-${spec.primaryColor}`,
      baseColor: spec.emissiveColor,
      veinColor: '#f8fafc',
      wearTintColor: spec.primaryColor,
      emissiveColor: spec.emissiveColor,
      emissiveIntensity: 0.52,
      metalness: 0.65,
      roughness: 0.18,
      clearcoat: 0.88,
      wearIntensity: 0.36,
      wearScale: 1.1,
      veinDensity: 2.2,
      veinEmissiveStrength: 0.92,
      normalMap: textures.normalMap,
      normalScale: 1.2,
      roughnessMap: textures.roughnessMap,
    });

  const tectonicDarkMat =
    sharedGeometryPool.getOrCreateNoiseBlendedArchitecturalMaterial({
      key: `monument-prop-tectonic-${spec.emissiveColor}`,
      baseColor: '#0f172a',
      veinColor: spec.emissiveColor,
      wearTintColor: '#475569',
      emissiveColor: '#020617',
      emissiveIntensity: 0.08,
      metalness: 0.85,
      roughness: 0.26,
      clearcoat: 0.65,
      wearIntensity: 0.54,
      wearScale: 0.88,
      veinDensity: 1.75,
      veinEmissiveStrength: 0.82,
      normalMap: textures.normalMap,
      normalScale: 1.8,
      roughnessMap: textures.roughnessMap,
      aoMap: textures.aoMap,
      aoMapIntensity: 0.85,
    });

  const wireSacredMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(spec.emissiveColor),
    wireframe: true,
    transparent: true,
    opacity: 0.34,
  });

  if (spec.category === 'monolith-spire') {
    // ASTRA × ARGON MONUMENT 1: Metabolist Plug-In Capsule Megastructure & Hyperbolic Pseudosphere Spire
    const totalH = spec.scale[1] * 2.45;
    const baseRadius = spec.scale[0] * 1.15;

    // 1. Central Schoen Gyroid Vascular Core Shaft rising directly from the terrain
    const coreGeo = createTPMSGyroidShellGeometry(
      baseRadius * 0.56,
      totalH * 0.82,
      24,
      18,
      2.4,
      0.28
    );
    const coreMesh = new THREE.Mesh(coreGeo, primaryMat);
    coreMesh.position.y = totalH * 0.41;
    coreMesh.castShadow = true;
    coreMesh.receiveShadow = true;
    group.add(coreMesh);

    // 2. Helical Oxman-Kurokawa Biopolymer Capsule Pods & Parabolic Cantilever Brackets
    const capsuleCount = spec.ringCount * 2 + 4;
    const capsuleGeo = createOxmanBiopolymerCapsuleGeometry(0.96, 0.68, 0.82);
    for (let i = 0; i < capsuleCount; i++) {
      const t = i / capsuleCount;
      const angle = i * (spec.twistAngle + 0.85);
      const y = 1.2 + t * (totalH * 0.72);
      const armLen = baseRadius * (1.05 - t * 0.32);

      const podPivot = new THREE.Group();
      podPivot.position.y = y;
      podPivot.rotation.y = angle;

      // Sculpted Hyperbolic Cantilever Truss Bracket
      const arm = new THREE.Mesh(
        createHyperbolicPseudosphereGeometry(0.16, armLen, 8, 8, 1.3),
        tectonicDarkMat
      );
      arm.rotation.z = -Math.PI * 0.5;
      arm.position.x = armLen * 0.5;
      podPivot.add(arm);

      // Plug-in biopolymer monocoque habitat capsule
      const capsule = new THREE.Mesh(
        capsuleGeo,
        i % 2 === 0 ? primaryMat : tectonicDarkMat
      );
      capsule.position.x = armLen + 0.35;
      capsule.castShadow = true;
      podPivot.add(capsule);

      group.add(podPivot);
    }

    // 3. Beltrami Non-Euclidean Hyperbolic Pseudosphere Crown
    const spireCrownGeo = createHyperbolicPseudosphereGeometry(
      baseRadius * 0.78,
      totalH * 0.38,
      22,
      14,
      2.1
    );
    const spireCrown = new THREE.Mesh(spireCrownGeo, accentMat);
    spireCrown.position.y = totalH * 0.88;
    spireCrown.userData.isKineticRotor = true;
    spireCrown.userData.spinAxis = 'y';
    group.add(spireCrown);
  } else if (spec.category === 'gyro-resonator') {
    // ASTRA × ARGON MONUMENT 2: U-Ram Choe & Theo Jansen Kinetic Clockwork Sanctuary
    const radius = spec.scale[0] * 1.25;
    const centerHeight = 1.45 + radius * 1.35;

    // Twin Hansmeyer Subdivided Parabolic Buttress Cradles (No flat floor plinth!)
    const cradleGeo = createHansmeyerSubdividedColumnGeometry(0.28, centerHeight * 1.05, 6);
    for (const side of [-1, 1]) {
      const cradle = new THREE.Mesh(cradleGeo, primaryMat);
      cradle.position.set(side * radius * 1.05, centerHeight * 0.52, 0);
      cradle.rotation.z = side * 0.16;
      cradle.castShadow = true;
      group.add(cradle);
    }

    // Articulated Theo Jansen / U-Ram Choe Rib Linkage Core
    const linkageHub = buildTheoJansenKineticLinkageGroup(
      radius * 0.78,
      tectonicDarkMat,
      primaryMat,
      accentMat
    );
    linkageHub.position.y = centerHeight;
    group.add(linkageHub);

    // Concentric Astrolabe Gimbal Rings with Planetary Epicyclic Gears
    const rotorHub = new THREE.Group();
    rotorHub.position.y = centerHeight;
    group.add(rotorHub);

    for (let r = 0; r < spec.ringCount + 1; r++) {
      const ringR = radius * (1.32 - r * 0.22);
      if (ringR < 0.4) continue;
      const ringMesh = new THREE.Mesh(
        new THREE.TorusGeometry(ringR, 0.075, 10, 32),
        r % 2 === 0 ? primaryMat : accentMat
      );
      ringMesh.rotation.x = r * 0.62 + rng();
      ringMesh.rotation.y = r * 0.78;
      ringMesh.userData.isKineticRotor = true;
      ringMesh.userData.spinAxis = r % 2 === 0 ? 'x' : 'y';
      rotorHub.add(ringMesh);
    }

    // Calabi-Yau Quintic Heart
    const calabiHeart = new THREE.Mesh(
      createCalabiYauRosetteGeometry(radius * 0.42, 5),
      accentMat
    );
    calabiHeart.userData.isKineticRotor = true;
    calabiHeart.userData.spinAxis = 'z';
    rotorHub.add(calabiHeart);
  } else if (spec.category === 'tesseract-cage') {
    // ASTRA × ARGON MONUMENT 3: Non-Euclidean 24-Cell Schlegel Cloister & Schoen Gyroid Inner Sanctum
    const outerSize = spec.scale[0] * 1.95;
    const innerSize = outerSize * 0.54;
    const centerY = outerSize * 0.92;

    // Tensegrity Base Pedestal
    const baseTensegrity = buildTensegrityPrismTowerGroup(
      outerSize * 0.58,
      centerY * 0.55,
      2,
      tectonicDarkMat,
      accentMat,
      primaryMat
    );
    group.add(baseTensegrity);

    const cageGroup = new THREE.Group();
    cageGroup.position.y = centerY + 0.4;
    cageGroup.rotation.x = 0.32;
    cageGroup.rotation.z = 0.24;
    cageGroup.userData.isKineticRotor = true;
    cageGroup.userData.spinAxis = 'y';
    group.add(cageGroup);

    // Outer Hypercube Strut Frame
    const outerBox = new THREE.BoxGeometry(outerSize, outerSize, outerSize);
    const outerEdges = new THREE.EdgesGeometry(outerBox);
    const outerLines = new THREE.LineSegments(
      outerEdges,
      new THREE.LineBasicMaterial({ color: spec.emissiveColor })
    );
    cageGroup.add(outerLines);

    // 8 Schlegel Perspective Tie-Struts connecting Outer Cube vertices to Inner Gyroid Sanctum
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const pOut = new THREE.Vector3(
            sx * outerSize * 0.5,
            sy * outerSize * 0.5,
            sz * outerSize * 0.5
          );
          const pIn = new THREE.Vector3(
            sx * innerSize * 0.5,
            sy * innerSize * 0.5,
            sz * innerSize * 0.5
          );
          const dir = new THREE.Vector3().subVectors(pIn, pOut);
          const strut = new THREE.Mesh(
            new THREE.CylinderGeometry(0.055, 0.055, dir.length(), 6),
            primaryMat
          );
          strut.position.addVectors(pOut, pIn).multiplyScalar(0.5);
          strut.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            dir.normalize()
          );
          cageGroup.add(strut);

          const node = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.18, 0),
            accentMat
          );
          node.position.copy(pOut);
          cageGroup.add(node);
        }
      }
    }

    // Inner Schoen TPMS Gyroid Minimal-Surface Chamber
    const innerGyroid = new THREE.Mesh(
      createTPMSGyroidShellGeometry(
        innerSize * 0.58,
        innerSize * 0.96,
        22,
        16,
        3.0,
        0.38
      ),
      accentMat
    );
    innerGyroid.castShadow = true;
    cageGroup.add(innerGyroid);
  } else if (spec.category === 'hyper-arch') {
    // ASTRA × ARGON MONUMENT 4: Calatrava-Gaudí Parabolic Catenary Buttress Viaduct & Coffered Vault Deck
    const span = spec.scale[0] * 2.65;
    const height = spec.scale[1] * 2.05;

    // Twin Inclined Schoen Gyroid Pylons (rising directly from terrain without flat floor blocks)
    for (const side of [-1, 1]) {
      const pylonGeo = createTPMSGyroidShellGeometry(
        0.46,
        height * 0.95,
        18,
        14,
        2.5,
        0.24
      );
      const pylon = new THREE.Mesh(pylonGeo, primaryMat);
      pylon.position.set(side * span * 0.42, height * 0.48, 0);
      pylon.rotation.z = side * 0.2;
      pylon.castShadow = true;
      group.add(pylon);
    }

    // Calatrava Ribbed Parabolic Funicular Vault Arch Spanning the Pylons
    const catenaryArch = new THREE.Mesh(
      createCalatravaRibbedParabolicArchGeometry(span * 0.92, height * 0.48),
      primaryMat
    );
    catenaryArch.position.set(0, height * 0.46, 0);
    catenaryArch.castShadow = true;
    group.add(catenaryArch);

    // Upper Zaha Hadid Coffered Vault Sky-Bridge Deck (replaces raw BoxGeometry!)
    const viaductDeck = new THREE.Mesh(
      createZahaCofferedVaultShellGeometry(span * 1.15, 0.36, 0.24),
      tectonicDarkMat
    );
    viaductDeck.scale.set(1.0, 1.0, 0.38);
    viaductDeck.position.set(0, height * 0.92, 0);
    viaductDeck.castShadow = true;
    viaductDeck.receiveShadow = true;
    group.add(viaductDeck);

    // Suspended Calabi-Yau Portal Oculus inside the Arch
    const portalRosette = new THREE.Mesh(
      createCalabiYauRosetteGeometry(span * 0.22, 5),
      accentMat
    );
    portalRosette.position.set(0, height * 0.54, 0);
    portalRosette.userData.isKineticRotor = true;
    portalRosette.userData.spinAxis = 'z';
    group.add(portalRosette);
  } else if (spec.category === 'pendulum-rig') {
    // ASTRA × ARGON MONUMENT 5: Calder-Foucault Tensegrity Metronome Cathedral
    const h = spec.scale[1] * 2.25;
    const w = spec.scale[0] * 1.85;

    // 3-Mast Tensegrity Derrick Superstructure
    for (let m = 0; m < 3; m++) {
      const ang = (m / 3) * Math.PI * 2;
      const mast = buildTensegrityPrismTowerGroup(
        0.38,
        h * 0.96,
        3,
        tectonicDarkMat,
        accentMat,
        primaryMat
      );
      mast.position.set(Math.cos(ang) * w * 0.58, 0, Math.sin(ang) * w * 0.58);
      mast.rotation.z = Math.cos(ang) * 0.14;
      mast.rotation.x = -Math.sin(ang) * 0.14;
      group.add(mast);
    }

    // Crown Ring Beam
    const crownRing = new THREE.Mesh(
      new THREE.TorusGeometry(w * 0.45, 0.16, 8, 24),
      primaryMat
    );
    crownRing.rotation.x = Math.PI / 2;
    crownRing.position.y = h * 0.92;
    group.add(crownRing);

    // Articulated Alexander Calder Balanced Mobile & 68-BPM Foucault Pendulum
    const pivotGroup = new THREE.Group();
    pivotGroup.position.set(0, h * 0.9, 0);
    pivotGroup.userData.isPendulum = true;
    group.add(pivotGroup);

    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, h * 0.68, 8),
      tectonicDarkMat
    );
    rod.position.y = -h * 0.34;
    pivotGroup.add(rod);

    // Calder balanced cantilever mobile arms along the pendulum shaft
    for (let c = 0; c < 3; c++) {
      const mobileArm = new THREE.Group();
      mobileArm.position.y = -h * (0.2 + c * 0.16);
      mobileArm.rotation.y = c * 1.1;
      mobileArm.userData.isKineticRotor = true;
      mobileArm.userData.spinAxis = 'y';

      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, w * (0.85 - c * 0.15), 6),
        accentMat
      );
      bar.rotation.z = Math.PI / 2;
      mobileArm.add(bar);

      const leaf = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.22, 0),
        primaryMat
      );
      leaf.position.x = w * (0.42 - c * 0.075);
      leaf.scale.set(1.6, 0.35, 0.9);
      mobileArm.add(leaf);

      pivotGroup.add(mobileArm);
    }

    // Hyperbolic Pseudosphere & Gyroid Foucault Bob
    const bobGeo = createTPMSGyroidShellGeometry(
      spec.scale[0] * 0.48,
      spec.scale[0] * 0.72,
      20,
      14,
      3.2,
      0.35
    );
    const bob = new THREE.Mesh(bobGeo, accentMat);
    bob.position.y = -h * 0.68;
    bob.castShadow = true;
    pivotGroup.add(bob);
  } else {
    // ASTRA × ARGON MONUMENT 6 ('helix-conduit'): Differential-Growth Coral & Schoen Gyroid Biomimetic Tower
    const totalH = spec.scale[1] * 2.25;
    const radius = spec.scale[0] * 0.92;

    // 1. Differential-Growth Ruffled Pleura Outer Shell
    const diffRibbonGeo = createDifferentialGrowthRibbonGeometry(
      radius * 0.95,
      totalH,
      5,
      1.75,
      28,
      24
    );
    const diffRibbonMesh = new THREE.Mesh(diffRibbonGeo, primaryMat);
    diffRibbonMesh.position.y = totalH * 0.5;
    diffRibbonMesh.castShadow = true;
    diffRibbonMesh.receiveShadow = true;
    group.add(diffRibbonMesh);

    // 2. Wireframe Schoen Minimal Surface Envelope
    const wireShell = new THREE.Mesh(diffRibbonGeo, wireSacredMat);
    wireShell.position.y = totalH * 0.5;
    wireShell.scale.setScalar(1.03);
    group.add(wireShell);

    // 3. Double-Helix Synovial Spindles & Tensegrity Rungs (replaces OctahedronGeometry)
    const levels = spec.ringCount * 4 + 6;
    const stepH = totalH / levels;
    const nodeGeo = createHyperbolicPseudosphereGeometry(0.18, 0.42, 8, 6, 1.4);
    for (let i = 0; i < levels; i++) {
      const angle = i * 0.58;
      const y = i * stepH + 0.35;

      const n1 = new THREE.Mesh(nodeGeo, i % 2 === 0 ? accentMat : primaryMat);
      n1.position.set(
        Math.cos(angle) * radius * 1.15,
        y,
        Math.sin(angle) * radius * 1.15
      );
      group.add(n1);

      const n2 = new THREE.Mesh(nodeGeo, i % 2 === 1 ? accentMat : primaryMat);
      n2.position.set(
        Math.cos(angle + Math.PI) * radius * 1.15,
        y,
        Math.sin(angle + Math.PI) * radius * 1.15
      );
      group.add(n2);

      if (i % 2 === 0) {
        const rung = new THREE.Mesh(
          new THREE.CylinderGeometry(0.055, 0.055, radius * 2.3, 6),
          tectonicDarkMat
        );
        rung.position.set(0, y, 0);
        rung.rotation.z = Math.PI * 0.5;
        rung.rotation.y = -angle;
        group.add(rung);
      }
    }
  }

  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  return group;
}

/**
 * 10. ASTRA × ARGON MASTER ARCHITECTURAL WISDOM CODEX (8 Deeply Researched Walkable Megastructures)
 * Competing & Cross-Pollinating between GPT-6 Astra (Tectonic-Compositional Grammar)
 * and Gemini Argon (Continuous Implicit Field & Biomimetic Morphogenesis).
 */
export const ASTRA_ARGON_ARCHITECTURAL_CODEX: ArchitecturalWisdomBlueprintSpec[] =
  [
    {
      id: 'codex-nakagin-metabolist-spire',
      name: 'Kurokawa Metabolist Capsule Megaspire',
      subtitle: 'ASTRA Tectonic-Compositional Grammar · Plug-In Vascular Core',
      paradigm: 'astra-tectonic-grammar',
      realWorldLineage:
        'Kisho Kurokawa (Nakagin Capsule Tower, 1972) & Kenzo Tange (Tokyo Bay Plan, 1960)',
      mathematicalSurfaceFormula:
        'L-System Helical Core: P_k = (R cos(kΔθ), kΔh, R sin(kΔθ)) ⊕ Oculus(r_0)',
      astraTectonicContribution:
        'Hierarchical permanent service-core shaft supporting replaceable cantilevered habitat capsules with circular oculus fenestration.',
      argonMorphogenesisContribution:
        'Vascular MEP arterial riser pulsing with circadian bioluminescence and hyperbolic wind-damping spire crown.',
      architecturalWisdomPrinciple:
        'Distinguish permanent tectonic bones from adaptable metabolic organs so architecture can grow and renew like a living organism.',
      accentHex: '#38bdf8',
      secondaryHex: '#f59e0b',
      presetBlueprint: {
        id: 'preset-metabolist-capsule-spire',
        name: 'Kurokawa Metabolist Capsule Spire',
        description:
          'Permanent Scarpa tectonic core with cantilevered Nakagin plug-in habitat capsules and a hyperbolic pseudosphere crown.',
        paradigm: 'astra-tectonic-grammar',
        architecturalLineage: 'Kisho Kurokawa & Kenzo Tange Metabolist Movement',
        mathematicalFormula: 'P_k = Core(Y) ⊕ Cantilever_k(θ = k·90°)',
        cost: { 'ferro-chitin': 2, 'vitreous-aether': 2 },
        createdAt: 1728160010000,
        blocks: [
          { id: 'mc1', gx: 0, gy: 0, gz: 0, shape: 'scarpa-ziggurat-stair', color: '#e2e8f0', emissive: false },
          { id: 'mc2', gx: 0, gy: 1, gz: 0, shape: 'pillar', color: '#334155', emissive: false },
          { id: 'mc3', gx: -1, gy: 1, gz: 0, shape: 'metabolist-capsule-pod', color: '#38bdf8', emissive: true },
          { id: 'mc4', gx: 1, gy: 1, gz: 0, shape: 'metabolist-capsule-pod', color: '#f59e0b', emissive: true },
          { id: 'mc5', gx: 0, gy: 2, gz: 0, shape: 'pillar', color: '#334155', emissive: false },
          { id: 'mc6', gx: 0, gy: 2, gz: -1, shape: 'metabolist-capsule-pod', color: '#38bdf8', emissive: true },
          { id: 'mc7', gx: 0, gy: 2, gz: 1, shape: 'metabolist-capsule-pod', color: '#10b981', emissive: true },
          { id: 'mc8', gx: 0, gy: 3, gz: 0, shape: 'cantilever-deck', color: '#e2e8f0', emissive: false },
          { id: 'mc9', gx: 0, gy: 4, gz: 0, shape: 'spire-tip', color: '#38bdf8', emissive: true },
        ],
      },
    },
    {
      id: 'codex-schoen-gyroid-sanctuary',
      name: 'Schoen TPMS Gyroid Acoustic Sanctuary',
      subtitle: 'ARGON Implicit Field Morphogenesis · Zero-Mean-Curvature Shell',
      paradigm: 'argon-implicit-morphogenesis',
      realWorldLineage:
        'Alan Schoen (NASA TPMS Gyroid, 1970), Frei Otto (Soap-Film Minimal Surfaces) & Zaha Hadid',
      mathematicalSurfaceFormula:
        'sin(kx)cos(ky) + sin(ky)cos(kz) + sin(kz)cos(kx) = 0 (H = 0 Minimal Surface)',
      astraTectonicContribution:
        'Seismic tripod foundation caissons and perimeter cantilever ring-decks anchoring the continuous minimal-surface shell.',
      argonMorphogenesisContribution:
        'Continuous non-self-intersecting Gyroid labyrinth that splits space into dual acoustic harmonic channels with isotropic load distribution.',
      architecturalWisdomPrinciple:
        'Zero mean curvature (H = 0) eliminates stress concentrations, achieving maximum structural strength and acoustic resonance with minimal matter.',
      accentHex: '#2dd4bf',
      secondaryHex: '#a855f7',
      presetBlueprint: {
        id: 'preset-schoen-gyroid-sanctuary',
        name: 'Schoen TPMS Gyroid Sanctuary',
        description:
          'Triply periodic minimal-surface pavilion with isotropic load-bearing gyroid shells and a Calabi-Yau portal oculus.',
        paradigm: 'argon-implicit-morphogenesis',
        architecturalLineage: 'Alan Schoen TPMS & Frei Otto Minimal Surfaces',
        mathematicalFormula: 'sin(x)cos(y) + sin(y)cos(z) + sin(z)cos(x) = 0',
        cost: { 'vitreous-aether': 2, 'biolum-mycelium': 2 },
        createdAt: 1728160020000,
        blocks: [
          { id: 'sg1', gx: -1, gy: 0, gz: -1, shape: 'gyroid-minimal-shell', color: '#2dd4bf', emissive: true },
          { id: 'sg2', gx: 1, gy: 0, gz: -1, shape: 'gyroid-minimal-shell', color: '#2dd4bf', emissive: true },
          { id: 'sg3', gx: -1, gy: 0, gz: 1, shape: 'gyroid-minimal-shell', color: '#2dd4bf', emissive: true },
          { id: 'sg4', gx: 1, gy: 0, gz: 1, shape: 'gyroid-minimal-shell', color: '#2dd4bf', emissive: true },
          { id: 'sg5', gx: 0, gy: 1, gz: 0, shape: 'gyroid-minimal-shell', color: '#e2e8f0', emissive: false },
          { id: 'sg6', gx: 0, gy: 2, gz: 0, shape: 'ring-conduit', color: '#a855f7', emissive: true },
          { id: 'sg7', gx: 0, gy: 3, gz: 0, shape: 'calabi-yau-portal', color: '#38bdf8', emissive: true },
        ],
      },
    },
    {
      id: 'codex-scarpa-eco-brutalist-cloister',
      name: 'Scarpa Stepped Béton-Brut Water Cloister',
      subtitle: 'ASTRA × ARGON Synthesis · Stepped Ziggurat Joinery & Biolume',
      paradigm: 'astra-argon-dialectic-fusion',
      realWorldLineage:
        'Carlo Scarpa (Brion Sanctuary, 1978), Tadao Ando (Church of the Light) & Eco-Brutalism',
      mathematicalSurfaceFormula:
        'Z_step(x,z) = ∑ Δh · Θ(w_i - |x|) ∩ VesicaPiscis(R_1, R_2)',
      astraTectonicContribution:
        'Precision stepped board-formed concrete ziggurat corbels, brass reveal joints, and cantilevered water-court terraces.',
      argonMorphogenesisContribution:
        'Bioluminescent mycelial vertical gardens weeping through stepped concrete shadow-gaps and acoustic catenary vaults.',
      architecturalWisdomPrinciple:
        'Celebrate the joint where materials meet: stepped shadow reveals turn heavy raw concrete into weightless, musical light.',
      accentHex: '#f59e0b',
      secondaryHex: '#10b981',
      presetBlueprint: {
        id: 'preset-scarpa-brutalist-cloister',
        name: 'Scarpa Eco-Brutalist Cloister',
        description:
          'Stepped Brion-inspired concrete ziggurat sanctuary with gilded brass reveals, catenary arches, and bioluminescent terraces.',
        paradigm: 'astra-argon-dialectic-fusion',
        architecturalLineage: 'Carlo Scarpa Brion Sanctuary & Eco-Brutalism',
        mathematicalFormula: 'Z_step(x,z) = ∑ Δh · Θ(w_i - |x|)',
        cost: { 'calcified-memory': 2, 'ferro-chitin': 2 },
        createdAt: 1728160030000,
        blocks: [
          { id: 'sc1', gx: -1, gy: 0, gz: -1, shape: 'scarpa-ziggurat-stair', color: '#e2e8f0', emissive: false },
          { id: 'sc2', gx: 1, gy: 0, gz: -1, shape: 'scarpa-ziggurat-stair', color: '#e2e8f0', emissive: false },
          { id: 'sc3', gx: -1, gy: 0, gz: 1, shape: 'scarpa-ziggurat-stair', color: '#e2e8f0', emissive: false },
          { id: 'sc4', gx: 1, gy: 0, gz: 1, shape: 'scarpa-ziggurat-stair', color: '#e2e8f0', emissive: false },
          { id: 'sc5', gx: -1, gy: 1, gz: 0, shape: 'cantilever-deck', color: '#10b981', emissive: true },
          { id: 'sc6', gx: 1, gy: 1, gz: 0, shape: 'cantilever-deck', color: '#10b981', emissive: true },
          { id: 'sc7', gx: 0, gy: 1, gz: 0, shape: 'arch', color: '#f59e0b', emissive: true },
          { id: 'sc8', gx: 0, gy: 2, gz: 0, shape: 'dome', color: '#38bdf8', emissive: true },
        ],
      },
    },
    {
      id: 'codex-jansen-choe-kinetic-foundry',
      name: 'Jansen-Choe Kinetic Clockwork Rib Foundry',
      subtitle: 'ARGON Kinetic Biomimicry · Articulated Planar Linkages',
      paradigm: 'argon-implicit-morphogenesis',
      realWorldLineage:
        'Theo Jansen (Strandbeest Linkages, 1990) & U-Ram Choe (Anima Machina Kinetic Sculptures)',
      mathematicalSurfaceFormula:
        'Jansen 11-Bar Linkage: a=38, b=41.5, c=39.3, d=40.1, e=55.8, f=39.4, g=36.7',
      astraTectonicContribution:
        'Rigid-body tensegrity gantry frame and elevated observation catwalks suspending the central crankshaft.',
      argonMorphogenesisContribution:
        'Counter-rotating epicyclic gear wheels driving articulated breathing rib linkages that harvest ambient wind vorticity.',
      architecturalWisdomPrinciple:
        'Expose the internal clockwork of motion: deterministic geometric linkages transform simple rotary wind into living organic breath.',
      accentHex: '#f43f5e',
      secondaryHex: '#f59e0b',
      presetBlueprint: {
        id: 'preset-jansen-kinetic-foundry',
        name: 'Jansen-Choe Kinetic Rib Foundry',
        description:
          'Living mechanical cathedral with exposed Theo Jansen planar linkages, U-Ram Choe breathing ribs, and tensegrity masts.',
        paradigm: 'argon-implicit-morphogenesis',
        architecturalLineage: 'Theo Jansen Strandbeest & U-Ram Choe Kinetic Art',
        mathematicalFormula: 'θ_rocker(t) = arcsin(r_crank sin(ωt) / L_coupler)',
        cost: { 'ferro-chitin': 3, 'void-singularity-dust': 1 },
        createdAt: 1728160040000,
        blocks: [
          { id: 'jk1', gx: -1, gy: 0, gz: 0, shape: 'tensegrity-strut-prism', color: '#e2e8f0', emissive: false },
          { id: 'jk2', gx: 1, gy: 0, gz: 0, shape: 'tensegrity-strut-prism', color: '#e2e8f0', emissive: false },
          { id: 'jk3', gx: 0, gy: 1, gz: 0, shape: 'jansen-kinetic-rib', color: '#f43f5e', emissive: true },
          { id: 'jk4', gx: 0, gy: 2, gz: 0, shape: 'jansen-kinetic-rib', color: '#f59e0b', emissive: true },
          { id: 'jk5', gx: -1, gy: 2, gz: 0, shape: 'cantilever-deck', color: '#38bdf8', emissive: true },
          { id: 'jk6', gx: 1, gy: 2, gz: 0, shape: 'cantilever-deck', color: '#38bdf8', emissive: true },
          { id: 'jk7', gx: 0, gy: 3, gz: 0, shape: 'ring-conduit', color: '#a855f7', emissive: true },
        ],
      },
    },
    {
      id: 'codex-fuller-snelson-tensegrity-observatory',
      name: 'Fuller-Snelson Hyper-Tensegrity Observatory',
      subtitle: 'ASTRA × ARGON Synthesis · Discontinuous Compression & Calabi-Yau',
      paradigm: 'astra-argon-dialectic-fusion',
      realWorldLineage:
        'Buckminster Fuller (Synergetics), Kenneth Snelson (Needle Tower, 1968) & Santiago Calatrava',
      mathematicalSurfaceFormula:
        '∑ T_ij (x_i - x_j) + ∑ C_ik (x_i - x_k) = 0 (Prestressed Equilibrium)',
      astraTectonicContribution:
        'Triaxial discontinuous compression struts floating within a continuous prestressed tension-cable hyperboloid.',
      argonMorphogenesisContribution:
        'Calabi-Yau quintic manifold portal suspended at the zero-gravity apex above a hyperbolic pseudosphere funnel.',
      architecturalWisdomPrinciple:
        'Islands of compression inside an ocean of tension: structures achieve maximum resilience when load paths flow along geodesics.',
      accentHex: '#a855f7',
      secondaryHex: '#38bdf8',
      presetBlueprint: {
        id: 'preset-fuller-tensegrity-observatory',
        name: 'Fuller-Snelson Tensegrity Spire',
        description:
          'Floating compression-strut tensegrity tower crowned with a rotating Calabi-Yau 5D manifold portal.',
        paradigm: 'astra-argon-dialectic-fusion',
        architecturalLineage: 'Buckminster Fuller & Kenneth Snelson Tensegrity',
        mathematicalFormula: '∇E_tensegrity = ∑ k_t ΔL_t - ∑ k_c ΔL_c = 0',
        cost: { 'vitreous-aether': 2, 'void-singularity-dust': 1 },
        createdAt: 1728160050000,
        blocks: [
          { id: 'ft1', gx: 0, gy: 0, gz: 0, shape: 'tensegrity-strut-prism', color: '#e2e8f0', emissive: false },
          { id: 'ft2', gx: 0, gy: 1, gz: 0, shape: 'tensegrity-strut-prism', color: '#38bdf8', emissive: true },
          { id: 'ft3', gx: -1, gy: 1, gz: 0, shape: 'cantilever-deck', color: '#e2e8f0', emissive: false },
          { id: 'ft4', gx: 1, gy: 1, gz: 0, shape: 'cantilever-deck', color: '#e2e8f0', emissive: false },
          { id: 'ft5', gx: 0, gy: 2, gz: 0, shape: 'tensegrity-strut-prism', color: '#a855f7', emissive: true },
          { id: 'ft6', gx: 0, gy: 3, gz: 0, shape: 'calabi-yau-portal', color: '#f59e0b', emissive: true },
          { id: 'ft7', gx: 0, gy: 4, gz: 0, shape: 'spire-tip', color: '#38bdf8', emissive: true },
        ],
      },
    },
    {
      id: 'codex-antichamber-non-euclidean-abbey',
      name: 'Beltrami Non-Euclidean Pseudosphere Abbey',
      subtitle: 'ARGON Non-Euclidean Topology · Hyperbolic Cloister & Choir',
      paradigm: 'argon-implicit-morphogenesis',
      realWorldLineage:
        'Eugenio Beltrami (Pseudosphere, 1868), M.C. Escher, Antoni Gaudí (Sagrada Família Hyperboloids)',
      mathematicalSurfaceFormula:
        'ds² = du² + sech²(u) dv² (Constant Negative Curvature K = -1)',
      astraTectonicContribution:
        'Catenary funicular arches and quadripartite acoustic vaults derived from inverted hanging chain models.',
      argonMorphogenesisContribution:
        'Hyperbolic pseudosphere acoustic bells and Schoen gyroidal nave columns that diffract 4D W-phase wind into choral chords.',
      architecturalWisdomPrinciple:
        'Gaudí discovered that ruled hyperboloids and catenary arches need no internal buttressing—gravity and light follow the same curve.',
      accentHex: '#fb7185',
      secondaryHex: '#38bdf8',
      presetBlueprint: {
        id: 'preset-reliquary-spire',
        name: 'Beltrami Hyperbolic Choir Abbey',
        description:
          'Gaudí- and Beltrami-inspired catenary arch sanctuary with Schoen gyroid columns and a hyperbolic pseudosphere belfry.',
        paradigm: 'argon-implicit-morphogenesis',
        architecturalLineage: 'Antoni Gaudí Hyperboloids & Eugenio Beltrami',
        mathematicalFormula: 'K = -1/R² · r(u) = R sech(u)',
        cost: { 'ferro-chitin': 2, 'calcified-memory': 2 },
        createdAt: 1728160000000,
        blocks: [
          { id: 'b1', gx: -1, gy: 0, gz: -1, shape: 'gyroid-minimal-shell', color: '#e2e8f0', emissive: false },
          { id: 'b2', gx: 1, gy: 0, gz: -1, shape: 'gyroid-minimal-shell', color: '#e2e8f0', emissive: false },
          { id: 'b3', gx: -1, gy: 0, gz: 1, shape: 'gyroid-minimal-shell', color: '#e2e8f0', emissive: false },
          { id: 'b4', gx: 1, gy: 0, gz: 1, shape: 'gyroid-minimal-shell', color: '#e2e8f0', emissive: false },
          { id: 'b5', gx: 0, gy: 1, gz: 0, shape: 'cantilever-deck', color: '#334155', emissive: false },
          { id: 'b6', gx: 0, gy: 2, gz: 0, shape: 'arch', color: '#f43f5e', emissive: true },
          { id: 'b7', gx: 0, gy: 3, gz: 0, shape: 'spire-tip', color: '#38bdf8', emissive: true },
        ],
      },
    },
  ];

/**
 * Procedurally synthesizes a brand-new multi-story Architectural Blueprint by competing
 * or fusing GPT-6 Astra (Tectonic-Compositional Grammar) and Gemini Argon (Implicit-Biomimetic Morphogenesis).
 */
export function synthesizeAstraArgonArchitecturalBlueprint(
  paradigm: AstraArgonSynthesisParadigm,
  seed: number = Math.floor(Math.random() * 899999 + 100000),
  accentHex: string = '#38bdf8'
): BuildingPresetBlueprint {
  const rng = createArchRng(seed);

  const astraShapes: BuildingBlockShape[] = [
    'scarpa-ziggurat-stair',
    'pillar',
    'metabolist-capsule-pod',
    'cantilever-deck',
    'tensegrity-strut-prism',
    'arch',
  ];
  const argonShapes: BuildingBlockShape[] = [
    'gyroid-minimal-shell',
    'jansen-kinetic-rib',
    'calabi-yau-portal',
    'spire-tip',
    'dome',
    'ring-conduit',
  ];

  const blocks: BuildingPresetBlock[] = [];
  const palette = ['#e2e8f0', accentHex, '#f59e0b', '#10b981', '#a855f7', '#f43f5e'];

  // 1. Layer Y=0: Tectonic Corner Foundations or Gyroidal Base Pods
  for (const [gx, gz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    const shape: BuildingBlockShape =
      paradigm === 'astra-tectonic-grammar'
        ? 'scarpa-ziggurat-stair'
        : paradigm === 'argon-implicit-morphogenesis'
          ? 'gyroid-minimal-shell'
          : (gx + gz) % 2 === 0
            ? 'scarpa-ziggurat-stair'
            : 'tensegrity-strut-prism';

    blocks.push({
      id: `syn-0-${gx}-${gz}-${seed}`,
      gx,
      gy: 0,
      gz,
      shape,
      color: '#e2e8f0',
      emissive: false,
    });
  }

  // 2. Layer Y=1 & Y=2: Compositional Core + Cantilevered Metabolist Pods / Kinetic Linkages
  for (let gy = 1; gy <= 2; gy++) {
    const corePool =
      paradigm === 'astra-tectonic-grammar'
        ? astraShapes
        : paradigm === 'argon-implicit-morphogenesis'
          ? argonShapes
          : [...astraShapes, ...argonShapes];

    const coreShape = corePool[Math.floor(rng() * corePool.length)];
    blocks.push({
      id: `syn-core-${gy}-${seed}`,
      gx: 0,
      gy,
      gz: 0,
      shape: coreShape,
      color: palette[Math.floor(rng() * palette.length)],
      emissive: true,
    });

    // Asymmetric cantilevered wings
    const wingCount = 2 + Math.floor(rng() * 2);
    const wingCoords = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    for (let w = 0; w < wingCount; w++) {
      const [wx, wz] = wingCoords[(w + gy) % wingCoords.length];
      const wingShape: BuildingBlockShape =
        paradigm === 'astra-tectonic-grammar'
          ? gy === 1
            ? 'metabolist-capsule-pod'
            : 'cantilever-deck'
          : paradigm === 'argon-implicit-morphogenesis'
            ? gy === 1
              ? 'jansen-kinetic-rib'
              : 'gyroid-minimal-shell'
            : w % 2 === 0
              ? 'metabolist-capsule-pod'
              : 'jansen-kinetic-rib';

      blocks.push({
        id: `syn-wing-${gy}-${w}-${seed}`,
        gx: wx,
        gy,
        gz: wz,
        shape: wingShape,
        color: palette[(w + gy) % palette.length],
        emissive: w % 2 === 0,
      });
    }
  }

  // 3. Layer Y=3 & Y=4: High-Dimensional Portal & Hyperbolic Finial Crown
  blocks.push({
    id: `syn-crown-3-${seed}`,
    gx: 0,
    gy: 3,
    gz: 0,
    shape:
      paradigm === 'astra-tectonic-grammar'
        ? 'arch'
        : 'calabi-yau-portal',
    color: accentHex,
    emissive: true,
  });

  blocks.push({
    id: `syn-crown-4-${seed}`,
    gx: 0,
    gy: 4,
    gz: 0,
    shape: 'spire-tip',
    color: '#f59e0b',
    emissive: true,
  });

  const titlesByParadigm: Record<AstraArgonSynthesisParadigm, string[]> = {
    'astra-tectonic-grammar': [
      'ASTRA Metabolist Capsule Citadel',
      'ASTRA Scarpa Ziggurat Cantilever',
      'ASTRA Diagrid Tensegrity Foundry',
    ],
    'argon-implicit-morphogenesis': [
      'ARGON Schoen Gyroid Bio-Cathedral',
      'ARGON Jansen-Choe Kinetic Spire',
      'ARGON Calabi-Yau Hyperbolic Sanctuary',
    ],
    'astra-argon-dialectic-fusion': [
      'ASTRA×ARGON Gyroid-Metabolist Megastructure',
      'ASTRA×ARGON Tensegrity-Clockwork Cloister',
      'ASTRA×ARGON Scarpa-Pseudosphere Observatory',
    ],
  };

  const titleList = titlesByParadigm[paradigm];
  const chosenName = `${titleList[Math.floor(rng() * titleList.length)]} #${seed % 1000}`;

  return {
    id: `preset-astra-argon-${seed}`,
    name: chosenName,
    description:
      paradigm === 'astra-tectonic-grammar'
        ? 'Synthesized via GPT-6 Astra Tectonic-Compositional Grammar (Metabolist capsules + Carlo Scarpa stepped corbels).'
        : paradigm === 'argon-implicit-morphogenesis'
          ? 'Synthesized via Gemini Argon Continuous Implicit Morphogenesis (Schoen TPMS gyroids + Theo Jansen kinetic linkages).'
          : 'Dialectical fusion of Astra Metabolist tectonic skeletons with Argon TPMS gyroidal minimal surfaces and kinetic clockwork.',
    paradigm,
    architecturalLineage:
      'Kurokawa · Scarpa · Schoen · Fuller · Jansen · Gaudí',
    mathematicalFormula:
      'sin(x)cos(y)+sin(y)cos(z)+sin(z)cos(x)=0 ⊕ L-System Tectonic Core',
    blocks,
    cost: { 'ferro-chitin': 2, 'vitreous-aether': 2 },
    createdAt: Date.now(),
  };
}
