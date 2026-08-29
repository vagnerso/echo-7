import styles from './MainMenu.module.css';

export interface MainMenuProps {
  onNewGame: () => void;
  /** Existe progresso salvo para continuar? Sempre false ate a Fase 8 (save/load) existir. */
  hasSave: boolean;
}

export function MainMenu({ onNewGame, hasSave }: MainMenuProps) {
  return (
    <div className={styles.menu}>
      <h1 className={styles.title}>ECHO-7</h1>
      <p className={styles.subtitle}>THE LAST SIGNAL</p>

      <nav className={styles.actions}>
        <button type="button" onClick={onNewGame}>
          NEW GAME
        </button>
        <button
          type="button"
          disabled={!hasSave}
          title={hasSave ? undefined : 'Nenhum progresso salvo ainda'}
        >
          CONTINUE
        </button>
        <button type="button" disabled title="Ainda nao implementado">
          SETTINGS
        </button>
      </nav>
    </div>
  );
}
