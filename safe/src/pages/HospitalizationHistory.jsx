import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiZmIxZjExZS1mODgwLTRlZTktYTM3YS03MzU3NjkyNTEwZjgiLCJlbWFpbCI6InByYXNoYW50MTAxMDA3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJjMzA3NmFkZmVjNDMwMmVjODExYiIsInNjb3BlZEtleVNlY3JldCI6ImVlMDU5MzFhMzVmNzgzYmJlYTIwMjJkMzQ4Y2NkMmRmOWQ2MzczOTU0ZmY2N2IyNWM3ZjQ3YjgwN2U2NjMxODYiLCJleHAiOjE3NzE0ODU0Njl9.hFu6zWa1mjp8xZ0jp4_nj0juiJTC9fvwvj9FvWQwNIw";  // 🔹 Replace with your actual JWT
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
const PINATA_API = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

const HospitalizationHistory = () => {
  const [cookies] = useCookies(["email", "hash"]);
  const [hospHistory, setHospHistory] = useState([]);
  const [addFormData, setAddFormData] = useState({
    hospitalName: "",
    admissionDate: "",
    dischargeDate: "",
    reason: "",
  });

  // 🔹 Load hospitalization history from Local Storage & IPFS
  useEffect(() => {
    const fetchHospitalizationData = async () => {
      try {
        // Retrieve local data first
        const storedData = localStorage.getItem("hospitalizationHistory");
        if (storedData) {
          setHospHistory(JSON.parse(storedData));
        }

        // Retrieve from IPFS if CID is available
        const cid = cookies["hash"];
        if (!cid) return;

        const response = await axios.get(`${PINATA_GATEWAY}${cid}`);
        if (response.data.hospHistory) {
          setHospHistory(response.data.hospHistory);
          localStorage.setItem("hospitalizationHistory", JSON.stringify(response.data.hospHistory));  // ✅ Save locally
        }
      } catch (error) {
        console.error("Error fetching hospitalization data:", error);
      }
    };

    fetchHospitalizationData();
  }, [cookies]);

  const handleAddFormChange = (e) => {
    setAddFormData({ ...addFormData, [e.target.name]: e.target.value });
  };

  // 🔹 Upload updated hospitalization history to Pinata
  const uploadToPinata = async (data) => {
    try {
      const response = await axios.post(PINATA_API, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      });
      return response.data.IpfsHash;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      throw error;
    }
  };

  // 🔹 Add Hospitalization Record
  const submit = async () => {
    if (!addFormData.hospitalName || !addFormData.admissionDate || !addFormData.dischargeDate || !addFormData.reason) {
      alert("Please fill all fields before saving.");
      return;
    }

    try {
      const updatedData = { hospHistory: [...hospHistory, addFormData] };
      const newCid = await uploadToPinata(updatedData);

      document.cookie = `hash=${newCid}; path=/`;  // ✅ Save new CID as a cookie
      setHospHistory(updatedData.hospHistory);
      localStorage.setItem("hospitalizationHistory", JSON.stringify(updatedData.hospHistory));  // ✅ Save to Local Storage

      alert("Hospitalization Record Added Successfully!");
    } catch (error) {
      console.error("Error adding hospitalization record:", error);
    }
  };

  return (
    <div className="flex relative dark:bg-main-dark-bg">
      <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white">
        <Sidebar />
      </div>

      <div className="dark:bg-main-dark-bg bg-main-bg min-h-screen ml-72 w-full">
        <Navbar />
        <div className="p-10">
          <h2 className="text-2xl font-bold mb-4">Hospitalization History</h2>

          <table className="w-full border-collapse border border-gray-500">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Hospital Name</th>
                <th className="p-2 border">Admission Date</th>
                <th className="p-2 border">Discharge Date</th>
                <th className="p-2 border">Reason</th>
              </tr>
            </thead>
            <tbody>
              {hospHistory.map((hh, index) => (
                <tr key={index} className="border">
                  <td className="p-2 border">{hh.hospitalName}</td>
                  <td className="p-2 border">{hh.admissionDate}</td>
                  <td className="p-2 border">{hh.dischargeDate}</td>
                  <td className="p-2 border">{hh.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 p-6 bg-gray-100 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Add Hospitalization Record</h2>
            <input type="text" name="hospitalName" placeholder="Hospital Name" className="w-full p-2 mb-3 border rounded" onChange={handleAddFormChange} />
            <input type="date" name="admissionDate" className="w-full p-2 mb-3 border rounded" onChange={handleAddFormChange} />
            <input type="date" name="dischargeDate" className="w-full p-2 mb-3 border rounded" onChange={handleAddFormChange} />
            <input type="text" name="reason" placeholder="Reason" className="w-full p-2 mb-3 border rounded" onChange={handleAddFormChange} />
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={submit}>Save</button>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default HospitalizationHistory;
