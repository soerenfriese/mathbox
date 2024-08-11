import * as gl_js from '../gl.js'

const vertexShader = 
`#version 300 es

layout(location=0) in vec2 position;
layout(location=1) in mat4 instanceMatrix;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 0.0, 1.0);
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
export const instanceMatrixLocation = 1

let projectionMatrixLocation
let viewMatrixLocation
let modelMatrixLocation
let colorLocation

export function load(_gl) {
    gl = _gl

    program = gl_js.loadProgram(gl, vertexShader, fragmentShader)

    gl.useProgram(program)
    
    projectionMatrixLocation = gl.getUniformLocation(program, 'projectionMatrix')
    viewMatrixLocation = gl.getUniformLocation(program, 'viewMatrix')
    modelMatrixLocation = gl.getUniformLocation(program, 'modelMatrix')
    colorLocation = gl.getUniformLocation(program, 'color')
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