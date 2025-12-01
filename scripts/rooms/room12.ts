// three.js
import * as THREE from 'three';

// physics
import { AmmoPhysics } from '@enable3d/ammo-physics';

import * as Global from '../global';
import * as ThreeUtils from '../threeUtils';

export const Room12Scene = () => {
    // scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(Global.BACKGROUND_COLOR);

    // light
    scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1));
    scene.add(new THREE.AmbientLight(0x666666));

    // physics
    const physics = new AmmoPhysics(scene as any);
    const { factory } = physics;
    const collectibles: Global.collectible[] = [];

    // PLAYER
    const player = ThreeUtils.makePlayer(physics);
    player.position.y = 2;
    player.body.setCollisionFlags(2);

    ThreeUtils.makeRoom(physics);
    let angle = 0;
    const radius = 2;
    const speed = .01;

    // clock
    const clock = new THREE.Clock();

    const initialize = () => {
        Global.setCurrentScene2D(Global.endScene2D);
    }

    const sceneUpdate = () => {
        const deltaTime = clock.getDelta() * 1000;

        // move the player in a circle independent of player input
        angle += deltaTime * speed;
        player.position.x = Math.cos(angle) * radius;
        player.position.z = Math.sin(angle) * radius;
        player.body.needUpdate = true;

        physics.update(deltaTime);
        physics.updateDebugger();
    }
    return { scene, sceneUpdate, initialize, physics, collectibles } as Global.sceneType;
}