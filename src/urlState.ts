import type { Package } from './types';
import { createDefaultPackage } from './constants';

function encode(packages: Package[]): string {
  const json = JSON.stringify(packages);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64;
}

function coercePackage(raw: unknown): Package {
  const defaults = createDefaultPackage('Pakke');
  if (typeof raw !== 'object' || raw === null) return defaults;
  const r = raw as Record<string, unknown>;

  function benefitField(val: unknown, def: { enabled: boolean; valuePerMonth: number }) {
    if (typeof val !== 'object' || val === null) return def;
    const v = val as Record<string, unknown>;
    return {
      enabled: typeof v.enabled === 'boolean' ? v.enabled : def.enabled,
      valuePerMonth:
        typeof v.valuePerMonth === 'number' ? v.valuePerMonth : def.valuePerMonth,
    };
  }

  return {
    id: typeof r.id === 'string' ? r.id : crypto.randomUUID(),
    name: typeof r.name === 'string' ? r.name : defaults.name,
    monthlySalary: typeof r.monthlySalary === 'number' ? r.monthlySalary : 0,
    pensionPct: typeof r.pensionPct === 'number' ? r.pensionPct : 0,
    ownPensionPct: typeof r.ownPensionPct === 'number' ? r.ownPensionPct : 0,
    yearlyBonus: typeof r.yearlyBonus === 'number' ? r.yearlyBonus : 0,
    ferietillaegPct: typeof r.ferietillaegPct === 'number' ? r.ferietillaegPct : 1,
    weeklyHours: typeof r.weeklyHours === 'number' ? r.weeklyHours : 37,
    commuteMinutesPerDay:
      typeof r.commuteMinutesPerDay === 'number' ? r.commuteMinutesPerDay : 0,
    monthlyCommuteCost:
      typeof r.monthlyCommuteCost === 'number' ? r.monthlyCommuteCost : 0,
    remoteDaysPerWeek:
      typeof r.remoteDaysPerWeek === 'number' ? r.remoteDaysPerWeek : 0,
    extraVacationDays:
      typeof r.extraVacationDays === 'number' ? r.extraVacationDays : 0,
    healthInsurance: benefitField(r.healthInsurance, defaults.healthInsurance),
    freeFood: benefitField(r.freeFood, defaults.freeFood),
    phoneComputerCar: benefitField(r.phoneComputerCar, defaults.phoneComputerCar),
  };
}

export function encodeState(packages: Package[]): void {
  const b64 = encode(packages);
  history.replaceState(null, '', `#state=${b64}`);
}

export function decodeState(): Package[] | null {
  const hash = window.location.hash;
  const match = hash.match(/^#state=(.+)$/);
  if (!match) return null;
  try {
    const json = decodeURIComponent(escape(atob(match[1])));
    const raw = JSON.parse(json);
    if (!Array.isArray(raw)) return null;
    return raw.map(coercePackage);
  } catch {
    return null;
  }
}
