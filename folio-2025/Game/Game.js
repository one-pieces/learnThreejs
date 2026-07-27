import * as THREE from 'three/webgpu'

import { World } from './World/World.js'
import { ResourcesLoader } from './ResourcesLoader.js'
import { Respawns } from './Respawns.js'
import { Reveal } from './Reveal.js'
import { Rendering } from './Rendering.js'
import { Viewport } from './Viewport.js'
import { Ticker } from './Ticker.js'

export class Game {
    static getInstance() {
        return Game.instance
    }

    constructor() {
        if (Game.instance) {
            return Game.instance
        }

        Game.instance = this

        this.init()
    }

    async init() {
        // Setup
        this.domELement = document.querySelector('.game');
        this.canvasElement = this.domELement.querySelector('.js-canvas');
        document.documentElement.classList.add('is-started');

        // First batch for intro
        this.scene = new THREE.Scene()
        this.resourcesLoader = new ResourcesLoader()
        this.ticker = new Ticker()

        this.viewport = new Viewport(this.domELement)
        this.rendering = new Rendering()
        await this.rendering.setRenderer()

        const compressed = !!import.meta.env.VITE_COMPRESSED
        const compressedModelSuffix = compressed ? '-compressed' : ''
        const cb = '?cb=1'
        this.resources = await this.resourcesLoader.load([
            ['respawnsReferencesModel',     `respawns/respawnsReferences${compressedModelSuffix}.glb${cb}`, 'gltf'],
        ])

        this.rendering.setPostprocessing()

        this.respawns = new Respawns(import.meta.env.VITE_PLAYER_SPAWN || 'landing')
        this.reveal = new Reveal()

        this.world = new World()

        this.world.step(1)

        this.ticker.wait(3, () => {
            this.reveal.updateStep(0)
        })
    }
}