# Changelog

## Watch 1.3.0 and Connector 1.1.0

- Hold Up to dictate a new reminder; hold Down on a reminder to delete with confirmation.
- Customize short and long presses for all three buttons separately on lists and reminders screens.
- Keep navigation accessible, preserve Back, and always default deletion confirmation to Cancel.
- Target edits by stable reminder ID so refreshes cannot change the item being deleted.
- Pin or unpin the current list from inside it; preserve silent automatic refresh.
- Add the authenticated, confirmation-required Connector deletion endpoint.

## Watch 1.2.0

- Hold Select on a reminder list to pin or unpin it.
- Support multiple pinned lists, with the newest pin first and a PIN label beside counts.
- Save pins by list ID on the phone so they survive relaunches and list renames.
- Keep the selection on a list when pinning moves it; unpinned lists return to normal order.
- Preserve silent automatic refresh and compatibility with Connector 1.0.1.

## Watch 1.1.0

- Make automatic refresh silent, including network failures; unchanged polls send no watch messages.
- Show a retry message when an initial list load fails instead of an empty Add reminder screen.
- Resend rows when opening a list and retry incomplete transfers on the next poll.
- Keep compatibility with Connector 1.0.1.

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
