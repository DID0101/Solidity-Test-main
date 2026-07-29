# Husky

This repository includes Git hooks to mirror a normal engineering workflow.

The hooks are intended to provide fast local feedback before code is committed.

They are **not** part of the assessment.

You are **not expected** to modify, debug, or extend the Git hooks unless you intentionally choose to.

## What the hooks do

### pre-commit

Runs:

- Environment validation
- Solidity linting
- Test suite

### pre-push

Runs the complete engineering checks.

### post-checkout

Displays a short welcome message the first time the repository is checked out.

### commit-msg

Provides non-blocking guidance for commit messages.

## Why we include Husky

We use Git hooks in our day-to-day engineering workflow.

Providing them in this repository means candidates receive the same fast feedback our engineers receive, without needing to configure anything themselves.

## Design Principles

The tooling is intentionally:

- lightweight
- deterministic
- modular
- easy to extend

The assessment focuses on Solidity engineering rather than repository tooling.
