function normalize(obj: any, seen = new WeakMap<any, string>(), path = '$'): any {
    if (obj === null) return null

    const t = typeof obj

    if (t === 'undefined' || t === 'number' || t === 'boolean' || t === 'string' || t === 'bigint')
        return obj

    if (t === 'function') {
        const fnStr = obj.toString()
        const hash = fnv1aHash(fnStr)
        return `[Function ${obj.name || 'anonymous'} | hash:${hash}]`
    }

    if (t === 'symbol') {
        return `[Symbol ${String(obj.description) || 'anonymous'}]`
    }
    if (seen.has(obj)) {
        const circularPath = seen.get(obj)!
        return `[Circular ${circularPath}]`
    }
    seen.set(obj, path)

    if (obj instanceof Date) {
        return `[Date ${obj.toISOString()}]`
    }

    if (obj instanceof RegExp) {
        return `[RegExp ${obj.toString()}]`
    }

    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(obj)) {
        return `[Buffer len:${obj.length} base64:${obj.toString('base64').slice(0, 32)}…]`
    }

    if (ArrayBuffer.isView(obj)) {
        const name = obj.constructor?.name || 'ArrayBufferView'

        if ('length' in obj && typeof (obj as any).length === 'number') {
            return `[TypedArray ${name} len:${(obj as any).length} byteLength:${obj.byteLength}]`
        }

        return `[ArrayBufferView ${name} byteLength:${obj.byteLength} byteOffset:${obj.byteOffset}]`
    }

    if (obj instanceof ArrayBuffer) {
        return `[ArrayBuffer byteLength:${obj.byteLength}]`
    }

    if (obj instanceof Map) {
        const mapObj: Record<string, any> = {}
        for (const [k, v] of obj.entries()) {
            const keyStr = String(k)
            mapObj[`[MapKey:${keyStr}]`] = normalize(v, seen, `${path}[MapKey:${keyStr}]`)
        }
        return mapObj
    }

    if (obj instanceof Set) {
        const arr = Array.from(obj).map((v, i) => normalize(v, seen, `${path}[${i}]`))
        return arr
    }

    if (obj.constructor && obj.constructor !== Object && !Array.isArray(obj)) {
        return `[Instance ${obj.constructor.name}]`
    }

    if (Array.isArray(obj)) {
        return obj.map((item, i) => normalize(item, seen, `${path}[${i}]`))
    }

    const result: Record<string, any> = {}
    const keys = Reflect.ownKeys(obj).map(String).sort()

    for (const key of keys) {
        try {
            const value = (obj as any)[key]
            result[key] = normalize(value, seen, `${path}.${key}`)
        } catch (err) {
            result[key] = `[Unreachable: ${(err as Error).message}]`
        }
    }

    return result
}

function fnv1aHash(str: string): string {
    let hash = 0x811c9dc5
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i)
        hash = (hash * 0x01000193) >>> 0
    }
    return ('0000000' + hash.toString(16)).slice(-8)
}

expect.extend({
    toMatchStructure(received, expected) {
        const clean = (o: any) => normalize(o)
        const pass = this.equals(clean(received), clean(expected))

        return {
            pass,
            message: () =>
                `Expected structures to match:\n\n` +
                `Expected:\n${this.utils.printExpected(clean(expected))}\n\n` +
                `Received:\n${this.utils.printReceived(clean(received))}`,
        }
    },
})

declare global {
    namespace jest {
        interface Matchers<R> {
            toMatchStructure(expected: any): R
        }
    }
}

export {}
