/* =====================================================================
   BuddyGolf — 2026 U.S. Open (Shinnecock Hills) data file
   ---------------------------------------------------------------------
   PROVENANCE RULES (per user's "100% factual" requirement):
   - Every odds / stat value here must come from a real, cited source.
   - If a value is unknown/unverified it is left as null  -> the UI shows
     an explicit GAP. We never invent or estimate a data point.
   - `meta.lastUpdated` and per-section `src` fields record provenance.
   ===================================================================== */

const FIELD_META = {
  event: "U.S. Open 2026",
  course: "Shinnecock Hills Golf Club",
  dates: "2026-06-18 – 2026-06-21",
  note: "BuddyGolf app labels the venue 'Oakmont' but the real 2026 U.S. Open "
      + "is at Shinnecock Hills; course-fit is modelled on Shinnecock per user.",
  oddsPrimarySource: "sportingbet.co.za (event 17704600), cross-checked vs news books",
  lastUpdated: null, // set when data load completes
};

/* Full field as (WGR, "Surname, First"). 999 = unranked/qualifier.
   Names are converted to "First Surname" for display by the app. */
const ROSTER_RAW = [
  [1,"Scheffler, Scottie"],[2,"McIlroy, Rory"],[3,"Young, Cameron"],
  [4,"Fitzpatrick, Matt"],[5,"Henley, Russell"],[6,"Fleetwood, Tommy"],
  [7,"Rose, Justin"],[8,"Rahm, Jon"],[9,"Spaun, J.J."],[10,"Morikawa, Collin"],
  [11,"Gotterup, Chris"],[12,"Schauffele, Xander"],[13,"Åberg, Ludvig"],
  [14,"Rai, Aaron"],[15,"Griffin, Ben"],[16,"Thomas, Justin"],
  [17,"MacIntyre, Robert"],[18,"Kim, Si Woo"],[19,"Straka, Sepp"],
  [20,"Noren, Alex"],[21,"Hatton, Tyrrell"],[22,"English, Harris"],
  [23,"Gerard, Ryan"],[24,"Matsuyama, Hideki"],[25,"Bridgeman, Jacob"],
  [26,"Reitan, Kristoffer"],[27,"Reed, Patrick"],[28,"Hovland, Viktor"],
  [29,"Bhatia, Akshay"],[30,"Burns, Sam"],[31,"Kitayama, Kurt"],
  [32,"DeChambeau, Bryson"],[33,"Højgaard, Nicolai"],[34,"Clark, Wyndham"],
  [35,"Lee, Min Woo"],[36,"Cantlay, Patrick"],[37,"McNealy, Maverick"],
  [38,"Poston, J.T."],[39,"Bradley, Keegan"],[40,"Cauley, Bud"],
  [41,"Fowler, Rickie"],[42,"Smalley, Alex"],[43,"Knapp, Jake"],
  [44,"Lowry, Shane"],[45,"Woodland, Gary"],[46,"Berger, Daniel"],
  [47,"Day, Jason"],[48,"Penge, Marco"],[49,"Scott, Adam"],[50,"Kim, Michael"],
  [51,"Spieth, Jordan"],[52,"Echavarria, Nico"],[53,"McCarty, Matt"],
  [54,"Stevens, Sam"],[55,"Fox, Ryan"],[56,"Conners, Corey"],[57,"Puig, David"],
  [58,"Coody, Pierceson"],[59,"Harman, Brian"],[60,"Brennan, Michael"],
  [61,"Novak, Andrew"],[62,"Hisatsune, Ryo"],[63,"Taylor, Nick"],
  [66,"Hall, Harry"],[68,"Greyserman, Max"],[69,"Fitzpatrick, Alex"],
  [70,"Schaper, Jayden"],[71,"Schmid, Matti"],[74,"Im, Sungjae"],
  [75,"Keefer, Johnny"],[80,"Niemann, Joaquin"],[81,"Rodgers, Patrick"],
  [83,"Theegala, Sahith"],[85,"Putnam, Andrew"],[88,"Herbert, Lucas"],
  [96,"Yellamaraju, Sudarshan"],[99,"McGreevy, Max"],[100,"Mitchell, Keith"],
  [102,"Parry, John"],[106,"Kirk, Chris"],[110,"Koepka, Brooks"],
  [115,"Saddier, Adrien"],[116,"Grillo, Emiliano"],[128,"Suber, Jackson"],
  [131,"Mouw, William"],[133,"Roy, Kevin"],[135,"Horschel, Billy"],
  [136,"Smith, Cameron"],[138,"Thompson, Davis"],[141,"Kim, Tom"],
  [151,"Canter, Laurie"],[168,"Dumont de Chassart, Adrien"],
  [172,"Phillips, Chandler"],[181,"Uihlein, Peter"],[184,"Kohles, Ben"],
  [186,"Du Plessis, Hennie"],[188,"Ortiz, Carlos"],[190,"Shipley, Neal"],
  [204,"Blair, Zac"],[214,"Kimsey, Nathan"],[217,"Coussaud, Ugo"],
  [227,"Montgomery, Taylor"],[230,"Dossey, Cooper"],[245,"Johnson, Dustin"],
  [260,"Koivun, Jackson"],[262,"Silverman, Ben"],[275,"Nørgaard, Niklas"],
  [281,"Jordan, Matthew"],[286,"Nicholas, James"],[287,"Surratt, Caleb"],
  [338,"Stanger, Jimmy"],[356,"Higgs, Harry"],[358,"Repetto Taylor, Rocco"],
  [363,"Hammer, Cole"],[364,"Tosti, Alejandro"],[386,"Wu, Dylan"],
  [389,"Oiwa, Ryuichi"],[403,"Sato, Taihei"],[438,"Celli, Filippo"],
  [534,"Rozo, Marcelo"],[546,"Harrington, Padraig"],[571,"Yuan, Carl"],
  [575,"Hardy, Nick"],[703,"Wu, Brandon"],[704,"Van Paris, Jackson"],
  [804,"Onishi, Kaito"],[950,"McDowell, Graeme"],
  [999,"Holmes, J.B."],[999,"Kim, T.K."],[999,"Shah, Manav"],[999,"Lee, Eric"],
  [999,"Tibbits, Spencer"],[999,"James, Ben"],[999,"Sollon, Jake"],
  [999,"Hidalgo, Angel"],[999,"Higgins, Robbie"],[999,"Peacock, Jake"],
  [999,"Russell, Miles"],[999,"Stout, Preston"],[999,"Leach, Greyson"],
  [999,"Puebla, Giuseppe"],[999,"Howell, Mason"],[999,"Lee, Bryan"],
  [999,"Fang, Ethan"],[999,"Schoenberger, Jack"],[999,"Pulcini, Mateo"],
  [999,"Holtz, Brandon"],[999,"Herrington, Jackson"],[999,"Coleman, Hamilton"],
  [999,"Ormond, Jackson"],[999,"Kyes, Chase"],[999,"Harber, Vaughn"],
  [999,"Sveinsson, Arni"],[999,"Cowan, Ryder"],[999,"Reilly, Logan"],
  [999,"Plewe, Thayer"],[999,"Fleming, Marek"],[999,"Robles, Matthew"],
  [999,"Lee, Eric "], // duplicate entry in source list (trailing space keeps key unique)
];

/* Per-player verified data, keyed by display name ("First Surname").
   odds in DECIMAL. null = verified-unknown (renders as a GAP, never guessed).
   This object is MERGED over the roster by app.js. It is populated by the
   research/verification agents; values below are the seeded, cross-checked
   subset confirmed at build time. */
function O(win, top5, src){ return { odds:{win:win, top5:(top5??null), top10:null, top20:null, makeCut:null}, oddsSrc:src }; }
const SB = "Sportingbet 17704600 (live)";          // user's book, direct fetch
const CBS = "CBS/FanDuel board";                   // agent cross-check
const DK = "DraftKings board";                     // agent cross-check
const YH = "Yahoo Sports full-field list";         // agent cross-check

const DATA = {
  // ---- favourites: Sportingbet direct + top5 where the board exposed it ----
  "Scottie Scheffler": O(6.50, 2.10, SB+" + CBS +550 ✓"),
  "Rory McIlroy":      O(13.00, 3.20, SB+" + CBS +1200 ✓"),
  "Jon Rahm":          O(15.00, 3.50, SB+" (15.00); CBS +1300 — minor book variance"),
  "Cameron Young":     O(21.00, 4.33, SB+" + CBS +2000 ✓"),
  "Tommy Fleetwood":   O(23.00, 5.00, SB+" + CBS +2200"),
  "Xander Schauffele": O(19.00, null, SB+" (19.00); CBS +2200 — book variance"),
  "Matt Fitzpatrick":  O(21.00, null, SB+" (21.00); CBS +2200"),
  "Ludvig Åberg":      O(23.00, null, SB+" + CBS +2200"),
  "Bryson DeChambeau": O(26.00, null, SB+" + CBS +2500 ✓"),
  "Brooks Koepka":     O(31.00, null, SB+" (31.00); CBS +3500 — book variance"),
  "Tyrrell Hatton":    O(34.00, null, SB+" (34.00); CBS +4000"),
  "Viktor Hovland":    O(41.00, null, SB+" + CBS +4500"),
  "Wyndham Clark":     O(41.00, null, SB+" + CBS +4000 ✓"),
  "Justin Thomas":     O(41.00, null, SB+" + CBS +4000 ✓"),
  // ---- remainder: agent-sourced win odds (named book per cell) ----
  "Russell Henley":    O(36.00, null, CBS+" +3500; DK +3700"),
  "Justin Rose":       O(41.00, null, CBS+" +4000"),
  "J.J. Spaun":        O(41.00, null, "FanDuel +4000; DK +6000 — board variance"),
  "Collin Morikawa":   O(41.00, null, CBS+" +4000"),
  "Chris Gotterup":    O(46.00, null, CBS+" +4500; DK +4400 ✓"),
  "Aaron Rai":         O(101.00, null, DK+" +10000"),
  "Ben Griffin":       O(73.00, null, DK+" +7200"),
  "Si Woo Kim":        O(41.00, null, CBS+" +4000"),
  "Patrick Reed":      O(46.00, null, CBS+" +4500"),
  "Akshay Bhatia":     O(56.00, null, "⚠ CBS +5500 vs DK +13500 — large discrepancy, verify live"),
  "Sam Burns":         O(41.00, null, CBS+" +4000"),
  "Min Woo Lee":       O(61.00, null, CBS+" +6000"),
  "Patrick Cantlay":   O(46.00, null, CBS+" +4500"),
  "Maverick McNealy":  O(71.00, null, CBS+" +7000"),
  "J.T. Poston":       O(81.00, null, CBS+" +8000 (125-1 elsewhere)"),
  "Keegan Bradley":    O(126.00, null, CBS+" 125-1"),
  "Rickie Fowler":     O(81.00, null, CBS+" +8000 (125-1 elsewhere)"),
  "Jake Knapp":        O(81.00, null, CBS+" +8000 (100-1 elsewhere)"),
  "Shane Lowry":       O(66.00, null, CBS+" 65-1"),
  "Gary Woodland":     O(101.00, null, CBS+" 100-1"),
  "Jason Day":         O(71.00, null, CBS+" +7000 (130-1 elsewhere)"),
  "Adam Scott":        O(81.00, null, CBS+" 80-1"),
  "Jordan Spieth":     O(66.00, null, CBS+" 65-1"),
  "Ryan Fox":          O(126.00, null, CBS+" 125-1"),
  "Corey Conners":     O(101.00, null, CBS+" +10000 (150-1 elsewhere)"),
  "Sungjae Im":        O(176.00, null, CBS+" 175-1"),
  "Joaquin Niemann":   O(66.00, null, CBS+" 65-1; +5500 elsewhere"),
  "Sahith Theegala":   O(101.00, null, CBS+" +10000 (175-1 elsewhere)"),
  "Keith Mitchell":    O(151.00, null, CBS+" 150-1"),
  "Emiliano Grillo":   O(526.00, null, YH+" 525-1"),
  "Billy Horschel":    O(576.00, null, YH+" 575-1"),
  "Cameron Smith":     O(151.00, null, YH+" 150-1"),
  "Tom Kim":           O(186.00, null, YH+" 185-1"),
  "Dustin Johnson":    O(171.00, null, YH+" 170-1"),
  "Max Greyserman":    O(301.00, null, YH+" 300-1"),
  "Davis Thompson":    O(241.00, null, YH+" 240-1"),
  "Michael Kim":       O(321.00, null, YH+" 320-1"),
  "Harry Hall":        O(181.00, null, YH+" 180-1"),
  "Nick Taylor":       O(231.00, null, YH+" 230-1"),
  "Matt McCarty":      O(291.00, null, YH+" 290-1"),
  "Andrew Novak":      O(311.00, null, YH+" 310-1"),
  // Players whose win price could NOT be isolated to a named book -> GAP (null):
  // MacIntyre, Straka, Noren, English, Matsuyama, Kitayama, N.Højgaard,
  // Echavarria, Sam Stevens, Harman, Chris Kirk. Left undefined on purpose.
};

/* ---------------------------------------------------------------------
   MAJOR + SHINNECOCK HISTORY  (verified, sourced — research agent)
   sh2018: numeric 2018 Shinnecock finish | 'MC' missed cut | 'field'
   (confirmed in field, exact finish not captured) | null (did not play).
   courseScore (Shinnecock fit) is COMPUTED from these facts in app.js,
   not hand-assigned. top10s are sourced approximations.
   --------------------------------------------------------------------- */
function H(majorsWon,bestUSOpen,top10s,sh2018,read){
  return {history:{majorsWon,bestUSOpen,top10s,sh2018,read,src:"history agent (usopen.com / Wikipedia / CBS / Golf Digest / ESPN — per-player)"}};
}
const mj=(name,year)=>({name,year});
const HISTORY = {
  "Scottie Scheffler": H([mj('Masters',2022),mj('Masters',2024),mj('PGA',2025),mj('Open',2025)],{pos:2,year:2022},20,null,"World No.1, 4 majors, chasing the career Grand Slam — US Open the missing leg. Did not play Shinnecock '18."),
  "Rory McIlroy":      H([mj('US Open',2011),mj('PGA',2012),mj('PGA',2014),mj('Open',2014),mj('Masters',2025),mj('Masters',2026)],{pos:1,year:2011},30,'MC',"Grand Slam holder & US Open champ — but MISSED the cut at Shinnecock '18."),
  "Cameron Young":     H([],{pos:4,year:2025},6,null,"Big-hitting multiple major runner-up; breakthrough overdue."),
  "Matt Fitzpatrick":  H([mj('US Open',2022)],{pos:1,year:2022},3,12,"US Open champ; T12 at Shinnecock '18; loves brutal setups."),
  "Russell Henley":    H([],{pos:4,year:2017},5,25,"Steady US Open grinder (T7 '24, T10 '25); co-led R1 at Shinnecock '18."),
  "Tommy Fleetwood":   H([],{pos:2,year:2018},7,2,"Elite US Open/links pedigree — SOLO 2nd at Shinnecock '18 with a final-round 63."),
  "Justin Rose":       H([mj('US Open',2013)],{pos:1,year:2013},15,10,"US Open champ, ageless contender; T10 at Shinnecock '18."),
  "Jon Rahm":          H([mj('US Open',2021),mj('Masters',2023)],{pos:1,year:2021},15,'field',"US Open champ & elite ball-striker; lit up Shinnecock '18 with a closing 63."),
  "J.J. Spaun":        H([mj('US Open',2025)],{pos:1,year:2025},2,null,"Defending US Open champ; proved grit in brutal Oakmont conditions."),
  "Collin Morikawa":   H([mj('PGA',2020),mj('Open',2021)],{pos:4,year:2021},10,null,"Two-time major champ & premier iron player; US Open his weakest leg."),
  "Chris Gotterup":    H([],null,1,null,"Rising bomber; Open solo-3rd + Scottish Open win show big-stage upside."),
  "Xander Schauffele": H([mj('PGA',2024),mj('Open',2024)],{pos:3,year:2019},13,6,"Remarkable US Open consistency; T6 at Shinnecock '18."),
  "Ludvig Åberg":      H([],{pos:12,year:2024},2,null,"Generational talent; Masters runner-up on debut; major feels imminent."),
  "Aaron Rai":         H([mj('PGA',2026)],{pos:19,year:2024},2,null,"REIGNING PGA champ; precise fairways-and-greens game fits a US Open."),
  "Ben Griffin":       H([],{pos:10,year:2025},2,null,"Breakout '25 with multiple wins; T8 PGA / T10 US Open — major-ready."),
  "Justin Thomas":     H([mj('PGA',2017),mj('PGA',2022)],{pos:8,year:2020},12,25,"Two-time major champ; US Open his weakest leg; T25 Shinnecock '18."),
  "Robert MacIntyre":  H([],{pos:2,year:2025},3,null,"Surging Scot; SOLO 2nd at Oakmont '25; strong links/US Open fit."),
  "Si Woo Kim":        H([],{pos:13,year:2017},1,null,"Talented but thin major resume; best major T8 PGA '25."),
  "Sepp Straka":       H([],null,3,null,"Two-time '25 winner; best major 2nd at the Open '23; US Open record light."),
  "Alex Noren":        H([],{pos:17,year:2020},1,null,"Veteran grinder; best major T6 Open '17; limited US Open success."),
  "Tyrrell Hatton":    H([],{pos:4,year:2025},7,6,"Excellent US Open/links fit; T6 Shinnecock '18, T4 Oakmont '25, T3 Masters '26."),
  "Harris English":    H([],{pos:3,year:2021},6,'field',"Underrated big-stage record; solo 3rd US Open '21, 2nd PGA & 2nd Open '25."),
  "Hideki Matsuyama":  H([mj('Masters',2021)],{pos:2,year:2017},10,16,"Masters champ & elite ball-striker; multiple US Open top-5s; T16 Shinnecock '18."),
  "Patrick Reed":      H([mj('Masters',2018)],{pos:4,year:2018},8,4,"His best-ever US Open was SOLO 4th — at Shinnecock '18. Strong fit."),
  "Viktor Hovland":    H([],{pos:3,year:2025},6,null,"Top-10 in all four majors incl. T3 Oakmont '25; breakthrough overdue."),
  "Akshay Bhatia":     H([],{pos:16,year:2024},0,null,"Young talent, no major top-10 yet; unproven on the US Open stage."),
  "Sam Burns":         H([],{pos:7,year:2025},2,null,"Held the 54-hole lead at Oakmont '25; top-10s in the last two US Opens."),
  "Bryson DeChambeau": H([mj('US Open',2020),mj('US Open',2024)],{pos:1,year:2020},10,'field',"Two-time US Open champ; arguably the field's best pure US Open player."),
  "Wyndham Clark":     H([mj('US Open',2023)],{pos:1,year:2023},2,null,"US Open champ but thin overall major record; bomber who can go low."),
  "Min Woo Lee":       H([],{pos:5,year:2023},1,null,"Big talent; best major T5 US Open '23; high ceiling, streaky."),
  "Patrick Cantlay":   H([],{pos:3,year:2024},4,null,"Elite all-rounder still seeking a first major; T3 US Open '24 his best."),
  "Maverick McNealy":  H([],{pos:4,year:2021},1,null,"Improving; best major T4 US Open '21; needs a breakthrough week."),
  "Keegan Bradley":    H([mj('PGA',2011)],{pos:4,year:2014},4,'field',"Major champ & Ryder Cup captain; US Open best T4 '14; in field at Shinnecock '18."),
  "Rickie Fowler":     H([],{pos:2,year:2014},12,'field',"Multiple major runner-ups incl. 2014 US Open 2nd; still chasing a first major."),
  "Shane Lowry":       H([mj('Open',2019)],{pos:2,year:2016},6,'field',"Open champ with strong US Open record (2nd '16); great tough-conditions fit."),
  "Gary Woodland":     H([mj('US Open',2019)],{pos:1,year:2019},3,'field',"US Open champ; power player, fewer recent contending weeks."),
  "Jason Day":         H([mj('PGA',2015)],{pos:2,year:2011},15,'field',"Former World No.1 & PGA champ; two US Open runner-ups; proven on the big stage."),
  "Adam Scott":        H([mj('Masters',2013)],{pos:4,year:2015},21,'MC',"Masters champ, 21 major top-10s, ironman record — but MC at Shinnecock '18."),
  "Jordan Spieth":     H([mj('Masters',2015),mj('US Open',2015),mj('Open',2017)],{pos:1,year:2015},15,'MC',"3-time major champ incl. US Open '15; needs only the PGA for the Slam; MC Shinnecock '18."),
  "Ryan Fox":          H([],{pos:41,year:null},0,null,"Two-time '25 PGA Tour winner but weak major record; long-shot fit."),
  "Corey Conners":     H([],{pos:9,year:2024},4,null,"Premier ball-striker; major top-10s Masters-heavy; US Open best T9 '24."),
  "Brian Harman":      H([mj('Open',2023)],{pos:2,year:2017},5,'field',"Open champ; tenacious; US Open 2nd '17; strong tough-conditions/links fit."),
  "Sungjae Im":        H([],null,2,null,"High ceiling; best major 2nd Masters '20; US Open record light."),
  "Joaquin Niemann":   H([],null,1,null,"Dominant LIV winner; first major top-10 (T8 PGA '25); still unproven in majors."),
  "Brooks Koepka":     H([mj('US Open',2017),mj('US Open',2018),mj('PGA',2018),mj('PGA',2019),mj('PGA',2023)],{pos:1,year:2018},15,1,"The field's premier US Open assassin — WON at Shinnecock '18 (back-to-back US Opens)."),
  "Cameron Smith":     H([mj('Open',2022)],{pos:4,year:2015},10,'MC',"Open champ & elite putter; multiple US Open T4s; can win on firm, fast turf."),
  "Dustin Johnson":    H([mj('US Open',2016),mj('Masters',2020)],{pos:1,year:2016},25,3,"US Open champ & elite big-stage record; SOLO 3rd at Shinnecock '18."),
  "Graeme McDowell":   H([mj('US Open',2010)],{pos:1,year:2010},6,null,"US Open champ & grinder; ideal tough-setup fit; returns to Shinnecock in '26."),
  "Padraig Harrington":H([mj('Open',2007),mj('Open',2008),mj('PGA',2008)],{pos:4,year:2012},10,null,"3-time major champ & all-time closer; US Open best T4 '12."),
};
// merge history into DATA
for(const k in HISTORY){ DATA[k]=Object.assign(DATA[k]||{}, HISTORY[k]); }

/* ---------------------------------------------------------------------
   2026 SEASON FORM  (verified, sourced — research agent)
   last5: most-recent-first [finishPos, event]; pos may be 'MC'/'WD'.
   Only finishes the agent could verify from a real source are included;
   sparse lists are honest gaps, not padded. Form score is computed from
   these finishes in app.js (MC counts as ~78th, WD is skipped).
   --------------------------------------------------------------------- */
function F(last5, wins, read, note){
  return {form:{ last5:last5.map(([pos,event])=>({pos,event})), wins, read,
                 note:note||null, src:"form agent (PGA Tour / ESPN / CBS / Golf Channel — per player)"}};
}
const FORM = {
  "Scottie Scheffler": F([[12,'Memorial'],[3,'CJ Cup'],[14,'PGA'],[2,'Masters']],1,"Steady-elite but a run of near-misses; #1 in SG Total.",null),
  "Rory McIlroy":      F([['MC','Canadian'],[12,'Memorial'],[7,'PGA'],[1,'Masters']],1,"Lethal at majors (Masters win) but driver wobbly — MC in Canada.",null),
  "Cameron Young":     F([[1,'Cadillac'],[1,'PLAYERS']],2,"HOT — two 2026 wins, rested ahead of the US Open.",null),
  "Matt Fitzpatrick":  F([[2,'Canadian'],[2,'PLAYERS']],0,"Hot — runner-up in Canada; back inside top-5 world.","A betting profile claimed 3 wins; only the two runner-ups were independently verified."),
  "Russell Henley":    F([[1,'Colonial'],['MC','PGA'],[3,'Masters'],['MC','Valero']],1,"Hot/steady — won Colonial, T3 Masters.",null),
  "Tommy Fleetwood":   F([[11,'Canadian'],[4,'Memorial'],['MC','PGA'],[5,'Truist'],[4,'Pebble']],0,"Steady — a stack of top-5s, one MC.",null),
  "Justin Rose":       F([['MC','Canadian'],[1,'Farmers'],['MC','Am Ex']],1,"Mixed — record-setting early win, recent MC.",null),
  "Jon Rahm":          F([[2,'PGA'],[38,'Masters']],2,"Hot on LIV; major form returning (PGA 2nd).","LIV Tour — limited week-to-week PGA data."),
  "J.J. Spaun":        F([[1,'Valero'],[24,'PLAYERS']],1,"Defending champ; won Valero, otherwise quiet.",null),
  "Collin Morikawa":   F([[1,'Pebble']],1,"Won Pebble (first since 2023); recent data thin.",null),
  "Chris Gotterup":    F([[10,'PGA'],[24,'Masters'],[1,'WM Phoenix'],[1,'Sony']],2,"Hot — two early wins and a T10 at the PGA.",null),
  "Xander Schauffele": F([[7,'PGA'],[60,'Truist']],0,"Steady tee-to-green; one poor week.",null),
  "Ludvig Åberg":      F([[39,'Memorial'],[17,'Colonial'],[4,'PGA']],0,"Cooling — strong spring, faded at Memorial.",null),
  "Aaron Rai":         F([['MC','Canadian'],[19,'Memorial'],[1,'PGA']],1,"Hot — maiden major (PGA), then MC in Canada.",null),
  "Ben Griffin":       F([[3,'Colonial']],0,"Steady — T3 title defence at Colonial.",null),
  "Justin Thomas":     F([[31,'Memorial'],[4,'PGA']],0,"Steady — strong PGA, quiet at Memorial.",null),
  "Robert MacIntyre":  F([[2,'Valero']],0,"Steady — runner-up at Valero; ~17th in the world.",null),
  "Si Woo Kim":        F([[2,'CJ Cup'],[63,'Pebble'],[3,'WM Phoenix'],[2,'Farmers'],[6,'Am Ex']],0,"Hot — near-59 and 2nd at the CJ Cup.",null),
  "Sepp Straka":       F([[6,'Heritage'],[2,'Pebble']],0,"Steady — sharp approach play, top-20 world.",null),
  "Alex Noren":        F([[26,'PGA'],[29,'Pebble'],['MC','Farmers'],['MC','Am Ex']],0,"Cold/inconsistent — two early MCs.",null),
  "Tyrrell Hatton":    F([[3,'Masters'],[47,'LIV Riyadh']],0,"Mixed — Masters T3 the high point.","LIV Tour — limited PGA data."),
  "Harris English":    F([[7,'PGA']],0,"Quiet — lone top-10 came at the PGA.",null),
  "Ryan Gerard":       F([[2,'Memorial']],0,"Hot — multiple runner-ups in 2026, still chasing a first win.",null),
  "Hideki Matsuyama":  F([[2,'WM Phoenix']],0,"Limited recent verified; strong February.",null),
  "Jacob Bridgeman":   F([[41,'recent'],[33,'recent'],[1,'Genesis']],1,"Cooling — hot start (Genesis win) then several fades.",null),
  "Patrick Reed":      F([[12,'Masters'],[1,'Dubai']],1,"Steady — Masters T12; left LIV for the PGA Tour.","Win was on the DP World Tour (Dubai)."),
  "Viktor Hovland":    F([[3,'Canadian']],0,"Warming — season-best 3rd in Canada.",null),
  "Akshay Bhatia":     F([[1,'API'],[16,'Genesis'],[6,'Pebble'],[3,'WM Phoenix'],['MC','Farmers']],1,"Strong spring incl. an API win; post-API form unverified.",null),
  "Sam Burns":         F([[20,'Canadian'],[7,'Masters'],[37,'Truist']],0,"Steady-middling.",null),
  "Kurt Kitayama":     F([[10,'PGA'],[2,'Genesis']],0,"Steady — T10 PGA, runner-up Genesis.",null),
  "Bryson DeChambeau": F([['MC','PGA'],['MC','Masters'],[3,'LIV Virginia']],2,"Split — great on LIV, two major MCs.","LIV Tour — limited PGA data."),
  "Nicolai Højgaard":  F([[2,'Houston'],[24,'API']],0,"Hot — career-best form, multiple runner-ups.",null),
  "Wyndham Clark":     F([[3,'Memorial'],[1,'CJ Cup'],[11,'Canadian']],1,"Hot — a win and a solo 3rd, gaining strokes.",null),
  "Min Woo Lee":       F([[18,'PGA'],[2,'Pebble']],0,"Steady — elite SG Total, T18 at the PGA.",null),
  "Patrick Cantlay":   F([[36,'Masters']],0,"Steady-quiet — solid stats, no win.",null),
  "Maverick McNealy":  F([[18,'PGA'],[18,'Masters'],[32,'PLAYERS']],0,"Steady — consistent cuts, few highs.",null),
  "J.T. Poston":       F([['WD','Canadian'],[1,'Memorial']],1,"Hot off a Memorial breakout; WD'd the next week.",null),
  "Keegan Bradley":    F([[12,'Heritage'],['MC','recent'],['MC','recent']],0,"Cold — struggling, multiple MCs (111th SG).",null),
  "Rickie Fowler":     F([[2,'Truist']],0,"Hot — best stretch in years, several straight top-10s.",null),
  "Jake Knapp":        F([['WD','PGA'],['WD','Cadillac'],[74,'Heritage'],[11,'Masters']],0,"INJURED — thumb sprain, multiple WDs.","Thumb injury — availability/sharpness a real risk."),
  "Shane Lowry":       F([[29,'Canadian'],[2,'Cognizant']],0,"Steady-quiet — runner-up at the Cognizant.",null),
  "Gary Woodland":     F([[6,'Colonial'],[17,'Truist'],[1,'Houston']],1,"Hot resurgence — first win since 2019.",null),
  "Jason Day":         F([],0,"Limited recent verified — middling, ~47th world.",null),
  "Adam Scott":        F([[12,'Memorial'],['MC','PGA'],[4,'Cadillac']],0,"Steady — solid on hard courses.",null),
  "Jordan Spieth":     F([[19,'CJ Cup']],0,"Steady-quiet — making cuts, no top-10s, ~51st world.",null),
  "Nico Echavarria":   F([[1,'Cognizant']],1,"Won early (Cognizant); recent form unverified.",null),
  "Sam Stevens":       F([[58,'PLAYERS'],[66,'API'],[5,'Houston'],[16,'Genesis'],[6,'Am Ex']],0,"Steady early; faded at the bigger events.",null),
  "Ryan Fox":          F([[24,'API'],['WD','PLAYERS'],[24,'Pebble'],[24,'WM Phoenix']],0,"Steady-middling — one top-10.",null),
  "Corey Conners":     F([[14,'Valspar'],[13,'PLAYERS'],[33,'API']],0,"Inconsistent — cuts but no win.",null),
  "Brian Harman":      F([],0,"Cold — no top-10s in 2026.",null),
  "Sungjae Im":        F([['MC','PGA'],[4,'Valspar']],0,"Cold/limited — wrist injury, MC at the PGA.","Returning from a wrist injury."),
  "Joaquin Niemann":   F([[1,'LIV Korea'],[4,'LIV Singapore']],1,"Hot on LIV; thin major record.","LIV Tour — limited PGA data."),
  "Sahith Theegala":   F([[60,'Pebble'],[18,'WM Phoenix'],[7,'Farmers'],[8,'Am Ex'],[31,'Sony']],0,"Limited — only ~5 early starts; possible layoff.",null),
  "Keith Mitchell":    F([[33,'API'],[6,'Cognizant'],['WD','Valspar']],0,"Inconsistent — one top-10 and a WD.",null),
  "Chris Kirk":        F([[47,'API'],['MC','Cognizant'],[52,'Pebble']],0,"Cold — negative SG Total.",null),
  "Brooks Koepka":     F([['WD','Canadian'],[9,'Cognizant']],0,"INJURED/UNCERTAIN — hand injury, US Open reportedly in doubt.","⚠ Hand injury — WD'd Canadian Open; US Open participation in doubt."),
  "Emiliano Grillo":   F([['MC','PGA'],[4,'Procore']],0,"Cold — MC at the PGA, thin form (~117th).",null),
  "Billy Horschel":    F([['MC','recent'],[54,'recent'],[11,'API']],0,"Returning from hip surgery — inconsistent.","Post hip-surgery return."),
  "Cameron Smith":     F([[7,'PGA']],0,"Warming — best major in nine starts (PGA T7).","LIV Tour — limited PGA data."),
  "Tom Kim":           F([[54,'CJ Cup']],0,"Cold/searching — long slump continues.",null),
  "Dustin Johnson":    F([[33,'Masters']],0,"Cold for DJ — one top-10 in eight LIV starts.","LIV Tour — limited data."),
  "Max Greyserman":    F([[14,'PGA'],[9,'CJ Cup'],[18,'API'],[24,'Genesis'],[37,'Pebble']],0,"Warming — first top-10s arriving.",null),
  "Davis Thompson":    F([],0,"Cold — slid in the rankings (~134th).",null),
  "Michael Kim":       F([[44,'Memorial'],[2,'Valero'],[27,'Masters'],[43,'Am Ex']],0,"Mixed — Valero runner-up the highlight.",null),
  "Harry Hall":        F([],0,"Steady-quiet — 3 top-10s in 2026, finishes unverified.",null),
  "Nick Taylor":       F([[26,'PGA'],[13,'Sony']],0,"Steady-middling.",null),
  "Matt McCarty":      F([[9,'Cadillac']],0,"Steady-improving — multiple top-10s.",null),
  "Andrew Novak":      F([[7,'Farmers']],0,"Cooling — negative recent SG Total.",null),
};
for(const k in FORM){ DATA[k]=Object.assign(DATA[k]||{}, FORM[k]); }

// Exposed for app.js
window.BG = { FIELD_META, ROSTER_RAW, DATA, FORM };
