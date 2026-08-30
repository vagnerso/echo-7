import type { RobotColorKey } from '@/i18n';

/**
 * "Pintura" do robo: chassi (body/light/dark), contorno e pernas. O sensor
 * (lente/glow) e a antena ficam fixos em todas as cores - sao a "identidade"
 * do ECHO-7, independente da cor escolhida (ver GameCanvas.tsx/renderPlayer).
 */
export interface RobotPalette {
  body: string;
  light: string;
  dark: string;
  outline: string;
  leg: string;
}

// 5 opcoes com boa leitura contra as 3 paletas de fundo (GameCanvas.tsx,
// REGION_GROUND_PALETTES): roxo/ferrugem (Landing Zone), dourado/musgo
// (Ancient Ruins) e ciano tecnologico (Signal Core, ja e a cor padrao do
// robo). 'cyan' preserva exatamente a aparencia original (Fase 1) - quem
// nunca abrir Settings nao ve nenhuma mudanca.
export const ROBOT_COLOR_PALETTES: Record<RobotColorKey, RobotPalette> = {
  cyan: {
    body: '#5ee6c8',
    light: '#a4f5e2',
    dark: '#2c7d6c',
    outline: '#0f2620',
    leg: '#1d4a40',
  },
  amber: {
    body: '#e6a15e',
    light: '#f5d2a4',
    dark: '#7d552c',
    outline: '#26190f',
    leg: '#4a3319',
  },
  rose: {
    body: '#e65e9e',
    light: '#f5a4cf',
    dark: '#7d2c56',
    outline: '#260f1c',
    leg: '#4a1a34',
  },
  green: {
    body: '#8ee65e',
    light: '#c9f5a4',
    dark: '#4a7d2c',
    outline: '#182610',
    leg: '#2c4a1a',
  },
  azure: {
    body: '#5ea1e6',
    light: '#a4cff5',
    dark: '#2c557d',
    outline: '#0f1926',
    leg: '#1a334a',
  },
};

export const ROBOT_COLOR_KEYS: readonly RobotColorKey[] = [
  'cyan',
  'amber',
  'rose',
  'green',
  'azure',
];
