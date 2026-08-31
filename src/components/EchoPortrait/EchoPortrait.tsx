import { useRobotPalette } from '@/hooks/useRobotPalette';

import styles from './EchoPortrait.module.css';

/**
 * Retrato vetorial do ECHO-7, com glow e flutuacao animados - usado na tela
 * inicial (MainMenu) e na conclusao do epilogo (EpilogueCompleteScreen).
 * Extraido para um componente proprio quando o segundo uso apareceu, para
 * as duas telas nao duplicarem o mesmo SVG. Reaproveita a mesma anatomia
 * (chassi/pernas/bracos/lente/antena) e paleta de content/robotColors.ts
 * usadas no desenho do robo em GameCanvas.tsx - assim a cor escolhida em
 * Settings aparece em qualquer lugar que o retrato apareca, sem precisar de
 * um asset de imagem separado (decisao da Fase 0: sem pipeline de sprites,
 * tudo vetorial). Estatico (sem swing/hover de "andando") porque nenhuma das
 * duas telas tem animationTime nem estado de movimento - so o pulso via CSS
 * (antennaTip/lens/glow) continua vindo do modulo de estilo.
 *
 * className opcional: some junto de portraitWrap (mesmo elemento, nao um
 * wrapper extra) - permite a quem usa setar a custom property --scale numa
 * classe propria (ver EchoPortrait.module.css) sem duplicar largura/altura.
 */
export interface EchoPortraitProps {
  className?: string;
}

export function EchoPortrait({ className }: EchoPortraitProps = {}) {
  const palette = useRobotPalette();
  const wrapClassName = className
    ? `${styles.portraitWrap} ${className}`
    : styles.portraitWrap;

  return (
    <div className={wrapClassName}>
      <div className={styles.portraitGlow} />
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
        <circle
          cx="50"
          cy="18"
          r="4"
          fill="#ffcf7a"
          className={styles.antennaTip}
        />

        <circle cx="50" cy="40" r="9" fill="#08090c" className={styles.lens} />
        <circle cx="47" cy="37" r="2" fill="rgba(255, 255, 255, 0.85)" />
      </svg>
    </div>
  );
}
