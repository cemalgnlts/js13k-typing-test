export const CHARS = Array.from({ length: 25 }, (_, i) => String.fromCharCode(65 + i));

/** @type {HTMLCanvasElement} */
export let canvas;
/** @type {CanvasRenderingContext2D} */
export let ctx;
export let windowHasFocus = true;

/**
 * @returns {{canvas: HTMLCanvasElement,ctx: CanvasRenderingContext2D, W: number, H: number}}
 */
export function createCanvas() {
    /** @type {HTMLCanvasElement} */
    canvas = document.getElementsByTagName("canvas")[0];
    ctx = canvas.getContext("2d", { alpha: false });

    resizeCanvas(ctx);

    const W = canvas.dataset.initWidth;
    const H = canvas.dataset.initHeight;

    window.addEventListener("blur", () => windowHasFocus = false);
    window.addEventListener("focus", () => windowHasFocus = true);
    window.addEventListener("resize", () => resizeCanvas());

    return { W, H };
}

function resizeCanvas() {
    const dpr = window.devicePixelRatio;

    const W = canvas.dataset.initWidth;
    const H = canvas.dataset.initHeight;

    canvas.width = W * dpr;
    canvas.height = H * dpr;

    ctx.scale(dpr, dpr);

    canvas.style.width = W + "px";
    canvas.style.height = H + "px"

    const scaleX = window.innerWidth / W;
    const scaleY = window.innerHeight / H;
    const scaleToFit = Math.min(scaleX, scaleY);

    canvas.style.transform = `scale(${scaleToFit})`;

    canvas.dataset.scale = scaleToFit;
}

/**
 * 
 * @param {bomb|rocket|snowflake} name 
 */
export function getEmoji(name) {
    switch (name) {
        case "bomb": return "\uD83D\uDCA3";
        case "rocket": return "\uD83D\uDE80";
        case "snowflake": return "\u2744";
    }
}

export function lerp(from, to, t) {
    return (1 - t) * from + t * to;
}

export function pick(arr) {
    const idx = Math.floor(Math.random() * arr.length);
    return arr[idx];
}

export function chance(val) {
    return Math.random() < val;
}

/**
 * Converts SVG code to HTMLImage element.
 * @param {string} svg 
 * @returns {Promise<HTMLImageElement>}
 */
export function loadAsset(svg) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = "data:image/svg+xml;charset=utf-8;base64," + btoa(svg);
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
}