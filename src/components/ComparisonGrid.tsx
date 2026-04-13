import { useRef } from 'react';
import type { Dispatch } from 'react';
import type { Package } from '../types';
import styles from '../styles/ComparisonGrid.module.css';

type Action =
  | { type: 'UPDATE_FIELD'; id: string; field: keyof Package; value: unknown }
  | { type: 'ADD_BENEFIT'; id: string }
  | { type: 'UPDATE_BENEFIT'; id: string; benefitId: string; key: 'label' | 'valuePerMonth' | 'postTax'; value: unknown }
  | { type: 'REMOVE_BENEFIT'; id: string; benefitId: string }
  | { type: 'LOAD_STATE'; packages: Package[] };

interface Props {
  packages: Package[];
  dispatch: Dispatch<Action>;
}

interface FieldProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  suffix?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number | 'any';
  tooltip?: string;
  thousands?: boolean;
}

function Field({ label, value, onChange, suffix, placeholder = '0', min, max, step, tooltip, thousands }: FieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleThousandsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const cursorPos = el.selectionStart ?? 0;
    const raw = el.value.replace(/\./g, '');
    const num = parseInt(raw, 10) || 0;
    onChange(num);

    const newFormatted = num === 0 ? '' : num.toLocaleString('da-DK');
    const digitsBeforeCursor = el.value.slice(0, cursorPos).replace(/\./g, '').length;

    let digitCount = 0;
    let newCursor = newFormatted.length;
    if (digitsBeforeCursor === 0) {
      newCursor = 0;
    } else {
      for (let i = 0; i < newFormatted.length; i++) {
        if (newFormatted[i] !== '.') digitCount++;
        if (digitCount === digitsBeforeCursor) { newCursor = i + 1; break; }
      }
    }

    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(newCursor, newCursor);
    });
  };

  const inputEl = thousands ? (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      className={styles.input}
      value={value === 0 ? '' : value.toLocaleString('da-DK')}
      placeholder={placeholder}
      onChange={handleThousandsChange}
    />
  ) : (
    <input
      type="number"
      className={styles.input}
      value={value === 0 ? '' : value}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
    />
  );

  return (
    <div className={styles.fieldGroup}>
      <div className={styles.fieldLabelRow}>
        <span className={styles.fieldLabel}>{label}</span>
        {tooltip && (
          <span className={styles.tooltipWrap}>
            <span className={styles.tooltipIcon}>?</span>
            <span className={styles.tooltipText}>{tooltip}</span>
          </span>
        )}
      </div>
      {suffix ? (
        <div className={styles.inputGroup}>
          {inputEl}
          <span className={styles.suffix}>{suffix}</span>
        </div>
      ) : inputEl}
    </div>
  );
}


interface ColumnProps {
  pkg: Package;
  index: number;
  dispatch: Dispatch<Action>;
}

function PackageColumn({ pkg, index, dispatch }: ColumnProps) {
  const upd = (field: keyof Package, value: unknown) =>
    dispatch({ type: 'UPDATE_FIELD', id: pkg.id, field, value });

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <input
          className={index === 0 ? styles.packageNameActive : styles.packageNameInactive}
          value={pkg.name}
          onChange={e => upd('name', e.target.value)}
          aria-label="Pakkenavn"
          spellCheck={false}
        />
      </div>

      <div className={styles.sectionLabel}>Løn</div>

      <div className={styles.fieldRow}>
        <Field
          label="Månedlig grundløn (DKK)"
          value={pkg.monthlySalary}
          onChange={v => upd('monthlySalary', v)}
          thousands
        />
        <Field
          label="Årlig bonus (DKK)"
          value={pkg.yearlyBonus}
          onChange={v => upd('yearlyBonus', v)}
          thousands
        />
      </div>

      <div className={styles.fieldRow}>
        <Field
          label="Pension arbejdsgiver (%)"
          value={pkg.pensionPct}
          onChange={v => upd('pensionPct', v)}
          suffix="%"
          min={0}
          max={100}
        />
        <Field
          label="Pension eget bidrag (%)"
          value={pkg.ownPensionPct}
          onChange={v => upd('ownPensionPct', v)}
          suffix="%"
          min={0}
          max={100}
        />
      </div>

      <div className={styles.fieldRow}>
        <Field
          label="Ferietillæg (%)"
          value={pkg.ferietillaegPct}
          onChange={v => upd('ferietillaegPct', v)}
          suffix="%"
          min={0}
          max={100}
        />
        <Field
          label="Fritvalgskonto (%)"
          value={pkg.fritvalgPct}
          onChange={v => upd('fritvalgPct', v)}
          suffix="%"
          min={0}
          max={100}
          tooltip="Typisk 1–8% af grundlønnen, frit disponibelt (udbetaling, pension, ferie m.m.). Tælles her som ekstra løn oven i grundlønnen."
        />
      </div>

      <div className={styles.sectionLabel}>Arbejdstid &amp; Pendling</div>

      <div className={styles.fieldRow}>
        <Field
          label="Ugentlige timer"
          value={pkg.weeklyHours}
          onChange={v => upd('weeklyHours', v)}
        />
        <div className={styles.fieldGroup}>
          <div className={styles.fieldLabelRow}>
            <span className={styles.fieldLabel}>Betalt frokost</span>
            <span className={styles.tooltipWrap}>
              <span className={styles.tooltipIcon}>?</span>
              <span className={styles.tooltipText}>Hvis frokosten er ubetalt trækkes pausetiden fra din effektive timesats (typisk 30 min/dag = 2,5 t/uge).</span>
            </span>
          </div>
          <div className={styles.benefitCell}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={pkg.betaltFrokost}
                onChange={e => upd('betaltFrokost', e.target.checked)}
              />
            </label>
          </div>
        </div>
      </div>

      <div className={styles.fieldRow}>
        <Field
          label="Pendling (min/dag)"
          value={pkg.commuteMinutesPerDay}
          onChange={v => upd('commuteMinutesPerDay', v)}
          tooltip="Samlet pendlingstid per dag (tur-retur). Pendlingstid tæller med i din effektive timesats, da det er tid du bruger på jobbet."
        />
        <Field
          label="Transportomk. (md.)"
          value={pkg.monthlyCommuteCost}
          onChange={v => upd('monthlyCommuteCost', v)}
        />
      </div>

      <Field
        label="Hjemmearbejdsdage/uge"
        value={pkg.remoteDaysPerWeek}
        onChange={v => upd('remoteDaysPerWeek', Math.min(5, Math.max(0, v)))}
        min={0}
        max={5}
        step={0.5}
      />

      <div className={styles.sectionLabel}>Goder</div>

      <Field
        label="Ekstra feriedage"
        value={pkg.extraVacationDays}
        onChange={v => upd('extraVacationDays', v)}
        tooltip="Standardferien er 25 dage (5 uger). Angiv kun dage ud over dette. Ekstra feriedage forbedrer din effektive timesats, da du får samme løn for færre arbejdstimer."
      />

      {pkg.benefits.map(b => (
        <div key={b.id} className={styles.benefitRow}>
          <input
            className={styles.benefitLabelInput}
            type="text"
            value={b.label}
            placeholder="Navn på gode, tillæg eller udgift"
            onChange={e => dispatch({ type: 'UPDATE_BENEFIT', id: pkg.id, benefitId: b.id, key: 'label', value: e.target.value })}
          />
          <div className={styles.inputGroup}>
            <input
              type="number"
              className={styles.input}
              value={b.valuePerMonth === 0 ? '' : b.valuePerMonth}
              placeholder="0"
              onChange={e => dispatch({ type: 'UPDATE_BENEFIT', id: pkg.id, benefitId: b.id, key: 'valuePerMonth', value: parseFloat(e.target.value) || 0 })}
            />
            <span className={styles.suffix}>kr/md.</span>
          </div>
          <div className={styles.taxPill}>
            <button
              className={`${styles.taxPillBtn} ${!b.postTax ? styles.taxPillBtnActive : ''}`}
              onClick={() => dispatch({ type: 'UPDATE_BENEFIT', id: pkg.id, benefitId: b.id, key: 'postTax', value: false })}
            >Før skat</button>
            <button
              className={`${styles.taxPillBtn} ${b.postTax ? styles.taxPillBtnActive : ''}`}
              onClick={() => dispatch({ type: 'UPDATE_BENEFIT', id: pkg.id, benefitId: b.id, key: 'postTax', value: true })}
            >Efter skat</button>
          </div>
          <button
            className={styles.removeBenefitButton}
            onClick={() => dispatch({ type: 'REMOVE_BENEFIT', id: pkg.id, benefitId: b.id })}
            aria-label="Fjern gode"
          >×</button>
        </div>
      ))}

      <button
        className={styles.addBenefitButton}
        onClick={() => dispatch({ type: 'ADD_BENEFIT', id: pkg.id })}
      >+ Tilføj gode, tillæg eller udgift</button>
    </div>
  );
}

export function ComparisonGrid({ packages, dispatch }: Props) {
  return (
    <div className={styles.grid}>
      {packages.map((pkg, i) => (
        <PackageColumn
          key={pkg.id}
          pkg={pkg}
          index={i}
          dispatch={dispatch}
        />
      ))}
    </div>
  );
}
