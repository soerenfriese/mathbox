import * as vectors from './vectors.js'
import * as matrices from './matrices.js'

function format(x) {
    return Math.round(x * 100) / 100
}

function latex(m, delimiter = '$') {
    if (vectors.isVector(m)) {
        let s = delimiter + '\\begin{bmatrix}'

        for (let i = 0; i < m.length; ++i) {
            s += format(m[i]) + '\\\\'
        }

        return s + '\\end{bmatrix}' + delimiter
    } else if (matrices.isMatrix(m)) {
        const rows = m.length
        const columns = m[0].length

        let s = delimiter + '\\begin{bmatrix}'

        for (let i = 0; i < rows; ++i) {
            const row = m[i]

            for (let j = 0; j < columns - 1; ++j) {
                s += format(row[j]) + '&'
            }

            s += format(row[columns - 1])

            if (i < rows - 1) {
                s += '\\\\'
            }
        }

        return s + '\\end{bmatrix}' + delimiter
    }

    return delimiter + m + delimiter
}

export const args = Object.freeze({
    latex: latex
})