const db = require("../models");
// const ROLES = db.ROLES;
const Role = db.role;
const User = db.user;

checkDuplicateUsernameOrEmail = (req, res, next) => {
    // Username
    User.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {
        if (user) {
            res.status(400).send({
                message: "Failed! Username is already in use!"
            });
            return;
        }

        // Email
        User.findOne({
            where: {
                email: req.body.email
            }
        }).then(user => {
            if (user) {
                res.status(400).send({
                    message: "Failed! Email is already in use!"
                });
                return;
            }

            next();
        });
    });
};

checkDuplicateContactNum = (req, res) => {
    // Contact Number
    User.findOne({
        where: {
            contact_num: req.body.contactNum
        }
    }).then(user => {
        if (user) {
            res.status(400).send({
                message: "Failed! Contact number is already in use!"
            });
            return;
        }

        next();
    });
};

checkRoleExisted = (req, res, next) => {
    if (req.body.Id) {
        if (!Role.findOne({ id: req.body.roleId })) {
            res.status(400).send({
                message: "Failed! Role does not exist = " + req.body.roleId
            });
            return;
        }
    }
    next();
};

const signup = {
    checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
    checkDuplicateContactNum: checkDuplicateContactNum,
    checkRoleExisted: checkRoleExisted
};

module.exports = signup;