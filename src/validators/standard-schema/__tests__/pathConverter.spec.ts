import { parsePathString, buildPathString } from '../pathConverter.ts'

describe('parsePathString', () => {
  it('should return undefined for undefined path', () => {
    expect(parsePathString(undefined)).toBeUndefined()
  })

  it('should return undefined for $ root path', () => {
    expect(parsePathString('$')).toBeUndefined()
  })

  it('should return undefined for empty string', () => {
    expect(parsePathString('')).toBeUndefined()
  })

  it('should parse simple property access', () => {
    expect(parsePathString('$.foo')).toEqual(['foo'])
  })

  it('should parse nested property access', () => {
    expect(parsePathString('$.foo.bar')).toEqual(['foo', 'bar'])
  })

  it('should parse array index access', () => {
    expect(parsePathString('$[0]')).toEqual([0])
  })

  it('should parse mixed property and array access', () => {
    expect(parsePathString('$.foo.bar[0]')).toEqual(['foo', 'bar', 0])
  })

  it('should parse deeply nested path', () => {
    expect(parsePathString('$.a.b[2].c')).toEqual(['a', 'b', 2, 'c'])
  })
})

describe('buildPathString', () => {
  it('should build root path for empty keys', () => {
    expect(buildPathString([])).toBe('$')
  })

  it('should build simple property path', () => {
    expect(buildPathString(['foo'])).toBe('$.foo')
  })

  it('should build nested property path', () => {
    expect(buildPathString(['foo', 'bar'])).toBe('$.foo.bar')
  })

  it('should build array index path', () => {
    expect(buildPathString([0])).toBe('$[0]')
  })

  it('should build mixed property and array path', () => {
    expect(buildPathString(['foo', 'bar', 0])).toBe('$.foo.bar[0]')
  })

  it('should roundtrip with parsePathString', () => {
    const original = '$.users[0].name'
    const keys = parsePathString(original)!
    expect(buildPathString(keys)).toBe(original)
  })
})
