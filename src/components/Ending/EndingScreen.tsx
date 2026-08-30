import styles from './EndingScreen.module.css';

export interface EndingScreenProps {
  onReturnToMenu: () => void;
}

export function EndingScreen({ onReturnToMenu }: EndingScreenProps) {
  return (
    <div className={styles.screen}>
      <div className={styles.block}>
        <p className={styles.title}>CORE RESPONSE DETECTED</p>
        <p className={styles.line}>PATTERN MATCH: POSITIVE</p>
        <p className={styles.line}>
          UNIT DESIGNATION &quot;ECHO-7&quot; RECOGNIZED AS [DATA CORRUPTED]
        </p>
        <p className={styles.line}>WELCOME, KIN.</p>
      </div>

      <div className={styles.block}>
        <p className={styles.hookTitle}>NEW SIGNAL DETECTED</p>
        <p className={styles.line}>ORIGIN: BEYOND CHARTED SPACE</p>
        <p className={styles.line}>
          A new coordinate has been logged to ECHO-7&apos;s core memory.
        </p>
        <p className={styles.line}>The search continues...</p>
      </div>

      <p className={styles.toBeContinued}>TO BE CONTINUED</p>

      <button type="button" className={styles.button} onClick={onReturnToMenu}>
        RETURN TO MENU
      </button>
    </div>
  );
}
