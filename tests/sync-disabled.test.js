const test = require('node:test');
const assert = require('node:assert/strict');

test('saved auto-refresh opt-out prevents the 15-second timer', () => {
  const listeners = {};
  let intervalStarts = 0;

  global.Pebble = {
    addEventListener(name, handler) { listeners[name] = handler; },
    getActiveWatchInfo() { return {platform: 'basalt'}; },
    sendAppMessage(payload, success) { if (success) success(); },
    openURL() {}
  };
  global.localStorage = {
    getItem() {
      return JSON.stringify({gatewayURL: 'https://example.invalid', gatewayToken: 'test-token',
        autoRefresh: false});
    },
    setItem() {}
  };
  global.setInterval = () => { intervalStarts++; return 1; };
  global.clearInterval = () => {};
  global.XMLHttpRequest = class MockRequest {
    open() {}
    setRequestHeader() {}
    send() {}
  };

  delete require.cache[require.resolve('../src/pkjs/index.js')];
  require('../src/pkjs/index.js');
  listeners.ready();

  assert.equal(intervalStarts, 0);
});
