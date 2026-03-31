export interface CustomBenefit {
  id: string;
  label: string;
  valuePerMonth: number;
  postTax: boolean; // false = taxable pre-tax benefit; true = deducted from net pay
}

export interface Package {
  id: string;
  name: string;
  // Løn
  monthlySalary: number;
  pensionPct: number;
  ownPensionPct: number;
  yearlyBonus: number;
  ferietillaegPct: number;
  fritvalgPct: number;
  // Arbejdstid & Pendling
  weeklyHours: number;
  betaltFrokost: boolean;
  commuteMinutesPerDay: number;
  monthlyCommuteCost: number;
  remoteDaysPerWeek: number;
  // Goder
  extraVacationDays: number;
  benefits: CustomBenefit[];
}

export interface TaxBreakdown {
  amBidrag: number;
  beskæftigelsesfradrag: number;
  personfradrag: number;
  bundskat: number;
  kommuneskat: number;
  mellemskat: number;
  topskat: number;
  toptopskat: number;
  total: number;
}

export interface BreakdownItem {
  label: string;
  monthlyDKK: number;
}

export interface CalculationResult {
  totalAnnualComp: number;
  effectiveHourlyRateExCommute: number;
  effectiveHourlyRateIncCommute: number;
  estimatedMonthlyTakeHome: number;
  annualTakeHome: number;
  netMonthlyAfterExpenses: number;
  netContractualHourlyRate: number;
  netEffectiveHourlyRateExCommute: number;
  netEffectiveHourlyRateIncCommute: number;
  taxBreakdown: TaxBreakdown;
  breakdown: BreakdownItem[];
  baseHourlyRate: number;
  contractualHourlyRate: number;
  lunchHourlyImpact: number;
  vacationHourlyImpact: number;
  commuteHourlyImpact: number;
  betaltFrokost: boolean;
  commuteHoursPerYear: number;
  vacationAnnualValue: number;
  extraVacationDays: number;
}
