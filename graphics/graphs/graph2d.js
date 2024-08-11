import * as shader2d from '../shaders/shader2d.js'
import * as instanced2d from '../shaders/instanced2d.js'
import * as matrix_operations from '../../math/matrix-operations.js'
import * as dynamic_buffers from '../dynamic-buffers.js'

let projectionMatrix = null
let viewMatrix = null
let modelMatrix = null
let vectorVertexBuffer = null
let instanceMatrixBuffer = null

function invert(color, value) {
    return color ? value : (1 - value)
}

export function init(gl) {
    projectionMatrix = glMatrix.mat4.create()
    viewMatrix = glMatrix.mat4.create()
    modelMatrix = glMatrix.mat4.create()

    const vectorVertices = new Float32Array([0, 0, -0.25, 0.05, -0.25, -0.05])

    vectorVertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vectorVertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vectorVertices, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    instanceMatrixBuffer = gl.createBuffer()
}

export function render(gl, width, height, color, renderStyle, graph, camera) {
    const fill = 1 - color

    gl.viewport(0, 0, width, height)
    gl.clearColor(color, color, color, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    glMatrix.mat4.identity(projectionMatrix)
    projectionMatrix[0] = height / width

    glMatrix.mat4.identity(viewMatrix)
    glMatrix.mat4.scale(viewMatrix, viewMatrix, [1 / camera.scale, 1 / camera.scale, 1])
    glMatrix.mat4.translate(viewMatrix, viewMatrix, [-camera.x, -camera.y, 0])

    glMatrix.mat4.identity(modelMatrix)

    const half_width = camera.scale
    const aspect = width / height
    let left = camera.x - half_width * aspect
    let right = camera.x + half_width * aspect
    let bottom = camera.y - half_width
    let top = camera.y + half_width

    if (graph.transformation !== null) {
        const m = graph.transformation

        const transformation = glMatrix.mat4.fromValues(m[0][0], m[1][0], 0, 0, m[0][1], m[1][1], 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
        glMatrix.mat4.multiply(modelMatrix, modelMatrix, transformation)

        const det = m[0][0] * m[1][1] - m[0][1] * m[1][0]

        if (det !== 0 && (graph.showGrid || graph.showAxis)) {
            const inverse = [[m[1][1] / det, -m[0][1] / det], [-m[1][0] / det, m[0][0] / det]]

            const leftBottom = matrix_operations.apply(inverse, [left, bottom])
            const rightBottom = matrix_operations.apply(inverse, [right, bottom])
            const rightTop = matrix_operations.apply(inverse, [right, top])
            const leftTop = matrix_operations.apply(inverse, [left, top])

            left = Math.min(leftBottom[0], rightBottom[0], rightTop[0], leftTop[0])
            right = Math.max(leftBottom[0], rightBottom[0], rightTop[0], leftTop[0])
            bottom = Math.min(leftBottom[1], rightBottom[1], rightTop[1], leftTop[1])
            top = Math.max(leftBottom[1], rightBottom[1], rightTop[1], leftTop[1])
        }
    }

    shader2d.use()
    shader2d.setProjectionMatrix(projectionMatrix)
    shader2d.setViewMatrix(viewMatrix)
    shader2d.setModelMatrix(modelMatrix)

    instanced2d.use()
    instanced2d.setProjectionMatrix(projectionMatrix)
    instanced2d.setViewMatrix(viewMatrix)
    instanced2d.setModelMatrix(modelMatrix)

    drawGrid(gl, color, fill, left, right, bottom, top, camera.scale, graph)
    
    if (graph.lines.length !== 0) {
        drawLines(gl, fill, graph.lines)
    }

    if (graph.vectors.length !== 0) {
        drawVectors(gl, fill, graph.vectors)
    }

    if (graph.shapes.length !== 0) {
        drawPolygons(gl, modelMatrix, graph.shapes)
    }
}

function drawGrid(gl, color, fill, left, right, bottom, top, scale, graph) {
    shader2d.use()

    const step = Math.pow(2, Math.floor(Math.log2(scale)) - 1)
    left = Math.floor(left / step) * step
    right = Math.ceil(right / step) * step
    bottom = Math.floor(bottom / step) * step
    top = Math.ceil(top / step) * step

    const xIterations = (right - left) / step
    const yIterations = (top - bottom) / step

    if (graph.showGrid && xIterations * yIterations <= 8192 /* 2 ** 13 */){
        const lightGray = invert(color, 0.85)
        shader2d.setColor(lightGray, lightGray, lightGray, 1)

        for (let i = 0; i < xIterations * 4; ++i) {
            if (i % 4 === 0) continue
            const x = left + i * step / 4
            shader2d.vertex(x, bottom)
            shader2d.vertex(x, top)
        }

        for (let i = 0; i < yIterations * 4; ++i) {
            if (i % 4 === 0) continue
            const y = bottom + i * step / 4
            shader2d.vertex(left, y)
            shader2d.vertex(right, y)
        }

        shader2d.draw(gl.LINES)

        const darkGray = invert(color, 0.55)
        shader2d.setColor(darkGray, darkGray, darkGray, 1)

        for (let x = left; x <= right; x += step) {
            if (graph.showAxis && x === 0) continue
            shader2d.vertex(x, bottom)
            shader2d.vertex(x, top)
        }

        for (let y = bottom; y <= top; y += step) {
            if (graph.showAxis && y === 0) continue
            shader2d.vertex(left, y)
            shader2d.vertex(right, y)
        }

        shader2d.draw(gl.LINES)
    }

    if (graph.showAxis) {
        if (graph.showGrid) {
            shader2d.setColor(fill, fill, fill, 1)
            shader2d.vertex(left, 0)
            shader2d.vertex(0, 0)
            shader2d.vertex(1, 0)
            shader2d.vertex(right, 0)
            shader2d.vertex(0, bottom)
            shader2d.vertex(0, 0)
            shader2d.vertex(0, 1)
            shader2d.vertex(0, top)
            shader2d.draw(gl.LINES)
        }

        shader2d.setColor(1, 0, 0, 1)
        shader2d.vertex(0, 0)
        shader2d.vertex(1, 0)
        shader2d.draw(gl.LINES)
        shader2d.setColor(0, 1, 0, 1)
        shader2d.vertex(0, 0)
        shader2d.vertex(0, 1)
        shader2d.draw(gl.LINES)
    }
}

function drawLines(gl, fill, lines) {
    shader2d.use()
    shader2d.setColor(fill, fill, fill, 1)

    for (let i = 0; i < lines.length; ++i) {
        const line = lines[i]

        for (let j = 0; j < line.length; ++j) {
            const point = line[j]
            shader2d.vertex(point[0], point[1])
        }

        shader2d.draw(gl.LINE_STRIP)
    }
}

function drawVectors(gl, fill, vectors) {
    shader2d.use()
    shader2d.setColor(fill, fill, fill, 1)

    const instances = vectors.length
    const instanceMatrices = new Float32Array(instances * 16)

    for (let i = 0; i < vectors.length; ++i) {
        const v = vectors[i]
        const start = v[0]
        const end = v[1]
        shader2d.vertex(start[0], start[1])
        shader2d.vertex(end[0], end[1])

        const instanceMatrix = glMatrix.mat4.create()

        const x = end[0] - start[0]
        const y = end[1] - start[1]

        if (x === 0 && y === 0) {
            glMatrix.mat4.scale(instanceMatrix, instanceMatrix, [0, 0, 1])
        } else {
            const length = Math.hypot(x, y)
            const scale = 2 * Math.min(length, 2 * 0.25)
            const z_rotation = Math.atan2(y, x)
            glMatrix.mat4.translate(instanceMatrix, instanceMatrix, [end[0], end[1], 0])
            glMatrix.mat4.rotateZ(instanceMatrix, instanceMatrix, z_rotation)
            glMatrix.mat4.scale(instanceMatrix, instanceMatrix, [scale, (scale + 1) / 2, 1])
        }

        instanceMatrices.set(instanceMatrix, i * 16)
    }

    shader2d.draw(gl.LINES)

    instanced2d.use()

    gl.bindBuffer(gl.ARRAY_BUFFER, vectorVertexBuffer)
    gl.enableVertexAttribArray(instanced2d.positionLocation)
    gl.vertexAttribPointer(instanced2d.positionLocation, 2, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, instanceMatrixBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, instanceMatrices, gl.DYNAMIC_DRAW)
    const stride = 16 * Float32Array.BYTES_PER_ELEMENT
    for (let i = 0; i < 4; ++i) {
        const location = instanced2d.instanceMatrixLocation + i
        const offset = i * 4 * Float32Array.BYTES_PER_ELEMENT
        gl.enableVertexAttribArray(location)
        gl.vertexAttribPointer(location, 4, gl.FLOAT, false, stride, offset)
        gl.vertexAttribDivisor(location, 1)
    }
    
    instanced2d.setColor(1, 1, 1, 1)
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 3, instances)

    instanced2d.setColor(0, 0, 0, 1)
    gl.drawArraysInstanced(gl.LINE_LOOP, 0, 3, instances)

    gl.disableVertexAttribArray(instanced2d.positionLocation)

    for (let i = 0; i < 4; ++i) {
        const location = instanced2d.instanceMatrixLocation + i
        gl.disableVertexAttribArray(location)
        gl.vertexAttribDivisor(location, 0)
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, null)
}

function drawPolygons(gl, modelMatrix, shapes) {
    shader2d.use()

    for (let i = 0; i < shapes.length; ++i) {
        const shape = shapes[i]

        if (shape !== undefined) {
            const data = dynamic_buffers.get(shape.index)

            drawPolygon(gl, modelMatrix, shape.color, shape.matrix, data.vertexBuffer, data.indexBuffer, data.count)
        }
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
}

function drawPolygon(gl, modelMatrix, color, matrix, vertexBuffer, indexBuffer, count) {
    if (matrix !== null) {
        const transform = glMatrix.mat4.fromValues(matrix[0][0], matrix[1][0], 0, 0, matrix[0][1], matrix[1][1], 0, 0, 0, 0, 1, 0, matrix[0][2] || 0, matrix[1][2] || 0, 0, 1)
        glMatrix.mat4.multiply(transform, modelMatrix, transform)
        shader2d.setModelMatrix(transform)
    } else {
        shader2d.setModelMatrix(modelMatrix)
    }
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.enableVertexAttribArray(shader2d.positionLocation)
    gl.vertexAttribPointer(shader2d.positionLocation, 2, gl.FLOAT, false, 0, 0)

    const rgb = color || [0.2, 0.4, 0.8]
    const rgb2 = [rgb[0] / 2, rgb[1] / 2, rgb[2] / 2]
    
    shader2d.setColor(rgb[0], rgb[1], rgb[2], 1)
    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0)

    shader2d.setColor(rgb2[0], rgb2[1], rgb2[2], 1)
    gl.drawElements(gl.LINES, count * 2, gl.UNSIGNED_SHORT, count * Uint16Array.BYTES_PER_ELEMENT)

    gl.disableVertexAttribArray(shader2d.positionLocation)
}