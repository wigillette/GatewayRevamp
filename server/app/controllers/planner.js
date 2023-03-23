// Planner.js Module: Handles changes to semester plans

const { fetchDB } = require("../model");
let COURSE_DATA = []
const PLAN_TEMPLATE = {F2019: [], S2020: [], F2020: [], S2021: [], F2021: [], S2022: [], F2022: [], S2023: []}
const SAMPLE_COURSE_IDS = ["CS-173", "CS-174", "MATH-112", "MATH-111", "MATH-211", "CS-274", "STAT-140", "MATH-236", "ART-150"]
const SAMPLE_COURSES = SAMPLE_COURSE_IDS.map((id) => COURSE_DATA.find((course) => course.id && course.id.includes(id, 0))); 
const TEST_TEMPLATE = {F2019: [], S2020: [], F2020: [], S2021: [], F2021: [], S2022: [], F2022: [], S2023: []}
const db = fetchDB(); // Retrieve the database

exports.removeCourse = (req, res) => {
    const [courseId, semesterKey] = Object.values(req.body);
    console.log(courseId, semesterKey);
    // TO-DO: fill this in
    const userId = req.userId;
    res.status(200).json({
        fullPlan: {...TEST_TEMPLATE, [semesterKey]: [...TEST_TEMPLATE[semesterKey].filter((course) => course?.id !== courseId)]},
        message: `Successfully removed course ${courseId} from ${semesterKey}!`
    })
}

exports.addCourses = (req, res) => {
    const [courseIdList, semesterKey] = Object.values(req.body);
    // TO-DO: fill this in
    const userId = req.userId;
    res.status(200).json({
        // TO-DO: replace TEST_TEMPLATE with the user's plan data in the database and SAMPLE_COURSES with the full list of all courses
        fullPlan: {...TEST_TEMPLATE, [semesterKey]: [...TEST_TEMPLATE[semesterKey], ...COURSE_DATA.filter((courseInfo) => courseIdList.includes(courseInfo?.id))]},
        message: `Successfully added courses ${courseIdList.join(", ")} to ${semesterKey}!`
    })
}

const getCourses = async () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT Courses.ID, Courses.title, Courses.description, 
        Courses.creditAmount, Courses.yearOffered, Courses.semesterOffered, Prereqs.prereqId as prereq, CourseCores.coreId as core FROM Courses 
        LEFT OUTER JOIN CoursePrerequisites AS Prereqs ON Prereqs.courseId == Courses.ID 
        LEFT OUTER JOIN CourseCoreRequirements AS CourseCores ON CourseCores.courseID == Courses.ID 
    `, (error, rows) => {
            if (error) {
                reject(error.message)
            } else {
                resolve(rows)
            }
        })
    })  
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
    return Object.values(courseDict)
}

exports.fetchPlan = async (req, res) => {
    // TO-DO: fill this in
    const userId = req.userId;

    COURSE_DATA = await fetchAllCourses();
    if (COURSE_DATA) {
        res.status(200).json({fullPlan: TEST_TEMPLATE, courseCatalog: COURSE_DATA});
    } else {
        res.status(500).json({message: "Failed to initialize course data."})
    }
}