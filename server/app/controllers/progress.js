// Planner.js Module: Handles course assignments to core requirements
const { fetchDB } = require("../model");
const db = fetchDB(); // Retrieve the database

/**
 * Checks if an email exists
 * @param  {String} email  An email 
 * @return {Promise<bool>} A promise on whether or not the email exists
 */
const emailExists = async (email) => {
    const query = `SELECT * FROM STUDENTS WHERE email = ?`
    return new Promise((resolve, reject) => {
        db.get(query, [email], (err, row) => {
            if (err) {
                console.log(err);
                reject(false);
            } else if (row) {
                console.log(row);
                resolve(true);
            } else {
                resolve(false);
            }
        })
    })
}

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

/**
 * Assigns a core requirement 
 * @param  {String} courseId  A course to delete - ex. "MATH-111"
 * @param  {String} coreId   The name of the core requirement to assign - ex. "H", "DN"
 * @return 
 */
export const assignCore = async (req, res) => {
    const [courseId, coreId] = Object.values(req.body);
    const userId = req.userId;
    const isAssignedCore = await isCourseAssignedCore(userId, courseId);
    // Probably a better way to condense this using ternary operator
    if (isAssignedCore) {
        const query = 'UPDATE CourseSpecialCoreRequirements SET coreId = ? WHERE courseId = ? AND studentId = ?'
        db.run(query, [coreId, courseId, userId], (err) => {
            if (err) {
                console.log(err);
                res.status(500).json({message: err.message});
            } else {
                console.log(`Updated ${this.lastID}: studentId: ${studentId}, courseId: ${courseId}, and coreId: ${coreId}`)
                res.status(200).json({message: `Successfully added ${courseId} to ${coreId}!`});
            }
        })
    } else {
        const query = 'INSERT INTO CourseSpecialCoreRequirements (studentId, courseId, coreId) VALUES (?, ?, ?)';
        db.run(query, [userId, courseId, coreId], (err) => {
            if (err) {
                console.log(err);
                res.status(500).json({message: err.message});
            } else {
                console.log(`Added ${this.lastID}: studentId: ${studentId}, courseId: ${courseId}, and coreId: ${coreId}`)
                res.status(200).json({message: `Successfully added ${courseId} to ${coreId}!`});
            }
        })
    }
}