import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiZmIxZjExZS1mODgwLTRlZTktYTM3YS03MzU3NjkyNTEwZjgiLCJlbWFpbCI6InByYXNoYW50MTAxMDA3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJjMzA3NmFkZmVjNDMwMmVjODExYiIsInNjb3BlZEtleVNlY3JldCI6ImVlMDU5MzFhMzVmNzgzYmJlYTIwMjJkMzQ4Y2NkMmRmOWQ2MzczOTU0ZmY2N2IyNWM3ZjQ3YjgwN2U2NjMxODYiLCJleHAiOjE3NzE0ODU0Njl9.hFu6zWa1mjp8xZ0jp4_nj0juiJTC9fvwvj9FvWQwNIw"; // 🔹 Replace with actual JWT
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
const PINATA_API = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

const MedicalHistory = () => {
  const [cookies, setCookie] = useCookies(["email", "hash"]);
  const [medHistory, setMedHistory] = useState([]);
  const [addFormData, setAddFormData] = useState({
    disease: "",
    time: "",
    solved: "",
  });

  // 🔹 Load medical history from localStorage & Pinata
  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        const storedData = localStorage.getItem("medicalHistory");
        if (storedData) {
          setMedHistory(JSON.parse(storedData));
        }

        const cid = cookies["hash"];
        if (!cid) return;

        const response = await axios.get(`${PINATA_GATEWAY}${cid}`);
        if (response.data.medicalHistory) {
          setMedHistory(response.data.medicalHistory);
          localStorage.setItem("medicalHistory", JSON.stringify(response.data.medicalHistory));
        }
      } catch (error) {
        console.error("Error fetching medical history:", error);
      }
    };
    fetchMedicalHistory();
  }, [cookies]);

  const handleAddFormChange = (e) => {
    setAddFormData({ ...addFormData, [e.target.name]: e.target.value });
  };

  // 🔹 Upload data to Pinata
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

  // 🔹 Save medical history entry
  const submit = async () => {
    if (!addFormData.disease || !addFormData.time || addFormData.solved === "") {
      alert("Please fill in all fields before adding.");
      return;
    }

    try {
      const updatedData = { medicalHistory: [...medHistory, addFormData] };
      const newCid = await uploadToPinata(updatedData);

      setCookie("hash", newCid, { path: "/" });
      setMedHistory(updatedData.medicalHistory);
      localStorage.setItem("medicalHistory", JSON.stringify(updatedData.medicalHistory));
      alert("Medical History Added Successfully!");
    } catch (error) {
      console.error("Error adding medical history:", error);
    }
  };

  return (
    <div className="flex relative dark:bg-main-dark-bg">
      {/* Sidebar */}
      <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="dark:bg-main-dark-bg bg-main-bg min-h-screen ml-72 w-full">
        <Navbar />
        <div className="flex flex-col items-center p-10">
          <h1 className="text-2xl font-semibold mb-5">Medical History</h1>

          {/* Table */}
          <table className="w-full text-left border-collapse border border-gray-500">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-500 px-4 py-2">Disease</th>
                <th className="border border-gray-500 px-4 py-2">Time</th>
                <th className="border border-gray-500 px-4 py-2">Solved</th>
              </tr>
            </thead>
            <tbody>
              {medHistory.map((data, index) => (
                <tr key={index} className="border border-gray-500">
                  <td className="px-4 py-2">{data.disease}</td>
                  <td className="px-4 py-2">{data.time}</td>
                  <td className="px-4 py-2">{data.solved}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add Medical History Form */}
          <div className="mt-5 p-5 bg-gray-100 rounded-lg w-1/2 shadow-md">
            <h2 className="text-xl font-semibold mb-3">Add Medical History</h2>
            <input
              type="text"
              name="disease"
              placeholder="Disease"
              className="w-full p-2 mb-3 border rounded"
              onChange={handleAddFormChange}
            />
            <input
              type="text"
              name="time"
              placeholder="Time"
              className="w-full p-2 mb-3 border rounded"
              onChange={handleAddFormChange}
            />
            <input
              type="text"
              name="solved"
              placeholder="Solved (Yes/No)"
              className="w-full p-2 mb-3 border rounded"
              onChange={handleAddFormChange}
            />
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={submit}>
              Save
            </button>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default MedicalHistory;
