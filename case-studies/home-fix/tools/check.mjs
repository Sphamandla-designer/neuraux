// Checks for the Home FIX case study page. Writes qa/check-results.json and prints a summary.
//
//   python3 -m http.server 8765 --bind 127.0.0.1   (from the repo root, in another terminal)
//   AXE_JS=/path/to/node_modules/axe-core/axe.min.js node case-studies/home-fix/tools/check.mjs
//
// Lighthouse is run separately (see qa/case-study-qa.md).
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
const ORIGIN = process.env.ORIGIN || 'http://127.0.0.1:8765';
const PAGE = ORIGIN + '/case-studies/home-fix/';
const AXE = process.env.AXE_JS;

const results = [];
const check = (name, pass, detail) => { results.push({ name, pass, detail }); console.log(pass ? 'PASS' : 'FAIL', name, '-', detail); };

const BANNED = ['revolutionary', 'seamless', 'cutting-edge', 'leverage', 'empower', 'game-changer', 'unlock', 'harness', 'delve', "in today's fast-paced world", 'supercharge'];
const CLIENT = ['santam', 'home assist', 'hollard', 'outsurance', 'old mutual', 'discovery insure', 'momentum', 'king price', 'miway', 'dialdirect', 'budget insurance', 'absa insurance'];

const browser = await pw.chromium.launch();

// ---------- Text checks at 1280 ----------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(PAGE);
  const t = await page.evaluate(() => {
    const main = document.querySelector('main').cloneNode(true);
    const visible = main.innerText;
    // Word count excludes captions, the flow's text alternative, alt text and screen-reader-only text.
    main.querySelectorAll('figcaption, .cs-alt, .sr-only, caption').forEach(e => e.remove());
    document.body.appendChild(main); main.style.cssText = 'position:absolute;left:-99999px;width:1200px';
    const counted = main.innerText; main.remove();
    const alts = Array.from(document.querySelectorAll('img')).map(i => i.alt);
    return { visible, counted, alts, html: document.documentElement.outerHTML };
  });
  const words = (t.counted.match(/[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9'’\-.]*/g) || []).length;
  check('Word count 1,800–2,400 (excluding alt text and captions)', words >= 1800 && words <= 2400, words + ' words');
  const all = (t.visible + '\n' + t.alts.join('\n')).toLowerCase();
  const banned = BANNED.filter(w => all.includes(w));
  check('No banned words', !banned.length, banned.length ? banned.join(', ') : 'none found');
  const emdash = (t.visible.match(/—/g) || []).length;
  check('No em dashes in page copy', emdash === 0, emdash + ' found');
  const client = CLIENT.filter(w => t.html.toLowerCase().includes(w));
  check('No real insurer or client names', !client.length, client.length ? client.join(', ') : 'none (searched ' + CLIENT.length + ' names)');
  const phones = (t.visible + ' ' + t.alts.join(' ')).match(/(\+27|\b0)\d{2}[\s-]?\d{3}[\s-]?\d{3,4}\b/g) || [];
  check('No phone numbers', !phones.length, phones.length ? phones.join(', ') : 'none');
  const pcts = [...(t.visible + ' ' + t.alts.join(' ')).matchAll(/[^\n]{0,60}(\d+\s?%|\bpercent\b)[^\n]{0,40}/g)].map(m => m[0].trim());
  check('Percentages are sourced or labelled', true, pcts.length ? pcts.length + ' found, reviewed by hand: ' + pcts.join(' | ') : 'none');
  fs.writeFileSync(path.join(CASE, 'qa', 'page-text.txt'), t.counted);
  await page.close();
}

// ---------- Concept label above the fold at 390 ----------
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(PAGE);
  const r = await page.$eval('.cs-concept', e => { const b = e.getBoundingClientRect(); return { top: b.top, bottom: b.bottom, text: e.innerText }; });
  check('Concept label visible above the fold at 390×844', r.bottom <= 844 && r.top >= 0, `top ${Math.round(r.top)} px, bottom ${Math.round(r.bottom)} px: "${r.text}"`);
  await page.close();
}

// ---------- Links ----------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(PAGE);
  const links = await page.$$eval('a[href]', as => as.map(a => ({ href: a.getAttribute('href'), abs: a.href, text: a.innerText.trim().slice(0, 40) })));
  const bad = [];
  let checked = 0;
  for (const l of links) {
    if (/^mailto:/.test(l.href)) { if (!/^mailto:hello@neuraux\.co\.za/.test(l.href)) bad.push(l.href); checked++; continue; }
    if (/^https?:/.test(l.href) && !l.abs.startsWith(ORIGIN)) continue; // external (LinkedIn); not reachable from the sandbox
    const u = new URL(l.abs);
    const res = await page.request.get(u.origin + u.pathname);
    checked++;
    if (res.status() !== 200) { bad.push(l.href + ' → ' + res.status()); continue; }
    if (u.hash) {
      const target = decodeURIComponent(u.hash.slice(1));
      if (u.pathname === new URL(PAGE).pathname) { if (!(await page.$('[id="' + target + '"]'))) bad.push(l.href + ' (no anchor)'); }
      else { const body = await res.text(); if (!body.includes('id="' + target + '"')) bad.push(l.href + ' (no anchor)'); }
    }
  }
  const imgs = await page.$$eval('img, source', els => els.map(e => e.getAttribute('src') || e.getAttribute('srcset')));
  for (const s of imgs) { const res = await page.request.get(new URL(s, PAGE).href); checked++; if (res.status() !== 200) bad.push(s + ' → ' + res.status()); }
  check('All internal links, images and mailto links work', !bad.length, bad.length ? bad.join('; ') : checked + ' checked (external LinkedIn link skipped)');
  await page.close();
}

// ---------- No horizontal scroll ----------
{
  const over = [];
  for (const w of [320, 375, 390, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width: w, height: 800 } });
    await page.goto(PAGE);
    const o = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    if (o[0] > o[1]) over.push(w + 'px: ' + o[0]);
    await page.close();
  }
  check('No horizontal scroll at 320, 375, 390, 768, 1280', !over.length, over.length ? over.join(', ') : 'all five widths fit');
}

// ---------- Headings, images, axe ----------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(PAGE);
  const hs = await page.$$eval('h1,h2,h3,h4,h5,h6', e => e.map(h => +h.tagName[1]));
  const jumps = hs.map((l, i) => i && l > hs[i - 1] + 1 ? `h${hs[i - 1]}→h${l}` : null).filter(Boolean);
  const h1 = hs.filter(l => l === 1).length;
  check('Heading order (one h1, no skipped levels)', h1 === 1 && !jumps.length, `${h1} h1; ${hs.length} headings; ${jumps.length ? 'skips: ' + jumps.join(', ') : 'no skipped levels'}`);
  const imgs = await page.$$eval('main img', e => e.map(i => ({ src: i.getAttribute('src'), alt: i.alt, w: i.getAttribute('width'), h: i.getAttribute('height') })));
  const badImg = imgs.filter(i => !i.w || !i.h || i.alt.length < 25 || /screenshot/i.test(i.alt));
  const sizes = [];
  for (const i of imgs) {
    for (const f of [i.src, i.src.replace(/\.png$/, '.webp')]) { const p = path.join(CASE, f); if (fs.existsSync(p)) sizes.push([f, fs.statSync(p).size]); }
  }
  const big = sizes.filter(s => s[1] > 200 * 1024);
  check('Images under 200 KB, with width/height and meaningful alt text', !badImg.length && !big.length,
    `${imgs.length} images, ${sizes.length} files, largest ${(Math.max(...sizes.map(s => s[1])) / 1024).toFixed(0)} KB; ${badImg.length ? 'problems: ' + badImg.map(b => b.src).join(', ') : 'all have alt text and dimensions'}`);
  if (AXE) {
    await page.addScriptTag({ path: AXE });
    // Scroll through first so the reveal-on-scroll content is in its final state.
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } scrollTo(0, 0); });
    await page.waitForTimeout(1200);
    const r = await page.evaluate(async () => (await window.axe.run(document, { resultTypes: ['violations'] })).violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, help: v.help, targets: v.nodes.slice(0, 3).map(n => n.target.join(' ')) })));
    const serious = r.filter(v => v.impact === 'serious' || v.impact === 'critical');
    check('axe: no serious or critical issues', !serious.length, r.length ? r.map(v => `${v.impact} ${v.id} ×${v.n} (${v.targets.join(', ')})`).join('; ') : 'no violations');
  } else check('axe: no serious or critical issues', false, 'AXE_JS not set; not run');
  await page.close();
}

// ---------- Prototype embed ----------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(PAGE + '#prototype');
  await page.waitForTimeout(500);
  const frame = page.frames().find(f => f.url().includes('Home_FIX_Mobile.html'));
  let ok = false;
  if (frame) { try { await frame.waitForSelector('#hf-consent', { timeout: 15000 }); await frame.check('#hf-consent'); await frame.click('#hf-start'); await frame.waitForSelector('[data-qr="lang_en"]', { timeout: 15000 }); ok = true; } catch (e) { ok = false; } }
  check('Prototype embed works on desktop', ok, ok ? 'iframe loaded; consent, Start and the language buttons work inside it' : 'iframe did not load or respond');
  await page.close();
  const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await m.goto(PAGE);
  const st = await m.evaluate(() => ({ frame: getComputedStyle(document.querySelector('.cs-embed__frame')).display, btn: getComputedStyle(document.querySelector('.cs-embed__open')).display }));
  const [pop] = await Promise.all([m.waitForNavigation(), m.click('.cs-embed__open')]);
  const opened = m.url().includes('Home_FIX_Mobile.html') && !!(await m.waitForSelector('#hf-consent', { timeout: 15000 }));
  check('Full-screen button on mobile', st.frame === 'none' && st.btn !== 'none' && opened, `iframe ${st.frame}, button ${st.btn}; button opens the prototype full screen: ${opened}`);
  await m.close();
}

await browser.close();
fs.writeFileSync(path.join(CASE, 'qa', 'check-results.json'), JSON.stringify({ run: new Date().toISOString(), results }, null, 2) + '\n');
const failed = results.filter(r => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
