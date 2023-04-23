// Planner.js Module: Handles course assignments to core requirements
const { fetchDB } = require('../model')
const CORES = require('../../../client/src/shared/cores.json')
const DEFAULT_CORE_ASSIGNMENTS = CORES.reduce((assignments, coreId) => ({ ...assignments, [coreId]: null }), {})

/**
 * Checks if the core requirement is assigned to a student
 * @param  {number} studentId  A student id
 * @param  {String} courseId   A course to update - ex. "MATH-111"
 * @return {Promise<bool>}  A Promise of whether the category is already assigmed
 */
const isCourseAssignedCore = async (studentId, courseId) => {
  try {
    const db = await fetchDB()
    const query = 'SELECT * FROM CourseSpecialCoreRequirements WHERE studentId = ? AND courseId = ?'
    const result = await db.get(query, [studentId, courseId])
    return result !== undefined
  } catch (err) {
    throw new Error(err.message)
  }
}

exports.isCourseAssignedCore = isCourseAssignedCore

const getMappings = async (studentId) => {
  try {
    const db = await fetchDB()
    const query = `SELECT StudentCoursePlan.courseId, CourseCores.coreId FROM StudentCoursePlan
        LEFT OUTER JOIN CourseCoreRequirements AS CourseCores ON CourseCores.courseID == StudentCoursePlan.courseId 
        WHERE StudentCoursePlan.studentId = ?`
    const courseCoreMappings = await db.all(query, [studentId])
    return courseCoreMappings
  } catch (err) {
    console.log(err)
    return err.message
  }
}

exports.getMappings = getMappings

const getAssignments = async (studentId) => {
  try {
    const db = await fetchDB()
    const query = 'SELECT * FROM CourseSpecialCoreRequirements WHERE studentId = ?'
    const coreAssignments = await db.all(query, [studentId])
    if (coreAssignments && coreAssignments.length > 0) {
      const assignmentsDict = { ...DEFAULT_CORE_ASSIGNMENTS, ...coreAssignments.reduce((dictState, row) => ({ ...dictState, [row.coreId]: row.courseId }), {}) }
      return assignmentsDict
    } else {
      return DEFAULT_CORE_ASSIGNMENTS
    }
  } catch (err) {
    console.log(err)
    return err.message
  }
}

exports.getAssignments = getAssignments

/**
 * Assigns a core requirement
 * @param  {String} courseId  A course to delete - ex. "MATH-111"
 * @param  {String} coreId   The name of the core requirement to assign - ex. "H", "DN"
 * @return
 */
exports.assignCore = async (req, res) => {
  const db = await fetchDB()
  const { courseId, coreId } = req.body
  const userId = req.userId
  // TO-DO: Check if the course has the requested core requirement in the database and remove it from the original assignment (i.e. cannot have both SS and GN)
  try {
    const isAssignedCore = await isCourseAssignedCore(userId, courseId)
    // DATABASE IS NOT UPDATING HERE
    if (isAssignedCore) {
      const updateQuery = 'UPDATE CourseSpecialCoreRequirements SET coreId = ? WHERE studentId = ? AND courseId = ?'
      await db.run(updateQuery, [coreId, userId, courseId])
    } else {
      const insertQuery = 'INSERT INTO CourseSpecialCoreRequirements (courseId, studentId, coreId) VALUES (?, ?, ?)'
      await db.run(insertQuery, [courseId, userId, coreId])
    }
    const assignments = await getAssignments(userId)
    res.status(200).json({ coreAssignments: assignments, message: `Successfully assigned ${courseId} to ${coreId}!` })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err })
  }
}

const computeCreditsFromMappings = async (mappings) => {
  try {
    const db = await fetchDB()
    const query = 'SELECT Courses.ID, Courses.creditAmount FROM Courses'
    const courseCreditsInfo = await db.all(query)
    if (courseCreditsInfo) {
      const mappingIds = mappings.map((mapping) => mapping.courseId)
      const plannedCreditInfo = courseCreditsInfo.filter((courseCreditInfo) => mappingIds.includes(courseCreditInfo.ID))
      const totalCredits = plannedCreditInfo.reduce((acc, curr) => acc + curr.creditAmount, 0)
      return totalCredits
    } else {
      return 0
    }
  } catch (err) {
    console.log(err)
    return err.message
  }
}

exports.computeCreditsFromMappings = computeCreditsFromMappings

/**
 * Returns all the core requirements for all the courses in the student schedule
 * @return {Promise<{ courseId, coreId }[]>} A list of objects which contains courseId and coreId
 */
exports.fetchAssignments = async (req, res) => {
  const studentId = req.userId
  try {
    const mappings = await getMappings(studentId)
    const assignments = await getAssignments(studentId)
    if (mappings && assignments && typeof (mappings) !== 'string' && typeof (assignments) !== 'string') {
      const totalCredits = await computeCreditsFromMappings(mappings)
      res.status(200).json({ planMappings: mappings, coreAssignments: assignments, totalCredits })
    } else {
      res.status(500).json({ message: 'Failed to intiailize mappings and assignments.' })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message })
  }
}
