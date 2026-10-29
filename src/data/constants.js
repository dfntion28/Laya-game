// All money values are Philippine Peso (PHP), per month unless noted.

export const SAVE_VERSION = 3;

export const LOAN_STEP = 10_000;
// Bank loans are interest-only: you pay this % of the balance every Sahod until you repay it.
export const BANK_RATE_GOOD = 0.02;  // credit score >= CREDIT_GOOD
export const BANK_RATE_STD = 0.03;
export const FIVE_SIX_RATE = 0.20;   // "5-6" informal lender: 20% per month
export const FIVE_SIX_CAP = 300_000; // total 5-6 debt before bankruptcy

export const CREDIT_START = 650;
export const CREDIT_GOOD = 700;
export const CREDIT_BANK_MIN = 550;
export const CREDIT_MIN = 300;
export const CREDIT_MAX = 850;

export const INSURANCE_COST = 2_500;
export const INSURANCE_COVER = 0.8;   // insurance pays 80% of medical / disaster bills
export const CHILD_COST = 6_000;
export const MAX_CHILDREN = 3;
export const TUITION_PER_CHILD = 8_000; // every June

export const DISKARTE_START = 2;
export const DISKARTE_MAX = 3;
export const HAND_MAX = 3;

export const TYPHOON_MONTHS = [6, 7, 8, 9]; // Jul–Oct (0 = January)
export const TYPHOON_DAMAGE_PER_PROPERTY = 12_000;

export const MP2_RATE = 0.0055; // Pag-IBIG MP2-style savings, ~6.6%/yr

// Fast Track
export const FT_CASHFLOW_MULT = 20;      // passive income x20 becomes your Fast Track cashflow
export const FT_WIN_GAIN = 1_500_000;    // add this much Fast Track cashflow to win
export const FT_CHARITY_COST = 1_000_000;

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const PLAYER_COLORS = ['red', 'blue', 'green', 'purple'];

// Player-to-player (2+ players)
export const PITCH_STEP = 5_000;           // asking price steps when selling a deal card to a player
export const PITCH_MAX = 1_000_000;
export const PLAYER_LOAN_MAX = 500_000;
export const PLAYER_LOAN_RATES = [0.01, 0.02, 0.03, 0.05]; // per month, chosen by the borrower
export const FIXER_SHARE = 0.3;            // a fixer charges 30% of the bill to make it go away
export const FIXER_MIN_BILL = 10_000;
export const FIXER_CAUGHT_MAX = 2;         // d6 roll of 1-2 = caught
export const FIXER_FINE_MULT = 0.5;        // caught: pay the bill plus 50% fine on top of the fee
export const FIXER_CREDIT_HIT = 40;
export const PERMIT_HOLD_COST = 20_000;    // what you pay a fixer to hold a rival's permit
export const PERMIT_HOLD_FEE = 30_000;     // extra the rival pays on their next property or business
export const PERMIT_CAUGHT_FINE = 50_000;

export const MAX_PLAYERS = PLAYER_COLORS.length;
