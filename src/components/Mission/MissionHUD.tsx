import { useGameStore } from '@/state/gameStore';

import styles from './MissionHUD.module.css';

export function MissionHUD() {
  const objective = useGameStore((state) => state.currentObjective);
  const hasEnded = useGameStore((state) => state.hasReachedEnding);

  if (hasEnded) return null;

  return (
    <div className={styles.hud}>
      <p className={styles.label}>OBJECTIVE</p>
      <p className={styles.text}>{objective}</p>
    </div>
  );
}
