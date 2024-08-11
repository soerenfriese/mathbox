import * as vector_operations from '../math/vector-operations.js'
import * as matrix_operations from '../math/matrix-operations.js'

export class ShapeData {
    constructor(index, shape, color, matrix) {
        this.index = index
        this.shape = shape
        this.color = color
        this.matrix = matrix
    }

    update() {
        if (this.shape.color) {
            this.color = vector_operations.copy(this.shape.color)
        }

        if (this.shape.matrix) {
            this.matrix = matrix_operations.copy(this.shape.matrix)
        }
    }
}

class Data {
    constructor(vertexBuffer, indexBuffer, count) {
        this.vertexBuffer = vertexBuffer
        this.indexBuffer = indexBuffer
        this.count = count
    }
}

let gl
let emptyIndices = []
let buffers = []

export function init(_gl) {
    gl = _gl

    deleteData()
}

export function deleteData() {
    if (gl) {
        for (let i = 0; i < buffers.length; ++i) {
            const dataBuffer = buffers[i]

            if (dataBuffer === undefined) {
                continue
            }
        
            gl.deleteBuffer(dataBuffer.vertexBuffer)
            gl.deleteBuffer(dataBuffer.indexBuffer)
        }
    }

    emptyIndices.length = 0
    buffers.length = 0
}

export function upload(rawData) {
    if (gl) {
        let i = -1

        if (emptyIndices.length !== 0) {
            i = emptyIndices.pop()
        } else {
            i = buffers.length
            buffers[i] = new Data(gl.createBuffer(), gl.createBuffer(), rawData.count)
        }

        const bufferData = buffers[i]

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferData.vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, rawData.vertexBuffer, gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferData.indexBuffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rawData.indexBuffer, gl.STATIC_DRAW)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
        
        bufferData.count = rawData.count

        return i
    } else {
        let i = -1

        if (emptyIndices.length !== 0) {
            i = emptyIndices.pop()
        } else {
            i = buffers.length
            buffers[i] = null
        }

        return i
    }
}

export function update(i, rawData) {
    if (gl) {
        const dataBuffer = buffers[i]

        if (dataBuffer !== undefined) {
            gl.bindBuffer(gl.ARRAY_BUFFER, dataBuffer.vertexBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, rawData.vertexBuffer, gl.STATIC_DRAW)
            gl.bindBuffer(gl.ARRAY_BUFFER, null)

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dataBuffer.indexBuffer)
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rawData.indexBuffer, gl.STATIC_DRAW)
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

            dataBuffer.count = rawData.count
        }
    }
}

export function remove(i) {
    const dataBuffer = buffers[i]

    if (dataBuffer !== undefined) {
        emptyIndices.push(i)
    }
}

export function get(i) {
    return buffers[i]
}

export function polygon(shape) {
    const vertices = shape.vertices
    const indices = shape.indices

    const vertexBuffer = new Float32Array(vertices.flat())
    const indexBuffer = new Uint16Array(indices.length * 3 + indices.length * 6)

    indexBuffer.set(indices.flat(), 0)

    for (let i = 0; i < indices.length; ++i) {
        const [i0, i1, i2] = indices[i]
        indexBuffer.set([i0, i1, i1, i2, i2, i0], indices.length * 3 + i * 6)
    }

    return new Data(vertexBuffer, indexBuffer, indices.length * 3)
}

export function polyhedronWeightedNormals(shape) {
    const vertices = shape.vertices
    const indices = shape.indices

    const vertexBuffer = new Float32Array(vertices.length * 6)
    const indexBuffer = new Uint16Array(indices.length * 3 + indices.length * 6)

    for (let i = 0; i < vertices.length; ++i) {
        const n = [0, 0, 0]

        for (let j = 0; j < indices.length; ++j) {
            const [i0, i1, i2] = indices[j]

            if (i0 === i || i1 === i || i2 === i) {
                const v0 = vertices[i0]
                const v1 = vertices[i1]
                const v2 = vertices[i2]

                const v3 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]] // v3 = v0 -> v1 = v1 - v0
                const v4 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]] // v4 = v0 -> v2 = v2 - v0
                const v5 = vector_operations.cross(v3, v4)
                
                n[0] += v5[0]
                n[1] += v5[1]
                n[2] += v5[2]
            }
        }

        const v = vertices[i]
        const l = Math.hypot(n[0], n[1], n[2])

        vertexBuffer.set([v[0], v[1], v[2], n[0] / l, n[1] / l, n[2] / l], i * 6)
    }

    indexBuffer.set(indices.flat(), 0)

    for (let i = 0; i < indices.length; ++i) {
        const [i0, i1, i2] = indices[i]
        indexBuffer.set([i0, i1, i1, i2, i2, i0], indices.length * 3 + i * 6)
    }

    return new Data(vertexBuffer, indexBuffer, indices.length * 3)
}

export function polyhedronFaceNormals(shape) {
    const vertices = shape.vertices
    const indices = shape.indices

    const vertexBuffer = new Float32Array(indices.length * 3 * 6)
    const indexBuffer = new Uint16Array(indices.length * 3 + indices.length * 6)

    for (let i = 0; i < indices.length; ++i) {
        const [i0, i1, i2] = indices[i]

        const v0 = vertices[i0]
        const v1 = vertices[i1]
        const v2 = vertices[i2]

        const v3 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]] // v3 = v0 -> v1 = v1 - v0
        const v4 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]] // v4 = v0 -> v2 = v2 - v0
        const v5 = vector_operations.cross(v3, v4)

        vertexBuffer.set([v0[0], v0[1], v0[2], v5[0], v5[1], v5[2]], i * 3 * 6)
        vertexBuffer.set([v1[0], v1[1], v1[2], v5[0], v5[1], v5[2]], i * 3 * 6 + 6)
        vertexBuffer.set([v2[0], v2[1], v2[2], v5[0], v5[1], v5[2]], i * 3 * 6 + 12)

        const j0 = 3 * i
        const j1 = 3 * i + 1
        const j2 = 3 * i + 2
        indexBuffer.set([j0, j1, j2], i * 3)
        indexBuffer.set([j0, j1, j1, j2, j2, j0], indices.length * 3 + i * 6)
    }

    return new Data(vertexBuffer, indexBuffer, indices.length * 3)
}