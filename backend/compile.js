const solc = require('solc');
const fs = require('fs');
const path = require('path');

// Read Solidity contract
const contractPath = path.resolve(__dirname, 'contracts', 'Cruds.sol');
const sourceCode = fs.readFileSync(contractPath, 'utf8');

// Solidity compiler input format
const input = {
  language: 'Solidity',
  sources: {
    'Cruds.sol': {
      content: sourceCode,
    },
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode'],
      },
    },
  },
};

// Compile the contract
const compiledCode = JSON.parse(solc.compile(JSON.stringify(input)));

// Extract ABI and Bytecode
if (
  compiledCode.contracts &&
  compiledCode.contracts['Cruds.sol'] &&
  compiledCode.contracts['Cruds.sol'].Cruds
) {
  const abi = compiledCode.contracts['Cruds.sol'].Cruds.abi;
  const bytecode = compiledCode.contracts['Cruds.sol'].Cruds.evm.bytecode.object;

  console.log('✅ ABI:', JSON.stringify(abi, null, 2));
  console.log('✅ Bytecode:', bytecode.substring(0, 60) + '...'); // Print first 60 chars only

  // Save ABI and Bytecode to files
  fs.writeFileSync(path.resolve(__dirname, 'contracts', 'Cruds.abi'), JSON.stringify(abi, null, 2));
  fs.writeFileSync(path.resolve(__dirname, 'contracts', 'Cruds.bin'), bytecode);
  console.log('✅ Compilation Successful! ABI and Bytecode saved.');
} else {
  console.error('❌ Compilation failed! Check contract syntax and Solidity version.');
}
