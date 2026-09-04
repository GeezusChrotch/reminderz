# Security

## Design

Reminderz has no developer-operated server. The Mac API binds only to `127.0.0.1`, uses a random
bearer token stored in macOS Keychain, and is exposed only through Tailscale Serve. The Connector
never enables Funnel. QR codes contain a random one-time exchange address, not the permanent token;
the exchange expires after 10 minutes and is consumed on first use.

The watch receives only the titles, counts, completion states, and theme data needed for its current
menus. It never receives Tailscale credentials or direct EventKit access.

## Report a vulnerability

Use the repository's [private Security Advisory form](https://github.com/GeezusChrotch/reminderz/security/advisories/new). Do not put access
tokens, private Tailscale hostnames, pairing URLs, reminder content, or proof-of-concept data in a
public issue.

Include the Reminderz watch version, Connector version, macOS version, Pebble platform, and a minimal
reproduction with private values removed. Supported security updates will target the latest release.
