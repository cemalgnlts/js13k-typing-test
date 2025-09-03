import { Letter } from "./Letter.js";

export default class LetterSequence {
    /** @param {CanvasRenderingContext2D} context2D */
    ctx;

    /** @type {Array<Letter>} */
    letters = [];
    /** @type {DOMRect} */
    boundingRect = new DOMRect();

    centerX = 0;
    totalSize = 0;
    letterBoxPadding = 10;

    letterPadding = 5;
    letterMaxW = 0;
    letterMaxH = 0;
    letterTurnIdx = 0;

    /** @param {CanvasRenderingContext2D} context2D */
    constructor(context2D, centerX, y) {
        this.ctx = context2D;

        this.centerX = centerX;
        this.boundingRect.y = y;
    }

    get head() {
        return this.letters[this.letterTurnIdx];
    }

    get size() {
        return this.letters.length;
    }

    get isCompleted() {
        return this.letterTurnIdx >= this.letters.length;
    }

    generate(size = 1) {
        this.letters = Array.from({ length: size }, () => new Letter(this.ctx));

        this.letterMaxW = Math.max(...this.letters.map(letter => letter.width));
        this.letterMaxH = Math.max(...this.letters.map(letter => letter.height));
        const padding = this.letterMaxW + this.letterPadding + this.letterBoxPadding;

        this.boundingRect.width = this.letters.reduce((prev, cur) => prev + cur.width + padding, 0);
        this.boundingRect.height = this.letterMaxH;
        this.boundingRect.x = this.centerX - ((this.boundingRect.width - padding) / 2);

        const letterCount = this.letters.length;
        let startX = this.boundingRect.x;

        for (let i = 0; i < letterCount; i++) {
            const letter = this.letters[i];

            letter.pos.set(startX, this.boundingRect.y);

            startX += letter.width + padding;
        }

        this.letterTurnIdx = 0;
    }

    popHead() {
        return this.letters[this.letterTurnIdx++];
    }

    clear() {
        this.letters = [];
    }

    onRender() {
        const boxPadding = this.letterBoxPadding;

        for (const letter of this.letters) {
            const box = new DOMRect(
                letter.pos.x - boxPadding,
                letter.pos.y - this.boundingRect.height - boxPadding,
                this.letterMaxW + (boxPadding * 2),
                this.letterMaxH + (boxPadding * 2)
            );

            letter.render(box);
        }
    }
}
