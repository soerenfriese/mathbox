import * as log from '../log/log.js'
import * as editor_js from './editor.js'
import * as canvas_js from './canvas.js'
import * as panels from './panels.js'
import * as system from '../system/system.js'

let themeButtonSun
let themeButtonMoon
let theme
let editor

export function init(params) {
    themeButtonSun = document.getElementById('theme-button-sun')
    themeButtonMoon = document.getElementById('theme-button-moon')

    log.init(document.getElementById('log-panel').firstElementChild)

    editor = editor_js.init(document.getElementById('codemirror-panel').firstElementChild)
    const canvas = document.getElementById('canvas')
    canvas_js.init(canvas)

    if (params.has('display-mode')) {
        document.getElementById('header').style.display = 'none'
        document.documentElement.style.setProperty('--header-height', '0px')
        document.documentElement.style.setProperty('--editor-default-width', '0px')
        document.documentElement.style.setProperty('--canvas-default-height', '100%')
        document.getElementById('editor-panel').style.display = 'none'
        document.getElementById('horizontal-dragger').style.cursor = 'auto'
        canvas_js.resize()
    } else {
        panels.init()
    }

    theme = params.has('theme') ? params.get('theme') : (localStorage.getItem('theme') || 'dark')

    if (theme !== 'light') {
        setTheme(theme)
    }

    document.getElementById('theme-button').onclick = () => {
        theme = (theme === 'light' ? 'dark' : 'light')
        setTheme(theme)
    }
    
    system.init(editor, canvas, params)
}

function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.replace('light', 'dark')
        localStorage.setItem('theme', 'dark')

        editor.setOption('theme', 'darcula')
        canvas_js.setColor(0)

        themeButtonSun.style.display = 'none'
        themeButtonMoon.style.display = ''
    } else {
        document.body.classList.replace('dark', 'light')
        localStorage.setItem('theme', 'light')

        editor.setOption('theme', 'default')
        canvas_js.setColor(1)

        themeButtonSun.style.display = ''
        themeButtonMoon.style.display = 'none'
    }
}