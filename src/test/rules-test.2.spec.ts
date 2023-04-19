import { ValidationError, ValidationErrors, Validator } from '../Experimental'
import { Generics } from '../Generics'
import { createRule, getRule, useCustomRules } from '../rules'
import { unique } from '../rules/array'
import { min, nonEmpty } from '../rules/string'
import { array, getStructMetadata, number, object, optional, string } from '../schema'
import {
    ensureInterface,
    getMessage,
    getValidatorMessageFormator,
    imprintMetadata,
    is,
    isInstanceOf,
    retrieveMessage,
    retrieveMetadata,
    setValidatorMessage,
    TypeGuard,
    TypeGuardError,
} from '../TypeGuards'
import { asEnum, asNull, or, StringRules, Validators } from '../validators'
import { hasOptionalFlag } from '../validators/schema/helpers'

function prettier(e: unknown): string {
    if (e instanceof ValidationError) return getValidatorMessageFormator(e)!(e.path, e.message)
    if (
        e instanceof ValidationErrors ||
        (Array.isArray(e) && e.every(isInstanceOf(ValidationError)))
    )
        return Array.from(e).map(prettier).join('\n')

    return String(e)
}

const patterns = Object.freeze({
    SKU: /^LV[0-9]+EAN[0-9]+$/i,
    NullSKU: /^LV[0]+EAN[0]+$/,
} as const)

const schema = object({
    ean: setValidatorMessage('EAN deve conter apenas números!', string(/^[0-9]+$/)),
    sku: setValidatorMessage('SKU inválido!', string(patterns.SKU)),
    opc: optional().number(),
})

const a = {
    ean: '1234567890123',
    sku: 'LV00EAN1234567890123',
}
const b = {
    ean: '123456789012sss3',
    sku: 'LEVO00EAN',
}

console.log(
    is(
        {
            ean: '1234567890123',
            sku: 'LV00EAN1234567890123',
        },
        schema
    )
)

console.log('===', is(undefined, optional().object({})))

console.log('a', is(a, schema))
console.log('b', is(b, schema))

console.log(hasOptionalFlag(optional().number()))

const isTypeError = (_: unknown): _ is TypeGuardError<typeof c, typeof _schema> =>
    _ instanceof TypeGuardError && is(_, object({ checked: string() }))

try {
    ensureInterface(b, schema)
} catch (e: unknown) {
    if (e instanceof TypeGuardError) {
        // console.error(`Error: ${e.message} of "${e.checked}" against "${e.against}"`)
        console.error(String(e))
    } else {
        console.error('(not type error)', e)
    }
}

const c = '2897 '
// const _schema = string([regex(/^[0-9]+$/)])
const _schema = string(/^[0-9]+$/)

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

console.log('test unique array', is([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], array([unique()], number())))
console.log(
    'test unique array',
    is([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10], array([unique()], number()))
)
console.log(
    'test unique array',
    is([{ a: 1 }, { b: { c: 0 } }, { a: 1, b: 0 }, { a: 2 }, { a: 1 }], array([unique()]))
)
console.log(
    'test unique array',
    is([{ a: 1 }, { b: { c: 0 } }, { a: 1, b: 0 }, { a: 2 }, { a: 1 }], array([unique(false)]))
)

const __metadata__ = Symbol('__metadata__')
const f1 = imprintMetadata(__metadata__, { a: 1 }, function () {
    void 0
})

const _b = retrieveMetadata(__metadata__, f1)
const _b2 = retrieveMetadata(__metadata__, f1, object({ a: number() }))

console.log('metadata', _b, _b2)

const getMetadataOf = <T>(schema: TypeGuard<T>) =>
    console.log('metadata of schema', getStructMetadata(schema))

getMetadataOf(_schema)
getMetadataOf(schema)

const EnvSchema = object({
    AUTENTICADOR_URL: string(),
    APP_PORT: number(),

    JWT_SECRET: string(),
    JWT_EXPIRES_IN: optional().number(),

    JWT_REFRESH_SECRET: string(),
    JWT_REFRESH_EXPIRES_IN: optional().number(),
})

const envSchemaMetadata = getStructMetadata(EnvSchema)

if (!('tree' in envSchemaMetadata)) throw new Error('tree not found')

const envSchemaTree = envSchemaMetadata.tree
const envSchemaKeys = Object.keys(envSchemaTree) as (keyof typeof envSchemaTree)[]

const preEnvSchema = object({
    ...envSchemaKeys
        .map(key => ({ [key]: optional().any() }))
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
            envSchemaMetadata.tree[key as keyof typeof aaa]?.type as 'number' | 'boolean' | 'string'
        ),
    }))
    .reduce((acc, item) => Object.assign(acc, item), {})

console.log(parsed)

const aa = string('aaa')

console.log(retrieveMessage(aa))

console.log('generic object', object()({ a: 1, b: 2 }))
console.log('blank object', object({})({ a: 1, b: 2 }), object({})({ a: 1, b: 2 }))

const SKU = createRule({
    name: 'custom.srhenry.SKU',
    message: '[rule: matches SKU format: /^LV[0-9]+EAN[0-9]+$/]',
    handler: (subject: string) => () => getRule('String.regex').call(void 0, subject, patterns.SKU),
})

const NoNullishSKU = createRule({
    name: 'custom.srhenry.NoNullishSKU',
    message: '[rule: must not have zero fill on SKU pattern]',
    handler: (subject: string) => () =>
        !getRule('String.regex').call(void 0, subject, patterns.NullSKU),
})

const isValidSKU = useCustomRules(string([nonEmpty(), min(15)]), SKU(), NoNullishSKU())

console.log()
console.log('isValidSKU', isValidSKU)
console.log()

const ean_teste = 'LV00EAN00000000'
const ean_teste2 = 'LV12EAN34567890'

console.log(`${ean_teste} is ${getMessage(isValidSKU)} >>>`, is(ean_teste, isValidSKU))

console.log(`${ean_teste2} is ${getMessage(isValidSKU)} >>>`, is(ean_teste2, isValidSKU))

console.log(getStructMetadata(array({ schema })))
console.log('\n\n*************************************\n\n')
console.log(object({ schema, array: array({ schema }) }))

// const sku = new SchemaValidator(object({ schema, array: array({ schema }) })).validate({
//     schema: a,
//     array: [{ schema: a }, { schema: a }, { schema: b }],
// })

const sku = new Validator(
    object({ schema, object: object({ array: array({ schema }) }) }),
    false
).validate({
    schema: b,
    object: { array: [{ schema: a }, { schema: b }, { schema: a }] },
})
// const sku = new SchemaValidator(object({ a: object({ b: object({ schema }) }) })).validate({
//     a: { b: { schema: b } },
// })
// const sku = new SchemaValidator(array(object({ schema }))).validate([{ schema: b }])

// SchemaValidator.validate({}, schema, true)

if (sku instanceof ValidationError) {
    console.error('An error has been found')
    console.error(prettier(sku))
} else if (
    is(
        sku,
        or(
            isInstanceOf(ValidationErrors),
            array(
                (e): e is ValidationError<typeof e, typeof isValidSKU> =>
                    e instanceof ValidationError
            )
        )
    )
) {
    const [...errors] = sku
    console.error('Many errors has been found!')
    // errors.forEach(({ path, message }) => console.error('\n', `[${path}] - ${message}`, '\n'))
    console.error(prettier(errors))
} else {
    console.log('SKU validated!', sku)
}

const ___a = {
    id: '1042e2e9-4522-4de0-9e87-b7de10b65156',
    nome: 'Luis Henrique da Silva Santos',
    matricula: null,
    cpf: '03968410238',
    email: 'lucapvh949@gmail.com',
    telefone: '69993064162',
    secretaria: 'DER',
    lotacao: 'GTI',
    roles: ['admin', 'user'],
    ldap: {
        sid: 'S-1-5-21-3065843220-3900571328-1001744874-136362',
        cpf: '03968410238',
        nome: 'Luis Henrique da Silva Santos',
        authorizationGroups: [
            { nome: 'Everyone', sid: 'S-1-1-0', descricao: null },
            { nome: 'Authenticated Users', sid: 'S-1-5-11', descricao: null },
            {
                nome: 'DER_GERAL',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-3801',
                descricao: null,
            },
            {
                nome: 'DER_NTI',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-1137',
                descricao: null,
            },
            {
                nome: 'Domain Users',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-513',
                descricao: 'All domain users',
            },
            {
                nome: 'DER_SEOSP',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-124327',
                descricao: null,
            },
            {
                nome: 'Group Policy Creator Owners',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-520',
                descricao: 'Members in this group can modify group policy for the domain',
            },
            {
                nome: 'Denied RODC Password Replication Group',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-572',
                descricao:
                    'Members in this group cannot have their passwords replicated to any read-only domain controllers in the domain',
            },
            {
                nome: 'Administrators',
                sid: 'S-1-5-32-544',
                descricao:
                    'Administrators have complete and unrestricted access to the computer/domain',
            },
            {
                nome: 'Users',
                sid: 'S-1-5-32-545',
                descricao:
                    'Users are prevented from making accidental or intentional system-wide changes and can run most applications',
            },
        ],
        groups: [
            {
                nome: 'Domain Users',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-513',
                descricao: 'All domain users',
            },
            {
                nome: 'DER_NTI',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-1137',
                descricao: null,
            },
        ],
    },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwNDJlMmU5LTQ1MjItNGRlMC05ZTg3LWI3ZGUxMGI2NTE1NiIsImNvbGxpc2lvbl9yYW5kb21pemVyIjoiazlFTUdHa2siLCJyb2xlcyI6WyJhZG1pbiIsInVzZXIiXSwibmJmIjoxNjU2MzU1ODM3LCJleHAiOjE2NTYzNTYxMzcsImlhdCI6MTY1NjM1NTgzN30.HpWVvEDZ-lAReV7QW8Kp4bCecvnwIefcJpENcYk-MAg',
    refreshToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwNDJlMmU5LTQ1MjItNGRlMC05ZTg3LWI3ZGUxMGI2NTE1NiIsImNvbGxpc2lvbl9yYW5kb21pemVyIjoiWlJqUmRPMmUiLCJyb2xlcyI6WyJhZG1pbiIsInVzZXIiXSwibmJmIjoxNjU2MzU1ODM3LCJleHAiOjE2NTYzNjMwMzcsImlhdCI6MTY1NjM1NTgzN30.Nk-SHza005w7gYsoUaxi_BDuKLFdxk6rTXD_UxoqkUQ',
}

const ____b = {
    id: 'caa657ae-4793-487f-a30c-4239eb1ce9c8',
    nome: 'Alexandre Oliveira',
    matricula: null,
    cpf: '03090195240',
    email: '',
    telefone: '',
    secretaria: '',
    lotacao: '',
    roles: [],
    ldap: {
        sid: 'S-1-5-21-3065843220-3900571328-1001744874-51866',
        cpf: '03090195240',
        nome: 'Alexandre Oliveira',
        authorizationGroups: [
            { nome: 'Everyone', sid: 'S-1-1-0', descricao: null },
            { nome: 'Authenticated Users', sid: 'S-1-5-11', descricao: null },
            {
                nome: 'SEDUC_GERAL',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-31128',
                descricao: null,
            },
            {
                nome: 'DER_COR',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-1329',
                descricao: null,
            },
            {
                nome: 'DER_COUSA',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-112645',
                descricao: null,
            },
            {
                nome: 'DER_GERAL',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-3801',
                descricao: null,
            },
            {
                nome: 'DER_NTI',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-1137',
                descricao: null,
            },
            {
                nome: 'Domain Users',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-513',
                descricao: 'All domain users',
            },
            {
                nome: 'SEDUC Remote Server',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-1805',
                descricao: null,
            },
            {
                nome: 'SEDUC_CTIC',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-50222',
                descricao: null,
            },
            {
                nome: 'SEDUC_GTI',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-1585',
                descricao: null,
            },
            {
                nome: 'DER_SEOSP',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-124327',
                descricao: null,
            },
            {
                nome: 'SEDUC_OPEN_GTI',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-129642',
                descricao: null,
            },
            {
                nome: 'SEDUC_ADM',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-1762',
                descricao: null,
            },
            {
                nome: 'DER_CORE',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-1315',
                descricao: null,
            },
            {
                nome: 'Group Policy Creator Owners',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-520',
                descricao: 'Members in this group can modify group policy for the domain',
            },
            {
                nome: 'Denied RODC Password Replication Group',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-572',
                descricao:
                    'Members in this group cannot have their passwords replicated to any read-only domain controllers in the domain',
            },
            {
                nome: 'Users',
                sid: 'S-1-5-32-545',
                descricao:
                    'Users are prevented from making accidental or intentional system-wide changes and can run most applications',
            },
        ],
        groups: [
            {
                nome: 'Domain Users',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-513',
                descricao: 'All domain users',
            },
            {
                nome: 'SEDUC_ADM',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-1762',
                descricao: null,
            },
            {
                nome: 'DER_NTI',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-1137',
                descricao: null,
            },
            {
                nome: 'DER_COR',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-1329',
                descricao: null,
            },
            {
                nome: 'DER_CORE',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-1315',
                descricao: null,
            },
            {
                nome: 'SEDUC_GTI',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-1585',
                descricao: null,
            },
            {
                nome: 'SEDUC_CTIC',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-50222',
                descricao: null,
            },
            {
                nome: 'DER_COUSA',
                sid: 'S-1-5-21-3065843220-3900571328-1001744874-112645',
                descricao: null,
            },
        ],
    },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNhYTY1N2FlLTQ3OTMtNDg3Zi1hMzBjLTQyMzllYjFjZTljOCIsImNvbGxpc2lvbl9yYW5kb21pemVyIjoiam9iaGFCeHgiLCJuYmYiOjE2NTY0MzcxMDUsImV4cCI6MTY1NjQzNzQwNSwiaWF0IjoxNjU2NDM3MTA1fQ.AjFsUm2K1tEauy85xF70cgep4nEBC3Z9Lj1O5S6ArAg',
    refreshToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNhYTY1N2FlLTQ3OTMtNDg3Zi1hMzBjLTQyMzllYjFjZTljOCIsImNvbGxpc2lvbl9yYW5kb21pemVyIjoiZkdrWnVpbnciLCJuYmYiOjE2NTY0MzcxMDUsImV4cCI6MTY1NjQ0NDMwNSwiaWF0IjoxNjU2NDM3MTA1fQ.TUm4erbAHwxT69eCgbJOvDJBeID34rWmvazSRfSMTjc',
}

const GuidSchema = string(/[{(]?[0-9A-F]{8}[-]?(?:[0-9A-F]{4}[-]?){3}[0-9A-F]{12}[)}]?$/i)
function isCPF(cpf: string = '') {
    cpf = cpf.replace(/[^\d]+/g, '')
    if (cpf == '') return false
    // Elimina CPFs invalidos conhecidos
    if (
        cpf.length != 11 ||
        cpf == '00000000000' ||
        cpf == '11111111111' ||
        cpf == '22222222222' ||
        cpf == '33333333333' ||
        cpf == '44444444444' ||
        cpf == '55555555555' ||
        cpf == '66666666666' ||
        cpf == '77777777777' ||
        cpf == '88888888888' ||
        cpf == '99999999999'
    )
        return false
    // Valida 1o digito
    let add = 0

    for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i)

    let rev = 11 - (add % 11)

    if (rev == 10 || rev == 11) rev = 0

    if (rev != parseInt(cpf.charAt(9))) return false

    // Valida 2o digito
    add = 0

    for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i)

    rev = 11 - (add % 11)

    if (rev == 10 || rev == 11) rev = 0

    if (rev != parseInt(cpf.charAt(10))) return false

    return true
}
const CPFFormat = /^(\d{11}|\d{3}\.\d{3}\.\d{3}\-\d{2})$/
const createCPFRule = createRule({
    name: 'custom.CPF',
    message: '[rule: must pass CPF algorithm]',
    handler: (subject: string) => () => isCPF(subject),
})
const CPFRule = createCPFRule()
const CPFSchema = useCustomRules(
    string([
        StringRules.nonEmpty(),
        StringRules.min(11),
        StringRules.max(14),
        StringRules.regex(CPFFormat),
    ]),
    CPFRule
)
const Roles = ['admin', 'user'] as const
const ___schema = object({
    id: GuidSchema,
    nome: string(),
    matricula: optional().or(string(), asNull()),
    cpf: CPFSchema,
    email: string(),
    telefone: optional().or(string(), asNull()),
    secretaria: string(),
    lotacao: string(),
    roles: array(asEnum([...Roles])),
})

const GroupSchemaObject = {
    sid: string(),
    nome: string(),
    descricao: optional().or(string(), asNull()),
}
const GroupSchema = object(GroupSchemaObject)

const LDAPSchema = object({
    sid: string(),
    cpf: string(),
    nome: string(),
    groups: array(GroupSchema),
    authorizationGroups: array(GroupSchema),
})

const ___full_schema = object({
    id: GuidSchema,
    nome: string(),
    matricula: optional().or(string(), asNull()),
    cpf: CPFSchema,
    email: string(),
    telefone: optional().or(string(), asNull()),
    secretaria: string(),
    lotacao: string(),
    roles: array(asEnum([...Roles])),
    ldap: or(LDAPSchema, asNull()),
    token: string(),
    refreshToken: string(),
})

const JwtSchema = object({
    id: GuidSchema,
    roles: array(asEnum([...Roles])),
})

console.log(is(___a, ___schema))

console.log(is('039.684.102-38', isCPF as any))
console.log(
    is(
        '03968410238',
        string([
            StringRules.nonEmpty(),
            StringRules.min(11),
            StringRules.max(14),
            StringRules.regex(CPFFormat),
        ])
    )
)
console.log(is('03968410238', (a: any) => CPFRule[2](a)()))
console.log(CPFSchema('03968410238'))
console.log(CPFSchema('039.684.102-38'))

console.log('_____b', is(____b, ___full_schema))

const jwt = JSON.parse(
    Buffer.from(
        'eyJpZCI6ImNhYTY1N2FlLTQ3OTMtNDg3Zi1hMzBjLTQyMzllYjFjZTljOCIsImNvbGxpc2lvbl9yYW5kb21pemVyIjoiNzcwUjRwSnYiLCJyb2xlcyI6InVzZXIiLCJuYmYiOjE2NTY0Mzg4OTEsImV4cCI6MTY1NjQzOTE5MSwiaWF0IjoxNjU2NDM4ODkxfQ',
        'base64'
    ).toString('utf8')
)
console.log(jwt, is(jwt, JwtSchema))

try {
    const foo = {
        schema: b,
        object: { array: [{ schema: a }, { schema: b }, { schema: a }] },
    }
    const goo = {
        schema: a,
        object: { array: [{ schema: a }, { schema: a }, { schema: a }] },
    }
    const bar = object({ schema, object: object({ array: array({ schema }) }) })

    console.log('[foo] Payload:', Validator.validate(foo, bar, false))
    console.log('[goo] Payload:', Validator.validate(goo, bar))
} catch (e) {
    console.log('Erros durante validação profunda:', '\n')
    if (e instanceof ValidationErrors) {
        console.log(prettier(e.errors))
    }
}

// const ___ = object({
//     a: string(),
//     b: optional().or(
//         asNull(),
//         object({
//             c: number(),
//         })
//     ),
// })

// type ___ = GetTypeGuard<typeof ___>

// type aaaaaa = {
//     a: number
//     foo?: {
//         bar: string
//         baz: symbol | null
//     }
// }

// const $$$ = object<aaaaaa>({
//     a: number(),
//     foo: optional().object({
//         bar: string(),
//         baz: or(asNull(), symbol()),
//     }),
// })
