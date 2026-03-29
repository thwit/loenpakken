import type { Package, CalculationResult, BreakdownItem, TaxBreakdown } from './types';
import { WORKING_DAYS_PER_YEAR, WEEKS_PER_YEAR } from './constants';

// 2026 – Københavns Kommune – no kirkeskat
const AM_BIDRAG_RATE = 0.08;
const PERSONFRADRAG = 54_100;
const BESKÆFTIGELSESFRADRAG_RATE = 0.1275;
const BESKÆFTIGELSESFRADRAG_MAX = 63_300;
const BUNDSKAT_RATE = 0.1201;
const KOMMUNESKAT_RATE = 0.2339;
const MELLEMSKAT_RATE = 0.075;
const MELLEMSKAT_THRESHOLD = 641_200;
const TOPSKAT_RATE = 0.075;
const TOPSKAT_THRESHOLD = 777_900;
const TOPTOPSKAT_RATE = 0.05;
const TOPTOPSKAT_THRESHOLD = 2_592_700;
// Skatteloft: combined rate of bundskat+kommuneskat+top taxes cannot exceed 44.57%.
// When stacked top taxes push the rate over the ceiling, bundskat is reduced by the excess.
// Mellemskat band:    12.01+23.39+7.5        = 42.90% → under ceiling, no correction
// Topskat band:       12.01+23.39+7.5+7.5    = 50.40% → excess 5.83%
// Toptopskat band:    12.01+23.39+7.5+7.5+5  = 55.40% → excess 10.83%
const SKATTELOFT = 0.4457;
const TOPSKAT_EXCESS    = Math.max(0, BUNDSKAT_RATE + KOMMUNESKAT_RATE + MELLEMSKAT_RATE + TOPSKAT_RATE - SKATTELOFT);
const TOPTOPSKAT_EXCESS = Math.max(0, BUNDSKAT_RATE + KOMMUNESKAT_RATE + MELLEMSKAT_RATE + TOPSKAT_RATE + TOPTOPSKAT_RATE - SKATTELOFT);

function calculateDanishTax(annualGross: number): TaxBreakdown {
  const amBidrag = annualGross * AM_BIDRAG_RATE;
  const personligIndkomst = annualGross - amBidrag;
  const beskæftigelsesfradrag = Math.min(annualGross * BESKÆFTIGELSESFRADRAG_RATE, BESKÆFTIGELSESFRADRAG_MAX);
  const skattepligtig = Math.max(personligIndkomst - beskæftigelsesfradrag - PERSONFRADRAG, 0);

  const bundskatRaw = skattepligtig * BUNDSKAT_RATE;
  const kommuneskat = skattepligtig * KOMMUNESKAT_RATE;
  const mellemskat = Math.max(personligIndkomst - MELLEMSKAT_THRESHOLD, 0) * MELLEMSKAT_RATE;
  const topskat    = Math.max(personligIndkomst - TOPSKAT_THRESHOLD, 0) * TOPSKAT_RATE;
  const toptopskat = Math.max(personligIndkomst - TOPTOPSKAT_THRESHOLD, 0) * TOPTOPSKAT_RATE;

  // Skatteloft nedslag: reduce bundskat for income in topskat/toptopskat bands
  const topskatIncome    = Math.max(personligIndkomst - TOPSKAT_THRESHOLD, 0)
                         - Math.max(personligIndkomst - TOPTOPSKAT_THRESHOLD, 0);
  const toptopskatIncome = Math.max(personligIndkomst - TOPTOPSKAT_THRESHOLD, 0);
  const nedslag = topskatIncome * TOPSKAT_EXCESS + toptopskatIncome * TOPTOPSKAT_EXCESS;

  const bundskat = Math.max(bundskatRaw - nedslag, 0);
  const total = amBidrag + bundskat + kommuneskat + mellemskat + topskat + toptopskat;
  return { amBidrag, beskæftigelsesfradrag, personfradrag: PERSONFRADRAG, bundskat, kommuneskat, mellemskat, topskat, toptopskat, total };
}

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
  const fritvalgAnnual = annualSalary * pkg.fritvalgPct / 100;

  const benefitsAnnual = pkg.benefits.reduce((sum, b) => sum + b.valuePerMonth * 12, 0);

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
    fritvalgAnnual +
    pkg.yearlyBonus +
    benefitsAnnual -
    annualCommuteCost;

  const commuteDaysPerYear = commuteDaysPerWeek * WEEKS_PER_YEAR;
  const commuteHoursPerYear = commuteDaysPerYear * (pkg.commuteMinutesPerDay / 60);
  const effectiveWeeklyHours = pkg.weeklyHours + (pkg.betaltFrokost ? 0 : 2.5);
  const grossWorkHoursPerYear = effectiveWeeklyHours * WEEKS_PER_YEAR;
  const vacationHoursPerYear = pkg.extraVacationDays * (pkg.weeklyHours / 5);
  const workHoursPerYear = grossWorkHoursPerYear - vacationHoursPerYear;

  const effectiveHourlyRateExCommute = workHoursPerYear === 0 ? 0 : totalAnnualComp / workHoursPerYear;
  const effectiveHourlyRateIncCommute = (workHoursPerYear + commuteHoursPerYear) === 0 ? 0 : totalAnnualComp / (workHoursPerYear + commuteHoursPerYear);
  const annualOwnPension = monthlyOwnPension * 12;
  const taxableAnnual = annualSalary - annualOwnPension + ferietillaeg + fritvalgAnnual + pkg.yearlyBonus;
  const taxBreakdown = calculateDanishTax(Math.max(taxableAnnual, 0));
  const annualTakeHome = Math.max(taxableAnnual - taxBreakdown.total, 0);
  const estimatedMonthlyTakeHome = annualTakeHome / 12;

  // All items always included in fixed order — normalization happens in normalizeBreakdowns()
  const breakdown: BreakdownItem[] = [
    { label: 'Bruttoløn', monthlyDKK: pkg.monthlySalary },
    { label: pkg.pensionPct > 0 ? `Pension arbejdsgiver (${pkg.pensionPct}%)` : 'Pension arbejdsgiver', monthlyDKK: monthlyPension },
    { label: pkg.ownPensionPct > 0 ? `Pension eget bidrag (${pkg.ownPensionPct}%)` : 'Pension eget bidrag', monthlyDKK: -monthlyOwnPension },
    { label: 'Bonus', monthlyDKK: pkg.yearlyBonus / 12 },
    { label: pkg.ferietillaegPct > 0 ? `Ferietillæg (${pkg.ferietillaegPct}%)` : 'Ferietillæg', monthlyDKK: ferietillaeg / 12 },
    { label: pkg.fritvalgPct > 0 ? `Fritvalgskonto (${pkg.fritvalgPct}%)` : 'Fritvalgskonto', monthlyDKK: fritvalgAnnual / 12 },
    ...pkg.benefits.map(b => ({ label: b.label || 'Gode', monthlyDKK: b.valuePerMonth })),
    { label: 'Pendling', monthlyDKK: -effectiveMonthlyCommuteCost },
  ];

  // R0: contractual rate (paid lunch, no vacation adjustment, no commute)
  const contractualHourlyRate = pkg.weeklyHours > 0
    ? totalAnnualComp / (pkg.weeklyHours * WEEKS_PER_YEAR)
    : 0;
  // R1: after vacation (paid lunch still assumed)
  const rateAfterVacation = (pkg.weeklyHours * WEEKS_PER_YEAR - vacationHoursPerYear) > 0
    ? totalAnnualComp / (pkg.weeklyHours * WEEKS_PER_YEAR - vacationHoursPerYear)
    : contractualHourlyRate;
  const vacationHourlyImpact = pkg.extraVacationDays > 0 ? rateAfterVacation - contractualHourlyRate : 0;
  // R2: after lunch adjustment (negative when unpaid, zero when paid)
  const lunchHourlyImpact = !pkg.betaltFrokost ? effectiveHourlyRateExCommute - rateAfterVacation : 0;
  const commuteHourlyImpact = commuteHoursPerYear > 0 ? effectiveHourlyRateIncCommute - effectiveHourlyRateExCommute : 0;
  const baseHourlyRate = contractualHourlyRate;

  return { totalAnnualComp, effectiveHourlyRateExCommute, effectiveHourlyRateIncCommute, estimatedMonthlyTakeHome, annualTakeHome, taxBreakdown, breakdown, baseHourlyRate, contractualHourlyRate, lunchHourlyImpact, vacationHourlyImpact, commuteHourlyImpact, commuteHoursPerYear, vacationAnnualValue: vacationValue, extraVacationDays: pkg.extraVacationDays, betaltFrokost: pkg.betaltFrokost };
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
