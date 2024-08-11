export function copy(a) {
    const b = []

    for (let i = 0; i < a.length; ++i) {
        b[i] = a[i].slice()
    }

    return b
}

export function set(a, b) {
    for (let i = 0; i < a.length; ++i) {
        for (let j = 0; j < a[0].length; ++j) {
            a[i][j] = b[i][j]
        }
    }
}

export function add(a, b) {
    const m = []

    for (let i = 0; i < a.length; ++i) {
        m[i] = []
        for (let j = 0; j < a.length; ++j) {
            m[i][j] = a[i][j] + b[i][j]
        }
    }

    return m
}

export function subtract(a, b) {
    const m = []

    for (let i = 0; i < a.length; ++i) {
        m[i] = []
        for (let j = 0; j < a.length; ++j) {
            m[i][j] = a[i][j] - b[i][j]
        }
    }

    return m
}

export function scale(s, a) {
    const b = []

    for (let i = 0; i < a.length; ++i) {
        b[i] = []
        for (let j = 0; j < a.length; ++j) {
            b[i][j] = s * a[i][j]
        }
    }

    return b
}

function mul(a, b) {
    const m = []

    for (let i = 0; i < a.length; ++i) {
        m[i] = []
        for (let j = 0; j < b[0].length; ++j) {
            m[i][j] = 0
            for (let k = 0; k < b.length; ++k) {
                m[i][j] += a[i][k] * b[k][j]
            }
        }
    }

    return m
}

export function apply(m, v) {
    let u = []

    for (let i = 0; i < m.length; ++i) {
        u[i] = 0
        for (let j = 0; j < v.length; ++j) {
            u[i] += m[i][j] * v[j]
        }
    }

    return u
}

function transpose(m) {
    const t = []

    for (let j = 0; j < m[0].length; ++j) {
        t[j] = []
        for (let i = 0; i < m.length; ++i) {
            t[j][i] = m[i][j]
        }
    }

    return t
}

function submatrix(m, i, j) {
    const s = []

    for (let k = 0; k < m.length - 1; ++k) {
        let k2 = k >= i ? k + 1 : k
        s[k] = []

        for (let l = 0; l < m[0].length - 1; ++l) {
            let l2 = l >= j ? l + 1 : l

            s[k][l] = m[k2][l2]
        }
    }

    return s
}

function minor(m, i, j) {
    return det(submatrix(m, i, j))
}

function cofactor(m, i, j) {
    return (-1) ** (i + j) * minor(m, i, j)
}

function det(m) {
    switch(m.length) {
        case 1:
            return m[0][0]
        case 2:
            return m[0][0] * m[1][1] - m[0][1] * m[1][0]
        case 3:
            return m[0][0] * m[1][1] * m[2][2] + m[0][1] * m[1][2] * m[2][0] + m[0][2] * m[1][0] * m[2][1] - m[0][2] * m[1][1] * m[2][0] - m[0][1] * m[1][0] * m[2][2] - m[0][0] * m[1][2] * m[2][1]
        default:
            const i = 0
            let d = 0

            for (let j = 0; j < m/*[0]*/.length; ++j) {
                if (m[i][j] === 0) continue

                d += m[i][j] * cofactor(m, i, j)
            }

            return d
    }
}

function cof(m) {
    const a = []

    for (let i = 0; i < m.length; ++i) {
        a[i] = []
        for (let j = 0; j < m[0].length; ++j) {
            a[i][j] = cofactor(m, i, j)
        }
    }

    return a
}

function adj(m) {
    return transpose(cof(m))
}

function inv(m) {
    const d = det(m)
    return d === 0 ? undefined : scale(1 / d, adj(m))
}

export const args = Object.freeze({
    mul: mul,
    apply: apply,
    transpose: transpose,
    submatrix: submatrix,
    minor: minor,
    cofactor: cofactor,
    det: det,
    cof: cof,
    adj: adj,
    inv: inv
})