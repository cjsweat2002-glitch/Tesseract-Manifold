import * as THREE from 'three';
import { RESIDENTS, STATIONS, entityActive, isNight, wardActive } from './life';
import type { Expedition } from './model';

/** Procedural domestic spaces and inhabitants, owned/disposed by the parent scene. */
export class NeighbourhoodScene {
  readonly root = new THREE.Group();
  private residents: THREE.Group[] = [];
  private entities: THREE.Group[] = [];
  private seedlings: THREE.Group;
  private ward: THREE.Mesh;
  private mural: THREE.Group;
  constructor(label: (text: string) => THREE.Sprite) {
    const timber = new THREE.MeshStandardMaterial({
      color: 0x574b3b,
      roughness: 0.9,
    });
    const cloth = new THREE.MeshStandardMaterial({
      color: 0xb68150,
      roughness: 1,
      side: THREE.DoubleSide,
    });
    const leaf = new THREE.MeshStandardMaterial({
      color: 0x91bd8a,
      emissive: 0x183b25,
    });
    const glow = new THREE.MeshBasicMaterial({ color: 0xffd69a });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x10151b,
      roughness: 0.9,
    });
    const box = (
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      m: THREE.Material,
      parent: THREE.Object3D = this.root,
    ) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    };
    for (const x of [-10, 10]) {
      box(5.8, 0.25, 5, x, 3.3, 23, cloth);
      box(3, 0.25, 1.2, x, 0.5, 24, timber);
      box(1, 0.5, 0.8, x + 1.5, 0.25, 22, timber);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), glow);
      lamp.position.set(x, 2.4, 23);
      this.root.add(lamp);
      const light = new THREE.PointLight(0xffbb72, 7, 9);
      light.position.copy(lamp.position);
      this.root.add(light);
      const sign = label(
        x < 0 ? 'MIRA / SEED & SOIL' : 'IVO / LANTERN REPAIRS',
      );
      sign.position.set(x, 3.9, 23);
      this.root.add(sign);
    }
    for (const p of STATIONS) {
      const sign = label(p.name.toUpperCase());
      sign.position.set(p.x, 2.9, p.z);
      this.root.add(sign);
    }
    // Raised beds, a communal table, and a quilt mark ordinary life in the relic architecture.
    box(2.2, 0.55, 1.8, -9, 0.275, 13, timber);
    this.seedlings = new THREE.Group();
    this.seedlings.position.set(-9, 0.6, 13);
    this.root.add(this.seedlings);
    for (let i = 0; i < 6; i++) {
      const plant = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.7, 5), leaf);
      plant.position.set(
        ((i % 3) - 1) * 0.6,
        0.3,
        Math.floor(i / 3) * 0.6 - 0.3,
      );
      this.seedlings.add(plant);
    }
    box(2.2, 0.15, 1.2, 0, 0.85, 6, timber);
    for (const x of [-0.8, 0.8]) box(0.12, 0.8, 0.8, x, 0.4, 6, timber);
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.2, 0.35, 12),
      dark,
    );
    pot.position.set(0, 1.1, 6);
    this.root.add(pot);
    box(2, 0.2, 2.2, -4, 0.1, 21, cloth);
    box(1.7, 0.15, 0.5, -4, 0.3, 21.7, glow);
    for (const z of [10, 17]) {
      box(2.5, 0.2, 0.7, 4, 0.55, z, timber);
      box(0.2, 0.5, 0.6, 3, 0.25, z, timber);
      box(0.2, 0.5, 0.6, 5, 0.25, z, timber);
    }
    const ring = (radius: number, color: number, x: number, z: number) => {
      const mesh = new THREE.Mesh(
        new THREE.RingGeometry(radius - 0.06, radius, 96),
        new THREE.MeshBasicMaterial({
          color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.55,
        }),
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(x, 0.04, z);
      this.root.add(mesh);
      return mesh;
    };
    ring(8, 0xffc47c, 0, 19);
    this.ward = ring(18, 0x8cf6d4, 0, 0);
    box(0.6, 1.2, 0.6, 0, 0.6, 0, timber);
    box(0.3, 0.3, 0.3, 0, 1.4, 0, glow);
    this.mural = new THREE.Group();
    this.mural.position.set(0, 2, 24);
    this.root.add(this.mural);
    for (let i = 0; i < 9; i++) {
      const tile = box(
        0.28,
        0.6,
        0.1,
        (i - 4) * 0.4,
        Math.sin(i) * 0.3,
        0,
        glow,
        this.mural,
      );
      tile.rotation.z = i * 0.3;
    }
    const muralLabel = label('WE LIVE HERE');
    muralLabel.position.set(0, 1, 0);
    this.mural.add(muralLabel);
    for (const r of RESIDENTS) {
      const group = new THREE.Group();
      this.root.add(group);
      this.residents.push(group);
      const coat = new THREE.MeshStandardMaterial({
        color: r.color,
        roughness: 0.9,
      });
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.35, 0.8, 7),
        coat,
      );
      body.position.y = 0.95;
      group.add(body);
      const head = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.23, 1),
        timber,
      );
      head.position.y = 1.65;
      group.add(head);
      for (const x of [-0.16, 0.16]) {
        box(0.14, 0.6, 0.16, x, 0.3, 0, dark, group);
        box(0.12, 0.6, 0.13, x * 2, 1, 0, coat, group);
      }
      for (const x of [-0.08, 0.08])
        box(0.035, 0.035, 0.04, x, 1.68, -0.21, glow, group);
      const name = label(`${r.name.toUpperCase()} / ${r.role.toUpperCase()}`);
      name.position.y = 2.6;
      group.add(name);
    }
    for (let i = 0; i < 2; i++) {
      const group = new THREE.Group();
      this.root.add(group);
      this.entities.push(group);
      const red = new THREE.MeshBasicMaterial({
        color: i ? 0xf16d75 : 0xd58bea,
      });
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.65, 3.8, 5), dark);
      body.position.y = 2.1;
      group.add(body);
      for (const x of [-0.8, 0.8]) {
        const arm = box(0.12, 3.8, 0.12, x, 2.3, 0, dark, group);
        arm.rotation.z = x * 0.3;
        box(0.18, 0.4, 0.2, x * 1.7, 0.5, 0, red, group);
      }
      const face = new THREE.Mesh(
        new THREE.TorusGeometry(0.3, 0.045, 5, 20),
        red,
      );
      face.position.set(0, 3.8, -0.16);
      group.add(face);
      const name = label(
        i ? 'THE HOLLOW / NIGHT STALKER' : 'THE UNINVITED / ECHO STALKER',
      );
      name.position.y = 4.8;
      group.add(name);
    }
  }
  update(s: Expedition, motion: number) {
    this.residents.forEach((group, i) => {
      const r = s.life.residents[i];
      const old = group.position.clone();
      group.position.set(r.position.x, 0, r.position.z);
      if (old.distanceTo(group.position) > 0.001)
        group.rotation.y = Math.atan2(
          old.x - group.position.x,
          old.z - group.position.z,
        );
    });
    this.entities.forEach((group, i) => {
      const e = s.life.entities[i];
      group.visible = entityActive(s, i);
      group.position.set(
        e.position.x,
        Math.sin(motion * 1.5 + i) * 0.12,
        e.position.z,
      );
      group.lookAt(s.position.x, group.position.y, s.position.z);
    });
    this.seedlings.scale.y = s.life.gardenReady > s.life.clock ? 0.2 : 1;
    this.ward.visible = wardActive(s);
    this.mural.visible = s.life.quests.sen === 3;
  }
}
