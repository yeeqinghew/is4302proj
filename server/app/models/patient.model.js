module.exports = (sequelize, Sequelize) => {
    const Patient = sequelize.define("patients", {
        username: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        }
    });

    return User;
};