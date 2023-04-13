[npm]: https://npmjs.com/package/@srhenry/type-utils

# Type Utils

> Type utilities module for Typescript and also Javascript. It can secure your application from invalid data being pushed inside and breaking things as it can shape and model your data to prevent invalid data. Check out the documentation for further details.

<br/>

<div align="center">

[![GitHub](https://badgen.net/badge/icon/github?icon=github&label)](https://github.com/SrHenry/type-utils)
[![Npm package version](https://badgen.net/npm/v/@srhenry/type-utils)][npm]
[![Npm package total downloads](https://badgen.net/npm/dt/@srhenry/type-utils)][npm]
[![Npm package license](https://badgen.net/npm/license/@srhenry/type-utils)][npm]

</div>

## **Table of Contents**

-   [Installing](#installing)
-   [Docs](#docs)
-   [Experimental Features](#experimental)

<br/>
<br/>

# <span id="installing"> **Installing** </span>

```bash
npm install @srhenry/type-utils --save
```

or from git repository:

```bash
git clone git@gitlab.com:SrHenry/type-utils.git
cd storage-manager
npm run build
```

<br/>

# <span id="docs"> **Docs** </span>

> -   [API - Github Pages](https://srhenry.github.io/type-utils)

### **Schema types**

> `Schema.string`
>
> It represents a string to typescript's type infers and runtime validation
>
> ```typescript
> import { string } from '@srhenry/type-utils'
>
> const isString = string() //any string
> const isAvocadoString = string('avocado') //specific string
> const isPatternString = string(/goo+gle/) //pattern/RegExp matched string
> ```

> `Schema.number`
>
> It represents a number to typescript's type infers and runtime validation
>
> ```typescript
> import { number } from '@srhenry/type-utils'
>
> const isNumber = number()
> ```

> `Schema.boolean`
>
> It represents a number to typescript's type infers and runtime validation
>
> ```typescript
> import { boolean } from '@srhenry/type-utils'
>
> const isBoolean = boolean()
> ```

> `Schema.object`
>
> It represents a well defined object to typescript's type infers and runtime validation, which its properties are also described using the Schema helpers
>
> ```typescript
> import { object, string, number } from '@srhenry/type-utils'
>
> const isMyObject = object({
>     foo: string(),
>     bar: number(),
> })
> ```

> `Schema.array`
>
> It represents an array to typescript's type infers and runtime validation, which its items can also be described using the Schema helpers
>
> ```typescript
> import { array, string, object } from '@srhenry/type-utils'
>
> const isArray = array() // array of anything
> const isMyArray = array(string()) // array of strings
> const isMyObjArray = array(object({ foo: string('bar') }))
> const isMyObjArray2 = array({ foo: string('bar') })
> ```

> `Schema.symbol`
>
> It represents a symbol to typescript's type infers and runtime validation
>
> ```typescript
> import { symbol } from '@srhenry/type-utils'
>
> const isSymbol = symbol()
> ```

> `Schema.asEnum`
>
> It represents a closed switch values to typescript's type infers and runtime validation. It ensures your value is one of the values given in params.
>
> ```typescript
> import { asEnum } from "@srhenry/type-utils"
>
> enum Status {
>   ready: 1,
>   running: 2,
>   stopped: 3,
> }
>
> const validStatus = [...Object.keys(Status)] as (keyof typeof Status)[]
>
> const isStatus = asEnum(validStatus)
> ```

> `Schema.asNull`
>
> It represents a null literal to typescript's type infers and runtime validation.
>
> ```typescript
> import { asNull } from '@srhenry/type-utils'
>
> const isNull = asNull()
> ```

> `Schema.primitive`
>
> It represents a primitive values (such as string, number, boolean, symbol, null, undefined) to typescript's type infers and runtime validation.
>
> ```typescript
> import { primitive } from '@srhenry/type-utils'
>
> const isSymbol = primitive()
> ```

> `Schema.any`
>
> It represents a 'any' value to typescript's type infers and runtime validation. It does nothing to validate a narrowed type but can be useful to improve readability in more complex schemas.
>
> ```typescript
> import { any, object } from '@srhenry/type-utils'
>
> const isAny = any()
> const objectHasFoo = object({ foo: isAny }) //it checks if is object and if has `foo` property but doesn't care checking its type
> ```

> `Schema.optional`
>
> `Schema.optional.*`
>
> It represents a optional value to typescript's type infers and runtime validation. It returns recursive structure of schema helpers to narrow validation.
>
> ```typescript
> import { optional, object } from '@srhenry/type-utils'
>
> const maybeString = optional().string()
> const objectMaybeHasFoo = object({ foo: maybeString }) //it checks if is object and if has `foo`. if it has `foo` then check if it is string, if it hasn't then pass anyway as it is optional property
> ```

### Schema helpers

> `Schema.and`
>
> It creates an intersection between two schemas.
>
> ```typescript
> import { object, string, and } from '@srhenry/type-utils'
>
> const hasFoo = object({ foo: string() })
> const hasBar = object({ bar: string() })
> const isSomething = and(hasFoo, hasBar)
> ```

> `Schema.or`
>
> It creates an union between two schemas.
>
> ```typescript
> import { string, boolean, or } from '@srhenry/type-utils'
>
> const isString = string()
> const isBool = boolean()
> const isSomething = or(isString, isBool)
> ```

> `Schema.useSchema`
>
> It wraps a schema (just to improve readability).
>
> ```typescript
> import { object, string, array, useSchema } from '@srhenry/type-utils'
>
> const hasFoo = object({ foo: string() })
> const isFooArray = array(useSchema(hasFoo))
> ```

### Validation rules

> `Number.nonZero`
>
> It constraints a number to be different from 0.
>
> ```typescript
> import { number, Rules } from '@srhenry/type-utils'
>
> const isNonZeroNumber = number([Rules.Number.nonZero()])
> ```
>
> or
>
> ```typescript
> import { number, NumberRules } from '@srhenry/type-utils'
> const isNonZeroNumber = number([NumberRules.nonZero()])
> ```

> `Number.max`
>
> It constraints a number to be lesser than a given number.
>
> ```typescript
> import { number, Rules } from '@srhenry/type-utils'
>
> const isNonZeroNumber = number([Rules.Number.max(255)])
> ```
>
> or
>
> ```typescript
> import { number, NumberRules } from '@srhenry/type-utils'
>
> const isNonZeroNumber = number([NumberRules.max(255)])
> ```

> `Number.min`
>
> It constraints a number to be greater than a given number.
>
> ```typescript
> import { number, Rules } from '@srhenry/type-utils'
>
> const isNonZeroNumber = number([Rules.Number.min(1)])
> ```
>
> or
>
> ```typescript
> import { number, NumberRules } from '@srhenry/type-utils'
> // or
> const isNonZeroNumber = number([NumberRulesmin(1)])
> ```

> `Array.max`
>
> It constraints an array's size to be lesser than a given number.
>
> ```typescript
> import { array, any, Rules } from '@srhenry/type-utils'
>
> const isArray = array([Rules.Array.max(25)], any())
> ```
>
> or
>
> ```typescript
> import { array, any, ArrayRules } from '@srhenry/type-utils'
>
> const isArray = array([max(25)], any())
> ```

> `Array.min`
>
> It constraints an array's size to be greater than a given number.
>
> ```typescript
> import { array, any, Rules } from '@srhenry/type-utils'
>
> const isArray = array([Rules.Array.min(1)], any())
> ```

> `Array.unique`
>
> It constraints an array to contain only distinct values, failling if a duplicate is found.
>
> ```typescript
> import { array, string, Rules } from '@srhenry/type-utils'
>
> const isArray = array([Rules.Array.unique()], string())
> ```
>
> or
>
> ```typescript
> import { array, string, ArrayRules } from '@srhenry/type-utils'
>
> const isArray = array([Rules.ArrayRules], string())
> ```

> `String.max`
>
> It constraints a string's size to be lesser than a given number.
>
> ```typescript
> import { string, Rules } from '@srhenry/type-utils'
>
> const isString = string([Rules.String.max(60)])
> ```
>
> or
>
> ```typescript
> import { string, StringRules } from '@srhenry/type-utils'
>
> const isString = string([StringRules.max(60)])
> ```

> `String.min`
>
> It constraints a string's size to be greater than a given number.
>
> ```typescript
> import { string, Rules } from '@srhenry/type-utils'
>
> const isString = string([Rules.String.min(60)])
> ```
>
> or
>
> ```typescript
> import { string, StringRules } from '@srhenry/type-utils'
>
> const isString = string([StringRules.min(60)])
> ```

> `String.regex`
>
> It constraints a string to match a given pattern (regular expression).
>
> ```typescript
> import { string, Rules } from '@srhenry/type-utils'
>
> const isNumericString = string([Rules.String.regex(/[0-9]+/)])
> ```
>
> or
>
> ```typescript
> import { string, StringRules } from '@srhenry/type-utils'
>
> const isNumericString = string([StringRules.regex(/[0-9]+/)])
> ```

> `String.nonEmpty`
>
> It constraints a string's size to be greater than 0.
>
> ```typescript
> import { string, Rules } from '@srhenry/type-utils'
>
> const isString = string([Rules.String.nonEmpty()])
> ```
>
> or
>
> ```typescript
> import { string, StringRules } from '@srhenry/type-utils'
>
> const isString = string([StringRules.nonEmpty()])
> ```

### Available validations

> `is`
>
> It checks a given value against a given schema or validator and return true if schema matches the value, otherwise return false.
>
> ```typescript
> import { string, is } from '@srhenry/type-utils'
>
> //...
> if (is(value, string())) {
>     // value is string
> } else {
>     // value is not a string
> }
> ```

> `ensureInterface`
>
> It checks a given value against a given schema or validator and returns the checked value with schema inferred type if schema matches the value or throws an error if schema didn't match the value. Pretty clean to use with destructuring pattern.
>
> ```typescript
> import { object, number, string, ensureInterface } from '@srhenry/type-utils'
>
> //...
> const { foo, bar } = ensureInterface(value, object({
>     foo: number(),
>     bar: string(),
> }) //It throws an error if validation fails!
>
> console.log('foo', foo) // foo
> console.log('bar', bar) // bar
> ```

`NOTE:` You can use schema directly to validate a value.

> Ex.:
>
> ```typescript
> import { object, number } from "@srhenry/type-utils"
>
> const hasFoo = object({ foo: number() }))
>
> //...
> if (hasFoo(obj)) {
>   // obj is object and contains a string property named `foo`
> } else {
>   // obj don't have a `foo` property of type string
> }
> ```

# <span id="experimental"> **Experimental Features** </span>

## **Deep validation**

<span hidden="hidden">TODO: finish explain Experimental new stuff </span>

This is intended for partial assertions in schemas, fetching all violations against the schema, like other specialized tools does (yup, joi, etc). Common use cases are in form validations and payload validations, in order to give feedback of where the data is wrong by schema.

> Ex.:
>
> ```ts
> import {
>     Experimental,
>     object,
>     string,
>     StringRules,
>     setValidatorMessage,
> } from '@srhenry/type-utils'
>
> const { validate, ValidationErrors } = Experimental
>
> /** RFC 2822: Standard email validation. in your code you can use third party libs who already can check it, and you can link with this lib using useSchema or just writing a type guard and passing the guard to schema */
> const emailRegex =
>     /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
>
> /** A sample schema */
> const schema = object({
>     name: setValidatorMessage('name is required', string()),
>     email: setValidatorMessage('email is required', string(emailRegex)),
>     password: string([StringRules.min(6)]),
> })
>
> /** An API request payload or else */
> const payload = {
>     name: 'Foo',
>     email: '',
>     password: '1234',
> }
>
> // throwable flow
> try {
>     const data = validate(payload, schema)
>     //...
> } catch (e) {
>     if (e instanceof ValidationErrors) {
>         // generic function representing some error handling for presenting to requester:
>         respondWith({
>             errors: e.errors.map(({ path, message }) => ({
>                 // something like '$', '$.name', '$.email' or '$.password':
>                 path: path.replace('$', 'payload'),
>                 message,
>             })),
>         })
>         // procedural handling (ValidationErrors is iterable):
>         for (const { parent, path, message, checked, against } of e) {
>             //...
>         }
>     }
> }
>
> // not throwable flow
> const data = validate(payload, schema)
> if (data instanceof ValidationErrors) {
>     // handle error(s)...
> } else {
>     //use schema shaped data...
> }
> ```

---

<br/>

## **Lambda**

This was inspired in C# Lambdas, equivalent to arrow functions in Javascript/Typescript, but this helper adds `invoke()` method to a function instance. useful to improve readability when you have a function that returns another and you wanna call 'em all in a row, using fluent pattern.

> Ex.:
>
> ```ts
> import { Experimental } from '@srhenry/type-utils'
>
> const { lambda } = Experimental
>
> function builder(locales: string | string[] = 'en-US') {
>     function formatter(
>         options: Intl.DateTimeFormatOptions = {
>             dateStyle: 'short',
>             timeStyle: 'short',
>         }
>     ) {
>         function format(date: Date | string) {
>             return new Intl.DateTimeFormat(locales, options).format(new Date(date))
>         }
>
>         return lambda(format)
>     }
>
>     return lambda(formatter)
> }
>
> console.log(
>     '1970-01-01T00:00 =',
>     builder('en-UK').invoke({ dateStyle: 'long' }).invoke('1970-01-01')
> ) // 01 January 1970
> ```

---

<br/>

## **Function/Lambda Currying**

This does type-wisely curries a function or lambda, in two flavors: allowing or not partial param applying (default is not allowed). The process of currying a function is traditionally a techique that allows you to call the refered function passing one parameter at a time, returning another function to further apply remaining parameters, then returning whatever the original function returns after all parameters were given to curried function. In Javascript this techinque usually allows partial apply, and in that way you can pass more than one parameter at a time, and everything else remains equal to the traditional currying.

> Ex.:
>
> ```ts
> import { Experimental } from '@srhenry/type-utils'
>
> const { lambda, curry } = Experimental
>
> // lets reuse earlier example:
> function builder(
>     locales: string | string[],
>     options: Intl.DateTimeFormatOptions,
>     date: Date | string
> ) {
>     return new Intl.DateTimeFormat(locales, options).format(new Date(date))
> }
>
> const curried = curry(builder)
> const curriedLambda = curry(lambda(builder))
>
> console.log(
>     curried('en-GB')({ timeStyle: 'short', timeZone: 'Etc/Greenwich' })(
>         new Date('2020-05-10T22:35:08Z')
>     )
> ) // 22:35
>
> console.log(
>     curriedLambda('en-US')
>         .invoke({ dateStyle: 'short', timeStyle: 'short', timeZone: 'America/New_York' })
>         .invoke(new Date('2020-05-10T22:35:08Z'))
> ) // (EDT) 5/10/20, 6:35 PM
> ```

---

<br/>

## **Pipelines/Pipes**

This is a fluent API to create sync/async function pipelines. Inspired in FP pipe operator while it does not comes to Javascript/Typescript yet. It allows only single param functions, piping the return as the parameter to the next function in pipeline.

> Ex.:
>
> ```ts
> import { Experimental } from '@srhenry/type-utils'
>
> const { pipe, enpipe, lambda } = Experimental
>
> const addUserFactory =
>     (db: Record<string, Record<string, any>[]>) => (user: Record<string, any>) =>
>         new Promise<string>(resolve => {
>             setTimeout(() => {
>                 const id = uuid()
>
>                 db['users'] ??= []
>                 db['users']?.push({ id, ...user })
>                 resolve(id)
>             }, 200)
>         })
> const addPostFactory =
>     (db: Record<string, Record<string, any>[]>) => (user_id: string, post: Record<string, any>) =>
>         new Promise<boolean>(resolve => {
>             setTimeout(() => {
>                 db['posts'] ??= []
>                 db['posts']?.push({ user_id, ...post })
>                 resolve(true)
>             }, 300)
>         })
>
> const db = {
>     users: [] as Record<string, any>[],
>     posts: [] as Record<string, any>[],
> } as Record<string, Record<string, any>[]>
>
> const len = <T = any>(s: string | ArrayLike<T>) => s.length
> const addPostCurried = (post: Record<string, any>) => (id: string) =>
>     pipe(addPostFactory).pipe(enpipe(db)).pipe(lambda).invoke(id, post)
>
> const result = await pipe(addUserFactory)
>     .pipe(enpipe(db))
>     .pipe(
>         enpipe({
>             name: 'Marcus',
>             email: 'example@email.com',
>         })
>     )
>     .pipeAsync(
>         addPostCurried({
>             title: 'Hello World',
>             content: 'Lorem ipsum dolor sit amet',
>         })
>     )
>     .pipeAsync(() => {
>         if (len(db['users']!) === 0 || len(db['posts']!) === 0) return false
>
>         db['replies'] = []
>         return true
>     })
>     .depipe() // true | false
> ```

---

<br/>

## **Switch Expression**

This helper enables you to build switch expressions as it is not available in Javascript vanilla. Each branch allows you to define the matchers or values ahead of time with literal values or inline expressions, or define with callbacks to customize handling of each branch, making it a powerfull way to describe a complex switch without _if-else-if_ language syntax. It defines a lambda as the switch runner, so you can define and run it in the row with more readability.

> Ex. (reusable switcher):
>
> ```ts
> const switcher = $switch()
>     .case(4, 'four')
>     .case(3, 'three')
>     .case(2, 'two')
>     .case(1, 'one')
>     .default('none of the above') // it does not run yet
>
> console.log(switcher.invoke(1)) // one
> console.log(switcher.invoke(3)) // three
> console.log(switcher.invoke(10)) // none of the above
> ```
>
> Ex. (stored switcher):
>
> ```ts
> const switcher = $switch(5)
>     .case(4, 'four')
>     .case(3, 'three')
>     .case(2, 'two')
>     .case(1, 'one')
>     .default('none of the above') // it does not run yet
>
> console.log(switcher()) // none of the above
> console.log(switcher.invoke()) // none of the above
> console.log(switcher.invoke(1)) // none of the above
> console.log(switcher(3)) // none of the above
> ```
>
> Ex. (more complex matching logic / runtime branch evaluation):
>
> ```ts
> const switcher = $switch<number>()
>     .case(
>         n => n % 2 === 0,
>         () => Math.floor(Math.random() * 10_000) + 1
>     )
>     .default(n => n ** n)
>
> console.log(switcher(1)) // 1 (1^1)
> console.log(switcher(2)) // random number between 1-10000
> console.log(switcher(3)) // 27 (3^3)
> console.log(switcher(4)) // random number between 1-10000
> console.log(switcher(5)) // 3125 (5^5)
> console.log(switcher(6)) // random number between 1-10000
> console.log(switcher(7)) // 823543 (7^7)
> ```
