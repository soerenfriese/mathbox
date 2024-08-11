import { createLink } from './graph.js'
import * as vectors from '../../math/vectors.js'
import * as vector_operations from '../../math/vector-operations.js'
import * as matrices from '../../math/matrices.js'
import * as matrix_operations from '../../math/matrix-operations.js'
import * as dynamic_buffers from '../../graphics/dynamic-buffers.js'

export class Graph3D {
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
        this.lightDirection = [-1, -2, -4]
    }

    drawGrid(flag) {
        this.showGrid = flag
    }

    drawAxis(flag) {
        this.showAxis = flag
    }

    transform(m) {
        if (matrices.isMat3(m)) {
            this.transformation = matrix_operations.copy(m)
        } else {
            throw new TypeError('transform: parameter 1 is not of type \'mat3\'')
        }
    }

    drawLine(line) {
        if (Array.isArray(line) && line.every(vectors.isVec3)) {
            this.lines.push(line)
        } else {
            throw new TypeError('drawLine: parameter 1 is not of type \'vec3[]\'')
        }
    }

    drawVector(v1, v2) {
        if (vectors.isVec3(v1)) {
            if (v2 === undefined) {
                v2 = v1
                v1 = [0, 0, 0]
            } else if (!vectors.isVec3(v2)) {
                throw new TypeError('drawVector: parameter 2 is not of type \'vec3\'')
            }

            this.vectors.push([v1, v2])
        } else {
            throw new TypeError('drawVector: parameter 1 is not of type \'vec3\'')
        }
    }

    drawShape(shape, mode = 0) {
        if (validateShape(shape, 'drawShape')) {
            const rawData = mode === 1 ? dynamic_buffers.polyhedronFaceNormals(shape) : dynamic_buffers.polyhedronWeightedNormals(shape)
            const index = dynamic_buffers.upload(rawData)
            const shapeData = new dynamic_buffers.ShapeData(index, shape, null, null)
            shapeData.update()

            this.shapes[index] = shapeData
            const graph_shapes = this.shapes

            function update(flag = false) {
                if (validateShape(shape, 'update')) {
                    shapeData.update()

                    if (flag) {
                        const rawData = mode === 1 ? dynamic_buffers.polyhedronFaceNormals(shape) : dynamic_buffers.polyhedronWeightedNormals(shape)
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

    setLightDirection(direction) {
        if (vectors.isVec3(direction)) {
            this.lightDirection = vector_operations.copy(direction)
        } else {
            throw new TypeError('setLightDirection: parameter 1 is not of type \'vec3\'')
        }
    }
}


function isValidColor(v) {
    return vectors.isVec3(v) && v.every((x) => x >= 0 && x <= 1)
}

function isValidMatrix(m) {
    return matrices.isMatrix(m) && m.length === 3 && (m[0].length === 3 || m[0].length === 4)
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

    const i = shape.vertices.findIndex((v2) => !vectors.isVec3(v2))

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