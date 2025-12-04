import { TextTexture, TextSprite, DrawSprite } from "@enable3d/three-graphics/dist/flat";
import { THREE } from "enable3d";
import { ICONS } from "./icons";
import * as Global from './global';
import { makeTrigger } from "./threeUtils";

// inventory selector (which item is selected)
let selectorIndex: number = 0;
const inventorySelector = drawSlot(selectorIndex, "selector");

export function getSelectorIndex() {
    return selectorIndex;
}

function drawSlot(i: number, slotType: "slot" | "selector" = "slot") {
    const slot = (slotType == "slot") ? ICONS.inventorySlot.draw() : ICONS.inventorySelector.draw();
    const inventoryPos = inventoryIndexToScreenPos(i);
    slot.setPosition(inventoryPos.x, inventoryPos.y);
    Global.gameScene2D.add(slot);

    if (slotType == "slot") {
        const inputLabelTexture = new TextTexture(`${i + 1}`, { fontSize: 24, fillStyle: "black" });
        const inputLabel = new TextSprite(inputLabelTexture);
        inputLabel.setPosition(slot.position.x, slot.position.y + (Global.inventorySlotSize / 2));
        inputLabel.renderOrder = 1;

        Global.gameScene2D.add(inputLabel);
    }
    return slot;
}

// draw inventory to hud (gamescene2d) based on global parameters
export function drawInventory() {
    for (let i = 0; i < Global.inventorySlots; i++) {
        drawSlot(i);
    }
}

function bindTriggerCollision(collectible: Global.collectible) {
    collectible.trigger.body.on.collision(collectible.collisionCallback);
}

export function addToInventory(collectible: Global.collectible) {
    for (let i = 0; i < Global.inventorySlots; i++) {
        if (Global.INVENTORY[i] == null && !collectible.object.userData.collected) {
            setActive3D(collectible, false);
            setActive2D(collectible.icon, true, i);
            setActive2D(collectible.label, true, i, 0, Global.inventorySlotSize / 2)

            Global.INVENTORY[i] = collectible;
            return;
        }
    }
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
        if (selectorItem.name == "Puzzle") {
            Global.goToLastScene();
            Global.setHoldingPuzzle(false);
        } else {
            return; // prevent dropping items into puzzle scene
        }
    }
    setActive3D(selectorItem, true);
    setActive2D(selectorItem.icon, false);
    setActive2D(selectorItem.label, false);
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

export function setActive2D(icon: DrawSprite | TextSprite, active: boolean, i: number = 0, posOffsetX: number = 0, posOffsetY: number = 0) {
    if (active) {
        Global.gameScene2D.add(icon);
        const iconPos = inventoryIndexToScreenPos(i);
        icon.setPosition(iconPos.x - posOffsetX, iconPos.y - posOffsetY);
    } else {
        Global.gameScene2D.remove(icon);
        icon.setPosition(-100, -100);
    }
}