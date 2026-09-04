#!/bin/sh
set -eu

project_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
version=$(node -p "require('$project_dir/package.json').version")
stage=$(mktemp -d -t reminderz-dmg)
trap 'rm -rf "$stage"' EXIT
dmg="$project_dir/dist/Reminderz-Connector-$version.dmg"
signing_identity=${REMINDERZ_SIGNING_IDENTITY:-}

if [ -z "$signing_identity" ]; then
  signing_identity=$(security find-identity -v -p codesigning 2>/dev/null | \
    sed -n 's/.*"\(Developer ID Application:[^"]*\)".*/\1/p' | head -n 1)
fi

sh "$project_dir/scripts/check.sh"
mkdir -p "$project_dir/dist"
cp -R "$project_dir/build/Reminderz Connector.app" "$stage/Reminderz Connector.app"
ln -s /Applications "$stage/Applications"
rm -f "$dmg"
hdiutil create -quiet -volname "Reminderz Connector" -srcfolder "$stage" -ov -format UDZO "$dmg"
if [ -n "$signing_identity" ] && [ "$signing_identity" != "-" ]; then
  codesign --force --timestamp --sign "$signing_identity" "$dmg" >/dev/null
fi
cp "$project_dir/build/Reminderz.pbw" "$project_dir/dist/reminderz-$version.pbw"
(cd "$project_dir/dist" && shasum -a 256 "$(basename "$dmg")" "reminderz-$version.pbw" > SHA256SUMS)
echo "Packaged Reminderz $version in $project_dir/dist"
