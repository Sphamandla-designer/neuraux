// Screenshot every beat and outcome of dist/ into qa/after/, then build
// side-by-side before|after images in qa/compare/ with a pixel-difference figure.
// Usage: node tests/after.js
const fs = require('fs');
const path = require('path');
const { ROOT, fileUrl, launch, logicEval, waitForApp } = require('./helpers');

const MAP = [ // [after id, before screenshot(s)]
  ['entry', ['00-entry']], ['start', ['01-language']], ['summary', ['02-summary']],
  ['before', ['03-before']], ['before_retake', ['04-before_retake']], ['before_ok', ['05-before_ok']], ['install', []],
  ['serial', ['06-serial']], ['serial_retake', ['07-serial_retake']], ['serial_ok', ['08-serial_ok']], ['serial_confirm', []], ['serial_type', []],
  ['compliance', ['09-compliance', '10-upload']], ['reminder', []], ['offline', ['11-offline']],
  ['submitted', ['12-submitted', '13-review']],
  ['o:approved', ['outcome-approved']], ['o:retake', ['outcome-retake']], ['o:rejected', ['outcome-rejected']],
];

(async () => {
  const outDir = path.join(ROOT, 'qa', 'after');
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(fileUrl('dist/Home_FIX_Mobile.html'));
  await waitForApp(page);
  await page.screenshot({ path: path.join(outDir, 'welcome.png') });
  const names = [];
  for (let i = 0; i < MAP.length; i++) {
    const id = MAP[i][0];
    await logicEval(page, 'logic.facJump(arg)', id);
    await page.waitForTimeout(id === 'before_ok' || id === 'serial_ok' ? 300 : 1400);
    const name = String(i).padStart(2, '0') + '-' + id.replace('o:', 'outcome-');
    await page.screenshot({ path: path.join(outDir, name + '.png') });
    names.push([name, MAP[i][1]]);
  }
  // Pixel comparison in the browser (canvas), so no extra libraries are needed.
  const cmpDir = path.join(ROOT, 'qa', 'compare');
  fs.mkdirSync(cmpDir, { recursive: true });
  const rows = [];
  for (const [name, befores] of names) {
    for (const b of befores) {
      const A = 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'qa', 'before', b + '.png')).toString('base64');
      const B = 'data:image/png;base64,' + fs.readFileSync(path.join(outDir, name + '.png')).toString('base64');
      const res = await page.evaluate(async ([a, b]) => {
        const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = src; });
        const [ia, ib] = await Promise.all([load(a), load(b)]);
        const w = ia.width, h = ia.height;
        const c = document.createElement('canvas'); c.width = w * 2 + 12; c.height = h;
        const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, h);
        x.drawImage(ia, 0, 0); x.drawImage(ib, w + 12, 0);
        const da = x.getImageData(0, 0, w, h).data, db = x.getImageData(w + 12, 0, w, h).data;
        let diff = 0;
        for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 30) diff++;
        // Header + progress strip (top 86px) and input bar (bottom 52px): the frame that must stay the same.
        let fd = 0, ft = 0;
        for (let y = 0; y < h; y++) { if (y >= 86 && y < h - 52) continue; for (let xx = 0; xx < w; xx++) { const i = (y * w + xx) * 4; ft++; if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 30) fd++; } }
        return { png: c.toDataURL('image/png'), pct: +(100 * diff / (w * h)).toFixed(1), frame: +(100 * fd / ft).toFixed(2) };
      }, [A, B]);
      fs.writeFileSync(path.join(cmpDir, b + '__' + name + '.png'), Buffer.from(res.png.split(',')[1], 'base64'));
      rows.push({ before: b, after: name, changedPixelsPct: res.pct, frameChangedPct: res.frame });
    }
  }
  fs.writeFileSync(path.join(ROOT, 'qa', 'compare', 'summary.json'), JSON.stringify(rows, null, 2));
  console.log(rows.map(r => `${r.before} -> ${r.after}: ${r.changedPixelsPct}% of pixels, frame ${r.frameChangedPct}%`).join('\n'));
  console.log('errors:', errors.length ? errors : 'none');
  await browser.close();
})();
