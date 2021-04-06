import React, { Component, Fragment } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";

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
        this.handleRecord = this.handleRecord.bind(this);
        this.onChangeNric = this.onChangeNric.bind(this);
        this.onChangeDetails = this.onChangeDetails.bind(this);
        this.onChangeId = this.onChangeId.bind(this);

        this.state = {
            content: "",
            web3: null,
            accounts: null,
            contract: null,
            successful: false,
            message: "",
            patient: null,
            nric: "",
            patientId: "",
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
        });

        // UserService.getPatientByNric("S6153515B").then(
        //     response => {
        //         this.setState({
        //             patient: response.data
        //         });
        //         console.log("patient", response.data);
        //     },
        //     error => {
        //         this.setState({
        //             content:
        //                 (error.response &&
        //                     error.response.data &&
        //                     error.response.data.message) ||
        //                 error.message ||
        //                 error.toString()
        //         });
        //     }
        // );
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

    createRecord = async () => {
        const { accounts, contract } = this.state;
        const { user: currentDoctor } = this.props;
        console.log("user", currentDoctor);

        const details = this.state.web3.utils.asciiToHex(this.state.details);
        console.log("convert to bytes:", details);

        const response = await contract.methods.createRecord(this.state.patientId, 0, details).send({ from: accounts[0] }); //to replace doctorId, bc_address when doctor approval done
        console.log("Response", response);
        console.log("Event", response.events.createdMedicalRecord);
        const medicalRecordId = response.events.createdMedicalRecord.returnValues[0];
        console.log("Medical Record Id:", medicalRecordId);
        // console.log("***** Medical Record:", await contract.methods.viewRecord(medicalRecordId).call());
        return response;
    }

    handleRecord(e) {
        e.preventDefault();

        this.setState({
            successful: false,
        });

        this.form.validateAll();

        if (this.checkBtn.context._errors.length === 0) {
            this.createRecord()
            .then((res) => {
                console.log("res", res);
                this.setState({
                    successful: true,
                    message: "Medical Record is created successfully!"
                });
            }).catch((err) => {
                console.log("Failed!", err);
                this.setState({
                    successful: false,
                    message: "Medical Record is not created successfully!"
                });
            })
        }
    }

    render() {
        const { message } = this.props;
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
                    {!this.state.successful && (
                        <div>
                            {/* <div className="form-group">
                                <label htmlFor="nric">NRIC</label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    name="nric"
                                    value={this.state.nric}
                                    onChange={this.onChangeNric}
                                    validations={[required]}
                                />
                            </div> */}
                            <div className="form-group">
                                <label htmlFor="patientId">Patient ID</label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    name="patientId"
                                    value={this.state.patientId}
                                    onChange={this.onChangeId}
                                    validations={[required]}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="details">Details</label>
                                <Input
                                    type="textarea"
                                    className="form-control"
                                    name="details"
                                    value={this.state.details}
                                    onChange={this.onChangeDetails}
                                    validations={[required]}
                                />
                            </div>
                            <div className="form-group">
                                <button className="btn btn-primary">Submit</button>
                            </div>
                        </div>
                    )}

                    {this.state.message && (
                        <div className="form-group">
                            <div className={this.state.successful ? "alert alert-success" : "alert alert-danger"} role="alert">
                                {this.state.message}
                            </div>
                        </div>
                    )}
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

// function mapStateToProps(state) {
//     const { message } = state.message;
//     return {
//         message,
//     };
// }

function mapStateToProps(state) {
    const { user } = state.auth;
    return {
        user,
    };
}

export default connect(mapStateToProps)(NewRecord);