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

    getHealthcareProviderBoard = () => {
        return axios.get(API_URL + "healthcareProvider", { headers: authHeader() });
    };

    getFinancialInstitution = () => {
        return axios.get(API_URL + "financialInstitution", { headers: authHeader() });
    };

    getDoctorBoard = () => {
        return axios.get(API_URL + "doctor", { headers: authHeader() });
    };

    getNurseBoard = () => {
        return axios.get(API_URL + "nurse", { headers: authHeader() });
    };

    getHealthcareAnalystBoard = () => {
        return axios.get(API_URL + "healthcareAnalyst", { headers: authHeader() });
    };
}
export default new UserService();