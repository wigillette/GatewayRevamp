import { useState } from 'react';

// Adapted from https://www.digitalocean.com/community/tutorials/how-to-add-login-authentication-to-react-applications
export default function useToken() {
  const getToken = () => {
    const userString = localStorage.getItem('user');
    const userParsed = JSON.parse(userString);
    return userParsed?.token
  };

  const [token, setToken] = useState(getToken());

  const saveToken = (userInfo) => {
    localStorage.setItem('user', JSON.stringify(userInfo));
    setToken(userInfo.token);
  };

  return {
    setToken: saveToken,
    token
  }
}

export const isAuthenticated = () => localStorage.getItem('user') !== null;

export const logout = () => {
  localStorage.removeItem('user');
}