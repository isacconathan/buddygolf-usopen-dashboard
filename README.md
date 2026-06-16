# ⛳ BuddyGolf — 2026 U.S. Open Pick Optimiser

An interactive dashboard to help pick your **12 BuddyGolf players** for the
**2026 U.S. Open (Shinnecock Hills, 18–21 June 2026)**.

> Open `index.html` in any browser. No install, no server.

![type: single-page app](https://img.shields.io/badge/app-single--page-3fb56b) ![data: sourced](https://img.shields.io/badge/data-sourced%20%2B%20gap--flagged-e7b94b)

---

## What it does

- **Value leaderboard** — every player ranked by a **Pick Score (0–100)** you control.
- **Projected Points (xP)** — expected BuddyGolf points for each player, computed
  exactly under the BuddyGolf rules (see below).
- **Weight sliders** — blend four categories live: **Betting value · Season form ·
  Major pedigree · Shinnecock fit**.
- **Team builder** — pick up to 12, see projected total, how many are 51+ "double"
  picks, and **auto-pick the best 12** by your current weights.
- **Player dossier** — click any row: real odds + sources, derived probabilities,
  2026 form (last-5), major & Shinnecock history, and **editable cells** to paste
  real numbers.

## The BuddyGolf rules it encodes

| Finish | Pts | | Finish | Pts |
|---|---|---|---|---|
| Win | 20 | | 9th | 5 |
| 2nd | 15 | | 10th | 4 |
| 3rd | 13 | | 11–15 | 3 |
| 4th | 10 | | 16–20 | 2 |
| 5th | 9 | | 21–30 | 1 |
| 6–8 | 8/7/6 | | made cut >30 | 0 |

- **WGR 51+ (and unranked) earn DOUBLE** all finish points — the key value lever.
- **Missed cut:** −6 (top-10 WGR) / −3 (11–50) / −1 (51+).
- Both rules are toggleable in the UI.

## How the value model works (and its honest limits)

1. **Win odds are real and sourced** (Sportingbet — the user's book — cross-checked
   vs CBS/FanDuel, DraftKings, Yahoo boards). See `data.js` provenance strings.
2. **Top-5/10/20/Make-Cut probabilities are NOT bookmaker quotes.** Those boards
   weren't machine-readable. Instead they are **derived** by a **Plackett-Luce
   Monte-Carlo** simulation (12,000 runs) of the whole field from the real win
   odds — a standard ranking model. They are labelled **"≈ model"** in the UI and
   are **editable**: paste a real % and it overrides the model.
   - *Validation:* the model reconstructs Scheffler's Top-5 at ~38–49% vs the real
     board's 47.6% — same ballpark, never having seen it. Treat derived finish
     splits as directional, not exact.
3. **Unpriced field** (players with no sourced win price) is graded by **World
   Ranking** purely to make the simulated cut realistic. These players are still
   shown as **data gaps** (no displayed value) — never assigned invented odds.
4. **Form / major / Shinnecock** sub-scores are computed from verified, sourced
   facts (2026 finishes; majors won, US Open record; 2018 Shinnecock result).

### Provenance & gaps
- Every data point is sourced or left blank. **Blanks are honest gaps, never guesses.**
- ~55 of 159 players have a sourced win price and a full model; the long tail of
  club pros / amateurs / qualifiers are gap-flagged.
- Known flags carried in the data: **Brooks Koepka** hand injury (US Open in doubt);
  **Jake Knapp / Sungjae Im** injuries; LIV players have thinner week-to-week data;
  one Akshay Bhatia win-odds discrepancy between books.

## Data freshness
Odds and form reflect the research pass on the build date (see footer in-app).
**Re-verify live odds before selections lock** — paste any updated numbers into the
dossier cells to instantly re-rank.

## Files
- `index.html` — UI + styling
- `app.js` — value engine (Monte-Carlo), scoring, rendering
- `data.js` — sourced dataset (odds, form, history) with provenance
- `run_test.js` — headless engine stress-test (`node run_test.js`)

---
*Not affiliated with BuddyGolf. Built as a personal decision-support tool. Bet responsibly.*
