export type PipeTransformCheck = (value: unknown) => boolean

let _check: PipeTransformCheck = () => false

export function setPipeTransformCheck(fn: PipeTransformCheck): void {
    _check = fn
}

export function checkPipeTransform(value: unknown): boolean {
    return _check(value)
}
