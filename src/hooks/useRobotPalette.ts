import { resolveRobotPalette, type RobotPalette } from '@/content/robotColors';
import { useSettingsStore } from '@/state/settingsStore';

/** Paleta do robo (cor escolhida em Settings, com fallback ja resolvido) - para uso em componentes React. Codigo fora de React (ex: o loop de render do GameCanvas) chama `resolveRobotPalette` direto, ja que hooks só valem dentro de render de componente. */
export function useRobotPalette(): RobotPalette {
  return useSettingsStore((state) => resolveRobotPalette(state.robotColor));
}
