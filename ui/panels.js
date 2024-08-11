import * as canvas_js from './canvas.js'

let frame
let editorPanel
let horizontalDragger
let canvasPanel

let verticalPanelLayout
let codemirrorPanel
let verticalDragger
let logPanel

let pointerCount = 0

let resizeVerticalLayout = () => {}
export let isResizingFrame = false // prevent canvas controls and panel resize occuring simultaneously

function resizeHorizontalPanels(width) {
    editorPanel.style.width = width + 'px'
    canvasPanel.style.width = `calc(100% - ${width}px)`
    sessionStorage.setItem('editor-panel-width', width)
    
    canvas_js.resize()
}

function resizeVerticalPanels(height) {
    codemirrorPanel.style.height = height + 'px'
    logPanel.style.height = `calc(100% - var(--vertical-dragger-height) - ${height}px)`
    sessionStorage.setItem('codemirror-panel-height', height)
}

function resizeHorizontalPanelsPortrait(height) {
    canvasPanel.style.height = height + 'px'
    editorPanel.style.height = `calc(100% - ${height}px)`
    sessionStorage.setItem('canvas-panel-height', height)

    resizeVerticalLayout()
    canvas_js.resize()
}

function clamp(x, min, max) {
    return x < min ? min : (x > max ? max : x)
}

export function init() {
    frame = document.getElementById('frame')
    editorPanel = document.getElementById('editor-panel')
    horizontalDragger = document.getElementById('horizontal-dragger')
    canvasPanel = document.getElementById('canvas-panel')

    verticalPanelLayout = document.getElementById('vertical-panel-layout')
    codemirrorPanel = document.getElementById('codemirror-panel')
    verticalDragger = document.getElementById('vertical-dragger')
    logPanel = document.getElementById('log-panel')

    initHorizontalLayout(frame, editorPanel, horizontalDragger, canvasPanel)
    initVerticalLayout(verticalPanelLayout, codemirrorPanel, verticalDragger, logPanel)
    
    if (window.matchMedia('(orientation: landscape)').matches) {
        let width = parseFloat(sessionStorage.getItem('editor-panel-width'))

        if (isNaN(width)) {
            width = editorPanel.getBoundingClientRect().width
        }

        width = clamp(width, 0, frame.getBoundingClientRect().width)
        resizeHorizontalPanels(width)
    } else {
        let height = parseFloat(sessionStorage.getItem('canvas-panel-height'))

        if (isNaN(height)) {
            height = canvasPanel.getBoundingClientRect().height
        }

        height = clamp(height, 0, frame.getBoundingClientRect().height - 48)
        resizeHorizontalPanelsPortrait(height)
    } 

    let height = parseFloat(sessionStorage.getItem('codemirror-panel-height'))

    if (isNaN(height)) {
        height = codemirrorPanel.getBoundingClientRect().height
    }
    
    height = clamp(height, 0, verticalPanelLayout.getBoundingClientRect().height - 16)
    resizeVerticalPanels(height)
}

function initHorizontalLayout(parent, editorPanel, resizer, canvasPanel) {
    const media = window.matchMedia('(orientation: landscape)')
    let landscape = media.matches
    media.onchange = (event) => { landscape = event.matches }

    let parentRect = parent.getBoundingClientRect()
    
    let pointerId = -1
    let offset = 0

    function pointerdown(event) {
        if (pointerId === -1) {
            pointerId = event.pointerId

            if (landscape) {
                offset = event.clientX - editorPanel.getBoundingClientRect().right
            } else {
                offset = event.clientY - canvasPanel.getBoundingClientRect().bottom
            }

            ++pointerCount
            document.body.style.userSelect = 'none' // prevent text highlighting while dragging

            isResizingFrame = true
        }
    }

    function pointermove(event) {
        if (event.pointerId === pointerId) {
            if (landscape) {
                const width = clamp(event.clientX - parentRect.left - offset, 0, parentRect.width)
                resizeHorizontalPanels(width)
            } else {
                const height = clamp(event.clientY - parentRect.top - offset, 0, parentRect.height - 48)
                resizeHorizontalPanelsPortrait(height)
            }
        }
    }

    function pointerup(event) {
        if (event.pointerId === pointerId) {
            pointerId = -1

            isResizingFrame = false

            if (--pointerCount === 0) {
                document.body.style.userSelect = ''
            }
        }
    }

    function resize(event) {
        parentRect = parent.getBoundingClientRect()

        if (media.matches) { // window-resize event is fired before media-change event, thefore 'isLandscape' still references previous values
            if (editorPanel.getBoundingClientRect().width > parentRect.width) {
                resizeHorizontalPanels(parentRect.width)
            }
        } else {
            if (canvasPanel.getBoundingClientRect().height > parentRect.height - 48) {
                resizeHorizontalPanelsPortrait(parentRect.height - 48)
            }
        }
    }

    function contextmenu(event) {
        event.preventDefault()
    }

    resizer.addEventListener('contextmenu', contextmenu)
    resizer.addEventListener('pointerdown', pointerdown)
    document.addEventListener('pointermove', pointermove)
    document.addEventListener('pointerup', pointerup)
    document.addEventListener('pointercancel', pointerup)
    window.addEventListener('resize', resize)
}

function initVerticalLayout(parent, codemirrorPanel, resizer, logPanel) {
    let parentRect = parent.getBoundingClientRect()

    let pointerId = -1
    let offset = 0

    function pointerdown(event) {
        if (pointerId === -1) {
            pointerId = event.pointerId

            offset = event.clientY - codemirrorPanel.getBoundingClientRect().bottom

            ++pointerCount
            document.body.style.userSelect = 'none'
        }
    }

    function pointermove(event) {
        if (event.pointerId === pointerId) {
            event.preventDefault()

            const height = clamp(event.clientY - parentRect.top - offset, 0, parentRect.height - 16)
            resizeVerticalPanels(height)
        }
    }

    function pointerup(event) {
        if (event.pointerId === pointerId) {
            pointerId = -1

            if (--pointerCount === 0) {
                document.body.style.userSelect = ''
            }
        }
    }

    function resize(event) {
        parentRect = parent.getBoundingClientRect()

        if (codemirrorPanel.getBoundingClientRect().height > parentRect.height - 16) {
            resizeVerticalPanels(parentRect.height - 16)
        }
    }

    function contextmenu(event) {
        event.preventDefault()
    }

    resizer.addEventListener('contextmenu', contextmenu)
    resizer.addEventListener('pointerdown', pointerdown)
    document.addEventListener('pointermove', pointermove)
    document.addEventListener('pointerup', pointerup)
    document.addEventListener('pointercancel', pointerup)
    window.addEventListener('resize', resize)

    resizeVerticalLayout = resize
}