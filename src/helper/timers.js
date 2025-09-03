const updatables = new Set();
const renderables = new Set();

export function Timer() {
    let isActive = false;
    let time = 0;

    const onUpdate = (dt) => {
        if (!isActive) return;

        if (time > 0) {
            time -= dt;
        }
        else {
            isActive = false;
            updatables.delete(onUpdate);
        }
    };

    const isTimeout = () => time <= 0

    return {
        get isActive() {
            return isActive;
        },
        get isTimeout() {
            return isTimeout();
        },
        get time() {
            return time;
        },
        update(dt) {
            onUpdate(dt);
        },
        start(sec = 0) {
            time = sec;
            isActive = true;
            updatables.add(onUpdate);
        }
    };
}


export function delay(sec = 0, fun = () => { }) {
    const tmr = Timer();

    const update = (dt) => {
        tmr.update(dt);

        if (tmr.isTimeout) {
            updatables.delete(update);
            fun();
        }
    };

    tmr.start(sec);
    updatables.add(update);
}

export function Chronometer(autoStart = false) {
    let time = 0;

    const onUpdate = (dt) => {
        time += dt;
    };

    if (autoStart) {
        updatables.add(onUpdate);
    }

    return {
        get now() {
            return time;
        },
        get isPaused() {
            return !updatables.has(onUpdate);
        },
        stop(reset = false) {
            updatables.delete(onUpdate);

            if (reset) time = 0;
        },
        start() {
            time = 0;
            updatables.add(onUpdate);
        }
    }
}

/**
 * 
 * @param {number} sec 
 * @param {(ctx: CanvasRenderingContext2D)} fun 
 * @param {() => void|undefined} onEnd
 */
export function loop(sec, fun, onEnd) {
    const bindFun = (ctx) => {
        ctx.save();
        fun(ctx);
        ctx.restore();
    };

    renderables.add(bindFun);

    delay(sec, () => {
        renderables.delete(bindFun);

        if (onEnd) onEnd();
    });
}

export function updateTimers(dt) {
    for (const updatable of Array.from(updatables)) {
        updatable(dt);
    }
}

export function renderTimers(ctx) {
    for (const renderable of Array.from(renderables)) {
        renderable(ctx);
    }
}