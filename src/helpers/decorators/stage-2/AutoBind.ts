/**
 * Internal Decorator (stage 2)
 *
 * @param _
 * @param _2
 * @param descriptor
 * @returns
 */
export function AutoBind() {
    return (_: any, _2: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor => {
        const originalMethod: (...args: unknown[]) => unknown = descriptor.value
        return {
            configurable: true,
            enumerable: false,
            get() {
                return originalMethod.bind(this)
            },
        }
    }
}
