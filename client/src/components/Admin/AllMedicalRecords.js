import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import UserService from "../../services/user.service";
import Table from "react-bootstrap/Table";
import Modal from "react-modal";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";

// solidity
import getWeb3 from "../../getWeb3";
import Users from "../../contracts/Users.json";
import MedicalRecords from "../../contracts/MedicalRecords.json";

const customModalStyle = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    width                 : '30%',
    height                : '30%',
    transform             : 'translate(-50%, -50%)'
  }
};

const required = (value) => {
  if (!value) {
    return (
      <div className="alert alert-danger" role="alert">
        Penalty score is required!
      </div>
    );
  }
};

class AllMedicalRecords extends Component {
  constructor(props) {
    super(props);
    this.retrieveUserData = this.retrieveUserData.bind(this);
    this.getMedRecords = this.getMedRecords.bind(this);
    this.onChangeScore = this.onChangeScore.bind(this);

    this.state = {
      content: "",
      web3: null,
      accounts: null,
      userContract: null,
      medicalRecordContract: null,
      medicalRecords: null,
      flagged: [],
      loading: false,
      selectedId: null,
      score: null,
      showModal: false
    };
  }

  onChangeScore(e) {
    this.setState({
      score: e.target.value,
    });
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

    Modal.setAppElement("body");
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

      const isFlagged = await medicalRecordContract.methods
        .checkIsFlaggedRecord(i)
        .call();

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
        isFlagged: isFlagged
      };
      await medRec.push(record);
    }
    this.setState({ medicalRecords: medRec, loading: true });

    // get flagged medical records
    const flagged = this.state.medicalRecords.filter((rec, i) => {
      // console.log("isFlagged " + i + ": " + rec.isFlagged);
      return (rec.patientVerified === "2" || rec.doctorVerified === "2") && rec.isFlagged === true;
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

  punishModal = (medRecId) => {
    console.log("punishModal", medRecId);
    this.setState({ showModal: true, selectedId: medRecId, score: null  });
  };

  closeModal = () => {
    this.setState({ showModal: false });
  };

  handlePunish = async (e) => {
    e.preventDefault();
    this.setState({ successful: false });
    this.form.validateAll();

    if (this.checkBtn.context._errors.length === 0) {
      console.log("punishedId:", this.state.selectedId);
      const { accounts, medicalRecordContract } = this.state;
      const punish = await medicalRecordContract.methods
        .punish(this.state.selectedId, this.state.score)
        .send({ from: accounts[0] });

      window.location.reload();
      console.log("punish", punish);
    }
    
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
                  <th>
                    <button
                      className="btn btn-danger btn-block"
                      onClick={() => this.punishModal(flag.recordId)}
                    >
                      Punish
                    </button>
                  </th>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <Modal
          isOpen={this.state.showModal}
          onRequestClose={this.closeModal}
          style={customModalStyle}
          contentLabel="Punish Doctor Modal"
        >
          <h3>Do you want to punish?</h3>
          <br/>
          <Form
            onSubmit={this.handlePunish}
            ref={(c) => {
              this.form = c;
            }}
          >
            <div>
              <label htmlFor="score">Penalty Score</label>
              <Input
                type="number"
                className="form-control"
                name="score"
                min='1'
                value={this.state.score}
                onChange={this.onChangeScore}
                validations={[required]}
              />
            </div>
            <button
              className="btn btn-secondary"
              style={{position: 'absolute', bottom: 35, left: '15%'}}
              onClick={() => this.closeModal()}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{position: 'absolute', bottom: 35, right: '15%'}}
              type="submit"
            >
              Confirm
            </button>
            <CheckButton
              style={{ display: "none" }}
              ref={(c) => {
                this.checkBtn = c;
              }}
            />
          </Form>
        </Modal>
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
