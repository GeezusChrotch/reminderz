const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const swift = fs.readFileSync(path.join(root, 'mac/ReminderzConnector.swift'), 'utf8');
const pkjs = fs.readFileSync(path.join(root, 'src/pkjs/index.js'), 'utf8');
const watch = fs.readFileSync(path.join(root, 'src/c/main.c'), 'utf8');

test('connector binds its EventKit API to loopback only', () => {
  assert.match(swift, /requiredLocalEndpoint = \.hostPort\(host: "127\.0\.0\.1"/);
});

test('remote access uses Tailscale Serve and never Funnel', () => {
  assert.match(swift, /\["serve", "--bg", "--yes"/);
  assert.doesNotMatch(swift, /\["funnel"/);
  assert.ok(swift.includes('return "https://\\(host)"'));
  assert.match(swift, /\["serve", "--yes", "--https=\\\(servePort\)", "off"\]/);
  assert.doesNotMatch(swift, /serve", "reset/);
});

test('no personal hostname or token is embedded in the watch companion', () => {
  assert.doesNotMatch(pkjs, /tail43f9ee|dm-studio|joshuabessom/i);
  assert.match(pkjs, /gatewayURL:"", gatewayToken:""/);
});

test('completed reminders are returned, drawn as checkboxes, and can be reopened', () => {
  assert.match(swift, /predicateForReminders\(in:/);
  assert.match(swift, /reminder\.isCompleted = completed/);
  assert.match(pkjs, /completed:!reminders\[index\]\.completed/);
  assert.match(watch, /draw_checkbox_row/);
  assert.match(watch, /Reopening…/);
});

test('long selected rows marquee while unselected rows keep an ellipsis', () => {
  assert.match(watch, /marquee_selection_changed/);
  assert.match(watch, /s_marquee_offset/);
  assert.match(watch, /graphics_text_layout_get_content_size/);
  assert.match(watch, /graphics_fill_rect\(ctx, GRect\(0, 0, 29/);
  assert.match(watch, /GTextOverflowModeTrailingEllipsis/);
});

test('15-second sync avoids overlapping fetches and refreshes lists when returning', () => {
  assert.match(pkjs, /if \(enabled\) refreshTimer = setInterval\(refreshVisibleScreen, REFRESH_INTERVAL_MS\)/);
  assert.match(pkjs, /autoRefresh: parsed\.autoRefresh !== false/);
  assert.match(pkjs, /id="autoRefresh" type="checkbox"/);
  assert.match(pkjs, /if \(listsLoading\) \{ listsRefreshPending = true; return; \}/);
  assert.match(pkjs, /if \(remindersLoading\) \{ remindersRefreshPending = true; return; \}/);
  assert.match(pkjs, /if \(mutationInFlight\) return;/);
  assert.match(watch, /lists_window_appear[\s\S]*COMMAND_LOAD_LISTS/);
});

test('phone pairing uses a short-lived one-time QR exchange without embedding the token', () => {
  const maker = swift.match(/func makePairingURL[\s\S]*?\n    }\n\n    private func accept/)[0];
  assert.match(maker, /10 \* 60/);
  assert.match(maker, /URLQueryItem\(name: "code"/);
  assert.doesNotMatch(maker, /gatewayToken|\btoken\b/);
  assert.match(swift, /pairingCodes\.removeValue\(forKey: code\)/);
  assert.match(swift, /Cache-Control: no-store/);
  assert.match(swift, /Copy pairing details/);
});
