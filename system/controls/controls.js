import * as panels from '../../ui/panels.js'

const keys = {}
let editor
let width = 0
let height = 0
let controls = null
let camera = null
let blocked = false

export function setDimensions(_width, _height) {
    width = _width
    height = _height
}

export function setCamera(_cameraType, _camera) {
    controls = _cameraType
    camera = _camera
}

export function updateKeys(dt) {
    if (!blocked && controls !== null && !editor.hasFocus()) {
        controls.updateKeys(camera, keys, dt)
    }
}

export function init(_editor, canvas, params) {
    canvas.addEventListener('contextmenu', (event) => {
        event.preventDefault()
    })

    if (!('glMatrix' in window)) {
        return
    }
    
    if (blocked = params.has('block-controls')) {
        return
    }
    
    editor = _editor

    let touch1 = -1
    let touch2 = -1
    let x1 = 0
    let y1 = 0
    let x2 = 0
    let y2 = 0

    function touchstart(event) {
        if (controls === null || (touch1 !== -1 && touch2 !== -1)) return // already tracking 2 touches

        for (let i = 0; i < event.changedTouches.length; ++i) {
            const touch = event.changedTouches[i]

            if (touch1 === -1) {
                touch1 = touch.identifier
                x1 = touch.clientX
                y1 = touch.clientY
    
                continue
    
            } else if (touch2 === -1) {
                touch2 = touch.identifier
                x2 = touch.clientX
                y2 = touch.clientY
    
                continue
            }
    
            break
        }
    }

    function touchmove(event) {
        const previousDistance = Math.hypot(x2 - x1, y2 - y1)
        let dx1 = 0
        let dy1 = 0
        let dx2 = 0
        let dy2 = 0

        for (let i = 0; i < event.changedTouches.length; ++i) {
            const touch = event.changedTouches[i]
            const identifier = touch.identifier

            if (identifier === touch1) {
                dx1 = touch.clientX - x1
                dy1 = touch.clientY - y1

                x1 = touch.clientX
                y1 = touch.clientY

                if (controls !== null && touch2 === -1) { // single touch
                    controls.drag(camera, dx1, -dy1, width, height, 1)
                }

            } else if (identifier === touch2) {
                dx2 = touch.clientX - x2
                dy2 = touch.clientY - y2

                x2 = touch.clientX
                y2 = touch.clientY

                if (controls !== null && touch1 === -1) { // single touch
                    controls.drag(camera, dx2, -dy2, width, height, 1)
                }
            }
        }

        if (controls !== null && (touch1 !== -1 && touch2 !== -1)) { // double touch
            let dx = (dx1 + dx2) / 2
            let dy = (dy1 + dy2) / 2
            controls.drag(camera, dx, -dy, width, height, 2)

            const distance = Math.hypot(x1 - x2, y1 - y2)
            const quotient = distance / previousDistance
            controls.zoom2(camera, quotient)
        }
    }

    function touchend(event) {
        for (let i = 0; i < event.changedTouches.length; ++i) {
            const identifier = event.changedTouches[i].identifier
    
            if (identifier === touch1) {
                touch1 = -1
            } else if (identifier === touch2) {
                touch2 = -1
            }
        }
    }

    function mousemove(event) {
        if (controls !== null && event.buttons !== 0 && !panels.isResizingFrame) {
            const dpr = Math.round(window.devicePixelRatio * 100) / 100
            controls.drag(camera, event.movementX, -event.movementY, width * dpr, height * dpr, event.buttons)
        }
    }

    function wheel(event) {
        if (controls !== null) {
            controls.zoom(camera, Math.sign(event.deltaY))
            event.preventDefault()
        }
    }

    function keydown(event) {
        keys[event.code] = true

        if (event.ctrlKey && (event.code === 'KeyA' || event.code === 'KeyS' || event.code === 'KeyD')) {
            event.preventDefault()
        }
    }

    function keyup(event) {
        delete keys[event.code]
    }

    canvas.addEventListener('touchstart', touchstart)
    canvas.addEventListener('touchmove', touchmove)
    canvas.addEventListener('touchend', touchend)
    canvas.addEventListener('touchcancel', touchend)
    canvas.addEventListener('mousemove', mousemove)
    canvas.addEventListener('wheel', wheel)
    document.addEventListener('keydown', keydown)
    document.addEventListener('keyup', keyup)
}