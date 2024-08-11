import { Graph2D } from './graph2d.js'
import { Graph3D } from './graph3d.js'
import { cameraType2D, cameraType3D } from '../controls/camera-types.js'

class GraphType {
    constructor(index, id, graphClass, cameraType, renderStyles) {
        this.index = index
        this.id = id
        this.createGraph = () => new graphClass()
        this.cameraType = cameraType
        this.renderStyles = renderStyles
    }
}

const types = [
    new GraphType(0, '2d', Graph2D, cameraType2D, [0]),
    new GraphType(1, '3d', Graph3D, cameraType3D, [0, 1])
]

export function byId(id) {
    return types.find((type) => type.id === id)
}