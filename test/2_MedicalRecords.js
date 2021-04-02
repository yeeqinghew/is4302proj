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
    let result;
    let stringdetails;
    let details;

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
        stringdetails = "Patient has high fever" //, prescribed Acetaminophen
        details = web3.utils.toHex(stringdetails);

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
            assert.include(error.message, "revert", "Not authorised as doctor is blacklisted.");
        }

        // Test 1D: Successful creation of records
        result = await medicalRecordsInstance.createRecord(0, 0, details);
        truffleAssertions.eventEmitted(result, 'createdMedicalRecord', (ev) => {
            return ev.medicalRecordId == 0
        }); 
    });

    it('Test 2: Viewing Medical Records', async() => {
        let stringdetails = "Patient has high fever, prescribed Acetaminophen"
        let details = web3.utils.toHex(stringdetails);

        // Test 2A: Viewing invalid record
        try {
            result = await medicalRecordsInstance.viewRecord(5);
        } catch(error) {
            assert.include(error.message, "Medical record does not exist.");
        }

        // Test 2B: Viewing valid record without being the patient itself
        try {
            result = await medicalRecordsInstance.viewRecord(0, {from: patient2});
        } catch(error) {
            assert.include(error.message, "Medical record does not belong to this patient.");
        }

        // Test 2C:  Admin viewing valid record 
        try {
            result = await medicalRecordsInstance.viewRecord(0, {from: masterAdmin});
        } catch(error) {
            assert.include(error.message, "Not patient, doctor or admin, not authorised.");
        }

        // Test 2D: Blacklisted doctor viewing valid record
        try {
            result = await medicalRecordsInstance.viewRecord(0, {from: blacklistedDoctor});
        } catch(error) {
            assert.include(error.message, "Not authorised as doctor is blacklisted.");
        }

        /* Test 2E: Retrieving medical record
        Need to review this, either the sol code got problem or the following is wrong 'cause patientid is undefined

        let patientid, info, doctorid, patientverified, doctorverified = await medicalRecordsInstance.viewRecord(0, {from: patient1});
        assert.strictEqual(patientid.toNumber(), 0, "patientid is different");
        assert.strictEqual(info, details, "details of record different");
        assert.strictEqual(doctorid.toNumber(), 0, "doctorid different");
        assert.strictEqual(patientverified.toNumber(), 0, "patient have yet to verify");
        assert.strictEqual(doctorverified.toNumber(), 0, "no doctor verified"); */
    });

    it('Test 3: Patient verifying medical record', async() => {
        // Test 3A: Not authorised patient
        try {
            result = await medicalRecordsInstance.patientVerify(0, {from: patient2});
        } catch(error) {
            assert.include(error.message, "Medical record does not belong to this address.");
        }

        // Test 3B: Correct patient
        result = await medicalRecordsInstance.patientVerify(0, {from: patient1});
        truffleAssertions.eventEmitted(result, 'patientVerified', (ev) => {
            return ev.medicalRecordId == 0
        }); 
    });
});