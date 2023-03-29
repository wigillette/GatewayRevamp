// Planner.js Module: Handles course assignments to core requirements
const { fetchDB } = require("../model");
const db = fetchDB(); // Retrieve the database
const CORES = require("../../../client/src/shared/cores.json");
const DEFAULT_CORE_ASSIGNMENTS = CORES.reduce((assignments,coreId) => ({...assignments,[coreId]:null}), {});
const PARTITION_SIZE = 3;

/**
 * Checks if the core requirement is assigned to a student
 * @param  {number} studentId  A student id
 * @param  {String} courseId   A course to update - ex. "MATH-111"
 * @return {Promise<bool>}  A Promise of whether the category is already assigmed
 */
const isCourseAssignedCore = (studentId, courseId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM CourseSpecialCoreRequirements WHERE studentId = ? AND courseId = ?'
        db.get(query, [studentId, courseId], (err, row) => {
            if (err) {
                reject(false)
            } else if (row) {
                resolve(true)
            } else {
                resolve(false)
            }
        })
    })
}

const getMappings = (studentId) => {
    let query = `SELECT StudentCoursePlan.courseId, CourseCores.coreId  FROM StudentCoursePlan
    LEFT OUTER JOIN CourseCoreRequirements AS CourseCores ON CourseCores.courseID == StudentCoursePlan.courseId 
    WHERE StudentCoursePlan.studentId = ?`
    return new Promise((resolve, reject) => {
        db.all(query, [studentId], (err, courseCoreMappings) => {
            if (err) {
                reject(err.message);
            } else if (courseCoreMappings) {
                resolve(courseCoreMappings);                
            } else {
                resolve(DEFAULT_CORE_ASSIGNMENTS);
            }
        })
    })
}

const getAssignments = (studentId) => {
    const query = `SELECT * FROM CourseSpecialCoreRequirements WHERE studentId = ?`
    return new Promise((resolve, reject) => {
        db.all(query, [studentId], (err, coreAssignments) => {
            if (err) {
                reject(err.message);
            } else if (coreAssignments && coreAssignments.length >= 3) {
                const assignmentsDict = coreAssignments.reduce((dictState, row) => ({...dictState, [row[1]]: row[2]}), {});                
                resolve(assignmentsDict);
            } else {
                resolve(DEFAULT_CORE_ASSIGNMENTS)
            }
        })
    })
}

/**
 * Assigns a core requirement 
 * @param  {String} courseId  A course to delete - ex. "MATH-111"
 * @param  {String} coreId   The name of the core requirement to assign - ex. "H", "DN"
 * @return 
 */
exports.assignCore = async (req, res) => {
    const [courseId, coreId] = Object.values(req.body);
    const userId = req.userId;
    const isAssignedCore = await isCourseAssignedCore(userId, courseId);
    const query = isAssignedCore ? 'UPDATE CourseSpecialCoreRequirements SET studentId = ? WHERE courseId = ? AND coreId = ?' : 'INSERT INTO CourseSpecialCoreRequirements (studentId, courseId, coreId) VALUES (?, ?, ?)'
    db.run(query, [userId, courseId, coreId], (err) => {
        if (err) {
            console.log(err);
            res.status(500).json({message: err.message});
        } else {
            console.log(`Updated ${this.lastID}: studentId: ${userId}, courseId: ${courseId}, and coreId: ${coreId}`)
            getAssignments(userId).then((assignments) => res.status(200).json({coreAssignments: assignments, message: `Successfully assigned ${courseId} to ${coreId}!`}))
            .catch((err) => res.status(500).json({message: err}));
        }
    })
}



/**
 * Returns all the core requirements for all the courses in the student schedule
 * @return {Promise<{ courseId, coreId }[]>} A list of objects which contains courseId and coreId
 */
exports.fetchAssignments = async (req, res) => {
    const studentId = req.userId;
    getMappings(studentId).then((mappings) => {
        getAssignments(studentId).then((assignments) => res.status(200).json({planMappings: mappings, coreAssignments: assignments}))
        .catch((err) => res.status(500).json({message: err}));
    }).catch((err) => res.status(500).json({message: err}));
  }