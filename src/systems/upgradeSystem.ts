import { UPGRADES } from '@/content/upgrades';
import type { InventoryItem } from '@/entities/inventoryItem';
import type { Upgrade } from '@/entities/upgrade';

/**
 * Retorna os upgrades que podem ser instalados agora, dado o inventario
 * atual e o que ja esta instalado - ou seja, ainda nao instalados e com
 * componente suficiente no inventario. Pura: nao instala nada sozinha,
 * quem chama decide o que fazer com o resultado (consumir componente,
 * marcar como instalado).
 */
export function findInstallableUpgrades(
  inventory: readonly InventoryItem[],
  installedUpgradeIds: ReadonlySet<string>,
): Upgrade[] {
  return UPGRADES.filter((upgrade) => {
    if (installedUpgradeIds.has(upgrade.id)) return false;

    const owned =
      inventory.find((item) => item.id === upgrade.requiredComponent.id)
        ?.quantity ?? 0;

    return owned >= upgrade.requiredComponent.quantity;
  });
}
