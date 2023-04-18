const userAuth = require("../user-auth")
const { setUpTestDB, fetchDB } = require('../../model');

const email = "faceyka@ursinius.edu"
const mockBody = {
  fName: "Facey",
  lName: "Ka", 
  email,
  password: "password123",
  gradDate: "F2025",
  major: "Mathematics",
  headshot: "headshot"
}

beforeAll(async () => {
  await setUpTestDB("dev.db", "dev_test.db")
})

describe('register', () => {
  it('should register with status 200', async () => {

    const db = await fetchDB()

    const beforeRegister = await db.get("SELECT * FROM Students WHERE email = ?", [email])
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
      expect.objectContaining({message: "Account creation successful!", valid: true})
    )
    const afterRegister = await db.get("SELECT * FROM Students WHERE email = ?", [email])
    expect(afterRegister).toEqual(
      expect.objectContaining({ email: 'faceyka@ursinius.edu' })
    )

    const userId = 2
    const majorCheck = await db.get("SELECT * FROM StudentMajors WHERE studentId = ?", [userId])
    expect(majorCheck.majorId).toBe("Mathematics") 
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
        password: mockBody.password,
      }
    }  
      
    const mRes2 = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn().mockReturnThis() 
    }
    
    await userAuth.login(mReq2, mRes2)

    expect(mRes2.status).toBeCalledWith(200);
    expect(mRes2.json).toBeCalledWith(
      expect.objectContaining({
        email: email,
        major: "Mathematics",
        startDate: "F2021",
      }),
    )
  })

  it('should login with status 404 when it does not find user', async () => {
    const mReq = { 
      body: { 
        email: "doesnotexist@gmail.com",
        password: "doesnotexist",
      }
    }    
    const mRes = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn().mockReturnThis() 
    }    
    await userAuth.login(mReq, mRes)
    expect(mRes.status).toBeCalledWith(500);
    expect(mRes.json).toBeCalledWith(
      expect.objectContaining({
        message: "Invalid password!",
      }),
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
        email: "faceyka@ursinius.edu",
        password: "wrongpassword",
      }
    }    
    const mRes2 = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn().mockReturnThis() 
    }    
    await userAuth.login(mReq2, mRes2)
    expect(mRes2.status).toBeCalledWith(401);
    expect(mRes2.json).toBeCalledWith(
      expect.objectContaining({
        message: "Invalid Password!",
      }),
    )
  })
})