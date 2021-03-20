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

// this will be the DATABASE Schema

// role can be owned by multiple user
db.role.hasMany(db.user, {
    as: "users"
});
// user can have only ONE role
db.user.belongsTo(db.role, {
    as: "role",
    foreignKey: "roleId"
});

db.ROLES = ["patient", "admin", "healthcare_provider", "financial_institution", "doctor", "nurse", "healthcare_analyst"];
module.exports = db;