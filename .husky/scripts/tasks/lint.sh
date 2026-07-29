#!/usr/bin/env sh

set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

# shellcheck disable=SC1091
. "${SCRIPT_DIR}/common.sh"
# shellcheck disable=SC1091
. "${SCRIPT_DIR}/../config.sh"

header "Solidity Lint"

if ! command_exists npm; then
    die "npm is not installed."
fi

if [ ! -f "${ROOT_DIR}/package.json" ]; then
    die "package.json not found."
fi

step "Running Solhint"

if npm run lint; then
    success "Lint passed."
    exit 0
fi

echo
error "Lint failed."

cat <<EOF

Run:

    npm run lint

Review the reported issues, fix them, and commit again.

EOF

exit 1
