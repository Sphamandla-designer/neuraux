// Screenshot every beat and outcome of a build into qa/<dir>/.
// Usage: node tests/baseline.js original/Home_FIX_Mobile.html qa/before
const fs = require('fs');
const path = require('path');
const { ROOT, fileUrl, launch, logicEval, waitForApp } = require('./helpers');

(async () => {
  const [rel, outRel, hash] = process.argv.slice(2);
  const out = path.join(ROOT, outRel);
  fs.mkdirSync(out, { recursive: true });
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(fileUrl(rel, hash || ''));
  await waitForApp(page);
  const ids = await logicEval(page, 'return logic.beatList().map(b => b.id)');
  for (let i = 0; i < ids.length; i++) {
    await logicEval(page, 'logic.jumpTo(arg)', i);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(out, String(i).padStart(2, '0') + '-' + ids[i] + '.png') });
  }
  const outs = await logicEval(page, 'return Object.keys(logic.outcomes())');
  for (const o of outs) {
    await logicEval(page, 'logic.showOutcome(arg)', o);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(out, 'outcome-' + o + '.png') });
  }
  console.log('beats', ids.length, 'outcomes', outs.length, 'errors', errors.length, errors);
  await browser.close();
})();
