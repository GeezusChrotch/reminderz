# Install Reminderz

You need a Mac running macOS 14 or later, an iPhone paired to the Pebble, and Tailscale signed into
the same private tailnet on both devices. The Mac must be awake whenever the watch syncs.

1. Install Tailscale on the Mac and iPhone and sign both into the same tailnet.
2. Open the Reminderz Connector disk image, then drag **Reminderz Connector** to Applications.
3. Open Reminderz Connector from Applications.
4. Select **Allow Reminders** and approve macOS full Reminders access.
5. Select **Start Private Sync**. This adds HTTPS port `10447` to Tailscale Serve.
6. Optionally select **Start at Login** so sync returns after Mac restarts.
7. Install `reminderz-1.2.0.pbw` through the Pebble mobile app, or install Reminderz from the Appstore.
8. In the Connector, select **Connect Phone**.
9. Scan the one-time QR code with the iPhone camera. On the private page, select **Copy pairing
   details**. This copies directly on the iPhone; Universal Clipboard is not needed.
10. On that iPhone, open Pebble → Reminderz → Settings. Paste the pairing details, select
    **Test connection**, then **Save & apply**.
11. Open Reminderz on the watch and verify the lists and counts match Apple Reminders.

Hold the middle **Select** button on a list to pin it at the top. You can pin multiple lists; the
most recently pinned comes first and pinned lists show **PIN** beside their counts. Hold Select
again to unpin. Pins stay saved on your phone across app restarts and list renames, and do not
change the order in Apple Reminders.

The QR code contains only a short-lived pairing address. It expires after 10 minutes and works once;
the permanent Connector token is delivered only after the iPhone reaches that private page through
Tailscale. Choose **Connect Phone** again whenever a fresh code is needed.

The Connector must remain running and the Mac must stay awake, but its window may be closed after
setup. Reopen the app to manage it. **Stop Service** pauses sync; **Start Service** resumes it, and
**Restart Service** restarts it without changing pairing. Quitting the Connector also stops its
local service. **Stop Private Sync** removes only Reminderz's
Tailscale route; it does not alter other services.

## Build-from-source installation

Run `npm run check`, open `build/Reminderz Connector.app`, and install `build/Reminderz.pbw` using
the Pebble SDK or Developer Connection. Locally built packages may not have the release's Apple
notarization.

## Removing the private route

Use **Stop Private Sync** in Reminderz Connector. It runs the port-specific Serve `off` operation for
HTTPS port `10447`; it never uses a global Serve reset.
