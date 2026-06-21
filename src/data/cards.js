// ─── Small Deal Cards ─────────────────────────────────────────────────────────
// sd1–sd30: original 30 cards (exclusive added where monthlyIncome >= 5000)
// sd31–sd42: new passive income cards
// sd43–sd47: trap deal cards
export const smallDeals = [
  {
    id: 'sd1',  name: '5-door Apartment (Cabanatuan, Nueva Ecija)',
    cost: 800000, downPayment: 160000, mortgage: 640000, mortgagePayment: 5000,
    monthlyIncome: 12000, assetType: 'real_estate', exclusive: true,
    description: 'Lumang apartment sa Nueva Ecija. ₱12,000 gross rent. ₱5,000 mortgage. ₱7,000 net.',
  },
  {
    id: 'sd2',  name: 'AREIT REIT Shares (500 shares @ ₱360)',
    cost: 180000, monthlyIncome: 900, assetType: 'stock',
    description: 'AREIT sa PSE. 6% annual dividend yield. ₱900/month.',
  },
  {
    id: 'sd3',  name: 'Sari-Sari Store (Barangay)',
    cost: 40000, monthlyIncome: 3500, assetType: 'business',
    description: 'Maliit na tindahan. ₱3,500/month net. Risk: Gastos cards can close it temporarily.',
  },
  {
    id: 'sd4',  name: 'Grab Car Partnership',
    cost: 60000, monthlyIncome: 5000, assetType: 'business', exclusive: true,
    description: 'Kotse sa partner-driver. ₱5,000/month net pagkatapos ng maintenance.',
  },
  {
    id: 'sd5',  name: 'Online Dropshipping Setup',
    cost: 15000, monthlyIncome: 2000, assetType: 'business',
    description: 'E-commerce store. ₱2,000/month net. Mababang puhunan.',
  },
  {
    id: 'sd6',  name: 'MREIT Shares (1000 shares @ ₱20)',
    cost: 200000, monthlyIncome: 1100, assetType: 'stock',
    description: 'Megaworld REIT. Stable REIT na naka-list sa PSE.',
  },
  {
    id: 'sd7',  name: 'Studio Condo para Paupahan (QC near Katipunan)',
    cost: 1200000, downPayment: 240000, mortgage: 960000, mortgagePayment: 8000,
    monthlyIncome: 9000, assetType: 'real_estate', exclusive: true,
    description: 'Mahirap gawing cashflow positive. ₱9K rent minus ₱8K mortgage = ₱1K lang net.',
  },
  {
    id: 'sd8',  name: 'Kooperatiba Lending (₱100,000)',
    cost: 100000, monthlyIncome: 500, assetType: 'lending',
    description: 'Pera sa kooperatiba sa 6% p.a. interest.',
  },
  {
    id: 'sd9',  name: 'Self-Service Laundry Shop',
    cost: 250000, monthlyIncome: 8000, assetType: 'business', exclusive: true,
    description: 'Coin laundry sa mataong lugar. Labor-light. ₱8,000/month net.',
  },
  {
    id: 'sd10', name: 'BDO Preferred Shares',
    cost: 100000, monthlyIncome: 600, assetType: 'stock',
    description: 'Fixed-dividend preferred shares. ₱600/month.',
  },
  {
    id: 'sd11', name: 'Bodega para Paupa (Valenzuela)',
    cost: 500000, downPayment: 100000, mortgage: 400000, mortgagePayment: 3500,
    monthlyIncome: 8000, assetType: 'real_estate', exclusive: true,
    description: 'Bodega na inaarkila ng maliit na negosyo. ₱8K rent, ₱3.5K mortgage.',
  },
  {
    id: 'sd12', name: 'Online Tutorial Business',
    cost: 20000, monthlyIncome: 4000, assetType: 'business',
    description: 'Nag-set up ng review class online. ₱4,000/month net.',
  },
  {
    id: 'sd13', name: 'Boarding House Room (1 room, Malate)',
    cost: 300000, downPayment: 60000, mortgage: 240000, mortgagePayment: 2000,
    monthlyIncome: 5000, assetType: 'real_estate', exclusive: true,
    description: 'Isang silid sa boarding house. ₱5K rent, ₱2K mortgage.',
  },
  {
    id: 'sd14', name: 'Dividends: Globe Telecom (100 shares)',
    cost: 90000, monthlyIncome: 400, assetType: 'stock',
    description: 'GLO shares sa PSE. Matatag na dividend payer.',
  },
  {
    id: 'sd15', name: 'Vending Machine (Office Building)',
    cost: 35000, monthlyIncome: 2500, assetType: 'business',
    description: 'Snack vending machine na naka-install sa opisina. ₱2,500/month net.',
  },
  {
    id: 'sd16', name: 'Pag-IBIG MP2 Savings (₱200,000)',
    cost: 200000, monthlyIncome: 1500, assetType: 'lending',
    description: 'Modified Pag-IBIG II. 7–9% p.a. average dividend. ₱1,500/month estimated.',
  },
  {
    id: 'sd17', name: 'FILRT REIT Shares (2000 shares @ ₱8.50)',
    cost: 170000, monthlyIncome: 850, assetType: 'stock',
    description: 'Filinvest REIT. Naka-list sa PSE. Quarterly dividends, ~6% p.a.',
  },
  {
    id: 'sd18', name: 'Tricycle Franchise (1 unit, Cavite)',
    cost: 80000, monthlyIncome: 4000, assetType: 'business',
    description: 'Isang tricycle sa partner-driver. ₱4,000/month net. ₱133/araw.',
  },
  {
    id: 'sd19', name: '1-Bedroom Apartment (Batangas City)',
    cost: 550000, downPayment: 110000, mortgage: 440000, mortgagePayment: 3500,
    monthlyIncome: 7500, assetType: 'real_estate', exclusive: true,
    description: '1BR apartment. ₱7,500 rent, ₱3,500 mortgage. ₱4,000 net/month.',
  },
  {
    id: 'sd20', name: 'Printing at Photocopy Shop (Malapit sa Pamantasan)',
    cost: 120000, monthlyIncome: 6000, assetType: 'business', exclusive: true,
    description: 'Malapit sa kolehiyo. ₱6,000/month net pagkatapos ng utilities at supplies.',
  },
  {
    id: 'sd21', name: 'CREIT REIT Shares (5000 shares @ ₱2.80)',
    cost: 140000, monthlyIncome: 700, assetType: 'stock',
    description: 'Citicore Energy REIT. Renewable energy ang tenants. ~6% p.a. dividend.',
  },
  {
    id: 'sd22', name: 'Airbnb — Spare Room (Baguio)',
    cost: 50000, monthlyIncome: 6500, assetType: 'business', exclusive: true,
    description: 'Ini-rent ang isang kwarto sa Baguio. ₱6,500/month average. May seasonality.',
  },
  {
    id: 'sd23', name: 'Water Refilling Station',
    cost: 180000, monthlyIncome: 7000, assetType: 'business', exclusive: true,
    description: 'Tubig negosyo sa residential area. ₱7,000/month net. Mababang overhead.',
  },
  {
    id: 'sd24', name: 'Nail Spa / Beauty Bar (Space Rentahan)',
    cost: 150000, monthlyIncome: 8000, assetType: 'business', exclusive: true,
    description: 'Maliit na beauty bar. ₱8,000/month net. ₱3,000 upa sa espasyo.',
  },
  {
    id: 'sd25', name: 'Angkas Driver Partnership',
    cost: 50000, monthlyIncome: 3500, assetType: 'business',
    description: 'Motor sa partner-driver. ₱3,500/month net. Low capital, daily income.',
  },
  {
    id: 'sd26', name: 'Solar Panel Lease (Iniarkila ang Bubong ng Kaibigan)',
    cost: 120000, monthlyIncome: 3000, assetType: 'lending',
    description: 'Naglagay ng solar panels sa bubong ng iba. ₱3,000/month lease income.',
  },
  {
    id: 'sd27', name: 'Home-Based Bake Shop (Online Orders)',
    cost: 30000, monthlyIncome: 4500, assetType: 'business',
    description: 'Bread at pastries sa orders lang. ₱4,500/month net. Mababang puhunan.',
  },
  {
    id: 'sd28', name: 'SSS PESO Fund (₱150,000)',
    cost: 150000, monthlyIncome: 750, assetType: 'lending',
    description: 'SSS Personal Equity and Savings Option. ~6% p.a. ₱750/month estimated.',
  },
  {
    id: 'sd29', name: 'Kubo at Camote Farm (Batangas, 500 sqm)',
    cost: 200000, monthlyIncome: 4000, assetType: 'agriculture',
    description: 'Maliit na farm na inaarkila ng magsasaka. ₱4,000/month lease income.',
  },
  {
    id: 'sd30', name: 'E-Loading / GCash Cash-In Point',
    cost: 25000, monthlyIncome: 3000, assetType: 'business',
    description: 'Maliit na e-loading business sa tindahan. ₱3,000/month commission net.',
  },

  // ── New small deal cards sd31–sd42 ──────────────────────────────────────────
  {
    id: 'sd31', name: 'Nagpaarkila ng Parking Slot sa BGC Condo',
    purchasePrice: 0, cashFlow: 4500, exclusive: false,
    lesson: 'Ang parking slot na hindi mo ginagamit ay maaaring mapagkakitaan.',
  },
  {
    id: 'sd32', name: 'Naglagay ng Vending Machine sa Opisina',
    purchasePrice: 18000, cashFlow: 2200, exclusive: false,
    lesson: 'Kahit maliit na makina, nagtatrabaho ito para sa iyo 24/7.',
  },
  {
    id: 'sd33', name: 'Nagrenta ng Kagamitan tuwing Events (Rev Share)',
    purchasePrice: 0, cashFlow: 1800, exclusive: false,
    lesson: 'Hindi mo kailangang mag-ari ng asset para kumita — pwedeng rev share arrangement.',
  },
  {
    id: 'sd34', name: 'Stock Photo Royalties — Isinubmit sa Shutterstock',
    purchasePrice: 0, cashFlow: 900, exclusive: false,
    lesson: 'Ang intellectual property ay nagbibigay ng kita kahit natutulog ka.',
  },
  {
    id: 'sd35', name: 'Nagpaarkila ng Rooftop para sa Cell Tower',
    purchasePrice: 0, cashFlow: 6500, exclusive: true,
    lesson: 'Ang mga telecom company ay naghahanap ng espasyo — ikaw ang may-ari nito.',
  },
  {
    id: 'sd36', name: 'Nagbenta ng Digital Template sa Shopee',
    purchasePrice: 2000, cashFlow: 1500, exclusive: false,
    lesson: 'Digital products: isang beses gumawa, paulit-ulit na kita.',
  },
  {
    id: 'sd37', name: 'Nagpaupa ng Kwarto sa Boarder',
    purchasePrice: 5000, cashFlow: 3500, exclusive: false,
    lesson: 'Ang kwarto na bakante ay gastos. Ang kwartong may tao ay kita.',
  },
  {
    id: 'sd38', name: 'Water Refilling Station Franchise Slot',
    purchasePrice: 35000, cashFlow: 5000, exclusive: true,
    lesson: 'Ang franchise ay nagbibigay ng sistema na pati na-test na.',
  },
  {
    id: 'sd39', name: 'Nagpautang sa P2P Lending Platform (SeedIn)',
    purchasePrice: 50000, cashFlow: 2500, exclusive: false,
    lesson: 'Ang P2P lending ay naglalagay ng iyong pera sa trabaho — may risk ng default.',
  },
  {
    id: 'sd40', name: 'YouTube Channel — Nagmonetize ng Old Videos',
    purchasePrice: 0, cashFlow: 1200, exclusive: false,
    lesson: 'Ang lumang content ay pwedeng magbigay ng bagong kita.',
  },
  {
    id: 'sd41', name: 'Nag-sublease ng Bahagi ng Office Space',
    purchasePrice: 0, cashFlow: 8000, exclusive: true,
    lesson: 'Ang espasyong hindi mo ginagamit buong araw ay asset na naka-idle.',
  },
  {
    id: 'sd42', name: 'Nagpadala ng OFW Remittance Fund sa REIT',
    purchasePrice: 20000, cashFlow: 1800, exclusive: false,
    lesson: 'Ang remittance ay hindi lang pang-gastos — pwede ring pang-invest.',
  },

  // ── Trap deal cards sd43–sd47 ────────────────────────────────────────────────
  {
    id: 'sd43', name: 'Pre-Selling Condo sa Taguig — Maagang Pumasok',
    purchasePrice: 180000, cashFlow: 0, exclusive: false,
    cardType: 'trap_deal', trapDelay: 4,
    trapBullOutcome: { cashFlow: 0, oneTimeGain: 100000, description: 'Natapos ang condo — ibinenta mo ng tubo na ₱100,000!' },
    trapBearOutcome: { cashFlow: 0, oneTimeLoss: 180000, description: 'Nalugi ang developer — nawala ang iyong buong puhunan.' },
    lesson: 'Ang pre-selling ay speculative — hindi guaranteed ang kita.',
  },
  {
    id: 'sd44', name: 'Nagpuhunan sa Negosyo ng Kaibigan',
    purchasePrice: 80000, cashFlow: 0, exclusive: false,
    cardType: 'trap_deal', trapDelay: 3,
    trapBullOutcome: { cashFlow: 3000, oneTimeGain: 0, description: 'Kumikita ang negosyo — +₱3,000/month passive income.' },
    trapBearOutcome: { cashFlow: 0, oneTimeLoss: 80000, description: 'Nagsara ang negosyo — nawala ang puhunan mo.' },
    lesson: 'Ang pamumuhunan sa kaibigan ay may sentimental at financial na risk.',
  },
  {
    id: 'sd45', name: 'Crypto Staking — Naglagay sa DeFi Yield Farm',
    purchasePrice: 100000, cashFlow: 0, exclusive: false,
    cardType: 'trap_deal', trapDelay: 2,
    trapBullOutcome: { cashFlow: 5000, oneTimeGain: 0, description: 'Stable ang yield farm — +₱5,000/month passive income.' },
    trapBearOutcome: { cashFlow: 0, oneTimeLoss: 100000, description: 'Rug pull — nawala ang buong puhunan.' },
    lesson: 'Ang mataas na yield ay kadalasang may katumbas na mataas na risk.',
  },
  {
    id: 'sd46', name: 'Forex Hobby Trader',
    purchasePrice: 50000, cashFlow: 0, exclusive: false,
    cardType: 'trap_deal', trapDelay: 3,
    trapBullOutcome: { cashFlow: 2000, oneTimeGain: 0, description: 'Consistent ang trades — +₱2,000/month net.' },
    trapBearOutcome: { cashFlow: 0, oneTimeLoss: 50000, description: 'Account blown — wala nang natira sa trading account.' },
    lesson: 'Ang forex trading ay hindi passive income — ito ay aktibong spekulasyon.',
  },
  {
    id: 'sd47', name: "Naging MLM 'Investor' para sa Kaibigan",
    purchasePrice: 30000, cashFlow: 0, exclusive: false,
    cardType: 'trap_deal', trapDelay: 2,
    trapBullOutcome: { cashFlow: 0, oneTimeGain: 0, description: 'Walang income. ₱30,000 ang halaga ng aralin: suriin ang datos bago mag-invest.' },
    trapBearOutcome: { cashFlow: 0, oneTimeLoss: 0, description: 'Walang income. Parehong resulta ang bull at bear para sa MLM.' },
    lesson: 'Ang MLM ay nagbebenta ng pangarap. Datos: mas maraming naglugi kaysa kumita.',
  },
];

// ─── Big Deal Cards ───────────────────────────────────────────────────────────
// All cards have exclusive: true
// bd1–bd20: original 20 cards; bd21–bd25: new cards
export const bigDeals = [
  {
    id: 'bd1',  name: '3-Unit Townhouse (Marikina)',
    cost: 4500000, downPayment: 900000, mortgage: 3600000, mortgagePayment: 18000,
    monthlyIncome: 42000, netIncome: 24000, assetType: 'real_estate', exclusive: true,
    description: '3 units na nakatayo na. ₱42K gross rent, ₱18K mortgage. ₱24K net/month.',
  },
  {
    id: 'bd2',  name: 'Commercial Lot (LIMA Estate, Laguna)',
    cost: 3200000, downPayment: 3200000, mortgage: 0, mortgagePayment: 0,
    monthlyIncome: 0, assetType: 'land', appreciates: true, exclusive: true,
    description: 'Industrial zone na lot. Walang kita ngayon. Malaking gain sa hinaharap.',
  },
  {
    id: 'bd3',  name: '10-Door Apartment Compound (Quezon City)',
    cost: 9000000, downPayment: 2700000, mortgage: 6300000, mortgagePayment: 35000,
    monthlyIncome: 85000, netIncome: 50000, assetType: 'real_estate', exclusive: true,
    description: '₱85K gross rent, ₱35K mortgage, ₱50K net/month.',
  },
  {
    id: 'bd4',  name: 'Pre-Selling Condo (BGC, Taguig)',
    cost: 6800000, downPayment: 1360000, mortgage: 0, mortgagePayment: 0,
    monthlyIncome: 0, assetType: 'real_estate', risk: 'delivery_risk', appreciates: true, exclusive: true,
    description: 'Pre-selling. Walang kita ngayon. 3 years delivery. Risk ng hindi matatapos.',
  },
  {
    id: 'bd5',  name: 'Farm Lot (Batangas, 2 hectares)',
    cost: 2500000, downPayment: 2500000, mortgage: 0, mortgagePayment: 0,
    monthlyIncome: 8000, assetType: 'agriculture', exclusive: true,
    description: 'Inaarkila ng magsasaka. ₱8K/month pasture fee.',
  },
  {
    id: 'bd6',  name: 'Food Franchise Regional Masterfranchise (Visayas)',
    cost: 2000000, downPayment: 2000000, mortgage: 0, mortgagePayment: 0,
    monthlyIncome: 25000, assetType: 'business', exclusive: true,
    description: 'Regional rights sa franchise. ₱25K/month royalty.',
  },
  {
    id: 'bd7',  name: 'Gas Station (Provincial, Leased Site)',
    cost: 5000000, downPayment: 5000000, mortgage: 0, mortgagePayment: 0,
    monthlyIncome: 60000, assetType: 'business', exclusive: true,
    description: 'Dealer-owned, leased site. ₱60K/month net.',
  },
  {
    id: 'bd8',  name: '4-Storey Apartment Building (Caloocan)',
    cost: 12000000, downPayment: 3600000, mortgage: 8400000, mortgagePayment: 50000,
    monthlyIncome: 120000, netIncome: 70000, assetType: 'real_estate', exclusive: true,
    description: '20 units. ₱120K gross, ₱50K mortgage. ₱70K net.',
  },
  {
    id: 'bd9',  name: 'Pension House / Bed and Breakfast (Baguio)',
    cost: 8000000, downPayment: 2400000, mortgage: 5600000, mortgagePayment: 32000,
    monthlyIncome: 90000, netIncome: 58000, assetType: 'real_estate', exclusive: true,
    description: '15 rooms sa Baguio. ₱90K gross, ₱32K mortgage. ₱58K net. May seasonality.',
  },
  {
    id: 'bd10', name: 'Events Place / Function Hall (Pampanga)',
    cost: 4500000, downPayment: 1350000, mortgage: 3150000, mortgagePayment: 17500,
    monthlyIncome: 50000, netIncome: 32500, assetType: 'business', exclusive: true,
    description: 'Events venue. Average 4 bookings/month. ₱50K gross, ₱32.5K net.',
  },
  {
    id: 'bd11', name: 'Cold Storage Warehouse for Lease (Bulacan)',
    cost: 6000000, downPayment: 1800000, mortgage: 4200000, mortgagePayment: 25000,
    monthlyIncome: 70000, netIncome: 45000, assetType: 'real_estate', exclusive: true,
    description: 'Cold chain logistics property. ₱70K/month lease, ₱25K mortgage. ₱45K net.',
  },
  {
    id: 'bd12', name: 'Multi-Level Parking Building (Binondo, Manila)',
    cost: 15000000, downPayment: 4500000, mortgage: 10500000, mortgagePayment: 55000,
    monthlyIncome: 130000, netIncome: 75000, assetType: 'real_estate', exclusive: true,
    description: '5 levels, 80 slots. ₱130K gross, ₱55K mortgage. ₱75K net/month.',
  },
  {
    id: 'bd13', name: 'Pre-Selling Lot (South Road Properties, Cebu)',
    cost: 3800000, downPayment: 3800000, mortgage: 0, mortgagePayment: 0,
    monthlyIncome: 0, assetType: 'land', appreciates: true, exclusive: true,
    description: 'Premium lot sa Cebu business district. Walang kita ngayon. Mataas na potential.',
  },
  {
    id: 'bd14', name: '6-Door Apartment (Cagayan de Oro)',
    cost: 5500000, downPayment: 1650000, mortgage: 3850000, mortgagePayment: 21000,
    monthlyIncome: 54000, netIncome: 33000, assetType: 'real_estate', exclusive: true,
    description: '6 units sa CDO. ₱54K gross, ₱21K mortgage. ₱33K net/month.',
  },
  {
    id: 'bd15', name: 'Car Wash Franchise (6-Bay, Clark, Pampanga)',
    cost: 3500000, downPayment: 3500000, mortgage: 0, mortgagePayment: 0,
    monthlyIncome: 45000, assetType: 'business', exclusive: true,
    description: 'High-traffic na car wash sa Clark. ₱45K/month net pagkatapos ng staff at utilities.',
  },
  {
    id: 'bd16', name: 'Resort (3 cottages + pool, Batangas Beach)',
    cost: 7500000, downPayment: 2250000, mortgage: 5250000, mortgagePayment: 30000,
    monthlyIncome: 80000, netIncome: 50000, assetType: 'business', exclusive: true,
    description: 'Maliit na beach resort. ₱80K gross, ₱30K mortgage. ₱50K net. May off-season.',
  },
  {
    id: 'bd17', name: 'Commercial Building (Ground Floor Shops, Mandaluyong)',
    cost: 18000000, downPayment: 5400000, mortgage: 12600000, mortgagePayment: 70000,
    monthlyIncome: 160000, netIncome: 90000, assetType: 'real_estate', exclusive: true,
    description: '4 commercial units. ₱160K gross, ₱70K mortgage. ₱90K net/month.',
  },
  {
    id: 'bd18', name: 'Mango Plantation (2 hectares, Guimaras)',
    cost: 2800000, downPayment: 2800000, mortgage: 0, mortgagePayment: 0,
    monthlyIncome: 12000, assetType: 'agriculture', exclusive: true,
    description: 'Established mango trees. ₱12K/month average net. May harvest seasonality.',
  },
  {
    id: 'bd19', name: 'Fast Food Franchise (National Brand, Mall Kiosk)',
    cost: 4000000, downPayment: 4000000, mortgage: 0, mortgagePayment: 0,
    monthlyIncome: 55000, assetType: 'business', exclusive: true,
    description: 'Mall-based food kiosk ng kilalang brand. ₱55K/month net royalty income.',
  },
  {
    id: 'bd20', name: 'Mixed-Use Building (Shops + Apartments, Davao)',
    cost: 14000000, downPayment: 4200000, mortgage: 9800000, mortgagePayment: 54000,
    monthlyIncome: 140000, netIncome: 86000, assetType: 'real_estate', exclusive: true,
    description: '4 commercial + 8 residential units. ₱140K gross, ₱54K mortgage. ₱86K net.',
  },

  // ── New big deal cards bd21–bd25 ─────────────────────────────────────────────
  {
    id: 'bd21', name: 'Nag-acquire ng Existing Shopee Store (May Established Reviews)',
    purchasePrice: 120000, cashFlow: 9000, exclusive: true,
    lesson: 'Mas mura ang bumili ng cash-flowing business kaysa magsimula ng bago.',
  },
  {
    id: 'bd22', name: 'Nagtayo ng Self-Storage Facility sa Probinsya',
    purchasePrice: 350000, cashFlow: 18000, liabilityPayment: 2000, exclusive: true,
    lesson: 'Ang tao ay nagdadagdag ng gamit — self-storage ay recession-resistant.',
  },
  {
    id: 'bd23', name: 'Solar Panel sa Commercial Property — FIT-All Program',
    purchasePrice: 500000, cashFlow: 22000, exclusive: true,
    lesson: 'Ang enerhiya na hindi mo nagastos ay energy na ibinenta mo sa Meralco.',
  },
  {
    id: 'bd24', name: 'Biniling TNVS Franchise — Driver sa Boundary',
    purchasePrice: 200000, cashFlow: 12000, exclusive: true,
    lesson: 'Ang boundary scheme ay naglalagay ng ibang tao sa trabaho para sa iyo.',
  },
  {
    id: 'bd25', name: 'Naglagay ng ATM Terminal — Transaction Fee Income',
    purchasePrice: 280000, cashFlow: 14500, exclusive: true,
    lesson: 'Ang bawat transaksyon ng ibang tao ay maliit na kita para sa may-ari ng terminal.',
  },
];

// ─── Gastos / Expense Cards ───────────────────────────────────────────────────
// type: 'liability' | 'expense' | 'cash'
// minRound: earliest round this card can appear (formula in GAMEPLAN Part B)
// g1–g25: original 25 cards; g26–g35: new cards
export const gastosCards = [
  {
    id: 'g1',  name: 'Bagong Kotse (Installment)',
    type: 'liability', addedMonthlyPayment: 18000, addedLiability: 864000, minRound: 8,
    description: 'Na-tempt sa showroom. ₱18,000/month sa loob ng 48 buwan.',
  },
  {
    id: 'g2',  name: 'iPhone (In-house Financing)',
    type: 'liability', addedMonthlyPayment: 4500, addedLiability: 54000, minRound: 4,
    description: 'Pinakabago na modelo. ₱4,500/month sa 12 buwan.',
  },
  {
    id: 'g3',  name: 'Anak sa Pribadong Paaralan',
    type: 'expense', addedMonthlyExpense: 8000, permanent: true, minRound: 6,
    description: '+₱8,000/month na permanenteng dagdag sa gastusin.',
  },
  {
    id: 'g4',  name: 'Online Sugal (E-Sabong/Poker)',
    type: 'cash', cashLoss: 30000, minRound: 6,
    description: 'Maling taya. Nawala ₱30,000 mula sa cash.',
  },
  {
    id: 'g5',  name: 'Baha — Walang Insurance',
    type: 'cash', cashLoss: 80000, mitigatedByInsurance: true, insuranceCost: 10000, minRound: 10,
    description: '₱80,000 repair. ₱10,000 lang kung insured.',
  },
  {
    id: 'g6',  name: 'Medical Emergency (Walang HMO)',
    type: 'cash', cashLoss: 150000, mitigatedByInsurance: true, insuranceCost: 50000, minRound: 10,
    description: '₱150,000 ospital. ₱50,000 lang kung insured.',
  },
  {
    id: 'g7',  name: 'Credit Card Hindi Binabayaran',
    type: 'liability', addedMonthlyPayment: 5000, addedLiability: 50000, creditScorePenalty: -50, minRound: 4,
    description: '3.5%/month interest. Credit score -50.',
  },
  {
    id: 'g8',  name: '5-6 Loan Trap',
    type: 'liability', addedMonthlyPayment: 10000, addedLiability: 50000, minRound: 8,
    description: '₱50K sa 5-6. ₱10K/month bayad sa 6 buwan.',
  },
  {
    id: 'g9',  name: 'Major Car Repair',
    type: 'cash', cashLoss: 45000, minRound: 6,
    description: 'Napalitan ng makina ng kotse. ₱45,000.',
  },
  {
    id: 'g10', name: 'Renovation Frenzy',
    type: 'cash', cashLoss: 60000, minRound: 10,
    description: 'Home improvement na hindi nagdagdag ng halaga.',
  },
  {
    id: 'g11', name: 'Gadgets para sa Pamilya',
    type: 'cash', cashLoss: 80000, minRound: 10,
    description: 'Phones para sa apat na miyembro. ₱80,000.',
  },
  {
    id: 'g12', name: 'Maling Investment (Scam)',
    type: 'cash', cashLoss: 100000, minRound: 10,
    description: 'Na-scam sa investment scheme. Nawala ₱100,000.',
  },
  {
    id: 'g13', name: 'Pamilya — Bagong Upa',
    type: 'expense', addedMonthlyExpense: 5000, permanent: true, minRound: 6,
    description: 'Napilitang lumipat ng mas mahal na bahay. +₱5,000/month.',
  },
  {
    id: 'g14', name: 'Utang ng Kapatid (Pinanghiram)',
    type: 'cash', cashLoss: 40000, minRound: 6,
    description: 'Pamilya nangangailangan. ₱40,000 ang nilabas. Hindi mababawi.',
  },
  {
    id: 'g15', name: 'Maluho na Bakasyon (Boracay, Business Class)',
    type: 'cash', cashLoss: 70000, minRound: 10,
    description: 'YOLO trip. ₱70,000 all-in para sa pamilya.',
  },
  {
    id: 'g16', name: 'Kasal — Grand Reception',
    type: 'cash', cashLoss: 250000, minRound: 10,
    description: 'Malaking kasal na hindi kaya ng budget. ₱250,000.',
  },
  {
    id: 'g17', name: 'Appliances on Installment (Ref + TV + Washer)',
    type: 'liability', addedMonthlyPayment: 6000, addedLiability: 72000, minRound: 4,
    description: 'Pinabili ng bagong appliances. ₱6,000/month sa 12 buwan.',
  },
  {
    id: 'g18', name: 'Pinautang ang Kaibigan (Negosyo)',
    type: 'cash', cashLoss: 50000, minRound: 6,
    description: 'Inutangan ng kaibigan para sa negosyo. Hindi nagbalik.',
  },
  {
    id: 'g19', name: 'Sagot sa Pag-aaral ng Kapatid (College)',
    type: 'expense', addedMonthlyExpense: 6000, permanent: true, minRound: 6,
    description: '+₱6,000/month para sa tuition at allowance ng kapatid.',
  },
  {
    id: 'g20', name: 'Bagyo — Hindi Narepair ang Bubong',
    type: 'cash', cashLoss: 55000, mitigatedByInsurance: true, insuranceCost: 12000, minRound: 6,
    description: 'Damage ng bagyo. ₱55,000 kung walang insurance. ₱12,000 kung insured.',
  },
  {
    id: 'g21', name: 'BIR Penalty — Late Filing',
    type: 'cash', cashLoss: 25000, minRound: 3,
    description: 'Nakalimutang mag-file ng ITR sa tamang oras. ₱25,000 penalty.',
  },
  {
    id: 'g22', name: 'Mall Sale Impulse Buying',
    type: 'cash', cashLoss: 35000, minRound: 6,
    description: '₱35,000 na gamit na hindi naman kailangan.',
  },
  {
    id: 'g23', name: 'Bagong Muwebles (Interior Design Frenzy)',
    type: 'cash', cashLoss: 65000, minRound: 10,
    description: 'Pinalamutian ng bahay. ₱65,000 sa muwebles at dekorasyon.',
  },
  {
    id: 'g24', name: 'Sakit ng Magulang (Walang PhilHealth)',
    type: 'cash', cashLoss: 120000, mitigatedByInsurance: true, insuranceCost: 40000, minRound: 10,
    description: 'Ospital ang magulang. ₱120,000 kung walang insurance. ₱40,000 kung insured.',
  },
  {
    id: 'g25', name: 'Legal Dispute sa Katabi (Property)',
    type: 'cash', cashLoss: 45000, minRound: 6,
    description: 'Kaso sa korte dahil sa property boundary. ₱45,000 legal fees.',
  },

  // ── New gastos cards g26–g35 ─────────────────────────────────────────────────
  {
    id: 'g26', name: 'Biniling Brand-New na Kotse (Na-Finance ng 5 Taon)',
    type: 'liability', addedMonthlyPayment: 18000, addedLiability: 864000, minRound: 6,
    lesson: 'Ang bagong kotse ay depreciating liability — hindi investment. Tingnan ang income statement.',
  },
  {
    id: 'g27', name: "Whole Life Insurance 'Para sa Investment'",
    type: 'expense', addedMonthlyExpense: 8500, permanent: true, minRound: 3,
    lesson: "Ang insurance na may 'savings component' ay mahal na insurance — hindi tunay na investment.",
  },
  {
    id: 'g28', name: 'Timeshare Resort Unit',
    type: 'cash', cashLoss: 90000, addedMonthlyExpense: 3000, permanent: true, minRound: 8,
    lesson: 'Ang timeshare ay may resale value na malapit sa zero. Ito ay prepaid vacation, hindi real estate.',
  },
  {
    id: 'g29', name: "Premium Credit Card Annual Fee 'Para sa Rewards'",
    type: 'cash', cashLoss: 5000, minRound: 1,
    lesson: 'Ang reward points ay may value lamang kung mas malaki kaysa sa annual fee at interes.',
  },
  {
    id: 'g30', name: 'Renovation ng Rented Apartment',
    type: 'cash', cashLoss: 45000, minRound: 4,
    lesson: 'Ang pagpapaganda ng bahay ng ibang tao ay hindi mo investment.',
  },
  {
    id: 'g31', name: 'MBA Degree — Kinuha ng Pautang',
    type: 'cash', cashLoss: 120000, minRound: 6,
    lesson: 'Ang edukasyon ay may ROI — pero ang utang para dito ay may tunay na cost na kailangang kalkulahin.',
  },
  {
    id: 'g32', name: "Nagbili ng Jewelry Bilang 'Investment'",
    type: 'cash', cashLoss: 60000, minRound: 5,
    lesson: 'Ang alahas ay may emotional value — pero ang resale ay halos laging mas mababa kaysa purchase price.',
  },
  {
    id: 'g33', name: "Nagbili ng Bagong Motorcycle 'Para sa Business'",
    type: 'liability', addedMonthlyPayment: 8000, addedLiability: 288000, minRound: 3,
    lesson: 'Kailangang mas malaki ang kita ng negosyo kaysa sa buwanang amortization ng sasakyan.',
  },
  {
    id: 'g34', name: "Lupa sa Lalawigan — 'Pangmatagalang Investment'",
    type: 'cash', cashLoss: 150000, addedMonthlyExpense: 1500, permanent: true, minRound: 8,
    lesson: 'Ang lupa na walang kita ay gastos sa tax at oportunidad. Hindi ito passive income.',
  },
  {
    id: 'g35', name: 'Japan Trip — YOLO Family Vacation (Business Class)',
    type: 'cash', cashLoss: 85000, minRound: 4,
    lesson: 'Ang karanasan ay may halaga — pero kailangan mong malaman kung saan nanggaling ang pera.',
  },
];

// ─── Life Event Cards (20 total) ─────────────────────────────────────────────
export const lifeEvents = [
  {
    id: 'le1',  name: 'Na-promote Ka!',
    type: 'salary_increase', amount: 8000,
    description: '+₱8,000/month sa sahod.',
  },
  {
    id: 'le2',  name: 'Nagsilang ang Anak',
    type: 'expense', addedMonthlyExpense: 8000, permanent: true,
    description: '+₱8,000/month gastusin. Permanente.',
  },
  {
    id: 'le3',  name: 'Nagretiro ang Magulang',
    type: 'expense', addedMonthlyExpense: 5000, permanent: true,
    description: '+₱5,000/month suporta. Permanente.',
  },
  {
    id: 'le4',  name: 'Mana — Namatay ang Tito',
    type: 'cash_gain', cashGain: 500000,
    description: '+₱500,000 sa cash.',
  },
  {
    id: 'le5',  name: 'Natanggal sa Trabaho',
    type: 'job_loss', rounds: 2,
    description: 'Walang sahod sa 2 rounds. Passive income lang.',
  },
  {
    id: 'le6',  name: 'Nagpalit ng Trabaho',
    type: 'salary_multiplier', multiplier: 1.2,
    description: '+20% sa sahod. Bagong kompanya.',
  },
  {
    id: 'le7',  name: 'Pumasok sa OFW (Nurse Only)',
    type: 'ofw_upgrade', condition: 'nurse',
    description: 'Nurse lang: 3x ang sahod. Asset risk mechanic nag-aapply.',
  },
  {
    id: 'le8',  name: 'Annulment / Legal Separation',
    type: 'combo', cashLoss: 200000, addedMonthlyExpense: 5000, permanent: true,
    description: '₱200K legal fees + ₱5K/month maintenance.',
  },
  {
    id: 'le9',  name: 'Nagbukas ng Side Hustle',
    type: 'passive_income', monthlyIncome: 5000,
    description: '+₱5,000/month passive income (freelance/consulting).',
  },
  {
    id: 'le10', name: 'Sakit — Nag-leave ng 3 Buwan',
    type: 'sick_leave', rounds: 3, salaryMultiplier: 0.5,
    description: 'Kalahati lang ng sahod sa 3 rounds.',
  },
  {
    id: 'le11', name: '13th Month + Performance Bonus',
    type: 'cash_gain', cashGain: 60000,
    description: 'Bonus season. +₱60,000 one-time na cash.',
  },
  {
    id: 'le12', name: 'Asawa Naghahanap ng Trabaho (Nakapasok!)',
    type: 'salary_increase', amount: 18000,
    description: 'Dual income na kayo. +₱18,000/month sa household income.',
  },
  {
    id: 'le13', name: 'Negosyo na Lumakas — Nadagdagan ang Kita',
    type: 'passive_income', monthlyIncome: 8000,
    description: 'Lumaking negosyo. +₱8,000/month passive income.',
  },
  {
    id: 'le14', name: 'Nagresign — Naghintay ng Maayos na Trabaho',
    type: 'job_loss', rounds: 1,
    description: 'Walang sahod sa 1 round. Passive income lang ang pumasok.',
  },
  {
    id: 'le15', name: 'Nagbenta ng Lumang Sasakyan',
    type: 'combo', cashGain: 180000, removedLiabilityPayment: 8000,
    description: '+₱180,000 sa cash. Car loan payment na naaalis sa gastusin.',
  },
  {
    id: 'le16', name: 'Scholarship ng Anak (Buong Tuition)',
    type: 'expense_reduction', reducedMonthlyExpense: 6000,
    description: '-₱6,000/month. Scholarship ang nagbabayad ng tuition.',
  },
  {
    id: 'le17', name: 'Lumipat sa Mas Mura at Mas Malapit sa Trabaho',
    type: 'expense_reduction', reducedMonthlyExpense: 4000,
    description: '-₱4,000/month sa rent at transportasyon.',
  },
  {
    id: 'le18', name: 'Nagkaroon ng Freelance Client (Abroad)',
    type: 'passive_income', monthlyIncome: 12000,
    description: '+₱12,000/month freelance income mula sa abroad.',
  },
  {
    id: 'le19', name: 'Namatay ang Negosyo (Sinara)',
    type: 'income_loss', removedMonthlyIncome: 5000,
    description: 'Isang passive income source ang nawala. -₱5,000/month.',
  },
  {
    id: 'le20', name: 'Nakita ang Bahay ng Lola (Mana)',
    type: 'cash_gain', cashGain: 300000,
    description: 'Bahay ng lola na nabenta. +₱300,000 mana.',
  },
];

// ─── Market Event Cards (15 total) ───────────────────────────────────────────
export const marketEvents = [
  {
    id: 'me1',  name: 'PSE Bull Run!',
    effect: 'all_stocks_value_up', magnitude: 0.15,
    description: 'Lahat ng stocks: +15% market value.',
  },
  {
    id: 'me2',  name: 'Real Estate Boom',
    effect: 'all_realestate_value_up', magnitude: 0.10,
    description: 'Lahat ng real estate: +10% value.',
  },
  {
    id: 'me3',  name: 'Bagyo at Baha (Walang Insurance)',
    effect: 'disaster_cash_loss', cashLoss: 50000, mitigatedByInsurance: true, insuranceCost: 10000,
    description: 'Uninsured: -₱50,000. Insured: -₱10,000.',
  },
  {
    id: 'me4',  name: 'BSP Interest Rate Hike',
    effect: 'all_loan_payments_up', magnitude: 0.10,
    description: 'Lahat ng loan payments: +10% ngayong round.',
  },
  {
    id: 'me5',  name: 'Bagong Tren Extension',
    effect: 'urban_realestate_value_up', magnitude: 0.20,
    description: 'Urban real estate: +20% value.',
  },
  {
    id: 'me6',  name: 'Peso Depreciation',
    effect: 'ofw_income_bonus', amount: 10000,
    description: 'OFW players: +₱10,000 sa sahod ngayong round.',
  },
  {
    id: 'me7',  name: 'POGO Ban',
    effect: 'condo_value_down', magnitude: 0.15,
    description: 'Condos: -15% value.',
  },
  {
    id: 'me8',  name: 'BIR Tax Amnesty',
    effect: 'waive_bir_penalty',
    description: 'Kung may pending BIR penalty: cancelled. Kung wala: discard.',
  },
  {
    id: 'me9',  name: 'Recession Quarter',
    effect: 'variable_income_at_risk',
    description: 'Variable income players: roll D6. 1-2 = kalahati ng normal na kita.',
  },
  {
    id: 'me10', name: 'OFW Remittance Boom',
    effect: 'provincial_realestate_up', magnitude: 0.05,
    description: 'Non-NCR real estate: +5% value.',
  },
  {
    id: 'me11', name: 'Tech IPO sa PSE (Hot Stock!)',
    effect: 'player_choice_stock_gain', magnitude: 0.25,
    description: 'Pumili ng isa mong stock: +25% value.',
  },
  {
    id: 'me12', name: 'Inflation Spike',
    effect: 'immediate_expense_increase', amount: 2000,
    description: 'LAHAT ng players: +₱2,000 sa monthly expenses ngayong round.',
  },
  {
    id: 'me13', name: 'Government Infrastructure Spending',
    effect: 'all_realestate_value_up', magnitude: 0.05,
    description: 'Lahat ng real estate: +5% value.',
  },
  {
    id: 'me14', name: 'OFW Bagong Patakaran (OWWA)',
    effect: 'ofw_cash_gain', amount: 30000,
    description: 'OFW players: +₱30,000 na OWWA benefit.',
  },
  {
    id: 'me15', name: 'Stock Market Crash',
    effect: 'all_stocks_value_down', magnitude: 0.20,
    description: 'Lahat ng stocks: -20% market value. Huwag mag-panic sell.',
  },
];

// ─── Network / Koneksyon Cards (15 total) ────────────────────────────────────
export const networkCards = [
  {
    id: 'nc1',  name: 'Accountant na Kaibigan',
    effect: 'skip_bir_penalty',
    description: 'Gamitin sa BIR Audit. I-skip ang lahat ng penalty.',
  },
  {
    id: 'nc2',  name: 'Broker na Kakilala',
    effect: 'first_look_big_deal',
    description: 'Sa susunod na Malaking Deal space: makakita ka rin at maaaring bumili.',
  },
  {
    id: 'nc3',  name: 'Kontratista',
    effect: 'rehab_cost_minus_20pct',
    description: 'Sa susunod na property deal: -20% sa cost.',
  },
  {
    id: 'nc4',  name: 'DOST-Accredited Appraiser',
    effect: 'brrrr_ltv_80pct',
    description: 'Sa susunod na BRRRR refinancing: 80% LTV instead of 70%.',
  },
  {
    id: 'nc5',  name: 'Banker na Kaibigan',
    effect: 'waive_one_loan_interest',
    description: 'I-waive ang interest payment ng isang loan ngayong round.',
  },
  {
    id: 'nc6',  name: 'Abogado (Lawyer)',
    effect: 'skip_title_delay',
    description: 'Sa susunod na property purchase: skip transfer penalty/delay.',
  },
  {
    id: 'nc7',  name: 'HR Recruiter',
    effect: 'salary_plus_5000',
    description: 'Gamitin kahit kailan: +₱5,000 sa monthly salary mo.',
  },
  {
    id: 'nc8',  name: 'Financial Advisor',
    effect: 'next_deal_analysis',
    description: 'Sa susunod na deal card: kitain ang full cashflow analysis bago mag-decide.',
  },
  {
    id: 'nc9',  name: 'Paluwagan Organizer',
    effect: 'paluwagan_start',
    description: 'Mag-imbita ng co-players sa paluwagan. Lahat magdeposit ng ₱10K/round, isang player ang manalo ng pot bawat round.',
  },
  {
    id: 'nc10', name: 'Insurance Agent',
    effect: 'free_first_month_insurance',
    description: 'Ma-activate ang insurance nang libre ngayong round.',
  },
  {
    id: 'nc11', name: 'Property Manager na Kaibigan',
    effect: 'skip_tenant_damage_roll',
    description: 'Gamitin bago ang Tenant Roll: i-skip ang tenant damage/vacancy result para sa isang property ngayong Sahod Day.',
  },
  {
    id: 'nc12', name: 'OFW Recruiter na Kakilala',
    effect: 'ofw_upgrade_chance',
    description: 'Kung Nars ka: maaari kang mag-upgrade sa OFW status ngayong round nang walang Life Event card.',
  },
  {
    id: 'nc13', name: 'Tax Consultant',
    effect: 'bir_refund_plus_5000',
    description: 'Sa susunod na BIR Audit: +₱5,000 sa normal na BIR refund kung 5–6 ang roll, o automatic 3–4 result (auto-pass) kung 1–2.',
  },
  {
    id: 'nc14', name: 'Real Estate Developer na Kakilala',
    effect: 'preselling_deal_discount_10pct',
    description: 'Sa susunod na pre-selling property deal: -10% sa downpayment.',
  },
  {
    id: 'nc15', name: 'Lender na Kaibigan (Emergency Loan)',
    effect: 'emergency_loan_no_credit_penalty',
    description: 'Humiram ng hanggang ₱50,000 nang walang credit score penalty. Bayaran sa 3 rounds.',
  },
];
