import type { CalculationResult } from '../types';
import { WEEKS_PER_YEAR } from '../constants';
import styles from '../styles/ResultsPanel.module.css';

export type Tab = 'timesats' | 'månedligt' | 'årligt';

interface Props {
  result: CalculationResult;
  variant: 'light' | 'dark';
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  compareResult?: CalculationResult;
}

export function ResultsPanel({ result, variant, tab, onTabChange, compareResult }: Props) {
  const isDark = variant === 'dark';
  const panelClass = `${styles.panel} ${isDark ? styles.panelDark : styles.panelLight}`;

  const hasLunch = result.lunchHourlyImpact !== 0;
  const hasVacationRate = result.vacationHourlyImpact !== 0;
  const hasCommute = result.commuteHourlyImpact !== 0;

  function fmtRate(n: number) {
    return `${Math.round(Math.abs(n)).toLocaleString('da-DK')} kr/t`;
  }

  function pctDiff(current: number, base: number) {
    if (!compareResult || base === 0) return null;
    const pct = ((current - base) / base) * 100;
    const sign = pct >= 0 ? '+' : '−';
    const cls = pct >= 0 ? styles.diffPos : styles.diffNeg;
    return <span className={cls}>{sign}{Math.abs(pct).toFixed(1)}%</span>;
  }
  return (
    <div className={panelClass}>
      {/* HEADER: main focus + stacked secondary */}
      <div className={styles.headerCols}>
        <div className={styles.headerColMain}>
          <div className={styles.headerLabel}>Effektiv timesats</div>
          <div className={styles.headerValue}>
            {Math.round(result.effectiveHourlyRateIncCommute).toLocaleString('da-DK')}
            <span className={styles.headerUnit}>kr/t</span>
          </div>
          {pctDiff(result.effectiveHourlyRateIncCommute, compareResult?.effectiveHourlyRateIncCommute ?? 0)}
        </div>
        <div className={styles.headerColStack}>
          <div className={styles.headerColSub}>
            <div className={styles.headerLabelSub}>Timesats</div>
            <div className={styles.headerValueSub}>
              {Math.round(result.contractualHourlyRate).toLocaleString('da-DK')}
              <span className={styles.headerUnitSub}>kr/t</span>
            </div>
            {pctDiff(result.contractualHourlyRate, compareResult?.contractualHourlyRate ?? 0)}
          </div>
          <div className={styles.headerColSub}>
            <div className={styles.headerLabelSub}>Månedligt total</div>
            <div className={styles.headerValueSub}>
              {Math.round(result.totalAnnualComp / 12).toLocaleString('da-DK')}
              <span className={styles.headerUnitSub}>kr/md.</span>
            </div>
          </div>
          <div className={styles.headerColSub}>
            <div className={styles.headerLabelSub}>Årligt total</div>
            <div className={styles.headerValueSub}>
              {Math.round(result.totalAnnualComp).toLocaleString('da-DK')}
              <span className={styles.headerUnitSub}>kr/år</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABBED BREAKDOWN */}
      <div className={styles.tabbedSection}>
        <div className={styles.tabs}>
          {(['timesats', 'månedligt', 'årligt'] as Tab[]).map(t => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => onTabChange(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {tab === 'timesats' ? (
            /* ── Hourly rate waterfall ── */
            <>
              <div className={styles.wfRow}>
                <span className={styles.wfLabel}>Timesats</span>
                <span className={styles.wfBase}>{fmtRate(result.baseHourlyRate)}</span>
              </div>
              {hasVacationRate && (
                <div className={styles.wfRow}>
                  <span className={styles.wfLabel}>Ekstra feriedage</span>
                  <span className={styles.wfPos}>+{fmtRate(result.vacationHourlyImpact)}</span>
                </div>
              )}
              {hasLunch && (
                <div className={styles.wfRow}>
                  <span className={styles.wfLabel}>Frokostpause (ubetalt)</span>
                  <span className={styles.wfNeg}>−{fmtRate(result.lunchHourlyImpact)}</span>
                </div>
              )}
              {hasCommute && (
                <div className={styles.wfRow}>
                  <span className={styles.wfLabel}>Pendlingstid</span>
                  <span className={styles.wfNeg}>−{fmtRate(result.commuteHourlyImpact)}</span>
                </div>
              )}
              {(hasLunch || hasVacationRate || hasCommute) && (
                <div className={`${styles.wfRow} ${styles.wfTotalRow}`}>
                  <span className={styles.wfLabel}>Effektiv timesats</span>
                  <span className={styles.wfTotal}>{fmtRate(result.effectiveHourlyRateIncCommute)}</span>
                </div>
              )}
            </>
          ) : (
            /* ── Time impact (månedligt / årligt) ── */
            (() => {
              const isMonthly = tab === 'månedligt';
              const HOURS_PER_DAY = 7.4;

              // Annual hours for each factor
              const lunchHoursPerYear = 2.5 * WEEKS_PER_YEAR;
              const commuteHoursAnnual = result.commuteHoursPerYear;
              const vacationHoursPerYear = result.extraVacationDays * HOURS_PER_DAY;

              const fmt = (annualHours: number) => {
                if (isMonthly) {
                  const val = Math.round((annualHours / 12) * 10) / 10;
                  return `${val.toLocaleString('da-DK')} t/md.`;
                } else {
                  const val = Math.round((annualHours / HOURS_PER_DAY) * 10) / 10;
                  return `${val.toLocaleString('da-DK')} arb. dage/år`;
                }
              };

              const hasVacation = result.extraVacationDays > 0;
              const hasAnyRow = hasLunch || hasCommute || hasVacation;

              const totalHours =
                (hasVacation ? vacationHoursPerYear : 0) -
                (hasLunch ? lunchHoursPerYear : 0) -
                (hasCommute ? commuteHoursAnnual : 0);

              return hasAnyRow ? (
                <>
                  {hasLunch && (
                    <div className={styles.wfRow}>
                      <span className={styles.wfLabel}>Frokostpause (ubetalt)</span>
                      <span className={styles.wfNeg}>−{fmt(lunchHoursPerYear)}</span>
                    </div>
                  )}
                  {hasVacation && (
                    <div className={styles.wfRow}>
                      <span className={styles.wfLabel}>Ekstra feriedage</span>
                      <span className={styles.wfPos}>+{fmt(vacationHoursPerYear)}</span>
                    </div>
                  )}
                  {hasCommute && (
                    <div className={styles.wfRow}>
                      <span className={styles.wfLabel}>Pendlingstid</span>
                      <span className={styles.wfNeg}>−{fmt(commuteHoursAnnual)}</span>
                    </div>
                  )}
                  <div className={`${styles.wfRow} ${styles.wfTotalRow}`}>
                    <span className={styles.wfLabel}>Netto</span>
                    <span className={totalHours >= 0 ? styles.wfTotal : styles.wfNeg}>
                      {totalHours >= 0 ? '+' : '−'}{fmt(Math.abs(totalHours))}
                    </span>
                  </div>
                </>
              ) : (
                <div className={styles.emptyState}>Ingen tidseffekter at vise</div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}
