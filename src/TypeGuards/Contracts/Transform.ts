export interface TransformContract<TransformData, InputTypes, OutputType>
{
    inputTypes: string[]
    outputType: OutputType

    from<T>(...types: T[]): TransformContract<TransformData, T, OutputType>

    to<T>(...types: T[]): TransformContract<TransformData, InputTypes, T>

    transform(): OutputType

}