import React, { Component } from "react";
import { connect } from "react-redux";
import { Router, Switch, Route, Link } from "react-router-dom";

// import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import BoardAdmin from "./components/BoardAdmin";
import BoardPatient from "./components/BoardPatient";
import BoardHealthcareProvider from "./components/BoardHealthcareProvider";
import BoardFinancialInstitution from "./components/BoardFinancialInstitution";
import BoardDoctor from "./components/BoardDoctor";
import BoardNurse from "./components/BoardNurse";
import BoardHealthcareAnalyst from "./components/BoardHealthcareAnalyst";

import { logout } from "./actions/auth";
import { clearMessage } from "./actions/message";

import { history } from './helpers/history';

class App extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);

    this.state = {
      showAdminBoard: false,
      showPatientBoard: false,
      showHealthcareProviderBoard: false,
      showFinancialInstitutionBoard: false,
      showDoctorBoard: false,
      showNurseBoard: false,
      showHealthcareAnalystBoard: false,
      currentUser: undefined,
    };

    history.listen((location) => {
      props.dispatch(clearMessage()); // clear message when changing location
    });
  }

  componentDidMount() {
    const user = this.props.user;
    console.log("userrrr", user);

    if (user) {
      this.setState({
        currentUser: user,
        showAdminBoard: user.role === "admin",
        showHealthcareProviderBoard: user.role === "healthcare_provider",
        showFinancialInstitutionBoard: user.role === "financial_institution",
        showDoctorBoard: user.role === "doctor",
        showNurseBoard: user.role === "nurse",
        showHealthcareAnalystBoard: user.role === "healthcare_analyst",
        showPatientBoard: user.role === "patient"
      });
    }
  }

  logOut() {
    this.props.dispatch(logout());
  }

  render() {
    const { currentUser, showPatientBoard, showAdminBoard, showHealthcareProviderBoard, showDoctorBoard, showNurseBoard, showFinancialInstitutionBoard, showHealthcareAnalystBoard } = this.state;

    return (
      <Router history={history}>
        <link
          rel="stylesheet"
          href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
          integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh"
          crossorigin="anonymous"
        />
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
                <li className="nav-item">
                  <Link to={"/admin"} className="nav-link">
                    Admin Board
                </Link>
                </li>
              )}

              {showHealthcareProviderBoard && (
                <li className="nav-item">
                  <Link to={"/healthcareProvider"} className="nav-link">
                    Healthcare Provider Board
                </Link>
                </li>
              )}

              {showFinancialInstitutionBoard && (
                <li className="nav-item">
                  <Link to={"/financialInstitution"} className="nav-link">
                    Financial Institution Board
                </Link>
                </li>
              )}

              {showDoctorBoard && (
                <li className="nav-item">
                  <Link to={"/doctor"} className="nav-link">
                    Doctor Board
                </Link>
                </li>
              )}

              {showNurseBoard && (
                <li className="nav-item">
                  <Link to={"/nurse"} className="nav-link">
                    Nurse Board
                </Link>
                </li>
              )}

              {showHealthcareAnalystBoard && (
                <li className="nav-item">
                  <Link to={"/healthcareAnalyst"} className="nav-link">
                    healthcare Analyst Board
                </Link>
                </li>
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
              <Route path="/healthcareProvider" component={BoardHealthcareProvider} />
              <Route path="/financialInstitution" component={BoardFinancialInstitution} />
              <Route path="/doctor" component={BoardDoctor} />
              <Route path="/nurse" component={BoardNurse} />
              <Route path="/healthcareAnalyst" component={BoardHealthcareAnalyst} />
            </Switch>
          </div>
        </div>
      </Router >
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

// // import React, { Component } from "react";
// // import SimpleStorageContract from "./contracts/SimpleStorage.json";
// // import getWeb3 from "./getWeb3";
// import React, { useState, useEffect, Fragment } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Router, Switch, Route, Link } from "react-router-dom";

// // import "bootstrap/dist/css/bootstrap.min.css";
// import "./App.css";

// import Login from "./components/Login";
// import Register from "./components/Register";
// import Dashboard from "./components/Dashboard";
// import BoardAdmin from "./components/BoardAdmin";
// import BoardPatient from "./components/BoardPatient";
// import BoardHealthcareProvider from "./components/BoardHealthcareProvider";
// import BoardFinancialInstitution from "./components/BoardFinancialInstitution";
// import BoardDoctor from "./components/BoardDoctor";
// import BoardNurse from "./components/BoardNurse";
// import BoardHealthcareAnalyst from "./components/BoardHealthcareAnalyst";


// import { logout } from "./actions/auth";
// import { clearMessage } from "./actions/message";

// import { history } from "./helpers/history";
// import "./App.css";
// import AllPatients from "./components/AllPatients";

// // import Login from "./components/Login";

// const App = () => {
//   // state = { storageValue: 0, web3: null, accounts: null, contract: null };

//   // componentDidMount = async () => {
//   //   try {
//   //     // Get network provider and web3 instance.
//   //     const web3 = await getWeb3();

//   //     // Use web3 to get the user's accounts.
//   //     const accounts = await web3.eth.getAccounts();

//   //     // Get the contract instance.
//   //     const networkId = await web3.eth.net.getId();
//   //     const deployedNetwork = SimpleStorageContract.networks[networkId];
//   //     const instance = new web3.eth.Contract(
//   //       SimpleStorageContract.abi,
//   //       deployedNetwork && deployedNetwork.address,
//   //     );

//   //     // Set web3, accounts, and contract to the state, and then proceed with an
//   //     // example of interacting with the contract's methods.
//   //     this.setState({ web3, accounts, contract: instance }, this.runExample);
//   //   } catch (error) {
//   //     // Catch any errors for any of the above operations.
//   //     alert(
//   //       `Failed to load web3, accounts, or contract. Check console for details.`,
//   //     );
//   //     console.error(error);
//   //   }
//   // };

//   // runExample = async () => {
//   //   const { accounts, contract } = this.state;

//   //   // Stores a given value, 5 by default.
//   //   await contract.methods.set(1).send({ from: accounts[0] });

//   //   // Get the value from the contract to prove it worked.
//   //   const response = await contract.methods.get().call();

//   //   // Update state with the result.
//   //   this.setState({ storageValue: response });
//   // };

//   const [showAdminBoard, setShowAdminBoard] = useState(false);
//   const [showPatientBoard, setShowPatientBoard] = useState(false);
//   const [showHealthcareProviderBoard, setShowHealthcareProviderBoard] = useState(false);
//   const [showFinancialInstitutionBoard, setShowFinancialInstitutionBoard] = useState(false);
//   const [showDoctoBoard, setShowDoctorBoard] = useState(false);
//   const [showNurseBoard, setShowNurseBoard] = useState(false);
//   const [showHealthcareAnalystBoard, setShowHealthcareAnalystBoard] = useState(false);

//   const { user: currentUser } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     history.listen((location) => {
//       dispatch(clearMessage()); // clear message when changing location
//     });
//   }, [dispatch]);

//   useEffect(() => {
//     if (currentUser) {
//       setShowAdminBoard(currentUser.role === "admin");
//       setShowHealthcareProviderBoard(currentUser.role === "healthcare_provider");
//       setShowFinancialInstitutionBoard(currentUser.role === "financial_institution");
//       setShowDoctorBoard(currentUser.role === "doctor");
//       setShowNurseBoard(currentUser.role === "nurse");
//       setShowHealthcareAnalystBoard(currentUser.role === "healthcare_analyst");
//       setShowPatientBoard(currentUser.role === "patient");

//     }
//   }, [currentUser]);

//   const logOut = () => {
//     dispatch(logout());
//   };

//   // render() {
//   // if (!this.state.web3) {
//   //   return <div>Loading Web3, accounts, and contract...</div>;
//   // }
//   return (
//     <Router history={history}>
//       <link
//         rel="stylesheet"
//         href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
//         integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh"
//         crossorigin="anonymous"
//       />
//       <div>
//         <nav className="navbar navbar-expand navbar-dark bg-dark">
//           <Link to={"/"} className="navbar-brand">
//             IS4302
//           </Link>
//           <div className="navbar-nav mr-auto">
//             {showPatientBoard && (
//               <Fragment> <li className="nav-item">
//                 <Link to={"/patient"} className="nav-link">
//                   Patient Board
//                 </Link>
//               </li>
//                 <li className="nav-item">
//                   <Link to={"/all"} className="nav-link">
//                     All
//                 </Link>
//                 </li>
//               </Fragment>
//             )}

//             {showAdminBoard && (
//               <Fragment>
//                 <li className="nav-item">
//                   <Link to={"/admin"} className="nav-link">
//                     Admin Board
//                 </Link>
//                 </li>
//                 <li className="nav-item">
//                   <Link to={"/allPatients"} className="nav-link">
//                     All patients
//                   </Link>
//                 </li>
//               </Fragment>
//             )}

//             {showHealthcareProviderBoard && (
//               <li className="nav-item">
//                 <Link to={"/healthcareProvider"} className="nav-link">
//                   healthcareProvider Board
//                 </Link>
//               </li>
//             )}

//             {showFinancialInstitutionBoard && (
//               <li className="nav-item">
//                 <Link to={"/financialInstitution"} className="nav-link">
//                   Financial Institution Board
//                 </Link>
//               </li>
//             )}

//             {showDoctoBoard && (
//               <li className="nav-item">
//                 <Link to={"/doctor"} className="nav-link">
//                   Doctor Board
//                 </Link>
//               </li>
//             )}

//             {showNurseBoard && (
//               <li className="nav-item">
//                 <Link to={"/nurse"} className="nav-link">
//                   Nurse Board
//                 </Link>
//               </li>
//             )}

//             {showHealthcareAnalystBoard && (
//               <li className="nav-item">
//                 <Link to={"/healthcareProvider"} className="nav-link">
//                   healthcare Provider Board
//                 </Link>
//               </li>
//             )}
//           </div>

//           {currentUser ? (
//             <div className="navbar-nav ml-auto">
//               <li className="nav-item">
//                 <Link to={"/dashboard"} className="nav-link">
//                   {currentUser.username}
//                 </Link>
//               </li>
//               <li className="nav-item">
//                 <a href="/login" className="nav-link" onClick={logOut}>
//                   LogOut
//                 </a>
//               </li>
//             </div>
//           ) : (
//             <div className="navbar-nav ml-auto">
//               <li className="nav-item">
//                 <Link to={"/login"} className="nav-link">
//                   Login
//                 </Link>
//               </li>

//               <li className="nav-item">
//                 <Link to={"/register"} className="nav-link">
//                   Sign Up
//                 </Link>
//               </li>
//             </div>
//           )}
//         </nav>

//         <div className="container mt-3">
//           <Switch>
//             {/* <Route exact path={["/", "/"]} component={Home} /> */}
//             <Route exact path={["/", "/login"]} component={Login} />
//             {/* <Route exact path="/login" component={Login} /> */}
//             <Route exact path="/register" component={Register} />
//             <Route exact path="/dashboard" component={Dashboard} />
//             <Route path="/patient" component={BoardPatient} />
//             <Route path="/admin" component={BoardAdmin} />
//             <Route path="/allPatients" component={AllPatients} />
//             <Route path="/healthcareProvider" component={BoardHealthcareProvider} />
//             <Route path="/financialInstitution" component={BoardFinancialInstitution} />
//             <Route path="/doctor" component={BoardDoctor} />
//             <Route path="/nurse" component={BoardNurse} />
//             <Route path="/healthcareAnalyst" component={BoardHealthcareAnalyst} />
//           </Switch>
//         </div>
//       </div>
//     </Router>
//     // <div className="App">  <Login /></div>

//     // <div className="App">
//     //   <h1>Good to Go!</h1>
//     //   <p>Your Truffle Box is installed and ready.</p>
//     //   <h2>Smart Contract Example</h2>
//     //   <p>
//     //     If your contracts compiled and migrated successfully, below will show
//     //     a stored value of 5 (by default).
//     //   </p>
//     //   <p>
//     //     Try changing the value stored on <strong>line 40</strong> of App.js.
//     //   </p>
//     //   <div>The stored value is: {this.state.storageValue}</div>
//     // </div>
//   );
// };

// export default App;
