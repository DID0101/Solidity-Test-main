// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/// @title Vault
/// @notice A simple ETH vault that tracks user balances.
/// @dev Starter code for the assessment. Prefer clarity over cleverness.
contract Vault {
    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    uint256 public constant MAX_WITHDRAWAL_FEE_BPS = 500;

    uint256 private constant BPS_DENOMINATOR = 10_000;

    // -------------------------------------------------------------------------
    // Storage
    // -------------------------------------------------------------------------

    address private _owner;

    uint256 public totalAssets;

    uint256 public withdrawalFeeBps;

    address public treasury;

    mapping(address => uint256) private _balances;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event Deposited(address indexed account, uint256 amount);

    event Withdrawn(address indexed account, uint256 amount);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    event WithdrawalFeeUpdated(uint256 previousFeeBps, uint256 newFeeBps);

    event TreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    error Unauthorized();
    error InvalidOwner();
    error InvalidFee();
    error InvalidTreasury();
    error ZeroAmount();
    error InsufficientBalance();
    error ETHTransferFailed();

    // -------------------------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------------------------

    modifier onlyOwner() {
        if (msg.sender != _owner) {
            revert Unauthorized();
        }

        _;
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor() {
        _setOwner(msg.sender);
        _setTreasury(msg.sender);
    }

    /// @notice Accepts direct ETH transfers.
    /// @dev Direct transfers are NOT accounted as user deposits.
    receive() external payable { }

    // -------------------------------------------------------------------------
    // Ownership
    // -------------------------------------------------------------------------

    /// @notice Transfers ownership to another account.
    function transferOwnership(
        address newOwner
    ) external onlyOwner {
        if (newOwner == address(0)) {
            revert InvalidOwner();
        }

        _setOwner(newOwner);
    }

    // -------------------------------------------------------------------------
    // Fee configuration
    // -------------------------------------------------------------------------

    /// @notice Sets the withdrawal fee in basis points.
    function setWithdrawalFee(
        uint256 feeBps
    ) external onlyOwner {
        if (feeBps > MAX_WITHDRAWAL_FEE_BPS) {
            revert InvalidFee();
        }

        uint256 previousFeeBps = withdrawalFeeBps;

        withdrawalFeeBps = feeBps;

        emit WithdrawalFeeUpdated(previousFeeBps, feeBps);
    }

    /// @notice Sets the treasury address that receives withdrawal fees.
    function setTreasury(
        address newTreasury
    ) external onlyOwner {
        if (newTreasury == address(0)) {
            revert InvalidTreasury();
        }

        _setTreasury(newTreasury);
    }

    // -------------------------------------------------------------------------
    // User actions
    // -------------------------------------------------------------------------

    /// @notice Deposits ETH into the vault.
    function deposit() external payable {
        _deposit(msg.sender, msg.value);
    }

    /// @notice Withdraws previously deposited ETH.
    function withdraw(
        uint256 amount
    ) external {
        _withdraw(msg.sender, amount);
    }

    // -------------------------------------------------------------------------
    // Views
    // -------------------------------------------------------------------------

    /// @notice Returns the current owner.
    function owner() external view returns (address) {
        return _owner;
    }

    /// @notice Returns the tracked balance of an account.
    function balanceOf(
        address account
    ) external view returns (uint256) {
        return _balances[account];
    }

    // -------------------------------------------------------------------------
    // Internal
    // -------------------------------------------------------------------------

    function _deposit(
        address account,
        uint256 amount
    ) internal {
        if (amount == 0) {
            revert ZeroAmount();
        }

        _balances[account] += amount;

        totalAssets += amount;

        emit Deposited(account, amount);
    }

    function _withdraw(
        address account,
        uint256 amount
    ) internal {
        if (amount == 0) {
            revert ZeroAmount();
        }

        uint256 balance = _balances[account];

        if (balance < amount) {
            revert InsufficientBalance();
        }

        uint256 feeAmount = (amount * withdrawalFeeBps) / BPS_DENOMINATOR;
        uint256 userAmount = amount - feeAmount;

        _balances[account] = balance - amount;

        totalAssets -= amount;

        if (feeAmount > 0) {
            _transferETH(treasury, feeAmount);
        }

        _transferETH(account, userAmount);

        emit Withdrawn(account, amount);
    }

    function _transferETH(
        address recipient,
        uint256 amount
    ) internal {
        (bool success,) = recipient.call{ value: amount }("");

        if (!success) {
            revert ETHTransferFailed();
        }
    }

    function _setOwner(
        address newOwner
    ) internal {
        address previousOwner = _owner;

        _owner = newOwner;

        emit OwnershipTransferred(previousOwner, newOwner);
    }

    function _setTreasury(
        address newTreasury
    ) internal {
        address previousTreasury = treasury;

        treasury = newTreasury;

        emit TreasuryUpdated(previousTreasury, newTreasury);
    }
}
