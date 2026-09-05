# Install Reminderz

Use the free **Organik Apps Pebble Connector** on macOS 14 or newer.

1. Download the [unified connector](https://github.com/GeezusChrotch/organik-pebble-connector/releases/latest), drag it into Applications and open it.
2. Install Tailscale on the Mac and paired phone and sign both into the same private network.
3. Select **Reminderz** in the sidebar, follow **Connect**, and resolve unmet **Requirements**.
4. Install Reminderz from its listing in the phone's Pebble app, or open the watch PBW from this app's
   official GitHub release on the phone.
5. Follow this page's phone connection controls, save settings in Pebble, and refresh the watch.

Allow full Reminders access when macOS asks. Use Connect phone to display a one-time QR code.
Scan it with the phone camera, copy pairing details on the private page, and paste them into
Pebble → Reminderz → Settings → Test connection → Save & apply. This copies on the phone itself;
Universal Clipboard is not required. Keep the unified Mac app running while syncing.


The Mac must remain awake with Tailscale connected. iPhone is the tested setup. You can close
the connector window. Configure startup and visibility in the connector’s Settings.

Existing users should follow [migration instructions](UNIFIED_CONNECTOR.md). No watch protocol
change is required. Older standalone setup details remain in [the legacy guide](INSTALL_STANDALONE.md),
including their version-specific controls. The unified connector’s current guide takes precedence
for its setup, repair and permission controls.
