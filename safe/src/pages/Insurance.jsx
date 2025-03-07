import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiZmIxZjExZS1mODgwLTRlZTktYTM3YS03MzU3NjkyNTEwZjgiLCJlbWFpbCI6InByYXNoYW50MTAxMDA3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJjMzA3NmFkZmVjNDMwMmVjODExYiIsInNjb3BlZEtleVNlY3JldCI6ImVlMDU5MzFhMzVmNzgzYmJlYTIwMjJkMzQ4Y2NkMmRmOWQ2MzczOTU0ZmY2N2IyNWM3ZjQ3YjgwN2U2NjMxODYiLCJleHAiOjE3NzE0ODU0Njl9.hFu6zWa1mjp8xZ0jp4_nj0juiJTC9fvwvj9FvWQwNIw"; // 🔹 Replace with actual JWT
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
const PINATA_API = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

const Insurance = () => {
  const [cookies, setCookie] = useCookies(["email", "hash"]);
  const [insurances, setInsurances] = useState([]);
  const [addFormData, setAddFormData] = useState({
    company: "",
    policyNo: "",
    expiry: "",
  });

  // 🔹 Load insurance data from localStorage & Pinata
  useEffect(() => {
    const fetchInsuranceData = async () => {
      try {
        const storedData = localStorage.getItem("insuranceData");
        if (storedData) {
          setInsurances(JSON.parse(storedData));
        }

        const cid = cookies["hash"];
        if (!cid) return;

        const response = await axios.get(`${PINATA_GATEWAY}${cid}`);
        if (response.data.insurance) {
          setInsurances(response.data.insurance);
          localStorage.setItem("insuranceData", JSON.stringify(response.data.insurance)); // ✅ Save locally
        }
      } catch (error) {
        console.error("Error fetching insurance data:", error);
      }
    };
    fetchInsuranceData();
  }, [cookies]);

  // 🔹 Handle input changes
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

  // 🔹 Add insurance entry (only if all fields are filled)
  const submit = async () => {
    if (!addFormData.company || !addFormData.policyNo || !addFormData.expiry) {
      alert("Please fill in all fields before adding insurance.");
      return;
    }

    try {
      const updatedData = { insurance: [...insurances, addFormData] };
      const newCid = await uploadToPinata(updatedData);
      
      setCookie("hash", newCid, { path: "/" }); // ✅ Store new CID
      setInsurances(updatedData.insurance);
      localStorage.setItem("insuranceData", JSON.stringify(updatedData.insurance)); // ✅ Save to localStorage
      alert("Insurance Added Successfully!");
    } catch (error) {
      console.error("Error adding insurance:", error);
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
          <h1 className="text-2xl font-semibold mb-5">Insurance Details</h1>
          <table className="w-full text-left border-collapse border border-gray-500">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-500 px-4 py-2">Company</th>
                <th className="border border-gray-500 px-4 py-2">Policy Number</th>
                <th className="border border-gray-500 px-4 py-2">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {insurances.map((data, index) => (
                <tr key={index} className="border border-gray-500">
                  <td className="px-4 py-2">{data.company}</td>
                  <td className="px-4 py-2">{data.policyNo}</td>
                  <td className="px-4 py-2">{data.expiry}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-5 p-5 bg-gray-100 rounded-lg w-1/2 shadow-md">
            <h2 className="text-xl font-semibold mb-3">Add Insurance</h2>
            <input type="text" name="company" placeholder="Company" className="w-full p-2 mb-3 border rounded" onChange={handleAddFormChange} />
            <input type="text" name="policyNo" placeholder="Policy No." className="w-full p-2 mb-3 border rounded" onChange={handleAddFormChange} />
            <input type="text" name="expiry" placeholder="Expiry Date" className="w-full p-2 mb-3 border rounded" onChange={handleAddFormChange} />
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={submit}>Save</button>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Insurance;
