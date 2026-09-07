// BEGIN ORGANIK SETTINGS UI
// Organik settings UI v1. Vendored by sync.py; no network or storage dependencies.
function organikSettingsHTML(html, options) {
  var script = '(' + organikSettingsClient.toString() + ')(' + JSON.stringify(options).replace(/</g, '\\u003c') + ');';
  // Run after the app's own controls and event handlers have been initialized.
  var at = html.lastIndexOf('</script>');
  return html.slice(0, at) + ';' + script + html.slice(at);
}
function organikSettingsClient(options) {
  var d = document, app = options.app;
  function id(name) { return d.getElementById(name); }
  function all(selector, root) { return Array.prototype.slice.call((root || d).querySelectorAll(selector)); }
  function el(tag, text, cls) { var n = d.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; return n; }
  function button(text, fn) { var b = el('button', text); b.type = 'button'; b.onclick = fn; return b; }
  var style = el('style');
  style.textContent = 'html{color-scheme:light}*{box-sizing:border-box}body{font:17px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;background:#f2f2f7!important;color:#111!important;margin:0 auto!important;padding:20px 20px 40px!important;max-width:620px!important;line-height:1.45}.wrap{padding:0!important}h1{font-size:28px!important;color:#111!important;margin:4px 0 16px!important}h2{font-size:20px!important;margin:24px 0 12px}h3{font-size:17px}p,.hint{color:#61616b!important;font-size:14px;line-height:1.45}label{display:block;font-weight:600;margin:14px 0 6px}input,select,textarea{font:16px -apple-system,sans-serif!important;width:100%;min-width:0;padding:13px!important;border:1px solid #bbb!important;border-radius:10px!important;background:#fff!important;color:#111!important;margin:8px 0 16px!important}textarea{min-height:130px}input[type=checkbox]{width:auto!important;margin:0 10px 0 0!important;accent-color:#34a853}button{font:600 16px -apple-system,sans-serif!important;min-height:44px;padding:13px!important;border:0;border-radius:10px!important;background:#34a853;color:white;cursor:pointer}button:disabled{opacity:.5;cursor:default}button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid #0878d1;outline-offset:3px}.secondary,.palette-done{background:#e5e5ea!important;color:#111!important}.danger{background:#fff!important;color:#b42318!important;border:1px solid #d7d7dc!important}.card,.theme-card,.threads,details{background:white;border:1px solid #d7d7dc;border-radius:12px;padding:14px;margin:12px 0 20px}.card h2{margin-top:0}.organik-tabs{display:flex!important;gap:3px!important;padding:3px!important;background:#dedee3!important;border-radius:11px!important;margin:0 0 22px!important;position:static!important;overflow-x:auto}.organik-tabs button{flex:1;min-width:max-content;width:auto!important;font-size:14px!important;min-height:44px;padding:9px 12px!important;background:transparent!important;color:#555!important}.organik-tabs button[aria-selected=true]{background:white!important;color:#111!important;box-shadow:0 1px 3px #aaa}.organik-panel{padding:0!important}.organik-panel[hidden]{display:none!important}.organik-help{background:#fff7df;border:1px solid #e3bd5c;border-radius:12px;padding:13px;color:#604500!important;font-size:14px}.organik-preview{width:216px!important;height:244px!important;margin:16px auto 24px!important;border:8px solid #252525!important;border-radius:24px!important;overflow:hidden!important;padding:8px!important;box-shadow:0 8px 22px #ccc;line-height:1.2}.organik-preview .preview-row{padding:10px 4px;display:block;height:auto;min-height:47px}.organik-preview small{font:14px/1.3 Arial,sans-serif}.organik-palette-trigger{width:100%;height:58px;display:flex;align-items:center;gap:12px;background:white!important;color:#111!important;border:1px solid #bbb!important;margin:8px 0 16px;text-align:left}.organik-swatch{width:36px;height:36px;border-radius:7px;border:1px solid #888;flex:none}.organik-color-value{font:15px ui-monospace,monospace}.organik-overlay{position:fixed;inset:0;background:#0008;z-index:30;display:flex;align-items:center;justify-content:center;padding:14px}.organik-overlay[hidden]{display:none}.organik-dialog{background:#f2f2f7;border-radius:16px;padding:16px;max-width:390px;width:100%;max-height:90vh;overflow:auto}.organik-dialog h2{margin-top:0}.organik-colors{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:5px}.organik-colors button{min-height:32px;height:38px;padding:0!important;border:1px solid #888;border-radius:7px!important}.organik-colors button[aria-pressed=true]{outline:3px solid #0878d1;outline-offset:1px}.organik-dialog>button{width:100%;margin-top:16px}.organik-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}.organik-apply{background:#0878d1!important;color:white!important;width:100%;margin:14px 0}.error,[role=alert]{color:#b42318!important}.emoji-picker-card{background:#f2f2f7!important}.emoji-choice,.emoji-grid button{background:#fff!important;color:#111!important}.emoji-slot{grid-template-columns:28px minmax(0,1fr) 40px 40px}.emoji-slot button{padding:6px!important}.button-grid,.row,.grid,.swatches{min-width:0}.button-grid>*,.row>*,.grid>*,.swatches>*{min-width:0}@media(max-width:380px){body{padding:16px 12px 32px!important}.button-grid,.swatches{grid-template-columns:1fr!important}.organik-tabs button{padding:9px!important}}';
  d.body.setAttribute('data-organik-app',app);
  style.textContent += '[data-organik-app=pome] .organik-preview{padding:0!important}[data-organik-app=pome] .organik-preview .preview-row{display:flex;padding:0 3px 0 6px;min-height:0}';
  d.head.appendChild(style);
  var panels = {}, tabs, host = app === 'beepster' ? id('form') : d.body;
  function panel(name, title) { var p = el('section', '', 'organik-panel'); p.id = 'organik-' + name; p.setAttribute('aria-label', title); panels[name] = p; host.appendChild(p); return p; }
  function move(n, p) { if (n) p.appendChild(n); }
  function split(root, mapping, initial) {
    var dest = initial;
    Array.prototype.slice.call(root.children).forEach(function(n) {
      if (n.tagName === 'SCRIPT' || n.tagName === 'STYLE' || n.tagName === 'H1' || n === tabs || n.classList.contains('organik-panel')) return;
      if (n.tagName === 'H2' && mapping[n.textContent]) dest = mapping[n.textContent];
      move(n, panels[dest]);
    });
  }
  if (app === 'pome' || app === 'tesla') {
    ['setup','themes','shortcuts'].forEach(function(name) { panels[name] = id(name + 'Panel'); panels[name].classList.add('organik-panel'); });
    tabs = d.querySelector('.tabs');
    if (app === 'tesla') { var title = el('h1', 'Gandalf+Gilda'); d.body.insertBefore(title, tabs); }
  } else {
    tabs = el('nav');
    panel('setup', 'Setup'); panel('themes', 'Themes');
    if (app !== 'pebclaw') panel('shortcuts', 'Shortcuts');
    if (app === 'notesy') panel('vault', 'Vault');
    if (app === 'beepster') panel('replies', 'Replies');
    var heading = d.querySelector('h1'); heading.parentNode.insertBefore(tabs, heading.nextSibling);
    if (app === 'notesy') {
      var save = id('save'), status = id('status'), pending = id('pending').parentNode;
      split(d.body, {'Hidden folders':'vault','Dictation':'shortcuts','Button shortcuts':'shortcuts','Appearance':'themes'}, 'setup');
      move(id('auto').parentNode, panels.shortcuts); move(pending, panels.vault);
      d.body.appendChild(save); d.body.appendChild(status);
    } else if (app === 'reminderz') {
      all('body > .card').forEach(function(n) { var title = n.querySelector('h2').textContent; move(n, panels[title === 'Theme' ? 'themes' : title === 'Button actions' ? 'shortcuts' : 'setup']); });
      // Keep the original save action and status reachable from every tab.
      var save = all('body > button').filter(function(n) { return n.getAttribute('onclick') === 'save()'; })[0];
      move(save, d.body); move(id('status'), d.body);
    } else if (app === 'pebclaw') {
      var save = all('body > button').filter(function(n) { return n.getAttribute('onclick') === 'save()'; })[0];
      split(d.body, {'Appearance':'themes'}, 'setup'); d.body.appendChild(save); move(id('status'), d.body);
    } else {
      var oldTabs = id('generalTab').parentNode; oldTabs.parentNode.removeChild(oldTabs);
      split(id('generalPanel'), {'Saved themes':'themes','Theme editor':'themes','Quick replies':'replies','Emoji replies':'replies','Included services':'setup'}, 'setup');
      while (id('buttonsPanel').firstChild) move(id('buttonsPanel').firstChild, panels.shortcuts);
      move(id('pairing'), panels.setup);
      id('generalPanel').remove(); id('buttonsPanel').remove();
      host.appendChild(id('save')); host.appendChild(id('status'));
    }
  }
  tabs.className = 'organik-tabs'; tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', 'Settings sections'); tabs.innerHTML = '';
  var keys = Object.keys(panels);
  function show(name, focus) {
    keys.forEach(function(key) { var selected = key === name, b = id('organik-tab-' + key), p = panels[key]; p.hidden = !selected; p.classList.toggle('active', selected); p.classList.remove('hidden'); b.setAttribute('aria-selected', String(selected)); b.tabIndex = selected ? 0 : -1; });
    if (focus) id('organik-tab-' + name).focus();
  }
  keys.forEach(function(name, index) {
    var b = button(name.charAt(0).toUpperCase() + name.slice(1), function() { show(name); }); b.id = 'organik-tab-' + name; b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', panels[name].id);
    panels[name].setAttribute('role', 'tabpanel'); panels[name].setAttribute('aria-labelledby', b.id);
    b.onkeydown = function(e) { var i = index; if (e.key === 'ArrowRight') i = (i + 1) % keys.length; else if (e.key === 'ArrowLeft') i = (i + keys.length - 1) % keys.length; else if (e.key === 'Home') i = 0; else if (e.key === 'End') i = keys.length - 1; else return; e.preventDefault(); show(keys[i], true); }; tabs.appendChild(b);
  });
  // Reveal validation errors and expired pairing even when another tab is open.
  var observer = new MutationObserver(function() { all('.error,#buttonError,#status,#folder-status').forEach(function(n) { if (!n.textContent || !/error|failed|cannot|could not|keep move|expired|enter the current/i.test(n.textContent)) return; keys.forEach(function(key) { if (panels[key].contains(n)) show(key); }); }); if (id('pairing') && !id('pairing').classList.contains('hidden') && app === 'beepster') show('setup'); });
  ['status','buttonError','pairing'].forEach(function(name) { if(id(name)) observer.observe(id(name), {childList:true,subtree:true,attributes:true,attributeFilter:['class']}); });
  show('setup');
  all('label').forEach(function(label, i) { if (label.querySelector('input,select,textarea') || label.htmlFor) return; var next = label.nextElementSibling; if (next && /^(INPUT|SELECT|TEXTAREA)$/.test(next.tagName)) { if (!next.id) next.id = 'organik-control-' + i; label.htmlFor = next.id; } });
  all('#status,#buttonError,#folder-status').forEach(function(n) { n.setAttribute('role','status'); n.setAttribute('aria-live','polite'); });
  var themePanel = panels.themes;
  if (app !== 'pome') themePanel.insertBefore(el('p', 'Choose a preset or edit your own colors, font and size. The preview updates as you edit. Save and apply sends your settings to the watch.', 'organik-help'), themePanel.firstChild);
  var preview = id('preview');
  if (!preview) { preview = el('div'); preview.id = 'preview'; preview.innerHTML = '<div class="preview-title">Notesy</div><div class="preview-row selected">Meeting notes<small><br>Today · Pebble</small></div><div class="preview-row">Ideas<small><br>Capture a thought</small></div><div class="preview-row">Shopping list</div>'; }
  if(app==='pebclaw')preview.innerHTML='<strong>PebClaw</strong><div class=preview-row>You: What is next?</div><div class=preview-row>Agent: Review notes.</div>';
  preview.classList.add('organik-preview'); preview.setAttribute('aria-label', 'Watch theme preview'); themePanel.insertBefore(preview, themePanel.children[1] || null);
  var map = options.fields || {}, raw = [], watch = options.watchColors;
  for (var c = 0; c < 64; c++) raw.push('#' + [Math.floor(c/16),Math.floor(c/4)%4,c%4].map(function(v) { var s=(v*85).toString(16);return s.length<2?'0'+s:s; }).join(''));
  function colorIndex(hex) { if (!/^#[0-9a-f]{6}$/i.test(hex)) return 0; return Math.round(parseInt(hex.slice(1,3),16)/85)*16 + Math.round(parseInt(hex.slice(3,5),16)/85)*4 + Math.round(parseInt(hex.slice(5,7),16)/85); }
  function display(hex) { return watch[colorIndex(hex)]; }
  function value(key) { return id(map[key]) && id(map[key]).value; }
  function fire(control) { ['input','change'].forEach(function(type) { var e = d.createEvent('HTMLEvents'); e.initEvent(type, true, false); control.dispatchEvent(e); }); }
  var swatches = [];
  function refresh() {
    swatches.forEach(function(s) { s.swatch.style.background = display(s.input.value); s.value.textContent = s.input.value.toUpperCase(); });
    if (app === 'pome') {window.preview();return;}
    var text = value('text') || '#000000', bg = value('background') || '#ffffff', selected = value('selection') || value('accent') || '#000000';
    preview.style.color = display(text); preview.style.background = display(bg);
    var font = value('font'), families = {inter:'Inter,Arial,sans-serif',roboto:'Roboto,Arial,sans-serif','open-sans':'Open Sans,Arial,sans-serif',montserrat:'Montserrat,Arial,sans-serif',poppins:'Poppins,Arial,sans-serif','droid-serif':'Georgia,serif','3':'Georgia,serif','roboto-condensed':'Arial Narrow,Arial,sans-serif'};
    preview.style.fontFamily = families[font] || 'Arial,sans-serif'; preview.style.fontWeight = /^(gothic-bold|droid-serif|bitham-black|1|3|4)$/.test(font) ? '700' : '400'; preview.style.fontSize = (Number(value('size')) || 22) + 'px';
    all('.selected', preview).forEach(function(row) { row.style.background=display(selected); var h=display(selected), luminance=parseInt(h.slice(1,3),16)*299+parseInt(h.slice(3,5),16)*587+parseInt(h.slice(5,7),16)*114; row.style.color=luminance>=150000?'#000':'#fff'; });
    var muted=preview.querySelector('.preview-muted'), accent=preview.querySelector('.preview-button'); if(muted) muted.style.color=display(value('muted')||text); if(accent) {accent.style.background=display(selected);accent.style.color=display(value('accentText')||'#ffffff');}
  }
  var overlay = el('div','','organik-overlay'), dialog = el('div','','organik-dialog'), grid=el('div','','organik-colors'), target=null, returnFocus=null;
  overlay.hidden=true; dialog.setAttribute('role','dialog'); dialog.setAttribute('aria-modal','true'); dialog.setAttribute('aria-label','Choose a Pebble color'); dialog.appendChild(el('h2','Choose a Pebble color')); dialog.appendChild(grid);
  function close() {overlay.hidden=true;if(returnFocus)returnFocus.focus();}
  dialog.appendChild(button('Done',close)); overlay.appendChild(dialog); d.body.appendChild(overlay);
  raw.forEach(function(hex,index) {var b=button('',function(){target.value=hex;fire(target);refresh();close();});b.style.background=watch[index];b.setAttribute('aria-label','Pebble color '+hex.toUpperCase());b.dataset.color=hex;grid.appendChild(b);});
  overlay.onclick=function(e){if(e.target===overlay)close();}; overlay.onkeydown=function(e){if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){var bs=all('button',dialog),first=bs[0],last=bs[bs.length-1];if(e.shiftKey&&d.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&d.activeElement===last){e.preventDefault();first.focus();}}};
  Object.keys(map).forEach(function(key){if(['font','size'].indexOf(key)>=0)return;var input=id(map[key]);if(!input)return;
    if(input.tagName==='SELECT') { var selected=input.value; raw.forEach(function(hex){if(!all('option',input).some(function(o){return o.value.toLowerCase()===hex;})){var option=el('option',hex.toUpperCase());option.value=hex;input.appendChild(option);}});input.value=selected; }
    // Keep original form controls as the source of truth; the palette changes them through normal events.
    var previous=input.previousElementSibling;if(previous&&previous.classList.contains('palette-trigger')){previous.hidden=true;previous.style.setProperty('display','none','important');}
    input.hidden=true; input.style.setProperty('display','none','important');
    var b=button('',function(){target=input;returnFocus=b;all('button',grid).forEach(function(o){o.setAttribute('aria-pressed',String(o.dataset.color===raw[colorIndex(input.value)]));});overlay.hidden=false;grid.children[colorIndex(input.value)].focus();});b.className='organik-palette-trigger';b.setAttribute('aria-label','Choose '+key.replace(/([A-Z])/g,' $1').toLowerCase()+' color');var swatch=el('span','','organik-swatch'),label=el('span','','organik-color-value');b.appendChild(swatch);b.appendChild(label);input.parentNode.insertBefore(b,input.nextSibling);swatches.push({input:input,swatch:swatch,value:label});
  });
  if(app==='reminderz'){var preset=id('preset'),custom=el('option','Custom');custom.value='custom';custom.disabled=true;preset.appendChild(custom);themePanel.addEventListener('change',function(e){if(Object.keys(map).some(function(k){return map[k]===e.target.id;}))preset.value='custom';});}
  themePanel.addEventListener('input',refresh);themePanel.addEventListener('change',refresh);themePanel.addEventListener('click',function(){setTimeout(refresh,0);});
  // Older apps have presets but no custom library. Store only appearance fields in the app callback.
  if(options.library) {
    var library=Array.isArray(options.savedThemes)?options.savedThemes.slice(0,20):[],card=el('div','','theme-card'),menu=el('select'),name=el('input');menu.id='organik-saved-theme';name.id='organik-theme-name';name.maxLength=32;name.placeholder='My theme';
    var label=el('label','Saved custom themes');label.htmlFor=menu.id;card.appendChild(label);card.appendChild(menu);label=el('label','Theme name');label.htmlFor=name.id;card.appendChild(label);card.appendChild(name);
    function renderLibrary(){menu.innerHTML='';var o=el('option','Current preview');o.value='';menu.appendChild(o);library.forEach(function(t,i){var o=el('option',t.name);o.value=i;menu.appendChild(o);});}
    function readLibraryTheme(){var t={name:name.value.trim()||'My theme'};Object.keys(map).forEach(function(k){t[k]=value(k);});return t;}
    function setControl(input,v){if(!input)return;if(input.tagName==='SELECT'&&!all('option',input).some(function(o){return o.value===String(v)&&!o.disabled;}))return;input.value=v;fire(input);}
    menu.onchange=function(){if(menu.value==='')return;var t=library[Number(menu.value)];name.value=t.name;Object.keys(map).forEach(function(k){if(k==='size')return;var input=id(map[k]);if(input&&t[k]!==undefined){setControl(input,t[k]);}});if(id(map.size)){setControl(id(map.size),t.size);}refresh();};
    var row=el('div','','organik-actions');row.appendChild(button('Save custom theme',function(){var t=readLibraryTheme(),found=-1;library.forEach(function(v,i){if(v.name.toLowerCase()===t.name.toLowerCase())found=i;});if(found<0&&library.length>=20){alert('You can save up to 20 custom themes. Delete one first.');return;}if(found<0){library.push(t);found=library.length-1;}else library[found]=t;renderLibrary();menu.value=String(found);}));var remove=button('Delete custom theme',function(){if(menu.value==='')return;library.splice(Number(menu.value),1);renderLibrary();});remove.className='danger';row.appendChild(remove);card.appendChild(row);card.appendChild(el('p','Custom themes are kept on this phone when you save and apply settings. Built-in presets remain available below.'));renderLibrary();themePanel.insertBefore(card,preview.nextSibling);
    window.organikSavedThemes=function(){return library;};
  }
  if(options.apply) {var mainSave=id('save') || all('body > button').filter(function(n){return n.getAttribute('onclick')==='save()';})[0]; if(mainSave){mainSave.classList.add('organik-apply');if(app!=='beepster')mainSave.textContent='Save & Apply to Watch';}}
  refresh();
}

// END ORGANIK SETTINGS UI
/* global Pebble, localStorage, XMLHttpRequest */
var COMMAND_LOAD_LISTS = 1;
var COMMAND_LOAD_REMINDERS = 2;
var COMMAND_TOGGLE_REMINDER = 3;
var COMMAND_CREATE_REMINDER = 4;
var COMMAND_TOGGLE_PIN = 5;
var COMMAND_DELETE_REMINDER = 6;
var ITEM_KIND_LIST = 1;
var ITEM_KIND_REMINDER = 2;
var MAX_LISTS = 30;
var MAX_REMINDERS = 50;
var reminderPage = 0;
var REFRESH_INTERVAL_MS = 15000;
var lists = [];
var sourceLists = [];
var reminders = [];
var activeListIndex = -1;
var refreshTimer = null;
var listsLoading = false;
var remindersLoading = false;
var listsRefreshPending = false;
var remindersRefreshPending = false;
var mutationInFlight = false;
var listsSignature = null;
var remindersSignature = null;
var DEFAULT_BUTTONS = {lists:[1,5,3,4,2,0,0], reminders:[1,5,6,4,2,7,0]};
var BUTTON_LABELS = ["No action", "Move up", "Move down", "Open list", "Pin / unpin list", "New reminder", "Check / uncheck", "Delete reminder (confirm)"];

function normalizeButtons(value) {
  var result = {};
  ["lists", "reminders"].forEach(function(screen) {
    var choices = screen === "lists" ? [0,1,2,3,4,5] : [0,1,2,4,5,6,7];
    var saved = value && Array.isArray(value[screen]) ? value[screen] : [];
    var actions = DEFAULT_BUTTONS[screen].map(function(fallback, index) {
  return choices.indexOf(saved[index]) >= 0 ? saved[index] : fallback;
    });
    if (actions.indexOf(1) < 0 || actions.indexOf(2) < 0 ||
        (screen === "lists" && actions.indexOf(3) < 0)) actions = DEFAULT_BUTTONS[screen].slice();
    result[screen] = actions;
  });
  return result;
}

function configurationMessage(config) {
  var message = themeMessage(config.theme), buttons = normalizeButtons(config.buttons);
  function packed(values) { return values.reduce(function(total, action, index) { return total | (action << (index * 3)); }, 0); }
  message.BUTTONS_LISTS = packed(buttons.lists);
  message.BUTTONS_REMINDERS = packed(buttons.reminders);
  return message;
}

var CLASSIC_THEMES = [
  {name:"Classic",text:"#000000",background:"#ffffff",selection:"#000000",font:"gothic",size:24},
  {name:"Pome Amber",text:"#550000",background:"#ffffaa",selection:"#ffaa00",font:"gothic-bold",size:24},
  {name:"Midnight",text:"#ffffff",background:"#000055",selection:"#00aaff",font:"roboto-condensed",size:21},
  {name:"Forest",text:"#ffffff",background:"#005500",selection:"#aaff00",font:"droid-serif",size:28},
  {name:"Berry",text:"#ffffff",background:"#550055",selection:"#ff55aa",font:"bitham-black",size:30}
];
var TIME2_THEMES = [
  {name:"Classic",text:"#000000",background:"#ffffff",selection:"#000000",font:"inter",size:22},
  {name:"Pome Amber",text:"#550000",background:"#ffffaa",selection:"#ffaa00",font:"montserrat",size:22},
  {name:"Midnight",text:"#ffffff",background:"#000055",selection:"#00aaff",font:"roboto",size:22},
  {name:"Forest",text:"#ffffff",background:"#005500",selection:"#aaff00",font:"open-sans",size:26},
  {name:"Berry",text:"#ffffff",background:"#550055",selection:"#ff55aa",font:"poppins",size:30}
];
var THEME_FONTS = {"gothic":0,"gothic-bold":1,"roboto-condensed":2,"droid-serif":3,
  "bitham-black":4,"inter":5,"roboto":6,"open-sans":7,"montserrat":8,"poppins":9};
var THEME_SIZES = {"gothic":[14,18,24,28],"gothic-bold":[14,18,24,28],
  "roboto-condensed":[21],"droid-serif":[28],"bitham-black":[30],
  "inter":[14,18,22,26,30],"roboto":[14,18,22,26,30],"open-sans":[14,18,22,26,30],
  "montserrat":[14,18,22,26,30],"poppins":[14,18,22,26,30]};

function isTime2() {
  try { return Pebble.getActiveWatchInfo().platform === "emery"; } catch (error) { return false; }
}

function validColor(value, fallback) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : fallback;
}

function closestSize(value, sizes) {
  var chosen = sizes[0];
  for (var i = 1; i < sizes.length; i++) {
    if (Math.abs(sizes[i] - value) < Math.abs(chosen - value)) chosen = sizes[i];
  }
  return chosen;
}

function normalizeTheme(value) {
  value = value && typeof value === "object" ? value : {};
  var time2 = isTime2();
  var fallback = time2 ? TIME2_THEMES[0] : CLASSIC_THEMES[0];
  var font = Object.prototype.hasOwnProperty.call(THEME_FONTS, value.font) ? value.font : fallback.font;
  if (time2 && THEME_FONTS[font] < 5) font = ["inter","montserrat","roboto","open-sans","poppins"][THEME_FONTS[font]];
  if (!time2 && THEME_FONTS[font] >= 5) font = "gothic";
  var requested = parseInt(value.size, 10);
  if (!isFinite(requested)) requested = fallback.size;
  return {
    name: typeof value.name === "string" && value.name.trim() ? value.name.trim().slice(0, 32) : fallback.name,
    text: validColor(value.text, fallback.text),
    background: validColor(value.background, fallback.background),
    selection: validColor(value.selection, fallback.selection),
    font: font,
    size: closestSize(requested, THEME_SIZES[font])
  };
}

function savedConfig() {
  var fallback = {gatewayURL:"", gatewayToken:"", autoRefresh:true, theme:normalizeTheme(null), buttons:normalizeButtons(null)};
  try {
    var parsed = JSON.parse(localStorage.getItem("reminderzConfig") || "null");
    if (!parsed) return fallback;
  return {
      gatewayURL: typeof parsed.gatewayURL === "string" ? parsed.gatewayURL.replace(/\/+$/, "") : "",
      gatewayToken: typeof parsed.gatewayToken === "string" ? parsed.gatewayToken.trim() : "",
      autoRefresh: parsed.autoRefresh !== false,
      buttons: normalizeButtons(parsed.buttons),
      settingsThemes: Array.isArray(parsed.settingsThemes) ? parsed.settingsThemes.slice(0,20) : [],
      theme: normalizeTheme(parsed.theme)
    };
  } catch (error) { return fallback; }
}

function pebbleColor(hex) {
  hex = validColor(hex, "#000000");
  var r = Math.round(parseInt(hex.slice(1,3),16) * 3 / 255);
  var g = Math.round(parseInt(hex.slice(3,5),16) * 3 / 255);
  var b = Math.round(parseInt(hex.slice(5,7),16) * 3 / 255);
  return 0xc0 | (r << 4) | (g << 2) | b;
}

function contrast(hex) {
  var r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 150 ? "#000000" : "#ffffff";
}

function themeMessage(theme) {
  theme = normalizeTheme(theme);
  return {THEME_BACKGROUND:pebbleColor(theme.background),THEME_TEXT:pebbleColor(theme.text),
    THEME_SELECTION:pebbleColor(theme.selection),THEME_SELECTION_TEXT:pebbleColor(contrast(theme.selection)),
    THEME_FONT:THEME_FONTS[theme.font],THEME_SIZE:theme.size};
}

function send(payload, done) {
  var attempts = 0;
  function attempt() {
    Pebble.sendAppMessage(payload, function() { if (done) done(); }, function() {
      attempts++;
      if (attempts < 4) setTimeout(attempt, attempts * 150);
      else if (done) done(new Error("Watch transfer failed"));
    });
  }
  attempt();
}

function sendSequence(messages, done) {
  var index = 0;
  function next(error) {
    if (error) { if (done) done(error); return; }
    if (index >= messages.length) { if (done) done(); return; }
    send(messages[index++], next);
  }
  next();
}

function sendError(error) {
  var message = error && error.message ? error.message : "Sync failed";
  send({ERROR:String(message).slice(0, 60)});
}

function api(method, path, body, callback) {
  var config = savedConfig();
  if (!config.gatewayURL || !config.gatewayToken) {
    callback(new Error("Open phone Settings to connect your Mac"));
    return;
  }
  var request = new XMLHttpRequest();
  request.open(method, config.gatewayURL + path, true);
  request.timeout = 15000;
  request.setRequestHeader("Authorization", "Bearer " + config.gatewayToken);
  if (body) request.setRequestHeader("Content-Type", "application/json");
  request.onload = function() {
    var result = null;
    try { result = request.responseText ? JSON.parse(request.responseText) : {}; }
    catch (error) { callback(new Error("Connector returned an invalid response")); return; }
    if (request.status < 200 || request.status >= 300) {
      callback(new Error(result.error || ("Connector error " + request.status))); return;
    }
    callback(null, result);
  };
  request.onerror = function() { callback(new Error("Cannot reach Reminderz Connector")); };
  request.ontimeout = function() { callback(new Error("Reminderz Connector timed out")); };
  request.send(body ? JSON.stringify(body) : null);
}

function finishListsLoad() {
  listsLoading = false;
  if (listsRefreshPending) {
    listsRefreshPending = false;
    loadLists();
  }
}

function pinnedListIDs() {
  try {
    var saved = JSON.parse(localStorage.getItem("reminderzPinnedLists") || "[]");
    if (Array.isArray(saved)) return saved.filter(function(id, index) {
  return typeof id === "string" && id && saved.indexOf(id) === index;
    }).slice(0, MAX_LISTS);
  } catch (error) {}
  return [];
}

function orderedLists(items, pins) {
  var ordered = [];
  pins.forEach(function(id) {
    items.forEach(function(item) { if (item.id === id) ordered.push(item); });
  });
  items.forEach(function(item) { if (pins.indexOf(item.id) < 0) ordered.push(item); });
  return ordered.slice(0, MAX_LISTS);
}

function sendLists(silent, focusID) {
  var pins = pinnedListIDs();
  var activeID = activeListIndex >= 0 && lists[activeListIndex] ? lists[activeListIndex].id : null;
  lists = orderedLists(sourceLists, pins);
  if (activeID) activeListIndex = lists.map(function(list) { return list.id; }).indexOf(activeID);
  var signature = JSON.stringify([lists, pins]);
  if (signature === listsSignature && !focusID) {
    if (silent) finishListsLoad();
    else send({LIST_DONE:ITEM_KIND_LIST,ITEM_COUNT:lists.length}, finishListsLoad);
    return;
  }
  var messages = [{STATUS:1}];
  lists.forEach(function(list, index) {
    messages.push({ITEM_KIND:ITEM_KIND_LIST,ITEM_INDEX:index,ITEM_ID:list.id,
      ITEM_PINNED:pins.indexOf(list.id) >= 0 ? 1 : 0,
      ITEM_TITLE:String(list.title || "Untitled").slice(0,90),
      ITEM_COUNT:Number(list.incompleteCount || 0),ITEM_DONE:Number(list.completedCount || 0)});
  });
  var complete = {LIST_DONE:ITEM_KIND_LIST,ITEM_COUNT:lists.length};
  if (focusID) complete.ITEM_ID = focusID;
  messages.push(complete);
  sendSequence(messages, function(error) {
    listsSignature = error ? null : signature;
    if (error) sendError(error);
    finishListsLoad();
  });
}

function toggleListPin(id) {
  if (listsLoading) { sendError(new Error("List updating; try pinning again")); return; }
  if (!lists.some(function(list) { return list.id === id; })) { sendError(new Error("Reload reminder lists")); return; }
  var pins = pinnedListIDs(), index = pins.indexOf(id);
  if (index < 0) pins.unshift(id);
  else pins.splice(index, 1);
  try { localStorage.setItem("reminderzPinnedLists", JSON.stringify(pins.slice(0, MAX_LISTS))); }
  catch (error) { sendError(new Error("Could not save pinned lists")); return; }
  if (activeListIndex >= 0) {
    listsSignature = null;
    send({STATUS:2, ITEM_ID:id, ITEM_PINNED:pins.indexOf(id) >= 0 ? 1 : 0});
    return;
  }
  listsLoading = true;
  sendLists(false, id);
}

function loadLists(silent) {
  if (listsLoading) { listsRefreshPending = true; return; }
  listsLoading = true;
  api("GET", "/v1/lists", null, function(error, result) {
    if (error) { if (!silent) sendError(error); finishListsLoad(); return; }
    sourceLists = Array.isArray(result.lists) ? result.lists : [];
    sendLists(silent);
  });
}

function finishRemindersLoad() {
  remindersLoading = false;
  if (remindersRefreshPending) {
    remindersRefreshPending = false;
    if (activeListIndex >= 0) loadReminders(activeListIndex);
  }
}

function loadReminders(listIndex, silent) {
  if (typeof listIndex !== "number" || !lists[listIndex]) { sendError(new Error("Reload reminder lists")); return; }
  activeListIndex = listIndex;
  if (remindersLoading) { remindersRefreshPending = true; return; }
  remindersLoading = true;
  var requestedListID = lists[listIndex].id;
  var requestedPage = reminderPage;
  api("GET", "/v1/lists/" + encodeURIComponent(requestedListID) + "/reminders", null,
    function(error, result) {
      if (error) { if (!silent) sendError(error); finishRemindersLoad(); return; }
      if (activeListIndex < 0 || !lists[activeListIndex] ||
          lists[activeListIndex].id !== requestedListID || requestedPage !== reminderPage) { finishRemindersLoad(); return; }
      var all = Array.isArray(result.reminders) ? result.reminders : [];
      var pageCount = Math.max(1, Math.ceil(all.length / MAX_REMINDERS));
      reminderPage = Math.min(reminderPage, pageCount - 1);
      reminders = all.slice(reminderPage * MAX_REMINDERS, (reminderPage + 1) * MAX_REMINDERS);
      var end = {LIST_DONE:ITEM_KIND_REMINDER,ITEM_COUNT:reminders.length,PAGE_INDEX:reminderPage,PAGE_COUNT:pageCount};
      var signature = requestedListID + ":" + reminderPage + ":" + pageCount + ":" + JSON.stringify(reminders);
      if (signature === remindersSignature) {
        if (silent) finishRemindersLoad();
        else send(end, finishRemindersLoad);
        return;
      }
      var messages = reminders.map(function(reminder, index) {
  return {ITEM_KIND:ITEM_KIND_REMINDER,ITEM_INDEX:index,
          ITEM_ID:reminder.id,
          ITEM_TITLE:String(reminder.title || "Untitled").slice(0,90),ITEM_DONE:reminder.completed ? 1 : 0};
      });
      messages.push(end);
      sendSequence(messages, function(error) {
        remindersSignature = error ? null : signature;
        finishRemindersLoad();
      });
    });
}

function refreshVisibleScreen() {
  if (mutationInFlight) return;
  if (listsLoading || remindersLoading) return;
  if (activeListIndex >= 0 && lists[activeListIndex]) loadReminders(activeListIndex, true);
  else loadLists(true);
}

function configureRefreshTimer(enabled) {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = null;
  if (enabled) refreshTimer = setInterval(refreshVisibleScreen, REFRESH_INTERVAL_MS);
}

function toggleReminder(index, id) {
  if (mutationInFlight) return;
  if (id) index = reminders.map(function(item) { return item.id; }).indexOf(id);
  if (typeof index !== "number" || !reminders[index]) { sendError(new Error("Reload this list")); return; }
  mutationInFlight = true;
  api("POST", "/v1/reminders/" + encodeURIComponent(reminders[index].id) + "/completed",
    {completed:!reminders[index].completed},
    function(error) {
      mutationInFlight = false;
      if (error) { sendError(error); return; }
      if (activeListIndex >= 0) loadReminders(activeListIndex);
    });
}

function deleteReminder(id, confirmed) {
  if (confirmed !== true || mutationInFlight) return;
  if (!id || !reminders.some(function(item) { return item.id === id; })) {
    sendError(new Error("Reminder changed; reload this list")); return;
  }
  mutationInFlight = true;
  api("POST", "/v1/reminders/" + encodeURIComponent(id) + "/delete", {confirmed:true}, function(error) {
    mutationInFlight = false;
    if (error) { sendError(error); return; }
    remindersSignature = null;
    if (activeListIndex >= 0) loadReminders(activeListIndex);
  });
}

function createReminder(listIndex, title) {
  title = typeof title === "string" ? title.trim() : "";
  if (mutationInFlight) return;
  if (!title || !lists[listIndex]) { sendError(new Error("Could not add that reminder")); return; }
  mutationInFlight = true;
  api("POST", "/v1/lists/" + encodeURIComponent(lists[listIndex].id) + "/reminders", {title:title},
    function(error) {
      mutationInFlight = false;
      if (error) { sendError(error); return; }
      if (activeListIndex === listIndex) loadReminders(listIndex);
    });
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, function(ch) {
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch];
  });
}

function configurationURL() {
  var config = savedConfig();
  var themes = isTime2() ? TIME2_THEMES : CLASSIC_THEMES;
  var fonts = isTime2() ? ["inter","roboto","open-sans","montserrat","poppins"] :
    ["gothic","gothic-bold","roboto-condensed","droid-serif","bitham-black"];
  var buttonsHTML = '<div class="card"><h2>Button actions</h2><p class="hint">Configure short and long presses separately. Keep Move up and Move down on each screen, and Open list on the lists screen. Single Back returns. Press Back twice quickly for its configured shortcut (No action by default). All customization is on this phone. Delete always asks for confirmation.</p>';
  ["lists", "reminders"].forEach(function(screen) {
    buttonsHTML += '<h3>' + (screen === "lists" ? 'Lists screen' : 'Reminders screen') + '</h3>';
    ["Up — short", "Up — long", "Select — short", "Select — long", "Down — short", "Down — long", "Double Back"].forEach(function(label, index) {
      buttonsHTML += '<label>' + label + '</label><select id="button_' + screen + '_' + index + '">';
      (screen === "lists" ? [0,1,2,3,4,5] : [0,1,2,4,5,6,7]).forEach(function(action) {
        buttonsHTML += '<option value="' + action + '"' + (config.buttons[screen][index] === action ? ' selected' : '') + '>' + BUTTON_LABELS[action] + '</option>';
      });
      buttonsHTML += '</select>';
    });
  });
  buttonsHTML += '<button type="button" class="secondary" onclick="resetButtons()">Reset button defaults</button><p id="buttonError" class="hint"></p></div>';
  var html = '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<style>body{font:16px -apple-system,sans-serif;background:#f2f2f7;color:#111;margin:0;padding:18px}' +
    'h1{font-size:28px;margin:6px 0}h2{font-size:19px;margin-top:26px}.card{background:white;border-radius:13px;padding:16px;margin:12px 0}' +
    'label{display:block;font-weight:600;margin:13px 0 6px}input,select,button{font:inherit;box-sizing:border-box;width:100%;padding:11px;border:1px solid #aaa;border-radius:8px}' +
    'button{background:#007aff;color:white;border:0;font-weight:700;margin-top:12px}.secondary{background:#e5e5ea;color:#111}' +
    '.hint{font-size:14px;color:#666;line-height:1.35}.toggle{display:flex;align-items:center;gap:10px}.toggle input{width:auto;margin:0}' +
    '.preview{border-radius:10px;padding:8px}.row{padding:12px 8px;border-radius:7px}.selected{font-weight:600}</style>' +
    '<h1>Reminderz</h1><p class="hint">Connect your Pebble to Apple Reminders through your private Tailscale network.</p>' +
    '<div class="card"><h2>Mac Connector</h2><p class="hint">In Reminderz Connector, choose <b>Connect Phone</b>, scan the QR code, then copy the pairing details on this iPhone and paste them here.</p>' +
    '<label>Pairing details</label><input id="bundle" placeholder="Paste from Connector"><button type="button" onclick="importBundle()">Import details</button>' +
    '<label>Private HTTPS address</label><input id="url" value="' + escapeHTML(config.gatewayURL) + '" placeholder="https://your-mac.your-tailnet.ts.net:10447">' +
    '<label>Access token</label><input id="token" type="password" value="' + escapeHTML(config.gatewayToken) + '">' +
    '<button type="button" class="secondary" onclick="testConnection()">Test connection</button><p id="status" class="hint"></p></div>' +
    '<div class="card"><h2>Sync</h2><label class="toggle"><input id="autoRefresh" type="checkbox"' +
    (config.autoRefresh ? ' checked' : '') + '> Auto-refresh every 15 seconds</label>' +
    '<p class="hint">Turn this off to minimize battery and network use. Opening screens and making changes still refresh immediately.</p></div>' +
    buttonsHTML + '<div class="card"><h2>Theme</h2><label>Preset</label><select id="preset" onchange="choosePreset()">' +
    themes.map(function(t,i){return '<option value="'+i+'">'+escapeHTML(t.name)+'</option>';}).join('') + '</select>' +
    '<label>Text color</label><input id="text" type="color" value="'+config.theme.text+'"><label>Background color</label><input id="background" type="color" value="'+config.theme.background+'">' +
    '<label>Selection color</label><input id="selection" type="color" value="'+config.theme.selection+'"><label>Font</label><select id="font">' +
    fonts.map(function(f){return '<option'+(f===config.theme.font?' selected':'')+'>'+f+'</option>';}).join('') + '</select>' +
    '<label>Font size</label><select id="size"></select><div id="preview" class="preview"><div class="row selected">☐ Groceries</div><div class="row">☑ Pick up prescriptions</div></div></div>' +
    '<button onclick="save()">Save &amp; apply</button><p class="hint">Reminder data stays on your Apple devices and private tailnet.</p>' +
    '<script>var themes='+JSON.stringify(themes).replace(/<\//g,'<\\/')+';var sizes='+JSON.stringify(THEME_SIZES)+';var defaultButtons='+JSON.stringify(DEFAULT_BUTTONS)+';' +
    'function resetButtons(){["lists","reminders"].forEach(function(s){defaultButtons[s].forEach(function(a,i){el("button_"+s+"_"+i).value=a})});el("buttonError").textContent=""}' +
    'function readButtons(){var b={};["lists","reminders"].forEach(function(s){b[s]=[0,1,2,3,4,5,6].map(function(i){return Number(el("button_"+s+"_"+i).value)})});if(b.lists.indexOf(1)<0||b.lists.indexOf(2)<0||b.lists.indexOf(3)<0||b.reminders.indexOf(1)<0||b.reminders.indexOf(2)<0){el("buttonError").textContent="Keep Move up and Move down on both screens, and Open list on the lists screen.";el("buttonError").scrollIntoView();return null}return b}' +
    'function el(id){return document.getElementById(id)}function importBundle(){try{var b=JSON.parse(el("bundle").value.trim());el("url").value=b.gatewayURL||"";el("token").value=b.gatewayToken||"";el("status").textContent="Imported. Test, then save."}catch(e){el("status").textContent="That does not look like Connector pairing details."}}' +
    'function setSizes(wanted){var a=sizes[el("font").value]||[24],s=el("size");s.innerHTML="";for(var i=0;i<a.length;i++){var o=document.createElement("option");o.value=a[i];o.textContent=a[i]+" px";if(a[i]===Number(wanted))o.selected=true;s.appendChild(o)}preview()}' +
    'function choosePreset(){var t=themes[Number(el("preset").value)];el("text").value=t.text;el("background").value=t.background;el("selection").value=t.selection;el("font").value=t.font;setSizes(t.size)}' +
    'function preview(){var p=el("preview");p.style.color=el("text").value;p.style.background=el("background").value;p.style.fontSize=el("size").value+"px";p.querySelector(".selected").style.background=el("selection").value}' +
    'function testConnection(){var x=new XMLHttpRequest(),u=el("url").value.replace(/\\\/$/,"");el("status").textContent="Testing…";x.open("GET",u+"/v1/health");x.setRequestHeader("Authorization","Bearer "+el("token").value);x.onload=function(){var r={};try{r=JSON.parse(x.responseText||"{}")}catch(e){}el("status").textContent=x.status===200&&r.apiVersion===1?"Connected through Tailscale.":x.status===200?"Update the watch app and Connector together.":"Connector rejected these details."};x.onerror=function(){el("status").textContent="Could not reach the Connector. Check Tailscale on Mac and iPhone."};x.send()}' +
    'function save(){var b=readButtons();if(!b)return;var t={name:"Custom",text:el("text").value,background:el("background").value,selection:el("selection").value,font:el("font").value,size:Number(el("size").value)};var c={gatewayURL:el("url").value.replace(/\\\/$/,""),gatewayToken:el("token").value.trim(),autoRefresh:el("autoRefresh").checked,theme:t,buttons:b,settingsThemes:window.organikSavedThemes()};location.href="pebblejs://close#"+encodeURIComponent(JSON.stringify(c))}' +
    '["text","background","selection","size"].forEach(function(id){el(id).onchange=preview});el("font").onchange=function(){setSizes()};setSizes('+config.theme.size+');preview();</script>';
  html = organikSettingsHTML(html, {"app":"reminderz","fields":{"text":"text","background":"background","selection":"selection","font":"font","size":"size"},"watchColors":["#000000","#001e41","#004387","#0068ca","#2b4a2c","#27514f","#16638d","#007dce","#5e9860","#5c9b72","#57a5a2","#4cb4db","#8ee391","#8ee69e","#8aebc0","#84f5f1","#4a161b","#482748","#40488a","#2f6bcc","#564e36","#545454","#4f6790","#4180d0","#759a64","#759d76","#71a6a4","#69b5dd","#9ee594","#9de7a0","#9becc2","#95f6f2","#99353f","#983e5a","#955694","#8f74d2","#9d5b4d","#9d6064","#9a7099","#9587d5","#afa072","#aea382","#ababab","#a7bae2","#c9e89d","#c9eaa7","#c7f0c8","#c3f9f7","#e35462","#e25874","#e16aa3","#de83dc","#e66e6b","#e6727c","#e37fa7","#e194df","#f1aa86","#f1ad93","#efb5b8","#ecc3eb","#ffeeab","#fff1b5","#fff6d3","#ffffff"],"library":true,"apply":true,"savedThemes":config.settingsThemes});
  return "data:text/html;charset=utf-8," + encodeURIComponent(html);
}

Pebble.addEventListener("ready", function() {
  var config = savedConfig();
  activeListIndex = -1;
  listsSignature = null;
  remindersSignature = null;
  send(configurationMessage(config), function() {
    loadLists();
    configureRefreshTimer(config.autoRefresh);
  });
});
Pebble.addEventListener("appmessage", function(event) {
  var payload = event.payload || {};
  var listIndex = payload.ITEM_ID ? lists.map(function(list) { return list.id; }).indexOf(payload.ITEM_ID) : payload.ITEM_INDEX;
  if (payload.COMMAND === COMMAND_LOAD_LISTS) { activeListIndex = -1; loadLists(); }
  else if (payload.COMMAND === COMMAND_LOAD_REMINDERS) {
    reminderPage = typeof payload.PAGE_INDEX === "number" && isFinite(payload.PAGE_INDEX) ? Math.max(0, Math.floor(payload.PAGE_INDEX)) : 0;
    remindersSignature = null;
    loadReminders(listIndex);
  }
  else if (payload.COMMAND === COMMAND_TOGGLE_REMINDER) toggleReminder(payload.ITEM_INDEX, payload.ITEM_ID);
  else if (payload.COMMAND === COMMAND_CREATE_REMINDER) createReminder(listIndex, payload.VOICE_TEXT);
  else if (payload.COMMAND === COMMAND_TOGGLE_PIN) toggleListPin(payload.ITEM_ID);
  else if (payload.COMMAND === COMMAND_DELETE_REMINDER) deleteReminder(payload.ITEM_ID, payload.CONFIRMED === 1);
});
Pebble.addEventListener("showConfiguration", function() { Pebble.openURL(configurationURL()); });
Pebble.addEventListener("webviewclosed", function(event) {
  if (!event.response) return;
  try {
    var config = JSON.parse(decodeURIComponent(event.response));
    config.theme = normalizeTheme(config.theme);
    config.gatewayURL = String(config.gatewayURL || "").replace(/\/+$/, "");
    config.gatewayToken = String(config.gatewayToken || "").trim();
    config.autoRefresh = config.autoRefresh !== false;
    config.buttons = normalizeButtons(config.buttons);
    localStorage.setItem("reminderzConfig", JSON.stringify(config));
    activeListIndex = -1;
    configureRefreshTimer(config.autoRefresh);
    send(configurationMessage(config), loadLists);
  } catch (error) { sendError(new Error("Could not save settings")); }
});

if (typeof module !== "undefined") module.exports = {
  normalizeTheme: normalizeTheme, pebbleColor: pebbleColor, contrast: contrast,
  themeMessage: themeMessage, configurationURL: configurationURL,
  classicThemes: CLASSIC_THEMES, time2Themes: TIME2_THEMES,
  refreshIntervalMs: REFRESH_INTERVAL_MS
  ,normalizeButtons: normalizeButtons, configurationMessage: configurationMessage
};
