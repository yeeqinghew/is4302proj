const config = require("../config/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
    config.DB,
    config.USER,
    config.PASSWORD,
    {
        host: config.HOST,
        dialect: config.dialect,
        operatorsAliases: false,

        pool: {
            max: config.pool.max,
            min: config.pool.min,
            acquire: config.pool.acquire,
            idle: config.pool.idle
        }
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.patient = require("../models/patient.model.js")(sequelize, Sequelize);
db.doctor = require("../models/doctor.model.js")(sequelize, Sequelize);
db.admin = require("../models/admin.model.js")(sequelize, Sequelize);
// this will be the DATABASE Schema

// role can be owned by multiple user
db.role.hasMany(db.user, {
    as: "users"
});
// user can have only ONE role
db.user.belongsTo(db.role, {
    as: "role",
    foreignKey: "roleId" //add "roleId" attribute to User
});

// user can only be owned by ONE patient
db.user.hasOne(db.patient, {
    as: "patient",
    foreignKey: "userId"
});
// patient belongs to ONE user
db.patient.user = db.patient.belongsTo(db.user, {
    as: "user",
    foreignKey: "userId" //add "userId" attribute to Patient
});

// user can only be owned by ONE doctor
db.user.hasOne(db.doctor, {
    as: "doctor",
    foreignKey: "userId"
});
// doctor belongs to ONE user
db.doctor.user = db.doctor.belongsTo(db.user, {
    as: "user",
    foreignKey: "userId" //add "userId" attribute to Doctor
});

// user can only be owned by ONE admin
db.user.hasOne(db.admin, {
    as: "admin",
    foreignKey: "userId"
});
// admin belongs to ONE user
db.admin.user = db.admin.belongsTo(db.user, {
    as: "user",
    foreignKey: "userId" //add "userId" attribute to Admin
});

db.ROLES = ["patient", "doctor", "admin"];
module.exports = db;