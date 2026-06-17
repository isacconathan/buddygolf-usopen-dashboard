const fs=require('fs'), vm=require('vm');
const code=fs.readFileSync('data.js','utf8')+'\n'+fs.readFileSync('app.js','utf8')+`
;(function(){
  buildPlayers(); computeModel();
  const all=STATE.players;
  const withM=all.filter(p=>p.model);
  console.log('Field size:',all.length,'| with value model:',withM.length,'| data gaps:',all.length-withM.length);
  const ranked=[...withM].sort((a,b)=>b.model.xPts-a.model.xPts);
  console.log('\\n== TOP 15 by Projected Points (xP) ==');
  ranked.slice(0,15).forEach((p,i)=>console.log(
    (i+1+'.').padEnd(4)+p.name.padEnd(21)+'WGR'+String(p.wgr).padStart(4)+
    '  win '+(p.model.win*100).toFixed(1).padStart(4)+'%'+
    '  cut '+(p.model.makeCut*100).toFixed(0).padStart(3)+'%'+
    '  t10 '+(p.model.top10*100).toFixed(0).padStart(3)+'%'+
    '  xP '+p.model.xPts.toFixed(2).padStart(6)));
  console.log('\\n== sanity checks ==');
  const f=n=>all.find(p=>p.name===n);
  const sch=f('Scottie Scheffler');
  console.log('Scheffler make-cut% (expect high ~90+):',(sch.model.makeCut*100).toFixed(1));
  console.log('Scheffler model top5% vs REAL top5 odds 2.10 (=>47.6%):',(sch.model.top5*100).toFixed(1)+'% derived');
  const spieth=f('Jordan Spieth');
  console.log('Spieth WGR51 doubling -> xP',spieth.model.xPts.toFixed(2),'(should benefit vs similar top-50 player)');
  // verify 51+ doubling actually fires: compare a made-cut points calc
  console.log('buddyPoints(8th, wgr=49):',buddyPoints(8,49),' buddyPoints(8th, wgr=51):',buddyPoints(8,51),'(expect 6 vs 12)');
  console.log('buddyPoints(missCut, wgr=5):',buddyPoints(70,5),' wgr=51:',buddyPoints(70,51),'(expect -6 vs -1)');
  const ko=f('Brooks Koepka');
  console.log('Koepka Shinnecock fit (WON 2018 -> expect ~100):',courseRaw(ko).toFixed(0),
              '| major',majorRaw(ko).toFixed(0),'| form',formRaw(ko)?.toFixed(0));
  const mc=f('Rory McIlroy');
  console.log('McIlroy Shinnecock fit (MC 2018 -> expect low ~38):',courseRaw(mc).toFixed(0));
  // probabilities monotonic? win<=top5<=top10<=top20<=cut
  let bad=withM.filter(p=>!(p.model.win<=p.model.top5+1e-9 && p.model.top5<=p.model.top10+1e-9 &&
    p.model.top10<=p.model.top20+1e-9 && p.model.top20<=p.model.makeCut+1e-9));
  console.log('\\nMonotonicity violations (expect 0):',bad.length);
})();
`;
const sandbox={window:{},document:{addEventListener:()=>{},readyState:'loading'},console,Math,Date,Float64Array,Int32Array,Array,Number,String,isFinite,parseFloat,Boolean};
vm.createContext(sandbox); vm.runInContext(code,sandbox);
