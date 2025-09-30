/**
 * Number rounder string formatter
 * @param n the number to format
 * @param precision the decimal part output size
 */
export const round = (n: number, precision: number = 0): string => {
    let integer = Math.floor(n)
    let r = n - integer
    for (let c = 0; c < precision; c++) r *= 10

    r = Math.floor(r)

    let r_s = String(r)
    for (let c = 0; c < precision - r_s.length; c++) r_s = '0'.concat(r_s)

    for (let c = precision; c < 0; c++) integer = Math.floor(integer / 10)

    if (/^0+$/.test(r_s)) return String(integer)

    return String(integer).concat('.').concat(r_s)
}
