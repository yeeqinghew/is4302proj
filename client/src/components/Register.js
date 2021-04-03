import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import Select from "react-validation/build/select";
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";

import { connect } from "react-redux";
import { registerPatient } from "../actions/auth";
import { registerDoctor } from "../actions/auth";

// datepicker
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

import dateFnsFormat from 'date-fns/format';
import dateFnsParse from 'date-fns/parse';

// json
import { Nationalities } from "../json/nationalities";
import { Races } from "../json/races";

// solidity
import Users from "../contracts/Users.json";
import getWeb3 from "../getWeb3";


const required = (value) => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                This field is required!
            </div>
        );
    }
};

const email = (value) => {
    if (!isEmail(value)) {
        return (
            <div className="alert alert-danger" role="alert">
                This is not a valid email.
            </div>
        );
    }
};

const vusername = (value) => {
    if (value.length < 3 || value.length > 20) {
        return (
            <div className="alert alert-danger" role="alert">
                The username must be between 3 and 20 characters.
            </div>
        );
    }
};

const vpassword = (value) => {
    if (value.length < 6 || value.length > 40) {
        return (
            <div className="alert alert-danger" role="alert">
                The password must be between 6 and 40 characters.
            </div>
        );
    }
};

class Register extends Component {
    constructor(props) {
        super(props);
        this.handleRegister = this.handleRegister.bind(this);
        this.onChangeRoleId = this.onChangeRoleId.bind(this);
        this.onChangeFirstName = this.onChangeFirstName.bind(this);
        this.onChangeLastName = this.onChangeLastName.bind(this);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onChangeContactNum = this.onChangeContactNum.bind(this);
        this.onChangeDob = this.onChangeDob.bind(this);
        this.onChangeGender = this.onChangeGender.bind(this);
        this.onChangeNationality = this.onChangeNationality.bind(this);
        this.onChangeRace = this.onChangeRace.bind(this);

        // for patient
        this.onChangeNric = this.onChangeNric.bind(this);
        this.onChangeHomeAddress = this.onChangeHomeAddress.bind(this);
        this.onChangeEmergencyContact = this.onChangeEmergencyContact.bind(this);

        // for doctor
        this.onChangeSpecialty = this.onChangeSpecialty.bind(this);
        this.onChangeHealthcareInstitution = this.onChangeHealthcareInstitution.bind(this);

        this.state = {
            roleId: "",
            firstName: "",
            lastName: "",
            username: "",
            email: "",
            password: "",
            contactNum: "",
            dob: "",
            gender: "",
            nationality: "",
            race: "",
            nric: "",
            homeAddress: "",
            emergencyContact: "",
            specialty: "",
            healthcareInstitution: "",
            bcAddress: "",
            successful: false,
            web3: null,
            accounts: null,
            // account: null,
            contract: null
        };
    }

    componentDidMount = async () => {
        if (!window.location.hash) {
            window.location = window.location + '#loaded';
            window.location.reload();
        }
        try {
            console.log(this.state.contract);
            console.log("I AM IN TRY CATCH NOW");
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
            this.setState({ web3, accounts, contract: instance });
            console.log("********** Instance:", instance);

            // const patient1 = await instance.methods.getPatientAddress(0).call();
            // const patient2 = await instance.methods.getPatientAddress(1).call();
            // const patient3 = await instance.methods.getPatientAddress(2).call();
            // console.log("*****", patient1, patient2, patient3);
        } catch (error) {
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    }
    onChangeFirstName(e) {
        this.setState({
            firstName: e.target.value,
        });
    }

    onChangeLastName(e) {
        this.setState({
            lastName: e.target.value,
        });
    }

    onChangeRoleId(e) {
        this.setState({
            roleId: e.target.value,
        });
    }

    onChangeUsername(e) {
        this.setState({
            username: e.target.value,
        });
    }

    onChangeEmail(e) {
        this.setState({
            email: e.target.value,
        });
    }

    onChangePassword(e) {
        this.setState({
            password: e.target.value,
        });
    }

    onChangeContactNum(e) {
        this.setState({
            contactNum: e.target.value,
        });
    }

    onChangeDob(e) {
        // console.log("dob", this.state.dob);
        this.setState({
            dob: e.target.value,
        });
    }

    onChangeGender(e) {
        this.setState({
            gender: e.target.value,
        });
    }

    onChangeNationality(e) {
        this.setState({
            nationality: e.target.value,
        });
    }

    onChangeRace(e) {
        this.setState({
            race: e.target.value,
        }); console.log("race", this.state.race);
    }

    onChangeNric(e) {
        this.setState({
            nric: e.target.value,
        });
    }

    onChangeHomeAddress(e) {
        this.setState({
            homeAddress: e.target.value,
        });
    }

    onChangeEmergencyContact(e) {
        this.setState({
            emergencyContact: e.target.value,
        });
    }

    onChangeSpecialty(e) {
        this.setState({
            specialty: e.target.value,
        });
    }

    onChangeHealthcareInstitution(e) {
        this.setState({
            healthcareInstitution: e.target.value
        })
    }

    parseDate(str, format, locale) {
        const parsed = dateFnsParse(str, format, new Date(), { locale });
        if (DateUtils.isDate(parsed)) {
            return parsed;
        }
        return undefined;
    }

    formatDate(date, format, locale) {
        return dateFnsFormat(date, format, { locale });
    }

    regPatient = async () => {
        const { accounts, contract } = this.state;
        const response = await contract.methods.registerPatient().send({ from: accounts[0] })
        console.log("######## Response", response);
        console.log("*** isPatient", await contract.methods.isPatient(accounts[0]).call());
        console.log("*** Exsisting", await contract.methods.isExistingPatient(0).call());
        console.log("######## Event", response.events.registeredPatient.returnValues[0]);
        const patient1 = await contract.methods.getPatientAddress(0).call();
        console.log("$$$$$$$Patient 1:", patient1);
        this.setState({ bcAddress: response.events.registeredPatient.returnValues[0] });
        return response;
    };

    handleRegister(e) {
        e.preventDefault();

        this.setState({
            successful: false,
        });

        this.form.validateAll();

        if (this.checkBtn.context._errors.length === 0 && this.state.roleId === "2") {
            this.regPatient()
                .then((res) => {
                    if (res.events.registeredPatient) {
                        this.props.dispatch(
                            registerPatient(
                                this.state.roleId,
                                this.state.username,
                                this.state.email,
                                this.state.password,
                                this.state.firstName,
                                this.state.lastName,
                                this.state.contactNum,
                                this.state.dob,
                                this.state.gender,
                                this.state.nationality,
                                this.state.race,
                                this.state.bcAddress,
                                this.state.nric,
                                this.state.homeAddress,
                                this.state.emergencyContact
                            )
                        ).then(() => {
                            this.setState({
                                successful: true,
                            });
                        }).catch(() => {
                            this.setState({
                                successful: false,
                            });
                        });
                    }
                }).catch((err) => {
                    console.log("Failed with error: " + err);
                    console.log(err);
                    console.log(err.message);
                    console.log(err.message.reason);
                    // console.log(JSON.parse(err.message.substring(15).trim()).message);
                })
            // this.props
            //     .dispatch(
            //         registerPatient(
            //             this.state.roleId,
            //             this.state.username,
            //             this.state.email,
            //             this.state.password,
            //             this.state.firstName,
            //             this.state.lastName,
            //             this.state.contactNum,
            //             this.state.dob,
            //             this.state.gender,
            //             this.state.nationality,
            //             this.state.race,
            //             this.state.nric,
            //             this.state.homeAddress,
            //             this.state.emergencyContact
            //         )
            //     ).then(() => {
            //         this.regPatient();
            //     }).then(() => {
            //         this.setState({
            //             successful: true,
            //         });
            //     }).catch(() => {
            //         this.setState({
            //             successful: false,
            //         });
            //     });

            // console.log("I AM INNNN ASYNC GET BC ADDRESS");
        } else if (this.checkBtn.context._errors.length === 0 && this.state.roleId === "3") {
            this.props
                .dispatch(
                    registerDoctor(
                        this.state.roleId,
                        this.state.username,
                        this.state.email,
                        this.state.password,
                        this.state.firstName,
                        this.state.lastName,
                        this.state.contactNum,
                        this.state.dob,
                        this.state.gender,
                        this.state.nationality,
                        this.state.race,
                        this.state.specialty,
                        this.state.healthcareInstitution
                    )
                )
                .then(() => {
                    this.setState({
                        successful: true,
                    });
                })
                .catch(() => {
                    this.setState({
                        successful: false,
                    });
                });
        }
    }
    render() {
        const { message } = this.props;
        const FORMAT = 'yyyyMMdd';
        return (
            <div className="col-md-12">
                <div className="card card-container">
                    <img
                        src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
                        alt="profile-img"
                        className="profile-img-card"
                    />

                    <Form
                        onSubmit={this.handleRegister}
                        ref={(c) => {
                            this.form = c;
                        }}
                    >
                        {!this.state.successful && (
                            <div>
                                <div className="form-group">
                                    <label htmlFor="roleId">Role</label>
                                    <Select
                                        className="form-control"
                                        name="roleId"
                                        value={this.state.roleId}
                                        onChange={this.onChangeRoleId}
                                        validations={[required]}>
                                        <option value="">Select one</option>
                                        <option value="2">Patient</option>
                                        <option value="3">Doctor</option>
                                    </Select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="username">Username</label>
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="username"
                                        value={this.state.username}
                                        onChange={this.onChangeUsername}
                                        validations={[required, vusername]}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="email"
                                        value={this.state.email}
                                        onChange={this.onChangeEmail}
                                        validations={[required, email]}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <Input
                                        type="password"
                                        className="form-control"
                                        name="password"
                                        value={this.state.password}
                                        onChange={this.onChangePassword}
                                        validations={[required, vpassword]}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name</label>
                                    <Input
                                        type="firstName"
                                        className="form-control"
                                        name="firstName"
                                        value={this.state.firstName}
                                        onChange={this.onChangeFirstName}
                                        validations={[required]}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name</label>
                                    <Input
                                        type="lastName"
                                        className="form-control"
                                        name="lastName"
                                        value={this.state.lastName}
                                        onChange={this.onChangeLastName}
                                        validations={[required]}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="contactNum">Contact No</label>
                                    <Input
                                        type="contactNum"
                                        className="form-control"
                                        name="contactNum"
                                        value={this.state.contactNum}
                                        onChange={this.onChangeContactNum}
                                        validations={[required]}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="dob">Date of Birth</label>
                                    <Input
                                        type="dob"
                                        className="form-control"
                                        name="dob"
                                        value={this.state.dob}
                                        onChange={this.onChangeDob}
                                        placeholder="YYYYMMDD"
                                        validations={[required]}
                                    />
                                    {/* <label htmlFor="dob">Date of Birth</label>
                                    <DayPickerInput
                                        // classNames="form-control"
                                        validations={[required]}
                                        formatDate={this.formatDate}
                                        format={FORMAT}
                                        value={this.state.dob}
                                        onDayChange={this.onChangeDob}
                                        name="dob"
                                        parseDate={this.parseDate}
                                        placeholder={`${dateFnsFormat(new Date(), FORMAT)}`}
                                        inputProps={{
                                            style: {
                                                color: "blue",
                                                display: "block",
                                                width: "140%",
                                                height: "calc(1.5em + .75rem + 2px)",
                                                padding: ".375rem .75rem",
                                                fontSize: "1rem",
                                                fontWeight: "400",
                                                lineHeight: "1.5",
                                                color: "#495057",
                                                backgroundColor: "#fff",
                                                backgroundClip: "padding-box",
                                                border: "1px solid #ced4da",
                                                borderRadius: ".25rem",
                                                transition: "border-color .15s ease-in-out,box-shadow .15s ease-in-out"
                                            }
                                        }} />*/}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="gender">Gender</label>
                                    <Select
                                        className="form-control"
                                        name="gender"
                                        value={this.state.gender}
                                        onChange={this.onChangeGender}
                                        validations={[required]}>
                                        <option value="">Select one</option>
                                        <option value="Female">Female</option>
                                        <option value="Male">Male</option>
                                    </Select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="nationality">Nationality</label>
                                    <Select
                                        className="form-control"
                                        name="nationality"
                                        value={this.state.nationality}
                                        onChange={this.onChangeNationality}
                                        validations={[required]}>
                                        <option value="">Select one</option>
                                        {Nationalities.nationalities && Nationalities.nationalities.map((nationality) => {
                                            return <option value={nationality}>{nationality}</option>;
                                        })}
                                    </Select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="race">Race</label>
                                    <Select
                                        className="form-control"
                                        name="race"
                                        value={this.state.race}
                                        onChange={this.onChangeRace}
                                        validations={[required]}>
                                        <option value="">Select one</option>
                                        {Races.races && Races.races.map((race) => {
                                            return <option value={race}>{race}</option>;
                                        })}
                                    </Select>
                                </div>

                                {this.state.roleId === "2" && (
                                    <div>
                                        <div className="form-group">
                                            <label htmlFor="nric">NRIC</label>
                                            <Input
                                                type="text"
                                                className="form-control"
                                                name="nric"
                                                value={this.state.nric}
                                                onChange={this.onChangeNric}
                                                validations={[required]}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="homeAddress">Home Address</label>
                                            <Input
                                                type="text"
                                                className="form-control"
                                                name="homeAddress"
                                                value={this.state.homeAddress}
                                                onChange={this.onChangeHomeAddress}
                                                validations={[required]}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="emergencyContact">Emergency Contact</label>
                                            <Input
                                                type="text"
                                                className="form-control"
                                                name="emergencyContact"
                                                value={this.state.emergencyContact}
                                                onChange={this.onChangeEmergencyContact}
                                                validations={[required]}
                                            />
                                        </div>
                                    </div>
                                )}
                                {this.state.roleId === "3" && (
                                    <div>
                                        <div className="form-group">
                                            <label htmlFor="specialty">Specialty</label>
                                            <Input
                                                type="text"
                                                className="form-control"
                                                name="specialty"
                                                value={this.state.specialty}
                                                onChange={this.onChangeSpecialty}
                                                validations={[required]}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="healthcareInstitution">Healthcare Institution</label>
                                            <Input
                                                type="text"
                                                className="form-control"
                                                name="healthcareInstitution"
                                                value={this.state.healthcareInstitution}
                                                onChange={this.onChangeHealthcareInstitution}
                                                validations={[required]}
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="form-group">
                                    <button className="btn btn-primary btn-block">Sign Up</button>
                                </div>
                            </div>
                        )}

                        {message && (
                            <div className="form-group">
                                <div className={this.state.successful ? "alert alert-success" : "alert alert-danger"} role="alert">
                                    {message}
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
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { message } = state.message;
    return {
        message,
    };
}

export default connect(mapStateToProps)(Register);