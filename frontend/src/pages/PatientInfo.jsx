import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar2 from "../components/Sidebar2";
import Footer from "../components/Footer";
import { fetchFromPinata } from "../utils/ipfsUtils"; // IPFS Fetch Utility

const PatientInfo = () => {
    const { phash } = useParams();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function getPatient() {
            try {
                setLoading(true);
                const data = await fetchFromPinata(phash);
                if (!data) throw new Error("No data found on IPFS.");
                setPatient(data);
            } catch (error) {
                console.error("Error fetching patient data:", error);
                setError("Failed to fetch patient data.");
            } finally {
                setLoading(false);
            }
        }
        getPatient();
    }, [phash]);

    const renderTable = (title, data, headers) => (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-2">{title}</h1>
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        {headers.map((header, index) => (
                            <th key={index} className="border border-gray-300 p-2">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data && data.length > 0 ? (
                        data.map((row, index) => (
                            <tr key={index} className="text-center">
                                {headers.map((header, idx) => (
                                    <td key={idx} className="border border-gray-300 p-2">
                                        {row[header.toLowerCase()] || "N/A"}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={headers.length} className="text-center p-2">No Data Available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

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
                    {loading ? (
                        <p className="text-center text-lg">Loading patient data...</p>
                    ) : error ? (
                        <p className="text-center text-red-500">{error}</p>
                    ) : (
                        <>
                            <h2 className="text-3xl font-bold mb-4 text-center">{patient.name}'s Medical Record</h2>
                            {renderTable("Insurance", patient.insurance || [], ["Company", "PolicyNo", "Expiry"])}
                            {renderTable("Allergies", patient.allergies || [], ["Name", "Type", "Medication"])}
                            {renderTable("Medical History", patient.medicalhistory || [], ["Disease", "Time", "Solved"])}
                            {renderTable("Hospitalization History", patient.hospitalizationhistory || [], ["DateFrom", "DateTo", "Reason", "Surgery"])}
                            {renderTable("Checkup History", patient.visit || [], ["Name", "Date", "Reason"])}
                        </>
                    )}
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default PatientInfo;
