const test = require('node:test');
const assert = require('node:assert/strict');

let platform = 'basalt';
global.Pebble = {
  addEventListener() {},
  getActiveWatchInfo() { return {platform}; },
  sendAppMessage() {},
  openURL() {}
};
global.localStorage = {
  values: {},
  getItem(key) { return this.values[key] || null; },
  setItem(key, value) { this.values[key] = value; }
};
global.XMLHttpRequest = function XMLHttpRequest() {};

const reminderz = require('../src/pkjs/index.js');

test('keeps Pome classic theme choices on Pebble Time', () => {
  platform = 'basalt';
  assert.deepEqual(reminderz.classicThemes.map(theme => theme.name),
    ['Classic', 'Pome Amber', 'Midnight', 'Forest', 'Berry']);
  assert.deepEqual(reminderz.normalizeTheme({font:'gothic',size:24,text:'#123456',
    background:'#ffffff',selection:'#000000'}), {
      name:'Classic',font:'gothic',size:24,text:'#123456',background:'#ffffff',selection:'#000000'
    });
});

test('keeps Pome Time 2 font families and sizes', () => {
  platform = 'emery';
  assert.deepEqual(reminderz.time2Themes.map(theme => [theme.font, theme.size]), [
    ['inter',22],['montserrat',22],['roboto',22],['open-sans',26],['poppins',30]
  ]);
  assert.equal(reminderz.normalizeTheme({font:'poppins',size:25}).size, 26);
});

test('quantizes colors to Pebble 64-color values and chooses readable selection text', () => {
  assert.equal(reminderz.pebbleColor('#ffffff'), 255);
  assert.equal(reminderz.pebbleColor('#000000'), 192);
  assert.equal(reminderz.contrast('#ffffaa'), '#000000');
  assert.equal(reminderz.contrast('#000055'), '#ffffff');
});

test('configuration is Tailscale-first and accepts one-paste pairing details', () => {
  platform = 'emery';
  const decoded = decodeURIComponent(reminderz.configurationURL());
  assert.match(decoded, /private Tailscale network/);
  assert.match(decoded, /Pairing details/);
  assert.match(decoded, /gatewayToken/);
  assert.equal((decoded.match(/id="text"/g) || []).length, 1);
});

test('refreshes the visible reminder screen every 15 seconds', () => {
  assert.equal(reminderz.refreshIntervalMs, 15000);
});
