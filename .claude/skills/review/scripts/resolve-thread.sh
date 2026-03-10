#!/usr/bin/env bash
# Usage: resolve-thread.sh <thread-node-id>
# Resolves a pull request review thread via GraphQL mutation.
set -euo pipefail

thread_id=$1

gh api graphql \
  -f query='
    mutation($threadId: ID!) {
      resolveReviewThread(input: { threadId: $threadId }) {
        thread { isResolved }
      }
    }' \
  -f threadId="$thread_id"
