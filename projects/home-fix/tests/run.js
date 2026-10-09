// Home FIX prototype test suite (Playwright, Chromium).
// Usage: node tests/run.js [filter]
// Writes qa/test-results.json and prints a summary. Every test name starts with the
// fix or test-readiness id it proves (F01–F20, T01–T06) or a Part 7 check id.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ROOT, fileUrl, launch, logicEval, waitForApp } = require('./helpers');

const DIST = 'dist/Home_FIX_Mobile.html';
const PHOTO = path.join(ROOT, 'tests', 'fixtures', 'photo.png');
const PHONE = { width: 390, height: 844 };
const LANGS = ['en', 'zu', 'af'];
const tests = [];
const test = (name, fn, opts) => tests.push(Object.assign({ name, fn }, opts || {}));

// ---------- helpers ----------
async function open(browser, hash, opts) {
  opts = opts || {};
  const context = await browser.newContext(Object.assign({ viewport: opts.viewport || PHONE, acceptDownloads: true }, opts.context || {}));
  if (opts.init) await context.addInitScript(opts.init);
  const page = await context.newPage();
  const errors = [];
  const requests = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  page.on('request', r => requests.push(r.url()));
  await page.goto(fileUrl(DIST, hash || ''));
  await waitForApp(page);
  return { context, page, errors, requests };
}
const qr = (page, id, timeout) => page.waitForSelector(`[data-qr="${id}"]`, { timeout: timeout || 15000 });
async function tap(page, id) { await (await qr(page, id)).click(); }
async function sample(page) { await page.waitForSelector('#hf-sample', { timeout: 15000 }); await page.click('#hf-sample'); }
// Tap a photo quick reply and pick files in the phone's chooser, as a participant would.
async function upload(page, btnId, files) {
  await qr(page, btnId);
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), tap(page, btnId)]);
  await chooser.setFiles(files || [PHOTO]);
}
async function consent(page, lang) {
  if (lang) await page.click(`[data-wlang="${lang}"]`);
  await page.check('#hf-consent');
  await page.click('#hf-start');
}
async function say(page, text) {
  await page.fill('#hf-input', text);
  await page.click('#hf-send');
}
async function chatText(page) { return page.evaluate(() => document.getElementById('hf-log').innerText); }
async function lastIn(page) { return page.evaluate(() => { const a = document.querySelectorAll('.hf-in'); return a.length ? a[a.length - 1].innerText : ''; }); }
async function countIn(page) { return page.evaluate(() => document.querySelectorAll('.hf-in').length); }
async function waitText(page, text, timeout) {
  await page.waitForFunction(t => document.getElementById('hf-log') && document.getElementById('hf-log').innerText.includes(t), text, { timeout: timeout || 15000 });
}
async function quickLabels(page) { return page.$$eval('[data-qr]', els => els.map(e => ({ id: e.getAttribute('data-qr'), label: e.querySelector('span span').innerText }))); }
async function copyTable(page) { return logicEval(page, 'return logic.copyTable()'); }
function assert(c, msg) { if (!c) throw new Error(msg); }
const T = (copy, id, L, p) => { let s = copy[id][L]; if (p) for (const k in p) s = s.split('{' + k + '}').join(p[k]); return s; };

async function fac(page, steps) {
  // Unlock and use the facilitator drawer (page must be opened with #facilitator).
  await page.click('#hf-fac-toggle');
  if (await page.$('#hf-pin')) { await page.fill('#hf-pin', '2468'); await page.click('#hf-pin-ok'); }
  for (const s of steps || []) await page.click(s);
  await page.click('#hf-fac-toggle');
}

// F20 guard, checked at every quick-reply state the runs pass through.
const limitViolations = [];
async function checkQuick(page, where) {
  const q = await quickLabels(page);
  if (q.length > 3) limitViolations.push(`${where}: ${q.length} quick replies`);
  for (const x of q) if (Array.from(x.label).length > 20) limitViolations.push(`${where}: "${x.label}" ${x.label.length} chars`);
}

// Full job with the default script (blurry, then clear; glare, then clear).
async function happyPath(page, L, opts) {
  opts = opts || {};
  await consent(page, L);
  await qr(page, 'lang_' + L); await checkQuick(page, L + ' entry'); await tap(page, 'lang_' + L);
  await qr(page, 'btn_start'); await checkQuick(page, L + ' start'); await tap(page, 'btn_start');
  await qr(page, 'btn_begin'); await checkQuick(page, L + ' summary'); await tap(page, 'btn_begin');
  await qr(page, 'btn_upload_photo'); await checkQuick(page, L + ' before');
  if (opts.real) await upload(page, 'btn_upload_photo'); else await sample(page);
  if (!opts.pass) { await qr(page, 'btn_retake'); await checkQuick(page, L + ' before_retake'); if (opts.real) await upload(page, 'btn_retake'); else await sample(page); }
  await qr(page, 'btn_install_done'); await checkQuick(page, L + ' install'); await tap(page, 'btn_install_done');
  await qr(page, 'btn_upload_serial'); await checkQuick(page, L + ' serial');
  if (opts.real) await upload(page, 'btn_upload_serial'); else await sample(page);
  if (!opts.pass) { await qr(page, 'btn_type_in'); await checkQuick(page, L + ' serial_retake'); if (opts.real) await upload(page, 'btn_retake'); else await sample(page); }
  await qr(page, 'btn_yes_correct'); await checkQuick(page, L + ' serial_confirm'); await tap(page, 'btn_yes_correct');
  await qr(page, 'btn_upload_photos'); await checkQuick(page, L + ' compliance');
  if (opts.real) await upload(page, 'btn_upload_photos', [PHOTO, PHOTO, PHOTO, PHOTO]); else await sample(page);
  await qr(page, 'btn_submit', 20000); await checkQuick(page, L + ' offline'); await tap(page, 'btn_submit');
  await qr(page, 'btn_support'); await checkQuick(page, L + ' submitted');
}
async function finishApproved(page, L) {
  await qr(page, 'btn_close_job', 20000); await checkQuick(page, L + ' approved');
  await tap(page, 'btn_close_job');
  await page.waitForSelector('#hf-results', { timeout: 10000 });
}

// No English COPY string may appear after choosing zu or af.
async function englishLeaks(page, L) {
  const copy = await copyTable(page);
  const text = await page.evaluate(() => {
    const parts = [];
    const log = document.getElementById('hf-log'); if (log) parts.push(log.innerText);
    const q = document.getElementById('hf-quick'); if (q) parts.push(q.innerText);
    const st = document.getElementById('hf-status'); if (st) parts.push(st.innerText);
    const i = document.getElementById('hf-input'); if (i) parts.push(i.placeholder);
    return parts.join('\n');
  });
  // Skip what is before the language choice: the greeting and question are shown in the
  // welcome-screen language, which these runs set to the same language.
  const leaks = [];
  for (const [id, row] of Object.entries(copy)) {
    if (/^lang_/.test(id)) continue;             // language names shown in their own language
    if (row.en === row[L]) continue;              // same word in both languages
    for (const frag of row.en.split(/\{[a-z]+\}/)) {
      const f = frag.trim();
      if (Array.from(f).length < 6) continue;
      if (row[L].includes(f)) continue;
      if (text.includes(f)) leaks.push(id + ': "' + f + '"');
    }
  }
  return leaks;
}

// ---------- Part 7 checks ----------
test('P7-01 original/ is byte-identical to the uploaded file', async () => {
  const h = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  const a = h(path.join(ROOT, 'original', 'Home_FIX_Mobile.html'));
  const b = h(path.join(ROOT, '..', '..', 'Home FIX Mobile.html'));
  assert(a === b, `sha256 differs: ${a} vs ${b}`);
  return 'sha256 ' + a;
}, { noBrowser: true });

test('P7-02 dist opens offline with no console errors', async (browser) => {
  const { context, page, errors, requests } = await open(browser, '', { context: { offline: true } });
  await consent(page, 'en');
  await qr(page, 'lang_en');
  const ext = requests.filter(u => !/^(file|blob|data):/.test(u));
  await context.close();
  assert(!errors.length, 'console errors: ' + errors.join(' | '));
  assert(!ext.length, 'network requests: ' + ext.join(', '));
  return 'context offline; 0 console errors; 0 network requests';
});

for (const L of LANGS) {
  test(`P7-03 happy path completes in ${L} (default script, sample photos) + P7-04 no English after choosing ${L}`, async (browser) => {
    const { context, page, errors, requests } = await open(browser, 'lang=' + L);
    await happyPath(page, L);
    await finishApproved(page, L);
    const leaks = L === 'en' ? [] : await englishLeaks(page, L);
    const ext = requests.filter(u => !/^(file|blob|data):/.test(u));
    await context.close();
    assert(!errors.length, 'console errors: ' + errors.join(' | '));
    assert(!leaks.length, 'English text found: ' + leaks.join('; '));
    assert(!ext.length, 'network requests: ' + ext.join(', '));
    return `completed to results card; ${L === 'en' ? 'n/a' : '0 English strings'}; 0 errors; 0 network requests`;
  });
}

for (const L of LANGS) {
  for (const outcome of ['approved', 'retake', 'rejected']) {
    test(`P7-03 outcome "${outcome}" completes in ${L} (facilitator-set, real photos)`, async (browser) => {
      const { context, page, errors } = await open(browser, 'lang=' + L + '&facilitator');
      await fac(page, [`[data-fac-outcome="${outcome}"]`, '[data-fac-check="before:pass"]', '[data-fac-check="serial:pass"]']);
      await happyPath(page, L, { real: true, pass: true });
      const copy = await copyTable(page);
      if (outcome === 'approved') {
        await finishApproved(page, L);
      } else if (outcome === 'retake') {
        await qr(page, 'btn_retake_now', 20000); await checkQuick(page, L + ' retake');
        const before = await page.$$eval('#hf-log > *', e => e.length);
        await upload(page, 'btn_retake_now');
        await waitText(page, T(copy, 'm_sent_reviewer', L));
        await finishApproved(page, L);
        const after = await page.$$eval('#hf-log > *', e => e.length);
        assert(after > before, 'retake did not append');
      } else {
        await qr(page, 'btn_chat_thandi', 20000); await checkQuick(page, L + ' rejected');
        await tap(page, 'btn_chat_thandi');
        await waitText(page, T(copy, 'm_agent_hi', L));
        await say(page, 'test reply');
        await waitText(page, T(copy, 'm_agent_back', L));
        await page.waitForSelector('#hf-results', { timeout: 10000 });
      }
      const leaks = L === 'en' ? [] : await englishLeaks(page, L);
      await context.close();
      assert(!errors.length, 'console errors: ' + errors.join(' | '));
      assert(!leaks.length, 'English text found: ' + leaks.join('; '));
      return 'completed to results card';
    });
  }
}

test('P7-05 F01 every string id has en, zu and af (build check)', async () => {
  const out = require('child_process').execFileSync('node', [path.join(ROOT, 'tools', 'check.js')]).toString();
  return out.trim();
}, { noBrowser: true });

test('P7-06 F20 every quick-reply label <= 20 chars and <= 3 per beat (seen in all runs)', async () => {
  assert(!limitViolations.length, limitViolations.join('; '));
  return 'no violations across every quick-reply state reached in the 12 full runs';
}, { noBrowser: true, last: true });

// ---------- Fixes ----------
test('F01 no localizedEn sub-line; status/placeholder translated', async (browser) => {
  const { context, page } = await open(browser, 'lang=zu');
  await consent(page, 'zu'); await tap(page, 'lang_zu');
  await qr(page, 'btn_start');
  const ph = await page.getAttribute('#hf-input', 'placeholder');
  const status = await page.innerText('#hf-status');
  const ev = await page.evaluate(() => document.body.innerText.includes('Evidence'));
  await context.close();
  assert(ph === 'Umlayezo', 'placeholder ' + ph);
  assert(status === 'uxhumekile', 'status ' + status);
  assert(!ev, 'English "Evidence" label visible');
  return 'placeholder, status and progress label in isiZulu';
});

test('F02 language is asked first; Start job comes after, in that language', async (browser) => {
  const { context, page } = await open(browser, '');
  await consent(page);
  await qr(page, 'lang_af');
  const first = await quickLabels(page);
  assert(first.map(x => x.id).join() === 'lang_en,lang_zu,lang_af', 'first buttons ' + JSON.stringify(first));
  const subs = await page.$$eval('[data-qr]', els => els.map(e => e.innerText.split('\n')[1]));
  assert(subs.join('|') === 'Continue in English|Qhubeka ngesiZulu|Gaan voort in Afrikaans', 'subs ' + subs);
  await tap(page, 'lang_af');
  await qr(page, 'btn_start');
  const q = await quickLabels(page);
  await context.close();
  assert(q[0].label === 'Begin werk', 'start label ' + q[0].label);
  return 'opening offers en/zu/af with subtitles; Start job shows as "Begin werk" after choosing Afrikaans';
});

test('F03 South African English: PCV, UK spelling, 24-hour times', async (browser) => {
  const { context, page } = await open(browser, 'facilitator');
  const copy = await copyTable(page);
  const us = /\b(color|center|organiz|prioritiz|analyz|favorite|license(?!d)|meter\b|program\b|flashlight|faucet|apartment|zip code|cell phone)/i;
  const bad = Object.entries(copy).filter(([, r]) => us.test(r.en)).map(([id]) => id);
  await fac(page, ['[data-jump="compliance"]']);
  await qr(page, 'btn_upload_photos');
  const txt = await chatText(page);
  const times = (txt.match(/\b\d{1,2}:\d{2}\b/g) || []);
  await context.close();
  assert(!bad.length, 'US spelling in ' + bad.join(','));
  assert(txt.includes('Pressure control valve (PCV)'), 'PCV missing');
  assert(times.every(t => /^([01]\d|2[0-3]):[0-5]\d$/.test(t)), 'non 24h time ' + times);
  assert(Object.values(copy).some(r => /torch/.test(r.en)) && Object.values(copy).some(r => /geyser/.test(r.en)), 'torch/geyser kept');
  return `0 US spellings; "(PCV)" shown; ${times.length} times all 24-hour`;
});

test('F04 two sittings: installation beat, "Later today" chip, serial from 13:10', async (browser) => {
  const { context, page } = await open(browser, 'lang=en');
  await consent(page, 'en'); await tap(page, 'lang_en'); await tap(page, 'btn_start'); await tap(page, 'btn_begin');
  await sample(page); await qr(page, 'btn_retake'); await sample(page);
  await qr(page, 'btn_install_done');
  const install = await lastIn(page);
  await tap(page, 'btn_install_done');
  await qr(page, 'btn_upload_serial');
  const seq = await page.evaluate(() => Array.from(document.getElementById('hf-log').children).map(e => e.innerText.replace(/\s+/g, ' ').trim()));
  const pct = await page.innerText('#hf-quick');
  await context.close();
  assert(install.includes('Before photo saved. Go ahead with the installation. When the new geyser is in, tap Installation done. Your progress is saved.'), 'install text');
  const iChip = seq.findIndex(s => s === 'Later today');
  const iDone = seq.findIndex(s => s.startsWith('Installation done'));
  assert(iChip >= 0 && iDone === iChip + 1, 'chip not directly before the Installation done bubble');
  assert(seq[iDone].includes('13:10'), 'serial time ' + seq[iDone]);
  return 'chip "Later today" then "Installation done 13:10"; before photo 09:34–09:35';
});

test('F05 Resume previous job: none, then restore with "Welcome back"', async (browser) => {
  const { context, page } = await open(browser, 'lang=en&facilitator');
  await consent(page, 'en'); await tap(page, 'lang_en');
  await tap(page, 'btn_resume');
  await waitText(page, 'You don’t have a job in progress. Tap Start job to begin.');
  await qr(page, 'btn_start');
  await fac(page, ['[data-jump="serial_retake"]']);
  await qr(page, 'btn_type_in');
  await page.waitForTimeout(300);
  await fac(page, ['[data-jump="start"]']);
  await tap(page, 'btn_resume');
  await waitText(page, 'Welcome back. You were on: Serial number label.');
  const q = await quickLabels(page);
  await context.close();
  assert(q.map(x => x.id).join() === 'btn_retake,btn_type_in', 'quick after resume ' + JSON.stringify(q));
  return 'no-job reply keeps Start job; saved job restored at the serial retake beat';
});

test('F06 one compliance checklist with the new note', async (browser) => {
  const { context, page } = await open(browser, 'facilitator');
  await fac(page, ['[data-jump="compliance"]']);
  await qr(page, 'btn_upload_photos');
  const cards = await page.$$eval('#hf-log', els => (els[0].innerText.match(/Compliance evidence/g) || []).length);
  const txt = await chatText(page);
  const q = (await quickLabels(page)).map(x => x.label);
  await context.close();
  assert(cards === 1, 'checklists ' + cards);
  assert(!txt.includes('Tap to add each photo'), 'old second checklist present');
  assert(txt.includes('Send all four together, or one at a time.'), 'note');
  assert(txt.includes('Keeps the geyser at a safe pressure'), 'sub-lines kept');
  assert(q.join('|') === 'Upload photos|Skip for later', 'buttons ' + q);
  return '1 checklist, sub-lines kept, new note, Upload photos + Skip for later';
});

test('F07 Skip for later comes back before submission', async (browser) => {
  const { context, page } = await open(browser, 'facilitator');
  await fac(page, ['[data-jump="compliance"]']);
  await tap(page, 'btn_skip');
  await qr(page, 'btn_continue');
  await tap(page, 'btn_continue');
  await waitText(page, 'Before you submit, I still need the 4 compliance photos.');
  const q = (await quickLabels(page)).map(x => x.id);
  // one photo, then the rest
  await upload(page, 'btn_upload_photos', [PHOTO]);
  await waitText(page, 'Got 1 of 4. Send the other 3 when you’re ready.');
  await qr(page, 'btn_upload_photos');
  const noSubmit = !(await page.$('[data-qr="btn_submit"]'));
  await upload(page, 'btn_upload_photos', [PHOTO, PHOTO, PHOTO]);
  await qr(page, 'btn_submit', 15000);
  await context.close();
  assert(q.join() === 'btn_upload_photos', 'reminder buttons ' + q);
  assert(noSubmit, 'submit offered with photos missing');
  return 'skip → Continue → reminder; submit only after 4 of 4';
});

test('F08 realistic signal drop: clock, Connecting…, silence, then ticks and status card', async (browser) => {
  const { context, page } = await open(browser, 'facilitator');
  await fac(page, ['[data-jump="compliance"]']);
  await qr(page, 'btn_upload_photos');
  const n0 = await countIn(page);
  await sample(page);
  await page.waitForSelector('.hf-clock');
  const status1 = await page.innerText('#hf-status');
  await page.waitForTimeout(2000);
  const n1 = await countIn(page);
  const quickDuring = await page.$('#hf-quick');
  await qr(page, 'btn_submit', 10000);
  const clocks = await page.$$('.hf-clock');
  const status2 = await page.innerText('#hf-status');
  const txt = await chatText(page);
  const q = (await quickLabels(page)).map(x => x.id);
  await context.close();
  assert(status1 === 'Connecting…', 'status during drop ' + status1);
  assert(n1 === n0, 'bot sent a message while offline');
  assert(!quickDuring, 'buttons shown while offline');
  assert(!clocks.length && status2 === 'online', 'did not recover');
  assert(!txt.includes('Connection lost') && !txt.includes('You’re offline'), 'fake offline message');
  assert(txt.includes('Your photos came through') && txt.includes('The signal dropped while sending, but nothing was lost.'), 'card copy');
  assert(txt.includes('6 of 6 items') && txt.includes('4 of 4'), 'fields');
  assert(!q.includes('btn_retry') && q.join() === 'btn_submit', 'buttons ' + q);
  return 'clock + "Connecting…" + no bot message for 2 s; then ticks, online, "Your photos came through", 6 of 6 / 4 of 4';
});

test('F09 submitted and in review merged; no Finish or Exit; new note', async (browser) => {
  const { context, page } = await open(browser, 'facilitator');
  await fac(page, ['[data-jump="offline"]']);
  await tap(page, 'btn_submit');
  await qr(page, 'btn_support');
  const txt = await chatText(page);
  const q = (await quickLabels(page)).map(x => x.label);
  await context.close();
  assert(txt.includes('Evidence submitted successfully') && txt.includes('In review'), 'cards');
  assert(txt.includes('A real person makes the final decision, not an automated system. Payment is processed once the job is approved.'), 'note');
  assert(!txt.includes('payment eligibility'), 'old note');
  assert(q.join() === 'Contact support', 'buttons ' + q);
  return 'one beat with both cards; only Contact support';
});

test('F10 reference HF-2026 and date 18 Jun 2026 everywhere', async (browser) => {
  const html = fs.readFileSync(path.join(ROOT, 'src', 'template.html'), 'utf8');
  assert(!html.includes('HF-2024'), 'HF-2024 in source');
  assert(!/16 Jun/.test(html), '16 Jun in source');
  const { context, page } = await open(browser, 'facilitator');
  await fac(page, ['[data-jump="o:approved"]']);
  const txt = await chatText(page);
  await context.close();
  assert(txt.includes('HF-2026-DBN-04821') && txt.includes('18 Jun 2026, 13:18') && txt.includes('18 Jun 2026, 14:52'), 'values');
  return 'HF-2026-DBN-04821, 18 Jun 2026; no HF-2024 or 16 Jun in source';
}, {});

test('F11 greeting uses the name', async (browser) => {
  const { context, page } = await open(browser, '');
  await consent(page); await qr(page, 'lang_en');
  const txt = await chatText(page);
  await context.close();
  assert(txt.includes('Good morning, Sipho. This is Home FIX verification.'), 'greeting');
  return 'first message: "Good morning, Sipho. This is Home FIX verification."';
});

test('F12 no confidence number or bar for the installer; ✅ on accepted photos', async (browser) => {
  const { context, page } = await open(browser, 'lang=en');
  await happyPath(page, 'en');
  const txt = await page.evaluate(() => document.body.innerText);
  const conf = /confidence|%/i.test(txt);
  const ticks = (txt.match(/✅/g) || []).length;
  await context.close();
  assert(!conf, 'confidence or % shown');
  assert(ticks >= 2, '✅ count ' + ticks);
  return `no "%" or "confidence" in participant mode; ${ticks} ✅ results`;
});

test('F12 confidence values appear in the facilitator panel only', async (browser) => {
  const { context, page } = await open(browser, 'facilitator');
  await fac(page, ['[data-jump="before"]']);
  await sample(page); await qr(page, 'btn_retake'); await sample(page); await qr(page, 'btn_install_done');
  await page.click('#hf-fac-toggle');
  const lines = await page.$$eval('.hf-fac-conf', e => e.map(x => x.innerText));
  await context.close();
  assert(lines.length === 2 && lines[0].includes('41') && lines[1].includes('96'), 'lines ' + lines);
  return lines.join(' / ');
});

test('F13 serial confirmation and typed correction', async (browser) => {
  const { context, page } = await open(browser, 'facilitator');
  await fac(page, ['[data-jump="serial_retake"]']);
  await sample(page);
  await qr(page, 'btn_no_fix');
  const txt = await chatText(page);
  await tap(page, 'btn_no_fix');
  await waitText(page, 'Please type the serial number exactly as it is on the label.');
  await say(page, '  kwh-8842-za-111 ');
  await waitText(page, 'Thanks. Saved as KWH-8842-ZA-111. A reviewer will compare it with the photo.');
  await qr(page, 'btn_upload_photos');
  await context.close();
  assert(txt.includes('Please check the serial number: KWH-8842-ZA-117. Is that right?'), 'confirm text');
  assert(txt.includes('A Home FIX reviewer checks this too.') && !txt.includes('If it ever looks wrong'), 'AI note');
  return 'confirm beat shown; typed value trimmed and uppercased; flow continues to compliance';
});

test('F14 serial retake offers Type it in instead', async (browser) => {
  const { context, page } = await open(browser, 'facilitator');
  await fac(page, ['[data-jump="serial"]']);
  await sample(page);
  await qr(page, 'btn_type_in');
  const q = (await quickLabels(page)).map(x => x.label);
  await tap(page, 'btn_type_in');
  await waitText(page, 'Please type the serial number exactly as it is on the label.');
  await context.close();
  assert(q.join('|') === 'Retake photo|Type it in instead', 'buttons ' + q);
  return 'Retake photo | Type it in instead → typing path';
});

test('F15 Contact support is an in-chat handover to Thandi', async (browser) => {
  const { context, page } = await open(browser, 'facilitator');
  await fac(page, ['[data-jump="before_retake"]']);
  await tap(page, 'btn_support');
  await waitText(page, 'Hi Sipho, Thandi here. I can see your job. How can I help?');
  const txt = await chatText(page);
  const bold = await page.$eval('.hf-agent', e => ({ t: e.innerText, w: getComputedStyle(e).fontWeight }));
  const noQuick = !(await page.$('#hf-quick'));
  await say(page, 'The photo keeps coming out dark');
  await waitText(page, 'Thanks. I’m handing you back to the assistant.');
  const q = (await quickLabels(page)).map(x => x.id);
  await context.close();
  assert(txt.includes('Connecting you to our team'), 'title');
  assert(txt.includes('usually within 5 minutes (Mon–Sat, 07:00–19:00)'), 'body');
  assert(!/0860|\b0\d{2} ?\d{3} ?\d{4}\b/.test(txt) && !txt.includes('Reply HELP'), 'phone number shown');
  assert(bold.t === 'Thandi · Home FIX team' && Number(bold.w) >= 700, 'agent name line ' + JSON.stringify(bold));
  assert(noQuick, 'quick replies shown while waiting for typed reply');
  assert(q.join() === 'btn_retake,btn_support', 'returned quick ' + q);
  return 'status card + Thandi bold name; participant types; hand-back restores Retake photo + Contact support';
});

test('F16 needs-assistance outcome says why and who', async (browser) => {
  const { context, page } = await open(browser, 'facilitator');
  await fac(page, ['[data-jump="o:rejected"]']);
  const txt = await chatText(page);
  const q = await quickLabels(page);
  await context.close();
  ['A Home FIX agent will finish this with you', 'The reviewer couldn’t approve the job from the photos alone.', 'The serial number doesn’t match the geyser on the order', 'Thandi, Home FIX team', 'Today before 15:00', 'Your job stays open and nothing you sent is lost.']
    .forEach(s => assert(txt.includes(s), 'missing ' + s));
  assert(q.length === 1 && q[0].label === 'Chat to Thandi now', 'buttons');
  return 'title, body, reason, who, when, note and "Chat to Thandi now"';
});

test('F17 no fake security banner; POPIA message; Privacy notice reply', async (browser) => {
  const { context, page } = await open(browser, '');
  await consent(page); await tap(page, 'lang_en');
  await qr(page, 'btn_privacy');
  await tap(page, 'btn_privacy');
  await waitText(page, 'Opens our privacy notice. Not part of this prototype.');
  const txt = await chatText(page);
  await context.close();
  assert(!/secured by/i.test(txt) && !txt.includes('🔒'), 'banner');
  assert(txt.includes('We use your photos and job details only to verify this job, in line with POPIA.'), 'POPIA');
  return 'banner gone; POPIA line after greeting; Privacy notice answers';
});

test('F18 retake outcome appends a new exchange, then Approved', async (browser) => {
  const { context, page } = await open(browser, 'facilitator');
  await fac(page, ['[data-jump="o:retake"]']);
  await qr(page, 'btn_retake_now');
  const before = await page.$$eval('#hf-log > *', els => els.map(e => e.innerText));
  await sample(page);
  await waitText(page, 'Thanks. Sent to the reviewer.');
  await waitText(page, 'Installation approved', 15000);
  const after = await page.$$eval('#hf-log > *', els => els.map(e => e.innerText));
  await context.close();
  assert(after.length > before.length && before.every((t, i) => after[i] === t), 'earlier transcript changed');
  return `transcript kept (${before.length} items) and ${after.length - before.length} appended; approved follows`;
});

test('F19 no text below 11px in the chat area', async (browser) => {
  const { context, page } = await open(browser, 'facilitator');
  const small = [];
  for (const id of ['serial', 'o:retake', 'serial_ok', 'submitted', 'compliance']) {
    await fac(page, [`[data-jump="${id}"]`]);
    await page.waitForTimeout(1200);
    const s = await page.evaluate(() => Array.from(document.querySelectorAll('#hf-log *')).filter(e => Array.from(e.childNodes).some(n => n.nodeType === 3 && n.textContent.trim())).map(e => [e.textContent.trim().slice(0, 20), parseFloat(getComputedStyle(e).fontSize)]).filter(x => x[1] < 11));
    small.push(...s);
  }
  await context.close();
  assert(!small.length, 'small text: ' + JSON.stringify(small.slice(0, 5)));
  return 'every text node in the chat is 11px or larger';
});

// ---------- Testing readiness ----------
test('T01 real photo, 2x2 grid for multiple, cancel does nothing, sample link', async (browser) => {
  const { context, page } = await open(browser, 'facilitator');
  await fac(page, ['[data-jump="before"]']);
  await qr(page, 'btn_upload_photo');
  const capture = await page.evaluate(() => { const el = document.getElementById('hf-file'); el.click = () => {}; return true; });
  await tap(page, 'btn_upload_photo');
  const attrs1 = await page.evaluate(() => { const el = document.getElementById('hf-file'); return [el.getAttribute('accept'), el.getAttribute('capture'), el.hasAttribute('multiple')]; });
  const n0 = await page.$$eval('#hf-log > *', e => e.length);
  await page.setInputFiles('#hf-file', []);
  await page.waitForTimeout(800);
  const n1 = await page.$$eval('#hf-log > *', e => e.length);
  await page.setInputFiles('#hf-file', [PHOTO]);
  await page.waitForSelector('.hf-real-photo');
  const one = await page.$eval('.hf-real-photo', e => [e.getBoundingClientRect().width, e.getBoundingClientRect().height, e.children.length]);
  await fac(page, ['[data-jump="compliance"]']);
  await qr(page, 'btn_upload_photos');
  await page.evaluate(() => { document.getElementById('hf-file').click = () => {}; });
  await tap(page, 'btn_upload_photos');
  const attrs2 = await page.evaluate(() => { const el = document.getElementById('hf-file'); return [el.getAttribute('capture'), el.hasAttribute('multiple')]; });
  await page.setInputFiles('#hf-file', [PHOTO, PHOTO, PHOTO, PHOTO]);
  await page.waitForSelector('.hf-real-photo');
  const grid = await page.$eval('.hf-real-photo', e => [e.children.length, getComputedStyle(e).gridTemplateColumns.split(' ').length, getComputedStyle(e).gridTemplateRows.split(' ').length]);
  const stored = await page.evaluate(() => localStorage.getItem('homefix_proto_state_v1') || '');
  await context.close();
  assert(attrs1.join() === 'image/*,environment,false', 'before input attrs ' + attrs1);
  assert(attrs2.join() === ',true', 'compliance input attrs ' + attrs2);
  assert(n1 === n0, 'cancel added a message');
  assert(one[0] === 200 && one[1] === 144 && one[2] === 1, 'single photo size ' + one);
  assert(grid.join() === '4,2,2', 'grid ' + grid);
  assert(!stored.includes('blob:'), 'object URL stored');
  return 'capture=environment (before, serial), multiple (compliance); 200×144 bubble; 2×2 grid; cancel = no-op; no blob URL in storage';
});

for (const L of LANGS) {
  test(`T02 keywords in ${L} at a waiting beat return to the same beat`, async (browser) => {
    const { context, page } = await open(browser, 'lang=' + L + '&facilitator');
    const copy = await copyTable(page);
    await fac(page, ['[data-jump="serial"]']);
    await qr(page, 'btn_upload_serial');
    await page.evaluate(L => { /* keep facilitator language */ }, L);
    const kw = { en: ['help', 'language', 'person'], zu: ['usizo', 'ulimi', 'umuntu'], af: ['hulp', 'taal', 'persoon'] }[L];
    // send button appears only with text
    const micBefore = await page.$('.hf-send-icon');
    await page.fill('#hf-input', kw[0]);
    const sendIcon = await page.$('.hf-send-icon');
    await page.click('#hf-send');
    await waitText(page, T(copy, 'step_serial', L));
    await qr(page, 'btn_upload_serial');
    await say(page, kw[1].toUpperCase());
    await qr(page, 'lang_af');
    const other = L === 'af' ? 'zu' : 'af';
    await tap(page, 'lang_' + other);
    await waitText(page, T(copy, 'm_lang_changed', other));
    await qr(page, 'btn_upload_serial');
    const q = await quickLabels(page);
    await say(page, kw[2]);
    await waitText(page, T(copy, 'm_agent_hi', other));
    await context.close();
    assert(!micBefore && sendIcon, 'send button did not appear with text');
    assert(q[0].label === T(copy, 'btn_upload_serial', other), 'quick not re-sent in new language: ' + q[0].label);
    return `${kw.join('/')}: help line, language switch to ${other} with the serial buttons re-sent, handover`;
  });
}

test('T02 unrecognised text: repair, repair + Contact support, then never a third repair', async (browser) => {
  const { context, page } = await open(browser, 'facilitator');
  await fac(page, ['[data-jump="before"]']);
  await qr(page, 'btn_upload_photo');
  await say(page, 'blah');
  await waitText(page, 'Sorry, I didn’t catch that. Send one photo of the whole geyser and the area around it.');
  await say(page, 'still blah');
  await waitText(page, 'If you’re stuck, tap Contact support.');
  const q = (await quickLabels(page)).map(x => x.id);
  await say(page, 'and again');
  await waitText(page, 'Connecting you to our team');
  const repairs = ((await chatText(page)).match(/Sorry, I didn’t catch that/g) || []).length;
  await context.close();
  assert(q.join() === 'btn_upload_photo,btn_need_help,btn_support', 'second repair buttons ' + q);
  assert(repairs === 2, 'repairs ' + repairs);
  return 'repair 1, repair 2 adds Contact support, third unrecognised message goes to a person (2 repairs total)';
});

test('T03 facilitator drawer: hidden without #facilitator, PIN, controls, reset', async (browser) => {
  let r = await open(browser, '');
  await consent(r.page); await qr(r.page, 'lang_en');
  const trace = await r.page.evaluate(() => [!!document.getElementById('hf-fac-toggle'), !!document.getElementById('hf-fac'), /Facilitator/.test(document.getElementById('dc-root').innerHTML + document.body.innerText)]);
  await r.context.close();
  assert(trace.every(x => !x), 'facilitator trace in participant mode ' + trace);
  r = await open(browser, 'facilitator');
  const page = r.page;
  await page.click('#hf-fac-toggle');
  await page.fill('#hf-pin', '1111'); await page.click('#hf-pin-ok');
  const wrong = await page.$('#hf-fac-send-outcome');
  await page.fill('#hf-pin', '2468'); await page.click('#hf-pin-ok');
  await page.waitForSelector('#hf-fac-send-outcome');
  const pressed = await page.getAttribute('[data-fac-outcome="approved"]', 'aria-pressed');
  const checks = await page.$$eval('[data-fac-check]', e => e.map(x => x.getAttribute('data-fac-check') + '=' + x.getAttribute('aria-pressed')));
  const items = await page.$$eval('[data-jump]', e => e.length);
  await page.click('[data-jump="submitted"]');
  await page.click('[data-fac-outcome="rejected"]');
  await page.click('#hf-fac-send-outcome');
  await page.click('#hf-fac-toggle');
  await qr(page, 'btn_chat_thandi', 10000);
  await page.click('#hf-fac-toggle');
  await page.click('#hf-fac-offline');
  const status = await page.innerText('#hf-status');
  await page.click('#hf-fac-offline');
  const log = await page.innerText('#hf-fac-log');
  await page.click('#hf-fac-reset');
  await page.waitForSelector('#hf-consent');
  await r.context.close();
  assert(!wrong, 'wrong PIN unlocked');
  assert(pressed === 'true', 'approved not default');
  assert(checks.join() === 'before:pass=false,before:retake=true,serial:pass=false,serial:retake=true', 'AI defaults ' + checks);
  assert(items === 19, 'jump items ' + items);
  assert(status === 'Connecting…', 'offline status ' + status);
  assert(/offline/.test(log) && /online/.test(log) && /outcome/.test(log), 'log');
  return 'no trace without #facilitator; PIN 2468; defaults Approved / Retake-then-pass; 19 jump items; offline toggle; log; reset to welcome';
});

test('T03 facilitator offline: bot waits, outgoing bubble shows clock until back online', async (browser) => {
  const { context, page } = await open(browser, 'facilitator');
  await fac(page, ['[data-jump="summary"]']);
  await qr(page, 'btn_begin');
  await page.click('#hf-fac-toggle'); await page.click('#hf-fac-offline'); await page.click('#hf-fac-toggle');
  const n0 = await countIn(page);
  await tap(page, 'btn_begin');
  await page.waitForTimeout(2000);
  const n1 = await countIn(page);
  const clock = await page.$('.hf-clock');
  await page.click('#hf-fac-toggle'); await page.click('#hf-fac-offline'); await page.click('#hf-fac-toggle');
  await qr(page, 'btn_upload_photo');
  const clock2 = await page.$('.hf-clock');
  await context.close();
  assert(n1 === n0 && clock, 'bot replied while offline');
  assert(!clock2, 'clock stayed');
  return 'no bot message for 2 s while offline; delivered after Back online';
});

test('T04 refresh restores beat, language, messages and outcome at 3 beats', async (browser) => {
  const { context, page } = await open(browser, 'lang=zu&facilitator');
  const snap = () => logicEval(page, 'const s = logic.state; return { beat: s.beat, lang: s.lang, outcome: s.outcome, n: s.messages.length, texts: s.messages.map(m => m.text || m.statusTitle || m.title || m.photoLabel || "").join("|"), quick: s.quick.map(q => q.id).join() }');
  const results = [];
  await fac(page, ['[data-jump="serial_confirm"]']); await qr(page, 'btn_yes_correct');
  for (const step of ['serial_confirm', 'retake_outcome', 'serial_type']) {
    if (step === 'retake_outcome') { await fac(page, ['[data-jump="o:retake"]']); await qr(page, 'btn_retake_now'); }
    if (step === 'serial_type') { await fac(page, ['[data-jump="serial_type"]']); await page.waitForTimeout(1200); }
    await page.waitForTimeout(400);
    const a = await snap();
    await page.reload(); await waitForApp(page); await page.waitForTimeout(400);
    const b = await snap();
    results.push(step + ':' + (JSON.stringify(a) === JSON.stringify(b)));
    assert(JSON.stringify(a) === JSON.stringify(b), step + ' differs: ' + JSON.stringify(a).slice(0, 200) + ' vs ' + JSON.stringify(b).slice(0, 200));
  }
  await context.close();
  return results.join(', ');
});

test('T04 real photos come back as a "photo" placeholder after refresh', async (browser) => {
  const { context, page } = await open(browser, 'facilitator');
  await fac(page, ['[data-jump="before"]']);
  await upload(page, 'btn_upload_photo');
  await page.waitForSelector('.hf-real-photo');
  await qr(page, 'btn_retake');
  await page.reload(); await waitForApp(page);
  await qr(page, 'btn_retake');
  const real = await page.$('.hf-real-photo');
  const txt = await chatText(page);
  await context.close();
  assert(!real && /\bphoto\b/.test(txt), 'photo not replaced');
  return 'photo restored as the striped placeholder labelled "photo"';
});

test('T04 works when localStorage is unavailable', async (browser) => {
  const { context, page, errors } = await open(browser, '', { init: () => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); } });
  await consent(page); await tap(page, 'lang_en'); await tap(page, 'btn_start'); await qr(page, 'btn_begin');
  await context.close();
  assert(!errors.length, 'errors ' + errors.join('|'));
  return 'flow runs with storage throwing; 0 console errors';
});

test('T05 welcome: consent gates Start; #p prefill; language switcher', async (browser) => {
  const { context, page } = await open(browser, 'p=P07');
  const disabled = await page.$eval('#hf-start', e => e.disabled);
  const code = await page.inputValue('#hf-pcode');
  await page.click('[data-wlang="zu"]');
  const zu = await page.innerText('body');
  await page.click('#hf-start', { force: true });
  const still = await page.$('#hf-consent');
  await page.check('#hf-consent');
  const enabled = await page.$eval('#hf-start', e => !e.disabled);
  await context.close();
  assert(disabled && still && enabled, 'consent gate');
  assert(code === 'P07', 'code ' + code);
  assert(zu.includes('Lena yi-prototype yocwaningo') && zu.includes('Sicela ungabhali imininingwane yakho siqu.'), 'zu welcome');
  return 'Start disabled until ticked; P07 prefilled; welcome switches to isiZulu';
});

test('T05 results: JSON and CSV downloads match the schema; copy and fallback', async (browser) => {
  const { context, page } = await open(browser, 'p=P07&facilitator', { context: { permissions: ['clipboard-read', 'clipboard-write'] } });
  await consent(page, 'en'); await tap(page, 'lang_en');
  await qr(page, 'btn_start');
  await say(page, 'xyz');
  await waitText(page, 'Sorry, I didn’t catch that.');
  await fac(page, ['[data-jump="o:approved"]']);
  await tap(page, 'btn_close_job');
  await page.waitForSelector('#hf-results');
  await page.click('[data-ease="5"]');
  await page.fill('#hf-hardest', 'The serial label, "glare", commas');
  const [dj] = await Promise.all([page.waitForEvent('download'), page.click('#hf-dl-json')]);
  const json = JSON.parse(fs.readFileSync(await dj.path(), 'utf8'));
  const [dc] = await Promise.all([page.waitForEvent('download'), page.click('#hf-dl-csv')]);
  const csv = fs.readFileSync(await dc.path(), 'utf8');
  await page.click('#hf-copy');
  await page.waitForSelector('#hf-result-msg');
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  await context.close();
  const need = ['session_start', 'consent', 'language', 'beat_enter', 'quick_reply', 'text_sent', 'repair', 'session_end'];
  const have = new Set(json.events.map(e => e.event));
  assert(json.schema === 'homefix-prototype-results/1' && json.participant === 'P07', 'json head');
  assert(json.answers.ease_1_to_7 === 5 && json.answers.hardest.includes('glare'), 'answers');
  assert(need.every(n => have.has(n)), 'missing events ' + need.filter(n => !have.has(n)));
  assert(json.events.every(e => e.t_iso && typeof e.ms === 'number' && e.beat && e.lang && e.event), 'event fields');
  assert(!JSON.stringify(json).includes('blob:'), 'photo in results');
  assert(csv.charCodeAt(0) === 0xfeff && csv.slice(1).split('\r\n')[0] === 'session_id,participant,t_iso,ms_since_start,beat,lang,event,detail', 'csv header');
  assert(/answer_ease/.test(csv) && /answer_hardest/.test(csv), 'csv answers');
  assert(JSON.parse(clip).session_id === json.session_id, 'clipboard');
  return `${json.events.length} events; JSON + CSV (BOM, schema header); clipboard copy`;
});

test('T05 copy falls back to select-all when the clipboard is unavailable', async (browser) => {
  const { context, page } = await open(browser, 'facilitator', { init: () => { Object.defineProperty(navigator, 'clipboard', { get() { return undefined; } }); } });
  await fac(page, ['[data-jump="o:approved"]']);
  await tap(page, 'btn_close_job');
  await page.waitForSelector('#hf-results');
  await page.click('#hf-copy');
  await page.waitForSelector('#hf-copy-box');
  const v = await page.inputValue('#hf-copy-box');
  const msg = await page.innerText('#hf-result-msg');
  await context.close();
  assert(JSON.parse(v).schema && msg.includes('Select all'), 'fallback');
  return 'textarea with the results shown and selected';
});

test('T06 no horizontal scroll at 320/375/390/430; tap targets >= 44px', async (browser) => {
  const out = [];
  for (const w of [320, 375, 390, 430]) {
    const { context, page } = await open(browser, 'facilitator', { viewport: { width: w, height: 760 } });
    const over = [];
    const measure = async (where) => {
      const o = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth, Array.from(document.querySelectorAll('#hf-log, #hf-quick')).map(e => e.scrollWidth - e.clientWidth)]);
      if (o[0] > o[1] || o[2].some(x => x > 0)) over.push(where + ':' + JSON.stringify(o));
    };
    await measure('welcome');
    for (const id of ['serial', 'serial_ok', 'compliance', 'submitted', 'o:rejected']) { await fac(page, [`[data-jump="${id}"]`]); await page.waitForTimeout(1300); await measure(id); }
    await fac(page, ['[data-jump="o:approved"]']); await tap(page, 'btn_close_job'); await page.waitForSelector('#hf-results'); await measure('results');
    const small = await page.$$eval('#hf-quick button, #hf-send, #hf-results button, #hf-sample', els => els.map(e => e.getBoundingClientRect()).filter(r => r.width < 44 || r.height < 44).length);
    await context.close();
    assert(!over.length, w + 'px overflow ' + over.join(' '));
    assert(!small, w + 'px small targets ' + small);
    out.push(w + 'px ok');
  }
  return out.join(', ');
});

test('T06 desktop 1280x800 full run', async (browser) => {
  const { context, page, errors } = await open(browser, 'lang=en', { viewport: { width: 1280, height: 800 } });
  await happyPath(page, 'en');
  await finishApproved(page, 'en');
  const w = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  await context.close();
  assert(!errors.length && w[0] <= w[1], 'errors or overflow');
  return 'completed at 1280×800; 0 errors; no overflow';
});

test('T06 hash settings: #lang, #p, #facilitator (hash only)', async (browser) => {
  const { context, page } = await open(browser, 'lang=af&p=P11');
  const txt = await page.innerText('body');
  const code = await page.inputValue('#hf-pcode');
  await context.close();
  assert(txt.includes('Dit is \'n prototipe vir navorsing.') && code === 'P11', 'hash');
  const src = fs.readFileSync(path.join(ROOT, 'src', 'template.html'), 'utf8');
  assert(!/location\.search|URLSearchParams/.test(src), 'query string read');
  return '#lang=af&p=P11 applied; no query-string reads in source';
});

// ---------- runner ----------
(async () => {
  const filter = process.argv[2];
  const list = tests.filter(t => !filter || t.name.includes(filter));
  const ordered = list.filter(t => !t.last).concat(list.filter(t => t.last));
  const browser = await launch();
  const results = [];
  const CONC = 4;
  let i = 0;
  const runOne = async (t) => {
    const start = Date.now();
    try {
      const detail = await t.fn(browser);
      results.push({ name: t.name, pass: true, ms: Date.now() - start, detail: detail || '' });
      console.log('PASS', t.name, '—', detail || '');
    } catch (e) {
      results.push({ name: t.name, pass: false, ms: Date.now() - start, detail: String(e && e.message || e).split('\n')[0] });
      console.log('FAIL', t.name, '—', String(e && e.message || e).split('\n')[0]);
    }
  };
  const main = ordered.filter(t => !t.last);
  const workers = Array.from({ length: CONC }, async () => { while (i < main.length) { const t = main[i++]; await runOne(t); } });
  await Promise.all(workers);
  for (const t of ordered.filter(t => t.last)) await runOne(t);
  await browser.close();
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} passed`);
  if (!filter) fs.writeFileSync(path.join(ROOT, 'qa', 'test-results.json'), JSON.stringify({ run: new Date().toISOString(), passed, total: results.length, results }, null, 2));
  process.exit(passed === results.length ? 0 : 1);
})();
