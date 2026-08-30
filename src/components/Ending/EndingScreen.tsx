import { useTranslations } from '@/hooks/useTranslations';

import styles from './EndingScreen.module.css';

export interface EndingScreenProps {
  onReturnToMenu: () => void;
}

export function EndingScreen({ onReturnToMenu }: EndingScreenProps) {
  const t = useTranslations();

  return (
    <div className={styles.screen}>
      <div className={styles.block}>
        <p className={styles.title}>{t.ending.coreResponseDetected}</p>
        <p className={styles.line}>{t.ending.patternMatch}</p>
        <p className={styles.line}>{t.ending.unitDesignation}</p>
        <p className={styles.line}>{t.ending.welcomeKin}</p>
      </div>

      <div className={styles.block}>
        <p className={styles.hookTitle}>{t.ending.newSignalDetected}</p>
        <p className={styles.line}>{t.ending.origin}</p>
        <p className={styles.line}>{t.ending.newCoordinate}</p>
        <p className={styles.line}>{t.ending.searchContinues}</p>
      </div>

      <p className={styles.toBeContinued}>{t.ending.toBeContinued}</p>

      <button type="button" className={styles.button} onClick={onReturnToMenu}>
        {t.ending.returnToMenu}
      </button>
    </div>
  );
}
