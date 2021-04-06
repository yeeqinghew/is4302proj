import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import { connect } from "react-redux";

import UserService from "../services/user.service";

// solidity
import Users from "../contracts/Users.json";
import getWeb3 from "../getWeb3";

class PatientMedicalRecordList extends Component {

    constructor(props) {
        super(props);

        this.state = {
            web3: null,
            accounts: null,
            contract: null
        }
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
            this.setState({ web3, accounts, contract: instance });
            console.log("********** Instance:", instance);
        } catch (error) {
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    }

    render() {
        const { user: currentUser } = this.props;

        if (!currentUser) {
            return <Redirect to="/login" />;
        }

        return (
            <div className="container">
                <header className="jumbotron">
                    <h3>Medical Records</h3>
                </header>
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