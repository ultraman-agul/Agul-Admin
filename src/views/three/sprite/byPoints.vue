<template>
  <canvas class="webgl" ref="canvasRef"></canvas>
</template>

<script lang="ts" setup>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
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

  // Points创建粒子
  const createStyledParticlesByPoints = ctrls => {
    const geom = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({
      size: ctrls.size,
      transparent: ctrls.transparent,
      opacity: ctrls.opacity,
      color: new THREE.Color(ctrls.color),
      vertexColors: ctrls.vertexColors,
      sizeAttenuation: ctrls.sizeAttenuation
    });
    let veticsFloat32Array: number[] = [];
    let veticsColors: number[] = [];
    for (let x = -15; x < 15; x++) {
      for (let y = -10; y < 10; y++) {
        veticsFloat32Array.push(x * 4, y * 4, 0);
        const randomColor = new THREE.Color(Math.random() * ctrls.vertexColor);
        veticsColors.push(randomColor.r, randomColor.g, randomColor.b);
      }
    }
    const vertices = new THREE.Float32BufferAttribute(veticsFloat32Array, 3);
    const colors = new THREE.Float32BufferAttribute(veticsColors, 3);
    geom.attributes.position = vertices;
    geom.attributes.color = colors;
    const particles = new THREE.Points(geom, material);
    particles.name = "particles";
    scene.add(particles);
  };
  // 创建属性控制器
  const ctrls = {
    size: 5,
    transparent: false,
    opacity: 0.6,
    vertexColors: true,
    color: 0xffffff,
    vertexColor: 0x00ff00,
    sizeAttenuation: true,
    rotate: true,
    redraw
  };

  function redraw() {
    if (scene.getObjectByName("particles")) {
      scene.remove(scene.getObjectByName("particles")!);
    }
    createStyledParticlesByPoints({
      size: ctrls.size,
      transparent: ctrls.transparent,
      opacity: ctrls.opacity,
      vertexColors: ctrls.vertexColors,
      sizeAttenuation: ctrls.sizeAttenuation,
      color: ctrls.color,
      vertexColor: ctrls.vertexColor
    });
  }

  ctrls.redraw = redraw;

  const gui = new dat.GUI();
  gui.add(ctrls, "size", 0, 10).onChange(ctrls.redraw);
  gui.add(ctrls, "transparent").onChange(ctrls.redraw);
  gui.add(ctrls, "opacity", 0, 1).onChange(ctrls.redraw);
  gui.add(ctrls, "vertexColors").onChange(ctrls.redraw);
  gui.addColor(ctrls, "color").onChange(ctrls.redraw);
  gui.addColor(ctrls, "vertexColor").onChange(ctrls.redraw);
  gui.add(ctrls, "sizeAttenuation").onChange(ctrls.redraw);
  ctrls.redraw();
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
