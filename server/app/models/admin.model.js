module.exports = (sequelize, Sequelize) => {
    const Admin = sequelize.define("admins", {
        date_joined: {
            type: Sequelize.DATEONLY,
            defaultValue: Sequelize.NOW
        }
    });

    return Admin;
};