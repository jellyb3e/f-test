
import * as Global from './global';
import { ICONS } from './icons';
import { delta, getInteract } from './controls';
import { ExtendedMesh, THREE } from 'enable3d'
import { AmmoPhysics } from '@enable3d/ammo-physics';
import { DrawSprite, TextSprite, TextTexture } from '@enable3d/three-graphics/dist/flat';
import Factories from '@enable3d/common/dist/factories';

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

const doorOffset = 1;   // how far from door the player spawns (so scenes don't flicker forever)
// clamp one axis value (x,y,z) of player pos when going through doors
function clampDoorPos(num: number) {
    return (Math.abs(num) >= 10) ? ((num > 0) ? doorOffset - num : -(num + doorOffset)) : num;
}

// door creation function
export function makeDoor(x: number, y: number, z: number, rotation: number, physics: AmmoPhysics, nextRoom: string, locked: boolean = false) {
    const door = physics.add.box({ x: x, y: y, z: z, width: .25, height: 3, depth: 2 }, { lambert: { color: (locked) ? Global.LOCKED_COLOR : Global.DOOR_COLOR } });
    door.body.setCollisionFlags(2);
    door.userData.locked = locked;
    door.rotation.y = rotation * (Math.PI / 180);
    door.body.needUpdate = true;

    door.body.on.collision((other: any) => {
        if (compareTag(other.userData.tag, Global.playerTag)) {
            if (door.userData.locked == true) {
                console.log("locked!");
                return;
            }

            let playerX = clampDoorPos(x);
            let playerY = Global.getPlayerPosition().y;
            let playerZ = clampDoorPos(z);

            Global.setPlayerPosition(playerX, playerY, playerZ);
            Global.setCurrentScene(nextRoom);
        }
    });
}

export function makePlayer(physics: AmmoPhysics) {
    const pos = Global.getPlayerPosition();
    const player = physics.add.capsule({ x: pos.x, y: pos.y, z: pos.z, radius: 0.75, length: 1, mass: 1 }, { lambert: { color: Global.PLAYER_COLOR } });
    player.body.setAngularFactor(0, 0, 0);
    player.userData.tag = Global.playerTag;
    return player;
}

function drawSlot(i: number, slotType: "slot" | "selector" = "slot") {
    const slot = (slotType == "slot") ? ICONS.inventorySlot.draw() : ICONS.inventorySelector.draw();
    const inventoryPos = inventoryIndexToScreenPos(i);
    slot.setPosition(inventoryPos.x, inventoryPos.y);
    Global.scene2d.add(slot);

    if (slotType == "slot") {
        const labelTexture = new TextTexture(`${i + 1}`, { fontSize: 24, fillStyle: "black" });
        const label = new TextSprite(labelTexture);
        label.setPosition(slot.position.x, slot.position.y + (Global.inventorySlotSize / 2));
        label.renderOrder = 1;
        Global.scene2d.add(label);
    }
    return slot;
}

// draw inventory to hud (scene2d) based on global parameters
export function drawInventory() {
    for (let i = 0; i < Global.inventorySlots; i++) {
        drawSlot(i);
    }
}

export function compareTag(tag: string, otherTag: string) {
    return tag == otherTag;
}

function collected(collectible: ExtendedMesh) {
    return collectible.userData.collected;
}

export function createCollectible(
    name: string,
    icon: DrawSprite,
    object: ExtendedMesh,
    physics: AmmoPhysics,
    onCollect: Function = () => { }
) {
    object.userData.tag = Global.collectibleTag;
    object.userData.collected = false;

    const trigger = makeTrigger(physics);

    const collectible: Global.collectible = {
        name,
        icon,
        object,
        trigger,
        triggerUpdate: () => {
            collectible.trigger.position.copy(object.position);
            collectible.trigger.body.needUpdate = true;
        },
        collisionCallback: (other: any) => {
            if (compareTag(other.userData.tag, Global.playerTag) && getInteract() && !collected(object)) {
                addToInventory(collectible);
                onCollect();
            }
        }
    };
    trigger.body.on.collision(collectible.collisionCallback);
    return collectible;
}

export function createKey(x: number, y: number, z: number, physics: AmmoPhysics) {
    const key = createCollectible(
        "Ball",
        ICONS.ball.draw(),
        physics.add.sphere({ x: x, y: y, z: z, radius: 0.4 }, { lambert: { color: Global.YELLOW } }),
        physics,
        () => { Global.setHasKey(true); }
    );
    key.object.userData.tag = Global.keyTag;
    key.object.userData.parent = key;
    return key;
}

function bindTriggerCollision(collectible: Global.collectible) {
    collectible.trigger.body.on.collision(collectible.collisionCallback);
}

function addToInventory(collectible: Global.collectible) {
    for (let i = 0; i < Global.inventorySlots; i++) {
        if (Global.INVENTORY[i] == null && !collectible.object.userData.collected) {
            setActive3D(collectible, false);
            setActive2D(collectible.icon, true, i);

            Global.INVENTORY[i] = collectible;
            return;
        }
    }
}

function makeTrigger(physics: AmmoPhysics) {
    const trigger = physics.add.sphere({ x: 0, y: 0, z: 0, radius: 1, collisionFlags: 6 });
    trigger.visible = false;
    return trigger;
}

export function makePuzzleSolveTrigger(physics: AmmoPhysics) {
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
        if (compareTag(other.userData.tag, Global.keyTag)) {
            const keyCollectible = other.userData.parent;
            setActive3D(keyCollectible, false);
            setActive3D(keyCollectible, true, true, Global.getLastScene());
        }
    });
}

function AddToSceneCollectibles(collectible: Global.collectible, scene: Global.sceneType = Global.getCurrentScene()) {
    scene.collectibles.push(collectible);
}

function removeFromSceneCollectibles(collectible: Global.collectible, scene: Global.sceneType = Global.getCurrentScene()) {
    const collectibles = scene.collectibles;
    const index = collectibles.findIndex(item => item.name === collectible.name);

    if (index !== -1) {
        collectibles.splice(index, 1);
    }
}

function inventoryIndexToScreenPos(i: number) {
    const visualI = Global.inventorySlots - i - 1;
    return { x: window.innerWidth - Global.slotOffset - (Global.inventorySlotSize / 2) - ((Global.inventorySlotSize + Global.slotOffset) * visualI), y: (Global.inventorySlotSize / 2) + Global.slotOffset };
}

// inventory selector (which item is selected)
let selectorIndex: number = 0;
const inventorySelector = drawSlot(selectorIndex, "selector");

export function moveInventorySelector(i: number) {
    // shifts from r->l inventory to l->r
    const inventoryPos = inventoryIndexToScreenPos(i);
    selectorIndex = i;
    inventorySelector.setPosition(inventoryPos.x, inventoryPos.y);
}

export function dropCurrentItem() {
    const selectorItem = Global.INVENTORY[selectorIndex];
    if (!selectorItem) return;

    if (Global.getHoldingPuzzle()) {
        if (selectorItem.name == "puzzle") {
            Global.goToLastScene();
            Global.setHoldingPuzzle(false);
        } else {
            return; // prevent dropping items into puzzle scene
        }
    }
    setActive3D(selectorItem, true);
    setActive2D(selectorItem.icon, false);
    AddToSceneCollectibles(selectorItem);
    Global.INVENTORY[selectorIndex] = null;
}

export function setActive3D(collectible: Global.collectible, value: boolean, playerY: boolean = false, scene: Global.sceneType = Global.getCurrentScene()) {
    const object = collectible.object;

    object.userData.collected = !value;
    if (!value) {
        removeFromSceneCollectibles(collectible, scene);
        scene.scene.remove(object);
        scene.physics.destroy(object);
        scene.scene.remove(collectible.trigger);
        scene.physics.destroy(collectible.trigger);
        return;
    }

    const dropPos = getDropPosition();
    object.position.x = dropPos.x;
    if (playerY) object.position.y = Global.getPlayerPosition().y;
    object.position.z = dropPos.y;

    scene.physics.add.existing(object);
    scene.scene.add(object);

    collectible.trigger = makeTrigger(scene.physics);
    scene.scene.add(collectible.trigger);
    bindTriggerCollision(collectible);
    AddToSceneCollectibles(collectible, scene);

    object.body.needUpdate = true;
}


function getDropPosition(dropDist: number = 2) {
    const playerPosVec3 = Global.getPlayerPosition();
    const playerPosVec2 = new THREE.Vector2(playerPosVec3.x, playerPosVec3.z);
    let dir = new THREE.Vector2(0, 0).sub(playerPosVec2).normalize();
    if (dir.length() == 0) dir.set(1, 0);
    const dropPosVec2 = playerPosVec2.clone().add(dir.multiplyScalar(dropDist));

    return dropPosVec2;
}

function setActive2D(icon: DrawSprite, active: boolean, i: number = 0) {
    if (active) {
        Global.scene2d.add(icon);
        const iconPos = inventoryIndexToScreenPos(i);
        icon.setPosition(iconPos.x, iconPos.y);
    } else {
        Global.scene2d.remove(icon);
        icon.setPosition(-100, -100);
    }
}

export function makePuzzle(x: number, y: number, z: number, physics: AmmoPhysics) {
    const puzzle = physics.add.box({ x: x, y: y, z: z, width: 1.5, depth: 1.5, height: .3 }, { lambert: { color: Global.PUZZLE_COLOR } });
    const collectible = createCollectible("puzzle", ICONS.puzzle.draw(), puzzle, physics, () => {
        Global.setCurrentScene("room22");
        Global.setHoldingPuzzle(true);
    });
    return collectible;
}

export function createHand(x: number, y: number, z: number, hand: "left" | "right", ground: ExtendedMesh, factory: Factories) {
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