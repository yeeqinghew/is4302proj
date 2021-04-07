import React, { Component, Fragment } from "react";

import UserService from "../../services/user.service";

export default class AllPatients extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: "",
      patients: [],
    };
  }

  componentDidMount() {
    UserService.getAdminBoard().then(
      (response) => {
        this.setState({
          content: response.data,
        });
      },
      (error) => {
        this.setState({
          content:
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString(),
        });
      }
    );

    this.AllPatients();
  }

  AllPatients = async () => {
    const response = await fetch("http://localhost:8080/getAllPatients");
    const jsonData = await response.json();
    this.setState({ patients: jsonData });
  };

  render() {
    return (
      <Fragment>
        <header className="jumbotron">
          <h1> All Patients </h1>
          <h3> {this.state.content} </h3>
        </header>
        <table className="table table-hover table-responsive">
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {this.state.patients.map((patient) => (
              <tr
                key={patient.userId}
                onClick={(e) => {
                  console.log(patient.userId);
                }}
              >
                <th>{patient.username}</th>
                <th>{patient.first_name + " " + patient.last_name}</th>
                <th>{patient.bc_address}</th>
              </tr>
            ))}
          </tbody>
        </table>
      </Fragment>
    );
  }
}
