const test = require('node:test');
const assert = require('node:assert/strict');

test('15-second polling follows the visible screen and suppresses unchanged item bursts', () => {
  const listeners = {};
  const sent = [];
  const requests = [];
  let interval = null;

  global.Pebble = {
    addEventListener(name, handler) { listeners[name] = handler; },
    getActiveWatchInfo() { return {platform: 'basalt'}; },
    sendAppMessage(payload, success) { sent.push(payload); if (success) success(); },
    openURL() {}
  };
  global.localStorage = {
    getItem() {
      return JSON.stringify({gatewayURL: 'https://example.invalid', gatewayToken: 'test-token'});
    },
    setItem() {}
  };
  global.setInterval = (handler, milliseconds) => {
    interval = {handler, milliseconds};
    return 1;
  };
  global.clearInterval = () => {};
  global.XMLHttpRequest = class MockRequest {
    open(method, url) { this.method = method; this.url = url; }
    setRequestHeader() {}
    send(body) { this.body = body; requests.push(this); }
    respond(value) {
      this.status = 200;
      this.responseText = JSON.stringify(value);
      this.onload();
    }
  };

  delete require.cache[require.resolve('../src/pkjs/index.js')];
  listeners.ready = undefined;
  require('../src/pkjs/index.js');
  listeners.ready();

  assert.equal(interval.milliseconds, 15000);
  assert.match(requests[0].url, /\/v1\/lists$/);
  const listResult = {lists: [{id: 'list-1', title: 'Personal', incompleteCount: 1,
    completedCount: 0}]};
  requests.shift().respond(listResult);

  const sentBeforeUnchangedPoll = sent.length;
  interval.handler();
  requests.shift().respond(listResult);
  const unchangedMessages = sent.slice(sentBeforeUnchangedPoll);
  assert.equal(unchangedMessages.filter(message => message.ITEM_KIND === 1).length, 0);
  assert.equal(unchangedMessages.filter(message => message.LIST_DONE === 1).length, 1);

  listeners.appmessage({payload: {COMMAND: 2, ITEM_INDEX: 0}});
  assert.match(requests[0].url, /\/v1\/lists\/list-1\/reminders$/);
  requests.shift().respond({reminders: [{id: 'item-1', title: 'Long reminder', completed: false}]});

  interval.handler();
  assert.match(requests[0].url, /\/v1\/lists\/list-1\/reminders$/);
});
