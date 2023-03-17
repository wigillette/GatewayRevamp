// Planner.js Module: Handles changes to semester plans

/*
{
"id": "STAT-451-A",
"cores": [],
"creditAmount": 4,
"title": "Topics in Adv Stat",
"description": "",
"yearOffered": "",
"semesterOffered": "",
"prerequisites": []
}, ...]
*/
const COURSE_DATA = require("../model/course-db.json")
const PLAN_TEMPLATE = {F2019: [], S2020: [], F2020: [], S2021: [], F2021: [], S2022: [], F2022: [], S2023: []}
const SAMPLE_COURSE_IDS = ["CS-173", "CS-174", "MATH-112", "MATH-111", "MATH-211", "CS-274", "STAT-141", "MATH-236", "ECON-101"]
const SAMPLE_COURSES = SAMPLE_COURSE_IDS.map((id) => COURSE_DATA.find((course) => course.id && course.id.includes(id, 0))); 
const TEST_TEMPLATE = {F2019: [SAMPLE_COURSES[0], SAMPLE_COURSES[1]], S2020: [SAMPLE_COURSES[2], SAMPLE_COURSES[3], SAMPLE_COURSES[4], SAMPLE_COURSES[5]], F2020: [SAMPLE_COURSES[6], SAMPLE_COURSES[7]], S2021: [], F2021: [], S2022: [], F2022: [], S2023: []}

exports.removeCourse = (req, res) => {
    const [courseId, semesterKey] = Object.values(req.body);
    console.log(courseId, semesterKey);
    // TO-DO: fill this in
    const userId = req.userId;
    res.status(200).json({
        fullPlan: PLAN_TEMPLATE,
        message: `Successfully removed course ${courseId} from ${semesterKey}!`
    })
}

exports.addCourses = (req, res) => {
    const [courseIdList, semesterKey] = Object.values(req.body);
    // TO-DO: fill this in
    const userId = req.userId;
    res.status(200).json({
        // TO-DO: replace PLAN_TEMPLATE with the user's plan data in the database and SAMPLE_COURSES with the full list of all courses
        fullPlan: {...PLAN_TEMPLATE, [semesterKey]: [...PLAN_TEMPLATE[semesterKey], ...SAMPLE_COURSES.filter((courseInfo) => courseIdList.includes(courseInfo.id))]},
        message: `Successfully added courses ${courseIdList.join(", ")} to ${semesterKey}!`
    })
}

exports.fetchPlan = (req, res) => {
    // TO-DO: fill this in
    const userId = req.userId;
    console.log(userId);
    res.status(200).json({fullPlan: TEST_TEMPLATE, courseCatalog: SAMPLE_COURSES});
}