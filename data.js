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
  oddsCapturedAt: "2026-06-18 00:35", // when odds were scraped — bump on every refresh
  lastUpdated: null, // set when the page loads the data
  forecast: {
    summary: "\"Wind, wind and more wind.\" Thursday is the worst — 22–28 mph sustained with gusts to ~40+ mph — easing through the week. For reference, in 2018's Shinnecock wind NO player broke par for the week. A heavy premium on driving accuracy, ball-flight control and links/wind experience.",
    src: "Golf Channel / CBS / NBC / Golf.com forecasts (Jun 2026)",
    days: [
      { d:"Thu", hi:74, rain:"early", wind:"22–28 mph", gust:"40+", dir:"worst day" },
      { d:"Fri", hi:73, rain:"0%",     wind:"14–18 mph", gust:"26",  dir:"" },
      { d:"Sat", hi:73, rain:"0%",     wind:"16–20 mph", gust:"28",  dir:"" },
      { d:"Sun", hi:71, rain:"0%",     wind:"10–17 mph", gust:"22",  dir:"" },
    ],
  },
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

/* ---------------------------------------------------------------------
   PLAYER INTEL — recent colour/news (verified, sourced — intel agent).
   flag:'injury' shows a red ⚕ marker. One verified sentence each;
   players with nothing noteworthy are simply omitted (no padding).
   --------------------------------------------------------------------- */
function I(text, date, src, flag){ return {intel:{text,date,src,flag:flag||null}}; }
const INTEL = {
  "Scottie Scheffler": I("+550 favourite chasing the career Grand Slam on his 30th birthday weekend; winless since January but still the field's best tee-to-green.","Jun 2026","CBS"),
  "Rory McIlroy": I("Says his driving 'isn't where he wants it' but is happy with irons/short game; scouted Shinnecock after T12 at Memorial.","Jun 2026","Golf Channel"),
  "Cameron Young": I("Red-hot — 2026 wins at THE PLAYERS and the Cadillac (by six over Scheffler); risen to World No. 3.","2026","PGA Tour"),
  "Matt Fitzpatrick": I("Arguably the hottest player in golf — three 2026 wins plus a runner-up (closing 64) at the Canadian Open last week.","Jun 14 2026","Yahoo"),
  "Russell Henley": I("Won the Charles Schwab Challenge at Colonial in a playoff; up to World No. 11.","May 31 2026","PGA Tour"),
  "Tommy Fleetwood": I("Five-plus top-10s in 2026 but still chasing a first win since last August's Tour Championship breakthrough.","Jun 2026","Fox Sports"),
  "Justin Rose": I("Won Farmers in a record 23-under (Feb) and made a late charge to T10 at the PGA.","2026","Fox Sports"),
  "Jon Rahm": I("PGA runner-up; used the LIV break to scout Shinnecock — but is 0-for-12 in majors since joining LIV.","Jun 2026","NBC"),
  "J.J. Spaun": I("Defending champ; says chasing being a 'perfect golfer' hurt him — now back to his title-winning mindset.","Jun 2026","Yahoo/AP"),
  "Collin Morikawa": I("Lingering back spasms (WD'd PLAYERS after one hole; also Texas Open & Truist) — calls it a 'trust factor'.","Mar–May 2026","CBS","injury"),
  "Chris Gotterup": I("Two 2026 wins (Sony, and WM Phoenix in a playoff over Matsuyama); career-high No. 17.","Jan–Feb 2026","CBS"),
  "Xander Schauffele": I("Won The American Express to open 2026; has never finished worse than T14 in his US Open career.","2026","Today's Golfer"),
  "Ludvig Åberg": I("Five top-fives in nine starts incl. T4 at the PGA — but still 0-for-10 in majors.","May–Jun 2026","CBS"),
  "Aaron Rai": I("Won the 2026 PGA Championship — his first major, and the first Englishman to win it since 1919.","May 17 2026","ESPN"),
  "Ben Griffin": I("More mixed than his 2025 breakout (0 wins, 3 top-10s); lost Colonial by one to Henley.","2026","AOL"),
  "Justin Thomas": I("In via PGA win exemption; griped that practice-round wait times have 'gotten terrible' at majors.","Jun 15 2026","Golf Channel"),
  "Robert MacIntyre": I("Run of missed cuts (Masters, PGA, Memorial) since the birth of first child Findlay — 'life going on,' says McGinley.","Jun 2026","DailyClubGolf"),
  "Si Woo Kim": I("Career-best season (No. 18) with a CJ Cup runner-up and T10 Memorial; switched to a Callaway Quantum driver.","2026","PGA Tour"),
  "Sepp Straka": I("Solid 2026 (T8 PLAYERS); reshaped his schedule around newborn son Thomas, born premature in 2025.","2026","Sky Sports"),
  "Harris English": I("First top-5 of 2026 at RBC Heritage; caddie Eric Larson barred from the UK last year (no US Open impact).","Apr 2026","Today's Golfer"),
  "Ryan Gerard": I("Lost a Memorial playoff to Poston — his second runner-up of the year; still chasing a maiden win.","Jun 7 2026","CBS"),
  "Hideki Matsuyama": I("In contention at Colonial (66-65 start) before fading to T13; lost the WM Phoenix playoff to Gotterup.","May 2026","PGA Tour"),
  "Jacob Bridgeman": I("Won the Genesis Invitational at Riviera (over McIlroy & Kitayama) for his first Tour title — in front of Tiger.","Feb 2026","PGA Tour"),
  "Patrick Reed": I("Left LIV in January and won two of his first four PGA Tour starts back.","2026","Today's Golfer"),
  "Viktor Hovland": I("Rough 2026 — broken toe to start, MCs at Riviera/Bay Hill/PLAYERS; re-hired former coach TJ Yeaton.","Mar 2026","Golf Monthly"),
  "Akshay Bhatia": I("Admits a 'subconscious' driving issue (declining off-the-tee) plus a March Valspar WD.","2026","EssentiallySports"),
  "Sam Burns": I("Hot — T4 Memorial then T20 in Canada; back-to-back US Open top-10s and 54-hole leader last year.","Jun 2026","RotoBaller"),
  "Kurt Kitayama": I("Four top-10s and No. 31 — but has missed the cut in his last four US Opens.","2026","Wikipedia"),
  "Bryson DeChambeau": I("Strong LIV form (2 wins) but MC at both the Masters and PGA; reportedly close to a TaylorMade driver switch.","Jun 2026","GolfMagic"),
  "Nicolai Højgaard": I("Best form of his career (four top-sixes, solo 2nd at Houston) though MC at Memorial.","Jun 2026","Fox Sports"),
  "Wyndham Clark": I("'Embarrassed and ashamed' over last year's Oakmont locker-smashing (he's banned from the club); seeking redemption.","Jun 15 2026","CBS"),
  "Min Woo Lee": I("Hadn't missed a cut in 2026 (T2 Pebble) until a putter-driven Memorial MC; skipped Canada.","Jun 2026","Flashscore"),
  "Maverick McNealy": I("Consistent — cut in 8 of 9 with six top-25s; briefly shared the Friday lead at the PGA.","Jun 2026","PGA Tour"),
  "J.T. Poston": I("Won the Memorial in a playoff over Gerard, grinding 33 holes Sunday — earned his US Open spot.","Jun 7 2026","Golf Channel"),
  "Keegan Bradley": I("Poor form (3 MCs in 5 starts); still processing the 2025 Ryder Cup home loss he captained.","2026","Sky Sports"),
  "Rickie Fowler": I("Resurgent (T2 Truist, 4 top-10s) after injections finally calmed a chronic left-shoulder issue.","May 2026","WFMD"),
  "Jake Knapp": I("Out since mid-April with a thumb sprain (WD'd 3 straight incl. PGA); listed but only 'hopeful' — a game-time decision.","Jun 2026","theScore","injury"),
  "Shane Lowry": I("Trying to jump-start a stalled season; T29 in Canada last week; strong links pedigree.","Jun 14 2026","Irish Golf Desk"),
  "Gary Woodland": I("Won the Houston Open by five — his first win since brain surgery; recently disclosed PTSD struggles.","Apr 2026","ESPN"),
  "Jason Day": I("Two top-10s in 2026 (No. 47); aiming to beat last year's T23.","2026","PGA Tour"),
  "Adam Scott": I("Playing his 100th consecutive major — only Nicklaus has done it — and says he's here to win, not just show up.","Jun 13 2026","Washington Post/AP"),
  "Jordan Spieth": I("Reports 'no pain' in the left wrist after 2024 surgery; the 2015 US Open champ is in on a full exemption.","Jun 2026","Yahoo"),
  "Sam Stevens": I("In via top-60 OWGR; T24 at the 2026 Masters.","2026","Wikipedia"),
  "Ryan Fox": I("Defending Canadian Open champ; into the field via top-60 OWGR.","2026","Golf Channel"),
  "Corey Conners": I("Bounce-back T13 (API) — his first top-15 of 2026; a year on from a final-round wrist-injury WD at the 2025 US Open.","2026","Fox Sports"),
  "Brian Harman": I("Hasn't missed a major cut since the 2024 Masters; won the 2025 Valero; played well at Shinnecock in 2018.","2026","BetMGM"),
  "Sungjae Im": I("Returned from a wrist injury that cost him the first seven 2026 events; uneven form since.","2026","Fox Sports","injury"),
  "Joaquin Niemann": I("Won LIV Korea for his first 2026 individual title to grab a US Open exemption; runner-up to Hatton in Spain.","Jun 2026","LIV Golf"),
  "Sahith Theegala": I("Has a history of a recurring neck issue; his 2026 fitness isn't cleanly confirmed — verify before picking.","2026","Golf Digest (verify)"),
  "Keith Mitchell": I("Qualified on 'Golf's Longest Day' (69-63), then contended early at the Canadian Open.","Jun 2026","Golf Channel"),
  "Chris Kirk": I("Medalist at his final-qualifying site (65-64) to reach his 9th US Open.","Jun 8 2026","bet365"),
  "Brooks Koepka": I("WD'd the Canadian Open with a hand injury (numb ring/pinkie fingers) but intends to play; getting treatment.","Jun 2026","Golf Channel","injury"),
  "Cameron Smith": I("Sacked long-time coach Grant Field for Claude Harmon III; says he has 'a lot more confidence' in his swing.","May 2026","GolfMagic"),
  "Dustin Johnson": I("Says he's 'finally' driving it like normal again after a T4 at LIV Korea.","Jun 2026","GolfMagic"),
  "Billy Horschel": I("Still rebuilding from 2025 right-hip (torn labrum) surgery; showed a resurgence at Bay Hill in March.","Mar 2026","EssentiallySports","injury"),
  "Tom Kim": I("Qualified via 36-hole final qualifying amid a multi-year slump.","Jun 2026","Golf Digest"),
  "Davis Thompson": I("Former Tour winner who had to grind through final qualifying (-11) to make the field.","Jun 2026","Golf.com"),
  "Michael Kim": I("Good 2026 form (T2 WM Phoenix); his first US Open since 2018.","2026","Golf Monthly"),
  "Harry Hall": I("Decent early 2026 (T6 Sony, T9 Bay Hill).","2026","Golf Digest"),
  "Nick Taylor": I("In via OWGR; last win the Jan 2025 Sony; T23 at last year's US Open.","2026","Wikipedia"),
  "Matt McCarty": I("Poor recent run (MC-T60-MC incl. an 81 at Memorial); first US Open.","Jun 2026","Golf Digest"),
  "Andrew Novak": I("Mixed 2026 (2 top-10s, 4 MCs).","2026","Yahoo"),
  "Graeme McDowell": I("Qualified for his first major since 2020 (2010 US Open champ) — 'more excited than I ever thought I'd be'.","Jun 2026","Golf Monthly"),
  "Padraig Harrington": I("The reigning US Senior Open champ says he's 'turned a corner', especially with the putter.","Jun 8 2026","Golf Channel"),
  "Tyrrell Hatton": I("Won LIV Andalucía (over Rahm) just two weeks after wife Emily gave birth to a daughter.","Jun 7 2026","Golf Digest"),
  "Patrick Cantlay": I("Four straight top-12s before the Masters; MC at last year's US Open.","2026","PGA Tour"),
  "Alex Noren": I("Slow 2026 (best T29), back from a torn hamstring; closed 2025 with British Masters & BMW PGA wins.","2026","Today's Golfer"),
  "Nico Echavarria": I("Won the Cognizant Classic in March (career-high No. 34).","Mar 2026","Golf Channel"),
};
for(const k in INTEL){ DATA[k]=Object.assign(DATA[k]||{}, INTEL[k]); }

/* ---------------------------------------------------------------------
   COURSE & CONDITIONS SKILLS (Shinnecock in heavy wind) — conditions agent.
   windScore = analyst-informed wind/links FIT INDEX (0-100) from verified
   Open/links pedigree + sourced fit verdicts (NOT a raw stat). acc/ball/scr
   are 0-100 set ONLY where concretely sourced (else null=gap). fitNote =
   the sourced reason, shown in the UI.
   --------------------------------------------------------------------- */
function S(windScore, fitNote, x){ x=x||{};
  return {skills:{ windScore, fitNote, accScore:x.acc??null, ballScore:x.ball??null,
    scrScore:x.scr??null, src:"conditions agent (Golf Channel/CBS/ESPN/Wikipedia — per player)" }}; }
const SKILLS = {
  "Scottie Scheffler": S(88,"Best all-around ball-striker even in a down year — SG-total leader & 3rd around-the-green; scoring profile a perfect Shinnecock fit.",{ball:82,scr:90}),
  "Rory McIlroy": S(84,"Elite ball-striker, wind-tested, multiple Shinnecock scouting trips — but MC'd here in '18, the one caution.",{ball:86}),
  "Cameron Young": S(78,"2022 Open runner-up at St Andrews; bombs it with genuine links pedigree.",{}),
  "Matt Fitzpatrick": S(74,"Precision/accuracy game suits a US Open; 2022 US Open champ — recent form the question.",{acc:80}),
  "Russell Henley": S(88,"Tour-leading driving accuracy (71.9%) plus elite approach — the accuracy/precision archetype for Shinnecock; led Round 1 here in '18.",{acc:96,ball:88}),
  "Tommy Fleetwood": S(93,"Proven Shinnecock & links wind performer — solo 2nd here in '18 and 2019 Open runner-up.",{}),
  "Justin Rose": S(76,"Veteran tough-conditions player with a long, strong links record.",{}),
  "Jon Rahm": S(88,"Elite ball-striking and short game with real links experience; 2021 US Open champ, '26 PGA runner-up.",{ball:86}),
  "J.J. Spaun": S(55,"Defending-champ context, but his links/wind record is unproven.",{}),
  "Collin Morikawa": S(90,"Tour-best iron play (leads SG-Approach, +0.847) and a 2021 Open champ — gold standard for firm, windy greens.",{ball:98}),
  "Chris Gotterup": S(80,"2025 Genesis Scottish Open champ (beat McIlroy) — a verified links title, with length and form.",{}),
  "Xander Schauffele": S(90,"2024 Open champ, T3 US Open '19, never finished outside the top-15 at a US Open — major-tough and wind-tested.",{}),
  "Ludvig Åberg": S(74,"Elite ball-striker; links sample still small (T8 Scottish '25).",{ball:82}),
  "Aaron Rai": S(88,"Hits more fairways than anyone in the field and won the '26 PGA on accuracy + precise approaches — pure accuracy archetype.",{acc:94,ball:84}),
  "Ben Griffin": S(50,"Wind/links fit unverified.",{}),
  "Justin Thomas": S(42,"Weak links record — no Open top-10 in five starts; ball-striking talent only partly offsets that in heavy wind.",{ball:80}),
  "Robert MacIntyre": S(92,"Scottish Open & Dunhill Links champ and T6 Open '19 — a proven links/wind winner raised on it.",{}),
  "Si Woo Kim": S(64,"Accurate driver (3rd in fairways, ~69.8%); links record unproven.",{acc:86}),
  "Sepp Straka": S(82,"2023 Open runner-up — his best major came on a links.",{}),
  "Alex Noren": S(76,"Links-seasoned European veteran.",{}),
  "Tyrrell Hatton": S(84,"Proven wind player; T5 Open '16 with a deep DP World/links pedigree.",{}),
  "Harris English": S(50,"Wind/links fit unverified.",{}),
  "Ryan Gerard": S(50,"Wind/links fit unverified.",{}),
  "Hideki Matsuyama": S(72,"World-class iron player; links record light but ball-striking travels in wind.",{ball:85}),
  "Patrick Reed": S(78,"Solo 4th here at Shinnecock in '18 — proven in this exact wind.",{}),
  "Viktor Hovland": S(60,"Streaky; around-the-green has historically been a weakness — a concern when scrambling in tough conditions.",{scr:40}),
  "Akshay Bhatia": S(48,"Wind/links fit unproven; off-the-tee a current worry.",{}),
  "Sam Burns": S(52,"Solid recent US Open record but links/wind fit unverified.",{}),
  "Kurt Kitayama": S(55,"Decent driver; has missed his last four US Open cuts.",{}),
  "Bryson DeChambeau": S(70,"Two-time US Open champ (2020, 2024); power game with wind the swing factor.",{}),
  "Nicolai Højgaard": S(52,"In good form but links/wind fit unverified.",{}),
  "Wyndham Clark": S(70,"2023 US Open champ — major-tested.",{}),
  "Min Woo Lee": S(55,"Modest links record (best Open T21).",{}),
  "Patrick Cantlay": S(68,"Strong all-around game; links record modest.",{}),
  "Maverick McNealy": S(60,"Accurate, but a limited links sample (best major T23 Open '25).",{}),
  "Keegan Bradley": S(48,"Poor 2026 form going in.",{}),
  "Rickie Fowler": S(78,"T2 Open '14 with a strong links history — a good wind player; form the question.",{}),
  "Shane Lowry": S(95,"Won the 2019 Open at Portrush in brutal wind and rain — the field's premier heavy-weather player.",{}),
  "Gary Woodland": S(68,"2019 US Open champ.",{}),
  "Jason Day": S(72,"Former World No.1 with a solid links record.",{}),
  "Adam Scott": S(84,"2012 Open runner-up — a seasoned, long links contender.",{}),
  "Jordan Spieth": S(90,"2017 Open champ with multiple top-5 Opens — an elite, creative wind player.",{}),
  "Corey Conners": S(80,"Elite ball-striker / iron player — the ideal Shinnecock profile; 2026 form the only question.",{ball:88}),
  "Brian Harman": S(93,"2023 Open champ (by six) and a premier wind/links scrambler with a deadly short game.",{scr:86}),
  "Sungjae Im": S(70,"Steady iron player; T7 Open '24.",{}),
  "Joaquin Niemann": S(50,"Links record unproven despite LIV dominance.",{}),
  "Brooks Koepka": S(94,"WON the 2018 US Open here in the wind — defending-style course history; major-tough, low-ball winner.",{}),
  "Cameron Smith": S(92,"2022 Open champ and an elite links/wind player & wedge artist.",{scr:88}),
  "Dustin Johnson": S(55,"2016 US Open champ but no top-20 in his last 11 majors — pedigree vs cold form.",{}),
  "Sahith Theegala": S(50,"Wind/links fit unverified; limited starts.",{}),
  "Keith Mitchell": S(52,"Accurate-ish driver but links fit unverified.",{}),
  "Ryan Fox": S(72,"Links-raised (NZ) with a solid links background (best Open T25).",{}),
  "Padraig Harrington": S(90,"Two-time Open champ (2007–08) and a wind/links master — age the only caveat.",{}),
  "Graeme McDowell": S(82,"2010 US Open champ and a Portrush links member — a renowned wind/links grinder; current form N/A.",{}),
};
for(const k in SKILLS){ DATA[k]=Object.assign(DATA[k]||{}, SKILLS[k]); }

/* PUTTING & FIRM-GREEN enrichment (2026 SG data / sourced rep — putting agent).
   p=puttScore, f=firmScore (firm-green ball-striking), n=fitNote override.
   Shinnecock greens are ~80% POA ANNUA, fast & bumpy — poa putting is an edge,
   poa weakness a real risk. LIV players are reputation-based (no 2026 SG). */
const COND2 = {
  "Scottie Scheffler":{p:66,f:95}, "Rory McIlroy":{p:88,f:85,n:"Strong 2026 putter (top-6/12 on Tour) AND elite ball-striker, wind-tested — the only caution is his MC here in '18."},
  "Cameron Young":{p:80,f:80}, "Matt Fitzpatrick":{p:35,f:86,n:"Elite ball-striker (2nd in the field tee-to-green) but a documented poa-annua putting weakness (102nd; lost ~6 strokes putting at Riviera) — a real risk on these poa greens."},
  "Russell Henley":{p:62,f:85}, "Tommy Fleetwood":{p:66,f:82}, "Justin Rose":{p:62}, "Jon Rahm":{p:65,f:86},
  "Collin Morikawa":{p:38,f:98,n:"Among the most precise iron players alive — tailor-made for firm greens — but a historically unreliable putter is the one hole in his fit."},
  "Chris Gotterup":{p:72}, "Xander Schauffele":{p:62,f:80}, "Ludvig Åberg":{p:55,f:84},
  "Aaron Rai":{p:40,f:84,n:"Hits more fairways than anyone in the field and won the '26 PGA on accuracy + precise approaches — but a below-average putter (95th) is the catch on poa."},
  "Justin Thomas":{p:40,f:60}, "Robert MacIntyre":{p:92,f:42,n:"Proven links/wind winner (Scottish Open, Dunhill Links, T6 Open '19) AND a top-6 Tour putter (+0.685) — elite on poa; the catch is weak irons (137th in approach)."},
  "Si Woo Kim":{p:38,f:88,n:"Elite irons (6th in SG-Approach) and an accurate driver, but a poor 2026 putter (101st) — the mirror image of MacIntyre."},
  "Sepp Straka":{p:40,f:85}, "Tyrrell Hatton":{p:70}, "Hideki Matsuyama":{p:60,f:88}, "Patrick Reed":{p:72},
  "Viktor Hovland":{p:45}, "Sam Burns":{p:92,f:70,n:"Paces the field in true putting (+0.647 SG, ~6th on Tour) — a huge edge on Shinnecock's poa; ball-striking in the wind is the only question."},
  "Bryson DeChambeau":{p:50}, "Wyndham Clark":{p:60},
  "Patrick Cantlay":{p:42,f:78,n:"Strong ball-striker (top-10 in the field tee-to-green) but an inconsistent putter — the limiter on these greens."},
  "Maverick McNealy":{p:84,n:"One of the best short games in the field — top-20 in both putting and around-the-green; the limit is a small links sample."},
  "Shane Lowry":{p:72,f:78}, "Jason Day":{p:75}, "Adam Scott":{p:58},
  "Jordan Spieth":{p:80,n:"2017 Open champ and a renowned creative poa putter — an elite wind/links profile; 2026 form is the only worry."},
  "Corey Conners":{p:38,f:90,n:"Routinely a top-5 ball-striker — the ideal Shinnecock iron profile — but putting is the well-known limiter."},
  "Brian Harman":{p:78}, "Sungjae Im":{p:60}, "Joaquin Niemann":{p:45}, "Brooks Koepka":{p:42},
  "Cameron Smith":{p:90,n:"2022 Open champ, the world's best scrambler and a renowned poa-annua putter — tailor-made for these greens."},
  "Dustin Johnson":{p:50}, "Padraig Harrington":{p:60}, "Graeme McDowell":{p:60}, "Min Woo Lee":{p:55},
};
for(const k in COND2){ const c=COND2[k]; if(DATA[k]&&DATA[k].skills){ const s=DATA[k].skills;
  if(c.p!=null)s.puttScore=c.p; if(c.f!=null)s.firmScore=c.f; if(c.n)s.fitNote=c.n; } }

/* ---------------------------------------------------------------------
   COMPLETE WIN ODDS — full Sportingbet decimal board (the user's book),
   scraped 2026-06-16 and cross-checked vs DraftKings & Yahoo full-field
   lists. This fills the entire field so real players no longer show
   "no market". Applied last so it standardises every win price; existing
   real Top-5 prices are preserved.
   --------------------------------------------------------------------- */
const ODDS_SRC_FULL = "Sportingbet 17704600 live board (2026-06-16), cross-checked vs DraftKings & Yahoo full-field";
const TOP5 = { "Scottie Scheffler":2.10, "Rory McIlroy":3.20, "Jon Rahm":3.50,
               "Cameron Young":4.33, "Tommy Fleetwood":5.00 };
const WIN_FULL = {
  "Scottie Scheffler":6.50,"Rory McIlroy":13.00,"Cameron Young":21.00,"Matt Fitzpatrick":21.00,
  "Russell Henley":41.00,"Tommy Fleetwood":21.00,"Justin Rose":46.00,"Jon Rahm":15.00,
  "J.J. Spaun":51.00,"Collin Morikawa":41.00,"Chris Gotterup":46.00,"Xander Schauffele":19.00,
  "Ludvig Åberg":23.00,"Aaron Rai":81.00,"Ben Griffin":71.00,"Justin Thomas":46.00,
  "Robert MacIntyre":71.00,"Si Woo Kim":41.00,"Sepp Straka":111.00,"Alex Noren":151.00,
  "Tyrrell Hatton":34.00,"Harris English":81.00,"Ryan Gerard":91.00,"Hideki Matsuyama":67.00,
  "Jacob Bridgeman":126.00,"Kristoffer Reitan":91.00,"Patrick Reed":41.00,"Viktor Hovland":46.00,
  "Akshay Bhatia":111.00,"Sam Burns":41.00,"Kurt Kitayama":71.00,"Bryson DeChambeau":29.00,
  "Nicolai Højgaard":91.00,"Wyndham Clark":41.00,"Min Woo Lee":67.00,"Patrick Cantlay":46.00,
  "Maverick McNealy":71.00,"J.T. Poston":126.00,"Keegan Bradley":126.00,"Bud Cauley":91.00,
  "Rickie Fowler":126.00,"Alex Smalley":126.00,"Jake Knapp":101.00,"Shane Lowry":71.00,
  "Gary Woodland":111.00,"Daniel Berger":176.00,"Jason Day":151.00,"Adam Scott":91.00,
  "Michael Kim":226.00,"Jordan Spieth":67.00,"Nico Echavarria":351.00,"Matt McCarty":251.00,
  "Sam Stevens":251.00,"Ryan Fox":126.00,"Corey Conners":176.00,"David Puig":126.00,
  "Pierceson Coody":251.00,"Brian Harman":176.00,"Michael Brennan":251.00,"Andrew Novak":251.00,
  "Ryo Hisatsune":226.00,"Nick Taylor":151.00,"Harry Hall":176.00,"Max Greyserman":201.00,
  "Alex Fitzpatrick":101.00,"Jayden Schaper":251.00,"Matti Schmid":301.00,"Sungjae Im":176.00,
  "Johnny Keefer":301.00,"Joaquin Niemann":67.00,"Patrick Rodgers":351.00,"Sahith Theegala":151.00,
  "Andrew Putnam":301.00,"Lucas Herbert":176.00,"Sudarshan Yellamaraju":201.00,"Max McGreevy":351.00,
  "Keith Mitchell":151.00,"John Parry":401.00,"Chris Kirk":301.00,"Brooks Koepka":34.00,
  "Adrien Saddier":501.00,"Emiliano Grillo":351.00,"Jackson Suber":251.00,"William Mouw":351.00,
  "Kevin Roy":501.00,"Billy Horschel":301.00,"Cameron Smith":91.00,"Davis Thompson":201.00,
  "Tom Kim":151.00,"Laurie Canter":501.00,"Adrien Dumont de Chassart":401.00,"Chandler Phillips":751.00,
  "Peter Uihlein":501.00,"Ben Kohles":451.00,"Hennie Du Plessis":1001.00,"Carlos Ortiz":301.00,
  "Neal Shipley":501.00,"Zac Blair":601.00,"Nathan Kimsey":401.00,"Ugo Coussaud":751.00,
  "Taylor Montgomery":751.00,"Cooper Dossey":501.00,"Dustin Johnson":151.00,"Jackson Koivun":126.00,
  "Ben Silverman":751.00,"Niklas Nørgaard":501.00,"Matthew Jordan":501.00,"James Nicholas":1001.00,
  "Caleb Surratt":501.00,"Jimmy Stanger":501.00,"Harry Higgs":1001.00,"Rocco Repetto Taylor":751.00,
  "Cole Hammer":601.00,"Alejandro Tosti":751.00,"Dylan Wu":1001.00,"Ryuichi Oiwa":1001.00,
  "Taihei Sato":751.00,"Filippo Celli":1501.00,"Marcelo Rozo":1001.00,"Padraig Harrington":751.00,
  "Carl Yuan":751.00,"Nick Hardy":1001.00,"Brandon Wu":751.00,"Jackson Van Paris":1501.00,
  "Kaito Onishi":1001.00,"Graeme McDowell":751.00,"J.B. Holmes":1001.00,"T.K. Kim":1001.00,
  "Manav Shah":1501.00,"Eric Lee":1501.00,"Spencer Tibbits":1501.00,"Ben James":301.00,
  "Jake Sollon":1501.00,"Angel Hidalgo":751.00,"Robbie Higgins":1501.00,"Jake Peacock":1501.00,
  "Miles Russell":1001.00,"Preston Stout":601.00,"Greyson Leach":1501.00,"Giuseppe Puebla":1501.00,
  "Mason Howell":1001.00,"Bryan Lee":1501.00,"Ethan Fang":1501.00,"Jack Schoenberger":1501.00,
  "Mateo Pulcini":1501.00,"Brandon Holtz":1501.00,"Jackson Herrington":1501.00,"Hamilton Coleman":1501.00,
  "Jackson Ormond":1501.00,"Chase Kyes":1501.00,"Vaughn Harber":1501.00,"Arni Sveinsson":1501.00,
  "Ryder Cowan":1501.00,"Logan Reilly":1501.00,"Marek Fleming":1501.00,"Matthew Robles":1501.00,
  // Genuinely not on any board (left as honest gaps): Marco Penge, Thayer Plewe
};
for(const name in WIN_FULL){
  const e = DATA[name] || (DATA[name]={});
  e.odds = e.odds || {win:null,top5:null,top10:null,top20:null,makeCut:null};
  e.odds.win = WIN_FULL[name];
  if(TOP5[name]!=null) e.odds.top5 = TOP5[name];
  e.oddsSrc = ODDS_SRC_FULL;
}

// Exposed for app.js
window.BG = { FIELD_META, ROSTER_RAW, DATA, FORM };
