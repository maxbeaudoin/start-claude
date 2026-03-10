#!/usr/bin/env bash
# Usage: fetch-threads.sh <owner> <repo> <pr-number>
# Fetches all review threads for a pull request via GraphQL.
# Filtering (e.g. unresolved, Copilot-authored) is done by the caller.
set -euo pipefail

owner=$1
repo=$2
number=$3

gh api graphql --paginate \
  -f query='
    query($owner: String!, $repo: String!, $number: Int!, $endCursor: String) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $number) {
          reviewThreads(first: 100, after: $endCursor) {
            pageInfo { hasNextPage endCursor }
            nodes {
              id
              isResolved
              path
              line
              startLine
              comments(first: 50) {
                nodes { databaseId body author { login } }
              }
            }
          }
        }
      }
    }' \
  -f owner="$owner" \
  -f repo="$repo" \
  -F number="$number"
