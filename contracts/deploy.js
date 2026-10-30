// Deploys CertificateRegistry to the network given with --network (e.g. sepolia).
// The deploying wallet becomes admin and first issuer.
const { ethers, network } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Network:  ", network.name);
  console.log("Deployer: ", deployer.address);

  const registry = await ethers.deployContract("CertificateRegistry");
  await registry.waitForDeployment();

  console.log("CertificateRegistry deployed at:", await registry.getAddress());
  if (network.name === "sepolia") {
    console.log("Etherscan: https://sepolia.etherscan.io/address/" + (await registry.getAddress()));
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
