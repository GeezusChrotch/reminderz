#!/bin/sh
set -eu

project_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
version=$(node -p "require('$project_dir/package.json').version")
dmg="$project_dir/dist/Reminderz-Connector-$version.dmg"
profile=${REMINDERZ_NOTARY_PROFILE:-${1:-}}

if [ -z "$profile" ]; then
  echo "Set REMINDERZ_NOTARY_PROFILE to a notarytool Keychain profile name." >&2
  exit 2
fi
if [ ! -f "$dmg" ]; then
  echo "Build the release first with npm run package." >&2
  exit 2
fi

xcrun notarytool submit "$dmg" --keychain-profile "$profile" --wait
xcrun stapler staple "$dmg"
xcrun stapler validate "$dmg"
spctl --assess --type open --context context:primary-signature --verbose "$dmg"
(cd "$project_dir/dist" && shasum -a 256 "$(basename "$dmg")" "reminderz-$version.pbw" > SHA256SUMS)
echo "Notarized and stapled $dmg"
