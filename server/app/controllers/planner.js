// Planner.js Module: Handles changes to semester plans
const { fetchDB } = require("../model");
let COURSE_DATA = []
const DEFAULT_PLAN = {F2019: [], S2020: [], F2020: [], S2021: [], F2021: [], S2022: [], F2022: [], S2023: []}

const semesterKeyInterp = (startKey, endKey) => {
    // Validate input format
    const formatRegex = /^[FS]\d{4}$/;
    const semesterKeys = [];
    let start = startKey;
    if (formatRegex.test(startKey) && formatRegex.test(endKey)) {
        // Extract the semester season and year from the start and end keys
        const startSeason = startKey.substring(0, 1);
        const startYear = parseInt(startKey.substring(1));
    
        // Generate the list of semester keys
        let currentYear = startYear;
        let currentSeason = startSeason;
        while (start != endKey) {
            let semester = currentSeason + currentYear.toString().padStart(4, "0")
            start = semester
            semesterKeys.push(semester);
        
            // Update the current season and year
            if (currentSeason === "F") {
                currentSeason = "S";
                currentYear++;
            } else {
                currentSeason = "F";
            }
        }
    }
    return semesterKeys;
}

exports.semesterKeyInterp = semesterKeyInterp

const createFullPlan = (dataEntries, startEndDates) => {
    let newPlan = DEFAULT_PLAN
    if (startEndDates && startEndDates.length === 2) {
        const sKeyList = semesterKeyInterp(startEndDates[0], startEndDates[1])
        newPlan = Object.fromEntries(sKeyList.map(sKey => [sKey, []])); //JSON.parse(JSON.stringify(DEFAULT_PLAN));
        if (dataEntries && dataEntries.length > 0 && COURSE_DATA) {
            let courseEntries = dataEntries.filter((dataEntry) => dataEntry && dataEntry.semester && dataEntry.courseId && Object.keys(COURSE_DATA).includes(dataEntry.courseId));
            courseEntries = courseEntries.map((dataEntry) => [dataEntry.semester, COURSE_DATA[dataEntry.courseId]])
            courseEntries.forEach((courseEntry) => {
                if (Object.keys(newPlan).includes(courseEntry[0])) {
                    newPlan[courseEntry[0]].push(courseEntry[1])
                }
            })
        }
    }
    return newPlan;
}

exports.createFullPlan = createFullPlan

exports.removeCourse = async (req, res) => {
    let db = await fetchDB();
    const { courseId, semesterKey } = req.body;
    const userId = req.userId;
    // Update the plan to remove the course
    try {
        const formerPlan = await getFullPlanFromDB(userId)
        let query = 'DELETE FROM StudentCoursePlan WHERE studentId = ? AND courseId = ? AND semester = ?' 
        let response = db.run(query, [userId, courseId, semesterKey])
        query = 'DELETE FROM CourseSpecialCoreRequirements WHERE courseId = ? AND studentId = ?'
        try {
            response = await db.run(query, [userId, courseId])
            const newPlan = await getFullPlanFromDB(userId);
            res.status(200).json({fullPlan: newPlan, message: `Successfully removed course ${courseId} from ${semesterKey}!`})
        } catch (err) {
            res.status(500).json({fullPlan: formerPlan, message: err})
            console.log(err);
        }
    } catch (err) {
        res.status(500).json({message: err.message});
        console.log(err);
    }
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
exports.addCourseToSemester = addCourseToSemester

const getFullPlanFromDB = async (userId) => {
    try {
        const db = await fetchDB(); 
        const query = 'SELECT * FROM StudentCoursePlan WHERE studentId = ?'
        const entries = await db.all(query, [userId])

        if (entries) {
            const startEndDates = await getStartEndKeys(userId);
            return createFullPlan(entries, startEndDates)
        } else {
            throw new Error("User not found.")
        }
    } catch (err) {
        throw new Error(err);
    }
}

exports.getFullPlanFromDB = getFullPlanFromDB

exports.addCourses = async (req, res) => {
    const { courseIdList, semesterKey } = req.body
    const userId = req.userId;
    const formerPlan = await getFullPlanFromDB(userId)
    try {
        await Promise.all(courseIdList.map(async (courseId) => {
            await addCourseToSemester(userId, courseId, semesterKey, formerPlan)
        }))
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

const getStartEndKeys = async (userId) => {
    try {
        const db = await fetchDB()
        const query = `SELECT * FROM Students WHERE ID = ?`
        const res = await db.get(query, [userId])
        let toReturn;
        if (res && res.startDate && res.gradDate) {
            toReturn = [res.startDate, res.gradDate]
        } else {
            toReturn = []
        }
        return toReturn;
    } catch (err) {
        throw new Error(err.message)
    }
}

exports.getStartEndKeys = getStartEndKeys

exports.fetchPlan = async (req, res) => {
    const userId = req.userId;
    COURSE_DATA = await fetchAllCourses();
    if (COURSE_DATA) {
        const data = await testAsync(userId)
        const startEndKeys = await getStartEndKeys(userId);
        console.log("Start End Keys", startEndKeys);
        if (startEndKeys && startEndKeys.length == 2) {
            const fullPlan = await createFullPlan(data, startEndKeys);
            console.log(fullPlan)
            res.status(200).json({fullPlan: fullPlan, courseCatalog: Object.values(COURSE_DATA)})
        } else {
            res.status(500).json({message: "Failed to initialize course data"})
        }
    } else {
        res.status(500).json({message: "Failed to initialize course data."})
    }
}

// TODO change name getStudentCoursePlan
const testAsync = async (userId) => {
    try {
        const db = await fetchDB()
        const query = 'SELECT * FROM StudentCoursePlan WHERE studentId = ?';
        const res = await db.all(query, [userId])
        return res
    } catch (err) {
        throw new Error(err.message)
    }
}

exports.testAsync = testAsync