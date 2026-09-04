# Reminderz 1.0 release checklist

## Automated and packaged

- [x] Watch `1.2.0` and Connector `1.0.1` use the same version 1 sync API.
- [x] Node tests, Swift typecheck, Basalt build, and Emery build run through `npm run check`.
- [x] No account, reminder, hostname, access token, or pairing code is embedded in the package.
- [x] 25×25 launcher, 80×80 and 144×144 store icons, 512×512 master, Mac icon, and 720×320 banner exist.
- [x] Connector packaging produces a matching DMG, PBW, and SHA-256 manifest.
- [x] Targeted Stop Private Sync never resets unrelated Tailscale routes.
- [x] The complete project is marked MIT-licensed and free, with no paid feature or account tier.

## Post-release device acceptance

- [ ] Complete, reopen, and dictate a disposable reminder on the physical Pebble using the 1.0 build.
- [ ] Read a long reminder through a full marquee cycle on Basalt and Emery.
- [ ] Test with the iPhone off the Mac's LAN to prove remote tailnet sync.
- [ ] Test concurrent edits from another Apple device.
- [ ] Test 30-list, 50-item, emoji, accented, and non-English boundaries.
- [ ] Install and upgrade from the DMG in a separate macOS account.
- [ ] Confirm Start at Login after a real logout/login and confirm opt-out works.
- [x] Notarize and staple the Connector DMG and pass Gatekeeper assessment on the release Mac.
- [ ] Install the notarized DMG on a separate clean Mac account.
- [x] Capture privacy-safe, unframed list and checkbox screenshots for both Basalt and Emery.

## Publication details that must be supplied

- [x] Create and push the public MIT-licensed source repository; replace source/support placeholders.
- [x] Use GitHub Issues for support and GitHub Security Advisories for private security reports.
- [x] Publish the Connector download and PBW in the `v1.0.0` GitHub release with matching SHA-256 checksums.
- [x] Publish the PBW, both icons, Basalt and Emery screenshots, description, and release notes.
- [x] Verify the live listing and its supported Basalt and Emery platform metadata.
- [ ] Upload the prepared marketing banner when the current developer dashboard adds banner upload support.

The Appstore listing and notarized release artifacts are public. Do not describe the physical-watch,
remote-tailnet, concurrent-edit, boundary, login, or clean-account checks as complete until each is
observed on its target hardware and account.

## Connector 1.0.1 regression checks — 2026-09-04

- [x] Reproduced the old close/reopen crash; crash report identifies `applicationShouldHandleReopen`.
- [x] Closing and reopening the patched window preserves the process and service.
- [x] Stop Service closes the listener and exposes Start Service.
- [x] Start Service restores the listener; Restart Service works both while running and while stopped.
- [x] Existing Reminders permission, pairing token, Start at Login, and private route remain usable.
- [x] Apple accepted the Connector 1.0.1 notarization; ticket stapled and Gatekeeper assessment passed.
