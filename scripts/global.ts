import { AmmoPhysics } from '@enable3d/ammo-physics';
import { DrawSprite } from '@enable3d/three-graphics/dist/flat';
import { ExtendedMesh } from 'enable3d';
import * as THREE from 'three';

// type declarations
export type collectible = {
    name: string;
    icon: DrawSprite;
    object: ExtendedMesh;
    triggerUpdate: () => void;
}
export type sceneType = {
    scene: THREE.Scene,
    sceneUpdate: () => void,
    initialize: () => void,
    physics: AmmoPhysics,
    collectibles: collectible[]
}

// sizes
export const width = window.innerWidth;
export const height = window.innerHeight;

// HUD SCENE (shared across all scenes)
export const scene2d = new THREE.Scene();

// colors
export const BACKGROUND_COLOR = 0xf0f0f0;
export const WALL_COLOR = 0x4b9963;
export const GROUND_COLOR = 0x215e34;
export const DOOR_COLOR = 0x67a66e;     // unlocked doors
export const PLAYER_COLOR = 0xcde01f;
export const LOCKED_COLOR = 0x4782b3;   // locked doors
export const YELLOW = 0xffff00;
export const GREEN = 0x449944;
export const PUZZLE_COLOR = 0x36291e;
export const PUZZLE_WALL_COLOR = 0x47382a;

export const INVENTORY_BORDER_COLOR = 0x2a2a2a;
export const INVENTORY_FILL_COLOR = 0x000000;
export const INVENTORY_SELECTOR_COLOR = 0x153a1f;

// tags
export const playerTag = "player";
export const collectibleTag = "collectible";

// tunable gameplay values
export const MOVE_SPEED = 3;
export const ROTATION_SPEED = .005;
export const MAX_ROTATION = Math.PI / 15;

// inventory
export const inventorySlotSize = 100;
export const inventorySlots = 3;
export const slotOffset = 10;
export const INVENTORY: (collectible | null)[] = Array(inventorySlots).fill(null);
let holdingPuzzle = false;

// SCENE HANDLING
let currentScene: sceneType;
let lastScene: sceneType;
export const scenes: Record<string, any> = {};

export function getCurrentScene() {
    return currentScene;
}

export function setCurrentScene(newSceneName: string) {
    lastScene = currentScene;
    currentScene = scenes[newSceneName];
    currentScene.initialize();
}

export function goToLastScene() {
    currentScene = lastScene;
}

export function addScenes(scenesToAdd: Record<string, sceneType>) {
    for (const name in scenesToAdd) {
        scenes[name] = scenesToAdd[name];
    }
}

// player position
// this is for scene changes (so you enter a room from the side you entered) and for saving progress!
let playerPosition: THREE.Vector3 = new THREE.Vector3(0, 1, 0);

export function getPlayerPosition() {
    return playerPosition;
}

export function setPlayerPosition(x: number, y: number, z: number) {
    playerPosition.set(x, y, z);
    // TODO: save to localstorage
}

export function getHoldingPuzzle() {
    return holdingPuzzle;
}

export function setHoldingPuzzle(value: boolean) {
    holdingPuzzle = value;
}