/**
 * @typedef {"cat"|"player"|"rounds"} Key
 */

/**
 * @type {Map<Key, object>}
 */
const store = new Map();

store.set("player", {
    score: 0,
    correct: 0,
    scoreSize: 0,
    passedLetters: 0
});

store.set("cat", {
    score: 0,
    scoreSize: 0
});

/**
 * @param {Key} key
 * @returns {{ score: number, scoreSize: number, correct?: number, passedLetters?: number }}
 */
export function getStoreItem(key) {
    return store.get(key);
}

/**
 * @param {Key} key 
 * @param {object} val 
 */
export function setStoreItem(key, val) {
    store.set(key, val);
}
