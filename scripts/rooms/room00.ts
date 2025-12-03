// three.js
import * as THREE from 'three';

// physics
import { AmmoPhysics, ExtendedMesh } from '@enable3d/ammo-physics';

import * as Global from '../global';
import * as ThreeUtils from '../threeUtils';
import { switchScheme } from '../controls';
import { ICONS } from '../icons';

export const Room00Scene = () => {
    // scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(Global.BACKGROUND_COLOR);

    // light
    scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1));
    scene.add(new THREE.AmbientLight(0x666666));

    const collectibles: Global.collectible[] = [];

    // physics
    const physics = new AmmoPhysics(scene as any);
    const { factory } = physics;

    // PLAYER
    let player: ExtendedMesh = ThreeUtils.makePlayer(physics);

    ThreeUtils.makeRoom(physics);

    // ENGLISH
    ThreeUtils.makeDoor(-5, 2, -10, 90, physics, "room11", false, "English");
    // LANGUAGE 2
    ThreeUtils.makeDoor(0, 2, -10, 90, physics, "room11", false, "Wingdings");
    // LANGUAGE 3
    ThreeUtils.makeDoor(5, 2, -10, 90, physics, "room11", false, "Meow");

    // label above the doors
    ThreeUtils.makeLabel(factory, "Choose VERY wisely.", 0.05, 0, 7, -8);

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