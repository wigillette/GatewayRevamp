import { addCourses, removeCourse } from "../../services/plan-service";
import { REMOVE_SUCCESS, REMOVE_FAIL, ADD_SUCCESS, ADD_FAIL } from "./types";

export const removeCourseAction = (courseId, semesterKey) => async (dispatch) => {
    return removeCourse(courseId, semesterKey).then(
        (res) => res.json().then((fullPlan, message) => dispatch({ type: REMOVE_SUCCESS, payload: { fullPlan: fullPlan, message: message } }), 
        (error) => dispatch({ type: REMOVE_FAIL, payload: { message: "Remove Failed" } }))
    );    
}

export const addCoursesAction = (courseIdList, semesterKey) => async (dispatch) => {
    return addCourses(courseIdList, semesterKey).then(
        (res) => res.json().then((fullPlan, message) => dispatch({ type: ADD_SUCCESS, payload: { fullPlan: fullPlan, message: message } }), 
        (error) => dispatch({ type: ADD_FAIL, payload: { message: "Add Failed" } }))
    );    
}