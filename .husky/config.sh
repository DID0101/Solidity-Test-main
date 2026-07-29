#!/usr/bin/env sh

# -----------------------------------------------------------------------------
# Vault Engineering Toolkit Configuration
# -----------------------------------------------------------------------------

# Project
PROJECT_NAME="Vault Core"
PROJECT_VERSION="1.0.0"

# Commands
LINT_COMMAND="npm run lint"
TEST_COMMAND="npm test"

# Hook behavior
RUN_DOCTOR=true
RUN_LINT=true
RUN_TESTS=true

# Output
SHOW_TIMINGS=true
SHOW_BANNER=true
USE_COLOR=true

# Environment (space-separated; POSIX-safe)
REQUIRED_TOOLS="node npm git"
OPTIONAL_TOOLS="npx"

# Exit behavior
STOP_ON_FIRST_FAILURE=true
