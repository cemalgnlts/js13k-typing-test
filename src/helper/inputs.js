let keyIsDown = false;
let key = "";

export function initKeyboard() {
    const onKeyUp = () => {
        keyIsDown = false;
    };

    /** @param {KeyboardEvent} ev */
    const onKeyDown = (ev) => {
        const hasAnyExtraBtn = ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey;

        if (!ev.code.startsWith("Key") || hasAnyExtraBtn) return;

        key = ev.code["key".length];
        
        keyIsDown = true;
    };

    document.body.addEventListener("keyup", onKeyUp);
    document.body.addEventListener("keydown", onKeyDown);
}

/**
 * Upper case key.
 * @returns {string}
 */
export function getPressedKey() {
    return key;
}

export function isKeyDown() {
    const state = keyIsDown;

    if (state) keyIsDown = false;

    return state;
}