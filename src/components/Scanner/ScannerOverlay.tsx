import { useTranslations } from '@/hooks/useTranslations';
import { useUiStore } from '@/state/uiStore';

import styles from './ScannerOverlay.module.css';

export function ScannerOverlay() {
  const isScannerActive = useUiStore((state) => state.isScannerActive);
  const target = useUiStore((state) => state.currentScanTarget);
  const t = useTranslations();

  if (!isScannerActive) return null;

  // Resolvido ao vivo pelo objectId, nunca guardado na Discovery - assim o
  // scanner sempre mostra o idioma atual, mesmo que o objeto ja tenha sido
  // escaneado antes numa sessao com outro idioma (ver entities/discovery.ts).
  const info = target ? t.scanInfo[target.objectId] : null;

  return (
    <div className={styles.panel}>
      <p className={styles.title}>{t.scanner.title}</p>

      {info ? (
        <>
          <p>{t.scanner.objectDetected}</p>
          <div className={styles.row}>
            <span className={styles.rowLabel}>{t.scanner.typeLabel}</span>
            <span>{info.label}</span>
          </div>
          {info.age && (
            <div className={styles.row}>
              <span className={styles.rowLabel}>{t.scanner.ageLabel}</span>
              <span>{info.age}</span>
            </div>
          )}
          {info.material && (
            <div className={styles.row}>
              <span className={styles.rowLabel}>
                {t.scanner.materialLabel}
              </span>
              <span>{info.material}</span>
            </div>
          )}
        </>
      ) : (
        <p className={styles.status}>{t.scanner.noSignal}</p>
      )}
    </div>
  );
}
