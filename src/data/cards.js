// Card decks. Company and coin names are fictional. Peso values are game approximations.
// cf = net monthly cashflow after the mortgage/loan on the asset.

export const stocks = {
  SARI: { name: 'Sari Holdings',    emoji: '🏬', low: 5,  high: 40,  dps: 0,    note: 'Growth stock, walang dividend.' },
  KAPE: { name: 'Kape Kultura Inc.', emoji: '☕', low: 10, high: 80,  dps: 0,    note: 'Volatile na growth stock.' },
  PRT:  { name: 'Pinoy REIT',       emoji: '🏢', low: 20, high: 40,  dps: 0.16, note: 'REIT: buwanang dividend (~6-7%/taon).' },
  BYN:  { name: 'Bayanihan Telco',  emoji: '📡', low: 25, high: 60,  dps: 0.18, note: 'Blue chip na may dividend.' },
  BYC:  { name: 'BayaniCoin',       emoji: '🪙', low: 1,  high: 100, dps: 0,    note: 'Crypto. Sobrang volatile. Walang kita habang hawak.' },
};

const stock = (id, symbol, price) => ({ id, kind: 'stock', symbol, price });

export const smallDeals = [
  stock('s1', 'SARI', 5), stock('s2', 'SARI', 10), stock('s3', 'SARI', 20), stock('s4', 'SARI', 30), stock('s5', 'SARI', 40),
  stock('s6', 'KAPE', 10), stock('s7', 'KAPE', 30), stock('s8', 'KAPE', 55), stock('s9', 'KAPE', 80),
  stock('s10', 'PRT', 20), stock('s11', 'PRT', 30), stock('s12', 'PRT', 40),
  stock('s13', 'BYN', 25), stock('s14', 'BYN', 45),
  stock('s15', 'BYC', 2), stock('s16', 'BYC', 40), stock('s17', 'BYC', 100),
  { id: 's18', kind: 'mp2', name: 'Pag-IBIG MP2 Savings', aral: 'Ligtas pero mabagal. Mahirap makalaya sa 0.55%/buwan lang.' },
  { id: 's19', kind: 'mp2', name: 'Pag-IBIG MP2 Savings', aral: 'Ang ipon ay simula, hindi dulo.' },
  { id: 's20', kind: 'realestate', sub: 'house', name: 'Foreclosed Bungalow (Bulacan)', emoji: '🏠', cost: 900_000, down: 90_000, cf: 4_000, units: 1, aral: 'Bumili ng bargain. Ang kita ay nasa pagbili, hindi sa pagbenta.' },
  { id: 's21', kind: 'realestate', sub: 'house', name: 'Townhouse (Cavite)', emoji: '🏘️', cost: 2_200_000, down: 220_000, cf: 3_500, units: 1 },
  { id: 's22', kind: 'realestate', sub: 'condo', name: 'Studio Condo (Cubao)', emoji: '🏙️', cost: 1_800_000, down: 180_000, cf: 1_500, units: 1, aral: 'Maliit ang cashflow. Asset ba talaga ito o pang-yabang lang?' },
  { id: 's23', kind: 'realestate', sub: 'condo', name: 'Bedspace Unit (U-Belt, Manila)', emoji: '🛏️', cost: 650_000, down: 65_000, cf: 3_200, units: 1 },
  { id: 's24', kind: 'realestate', sub: 'condo', name: 'Pre-selling Condo (BGC)', emoji: '🌆', cost: 6_000_000, down: 300_000, cf: -7_000, units: 1, aral: 'Negative cashflow = liability. Kinukuha nito ang pera sa bulsa mo.' },
  { id: 's25', kind: 'realestate', sub: 'house', name: 'Duplex (Antipolo)', emoji: '🏡', cost: 2_600_000, down: 260_000, cf: 7_000, units: 2 },
  { id: 's26', kind: 'realestate', sub: 'land', name: 'Lote sa Probinsya (Batangas)', emoji: '🌾', cost: 350_000, down: 350_000, cf: 0, units: 1, aral: 'Lupa: walang cashflow ngayon. Taya ito sa capital gain.' },
  { id: 's27', kind: 'business', name: 'Sari-sari Store', emoji: '🏪', cost: 50_000, down: 50_000, cf: 3_000 },
  { id: 's28', kind: 'business', name: 'Vending Machines (3 units)', emoji: '🥤', cost: 60_000, down: 60_000, cf: 3_200 },
  { id: 's29', kind: 'business', name: 'Pisonet (5 PCs)', emoji: '🖥️', cost: 80_000, down: 80_000, cf: 3_800 },
  { id: 's30', kind: 'business', name: 'Food Cart Franchise', emoji: '🌭', cost: 150_000, down: 150_000, cf: 6_500, aral: 'Franchise = sistema. Ang sistema ang nagtatrabaho, hindi ikaw.' },
  { id: 's31', kind: 'business', name: 'Online Store (Dropshipping)', emoji: '📦', cost: 20_000, down: 20_000, cf: 1_200 },
  { id: 's32', kind: 'business', name: 'Water Refilling Station', emoji: '💧', cost: 250_000, down: 125_000, cf: 7_500 },
  { id: 's33', kind: 'business', name: 'Bigasan (Rice Retail)', emoji: '🍚', cost: 120_000, down: 120_000, cf: 4_800 },
  { id: 's34', kind: 'business', name: 'E-bike Rental (4 units)', emoji: '🛵', cost: 100_000, down: 100_000, cf: 4_200 },
  { id: 's35', kind: 'business', name: 'Ukay-ukay Stall', emoji: '👕', cost: 40_000, down: 40_000, cf: 2_400 },
  { id: 's36', kind: 'business', name: 'Coin Laundry (1 machine set)', emoji: '🧺', cost: 180_000, down: 90_000, cf: 5_200 },
];

export const bigDeals = [
  { id: 'b1', kind: 'realestate', sub: 'apartment', name: '4-Door Apartment (Marikina)', emoji: '🏢', cost: 5_000_000, down: 500_000, cf: 16_000, units: 4, aral: 'Leverage: 10% ng pera mo, 100% ng renta.' },
  { id: 'b2', kind: 'realestate', sub: 'apartment', name: '8-Door Apartment (Laguna)', emoji: '🏢', cost: 8_000_000, down: 800_000, cf: 30_000, units: 8 },
  { id: 'b3', kind: 'realestate', sub: 'apartment', name: 'Dormitory (malapit sa UP Diliman)', emoji: '🎒', cost: 9_000_000, down: 900_000, cf: 36_000, units: 10 },
  { id: 'b4', kind: 'realestate', sub: 'apartment', name: '6-Unit Townhouse Row (Bacolod)', emoji: '🏘️', cost: 6_000_000, down: 600_000, cf: 21_000, units: 6 },
  { id: 'b5', kind: 'realestate', sub: 'house', name: 'Duplex Pair (Pampanga)', emoji: '🏡', cost: 4_000_000, down: 400_000, cf: 13_000, units: 4 },
  { id: 'b6', kind: 'realestate', sub: 'commercial', name: '3F Commercial Building (Davao)', emoji: '🏬', cost: 9_000_000, down: 900_000, cf: 34_000, units: 1 },
  { id: 'b7', kind: 'realestate', sub: 'commercial', name: 'Bodega (Valenzuela)', emoji: '🏭', cost: 3_500_000, down: 350_000, cf: 12_000, units: 1 },
  { id: 'b8', kind: 'realestate', sub: 'land', name: 'Lote sa Tagaytay', emoji: '⛰️', cost: 3_000_000, down: 450_000, cf: -6_000, units: 1, aral: 'Speculation. Mananalo ka lang kung may buyer na darating.' },
  { id: 'b9', kind: 'realestate', sub: 'condo', name: '2 Pre-selling Condos (Makati)', emoji: '🌆', cost: 9_000_000, down: 450_000, cf: -11_000, units: 2, aral: 'Mukhang investment, pero buwan-buwan kang nagbabayad.' },
  { id: 'b10', kind: 'realestate', sub: 'apartment', name: 'Co-living Space (Makati)', emoji: '🛋️', cost: 6_500_000, down: 650_000, cf: 19_000, units: 8 },
  { id: 'b11', kind: 'business', name: 'Car Wash Franchise', emoji: '🚿', cost: 900_000, down: 450_000, cf: 15_000 },
  { id: 'b12', kind: 'business', name: 'Gasolinahan (Province)', emoji: '⛽', cost: 6_000_000, down: 900_000, cf: 32_000 },
  { id: 'b13', kind: 'business', name: 'Mini Grocery', emoji: '🛒', cost: 2_500_000, down: 600_000, cf: 20_000 },
  { id: 'b14', kind: 'business', name: 'Palaisdaan (Fishpond, Pangasinan)', emoji: '🐟', cost: 1_500_000, down: 400_000, cf: 12_500 },
  { id: 'b15', kind: 'business', name: 'Small Beach Resort (La Union)', emoji: '🏖️', cost: 7_000_000, down: 900_000, cf: 22_000 },
  { id: 'b16', kind: 'business', name: 'Coffee Shop Franchise', emoji: '☕', cost: 3_000_000, down: 700_000, cf: 9_000, aral: 'Sikat na brand ≠ magandang return. Kwentahin ang cash-on-cash.' },
  { id: 'b17', kind: 'business', name: 'Solar Farm Share', emoji: '☀️', cost: 2_000_000, down: 500_000, cf: 14_000 },
  { id: 'b18', kind: 'business', name: 'Modern Jeepney Fleet (2 units)', emoji: '🚐', cost: 5_000_000, down: 800_000, cf: 26_000 },
  { id: 'b19', kind: 'business', name: 'Rice Mill', emoji: '🌾', cost: 4_000_000, down: 700_000, cf: 21_000 },
  { id: 'b20', kind: 'business', name: 'Poultry Farm', emoji: '🐔', cost: 3_500_000, down: 600_000, cf: 18_000 },
  { id: 'b21', kind: 'business', name: 'Laundry Shop Chain (3 branches)', emoji: '🧺', cost: 1_800_000, down: 500_000, cf: 15_500 },
  { id: 'b22', kind: 'realestate', sub: 'house', name: 'Rent-to-Own Houses (3, Iloilo)', emoji: '🏠', cost: 4_500_000, down: 450_000, cf: 14_000, units: 3 },
];

// Gastos (doodads). `options` give a choice; otherwise `effects` apply directly.
// effect keys: cash, medical, installment {name,payment,months}, revolving {name,balance,rate},
// living, koneksyon, diskarte, perChild
export const gastosCards = [
  { id: 'g1', name: 'Bagong Cellphone', emoji: '📱', text: 'Lumabas ang bagong flagship. Gusto mo talaga.',
    options: [
      { key: 'cash', label: 'Bayad cash ₱45,000', effects: { cash: -45_000 } },
      { key: 'inst', label: '0% installment ₱3,750 × 12', effects: { installment: { name: 'Phone Installment', payment: 3_750, months: 12 } } },
    ] },
  { id: 'g2', name: 'Barkada Trip sa Boracay', emoji: '🏝️', text: 'YOLO daw sabi nila.', effects: { cash: -25_000 } },
  { id: 'g3', name: 'Birthday Party', emoji: '🎂', text: 'Handaan para sa buong angkan.', effects: { cash: -12_000, perChild: -5_000 } },
  { id: 'g4', name: 'Sirang Aircon', emoji: '🥵', text: 'Tag-init pa naman.', effects: { cash: -18_000 } },
  { id: 'g5', name: 'Pa-Fiesta sa Probinsya', emoji: '🎉', text: 'Ikaw daw ang hermano mayor ngayong taon.', effects: { cash: -15_000 } },
  { id: 'g6', name: 'Gym Membership', emoji: '🏋️', text: 'Lock-in na 12 buwan. "Magsisimula na ako sa Lunes."', effects: { installment: { name: 'Gym Lock-in', payment: 2_500, months: 12 } } },
  { id: 'g7', name: 'Streaming Subscriptions', emoji: '📺', text: 'Isa pa, isa pa... permanenteng dagdag sa gastos.', effects: { living: 1_200 } },
  { id: 'g8', name: 'Car / Motor Repair', emoji: '🔧', text: 'Nasira ang transmission.', effects: { cash: -22_000 } },
  { id: 'g9', name: '11.11 Online Sale', emoji: '🛒', text: '"Sale naman eh." Add to cart lahat.', effects: { cash: -14_000 } },
  { id: 'g10', name: 'Ninong/Ninang sa Kasal', emoji: '💍', text: 'Kinuha kang ninong/ninang ng isang kilalang negosyante.',
    options: [
      { key: 'yes', label: 'Oo! Regalo ₱15,000 (+ Koneksyon card)', effects: { cash: -15_000, koneksyon: 1 } },
      { key: 'no', label: 'Tumanggi nang magalang', effects: {} },
    ] },
  { id: 'g11', name: 'Nasira ang Sasakyan', emoji: '🚗', text: 'Kailangan mo ng transportasyon papuntang trabaho.',
    options: [
      { key: 'new', label: 'Bagong kotse: ₱16,000 × 60', effects: { installment: { name: 'Car Loan (Bago)', payment: 16_000, months: 60 } } },
      { key: 'used', label: 'Second-hand ₱150,000 cash', effects: { cash: -150_000 } },
      { key: 'commute', label: 'Mag-commute (+₱2,500/buwan)', effects: { living: 2_500 } },
    ] },
  { id: 'g12', name: 'Dengue', emoji: '🦟', text: 'Na-confine ng isang linggo.', effects: { medical: 45_000 } },
  { id: 'g13', name: 'Pinahiram si Pare', emoji: '🤷', text: '"Babayaran kita sa sweldo." Hindi na bumalik.', effects: { cash: -20_000 } },
  { id: 'g14', name: 'Laptop para sa Trabaho', emoji: '💻', text: 'Bumigay na ang luma mong laptop.',
    options: [
      { key: 'cash', label: 'Bayad cash ₱50,000', effects: { cash: -50_000 } },
      { key: 'inst', label: 'Installment ₱4,800 × 12', effects: { installment: { name: 'Laptop Installment', payment: 4_800, months: 12 } } },
    ] },
  { id: 'g15', name: 'Dentista', emoji: '🦷', text: 'Root canal at crown.', effects: { medical: 15_000 } },
  { id: 'g16', name: 'Vet Bills', emoji: '🐕', text: 'Nagkasakit si Bantay.', effects: { cash: -9_000 } },
  { id: 'g17', name: 'Huli ng MMDA', emoji: '🚨', text: 'Swerving daw.', effects: { cash: -5_000 } },
  { id: 'g18', name: 'Renovation ng Bahay', emoji: '🔨', text: 'Bagong kitchen. Walang dagdag na kita.',
    options: [
      { key: 'cash', label: 'Bayad cash ₱60,000', effects: { cash: -60_000 } },
      { key: 'inst', label: 'Home loan ₱3,200 × 24', effects: { installment: { name: 'Renovation Loan', payment: 3_200, months: 24 } } },
    ] },
  { id: 'g19', name: 'Concert Tickets', emoji: '🎤', text: 'Paborito mong banda, isang gabi lang.', effects: { cash: -9_500 } },
  { id: 'g20', name: 'Credit Card Swipe', emoji: '💳', text: 'Hindi mo namalayan ang balance. 3.5%/buwan ang interest.', effects: { revolving: { name: 'Credit Card', balance: 40_000, rate: 0.035 } } },
  { id: 'g21', name: 'Milk Tea Habit', emoji: '🧋', text: 'Araw-araw. Permanenteng dagdag sa gastos.', effects: { living: 900 } },
  { id: 'g22', name: 'Nawala ang Wallet', emoji: '👛', text: 'Sa jeep, pauwi.', effects: { cash: -6_000 } },
  { id: 'g23', name: 'Bagong Sofa Set', emoji: '🛋️', text: 'Para sa bisita. Doodad pa rin.',
    options: [
      { key: 'cash', label: 'Bayad cash ₱35,000', effects: { cash: -35_000 } },
      { key: 'inst', label: 'Installment ₱3,500 × 12', effects: { installment: { name: 'Furniture Installment', payment: 3_500, months: 12 } } },
    ] },
  { id: 'g24', name: 'Reunion ng Batch', emoji: '🥂', text: 'Ikaw ang sumagot sa inuman.', effects: { cash: -10_000 } },
];

// Buhay (life events)
// extra effect keys: child, salaryMult, salaryAdd, jobless, spouse, gamble {cost,need,win}, freeSkill, abroad, bonusMonths
export const lifeEvents = [
  { id: 'l1', name: 'May Bagong Baby!', emoji: '👶', text: 'Congrats! +₱6,000/buwan na gastos bawat anak.', effects: { child: 1 } },
  { id: 'l2', name: 'May Bagong Baby!', emoji: '👶', text: 'Congrats! +₱6,000/buwan na gastos bawat anak.', effects: { child: 1 } },
  { id: 'l3', name: 'Promoted Ka!', emoji: '🎖️', text: 'Sahod +12%. Huwag dagdagan ang lifestyle!', effects: { salaryMult: 1.12 } },
  { id: 'l4', name: 'Performance Bonus', emoji: '🎁', text: 'Kalahating buwang sahod bilang bonus.', effects: { bonusMonths: 0.5 } },
  { id: 'l5', name: 'Mana mula kay Lola', emoji: '👵', text: 'Iniwan sa iyo ang ipon niya.', effects: { cash: 150_000 } },
  { id: 'l6', name: 'Naospital', emoji: '🏥', text: 'Appendicitis. Emergency surgery.', effects: { medical: 120_000 } },
  { id: 'l7', name: 'Kasal!', emoji: '💒', text: 'Ikakasal ka na! Pero paano ang handaan?',
    options: [
      { key: 'simple', label: 'Civil wedding ₱30,000', effects: { cash: -30_000, spouse: true } },
      { key: 'grand', label: 'Bonggang kasal ₱12,000 × 36', effects: { installment: { name: 'Wedding Loan', payment: 12_000, months: 36 }, spouse: true, diskarte: 1 } },
    ] },
  { id: 'l8', name: 'Nagretiro si Nanay at Tatay', emoji: '👴', text: 'Sandwich generation: +₱5,000/buwan na suporta.', effects: { living: 5_000 } },
  { id: 'l9', name: 'Kamag-anak Humihingi ng Tulong', emoji: '🙏', text: 'Kailangan ng pinsan mo ng ₱30,000 pang-ospital.',
    options: [
      { key: 'give', label: 'Tulungan (₱30,000, +1 Diskarte)', effects: { cash: -30_000, diskarte: 1 } },
      { key: 'no', label: 'Hindi kaya ngayon (−1 Diskarte)', effects: { diskarte: -1 } },
    ] },
  { id: 'l10', name: '"Double Your Money!" Invite', emoji: '🤑', text: 'Kaibigan mo: 30%/buwan guaranteed! Mag-invest ng ₱50,000?',
    aral: 'Kapag sobrang ganda para maging totoo, malamang scam.',
    options: [
      { key: 'in', label: 'Sige, invest ₱50,000 (roll 6 = ₱150K)', effects: { gamble: { cost: 50_000, need: 6, win: 150_000 } } },
      { key: 'no', label: 'Hindi, salamat', effects: {} },
    ] },
  { id: 'l11', name: 'Job Offer Abroad', emoji: '✈️', text: 'Sahod ×2, pero +₱15,000/buwan sa gastos at padala.',
    options: [
      { key: 'go', label: 'Tanggapin ang offer', effects: { abroad: true } },
      { key: 'stay', label: 'Manatili sa Pilipinas', effects: {} },
    ] },
  { id: 'l12', name: 'Side Gig: Weekend Consulting', emoji: '🧑‍💼', text: '+₱6,000/buwan na active income. Oras mo pa rin ang kapalit.', effects: { salaryAdd: 6_000 } },
  { id: 'l13', name: 'Tumama sa Lotto (4 numbers)', emoji: '🎰', text: 'Maliit na panalo.', effects: { cash: 20_000 } },
  { id: 'l14', name: 'Nawalan ng Trabaho', emoji: '📉', text: 'Nagsara ang kompanya. Walang sahod sa 2 Sahod.', effects: { jobless: 2 } },
  { id: 'l15', name: 'Libreng Financial Seminar', emoji: '🎓', text: 'Pumili ng libreng skill.', effects: { freeSkill: true } },
  { id: 'l16', name: 'Anniversary Trip', emoji: '🌅', text: 'Deserve mo naman.', effects: { cash: -20_000 } },
  { id: 'l17', name: 'Nakilala ang Mentor', emoji: '🧓', text: 'Isang "Rich Dad" ang nag-alok na turuan ka.', effects: { koneksyon: 1, diskarte: 1 } },
  { id: 'l18', name: 'Balikbayan Box', emoji: '📦', text: 'Padala ni Tita mula Dubai. May kasamang pera!', effects: { cash: 10_000 } },
  { id: 'l19', name: 'Salary Increase (CBA)', emoji: '📈', text: 'Sahod +6% dahil sa bagong CBA.', effects: { salaryMult: 1.06 } },
  { id: 'l20', name: 'Annual Check-up', emoji: '🩻', text: 'Maagang natuklasan. Maliit na gastos ngayon.', effects: { medical: 8_000 } },
];

// Merkado (market events)
export const marketEvents = [
  { id: 'm1', name: 'Buyer: Bahay', emoji: '🏠', type: 'offer', subs: ['house'], mult: 1.5, text: 'May OFW na naghahanap ng bahay. Offer: 150% ng presyo.' },
  { id: 'm2', name: 'Buyer: Bahay', emoji: '🏠', type: 'offer', subs: ['house'], mult: 1.25, text: 'Lokal na buyer. Offer: 125% ng presyo.' },
  { id: 'm3', name: 'Developer: Condo', emoji: '🏙️', type: 'offer', subs: ['condo'], mult: 1.3, text: 'Bulk buyer ng condo units. Offer: 130% ng presyo.' },
  { id: 'm4', name: 'Investor: Apartment', emoji: '🏢', type: 'offer', subs: ['apartment'], mult: 1.4, text: 'REIT na naghahanap ng apartments. Offer: 140% ng presyo.' },
  { id: 'm5', name: 'Bagong Expressway!', emoji: '🛣️', type: 'offer', subs: ['land'], mult: 2.5, text: 'Dadaan ang expressway. Lupa: 250% ng presyo!' },
  { id: 'm6', name: 'Land Developer', emoji: '🏗️', type: 'offer', subs: ['land'], mult: 1.6, text: 'Subdivision developer. Lupa: 160% ng presyo.' },
  { id: 'm7', name: 'Corporate Buyer', emoji: '🏬', type: 'offer', subs: ['commercial'], mult: 1.35, text: 'Logistics company. Commercial: 135% ng presyo.' },
  { id: 'm8', name: 'Business Buyer', emoji: '🤝', type: 'offer', subs: ['business'], cfMult: 30, text: 'Bibilhin ang negosyo mo sa 30× ng buwanang cashflow nito.' },
  { id: 'm9', name: 'Franchise Acquirer', emoji: '🧾', type: 'offer', subs: ['business'], cfMult: 45, text: 'Malaking kompanya: 45× ng buwanang cashflow!' },
  { id: 'm10', name: 'Bull Market!', emoji: '🐂', type: 'cycle', cycle: 'bull', text: 'Umiinit ang ekonomiya. Mas mataas ang presyo ng stocks at offers (+20%).' },
  { id: 'm11', name: 'Recession', emoji: '🐻', type: 'cycle', cycle: 'bear', text: 'Bumagal ang ekonomiya. Mas mura ang stocks at mas mababa ang offers (−20%).' },
  { id: 'm12', name: 'Steady Economy', emoji: '⚖️', type: 'cycle', cycle: 'normal', text: 'Bumalik sa normal ang merkado.' },
  { id: 'm13', name: 'SARI Stock Split 2:1', emoji: '✂️', type: 'split', symbol: 'SARI', ratio: 2, text: 'Doble ang shares ng lahat ng may SARI. Kalahati ang presyo.' },
  { id: 'm14', name: 'BYC Reverse Split 1:2', emoji: '🪙', type: 'split', symbol: 'BYC', ratio: 0.5, text: 'Kalahati ang BayaniCoin ng lahat. Doble ang presyo.' },
  { id: 'm15', name: 'Super Typhoon', emoji: '🌀', type: 'damage', perProperty: 15_000, text: 'Lahat ng may real estate: ₱15,000 repair bawat property (insurance: −80%).' },
  { id: 'm16', name: 'Inflation Spike', emoji: '🔥', type: 'inflation', amount: 1_500, text: 'Tumaas ang presyo ng bilihin. Lahat: +₱1,500/buwan sa gastos.' },
  { id: 'm17', name: 'Tenant Problem', emoji: '😤', type: 'tenant', cost: 15_000, text: 'Kung may paupahan ka: tumakas ang tenant at sinira ang unit. ₱15,000 repair.' },
  { id: 'm18', name: 'Rental Demand Boom', emoji: '📈', type: 'rentup', pct: 0.1, text: 'Lahat ng apartments at houses: +10% cashflow.' },
  { id: 'm19', name: 'Peso Depreciation', emoji: '💱', type: 'peso', text: 'OFW at seaman: +10% sahod. Lahat: +₱500/buwan sa gastos.' },
  { id: 'm20', name: 'Buyer: Lahat ng Real Estate', emoji: '🏘️', type: 'offer', subs: ['house', 'condo', 'apartment'], mult: 1.2, text: 'Foreign fund: 120% para sa kahit anong residential property.' },
];

// Koneksyon (network cards, kept in hand)
// use: 'anytime' (tap to use), 'deal' (apply when buying), 'expense' (cancel a Gastos)
export const networkCards = [
  { id: 'k1', name: 'Broker na Kumpare', emoji: '🤝', use: 'deal', effect: 'down_minus_30', text: '−30% sa down payment ng isang real estate deal.' },
  { id: 'k2', name: 'Ninong na Abogado', emoji: '⚖️', use: 'expense', effect: 'cancel_expense', text: 'I-cancel ang isang Gastos card.' },
  { id: 'k3', name: 'HR Recruiter', emoji: '📋', use: 'anytime', effect: 'salary_up', text: 'Bagong trabaho: +10% sahod (permanente).' },
  { id: 'k4', name: 'Kaibigang Bangkero', emoji: '🏦', use: 'anytime', effect: 'pay_debt_50k', text: 'Loan restructuring: −₱50,000 sa isang utang.' },
  { id: 'k5', name: 'Paluwagan Organizer', emoji: '🫶', use: 'anytime', effect: 'paluwagan', text: 'Unang turno ka sa paluwagan: +₱60,000 ngayon, ₱6,000 × 10 na hulog. Walang interest!' },
  { id: 'k6', name: 'Coach sa Diskarte', emoji: '🧠', use: 'anytime', effect: 'diskarte_2', text: '+2 Diskarte (lampas man sa max).' },
  { id: 'k7', name: 'Insurance Agent', emoji: '🛡️', use: 'anytime', effect: 'free_insurance', text: 'Libreng insurance sa susunod na 6 Sahod.' },
  { id: 'k8', name: 'Kontratista', emoji: '👷', use: 'deal', effect: 'down_minus_30', text: '−30% sa down payment ng isang real estate deal.' },
  { id: 'k9', name: 'Business Partner', emoji: '🧑‍💼', use: 'deal', effect: 'biz_half', text: 'Kalahati ng down payment ng isang negosyo — partner ang sasagot.' },
  { id: 'k10', name: 'Ninang na Accountant', emoji: '🧮', use: 'expense', effect: 'cancel_expense', text: 'I-cancel ang isang Gastos card.' },
  { id: 'k11', name: 'Tita sa Abroad', emoji: '💌', use: 'anytime', effect: 'cash_40k', text: 'Padala: +₱40,000 cash.' },
  { id: 'k12', name: 'Market Insider', emoji: '🔭', use: 'anytime', effect: 'reveal_stock', text: 'Ipakita ang tipikal na price range ng lahat ng stocks (permanente).' },
];

export const skills = [
  { id: 'real_estate', name: 'Real Estate 101', emoji: '🏠', cost: 25_000, text: 'Sa Malaking Deal: pumili mula sa 2 cards.' },
  { id: 'stocks', name: 'Stock Market Basics', emoji: '📊', cost: 15_000, text: 'Makita ang tipikal na price range ng bawat stock.' },
  { id: 'negosyo', name: 'Negosyo Bootcamp', emoji: '🏪', cost: 25_000, text: 'Lahat ng negosyo: +20% cashflow.' },
  { id: 'tax', name: 'Tax Planning', emoji: '🧾', cost: 20_000, text: 'Tax at kontribusyon −30%.' },
  { id: 'negotiation', name: 'Negotiation', emoji: '🗣️', cost: 20_000, text: 'Lahat ng deal: −10% sa down payment.' },
  { id: 'frugal', name: 'Frugal Living', emoji: '🥬', cost: 10_000, text: 'Living expenses −10% (ngayon).' },
  { id: 'networking', name: 'Networking', emoji: '🌐', cost: 15_000, text: 'Kumuha ng 1 Koneksyon card ngayon. Hand limit +1.' },
  { id: 'mindset', name: 'Rich Dad Mindset', emoji: '🧠', cost: 10_000, text: 'Max Diskarte +1 at kumuha ng +1 ngayon.' },
  { id: 'property_mgmt', name: 'Property Management', emoji: '🔑', cost: 20_000, text: 'Immune sa Tenant Problem at kalahati ng typhoon damage.' },
  { id: 'digital', name: 'Digital Product', emoji: '📘', cost: 30_000, text: 'Gumawa ng e-course: +₱4,000/buwan passive income.' },
  { id: 'insurance', name: 'Insurance Literacy', emoji: '🛡️', cost: 10_000, text: 'Kalahati ang presyo ng insurance.' },
];

export const dreams = [
  { id: 'd1', name: 'Bahay sa Tagaytay', emoji: '🏡', cost: 12_000_000, text: 'Tanaw ang Taal, malamig ang hangin.' },
  { id: 'd2', name: 'Scholarship Foundation', emoji: '🎓', cost: 10_000_000, text: 'Pag-aralin ang 100 batang probinsyano.' },
  { id: 'd3', name: 'Resort sa Siargao', emoji: '🏄', cost: 20_000_000, text: 'Surf, araw, at sariling negosyo sa isla.' },
  { id: 'd4', name: 'Libot-Mundo', emoji: '🌍', cost: 8_000_000, text: 'Isang taon, 30 bansa, kasama ang pamilya.' },
  { id: 'd5', name: 'Farm-to-Table Restaurant', emoji: '🍽️', cost: 14_000_000, text: 'Sariling ani, sariling luto.' },
  { id: 'd6', name: 'Barangay Health Center', emoji: '🏥', cost: 9_000_000, text: 'Libreng check-up para sa bayan mo.' },
  { id: 'd7', name: 'Yate sa Palawan', emoji: '⛵', cost: 16_000_000, text: 'Island hopping kahit kailan mo gusto.' },
  { id: 'd8', name: 'Ancestral House Restoration', emoji: '🏛️', cost: 7_000_000, text: 'Ibalik ang ganda ng bahay ng mga ninuno.' },
];

// Fast Track fixed deals keyed by space index on the fastTrack board.
export const ftDeals = {
  1:  { name: 'Tech Startup (Angel)', emoji: '🚀', kind: 'gamble', cost: 3_000_000, need: 6, win: 40_000_000 },
  2:  { name: 'Laundry Chain (20 branches)', emoji: '🧺', kind: 'deal', cost: 5_000_000, cf: 220_000 },
  5:  { name: 'BPO Office Building', emoji: '🏢', kind: 'deal', cost: 15_000_000, cf: 600_000 },
  7:  { name: 'Pelikula Production', emoji: '🎬', kind: 'gamble', cost: 5_000_000, need: 5, win: 20_000_000 },
  8:  { name: 'Resort sa Palawan', emoji: '🏝️', kind: 'deal', cost: 12_000_000, cf: 450_000 },
  11: { name: 'Solar Power Plant', emoji: '🔆', kind: 'deal', cost: 20_000_000, cf: 800_000 },
  14: { name: 'Fast Food Franchises (×5)', emoji: '🍔', kind: 'deal', cost: 8_000_000, cf: 330_000 },
  16: { name: 'Shipping Company', emoji: '🚢', kind: 'deal', cost: 25_000_000, cf: 1_000_000 },
  17: { name: 'Gold Mining Claim', emoji: '⛏️', kind: 'gamble', cost: 6_000_000, need: 4, win: 15_000_000 },
  19: { name: 'Hospital Wing', emoji: '🏥', kind: 'deal', cost: 18_000_000, cf: 700_000 },
  22: { name: 'Agri-Tech Plantation', emoji: '🌱', kind: 'deal', cost: 6_000_000, cf: 250_000 },
};

export const ftDisasters = {
  4:  { name: 'Kinasuhan Ka', emoji: '⚖️', pct: 0.5, text: 'Nawala ang kalahati ng cash mo sa abogado at settlement.' },
  13: { name: 'BIR Audit', emoji: '🧾', pct: 0.3, text: 'May kulang na tax filings. −30% ng cash.' },
  20: { name: 'Away-Pamilya sa Mana', emoji: '💔', pct: 0.4, text: 'Hinati ang ari-arian. −40% ng cash.' },
};

// Dream spaces on the Fast Track, in board order.
export const dreamSpaces = [3, 9, 15, 21, 23];

export const lessons = {
  oport: 'Assets ay naglalagay ng pera sa bulsa mo. Liabilities ay kumukuha.',
  gastos: 'Ang mayayaman ay bumibili muna ng assets. Ang luho ay binabayaran ng assets.',
  merkado: 'Ang kita ay nasa pagbili. Bumili nang mura, magbenta kapag may handang buyer.',
  buhay: 'Hindi mo kontrolado ang buhay. Kontrolado mo kung gaano ka kahanda.',
  aral: 'Ang pinakamagandang investment ay ang financial education mo.',
  tulong: 'Magbigay, at babalik sa iyo nang higit pa.',
  tanggal: 'Ang trabaho ay hindi security. Ang passive income ang tunay na security.',
  koneksyon: 'Your network is your net worth.',
};
