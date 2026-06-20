# LAYA: Filipino Financial Freedom Game — Game Design Document

## Core Concept
Board game teaching Philippine financial literacy. Players manage a financial statement
(income, expenses, assets, liabilities) and escape the Rat Race (Takbo ng Daga) when
their passive income >= total monthly expenses. Then win on the Freedom Track.

## Win Conditions
- Escape Rat Race: totalPassiveIncome >= (monthlyExpenses + loanPayments)
- Game Win (Freedom Track): netWorth >= 10,000,000 OR totalPassiveIncome >= 100,000

## Professions (7 starting profession cards)

```js
// Each player picks one profession at game start. This sets their starting financial state.
const professions = [
  {
    id: 'engineer', name: 'Inhinyero (Engineer)', emoji: '🔧',
    salary: 45000, tax: 6750, mandatoryDeductions: 1675,
    monthlyExpenses: 22000, startingCash: 80000,
    liabilities: [{ name: 'Car Loan', balance: 384000, payment: 8000 }],
  },
  {
    id: 'bpo', name: 'BPO Analyst', emoji: '🎧',
    salary: 46000, tax: 6900, mandatoryDeductions: 1675,
    monthlyExpenses: 20000, startingCash: 60000,
    liabilities: [{ name: 'Personal Loan', balance: 72000, payment: 3000 }],
  },
  {
    id: 'nurse', name: 'Nars (Nurse)', emoji: '🏥',
    salary: 28000, tax: 4200, mandatoryDeductions: 1675,
    monthlyExpenses: 15000, startingCash: 40000,
    liabilities: [],
    specialAbility: 'ofw_upgrade',
  },
  {
    id: 'government', name: 'Kawani ng Gobyerno', emoji: '🏛️',
    salary: 32000, tax: 4800, mandatoryDeductions: 1675,
    monthlyExpenses: 17000, startingCash: 50000,
    liabilities: [{ name: 'SSS Salary Loan', balance: 48000, payment: 2000 }],
    specialAbility: 'pension_bonus_round24',
  },
  {
    id: 'business_owner', name: 'May-ari ng Negosyo', emoji: '🏪',
    salary: 0, variableIncome: true,
    tax: 0, mandatoryDeductions: 1675,
    monthlyExpenses: 35000, startingCash: 100000,
    liabilities: [{ name: 'Business Loan', balance: 480000, payment: 20000 }],
  },
  {
    id: 'ofw', name: 'OFW', emoji: '✈️',
    salary: 120000, tax: 0, mandatoryDeductions: 1675,
    monthlyExpenses: 70000, familyExpenses: 20000, startingCash: 200000,
    liabilities: [],
    specialMechanic: 'asset_risk_roll',
  },
  {
    id: 'teacher', name: 'Guro (Teacher)', emoji: '📚',
    salary: 22000, tax: 3300, mandatoryDeductions: 1675,
    monthlyExpenses: 14000, startingCash: 45000,
    liabilities: [],
    bonus: 'education_card_discount_20pct',
  },
];
```

## Board Spaces (24 spaces, inner Rat Race track, circular)

```js
const boardSpaces = [
  { id: 0,  type: 'sahod_day',         name: 'Sahod Day!'              },
  { id: 1,  type: 'maliit_deal',       name: 'Maliit na Deal'          },
  { id: 2,  type: 'gastos',            name: 'Gastos!'                 },
  { id: 3,  type: 'maliit_deal',       name: 'Maliit na Deal'          },
  { id: 4,  type: 'koneksyon',         name: 'Koneksyon'               },
  { id: 5,  type: 'sahod_day',         name: 'Sahod Day!'              },
  { id: 6,  type: 'malaking_deal',     name: 'Malaking Deal'           },
  { id: 7,  type: 'gastos',            name: 'Gastos!'                 },
  { id: 8,  type: 'maliit_deal',       name: 'Maliit na Deal'          },
  { id: 9,  type: 'pangyayari_buhay',  name: 'Pangyayari sa Buhay'     },
  { id: 10, type: 'sahod_day',         name: 'Sahod Day!'              },
  { id: 11, type: 'maliit_deal',       name: 'Maliit na Deal'          },
  { id: 12, type: 'bangko',            name: 'Bangko'                  },
  { id: 13, type: 'gastos',            name: 'Gastos!'                 },
  { id: 14, type: 'malaking_deal',     name: 'Malaking Deal'           },
  { id: 15, type: 'sahod_day',         name: 'Sahod Day!'              },
  { id: 16, type: 'bir_audit',         name: 'BIR Audit!'              },
  { id: 17, type: 'maliit_deal',       name: 'Maliit na Deal'          },
  { id: 18, type: 'gastos',            name: 'Gastos!'                 },
  { id: 19, type: 'pangyayari_merkado',name: 'Pangyayari sa Merkado'   },
  { id: 20, type: 'sahod_day',         name: 'Sahod Day!'              },
  { id: 21, type: 'maliit_deal',       name: 'Maliit na Deal'          },
  { id: 22, type: 'malaking_deal',     name: 'Malaking Deal'           },
  { id: 23, type: 'pangyayari_buhay',  name: 'Pangyayari sa Buhay'     },
];
```

## Card Decks

### Small Deal Cards (30 total — generate all 30 in the same pattern as these examples)
```js
// { id, name, cost, downPayment?, mortgage?, mortgagePayment?, monthlyIncome, assetType, description }
const smallDeals = [
  { id:'sd1',  name:'5-door Apartment (Cabanatuan, Nueva Ecija)', cost:800000, downPayment:160000, mortgage:640000, mortgagePayment:5000, monthlyIncome:12000, assetType:'real_estate', description:'Lumang apartment sa Nueva Ecija. ₱12,000 gross rent. ₱5,000 mortgage. ₱7,000 net.' },
  { id:'sd2',  name:'AREIT REIT Shares (500 shares @ ₱360)', cost:180000, monthlyIncome:900, assetType:'stock', description:'AREIT sa PSE. 6% annual dividend yield. ₱900/month.' },
  { id:'sd3',  name:'Sari-Sari Store (Barangay)', cost:40000, monthlyIncome:3500, assetType:'business', description:'Maliit na tindahan. ₱3,500/month net. Risk: Gastos cards can close it temporarily.' },
  { id:'sd4',  name:'Grab Car Partnership', cost:60000, monthlyIncome:5000, assetType:'business', description:'Kotse sa partner-driver. ₱5,000/month net pagkatapos ng maintenance.' },
  { id:'sd5',  name:'Online Dropshipping Setup', cost:15000, monthlyIncome:2000, assetType:'business', description:'E-commerce store. ₱2,000/month net. Mababang puhunan.' },
  { id:'sd6',  name:'MREIT Shares (1000 shares @ ₱20)', cost:200000, monthlyIncome:1100, assetType:'stock', description:'Megaworld REIT. Stable REIT na naka-list sa PSE.' },
  { id:'sd7',  name:'Studio Condo para Paupahan (QC near Katipunan)', cost:1200000, downPayment:240000, mortgage:960000, mortgagePayment:8000, monthlyIncome:9000, assetType:'real_estate', description:'Mahirap gawing cashflow positive. ₱9K rent minus ₱8K mortgage = ₱1K lang net.' },
  { id:'sd8',  name:'Kooperatiba Lending (₱100,000)', cost:100000, monthlyIncome:500, assetType:'lending', description:'Pera sa kooperatiba sa 6% p.a. interest.' },
  { id:'sd9',  name:'Self-Service Laundry Shop', cost:250000, monthlyIncome:8000, assetType:'business', description:'Coin laundry sa mataong lugar. Labor-light. ₱8,000/month net.' },
  { id:'sd10', name:'BDO Preferred Shares', cost:100000, monthlyIncome:600, assetType:'stock', description:'Fixed-dividend preferred shares. ₱600/month.' },
  { id:'sd11', name:'Bodega para Paupa (Valenzuela)', cost:500000, downPayment:100000, mortgage:400000, mortgagePayment:3500, monthlyIncome:8000, assetType:'real_estate', description:'Bodega na inaarkila ng maliit na negosyo. ₱8K rent, ₱3.5K mortgage.' },
  { id:'sd12', name:'Online Tutorial Business', cost:20000, monthlyIncome:4000, assetType:'business', description:'Nag-set up ng review class online. ₱4,000/month net.' },
  { id:'sd13', name:'Boarding House Room (1 room, Malate)', cost:300000, downPayment:60000, mortgage:240000, mortgagePayment:2000, monthlyIncome:5000, assetType:'real_estate', description:'Isang silid sa boarding house. ₱5K rent, ₱2K mortgage.' },
  { id:'sd14', name:'Dividends: Globe Telecom (100 shares)', cost:90000, monthlyIncome:400, assetType:'stock', description:'GLO shares sa PSE. Matatag na dividend payer.' },
  { id:'sd15', name:'Vending Machine (Office Building)', cost:35000, monthlyIncome:2500, assetType:'business', description:'Snack vending machine na naka-install sa opisina. ₱2,500/month net.' },
  // Claude Code generates sd16 to sd30 following the same pattern and realistic PH market values
];
```

### Big Deal Cards (20 total — generate all 20 in the same pattern)
```js
// { id, name, cost, downPayment, mortgage?, mortgagePayment?, monthlyIncome, netIncome?, assetType, description }
const bigDeals = [
  { id:'bd1', name:'3-Unit Townhouse (Marikina)', cost:4500000, downPayment:900000, mortgage:3600000, mortgagePayment:18000, monthlyIncome:42000, netIncome:24000, assetType:'real_estate', description:'3 units na nakatayo na. ₱42K gross rent, ₱18K mortgage. ₱24K net/month.' },
  { id:'bd2', name:'Commercial Lot (LIMA Estate, Laguna)', cost:3200000, downPayment:3200000, mortgage:0, mortgagePayment:0, monthlyIncome:0, assetType:'land', appreciates:true, description:'Industrial zone na lot. Walang kita ngayon. Malaking gain sa hinaharap.' },
  { id:'bd3', name:'10-Door Apartment Compound (Quezon City)', cost:9000000, downPayment:2700000, mortgage:6300000, mortgagePayment:35000, monthlyIncome:85000, netIncome:50000, assetType:'real_estate', description:'₱85K gross rent, ₱35K mortgage, ₱50K net/month.' },
  { id:'bd4', name:'Pre-Selling Condo (BGC, Taguig)', cost:6800000, downPayment:1360000, mortgage:0, mortgagePayment:0, monthlyIncome:0, assetType:'real_estate', risk:'delivery_risk', appreciates:true, description:'Pre-selling. Walang kita ngayon. 3 years delivery. Risk ng hindi matatapos.' },
  { id:'bd5', name:'Farm Lot (Batangas, 2 hectares)', cost:2500000, downPayment:2500000, mortgage:0, mortgagePayment:0, monthlyIncome:8000, assetType:'agriculture', description:'Inaarkila ng magsasaka. ₱8K/month pasture fee.' },
  { id:'bd6', name:'Food Franchise Regional Masterfranchise (Visayas)', cost:2000000, downPayment:2000000, mortgage:0, mortgagePayment:0, monthlyIncome:25000, assetType:'business', description:'Regional rights sa franchise. ₱25K/month royalty.' },
  { id:'bd7', name:'Gas Station (Provincial, Leased Site)', cost:5000000, downPayment:5000000, mortgage:0, mortgagePayment:0, monthlyIncome:60000, assetType:'business', description:'Dealer-owned, leased site. ₱60K/month net.' },
  { id:'bd8', name:'4-Storey Apartment Building (Caloocan)', cost:12000000, downPayment:3600000, mortgage:8400000, mortgagePayment:50000, monthlyIncome:120000, netIncome:70000, assetType:'real_estate', description:'20 units. ₱120K gross, ₱50K mortgage. ₱70K net.' },
  // Claude Code generates bd9 to bd20 following same pattern
];
```

### Gastos/Expense Cards (25 total — generate all 25)
```js
// type: 'liability' (adds monthly payment + balance) | 'expense' (adds monthly expense) | 'cash' (one-time cash deduction)
const gastosCards = [
  { id:'g1',  name:'Bagong Kotse (Installment)',          type:'liability', addedMonthlyPayment:18000, addedLiability:864000, description:'Na-tempt sa showroom. ₱18,000/month sa loob ng 48 buwan.' },
  { id:'g2',  name:'iPhone (In-house Financing)',          type:'liability', addedMonthlyPayment:4500,  addedLiability:54000,  description:'Pinakabago na modelo. ₱4,500/month sa 12 buwan.' },
  { id:'g3',  name:'Anak sa Pribadong Paaralan',          type:'expense',   addedMonthlyExpense:8000,  permanent:true,        description:'+₱8,000/month na permanenteng dagdag sa gastusin.' },
  { id:'g4',  name:'Online Sugal (E-Sabong/Poker)',        type:'cash',      cashLoss:30000,                                   description:'Maling taya. Nawala ₱30,000 mula sa cash.' },
  { id:'g5',  name:'Baha — Walang Insurance',              type:'cash',      cashLoss:80000, mitigatedByInsurance:true, insuranceCost:10000, description:'₱80,000 repair. ₱10,000 lang kung insured.' },
  { id:'g6',  name:'Medical Emergency (Walang HMO)',       type:'cash',      cashLoss:150000, mitigatedByInsurance:true, insuranceCost:50000, description:'₱150,000 ospital. ₱50,000 lang kung insured.' },
  { id:'g7',  name:'Credit Card Hindi Binabayaran',        type:'liability', addedMonthlyPayment:5000, addedLiability:50000, creditScorePenalty:-50, description:'3.5%/month interest. Credit score -50.' },
  { id:'g8',  name:'5-6 Loan Trap',                        type:'liability', addedMonthlyPayment:10000, addedLiability:50000, description:'₱50K sa 5-6. ₱10K/month bayad sa 6 buwan.' },
  { id:'g9',  name:'Major Car Repair',                     type:'cash',      cashLoss:45000,                                   description:'Napalitan ng makina ng kotse. ₱45,000.' },
  { id:'g10', name:'Renovation Frenzy',                    type:'cash',      cashLoss:60000,                                   description:'Home improvement na hindi nagdagdag ng halaga.' },
  { id:'g11', name:'Gadgets para sa Pamilya',              type:'cash',      cashLoss:80000,                                   description:'Phones para sa apat na miyembro. ₱80,000.' },
  { id:'g12', name:'Maling Investment (Scam)',             type:'cash',      cashLoss:100000,                                  description:'Na-scam sa investment scheme. Nawala ₱100,000.' },
  { id:'g13', name:'Pamilya — Bagong Upa',                 type:'expense',   addedMonthlyExpense:5000,  permanent:true,        description:'Napilitang lumipat ng mas mahal na bahay. +₱5,000/month.' },
  // Claude Code generates g14 to g25 following same pattern
];
```

### Life Event Cards (20 total)
```js
const lifeEvents = [
  { id:'le1',  name:'Na-promote Ka!',                     type:'salary_increase',  amount:8000,                                description:'+₱8,000/month sa sahod.' },
  { id:'le2',  name:'Nagsilang ang Anak',                 type:'expense',           addedMonthlyExpense:8000, permanent:true,  description:'+₱8,000/month gastusin. Permanente.' },
  { id:'le3',  name:'Nagretiro ang Magulang',             type:'expense',           addedMonthlyExpense:5000, permanent:true,  description:'+₱5,000/month suporta. Permanente.' },
  { id:'le4',  name:'Mana — Namatay ang Tito',           type:'cash_gain',         cashGain:500000,                           description:'+₱500,000 sa cash.' },
  { id:'le5',  name:'Natanggal sa Trabaho',               type:'job_loss',          rounds:2,                                  description:'Walang sahod sa 2 rounds. Passive income lang.' },
  { id:'le6',  name:'Nagpalit ng Trabaho',                type:'salary_multiplier', multiplier:1.2,                            description:'+20% sa sahod. Bagong kompanya.' },
  { id:'le7',  name:'Pumasok sa OFW (Nurse Only)',        type:'ofw_upgrade',       condition:'nurse',                         description:'Nurse lang: 3x ang sahod. Asset risk mechanic nag-aapply.' },
  { id:'le8',  name:'Annulment / Legal Separation',       type:'combo',             cashLoss:200000, addedMonthlyExpense:5000, permanent:true, description:'₱200K legal fees + ₱5K/month maintenance.' },
  { id:'le9',  name:'Nagbukas ng Side Hustle',            type:'passive_income',    monthlyIncome:5000,                        description:'+₱5,000/month passive income (freelance/consulting).' },
  { id:'le10', name:'Sakit — Nag-leave ng 3 Buwan',      type:'sick_leave',        rounds:3, salaryMultiplier:0.5,            description:'Kalahati lang ng sahod sa 3 rounds.' },
  // Claude Code generates le11 to le20 following same pattern
];
```

### Market Event Cards (15 total)
```js
const marketEvents = [
  { id:'me1',  name:'PSE Bull Run!',                      effect:'all_stocks_value_up',       magnitude:0.15, description:'Lahat ng stocks: +15% market value.' },
  { id:'me2',  name:'Real Estate Boom',                   effect:'all_realestate_value_up',   magnitude:0.10, description:'Lahat ng real estate: +10% value.' },
  { id:'me3',  name:'Bagyo at Baha (Walang Insurance)',   effect:'disaster_cash_loss',        cashLoss:50000, mitigatedByInsurance:true, insuranceCost:10000, description:'Uninsured: -₱50,000. Insured: -₱10,000.' },
  { id:'me4',  name:'BSP Interest Rate Hike',             effect:'all_loan_payments_up',      magnitude:0.10, description:'Lahat ng loan payments: +10% ngayong round.' },
  { id:'me5',  name:'Bagong Tren Extension',              effect:'urban_realestate_value_up', magnitude:0.20, description:'Urban real estate: +20% value.' },
  { id:'me6',  name:'Peso Depreciation',                  effect:'ofw_income_bonus',          amount:10000,   description:'OFW players: +₱10,000 sa sahod ngayong round.' },
  { id:'me7',  name:'POGO Ban',                           effect:'condo_value_down',          magnitude:0.15, description:'Condos: -15% value.' },
  { id:'me8',  name:'BIR Tax Amnesty',                    effect:'waive_bir_penalty',                         description:'Kung may pending BIR penalty: cancelled. Kung wala: discard.' },
  { id:'me9',  name:'Recession Quarter',                  effect:'variable_income_at_risk',                   description:'Variable income players: roll D6. 1-2 = kalahati ng normal na kita.' },
  { id:'me10', name:'OFW Remittance Boom',               effect:'provincial_realestate_up',  magnitude:0.05, description:'Non-NCR real estate: +5% value.' },
  { id:'me11', name:'Tech IPO sa PSE (Hot Stock!)',       effect:'player_choice_stock_gain',  magnitude:0.25, description:'Pumili ng isa mong stock: +25% value.' },
  { id:'me12', name:'Inflation Spike',                    effect:'immediate_expense_increase',amount:2000,    description:'LAHAT ng players: +₱2,000 sa monthly expenses ngayong round.' },
  { id:'me13', name:'Government Infrastructure Spending', effect:'all_realestate_value_up',   magnitude:0.05, description:'Lahat ng real estate: +5% value.' },
  { id:'me14', name:'OFW Bagong Patakaran (OWWA)',        effect:'ofw_cash_gain',             amount:30000,   description:'OFW players: +₱30,000 na OWWA benefit.' },
  { id:'me15', name:'Stock Market Crash',                 effect:'all_stocks_value_down',     magnitude:0.20, description:'Lahat ng stocks: -20% market value. Huwag mag-panic sell.' },
];
```

### Network/Koneksyon Cards (15 total — kept in hand, used anytime)
```js
const networkCards = [
  { id:'nc1',  name:'Accountant na Kaibigan',     effect:'skip_bir_penalty',        description:'Gamitin sa BIR Audit. I-skip ang lahat ng penalty.' },
  { id:'nc2',  name:'Broker na Kakilala',         effect:'first_look_big_deal',     description:'Sa susunod na Malaking Deal space: makakita ka rin at maaaring bumili.' },
  { id:'nc3',  name:'Kontratista',                effect:'rehab_cost_minus_20pct',  description:'Sa susunod na property deal: -20% sa cost.' },
  { id:'nc4',  name:'DOST-Accredited Appraiser', effect:'brrrr_ltv_80pct',         description:'Sa susunod na BRRRR refinancing: 80% LTV instead of 70%.' },
  { id:'nc5',  name:'Banker na Kaibigan',         effect:'waive_one_loan_interest', description:'I-waive ang interest payment ng isang loan ngayong round.' },
  { id:'nc6',  name:'Abogado (Lawyer)',           effect:'skip_title_delay',        description:'Sa susunod na property purchase: skip transfer penalty/delay.' },
  { id:'nc7',  name:'HR Recruiter',              effect:'salary_plus_5000',        description:'Gamitin kahit kailan: +₱5,000 sa monthly salary mo.' },
  { id:'nc8',  name:'Financial Advisor',         effect:'next_deal_analysis',      description:'Sa susunod na deal card: kitain ang full cashflow analysis bago mag-decide.' },
  { id:'nc9',  name:'Paluwagan Organizer',       effect:'paluwagan_start',         description:'Mag-imbita ng co-players sa paluwagan. Lahat magdeposit ng ₱10K/round, isang player ang manalo ng pot bawat round.' },
  { id:'nc10', name:'Insurance Agent',           effect:'free_first_month_insurance', description:'Ma-activate ang insurance nang libre ngayong round.' },
  // Claude Code generates nc11 to nc15
];
```

## Special Mechanics (Detailed Specs)

### 1. Inflation Engine
- Track: `inflationCounter` (starts 0) in global store
- Every Sahod Day space landed on by ANY player: inflationCounter++
- When inflationCounter reaches 8: ALL players monthlyExpenses += 1000, inflationCounter resets to 0
- Display inflation counter on board UI

### 2. Market Cycle Indicator (shared state)
- Values: 'bear' | 'normal' | 'bull'
- Default: 'normal'
- Effect on asset values: bull = +20%, bear = -20%, normal = 0%
- Effect on deal cards: in bull market, cost of buying deals is higher; in bear, lower
- Change triggers: Market Event card OR 20% random chance every 6 rounds
- Display as visual dial in center of board

### 3. Credit Score Per Player
- Starts: 650
- Events: new loan taken (-20), 3 consecutive on-time payments (+30), loan paid off (+50), missed payment (-80), credit card gastos card (-50)
- Thresholds:
  - < 500: Bangko space locked. Only 5-6 lender available (addedMonthlyPayment = borrowedAmount × 0.20 per month)
  - 500–699: Standard bank loan rates
  - 700+: Pag-IBIG rates (mortgagePayment per ₱1M = ₱5,500 vs standard ₱8,000)
  - 800+: BRRRR LTV unlocks to 80%

### 4. Tenant Dice Roll
- Triggers: every Sahod Day, before collecting rent
- Per rental property owned: roll D6
  - 1: Vacancy (₱0 rent this month from this property only)
  - 2: Tenant damage (collect rent MINUS ₱15,000 repair cost)
  - 3–6: Full rent collected

### 5. BRRRR Mechanic (at Bangko space)
- Player selects one rental property to refinance
- appraisedValue = property.currentValue × marketCycleMultiplier
- ltvPct = creditScore >= 800 || hasAppraiserCard ? 0.80 : 0.70
- maxNewLoan = appraisedValue × ltvPct
- cashOut = maxNewLoan - property.remainingMortgage
- If cashOut <= 0: show warning, mechanic fails for this property
- If cashOut > 0: create new loan (maxNewLoan), player receives cashOut in cash
- New mortgage payment = maxNewLoan / 1000000 × 8000 (or 5500 if 700+ credit)

### 6. Insurance Toggle (at Bangko space)
- Cost: +₱3,000/month added to player expenses
- When active: disaster and medical cards apply mitigated cost instead of full cost
- Player can toggle off at Bangko, removing ₱3,000 from expenses

### 7. BIR Audit Space
- Roll D6:
  - 1–2: Pay ₱20,000 penalty (waived if Accountant network card held)
  - 3–4: Auto-pass (show a "clean books" message)
  - 5–6: BIR Refund — player receives ₱10,000

### 8. OFW Asset Risk (OFW profession only)
- Every Sahod Day: roll D6
  - Roll 1: A family member mismanaged one asset — lose 1 month rent from a random rental property (player selects which property is at risk)

### 9. Business Owner Variable Income
- Every Sahod Day instead of fixed salary: roll D6 × ₱10,000 = this round's active income
- Tax computed at 15% of whatever the roll produces

## Game Constants
```js
export const BANK_RATE_PER_MILLION = 8000;
export const PAGIBIG_RATE_PER_MILLION = 5500;
export const FIVE_SIX_MONTHLY_RATE = 0.20;
export const INFLATION_TRIGGER_COUNT = 8;
export const INFLATION_AMOUNT = 1000;
export const DEFAULT_CREDIT_SCORE = 650;
export const BRRRR_LTV_STANDARD = 0.70;
export const BRRRR_LTV_PREMIUM = 0.80;
export const MARKET_CHANGE_PROBABILITY = 0.20;
export const MARKET_CYCLE_CHANGE_EVERY_N_ROUNDS = 6;
export const TENANT_VACANCY_ROLL = 1;
export const TENANT_DAMAGE_ROLL = 2;
export const TENANT_DAMAGE_COST = 15000;
export const INSURANCE_MONTHLY_COST = 3000;
export const WIN_NET_WORTH_TARGET = 10000000;
export const WIN_PASSIVE_INCOME_TARGET = 100000;
export const BIR_PENALTY = 20000;
export const BIR_REFUND = 10000;
export const CREDIT_NEW_LOAN = -20;
export const CREDIT_THREE_PAYMENTS = +30;
export const CREDIT_LOAN_PAID = +50;
export const CREDIT_MISSED_PAYMENT = -80;
export const CREDIT_CARD_PENALTY = -50;
```
