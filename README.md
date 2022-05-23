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

<br/>
<br/>

## <span id="installing"> **Installing** </span>

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

## <span id="docs"> **Docs** </span>

> -   [API - Github Pages](https://srhenry.github.io/type-utils)

### Schema types

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
