// boombox-scene.js
// Dev build for Curt Elbow (Trap Worship · Faith over Fear)

(function () {
  console.log("[boombox] Initializing 3D scene...");

  // Ensure THREE.js loaded first
  if (typeof THREE === "undefined") {
    console.warn("[boombox] THREE not found. Skipping 3D scene.");
    return;
  }

  // === Scene Setup ===
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.inset = "0";
  renderer.domElement.style.zIndex = "2";
  document.body.appendChild(renderer.domElement);

  // === Lighting ===
  const light = new THREE.PointLight(0x00ff00, 1.5, 30);
  light.position.set(5, 5, 5);
  scene.add(light);

  const ambient = new THREE.AmbientLight(0x00ff33, 0.2);
  scene.add(ambient);

  // === Boombox Core ===
  const boxGeometry = new THREE.BoxGeometry(4, 2, 1.2);
  const boxMaterial = new THREE.MeshStandardMaterial({
    color: 0x003300,
    emissive: 0x00ff00,
    emissiveIntensity: 0.15,
    metalness: 0.2,
    roughness: 0.6,
  });
  const boombox = new THREE.Mesh(boxGeometry, boxMaterial);
  boombox.scale.set(0.7, 0.7, 0.7);
  scene.add(boombox);

  // === Speaker Details ===
  const speakerGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
  const speakerMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    emissive: 0x00ff00,
    emissiveIntensity: 0.8,
  });

  const leftSpeaker = new THREE.Mesh(speakerGeometry, speakerMaterial);
  const rightSpeaker = leftSpeaker.clone();

  leftSpeaker.rotation.x = Math.PI / 2;
  rightSpeaker.rotation.x = Math.PI / 2;

  leftSpeaker.position.set(-1.2, 0, 0.55);
  rightSpeaker.position.set(1.2, 0, 0.55);

  boombox.add(leftSpeaker);
  boombox.add(rightSpeaker);

  // === Animation ===
  function animate() {
    requestAnimationFrame(animate);

    // Subtle motion
    boombox.rotation.y += 0.002;
    boombox.rotation.x = Math.sin(Date.now() * 0.0003) * 0.05;

    // Light pulse (like audio reactivity)
    light.intensity = 1.3 + Math.sin(Date.now() * 0.004) * 0.25;
    boombox.material.emissiveIntensity =
      0.2 + Math.abs(Math.sin(Date.now() * 0.003)) * 0.2;

    renderer.render(scene, camera);
  }

  animate();

  // === Responsiveness ===
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  console.log("[boombox] Scene ready ✅");
})();
