import * as log from '../log/log.js'
import * as gl_js from '../graphics/gl.js'
import * as controls from '../system/controls/controls.js'

let canvas

export function init(_canvas) {
    canvas = _canvas

    if (!('glMatrix' in window)) {
        console.warn('\'gl-matrix\' library is missing: graphics are deactivated')
        log.warn('\'gl-matrix\' library is missing: graphics are deactivated')

        return
    }

    let gl = canvas.getContext('webgl2')

    if (!gl) {
        console.warn('Browser does not support WebGL2: graphics are deactivated')
        log.warn('Browser does not support WebGL2: graphics are deactivated')

        return
    }

    resize()
    window.addEventListener('resize', resize)

    gl_js.load(gl)

    canvas.addEventListener('webglcontextlost', (event) => {
        event.preventDefault()

        gl = null

        console.warn('WebGL context was lost')
        log.warn('WebGL context was lost')
    })

    canvas.addEventListener('webglcontextrestored', (event) => {
        gl = canvas.getContext('webgl2')

        if (gl) {
            console.warn('WebGL context was restored')
            log.warn('WebGL context was restored')
            gl_js.load(gl)
        } else {
            console.warn('Browser does not support WebGL2: graphics are deactivated')
            log.warn('Browser does not support WebGL2: graphics are deactivated')
        }
    })
}

export function resize() {
    const { width, height } = canvas.getBoundingClientRect()
    setDimensions(width, height)
}

function setDimensions(width, height) {
    const dpr = Math.round(window.devicePixelRatio * 100) / 100
    canvas.width = width * dpr
    canvas.height = height * dpr
    gl_js.setDimensions(width * dpr, height * dpr)
    controls.setDimensions(width, height)
}

export function setColor(color) {
    gl_js.setColor(color)
}