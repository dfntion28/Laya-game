// Player-to-player moves: sell a deal card, ask for a loan, hire a fixer, and the cards to answer them.
import { useState } from 'react';
import { getCard, dealDown, rivals, fmt } from '../engine/engine.js';
import { maxBankLoan, assetCashflow, monthlyCashflow } from '../engine/finance.js';
import {
  PITCH_STEP, PITCH_MAX, LOAN_STEP, PLAYER_LOAN_MAX, PLAYER_LOAN_RATES, PERMIT_HOLD_COST, PERMIT_HOLD_FEE,
  PERMIT_CAUGHT_FINE,
} from '../data/constants.js';
import { pct } from '../lib/format.js';
import { Btn, Row, LIST, Stepper } from './Ui.jsx';
import Pawn from './Pawn.jsx';

const rate = r => `${Math.round(r * 100)}%`;

function PlayerPick({ players, value, onPick, note }) {
  return (
    <div className="flex flex-wrap gap-2">
      {players.map(o => {
        const off = note?.(o);
        return (
          <button
            key={o.id}
            type="button"
            disabled={!!off}
            onClick={() => onPick(o.id)}
            className={`press flex items-center gap-1.5 rounded-full border-[2.5px] border-ink py-1 pl-1 pr-3 text-left pop-shadow-sm disabled:opacity-40 ${value === o.id ? 'bg-mustard' : 'bg-white'}`}
          >
            <Pawn color={o.color} job={o.professionId} className="size-8" />
            <span className="leading-tight">
              <span className="block text-sm font-extrabold">{o.name}</span>
              <span className="block text-[11px] font-bold text-ink-soft">{off || `Cash ${fmt(o.cash)}`}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl bg-paper-2/60 p-3">
      <div className="font-display text-lg leading-none">{title}</div>
      {children}
    </div>
  );
}

// On a property or business you landed on: offer the card to another player for a price.
export function SellToPlayer({ game, p, card, pend, act, locked }) {
  const others = rivals(game, p);
  const [to, setTo] = useState(null);
  const [price, setPrice] = useState(Math.max(PITCH_STEP, Math.round((card.cf * 6) / PITCH_STEP) * PITCH_STEP));
  if (!others.length) return null;
  const pitched = pend.pitched || [];
  return (
    <Section title="Sell this deal to a player">
      <p className="text-sm font-bold text-ink-soft">Can't use it? Someone else might pay you for it. They still pay the down payment.</p>
      <PlayerPick players={others} value={to} onPick={setTo} note={o => (pitched.includes(o.id) ? 'Already asked' : null)} />
      <Stepper value={price} set={setPrice} step={PITCH_STEP} max={PITCH_MAX} format={fmt} />
      <Btn variant="blue" disabled={locked || !to || pitched.includes(to)} onClick={() => act({ type: 'PITCH', to, price })}>
        Offer it for {fmt(price)}
      </Btn>
    </Section>
  );
}

// Ask another player for a loan at a rate you choose.
export function AskLoan({ game, p, act, locked, need = 0 }) {
  const others = rivals(game, p);
  const [to, setTo] = useState(null);
  const [amount, setAmount] = useState(Math.max(LOAN_STEP, Math.ceil(need / LOAN_STEP) * LOAN_STEP));
  const [r, setR] = useState(0.02);
  if (!others.length) return null;
  const asked = game.pending?.loanAsked || [];
  const lender = others.find(o => o.id === to);
  const max = Math.min(PLAYER_LOAN_MAX, lender ? Math.floor(lender.cash / LOAN_STEP) * LOAN_STEP : PLAYER_LOAN_MAX);
  const amt = Math.min(amount, max);
  return (
    <Section title="Borrow from a player">
      <p className="text-sm font-bold text-ink-soft">You pay them interest every Payday until you pay it back. The bank charges {rate(0.02)} to {rate(0.03)}. A 5-6 lender, 20%.</p>
      <PlayerPick players={others} value={to} onPick={setTo} note={o => (asked.includes(o.id) ? 'Already asked' : o.cash < LOAN_STEP ? 'No cash' : null)} />
      <Stepper value={amt} set={setAmount} step={LOAN_STEP} max={max} format={fmt} />
      <div className="flex items-center gap-2">
        <span className="text-sm font-extrabold">Interest</span>
        {PLAYER_LOAN_RATES.map(x => (
          <button key={x} type="button" onClick={() => setR(x)} className={`press rounded-full border-2 border-ink px-3 py-1 text-sm font-extrabold pop-shadow-sm ${r === x ? 'bg-mustard' : 'bg-white'}`}>
            {rate(x)}
          </button>
        ))}
      </div>
      <Btn variant="blue" disabled={locked || !to || amt <= 0 || asked.includes(to)} onClick={() => act({ type: 'LOAN_ASK', to, amount: amt, rate: r })} className="flex flex-col items-center leading-tight">
        <span>Ask for {fmt(amt)}</span>
        <span className="font-sans text-xs font-extrabold opacity-80">You'd pay {fmt(amt * r)}/mo</span>
      </Btn>
    </Section>
  );
}

// Pay a fixer to hold a rival's permit.
export function HirePermitFixer({ game, p, act, locked }) {
  const others = rivals(game, p);
  const [to, setTo] = useState(null);
  if (!others.length) return null;
  const used = p.fixerTurn === game.turn;
  return (
    <Section title="Hire a fixer">
      <p className="text-sm font-bold text-ink-soft">
        Pay {fmt(PERMIT_HOLD_COST)} to hold a rival's permit. Their next property or business costs {fmt(PERMIT_HOLD_FEE)} more.
        Roll 1 or 2 and you're caught: {fmt(PERMIT_CAUGHT_FINE)} fine and a credit hit.
      </p>
      <PlayerPick players={others} value={to} onPick={setTo} note={o => (o.permitHold ? 'Already on hold' : null)} />
      <Btn variant="bad" disabled={locked || used || !to || p.cash < PERMIT_HOLD_COST} onClick={() => act({ type: 'PERMIT_HOLD', to })}>
        {used ? 'Once per turn' : `Pay the fixer ${fmt(PERMIT_HOLD_COST)}`}
      </Btn>
    </Section>
  );
}

// Before rolling: optional moves that involve other players.
export function RivalMoves({ game, p, act }) {
  const [open, setOpen] = useState(null);
  if (!rivals(game, p).length || p.track !== 'rat') return null;
  const tab = (id, label) => (
    <button type="button" onClick={() => setOpen(open === id ? null : id)} className={`press flex-1 rounded-xl border-[2.5px] border-ink py-2 font-display text-base pop-shadow-sm ${open === id ? 'bg-mustard' : 'bg-white'}`}>
      {label}
    </button>
  );
  return (
    <div className="flex animate-deal-in flex-col gap-3 rounded-[26px] border-[3px] border-ink bg-paper p-3 pop-shadow">
      <div className="flex items-center justify-between px-1">
        <span className="font-display text-lg">Before you roll</span>
        <span className="text-xs font-extrabold text-ink-soft">Optional</span>
      </div>
      <div className="flex gap-2">
        {tab('loan', 'Borrow')}
        {tab('fixer', 'Fixer')}
      </div>
      {open === 'loan' && <AskLoan game={game} p={p} act={act} />}
      {open === 'fixer' && <HirePermitFixer game={game} p={p} act={act} />}
    </div>
  );
}

// The other side of a pitch: buy, counter once, or say no. After a counter, the seller answers.
export function PitchCard({ game, pend, act, locked, Header }) {
  const seller = game.players.find(o => o.id === pend.seller);
  const buyer = game.players.find(o => o.id === pend.buyer);
  const card = getCard(pend.cardId);
  const down = dealDown(buyer, card, null);
  const cf = assetCashflow(buyer, { kind: card.kind, cf: card.cf });
  const [counter, setCounter] = useState(Math.max(0, Math.round((pend.price * 0.6) / PITCH_STEP) * PITCH_STEP));
  const [countering, setCountering] = useState(false);
  const total = (pend.countered ? pend.counter : pend.price) + down;
  const roi = total > 0 ? (cf * 12) / total : 0;
  const gap = Math.max(0, total - buyer.cash);
  const borrow = gap > 0;
  const canPay = !borrow || (buyer.cash >= (pend.countered ? pend.counter : pend.price) && Math.ceil(gap / LOAN_STEP) * LOAN_STEP <= maxBankLoan(buyer));

  if (pend.countered) {
    return (
      <div className="flex flex-col gap-4">
        <Header art={card.emoji} tone="sky" tag="Counteroffer" title={`${buyer.name} offers ${fmt(pend.counter)}`} text={`You asked ${fmt(pend.price)} for ${card.name}.`} />
        <div className="flex flex-col gap-2.5">
          <Btn variant="good" disabled={locked} onClick={() => act({ type: 'PITCH_ACCEPT' })}>Deal, sell for {fmt(pend.counter)}</Btn>
          <Btn variant="ghost" disabled={locked} onClick={() => act({ type: 'PITCH_DECLINE' })}>No, keep the card</Btn>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <Header art={card.emoji} tone="sky" tag={`Offer from ${seller.name}`} title={card.name} text={`${seller.name} will sell you this deal for ${fmt(pend.price)}.`} />
      <div className={LIST}>
        <Row label={`Pay ${seller.name}`} value={fmt(pend.price)} />
        <Row label="Down payment" sub={card.cost > card.down ? `Price ${fmt(card.cost)}, the rest is a mortgage` : null} value={fmt(down)} />
        <Row label="Cashflow each month" value={`${cf >= 0 ? '+' : ''}${fmt(cf)}`} tone={cf > 0 ? 'text-green-700' : 'text-red-600'} />
        <Row label="Return per year, counting the price" value={pct(roi)} tone={roi >= 0.3 ? 'text-green-700' : roi > 0 ? 'text-amber-700' : 'text-red-600'} />
      </div>
      {countering ? (
        <div className="flex flex-col gap-2.5">
          <Stepper value={counter} set={setCounter} step={PITCH_STEP} max={pend.price} format={fmt} />
          <Btn variant="blue" disabled={locked} onClick={() => act({ type: 'PITCH_COUNTER', price: counter, borrow: counter + down > buyer.cash })}>Offer {fmt(counter)} instead</Btn>
          <Btn variant="ghost" disabled={locked} onClick={() => setCountering(false)}>Back</Btn>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <Btn disabled={locked || !canPay} onClick={() => act({ type: 'PITCH_ACCEPT', borrow })} className="flex flex-col items-center leading-tight">
            <span>Buy it</span>
            <span className="font-sans text-xs font-extrabold opacity-75">{canPay ? (borrow ? `Borrows ${fmt(Math.ceil(gap / LOAN_STEP) * LOAN_STEP)} from the bank` : `${fmt(total)} in total`) : 'Not enough cash, and the bank says no'}</span>
          </Btn>
          <Btn variant="blue" disabled={locked} onClick={() => setCountering(true)}>Counteroffer</Btn>
          <Btn variant="ghost" disabled={locked} onClick={() => act({ type: 'PITCH_DECLINE' })}>No thanks</Btn>
        </div>
      )}
    </div>
  );
}

export function LoanAskCard({ game, pend, act, locked, Header }) {
  const borrower = game.players.find(o => o.id === pend.borrower);
  const lender = game.players.find(o => o.id === pend.pid);
  const interest = Math.round(pend.amount * pend.rate);
  return (
    <div className="flex flex-col gap-4">
      <Header art="🤝" tone="sky" tag="Loan request" title={`${borrower.name} wants to borrow ${fmt(pend.amount)}`} text={`At ${rate(pend.rate)} a month, until they pay it back.`} />
      <div className={LIST}>
        <Row label="You earn each month" value={`+${fmt(interest)}`} tone="text-green-700" />
        <Row label="Your cash after" value={fmt(lender.cash - pend.amount)} tone={lender.cash - pend.amount < 20_000 ? 'text-red-600' : ''} />
        <Row label={`${borrower.name}'s monthly cashflow`} sub="After this loan. Below zero means trouble paying" value={fmt(monthlyCashflow(borrower) - interest)} tone={monthlyCashflow(borrower) - interest < 0 ? 'text-red-600' : 'text-green-700'} />
      </div>
      <p className="text-sm font-bold italic text-ink-soft">Interest counts as passive income for you. If they go bankrupt, you only get half back.</p>
      <div className="flex flex-col gap-2.5">
        <Btn variant="good" disabled={locked || lender.cash < pend.amount} onClick={() => act({ type: 'LOAN_YES' })}>Lend {fmt(pend.amount)}</Btn>
        <Btn variant="ghost" disabled={locked} onClick={() => act({ type: 'LOAN_NO' })}>No</Btn>
      </div>
    </div>
  );
}

