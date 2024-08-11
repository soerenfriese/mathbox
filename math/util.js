import * as vector_operations from './vector-operations.js'
import * as matrix_operations from './matrix-operations.js'

const cartesian2gl = Object.freeze([[1, 0, 0], [0, 0, -1], [0, 1, 0]].map(Object.freeze))

function clamp(x, min, max) {
    return x > max ? max : (x < min ? min : x)
}

function clampf(y, min, max) {
    return (y - min) / (max - min)
}

function bounce(t) {
    return clamp(1.5 - Math.abs(t % 4 - 2.5), 0, 1)
}

function lerp(s, e, t) {
    if (Array.isArray(s)) {
        let a = []

        for (let i = 0; i < s.length; ++i) {
            a[i] = lerp(s[i], e[i], t)
        }

        return a
    } else {
        return s + t * (e - s)
    }
}

function smoothstep(s, e, t) {
    return lerp(s, e, 3 * t * t - 2 * t * t * t)
}

function mat2_rot(t) {
    return [[Math.cos(t), -Math.sin(t)], [Math.sin(t), Math.cos(t)]]
}

function mat3_rot(v, t) {
    const l = Math.hypot(...v)

    const x = v[0] / l
    const y = v[1] / l
    const z = v[2] / l
    const sin = Math.sin(t)
    const cos = Math.cos(t)

    const m00 = cos + (x * x) * (1 - cos);
    const m01 = x * y * (1 - cos) - z * sin;
    const m02 = x * z * (1 - cos) + y * sin;

    const m10 = y * x * (1 - cos) + z * sin;
    const m11 = cos + (y * y) * (1 - cos);
    const m12 = y * z * (1 - cos) - x * sin;

    const m20 = z * x * (1 - cos) - y * sin;
    const m21 = z * y * (1 - cos) + x * sin;
    const m22 = cos + (z * z) * (1 - cos);

    return [[m00, m01, m02], [m10, m11, m12], [m20, m21, m22]]
}

function mod(n, d) {
    return ((n % d) + d) % d
}

function vec2_rlerp(s, e, t) {
    if ((s[0] === 0 && s[1] === 0) || (e[0] === 0 && e[1] === 0)) {
        return lerp(s, e, t)
    } else {
        const s_length = Math.hypot(s[0], s[1])
        const e_length = Math.hypot(e[0], e[1])
        
        const delta_angle = mod(Math.atan2(e[1], e[0]) - Math.atan2(s[1], s[0]), 2 * Math.PI)
        const angle = lerp(0, delta_angle, t)
        const m = mat2_rot(angle)

        const scale_factor = lerp(1, e_length / s_length, t)

        return matrix_operations.apply(m, vector_operations.scale(scale_factor, s))
    }
}

function vec3_rlerp(s, e, t) {
    if ((s[0] === 0 && s[1] === 0 && s[2] === 0) || (e[0] === 0 && e[1] === 0 && s[2] === 0)) {
        return lerp(s, e, t)
    } else {
        let axis = vector_operations.cross(s, e)

        const s_length = Math.hypot(s[0], s[1], s[2])
        const e_length = Math.hypot(e[0], e[1], e[2])
        
        if (axis[0] === 0 && axis[1] === 0 && axis[2] === 0) {
            const y_rotation = Math.asin(s[2] / s_length)
            const z_rotation = Math.atan2(s[1], s[0])
        
            axis = [0, 0, 1]
            glMatrix.vec3.rotateY(axis, axis, [0, 0, 0], -y_rotation)
            glMatrix.vec3.rotateZ(axis, axis, [0, 0, 0], z_rotation)
        }

        const delta_angle = Math.acos(vector_operations.dot(s, e) / (s_length * e_length))
        const angle = lerp(0, delta_angle, t)
        const m = mat3_rot(axis, angle)

        const scale_factor = lerp(1, e_length / s_length, t)

        return matrix_operations.apply(m, vector_operations.scale(scale_factor, s))
    }
}

function mat2_rlerp(s, e, t) {
    const i1 = [s[0][0], s[1][0]]
    const j1 = [s[0][1], s[1][1]]

    const i2 = [e[0][0], e[1][0]]
    const j2 = [e[0][1], e[1][1]]

    const i3 = vec2_rlerp(i1, i2, t)
    const j3 = vec2_rlerp(j1, j2, t)

    return [[i3[0], j3[0]], [i3[1], j3[1]]]
}

function mat3_rlerp(s, e, t) {
    const i1 = [s[0][0], s[1][0], s[2][0]]
    const j1 = [s[0][1], s[1][1], s[2][1]]
    const k1 = [s[0][2], s[1][2], s[2][2]]

    const i2 = [e[0][0], e[1][0], e[2][0]]
    const j2 = [e[0][1], e[1][1], e[2][1]]
    const k2 = [e[0][2], e[1][2], e[2][2]]

    const i3 = vec3_rlerp(i1, i2, t)
    const j3 = vec3_rlerp(j1, j2, t)
    const k3 = vec3_rlerp(k1, k2, t)

    return [[i3[0], j3[0], k3[0]], [i3[1], j3[1], k3[1]], [i3[2], j3[2], k3[2]]]
}

export const args = Object.freeze({
    cartesian2gl: cartesian2gl,
    clamp: clamp,
    clampf: clampf,
    bounce: bounce,
    lerp: lerp,
    smoothstep: smoothstep,
    mat2_rot: mat2_rot,
    mat3_rot: mat3_rot,
    vec2_rlerp: vec2_rlerp,
    vec3_rlerp: vec3_rlerp,
    mat2_rlerp: mat2_rlerp,
    mat3_rlerp: mat3_rlerp
})