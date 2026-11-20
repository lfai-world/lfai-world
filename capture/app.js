/* LFAI Capture — 공유 1탭 → world-01-inbox 커밋 (토큰은 IndexedDB에만) */
'use strict';

const DB_NAME = 'lfai-capture';
const DB_VER = 1;
const SHELL_SHARE = 'lfai-share-v1';

const FALLBACK_CONFIG = {
  lanes: [
    { value: 'atoms', label: '⚛️ Atoms', desc: '지식원자로 컴파일' },
    { value: 'book', label: '📖 Book', desc: '공개 웹북 후보' },
    { value: 'both', label: '⚡ Both', desc: '둘 다' },
    { value: 'archive', label: '📦 Archive', desc: '원본만 보관' }
  ],
  event_types: ['conversation', 'decision', 'idea', 'issue', 'review', 'capture', 'voice'],
  intents: ['record', 'plan', 'generate', 'learn', 'audit']
};

const state = {
  settings: { owner: 'lfai-world', prefix: 'world', token: '' },
  config: FALLBACK_CONFIG,
  lane: 'atoms',
  view: 'capture'
};

/* ---------- IndexedDB ---------- */
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings');
      if (!db.objectStoreNames.contains('queue')) db.createObjectStore('queue', { keyPath: 'key', autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbGet(store, key) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const r = db.transaction(store).objectStore(store).get(key);
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
async function idbPut(store, val, key) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const os = db.transaction(store, 'readwrite').objectStore(store);
    const r = key === undefined ? os.put(val) : os.put(val, key);
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
async function idbAll(store) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const r = db.transaction(store).objectStore(store).getAll();
    r.onsuccess = () => res(r.result || []); r.onerror = () => rej(r.error);
  });
}
async function idbDel(store, key) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const r = db.transaction(store, 'readwrite').objectStore(store).delete(key);
    r.onsuccess = () => res(); r.onerror = () => rej(r.error);
  });
}
async function idbClear(store) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const r = db.transaction(store, 'readwrite').objectStore(store).clear();
    r.onsuccess = () => res(); r.onerror = () => rej(r.error);
  });
}

/* ---------- helpers ---------- */
const $ = (s) => document.querySelector(s);
const pad2 = (n) => String(n).padStart(2, '0');
function utcStamp(d = new Date()) {
  return `evt-${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}-${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}`;
}
function b64utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  const CH = 0x8000;
  for (let i = 0; i < bytes.length; i += CH) bin += String.fromCharCode(...bytes.subarray(i, i + CH));
  return btoa(bin);
}
function repoName() { return `${state.settings.owner}/${state.settings.prefix}-01-inbox`; }
function firstLine(text) {
  const line = (text || '').split('\n').map(s => s.trim()).find(Boolean) || '';
  return line.replace(/^#+\s*/, '').slice(0, 80);
}
function toast(msg, ms = 2600) {
  const el = $('#toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, ms);
}
function setBanner(msg, kind = 'info') {
  const el = $('#banner');
  if (!msg) { el.hidden = true; return; }
  el.textContent = msg; el.hidden = false;
  el.dataset.kind = kind;
}
function isNetworkError(e) { return e && (e.name === 'TypeError' || /Failed to fetch|NetworkError/i.test(e.message || '')); }

/* ---------- GitHub API ---------- */
async function gh(path, opts = {}) {
  const token = state.settings.token;
  if (!token) throw new Error('NO_TOKEN');
  const res = await fetch('https://api.github.com' + path, {
    ...opts,
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    }
  });
  let data = null;
  try { data = await res.json(); } catch (_) {}
  if (!res.ok) {
    const err = new Error(`${res.status} ${(data && data.message) || res.statusText}`);
    err.status = res.status; err.data = data;
    throw err;
  }
  return data;
}
async function putFile(item, attempt = 0) {
  const path = attempt === 0 ? item.path : item.path.replace(/\.md$/, `-${attempt + 1}.md`);
  return gh(`/repos/${item.repo}/contents/${encodeURI(path)}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: item.message || `capture: ${item.path}`,
      content: b64utf8(item.content),
      branch: 'main'
    })
  });
}

/* ---------- capture ---------- */
function buildEvent(text) {
  const now = new Date();
  const share = state.share || {};
  return {
    id: utcStamp(now),
    timestamp: now.toISOString(),
    event_type: $('#event_type').value || 'conversation',
    target_lane: state.lane,
    target_repo: `${state.settings.prefix}-01-inbox`,
    source: 'mobile',
    intent: $('#intent').value || 'record',
    artifact: state.lane === 'archive' ? 'raw_only' : (state.lane === 'book' ? 'knowledge_atom' : 'both'),
    context: { repo: `${state.settings.prefix}-01-inbox`, lane_note: state.lane },
    content: { text: text || '', url: share.url || '' },
    routing_meta: { auto_compile: state.lane !== 'archive', priority: 'normal' },
    capture: { via: 'pwa-share-target', title: share.title || '', ua: navigator.userAgent.slice(0, 160) }
  };
}
function buildMarkdown(evt, title, text) {
  const fm = JSON.stringify(evt, null, 2);
  const head = title ? `# ${title}\n\n` : '';
  return `---\n${fm}\n---\n\n${head}${text || ''}\n`;
}
function capturePath(evt) {
  const d = new Date(evt.timestamp);
  return `logs/${d.getUTCFullYear()}/${pad2(d.getUTCMonth() + 1)}/${evt.id}.md`;
}
async function doSave() {
  const text = $('#text').value.trim();
  const title = $('#title').value.trim() || firstLine(text);
  if (!state.settings.token) { switchView('settings'); setBanner('먼저 설정에서 PAT을 넣어 주세요.', 'bad'); return; }
  if (!text) { toast('본문이 비어 있습니다.'); return; }

  const evt = buildEvent(text);
  const content = buildMarkdown(evt, title, text);
  if (content.length > 900000) { toast('본문이 너무 큽니다(900KB 제한).'); return; }
  const item = { key: Date.now(), repo: repoName(), path: capturePath(evt), content, message: `capture: ${evt.id} [${state.lane}]`, addedAt: new Date().toISOString() };
  const btn = $('#save'); btn.disabled = true; btn.textContent = '저장 중…';
  try {
    let res = null;
    for (let i = 0; i < 5; i++) {
      try { res = await putFile(item, i); break; }
      catch (e) { if (e.status === 422 || e.status === 409) continue; throw e; }
    }
    if (!res) throw new Error('같은 이름의 파일이 이미 있습니다.');
    setBanner('');
    $('#text').value = ''; $('#title').value = '';
    toast('저장 완료 — ' + (res.content ? res.content.path : item.path));
    await renderQueue();
  } catch (e) {
    if (isNetworkError(e) || !navigator.onLine) {
      await idbPut('queue', item);
      await renderQueue();
      toast('오프라인 — 큐에 넣었습니다. 온라인이 되면 자동 전송.');
      $('#text').value = ''; $('#title').value = '';
    } else if (e.message === 'NO_TOKEN') {
      switchView('settings'); setBanner('PAT이 없습니다.', 'bad');
    } else if (e.status === 401) {
      setBanner('401 인증 실패 — 토큰을 다시 확인해 주세요.', 'bad');
    } else if (e.status === 403) {
      setBanner('403 권한 부족 — PAT에 Contents: Read and write 권한이 있는지 확인.', 'bad');
    } else if (e.status === 404) {
      setBanner(`404 — ${repoName()} 레포가 없거나 토큰 접근 범위 밖입니다.`, 'bad');
    } else {
      setBanner('저장 실패: ' + e.message, 'bad');
    }
  } finally {
    btn.disabled = false; btn.textContent = '저장 — 1탭 인입';
  }
}

/* ---------- queue ---------- */
async function flushQueue(silent = false) {
  const items = await idbAll('queue');
  if (!items.length) { if (!silent) toast('큐가 비어 있습니다.'); return; }
  let ok = 0, fail = 0;
  for (const item of items) {
    try {
      let res = null;
      for (let i = 0; i < 5; i++) {
        try { res = await putFile(item, i); break; }
        catch (e) { if (e.status === 422 || e.status === 409) continue; throw e; }
      }
      if (!res) throw new Error('이름 충돌');
      await idbDel('queue', item.key); ok++;
    } catch (e) { fail++; item.error = e.message; await idbPut('queue', item); }
  }
  await renderQueue();
  if (!silent || fail) toast(`큐 전송: 성공 ${ok} · 실패 ${fail}`);
}
async function renderQueue() {
  const items = await idbAll('queue');
  $('#queueCount').textContent = items.length;
  $('#navCount').textContent = items.length;
  const wrap = $('#queueList');
  wrap.textContent = '';
  if (!items.length) { wrap.innerHTML = '<p class="hint">큐가 비어 있습니다.</p>'; return; }
  for (const it of items) {
    const el = document.createElement('div');
    el.className = 'item';
    const t = document.createElement('div');
    t.textContent = it.path;
    const c = document.createElement('code');
    c.textContent = `+${(it.content || '').length}c · ${it.addedAt || ''}`;
    const err = document.createElement('div');
    err.className = 'err'; err.textContent = it.error ? '오류: ' + it.error : '';
    const del = document.createElement('button');
    del.className = 'danger'; del.textContent = '삭제';
    del.onclick = async () => { await idbDel('queue', it.key); renderQueue(); };
    el.append(t, c, err, del);
    wrap.append(el);
  }
}

/* ---------- share pull ---------- */
async function pullShare() {
  const params = new URLSearchParams(location.search);
  const wants = params.get('shared') === '1' || params.get('share') === '1';
  if (!wants) return;
  try {
    const reg = navigator.serviceWorker ? await navigator.serviceWorker.ready : null;
    const scope = reg ? reg.scope : new URL('./', location.href).href;
    const cache = await caches.open(SHELL_SHARE);
    const key = new URL('share-last', scope).href;
    const res = await cache.match(key);
    if (!res) { setBanner('공유 내용을 찾지 못했습니다. 홈 화면에 추가한 뒤 다시 공유해 주세요.', 'bad'); return; }
    const data = await res.json();
    await cache.delete(key);
    state.share = data;
    if (data.title) $('#title').value = data.title;
    const joined = [data.text, data.url].filter(Boolean).join('\n\n');
    if (joined) $('#text').value = joined;
    setBanner('공유 도착 — 확인하고 저장을 누르세요.', 'info');
    history.replaceState(null, '', location.pathname + '?source=share');
    $('#save').focus();
  } catch (e) {
    setBanner('공유 읽기 실패: ' + e.message, 'bad');
  }
}

/* ---------- settings ---------- */
async function loadSettings() {
  const s = await idbGet('settings', 'cfg');
  if (s) state.settings = { ...state.settings, ...s };
  $('#owner').value = state.settings.owner;
  $('#prefix').value = state.settings.prefix;
  $('#token').value = state.settings.token || '';
  updateRepoPreview();
}
function updateRepoPreview() {
  const owner = $('#owner').value.trim() || 'lfai-world';
  const prefix = $('#prefix').value.trim() || 'world';
  $('#repoPreview').textContent = `${owner}/${prefix}-01-inbox`;
  $('#repoPreview2').textContent = `${owner}/${prefix}-01-inbox`;
}
async function saveSettings() {
  state.settings.owner = $('#owner').value.trim() || 'lfai-world';
  state.settings.prefix = $('#prefix').value.trim() || 'world';
  state.settings.token = $('#token').value.trim();
  await idbPut('settings', state.settings, 'cfg');
  updateRepoPreview();
  $('#settingsMsg').className = 'msg ok'; $('#settingsMsg').textContent = '저장했습니다.';
  toast('설정 저장됨');
}
async function testConn() {
  const msg = $('#settingsMsg');
  msg.className = 'msg'; msg.textContent = '확인 중…';
  const prev = state.settings.token;
  state.settings.token = $('#token').value.trim() || prev;
  try {
    const user = await gh('/user');
    const repo = await gh(`/repos/${repoName()}`);
    const canWrite = repo.permissions && repo.permissions.push;
    msg.className = 'msg ' + (canWrite ? 'ok' : 'bad');
    msg.textContent = `${user.login} · ${repo.full_name} · push=${canWrite ? '가능' : '불가'}${repo.private ? ' (private)' : ''}`;
  } catch (e) {
    msg.className = 'msg bad'; msg.textContent = '실패: ' + e.message;
  }
}

/* ---------- views ---------- */
function switchView(name) {
  state.view = name;
  for (const s of ['capture', 'settings', 'queue']) $('#view-' + s).hidden = (s !== name);
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  if (name === 'queue') renderQueue();
  window.scrollTo(0, 0);
}

/* ---------- init ---------- */
async function loadConfig() {
  try {
    const r = await fetch('./config/capture-ui-config.json', { cache: 'no-cache' });
    if (r.ok) state.config = await r.json();
  } catch (_) {}
  const lanes = state.config.lanes || FALLBACK_CONFIG.lanes;
  const wrap = $('#lanes'); wrap.textContent = '';
  for (const lane of lanes) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(lane.value === state.lane));
    b.innerHTML = '';
    const strong = document.createElement('b'); strong.textContent = lane.label;
    const small = document.createElement('small'); small.textContent = lane.desc || '';
    b.append(strong, small);
    b.onclick = () => {
      state.lane = lane.value;
      wrap.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-checked', 'false'));
      b.setAttribute('aria-checked', 'true');
    };
    wrap.append(b);
  }
  const et = $('#event_type'); et.textContent = '';
  for (const v of (state.config.event_types || FALLBACK_CONFIG.event_types)) {
    const o = document.createElement('option'); o.value = v; o.textContent = v; et.append(o);
  }
  et.value = 'conversation';
  const it = $('#intent'); it.textContent = '';
  for (const v of (state.config.intents || FALLBACK_CONFIG.intents)) {
    const o = document.createElement('option'); o.value = v; o.textContent = v; it.append(o);
  }
  it.value = 'record';
}
function wire() {
  $('#save').onclick = doSave;
  $('#saveSettings').onclick = saveSettings;
  $('#testConn').onclick = testConn;
  $('#clearToken').onclick = async () => {
    $('#token').value = ''; state.settings.token = '';
    await idbPut('settings', state.settings, 'cfg');
    $('#settingsMsg').className = 'msg ok'; $('#settingsMsg').textContent = '토큰을 삭제했습니다.';
  };
  $('#flush').onclick = () => flushQueue(false);
  $('#clearQueue').onclick = async () => { if (confirm('큐를 모두 비울까요?')) { await idbClear('queue'); renderQueue(); } };
  document.querySelectorAll('nav button').forEach(b => b.onclick = () => switchView(b.dataset.view));
  ['#owner', '#prefix'].forEach(sel => $(sel).addEventListener('input', updateRepoPreview));
  window.addEventListener('online', () => { setNet(); flushQueue(true); });
  window.addEventListener('offline', setNet);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) flushQueue(true); });
}
function setNet() {
  const on = navigator.onLine;
  const el = $('#net'); el.textContent = on ? '●' : '○'; el.classList.toggle('off', !on);
}

async function main() {
  setNet();
  await loadSettings();
  await loadConfig();
  wire();
  await renderQueue();
  await pullShare();
  if (location.search.includes('shortcut=queue')) switchView('queue');
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
  }
  flushQueue(true);
}
main();
