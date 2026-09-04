# Changelog

## Connector 1.0.1

- Fix a crash when reopening the Connector after closing its window.
- Closing the window hides it and keeps reminder sync running.
- Add Stop Service, Start Service, and Restart Service controls without changing pairing or Tailscale routes.
- Continue supporting watch app 1.0.0; no watch update or re-pairing is required.

## 1.0.0

- Browse Apple Reminders lists with open and completed counts.
- Browse open and completed reminders with clear drawn checkboxes.
- Complete reminders or reopen completed reminders from the watch.
- Dictate a new reminder into the current list.
- Scroll long selected list and reminder titles with a paused marquee.
- Choose Pome-style presets, colors, fonts, and font sizes.
- Refresh the visible screen every 15 seconds by default, with a battery-conscious opt-out and
  immediate refresh after edits.
- Sync remotely through a token-protected, tailnet-only Tailscale Serve route.
- Pair without Universal Clipboard using a single-use, 10-minute QR page.
- Configure Reminders access, private sync, and optional Start at Login in the Mac Connector.
- Add public-release artwork, packaging, privacy, security, support, and setup documentation.
- Release the complete project free and open source under the MIT License.
