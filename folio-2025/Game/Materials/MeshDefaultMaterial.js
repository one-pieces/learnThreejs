import * as THREE from 'three/webgpu'
import { Game } from '../Game'
import { float, Fn } from 'three/tsl'

export class MeshDefaultMaterial extends THREE.MeshLambertNodeMaterial {
    constructor(parameters = {}) {
        super()

        this.game = Game.getInstance()

        this.depthWrite = parameters.depthWrite ?? true
        this.depthTest = parameters.depthTest ?? true
        this.side = parameters.side ?? THREE.FrontSide
        this.wireframe = parameters.wireframe ?? false
        this.transparent = parameters.transparent ?? false
        this.shadowSide = parameters.shadowSide ?? THREE.FrontSide

        this.hasCoreShadows = parameters.hasCoreShadows ?? true
        this.hasDropShadows = parameters.hasDropShadows ?? true
        this.hasLightBounce = parameters.hasLightBounce ?? true
        this.hasFog = parameters.hasFog ?? true
        this.hasWater = parameters.hasWater ?? true
        this.hasReveal = parameters.hasReveal ?? true

        this._colorNode = parameters.colorNode ?? color(0xffffff)
        this._normalNode = parameters.normalNode ?? normalWorld
        this._alphaNode = parameters.alphaNode ?? float(1)
        this._shadowNode = parameters.shadowNode ?? float(0)
        this.alphaTest = parameters.alphaTest ?? 0.1

        this.normalNode = this._normalNode // Get rid of warning
        
        /**
         * Shadow catcher
         * Catch shadow as a float and remove it from initial pipeline
         */
        const catchedShadow = float(1).toVar()

        if (this.hasDropShadows) {
            this.receivedShadowNode = Fn(([shadow]) => {
                catchedShadow.mulAssign(shadow.r)
                return float(1)
            })
        }

        /**
         * Output node
         */
        this.outputNode = Fn(() => {
            
        })
    }
}