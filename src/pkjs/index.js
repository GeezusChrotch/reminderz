/* global Pebble, localStorage, XMLHttpRequest */
var COMMAND_LOAD_LISTS = 1;
var COMMAND_LOAD_REMINDERS = 2;
var COMMAND_TOGGLE_REMINDER = 3;
var COMMAND_CREATE_REMINDER = 4;
var ITEM_KIND_LIST = 1;
var ITEM_KIND_REMINDER = 2;
var MAX_LISTS = 30;
var MAX_REMINDERS = 50;
var REFRESH_INTERVAL_MS = 15000;
var lists = [];
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
  var fallback = {gatewayURL:"", gatewayToken:"", autoRefresh:true, theme:normalizeTheme(null)};
  try {
    var parsed = JSON.parse(localStorage.getItem("reminderzConfig") || "null");
    if (!parsed) return fallback;
    return {
      gatewayURL: typeof parsed.gatewayURL === "string" ? parsed.gatewayURL.replace(/\/+$/, "") : "",
      gatewayToken: typeof parsed.gatewayToken === "string" ? parsed.gatewayToken.trim() : "",
      autoRefresh: parsed.autoRefresh !== false,
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

function loadLists(silent) {
  if (listsLoading) { listsRefreshPending = true; return; }
  listsLoading = true;
  api("GET", "/v1/lists", null, function(error, result) {
    if (error) { if (!silent) sendError(error); finishListsLoad(); return; }
    lists = Array.isArray(result.lists) ? result.lists.slice(0, MAX_LISTS) : [];
    var signature = JSON.stringify(lists);
    if (signature === listsSignature) {
      if (silent) finishListsLoad();
      else send({LIST_DONE:ITEM_KIND_LIST,ITEM_COUNT:lists.length}, finishListsLoad);
      return;
    }
    var messages = lists.map(function(list, index) {
      return {ITEM_KIND:ITEM_KIND_LIST,ITEM_INDEX:index,ITEM_TITLE:String(list.title || "Untitled").slice(0,90),
        ITEM_COUNT:Number(list.incompleteCount || 0),ITEM_DONE:Number(list.completedCount || 0)};
    });
    messages.push({LIST_DONE:ITEM_KIND_LIST,ITEM_COUNT:lists.length});
    sendSequence(messages, function(error) {
      listsSignature = error ? null : signature;
      finishListsLoad();
    });
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
  api("GET", "/v1/lists/" + encodeURIComponent(requestedListID) + "/reminders", null,
    function(error, result) {
      if (error) { if (!silent) sendError(error); finishRemindersLoad(); return; }
      if (activeListIndex < 0 || !lists[activeListIndex] ||
          lists[activeListIndex].id !== requestedListID) { finishRemindersLoad(); return; }
      reminders = Array.isArray(result.reminders) ? result.reminders.slice(0, MAX_REMINDERS) : [];
      var signature = requestedListID + ":" + JSON.stringify(reminders);
      if (signature === remindersSignature) {
        if (silent) finishRemindersLoad();
        else send({LIST_DONE:ITEM_KIND_REMINDER,ITEM_COUNT:reminders.length}, finishRemindersLoad);
        return;
      }
      var messages = reminders.map(function(reminder, index) {
        return {ITEM_KIND:ITEM_KIND_REMINDER,ITEM_INDEX:index,
          ITEM_TITLE:String(reminder.title || "Untitled").slice(0,90),ITEM_DONE:reminder.completed ? 1 : 0};
      });
      messages.push({LIST_DONE:ITEM_KIND_REMINDER,ITEM_COUNT:reminders.length});
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

function toggleReminder(index) {
  if (mutationInFlight) return;
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
    '<div class="card"><h2>Theme</h2><label>Preset</label><select id="preset" onchange="choosePreset()">' +
    themes.map(function(t,i){return '<option value="'+i+'">'+escapeHTML(t.name)+'</option>';}).join('') + '</select>' +
    '<label>Text color</label><input id="text" type="color" value="'+config.theme.text+'"><label>Background color</label><input id="background" type="color" value="'+config.theme.background+'">' +
    '<label>Selection color</label><input id="selection" type="color" value="'+config.theme.selection+'"><label>Font</label><select id="font">' +
    fonts.map(function(f){return '<option'+(f===config.theme.font?' selected':'')+'>'+f+'</option>';}).join('') + '</select>' +
    '<label>Font size</label><select id="size"></select><div id="preview" class="preview"><div class="row selected">☐ Groceries</div><div class="row">☑ Pick up prescriptions</div></div></div>' +
    '<button onclick="save()">Save &amp; apply</button><p class="hint">Reminder data stays on your Apple devices and private tailnet.</p>' +
    '<script>var themes='+JSON.stringify(themes).replace(/<\//g,'<\\/')+';var sizes='+JSON.stringify(THEME_SIZES)+';' +
    'function el(id){return document.getElementById(id)}function importBundle(){try{var b=JSON.parse(el("bundle").value.trim());el("url").value=b.gatewayURL||"";el("token").value=b.gatewayToken||"";el("status").textContent="Imported. Test, then save."}catch(e){el("status").textContent="That does not look like Connector pairing details."}}' +
    'function setSizes(wanted){var a=sizes[el("font").value]||[24],s=el("size");s.innerHTML="";for(var i=0;i<a.length;i++){var o=document.createElement("option");o.value=a[i];o.textContent=a[i]+" px";if(a[i]===Number(wanted))o.selected=true;s.appendChild(o)}preview()}' +
    'function choosePreset(){var t=themes[Number(el("preset").value)];el("text").value=t.text;el("background").value=t.background;el("selection").value=t.selection;el("font").value=t.font;setSizes(t.size)}' +
    'function preview(){var p=el("preview");p.style.color=el("text").value;p.style.background=el("background").value;p.style.fontSize=el("size").value+"px";p.querySelector(".selected").style.background=el("selection").value}' +
    'function testConnection(){var x=new XMLHttpRequest(),u=el("url").value.replace(/\\\/$/,"");el("status").textContent="Testing…";x.open("GET",u+"/v1/health");x.setRequestHeader("Authorization","Bearer "+el("token").value);x.onload=function(){var r={};try{r=JSON.parse(x.responseText||"{}")}catch(e){}el("status").textContent=x.status===200&&r.apiVersion===1?"Connected through Tailscale.":x.status===200?"Update the watch app and Connector together.":"Connector rejected these details."};x.onerror=function(){el("status").textContent="Could not reach the Connector. Check Tailscale on Mac and iPhone."};x.send()}' +
    'function save(){var t={name:"Custom",text:el("text").value,background:el("background").value,selection:el("selection").value,font:el("font").value,size:Number(el("size").value)};var c={gatewayURL:el("url").value.replace(/\\\/$/,""),gatewayToken:el("token").value.trim(),autoRefresh:el("autoRefresh").checked,theme:t};location.href="pebblejs://close#"+encodeURIComponent(JSON.stringify(c))}' +
    '["text","background","selection","size"].forEach(function(id){el(id).onchange=preview});el("font").onchange=function(){setSizes()};setSizes('+config.theme.size+');preview();</script>';
  return "data:text/html;charset=utf-8," + encodeURIComponent(html);
}

Pebble.addEventListener("ready", function() {
  var config = savedConfig();
  activeListIndex = -1;
  listsSignature = null;
  remindersSignature = null;
  send(themeMessage(config.theme), function() {
    loadLists();
    configureRefreshTimer(config.autoRefresh);
  });
});
Pebble.addEventListener("appmessage", function(event) {
  var payload = event.payload || {};
  if (payload.COMMAND === COMMAND_LOAD_LISTS) { activeListIndex = -1; loadLists(); }
  else if (payload.COMMAND === COMMAND_LOAD_REMINDERS) {
    remindersSignature = null;
    loadReminders(payload.ITEM_INDEX);
  }
  else if (payload.COMMAND === COMMAND_TOGGLE_REMINDER) toggleReminder(payload.ITEM_INDEX);
  else if (payload.COMMAND === COMMAND_CREATE_REMINDER) createReminder(payload.ITEM_INDEX, payload.VOICE_TEXT);
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
    localStorage.setItem("reminderzConfig", JSON.stringify(config));
    activeListIndex = -1;
    configureRefreshTimer(config.autoRefresh);
    send(themeMessage(config.theme), loadLists);
  } catch (error) { sendError(new Error("Could not save settings")); }
});

if (typeof module !== "undefined") module.exports = {
  normalizeTheme: normalizeTheme, pebbleColor: pebbleColor, contrast: contrast,
  themeMessage: themeMessage, configurationURL: configurationURL,
  classicThemes: CLASSIC_THEMES, time2Themes: TIME2_THEMES,
  refreshIntervalMs: REFRESH_INTERVAL_MS
};
