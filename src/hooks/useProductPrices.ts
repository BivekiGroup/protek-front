import { useState, useCallback } from 'react';
import { useLazyQuery } from '@apollo/client';
import { SEARCH_PRODUCT_OFFERS } from '@/lib/graphql';
import { useCart } from '@/contexts/CartContext';

interface ProductOffer {
  offerKey: string;
  brand: string;
  code: string;
  name: string;
  price: number;
  currency: string;
  deliveryTime: number;
  deliveryTimeMax: number;
  quantity: number;
  warehouse: string;
  supplier: string;
  canPurchase: boolean;
  isInCart: boolean;
}

interface ProductPriceData {
  searchProductOffers: {
    articleNumber: string;
    brand: string;
    internalOffers: ProductOffer[];
    externalOffers: ProductOffer[];
    analogs: number;
    hasInternalStock: boolean;
    isInCart: boolean;
  };
}

interface CartItemInput {
  productId?: string;
  offerKey?: string;
  article: string;
  brand: string;
  quantity: number;
}

interface ProductPriceVariables {
  articleNumber: string;
  brand: string;
  cartItems?: CartItemInput[];
}

export const useProductPrices = () => {
  const [pricesMap, setPricesMap] = useState<Map<string, ProductOffer | null>>(new Map());
  const [loadingPrices, setLoadingPrices] = useState<Set<string>>(new Set());
  const [loadedPrices, setLoadedPrices] = useState<Set<string>>(new Set());
  
  const { state: cartState } = useCart();
  const [searchOffers] = useLazyQuery<ProductPriceData, ProductPriceVariables>(SEARCH_PRODUCT_OFFERS);

  const loadPrice = useCallback(async (product: { code: string; brand: string; id: string }) => {
    const key = `${product.id}_${product.code}_${product.brand}`;
    
    // Если уже загружено или загружается - не делаем повторный запрос
    if (loadedPrices.has(key) || loadingPrices.has(key)) {
      return;
    }

    console.log('💰 Загружаем цену для:', product.code, product.brand);
    setLoadingPrices(prev => new Set([...prev, key]));

    try {
      // Преобразуем товары корзины в формат для запроса
      const cartItems: CartItemInput[] = cartState.items
        .filter(item => item.article && item.brand) // Фильтруем товары с обязательными полями
        .map(item => ({
          productId: item.productId,
          offerKey: item.offerKey,
          article: item.article!,
          brand: item.brand!,
          quantity: item.quantity
        }));

      const result = await searchOffers({
        variables: {
          articleNumber: product.code,
          brand: product.brand,
          cartItems
        }
      });

      if (result.data?.searchProductOffers) {
        const offers = result.data.searchProductOffers;
        console.log('📊 Получены предложения для', product.code, ':', {
          internal: offers.internalOffers?.length || 0,
          external: offers.externalOffers?.length || 0
        });
        
        // Берем первое доступное предложение (внутреннее или внешнее)
        const bestOffer = offers.internalOffers?.[0] || offers.externalOffers?.[0];
        
        if (bestOffer) {
          console.log('✅ Найдена цена для', product.code, ':', bestOffer.price, bestOffer.currency);
          setPricesMap(prev => new Map([...prev, [key, bestOffer]]));
        } else {
          console.log('⚠️ Предложения не найдены для', product.code);
          setPricesMap(prev => new Map([...prev, [key, null]]));
        }
      } else {
        console.log('❌ Нет данных от API для', product.code);
        setPricesMap(prev => new Map([...prev, [key, null]]));
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки цены для', product.code, error);
      setPricesMap(prev => new Map([...prev, [key, null]]));
    } finally {
      setLoadingPrices(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
      setLoadedPrices(prev => new Set([...prev, key]));
    }
  }, [searchOffers, loadedPrices, loadingPrices]);

  const getPrice = useCallback((product: { code: string; brand: string; id: string }) => {
    const key = `${product.id}_${product.code}_${product.brand}`;
    return pricesMap.get(key);
  }, [pricesMap]);

  const isLoadingPrice = useCallback((product: { code: string; brand: string; id: string }) => {
    const key = `${product.id}_${product.code}_${product.brand}`;
    return loadingPrices.has(key);
  }, [loadingPrices]);

  const ensurePriceLoaded = useCallback((product: { code: string; brand: string; id: string }) => {
    const key = `${product.id}_${product.code}_${product.brand}`;
    if (!loadedPrices.has(key) && !loadingPrices.has(key)) {
      loadPrice(product);
    }
  }, [loadPrice, loadedPrices, loadingPrices]);

  return {
    getPrice,
    isLoadingPrice,
    loadPrice,
    ensurePriceLoaded
  };
}; 