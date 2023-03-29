import authHeader from "./auth-header";

export const assignCore = (courseId, coreId) => { 
    return fetch("http://localhost:3001/assignCore", {
        method: 'POST',
        headers: Object.assign({}, {
        'Content-Type': 'application/json'
        }, authHeader()),
        body: JSON.stringify({ courseId, coreId })
    })
}

export const fetchAssignments = () => {
    return fetch("http://localhost:3001/fetchAssignments", {
        method: 'GET',
        headers: Object.assign({}, {
        'Content-Type': 'application/json'
        }, authHeader()),
    })
}
  