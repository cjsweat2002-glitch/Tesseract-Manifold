import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {
  ANCHORS,
  MEMORIES,
  PLATFORMS,
  WALLS,
  TESSERACT_EDGES,
  activeIn,
  projectTesseract,
  type Slab,
} from './world';
import { type Expedition, type Settings } from './model';

const CYAN = 0x84ead9,
  GOLD = 0xe8b879;
export class ExpeditionScene {
  needsRender = true;
  readonly renderer: THREE.WebGLRenderer;
  readonly camera = new THREE.PerspectiveCamera(68, 1, 0.08, 280);
  private scene = new THREE.Scene();
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private phaseObjects: {
    slab: Slab;
    mesh: THREE.Mesh;
    edges: THREE.LineSegments;
  }[] = [];
  private memories: THREE.Group[] = [];
  private anchors: THREE.Mesh[] = [];
  private tesseract: THREE.LineSegments;
  private vertices: THREE.Mesh[] = [];
  private gate: THREE.Mesh;
  private hands = new THREE.Group();
  private orb: THREE.Mesh;
  private dust: THREE.Points;
  private observer: ResizeObserver;
  private quality = '';
  private disposed = false;
  private background = new THREE.Color(0x10212a);

  constructor(private mount: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.domElement.setAttribute(
      'aria-label',
      'The manifold. Click to capture the mouse, or drag to look.',
    );
    this.renderer.domElement.tabIndex = -1;
    mount.appendChild(this.renderer.domElement);
    this.scene.background = this.background;
    this.scene.fog = new THREE.FogExp2(0x10212a, 0.012);
    this.scene.add(new THREE.HemisphereLight(0xb6dfdf, 0x223039, 2.6));
    const key = new THREE.DirectionalLight(0xffdab0, 3.2);
    key.position.set(20, 35, 10);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0x68b9c9, 2);
    fill.position.set(-20, 10, -20);
    this.scene.add(fill);
    this.scene.add(this.camera);
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.42, 0.5, 0.8);
    this.composer.addPass(this.bloom);
    const stone = new THREE.MeshStandardMaterial({
      color: 0x42565b,
      roughness: 0.86,
      metalness: 0.22,
      map: this.stoneTexture(),
    });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x17282e,
      roughness: 0.85,
      metalness: 0.35,
    });
    const brass = new THREE.MeshStandardMaterial({
      color: GOLD,
      metalness: 0.72,
      roughness: 0.4,
    });
    const cyan = new THREE.MeshBasicMaterial({ color: CYAN });
    const gold = new THREE.MeshBasicMaterial({ color: GOLD });
    const box = (
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      material: THREE.Material,
      parent: THREE.Object3D = this.scene,
    ) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    };
    for (const p of PLATFORMS) {
      const mat = p.phase
        ? new THREE.MeshStandardMaterial({
            color: p.phase === 'echo' ? 0x367c7e : 0x99754c,
            emissive: p.phase === 'echo' ? 0x154943 : 0x442910,
            emissiveIntensity: 0.25,
            transparent: true,
            roughness: 0.65,
          })
        : stone;
      const slab = box(
        p.width,
        p.phase ? 0.55 : 1.8,
        p.depth,
        p.x,
        p.phase ? -0.275 : -0.9,
        p.z,
        mat,
      );
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(slab.geometry),
        new THREE.LineDashedMaterial({
          color: p.phase === 'echo' ? CYAN : GOLD,
          transparent: true,
          opacity: p.phase ? 0.7 : 0.22,
          dashSize: 0.4,
          gapSize: 0,
        }),
      );
      edges.computeLineDistances();
      slab.add(edges);
      if (p.phase) this.phaseObjects.push({ slab: p, mesh: slab, edges });
      else {
        box(p.width - 0.4, 0.2, p.depth - 0.4, p.x, -1.95, p.z, dark);
        // Narrow inlays communicate safe platform boundaries without covering the floor.
        for (const sign of [-1, 1]) {
          box(
            0.035,
            0.015,
            p.depth - 0.8,
            p.x + sign * (p.width / 2 - 0.4),
            0.015,
            p.z,
            brass,
          );
          box(
            p.width - 0.8,
            0.015,
            0.035,
            p.x,
            0.015,
            p.z + sign * (p.depth / 2 - 0.4),
            brass,
          );
        }
        // Underside taper makes each island read as a fragment of an enormous living machine.
        const underside = new THREE.Mesh(
          new THREE.ConeGeometry(Math.min(p.width, p.depth) * 0.48, 9, 4),
          dark,
        );
        underside.rotation.z = Math.PI;
        underside.rotation.y = Math.PI / 4;
        underside.position.set(p.x, -6, p.z);
        this.scene.add(underside);
        for (let x = -p.width / 2 + 2; x < p.width / 2; x += 2)
          box(0.018, 0.01, p.depth - 0.9, p.x + x, 0.02, p.z, dark);
      }
    }
    for (const w of WALLS) {
      const mat = w.phase
        ? new THREE.MeshStandardMaterial({
            color: w.phase === 'echo' ? 0x378c87 : 0x8c7353,
            transparent: true,
            roughness: 0.52,
            metalness: 0.4,
          })
        : stone;
      const mesh = box(w.width, w.height, w.depth, w.x, w.height / 2, w.z, mat);
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(mesh.geometry),
        new THREE.LineDashedMaterial({
          color: w.phase === 'echo' ? CYAN : GOLD,
          transparent: true,
          opacity: 0.5,
          dashSize: 0.4,
          gapSize: 0,
        }),
      );
      edges.computeLineDistances();
      mesh.add(edges);
      if (w.phase) this.phaseObjects.push({ slab: w, mesh, edges });
      else {
        box(w.width + 0.4, 0.3, w.depth + 0.4, w.x, w.height, w.z, brass);
        for (let y = 1; y < w.height; y += 1.2)
          box(w.width + 0.02, 0.045, w.depth + 0.02, w.x, y, w.z, brass);
      }
    }
    // Monumental ribbed arches frame the basin; their feet sit outside traversable routes.
    for (let i = 0; i < 5; i++) {
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(18 + i * 0.6, 0.34, 6, 64, Math.PI),
        i % 2 ? brass : stone,
      );
      arch.position.set(0, 0, -10 - i * 1.2);
      this.scene.add(arch);
    }
    // Distant colonnade, deterministic rather than a randomly changing scene on reload.
    for (let i = 0; i < 48; i++) {
      const angle = (i * Math.PI * 2) / 48;
      const radius = 57 + Math.sin(i * 17) * 8,
        height = 12 + (Math.sin(i * 7) + 1) * 15;
      const column = box(
        2.4,
        height,
        3,
        Math.sin(angle) * radius,
        height / 2 - 8,
        Math.cos(angle) * radius - 8,
        dark,
      );
      column.rotation.z = Math.sin(i * 3) * 0.13;
      box(
        2.6,
        0.14,
        3.2,
        column.position.x,
        height - 8,
        column.position.z,
        brass,
      );
    }
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(7.6 + i * 0.65, 0.028, 6, 100),
        i === 1 ? cyan : brass,
      );
      ring.position.set(0, 9.5, -8);
      ring.rotation.x = Math.PI / 2 + i * 0.22;
      ring.rotation.y = i * 0.28;
      this.scene.add(ring);
    }
    const tgeo = new THREE.BufferGeometry();
    tgeo.setAttribute(
      'position',
      new THREE.BufferAttribute(
        new Float32Array(TESSERACT_EDGES.length * 6),
        3,
      ),
    );
    this.tesseract = new THREE.LineSegments(
      tgeo,
      new THREE.LineBasicMaterial({ color: CYAN }),
    );
    this.tesseract.position.set(0, 9.8, -8);
    this.tesseract.scale.setScalar(2.65);
    this.scene.add(this.tesseract);
    for (let i = 0; i < 16; i++) {
      const vertex = new THREE.Mesh(new THREE.IcosahedronGeometry(0.055), gold);
      this.tesseract.add(vertex);
      this.vertices.push(vertex);
    }
    const heart = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.2),
      new THREE.MeshStandardMaterial({
        color: 0x172a32,
        emissive: 0x378d83,
        emissiveIntensity: 0.7,
        metalness: 0.8,
        roughness: 0.3,
      }),
    );
    heart.position.copy(this.tesseract.position);
    this.scene.add(heart);
    for (const [i, m] of MEMORIES.entries()) {
      const group = new THREE.Group();
      group.position.set(m.x, 0, m.z);
      this.scene.add(group);
      box(1.6, 0.35, 1.6, 0, 0.175, 0, brass, group);
      box(0.65, 1.6, 0.65, 0, 1, 0, stone, group);
      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.47),
        new THREE.MeshStandardMaterial({
          color: CYAN,
          emissive: CYAN,
          emissiveIntensity: 1.3,
          metalness: 0.3,
          roughness: 0.2,
        }),
      );
      crystal.position.y = 2.3;
      group.add(crystal);
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.9, 0.025, 8, 48),
        gold,
      );
      halo.position.y = 2.3;
      halo.rotation.x = Math.PI / 2;
      group.add(halo);
      const label = this.label(`${m.numeral}  /  ${m.name.toUpperCase()}`);
      label.position.set(0, 3.6, 0);
      group.add(label);
      group.userData.crystal = crystal;
      group.userData.index = i;
      this.memories.push(group);
    }
    for (const a of ANCHORS) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.4, 0.045, 8, 24),
        new THREE.MeshBasicMaterial({
          color: GOLD,
          transparent: true,
          opacity: 0.8,
        }),
      );
      ring.position.set(a.x, 2.6, a.z);
      this.scene.add(ring);
      this.anchors.push(ring);
    }
    for (const x of [-2.7, 2.7]) {
      box(0.65, 6.5, 0.9, x, 3.25, 21, stone);
      box(0.07, 5.6, 1, x, 3, 21, gold);
    }
    box(6.1, 0.5, 1.1, 0, 6.5, 21, brass);
    this.gate = new THREE.Mesh(
      new THREE.PlaneGeometry(4.7, 6),
      new THREE.MeshBasicMaterial({
        color: CYAN,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    this.gate.position.set(0, 3, 21);
    this.scene.add(this.gate);
    const gateLabel = this.label('00  /  THE WAY HOME');
    gateLabel.position.set(0, 7.3, 21);
    this.scene.add(gateLabel);
    const dustPositions = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
      dustPositions[i * 3] = Math.sin(i * 127.1) * 65;
      dustPositions[i * 3 + 1] = Math.cos(i * 63.7) * 19 + 12;
      dustPositions[i * 3 + 2] = Math.sin(i * 311.7) * 65 - 10;
    }
    const dgeo = new THREE.BufferGeometry();
    dgeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    this.dust = new THREE.Points(
      dgeo,
      new THREE.PointsMaterial({
        color: 0xc9d7bd,
        size: 0.065,
        transparent: true,
        opacity: 0.5,
      }),
    );
    this.scene.add(this.dust);
    // A restrained first-person relic gauntlet carries the phase orb.
    this.camera.add(this.hands);
    this.hands.position.set(-0.36, -0.38, -0.65);
    const palm = box(0.17, 0.07, 0.22, 0, 0, 0, dark, this.hands);
    palm.rotation.x = -0.15;
    for (let i = 0; i < 4; i++) {
      const finger = box(
        0.028,
        0.07,
        0.12,
        -0.06 + i * 0.04,
        0.02,
        -0.13,
        brass,
        this.hands,
      );
      finger.rotation.x = -0.5;
    }
    box(0.16, 0.1, 0.3, 0, -0.055, 0.2, dark, this.hands);
    this.orb = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.085, 1),
      new THREE.MeshBasicMaterial({ color: CYAN, wireframe: true }),
    );
    this.orb.position.set(0, 0.17, -0.04);
    this.hands.add(this.orb);
    const orbRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.12, 0.005, 6, 32),
      gold,
    );
    orbRing.position.copy(this.orb.position);
    orbRing.rotation.x = 1.1;
    this.hands.add(orbRing);
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(mount);
    this.resize();
  }

  private stoneTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#9baaaa';
    ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 2200; i++) {
      const n = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      ctx.fillStyle = n > 0 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.1)';
      ctx.fillRect((i * 47) % 128, (i * 83 + Math.floor(i / 128)) % 128, 2, 1);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
  private label(text: string) {
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c5d9cf';
    ctx.fillText(text, 384, 40);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      }),
    );
    sprite.scale.set(7, 0.58, 1);
    return sprite;
  }
  private resize() {
    this.needsRender = true;
    const width = this.mount.clientWidth,
      height = this.mount.clientHeight;
    if (!width || !height) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  }
  render(
    s: Expedition,
    settings: Settings,
    mode: 'title' | 'game',
    time: number,
  ) {
    if (this.disposed) return;
    if (this.quality !== settings.quality) {
      this.quality = settings.quality;
      this.renderer.setPixelRatio(
        Math.min(devicePixelRatio, settings.quality === 'high' ? 1.5 : 1),
      );
      this.composer.setPixelRatio(this.renderer.getPixelRatio());
      this.resize();
    }
    const motion = settings.reducedMotion ? 0 : time;
    if (mode === 'title') {
      this.camera.position.set(26, 13, 29);
      this.camera.lookAt(-4, 7, -10);
    } else {
      this.camera.position.set(s.position.x, s.position.y + 1.7, s.position.z);
      this.camera.rotation.set(s.pitch, s.yaw, 0, 'YXZ');
    }
    this.hands.visible = mode === 'game' && !s.complete;
    this.hands.position.y = -0.38 + Math.sin(motion * 1.8) * 0.007;
    this.orb.rotation.y = motion * 0.5;
    (this.orb.material as THREE.MeshBasicMaterial).color.setHex(
      s.phase === 'echo' ? CYAN : GOLD,
    );
    const points = projectTesseract(
      motion * 0.11 + (s.phase === 'echo' ? 0.65 : 0.15),
    );
    const positions = this.tesseract.geometry.attributes
      .position as THREE.BufferAttribute;
    let v = 0;
    for (const edge of TESSERACT_EDGES)
      for (const index of edge) {
        const p = points[index];
        positions.setXYZ(v++, p.x, p.y, p.z);
      }
    positions.needsUpdate = true;
    this.tesseract.geometry.computeBoundingSphere();
    this.vertices.forEach((mesh, i) =>
      mesh.position.set(points[i].x, points[i].y, points[i].z),
    );
    for (const { slab, mesh, edges } of this.phaseObjects) {
      const active = activeIn(slab, s.phase);
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.opacity = active ? 0.95 : 0.035;
      mat.depthWrite = active;
      (edges.material as THREE.LineDashedMaterial).opacity = active
        ? 0.85
        : 0.35;
      (edges.material as THREE.LineDashedMaterial).gapSize = active ? 0 : 0.25;
    }
    this.memories.forEach((group, i) => {
      const crystal = group.userData.crystal as THREE.Mesh;
      crystal.rotation.y = motion * 0.65;
      crystal.position.y = 2.3 + Math.sin(motion * 1.5 + i) * 0.12;
      const mat = crystal.material as THREE.MeshStandardMaterial;
      mat.color.setHex(i < s.collected.length ? GOLD : CYAN);
      mat.emissive.setHex(i < s.collected.length ? GOLD : CYAN);
      mat.emissiveIntensity = i === s.collected.length ? 1.4 : 0.4;
    });
    this.anchors.forEach((a) => {
      a.visible = s.collected.length > 0;
      a.lookAt(this.camera.position);
    });
    (this.gate.material as THREE.MeshBasicMaterial).opacity =
      s.collected.length === 3 ? 0.45 + Math.sin(motion) * 0.08 : 0.04;
    this.dust.rotation.y = motion * 0.004;
    const bg = s.phase === 'echo' ? 0x112b30 : 0x17232c;
    this.background.setHex(bg);
    (this.scene.fog as THREE.FogExp2).color.setHex(bg);
    if (settings.quality === 'high') this.composer.render();
    else this.renderer.render(this.scene, this.camera);
    this.needsRender = false;
  }
  marker(s: Expedition) {
    const target = MEMORIES[s.collected.length] ?? { x: 0, y: 0, z: 21 };
    const p = new THREE.Vector3(target.x, 4.5, target.z).project(this.camera);
    return {
      x: (p.x + 1) * 50,
      y: (1 - p.y) * 50,
      visible:
        p.z < 1 && p.z > -1 && Math.abs(p.x) < 0.9 && Math.abs(p.y) < 0.85,
    };
  }
  dispose() {
    this.disposed = true;
    this.observer.disconnect();
    const geometries = new Set<THREE.BufferGeometry>(),
      materials = new Set<THREE.Material>(),
      textures = new Set<THREE.Texture>();
    this.scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry) geometries.add(mesh.geometry);
      if (mesh.material)
        for (const material of Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material])
          materials.add(material);
    });
    materials.forEach((material) => {
      for (const value of Object.values(material))
        if (value instanceof THREE.Texture) textures.add(value);
      material.dispose();
    });
    textures.forEach((t) => t.dispose());
    geometries.forEach((g) => g.dispose());
    this.bloom.dispose();
    this.composer.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
