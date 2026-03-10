#!/usr/bin/env bash
# Usage: react-comment.sh <owner> <repo> <comment-id> <reaction>
# Posts a reaction to a PR review comment. <reaction> is "+1" or "-1".
set -euo pipefail

owner=$1
repo=$2
comment_id=$3
reaction=$4

gh api "repos/$owner/$repo/pulls/comments/$comment_id/reactions" \
  --method POST --input - <<< "{\"content\":\"$reaction\"}"
