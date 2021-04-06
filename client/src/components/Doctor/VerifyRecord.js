import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import { connect } from "react-redux";

class VerifyRecord extends Component {

    render() {
        // const { user: currentUser } = this.props;

        // if (!currentUser) {
        //     return <Redirect to="/login" />;
        // }

        return (
            <div className="container">
                <header className="jumbotron">
                    <h3>
                        <strong>Medical Record</strong>
                    </h3>
                </header>
                {/* <h4>Patient Information</h4>
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
                <br/> */}
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

export default connect(mapStateToProps)(VerifyRecord);