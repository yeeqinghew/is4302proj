//pragma solidity ^0.5.0;
import "./Users.sol";

contract MedicalRecords{

    Users userContract;

    //constructor for usercontract
    constructor(Users usersAddress) public {
      userContract = usersAddress;
    }

    // medical record structure

    struct medicalRecord {
        uint256 patient;
        bytes32 details;
        uint256 doctorInCharge;
        uint256 patientVerified;
        uint256 doctorVerified;
    }

    uint256 public numMedicalRecords = 0;
    mapping(uint256 => medicalRecord) public medicalRecords;
    mapping(uint256 => medicalRecord) public flaggedRecords;
    mapping(uint256 => bool) public isFlaggedRecords;
    mapping(uint256 => medicalRecord) public badRecords;
    mapping(uint256 => mapping(uint256 => uint256)) public doctorVerifications;
    

    // medical record events
    event createdMedicalRecord(uint256 medicalRecordId);
    event patientVerified(uint256 medicalRecordId);
    event doctorVerified(uint256 medicalRecordId);
    event patientReported(uint256 medicalRecordId);
    event doctorReported(uint256 medicalRecordId);
    event fraudulentReport(uint256 medicalRecordId);
    event wronglyAccusedReport(uint256 medicalRecordId);
    event randomFlaggedReport(uint256 MedicalRecordId);

    // medical record modifiers
    modifier isPatient(uint256 patientId) {
        require(userContract.isExistingPatient(patientId) == true, "No such patient exists.");
        _;
    }

    modifier isPatientFromRecord(uint256 medicalRecordId) {
        require(userContract.getPatientAddress(medicalRecords[medicalRecordId].patient) == msg.sender,
        "Medical record does not belong to this address.");
        _;
    }

    modifier isDoctor(uint256 doctorId) {
        require(userContract.isExistingDoctor(doctorId) == true, "No such doctor exists.");
        _;
    }

    modifier isDoctorAddress() {
        require(userContract.isDoctor(msg.sender) == true, "Not doctor, not authorised to verify.");
        // SJ thinks that should also ensure this doctor verifying is not the doctor who attended to the patient
        // keef agrees
        _;
    }

    modifier notSameDoctor(uint256 medicalRecordId) {
        require(msg.sender != userContract.getDoctorAddress(medicalRecords[medicalRecordId].doctorInCharge), "Doctor checking is the same as the doctor in charge.");
        _;
    }

    modifier isAdmin() {
        require(userContract.isAdmin(msg.sender) == true, "Only admins can execute this function.");
        _;
    }

    modifier blacklistedId(uint256 doctorId) {
        require(userContract.isBlacklisted(doctorId) != true, "Not authorised as doctor is blacklisted.");
        _;
    }

    modifier blacklistedAddress() {
        require(userContract.isBlacklisted(userContract.getDoctorId(msg.sender)), "Not authorised as doctor is blacklisted.");
        _;
    }

    modifier flaggedRecord(uint256 medicalRecordId) {
        require(isFlaggedRecords[medicalRecordId] = true, "Record is not a flagged one.");
        _;
    }

    // medical record functions
    // function to create medical record
    function createRecord(uint256 patientId, uint256 doctorId, bytes32 details) public isPatient(patientId) isDoctor(doctorId) blacklistedId(doctorId) returns(uint256) {

        medicalRecord memory newMedicalRecord = medicalRecord(
            patientId,
            details, 
            doctorId,
            0,
            0
        );

        uint256 newMedicalRecordId = numMedicalRecords++;
        medicalRecords[newMedicalRecordId] = newMedicalRecord;
        userContract.addRecordCount(patientId);
        emit createdMedicalRecord(newMedicalRecordId);

        // randomly adds medical record to flaggedRecords so random spotchecks can be done
        uint8 randomFlag = (uint8)((block.timestamp * (newMedicalRecordId + 1)) % 10) + 1;
        if (randomFlag == 10) {
            flaggedRecords[newMedicalRecordId] = medicalRecords[newMedicalRecordId];
            isFlaggedRecords[newMedicalRecordId] = true;
            emit randomFlaggedReport(newMedicalRecordId);
        }

        return newMedicalRecordId; 
    }

    // function to view medical record 
    function viewRecord(uint256 medicalRecordId) public view returns(uint256, bytes32, uint256, uint256, uint256) {
        require(medicalRecordId <= numMedicalRecords, "Medical record does not exist.");
        
        // requirement that only patient can view this record if the msg.sender is a patient
        if (userContract.isPatient(msg.sender) == true) {
            require(userContract.getPatientAddress(medicalRecords[medicalRecordId].patient) == msg.sender,
            "Medical record does not belong to this patient.");
        } else if (userContract.isDoctor(msg.sender) == true){
            require(userContract.isBlacklisted(userContract.getDoctorId(msg.sender)), "Not authorised as doctor is blacklisted.");
        } else {
            require(userContract.isAdmin(msg.sender) == true, "Not patient, doctor or admin, not authorised.");
        }

        return (medicalRecords[medicalRecordId].patient, medicalRecords[medicalRecordId].details,
        medicalRecords[medicalRecordId].doctorInCharge, medicalRecords[medicalRecordId].patientVerified,
        medicalRecords[medicalRecordId].doctorVerified);
    }

    // function for patient to verify that medical record has no problems
    function patientVerify(uint256 medicalRecordId) public isPatientFromRecord(medicalRecordId) {

        medicalRecords[medicalRecordId].patientVerified = 1;
        emit patientVerified(medicalRecordId);
    }

    // function for doctor to verify that medical record has no problems
    function doctorVerify(uint256 medicalRecordId) public isDoctorAddress() blacklistedAddress() notSameDoctor(medicalRecordId) {
        require(doctorVerifications[userContract.getDoctorId(msg.sender)][medicalRecords[medicalRecordId].doctorInCharge] <= 5, "This doctor has been verifying doctor in charge too many times.");

        medicalRecords[medicalRecordId].doctorVerified = 1;
        doctorVerifications[userContract.getDoctorId(msg.sender)][medicalRecords[medicalRecordId].doctorInCharge] += 1;
        userContract.addAppraisalScore(userContract.getDoctorId(msg.sender));
        emit doctorVerified(medicalRecordId);
    }

    // function for patient to whistleblow
    function patientReport(uint256 medicalRecordId) public isPatientFromRecord(medicalRecordId) {

        flaggedRecords[medicalRecordId] = medicalRecords[medicalRecordId];
        isFlaggedRecords[medicalRecordId] = true;
        medicalRecords[medicalRecordId].patientVerified = 2;
        emit patientReported(medicalRecordId);
    }

    // function for verifying doctor to whistleblow
    function doctorReport(uint256 medicalRecordId) public isDoctorAddress() blacklistedAddress() notSameDoctor(medicalRecordId) {
        require(doctorVerifications[userContract.getDoctorId(msg.sender)][medicalRecords[medicalRecordId].doctorInCharge] <= 5, "This doctor has been verifying doctor in charge too many times.");
        
        flaggedRecords[medicalRecordId] = medicalRecords[medicalRecordId];
        isFlaggedRecords[medicalRecordId] = true;
        doctorVerifications[userContract.getDoctorId(msg.sender)][medicalRecords[medicalRecordId].doctorInCharge] += 1;
        medicalRecords[medicalRecordId].doctorVerified = 2;
        emit doctorReported(medicalRecordId);
    }

    // function for admin to classify flagged record as bad record
    function punish(uint256 medicalRecordId, uint256 score) public isAdmin() flaggedRecord(medicalRecordId) {

        badRecords[medicalRecordId] = flaggedRecords[medicalRecordId];
        userContract.addPenaltyScore(medicalRecords[medicalRecordId].doctorInCharge, score);
        // TODO: might have to change threshold
        if (userContract.getPenaltyScore(medicalRecords[medicalRecordId].doctorInCharge) > 10) {
            userContract.blacklistDoctor(medicalRecords[medicalRecordId].doctorInCharge);
        }
        delete flaggedRecords[medicalRecordId];
        delete isFlaggedRecords[medicalRecordId];
        emit fraudulentReport(medicalRecordId);
    }

    // function for admin to waive wrongly accused flagged record
    function waive(uint256 medicalRecordId) public isAdmin() flaggedRecord(medicalRecordId) {

        delete flaggedRecords[medicalRecordId];
        delete isFlaggedRecords[medicalRecordId];
        medicalRecords[medicalRecordId].patientVerified = 1;
        medicalRecords[medicalRecordId].doctorVerified = 1;
        emit wronglyAccusedReport(medicalRecordId);
    }

    // function to convert string to bytes32 (to store details)
    function stringToBytes32(string memory source) public pure returns (bytes32 result) {
    bytes memory tempEmptyStringTest = bytes(source);
    if (tempEmptyStringTest.length == 0) {
        return 0x0;
        }

    assembly {
        result := mload(add(source, 32))
        }
        return bytes32(result);
    }

    // function to convert bytes32 to string (to read details)
    function bytes32ToString(bytes32 _bytes32) public pure returns (string memory) {
        uint8 i = 0;
        while(i < 32 && _bytes32[i] != 0) {
            i++;
            }

        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
            }

        return string(bytesArray);
    }

}