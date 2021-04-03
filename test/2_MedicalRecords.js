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
    const doctor3 = accounts[7];
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
        await usersInstance.registerDoctor(doctor3, {from: masterAdmin}); // doctorId = 3
        await usersInstance.blacklistDoctor(2, {from: masterAdmin});
        await usersInstance.registerPatient({from: patient1}); // patientId = 0
        await usersInstance.registerPatient({from: patient2}); // patientId = 1
    });

    it('Test 1: Creating Records', async() => {
        stringdetails = "Patient has high fever" //, prescribed Acetaminophen
        details = web3.utils.toHex(stringdetails);

        // Test 1A: Creating Records for invalid patient 
        try {
            result = await medicalRecordsInstance.createRecord(10, 0, details, {from: doctor1});
        } catch(error) {
            assert.include(error.message, "Patient does not exist.");
        }

        // Test 1B: Creating Records with invalid doctor
        try {
            result = await medicalRecordsInstance.createRecord(0, 5, details, {from: doctor1});
        } catch(error) {
            assert.include(error.message, "Doctor does not exist.");
        }

        // Test 1C: Creating Records with blacklisted doctor
        try {
            result = await medicalRecordsInstance.createRecord(0, 2, details, {from: blacklistedDoctor});
        } catch(error) {
            assert.include(error.message, "revert", "Not authorised as doctor is blacklisted.");
        }

        // Test 1D: Successful creation of records
        result = await medicalRecordsInstance.createRecord(0, 0, details, {from: doctor1});
        truffleAssertions.eventEmitted(result, 'createdMedicalRecord', (ev) => {
            return ev.medicalRecordId == 0
        }); 
    });

    it('Test 2: Viewing Medical Records', async() => {
        let stringdetails = "Patient has high fever, prescribed Acetaminophen"
        let details = web3.utils.toHex(stringdetails);

        // Test 2A: Viewing invalid record
        try {
            result = await medicalRecordsInstance.viewRecord(5, {from: patient1});
        } catch(error) {
            assert.include(error.message, "Medical record does not exist.");
        }

        // Test 2B: Viewing valid record without being the patient itself
        try {
            result = await medicalRecordsInstance.viewRecord(0, {from: patient2});
        } catch(error) {
            assert.include(error.message, "Medical record does not belong to this patient.");
        }

        // Test 2C:  Admin viewing valid record (this one should work, admin shuold be able to view record)
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

    it('Test 3: Patient checking medical record', async() => {
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

        // Test 3C: Patient reports medical record
        result = await medicalRecordsInstance.patientReport(0, {from: patient1});
        truffleAssertions.eventEmitted(result, 'patientReported', (ev) => {
            return ev.medicalRecordId == 0
        });
    });

    it('Test 4: Doctor checking medical record', async() => {
        await medicalRecordsInstance.createRecord(1, 1, details, {from: doctor2});

        // Test 4A: Blacklisted doctor
        try {
            result = await medicalRecordsInstance.doctorVerify(1, {from: blacklistedDoctor});
        } catch(error) {
            assert.include(error.message, "Not authorised as doctor is blacklisted.");
        }

        // Test 4B: Same doctor as doctor in charge
        try {
            result = await medicalRecordsInstance.doctorVerify(1, {from: doctor2});
        } catch(error) {
            assert.include(error.message, "Doctor checking is the same as the doctor in charge.");
        }

        // Test 4C: Correct doctor verifies
        result = await medicalRecordsInstance.doctorVerify(1, {from: doctor1});
        truffleAssertions.eventEmitted(result, 'doctorVerified', (ev) => {
            return ev.medicalRecordId == 1
        });

        // Test 4D: Doctor that has checked this doctor too many times (done many times for convinience)
        await medicalRecordsInstance.doctorVerify(1, {from: doctor1}); // 2
        await medicalRecordsInstance.doctorVerify(1, {from: doctor1}); // 3
        await medicalRecordsInstance.doctorVerify(1, {from: doctor1}); // 4, max number of verifications
        try {
            result = await medicalRecordsInstance.doctorVerify(1, {from: doctor1});
        } catch(error) {
            assert.include(error.message, "This doctor has been verifying doctor in charge too many times.");
        }

        // Test 4E: Correct doctor reports
        result = await medicalRecordsInstance.doctorReport(1, {from: doctor3});
        truffleAssertions.eventEmitted(result, 'doctorReported', (ev) => {
            return ev.medicalRecordId == 1
        });

        // Test 4F: Check appraisal score
        let score = await usersInstance.getAppraisalScore(3);
        assert.strictEqual(score.toNumber(), 1, "Appraisal score is different.");
    });

    it('Test 5: Admin dealing with report after sending to authorities', async() => {
        // Test 5A: Punishes non-flagged report (report id 1 or smth)

        // Test 5B: Waives non-flagged report

        // Test 5C: Waives flagged report

        // Test 5D: Punishes flagged report

        // Test 5E: Check penalty score
    })
});