import { LOGIN_SUCCESS, LOGIN_FAIL, REGISTER_SUCCESS, REGISTER_FAIL, LOGOUT } from "./types";
import {register, login, logout} from "../../services/auth-service";

export const registerAction = async (email, password, fName, lName, gradDate, major, headshot) => async (dispatch) => {
    return register(email, password, fName, lName, gradDate, major, headshot).then((userInfo) => {
        alert(userInfo);
        dispatch({ type: REGISTER_SUCCESS });
    }).catch((err) => {
        dispatch({ type: REGISTER_FAIL });
    })    
}

export const loginAction = async (email, password) => async (dispatch) => {
    const userInfo = await login(email, password);
    if (userInfo) {
        dispatch({ type: LOGIN_SUCCESS, payload: { user: userInfo }})
    } else {
        dispatch({ type: LOGIN_FAIL })
    }
    return userInfo;
}

export const logoutAction = () => (dispatch) => {
    logout();
    dispatch({ type: LOGOUT });
}