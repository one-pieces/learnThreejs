import * as THREE from 'three/webgpu'
import { Fn, positionWorld, reference } from "three/tsl";
import { Game } from "../Game";
import { MeshGridMaterial, MeshGridMaterialLine } from "../Materials/Meshgridmaterial";
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial';

export class Grid {
    constructor() {
        this.game = Game.getInstance()

        this.setVisual()
    }

    setVisual() {
        const lines = [
            new MeshGridMaterialLine('#8d55ff', 10, 0.02, 0.2),
            new MeshGridMaterialLine('#675369', 100, 0.002, 1),
        ]

        const uvGridMaterial = new MeshGridMaterial({
            color: 0x1b191f,
            scale: 0.001,
            anttialiased: true,
            reference: 'uv',
            side: THREE.DoubleSide,
            lines
        })

        const defaultMaterial = new MeshDefaultMaterial({
            colorNode: uvGridMaterial.outputNode.rgb,
            hasWater: false,
            hasReveal: false,
            hasLightBounce: false
        })

        uvGridMaterial.outputNode = Fn(() => {
            const distanceToCenter = positionWorld.xz.sub(this.game.reveal.position2Uniform).length()
            distanceToCenter.lessThan(this.game.reveal.distance).discard()

            return defaultMaterial.outputNode
        })

        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            uvGridMaterial
        )
        this.mesh.position.y = 0
        this.mesh.roration.x = - Math.PI * 0.5

        const defaultRespawn = this.game.respawns.getDefault()
        this.mesh.position.x = defaultRespawn.position.x
        this.mesh.position.z = defaultRespawn.position.z

        this.game.scene.add(this.mesh)
    }

    show() {
        this.game.scene.add(this.mesh)
    }

    destroy() {
        this.mesh.material.dispose()
        this.mesh.geometry.dispose()
        this.mesh.removeFromParent()
    }
}