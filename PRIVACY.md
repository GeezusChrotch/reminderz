# Reminderz Privacy Notice

Effective: September 4, 2026

Reminderz has no hosted service, analytics, advertising, or developer account database.
It is free and open source under the MIT License, so its watch, phone companion, and Mac Connector
code can be inspected and built from the public repository.

The Mac Connector requests full Apple Reminders access because Apple requires full access to read
lists and items. It uses that access only to show the user's open and completed reminders, create
items the user dictates, and change the completion state of items the user selects.

Reminder titles pass from the user's Mac to the paired iPhone and watch over the user's private
Tailscale network. The Connector API is loopback-only behind Tailscale Serve and requires a random
bearer token stored in macOS Keychain. Reminderz does not use Tailscale Funnel.

Pairing uses a random, single-use address that expires after 10 minutes. The QR code does not contain
the permanent access token. After the iPhone reaches the pairing page through Tailscale, the page
copies the Connector address and token locally on that iPhone. The page is not cached.

Pebble dictation audio is handled by the Pebble mobile app's dictation service under that app's own
privacy terms. Reminderz receives the resulting transcription and sends it to the user's Mac as the
new reminder title.

## Storage and retention

- Apple Reminders remains the system of record; Reminderz does not create a separate reminder
  database.
- The Mac stores one random Connector token in Keychain.
- The Pebble mobile app stores the private Connector address, token, and selected theme in its local
  per-app storage.
- The watch keeps only the currently transferred list titles, reminder titles, completion states,
  counts, and theme settings. It does not keep a historical archive.

## Network and third parties

Reminderz has no developer-operated server. Tailscale carries private sync traffic. Apple provides
Reminders/iCloud synchronization. The Pebble mobile app provides watch communication and dictation.
Their own terms and privacy notices apply.

## Remove Reminderz data

Uninstall the watch app, remove its settings from the Pebble mobile app, quit/uninstall the Mac
Connector, and use **Stop Private Sync** first if you want to remove its Tailscale route. Remove the
`org.reminderz.connector.credentials` Keychain item only if you also want to invalidate all existing
phone pairings. These steps do not delete anything from Apple Reminders.
