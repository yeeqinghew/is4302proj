import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8080/api/test/";

class UserService {
    getPatientBoard = () => {
        return axios.get(API_URL + "patient", { headers: authHeader() });
    };

    getAdminBoard = () => {
        console.log("getting admin board otw");
        return axios.get(API_URL + "admin", { headers: authHeader() });
    };

    getDoctorBoard = () => {
        return axios.get(API_URL + "doctor", { headers: authHeader() });
    };
}
export default new UserService();