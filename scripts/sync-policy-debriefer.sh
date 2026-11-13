#!/usr/bin/env bash
# Rebuilds the Policy Debriefer's static preview and copies it into
# policy-debriefer/, served at subhamyadav.com/policy-debriefer.
#
#   scripts/sync-policy-debriefer.sh            build and copy
#   scripts/sync-policy-debriefer.sh --publish  also commit and push the website
#
# Set POLICY_DEBRIEFER_DIR if the project isn't next to this repo.
set -euo pipefail

SITE="$(cd "$(dirname "$0")/.." && pwd)"
APP="${POLICY_DEBRIEFER_DIR:-$SITE/../Media-Bias-Website}"
OUT="$SITE/policy-debriefer"

# Build in a throwaway copy: Next's static export always uses .next, which
# would clash with a dev server running in the project folder.
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
rsync -a --exclude node_modules --exclude .next --exclude out --exclude .git "$APP/" "$WORK/"
ln -s "$APP/node_modules" "$WORK/node_modules"

(cd "$WORK" && npm run build:preview)

rm -rf "$OUT"
cp -R "$WORK/out" "$OUT"
echo "Updated $OUT"

if [[ "${1:-}" == "--publish" ]]; then
  cd "$SITE"
  git add -A policy-debriefer
  if git diff --cached --quiet -- policy-debriefer; then
    echo "Preview unchanged; nothing to publish."
    exit 0
  fi
  git commit -m "Update the Policy Debriefer preview" -- policy-debriefer
  git push origin master
  echo "Published. subhamyadav.com/policy-debriefer updates in about a minute."
fi
