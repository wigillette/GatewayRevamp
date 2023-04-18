const refreshTokenModule = require('../refresh-token')

describe('createToken', () => {
  it('should return a string', () => {
    const mockUser = {}
    const token = refreshTokenModule.createToken(mockUser)
    expect(typeof token).toBe('string')
  })
})
