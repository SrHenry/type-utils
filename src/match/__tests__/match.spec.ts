import { array } from '../../validators/schema/array'
import { boolean } from '../../validators/schema/boolean'
import { number } from '../../validators/schema/number'
import { object } from '../../validators/schema/object'
import { string } from '../../validators/schema/string'
import { asTypeGuard } from '../../TypeGuards/helpers/asTypeGuard'
import { tuple } from '../../validators/schema/tuple'
import { useSchema } from '../../validators/schema/useSchema'
import { isFunction } from '../../helpers/isFunction'

import { match } from '../match'

describe('match', () => {
    it('should match a primitive value and return a value', () => {
        const matcher = match()
            .with(4, 'four')
            .with(3, 'three')
            .with(2, 'two')
            .with(1, 'one')
            .with(true as const, 'boolean')
            .default({ default: true as const })
            .with(false as const, 'false')

        expect(matcher.exec(5)).toMatchStructure({ default: true })
        expect(matcher.exec(4)).toBe('four')
        expect(matcher.exec(3)).toBe('three')
        expect(matcher.exec(2)).toBe('two')
        expect(matcher.exec(1)).toBe('one')
        expect(matcher.exec(true)).toBe('boolean')
        expect(matcher.exec(false)).toBe('false')

        // match()
        //     .with(1 as const, true as const)
        //     .with(0 as const, false as const)
        //     .default(new TypeError())
        //     .exec()
        // match<0 | 1 | 2>()
        //     .with(1 as const, true as const)
        //     .with(0 as const, false as const)
        //     // .default(new TypeError())
        //     .exec()
    })

    it('should match a predicate or type guard and return a value', () => {
        const matcher = match()
            .with((v: unknown) => typeof v === 'string', 'bar' as const)
            .with((v: unknown) => typeof v === 'number')
            // .with(2, 'two')
            // .with(1, 'one')
            .default({ default: true as const })

        expect(matcher.exec('foo')).toBe('bar')
        expect(matcher.exec(1)).toBe(1)
        expect(matcher.exec(-99)).toBe(-99)
        expect(matcher.exec({})).toMatchStructure({ default: true })
    })

    it('should match a predicate or type guard and return a mapped value', () => {
        type Input =
            | {
                  foo: string
                  bar: number
              }
            | {
                  default: true
                  data: { type: string }[]
              }

        const matcher = match<Input>()
            // .with(object({ foo: string(), bar: number() }), v => v.bar)
            .with(object({ default: boolean(), data: array({ type: string() }) }), ({ data }) =>
                data.map(v => v.type)
            )
            .with(object({ foo: string(), bar: number() }), v => v.bar)
            .default({ default: true as const })

        expect(matcher.exec('foo')).toMatchStructure({ default: true })
        expect(matcher.exec(1)).toMatchStructure({ default: true })
        expect(matcher.exec(-99)).toMatchStructure({ default: true })
        expect(matcher.exec({})).toMatchStructure({ default: true })

        expect(matcher.exec({ foo: 'foo', bar: 10 })).toBe(10)
        expect(
            matcher.exec({ default: true, data: [{ type: 'foo' }, { type: 'bar' }] })
        ).toMatchStructure(['foo', 'bar'])
    })

    it('should match the first matching pattern', () => {
        const matcher = match()
            .with(4, 'four' as const)
            .with(3, 'three' as const)
            .with(2, 'two' as const)
            .with(1, 'one' as const)
            .with(4)
            .with(true as const, 'boolean' as const)
            .default({ default: true as const })
            .with(false as const, 'false' as const)
            .with(string(), 'STRING' as const)
            .with(object({ foo: object({ bar: number() }) }), ({ foo: { bar, ...rest } }) => [
                bar,
                rest,
            ])
            .with(object({ foo: object({ bar: number() }) }), ({ foo: { bar } }) => bar)

        expect(matcher.exec(5)).toMatchStructure({ default: true })
        expect(matcher.exec(4)).toBe('four')
        expect(matcher.exec(4)).not.toBe(4)
        expect(matcher.exec(3)).toBe('three')
        expect(matcher.exec(2)).toBe('two')
        expect(matcher.exec(1)).toBe('one')
        expect(matcher.exec(true)).toBe('boolean')
        expect(matcher.exec(false)).toBe('false')
        expect(matcher.exec('foo')).toBe('STRING')
        expect(matcher.exec({ foo: { bar: 10 } })).toMatchStructure([10, {}])
        expect(matcher.exec({ foo: { bar: 10, baz: -99 } })).toMatchStructure([10, { baz: -99 }])
        expect(matcher.exec({ foo: { bar: 10 } })).not.toMatchStructure(10)

        const matcher2 = match<string>()
            .with((v: string): v is string => v.length === 1)
            .with(
                (v: string): v is string => v.length > 0,
                () => 'greater than 0' as const
            )

        const matcher3 = match<string>()
            .with(
                (v: string): v is string => v.length > 0,
                () => 'greater than 0' as const
            )
            .with((v: string): v is string => v.length === 1)

        expect(matcher2.exec('aaaaa')).toBe('greater than 0')
        expect(matcher2.exec('a')).not.toBe('greater than 0')
        expect(matcher2.exec('a')).toBe('a')

        expect(matcher3.exec('aaaaa')).toBe('greater than 0')
        expect(matcher3.exec('a')).not.toBe('a')
        expect(matcher3.exec('a')).toBe('greater than 0')

        expect(() => matcher2.exec('')).toThrow(TypeError)
        expect(
            matcher2
                .default({
                    error: 'empty string',
                })
                .exec('')
        ).toMatchStructure({ error: 'empty string' })
    })

    it('should match a pattern and map the result using the given mapper', () => {
        type MapFuncGuards<TParams extends [...number[]]> = TParams extends [
            infer T extends number,
            ...infer Rest extends number[],
        ]
            ?
                  | import('../../TypeGuards/types/index').TypeGuard<
                        import('../../types/Func').Fn<
                            import('../../types/Tuple').TupleTools.CreateTuple<T>,
                            any
                        >
                    >
                  | MapFuncGuards<Rest>
            : never

        function func<TParams extends [...any[]] = [], TReturn = any>(
            argsLength: TParams['length']
        ): import('../../TypeGuards/types/index').TypeGuard<
            import('../../types/Func').Fn<TParams, TReturn>
        >
        function func<T extends number>(
            params: T
        ): import('../../TypeGuards/types/index').TypeGuard<
            import('../../types/Func').Fn<
                import('../../types/Tuple').TupleTools.CreateTuple<T>,
                any
            >
        >
        function func<T extends [...number[]]>(...params: T): MapFuncGuards<T>

        function func(...params: number[]) {
            return useSchema(
                asTypeGuard<import('../../types/Func').Fn<any[], any>>(
                    value => isFunction(value) && params.some(p => p === value.length),
                    {
                        kind: 'function',
                        context: {
                            acceptedParamLengths: params,
                        },
                    }
                )
            )
        }

        function forEach__signature_1<T>(
            fn: import('../../types/Func').Fn<[item: T], unknown>
        ): import('../../types/Func').Fn1<Iterable<T>, void> {
            return (list: Iterable<T>) => {
                for (const e of list) fn(e)
            }
        }

        const aaa = match()
            .with(tuple(func<[item: unknown], unknown>(1)), ([fn]) => forEach__signature_1(fn))
            .default(null)

        expect(aaa.exec([])).toBe(null)
        expect(aaa.exec([() => {}])).toBe(null)
        const res = aaa.exec([_item => 'foo'])

        expect(res).toBeInstanceOf(Function)
        expect(res.length).toBe(1)
        expect(() => res([])).not.toThrow()
    })
})
