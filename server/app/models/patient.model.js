module.exports = (sequelize, Sequelize) => {
    const Patient = sequelize.define("patients", {
        nric: {
            type: Sequelize.STRING
        },
        home_address: {
            type: Sequelize.STRING
        },
        emergency_contact: {
            type: Sequelize.STRING
        },
    });

    return Patient;
};