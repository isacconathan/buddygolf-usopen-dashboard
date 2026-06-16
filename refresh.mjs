#!/usr/bin/env node
/* =====================================================================
   refresh.mjs — re-scrape 2026 US Open win odds and rewrite data.js.
   - Pulls the static full-field article boards (DraftKings, Yahoo).
   - Anchors on KNOWN player names (from data.js) and grabs the odds
     token next to each — so it can't mis-attribute a stray number.
   - VALIDATES before writing (sane favourite + >=120 players matched);
     otherwise it ABORTS and leaves data.js untouched. Never writes guesses.
   Run:  node refresh.mjs        (the live site then auto-detects the change)
   ===================================================================== */
import { readFile, writeFile } from 'node:fs/promises';

const SOURCES = [
  'https://dknetwork.draftkings.com/2026/06/14/2026-u-s-open-championship-odds-full-field/',
  'https://sports.yahoo.com/golf/betting/article/2026-us-open-betting-odds-for-every-golfer-to-win-the-years-third-major-at-shinnecock-144045145.html',
];
const strip = s => s.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').toLowerCase();
const toDecimal = tok => {
  let m;
  if ((m = tok.match(/^\+?(\d{3,6})$/)))      return +(m[1]/100 + 1).toFixed(2); // American +650
  if ((m = tok.match(/^(\d{1,4})[-/]1$/)))    return +(+m[1] + 1).toFixed(2);     // 25-1
  return null;
};

async function fetchText(url){
  const r = await fetch(url, { headers:{'user-agent':'Mozilla/5.0 (refresh.mjs odds bot)'} });
  if(!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return (await r.text()).replace(/<[^>]+>/g,' '); // strip tags -> text
}

async function main(){
  const path = new URL('./data.js', import.meta.url);
  const src = await readFile(path,'utf8');

  // canonical player names = existing WIN_FULL keys
  const block = src.match(/const WIN_FULL = \{([\s\S]*?)\n\};/);
  if(!block){ console.error('Could not locate WIN_FULL block.'); process.exit(1); }
  const names = [...block[1].matchAll(/"([^"]+)":\s*[\d.]+/g)].map(m=>m[1]);

  // gather text from sources
  let text = '';
  for(const u of SOURCES){ try{ text += '\n' + await fetchText(u); }
    catch(e){ console.warn('source failed:', e.message); } }
  if(text.length < 2000){ console.error('ABORT: sources unreachable / empty.'); process.exit(2); }
  const hay = strip(text);

  // for each known name, grab the nearest following odds token
  const found = {};
  for(const name of names){
    const n = strip(name);
    const i = hay.indexOf(n);
    if(i < 0) continue;
    const after = hay.slice(i + n.length, i + n.length + 24);
    const m = after.match(/\+?\d{3,6}|\d{1,4}[-/]1/);
    if(!m) continue;
    const dec = toDecimal(m[0].replace('+',''));
    if(dec && dec >= 2 && dec <= 5001) found[name] = dec;
  }

  // validation gates
  const sch = found['Scottie Scheffler'];
  if(!sch || sch < 3 || sch > 12){ console.error(`ABORT: implausible favourite (Scheffler=${sch}).`); process.exit(3); }
  if(Object.keys(found).length < 120){ console.error(`ABORT: only ${Object.keys(found).length} matched (<120).`); process.exit(4); }

  // rewrite WIN_FULL preserving any names we couldn't refresh this run
  const merged = {};
  for(const name of names) merged[name] = found[name] ?? +block[1].match(new RegExp(`"${name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}":\\s*([\\d.]+)`))[1];

  let lines = '';
  const entries = Object.entries(merged);
  for(let k=0;k<entries.length;k+=4){
    lines += '  ' + entries.slice(k,k+4).map(([nm,od])=>`"${nm}":${od.toFixed(2)}`).join(',') + ',\n';
  }
  const newBlock = `const WIN_FULL = {\n${lines}};`;
  const stamp = new Date().toISOString().slice(0,16).replace('T',' ');
  let out = src.replace(/const WIN_FULL = \{[\s\S]*?\n\};/, newBlock)
               .replace(/oddsCapturedAt:\s*"[^"]+"/, `oddsCapturedAt: "${stamp}"`);

  await writeFile(path, out);
  console.log(`OK: refreshed ${Object.keys(found).length} prices · oddsCapturedAt=${stamp}`);
}
main().catch(e=>{ console.error('ERROR', e); process.exit(10); });
