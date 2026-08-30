import styles from './MainMenu.module.css';

export interface MainMenuProps {
  onNewGame: () => void;
  onContinue: () => void;
  hasSave: boolean;
}

export function MainMenu({ onNewGame, onContinue, hasSave }: MainMenuProps) {
  return (
    <div className={styles.menu}>
      <h1 className={styles.title}>ECHO-7</h1>
      <p className={styles.subtitle}>THE LAST SIGNAL</p>

      <nav className={styles.actions}>
        <button type="button" className={styles.button} onClick={onNewGame}>
          NEW GAME
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={onContinue}
          disabled={!hasSave}
          title={hasSave ? undefined : 'Nenhum progresso salvo ainda'}
        >
          CONTINUE
        </button>
        <button
          type="button"
          className={styles.button}
          disabled
          title="Ainda nao implementado"
        >
          SETTINGS
        </button>
      </nav>
    </div>
  );
}
