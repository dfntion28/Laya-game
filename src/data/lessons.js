// ─── Lesson engine ────────────────────────────────────────────────────────────
// Concept library (Kuwaderno ng Aral) + pure functions that turn a card and the
// player's actual numbers into a specific, situational insight. Nothing here
// mutates state; the store and components call these to explain consequences.

import {
  INSURANCE_MONTHLY_COST,
  TENANT_DAMAGE_COST,
  BANK_RATE_PER_MILLION,
  PAGIBIG_RATE_PER_MILLION,
  FIVE_SIX_MONTHLY_RATE,
} from './gameConstants.js';

export const LESSON_STORAGE_KEY = 'laya-aral-v1';
const TIME_DEPOSIT_ANNUAL_PCT = 6; // 0.5%/month in openTimeDeposit

// ─── Concept library ─────────────────────────────────────────────────────────

export const LESSON_CONCEPTS = {
  passive_vs_active: {
    title: 'Sahod ≠ Kalayaan', group: 'Kita',
    text: 'Ang taas ng sahod ay hindi nagpapalaya sa Rat Race. Passive income lang ang ikinukumpara sa gastusin. Ang raise ay pambili ng assets, hindi pang-upgrade ng lifestyle.',
  },
  lifestyle_creep: {
    title: 'Lifestyle Creep', group: 'Gastos',
    text: 'Bawat ₱1,000 na permanenteng dagdag sa buwanang gastos ay ₱1,000 pang passive income na kailangan mong hanapin bago ka makatakas.',
  },
  cash_on_cash: {
    title: 'Cash-on-Cash Return', group: 'Deals',
    text: 'Taunang net na kita ÷ cash na inilabas mo. ₱5,000/buwan sa ₱100,000 = 60%/taon. Ikumpara ito sa time deposit (6%/taon sa laro) bago bumili.',
  },
  payback: {
    title: 'Payback Period', group: 'Deals',
    text: 'Puhunan ÷ net kada buwan = ilang buwan bago bumalik ang pera mo. Mas maikli, mas maaga mo itong magagamit sa susunod na deal.',
  },
  thin_margin: {
    title: 'Manipis na Margin', group: 'Deals',
    text: 'Kapag halos kapantay ng mortgage ang renta, isang bakanteng buwan lang ay lugi ka na. Tingnan ang NET, hindi ang gross.',
  },
  vacancy_risk: {
    title: 'Bakante at Sira', group: 'Deals',
    text: 'Sa bawat Sahod Day, 1 sa 6 na tsansa na walang renta ang isang paupahan at 1 sa 6 na may sira (−₱15,000). Ibawas ito sa inaasahan mong kita.',
  },
  good_vs_bad_debt: {
    title: 'Utang na Kumikita vs Kumakain', group: 'Utang',
    text: 'Ang mortgage sa paupahang may positibong net ay binabayaran ng tenant. Ang installment sa gadget ay binabayaran mo mula sa sahod.',
  },
  true_cost_installment: {
    title: 'Tunay na Presyo ng Installment', group: 'Utang',
    text: 'I-multiply ang hulog sa bilang ng buwan. Ang diperensya sa cash price ay ang presyo ng hindi paghihintay.',
  },
  need_vs_want: {
    title: 'Kailangan vs Gusto', group: 'Gastos',
    text: 'Ang kailangan mo ay telepono, hindi ang pinakabagong modelo. Tugunan ang pangangailangan sa pinakamababang halagang gumagana.',
  },
  depreciating_asset: {
    title: 'Bumababang Halaga', group: 'Gastos',
    text: 'Ang bagong sasakyan ay nawawalan ng halaga habang buo pa ang utang. Hindi ito asset kung hindi ito nagdadala ng kita.',
  },
  emergency_fund: {
    title: 'Emergency Fund', group: 'Proteksyon',
    text: 'Karaniwang payo ng mga bangko at financial planner: 3–6 buwan ng gastusin na nakatabi. Ito ang pumipigil na mapilitan kang umutang kapag may biglaang gastos.',
  },
  insurance_math: {
    title: 'Kuwenta ng Insurance', group: 'Proteksyon',
    text: 'Ang insurance ay proteksyon, hindi investment. Sulit ito kapag kayang ubusin ng isang sakuna ang ipon mo. Ikumpara ang premium sa laki ng posibleng lugi.',
  },
  credit_card_interest: {
    title: 'Interes ng Credit Card', group: 'Utang',
    text: 'Hanggang 3% kada buwan (≈36%/taon) ang interes na pinapayagan ng BSP sa credit card. Bayaran nang buo ang statement — ang minimum payment ay nagpapahaba ng utang.',
  },
  five_six: {
    title: 'Ang Bitag ng 5-6', group: 'Utang',
    text: 'Humiram ng 5, magbayad ng 6: 20% sa maikling panahon. Mas mura ang SSS o Pag-IBIG salary loan, at pinakamura ang sariling ipon.',
  },
  credit_score: {
    title: 'Credit Score', group: 'Utang',
    text: 'Ang tamang pagbabayad ay nagpapataas ng score; ang hindi pagbabayad ay nagpapababa. Mas mataas na score = mas murang utang (Pag-IBIG rate sa 700+).',
  },
  scam_red_flags: {
    title: 'Senyales ng Scam', group: 'Proteksyon',
    text: '"Guaranteed" na mataas na tubo, kita mula sa pag-recruit, at walang secondary license mula sa SEC. Ang SEC registration ng korporasyon ay hindi pahintulot na tumanggap ng investment.',
  },
  gambling_ev: {
    title: 'Expected Value', group: 'Proteksyon',
    text: '1 sa 6 na tsansang manalo ng ₱30,000, 5 sa 6 na matalo ng ₱30,000: ang average na resulta ay −₱20,000 kada taya. Sa katagalan, ang bahay ang panalo.',
  },
  windfall: {
    title: 'Biglaang Pera', group: 'Kita',
    text: 'Ang mana o bonus ay hindi dagdag na budget sa gastos. Pagkakataon ito para bumuo ng emergency fund o bumili ng asset na may kita.',
  },
  income_shock: {
    title: 'Kapag Nawala ang Sahod', group: 'Proteksyon',
    text: 'Kapag tumigil ang sahod, passive income at ipon lang ang sasalo. Ang tanong: ilang buwan kang tatagal?',
  },
  market_cycles: {
    title: 'Presyo vs Kita', group: 'Merkado',
    text: 'Ang pagbaba ng presyo ng stock ay hindi nagbabago ng dividend na natatanggap mo. Ang nagpa-panic sell ay nagla-lock in ng lugi.',
  },
  paper_wealth: {
    title: 'Net Worth sa Papel', group: 'Merkado',
    text: 'Ang pagtaas ng halaga ng property ay hindi cash at hindi nagbabayad ng gastos. Nagiging totoo lang ito kapag ibinenta o ni-refinance (BRRRR).',
  },
  interest_rate_risk: {
    title: 'Panganib ng Interest Rate', group: 'Merkado',
    text: 'Kapag tumaas ang interest rate, tumataas ang bayad sa utang. Mas maliit ang utang, mas maliit ang tama.',
  },
  inflation: {
    title: 'Inflation', group: 'Merkado',
    text: 'Tumataas ang presyo ng bilihin taon-taon. Ang perang nakatengga ay lumiliit ang halaga; ang assets na kumikita ay sumasabay.',
  },
  speculation: {
    title: 'Spekulasyon vs Investment', group: 'Deals',
    text: 'Ang investment ay may kita ngayon na kaya mong kuwentahin. Ang spekulasyon ay umaasa sa presyo sa hinaharap — pwedeng manalo, pwedeng maubos.',
  },
  family_support: {
    title: 'Tulong sa Pamilya', group: 'Gastos',
    text: 'Magbigay ng kayang mawala. Kung pautang, isulat ang kasunduan. Ang tulong na sumisira sa sarili mong finances ay hindi na makakatulong sa susunod.',
  },
  opportunity_cost: {
    title: 'Opportunity Cost', group: 'Deals',
    text: 'Ang perang nakatali sa lupang walang kita o sa alahas ay perang hindi kumikita sa ibang lugar.',
  },
  education_roi: {
    title: 'ROI ng Edukasyon', group: 'Kita',
    text: 'Investment ang pag-aaral kapag ang dagdag na kita ay mas malaki kaysa sa gastos at interes nito. Kuwentahin kung ilang buwan bago ito bumalik.',
  },
  cheaper_path: {
    title: 'Laging May Mas Murang Daan', group: 'Gastos',
    text: 'Bago gumastos, itanong: may mas murang paraan ba para makuha ang parehong resulta? Hal: barangay mediation bago ang korte, repair bago ang renovation.',
  },
  tax_compliance: {
    title: 'Buwis sa Tamang Oras', group: 'Proteksyon',
    text: 'Ang multa sa late filing ay gastos na walang kapalit. Ang maayos na records ay proteksyon sa BIR audit.',
  },
  diversification: {
    title: 'Huwag Ilagay Lahat sa Isang Basket', group: 'Merkado',
    text: 'Kapag iisang uri lang ng asset ang hawak mo, isang balita lang ay tatamaan lahat. Ang halo ng negosyo, paupahan, at stocks ay mas matatag.',
  },
};

export const CONCEPT_IDS = Object.keys(LESSON_CONCEPTS);

// ─── Card → concept mapping (non-deal cards; deals are decided by analysis) ──

const CARD_CONCEPT = {
  g1: 'depreciating_asset', g2: 'true_cost_installment', g3: 'lifestyle_creep',
  g4: 'gambling_ev', g5: 'insurance_math', g6: 'insurance_math', g7: 'credit_card_interest',
  g8: 'five_six', g9: 'emergency_fund', g10: 'cheaper_path', g11: 'need_vs_want',
  g12: 'scam_red_flags', g13: 'lifestyle_creep', g14: 'family_support', g15: 'need_vs_want',
  g16: 'need_vs_want', g17: 'true_cost_installment', g18: 'family_support', g19: 'family_support',
  g20: 'insurance_math', g21: 'tax_compliance', g22: 'need_vs_want', g23: 'cheaper_path',
  g24: 'insurance_math', g25: 'cheaper_path', g26: 'depreciating_asset', g27: 'insurance_math',
  g28: 'opportunity_cost', g29: 'credit_card_interest', g30: 'cheaper_path', g31: 'education_roi',
  g32: 'opportunity_cost', g33: 'true_cost_installment', g34: 'opportunity_cost', g35: 'true_cost_installment',
  g36: 'scam_red_flags',
  le1: 'passive_vs_active', le2: 'lifestyle_creep', le3: 'family_support', le4: 'windfall',
  le5: 'income_shock', le6: 'passive_vs_active', le7: 'passive_vs_active', le8: 'emergency_fund',
  le9: 'passive_vs_active', le10: 'income_shock', le11: 'windfall', le12: 'passive_vs_active',
  le13: 'diversification', le14: 'income_shock', le15: 'depreciating_asset', le16: 'lifestyle_creep',
  le17: 'lifestyle_creep', le18: 'passive_vs_active', le19: 'diversification', le20: 'windfall',
  me1: 'market_cycles', me2: 'paper_wealth', me3: 'insurance_math', me4: 'interest_rate_risk',
  me5: 'paper_wealth', me6: 'diversification', me7: 'diversification', me8: 'tax_compliance',
  me9: 'income_shock', me10: 'paper_wealth', me11: 'market_cycles', me12: 'inflation',
  me13: 'paper_wealth', me14: 'windfall', me15: 'market_cycles',
};

// ─── Formatting ──────────────────────────────────────────────────────────────

export const peso = n => '₱' + Math.round(Math.abs(n ?? 0)).toLocaleString('en-PH');
const signed = n => (n >= 0 ? '+' : '−') + peso(n);
const pct = n => `${Math.round(n)}%`;

// ─── Financial snapshot ──────────────────────────────────────────────────────

// Includes scam "returns" on purpose: the player sees them as income until they vanish
function passiveOf(assets) {
  return assets.reduce((s, a) => s + (a.monthlyIncome || 0), 0);
}

export function snapshot(player) {
  const passive  = passiveOf(player.assets);
  const loans    = player.liabilities.reduce((s, l) => s + (l.payment || 0), 0);
  const expenses = player.monthlyExpenses + (player.familyExpenses || 0);
  const outflow  = expenses + loans;
  let activeNet;
  if (player.variableIncome) {
    // Expected D6 roll is 3.5 → ₱35,000 gross, 15% tax
    activeNet = 35_000 * 0.85 - player.mandatoryDeductions;
  } else {
    activeNet = player.salary - player.tax - player.mandatoryDeductions;
  }
  const assetValue = player.assets.reduce((s, a) => s + (a.currentValue || 0), 0);
  const debt       = player.liabilities.reduce((s, l) => s + (l.balance || 0), 0);
  return {
    cash: player.cash,
    passive,
    loans,
    expenses,
    outflow,
    activeNet,
    cashFlow: activeNet + passive - outflow,
    gap: Math.max(0, outflow - passive),
    escapePct: outflow > 0 ? Math.min(100, (passive / outflow) * 100) : 100,
    bufferMonths: outflow > 0 ? player.cash / outflow : 99,
    netWorth: player.cash + assetValue - debt,
    estimated: !!player.variableIncome,
  };
}

// ─── Deal analysis ───────────────────────────────────────────────────────────

function mortgagePaymentFor(amount, creditScore) {
  if (creditScore < 500) return amount * FIVE_SIX_MONTHLY_RATE;
  const rate = creditScore >= 700 ? PAGIBIG_RATE_PER_MILLION : BANK_RATE_PER_MILLION;
  return Math.round((amount / 1_000_000) * rate);
}

export function analyzeDeal(card, player, marketCycle) {
  const mult = marketCycle === 'bull' ? 1.2 : marketCycle === 'bear' ? 0.8 : 1;
  const hasContractor = player.heldNetworkCards.some(c => c.effect === 'rehab_cost_minus_20pct');
  const rawCost   = card.downPayment ?? card.purchasePrice ?? card.cost ?? 0;
  const cashNeeded = Math.round((hasContractor ? rawCost * 0.8 : rawCost) * mult);
  const income    = card.monthlyIncome ?? card.cashFlow ?? 0;
  const mortgage  = card.mortgage || 0;
  const mortgagePayment = mortgage > 0
    ? (card.mortgagePayment ?? mortgagePaymentFor(mortgage, player.creditScore))
    : 0;
  const net = income - mortgagePayment;
  const isRental = (card.assetType ?? 'business') === 'real_estate' && income > 0;
  // Expected per-payday loss from the tenant roll: 1/6 vacancy + 1/6 damage
  const expectedTenantLoss = isRental ? Math.round((income + TENANT_DAMAGE_COST) / 6) : 0;
  const riskNet = net - expectedTenantLoss;
  const annualPct  = cashNeeded > 0 ? (net * 12 / cashNeeded) * 100 : null;
  const payback    = cashNeeded > 0 && net > 0 ? Math.ceil(cashNeeded / net) : null;

  const before = snapshot(player);
  const gapClosedPct = before.gap > 0 ? Math.min(100, (Math.max(0, net) / before.gap) * 100) : 0;
  const cashAfter = player.cash - cashNeeded;
  const bufferAfter = before.outflow > 0 ? cashAfter / before.outflow : 99;
  const isTrap = card.cardType === 'trap_deal';

  const flags = [];
  if (isTrap) {
    flags.push({ level: 'warn', text: 'Walang kita habang naghihintay. Ang resulta ay depende sa market cycle sa araw ng resolusyon.' });
  } else if (income === 0) {
    flags.push({ level: 'warn', text: `Walang buwanang kita. Ang ${peso(cashNeeded)} ay nakatali hanggang ibenta mo — umaasa ka sa pagtaas ng presyo.` });
  } else if (net <= 0) {
    flags.push({ level: 'bad', text: `Mas malaki o kapantay ng renta ang mortgage (${peso(mortgagePayment)}). Ikaw ang magbabayad para sa asset na ito.` });
  } else if (mortgagePayment > 0 && net < income * 0.3) {
    flags.push({ level: 'warn', text: `Manipis ang margin: ${peso(net)} net mula sa ${peso(income)} na renta.` });
  }
  if (isRental && net > 0) {
    flags.push({
      level: riskNet > 0 ? 'info' : 'bad',
      text: `Kasama ang tsansa ng bakante/sira, ang inaasahang net ay ~${peso(riskNet)}${riskNet < 0 ? ' (lugi)' : ''} kada Sahod Day, hindi ${peso(net)}.`,
    });
  }
  if (cashNeeded > 0 && cashAfter >= 0 && bufferAfter < 3) {
    flags.push({
      level: bufferAfter < 1 ? 'bad' : 'warn',
      text: `Pagkatapos bumili, ${bufferAfter.toFixed(1)} buwan na lang ng gastos ang cash mo. Isang Gastos card lang ay pwedeng magpautang sa'yo.`,
    });
  }
  if (annualPct !== null && net > 0 && annualPct < TIME_DEPOSIT_ANNUAL_PCT * 1.5) {
    flags.push({ level: 'info', text: `${annualPct.toFixed(1)}%/taon lang ang balik — malapit sa ${TIME_DEPOSIT_ANNUAL_PCT}% ng time deposit, pero may risk.` });
  }
  if (mult !== 1 && rawCost > 0) {
    flags.push({
      level: 'info',
      text: mult > 1
        ? `Bull market: +20% ang presyo ngayon (${peso(cashNeeded)} imbes na ${peso(rawCost)}).`
        : `Bear market: −20% ang presyo ngayon. Mas mura ang pagpasok kapag takot ang iba.`,
    });
  }

  let verdict = 'ok';
  const mlmLike = isTrap && (card.trapBullOutcome?.cashFlow ?? 0) <= 0 && (card.trapBullOutcome?.oneTimeGain ?? 0) <= 0;
  if (mlmLike || (!isTrap && income > 0 && (net <= 0 || (isRental && riskNet <= 0)))) verdict = 'bad';
  else if (isTrap || income === 0) verdict = 'risky';
  else if (net > 0 && (payback === null || payback <= 36) && bufferAfter >= 1) verdict = 'good';

  let concept;
  if (mlmLike) concept = 'scam_red_flags';
  else if (isTrap || income === 0) concept = 'speculation';
  else if (net <= 0 || (mortgagePayment > 0 && net < income * 0.3)) concept = 'thin_margin';
  else if (isRental) concept = mortgagePayment > 0 ? 'good_vs_bad_debt' : 'vacancy_risk';
  else if (card.assetType === 'stock') concept = 'diversification';
  else concept = payback !== null && payback <= 24 ? 'payback' : 'cash_on_cash';

  return {
    cashNeeded, rawCost, income, mortgagePayment, net, riskNet, isRental, expectedTenantLoss,
    annualPct, payback, gapBefore: before.gap, gapClosedPct, cashAfter, bufferAfter,
    canAfford: player.cash >= cashNeeded, flags, verdict, concept, isTrap,
  };
}

export const VERDICT_LABEL = {
  good:  { text: 'Maganda ang numero',    tone: 'good' },
  ok:    { text: 'Pwede, pero pag-isipan', tone: 'info' },
  risky: { text: 'Spekulasyon',           tone: 'warn' },
  bad:   { text: 'Delikado ang numero',   tone: 'bad'  },
};

// Critical-thinking prompts shown before the player decides on a deal.
export function dealQuestions(card, a) {
  const q = [];
  if (a.isTrap) {
    q.push('Saan manggagaling ang kita — sa negosyo, o sa pag-asang tataas ang presyo?');
    q.push('Kung mawala ang buong puhunan, kakayanin pa ba ng ipon mo?');
    return q;
  }
  if (a.mortgagePayment > 0) q.push('Magkano ang matitira sa renta pagkatapos ng mortgage?');
  if (a.income === 0) q.push('Paano ka kikita habang hawak mo ito?');
  else if (a.cashNeeded > 0) q.push('Ilang buwan bago bumalik ang puhunan?');
  if (a.isRental) q.push('Paano kung bakante ang unit o may sira?');
  q.push('Gaano karami ang matitirang ipon pagkatapos bumili?');
  return q.slice(0, 3);
}

// Mabilisang Kuwenta: one numeric question per deal, three options.
export function buildDealQuiz(card, a) {
  if (a.isTrap) return null;
  let prompt, answer, options, unit, explain;
  if (a.mortgagePayment > 0 && a.income > 0) {
    prompt = 'Magkano ang NET na kita kada buwan pagkatapos ng mortgage?';
    answer = a.net;
    options = [a.net, a.income, a.net + Math.round(a.mortgagePayment / 2)];
    unit = 'peso';
    explain = `${peso(a.income)} renta − ${peso(a.mortgagePayment)} mortgage = ${signed(a.net)}. Ang gross ay hindi ang kita mo.`;
  } else if (a.income === 0 && a.cashNeeded > 0) {
    prompt = 'Magkano ang papasok sa iyo kada buwan habang hawak mo ito?';
    answer = 0;
    options = [0, Math.round(a.cashNeeded * 0.01), Math.round(a.cashNeeded * 0.005)];
    unit = 'peso';
    explain = 'Wala. Ang lupang walang umuupa o pre-selling na hindi pa tapos ay hindi nagbabayad ng gastos mo.';
  } else if (a.payback !== null) {
    prompt = 'Ilang buwan bago bumalik ang cash na ilalabas mo?';
    answer = a.payback;
    const half = Math.max(1, Math.round(a.payback / 2));
    options = [a.payback, half === a.payback ? a.payback + 3 : half, a.payback * 2];
    unit = 'months';
    explain = `${peso(a.cashNeeded)} ÷ ${peso(a.net)} kada buwan ≈ ${a.payback} buwan.`;
  } else {
    return null;
  }
  const unique = [...new Set(options)];
  while (unique.length < 3) unique.push(unique[unique.length - 1] + (unit === 'months' ? 5 : 1000));
  // Stable per-card ordering so the answer isn't always first
  const seed = [...card.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % unique.length;
  const ordered = [...unique.slice(seed), ...unique.slice(0, seed)];
  return { prompt, answer, options: ordered, unit, explain };
}

export function formatQuizOption(value, unit) {
  return unit === 'months' ? `${value} buwan` : peso(value);
}

// ─── Gastos choices ──────────────────────────────────────────────────────────

export function choiceTotalCost(choice) {
  if (choice.type === 'none') return 0;
  if (choice.type === 'gamble' || choice.type === 'lend' || choice.type === 'scam') return choice.stake ?? choice.amount ?? 0;
  // Recurring expenses are compared over one year
  return (choice.cashLoss || 0) + (choice.addedLiability || 0) + (choice.addedMonthlyExpense || 0) * 12;
}

export function choiceSummary(choice) {
  const parts = [];
  if (choice.cashLoss) parts.push(`−${peso(choice.cashLoss)} cash`);
  if (choice.addedMonthlyPayment) {
    const months = Math.round((choice.addedLiability || 0) / choice.addedMonthlyPayment);
    parts.push(`${peso(choice.addedMonthlyPayment)} × ${months} buwan = ${peso(choice.addedLiability)}`);
  }
  if (choice.addedMonthlyExpense) parts.push(`+${peso(choice.addedMonthlyExpense)}/buwan, permanente`);
  if (choice.salaryIncrease) parts.push(`+${peso(choice.salaryIncrease)}/buwan sa sahod`);
  if (choice.type === 'gamble') parts.push(`taya ${peso(choice.stake)}`);
  if (choice.type === 'lend') parts.push(`ilalabas ${peso(choice.amount)}`);
  if (choice.type === 'scam') parts.push(`ilalabas ${peso(choice.amount)}`);
  if (choice.type === 'none') parts.push('₱0');
  return parts.join(' · ');
}

export function isChoiceAffordable(choice, player) {
  const upfront = choice.cashLoss ?? choice.stake ?? choice.amount ?? 0;
  if (choice.type === 'liability' || choice.type === 'none' || choice.type === 'expense') return true;
  return player.cash >= upfront;
}

// ─── Debrief builder ─────────────────────────────────────────────────────────
// Builds the "Ano ang Nangyari?" panel content from before/after snapshots.

export function conceptForCard(card, analysis) {
  if (analysis) return analysis.concept;
  return CARD_CONCEPT[card.id] ?? null;
}

function bufferLine(after) {
  if (after.outflow <= 0) return null;
  const m = after.bufferMonths;
  if (m < 0) return `Negative na ang cash mo (${signed(after.cash)}). Sa susunod na Sahod Day, kulang ang pambayad at bababa ang credit score.`;
  if (m < 1) return `Ang natitirang cash ay ${m.toFixed(1)} buwan lang ng gastos. Karaniwang target: 3–6 buwan.`;
  if (m < 3) return `Sapat ang cash mo para sa ${m.toFixed(1)} buwan ng gastos — mababa pa sa karaniwang 3–6 buwang emergency fund.`;
  return null;
}

export function buildCardPoints({ card, choice, outcome, before, after, player, analysis }) {
  const points = [];
  const dCash = after.cash - before.cash;
  const dOut  = after.outflow - before.outflow;

  // Deals
  if (analysis) {
    if (outcome?.passed) {
      if (!analysis.canAfford && analysis.verdict !== 'bad') points.push(`Kulang ang cash para sa ${peso(analysis.cashNeeded)}. Ang ipon ang nagbubukas ng pagkakataon — kapag dumating ang magandang deal, kailangan may handang pera.`);
      else if (analysis.verdict === 'bad') points.push(`Tama ang pag-iwas: ${analysis.net <= 0 ? 'negative ang net cash flow nito.' : 'mas maliit ang inaasahang kita kaysa sa risk.'}`);
      else if (analysis.verdict === 'good') points.push(`Nilampasan mo ang ${analysis.annualPct !== null ? analysis.annualPct.toFixed(0) + '%/taon' : 'libreng'} na balik. Minsan tama ito kung kulang ang ipon — pero kailangan mong may dahilan.`);
      else points.push('Nag-pass ka. Hindi lugi ang hindi pagbili — ang lugi ay ang pagbili nang hindi kinuwenta.');
    } else if (analysis.isTrap) {
      points.push(`Inilabas mo ang ${peso(-dCash)} nang walang buwanang kita. Malalaman ang resulta sa loob ng ${card.trapDelay} rounds.`);
    } else {
      if (analysis.net !== 0) points.push(`Net cash flow: ${signed(analysis.net)}/buwan${analysis.mortgagePayment ? ` (${peso(analysis.income)} kita − ${peso(analysis.mortgagePayment)} mortgage)` : ''}.`);
      if (analysis.annualPct !== null && analysis.net > 0) points.push(`Cash-on-cash return: ${analysis.annualPct.toFixed(1)}%/taon. Payback: ${analysis.payback} buwan.`);
      if (analysis.cashNeeded === 0 && analysis.net > 0) points.push('Walang puhunan — kita mula sa bagay na hawak mo na. Ito ang pinakamurang passive income.');
      if (analysis.isRental) points.push(`Tandaan ang tenant roll: ~${peso(analysis.expectedTenantLoss)} kada Sahod Day ang inaasahang bawas.`);
    }
  }

  // Gastos with a choice
  if (choice) {
    const costs = card.choices.map(choiceTotalCost);
    const picked = choiceTotalCost(choice);
    const max = Math.max(...costs);
    const min = Math.min(...costs);
    const span = card.choices.some(c => c.addedMonthlyExpense) ? ' sa unang taon' : '';
    // Cost comparison is misleading when an option also raises income (education)
    const comparable = !card.choices.some(c => c.salaryIncrease)
      && choice.type !== 'gamble' && choice.type !== 'lend' && choice.type !== 'scam';
    if (comparable && max > min) {
      points.push(picked === min
        ? `Pinakamababang opsyon ang pinili mo: ${peso(max - picked)} ang hindi napunta sa gastos${span} kumpara sa pinakamahal.`
        : `May opsyong ${peso(picked - min)} na mas mura${span}. Sulit ba ang diperensya para sa iyo?`);
    }
    if (choice.cashPrice && choice.addedLiability) {
      const premium = choice.addedLiability - choice.cashPrice;
      points.push(`Kabuuang babayaran: ${peso(choice.addedLiability)}. Mas mahal ito ng ${peso(premium)} (${pct(premium / choice.cashPrice * 100)}) kaysa cash price.`);
    } else if (choice.addedLiability) {
      points.push(`Kabuuang babayaran: ${peso(choice.addedLiability)} sa loob ng ${Math.round(choice.addedLiability / choice.addedMonthlyPayment)} buwan.`);
    }
    if (choice.addedMonthlyExpense) {
      points.push(`+${peso(choice.addedMonthlyExpense)}/buwan ay ${peso(choice.addedMonthlyExpense * 12)} kada taon — at kailangan mo ng ganoon din kalaking passive income para makatakas.`);
    }
    if (choice.salaryIncrease && choice.addedMonthlyPayment) {
      const netMonthly = choice.salaryIncrease - choice.addedMonthlyPayment;
      points.push(`Habang may hulog: ${signed(netMonthly)}/buwan. Pagkatapos ng utang: +${peso(choice.salaryIncrease)}/buwan habambuhay.`);
    } else if (choice.salaryIncrease && choice.cashLoss) {
      points.push(`Babalik ang ${peso(choice.cashLoss)} sa loob ng ~${Math.ceil(choice.cashLoss / choice.salaryIncrease)} buwan ng mas mataas na sahod.`);
    }
    if (outcome?.text) points.push(outcome.text);
    if (choice.note) points.push(choice.note);
    else if (choice.type === 'none' && !points.length) points.push('Walang nagastos ngayon. Ang pagpapaliban ay desisyon din — may kapalit ba ito sa hinaharap?');
  }

  // Gastos without a choice / insurance-mitigated
  if (!choice && !analysis && card.mitigatedByInsurance) {
    const saved = card.cashLoss - card.insuranceCost;
    if (player.insuranceActive) {
      points.push(`Insured ka: ${peso(card.insuranceCost)} lang ang binayaran mo imbes na ${peso(card.cashLoss)}. Natipid: ${peso(saved)}.`);
    } else {
      const months = Math.round(saved / INSURANCE_MONTHLY_COST);
      points.push(`Kung insured ka, ${peso(card.insuranceCost)} lang sana. Ang ${peso(saved)} na diperensya = ${months} buwan ng premium (${peso(INSURANCE_MONTHLY_COST)}/buwan sa Bangko).`);
    }
  }

  // Life events
  switch (card.type) {
    case 'salary_increase':
    case 'salary_multiplier':
      points.push(`Tumaas ang buwanang cash flow mo ng ${signed(after.cashFlow - before.cashFlow)}, pero ang Rat Race progress ay ${pct(after.escapePct)} pa rin. Sahod ay hindi binibilang sa pagtakas.`);
      if (after.cashFlow > before.cashFlow) {
        const delta = after.cashFlow - before.cashFlow;
        points.push(`Kung itatabi ang dagdag sa loob ng 6 na Sahod Day: ${peso(delta * 6)} — sapat para sa maliit na deal.`);
      }
      break;
    case 'cash_gain': {
      const amt = card.cashGain || 0;
      const months = before.outflow > 0 ? (amt / before.outflow).toFixed(1) : '—';
      points.push(`${peso(amt)} = ${months} buwan ng gastos mo. Halimbawa: sa deal na 30%/taon, ≈${peso(amt * 0.3 / 12)}/buwan na passive income.`);
      break;
    }
    case 'job_loss':
    case 'sick_leave': {
      const coverage = after.outflow > 0 ? pct(after.passive / after.outflow * 100) : '100%';
      points.push(`Sinasalo ng passive income mo ang ${coverage} ng gastos. ${before.bufferMonths >= 0 ? `Ang cash mo ay ${before.bufferMonths.toFixed(1)} buwan ng gastos.` : ''}`);
      break;
    }
    case 'passive_income':
      points.push(`Rat Race progress: ${pct(before.escapePct)} → ${pct(after.escapePct)}. Ito ang klase ng kita na nagpapalaya.`);
      break;
    case 'expense_reduction':
      points.push(`−${peso(card.reducedMonthlyExpense)}/buwan sa gastos ay kasing-epektibo ng +${peso(card.reducedMonthlyExpense)} na passive income. Progress: ${pct(before.escapePct)} → ${pct(after.escapePct)}.`);
      break;
    case 'income_loss':
      points.push(after.passive < before.passive
        ? `Nawala ang ${peso(before.passive - after.passive)}/buwan. Kaya mahalaga ang higit sa isang pinagmumulan ng kita.`
        : 'Wala kang negosyong may ganitong kita, kaya hindi ka tinamaan. Ang ibang player ay maaaring hindi ganoon kaswerte.');
      break;
    case 'combo':
      if (card.removedLiabilityPayment) points.push(after.loans < before.loans
        ? `Naalis ang ${peso(before.loans - after.loans)}/buwan na hulog. Ang pagbenta ng liability ay nagpapataas ng cash flow agad.`
        : 'Wala kang car loan na tumugma, pero nakuha mo pa rin ang cash.');
      break;
    case 'ofw_upgrade':
      points.push(player.professionId === 'ofw' || after.activeNet > before.activeNet
        ? `Tumaas ang sahod pero tumaas din ang gastos (+${peso(dOut)}). Tingnan ang cash flow, hindi lang ang sahod.`
        : 'Nars lang ang pwedeng gumamit ng card na ito. Walang epekto sa iyo.');
      break;
    default:
      break;
  }

  // Market events
  if (card.effect && card.id?.startsWith('me')) {
    const dNW = after.netWorth - before.netWorth;
    switch (card.effect) {
      case 'all_stocks_value_up':
      case 'all_stocks_value_down':
      case 'player_choice_stock_gain': {
        const stocks = player.assets.filter(a => a.assetType === 'stock');
        if (stocks.length === 0) points.push('Wala kang stocks, kaya hindi gumalaw ang net worth mo.');
        else points.push(`Net worth: ${signed(dNW)}. Ang dividend mo ay ${peso(stocks.reduce((s, a) => s + a.monthlyIncome, 0))}/buwan pa rin — presyo lang ang gumalaw.`);
        break;
      }
      case 'all_realestate_value_up':
      case 'urban_realestate_value_up':
      case 'provincial_realestate_up':
      case 'condo_value_down':
        points.push(dNW !== 0
          ? `Net worth: ${signed(dNW)}, pero cash flow: ${signed(after.cashFlow - before.cashFlow)}. ${dNW > 0 ? 'Magagamit ito sa BRRRR refinancing sa Bangko.' : 'Hindi ka lugi hangga\'t hindi mo ibinebenta.'}`
          : 'Walang tinamaang property mo.');
        break;
      case 'all_loan_payments_up':
        points.push(dCash < 0 ? `Dagdag na ${peso(-dCash)} sa bayad dahil sa utang mo.` : 'Wala kang utang, kaya hindi ka tinamaan ng rate hike.');
        break;
      case 'disaster_cash_loss':
        points.push(player.insuranceActive
          ? `Insured ka: ${peso(card.insuranceCost)} lang. Natipid: ${peso(card.cashLoss - card.insuranceCost)}.`
          : `${peso(card.cashLoss)} ang nawala. Insured, ${peso(card.insuranceCost)} lang sana.`);
        break;
      case 'immediate_expense_increase':
        points.push(`${peso(-dCash)} ang dagdag na gastos ngayong round. Ang may passive income ay mas madaling sumalo nito.`);
        break;
      case 'waive_bir_penalty':
        points.push('Kinansela ang anumang nakabinbing BIR penalty. Mas mabuti pa ring hindi umasa sa amnesty — mag-file sa oras.');
        break;
      case 'variable_income_at_risk':
        points.push(player.variableIncome
          ? 'May variable income ka — ikaw ang unang tinatamaan kapag humina ang benta. Mas kailangan mo ng mas malaking emergency fund.'
          : 'May sahod ka kaya hindi ka direktang tinamaan. Ang mga may negosyo ang unang nararamdaman ang recession.');
        break;
      case 'ofw_income_bonus':
      case 'ofw_cash_gain':
        points.push(dCash > 0 ? `+${peso(dCash)} dahil OFW ka.` : 'OFW lang ang nakinabang. Iba-iba ang tama ng parehong balita sa iba\'t ibang propesyon.');
        break;
      default:
        break;
    }
  }

  // Deals with no monthly income
  if (analysis && !outcome?.passed && !analysis.isTrap && analysis.income === 0) {
    points.push(`Walang buwanang kita: ${peso(analysis.cashNeeded)} ang nakatali at ₱0 ang naitutulong nito sa Rat Race habang hawak mo.`);
  }

  // Plain gastos cards (no choice, not insured-type)
  if (!choice && !analysis && !card.mitigatedByInsurance && card.id?.startsWith('g')) {
    if (card.type === 'cash' && before.outflow > 0) {
      points.push(`Ang ${peso(card.cashLoss)} ay katumbas ng ${(card.cashLoss / before.outflow).toFixed(1)} buwan ng gastusin mo. Ito ang trabaho ng emergency fund.`);
    }
    if (card.type === 'liability') {
      const months = Math.round(card.addedLiability / card.addedMonthlyPayment);
      points.push(`${peso(card.addedMonthlyPayment)} × ${months} buwan = ${peso(card.addedLiability)} na kabuuang bayad.`);
    }
    if (card.addedMonthlyExpense) points.push(`+${peso(card.addedMonthlyExpense)}/buwan ay permanente — tumaas ang target mo para makatakas.`);
  }

  const buf = bufferLine(after);
  if (buf && (dCash < 0 || dOut > 0)) points.push(buf);
  if (dOut > 0 && after.gap > before.gap) points.push(`Layo sa kalayaan: ${peso(before.gap)} → ${peso(after.gap)}/buwan.`);

  return points.slice(0, 4);
}

// ─── Coach tips (Payo) ───────────────────────────────────────────────────────
// Situational advice drawn from the player's state. Each fires once per game.

export function pickCoachTip(player, round) {
  const s = snapshot(player);
  const consumer = player.liabilities
    .filter(l => l.source === 'gastos' || l.source === 'starting' || l.source === 'five_six')
    .reduce((sum, l) => sum + (l.payment || 0), 0);
  const income = player.variableIncome ? s.activeNet : player.salary;
  const manualCard = player.heldNetworkCards.find(c => c.effect === 'salary_plus_5000');

  const rules = [
    {
      id: 'no_buffer', when: s.cash < s.outflow && s.outflow > 0, concept: 'emergency_fund',
      text: `Kulang sa isang buwan ng gastos ang cash mo (${peso(s.cash)} vs ${peso(s.outflow)}). Isang Gastos card lang at mapipilitan kang umutang.`,
    },
    {
      id: 'debt_heavy', when: income > 0 && consumer / income > 0.3, concept: 'good_vs_bad_debt',
      text: `${pct(consumer / income * 100)} ng sahod mo ay napupunta sa hulog na walang dalang kita. Pwede kang magbayad nang maaga sa Bangko.`,
    },
    {
      id: 'credit_low', when: player.creditScore < 560, concept: 'credit_score',
      text: `Credit score: ${player.creditScore}. Sa ilalim ng 500, 5-6 na lang ang magpapautang sa'yo (20%/buwan).`,
    },
    {
      id: 'no_passive', when: round >= 4 && s.passive === 0, concept: 'passive_vs_active',
      text: `Round ${round} na at ₱0 pa ang passive income mo. Ang sahod ay humihinto kapag tumigil ka; ang assets ay hindi.`,
    },
    {
      id: 'unused_hr', when: !!manualCard, concept: 'passive_vs_active',
      text: 'May HR Recruiter card kang hindi pa ginagamit — +₱5,000/buwan ang naghihintay sa Koneksyon Cards.',
    },
    {
      id: 'no_insurance', when: !player.insuranceActive && round >= 5 && s.cash < 200_000, concept: 'insurance_math',
      text: 'Wala kang insurance. Ang medical emergency ay ₱150,000; insured, ₱50,000 lang. Pwedeng i-activate sa Bangko.',
    },
    {
      id: 'idle_cash', when: round >= 3 && s.outflow > 0 && s.cash > s.outflow * 6, concept: 'inflation',
      text: `${peso(s.cash)} ang nakatengga — higit 6 na buwan ng gastos. Ang sobra sa emergency fund ay dapat kumikita.`,
    },
    {
      id: 'escape_close', when: s.escapePct >= 70 && s.escapePct < 100, concept: 'passive_vs_active',
      text: `${pct(s.escapePct)} ka na sa kalayaan. ${peso(s.gap)}/buwan na lang ang kulang — isang magandang deal o isang natapos na utang.`,
    },
  ];
  const seen = player.seenTips || [];
  return rules.find(r => r.when && !seen.includes(r.id)) ?? null;
}

// ─── Persistence (per-browser lesson journal) ────────────────────────────────

export function loadDiscoveredLessons() {
  try {
    const raw = window.localStorage.getItem(LESSON_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(id => LESSON_CONCEPTS[id]) : [];
  } catch {
    return [];
  }
}

export function saveDiscoveredLessons(ids) {
  try {
    window.localStorage.setItem(LESSON_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage blocked — journal still works for this session
  }
}

// ─── Sahod Day / BIR debrief content ─────────────────────────────────────────

export function buildPaydayPoints(summary) {
  if (!summary) return { points: [], concept: null };
  const points = [];
  const out = summary.totalOutflow + summary.palContrib;
  points.push(`Pumasok ${peso(summary.inflow)}, lumabas ${peso(out)} → net ${signed(summary.net)}.`);
  for (const name of summary.vacancies) points.push(`Bakante ang "${name.split(' (')[0]}" — walang renta ngayon (1 sa 6 na tsansa bawat Sahod Day).`);
  for (const name of summary.damages) points.push(`May sira sa "${name.split(' (')[0]}": −${peso(TENANT_DAMAGE_COST)}.`);
  for (const name of summary.finishedLoans) points.push(`Tapos na ang hulog sa "${name}"! Mas malaki na ang cash flow mo simula ngayon.`);
  for (const text of summary.trapResolutions) points.push(text);
  if (summary.missedPayment) points.push('Kulang ang pera pambayad ng lahat ng gastos — bumaba ang credit score (−80).');

  let concept = null;
  if (summary.missedPayment) concept = 'credit_score';
  else if (summary.vacancies.length || summary.damages.length) concept = 'vacancy_risk';
  else if (summary.finishedLoans.length) concept = 'true_cost_installment';
  return { points: points.slice(0, 4), concept };
}

export function buildBirPoints(result) {
  if (result?.result === 'penalty') return ['Multa: ₱20,000. Ang Accountant o Tax Consultant na Koneksyon card ay proteksyon dito.'];
  if (result?.result === 'refund') return [`BIR refund: +${peso(result.amount)}. Maayos ang records mo.`];
  return ['Malinis ang books — walang multa. Ang maayos na records ay nagbabayad sa ganitong araw.'];
}
