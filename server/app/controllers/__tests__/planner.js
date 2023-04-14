const plannerModule = require("../planner")

describe('addCourses', () => {
  it('should addCourses with status 200', async () => {
    const mReq = { 
      userId: 1, 
      body: {
        courseIdList: ["MATH-111", "CS-174"],
        semesterKey: "F2022"
      } 
    };    
    const mRes = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn().mockReturnThis() 
    }
    await plannerModule.addCourses(mReq, mRes)
    expect(mRes.status).toBeCalledWith(200);
    expect(mRes.json.mock.calls).toHaveLength(1)
  });
});

describe('fetchPlan', () => {
  it('should fetch plan with status 200', async () => {
    const mReq = { userId: 1 };    
    const mRes = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn().mockReturnThis() 
    }
    await plannerModule.fetchPlan(mReq, mRes)
    expect(mRes.status).toBeCalledWith(200);
    expect(mRes.json.mock.calls).toHaveLength(1)
  });
});

describe('addCourseToSemester', () => {
  it('should fail to add already planned course', async () => {
    const mockFullPlan = { 
      F2019: [{
        id: 'CS-174',
        cores: [],
        creditAmount: 4,
        title: 'OO Programming',
        description: 'CS-174. Object-Oriented Programming A continuation of CS-173. More detailed exploration of classes and instances, and an introduction to collection classes such as vectors, lists, maps and sets. Larger programs and/or team projects. Prerequisite: A grade of C- or higher in CS-173. Offered every semester. Three hours of lecture and one hour of lab per week. Four semester hours',
        yearOffered: 'EVERY',
      }], 
      S2020: [], 
      F2020: [],      
      S2021: [],
      F2021: [],
      S2022: [],
      F2022: [],
      S2023: [] 
    }
    const studentId = 1
    const toAddCourse = "CS-174"
    const semester = "F2020"
    try {
      await plannerModule.addCourseToSemester(studentId, toAddCourse, semester, mockFullPlan)
    } catch (err) {
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toBe('CS-174 is already planned for F2019!')
    }
  })

  it('should fetch user\'s plan', async () => {
    const mockFullPlan = { 
      F2019: [], 
      S2020: [], 
      F2020: [],      
      S2021: [],
      F2021: [],
      S2022: [],
      F2022: [],
      S2023: [] 
    }
    const studentId = 1
    const toAddCourse = "CS-174"
    const semester = "F2020"
    await plannerModule.addCourseToSemester(studentId, toAddCourse, semester, mockFullPlan)
  })
})


describe('getFullPlanFromDB', () => {
  it('should fetch user\'s plan', async () => {
    const userId = 2
    const result = await plannerModule.getFullPlanFromDB(userId)
    expect(result).toEqual(
      expect.objectContaining({ F2019: [], S2020: [], F2020: []})
    )
  })

  it('should fail to find user', async () => {
    const userId = -1
    try {
      const _ = await plannerModule.getFullPlanFromDB(userId)
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe("User not found.");
    }
  })
})