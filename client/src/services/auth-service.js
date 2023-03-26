import { redirect } from "react-router-dom";

// Adapted from: https://github.com/bezkoder/react-redux-jwt-auth/blob/master/src/services/auth.service.js
export const login = (email, password) => {
  return fetch("http://localhost:3001/login", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
} 
 
export const register = (email, password, fName, lName, gradDate, major, headshot) => {
  major = major || "Mathematics";
  gradDate = gradDate || "2024";
  return fetch("http://localhost:3001/register", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, fName, lName, gradDate, major, headshot })
  })
}

export const logout = () => {
  redirect("/home")
  localStorage.removeItem('user');
}