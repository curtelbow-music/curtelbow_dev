// boombox-scene.js
// Rotating 3D boombox with subtle glow, mouse parallax, and safe fallbacks.

(function initBoomboxScene() {
  // THREE safety check (so dev never hard-crashes)
  if (typeof window.THREE === "undefined") {
    console.warn("[boombox] THREE not found. Skipping 3D scene.");
    return;
  }
  const THREE = window.THREE;

  // Container overlay (stays above video, below UI)
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.inset = '0';
  container.style.zIndex = '1';
  container.style.pointerEvents = 'none'; // let UI pass through
  document.body.appendChild(container);

  // Scene / camera / renderer
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050505, 0.16);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.2, 4);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Lights
  const ambient = new THREE.AmbientLight(0x66ff99, 0.9);
  const key = new THREE.PointLight(0x32cd32, 1.6, 20);
  key.position.set(0, 2, 3);
  const rim = new THREE.PointLight(0x0bb90b, 0.9, 18);
  rim.position.set(-2.2, 1.2, -2.2);
  scene.add(ambient, key, rim);

  // Boombox core
  const boxMat = new THREE.MeshStandardMaterial({
    color: 0x0f0f0f,
    metalness: 0.65,
    roughness: 0.35,
    emissive: 0x002200,
    emissiveIntensity: 0.65
  });
  const boxGeo = new THREE.BoxGeometry(3, 1.5, 1);
  const boombox = new THREE.Mesh(boxGeo, boxMat);
  scene.add(boombox);

  // Face panel (slight bevel look)
  const faceMat = new THREE.MeshStandardMaterial({
    color: 0x101010,
    metalness: 0.5,
    roughness: 0.25
  });
  const faceGeo = new THREE.BoxGeometry(2.8, 1.3, 0.04);
  const face = new THREE.Mesh(faceGeo, faceMat);
  face.position.set(0, 0, 0.53);
  boombox.add(face);

  // Speakers
  const speakerMat = new THREE.MeshStandardMaterial({
    color: 0x1fea1f,
    emissive: 0x1fea1f,
    emissiveIntensity: 1.25
  });
  const speakerGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 40);
  const leftSpeaker = new THREE.Mesh(speakerGeo, speakerMat);
  const rightSpeaker = leftSpeaker.clone();
  leftSpeaker.rotation.x = Math.PI / 2;
  rightSpeaker.rotation.x = Math.PI / 2;
  leftSpeaker.position.set(-1.05, 0, 0.58);
  rightSpeaker.position.set(1.05, 0, 0.58);
  boombox.add(leftSpeaker, rightSpeaker);

  // Handle
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x32cd32, metalness: 0.3 });
  const handleGeo = new THREE.BoxGeometry(1.8, 0.15, 0.15);
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.set(0, 0.9, 0.05);
  boombox.add(handle);

  // Subtle ground (for depth cues)
  const groundGeo = new THREE.PlaneGeometry(40, 40);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x040604, roughness: 1, metalness: 0 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.2;
  scene.add(ground);

  // Parallax via mouse (gentle)
  let targetRotX = 0, targetRotY = 0;
  const MAX_ROT_X = 0.18; // ~10deg
  const MAX_ROT_Y = 0.30; // ~17deg

  function onMouseMove(e) {
    const nx = (e.clientX / window.innerWidth) * 2 - 1; // -1..1
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    targetRotY = -nx * MAX_ROT_Y;
    targetRotX = ny * MAX_ROT_X;
  }
  window.addEventListener('mousemove', onMouseMove, { passive: true });

  // Resize
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  // Animate
  let last = performance.now();
  function animate(now) {
    requestAnimationFrame(animate);
    const dt = Math.min((now - last) / 1000, 0.033);
    last = now;

    // Ease toward mouse targets
    boombox.rotation.x += (targetRotX - boombox.rotation.x) * 0.07;
    boombox.rotation.y += (targetRotY - boombox.rotation.y) * 0.07;

    // Gentle idle motion (if mouse idle)
    boombox.rotation.y += 0.005 * (1 - Math.abs(targetRotY) / MAX_ROT_Y) * dt * 60;

    // Speaker sparkle
    leftSpeaker.rotation.z += 0.015;
    rightSpeaker.rotation.z -= 0.015;

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
})();
