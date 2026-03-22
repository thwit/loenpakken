import type { Package } from '../types';
import styles from '../styles/InputRow.module.css';

interface Props {
  label: string;
  hint?: string;
  suffix?: string;
  packages: Package[];
  field: keyof Package;
  onChange: (id: string, field: keyof Package, value: unknown) => void;
  min?: number;
  max?: number;
  step?: number | 'any';
}

export function InputRow({ label, hint, suffix, packages, field, onChange, min, max, step }: Props) {
  return (
    <>
      <div className={styles.labelCell}>
        <span className={styles.label}>{label}</span>
        {hint && <span className={styles.hint}>{hint}</span>}
      </div>
      {packages.map(pkg => {
        const val = pkg[field] as number;
        return (
          <div key={pkg.id} className={styles.inputCell}>
            {suffix ? (
              <div className={styles.inputGroup}>
                <input
                  type="number"
                  className={styles.input}
                  value={val === 0 ? '' : val}
                  placeholder="0"
                  min={min}
                  max={max}
                  step={step}
                  onChange={e => onChange(pkg.id, field, parseFloat(e.target.value) || 0)}
                />
                <span className={styles.suffix}>{suffix}</span>
              </div>
            ) : (
              <input
                type="number"
                className={styles.input}
                value={val === 0 ? '' : val}
                placeholder="0"
                min={min}
                max={max}
                onChange={e => onChange(pkg.id, field, parseFloat(e.target.value) || 0)}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
