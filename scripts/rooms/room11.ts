// three.js
import * as THREE from 'three';

// physics
import { AmmoPhysics, ExtendedMesh } from '@enable3d/ammo-physics';

import * as Global from '../global';
import * as ThreeUtils from '../threeUtils';
import { switchScheme } from '../controls';
import { ICONS } from '../icons';
import { addToInventory } from '../inventoryUtils';

export const Room11Scene = () => {
    // scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(Global.BACKGROUND_COLOR);

    // light
    scene.add(new THREE.HemisphereLight(Global.SKY_LIGHT_COLOR, Global.GROUND_LIGHT_COLOR, 1));
    scene.add(new THREE.AmbientLight(Global.AMBIENT_LIGHT_COLOR));

    // physics
    const physics = new AmmoPhysics(scene as any);
    const { factory } = physics;
    const collectibles: Global.collectible[] = [
        ThreeUtils.makeStomach(3, 1, 3, physics),
        ThreeUtils.makeCouch(-5, 2, -9, physics, factory),
        ThreeUtils.makeTable(-5, 2, -4, physics, factory)
    ];

    // PLAYER
    let player: ExtendedMesh = ThreeUtils.makePlayer(physics);

    ThreeUtils.makeRoom(physics);
    ThreeUtils.makeDoor(10, 2, 0, 0, physics, "room23");
    // EXIT DOOR
    ThreeUtils.makeExitDoor(0, 2, -10, 90, physics, "room12", factory);

    // clock
    const clock = new THREE.Clock();

    const initialize = () => {
        switchScheme("movement");
        Global.setCurrentScene2D(Global.gameScene2D);

        scene.remove(player);
        physics.destroy(player);
        player = ThreeUtils.makePlayer(physics);
    }

    const sceneUpdate = () => {
        ThreeUtils.movePlayer(player);

        physics.update(clock.getDelta() * 1000);
        physics.updateDebugger();
    }
    return { scene, sceneUpdate, initialize, physics, collectibles } as Global.sceneType;
}