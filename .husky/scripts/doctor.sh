#!/usr/bin/env sh

set -eu

# shellcheck disable=SC1091
. "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)/common.sh"

header "Environment Check"

check_command() {
    name="$1"
    install_hint="$2"

    if command_exists "$name"; then
        version="$("$name" --version 2>/dev/null | head -n1 || true)"

        if [ -n "$version" ]; then
            success "${name}: ${version}"
        else
            success "${name}"
        fi

        return 0
    fi

    error "${name} is not installed."
    echo
    echo "Install:"
    echo "  ${install_hint}"
    echo

    exit 1
}

check_command \
    node \
    "https://nodejs.org/"

check_command \
    npm \
    "https://nodejs.org/"

echo
success "Environment looks good."
