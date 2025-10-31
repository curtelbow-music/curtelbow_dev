// scripts/boombox-scene.js
// Cleaner neon boombox: proper proportions, edge outlines, ring speakers, animated EQ.
// Requires global THREE (loaded via CDN before this script).

(function () {
  if (typeof THREE === "undefined") {
    console.warn("[boombox] THREE not found. Skipping 3D.");
    return;
  }

  // ----- Scene / Camera / Renderer -----
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0.3, 7);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.inset = "0";
  renderer.domElement.style.zIndex = "2";
  renderer.domElement.style.pointerEvents = "none";
  document.body.appendChild(renderer.domElement);

  // Subtle lights
  const key = new THREE.PointLight(0x1aff6a, 1.2, 20);
  key.position.set(2.5, 3, 5);
  const fill = new THREE.PointLight(0x0aff3a, 0.6, 15);
  fill.position.set(-3, -1, 4);
  const ambient = new THREE.AmbientLight(0x0a0a0a, 1);
  scene.add(key, fill, ambient);

  // ----- Boombox Group -----
  const boom = new THREE.Group();
  scene.add(boom);

  // Proportions + palette
  const BODY_W = 4.6, BODY_H = 2.2, BODY_D = 0.9;
  const GREEN = 0x32cd32;
  const BODY = 0x0a0f0a;

  // Body (matte), face panel (slightly glossy)
  const bodyGeo = new THREE.BoxGeometry(BODY_W, BODY_H, BODY_D);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: BODY,
    roughness: 0.7,
    metalness: 0.2,
    emissive: 0x001500,
    emissiveIntensity: 0.1
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  boom.add(body);

  const faceGeo = new THREE.BoxGeometry(BODY_W * 0.92, BODY_H * 0.76, 0.04);
  const faceMat = new THREE.MeshStandardMaterial({
    color: 0x0f110f,
    roughness: 0.35,
    metalness: 0.35
  });
  const face = new THREE.Mesh(faceGeo, faceMat);
  face.position.set(0, 0, BODY_D * 0.5 - 0.43);
  boom.add(face);

  // Neon outline (edges)
  const edges = new THREE.EdgesGeometry(bodyGeo, 30);
  const edgeLines = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({
      color: GREEN,
      transparent: true,
      opacity: 0.55
    })
  );
  edgeLines.position.copy(body.position);
  boom.add(edgeLines);

  // Handle (top)
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(1.3, 0.07, 12, 48),
    new THREE.MeshStandardMaterial({ color: GREEN, metalness: 0.2, roughness: 0.4 })
  );
  handle.rotation.x = Math.PI / 2;
  handle.position.set(0, BODY_H * 0.56, -0.05);
  boom.add(handle);

  // Speakers: outer neon ring + inner cone
  const ringMat = new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.9 });
  const coneMat = new THREE.MeshStandardMaterial({
    color: 0x11ff55,
    emissive: 0x11ff55,
    emissiveIntensity: 0.5,
    roughness: 0.2,
    metalness: 0.3
  });

  function makeSpeaker(x) {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.06, 16, 64), ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.z = face.position.z + 0.06;

    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.55, 0.25, 48),
      coneMat
    );
    cone.rotation.x = -Math.PI / 2;
    cone.position.z = face.position.z + 0.07;

    g.add(ring, cone);
    g.position.set(x, 0, 0.02);
    return g;
  }
  const speakerL = makeSpeaker(-BODY_W * 0.32);
  const speakerR = makeSpeaker(BODY_W * 0.32);
  boom.add(speakerL, speakerR);

  // Simple animated 8-bar EQ in the center
  const eqGroup = new THREE.Group();
  const BAR_CT = 8;
  const barMat = new THREE.MeshBasicMaterial({ color: GREEN });
  const barW = 0.08, gap = 0.06, baseH = 0.05;
  for (let i = 0; i < BAR_CT; i++) {
    const geo = new THREE.BoxGeometry(barW, baseH, 0.02);
    const bar = new THREE.Mesh(geo, barMat.clone());
    bar.position.x = (i - (BAR_CT - 1) / 2) * (barW + gap);
    bar.position.z = face.position.z + 0.02;
    eqGroup.add(bar);
  }
  eqGroup.position.y = -0.28;
  boom.add(eqGroup);

  // Position & scale so it sits behind your title cleanly
  boom.scale.set(0.62, 0.62, 0.62);
  boom.position.y = -0.15;
  boom.rotation.x = 0.02;

  // ----- Animation -----
  let t = 0;
  function animate(now) {
    requestAnimationFrame(animate);

    // Gentle spin/parallax
    boom.rotation.y += 0.0018;

    // Pulse speakers + neon edges very lightly
    const glow = 0.5 + Math.sin(now * 0.002) * 0.15;
    coneMat.emissiveIntensity = glow;
    edgeLines.material.opacity = 0.45 + Math.sin(now * 0.0016) * 0.1;

    // EQ bars
    t += 0.02;
    eqGroup.children.forEach((bar, i) => {
      const h = 0.08 + Math.abs(Math.sin(t + i * 0.4)) * 0.6; // 0.08..0.68
      bar.scale.y = h / baseH;
      bar.position.y = -0.05 + (h / 2);
    });

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);

  // ----- Resize -----
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
