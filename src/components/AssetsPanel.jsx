import { useState } from 'react';
import { useGame } from '../store/gameStore.js';
import { getCard, fireSalePrice, fmt } from '../engine/engine.js';
import { stocks } from '../data/cards.js';
import { LOAN_STEP, INSURANCE_COST } from '../data/constants.js';
import { assetCashflow, maxBankLoan, bankRate, insuranceCost } from '../engine/finance.js';
import { Btn, Panel } from './Ui.jsx';

const ROW = 'rounded-xl border-[2.5px] border-ink bg-white p-2.5';

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
      <Panel>
        <h3 className="mb-2 font-display text-xl">Assets</h3>
        {p.assets.length === 0 && <p className="text-sm font-bold text-ink-soft">Nothing yet. Land on a Deal space to buy something.</p>}
        <div className="flex flex-col gap-2">
          {p.assets.map(a => {
            const cf = assetCashflow(p, a);
            const value = saleValue(a);
            const sellable = a.kind !== 'ip';
            return (
              <div key={a.id} className={ROW}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{a.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-extrabold">{a.kind === 'stock' ? `${a.shares.toLocaleString()} ${a.symbol}` : a.name}</div>
                    <div className="text-xs font-bold text-ink-soft">
                      {a.kind === 'stock' && `${stocks[a.symbol].name} · bought ₱${a.avgCost.toFixed(1)}, now ₱${game.prices[a.symbol]}`}
                      {a.kind === 'mp2' && `${fmt(a.amount)} saved`}
                      {(a.kind === 'realestate' || a.kind === 'business') && `Price ${fmt(a.cost)} · owe ${fmt(a.mortgage)} · paid ${fmt(a.down)} down`}
                      {a.kind === 'ip' && 'Can\'t be sold'}
                    </div>
                  </div>
                  <span className={`font-display text-base ${cf >= 0 ? 'text-green-700' : 'text-red-600'}`}>{cf >= 0 ? '+' : ''}{fmt(cf)}</span>
                </div>
                {sellable && canAct && (
                  <div className="mt-2 flex items-center justify-end gap-2">
                    {confirm === a.id ? (
                      <>
                        <span className="text-xs font-bold text-ink-soft">{a.kind === 'stock' || a.kind === 'mp2' ? 'You get' : 'Quick sale'} <b className={value >= 0 ? 'text-green-700' : 'text-red-600'}>{fmt(value)}</b></span>
                        <Btn size="sm" variant="ghost" onClick={() => setConfirm(null)}>Keep</Btn>
                        <Btn size="sm" variant="bad" onClick={() => { act({ type: 'SELL_ASSET', assetId: a.id }); setConfirm(null); }}>Sell</Btn>
                      </>
                    ) : (
                      <Btn size="sm" variant="ghost" onClick={() => setConfirm(a.id)}>{a.kind === 'mp2' ? 'Withdraw' : 'Sell'}</Btn>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {p.assets.some(a => a.kind === 'realestate' || a.kind === 'business') && (
          <p className="mt-2 text-xs font-bold text-ink-soft">A quick sale pays 85% of the price (businesses: 12 months of cashflow). A Market buyer usually pays more.</p>
        )}
      </Panel>

      <Panel>
        <h3 className="mb-2 font-display text-xl">Debts</h3>
        {p.liabilities.length === 0 && <p className="text-sm font-bold text-ink-soft">Debt free.</p>}
        <div className="flex flex-col gap-2">
          {p.liabilities.map(l => (
            <div key={l.id} className={`${ROW} ${l.kind === 'fivesix' ? 'bg-red-50' : ''}`}>
              <div className="text-sm font-extrabold">{l.name}</div>
              <div className="text-xs font-bold text-ink-soft">
                Owe {fmt(l.balance)} · {fmt(l.payment)}/mo · {l.months ? `${l.months} months left` : `${(l.rate * 100).toFixed(1)}% a month, until repaid`}
              </div>
              {canAct && (
                <div className="mt-2 flex justify-end gap-2">
                  <Btn size="sm" variant="ghost" disabled={p.cash < Math.min(LOAN_STEP, l.balance)} onClick={() => act({ type: 'REPAY', liabId: l.id, amount: LOAN_STEP })}>Pay {fmt(Math.min(LOAN_STEP, l.balance))}</Btn>
                  <Btn size="sm" disabled={p.cash < l.balance} onClick={() => act({ type: 'REPAY', liabId: l.id, amount: l.balance })}>Pay it off</Btn>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs font-bold text-ink-soft">Kill the highest interest first (5-6, credit cards). Paying a loan off raises your credit score.</p>
      </Panel>

      {p.track === 'rat' && (
        <Panel>
          <div className="mb-1 flex items-baseline justify-between">
            <h3 className="font-display text-xl">Bank</h3>
            <span className="text-xs font-extrabold text-ink-soft">{Math.round(bankRate(p) * 100)}% a month</span>
          </div>
          <p className="text-sm font-bold text-ink-soft">You can borrow up to <b className="text-ink">{fmt(maxLoan)}</b>. You pay interest every payday until you repay it.</p>
          {canAct && maxLoan > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <Btn size="sm" variant="ghost" onClick={() => setBorrow(Math.max(LOAN_STEP, borrow - LOAN_STEP * 5))}>−</Btn>
              <span className="flex-1 text-center font-display text-xl">{fmt(borrowAmt)}</span>
              <Btn size="sm" variant="ghost" onClick={() => setBorrow(Math.min(maxLoan, borrow + LOAN_STEP * 5))}>+</Btn>
              <Btn size="sm" disabled={borrowAmt < LOAN_STEP} onClick={() => act({ type: 'BORROW', amount: borrowAmt })}>Borrow</Btn>
            </div>
          )}
          <div className={`${ROW} mt-3 flex items-center justify-between gap-2`}>
            <div className="min-w-0">
              <div className="text-sm font-extrabold">Health and property insurance</div>
              <div className="text-xs font-bold text-ink-soft">
                {p.insured ? `On · ${fmt(insuranceCost(p))}/mo${p.freeInsurance ? ` (free for ${p.freeInsurance} more paydays)` : ''}` : `${fmt(insuranceCost({ ...p, insured: true, freeInsurance: 0 }) || INSURANCE_COST)}/mo · covers 80% of hospital and typhoon bills`}
              </div>
            </div>
            {canAct && <Btn size="sm" variant={p.insured ? 'ghost' : 'good'} onClick={() => act({ type: 'INSURANCE', on: !p.insured })}>{p.insured ? 'Cancel' : 'Get it'}</Btn>}
          </div>
        </Panel>
      )}

      <Panel>
        <h3 className="mb-2 font-display text-xl">Contacts <span className="text-base text-ink-soft">{p.hand.length}/{p.handMax}</span></h3>
        {p.hand.length === 0 && <p className="text-sm font-bold text-ink-soft">No contact cards. Land on Contacts to get one.</p>}
        <div className="flex flex-col gap-2">
          {p.hand.map(id => {
            const c = getCard(id);
            return (
              <div key={id} className={`${ROW} flex items-center gap-2 bg-teal-50`}>
                <span className="text-2xl">{c.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold">{c.name}</div>
                  <div className="text-xs font-bold text-ink-soft">{c.text}</div>
                </div>
                {c.use === 'anytime' ? (
                  <Btn size="sm" variant="good" disabled={p.isBot || game.phase !== 'playing' || moving} onClick={() => act({ type: 'USE_CARD', cardId: id })}>Use</Btn>
                ) : (
                  <span className="text-[11px] font-extrabold text-ink-soft">{c.use === 'deal' ? 'Use on a deal' : 'Use on an expense'}</span>
                )}
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
