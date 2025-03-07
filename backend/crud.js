const fs = require("fs");
const path = require("path");
const axios = require("axios");
const Web3 = require("web3");

// Pinata API Credentials (Replace these with your actual credentials)
const PINATA_API_KEY = "c3076adfec4302ec811b";
const PINATA_SECRET_API_KEY = "ee05931a35f783bbea2022d348ccd2df9d6373954ff67b25c7f47b807e663186";
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiZmIxZjExZS1mODgwLTRlZTktYTM3YS03MzU3NjkyNTEwZjgiLCJlbWFpbCI6InByYXNoYW50MTAxMDA3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJjMzA3NmFkZmVjNDMwMmVjODExYiIsInNjb3BlZEtleVNlY3JldCI6ImVlMDU5MzFhMzVmNzgzYmJlYTIwMjJkMzQ4Y2NkMmRmOWQ2MzczOTU0ZmY2N2IyNWM3ZjQ3YjgwN2U2NjMxODYiLCJleHAiOjE3NzE0ODU0Njl9.hFu6zWa1mjp8xZ0jp4_nj0juiJTC9fvwvj9FvWQwNIw"; // Recommended

// Connect to local Ganache
const web3 = new Web3("http://127.0.0.1:7545");

// Load contract ABI & address
const abi = JSON.parse(
  fs.readFileSync(path.join(__dirname, "contracts", "Cruds.abi"), "utf8")
);
const contractAddress = "0x4bA28A895C599ABDc8f61B4C4B459beeE4E4E99C"; // Update if needed
const contract = new web3.eth.Contract(abi, contractAddress);

// Upload JSON data to Pinata
const uploadToPinata = async (data) => {
  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      }
    );
    return response.data.IpfsHash; // Returns the CID
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
};

// Fetch data from IPFS
const fetchFromIPFS = async (cid) => {
  try {
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching from IPFS:", error);
    throw error;
  }
};

// Add Doctor (uploads data to Pinata and stores CID on-chain)
const addDoctor = async (doctorData) => {
  try {
    console.log("🔄 Adding doctor to IPFS and Blockchain...");
    
    const accounts = await web3.eth.getAccounts();
    console.log("👤 Using account:", accounts[0]);

    const doctorJSON = JSON.stringify(doctorData);
    console.log("📄 Doctor Data:", doctorJSON);

    // Upload to IPFS (Check if this function exists and is working)
    const ipfsHash = await uploadToPinata(doctorJSON);

    console.log("🔗 IPFS CID:", ipfsHash);

    // Send transaction to smart contract
    await contract.methods.addDoctor(ipfsHash).send({ from: accounts[0], gas: 6721975 });

    console.log(`✅ Doctor added! IPFS CID: ${ipfsHash}`);
  } catch (error) {
    console.error("❌ Error adding doctor:", error);
  }
};


// Get Doctors (retrieves CIDs and fetches data from IPFS)
const getDoctors = async () => {
  try {
    const cids = await contract.methods.getDoctor().call();
    const doctorData = await Promise.all(cids.map(fetchFromIPFS));
    console.log("👨‍⚕️ Doctors:", doctorData);
  } catch (error) {
    console.error("Error fetching doctors:", error);
  }
};

// Add Patient (uploads data to Pinata and stores CID on-chain)
const addPatient = async (patientData) => {
  try {
    console.log("🔄 Adding patient to IPFS and Blockchain...");
    
    const accounts = await web3.eth.getAccounts();
    console.log("👤 Using account:", accounts[0]);

    const patientJSON = JSON.stringify(patientData);
    console.log("📄 Patient Data:", patientJSON);

    // Upload patient data to IPFS
    const ipfsHash = await uploadToPinata(patientJSON);
    console.log("🔗 IPFS CID:", ipfsHash);

    // Store CID on the blockchain
    await contract.methods.addPatient(ipfsHash).send({ from: accounts[0], gas: 6721975 });

    console.log(`✅ Patient added! IPFS CID: ${ipfsHash}`);
  } catch (error) {
    console.error("❌ Error adding patient:", error);
  }
};


// Get Patients (retrieves CIDs and fetches data from IPFS)
const getPatients = async () => {
  try {
    const cids = await contract.methods.getPatient().call();
    const patientData = await Promise.all(cids.map(fetchFromIPFS));
    console.log("🏥 Patients:", patientData);
  } catch (error) {
    console.error("Error fetching patients:", error);
  }
};

// Export functions
module.exports = {
  addDoctor,
  getDoctors,
  addPatient,
  getPatients,
};
