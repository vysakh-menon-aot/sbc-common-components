import { getBoolean } from '../../src/util/common-util'

describe('Common Util Test', () => {
  it('Test getBoolean works', () => {
    expect(getBoolean(true)).toBe(true)
    expect(getBoolean('True')).toBe(true)
    expect(getBoolean('true')).toBe(true)
    expect(getBoolean('TRUE')).toBe(true)
    expect(getBoolean(1)).toBe(true)
    expect(getBoolean('1')).toBe(true)
    expect(getBoolean('on')).toBe(true)
    expect(getBoolean('yes')).toBe(true)
    expect(getBoolean('False')).toBe(false)
    expect(getBoolean('')).toBe(false)
  })
})
