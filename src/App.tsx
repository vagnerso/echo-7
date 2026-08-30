import { useState } from 'react';

import { EndingScreen } from '@/components/Ending/EndingScreen';
import { GameCanvas } from '@/components/GameCanvas/GameCanvas';
import { InventoryPanel } from '@/components/Inventory/InventoryPanel';
import { MainMenu } from '@/components/MainMenu/MainMenu';
import { FragmentRevealOverlay } from '@/components/MemoryFragment/FragmentRevealOverlay';
import { MissionHUD } from '@/components/Mission/MissionHUD';
import { ScannerOverlay } from '@/components/Scanner/ScannerOverlay';
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
    setScreen('game');
  };

  return (
    <div className={styles.app}>
      {screen === 'menu' ? (
        <MainMenu onNewGame={handleNewGame} hasSave={false} />
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
