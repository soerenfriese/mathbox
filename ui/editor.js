import * as log from '../log/log.js'

const dummy = {
    getValue: () => { return dummy.value || '' },
    setValue: (value) => { dummy.value = value },
    setOption: (name, value) => {},
    setSize: (width, height) => {},
    hasFocus: () => false
}

export function init(wrapper) {
    if ('CodeMirror' in window) {
        const editor = CodeMirror(wrapper, {
            lineNumbers: true,
            mode: 'javascript'
        })

        const resizeObserver = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect
            editor.setSize(width, height)
        })

        resizeObserver.observe(wrapper)

        return editor
    }

    console.warn('\'codemirror\' library is missing: code editor is unavailable')
    log.warn('\'codemirror\' library is missing: code editor is unavailable')

    return dummy
}