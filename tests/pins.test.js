const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

function phone(storage) {
  const listeners = {}, sent = [], requests = [];
  const context = {
    localStorage: {getItem: key => storage[key] || null, setItem: (key, value) => { storage[key] = value; }},
    Pebble: {
      addEventListener: (name, callback) => { listeners[name] = callback; },
      sendAppMessage: (message, success) => { sent.push(message); success(); }
    },
    setInterval: () => 1, clearInterval() {}, setTimeout: fn => fn(),
    XMLHttpRequest: class {
      open(method, url) { this.url = url; }
      setRequestHeader() {}
      send() { requests.push(this); }
      respond(value) { this.status = 200; this.responseText = JSON.stringify(value); this.onload(); }
    }
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../src/pkjs/index.js'), 'utf8'), context);
  listeners.ready();
  return {sent, requests, command: payload => listeners.appmessage({payload})};
}

test('multiple pins persist by ID, newest first; unpin restores source order', () => {
  const storage = {reminderzConfig: JSON.stringify({gatewayURL:'https://example.invalid', gatewayToken:'test'})};
  const result = {lists: [
    {id:'a', title:'Alpha'}, {id:'b', title:'Beta'}, {id:'c', title:'Charlie'}
  ]};
  let p = phone(storage);
  p.requests.shift().respond(result);
  function pin(id) { p.sent.length = 0; p.command({COMMAND:5, ITEM_ID:id}); }
  function rows() { return p.sent.filter(row => row.ITEM_KIND === 1); }
  pin('c');
  assert.deepEqual(rows().map(row => row.ITEM_ID), ['c','a','b']);
  assert.equal(rows()[0].ITEM_PINNED, 1);
  assert.equal(p.sent.at(-1).ITEM_ID, 'c', 'focus follows the moved list');
  pin('b');
  assert.deepEqual(rows().map(row => row.ITEM_ID), ['b','c','a']);
  assert.deepEqual(rows().map(row => row.ITEM_PINNED), [1,1,0]);
  assert.equal(p.requests.length, 0, 'pinning needs no Connector request');

  p = phone(storage);
  p.requests.shift().respond({lists: [
    {id:'c',title:'A renamed list'}, {id:'a',title:'Alpha'}, {id:'b',title:'Beta'}
  ]});
  assert.deepEqual(rows().map(row => row.ITEM_ID), ['b','c','a'], 'rename and relaunch preserve pins');
  pin('b');
  assert.deepEqual(rows().map(row => row.ITEM_ID), ['c','a','b']);
  pin('c');
  assert.deepEqual(rows().map(row => row.ITEM_PINNED), [0,0,0]);
  assert.deepEqual(JSON.parse(storage.reminderzPinnedLists), []);

  p.command({COMMAND:2, ITEM_ID:'b', ITEM_INDEX:0});
  assert.match(p.requests[0].url, /\/lists\/b\/reminders$/, 'stable ID wins over stale row position');
});

test('pins are ordered before the 30-list cap and deleted IDs do not make phantom rows', () => {
  const storage = {
    reminderzConfig: JSON.stringify({gatewayURL:'https://example.invalid', gatewayToken:'test'}),
    reminderzPinnedLists: JSON.stringify(['deleted','list-34','list-31'])
  };
  const p = phone(storage);
  p.requests.shift().respond({lists: Array.from({length:35}, (_, i) => ({id:`list-${i}`,title:`List ${i}`}))});
  const rows = p.sent.filter(row => row.ITEM_KIND === 1);
  assert.equal(rows.length,30);
  assert.deepEqual(rows.slice(0,2).map(row => row.ITEM_ID), ['list-34','list-31']);
  assert.ok(!rows.some(row => row.ITEM_ID === 'deleted'));
});
