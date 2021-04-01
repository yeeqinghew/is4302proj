var Users = artifacts.require("Users.sol");
var MedicalRecords = artifacts.require("MedicalRecords.sol");
const truffleAssertions = require("truffle-assertions");
const web3 = require("web3");

contract("MedicalRecords", accounts => {
    let usersInstance;
    let medicalRecordsInstance;
    const masterAdmin = accounts[0];
    const doctor1 = accounts[1];
    const doctor2 = accounts[2];
    const blacklistedDoctor = accounts[6];
    const patient1 = accounts[3];
    const patient2 = accounts[4];
    const outsider = accounts[5];

    before(async () => {
        usersInstance = await Users.deployed({from:masterAdmin});
        medicalRecordsInstance = await MedicalRecords.deployed(usersInstance.address, {from: masterAdmin});
        await usersInstance.registerDoctor(doctor1, {from: masterAdmin}); // doctorId = 0
        await usersInstance.registerDoctor(doctor2, {from: masterAdmin}); // doctorId = 1
        await usersInstance.registerDoctor(blacklistedDoctor, {from: masterAdmin}); // doctorId = 2
        await usersInstance.blacklistDoctor(2, {from: masterAdmin});
        await usersInstance.registerPatient({from: patient1}); // patientId = 0
        await usersInstance.registerPatient({from: patient2}); // patientId = 1
    });

    it('Test 1: Creating Records', async() => {
        let details = web3.utils.toHex("Patient has high fever");

        // Test 1A: Creating Records for invalid patient 
        try {
            result = await medicalRecordsInstance.createRecord(10, 0, details);
        } catch(error) {
            assert.include(error.message, "Patient does not exist.");
        }

        // Test 1B: Creating Records with invalid doctor
        try {
            result = await medicalRecordsInstance.createRecord(0, 5, details);
        } catch(error) {
            assert.include(error.message, "Doctor does not exist.");
        }

        // Test 1C: Creating Records with blacklisted doctor
        try {
            result = await medicalRecordsInstance.createRecord(0, 2, details);
        } catch(error) {
            assert.include(error.message, "Not authorised as doctor is blacklisted.");
        }
    });

});