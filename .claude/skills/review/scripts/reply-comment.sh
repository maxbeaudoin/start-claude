#!/usr/bin/env bash
# Usage: reply-comment.sh <owner> <repo> <pr-number> <comment-id> <body>
# Posts an inline reply to a PR review comment thread.
set -euo pipefail

owner=$1
repo=$2
number=$3
comment_id=$4
body=$5

gh api "repos/$owner/$repo/pulls/$number/comments" \
  --method POST \
  --field body="$body" \
  --field in_reply_to="$comment_id"
