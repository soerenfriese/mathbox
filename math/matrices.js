import * as vectors from './vectors.js'

export function isMatrix(m) {
    return Array.isArray(m) && m.length > 0 && m.every((row) => {
        return Array.isArray(row) && row.length === m[0].length && row.every(Number.isFinite)
    })
}

export function isMat2(m) {
    return Array.isArray(m) && m.length === 2 && m.every((row) => {
        return Array.isArray(row) && row.length === 2 && row.every(Number.isFinite)
    }) 
}

export function isMat3(m) {
    return Array.isArray(m) && m.length === 3 && m.every((row) => {
        return Array.isArray(row) && row.length === 3 && row.every(Number.isFinite)
    }) 
}

export function isMat4(m) {
    return Array.isArray(m) && m.length === 4 && m.every((row) => {
        return Array.isArray(row) && row.length === 4 && row.every(Number.isFinite)
    }) 
}

function mat2(arg1, arg2, arg3, arg4) {
    switch (arguments.length) {
        case 0:
            return [[1, 0], [0, 1]]
        case 1:
            if (!Number.isFinite(arg1)) throw new TypeError('mat2: parameter 1 is not of type \'number\'')

            return [[arg1, 0], [0, arg1]]
        case 2:
            if (Number.isFinite(arg1) && Number.isFinite(arg2)) {
                return [[arg1, 0], [0, arg2]]
            } else if (vectors.isVec2(arg1) && vectors.isVec2(arg2)) {
                return [[arg1[0], arg2[0]], [arg1[1], arg2[1]]]
            } else {
                throw new TypeError('mat2: parameters must be of same type, either \'number\' or \'vec2\'')
            }
        case 4:
            if (!Number.isFinite(arg1)) throw new TypeError('mat2: parameter 1 is not of type \'number\'')
            if (!Number.isFinite(arg2)) throw new TypeError('mat2: parameter 2 is not of type \'number\'')
            if (!Number.isFinite(arg3)) throw new TypeError('mat2: parameter 3 is not of type \'number\'')
            if (!Number.isFinite(arg4)) throw new TypeError('mat2: parameter 4 is not of type \'number\'')

            return [[arg1, arg2], [arg3, arg4]]
        default:
            throw new Error('mat2: incompatible amount of arguments')
    }
}

function mat3(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
    switch (arguments.length) {
        case 0:
            return [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
        case 1:
            if (!Number.isFinite(arg1)) throw new TypeError('mat3: parameter 1 is not of type \'number\'')

            return [[arg1, 0, 0], [0, arg1, 0], [0, 0, arg1]]
        case 3:
            if (Number.isFinite(arg1) && Number.isFinite(arg2) && Number.isFinite(arg3)) {
                return [[arg1, 0, 0], [0, arg2, 0], [0, 0, arg3]]
            } else if (vectors.isVec3(arg1) && vectors.isVec3(arg2) && vectors.isVec3(arg3)) {
                return [[arg1[0], arg2[0], arg3[0]], [arg1[1], arg2[1], arg3[1]], [arg1[2], arg2[2], arg3[2]]]
            } else {
                throw new TypeError('mat3: parameters must be of same type, either \'number\' or \'vec3\'')
            }
        case 9:
            if (!Number.isFinite(arg1)) throw new TypeError('mat3: parameter 1 is not of type \'number\'')
            if (!Number.isFinite(arg2)) throw new TypeError('mat3: parameter 2 is not of type \'number\'')
            if (!Number.isFinite(arg3)) throw new TypeError('mat3: parameter 3 is not of type \'number\'')
            if (!Number.isFinite(arg4)) throw new TypeError('mat3: parameter 4 is not of type \'number\'')
            if (!Number.isFinite(arg5)) throw new TypeError('mat3: parameter 5 is not of type \'number\'')
            if (!Number.isFinite(arg6)) throw new TypeError('mat3: parameter 6 is not of type \'number\'')
            if (!Number.isFinite(arg7)) throw new TypeError('mat3: parameter 7 is not of type \'number\'')
            if (!Number.isFinite(arg8)) throw new TypeError('mat3: parameter 8 is not of type \'number\'')
            if (!Number.isFinite(arg9)) throw new TypeError('mat3: parameter 9 is not of type \'number\'')

            return [[arg1, arg2, arg3], [arg4, arg5, arg6], [arg7, arg8, arg9]]
        default:
            throw new Error('mat3: incompatible amount of arguments')
    }
}

function mat4(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11, arg12, arg13, arg14, arg15, arg16) {
    switch (arguments.length) {
        case 0:
            return [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]
        case 1:
            if (!Number.isFinite(arg1)) throw new TypeError('mat4: parameter 1 is not of type \'number\'')

            return [[arg1, 0, 0, 0], [0, arg1, 0, 0], [0, 0, arg1, 0], [0, 0, 0, arg1]]
        case 4:
            if (Number.isFinite(arg1) && Number.isFinite(arg2) && Number.isFinite(arg3) && Number.isFinite(arg4)) {
                return [[arg1, 0, 0, 0], [0, arg2, 0, 0], [0, 0, arg3, 0], [0, 0, 0, arg4]]
            } else if (vectors.isVec4(arg1) && vectors.isVec4(arg2) && vectors.isVec4(arg3) && vectors.isVec4(arg4)) {
                return [[arg1[0], arg2[0], arg3[0], arg4[0]], [arg1[1], arg2[1], arg3[1], arg4[1]], [arg1[2], arg2[2], arg3[2], arg4[2]], [arg1[3], arg2[3], arg3[3], arg4[3]]]
            } else {
                throw new TypeError('mat4: parameters must be of same type, either \'number\' or \'vec4\'')
            }
        case 16:
            if (!Number.isFinite(arg1)) throw new TypeError('mat4: parameter 1 is not of type \'number\'')
            if (!Number.isFinite(arg2)) throw new TypeError('mat4: parameter 2 is not of type \'number\'')
            if (!Number.isFinite(arg3)) throw new TypeError('mat4: parameter 3 is not of type \'number\'')
            if (!Number.isFinite(arg4)) throw new TypeError('mat4: parameter 4 is not of type \'number\'')
            if (!Number.isFinite(arg5)) throw new TypeError('mat4: parameter 5 is not of type \'number\'')
            if (!Number.isFinite(arg6)) throw new TypeError('mat4: parameter 6 is not of type \'number\'')
            if (!Number.isFinite(arg7)) throw new TypeError('mat4: parameter 7 is not of type \'number\'')
            if (!Number.isFinite(arg8)) throw new TypeError('mat4: parameter 8 is not of type \'number\'')
            if (!Number.isFinite(arg9)) throw new TypeError('mat4: parameter 9 is not of type \'number\'')
            if (!Number.isFinite(arg10)) throw new TypeError('mat4: parameter 10 is not of type \'number\'')
            if (!Number.isFinite(arg11)) throw new TypeError('mat4: parameter 11 is not of type \'number\'')
            if (!Number.isFinite(arg12)) throw new TypeError('mat4: parameter 12 is not of type \'number\'')
            if (!Number.isFinite(arg13)) throw new TypeError('mat4: parameter 13 is not of type \'number\'')
            if (!Number.isFinite(arg14)) throw new TypeError('mat4: parameter 14 is not of type \'number\'')
            if (!Number.isFinite(arg15)) throw new TypeError('mat4: parameter 15 is not of type \'number\'')
            if (!Number.isFinite(arg16)) throw new TypeError('mat4: parameter 16 is not of type \'number\'')

            return [[arg1, arg2, arg3, arg4], [arg5, arg6, arg7, arg8], [arg9, arg10, arg11, arg12], [arg13, arg14, arg15, arg16]]
        default:
            throw new Error('mat4: incompatible amount of arguments')
    }
}

export const args = Object.freeze({
    mat2: mat2,
    mat3: mat3,
    mat4: mat4
})