import React, { useState, useEffect } from "react";
import Web3 from "web3";
import Navbar from "../components/Navbar";
import Sidebar2 from "../components/Sidebar2";
import contract from "../contracts/contract.json";
import { useCookies } from "react-cookie";

const Patients = () => {
    const web3 = new Web3(window.ethereum);
    const mycontract = new web3.eth.Contract(contract["abi"], contract["address"]);
    const [patients, setPatients] = useState([]);
    const [cookies] = useCookies();

    // Use Pinata’s public gateway
    const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

    useEffect(() => {
        async function getPatients() {
            const pat = [];
            const vis = [];

            await mycontract.methods.getPatient().call().then(async (res) => {
                console.log(res);
                for (let i = res.length - 1; i >= 0; i--) {
                    const data = await (await fetch(`${IPFS_GATEWAY}${res[i]}`)).json();
                    const selected = data.selectedDoctors;

                    if (!vis.includes(data.mail)) {
                        vis.push(data.mail);
                        for (let j = 1; j < selected.length; j++) {
                            if (selected[j] === cookies['hash']) {
                                let flag = 0;
                                for (let k = 0; k < pat.length; k++) {
                                    if (pat[k].mail === data.mail) {
                                        flag = 1;
                                        break;
                                    }
                                }
                                if (flag === 0) {
                                    data['hash'] = res[i];
                                    pat.push(data);
                                }
                            }
                        }
                    }
                }
            });

            setPatients(pat);
        }

        getPatients();
    }, [patients.length]);

    function view(phash) {
        const url = `/patientData/${phash}`;
        window.location.href = url;
    }

    async function treated(phash) {
        var accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        var currentaddress = accounts[0];

        const web3 = new Web3(window.ethereum);
        const mycontract = new web3.eth.Contract(contract['abi'], contract['address']);

        // Fetch patient data from IPFS
        const data = await (await fetch(`${IPFS_GATEWAY}${phash}`)).json();
        data.selectedDoctors = data.selectedDoctors.filter(doctor => doctor !== cookies['hash']);

        // Upload updated data to Pinata
        const pinataApiKey = "c3076adfec4302ec811b";
        const pinataSecretApiKey = "ee05931a35f783bbea2022d348ccd2df9d6373954ff67b25c7f47b807e663186";
        const pinataUrl = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

        const response = await fetch(pinataUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "pinata_api_key": pinataApiKey,
                "pinata_secret_api_key": pinataSecretApiKey
            },
            body: JSON.stringify({ data }),
        });

        const pinataResponse = await response.json();
        const newCid = pinataResponse.IpfsHash; // New CID

        // Update smart contract with the new CID
        await mycontract.methods.addPatient(newCid).send({ from: currentaddress })
            .then(() => {
                alert("Patient Record Updated");
                window.location.reload();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    function showPatients() {
        return patients.map((patient) => {
            if (patient.hasOwnProperty('name')) {
                return (
                    <tr key={patient.hash}>
                        <td>{patient.name}</td>
                        <td>{patient.mail}</td>
                        <td>
                            <input type="button" value="View" onClick={() => view(patient.hash)} />
                        </td>
                        <td>
                            <input type="button" value="Treated" onClick={() => treated(patient.hash)} />
                        </td>
                    </tr>
                );
            }
            return null;
        });
    }

    return (
        <div className="flex relative dark:bg-main-dark-bg">
            <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white ">
                <Sidebar2 />
            </div>

            <div className={"dark:bg-main-dark-bg bg-main-bg min-h-screen ml-72 w-full"}>
                <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full ">
                    <Navbar />
                </div>
                <div style={{ display: "flex", flexDirection: "column", padding: "1rem" }}>
                    <table style={{ borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th className="">Name</th>
                                <th className="">Email</th>
                                <th className="">Details</th>
                                <th className="">Treated?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {showPatients()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Patients;
