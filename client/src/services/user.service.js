import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8080/api/test/";

// const getPublicContent = () => {
//     return axios.get(API_URL + "all");
// };

const getPatientBoard = () => {
    return axios.get(API_URL + "patient", { headers: authHeader() });
};

const getAdminBoard = () => {
    return axios.get(API_URL + "admin", { headers: authHeader() });
};

const getHealthcareProviderBoard = () => {
    return axios.get(API_URL + "healthcareProvider", { headers: authHeader() });
};

const getFinancialInstitution = () => {
    return axios.get(API_URL + "financialInstitution", { headers: authHeader() });
};

const getDoctorBoard = () => {
    return axios.get(API_URL + "doctor", { headers: authHeader() });
};

const getNurseBoard = () => {
    return axios.get(API_URL + "nurse", { headers: authHeader() });
};

const getHealthcareAnalystBoard = () => {
    return axios.get(API_URL + "healthcareAnalyst", { headers: authHeader() });
};



export default {
    getPatientBoard,
    getAdminBoard,
    getHealthcareProviderBoard,
    getFinancialInstitution,
    getDoctorBoard,
    getNurseBoard,
    getHealthcareAnalystBoard
};