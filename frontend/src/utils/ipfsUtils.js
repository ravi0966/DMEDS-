const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiZmIxZjExZS1mODgwLTRlZTktYTM3YS03MzU3NjkyNTEwZjgiLCJlbWFpbCI6InByYXNoYW50MTAxMDA3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJjMzA3NmFkZmVjNDMwMmVjODExYiIsInNjb3BlZEtleVNlY3JldCI6ImVlMDU5MzFhMzVmNzgzYmJlYTIwMjJkMzQ4Y2NkMmRmOWQ2MzczOTU0ZmY2N2IyNWM3ZjQ3YjgwN2U2NjMxODYiLCJleHAiOjE3NzE0ODU0Njl9.hFu6zWa1mjp8xZ0jp4_nj0juiJTC9fvwvj9FvWQwNIw"; // Secure your key

// Upload or Update Patient Data in Pinata
export const uploadToPinata = async (data) => {
    try {
        const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${PINATA_JWT}`,
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        return result.IpfsHash; // Return the new IPFS CID
    } catch (error) {
        console.error("Pinata Upload Error:", error);
        return null;
    }
};

// Fetch JSON data from Pinata
export const fetchFromPinata = async (cid) => {
    try {
        const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
        if (!response.ok) throw new Error("Failed to fetch data from IPFS");

        return await response.json();
    } catch (error) {
        console.error("Pinata Fetch Error:", error);
        return null;
    }
};

// Update Patient Data in Pinata
export const updatePatientData = async (oldCid, updatedData) => {
    try {
        // Step 1: Upload updated patient data
        const newCid = await uploadToPinata(updatedData);

        if (!newCid) throw new Error("Failed to upload updated data");

        // Step 2: Store new CID in localStorage for future retrieval
        localStorage.setItem("patientHash", newCid);
        return newCid;
    } catch (error) {
        console.error("Error updating patient data:", error);
        return null;
    }
};
