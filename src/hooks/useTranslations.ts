import { TRANSLATIONS, type Translations } from '@/i18n';
import { useSettingsStore } from '@/state/settingsStore';

/** Dicionario completo do idioma atual - componentes destroem direto (ex: `t.mainMenu.title`), sem chave solta nem risco de erro de digitacao passar despercebido (o shape e tipado por `Translations`). */
export function useTranslations(): Translations {
  return useSettingsStore((state) => TRANSLATIONS[state.locale]);
}
