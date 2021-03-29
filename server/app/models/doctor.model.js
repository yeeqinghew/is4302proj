module.exports = (sequelize, Sequelize) => {
    const Doctor = sequelize.define("doctors", {
        specialty: {
            type: Sequelize.STRING
        },
        hospital: {
            type: Sequelize.STRING
        },
        numOfServedPatients: {
            type: Sequelize.INTEGER
        },
        reputation_score: {
            type: Sequelize.INTEGER
        },
        date_joined: {
            type: Sequelize.DATE
        }
    });

    return Doctor;
};