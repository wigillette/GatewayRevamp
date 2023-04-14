// Planner.js Module: Handles course assignments to core requirements
const { fetchDB } = require("../model");
const db = fetchDB(); // Retrieve the database
const CORES = require("../../../client/src/shared/cores.json");
const DEFAULT_CORE_ASSIGNMENTS = CORES.reduce((assignments,coreId) => ({...assignments,[coreId]:null}), {});

const removeAssignment = (studentId, courseId) => {
    const query = 'DELETE FROM CourseSpecialCoreRequirements WHERE studentId = ? AND courseId = ?'
    db.run(query, [studentId, courseId], (err) => {
        if (err) {
            console.log(err.message);
        }
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
            } else if (courseCoreMappings && courseCoreMappings.length > 0) {
                resolve(courseCoreMappings);                
            } else {
                resolve(Object.entries(DEFAULT_CORE_ASSIGNMENTS).map((entry) => {return {coreId: entry[0], courseId: null}}));
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
            } else if (coreAssignments && coreAssignments.length > 0) {
                const assignmentsDict = {...DEFAULT_CORE_ASSIGNMENTS, ...coreAssignments.reduce((dictState, row) => ({...dictState, [row.coreId]: row.courseId}), {})};
                resolve(assignmentsDict);
            } else {
                resolve(DEFAULT_CORE_ASSIGNMENTS)
            }
        })
    })
}

const assertFulfillment = (courseId, coreId) => {
    const query = 'SELECT * FROM CourseCoreRequirements WHERE courseId = ? AND coreId = ?';
    return new Promise((resolve, reject) => {
        db.all(query, [courseId, coreId], (err, rows) => {
            if (err) {
                reject(err.message);
            } else if (rows && rows.length > 0) {
                resolve(true)
            } else {
                resolve(false);
            }
        })
    });
}

const isCoreFilled = (coreId, studentId) => {
    const query = `SELECT * FROM CourseSpecialCoreRequirements WHERE studentId = ? AND coreId = ?`;
    return new Promise((resolve, reject) => {
        db.get(query, [studentId, coreId], (err, rows) => {
            if (err) {
                reject(false);
            } else if (rows && rows.length > 0) {
                resolve(true)
            } else {
                resolve(false);
            }
        });
    });
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
    removeAssignment(userId, courseId); // Delete the old entry where the core was assigned to make room for the new one (need to change to reflect core requirements where it can fulfill multiple)
    const isFilled = await isCoreFilled(coreId, userId); // whether the core requirement is filled with an existing course
    const query = isFilled ? 'UPDATE CourseSpecialCoreRequirements SET courseId = ? WHERE studentId = ? AND coreId = ?' : 'INSERT INTO CourseSpecialCoreRequirements (courseId, studentId, coreId) VALUES (?, ?, ?)'
    assertFulfillment(courseId, coreId).then((hasCore) => { // assert that the course fulfills the specified core requirement
        if (hasCore) {
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
        } else {
            res.status(200).json({message: `${courseId} does not fulfill ${coreId}!`});
        }            
    }).catch((err) => res.status(500).json({message: err}));
}

const computeCreditsFromMappings = (mappings) => {
    
    const query = `SELECT Courses.ID, Courses.creditAmount FROM Courses`;
    return new Promise((resolve, reject) => {
        if (mappings) {
            db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err.message);
                } else if (rows && rows.length > 0) {
                    const mappingIds = mappings.map((mapping) => mapping.courseId);
                    const plannedCreditInfo = rows.filter((row) => mappingIds.includes(row.ID));
                    const totalCredits = plannedCreditInfo.reduce((acc, curr) => acc + curr.creditAmount, 0);
                    resolve(totalCredits);
                } else {
                    resolve(0);
                }
            })
        } else {
            reject("Failed to initialize")
        }
    });
    
}

/**
 * Returns all the core requirements for all the courses in the student schedule
 * @return {Promise<{ courseId, coreId }[]>} A list of objects which contains courseId and coreId
 */
exports.fetchAssignments = async (req, res) => {
    const studentId = req.userId;
    getMappings(studentId).then((mappings) => {
        getAssignments(studentId).then((assignments) => {
            computeCreditsFromMappings(mappings).then((totalCredits) => {
                res.status(200).json({planMappings: mappings, coreAssignments: assignments, totalCredits: totalCredits})
            }).catch((err) => res.status(500).json({message: err}));
        }).catch((err) => res.status(500).json({message: err}));
    }).catch((err) => res.status(500).json({message: err}));
  }