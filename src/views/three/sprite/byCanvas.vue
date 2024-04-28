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
  // Sprite创建粒子
  // const createSprite = () => {
  //   const Group = new THREE.Group();
  //   for (let i = 0; i < 10; i++) {
  //     for (let j = 0; j < 10; j++) {
  //       const spriteMaterial = new THREE.SpriteMaterial({
  //         color: 0xffffff * Math.random()
  //       });
  //       const sprite = new THREE.Sprite(spriteMaterial);
  //       sprite.position.set(i * 4, j * 4, 1);
  //       Group.add(sprite);
  //     }
  //   }
  //   scene.add(Group);
  // };
  // createSprite();

  // Points创建粒子
  // const createStyledParticlesByPoints = ctrls => {
  //   const geom = new THREE.BufferGeometry();
  //   const material = new THREE.PointsMaterial({
  //     size: ctrls.size,
  //     transparent: ctrls.transparent,
  //     opacity: ctrls.opacity,
  //     color: new THREE.Color(ctrls.color),
  //     vertexColors: ctrls.vertexColors,
  //     sizeAttenuation: ctrls.sizeAttenuation
  //   });
  //   let veticsFloat32Array: number[] = [];
  //   let veticsColors: number[] = [];
  //   for (let x = -15; x < 15; x++) {
  //     for (let y = -10; y < 10; y++) {
  //       veticsFloat32Array.push(x * 4, y * 4, 0);
  //       const randomColor = new THREE.Color(Math.random() * ctrls.vertexColor);
  //       veticsColors.push(randomColor.r, randomColor.g, randomColor.b);
  //     }
  //   }
  //   const vertices = new THREE.Float32BufferAttribute(veticsFloat32Array, 3);
  //   const colors = new THREE.Float32BufferAttribute(veticsColors, 3);
  //   geom.attributes.position = vertices;
  //   geom.attributes.color = colors;
  //   const particles = new THREE.Points(geom, material);
  //   particles.name = "particles";
  //   scene.add(particles);
  // };
  // // 创建属性控制器
  // const ctrls = new (function () {
  //   this.size = 5;
  //   this.transparent = true;
  //   this.opacity = 0.6;
  //   this.vertexColors = true;
  //   this.color = 0xffffff;
  //   this.vertexColor = 0x00ff00;
  //   this.sizeAttenuation = true;
  //   this.rotate = true;
  //   this.redraw = function () {
  //     if (scene.getObjectByName("particles")) {
  //       scene.remove(scene.getObjectByName("particles")!);
  //     }
  //     createStyledParticlesByPoints({
  //       size: ctrls.size,
  //       transparent: ctrls.transparent,
  //       opacity: ctrls.opacity,
  //       vertexColors: ctrls.vertexColors,
  //       sizeAttenuation: ctrls.sizeAttenuation,
  //       color: ctrls.color,
  //       vertexColor: ctrls.vertexColor
  //     });
  //   };
  // })();
  // const gui = new dat.GUI();
  // gui.add(ctrls, "size", 0, 10).onChange(ctrls.redraw);
  // gui.add(ctrls, "transparent").onChange(ctrls.redraw);
  // gui.add(ctrls, "opacity", 0, 1).onChange(ctrls.redraw);
  // gui.add(ctrls, "vertexColors").onChange(ctrls.redraw);
  // gui.addColor(ctrls, "color").onChange(ctrls.redraw);
  // gui.addColor(ctrls, "vertexColor").onChange(ctrls.redraw);
  // gui.add(ctrls, "sizeAttenuation").onChange(ctrls.redraw);

  const createParticlesByCanvas = () => {
    // 使用canvas创建纹理
    const createCanvasTexture = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = 300;
      canvas.height = 300;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(170, 120);
      const grd = ctx.createLinearGradient(0, 0, 170, 0);
      grd.addColorStop(0, "black");
      grd.addColorStop(0.3, "magenta");
      grd.addColorStop(0.5, "blue");
      grd.addColorStop(0.6, "green");
      grd.addColorStop(0.8, "yellow");
      grd.addColorStop(1, "red");
      ctx.strokeStyle = grd;
      ctx.arc(120, 120, 50, 0, Math.PI * 2);
      ctx.stroke();
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };
    // 创建粒子系统
    const createParticles = (size, transparent, opacity, sizeAttenuation, color) => {
      const texture = createCanvasTexture();
      const geom = new THREE.BufferGeometry();
      const material = new THREE.PointsMaterial({
        size: size,
        transparent: transparent,
        opacity: opacity,
        map: texture,
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
  createParticlesByCanvas();
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
