import { Game } from '../Game.js'

export class World {
    constructor() {
        this.game = Game.getInstance()

        this.step(0)
    }

    step(step) {
        if (step === 0) {
            this.grid = new Grid()
        }
    }
}