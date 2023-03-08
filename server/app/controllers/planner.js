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

const TEST_TEMPLATE = {F2019: [COURSE_TEMPLATE(0, "Calculus 2", "Advanced Integration", ["Q"], 4, ["Fall", "Spring", "Odd", "Even"]), COURSE_TEMPLATE(1, "Introduction to Computer Science", "An introduction to elementary computing practices", [], 4, ["Fall", "Spring", "Odd", "Even"])], S2020: [COURSE_TEMPLATE(2, "Calculus 3", "Multivariate Calculus", ["Q", "R"], 4, ["Fall", "Spring", "Even"])], F2020: [], S2021: [], F2021: [], S2022: [], F2022: [], S2023: []}

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
    console.log(courseIdList, semesterKey);
    // TO-DO: fill this in
    const userId = req.userId;
    res.status(200).json({
        fullPlan: PLAN_TEMPLATE,
        message: `Successfully added courses ${courseIdList.join(", ")} to ${semesterKey}!`
    })
}

exports.fetchPlan = (req, res) => {
    // TO-DO: fill this in
    const userId = req.userId;
    console.log(userId);
    res.status(200).json({fullPlan: TEST_TEMPLATE, courseCatalog: [COURSE_TEMPLATE(0, "Calculus 2", "Advanced Integration", ["Q"], 4, ["Fall", "Spring", "Odd", "Even"]), COURSE_TEMPLATE(1, "Introduction to Computer Science", "An introduction to elementary computing practices", [], 4, ["Fall", "Spring", "Odd", "Even"]), COURSE_TEMPLATE(2, "Calculus 3", "Multivariate Calculus", ["Q", "R"], 4, ["Fall", "Spring", "Even"])]});
}