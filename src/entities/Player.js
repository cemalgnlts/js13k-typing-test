import BaseCharacter from "./BaseCharacter.js";

export default class Player extends BaseCharacter {
    /** @type {"player"} */
    static name = "player";
    name = Player.name;
}