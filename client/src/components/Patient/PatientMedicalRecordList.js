import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import { connect } from "react-redux";

import UserService from "../../services/user.service";

// solidity
import Users from "../../contracts/Users.json";
import MedicalRecords from "../../contracts/MedicalRecords.json";
import getWeb3 from "../../getWeb3";
import web3 from 'web3';

class PatientMedicalRecordList extends Component {

    constructor(props) {
        super(props);

        this.state = {
            web3: null,
            accounts: null,
            userContract: null,
            medicalRecordContract: null,
            recordIds: [],
            medicalRecords: [],
            details: "",
        };
    }

    componentDidMount = async () => {
        if (!window.location.hash) {
            window.location = window.location + '#loaded';
            window.location.reload();
        }
        try {
            console.log(this.state.contract);
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
            this.setState({ web3, accounts, userContract: instance });
            console.log("********** Instance:", instance);

            const medicalRecordDeployedNetwork = MedicalRecords.networks[networkId];
            console.log("********** medicalRecordDeployedNetwork: ", deployedNetwork);

            const medicalRecordInstance = new web3.eth.Contract(
                MedicalRecords.abi,
                medicalRecordDeployedNetwork && medicalRecordDeployedNetwork.address
            );
            this.setState({  web3, accounts, medicalRecordContract: medicalRecordInstance });
            console.log("********** medicalRecordInstance:", instance);

            await this.retrieveRecordIds().then(async () => {
                await this.retrieveMedicalRecords();
            });
        } catch (error) {
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    }

    retrieveRecordIds = async () => {
        const { accounts, userContract } = this.state;
        const { user: currentPatient } = this.props;
        console.log("user", currentPatient);

        const details = this.state.web3.utils.asciiToHex(this.state.details);
        console.log("convert to bytes:", details);

        console.log("patient id: ", currentPatient.patientId);

        this.state.recordIds = await userContract.methods.getRecordIds(currentPatient.patientId).call({from: accounts[0]});
        console.log("Record Ids ", this.state.recordIds);
        
    }

    retrieveMedicalRecords = async () => {
        const { accounts, medicalRecordContract } = this.state;
        const { user: currentPatient } = this.props;
        console.log("user", currentPatient);

        const details = this.state.web3.utils.asciiToHex(this.state.details);
        console.log("convert to bytes:", details);

        console.log("patient id: ", currentPatient.patientId);

        for (const index in this.state.recordIds) {
            const response = await medicalRecordContract.methods.viewRecord(index).call({from: accounts[0]});

            var record = {
                recordId: index,
                patient: response[0],
                details: web3.utils.hexToAscii(response[1]),
                doctorInCharge: response[2],
                patientVerified: response[3],
                doctorVerified: response[4],
            }   

            var list = [];
            list.push(record);

            console.log(record.details);

        }

        this.setState({medicalRecords: list});

    }

    renderRows() {
        const rows = this.state.medicalRecords || [];

        return rows.map(record => {
            return(
                <tr key={record.recordId}>
                    <th>{record.recordId}</th>
                    <th>{record.details}</th>
                </tr> 
            )
        })
    }

    render() {        

        return (
            <div className="container">
                <header className="jumbotron">
                    <h3>Medical Records</h3>
                </header>
                <table className="table table-hover table-responsive">
                    <thead>
                        <tr>
                            <th>Record Id</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderRows()}
                    </tbody>
                </table>
            </div>
        );
    }

    
}

function mapStateToProps(state) {
    const { user } = state.auth;
    return {
        user,
    };
}

export default connect(mapStateToProps)(PatientMedicalRecordList);