const options = {
    delimiters: [
        {left: "$$", right: "$$", display: true},
        {left: "\\(", right: "\\)", display: false},
        {left: "\\begin{equation}", right: "\\end{equation}", display: true},
        {left: "\\begin{align}", right: "\\end{align}", display: true},
        {left: "\\begin{alignat}", right: "\\end{alignat}", display: true},
        {left: "\\begin{gather}", right: "\\end{gather}", display: true},
        {left: "\\begin{CD}", right: "\\end{CD}", display: true},
        {left: "\\[", right: "\\]", display: true},
        {left: "$", right: "$", display: false}
    ],
    errorCallback: (e, trace) => {
        console.error(e, trace)
        error(e)
    }
}

let container

export function init(parent) {
    container = document.createElement('div')
    container.classList.add('log-container')

    parent.appendChild(container)

    if (!('renderMathInElement' in window)) {
        console.warn('\'katex\' library is missing: latex formatting is deactivated')
        warn('\'katex\' library is missing: latex formatting is deactivated')
    }
}

function addEntry(message, type) {
    const entry = document.createElement('div')
    entry.classList.add('log-entry', 'log-' + type)
    entry.textContent = message

    const scrollToBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - (container.lastChild?.clientHeight ?? 0)

    if (container.childElementCount > 128) {
        container.removeChild(container.firstElementChild)
    }

    container.appendChild(entry)

    if (scrollToBottom) {
        entry.scrollIntoView({ behavior: 'instant' })
    }

    if ('renderMathInElement' in window) {
        renderMathInElement(entry, options)
    }
}

export function clear() {
    container.replaceChildren()
}

export function info(...message) {
    message = String(message)

    if (message.length !== 0) {
        addEntry(message, 'default')
    }
}

export function warn(message) {
    message = String(message)
    
    if (message.length !== 0) {
        addEntry(message, 'warning')
    }
}

export function error(message) {
    if (message instanceof Error) {
        addEntry(message.name + ': ' + message.message, 'error')
    } else {
        message = String(message)

        if (message.length !== 0) {
            addEntry(message, 'error')
        }
    }
}

export function addSlider(callbackFunction, errorCallback = error) {
    const entry = document.createElement('div')
    entry.classList.add('log-slider')

    const span = document.createElement('span')
    span.textContent = '0.00'

    const slider = document.createElement('input')
    slider.type = 'range'
    slider.min = 0
    slider.max = 1
    slider.step = 0.01
    slider.value = 0

    function input(event) {
        const n = Number(slider.value)
        span.textContent = n.toFixed(2)

        try {
            callbackFunction(n)
        } catch (e) {
            errorCallback(e)

            slider.removeEventListener('input', input)
            slider.disabled = true
        }
    }

    slider.addEventListener('input', input)

    entry.appendChild(span)
    entry.appendChild(slider)

    const scrollToBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - (container.lastChild?.clientHeight ?? 0)

    if (container.childElementCount > 128) {
        container.removeChild(container.firstElementChild)
    }

    container.appendChild(entry)

    if (scrollToBottom) {
        entry.scrollIntoView({ behavior: 'instant' })
    }
}