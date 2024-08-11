class Vertex {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
        this.index = -1
    }

    is(v) {
        return this.x === v.x && this.y === v.y && this.z === v.z
    }

    vector() {
        return [this.x, this.y, this.z]
    }
    
    static mix(v1, v2) {
        return new Vertex((v1.x + v2.x) / 2, (v1.y + v2.y) / 2, (v1.z + v2.z) / 2)
    }
}

export function apply(v3s, i3s, depth) {
    const vertices = []
    const indices = []

    for (let i = 0; i < v3s.length; ++i) {
        const [x, y, z] = v3s[i]
        vertices.push(new Vertex(x, y, z))
    }

    for (let i = 0; i < i3s.length; ++i) {
        const [i0, i1, i2] = i3s[i]
        subdivide(i0, i1, i2, indices, vertices, depth)
    }

    const sorted = []

    indexSort: for (let i = 0; i < vertices.length; ++i) {
        const v = vertices[i]

        for (let j = 0; j < i; ++j) {
            const u = vertices[j]

            if (u.is(v)) {
                v.index = u.index
                continue indexSort
            }
        }

        v.index = sorted.length
        sorted.push(v)
    }

    for (let i = 0; i < indices.length; ++i) {
        const i3 = indices[i];
        const [i0, i1, i2] = i3

        const v0 = vertices[i0]
        const v1 = vertices[i1]
        const v2 = vertices[i2]

        i3[0] = v0.index
        i3[1] = v1.index
        i3[2] = v2.index
    }

    const mapped = sorted.map((v) => v.vector())

    return {
        vertices: mapped,
        indices: indices
    }
}

function subdivide(i0, i1, i2, indices, vertices, depth) {
    if (depth < 1) {
        indices.push([i0, i1, i2])
    } else {
        const v0 = vertices[i0]
        const v1 = vertices[i1]
        const v2 = vertices[i2]

        const i3 = vertices.length + 0
        const i4 = vertices.length + 1
        const i5 = vertices.length + 2

        vertices[i3] = Vertex.mix(v0, v1)
        vertices[i4] = Vertex.mix(v1, v2)
        vertices[i5] = Vertex.mix(v2, v0)

        subdivide(i0, i3, i5, indices, vertices, depth - 1)
        subdivide(i1, i4, i3, indices, vertices, depth - 1)
        subdivide(i2, i5, i4, indices, vertices, depth - 1)
        subdivide(i3, i4, i5, indices, vertices, depth - 1)
    }
}