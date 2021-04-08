//pragma solidity ^0.5.0;
pragma solidity >=0.4.21 <0.7.0; // version 6 is required for truffle build

contract Users {
    address masterAdmin;

    constructor() public {
        masterAdmin = msg.sender;
    }

    // patient structure
    struct patient {
        uint256 patientId;
        address patientAddress;
        uint256 recordNumber;
        uint256[] recordIds;
    }

    // doctor structure
    struct doctor {
        uint256 doctorId;
        address doctorAddress;
        uint256 penaltyScore;
        uint256 appraisalScore;
        bool blacklisted;
    }

    // admin structure
    struct admin {
        uint256 adminId;
        address adminAddress;
    }

    // user structure
    uint256 public numPatients = 0;
    uint256 public numDoctors = 0;
    uint256 public numAdmins = 0;

    mapping(uint256 => admin) public admins;
    mapping(address => bool) public adminExists;

    mapping(uint256 => patient) public patients;
    mapping(address => bool) public patientExists;
    mapping(uint256 => doctor) public doctors;
    mapping(address => doctor) public doctorsByAddress;
    mapping(address => bool) public doctorExists;

    // user events
    event registeredPatient(address patient);
    event registeredDoctor(address doctor);
    event registeredAdmin(address admin);

    // user modifiers
    modifier adminOnly() {
        // we might have to add more admins later
        require(
            adminExists[msg.sender] == true || msg.sender == masterAdmin,
            "Only admin can perform this function."
        );
        _;
    }

    modifier doctorExist(uint256 doctorId) {
        require(numDoctors >= doctorId == true, "Doctor does not exist.");
        _;
    }

    modifier patientExist(uint256 patientId) {
        require(numPatients >= patientId == true, "Patient does not exist.");
        _;
    }

    // user functions

    // function to add and register patient
    function registerPatient() public returns (uint256) {
        require(
            patientExists[msg.sender] != true,
            "Address is already a patient."
        );
        uint256 newPatientId = ++numPatients;

        uint256[] memory init_arr;
        patient memory newPatient = patient(newPatientId, msg.sender, 0, init_arr);

        patients[newPatientId] = newPatient;
        patientExists[msg.sender] = true;
        emit registeredPatient(msg.sender);
        return newPatientId;
    }

    // function to add and register doctor
    function registerDoctor(address doctorAddress)
        public
        adminOnly()
        returns (uint256)
    {
        uint256 newDoctorId = ++numDoctors;

        doctor memory newDoctor =
            doctor(newDoctorId, doctorAddress, 0, 0, false);

        doctors[newDoctorId] = newDoctor;
        doctorExists[doctorAddress] = true;
        doctorsByAddress[doctorAddress] = newDoctor;
        emit registeredDoctor(doctorAddress);
        return newDoctorId;
    }

    //function to add and register admin
    function registerAdmin(address adminAddress)
        public
        adminOnly()
        returns (uint256)
    {
        uint256 newAdminId = numAdmins++;

        admin memory newAdmin = admin(newAdminId, adminAddress);

        admins[newAdminId] = newAdmin;
        adminExists[adminAddress] = true;
        emit registeredAdmin(adminAddress);
        return newAdminId;
    }

    // function to see if address is a patient
    function isPatient(address user) public view returns (bool) {
        return patientExists[user];
    }

    // function to see if address is a doctor
    function isDoctor(address user) public view returns (bool) {
        return doctorExists[user];
    }

    // function to see if address is an admin
    function isAdmin(address user) public view returns (bool) {
        if (user == masterAdmin) {
            return true;
        }
        return adminExists[user];
    }

    // function to see if patient exists
    function isExistingPatient(uint256 patientId)
        public
        view
        patientExist(patientId)
        returns (bool)
    {
        return patientId <= numPatients;
    }

    // function to see if doctor exists
    function isExistingDoctor(uint256 doctorId)
        public
        view
        doctorExist(doctorId)
        returns (bool)
    {
        return doctorId <= numDoctors;
    }

    // function to get patient
    function getPatientAddress(uint256 patientId)
        public
        view
        patientExist(patientId)
        returns (address)
    {
        return patients[patientId].patientAddress;
    }

    // function to get doctor
    function getDoctorAddress(uint256 doctorId)
        public
        view
        doctorExist(doctorId)
        returns (address)
    {
        return doctors[doctorId].doctorAddress;
    }

    // function to get doctor id by address
    function getDoctorId(address user) public view returns (uint256) {
        require(doctorExists[user] == true, "User is not a doctor.");
        return doctorsByAddress[user].doctorId;
    }

    // function to check patient's number of records
    function getRecordNumber(uint256 patientId)
        public
        view
        patientExist(patientId)
        returns (uint256)
    {
        // not sure if this requirement is too strict
        require(
            patients[patientId].patientAddress == msg.sender,
            "Not authorised to view."
        );

        return patients[patientId].recordNumber;
    }

    // function to check patient's list of recordIds
    function getRecordIds(uint256 patientId)
        public
        view
        patientExist(patientId)
        returns (uint256[] memory)
    {
        // not sure if this requirement is too strict
        require(
            patients[patientId].patientAddress == msg.sender,
            "Not authorised to view."
        );

        uint256[] memory recordIds = patients[patientId].recordIds;
        return recordIds;
    }

    // function to check doctor's penalty score
    function getPenaltyScore(uint256 doctorId)
        public
        view
        doctorExist(doctorId)
        returns (uint256)
    {
        return doctors[doctorId].penaltyScore;
    }

    // function to check doctor's appraisal score
    function getAppraisalScore(uint256 doctorId)
        public
        view
        doctorExist(doctorId)
        returns (uint256)
    {
        return doctors[doctorId].appraisalScore;
    }

    // function to add medical record id to patient's list
    function addRecordId(uint256 patientId, uint256 medicalRecordId) public {
        patients[patientId].recordIds.push(medicalRecordId);
    }

    // function to add medical record count to patient
    function addRecordCount(uint256 patientId) public {
        patients[patientId].recordNumber += 1;
    }

    // function to add penalty score
    function addPenaltyScore(uint256 doctorId, uint256 score)
        external
        doctorExist(doctorId)
    {
        doctors[doctorId].penaltyScore += score;
    }

    // function to add appraisal score
    function addAppraisalScore(uint256 doctorId)
        external
        doctorExist(doctorId)
    {
        doctors[doctorId].appraisalScore += 1;
    }

    // function to blacklist doctor
    function blacklistDoctor(uint256 doctorId) external doctorExist(doctorId) {
        doctors[doctorId].blacklisted = true;
    }

    // function to check if doctor is blacklisted
    function isBlacklisted(uint256 doctorId)
        public
        view
        doctorExist(doctorId)
        returns (bool)
    {
        return doctors[doctorId].blacklisted;
    }
}
