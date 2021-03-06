module.exports = (sequelize, Sequelize) => {
    const Doctor = sequelize.define("doctors", {
        specialty: {
            type: Sequelize.STRING
        },
        healthcare_institution: {
            type: Sequelize.STRING
        },
        approved: {
            type: Sequelize.BOOLEAN,
            defaultValue: '0'
        },
        // numOfServedPatients: {
        //     type: Sequelize.INTEGER,
        //     defaultValue: 0
        // },
        reputation_score: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    });

    return Doctor;
};