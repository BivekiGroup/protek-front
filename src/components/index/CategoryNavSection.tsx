import React from "react";
import { useQuery } from '@apollo/client';
import { GET_PARTSINDEX_CATEGORIES } from '@/lib/graphql';
import { useRouter } from 'next/router';

interface CategoryNavGroup {
  id: string;
  name: string;
  image?: string;
}

interface CategoryNavItem {
  id: string;
  name: string;
  image?: string;
  groups?: CategoryNavGroup[];
}

const FALLBACK_CATEGORIES: CategoryNavItem[] = [
  { id: '1', name: 'Детали для ТО', image: '/images/catalog_item.png' },
  { id: '2', name: 'Шины', image: '/images/catalog_item2.png' },
  { id: '3', name: 'Диски', image: '/images/catalog_item3.png' },
  { id: '4', name: 'Масла и жидкости', image: '/images/catalog_item4.png' },
  { id: '5', name: 'Инструменты', image: '/images/catalog_item5.png' },
  { id: '6', name: 'Автохимия', image: '/images/catalog_item6.png' },
  { id: '7', name: 'Аксессуары', image: '/images/catalog_item7.png' },
  { id: '8', name: 'Электрика', image: '/images/catalog_item8.png' },
  { id: '9', name: 'АКБ', image: '/images/catalog_item9.png' },
];

const CategoryNavSection: React.FC = () => {
  const router = useRouter();

  const { data } = useQuery<{ partsIndexCategoriesWithGroups: CategoryNavItem[] }>(
    GET_PARTSINDEX_CATEGORIES,
    {
      variables: { lang: 'ru' },
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    }
  );

  const categories = (data?.partsIndexCategoriesWithGroups && data.partsIndexCategoriesWithGroups.length > 0)
    ? data.partsIndexCategoriesWithGroups.slice(0, 9)
    : FALLBACK_CATEGORIES;

  const handleCategoryClick = (category: CategoryNavItem) => {
    // Получаем первую доступную группу для навигации в PartsIndex режим
    const firstGroupId = category.groups && category.groups.length > 0 ? category.groups[0].id : undefined;
    
    router.push({
      pathname: '/catalog',
      query: {
        partsIndexCatalog: category.id,
        categoryName: encodeURIComponent(category.name),
        ...(firstGroupId && { partsIndexCategory: firstGroupId })
      }
    });
  };

  return (
    <section className="catnav">
      <div className="w-layout-blockcontainer batd w-container">
        <div className="w-layout-hflex flex-block-108-copy">
          {categories.map((category, idx) => (
            <div
              key={category.id}
              className={`ci${idx + 1}`}
              style={category.image ? { cursor: 'pointer', backgroundImage: `url('${category.image}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : { cursor: 'pointer' }}
              onClick={() => handleCategoryClick(category)}
            >
              <div className={idx === 0 ? 'text-block-54-copy' : 'text-block-54'} style={{ textAlign: 'center' }}>
                {category.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryNavSection; 