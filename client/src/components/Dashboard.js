import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import { connect } from "react-redux";

class Dashboard extends Component {

    viewMedicalRecordList=()=> {
        let path = "/patient-medical-record-list";
        this.props.history.push(path);
    }

    render() {
        const { user: currentUser } = this.props;

        if (!currentUser) {
            return <Redirect to="/login" />;
        }

        return (
            <div className="container">
                <header className="jumbotron">
                    <h3>
                        <strong>{currentUser.username}</strong> Dashboard
          </h3>
                </header>
                <p>
                    <strong>Token:</strong> {currentUser.accessToken.substring(0, 20)} ...{" "}
                    {currentUser.accessToken.substr(currentUser.accessToken.length - 20)}
                </p>
                <p>
                    <strong>Id:</strong> {currentUser.id}
                </p>
                <p>
                    <strong>Email:</strong> {currentUser.email}
                </p>
                <p> <strong>Role: </strong>
                    {currentUser.role}
                </p>
                <p> <strong>Date of Birth: </strong>
                    {currentUser.dob}
                </p>
                <p> <strong>Contact Number: </strong>
                    {currentUser.contact_num}
                </p>
                <p><strong>Gender: </strong>
                    {currentUser.gender}
                </p>
                <p><strong>Nationality: </strong>
                    {currentUser.nationality}
                </p>
                <p><strong>Race: </strong>
                    {currentUser.race}
                </p>
                <p><strong>Blockchain Address: </strong>
                    {currentUser.bc_address}
                </p>
                {currentUser.role === "admin" && <div>
                    <p> <strong>Date Joined: </strong>
                        {currentUser.date_joined}
                    </p>

                </div>}
                {currentUser.role === "patient" && <div>
                    <p> <strong>NRIC: </strong>
                        {currentUser.nric}
                    </p>
                    <p><strong>Home Address: </strong>
                        {currentUser.home_address}
                    </p>
                    <p><strong>Emergency Contact: </strong>
                        {currentUser.emergency_contact}
                    </p>
                    <div>
                        <button className="btn btn-primary btn-block" onClick={this.viewMedicalRecordList}>
                            View Medical Record List
                        </button>
                    </div>                    
                </div>}

                {currentUser.role === "doctor" && <div>
                    <p> <strong>Specialty: </strong>
                        {currentUser.specialty}
                    </p>
                    <p><strong>Healthcare Institution: </strong>
                        {currentUser.healthcare_institution}
                    </p>
                </div>}


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

export default connect(mapStateToProps)(Dashboard);