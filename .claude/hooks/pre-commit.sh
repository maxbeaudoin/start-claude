#!/usr/bin/env bash
# PreToolUse hook: runs before git commit
# Receives hook event JSON on stdin.

cmd=$(jq -r '.tool_input.command')

if ! echo "$cmd" | grep -q 'git commit'; then
  exit 0
fi

STAGED_FILES=()
while IFS= read -r file; do
  STAGED_FILES+=("$file")
done < <(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|json)$')

if [ ${#STAGED_FILES[@]} -gt 0 ]; then
  echo "--- check:fix ---"
  if ! bunx biome check --write "${STAGED_FILES[@]}"; then
    echo "biome check found unfixable errors" >&2
    exit 2
  fi

  git add "${STAGED_FILES[@]}"
fi

echo "--- typecheck ---"
if ! bun run typecheck; then
  echo "bun run typecheck failed" >&2
  exit 2
fi