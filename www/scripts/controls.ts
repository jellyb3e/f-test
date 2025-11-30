import * as Global from './global';
import { dropCurrentItem, moveInventorySelector } from './threeUtils';

// control setup
export const delta = { x: 0, z: 0, del: 1 };
export const keys: Record<string, boolean> = {};
let interact: boolean = false;

// global getter to see if player is holding interact key
export function getInteract() {
    return interact;
}

export const switchScheme = (scheme: "rotation" | "movement") => {
    for (const key in keys) keys[key] = false;
    delta.x = 0;
    delta.z = 0;
    interact = false;

    if (scheme == "rotation") {
        delta.del = Global.ROTATION_SPEED;
    } else {
        delta.del = 1;
    }
};

const createKeybinding = (
    key: string,
    onKeyDown: () => void,
    onKeyUp: () => void = () => { }
) => {

    window.addEventListener('keydown', (e) => {
        if (e.key === key && !keys[key]) {
            onKeyDown();
            keys[key] = true;
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === key && keys[key]) {
            onKeyUp();
            keys[key] = false;
        }
    });
};

// general-purpose chuddy controls, default del 1 (player movement)
createKeybinding('d', () => delta.x += delta.del, () => delta.x -= delta.del);
createKeybinding('a', () => delta.x -= delta.del, () => delta.x += delta.del);
createKeybinding('w', () => delta.z -= delta.del, () => delta.z += delta.del);
createKeybinding('s', () => delta.z += delta.del, () => delta.z -= delta.del);

// pickup binding
createKeybinding('e', () => { interact = true; }, () => { interact = false; });

// drop binding
createKeybinding('q', () => {
    if (Global.getHoldingPuzzle()) {
        Global.setHoldingPuzzle(false);
        Global.setCurrentScene(Global.getLastScene());
        return;
    }

    dropCurrentItem();
});

// inventory bindings
for (let i = 1; i <= Global.inventorySlots; i++) {
    if (i > 9) break;
    createKeybinding(`${i}`, () => { moveInventorySelector(i-1) });
}