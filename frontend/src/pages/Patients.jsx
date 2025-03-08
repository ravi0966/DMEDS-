import React, { useState, useEffect } from "react";
import Web3 from "web3";
import Navbar from "../components/Navbar";
import Sidebar2 from "../components/Sidebar2";
import contract from "../contracts/contract.json";

const Patients = () => {
    const web3 = new Web3(window.ethereum);
    const mycontract = new web3.eth.Contract(contract["abi"], contract["address"]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

    useEffect(() => {
        async function getPatients() {
            setLoading(true);
            const pat = [];
            const vis = new Set(); // Store unique emails

            try {
                const res = await mycontract.methods.getPatient().call();
                console.log("📌 Fetched Patients from Smart Contract:", res);

                for (let i = res.length - 1; i >= 0; i--) {
                    const response = await fetch(`${IPFS_GATEWAY}${res[i]}`);
                    const data = await response.json();

                    if (!vis.has(data.mail)) {
                        vis.add(data.mail);
                        data["hash"] = res[i]; // Store IPFS hash
                        pat.push(data);
                    }
                }
            } catch (error) {
                console.error("❌ Error fetching patients:", error);
            }

            setPatients(pat);
            setLoading(false);
        }

        getPatients();
    }, []);

    function view(phash) {
        window.location.href = `/patientData/${phash}`;
    }

    return (
        <div className="flex relative dark:bg-main-dark-bg">
            <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white">
                <Sidebar2 />
            </div>

            <div className="dark:bg-main-dark-bg bg-main-bg min-h-screen ml-72 w-full">
                <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full">
                    <Navbar />
                </div>

                <div className="p-10">
                    <h2 className="text-xl font-bold mb-4">All Patients</h2>

                    {loading ? (
                        <p>Loading patients...</p>
                    ) : patients.length === 0 ? (
                        <p>No patients found.</p>
                    ) : (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-pink-200 text-black">
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Email</th>
                                    <th className="p-2">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map((patient) => (
                                    <tr key={patient.hash} className="border-b">
                                        <td className="p-2">{patient.name}</td>
                                        <td className="p-2">{patient.mail}</td>
                                        <td>
                                            <button
                                                className="bg-blue-500 text-white px-3 py-1 rounded-lg"
                                                onClick={() => view(patient.hash)}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Patients;
