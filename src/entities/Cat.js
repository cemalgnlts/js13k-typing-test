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

        // cat difficulty parameters: as the level increases, it predicts faster and more accurately
        this._predictTimeSec = Math.max(0.5, 1 - this.level * 0.08); // min 0.5 sn
        this._predictChance = Math.min(0.95, 0.5 + this.level * 0.07); // max %95

        const playerWins = roundData.filter(r => r === "player").length;
        const catWins = roundData.filter(r => r === "cat").length;

        // if player wins all last 3 rounds, make it harder
        if (playerWins === 3) {
            this._predictTimeSec = Math.max(0.3, this._predictTimeSec - 0.1);
            this._predictChance = Math.min(1, this._predictChance + 0.1);
        } else if (catWins >= 2) {
            // if cat wins 2 or 3 rounds, make it easy.
            this._predictTimeSec = Math.min(2, this._predictTimeSec + 0.1);
            this._predictChance = Math.max(0.3, this._predictChance - 0.1);
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