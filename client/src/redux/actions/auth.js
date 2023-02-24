import { LOGIN_SUCCESS, LOGIN_FAIL, REGISTER_SUCCESS, REGISTER_FAIL, LOGOUT } from "./types";
import {register, login, logout} from "../../services/auth-service";

export const registerAction = (email, password, fName, lName, gradDate, major, headshot) => (dispatch) => {
    return register(email, password, fName, lName, gradDate, major, headshot).then(
    (userInfo) => {
        console.log(JSON.stringify(userInfo));
        dispatch({ type: REGISTER_SUCCESS });
        localStorage.setItem('user', JSON.stringify(userInfo));
    }, 
    (error) => {
        console.log(error);
        dispatch({ type: REGISTER_FAIL });
    });    
}

export const loginAction = async (email, password) => async (dispatch) => {
    return login(email, password).then(
    (userInfo) => {
        console.log(userInfo);
        dispatch({ type: LOGIN_SUCCESS });
        localStorage.setItem('user', JSON.stringify(userInfo));
    }, 
    (error) => {
        console.log(error);
        dispatch({ type: LOGIN_FAIL });
    });    
}

export const logoutAction = () => (dispatch) => {
    logout();
    dispatch({ type: LOGOUT });
}