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
        await usersInstance.registerDoctor(doctor1, {from: masterAdmin}); // doctorId = 1
        await usersInstance.registerDoctor(doctor2, {from: masterAdmin}); // doctorId = 2
        await usersInstance.registerDoctor(blacklistedDoctor, {from: masterAdmin}); // doctorId = 3
        await usersInstance.registerDoctor(doctor3, {from: masterAdmin}); // doctorId = 4
        await usersInstance.blacklistDoctor(3, {from: masterAdmin}); 
        await usersInstance.registerPatient({from: patient1}); // patientId = 1
        await usersInstance.registerPatient({from: patient2}); // patientId = 2
    });

    it('Test 1: Invalid Creation of Medical Records due to non-existent patientId, doctorId and blacklisted doctor', async() => {
        // Invalid patientId
        try {
            result = await medicalRecordsInstance.createRecord(10, 1, details, {from: doctor1});
        } catch(error) {
            assert.include(error.message, "Patient does not exist.");
        }

        // Incorrect input of doctorId; doctor1's doctorId is 1
        try {
            result = await medicalRecordsInstance.createRecord(1, 5, details, {from: doctor1});
        } catch(error) {
            assert.include(error.message, "Doctor does not exist.");
        }

        // Unable to create medical record when you are a blacklisted doctor
        try {
            result = await medicalRecordsInstance.createRecord(1, 3, details, {from: blacklistedDoctor});
        } catch(error) {
            assert.include(error.message, "revert", "Not authorised as doctor is blacklisted.");
        }
    });

    it('Test 2: Successful Creation of Medical Record for patient1 using doctor1', async() => {
        result = await medicalRecordsInstance.createRecord(1, 1, details, {from: doctor1});
        truffleAssertions.eventEmitted(result, 'createdMedicalRecord', (ev) => {
            return ev.medicalRecordId == 0
        }); 
    });

    it('Test 3: Patient trying to view an invalid medical record', async() => {
        // Currently patient1 only has 1 medical record
        try {
            result = await medicalRecordsInstance.viewRecord(5, {from: patient1});
        } catch(error) {
            assert.include(error.message, "Medical record does not exist.");
        }
    });

    it('Test 4: Patient trying to view a valid medical record of another patient', async() => {
        try {
            result = await medicalRecordsInstance.viewRecord(0, {from: patient2});
        } catch(error) {
            assert.include(error.message, "Medical record does not belong to this patient.");
        }
    });

    it('Test 5: Blacklisted Doctor trying to view a valid medical record', async() => {
        try {
            result = await medicalRecordsInstance.viewRecord(0, 
                {from: blacklistedDoctor});
        } catch(error) {
            assert.include(error.message, "Not authorised as doctor is blacklisted.");
        }
    });

    it('Test 6: Successful Retrieval of Medical Record', async() => {
        result = await medicalRecordsInstance.viewRecord(0, {from: patient1});
        assert.strictEqual(result[0].toNumber(), 1, "patientId for medical record 0 is not belonging to patientId = 1");
        let finalResult = web3.utils.hexToUtf8(result[1]);
        assert.strictEqual(finalResult, stringdetails, "details of medical record 0 is different");
        assert.strictEqual(result[2].toNumber(), 0, "patientId = 1 has yet to verify if all services/drugs is rendered");
        assert.strictEqual(result[3].toNumber(), 0, "no doctor has checked on medical record 0"); 
    });

    it('Test 7: Patient trying to verify another patient medical record', async() => {
        try {
            result = await medicalRecordsInstance.patientVerify(0, 
                {from: patient2});
        } catch(error) {
            assert.include(error.message, "Medical record does not belong to this address.");
        }
    });

    it('Test 8: Patient verifying his/her own medical record', async() => {
        result = await medicalRecordsInstance.patientVerify(0, 
            {from: patient1});
        truffleAssertions.eventEmitted(result, 'patientVerified', (ev) => {
            return ev.medicalRecordId == 0
        }); 
    });

    it('Test 9: Patient reporting for discrepancies in his/her own medical record', async() => {
        result = await medicalRecordsInstance.patientReport(0, 
            {from: patient1});
        truffleAssertions.eventEmitted(result, 'patientReported', (ev) => {
            return ev.medicalRecordId == 0
        });
    });

    it('Test 10: Blacklisted doctor trying to verify another doctor work', async() => {
        // Created an additional medical record to check on
        result = await medicalRecordsInstance.createRecord(1, 2, details, 
            {from: doctor2});
        truffleAssertions.eventEmitted(result, 'createdMedicalRecord', (ev) => {
            return ev.medicalRecordId == 1
        }); 

        // Blacklisted doctor
        try {
            result = await medicalRecordsInstance.doctorVerify(1, {from: blacklistedDoctor});
        } catch(error) {
            assert.include(error.message, "Not authorised as doctor is blacklisted.");
        }
    });

    it('Test 11: Doctor cannot check on his/her own work', async() => {
        try {
            result = await medicalRecordsInstance.doctorVerify(1, 
                {from: doctor2});
        } catch(error) {
            assert.include(error.message, "Doctor checking is the same as the doctor in charge.");
        }
    });

    it('Test 12: Doctor checking on another doctor`s work', async() => {
        result = await medicalRecordsInstance.doctorVerify(1, 
            {from: doctor1});
        truffleAssertions.eventEmitted(result, 'doctorVerified', (ev) => {
            return ev.medicalRecordId == 1
        });
    });

    it('Test 13: Doctor are unable to check the work of another doctor`s work for too many times, to prevent collusion', async() => {
        await medicalRecordsInstance.doctorVerify(1, {from: doctor1}); // 2
        await medicalRecordsInstance.doctorVerify(1, {from: doctor1}); // 3
        await medicalRecordsInstance.doctorVerify(1, {from: doctor1}); // 4, max number of verifications
        try {
            result = await medicalRecordsInstance.doctorVerify(1, {from: doctor1});
        } catch(error) {
            assert.include(error.message, "This doctor has been verifying doctor in charge too many times.");
        }
    });

    it('Test 14: Doctor reporting on another doctor`s work', async() => {
        result = await medicalRecordsInstance.doctorReport(1, 
            {from: doctor3});
        truffleAssertions.eventEmitted(result, 'doctorReported', (ev) => {
            return ev.medicalRecordId == 1
        });
    });

    it('Test 15: Checking the appraisal score of doctorId = 4', async() => {
        let score = await usersInstance.getAppraisalScore(4);
        assert.strictEqual(score.toNumber(), 1, "Appraisal score is different."); 
    });

    it('Test 16: Waive the flagged medical records', async() => {
        result = await medicalRecordsInstance.createRecord(1, 4, details, {from: doctor3});
        truffleAssertions.eventEmitted(result, 'createdMedicalRecord', (ev) => {
            return ev.medicalRecordId == 2
        }); 
        result = await medicalRecordsInstance.createRecord(1, 4, details, {from: doctor3});
        truffleAssertions.eventEmitted(result, 'createdMedicalRecord', (ev) => {
            return ev.medicalRecordId == 3
        }); 

        result = await medicalRecordsInstance.doctorReport(2, {from: doctor2});
        truffleAssertions.eventEmitted(result, 'doctorReported', (ev) => {
            return ev.medicalRecordId == 2
        }); 

        result = await medicalRecordsInstance.waive(2, {from: masterAdmin});
        truffleAssertions.eventEmitted(result, 'wronglyAccusedReport', (ev) => {
            return ev.medicalRecordId == 2
        });
    });

    it('Test 17: Punish the doctors for those flagged medical records', async() => {
        result = await medicalRecordsInstance.doctorReport(3, 
            {from: doctor2});
        truffleAssertions.eventEmitted(result, 'doctorReported', (ev) => {
            return ev.medicalRecordId == 3
        }); 

        result = await medicalRecordsInstance.punish(3, 4, 
            {from: masterAdmin});
        truffleAssertions.eventEmitted(result, 'fraudulentReport', (ev) => {
            return ev.medicalRecordId == 3
        });
    });

    it('Test 18: Cross-checking the penalty score for those punished doctors', async() => {
        let score = await usersInstance.getPenaltyScore(4);
        assert.strictEqual(score.toNumber(), 4, "Penalty score is different.");
    });

    it('Test 19: Automatically blacklist doctor when the penalty score goes above the threshold', async() => {
        await medicalRecordsInstance.createRecord(1, 4, details, {from: doctor3});
        await medicalRecordsInstance.doctorReport(4, {from: doctor2});
        await medicalRecordsInstance.punish(4, 8, {from: masterAdmin});

        blacklisted = await usersInstance.isBlacklisted(4);
        assert.strictEqual(blacklisted, true, "DoctorId = 4 has yet to be blacklisted."); 
    });
});