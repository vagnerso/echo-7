import type { CSSProperties } from 'react';

import { MEMORY_FRAGMENTS } from '@/content/fragments';
import { FRAGMENT_COLOR, ITEM_TYPE_COLORS } from '@/content/itemColors';
import { UPGRADES } from '@/content/upgrades';
import { useTranslations } from '@/hooks/useTranslations';
import { useGameStore } from '@/state/gameStore';
import { useUiStore } from '@/state/uiStore';

import styles from './InventoryPanel.module.css';

export function InventoryPanel() {
  const isOpen = useUiStore((state) => state.isInventoryOpen);
  const inventory = useGameStore((state) => state.inventory);
  const capacity = useGameStore((state) => state.inventoryCapacity);
  const installedUpgrades = useGameStore((state) => state.installedUpgrades);
  const collectedFragments = useGameStore((state) => state.collectedFragments);
  const t = useTranslations();

  if (!isOpen) return null;

  const collected = MEMORY_FRAGMENTS.filter((fragment) =>
    collectedFragments.has(fragment.id),
  );

  const close = () => useUiStore.getState().toggleInventory();

  return (
    // Fecha ao tocar/clicar fora do painel - so quando o alvo do clique e o
    // proprio backdrop, nao um filho borbulhando (senao clicar dentro do
    // painel tambem fecharia). Existe porque em telas de toque o botao "I"
    // do TouchControls fica atras deste modal (z-index de proposito, para o
    // D-pad nao vazar por baixo dele) - sem isso nao havia como fechar o
    // inventario pelo toque depois de aberto.
    <div
      className={styles.backdrop}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className={styles.panel}>
        <button
          type="button"
          className={styles.closeButton}
          aria-label={t.inventory.close}
          onClick={close}
        >
          ×
        </button>
        <p className={styles.title}>{t.inventory.title}</p>

        {inventory.length === 0 ? (
          <p className={styles.empty}>{t.inventory.empty}</p>
        ) : (
          <ul className={styles.list}>
            {inventory.map((item) => (
              <li key={item.id} className={styles.row}>
                <span>
                  <span
                    className={styles.itemIcon}
                    style={
                      {
                        '--icon-color': ITEM_TYPE_COLORS[item.type],
                      } as CSSProperties
                    }
                  />
                  {t.items[item.id] ?? item.id}
                </span>
                <span>x{item.quantity}</span>
              </li>
            ))}
          </ul>
        )}

        <p className={styles.capacity}>
          {t.inventory.slots(inventory.length, capacity)}
        </p>

        <p className={styles.sectionTitle}>{t.inventory.upgradesTitle}</p>
        <ul className={styles.list}>
          {UPGRADES.map((upgrade) => {
            const isInstalled = installedUpgrades.has(upgrade.id);
            return (
              <li key={upgrade.id} className={styles.row}>
                <span>
                  <span
                    className={styles.itemIcon}
                    data-dim={isInstalled ? undefined : ''}
                    style={
                      {
                        '--icon-color': ITEM_TYPE_COLORS.upgrade,
                      } as CSSProperties
                    }
                  />
                  [{isInstalled ? 'x' : ' '}]{' '}
                  {t.upgrades[upgrade.id]?.name ?? upgrade.id}
                </span>
              </li>
            );
          })}
        </ul>

        <p className={styles.sectionTitle}>
          {t.inventory.fragmentsTitle(collected.length, MEMORY_FRAGMENTS.length)}
        </p>
        {collected.length === 0 ? (
          <p className={styles.empty}>{t.inventory.noFragments}</p>
        ) : (
          <ul className={styles.list}>
            {collected.map((fragment) => (
              <li key={fragment.id} className={styles.fragmentEntry}>
                <p className={styles.fragmentText}>
                  <span
                    className={styles.fragmentIcon}
                    style={{ '--icon-color': FRAGMENT_COLOR } as CSSProperties}
                  />
                  &quot;{t.fragments[fragment.id] ?? ''}&quot;
                </p>
                <p className={styles.fragmentMeta}>
                  {t.inventory.dataRecovered(fragment.corruption)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
