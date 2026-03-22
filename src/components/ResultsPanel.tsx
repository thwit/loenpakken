import type { CSSProperties } from 'react';
import type { CalculationResult } from '../types';
import { formatDKK } from '../calculations';
import styles from '../styles/ResultsPanel.module.css';

interface Props {
  result: CalculationResult;
  color: string;
}

export function ResultsPanel({ result, color }: Props) {

  return (
    <div
      className={styles.panel}
      style={{ '--pkg-color': color } as CSSProperties}
    >
      <div className={styles.headline}>
        <div className={styles.headlineLabel}>Månedlig / Årlig kompensation</div>
        <div className={styles.headlineValue}>
          {formatDKK(result.totalAnnualComp / 12)}
          <span className={styles.headlineSep}> / </span>
          {formatDKK(result.totalAnnualComp)}
        </div>
      </div>
      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Timeløn eksl. pendling</span>
          <span className={styles.metricValue}>{formatDKK(result.effectiveHourlyRateExCommute)}/t</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Timeløn inkl. pendling</span>
          <span className={styles.metricValue}>{formatDKK(result.effectiveHourlyRateIncCommute)}/t</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Estimeret nettoudbetaling/mdr</span>
          <span className={styles.metricValue}>{formatDKK(result.estimatedMonthlyTakeHome)}</span>
        </div>
      </div>
      <div className={styles.breakdown}>
        <div className={styles.breakdownHeader}>
          <span className={styles.breakdownTitle}>Fordeling</span>
          <span className={styles.breakdownColLabel}>Månedlig</span>
          <span className={styles.breakdownColLabel}>Årlig</span>
        </div>
        {result.breakdown.length === 0 ? (
          <div className={styles.emptyState}>Udfyld felterne ovenfor</div>
        ) : (
          result.breakdown.map((item, i) => {
            const cls = item.monthlyDKK < 0 ? styles.negative : styles.positive;
            const sign = item.monthlyDKK < 0 ? '−' : '+';
            const monthly = formatDKK(Math.abs(item.monthlyDKK));
            const yearly = formatDKK(Math.abs(item.monthlyDKK * 12));
            return (
              <div key={i} className={styles.breakdownItem}>
                <span className={styles.breakdownLabel}>{item.label}</span>
                <span className={cls}>{sign}&thinsp;{monthly}</span>
                <span className={cls}>{sign}&thinsp;{yearly}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
