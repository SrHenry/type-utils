export function NonEnumerableProperty() {
    return ((target, propertyKey) => {
        const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {
            writable: true,
            configurable: true,
        }

        if (descriptor.enumerable !== false) {
            Object.defineProperty(target, propertyKey, {
                ...descriptor,
                enumerable: false,
                ...(Object.hasOwn(descriptor, 'value') && {
                    value: descriptor.value,
                }),
            })
        }
    }) satisfies PropertyDecorator
}
