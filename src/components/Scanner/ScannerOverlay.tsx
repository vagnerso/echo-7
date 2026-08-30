import { useUiStore } from '@/state/uiStore';

import styles from './ScannerOverlay.module.css';

export function ScannerOverlay() {
  const isScannerActive = useUiStore((state) => state.isScannerActive);
  const target = useUiStore((state) => state.currentScanTarget);

  if (!isScannerActive) return null;

  return (
    <div className={styles.panel}>
      <p className={styles.title}>SCANNER</p>

      {target ? (
        <>
          <p>OBJECT DETECTED</p>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Type:</span>
            <span>{target.label}</span>
          </div>
          {target.age && (
            <div className={styles.row}>
              <span className={styles.rowLabel}>Age:</span>
              <span>{target.age}</span>
            </div>
          )}
          {target.material && (
            <div className={styles.row}>
              <span className={styles.rowLabel}>Material:</span>
              <span>{target.material}</span>
            </div>
          )}
        </>
      ) : (
        <p className={styles.status}>NO SIGNAL</p>
      )}
    </div>
  );
}
