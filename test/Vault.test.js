const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  ONE_ETH,
  TWO_ETH,
  THREE_ETH,
  FIVE_ETH,
  deployVault,
  deposit,
  withdraw,
} = require("./helpers");

describe("Vault", function () {
  let vault;
  let owner;
  let alice;
  let bob;

  beforeEach(async function () {
    ({ vault, owner, alice, bob } = await deployVault());
  });

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  describe("constructor", function () {
    it("sets the deployer as owner", async function () {
      expect(await vault.owner()).to.equal(owner.address);
    });
  });

  // -------------------------------------------------------------------------
  // Deposits
  // -------------------------------------------------------------------------

  describe("deposits", function () {
    it("accepts a deposit", async function () {
      await deposit(vault, alice, ONE_ETH);

      expect(await vault.balanceOf(alice.address)).to.equal(ONE_ETH);
      expect(await vault.totalAssets()).to.equal(ONE_ETH);
      expect(await ethers.provider.getBalance(await vault.getAddress())).to.equal(ONE_ETH);
    });

    it("accepts multiple deposits from the same account", async function () {
      await deposit(vault, alice, ONE_ETH);
      await deposit(vault, alice, TWO_ETH);

      expect(await vault.balanceOf(alice.address)).to.equal(THREE_ETH);
      expect(await vault.totalAssets()).to.equal(THREE_ETH);
    });

    it("tracks deposits from multiple accounts", async function () {
      await deposit(vault, alice, ONE_ETH);
      await deposit(vault, bob, TWO_ETH);

      expect(await vault.balanceOf(alice.address)).to.equal(ONE_ETH);
      expect(await vault.balanceOf(bob.address)).to.equal(TWO_ETH);
      expect(await vault.totalAssets()).to.equal(THREE_ETH);
    });

    it("reverts when depositing zero", async function () {
      await expect(vault.connect(alice).deposit({ value: 0 }))
        .to.be.revertedWithCustomError(vault, "ZeroAmount");
    });
  });

  // -------------------------------------------------------------------------
  // Withdrawals
  // -------------------------------------------------------------------------

  describe("withdrawals", function () {
    it("withdraws a partial balance", async function () {
      await deposit(vault, alice, FIVE_ETH);

      await expect(withdraw(vault, alice, TWO_ETH)).to.changeEtherBalance(alice, TWO_ETH);

      expect(await vault.balanceOf(alice.address)).to.equal(THREE_ETH);
      expect(await vault.totalAssets()).to.equal(THREE_ETH);
      expect(await ethers.provider.getBalance(await vault.getAddress())).to.equal(THREE_ETH);
    });

    it("withdraws the entire balance", async function () {
      await deposit(vault, alice, FIVE_ETH);
      await withdraw(vault, alice, FIVE_ETH);

      expect(await vault.balanceOf(alice.address)).to.equal(0n);
      expect(await vault.totalAssets()).to.equal(0n);
      expect(await ethers.provider.getBalance(await vault.getAddress())).to.equal(0n);
    });

    it("reverts when withdrawing zero", async function () {
      await deposit(vault, alice, ONE_ETH);

      await expect(vault.connect(alice).withdraw(0))
        .to.be.revertedWithCustomError(vault, "ZeroAmount");
    });

    it("reverts when withdrawing more than balance", async function () {
      await deposit(vault, alice, ONE_ETH);

      await expect(vault.connect(alice).withdraw(TWO_ETH))
        .to.be.revertedWithCustomError(vault, "InsufficientBalance");
    });
  });

  // -------------------------------------------------------------------------
  // Ownership
  // -------------------------------------------------------------------------

  describe("ownership", function () {
    it("transfers ownership", async function () {
      await vault.connect(owner).transferOwnership(bob.address);
      expect(await vault.owner()).to.equal(bob.address);
    });

    it("reverts when a non-owner transfers ownership", async function () {
      await expect(vault.connect(alice).transferOwnership(bob.address))
        .to.be.revertedWithCustomError(vault, "Unauthorized");
    });

    it("reverts when the new owner is the zero address", async function () {
      await expect(vault.connect(owner).transferOwnership(ethers.ZeroAddress))
        .to.be.revertedWithCustomError(vault, "InvalidOwner");
    });
  });
});
