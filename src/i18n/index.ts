import { en } from './en';
import { ptBR } from './ptBR';
import type { Locale, RobotColorKey, Translations } from './translations';

export type {
  Locale,
  ObjectiveKey,
  RobotColorKey,
  ScanInfoText,
  Translations,
  UpgradeText,
} from './translations';

export const DEFAULT_LOCALE: Locale = 'en';
export const DEFAULT_ROBOT_COLOR: RobotColorKey = 'cyan';

export const TRANSLATIONS: Record<Locale, Translations> = {
  en,
  'pt-BR': ptBR,
};

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  'pt-BR': 'Português (Brasil)',
};
