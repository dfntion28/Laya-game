// Card decks. Company and coin names are fictional. Peso values are game approximations.
// cf = net monthly cashflow after the mortgage/loan on the asset.

export const stocks = {
  SARI: { name: 'Sari Holdings',     emoji: '🏬', low: 5,  high: 40,  dps: 0,    note: 'Growth stock. No dividends, so you only win by selling higher.' },
  KAPE: { name: 'Kape Kultura',      emoji: '☕', low: 10, high: 80,  dps: 0,    note: 'Coffee chain stock. Swings hard both ways.' },
  PRT:  { name: 'Pinoy REIT',        emoji: '🏢', low: 20, high: 40,  dps: 0.16, note: 'REIT. Pays a dividend every month, around 6-7% a year.' },
  BYN:  { name: 'Bayanihan Telco',   emoji: '📡', low: 25, high: 60,  dps: 0.18, note: 'Boring blue chip with a steady dividend.' },
  BYC:  { name: 'BayaniCoin',        emoji: '🪙', low: 1,  high: 100, dps: 0,    note: 'Crypto. Pays nothing while you hold it. Pure speculation.' },
};

const stock = (id, symbol, price) => ({ id, kind: 'stock', symbol, price });

export const smallDeals = [
  stock('s1', 'SARI', 5), stock('s2', 'SARI', 10), stock('s3', 'SARI', 20), stock('s4', 'SARI', 30), stock('s5', 'SARI', 40),
  stock('s6', 'KAPE', 10), stock('s7', 'KAPE', 30), stock('s8', 'KAPE', 55), stock('s9', 'KAPE', 80),
  stock('s10', 'PRT', 20), stock('s11', 'PRT', 30), stock('s12', 'PRT', 40),
  stock('s13', 'BYN', 25), stock('s14', 'BYN', 45),
  stock('s15', 'BYC', 2), stock('s16', 'BYC', 40), stock('s17', 'BYC', 100),
  { id: 's18', kind: 'mp2', name: 'Pag-IBIG MP2 Savings', aral: 'Safe, but at 0.55% a month it will take forever to cover your bills.' },
  { id: 's19', kind: 'mp2', name: 'Pag-IBIG MP2 Savings', aral: 'Savings are a starting point. Assets are what get you out.' },
  { id: 's20', kind: 'realestate', sub: 'house', name: 'Foreclosed Bungalow, Bulacan', emoji: '🏠', cost: 900_000, down: 90_000, cf: 4_000, units: 1, aral: 'You make your money when you buy, not when you sell.' },
  { id: 's21', kind: 'realestate', sub: 'house', name: 'Townhouse, Cavite', emoji: '🏘️', cost: 2_200_000, down: 220_000, cf: 3_500, units: 1 },
  { id: 's22', kind: 'realestate', sub: 'condo', name: 'Studio Condo, Cubao', emoji: '🏙️', cost: 1_800_000, down: 180_000, cf: 1_500, units: 1, aral: 'Thin cashflow. Is it an asset or just something to post about?' },
  { id: 's23', kind: 'realestate', sub: 'condo', name: 'Bedspace Unit, U-Belt', emoji: '🛏️', cost: 650_000, down: 65_000, cf: 3_200, units: 1 },
  { id: 's24', kind: 'realestate', sub: 'condo', name: 'Pre-selling Condo, BGC', emoji: '🌆', cost: 6_000_000, down: 300_000, cf: -7_000, units: 1, aral: 'Negative cashflow means it takes money out of your pocket. That makes it a liability.' },
  { id: 's25', kind: 'realestate', sub: 'house', name: 'Duplex, Antipolo', emoji: '🏡', cost: 2_600_000, down: 260_000, cf: 7_000, units: 2 },
  { id: 's26', kind: 'realestate', sub: 'land', name: 'Farm Lot, Batangas', emoji: '🌾', cost: 350_000, down: 350_000, cf: 0, units: 1, aral: 'Land pays nothing today. You are betting on a buyer later.' },
  { id: 's27', kind: 'business', name: 'Sari-sari Store', emoji: '🏪', cost: 50_000, down: 50_000, cf: 3_000 },
  { id: 's28', kind: 'business', name: 'Vending Machines (3)', emoji: '🥤', cost: 60_000, down: 60_000, cf: 3_200 },
  { id: 's29', kind: 'business', name: 'Pisonet Shop (5 PCs)', emoji: '🖥️', cost: 80_000, down: 80_000, cf: 3_800 },
  { id: 's30', kind: 'business', name: 'Food Cart Franchise', emoji: '🌭', cost: 150_000, down: 150_000, cf: 6_500, aral: 'A franchise is a system. The system does the work, not you.' },
  { id: 's31', kind: 'business', name: 'Online Store', emoji: '📦', cost: 20_000, down: 20_000, cf: 1_200 },
  { id: 's32', kind: 'business', name: 'Water Refilling Station', emoji: '💧', cost: 250_000, down: 125_000, cf: 7_500 },
  { id: 's33', kind: 'business', name: 'Rice Store', emoji: '🍚', cost: 120_000, down: 120_000, cf: 4_800 },
  { id: 's34', kind: 'business', name: 'E-bike Rentals (4)', emoji: '🛵', cost: 100_000, down: 100_000, cf: 4_200 },
  { id: 's35', kind: 'business', name: 'Ukay-ukay Stall', emoji: '👕', cost: 40_000, down: 40_000, cf: 2_400 },
  { id: 's36', kind: 'business', name: 'Coin Laundry', emoji: '🧺', cost: 180_000, down: 90_000, cf: 5_200 },
];

export const bigDeals = [
  { id: 'b1', kind: 'realestate', sub: 'apartment', name: '4-Door Apartment, Marikina', emoji: '🏢', cost: 5_000_000, down: 500_000, cf: 16_000, units: 4, aral: 'Leverage: you put in 10% and collect 100% of the rent.' },
  { id: 'b2', kind: 'realestate', sub: 'apartment', name: '8-Door Apartment, Laguna', emoji: '🏢', cost: 8_000_000, down: 800_000, cf: 30_000, units: 8 },
  { id: 'b3', kind: 'realestate', sub: 'apartment', name: 'Dorm near UP Diliman', emoji: '🎒', cost: 9_000_000, down: 900_000, cf: 36_000, units: 10 },
  { id: 'b4', kind: 'realestate', sub: 'apartment', name: '6-Unit Townhouse Row, Bacolod', emoji: '🏘️', cost: 6_000_000, down: 600_000, cf: 21_000, units: 6 },
  { id: 'b5', kind: 'realestate', sub: 'house', name: 'Two Duplexes, Pampanga', emoji: '🏡', cost: 4_000_000, down: 400_000, cf: 13_000, units: 4 },
  { id: 'b6', kind: 'realestate', sub: 'commercial', name: '3-Storey Commercial Building, Davao', emoji: '🏬', cost: 9_000_000, down: 900_000, cf: 34_000, units: 1 },
  { id: 'b7', kind: 'realestate', sub: 'commercial', name: 'Warehouse, Valenzuela', emoji: '🏭', cost: 3_500_000, down: 350_000, cf: 12_000, units: 1 },
  { id: 'b8', kind: 'realestate', sub: 'land', name: 'Lot in Tagaytay', emoji: '⛰️', cost: 3_000_000, down: 450_000, cf: -6_000, units: 1, aral: 'Speculation. It only pays if a buyer shows up.' },
  { id: 'b9', kind: 'realestate', sub: 'condo', name: 'Two Pre-selling Condos, Makati', emoji: '🌆', cost: 9_000_000, down: 450_000, cf: -11_000, units: 2, aral: 'Looks like an investment. Costs you every month.' },
  { id: 'b10', kind: 'realestate', sub: 'apartment', name: 'Co-living Space, Makati', emoji: '🛋️', cost: 6_500_000, down: 650_000, cf: 19_000, units: 8 },
  { id: 'b11', kind: 'business', name: 'Car Wash Franchise', emoji: '🚿', cost: 900_000, down: 450_000, cf: 15_000 },
  { id: 'b12', kind: 'business', name: 'Gas Station, Province', emoji: '⛽', cost: 6_000_000, down: 900_000, cf: 32_000 },
  { id: 'b13', kind: 'business', name: 'Mini Grocery', emoji: '🛒', cost: 2_500_000, down: 600_000, cf: 20_000 },
  { id: 'b14', kind: 'business', name: 'Fishpond, Pangasinan', emoji: '🐟', cost: 1_500_000, down: 400_000, cf: 12_500 },
  { id: 'b15', kind: 'business', name: 'Small Beach Resort, La Union', emoji: '🏖️', cost: 7_000_000, down: 900_000, cf: 22_000 },
  { id: 'b16', kind: 'business', name: 'Coffee Shop Franchise', emoji: '☕', cost: 3_000_000, down: 700_000, cf: 9_000, aral: 'A famous brand is not the same as a good return. Do the math.' },
  { id: 'b17', kind: 'business', name: 'Solar Farm Share', emoji: '☀️', cost: 2_000_000, down: 500_000, cf: 14_000 },
  { id: 'b18', kind: 'business', name: 'Modern Jeepneys (2)', emoji: '🚐', cost: 5_000_000, down: 800_000, cf: 26_000 },
  { id: 'b19', kind: 'business', name: 'Rice Mill', emoji: '🌾', cost: 4_000_000, down: 700_000, cf: 21_000 },
  { id: 'b20', kind: 'business', name: 'Poultry Farm', emoji: '🐔', cost: 3_500_000, down: 600_000, cf: 18_000 },
  { id: 'b21', kind: 'business', name: 'Laundry Shops (3 branches)', emoji: '🧺', cost: 1_800_000, down: 500_000, cf: 15_500 },
  { id: 'b22', kind: 'realestate', sub: 'house', name: 'Rent-to-Own Houses (3), Iloilo', emoji: '🏠', cost: 4_500_000, down: 450_000, cf: 14_000, units: 3 },
];

// Expenses ("doodads"). `options` give a choice; otherwise `effects` apply directly.
// effect keys: cash, medical, installment {name,payment,months}, revolving {name,balance,rate},
// living, koneksyon, diskarte, perChild
// `fixable`: a government fine or paperwork bill, the only kind a fixer (lagay) can "make go away".
// `needs`: only drawn if the player has it ('business', 'realestate').
// `aral`: the lesson for this card. The coach line under it is worked out from your own numbers.
export const gastosCards = [
  { id: 'g1', name: 'New Phone', emoji: '📱', text: 'The new flagship just dropped. Your phone still works.',
    aral: '"0% interest" still costs ₱45,000. It just spreads the pain so it is easier to say yes.',
    options: [
      { key: 'cash', label: 'Pay ₱45,000 cash', effects: { cash: -45_000 } },
      { key: 'inst', label: '0% installment, ₱3,750 × 12', effects: { installment: { name: 'Phone Installment', payment: 3_750, months: 12 } } },
      { key: 'skip', label: 'Keep the old phone', effects: {} },
    ] },
  { id: 'g2', name: 'Barkada Trip to Boracay', emoji: '🏝️', text: 'Everyone is going. YOLO daw.',
    aral: 'Fun is part of life. The question is whether you pay for it with savings or with your future cashflow.',
    options: [
      { key: 'go', label: 'Go all in, ₱25,000', effects: { cash: -25_000 } },
      { key: 'budget', label: 'Join for one night, ₱8,000', effects: { cash: -8_000 } },
    ] },
  { id: 'g3', name: 'Birthday Party', emoji: '🎂', text: 'Lechon for the whole clan.', effects: { cash: -12_000, perChild: -5_000 },
    aral: 'Family costs grow with the family. Budget for celebrations before they arrive.' },
  { id: 'g4', name: 'Aircon Died', emoji: '🥵', text: 'In the middle of summer.', effects: { cash: -18_000 },
    aral: 'Things break. An emergency fund turns a crisis into an errand.' },
  { id: 'g5', name: 'Hometown Fiesta', emoji: '🎉', text: 'You are the hermano mayor this year.', effects: { cash: -15_000 },
    aral: 'Saying yes to every role in the community is generous, and expensive. Know your number before you agree.' },
  { id: 'g6', name: 'Gym Membership', emoji: '🏋️', text: '12-month lock-in. You will start on Monday.',
    aral: 'A lock-in contract is a liability with a smile. Read how long you are stuck before you sign.',
    options: [
      { key: 'lock', label: 'Sign the 12-month lock-in', effects: { installment: { name: 'Gym Lock-in', payment: 2_500, months: 12 } } },
      { key: 'free', label: 'Jog at the park instead', effects: {} },
    ] },
  { id: 'g7', name: 'Streaming Subscriptions', emoji: '📺', text: 'Netflix, Disney+, Spotify, one more... It renews every month.', effects: { living: 1_200 },
    aral: 'Subscriptions are designed to be forgotten. Small monthly bills raise the passive income you need to escape.' },
  { id: 'g8', name: 'Car Repair', emoji: '🔧', text: 'Transmission is gone.', effects: { cash: -22_000 },
    aral: 'A car is a liability: it takes money out every month and loses value every year.' },
  { id: 'g9', name: '11.11 Sale', emoji: '🛒', text: 'It was on sale, so technically you saved money.', effects: { cash: -14_000 },
    aral: 'You only save money on a sale if you were going to buy it anyway.' },
  { id: 'g10', name: 'Ninong at a Wedding', emoji: '💍', text: 'A well-connected businessman asked you to be a ninong.',
    aral: 'Relationships are an investment too. They pay off only if you use them well.',
    options: [
      { key: 'yes', label: 'Say yes, gift ₱15,000 (+1 contact card)', effects: { cash: -15_000, koneksyon: 1 } },
      { key: 'no', label: 'Politely decline', effects: {} },
    ] },
  { id: 'g11', name: 'Car Broke Down', emoji: '🚗', text: 'You still need to get to work.',
    aral: 'The monthly payment is not the price. Multiply it by the months, then decide.',
    options: [
      { key: 'new', label: 'Brand new car, ₱16,000 × 60', effects: { installment: { name: 'Car Loan', payment: 16_000, months: 60 } } },
      { key: 'used', label: 'Second-hand, ₱150,000 cash', effects: { cash: -150_000 } },
      { key: 'commute', label: 'Commute (+₱2,500/mo)', effects: { living: 2_500 } },
    ] },
  { id: 'g12', name: 'Dengue', emoji: '🦟', text: 'A week in the hospital.', effects: { medical: 45_000 },
    aral: 'Insurance is for the bill you cannot afford, not the one you expect.' },
  { id: 'g13', name: 'Lent Money to Pare', emoji: '🤷', text: '"Bayaran kita sa sweldo." He never did.', effects: { cash: -20_000 },
    aral: 'Only lend what you can afford to lose. Or write it down, with dates and interest, like a real loan.' },
  { id: 'g14', name: 'Laptop for Work', emoji: '💻', text: 'Your old one finally died.',
    aral: 'A work tool is still an expense. It earns only if it raises your income.',
    options: [
      { key: 'cash', label: 'Pay ₱50,000 cash', effects: { cash: -50_000 } },
      { key: 'inst', label: 'Installment, ₱4,800 × 12', effects: { installment: { name: 'Laptop Installment', payment: 4_800, months: 12 } } },
      { key: 'used', label: 'Refurbished, ₱22,000 cash', effects: { cash: -22_000 } },
    ] },
  { id: 'g15', name: 'Dentist', emoji: '🦷', text: 'Root canal and a crown.', effects: { medical: 15_000 },
    aral: 'Skipping check-ups saves a little now and costs a lot later.' },
  { id: 'g16', name: 'Vet Bills', emoji: '🐕', text: 'Bantay got sick.', effects: { cash: -9_000 },
    aral: 'Every dependent, even a dog, is a monthly cost. Plan for it.' },
  { id: 'g17', name: 'Traffic Violation', emoji: '🚨', text: 'Swerving, apparently. Your license is confiscated until you pay the fine at the office.', effects: { cash: -6_000 },
    fixable: true, aral: 'A fine is a fixed price. A shortcut adds risk on top of it.' },
  { id: 'g18', name: 'Kitchen Renovation', emoji: '🔨', text: 'Looks great. Earns nothing.',
    aral: 'Your house is not an asset if it only takes money out. Upgrades should wait until assets pay for them.',
    options: [
      { key: 'cash', label: 'Pay ₱60,000 cash', effects: { cash: -60_000 } },
      { key: 'inst', label: 'Home loan, ₱3,200 × 24', effects: { installment: { name: 'Renovation Loan', payment: 3_200, months: 24 } } },
      { key: 'later', label: 'Not this year', effects: {} },
    ] },
  { id: 'g19', name: 'Concert Tickets', emoji: '🎤', text: 'Your favorite band, one night only.', effects: { cash: -9_500 },
    aral: 'Spend on what you value most and cut hard on the rest. That is a budget, not a punishment.' },
  { id: 'g20', name: 'Credit Card Surprise', emoji: '💳', text: 'You did not notice the balance creeping up. 3% interest a month.', effects: { revolving: { name: 'Credit Card', balance: 40_000, rate: 0.03 } },
    aral: 'Paying only the interest keeps the debt forever. A credit card is a tool only if you pay it in full.' },
  { id: 'g21', name: 'Milk Tea Habit', emoji: '🧋', text: 'Every single day.', effects: { living: 900 },
    aral: 'A daily habit is a monthly bill. ₱30 a day is ₱10,800 a year.' },
  { id: 'g22', name: 'Lost Wallet', emoji: '👛', text: 'On the jeep home.', effects: { cash: -6_000 },
    aral: 'Bad luck is part of the plan. Cash on hand is what makes it small.' },
  { id: 'g23', name: 'New Sofa Set', emoji: '🛋️', text: 'For the guests. Still a doodad.',
    aral: 'A doodad is anything you buy that does not put money back in your pocket.',
    options: [
      { key: 'cash', label: 'Pay ₱35,000 cash', effects: { cash: -35_000 } },
      { key: 'inst', label: 'Installment, ₱3,500 × 12', effects: { installment: { name: 'Furniture Installment', payment: 3_500, months: 12 } } },
      { key: 'skip', label: 'The old sofa is fine', effects: {} },
    ] },
  { id: 'g24', name: 'Batch Reunion', emoji: '🥂', text: 'You ended up paying for the drinks.', effects: { cash: -10_000 },
    aral: 'Looking rich and being rich pull in opposite directions.' },
  { id: 'g25', name: 'Expired Car Registration', emoji: '🚓', text: 'Flagged at a checkpoint. Late fees, penalties and an impound bill.', effects: { cash: -14_000 },
    fixable: true, aral: 'Paperwork on time is the cheapest money you will ever save.' },
  { id: 'g26', name: 'No Building Permit', emoji: '🏗️', text: 'The extension at the back of your house was built without a permit. Fine and back fees.', effects: { cash: -25_000 },
    fixable: true, aral: 'Skipping the permit felt like saving money. It was a loan from the future with a penalty attached.' },
  { id: 'g27', name: 'Late Business Permit', emoji: '📝', text: 'You missed the January renewal for your business. Surcharges and interest.', effects: { cash: -18_000 },
    needs: 'business', fixable: true, aral: 'Running a business means compliance costs. Put renewal dates on the calendar.' },
  { id: 'g28', name: 'Property Tax Arrears', emoji: '🧾', text: 'Real property tax on your rentals was never paid. Penalties piled up.', effects: { cash: -20_000 },
    needs: 'realestate', fixable: true, aral: 'Owning property has holding costs. Count tax and repairs before counting rent as profit.' },
];

// Life events
// extra effect keys: child, salaryMult, salaryAdd, jobless, spouse, gamble {cost,need,win}, freeSkill, abroad, bonusMonths
export const lifeEvents = [
  { id: 'l1', name: 'New Baby', emoji: '👶', text: 'Congrats! A new member of the family.', effects: { child: 1 },
    aral: 'Children are not a financial decision, but they are a financial fact. Every kid raises your monthly bills.' },
  { id: 'l2', name: 'Another Baby', emoji: '🍼', text: 'One more on the way.', effects: { child: 1 },
    aral: 'Each child raises the passive income you need to escape. Plan the family budget before the budget plans you.' },
  { id: 'l3', name: 'Promoted', emoji: '🎖️', text: '12% raise. Your officemates expect a blowout.',
    aral: 'A raise grows your salary, not your freedom. It only helps if the extra goes into assets.',
    options: [
      { key: 'invest', label: 'Keep your lifestyle', effects: { salaryMult: 1.12 } },
      { key: 'upgrade', label: 'Upgrade your lifestyle (+₱6,000/mo)', effects: { salaryMult: 1.12, living: 6_000 } },
    ] },
  { id: 'l4', name: 'Performance Bonus', emoji: '🎁', text: 'Half a month of salary.', effects: { bonusMonths: 0.5 },
    aral: 'Bonuses are the easiest money to invest, because you never had time to get used to them.' },
  { id: 'l5', name: 'Inheritance from Lola', emoji: '👵', text: 'She left you her savings.', effects: { cash: 150_000 },
    aral: 'Spend a windfall and it is gone once. Invest it and it pays you every month.' },
  { id: 'l6', name: 'Hospitalized', emoji: '🏥', text: 'Emergency appendectomy.', effects: { medical: 120_000 },
    aral: 'One hospital stay can erase years of savings. That is the job of insurance.' },
  { id: 'l7', name: 'Getting Married', emoji: '💒', text: 'Your partner\'s income helps, but how big is the reception?',
    aral: 'One day of celebration should not cost three years of cashflow.',
    options: [
      { key: 'simple', label: 'Civil wedding, ₱30,000', effects: { cash: -30_000, spouse: true } },
      { key: 'grand', label: 'Big church wedding, ₱12,000 × 36', effects: { installment: { name: 'Wedding Loan', payment: 12_000, months: 36 }, spouse: true, diskarte: 1 } },
    ] },
  { id: 'l8', name: 'Parents Retired', emoji: '👴', text: 'They have no pension. You now send them ₱5,000 a month.', effects: { living: 5_000 },
    aral: 'Sandwich generation: supporting parents and kids at once. Your own retirement plan keeps your kids from the same fate.' },
  { id: 'l9', name: 'Cousin Needs Help', emoji: '🙏', text: 'Your cousin needs ₱30,000 for a hospital bill.',
    aral: 'Help is a gift, not a loan. Give what you can afford to never see again.',
    options: [
      { key: 'give', label: 'Give ₱30,000 (+1 Diskarte)', effects: { cash: -30_000, diskarte: 1 } },
      { key: 'part', label: 'Give ₱10,000', effects: { cash: -10_000 } },
      { key: 'no', label: 'Can\'t right now (−1 Diskarte)', effects: { diskarte: -1 } },
    ] },
  { id: 'l10', name: '"Double Your Money" Invite', emoji: '🤑', text: 'A friend swears it pays 30% a month, guaranteed. Put in ₱50,000?',
    aral: 'Guaranteed high returns are the signature of a scam. Real investments carry risk and say so.',
    options: [
      { key: 'in', label: 'Put in ₱50,000 (roll a 6 to get ₱150K)', effects: { gamble: { cost: 50_000, need: 6, win: 150_000 } } },
      { key: 'no', label: 'No thanks', effects: {} },
    ] },
  { id: 'l11', name: 'Job Offer Abroad', emoji: '✈️', text: 'Double the salary, but ₱15,000 more a month in costs and padala.',
    aral: 'Working abroad raises active income. You still escape only through passive income.',
    options: [
      { key: 'go', label: 'Take the job', effects: { abroad: true } },
      { key: 'stay', label: 'Stay home', effects: {} },
    ] },
  { id: 'l12', name: 'Weekend Consulting Gig', emoji: '🧑‍💼', text: '+₱6,000 a month. Still trading your time for it.', effects: { salaryAdd: 6_000 },
    aral: 'A side hustle is more active income. It becomes freedom only when it funds assets.' },
  { id: 'l13', name: 'Small Lotto Win', emoji: '🎰', text: 'Four numbers out of six.', effects: { cash: 20_000 },
    aral: 'Luck is not a plan. What you do with luck can be.' },
  { id: 'l14', name: 'Company Shut Down', emoji: '📉', text: 'No salary for 2 paydays.', effects: { jobless: 2 },
    aral: 'Your employer can stop paying you. Your assets do not need permission to keep paying.' },
  { id: 'l15', name: 'Free Money Seminar', emoji: '🎓', text: 'Pick one skill for free.', effects: { freeSkill: true },
    aral: 'Financial education compounds. Every skill makes every later deal better.' },
  { id: 'l16', name: 'Anniversary Trip', emoji: '🌅', text: 'You earned it.',
    aral: 'Rewarding yourself is healthy. Rewarding yourself on credit is not.',
    options: [
      { key: 'abroad', label: 'Bali, ₱20,000', effects: { cash: -20_000 } },
      { key: 'local', label: 'Staycation, ₱6,000', effects: { cash: -6_000 } },
    ] },
  { id: 'l17', name: 'Found a Mentor', emoji: '🧓', text: 'A real "rich dad" offers to show you the ropes.', effects: { koneksyon: 1, diskarte: 1 },
    aral: 'Learn from people who have what you want, not from people who just talk about it.' },
  { id: 'l18', name: 'Balikbayan Box', emoji: '📦', text: 'From Tita in Dubai. There\'s cash inside.', effects: { cash: 10_000 },
    aral: 'Gifts are nice. Do not build a budget around them.' },
  { id: 'l19', name: 'Union Raise', emoji: '📈', text: 'New CBA. Salary +6%.', effects: { salaryMult: 1.06 },
    aral: 'Raises usually trail inflation. Assets are how you stay ahead of rising prices.' },
  { id: 'l20', name: 'Annual Check-up', emoji: '🩻', text: 'Caught something early. Small bill now.', effects: { medical: 8_000 },
    aral: 'Prevention is the cheapest medicine.' },
];

// Market events
export const marketEvents = [
  { id: 'm1', name: 'House Buyer', emoji: '🏠', type: 'offer', subs: ['house'], mult: 1.5, text: 'An OFW family wants a house. They offer 150% of what you paid.', aral: 'A motivated buyer is worth waiting for. You make the profit when you buy cheap. You collect it when you sell.' },
  { id: 'm2', name: 'House Buyer', emoji: '🏠', type: 'offer', subs: ['house'], mult: 1.25, text: 'A local buyer offers 125% of what you paid.', aral: 'A small premium may not beat the rent you give up. Compare the cash you get with the cashflow you lose.' },
  { id: 'm3', name: 'Condo Buyer', emoji: '🏙️', type: 'offer', subs: ['condo'], mult: 1.3, text: 'A bulk buyer offers 130% for condo units.', aral: 'Condos sell in bulk only in hot markets. How fast you can sell is part of an asset\'s value.' },
  { id: 'm4', name: 'Apartment Buyer', emoji: '🏢', type: 'offer', subs: ['apartment'], mult: 1.4, text: 'A REIT is buying apartments at 140% of the price.', aral: 'Big buyers pay for income. Assets with strong cashflow attract the best offers.' },
  { id: 'm5', name: 'New Expressway', emoji: '🛣️', type: 'offer', subs: ['land'], mult: 2.5, text: 'The expressway will pass through. Land sells for 250%.', aral: 'Land pays when roads arrive. Speculation works only if you can wait without bleeding cash.' },
  { id: 'm6', name: 'Land Developer', emoji: '🏗️', type: 'offer', subs: ['land'], mult: 1.6, text: 'A subdivision developer offers 160% for land.', aral: 'Raw land is a bet on someone else\'s plans. This time, someone showed up.' },
  { id: 'm7', name: 'Logistics Company', emoji: '🏬', type: 'offer', subs: ['commercial'], mult: 1.35, text: 'Offers 135% for commercial property.', aral: 'Commercial buyers pay for location and long leases.' },
  { id: 'm8', name: 'Business Buyer', emoji: '🤝', type: 'offer', subs: ['business'], cfMult: 30, text: 'Will buy any business for 30 months of its cashflow.', aral: 'Businesses are priced by their cashflow. Grow the cashflow, grow the price.' },
  { id: 'm9', name: 'Big Corp Acquisition', emoji: '🧾', type: 'offer', subs: ['business'], cfMult: 45, text: 'A conglomerate pays 45 months of cashflow for a business.', aral: 'This is how owners get rich: build a cashflow, then sell it for many months of it at once.' },
  { id: 'm10', name: 'Bull Market', emoji: '🐂', type: 'cycle', cycle: 'bull', text: 'The economy heats up. Stock prices and buyer offers +20%.', aral: 'In a boom everything looks like a good investment. Prices are high, so buy carefully and sell gladly.' },
  { id: 'm11', name: 'Recession', emoji: '🐻', type: 'cycle', cycle: 'bear', text: 'Things slow down. Stock prices and buyer offers −20%.', aral: 'Recessions put assets on sale. Cash and steady income let you buy when others are forced to sell.' },
  { id: 'm12', name: 'Back to Normal', emoji: '⚖️', type: 'cycle', cycle: 'normal', text: 'The market settles down.', aral: 'Cycles end. Do not plan as if today\'s market lasts forever.' },
  { id: 'm13', name: 'SARI Stock Split', emoji: '✂️', type: 'split', symbol: 'SARI', ratio: 2, text: 'Everyone holding SARI gets double the shares at half the price.', aral: 'A split does not make you richer. Same company, more slices.' },
  { id: 'm14', name: 'BYC Reverse Split', emoji: '🪙', type: 'split', symbol: 'BYC', ratio: 0.5, text: 'BayaniCoin holders get half the coins at double the price.', aral: 'The price per coin changed. The value of your holding did not.' },
  { id: 'm15', name: 'Super Typhoon', emoji: '🌀', type: 'damage', perProperty: 15_000, text: 'Every property owner pays ₱15,000 per property in repairs. Insurance covers 80%.', aral: 'Property owners carry disaster risk. Insurance and a repair fund are part of the real cost.' },
  { id: 'm16', name: 'Inflation Spike', emoji: '🔥', type: 'inflation', amount: 1_500, text: 'Prices went up. Everyone\'s monthly expenses +₱1,500.', aral: 'Inflation raises your bills every year. Salaries lag. Rents and businesses can keep up.' },
  { id: 'm17', name: 'Tenant Skipped Out', emoji: '😤', type: 'tenant', cost: 15_000, text: 'If you own a rental, a tenant left owing rent and broke stuff. ₱15,000 to fix.', aral: 'Being a landlord is a business with bad days. Screen tenants and keep a repair fund.' },
  { id: 'm18', name: 'Rental Boom', emoji: '📈', type: 'rentup', pct: 0.1, text: 'Every apartment and house earns 10% more.', aral: 'Rents rise with demand. Good rentals protect you from inflation.' },
  { id: 'm19', name: 'Peso Drops', emoji: '💱', type: 'peso', text: 'OFW salaries +10%. Everyone else pays ₱500 more a month.', aral: 'A weak peso helps those earning dollars and raises prices for everyone else.' },
  { id: 'm20', name: 'Foreign Fund Buying', emoji: '🏘️', type: 'offer', subs: ['house', 'condo', 'apartment'], mult: 1.2, text: 'Offers 120% for any residential property.', aral: 'Foreign money chases property in good times. Sell into strong demand.' },
];

// Contact cards, kept in hand.
// use: 'anytime' (tap to use), 'deal' (apply when buying), 'expense' (cancel an expense)
export const networkCards = [
  { id: 'k1', name: 'Broker Kumpare', emoji: '🤝', use: 'deal', effect: 'down_minus_30', text: '30% off the down payment on one real estate deal.', aral: 'A good broker finds deals and negotiates. Their fee can be the cheapest part of the deal.' },
  { id: 'k2', name: 'Lawyer Ninong', emoji: '⚖️', use: 'expense', effect: 'cancel_expense', text: 'Cancel one expense card.', aral: 'A good lawyer is cheaper than a bad contract.' },
  { id: 'k3', name: 'HR Recruiter', emoji: '📋', use: 'anytime', effect: 'salary_up', text: 'Better job. Salary +10% for good.', aral: 'Your skills are worth what the market will pay. Sometimes you have to ask.' },
  { id: 'k4', name: 'Banker Friend', emoji: '🏦', use: 'anytime', effect: 'pay_debt_50k', text: 'Restructures a loan. ₱50,000 off your most expensive debt.', aral: 'Restructuring is a tool, not a rescue. Kill the most expensive debt first.' },
  { id: 'k5', name: 'Paluwagan Group', emoji: '🫶', use: 'anytime', effect: 'paluwagan', text: 'You get the first payout: ₱60,000 now, then ₱6,000 × 10. No interest.', aral: 'A paluwagan is a zero-interest loan if you get the first payout, and forced savings if you get the last.' },
  { id: 'k6', name: 'Diskarte Coach', emoji: '🧠', use: 'anytime', effect: 'diskarte_2', text: '+2 Diskarte, even past your max.', aral: 'Good habits are a skill. Practice turns into luck.' },
  { id: 'k7', name: 'Insurance Agent', emoji: '🛡️', use: 'anytime', effect: 'free_insurance', text: 'Free insurance for the next 6 paydays.', aral: 'An honest agent sells you what you need, not what pays them the biggest commission.' },
  { id: 'k8', name: 'Contractor', emoji: '👷', use: 'deal', effect: 'down_minus_30', text: '30% off the down payment on one real estate deal.', aral: 'A contractor who knows costs keeps you from overpaying for repairs.' },
  { id: 'k9', name: 'Business Partner', emoji: '🧑‍💼', use: 'deal', effect: 'biz_half', text: 'Covers half the down payment on one business.', aral: 'A partner halves the cost and halves the profit. Choose one who brings more than money.' },
  { id: 'k10', name: 'Accountant Ninang', emoji: '🧮', use: 'expense', effect: 'cancel_expense', text: 'Cancel one expense card.', aral: 'An accountant pays for themselves at tax time.' },
  { id: 'k11', name: 'Tita Abroad', emoji: '💌', use: 'anytime', effect: 'cash_40k', text: 'Sends ₱40,000.', aral: 'Family abroad helps. Turn the padala into an asset and it helps every month.' },
  { id: 'k12', name: 'Market Insider', emoji: '🔭', use: 'anytime', effect: 'reveal_stock', text: 'Shows you the usual price range of every stock, for good.', aral: 'Knowing a stock\'s normal range is the difference between investing and guessing.' },
];

export const skills = [
  { id: 'real_estate', name: 'Real Estate 101', emoji: '🏠', cost: 25_000, text: 'See 2 big deals and pick one.' },
  { id: 'stocks', name: 'Stock Basics', emoji: '📊', cost: 15_000, text: 'See each stock\'s usual price range.' },
  { id: 'negosyo', name: 'Business Bootcamp', emoji: '🏪', cost: 25_000, text: 'Businesses earn 20% more.' },
  { id: 'tax', name: 'Tax Planning', emoji: '🧾', cost: 20_000, text: 'Taxes and contributions −30%.' },
  { id: 'negotiation', name: 'Negotiation', emoji: '🗣️', cost: 20_000, text: '10% off every down payment.' },
  { id: 'frugal', name: 'Frugal Living', emoji: '🥬', cost: 10_000, text: 'Cut living expenses by 10% now.' },
  { id: 'networking', name: 'Networking', emoji: '🌐', cost: 15_000, text: 'Draw a contact card now. Hold one more.' },
  { id: 'mindset', name: 'Rich Dad Mindset', emoji: '🧠', cost: 10_000, text: '+1 max Diskarte, and +1 now.' },
  { id: 'property_mgmt', name: 'Property Management', emoji: '🔑', cost: 20_000, text: 'Tenant problems skip you. Typhoon damage halved.' },
  { id: 'digital', name: 'Online Course', emoji: '📘', cost: 30_000, text: 'Make an online course: +₱4,000/mo passive.' },
  { id: 'insurance', name: 'Insurance Know-how', emoji: '🛡️', cost: 10_000, text: 'Insurance costs half.' },
];

export const dreams = [
  { id: 'd1', name: 'House in Tagaytay', emoji: '🏡', cost: 12_000_000, text: 'Taal view, cool air, no commute.' },
  { id: 'd2', name: 'Scholarship Fund', emoji: '🎓', cost: 10_000_000, text: 'Send 100 kids from the province to college.' },
  { id: 'd3', name: 'Surf Resort in Siargao', emoji: '🏄', cost: 20_000_000, text: 'Your own place on the island.' },
  { id: 'd4', name: 'Year Around the World', emoji: '🌍', cost: 8_000_000, text: '30 countries with the whole family.' },
  { id: 'd5', name: 'Farm-to-Table Restaurant', emoji: '🍽️', cost: 14_000_000, text: 'You grow it, you cook it.' },
  { id: 'd6', name: 'Barangay Health Center', emoji: '🏥', cost: 9_000_000, text: 'Free check-ups for your hometown.' },
  { id: 'd7', name: 'Boat in Palawan', emoji: '⛵', cost: 16_000_000, text: 'Island hopping whenever you feel like it.' },
  { id: 'd8', name: 'Restore Lola\'s House', emoji: '🏛️', cost: 7_000_000, text: 'Bring the old family house back to life.' },
];

// Fast Track fixed deals keyed by space index on the fastTrack board.
export const ftDeals = {
  1:  { name: 'Tech Startup (Angel Round)', emoji: '🚀', kind: 'gamble', cost: 3_000_000, need: 6, win: 40_000_000 },
  2:  { name: 'Laundry Chain (20 branches)', emoji: '🧺', kind: 'deal', cost: 5_000_000, cf: 220_000 },
  5:  { name: 'BPO Office Building', emoji: '🏢', kind: 'deal', cost: 15_000_000, cf: 600_000 },
  7:  { name: 'Indie Film Production', emoji: '🎬', kind: 'gamble', cost: 5_000_000, need: 5, win: 20_000_000 },
  8:  { name: 'Resort in Palawan', emoji: '🏝️', kind: 'deal', cost: 12_000_000, cf: 450_000 },
  11: { name: 'Solar Power Plant', emoji: '🔆', kind: 'deal', cost: 20_000_000, cf: 800_000 },
  14: { name: 'Fast Food Franchises (5)', emoji: '🍔', kind: 'deal', cost: 8_000_000, cf: 330_000 },
  16: { name: 'Shipping Company', emoji: '🚢', kind: 'deal', cost: 25_000_000, cf: 1_000_000 },
  17: { name: 'Gold Mining Claim', emoji: '⛏️', kind: 'gamble', cost: 6_000_000, need: 4, win: 15_000_000 },
  19: { name: 'Hospital Wing', emoji: '🏥', kind: 'deal', cost: 18_000_000, cf: 700_000 },
  22: { name: 'Agri-Tech Plantation', emoji: '🌱', kind: 'deal', cost: 6_000_000, cf: 250_000 },
};

export const ftDisasters = {
  4:  { name: 'Lawsuit', emoji: '⚖️', pct: 0.5, text: 'Lawyers and a settlement eat half your cash.' },
  13: { name: 'BIR Audit', emoji: '🧾', pct: 0.3, text: 'Some filings were missing. You lose 30% of your cash.' },
  20: { name: 'Inheritance Fight', emoji: '💔', pct: 0.4, text: 'The family splits the estate. You lose 40% of your cash.' },
};

// Dream spaces on the Fast Track, in board order.
export const dreamSpaces = [3, 9, 15, 21, 23];
