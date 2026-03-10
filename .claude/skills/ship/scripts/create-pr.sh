#!/usr/bin/env bash
# Usage: create-pr.sh <title>
# Reads PR body from stdin.
# Prints the PR URL on success.
set -euo pipefail

gh pr create --title "$1" --body "$(cat)"
