import { isInstanceOf } from '../../TypeGuards/helpers/isInstanceOf.ts'
import { Email } from '../../classes/Email.ts'
import { getStructMetadata } from '../../validators/schema/helpers/getStructMetadata.ts'
import { number } from '../../validators/schema/number.ts'
import { object } from '../../validators/schema/object.ts'
import { string } from '../../validators/schema/string.ts'
import { V3 } from '../../validators/schema/types/index.ts'
import { replaceSchemaTree, type ReplacedKeysTree } from '../replaceSchemaTree.ts'

describe('replaceSchemaTree', () => {
    it('should replace keys in the schema with new type guards', () => {
        interface OriginalSchema {
            name: string
            age: number
            email: string
        }

        interface ReplacedSchemaDiff {
            email: Email
        }

        interface ReplacedSchema
            extends Omit<OriginalSchema, keyof ReplacedSchemaDiff>, ReplacedSchemaDiff {}

        const originalSchema = object<OriginalSchema>({
            name: string(),
            age: number(),
            email: string(),
        })

        const replacementTree: ReplacedKeysTree<OriginalSchema, ReplacedSchemaDiff> = {
            email: isInstanceOf(Email),
        }

        const replacedSchema = replaceSchemaTree(originalSchema, replacementTree)

        const [{ tree: originalTree }, { tree: replacedTree }] = [
            getStructMetadata(originalSchema) as unknown as V3.ObjectStruct<OriginalSchema>,
            getStructMetadata(replacedSchema) as unknown as V3.ObjectStruct<ReplacedSchema>,
        ]

        // Assert that the replaced schema has the expected structure
        expect(originalTree.age.type).toBe(replacedTree.age.type)
        expect(originalTree.name.type).toBe(replacedTree.name.type)
        expect(originalTree.email.type).not.toBe(replacedTree.email.type)

        expect(originalTree.email.type).toBe('string')
        expect(replacedTree.email.type).toBe('object')

        expect(replacedTree.email).toHaveProperty('constructor', Email)
        expect(replacedTree.email).toHaveProperty('className', 'Email')
        expect(replacedTree.email).toHaveProperty('tree', {})

        const sampleObject1 = {
            name: 'Marcus',
            age: 30,
            email: 'example@email.com',
        }
        const sampleObject2 = {
            name: 'Marcus',
            age: 30,
            email: new Email('example@email.com'),
        }

        expect(originalSchema(sampleObject1)).toBe(true)
        expect(originalSchema(sampleObject2)).toBe(false)

        expect(replacedSchema(sampleObject1)).toBe(false)
        expect(replacedSchema(sampleObject2)).toBe(true)
    })
})
