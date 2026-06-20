#!/usr/bin/env node
/**
 * Build step: injects the separate data/ JSON files into the app template,
 * producing the single distributable index.html.
 *
 * Source of truth:
 *   - app/template.html   (the app code, with /*__DATA__*\/ and /*__CARDS__*\/ markers)
 *   - data/questions-core.json, data/questions-master.json, data/objectives.json
 *   - data/cards.json
 *
 * Run:  node build.js
 * Output: index.html
 *
 * No dependencies — plain Node.
 */
const fs = require('fs');
const path = require('path');

const read = p => fs.readFileSync(path.join(__dirname, p), 'utf8');
const readJSON = p => JSON.parse(read(p));

// --- load data ---
const objectives = readJSON('data/objectives.json');
const omap = Object.fromEntries(objectives.map((o, i) => [o, i]));

// Any objective referenced by a question but not in the official list is
// appended on the fly. This keeps every question's badge valid; questions
// whose objective has no matching card simply won't trigger a card (harmless).
function objIndex(obj) {
  if (!(obj in omap)) {
    omap[obj] = objectives.length;
    objectives.push(obj);
  }
  return omap[obj];
}

function packQuestions(recs) {
  // compact array form the engine expects: [domain, objIdx, q, [opts], answerIdx, explanation]
  return recs.map(r => [
    r.domain,
    objIndex(r.objective),
    r.question,
    r.options,
    'ABCD'.indexOf(r.answer),
    r.explanation
  ]);
}

const master = packQuestions(readJSON('data/questions-master.json'));

const sets = {
  master: { name: 'SecAI+ MASTER', desc: master.length + ' original questions · all domains', q: master }
};

// Optional extra pool (e.g. a community-licensed set). Only included if the file exists.
if (fs.existsSync(path.join(__dirname, 'data/questions-core.json'))) {
  const core = packQuestions(readJSON('data/questions-core.json'));
  sets.core = { name: 'STANDART HAVUZ', desc: core.length + ' questions · broad coverage', q: core };
}

// HARD set — tougher, scenario-heavy questions across all four domains
if (fs.existsSync(path.join(__dirname, 'data/questions-hard.json'))) {
  const hard = packQuestions(readJSON('data/questions-hard.json'));
  sets.hard = { name: 'HARD MODE', desc: hard.length + ' tough questions · all domains', q: hard };
}

const DATA = { objs: objectives, sets };

const cards = readJSON('data/cards.json'); // { cards:[...], obj2card:{...} }

const dataJS  = 'const DATA=' + JSON.stringify(DATA) + ';';
const cardsJS = 'const CARDS=' + JSON.stringify(cards.cards) +
                ';\nconst OBJ2CARD=' + JSON.stringify(cards.obj2card) + ';';

// --- inject ---
let html = read('app/template.html');
if (!html.includes('/*__DATA__*/') || !html.includes('/*__CARDS__*/')) {
  console.error('ERROR: template.html is missing /*__DATA__*/ or /*__CARDS__*/ markers');
  process.exit(1);
}
html = html.replace('/*__DATA__*/', dataJS).replace('/*__CARDS__*/', cardsJS);

// --- inject PWA meta + service worker registration ---
if (!html.includes('rel="manifest"')) {
  const pwaHead = '<link rel="manifest" href="manifest.json">\n' +
    '<link rel="apple-touch-icon" href="icon-192.png">\n' +
    '<meta name="apple-mobile-web-app-capable" content="yes">\n' +
    '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n' +
    '<meta name="theme-color" content="#11151a">\n<title>';
  html = html.replace('<title>', pwaHead);
  const swReg = '<script>\nif("serviceWorker" in navigator && location.protocol.startsWith("http")){' +
    'navigator.serviceWorker.register("sw.js").catch(()=>{});}\n</script>\n</body>';
  html = html.replace('</body>', swReg);
}

fs.writeFileSync(path.join(__dirname, 'index.html'), html);
const kb = Math.round(Buffer.byteLength(html) / 1024);
const setInfo = Object.entries(DATA.sets).map(([k, v]) => `${k}:${v.q.length}`).join(' ');
console.log(`✓ Built index.html (${kb} KB) — ${setInfo} cards:${cards.cards.length} objectives:${objectives.length}`);
