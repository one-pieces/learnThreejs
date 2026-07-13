import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333355);

// Camera
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(4, 3, 6);
camera.lookAt(0, 1.3, 0);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x444466, 1.5);
scene.add(hemiLight);

const mainLight = new THREE.DirectionalLight(0xffeedd, 3.0);
mainLight.position.set(4, 8, 5);
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0x8888ff, 1.5);
fillLight.position.set(-5, 2, 4);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 1.0);
rimLight.position.set(-2, 1, -6);
scene.add(rimLight);

// ---- Load GLTF ----
function loadModel() {
  if (window.__modelLoaded) return;
  window.__modelLoaded = true;

  const loader = new GLTFLoader();
  loader.load('./adamHead/adamHead.gltf', function (gltf) {
    const model = gltf.scene;

    // Center the model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    model.position.y += 0.3;

    scene.add(model);

    // Auto-rotation
    const rotSpeed = 0.003;
    renderer.setAnimationLoop(function animate() {
      model.rotation.y += rotSpeed;
      renderer.render(scene, camera);
    });
  }, undefined, function (error) {
    console.error('加载模型失败:', error);
  });
}

// ---- Renderer ----
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.5;
document.body.appendChild(renderer.domElement);

// Fallback render until model loads (will be replaced by loader callback)
renderer.setAnimationLoop(() => renderer.render(scene, camera));

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Load model
loadModel();