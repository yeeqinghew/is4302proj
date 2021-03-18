import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    await contract.methods.set(1).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ storageValue: response });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (

      <div style={{
        height: "100%",
        width: "100%",
        position: "absolute",
        top: "0px",
        background: "url('https://png.pngtree.com/thumb_back/fw800/back_our/20190621/ourmid/pngtree-health-medical-hospital-medicine-blue-banner-advertisement-image_177364.jpg') no-repeat center center fixed",
        backgroundSize: "cover"
      }}>
        <link
          rel="stylesheet"
          href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
          integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh"
          crossorigin="anonymous"
        />
        <form autoComplete="off" style={{ maxWidth: "280px", margin: "200px auto 10px" }}>
          <h1 style={{ fontWeight: "bold", color: "#fff", textAlign: "center" }}>Login</h1>
          <input
            type="email"
            name="email"
            placeholder="email"
            // value={email}
            // onChange={(e) => onChange(e)}
            className="form-control my-3"
            style={{
              position: "relative",
              fontSize: "16px",
              height: "auto",
              padding: "10px",
              marginBottom: "-1px",
              borderTop: "1px solid transparent",
              borderRight: "1px solid transparent",
              borderLeft: "1px solid transparent",
              borderRadius: "3px 3px 0px 0px",
              boxShadow: "none"
            }}
          />
          <input
            type="password"
            name="password"
            // value={password}
            placeholder="password"
            // onChange={(e) => onChange(e)}
            className="form-control my-3"
            style={{
              zIndex: "2",
              marginBottom: "20px",
              borderTop: "none",
              borderBottom: "1px solid transparent",
              borderRight: "1px solid transparent",
              borderLeft: "1px solid transparent",
              borderRadius: "0px 0px 3px 3px",
              boxShadow: "inset 0 1px 1px rgba(0,0,0,0.075)"
            }}
          />
          <button className="btn btn-lg btn-primary btn-block" style={{ fontWeight: "bold", borderRadius: "3px", border: "none", marginBottom: "10px" }}>Submit</button>
          {/* <Link to="/register" style={{
            fontWeight: "bold",
            color: "#fff",
            fontSize: "14px",
            margin: "110px"
          }}>Register</Link> */}
        </form>
      </div>
      // <div className="App">
      //   <h1>Good to Go!</h1>
      //   <p>Your Truffle Box is installed and ready.</p>
      //   <h2>Smart Contract Example</h2>
      //   <p>
      //     If your contracts compiled and migrated successfully, below will show
      //     a stored value of 5 (by default).
      //   </p>
      //   <p>
      //     Try changing the value stored on <strong>line 40</strong> of App.js.
      //   </p>
      //   <div>The stored value is: {this.state.storageValue}</div>
      // </div>
    );
  }
}

export default App;
