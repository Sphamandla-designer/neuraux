#!/usr/bin/env node
// Build check for src/template.html. Exits 1 on any failure.
// - every COPY id has non-empty en, zu and af (F01: no silent English fallback)
// - every quick-reply label is 20 characters or fewer in every language (F20)
// - no beat or outcome shows more than 3 quick replies, in any language (F20)
// - every beat and outcome renders in every language with no missing string
// Also writes docs/copy-deck.csv (UTF-8 with BOM).
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const tpl = fs.readFileSync(path.join(ROOT, 'src', 'template.html'), 'utf8');
const m = tpl.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/);
if (!m) { console.error('logic script not found'); process.exit(1); }
const src = m[1];

const errors = [];
const consoleErrors = [];
global.window = { localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} }, addEventListener() {}, removeEventListener() {} };
global.location = { hash: '' };
const origErr = console.error;
console.error = (...a) => consoleErrors.push(a.join(' '));
class DCLogic { constructor(p) { this.props = p || {}; this.state = {}; } setState(u, cb) { const p = typeof u === 'function' ? u(this.state) : u; this.state = Object.assign({}, this.state, p); if (cb) cb(); } forceUpdate() {} }
const exported = new Function('DCLogic', src + '\n;return { Component, COPY, LANGS };')(DCLogic);
const { Component, COPY, LANGS } = exported;

const BUTTON_LIMIT = 20;
for (const [id, row] of Object.entries(COPY)) {
  for (const L of LANGS) {
    if (typeof row[L] !== 'string' || !row[L].trim()) errors.push(`missing ${L} for ${id}`);
  }
  if (row.e === 'button') {
    for (const L of LANGS) if ((row[L] || '').length > BUTTON_LIMIT) errors.push(`button ${id} ${L} is ${row[L].length} chars (max ${BUTTON_LIMIT}): "${row[L]}"`);
  }
}

const usedButtonIds = new Set();
for (const L of LANGS) {
  const c = new Component({});
  c.state.lang = L;
  const beats = c.beatDefs();
  const check = (kind, id, def) => {
    const q = def.quick();
    if (q.length > 3) errors.push(`${kind} ${id} shows ${q.length} quick replies (max 3)`);
    for (const r of q) {
      usedButtonIds.add(r.id);
      const label = r.act === 'lang' ? c.t(r.id, null, r.arg) : c.t(r.id);
      if (label.length > BUTTON_LIMIT) errors.push(`${kind} ${id} ${L}: label "${label}" is ${label.length} chars`);
    }
    def.msgs();
  };
  for (const [id, def] of Object.entries(beats)) check('beat', id, def);
  for (const [id, def] of Object.entries(c.outcomeDefs())) check('outcome', id, def);
  c.supportCard();
  c.renderVals();
  for (const id of Object.keys(COPY).filter(k => /^step_/.test(k))) c.t(id);
}
// Buttons created outside beat definitions (skip, repair, lang).
['btn_continue', 'btn_support'].forEach(id => usedButtonIds.add(id));
for (const [id, row] of Object.entries(COPY)) if (row.e === 'button' && /^btn_/.test(id) && !usedButtonIds.has(id)) errors.push(`button ${id} is never used`);
consoleErrors.forEach(e => errors.push('runtime: ' + e));
console.error = origErr;

// Copy deck
const limits = { button: 20, 'button-sub': 72, 'status-title': 60, 'card-title': 60, 'field-label': 30, step: 200 };
const esc = v => { const x = String(v == null ? '' : v); return /[",\n\r]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };
const len = s => Array.from(s).length;
const head = ['id', 'beat', 'element', 'en', 'zu', 'af', 'en_chars', 'zu_chars', 'af_chars', 'limit', 'needs_native_review'];
const rows = Object.entries(COPY).map(([id, r]) => {
  const same = r.zu === r.en && r.af === r.en; // names shown in their own language
  return [id, r.b, r.e, r.en, r.zu, r.af, len(r.en), len(r.zu), len(r.af), limits[r.e] || 1024, same ? 'no' : 'yes'];
});
for (const r of rows) {
  const lim = r[9];
  ['en', 'zu', 'af'].forEach((L, i) => { if (r[6 + i] > lim) errors.push(`${r[0]} ${L} is ${r[6 + i]} chars (limit ${lim})`); });
}
fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs', 'copy-deck.csv'), '﻿' + [head].concat(rows).map(r => r.map(esc).join(',')).join('\r\n') + '\r\n', 'utf8');

if (errors.length) { console.error('BUILD CHECK FAILED\n- ' + errors.join('\n- ')); process.exit(1); }
const review = rows.filter(r => r[10] === 'yes').length;
console.log(`build check ok: ${rows.length} string ids x 3 languages; ${review} zu and ${review} af strings need native review; docs/copy-deck.csv written`);
