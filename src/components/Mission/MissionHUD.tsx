import { useShouldShowEndingScreen } from '@/hooks/useShouldShowEndingScreen';
import { useTranslations } from '@/hooks/useTranslations';
import { useGameStore } from '@/state/gameStore';

import styles from './MissionHUD.module.css';

export function MissionHUD() {
  const objectiveKey = useGameStore((state) => state.currentObjective);
  const showEndingScreen = useShouldShowEndingScreen();
  const t = useTranslations();

  // Some so enquanto a EndingScreen estiver em cena - dentro do epilogo
  // (Thousand Spires) o jogo continua de verdade e o HUD volta a aparecer.
  if (showEndingScreen) return null;

  // Fallback para a propria chave: cobre um save antigo, de antes do
  // objetivo virar chave de traducao (guardava a sentenca em ingles direto).
  const objectiveText = t.objectives[objectiveKey] ?? objectiveKey;

  return (
    <div className={styles.hud}>
      <p className={styles.label}>{t.mission.objectiveLabel}</p>
      <p className={styles.text}>{objectiveText}</p>
    </div>
  );
}
