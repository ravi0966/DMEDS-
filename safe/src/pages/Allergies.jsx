import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiZmIxZjExZS1mODgwLTRlZTktYTM3YS03MzU3NjkyNTEwZjgiLCJlbWFpbCI6InByYXNoYW50MTAxMDA3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJjMzA3NmFkZmVjNDMwMmVjODExYiIsInNjb3BlZEtleVNlY3JldCI6ImVlMDU5MzFhMzVmNzgzYmJlYTIwMjJkMzQ4Y2NkMmRmOWQ2MzczOTU0ZmY2N2IyNWM3ZjQ3YjgwN2U2NjMxODYiLCJleHAiOjE3NzE0ODU0Njl9.hFu6zWa1mjp8xZ0jp4_nj0juiJTC9fvwvj9FvWQwNIw"; // Replace with your actual JWT
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
const PINATA_API = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

const Allergies = () => {
  const [cookies, setCookie] = useCookies(["email", "hash"]);
  const [allergies, setAllergies] = useState([]);
  const [addFormData, setAddFormData] = useState({
    name: "",
    severity: "",
    reaction: "",
  });

  // 🔹 Load allergies from Local Storage & Pinata
  useEffect(() => {
    const fetchAllergyData = async () => {
      try {
        const storedData = localStorage.getItem("allergies");
        if (storedData) {
          setAllergies(JSON.parse(storedData));
        }

        const cid = cookies["hash"];
        if (!cid) return;

        const response = await axios.get(`${PINATA_GATEWAY}${cid}`);
        if (response.data.allergies) {
          setAllergies(response.data.allergies);
          localStorage.setItem("allergies", JSON.stringify(response.data.allergies)); // ✅ Save to Local Storage
        }
      } catch (error) {
        console.error("Error fetching allergy data:", error);
      }
    };
    fetchAllergyData();
  }, [cookies]);

  const handleAddFormChange = (e) => {
    setAddFormData({ ...addFormData, [e.target.name]: e.target.value });
  };

  // 🔹 Upload updated data to Pinata
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

  // 🔹 Add Allergy & Save Locally + Pinata
  const submit = async () => {
    if (!addFormData.name || !addFormData.severity || !addFormData.reaction) {
      alert("All fields must be filled!");
      return;
    }

    try {
      const updatedData = { allergies: [...allergies, addFormData] };

      // ✅ Save to Local Storage first
      setAllergies(updatedData.allergies);
      localStorage.setItem("allergies", JSON.stringify(updatedData.allergies));

      // ✅ Upload to Pinata
      const newCid = await uploadToPinata(updatedData);
      setCookie("hash", newCid, { path: "/" }); // ✅ Save new CID

      alert("Allergy Added Successfully!");
    } catch (error) {
      console.error("Error adding allergy:", error);
    }
  };

  return (
    <div className="flex relative dark:bg-main-dark-bg">
      <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white">
        <Sidebar />
      </div>
      <div className="dark:bg-main-dark-bg bg-main-bg min-h-screen ml-72 w-full">
        <Navbar />
        <div className="flex flex-col items-center p-10">
          <h1 className="text-2xl font-semibold mb-5">Allergy Details</h1>
          <table className="w-full text-left border-collapse border border-gray-500">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-500 px-4 py-2">Allergen</th>
                <th className="border border-gray-500 px-4 py-2">Severity</th>
                <th className="border border-gray-500 px-4 py-2">Reaction</th>
              </tr>
            </thead>
            <tbody>
              {allergies.map((data, index) => (
                <tr key={index} className="border border-gray-500">
                  <td className="px-4 py-2">{data.name}</td>
                  <td className="px-4 py-2">{data.severity}</td>
                  <td className="px-4 py-2">{data.reaction}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-5 p-5 bg-gray-100 rounded-lg w-1/2 shadow-md">
            <h2 className="text-xl font-semibold mb-3">Add Allergy</h2>
            <input type="text" name="name" placeholder="Allergen" className="w-full p-2 mb-3 border rounded" onChange={handleAddFormChange} />
            <input type="text" name="severity" placeholder="Severity" className="w-full p-2 mb-3 border rounded" onChange={handleAddFormChange} />
            <input type="text" name="reaction" placeholder="Reaction" className="w-full p-2 mb-3 border rounded" onChange={handleAddFormChange} />
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={submit}>Save</button>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Allergies;
