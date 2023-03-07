import { addCourses, removeCourse, fetchPlan } from "../../services/plan-service";
import { logoutAction } from "./auth";
import { REMOVE_SUCCESS, REMOVE_FAIL, ADD_SUCCESS, ADD_FAIL, FETCH_PLAN } from "./types";

export const removeCourseAction = (courseId, semesterKey) => async (dispatch) => {
    return removeCourse(courseId, semesterKey).then(
        (res) => res.json().then((data) => dispatch({ type: REMOVE_SUCCESS, payload: { fullPlan: data.fullPlan, message: data.message } }), 
        (error) => dispatch({ type: REMOVE_FAIL, payload: { message: "Remove Failed" } }))
    );    
}

export const addCoursesAction = (courseIdList, semesterKey) => async (dispatch) => {
    return addCourses(courseIdList, semesterKey).then(
        (res) => res.json().then((data) => dispatch({ type: ADD_SUCCESS, payload: { fullPlan: data.fullPlan, message: data.message } }), 
        (error) => dispatch({ type: ADD_FAIL, payload: { message: "Add Failed" } }))
    );    
}

export const fetchPlanAction = () => async (dispatch) => {
    return fetchPlan().then(
        (res) => res.json().then((data) => dispatch({ type: FETCH_PLAN, payload: { fullPlan: data.fullPlan, courseCatalog: data.courseCatalog } }), 
        (error) => dispatch(logoutAction())) // Added this for token expired errors
    );
}