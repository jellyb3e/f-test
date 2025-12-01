// STORE ALL 2D INVENTORY ICONS HERE

import * as Global from './global';
import { DrawSprite } from "@enable3d/three-graphics/dist/flat";

export const ICONS = {
    "inventorySlot": {
        draw: () => { return new DrawSprite(Global.inventorySlotSize, Global.inventorySlotSize, drawRectangle(ohexToRGBA(Global.INVENTORY_BORDER_COLOR), ohexToRGBA(Global.INVENTORY_FILL_COLOR, 0.2))); }
    },
    "inventorySelector": {
        draw: () => { return new DrawSprite(Global.inventorySlotSize, Global.inventorySlotSize, drawRectangle(ohexToRGBA(Global.INVENTORY_SELECTOR_COLOR), "")); }
    },
    "puzzle": {
        draw: () => { return new DrawSprite(Global.inventorySlotSize / 2, Global.inventorySlotSize / 2, drawRectangle("", ohexToRGBA(Global.PUZZLE_COLOR))); }
    },
    "ball": {
        draw: () => { return new DrawSprite(Global.inventorySlotSize / 2, Global.inventorySlotSize / 2, drawCircle("", ohexToRGBA(Global.YELLOW))); }
    }
}

// drawing functions

const drawRectangle = (strokeStyle: string, fillStyle: string) => (ctx) => {
    const { width } = ctx.canvas;
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle;
    ctx.fillStyle = fillStyle;
    ctx.lineWidth = 5;
    ctx.rect(0, 0, width, width);
    if (fillStyle) ctx.fill();
    if (strokeStyle) ctx.stroke();
};

const drawCircle = (strokeStyle: string, fillStyle: string) => (ctx) => {
    const { width } = ctx.canvas;
    const radius = width / 2;

    ctx.beginPath();
    ctx.strokeStyle = strokeStyle;
    ctx.fillStyle = fillStyle;
    ctx.lineWidth = 5;

    ctx.arc(radius, radius, radius - ctx.lineWidth, 0, Math.PI * 2);

    if (fillStyle) ctx.fill();
    if (strokeStyle) ctx.stroke();
};

// 0x to rgba color notation
export function ohexToRGBA(ohex: number, alpha: number = 1) {
    const r = (ohex >> 16) & 0xff;
    const g = (ohex >> 8) & 0xff;
    const b = ohex & 0xff;

    return `rgba(${r},${g},${b},${alpha})`;
}