import { CONTROL_ROWS, formatKeyGroup } from '@/engine/controlsDisplay';
import { useTranslations } from '@/hooks/useTranslations';

import styles from './ControlsHint.module.css';

export function ControlsHint() {
  const t = useTranslations();

  return (
    <div className={styles.panel}>
      <p className={styles.title}>{t.controls.title}</p>
      <ul className={styles.list}>
        {CONTROL_ROWS.map((row) => (
          <li key={row.labelKey} className={styles.row}>
            <span className={styles.keys}>{formatKeyGroup(row.keys)}</span>
            <span className={styles.action}>{t.controls[row.labelKey]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
