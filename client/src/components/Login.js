
import React, { Component } from "react";

class Login extends Component {
    componentDidMount = async () => {

    }
    render() {
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
            </div >
        )
    }
}
export default Login;