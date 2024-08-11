const exclusions = ['constructor', 'toString']

export function createLink(instance) {
    const link = {}

    const functions = Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).filter((s) => {
        return typeof instance[s] === 'function' && !exclusions.includes(s)
    })
    
    for (const methodName of functions) {
        link[methodName] = (...args) => instance[methodName](...args)
    }

    return Object.freeze(link)
}