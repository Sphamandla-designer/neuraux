// Capture the case-study screenshots from the Home FIX prototype.
//
//   node case-studies/home-fix/tools/screenshots.mjs
//
// Opens projects/home-fix/dist/Home_FIX_Mobile.html (and, for the "before" shots,
// projects/home-fix/original/Home_FIX_Mobile.html) at 390×844, device scale factor 2,
// drives it to each moment and writes optimised images to case-studies/home-fix/assets/screens/:
//   <name>.webp  780 px wide (2x), the main image
//   <name>.png   390 px wide (1x), the fallback
// The facilitator drawer and its tab never appear in a capture. Safe to re-run.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); }

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CASE = path.resolve(HERE, '..');
const REPO = path.resolve(CASE, '..', '..');
const DIST = path.join(REPO, 'projects', 'home-fix', 'dist', 'Home_FIX_Mobile.html');
const ORIG = path.join(REPO, 'projects', 'home-fix', 'original', 'Home_FIX_Mobile.html');
const OUT = path.join(CASE, 'assets', 'screens');
const MAX_BYTES = 200 * 1024;
fs.mkdirSync(OUT, { recursive: true });

const url = (file, hash) => 'file://' + file + (hash ? '#' + hash : '');
const HIDE_FAC = '#hf-fac-toggle,#hf-fac{display:none!important}';

const browser = await pw.chromium.launch();
const shots = [];   // { name, png (Buffer) }

async function newPage(file, hash) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on('pageerror', e => { throw e; });
  await page.goto(url(file, hash));
  await page.waitForSelector('#dc-root > *', { timeout: 20000 });
  await page.waitForTimeout(400);
  return { ctx, page };
}
const qr = (page, id, timeout = 20000) => page.waitForSelector(`[data-qr="${id}"]`, { timeout });
const tap = async (page, id) => (await qr(page, id)).click();
const sample = async page => { await page.waitForSelector('#hf-sample', { timeout: 20000 }); await page.click('#hf-sample'); };
const settle = page => page.waitForTimeout(700);
async function shot(page, name) {
  await page.addStyleTag({ content: HIDE_FAC });
  await page.waitForTimeout(150);
  shots.push({ name, png: await page.screenshot() });
  console.log('captured', name);
}
async function waitText(page, text, timeout = 20000) {
  await page.waitForFunction(t => (document.getElementById('hf-log') || document.body).innerText.includes(t), text, { timeout });
}
// Test-and-capture helper: reach the prototype's component through React's fiber tree.
async function logic(page, src, arg) {
  return page.evaluate(([s, a]) => {
    const el = document.getElementById('dc-root').firstElementChild;
    let f = el[Object.keys(el).find(k => k.startsWith('__reactFiber$'))];
    while (f && !(f.stateNode && f.stateNode.logic)) f = f.return;
    return new Function('logic', 'arg', s)(f.stateNode.logic, a);
  }, [src, arg]);
}
async function jump(page, id) {
  await logic(page, 'logic.facJump(arg)', id);
  await page.waitForTimeout(1500);
}

// ---------- 1. The main path, played as a participant (English) ----------
{
  const { ctx, page } = await newPage(DIST, 'lang=en');
  await page.check('#hf-consent'); await page.click('#hf-start');
  await qr(page, 'lang_af'); await settle(page);
  await shot(page, 'language-choice');
  await tap(page, 'lang_en'); await tap(page, 'btn_start');
  await qr(page, 'btn_begin'); await settle(page);
  await shot(page, 'job-summary');
  await tap(page, 'btn_begin');
  await qr(page, 'btn_upload_photo'); await settle(page);
  await shot(page, 'before-photo-guidance');
  await sample(page);
  await qr(page, 'btn_retake'); await settle(page);
  await shot(page, 'blurry-photo-retake');
  await sample(page);
  await tap(page, 'btn_install_done');
  await qr(page, 'btn_upload_serial');
  await sample(page);
  await qr(page, 'btn_type_in'); await settle(page);
  await shot(page, 'serial-glare-retake');
  await sample(page);
  await qr(page, 'btn_yes_correct'); await settle(page);
  await shot(page, 'serial-confirmation');
  await tap(page, 'btn_no_fix');
  await waitText(page, 'Please type the serial number exactly as it is on the label.');
  await page.fill('#hf-input', 'kwh-8842-za-111');
  await page.click('#hf-send');
  await waitText(page, 'Saved as KWH-8842-ZA-111');
  await page.waitForTimeout(200);
  await shot(page, 'serial-typed-correction');
  await qr(page, 'btn_upload_photos');
  await sample(page);
  await page.waitForSelector('.hf-clock'); await page.waitForTimeout(500);
  await shot(page, 'signal-drop-connecting');
  await qr(page, 'btn_submit'); await settle(page);
  await shot(page, 'signal-drop-recovered');
  await tap(page, 'btn_submit');
  await qr(page, 'btn_support'); await settle(page);
  await shot(page, 'submitted-in-review');
  await qr(page, 'btn_close_job', 20000); await settle(page);
  await shot(page, 'outcome-approved');
  await ctx.close();
}

// ---------- 2. Outcomes and other languages, via the facilitator jump list ----------
for (const [hash, id, name] of [
  ['lang=en', 'o:retake', 'outcome-retake'],
  ['lang=en', 'o:rejected', 'outcome-needs-assistance'],
  ['lang=zu', 'serial_confirm', 'serial-confirmation-zu'],
  ['lang=zu', 'summary', 'job-summary-zu'],
  ['lang=af', 'summary', 'job-summary-af'],
  ['lang=en', 'serial', 'after-serial-later-today'],
  ['lang=en', 'serial_ok', 'after-serial-no-confidence'],
]) {
  const { ctx, page } = await newPage(DIST, hash);
  await jump(page, id);
  if (name === 'after-serial-later-today') {
    // Bring the "Later today" chip and the 09:35 → 13:10 time jump into view.
    await page.evaluate(() => {
      const log = document.getElementById('hf-log');
      const chip = Array.from(log.children).find(e => e.innerText.trim() === 'Later today');
      log.scrollTop = chip.offsetTop - log.offsetTop - 160;
    });
  }
  await shot(page, name);
  await ctx.close();
}

// ---------- 3. "Before" states from the original prototype ----------
{
  const { ctx, page } = await newPage(ORIG);
  // The original asked for the language after Start job; isiZulu changed only the greeting.
  await page.getByRole('button', { name: /Start job/ }).click();
  await page.getByRole('button', { name: /isiZulu/ }).click();
  await page.getByRole('button', { name: /Begin verification/ }).waitFor({ timeout: 20000 });
  await settle(page);
  await shot(page, 'before-language-zu');
  // Beats as the original showed them (the same views as projects/home-fix/qa/before/).
  const ids = await logic(page, 'return logic.beatList().map(b => b.id)');
  for (const [beat, name] of [['serial', 'before-serial-0937'], ['serial_ok', 'before-serial-confidence']]) {
    await logic(page, 'logic.jumpTo(arg)', ids.indexOf(beat));
    await page.waitForTimeout(500);
    await shot(page, name);
  }
  // The original referral sent installers to a phone line. The number is a placeholder,
  // but this site never shows phone numbers, so it is covered before capture.
  await logic(page, 'logic.showOutcome(arg)', 'rejected');
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('span')).find(s => /^0860/.test(s.textContent.trim()));
    if (!el) throw new Error('phone field not found');
    el.textContent = 'number hidden';
    el.style.cssText += ';background:#2B3A40;color:#fff;padding:0 6px;border-radius:4px;font-weight:500';
  });
  await shot(page, 'before-referral-phone');
  await ctx.close();
}

// ---------- Encode: WebP at 2x, PNG fallback at 1x ----------
const enc = await (await browser.newContext()).newPage();
await enc.setContent('<canvas id="c"></canvas>');
const report = [];
for (const s of shots) {
  const b64 = s.png.toString('base64');
  const out = await enc.evaluate(async (data) => {
    const img = new Image();
    await new Promise((r, j) => { img.onload = r; img.onerror = j; img.src = 'data:image/png;base64,' + data; });
    const c = document.getElementById('c');
    const enc = (w, h, type, q) => { c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, w, h); return c.toDataURL(type, q); };
    const res = { w: img.width, h: img.height };
    for (const q of [0.82, 0.74, 0.66, 0.58]) { res.webp = enc(img.width, img.height, 'image/webp', q); res.q = q; if (res.webp.length * 0.75 < 195 * 1024) break; }
    res.png = enc(img.width / 2, img.height / 2, 'image/png');
    return res;
  }, b64);
  const webp = Buffer.from(out.webp.split(',')[1], 'base64');
  const png = Buffer.from(out.png.split(',')[1], 'base64');
  fs.writeFileSync(path.join(OUT, s.name + '.webp'), webp);
  fs.writeFileSync(path.join(OUT, s.name + '.png'), png);
  report.push({ name: s.name, width: out.w / 2, height: out.h / 2, webpBytes: webp.length, pngBytes: png.length, webpQuality: out.q });
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(report, null, 2) + '\n');
await browser.close();
const big = report.filter(r => r.webpBytes > MAX_BYTES || r.pngBytes > MAX_BYTES);
console.table(report.map(r => ({ name: r.name, webpKB: (r.webpBytes / 1024).toFixed(0), pngKB: (r.pngBytes / 1024).toFixed(0) })));
if (big.length) { console.error('Over 200 KB:', big.map(b => b.name).join(', ')); process.exit(1); }
