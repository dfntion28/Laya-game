// Starting financial statements. Liabilities with `months` amortize (balance shrinks each Sahod);
// liabilities without `months` are revolving (interest-only) until repaid.
// `variable: [min, step]` means salary each Sahod = step x D6 (min floor), for self-employed players.

export const professions = [
  {
    id: 'guro', name: 'Teacher', en: 'Public school, Teacher I', emoji: '📚',
    salary: 31_700, tax: 4_300, living: 13_500, cash: 20_000,
    liabilities: [
      { name: 'GSIS Salary Loan', balance: 80_000, payment: 3_000, months: 30 },
    ],
    trait: 'Always studying. Skills cost half.',
    traitKey: 'cheap_skills',
    thirteenth: true,
  },
  {
    id: 'nars', name: 'Nurse', en: 'Private hospital', emoji: '🩺',
    salary: 33_000, tax: 4_600, living: 14_000, cash: 25_000,
    liabilities: [
      { name: 'Credit Card', balance: 35_000, payment: 1_200, rate: 0.035 },
    ],
    trait: 'Knows the system. Medical bills and insurance cost half.',
    traitKey: 'medical_half',
    thirteenth: true,
  },
  {
    id: 'bpo', name: 'BPO Team Lead', en: 'Night shift, Ortigas', emoji: '🎧',
    salary: 42_000, tax: 6_400, living: 18_000, cash: 15_000,
    liabilities: [
      { name: 'Personal Loan', balance: 90_000, payment: 4_200, months: 24 },
      { name: 'Credit Card', balance: 40_000, payment: 1_400, rate: 0.035 },
    ],
    trait: 'Graveyard grind. Starts with +1 Diskarte and can hold one more.',
    traitKey: 'extra_diskarte',
    thirteenth: true,
  },
  {
    id: 'inhinyero', name: 'Engineer', en: 'Site engineer', emoji: '👷',
    salary: 55_000, tax: 9_400, living: 19_000, cash: 40_000,
    liabilities: [
      { name: 'Car Loan', balance: 600_000, payment: 14_500, months: 48 },
    ],
    trait: 'Knows construction. 15% off real estate down payments.',
    traitKey: 're_discount',
    thirteenth: true,
  },
  {
    id: 'kawani', name: 'Gov\'t Employee', en: 'City hall, plantilla', emoji: '🏛️',
    salary: 38_000, tax: 5_600, living: 16_000, cash: 30_000,
    liabilities: [
      { name: 'GSIS Policy Loan', balance: 120_000, payment: 3_800, months: 36 },
    ],
    trait: 'Security of tenure. Can\'t be laid off.',
    traitKey: 'job_secure',
    thirteenth: true,
  },
  {
    id: 'seaman', name: 'Seaman', en: 'OFW, cargo ship', emoji: '⚓',
    salary: 140_000, tax: 3_000, living: 24_000, family: 40_000, cash: 60_000,
    liabilities: [
      { name: 'Family House Loan', balance: 1_500_000, payment: 16_000, months: 120 },
    ],
    trait: 'Big salary, big padala. 1 in 6 chance of a family emergency every payday.',
    traitKey: 'family_risk',
    thirteenth: false,
  },
  {
    id: 'negosyante', name: 'Business Owner', en: 'Small shop', emoji: '🏪',
    salary: 0, variable: [12_000, 12_000], tax: 3_000, living: 17_000, cash: 50_000,
    liabilities: [
      { name: 'Business Loan', balance: 300_000, payment: 9_500, months: 36 },
    ],
    trait: 'Income swings (₱12K × a die roll). Businesses you buy earn 25% more.',
    traitKey: 'biz_boost',
    thirteenth: false,
  },
  {
    id: 'doktor', name: 'Doctor', en: 'Resident, private hospital', emoji: '⚕️',
    salary: 110_000, tax: 25_000, living: 34_000, cash: 30_000,
    liabilities: [
      { name: 'Med School Loan', balance: 1_200_000, payment: 20_000, months: 72 },
      { name: 'SUV Loan', balance: 800_000, payment: 18_000, months: 48 },
    ],
    trait: 'High salary, higher lifestyle. Medical bills cost half.',
    traitKey: 'medical_half',
    thirteenth: true,
  },
  {
    id: 'freelancer', name: 'Freelancer', en: 'Upwork, from home', emoji: '💻',
    salary: 0, variable: [8_000, 9_000], tax: 2_500, living: 15_000, cash: 15_000,
    liabilities: [],
    trait: 'No boss, no 13th month. Income is ₱9K × a die roll. +1 Diskarte.',
    traitKey: 'extra_diskarte',
    thirteenth: false,
  },
];

export const professionById = Object.fromEntries(professions.map(p => [p.id, p]));

// From scripts/simulate.mjs: median turns to escape ~25-32 (1), ~35-42 (2), 50+ (3).
export const difficulty = {
  guro: 2, nars: 1, bpo: 2, inhinyero: 1, kawani: 2, seaman: 1, negosyante: 2, doktor: 3, freelancer: 2,
};
