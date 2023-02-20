// Adapted from: https://github.com/bezkoder/react-redux-jwt-auth/blob/master/src/services/auth.service.js
export const login = async (email, password) => {
  const userString = await fetch("http://localhost:3001/login", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const userInfo = await userString.json();
  if (userInfo && userInfo.accessToken) {
    // Dispatch LOGIN_SUCCESS
    alert(userInfo.accessToken);
    localStorage.setItem('user', JSON.stringify(userInfo));
  } else {
    // Dispatch LOGIN_FAIL
  }
  return userInfo;
} 
 
// Possibly add a similar structure as Login for Register?
export const register = async (email, password, fName, lName, gradDate, major, headshot) => {
  const userString = await fetch("http://localhost:3001/register", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, fName, lName, gradDate, major, headshot })
  })
  const userInfo = await userString.json();
  if (userInfo && userInfo.accessToken) {
    // Dispatch REGISTER_SUCCESS
    localStorage.setItem('user', JSON.stringify(userInfo));
  } else {
    // Dispatch REGISTER_FAIL
  }
  return userInfo;
}

export const logout = () => localStorage.removeItem('user');

export const isAuthenticated = () => localStorage.getItem('user') !== null;