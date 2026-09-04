# Release procedure

1. Finish every manual acceptance item in [the release checklist](../RELEASE_CHECKLIST.md).
2. Confirm watch versions in `package.json` and Connector versions in `Info.plist` and the API match
   their release notes. Compatible Connector-only patches can ship independently of the watch app.
3. Run `npm run check`, then `npm run package`.
4. Verify the app inside the DMG is a universal Developer ID build with hardened runtime enabled.
5. Set `REMINDERZ_NOTARY_PROFILE` to an existing `notarytool` Keychain profile and run
   `npm run notarize`. This submits the DMG to Apple, staples the ticket, runs Gatekeeper, and refreshes
   `dist/SHA256SUMS`.
6. Install that exact DMG and PBW on clean test devices. Do not rebuild between acceptance and upload.
7. Create the source release and attach the DMG, PBW, and checksum manifest.
8. Create a private Rebble listing, fill the remaining source/support fields, upload separate Basalt
   and Emery asset collections, and test every download and settings link.
9. Publish only after the private listing and clean-install checks pass.

The Rebble description must stay at or below 1,600 characters. Listings allow up to five unframed
screenshots per platform. Never upload screenshots containing real reminders, pairing codes, access
tokens, or a private Tailscale hostname.

## Rollback

Keep the prior notarized DMG and PBW. If the new release fails, unpublish only the bad release in the
Developer Portal and restore the prior download links. Do not rotate users' Connector tokens or reset
their Tailscale Serve configuration as part of a normal rollback.
