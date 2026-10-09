// Render the flow diagram from the conversation design spec to a static SVG.
//
//   MERMAID_JS=/path/to/node_modules/mermaid/dist/mermaid.min.js node case-studies/home-fix/tools/diagram.mjs
//
// Reads the ```mermaid block in projects/home-fix/docs/conversation-design-spec.md (section 5),
// renders it with Mermaid in headless Chromium, using the NeuraUX dark-canvas colours, and
// writes case-studies/home-fix/assets/diagrams/flow.svg. Get Mermaid with `npm i mermaid`
// in any folder outside the repo and point MERMAID_JS at it. Safe to re-run.
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
const SPEC = path.join(REPO, 'projects', 'home-fix', 'docs', 'conversation-design-spec.md');
const OUT = path.join(CASE, 'assets', 'diagrams');
let mermaidJs = process.env.MERMAID_JS;
if (!mermaidJs) { try { mermaidJs = require.resolve('mermaid/dist/mermaid.min.js'); } catch { /* below */ } }
if (!mermaidJs || !fs.existsSync(mermaidJs)) { console.error('Set MERMAID_JS to mermaid/dist/mermaid.min.js (npm i mermaid outside the repo).'); process.exit(1); }

const spec = fs.readFileSync(SPEC, 'utf8');
const m = spec.match(/```mermaid\n([\s\S]*?)```/);
if (!m) { console.error('No mermaid block in the spec'); process.exit(1); }
const source = m[1].trim();

const browser = await pw.chromium.launch();
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body><div id="out"></div></body></html>');
await page.addScriptTag({ path: mermaidJs });
const svg = await page.evaluate(async (src) => {
  window.mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    flowchart: { htmlLabels: false, curve: 'basis', nodeSpacing: 28, rankSpacing: 42, padding: 10 },
    themeVariables: {
      fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      fontSize: '14px',
      background: '#0A0A0A',
      primaryColor: '#141414',
      primaryTextColor: '#FFFFFF',
      primaryBorderColor: '#333333',
      secondaryColor: '#1F1F1F',
      tertiaryColor: '#141414',
      lineColor: '#999999',
      textColor: '#FFFFFF',
      edgeLabelBackground: '#0A0A0A',
      clusterBkg: '#141414',
    },
    themeCSS: [
      '.node rect, .node polygon, .node circle { stroke-width: 1px; }',
      '.node polygon { fill: #1F1F1F; stroke: #C7CBD1; }',
      '.edgeLabel rect, .labelBkg { fill: #0A0A0A; opacity: 1; }',
      '.edgeLabel text, .edgeLabel tspan { fill: #999999; }',
      '.flowchart-link { stroke: #666666; }',
      'marker path { fill: #999999; stroke: #999999; }',
    ].join('\n'),
  });
  const { svg } = await window.mermaid.render('home-fix-flow', src);
  return svg;
}, source);
await browser.close();

// Accessible title, and a background that matches the page canvas.
let out = svg
  .replace(/<svg([^>]*)>/, (all, attrs) => `<svg${attrs.replace(/\s(role|aria-roledescription)="[^"]*"/g, '')} role="img" aria-labelledby="flow-title flow-desc"><title id="flow-title">Home FIX conversation flow</title><desc id="flow-desc">From welcome and language choice, through the before photo, the installation, the serial label check and confirmation, the four compliance photos, a signal drop and submission, to the review outcomes: approved, retake or needs assistance. A person can be reached from any step.</desc>`);
// Fixed intrinsic size from the viewBox, so it works as an <img> with width and height set.
const [, , vbW, vbH] = out.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
out = out.replace(/<svg([^>]*?)\swidth="100%"/, `<svg$1 width="${Math.round(vbW)}" height="${Math.round(vbH)}"`)
  .replace(/\sstyle="max-width:[^"]*"/, '');
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'flow.svg'), out);
const vb = out.match(/viewBox="([^"]+)"/);
console.log('wrote assets/diagrams/flow.svg', (out.length / 1024).toFixed(0) + ' KB', 'viewBox', vb && vb[1]);
