# Reminderz

Reminderz puts Apple Reminders on Pebble Time and Pebble Time 2. Browse your reminder lists,
open a list, press an item to complete it, or select **Add reminder** and dictate a new item.
It is free and open-source software released under the [MIT License](LICENSE).

This repository contains watch app `1.3.0` and Connector `1.1.1`:

- native Pebble C menus for lists, open reminders, and completed reminders;
- long-press Select to pin or unpin multiple lists, with pins remembered on the phone;
- Pebble dictation for adding an item to the open list;
- customizable short/long button actions and deletion with confirmation;
- a PebbleKit JS sync layer and phone Settings page;
- the Pome theme presets, colors, fonts, and font sizes;
- a token-protected macOS EventKit connector;
- private remote sync through Tailscale Serve from day one;
- optional 15-second refresh of the visible watch screen, enabled by default, plus immediate refresh
  after edits;
- selected-row marquee scrolling for long list and reminder titles; and
- one-time QR pairing that does not depend on Universal Clipboard.

No account name, list, reminder, hostname, or access token is built into the app.

## How it works

```text
Pebble watch
  ↕ AppMessage
PebbleKit JS on the paired iPhone
  ↕ private HTTPS over Tailscale
Reminderz Connector on the Mac (loopback-only API)
  ↕ EventKit
Apple Reminders / iCloud
```

The connector listens only on `127.0.0.1:7843`. Its **Start Private Sync** button creates a
tailnet-only HTTPS route on port `10447`. It never enables Tailscale Funnel or opens a router port.
The Mac and iPhone must both be signed into Tailscale, and the Mac must be awake with Reminderz
Connector running. Its window may be closed after setup; quitting the Connector stops sync.
Connector 1.0.1 fixes reopening a closed window and adds **Stop Service**, **Start Service**, and
**Restart Service** controls. These preserve pairing and the Tailscale route. It works with watch
apps from earlier releases. Connector 1.1.0 adds confirmed deletion for watch 1.3.0.
Automatic refresh remains silent.

## Install

Reminderz needs three pieces: this watch app, the free Reminderz Connector on a Mac, and Tailscale
on that Mac and the paired iPhone. Install the watch app from the
[Pebble Appstore](https://apps.repebble.com/d7f2ccd94a0746d1a059433a), then download the Connector
`.dmg` from the [latest GitHub release](https://github.com/GeezusChrotch/reminderz/releases/latest).
Drag the Connector to Applications and follow its three required green setup checks. The QR pairing
page copies its details directly on the iPhone.

See [Install](docs/INSTALL.md) for the complete friendly walkthrough and
[Troubleshooting](docs/TROUBLESHOOTING.md) if a check is not green.

## Build from source

Requirements:

- macOS 14 or newer
- Pebble SDK with `basalt` and `emery`
- Tailscale on the Mac and iPhone
- a Pebble mobile app with Developer Connection enabled for local watch installs

Run the complete validation and build:

```sh
npm test
npm run check
```

Artifacts are written to:

- `build/Reminderz.pbw`
- `build/Reminderz Connector.app`

For the drag-to-Applications development DMG and matching watch package, run `npm run package`.
It writes both artifacts and `SHA256SUMS` under `dist/`.

Open the Connector app, select **Allow Reminders**, then **Start Private Sync**. When all checks
are green, select **Connect Phone** and scan the one-time QR code with the iPhone camera. The private
page has a **Copy pairing details** button, so Universal Clipboard is not required. Then open Pebble
→ Reminderz → Settings on that iPhone, paste the details, test, and save. The QR code expires after
10 minutes and works only once. Settings also lets battery-conscious users disable the default
15-second auto-refresh; navigation and edits continue to refresh immediately.

## Current product boundary

Reminderz supports open and completed reminders, toggling either state, creating plain-title
reminders, and deleting reminders after confirmation. Due-date display, notes, subtasks, tags, images, shared-list metadata, and offline mutation
queues are intentionally deferred. Up to 30 lists and the first 50 reminders in each sorted list are
shown on the watch. The Connector can start at login so away-from-home sync remains available while
the Mac is awake.

See [Architecture](docs/ARCHITECTURE.md), [Privacy](PRIVACY.md), [Support](SUPPORT.md),
[Security](SECURITY.md), [Roadmap](ROADMAP.md), and the [release checklist](RELEASE_CHECKLIST.md).

## License

Reminderz is free software distributed under the [MIT License](LICENSE). The watch app, phone-side
PebbleKit JavaScript, Mac Connector, packaging scripts, and documentation are all included in the
same public source release.

The bundled Pebble Time 2 fonts remain under their respective SIL Open Font License terms. Their
source details and complete notices are preserved in [resources/fonts](resources/fonts/README.md).
