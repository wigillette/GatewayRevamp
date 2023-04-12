// Planner.js Module: Handles course assignments to core requirements
const { fetchDB } = require("../model"); 
const CORES = require("../../../client/src/shared/cores.json");
const DEFAULT_CORE_ASSIGNMENTS = CORES.reduce((assignments,coreId) => ({...assignments,[coreId]:null}), {});

/**
 * Checks if the core requirement is assigned to a student
 * @param  {number} studentId  A student id
 * @param  {String} courseId   A course to update - ex. "MATH-111"
 * @return {Promise<bool>}  A Promise of whether the category is already assigned
 */
const isCourseAssignedCore = async (studentId, courseId) => {
    let db = await fetchDB(); 
    let query = 'SELECT * FROM CourseSpecialCoreRequirements WHERE studentId = ? AND courseId = ?'
    const res = await db.get(query, [studentId, courseId])
    if (res && res.length) {
        return true
    } else {
        return false
    }
}

exports.isCourseAssignedCore = isCourseAssignedCore;

const getMappings = async (studentId) => {
    try {
        const db = await fetchDB(); 
        const query = `SELECT StudentCoursePlan.courseId, CourseCores.coreId  FROM StudentCoursePlan
        LEFT OUTER JOIN CourseCoreRequirements AS CourseCores ON CourseCores.courseID == StudentCoursePlan.courseId 
        WHERE StudentCoursePlan.studentId = ?`
        const res = db.all(query, [studentId]);
        if (res && res.length) {
            return res
        } else {
            return DEFAULT_CORE_ASSIGNMENTS
        }
    } catch (err) {
        return err.message
    }
}

exports.getMappings = getMappings

const getAssignments = async (studentId) => {
    try {
        const db = await fetchDB(); 
        const query = `SELECT * FROM CourseSpecialCoreRequirements WHERE studentId = ?`
        const coreAssignments = await db.all(query, [studentId])
        if (coreAssignments && coreAssignments.length > 0) {
            const assignmentsDict = {...DEFAULT_CORE_ASSIGNMENTS, ...coreAssignments.reduce((dictState, row) => ({...dictState, [row.coreId]: row.courseId}), {})};
            return assignmentsDict
        } else {
            return DEFAULT_CORE_ASSIGNMENTS
        }
    } catch (err) {
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
    try {
        let db = await fetchDB(); 
        const [courseId, coreId] = Object.values(req.body);
        const userId = req.userId;
        const isAssignedCore = await isCourseAssignedCore(userId, courseId);
        // TO-DO: Check if the course has the requested core requirement in the database and remove it from the original assignment (i.e. cannot have both SS and GN)
        const query = isAssignedCore ? 
            'UPDATE CourseSpecialCoreRequirements SET courseId = ? WHERE studentId = ? AND coreId = ?' : 
            'INSERT INTO CourseSpecialCoreRequirements (courseId, studentId, coreId) VALUES (?, ?, ?)'
        const res = await db.run(query, [courseId, userId, coreId])
        console.log(`Updated ${this.lastID}: studentId: ${userId}, courseId: ${courseId}, and coreId: ${coreId}`)
        const assignments = await getAssignments(userId)
        res.status(200).json({coreAssignments: assignments, message: `Successfully assigned ${courseId} to ${coreId}!`})
    } catch (err) {
        res.status(500).json({message: err})
    }
}



/**
 * Returns all the core requirements for all the courses in the student schedule
 * @return {Promise<{ courseId, coreId }[]>} A list of objects which contains courseId and coreId
 */
exports.fetchAssignments = async (req, res) => {
    const studentId = req.userId;
    try {
        const mappings = await getMappings(studentId)
        const assignments = await getAssignments(studentId)
        res.status(200).json({ planMappings: mappings, coreAssignments: assignments })
    } catch (err) {
        res.status(500).json({message: err })
    }
}