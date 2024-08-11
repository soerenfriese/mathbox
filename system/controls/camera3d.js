export class CameraType3D {
    constructor(id) {
        this.id = id
        this.keyMovementSensitivity = 12
        this.keyZoomSensitivity = 30
        this.keyPitchSensitivity = 1.5
        this.keyYawSensitivity = 2
    }

    createCamera() {
        return new Camera3D()
    }

    drag(camera, dx, dy, width, height, buttons) {
        if (buttons & 1) {
            const ndc_dx = dx / height * 2
            const ndc_dy = dy / height * 2
            camera.pitch -= ndc_dy * Math.PI // (1 pi) / (height / 2)
            camera.yaw += ndc_dx * Math.PI
        } else if (buttons & 2) {
            const ndc_dx = dx / height * 2
            const ndc_dy = dy / height * 2

            const z = Math.max(4.405, camera.zoom)
            const t = Math.tan(camera.fov / 2)
            const x = ndc_dx * z * t
            const y = ndc_dy * z * t

            CameraType3D.move(camera, [-x, 0, -y])
        }
    }

    zoom(camera, dy) {
        camera.zoom = Math.max(camera.zoom + 0.5 * dy, 0)
    }

    zoom2(camera, quotient) {
        camera.zoom = Math.max(camera.zoom / quotient, 0)
    }

    updateKeys(camera, keys, dt) {
        let dx = 0
        let dy = 0
        let dz = 0

        if (keys.KeyW) {
            ++dy
        }

        if (keys.KeyA) {
            --dx
        }

        if (keys.KeyS) {
            --dy
        }

        if (keys.KeyD) {
            ++dx
        }

        if (keys.Space) {
            ++dz
        }

        if (keys.ShiftLeft) {
            --dz
        }

        if (dx !== 0 || dy !== 0 || dz !== 0) {
            const l = Math.hypot(dx, dy, dz)
            CameraType3D.move(camera, [dx, dy, dz], dt / l * this.keyMovementSensitivity)
        }

        if (keys.ArrowUp) {
            if (keys.ControlLeft) {
                this.zoom(camera, -dt * this.keyZoomSensitivity)
            } else {
                camera.pitch -= dt * this.keyPitchSensitivity
            }
        }

        if (keys.ArrowLeft) {
            camera.yaw -= dt * this.keyYawSensitivity
        }
        
        if (keys.ArrowDown) {
            if (keys.ControlLeft) {
                this.zoom(camera, dt * this.keyZoomSensitivity)
            } else {
                camera.pitch += dt * this.keyPitchSensitivity
            }
        }

        if (keys.ArrowRight) {
            camera.yaw += dt * this.keyYawSensitivity
        }
    }

    static move(camera, v, f = 1) {
        const vec4 = glMatrix.vec4.fromValues(v[0], v[1], v[2], 1)

        let matrix = glMatrix.mat4.create()
        glMatrix.mat4.rotateZ(matrix, matrix, -camera.yaw)
        glMatrix.mat4.rotateX(matrix, matrix, -camera.pitch)
        glMatrix.mat4.rotateY(matrix, matrix, -camera.roll)
        glMatrix.mat4.mul(vec4, matrix, vec4)
        
        camera.x += f * vec4[0]
        camera.y += f * vec4[1]
        camera.z += f * vec4[2]
    }
}

class Camera3D {
    constructor() {
        this.link = new Camera3DLink(this)
        this.reset()
    }

    reset() {
        this.x = 0
        this.y = 0
        this.z = 0

        this.roll = 0
        this.pitch = Math.PI * (1 / 6)
        this.yaw = Math.PI * (11 / 8)

        this.zoom = 5
        this.fov = Math.PI / 2
    }

    copy(source) {
        this.reset()
        this.x = source.x
        this.y = source.y
        this.z = source.z

        this.pitch = source.pitch
        this.yaw = source.yaw

        this.zoom = source.zoom
    }
}

class Camera3DLink {
    #parent
    constructor(parent) {
        this.#parent = parent
    }

    reset() {
        this.#parent.reset()
    }

    get x() {
        return this.#parent.x
    }

    get y() {
        return this.#parent.y
    }

    get z() {
        return this.#parent.z
    }

    get roll() {
        return this.#parent.roll
    }

    get pitch() {
        return this.#parent.pitch
    }

    get yaw() {
        return this.#parent.yaw
    }

    get zoom() {
        return this.#parent.zoom
    }

    get fov() {
        return this.#parent.fov
    }

    set x(n) {
        if (Number.isFinite(n)) {
            this.#parent.x = n
        } else {
            throw new TypeError('camera.x: camera x-component must be a finite number')
        }
    }

    set y(n) {
        if (Number.isFinite(n)) {
            this.#parent.y = n
        } else {
            throw new TypeError('camera.y: camera y-component must be a finite number')
        }
    }

    set z(n) {
        if (Number.isFinite(n)) {
            this.#parent.z = n
        } else {
            throw new TypeError('camera.z: camera z-component must be a finite number')
        }
    }

    set roll(n) {
        if (Number.isFinite(n)) {
            this.#parent.roll = n
        } else {
            throw new TypeError('camera.roll: camera roll component must be a finite number')
        }
    }

    set pitch(n) {
        if (Number.isFinite(n)) {
            this.#parent.pitch = n
        } else {
            throw new TypeError('camera.pitch: camera pitch component must be a finite number')
        }
    }

    set yaw(n) {
        if (Number.isFinite(n)) {
            this.#parent.yaw = n
        } else {
            throw new TypeError('camera.yaw: camera yaw component must be a finite number')
        }
    }

    set zoom(n) {
        if (Number.isFinite(n) && n >= 0) {
            this.#parent.zoom = n
        } else {
            throw new TypeError('camera.zoom: camera zoom component must a positive number')
        }
    }

    set fov(n) {
        if (Number.isFinite(n) && n > 0 && n < Math.PI) {
            this.#parent.fov = n
        } else {
            throw new TypeError('camera.fov: camera fov component must lie in the interval $\\left(0, \\pi\\right)$')
        }
    }
}