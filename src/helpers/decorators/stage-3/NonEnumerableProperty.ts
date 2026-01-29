export function NonEnumerableProperty() {
    return (_: undefined, context: ClassFieldDecoratorContext) => {
        context.addInitializer(function (this: any) {
            const propertyName = context.name

            const existingDescriptor = Object.getOwnPropertyDescriptor(this, propertyName)

            Object.defineProperty(this, propertyName, {
                writable: existingDescriptor ? existingDescriptor.writable : true,
                configurable: existingDescriptor ? existingDescriptor.configurable : true,
                enumerable: false,
                ...(existingDescriptor?.hasOwnProperty('value') && {
                    value: existingDescriptor.value,
                }),
            })
        })
    }
}
