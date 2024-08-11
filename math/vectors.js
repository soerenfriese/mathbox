export function isVector(v) {
    return Array.isArray(v) && v.length > 0 && v.every(Number.isFinite)
}

export function isVec2(v) {
    return Array.isArray(v) && v.length === 2 && v.every(Number.isFinite)
}

export function isVec3(v) {
    return Array.isArray(v) && v.length === 3 && v.every(Number.isFinite)
}

export function isVec4(v) {
    return Array.isArray(v) && v.length === 4 && v.every(Number.isFinite)
}

function vec2(a1, a2) {
    switch (arguments.length) {
        case 0:
            return [0, 0]
        case 1:
            if (!Number.isFinite(a1)) throw new TypeError('vec2: parameter 1 is not of type \'number\'')
            
            return [a1, a1]
        case 2:
            if (!Number.isFinite(a1)) throw new TypeError('vec2: parameter 1 is not of type \'number\'')
            if (!Number.isFinite(a2)) throw new TypeError('vec2: parameter 2 is not of type \'number\'')
            
            return [a1, a2]
        default:
            throw new Error('vec2: incompatible amount of arguments')
    }
}

function vec3(a1, a2, a3) {
    switch (arguments.length) {
        case 0:
            return [0, 0, 0]
        case 1:
            if (!Number.isFinite(a1)) throw new TypeError('vec3: parameter 1 is not of type \'number\'')
            
            return [a1, a1, a1]
        case 3:
            if (!Number.isFinite(a1)) throw new TypeError('vec3: parameter 1 is not of type \'number\'')
            if (!Number.isFinite(a2)) throw new TypeError('vec3: parameter 2 is not of type \'number\'')
            if (!Number.isFinite(a3)) throw new TypeError('vec3: parameter 3 is not of type \'number\'')
            
            return [a1, a2, a3]
        default:
            throw new Error('vec3: incompatible amount of arguments')
    }
}

function vec4(a1, a2, a3, a4) {
    switch (arguments.length) {
        case 0:
            return [0, 0, 0, 0]
        case 1:
            if (!Number.isFinite(a1)) throw new TypeError('vec4: parameter 1 is not of type \'number\'')
            
            return [a1, a1, a1, a1]
        case 4:
            if (!Number.isFinite(a1)) throw new TypeError('vec4: parameter 1 is not of type \'number\'')
            if (!Number.isFinite(a2)) throw new TypeError('vec4: parameter 2 is not of type \'number\'')
            if (!Number.isFinite(a3)) throw new TypeError('vec4: parameter 3 is not of type \'number\'')
            if (!Number.isFinite(a4)) throw new TypeError('vec4: parameter 4 is not of type \'number\'')
            
            return [a1, a2, a3, a4]
        default:
            throw new Error('vec4: incompatible amount of arguments')
    }
}

export const args = Object.freeze({
    vec2: vec2,
    vec3: vec3,
    vec4: vec4
})