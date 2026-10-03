#!/bin/sh
set -eu
: "${CI_COMMIT_TAG:?This pipeline requires a tag}"
: "${CI_COMMIT_SHA:?Missing commit SHA}"
[ "${CI_COMMIT_REF_PROTECTED:-false}" = true ] || {
  echo "Release tags must be protected in GitLab." >&2
  exit 1
}
# Tags have no branch. Explicitly fetch main and require the tagged commit in its history.
git fetch --no-tags origin +refs/heads/main:refs/remotes/origin/main
git merge-base --is-ancestor "$CI_COMMIT_SHA" refs/remotes/origin/main || {
  echo "The tagged commit is not in main. Merge it first, then create a new tag." >&2
  exit 1
}
