import { MEMORY_FRAGMENTS } from '@/content/fragments';
import { UPGRADES } from '@/content/upgrades';
import { useGameStore } from '@/state/gameStore';
import { useUiStore } from '@/state/uiStore';

import styles from './InventoryPanel.module.css';

export function InventoryPanel() {
  const isOpen = useUiStore((state) => state.isInventoryOpen);
  const inventory = useGameStore((state) => state.inventory);
  const capacity = useGameStore((state) => state.inventoryCapacity);
  const installedUpgrades = useGameStore((state) => state.installedUpgrades);
  const collectedFragments = useGameStore((state) => state.collectedFragments);

  if (!isOpen) return null;

  const collected = MEMORY_FRAGMENTS.filter((fragment) =>
    collectedFragments.has(fragment.id),
  );

  return (
    <div className={styles.backdrop}>
      <div className={styles.panel}>
        <p className={styles.title}>INVENTORY</p>

        {inventory.length === 0 ? (
          <p className={styles.empty}>Nenhum item coletado ainda.</p>
        ) : (
          <ul className={styles.list}>
            {inventory.map((item) => (
              <li key={item.id} className={styles.row}>
                <span>{item.name}</span>
                <span>x{item.quantity}</span>
              </li>
            ))}
          </ul>
        )}

        <p className={styles.capacity}>
          {inventory.length}/{capacity} slots
        </p>

        <p className={styles.sectionTitle}>UPGRADES</p>
        <ul className={styles.list}>
          {UPGRADES.map((upgrade) => (
            <li key={upgrade.id} className={styles.row}>
              <span>
                [{installedUpgrades.has(upgrade.id) ? 'x' : ' '}] {upgrade.name}
              </span>
            </li>
          ))}
        </ul>

        <p className={styles.sectionTitle}>
          MEMORY FRAGMENTS ({collected.length}/{MEMORY_FRAGMENTS.length})
        </p>
        {collected.length === 0 ? (
          <p className={styles.empty}>Nenhum fragmento recuperado ainda.</p>
        ) : (
          <ul className={styles.list}>
            {collected.map((fragment) => (
              <li key={fragment.id} className={styles.fragmentEntry}>
                <p className={styles.fragmentText}>
                  &quot;{fragment.text}&quot;
                </p>
                <p className={styles.fragmentMeta}>
                  DATA RECOVERED: {fragment.corruption}%
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
