import { v4 as uuid } from 'uuid'

import { lambda } from '../Experimental'
// import { enpipe, pipe, pipeline } from '../Experimental/pipeline'
import { createPipeline } from '../Experimental/pipeline/createPipeline'
import { enpipe } from '../Experimental/pipeline/enpipe'
import { pipe } from '../Experimental/pipeline/pipe'

const addUserFactory = (db: Record<string, Record<string, any>[]>) => (user: Record<string, any>) =>
    new Promise<string>(resolve => {
        setTimeout(() => {
            const id = uuid()

            db['users'] ??= []
            db['users']?.push({ id, ...user })
            resolve(id)
        }, 200)
    })
const addPostFactory =
    (db: Record<string, Record<string, any>[]>) => (user_id: string, post: Record<string, any>) =>
        new Promise<boolean>(resolve => {
            setTimeout(() => {
                db['posts'] ??= []
                db['posts']?.push({ user_id, ...post })
                resolve(true)
            }, 300)
        })

describe('pipe', () => {
    it('should run a pipeline with a function after another function', () => {
        const breakWords = (foo: string) => foo.split(/\b/)
        const removeEmpty = (foo: string[]) => foo.filter(w => /\S/.test(w))
        const result = pipe('the rat gnawed the clothes of the Rome King ')
            .pipe(breakWords)
            .pipe(removeEmpty)
            .depipe()

        expect(result).toEqual([
            'the',
            'rat',
            'gnawed',
            'the',
            'clothes',
            'of',
            'the',
            'Rome',
            'King',
        ])
    })
    it('should run a pipeline with an async function after another async function', async () => {
        const db = {
            users: [] as Record<string, any>[],
            posts: [] as Record<string, any>[],
        }

        const insertUser = addUserFactory(db)
        const insertPost = addPostFactory(db)

        const result = await pipe({ name: 'Marcus', email: 'example@email.com' })
            .pipe(insertUser)
            .pipeAsync(id =>
                insertPost(id, { title: 'Hello World', content: 'Lorem ipsum dolor sit amet' })
            )
            .depipe()

        expect(result).toBe(true)
        expect(db.users).toHaveLength(1)
        expect(db.posts).toHaveLength(1)
        expect(db.posts[0]).toBeDefined()
        expect(db.users[0]).toBeDefined()
        expect(db.posts[0]!['user_id']).toBe(db.users[0]!['id'])
        expect(db.posts[0]!['title']).toBe('Hello World')
        expect(db.posts[0]!['content']).toBe('Lorem ipsum dolor sit amet')
        expect(db.users[0]!['name']).toBe('Marcus')
        expect(db.users[0]!['email']).toBe('example@email.com')
    })

    it('should run a pipeline with an async function, then a sync function, then another async function', async () => {
        const log = [] as string[]
        const db = { foo: 'bar', hello: 'world', handsome: true } as Record<string, any>

        const getFromDb = () =>
            new Promise<Record<string, any>>(resolve => {
                log.push('getFromDb')
                setTimeout(() => {
                    log.push('getFromDb.resolve')
                    resolve(db)
                }, 100)
            })
        const updateDb = (data: Record<string, any>) =>
            new Promise<boolean>(resolve => {
                log.push('updateDb')
                setTimeout(() => {
                    for (const k in data) db[k] = data[k]

                    log.push('updateDb.resolve')
                    resolve(true)
                }, 350)
            })

        const result = await createPipeline()
            .pipe(getFromDb)
            .pipeAsync(db => {
                log.push('edit')

                db['foo'] = 'baz'
                return db
            })
            .pipe(updateDb)
            .depipe()

        expect(result).toBe(true)
        expect(db).toEqual({
            foo: 'baz',
            hello: 'world',
            handsome: true,
        })
        expect(log).toEqual([
            'getFromDb',
            'getFromDb.resolve',
            'edit',
            'updateDb',
            'updateDb.resolve',
        ])
    })
})

describe('enpipe', () => {
    it('should return the pipe function encapsulating the given value/callback', () => {
        const len = (s: string) => s.length
        const _pipe = enpipe('foo')

        expect(_pipe).toBeInstanceOf(Function)
        expect(_pipe(len)).toEqual(pipe('foo').pipe(len))

        const result = _pipe(len)
            .pipe(n => (n > 2 ? 'greater' : 'less'))
            .depipe()

        expect(result).toBe('greater')
        expect(_pipe(len).depipe()).toBe(3)
    })

    it('should enpipe a value as bypass for defined pipeline', async () => {
        const db = {
            users: [] as Record<string, any>[],
            posts: [] as Record<string, any>[],
        } as Record<string, Record<string, any>[]>

        const len = <T = any>(s: string | ArrayLike<T>) => s.length
        const addPostCurried = (post: Record<string, any>) => (id: string) =>
            pipe(addPostFactory).pipe(enpipe(db)).pipe(lambda).invoke(id, post)

        const result = await pipe(addUserFactory)
            .pipe(enpipe(db))
            .pipe(
                enpipe({
                    name: 'Marcus',
                    email: 'example@email.com',
                })
            )
            .pipeAsync(
                addPostCurried({
                    title: 'Hello World',
                    content: 'Lorem ipsum dolor sit amet',
                })
            )
            .pipeAsync(() => {
                if (len(db['users']!) === 0 || len(db['posts']!) === 0) return false

                db['replies'] = []
                return true
            })
            .depipe()

        expect(result).toBe(true)

        expect(db['users']).toBeDefined()
        expect(db['users']).toHaveLength(1)

        expect(db['posts']).toBeDefined()
        expect(db['posts']).toHaveLength(1)

        expect(db['replies']).toBeDefined()
        expect(db['replies']).toHaveLength(0)

        expect(db['users']![0]!['id']).toBe(db['posts']![0]!['user_id'])
        expect(db['posts']![0]!['title']).toBe('Hello World')
        expect(db['posts']![0]!['content']).toBe('Lorem ipsum dolor sit amet')
        expect(db['users']![0]!['name']).toBe('Marcus')
        expect(db['users']![0]!['email']).toBe('example@email.com')
    })
})
