#!/usr/bin/env bash
# PreToolUse hook: runs before git push
# Receives hook event JSON on stdin.

cmd=$(jq -r '.tool_input.command')

if ! echo "$cmd" | grep -q 'git push'; then
  exit 0
fi

echo "--- test ---"
if ! bun run test; then
  echo "Tests must pass before pushing" >&2
  exit 2
fi