// Planner.js Module: Handles changes to semester plans
const { fetchDB } = require('../model')
let COURSE_DATA = []
const DEFAULT_PLAN = { F2019: [], S2020: [], F2020: [], S2021: [], F2021: [], S2022: [], F2022: [], S2023: [] }

const semesterKeyInterp = (startKey, endKey) => {
  // Validate input format
  const formatRegex = /^[FS]\d{4}$/
  const semesterKeys = []
  let start = startKey
  if (formatRegex.test(startKey) && formatRegex.test(endKey)) {
    // Extract the semester season and year from the start and end keys
    const startSeason = startKey.substring(0, 1)
    const startYear = parseInt(startKey.substring(1))

    // Generate the list of semester keys
    let currentYear = startYear
    let currentSeason = startSeason
    while (start !== endKey) {
      const semester = currentSeason + currentYear.toString().padStart(4, '0')
      start = semester
      semesterKeys.push(semester)

      // Update the current season and year
      if (currentSeason === 'F') {
        currentSeason = 'S'
        currentYear++
      } else {
        currentSeason = 'F'
      }
    }
  }
  return semesterKeys
}

exports.semesterKeyInterp = semesterKeyInterp

const createFullPlan = (dataEntries, startEndDates) => {
  let newPlan = DEFAULT_PLAN
  if (startEndDates && startEndDates.length === 2) {
    const sKeyList = semesterKeyInterp(startEndDates[0], startEndDates[1])
    newPlan = Object.fromEntries(sKeyList.map((sKey) => [sKey, []])) // JSON.parse(JSON.stringify(DEFAULT_PLAN));
    if (dataEntries && dataEntries.length > 0 && COURSE_DATA) {
      let courseEntries = dataEntries.filter((dataEntry) => dataEntry && dataEntry.semester && dataEntry.courseId && Object.keys(COURSE_DATA).includes(dataEntry.courseId))
      courseEntries = courseEntries.map((dataEntry) => [dataEntry.semester, COURSE_DATA[dataEntry.courseId]])
      courseEntries.forEach((courseEntry) => {
        if (Object.keys(newPlan).includes(courseEntry[0])) {
          newPlan[courseEntry[0]].push(courseEntry[1])
        }
      })
    }
  }
  return newPlan
}

exports.createFullPlan = createFullPlan

exports.removeCourse = async (req, res) => {
  const db = await fetchDB()
  const { courseId, semesterKey } = req.body
  const userId = req.userId
  // Update the plan to remove the course
  try {
    const formerPlan = await getFullPlanFromDB(userId)
    let query = 'DELETE FROM StudentCoursePlan WHERE studentId = ? AND courseId = ? AND semester = ?'
    await db.run(query, [userId, courseId, semesterKey])
    query = 'DELETE FROM CourseSpecialCoreRequirements WHERE courseId = ? AND studentId = ?'
    try {
      await db.run(query, [userId, courseId])
      const newPlan = await getFullPlanFromDB(userId)
      res.status(200).json({ fullPlan: newPlan, message: `Successfully removed course ${courseId} from ${semesterKey}!` })
    } catch (err) {
      res.status(500).json({ fullPlan: formerPlan, message: err })
      console.log(err)
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
    console.log(err)
  }
}

/**
* A helper method that adds a single course to a semester's plan
* @param studentId The respective user's ID
* @param course The course to add (MATH-111, MATH-310, etc.)
* @param semester The respective semester key (F2022, S2023, etc.)
* @param fullPlan An object of the full plan
*/
const addCourseToSemester = async (studentId, course, semester, fullPlan) => {
  const db = await fetchDB()
  const semesterDuplicates = Object.keys(fullPlan).filter((key) => fullPlan[key].filter((courseEntry) => courseEntry.id === course).length > 0)
  if (semesterDuplicates <= 0) {
    try {
      const query = 'INSERT INTO StudentCoursePlan (studentId, courseId, semester) VALUES (?, ?, ?)'
      const result = await db.run(query, [studentId, course, semester])
      console.log(`Inserted a row with the ID: ${result.lastID} - ${course} for ${semester}`)
    } catch (err) {
      throw new Error(err.message)
    }
  } else {
    throw new Error(`${course} is already planned for ${semesterDuplicates.join(',')}!`)
  }
}
exports.addCourseToSemester = addCourseToSemester

/**
* Retrieves the user's full degree plan from the database
* @param userId The ID of the user from which to fetch the plan
*/
const getFullPlanFromDB = async (userId) => {
  try {
    const db = await fetchDB()
    const query = 'SELECT * FROM StudentCoursePlan WHERE studentId = ?'
    const entries = await db.all(query, [userId])

    if (entries) {
      const startEndDates = await getStartEndKeys(userId)
      return createFullPlan(entries, startEndDates)
    } else {
      throw new Error('User not found.')
    }
  } catch (err) {
    throw new Error(err)
  }
}

exports.getFullPlanFromDB = getFullPlanFromDB

/**
* Adds multiple courses to a specified semester plan, checking various base cases such as duplicates, max of four courses/plan, etc.
* @param courseIdList [MATH-111, MATH-112, ...]
* @param semesterKey "F2022", "S2023", etc.
*/
exports.addCourses = async (req, res) => {
  const { courseIdList, semesterKey } = req.body
  const uniqueIdList = [...new Set(courseIdList)]
  const userId = req.userId
  const formerPlan = await getFullPlanFromDB(userId)
  if (Object.keys(formerPlan).includes(semesterKey) && formerPlan[semesterKey].length + uniqueIdList.length <= 4) {
    const coursesPlanned = Object.values(formerPlan).map((semesterPlan) => semesterPlan.map((courseInfo) => courseInfo.id))
    const isCourseDuplicate = coursesPlanned.some((semesterPlan) => semesterPlan.some((courseId) => uniqueIdList.includes(courseId)))
    if (!isCourseDuplicate) {
      try {
        await Promise.all(uniqueIdList.map(async (courseId) => {
          await addCourseToSemester(userId, courseId, semesterKey, formerPlan)
        }))
        const newPlan = await getFullPlanFromDB(userId)
        res.status(200).json({ fullPlan: newPlan, message: `Successfully added courses ${uniqueIdList.join(', ')} to ${semesterKey}!` })
      } catch (err) {
        res.status(500).json({ fullPlan: formerPlan, message: err.message })
      }
    } else {
      res.status(401).json({ fullPlan: formerPlan, message: `At least one of ${uniqueIdList.join(', ')} is already planned for this or another semester!` })
    }
  } else {
    res.status(401).json({ fullPlan: formerPlan, message: 'Only a maximum of four courses can be added to a semester\'s plan!' })
  }
}

/**
* Returns the courses from the database linked with the prerequisites and core requirements
* @return Information for each course including prerequisites and core requirements
*/
const getCourses = async () => {
  try {
    const db = await fetchDB()
    const query = `SELECT Courses.ID, Courses.title, Courses.description, 
        Courses.creditAmount, Courses.yearOffered, Courses.semesterOffered, Prereqs.prereqId as prereq, CourseCores.coreId as core FROM Courses 
        LEFT OUTER JOIN CoursePrerequisites AS Prereqs ON Prereqs.courseId == Courses.ID 
        LEFT OUTER JOIN CourseCoreRequirements AS CourseCores ON CourseCores.courseID == Courses.ID`
    const res = await db.all(query)
    return res
  } catch (err) {
    throw new Error(err.message)
  }
}

exports.getCourses = getCourses

/**
* Fetches all the courses in the database
* @return A dictionary with all the relevant information for each course (courseInfo[])
*/
const fetchAllCourses = async () => {
  const courseDict = {}
  const results = await getCourses()

  for (const row of results) {
    const { ID, title, description, creditAmount, yearOffered, semesterOffered, core, prereq } = row
    if (courseDict[ID]) {
      const prereqs = courseDict[ID].prerequisites
      courseDict[ID] = {
        ...courseDict[ID],
        cores: core != null ? [...courseDict[ID].cores, core] : courseDict[ID].cores,
        prerequisites: prereq != null && !prereqs.includes(prereq) ? [...prereqs, prereq] : prereqs
      }
    } else {
      courseDict[ID] = {
        id: ID,
        cores: core != null ? [core] : [],
        creditAmount,
        title,
        description,
        yearOffered,
        semesterOffered,
        prerequisites: prereq != null ? [prereq] : []
      }
    }
  }
  return courseDict
}

exports.fetchAllCourses = fetchAllCourses

/**
* Returns the full user course plan
* @param userId The respective user's ID
* @return The user's start end keys (i.e. [F2022, S2025])
*/
const getStartEndKeys = async (userId) => {
  try {
    const db = await fetchDB()
    const query = 'SELECT * FROM Students WHERE ID = ?'
    const res = await db.get(query, [userId])
    let toReturn
    if (res && res.startDate && res.gradDate) {
      toReturn = [res.startDate, res.gradDate]
    } else {
      toReturn = []
    }
    return toReturn
  } catch (err) {
    throw new Error(err.message)
  }
}

exports.getStartEndKeys = getStartEndKeys

/**
* Returns the full user course plan
* @return Full Course Plan {F2022: courseInfo[], S2023: courseInfo: [], ...}
*/
exports.fetchPlan = async (req, res) => {
  const userId = req.userId
  COURSE_DATA = await fetchAllCourses()
  if (COURSE_DATA) {
    const data = await getStudentCoursePlan(userId)
    const startEndKeys = await getStartEndKeys(userId)
    console.log('Start End Keys', startEndKeys)
    if (startEndKeys && startEndKeys.length === 2) {
      const fullPlan = await createFullPlan(data, startEndKeys)
      res.status(200).json({ fullPlan, courseCatalog: Object.values(COURSE_DATA) })
    } else {
      res.status(200).json({ message: 'Start and End keys are invalid. Please create a new account.' })
    }
  } else {
    res.status(200).json({ message: 'Failed to initialize course data.' })
  }
}

/**
* Returns the user's course plan
* @param userId The respective user's ID to make queries with
* @return Course Plan {F2022: courseInfo[], S2023: courseInfo: [], ...}
*/
const getStudentCoursePlan = async (userId) => {
  try {
    const db = await fetchDB()
    const query = 'SELECT * FROM StudentCoursePlan WHERE studentId = ?'
    const res = await db.all(query, [userId])
    return res
  } catch (err) {
    throw new Error(err.message)
  }
}

exports.getStudentCoursePlan = getStudentCoursePlan
