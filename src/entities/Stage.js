import LetterSequence from "./LetterSequence.js";

import { getPressedKey, isKeyDown } from "../helper/inputs.js";
import { Chronometer, delay, loop, Timer } from "../helper/timers.js";
import { Letter } from "./Letter.js";
import { getEmoji, pick } from "../helper/utils.js";
import { playSound } from "../sound/soundPlayer.js";
import { getStoreItem } from "../helper/store.js";

/**
 * @typedef {import("./BaseCharacter.js").Character} Character
 */

export default class Stage {
    /** @type {CanvasRenderingContext2D} */
    ctx;
    W;
    H;

    BLOCK_WIDTH = 0.2;
    BLOCK_HEIGHT = 0.4;
    MAX_ROUND_SIZE = 3;
    ROUND_COMPLETE_BREAK_SEC = 3;

    letterSequence;

    /** @type {import("./Player.js").default} */
    player;
    /** @type {import("./Cat.js").default} */
    cat;
    /** @type {import("./Dialog.js").default} */
    dialog;

    roundCompletedTimer = Timer();
    roundTime = Chronometer();
    /** @type {Character["name"]} */
    roundData = [];
    levelTime = Chronometer();

    /** @type {Character|null} */
    roundWinner = null;
    round = 0;

    /** @type {Array<Letter>} */
    timeoutWarLetters = [];

    /**
     * @param {CanvasRenderingContext2D} context2D
     * @param {number} width 
     * @param {number} height 
     */
    constructor(context2D, width, height) {
        this.ctx = context2D;

        this.W = width;
        this.H = height;

        this.letterSequence = new LetterSequence(this.ctx, this.W * 0.5, this.H * 0.25);

        // We delay a bit so that the cat and player entites are added.
        requestAnimationFrame(() => this.updateScore());
    }

    /**
     * There is no level to the game
     * The main level is the cat getting stronger and leveling up as it loses.
     * The level we follow is how many levels the cat is on.
     */
    get level() {
        return this.cat.level;
    }

    get levelLetterSize() {
        return Math.max(2, Math.min(this.level + 1, 10));
    }

    get isRoundCompleted() {
        return !this.isLetterRemain(this.player) && !this.isLetterRemain(this.cat);
    }

    /** @param {number} dt delta */
    onUpdate(dt) {
        if (this.dialog.isOpen) return;

        if (this.isRoundCompleted) {
            this.clearStage(dt);
        } else {
            this.checkLetterPredicted();
        }

        if (this.timeoutWarLetters.length > 0) this.manageRocketAttack(dt);

        if (this.roundCompletedTimer.isActive) {
            if (this.roundCompletedTimer.time > 2 || this.timeoutWarLetters.length > 0) return;
            else if (this.roundCompletedTimer.time < 1) {
                if (this.timeoutWarLetters.length > 0) this.timeoutWarLetters = [];

                return;
            }

            this.addRocket();
        }
    }

    addRocket() {
        const letter = new Letter(this.ctx);
        letter.perk = pick(["rocket", "snowflake", "bomb"]);
        letter.pos.set(this.cat.pos.x, this.cat.pos.y + 32);

        this.timeoutWarLetters.push(letter);
    }

    manageRocketAttack(dt) {
        for (const letter of this.timeoutWarLetters) {
            if (letter.isUsed) continue;

            const dist = letter.pos.dist(this.player.pos);

            if (dist < this.player.width) {
                this.pickLetter(this.cat, letter, true);
                letter.isUsed = true;
            }

            if (isKeyDown()) {
                this.pickLetter(this.player, letter, getPressedKey() === letter.char);
            }

            letter.pos.lerp(this.player.pos, 1 * dt);
        }
    }

    checkLetterPredicted() {
        const letters = this.letterSequence.letters;
        let letter = null;
        let isCorrect = false;
        let character = null;

        if (this.isLetterRemain(this.player) && isKeyDown() && !this.player.isFrozen) {
            character = this.player;
            letter = letters[character.letterIndex];
            isCorrect = letter.char === getPressedKey();
            // Delay the prediction by 1 second to
            // prevent the cat from guessing before it sees the letters.
        } else if (this.isLetterRemain(this.cat) && this.roundTime.now > 1 && !this.cat.isFrozen && this.cat.canPredict()) {
            character = this.cat;
            letter = letters[character.letterIndex];
            isCorrect = this.cat.predict();
        }

        if (character)
            this.pickLetter(character, letter, isCorrect);
    }

    /**
     * @param {Character} character
     * @param {Letter} letter
     * @param {boolean} isCorrect 
     */
    pickLetter(character, letter, isCorrect) {
        letter.addOwner(character, isCorrect)
        character.letterIndex++;

        if (character.name === "player") {
            const playerStore = getStoreItem("player")
            playerStore.passedLetters++;

            if (isCorrect) playerStore.correct++;

            playSound(isCorrect ? "pickUp" : "falsePickUp");
        } else {
            playSound("catPickUp");
        }

        if (!isCorrect) return;

        character.score += letter.score;

        if (!letter.perk || letter.isUsed) {
            this.updateScore();
            return;
        }

        this.activatePerk(letter, character);
    }

    /** @param {Character} character */
    isLetterRemain(character) {
        return character.letterIndex < this.letterSequence.size;
    }

    /**
     * @param {Letter} letter 
     * @param {Character} owner 
     */
    activatePerk(letter, owner) {
        let scoreX = owner.pos.x;
        let scoreY = owner.pos.y;

        letter.isUsed = true;

        switch (letter.perk) {
            case "bomb":
                scoreX += 35;
                scoreY *= 1.85;
                break;
            case "rocket":
                owner = owner === this.player ? this.cat : this.player;
                break;
            case "snowflake":
                owner.isFrozen = true;
                scoreX += owner.halfWidth;
                scoreY += owner.halfWidth;
                break;
        }

        if (letter.perk !== "bomb") delay(1, () => playSound(letter.perk));

        switch (letter.perk) {
            case "bomb":
            case "snowflake":
                const perkTextX = letter.pos.x + letter.width * 0.6;
                const perkTextY = letter.pos.y - letter.height * 0.75;
                let fontSize = 1;

                loop(2, ctx => {
                    ctx.font = fontSize + "rem monospace";

                    // stroke
                    if (letter.perk === "snowflake") {
                        ctx.fillStyle = "#EEE";
                        ctx.strokeStyle = "#444";
                        ctx.lineWidth = 1;
                        ctx.strokeText(getEmoji(letter.perk), perkTextX, perkTextY);
                    }

                    ctx.fillText(getEmoji(letter.perk), perkTextX, perkTextY);

                    fontSize += 0.04;
                }, () => {
                    owner.isFrozen = false;
                    this.updateScore();

                    if (letter.perk === "bomb") playSound(letter.perk);
                });
                break;
            case "rocket":
                const rocketPos = letter.pos.clone();
                const targetPos = owner.pos.clone().add(owner.halfWidth);

                loop(2, ctx => {
                    const d = rocketPos.dist(targetPos);

                    if (d < 10) return;

                    const vel = rocketPos.directionTo(targetPos)
                        .mult(300 * 0.016);

                    rocketPos.add(vel);

                    ctx.font = "2rem roboto";
                    ctx.fillText(getEmoji(letter.perk), rocketPos.x, rocketPos.y);
                }, () => {
                    owner.score--;
                    this.updateScore();
                });
                break;
        }
    }

    clearStage() {
        this.roundTime.stop();

        // Start new round a few seconds later.
        if (!this.roundCompletedTimer.isActive) {
            this.onEndRound();
        } else if (this.roundCompletedTimer.isTimeout) {
            this.onStartRound();
        } else if (this.roundCompletedTimer.time < this.ROUND_COMPLETE_BREAK_SEC - 2) {
            // Clear the letters on the screen 2 seconds after the round ends.
            this.letterSequence.clear();
        }
    }

    onEndRound() {
        if (this.round > this.MAX_ROUND_SIZE - 1) {
            delay(2, this.onLevelUp.bind(this));
            this.round = 0;
        } else {
            this.roundCompletedTimer.start(this.ROUND_COMPLETE_BREAK_SEC);
        }

        const firstCompleted = this.letterSequence.letters[this.letterSequence.size - 1];

        if (!firstCompleted) return;

        const fastet = Array.from(firstCompleted.owners.values())[0];

        if (this.roundData.length < this.MAX_ROUND_SIZE) this.roundData.push(fastet.name);

        const correctCount = this.letterSequence.letters.reduce((acc, letter) => {
            const con = fastet.name === "player" ? letter.isPlayerGuessedCorrect : !letter.isPlayerGuessedCorrect;
            acc += con ? 1 : 0;
            return acc;
        }, 0);

        const isHalfCorrect = correctCount >= Math.floor(this.levelLetterSize / 2);

        if (isHalfCorrect) this.roundWinner = fastet;
    }

    onStartRound() {
        const size = this.levelLetterSize;
        this.letterSequence.generate(size);

        if (this.roundWinner) {
            this.roundWinner.score += Math.floor(size / 2);
            this.roundWinner = null;
            this.updateScore();
        }

        if (this.round === 0)
            this.levelTime.start();

        this.round++;

        this.player.letterIndex = this.cat.letterIndex = 0;
        this.timeoutWarLetters = [];

        this.cat.onRoundStart();
        this.roundTime.start();
    }

    updateScore() {
        for (const entity of [this.player, this.cat]) {
            const name = entity.name;

            this.ctx.font = "1.2rem monospace";
            getStoreItem(name).score = entity.score;
            getStoreItem(name).scoreSize = this.ctx.measureText(entity.score).width;
        }
    }

    onLevelUp() {
        this.levelTime.stop(true);
        this.cat.levelUp(this.roundData);

        this.dialog.show(this.level);

        this.roundData = [];
        this.letterSequence.clear();
    }

    /**
     * 
     * @param {number} x 
     * @param {"player"|"cat"} entityName 
     */
    addBlock(x, entityName) {
        const y = this.H * 0.5;
        const width = this.W * this.BLOCK_WIDTH;
        const height = this.H - (this.H * this.BLOCK_HEIGHT);
        const store = getStoreItem(entityName);
        const scoreTextX = x - (store.scoreSize / 2) + width / 2;

        // Body
        this.ctx.fillStyle = "#CFAB8D";
        this.ctx.fillRect(x, y, width, height);

        // Score text
        this.ctx.fillStyle = "#222";
        this.ctx.font = "1.2rem monospace";
        this.ctx.fillText(store.score, scoreTextX, y + height / 2);

        // Top
        this.ctx.fillStyle = "#ECEEDF";
        this.ctx.fillRect(x, y, width, height * 0.15);
    }

    onRender() {
        // BG
        this.ctx.fillStyle = "#D9C4B0";
        this.ctx.fillRect(0, 0, this.W, this.H);

        // GUI
        this.ctx.fillStyle = "#444";
        this.ctx.textAlign = "center";

        if (this.roundCompletedTimer.isActive && this.roundCompletedTimer.time > 0) {
            this.ctx.font = "1rem monospace";
            this.ctx.fillText("Ready: " + (this.roundCompletedTimer.time + 1 | 0), this.W * 0.5, 60);
        }

        this.ctx.font = "1rem monospace";
        this.ctx.fillText(this.levelTime.now | 0, this.W * 0.5, 25);

        this.ctx.textAlign = "left";
        this.ctx.fillText("Level: " + this.level, 10, 25);

        this.ctx.font = "0.75rem monospace";
        this.ctx.fillText(`Round: ${this.round}/${this.MAX_ROUND_SIZE}`, 10, 45);

        // Player block.
        const playerBlockX = this.W * 0.15;
        const playerBlockCenter = (this.W * this.BLOCK_WIDTH) / 2;

        this.addBlock(playerBlockX, this.player.name);
        this.player.pos.set((playerBlockX + playerBlockCenter) - this.player.halfWidth, this.H * 0.5 - this.player.halfWidth);

        // NPC block.
        const npcBlockX = this.W * 0.15 + this.W * 0.5;
        const npcBlockCenter = (this.W * this.BLOCK_WIDTH) / 2;

        this.addBlock(npcBlockX, this.cat.name);
        this.cat.pos.set((npcBlockX + npcBlockCenter) - this.cat.halfWidth, this.H * 0.5 - this.cat.halfWidth);

        if (this.roundWinner !== null) {
            const winnerPos = this.roundWinner.pos.clone();
            const extraPoint = Math.floor(this.levelLetterSize / 2);

            this.ctx.font = "1rem monospace";
            this.ctx.fillStyle = "#444";
            this.ctx.fillText(`+${extraPoint}`, winnerPos.x, winnerPos.y);
        }

        // Draw letters.
        this.letterSequence.onRender();

        for (const letter of this.timeoutWarLetters) {
            const boxPadding = this.letterSequence.letterBoxPadding;
            const letterMaxH = letter.height + (boxPadding * 2);

            const box = new DOMRect(
                letter.pos.x - boxPadding,
                letter.pos.y - (letterMaxH - boxPadding),
                letter.width + (boxPadding * 2),
                letterMaxH
            );

            letter.render(box);
        }

        if (!this.isLetterRemain(this.player)) return;

        // Mark which letter we are on.
        const totalPadding = this.letterSequence.letterPadding + this.letterSequence.letterBoxPadding + this.ctx.lineWidth;
        const letterWidth = this.letterSequence.letters[this.player.letterIndex].width + totalPadding;
        const letterX = (this.letterSequence.boundingRect.x - totalPadding * 0.5) + ((letterWidth + totalPadding) * this.player.letterIndex);
        const letterY = this.letterSequence.boundingRect.y + this.letterSequence.boundingRect.height * 1.5;
        const arrowCenter = letterX + letterWidth * 0.5;
        const arrowSize = 8;

        this.ctx.fillStyle = "#444";

        this.ctx.beginPath();
        this.ctx.moveTo(arrowCenter, letterY);
        this.ctx.lineTo(arrowCenter - arrowSize, letterY + arrowSize);
        this.ctx.lineTo(arrowCenter + arrowSize, letterY + arrowSize);
        this.ctx.fill();
    }
}