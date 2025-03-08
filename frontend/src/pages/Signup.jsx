import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Web3 from "web3";
import contract from "../contracts/contract.json";
import axios from "axios";
import "./Signup.css";

const Signup = () => {
    const navigate = useNavigate();
    const [type, setType] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        mail: "",
        password: "",
        insurance: [],
        allergies: [],
        medicalhistory: [],
        hospitalizationhistory: [],
        visit: [],
        selectedDoctors: [],
        license: "",
        speciality: ""
    });

    // Handle Input Changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Upload JSON to Pinata
    const uploadToPinata = async (data) => {
        try {
            const pinataApiKey = "c3076adfec4302ec811b";
            const pinataSecretApiKey = "ee05931a35f783bbea2022d348ccd2df9d6373954ff67b25c7f47b807e663186";

            const response = await axios.post(
                "https://api.pinata.cloud/pinning/pinJSONToIPFS",
                data,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "pinata_api_key": pinataApiKey,
                        "pinata_secret_api_key": pinataSecretApiKey
                    }
                }
            );

            console.log("Uploaded to Pinata:", response.data);
            return response.data.IpfsHash;
        } catch (error) {
            console.error("Pinata Upload Error:", error);
            throw new Error("Failed to upload data to IPFS.");
        }
    };

    // Register User
    const register = async () => {
        try {
            if (!window.ethereum) {
                alert("MetaMask is required to sign up. Please install it.");
                return;
            }

            // Connect to MetaMask
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            const currentAddress = accounts[0];

            // Web3 & Contract Setup
            const web3 = new Web3(window.ethereum);
            const myContract = new web3.eth.Contract(contract.abi, contract.address);

            // Upload to Pinata
            const ipfsHash = await uploadToPinata(formData);

            // Store new doctor CID in localStorage (Array Format)
            if (type) { // Only store doctors
                let existingDoctors = JSON.parse(localStorage.getItem("doctorCIDs")) || [];
                existingDoctors.push(ipfsHash);
                localStorage.setItem("doctorCIDs", JSON.stringify(existingDoctors));
            }

            // Call Smart Contract Function (if needed)
            if (!type) {
                await myContract.methods.addPatient(ipfsHash).send({ from: currentAddress });
            } else {
                await myContract.methods.addDoctor(ipfsHash).send({ from: currentAddress });
            }

            alert("Account created successfully!");
            navigate("/login");
        } catch (error) {
            console.error("Registration Error:", error);
            alert("Error creating account. Please try again.");
        }
    };

    return (
        <div className="signup-container flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-50 to-pink-200 ">
            <form className="signup-form backdrop-blur-lg p-6 bg-gradient-to-b from-white/60 to-white/30 border border-pink-300 shadow-lg w-[28rem] rounded-xl flex flex-col items-center">

                <h2 className="text-3xl font-bold text-center text-pink-900 mb-5">Sign Up</h2>

                <div className="input-container">
                    <div className="input-div mb-4">
                        <label className="block text-pink-700 font-medium">Full Name</label>
                        <input name="name" onChange={handleChange} placeholder="Enter full name" className="w-full p-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
                    </div>

                    <div className="input-div mb-4">
                        <label className="block text-pink-700 font-medium">User Type</label>
                        <select name="type" onChange={() => setType(!type)} className="w-full p-3 border border-pink-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pink-500">
                            <option value="patient">Patient</option>
                            <option value="doctor">Doctor</option>
                        </select>
                    </div>

                    <div className="input-div mb-4">
                        <label className="block text-pink-700 font-medium">Email</label>
                        <input name="mail" onChange={handleChange} type="email" placeholder="youremail@gmail.com" className="w-full p-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
                    </div>

                    {type && (
                        <div className="doctor-fields">
                            <div className="input-div mb-4">
                                <label className="block text-pink-700 font-medium">Specialization</label>
                                <input name="speciality" onChange={handleChange} placeholder="Enter specialization" className="w-full p-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
                            </div>

                            <div className="input-div mb-4">
                                <label className="block text-pink-700 font-medium">License No.</label>
                                <input name="license" onChange={handleChange} placeholder="Enter license number" className="w-full p-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
                            </div>
                        </div>
                    )}

                    <div className="input-div mb-4 ">
                        <label className="block text-pink-700 font-medium">Password</label>
                        <input name="password" onChange={handleChange} type="password" placeholder="********" className="w-full p-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
                    </div>

                    <button type="button" onClick={register} className="w-full bg-pink-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-pink-600 transition transform hover:scale-105">
                        Sign Up
                    </button>

                    <p className="text-center text-pink-700 mt-4">
                        Already a user?{" "}
                        <Link className="text-pink-600 font-semibold underline" to="/login">
                            Log In
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Signup;
