import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Web3 from "web3";
import contract from "../contracts/contract.json";
import { useCookies } from "react-cookie";

const Login = () => {
    const [userType, setUserType] = useState("patient");
    const [cookies, setCookie] = useCookies(["email", "hash", "type"]);
    const [loginData, setLoginData] = useState({ mail: "", password: "" });
    const [web3, setWeb3] = useState(null);
    const [myContract, setMyContract] = useState(null);

    useEffect(() => {
        const initWeb3 = async () => {
            if (window.ethereum) {
                try {
                    await window.ethereum.request({ method: "eth_requestAccounts" });
                    const web3Instance = new Web3(window.ethereum);
                    const contractInstance = new web3Instance.eth.Contract(
                        contract.abi,
                        contract.address
                    );
                    setWeb3(web3Instance);
                    setMyContract(contractInstance);
                } catch (error) {
                    console.error("Error initializing Web3:", error);
                }
            } else {
                alert("Please install MetaMask!");
            }
        };
        initWeb3();
    }, []);

    const handleChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const login = async () => {
        if (!web3 || !myContract) {
            alert("Web3 is not initialized.");
            return;
        }

        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            const currentAddress = accounts[0];
            let users = userType === "doctor"
                ? await myContract.methods.getDoctor().call()
                : await myContract.methods.getPatient().call();

            const userRequests = users.map(async (userHash) => {
                try {
                    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${userHash}`);
                    if (!response.ok) throw new Error("Failed to fetch IPFS data");
                    return { ...(await response.json()), hash: userHash };
                } catch (error) {
                    console.error(`Error fetching data from IPFS (${userHash}):`, error);
                    return null;
                }
            });

            const userDataList = (await Promise.all(userRequests)).filter(Boolean);
            const validUser = userDataList.find(user => user.mail === loginData.mail);

            if (!validUser) {
                alert("User not found!");
                return;
            }

            if (validUser.password === loginData.password) {
                setCookie("email", validUser.mail, { path: "/" });
                setCookie("hash", validUser.hash, { path: "/" });
                setCookie("type", userType, { path: "/" });
                alert("Logged in successfully!");
                window.location.href = userType === "doctor" ? "/myprofiledoc" : "/myprofile";
            } else {
                alert("Wrong Password!");
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("An error occurred while logging in.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#FFF0F5] via-[#FFEBEF] to-[#FFD6E0]">
            <div className="p-10 max-w-md w-full bg-white/50 backdrop-blur-lg rounded-lg shadow-md shadow-[#FFC1CC]">
                <h2 className="text-3xl font-bold text-center text-[#C71585] mb-5">Log In</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[#C71585] font-semibold">Email</label>
                        <input
                            type="email"
                            name="mail"
                            placeholder="youremail@gmail.com"
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-[#FFC1CC] bg-[#FFEBEF] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFC1CC]"
                        />
                    </div>
                    <div>
                        <label className="block text-[#C71585] font-semibold">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="********"
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-[#FFC1CC] bg-[#FFEBEF] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFC1CC]"
                        />
                    </div>
                    <div>
                        <label className="block text-[#C71585] font-semibold">User Type</label>
                        <select
                            name="type"
                            onChange={(e) => setUserType(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-[#FFC1CC] bg-[#FFEBEF] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFC1CC]"
                        >
                            <option value="patient">Patient</option>
                            <option value="doctor">Doctor</option>
                        </select>
                    </div>
                    <p className="text-right text-[#C71585] cursor-pointer hover:underline">Forgot password?</p>
                    <button
                        onClick={login}
                        className="w-full py-2 bg-[#FFC1CC] text-[#C71585] font-bold rounded-lg hover:bg-[#FFD6E0] transition-all duration-300 shadow-md shadow-[#FFB6C1]"
                    >
                        Log In
                    </button>
                </div>
                <p className="mt-4 text-center text-[#C71585]">
                    Don't have an account?
                    <Link to="/signup" className="ml-2 text-black font-semibold underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
