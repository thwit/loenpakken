import type { CalculationResult } from '../types';
import { WEEKS_PER_YEAR } from '../constants';
import { formatDKK } from '../calculations';
import styles from '../styles/ResultsPanel.module.css';

export type Tab = 'timesats' | 'månedligt' | 'årligt';
export type SummaryMode = 'gross' | 'net';

interface Props {
  result: CalculationResult;
  variant: 'light' | 'dark';
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  summaryMode: SummaryMode;
  onSummaryModeChange: (mode: SummaryMode) => void;
  compareResult?: CalculationResult;
}

export function ResultsPanel({ result, variant, tab, onTabChange, summaryMode, onSummaryModeChange, compareResult }: Props) {
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
      {/* MODE TOGGLE */}
      <div className={styles.modeToggle}>
        <button
          className={`${styles.modeBtn} ${summaryMode === 'gross' ? styles.modeBtnActive : ''}`}
          onClick={() => onSummaryModeChange('gross')}
        >Før skat</button>
        <button
          className={`${styles.modeBtn} ${summaryMode === 'net' ? styles.modeBtnActive : ''}`}
          onClick={() => onSummaryModeChange('net')}
        >Efter skat &amp; udgifter</button>
      </div>

      {/* HEADER: main focus + stacked secondary */}
      <div className={styles.headerCols}>
        <div className={styles.headerColMain}>
          <div className={styles.headerLabel}>
            Effektiv timesats
            <span className={styles.tooltipWrapper}>
              <span className={styles.tooltipTrigger}>?</span>
              <span className={`${styles.tooltipBox} ${styles.tooltipBoxLeft}`}>
                <span className={styles.tooltipText}>
                  Den effektive timesats afspejler det samlede tidsforbrug, du binder dig til ved at tage jobbet — inkl. pendlingstid og betalte pauser. Det er hvad din tid reelt er værd pr. time, du er væk hjemmefra.
                </span>
              </span>
            </span>
          </div>
          <div className={styles.headerValue}>
            {summaryMode === 'gross'
              ? Math.round(result.effectiveHourlyRateIncCommute).toLocaleString('da-DK')
              : Math.round(result.netEffectiveHourlyRateIncCommute).toLocaleString('da-DK')}
            <span className={styles.headerUnit}>kr/t</span>
          </div>
          {summaryMode === 'gross'
            ? pctDiff(result.effectiveHourlyRateIncCommute, compareResult?.effectiveHourlyRateIncCommute ?? 0)
            : pctDiff(result.netEffectiveHourlyRateIncCommute, compareResult?.netEffectiveHourlyRateIncCommute ?? 0)}
        </div>
        <div className={styles.headerColStack}>
          <div className={styles.headerColSub}>
            <div className={styles.headerLabelSub}>Timesats</div>
            <div className={styles.headerValueSubRow}>
              <div className={styles.headerValueSub}>
                {summaryMode === 'gross'
                  ? Math.round(result.contractualHourlyRate).toLocaleString('da-DK')
                  : Math.round(result.netContractualHourlyRate).toLocaleString('da-DK')}
                <span className={styles.headerUnitSub}>kr/t</span>
              </div>
              {summaryMode === 'gross'
                ? pctDiff(result.contractualHourlyRate, compareResult?.contractualHourlyRate ?? 0)
                : pctDiff(result.netContractualHourlyRate, compareResult?.netContractualHourlyRate ?? 0)}
            </div>
          </div>
          <div className={styles.headerColSub}>
            {summaryMode === 'gross' ? (
              <>
                <div className={styles.headerLabelSub}>Månedligt total</div>
                <div className={styles.headerValueSub}>
                  {Math.round(result.totalAnnualComp / 12).toLocaleString('da-DK')}
                  <span className={styles.headerUnitSub}>kr/md.</span>
                </div>
              </>
            ) : (
              <>
                <div className={styles.headerLabelSub}>
                  Netto udbetalt
                  <span className={styles.tooltipWrapper}>
                    <span className={styles.tooltipTrigger}>?</span>
                    <span className={styles.tooltipBox}>
                      <span className={styles.tooltipRow}>
                        <span>AM-bidrag</span>
                        <span>{formatDKK(result.taxBreakdown.amBidrag / 12)}</span>
                      </span>
                      <span className={`${styles.tooltipRow} ${styles.tooltipFradrag}`}>
                        <span>– Beskæftigelsesfradrag</span>
                        <span>{formatDKK(result.taxBreakdown.beskæftigelsesfradrag / 12)}</span>
                      </span>
                      <span className={`${styles.tooltipRow} ${styles.tooltipFradrag}`}>
                        <span>– Personfradrag</span>
                        <span>{formatDKK(result.taxBreakdown.personfradrag / 12)}</span>
                      </span>
                      <span className={styles.tooltipRow}>
                        <span>Bundskat</span>
                        <span>{formatDKK(result.taxBreakdown.bundskat / 12)}</span>
                      </span>
                      <span className={styles.tooltipRow}>
                        <span>Kommuneskat</span>
                        <span>{formatDKK(result.taxBreakdown.kommuneskat / 12)}</span>
                      </span>
                      {result.taxBreakdown.mellemskat > 0 && (
                        <span className={styles.tooltipRow}>
                          <span>Mellemskat</span>
                          <span>{formatDKK(result.taxBreakdown.mellemskat / 12)}</span>
                        </span>
                      )}
                      {result.taxBreakdown.topskat > 0 && (
                        <span className={styles.tooltipRow}>
                          <span>Topskat</span>
                          <span>{formatDKK(result.taxBreakdown.topskat / 12)}</span>
                        </span>
                      )}
                      {result.taxBreakdown.toptopskat > 0 && (
                        <span className={styles.tooltipRow}>
                          <span>Toptopskat</span>
                          <span>{formatDKK(result.taxBreakdown.toptopskat / 12)}</span>
                        </span>
                      )}
                      <span className={`${styles.tooltipRow} ${styles.tooltipTotal}`}>
                        <span>Total skat</span>
                        <span>{formatDKK(result.taxBreakdown.total / 12)}</span>
                      </span>
                    </span>
                  </span>
                </div>
                <div className={styles.headerValueSubRow}>
                  <div className={styles.headerValueSub}>
                    {Math.round(result.estimatedMonthlyTakeHome).toLocaleString('da-DK')}
                    <span className={styles.headerUnitSub}>kr/md.</span>
                  </div>
                  {pctDiff(result.estimatedMonthlyTakeHome, compareResult?.estimatedMonthlyTakeHome ?? 0)}
                </div>
              </>
            )}
          </div>
          <div className={styles.headerColSub}>
            <div className={styles.headerLabelSub}>
              {summaryMode === 'gross' ? 'Årligt total' : 'Årligt netto'}
            </div>
            <div className={styles.headerValueSub}>
              {summaryMode === 'gross'
                ? Math.round(result.totalAnnualComp).toLocaleString('da-DK')
                : Math.round(result.netMonthlyAfterExpenses * 12).toLocaleString('da-DK')}
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
