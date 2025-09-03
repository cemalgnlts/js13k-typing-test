import Vector from "../helper/Vector.js";

/**
 * @typedef {(import("./Cat.js").default|import("./Player.js").default)} Character
 */

export default class BaseCharacter {
    /**
     * @type {"player"}
     * @override
     */
    static name = "Character";
    /**
     * @override
     */
    name = "Character";

    /** @type {CanvasRenderingContext2D} */
    ctx;
    /** @type {HTMLImageElement} */
    img;


    width;
    halfWidth;

    pos = new Vector();
    letterIndex = 0;
    isFrozen = false;

    _score = 0;

    /**
     * @param {CanvasRenderingContext2D} context2D
     * @param {HTMLImageElement} img 
     */
    constructor(context2D, img) {
        this.ctx = context2D;
        this.img = img;
        this.width = this.img.width;
        this.halfWidth = this.width / 2;
    }

    set score(num) {
        this._score = num;

        if (this._score < 0) this._score = 0;
    }

    get score() {
        return this._score;
    }

    onRender() {
        this.ctx.drawImage(this.img, this.pos.x, this.pos.y);
    }
}