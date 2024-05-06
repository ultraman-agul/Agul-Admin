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

  const createParticlesByTexture = () => {
    // 创建粒子系统
    const createParticles = (size, transparent, opacity, sizeAttenuation, color) => {
      const geom = new THREE.BufferGeometry();
      const material = new THREE.PointsMaterial({
        size: size,
        transparent: transparent,
        opacity: opacity,
        map: new THREE.TextureLoader().load("/images/heart.png"),
        sizeAttenuation: sizeAttenuation,
        color: color,
        depthTest: true,
        depthWrite: false
      });
      let veticsFloat32Array: number[] = [];
      const range = 500;
      for (let i = 0; i < 400; i++) {
        const particle = new THREE.Vector3(
          Math.random() * range - range / 2,
          Math.random() * range - range / 2,
          Math.random() * range - range / 2
        );
        veticsFloat32Array.push(particle.x, particle.y, particle.z);
      }
      const vertices = new THREE.Float32BufferAttribute(veticsFloat32Array, 3);
      geom.attributes.position = vertices;
      const particles = new THREE.Points(geom, material);
      scene.add(particles);
    };
    createParticles(40, true, 1, true, 0xffffff);
  };
  createParticlesByTexture();
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
