export function copy(v) {
    return v.slice()
}

export function set(a, b) {
    for (let i = 0; i < a.length; ++i) {
        a[i] = b[i]
    }
}

export function add(a, b) {
    let v = []

    for (let i = 0; i < a.length; ++i) {
        v[i] = a[i] + b[i]
    }

    return v
}

export function subtract(a, b) {
    let v = []

    for (let i = 0; i < a.length; ++i) {
        v[i] = a[i] - b[i]
    }

    return v
}

export function scale(s, v) {
    let u = []

    for (let i = 0; i < v.length; ++i) {
        u[i] = s * v[i]
    }

    return u
}

export function dot(a, b) {
    let d = 0

    for (let i = 0; i < a.length; ++i) {
        d += a[i] * b[i]
    }

    return d
}

export function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

function length(v) {
    let l = 0

    for (let i = 0; i < v.length; ++i) {
        l += v[i] * v[i]
    }
    
    return Math.sqrt(l)
}

function distance(a, b) {
    return length(subtract(b, a))
}

export function normalize(v) {
    const l = length(v)
    return l === 0 ? copy(v) : scale(1 / l, v)
}

export const args = Object.freeze({
    dot: dot,
    cross: cross,
    length: length,
    distance: distance,
    normalize: normalize
})