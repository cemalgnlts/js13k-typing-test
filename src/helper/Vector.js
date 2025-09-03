export default class Vector {
    x;
    y;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * @param {number|Vector} val 
     * @returns {Vector}
     */
    add(val) {
        if (typeof val === "number") {
            this.x += val;
            this.y += val;
        } else {
            this.x += val.x;
            this.y += val.y;
        }

        return this;
    }

    /**
     * @param {number|Vector} val 
     * @param {number | Vector} [y=val] 
     * @returns {Vector}
     */
    sub(val, y = val) {
        if (typeof val === "number") {
            this.x -= val;
            this.y -= y;
        } else {
            this.x -= val.x;
            this.y -= val.y;
        }

        return this;
    }

    mult(val) {
        this.x *= val;
        this.y *= val;

        return this;
    }

    div(val) {
        this.x /= val;
        this.y /= val;

        return this;
    }

    set(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    dist(target) {
        return target.clone()
            .sub(this)
            .mag();
    }

    /** @param {Vector} target  */
    directionTo(target) {
        const vec = target.clone()
            .sub(this)
            .normalize();

        return vec;
    }

    lerp(target, t = 1) {
        this.x = (1 - t) * this.x + (t * target.x);
        this.y = (1 - t) * this.y + (t * target.y);
    }

    normalize() {
        const m = this.mag();

        if (m > 0) this.div(m);

        return this;
    }

    mag() {
        return Math.hypot(this.x, this.y);
    }

    clone() {
        return new Vector(this.x, this.y);
    }

    toString() {
        return `${this.x}, ${this.y}`
    }
}