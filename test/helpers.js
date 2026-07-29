const { ethers } = require("hardhat");

const ONE_ETH = ethers.parseEther("1");
const TWO_ETH = ethers.parseEther("2");
const THREE_ETH = ethers.parseEther("3");
const FIVE_ETH = ethers.parseEther("5");
const TEN_ETH = ethers.parseEther("10");

async function deployVault() {
  const [owner, alice, bob, treasury] = await ethers.getSigners();

  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.connect(owner).deploy();
  await vault.waitForDeployment();

  return { vault, owner, alice, bob, treasury };
}

async function deposit(vault, account, amount) {
  return vault.connect(account).deposit({ value: amount });
}

async function withdraw(vault, account, amount) {
  return vault.connect(account).withdraw(amount);
}

module.exports = {
  ONE_ETH,
  TWO_ETH,
  THREE_ETH,
  FIVE_ETH,
  TEN_ETH,
  deployVault,
  deposit,
  withdraw,
};
