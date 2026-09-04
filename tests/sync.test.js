const test = require('node:test');
const assert = require('node:assert/strict');

test('15-second polling follows the visible screen and suppresses unchanged item bursts', () => {
  const listeners = {};
  const sent = [];
  const requests = [];
  let interval = null;
  let failRows = false;

  global.Pebble = {
    addEventListener(name, handler) { listeners[name] = handler; },
    getActiveWatchInfo() { return {platform: 'basalt'}; },
    sendAppMessage(payload, success, failure) {
      if (failRows && payload.ITEM_KIND === 2) { failure(); return; }
      sent.push(payload); if (success) success();
    },
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
  global.setTimeout = handler => { handler(); return 1; };
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
  assert.equal(unchangedMessages.length, 0);

  listeners.appmessage({payload: {COMMAND: 2, ITEM_INDEX: 0}});
  assert.match(requests[0].url, /\/v1\/lists\/list-1\/reminders$/);
  requests.shift().respond({reminders: [{id: 'item-1', title: 'Long reminder', completed: false}]});

  interval.handler();
  assert.match(requests[0].url, /\/v1\/lists\/list-1\/reminders$/);
  const reminderResult = {reminders: [{id: 'item-1', title: 'Long reminder', completed: false}]};
  requests.shift().respond(reminderResult);

  const beforeFailure = sent.length;
  interval.handler();
  requests.shift().onerror();
  assert.equal(sent.length, beforeFailure, 'automatic network failures send no watch message or vibration');
  interval.handler();
  const failed = requests.shift();
  failed.status = 502;
  failed.responseText = '{}';
  failed.onload();
  assert.equal(sent.length, beforeFailure, 'automatic HTTP errors are also silent');

  listeners.appmessage({payload: {COMMAND: 2, ITEM_INDEX: 0}});
  requests.shift().respond(reminderResult);
  assert.ok(sent.slice(beforeFailure).some(message => message.ITEM_KIND === 2),
    'reopening an unchanged list resends its rows');

  const beforeTransfer = sent.length;
  failRows = true;
  const changed = {reminders: [{id: 'item-2', title: 'Changed reminder', completed: false}]};
  interval.handler();
  requests.shift().respond(changed);
  assert.equal(sent.length, beforeTransfer, 'failed rows do not send a misleading completion count');
  failRows = false;
  interval.handler();
  requests.shift().respond(changed);
  assert.ok(sent.slice(beforeTransfer).some(message => message.ITEM_TITLE === 'Changed reminder'),
    'next poll retransmits after failed delivery instead of caching an undelivered list');

  listeners.appmessage({payload: {COMMAND: 2, ITEM_INDEX: 0}});
  requests.shift().onerror();
  assert.ok(sent.at(-1).ERROR, 'explicit loads still report their error for retry');
  interval.handler();
  requests.shift().respond(changed);
  assert.ok(sent.at(-1).LIST_DONE, 'polling recovers an explicit failed load');
});
