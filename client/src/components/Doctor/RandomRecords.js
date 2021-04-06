import React, { Component, Fragment } from "react";

import { connect } from "react-redux";
import UserService from "../../services/user.service";

// solidity
import MedicalRecords from "../../contracts/MedicalRecords.json";
import getWeb3 from "../../getWeb3";

class RandomRecords extends Component {
    constructor(props) {
        super(props);
        this.getRandomInt = this.getRandomInt.bind(this);
        this.retrieveRandomRecords = this.retrieveRandomRecords.bind(this);

        this.state = {
            web3: null,
            accounts: null,
            contract: null,
            successful: false,
            message: "",
            medicalRecords: null,
            loading: false
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

        this.retrieveRandomRecords();
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    retrieveRandomRecords = async () => {
        const { web3, accounts, contract } = this.state;
        const { user: currentDoctor } = this.props;
        console.log("user", currentDoctor);

        const numRecords = await contract.methods.getNumMedicalRecords().call();
        console.log("numRecords:", numRecords);

        var min = 0;
        var max = numRecords;
        var medicalRecords = [];
        while (min < max) {
            min = this.getRandomInt(min, max) + 1;
            console.log("min", min);

            if (min < max) {
                const response = await contract.methods.viewRecord(min).call({from: accounts[0]});
                if (response[4] == 0) {
                    var record = {
                        recordId: min,
                        patient: response[0], 
                        details: web3.utils.hexToAscii(response[1]), 
                        doctorInCharge: response[2], 
                        patientVerified: response[3], 
                        doctorVerified: response[4]
                    };
                    medicalRecords.push(record);
                }
            }
            
        }
        console.log("***** Medical Records:", medicalRecords);
        this.setState({
            medicalRecords: medicalRecords,
            loading: true
        });
    }

    render() {
        const { message } = this.props;
        const { medicalRecords, loading } = this.state;
        console.log(medicalRecords);
        return (
            <Fragment>
                <header className="jumbotron">
                <h1> Medical Records </h1>
                </header>
                <table className="table table-hover table-responsive">
                <thead>
                    <tr>
                    <th>Record ID</th>
                    <th>Patient</th>
                    <th>Doctor-in-Charge</th>
                    <th>Specialty</th>
                    <th>Healthcare Institution</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && medicalRecords.map((record) => (
                    <tr
                        key = {record.recordId}
                        onClick = {(e) => {
                            console.log(record.recordId);
                        }}
                    >
                    <th>{record.recordId}</th>
                    <th>{record.patient}</th>
                    <th>{record.doctorInCharge}</th>
                    <th>{"specialty"}</th>
                    <th>{"healthcare institution institution institution institution"}</th>
                    </tr>
                    ))}
                </tbody>
                </table>
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