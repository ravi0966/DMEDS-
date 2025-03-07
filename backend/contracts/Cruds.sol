// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Cruds {
    // Store IPFS CIDs for doctors and patients
    string[] private doctors;
    string[] private patients;
    
    // Mappings to check if a CID is already stored
    mapping(string => bool) private doctorExists;
    mapping(string => bool) private patientExists;

    // Events for logging additions
    event DoctorAdded(string cid);
    event PatientAdded(string cid);

    // Function to add a new doctor
    function addDoctor(string memory doc_cid) public {
        require(!doctorExists[doc_cid], "Doctor already exists");
        doctors.push(doc_cid);
        doctorExists[doc_cid] = true;
        emit DoctorAdded(doc_cid);
    }

    // Function to get all doctors
    function getDoctor() public view returns (string[] memory) {
        return doctors;
    }

    // Function to add a new patient
    function addPatient(string memory patient_cid) public {
        require(!patientExists[patient_cid], "Patient already exists");
        patients.push(patient_cid);
        patientExists[patient_cid] = true;
        emit PatientAdded(patient_cid);
    }

    // Function to get all patients
    function getPatient() public view returns (string[] memory) {
        return patients;
    }
}
