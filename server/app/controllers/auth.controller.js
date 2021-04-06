const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const Patient = db.patient;
const Doctor = db.doctor;
const Admin = db.admin;
const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
// const { patient } = require("../models");

exports.signup = (req, res) => {
  var YEAR = req.body.dob.substring(0, 4);
  var MONTH = req.body.dob.substring(4, 6) - 1;
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
      race: req.body.race,
      bc_address: req.body.bcAddress,
    })
      .then((user) => {
        Patient.create(
          {
            nric: req.body.nric,
            home_address: req.body.homeAddress,
            emergency_contact: req.body.emergencyContact,
            users: user,
          },
          {
            include: [Patient.user],
          }
        ).then((patient) => {
          if (req.body.roleId) {
            Role.findOne({
              where: {
                id: req.body.roleId,
              },
            }).then((roleId) => {
              patient
                .setUser(user.userId)
                .then(() => {
                  console.log("Successful");
                  // res.send({ message: "User was registered successfully!" });
                })
                .then(() => {
                  user.setRole(roleId).then(() => {
                    console.log("Successful");
                    // res.send({ message: "User was registered successfully!" });
                  });
                })
                .then(() => {
                  res.send({ message: "User was registered successfully!" });
                });
            });
          }
        });

        // if (req.body.roleId) {
        //     Role.findOne({
        //         where: {
        //             id: req.body.roleId
        //         }
        //     }).then(roleId => {
        //         user.setRole(roleId).then(() => {
        //             console.log("Successful");
        //             res.send({ message: "User was registered successfully!" });
        //         })
        //     })
        // }
      })
      .catch((err) => {
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
      race: req.body.race,
      bc_address: req.body.bcAddress,
    })
      .then((user) => {
        Doctor.create(
          {
            specialty: req.body.specialty,
            healthcare_institution: req.body.healthcareInstitution,
            users: user,
          },
          {
            include: [Doctor.user],
          }
        ).then((doctor) => {
          if (req.body.roleId) {
            Role.findOne({
              where: {
                id: req.body.roleId,
              },
            }).then((roleId) => {
              doctor
                .setUser(user.userId)
                .then(() => {
                  console.log("Successful");
                  // res.send({ message: "User was registered successfully!" });
                })
                .then(() => {
                  user.setRole(roleId).then(() => {
                    console.log("Successful");
                  });
                })
                .then(() => {
                  res.send({ message: "User was registered successfully!" });
                });
            });
          }
        });
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  }
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username,
    },
  })
    .then((user) => {
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
          message: "Invalid Password!",
        });
      }

      var token = jwt.sign({ id: user.userId }, config.secret, {
        expiresIn: 86400, // 24 hours
      });

      user.getRole().then((role) => {
        if (role.dataValues.name === "patient") {
          Patient.findOne({
            where: {
              userId: user.userId,
            },
          }).then((patient) => {
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
              bc_address: user.bc_address,
              nric: patient.nric,
              home_address: patient.home_address,
              emergency_contact: patient.emergency_contact,
              accessToken: token,
            });
          });
        } else if (role.dataValues.name === "doctor") {
          Doctor.findOne({
            where: {
              userId: user.userId,
            },
          }).then((doctor) => {
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
              bc_address: user.bc_address,
              specialty: doctor.specialty,
              healthcare_institution: doctor.healthcare_institution,
              approved: doctor.approved,
              accessToken: token,
            });
          });
        } else {
          Admin.findOne({
            where: {
              userId: user.userId,
            },
          }).then((admin) => {
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
              bc_address: user.bc_address,
              date_joined: admin.date_joined,
              accessToken: token,
            });
          });
        }
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
