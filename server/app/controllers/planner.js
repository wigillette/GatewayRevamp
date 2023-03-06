// Planner.js Module: Handles changes to semester plans

const PLAN_TEMPLATE = {F2019: [], S2020: [], F2020: [], S2021: [], F2021: [], S2022: [], F2022: [], S2023: []}

exports.removeCourse = (req, res) => {
    const [courseId, semesterKey] = Object.values(req.body);
    console.log(courseId, semesterKey);
    // TO-DO: fill this in
    const userId = req.userId;
    res.status(200).json({
        fullPlan: PLAN_TEMPLATE,
        message: "Removal Successful"
    })
}

exports.addCourses = (req, res) => {
    const [courseIdList, semesterKey] = Object.values(req.body);
    console.log(courseIdList, semesterKey);
    // TO-DO: fill this in
    const userId = req.userId;
    res.status(200).json({
        fullPlan: PLAN_TEMPLATE,
        message: "Add Successful"
    })
}

exports.fetchPlan = (req, res) => {
    // TO-DO: fill this in
    const userId = req.userId;
    console.log(userId);
    res.status(200).json({fullPlan: PLAN_TEMPLATE});
}