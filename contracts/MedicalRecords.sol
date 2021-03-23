//pragma solidity ^0.5.0;

contract MedicalRecords{

    // medical record structure

    struct medicalRecord {
        address patient;
        bytes32 details;
        address doctorInCharge;
        address[] viewerAccess; // change to mapping
        uint256 cost;
        
    }

    uint256 public numMedicalRecords = 0;
    mapping(uint256 => medicalRecord) public medicalRecords;

    // medical record events
    event createdMedicalRecord(uint256 medicalRecordId);


    // medical record modifiers


    // medical record functions

    // function to create medical record (check that he is a dr and that patient exists)
    function createRecord(address patient, bytes32 details, uint256 cost) public returns(uint256) {
        
        address[] memory viewerAccess;
        medicalRecord memory newMedicalRecord = medicalRecord(
            patient,
            details, 
            msg.sender,
            viewerAccess,
            cost
        );

        uint256 newMedicalRecordId = numMedicalRecords++;
        medicalRecords[newMedicalRecordId] = newMedicalRecord;
        emit createdMedicalRecord(newMedicalRecordId);
        return newMedicalRecordId; 
    }

    // function to view medical record (if inside viewaccess)
    function viewRecord(uint256 medicalRecordId) public view returns(address, bytes32, address, uint256) {
        require(medicalRecords[medicalRecordId].viewerAccess[msg.sender].exists == true, "Not authorised to view medical record.");

        return (medicalRecords[medicalRecordId].patient, medicalRecords[medicalRecordId].details, medicalRecords[medicalRecordId].doctorInCharge, medicalRecords[medicalRecordId].cost);
    }

    // function to grant user access for this record 
    function grantAccess(address user, uint256 medicalRecordId) public {
        require(medicalRecords[medicalRecordId].viewerAccess[msg.sender].exists == false, "Already authorised to view medical record.");
        medicalRecords[medicalRecordId].viewerAccess.push(user);
    }

    // function to remove user access for this record
    function ungrantAccess(address user, uint256 medicalRecordId) public {
        require(medicalRecords[medicalRecordId].viewerAccess[msg.sender].exists == true, "Already not authorised to view medical record.");
    }
}