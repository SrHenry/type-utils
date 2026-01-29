/* Helpers */
type IsTuple<T> = T extends readonly [...infer _] ? true : false

type TupleElems<T> = T extends readonly [...infer E] ? E : never

type IsReadonlyArray<T> = T extends readonly any[] ? (T extends any[] ? false : true) : false

type AsArray<T> = Extract<T, readonly any[]>

/* Concatenate arrays/tuples preserving readonly + tuple-ness */
type ConcatTuplesOrArrays<A, B> =
    // Case 1: both tuples
    IsTuple<A> extends true
        ? IsTuple<B> extends true
            ? IsReadonlyArray<A> extends true
                ? readonly [...TupleElems<A>, ...TupleElems<B>]
                : IsReadonlyArray<B> extends true
                ? readonly [...TupleElems<A>, ...TupleElems<B>]
                : [...TupleElems<A>, ...TupleElems<B>]
            : // Case 2: A = tuple, B = array
            IsReadonlyArray<A> extends true
            ? readonly [...TupleElems<A>, ...AsArray<B>]
            : [...TupleElems<A>, ...AsArray<B>]
        : // Case 3: A = array, B = tuple
        IsTuple<B> extends true
        ? IsReadonlyArray<B> extends true
            ? readonly [...AsArray<A>, ...TupleElems<B>]
            : [...AsArray<A>, ...TupleElems<B>]
        : // Case 4: both arrays
        IsReadonlyArray<A> extends true
        ? readonly [...AsArray<A>, ...AsArray<B>]
        : IsReadonlyArray<B> extends true
        ? readonly [...AsArray<A>, ...AsArray<B>]
        : [...AsArray<A>, ...AsArray<B>]

/* Deep merge */
export type Merge<A, B> = A extends readonly any[]
    ? B extends readonly any[]
        ? ConcatTuplesOrArrays<A, B>
        : B
    : B extends readonly any[]
    ? B
    : A extends Record<string, any>
    ? B extends Record<string, any>
        ? {
              [K in keyof A | keyof B]: K extends keyof B
                  ? K extends keyof A
                      ? Merge<A[K], B[K]>
                      : B[K]
                  : K extends keyof A
                  ? A[K]
                  : never
          }
        : B
    : B

function isPlainObject(v: any): v is Record<string, any> {
    return v !== null && typeof v === 'object' && !Array.isArray(v)
}

/**
 * deepMerge runtime implementation.
 * - arrays are concatenated (a.concat(b))
 * - objects are merged recursively
 * - otherwise b replaces a
 *
 * Note: runtime can't produce perfect typed guarantees, so we cast to Merge<A,B>.
 */
export function deepMerge<A extends any, B extends any>(a: A, b: B): Merge<A, B> {
    // If both are arrays -> concat
    if (Array.isArray(a) && Array.isArray(b)) {
        // preserve readonly at runtime not meaningful — we return a normal array
        // but the type-level Merge reflects readonly/tuple if present
        // Use concat to handle tuples/arrays
        return a.concat(b) as unknown as Merge<A, B>
    }

    // If both are plain objects -> deep merge keys
    if (isPlainObject(a) && isPlainObject(b)) {
        const out: any = { ...(a as any) }

        for (const key of Object.keys(b)) {
            const av = (a as any)[key]
            const bv = (b as any)[key]

            if (Array.isArray(av) && Array.isArray(bv)) {
                out[key] = av.concat(bv)
            } else if (isPlainObject(av) && isPlainObject(bv)) {
                out[key] = deepMerge(av, bv)
            } else {
                out[key] = bv
            }
        }

        return out as Merge<A, B>
    }

    // Otherwise B replaces A
    return b as unknown as Merge<A, B>
}
