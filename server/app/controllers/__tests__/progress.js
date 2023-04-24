const progressModule = require('../progress')
const plannerModule = require('../planner')

const { setUpTestDB } = require('../../model')

beforeEach(async () => {
  await setUpTestDB('dev.db', 'dev_test.db')
})

describe('isCourseAssignedCore', () => {
  it('check course is not assigned to core requirements', async () => {
    const studentId = 1
    const courseId = 'GWSS-126-A'
    const res = await progressModule.isCourseAssignedCore(studentId, courseId)
    expect(res).toBe(false)
  })

  it('check course is assigned to core requirement', async () => {
    const studentId = 1
    const courseId = 'GWSS-126-A'
    const coreId = 'DN'

    const mReq = {
      body: {
        courseId,
        coreId
      },
      userId: studentId
    }

    const mRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }

    await progressModule.assignCore(mReq, mRes)

    const res = await progressModule.isCourseAssignedCore(studentId, courseId)
    expect(res).toBe(true)
  })
})

describe('assignCore', () => {
  it('assigns core requirements and then changes it', async () => {
    const studentId = 1
    const courseId = 'GWSS-126-A'
    const coreId = 'DN'

    const mReq = {
      body: {
        courseId,
        coreId
      },
      userId: studentId
    }

    const mRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }

    await progressModule.assignCore(mReq, mRes)

    expect(mRes.status).toBeCalledWith(200)
    expect(mRes.json).toBeCalledWith(
      expect.objectContaining({
        message: `Successfully assigned ${courseId} to ${coreId}!`,
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
          DN: courseId,
          XLP: null
        }
      })
    )

    const res = await progressModule.isCourseAssignedCore(studentId, courseId)
    expect(res).toBe(true)

    const mRes2 = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
    const coreId2 = 'O'
    const mReq2 = {
      body: {
        courseId,
        coreId: coreId2
      },
      userId: studentId
    }

    await progressModule.assignCore(mReq2, mRes2)

    expect(mRes2.status).toBeCalledWith(200)
    expect(mRes2.json).toBeCalledWith(
      expect.objectContaining({
        message: `Successfully assigned ${courseId} to ${coreId2}!`,
        coreAssignments: {
          A: null,
          H: null,
          SS: null,
          S: null,
          O: courseId,
          GN: null,
          LINQ: null,
          CCAP: null,
          R: null,
          Q: null,
          L: null,
          CIE: null,
          DN: null,
          XLP: null
        }
      })
    )
  })
})

describe('getMappings', () => {
  it('returns no mappings', async () => {
    const studentID = 1
    const res = await progressModule.getMappings(studentID)
    expect(res).toEqual([])
  })

  it('returns all mappings for courses', async () => {
    const userId = 1
    const semester = 'F2022'
    const toAddCourses = ['MATH-111', 'DANC-330']

    for (const course of toAddCourses) {
      await plannerModule.addCourseToSemester(userId, course, semester, {})
    }

    const studentID = 1
    const res = await progressModule.getMappings(studentID)
    expect(res).toEqual([
      { courseId: 'MATH-111', coreId: 'Q' },
      { courseId: 'MATH-111', coreId: 'R' },
      { courseId: 'DANC-330', coreId: 'A' },
      { courseId: 'DANC-330', coreId: 'DN' },
      { courseId: 'DANC-330', coreId: 'H' },
      { courseId: 'DANC-330', coreId: 'LINQ' }
    ])
  })
})

describe('computeCreditsFromMappings', () => {
  it('computes credit total correctly', async () => {
    const mockMappings = [
      { courseId: 'MATH-111', coreId: 'Q' },
      { courseId: 'MATH-111', coreId: 'R' },
      { courseId: 'DANC-330', coreId: 'A' },
      { courseId: 'DANC-330', coreId: 'DN' },
      { courseId: 'DANC-330', coreId: 'H' },
      { courseId: 'DANC-330', coreId: 'LINQ' }
    ]
    const res = await progressModule.computeCreditsFromMappings(mockMappings)
    expect(res).toBe(8)
  })

  it('computes credit total correctly (0 credits)', async () => {
    const mockMappings = []
    const res = await progressModule.computeCreditsFromMappings(mockMappings)
    expect(res).toBe(0)
  })
})

describe('getAssignments', () => {
  it('gets the default assignments', async () => {
    const studentId = 1
    const res = await progressModule.getAssignments(studentId)
    expect(res).toEqual(
      expect.objectContaining(
        {
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
          DN: null,
          XLP: null
        }
      )
    )
  })

  it('gets the assignments if courses are planned', async () => {
    const studentId = 1
    const courseId = 'GWSS-126-A'
    const coreId = 'DN'

    const mReq = {
      body: {
        courseId,
        coreId
      },
      userId: studentId
    }

    const mRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }

    await progressModule.assignCore(mReq, mRes)

    const res = await progressModule.getAssignments(studentId)
    expect(res).toEqual(
      expect.objectContaining(
        {
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
          DN: courseId,
          XLP: null
        }
      )
    )
  })
})

describe('fetchAssignments', () => {
  it('fetches everything correctly for the assignments', async () => {
    const studentId = 1
    const MATH = 'MATH-111'
    const DANCE = 'DANC-330'
    const GWSS = 'GWSS-126-A'
    const coreId = 'O'
    const semester = 'F2022'
    const toAddCourses = [MATH, DANCE]

    for (const course of toAddCourses) {
      await plannerModule.addCourseToSemester(studentId, course, semester, {})
    }

    const mReq = {
      body: {
        courseId: GWSS,
        coreId
      },
      userId: studentId
    }

    const mRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }

    await progressModule.assignCore(mReq, mRes)

    const mReq2 = {
      userId: studentId
    }

    const mRes2 = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }

    await progressModule.fetchAssignments(mReq2, mRes2)
    expect(mRes2.status).toBeCalledWith(200)
    expect(mRes2.json).toBeCalledWith(
      expect.objectContaining({
        planMappings: [
          { courseId: 'MATH-111', coreId: 'Q' },
          { courseId: 'MATH-111', coreId: 'R' },
          { courseId: 'DANC-330', coreId: 'A' },
          { courseId: 'DANC-330', coreId: 'DN' },
          { courseId: 'DANC-330', coreId: 'H' },
          { courseId: 'DANC-330', coreId: 'LINQ' }
        ],
        coreAssignments: {
          A: DANCE,
          H: DANCE,
          SS: null,
          S: null,
          O: GWSS,
          GN: null,
          LINQ: DANCE,
          CCAP: null,
          R: MATH,
          Q: MATH,
          L: null,
          CIE: null,
          DN: DANCE,
          XLP: null
        },
        totalCredits: 8
      })
    )
  })
})

describe('isSpecialCore', () => {
  it('is special core requirement', () => {
    const dn = progressModule.isSpecialCore('DN')
    expect(dn).toBe(true)

    const gn = progressModule.isSpecialCore('GN')
    expect(gn).toBe(true)

    const o = progressModule.isSpecialCore('O')
    expect(o).toBe(true)
  })

  it('is not special core requirement', () => {
    const h = progressModule.isSpecialCore('H')
    expect(h).toBe(false)
    const linq = progressModule.isSpecialCore('LINQ')
    expect(linq).toBe(false)
  })
})

describe('addMappingsToAssignments', () => {
  it('adds core requirements mappings to the assignments', () => {
    const DANCE = 'DANC-330'
    const MATH = 'MATH-111'
    const mockMappings = [
      { courseId: 'MATH-111', coreId: 'Q' },
      { courseId: 'MATH-111', coreId: 'R' },
      { courseId: 'DANC-330', coreId: 'A' },
      { courseId: 'DANC-330', coreId: 'DN' },
      { courseId: 'DANC-330', coreId: 'H' },
      { courseId: 'DANC-330', coreId: 'LINQ' }
    ]

    const mockAssignments = {
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
      DN: null,
      XLP: null
    }

    progressModule.addMappingsToAssignments(mockMappings, mockAssignments)

    expect(mockAssignments).toEqual(
      expect.objectContaining({
        A: DANCE,
        H: DANCE,
        SS: null,
        S: null,
        O: null,
        GN: null,
        LINQ: DANCE,
        CCAP: null,
        R: MATH,
        Q: MATH,
        L: null,
        CIE: null,
        DN: DANCE,
        XLP: null
      })
    )
  })

  it('does not assign if conflict', () => {
    const HIST = 'HIST-126'
    const mockMappings = [
      { courseId: HIST, coreId: 'DN' },
      { courseId: HIST, coreId: 'GN' },
      { courseId: HIST, coreId: 'H' }
    ]

    const mockAssignments = {
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
      DN: null,
      XLP: null
    }

    progressModule.addMappingsToAssignments(mockMappings, mockAssignments)

    expect(mockAssignments).toEqual(
      expect.objectContaining({
        A: null,
        H: HIST,
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
        DN: null,
        XLP: null
      })
    )
  })
})