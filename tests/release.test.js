const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const pkg = require('../package.json');
const plist = fs.readFileSync(path.join(root, 'mac/Info.plist'), 'utf8');
const listing = fs.readFileSync(path.join(root, 'APPSTORE_LISTING.md'), 'utf8');

test('Connector bundle and API versions match; watch remains compatible', () => {
  assert.equal(pkg.version, '1.4.1');
  assert.equal(pkg.license, 'MIT');
  const version = plist.match(/CFBundleShortVersionString<\/key><string>([^<]+)<\/string>/)[1];
  const connector = fs.readFileSync(path.join(root, 'mac/ReminderzConnector.swift'), 'utf8');
  assert.ok(connector.includes(`private let connectorVersion = "${version}"`));
  assert.match(connector, /"apiVersion": 1/);
});

test('release artwork and launcher icon are present', () => {
  const files = [
    'appstore-assets/reminderz-icon-large.png',
    'appstore-assets/reminderz-icon-small.png',
    'appstore-assets/reminderz-marketing-banner.png',
    'appstore-assets/screenshots/basalt/basalt_01_lists.png',
    'appstore-assets/screenshots/basalt/basalt_02_checkboxes.png',
    'appstore-assets/screenshots/emery/emery_01_lists.png',
    'appstore-assets/screenshots/emery/emery_02_checkboxes.png',
    'resources/images/reminderz-menu-icon.png',
    'mac/Resources/AppIcon.icns'
  ];
  for (const file of files) assert.ok(fs.statSync(path.join(root, file)).size > 100, file);
  const menu = pkg.pebble.resources.media.find(item => item.menuIcon);
  assert.equal(menu.file, 'images/reminderz-menu-icon.png');
});

test('Connector assigns its bundled icon at startup', () => {
  const connector = fs.readFileSync(path.join(root, 'mac/ReminderzConnector.swift'), 'utf8');
  assert.match(connector, /Bundle\.main\.url\(forResource: "AppIcon", withExtension: "icns"\)/);
  assert.match(connector, /NSApplication\.shared\.applicationIconImage = icon/);
  assert.match(plist, /CFBundleIconFile<\/key><string>AppIcon<\/string>/);
});

test('public release documents exist', () => {
  for (const file of ['LICENSE', 'CHANGELOG.md', 'SECURITY.md', 'SUPPORT.md',
    'RELEASE_CHECKLIST.md', 'PRIVACY.md', 'APPSTORE_LISTING.md']) {
    assert.ok(fs.existsSync(path.join(root, file)), file);
  }
  for (const family of ['Inter', 'Roboto', 'OpenSans', 'Montserrat', 'Poppins']) {
    assert.ok(fs.existsSync(path.join(root, `resources/fonts/licenses/${family}-OFL.txt`)), family);
  }
});

test('appstore description fits the Rebble 1,600-character limit', () => {
  const match = listing.match(/## Description[^\n]*\n\n([\s\S]*?)\n\n## Short release notes/);
  assert.ok(match, 'description section');
  assert.ok(match[1].trim().length <= 1600, `${match[1].trim().length} characters`);
});
