# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # TypeScript compile + Vite production build (output: dist/)
npm run lint      # ESLint on all TS/TSX files
npm run preview   # Preview production build locally
```

No test runner is configured.

## Architecture

**Lønpakken** is a Danish salary package comparison tool — a client-side-only React 19 + Vite + TypeScript SPA. Users can compare up to 2 job offers side by side with full compensation breakdown (pension, bonuses, benefits, commute impact) and salary growth projections.

State is persisted entirely in the URL hash (base64-encoded JSON), enabling shareability with zero backend.

### Key files

| File | Role |
|---|---|
| `src/App.tsx` | Root component; owns all package state via `useReducer` |
| `src/types.ts` | Core interfaces: `Package`, `CalculationResult`, `CustomBenefit` |
| `src/constants.ts` | Package color palette (`--c0`–`--c3`), default values, `createPackage()` factory |
| `src/calculations.ts` | Pure functions computing total comp, hourly rates, breakdown line items |
| `src/urlState.ts` | Encode/decode state to/from URL hash (base64 + JSON) |

### Component tree

```
App.tsx (useReducer)
└── ComparisonGrid       — outer grid layout + section headers
    ├── PackageHeader    — editable package name + remove button
    ├── InputRow         — labeled numeric input (salary, hours, etc.)
    ├── ResultsPanel     — computed results: annual comp, hourly rates, monthly take-home, breakdown table
    └── GrowthChart      — 8-year projection table with adjustable annual raise % slider
ShareButton              — copies shareable URL to clipboard
```

### Styling

Pure **CSS Modules** + global CSS custom properties. No utility framework.

- `src/styles/global.css` — defines all design tokens as CSS variables
- Each component has a paired `src/styles/ComponentName.module.css`
- `App.module.css` lives alongside `App.tsx`

**Design tokens (in `global.css`):**
- Colors: `--bg`, `--surface`, `--surface-2`, `--border`, `--border-light`, `--text-1/2/3`
- Package accent colors: `--c0` (teal) · `--c1` (orange) · `--c2` (blue) · `--c3` (purple)
- Typography: DM Serif Display (display), Plus Jakarta Sans (body), DM Mono (numbers)
- Misc: `--radius` (5px), `--shadow`

Package columns are identified by a `data-package-index` attribute on the column root, which drives accent color via CSS variable overrides.

### Data model

`Package` fields of note:
- **Salary:** `monthlySalary`, `pensionPct`, `ownPensionPct`, `yearlyBonus`, `ferietillaegPct`, `fritvalgPct`
- **Work conditions:** `weeklyHours`, `betaltFrokost` (boolean), `commuteMinutesPerDay`, `monthlyCommuteCost`, `remoteDaysPerWeek`
- **Benefits:** `benefits: CustomBenefit[]` — each has `{ id, label, valuePerMonth }`; user-defined, no fixed set
- **Extra:** `extraVacationDays`, `id` (UUID), `name`

Tax rate is hardcoded at 35% for estimated monthly take-home.
