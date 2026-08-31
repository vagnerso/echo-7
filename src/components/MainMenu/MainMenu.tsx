import { ROBOT_COLOR_PALETTES } from '@/content/robotColors';
import { useTranslations } from '@/hooks/useTranslations';
import { useSettingsStore } from '@/state/settingsStore';

import styles from './MainMenu.module.css';

export interface MainMenuProps {
  onNewGame: () => void;
  onContinue: () => void;
  onOpenTutorial: () => void;
  onOpenSettings: () => void;
  hasSave: boolean;
}

// Retrato vetorial do ECHO-7 para a tela inicial. Reaproveita a mesma
// anatomia (chassi/pernas/bracos/lente/antena) e paleta de
// content/robotColors.ts usadas no desenho do robo em GameCanvas.tsx - assim
// a cor escolhida em Settings ja aparece no menu, sem precisar de um asset
// de imagem separado (decisao da Fase 0: sem pipeline de sprites, tudo
// vetorial). Estatico (sem swing/hover) porque aqui nao ha animationTime nem
// estado de "andando" - so o pulso do CSS (antennaTip/lens) continua vindo
// do MainMenu.module.css.
function EchoPortrait() {
  const robotColor = useSettingsStore((state) => state.robotColor);
  const palette = ROBOT_COLOR_PALETTES[robotColor];

  return (
    <svg
      className={styles.portrait}
      viewBox="0 0 100 120"
      role="img"
      aria-label="ECHO-7"
    >
      <defs>
        <linearGradient id="echoBodyGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.light} />
          <stop offset="100%" stopColor={palette.body} />
        </linearGradient>
      </defs>

      <rect
        x="32"
        y="90"
        width="14"
        height="18"
        rx="4"
        fill={palette.leg}
        stroke={palette.outline}
        strokeWidth="1.5"
      />
      <line x1="34" y1="97" x2="44" y2="97" stroke={palette.light} />
      <rect
        x="54"
        y="90"
        width="14"
        height="18"
        rx="4"
        fill={palette.leg}
        stroke={palette.outline}
        strokeWidth="1.5"
      />
      <line x1="56" y1="97" x2="66" y2="97" stroke={palette.light} />

      <rect
        x="19"
        y="52"
        width="8"
        height="20"
        rx="3"
        fill={palette.leg}
        stroke={palette.outline}
        strokeWidth="1.5"
      />
      <rect
        x="73"
        y="52"
        width="8"
        height="20"
        rx="3"
        fill={palette.leg}
        stroke={palette.outline}
        strokeWidth="1.5"
      />

      <rect
        x="25"
        y="40"
        width="50"
        height="55"
        rx="10"
        fill="url(#echoBodyGradient)"
        stroke={palette.outline}
        strokeWidth="2"
      />
      <line
        x1="29"
        y1="75"
        x2="71"
        y2="75"
        stroke={palette.dark}
        strokeWidth="1.5"
      />

      <line
        x1="50"
        y1="40"
        x2="50"
        y2="18"
        stroke="rgba(216, 219, 226, 0.8)"
        strokeWidth="2"
      />
      <circle cx="50" cy="18" r="4" fill="#ffcf7a" className={styles.antennaTip} />

      <circle cx="50" cy="40" r="9" fill="#08090c" className={styles.lens} />
      <circle cx="47" cy="37" r="2" fill="rgba(255, 255, 255, 0.85)" />
    </svg>
  );
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
      <div className={styles.portraitWrap}>
        <div className={styles.portraitGlow} />
        <EchoPortrait />
      </div>

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
