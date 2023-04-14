// Planner.js Module: Handles changes to semester plans
const { fetchDB } = require("../model");
let COURSE_DATA = []
const DEFAULT_PLAN = {F2019: [], S2020: [], F2020: [], S2021: [], F2021: [], S2022: [], F2022: [], S2023: []}

const createFullPlan = (dataEntries) => {
    const newPlan = JSON.parse(JSON.stringify(DEFAULT_PLAN));
    if (dataEntries && dataEntries.length > 0 && COURSE_DATA) {
        let courseEntries = dataEntries.filter((dataEntry) => dataEntry && dataEntry.semester && dataEntry.courseId && Object.keys(COURSE_DATA).includes(dataEntry.courseId));
        courseEntries = courseEntries.map((dataEntry) => [dataEntry.semester, COURSE_DATA[dataEntry.courseId]])
        courseEntries.forEach((courseEntry) => newPlan[courseEntry[0]].push(courseEntry[1]))
    }
    return newPlan;
}

exports.removeCourse = async (req, res) => {
    let db = await fetchDB();
    const [courseId, semesterKey] = Object.values(req.body);
    const userId = req.userId;
    // Update the plan to remove the course
    let query = 'DELETE FROM StudentCoursePlan WHERE studentId = ? AND courseId = ? AND semester = ?' 
    db.run(query, [userId, courseId, semesterKey], (err) => {
        if (err) {
            res.status(500).json({message: err.message});
            console.log(err);
        } else {
            // Update the core requirements assignments if the course is included there
            query = 'DELETE FROM CourseSpecialCoreRequirements WHERE courseId = ? AND studentId = ?'
            db.run(query, [userId, courseId], (err) => {
                if (err) {
                    res.status(500).json({message: err.message});
                    console.log(err);
                } else {
                    getFullPlanFromDB(userId).then(
                        (newPlan) => res.status(200).json({fullPlan: newPlan,  message: `Successfully removed course ${courseId} from ${semesterKey}!`}))
                        .catch((err) => res.status(404).json({fullPlan: formerPlan, message: err}))
                }
            })
        }
    })
}

const addCourseToSemester = async (studentId, course, semester, fullPlan) => {
    const db = await fetchDB(); 
    const semesterDuplicates = Object.keys(fullPlan).filter((key) => fullPlan[key].filter((courseEntry) => courseEntry.id === course).length > 0);
    if (semesterDuplicates <= 0) {
        try {
            const query = 'INSERT INTO StudentCoursePlan (studentId, courseId, semester) VALUES (?, ?, ?)'
            const result = await db.run(query, [studentId, course, semester])
            console.log(`Inserted a row with the ID: ${result.lastID} - ${course} for ${semester}`)
        } catch (err) {
            throw new Error(err.message)
        }
    } else {
        throw new Error(`${course} is already planned for ${semesterDuplicates.join(",")}!`)
    }
}
//TODO ///////tt/t/t/tt/t/t/t/t/t/t/
exports.addCourseToSemester = addCourseToSemester

const getFullPlanFromDB = async (userId) => {
    try {
        const db = await fetchDB(); 
        const query = 'SELECT * FROM StudentCoursePlan WHERE studentId = ?'
        const entries = await db.all(query, [userId])

        if (entries && entries.length) {
            return createFullPlan(entries)
        } else {
            throw new Error("User not found.")
        }
    } catch (err) {
        throw new Error(err.message)
    }
}

exports.getFullPlanFromDB = getFullPlanFromDB

exports.addCourses = async (req, res) => {
    const { courseIdList, semesterKey } = req.body
    const userId = req.userId;
    try {
        const formerPlan = await getFullPlanFromDB(userId)
        const promises = courseIdList.map((courseId) => addCourseToSemester(userId, courseId, semesterKey, formerPlan))
        await promises
        const newPlan = await getFullPlanFromDB(userId)
        res.status(200).json({fullPlan: newPlan, message: `Successfully added courses ${courseIdList.join(", ")} to ${semesterKey}!`})
    } catch (err) {
        res.status(500).json({fullPlan: formerPlan, message: err})
    }
}

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

exports.fetchAllCourses = fetchAllCourses;

exports.fetchPlan = async (req, res) => {
    const db = await fetchDB()
    const userId = req.userId;
    COURSE_DATA = await fetchAllCourses();
    if (COURSE_DATA.length != 0) {
        const query = 'SELECT * FROM StudentCoursePlan WHERE studentId = ?';
        const data = await db.all(query, [userId]);
        res.status(200).json({fullPlan: createFullPlan(data), courseCatalog: Object.values(COURSE_DATA)})
    } else {
        res.status(500).json({message: "Failed to initialize course data."})
    }
}