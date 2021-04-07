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
    let stringdetails = "Patient has high fever";
    let details = web3.utils.toHex(stringdetails);

    before(async () => {
        usersInstance = await Users.deployed({from:masterAdmin});
        medicalRecordsInstance = await MedicalRecords.deployed(usersInstance.address, {from: masterAdmin});
        await usersInstance.registerDoctor(doctor1, {from: masterAdmin}); 
        await usersInstance.registerDoctor(doctor2, {from: masterAdmin}); 
        await usersInstance.registerDoctor(blacklistedDoctor, {from: masterAdmin}); 
        await usersInstance.registerDoctor(doctor3, {from: masterAdmin}); 
        await usersInstance.blacklistDoctor(3, {from: masterAdmin});
        await usersInstance.registerPatient({from: patient1}); 
        await usersInstance.registerPatient({from: patient2}); 
    });

    it('Test 1: Creating Records', async() => {
        // Test 1A: Creating Records for invalid patient 
        try {
            result = await medicalRecordsInstance.createRecord(10, 1, details, {from: doctor1});
        } catch(error) {
            assert.include(error.message, "Patient does not exist.");
        }

        // Test 1B: Creating Records with invalid doctor
        try {
            result = await medicalRecordsInstance.createRecord(1, 5, details, {from: doctor1});
        } catch(error) {
            assert.include(error.message, "Doctor does not exist.");
        }

        // Test 1C: Creating Records with blacklisted doctor
        try {
            result = await medicalRecordsInstance.createRecord(1, 3, details, {from: blacklistedDoctor});
        } catch(error) {
            assert.include(error.message, "revert", "Not authorised as doctor is blacklisted.");
        }

        // Test 1D: Successful creation of records
        result = await medicalRecordsInstance.createRecord(1, 1, details, {from: doctor1});
        truffleAssertions.eventEmitted(result, 'createdMedicalRecord', (ev) => {
            return ev.medicalRecordId == 0
        }); 
    });

    it('Test 2: Viewing Medical Records', async() => {
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

        // Test 2C: Blacklisted doctor viewing valid record
        try {
            result = await medicalRecordsInstance.viewRecord(0, {from: blacklistedDoctor});
        } catch(error) {
            assert.include(error.message, "Not authorised as doctor is blacklisted.");
        }

        // Test 2D: Retrieving medical record
        result = await medicalRecordsInstance.viewRecord(0, {from: patient1});
        assert.strictEqual(result[0].toNumber(), 1, "patientid is different");
        let finalResult = web3.utils.hexToUtf8(result[1]);
        assert.strictEqual(finalResult, stringdetails, "details of record different");
        assert.strictEqual(result[2].toNumber(), 1, "doctorid different");
        assert.strictEqual(result[3].toNumber(), 0, "patient have yet to verify");
        assert.strictEqual(result[4].toNumber(), 0, "no doctor verified"); 
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
        result = await medicalRecordsInstance.createRecord(1, 2, details, {from: doctor2});
        truffleAssertions.eventEmitted(result, 'createdMedicalRecord', (ev) => {
            return ev.medicalRecordId == 1
        }); 

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

        // Test 4D: Doctor that has checked this doctor too many times (done many times for convenience)
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
        let score = await usersInstance.getAppraisalScore(4);
        assert.strictEqual(score.toNumber(), 1, "Appraisal score is different."); 
    });

    it('Test 5: Admin dealing with report after sending to authorities', async() => {
        result = await medicalRecordsInstance.createRecord(1, 4, details, {from: doctor3});
        truffleAssertions.eventEmitted(result, 'createdMedicalRecord', (ev) => {
            return ev.medicalRecordId == 2
        }); 
        result = await medicalRecordsInstance.createRecord(1, 4, details, {from: doctor3});
        truffleAssertions.eventEmitted(result, 'createdMedicalRecord', (ev) => {
            return ev.medicalRecordId == 3
        }); 

        // Test 5A: Waives flagged report
        result = await medicalRecordsInstance.doctorReport(2, {from: doctor2});
        truffleAssertions.eventEmitted(result, 'doctorReported', (ev) => {
            return ev.medicalRecordId == 2
        }); 

        result = await medicalRecordsInstance.waive(2, {from: masterAdmin});
        truffleAssertions.eventEmitted(result, 'wronglyAccusedReport', (ev) => {
            return ev.medicalRecordId == 2
        });

        // Test 5B: Punishes flagged report
        result = await medicalRecordsInstance.doctorReport(3, {from: doctor2});
        truffleAssertions.eventEmitted(result, 'doctorReported', (ev) => {
            return ev.medicalRecordId == 3
        }); 

        result = await medicalRecordsInstance.punish(3, 4, {from: masterAdmin});
        truffleAssertions.eventEmitted(result, 'fraudulentReport', (ev) => {
            return ev.medicalRecordId == 3
        });

        // Test 5C: Check penalty 
        let score = await usersInstance.getPenaltyScore(4);
        assert.strictEqual(score.toNumber(), 4, "Penalty score is different.");

        // Test 5D: Doctor 3 is punished again, gets blacklisted
        await medicalRecordsInstance.createRecord(1, 4, details, {from: doctor3});
        await medicalRecordsInstance.doctorReport(4, {from: doctor2});
        await medicalRecordsInstance.punish(4, 8, {from: masterAdmin});

        blacklisted = await usersInstance.isBlacklisted(4);
        assert.strictEqual(blacklisted, true, "Not blacklisted."); 
    }) 

});