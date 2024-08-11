import * as gl_js from '../gl.js'

const vertexShader = 
`#version 300 es

layout(location=0) in vec3 position;
layout(location=1) in vec3 normal;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

out vec3 fragmentPosition;
out vec3 fragmentNormal;

void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

    fragmentPosition = vec3(modelMatrix * vec4(position, 1.0));
    fragmentNormal = mat3(transpose(inverse(modelMatrix))) * normal;
}`

const fragmentShader = 
`#version 300 es

precision mediump float;

in vec3 fragmentPosition;
in vec3 fragmentNormal;

uniform vec4 color;
uniform vec3 lightColor;
uniform vec3 viewerPosition;
uniform vec3 lightDirection;

out vec4 fragColor;

void main() {
    float ambientStrength = 0.1;
    vec3 ambient = ambientStrength * lightColor;

    vec3 n1 = normalize(fragmentNormal);
    vec3 n2 = normalize(-lightDirection);
    float d1 = max(dot(n1, n2), 0.0);
    vec3 diffuse = d1 * lightColor;

    float specularStrength = sign(d1) * 0.5;
    vec3 viewDirection = normalize(viewerPosition - fragmentPosition);
    vec3 reflectDirection = reflect(-n2, n1);
    float d2 = max(dot(viewDirection, reflectDirection), 0.0);
    vec3 specular = specularStrength * pow(d2, 32.0) * lightColor;

    vec3 lighting = (ambient + diffuse + specular) * color.rgb;

    fragColor = vec4(lighting, color.a);
}`

let gl
let program

export const positionLocation = 0
export const normalLocation = 1

let projectionMatrixLocation
let viewMatrixLocation
let modelMatrixLocation
let colorLocation
let lightColorLocation
let viewerPositionLocation
let lightDirectionLocation

export function load(_gl) {
    gl = _gl

    program = gl_js.loadProgram(gl, vertexShader, fragmentShader)

    gl.useProgram(program)
    
    projectionMatrixLocation = gl.getUniformLocation(program, 'projectionMatrix')
    viewMatrixLocation = gl.getUniformLocation(program, 'viewMatrix')
    modelMatrixLocation = gl.getUniformLocation(program, 'modelMatrix')
    colorLocation = gl.getUniformLocation(program, 'color')
    lightColorLocation = gl.getUniformLocation(program, 'lightColor')
    viewerPositionLocation = gl.getUniformLocation(program, 'viewerPosition')
    lightDirectionLocation = gl.getUniformLocation(program, 'lightDirection')

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

export function setLightColor(r, g, b) {
    gl.uniform3fv(lightColorLocation, [r, g, b])
}

export function setViewerPosition(x, y, z) {
    gl.uniform3fv(viewerPositionLocation, [x, y, z])
}

export function setLightDirection(x, y, z) {
    gl.uniform3fv(lightDirectionLocation, [x, y, z])
}