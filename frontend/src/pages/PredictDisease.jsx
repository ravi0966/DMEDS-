import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

const PredictDisease = () => {
    const [itching, setItching] = useState(false);
    const [skinrash, setSkinRash] = useState(false);
    const [shivering, setShivering] = useState(false);
    const [vomiting, setVomiting] = useState(false);
    const [stomachache, setStomachAche] = useState(false);
    const [headache, setHeadAche] = useState(false);
    const [cough, setCough] = useState(false);
    const [fever, setFever] = useState(false);
    const [lethargy, setLethargy] = useState(false);
    const [chestpain, setChestPain] = useState(false);

    const [disease, setDisease] = useState("");
    const [ipfsHash, setIpfsHash] = useState("");

    // Pinata API Keys (store securely in .env file)
    const PINATA_API_KEY = "YOUR_PINATA_API_KEY";
    const PINATA_SECRET_KEY = "YOUR_PINATA_SECRET_KEY";

    async function check() {
        const data = {
            "Itching": itching,
            "Skin Rash": skinrash,
            "Shivering": shivering,
            "Vomiting": vomiting,
            "Stomach Pain": stomachache,
            "Headache": headache,
            "Cough": cough,
            "High Fever": fever,
            "Lethargy": lethargy,
            "Chest Pain": chestpain,
        };

        try {
            // Send symptoms to Flask API for diagnosis
            const response = await fetch(`http://192.168.1.20:5000/${JSON.stringify(data)}`, {
                headers: { "Content-Type": "application/json" },
            });

            const result = await response.json();
            setDisease(result.diagnosis); // Assuming API returns { diagnosis: "Disease Name" }

            // Upload diagnosis result to Pinata
            const pinataData = JSON.stringify({
                name: "MediVault Diagnosis",
                description: "Diagnosis results stored on IPFS via Pinata",
                disease: result.diagnosis,
                symptoms: data,
                timestamp: new Date().toISOString(),
            });

            const pinataResponse = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", pinataData, {
                headers: {
                    "Content-Type": "application/json",
                    pinata_api_key: "c3076adfec4302ec811b",
                    pinata_secret_api_key: "ee05931a35f783bbea2022d348ccd2df9d6373954ff67b25c7f47b807e663186",
                },
            });

            if (pinataResponse.data.IpfsHash) {
                setIpfsHash(pinataResponse.data.IpfsHash);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to fetch diagnosis or upload to IPFS.");
        }
    }

    return (
        <div className="flex relative dark:bg-main-dark-bg">
            <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white">
                <Sidebar />
            </div>

            <div className="dark:bg-main-dark-bg bg-main-bg min-h-screen ml-72 w-full">
                <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full">
                    <Navbar />
                </div>
                <div className="flex flex-col items-center p-16 gap-4">
                    <h1>Not Feeling Well?</h1>
                    <p>Answer the following questions for a quick diagnosis.</p>

                    <form className="w-3/5 space-y-4">
                        {[
                            ["Itching", setItching],
                            ["Skin Rash", setSkinRash],
                            ["Shivering", setShivering],
                            ["Vomiting", setVomiting],
                            ["Stomach Pain", setStomachAche],
                            ["Headache", setHeadAche],
                            ["Cough", setCough],
                            ["High Fever", setFever],
                            ["Lethargy", setLethargy],
                            ["Chest Pain", setChestPain],
                        ].map(([label, setter], index) => (
                            <div key={index} className="flex justify-between items-center">
                                <h2>{index + 1}. {label}</h2>
                                <select onChange={(e) => setter(e.target.value === "true")}>
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
                                </select>
                            </div>
                        ))}

                        <button
                            type="button"
                            className="mt-4 bg-teal-500 text-white py-2 px-4 rounded"
                            onClick={check}
                        >
                            Submit
                        </button>

                        {disease && (
                            <div className="mt-6 p-4 bg-gray-800 text-white rounded">
                                <h3>Predicted Diagnosis: {disease}</h3>
                                {ipfsHash && (
                                    <p>
                                        Stored on IPFS:{" "}
                                        <a
                                            href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 underline"
                                        >
                                            View on IPFS
                                        </a>
                                    </p>
                                )}
                            </div>
                        )}
                    </form>
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default PredictDisease;
