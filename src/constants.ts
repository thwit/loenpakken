import type { Package } from './types';

export const PKG_COLORS = ['#0F766E', '#C05621', '#2B6CB0', '#6B46C1'];

export const WORKING_DAYS_PER_YEAR = 225;
export const WEEKS_PER_YEAR = 52;

export const DEFAULT_BENEFIT_VALUES = {
  healthInsurance: 300,
  freeFood: 600,
  phoneComputerCar: 500,
};

export function createDefaultPackage(name: string): Package {
  return {
    id: crypto.randomUUID(),
    name,
    monthlySalary: 0,
    pensionPct: 0,
    ownPensionPct: 0,
    yearlyBonus: 0,
    ferietillaegPct: 0,
    weeklyHours: 37,
    commuteMinutesPerDay: 0,
    monthlyCommuteCost: 0,
    remoteDaysPerWeek: 0,
    extraVacationDays: 0,
    healthInsurance: { enabled: false, valuePerMonth: DEFAULT_BENEFIT_VALUES.healthInsurance },
    freeFood: { enabled: false, valuePerMonth: DEFAULT_BENEFIT_VALUES.freeFood },
    phoneComputerCar: { enabled: false, valuePerMonth: DEFAULT_BENEFIT_VALUES.phoneComputerCar },
  };
}
