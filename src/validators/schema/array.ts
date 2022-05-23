import { getMessage, TypeGuard } from '../../TypeGuards/GenericTypeGuards'
import type { ArrayRules as ArrayRules } from '../rules/Array'
import { ValidatorMap } from '../Validators'
import { any } from './any'
import {
    branchIfOptional,
    enpipeRuleMessageIntoGuard,
    enpipeSchemaStructIntoGuard,
    getStructMetadata,
    isFollowingRules,
} from './helpers'
import { object } from './object'

export function array(): TypeGuard<any[]>
export function array(rules: ArrayRules[]): TypeGuard<any[]>
export function array<T>(rules: ArrayRules[], schema: TypeGuard<T>): TypeGuard<T[]>
export function array<T>(schema: TypeGuard<T>): TypeGuard<T[]>
export function array(tree: {}): TypeGuard<{}[]>
export function array<T>(tree: ValidatorMap<T>): TypeGuard<T[]>
export function array<T>(
    rules?: ArrayRules[] | TypeGuard<T> | null | undefined,
    schema?: TypeGuard<T>
): TypeGuard<T[]>

export function array<T>(
    rules: ArrayRules[] | TypeGuard<T> | null | undefined | ValidatorMap<T> = void 0,
    _schema: TypeGuard<T> = any()
): TypeGuard<T[]> {
    if (!!rules && typeof rules === 'object' && !Array.isArray(rules))
        return array(object(rules) as unknown as TypeGuard<T>)

    if (!rules || typeof rules === 'function') {
        _schema = rules ?? _schema
        const guard = (arg: unknown): arg is T[] =>
            Array.isArray(arg) && arg.every(item => _schema(item))

        return enpipeSchemaStructIntoGuard<(T | any)[]>(
            {
                type: 'object',
                schema: guard,
                optional: false,
                entries: getStructMetadata(_schema),
            },
            enpipeRuleMessageIntoGuard(`Array<${getMessage(_schema)}>`, guard)
        )
    }

    const guard = (arg: unknown): arg is T[] =>
        branchIfOptional(arg, rules) ||
        (Array.isArray(arg) && isFollowingRules(arg, rules) && arg.every(item => _schema(item)))

    return enpipeSchemaStructIntoGuard<(T | any)[]>(
        {
            type: 'object',
            schema: guard,
            optional: false,
            entries: getStructMetadata(_schema),
        },
        enpipeRuleMessageIntoGuard(`Array<${getMessage(_schema)}>`, guard, rules)
    )
}
