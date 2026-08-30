import { useEffect, useState } from 'react';

import { ControlsHint } from '@/components/Controls/ControlsHint';
import { EndingScreen } from '@/components/Ending/EndingScreen';
import { GameCanvas } from '@/components/GameCanvas/GameCanvas';
import { InventoryPanel } from '@/components/Inventory/InventoryPanel';
import { MainMenu } from '@/components/MainMenu/MainMenu';
import { FragmentRevealOverlay } from '@/components/MemoryFragment/FragmentRevealOverlay';
import { MissionHUD } from '@/components/Mission/MissionHUD';
import { ScannerOverlay } from '@/components/Scanner/ScannerOverlay';
import { SettingsScreen } from '@/components/Settings/SettingsScreen';
import { TutorialScreen } from '@/components/Tutorial/TutorialScreen';
import { hasSaveGame, loadGame, saveGame } from '@/save/saveGame';
import { saveSettings } from '@/save/settingsStorage';
import { useGameStore } from '@/state/gameStore';
import { useSettingsStore } from '@/state/settingsStore';
import { useUiStore } from '@/state/uiStore';

import styles from './App.module.css';

type Screen = 'menu' | 'game' | 'settings' | 'tutorial';

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const hasReachedEnding = useGameStore((state) => state.hasReachedEnding);

  const handleNewGame = () => {
    useGameStore.getState().resetGame();
    useUiStore.getState().resetUi();
    // Sobrescreve qualquer save anterior na hora, para "CONTINUE" nunca
    // apontar para o progresso de uma partida anterior caso o jogador saia
    // antes de qualquer evento de progresso re-salvar sozinho.
    saveGame();
    setScreen('game');
  };

  const handleContinue = () => {
    loadGame();
    useUiStore.getState().resetUi();
    setScreen('game');
  };

  useEffect(() => {
    // Autosave de preferencias (idioma, cor do robo) - mesmo padrao de
    // store.subscribe ja usado para o progresso (GameCanvas), mas aqui em
    // App.tsx porque a preferencia deve valer ja no MainMenu, antes de
    // qualquer partida comecar.
    return useSettingsStore.subscribe((state) =>
      saveSettings({ locale: state.locale, robotColor: state.robotColor }),
    );
  }, []);

  return (
    <div className={styles.app}>
      {screen === 'menu' ? (
        <MainMenu
          onNewGame={handleNewGame}
          onContinue={handleContinue}
          onOpenTutorial={() => setScreen('tutorial')}
          onOpenSettings={() => setScreen('settings')}
          hasSave={hasSaveGame()}
        />
      ) : screen === 'tutorial' ? (
        <TutorialScreen onBack={() => setScreen('menu')} />
      ) : screen === 'settings' ? (
        <SettingsScreen onBack={() => setScreen('menu')} />
      ) : hasReachedEnding ? (
        <EndingScreen onReturnToMenu={() => setScreen('menu')} />
      ) : (
        <>
          <GameCanvas />
          <ScannerOverlay />
          <InventoryPanel />
          <MissionHUD />
          <FragmentRevealOverlay />
          <ControlsHint />
        </>
      )}
    </div>
  );
}

export default App;
