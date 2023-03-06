import { REMOVE_SUCCESS, REMOVE_FAIL, ADD_SUCCESS, ADD_FAIL, FETCH_PLAN } from "../actions/types";

// Full plan represents a dictionary of all semester plans with the format "semesterKey: courseInfo[]"
const initial = {fullPlan: {}, addMessage: ""};
const planReducer = (state = initial, action) => {
    switch(action.type) {
        case REMOVE_SUCCESS:
            return {...state, fullPlan: action.payload.fullPlan, message: action.payload.message};
        case REMOVE_FAIL:
            return {...state, message: action.payload.message};
        case ADD_SUCCESS:
            return {...state, fullPlan: action.payload.fullPlan, message: action.payload.message};
        case ADD_FAIL:
            return {...state, message: action.payload.message};
        case FETCH_PLAN:
            return {...state, fullPlan: action.payload.fullPlan}
        default:
            return state;
    }
}

export default planReducer;