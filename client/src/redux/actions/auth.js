import { LOGIN_SUCCESS, LOGIN_FAIL, REGISTER_SUCCESS, REGISTER_FAIL, LOGOUT } from "./types";
import authService from "../../services/auth-service";

export const register = (registerInfo) => (dispatch) => {
    return authService.register(registerInfo).then(
    (res) => {
        dispatch({type: REGISTER_SUCCESS});
        return Promise.resolve();
    }, 
    (error) => {
        dispatch({type: REGISTER_FAIL});
        return Promise.reject();
    })   
}
