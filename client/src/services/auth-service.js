// Adapted from: https://github.com/bezkoder/react-redux-jwt-auth/blob/master/src/services/auth.service.js
export const login = (email, password) => fetch("http://localhost:3001/login", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
  .then((res) => {
    const userInfo = res.json();
    if (userInfo.accessToken) {
        alert(userInfo.accessToken);
        localStorage.setItem('user', JSON.stringify(userInfo));
    }
    // Update the redux store state for LOGIN_SUCCESS, which will render the view

    return userInfo;
  }).catch((err) => {
    alert("LOGIN FAILED");
    // Update the redux store state for LOGIN_FAIL
  })

// Possibly add a similar structure as Login for Register?
export const register = (email, password, fName, lName, gradDate, major, headshot) => fetch("http://localhost:3001/register", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, fName, lName, gradDate, major, headshot })
})

export const logout = () => localStorage.removeItem('user');

export const isAuthenticated = () => localStorage.getItem('user') !== null;