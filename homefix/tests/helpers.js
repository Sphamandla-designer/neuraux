// Shared Playwright helpers for the Home FIX prototype tests.
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const ROOT = path.resolve(__dirname, '..');
const fileUrl = (rel, hash = '') => 'file://' + path.join(ROOT, rel) + (hash ? '#' + hash : '');

async function launch() {
  return chromium.launch();
}

// Reach the component's logic instance through React's fiber tree.
// Test-only: the shipped prototype exposes nothing on window for this.
async function logicEval(page, fnSrc, arg) {
  return page.evaluate(([src, a]) => {
    const root = document.getElementById('dc-root');
    const el = root && root.firstElementChild;
    if (!el) throw new Error('no root');
    const k = Object.keys(el).find(x => x.startsWith('__reactFiber$'));
    let f = el[k];
    while (f && !(f.stateNode && f.stateNode.logic)) f = f.return;
    if (!f) throw new Error('no logic');
    const logic = f.stateNode.logic;
    return new Function('logic', 'arg', src)(logic, a);
  }, [fnSrc, arg]);
}

async function waitForApp(page) {
  await page.waitForSelector('#dc-root > *', { timeout: 15000 });
  await page.waitForTimeout(300);
}

module.exports = { ROOT, fileUrl, launch, logicEval, waitForApp };
