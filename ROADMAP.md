# Roadmap

## 1.0 release candidate

- [x] List Apple Reminders lists and incomplete counts
- [x] Browse open reminders
- [x] Show open and completed reminders with drawn checkboxes
- [x] Complete or reopen a reminder
- [x] Add a reminder with Pebble dictation
- [x] Match Pome theme presets, colors, fonts, and sizes
- [x] Keep the EventKit API on loopback with Keychain-backed bearer authentication
- [x] Configure and discover private Tailscale Serve HTTPS sync
- [x] Build for Pebble Time (`basalt`) and Pebble Time 2 (`emery`)
- [x] Marquee long selected titles while keeping unselected rows tidy
- [x] Pair by one-time QR code without requiring Universal Clipboard
- [x] Add watch, store, banner, and Mac Connector artwork
- [x] Add optional Start at Login and targeted Stop Private Sync controls
- [x] Add release, privacy, security, support, and troubleshooting documentation

## Physical MVP validation

- [x] Install and pair on a physical Pebble
- [ ] Exercise completion, reopening, and dictation on a physical Pebble release build
- [ ] Verify remote sync with the iPhone off the Mac's LAN
- [ ] Test large lists, long names, emoji, and non-English reminders
- [ ] Test EventKit changes made concurrently on another Apple device
- [ ] Add mutation retry and offline-state UX based on observed failures

## Public beta

- [x] Add an optional Start at Login control
- [x] Add targeted Stop Private Sync without touching other Serve routes
- [x] Create app icons, a marketing banner, and accessible store copy
- [ ] Developer ID sign, notarize, staple, and Gatekeeper-test the Connector DMG
- [ ] Test clean install and upgrade on a separate macOS account
- [x] Add versioned Connector health checks to catch mismatched setup components
- [ ] Publish source, signed checksums, support, security, and release documentation

## Later features

- [ ] Due dates and priority display
- [ ] Choose a default list for one-click dictation
- [ ] Filter or collapse long completed-history sections
- [ ] Notes, tags, flags, and subtasks where Pebble UI remains clear
- [ ] Optional cached read view while the Mac is temporarily unavailable
