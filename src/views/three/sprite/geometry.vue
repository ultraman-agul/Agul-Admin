<template>
  <canvas class="webgl" ref="canvasRef"></canvas>
</template>

<script lang="ts" setup>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import * as dat from "dat.gui";
import { ref, onMounted } from "vue";
// 初始化渲染器
const canvasRef = ref<HTMLCanvasElement>();
onMounted(() => {
  init();
});

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
  camera.position.z = 120;
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(camera);

  // 镜头控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

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

  const createParticlesByGeometry = () => {
    // 创建发光canvas纹理
    const generateSprite = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 16;
      const context = canvas.getContext("2d")!;
      const gradient = context.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      );
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.2, "rgba(0, 255, 0, 1)");
      gradient.addColorStop(0.4, "rgba(0, 120, 20, 1)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 1)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      return texture;
    };
    // 创建立方体
    const sphereGeometry = new THREE.SphereGeometry(15, 32, 16);
    // 创建粒子材质
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 3,
      transparent: true,
      blending: THREE.AdditiveBlending,
      map: generateSprite(),
      depthWrite: false
    });
    const particles = new THREE.Points(sphereGeometry, material);
    scene.add(particles);
  };
  createParticlesByGeometry();
  // 页面重绘动画
  const tick = () => {
    controls && controls.update();
    // 更新渲染器
    renderer.render(scene, camera);
    // 页面重绘时调用自身
    window.requestAnimationFrame(tick);
  };
  tick();
};
</script>
<style lang="scss">
.webgl {
  width: 100%;
  height: 100%;
}
</style>
