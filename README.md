# Vault Core (Hardhat)

A short Solidity exercise built with Hardhat: extend a small ETH vault with configurable withdrawal fees.

Requirements are in [`ISSUE.md`](./ISSUE.md).

---

## Requirements

- Node.js (LTS)

---

## Setup

```bash
npm install
npm test
```

All quality checks:

```bash
make check
```

---

## Files

```
contracts/
  Vault.sol

test/
  helpers.js
  Vault.test.js
```

---

## Commands

| Command | Description |
| --- | --- |
| `npm test` | Run tests |
| `npm run compile` | Compile contracts |
| `npm run lint` | Run Solhint |
| `make check` | Lint and test |

Git hooks are configured using Husky.

The hooks run lint and tests before commits.

You are **not** expected to modify the Husky configuration as part of this assessment.

---

## Submit

- Updated source and tests
- Completed `DESIGN.md` (rename from `DESIGN.md.template`)

Preserve Git history if possible.

---

## Evaluation

We care about correctness, readability, maintainability, testing, and engineering judgment.

We are **not** evaluating clever tricks or micro-optimizations.

---

## Questions

If any requirement appears ambiguous, document your assumptions in `DESIGN.md`.
