import * as THREE from 'three/webgpu'

import { Game } from "./Game";
import { pass } from 'three/tsl';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';

export class Rendering {
    constructor() {
        this.game = Game.getInstance()
    }

    start() {
        // this.setStats()

        this.game.ticker.events.on('tick', () => {
            this.render()
        }, 998)

        this.game.ticker.events.on('change', () => {
            this.resize()
        })
    }

    async setRenderer() {
        this.renderer = new THREE.WebGPURenderer({
            canvas: this.game.canvasElement,
            powerPreference: 'high-performance',
            forceWebGL: false,
            antialias: this.game.viewport.pixelRatio < 2
        })
        this.renderer.setSize(this.game.viewport.width, this.game.viewport.height)
        this.renderer.setPixelRatio(this.game.viewport.pixelRatio)
        this.renderer.sortObjects = false

        this.renderer.domElement.classList.add('experience')
        this.renderer.shadowMap.enabled = true
        this.renderer.setOpaqueSort((a, b) => {
            return a.rendererOrder - b.rendererOrder
        })
        this.renderer.setTransparentSort((a, b) => {
            return a.rendererOrder - b.rendererOrder
        })

        // Make the renderer control the ticker
        this.renderer.setAnimationLoop((elapsedTime) => {
            this.game.ticker.update(elapsedTime)
        })

        return this.renderer.init()
    }

    setPostprocessing() {
        this.postProcessing = new THREE.RenderPipeline(this.renderer)

        const scenePass = pass(this.game.scene, this.game.view.camera)
        const scenePassColor = scenePass.getTextureNode('output')

        this.bloomPass = bloom(scenePassColor)
        this.bloomPass._nMips = this.game.quality.level === 0 ? 5 : 2
        this.bloomPass.threshold.value = 1
        this.bloomPass.strength.value = 0.25
        this.bloomPass.smoothWidth.value = 1

        // Connect the bloom pass to the pipeline output
        this.postProcessing.outputNode = this.bloomPass
        
        // TODO
        // this.cheapDOFPass = cheapDOF()
    }

    resize() {
        this.renderer.setSize(this.game.viewport.width, this.game.viewport.height)
        this.renderer.setPixelRatio(this.game.viewport.pixelRatio)
    }

    async render() {
        this.postProcessing.render()
    }
}