import React, { Component } from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { connect } from "react-redux";

import UserService from "../../services/user.service";

// solidity
import MedicalRecords from "../../contracts/MedicalRecords.json";
import Users from "../../contracts/Users.json";
import getWeb3 from "../../getWeb3";

class VerifyRecord extends Component {

    constructor(props) {
        super(props);
        this.retrievePatientData = this.retrievePatientData.bind(this);
        this.retrieveRecord = this.retrieveRecord.bind(this);
        this.verifyRecord = this.verifyRecord.bind(this);
        this.reportRecord = this.reportRecord.bind(this);

        this.state = {
            web3: null,
            accounts: null,
            medicalRecordContract: null,
            userContract: null,
            successful: false,
            message: "",
            loading: false,
            recordId: null,
            medicalRecord: null
        };
    }

    componentDidMount = async () => {
        if (!window.location.hash) {
            window.location = window.location + '#loaded';
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

            const userDeployedNetwork = Users.networks[networkId];
            console.log("********** userDeployedNetwork: ", userDeployedNetwork);

            const userInstance = new web3.eth.Contract(
                Users.abi,
                userDeployedNetwork && userDeployedNetwork.address
            );
            this.setState({ web3, accounts, medicalRecordContract: instance, userContract: userInstance });
            console.log("********** userInstance:", userInstance);
        } catch (error) {
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }

        this.setState({
            recordId: localStorage.getItem('recordId')
        });
        console.log("recordId", this.state.recordId);
        this.retrieveRecord();
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

    retrieveRecord = async() => {
        const { web3, accounts, medicalRecordContract, recordId } = this.state;

        const response = await medicalRecordContract.methods.viewRecord(recordId).call({from: accounts[0]});
        const { patientData } = await this.retrievePatientData(response[0]);
        
        var record = {
            recordId: 1,
            patient: response[0], 
            details: web3.utils.hexToAscii(response[1]),
            patientVerified: response[2], 
            doctorVerified: response[3],
            patientData: patientData
        };
        this.setState({
            medicalRecord: record,
            loading: true
        });
        console.log("record:", record);
    }

    verifyRecord = async() => {
        console.log("verifyRecord");

        const { accounts, medicalRecordContract, recordId } = this.state;

        await medicalRecordContract.methods.doctorVerify(recordId).send({ from: accounts[0] })
            .then((res) => {
                console.log("Response", res);
                const medicalRecordId = res.events.doctorVerified.returnValues[0];
                console.log("Medical Record Id:", medicalRecordId);
                
                this.setState({
                    successful: true,
                    message: "Record is verified successfully!"
                });

                setTimeout(() => {
                    this.props.history.push('/randomRecords');
                    localStorage.removeItem("recordId");
                }, 3500);

            }).catch((err) => {
                console.log("Failed with error: ", err);
                var str = JSON.stringify(err);
                
                var start = str.indexOf('reason');
                var end = str.indexOf('stack');
                var error = str.slice(start + 11, end - 7);
                console.log(error);
                
                this.setState({
                    message: "Record cannot be verified: " + error + "!"
                });
            }); 
        
        console.log("***** Verified Medical Record:", await medicalRecordContract.methods.viewRecord(recordId).call({from: accounts[0]}));
    }

    reportRecord = async() => {
        console.log("reportRecord");

        const { accounts, medicalRecordContract, recordId } = this.state;

        await medicalRecordContract.methods.doctorReport(recordId).send({ from: accounts[0] })
            .then((res) => {
                console.log("Response", res);
                const medicalRecordId = res.events.doctorReported.returnValues[0];
                console.log("Medical Record Id:", medicalRecordId);
                
                this.setState({
                    successful: true,
                    message: "Record is reported successfully!"
                });

                setTimeout(() => {
                    this.props.history.push('/randomRecords');
                    localStorage.setItem('recordId', null);
                }, 3500);

            }).catch((err) => {
                console.log("Failed with error: ", err);
                var str = JSON.stringify(err);
                
                var error;

                if (err.code === -32603) {
                    var start = str.indexOf('reason');
                    var end = str.indexOf('stack');
                    error = "Record cannot be reported: " + str.slice(start + 11, end - 7) + "!";
                    console.log(error);
                } else {
                    error = "Record cannot be reported!"
                }
                
                this.setState({
                    message: error
                });
            }); 

        console.log("***** Reported Medical Record:", await medicalRecordContract.methods.viewRecord(recordId).call({from: accounts[0]}));
    }

    render() {
        const { loading, medicalRecord, recordId, message, successful } = this.state;

        return (
            <div className="container">
                <header className="jumbotron">
                    <h3>
                        <strong>Medical Record</strong>
                    </h3>
                    ID: {recordId}
                </header>
                {loading && (
                    <Container>
                        <h4>Patient Information</h4>
                        <br/>
                        <Row>
                            <Col>
                                <p> <strong>First Name: </strong>
                                    {medicalRecord.patientData.first_name}
                                </p>
                                <p> <strong>Last Name: </strong>
                                    {medicalRecord.patientData.last_name}
                                </p>
                                <p> <strong>Date of Birth: </strong>
                                    {medicalRecord.patientData.dob}
                                </p>
                                <p> <strong>Contact Number: </strong>
                                    {medicalRecord.patientData.contact_num}
                                </p>
                            </Col>
                        </Row>
                        <br/>
                        <br/>
                        <Row>
                            <Col>
                                <h4>Record Details</h4>
                                <p>{medicalRecord.details}</p>
                            </Col>
                        </Row>
                        <br/>
                        <Row>
                            <Col md={{ span: 3, offset: 4}}>
                                <div className="form-group">
                                    <button type="button" className="btn btn-primary" onClick={() => {if (window.confirm('Do you want to verify this medical record?')) this.verifyRecord() }}>Verify</button>
                                </div>
                            </Col>
                            <Col md={{ span: 3 }}>
                                <div className="form-group">
                                    <button type="button" className="btn btn-danger" onClick={() => {if (window.confirm('Do you want to report this medical record?')) this.reportRecord() }}>Report</button>
                                </div>
                            </Col>
                        </Row>
                        {message && (
                            <Row>
                                <div className="form-group">
                                    <div className={successful ? "alert alert-success" : "alert alert-danger"} role="alert">
                                        {message}
                                    </div>
                                </div>
                            </Row>
                        )}
                    </Container>
                )}
                
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { user } = state.auth;
    return {
        user
    };
}

export default connect(mapStateToProps)(VerifyRecord);