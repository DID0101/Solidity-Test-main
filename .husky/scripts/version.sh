#!/usr/bin/env sh

set -eu

# shellcheck disable=SC1091
. "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)/common.sh"

header "Environment Information"

print_version() {
    label="$1"
    shift

    printf "%-12s" "${label}"

    if "$@" >/dev/null 2>&1; then
        "$@" | head -n1
    else
        echo "Not installed"
    fi
}

print_version "OS" uname -sr
print_version "Git" git --version
print_version "Node" node --version
print_version "npm" npm --version
print_version "npx" npx --version

echo
success "Environment information collected."
