var Users = artifacts.require("Users.sol");
const truffleAssertions = require("truffle-assertions");

contract("Users", accounts => {
    const masterAdmin = accounts[0];
    const admin2 = accounts[1];
    const doctor = accounts[2];
    const nurse = accounts[3];
    const patient1 = accounts[4];
    const outsider = accounts[5];

    before(async () => {
        usersInstance = await Users.deployed({from:masterAdmin});
    });

    it('Test 1: Registering admins', async() => {
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
});