import React, { Component, Fragment } from "react";
import UserService from "../../services/user.service";
import Modal from "react-modal";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import Select from "react-validation/build/select";
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";

import { connect } from "react-redux";
import { registerAdmin } from "../../actions/auth";
// json
import { Nationalities } from "../../json/nationalities";
import { Races } from "../../json/races";

// solidity
import Users from "../../contracts/Users.json";
import getWeb3 from "../../getWeb3";

const required = (value) => {
  if (!value) {
    return (
      <div className="alert alert-danger" role="alert">
        This field is required!
      </div>
    );
  }
};

const email = (value) => {
  if (!isEmail(value)) {
    return (
      <div className="alert alert-danger" role="alert">
        This is not a valid email.
      </div>
    );
  }
};

const vusername = (value) => {
  if (value.length < 3 || value.length > 20) {
    return (
      <div className="alert alert-danger" role="alert">
        The username must be between 3 and 20 characters.
      </div>
    );
  }
};

const vpassword = (value) => {
  if (value.length < 6 || value.length > 40) {
    return (
      <div className="alert alert-danger" role="alert">
        The password must be between 6 and 40 characters.
      </div>
    );
  }
};

class AllAdmins extends Component {
  constructor(props) {
    super(props);

    this.handleRegisterAdmin = this.handleRegisterAdmin.bind(this);
    this.onChangeFirstName = this.onChangeFirstName.bind(this);
    this.onChangeLastName = this.onChangeLastName.bind(this);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onChangeContactNum = this.onChangeContactNum.bind(this);
    this.onChangeDob = this.onChangeDob.bind(this);
    this.onChangeGender = this.onChangeGender.bind(this);
    this.onChangeNationality = this.onChangeNationality.bind(this);
    this.onChangeRace = this.onChangeRace.bind(this);
    this.onChangeBcAddress = this.onChangeBcAddress.bind(this);

    this.state = {
      content: "",
      roleId: 1,
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      contactNum: "",
      dob: "",
      gender: "",
      nationality: "",
      race: "",
      bcAddress: "",
      admins: [],
      showModal: false,
      successful: false,
      web3: null,
      accounts: null,
      contract: null,
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
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
    Modal.setAppElement("body");
    this.allAdmins();
  };

  onChangeFirstName(e) {
    this.setState({
      firstName: e.target.value,
    });
  }

  onChangeLastName(e) {
    this.setState({
      lastName: e.target.value,
    });
  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value,
    });
  }

  onChangeEmail(e) {
    this.setState({
      email: e.target.value,
    });
  }

  onChangePassword(e) {
    this.setState({
      password: e.target.value,
    });
  }

  onChangeContactNum(e) {
    this.setState({
      contactNum: e.target.value,
    });
  }

  onChangeDob(e) {
    this.setState({
      dob: e.target.value,
    });
  }

  onChangeGender(e) {
    this.setState({
      gender: e.target.value,
    });
  }

  onChangeNationality(e) {
    this.setState({
      nationality: e.target.value,
    });
  }

  onChangeRace(e) {
    this.setState({
      race: e.target.value,
    });
  }

  onChangeBcAddress(e) {
    this.setState({
      bcAddress: e.target.value,
    });
  }

  allAdmins = async () => {
    const response = await fetch("http://localhost:8080/getAllAdmins");
    const jsonData = await response.json();
    this.setState({ admins: jsonData });
  };

  addNew = () => {
    this.setState({ showModal: true });
  };

  closeModal = () => {
    this.setState({ showModal: false });
  };

  regAdmin = async () => {
    const { accounts, contract } = this.state;

    const response = await contract.methods
      .registerAdmin(this.state.bcAddress)
      .send({ from: accounts[0] });
    return response;
  };

  handleRegisterAdmin(e) {
    e.preventDefault();
    this.setState({ successful: false });
    this.form.validateAll();

    if (this.checkBtn.context._errors.length === 0) {
      this.regAdmin()
        .then((res) => {
          if (res.events.registeredAdmin) {
            this.props
              .dispatch(
                registerAdmin(
                  this.state.roleId,
                  this.state.username,
                  this.state.email,
                  this.state.password,
                  this.state.firstName,
                  this.state.lastName,
                  this.state.contactNum,
                  this.state.dob,
                  this.state.gender,
                  this.state.nationality,
                  this.state.race,
                  this.state.bcAddress
                )
              )
              .then(() => {
                this.setState({ successful: true, showModal: false });
              })
              .catch(() => {
                this.setState({ successful: false });
              });
          }
        })
        .catch((err) => {
          console.log("Failed with error: " + err);
          console.log(err);
        });
    }
  }

  render() {
    const { message } = this.props;
    return (
      <Fragment>
        <header className="jumbotron">
          <h1> All Admins </h1>
          <h3> {this.state.content} </h3>
        </header>
        <button onClick={this.addNew}>Add new admin</button>

        <Modal
          isOpen={this.state.showModal}
          onRequestClose={this.closeModal}
          contentLabel="Add new Admin Modal"
        >
          <h1>Add new Admin</h1>
          <Form
            onSubmit={this.handleRegisterAdmin}
            ref={(c) => {
              this.form = c;
            }}
          >
            {!this.state.successful && (
              <div>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <Input
                    type="text"
                    className="form-control"
                    name="username"
                    value={this.state.username}
                    onChange={this.onChangeUsername}
                    validations={[required, vusername]}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <Input
                    type="text"
                    className="form-control"
                    name="email"
                    value={this.state.email}
                    onChange={this.onChangeEmail}
                    validations={[required, email]}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <Input
                    type="password"
                    className="form-control"
                    name="password"
                    value={this.state.password}
                    onChange={this.onChangePassword}
                    validations={[required, vpassword]}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <Input
                    type="firstName"
                    className="form-control"
                    name="firstName"
                    value={this.state.firstName}
                    onChange={this.onChangeFirstName}
                    validations={[required]}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <Input
                    type="lastName"
                    className="form-control"
                    name="lastName"
                    value={this.state.lastName}
                    onChange={this.onChangeLastName}
                    validations={[required]}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contactNum">Contact No</label>
                  <Input
                    type="contactNum"
                    className="form-control"
                    name="contactNum"
                    value={this.state.contactNum}
                    onChange={this.onChangeContactNum}
                    validations={[required]}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="dob">Date of Birth</label>
                  <Input
                    type="dob"
                    className="form-control"
                    name="dob"
                    value={this.state.dob}
                    onChange={this.onChangeDob}
                    placeholder="YYYYMMDD"
                    validations={[required]}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <Select
                    className="form-control"
                    name="gender"
                    value={this.state.gender}
                    onChange={this.onChangeGender}
                    validations={[required]}
                  >
                    <option value="">Select one</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </Select>
                </div>
                <div className="form-group">
                  <label htmlFor="nationality">Nationality</label>
                  <Select
                    className="form-control"
                    name="nationality"
                    value={this.state.nationality}
                    onChange={this.onChangeNationality}
                    validations={[required]}
                  >
                    <option value="">Select one</option>
                    {Nationalities.nationalities &&
                      Nationalities.nationalities.map((nationality) => {
                        return (
                          <option value={nationality}>{nationality}</option>
                        );
                      })}
                  </Select>
                </div>
                <div className="form-group">
                  <label htmlFor="race">Race</label>
                  <Select
                    className="form-control"
                    name="race"
                    value={this.state.race}
                    onChange={this.onChangeRace}
                    validations={[required]}
                  >
                    <option value="">Select one</option>
                    {Races.races &&
                      Races.races.map((race) => {
                        return <option value={race}>{race}</option>;
                      })}
                  </Select>
                </div>
                <div className="form-group">
                  <label htmlFor="bcAddress">Blockchain Address</label>
                  <Input
                    type="bcAddress"
                    className="form-control"
                    name="bcAddress"
                    value={this.state.bcAddress}
                    onChange={this.onChangeBcAddress}
                    validations={[required]}
                  />
                </div>
              </div>
            )}

            {message && (
              <div className="form-group">
                <div
                  className={
                    this.state.successful
                      ? "alert alert-success"
                      : "alert alert-danger"
                  }
                  role="alert"
                >
                  {message}
                </div>
              </div>
            )}

            <div className="">
              <button className="btn btn-primary btn-block">Submit</button>
            </div>
            <CheckButton
              style={{ display: "none" }}
              ref={(c) => {
                this.checkBtn = c;
              }}
            />
          </Form>
        </Modal>

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

function mapStateToProps(state) {
  const { message } = state.message;
  return {
    message,
  };
}

export default connect(mapStateToProps)(AllAdmins);
