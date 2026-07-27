import { color, uniform, vec2 } from "three/tsl";
import { Game } from "./Game";

export class Reveal {
    constructor() {
        this.game = Game.getInstance()

        this.step = -1
        const respawn = this.game.respawns.getDefault()
        this.position = respawn.position.clone()
        this.position2Uniform = uniform(vec2(this.position.x, this.position.z))
        this.distance = uniform(0)
        this.thickness = uniform(0.05)
        this.color = uniform(color('#e88eff'))
        this.intensity = uniform(5.5)
        this.intensityMultiplier = 1
        // this.sound = this.game.audio.register({

        // })

        this.update = this.update.bind(this)
        this.game.ticker.events.on('tick', this.update, 10)
    }

    updateStep(step) {
        const speedMultiplier = location.hash.match(/skip/i) ? 4 : 1

        if (step === 0) {
            // Intro loader => Hide circle
            // this.game.world.intro.circle.hide(() => {
            //     // Grid
            //     this.game.world.grid.show()

            //     // Reveal
            //     this.distance.value = 0

            //     gsap
            // })
        }
    }

    update() {
        this.color.value.copy(this.game.dayCycles.properties.revealColor.value)
        this.intensity.value = this.game.dayCycles.properties.revealIntensity.value * this.intensityMultiplier
    }
}