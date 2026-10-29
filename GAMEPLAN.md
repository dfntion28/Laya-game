# LAYA v2 — Game Design Document

Filipino financial-freedom board game inspired by *Rich Dad Poor Dad* (the CASHFLOW idea), rebuilt mobile-first.
Source of truth for numbers is `src/data/*`. This document explains the *why*.

## Design pillars
1. **Phone first.** One thumb, portrait, 10–20 min to escape the Rat Race, autosave.
2. **A decision every turn.** Diskarte (move ±1 / reroll with landing preview), buy/pass/borrow, cash vs installment, sell now vs wait.
3. **Teach by consequence, not text.** Every card shows its effect on the Freedom Meter; a one-line "Aral" (lesson) sits under it.
4. **Variability.** 9 professions (draft 3), 8 dreams (draft 3), ~140 cards, market cycles, Philippine calendar seasons, 11 skills, bot opponents with 3 levels and 5 play styles.
5. **Feel.** Cartoon kitchen-table look (thick outlines, chunky buttons), bouncy motion, a live-synthesized music loop that speeds up on the Fast Track.
6. **Language.** English first, with everyday Filipino words where people actually use them.

## Win flow
| Stage | Goal |
|---|---|
| Rat Race (24 spaces, 1 die) | Passive income ≥ total monthly expenses → **LAYA KA NA!** |
| Fast Track (24 spaces, 2 dice) | Buy your **Pangarap** on its space, or add **₱1.5M** to your Fast Track cashflow |

On escape: Fast Track cashflow = passive income × 20, paid at every Cashflow Day (corners).

## Turn
1. Roll. 2. Optional: spend 1 **Diskarte** to move ±1 or reroll (the buttons show which space each option lands on).
3. Every corner passed = **Payday** (1 month): salary + passive − expenses. Exact landing on Payday = +1 Diskarte.
4. Resolve the space.

## Rat Race spaces
Payday ×4 (corners) · Deal ×8 (choose small or big) · Expense ×3 · Market ×3 · Life ×2 · Seminar · Charity · Laid Off · Contacts.

## Bots
| Level | Behavior |
|---|---|
| Easy | Misses ~20% of good deals, sometimes buys bad ones, picks whatever costs least today, no insurance or seminars, never uses Diskarte |
| Normal | Buys deals above ~22% yearly return, borrows only when the deal beats the interest by 20% |
| Hard | Lower return bar, borrows at a 5% edge, times stocks tighter, sells to buyers sooner, buys seminars earlier |

Styles (Landlord, Hustler, Trader, Saver, Balanced) shift what a bot prefers. `node scripts/simulate.mjs versus 270`: Hard 144, Normal 118, Easy 8 wins.
Fast bots: setting that cuts bot animation and think time to near zero.

## Economy rules
- **Deals**: real estate & business (down payment + mortgage, cashflow is net), stocks (fictional tickers, buy low / sell high, REIT/blue-chip dividends), MP2 savings.
- **Selling**: Merkado buyer offers (×1.2–2.5 of price, or 30–45× cashflow for businesses). Fire sale anytime at 85% (businesses 12× cashflow).
- **Bank loans**: ₱10K steps, interest-only 2%/mo (credit ≥700) or 3%/mo; bank lends only while monthly cashflow stays ≥ 0.
- **Negative cash** → automatic emergency bank loan → if refused, **5-6 lender** (20%/mo) → past ₱300K of 5-6 debt, **bankruptcy** (assets sold at 50%, debts halved, credit 450).
- **Credit score** 300–850: emergency loans and 5-6 lower it; paying off loans and 6 clean paydays raise it.
- **Insurance** ₱2,500/mo: covers 80% of medical and typhoon bills.
- **Market cycle** bull/normal/bear: ±20% on stock prices and buyer offers. Changes via Merkado cards or random drift.

## Philippine calendar (per player, 1 payday = 1 month)
December: 13th-month pay (employees) and Pasko spending · June: school fees per child · July–October: typhoon risk (1 in 6 per payday).

## Professions (difficulty from simulation)
Guro ★★, Nars ★, BPO ★★, Inhinyero ★, Kawani ★★, Seaman ★, Negosyante ★★, Doktor ★★★, Freelancer ★★ — each with a trait (e.g. Inhinyero −15% real-estate down payment, Kawani immune to layoffs, Doktor high salary but ₱39K/mo of loans).

## Balance targets (from `node scripts/simulate.mjs 100 1`, bot player)
- Median escape: ~30–42 turns (~20–25 months); Doktor ~50+.
- Fast Track: ~15–25 more turns. Bankruptcy rate: 0–11% depending on profession.
- Every rule change must be re-checked with the simulator; it also fails on any exception or NaN.

## Out of scope (ideas for later)
Online multiplayer, accounts/leaderboards, offline service worker, more languages (English toggle).
