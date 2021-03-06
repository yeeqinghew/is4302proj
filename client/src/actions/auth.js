import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  SET_MESSAGE,
} from "./types";

import AuthService from "../services/auth.service";

export const registerAdmin = (
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
  bcAddress
) => (dispatch) => {
  console.log("Ininiinin");
  return AuthService.registerAdmin(
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
    bcAddress
  ).then(
    (response) => {
      dispatch({
        type: REGISTER_SUCCESS,
      });

      dispatch({
        type: SET_MESSAGE,
        payload: response.data.message,
      });

      return Promise.resolve();
    },
    (error) => {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      dispatch({
        type: REGISTER_FAIL,
      });

      dispatch({
        type: SET_MESSAGE,
        payload: message,
      });

      return Promise.reject();
    }
  );
};

export const registerPatient = (
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
) => (dispatch) => {
  return AuthService.registerPatient(
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
  ).then(
    (response) => {
      dispatch({
        type: REGISTER_SUCCESS,
      });

      dispatch({
        type: SET_MESSAGE,
        payload: response.data.message,
      });

      return Promise.resolve();
    },
    (error) => {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      dispatch({
        type: REGISTER_FAIL,
      });

      dispatch({
        type: SET_MESSAGE,
        payload: message,
      });

      return Promise.reject();
    }
  );
};

export const registerDoctor = (
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
) => (dispatch) => {
  return AuthService.registerDoctor(
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
  ).then(
    (response) => {
      dispatch({
        type: REGISTER_SUCCESS,
      });

      dispatch({
        type: SET_MESSAGE,
        payload: response.data.message,
      });

      return Promise.resolve();
    },
    (error) => {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      dispatch({
        type: REGISTER_FAIL,
      });

      dispatch({
        type: SET_MESSAGE,
        payload: message,
      });

      return Promise.reject();
    }
  );
};

export const login = (username, password) => (dispatch) => {
  return AuthService.login(username, password).then(
    (data) => {
      dispatch({
        type: LOGIN_SUCCESS,
        payload: { user: data },
      });

      return Promise.resolve();
    },
    (error) => {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      dispatch({
        type: LOGIN_FAIL,
      });

      dispatch({
        type: SET_MESSAGE,
        payload: message,
      });

      return Promise.reject();
    }
  );
};

export const logout = () => (dispatch) => {
  AuthService.logout();

  dispatch({
    type: LOGOUT,
  });
};
