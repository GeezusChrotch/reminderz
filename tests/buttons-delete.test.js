const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

function setup(storage = {}) {
  storage.reminderzConfig ||= JSON.stringify({gatewayURL:'https://example.invalid', gatewayToken:'test'});
  const listeners = {}, sent = [], requests = [];
  const context = {
    module:{exports:{}},
    localStorage:{getItem:key=>storage[key]||null, setItem:(key,value)=>{storage[key]=value;}},
    Pebble:{addEventListener:(name,fn)=>{listeners[name]=fn;}, sendAppMessage:(m,ok)=>{sent.push(m);ok();}, getActiveWatchInfo:()=>({platform:'emery'})},
    setInterval:()=>1, clearInterval(){}, setTimeout:fn=>fn(),
    XMLHttpRequest:class {
      open(method,url){this.method=method;this.url=url;}
      setRequestHeader(){}
      send(body){this.body=body;requests.push(this);}
      respond(value){this.status=200;this.responseText=JSON.stringify(value);this.onload();}
    }
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../src/pkjs/index.js'),'utf8'),context);
  listeners.ready();
  return {api:context.module.exports, listeners, sent, requests, storage,
    command:payload=>listeners.appmessage({payload})};
}

test('pagination reaches every reminder, preserves page on edits, and clamps after deletion',()=>{
  const p=setup();
  p.requests.shift().respond({lists:[{id:'list',title:'Test'}]});
  let items=Array.from({length:101},(_,i)=>({id:'item'+i,title:'Item '+i}));
  function page(n) {
    p.sent.length=0;
    p.command({COMMAND:2,ITEM_ID:'list',PAGE_INDEX:n});
    p.requests.shift().respond({reminders:items});
    return p.sent.filter(m=>m.ITEM_KIND===2);
  }
  assert.equal(page(0).length,50);
  assert.equal(p.sent.at(-1).PAGE_COUNT,3);
  assert.equal(page(1)[0].ITEM_ID,'item50');
  assert.equal(page(2)[0].ITEM_ID,'item100');
  p.command({COMMAND:6,ITEM_ID:'item100',CONFIRMED:1});
  assert.match(p.requests[0].url,/item100\/delete$/);
  p.requests.shift().respond({ok:true});
  items=items.slice(0,100);
  p.requests.shift().respond({reminders:items});
  assert.equal(p.sent.at(-1).PAGE_INDEX,1);
  assert.equal(p.sent.at(-1).PAGE_COUNT,2);
  assert.equal(page(0)[0].ITEM_ID,'item0');
  items=[]; page(0);
  assert.equal(p.sent.at(-1).ITEM_COUNT,0);
  assert.equal(p.sent.at(-1).PAGE_COUNT,1);
});

test('a page change discards an older pending response',()=>{
  const p=setup();
  p.requests.shift().respond({lists:[{id:'list',title:'Test'}]});
  p.command({COMMAND:2,ITEM_ID:'list',PAGE_INDEX:0});
  p.command({COMMAND:2,ITEM_ID:'list',PAGE_INDEX:1});
  p.sent.length=0;
  const items=Array.from({length:60},(_,i)=>({id:'item'+i,title:'Item '+i}));
  p.requests.shift().respond({reminders:items});
  assert.equal(p.sent.length,0);
  p.requests.shift().respond({reminders:items});
  assert.equal(p.sent[0].ITEM_ID,'item50');
  assert.equal(p.sent.at(-1).PAGE_INDEX,1);
});

test('button defaults, persistence and navigation-safe validation',()=>{
  let p=setup();
  const defaults=p.api.normalizeButtons(null);
  assert.deepEqual(Array.from(defaults.lists),[1,5,3,4,2,0]);
  assert.deepEqual(Array.from(defaults.reminders),[1,5,6,4,2,7]);
  const custom={lists:[4,1,3,5,2,0],reminders:[5,1,7,6,2,4]};
  p.listeners.webviewclosed({response:encodeURIComponent(JSON.stringify({gatewayURL:'https://example.invalid',gatewayToken:'test',buttons:custom}))});
  assert.deepEqual(JSON.parse(p.storage.reminderzConfig).buttons,custom);
  p=setup(p.storage);
  assert.equal((p.sent[0].BUTTONS_REMINDERS >> 6)&7,7,'short Select deletion persists');
  assert.equal((p.sent[0].BUTTONS_REMINDERS >> 3)&7,1,'long Up navigation persists');
  const invalid=p.api.normalizeButtons({lists:[0,0,0,0,0,0],reminders:[7,7,7,7,7,7]});
  assert.deepEqual(Array.from(invalid.lists),Array.from(defaults.lists));
  assert.deepEqual(Array.from(invalid.reminders),Array.from(defaults.reminders));
  const html=decodeURIComponent(p.api.configurationURL().split(',').slice(1).join(','));
  assert.match(html,/Delete reminder \(confirm\)/);
  assert.match(html,/button_reminders_2/);
  const script=html.match(/<script>([\s\S]*)<\/script>/)[1];
  assert.doesNotThrow(()=>new vm.Script(script),'generated settings JavaScript parses');
});

test('only confirmed deletion sends a request and it uses identity, not row position',()=>{
  const p=setup();
  p.requests.shift().respond({lists:[{id:'list',title:'Test'}]});
  p.command({COMMAND:2,ITEM_ID:'list'});
  p.requests.shift().respond({reminders:[{id:'first',title:'First'},{id:'second',title:'Second'}]});
  p.command({COMMAND:6,ITEM_ID:'first'});
  p.command({COMMAND:6,ITEM_ID:'first',CONFIRMED:0});
  assert.equal(p.requests.length,0,'cancel/unconfirmed input cannot delete');
  p.command({COMMAND:2,ITEM_ID:'list'});
  p.requests.shift().respond({reminders:[{id:'second',title:'Second'},{id:'first',title:'First'}]});
  p.command({COMMAND:6,ITEM_ID:'first',ITEM_INDEX:0,CONFIRMED:1});
  const deletion=p.requests.shift();
  assert.match(deletion.url,/\/reminders\/first\/delete$/);
  assert.equal(deletion.method,'POST');
  assert.deepEqual(JSON.parse(deletion.body),{confirmed:true});
  p.command({COMMAND:6,ITEM_ID:'second',CONFIRMED:1});
  assert.equal(p.requests.length,0,'duplicate actions are blocked while deleting');
  deletion.respond({ok:true});
  assert.match(p.requests.shift().url,/\/lists\/list\/reminders$/);
});
