//pragma solidity ^0.5.0;

contract Users{
    address admin;

    constructor() public {
        admin = msg.sender;
    }
    // patient structure
    struct patient {
        uint256 patientId;
        address patientAddress;
        uint256 recordNumber;
        // TODO: add more structure
    }

    // doctor structure
    struct doctor {
        uint256 doctorId;
        address doctorAddress;
        uint256 penaltyScore;
        uint256 appraisalScore;
        bool blacklisted;
        // TODO: add more structure
    }

    // user structure
    uint256 public numPatients;
    uint256 public numDoctors;
    mapping(uint256 => patient) public patients;
    mapping(address => bool) public patientExists;
    mapping(uint256 => doctor) public doctors;
    mapping(address => bool) public doctorExists;

    // user events
    event registeredPatient(address patient);
    event registeredDoctor(address doctor);

    // user modifiers
    modifier adminOnly() { // we might have to add more admins later
        require(msg.sender == admin, "Only admin can perform this function.");
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
    function registerPatient() public returns(uint256) {
        require(patientExists[msg.sender] != true, "Address is already a patient.");
        uint256 newPatientId = numPatients++;

        patient memory newPatient = patient(
            newPatientId,
            msg.sender,
            0
        );
        
        patients[newPatientId] = newPatient;
        patientExists[msg.sender] = true;
        emit registeredPatient(msg.sender);
    }


    // function for add and register doctor
    function registerDoctor(address doctorAddress) public adminOnly() returns(uint256) {
        uint256 newDoctorId = numDoctors++;

        doctor memory newDoctor = doctor(
            newDoctorId,
            doctorAddress,
            0,
            0,
            false
        );

        doctors[newDoctorId] = newDoctor;
        doctorExists[doctorAddress] = true;
        emit registeredDoctor(doctorAddress);
    }

    // function to check patient's number of records
    function getRecordNumber(uint256 patientId) public view patientExist(patientId) returns(uint256) {
        // not sure if this requirement is too strict
        require(patients[patientId].patientAddress == msg.sender, "Not authorised to view.");

        return patients[patientId].recordNumber;
    }

    // function to check doctor's penalty score
    function getPenaltyScore(uint256 doctorId) public view doctorExist(doctorId) returns(uint256) {
        return doctors[doctorId].penaltyScore;
    }

    // function to check doctor's appraisal score
    function getAppraisalScore(uint256 doctorId) public view doctorExist(doctorId) returns(uint256) {
        return doctors[doctorId].appraisalScore;
    }

    // function to add penalty score
    function addPenaltyScore(uint256 doctorId, uint256 score) public adminOnly() doctorExist(doctorId) {
        doctors[doctorId].penaltyScore += score;
    }

    // function to add appraisal score
    function addAppraisalScore(uint256 doctorId, uint256 score) public adminOnly() doctorExist(doctorId) {
        doctors[doctorId].appraisalScore += score;
    }

    // function to blacklist doctor
    function blacklistDoctor(uint256 doctorId) public adminOnly() doctorExist(doctorId) {
        doctors[doctorId].blacklisted = true;
    }

    
}