export type StandardSchemaV1<Input = unknown, Output = Input> = {
  readonly '~standard': StandardSchemaV1.Props<Input, Output>
}

export namespace StandardSchemaV1 {
  export type Props<Input = unknown, Output = Input> = {
    readonly version: 1
    readonly vendor: string
    readonly validate: (
      value: unknown,
      options?: Options
    ) => Result<Output> | Promise<Result<Output>>
    readonly types?: Types<Input, Output>
  }

  export type Types<Input = unknown, Output = Input> = {
    readonly input?: Input
    readonly output?: Output
  }

  export type Result<Output = unknown> = SuccessResult<Output> | FailureResult

  export type SuccessResult<Output = unknown> = {
    readonly success: true
    readonly value: Output
    readonly issues?: undefined
  }

  export type FailureResult = {
    readonly success: false
    readonly issues: ReadonlyArray<Issue>
  }

  export type Issue = {
    readonly message: string
    readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined
  }

  export type PathSegment = {
    readonly key: PropertyKey
  }

  export type Options = {
    readonly libraryOptions?: Record<string, unknown> | undefined
  }
}

export type InferInput<T extends StandardSchemaV1<any, any>> =
  T extends StandardSchemaV1<infer Input, any> ? Input : never

export type InferOutput<T extends StandardSchemaV1<any, any>> =
  T extends StandardSchemaV1<any, infer Output> ? Output : never
