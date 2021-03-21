import React, { useState, useEffect } from "react";

import UserService from "../services/user.service";

const AllPatients = () => {
    const [content, setContent] = useState("");

    useEffect(() => {
        UserService.getAdminBoard().then(
            (response) => {
                setContent(response.data);
            },
            (error) => {
                const _content =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();

                setContent(_content);
            }
        );
    }, []);

    return (
        <div className="container">
            <header className="jumbotron">
                <h3>All Patients</h3>
                <p>Testing testing</p>
                <p>{content}</p>
            </header>
        </div>
    );
};

export default AllPatients;