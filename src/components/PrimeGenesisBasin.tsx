import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import '../primeGenesis.css';

type Phase = 'genesis' | 'resonance' | 'breach';
type Pylon = { group: THREE.Group; beam: THREE.Line; active: boolean; position: THREE.Vector3 };

const PHASE_COPY: Record<Phase, { label: string; objective: string; accent: string }> = {
  genesis: { label: 'GENESIS BASIN', objective: 'Align the three resonance pylons', accent: '#64d8ff' },
  resonance: { label: 'RESONANCE ONLINE', objective: 'The manifold is listening — press Q to pulse it', accent: '#f6b85d' },
  breach: { label: 'DIMENSIONAL BREACH', objective: 'Cross the opened manifold gate', accent: '#ff5f9e' },
};

function makeTesseract(): THREE.Group {
  const group = new THREE.Group();
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < 16; i++) points.push(new THREE.Vector3((i & 1) ? 1 : -1, (i & 2) ? 1 : -1, (i & 4) ? 1 : -1));
  const edges: number[] = [];
  for (let i = 0; i < 16; i++) for (let b = 0; b < 4; b++) { const j = i ^ (1 << b); if (i < j) edges.push(i, j); }
  const geometry = new THREE.BufferGeometry();
  const position = new Float32Array(edges.length * 3 * 2);
  edges.forEach((v, i) => position.set(points[v].toArray(), i * 3));
  geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
  const core = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0x8cecff, transparent: true, opacity: 0.86 }));
  core.scale.setScalar(3.7); group.add(core);
  const inner = core.clone(); inner.material = new THREE.LineBasicMaterial({ color: 0xffb65d, transparent: true, opacity: 0.26 }); inner.scale.setScalar(0.58); group.add(inner);
  const nodeGeo = new THREE.SphereGeometry(0.09, 8, 8);
  points.forEach((p) => { const node = new THREE.Mesh(nodeGeo, new THREE.MeshBasicMaterial({ color: 0xa8f2ff })); node.position.copy(p).multiplyScalar(3.7); group.add(node); });
  return group;
}

function makePylon(position: THREE.Vector3, index: number): Pylon {
  const group = new THREE.Group(); group.position.copy(position);
  const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.7, 4.2, 6), new THREE.MeshStandardMaterial({ color: 0x172631, metalness: 0.62, roughness: 0.34 }));
  stone.position.y = 2.1; group.add(stone);
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.43, 1), new THREE.MeshStandardMaterial({ color: 0x7de5ff, emissive: 0x12617b, emissiveIntensity: 1.8, metalness: 0.35, roughness: 0.2 }));
  core.position.y = 4.35; core.userData.index = index; group.add(core);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.045, 8, 32), new THREE.MeshBasicMaterial({ color: 0x63dfff, transparent: true, opacity: 0.65 }));
  ring.rotation.x = Math.PI / 2; ring.position.y = 4.35; group.add(ring);
  const beamGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 5.5, 0)]);
  const beam = new THREE.Line(beamGeometry, new THREE.LineBasicMaterial({ color: 0xf6b85d, transparent: true, opacity: 0 })); beam.position.copy(position); beam.position.y = 0.2;
  return { group, beam, active: false, position };
}

export function PrimeGenesisBasin() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('genesis');
  const [activePylons, setActivePylons] = useState(0);
  const [message, setMessage] = useState('Move through the basin. The nearest pylon will answer when you are close.');
  const phaseRef = useRef<Phase>('genesis');
  const pylonCountRef = useRef(0);

  useEffect(() => {
    const mount = mountRef.current; if (!mount) return;
    const scene = new THREE.Scene(); const fog = new THREE.FogExp2(0x060a15, 0.022); scene.fog = fog;
    const camera = new THREE.PerspectiveCamera(62, mount.clientWidth / mount.clientHeight, 0.1, 260); camera.position.set(0, 3.2, 18);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8)); renderer.setSize(mount.clientWidth, mount.clientHeight); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12; mount.appendChild(renderer.domElement);
    const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera)); composer.addPass(new UnrealBloomPass(new THREE.Vector2(mount.clientWidth, mount.clientHeight), 0.8, 0.72, 0.25));
    const ambient = new THREE.HemisphereLight(0x6ca8c2, 0x05060b, 1.15); scene.add(ambient);
    const key = new THREE.PointLight(0x54dfff, 16, 42, 2); key.position.set(0, 10, 4); scene.add(key);
    const warm = new THREE.PointLight(0xff774d, 0, 28, 2); warm.position.set(0, 5, -2); scene.add(warm);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(70, 64), new THREE.MeshStandardMaterial({ color: 0x0b1520, roughness: 0.92, metalness: 0.08 })); ground.rotation.x = -Math.PI / 2; scene.add(ground);
    const grid = new THREE.GridHelper(90, 36, 0x24475b, 0x102432); grid.position.y = 0.01; (grid.material as THREE.Material).transparent = true; (grid.material as THREE.Material).opacity = 0.26; scene.add(grid);
    const tesseract = makeTesseract(); tesseract.position.set(0, 10.5, -7); scene.add(tesseract);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(8.5, 0.045, 8, 96), new THREE.MeshBasicMaterial({ color: 0x5bdfff, transparent: true, opacity: 0.45 })); ring.rotation.x = Math.PI / 2; ring.position.set(0, 1.1, -7); scene.add(ring);
    const pylons: Pylon[] = [makePylon(new THREE.Vector3(-10, 0, -4), 0), makePylon(new THREE.Vector3(10, 0, -5), 1), makePylon(new THREE.Vector3(0, 0, 9), 2)]; pylons.forEach((p) => { scene.add(p.group, p.beam); });
    const particles = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0x74e4ff, size: 0.075, transparent: true, opacity: 0.7 })); const particlePositions = new Float32Array(900); for (let i = 0; i < 300; i++) { particlePositions[i * 3] = (Math.random() - 0.5) * 70; particlePositions[i * 3 + 1] = Math.random() * 18; particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 70; } particles.geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3)); scene.add(particles);
    const keys = new Set<string>(); const velocity = new THREE.Vector3(); const yaw = { value: 0 }; const onKeyDown = (event: KeyboardEvent) => { keys.add(event.key.toLowerCase()); if (event.key.toLowerCase() === 'e') { let nearest: Pylon | undefined; let distance = Infinity; pylons.forEach((p) => { const d = camera.position.distanceTo(p.position); if (d < distance) { distance = d; nearest = p; } }); if (nearest && distance < 14 && !nearest.active) { nearest.active = true; pylonCountRef.current += 1; setActivePylons(pylonCountRef.current); setMessage(`Pylon ${pylonCountRef.current} aligned. The basin pressure is changing.`); if (pylonCountRef.current === 3) { phaseRef.current = 'resonance'; setPhase('resonance'); } } else if (nearest) setMessage(`The nearest pylon is ${distance.toFixed(1)}m away.`); } if (event.key.toLowerCase() === 'q' && pylonCountRef.current === 3) { phaseRef.current = 'breach'; setPhase('breach'); setMessage('The tesseract has opened a path. Move toward the breach.'); } if (event.key.toLowerCase() === 'r') { pylons.forEach((p) => { p.active = false; }); pylonCountRef.current = 0; phaseRef.current = 'genesis'; setActivePylons(0); setPhase('genesis'); setMessage('The basin has returned to Genesis state.'); } }; const onKeyUp = (event: KeyboardEvent) => keys.delete(event.key.toLowerCase()); window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp);
    const onResize = () => { camera.aspect = mount.clientWidth / mount.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(mount.clientWidth, mount.clientHeight); composer.setSize(mount.clientWidth, mount.clientHeight); }; window.addEventListener('resize', onResize);
    const clock = new THREE.Clock(); let frame = 0; const animate = () => { frame = requestAnimationFrame(animate); const dt = Math.min(clock.getDelta(), 0.04); const p = phaseRef.current; const speed = p === 'breach' ? 8.2 : 6.2; velocity.set(0, 0, 0); if (keys.has('w') || keys.has('arrowup')) velocity.z -= 1; if (keys.has('s') || keys.has('arrowdown')) velocity.z += 1; if (keys.has('a') || keys.has('arrowleft')) velocity.x -= 1; if (keys.has('d') || keys.has('arrowright')) velocity.x += 1; if (velocity.lengthSq()) { velocity.normalize().multiplyScalar(speed * dt); const c = Math.cos(yaw.value), s = Math.sin(yaw.value); camera.position.x += velocity.x * c - velocity.z * s; camera.position.z += velocity.x * s + velocity.z * c; } camera.position.x = THREE.MathUtils.clamp(camera.position.x, -32, 32); camera.position.z = THREE.MathUtils.clamp(camera.position.z, -32, 32); camera.position.y = 3.2 + Math.sin(clock.elapsedTime * 2.2) * 0.035;
      const intensity = p === 'genesis' ? 0.8 : p === 'resonance' ? 1.45 : 2.1; tesseract.rotation.x += dt * (0.12 + intensity * 0.04); tesseract.rotation.y += dt * (0.22 + intensity * 0.08); tesseract.rotation.z = Math.sin(clock.elapsedTime * 0.35) * 0.18; tesseract.position.y = 10.5 + Math.sin(clock.elapsedTime * 1.4) * 0.22; ring.rotation.z += dt * (p === 'breach' ? 1.3 : 0.22); ring.scale.setScalar(p === 'breach' ? 1 + Math.sin(clock.elapsedTime * 5) * 0.06 : 1); pylons.forEach((pylon, i) => { const core = pylon.group.children[1] as THREE.Mesh; const halo = pylon.group.children[2]; core.rotation.y += dt * (pylon.active ? 2.4 : 0.45); halo.rotation.z += dt * (pylon.active ? 2.2 : 0.25); (core.material as THREE.MeshStandardMaterial).emissiveIntensity = pylon.active ? 3.5 + Math.sin(clock.elapsedTime * 5 + i) : 1.8; (pylon.beam.material as THREE.LineBasicMaterial).opacity = pylon.active ? 0.54 + Math.sin(clock.elapsedTime * 4 + i) * 0.14 : 0; }); ambient.intensity = p === 'genesis' ? 1.05 : p === 'resonance' ? 1.3 : 0.72; key.intensity = p === 'genesis' ? 12 : p === 'resonance' ? 19 : 25; warm.intensity = p === 'breach' ? 15 + Math.sin(clock.elapsedTime * 5) * 4 : 0; fog.color.set(p === 'breach' ? 0x19091c : p === 'resonance' ? 0x0d1722 : 0x060a15); (ground.material as THREE.MeshStandardMaterial).color.set(p === 'breach' ? 0x1a101e : p === 'resonance' ? 0x10202a : 0x0b1520); particles.rotation.y += dt * 0.012; composer.render(); }; animate();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); window.removeEventListener('resize', onResize); renderer.dispose(); mount.removeChild(renderer.domElement); };
  }, []);

  return <main className="prime-shell"><div ref={mountRef} className="prime-canvas" /><header className="prime-header"><div><span className="eyebrow">TESSERACT MANIFOLD · VERTICAL SLICE 01</span><h1>Prime Genesis Basin</h1></div><div className="phase-chip" style={{ borderColor: PHASE_COPY[phase].accent, color: PHASE_COPY[phase].accent }}>{PHASE_COPY[phase].label}</div></header><section className="prime-objective"><span className="objective-kicker">CURRENT OBJECTIVE</span><strong>{PHASE_COPY[phase].objective}</strong><span className="objective-detail">{message}</span></section><aside className="prime-telemetry"><div><span>RESONANCE</span><b>{activePylons}/3</b></div><div><span>PHASE</span><b>{phase.toUpperCase()}</b></div><div><span>CONTROLS</span><b>WASD · E · Q · R</b></div></aside><footer className="prime-footer"><span><i className="dot cyan" />Stable geometry</span><span><i className="dot amber" />Aligned pylon</span><span><i className="dot magenta" />Breach state</span></footer></main>;
}
