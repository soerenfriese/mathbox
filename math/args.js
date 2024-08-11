import * as vectors from './vectors.js'
import * as vector_operations from './vector-operations.js'
import * as matrices from './matrices.js'
import * as matrix_operations from './matrix-operations.js'
import * as operations from './operations.js'
import * as util from './util.js'
import * as latex from './latex.js'
import * as shapes from './shapes.js'

export const args = Object.freeze({
    vectors: vectors.args,
    vector_operations: vector_operations.args,
    matrices: matrices.args,
    matrix_operations: matrix_operations.args,
    operations: operations.args,
    util: util.args,
    shapes: shapes.args,
    latex: latex.args
})

export const parameters = `{${Object.getOwnPropertyNames(args).map((name) => name + ':{' + Object.getOwnPropertyNames(args[name]) + '}').join(',')}}`