import type { Package } from '../types';
import styles from '../styles/BenefitRow.module.css';

interface Props {
  label: string;
  benefitKey: 'healthInsurance' | 'freeFood' | 'phoneComputerCar';
  packages: Package[];
  onChange: (
    id: string,
    benefit: 'healthInsurance' | 'freeFood' | 'phoneComputerCar',
    key: 'enabled' | 'valuePerMonth',
    value: unknown
  ) => void;
}

export function BenefitRow({ label, benefitKey, packages, onChange }: Props) {
  return (
    <>
      <div className={styles.labelCell}>
        <span className={styles.label}>{label}</span>
      </div>
      {packages.map(pkg => {
        const benefit = pkg[benefitKey];
        return (
          <div key={pkg.id} className={styles.benefitCell}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={benefit.enabled}
                onChange={e => onChange(pkg.id, benefitKey, 'enabled', e.target.checked)}
              />
              <span className={styles.toggleLabel}>Inkluderet</span>
            </label>
            {benefit.enabled && (
              <input
                type="number"
                className={styles.valueInput}
                value={benefit.valuePerMonth === 0 ? '' : benefit.valuePerMonth}
                placeholder="DKK/mdr"
                onChange={e =>
                  onChange(pkg.id, benefitKey, 'valuePerMonth', parseFloat(e.target.value) || 0)
                }
              />
            )}
          </div>
        );
      })}
    </>
  );
}
