const userAuth = require("../user-auth")

/*
describe('register', () => {
  it('should register with status 200', async () => {
    const mReq = { 
      body: { 
        fName: "Stacy",
        lName: "Ba", 
        email: "stacyba@ursinius.edu",
        password: "password123",
        gradDate: "F2025",
        major: "Computer Science",
        headshot: "headshot"
      }
    }    
    const mRes = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn().mockReturnThis() 
    }

    await userAuth.register(mReq, mRes)
    //expect(mRes.status).toBeCalledWith(200);
    //expect(mRes.json.mock.calls).toHaveLength(1)
  });
});
*/

describe('login', () => {
  /*
  it('should login with status 200', async () => {
    const mReq = { 
      body: { 
        email: "stacyba@ursinius.edu",
        password: "password123",
      }
    }    
    const mRes = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn().mockReturnThis() 
    }
    
    await userAuth.login(mReq, mRes)

    expect(mRes.status).toBeCalledWith(200);
  })
  */

  it('should login with status 404 and does not find user', async () => {
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
    expect(mRes.status).toBeCalledWith(404);
    expect(mRes.json).toBeCalledWith(
      expect.objectContaining({
        message :  "User not found!",
      }),
    )
  })
})