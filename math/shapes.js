import * as vectors from './vectors.js'
import * as subdivison from './subdivison.js'
import * as obj from './obj.js'

function createQuad(v0, v1, v2, v3) {
    if (!vectors.isVec3(v0)) throw new TypeError('createQuad: v0 is not of type \'vec3\'')
    if (!vectors.isVec3(v1)) throw new TypeError('createQuad: v1 is not of type \'vec3\'')
    if (!vectors.isVec3(v2)) throw new TypeError('createQuad: v2 is not of type \'vec3\'')
    if (!vectors.isVec3(v3)) throw new TypeError('createQuad: v3 is not of type \'vec3\'')

    const vertices = [v0, v1, v2, v3]

    const indices = [
        [0, 1, 2],
        [2, 3, 0]
    ]

    return {vertices: vertices, indices: indices}
}

function createCube(position, width, depth, height) {
    if (!vectors.isVec3(position)) throw new TypeError('createCube: position is not of type \'vec3\'')
    if (!Number.isFinite(width)) throw new TypeError('createCube: width is not of type \'number\'')
    if (!Number.isFinite(depth)) throw new TypeError('createCube: depth is not of type \'number\'')
    if (!Number.isFinite(height)) throw new TypeError('createCube: height is not of type \'number\'')
    if (width < 0) throw new TypeError('createCube: width must be at least 0')
    if (depth < 0) throw new TypeError('createCube: depth must be at least 0')
    if (height < 0) throw new TypeError('createCube: height must be at least 0')
    
    const vertices = [
        [position[0] + 0,     position[1] + 0,     position[2] + 0     ],
        [position[0] + width, position[1] + 0,     position[2] + 0     ],
        [position[0] + width, position[1] + depth, position[2] + 0     ],
        [position[0] + 0,     position[1] + depth, position[2] + 0     ],
        [position[0] + 0,     position[1] + 0,     position[2] + height],
        [position[0] + width, position[1] + 0,     position[2] + height],
        [position[0] + width, position[1] + depth, position[2] + height],
        [position[0] + 0,     position[1] + depth, position[2] + height]
    ]

    const indices = [
        [0, 1, 5],
        [5, 4, 0],
        [1, 2, 6],
        [6, 5, 1],
        [2, 3, 7],
        [7, 6, 2],
        [3, 0, 4],
        [4, 7, 3],
        [4, 5, 6],
        [6, 7, 4],
        [3, 2, 1],
        [1, 0, 3]
    ]

    return {vertices: vertices, indices: indices}
}

function createSphere(position, radius, resolution = 3) {
    if (!vectors.isVec3(position)) throw new TypeError('createSphere:position is not of type \'vec3\'')
    if (!Number.isFinite(radius)) throw new TypeError('createSphere: radius is not of type \'number\'')
    if (radius < 0) throw new TypeError('createSphere: radius must be at least 0')
    if (!Number.isFinite(resolution)) throw new TypeError('createSphere: resolution is not of type \'number\'')
    if (resolution < 0) throw new TypeError('createSphere: resolution must be at least 0')

    const v3s = [
        [-1, -1,  0],
        [ 1, -1,  0],
        [ 1,  1,  0],
        [-1,  1,  0],
        [ 0,  0, -1],
        [ 0,  0,  1]
    ]
    
    const i3s = [
        [0, 1, 5],
        [1, 2, 5],
        [2, 3, 5],
        [3, 0, 5],
        [0, 4, 1],
        [1, 4, 2],
        [2, 4, 3],
        [3, 4, 0]
    ]

    const { vertices, indices } = subdivison.apply(v3s, i3s, resolution)
    
    for (let i = 0; i < vertices.length; ++i) {
        const v = vertices[i]
        const l = radius / Math.hypot(v[0], v[1], v[2])

        vertices[i] = [position[0] + v[0] * l, position[1] + v[1] * l, position[2] + v[2] * l]
    }
    
    return {vertices: vertices, indices: indices}
}

function fromOBJ(source) {
    if (!(typeof source === 'string' || source instanceof String)) throw new TypeError('fromOBJ: source is not of type \'string\'')

    return obj.obj(source)
}

export const args = Object.freeze({
    createQuad: createQuad,
    createCube: createCube,
    createSphere: createSphere,
    fromOBJ: fromOBJ
})