#!/usr/bin/env bash
# PostToolUse hook: runs after Edit or Write
# Receives hook event JSON on stdin.

file=$(jq -r '.tool_input.file_path' < /dev/stdin)

echo "--- format ---"
bunx biome format --write "$file"