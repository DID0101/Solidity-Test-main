# Issue #42

## Title

Support configurable withdrawal fees

---

## Background

The Vault contract currently allows users to deposit and withdraw ETH.

As part of the next release, we would like to introduce configurable withdrawal fees. Fees should be collected by the protocol treasury while preserving the existing behavior of the vault when fees are disabled.

Treat this as a normal feature change on an existing codebase rather than a greenfield rewrite.

---

## Requirements

### Functional

Implement support for configurable withdrawal fees.

The implementation must satisfy the following requirements:

- Withdrawal fees use basis points (bps).
- The owner can configure the withdrawal fee.
- The maximum fee is **500 bps (5%)**.
- The owner can configure the treasury address.
- Treasury address cannot be the zero address.
- The withdrawal fee is deducted from the requested withdrawal amount.
- The treasury receives the collected fee.
- The user receives the remaining amount.
- The user's vault balance decreases by the full withdrawal amount.

Example:

Requested withdrawal:

10 ETH

Fee:

100 bps

Result:

- User receives **9.9 ETH**
- Treasury receives **0.1 ETH**
- Vault balance decreases by **10 ETH**

---

### Events

Emit appropriate events whenever:

- the withdrawal fee changes
- the treasury address changes

Event names and parameters are left to your discretion.

---

### Validation

The implementation should reject:

- fee > 500 bps
- treasury == address(0)

Use an approach that is consistent with the existing codebase.

---

### Testing

Update the test suite to cover your implementation.

We expect tests for:

- successful withdrawals with fees
- zero fee
- maximum fee
- invalid fee configuration
- invalid treasury configuration

You may reorganize or extend the test suite if you believe it improves readability.

---

### Design Notes

Complete `DESIGN.md` by documenting:

- assumptions
- implementation decisions
- security considerations
- trade-offs
- future improvements

Please keep the document concise.

---

## Constraints

Please avoid introducing unnecessary abstractions.

The goal is to extend the existing implementation rather than redesign it.

Maintain compatibility with the existing public API wherever practical.

---

## Evaluation

We will primarily evaluate:

- correctness
- code quality
- maintainability
- testing strategy
- engineering judgment

There is no single correct implementation.

---

## Time Expectation

This assessment is designed to be completed in approximately **60–90 minutes**.

If you choose to spend additional time polishing your solution, that is entirely up to you, but it is not expected.

---

Thank you for taking the time to complete this assessment.
