import React, { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import helpLogo from "../data/digicure.svg"; // Import your logo (place it inside 'public' or 'assets' folder)

const Help = () => {
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({ name: "", helpNeeded: "", amount: "", ethAddress: "", proof: null });
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) setAccount(accounts[0]);
      });
    } else {
      alert("Please install MetaMask to use this feature.");
    }
  }, []);

  useEffect(() => {
    const savedRequests = JSON.parse(localStorage.getItem("helpRequests")) || [];
    setRequests(savedRequests);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, proof: e.target.files[0] });
  };

  const uploadToPinata = async (file) => {
    try {
      const pinataApiKey = "c3076adfec4302ec811b";
      const pinataSecretApiKey = "ee05931a35f783bbea2022d348ccd2df9d6373954ff67b25c7f47b807e663186";

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
        },
      });

      return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
    } catch (error) {
      console.error("Pinata Upload Error:", error);
      alert("Failed to upload proof. Please try again.");
      return null;
    }
  };

  const submitRequest = async () => {
    if (!formData.name || !formData.helpNeeded || !formData.amount || !formData.ethAddress) {
      alert("Please fill in all fields, including your MetaMask address.");
      return;
    }

    if (!web3.utils.isAddress(formData.ethAddress)) {
      alert("Invalid Ethereum address. Please enter a valid MetaMask address.");
      return;
    }

    let proofURL = "";
    if (formData.proof) {
      proofURL = await uploadToPinata(formData.proof);
      if (!proofURL) return;
    }

    const newRequest = { ...formData, remainingAmount: formData.amount, proof: proofURL };
    const updatedRequests = [...requests, newRequest];

    setRequests(updatedRequests);
    localStorage.setItem("helpRequests", JSON.stringify(updatedRequests));

    alert("Help request submitted successfully!");
    setFormData({ name: "", helpNeeded: "", amount: "", ethAddress: "", proof: null });
  };

  const donate = async (index) => {
    if (!web3 || !account) {
      alert("Please connect your MetaMask wallet.");
      return;
    }

    const amountToDonate = prompt("Enter the amount you want to donate (in ETH):");
    if (!amountToDonate || isNaN(amountToDonate) || Number(amountToDonate) <= 0) {
      alert("Invalid amount entered.");
      return;
    }

    const recipientAddress = requests[index].ethAddress;
    if (!web3.utils.isAddress(recipientAddress)) {
      alert("Invalid recipient address.");
      return;
    }

    try {
      const amountInWei = web3.utils.toWei(amountToDonate, "ether");

      await web3.eth.sendTransaction({
        from: account,
        to: recipientAddress,
        value: amountInWei,
      });

      const updatedRequests = [...requests];
      updatedRequests[index].remainingAmount = (Number(updatedRequests[index].remainingAmount) - Number(amountToDonate)).toFixed(2);

      setRequests(updatedRequests);
      localStorage.setItem("helpRequests", JSON.stringify(updatedRequests));

      alert("Donation successful!");
    } catch (error) {
      console.error("Donation Error:", error);
      alert("Failed to process the donation.");
    }
  };

  return (
    <div className="p-10">
      {/* Heading with Logo */}
      <div className="flex justify-center items-center mb-6">
        <img src={helpLogo} alt="Help Logo" className="w-12 h-12 mr-3" />
        <h2 className="text-3xl font-bold text-center">Help People in Need</h2>
      </div>

      {/* Form to Ask for Help */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-xl font-semibold mb-3">Ask for Help</h3>
        <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded mb-2" />
        <input type="text" name="helpNeeded" placeholder="Help Needed (e.g., Medical Treatment)" value={formData.helpNeeded} onChange={handleChange} className="w-full p-2 border rounded mb-2" />
        <input type="number" name="amount" placeholder="Amount Needed (ETH)" value={formData.amount} onChange={handleChange} className="w-full p-2 border rounded mb-2" />
        <input type="text" name="ethAddress" placeholder="Your MetaMask Address" value={formData.ethAddress} onChange={handleChange} className="w-full p-2 border rounded mb-2" />

        <label className="block mb-2">Upload Proof (PDF, Image)</label>
        <input type="file" onChange={handleFileChange} className="w-full p-2 border rounded mb-3" />

        <button onClick={submitRequest} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Ask for Help
        </button>
      </div>

      {/* Help Requests List */}
      <h3 className="text-xl font-semibold mb-3">People Seeking Help</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Name</th>
            <th className="p-2">Help Needed</th>
            <th className="p-2">Total Amount (ETH)</th>
            <th className="p-2">Remaining Amount (ETH)</th>
            <th className="p-2">Proof</th>
            <th className="p-2">Donate</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request, index) => (
            <tr key={index} className="border-b">
              <td className="p-2">{request.name}</td>
              <td className="p-2">{request.helpNeeded}</td>
              <td className="p-2">{request.amount} ETH</td>
              <td className="p-2">{request.remainingAmount} ETH</td>
              <td className="p-2">
                {request.proof ? <a href={request.proof} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Proof</a> : "No proof"}
              </td>
              <td className="p-2">
                <button onClick={() => donate(index)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Donate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Help;
