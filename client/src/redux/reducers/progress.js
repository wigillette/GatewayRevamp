import { ASSIGN_FAIL, ASSIGN_SUCCESS, FETCH_ASSIGNMENTS } from "../actions/types";
import CORES from "../../shared/cores.json";
// Full plan represents a dictionary of all semester plans with the format "semesterKey: courseInfo[]"
const initial = {coreAssignments: CORES.reduce((assignments,coreId) => ({...assignments,[coreId]:null}), {}), planMappings: [], message: undefined};
const planReducer = (state = initial, action) => {
    switch(action.type) {
        case ASSIGN_SUCCESS:
            return {...state, coreAssignments: action.payload.coreAssignments, message: action.payload.message};
        case ASSIGN_FAIL:
            return {...state, message: action.payload.message};
        case FETCH_ASSIGNMENTS:
            return {...state, coreAssignments: action.payload.coreAssignments, planMappings: action.payload.planMappings}
        default:
            return state;
    }
}

export default planReducer;