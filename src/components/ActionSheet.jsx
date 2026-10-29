import { useState } from 'react';
import { useGame } from '../store/gameStore.js';
import { useUi } from '../store/uiStore.js';
import {
  getCard, dealDown, dealCards, stockPrice, skillById, skillCost, offerMatches, offerPrice,
  dreamById, fmt,
} from '../engine/engine.js';
import { stocks, ftDeals, ftDisasters, lessons } from '../data/cards.js';
import { spaceTypes } from '../data/board.js';
import { LOAN_STEP } from '../data/constants.js';
import {
  maxBankLoan, passiveIncome, totalExpenses, assetCashflow, freedomRatio, bankRate,
} from '../engine/finance.js';
import { spaceTone } from '../lib/theme.js';
import { pct } from '../lib/format.js';
import { Btn, Stat, Tag } from './Ui.jsx';

const HIDDEN = new Set(['roll', 'move', 'escape', 'win']);
const TAG_TONE = {
  gold: 'bg-mustard text-ink', green: 'bg-lettuce text-ink', red: 'bg-tomato text-white', violet: 'bg-grape text-white',
  sky: 'bg-ocean text-white', amber: 'bg-orange-400 text-ink', rose: 'bg-berry text-white', slate: 'bg-slate-400 text-ink',
  teal: 'bg-teal-400 text-ink', pink: 'bg-fuchsia-500 text-white',
};

function Header({ art, tone, tag, title, text }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`grid size-[72px] shrink-0 animate-pop place-items-center rounded-2xl border-[3px] border-ink text-[40px] pop-shadow ${spaceTone[tone] ?? spaceTone.gold}`}>{art}</div>
      <div className="min-w-0 flex-1">
        {tag && <Tag tone={TAG_TONE[tone] ?? TAG_TONE.gold}>{tag}</Tag>}
        <h2 className="mt-1.5 font-display text-2xl leading-tight [text-wrap:balance]">{title}</h2>
        {text && <p className="mt-0.5 text-[15px] font-bold leading-snug text-ink-soft">{text}</p>}
      </div>
    </div>
  );
}

function Tip({ text }) {
  if (!text) return null;
  return (
    <p className="rounded-xl border-2 border-dashed border-ink/40 bg-paper-2 px-3 py-2 text-sm font-bold">
      <span className="font-display tracking-wide text-tomato">TIP </span>{text}
    </p>
  );
}

function Options({ options, act, locked }) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((o, i) => (
        <Btn key={o.key} disabled={locked || o.disabled} variant={i === 0 ? 'primary' : 'ghost'} onClick={() => act({ type: 'OPTION', key: o.key })} className="flex flex-col items-center leading-tight">
          <span>{o.label}</span>
          {o.sub && <span className="font-sans text-xs font-extrabold opacity-75">{o.sub}</span>}
        </Btn>
      ))}
    </div>
  );
}

function FreedomDelta({ p, addCf }) {
  const before = freedomRatio(p);
  const exp = totalExpenses(p);
  const after = exp > 0 ? Math.max(0, (passiveIncome(p) + addCf) / exp) : 1;
  return (
    <div className="flex items-center justify-between rounded-xl border-2 border-ink/15 bg-white/70 px-3 py-2">
      <span className="text-sm font-extrabold text-ink-soft">Freedom meter</span>
      <span className="font-display text-lg">
        {pct(before)} → <span className={after >= before ? 'text-green-700' : 'text-red-600'}>{pct(after)}</span>
      </span>
    </div>
  );
}

function AssetDeal({ p, card, act, locked }) {
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
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Price" value={fmt(card.cost)} />
        <Stat label="Down payment" value={fmt(down)} tone={down < card.down ? 'text-green-700' : ''} />
        <Stat label="Cashflow / mo" value={`${cf >= 0 ? '+' : ''}${fmt(cf)}`} tone={cf > 0 ? 'text-green-700' : 'text-red-600'} />
        <Stat label="Return / yr" value={pct(roi)} tone={roi >= 0.3 ? 'text-green-700' : roi > 0 ? 'text-amber-700' : 'text-red-600'} />
      </div>
      {card.cost > card.down && <p className="text-xs font-bold text-ink-soft">Includes a {fmt(card.cost - card.down)} mortgage. The cashflow above is after the monthly payment.</p>}
      <FreedomDelta p={p} addCf={cf} />
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
      <Tip text={card.aral ?? lessons.oport} />
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
    </div>
  );
}

function Stepper({ value, set, step, max, format }) {
  const clamp = v => Math.max(0, Math.min(max, v));
  const b = 'press pop-shadow-sm grid size-11 place-items-center rounded-xl border-[2.5px] border-ink bg-paper font-display text-lg';
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={() => set(clamp(value - step * 10))} className={b}>−−</button>
      <button type="button" onClick={() => set(clamp(value - step))} className={b}>−</button>
      <div className="min-w-0 flex-1 text-center font-display text-xl">{format(value)}</div>
      <button type="button" onClick={() => set(clamp(value + step))} className={b}>+</button>
      <button type="button" onClick={() => set(clamp(value + step * 10))} className={b}>++</button>
      <button type="button" onClick={() => set(max)} className={`${b} w-auto px-2 text-sm`}>MAX</button>
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
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Price per share" value={`₱${price.toLocaleString()}`} />
        <Stat label="Dividend / share / mo" value={st.dps ? `₱${st.dps}` : 'None'} />
      </div>
      {p.revealStocks ? (
        <div className="rounded-xl border-2 border-ink/15 bg-white/70 px-3 py-2">
          <div className="flex justify-between text-[11px] font-extrabold uppercase text-ink-soft"><span>Cheap ₱{st.low}</span><span>Usual range</span><span>Pricey ₱{st.high}</span></div>
          <svg viewBox="0 0 100 10" className="mt-1 h-3 w-full" preserveAspectRatio="none" aria-hidden="true">
            <rect x="0.5" y="0.5" width="99" height="9" rx="4.5" className="fill-white stroke-ink" strokeWidth="1" />
            <rect x="0.5" y="0.5" width={Math.max(5, Math.min(99, r * 99))} height="9" rx="4.5" className={r < 0.35 ? 'fill-lettuce' : r > 0.65 ? 'fill-tomato' : 'fill-mustard'} />
          </svg>
        </div>
      ) : (
        <p className="text-sm font-bold text-ink-soft">No idea if this is cheap or expensive. The Stock Basics seminar shows you the usual range.</p>
      )}
      {holding && (
        <div className="flex items-center justify-between rounded-xl border-2 border-ink/15 bg-white/70 px-3 py-2 text-sm font-extrabold">
          <span>You hold {holding.shares.toLocaleString()} at ₱{holding.avgCost.toFixed(1)} avg</span>
          <span className={price >= holding.avgCost ? 'text-green-700' : 'text-red-600'}>{price >= holding.avgCost ? '+' : ''}{fmt((price - holding.avgCost) * holding.shares)}</span>
        </div>
      )}
      <Stepper value={qty} set={setQty} step={lot} max={maxQty} format={v => `${v.toLocaleString()} sh`} />
      <div className="text-center text-sm font-bold text-ink-soft">
        Cost <b className="text-ink">{fmt(qty * price)}</b>
        {st.dps > 0 && qty > 0 && <> · +{fmt(qty * st.dps)}/mo</>}
      </div>
      <Tip text={st.note} />
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
    <div className="flex flex-col gap-3">
      <p className="text-[15px] font-bold text-ink-soft">Low-risk savings that pay 0.55% a month. You can withdraw anytime.</p>
      <Stepper value={amount} set={setAmount} step={LOAN_STEP} max={max} format={fmt} />
      <div className="text-center text-sm font-bold text-ink-soft">+{fmt(amount * 0.0055)}/mo passive income</div>
      <Tip text={card.aral} />
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

function OfferBody({ game, card, act, locked }) {
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
      {rows.length === 0 && <p className="rounded-xl border-2 border-ink/15 bg-white/70 p-3 text-sm font-bold text-ink-soft">Nobody owns one of these. Remember this buyer for next time.</p>}
      {rows.map(({ o, a, price, proceeds }) => (
        <div key={a.id} className="flex items-center gap-3 rounded-xl border-[2.5px] border-ink bg-white p-3 pop-shadow-sm">
          <span className="text-3xl">{a.emoji}</span>
          <div className="min-w-0 flex-1 text-sm font-bold">
            <div className="truncate font-extrabold">{a.name}</div>
            <div className="text-xs text-ink-soft">{game.players.length > 1 ? `${o.name} · ` : ''}Offer {fmt(price)}, owe {fmt(a.mortgage)}</div>
            <div className={`text-xs ${proceeds - a.down >= 0 ? 'text-green-700' : 'text-red-600'}`}>
              You get {fmt(proceeds)} ({proceeds - a.down >= 0 ? 'profit' : 'loss'} {fmt(Math.abs(proceeds - a.down))}), lose {fmt(a.cf)}/mo
            </div>
          </div>
          <Btn size="sm" variant="good" disabled={locked} onClick={() => act({ type: 'SELL_OFFER', pid2: o.id, assetId: a.id })}>Sell</Btn>
        </div>
      ))}
      <Tip text={lessons.merkado} />
      <Btn disabled={locked} onClick={() => act({ type: 'DONE' })}>Done</Btn>
    </div>
  );
}

function SheetContent({ game, p, pend, act, locked }) {
  switch (pend.kind) {
    case 'oport': {
      const loan = maxBankLoan(p);
      const choice = 'press pop-shadow flex flex-col items-center gap-1 rounded-2xl border-[3px] border-ink p-4 disabled:opacity-40';
      return (
        <div className="flex flex-col gap-3">
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
          <Tip text={lessons.oport} />
        </div>
      );
    }
    case 'pick':
      return (
        <div className="flex flex-col gap-3">
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
        <div className="flex flex-col gap-3">
          <Header art={h.art} tone="green" tag={pend.size === 'big' ? 'Big deal' : 'Small deal'} title={h.title} text={h.text} />
          {card.kind === 'stock' && <StockDeal key={pend.cardId} game={game} p={p} card={card} act={act} locked={locked} />}
          {card.kind === 'mp2' && <Mp2Deal key={pend.cardId} p={p} card={card} act={act} locked={locked} />}
          {card.kind !== 'stock' && card.kind !== 'mp2' && <AssetDeal key={pend.cardId} p={p} card={card} act={act} locked={locked} />}
        </div>
      );
    }
    case 'card': {
      const card = getCard(pend.cardId);
      const meta = spaceTypes[pend.deck];
      return (
        <div className="flex flex-col gap-3">
          <Header art={card.emoji} tone={meta.tone} tag={meta.label} title={card.name} text={card.text} />
          <Tip text={card.aral ?? lessons[pend.deck]} />
          <Options options={pend.options} act={act} locked={locked} />
        </div>
      );
    }
    case 'offer':
    case 'market': {
      const card = getCard(pend.cardId);
      return (
        <div className="flex flex-col gap-3">
          <Header art={card.emoji} tone="violet" tag="Market" title={card.name} text={card.text} />
          {pend.kind === 'offer' ? <OfferBody game={game} card={card} act={act} locked={locked} /> : <Btn disabled={locked} onClick={() => act({ type: 'DONE' })}>OK</Btn>}
        </div>
      );
    }
    case 'aral':
      return (
        <div className="flex flex-col gap-3">
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
          <Tip text={lessons.aral} />
          {!pend.free && <Btn variant="ghost" disabled={locked} onClick={() => act({ type: 'SKIP' })}>Skip</Btn>}
        </div>
      );
    case 'tulong':
      return (
        <div className="flex flex-col gap-3">
          <Header art="🤝" tone="rose" tag="Charity" title="Give back" text="Donate 10% of your monthly income. You roll 2 dice for the next 3 turns (more deals, more paydays) and get +1 Diskarte." />
          <Options options={pend.options} act={act} locked={locked} />
        </div>
      );
    case 'info':
      return (
        <div className="flex flex-col gap-3">
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
        <div className="flex flex-col gap-3">
          <Header art={d.emoji} tone={pend.kind === 'gamble' ? 'violet' : 'green'} tag={pend.kind === 'gamble' ? 'Long shot' : 'Business'} title={d.name} text={text} />
          <Stat label="Your cash" value={fmt(p.cash)} />
          <Options options={pend.options} act={act} locked={locked} />
        </div>
      );
    }
    case 'dream': {
      const d = dreamById[pend.dreamId];
      return (
        <div className="flex flex-col gap-3">
          <Header art={d.emoji} tone="pink" tag="Your dream" title={d.name} text={d.text} />
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Price" value={fmt(d.cost)} />
            <Stat label="Your cash" value={fmt(p.cash)} tone={p.cash >= d.cost ? 'text-green-700' : 'text-red-600'} />
          </div>
          <Options options={pend.options} act={act} locked={locked} />
        </div>
      );
    }
    case 'sakuna': {
      const d = ftDisasters[pend.pos];
      return (
        <div className="flex flex-col gap-3">
          <Header art={d.emoji} tone="red" tag="Disaster" title={d.name} text={d.text} />
          <Options options={pend.options} act={act} locked={locked} />
        </div>
      );
    }
    case 'foundation':
      return (
        <div className="flex flex-col gap-3">
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
    case 'tulong': return { art: '🤝', title: 'Charity' };
    case 'info': return { art: pend.emoji, title: pend.title };
    case 'ftdeal':
    case 'gamble': return { art: ftDeals[pend.pos].emoji, title: ftDeals[pend.pos].name };
    case 'dream': return { art: dreamById[pend.dreamId].emoji, title: dreamById[pend.dreamId].name };
    case 'sakuna': return { art: ftDisasters[pend.pos].emoji, title: ftDisasters[pend.pos].name };
    default: return { art: '🕊️', title: 'Foundation' };
  }
}

// Bot turns show a small card that doesn't block the screen.
function BotPeek({ p, pend }) {
  const { art, title } = peekInfo(pend);
  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-sm animate-toast items-center gap-3 rounded-2xl border-[3px] border-ink bg-paper p-2.5 pop-shadow lg:bottom-6">
      <span className="grid size-12 shrink-0 place-items-center rounded-xl border-[2.5px] border-ink bg-mustard text-2xl">{art}</span>
      <span className="min-w-0">
        <span className="block truncate font-display text-lg leading-tight">{title}</span>
        <span className="block animate-pulse text-xs font-extrabold text-ink-soft">{p.name} is deciding...</span>
      </span>
    </div>
  );
}

export default function ActionSheet() {
  const game = useGame(s => s.game);
  const dispatch = useGame(s => s.dispatch);
  const busy = useUi(s => s.busyCount > 0);
  const sheetMin = useUi(s => s.sheetMin);
  const setSheetMin = useUi(s => s.setSheetMin);
  const pend = game?.pending;
  if (!game || !pend || HIDDEN.has(pend.kind) || busy) return null;
  const p = game.players[game.current];
  const humanOffer = pend.kind === 'offer' && pend.anyHuman;
  const locked = p.isBot && !humanOffer;
  if (locked) return <BotPeek game={game} p={p} pend={pend} />;
  if (sheetMin) {
    return (
      <div className="fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-sm lg:bottom-6">
        <Btn size="lg" className="w-full animate-toast" onClick={() => setSheetMin(false)}>Back to the card</Btn>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 z-40 flex animate-fade items-end justify-center bg-ink/45 sm:items-center">
      <div className="max-h-[88dvh] w-full max-w-lg animate-sheet overflow-y-auto rounded-t-[28px] border-[4px] border-b-0 border-ink bg-paper p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:rounded-[28px] sm:border-b-[4px] sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-sm font-extrabold text-ink-soft">{game.players.length > 1 && (p.isBot ? `${p.name}'s card` : p.name === 'You' ? 'Your turn' : `${p.name}'s turn`)}</span>
          <button type="button" onClick={() => setSheetMin(true)} className="press pop-shadow-sm rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-extrabold">
            Check my money
          </button>
        </div>
        <SheetContent game={game} p={p} pend={pend} act={dispatch} locked={locked} />
      </div>
    </div>
  );
}
