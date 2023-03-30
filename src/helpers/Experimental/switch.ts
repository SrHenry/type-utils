import { Predicate } from 'src/types/Predicate'
import type { TypeGuard } from '../../TypeGuards'
import { isTypeGuard } from '../../TypeGuards'
import type { Func0, Func1 } from '../../types/Func'
import type { Lambda, Lambda0 } from '../../types/Lambda'
import { lambda } from './lambda'

interface ICase<TSwitchArg, TSwitchResultAggregate = never> extends CallableFunction {
    <TMatch extends TSwitchArg, TResult>(match: TMatch, result: Func0<TResult>): Lambda0<
        TSwitchResultAggregate | TResult
    > &
        ISwitch<TSwitchArg, TSwitchResultAggregate | TResult>
    <TMatch extends TSwitchArg, TResult>(
        predicate: Predicate<TMatch>,
        result: Func0<TResult>
    ): Lambda0<TSwitchResultAggregate | TResult> &
        ISwitch<TSwitchArg, TSwitchResultAggregate | TResult>
    <TMatch extends TSwitchArg, TResult>(
        predicate: TypeGuard<TMatch>,
        result: Func1<TMatch, TResult>
    ): Lambda0<TSwitchResultAggregate | TResult> &
        ISwitch<TSwitchArg, TSwitchResultAggregate | TResult>
    <TMatch extends TSwitchArg, TResult>(predicate: Predicate<TMatch>, result: TResult): Lambda0<
        TSwitchResultAggregate | TResult
    > &
        ISwitch<TSwitchArg, TSwitchResultAggregate | TResult>
    <TMatch extends TSwitchArg, TResult>(predicate: TypeGuard<TMatch>, result: TResult): Lambda0<
        TSwitchResultAggregate | TResult
    > &
        ISwitch<TSwitchArg, TSwitchResultAggregate | TResult>
    <TMatch extends TSwitchArg, TResult>(match: TMatch, result: TResult): Lambda0<
        TSwitchResultAggregate | TResult
    > &
        ISwitch<TSwitchArg, TSwitchResultAggregate | TResult>
}

interface IStaticCase<TSwitchArg, TSwitchResultAggregate = never> extends CallableFunction {
    <TMatch extends TSwitchArg, TResult>(match: TMatch, result: Func0<TResult>): Lambda<
        [arg: TSwitchArg],
        TSwitchResultAggregate | TResult
    > &
        IStaticSwitch<TSwitchArg, TSwitchResultAggregate | TResult>
    <TMatch extends TSwitchArg, TResult>(
        predicate: Predicate<TMatch>,
        result: Func0<TResult>
    ): Lambda<[arg: TSwitchArg], TSwitchResultAggregate | TResult> &
        IStaticSwitch<TSwitchArg, TSwitchResultAggregate | TResult>
    <TMatch extends TSwitchArg, TResult>(
        predicate: TypeGuard<TMatch>,
        result: Func1<TMatch, TResult>
    ): Lambda<[arg: TSwitchArg], TSwitchResultAggregate | TResult> &
        IStaticSwitch<TSwitchArg, TSwitchResultAggregate | TResult>
    <TMatch extends TSwitchArg, TResult>(predicate: Predicate<TMatch>, result: TResult): Lambda<
        [arg: TSwitchArg],
        TSwitchResultAggregate | TResult
    > &
        IStaticSwitch<TSwitchArg, TSwitchResultAggregate | TResult>
    <TMatch extends TSwitchArg, TResult>(predicate: TypeGuard<TMatch>, result: TResult): Lambda<
        [arg: TSwitchArg],
        TSwitchResultAggregate | TResult
    > &
        IStaticSwitch<TSwitchArg, TSwitchResultAggregate | TResult>
    <TMatch extends TSwitchArg, TResult>(match: TMatch, result: TResult): Lambda<
        [arg: TSwitchArg],
        TSwitchResultAggregate | TResult
    > &
        IStaticSwitch<TSwitchArg, TSwitchResultAggregate | TResult>
}

interface IDefault<TArg, TSwitchResultAggregate = never> extends CallableFunction {
    <TDefault>(result: Func1<TArg, TDefault>): Lambda0<TSwitchResultAggregate | TDefault>
    <TDefault>(result: Func0<TDefault>): Lambda0<TSwitchResultAggregate | TDefault>
    <TDefault>(result: TDefault): Lambda0<TSwitchResultAggregate | TDefault>
}

interface IStaticDefault<TArg, TSwitchResultAggregate = never> extends CallableFunction {
    <TDefault>(result: Func1<TArg, TDefault>): Lambda<
        [arg: TArg],
        TSwitchResultAggregate | TDefault
    >
    <TDefault>(result: Func0<TDefault>): Lambda<[arg: TArg], TSwitchResultAggregate | TDefault>
    <TDefault>(result: TDefault): Lambda<[arg: TArg], TSwitchResultAggregate | TDefault>
}

interface ISwitch<TArg, TResultAggregate = never> {
    case: ICase<TArg, TResultAggregate>

    default: IDefault<TArg, TResultAggregate>
}

interface IStaticSwitch<TArg, TResultAggregate = never> {
    case: IStaticCase<TArg, TResultAggregate>
    default: IStaticDefault<TArg, TResultAggregate>
}

export type Switch<TArg> = {
    case: ICase<TArg>
}
export type StaticSwitch<TArg> = {
    case: IStaticCase<TArg>
}

const $$switch_default$$ = Symbol('$$switch_default$$')
const $$switch_no_initial_arg$$ = Symbol('$$switch_no_initial_arg$$')
const $$switch_no_arg$$ = Symbol('$$switch_no_initial_arg$$')
function __switch__(
    arg: unknown,
    matches: unknown[] = [],
    results: unknown[] = [],
    defaultResult: symbol | ((o: unknown) => unknown) = $$switch_default$$
):
    | ISwitch<unknown, unknown>
    | IStaticSwitch<unknown, unknown>
    | Lambda0<unknown>
    | Lambda<[arg: unknown], unknown> {
    if (defaultResult !== $$switch_default$$) {
        if (typeof defaultResult !== 'function')
            throw new Error('default lambda must be a callable function')

        const defaultFn = (arg: unknown = $$switch_no_arg$$) => {
            if (arg === $$switch_no_arg$$) throw new Error('missing switch argument to evaluate')

            const i = matches.findIndex(m => (isTypeGuard(m) ? m(arg) : m === arg))

            if (i === -1) return defaultResult(arg)

            const result = results[i]

            return typeof result === 'function' ? result(arg) : result
        }

        return lambda(arg === $$switch_no_initial_arg$$ ? defaultFn : () => defaultFn(arg))
    }

    const caseFn = (arg: unknown = $$switch_no_arg$$) => {
        if (arg === $$switch_no_arg$$) throw new Error('missing switch argument to evaluate')

        // eslint-disable-next-line no-debugger
        const i = matches.findIndex(m => (isTypeGuard(m) ? m(arg) : m === arg))
        if (i === -1) throw new Error(`No match for ${arg}`)

        const result = results[i]

        return typeof result === 'function' ? result(arg) : result
    }

    const λ = arg === $$switch_no_initial_arg$$ ? lambda(caseFn) : lambda(() => caseFn(arg))

    return Object.assign(λ, {
        case: (match: unknown, result: Func0<unknown>) =>
            __switch__(arg, [...matches, match], [...results, result]),
        default: (result: unknown) =>
            __switch__(
                arg,
                matches,
                results,
                typeof result === 'function' ? (result as () => unknown) : () => result
            ),
    })
}

/**
 * Creates a switch expression for the given type argument
 * @param arg
 */
export function $switch<TArg>(): StaticSwitch<TArg>
/**
 * Creates a switch expression for the given argument
 * @param arg
 */
export function $switch<TArg>(arg: TArg): Switch<TArg>

export function $switch(arg: unknown = $$switch_no_initial_arg$$): unknown {
    return {
        case: (match: unknown, result: Func0<unknown>) => __switch__(arg, [match], [result]),
    }
}
