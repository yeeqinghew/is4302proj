const db = require("../models");
const User = db.user;
const Role = db.role;
const Patient = db.patient;
const Doctor = db.doctor;

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
    User.findOne({
        where: {
            '$patient.nric$': req.body.nric,
        },
        include: [
            {model: Patient, as: "patient"}
        ]
    }).then((user) => {
        if (!user) {
            return res.status(404).send({ message: "Patient Not found." });
        }

        // console.log("user", res.json(user));

        res.status(200).send({
            id: user.userId,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            contact_num: user.contact_num,
            dob: user.dob,
            gender: user.gender,
            nationality: user.nationality,
            race: user.race,
            bc_address: user.bc_address,
            patientId: user.patient.id,
            nric: user.patient.nric,
            home_address: user.patient.home_address,
            emergency_contact: user.patient.emergency_contact
        });
    })
};

exports.patientById = (req, res) => {
    User.findOne({
        where: {
            '$patient.id$': req.body.id,
        },
        include: [
            {model: Patient, as: "patient"}
        ]
    }).then((user) => {
        if (!user) {
            return res.status(404).send({ message: "Patient Not found." });
        }

        // console.log("user", res.json(user));

        res.status(200).send({
            id: user.userId,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            contact_num: user.contact_num,
            dob: user.dob,
            gender: user.gender,
            nationality: user.nationality,
            race: user.race,
            bc_address: user.bc_address,
            patientId: user.patient.id,
            nric: user.patient.nric,
            home_address: user.patient.home_address,
            emergency_contact: user.patient.emergency_contact
        });
    })
};

exports.doctorById = (req, res) => {
    User.findOne({
        where: {
            '$doctor.id$': req.body.id,
        },
        include: [
            {model: Doctor, as: "doctor"}
        ]
    }).then((user) => {
        if (!user) {
            return res.status(404).send({ message: "Doctor Not found." });
        }

        // console.log("user", res.json(user));

        res.status(200).send({
            id: user.userId,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            contact_num: user.contact_num,
            dob: user.dob,
            gender: user.gender,
            nationality: user.nationality,
            race: user.race,
            bc_address: user.bc_address,
            doctorId: user.doctor.id,
            specialty: user.doctor.specialty,
            healthcare_institution: user.doctor.healthcare_institution,
            approved: user.doctor.approved
        });
    })
};