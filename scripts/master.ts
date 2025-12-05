// three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// physics
import { PhysicsLoader } from '@enable3d/ammo-physics';

import * as Global from './global';
import * as ThreeUtils from './threeUtils';
import { Room00Scene } from './rooms/room00';
import { Room11Scene } from './rooms/room11';
import { Room12Scene } from './rooms/room12';
import { Room22Scene } from './rooms/room22';
import { Room23Scene } from './rooms/room23';
import { drawInventory } from './inventoryUtils';

const MasterScene = () => {
    // camera
    const camera = new THREE.PerspectiveCamera(50, Global.width / Global.height, 0.1, 1000);
    camera.position.set(0, 15, 20);
    camera.lookAt(0, 0, 0);

    // HUD
    const camera2d = new THREE.OrthographicCamera(0, Global.width, Global.height, 0, 1, 1000);
    camera2d.position.setZ(10);
    drawInventory();

    // renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(Global.width, Global.height);
    renderer.autoClear = false;
    document.body.appendChild(renderer.domElement);

    // dpr
    const DPR = window.devicePixelRatio;
    renderer.setPixelRatio(Math.min(2, DPR));

    // orbit controls
    new OrbitControls(camera, renderer.domElement);

    // loop
    const animate = () => {
        Global.getCurrentScene().sceneUpdate();
        for (let collectible of Global.getCurrentScene().collectibles) {
            collectible.triggerUpdate();
        }

        // you have to clear and call render twice because there are 2 scenes
        // one 3d scene and one 2d scene
        renderer.clear();
        renderer.render(Global.getCurrentScene().scene, camera);
        renderer.clearDepth();
        renderer.render(Global.getCurrentScene2D(), camera2d);

        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

PhysicsLoader('ammo', () => {
    Global.addScenes({
        'room00': Room00Scene(),
        'room11': Room11Scene(),
        'room12': Room12Scene(),
        'room22': Room22Scene(),
        'room23': Room23Scene()
    });

    Global.setCurrentScene("room00");
    MasterScene();
});