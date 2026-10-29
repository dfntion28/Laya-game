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
import { spaceTone, chipTone } from '../lib/theme.js';
import { pct } from '../lib/format.js';

const HIDDEN = new Set(['roll', 'move', 'escape', 'win']);

function Btn({ children, onClick, disabled, variant = 'primary', className = '' }) {
  const styles = {
    primary: 'bg-gradient-to-b from-amber-300 to-gold-deep btn-3d text-night',
    good: 'bg-gradient-to-b from-emerald-300 to-emerald-500 text-emerald-950 shadow-[0_5px_0_#047857] active:translate-y-[3px] active:shadow-[0_2px_0_#047857]',
    ghost: 'bg-white/10 text-cream ring-1 ring-white/20 shadow-[0_4px_0_rgb(0_0_0/0.3)] active:translate-y-[3px] active:shadow-none',
    bad: 'bg-gradient-to-b from-rose-300 to-rose-500 text-rose-950 shadow-[0_5px_0_#9f1239] active:translate-y-[3px] active:shadow-[0_2px_0_#9f1239]',
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`min-h-12 rounded-xl px-4 py-2.5 font-display text-base font-semibold transition disabled:opacity-40 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function Stat({ label, value, tone = '' }) {
  return (
    <div className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className={`font-display text-base font-semibold sm:text-lg ${tone}`}>{value}</div>
    </div>
  );
}

function Header({ emoji, tone, chip, title, text }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`grid size-16 shrink-0 animate-pop place-items-center rounded-2xl text-4xl shadow-lg ${spaceTone[tone] ?? spaceTone.gold}`}>{emoji}</div>
      <div className="min-w-0 flex-1">
        {chip && <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${chipTone[tone] ?? chipTone.gold}`}>{chip}</span>}
        <h2 className="mt-1 font-display text-xl font-bold leading-tight text-cream sm:text-2xl">{title}</h2>
        {text && <p className="mt-1 text-sm leading-snug text-violet-100/90">{text}</p>}
      </div>
    </div>
  );
}

function Lesson({ text }) {
  if (!text) return null;
  return <p className="rounded-xl bg-violet-400/10 px-3 py-2 text-xs italic text-violet-100 ring-1 ring-violet-300/20">💡 {text}</p>;
}

function Options({ options, act, locked }) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((o, i) => (
        <Btn key={o.key} disabled={locked || o.disabled} variant={i === 0 ? 'primary' : 'ghost'} onClick={() => act({ type: 'OPTION', key: o.key })} className="flex flex-col items-center leading-tight">
          <span>{o.label}</span>
          {o.sub && <span className="text-[11px] font-normal opacity-75">{o.sub}</span>}
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
    <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10">
      <span className="text-muted">Freedom meter</span>
      <span className="font-display font-semibold">
        {pct(before)} <span className="text-muted">→</span> <span className={after >= before ? 'text-good' : 'text-bad'}>{pct(after)}</span>
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
        <Stat label="Presyo" value={fmt(card.cost)} />
        <Stat label="Down payment" value={fmt(down)} tone={down < card.down ? 'text-good' : ''} />
        <Stat label="Cashflow / buwan" value={`${cf >= 0 ? '+' : ''}${fmt(cf)}`} tone={cf > 0 ? 'text-good' : 'text-bad'} />
        <Stat label="Return / taon (ROI)" value={pct(roi)} tone={roi >= 0.3 ? 'text-good' : roi > 0 ? 'text-amber-300' : 'text-bad'} />
      </div>
      {card.cost > card.down && (
        <p className="text-xs text-muted">Mortgage na {fmt(card.cost - card.down)} — kasama na ang hulog sa net cashflow.</p>
      )}
      <FreedomDelta p={p} addCf={cf} />
      {eligible.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {eligible.map(id => {
            const c = getCard(id);
            const on = useCard === id;
            return (
              <button key={id} type="button" onClick={() => setUseCard(on ? null : id)} className={`rounded-full px-3 py-1.5 text-xs ring-1 ${on ? 'bg-teal-400 text-teal-950 ring-teal-300' : 'bg-teal-400/10 text-teal-200 ring-teal-400/40'}`}>
                {c.emoji} {on ? 'Ginagamit' : 'Gamitin'}: {c.name}
              </button>
            );
          })}
        </div>
      )}
      <Lesson text={card.aral ?? lessons.oport} />
      <div className="flex flex-col gap-2">
        {need === 0 ? (
          <Btn disabled={locked} onClick={() => act({ type: 'BUY', useCard })}>Bilhin · {fmt(down)}</Btn>
        ) : (
          <Btn disabled={locked || !canBorrow} onClick={() => act({ type: 'BUY', borrow: true, useCard })} className="flex flex-col items-center leading-tight">
            <span>Umutang {fmt(borrow)} at Bilhin</span>
            <span className="text-[11px] font-normal opacity-75">
              {canBorrow ? `+${fmt(borrow * bankRate(p))}/buwan na interest` : 'Hindi papayag ang bangko — kulang ang cashflow mo'}
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
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={() => set(clamp(value - step * 10))} className="size-11 rounded-xl bg-white/8 text-sm ring-1 ring-white/15">−−</button>
      <button type="button" onClick={() => set(clamp(value - step))} className="size-11 rounded-xl bg-white/8 text-lg ring-1 ring-white/15">−</button>
      <div className="min-w-0 flex-1 text-center font-display text-lg font-semibold">{format(value)}</div>
      <button type="button" onClick={() => set(clamp(value + step))} className="size-11 rounded-xl bg-white/8 text-lg ring-1 ring-white/15">+</button>
      <button type="button" onClick={() => set(clamp(value + step * 10))} className="size-11 rounded-xl bg-white/8 text-sm ring-1 ring-white/15">++</button>
      <button type="button" onClick={() => set(max)} className="h-11 rounded-xl bg-white/8 px-2 text-xs ring-1 ring-white/15">MAX</button>
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
        <Stat label="Presyo / share" value={`₱${price.toLocaleString()}`} />
        <Stat label={st.dps ? 'Dividend / share / buwan' : 'Dividend'} value={st.dps ? `₱${st.dps}` : 'Wala'} />
      </div>
      {p.revealStocks ? (
        <div className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
          <div className="flex justify-between text-[10px] uppercase text-muted"><span>Mura ₱{st.low}</span><span>Tipikal na range</span><span>Mahal ₱{st.high}</span></div>
          <svg viewBox="0 0 100 8" className="mt-1 h-2 w-full" preserveAspectRatio="none" aria-hidden="true">
            <rect x="0" y="0" width="100" height="8" rx="4" className="fill-white/10" />
            <rect x="0" y="0" width={Math.max(4, Math.min(100, r * 100))} height="8" rx="4" className={r < 0.35 ? 'fill-emerald-400' : r > 0.65 ? 'fill-rose-400' : 'fill-amber-300'} />
          </svg>
        </div>
      ) : (
        <p className="text-xs text-muted">Hindi mo alam kung mura o mahal ito. Matuto ng <b>Stock Market Basics</b> sa Aral para makita ang range.</p>
      )}
      {holding && (
        <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10">
          <span>Hawak mo: <b>{holding.shares.toLocaleString()}</b> @ avg ₱{holding.avgCost.toFixed(1)}</span>
          <span className={price >= holding.avgCost ? 'text-good' : 'text-bad'}>{price >= holding.avgCost ? '+' : ''}{fmt((price - holding.avgCost) * holding.shares)}</span>
        </div>
      )}
      <Stepper value={qty} set={setQty} step={lot} max={maxQty} format={v => `${v.toLocaleString()} shares`} />
      <div className="text-center text-xs text-muted">
        Halaga: <b className="text-cream">{fmt(qty * price)}</b>
        {st.dps > 0 && qty > 0 && <> · +{fmt(qty * st.dps)}/buwan</>}
      </div>
      <Lesson text={st.note} />
      <div className="grid grid-cols-2 gap-2">
        <Btn disabled={locked || qty === 0} onClick={() => act({ type: 'BUY', qty })}>Bumili</Btn>
        <Btn variant="good" disabled={locked || !holding} onClick={() => act({ type: 'SELL', qty: holding?.shares })}>Ibenta lahat</Btn>
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
      <p className="text-sm text-violet-100/90">Ligtas na ipon: 0.55% kada buwan na dividend. Puwedeng i-withdraw kahit kailan.</p>
      <Stepper value={amount} set={setAmount} step={LOAN_STEP} max={max} format={fmt} />
      <div className="text-center text-xs text-muted">+{fmt(amount * 0.0055)}/buwan na passive income</div>
      <Lesson text={card.aral} />
      <Btn disabled={locked || amount <= 0} onClick={() => act({ type: 'BUY', amount })}>I-deposit</Btn>
      <Btn variant="ghost" disabled={locked} onClick={() => act({ type: 'PASS' })}>Pass</Btn>
    </div>
  );
}

function DealBody({ game, p, cardId, act, locked }) {
  const card = getCard(cardId);
  if (card.kind === 'stock') return <StockDeal key={cardId} game={game} p={p} card={card} act={act} locked={locked} />;
  if (card.kind === 'mp2') return <Mp2Deal key={cardId} p={p} card={card} act={act} locked={locked} />;
  return <AssetDeal key={cardId} p={p} card={card} act={act} locked={locked} />;
}

function dealHeader(card, size) {
  if (card.kind === 'stock') {
    const st = stocks[card.symbol];
    return { emoji: st.emoji, title: `${st.name} (${card.symbol})`, text: 'Stock market. Bumili nang mura, magbenta nang mahal.' };
  }
  if (card.kind === 'mp2') return { emoji: '🐷', title: card.name, text: null };
  const chip = card.kind === 'business' ? 'Negosyo' : 'Real Estate';
  return { emoji: card.emoji, title: card.name, text: `${size === 'big' ? 'Malaking Deal' : 'Maliit na Deal'} · ${chip}${card.units > 1 ? ` · ${card.units} units` : ''}` };
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
    <div className="flex flex-col gap-2">
      {rows.length === 0 && <p className="rounded-xl bg-white/5 p-3 text-sm text-muted">Walang may-ari ng ganitong asset. Tandaan ang offer na ito para sa susunod!</p>}
      {rows.map(({ o, a, price, proceeds }) => (
        <div key={a.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
          <span className="text-2xl">{a.emoji}</span>
          <div className="min-w-0 flex-1 text-sm">
            <div className="truncate font-semibold">{a.name}</div>
            <div className="text-xs text-muted">{game.players.length > 1 ? `${o.name} · ` : ''}Offer {fmt(price)} − utang {fmt(a.mortgage)}</div>
            <div className={`text-xs ${proceeds - a.down >= 0 ? 'text-good' : 'text-bad'}`}>
              Cash: {fmt(proceeds)} ({proceeds - a.down >= 0 ? 'kita' : 'lugi'} {fmt(Math.abs(proceeds - a.down))}) · mawawala {fmt(a.cf)}/buwan
            </div>
          </div>
          <Btn variant="good" disabled={locked} className="min-h-10 px-3 text-sm" onClick={() => act({ type: 'SELL_OFFER', pid2: o.id, assetId: a.id })}>Ibenta</Btn>
        </div>
      ))}
      <Lesson text={lessons.merkado} />
      <Btn disabled={locked} onClick={() => act({ type: 'DONE' })}>Tapos</Btn>
    </div>
  );
}

function SheetContent({ game, p, pend, act, locked }) {
  switch (pend.kind) {
    case 'oport': {
      const loan = maxBankLoan(p);
      return (
        <div className="flex flex-col gap-3">
          <Header emoji="💼" tone="green" chip="Oportunidad" title="Pumili ng Deal" text={`Cash: ${fmt(p.cash)} · Kayang utangin: ${fmt(loan)}`} />
          <div className="grid grid-cols-2 gap-2">
            <button type="button" disabled={locked} onClick={() => act({ type: 'CHOOSE_DEAL', size: 'small' })} className="flex flex-col items-center gap-1 rounded-2xl bg-gradient-to-b from-emerald-400/25 to-emerald-700/25 p-4 ring-1 ring-emerald-400/40 active:scale-95 disabled:opacity-40">
              <span className="text-4xl">🌱</span>
              <span className="font-display text-lg font-bold">Maliit na Deal</span>
              <span className="text-center text-[11px] text-muted">Stocks, maliit na negosyo, condo. ₱20K–₱350K</span>
            </button>
            <button type="button" disabled={locked} onClick={() => act({ type: 'CHOOSE_DEAL', size: 'big' })} className="flex flex-col items-center gap-1 rounded-2xl bg-gradient-to-b from-amber-400/25 to-amber-700/25 p-4 ring-1 ring-amber-400/40 active:scale-95 disabled:opacity-40">
              <span className="text-4xl">🏢</span>
              <span className="font-display text-lg font-bold">Malaking Deal</span>
              <span className="text-center text-[11px] text-muted">Apartments, malaking negosyo. ₱350K–₱900K down</span>
            </button>
          </div>
          <Lesson text={lessons.oport} />
        </div>
      );
    }
    case 'pick':
      return (
        <div className="flex flex-col gap-3">
          <Header emoji="🏠" tone="green" chip="Real Estate 101" title="Pumili ng isa" text="Dahil sa skill mo, dalawang Malaking Deal ang nakikita mo." />
          {pend.cards.map((id, i) => {
            const c = getCard(id);
            const down = dealDown(p, c);
            return (
              <button key={id} type="button" disabled={locked} onClick={() => act({ type: 'PICK', index: i })} className="flex items-center gap-3 rounded-xl bg-white/5 p-3 text-left ring-1 ring-white/10 active:scale-[0.98]">
                <span className="text-3xl">{c.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{c.name}</span>
                  <span className="text-xs text-muted">Down {fmt(down)} · <span className={c.cf > 0 ? 'text-good' : 'text-bad'}>{fmt(c.cf)}/buwan</span> · ROI {pct((c.cf * 12) / down)}</span>
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
          <Header emoji={h.emoji} tone="green" chip={pend.size === 'big' ? 'Malaking Deal' : 'Maliit na Deal'} title={h.title} text={h.text} />
          <DealBody game={game} p={p} cardId={pend.cardId} act={act} locked={locked} />
        </div>
      );
    }
    case 'card': {
      const card = getCard(pend.cardId);
      const meta = spaceTypes[pend.deck];
      return (
        <div className="flex flex-col gap-3">
          <Header emoji={card.emoji} tone={meta.tone} chip={meta.label} title={card.name} text={card.text} />
          <Lesson text={card.aral ?? lessons[pend.deck]} />
          <Options options={pend.options} act={act} locked={locked} />
        </div>
      );
    }
    case 'offer':
    case 'market': {
      const card = getCard(pend.cardId);
      return (
        <div className="flex flex-col gap-3">
          <Header emoji={card.emoji} tone="violet" chip="Merkado" title={card.name} text={card.text} />
          {pend.kind === 'offer' ? (
            <OfferBody game={game} card={card} act={act} locked={locked} />
          ) : (
            <>
              <Lesson text={lessons.merkado} />
              <Btn disabled={locked} onClick={() => act({ type: 'DONE' })}>OK</Btn>
            </>
          )}
        </div>
      );
    }
    case 'aral':
      return (
        <div className="flex flex-col gap-3">
          <Header emoji="🎓" tone="amber" chip="Aral" title={pend.free ? 'Libreng Skill!' : 'Financial Education'} text="Permanenteng skills. Pumili ng isa." />
          {pend.skills.map(id => {
            const k = skillById[id];
            const cost = pend.free ? 0 : skillCost(p, k);
            return (
              <button key={id} type="button" disabled={locked || p.cash < cost} onClick={() => act({ type: 'LEARN', skillId: id })} className="flex items-center gap-3 rounded-xl bg-white/5 p-3 text-left ring-1 ring-white/10 active:scale-[0.98] disabled:opacity-40">
                <span className="text-3xl">{k.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{k.name}</span>
                  <span className="text-xs text-muted">{k.text}</span>
                </span>
                <span className="font-display font-semibold text-gold">{cost ? fmt(cost) : 'LIBRE'}</span>
              </button>
            );
          })}
          <Lesson text={lessons.aral} />
          {!pend.free && <Btn variant="ghost" disabled={locked} onClick={() => act({ type: 'SKIP' })}>Hindi muna</Btn>}
        </div>
      );
    case 'tulong':
      return (
        <div className="flex flex-col gap-3">
          <Header emoji="🤝" tone="rose" chip="Tulong" title="Magbigay sa Kapwa" text="Mag-donate ng 10% ng buwanang kita mo. Kapalit: 2 dice sa susunod na 3 turns (mas mabilis, mas maraming oportunidad) at +1 Diskarte." />
          <Lesson text={lessons.tulong} />
          <Options options={pend.options} act={act} locked={locked} />
        </div>
      );
    case 'info':
      return (
        <div className="flex flex-col gap-3">
          <Header emoji={pend.emoji} tone={pend.tone === 'bad' ? 'red' : pend.tone === 'good' ? 'green' : 'teal'} title={pend.title} text={pend.text} />
          <Btn disabled={locked} onClick={() => act({ type: 'DONE' })}>OK</Btn>
        </div>
      );
    case 'ftdeal':
    case 'gamble': {
      const d = ftDeals[pend.pos];
      const text = pend.kind === 'gamble'
        ? `High-risk venture: magbayad ng ${fmt(d.cost)}, mag-roll ng 1 die. ${d.need}+ = ${fmt(d.win)}. Kung hindi, wala.`
        : `+${fmt(d.cf)} sa Fast Track cashflow mo.`;
      return (
        <div className="flex flex-col gap-3">
          <Header emoji={d.emoji} tone={pend.kind === 'gamble' ? 'violet' : 'green'} chip={pend.kind === 'gamble' ? 'Sugal-Negosyo' : 'Negosyo'} title={d.name} text={text} />
          <Stat label="Cash mo" value={fmt(p.cash)} />
          <Options options={pend.options} act={act} locked={locked} />
        </div>
      );
    }
    case 'dream': {
      const d = dreamById[pend.dreamId];
      return (
        <div className="flex flex-col gap-3">
          <Header emoji={d.emoji} tone="pink" chip="Pangarap" title={d.name} text={d.text} />
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Presyo" value={fmt(d.cost)} />
            <Stat label="Cash mo" value={fmt(p.cash)} tone={p.cash >= d.cost ? 'text-good' : 'text-bad'} />
          </div>
          <Options options={pend.options} act={act} locked={locked} />
        </div>
      );
    }
    case 'sakuna': {
      const d = ftDisasters[pend.pos];
      return (
        <div className="flex flex-col gap-3">
          <Header emoji={d.emoji} tone="red" chip="Sakuna" title={d.name} text={d.text} />
          <Options options={pend.options} act={act} locked={locked} />
        </div>
      );
    }
    case 'foundation':
      return (
        <div className="flex flex-col gap-3">
          <Header emoji="🕊️" tone="rose" chip="Foundation" title="Magtayo ng Foundation" text="Mag-donate ng ₱1M. Kapalit: 3 dice sa susunod na 3 turns." />
          <Options options={pend.options} act={act} locked={locked} />
        </div>
      );
    default:
      return null;
  }
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
  if (sheetMin && !locked) {
    return (
      <button
        type="button"
        onClick={() => setSheetMin(false)}
        className="fixed inset-x-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-sm animate-toast rounded-2xl bg-gradient-to-b from-amber-300 to-gold-deep btn-3d py-3 font-display text-lg font-bold text-night shadow-2xl lg:bottom-6"
      >
        🃏 Bumalik sa card
      </button>
    );
  }
  return (
    <div className="fixed inset-0 z-40 flex animate-fade items-end justify-center bg-black/55 sm:items-center">
      <div className="max-h-[88dvh] w-full max-w-lg animate-sheet overflow-y-auto rounded-t-3xl border-t-4 border-gold bg-gradient-to-b from-panel to-night-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl ring-1 ring-line sm:rounded-3xl sm:p-5">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20 sm:hidden" />
        <div className="mb-2 flex items-center justify-between gap-2 text-xs text-muted">
          <span>{game.players.length > 1 && <>{p.emoji} Turno ni <b className="text-cream">{p.name}</b>{locked && ' · nag-iisip…'}</>}</span>
          {!locked && (
            <button type="button" onClick={() => setSheetMin(true)} className="rounded-full bg-white/8 px-3 py-1.5 text-xs text-cream ring-1 ring-white/15">
              📊 Tingnan ang pera ko
            </button>
          )}
        </div>
        <SheetContent game={game} p={p} pend={pend} act={dispatch} locked={locked} />
      </div>
    </div>
  );
}
