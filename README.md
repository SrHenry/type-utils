# Type Utils

[npm]: https://npmjs.com/package/@srhenry/type-utils

> Type utilities module for Typescript and also Javascript. It can secure your application from invalid data being pushed inside and breaking things as it can shape and model your data to prevent invalid data. Check out the documentation for further details.

<div align="center">

[![GitHub](https://badgen.net/badge/icon/github?icon=github&label)](https://github.com/SrHenry/type-utils)
[![Npm package version](https://badgen.net/npm/v/@srhenry/type-utils)][npm]
[![Npm package total downloads](https://badgen.net/npm/dt/@srhenry/type-utils)][npm]
[![Npm package license](https://badgen.net/npm/license/@srhenry/type-utils)][npm]

</div>

## Table of Contents

- [Type Utils](#type-utils)
  - [Table of Contents](#table-of-contents)
  - [Installing](#installing)
  - [Docs](#docs)
    - [Schema types](#schema-types)
      - [`Schema.string`](#schemastring)
      - [`Schema.number`](#schemanumber)
      - [`Schema.boolean`](#schemaboolean)
      - [`Schema.object`](#schemaobject)
      - [`Schema.array`](#schemaarray)
      - [`Schema.symbol`](#schemasymbol)
      - [`Schema.asEnum`](#schemaasenum)
      - [`Schema.asNull`](#schemaasnull)
      - [`Schema.primitive`](#schemaprimitive)
      - [`Schema.any`](#schemaany)
      - [`Schema.optional`](#schemaoptional)
    - [Schema helpers](#schema-helpers)
      - [`Schema.and`](#schemaand)
      - [`Schema.or`](#schemaor)
      - [`Schema.useSchema`](#schemauseschema)
    - [Validation rules](#validation-rules)
      - [`Number.nonZero`](#numbernonzero)
      - [`Number.max`](#numbermax)
      - [`Number.min`](#numbermin)
      - [`Array.max`](#arraymax)
      - [`Array.min`](#arraymin)
      - [`Array.unique`](#arrayunique)
      - [`String.max`](#stringmax)
      - [`String.min`](#stringmin)
      - [`String.regex`](#stringregex)
      - [`String.nonEmpty`](#stringnonempty)
      - [`String.url`](#stringurl)
      - [`String.email`](#stringemail)
      - [`Record.nonEmpty`](#recordnonempty)
      - [`Schema.use`](#schemause)
    - [Available validations](#available-validations)
      - [`is`](#is)
      - [`ensureInterface`](#ensureinterface)
    - [Util types](#util-types)
      - [`Fn`](#fn)
      - [`AsyncFn`](#asyncfn)
      - [`Action`](#action)
      - [`Predicate`](#predicate)
      - [`Result`](#result)
      - [`AsyncResult`](#asyncresult)
      - [`TupleSlice`](#tupleslice)
      - [`Param`](#param)
      - [`Infer`](#infer)
  - [Experimental Features](#experimental-features)
    - [Lambda](#lambda)
    - [Function/Lambda Currying](#functionlambda-currying)
    - [Pipelines/Pipes](#pipelinespipes)
    - [Switch Expression](#switch-expression)
      - [Reusable switcher](#reusable-switcher)
      - [Stored switcher](#stored-switcher)
      - [more complex matching logic / runtime branch evaluation](#more-complex-matching-logic--runtime-branch-evaluation)

## Installing

With NPM:

```bash
npm install @srhenry/type-utils --save
```

With Yarn:

```bash
yarn add @srhenry/type-utils
```

## Docs

> [See: API - Github Pages](https://srhenry.github.io/type-utils)

### Schema types

#### [`Schema.string`](https://srhenry.github.io/type-utils/variables/string.html)

It represents a string to typescript's type infers and runtime validation

```typescript
import { string } from '@srhenry/type-utils'

const isString = string() //any string
const isAvocadoString = string('avocado') //specific string
const isPatternString = string(/goo+gle/) //pattern/RegExp matched string
```

#### [`Schema.number`](https://srhenry.github.io/type-utils/variables/number.html)

It represents a number to typescript's type infers and runtime validation

```typescript
import { number } from '@srhenry/type-utils'

const isNumber = number()
```

#### [`Schema.boolean`](https://srhenry.github.io/type-utils/variables/boolean.html)

It represents a number to typescript's type infers and runtime validation

```typescript
import { boolean } from '@srhenry/type-utils'

const isBoolean = boolean()
```

#### [`Schema.object`](https://srhenry.github.io/type-utils/variables/object.html)

It represents a well defined object to typescript's type infers and runtime validation, which its properties are also described using the Schema helpers

```typescript
import { object, string, number } from '@srhenry/type-utils'

const isMyObject = object({
    foo: string(),
    bar: number(),
})
```

#### [`Schema.array`](https://srhenry.github.io/type-utils/variables/array.html)

It represents an array to typescript's type infers and runtime validation, which its items can also be described using the Schema helpers

```typescript
import { array, string, object } from '@srhenry/type-utils'

const isArray = array() // array of anything
const isMyArray = array(string()) // array of strings
const isMyObjArray = array(object({ foo: string('bar') }))
const isMyObjArray2 = array({ foo: string('bar') })
```

#### [`Schema.symbol`](https://srhenry.github.io/type-utils/variables/symbol.html)

It represents a symbol to typescript's type infers and runtime validation

```typescript
import { symbol } from '@srhenry/type-utils'

const isSymbol = symbol()
```

#### [`Schema.asEnum`](https://srhenry.github.io/type-utils/variables/asEnum.html)

It represents a closed switch values to typescript's type infers and runtime validation. It ensures your value is one of the values given in params.

```typescript
import { asEnum } from "@srhenry/type-utils"

enum Status {
  ready: 1,
  running: 2,
  stopped: 3,
}

const validStatus = [...Object.keys(Status)] as (keyof typeof Status)[]

const isStatus = asEnum(validStatus)
```

#### [`Schema.asNull`](https://srhenry.github.io/type-utils/variables/asNull.html)

It represents a null literal to typescript's type infers and runtime validation.

```typescript
import { asNull } from '@srhenry/type-utils'

const isNull = asNull()
```

#### [`Schema.primitive`](https://srhenry.github.io/type-utils/variables/primitive.html)

It represents a primitive values (such as string, number, boolean, symbol, null, undefined) to typescript's type infers and runtime validation.

```typescript
import { primitive } from '@srhenry/type-utils'

const isSymbol = primitive()
```

#### [`Schema.any`](https://srhenry.github.io/type-utils/variables/any.html)

It represents a 'any' value to typescript's type infers and runtime validation. It does nothing to validate a narrowed type but can be useful to improve readability in more complex schemas.

```typescript
import { any, object } from '@srhenry/type-utils'

const isAny = any()
const objectHasFoo = object({ foo: isAny }) //it checks if is object and if has `foo` property but doesn't care checking its type
```

#### `Schema.optional`

> Since [`v0.5.0`](https://github.com/SrHenry/type-utils/releases/tag/v0.5.0), this method was removed, but also embeded in all exported schemas.

> Since [`v0.6.0`](https://github.com/SrHenry/type-utils/releases/tag/v0.6.0), this method was replaced to be a property in the returned type guard instead of a property of the schema.

It represents a optional value to typescript's type infers and runtime validation. You can access this schema by acessing the `.optional` property in the desired optional schema:

```typescript
import { object, string, number } from '@srhenry/type-utils'

const objectMaybeHasFoo = object({
    foo: string().optional(),
    bar: number().optional()
})
// it checks if is object and if has `foo`.
// if it has `foo` then check if it is string or undefined,
// if it hasn't then pass anyway as it is optional property.
```

### Schema helpers

#### [`Schema.and`](https://srhenry.github.io/type-utils/variables/and.html)

It creates an intersection between two schemas.

```typescript
import { object, string, and } from '@srhenry/type-utils'

const hasFoo = object({ foo: string() })
const hasBar = object({ bar: string() })
const isSomething = and(hasFoo, hasBar)
```

#### [`Schema.or`](https://srhenry.github.io/type-utils/variables/or.html)

It creates an union between two schemas.

```typescript
import { string, boolean, or } from '@srhenry/type-utils'

const isString = string()
const isBool = boolean()
const isSomething = or(isString, isBool)
```

#### [`Schema.useSchema`](https://srhenry.github.io/type-utils/variables/useSchema.html)

It wraps a schema (just to improve readability).

```typescript
import { object, string, array, useSchema } from '@srhenry/type-utils'

const hasFoo = object({ foo: string() })
const isFooArray = array(useSchema(hasFoo))
```

### Validation rules

#### [`Number.nonZero`](https://srhenry.github.io/type-utils/variables/NumberRules.html#nonzero)

It constraints a number to be different from 0.

```typescript
import { number } from '@srhenry/type-utils'

const isNonZeroNumber = number().nonZero()
```

#### [`Number.max`](https://srhenry.github.io/type-utils/variables/NumberRules.html#max)

It constraints a number to be lesser than a given number.

```typescript
import { number } from '@srhenry/type-utils'

const isNonZeroNumber = number().max(255)
```

#### [`Number.min`](https://srhenry.github.io/type-utils/variables/NumberRules.html#min)

It constraints a number to be greater than a given number.

```typescript
import { number } from '@srhenry/type-utils'

const isNonZeroNumber = number().min(1)
```

#### [`Array.max`](https://srhenry.github.io/type-utils/variables/ArrayRules.html#max)

It constraints an array's size to be lesser than a given number.

```typescript
import { array, any } from '@srhenry/type-utils'

const isArray = array(any()).max(25)
```

#### [`Array.min`](https://srhenry.github.io/type-utils/variables/ArrayRules.html#min)

It constraints an array's size to be greater than a given number.

```typescript
import { array, any } from '@srhenry/type-utils'

const isArray = array(any()).min(2)
```

#### [`Array.unique`](https://srhenry.github.io/type-utils/variables/ArrayRules.html#unique)

It constraints an array to contain only distinct values, failling if a duplicate is found.

```typescript
import { array, string } from '@srhenry/type-utils'

const isArray = array(string()).unique()
```

#### [`String.max`](https://srhenry.github.io/type-utils/variables/StringRules.html#max)

It constraints a string's size to be lesser than a given number.

```typescript
import { string } from '@srhenry/type-utils'

const isString = string().max(60)
```

#### [`String.min`](https://srhenry.github.io/type-utils/variables/StringRules.html#min)

It constraints a string's size to be greater than a given number.

```typescript
import { string } from '@srhenry/type-utils'

const isString = string().min(10)
```

#### [`String.regex`](https://srhenry.github.io/type-utils/variables/StringRules.html#regex)

It constraints a string to match a given pattern (regular expression).

```typescript
import { string } from '@srhenry/type-utils'

const isNumericString = string(/[0-9]+/)
// or using fluent pattern:
const isNumericString2 = string().regex(/[0-9]+/)
```

#### [`String.nonEmpty`](https://srhenry.github.io/type-utils/variables/StringRules.html#nonEmpty)

It constraints a string's size to be greater than 0.

```typescript
import { string } from '@srhenry/type-utils'

const isString = string().nonEmpty()
```

#### [`String.url`](https://srhenry.github.io/type-utils/variables/StringRules.html#url)

It constraints a string to be a valid url representation.

```typescript
import { string } from '@srhenry/type-utils'

const isStringUrl = string().url()
```

#### [`String.email`](https://srhenry.github.io/type-utils/variables/StringRules.html#email)

It constraints a string to be a valid email representation.

```typescript
import { string } from '@srhenry/type-utils'

const isStringEmail = string().email()
```

#### [`Record.nonEmpty`](https://srhenry.github.io/type-utils/variables/RecordRules.html#nonEmpty)

It constrains a record to not be empty.

```typescript
import { record } from '@srhenry/type-utils'


const isNonEmptyRecord = record().nonEmpty()
```

#### `Schema.use`

> Since [`v0.6.0`](https://github.com/SrHenry/type-utils/releases/tag/v0.6.0)

It allows you to create custom validation rules to be used in schemas.

```typescript
import { string, createRule } from '@srhenry/type-utils'

const StringNumber = createRule({
    name: "Custom.StringNumber",
    message: "number",
    handler: (value: string) => () => !Number.isNaN(Number(value)),
});

const isStringNumber = string().use(StringNumber())
```

#### `Schema.validator`

> Since [`v0.6.1`](https://github.com/SrHenry/type-utils/releases/tag/v0.6.1)

It allows you to get a validator instance to validate a value against the schema.

```typescript
import { string, or, object, createInlineRule, createRule } from '@srhenry/type-utils'

const StringNumber = createRule({
    name: "Custom.StringNumber",
    message: "number",
    handler: (value: string) => () => !Number.isNaN(Number(value)),
});

const isStringNumberOrObject = or(
    string()
        .use(createInlineRule("Custom.StringNumber", (value: string) => !Number.isNaN(Number(value)))),
    object({
        foo: string().use(StringNumber()),
        bar: string().optional()
    }));
```

### Available validations

#### [`is`](https://srhenry.github.io/type-utils/functions/is.html)

It checks a given value against a given schema or validator and return true if schema matches the value, otherwise return false.

```typescript
import { string, is } from '@srhenry/type-utils'

//...
if (is(value, string())) {
    // value is string
} else {
    // value is not a string
}
```

#### [`ensureInterface`](https://srhenry.github.io/type-utils/functions/ensureInterface.html)

It checks a given value against a given schema or validator and returns the checked value with schema inferred type if schema matches the value or throws an error if schema didn't match the value. Pretty clean to use with destructuring pattern.

```typescript
import { object, number, string, ensureInterface } from '@srhenry/type-utils'

//...
const { foo, bar } = ensureInterface(value, object({
    foo: number(),
    bar: string(),
}) //It throws an error if validation fails!

console.log('foo', foo) // foo
console.log('bar', bar) // bar
```

***NOTE:** You can use schema directly to validate a value.*

```typescript
import { object, number } from "@srhenry/type-utils"

const hasFoo = object({ foo: number() }))

//...
if (hasFoo(obj)) {
  // obj is object and contains a string property named `foo`
} else {
  // obj don't have a `foo` property of type string
}
```

### `Util Types`

#### [`Fn`](https://srhenry.github.io/type-utils/types/Fn.html)

It represents a synchronous function type.
It has two type parameters: the first is a tuple representing the function parameters types, and the second is the return type of the function.

```typescript
import type { Fn } from '@srhenry/type-utils'

declare const fn: Fn<[number, number], number> // fn: (arg_0: number, arg_1: number) => number
```

#### [`AsyncFn`](https://srhenry.github.io/type-utils/types/AsyncFn.html)

It represents an asynchronous function type.
It has two type parameters: the first is a tuple representing the function parameters types, and the second is the resolved return type of the function.

```typescript
import type { AsyncFn } from '@srhenry/type-utils'

declare const fn: AsyncFn<[number, number], number> // fn: (arg_0: number, arg_1: number) => Promise<number>
```

#### [`Action`](https://srhenry.github.io/type-utils/types/Action.html)

It represents a synchronous function type that does not return any value (void).
It has one type parameter: a tuple representing the function parameters type.

```typescript
import type { Action } from '@srhenry/type-utils'

declare const fn: Action<[string]> // fn: (arg_0: string) => void
```

#### [`Predicate`](https://srhenry.github.io/type-utils/types/Predicate.html)

It represents a predicate function type.
It has one type parameter: a tuple representing the function parameters type.

```typescript
import type { Predicate } from '@srhenry/type-utils'

declare const fn: Predicate<[any]> // fn: (arg_0: any) => boolean
```

#### [`Result`](https://srhenry.github.io/type-utils/types/Result.html)

It represents an result type tuple.
It has two type parameters: the first is the success type, and the second is the failure type (optional, default `Error`).

```typescript
import type { Result } from '@srhenry/type-utils'

declare const res1: Result<number> // res1: [null, number] | [Error, null]
declare const res2: Result<string, TypeError> // res2: [null, string] | [TypeError, null]
```

#### [`AsyncResult`](https://srhenry.github.io/type-utils/types/AsyncResult.html)

It represents an asynchronous result type tuple.
It has two type parameters: the first is the success type, and the second is the failure type (optional, default `Error`).

```typescript
import type { AsyncResult } from '@srhenry/type-utils'

declare const res1: AsyncResult<number> // res1: [null, number] | [Error, null]
declare const res2: AsyncResult<string, TypeError> // res2: [null, string] | [TypeError, null]
```

#### [`TupleSlice`](https://srhenry.github.io/type-utils/types/TupleSlice.html)

It slices a tuple type.
It has three type parameters: the first is the tuple type to be sliced, the second is the start index (inclusive), and the third is the end index (exclusive, optional, default to tuple length).

```typescript
import type { TupleSlice } from '@srhenry/type-utils'

declare const res1: TupleSlice<[number, string, boolean], 1> // res1: [string, boolean]
declare const res2: TupleSlice<[number, string, boolean], 1, 2> // res2: [string]
```

#### [`Param`](https://srhenry.github.io/type-utils/types/Param.html)

It extracts the type of a function parameter by its index.
It has two type parameters: the first is the function type, and the second is the parameter index.

```typescript
import type { Param } from '@srhenry/type-utils'

declare const res1: Param<(a: number, b: string) => void, 0> // res1: number
declare const res2: Param<(a: number, b: string) => void, 1> // res2: string
```

#### [`Infer`](https://srhenry.github.io/type-utils/types/Infer.html)

It infers the type from a type guard function.
It has one type parameter: the type guard function type.

```typescript
import { type Infer, array } from '@srhenry/type-utils'

declare const isArray = array()

declare const res1: Infer<(a: unknown) => a is number> // res1: number
declare const res2: Infer<(a: unknown) => a is string[]> // res2: string[]
declare const res3: Infer<typeof isArray> // res3: any[]
```

## Experimental Features

### [Lambda](https://srhenry.github.io/type-utils/functions/Experimental.lambda.html)

This was inspired in C# Lambdas, equivalent to arrow functions in Javascript/Typescript, but this helper adds `invoke()` method to a function instance. useful to improve readability when you have a function that returns another and you wanna call 'em all in a row, using fluent pattern.

```typescript
import { Experimental } from '@srhenry/type-utils'

const { lambda } = Experimental

function builder(locales: string | string[] = 'en-US') {
    function formatter(
        options: Intl.DateTimeFormatOptions = {
            dateStyle: 'short',
            timeStyle: 'short',
        }
    ) {
        function format(date: Date | string) {
            return new Intl.DateTimeFormat(locales, options).format(new Date(date))
        }

        return lambda(format)
    }

    return lambda(formatter)
}

console.log(
    '1970-01-01T00:00 =',
    builder('en-UK').invoke({ dateStyle: 'long' }).invoke('1970-01-01')
) // 01 January 1970
```

---

### [Function/Lambda Currying](https://srhenry.github.io/type-utils/functions/Experimental.curry.html)

This does type-wisely curries a function or lambda, in two flavors: allowing or not partial param applying (default is not allowed). The process of currying a function is traditionally a techique that allows you to call the refered function passing one parameter at a time, returning another function to further apply remaining parameters, then returning whatever the original function returns after all parameters were given to curried function. In Javascript this techinque usually allows partial apply, and in that way you can pass more than one parameter at a time, and everything else remains equal to the traditional currying.

```typescript
import { Experimental } from '@srhenry/type-utils'

const { lambda, curry } = Experimental

// lets reuse earlier example:
function builder(
    locales: string | string[],
    options: Intl.DateTimeFormatOptions,
    date: Date | string
) {
    return new Intl.DateTimeFormat(locales, options).format(new Date(date))
}

const curried = curry(builder)
const curriedLambda = curry(lambda(builder))

console.log(
    curried('en-GB')({ timeStyle: 'short', timeZone: 'Etc/Greenwich' })(
        new Date('2020-05-10T22:35:08Z')
    )
) // 22:35

console.log(
    curriedLambda('en-US')
        .invoke({ dateStyle: 'short', timeStyle: 'short', timeZone: 'America/New_York' })
        .invoke(new Date('2020-05-10T22:35:08Z'))
) // (EDT) 5/10/20, 6:35 PM
```

---

### [Pipelines/Pipes](https://srhenry.github.io/type-utils/functions/Experimental.pipe.html)

This is a fluent API to create sync/async function pipelines. Inspired in FP pipe operator while it does not comes to Javascript/Typescript yet. It allows only single param functions, piping the return as the parameter to the next function in pipeline.

```typescript
import { Experimental } from '@srhenry/type-utils'

const { pipe, enpipe, lambda } = Experimental

const addUserFactory =
    (db: Record<string, Record<string, any>[]>) => (user: Record<string, any>) =>
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
    .depipe() // true | false
```

---

### [Switch Expression](https://srhenry.github.io/type-utils/functions/Experimental._switch.html)

This helper enables you to build switch expressions as it is not available in Javascript vanilla. Each branch allows you to define the matchers or values ahead of time with literal values or inline expressions, or define with callbacks to customize handling of each branch, making it a powerfull way to describe a complex switch without *if-else-if* language syntax. It defines a lambda as the switch runner, so you can define and run it in the row with more readability.

#### [Reusable switcher](https://srhenry.github.io/type-utils/functions/Experimental._switch.html#switch)

```typescript
const switcher = $switch()
    .case(4, 'four')
    .case(3, 'three')
    .case(2, 'two')
    .case(1, 'one')
    .default('none of the above') // it does not run yet

console.log(switcher.invoke(1)) // one
console.log(switcher.invoke(3)) // three
console.log(switcher.invoke(10)) // none of the above
```

#### [Stored switcher](https://srhenry.github.io/type-utils/functions/Experimental._switch.html#switch-1)

```typescript
const switcher = $switch(5)
    .case(4, 'four')
    .case(3, 'three')
    .case(2, 'two')
    .case(1, 'one')
    .default('none of the above') // it does not run yet

console.log(switcher()) // none of the above
console.log(switcher.invoke()) // none of the above
console.log(switcher.invoke(1)) // none of the above
console.log(switcher(3)) // none of the above
```

#### [more complex matching logic / runtime branch evaluation](https://srhenry.github.io/type-utils/functions/Experimental._switch.html)

```typescript
const switcher = $switch<number>()
    .case(
        n => n % 2 === 0,
        () => Math.floor(Math.random() * 10_000) + 1
    )
    .default(n => n ** n)

console.log(switcher(1)) // 1 (1^1)
console.log(switcher(2)) // random number between 1-10000
console.log(switcher(3)) // 27 (3^3)
console.log(switcher(4)) // random number between 1-10000
console.log(switcher(5)) // 3125 (5^5)
console.log(switcher(6)) // random number between 1-10000
console.log(switcher(7)) // 823543 (7^7)
```
