import { CONTROL_ROWS, formatKeyGroup } from '@/engine/controlsDisplay';
import { useTranslations } from '@/hooks/useTranslations';

import styles from './TutorialScreen.module.css';

export interface TutorialScreenProps {
  onBack: () => void;
}

export function TutorialScreen({ onBack }: TutorialScreenProps) {
  const t = useTranslations();

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>{t.tutorial.title}</h1>

      <section className={styles.section}>
        <p className={styles.sectionLabel}>{t.tutorial.briefingTitle}</p>
        <p className={styles.briefingText}>{t.tutorial.briefingText}</p>
      </section>

      <section className={styles.section}>
        <p className={styles.sectionLabel}>{t.tutorial.controlsTitle}</p>
        <ul className={styles.controlsList}>
          {CONTROL_ROWS.map((row) => (
            <li key={row.labelKey} className={styles.controlsRow}>
              <span className={styles.controlsKeys}>
                {formatKeyGroup(row.keys)}
              </span>
              <span className={styles.controlsAction}>
                {t.controls[row.labelKey]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <button type="button" className={styles.backButton} onClick={onBack}>
        {t.settings.back}
      </button>
    </div>
  );
}
