const fs = require('fs');
const path = require('path');
const Web3 = require('web3');

// Connect to Ganache RPC
const web3 = new Web3('http://127.0.0.1:7545'); // Ensure Ganache is running

// Load ABI and Bytecode
const abi = JSON.parse(fs.readFileSync(path.join(__dirname, 'contracts', 'Cruds.abi'), 'utf8'));
const bytecode = '0x' + fs.readFileSync(path.join(__dirname, 'contracts', 'Cruds.bin'), 'utf8');

const deploy = async () => {
  try {
    const accounts = await web3.eth.getAccounts(); // Get available accounts
    const deployerAccount = accounts[0]; // Use the first account from Ganache

    console.log("📢 Deploying contract from:", deployerAccount);

    // Create Contract Instance
    const contract = new web3.eth.Contract(abi);

    // Deploy Contract
    const deployedContract = await contract.deploy({ data: bytecode })
      .send({ from: deployerAccount, gas: 6721975 });

    console.log("✅ Contract deployed at:", deployedContract.options.address);

    // Save contract address for later use
    fs.writeFileSync(path.join(__dirname, 'contracts', 'contract-address.txt'), deployedContract.options.address);
  } catch (error) {
    console.error("❌ Error during deployment:", error);
  }
};

deploy();
