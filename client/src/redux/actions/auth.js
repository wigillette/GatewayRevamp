import { LOGIN_SUCCESS, LOGIN_FAIL, REGISTER_SUCCESS, REGISTER_FAIL, LOGOUT } from "./types";
import {register, login, logout} from "../../services/auth-service";

export const registerAction = (email, password, fName, lName, startDate, gradDate, major, headshot) => async (dispatch) => {
    return register(email, password, fName, lName, startDate, gradDate, major, headshot).then(
    (res) => res.json().then((data) => {
        if (data && data.message) {
            if (data.valid) {
                dispatch({ type: REGISTER_SUCCESS, payload: { message: data.message } });
            } else {
                dispatch({ type: REGISTER_FAIL, payload: { message: data.message } });
            }
        }
        return data?.message;
    }, 
    (error) => {
        console.log(error);
        dispatch({ type: REGISTER_FAIL });
    }));    
}

export const loginAction = (email, password) => async (dispatch) => {
    return login(email, password).then(
    (res) => res.json().then((data) =>  {
        if (data && data.accessToken) {
            dispatch({ type: LOGIN_SUCCESS, payload: { user: data } });
            localStorage.setItem('user', JSON.stringify(data));
        } else {
            dispatch({ type: LOGIN_FAIL, payload: {message: data.message} });
        }
        return data?.message;
    }, 
    (error) => {
        console.log(error);
        dispatch({ type: LOGIN_FAIL, payload: {message: error.message} });
    }));    
}

export const logoutAction = () => (dispatch) => {
    logout();
    dispatch({ type: LOGOUT });
}