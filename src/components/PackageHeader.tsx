import type { CSSProperties } from 'react';
import type { Package } from '../types';
import styles from '../styles/ComparisonGrid.module.css';

interface Props {
  pkg: Package;
  color: string;
  canRemove: boolean;
  onNameChange: (name: string) => void;
  onRemove: () => void;
}

export function PackageHeader({ pkg, color, canRemove, onNameChange, onRemove }: Props) {
  return (
    <div
      className={styles.packageHeader}
      style={{ '--pkg-color': color } as CSSProperties}
    >
      <input
        className={styles.packageNameInput}
        value={pkg.name}
        onChange={e => onNameChange(e.target.value)}
        aria-label="Pakkenavn"
        spellCheck={false}
      />
      <button
        className={styles.removeButton}
        onClick={onRemove}
        aria-label="Fjern pakke"
        title="Fjern pakke"
        style={{ visibility: canRemove ? 'visible' : 'hidden' }}
      >
        ×
      </button>
    </div>
  );
}
