import type { Package, CalculationResult, BreakdownItem } from './types';
import { WORKING_DAYS_PER_YEAR, WEEKS_PER_YEAR } from './constants';

export const dkkFormatter = new Intl.NumberFormat('da-DK', {
  style: 'currency',
  currency: 'DKK',
  maximumFractionDigits: 0,
});

export function formatDKK(amount: number): string {
  return dkkFormatter.format(amount);
}

export function calculate(pkg: Package): CalculationResult {
  const annualSalary = pkg.monthlySalary * 12;
  const monthlyPension = pkg.monthlySalary * pkg.pensionPct / 100;
  const annualPension = monthlyPension * 12;
  const monthlyOwnPension = pkg.monthlySalary * pkg.ownPensionPct / 100;
  const ferietillaeg = annualSalary * pkg.ferietillaegPct / 100;

  const benefitsAnnual =
    (pkg.healthInsurance.enabled ? pkg.healthInsurance.valuePerMonth * 12 : 0) +
    (pkg.freeFood.enabled ? pkg.freeFood.valuePerMonth * 12 : 0) +
    (pkg.phoneComputerCar.enabled ? pkg.phoneComputerCar.valuePerMonth * 12 : 0);

  const vacationValue =
    WORKING_DAYS_PER_YEAR > 0
      ? (annualSalary / WORKING_DAYS_PER_YEAR) * pkg.extraVacationDays
      : 0;

  const remoteDays = Math.min(5, Math.max(0, pkg.remoteDaysPerWeek));
  const commuteDaysPerWeek = 5 - remoteDays;

  const effectiveMonthlyCommuteCost = pkg.monthlyCommuteCost;
  const annualCommuteCost = effectiveMonthlyCommuteCost * 12;

  const totalAnnualComp =
    annualSalary +
    annualPension +
    ferietillaeg +
    pkg.yearlyBonus +
    benefitsAnnual +
    vacationValue -
    annualCommuteCost;

  const commuteDaysPerYear = commuteDaysPerWeek * WEEKS_PER_YEAR;
  const commuteHoursPerYear = commuteDaysPerYear * (pkg.commuteMinutesPerDay / 60);
  const workHoursPerYear = pkg.weeklyHours * WEEKS_PER_YEAR;

  const effectiveHourlyRateExCommute = workHoursPerYear === 0 ? 0 : totalAnnualComp / workHoursPerYear;
  const effectiveHourlyRateIncCommute = (workHoursPerYear + commuteHoursPerYear) === 0 ? 0 : totalAnnualComp / (workHoursPerYear + commuteHoursPerYear);
  const estimatedMonthlyTakeHome = (pkg.monthlySalary - monthlyOwnPension) * 0.65;

  // All items always included in fixed order — normalization happens in normalizeBreakdowns()
  const breakdown: BreakdownItem[] = [
    { label: 'Bruttoløn', monthlyDKK: pkg.monthlySalary },
    { label: pkg.pensionPct > 0 ? `Pension arbejdsgiver (${pkg.pensionPct}%)` : 'Pension arbejdsgiver', monthlyDKK: monthlyPension },
    { label: pkg.ownPensionPct > 0 ? `Pension eget bidrag (${pkg.ownPensionPct}%)` : 'Pension eget bidrag', monthlyDKK: -monthlyOwnPension },
    { label: 'Bonus', monthlyDKK: pkg.yearlyBonus / 12 },
    { label: pkg.ferietillaegPct > 0 ? `Ferietillæg (${pkg.ferietillaegPct}%)` : 'Ferietillæg', monthlyDKK: ferietillaeg / 12 },
    { label: pkg.extraVacationDays > 0 ? `Ekstra ferie (${pkg.extraVacationDays} dage)` : 'Ekstra ferie', monthlyDKK: vacationValue / 12 },
    { label: 'Sundhedsforsikring', monthlyDKK: pkg.healthInsurance.enabled ? pkg.healthInsurance.valuePerMonth : 0 },
    { label: 'Frokostordning', monthlyDKK: pkg.freeFood.enabled ? pkg.freeFood.valuePerMonth : 0 },
    { label: 'Fri tlf/computer/bil', monthlyDKK: pkg.phoneComputerCar.enabled ? pkg.phoneComputerCar.valuePerMonth : 0 },
    { label: 'Pendling', monthlyDKK: -effectiveMonthlyCommuteCost },
  ];

  return { totalAnnualComp, effectiveHourlyRateExCommute, effectiveHourlyRateIncCommute, estimatedMonthlyTakeHome, breakdown };
}

/** Drop rows that are zero across every result, keeping the rest in sync. */
export function normalizeBreakdowns(results: CalculationResult[]): BreakdownItem[][] {
  if (results.length === 0) return [];
  const len = results[0].breakdown.length;
  const active = Array.from({ length: len }, (_, i) =>
    results.some(r => r.breakdown[i]?.monthlyDKK !== 0)
  );
  return results.map(r => r.breakdown.filter((_, i) => active[i]));
}
