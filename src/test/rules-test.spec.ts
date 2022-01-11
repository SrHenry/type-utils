import { ensureInterface, is, TypeGuardError } from '../TypeGuards'
import { Schema, Rules } from '../validators'

console.log(Schema.optional())

const schema = Schema.object({
    ean: Schema.string([Rules.String.regex(/^[0-9]+$/)]),
    sku: Schema.string([Rules.String.regex(/^LV[0-9]+EAN[0-9]+$/)]),
    opc: Schema.optional().number(),
})

const a = {
    ean: "1234567890123",
    sku: "LV00EAN1234567890123",
}
const b = {
    ean: "123456789012sss3",
    sku: "LEVO00EAN",
}

console.log(is({
    ean: "1234567890123",
    sku: "LV00EAN1234567890123",
}, schema))

console.log("===", is(undefined, Schema.optional().object({})))

console.log('a', is(a, schema))
console.log('b', is(b, schema))

console.log('__optional__' in Schema.optional().number())

const isTypeError = (_: unknown): _ is TypeGuardError<typeof c, typeof _schema> => _ instanceof TypeGuardError && is(_, Schema.object({ checked: Schema.string() }))

try {
    ensureInterface(b, schema)
} catch (e: unknown) {
    if (e instanceof TypeGuardError) {
        // console.error(`Error: ${e.message} of "${e.checked}" against "${e.against}"`)
        console.error(String(e))
    } else {
        console.error("(not type error)", e)
    }
}

const c = '2897 '
const _schema = Schema.string([Rules.String.regex(/^[0-9]+$/)])

console.log(c, is(c, _schema))

try {
    ensureInterface(c, _schema)
} catch (e: unknown) {
    if (is(e, isTypeError)) {
        // console.error(`Error: ${e.message} of "${e.checked}" against "${e.against}"`)
        console.error(String(e))
    } else {
        console.error(e)
    }
}

console.log("test unique array", is([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], Schema.array([Rules.Array.unique()], Schema.number())))
console.log("test unique array", is([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10], Schema.array([Rules.Array.unique()], Schema.number())))
console.log("test unique array", is([{ a: 1 }, { b: { c: 0 } }, { a: 1, b: 0 }, { a: 2 }], Schema.array([Rules.Array.unique()])))

