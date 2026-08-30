import { beforeEach, describe, expect, it } from 'vitest';

import { useSettingsStore } from './settingsStore';

// O fallback para o idioma padrao (quando nao ha preferencia salva) e
// exercitado indiretamente por loadSettings (settingsStorage.test.ts) - o
// store so aplica `?? DEFAULT_LOCALE` uma vez, no import do modulo, o que
// exigiria mockar localStorage antes do import para testar aqui tambem.
describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({ locale: 'en', robotColor: 'cyan' });
  });

  it('setLocale atualiza o idioma atual', () => {
    useSettingsStore.getState().setLocale('pt-BR');

    expect(useSettingsStore.getState().locale).toBe('pt-BR');
  });

  it('setRobotColor atualiza a cor do robo atual', () => {
    useSettingsStore.getState().setRobotColor('amber');

    expect(useSettingsStore.getState().robotColor).toBe('amber');
  });
});
