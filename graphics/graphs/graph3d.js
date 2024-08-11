import * as shader3d from '../shaders/shader3d.js'
import * as instanced3d from '../shaders/instanced3d.js'
import * as shaded3d from '../shaders/shaded3d.js'
import * as dynamic_buffers from '../dynamic-buffers.js'

const vectorVertices = [[-0.2, -0.0375, -0.0375], [-0.2,  0.0375, -0.0375], [-0.2,  0.0375,  0.0375], [-0.2, -0.0375,  0.0375], [0, 0, 0]]
const vectorIndices = [[0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4], [0, 2, 1], [0, 3, 2]]

let projectionMatrix = null
let viewMatrix = null
let modelMatrix = null
let gl2cartesian = null
let vectorVertexBuffer = null
let vectorIndexBuffer = null
let instanceMatrixBuffer = null

export function init(gl) {
    projectionMatrix = glMatrix.mat4.create()
    viewMatrix = glMatrix.mat4.create()
    modelMatrix = glMatrix.mat4.create()
    gl2cartesian = glMatrix.mat4.fromValues(1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1)

    const vectorArrays = dynamic_buffers.polyhedronWeightedNormals({
        vertices: vectorVertices,
        indices: vectorIndices
    })

    vectorVertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vectorVertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vectorArrays.vertexBuffer, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    vectorIndexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vectorIndexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, vectorArrays.indexBuffer, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

    instanceMatrixBuffer = gl.createBuffer()
}

export function render(gl, width, height, color, renderStyle, graph, camera) {
    color = renderStyle === 1 ? 0 : color

    const fill = 1 - color

    gl.viewport(0, 0, width, height)
    gl.clearColor(color, color, color, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)
    
    gl.cullFace(gl.FRONT)
    gl.frontFace(gl.CW)

    glMatrix.mat4.identity(projectionMatrix)
    glMatrix.mat4.perspective(projectionMatrix, camera.fov, width / height, 0.05, 1024)

    glMatrix.mat4.identity(viewMatrix)
    glMatrix.mat4.multiply(viewMatrix, viewMatrix, gl2cartesian)
    glMatrix.mat4.translate(viewMatrix, viewMatrix, [0, camera.zoom, 0])
    glMatrix.mat4.rotateY(viewMatrix, viewMatrix, camera.roll)
    glMatrix.mat4.rotateX(viewMatrix, viewMatrix, camera.pitch)
    glMatrix.mat4.rotateZ(viewMatrix, viewMatrix, camera.yaw)
    glMatrix.mat4.translate(viewMatrix, viewMatrix, [-camera.x, -camera.y, -camera.z])

    glMatrix.mat4.identity(modelMatrix)
    
    if (graph.transformation !== null) {
        const m = graph.transformation

        const transform = glMatrix.mat4.fromValues(m[0][0], m[1][0], m[2][0], 0, m[0][1], m[1][1], m[2][1], 0, m[0][2], m[1][2], m[2][2], 0, 0, 0, 0, 1)
        glMatrix.mat4.multiply(modelMatrix, modelMatrix, transform)
    }
    
    shader3d.use()
    shader3d.setProjectionMatrix(projectionMatrix)
    shader3d.setViewMatrix(viewMatrix)
    shader3d.setModelMatrix(modelMatrix)

    instanced3d.use()
    instanced3d.setProjectionMatrix(projectionMatrix)
    instanced3d.setViewMatrix(viewMatrix)
    instanced3d.setModelMatrix(modelMatrix)

    const viewerPosition = glMatrix.vec3.fromValues(0,  -camera.zoom, 0)
    glMatrix.vec3.rotateX(viewerPosition, viewerPosition, [0, 0, 0], -camera.pitch)
    glMatrix.vec3.rotateZ(viewerPosition, viewerPosition, [0, 0, 0], -camera.yaw)
    glMatrix.vec3.add(viewerPosition, viewerPosition, [camera.x, camera.y, camera.z])

    const lightDirection = graph.lightDirection

    shaded3d.use()
    shaded3d.setProjectionMatrix(projectionMatrix)
    shaded3d.setViewMatrix(viewMatrix)
    shaded3d.setModelMatrix(modelMatrix)
    shaded3d.setLightColor(1, 1, 1)
    shaded3d.setViewerPosition(viewerPosition[0], viewerPosition[1], viewerPosition[2])
    shaded3d.setLightDirection(lightDirection[0], lightDirection[1], lightDirection[2])
    
    drawGrid(gl, fill, 6, graph)

    if (graph.lines.length !== 0) {
        drawLines(gl, fill, graph.lines)
    }

    if (graph.vectors.length !== 0) {
        drawVectors(gl, fill, graph.vectors)
    }

    if (graph.shapes.length !== 0) {
        if (renderStyle === 1) {
            drawPolyhedra_Lighting(gl, modelMatrix, graph.shapes)
        } else {
            drawPolyhedra_Geometry(gl, modelMatrix, graph.shapes)
        }
    }
    
    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.CULL_FACE)
}

function drawGrid(gl, fill, gridSize, graph) {
    shader3d.use()
    shader3d.setColor(0.5, 0.5, 0.5, 1)

    if (graph.showGrid) {
        for (let i = -gridSize; i <= gridSize; ++i) {
            if (graph.showAxis && i === 0) continue
            shader3d.vertex(i, -gridSize, 0)
            shader3d.vertex(i,  gridSize, 0)
            shader3d.vertex(-gridSize, i, 0)
            shader3d.vertex( gridSize, i, 0)
        }

        shader3d.draw(gl.LINES)
    }

    if (graph.showAxis) {
        if (graph.showGrid) {
            shader3d.setColor(fill, fill, fill, 1)
            shader3d.vertex(-gridSize, 0, 0)
            shader3d.vertex(0, 0, 0)
            shader3d.vertex(1, 0, 0)
            shader3d.vertex(gridSize, 0, 0)
            shader3d.vertex(0, -gridSize, 0)
            shader3d.vertex(0, 0, 0)
            shader3d.vertex(0, 1, 0)
            shader3d.vertex(0, gridSize, 0)
            shader3d.draw(gl.LINES)
        }
        
        shader3d.setColor(1, 0, 0, 1)
        shader3d.vertex(0, 0, 0)
        shader3d.vertex(1, 0, 0)
        shader3d.draw(gl.LINES)

        shader3d.setColor(0, 1, 0, 1)
        shader3d.vertex(0, 0, 0)
        shader3d.vertex(0, 1, 0)
        shader3d.draw(gl.LINES)

        shader3d.setColor(0, 0, 1, 1)
        shader3d.vertex(0, 0, 0)
        shader3d.vertex(0, 0, 1)
        shader3d.draw(gl.LINES)
    }
}

function drawLines(gl, fill, lines) {
    shader3d.use()
    shader3d.setColor(fill, fill, fill, 1)

    for (let i = 0; i < lines.length; ++i) {
        const line = lines[i]

        for (let j = 0; j < line.length; ++j) {
            const point = line[j]
            shader3d.vertex(point[0], point[1], point[2])
        }

        shader3d.draw(gl.LINE_STRIP)
    }
}

function drawVectors(gl, fill, vectors) {
    shader3d.use()
    shader3d.setColor(fill, fill, fill, 1)

    const instances = vectors.length
    const instanceMatrices = new Float32Array(instances * 16)

    for (let i = 0; i < vectors.length; ++i) {
        const v = vectors[i]
        const start = v[0]
        const end = v[1]
        shader3d.vertex(start[0], start[1], start[2])
        shader3d.vertex(end[0], end[1], end[2])

        const instanceMatrix = glMatrix.mat4.create()

        const x = end[0] - start[0]
        const y = end[1] - start[1]
        const z = end[2] - start[2]

        if (x === 0 && y === 0 && z === 0) {
            glMatrix.mat4.scale(instanceMatrix, instanceMatrix, [0, 0, 0])
        } else {
            const length = Math.hypot(x, y, z)
            const scale = 2 * Math.min(length, 2 * 0.2)
            const z_rotation = Math.atan2(y, x)
            const y_rotation = Math.asin(z / length)
            glMatrix.mat4.translate(instanceMatrix, instanceMatrix, [end[0], end[1], end[2]])
            glMatrix.mat4.rotateZ(instanceMatrix, instanceMatrix, z_rotation)
            glMatrix.mat4.rotateY(instanceMatrix, instanceMatrix, -y_rotation)
            glMatrix.mat4.scale(instanceMatrix, instanceMatrix, [scale, (scale + 1) / 2 , (scale + 1) / 2])
        }

        instanceMatrices.set(instanceMatrix, i * 16)
    }

    shader3d.draw(gl.LINES)

    instanced3d.use()

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vectorIndexBuffer)

    gl.bindBuffer(gl.ARRAY_BUFFER, vectorVertexBuffer)
    gl.enableVertexAttribArray(instanced3d.positionLocation)
    gl.vertexAttribPointer(instanced3d.positionLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, instanceMatrixBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, instanceMatrices, gl.DYNAMIC_DRAW)
    const stride = 16 * Float32Array.BYTES_PER_ELEMENT
    for (let i = 0; i < 4; ++i) {
        const location = instanced3d.instanceMatrixLocation + i
        const offset = i * 4 * Float32Array.BYTES_PER_ELEMENT
        gl.enableVertexAttribArray(location)
        gl.vertexAttribPointer(location, 4, gl.FLOAT, false, stride, offset)
        gl.vertexAttribDivisor(location, 1)
    }
        
    instanced3d.setColor(0, 0, 0, 1)
    gl.drawElementsInstanced(gl.LINE_LOOP, 18, gl.UNSIGNED_SHORT, 0, instances)

    gl.enable(gl.POLYGON_OFFSET_FILL)
    gl.polygonOffset(1.0, 1.0)
    instanced3d.setColor(1, 1, 1, 1)
    gl.drawElementsInstanced(gl.TRIANGLES, 18, gl.UNSIGNED_SHORT, 0, instances)
    gl.disable(gl.POLYGON_OFFSET_FILL)

    gl.disableVertexAttribArray(instanced3d.positionLocation)

    for (let i = 0; i < 4; ++i) {
        const location = instanced3d.instanceMatrixLocation + i
        gl.disableVertexAttribArray(location)
        gl.vertexAttribDivisor(location, 0)
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
}

function drawPolyhedra_Geometry(gl, modelMatrix, shapes) {
    shader3d.use()

    for (let i = 0; i < shapes.length; ++i) {
        const shape = shapes[i]

        if (shape !== undefined) {
            const data = dynamic_buffers.get(shape.index)

            drawPolyhedron_Geometry(gl, modelMatrix, shape.color, shape.matrix, data.vertexBuffer, data.indexBuffer, data.count)
        }
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
}

function drawPolyhedra_Lighting(gl, modelMatrix, shapes) {
    shaded3d.use()

    for (let i = 0; i < shapes.length; ++i) {
        const shape = shapes[i]

        if (shape !== undefined) {
            const data = dynamic_buffers.get(shape.index)

            drawPolyhedron_Lighting(gl, modelMatrix, shape.color, shape.matrix, data.vertexBuffer, data.indexBuffer, data.count)
        }
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
}

function drawPolyhedron_Geometry(gl, modelMatrix, color, matrix, vertexBuffer, indexBuffer, count) {
    if (matrix !== null) {
        const transform = glMatrix.mat4.fromValues(matrix[0][0], matrix[1][0], matrix[2][0], 0, matrix[0][1], matrix[1][1], matrix[2][1], 0, matrix[0][2], matrix[1][2], matrix[2][2], 0, matrix[0][3] || 0, matrix[1][3] || 0, matrix[2][3] || 0, 1)
        glMatrix.mat4.multiply(transform, modelMatrix, transform)
        shader3d.setModelMatrix(transform)
    } else {
        shader3d.setModelMatrix(modelMatrix)
    }
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.enableVertexAttribArray(shader3d.positionLocation)
    gl.vertexAttribPointer(shader3d.positionLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0)

    const rgb = color || [0.2, 0.4, 0.8]
    const rgb2 = [rgb[0] / 2, rgb[1] / 2, rgb[2] / 2]

    shader3d.setColor(rgb2[0], rgb2[1], rgb2[2], 1)
    gl.drawElements(gl.LINES, count * 2, gl.UNSIGNED_SHORT, count * Uint16Array.BYTES_PER_ELEMENT)

    shader3d.setColor(rgb[0], rgb[1], rgb[2], 1)
    gl.enable(gl.POLYGON_OFFSET_FILL)
    gl.polygonOffset(1.0, 1.0)
    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0)
    gl.disable(gl.POLYGON_OFFSET_FILL)

    gl.disableVertexAttribArray(shader3d.positionLocation)
}

function drawPolyhedron_Lighting(gl, modelMatrix, color, matrix, vertexBuffer, indexBuffer, count) {
    if (matrix !== null) {
        const transform = glMatrix.mat4.fromValues(matrix[0][0], matrix[1][0], matrix[2][0], 0, matrix[0][1], matrix[1][1], matrix[2][1], 0, matrix[0][2], matrix[1][2], matrix[2][2], 0, matrix[0][3] || 0, matrix[1][3] || 0, matrix[2][3] || 0, 1)
        glMatrix.mat4.multiply(transform, modelMatrix, transform)
        shaded3d.setModelMatrix(transform)
    } else {
        shaded3d.setModelMatrix(modelMatrix)
    }
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.enableVertexAttribArray(shaded3d.positionLocation)
    gl.vertexAttribPointer(shaded3d.positionLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0)
    gl.enableVertexAttribArray(shaded3d.normalLocation)
    gl.vertexAttribPointer(shaded3d.normalLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT)

    const rgb = color || [0.5, 0.5, 0.5]

    shaded3d.setColor(rgb[0], rgb[1], rgb[2], 1)
    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0)

    gl.disableVertexAttribArray(shaded3d.positionLocation)
    gl.disableVertexAttribArray(shaded3d.normalLocation)
}