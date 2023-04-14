const progressModule = require("../progress")

describe('fetchAssignments', () => {
  it('should return status 200', async () => {
    const mReq = { userId: 1 };    
    const mRes = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn().mockReturnThis() 
    }

    await progressModule.fetchAssignments(mReq, mRes)
    
    expect(mRes.status).toBeCalledWith(200);
    expect(mRes.json).toBeCalledWith(
      expect.objectContaining({
       planMappings: {
        A: null, 
        CCAP: null, 
        CIE: null, 
        DN: null, 
        GN: null, 
        H: null, 
        L: null, 
        LINQ: null, 
        O: null, 
        Q: null, 
        R: null, 
        S: null, 
        SS: null
      },
       coreAssignments: {
        A: null,
        H: null,
        SS: null,
        S: null,
        O: null,
        GN: null,
        LINQ: null,
        CCAP: null,
        R: null,
        Q: null,
        L: null,
        CIE: null,
        DN: null
      }
      }),
    );
  });
});


describe('isCourseAssignedCore', () => {
  it('should return false because ', async () => {
    const studentId = 1
    const courseId = "ART-150"
    const res = await progressModule.isCourseAssignedCore(studentId, courseId)
    expect(res).toBe(false)
  })
})

describe('getCourses', () => {

})

