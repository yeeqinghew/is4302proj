//pragma solidity ^0.5.0;

contract Users{

    // user structure
    address admin = address(this);
    mapping(address => bool) public patients;
    mapping(address => bool) public analysts;
    mapping(address => bool) public doctors;
    mapping(address => bool) public healthcareProviders;
    mapping(address => bool) public nurses;
    mapping(address => bool) public financialInstitutes;
    mapping(address => mapping(address => bool)) public fullAccess;

    // user events
    event registeredPatient(address patient);
    event registeredAnalyst(address analyst);
    event registeredDoctor(address doctor);
    event registeredHealthcareProvider(address healthcareProvider);
    event registeredNurse(address nurse);
    event registeredFinancialInstitute(address financialInstitute);

    // user modifiers
    modifier adminOnly(address user) {
        require(user == admin, "Only admin can perform this function.");
        _;
    }

    modifier healthcareProviderOnly(address user) {
        require(healthcareProviders[user] == true, "Only healthcare providers can perform this function.");
        _;
    }

    

    // user functions

    // function to register patient (only by dr/nurse)
    function registerPatient(address patient) public adminOnly(msg.sender) {}

    // function to register analyst (only by hcp)
    function registerAnalyst(address analyst) public healthcareProviderOnly(msg.sender) {}

    // function to register doctor (only by hcp)
    function registerDoctor(address doctor) public healthcareProviderOnly(msg.sender) {}

    // function to register healthcare provider (only by admin)
    function registerHealthcareProvider(address provider) public adminOnly(msg.sender) {}

    // function to register nurse (only by hcp)
    function registerNurse(address nurse) public healthcareProviderOnly(msg.sender) {}

    // function to register financial institute (only by admin)
    function registerFinancialInstitute(address institute) public adminOnly(msg.sender) {}

    // function to unregister analyst
    function unregisterAnalyst(address analyst) public healthcareProviderOnly(msg.sender) {}

    // function to unregister doctor
    function unregisterDoctor(address doctor) public healthcareProviderOnly(msg.sender) {}

    // function to unregister healthcare provider
    function unregisterHealthcareProvider(address provider) public adminOnly(msg.sender) {}

    // function to unregister nurse
    function unregisterNurse(address nurse) public healthcareProviderOnly(msg.sender) {}

    // function to unregister financial institute
    function unregisterFinancialInstitute(address institute) public adminOnly(msg.sender) {}

    // function to check if address is patient
    function isPatient(address user) public view returns(bool) {
        return patients[user];
    }

    // function to check if address is analyst
    function isAnalyst(address user) public view returns(bool) {
        return analysts[user];
    }

    // function to check if address is doctor
    function isDoctor(address user) public view returns(bool) {
        return doctors[user];
    }

    // function to check if address is healthcare provider
    function isHealthcareProvider(address user) public view returns(bool) {
        return healthcareProviders[user];
    }

    // function to check if address is nurse
    function isNurse(address user) public view returns(bool) {
        return nurses[user];
    }

    // function to check if address is financial institute
    function isFinancialInstitute(address user) public view returns(bool) {
        return financialInstitutes[user];
    }

    // function to make payment
    function makePayment(address patient, address receiver) public {}

    // function to make payment on behalf on a payment
    function makePaymentFor(address sender, address receiver) public {}

    // function to view specific transaction
    function viewTransaction(int transactionId) public {}

    // function to grant address access to all records
    function grantFullAccess(address user) public {}

    // function to remove access to all records
    function ungrantFullAccess(address user) public {}

    // function to get information of that certain address (actually idt it should be onchain anymore)
    function getInfo(address user) public {}
}