import * as THREE from "three";
import "./index.scss";

function createScene() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75, // FOV, field of view
    window.innerWidth / window.innerHeight, // aspect ratio。用元素的宽高设定
    0.1, // near 剪切平面。超出这个平面就不会被渲染。
    1000 // far 剪切平面
  );
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  document.body.appendChild(renderer.domElement);

  // create cube
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);// 

  scene.add(cube); //  默认放在(0,0,0);

  camera.position.z = 5;

  function animate() {
    // requestAnimationFrame当用户切去别的页面时会暂停。
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();
}

createScene();
