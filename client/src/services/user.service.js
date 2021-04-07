import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8080/api/test/";

class UserService {
    getPatientBoard = () => {
    return axios.get(API_URL + "patient", { headers: authHeader() });
    };

    getAdminBoard = () => {
    return axios.get(API_URL + "admin", { headers: authHeader() });
    };

    getDoctorBoard = () => {
        return axios.get(API_URL + "doctor", { headers: authHeader() });
    };

    getPatientByNric(nric) {
        return axios.post(API_URL + "patientByNric", { nric });
    };

    getPatientById(id) {
        return axios.post(API_URL + "patientById", { id });
    };

    getDoctorById(id) {
        return axios.post(API_URL + "doctorById", { id });
    };
}
export default new UserService();
