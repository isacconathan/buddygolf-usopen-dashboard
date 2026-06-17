/* =====================================================================
   BuddyGolf U.S. Open Pick Optimiser — engine + UI
   ---------------------------------------------------------------------
   VALUE MODEL (honest provenance):
   - Real, sourced WIN odds drive everything (see data.js).
   - Top5/Top10/Top20/Make-Cut probabilities are NOT bookmaker quotes
     (those boards weren't machine-readable). They are DERIVED via a
     Plackett-Luce Monte-Carlo simulation of the field from the real win
     odds — a standard ranking model. They are labelled "≈ model" in the
     UI and are user-editable: paste a real number and it overrides.
   - BuddyGolf scoring (incl. the 51+ double-points rule and miss-cut
     penalties) is applied exactly per the official rules.
   ===================================================================== */

const RULES = {
  POS_PTS: {1:20,2:15,3:13,4:10,5:9,6:8,7:7,8:6,9:5,10:4}, // 11-15=3,16-20=2,21-30=1
  doubleThreshold: 51,   // WGR >= 51 (incl. unranked 999) earns DOUBLE points
  missPenalty: (wgr)=> wgr<=10 ? 6 : wgr<=50 ? 3 : 1, // points lost on missed cut
};

const STATE = {
  players: [],
  sims: 12000,
  cutSize: 65,           // US Open: top 60 & ties — modelled at 65
  fillerK: 0.8,          // scales WGR-graded strength of unpriced field
  applyDouble: true,
  applyPenalty: true,
  weights: { value: 70, form: 15, major: 10, course: 5 },
  finish: { win: 12, t5: 11, t10: 9, t20: 4 }, // per-band emphasis for betting-value score
  sort: { key: 'pick', dir: -1 },
  filters: { q:'', band:'all', valuePlays:false, hideGaps:false, minCut:0 },
  team: new Set(),
  selected: null,
  oddsFmt: 'dec',        // 'dec' decimal (41.00) | 'frac' fractional (40/1)
};

/* ---------- helpers ---------- */
const $ = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>[...el.querySelectorAll(s)];
function flipName(lastFirst){           // "DeChambeau, Bryson" -> "Bryson DeChambeau"
  const i = lastFirst.indexOf(',');
  if(i<0) return lastFirst.trim();
  return (lastFirst.slice(i+1).trim()+' '+lastFirst.slice(0,i).trim()).trim();
}
function pct(x){ return x==null? '—' : (x*100).toFixed(x<0.1?1:0)+'%'; }
function num(x,d=1){ return x==null? '—' : x.toFixed(d); }
function dec(x){ return x==null? '—' : x.toFixed(2); }
function gcd(a,b){ return b?gcd(b,a%b):Math.abs(a); }
function decToFrac(d){                 // 41.00 -> "40/1", 2.10 -> "11/10"
  const x=d-1; if(x<=0) return '1/'+Math.max(1,Math.round(1/Math.max(d-1,1e-6)));
  let best=null;
  for(let den=1;den<=20;den++){ const num=Math.round(x*den); if(num<1) continue;
    const err=Math.abs(x-num/den);
    if(!best || err<best.err-1e-9) best={num,den,err}; }
  if(!best) return '1/'+Math.max(1,Math.round(1/x));
  const g=gcd(best.num,best.den)||1; return (best.num/g)+'/'+(best.den/g);
}
function fmtOdds(d){ return d==null?'—':(STATE.oddsFmt==='frac'?decToFrac(d):d.toFixed(2)); }

/* ---------- BuddyGolf scoring ---------- */
function positivePoints(position){
  if(position<=10) return RULES.POS_PTS[position];
  if(position<=15) return 3;
  if(position<=20) return 2;
  if(position<=30) return 1;
  return 0;                              // made cut, outside top 30
}
function buddyPoints(position, wgr){
  if(position>STATE.cutSize){            // missed cut (positional proxy)
    return STATE.applyPenalty ? -RULES.missPenalty(wgr) : 0;
  }
  let pts = positivePoints(position);
  if(STATE.applyDouble && wgr>=RULES.doubleThreshold) pts *= 2;
  return pts;
}

/* ---------- build roster ---------- */
function buildPlayers(){
  const {ROSTER_RAW, DATA} = window.BG;
  STATE.players = ROSTER_RAW.map(([wgr,lf])=>{
    const name = flipName(lf);
    const d = DATA[name] || {};
    return {
      name, wgr,
      odds: d.odds ? {...d.odds} : {win:null,top5:null,top10:null,top20:null,makeCut:null},
      oddsSrc: d.oddsSrc || null,
      form: d.form || null,             // {last5:[{event,pos}], wins, sgRank, read, src}
      history: d.history || null,       // {majorsWon:[], bestUSOpen, top10s, shinnecock, read, src}
      intel: d.intel || null,           // {text, date, src, flag} colour/news note
      override: {},                     // user-pasted real odds {top5:..}
      model: null,                      // filled by computeModel()
    };
  });
}

/* ---------- Plackett-Luce Monte-Carlo ---------- */
// Field-strength prior for players WITHOUT a sourced win price: graded by
// real World Golf Ranking so the cut is competitive & realistic. This only
// shapes the simulated field — these players are still shown as data gaps
// (no displayed value), never assigned invented odds.
function fillerWeight(wgr){
  const w = Math.min(wgr, 900);                 // cap unranked (999)
  return STATE.fillerK / Math.pow(w, 1.1);
}
function computeModel(){
  const P = STATE.players, N = P.length, SIMS = STATE.sims, cut = STATE.cutSize;
  const raw = P.map(p => (p.odds && p.odds.win) ? 1/p.odds.win : fillerWeight(p.wgr));
  const sum = raw.reduce((a,b)=>a+b,0);
  const logw = raw.map(x=>Math.log(x/sum));

  const sumPts=new Float64Array(N), sumP2=new Float64Array(N), cWin=new Float64Array(N), cT5=new Float64Array(N),
        cT10=new Float64Array(N), cT20=new Float64Array(N), cCut=new Float64Array(N);
  const score=new Float64Array(N);
  let order=[...Array(N).keys()];

  for(let s=0;s<SIMS;s++){
    for(let i=0;i<N;i++) score[i]=logw[i]-Math.log(-Math.log(Math.random()));
    order.sort((a,b)=>score[b]-score[a]);
    for(let pos=0;pos<N;pos++){
      const pi=order[pos], position=pos+1;
      if(position===1) cWin[pi]++;
      if(position<=5)  cT5[pi]++;
      if(position<=10) cT10[pi]++;
      if(position<=20) cT20[pi]++;
      if(position<=cut)cCut[pi]++;
      const pp=buddyPoints(position,P[pi].wgr); sumPts[pi]+=pp; sumP2[pi]+=pp*pp;
    }
  }
  P.forEach((p,i)=>{
    const hasOdds = !!(p.odds && p.odds.win);
    const m=sumPts[i]/SIMS;
    p.model = hasOdds ? {
      win:cWin[i]/SIMS, top5:cT5[i]/SIMS, top10:cT10[i]/SIMS,
      top20:cT20[i]/SIMS, makeCut:cCut[i]/SIMS, xPts:m,
      std:Math.sqrt(Math.max(0, sumP2[i]/SIMS - m*m)),  // volatility -> safe/flair
    } : null;
  });
  classifyPlayers();
  computeSubScores();
}

/* effective PROBABILITY for a market (used by sort/filter/engine):
   user override (stored as decimal odds) > real Sportingbet odds > model. */
function eff(p, key){
  if(p.override && p.override[key]!=null) return 1/p.override[key];
  if(p.odds && p.odds[key]!=null) return 1/p.odds[key];
  return p.model ? p.model[key] : null;
}
/* effective DECIMAL ODDS for display (Sportingbet system).
   kind: 'ovr' your odds | 'real' Sportingbet | 'mdl' model-derived | null gap. */
function oddsDisp(p, key){
  if(p.override && p.override[key]!=null) return {odds:p.override[key], kind:'ovr'};
  if(p.odds && p.odds[key]!=null)        return {odds:p.odds[key],     kind:'real'};
  if(p.model && p.model[key]>0)          return {odds:1/p.model[key],  kind:'mdl'};
  return {odds:null, kind:null};
}

/* ---------- sub-scores (0..100) ---------- */
function normalise(arr){ // returns fn mapping value->0..100 via min-max over finite vals
  const v=arr.filter(x=>x!=null && isFinite(x));
  if(!v.length) return ()=>null;
  const lo=Math.min(...v), hi=Math.max(...v);
  return x=> (x==null||!isFinite(x))?null : hi===lo?50 : 100*(x-lo)/(hi-lo);
}
function formRaw(p){
  if(!p.form) return null;
  // map last-5 finishes -> a 0..100 score; lower finishing position = better.
  // 'MC' (missed cut) counts as ~78th; 'WD' (withdrawal) is skipped (not form).
  const f=(p.form.last5||[]).map(r=> r.pos==='MC'?78 : (typeof r.pos==='number'?r.pos:null))
                            .filter(x=>x!=null);
  if(!f.length) return null;                          // honest gap, not guessed
  const avg=f.reduce((a,b)=>a+b,0)/f.length;
  return 100-Math.min(avg,80)/80*100;                 // 1st≈100, 80th≈0
}
function majorRaw(p){
  if(!p.history) return null;
  const h=p.history;
  let s=0;
  s += (h.majorsWon?.length||0)*30;
  if(h.bestUSOpen?.pos) s += Math.max(0, 25-(h.bestUSOpen.pos-1)*1.2);
  s += Math.min((h.top10s||0)*4, 30);
  return s;
}
// Shinnecock-fit index, computed deterministically from VERIFIED facts:
// a real 2018 Shinnecock finish dominates; otherwise lean on US Open pedigree.
function finishScore(pos){ return Math.max(40, 100-9*Math.log2(pos)); } // 1→100,2→91,4→82,10→70
function courseRaw(p){
  if(!p.history) return null;
  const h=p.history, s=h.sh2018;
  const ped = h.bestUSOpen?.pos ? finishScore(h.bestUSOpen.pos)*0.9 : null; // US Open record
  if(typeof s==='number') return Math.max(finishScore(s), ped??0);   // played '18, known finish
  if(s==='field')  return Math.max(55, ped!=null?(55+ped)/2:55);     // made cut, finish unknown
  if(s==='MC')     return ped!=null?Math.min(38,ped):38;             // missed cut at Shinnecock '18
  return ped;                                                        // didn't play '18 -> US Open pedigree (null if none)
}
/* betting-value: expected BuddyGolf-style points from the odds, using the user's
   per-finish-band emphasis (Win/Top5/Top10/Top20). Real place odds where available,
   model-derived otherwise. 51+ doubling & miss-cut penalty applied. This is what
   makes the value reward top-5/10/20 CONTENTION rather than pure winners/cut-makers. */
function bettingRaw(p){
  if(!p.model && !(p.odds&&p.odds.win)) return null;
  const pWin=eff(p,'win')||0, pT5=eff(p,'top5')||0, pT10=eff(p,'top10')||0,
        pT20=eff(p,'top20')||0, pCut=eff(p,'makeCut')||0;
  const w=STATE.finish;
  const bWin=pWin, b5=Math.max(0,pT5-pWin), b10=Math.max(0,pT10-pT5), b20=Math.max(0,pT20-pT10);
  let v = w.win*bWin + w.t5*b5 + w.t10*b10 + w.t20*b20;
  if(STATE.applyDouble && p.wgr>=51) v*=2;             // BuddyGolf 51+ double points
  if(STATE.applyPenalty) v -= RULES.missPenalty(p.wgr)*(1-pCut);
  return v;
}
function computeSubScores(){
  const P=STATE.players;
  const bv=P.map(bettingRaw);
  const nV=normalise(bv), nF=normalise(P.map(formRaw)),
        nM=normalise(P.map(majorRaw)), nC=normalise(P.map(courseRaw));
  P.forEach((p,i)=>{
    p.sub={ value:nV(bv[i]), form:nF(formRaw(p)), major:nM(majorRaw(p)), course:nC(courseRaw(p)) };
  });
}

/* ---------- pick score (slider blend, re-normalised over available cats) ---------- */
function pickScore(p){
  const w=STATE.weights, s=p.sub||{};
  const cats=[['value',s.value],['form',s.form],['major',s.major],['course',s.course]];
  let wsum=0, acc=0, missing=[];
  cats.forEach(([k,v])=>{
    if(v==null){ if(w[k]>0) missing.push(k); return; }
    acc+=w[k]*v; wsum+=w[k];
  });
  if(wsum===0) return {score:null, missing};
  return {score:acc/wsum, missing};
}

/* ===================================================================== */
/*  RENDER                                                               */
/* ===================================================================== */
function render(){
  const tbody=$('#tbody'); tbody.innerHTML='';
  const f=STATE.filters;
  let rows=STATE.players.map(p=>{
    const ps=pickScore(p);
    return {p, pick:ps.score, missing:ps.missing};
  });

  // filters
  rows=rows.filter(({p,pick})=>{
    if(f.q && !p.name.toLowerCase().includes(f.q.toLowerCase())) return false;
    if(f.band==='top50' && p.wgr>50) return false;
    if(f.band==='value' && p.wgr<51) return false;     // 51+ "double points" pool
    if(f.valuePlays && !(p.wgr>=51 && p.model)) return false;
    if(f.hideGaps && !p.model) return false;
    if(f.minCut>0){ const c=eff(p,'makeCut'); if(c==null||c*100<f.minCut) return false; }
    return true;
  });

  // sort
  const k=STATE.sort.key, dir=STATE.sort.dir;
  const keyFn={
    pick:r=>r.pick, xpts:r=>r.p.model?.xPts, win:r=>r.p.odds?.win!=null?(1/r.p.odds.win):null,
    cut:r=>eff(r.p,'makeCut'), t5:r=>eff(r.p,'top5'), t10:r=>eff(r.p,'top10'),
    t20:r=>eff(r.p,'top20'), wgr:r=>r.p.wgr, name:r=>r.p.name,
    form:r=>r.p.sub?.form, major:r=>r.p.sub?.major, course:r=>r.p.sub?.course,
  }[k]||(r=>r.pick);
  rows.sort((a,b)=>{
    let va=keyFn(a), vb=keyFn(b);
    va=(va==null||Number.isNaN(va))?-Infinity:va;
    vb=(vb==null||Number.isNaN(vb))?-Infinity:vb;
    if(k==='name') return dir*String(keyFn(a)).localeCompare(String(keyFn(b)));
    return dir*(va-vb);
  });

  // draw
  rows.forEach((r,i)=>{
    const p=r.p, inTeam=STATE.team.has(p.name);
    const dbl = p.wgr>=51;
    const tr=document.createElement('tr');
    tr.className=(p.selected?'sel ':'')+(inTeam?'in-team ':'')+(!p.model?'gap ':'');
    const probCell=(key)=>{
      const d=oddsDisp(p,key); if(d.odds==null) return '<td class="t gap-c">—</td>';
      const cls=d.kind==='ovr'?'ovr':d.kind==='real'?'real':'mdl';
      const title=d.kind==='real'?'real Sportingbet odds':d.kind==='ovr'?'your odds':'≈ model-derived odds';
      return `<td class="t ${cls}" title="${title}">${d.kind==='mdl'?'≈':''}${fmtOdds(d.odds)}</td>`;
    };
    tr.innerHTML=`
      <td class="rank">${i+1}</td>
      <td class="tm"><input type="checkbox" ${inTeam?'checked':''} data-team="${p.name}"></td>
      <td class="nm">
        <span class="pn">${p.name}</span>
        ${dbl?'<span class="b2x" title="WGR 51+ — earns DOUBLE BuddyGolf points">2×</span>':''}
        ${p.intel?`<span class="bnews ${p.intel.flag==='injury'?'inj':''}" title="${(p.intel.text||'').replace(/"/g,'&quot;')}">${p.intel.flag==='injury'?'⚕':'📋'}</span>`:''}
        ${!p.model?'<span class="bgap" title="No sourced win odds — value cannot be modelled">no market</span>':''}
        ${r.missing&&r.missing.length?`<span class="bmiss" title="Missing data for: ${r.missing.join(', ')} — blend uses available categories only">partial</span>`:''}
      </td>
      <td class="wgr">${p.wgr===999?'—':p.wgr}</td>
      <td class="t">${p.odds?.win?fmtOdds(p.odds.win):'<span class=gap-c>—</span>'}</td>
      ${probCell('top5')}${probCell('top10')}${probCell('top20')}${probCell('makeCut')}
      <td class="xp ${p.model&&p.model.xPts<0?'neg':''}">${p.model?num(p.model.xPts,1):'<span class=gap-c>—</span>'}</td>
      <td class="ps">${r.pick==null?'<span class=gap-c>—</span>':`<div class="psbar"><span style="width:${Math.max(2,r.pick)}%"></span><b>${num(r.pick,0)}</b></div>`}</td>
    `;
    tr.addEventListener('click',e=>{ if(e.target.dataset.team!==undefined)return; openDetail(p); });
    tbody.appendChild(tr);
  });

  $('#shown').textContent=rows.length;
  $$('input[data-team]').forEach(cb=>cb.addEventListener('change',e=>{
    toggleTeam(e.target.dataset.team, e.target.checked);
  }));
  renderTeam();
  paintSortHeaders();
}

function paintSortHeaders(){
  $$('#tbl thead th[data-key]').forEach(th=>{
    th.classList.toggle('sort-on', th.dataset.key===STATE.sort.key);
    const a=th.querySelector('.arr'); if(a) a.textContent=
      th.dataset.key===STATE.sort.key?(STATE.sort.dir<0?'▾':'▴'):'';
  });
}

/* ---------- team builder ---------- */
function toggleTeam(name,on){
  if(on){ if(STATE.team.size>=12 && !STATE.team.has(name)){ flash('Team is full (12). Remove one first.'); render(); return;} STATE.team.add(name);}
  else STATE.team.delete(name);
  render();
}
function renderTeam(){
  const box=$('#teamlist'); box.innerHTML='';
  let total=0, dbls=0, gaps=0;
  [...STATE.team].map(n=>STATE.players.find(p=>p.name===n)).forEach(p=>{
    if(!p) return;
    if(p.model) total+=p.model.xPts; else gaps++;
    if(p.wgr>=51) dbls++;
    const chip=document.createElement('div'); chip.className='chip';
    chip.innerHTML=`<span>${p.name}</span> <b>${p.model?num(p.model.xPts,1):'—'}</b> <i data-rm="${p.name}">✕</i>`;
    box.appendChild(chip);
  });
  $('#tcount').textContent=STATE.team.size;
  $('#ttotal').textContent=total.toFixed(1);
  $('#tdbl').textContent=dbls;
  $('#tgap').textContent=gaps;
  $('#tcount').className=STATE.team.size===12?'ok':STATE.team.size>12?'bad':'';
  $$('#teamlist [data-rm]').forEach(x=>x.addEventListener('click',e=>{
    e.stopPropagation(); toggleTeam(e.target.dataset.rm,false);
  }));
}
function autoPick(){
  const ranked=STATE.players.map(p=>({p,s:pickScore(p).score}))
    .filter(x=>x.s!=null && x.p.model)
    .sort((a,b)=>b.s-a.s);
  STATE.team=new Set(ranked.slice(0,12).map(x=>x.p.name));
  flash('Auto-picked the top 12 by your current weights.');
  render();
}

/* ---------- detail drawer ---------- */
function openDetail(p){
  STATE.players.forEach(x=>x.selected=false); p.selected=true;
  const d=$('#drawer'); d.classList.add('open');
  const m=p.model;
  const oddsRow=(label,key)=>{
    const d = key==='win'
      ? {odds:(p.odds&&p.odds.win!=null)?p.odds.win:null, kind:(p.odds&&p.odds.win!=null)?'real':null}
      : oddsDisp(p,key);
    const prob = key==='win' ? (p.model?p.model.win:null) : eff(p,key);
    const oddsTxt = d.odds==null ? '<span class=gap-c>—</span>'
      : `<span class="${d.kind==='real'?'oreal':d.kind==='ovr'?'oovr':'omdl'}">${d.kind==='mdl'?'≈':''}${fmtOdds(d.odds)}</span>`
        + (d.kind==='real'?' <small>real</small>':d.kind==='ovr'?' <small>yours</small>':' <small>≈model</small>');
    const inputVal = (p.override && p.override[key]!=null)?p.override[key]:'';
    const input = key==='win'
      ? `<input class="ovin" data-k="win" data-odds="1" placeholder="odds e.g.41" value="${p.odds?.win??''}">`
      : `<input class="ovin" data-k="${key}" placeholder="odds" value="${inputVal}">`;
    return `<tr><td>${label}</td><td>${oddsTxt}</td><td>${prob==null?'—':pct(prob)}</td><td>${input}</td></tr>`;
  };
  const form=p.form, hist=p.history;
  d.innerHTML=`
    <button id="dclose">✕</button>
    <h2>${p.name} ${p.wgr>=51?'<span class="b2x">2× points</span>':''}</h2>
    <div class="dmeta">WGR ${p.wgr===999?'unranked':p.wgr}
      · miss-cut penalty <b>${STATE.applyPenalty?('-'+RULES.missPenalty(p.wgr)):'off'}</b>
      ${p.wgr>=51?'· <b>double points on every finish</b>':''}
      ${p.cls?`· ${p.cls==='Flair'?'🎲':'🛡️'} <b>${p.cls} pick</b>${p.flair!=null?` (volatility ${p.flair}/100)`:''}`:''}</div>

    <div class="dcard">
      <h3>📈 Projected BuddyGolf points <span class="hx">${m?num(m.xPts,2):'no model'}</span></h3>
      <p class="fine">Expected points from a ${STATE.sims.toLocaleString()}-sim Plackett-Luce model built on the real win odds, with the 51+ doubling & miss-cut penalty applied.</p>
      <table class="dt">
        <tr><th>Market</th><th>Sportingbet odds</th><th>Implied %</th><th>Your odds</th></tr>
        ${oddsRow('Win','win')}
        ${oddsRow('Top 5','top5')}
        ${oddsRow('Top 10','top10')}
        ${oddsRow('Top 20','top20')}
        ${oddsRow('Make cut','makeCut')}
      </table>
      <p class="src">Win odds source: ${p.oddsSrc||'<span class=gap-c>none — value not modelled</span>'}</p>
    </div>

    ${p.intel? `<div class="dcard" style="border-color:${p.intel.flag==='injury'?'var(--red)':'var(--line)'}">
      <h3>📋 Intel &amp; news</h3>
      <p>${p.intel.flag==='injury'?'⚕️ ':''}${p.intel.text}</p>
      <p class="src">${p.intel.date||''}${p.intel.src?(' · '+p.intel.src):''}</p></div>` : ''}

    <div class="dcard">
      <h3>🔥 Season form <span class="hx">${p.sub?.form!=null?num(p.sub.form,0):'—'}</span></h3>
      ${form? `<p>${form.read||''}</p>
        <p class="fine">Last 5: ${(form.last5||[]).map(r=>`${r.event||''} <b>${r.pos}</b>`).join(' · ')||'—'}
        ${form.wins?` · <b>${form.wins}</b> win(s) 2026`:''}${form.sgRank?` · SG rank ${form.sgRank}`:''}</p>
        <p class="src">Source: ${form.src||'—'}</p>`
        : `<p class="gap-c">No verified 2026 form yet — gap (not guessed).</p>`}
    </div>

    <div class="dcard">
      <h3>🏆 Major pedigree <span class="hx">${p.sub?.major!=null?num(p.sub.major,0):'—'}</span>
        &nbsp;⛳ Shinnecock fit <span class="hx">${p.sub?.course!=null?num(p.sub.course,0):'—'}</span></h3>
      ${hist? `<p>${hist.read||''}</p>
        <p class="fine">Majors: <b>${(hist.majorsWon||[]).map(w=>w.name+' '+w.year).join(', ')||'none'}</b>
        · Best U.S. Open: ${hist.bestUSOpen?(hist.bestUSOpen.pos+' ('+hist.bestUSOpen.year+')'):'—'}
        · Major top-10s: ${hist.top10s??'—'}</p>
        <p class="fine">Shinnecock: ${hist.shinnecock||'—'}</p>
        <p class="src">Source: ${hist.src||'—'}</p>`
        : `<p class="gap-c">No verified major/Shinnecock history yet — gap (not guessed).</p>`}
    </div>
  `;
  $('#dclose').onclick=()=>{ d.classList.remove('open'); p.selected=false; render(); };
  $$('.ovin',d).forEach(inp=>inp.addEventListener('change',e=>{
    const k=e.target.dataset.k, val=parseFloat(e.target.value);
    if(e.target.dataset.odds){                       // win-odds entry (decimal) -> activates model
      if(e.target.value===''){ p.odds.win=null; p.oddsSrc='(cleared)'; }
      else if(!Number.isNaN(val)&&val>1){ p.odds.win=val; p.oddsSrc='✎ your manual entry'; }
      flash('Re-simulating field with your odds…'); recalcAll(); openDetail(p); return;
    }
    if(e.target.value===''){ delete p.override[k]; }
    else if(!Number.isNaN(val) && val>1) p.override[k]=val;   // store decimal odds (Sportingbet system)
    computeSubScores(); render(); openDetail(p);
  }));
  render();
}

/* ---------- misc UI ---------- */
let flashT;
function flash(msg){
  const f=$('#flash'); f.textContent=msg; f.classList.add('show');
  clearTimeout(flashT); flashT=setTimeout(()=>f.classList.remove('show'),2600);
}
function recalcAll(){
  $('#calc').classList.add('on');
  setTimeout(()=>{ computeModel(); render(); $('#calc').classList.remove('on'); },20);
}

/* ---------- live odds auto-refresh ---------- */
const REFRESH = { on:true, everyMs:5*60*1000, timer:null, lastCheck:null };
async function checkForNewData(manual){
  REFRESH.lastCheck=Date.now(); updateDataCard();
  let remote=null, reachable=false;
  try{
    const r=await fetch('data.js?cb='+Date.now(),{cache:'no-store'});
    if(r.ok){ reachable=true; const t=await r.text();
      const m=t.match(/oddsCapturedAt:\s*"([^"]+)"/); remote=m?m[1]:null; }
  }catch(e){ reachable=false; }
  const cur=window.BG.FIELD_META.oddsCapturedAt;
  if(remote && remote!==cur) showUpdateBanner(remote);
  else if(manual) flash(reachable ? 'Odds are current ('+cur+').'
    : 'This is the local file — open the live site for live odds: isacconathan.github.io/buddygolf-usopen-dashboard');
  updateDataCard(); return remote;
}
function showUpdateBanner(remote){
  let b=document.getElementById('updbar');
  if(!b){ b=document.createElement('div'); b.id='updbar'; document.body.appendChild(b); }
  b.innerHTML=`🆕 New odds available (captured ${remote}) — <button id="loadnew">Load them</button>`;
  b.classList.add('show');
  document.getElementById('loadnew').onclick=()=>location.reload();
}
function setAutoRefresh(on){
  REFRESH.on=on;
  if(REFRESH.timer){ clearInterval(REFRESH.timer); REFRESH.timer=null; }
  if(on) REFRESH.timer=setInterval(()=>checkForNewData(false), REFRESH.everyMs);
  updateDataCard();
}
function agoStr(t){ if(!t)return 'not yet'; const s=Math.round((Date.now()-t)/1000);
  return s<60?s+'s ago':Math.round(s/60)+'m ago'; }
const LIVE_URL = "https://isacconathan.github.io/buddygolf-usopen-dashboard/";
function updateDataCard(){
  const el=$('#dataInfo'); if(!el) return;
  const local = location.protocol === 'file:';
  el.innerHTML=`Odds captured <b>${window.BG.FIELD_META.oddsCapturedAt}</b><br>`
    + (local
        ? `<span style="color:var(--gold)">ℹ︎ You're viewing a local file — auto-refresh only runs on the <a href="${LIVE_URL}" target="_blank" style="color:var(--grn)">live site ↗</a>.</span>`
        : `Auto-check ${REFRESH.on?'<b style="color:var(--grn)">on</b>':'<span style="color:var(--mut)">off</span>'} · checked ${agoStr(REFRESH.lastCheck)}`);
}

/* =====================================================================
   STRATEGY LAB — optimal # of double-points players & safe:flair ratio.
   Tournament Monte-Carlo: each sim draws a full-field finish, scores
   BuddyGolf points, and counts a "win" when your team tops a rival field.
   ===================================================================== */
function classifyPlayers(){
  const P=STATE.players;
  // boom/bust = high volatility RELATIVE to expectation (coeff. of variation)
  // + a low make-cut floor. Favourites have high ceiling but a high floor too,
  // so they read as Safe; volatile longshots read as Flair.
  const cov=P.map(p=>p.model? p.model.std/(Math.abs(p.model.xPts)+1) : null);
  const nCov=normalise(cov);
  P.forEach((p,i)=>{
    if(!p.model){ p.flair=null; p.cls=null; return; }
    const lowFloor=(1-p.model.makeCut)*100;
    p.flair=Math.round(Math.min(100, 0.6*(nCov(cov[i])||0) + 0.4*lowFloor));
  });
  const vals=P.filter(p=>p.flair!=null).map(p=>p.flair).sort((a,b)=>a-b);
  const med=vals.length?vals[Math.floor(vals.length/2)]:50;
  P.forEach(p=>{ if(p.flair!=null) p.cls = p.flair>=med ? 'Flair':'Safe'; });
}

const STRAT={ ran:false, res:null, M:2500, opp:7 };
function weightedSampleTeam(pool, weights, k){
  const chosen=[], used=new Set();
  while(chosen.length<k){
    let tot=0; for(const i of pool) if(!used.has(i)) tot+=weights[i];
    let r=Math.random()*tot, pick=-1;
    for(const i of pool){ if(used.has(i))continue; r-=weights[i]; if(r<=0){pick=i;break;} }
    if(pick<0) for(const i of pool) if(!used.has(i)){pick=i;break;}
    used.add(pick); chosen.push(pick);
  }
  return chosen;
}
function bestTeamBy(filterFn, k, otherFn){
  const P=STATE.players, idx=[...P.keys()].filter(i=>P[i].model);
  const sc=i=>pickScore(P[i]).score ?? -1;
  const A=idx.filter(i=>filterFn(P[i])).sort((a,b)=>sc(b)-sc(a));
  const B=idx.filter(i=>otherFn(P[i])).sort((a,b)=>sc(b)-sc(a));
  if(A.length<k || B.length<12-k) return null;
  return A.slice(0,k).concat(B.slice(0,12-k));
}
function runStrategyLab(){
  const P=STATE.players, N=P.length;
  const raw=P.map(p=>(p.odds&&p.odds.win)?1/p.odds.win:fillerWeight(p.wgr));
  const sum=raw.reduce((a,b)=>a+b,0), logw=raw.map(x=>Math.log(x/sum));
  // rivals are SHARP: sample heavily toward high-value players (cubed weight) so
  // the field clusters near the EV frontier -> upside/variance is what separates.
  const pop=P.map(p=>p.model?Math.pow(Math.max(0.5,(pickScore(p).score||0)),3):0);
  const modelled=[...P.keys()].filter(i=>P[i].model);
  const isDouble=p=>p.wgr>=51, isTop=p=>p.wgr<51, isFlair=p=>p.cls==='Flair', isSafe=p=>p.cls==='Safe';
  const dTeams={}, fTeams={};
  for(let k=0;k<=12;k++){ dTeams[k]=bestTeamBy(isDouble,k,isTop); fTeams[k]=bestTeamBy(isFlair,k,isSafe); }
  const opps=[]; for(let o=0;o<STRAT.opp;o++) opps.push(weightedSampleTeam(modelled,pop,12));
  const dWin={},dPts={},fWin={},fPts={}; for(let k=0;k<=12;k++){dWin[k]=0;dPts[k]=0;fWin[k]=0;fPts[k]=0;}
  const score=new Float64Array(N), pts=new Float64Array(N); let order=[...Array(N).keys()];
  const tot=t=>{let s=0;for(const i of t)s+=pts[i];return s;};
  for(let s=0;s<STRAT.M;s++){
    for(let i=0;i<N;i++) score[i]=logw[i]-Math.log(-Math.log(Math.random()));
    order.sort((a,b)=>score[b]-score[a]);
    for(let pos=0;pos<N;pos++){ const pi=order[pos]; pts[pi]=buddyPoints(pos+1,P[pi].wgr); }
    let maxOpp=-1e9;
    for(let o=0;o<opps.length;o++){ const v=tot(opps[o]); if(v>maxOpp)maxOpp=v; }
    for(let k=0;k<=12;k++){
      if(dTeams[k]){ const v=tot(dTeams[k]); dPts[k]+=v; if(v>maxOpp)dWin[k]++; }
      if(fTeams[k]){ const v=tot(fTeams[k]); fPts[k]+=v; if(v>maxOpp)fWin[k]++; }
    }
  }
  const pack=(teams,win,pt)=>{const o=[];for(let k=0;k<=12;k++){if(!teams[k])continue;
    o.push({k,win:win[k]/STRAT.M,pts:pt[k]/STRAT.M,team:teams[k]});}return o;};
  STRAT.res={ doubles:pack(dTeams,dWin,dPts), flair:pack(fTeams,fWin,fPts),
    nDouble:modelled.filter(i=>isDouble(P[i])).length,
    nFlair:modelled.filter(i=>isFlair(P[i])).length, nSafe:modelled.filter(i=>isSafe(P[i])).length };
  STRAT.ran=true;
}
function sbar(label, frac, txt, best){
  return `<div class="sbar ${best?'best':''}"><span class="sb-l">${label}</span>
    <div class="sb-t"><span style="width:${Math.max(2,frac*100)}%"></span></div><span class="sb-v">${txt}</span></div>`;
}
function renderStrategyLab(){
  const el=$('#labBody'); if(!el) return;
  if(!STRAT.ran){ el.innerHTML='<p class="fine">⛳ Simulating '+STRAT.M.toLocaleString()+' tournaments…</p>'; return; }
  const r=STRAT.res;
  const dBest=r.doubles.reduce((a,b)=>b.win>a.win?b:a), fBest=r.flair.reduce((a,b)=>b.win>a.win?b:a);
  const mD=Math.max(...r.doubles.map(x=>x.win)), mF=Math.max(...r.flair.map(x=>x.win));
  const dBars=r.doubles.map(x=>sbar(x.k+(x.k===1?' double':' doubles'), x.win/mD,
    (x.win*100).toFixed(1)+'% win · '+x.pts.toFixed(0)+' pts', x===dBest)).join('');
  const fBars=r.flair.map(x=>sbar((12-x.k)+' safe / '+x.k+' flair', x.win/mF,
    (x.win*100).toFixed(1)+'% win', x===fBest)).join('');
  el.innerHTML=`<div class="labgrid">
    <div class="labcard">
      <h3>🎯 Optimal double-points players</h3>
      <p class="fine">Win-rate of your best 12 vs a ${STRAT.opp}-rival field over ${STRAT.M.toLocaleString()} simulated tournaments, by how many WGR 51+ (2×) players you carry.</p>
      ${dBars}
      <p class="rec">Sweet spot: <b>${dBest.k} double-points pick${dBest.k===1?'':'s'}</b> — best win rate ${(dBest.win*100).toFixed(1)}%. (${r.nDouble} doubles available.)</p>
      <button class="btn primary" id="useDoubles">⚡ Load this ${dBest.k}-double team</button>
    </div>
    <div class="labcard">
      <h3>⚖️ Safe : Flair sweet spot</h3>
      <p class="fine">Same sim, varying how many high-variance "flair" picks (vs steady "safe" picks) you carry. Flair = boom/bust (volatile scoring, low floor); Safe = reliable.</p>
      ${fBars}
      <p class="rec">Sweet spot: <b>${12-fBest.k} safe : ${fBest.k} flair</b> — win rate ${(fBest.win*100).toFixed(1)}%. (Field: ${r.nSafe} safe / ${r.nFlair} flair.)</p>
      <button class="btn" id="useFlair">Load this ${12-fBest.k}-safe / ${fBest.k}-flair team</button>
    </div></div>
    <p class="fine" style="margin-top:12px">Method: each sim draws a whole-field finish from the same Plackett-Luce model, scores BuddyGolf points (incl. 51+ doubling &amp; miss-cut penalty), and logs a win when your team tops a popularity-weighted ${STRAT.opp}-rival field. Opponents assumed independent — treat as directional. Re-run after changing odds or the sliders.</p>`;
  $('#useDoubles').onclick=()=>{ STATE.team=new Set(dBest.team.map(i=>STATE.players[i].name)); switchView('board'); flash('Loaded the optimal '+dBest.k+'-double team.'); };
  $('#useFlair').onclick=()=>{ STATE.team=new Set(fBest.team.map(i=>STATE.players[i].name)); switchView('board'); flash('Loaded the '+fBest.k+'-flair team.'); };
}
/* ---------- Differentials: lower-owned value to separate from the field ---------- */
function renderDifferentials(){
  const el=$('#diffBody'); if(!el) return;
  const P=STATE.players;
  const nOwn=normalise(P.map(p=>p.model?1/p.odds.win:null));   // chalk proxy: public backs favourites
  const rows=P.filter(p=>p.model && p.sub && p.sub.value!=null).map(p=>{
    const own=nOwn(1/p.odds.win)||0; return {p, own, diff:(p.sub.value-own)};
  }).sort((a,b)=>b.diff-a.diff).slice(0,24);
  el.innerHTML=`
    <p class="fine">Lower-owned players the model still rates — taking 1–2 separates you from a chalk-heavy field (and matters more the bigger your pool). "Chalk" is a proxy from win odds (the public backs favourites); "Value" is your betting-value score under the current sliders; <b>Diff = Value − Chalk</b>.</p>
    <table class="difft"><thead><tr><th>#</th><th class="l">Player</th><th>WGR</th><th>Win</th><th>Top 10</th><th>Value</th><th>Chalk</th><th>Diff ⬆</th><th>Type</th></tr></thead><tbody>
    ${rows.map((r,i)=>{ const p=r.p, t10=oddsDisp(p,'top10');
      return `<tr data-name="${p.name.replace(/"/g,'&quot;')}"><td class="rank">${i+1}</td>
        <td class="l nm"><span class="pn">${p.name}</span>${p.wgr>=51?' <span class="b2x">2×</span>':''}${p.intel?` <span class="bnews ${p.intel.flag==='injury'?'inj':''}">${p.intel.flag==='injury'?'⚕':'📋'}</span>`:''}</td>
        <td class="mut">${p.wgr===999?'—':p.wgr}</td>
        <td class="t">${fmtOdds(p.odds.win)}</td>
        <td class="t mdl">${t10.odds?(t10.kind==='mdl'?'≈':'')+fmtOdds(t10.odds):'—'}</td>
        <td>${num(p.sub.value,0)}</td><td class="mut">${num(r.own,0)}</td>
        <td class="xp">${num(r.diff,0)}</td>
        <td>${p.cls==='Flair'?'🎲':'🛡️'} ${p.cls||''}</td></tr>`;}).join('')}
    </tbody></table>`;
  $$('#diffBody tr[data-name]').forEach(tr=>tr.addEventListener('click',()=>openDetail(P.find(p=>p.name===tr.dataset.name))));
}
/* ---------- My 12: team sheet with the case for each pick ---------- */
function buildOptimalSquad(){
  if(!STRAT.ran) runStrategyLab();
  const dBest=STRAT.res.doubles.reduce((a,b)=>b.win>a.win?b:a);
  STATE.team=new Set(dBest.team.map(i=>STATE.players[i].name));
  return dBest.k;
}
function rationale(p){
  const out=[];
  const t5=Math.round((eff(p,'top5')||0)*100), t10=Math.round((eff(p,'top10')||0)*100), cut=Math.round((eff(p,'makeCut')||0)*100);
  if(p.wgr>=51) out.push('💰 <b>Double-points play</b> (WGR '+p.wgr+') — every finishing point counts 2× and a missed cut is only −1. Best risk/reward in BuddyGolf, so the strategy leans on a few of these.');
  else if(p.wgr<=10) out.push('⭐ <b>Elite anchor</b> (WGR '+p.wgr+') — '+t10+'% to finish top-10. ⚠ But top-10-ranked: a missed cut costs <b>−6</b>, so he has to contend, not just survive.');
  else out.push('<b>Mid-tier value</b> (WGR '+p.wgr+') — '+t10+'% top-10; a missed cut costs −3.');
  out.push('📊 Market: '+fmtOdds(p.odds.win)+' to win · ≈'+t5+'% top-5 · '+t10+'% top-10 · '+cut+'% to make the cut.');
  if(p.intel && p.intel.flag==='injury') out.push('⚕ <b>Watch:</b> '+p.intel.text);
  else if(p.history && typeof p.history.sh2018==='number' && p.history.sh2018<=20) out.push('⛳ Shinnecock 2018: finished '+p.history.sh2018+' — proven on this exact course.');
  else if(p.form && /hot|win/i.test(p.form.read||'')) out.push('🔥 '+p.form.read);
  else if(p.history && p.history.majorsWon && p.history.majorsWon.length) out.push('🏆 Pedigree: '+p.history.majorsWon.map(w=>w.name+' '+w.year).join(', ')+'.');
  else if(p.intel) out.push('📋 '+p.intel.text);
  out.push((p.cls==='Flair'?'🎲 <b>Flair</b> — ceiling/variance to separate from the field.':'🛡️ <b>Safe</b> — high floor to protect your score.'));
  return out;
}
function squadCard(p){
  const pen=RULES.missPenalty(p.wgr);
  return `<div class="scard ${p.intel&&p.intel.flag==='injury'?'inj':''}" data-name="${p.name.replace(/"/g,'&quot;')}">
    <div class="sc-h">
      <div><span class="sc-n">${p.name}</span>${p.wgr>=51?' <span class="b2x">2×</span>':''}<span class="sc-cls">${p.cls==='Flair'?'🎲 Flair':'🛡️ Safe'}</span></div>
      <div class="sc-x">${p.model?num(p.model.xPts,1):'—'}<small>proj pts</small></div>
    </div>
    <div class="sc-meta">WGR ${p.wgr===999?'—':p.wgr} · win ${fmtOdds(p.odds.win)} · miss-cut <b class="${pen>=6?'bad':''}">−${pen}</b></div>
    <ul class="sc-why">${rationale(p).map(x=>'<li>'+x+'</li>').join('')}</ul>
  </div>`;
}
function renderSquad(){
  const el=$('#squadBody'); if(!el) return;
  if(STATE.team.size!==12) buildOptimalSquad();
  const squad=[...STATE.team].map(n=>STATE.players.find(p=>p.name===n)).filter(Boolean)
    .sort((a,b)=>(b.model?.xPts??-99)-(a.model?.xPts??-99));
  let total=0,dbl=0,safe=0,flair=0,topRisk=0;
  squad.forEach(p=>{ if(p.model)total+=p.model.xPts; if(p.wgr>=51)dbl++;
    if(p.cls==='Flair')flair++; else if(p.cls==='Safe')safe++; if(p.wgr<=10)topRisk++; });
  el.innerHTML=`
    <div class="squadsum">
      <div class="kpi"><b>${total.toFixed(1)}</b><span>Proj. points</span></div>
      <div class="kpi"><b>${dbl}</b><span>2× doubles</span></div>
      <div class="kpi"><b>${safe}/${flair}</b><span>safe / flair</span></div>
      <div class="kpi"><b>${topRisk}</b><span>−6 risk picks</span></div>
    </div>
    <p class="fine">Built to the Strategy Lab plan: <b>${dbl} double-points players</b> for 2× upside at only −1 downside, a high-floor safe core, and lower-owned differentials. Reminder: a <b>top-10-ranked player who misses the cut is −6</b>, so the favourites below must contend — the WGR 51+ picks only risk −1. Click any card for the full dossier.</p>
    <div class="squadgrid">${squad.map(squadCard).join('')}</div>
    <div style="margin-top:14px"><button class="btn primary" id="rebuildSquad" style="max-width:260px">⚡ Re-build strategy-optimal 12</button></div>`;
  $('#rebuildSquad').onclick=()=>{ STATE.team.clear(); renderSquad(); };
  $$('#squadBody .scard[data-name]').forEach(c=>c.addEventListener('click',e=>{
    if(e.target.tagName==='BUTTON')return; openDetail(STATE.players.find(p=>p.name===c.dataset.name)); }));
}

const cap=s=>s[0].toUpperCase()+s.slice(1);
function switchView(v){
  ['board','lab','diff','team'].forEach(x=>{
    $('#view'+cap(x)).style.display = v===x?'':'none';
    $('#tab'+cap(x)).classList.toggle('on', v===x);
  });
  if(v==='board') render();
  else if(v==='lab'){ if(!STRAT.ran){ renderStrategyLab(); setTimeout(()=>{ runStrategyLab(); renderStrategyLab(); },30); } else renderStrategyLab(); }
  else if(v==='diff') renderDifferentials();
  else if(v==='team') renderSquad();
}
function updateFmtBtn(){ const b=$('#oddsFmtBtn'); if(b) b.textContent='Odds: '+(STATE.oddsFmt==='dec'?'Decimal':'Fractional'); }

/* ---------- wire up ---------- */
function init(){
  buildPlayers();
  window.BG.FIELD_META.lastUpdated=new Date().toISOString().slice(0,16).replace('T',' ');
  $('#meta').innerHTML=`<b>${window.BG.FIELD_META.event}</b> · ${window.BG.FIELD_META.course}
    · ${window.BG.FIELD_META.dates} · field ${STATE.players.length}`;

  // sliders
  const ws=[['wValue','value'],['wForm','form'],['wMajor','major'],['wCourse','course']];
  ws.forEach(([id,key])=>{
    const el=$('#'+id);
    el.value=STATE.weights[key];
    $('#'+id+'v').textContent=STATE.weights[key];
    el.addEventListener('input',()=>{ STATE.weights[key]=+el.value; $('#'+id+'v').textContent=el.value; render(); });
  });
  // finish-emphasis sub-sliders (shape the betting-value score)
  [['fWin','win'],['fT5','t5'],['fT10','t10'],['fT20','t20']].forEach(([id,key])=>{
    const el=$('#'+id); el.value=STATE.finish[key]; $('#'+id+'v').textContent=STATE.finish[key];
    el.addEventListener('input',()=>{ STATE.finish[key]=+el.value; $('#'+id+'v').textContent=el.value;
      computeSubScores(); render(); });
  });
  // toggles
  $('#tgDouble').checked=STATE.applyDouble;
  $('#tgPenalty').checked=STATE.applyPenalty;
  $('#tgDouble').addEventListener('change',e=>{STATE.applyDouble=e.target.checked;recalcAll();});
  $('#tgPenalty').addEventListener('change',e=>{STATE.applyPenalty=e.target.checked;recalcAll();});
  // filters
  $('#q').addEventListener('input',e=>{STATE.filters.q=e.target.value;render();});
  $('#band').addEventListener('change',e=>{STATE.filters.band=e.target.value;render();});
  $('#valuePlays').addEventListener('change',e=>{STATE.filters.valuePlays=e.target.checked;render();});
  $('#hideGaps').addEventListener('change',e=>{STATE.filters.hideGaps=e.target.checked;render();});
  $('#minCut').addEventListener('input',e=>{STATE.filters.minCut=+e.target.value;$('#minCutv').textContent=e.target.value+'%';render();});
  // sort headers
  $$('#tbl thead th[data-key]').forEach(th=>th.addEventListener('click',()=>{
    const k=th.dataset.key;
    if(STATE.sort.key===k) STATE.sort.dir*=-1;
    else { STATE.sort.key=k; STATE.sort.dir = k==='name'||k==='wgr'?1:-1; }
    render();
  }));
  // team buttons
  $('#autopick').addEventListener('click',autoPick);
  $('#clearteam').addEventListener('click',()=>{STATE.team.clear();render();});
  // live odds auto-refresh
  $('#tgAuto').checked=REFRESH.on;
  $('#tgAuto').addEventListener('change',e=>setAutoRefresh(e.target.checked));
  $('#refreshBtn').addEventListener('click',()=>checkForNewData(true));
  setAutoRefresh(REFRESH.on); updateDataCard();
  // view tabs + odds-format toggle
  $('#tabBoard').addEventListener('click',()=>switchView('board'));
  $('#tabLab').addEventListener('click',()=>switchView('lab'));
  $('#tabDiff').addEventListener('click',()=>switchView('diff'));
  $('#tabTeam').addEventListener('click',()=>switchView('team'));
  $('#oddsFmtBtn').addEventListener('click',()=>{ STATE.oddsFmt=STATE.oddsFmt==='dec'?'frac':'dec'; updateFmtBtn(); render(); });
  updateFmtBtn();
  $('#rerunLab').addEventListener('click',()=>{ STRAT.ran=false; renderStrategyLab();
    setTimeout(()=>{ runStrategyLab(); renderStrategyLab(); },30); });
  $('#rivals').addEventListener('input',e=>{ STRAT.opp=+e.target.value; $('#rivalsv').textContent=e.target.value; });
  $('#rivals').addEventListener('change',()=>{ STRAT.ran=false; renderStrategyLab();
    setTimeout(()=>{ runStrategyLab(); renderStrategyLab(); },30); });

  recalcAll();
}
document.addEventListener('DOMContentLoaded',init);
