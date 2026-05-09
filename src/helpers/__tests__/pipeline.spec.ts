const uuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

import { getParametersLength } from '../Experimental/curry/helpers.ts'
import { apply } from '../Experimental/pipeline/apply.ts'
import { createPipeline } from '../Experimental/pipeline/createPipeline.ts'
import { enpipe } from '../Experimental/pipeline/enpipe.ts'
import { pipe } from '../Experimental/pipeline/pipe.ts'
import { PipelineBox } from '../Experimental/pipeline/core/PipelineBox.ts'
import { tap } from '../Experimental/pipeline/tap.ts'
import { tapAsync } from '../Experimental/pipeline/tapAsync.ts'

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

        const newUser = { name: 'Marcus', email: 'example@email.com' }
        const newPost = { title: 'Hello World', content: 'Lorem ipsum dolor sit amet' }

        const result = await pipe(newUser)
            .pipe(insertUser)
            .pipeAsync(id => insertPost(id, newPost))
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
                    resolve({ ...db })
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

        const updateDbPipeline = (updateFn: (db: Record<string, any>) => Record<string, any>) =>
            createPipeline().pipe(getFromDb).pipeAsync(updateFn).pipeAsync(updateDb).depipe()

        const updateFoo = () =>
            updateDbPipeline(db => {
                log.push('edit')

                db['foo'] = 'baz'
                return db
            })
        const result = await updateFoo()

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

        const updateHandsome = () =>
            updateDbPipeline(db => {
                log.push('edit')
                db['handsome'] = false
                return db
            })

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

        const result2 = await updateHandsome()

        expect(result2).toBe(true)
        expect(db).toEqual({
            foo: 'baz',
            hello: 'world',
            handsome: false,
        })
        expect(log).toEqual([
            'getFromDb',
            'getFromDb.resolve',
            'edit',
            'updateDb',
            'updateDb.resolve',
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
      pipe(addPostFactory)
      .pipe(fn => fn(db))
      .pipe((fn: (uid: string, p: Record<string, any>) => Promise<boolean>) => fn(id, post))
      .depipe()

    const result = await pipe(addUserFactory)
      .pipe(fn => fn(db))
      .pipe(fn => fn({ name: 'Marcus', email: 'example@email.com' }))
 .pipeAsync(
 (addPostCurried({
 title: 'Hello World',
 content: 'Lorem ipsum dolor sit amet',
 }) as any)
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

 it('should enpipe multiple values in pipeline callback factory function', async () => {
 const db = {
 users: [] as Record<string, any>[],
 posts: [] as Record<string, any>[],
 } as Record<string, Record<string, any>[]>

 const newUser = { name: 'Marcus', email: 'example@email.com' }
 const newPost = { title: 'Hello World', content: 'Lorem ipsum dolor sit amet' }

const addPostCurried = (post: Record<string, any>) => (id: string) =>
  createPipeline(addPostFactory)
  .pipe(fn => fn(db))
  .pipe((fn: (uid: string, p: Record<string, any>) => Promise<boolean>) => fn(id, post))
      .pipeAsync(
        (r: unknown) =>
        new Promise<boolean>(resolve => setTimeout(() => resolve(r as boolean), Math.random() * 1000))
      )
      .depipe()

await createPipeline(addUserFactory)
  .pipe(fn => fn(db))
  .pipe(fn => fn(newUser))
      .pipeAsync(id => (expect(typeof id).toBe('string'), id))
      .pipeAsync(apply(addPostCurried, newPost))
      .pipeAsync(result => (expect(result).toBe(true), result))
      .depipe()

expect(db['users']).toBeDefined()
expect(db['users']).toHaveLength(1)

 expect(db['posts']).toBeDefined()
 expect(db['posts']).toHaveLength(1)

 expect(db['users']![0]!['name']).toBe(newUser.name)
 expect(db['users']![0]!['email']).toBe(newUser.email)
 expect(db['users']![0]!['id']).toBe(db['posts']![0]!['user_id'])
 expect(db['posts']![0]!['title']).toBe(newPost.title)
 expect(db['posts']![0]!['content']).toBe(newPost.content)

    const underparameterizedPipelineCallback = pipe(3)
      .pipe(apply((a: number, b: number, c: number) => a + b + c, 1))
      .depipe() as (b: number) => number

    expect(typeof underparameterizedPipelineCallback).toBe('function')
    expect(getParametersLength(underparameterizedPipelineCallback)).toBe(1)
    expect(underparameterizedPipelineCallback(6)).toBe(10)

    const overparameterizedPipelineCallback = pipe(
      (enpipe as any)((a: any, b: any, c: any) => a + b - c, 1, 2, 3, 4, 5)
    ).depipe()

    expect(typeof overparameterizedPipelineCallback).toBe('number')
    expect(overparameterizedPipelineCallback).toBe(0)

    const underparameterizedPipelineCallback__2 = enpipe((a: number, b: number, c: number) => a + b + c, 1)
      .pipe((fn: (b: number) => (c: number) => number) => enpipe(fn, 2)) as unknown as PipelineBox<(c: number) => number>

 expect(typeof underparameterizedPipelineCallback__2.depipe()).toBe('function')
 expect(getParametersLength(underparameterizedPipelineCallback__2.depipe())).toBe(1)

 expect(underparameterizedPipelineCallback__2.depipe()(3)).toBe(6)
 expect(underparameterizedPipelineCallback__2.depipe()(7)).toBe(10)
 })
})

describe('pipeAsync', () => {
    it('should propagate errors from each pipe', async () => {
        const result = await pipe(Promise.resolve('foo'))
            .pipeAsync(arg => [arg] as const)
            .pipeAsync(([arg]) => {
                if (arg === 'foo') throw new Error('error')

                return 'bar'
            })
            .depipe()
            .catch((error: Error) => error.message)

        expect(result).toBe('error')

 const result2 = await pipe(Promise.resolve('foo'))
 .pipeAsync(arg => [arg] as const)
 .pipeAsync(async ([_]) => {
 return new Promise<string>((_, reject) => reject(new Error('error')))
 })
 .depipe()
 .catch((error: Error) => error.message)

        expect(result2).toBe('error')
    })
})

describe('createPipeline', () => {
  it('should create a pipeline', () => {
    const atob = (s: string) =>
      Buffer.from(s, 'base64').toString() as string & { __tag: 'atob' }
    const split =
      (sep: string = ' ') =>
      (str: string) =>
        str.split(sep)

    const pipeline = createPipeline(atob)
      .pipe(fn => fn('aGVsbG8gd29ybGQ='))
      .pipe(split())
      .depipe()

    expect(pipeline).toEqual(['hello', 'world'])

    const pipeline2 = createPipeline(atob)
      .pipe(fn => fn('aGVsbG8gd29ybGQ='))
      .pipe(enpipe(split, ' ').depipe())
 .depipe()

    expect(pipeline2).toEqual(['hello', 'world'])
  })
})

describe('tap', () => {
  it('should call the tap function with the piped value and return the value unchanged', () => {
    const log: string[] = []
    const result = pipe('hello')
      .pipe(tap(v => log.push(v)))
      .pipe(s => s.toUpperCase())
      .depipe()

    expect(result).toBe('HELLO')
    expect(log).toEqual(['hello'])
  })

  it('should not alter the value even if the tap function mutates its argument', () => {
    const data = { name: 'Marcus', role: 'emperor' }
    const result = pipe(data)
      .pipe(tap(v => { v.role = 'corrupted' }))
      .depipe()

    expect(result).toBe(data)
    expect(result.role).toBe('corrupted')
  })

  it('should allow multiple tap calls in sequence, each receiving the same value', () => {
    const log1: string[] = []
    const log2: string[] = []
    const result = pipe('rome')
      .pipe(tap(v => log1.push(v)))
      .pipe(tap(v => log2.push(v)))
      .pipe(s => s.length)
      .depipe()

    expect(result).toBe(4)
    expect(log1).toEqual(['rome'])
    expect(log2).toEqual(['rome'])
  })

  it('should swallow errors from the tap function by default and continue the pipeline', () => {
    const result = pipe('survives')
      .pipe(tap(() => { throw new Error('boom') }))
      .pipe(s => s.toUpperCase())
      .depipe()

    expect(result).toBe('SURVIVES')
  })

  it('should propagate errors from the tap function when swallow is false', () => {
    expect(() =>
      pipe('dies')
        .pipe(tap(() => { throw new Error('boom') }, { swallow: false }))
        .depipe()
    ).toThrow('boom')
  })

  it('should route tap errors to the catch handler when provided', () => {
    const errors: Error[] = []
    const result = pipe('hello')
      .pipe(tap(() => { throw new Error('tap-fail') }, { catch: e => errors.push(e as Error) }))
      .pipe(s => s.toUpperCase())
      .depipe()

    expect(result).toBe('HELLO')
    expect(errors).toHaveLength(1)
    expect(errors[0]!.message).toBe('tap-fail')
  })

  it('should call the catch handler before re-throwing when both catch and swallow:false are set', () => {
    const errors: Error[] = []

    expect(() =>
      pipe('hello')
        .pipe(tap(() => { throw new Error('tap-fail') }, { swallow: false, catch: e => errors.push(e as Error) }))
        .depipe()
    ).toThrow('tap-fail')

    expect(errors).toHaveLength(1)
    expect(errors[0]!.message).toBe('tap-fail')
  })

  it('should allow chaining .catch() on the tap factory function', () => {
    const errors: Error[] = []
    const result = pipe('hello')
      .pipe(tap((_s: string) => { throw new Error('tap-fail') }).catch(e => errors.push(e as Error)))
      .pipe(s => s.toUpperCase())
      .depipe()

    expect(result).toBe('HELLO')
    expect(errors).toHaveLength(1)
    expect(errors[0]!.message).toBe('tap-fail')
  })

  it('should return a valid pipeline function from tap(fn).catch(handler)', () => {
    const errors: Error[] = []
    const tapFn = tap((_s: string) => { throw new Error('fail') }).catch(e => errors.push(e as Error))

    expect(typeof tapFn).toBe('function')
    expect(tapFn('input')).toBe('input')
    expect(errors).toHaveLength(1)
  })

  it('should throw if .catch() receives a non-unary function', () => {
    expect(() => tap(() => {}).catch('not a function' as any)).toThrow()
    expect(() => tap(() => {}).catch(((_a: any, _b: any) => {}) as any)).toThrow()
  })

  it('should act as a logging breakpoint in a multi-step pipeline', () => {
    const log: string[] = []
    const breakWords = (s: string) => s.split(/\b/)
    const removeEmpty = (words: string[]) => words.filter(w => /\S/.test(w))
    const joinWithComma = (words: string[]) => words.join(', ')

    const result = pipe('the rat gnawed the clothes of the Rome King')
      .pipe(breakWords)
      .tap(v => log.push(`after break: ${v.length} words`))
      .pipe(removeEmpty)
      .tap(v => log.push(`after filter: ${v.length} words`))
      .pipe(joinWithComma)
      .depipe()

    expect(result).toBe('the, rat, gnawed, the, clothes, of, the, Rome, King')
    expect(log).toEqual(['after break: 17 words', 'after filter: 9 words'])
  })
})

describe('tapAsync factory', () => {
  it('should call the async tap function and pass value through', async () => {
    const log: string[] = []
    const result = await pipe(Promise.resolve('hello'))
      .pipeAsync(tapAsync(async v => { log.push(v) }))
      .pipeAsync(s => s.toUpperCase())
      .depipe()

    expect(result).toBe('HELLO')
    expect(log).toEqual(['hello'])
  })

  it('should accept a sync function in tapAsync factory', async () => {
    const log: string[] = []
    const result = await pipe(Promise.resolve('hello'))
      .pipeAsync(tapAsync(v => { log.push(v) }))
      .pipeAsync(s => s.toUpperCase())
      .depipe()

    expect(result).toBe('HELLO')
    expect(log).toEqual(['hello'])
  })

  it('should swallow errors from the async tap function by default and continue the pipeline', async () => {
    const result = await pipe(Promise.resolve('survives'))
      .pipeAsync(tapAsync(async () => { throw new Error('async-boom') }))
      .pipeAsync(s => s.toUpperCase())
      .depipe()

    expect(result).toBe('SURVIVES')
  })

  it('should propagate errors when swallow is false', async () => {
    const result = await pipe(Promise.resolve('dies'))
      .pipeAsync(tapAsync(async () => { throw new Error('async-boom') }, { swallow: false }))
      .pipeAsync(s => s.toUpperCase())
      .depipe()
      .catch((e: Error) => e.message)

    expect(result).toBe('async-boom')
  })

  it('should route tap errors to the catch handler when provided', async () => {
    const errors: Error[] = []
    const result = await pipe(Promise.resolve('hello'))
      .pipeAsync(tapAsync(async () => { throw new Error('async-fail') }, { catch: e => errors.push(e as Error) }))
      .pipeAsync(s => s.toUpperCase())
      .depipe()

    expect(result).toBe('HELLO')
    expect(errors).toHaveLength(1)
    expect(errors[0]!.message).toBe('async-fail')
  })

  it('should call the catch handler before re-throwing when both catch and swallow:false are set', async () => {
    const errors: Error[] = []
    const result = await pipe(Promise.resolve('hello'))
      .pipeAsync(tapAsync(async () => { throw new Error('async-fail') }, { swallow: false, catch: e => errors.push(e as Error) }))
      .pipeAsync(s => s.toUpperCase())
      .depipe()
      .catch((e: Error) => e.message)

    expect(result).toBe('async-fail')
    expect(errors).toHaveLength(1)
    expect(errors[0]!.message).toBe('async-fail')
  })

  it('should allow chaining .catch() on the tapAsync factory function', async () => {
    const errors: Error[] = []
    const result = await pipe(Promise.resolve('hello'))
      .pipeAsync(tapAsync(async (_s: string) => { throw new Error('async-fail') }).catch(e => errors.push(e as Error)))
      .pipeAsync(s => s.toUpperCase())
      .depipe()

    expect(result).toBe('HELLO')
    expect(errors).toHaveLength(1)
    expect(errors[0]!.message).toBe('async-fail')
  })

  it('should return a valid async pipeline function from tapAsync(fn).catch(handler)', async () => {
    const errors: Error[] = []
    const tapAsyncFn = tapAsync(async (_s: string) => { throw new Error('fail') }).catch(e => errors.push(e as Error))

    expect(typeof tapAsyncFn).toBe('function')
    const result = await tapAsyncFn('input')
    expect(result).toBe('input')
    expect(errors).toHaveLength(1)
  })

  it('should throw if .catch() receives a non-unary function', () => {
    expect(() => tapAsync(async () => {}).catch('not a function' as any)).toThrow()
    expect(() => tapAsync(async () => {}).catch(((_a: any, _b: any) => {}) as any)).toThrow()
  })

  it('should perform an async side-effect in a realistic DB flow', async () => {
    const db = { users: [] as Record<string, any>[], posts: [] as Record<string, any>[], audit: [] as Record<string, any>[] }
    const insertUser = addUserFactory(db)
    const insertPost = addPostFactory(db)
    const newUser = { name: 'Marcus', email: 'example@email.com' }
    const newPost = { title: 'Hello World', content: 'Lorem ipsum dolor sit amet' }

    const result = await pipe(newUser)
      .pipe(insertUser)
      .pipeAsync(tapAsync(async id => {
        await new Promise(r => setTimeout(r, 50))
        db.audit.push({ event: 'user_created', id })
      }, { catch: (e: unknown) => db.audit.push({ event: 'audit_error', error: (e as Error).message }) }))
      .pipeAsync(id => insertPost(id, newPost))
      .depipe()

    expect(result).toBe(true)
    expect(db.users).toHaveLength(1)
    expect(db.posts).toHaveLength(1)
    expect(db.audit).toHaveLength(1)
    expect(db.audit[0]!['event']).toBe('user_created')
    expect(db.posts[0]!['title']).toBe('Hello World')
  })
})

describe('.tap()', () => {
  it('should be equivalent to .pipe(tap(fn))', () => {
    const logFluent: string[] = []
    const logFactory: string[] = []

    const fluent = pipe('hello').tap(v => logFluent.push(v)).depipe()
    const factory = pipe('hello').pipe(tap(v => logFactory.push(v))).depipe()

    expect(fluent).toBe(factory)
    expect(logFluent).toEqual(logFactory)
  })

  it('should return a piped value that can continue the chain', () => {
    const log: string[] = []
    const result = pipe('hello')
      .tap(v => log.push(v))
      .pipe(s => s.toUpperCase())
      .depipe()

    expect(result).toBe('HELLO')
    expect(log).toEqual(['hello'])
  })

  it('should depipe correctly after tap', () => {
    const result = pipe(42).tap(v => void v).depipe()

    expect(result).toBe(42)
  })

  it('should swallow errors by default on the fluent .tap() method', () => {
    const result = pipe('survives')
      .tap(() => { throw new Error('boom') })
      .pipe(s => s.toUpperCase())
      .depipe()

    expect(result).toBe('SURVIVES')
  })

  it('should propagate errors when swallow:false is passed to the fluent .tap() method', () => {
    expect(() =>
      pipe('dies')
        .tap(() => { throw new Error('boom') }, { swallow: false })
        .depipe()
    ).toThrow('boom')
  })

  it('should route errors to catch handler on the fluent .tap() method', () => {
    const errors: Error[] = []
    const result = pipe('hello')
      .tap(() => { throw new Error('tap-fail') }, { catch: e => errors.push(e as Error) })
      .pipe(s => s.toUpperCase())
      .depipe()

    expect(result).toBe('HELLO')
    expect(errors).toHaveLength(1)
    expect(errors[0]!.message).toBe('tap-fail')
  })

  it('should tap the result of an async DB insert for logging without breaking the pipeline', async () => {
    const db = { users: [] as Record<string, any>[] }
    const auditLog: Record<string, any>[] = []
    const insertUser = addUserFactory(db)
    const newUser = { name: 'Marcus', email: 'example@email.com' }

    const userId = await pipe(newUser)
      .pipe(insertUser)
      .tap(id => auditLog.push({ event: 'user_created', id }))
      .depipe()

    expect(typeof userId).toBe('string')
    expect(auditLog).toHaveLength(1)
    expect(auditLog[0]!['event']).toBe('user_created')
    expect(auditLog[0]!['id']).toBe(userId)
  })
})

describe('.tapAsync()', () => {
  it('should await the async tap function before passing the value through', async () => {
    const log: string[] = []
    const result = await pipe(Promise.resolve('hello'))
      .tapAsync(async v => {
        await new Promise(r => setTimeout(r, 50))
        log.push(v)
      })
      .pipeAsync(s => s.toUpperCase())
      .depipe()

    expect(result).toBe('HELLO')
    expect(log).toEqual(['hello'])
  })

  it('should accept a synchronous function in tapAsync', async () => {
    const log: string[] = []
    const result = await pipe(Promise.resolve('hello'))
      .tapAsync(v => { log.push(v) })
      .pipeAsync(s => s.toUpperCase())
      .depipe()

    expect(result).toBe('HELLO')
    expect(log).toEqual(['hello'])
  })

  it('should swallow errors from tapAsync by default and continue the pipeline', async () => {
    const result = await pipe(Promise.resolve('survives'))
      .tapAsync(async () => { throw new Error('async-boom') })
      .pipeAsync(s => s.toUpperCase())
      .depipe()

    expect(result).toBe('SURVIVES')
  })

  it('should propagate errors when swallow:false is passed to tapAsync', async () => {
    const result = await pipe(Promise.resolve('dies'))
      .tapAsync(async () => { throw new Error('async-boom') }, { swallow: false })
      .pipeAsync(s => s.toUpperCase())
      .depipe()
      .catch((e: Error) => e.message)

    expect(result).toBe('async-boom')
  })

  it('should route tapAsync errors to the catch handler', async () => {
    const errors: Error[] = []
    const result = await pipe(Promise.resolve('hello'))
      .tapAsync(async () => { throw new Error('async-fail') }, { catch: (e: unknown) => errors.push(e as Error) })
      .pipeAsync(s => s.toUpperCase())
      .depipe()

    expect(result).toBe('HELLO')
    expect(errors).toHaveLength(1)
    expect(errors[0]!.message).toBe('async-fail')
  })

  it('should work with .pipeAsync(tap(fn)) for sync side-effects in async pipelines', async () => {
    const log: string[] = []
    const result = await pipe(Promise.resolve('hello'))
      .pipeAsync(tap(v => { log.push(v) }))
      .pipeAsync(s => s.toUpperCase())
      .depipe()

    expect(result).toBe('HELLO')
    expect(log).toEqual(['hello'])
  })

  it('should perform an async side-effect between pipeline steps in a realistic DB flow', async () => {
    const db = {
      users: [] as Record<string, any>[],
      posts: [] as Record<string, any>[],
      audit: [] as Record<string, any>[],
    }
    const insertUser = addUserFactory(db)
    const insertPost = addPostFactory(db)
    const newUser = { name: 'Marcus', email: 'example@email.com' }
    const newPost = { title: 'Hello World', content: 'Lorem ipsum dolor sit amet' }

    const result = await pipe(newUser)
      .pipe(insertUser)
      .tapAsync(async id => {
        await new Promise(r => setTimeout(r, 50))
        db.audit.push({ event: 'user_created', id })
      }, { catch: (e: unknown) => db.audit.push({ event: 'audit_error', error: (e as Error).message }) })
      .pipeAsync(id => insertPost(id, newPost))
      .depipe()

    expect(result).toBe(true)
    expect(db.users).toHaveLength(1)
    expect(db.posts).toHaveLength(1)
    expect(db.audit).toHaveLength(1)
    expect(db.audit[0]!['event']).toBe('user_created')
    expect(db.posts[0]!['title']).toBe('Hello World')
  })

  it('should call the catch handler before rejecting when both catch and swallow:false are set on tapAsync', async () => {
    const errors: Error[] = []
    const result = await pipe(Promise.resolve('hello'))
      .tapAsync(async () => { throw new Error('async-fail') }, { swallow: false, catch: (e: unknown) => errors.push(e as Error) })
      .pipeAsync(s => s.toUpperCase())
      .depipe()
      .catch((e: Error) => e.message)

    expect(result).toBe('async-fail')
    expect(errors).toHaveLength(1)
    expect(errors[0]!.message).toBe('async-fail')
  })

  it('should support chaining .tapAsync() then .tap() on async values', async () => {
    const log: string[] = []
    const result = await pipe(Promise.resolve('hello'))
      .tapAsync(async v => { log.push(`async: ${v}`) })
      .tap(v => { log.push(`sync: ${v}`) })
      .pipeAsync(s => s.toUpperCase())
      .depipe()

    expect(result).toBe('HELLO')
    expect(log).toEqual(['async: hello', 'sync: hello'])
  })

  it('should support chaining 3+ .tap() calls on async values', async () => {
    const log: string[] = []
    const result = await pipe(Promise.resolve('x'))
      .tap(v => { log.push(`1: ${v}`) })
      .tap(v => { log.push(`2: ${v}`) })
      .tap(v => { log.push(`3: ${v}`) })
      .tap(v => { log.push(`4: ${v}`) })
      .pipeAsync(s => s.toUpperCase())
      .depipe()

    expect(result).toBe('X')
    expect(log).toEqual(['1: x', '2: x', '3: x', '4: x'])
  })

  it('should properly unwrap Number primitives in .tap() callback', () => {
    const log: number[] = []
    const result = pipe(42)
      .tap(v => { log.push(v) })
      .pipe(n => n * 2)
      .depipe()

    expect(result).toBe(84)
    expect(log).toEqual([42])
    expect(typeof log[0]).toBe('number')
  })

  it('should properly unwrap Boolean primitives in .tap() callback', () => {
    const log: boolean[] = []
    const result = pipe(true)
      .tap(v => { log.push(v) })
      .pipe(b => !b)
      .depipe()

    expect(result).toBe(false)
    expect(log).toEqual([true])
    expect(typeof log[0]).toBe('boolean')
  })

  it('should properly unwrap primitives in .tapAsync() callback', async () => {
    const log: number[] = []
    const result = await pipe(Promise.resolve(42))
      .tapAsync(async v => { log.push(v) })
      .pipeAsync(n => n * 2)
      .depipe()

    expect(result).toBe(84)
    expect(log).toEqual([42])
    expect(typeof log[0]).toBe('number')
  })
})
