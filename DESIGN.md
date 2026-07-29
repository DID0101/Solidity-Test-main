# Design Notes

---

# Assumptions

- Default withdrawal fee is `0` bps so existing vault behavior is unchanged until the owner enables fees.
- Treasury is initialized to the deployer so it is never the zero address after construction.
- Fee amounts use integer division and round down (remainder stays with the user).
- `Withdrawn` continues to report the requested withdrawal amount (the amount deducted from the user's vault balance), not the net ETH received.

---

# Implementation

- How fees are calculated: `feeAmount = amount * withdrawalFeeBps / 10_000`, then `userAmount = amount - feeAmount`. Example: 10 ETH at 100 bps → user 9.9 ETH, treasury 0.1 ETH, vault balance −10 ETH.
- Storage layout: added public `withdrawalFeeBps` and `treasury` next to existing `totalAssets`, plus `MAX_WITHDRAWAL_FEE_BPS` / `BPS_DENOMINATOR` constants. Kept private `_owner` / `_balances`. No fee-accrual storage.
- Notable decisions: update accounting first (CEI), then pay fee (if any) and user remainder; skip the treasury call when fee is `0`; leave `withdraw(uint256)` unchanged.

---

# Security Considerations

- Access control: only the owner can set fee and treasury; non-owners revert with `Unauthorized`. Owner is trusted (accepted centralization).
- Validation: reject `feeBps > 500` and `treasury == address(0)`; withdraw still rejects zero / over-balance amounts.
- Accounting: user balance and `totalAssets` decrease by the full requested amount; ETH out equals fee + user payout.
- External calls: up to two ETH `.call`s (treasury, then user). Either failure reverts the whole withdraw, so no partial payout.
- Reentrancy: effects run before transfers, so reentrancy cannot inflate withdrawals. No `ReentrancyGuard` — CEI is enough for this scope.

---

# Testing

- Unit tests for deposits, withdrawals, ownership, fee/treasury configuration, and withdrawals with fees.
- Required cases: successful fee withdraw, zero fee, max fee (500 bps), invalid fee, invalid treasury.
- Edge cases: partial withdraw with fee, fee rounding down, disable fee after enabling, `Withdrawn` emitting the full requested amount.
- No fuzz tests for this assessment.

---

# Trade-offs

- Simplicity vs flexibility: immediate fee transfer to treasury instead of accruing fees in-vault (simpler accounting, no claim API).
- Readability vs optimization: public config vars and CEI over packing, extra modifiers, or OpenZeppelin dependencies.
- Preserved existing public API (`withdraw(uint256)`) instead of adding preview helpers or changing event meaning.

---

# Future Improvements

- `previewWithdraw` view for net user amount and fee.
- Optional pause / fee freeze for incidents.
- Separate roles for fee vs treasury management.
- Clearer handling when treasury is a contract that may reject ETH.
- Gas / packing optimizations if this becomes hot-path production code.
