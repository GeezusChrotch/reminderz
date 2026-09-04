# Reminderz 1.0 release checklist

## Automated and packaged

- [x] Watch and Connector versions match at `1.0.0`.
- [x] Node tests, Swift typecheck, Basalt build, and Emery build run through `npm run check`.
- [x] No account, reminder, hostname, access token, or pairing code is embedded in the package.
- [x] 25×25 launcher, 80×80 and 144×144 store icons, 512×512 master, Mac icon, and 720×320 banner exist.
- [x] Connector packaging produces a matching DMG, PBW, and SHA-256 manifest.
- [x] Targeted Stop Private Sync never resets unrelated Tailscale routes.
- [x] The complete project is marked MIT-licensed and free, with no paid feature or account tier.

## Manual acceptance before public publication

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

- [ ] Create and push the public MIT-licensed source repository; replace source/support placeholders.
- [ ] Choose a support email and private security-reporting channel.
- [ ] Confirm the public Connector download URL and its SHA-256 checksum.
- [ ] Create a private Rebble listing first and verify install/settings/companion links.
- [ ] Upload the PBW, both icons, platform asset collections, screenshots, banner, description, and
      release notes.
- [ ] Verify the listing preview on both supported platforms before selecting **Publish**.

Do not describe the release as published, notarized, or clean-install tested until those exact checks
are complete.
