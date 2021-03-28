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
        bool patientVerified;
        bool doctorVerified;
    }

    uint256 public numMedicalRecords = 0;
    mapping(uint256 => medicalRecord) public medicalRecords;
    mapping(uint256 => medicalRecord) public flaggedRecords;
    mapping(uint256 => bool) public isFlaggedRecords;
    mapping(uint256 => medicalRecord) public badRecords;
    mapping(uint256 => mapping(uint256 => uint256)) public doctorVerifications;
    

    // medical record events
    event createdMedicalRecord(uint256 medicalRecordId);

    // medical record modifiers

    // medical record functions
    // function to create medical record
    function createRecord(uint256 patientId, uint256 doctorId, bytes32 details) public returns(uint256) {
        require(userContract.isExistingPatient(patientId) == true, "No such patient exists.");
        require(userContract.isExistingDoctor(doctorId) == true, "No such doctor exists.");
        require(userContract.isDoctor(msg.sender) == true, "Not authorised to make medical record.");
        require(userContract.isBlacklisted(doctorId), "Not authorised as doctor is blacklisted.");

        medicalRecord memory newMedicalRecord = medicalRecord(
            patientId,
            details, 
            doctorId,
            false,
            false
        );

        uint256 newMedicalRecordId = numMedicalRecords++;
        medicalRecords[newMedicalRecordId] = newMedicalRecord;
        userContract.addRecordCount(patientId);
        emit createdMedicalRecord(newMedicalRecordId);
        return newMedicalRecordId; 
    }

    // function to view medical record 
    function viewRecord(uint256 medicalRecordId) public view returns(uint256, bytes32, uint256, bool, bool) {
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
    function patientVerify(uint256 medicalRecordId) public {
        require(userContract.getPatientAddress(medicalRecords[medicalRecordId].patient) == msg.sender,
        "Medical record does not belong to this address."); // make sure that only that patient verify his own medical record

        medicalRecords[medicalRecordId].patientVerified = true;
    }

    // function for doctor to verify that medical record has no problems
    function doctorVerify(uint256 medicalRecordId) public {
        require(userContract.isDoctor(msg.sender) == true, "Not doctor, not authorised to verify.");
        require(userContract.isBlacklisted(userContract.getDoctorId(msg.sender)), "Not authorised as doctor is blacklisted.");
        // add requirements that doctor cannot constantly verify the same other doctor's stuff, idk what threshold to set

        medicalRecords[medicalRecordId].doctorVerified = true;
        doctorVerifications[userContract.getDoctorId(msg.sender)][medicalRecords[medicalRecordId].doctorInCharge] += 1;
        userContract.addAppraisalScore(userContract.getDoctorId(msg.sender));
    }

    // function for patient to whistleblow
    function patientReport(uint256 medicalRecordId) public {
        require(userContract.getPatientAddress(medicalRecords[medicalRecordId].patient) == msg.sender,
        "Medical record does not belong to this address."); // make sure that only that patient verify his own medical record

        flaggedRecords[medicalRecordId] = medicalRecords[medicalRecordId];
        isFlaggedRecords[medicalRecordId] = true;
    }

    // function for verifying doctor to whistleblow
    function doctorReport(uint256 medicalRecordId) public {
        require(userContract.isDoctor(msg.sender) == true, "Not doctor, not authorised to verify.");
        require(userContract.isBlacklisted(userContract.getDoctorId(msg.sender)), "Not authorised as doctor is blacklisted.");

        flaggedRecords[medicalRecordId] = medicalRecords[medicalRecordId];
        isFlaggedRecords[medicalRecordId] = true;
        doctorVerifications[userContract.getDoctorId(msg.sender)][medicalRecords[medicalRecordId].doctorInCharge] += 1;
    }

    // function for admin to classify flagged record as bad record
    function punish(uint256 medicalRecordId, uint256 score) public {
        require(userContract.isAdmin(msg.sender) == true, "Only admins can execute this function.");
        require(isFlaggedRecords[medicalRecordId] = true, "Record is not a flagged one.");

        badRecords[medicalRecordId] = flaggedRecords[medicalRecordId];
        userContract.addPenaltyScore(medicalRecords[medicalRecordId].doctorInCharge, score);
        // TODO: might have to change threshold
        if (userContract.getPenaltyScore(medicalRecords[medicalRecordId].doctorInCharge) > 10) {
            userContract.blacklistDoctor(medicalRecords[medicalRecordId].doctorInCharge);
        }
        delete flaggedRecords[medicalRecordId];
        delete isFlaggedRecords[medicalRecordId];

    }

    // function for admin to waive wrongly accused flagged record
    function waive(uint256 medicalRecordId) public {
        require(userContract.isAdmin(msg.sender) == true, "Only admins can execute this function.");
        require(isFlaggedRecords[medicalRecordId] = true, "Record is not a flagged one.");

        delete flaggedRecords[medicalRecordId];
        delete isFlaggedRecords[medicalRecordId];
        medicalRecords[medicalRecordId].patientVerified = true;
        medicalRecords[medicalRecordId].doctorVerified = true;
    }
}