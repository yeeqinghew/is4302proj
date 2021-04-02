export default function authHeader() {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.accessToken) {
        // for Node.js Express back-end
        // console.log("xxxxxxxxxxx", { 'x-access-token': user.accessToken });
        return { Authorization: user.accessToken };
    } else {
        return {};
    }
}