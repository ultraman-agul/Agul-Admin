<!--
 * new page
 * @author: agul
 * @since: 2024-05-07
 * index.vue
-->
<template>
  <canvas class="container" ref="threeCollision"></canvas>
</template>

<script setup lang="ts">
import * as CANNON from "cannon-es";
import * as THREE from "three";
import { ref, onMounted } from "vue";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";

const threeCollision = ref<HTMLCanvasElement>();
onMounted(() => {
  // 页面尺寸
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  // 场景
  const scene = new THREE.Scene();
  // 渲染器
  const renderer = new THREE.WebGLRenderer({
    canvas: threeCollision.value,
    alpha: true,
    antialias: true
  });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // 相机
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(-3, 3, 3);

  scene.add(camera);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  // 光照
  // 环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
  scene.add(ambientLight);
  // 直射光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(1024, 1024);
  directionalLight.shadow.camera.far = 15;
  directionalLight.shadow.camera.left = -7;
  directionalLight.shadow.camera.top = 7;
  directionalLight.shadow.camera.right = 7;
  directionalLight.shadow.camera.bottom = -7;
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // 添加声音
  const hitSound = new Audio("/sounds/hit.mp3");
  const playHitSound = collision => {
    const impactStrength = collision.contact.getImpactVelocityAlongNormal();
    if (impactStrength > 1.5) {
      hitSound.volume = Math.random();
      hitSound.currentTime = 0;
      hitSound.play();
    }
  };

  // 创建地面
  const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(10, 10),
    new THREE.MeshStandardMaterial({
      color: 0x00aa31,
      metalness: 0.3,
      roughness: 0.2
    })
  );
  floor.receiveShadow = true;
  floor.rotation.x = -Math.PI * 0.5;
  scene.add(floor);

  // 创建物理世界和设置重力
  const world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);
  // 默认材质
  const defaultMaterial = new CANNON.Material("default");
  const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
    friction: 0.1,
    restitution: 0.7
  });
  world.defaultContactMaterial = defaultContactMaterial;

  // 创建地面刚体
  const floorShape = new CANNON.Plane();
  const floorBody = new CANNON.Body();
  floorBody.mass = 0; //  设置为0，表示这个物体是固定的
  floorBody.addShape(floorShape);
  floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5); // 旋转地面刚体，因为默认创建的平面是水平向右的
  world.addBody(floorBody);

  // 更新对象数组
  const objectsToUpdate: any[] = [];

  // 创建小球
  const sphereGeometry = new THREE.SphereBufferGeometry(1, 24, 24);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.4,
    roughness: 0.4,
    color: 0xfffc00
  });

  const createSphere = (radius, position) => {
    // Three.js 网格
    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    mesh.castShadow = true;
    mesh.scale.set(radius, radius, radius);
    mesh.position.copy(position);
    scene.add(mesh);
    // Cannon.js 刚体
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 3, 0),
      shape: shape,
      material: defaultMaterial
    });
    body.position.copy(position);
    body.addEventListener("collide", playHitSound);
    world.addBody(body);
    // 保存到更新数组
    objectsToUpdate.push({ mesh, body });
  };

  // 创建立方体
  const boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
  const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.4,
    roughness: 0.4,
    color: 0x0091ff
  });
  const createBox = (width, height, depth, position) => {
    const mesh = new THREE.Mesh(boxGeometry, boxMaterial);
    mesh.scale.set(width, height, depth);
    mesh.castShadow = true;
    mesh.position.copy(position);
    scene.add(mesh);
    const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5));
    const body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 3, 0),
      shape: shape,
      material: defaultMaterial
    });
    body.position.copy(position);
    body.addEventListener("collide", playHitSound);
    world.addBody(body);
    objectsToUpdate.push({ mesh, body });
  };

  createBox(1, 1.5, 2, { x: 0, y: 3, z: 0 });

  // 动画
  const clock = new THREE.Clock();
  let oldElapsedTime = 0;

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;
    // 更新物理效果
    world.step(1 / 60, deltaTime, 3);
    for (const object of objectsToUpdate) {
      object.mesh.position.copy(object.body.position);
      object.mesh.quaternion.copy(object.body.quaternion);
      // object.body.applyForce(new CANNON.Vec3(-0.5, 0, 0), object.body.position);
    }
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  };

  tick();

  // dat.gui
  const gui = new dat.GUI();
  const debugObject: any = {};

  debugObject.createSphere = () => {
    createSphere(Math.random() * 0.5, {
      x: (Math.random() - 0.5) * 3,
      y: 3,
      z: (Math.random() - 0.5) * 3
    });
  };
  gui.add(debugObject, "createSphere");

  debugObject.createBox = () => {
    createBox(Math.random(), Math.random(), Math.random(), {
      x: (Math.random() - 0.5) * 3,
      y: 3,
      z: (Math.random() - 0.5) * 3
    });
  };
  gui.add(debugObject, "createBox");

  // 重置
  debugObject.reset = () => {
    for (const object of objectsToUpdate) {
      // 移除刚体
      object.body.removeEventListener("collide", playHitSound);
      world.removeBody(object.body);
      // 移除网格
      scene.remove(object.mesh);
    }
  };
  gui.add(debugObject, "reset");

  // 页面缩放监听
  window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
});
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
