import { assignCore, fetchAssignments } from "../../services/progress-service";
import { logoutAction } from "./auth";
import { ASSIGN_SUCCESS, ASSIGN_FAIL, FETCH_ASSIGNMENTS } from "./types";


export const assignCoreAction = (courseId, coreId) => async (dispatch) => {
    return assignCore(courseId, coreId).then(
        (res) => res.json().then((data) => dispatch({ type: ASSIGN_SUCCESS, payload: { coreAssignments: data.coreAssignments, message: data.message } }), 
        (error) => dispatch({ type: ASSIGN_FAIL, payload: { message: `Failed to assign ${courseId} to ${coreId}.` } }))
    );    
}

export const fetchAssignmentsAction = () => async (dispatch) => {
    return fetchAssignments().then(
        (res) => res.json().then((data) => dispatch({ type: FETCH_ASSIGNMENTS, payload: { coreAssignments: data.coreAssignments, planMappings: data.planMappings, totalCredits: data.totalCredits } }), 
        (error) => dispatch(logoutAction())) // Added this for token expired errors
    );
}