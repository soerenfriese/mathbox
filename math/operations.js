import * as vectors from './vectors.js'
import * as vector_operations from './vector-operations.js'
import * as matrices from './matrices.js'
import * as matrix_operations from './matrix-operations.js'

function copy(a) {
    if (vectors.isVector(a)) {
        return vector_operations.copy(a)
    } else if (matrices.isMatrix(a)) {
        return matrix_operations.copy(a)
    }
}

function set(a, b) {
    if (vectors.isVector(a) && vectors.isVector(b)) {
        vector_operations.set(a, b)
    } else if (matrices.isMatrix(a) && matrices.isMatrix(b)) {
        matrix_operations.set(a, b)
    }
}

function add(a, b) {
    if (vectors.isVector(a) && vectors.isVector(b)) {
        return vector_operations.add(a, b)
    } else if (matrices.isMatrix(a) && matrices.isMatrix(b)) {
        return matrix_operations.add(a, b)
    }
}

function subtract(a, b) {
    if (vectors.isVector(a) && vectors.isVector(b)) {
        return vector_operations.subtract(a, b)
    } else if (matrices.isMatrix(a) && matrices.isMatrix(b)) {
        return matrix_operations.subtract(a, b)
    }
}

function scale(s, a) {
    if (Number.isFinite(s)) {
        if (vectors.isVector(a)) {
            return vector_operations.scale(s, a)
        } else if (matrices.isMatrix(a)) {
            return matrix_operations.scale(s, a)
        }
    }
}

export const args = Object.freeze({
    copy: copy,
    set: set,
    add: add,
    subtract: subtract,
    scale: scale
})