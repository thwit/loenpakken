import type { Dispatch } from 'react';
import type { Package } from '../types';
import { PackageHeader } from './PackageHeader';
import { InputRow } from './InputRow';
import { BenefitRow } from './BenefitRow';
import { PKG_COLORS } from '../constants';
import styles from '../styles/ComparisonGrid.module.css';

type Action =
  | { type: 'ADD_PACKAGE' }
  | { type: 'REMOVE_PACKAGE'; id: string }
  | { type: 'UPDATE_FIELD'; id: string; field: keyof Package; value: unknown }
  | { type: 'UPDATE_BENEFIT'; id: string; benefit: 'healthInsurance' | 'freeFood' | 'phoneComputerCar'; key: 'enabled' | 'valuePerMonth'; value: unknown }
  | { type: 'LOAD_STATE'; packages: Package[] };

interface Props {
  packages: Package[];
  dispatch: Dispatch<Action>;
}

export function ComparisonGrid({ packages, dispatch }: Props) {
  const n = packages.length;

  const updateField = (id: string, field: keyof Package, value: unknown) =>
    dispatch({ type: 'UPDATE_FIELD', id, field, value });

  const updateBenefit = (
    id: string,
    benefit: 'healthInsurance' | 'freeFood' | 'phoneComputerCar',
    key: 'enabled' | 'valuePerMonth',
    value: unknown
  ) => dispatch({ type: 'UPDATE_BENEFIT', id, benefit, key, value });

  return (
    <div
      className={styles.grid}
      style={{ '--pkg-count': n } as React.CSSProperties}
    >
      {/* Header row */}
      <div className={styles.labelCell} />
      {packages.map((pkg, i) => (
        <PackageHeader
          key={pkg.id}
          pkg={pkg}
          color={PKG_COLORS[i % PKG_COLORS.length]}
          canRemove={packages.length > 1}
          onNameChange={name => updateField(pkg.id, 'name', name)}
          onRemove={() => dispatch({ type: 'REMOVE_PACKAGE', id: pkg.id })}
        />
      ))}

      {/* Løn section */}
      <div className={styles.sectionHeader}>Løn</div>

      <InputRow
        label="Månedlig bruttoløn"
        hint="ex. pension"
        packages={packages}
        field="monthlySalary"
        onChange={updateField}
      />
      <InputRow
        label="Pension (arbejdsgiver)"
        hint="% af bruttoløn"
        suffix="%"
        packages={packages}
        field="pensionPct"
        onChange={updateField}
        min={0}
        max={100}
      />
      <InputRow
        label="Pension (eget bidrag)"
        hint="% af bruttoløn"
        suffix="%"
        packages={packages}
        field="ownPensionPct"
        onChange={updateField}
        min={0}
        max={100}
      />
      <InputRow
        label="Årlig bonus"
        packages={packages}
        field="yearlyBonus"
        onChange={updateField}
      />
      <InputRow
        label="Ferietillæg"
        hint="% af bruttoløn"
        suffix="%"
        packages={packages}
        field="ferietillaegPct"
        onChange={updateField}
        min={0}
        max={100}
      />

      {/* Arbejdstid section */}
      <div className={styles.sectionHeader}>Arbejdstid &amp; Pendling</div>

      <InputRow
        label="Ugentlige arbejdstimer"
        packages={packages}
        field="weeklyHours"
        onChange={updateField}
      />
      <InputRow
        label="Pendlingstid (min/dag)"
        hint="tur-retur"
        packages={packages}
        field="commuteMinutesPerDay"
        onChange={updateField}
      />
      <InputRow
        label="Pendlingsomk. (DKK/mdr)"
        packages={packages}
        field="monthlyCommuteCost"
        onChange={updateField}
      />
      <InputRow
        label="Hjemmearbejdsdage/uge"
        packages={packages}
        field="remoteDaysPerWeek"
        onChange={updateField}
        min={0}
        max={5}
        step={0.5}
      />

      {/* Goder section */}
      <div className={styles.sectionHeader}>Goder</div>

      <InputRow
        label="Ekstra feriedage"
        packages={packages}
        field="extraVacationDays"
        onChange={updateField}
      />
      <BenefitRow
        label="Sundhedsforsikring"
        benefitKey="healthInsurance"
        packages={packages}
        onChange={updateBenefit}
      />
      <BenefitRow
        label="Frokostordning"
        benefitKey="freeFood"
        packages={packages}
        onChange={updateBenefit}
      />
      <BenefitRow
        label="Fri tlf/computer/bil"
        benefitKey="phoneComputerCar"
        packages={packages}
        onChange={updateBenefit}
      />

    </div>
  );
}
