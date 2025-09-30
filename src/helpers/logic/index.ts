/**
 * Logic gate 'AND' to many inputs.
 *
 * @param values input list of argument values.
 *
 * @returns result of nested 'AND' Logic gate.
 */
export const AND = (...values: any[]) => {
    for (const v of values) if (!v) return false

    return true
}

/**
 * Logic gate 'OR' to many inputs.
 *
 * @param values input list of argument values.
 *
 * @returns result of nested 'OR' Logic gate.
 */
export const OR = (...values: any[]) => {
    for (const value of values) if (!!value) return true
    return false
}

/**
 * Logic gate 'NOT'.
 *
 * @param value input value.
 *
 * @returns result of 'NOT' Logic gate.
 */
export function NOT(value: any): boolean
/**
 * Logic gate 'NOT'.
 *
 * @param values input list of argument values.
 *
 * @returns result of 'NOT' Logic gate.
 */
export function NOT(...values: any[]): boolean[]

export function NOT(...values: any[]) {
    return values.length > 1 ? values.map(v => !v) : !(values[0] ?? true)
}

/**
 * Logic gate 'NAND' (Not AND) to many inputs.
 * It applies 'AND' to all values then apply 'NOT' for the result.
 *
 * @param values input list of argument values.
 *
 * @returns result of nested 'NAND' Logic gate.
 */
export const NAND = (...values: any[]) => NOT(AND(...values))

/**
 * Logic gate 'NOR' (Not OR) to many inputs.
 * It applies 'OR' to all values then apply 'NOT' for the result.
 *
 * @param values input list of argument values.
 *
 * @returns result of nested 'NOR' Logic gate.
 */
export const NOR = (...values: any[]) => NOT(OR(...values))

/**
 * Logic gate 'XOR' (eXclusive OR) to many inputs.
 * Returns true if only one of the inputs are true, false otherwise.
 *
 * @param values input list of argument values.
 *
 * @returns result of 'XOR' Logic gate.
 */
export const XOR = (...values: any[]) => values.filter(v => !!v).length === 1

/**
 * Logic gate 'XNOR' (eXclusive Not OR) to many inputs.
 * Returns false if only one of the inputs are true, true otherwise.
 * Same as applying 'XOR' then 'NOT'.
 *
 * @param values input list of argument values.
 *
 * @returns result of 'XNOR' Logic gate.
 */
export const XNOR = (...values: any[]) => NOT(XOR(...values))
