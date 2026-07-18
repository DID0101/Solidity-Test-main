#!/usr/bin/env sh

set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

# shellcheck disable=SC1091
. "${SCRIPT_DIR}/common.sh"

header "Tests"

if ! command_exists npm; then
    die "npm is not installed."
fi

step "Running test suite"

if npm test; then
    success "All tests passed."
    exit 0
fi

echo
error "Tests failed."

cat <<EOF

Try running:

    npm test

to see more detailed output.

EOF

exit 1
