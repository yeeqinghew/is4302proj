import React, { Component, Fragment } from "react";

import UserService from "../../services/user.service";

export default class AllDoctors extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: "",
      doctors: [],
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

    this.allDoctors();
  }

  allDoctors = async () => {
    const response = await fetch("http://localhost:8080/getAllPendingDoctors");
    const jsonData = await response.json();
    this.setState({ doctors: jsonData });
    // console.log(this.state.doctors);
  };

  render() {
    return (
      <Fragment>
        <header className="jumbotron">
          <h1> All Doctor </h1>
          <h3> {this.state.content} </h3>
        </header>
        <table className="table table-hover table-responsive">
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Specialty</th>
              <th>Healthcare Institution</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {this.state.doctors.map((doctor) => (
              <tr
                key={doctor.userId}
                onClick={(e) => {
                  console.log(doctor.userId);
                }}
              >
                <th>{doctor.username}</th>
                <th>{doctor.first_name + " " + doctor.last_name}</th>
                <th>{doctor["doctor"].specialty}</th>
                <th>{doctor["doctor"].healthcare_institution}</th>
                <th>{doctor.bc_address}</th>
              </tr>
            ))}
          </tbody>
        </table>
      </Fragment>
    );
  }
}
