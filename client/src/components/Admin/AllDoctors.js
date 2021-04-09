import React, { Component, Fragment } from "react";
import UserService from "../../services/user.service";
// solidity
import Users from "../../contracts/Users.json";
import getWeb3 from "../../getWeb3";
export default class AllDoctors extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: "",
      doctors: [],
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
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
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
      console.log(
        "******** admin",
        await instance.methods
          .isAdmin("0xf459b27F4Ca1A8A44937a10785E572CfB91C96B6")
          .call()
      );
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }

    this.allDoctors();
  };

  allDoctors = async () => {
    const response = await fetch("http://localhost:8080/getAllPendingDoctors");
    const jsonData = await response.json();
    this.setState({ doctors: jsonData });
    // console.log(this.state.doctors);
  };

  handleApprove = async (doc) => {
    const { accounts, contract } = this.state;
    console.log(doc);

    const response = await contract.methods
      .registerDoctor(doc.bc_address)
      .send({
        from: accounts[0],
      });

    const isExistingDoctor2 = await contract.methods
      .doctorExists(doc.bc_address)
      .call();

    console.log(isExistingDoctor2);
    if (response) {
      await fetch(`http://localhost:8080/approveDoctorStatus/${doc.userId}`, {
        method: "PUT",
      }).then((response) => console.log(response));
    } else {
      await fetch(`http://localhost:8080/deleteDoctorAddress/${doc.userId}`, {
        method: "PUT",
      }).then((response) => console.log(response));
    }

    // console.log(response);
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
              <tr key={doctor.userId}>
                <th>{doctor.username}</th>
                <th>{doctor.first_name + " " + doctor.last_name}</th>
                <th>{doctor["doctor"].specialty}</th>
                <th>{doctor["doctor"].healthcare_institution}</th>
                <th>{doctor.bc_address}</th>
                <th>
                  <button
                    type="submit"
                    onClick={() => this.handleApprove(doctor)}
                  >
                    Approve
                  </button>
                </th>
                <th>
                  <button>Reject</button>
                </th>
              </tr>
            ))}
          </tbody>
        </table>
      </Fragment>
    );
  }
}
