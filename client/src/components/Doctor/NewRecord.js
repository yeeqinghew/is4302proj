import React, { Component, Fragment } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import TextArea from "react-validation/build/textarea";
import CheckButton from "react-validation/build/button";
// import Toast from 'react-bootstrap/Toast'

import { connect } from "react-redux";
import UserService from "../../services/user.service";

// solidity
import MedicalRecords from "../../contracts/MedicalRecords.json";
import getWeb3 from "../../getWeb3";

const required = (value) => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                This field is required!
            </div>
        );
    }
};

class NewRecord extends Component {
    constructor(props) {
        super(props);
        this.verifyPatient = this.verifyPatient.bind(this);
        this.handleRecord = this.handleRecord.bind(this);
        this.onChangeNric = this.onChangeNric.bind(this);
        this.onChangeDetails = this.onChangeDetails.bind(this);
        this.onChangeId = this.onChangeId.bind(this);

        this.state = {
            web3: null,
            accounts: null,
            contract: null,
            successful: false,
            message: "",
            patient: null,
            nric: "",
            verified: false,
            details: ""
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
            this.setState({ web3, accounts, contract: instance });
            console.log("********** Instance:", instance);
        } catch (error) {
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    }

    onChangeNric(e) {
        this.setState({
            nric: e.target.value,
            verified: false,
        });
    }

    onChangeId(e) {
        this.setState({
            patientId: e.target.value,
        });
    }

    onChangeDetails(e) {
        this.setState({
            details: e.target.value,
        });
    }

    verifyPatient() {
        UserService.getPatientByNric(this.state.nric).then(
            response => {
                this.setState({
                    patient: response.data,
                    verified: true,
                    message: ""
                });
                console.log("patient", response.data);
            },
            error => {
                this.setState({
                    message: "Patient cannot be verified"
                });
                console.log(
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString())
            }
        );
    };

    createRecord = async () => {
        const { accounts, contract } = this.state;
        const { user: currentDoctor } = this.props;
        console.log("user", currentDoctor);

        const details = this.state.web3.utils.asciiToHex(this.state.details);
        console.log("convert to bytes:", details);

        const response = await contract.methods.createRecord(
            this.state.patient.patientId, 
            currentDoctor.doctorId, details
        ).send({ from: accounts[0] }); 
        console.log("Response", response);
        console.log("Event", response.events.createdMedicalRecord);
        const medicalRecordId = response.events.createdMedicalRecord.returnValues[0];
        console.log("Medical Record Id:", medicalRecordId);
        // console.log("***** Medical Record:", await contract.methods.viewRecord(0).call({from: accounts[0]}));
        return response;
    }

    handleRecord(e) {
        e.preventDefault();

        this.setState({
            successful: false,
        });

        if (!this.state.verified) {
            this.setState({
                message: "Patient has not been verified!"
            });
            return;
        }

        this.form.validateAll();

        if (this.checkBtn.context._errors.length === 0) {
            this.createRecord()
            .then((res) => {
                this.setState({
                    successful: true,
                    message: "Medical record is created successfully!"
                });

                setTimeout(() => {
                    window.location.reload();
                }, 2500);

            }).catch((err) => {
                var str = JSON.stringify(err);
                
                var error;

                if (err.code === -32603) {
                    var start = str.indexOf('reason');
                    var end = str.indexOf('stack');
                    error = "Medical record cannot be created successfully: " + str.slice(start + 11, end - 7) + "!";
                    console.log(error);
                } else {
                    error = "Medical record cannot be created successfully!"
                }
                
                this.setState({
                    message: error
                });
            })
        }
    }

    render() {
        const { successful, nric, details, verified, patient, message, } = this.state;
        return (
            <Fragment>
                <header className="jumbotron">
                    <h3>New Medical Record</h3>
                </header>
                <Form
                    onSubmit={this.handleRecord}
                    ref={(c) => {
                        this.form = c;
                    }}
                >
                    {!successful && (
                        <div>
                            <div className="form-group">
                                <label htmlFor="nric">Patient's NRIC</label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    name="nric"
                                    value={nric}
                                    onChange={this.onChangeNric}
                                    validations={[required]}
                                />
                            </div>
                            <div className="form-group">
                                <button type="button" className="btn btn-primary" onClick={this.verifyPatient}>Verify</button>
                            </div>
                            {verified && (
                                <div className="form-group">
                                    <h4>Current Patient Information</h4>
                                    <br/>
                                    <p> <strong>First Name: </strong>
                                        {patient.first_name}
                                    </p>
                                    <p> <strong>Last Name: </strong>
                                        {patient.last_name}
                                    </p>
                                    <p> <strong>Date of Birth: </strong>
                                        {patient.dob}
                                    </p>
                                    <p> <strong>Contact Number: </strong>
                                        {patient.contact_num}
                                    </p>
                                    <br/>
                                </div>
                            )}
                            <div className="form-group">
                                <label htmlFor="details">Details</label>
                                <TextArea
                                    // type="textarea"
                                    className="form-control"
                                    name="details"
                                    value={details}
                                    onChange={this.onChangeDetails}
                                    validations={[required]}
                                />
                            </div>
                            <div className="form-group">
                                <button type="submit" className="btn btn-primary">Submit</button>
                            </div>
                        </div>
                    )}

                    {message && (
                        <div className="form-group">
                            <div className={successful ? "alert alert-success" : "alert alert-danger"} role="alert">
                                {message}
                            </div>
                        </div>
                    )}
                    {/* <Toast
                        style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            background: '#00CC00'
                        }}
                    >
                        <Toast.Header>
                            <strong className="mr-auto">Bootstrap</strong>
                        </Toast.Header>
                        <Toast.Body>Record created successfully!</Toast.Body>
                    </Toast> */}
                    <CheckButton
                        style={{ display: "none" }}
                        ref={(c) => {
                            this.checkBtn = c;
                        }}
                    />
                </Form>
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

export default connect(mapStateToProps)(NewRecord);