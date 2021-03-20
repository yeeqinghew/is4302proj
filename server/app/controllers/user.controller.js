// exports.allAccess = (req, res) => {
//     res.status(200).send("Public Content.");
// };

exports.patientBoard = (req, res) => {
    res.status(200).send("Patient Content.");
};

exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
};

exports.healthcareProviderBoard = (req, res) => {
    res.status(200).send("Healthcare Provider Content.");
};

exports.financialInstitutionBoard = (req, res) => {
    res.status(200).send("Financial Institution Content.")
};

exports.doctorBoard = (req, res) => {
    res.status(200).send("Doctor Content.");
};

exports.nurseBoard = (req, res) => {
    res.status(200).send("Nurse Content.");
};

exports.healthcareAnalystBoard = (req, res) => {
    res.status(200).send("Healthcare Analyst Content.");
};