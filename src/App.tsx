import { useState } from 'react';

import { GameCanvas } from '@/components/GameCanvas/GameCanvas';
import { MainMenu } from '@/components/MainMenu/MainMenu';

import styles from './App.module.css';

type Screen = 'menu' | 'game';

function App() {
  const [screen, setScreen] = useState<Screen>('menu');

  return (
    <div className={styles.app}>
      {screen === 'menu' ? (
        <MainMenu onNewGame={() => setScreen('game')} hasSave={false} />
      ) : (
        <GameCanvas />
      )}
    </div>
  );
}

export default App;
