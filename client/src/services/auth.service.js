import axios from "axios";

const API_URL = "http://localhost:8080/api/auth/";

class AuthService {
    login(username, password) {
        return axios
            .post(API_URL + "signin", { username, password })
            .then((response) => {
                if (response.data.accessToken) {
                    localStorage.setItem("user", JSON.stringify(response.data));
                }

                return response.data;
            });
    }

    logout() {
        localStorage.removeItem("user");
    }

    registerPatient(roleId, username, email, password, firstName, lastName, contactNum, dob, gender, nationality, race, bcAddress, nric, homeAddress, emergencyContact) {
        return axios.post(API_URL + "signup", {
            roleId,
            username,
            email,
            password,
            firstName,
            lastName,
            contactNum,
            dob,
            gender,
            nationality,
            race,
            bcAddress,
            nric,
            homeAddress,
            emergencyContact
        });
    }

    registerDoctor(roleId, username, email, password, firstName, lastName, contactNum, dob, gender, nationality, race, bcAddress, specialty, healthcareInstitution) {
        return axios.post(API_URL + "signup", {
            roleId,
            username,
            email,
            password,
            firstName,
            lastName,
            contactNum,
            dob,
            gender,
            nationality,
            race,
            bcAddress,
            specialty,
            healthcareInstitution
        });
    }
}

export default new AuthService();