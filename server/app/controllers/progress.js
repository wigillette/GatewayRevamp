// Planner.js Module: Handles course assignments to core requirements
const { fetchDB } = require("../model"); 
const CORES = require("../../../client/src/shared/cores.json");
const DEFAULT_CORE_ASSIGNMENTS = CORES.reduce((assignments,coreId) => ({...assignments,[coreId]:null}), {});

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

const getMappings = async (studentId) => {
    try {
        const db = await fetchDB(); 
        const query = `SELECT StudentCoursePlan.courseId, CourseCores.coreId  FROM StudentCoursePlan
        LEFT OUTER JOIN CourseCoreRequirements AS CourseCores ON CourseCores.courseID == StudentCoursePlan.courseId 
        WHERE StudentCoursePlan.studentId = ?`
        const courseCoreMappings = await db.all(query, [studentId])
        if (courseCoreMappings) {
            return courseCoreMappings
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
    // TO-DO: Check if the course has the requested core requirement in the database and remove it from the original assignment (i.e. cannot have both SS and GN)
    const query = isAssignedCore ? 'UPDATE CourseSpecialCoreRequirements SET courseId = ? WHERE studentId = ? AND coreId = ?' : 'INSERT INTO CourseSpecialCoreRequirements (courseId, studentId, coreId) VALUES (?, ?, ?)'
    db.run(query, [courseId, userId, coreId], (err) => {
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

const computeCreditsFromMappings = async (mappings) => {
    try {
        const db = await fetchDB(); 
        const query = `SELECT Courses.ID, Courses.creditAmount FROM Courses`;
        const courseCreditsInfo = await db.all(query)
        if (courseCreditsInfo) {
            const mappingIds = mappings.map((mapping) => mapping.courseId);
            const plannedCreditInfo = courseCreditsInfo.filter((courseCreditInfo) => mappingIds.includes(courseCreditInfo.ID));
            const totalCredits = plannedCreditInfo.reduce((acc, curr) => acc + curr.creditAmount, 0);
            return totalCredits;
        } else {
            return 0;
        }
    } catch (err) {
        return err.message
    }
}

/**
 * Returns all the core requirements for all the courses in the student schedule
 * @return {Promise<{ courseId, coreId }[]>} A list of objects which contains courseId and coreId
 */
exports.fetchAssignments = async (req, res) => {
    const studentId = req.userId;
    const mappings = await getMappings(studentId);
    const assignments = await getAssignments(studentId);
    if (mappings && assignments && typeof(mappings) !== String && typeof(assignments) !== String) {
        const totalCredits = await computeCreditsFromMappings(mappings);
        if (typeof(totalCredits) === Number) {
            res.status(200).json({planMappings: mappings, coreAssignments: assignments, totalCredits: totalCredits});
        }
    } else {
        console.log("FAILURE");
        res.status(500).json({message: "Failed to intiailize mappings and assignments."})
    }
  }