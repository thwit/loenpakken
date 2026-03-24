import { useReducer, useEffect, useState } from 'react';
import type { Package } from './types';
import { createDefaultPackage } from './constants';
import { encodeState, decodeState } from './urlState';
import { calculate, normalizeBreakdowns } from './calculations';
import { ComparisonGrid } from './components/ComparisonGrid';
import { ResultsPanel, type Tab } from './components/ResultsPanel';
import { ShareButton } from './components/ShareButton';
import styles from './App.module.css';

type Action =
  | { type: 'UPDATE_FIELD'; id: string; field: keyof Package; value: unknown }
  | { type: 'ADD_BENEFIT'; id: string }
  | { type: 'UPDATE_BENEFIT'; id: string; benefitId: string; key: 'label' | 'valuePerMonth'; value: unknown }
  | { type: 'REMOVE_BENEFIT'; id: string; benefitId: string }
  | { type: 'LOAD_STATE'; packages: Package[] };

function reducer(state: Package[], action: Action): Package[] {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return state.map(p => {
        if (p.id !== action.id) return p;
        let value = action.value;
        if (action.field === 'remoteDaysPerWeek' && typeof value === 'number') {
          value = Math.min(5, Math.max(0, value));
        }
        return { ...p, [action.field]: value };
      });
    case 'ADD_BENEFIT':
      return state.map(p => {
        if (p.id !== action.id) return p;
        return { ...p, benefits: [...p.benefits, { id: crypto.randomUUID(), label: '', valuePerMonth: 0 }] };
      });
    case 'UPDATE_BENEFIT':
      return state.map(p => {
        if (p.id !== action.id) return p;
        return {
          ...p,
          benefits: p.benefits.map(b =>
            b.id === action.benefitId ? { ...b, [action.key]: action.value } : b
          ),
        };
      });
    case 'REMOVE_BENEFIT':
      return state.map(p => {
        if (p.id !== action.id) return p;
        return { ...p, benefits: p.benefits.filter(b => b.id !== action.benefitId) };
      });
    case 'LOAD_STATE':
      return action.packages;
    default:
      return state;
  }
}

const defaultState: Package[] = [
  createDefaultPackage('Tilbud A'),
  createDefaultPackage('Tilbud B'),
];

export default function App() {
  const [packages, dispatch] = useReducer(reducer, defaultState, () => {
    const decoded = decodeState();
    if (decoded && decoded.length === 2) return decoded;
    return defaultState;
  });

  useEffect(() => {
    encodeState(packages);
  }, [packages]);

  const [tab, setTab] = useState<Tab>('timesats');
  const [darkMode, setDarkMode] = useState(false);

  const rawResults = packages.map(pkg => calculate(pkg));
  const normalizedBreakdowns = normalizeBreakdowns(rawResults);
  const results = rawResults.map((r, i) => ({ ...r, breakdown: normalizedBreakdowns[i] }));

  return (
    <div className={styles.app} data-theme={darkMode ? 'dark' : undefined}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.logo}>Lønpakken</span>
          <div className={styles.headerActions}>
            <button
              className={styles.darkToggle}
              onClick={() => setDarkMode(d => !d)}
              aria-label="Skift farvetema"
            >
              {darkMode ? '☀' : '☽'}
            </button>
            <ShareButton />
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <ComparisonGrid packages={packages} dispatch={dispatch} />
        <section className={styles.resultsSection}>
          <h2 className={styles.resultsHeading}>Endelig lønpakke</h2>
          <div className={styles.resultsCards}>
            {packages.map((pkg, i) => (
              <ResultsPanel
                key={pkg.id}
                result={results[i]}
                variant={i === 1 ? 'dark' : 'light'}
                tab={tab}
                onTabChange={setTab}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
