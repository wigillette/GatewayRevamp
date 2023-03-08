// Planner.js Module: Handles changes to semester plans

/*
{
id: string
title: string,
description: string,
cores: string[],
creditAmount: number
}, ...]
*/
const PLAN_TEMPLATE = {F2019: [], S2020: [], F2020: [], S2021: [], F2021: [], S2022: [], F2022: [], S2023: []}
const COURSE_TEMPLATE = (id, title, description, cores, creditAmount, offered) => {return {id: id, title: title, description: description, cores: cores, creditAmount: creditAmount, offered: offered}}
const SAMPLE_COURSES = [COURSE_TEMPLATE("MATH-112", "Calculus 2", "Advanced Integration", ["Q"], 4, ["Fall", "Spring", "Odd", "Even"]), COURSE_TEMPLATE("CS-173", "Introduction to Computer Science", "An introduction to elementary computing practices", [], 4, ["Fall", "Spring", "Odd", "Even"]), COURSE_TEMPLATE("MATH-211", "Calculus 3", "Multivariate Calculus", ["Q", "R"], 4, ["Fall", "Spring", "Even"])]

const TEST_TEMPLATE = {F2019: [SAMPLE_COURSES[0], SAMPLE_COURSES[1]], S2020: [SAMPLE_COURSES[2]], F2020: [], S2021: [], F2021: [], S2022: [], F2022: [], S2023: []}

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