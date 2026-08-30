import { useState } from 'react';

import { EndingScreen } from '@/components/Ending/EndingScreen';
import { GameCanvas } from '@/components/GameCanvas/GameCanvas';
import { InventoryPanel } from '@/components/Inventory/InventoryPanel';
import { MainMenu } from '@/components/MainMenu/MainMenu';
import { FragmentRevealOverlay } from '@/components/MemoryFragment/FragmentRevealOverlay';
import { MissionHUD } from '@/components/Mission/MissionHUD';
import { ScannerOverlay } from '@/components/Scanner/ScannerOverlay';
import { hasSaveGame, loadGame, saveGame } from '@/save/saveGame';
import { useGameStore } from '@/state/gameStore';
import { useUiStore } from '@/state/uiStore';

import styles from './App.module.css';

type Screen = 'menu' | 'game';

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

  return (
    <div className={styles.app}>
      {screen === 'menu' ? (
        <MainMenu
          onNewGame={handleNewGame}
          onContinue={handleContinue}
          hasSave={hasSaveGame()}
        />
      ) : hasReachedEnding ? (
        <EndingScreen onReturnToMenu={() => setScreen('menu')} />
      ) : (
        <>
          <GameCanvas />
          <ScannerOverlay />
          <InventoryPanel />
          <MissionHUD />
          <FragmentRevealOverlay />
        </>
      )}
    </div>
  );
}

export default App;
