// three.js
import * as THREE from 'three';

// physics
import { AmmoPhysics, ExtendedMesh } from '@enable3d/ammo-physics';

import * as Global from '../global';
import * as ThreeUtils from '../threeUtils';
import { switchScheme } from '../controls';
import { ICONS } from '../icons';

export const Room11Scene = () => {
    // scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(Global.BACKGROUND_COLOR);

    // light
    scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1));
    scene.add(new THREE.AmbientLight(0x666666));

    // physics
    const physics = new AmmoPhysics(scene as any);
    const { factory } = physics;
    const collectibles: Global.collectible[] = [
        ThreeUtils.makeCollectible(
            "Ball",
            ICONS.ball.draw(),
            physics.add.sphere({ x: 0, y: 1.2, z: 0, radius: 0.4 }, { lambert: { color: Global.YELLOW } }),
            physics
        )
    ];

    // PLAYER
    let player: ExtendedMesh = ThreeUtils.makePlayer(physics);

    ThreeUtils.makeRoom(physics);
    ThreeUtils.makeDoor(10, 2, 0, 0, physics, "room23");
    // EXIT DOOR
    ThreeUtils.makeDoor(0, 2, -10, 90, physics, "room12", true);

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