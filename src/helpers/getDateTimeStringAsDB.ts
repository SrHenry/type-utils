/**
 * A function that converts a Date Object into string wiht MySQL date format
 *
 * @param { Date } date optional Date Object to format into MySQL date format
 *
 * @returns { string } The MySQL formatted date string
 */
export const getDateTimeStringAsDB = (date: Date = new Date(Date.now())): string =>
    String(date.toISOString().split('T').join(' ').split('.')[0])
