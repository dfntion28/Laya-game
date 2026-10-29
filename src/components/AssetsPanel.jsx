import { useState } from 'react';
import { useGame } from '../store/gameStore.js';
import { getCard, fireSalePrice, fmt } from '../engine/engine.js';
import { stocks } from '../data/cards.js';
import { LOAN_STEP, INSURANCE_COST } from '../data/constants.js';
import { assetCashflow, maxBankLoan, bankRate, insuranceCost } from '../engine/finance.js';

function Card({ title, children, right }) {
  return (
    <section className="rounded-2xl bg-panel card-3d p-3 ring-1 ring-line">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-gold">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

function SmallBtn({ children, onClick, disabled, tone = 'ghost' }) {
  const t = {
    ghost: 'bg-white/8 ring-1 ring-white/15 text-cream',
    gold: 'bg-gold text-night',
    red: 'bg-rose-500 text-white',
    green: 'bg-emerald-400 text-emerald-950',
  };
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`min-h-9 rounded-lg px-3 text-xs font-semibold transition active:scale-95 disabled:opacity-35 ${t[tone]}`}>
      {children}
    </button>
  );
}

export default function AssetsPanel({ game, p }) {
  const dispatch = useGame(s => s.dispatch);
  const [confirm, setConfirm] = useState(null);
  const [borrow, setBorrow] = useState(LOAN_STEP * 5);
  const moving = game.pending?.kind === 'move' && game.pending.pid === p.id;
  const canAct = !p.isBot && game.phase === 'playing' && !moving && p.track === 'rat';
  const act = a => dispatch({ ...a, pid: p.id });
  const maxLoan = maxBankLoan(p);
  const borrowAmt = Math.min(borrow, maxLoan);

  const saleValue = a => {
    if (a.kind === 'stock') return a.shares * (game.prices[a.symbol] || 0);
    if (a.kind === 'mp2') return a.amount;
    return fireSalePrice(game, a) - a.mortgage;
  };

  return (
    <div className="flex flex-col gap-3">
      <Card title="Ari-arian (Assets)">
        {p.assets.length === 0 && <p className="text-sm text-muted">Wala ka pang assets. Tumapak sa 💼 Oportunidad para bumili.</p>}
        <div className="flex flex-col gap-2">
          {p.assets.map(a => {
            const cf = assetCashflow(p, a);
            const value = saleValue(a);
            const sellable = a.kind !== 'ip';
            return (
              <div key={a.id} className="rounded-xl bg-white/5 p-2.5 ring-1 ring-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{a.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{a.kind === 'stock' ? `${a.shares.toLocaleString()} ${a.symbol}` : a.name}</div>
                    <div className="text-[11px] text-muted">
                      {a.kind === 'stock' && `avg ₱${a.avgCost.toFixed(1)} · ngayon ₱${game.prices[a.symbol]} · ${stocks[a.symbol].name}`}
                      {a.kind === 'mp2' && `${fmt(a.amount)} naka-ipon`}
                      {(a.kind === 'realestate' || a.kind === 'business') && `Presyo ${fmt(a.cost)} · utang ${fmt(a.mortgage)} · down ${fmt(a.down)}`}
                      {a.kind === 'ip' && 'Hindi maibebenta'}
                    </div>
                  </div>
                  <span className={`font-display text-sm font-semibold ${cf >= 0 ? 'text-good' : 'text-bad'}`}>{cf >= 0 ? '+' : ''}{fmt(cf)}</span>
                </div>
                {sellable && canAct && (
                  <div className="mt-2 flex items-center justify-end gap-2">
                    {confirm === a.id ? (
                      <>
                        <span className="text-[11px] text-muted">{a.kind === 'stock' || a.kind === 'mp2' ? 'Makukuha' : 'Fire sale (85%)'}: <b className={value >= 0 ? 'text-good' : 'text-bad'}>{fmt(value)}</b></span>
                        <SmallBtn onClick={() => setConfirm(null)}>Huwag</SmallBtn>
                        <SmallBtn tone="red" onClick={() => { act({ type: 'SELL_ASSET', assetId: a.id }); setConfirm(null); }}>Ibenta</SmallBtn>
                      </>
                    ) : (
                      <SmallBtn onClick={() => setConfirm(a.id)}>{a.kind === 'mp2' ? 'Withdraw' : 'Ibenta…'}</SmallBtn>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {p.assets.some(a => a.kind === 'realestate' || a.kind === 'business') && (
          <p className="mt-2 text-[11px] text-muted">Tip: Hintayin ang 📈 Merkado buyer para sa mas mataas na presyo. Ang fire sale ay 85% lang (negosyo: 12× cashflow).</p>
        )}
      </Card>

      <Card title="Mga Utang (Liabilities)">
        {p.liabilities.length === 0 && <p className="text-sm text-muted">Walang utang. 🎉</p>}
        <div className="flex flex-col gap-2">
          {p.liabilities.map(l => (
            <div key={l.id} className="rounded-xl bg-white/5 p-2.5 ring-1 ring-white/10">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{l.kind === 'fivesix' ? '🦈 ' : ''}{l.name}</div>
                  <div className="text-[11px] text-muted">
                    Balance {fmt(l.balance)} · {fmt(l.payment)}/buwan · {l.months ? `${l.months} buwan pa` : `${(l.rate * 100).toFixed(1)}%/buwan interest`}
                  </div>
                </div>
              </div>
              {canAct && (
                <div className="mt-2 flex justify-end gap-2">
                  <SmallBtn disabled={p.cash < Math.min(LOAN_STEP, l.balance)} onClick={() => act({ type: 'REPAY', liabId: l.id, amount: LOAN_STEP })}>Bayad {fmt(Math.min(LOAN_STEP, l.balance))}</SmallBtn>
                  <SmallBtn tone="gold" disabled={p.cash < l.balance} onClick={() => act({ type: 'REPAY', liabId: l.id, amount: l.balance })}>Bayaran lahat</SmallBtn>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted">Unahin ang may pinakamataas na interest (5-6, credit card). Bawat bayad-buo: credit score ↑.</p>
      </Card>

      {p.track === 'rat' && (
        <Card title="Bangko" right={<span className="text-[11px] text-muted">{Math.round(bankRate(p) * 100)}%/buwan</span>}>
          <p className="text-xs text-muted">Kaya mong utangin: <b className="text-cream">{fmt(maxLoan)}</b>. Ang interest ay binabayaran bawat Sahod hanggang bayaran mo ang buong utang.</p>
          {canAct && maxLoan > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <SmallBtn onClick={() => setBorrow(Math.max(LOAN_STEP, borrow - LOAN_STEP * 5))}>−</SmallBtn>
              <span className="flex-1 text-center font-display font-semibold">{fmt(borrowAmt)}</span>
              <SmallBtn onClick={() => setBorrow(Math.min(maxLoan, borrow + LOAN_STEP * 5))}>+</SmallBtn>
              <SmallBtn tone="gold" disabled={borrowAmt < LOAN_STEP} onClick={() => act({ type: 'BORROW', amount: borrowAmt })}>Umutang</SmallBtn>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-white/5 p-2.5 ring-1 ring-white/10">
            <div className="min-w-0 text-sm">
              <div className="font-semibold">🛡️ Health & Property Insurance</div>
              <div className="text-[11px] text-muted">
                {p.insured ? `Aktibo · ${fmt(insuranceCost(p))}/buwan${p.freeInsurance ? ` (libre pa ng ${p.freeInsurance} Sahod)` : ''}` : `${fmt(insuranceCost({ ...p, insured: true, freeInsurance: 0 }) || INSURANCE_COST)}/buwan · sagot ang 80% ng ospital at bagyo`}
              </div>
            </div>
            {canAct && (
              <SmallBtn tone={p.insured ? 'ghost' : 'green'} onClick={() => act({ type: 'INSURANCE', on: !p.insured })}>{p.insured ? 'I-cancel' : 'Mag-avail'}</SmallBtn>
            )}
          </div>
        </Card>
      )}

      <Card title={`Koneksyon (${p.hand.length}/${p.handMax})`}>
        {p.hand.length === 0 && <p className="text-sm text-muted">Walang hawak na card. Tumapak sa 🧑‍🤝‍🧑 Koneksyon.</p>}
        <div className="flex flex-col gap-2">
          {p.hand.map(id => {
            const c = getCard(id);
            return (
              <div key={id} className="flex items-center gap-2 rounded-xl bg-teal-400/10 p-2.5 ring-1 ring-teal-400/30">
                <span className="text-2xl">{c.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{c.name}</div>
                  <div className="text-[11px] text-teal-100/80">{c.text}</div>
                </div>
                {c.use === 'anytime' ? (
                  <SmallBtn tone="green" disabled={p.isBot || game.phase !== 'playing' || moving} onClick={() => act({ type: 'USE_CARD', cardId: id })}>Gamitin</SmallBtn>
                ) : (
                  <span className="text-[10px] text-muted">{c.use === 'deal' ? 'Sa deal' : 'Sa gastos'}</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
