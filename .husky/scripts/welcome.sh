#!/usr/bin/env sh

set -eu

# shellcheck disable=SC1091
. "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)/common.sh"

header "Welcome"

cat <<EOF
Welcome to Vault Core (Hardhat)

Useful commands:

  make check      Run all quality checks
  npm test        Run tests
  npm run lint    Lint Solidity code

See ISSUE.md for assessment instructions.
EOF

echo
success "Ready to start."
