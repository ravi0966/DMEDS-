import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const PINATA_JWT = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiZmIxZjExZS1mODgwLTRlZTktYTM3YS03MzU3NjkyNTEwZjgiLCJlbWFpbCI6InByYXNoYW50MTAxMDA3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJjMzA3NmFkZmVjNDMwMmVjODExYiIsInNjb3BlZEtleVNlY3JldCI6ImVlMDU5MzFhMzVmNzgzYmJlYTIwMjJkMzQ4Y2NkMmRmOWQ2MzczOTU0ZmY2N2IyNWM3ZjQ3YjgwN2U2NjMxODYiLCJleHAiOjE3NzE0ODU0Njl9.hFu6zWa1mjp8xZ0jp4_nj0juiJTC9fvwvj9FvWQwNIw";

const MyProfile = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [cid, setCid] = useState("");

  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      setUserData(JSON.parse(storedProfile));
    }
  }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const uploadToPinata = async (data) => {
    try {
      const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: PINATA_JWT,
        },
        body: JSON.stringify({ pinataContent: data }),
      });

      const result = await response.json();
      return result.IpfsHash;
    } catch (error) {
      console.error("❌ Pinata Upload Error:", error);
      return null;
    }
  };

  const saveProfile = async () => {
    const newCID = await uploadToPinata(userData);
    if (!newCID) {
      alert("❌ Failed to upload profile data to IPFS.");
      return;
    }

    setCid(newCID);
    localStorage.setItem("userProfile", JSON.stringify(userData));
    alert("✅ Profile Updated Successfully!");
  };

  return (
    <div className="flex relative dark:bg-main-dark-bg">
      <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white">
        <Sidebar />
      </div>

      <div className="dark:bg-main-dark-bg bg-main-bg min-h-screen ml-72 w-full">
        <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full">
          <Navbar />
        </div>

        <div className="flex justify-center items-center h-screen">
          <form className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg w-96">
            <h1 className="text-center text-2xl font-bold mb-4 dark:text-white">User Profile</h1>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                className="w-full p-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white"
                name="name"
                type="text"
                value={userData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                className="w-full p-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white"
                name="email"
                type="email"
                value={userData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input
                className="w-full p-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white"
                name="password"
                type="password"
                value={userData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="button"
              onClick={saveProfile}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium p-3 rounded-md"
            >
              Save Profile
            </button>
          </form>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default MyProfile;
