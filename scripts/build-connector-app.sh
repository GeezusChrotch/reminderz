#!/bin/sh
set -eu

project_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
app="$project_dir/build/Reminderz Connector.app"
contents="$app/Contents"
executable="$contents/MacOS/reminderz-connector"
work_dir=$(mktemp -d -t reminderz-connector)
trap 'rm -rf "$work_dir"' EXIT
architectures=${REMINDERZ_CONNECTOR_ARCHES:-"arm64 x86_64"}
signing_identity=${REMINDERZ_SIGNING_IDENTITY:-}

if [ -z "$signing_identity" ]; then
  signing_identity=$(security find-identity -v -p codesigning 2>/dev/null | \
    sed -n 's/.*"\(Developer ID Application:[^"]*\)".*/\1/p' | head -n 1)
fi
if [ -z "$signing_identity" ]; then
  signing_identity="-"
fi

rm -rf "$app"
mkdir -p "$contents/MacOS" "$contents/Resources"
cp "$project_dir/mac/Info.plist" "$contents/Info.plist"
cp "$project_dir/mac/Resources/AppIcon.icns" "$contents/Resources/AppIcon.icns"
slices=""
for architecture in $architectures; do
  slice="$work_dir/reminderz-connector-$architecture"
  swiftc -target "$architecture-apple-macosx14.0" \
    -framework AppKit -framework CoreImage -framework EventKit -framework Network -framework Security \
    -framework ServiceManagement \
    "$project_dir/mac/ReminderzConnector.swift" -o "$slice"
  slices="$slices $slice"
done
# shellcheck disable=SC2086
lipo -create -output "$executable" $slices
if [ "$signing_identity" = "-" ]; then
  codesign --force --sign "$signing_identity" \
    --entitlements "$project_dir/mac/ReminderzConnector.entitlements" "$app" >/dev/null
else
  codesign --force --options runtime --timestamp --sign "$signing_identity" \
    --entitlements "$project_dir/mac/ReminderzConnector.entitlements" "$app" >/dev/null
fi
echo "Built $app"
