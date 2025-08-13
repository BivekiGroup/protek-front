import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { getMetaByPath } from '@/lib/meta-config';

interface MetaTagsData {
  title: string;
  description: string;
  keywords: string;
  ogTitle?: string;
  ogDescription?: string;
}

export const useMetaTags = (customMeta?: Partial<MetaTagsData>): MetaTagsData => {
  const router = useRouter();
  
  const metaData = useMemo(() => {
    // Получаем базовые meta-теги для текущего пути
    const baseMeta = getMetaByPath(router.asPath);
    
    // Объединяем с пользовательскими meta-тегами
    return {
      ...baseMeta,
      ...customMeta
    };
  }, [router.asPath, customMeta]);
  
  return metaData;
};

export default useMetaTags; 