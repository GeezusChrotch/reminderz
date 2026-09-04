# Troubleshooting

## Reminders access is not green

Select **Allow Reminders**. If macOS previously denied it, open System Settings → Privacy & Security
→ Reminders and enable Reminderz Connector. Quit and reopen the Connector afterward.

## Mac service is not green

Only one Connector can use port `7843`. Quit older copies, move the current app to Applications, and
open it again. If macOS asks for Keychain access after replacing an unsigned development build, use
the signed release build instead.

## Private sync is not green

Open Tailscale on the Mac, sign in, and select **Start Private Sync** again. Reminderz uses private
HTTPS port `10447`. It does not need Funnel, router forwarding, or a public IP.

## The QR page does not open

Confirm Tailscale is connected on the iPhone and Mac. Choose **Connect Phone** again because each QR
code works once and expires after 10 minutes. The permanent token is intentionally absent from the QR.

## Connection test fails on iPhone

Use **Copy pairing details** on the QR page itself, then paste into Pebble → Reminderz → Settings.
Universal Clipboard is not required. Confirm both devices remain on the same tailnet.

## The watch says the phone or Connector is unavailable

Open the Pebble mobile app, confirm the watch is connected, and keep Tailscale connected on the
iPhone. On the Mac, open Reminderz Connector and choose **Test Everything**. The Mac must be awake.

## A reminder or list is missing

Reminderz shows at most 30 lists and the first 50 reminders in each list after sorting open items
first and recently completed items next. Reopen the watch app to fetch fresh data. Notes, subtasks,
tags, and attachments are not shown in version 1.0.

## Remove private sync

Select **Stop Private Sync**. It removes only Reminderz HTTPS port `10447` and preserves every other
Tailscale Serve route.
