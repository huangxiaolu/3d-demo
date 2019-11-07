import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function createCube(scene) {
  const geometry = new BoxGeometry(0.5, 0.5, 0.5);
  const material = new MeshBasicMaterial({ color: "rebeccapurple" });
  const cube = new Mesh(geometry, material); //
  cube.position.y = 0.3;
  scene.add(cube); //  默认放在(0,0,0);
  return cube;
}
function createControls(camera, renderer) {
  // controls
  var controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;

  controls.screenSpacePanning = false;

  controls.minDistance = 5;
  controls.maxDistance = 500;

  controls.maxPolarAngle = Math.PI / 2;
  return controls;
}
function init() {
  const scene = new Scene();
  const camera = new PerspectiveCamera(
    75, // FOV, field of view
    window.innerWidth / window.innerHeight, // aspect ratio。用元素的宽高设定
    0.1, // near 剪切平面。超出这个平面就不会被渲染。
    1000 // far 剪切平面
  );
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2", { alpha: false });
  const renderer = new WebGLRenderer({
    canvas: canvas,
    context: context
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  const controls = createControls(camera, renderer);
  const cube = createCube(scene);

  const loader = new GLTFLoader();

  loader.load(
    "/public/models/pokemon_rse_-_pokemon_center/scene.gltf",
    function(gltf) {
      scene.add(gltf.scene);
      // renderer.render(scene, camera);
      animate();
    },
    undefined,
    function(error) {
      console.error(error);
    }
  );
  let dir = 1;
  function animate() {
    requestAnimationFrame(animate);
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    if (dir > 0 && cube.position.x >= 2) {
      cube.position.x -= 0.01;
      dir = -1;
    } else if (dir > 0) {
      cube.position.x += 0.01;
    } else if (dir < 0 && cube.position.x <= 0) {
      cube.position.x += 0.01;
      dir = 1;
    } else if (dir < 0) {
      cube.position.x -= 0.01;
    }
    render();
  }

  function render() {
    renderer.render(scene, camera);
  }
}
init();
