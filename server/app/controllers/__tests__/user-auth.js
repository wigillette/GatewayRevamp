const userAuth = require('../user-auth')
const { setUpTestDB, fetchDB } = require('../../model')

const email = 'faceyka@ursinius.edu'
const mockBody = {
  fName: 'Facey',
  lName: 'Ka',
  email,
  password: 'Password123',
  startDate: 'F2023',
  gradDate: 'S2025',
  major: 'Mathematics',
  headshot: 'headshot.jpg'
}

beforeEach(async () => {
  await setUpTestDB('dev.db', 'dev_test.db')
})

describe('validateLogin', () => {
  it('login is invalid because of invalid password', () => {
    const validEmail = mockBody.email
    const badPassword = 'nouppercase'
    expect(userAuth.validateLogin(validEmail, badPassword)).toBe(false)
  })

  it('login is invalid because of invalid email', () => {
    const badEmail = 'verybademail'
    const validPassword = 'Passsword123'
    expect(userAuth.validateLogin(badEmail, validPassword)).toBe(false)
  })

  it('login is valid', () => {
    const validEmail = mockBody.email
    const validPassword = mockBody.password
    expect(userAuth.validateLogin(validEmail, validPassword)).toBe(true)
  })
})

describe('validateRegistration', () => {
  it('registration is invalid because of invalid name', () => {
    const validEmail = mockBody.email
    const validPassword = mockBody.password
    const badFName = '123Æ'
    const validLName = 'Fa'
    const validStartDate = 'S2023'
    const validGradDate = 'S2025'
    const validMajor = mockBody.major
    const validHeadshot = mockBody.headshot
    expect(
      userAuth.validateRegistration(validEmail, validPassword, badFName, validLName, validGradDate, validStartDate, validMajor, validHeadshot)
    ).toBe(false)
  })

  it('registration is valid', () => {
    const validEmail = mockBody.email
    const validPassword = mockBody.password
    const badFName = 'Kacey'
    const validLName = 'Fa'
    const validStartDate = 'S2023'
    const validGradDate = 'S2025'
    const validMajor = mockBody.major
    const validHeadshot = mockBody.headshot
    expect(
      userAuth.validateRegistration(validEmail, validPassword, badFName, validLName, validGradDate, validStartDate, validMajor, validHeadshot)
    ).toBe(true)
  })
})

describe('register', () => {
  it('should register with status 200', async () => {
    const db = await fetchDB()

    const beforeRegister = await db.get('SELECT * FROM Students WHERE email = ?', [email])
    expect(beforeRegister).toBe(undefined)

    const mReq = {
      body: {
        ...mockBody
      }
    }
    const mRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }

    await userAuth.register(mReq, mRes)

    expect(mRes.status).toBeCalledWith(200)
    expect(mRes.json).toBeCalledWith(
      expect.objectContaining({ message: 'Account creation successful!', valid: true })
    )
    const afterRegister = await db.get('SELECT * FROM Students WHERE email = ?', [email])
    expect(afterRegister).toEqual(
      expect.objectContaining({ email: 'faceyka@ursinius.edu' })
    )

    const userId = 2
    const majorCheck = await db.get('SELECT * FROM StudentMajors WHERE studentId = ?', [userId])
    expect(majorCheck.majorId).toBe('Mathematics')
  })

  it('should register with status 404 for invalid fields', async () => {
    const db = await fetchDB()

    const beforeRegister = await db.get('SELECT * FROM Students WHERE email = ?', [email])
    expect(beforeRegister).toBe(undefined)

    const invalidPassword = 'badpassword'

    const mReq = {
      body: {
        ...mockBody,
        password: invalidPassword
      }
    }
    const mRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }

    await userAuth.register(mReq, mRes)

    expect(mRes.status).toBeCalledWith(404)
    expect(mRes.json).toBeCalledWith(
      expect.objectContaining({ message: 'At least one field was invalid!', valid: false })
    )
  })
})

describe('login', () => {
  it('should login with status 200', async () => {
    const mReq = {
      body: {
        ...mockBody
      }
    }
    const mRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }

    await userAuth.register(mReq, mRes)

    const mReq2 = {
      body: {
        email,
        password: mockBody.password
      }
    }

    const mRes2 = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }

    await userAuth.login(mReq2, mRes2)

    expect(mRes2.status).toBeCalledWith(200)
    expect(mRes2.json).toBeCalledWith(
      expect.objectContaining({
        email,
        major: 'Mathematics',
        startDate: 'F2023'
      })
    )
  })

  it('should login with status 404 when it does not find user', async () => {
    const mReq = {
      body: {
        email: 'doesnotexist@gmail.com',
        password: 'doesnotexist123'
      }
    }
    const mRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
    await userAuth.login(mReq, mRes)
    expect(mRes.status).toBeCalledWith(500)
    expect(mRes.json).toBeCalledWith(
      expect.objectContaining({
        message: 'Invalid password!'
      })
    )
  })

  it('should login with status 404 when it does not find user', async () => {
    const mReq = {
      body: {
        email: 'doesnotexist@gmail.com',
        password: 'Doesnotexist123'
      }
    }
    const mRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
    await userAuth.login(mReq, mRes)
    expect(mRes.status).toBeCalledWith(404)
    expect(mRes.json).toBeCalledWith(
      expect.objectContaining({
        message: 'At least one field was invalid!'
      })
    )
  })

  it('should login with status 500 when email exists but password is incorrect', async () => {
    const mReq = {
      body: {
        ...mockBody
      }
    }
    const mRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }

    await userAuth.register(mReq, mRes)

    const mReq2 = {
      body: {
        email: 'faceyka@ursinius.edu',
        password: 'Password1'
      }
    }
    const mRes2 = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
    await userAuth.login(mReq2, mRes2)
    expect(mRes2.status).toBeCalledWith(401)
    expect(mRes2.json).toBeCalledWith(
      expect.objectContaining({
        message: 'Invalid Password!'
      })
    )
  })

  it('should login with status 404 when password is invalid from regex', async () => {
    const mReq = {
      body: {
        ...mockBody
      }
    }
    const mRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }

    await userAuth.register(mReq, mRes)

    const mReq2 = {
      body: {
        email: 'faceyka@ursinius.edu',
        password: 'password'
      }
    }
    const mRes2 = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
    await userAuth.login(mReq2, mRes2)
    expect(mRes2.status).toBeCalledWith(500)
    expect(mRes2.json).toBeCalledWith(
      expect.objectContaining({
        message: 'Invalid password!'
      })
    )
  })
})

describe('refreshToken', () => {
  it('shows refresh token message', () => {
    const mReq = {
      body: {
        refreshToken: null
      }
    }
    const mRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }

    userAuth.refreshToken(mReq, mRes)
    expect(mRes.status).toBeCalledWith(403)
    expect(mRes.json).toBeCalledWith(
      expect.objectContaining({
        message: 'Refresh Token is required'
      })
    )
  })
})
