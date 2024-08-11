import * as log from '../log/log.js'

import * as shader2d from './shaders/shader2d.js'
import * as instanced2d from './shaders/instanced2d.js'
import * as shader3d from './shaders/shader3d.js'
import * as instanced3d from './shaders/instanced3d.js'
import * as shaded3d from './shaders/shaded3d.js'
import * as graph2d from './graphs/graph2d.js'
import * as graph3d from './graphs/graph3d.js'
import * as dynamic_buffers from './dynamic-buffers.js'

import * as controls from '../system/controls/controls.js'

let gl
let width = 0
let height = 0
let color = 1
let renderStyle = 0

let graphType
let graph
let camera

let lastTimeStamp = 0

export function load(_gl) {
    gl = _gl

    try {
        shader2d.load(gl)
        instanced2d.load(gl)
        shader3d.load(gl)
        instanced3d.load(gl)
        shaded3d.load(gl)

        graph2d.init(gl)
        graph3d.init(gl)
        dynamic_buffers.init(gl)

        requestAnimationFrame(render)
    } catch (error) {
        console.error(error)
        log.error(error)
    }
}

export function setDimensions(_width, _height) {
    width = _width
    height = _height
}

export function setGraph(_graphType, _graph, _camera) {
    graphType = _graphType
    graph = _graph
    camera = _camera

    dynamic_buffers.deleteData()
}

export function setColor(_color) {
    color = _color
}

export function setRenderStyle(_renderStyle) {
    renderStyle = _renderStyle
}

function render() {
    const t = performance.now() / 1000
    controls.updateKeys(t - lastTimeStamp)
    lastTimeStamp = t

    if (graphType) {
        switch (graphType.index) {
            case 0:
                graph2d.render(gl, width, height, color, renderStyle, graph, camera)
                break
            case 1:
                graph3d.render(gl, width, height, color, renderStyle, graph, camera)
                break
        }
    } else {
        gl.viewport(0, 0, width, height)
        gl.clearColor(color, color, color, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)
    }

    requestAnimationFrame(render)
}

export function loadProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, vertexSource)
    gl.compileShader(vertexShader)

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        const info = 'Error compiling vertex-shader:\n' + gl.getShaderInfoLog(vertexShader)
        gl.deleteShader(vertexShader)

        throw new Error(info)
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentShader, fragmentSource)
    gl.compileShader(fragmentShader)

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        const info = 'Error compiling fragment-shader:\n' + gl.getShaderInfoLog(fragmentShader)
        gl.deleteShader(vertexShader)
        gl.deleteShader(fragmentShader)

        throw new Error(info)
    }
    
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = 'Failed to link program:\n' + gl.getProgramInfoLog(program)
        gl.deleteProgram(program)
        gl.deleteShader(vertexShader)
        gl.deleteShader(fragmentShader)

        throw new Error(info)
    }

    return program
}

function record(t) {
    const stream = canvas.captureStream(60)
    const recorder = new MediaRecorder(stream)
    const chunks = []
    
    recorder.ondataavailable = event => {
        if (event.data.size > 0) {
            chunks.push(event.data)
        }
    }
    
    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = 'recording.mp4'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }
    
    recorder.start()
    
    setTimeout(() => recorder.stop(), t)
}