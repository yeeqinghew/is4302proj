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


    struct transaction {
        address sender;
        address receiver;
        uint256 amount;
    }

    mapping(uint256 => transaction) transactions;

    // user events
    event registeredPatient(address patient);
    event registeredAnalyst(address analyst);
    event registeredDoctor(address doctor);
    event registeredHealthcareProvider(address healthcareProvider);
    event registeredNurse(address nurse);
    event registeredFinancialInstitute(address financialInstitute);
    event unregisteredAnalyst(address analyst);
    event unregisteredDoctor(address doctor);
    event unregisteredHealthcareProvider(address healthcareProvider);
    event unregisteredNurse(address nurse);
    event unregisteredFinancialInstitute(address financialInstitute);

    event grantedFullAccess(address patient, address user);
    event ungrantedFullAccess(address patient, address user);

    // user modifiers
    modifier adminOnly(address user) {
        require(user == admin, "Only admin can perform this function.");
        _;
    }

    modifier healthcareProviderOnly(address user) {
        require(healthcareProviders[user] == true, "Only healthcare providers can perform this function.");
        _;
    }

    modifier patientOnly(address user) {
        require(patients[patient] == true, "Only patients can perform this function.");
        _;
    }
    

    // user functions

    // function to register patient (only by dr/nurse)
    function registerPatient(address patient) public adminOnly(msg.sender) {
        patients[patient] = true;
        emit registeredPatient(patient);
    }

    // function to register analyst (only by hcp)
    function registerAnalyst(address analyst) public healthcareProviderOnly(msg.sender) {
        analysts[analyst] = true;
        emit registeredAnalyst(analyst);
    }

    // function to register doctor (only by hcp)
    function registerDoctor(address doctor) public healthcareProviderOnly(msg.sender) {
        doctors[doctor] = true;
        emit registeredDoctor(doctor);
    }

    // function to register healthcare provider (only by admin)
    function registerHealthcareProvider(address provider) public adminOnly(msg.sender) {
        healthcareProviders[provider] = true;
        emit registeredHealthcareProvider(provider);
    }

    // function to register nurse (only by hcp)
    function registerNurse(address nurse) public healthcareProviderOnly(msg.sender) {
        nurses[nurse] = true;
        emit registeredNurse(nurse);
    }

    // function to register financial institute (only by admin)
    function registerFinancialInstitute(address institute) public adminOnly(msg.sender) {
        financialInstitutes[institute] = true;
        emit registeredFinancialInstitute(institute);
    }

    // function to unregister analyst
    function unregisterAnalyst(address analyst) public healthcareProviderOnly(msg.sender) {
        require(analysts[analyst] == true, "No such analyst.");
        delete analysts[analyst];
        emit unregisteredAnalyst(analyst);
    }

    // function to unregister doctor
    function unregisterDoctor(address doctor) public healthcareProviderOnly(msg.sender) {
        require(doctors[doctor] == true, "No such doctor.");
        delete doctors[doctor];
        emit unregisteredDoctor(doctor);
    }

    // function to unregister healthcare provider
    function unregisterHealthcareProvider(address provider) public adminOnly(msg.sender) {
        require(healthcareProviders[provider] == true, "No such healthcare provider.");
        delete healthcareProviders[provider];
        emit unregisteredHealthcareProvider(provider);
    }

    // function to unregister nurse
    function unregisterNurse(address nurse) public healthcareProviderOnly(msg.sender) {
        require(nurses[nurse] == true, "No such nurse.");
        delete nurses[nurse];
        emit unregisteredNurse(nurse);
    }

    // function to unregister financial institute
    function unregisterFinancialInstitute(address institute) public adminOnly(msg.sender) {
        require(financialInstitutes[institute] == true, "No such financial institute.");
        delete financialInstitutes[institute];
        emit unregisteredFinancialInstitute(institute);
    }

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

    // function to make payment (need to settle coin 1st)
    function makePayment(address patient, address receiver) public {}

    // function to make payment on behalf on a payment (need to settle coin 1st)
    function makePaymentFor(address sender, address receiver) public {}

    // function to view specific transaction (need to settle coin 1st)
    function viewTransaction(int transactionId) public {}

    // function to grant address access to all records
    function grantFullAccess(address user) public patientOnly(msg.sender) {
        fullAccess[msg.sender][user] = true;
        emit grantedFullAccess(msg.sender, user);
    }

    // function to remove access to all records
    function ungrantFullAccess(address user) public patientOnly(msg.sender) {
        require(fullAccess[msg.sender][user] == true, "User already does not have access.");
        delete fullAccess[msg.sender][user];
        emit ungrantedFullAccess(msg.sender, user);
    }

    // function to check if user has full access to records
    function hasFullAccess(address patient, address user) public view returns(bool) {
        return fullAccess[patient][user];
    }

    // function to get information of that certain address (actually idt it should be onchain anymore)
    function getInfo(address user) public {}
}