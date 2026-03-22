import { useReducer, useEffect } from 'react';
import type { Package } from './types';
import { createDefaultPackage, PKG_COLORS } from './constants';
import { encodeState, decodeState } from './urlState';
import { calculate, normalizeBreakdowns } from './calculations';
import { ComparisonGrid } from './components/ComparisonGrid';
import { ResultsPanel } from './components/ResultsPanel';
import { GrowthChart } from './components/GrowthChart';
import { ShareButton } from './components/ShareButton';
import styles from './App.module.css';

type Action =
  | { type: 'ADD_PACKAGE' }
  | { type: 'REMOVE_PACKAGE'; id: string }
  | { type: 'UPDATE_FIELD'; id: string; field: keyof Package; value: unknown }
  | { type: 'UPDATE_BENEFIT'; id: string; benefit: 'healthInsurance' | 'freeFood' | 'phoneComputerCar'; key: 'enabled' | 'valuePerMonth'; value: unknown }
  | { type: 'LOAD_STATE'; packages: Package[] };

function reducer(state: Package[], action: Action): Package[] {
  switch (action.type) {
    case 'ADD_PACKAGE':
      if (state.length >= 2) return state;
      return [...state, createDefaultPackage(`Pakke ${state.length + 1}`)];
    case 'REMOVE_PACKAGE':
      return state.filter(p => p.id !== action.id);
    case 'UPDATE_FIELD':
      return state.map(p => {
        if (p.id !== action.id) return p;
        let value = action.value;
        if (action.field === 'remoteDaysPerWeek' && typeof value === 'number') {
          value = Math.min(5, Math.max(0, value));
        }
        return { ...p, [action.field]: value };
      });
    case 'UPDATE_BENEFIT':
      return state.map(p => {
        if (p.id !== action.id) return p;
        return {
          ...p,
          [action.benefit]: { ...p[action.benefit], [action.key]: action.value },
        };
      });
    case 'LOAD_STATE':
      return action.packages;
    default:
      return state;
  }
}

const defaultState: Package[] = [
  createDefaultPackage('Pakke 1'),
];

export default function App() {
  const [packages, dispatch] = useReducer(reducer, defaultState, () => {
    const decoded = decodeState();
    return decoded ?? defaultState;
  });

  useEffect(() => {
    encodeState(packages);
  }, [packages]);

  const rawResults = packages.map(pkg => calculate(pkg));
  const normalizedBreakdowns = normalizeBreakdowns(rawResults);
  const results = rawResults.map((r, i) => ({ ...r, breakdown: normalizedBreakdowns[i] }));

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerBrand}>
            <div className={styles.logo}>
              <span className={styles.logoDot} />
              Lønpakken
            </div>
            <p className={styles.tagline}>Sammenlign jobtilbud og forstå din reelle løn</p>
          </div>
          <ShareButton />
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.contentWrapper}>
          <div className={styles.tableCard}>
            <ComparisonGrid packages={packages} dispatch={dispatch} />
            {packages.length < 2 && (
              <button
                className={styles.addPackageButton}
                onClick={() => dispatch({ type: 'ADD_PACKAGE' })}
              >
                <span className={styles.addPackageIcon}>+</span>
                <span>Tilføj pakke</span>
              </button>
            )}
          </div>
          <div
            className={styles.resultsRow}
            style={{
              '--pkg-count': packages.length,
              '--add-col': packages.length < 2 ? '100px' : '0px',
            } as React.CSSProperties}
          >
            <div className={styles.resultsSpacer} />
            {packages.map((pkg, i) => (
              <ResultsPanel key={pkg.id} result={results[i]} color={PKG_COLORS[i % PKG_COLORS.length]} />
            ))}
            {packages.length < 2 && <div className={styles.resultsAddSpacer} />}
          </div>
          <GrowthChart
            results={results}
            colors={packages.map((_, i) => PKG_COLORS[i % PKG_COLORS.length])}
            packageNames={packages.map(p => p.name)}
          />
        </div>
      </main>
    </div>
  );
}
