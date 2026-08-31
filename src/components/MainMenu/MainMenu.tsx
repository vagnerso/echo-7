import { EchoPortrait } from '@/components/EchoPortrait/EchoPortrait';
import { useTranslations } from '@/hooks/useTranslations';

import styles from './MainMenu.module.css';

export interface MainMenuProps {
  onNewGame: () => void;
  onContinue: () => void;
  onOpenTutorial: () => void;
  onOpenSettings: () => void;
  hasSave: boolean;
}

export function MainMenu({
  onNewGame,
  onContinue,
  onOpenTutorial,
  onOpenSettings,
  hasSave,
}: MainMenuProps) {
  const t = useTranslations();

  return (
    <div className={styles.menu}>
      <EchoPortrait />

      <h1 className={styles.title}>{t.mainMenu.title}</h1>
      <p className={styles.subtitle}>{t.mainMenu.subtitle}</p>

      <nav className={styles.actions}>
        <button type="button" className={styles.button} onClick={onNewGame}>
          {t.mainMenu.newGame}
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={onContinue}
          disabled={!hasSave}
          title={hasSave ? undefined : t.mainMenu.noSaveTooltip}
        >
          {t.mainMenu.continueGame}
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={onOpenTutorial}
        >
          {t.mainMenu.howToPlay}
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={onOpenSettings}
        >
          {t.mainMenu.settings}
        </button>
      </nav>

      <footer className={styles.footer}>
        {t.mainMenu.developedBy} Vagner Oliveira
      </footer>
    </div>
  );
}
