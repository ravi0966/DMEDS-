import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiZmIxZjExZS1mODgwLTRlZTktYTM3YS03MzU3NjkyNTEwZjgiLCJlbWFpbCI6InByYXNoYW50MTAxMDA3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJjMzA3NmFkZmVjNDMwMmVjODExYiIsInNjb3BlZEtleVNlY3JldCI6ImVlMDU5MzFhMzVmNzgzYmJlYTIwMjJkMzQ4Y2NkMmRmOWQ2MzczOTU0ZmY2N2IyNWM3ZjQ3YjgwN2U2NjMxODYiLCJleHAiOjE3NzE0ODU0Njl9.hFu6zWa1mjp8xZ0jp4_nj0juiJTC9fvwvj9FvWQwNIw";  // 🔹 Replace with your actual JWT
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
const PINATA_API = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

const Visits = () => {
  const [cookies, setCookie] = useCookies(["email", "hash"]);
  const [visits, setVisits] = useState([]);
  const [addFormData, setAddFormData] = useState({
    name: "",
    date: "",
    reason: "",
  });

  // 🔹 Load visits from Local Storage & IPFS
  useEffect(() => {
    const fetchVisitData = async () => {
      try {
        // Retrieve local data first
        const storedData = localStorage.getItem("visitRecords");
        if (storedData) {
          setVisits(JSON.parse(storedData));
        }

        // Retrieve from IPFS if CID is available
        const cid = cookies["hash"];
        if (!cid) return;

        const response = await axios.get(`${PINATA_GATEWAY}${cid}`);
        if (response.data.visit) {
          setVisits(response.data.visit);
          localStorage.setItem("visitRecords", JSON.stringify(response.data.visit));  // ✅ Save locally
        }
      } catch (error) {
        console.error("Error fetching visit data:", error);
      }
    };

    fetchVisitData();
  }, [cookies]);

  const handleAddFormChange = (e) => {
    setAddFormData({ ...addFormData, [e.target.name]: e.target.value });
  };

  // 🔹 Upload updated visit history to Pinata
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

  // 🔹 Add Visit Record
  const handleSubmit = async () => {
    if (!addFormData.name || !addFormData.date || !addFormData.reason) {
      alert("Please fill all fields before saving.");
      return;
    }

    try {
      const updatedData = { visit: [...visits, addFormData] };
      const newCid = await uploadToPinata(updatedData);

      document.cookie = `hash=${newCid}; path=/`;  // ✅ Save new CID as a cookie
      setVisits(updatedData.visit);
      localStorage.setItem("visitRecords", JSON.stringify(updatedData.visit));  // ✅ Save to Local Storage

      alert("Checkup History Saved Successfully!");
    } catch (error) {
      console.error("Error saving visit data:", error);
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
          <h2 className="text-2xl font-bold mb-4">Checkup History</h2>

          <table className="w-full border-collapse border border-gray-500">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Name Of Professional</th>
                <th className="p-2 border">Date Of Visit</th>
                <th className="p-2 border">Reason</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit, index) => (
                <tr key={index} className="border">
                  <td className="p-2 border">{visit.name}</td>
                  <td className="p-2 border">{visit.date}</td>
                  <td className="p-2 border">{visit.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 p-6 bg-gray-100 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Add Your Medical History</h2>
            <input type="text" name="name" placeholder="Name Of Professional" className="w-full p-2 mb-3 border rounded" onChange={handleAddFormChange} />
            <input type="date" name="date" className="w-full p-2 mb-3 border rounded" onChange={handleAddFormChange} />
            <input type="text" name="reason" placeholder="Reason" className="w-full p-2 mb-3 border rounded" onChange={handleAddFormChange} />
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSubmit}>Save</button>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Visits;
