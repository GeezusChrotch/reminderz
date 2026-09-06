# Reminderz 1.0 release checklist

## Watch 1.4.0 verification

- [x] 25 automated tests and Basalt/Emery builds passed.
- [x] Direct Emery touch Next/Previous and button Next paging requests verified.
- [x] Installed feature candidate approved by Josh through the deployment coordinator.
- [x] Release changes only the candidate's version metadata to 1.4.0; JavaScript and resources match.
- [ ] Version-labeled 1.4.0 artifact installed on physical watch (coordinator-owned).

## Watch 1.3.0 / Connector 1.1.0 verification

- [x] All 22 automated tests pass; Swift typecheck and Basalt/Emery builds pass.
- [x] Emulator: long Down opens confirmation with Cancel selected; Cancel sends no delete.
- [x] Emulator: a refresh while confirmation is open cannot change the deletion target.
- [x] Emulator: assigning delete to short Select still requires confirmation.
- [x] Connector 1.1.0 notarized, installed locally, and authenticated local/private remote health verified.
- [x] Live EventKit: unconfirmed deletion rejected; confirmed deletion removed only a disposable test reminder.
- [ ] Physical watch: verify long Up dictation, long Down confirmation, and custom button mappings.

## Automated and packaged

- [x] Watch `1.3.0` and Connector `1.1.0` use the same version 1 sync API; deletion requires Connector 1.1.0.
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
