import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CATEGORY_PRODUCTS_WITH_OFFERS } from '@/lib/graphql';

interface RecommendedProduct {
  brand: string;
  articleNumber: string;
  name?: string;
  artId?: string;
  minPrice?: number | null;
}

/**
 * Хук для получения рекомендуемых товаров из той же категории с AutoEuro предложениями
 */
export const useRecommendedProducts = (
  productName: string = '', 
  excludeArticle: string = '', 
  excludeBrand: string = ''
) => {
  // Определяем категорию товара из названия
  const categoryName = useMemo(() => {
    const name = productName.toLowerCase()
    
    // Простое определение категории по ключевым словам в названии
    if (name.includes('шина') || name.includes('покрышка') || name.includes('резина')) {
      return 'шины'
    }
    if (name.includes('масло') || name.includes('oil')) {
      return 'масла'
    }
    if (name.includes('фильтр')) {
      return 'фильтры'
    }
    if (name.includes('тормоз') || name.includes('колодка')) {
      return 'тормоза'
    }
    if (name.includes('аккумулятор') || name.includes('батарея')) {
      return 'аккумуляторы'
    }
    if (name.includes('свеча')) {
      return 'свечи'
    }
    if (name.includes('стартер')) {
      return 'стартеры'
    }
    if (name.includes('генератор')) {
      return 'генераторы'
    }
    if (name.includes('амортизатор') || name.includes('стойка')) {
      return 'амортизаторы'
    }
    
    // Если категория не определена, используем первое слово из названия
    const words = productName.split(' ')
    return words[0] || 'автотовары'
  }, [productName])

  // Запрос товаров из категории
  const { data, loading, error } = useQuery(GET_CATEGORY_PRODUCTS_WITH_OFFERS, {
    variables: {
      categoryName,
      excludeArticle,
      excludeBrand,
      limit: 5
    },
    skip: !categoryName || !excludeArticle, // Пропускаем запрос если нет необходимых данных
    fetchPolicy: 'cache-first'
  })

  // Мемоизируем обработку результатов
  const recommendedProducts = useMemo(() => {
    if (!data?.getCategoryProductsWithOffers) return [];
    
    return data.getCategoryProductsWithOffers.map((product: any) => ({
      brand: product.brand || '',
      articleNumber: product.articleNumber || '',
      name: product.name || `${product.brand || ''} ${product.articleNumber || ''}`,
      artId: product.artId || '',
      minPrice: product.minPrice
    })).filter((product: any) => product.brand && product.articleNumber); // Фильтруем только валидные
  }, [data])

  return {
    recommendedProducts,
    isLoading: loading,
    error: error?.message
  };
}; 