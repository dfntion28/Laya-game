import { useEffect, useRef, useState } from 'react';
import { useGame } from '../store/gameStore.js';
import { useUi } from '../store/uiStore.js';
import {
  getCard, dealDown, dealCards, stockPrice, skillById, skillCost, offerMatches, offerPrice,
  dreamById, fmt, actorOf, rivals,
} from '../engine/engine.js';
import { useControls } from '../store/netStore.js';
import { SellToPlayer, AskLoan, RivalMoves, PitchCard, LoanAskCard } from './PlayerDeals.jsx';
import { stocks, ftDeals, ftDisasters } from '../data/cards.js';
import { cardCoach, dealCoach, stockCoach, mp2Coach, oportCoach, seminarCoach } from '../engine/learn.js';
import { spaceTypes } from '../data/board.js';
import { LOAN_STEP, PERMIT_HOLD_FEE } from '../data/constants.js';
import {
  maxBankLoan, passiveIncome, totalExpenses, assetCashflow, freedomRatio, bankRate,
} from '../engine/finance.js';
import { spaceTone } from '../lib/theme.js';
import { pct } from '../lib/format.js';
import { Btn, Row, LIST, Stepper } from './Ui.jsx';

const HIDDEN = new Set(['roll', 'move', 'escape', 'win']);
const TAG_TEXT = {
  gold: 'text-amber-700', green: 'text-green-700', red: 'text-red-600', violet: 'text-violet-700',
  sky: 'text-blue-700', amber: 'text-orange-700', rose: 'text-pink-700', slate: 'text-slate-600',
  teal: 'text-teal-700', pink: 'text-fuchsia-700',
};

function Header({ art, tone, tag, title, text }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`grid size-16 shrink-0 animate-pop place-items-center rounded-2xl border-[2.5px] border-ink text-4xl ${spaceTone[tone] ?? spaceTone.gold}`}>{art}</div>
      <div className="min-w-0 flex-1 pt-0.5">
        {tag && <div className={`text-xs font-extrabold uppercase tracking-widest ${TAG_TEXT[tone] ?? TAG_TEXT.gold}`}>{tag}</div>}
        <h2 className="font-display text-2xl leading-tight [text-wrap:balance]">{title}</h2>
        {text && <p className="mt-1 text-[15px] font-bold leading-snug text-ink-soft">{text}</p>}
      </div>
    </div>
  );
}

// The card's lesson, plus a note worked out from the player's own numbers.
function Coach({ lines, aral }) {
  const list = (Array.isArray(lines) ? lines : [lines]).filter(Boolean);
  if (!list.length && !aral) return null;
  return (
    <div className="rounded-2xl bg-sky/25 px-3.5 py-3">
      {list.length > 0 && (
        <>
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-blue-800">Think it through</div>
          <ul className="mt-1 flex flex-col gap-1 text-sm font-bold leading-snug">
            {list.map(l => <li key={l}>{l}</li>)}
          </ul>
        </>
      )}
      {aral && <p className={`text-sm font-bold italic leading-snug text-ink-soft ${list.length ? 'mt-2 border-t-2 border-ink/10 pt-2' : ''}`}>{aral}</p>}
    </div>
  );
}

function Options({ options, act, locked }) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((o, i) => (
        <div key={o.key} className="flex flex-col gap-1">
          <Btn disabled={locked || o.disabled} variant={i === 0 ? 'primary' : 'ghost'} onClick={() => act({ type: 'OPTION', key: o.key })} className="flex flex-col items-center leading-tight">
            <span>{o.label}</span>
            {o.sub && <span className="font-sans text-xs font-extrabold opacity-75">{o.sub}</span>}
          </Btn>
          {o.math?.length > 0 && (
            <ul className="px-2 text-xs font-bold leading-snug text-ink-soft">
              {o.math.map(m => <li key={m}>{m}</li>)}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function freedomAfter(p, addCf) {
  const exp = totalExpenses(p);
  return exp > 0 ? Math.max(0, (passiveIncome(p) + addCf) / exp) : 1;
}

function AssetDeal({ game, pend, p, card, act, locked }) {
  const eligible = dealCards(p).filter(id => {
    const c = getCard(id);
    return (c.effect === 'down_minus_30' && card.kind === 'realestate') || (c.effect === 'biz_half' && card.kind === 'business');
  });
  const [useCard, setUseCard] = useState(null);
  const down = dealDown(p, card, useCard);
  const cf = assetCashflow(p, { kind: card.kind, cf: card.cf });
  const need = Math.max(0, down - p.cash);
  const borrow = Math.ceil(need / LOAN_STEP) * LOAN_STEP;
  const canBorrow = borrow > 0 && borrow <= maxBankLoan(p);
  const roi = down > 0 ? (cf * 12) / down : 0;
  return (
    <div className="flex flex-col gap-4">
      <div className={LIST}>
        <Row label="You pay now" sub={card.cost > card.down ? `Price ${fmt(card.cost)}, the rest is a mortgage` : null} value={fmt(down)} tone={down < card.down ? 'text-green-700' : p.permitHold ? 'text-red-600' : ''} />
        {p.permitHold && <Row label="Includes permit fixing" sub="A rival's fixer is holding your permit" value={`+${fmt(PERMIT_HOLD_FEE)}`} tone="text-red-600" />}
        <Row label="Cashflow each month" sub="After the mortgage payment" value={`${cf >= 0 ? '+' : ''}${fmt(cf)}`} tone={cf > 0 ? 'text-green-700' : 'text-red-600'} />
        <Row label="Return per year" value={pct(roi)} tone={roi >= 0.3 ? 'text-green-700' : roi > 0 ? 'text-amber-700' : 'text-red-600'} />
        <Row label="Freedom meter" value={`${pct(freedomRatio(p))} → ${pct(freedomAfter(p, cf))}`} />
      </div>
      {eligible.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {eligible.map(id => {
            const c = getCard(id);
            const on = useCard === id;
            return (
              <button key={id} type="button" onClick={() => setUseCard(on ? null : id)} className={`press rounded-full border-2 border-ink px-3 py-1.5 text-xs font-extrabold pop-shadow-sm ${on ? 'bg-teal-400' : 'bg-paper'}`}>
                {on ? 'Using' : 'Use'} {c.name}
              </button>
            );
          })}
        </div>
      )}
      <Coach lines={dealCoach(p, card, down, cf, need > 0 && canBorrow ? borrow : 0)} aral={card.aral} />
      <div className="flex flex-col gap-2.5">
        {need === 0 ? (
          <Btn disabled={locked} onClick={() => act({ type: 'BUY', useCard })}>Buy for {fmt(down)}</Btn>
        ) : (
          <Btn disabled={locked || !canBorrow} onClick={() => act({ type: 'BUY', borrow: true, useCard })} className="flex flex-col items-center leading-tight">
            <span>Borrow {fmt(borrow)} and buy</span>
            <span className="font-sans text-xs font-extrabold opacity-75">
              {canBorrow ? `Adds ${fmt(borrow * bankRate(p))}/mo in interest` : 'The bank says no. Your cashflow is too low.'}
            </span>
          </Btn>
        )}
        <Btn variant="ghost" disabled={locked} onClick={() => act({ type: 'PASS' })}>Pass</Btn>
      </div>
      {need > 0 && <AskLoan game={game} p={p} act={act} locked={locked} need={need} />}
      <SellToPlayer game={game} p={p} card={card} pend={pend} act={act} locked={locked} />
    </div>
  );
}

function StockDeal({ game, p, card, act, locked }) {
  const st = stocks[card.symbol];
  const price = stockPrice(game, card);
  const lot = 100;
  const maxQty = Math.floor(p.cash / price / lot) * lot;
  const [qty, setQty] = useState(0);
  const holding = p.assets.find(a => a.kind === 'stock' && a.symbol === card.symbol);
  const r = (price - st.low) / (st.high - st.low);
  return (
    <div className="flex flex-col gap-4">
      <div className={LIST}>
        <Row label="Price per share" value={`₱${price.toLocaleString()}`} />
        <Row label="Monthly dividend per share" value={st.dps ? `₱${st.dps}` : 'None'} />
        {holding && (
          <Row label={`You hold ${holding.shares.toLocaleString()}`} sub={`Bought at ₱${holding.avgCost.toFixed(1)} average`} value={`${price >= holding.avgCost ? '+' : ''}${fmt((price - holding.avgCost) * holding.shares)}`} tone={price >= holding.avgCost ? 'text-green-700' : 'text-red-600'} />
        )}
      </div>
      {p.revealStocks ? (
        <div>
          <div className="flex justify-between text-[11px] font-extrabold uppercase text-ink-soft"><span>Cheap ₱{st.low}</span><span>Usual range</span><span>Pricey ₱{st.high}</span></div>
          <svg viewBox="0 0 100 10" className="mt-1 h-3 w-full" preserveAspectRatio="none" aria-hidden="true">
            <rect x="0.5" y="0.5" width="99" height="9" rx="4.5" className="fill-white stroke-ink" strokeWidth="1" />
            <rect x="0.5" y="0.5" width={Math.max(5, Math.min(99, r * 99))} height="9" rx="4.5" className={r < 0.35 ? 'fill-lettuce' : r > 0.65 ? 'fill-tomato' : 'fill-mustard'} />
          </svg>
        </div>
      ) : (
        <p className="text-sm font-bold text-ink-soft">No idea if this is cheap or expensive. The Stock Basics seminar shows you the usual range.</p>
      )}
      <Stepper value={qty} set={setQty} step={lot} max={maxQty} format={v => `${v.toLocaleString()} sh`} />
      <div className="text-center text-sm font-bold text-ink-soft">
        Cost <b className="text-ink">{fmt(qty * price)}</b>
        {st.dps > 0 && qty > 0 && <> · +{fmt(qty * st.dps)}/mo</>}
      </div>
      <Coach lines={stockCoach(p, st, price, holding)} />
      <div className="grid grid-cols-2 gap-2">
        <Btn disabled={locked || qty === 0} onClick={() => act({ type: 'BUY', qty })}>Buy</Btn>
        <Btn variant="good" disabled={locked || !holding} onClick={() => act({ type: 'SELL', qty: holding?.shares })}>Sell all</Btn>
      </div>
      <Btn variant="ghost" disabled={locked} onClick={() => act({ type: 'PASS' })}>Pass</Btn>
    </div>
  );
}

function Mp2Deal({ p, card, act, locked }) {
  const max = Math.floor(p.cash / LOAN_STEP) * LOAN_STEP;
  const [amount, setAmount] = useState(Math.min(max, 20_000));
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[15px] font-bold text-ink-soft">Low-risk savings that pay 0.55% a month. You can withdraw anytime.</p>
      <Stepper value={amount} set={setAmount} step={LOAN_STEP} max={max} format={fmt} />
      <div className="text-center text-sm font-bold text-ink-soft">+{fmt(amount * 0.0055)}/mo passive income</div>
      <Coach lines={mp2Coach(p)} aral={card.aral} />
      <Btn disabled={locked || amount <= 0} onClick={() => act({ type: 'BUY', amount })}>Deposit</Btn>
      <Btn variant="ghost" disabled={locked} onClick={() => act({ type: 'PASS' })}>Pass</Btn>
    </div>
  );
}

function dealHeader(card, size) {
  if (card.kind === 'stock') {
    const st = stocks[card.symbol];
    return { art: st.emoji, title: `${st.name} (${card.symbol})`, text: 'Buy low, sell high. Or collect the dividend.' };
  }
  if (card.kind === 'mp2') return { art: '🐷', title: card.name, text: null };
  const kind = card.kind === 'business' ? 'Business' : 'Real estate';
  return { art: card.emoji, title: card.name, text: `${kind}${card.units > 1 ? ` · ${card.units} units` : ''}${size === 'big' ? ' · big deal' : ''}` };
}

function OfferBody({ game, card, act, locked, canAct }) {
  const rows = [];
  for (const o of game.players) {
    if (o.isBot || o.track !== 'rat') continue;
    for (const a of o.assets) {
      if (!offerMatches(card, a)) continue;
      const price = offerPrice(game, card, a);
      rows.push({ o, a, price, proceeds: price - a.mortgage });
    }
  }
  return (
    <div className="flex flex-col gap-2.5">
      {rows.length === 0 && <p className="text-[15px] font-bold text-ink-soft">Nobody owns one of these. Remember this buyer for next time.</p>}
      <div className={LIST}>
      {rows.map(({ o, a, price, proceeds }) => (
        <div key={a.id} className="flex items-center gap-3 py-2.5">
          <span className="text-3xl">{a.emoji}</span>
          <div className="min-w-0 flex-1 text-sm font-bold">
            <div className="truncate font-extrabold">{a.name}</div>
            <div className="text-xs text-ink-soft">{game.players.length > 1 ? `${o.name} · ` : ''}Offer {fmt(price)}, owe {fmt(a.mortgage)}</div>
            <div className={`text-xs ${proceeds - a.down >= 0 ? 'text-green-700' : 'text-red-600'}`}>
              You get {fmt(proceeds)} ({proceeds - a.down >= 0 ? 'profit' : 'loss'} {fmt(Math.abs(proceeds - a.down))}), lose {fmt(a.cf)}/mo
            </div>
          </div>
          <Btn size="sm" variant="good" disabled={!canAct(o.id)} onClick={() => act({ type: 'SELL_OFFER', pid2: o.id, assetId: a.id })}>Sell</Btn>
        </div>
      ))}
      </div>
      <Coach aral={card.aral} />
      <Btn disabled={locked} onClick={() => act({ type: 'DONE' })}>Done</Btn>
    </div>
  );
}

function SheetContent({ game, p, pend, act, locked, canAct }) {
  switch (pend.kind) {
    case 'pitch':
      return <PitchCard key={`${pend.cardId}-${pend.countered}`} game={game} pend={pend} act={act} locked={locked} Header={Header} />;
    case 'loanask':
      return <LoanAskCard game={game} pend={pend} act={act} locked={locked} Header={Header} />;
    case 'oport': {
      const loan = maxBankLoan(p);
      const choice = 'press pop-shadow flex flex-col items-center gap-1 rounded-2xl border-[3px] border-ink p-4 disabled:opacity-40';
      return (
        <div className="flex flex-col gap-4">
          <Header art="💼" tone="green" tag="Deal" title="Small or big?" text={`Cash: ${fmt(p.cash)}. The bank will lend up to ${fmt(loan)}.`} />
          <div className="grid grid-cols-2 gap-3">
            <button type="button" disabled={locked} onClick={() => act({ type: 'CHOOSE_DEAL', size: 'small' })} className={`${choice} bg-lettuce`}>
              <span className="font-display text-2xl">Small</span>
              <span className="text-center text-xs font-extrabold">Stocks, small shops, condos. ₱20K to ₱350K</span>
            </button>
            <button type="button" disabled={locked} onClick={() => act({ type: 'CHOOSE_DEAL', size: 'big' })} className={`${choice} bg-mustard`}>
              <span className="font-display text-2xl">Big</span>
              <span className="text-center text-xs font-extrabold">Apartments, big businesses. ₱350K to ₱900K down</span>
            </button>
          </div>
          <Coach lines={oportCoach(p, loan)} />
        </div>
      );
    }
    case 'pick':
      return (
        <div className="flex flex-col gap-4">
          <Header art="🏠" tone="green" tag="Real Estate 101" title="Pick one" text="Your skill lets you see two big deals." />
          {pend.cards.map((id, i) => {
            const c = getCard(id);
            const down = dealDown(p, c);
            return (
              <button key={id} type="button" disabled={locked} onClick={() => act({ type: 'PICK', index: i })} className="press pop-shadow-sm flex items-center gap-3 rounded-xl border-[2.5px] border-ink bg-white p-3 text-left">
                <span className="text-3xl">{c.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-extrabold">{c.name}</span>
                  <span className="text-xs font-bold text-ink-soft">{fmt(down)} down · <span className={c.cf > 0 ? 'text-green-700' : 'text-red-600'}>{fmt(c.cf)}/mo</span> · {pct((c.cf * 12) / down)}/yr</span>
                </span>
              </button>
            );
          })}
        </div>
      );
    case 'deal': {
      const card = getCard(pend.cardId);
      const h = dealHeader(card, pend.size);
      return (
        <div className="flex flex-col gap-4">
          <Header art={h.art} tone="green" tag={pend.size === 'big' ? 'Big deal' : 'Small deal'} title={h.title} text={h.text} />
          {card.kind === 'stock' && <StockDeal key={pend.cardId} game={game} p={p} card={card} act={act} locked={locked} />}
          {card.kind === 'mp2' && <Mp2Deal key={pend.cardId} p={p} card={card} act={act} locked={locked} />}
          {card.kind !== 'stock' && card.kind !== 'mp2' && <AssetDeal key={pend.cardId} game={game} pend={pend} p={p} card={card} act={act} locked={locked} />}
        </div>
      );
    }
    case 'card': {
      const card = getCard(pend.cardId);
      const meta = spaceTypes[pend.deck];
      return (
        <div className="flex flex-col gap-4">
          <Header art={card.emoji} tone={meta.tone} tag={meta.label} title={card.name} text={card.text} />
          <Coach lines={cardCoach(p, card)} aral={card.aral} />
          <Options options={pend.options} act={act} locked={locked} />
        </div>
      );
    }
    case 'offer':
    case 'market': {
      const card = getCard(pend.cardId);
      return (
        <div className="flex flex-col gap-4">
          <Header art={card.emoji} tone="violet" tag="Market" title={card.name} text={card.text} />
          {pend.kind === 'offer' ? <OfferBody game={game} card={card} act={act} locked={locked} canAct={canAct} /> : (
            <>
              <Coach aral={card.aral} />
              <Btn disabled={locked} onClick={() => act({ type: 'DONE' })}>OK</Btn>
            </>
          )}
        </div>
      );
    }
    case 'aral':
      return (
        <div className="flex flex-col gap-4">
          <Header art="🎓" tone="amber" tag="Seminar" title={pend.free ? 'Free seminar' : 'Learn a skill'} text="Skills last the whole game. Pick one." />
          {pend.skills.map(id => {
            const k = skillById[id];
            const cost = pend.free ? 0 : skillCost(p, k);
            return (
              <button key={id} type="button" disabled={locked || p.cash < cost} onClick={() => act({ type: 'LEARN', skillId: id })} className="press pop-shadow-sm flex items-center gap-3 rounded-xl border-[2.5px] border-ink bg-white p-3 text-left disabled:opacity-40">
                <span className="text-3xl">{k.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold">{k.name}</span>
                  <span className="text-xs font-bold text-ink-soft">{k.text}</span>
                </span>
                <span className="font-display text-lg">{cost ? fmt(cost) : 'FREE'}</span>
              </button>
            );
          })}
          <Coach aral={seminarCoach(p)} />
          {!pend.free && <Btn variant="ghost" disabled={locked} onClick={() => act({ type: 'SKIP' })}>Skip</Btn>}
        </div>
      );
    case 'tulong':
      return (
        <div className="flex flex-col gap-4">
          <Header art="🤝" tone="rose" tag="Charity" title="Give back" text="Donate 10% of your monthly income. You roll 2 dice for the next 3 turns (more deals, more paydays) and get +1 Diskarte." />
          <Options options={pend.options} act={act} locked={locked} />
        </div>
      );
    case 'info':
      return (
        <div className="flex flex-col gap-4">
          <Header art={pend.emoji} tone={pend.tone === 'bad' ? 'red' : pend.tone === 'good' ? 'green' : 'teal'} title={pend.title} text={pend.text} />
          <Btn disabled={locked} onClick={() => act({ type: 'DONE' })}>OK</Btn>
        </div>
      );
    case 'ftdeal':
    case 'gamble': {
      const d = ftDeals[pend.pos];
      const text = pend.kind === 'gamble'
        ? `Put in ${fmt(d.cost)} and roll one die. ${d.need} or higher pays ${fmt(d.win)}. Anything else, you lose it.`
        : `Adds ${fmt(d.cf)} to your Fast Track cashflow.`;
      return (
        <div className="flex flex-col gap-4">
          <Header art={d.emoji} tone={pend.kind === 'gamble' ? 'violet' : 'green'} tag={pend.kind === 'gamble' ? 'Long shot' : 'Business'} title={d.name} text={text} />
          <div className={LIST}><Row label="Your cash" value={fmt(p.cash)} /></div>
          <Options options={pend.options} act={act} locked={locked} />
        </div>
      );
    }
    case 'dream': {
      const d = dreamById[pend.dreamId];
      return (
        <div className="flex flex-col gap-4">
          <Header art={d.emoji} tone="pink" tag="Your dream" title={d.name} text={d.text} />
          <div className={LIST}>
            <Row label="Price" value={fmt(d.cost)} />
            <Row label="Your cash" value={fmt(p.cash)} tone={p.cash >= d.cost ? 'text-green-700' : 'text-red-600'} />
          </div>
          <Options options={pend.options} act={act} locked={locked} />
        </div>
      );
    }
    case 'sakuna': {
      const d = ftDisasters[pend.pos];
      return (
        <div className="flex flex-col gap-4">
          <Header art={d.emoji} tone="red" tag="Disaster" title={d.name} text={d.text} />
          <Options options={pend.options} act={act} locked={locked} />
        </div>
      );
    }
    case 'foundation':
      return (
        <div className="flex flex-col gap-4">
          <Header art="🕊️" tone="rose" tag="Foundation" title="Start a foundation" text="Donate ₱1M and roll 3 dice for the next 3 turns." />
          <Options options={pend.options} act={act} locked={locked} />
        </div>
      );
    default:
      return null;
  }
}

function peekInfo(pend) {
  switch (pend.kind) {
    case 'oport': return { art: '💼', title: 'Picking a deal' };
    case 'pick': return { art: '🏠', title: 'Comparing two deals' };
    case 'deal': {
      const c = getCard(pend.cardId);
      return c.kind === 'stock' ? { art: stocks[c.symbol].emoji, title: `${stocks[c.symbol].name} at ₱${c.price}` } : { art: c.emoji ?? '🐷', title: c.name };
    }
    case 'card':
    case 'market':
    case 'offer': {
      const c = getCard(pend.cardId);
      return { art: c.emoji, title: c.name };
    }
    case 'aral': return { art: '🎓', title: 'At a seminar' };
    case 'pitch': return { art: getCard(pend.cardId).emoji, title: pend.countered ? `Counteroffer: ${fmt(pend.counter)}` : `Deal offered for ${fmt(pend.price)}` };
    case 'loanask': return { art: '🤝', title: `Loan request: ${fmt(pend.amount)}` };
    case 'tulong': return { art: '🤝', title: 'Charity' };
    case 'info': return { art: pend.emoji, title: pend.title };
    case 'ftdeal':
    case 'gamble': return { art: ftDeals[pend.pos].emoji, title: ftDeals[pend.pos].name };
    case 'dream': return { art: dreamById[pend.dreamId].emoji, title: dreamById[pend.dreamId].name };
    case 'sakuna': return { art: ftDisasters[pend.pos].emoji, title: ftDisasters[pend.pos].name };
    default: return { art: '🕊️', title: 'Foundation' };
  }
}

// When someone else is deciding (a bot, or another phone online), show a slim card so you can follow.
function Peek({ p, pend }) {
  const { art, title } = peekInfo(pend);
  return (
    <div className="flex animate-deal-in items-center gap-3 rounded-2xl border-[3px] border-ink bg-paper p-2.5 pop-shadow">
      <span className="grid size-12 shrink-0 place-items-center rounded-xl border-[2.5px] border-ink bg-mustard text-2xl">{art}</span>
      <span className="min-w-0">
        <span className="block truncate font-display text-lg leading-tight">{title}</span>
        <span className="block animate-pulse text-xs font-extrabold text-ink-soft">{p.name} is deciding...</span>
      </span>
    </div>
  );
}

// The card for the space you landed on. It sits in the page under the board (or beside it on wide
// screens) instead of covering the game, and deals in once the pawn has landed.
export default function TurnCard() {
  const game = useGame(s => s.shown ?? s.game);
  const dispatch = useGame(s => s.dispatch);
  const busy = useUi(s => s.busyCount > 0);
  const canAct = useControls(game);
  const ref = useRef(null);
  const pend = game?.pending;
  const current = game?.players[game.current];
  const beforeRoll = !!pend && pend.kind === 'roll' && !busy && canAct(current.id) && game.players.length > 1;
  const show = !!game && !!pend && !HIDDEN.has(pend.kind) && !busy;
  const key = show ? `${game.turn}-${pend.kind}-${pend.cardId ?? pend.pos ?? ''}-${pend.pid ?? ''}-${pend.countered ?? ''}` : null;

  useEffect(() => {
    if (!key || !ref.current) return;
    const box = ref.current.getBoundingClientRect();
    if (box.bottom > window.innerHeight - 80 || box.top < 0) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: box.height > window.innerHeight * 0.7 ? 'start' : 'end' });
    }
  }, [key]);

  if (beforeRoll && rivals(game, current).length) return <RivalMoves key={game.turn} game={game} p={current} act={dispatch} />;
  if (!show) return null;
  const actor = actorOf(game);
  const humanOffer = pend.kind === 'offer' && game.players.some(o => canAct(o.id) && o.track === 'rat' && o.assets.some(a => offerMatches(getCard(pend.cardId), a)));
  const locked = !canAct(actor.id);
  const handOff = actor.id !== current.id && !actor.isBot && !current.isBot && canAct(actor.id) && canAct(current.id);
  return (
    <div ref={ref} className="scroll-mt-3 scroll-mb-24 lg:scroll-mb-4">
      {locked && !humanOffer ? (
        <Peek p={actor} pend={pend} />
      ) : (
        <div key={key} className="animate-deal-in rounded-[26px] border-[3px] border-ink bg-paper p-4 pop-shadow sm:p-5">
          {handOff && <div className="mb-3 rounded-xl bg-ocean px-3 py-2 text-center font-display text-lg text-white">Hand the phone to {actor.name}</div>}
          {game.players.length > 1 && !handOff && (
            <div className="mb-2 text-sm font-extrabold text-ink-soft">{actor.name === 'You' ? 'Your card' : `${actor.name}'s card`}</div>
          )}
          <SheetContent game={game} p={current} pend={pend} act={dispatch} locked={locked} canAct={canAct} />
        </div>
      )}
    </div>
  );
}

// On the Money/Assets/Log tabs (phones), a reminder that a card is still waiting.
export function CardWaiting() {
  const game = useGame(s => s.shown ?? s.game);
  const busy = useUi(s => s.busyCount > 0);
  const setTab = useUi(s => s.setTab);
  const canAct = useControls(game);
  const pend = game?.pending;
  if (!pend || HIDDEN.has(pend.kind) || busy || !canAct(actorOf(game).id)) return null;
  return (
    <Btn variant="primary" className="w-full" onClick={() => setTab('board')}>Back to your card</Btn>
  );
}
