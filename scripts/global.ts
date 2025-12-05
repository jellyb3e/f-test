import { AmmoPhysics } from '@enable3d/ammo-physics';
import { DrawSprite, TextSprite } from '@enable3d/three-graphics/dist/flat';
import { ExtendedMesh } from 'enable3d';
import * as THREE from 'three';
import * as Utils from './utils';

// type declarations
export type collectible = {
    name: string;
    icon: DrawSprite;
    label: TextSprite;
    object: ExtendedMesh;
    quantityLabel: TextSprite;
    trigger: ExtendedMesh;
    quantity: number;
    stackSize: number;
    nutrition: number;
    triggerRadius: number,
    triggerUpdate: () => void;
    collisionCallback: (other: any) => void;
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

// HUD SCENE (shared across all rooms)
let currentScene2D: THREE.Scene = new THREE.Scene();
export const gameScene2D = new THREE.Scene();
export const endScene2D = new THREE.Scene();

// colors
export const BACKGROUND_COLOR = Utils.getSystemBackgroundColor();
export const TEXT_COLOR = Utils.getSystemTextColor();
export const WALL_COLOR = 0x4b9963;
export const GROUND_COLOR = 0x215e34;
export const DOOR_COLOR = 0x67a66e;     // unlocked doors
export const PLAYER_COLOR = 0xcde01f;
export const LOCKED_COLOR = 0x4782b3;   // locked doors
export const YELLOW = 0xffff00;
export const GREEN = 0x449944;
export const PUZZLE_COLOR = 0x36291e;
export const PUZZLE_WALL_COLOR = 0x47382a;
export const STOMACH_COLOR = 0xba759d;

export const INVENTORY_BORDER_COLOR = 0x2a2a2a;
export const INVENTORY_FILL_COLOR = 0x000000;
export const INVENTORY_SELECTOR_COLOR = YELLOW;

export const SKY_LIGHT_COLOR = Utils.getSystemSkyColor();
export const GROUND_LIGHT_COLOR = Utils.getSystemGroundColor();
export const AMBIENT_LIGHT_COLOR = Utils.getSystemAmbientColor();

// materials
export const unlockedDoorMat = new THREE.MeshLambertMaterial({ color: DOOR_COLOR });
export const lockedDoorMat = new THREE.MeshLambertMaterial({ color: LOCKED_COLOR });

// tags
export const playerTag = "player";
export const collectibleTag = "collectible";
export const keyTag = "key";
export const stomachTag = "stomach";
export const puzzleTag = "puzzle";

// tunable gameplay values
export const MOVE_SPEED = 3;
export const ROTATION_SPEED = .005;
export const MAX_ROTATION = Math.PI / 15;

// inventory
export const inventorySlotSize = 100;
export const inventorySlots = 3;
export const slotOffset = 10;
export const INVENTORY: (collectible | null)[] = Array(inventorySlots).fill(null);
let holdingPuzzle: boolean = false;
let hasKey: boolean = false;
let full: boolean = false;

// SCENE HANDLING
let currentScene: sceneType;
let lastScene: sceneType;
export const scenes: Record<string, any> = {};

export function getCurrentScene() {
    return currentScene;
}

export function getCurrentScene2D() {
    return currentScene2D;
}

export function setCurrentScene2D(newScene: THREE.Scene) {
    currentScene2D = newScene;
}

export function setCurrentScene(newSceneName: string) {
    lastScene = currentScene;
    currentScene = scenes[newSceneName];
    currentScene.initialize();
}

export function getLastScene() {
    return lastScene;
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

export function getHasKey() {
    return hasKey;
}

export function setHasKey(value: boolean) {
    hasKey = value;
}

export function getFull() {
    return full;
}

export function setFull(value: boolean) {
    full = value;
    console.log(full);
}