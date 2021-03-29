module.exports = (sequelize, Sequelize) => {
    const Admin = sequelize.define("admins", {
        date_joined: {
            type: Sequelize.DATE
        }
    });

    return Admin;
};