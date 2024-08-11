function v(line, vertices) {
	const x = parseFloat(line[1])
	const y = parseFloat(line[2])
	const z = parseFloat(line[3])
	vertices.push([x, y, z])
}

function f(line, triangles, vertexCount) {
	const vertices = line.length - 1
	const indices = []

	for (let i = 0; i < vertices; ++i) {
		const s = line[1 + i].split('/')
		const j = parseInt(s[0])

		if (j < 0) {
			indices.push(vertexCount + j)
		} else {
			indices.push(j - 1)
		}
	}

	for (let i = 0; i < vertices - 2; ++i) {
		const i0 = indices[0]
		const i1 = indices[i + 1]
		const i2 = indices[i + 2]
		triangles.push([i0, i1, i2])
	}
}

export function obj(source) {
	const lines = source.split('\n')

	const vertices = []
	const triangles = []

	for (let i = 0; i < lines.length; ++i) {
		const line = lines[i]
		const split = line.split(' ')
		
		switch (split[0]) {
			case 'v':
				v(split, vertices)
				continue
			case 'f':
				f(split, triangles, vertices.length)
				continue
		}
	}

	return {vertices:vertices, indices:triangles}
}