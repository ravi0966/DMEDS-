import React, { createContext, useContext, useState, useEffect } from "react";
import Web3 from "web3";
import contractABI from "../contracts/contract.json"; // Ensure correct path

const StateContext = createContext();

const initialState = {
  chat: false,
  cart: false,
  userProfile: false,
  notification: false,
};

export const ContextProvider = ({ children }) => {
  const [screenSize, setScreenSize] = useState(undefined);
  const [currentColor, setCurrentColor] = useState("#03C9D7");
  const [currentMode, setCurrentMode] = useState("Light");
  const [themeSettings, setThemeSettings] = useState(false);
  const [activeMenu, setActiveMenu] = useState(true);
  const [isClicked, setIsClicked] = useState(initialState);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [web3, setWeb3] = useState(null);

  // Connect to MetaMask & Smart Contract
  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });

          const accounts = await web3Instance.eth.getAccounts();
          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = contractABI.networks[networkId];

          if (deployedNetwork) {
            const contractInstance = new web3Instance.eth.Contract(
              contractABI.abi,
              deployedNetwork.address
            );

            setWeb3(web3Instance);
            setAccount(accounts[0]);
            setContract(contractInstance);
          } else {
            console.error("Smart contract not deployed on this network.");
          }
        } catch (error) {
          console.error("Error connecting to MetaMask:", error);
        }
      } else {
        console.error("MetaMask not detected.");
      }
    };

    initWeb3();
  }, []);

  // Function to upload data to backend (IPFS via Pinata)
  const uploadDataToIPFS = async (data) => {
    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result.cid; // Returns IPFS CID
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      return null;
    }
  };

  // Function to add doctor to blockchain
  const addDoctor = async (doctorData) => {
    if (!contract || !account) return console.error("Web3 not initialized.");

    const cid = await uploadDataToIPFS(doctorData);
    if (!cid) return console.error("Failed to upload doctor data.");

    try {
      await contract.methods.addDoctor(cid).send({ from: account });
      console.log("Doctor added successfully!");
    } catch (error) {
      console.error("Error adding doctor to blockchain:", error);
    }
  };

  // Function to fetch doctors from blockchain
  const getDoctors = async () => {
    if (!contract) return console.error("Web3 not initialized.");

    try {
      const doctorCIDs = await contract.methods.getDoctors().call();
      const doctors = await Promise.all(
        doctorCIDs.map(async (cid) => {
          const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
          return response.json();
        })
      );

      return doctors;
    } catch (error) {
      console.error("Error fetching doctors:", error);
      return [];
    }
  };

  return (
    <StateContext.Provider
      value={{
        currentColor,
        currentMode,
        activeMenu,
        screenSize,
        setScreenSize,
        handleClick: (clicked) => setIsClicked({ ...initialState, [clicked]: true }),
        isClicked,
        initialState,
        setIsClicked,
        setActiveMenu,
        setCurrentColor,
        setCurrentMode,
        setMode: (e) => {
          setCurrentMode(e.target.value);
          localStorage.setItem("themeMode", e.target.value);
        },
        setColor: (color) => {
          setCurrentColor(color);
          localStorage.setItem("colorMode", color);
        },
        themeSettings,
        setThemeSettings,
        account,
        addDoctor,
        getDoctors,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
