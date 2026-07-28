import * as THREE from 'three/webgpu'
import { Game } from "../Game";
import { MeshGridMaterial, MeshGridMaterialLine } from "../Materials/MeshGridMaterial";

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
            anttialiased: true,
            reference: 'worldY',
            side: THREE.DoubleSide,
            lines
        })

        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            uvGridMaterial
        )
        this.mesh.position.y = 0
        this.mesh.rotation.x = - Math.PI * 0.5

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