import type { TypeGuard } from '../../../../TypeGuards/types/index.ts'
import type { V3 } from '../../types/index.ts'
import type { ValidationArgs, ValidationError } from '../../../ValidationError.ts'

type ValidationArgsStaticValues = 'name' | 'parent' | 'schema' | 'value'

export type PushNewError = {
    <TContext extends {}>(
        args: Omit<ValidationArgs<any, any, any, any, TContext>, ValidationArgsStaticValues>
    ): void
    (args: Omit<ValidationArgs<any, any, any, any, null>, ValidationArgsStaticValues>): void
    <TMessage extends string>(message: TMessage): void
    (args: string | Omit<ValidationArgs<any, any, any, any>, ValidationArgsStaticValues>): void
}

export type ValidationContext<TMetadata extends V3.StructType = V3.StructType> = {
    arg: unknown
    schema: TypeGuard<any>
    metadata: TMetadata
    name: string | undefined
    parent: unknown
    errors: ValidationError[]
    pushNewError: PushNewError
}
