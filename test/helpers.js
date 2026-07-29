const { ethers } = require("hardhat");

const ONE_ETH = ethers.parseEther("1");
const TWO_ETH = ethers.parseEther("2");
const THREE_ETH = ethers.parseEther("3");
const FIVE_ETH = ethers.parseEther("5");
const TEN_ETH = ethers.parseEther("10");

const BPS_DENOMINATOR = 10_000n;
const MAX_FEE_BPS = 500n;

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

function feeAmount(amount, feeBps) {
  return (amount * feeBps) / BPS_DENOMINATOR;
}

module.exports = {
  ONE_ETH,
  TWO_ETH,
  THREE_ETH,
  FIVE_ETH,
  TEN_ETH,
  BPS_DENOMINATOR,
  MAX_FEE_BPS,
  deployVault,
  deposit,
  withdraw,
  feeAmount,
};
