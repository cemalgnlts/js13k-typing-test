import BaseCharacter from "./BaseCharacter.js";

import { Timer } from "../helper/timers.js";
import { chance } from "../helper/utils.js";

export default class Cat extends BaseCharacter {
    /** @type {"cat"} */
    static name = "cat"
    name = Cat.name;

    predictTimer = Timer();
    level = 0;

    _predictTimeSec = 1;
    _predictChance = 0.5;
    _lastPredictResult = false;

    /**
     * @param {CanvasRenderingContext2D} context2D
     * @param {HTMLImageElement} img 
     */
    constructor(context2D, img) {
        super(context2D, img);

        this.levelUp([]);
    }

    canPredict() {
        if (!this.predictTimer.isTimeout) return false;

        this.predictTimer.start(this._predictTimeSec);

        return true;
    }

    predict() {
        return chance(this._predictChance) ? true : false;
    }

    onRoundStart() {
        this.predictTimer.start(this._predictTimeSec);
    }

    /** @param {Array<"player"|"cat">} roundData  */
    levelUp(roundData) {
        this.level++;

        let isCatWinTwice = false;
        const catIdx = roundData.indexOf("cat");
        isCatWinTwice = roundData.indexOf("cat", catIdx + 1) !== -1;

        if (isCatWinTwice) { // cat win 2 times.
            this._predictTimeSec += 0.1;
            this._predictChance -= 0.1;
        } else if (catIdx === -1) { // player win 3 times.
            this._predictTimeSec -= 0.15;
            this._predictChance += 0.15;
        }
    }

    onRender() {
        super.onRender();

        if (!this.predictTimer.isActive) return;

        this.ctx.strokeStyle = "#444";
        this.ctx.lineWidth = 1.3;

        const endAngle = (this._predictTimeSec - this.predictTimer.time / this._predictTimeSec) * (Math.PI * 2);

        this.ctx.beginPath();
        this.ctx.arc(this.pos.x + this.halfWidth, this.pos.y + 3, 5, 0, endAngle);
        this.ctx.stroke();
    }
}