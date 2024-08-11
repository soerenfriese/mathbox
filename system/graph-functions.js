import * as log from '../log/log.js'
import * as system from './system.js'
import * as graphTypes from './graphs/graph-types.js'

export class GraphFunctions {
    constructor() {
        this.prepare(null)
        this.freeze(true)

        this.functions = Object.freeze({
            log: (...args) => this.log(...args),
            addSlider: (...args) => this.addSlider(...args),
            clear: (...args) => this.clear(...args),
            setHz: (...args) => this.setHz(...args),
            define: (...args) => this.define(...args)
        })
    }

    prepare(graphInstance) {
        this.previousGraphInstance = this.graphInstance
        this.graphInstance = graphInstance
    }

    freeze(flag) {
        this.frozen = flag
    }
    
    log(...messages) {
        log.info(messages.map((message) => String(message)).join(', '))
    }

    addSlider(callbackFunction) {
        if (typeof callbackFunction === 'function') {
            log.addSlider(callbackFunction, (error) => {
                console.error(error)
                log.error(error)

                system.stop()
            })
        } else {
            throw new TypeError('addSlider: parameter 1 is not of type \'function\'')
        }
    }

    clear() {
        log.clear()
    }

    setHz(hz) {
        if (this.frozen) {
            throw new Error('setHz: cannot call \'setHz\' during loop')
        }

        if (!Number.isFinite(hz) || hz <= 0) {
            throw new TypeError('setHz: frequency must be a positive number')
        }
        
        system.setHz(hz)
    }

    define(id) {
        if (this.frozen) {
            throw new Error('define: cannot call \'define\' during loop')
        }

        if (this.graphInstance.graphType !== null) {
            throw new Error('define: cannot define more than one graph type at the same time')
        }

        if (!(typeof id === 'string' || id instanceof String)) {
            throw new TypeError('define: parameter 1 is not of type \'string\'')
        }

        const graphType = graphTypes.byId(id)
        
        if (graphType === undefined) {
            throw new Error(`define: graph type with id \'${id}\' is not supported`)
        }

        const graph = graphType.createGraph()
        const camera = graphType.cameraType.createCamera()

        this.graphInstance.graphType = graphType
        this.graphInstance.graph = graph
        this.graphInstance.camera = camera

        if (this.previousGraphInstance &&
            this.previousGraphInstance.graphType !== null &&
            this.previousGraphInstance.graphType.cameraType.id === graphType.cameraType.id) {
            camera.copy(this.previousGraphInstance.camera)
        }

        system.setVisuals(graphType, graph, graphType.cameraType, camera)

        return {
            graph: graph.link,
            camera: camera.link
        }
    }
}