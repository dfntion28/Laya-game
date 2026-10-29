// Starting financial statements. Liabilities with `months` amortize (balance shrinks each Sahod);
// liabilities without `months` are revolving (interest-only) until repaid.
// `variable: [min, step]` means salary each Sahod = step x D6 (min floor), for self-employed players.

export const professions = [
  {
    id: 'guro', name: 'Guro', en: 'Public School Teacher', emoji: '📚',
    salary: 31_700, tax: 4_300, living: 13_500, cash: 20_000,
    liabilities: [
      { name: 'GSIS Salary Loan', balance: 80_000, payment: 3_000, months: 30 },
    ],
    trait: 'Laging nag-aaral: lahat ng Aral (skills) ay 50% off.',
    traitKey: 'cheap_skills',
    thirteenth: true,
  },
  {
    id: 'nars', name: 'Nars', en: 'Hospital Nurse', emoji: '🩺',
    salary: 33_000, tax: 4_600, living: 14_000, cash: 25_000,
    liabilities: [
      { name: 'Credit Card', balance: 35_000, payment: 1_200, rate: 0.035 },
    ],
    trait: 'Healthcare insider: medical bills at insurance −50%.',
    traitKey: 'medical_half',
    thirteenth: true,
  },
  {
    id: 'bpo', name: 'BPO Team Lead', en: 'Call Center Lead', emoji: '🎧',
    salary: 42_000, tax: 6_400, living: 18_000, cash: 15_000,
    liabilities: [
      { name: 'Personal Loan', balance: 90_000, payment: 4_200, months: 24 },
      { name: 'Credit Card', balance: 40_000, payment: 1_400, rate: 0.035 },
    ],
    trait: 'Night shift grind: +1 Diskarte (simula at max).',
    traitKey: 'extra_diskarte',
    thirteenth: true,
  },
  {
    id: 'inhinyero', name: 'Inhinyero', en: 'Site Engineer', emoji: '👷',
    salary: 55_000, tax: 9_400, living: 19_000, cash: 40_000,
    liabilities: [
      { name: 'Car Loan', balance: 600_000, payment: 14_500, months: 48 },
    ],
    trait: 'Alam ang construction: −15% down payment sa real estate.',
    traitKey: 're_discount',
    thirteenth: true,
  },
  {
    id: 'kawani', name: 'Kawani ng Gobyerno', en: 'Government Employee', emoji: '🏛️',
    salary: 38_000, tax: 5_600, living: 16_000, cash: 30_000,
    liabilities: [
      { name: 'GSIS Policy Loan', balance: 120_000, payment: 3_800, months: 36 },
    ],
    trait: 'Security of tenure: hindi ka matatanggal sa trabaho.',
    traitKey: 'job_secure',
    thirteenth: true,
  },
  {
    id: 'seaman', name: 'Seaman (OFW)', en: 'Overseas Seafarer', emoji: '⚓',
    salary: 140_000, tax: 3_000, living: 24_000, family: 40_000, cash: 60_000,
    liabilities: [
      { name: 'Bahay ng Pamilya', balance: 1_500_000, payment: 16_000, months: 120 },
    ],
    trait: 'Malaki ang sahod, malaki ang padala. 1/6 tsansa ng family emergency bawat Sahod.',
    traitKey: 'family_risk',
    thirteenth: false,
  },
  {
    id: 'negosyante', name: 'Negosyante', en: 'Small Business Owner', emoji: '🏪',
    salary: 0, variable: [12_000, 12_000], tax: 3_000, living: 17_000, cash: 50_000,
    liabilities: [
      { name: 'Business Loan', balance: 300_000, payment: 9_500, months: 36 },
    ],
    trait: 'Pabago-bago ang kita (₱12K × D6). Negosyo assets +25% cashflow.',
    traitKey: 'biz_boost',
    thirteenth: false,
  },
  {
    id: 'doktor', name: 'Doktor', en: 'Resident Doctor', emoji: '⚕️',
    salary: 110_000, tax: 25_000, living: 34_000, cash: 30_000,
    liabilities: [
      { name: 'Med School Loan', balance: 1_200_000, payment: 20_000, months: 72 },
      { name: 'SUV Loan', balance: 800_000, payment: 18_000, months: 48 },
    ],
    trait: 'Mataas ang sahod, mataas ang lifestyle. Medical bills −50%.',
    traitKey: 'medical_half',
    thirteenth: true,
  },
  {
    id: 'freelancer', name: 'Freelancer', en: 'Online Freelancer', emoji: '💻',
    salary: 0, variable: [8_000, 9_000], tax: 2_500, living: 15_000, cash: 15_000,
    liabilities: [],
    trait: 'Walang boss, walang 13th month. Kita: ₱9K × D6. +1 Diskarte.',
    traitKey: 'extra_diskarte',
    thirteenth: false,
  },
];

export const professionById = Object.fromEntries(professions.map(p => [p.id, p]));

// From scripts/simulate.mjs: median turns to escape ~25-32 (1), ~35-42 (2), 50+ (3).
export const difficulty = {
  guro: 2, nars: 1, bpo: 2, inhinyero: 1, kawani: 2, seaman: 1, negosyante: 2, doktor: 3, freelancer: 2,
};
