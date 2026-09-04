#!/bin/sh
set -eu

project_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$project_dir"
node --check src/pkjs/index.js
node --test tests/*.test.js
plutil -lint mac/Info.plist mac/ReminderzConnector.entitlements >/dev/null
swiftc -target "$(uname -m)-apple-macosx14.0" \
  -framework AppKit -framework CoreImage -framework EventKit -framework Network -framework Security \
  -framework ServiceManagement \
  -typecheck mac/ReminderzConnector.swift
pebble clean
pebble build
sh scripts/build-connector-app.sh
echo "Reminderz checks passed."
