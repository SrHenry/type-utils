export function AutoBind() {
    return function <T, A extends any[], R>(
        value: (...args: A) => R,
        context: ClassMethodDecoratorContext<T, (...args: A) => R>
    ) {
        const methodName = context.name

        context.addInitializer(function (this: any) {
            Object.defineProperty(this, methodName, {
                configurable: true,
                enumerable: false,
                get() {
                    const bound = value.bind(this)

                    Object.defineProperty(this, methodName, {
                        value: bound,
                        configurable: true,
                        writable: true,
                        enumerable: false,
                    })

                    return bound
                },
            })
        })
    }
}
