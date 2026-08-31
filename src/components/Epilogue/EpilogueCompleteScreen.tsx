import { EchoPortrait } from '@/components/EchoPortrait/EchoPortrait';
import { useTranslations } from '@/hooks/useTranslations';

// Reaproveita o CSS da EndingScreen (mesmo modulo, nao uma copia) - a mesma
// linguagem visual de "mensagem de terminal" de tela cheia serve pras duas,
// so o texto muda. Criar um .module.css identico so pra este componente
// duplicaria o arquivo inteiro sem nenhum ganho.
import styles from '../Ending/EndingScreen.module.css';

export interface EpilogueCompleteScreenProps {
  onReturnToMenu: () => void;
}

/**
 * Tela de fechamento do epilogo (v3.0) - mostrada uma vez, quando os dois
 * fragmentos de The Buried Chord sao coletados (ver
 * useGameStore.getState().completeEpilogue em GameCanvas.tsx). Independente
 * da EndingScreen original (hasReachedEnding) - o final do MVP continua
 * intacto, este e um segundo fechamento, para o conteudo que vem depois dele.
 */
export function EpilogueCompleteScreen({
  onReturnToMenu,
}: EpilogueCompleteScreenProps) {
  const t = useTranslations();

  return (
    <div className={styles.screen}>
      <EchoPortrait />

      <div className={styles.block}>
        <p className={styles.title}>{t.epilogueEnding.sequenceComplete}</p>
        <p className={styles.line}>{t.epilogueEnding.chordResolves}</p>
        <p className={styles.line}>{t.epilogueEnding.unitRecognized}</p>
        <p className={styles.line}>{t.epilogueEnding.waitingForItself}</p>
      </div>

      <p className={styles.line}>{t.epilogueEnding.farewell}</p>
      <p className={styles.toBeContinued}>
        {t.epilogueEnding.seeYouOutThere}
      </p>

      <button type="button" className={styles.button} onClick={onReturnToMenu}>
        {t.ending.returnToMenu}
      </button>
    </div>
  );
}
