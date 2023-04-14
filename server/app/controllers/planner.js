// Planner.js Module: Handles changes to semester plans
const { fetchDB } = require("../model");
let COURSE_DATA = []
const DEFAULT_PLAN = {F2019: [], S2020: [], F2020: [], S2021: [], F2021: [], S2022: [], F2022: [], S2023: []}
const db = fetchDB(); // Retrieve the database

const semesterKeyInterp = (startKey, endKey) => {
    // Validate input format
    const formatRegex = /^[FS]\d{4}$/;
    const semesterKeys = [];
    if (formatRegex.test(startKey) && formatRegex.test(endKey)) {
        // Extract the semester season and year from the start and end keys
        const startSeason = startKey.substring(0, 1);
        const startYear = parseInt(startKey.substring(1));
        const endSeason = endKey.substring(0, 1);
        const endYear = parseInt(endKey.substring(1));
    
        // Determine the number of semesters between start and end
        const semesters = (endYear - startYear) * 2 + (endSeason === "S" ? 1 : 0) - (startSeason === "F" ? 1 : 0);
    
        // Generate the list of semester keys
        let currentYear = startYear;
        let currentSeason = startSeason;
        for (let i = 0; i < semesters; i++) {
            semesterKeys.push(currentSeason + currentYear.toString().padStart(4, "0"));
        
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

exports.removeCourse = (req, res) => {
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

const addCourseToSemester = (studentId, course, semester, fullPlan) => {
    let query = 'INSERT INTO StudentCoursePlan (studentId, courseId, semester) VALUES (?, ?, ?)';
    return new Promise((resolve, reject) => {
        const semesterDuplicates = Object.keys(fullPlan).filter((key) => fullPlan[key].filter((courseEntry) => courseEntry.id === course).length > 0);
        if (semesterDuplicates <= 0) {
            db.run(query, [studentId, course, semester], (err) => {
                if (err) {
                    console.log(err);
                    reject(err.message)
                } else {
                    console.log(`Inserted a row with the ID: ${this.lastID} - ${course} for ${semester}`)
                    resolve(true)
                }
            })
        } else {
            reject(`${course} is already planned for ${semesterDuplicates.join(",")}!`)
        }
    })
}

const getFullPlanFromDB = (userId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM StudentCoursePlan WHERE studentId = ?';
        db.all(query, [userId], async (err, dataEntries) => {
            if (dataEntries) {
                const startEndDates = await getStartEndKeys(userId);
                if (startEndDates && startEndDates.length === 2) {
                    resolve(createFullPlan(dataEntries, startEndDates));
                } else {
                    reject("Failed to get start and end dates")
                }
            } else if (err) {
                reject(err.message);
            } else {
                reject("User not found.");
            }
        });
    })
}

exports.addCourses = (req, res) => {
    const [courseIdList, semesterKey] = Object.values(req.body);
    const userId = req.userId;
    getFullPlanFromDB(userId).then((formerPlan) => {
        const promises = courseIdList.map((courseId) => addCourseToSemester(userId, courseId, semesterKey, formerPlan))
        Promise.all(promises).then(() => {
            getFullPlanFromDB(userId).then((newPlan) => {
                res.status(200).json({fullPlan: newPlan, message: `Successfully added courses ${courseIdList.join(", ")} to ${semesterKey}!`})
            }).catch((err) => res.status(500).json({fullPlan: formerPlan, message: err}))
        }).catch((err) => res.status(500).json({fullPlan: formerPlan, message: err}))
    }).catch((err) => res.status(500).json({fullPlan: formerPlan, message: err}))   
}

const getCourses = async () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT Courses.ID, Courses.title, Courses.description, 
        Courses.creditAmount, Courses.yearOffered, Courses.semesterOffered, Prereqs.prereqId as prereq, CourseCores.coreId as core FROM Courses 
        LEFT OUTER JOIN CoursePrerequisites AS Prereqs ON Prereqs.courseId == Courses.ID 
        LEFT OUTER JOIN CourseCoreRequirements AS CourseCores ON CourseCores.courseID == Courses.ID`, 
        (error, rows) => {
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
    return courseDict
}

const getStartEndKeys = async (userId) => {
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM Students WHERE ID = ?`
        db.all(query, userId, (error, result) => {
            if (error) {
                reject(error.message)
            } else if (result && result.length > 0) {
                const row = result[0];
                if (row && row.startDate && row.gradDate ) {
                    resolve([row.startDate, row.gradDate])
                } else {
                    reject([]);
                }
            } else {
                reject([]);
            }
        })
    })
}

exports.fetchAllCourses = fetchAllCourses;

exports.fetchPlan = async (req, res) => {
    const userId = req.userId;
    COURSE_DATA = await fetchAllCourses();
    if (COURSE_DATA) {
        const data = await testAsync(userId)
        const startEndDates = await getStartEndKeys(userId);
        if (data && startEndDates && startEndDates.length === 2) {
            res.status(200).json({fullPlan: createFullPlan(data, startEndDates), courseCatalog: Object.values(COURSE_DATA)})
        } else {
            res.status(500).json({message: "Failed to initialize course data."})
        }
    } else {
        res.status(500).json({message: "Failed to initialize course data."})
    }
}



const testAsync = async (userId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM StudentCoursePlan WHERE studentId = ?';
        db.all(query, [userId], (err, dataEntries) => {
            if (err) {
                reject(err.message);
            } else {
                resolve(dataEntries)
            }
        });
    })
}