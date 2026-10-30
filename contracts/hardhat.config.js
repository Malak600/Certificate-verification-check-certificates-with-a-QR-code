require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("solidity-coverage");
try { require("dotenv").config(); } catch (e) { /* dotenv is optional */ }

const { subtask } = require("hardhat/config");
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require("hardhat/builtin-tasks/task-names");

// Use the solc compiler from npm (works offline), instead of downloading it.
subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD, async (args, hre, runSuper) => {
  if (args.solcVersion === "0.8.24") {
    const compilerPath = require.resolve("solc/soljson.js");
    return { compilerPath, isSolcJs: true, version: args.solcVersion, longVersion: "0.8.24+commit.e11b9ed9" };
  }
  return runSuper();
});

module.exports = {
  solidity: { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};
