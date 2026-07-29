#!/usr/bin/env sh

set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "${SCRIPT_DIR}/../.." && pwd)"

COLOR_RED="\033[0;31m"
COLOR_GREEN="\033[0;32m"
COLOR_YELLOW="\033[1;33m"
COLOR_BLUE="\033[0;34m"
COLOR_BOLD="\033[1m"
COLOR_RESET="\033[0m"

supports_color() {
    [ -t 1 ] && [ "${TERM:-}" != "dumb" ]
}

_color() {
    color="$1"

    if supports_color; then
        printf "%b" "${color}"
    fi
}

_reset() {
    if supports_color; then
        printf "%b" "${COLOR_RESET}"
    fi
}

header() {
    echo
    _color "${COLOR_BOLD}${COLOR_BLUE}"
    printf '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
    printf ' %s\n' "$1"
    printf '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
    _reset
}

step() {
    printf "→ %s\n" "$1"
}

success() {
    _color "${COLOR_GREEN}"
    printf "✓ %s\n" "$1"
    _reset
}

warn() {
    _color "${COLOR_YELLOW}"
    printf "⚠ %s\n" "$1"
    _reset
}

error() {
    _color "${COLOR_RED}"
    printf "✗ %s\n" "$1"
    _reset
}

die() {
    error "$1"
    exit 1
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

run() {
    description="$1"
    shift

    step "${description}"

    if "$@"; then
        success "${description}"
    else
        die "${description} failed."
    fi
}
