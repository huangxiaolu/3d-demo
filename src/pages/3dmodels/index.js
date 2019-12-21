import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  Vector3,
  BufferGeometry,
  BufferAttribute,
  Color,
  LineDashedMaterial,
  VertexColors,
  Line,
} from "three";
import TWEEN from "@tweenjs/tween.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Projector } from "three/examples/jsm/renderers/Projector";

const cubeName = "minion";
// 动态画线：dashline、setDrawRange.
// https://stackoverflow.com/questions/42229799/how-to-smoothly-animate-drawing-of-a-line/42236893#42236893
// https://stackoverflow.com/questions/31399856/drawing-a-line-with-three-js-dynamically
let camera;
let controls;
let renderer;
let scene;
let cube;
let line;
let lineLength;
function createCube() {
  const geometry = new BoxGeometry(0.15, 0.15, 0.15);
  const material = new MeshBasicMaterial({ color: "rebeccapurple" });
  cube = new Mesh(geometry, material); //
  cube.position.y = 0.3;
  cube.name = cubeName;
  scene.add(cube); //  默认放在(0,0,0);
  console.log(cube);
}
function createLine(points) {
  const geometry = new BufferGeometry();
  const numPoints = points.length;

  const positions = new Float32Array(numPoints * 3);
  const colors = new Float32Array(numPoints * 3);
  const lineDistances = new Float32Array(numPoints * 1);

  geometry.addAttribute("position", new BufferAttribute(positions, 3));
  geometry.addAttribute("color", new BufferAttribute(colors, 3));
  geometry.addAttribute("lineDistance", new BufferAttribute(lineDistances, 1));

  const color = new Color();

  for (let i = 0, index = 0; i < numPoints; i += 1, index += 3) {
    positions[index] = points[i].x;
    positions[index + 1] = points[i].y;
    positions[index + 2] = points[i].z;
    color.setHSL(i / numPoints, 1.0, 0.5);

    colors[index] = color.r;
    colors[index + 1] = color.g;
    colors[index + 2] = color.b;

    if (i > 0) {
      lineDistances[i] =
        lineDistances[i - 1] +
        new Vector3(...Object.values(points[i - 1])).distanceTo(
          new Vector3(...Object.values(points[i]))
        );
    }
  }
  lineLength = lineDistances[numPoints - 1];
  const material = new LineDashedMaterial({
    vertexColors: VertexColors,
    dashSize: 1,
    gapSize: 1e10,
  });

  line = new Line(geometry, material);
  scene.add(line);
}
function createControls() {
  // controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;

  controls.screenSpacePanning = false;

  controls.minDistance = 5;
  controls.maxDistance = 10;

  controls.maxPolarAngle = Math.PI / 2;
}
function loadModels() {
  const loader = new GLTFLoader();

  loader.load(
    "/public/models/pokemon_rse_-_pokemon_center/scene.gltf",
    gltf => {
      console.log(gltf);
      scene.add(gltf.scene);
    },
    undefined,
    error => {
      console.error(error);
    }
  );
}

let userOpts = {
  range: 800,
  duration: 2500,
  delay: 200,
  easing: "Elastic.EaseInOut",
  speed: 0.0008,
};

function setupTween(paths) {
  var current = { ...paths[0], fraction: 0 };
  let accDistance = 0;
  function update() {
    cube.position.x = current.x;
    cube.position.z = current.z;
    cube.position.y = current.y;
    line.material.dashSize = current.fraction * lineLength;
    // map 到屏幕坐标
    let pos = new Vector3();
    pos = pos.setFromMatrixPosition(cube.matrixWorld);
    pos.project(camera);
    // console.log(pos);
  }

  // remove previous tweens if needed
  TWEEN.removeAll();
  // const easing = TWEEN.Easing[userOpts.easing.split(".")[0]][userOpts.easing.split(".")[1]];
  const tweens = paths
    .map((point, index) => {
      if (index === 0) return undefined;

      const prevPoint = paths[index - 1];
      const startVector = new Vector3(...Object.values(prevPoint));
      const endVector = new Vector3(...Object.values(point));
      const lineSegLength = startVector.distanceTo(endVector);
      const duration = lineSegLength / userOpts.speed;
      accDistance += lineSegLength;
      return (
        new TWEEN.Tween(current)
          .to({ ...point, fraction: accDistance / lineLength }, duration)
          .delay(userOpts.delay)
          // .easing(easing)
          .onUpdate(update)
      );
    })
    .filter(Boolean);
  // console.log(tweens);
  // 从头走到尾。
  tweens.reduce((acc, tween, i) => {
    if (i === 0) return acc;
    acc.chain(tween);
    return tween;
  }, tweens[0]);

  // start the first
  tweens[0].start();
}

function update() {
  controls.update();
  TWEEN.update();
}
function render() {
  renderer.render(scene, camera);
}

function init() {
  const paths = [
    { x: 0, y: 0.3, z: 0 },
    { x: 1, y: 0.3, z: 1 },
    { x: 0, y: 0.3, z: 1 },
    { x: 1, y: 0.3, z: 3 },
    { x: 3, y: 0.3, z: 1.5 },
  ];
  scene = new Scene();
  camera = new PerspectiveCamera(
    75, // FOV, field of view
    window.innerWidth / window.innerHeight, // aspect ratio。用元素的宽高设定
    0.1, // near 剪切平面。超出这个平面就不会被渲染。
    100 // far 剪切平面
  );
  camera.position.x = 0;
  camera.position.y = 5;
  camera.position.z = 5;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2", { alpha: false });
  renderer = new WebGLRenderer({
    canvas: canvas,
    context: context,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  createCube();
  createLine(paths);
  createControls(camera, renderer);
  loadModels();
  setupTween(paths);
  renderer.setAnimationLoop(() => {
    update();
    render();
  });
}
init();
