#!/usr/bin/env bash
# PreToolUse hook: runs before git commit
# Receives hook event JSON on stdin.

cmd=$(jq -r '.tool_input.command')

if ! echo "$cmd" | grep -q 'git commit'; then
  exit 0
fi

echo "--- format ---"
if ! bun run format:fix; then
  echo "bun run format:fix failed" >&2
  exit 2
fi

echo "--- lint:fix ---"
if ! bun run lint:fix; then
  echo "bun run lint:fix found unfixable errors" >&2
  exit 2
fi

echo "--- typecheck ---"
if ! bun run typecheck; then
  echo "bun run typecheck failed" >&2
  exit 2
fi