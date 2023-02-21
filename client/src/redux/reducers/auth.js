import { REGISTER_FAIL, REGISTER_SUCCESS, LOGIN_FAIL, LOGIN_SUCCESS, LOGOUT } from "../actions/types";
const user = JSON.parse(localStorage.getItem('user')) // Accessing user info stored in localStorage

// Set our initial state based on whether the user is already logged in
const initial = user ? { authenticated: true, user } : { authenticated: false, user: null };

const authReducer = (state = initial, action) => {
    // Action has a type (to dictate how to update the state) 
    // and a payload (information passed when it is dispatched)
    let oldState = state; // Note that we are not mutating the old state
    switch(action.type) {
        case REGISTER_SUCCESS:
            oldState = {...state, authenticated: false};
            break;
        case REGISTER_FAIL:
            oldState = {...state, authenticated: false};
            break;
        case LOGIN_SUCCESS:
            oldState = {...state, authenticated: true, user: action.payload.user};
            break;
        case LOGIN_FAIL:
            oldState = {...state, authenticated: false, user: null};
            break;
        case LOGOUT:
            oldState = {...state, authenticated: false, user: null};
            break;
        default:
            oldState = state;
    }
    return oldState;
}

export default authReducer;