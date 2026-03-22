export interface BenefitField {
  enabled: boolean;
  valuePerMonth: number;
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
  // Arbejdstid & Pendling
  weeklyHours: number;
  commuteMinutesPerDay: number;
  monthlyCommuteCost: number;
  remoteDaysPerWeek: number;
  // Goder
  extraVacationDays: number;
  healthInsurance: BenefitField;
  freeFood: BenefitField;
  phoneComputerCar: BenefitField;
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
  breakdown: BreakdownItem[];
}
