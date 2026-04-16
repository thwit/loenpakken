import type { Package, CustomBenefit } from './types';

const DEFAULT_NAMES = ['Nuværende', 'Jobtilbud'];
const DEFAULT_WEEKLY_HOURS = 37;

function encodePackage(pkg: Package, defaultName: string, params: URLSearchParams, p: string) {
  if (pkg.name !== defaultName)      params.set(`${p}.n`,  pkg.name);
  if (pkg.monthlySalary !== 0)       params.set(`${p}.ms`, String(pkg.monthlySalary));
  if (pkg.pensionPct !== 0)          params.set(`${p}.pp`, String(pkg.pensionPct));
  if (pkg.ownPensionPct !== 0)       params.set(`${p}.op`, String(pkg.ownPensionPct));
  if (pkg.yearlyBonus !== 0)         params.set(`${p}.yb`, String(pkg.yearlyBonus));
  if (pkg.ferietillaegPct !== 0)     params.set(`${p}.fp`, String(pkg.ferietillaegPct));
  if (pkg.fritvalgPct !== 0)         params.set(`${p}.fv`, String(pkg.fritvalgPct));
  if (pkg.weeklyHours !== DEFAULT_WEEKLY_HOURS) params.set(`${p}.wh`, String(pkg.weeklyHours));
  if (pkg.betaltFrokost)             params.set(`${p}.bf`, '1');
  if (pkg.commuteMinutesPerDay !== 0) params.set(`${p}.cm`, String(pkg.commuteMinutesPerDay));
  if (pkg.monthlyCommuteCost !== 0)  params.set(`${p}.mc`, String(pkg.monthlyCommuteCost));
  if (pkg.yearlyKørselsfradrag !== 0) params.set(`${p}.kf`, String(pkg.yearlyKørselsfradrag));
  if (pkg.remoteDaysPerWeek !== 0)   params.set(`${p}.rd`, String(pkg.remoteDaysPerWeek));
  if (pkg.extraVacationDays !== 0)   params.set(`${p}.ev`, String(pkg.extraVacationDays));
  if (pkg.benefits.length > 0) {
    params.set(`${p}.b`, pkg.benefits.map(b => `${encodeURIComponent(b.label)}:${b.valuePerMonth}${b.postTax ? 'p' : ''}`).join('|'));
  }
}

export function encodeState(packages: Package[]): void {
  const params = new URLSearchParams();
  encodePackage(packages[0], DEFAULT_NAMES[0], params, 'a');
  encodePackage(packages[1], DEFAULT_NAMES[1], params, 'b');
  const str = params.toString();
  history.replaceState(null, '', str ? `#${str}` : location.pathname + location.search);
}

function decodePackage(params: URLSearchParams, p: string, defaultName: string): Package {
  const benefitsRaw = params.get(`${p}.b`);
  const benefits: CustomBenefit[] = benefitsRaw
    ? benefitsRaw.split('|').map(part => {
        const cut = part.lastIndexOf(':');
        const raw = part.slice(cut + 1);
        const postTax = raw.endsWith('p');
        return {
          id: crypto.randomUUID(),
          label: decodeURIComponent(part.slice(0, cut)),
          valuePerMonth: parseFloat(postTax ? raw.slice(0, -1) : raw) || 0,
          postTax,
        };
      })
    : [];

  const num = (key: string, fallback = 0) => parseFloat(params.get(key) ?? '') || fallback;

  return {
    id: crypto.randomUUID(),
    name: params.get(`${p}.n`) ?? defaultName,
    monthlySalary: num(`${p}.ms`),
    pensionPct: num(`${p}.pp`),
    ownPensionPct: num(`${p}.op`),
    yearlyBonus: num(`${p}.yb`),
    ferietillaegPct: num(`${p}.fp`),
    fritvalgPct: num(`${p}.fv`),
    weeklyHours: num(`${p}.wh`, DEFAULT_WEEKLY_HOURS),
    betaltFrokost: params.get(`${p}.bf`) === '1',
    commuteMinutesPerDay: num(`${p}.cm`),
    monthlyCommuteCost: num(`${p}.mc`),
    yearlyKørselsfradrag: num(`${p}.kf`),
    remoteDaysPerWeek: num(`${p}.rd`),
    extraVacationDays: num(`${p}.ev`),
    benefits,
  };
}

export function decodeState(): Package[] | null {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  try {
    const params = new URLSearchParams(hash);
    if (!Array.from(params.keys()).some(k => k.startsWith('a.') || k.startsWith('b.'))) return null;
    return [
      decodePackage(params, 'a', DEFAULT_NAMES[0]),
      decodePackage(params, 'b', DEFAULT_NAMES[1]),
    ];
  } catch { return null; }
}
