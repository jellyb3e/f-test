
import * as Global from './global';
import * as Inventory from './inventoryUtils';
import * as Utils from "./utils";
import { ICONS } from './icons';
import { delta, getInteract, getUse } from './controls';
import { ExtendedMesh, FLAT } from 'enable3d'
import { AmmoPhysics } from '@enable3d/ammo-physics';
import { DrawSprite, TextSprite, TextTexture } from '@enable3d/three-graphics/dist/flat';
import Factories from '@enable3d/common/dist/factories';
import { mazeMap } from './mazeconfig';

// functions
export function movePlayer(player: ExtendedMesh) {
    Global.setPlayerPosition(player.position.x, player.position.y, player.position.z);

    if (delta.x == 0 && delta.z == 0) {
        player.body.setVelocity(0, 0, 0);
        return;
    }

    const hypot = Math.hypot(delta.x, delta.z);
    const delXNormalized = (delta.x / hypot) * Global.MOVE_SPEED;
    const delZNormalized = (delta.z / hypot) * Global.MOVE_SPEED;

    player.body.setVelocity(delXNormalized, 0, delZNormalized);
}

export function makeRoom(physics: AmmoPhysics, scale: number = 1, x: number = 0, y: number = 0, z: number = 0) {
    // floor
    physics.add.box({ x: x * scale, y: y * scale, z: z * scale, width: 20 * scale, height: 1 * scale, depth: 20 * scale, mass: 0 }, { lambert: { color: Global.GROUND_COLOR } }).body.setCollisionFlags(2);
    // walls
    physics.add.box({ x: (x + 10.5) * scale, y: (y + 2) * scale, z: z * scale, width: 1 * scale, height: 5 * scale, depth: 22 * scale, mass: 0 }, { lambert: { color: Global.WALL_COLOR } }).body.setCollisionFlags(2);
    physics.add.box({ x: (x - 10.5) * scale, y: (y + 2) * scale, z: z * scale, width: 1 * scale, height: 5 * scale, depth: 22 * scale, mass: 0 }, { lambert: { color: Global.WALL_COLOR } }).body.setCollisionFlags(2);
    physics.add.box({ x: x * scale, y: (y + 2) * scale, z: (z + 10.5) * scale, width: 20 * scale, height: 5 * scale, depth: 1 * scale, mass: 0 }, { lambert: { color: Global.WALL_COLOR } }).body.setCollisionFlags(2);
    physics.add.box({ x: x * scale, y: (y + 2) * scale, z: (z - 10.5) * scale, width: 20 * scale, height: 5 * scale, depth: 1 * scale, mass: 0 }, { lambert: { color: Global.WALL_COLOR } }).body.setCollisionFlags(2);
}

// clamp one axis value (x,y,z) of player pos when going through doors
function clampDoorPos(num: number) {
    const doorOffset = 1;   // how far from door the player spawns (so scenes don't flicker forever)
    return (Math.abs(num) >= 10) ? ((num > 0) ? doorOffset - num : -(num + doorOffset)) : num;
}

// door creation function
export function makeDoor(
    x: number,
    y: number,
    z: number,
    rotation: number,
    physics: AmmoPhysics,
    nextRoom: string,
    locked: boolean = false,
    factory?: Factories,
    label: string = "",
    newLanguage: string = "") {

    const door = physics.add.box({ x: x, y: y, z: z, width: .25, height: 3, depth: 2 });
    setDoorLock(door, locked);
    door.body.setCollisionFlags(2);
    door.rotation.y = rotation * (Math.PI / 180);
    door.body.needUpdate = true;

    if (label != "" && factory) makeLabel(factory, label, 0.02, x, y + 1, z + 1);

    door.body.on.collision((other: any) => {
        if (compareTag(other, Global.playerTag)) {
            if (door.userData.locked == true) {
                tryUnlockDoor(door);
                return;
            }

            if (newLanguage != "") Utils.setSelectedLanuage(newLanguage);

            let playerX = clampDoorPos(x);
            let playerY = Global.getPlayerPosition().y;
            let playerZ = clampDoorPos(z);

            Global.setPlayerPosition(playerX, playerY, playerZ);
            Global.setCurrentScene(nextRoom);
        }
    });
}

function setDoorLock(door: ExtendedMesh, value: boolean) {
    door.material = (value) ? Global.lockedDoorMat : Global.unlockedDoorMat;
    setTimeout(() => { door.userData.locked = value }, 500);
}

function tryUnlockDoor(door: ExtendedMesh) {
    const selectorItem = Global.INVENTORY[Inventory.getSelectorIndex()];
    if (!selectorItem) return;

    if (compareTag(selectorItem.object, Global.keyTag) && getUse()) {
        setDoorLock(door, false);
        Inventory.setActive2D(selectorItem.icon, false);
        Global.INVENTORY[Inventory.getSelectorIndex()] = null;
    }
}

export function makePlayer(physics: AmmoPhysics) {
    const pos = Global.getPlayerPosition();
    const player = physics.add.capsule({ x: pos.x, y: pos.y, z: pos.z, radius: 0.75, length: 1, mass: 1 }, { lambert: { color: Global.PLAYER_COLOR } });
    player.body.setAngularFactor(0, 0, 0);
    player.userData.tag = Global.playerTag;
    return player;
}

export function compareTag(object: ExtendedMesh, otherTag: string) {
    return object.userData.tag == otherTag;
}

function collected(collectible: ExtendedMesh) {
    return collectible.userData.collected;
}

export function makeCollectible(
    name: string,
    icon: DrawSprite,
    object: ExtendedMesh,
    quantity: number,
    stackSize: number,
    physics: AmmoPhysics,
    onCollect: Function = () => { }
) {
    object.userData.tag = Global.collectibleTag;
    object.userData.collected = false;

    const translatedName = Utils.getTranslatedText(name);
    const labelTexture = new TextTexture(translatedName, { fontSize: 24, fillStyle: "black" });
    const label = new TextSprite(labelTexture);
    label.renderOrder = 1;

    const trigger = makeTrigger(physics);

    const collectible: Global.collectible = {
        name,
        icon,
        label,
        object,
        trigger,
        quantity,
        stackSize,
        triggerUpdate: () => {
            if (!collectible.trigger || !collectible.trigger.body) return;
            collectible.trigger.position.copy(object.position);
            collectible.trigger.body.needUpdate = true;
        },
        collisionCallback: (other: any) => {
            if (compareTag(other, Global.playerTag) && !collected(object)) {
                if (getInteract()) {
                    Inventory.addToInventory(collectible);
                    onCollect();
                } else if (getUse()) {
                    console.log("im very hungry");
                    tryConsume(collectible);
                }
            }
        }
    };
    trigger.body.on.collision(collectible.collisionCallback);
    return collectible;
}

export function makeKey(x: number, y: number, z: number, physics: AmmoPhysics) {
    const key = makeCollectible(
        "Key",
        ICONS.ball.draw(),
        physics.add.sphere({ x: x, y: y, z: z, radius: 0.4 }, { lambert: { color: Global.YELLOW } }),
        1,
        1,
        physics,
        () => { Global.setHasKey(true); }
    );
    key.object.userData.tag = Global.keyTag;
    key.object.userData.parent = key;
    return key;
}

export function makeTrigger(physics: AmmoPhysics) {
    const trigger = physics.add.sphere({ x: 0, y: 0, z: 0, radius: 1, collisionFlags: 6 });
    trigger.visible = false;
    return trigger;
}

function makePuzzleSolveTrigger(physics: AmmoPhysics) {
    const floorTrigger = physics.add.box(
        {
            x: 0,
            y: -5,
            z: 0,
            width: 100,
            height: 1,
            depth: 100,
            collisionFlags: 6
        }
    );
    floorTrigger.visible = false;
    floorTrigger.body.on.collision((other: any) => {
        if (compareTag(other, Global.keyTag)) {
            const keyCollectible = other.userData.parent;
            Inventory.setActive3D(keyCollectible, false);
            Inventory.setActive3D(keyCollectible, true, true, Global.getLastScene());
        }
    });
}

export function makePuzzle(physics: AmmoPhysics, factory: Factories) {
    const ground = physics.add.box({ x: 0, y: 0, z: 0, width: 20, height: 1, depth: 20, collisionFlags: 2 }, { lambert: { color: Global.PUZZLE_COLOR } });
    const ceiling = physics.add.box({ x: 0, y: 2.25, z: 0, width: 20, height: 1, depth: 20, collisionFlags: 2 });
    ceiling.visible = false;
    ground.add(ceiling);

    const maze: ExtendedMesh[] = [];
    for (let i: number = 0; i < 16; i++) {
        for (let j: number = 0; j < 16; j++) {
            if (mazeMap[j * 16 + i] == 1) {
                const newCell = physics.add.box(
                    {
                        x: i * 1.25 - 9.375,
                        y: 1,
                        z: j * 1.25 - 9.375,
                        width: 1.25,
                        height: 1,
                        depth: 1.25,
                        collisionFlags: 2
                    },
                    {
                        lambert: { color: Global.PUZZLE_WALL_COLOR },
                        mass: 1
                    }
                );
                maze.push(newCell);
                ground.add(newCell);
            }
        }
    }

    makeHand(9.75, 2, 5, "right", ground, factory);
    makeHand(-9.75, 2, 5, "left", ground, factory);
    makePuzzleSolveTrigger(physics);

    const updateRotation = () => {
        // rotate maze and arms
        ground.rotation.x = Math.max(-Global.MAX_ROTATION, Math.min(Global.MAX_ROTATION, ground.rotation.x + delta.z));
        ground.rotation.z = Math.max(-Global.MAX_ROTATION, Math.min(Global.MAX_ROTATION, ground.rotation.z - delta.x));

        ground.body.needUpdate = true;
        ceiling.body.needUpdate = true;
        maze.forEach((cell: ExtendedMesh) => {
            cell.body.needUpdate = true;
        });
    }

    return updateRotation;
}

export function makePuzzleCollectible(x: number, y: number, z: number, physics: AmmoPhysics) {
    const puzzle = physics.add.box({ x: x, y: y, z: z, width: 1.5, depth: 1.5, height: .3 }, { lambert: { color: Global.PUZZLE_COLOR } });
    const collectible = makeCollectible("Puzzle", ICONS.puzzle.draw(), puzzle, 1, 1, physics, () => {
        Global.setCurrentScene("room22");
        Global.setHoldingPuzzle(true);
    });
    return collectible;
}

export function makeHand(x: number, y: number, z: number, hand: "left" | "right", ground: ExtendedMesh, factory: Factories) {
    const dir = hand === "left" ? -1 : 1;

    const segments = [
        { name: "thumb", offsetX: 0, offsetY: 0.25, offsetZ: 1.5, length: 2, rotationX: -Math.PI / 2, rotationZ: Math.PI / 3 * dir },
        { name: "pointer", offsetX: 0.5, offsetY: 0.5, offsetZ: 0.25, length: 3, rotationX: -Math.PI / 3, rotationZ: Math.PI / 10 * dir },
        { name: "middle", offsetX: 1.25, offsetY: 0, offsetZ: 0, length: 3.5, rotationX: -Math.PI / 2, rotationZ: 0 },
        { name: "pinky", offsetX: 1.25, offsetY: -1, offsetZ: 0.25, length: 3, rotationX: -2 * Math.PI / 3, rotationZ: 0 },
        { name: "arm", offsetX: 1, offsetY: 0, offsetZ: 6.75, length: 10, rotationX: -Math.PI / 2, rotationZ: 0 },
    ];

    for (const segment of segments) {
        const capsule = factory.add.capsule({
            x: x + segment.offsetX * dir,
            y: y + segment.offsetY,
            z: z + segment.offsetZ,
            length: segment.length,
            radius: 1
        }, { lambert: { color: Global.PLAYER_COLOR } });

        capsule.rotation.x = segment.rotationX;
        capsule.rotation.z = segment.rotationZ;

        ground.add(capsule);
    }
}

export function makeLabel(
    factory: Factories,
    label: string,
    scale: number = 0.05,
    x: number = 0,
    y: number = 0,
    z: number = 0) {

    const labelTexture = new TextTexture(label);
    const spriteTexture = new TextSprite(labelTexture);
    spriteTexture.setScale(scale);
    spriteTexture.position.set(x, y, z);
    factory.add.existing(spriteTexture);

}

export function drawEndScene() {
    // add 2d text
    const labelTexture = new TextTexture('room 12.', { fontSize: 48, fillStyle: "black" });
    const label = new TextSprite(labelTexture);

    label.setPosition(Global.width / 2, Global.height / 2);
    Global.endScene2D.add(label);
}

export function makeStomach(x: number, y: number, z: number, physics: AmmoPhysics) {
    const stomach = physics.add.capsule({ x: x, y: y, z: z, radius: .3, length: .5 }, { lambert: { color: Global.STOMACH_COLOR } });
    const stomachCollectible = makeCollectible(
        "Stomach",
        ICONS.stomach.draw(),
        stomach,
        0,
        3,
        physics
    );
    stomachCollectible.object.userData.tag = Global.stomachTag;


    return stomachCollectible;
}

function tryConsume(foodItem: Global.collectible) {
    const selectorItem = Global.INVENTORY[Inventory.getSelectorIndex()];
    if (!selectorItem) return;

    if (compareTag(selectorItem.object, Global.stomachTag) && getUse()) {
        Inventory.setActive3D(foodItem, false);
    }
}