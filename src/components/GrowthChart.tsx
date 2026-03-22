import { useState } from 'react';
import type { CalculationResult } from '../types';
import styles from '../styles/GrowthChart.module.css';

interface Props {
  results: CalculationResult[];
  colors: string[];
  packageNames: string[];
}

const YEARS = 8;
const numFmt = new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 });
const fmt = (n: number) => numFmt.format(Math.round(n));

export function GrowthChart({ results, colors, packageNames }: Props) {
  const [raise, setRaise] = useState(3);

  const series = results.map(r => {
    const m = r.totalAnnualComp / 12;
    return Array.from({ length: YEARS }, (_, y) => m * (1 + raise / 100) ** y);
  });

  return (
    <div className={styles.card}>
      {/* ── Header ── */}
      <div className={styles.topBar}>
        <span className={styles.title}>Lønudvikling</span>
        <div className={styles.sliderGroup}>
          <span className={styles.sliderLabel}>Årlig stigning</span>
          <input
            type="range" min={0} max={20} step={0.5}
            value={raise}
            onChange={e => setRaise(parseFloat(e.target.value))}
            className={styles.slider}
          />
          <span className={styles.sliderValue}>{raise.toFixed(1)}%</span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thYear}>År</th>
              {results.map((_, i) => (
                <th key={i} className={styles.thPkg} style={{ borderTopColor: colors[i] }}>
                  {results.length > 1 ? packageNames[i] : 'Månedlig kompensation'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: YEARS }, (_, y) => (
              <tr key={y} className={y % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                <td className={styles.tdYear}>{y === 0 ? 'Nu' : `+${y} år`}</td>
                {series.map((pts, si) => (
                  <td key={si} className={styles.tdVal}>
                    {fmt(pts[y])} kr.
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
