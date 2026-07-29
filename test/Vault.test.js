const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  ONE_ETH,
  TWO_ETH,
  THREE_ETH,
  FIVE_ETH,
  TEN_ETH,
  MAX_FEE_BPS,
  deployVault,
  deposit,
  withdraw,
  feeAmount,
} = require("./helpers");

describe("Vault", function () {
  let vault;
  let owner;
  let alice;
  let bob;
  let treasury;

  beforeEach(async function () {
    ({ vault, owner, alice, bob, treasury } = await deployVault());
  });

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  describe("constructor", function () {
    it("sets the deployer as owner", async function () {
      expect(await vault.owner()).to.equal(owner.address);
    });

    it("sets the deployer as treasury", async function () {
      expect(await vault.treasury()).to.equal(owner.address);
    });

    it("starts with a zero withdrawal fee", async function () {
      expect(await vault.withdrawalFeeBps()).to.equal(0n);
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
  // Fee configuration
  // -------------------------------------------------------------------------

  describe("fee configuration", function () {
    it("allows the owner to set the withdrawal fee", async function () {
      await expect(vault.connect(owner).setWithdrawalFee(100))
        .to.emit(vault, "WithdrawalFeeUpdated")
        .withArgs(0n, 100n);

      expect(await vault.withdrawalFeeBps()).to.equal(100n);
    });

    it("allows the owner to set the maximum fee", async function () {
      await vault.connect(owner).setWithdrawalFee(MAX_FEE_BPS);
      expect(await vault.withdrawalFeeBps()).to.equal(MAX_FEE_BPS);
    });

    it("allows the owner to disable fees after enabling them", async function () {
      await vault.connect(owner).setWithdrawalFee(MAX_FEE_BPS);

      await expect(vault.connect(owner).setWithdrawalFee(0))
        .to.emit(vault, "WithdrawalFeeUpdated")
        .withArgs(MAX_FEE_BPS, 0n);

      expect(await vault.withdrawalFeeBps()).to.equal(0n);
    });

    it("reverts when the fee exceeds the maximum", async function () {
      await expect(vault.connect(owner).setWithdrawalFee(MAX_FEE_BPS + 1n))
        .to.be.revertedWithCustomError(vault, "InvalidFee");
    });

    it("reverts when a non-owner sets the fee", async function () {
      await expect(vault.connect(alice).setWithdrawalFee(100))
        .to.be.revertedWithCustomError(vault, "Unauthorized");
    });
  });

  // -------------------------------------------------------------------------
  // Treasury configuration
  // -------------------------------------------------------------------------

  describe("treasury configuration", function () {
    it("allows the owner to set the treasury", async function () {
      await expect(vault.connect(owner).setTreasury(treasury.address))
        .to.emit(vault, "TreasuryUpdated")
        .withArgs(owner.address, treasury.address);

      expect(await vault.treasury()).to.equal(treasury.address);
    });

    it("reverts when the treasury is the zero address", async function () {
      await expect(vault.connect(owner).setTreasury(ethers.ZeroAddress))
        .to.be.revertedWithCustomError(vault, "InvalidTreasury");
    });

    it("reverts when a non-owner sets the treasury", async function () {
      await expect(vault.connect(alice).setTreasury(treasury.address))
        .to.be.revertedWithCustomError(vault, "Unauthorized");
    });
  });

  // -------------------------------------------------------------------------
  // Withdrawals with fees
  // -------------------------------------------------------------------------

  describe("withdrawals with fees", function () {
    beforeEach(async function () {
      await vault.connect(owner).setTreasury(treasury.address);
    });

    it("deducts the fee and pays the treasury", async function () {
      const feeBps = 100n;
      const expectedFee = feeAmount(TEN_ETH, feeBps);
      const expectedUserAmount = TEN_ETH - expectedFee;

      await vault.connect(owner).setWithdrawalFee(feeBps);
      await deposit(vault, alice, TEN_ETH);

      await expect(withdraw(vault, alice, TEN_ETH)).to.changeEtherBalances(
        [alice, treasury, vault],
        [expectedUserAmount, expectedFee, -TEN_ETH]
      );

      expect(await vault.balanceOf(alice.address)).to.equal(0n);
      expect(await vault.totalAssets()).to.equal(0n);
    });

    it("sends the full amount to the user when the fee is zero", async function () {
      await vault.connect(owner).setWithdrawalFee(0);
      await deposit(vault, alice, FIVE_ETH);

      await expect(withdraw(vault, alice, TWO_ETH)).to.changeEtherBalances(
        [alice, treasury],
        [TWO_ETH, 0n]
      );

      expect(await vault.balanceOf(alice.address)).to.equal(THREE_ETH);
      expect(await vault.totalAssets()).to.equal(THREE_ETH);
    });

    it("applies the maximum fee", async function () {
      const expectedFee = feeAmount(TEN_ETH, MAX_FEE_BPS);
      const expectedUserAmount = TEN_ETH - expectedFee;

      await vault.connect(owner).setWithdrawalFee(MAX_FEE_BPS);
      await deposit(vault, alice, TEN_ETH);

      await expect(withdraw(vault, alice, TEN_ETH)).to.changeEtherBalances(
        [alice, treasury],
        [expectedUserAmount, expectedFee]
      );

      expect(await vault.balanceOf(alice.address)).to.equal(0n);
      expect(await vault.totalAssets()).to.equal(0n);
    });

    it("applies fees on a partial withdrawal and leaves the remainder", async function () {
      const feeBps = 100n;
      const expectedFee = feeAmount(TWO_ETH, feeBps);
      const expectedUserAmount = TWO_ETH - expectedFee;

      await vault.connect(owner).setWithdrawalFee(feeBps);
      await deposit(vault, alice, FIVE_ETH);

      await expect(withdraw(vault, alice, TWO_ETH)).to.changeEtherBalances(
        [alice, treasury, vault],
        [expectedUserAmount, expectedFee, -TWO_ETH]
      );

      expect(await vault.balanceOf(alice.address)).to.equal(THREE_ETH);
      expect(await vault.totalAssets()).to.equal(THREE_ETH);
    });

    it("rounds the fee down when amount * feeBps is not divisible by 10000", async function () {
      const feeBps = 100n;
      const amount = 10001n;
      const expectedFee = feeAmount(amount, feeBps);
      const expectedUserAmount = amount - expectedFee;

      expect(expectedFee).to.equal(100n);
      expect(expectedUserAmount).to.equal(9901n);

      await vault.connect(owner).setWithdrawalFee(feeBps);
      await deposit(vault, alice, amount);

      await expect(withdraw(vault, alice, amount)).to.changeEtherBalances(
        [alice, treasury],
        [expectedUserAmount, expectedFee]
      );
    });

    it("emits Withdrawn with the full requested amount, not the net payout", async function () {
      const feeBps = 100n;

      await vault.connect(owner).setWithdrawalFee(feeBps);
      await deposit(vault, alice, TEN_ETH);

      await expect(withdraw(vault, alice, TEN_ETH))
        .to.emit(vault, "Withdrawn")
        .withArgs(alice.address, TEN_ETH);
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
