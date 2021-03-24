//pragma solidity ^0.5.0;
import "./Users.sol";

contract MedicalRecords{

    Users userContract;

    // medical record structure

    struct medicalRecord {
        address patient;
        bytes32 details;
        address doctorInCharge;
        uint256 cost;
        
    }

    uint256 public numMedicalRecords = 0;
    mapping(uint256 => medicalRecord) public medicalRecords;
    mapping(uint256 => mapping(address => bool)) public access;

    // medical record events
    event createdMedicalRecord(uint256 medicalRecordId);
    event grantedAccess(uint256 medicalRecordId, address user);
    event ungrantedAccess(uint256 medicalRecordId, address user);

    // medical record modifiers
    modifier patientOnly(uint256 medicalRecordId, address patient) {
        require(msg.sender == medicalRecords[medicalRecordId].patient, "Only patient can perform this function.");
        _;
    }

    // add modifier for doctor once user.sol is done
    modifier doctorOnly(uint256 medicalRecordId, address doctor) {
        require(userContract.isDoctor(msg.sender) == true, "Only doctor can perform this function.");
    }

    modifier hasAccess(uint256 medicalRecordId, address user) {
        require(access[medicalRecordId][user] == true, "No access to medical record.");
    }

    // medical record functions
    // function to create medical record (check that he is a dr and that patient exists)
    function createRecord(address patient, bytes32 details, uint256 cost) public returns(uint256) {
        medicalRecord memory newMedicalRecord = medicalRecord(
            patient,
            details, 
            msg.sender,
            cost
        );

        uint256 newMedicalRecordId = numMedicalRecords++;
        medicalRecords[newMedicalRecordId] = newMedicalRecord;
        access[newMedicalRecordId][patient] = true; // granting patient access
        access[newMedicalRecordId][msg.sender] = true; // granting doctor access

        emit createdMedicalRecord(newMedicalRecordId);
        return newMedicalRecordId; 
    }

    // function to view medical record (if inside viewaccess) (need to check for global access)
    function viewRecord(uint256 medicalRecordId) public view hasAccess(medicalRecordId, msg.sender) returns(address, bytes32, address, uint256) {
        return (medicalRecords[medicalRecordId].patient, medicalRecords[medicalRecordId].details, medicalRecords[medicalRecordId].doctorInCharge, medicalRecords[medicalRecordId].cost);
    }

    // function to grant user access for this record (patient or dr can give access)
    function grantAccess(address user, uint256 medicalRecordId) public patientOnly(medicalRecordId, msg.sender) {
        require(access[medicalRecordId][user] == false, "Already authorised to view medical record.");

        access[medicalRecordId][msg.sender] = true;
        emit grantedAccess(medicalRecordId, user);
    }

    // function to remove user access for this record (patient or dr can remove access)
    function ungrantAccess(address user, uint256 medicalRecordId) public patientOnly(medicalRecordId, msg.sender) {
        require(access[medicalRecordId][msg.sender] == true, "Already not authorised to view medical record.");

        delete access[medicalRecordId][user];
        emit ungrantedAccess(medicalRecordId, user);
    }

}