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

    it('Test 1: Invalid Registration of new admin', async() => {
        try {
            result = await usersInstance.registerAdmin(admin2, 
                {from: outsider});
        } catch(error) {
            assert.include(error.message, "Only admin can perform this function.");
        }
    });

    it('Test 2: Assertion of isAdmin() function before and after valid registration of new admin', async() => {
        let beforeRegister = await usersInstance.isAdmin(admin2);
        assert.strictEqual(beforeRegister, false, "Registered invalid admin");

        let result = await usersInstance.registerAdmin(admin2, {from: masterAdmin});
        truffleAssertions.eventEmitted(result, 'registeredAdmin', (ev) => {
            return ev.admin == admin2
        }); 

        let afterRegister = await usersInstance.isAdmin(admin2);
        assert.strictEqual(afterRegister, true, "Failed to register admin");
    });

    it('Test 3: Invalid Registration of new doctor', async() => {
        try {
            result = await usersInstance.registerDoctor(doctor, {from: outsider});
        } catch(error) {
            assert.include(error.message, "Only admin can perform this function.");
        }
    });

    it('Test 4: Assertion of isDoctor() function before and after valid registration of new doctor', async() => {

        let beforeRegister = await usersInstance.isDoctor(doctor);
        assert.strictEqual(beforeRegister, false, "Registered invalid doctor");

        let result = await usersInstance.registerDoctor(doctor, 
            {from: masterAdmin});

        truffleAssertions.eventEmitted(result, 'registeredDoctor', (ev) => {
            return ev.doctor == doctor
        }); 

        let afterRegister = await usersInstance.isDoctor(doctor);
        assert.strictEqual(afterRegister, true, "Failed to register doctor");
    });

    it('Test 5: Cross-checking existing doctors identity', async() => {
        result = await usersInstance.isExistingDoctor(1);
        assert.strictEqual(result, true, "There isn't a doctor with id = 1");

        result = await usersInstance.getDoctorAddress(1);
        assert.strictEqual(result, doctor, "Invalid address for doctorId = 1");
    
    });

    it('Test 6: Ensuring that new doctors always starts with 0 penalty and appraisal score', async() => {
        result = await usersInstance.getPenaltyScore(1);
        assert.strictEqual(result.toNumber(), 0, "Wrong penalty score for doctorId = 1");

        result = await usersInstance.getAppraisalScore(1);
        assert.strictEqual(result.toNumber(), 0, "Wrong appraisal score for doctorId = 1");    
    }); 

    it('Test 7: Assertion of isPatient() before and after valid registration of patients', async() => {
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
    
    }); 

    it('Test 8: Cross-checking the respective patient identity', async() => {
        result = await usersInstance.getPatientAddress(1);
        assert.strictEqual(result, patient1, "Invalid patient1's address");

        result = await usersInstance.getPatientAddress(2);
        assert.strictEqual(result, patient2, "Invalid patient2's address");
    });

    it('Test 9: Invalid Retrieval of patient record', async() => {
        try {
            result = await usersInstance.getRecordNumber(1, {from: outsider});
        } catch(error) {
            assert.include(error.message, "Not authorised to view.");
        }
    });

    it('Test 10: Retrieval of patient record', async() => {
        result = await usersInstance.getRecordNumber(1, {from:patient1});
        assert.strictEqual(result.toNumber(), 0, "Incorrect total medical record number for patientId = 1");
        
        await usersInstance.addRecordCount(1)
        result = await usersInstance.getRecordNumber(1, {from:patient1});
        assert.strictEqual(result.toNumber(), 1, "Incorrect total medical record number for patientId = 1");
    });
});