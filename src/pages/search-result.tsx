import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo, useRef } from "react";
import { useQuery, useLazyQuery } from "@apollo/client";
import Header from "@/components/Header";
import { emitAnalyticsSearch } from "@/lib/utils";
import Footer from "@/components/Footer";
import CatalogSubscribe from "@/components/CatalogSubscribe";
import Filters, { FilterConfig } from "@/components/Filters";
import BestPriceCard from "@/components/BestPriceCard";
import CoreProductCard from "@/components/CoreProductCard";
import AnalogueBlock from "@/components/AnalogueBlock";
import InfoSearch from "@/components/InfoSearch";
import FiltersPanelMobile from "@/components/FiltersPanelMobile";
import CatalogSortDropdown from "@/components/CatalogSortDropdown";
import MobileMenuBottomSection from '../components/MobileMenuBottomSection';
import Loader from "@/components/Loader";
import { SEARCH_PRODUCT_OFFERS, GET_ANALOG_OFFERS } from "@/lib/graphql";
import { useArticleImage } from "@/hooks/useArticleImage";
import { usePartsIndexEntityInfo } from "@/hooks/usePartsIndex";
import { useCart } from "@/contexts/CartContext";
import MetaTags from "@/components/MetaTags";
import { createProductMeta } from "@/lib/meta-config";

const ANALOGS_CHUNK_SIZE = 5;

const formatDeliveryDuration = (deliveryDays?: number | string | null): string => {
  if (deliveryDays === undefined || deliveryDays === null) {
    return 'Уточняйте';
  }

  const numericValue = typeof deliveryDays === 'string' ? parseInt(deliveryDays, 10) : deliveryDays;

  if (Number.isNaN(numericValue)) {
    return 'Уточняйте';
  }

  if (numericValue <= 0) {
    return 'В день заказа';
  }

  const days = Math.round(numericValue);
  const lastDigit = days % 10;
  const lastTwoDigits = days % 100;

  let suffix = 'дней';
  if (lastDigit === 1 && lastTwoDigits !== 11) {
    suffix = 'день';
  } else if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    suffix = 'дня';
  }

  return `${days} ${suffix}`;
};

// Функция для создания динамических фильтров
const createFilters = (result: any, loadedAnalogs: any): FilterConfig[] => {
  const filters: FilterConfig[] = [];

  if (result) {
    // Фильтр по производителю
    const brands = new Set<string>();
    brands.add(result.brand);
    
    result.externalOffers?.forEach((offer: any) => {
      if (offer.brand) brands.add(offer.brand);
    });
    
    result.analogs?.forEach((analog: any) => {
      if (analog.brand) brands.add(analog.brand);
    });

    if (brands.size > 1) {
      filters.push({
        type: "dropdown",
        title: "Производитель",
        options: Array.from(brands).sort(),
        multi: true,
        showAll: true,
      });
    }

    // Получаем все доступные предложения для расчета диапазонов
    const allAvailableOffers: any[] = [];
    
    // Добавляем основные предложения
    result.internalOffers?.forEach((offer: any) => {
      allAvailableOffers.push(offer);
    });
    result.externalOffers?.forEach((offer: any) => {
      allAvailableOffers.push(offer);
    });
    
    // Добавляем предложения аналогов
    Object.values(loadedAnalogs).forEach((analog: any) => {
      analog.internalOffers?.forEach((offer: any) => {
        allAvailableOffers.push({
          ...offer,
          deliveryDuration: offer.deliveryDays
        });
      });
      analog.externalOffers?.forEach((offer: any) => {
        allAvailableOffers.push({
          ...offer,
          deliveryDuration: offer.deliveryTime
        });
      });
    });

    // Фильтр по цене - только если есть предложения с разными ценами
    const prices: number[] = [];
    allAvailableOffers.forEach((offer: any) => {
      if (offer.price > 0) prices.push(offer.price);
    });

    if (prices.length > 1) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      if (maxPrice > minPrice) {
        filters.push({
          type: "range",
          title: "Цена (₽)",
          min: Math.floor(minPrice),
          max: Math.ceil(maxPrice),
        });
      }
    }

    // Фильтр по сроку доставки - только если есть предложения с разными сроками
    const deliveryDays: number[] = [];
    allAvailableOffers.forEach((offer: any) => {
      const days = offer.deliveryDays || offer.deliveryTime || offer.deliveryDuration;
      if (days && days > 0) deliveryDays.push(days);
    });

    if (deliveryDays.length > 1) {
      const minDays = Math.min(...deliveryDays);
      const maxDays = Math.max(...deliveryDays);
      
      if (maxDays > minDays) {
        filters.push({
          type: "range",
          title: "Срок доставки (дни)",
          min: minDays,
          max: maxDays,
        });
      }
    }

    // Фильтр по количеству наличия - только если есть предложения с разными количествами
    const quantities: number[] = [];
    allAvailableOffers.forEach((offer: any) => {
      if (offer.quantity && offer.quantity > 0) quantities.push(offer.quantity);
    });

    if (quantities.length > 1) {
      const minQuantity = Math.min(...quantities);
      const maxQuantity = Math.max(...quantities);
      
      if (maxQuantity > minQuantity) {
        filters.push({
          type: "range",
          title: "Количество (шт.)",
          min: minQuantity,
          max: maxQuantity,
        });
      }
    }
  }

  return filters;
};

// Функция для получения лучших предложений по заданным критериям
const getBestOffers = (offers: any[]) => {
  const validOffers = offers.filter((offer) => offer.price > 0 && typeof offer.deliveryDuration !== 'undefined');
  const baseOffers = validOffers.filter((offer) => !offer.isAnalog);
  const analogOffers = validOffers.filter((offer) => offer.isAnalog);

  if (baseOffers.length === 0 && analogOffers.length === 0) return [];

  // Разделяем на внутренние (наши) и внешние предложения
  const internalOffers = baseOffers.filter((offer) => offer.productId && !offer.isExternal);
  const externalOffers = baseOffers.filter((offer) => !offer.productId || offer.isExternal);

  const result: { offer: any; type: string }[] = [];

  // 1. Самая низкая цена - приоритет внутренним предложениям
  let lowestPriceOffer;
  if (internalOffers.length > 0) {
    // Если есть внутренние предложения, выбираем из них
    lowestPriceOffer = [...internalOffers].sort((a, b) => a.price - b.price)[0];
  } else {
    // Если нет внутренних, берем из всех базовых
    lowestPriceOffer = [...baseOffers].sort((a, b) => a.price - b.price)[0];
  }
  if (lowestPriceOffer) {
    result.push({ offer: lowestPriceOffer, type: 'Самая низкая цена' });
  }

  // 2. Самая быстрая доставка - приоритет внутренним предложениям
  let fastestDeliveryOffer;
  if (internalOffers.length > 0) {
    // Если есть внутренние предложения, выбираем из них
    fastestDeliveryOffer = [...internalOffers].sort((a, b) => a.deliveryDuration - b.deliveryDuration)[0];
  } else {
    // Если нет внутренних, берем из всех базовых
    fastestDeliveryOffer = [...baseOffers].sort((a, b) => a.deliveryDuration - b.deliveryDuration)[0];
  }
  if (fastestDeliveryOffer) {
    result.push({ offer: fastestDeliveryOffer, type: 'Самая быстрая доставка' });
  }

  // 3. Самый дешевый аналог (если есть аналоги)
  if (analogOffers.length > 0) {
    const cheapestAnalog = [...analogOffers].sort((a, b) => a.price - b.price)[0];
    if (cheapestAnalog) {
      result.push({ offer: cheapestAnalog, type: 'Самый дешевый аналог' });
    }
  }

  return result;
};

// Убрано: функция сортировки теперь в CoreProductCard

// Функция для проверки соответствия бренда
// Проверяет, является ли наш бренд (из БД) частью бренда от Laxima
// Пример: наш "MAHLE" является частью "KNECHT/MAHLE" от Laxima
// Пример: наш "BMW" является частью "BMW/MINI/RR" от Laxima
const brandMatches = (offerBrand: string, searchBrands: string[]): boolean => {
  if (searchBrands.length === 0) return true;

  const offerBrandUpper = offerBrand.toUpperCase();
  const offerBrandParts = offerBrandUpper.split('/').map(b => b.trim());

  return searchBrands.some(searchBrand => {
    const searchBrandUpper = searchBrand.toUpperCase();
    // Проверяем:
    // 1. Точное совпадение
    // 2. ИЛИ наш бренд является одной из частей составного бренда Laxima
    return offerBrandUpper === searchBrandUpper ||
           offerBrandParts.includes(searchBrandUpper);
  });
};

// Функция для проверки наличия товара на складе
const checkProductStock = (result: any): boolean => {
  if (!result) return false;

  // Используем новые данные stockCalculation если доступны
  if (result.stockCalculation) {
    return result.stockCalculation.hasAnyStock;
  }

  // Fallback к старой логике для обратной совместимости
  const hasInternalStock = result.internalOffers?.some((offer: any) =>
    offer.quantity > 0 && offer.available
  );

  const hasExternalStock = result.externalOffers?.some((offer: any) =>
    offer.quantity > 0
  );

  return hasInternalStock || hasExternalStock;
};

const transformOffersForCard = (offers: any[], hasStock: boolean = true) => {
  return offers.map((offer) => {
    const isExternal = offer.type === 'external';
    const deliveryDays = isExternal ? offer.deliveryTime : offer.deliveryDays;

    // Создаем уникальный ключ для каждого предложения
    // Комбинируем тип, id/offerKey, поставщика, склад, цену и срок доставки
    const uniqueKey = isExternal
      ? `ext-${offer.offerKey || offer.id}-${offer.supplier}-${offer.warehouse}-${offer.price}-${deliveryDays}`
      : `int-${offer.productId || offer.id}`;

    return {
      id: offer.id,
      productId: offer.productId,
      offerKey: uniqueKey, // Используем уникальный ключ вместо оригинального offerKey
      pcs: `${offer.quantity} шт.`,
      quantity: offer.quantity, // Добавляем чистое число для использования в max и валидации
      days: formatDeliveryDuration(deliveryDays),
      recommended: !isExternal,
      price: `${new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(offer.price || 0)} ₽`,
      count: "1",
      isExternal,
      currency: offer.currency || "RUB",
      warehouse: offer.stock || offer.warehouse,
      supplier: offer.supplier,
      deliveryTime: deliveryDays,
      hasStock, // Добавляем информацию о наличии
      brandName: offer.brand || '',
      articleNumber: offer.articleNumber || offer.code || offer.article || '',
      productName: offer.name || `${offer.brand || ''} ${offer.articleNumber || ''}`.trim(),
      region: offer.region || 'Москва',
    };
  });
};

export default function SearchResult() {
  const router = useRouter();
  const { article, brand, q, artId } = router.query;
  const { state: cartState } = useCart();
  
  // Убрано: глобальная сортировка теперь не используется
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [showSortMobile, setShowSortMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [brandQuery, setBrandQuery] = useState<string>("");
  const [loadedAnalogs, setLoadedAnalogs] = useState<{ [key: string]: any }>({});
  const [visibleAnalogsCount, setVisibleAnalogsCount] = useState(ANALOGS_CHUNK_SIZE);

  // Состояния для фильтров
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [deliveryRange, setDeliveryRange] = useState<[number, number] | null>(null);
  const [quantityRange, setQuantityRange] = useState<[number, number] | null>(null);
  const [filterSearchTerm, setFilterSearchTerm] = useState<string>('');

  useEffect(() => {
    if (article && typeof article === 'string') {
      setSearchQuery(article.trim().toUpperCase());
    }
    if (brand && typeof brand === 'string') {
      setBrandQuery(brand.trim());
    }
    setLoadedAnalogs({});
    setVisibleAnalogsCount(ANALOGS_CHUNK_SIZE);
  }, [article, brand]);

  // Подготавливаем данные корзины для отправки на backend ТОЛЬКО при первой загрузке
  const initialCartSnapshotRef = useRef<{ productId?: string; offerKey?: string; article: string; brand: string; quantity: number }[] | null>(null);
  const lastSnapshotSearchKey = useRef<string | null>(null);
  const currentSnapshotKey = `${searchQuery || ''}__${brandQuery || ''}`;

  // Update snapshot ONLY if search key changed (not when cart changes!)
  if (initialCartSnapshotRef.current === null || lastSnapshotSearchKey.current !== currentSnapshotKey) {
    initialCartSnapshotRef.current = cartState.items.map(item => ({
      productId: item.productId,
      offerKey: item.offerKey,
      article: item.article || '',
      brand: item.brand || '',
      quantity: item.quantity
    }));
    lastSnapshotSearchKey.current = currentSnapshotKey;
  }

  const initialCartItems = initialCartSnapshotRef.current;

  const { data, loading, error, networkStatus } = useQuery(SEARCH_PRODUCT_OFFERS, {
    variables: {
      articleNumber: searchQuery,
      brand: brandQuery || '', // Используем пустую строку если бренд не указан
      cartItems: initialCartItems // Используем снапшот, который НЕ меняется при добавлении в корзину
    },
    skip: !searchQuery,
    errorPolicy: 'all',
    fetchPolicy: 'network-only', // Всегда делаем запрос к серверу для актуальных данных
    notifyOnNetworkStatusChange: true // Получаем обновления networkStatus
  });

  // Показываем полноэкранный лоадер только при первоначальной загрузке страницы (когда еще нет данных)
  // При обновлении корзины (networkStatus 2,3,6,7,8) уже есть данные, поэтому лоадер не показываем
  const isInitialLoading = loading && !data;
  
  const { imageUrl: mainImageUrl } = useArticleImage(artId as string, { enabled: !!artId });
  
  // Получаем информацию о детали из Parts Index
  const { entityInfo, loading: partsIndexLoading } = usePartsIndexEntityInfo(
    searchQuery || null,
    brandQuery || null
  );

  const [
    getAnalogOffers,
    { loading: analogsLoading, data: analogsData }
  ] = useLazyQuery(GET_ANALOG_OFFERS, {
    onCompleted: (data) => {
      if (data && data.getAnalogOffers) {
        const newAnalogs = data.getAnalogOffers.reduce((acc: any, analog: any) => {
          const key = `${analog.brand}-${analog.articleNumber}`;
          // Сразу трансформируем, но пока не используем
          // const offers = transformOffersForCard(analog.internalOffers, analog.externalOffers);
          acc[key] = { ...analog }; // offers убрали, т.к. allOffers - единый источник
          return acc;
        }, {});
        setLoadedAnalogs(prev => ({ ...prev, ...newAnalogs }));
      }
    }
  });

  // Эффект для автоматической загрузки предложений видимых аналогов
  useEffect(() => {
    if (data?.searchProductOffers?.analogs) {
      const analogsToLoad = data.searchProductOffers.analogs
        .slice(0, visibleAnalogsCount)
        .filter((a: any) => !loadedAnalogs[`${a.brand}-${a.articleNumber}`])
        .map((a: any) => ({ brand: a.brand, articleNumber: a.articleNumber }));

      if (analogsToLoad.length > 0) {
        getAnalogOffers({ variables: { analogs: analogsToLoad } });
      }
    }
  }, [visibleAnalogsCount, data, getAnalogOffers, loadedAnalogs]);

  const result = data?.searchProductOffers;

  const allOffers = useMemo(() => {
    if (!result) return [];

    const offers: any[] = [];

    // Основной товар
    // Фильтруем внутренние офферы - не добавляем товары с нулевой ценой или наличием
    result.internalOffers.forEach((o: any) => {
      if (o.price && o.price > 0 && o.quantity && o.quantity > 0) {
        offers.push({ ...o, deliveryDuration: o.deliveryDays, type: 'internal', brand: result.brand, articleNumber: result.articleNumber, name: result.name });
      }
    });
    result.externalOffers.forEach((o: any) => offers.push({ ...o, deliveryDuration: o.deliveryTime, type: 'external', articleNumber: o.code, name: o.name }));

    // Аналоги
    Object.values(loadedAnalogs).forEach((analog: any) => {
      // Фильтруем внутренние офферы аналогов - не добавляем товары с нулевой ценой или наличием
      analog.internalOffers.forEach((o: any) => {
        if (o.price && o.price > 0 && o.quantity && o.quantity > 0) {
          offers.push({ ...o, deliveryDuration: o.deliveryDays, type: 'internal', brand: analog.brand, articleNumber: analog.articleNumber, name: analog.name, isAnalog: true });
        }
      });
      analog.externalOffers.forEach((o: any) => offers.push({ ...o, deliveryDuration: o.deliveryTime, type: 'external', brand: o.brand || analog.brand, articleNumber: o.code || analog.articleNumber, name: o.name, isAnalog: true }));
    });

    return offers;
  }, [result, loadedAnalogs]);


  const filteredOffers = useMemo(() => {
    return allOffers.filter(offer => {
      // Фильтр по бренду
      if (!brandMatches(offer.brand, selectedBrands)) {
        return false;
      }
      // Фильтр по цене
      if (priceRange && (offer.price < priceRange[0] || offer.price > priceRange[1])) {
        return false;
      }
      // Фильтр по сроку доставки
      if (deliveryRange) {
        const deliveryDays = offer.deliveryDuration;
        if (deliveryDays < deliveryRange[0] || deliveryDays > deliveryRange[1]) {
          return false;
        }
      }
      // Фильтр по количеству наличия
      if (quantityRange) {
        const quantity = offer.quantity;
        if (quantity < quantityRange[0] || quantity > quantityRange[1]) {
          return false;
        }
      }
      // Фильтр по поисковой строке
      if (filterSearchTerm) {
        const searchTerm = filterSearchTerm.toLowerCase();
        const brandMatch = offer.brand.toLowerCase().includes(searchTerm);
        const articleMatch = offer.articleNumber.toLowerCase().includes(searchTerm);
        const nameMatch = offer.name.toLowerCase().includes(searchTerm);
        if (!brandMatch && !articleMatch && !nameMatch) {
          return false;
        }
      }
      return true;
    });
  }, [allOffers, selectedBrands, priceRange, deliveryRange, quantityRange, filterSearchTerm]);
  
  const handleFilterChange = (type: string, value: any) => {
    if (type === 'Производитель') {
        setSelectedBrands(value);
    } else if (type === 'Цена (₽)') {
        setPriceRange(value);
    } else if (type === 'Срок доставки (дни)') {
        setDeliveryRange(value);
    } else if (type === 'Количество (шт.)') {
        setQuantityRange(value);
    } else if (type === 'search') {
        setFilterSearchTerm(value);
    }
  };

  const initialOffersExist = allOffers.length > 0;
  
  const filtersAreActive = selectedBrands.length > 0 || priceRange !== null || deliveryRange !== null || quantityRange !== null || filterSearchTerm !== '';

  const hasOffers = result && (result.internalOffers.length > 0 || result.externalOffers.length > 0);
  const hasAnalogs = result && result.analogs.length > 0;
  
  // Создаем динамические фильтры на основе доступных данных с учетом активных фильтров
  const searchResultFilters = useMemo(() => {
    const baseFilters = createFilters(result, loadedAnalogs);
    
    // Если нет активных фильтров, возвращаем базовые фильтры
    if (!filtersAreActive) {
      return baseFilters;
    }
    
    // Создаем динамические фильтры с учетом других активных фильтров
    return baseFilters.map(filter => {
      if (filter.type !== 'range') {
        return filter;
      }
      
      // Для каждого диапазонного фильтра пересчитываем границы на основе
      // предложений, отфильтрованных другими фильтрами (исключая текущий)
      let relevantOffers = allOffers;
      
      // Применяем все фильтры кроме текущего
      relevantOffers = allOffers.filter(offer => {
        // Фильтр по бренду (если это не фильтр производителя)
        if (filter.title !== 'Производитель' && !brandMatches(offer.brand, selectedBrands)) {
          return false;
        }
        // Фильтр по цене (если это не фильтр цены)
        if (filter.title !== 'Цена (₽)' && priceRange && (offer.price < priceRange[0] || offer.price > priceRange[1])) {
          return false;
        }
        // Фильтр по сроку доставки (если это не фильтр доставки)
        if (filter.title !== 'Срок доставки (дни)' && deliveryRange) {
          const deliveryDays = offer.deliveryDuration;
          if (deliveryDays < deliveryRange[0] || deliveryDays > deliveryRange[1]) {
            return false;
          }
        }
        // Фильтр по количеству (если это не фильтр количества)
        if (filter.title !== 'Количество (шт.)' && quantityRange) {
          const quantity = offer.quantity;
          if (quantity < quantityRange[0] || quantity > quantityRange[1]) {
            return false;
          }
        }
        // Фильтр по поисковой строке
        if (filterSearchTerm) {
          const searchTerm = filterSearchTerm.toLowerCase();
          const brandMatch = offer.brand.toLowerCase().includes(searchTerm);
          const articleMatch = offer.articleNumber.toLowerCase().includes(searchTerm);
          const nameMatch = offer.name.toLowerCase().includes(searchTerm);
          if (!brandMatch && !articleMatch && !nameMatch) {
            return false;
          }
        }
        return true;
      });
      
      // Пересчитываем диапазон на основе отфильтрованных предложений
      if (filter.title === 'Цена (₽)') {
        const prices = relevantOffers.filter(o => o.price > 0).map(o => o.price);
        if (prices.length > 0) {
          return {
            ...filter,
            min: Math.floor(Math.min(...prices)),
            max: Math.ceil(Math.max(...prices))
          };
        }
      } else if (filter.title === 'Срок доставки (дни)') {
        const deliveryDays = relevantOffers
          .map(o => o.deliveryDuration)
          .filter(d => d && d > 0);
        if (deliveryDays.length > 0) {
          return {
            ...filter,
            min: Math.min(...deliveryDays),
            max: Math.max(...deliveryDays)
          };
        }
      } else if (filter.title === 'Количество (шт.)') {
        const quantities = relevantOffers
          .map(o => o.quantity)
          .filter(q => q && q > 0);
        if (quantities.length > 0) {
          return {
            ...filter,
            min: Math.min(...quantities),
            max: Math.max(...quantities)
          };
        }
      }
      
      return filter;
    });
  }, [result, loadedAnalogs, filtersAreActive, allOffers, selectedBrands, priceRange, deliveryRange, quantityRange, filterSearchTerm]);
  
  const bestOffersData = getBestOffers(filteredOffers);
  // Отправка события поиска при готовности данных
  useEffect(() => {
    if (searchQuery) {
      const resultsCount = result ? (result.totalOffers || filteredOffers.length || 0) : 0
      emitAnalyticsSearch({
        query: searchQuery,
        brand: brandQuery || undefined,
        article: searchQuery,
        filters: {
          brands: selectedBrands,
          priceRange,
          deliveryRange,
          quantityRange,
          search: filterSearchTerm,
        },
        resultsCount
      })
    }
  }, [searchQuery, brandQuery, result, filteredOffers.length, selectedBrands, priceRange, deliveryRange, quantityRange, filterSearchTerm])



  // Если это поиск по параметру q (из UnitDetailsSection), используем q как article
  useEffect(() => {
    if (q && typeof q === 'string' && !article) {
      setSearchQuery(q.trim().toUpperCase());
      // Определяем бренд из каталога или используем дефолтный
      const catalogFromUrl = router.query.catalog as string;
      const vehicleFromUrl = router.query.vehicle as string;
      
      if (catalogFromUrl) {
        // Маппинг каталогов к брендам
        const catalogToBrandMap: { [key: string]: string } = {
          'AU1587': 'AUDI',
          'VW1587': 'VOLKSWAGEN',
          'BMW1587': 'BMW',
          'MB1587': 'MERCEDES-BENZ',
          // Добавьте другие маппинги по необходимости
        };
        
        setBrandQuery(catalogToBrandMap[catalogFromUrl] || '');
      } else {
        setBrandQuery('');
      }
    }
  }, [q, article, router.query]);



  // Удаляем старую заглушку - теперь обрабатываем все типы поиска

  const minPrice = useMemo(() => {
    if (result && result.minPrice) return result.minPrice;
    if (allOffers.length > 0) {
      const prices = allOffers.filter(o => o.price > 0).map(o => o.price);
      if (prices.length > 0) {
        return `${Math.min(...prices).toLocaleString('ru-RU')} ₽`;
      }
    }
    return "-";
  }, [result, allOffers]);

  if (isInitialLoading) {
    return (
      <>
        <Head>
          <title>Поиск предложений {searchQuery} - Protek</title>
        </Head>
        <Loader text="Поиск предложений" fullScreen />
        <Footer />
      </>
    );
  }

  // Создаем динамические meta-теги для товара
  const metaData = result ? createProductMeta({
    name: result.name,
    brand: result.brand,
    articleNumber: result.articleNumber,
    price: minPrice
  }) : {
    title: 'Результаты поиска - Protek',
    description: 'Результаты поиска автозапчастей. Найдите нужные запчасти среди широкого ассортимента.',
    keywords: 'результаты поиска, поиск запчастей, найти запчасти'
  };

  return (
    <>
      <MetaTags {...metaData} />
      {/* Показываем InfoSearch только если есть результаты */}
      {initialOffersExist && (
        <InfoSearch
          brand={result ? result.brand : brandQuery}
          articleNumber={result ? result.articleNumber : searchQuery}
          name={result ? result.name : "деталь"}
          offersCount={result ? result.totalOffers : 0}
          minPrice={minPrice}
        />
      )}
      {/* Показываем мобильные фильтры только если есть результаты */}
      {initialOffersExist && (
        <>
          <section className="main mobile-only">
            <div className="w-layout-blockcontainer container w-container">
              <div className="w-layout-hflex flex-block-84">
                {/* Глобальная сортировка убрана - теперь каждый товар сортируется индивидуально */}
                <div className="w-layout-hflex flex-block-85" onClick={() => setShowFiltersMobile((v) => !v)}>
                <span className="code-embed-9 w-embed">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 4H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 4H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 20H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 20H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <div>Фильтры</div>
                </div>
              </div>
            </div>
          </section>
          {/* Мобильная панель фильтров */}
          <FiltersPanelMobile
            filters={searchResultFilters}
            open={showFiltersMobile}
            onClose={() => setShowFiltersMobile(false)}
            searchQuery={filterSearchTerm}
            onSearchChange={(value) => handleFilterChange('search', value)}
          />
        </>
      )}
      {/* Лучшие предложения */}
      {bestOffersData.length > 0 && (
        <section className="main">
          <div className="w-layout-blockcontainer container w-container">
            <div className="w-layout-vflex flex-block-36">
              {bestOffersData.map(({ offer, type }, index) => (
                <BestPriceCard
                  key={`best-${type}-${index}`}
                  bestOfferType={type}
                  title={`${offer.brand} ${offer.articleNumber}${offer.isAnalog ? ' (аналог)' : ''}`}
                  description={offer.name}
                  price={`${offer.price.toLocaleString()} ₽`}
                  delivery={formatDeliveryDuration(offer.deliveryDuration)}
                  stock={`${offer.quantity} шт.`}
                  offer={offer}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Если нет предложений после фильтрации, но они были изначально */}
      {initialOffersExist && filteredOffers.length === 0 && !loading && (
        <section>
          <div className="w-layout-blockcontainer container w-container">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Нет предложений, соответствующих вашим фильтрам
              </h3>
              <p className="text-gray-600">
                Попробуйте изменить или сбросить фильтры.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Если изначально не было предложений */}
      {!initialOffersExist && !loading && (
        <section>
          <div className="w-layout-blockcontainer container w-container">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                К сожалению, предложений по данному артикулу не найдено
              </h3>
              <p className="text-gray-600 mb-6">
                Попробуйте изменить параметры поиска или обратитесь к нашим менеджерам
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Телефон: +7 (495) 123-45-67</p>
                <p className="text-sm text-gray-500">Email: info@protek.ru</p>
              </div>
            </div>
          </div>
        </section>
      )}
      {/* Показываем основную секцию с фильтрами только если есть результаты */}
      {initialOffersExist && (
        <section className="main">
          <div className="w-layout-blockcontainer container w-container">
            <div className="w-layout-hflex flex-block-13-copy">
              {/* Фильтры для десктопа */}
              <div className="filters-desktop-wrapper">
                <Filters 
                  filters={searchResultFilters}
                  onFilterChange={handleFilterChange}
                  filterValues={{
                    'Производитель': selectedBrands,
                    'Цена (₽)': priceRange,
                    'Срок доставки (дни)': deliveryRange,
                    'Количество (шт.)': quantityRange
                  }}
                  searchQuery={filterSearchTerm}
                  onSearchChange={(value) => handleFilterChange('search', value)}
                />
              </div>

            {/* Основной товар */}
            <div className="w-layout-vflex flex-block-14-copy">
              {hasOffers && result && (() => {
                const hasMainProductStock = checkProductStock(result);
                const mainProductOffers = transformOffersForCard(
                  filteredOffers.filter(o => !o.isAnalog),
                  hasMainProductStock
                );
                
                // Не показываем основной товар, если у него нет предложений
                if (mainProductOffers.length === 0) {
                  return null;
                }

                // Используем фотографию только из Parts Index, если она есть
                const partsIndexImage = entityInfo?.images?.[0];

                return (
                  <>
                    <CoreProductCard
                      brand={result.brand}
                      article={result.articleNumber}
                      name={result.name}
                      {...(partsIndexImage ? { image: partsIndexImage } : {})}
                      offers={mainProductOffers}
                      showMoreText={mainProductOffers.length < filteredOffers.filter(o => !o.isAnalog).length ? "Показать еще" : undefined}
                      partsIndexPowered={!!partsIndexImage}
                      hasStock={hasMainProductStock}
                    />
                  </>
                );
              })()}
              
              {/* Аналоги */}
              {hasAnalogs && result && (() => {
                // Фильтруем аналоги с предложениями
                const analogsWithOffers = result.analogs.slice(0, visibleAnalogsCount).filter((analog: any) => {
                  const analogKey = `${analog.brand}-${analog.articleNumber}`;
                  const loadedAnalogData = loadedAnalogs[analogKey];
                  
                  if (!loadedAnalogData) {
                    return true; // Показываем загружающиеся аналоги
                  }
                  
                  // Проверяем, есть ли предложения у аналога
                  const hasInternalOffers = loadedAnalogData.internalOffers && loadedAnalogData.internalOffers.length > 0;
                  const hasExternalOffers = loadedAnalogData.externalOffers && loadedAnalogData.externalOffers.length > 0;
                  
                  return hasInternalOffers || hasExternalOffers;
                });

                // Если нет аналогов с предложениями, не показываем секцию
                if (analogsWithOffers.length === 0) {
                  return null;
                }
                return (
                  <>
                    <h2 className="heading-11">Аналоги</h2>
                    {analogsWithOffers.map((analog: any, index: number) => {
                      const analogKey = `${analog.brand}-${analog.articleNumber}`;
                      const loadedAnalogData = loadedAnalogs[analogKey];
                      
                      // Если данные аналога загружены, формируем предложения из всех его данных
                      const analogOffers = loadedAnalogData ? (() => {
                        const allAnalogOffers: any[] = [];
                        
                        // Добавляем внутренние предложения
                        if (loadedAnalogData.internalOffers) {
                          loadedAnalogData.internalOffers.forEach((offer: any) => {
                            allAnalogOffers.push({
                              ...offer,
                              type: 'internal',
                              brand: loadedAnalogData.brand,
                              articleNumber: loadedAnalogData.articleNumber,
                              name: loadedAnalogData.name,
                              isAnalog: true,
                              deliveryDuration: offer.deliveryDays
                            });
                          });
                        }
                        
                        // Добавляем внешние предложения
                        if (loadedAnalogData.externalOffers) {
                          loadedAnalogData.externalOffers.forEach((offer: any) => {
                            allAnalogOffers.push({
                              ...offer,
                              type: 'external',
                              brand: offer.brand || loadedAnalogData.brand,
                              articleNumber: offer.code || loadedAnalogData.articleNumber,
                              name: offer.name || loadedAnalogData.name,
                              isAnalog: true,
                              deliveryDuration: offer.deliveryTime
                            });
                          });
                        }
                        
                        // Применяем фильтры только если они активны
                        const filteredAnalogOffers = allAnalogOffers.filter(offer => {
                          // Фильтр по бренду
                          if (!brandMatches(offer.brand, selectedBrands)) {
                            return false;
                          }
                          // Фильтр по цене
                          if (priceRange && (offer.price < priceRange[0] || offer.price > priceRange[1])) {
                            return false;
                          }
                          // Фильтр по сроку доставки
                          if (deliveryRange) {
                            const deliveryDays = offer.deliveryDuration;
                            if (deliveryDays < deliveryRange[0] || deliveryDays > deliveryRange[1]) {
                              return false;
                            }
                          }
                          // Фильтр по количеству наличия
                          if (quantityRange) {
                            const quantity = offer.quantity;
                            if (quantity < quantityRange[0] || quantity > quantityRange[1]) {
                              return false;
                            }
                          }
                          // Фильтр по поисковой строке
                          if (filterSearchTerm) {
                            const searchTerm = filterSearchTerm.toLowerCase();
                            const brandMatch = offer.brand.toLowerCase().includes(searchTerm);
                            const articleMatch = offer.articleNumber.toLowerCase().includes(searchTerm);
                            const nameMatch = offer.name.toLowerCase().includes(searchTerm);
                            if (!brandMatch && !articleMatch && !nameMatch) {
                              return false;
                            }
                          }
                          return true;
                        });
                        
                        return transformOffersForCard(filteredAnalogOffers, checkProductStock(loadedAnalogData));
                      })() : [];

                      const hasAnalogStock = loadedAnalogData ? checkProductStock(loadedAnalogData) : true;
                      
                      return (
                        <CoreProductCard
                            key={analogKey}
                            brand={analog.brand}
                            article={analog.articleNumber}
                            name={analog.name}
                            offers={analogOffers}
                            isAnalog
                            isLoadingOffers={!loadedAnalogData}
                            hasStock={hasAnalogStock}
                        />
                      )
                    })}

                    {(() => {
                      // Проверяем, есть ли еще аналоги с предложениями для загрузки
                      const remainingAnalogs = result.analogs.slice(visibleAnalogsCount);
                      const hasMoreAnalogsWithOffers = remainingAnalogs.length > 0;

                      return hasMoreAnalogsWithOffers && (
                        <div className="w-layout-hflex pagination">
<button
  onClick={() => setVisibleAnalogsCount(prev => prev + ANALOGS_CHUNK_SIZE)}
  disabled={analogsLoading}
  className="button_strock w-button"
>
  {analogsLoading ? "Загружаем..." : "Показать еще"}
</button>
</div>
                      );
                    })()}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </section>      
      )}
      {/* Показываем CatalogSubscribe только если есть результаты */}
      {initialOffersExist && (
        <section className="section-3">
          <CatalogSubscribe />
        </section>
      )}
      <Footer />
      <MobileMenuBottomSection />
    </>
  );
} 
