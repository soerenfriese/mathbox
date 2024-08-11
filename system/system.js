import * as log from '../log/log.js'
import { GraphFunctions } from './graph-functions.js'
import { Instance } from './instance.js'
import * as args from '../math/args.js'
import * as controls from './controls/controls.js'
import * as gl_js from '../graphics/gl.js'

const amplifiers = [1, 1.5, 2, 4, 0.5]
const renderStyles = ['geometry', 'lighting']
const graphFunctions = new GraphFunctions()
const parameters = ['{ log, addSlider, clear, setHz, define }', args.parameters]

let timeButton
let amplifierButton
let renderStyleButton
const renderStyleButtonIcons = []

let editor

let instance = null

let intervalId = -1
let hz = 60
let time = 0
let lastTimeStamp = 0
let amplifier = 1
let paused = false

let renderStyle = 0

export function init(_editor, canvas, params) {
    editor = _editor

    const runButton = document.getElementById('run-button')
    timeButton = document.getElementById('time-button')
    amplifierButton = document.getElementById('amplifier-button')
    const logClearButton = document.getElementById('log-button')
    renderStyleButton = document.getElementById('render-style-button')
    
    for (let i = 0; i < renderStyles.length; ++i) {
        renderStyleButtonIcons[i] = document.getElementById('render-style-' + renderStyles[i])
    }

    runButton.onclick = onClickRunButton
    timeButton.onclick = onClickTimeButton
    amplifierButton.onclick = onClickAmplifierButton
    logClearButton.onclick = log.clear
    renderStyleButton.onclick = onClickRenderStyleButton

    controls.init(editor, canvas, params)

    Object.defineProperty(window, 'out', { set: graphFunctions.functions.log, configurable: true })

    window.addEventListener('beforeunload', (event) => {
        sessionStorage.setItem('code', editor.getValue())
        localStorage.setItem('code-autosave', editor.getValue())
    })

    if (params.has('code')) {
        editor.setValue(params.get('code'))

        onClickRunButton()

        if (instance.graphType !== null) {
            if (params.has('render-style')) {
                const index = renderStyles.indexOf(params.get('render-style'))

                if (instance.graphType.renderStyles.includes(index)) {
                    setRenderStyle(index)
                }
            }

            if (params.has('display-mode')) {
                renderStyleButton.style.display = 'none'
            }
        }
    } else {
        editor.setValue(sessionStorage.getItem('code') ?? 'const { graph, camera } = define(\'2d\')')
    }
}

function onClickRunButton() {
    stop(true)
    log.clear()

    instance = new Instance()
    graphFunctions.prepare(instance)
    graphFunctions.freeze(false)

    const code = editor.getValue()
    let result

    try {
        const f = new Function(parameters[0], parameters[1], code)
        result = f(graphFunctions.functions, args.args)
    } catch (error) {
        console.error(error)
        log.error(error)

        return
    } finally {
        graphFunctions.freeze(true)
    }

    if (instance.graphType === null) {
        setVisuals(null, null, null, null)
    }

    if (typeof result === 'function') {
        instance.ticker = result

        time = 0
        lastTimeStamp = performance.now() / 1000

        try {
            tick(false)
            intervalId = setInterval(tick, 1000 / hz)
        } catch (error) {
            console.error(error)
            log.error(error)
            
            stop()
        }
    } else if (typeof result !== 'undefined') {
        log.info(result)
    }
}

function onClickTimeButton() {
    if (!paused && intervalId !== -1) {
        paused = true

        clearInterval(intervalId)
        intervalId = -1
        tick(true)
    } else if (paused && intervalId === -1) {
        paused = false

        lastTimeStamp = performance.now() / 1000

        try {
            tick(false)
            intervalId = setInterval(tick, 1000 / hz)
        } catch (error) {
            console.error(error)
            log.error(error)

            stop()
        }
    }
}

function onClickAmplifierButton() {
    amplifier = amplifiers[(amplifiers.indexOf(amplifier) + 1) % amplifiers.length]
    amplifierButton.textContent = 'x' + amplifier.toFixed(1)
}

function onClickRenderStyleButton() {
    if (instance !== null && instance.graphType !== null) {
        const graphStyles = instance.graphType.renderStyles
        const style = graphStyles[(graphStyles.indexOf(renderStyle) + 1) % graphStyles.length]
        setRenderStyle(style)
    }
}

function tick(flag = true) {
    const currentTimeStamp = performance.now() / 1000
    const dt = amplifier * (currentTimeStamp - lastTimeStamp)
    time += dt
    lastTimeStamp = currentTimeStamp

    const minutes = Math.floor(time / 60).toString().padStart(2, '0')
    const seconds = (time % 60).toFixed(1).padStart(4, '0')
    timeButton.textContent = minutes + ':' + seconds

    if (flag) {
        try {
            instance.ticker(time, dt)
        } catch (error) {
            console.error(error)
            log.error(error)
    
            stop()
        }
    } else {
        instance.ticker(time, dt)
    }
}

export function stop(flag = false) {
    if (intervalId !== -1) {
        clearInterval(intervalId)
        intervalId = -1
    }

    hz = 60
    paused = false

    if (flag) {
        timeButton.textContent = '00:00.0'
    }
}

export function setHz(_hz) {
    hz = _hz
}

export function setVisuals(graphType, graph, cameraType, camera) {
    gl_js.setGraph(graphType, graph, camera)
    controls.setCamera(cameraType, camera)

    if (graphType === null) {
        renderStyleButton.style.display = 'none'
        renderStyleButton.disabled = true
        
        setRenderStyle(0)
    } else {
        renderStyleButton.style.display = ''
        renderStyleButton.disabled = graphType.renderStyles.length <= 1

        if (!graphType.renderStyles.includes(renderStyle)) {
            setRenderStyle(graphType.renderStyles[0])
        }
    }
}

function setRenderStyle(style) {
    renderStyle = style

    for (let i = 0; i < renderStyleButtonIcons.length; ++i) {
        renderStyleButtonIcons[i].style.display = 'none'
    }

    renderStyleButtonIcons[renderStyle].style.display = ''

    gl_js.setRenderStyle(renderStyle)
}