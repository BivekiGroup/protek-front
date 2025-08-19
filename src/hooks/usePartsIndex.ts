import { PartsIndexCatalog, PartsIndexGroup, PartsIndexTabData, PartsIndexEntityInfo } from '@/types/partsindex';

export const usePartsIndexCatalogs = () => ({ catalogs: [] as PartsIndexCatalog[], loading: false, error: null as Error | null });

export const usePartsIndexCatalogGroups = (_catalogId: string | null) => ({ group: null as PartsIndexGroup | null, loading: false, error: null as Error | null });

export const usePartsIndexEntityInfo = (_code: string | null, _brand?: string | null) => ({ entityInfo: null as PartsIndexEntityInfo | null, loading: false, error: null as Error | null });

// Функция для преобразования данных Parts Index в формат меню
export const transformPartsIndexToTabData = (
  catalogs: PartsIndexCatalog[], 
  catalogGroups: Map<string, PartsIndexGroup>
): PartsIndexTabData[] => {
  return catalogs.map(catalog => {
    const group = catalogGroups.get(catalog.id);
    
    // Получаем подкатегории из entityNames или повторяем название категории
    const links = group?.entityNames && group.entityNames.length > 0
      ? group.entityNames.slice(0, 9).map(entity => entity.name)
      : [catalog.name]; // Если нет подкатегорий, повторяем название категории

    return {
      label: catalog.name,
      heading: catalog.name,
      links,
      catalogId: catalog.id,
      group
    };
  });
};
