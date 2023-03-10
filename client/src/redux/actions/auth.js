import { LOGIN_SUCCESS, LOGIN_FAIL, REGISTER_SUCCESS, REGISTER_FAIL, LOGOUT } from "./types";
import {register, login, logout} from "../../services/auth-service";

export const registerAction = (email, password, fName, lName, gradDate, major, headshot) => async (dispatch) => {
    return register(email, password, fName, lName, gradDate, major, headshot).then(
    (res) => res.json().then((userInfo) => {
        if (userInfo && userInfo.accessToken) {
            dispatch({ type: REGISTER_SUCCESS, payload: { user: userInfo } });
            localStorage.setItem('user', JSON.stringify(userInfo));
        }
    }, 
    (error) => {
        console.log(error);
        dispatch({ type: REGISTER_FAIL });
    }));    
}

export const loginAction = (email, password) => async (dispatch) => {
    return login(email, password).then(
    (res) => res.json().then((userInfo) =>  {
        if (userInfo && userInfo.accessToken) {
            dispatch({ type: LOGIN_SUCCESS, payload: { user: userInfo } });
            localStorage.setItem('user', JSON.stringify(userInfo));
        }
    }, 
    (error) => {
        console.log(error);
        dispatch({ type: LOGIN_FAIL });
    }));    
}

export const logoutAction = () => (dispatch) => {
    logout();
    dispatch({ type: LOGOUT });
}