export default function authHeader() {
    const user = JSON.parse(localStorage.getItem('user'));
    let toReturn = {};
    if (user && user.accessToken) {
        toReturn = {'x-access-token': user.accessToken}
    }
    return toReturn;
}