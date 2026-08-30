import { useTranslations } from '@/hooks/useTranslations';
import { LOCALE_LABELS, type Locale } from '@/i18n';
import { useSettingsStore } from '@/state/settingsStore';

import styles from './SettingsScreen.module.css';

const LOCALES: readonly Locale[] = ['en', 'pt-BR'];

export interface SettingsScreenProps {
  onBack: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const t = useTranslations();
  const locale = useSettingsStore((state) => state.locale);
  const setLocale = useSettingsStore((state) => state.setLocale);

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>{t.settings.title}</h1>

      <section className={styles.section}>
        <p className={styles.sectionLabel}>{t.settings.languageLabel}</p>
        <div className={styles.optionRow}>
          {LOCALES.map((option) => (
            <button
              key={option}
              type="button"
              className={styles.optionButton}
              aria-pressed={locale === option}
              data-active={locale === option ? '' : undefined}
              onClick={() => setLocale(option)}
            >
              {LOCALE_LABELS[option]}
            </button>
          ))}
        </div>
      </section>

      <button type="button" className={styles.backButton} onClick={onBack}>
        {t.settings.back}
      </button>
    </div>
  );
}
