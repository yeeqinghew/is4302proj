module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
        userId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: Sequelize.STRING,
            allowNull: false,
            // unique: true
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        first_name: {
            type: Sequelize.STRING
        },
        last_name: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false
        },
        contact_num: {
            type: Sequelize.STRING
        },
        dob: {
            type: Sequelize.DATEONLY
        },
        gender: {
            type: Sequelize.STRING
        },
        nationality: {
            type: Sequelize.STRING
        },
        race: {
            type: Sequelize.STRING
        },
        bc_address: {
            type: Sequelize.STRING,
            // allowNull: false
        }
    });

    return User;
};