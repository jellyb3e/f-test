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
    scene.add(new THREE.HemisphereLight(Global.SKY_LIGHT_COLOR, Global.GROUND_LIGHT_COLOR, 1));
    scene.add(new THREE.AmbientLight(Global.AMBIENT_LIGHT_COLOR));

    const collectibles: Global.collectible[] = [];

    // physics
    const physics = new AmmoPhysics(scene as any);
    const { factory } = physics;

    // PLAYER
    let player: ExtendedMesh = ThreeUtils.makePlayer(physics);

    ThreeUtils.makeRoom(physics);

    // ENGLISH
    ThreeUtils.makeLanguageDoor(-5, 2, -10, 90, physics, "room11", false, factory, "日本語", "japanese");
    // LANGUAGE 2
    ThreeUtils.makeLanguageDoor(0, 2, -10, 90, physics, "room11", false, factory, "English", "english");
    // LANGUAGE 3
    ThreeUtils.makeLanguageDoor(5, 2, -10, 90, physics, "room11", false, factory, "عربي", "arabic");

    // LANGUAGE 3
    ThreeUtils.makeLanguageDoor(0, 2, 10, 90, physics, "room11", false, factory, "ᓚᘏᗢ", "meow", -1);

    // label above the doors
    let label = ThreeUtils.makeLabel3D("Choose VERY wisely.", factory, 0, 7, -8);

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