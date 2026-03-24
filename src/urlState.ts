import { deflateSync, inflateSync, strToU8, strFromU8 } from 'fflate';
import type { Package, CustomBenefit } from './types';

// ── Compact schema (short keys to reduce payload size) ──────────────────────
interface Compact {
  i: string;   // id
  n: string;   // name
  ms: number;  // monthlySalary
  pp: number;  // pensionPct
  op: number;  // ownPensionPct
  yb: number;  // yearlyBonus
  fp: number;  // ferietillaegPct
  wh: number;  // weeklyHours
  bf: boolean; // betaltFrokost
  cm: number;  // commuteMinutesPerDay
  mc: number;  // monthlyCommuteCost
  rd: number;  // remoteDaysPerWeek
  ev: number;  // extraVacationDays
  b: Array<{ i: string; l: string; v: number }>; // benefits
}

function toCompact(pkg: Package): Compact {
  return {
    i: pkg.id, n: pkg.name,
    ms: pkg.monthlySalary, pp: pkg.pensionPct, op: pkg.ownPensionPct,
    yb: pkg.yearlyBonus, fp: pkg.ferietillaegPct,
    wh: pkg.weeklyHours, bf: pkg.betaltFrokost,
    cm: pkg.commuteMinutesPerDay, mc: pkg.monthlyCommuteCost,
    rd: pkg.remoteDaysPerWeek, ev: pkg.extraVacationDays,
    b: pkg.benefits.map(b => ({ i: b.id, l: b.label, v: b.valuePerMonth })),
  };
}

function fromCompact(c: Compact): Package {
  const benefits: CustomBenefit[] = (c.b ?? []).map(b => ({
    id: typeof b.i === 'string' ? b.i : crypto.randomUUID(),
    label: typeof b.l === 'string' ? b.l : '',
    valuePerMonth: typeof b.v === 'number' ? b.v : 0,
  }));
  return {
    id: typeof c.i === 'string' ? c.i : crypto.randomUUID(),
    name: typeof c.n === 'string' ? c.n : 'Pakke',
    monthlySalary: c.ms ?? 0,
    pensionPct: c.pp ?? 0,
    ownPensionPct: c.op ?? 0,
    yearlyBonus: c.yb ?? 0,
    ferietillaegPct: c.fp ?? 0,
    weeklyHours: c.wh ?? 37,
    betaltFrokost: typeof c.bf === 'boolean' ? c.bf : true,
    commuteMinutesPerDay: c.cm ?? 0,
    monthlyCommuteCost: c.mc ?? 0,
    remoteDaysPerWeek: c.rd ?? 0,
    extraVacationDays: c.ev ?? 0,
    benefits,
  };
}

// ── Encoding ─────────────────────────────────────────────────────────────────
function toUrlSafeBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromUrlSafeBase64(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}

export function encodeState(packages: Package[]): void {
  const json = JSON.stringify(packages.map(toCompact));
  const compressed = deflateSync(strToU8(json), { level: 9 });
  const b64 = toUrlSafeBase64(compressed);
  history.replaceState(null, '', `#s=${b64}`);
}

export function decodeState(): Package[] | null {
  const hash = window.location.hash;
  const match = hash.match(/^#s=(.+)$/);
  if (!match) return null;
  try {
    const bytes = fromUrlSafeBase64(match[1]);
    const json = strFromU8(inflateSync(bytes));
    const raw = JSON.parse(json);
    if (!Array.isArray(raw) || raw.length !== 2) return null;
    return (raw as Compact[]).map(fromCompact);
  } catch { return null; }
}
