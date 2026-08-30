import { useEffect } from 'react';

import { useUiStore } from '@/state/uiStore';

import styles from './FragmentRevealOverlay.module.css';

const REVEAL_DURATION_MS = 6000;

export function FragmentRevealOverlay() {
  const fragment = useUiStore((state) => state.activeFragmentReveal);

  useEffect(() => {
    if (!fragment) return;

    const timer = setTimeout(() => {
      useUiStore.getState().setActiveFragmentReveal(null);
    }, REVEAL_DURATION_MS);

    return () => clearTimeout(timer);
  }, [fragment]);

  if (!fragment) return null;

  return (
    <div className={styles.panel}>
      <p className={styles.title}>MEMORY FRAGMENT</p>
      <p className={styles.corrupted}>SIGNAL CORRUPTED</p>
      <p className={styles.text}>&quot;{fragment.text}&quot;</p>
      <p className={styles.recovered}>DATA RECOVERED: {fragment.corruption}%</p>
    </div>
  );
}
