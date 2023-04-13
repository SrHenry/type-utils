import { sleep } from '../../helpers'

describe('sleep', () => {
    it('should return a promise that resolves after the given time', async () => {
        const start = Date.now()
        await sleep(100)
        const end = Date.now()
        expect(end - start).toBeGreaterThanOrEqual(97)
    })
    it('should return a promise that resolves after the given time and runs some function when fulfilled', async () => {
        const start = Date.now()
        const result = await sleep(100, () => {
            const end = Date.now()
            expect(end - start).toBeGreaterThanOrEqual(97)

            return 'success'
        }).catch(() => 'failure')

        expect(result).toBe('success')
    })
})
