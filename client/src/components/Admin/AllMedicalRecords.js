import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import UserService from "../../services/user.service";
import Table from "react-bootstrap/Table";

// solidity
import getWeb3 from "../../getWeb3";
import Users from "../../contracts/Users.json";
import MedicalRecords from "../../contracts/MedicalRecords.json";

class AllMedicalRecords extends Component {
  constructor(props) {
    super(props);
    this.retrieveUserData = this.retrieveUserData.bind(this);
    this.getMedRecords = this.getMedRecords.bind(this);

    this.state = {
      content: "",
      web3: null,
      accounts: null,
      userContract: null,
      medicalRecordContract: null,
      medicalRecords: null,
      flagged: [],
      loading: false,
    };
  }

  componentDidMount = async () => {
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }
    try {
      const web3 = await getWeb3();
      console.log("********** web3: ", web3);

      const accounts = await web3.eth.getAccounts();
      console.log("********** Accounts", accounts);

      const networkId = await web3.eth.net.getId();
      console.log("********** Network ID: ", networkId);

      const deployedNetwork = Users.networks[networkId];
      console.log("********** DeployedNetwork: ", deployedNetwork);

      const instance = new web3.eth.Contract(
        Users.abi,
        deployedNetwork && deployedNetwork.address
      );
      this.setState({
        web3,
        accounts,
        contract: instance,
      });

      const medicalRecordDeployedNetwork = MedicalRecords.networks[networkId];
      console.log("********** medicalRecordDeployedNetwork: ", deployedNetwork);

      const medInstance = new web3.eth.Contract(
        MedicalRecords.abi,
        medicalRecordDeployedNetwork && medicalRecordDeployedNetwork.address
      );
      this.setState({
        medicalRecordContract: medInstance,
      });
      console.log("********* medInstance", medInstance);
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
    this.getMedRecords();
  };

  retrieveUserData = async (patientId, doctorId) => {
    var patient;
    var doctor;

    await UserService.getPatientById(patientId).then(
      (response) => {
        patient = response.data;
      },
      (error) => {
        console.log(
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
            error.message ||
            error.toString()
        );
      }
    );
    await UserService.getDoctorById(doctorId).then(
      (response) => {
        doctor = response.data;
      },
      (error) => {
        console.log(
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
            error.message ||
            error.toString()
        );
      }
    );
    return { patientData: patient, doctorData: doctor };
  };

  getMedRecords = async () => {
    const { web3, accounts, medicalRecordContract } = this.state;
    var medRec = [];
    const med = await medicalRecordContract.methods
      .getNumMedicalRecords()
      .call();
    console.log(med);

    // find all medical records
    for (let i = 0; i < med; i++) {
      const response = await medicalRecordContract.methods
        .viewRecordAdmin(i)
        .call();
      console.log(response);

      const { patientData, doctorData } = await this.retrieveUserData(
        response[0],
        response[2]
      );
      var record = {
        recordId: i,
        patient: response[0],
        details: web3.utils.hexToAscii(response[1]),
        doctorInCharge: response[2],
        patientVerified: response[3],
        doctorVerified: response[4],
        patientData: patientData,
        doctorData: doctorData,
      };
      await medRec.push(record);
    }
    this.setState({ medicalRecords: medRec, loading: true });

    // get flagged medical records
    const flagged = this.state.medicalRecords.filter((rec) => {
      return rec.patientVerified === "2" || rec.doctorVerified === "2";
    });
    this.setState({ flagged: flagged });
    console.log(this.state.flagged);
  };

  handleWaive = async (medRecId) => {
    const { accounts, medicalRecordContract } = this.state;
    const waive = await medicalRecordContract.methods
      .waive(medRecId)
      .send({ from: accounts[0] });
    console.log(waive);
  };
  render() {
    const { medicalRecords, flagged, loading } = this.state;

    return (
      <Fragment>
        <header className="jumbotron">
          <h1> All Medical Records </h1>
        </header>
        <h2>All Medical Records</h2>

        {loading && medicalRecords.length !== 0 && (
          <Table hover responsive>
            {/* <table className="table table-hover table-responsive"> */}
            <thead>
              <tr>
                <th>ID</th>
                <th>Detail</th>
                <th>Patient</th>
                <th>Doctor-in-Charge</th>
                <th>Specialty</th>
                <th>Healthcare Institution</th>
              </tr>
            </thead>
            <tbody>
              {medicalRecords.map((rec) => (
                <tr key={rec.recordId}>
                  <th>{rec.recordId}</th>
                  <th>{rec.details}</th>
                  <th>
                    {rec.patientData.first_name +
                      " " +
                      rec.patientData.last_name}
                  </th>
                  <th>
                    {rec.doctorData.first_name + " " + rec.doctorData.last_name}
                  </th>
                  <th>{rec.doctorData.specialty}</th>
                  <th>{rec.doctorData.healthcare_institution}</th>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {/* {loading && medicalRecords.length === 0 && <h5>No medical records</h5>} */}

        <h2>Flagged Medical Records</h2>
        {flagged.length !== 0 && (
          <Table hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Detail</th>
                <th>Patient</th>
                <th>Doctor-in-Charge</th>
                <th>Flagged by Patient</th>
                <th>Flagged by Doctor</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {flagged.map((flag) => (
                <tr key={flag.recordId}>
                  <th> {flag.recordId}</th>
                  <th>{flag.details}</th>
                  <th>
                    {flag.patientData.first_name +
                      " " +
                      flag.patientData.last_name}
                  </th>
                  <th>
                    {flag.doctorData.first_name +
                      " " +
                      flag.doctorData.last_name}
                  </th>
                  <th>{flag.patientVerified === "2" ? "✓" : "✗"}</th>
                  <th>{flag.doctorVerified === "2" ? "✓" : "✗"}</th>
                  <th>
                    <button
                      className="btn btn-warning btn-block"
                      onClick={() => this.handleWaive(flag.recordId)}
                    >
                      Waive
                    </button>
                  </th>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Fragment>
    );
  }
}

function mapStateToProps(state) {
  const { user } = state.auth;
  return {
    user,
  };
}

export default connect(mapStateToProps)(AllMedicalRecords);
