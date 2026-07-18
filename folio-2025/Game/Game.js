import * as THREE from 'three/webgpu'

import { World } from './World/World.js'

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
        this.world = new World()
    }
}