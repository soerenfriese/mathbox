import * as gl_js from '../gl.js'

const vertexShader = 
`#version 300 es

layout(location=0) in vec3 position;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}`

const fragmentShader = 
`#version 300 es

precision mediump float;

uniform vec4 color;

out vec4 fragColor;

void main() {
    fragColor = color;
}`

let gl
let program

export const positionLocation = 0
const positionData = []
let positionBuffer

let projectionMatrixLocation
let viewMatrixLocation
let modelMatrixLocation
let colorLocation

let vertices = 0

export function load(_gl) {
    gl = _gl

    program = gl_js.loadProgram(gl, vertexShader, fragmentShader)

    gl.useProgram(program)
    
    projectionMatrixLocation = gl.getUniformLocation(program, 'projectionMatrix')
    viewMatrixLocation = gl.getUniformLocation(program, 'viewMatrix')
    modelMatrixLocation = gl.getUniformLocation(program, 'modelMatrix')
    colorLocation = gl.getUniformLocation(program, 'color')

    positionBuffer = gl.createBuffer()
}

export function use() {
    gl.useProgram(program)
}

export function setProjectionMatrix(projectionMatrix) {
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix)
}

export function setViewMatrix(viewMatrix) {
    gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix)
}

export function setModelMatrix(modelMatrix) {
    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix)
}

export function setColor(r, g, b, a) {
    gl.uniform4fv(colorLocation, [r, g, b, a])
}

export function vertex(x, y, z) {
    positionData.push(x, y, z)
    ++vertices
}

export function draw(mode) {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionData), gl.DYNAMIC_DRAW)
    
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0)

    gl.drawArrays(mode, 0, vertices)

    gl.disableVertexAttribArray(positionLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    positionData.length = 0
    vertices = 0
}