import authHeader from "./auth-header";

export const removeCourse = (courseId, semesterKey) => {
    return fetch("http://localhost:3001/removeCourse", {
        method: 'POST',
        headers: Object.assign({}, {
        'Content-Type': 'application/json'
        }, authHeader()),
        body: JSON.stringify({ courseId, semesterKey })
    })
} 

export const addCourses = (courseIdList, semesterKey) => { 
    return fetch("http://localhost:3001/addCourses", {
        method: 'POST',
        headers: Object.assign({}, {
        'Content-Type': 'application/json'
        }, authHeader()),
        body: JSON.stringify({ courseIdList, semesterKey })
    })
}

export const fetchPlan = () => {
    return fetch("http://localhost:3001/fetchPlan", {
        method: 'GET',
        headers: Object.assign({}, {
        'Content-Type': 'application/json'
        }, authHeader()),
    })
}
  