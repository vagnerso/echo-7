import { useEffect } from 'react';

import { useTranslations } from '@/hooks/useTranslations';
import { useUiStore } from '@/state/uiStore';

import styles from './FragmentRevealOverlay.module.css';

const REVEAL_DURATION_MS = 6000;

export function FragmentRevealOverlay() {
  const fragment = useUiStore((state) => state.activeFragmentReveal);
  const t = useTranslations();

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
      <p className={styles.title}>{t.fragmentReveal.title}</p>
      <p className={styles.corrupted}>{t.fragmentReveal.corrupted}</p>
      <p className={styles.text}>
        &quot;{t.fragments[fragment.id] ?? ''}&quot;
      </p>
      <p className={styles.recovered}>
        {t.fragmentReveal.recovered(fragment.corruption)}
      </p>
    </div>
  );
}
