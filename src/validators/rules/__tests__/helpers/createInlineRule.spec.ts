import type { Custom } from '../../types/index.ts'
import { createInlineRule, type InlineRuleName } from '../../helpers/createInlineRule.ts'

describe('createInlineRule', () => {
  it('should support named rules when only the subject type is explicit', () => {
    const hasLength: Custom<[], string, string> = createInlineRule<string>(
      'hasLength',
      value => value.length > 0
    )

    expect(hasLength[0]).toBe('hasLength')
    expect(hasLength[2]('value')()).toBe(true)
    expect(hasLength[2]('')()).toBe(false)
  })

  it('should preserve literal rule names when all type arguments are inferred', () => {
    const hasLength: Custom<[], 'hasLength', string> = createInlineRule(
      'hasLength',
      (value: string) => value.length > 0
    )

    expect(hasLength[0]).toBe('hasLength')
  })

  it('should return an anonymous rule name when no name is provided', () => {
    const rule: Custom<[], InlineRuleName, string> = createInlineRule(
      (value: string) => value.length > 0
    )

    expect(rule[0]).toBe('Custom.Rule.<anonymous>')
    expect(rule[2]('value')()).toBe(true)
    expect(rule[2]('')()).toBe(false)
  })

  it('should support anonymous rules when only the subject type is explicit', () => {
    const rule: Custom<[], InlineRuleName, string> = createInlineRule<string>(
      value => value.length > 0
    )

    expect(rule[0]).toBe('Custom.Rule.<anonymous>')
    expect(rule[2]('value')()).toBe(true)
    expect(rule[2]('')()).toBe(false)
  })
})
