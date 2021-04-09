import React, { Component, Fragment } from "react";

import UserService from "../../services/user.service";

// solidity
import Users from "../../contracts/Users.json";
import getWeb3 from "../../getWeb3";

export default class AllAdmins extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: "",
      admins: [],
    };
  }

  componentDidMount = async () => {
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
    this.allAdmins();
  };

  allAdmins = async () => {
    const response = await fetch("http://localhost:8080/getAllAdmins");
    const jsonData = await response.json();
    this.setState({ admins: jsonData });
    console.log(this.state.admins);
  };

  render() {
    return (
      <Fragment>
        <header className="jumbotron">
          <h1> All Admins </h1>
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
            {this.state.admins.map((admin) => (
              <tr key={admin.userId}>
                <th>{admin.username}</th>
                <th>{admin.first_name + " " + admin.last_name}</th>
                <th>{admin.bc_address}</th>
              </tr>
            ))}
          </tbody>
        </table>
      </Fragment>
    );
  }
}
