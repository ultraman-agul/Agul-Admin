<!-- 本demo中实现多个场景穿梭漫游的方法原理：
  主要是通过移动相机和控制器的中点位置来实现的，
  先用用于生成多个场景的 rooms 数值在页面上添加一些表示切换房间的按钮，
  点击按钮时拿到需要跳转的目标场景信息，
  然后通过 Animations.animateCamera 方法将摄像机和控制器从当前位置平滑移动到目标位置。
 -->
<template>
  <div class="home">
    <canvas class="webgl"></canvas>
    <!-- 场景切换点 -->
    <div class="switch">
      <span
        class="button"
        v-for="(room, index) in rooms"
        :key="index"
        @click="handleSwitchButtonClick(room.id)"
        v-show="room.id !== data.currentRoom"
      >
        <b class="text">{{ room.name }}</b>
        <i class="icon"></i>
      </span>
    </div>
  </div>
</template>

<script lang="js" setup>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min.js";
import { onMounted, reactive } from "vue";
import { rooms } from "./data";
import Animations from "./Animations";
onMounted(() => {
  initScene();
  createRooms();
});

const data = reactive({
  cameraZAxis: 2,
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  currentRoom: "living-room"
});

// 初始化场景
const initScene = () => {
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  // 初始化渲染器
  const canvas = document.querySelector("canvas.webgl");
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  data.renderer = renderer;

  // 初始化场景
  const scene = new THREE.Scene();
  data.scene = scene;

  // 初始化相机
  const camera = new THREE.PerspectiveCamera(65, sizes.width / sizes.height, 0.1, 1000);
  camera.position.set(0, 0, 30);
  // camera.position.z = data.cameraZAxis;
  scene.add(camera);
  data.camera = camera;

  // 镜头控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  // 转动惯性
  controls.enableDamping = true;
  // 禁止平移
  controls.enablePan = false;
  // 缩放限制
  controls.maxDistance = 12;
  // 垂直旋转限制
  controls.minPolarAngle = Math.PI / 2;
  controls.maxPolarAngle = Math.PI / 2;
  controls.rotateSpeed = -0.25; // 调整旋转方向相反
  data.controls = controls;

  // 页面缩放监听
  window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    // 更新渲染
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // 更新相机
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
  });

  // 动画
  const tick = () => {
    controls && controls.update();
    TWEEN && TWEEN.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  };
  tick();
};

// 批量创建房间场景
const createRooms = () => {
  const createRoom = (name, position, map) => {
    const geometry = new THREE.SphereGeometry(16, 256, 256);
    const material = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(map),
      side: THREE.DoubleSide
    });
    const room = new THREE.Mesh(geometry, material);
    room.name = name;
    room.position.set(position.x, position.y, position.z);
    room.rotation.y = Math.PI / 2;
    geometry.scale(1, 1, -1);
    data.scene.add(room);
  };
  rooms.forEach(item => {
    createRoom(item.name, item.position, item.map);
  });
};

// 点击切换场景
const handleSwitchButtonClick = async id => {
  const room = rooms.find(item => item.id === id);
  if (data.camera) {
    const x = room.position.x;
    const y = room.position.y;
    const z = room.position.z;
    Animations.animateCamera(data.camera, data.controls, { x, y, z: data.cameraZAxis }, { x, y, z }, 1600, () => {
      console.log(1);
    });
    data.controls.update();
  }
  data.currentRoom = id;
};
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
