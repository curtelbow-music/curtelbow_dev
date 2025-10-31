// boombox-scene.js
// Simple rotating 3D boombox prototype for dev.curtelbow.com

(function initBoomboxScene() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.2, 4);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0x66ff99, 1.2);
  const point = new THREE.PointLight(0x32cd32, 1.5, 20);
  point.position.set(0, 2, 3);
  scene.add(ambient, point);

  const boxMat = new THREE.MeshStandardMaterial({
    color: 0x0f0f0f,
    metalness: 0.7,
    roughness: 0.3,
    emissive: 0x003300,
    emissiveIntensity: 0.7
  });
  const boxGeo = new THREE.BoxGeometry(3, 1.5, 1);
  const boombox = new THREE.Mesh(boxGeo, boxMat);
  scene.add(boombox);

  const speakerMat = new THREE.MeshStandardMaterial({
    color: 0x32cd32,
    emissive: 0x32cd32,
    emissiveIntensity: 1.8
  });
  const speakerGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32);
  const leftSpeaker = new THREE.Mesh(speakerGeo, speakerMat);
  const rightSpeaker = leftSpeaker.clone();
  leftSpeaker.rotation.x = Math.PI / 2;
  rightSpeaker.rotation.x = Math.PI / 2;
  leftSpeaker.position.set(-1.1, 0, 0.5);
  rightSpeaker.position.set(1.1, 0, 0.5);
  scene.add(leftSpeaker, rightSpeaker);

  const handleMat = new THREE.MeshStandardMaterial({ color: 0x32cd32 });
  const handleGeo = new THREE.BoxGeometry(1.8, 0.15, 0.15);
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.set(0, 0.9, 0);
  scene.add(handle);

  function animate() {
    requestAnimationFrame(animate);
    boombox.rotation.y += 0.005;
    handle.rotation.y += 0.005;
    leftSpeaker.rotation.z += 0.02;
    rightSpeaker.rotation.z -= 0.02;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();