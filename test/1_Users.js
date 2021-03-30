var Users = artifacts.require("Users.sol");
const truffleAssertions = require("truffle-assertions");

contract("Users", accounts => {
    const masterAdmin = accounts[0];
    const admin2 = accounts[1];
    const doctor = accounts[2];
    const patient1 = accounts[3];
    const patient2 = accounts[4];
    const outsider = accounts[5];

    before(async () => {
        usersInstance = await Users.deployed({from:masterAdmin});
    });

    it('Test 1: Registering admins, validating admin identity', async() => {
        // Test 1A: Invalid registration of new admin
        try {
            result = await usersInstance.registerAdmin(admin2, {from: outsider});
        } catch(error) {
            assert.include(error.message, "Only admin can perform this function.");
        }

        let beforeRegister = await usersInstance.isAdmin(admin2);
        assert.strictEqual(beforeRegister, false, "Registered invalid admin");

        // Test 1B: Valid registration of new admin
        let result = await usersInstance.registerAdmin(admin2, {from: masterAdmin});
        truffleAssertions.eventEmitted(result, 'registeredAdmin', (ev) => {
            return ev.admin == admin2
        }); 

        let afterRegister = await usersInstance.isAdmin(admin2);
        assert.strictEqual(afterRegister, true, "Failed to register admin");
    });

    it('Test 2: Registering doctors, validating doctors identity', async() => {
        // Test 2A: Admin can't register
        try {
            result = await usersInstance.registerDoctor(doctor, {from: outsider});
        } catch(error) {
            assert.include(error.message, "Only admin can perform this function.");
        }

        let beforeRegister = await usersInstance.isDoctor(doctor);
        assert.strictEqual(beforeRegister, false, "Registered invalid doctor");

        // Test 2B: Successful registration
        let result = await usersInstance.registerDoctor(doctor, {from: masterAdmin});
        truffleAssertions.eventEmitted(result, 'registeredDoctor', (ev) => {
            return ev.doctor == doctor
        }); 

        let afterRegister = await usersInstance.isDoctor(doctor);
        assert.strictEqual(afterRegister, true, "Failed to register doctor");

        result = await usersInstance.isExistingDoctor(0);
        assert.strictEqual(result, true, "Invalid registration of doctor identity");

        result = await usersInstance.getDoctorAddress(0);
        assert.strictEqual(result, doctor, "Invalid doctor's address");

        // Test 2C: Doctors should start off with 0 penalty and appraisal score
        result = await usersInstance.getPenaltyScore(0);
        assert.strictEqual(result.toNumber(), 0, "Wrong penalty score");

        result = await usersInstance.getAppraisalScore(0);
        assert.strictEqual(result.toNumber(), 0, "Wrong appraisal score");
        
        // Test 2D: Add penalty and appraisal score
        result = await usersInstance.addPenaltyScore(0, 5);
        result = await usersInstance.getPenaltyScore(0);
        assert.strictEqual(result.toNumber(), 5, "Wrong penalty score for doctor1");

        result = await usersInstance.addAppraisalScore(0);
        result = await usersInstance.getAppraisalScore(0);
        assert.strictEqual(result.toNumber(), 1, "Wrong appraisal score for doctor1");

        // Test 2E: Trying to blacklist without being admin
        try {
            result = await usersInstance.blacklistDoctor(0, {from: outsider});
        } catch(error) {
            assert.include(error.message, "Only admin can perform this function.");
        }

        beforeRegister = await usersInstance.isBlacklisted(0);
        assert.strictEqual(beforeRegister, false, "Doctor blacklisted before blacklisting");

        result = await usersInstance.blacklistDoctor(0, {from: admin2});
        afterRegister = await usersInstance.isBlacklisted(0);
        assert.strictEqual(afterRegister, true, "Doctor didn't get blacklisted successfully");
    
    }); 

    it('Test 3: Registering patient, validating patient identity', async() => {
        // Test 3A: Register patient
        let result = await usersInstance.registerPatient({from: patient1});
        truffleAssertions.eventEmitted(result, 'registeredPatient', (ev) => {
            return ev.patient == patient1
        }); 

        let beforeRegister = await usersInstance.isPatient(patient2);
        assert.strictEqual(beforeRegister, false, "Registered invalid patient2");

        result = await usersInstance.registerPatient({from:patient2});
        truffleAssertions.eventEmitted(result, 'registeredPatient', (ev) => {
            return ev.patient == patient2
        }); 

        let afterRegister = await usersInstance.isPatient(patient2);
        assert.strictEqual(afterRegister, true, "Failed to register patient2");

        // Test 3B: Validating patient identity
        result = await usersInstance.getPatientAddress(0);
        assert.strictEqual(result, patient1, "Invalid patient1's address");

        result = await usersInstance.getPatientAddress(1);
        assert.strictEqual(result, patient2, "Invalid patient2's address");

        // Test 3C: Getting patient record
        try {
            result = await usersInstance.getRecordNumber(0, {from: outsider});
        } catch(error) {
            assert.include(error.message, "Not authorised to view.");
        }

        result = await usersInstance.getRecordNumber(0, {from:patient1});
        assert.strictEqual(result.toNumber(), 0, "Invalid patient1's record number");
        
        // Test 3D: Adding and checking record number
        await usersInstance.addRecordCount(0)
        result = await usersInstance.getRecordNumber(0, {from:patient1});
        assert.strictEqual(result.toNumber(), 1, "Invalid patient1's record number");
    });
});