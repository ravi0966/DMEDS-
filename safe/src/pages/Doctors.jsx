import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        async function getDoctors() {
            try {
                // Get doctor CIDs from localStorage
                const doctorCIDs = JSON.parse(localStorage.getItem("doctorCIDs")) || [];

                if (doctorCIDs.length === 0) {
                    console.warn("⚠️ No doctor CIDs found in local storage.");
                    return;
                }

                // Fetch all doctor data from Pinata
                const doctorDataList = await Promise.all(
                    doctorCIDs.map(async (cid) => {
                        try {
                            const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`);
                            return response.data;
                        } catch (error) {
                            console.error(`❌ Error fetching doctor data for CID ${cid}:`, error);
                            return null;
                        }
                    })
                );

                // Remove null values (failed fetches)
                const validDoctors = doctorDataList.filter((doctor) => doctor !== null);

                if (validDoctors.length === 0) {
                    console.warn("⚠️ No valid doctor data found in IPFS.");
                    return;
                }

                console.log("✅ Doctors Data from IPFS:", validDoctors);
                setDoctors(validDoctors);
            } catch (error) {
                console.error("❌ Error fetching doctors from IPFS:", error);
            }
        }

        getDoctors();
    }, []);

    return (
        <div className="flex relative dark:bg-main-dark-bg">
            <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white">
                <Sidebar />
            </div>

            <div className="dark:bg-main-dark-bg bg-main-bg min-h-screen ml-72 w-full">
                <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full">
                    <Navbar />
                </div>

                <div className="p-10">
                    <h2 className="text-xl font-bold mb-4">Available Doctors</h2>
                    {doctors.length === 0 ? (
                        <p>No doctors found.</p>
                    ) : (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Speciality</th>
                                </tr>
                            </thead>
                            <tbody>
                                {doctors.map((doctor, index) => (
                                    <tr key={index}>
                                        <td>{doctor.name}</td>
                                        <td>{doctor.mail}</td>
                                        <td>{doctor.speciality}</td>
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

export default Doctors;
