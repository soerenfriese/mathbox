const EPSILON = 1e-8

function clamp(x, min, max) {
    return x > max ? max : (x < min ? min : x)
}

export class CameraType2D {
    constructor(id) {
        this.id = id
        this.keyMovementSensitivity = 2
        this.keyZoomSensitivity = 20
    }

    createCamera() {
        return new Camera2D()
    }

    drag(camera, dx, dy, width, height, buttons) {
        const ndc_dx = dx / height * 2
        const ndc_dy = dy / height * 2
        camera.x -= ndc_dx * camera.scale
        camera.y -= ndc_dy * camera.scale
    }

    zoom(camera, dy) {
        camera.scale = clamp(camera.scale * (1.25 ** dy), EPSILON, 128)
    }

    zoom2(camera, quotient) {
        camera.scale = clamp(camera.scale / quotient, EPSILON, 128)
    }

    updateKeys(camera, keys, dt) {
        let dx = 0
        let dy = 0

        if (keys.ArrowLeft) {
            --dx
        }

        if (keys.ArrowRight) {
            ++dx
        }

        if (keys.ArrowDown) {
            if (keys.ControlLeft) {
                this.zoom(camera, dt * this.keyZoomSensitivity)
            } else {
                --dy
            }
        }

        if (keys.ArrowUp) {
            if (keys.ControlLeft) {
                this.zoom(camera, -dt * this.keyZoomSensitivity)
            } else {
                ++dy
            }
        }

        if (dx !== 0 || dy !== 0) {
            const l = Math.hypot(dx, dy)
            camera.x += dx / l * dt * camera.scale * this.keyMovementSensitivity
            camera.y += dy / l * dt * camera.scale * this.keyMovementSensitivity
        }
    }
}

class Camera2D {
    constructor() {
        this.link = new Camera2DLink(this)
        this.reset()
    }

    reset() {
        this.x = 0
        this.y = 0
        this.scale = 2
    }

    copy(source) {
        this.reset()
        this.x = source.x
        this.y = source.y
        this.scale = source.scale
    }
}

class Camera2DLink {
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

    get scale() {
        return this.#parent.scale
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

    set scale(n) {
        if (Number.isFinite(n) && n >= EPSILON && n <= 128) {
            this.#parent.scale = n
        } else {
            throw new TypeError('camera.scale: camera scale component must lie in the interval $\\left[10^{-8}, 128\\right]$')
        }
    }
}