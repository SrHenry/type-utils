import { Generics } from '../Generics'
import { ensureInterface, imprintMetadata, is, retrieveMetadata, TypeGuard, TypeGuardError } from '../TypeGuards'
import { Schema, Rules, Validators } from '../validators'

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

const __metadata__ = Symbol('__metadata__')
const f1 = imprintMetadata(__metadata__, { a:1 }, function () { void 0 })

const _b = retrieveMetadata(__metadata__, f1)
const _b2 = retrieveMetadata(__metadata__, f1, Schema.object({ a: Schema.number() }))

console.log('metadata', _b, _b2)

const getMetadataOf = <T>(schema: TypeGuard<T>) => console.log('metadata of schema', Schema.getStructMetadata(schema))

getMetadataOf(_schema)
getMetadataOf(schema)

const EnvSchema = Schema.object({
    AUTENTICADOR_URL: Schema.string(),
    APP_PORT: Schema.number(),

    JWT_SECRET: Schema.string(),
    JWT_EXPIRES_IN: Schema.optional().number(),

    JWT_REFRESH_SECRET: Schema.string(),
    JWT_REFRESH_EXPIRES_IN: Schema.optional().number(),
})

const envSchemaTree = Schema.getStructMetadata(EnvSchema).tree
const envSchemaKeys = Object.keys(envSchemaTree) as (keyof typeof envSchemaTree)[]

const preEnvSchema = Schema.object({
    ...envSchemaKeys
        .map(key => ({ [key]: Schema.optional().any() }))
        .reduce((acc, item) => Object.assign(acc, item), {}),
}) as TypeGuard<
    Validators.Sanitize<{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [K in keyof typeof envSchemaTree]?: any
    }>
>

const aaa = {
    AUTENTICADOR_URL: 'http://localhost:8080',
    APP_PORT: '8080',
    JWT_SECRET: 'secret',
    JWT_EXPIRES_IN: '900',
    JWT_REFRESH_SECRET: 'refresh',
    JWT_REFRESH_EXPIRES_IN: '86400',
}
if (!is(aaa, preEnvSchema)) throw new Error('Missing required environment variables')

const tryParse = (value: string, to: Exclude<Generics.Primitives, 'symbol' | 'undefined'>) => {
    switch (to) {
        case 'number':
            if (isNaN(Number(value))) throw new Error(`${value} is not a number`)
            return Number(value)
        case 'boolean':
            if (!['true', 'false'].includes(value)) throw new Error(`${value} is not a boolean`)
            return value === 'true'
        case 'string':
            return value
        default:
            throw new Error(`'${to}' is not a valid type`)
    }
}

const parsed = Object.entries(aaa)
    .map(([key, value]) => ({
        [key]: tryParse(
            value,
            Schema.getStructMetadata(EnvSchema).tree[key as keyof typeof aaa]?.type as "number" | "boolean" | "string"
        )
    }))
    .reduce((acc, item) => Object.assign(acc, item), {})

console.log(parsed)