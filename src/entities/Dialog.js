import { getPressedKey, isKeyDown } from "../helper/inputs.js";
import { isGameMusicMuted, playSound, toggleGameMusic } from "../sound/soundPlayer.js";
import { soundOffIcon, soundOnIcon } from "../sound/soundIconPath2D.js";
import { getStoreItem } from "../helper/store.js";

import messages from "../messages.json";

export default class Dialog {
    PADDING = 30;
    LINE_PADDING = 15;

    isOpen = false;
    msg = messages[0];

    /** @type {AudioBufferSourceNode|null} */
    gameMusic = null;

    constructor() {
        this.isOpen = true;
    }

    show(level) {
        this.msg = messages[level - 1];

        if (this.msg.level === 11) {
            this.msg.contents.push(...this.generateGameResult());
        }

        this.isOpen = true;
    }

    hide() {
        this.isOpen = false;

        this.playGameMusic();
    }

    playGameMusic() {
        if (!this.gameMusic && !isGameMusicMuted()) {
            this.gameMusic = playSound("bgmusic", true);
        } else if (this.gameMusic && isGameMusicMuted()) {
            this.gameMusic.stop();
            this.gameMusic = null;
        }
    }

    generateGameResult() {
        const msg = ["\n", "Statistics:"];
        const playerStore = getStoreItem("player");

        const playTime = (performance.now() / 1000 / 60).toFixed(1);
        const keyPressCnt = playerStore.passedLetters;
        const correctKeyPressCnt = playerStore.correct;
        const wrongKeyPressCnt = keyPressCnt - correctKeyPressCnt;

        msg.push(`Playing time: ${playTime} minutes.`);
        msg.push(`Your score: ${playerStore.score}`);
        msg.push(`Number of keys pressed: ${keyPressCnt}`);
        msg.push(`Number of keys pressed correctly: ${correctKeyPressCnt}`);
        msg.push(`Number of keys pressed incorrectly: ${wrongKeyPressCnt}\n`);

        msg.push("Don't forget to share your score:" +
            `${playerStore.score} (${correctKeyPressCnt}/${wrongKeyPressCnt}/${keyPressCnt})`);

        return msg;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} W Canvas width
     * @param {number} H Canvas height
     */
    onRender(ctx, W, H) {
        const dlgHeight = H - this.PADDING * 2;

        ctx.fillStyle = "rgba(217, 196, 176, 0.5)";
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = "#A26769";
        ctx.fillRect(this.PADDING, this.PADDING, W - this.PADDING * 2, dlgHeight);

        ctx.save();
        ctx.font = "0.5rem monospace";
        ctx.fillStyle = "#444";
        ctx.translate(W - this.PADDING * 1.75, 5);
        ctx.fill(isGameMusicMuted() ? soundOffIcon : soundOnIcon);
        ctx.fillText("Toggle Game Music (press M key):", -160, 15);
        ctx.restore();

        ctx.font = "1.5rem monospace";
        ctx.fillStyle = "#ECE2D0";
        ctx.fillText(this.msg.title, this.PADDING * 1.5, this.PADDING * 2.5);

        ctx.font = "0.9rem monospace";
        const maxWidth = W - this.PADDING * 4;
        let top = this.PADDING * 4;

        for (let i = 0; i < this.msg.contents.length; i++) {
            const line = this.msg.contents[i];

            ctx.fillText(line, this.PADDING * 1.5, top, maxWidth);

            top += ctx.measureText(line).actualBoundingBoxAscent + this.LINE_PADDING;

            if (line.endsWith("\n")) top += this.LINE_PADDING;
        }

        if (this.msg.level === 11) {
            return;
        }

        ctx.font = "italic 0.7rem monospace";
        ctx.textAlign = "right";
        ctx.fillText("[Press j to continue]", maxWidth + this.PADDING * 2, dlgHeight, maxWidth);

        if (!isKeyDown()) return;

        playSound("touch");

        switch (getPressedKey()) {
            case "J":
                this.hide();
                break;
            case "M":
                toggleGameMusic();
                this.playGameMusic();
                break;
        }
    }
}