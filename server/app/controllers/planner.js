// Planner.js Module: Handles changes to semester plans
exports.removeCourse = (req, res) => {
    const [courseId, semesterKey] = Object.values(req.body);
    console.log(courseId, semesterKey);
    // TO-DO: fill this in
    res.status(200).json({
        fullPlan: {F2019: [], S2020: [], F2020: [], S2021: [], F2021: [], S2022: [], F2022: [], S2023: []},
        message: "Removal Successful"
    })
}

exports.addCourses = (req, res) => {
    const [courseIdList, semesterKey] = Object.values(req.body);
    console.log(courseIdList, semesterKey);
    // TO-DO: fill this in
    res.status(200).json({
        fullPlan: {F2019: [], S2020: [], F2020: [], S2021: [], F2021: [], S2022: [], F2022: [], S2023: []},
        message: "Add Successful"
    })
}