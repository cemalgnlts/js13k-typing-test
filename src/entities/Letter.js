import { CHARS, pick, chance, getEmoji, } from "../helper/utils.js";
import Vector from "../helper/Vector.js";

/**
 * @typedef {import("./BaseCharacter.js").Character} Character
 */

export class Letter {
    /** @param {CanvasRenderingContext2D} ctx  */
    ctx;

    width = 0;
    height = 0;
    char = "";

    pos = new Vector();
    perk = this.getRandomPerk();
    isUsed = false;

    /** @type {Set<Character>} */
    _owners = new Set();

    /** @type {null|true|false} */
    isPlayerGuessedCorrect = null;

    /** @param {CanvasRenderingContext2D} context2D  */
    constructor(context2D) {
        this.ctx = context2D;
        this.char = pick(CHARS);

        this.ctx.font = "2rem monospace";
        const measure = this.ctx.measureText(this.char);

        this.width = measure.width;
        this.height = measure.actualBoundingBoxAscent;
    }

    /**
     * @param {Character} owner 
     * @param {boolean} isCorrect 
     */
    addOwner(owner, isCorrect) {
        this._owners.add(owner);

        if (owner.name === "player") this.isPlayerGuessedCorrect = isCorrect;

        // this.pos.y += this.owner.name === "player" ? -10 : 10;
    }

    /** @type {Set<Character>} */
    get owners() {
        return this._owners;
    }

    get score() {
        if (!this.perk || this.isUsed) return 1;

        if (this.perk === "bomb") return -1;
        else if (this.perk === "rocket") return 0;
        else return 1;
    }

    get color() {
        if (this.isPlayerGuessedCorrect === null) return "#444";
        else if (this.isPlayerGuessedCorrect === true) return "#688958";
        else if (this.isPlayerGuessedCorrect === false) return "#E87461";
    }

    /** @returns {"bomb"|"rocket"|"snowflake"|false} */
    getRandomPerk() {
        if (chance(0.25)) return "snowflake";
        else if (chance(0.2)) return "bomb";
        else if (chance(0.1)) return "rocket";

        return false;
    }

    /**
     * @param {DOMRect} box 
     */
    render(box) {
        this.ctx.font = "1rem monospace";
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle =
            this.ctx.fillStyle = this.color;

        this.ctx.fillText(this.char, this.pos.x, this.pos.y);
        this.ctx.strokeRect(box.x, box.y, box.width, box.height);

        if (this._owners.size > 0) {
            const size = 16;
            let y = this.pos.y + size;

            for (const owner of this._owners) {
                this.ctx.drawImage(owner.img, this.pos.x + 2, y, size, size);

                y += size * 1.5;
            }
        }

        if (!this.perk || this.isUsed) return;

        const perkTextX = this.pos.x + this.width * 0.6;
        const perkTextY = this.pos.y - this.height * 0.75;

        if (this.perk === "snowflake") {
            this.ctx.fillStyle = "#EEE";
            this.ctx.lineWidth = 1;
            this.ctx.strokeText(getEmoji(this.perk), perkTextX, perkTextY);
        }

        this.ctx.fillText(getEmoji(this.perk), perkTextX, perkTextY);
    }
}
