const plannerModule = require('../planner')
const { setUpTestDB, fetchDB } = require('../../model')

beforeEach(async () => {
  await setUpTestDB('dev.db', 'dev_test.db')
})

describe('semesterKeyInterp', () => {
  it('should interpret between semester correctly starting with fall', () => {
    const res = plannerModule.semesterKeyInterp('F2021', 'S2025')
    expect(res).toEqual([
      'F2021', 'S2022',
      'F2022', 'S2023',
      'F2023', 'S2024',
      'F2024', 'S2025'
    ])
  })

  it('should interpret between semester correctly starting with spring', () => {
    const res = plannerModule.semesterKeyInterp('F2023', 'F2025')
    expect(res).toEqual([
      'F2023',
      'S2024',
      'F2024',
      'S2025',
      'F2025'
    ])
  })
})

describe('getStudentCoursePlan', () => {
  it('should fetch empty student plan', async () => {
    const userId = 1
    const res = await plannerModule.testAsync(userId)
    expect(res).toEqual([])
  })

  it('should fetch non empty student plan', async () => {
    const userId = 1
    const semester = 'F2022'
    const toAddCourses = ['MATH-111', 'DANC-330']

    for (const course of toAddCourses) {
      await plannerModule.addCourseToSemester(userId, course, semester, {})
    }

    const res = await plannerModule.testAsync(userId)
    expect(res).toEqual([
      { ID: 1, studentId: 1, courseId: 'MATH-111', semester: 'F2022' },
      { ID: 2, studentId: 1, courseId: 'DANC-330', semester: 'F2022' }
    ])
  })
})

describe('getStartEndKeys', () => {
  it('should the correct user start end keys', async () => {
    const userId = 1
    const res = await plannerModule.getStartEndKeys(userId)
    expect(res).toEqual(['F2021', 'S2025'])
  })
})

describe('addCourses', () => {
  it('should addCourses with status 200', async () => {
    const mReq = {
      userId: 1,
      body: {
        courseIdList: ['MATH-111', 'CS-174'],
        semesterKey: 'F2022'
      }
    }
    const mRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
    await plannerModule.addCourses(mReq, mRes)
    expect(mRes.status).toBeCalledWith(200)
    // expect(mRes.json.mock.calls).toHaveLength(1)
    expect(mRes.json).toBeCalledWith(
      expect.objectContaining({
        // fullPlan: null,
        message: 'Successfully added courses MATH-111, CS-174 to F2022!'
      })
    )
  })
})

describe('fetchPlan', () => {
  it('should fetch plan with status 200', async () => {
    const mReq = { userId: 1 }
    const mRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
    await plannerModule.fetchPlan(mReq, mRes)
    expect(mRes.status).toBeCalledWith(200)
    expect(mRes.json).toBeCalledWith(
      expect.objectContaining({
        fullPlan: {

          F2021: [],
          S2022: [],
          F2022: [],
          S2023: [],
          F2023: [],
          S2024: [],
          F2024: [],
          S2025: []
        },
        courseCatalog: expect.arrayContaining([{
          id: 'MATH-211',
          cores: ['Q', 'R'],
          creditAmount: 4,
          title: 'Multivar Calc',
          description: 'MATH-211. Multivariable Calculus Functions of several variables, including three-dimensional geometry and vectors, space curves and motion in space, partial differentiation, multiple integration, line and surface integrals, and the theorems of Green, Gauss, and Stokes. Use of a computer algebra system. Prerequisite: A grade of C- or better in MATH-112, or permission of the department. Offered both semesters. Four hours per week. Four semester hours. (R,M,Q)',
          yearOffered: 'EVERY',
          semesterOffered: 'SPRING',
          prerequisites: ['MATH-112']
        }])
      })
    )
  })
})

describe('addCourseToSemester', () => {
  it('should fail to add already planned course', async () => {
    const mockFullPlan = {
      F2021: [],
      S2022: [{
        id: 'CS-174',
        cores: [],
        creditAmount: 4,
        title: 'OO Programming',
        description: 'CS-174. Object-Oriented Programming A continuation of CS-173. More detailed exploration of classes and instances, and an introduction to collection classes such as vectors, lists, maps and sets. Larger programs and/or team projects. Prerequisite: A grade of C- or higher in CS-173. Offered every semester. Three hours of lecture and one hour of lab per week. Four semester hours',
        yearOffered: 'EVERY'
      }],
      F2022: [],
      S2023: [],
      F2023: [],
      S2024: [],
      F2024: [],
      S2025: []
    }
    const studentId = 1
    const toAddCourse = 'CS-174'
    const semester = 'F2022'
    try {
      await plannerModule.addCourseToSemester(studentId, toAddCourse, semester, mockFullPlan)
    } catch (err) {
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toBe('CS-174 is already planned for S2022!')
    }
  })

  it('should successfully add course to student plan', async () => {
    const mockFullPlan = {
      F2021: [],
      S2022: [],
      F2022: [],
      S2023: [],
      F2023: [],
      S2024: [],
      F2024: [],
      S2025: []
    }
    const studentId = 1
    const toAddCourse = 'CS-174'
    const semester = 'F2022'
    await plannerModule.addCourseToSemester(studentId, toAddCourse, semester, mockFullPlan)

    const courseQuery = 'SELECT * FROM StudentCoursePlan'
    const db = await fetchDB()
    const res = await db.get(courseQuery)
    expect(res).toEqual(
      expect.objectContaining(
        { ID: 1, studentId: 1, courseId: 'CS-174', semester: 'F2022' }
      )
    )
  })
})

describe('removeCourse', () => {
  it('removes course with status 200', async () => {
    const mockFullPlan = {
      F2021: [],
      S2022: [],
      F2022: [],
      S2023: [],
      F2023: [],
      S2024: [],
      F2024: [],
      S2025: []
    }
    const studentId = 1
    const toAddCourse = 'CS-174'
    const semester = 'F2022'
    await plannerModule.addCourseToSemester(studentId, toAddCourse, semester, mockFullPlan)

    const courseQuery = 'SELECT * FROM StudentCoursePlan'
    const db = await fetchDB()
    const res = await db.get(courseQuery)
    expect(res).toEqual(
      expect.objectContaining(
        { ID: 1, studentId: 1, courseId: 'CS-174', semester: 'F2022' }
      )
    )

    const mReq = {
      body: {
        courseId: 'CS-174',
        semesterKey: 'F2022',
        userId: 1
      }
    }
    const mRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }

    await plannerModule.removeCourse(mReq, mRes)

    expect(mRes.json).toBeCalledWith(
      expect.objectContaining({
        fullPlan: {
          F2019: [],
          F2020: [],
          F2021: [],
          F2022: [],
          S2020: [],
          S2021: [],
          S2022: [],
          S2023: []
        },
        message: `Successfully removed course ${toAddCourse} from ${semester}!`
      })
    )
  })
})

describe('getFullPlanFromDB', () => {
  it('should fetch user\'s plan', async () => {
    const userId = 1
    const result = await plannerModule.getFullPlanFromDB(userId)
    expect(result).toEqual(
      expect.objectContaining({ F2021: [], F2022: [], F2023: [], F2024: [], S2022: [], S2023: [], S2024: [], S2025: [] })
    )
  })

  it('should fail to find user', async () => {
    const userId = -1
    try {
      await plannerModule.getFullPlanFromDB(userId)
    } catch (err) {
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toBe('User not found.')
    }
  })
})

describe('fetchAllCourses', () => {
  it('should fetch all the courses', async () => {
    const courses = await plannerModule.fetchAllCourses()
    expect(courses).toEqual(
      expect.objectContaining(
        {
          'DANC-330': {
            id: 'DANC-330',
            cores: ['A', 'DN', 'H', 'LINQ'],
            creditAmount: 4,
            title: 'Hist of JazzDance',
            description: 'DANC-330. History of Jazz Dance This course investigates the unique origin and evolution of jazz dance in America. The course will follow the chronological development of jazz dance, including: African dance and music source material; African American vernacular dance forms; the relationship to jazz music; the contributions of specific choreographers and styles; and the impact of popular entertainment, such as vaudeville, musical theater, films, television, and music videos. Students will develop an understanding of jazz dance in the United States as related to socio-political and cultural contexts in the 20th century and the beginning of the 21st century, including a study of race and gender relations and the dynamics of power and privilege. Throughout the course of the semester, students will have the opportunity to embody basic jazz dance movement principles of rhythm, improvisation, and musicality. Three hours per week. Four semester hours. (A, DN, H, LINQ.)',
            yearOffered: 'EVERY',
            semesterOffered: 'EVERY',
            prerequisites: []
          }
        }
      )
    )
  })
})
