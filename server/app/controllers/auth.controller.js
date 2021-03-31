const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const Patient = db.patient;
const Doctor = db.doctor;
const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
// const { patient } = require("../models");

exports.signup = (req, res) => {
    var YEAR = req.body.dob.substring(0, 4);
    var MONTH = req.body.dob.substring(4, 6);
    var DATE = req.body.dob.substring(6, 8);


    // Save Patient to Database
    if (req.body.roleId === "2") {
        User.create({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            contact_num: req.body.contactNum,
            dob: new Date(YEAR, MONTH, DATE),
            gender: req.body.gender,
            nationality: req.body.nationality,
            race: req.body.race
        }).then(user => {
            console.log("#### red body nric: ", req.body.nric);
            console.log("#### user", user);
            Patient.create({
                nric: req.body.nric,
                home_address: req.body.homeAddress,
                emergency_contact: req.body.emergencyContact,
                user: user
            }, {
                include: [Patient.user]
            })

            // console.log("********User", user)
            if (req.body.roleId) {
                Role.findOne({
                    where: {
                        id: req.body.roleId
                    }
                }).then(roleId => {
                    // console.log("Found Role:::::::::", roleId);
                    user.setRole(roleId).then(() => {
                        console.log("Successful");
                        res.send({ message: "User was registered successfully!" });
                    })
                })
            }
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
    }


    // Save User to Database
    if (req.body.roleId === "3") {
        User.create({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            contact_num: req.body.contactNum,
            dob: new Date(YEAR, MONTH, DATE),
            gender: req.body.gender,
            nationality: req.body.nationality,
            race: req.body.race
        }).then(user => {
            Doctor.create({
                specialty: req.body.specialty,
                healthcare_institution: req.body.healthcareInstitution,
                user: user
            }, {
                include: [Doctor.user]
            });

            // console.log("********User", user)
            if (req.body.roleId) {
                Role.findOne({
                    where: {
                        id: req.body.roleId
                    }
                }).then(roleId => {
                    // console.log("Found Role:::::::::", roleId);
                    user.setRole(roleId).then(() => {
                        console.log("Successful");
                        res.send({ message: "User was registered successfully!" });
                    });
                })
            }
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
    }
};

exports.signin = (req, res) => {
    User.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }

        var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password!"
            });
        }

        var token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 86400 // 24 hours
        });


        user.getRole().then(role => {
            if (role === "patient") {

                res.status(200).send({
                    id: user.userId,
                    username: user.username,
                    email: user.email,
                    role: role.name,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    contact_num: user.contact_num,
                    dob: user.dob,
                    gender: user.gender,
                    nationality: user.nationality,
                    race: user.race,
                    nric: user.nric,
                    home_address: user.home_address,
                    emergency_contact: user.emergency_contact,
                    accessToken: token
                });
            } else if (role === "doctor") {
                res.status(200).send({
                    id: user.userId,
                    username: user.username,
                    email: user.email,
                    role: role.name,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    contact_num: user.contact_num,
                    dob: user.dob,
                    gender: user.gender,
                    nationality: user.nationality,
                    race: user.race,
                    specialty: user.specialty,
                    financial_institution: user.financial_institution,
                    accessToken: token
                });
            } else {
                res.status(200).send({
                    id: user.userId,
                    username: user.username,
                    email: user.email,
                    role: role.name,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    contact_num: user.contact_num,
                    dob: user.dob,
                    gender: user.gender,
                    nationality: user.nationality,
                    race: user.race,
                    accessToken: token
                });
            }
        });
    })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};