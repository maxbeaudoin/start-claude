#!/usr/bin/env bash
# PreToolUse hook: runs before git commit
# Receives hook event JSON on stdin.

cmd=$(jq -r '.tool_input.command')

if ! echo "$cmd" | grep -q 'git commit'; then
  exit 0
fi

echo "--- check:fix ---"
if ! bun run check:fix; then
  echo "bun run check:fix found unfixable errors" >&2
  exit 2
fi

echo "--- typecheck ---"
if ! bun run typecheck; then
  echo "bun run typecheck failed" >&2
  exit 2
fi