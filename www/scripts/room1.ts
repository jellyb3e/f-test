// three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// physics
import { AmmoPhysics, PhysicsLoader } from '@enable3d/ammo-physics';

// flat
import { TextTexture, TextSprite } from '@enable3d/three-graphics/dist/flat';

const Room1Scene = () => {
  // colors
  const YELLOW = 0xffff00;
  const RED = 0xff0000;
  const GREEN = 0x00ff00;
  const BACKGROUND_COLOR = 0xf0f0f0;
  const GROUND_COLOR = 0x704e30;
  const HAND_COLOR = 0xcde01f;

  // tunable gameplay values
  const MOVE_SPEED = 3;

  // control setup
  const keys: Record<string, boolean> = {};
  const createKeybinding = (
    key: string,
    onKeyDown: () => void,
    onKeyUp: () => void = () => { }
  ) => {

    window.addEventListener('keydown', (e) => {
      if (e.key === key && !keys[key]) {
        onKeyDown();
        keys[key] = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === key) {
        onKeyUp();
        keys[key] = false;
      }
    });
  };

  // sizes
  const width = window.innerWidth;
  const height = window.innerHeight;

  // scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BACKGROUND_COLOR);

  // camera
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.set(0, 15, 20);
  camera.lookAt(0, 0, 0);

  // 2d camera/2d scene
  const scene2d = new THREE.Scene();
  const camera2d = new THREE.OrthographicCamera(0, width, height, 0, 1, 1000);
  camera2d.position.setZ(10);

  // renderer
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  renderer.autoClear = false;
  document.body.appendChild(renderer.domElement);

  // add 2d text
  const text = new TextTexture('welcome to chudville, population: you', { fontWeight: 'bold', fontSize: 48 });
  const sprite = new TextSprite(text);
  const scale = 0.5;
  sprite.setScale(scale);
  sprite.setPosition(0 + (text.width * scale) / 2 + 12, height - (text.height * scale) / 2 - 12);
  scene2d.add(sprite);

  // dpr
  const DPR = window.devicePixelRatio;
  renderer.setPixelRatio(Math.min(2, DPR));

  // orbit controls
  new OrbitControls(camera, renderer.domElement);

  // light
  scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1));
  scene.add(new THREE.AmbientLight(0x666666));
  const light = new THREE.DirectionalLight(0xdfebff, 1);
  light.position.set(50, 200, 100);
  light.position.multiplyScalar(1.3);

  // physics
  const physics = new AmmoPhysics(scene as any);
  //physics.debug?.enable();

  // extract the object factory from physics
  // the factory will make/add object without physics
  const { factory } = physics;

  // static ground
  const ground = physics.add.box(
    {
      x: 0,
      y: 0,
      z: 0,
      width: 20,
      height: 1,
      depth: 20
    },
    {
      lambert: { color: GROUND_COLOR }
    }
  );
  ground.body.setCollisionFlags(2);

  // PLAYER
  const player = physics.add.box({x:0,y:1,z:0,width:1,height:1,depth:1,mass:1},{lambert:{color:HAND_COLOR}});
  

  // key creation
  let delta = { x: 0, z: 0 };
  createKeybinding('d', () => delta.x += 1, () => delta.x -= 1);
  createKeybinding('a', () => delta.x -= 1, () => delta.x += 1);
  createKeybinding('w', () => delta.z -= 1, () => delta.z += 1);
  createKeybinding('s', () => delta.z += 1, () => delta.z -= 1);

  const movePlayer = () => {
    if (delta.x == 0 && delta.z == 0) {
        player.body.setVelocity(0,0,0);
        return;
    }

    const hypot = Math.hypot(delta.x, delta.z);
    const delXNormalized = (delta.x / hypot) * MOVE_SPEED;
    const delZNormalized = (delta.z / hypot) * MOVE_SPEED;

    player.body.setVelocity(delXNormalized,0,delZNormalized);
  }

  // clock
  const clock = new THREE.Clock();

  // loop
  const animate = () => {
    movePlayer();
    physics.update(clock.getDelta() * 1000);
    physics.updateDebugger();

    // you have to clear and call render twice because there are 2 scenes
    // one 3d scene and one 2d scene
    renderer.clear();
    renderer.render(scene, camera);
    renderer.clearDepth();
    renderer.render(scene2d, camera2d);

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

// '/ammo' is the folder where all ammo file are
PhysicsLoader('/ammo', () => Room1Scene());