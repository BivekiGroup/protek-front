import { useState, useEffect } from 'react';
import { partsIndexService } from '@/lib/partsindex-service';
import { PartsIndexCatalog, PartsIndexGroup, PartsIndexTabData, PartsIndexEntityInfo } from '@/types/partsindex';

export const usePartsIndexCatalogs = () => {
  const [catalogs, setCatalogs] = useState<PartsIndexCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await partsIndexService.getCatalogs('ru');
        setCatalogs(response.list);
      } catch (err) {
        setError(err as Error);
        console.error('Ошибка загрузки каталогов:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogs();
  }, []);

  return { catalogs, loading, error };
};

export const usePartsIndexCatalogGroups = (catalogId: string | null) => {
  const [group, setGroup] = useState<PartsIndexGroup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!catalogId) {
      setGroup(null);
      return;
    }

    const fetchGroup = async () => {
      try {
        setLoading(true);
        setError(null);
        const groupData = await partsIndexService.getCatalogGroups(catalogId, 'ru');
        setGroup(groupData);
      } catch (err) {
        setError(err as Error);
        console.error(`Ошибка загрузки группы каталога ${catalogId}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [catalogId]);

  return { group, loading, error };
};

export const usePartsIndexEntityInfo = (code: string | null, brand?: string | null) => {
  const [entityInfo, setEntityInfo] = useState<PartsIndexEntityInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!code) {
      setEntityInfo(null);
      return;
    }

    const fetchEntityInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await partsIndexService.getEntityInfo(code, brand || undefined, 'ru');
        
        // Берем первый элемент из списка, если он есть
        if (response.list && response.list.length > 0) {
          setEntityInfo(response.list[0]);
        } else {
          setEntityInfo(null);
        }
      } catch (err) {
        setError(err as Error);
        console.error(`Ошибка загрузки информации о детали ${code}:`, err);
        setEntityInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEntityInfo();
  }, [code, brand]);

  return { entityInfo, loading, error };
};

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