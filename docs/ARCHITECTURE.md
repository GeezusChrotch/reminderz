# Architecture

## Trust boundaries

The Pebble watch never receives an EventKit database, Tailscale credential, or Mac login. It gets
only the display text and short-lived list contents needed for the current UI. PebbleKit JS stores
the connector origin and a random connector bearer token in the Pebble mobile app's per-app storage.

The native Connector is the only Reminderz component with Apple Reminders access. It uses
`EKEventStore` to enumerate reminder calendars, fetch open and completed reminders, create a reminder,
and set a reminder's completion state. It does not read Reminders' private database files.

The HTTP API binds explicitly to loopback. Tailscale Serve terminates HTTPS and proxies the private
tailnet request to that loopback service. The Connector discovers the user's actual Serve hostname
from `tailscale serve status --json`; there is no built-in hostname.

## API

- `GET /v1/health` (includes API and Connector versions)
- `GET /v1/lists`
- `GET /v1/lists/:calendarID/reminders`
- `POST /v1/lists/:calendarID/reminders` with `{ "title": "…" }`
- `POST /v1/reminders/:reminderID/completed` with `{ "completed": true | false }`

Every `/v1` endpoint requires the Keychain-backed bearer token. The one-time `/pair` page is the
only exception: it accepts a random 10-minute single-use code and returns a non-cacheable local
pairing page. CORS is enabled because Pebble Settings
runs in a web view, but the random bearer token remains mandatory and the service is tailnet-only.

## Sync behavior

Reminderz fetches fresh data when the app opens a list and after a mutation. Open reminders sort
first; completed reminders sort below them with the most recently completed first. It currently
makes no background or periodic requests. A state change waits for the Connector response before
replacing the watch list, so a rejected EventKit write does not disappear optimistically from the UI.
The watch holds at most 30 lists and 50 sorted reminders per list. Selected titles that exceed the
available row width marquee after a short pause; other rows remain ellipsized.
