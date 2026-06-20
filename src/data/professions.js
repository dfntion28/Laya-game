export const professions = [
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
