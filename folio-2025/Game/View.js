import * as THREE from 'three/webgpu'
import { Game } from './Game.js'

export class View {
    constructor() {
        this.game = Game.getInstance()

        this.camera = new THREE.PerspectiveCamera(
            45,
            this.game.viewport.ratio,
            0.1,
            100
        )
        this.camera.position.set(0, 6, 12)
        this.camera.lookAt(0, 0, 0)
    }
}
