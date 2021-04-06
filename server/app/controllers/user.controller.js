const db = require("../models");
const User = db.user;
const Role = db.role;
const Patient = db.patient;

exports.patientBoard = (req, res) => {
    res.status(200).send("Patient Content.");
};

exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
};

exports.doctorBoard = (req, res) => {
    res.status(200).send("Doctor Content.");
};

exports.patientByNric = (req, res) => {
    Patient.findOne({
        where: {
            nric: req.body.nric
        }
    }).then((patient) => {
        if (!patient) {
            return res.status(404).send({ message: "Patient Not found." });
        }

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
            patientId: patient.id,
            nric: patient.nric,
            home_address: patient.home_address,
            emergency_contact: patient.emergency_contact
        });
    }).catch(err => {
        res.status(500).send({ message: err.message });
    });
};