
// three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// physics
import { AmmoPhysics, PhysicsLoader } from '@enable3d/ammo-physics';

// flat
import { TextTexture, TextSprite } from '@enable3d/three-graphics/dist/flat';

import * as Global from './global';

const MainScene = () => {
  // colors
  const YELLOW = 0xffff00;
  const RED = 0xff0000;
  const GREEN = 0x00ff00;
  const BACKGROUND_COLOR = 0xf0f0f0;
  const GROUND_COLOR = 0x704e30;
  const HAND_COLOR = 0xcde01f;

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

  const winTexture = new TextTexture('you win!', { fontWeight: 'bold', fontSize: 48 });
  const loseTexture = new TextTexture('you lsoe!', { fontWeight: 'bold', fontSize: 48 });
  const endSprite = new TextSprite(winTexture);
  endSprite.setScale(scale);
  endSprite.setPosition((window.innerWidth / 2), (window.innerHeight / 2));
  scene2d.add(endSprite);
  endSprite.visible = false;

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
      lambert: { color: GROUND_COLOR },
      mass: 0
    }
  );
  ground.body.setCollisionFlags(2);

  // rolling ball
  const ball = physics.add.sphere({ x: 0, y: 3, z: 0, radius: 1 }, { lambert: { color: YELLOW } });

  // button creation function
  const createButton = (x: number, y: number, z: number, color: THREE.ColorRepresentation, triggerEvent: Function) => {
    let triggered: boolean = false;

    const button = physics.add.box(
      { x: x, y: y, z: z, width: 1, height: 0.3, depth: 1 },
      { lambert: { color: color } }
    );

    button.body.on.collision((other: any) => {
      if (other === ball) {
        if (!triggered)
          triggerEvent();
        triggered = true;
      }
    });
    return button;
  }

  const updateRotation = () => {
    ground.rotation.x = Math.max(-Global.MAX_ROTATION, Math.min(Global.MAX_ROTATION, ground.rotation.x + Global.delta.x));
    ground.rotation.z = Math.max(-Global.MAX_ROTATION, Math.min(Global.MAX_ROTATION, ground.rotation.z + Global.delta.z));
  }

  const createHand = (hand: "left" | "right") => {
    let dir = 1;
    if (hand == "left") { dir = -1; }

    const thumb = factory.add.capsule({ x: 10 * dir, y: .75, z: 1.75, length: 2, radius: 1 }, { lambert: { color: HAND_COLOR } });
    thumb.rotation.x = -Math.PI / 2;
    thumb.rotation.z = dir * Math.PI / 3;

    const pointer = factory.add.capsule({ x: 10.5 * dir, y: 1.5, z: .5, length: 3, radius: 1 }, { lambert: { color: HAND_COLOR } });
    pointer.rotation.x = -Math.PI / 3;
    pointer.rotation.z = dir * Math.PI / 10;

    const middle = factory.add.capsule({ x: 11.25 * dir, y: 0.5, z: .25, length: 3.5, radius: 1 }, { lambert: { color: HAND_COLOR } });
    middle.rotation.x = -Math.PI / 2;

    const pinky = factory.add.capsule({ x: 11.25 * dir, y: -0.5, z: .5, length: 3, radius: 1 }, { lambert: { color: HAND_COLOR } });
    pinky.rotation.x = -2 * Math.PI / 3;

    const arm = factory.add.capsule({ x: 11 * dir, y: 0.5, z: 7, length: 10, radius: 1 }, { lambert: { color: HAND_COLOR } });
    arm.rotation.x = -Math.PI / 2;



    ground.add(thumb, pointer, middle, pinky, arm);
  }
  createHand("right");
  createHand("left");

  // button creation
  const winButton = createButton(-5, 1, 0, GREEN, () => {
    endSprite.visible = true;
  });
  const loseButton = createButton(5, 1, 0, RED, () => {
    endSprite.setTexture(loseTexture);
    endSprite.visible = true;
  });

  // clock
  const clock = new THREE.Clock();

  // loop
  const animate = () => {
    updateRotation();
    ground.body.needUpdate = true;
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
PhysicsLoader('/ammo', () => MainScene());
