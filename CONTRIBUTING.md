# Contributing

Small, focused changes are welcome. Before opening a change:

1. Run `npm test` and `npm run check`.
2. Test both Basalt and Emery when watch UI changes.
3. Keep the local API loopback-only, token-authenticated, and Tailscale Serve-only.
4. Never add real reminder titles, hostnames, pairing codes, tokens, or account details to fixtures,
   screenshots, logs, commits, or issues.
5. Update the changelog and user documentation when behavior changes.

Use invented data such as “Buy oat milk” in tests and screenshots. Security-sensitive reports belong
in the private channel described in [SECURITY.md](SECURITY.md), not a public issue.
