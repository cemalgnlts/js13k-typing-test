// Assets
import svgPlayer from "../assets/player.svg";
import svgCat from "../assets/cat.svg";

import "./sound/ZzFXMicro.min.js";

// Helpers
import { createCanvas, canvas, ctx, loadAsset, windowHasFocus } from "./helper/utils.js";
import { renderTimers, updateTimers } from "./helper/timers.js";
import { initKeyboard } from "./helper/inputs.js";

// Entities
import Player from "./entities/Player.js";
import Cat from "./entities/Cat.js";
import Stage from "./entities/Stage.js";
import Dialog from "./entities/Dialog.js";

const { W, H } = createCanvas();

let lastTime = performance.now();

// entities.
let stage, player, cat, dialog;

window.onload = async function onLoad() {
    const playerImg = await loadAsset(svgPlayer);
    const catImg = await loadAsset(svgCat);

    initKeyboard();

    player = new Player(ctx, playerImg);
    cat = new Cat(ctx, catImg);
    dialog = new Dialog();

    stage = new Stage(ctx, W, H);
    stage.player = player;
    stage.cat = cat;
    stage.dialog = dialog;

    canvas.focus();

    requestAnimationFrame(update);
}

function update(time) {
    const elapsed = time - lastTime;
    let dt = elapsed / 1000
    lastTime = time;

    if (windowHasFocus) {
        onUpdate(dt);
        onRender();
    }

    requestAnimationFrame(update);
}

function onUpdate(dt) {
    updateTimers(dt);
    stage.onUpdate(dt);
}

function onRender() {
    ctx.save();

    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowOffsetX = -4;
    ctx.shadowOffsetY = 4;

    stage.onRender();
    player.onRender();
    cat.onRender();

    if (dialog.isOpen)
        dialog.onRender(ctx, W, H);

    renderTimers(ctx);

    ctx.restore();
}