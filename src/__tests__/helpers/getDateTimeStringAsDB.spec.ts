import { getDateTimeStringAsDB } from '../../helpers'

describe('getDateTimeStringAsDB', () => {
    it('should return a string with the MySQL date format', () => {
        const date = new Date('2020-01-01T00:00:00.000Z')
        const result = getDateTimeStringAsDB(date)

        expect(result).toBe('2020-01-01 00:00:00')
    })
})
