import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Router, Switch, Route, Link } from "react-router-dom";

// import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import NavDropdown from 'react-bootstrap/NavDropdown';

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";

// admin
import BoardAdmin from "./components/Admin/BoardAdmin";
import AllDoctors from "./components/Admin/AllDoctors";

// patient
import BoardPatient from "./components/BoardPatient";

// doctor
import BoardDoctor from "./components/Doctor/BoardDoctor";
import NewRecord from "./components/Doctor/NewRecord";

import { logout } from "./actions/auth";
import { clearMessage } from "./actions/message";

import { history } from "./helpers/history";

// sol
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";

class App extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);

    this.state = {
      showAdminBoard: false,
      showPatientBoard: false,
      showDoctorBoard: false,
      currentUser: undefined,
      storageValue: 0,
      web3: null,
      accounts: null,
      contract: null,
    };

    history.listen((location) => {
      props.dispatch(clearMessage()); // clear message when changing location
    });
  }

  componentDidMount = async () => {
    const user = this.props.user;

    if (user) {
      this.setState({
        currentUser: user,
        showAdminBoard: user.role === "admin",
        showDoctorBoard: user.role === "doctor",
        showPatientBoard: user.role === "patient",
      });
    }

    // try {
    //   // Get network provider and web3 instance.
    //   const web3 = await getWeb3();
    //   console.log("web3: ", web3);

    //   // Use web3 to get the user's accounts.
    //   const accounts = await web3.eth.getAccounts();
    //   console.log("Accounts: ", accounts);

    //   // Get the contract instance.
    //   const networkId = await web3.eth.net.getId();
    //   console.log("Network ID: ", networkId);
    //   const deployedNetwork = SimpleStorageContract.networks[networkId];
    //   console.log("DeployedNetwork: ", deployedNetwork);
    //   const instance = new web3.eth.Contract(
    //     SimpleStorageContract.abi,
    //     deployedNetwork && deployedNetwork.address,
    //   );

    //   // Set web3, accounts, and contract to the state, and then proceed with an
    //   // example of interacting with the contract's methods.
    //   this.setState({ web3, accounts, contract: instance }, this.runExample);
    // } catch (error) {
    //   // Catch any errors for any of the above operations.
    //   alert(
    //     `Failed to load web3, accounts, or contract. Check console for details.`,
    //   );
    //   console.error(error);
    // }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    await contract.methods.set(2).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();
    console.log("response: ", response);
    // Update state with the result.
    this.setState({ storageValue: response });
  };

  logOut() {
    this.props.dispatch(logout());
  }

  render() {
    const {
      currentUser,
      showPatientBoard,
      showAdminBoard,
      showDoctorBoard,
    } = this.state;

    return (
      <Router history={history}>
        <div>
          <nav className="navbar navbar-expand navbar-dark bg-dark">
            <Link to={"/"} className="navbar-brand">
              IS4302
            </Link>
            <div className="navbar-nav mr-auto">
              {showPatientBoard && (
                <li className="nav-item">
                  <Link to={"/patient"} className="nav-link">
                    Patient Board
                  </Link>
                </li>
              )}
              {showAdminBoard && (
                <Fragment>
                  <li className="nav-item">
                    <Link to={"/admin"} className="nav-link">
                      Admin Board
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to={"/allDoctors"} className="nav-link">
                      All Doctors
                    </Link>
                  </li>
                </Fragment>
              )}
              {showDoctorBoard && (
                <Fragment>
                  <li className="nav-item">
                    <Link to={"/doctor"} className="nav-link">
                      Doctor Board
                  </Link>
                  </li>
                  <li className="nav-item">
                    <Link to={"/newRecord"} className="nav-link">
                      New Record
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to={"/flaggedRecords"} className="nav-link">
                      Flagged Records
                    </Link>
                  </li>
                  {/* <NavDropdown title="Medical Records" id="nav-dropdown">
                    <NavDropdown.Item eventKey="4.1">Flagged Records</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item eventKey="4.2">New Record</NavDropdown.Item>
                  </NavDropdown> */}
              </Fragment>
              
              )}
            </div>
            {currentUser ? (
              <div className="navbar-nav ml-auto">
                <li className="nav-item">
                  <Link to={"/dashboard"} className="nav-link">
                    {currentUser.username}
                  </Link>
                </li>
                <li className="nav-item">
                  <a href="/login" className="nav-link" onClick={this.logOut}>
                    LogOut
                  </a>
                </li>
              </div>
            ) : (
              <div className="navbar-nav ml-auto">
                <li className="nav-item">
                  <Link to={"/login"} className="nav-link">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to={"/register"} className="nav-link">
                    Sign Up
                  </Link>
                </li>
              </div>
            )}
          </nav>
          <div className="container mt-3">
            <Switch>
              {/* <Route exact path={["/", "/"]} component={Home} /> */}
              <Route exact path={["/", "/login"]} component={Login} />
              {/* <Route exact path="/login" component={Login} /> */}
              <Route exact path="/register" component={Register} />
              <Route exact path="/dashboard" component={Dashboard} />
              <Route path="/patient" component={BoardPatient} />
              <Route path="/admin" component={BoardAdmin} />
              <Route path="/allDoctors" component={AllDoctors} />
              <Route path="/doctor" component={BoardDoctor} />
              <Route path="/newRecord" component={NewRecord} />
              <Route path="/flaggedRecords" component={BoardDoctor} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

function mapStateToProps(state) {
  const { user } = state.auth;
  return {
    user,
  };
}

export default connect(mapStateToProps)(App);
