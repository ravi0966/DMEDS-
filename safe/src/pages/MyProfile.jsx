import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useCookies } from "react-cookie";

const PINATA_JWT = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiZmIxZjExZS1mODgwLTRlZTktYTM3YS03MzU3NjkyNTEwZjgiLCJlbWFpbCI6InByYXNoYW50MTAxMDA3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJjMzA3NmFkZmVjNDMwMmVjODExYiIsInNjb3BlZEtleVNlY3JldCI6ImVlMDU5MzFhMzVmNzgzYmJlYTIwMjJkMzQ4Y2NkMmRmOWQ2MzczOTU0ZmY2N2IyNWM3ZjQ3YjgwN2U2NjMxODYiLCJleHAiOjE3NzE0ODU0Njl9.hFu6zWa1mjp8xZ0jp4_nj0juiJTC9fvwvj9FvWQwNIw"; // ✅ Use JWT for security

const MyProfile = () => {
  const [cookies] = useCookies();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cid, setCid] = useState("");

  // Fetch user profile from IPFS
  useEffect(() => {
    const fetchUserData = async () => {
      const storedCid = localStorage.getItem("userCID");
      if (!storedCid) {
        alert("No profile data found!");
        return;
      }
      setCid(storedCid);

      try {
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${storedCid}`;
        const response = await fetch(ipfsUrl);
        const userData = await response.json();
        setName(userData.name);
        setEmail(userData.mail);
        setPassword(userData.password);
      } catch (error) {
        console.error("Error fetching data from IPFS:", error);
      }
    };

    fetchUserData();
  }, []);

  // Save profile to Pinata
  const saveProfile = async () => {
    const updatedData = { name, mail: email, password };
    const jsonBlob = new Blob([JSON.stringify(updatedData)], { type: "application/json" });
    const formData = new FormData();
    formData.append("file", jsonBlob, "profile.json");

    try {
      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: { Authorization: PINATA_JWT }, // ✅ Using JWT
        body: formData,
      });

      const result = await response.json();
      const newCid = result.IpfsHash;
      setCid(newCid);
      localStorage.setItem("userCID", newCid); // ✅ Store CID locally
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
    }
  };

  return (
    <div className="flex relative dark:bg-main-dark-bg min-h-screen">
      {/* Sidebar */}
      <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white">
        <Sidebar />
      </div>

      <div className="dark:bg-main-dark-bg bg-pink-100 min-h-screen ml-72 w-full flex flex-col items-center">
        {/* Navbar */}
        <div className="fixed md:static bg-pink-100 dark:bg-main-dark-bg navbar w-full">
          <Navbar />
        </div>

        {/* Profile Card */}
        <div className="flex flex-col justify-center items-center min-h-screen">
          <div className="bg-white dark:bg-secondary-dark-bg shadow-xl rounded-2xl p-8 w-96 border border-pink-300">
            <h1 className="text-3xl font-semibold text-center text-pink-600 dark:text-pink-300 mb-6">
              My Profile
            </h1>

            <div className="space-y-5">
              <div>
                <label className="text-gray-600 dark:text-gray-300 font-medium">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-pink-300 dark:border-gray-600 rounded-xl bg-pink-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-600 dark:text-gray-300 font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-pink-300 dark:border-gray-600 rounded-xl bg-pink-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-600 dark:text-gray-300 font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-pink-300 dark:border-gray-600 rounded-xl bg-pink-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={saveProfile}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl transition duration-200 transform hover:scale-105"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default MyProfile;
