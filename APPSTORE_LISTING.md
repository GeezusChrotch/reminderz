# Reminderz — Rebble Appstore listing

Coordinated release update: recommend **Organik Apps Pebble Connector** for Mac setup.
Download: https://github.com/GeezusChrotch/organik-pebble-connector/releases/latest
Existing users: [migration guide](docs/UNIFIED_CONNECTOR.md). Publish this link only after the connector release.

## Basic details

- Title: Reminderz
- Category: Tools & Utilities
- Version: 1.4.0
- Price: Free
- License: MIT open source
- Platforms: Pebble Time (`basalt`) and Pebble Time 2 (`emery`)
- Source code URL: `https://github.com/GeezusChrotch/reminderz`
- Website/support URL: `https://github.com/GeezusChrotch/reminderz#readme`
- Support email: use the Rebble account email in the Developer Portal
- Large icon: `appstore-assets/reminderz-icon-large.png` (144×144)
- Small icon: `appstore-assets/reminderz-icon-small.png` (80×80)
- Marketing banner: `appstore-assets/reminderz-marketing-banner.png` (720×320)
- Watch launcher icon: `resources/images/reminderz-menu-icon.png` (25×25)

## Description (maximum 1,600 characters)

Reminderz brings Apple Reminders to Pebble Time and Pebble Time 2.

Browse your reminder lists, see open and completed counts, and open one to review its items.
Checkboxes show each state. Press an open item to complete it, or press a
completed item to reopen it. Long selected titles scroll so you can read the whole reminder. Select
Add reminder and dictate a new item directly into the list you're viewing. Auto-refresh runs every
15 seconds by default and can be disabled to save battery; edits refresh immediately.

Make the watch UI yours with the same flexible theming system as Pome: five presets plus custom text,
background and selection colors, multiple fonts, and readable font sizes.

Reminderz syncs through a small Mac Connector and your private Tailscale network, at home or away.
Setup is guided: allow Apple Reminders, start private sync, then scan a one-time QR code with your
iPhone. Universal Clipboard is not required. The Mac must be awake with the Connector running; Start
at Login is optional.

Privacy first: no Reminderz account, hosted cloud, advertising, analytics, Funnel, or router port
forwarding. The API stays on the Mac's loopback interface, requires a random Keychain-backed token,
and is reachable only through your tailnet.

Requires macOS 14+, Tailscale on Mac and iPhone, and the free Organik Apps Pebble Connector. Dictation requires
a working Pebble dictation service. Shows up to 30 lists and 50 sorted reminders per list.

Free and open source under the MIT License. Independent and not affiliated with Apple, Tailscale,
Pebble, or Rebble.

## Short release notes

Coordinated connector release: migrate existing pairing to Organik Apps Pebble Connector.
Watch features include Apple Reminders lists, open/completed checkboxes, complete and reopen actions,
dictation, long-title marquee, optional 15-second refresh, Pome-style themes, private remote
Tailscale sync, and QR setup.

## Optional future screenshot additions

The release includes native-resolution list and checkbox screenshots for separate Basalt and Emery
collections. Future updates can add:

1. A long selected reminder visibly mid-marquee.
2. The Add reminder dictation entry.
3. A contrasting custom theme.

Do not include real names, private list titles, private Tailscale hostnames, tokens, or QR codes.
