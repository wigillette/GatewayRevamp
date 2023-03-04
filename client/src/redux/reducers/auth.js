import { LOGIN_SUCCESS, LOGIN_FAIL, REGISTER_SUCCESS, REGISTER_FAIL, LOGOUT } from "../actions/types";
const user = JSON.parse(localStorage.getItem('user')) // Accessing user info stored in localStorage

// Set our initial state based on whether the user is already logged in
const initial = (user && user !== {}) ? { authenticated: true, user } : { authenticated: false, user: null };
const authReducer = (state = initial, action) => {
    // Action has a type (to dictate how to update the state) 
    // and a payload (information passed when it is dispatched)
    switch(action.type) {
        case REGISTER_SUCCESS:
            return {...state, authenticated: true, user: action.payload.user};
        case REGISTER_FAIL:
            return {...state, authenticated: false, user: null};
        case LOGIN_SUCCESS:
            return {...state, authenticated: true, user: action.payload.user};
        case LOGIN_FAIL:
            return {...state, authenticated: false, user: null};
        case LOGOUT:
            return {...state, authenticated: false, user: null};
        default:
            return state;
    }
}

export default authReducer;