/* ═══════════════════════════════════════════
   Adawaty — Three.js Interactive Hero
   Performance-first: checks WebGL + reduced motion
   ═══════════════════════════════════════════ */

import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export function initHero3D() {
  const canvas = document.getElementById("hero3d");
  if (!canvas) return;

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !supportsWebGL()) {
    canvas.remove();
    return;
  }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 60);
  camera.position.set(0, 0.5, 6.2);

  // Lights
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(2, 2.5, 2);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x2dd4bf, 0.6);
  fill.position.set(-3, 0.5, 1);
  scene.add(fill);

  const rim = new THREE.PointLight(0x818cf8, 1.4, 30);
  rim.position.set(0, 1, -6);
  scene.add(rim);

  // Main object (wire-ish iridescent)
  const knotGeo = new THREE.TorusKnotGeometry(1.05, 0.28, 220, 26);
  const knotMat = new THREE.MeshPhysicalMaterial({
    color: 0x0b1220,
    emissive: 0x0b1220,
    roughness: 0.12,
    metalness: 0.75,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  });
  const knot = new THREE.Mesh(knotGeo, knotMat);
  knot.position.set(1.6, 0.1, -0.4);
  scene.add(knot);

  // Accent ring
  const ringGeo = new THREE.TorusGeometry(1.35, 0.03, 16, 180);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x2dd4bf, emissive: 0x0d9488, emissiveIntensity: 0.55, metalness: 0.6, roughness: 0.25 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.copy(knot.position);
  ring.rotation.x = 0.9;
  ring.rotation.y = 0.1;
  scene.add(ring);

  // Particles
  const count = isMobile ? 520 : 900;
  const ptsGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 5.2 * Math.random();
    const a = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 3.2;
    positions[i * 3 + 0] = Math.cos(a) * r - 0.5;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(a) * r - 2;
  }
  ptsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const ptsMat = new THREE.PointsMaterial({ color: 0x9ca3af, size: 0.018, transparent: true, opacity: 0.5, depthWrite: false });
  const pts = new THREE.Points(ptsGeo, ptsMat);
  scene.add(pts);

  // Resize
  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  // Interaction
  let mx = 0, my = 0;
  const onMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mx = (x - 0.5) * 2;
    my = (y - 0.5) * 2;
  };
  window.addEventListener("pointermove", onMove, { passive: true });


  // Pause rendering when tab is hidden (saves battery)
  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
  }, { passive: true });

  // Kill 3D on very small screens to keep text-first UX
  if (isMobile && window.matchMedia('(max-width: 420px)').matches) {
    canvas.style.display = 'none';
    return;
  }

  let t = 0;
  function tick() {
    t += 0.008;

    // Gentle drift
    knot.rotation.x += 0.005;
    knot.rotation.y += 0.006;

    // Mouse parallax
    const tx = mx * 0.35;
    const ty = -my * 0.22;
    knot.position.x = 1.6 + tx;
    knot.position.y = 0.1 + ty;

    ring.position.x = knot.position.x;
    ring.position.y = knot.position.y;
    ring.rotation.z = t * 0.6;

    pts.rotation.y = t * 0.18;

    // Camera micro push
    camera.position.x = tx * 0.15;
    camera.position.y = 0.5 + ty * 0.12;
    camera.lookAt(0.2, 0.1, -2);

    if (running) renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
}

// Auto-init
initHero3D();
