import React, { Component, Fragment } from "react";
import Table from "react-bootstrap/Table";

import { connect } from "react-redux";
import UserService from "../../services/user.service";

// solidity
import MedicalRecords from "../../contracts/MedicalRecords.json";
import getWeb3 from "../../getWeb3";

class RandomRecords extends Component {
  constructor(props) {
    super(props);
    this.getRandomInt = this.getRandomInt.bind(this);
    this.retrievePatientData = this.retrievePatientData.bind(this);
    this.retrieveRandomRecords = this.retrieveRandomRecords.bind(this);
    this.viewRecord = this.viewRecord.bind(this);

    this.state = {
      web3: null,
      accounts: null,
      medicalRecordContract: null,
      successful: false,
      message: "",
      medicalRecords: null,
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

      const deployedNetwork = MedicalRecords.networks[networkId];
      console.log("********** DeployedNetwork: ", deployedNetwork);

      const instance = new web3.eth.Contract(
        MedicalRecords.abi,
        deployedNetwork && deployedNetwork.address
      );

      this.setState({ web3, accounts, medicalRecordContract: instance });
      console.log("********** Instance:", instance);
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
    this.retrieveRandomRecords();
  };

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  retrievePatientData = async(patientId) => {
    var patient;

    await UserService.getPatientById(patientId).then(
        response => {
            patient = response.data;
        },
        error => {
            console.log(
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString())
        }
    );
    return { patientData: patient};
}

retrieveRandomRecords = async () => {
    const { web3, accounts, medicalRecordContract} = this.state;

    const numRecords = await medicalRecordContract.methods.getNumMedicalRecords().call();
    console.log("numRecords:", numRecords);

    var min = 0;
    var max = numRecords;
    var medicalRecords = [];
    while (min < max) {
        min = this.getRandomInt(min, max) + 1;
        console.log("min", min);

        if (min < max) {
            const response = await medicalRecordContract.methods.viewRecord(min).call({from: accounts[0]});
            if (response[3] === '0') { // unflagged
                const { patientData } = await this.retrievePatientData(response[0]);
                console.log("patientData", patientData);
                
                var record = {
                    recordId: min,
                    patient: response[0], 
                    details: web3.utils.hexToAscii(response[1]),
                    patientVerified: response[2], 
                    doctorVerified: response[3],
                    patientData: patientData
                };
                medicalRecords.push(record);
                // console.log("record:", record);
            }
        }
        
    }
    console.log("***** Medical Records:", medicalRecords);
    this.setState({
        medicalRecords: medicalRecords,
        loading: true
    });
}

viewRecord(recordId) {
    localStorage.setItem('recordId', recordId);

    let path = "/verifyRecord";
    this.props.history.push(path);
}

render() {
    const { medicalRecords, loading } = this.state;
    return (
        <Fragment>
            <header className="jumbotron">
            <h1> Medical Records </h1>
            </header>
            {loading && medicalRecords.length !== 0 && (
                <Table hover responsive striped>
                {/* <table className="table table-hover table-responsive" style={{width: '100%', margin: '0px'}}> */}
                    <thead>
                        <tr>
                        <th>Record ID</th>
                        <th>Patient</th>
                        <th>Details</th>
                        <th>Patient Verified</th>
                        </tr>
                    </thead>
                    <tbody>
                        {medicalRecords.map((record) => (
                            <tr
                                key = {record.recordId}
                                onClick = {(e) => {
                                    console.log("recordId: ", record.recordId);
                                    this.viewRecord(record.recordId);
                                }}
                            >
                            <th>{record.recordId}</th>
                            <th>{record.patientData.first_name + " " + record.patientData.last_name}</th>
                            <th>{(record.details.length > 15) ? record.details.substr(0, 14) + '...' : record.details}</th>
                            <th>{(() => {
                                    switch(record.patientVerified) {
                                        case '0': return "Not Flagged";
                                        case '1': return "Verified";
                                        case '2': return "Flagged"
                                    }
                                })()}  
                            </th>
                            </tr>
                        ))}
                    </tbody>
                    {/* </table> */}
                </Table>
            )}
            {loading && medicalRecords.length === 0 && (
                <h5>No records to verify</h5>
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

export default connect(mapStateToProps)(RandomRecords);
