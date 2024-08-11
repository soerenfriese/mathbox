import { createLink } from './graph.js'
import * as vectors from '../../math/vectors.js'
import * as matrices from '../../math/matrices.js'
import * as matrix_operations from '../../math/matrix-operations.js'
import * as dynamic_buffers from '../../graphics/dynamic-buffers.js'

export class Graph2D {
    constructor() {
        this.link = createLink(this)
        this.reset()
    }

    reset() {
        this.showGrid = true
        this.showAxis = true
        this.transformation = null
        this.lines = []
        this.vectors = []
        this.shapes = []
        dynamic_buffers.deleteData()
    }

    drawGrid(flag) {
        this.showGrid = flag
    }

    drawAxis(flag) {
        this.showAxis = flag
    }

    transform(m) {
        if (matrices.isMat2(m)) {
            this.transformation = matrix_operations.copy(m)
        } else {
            throw new TypeError('transform: parameter 1 is not of type \'mat2\'')
        }
    }

    drawLine(line) {
        if (Array.isArray(line) && line.every(vectors.isVec2)) {
            this.lines.push(line)
        } else {
            throw new TypeError('drawLine: parameter 1 is not of type \'vec2[]\'')
        }
    }

    drawVector(v1, v2) {
        if (vectors.isVec2(v1)) {
            if (v2 === undefined) {
                v2 = v1
                v1 = [0, 0]
            } else if (!vectors.isVec2(v2)) {
                throw new TypeError('drawVector: parameter 2 is not of type \'vec2\'')
            }

            this.vectors.push([v1, v2])
        } else {
            throw new TypeError('drawVector: parameter 1 is not of type \'vec2\'')
        }
    }

    drawShape(shape) {
        if (validateShape(shape, 'drawShape')) {
            const rawData = dynamic_buffers.polygon(shape)
            const index = dynamic_buffers.upload(rawData)
            const shapeData = new dynamic_buffers.ShapeData(index, shape, null, null)
            shapeData.update()

            this.shapes[index] = shapeData
            const graph_shapes = this.shapes

            function update(flag = false) {
                if (validateShape(shape, 'update')) {
                    shapeData.update()

                    if (flag) {
                        const rawData = dynamic_buffers.polygon(shape)
                        dynamic_buffers.update(index, rawData)
                    }
                }
            }

            function remove() {
                dynamic_buffers.remove(index)
                delete graph_shapes[index]
                delete shape.update
                delete shape.remove
            }

            shape.update = update
            shape.remove = remove
        }
    }
}

function isValidColor(v) {
    return vectors.isVec3(v) && v.every((x) => x >= 0 && x <= 1)
}

function isValidMatrix(m) {
    return matrices.isMatrix(m) && m.length === 2 && (m[0].length === 2 || m[0].length === 3)
}

function validateShape(shape, name) {
    if (!shape) throw new Error(name + ': shape is undefined')
    if (!Array.isArray(shape.vertices)) throw new Error(name + ': shape does not contain vertex array')
    if (!Array.isArray(shape.indices)) throw new Error(name + ': shape does not contain index array')

    if (shape.color && !isValidColor(shape.color)) {
        throw new Error(name + ': shape contains invalid color value')
    }

    if (shape.matrix && !isValidMatrix(shape.matrix)) {
        throw new Error(name + ': shape contains invalid matrix')
    }

    const i = shape.vertices.findIndex((v2) => !vectors.isVec2(v2))

    if (i !== -1) {
        throw new Error(name + ': shape contains invalid vertex array: vertices[' + i + ']')
    }

    const j = shape.indices.findIndex((i3) => {
        return !(Array.isArray(i3) && i3.length === 3 && i3.every((i) => Number.isInteger(i) && i >= 0 && i < shape.vertices.length))
    })

    if (j !== -1) {
        throw new Error(name + ': shape contains invalid index array: indices[' + j + ']')
    }

    return true
}