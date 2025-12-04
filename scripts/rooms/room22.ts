// three.js
import * as THREE from 'three';

// physics
import { AmmoPhysics } from '@enable3d/ammo-physics';

import * as Global from '../global';
import * as ThreeUtils from '../threeUtils';
import { switchScheme } from '../controls';

export const Room22Scene = () => {
    // scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(Global.BACKGROUND_COLOR);

    // light
    scene.add(new THREE.HemisphereLight(Global.SKY_LIGHT_COLOR, Global.GROUND_LIGHT_COLOR, 1));
    scene.add(new THREE.AmbientLight(Global.AMBIENT_LIGHT_COLOR));

    // physics
    const physics = new AmmoPhysics(scene as any);
    const { factory } = physics;

    ThreeUtils.makeRoom(physics, 5, 0, -1.5, 0);
    const puzzleUpdate = ThreeUtils.makePuzzle(physics, factory);

    const collectibles: Global.collectible[] = [
        ThreeUtils.makeKey(0, 1.2, 0, physics)    // yellow ball
    ];

    // clock
    const clock = new THREE.Clock();

    const initialize = () => {
        switchScheme("rotation");
        Global.setCurrentScene2D(Global.gameScene2D);
    }

    const sceneUpdate = () => {
        const deltaTime = clock.getDelta() * 1000;
        puzzleUpdate();
        physics.update(deltaTime);
        physics.updateDebugger();
    }
    return { scene, sceneUpdate, initialize, physics, collectibles };
}