<template>
  <canvas class="webgl" ref="canvasRef"></canvas>
</template>

<script lang="ts" setup>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// import * as dat from "dat.gui";
import { ref, onMounted } from "vue";
// 初始化渲染器
const canvasRef = ref<HTMLCanvasElement>();
onMounted(() => {
  init();
});

// 获取范围内的随机数
const rand = (min: number, max: number): number => Math.random() * (max - min) + min;

const init = () => {
  const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value });
  const sizes = {
    height: canvasRef.value!.clientHeight,
    width: canvasRef.value!.clientWidth
  };
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 初始化场景
  const scene = new THREE.Scene();

  // 初始化相机
  const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000);
  camera.position.z = 150;
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(camera);

  // 镜头控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  // 粒子
  const geom = new THREE.BufferGeometry();
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 10,
    alphaTest: 0.8,
    map: new THREE.TextureLoader().load("/images/particle.png")
  });
  let veticsFloat32Array: number[] = [];
  let veticsColors: number[] = [];
  for (let p = 0; p < 1000; p++) {
    veticsFloat32Array.push(rand(20, 30) * Math.cos(p), rand(20, 30) * Math.sin(p), rand(-1500, 0));
    const randomColor = new THREE.Color(Math.random() * 0xffffff);
    veticsColors.push(randomColor.r, randomColor.g, randomColor.b);
  }
  const vertices = new THREE.Float32BufferAttribute(veticsFloat32Array, 3);
  const colors = new THREE.Float32BufferAttribute(veticsColors, 3);
  geom.attributes.position = vertices;
  geom.attributes.color = colors;
  const particleSystem = new THREE.Points(geom, material);
  scene.add(particleSystem);

  // 雾化效果
  scene.fog = new THREE.FogExp2(0x000000, 0.005);
  // 设置光照
  const light1 = new THREE.PointLight(0xffffff, 0.5);
  light1.position.x = -50;
  light1.position.y = -50;
  light1.position.z = 75;
  scene.add(light1);
  const light2 = new THREE.PointLight(0xffffff, 0.5);
  light2.position.x = 50;
  light2.position.y = 50;
  light2.position.z = 75;
  scene.add(light2);
  const light3 = new THREE.PointLight(0xffffff, 0.3);
  light3.position.x = 25;
  light3.position.y = 50;
  light3.position.z = 200;
  scene.add(light3);
  const light4 = new THREE.AmbientLight(0xffffff, 0.02);
  scene.add(light4);

  // 模型
  const loader = new GLTFLoader();
  let astronaut: any;
  loader.load("/models/astronaut.glb", mesh => {
    astronaut = mesh.scene;
    astronaut.material = new THREE.MeshLambertMaterial();
    astronaut.scale.set(0.0005, 0.0005, 0.0005);
    astronaut.position.z = -10;
    scene.add(astronaut);
  });

  // 更新粒子
  const updateParticles = () => {
    particleSystem.position.x = 0.2 * Math.cos(t);
    particleSystem.position.y = 0.2 * Math.cos(t);
    particleSystem.rotation.z += 0.015;
    camera.lookAt(particleSystem.position);
    for (let i = 0; i < veticsFloat32Array.length; i++) {
      if ((i + 1) % 3 === 0) {
        const dist = veticsFloat32Array[i] - camera.position.z;
        if (dist >= 0) veticsFloat32Array[i] = rand(-1000, -500);
        veticsFloat32Array[i] += 2.5;
        const _vertices = new THREE.Float32BufferAttribute(veticsFloat32Array, 3);
        geom.attributes.position = _vertices;
      }
    }
    // @ts-expect-error 估计three与类型声明版本不一致
    particleSystem.geometry.verticesNeedUpdate = true;
  };
  const updateMeshes = () => {
    if (astronaut) {
      astronaut.position.z = 0.08 * Math.sin(t) + (camera.position.z - 0.2);
      astronaut.rotation.x += 0.015;
      astronaut.rotation.y += 0.015;
      astronaut.rotation.z += 0.01;
    }
  };
  const updateRenderer = () => {
    const width = canvasRef.value!.clientWidth;
    const height = canvasRef.value!.clientHeight;
    const needResize = canvasRef.value!.width !== width || canvasRef.value!.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
      camera.aspect = canvasRef.value!.clientWidth / canvasRef.value!.clientHeight;
      camera.updateProjectionMatrix();
    }
  };
  let t = 0;
  const tick = () => {
    updateParticles();
    updateMeshes();
    updateRenderer();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
    t += 0.01;
  };
  tick();

  window.addEventListener("mousemove", e => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = -1 * ((cx - e.clientX) / cx);
    const dy = -1 * ((cy - e.clientY) / cy);
    camera && (camera.position.x = dx * 5);
    camera && (camera.position.y = dy * 5);
    astronaut && (astronaut.position.x = dx * 5);
    astronaut && (astronaut.position.y = dy * 5);
  });

  // 页面缩放事件监听
  window.addEventListener("resize", () => {
    sizes.width = canvasRef.value!.clientWidth;
    sizes.height = canvasRef.value!.clientHeight;
    // 更新渲染
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // 更新相机
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
  });
};
</script>
<style lang="scss">
.webgl {
  width: 100%;
  height: 100%;
}
</style>
