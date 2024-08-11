import * as ui from './ui/ui.js'

const params = new URLSearchParams(window.location.search)

document.addEventListener('DOMContentLoaded', (event) => {
    ui.init(params)
})