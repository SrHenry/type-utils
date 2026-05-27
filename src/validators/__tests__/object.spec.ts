import { object } from '../schema/object.ts'
import { string } from '../schema/string.ts'

describe('object', () => {
    it('requires optional typed keys to be explicitly represented with optional schemas', () => {
        interface Item {
            id: string
            name?: string
        }

        // Compile-time: omitting an optional key from object<T>() is a type error.
        // Wrapped in a function so it never executes at runtime.
        function _typeCheck() {
            // @ts-expect-error object<T>() intentionally requires optional keys in ValidatorMap<T>.
            object<Item>({
                id: string(),
            })
        }
        void _typeCheck

        const schema = object<Item>({
            id: string(),
            name: string().optional(),
        })

        expect(schema({ id: 'item-1' })).toBe(true)
        expect(schema({ id: 'item-1', name: 'Example' })).toBe(true)
        expect(schema({ id: 'item-1', name: 1 })).toBe(false)
    })
})
