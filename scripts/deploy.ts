import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const NFTSwap = await ethers.getContractFactory("NFTSwap");
  const nftSwap = await NFTSwap.deploy();

  await nftSwap.waitForDeployment();
  const address = await nftSwap.getAddress();

  console.log("NFTSwap deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 