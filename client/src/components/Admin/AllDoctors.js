import React, { Component, Fragment } from "react";
import UserService from "../../services/user.service";
import Table from "react-bootstrap/Table";

import ClipLoader from "react-spinners/ClipLoader";
// solidity
import Users from "../../contracts/Users.json";
import getWeb3 from "../../getWeb3";
export default class AllDoctors extends Component {
  constructor(props) {
    super(props);
    this.allDoctors = this.allDoctors.bind(this);
    this.allPendingDoctors = this.allPendingDoctors.bind(this);

    this.state = {
      content: "",
      doctors: [],
      records: [],
      pendingDoctors: [],
      loading: false,
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
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
    this.allDoctors();
    this.allPendingDoctors();
  };

  allDoctors = async () => {
    const { contract } = this.state;
    const response = await fetch("http://localhost:8080/getAllDoctors");
    const jsonData = await response.json();
    this.setState({ doctors: jsonData });

    var newDoctorArr = [];
    for (let i = 0; i < this.state.doctors.length; i++) {
      console.log(this.state.doctors[i]);
      if (this.state.doctors[i].doctor.approved === true) {
        const penaltyScore = await contract.methods
          .getPenaltyScore(this.state.doctors[i].doctor.id)
          .call();

        const appraisalScore = await contract.methods
          .getAppraisalScore(this.state.doctors[i].doctor.id)
          .call();

        const isBlacklisted = await contract.methods
          .isBlacklisted(this.state.doctors[i].doctor.id)
          .call();

        var newRec = {
          doctor: this.state.doctors[i],
          appraisalScore: appraisalScore,
          penaltyScore: penaltyScore,
          isBlacklisted: isBlacklisted,
        };
        newDoctorArr.push(newRec);
      }
    }
    console.log(newDoctorArr);
    this.setState({ records: newDoctorArr, loading: true });
    console.log(this.state.records);
  };

  allPendingDoctors = async () => {
    const response = await fetch("http://localhost:8080/getAllPendingDoctors");
    const jsonData = await response.json();
    this.setState({ pendingDoctors: jsonData });
    // console.log(this.state.pendingDoctors);
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
    window.location.reload();
  };

  handleBlacklist = async (doctor) => {
    const { accounts, contract } = this.state;
    console.log("blacklistttt");
    const blacklist = await contract.methods
      .blacklistDoctor(doctor.doctor.id)
      .send({ from: accounts[0] });

    console.log(blacklist);
    window.location.reload();
  };
  render() {
    const { records, pendingDoctors, loading } = this.state;
    if (!records) {
      return <ClipLoader loading={loading} size={150} />;
    }
    return (
      <Fragment>
        <header className="jumbotron">
          <h1> All Doctor </h1>
        </header>
        <h1>Doctors</h1>

        {loading && records.length !== 0 && (
          <Table hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Appraisal Score</th>
                <th>Penalty Score</th>
                <th>Blacklist</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.doctor.userId}>
                  <th>
                    {rec.doctor.first_name} {rec.doctor.last_name}
                  </th>
                  <th>{rec.appraisalScore}</th>
                  <th>{rec.penaltyScore}</th>
                  <th>{String(rec.isBlacklisted) === "true" ? "✓" : "✗"}</th>
                  {/* <th>
                    {String(rec.isBlacklisted) === "false" && (
                      <button
                        className="btn btn-warning btn-block"
                        onClick={() => this.handleBlacklist(rec.doctor)}
                      >
                        Blacklist
                      </button>
                    )}
                  </th> */}
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {loading && records.length === 0 && <h5>No records to display</h5>}

        <h1>Pending Doctors</h1>
        {pendingDoctors.length !== 0 && (
          <Table hover responsive>
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
              {pendingDoctors.map((doctor) => (
                <tr key={doctor.userId}>
                  <th>{doctor.username}</th>
                  <th>{doctor.first_name + " " + doctor.last_name}</th>
                  <th>{doctor["doctor"].specialty}</th>
                  <th>{doctor["doctor"].healthcare_institution}</th>
                  <th>{doctor.bc_address}</th>
                  <th>
                    <button
                      className="btn btn-warning btn-block"
                      type="submit"
                      onClick={() => this.handleApprove(doctor)}
                    >
                      Approve
                    </button>
                  </th>
                  <th>
                    <button className="btn btn-danger btn-block">Reject</button>
                  </th>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Fragment>
    );
  }
}
