/**
 * Decorator
 * @param _
 * @param _2
 * @param descriptor
 * @returns
 */
export function AutoBind(
    _: any,
    _2: string | symbol,
    descriptor: PropertyDescriptor
): PropertyDescriptor {
    const originalMethod: Function = descriptor.value
    return {
        configurable: true,
        enumerable: false,
        get() {
            return originalMethod.bind(this)
        },
    }
}
