
class ExtendedError extends Error {
    public reason: string;
}

declare type PromisedFunc = (...args: any[]) => Promise<any>;
declare type SyncFunc = (...args: any[]) => any;
declare type SafeFunc = (...args: any[]) => void;

export function rejectsWith(message: string): MethodDecorator {
    return function (target: Object,
                     propertyKey: string | symbol,
                     descriptor: TypedPropertyDescriptor<PromisedFunc>): TypedPropertyDescriptor<PromisedFunc> {

        if (!descriptor || !descriptor.value) {
            return descriptor;
        }

        const originalMethod = descriptor.value;
        descriptor.value = function () {
            // tslint:disable-next-line:no-invalid-this
            return originalMethod.apply(this, arguments)
            // FIXME: promise can be rejected with any type
            .catch((error: Error) => {
                (error as ExtendedError).reason = message;
                throw error;
            });
        };

        return descriptor;
    };
}

export function throws(message: string): MethodDecorator {
    return function (target: Object,
                     propertyKey: string | symbol,
                     descriptor: TypedPropertyDescriptor<SyncFunc>): TypedPropertyDescriptor<SyncFunc> {

        if (!descriptor || !descriptor.value) {
            return descriptor;
        }

        const originalMethod = descriptor.value;
        descriptor.value = function () {
            try {
                // tslint:disable-next-line:no-invalid-this
                return originalMethod.apply(this, arguments);
            } catch (error) {
                (error as ExtendedError).reason = message;
                throw error;
            }
        };

        return descriptor;
    };
}

export function safeMethod (target: Object,
                    propertyKey: string | symbol,
                    descriptor: TypedPropertyDescriptor<SafeFunc>): TypedPropertyDescriptor<SafeFunc> {

    if (!descriptor || !descriptor.value) {
        return descriptor;
    }

    const originalMethod = descriptor.value;
    descriptor.value = function () {
        try {
            // tslint:disable-next-line:no-invalid-this
            return originalMethod.apply(this, arguments);
        } catch (error) {
            console.log(`Method ${propertyKey} threw an error: ${error}`);
        }
    };

    return descriptor;
};
