import Head from "next/head";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductListCard from "@/components/ProductListCard";
import Filters, { FilterConfig } from "@/components/Filters";
import FiltersWithSearch from "@/components/FiltersWithSearch";
import CatalogProductCard from "@/components/CatalogProductCard";
import CatalogPagination from "@/components/CatalogPagination";
import CatalogSubscribe from "@/components/CatalogSubscribe";
import CatalogInfoHeader from "@/components/CatalogInfoHeader";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { useQuery } from '@apollo/client';
import FiltersPanelMobile from '@/components/FiltersPanelMobile';
import MobileMenuBottomSection from '../components/MobileMenuBottomSection';
import { GET_PARTSAPI_ARTICLES, GET_PARTSAPI_MAIN_IMAGE, SEARCH_PRODUCT_OFFERS, GET_PARTSINDEX_CATALOG_ENTITIES, GET_PARTSINDEX_CATALOG_PARAMS } from '@/lib/graphql';
import { PartsAPIArticlesData, PartsAPIArticlesVariables, PartsAPIArticle, PartsAPIMainImageData, PartsAPIMainImageVariables } from '@/types/partsapi';
import { PartsIndexEntitiesData, PartsIndexEntitiesVariables, PartsIndexEntity, PartsIndexParamsData, PartsIndexParamsVariables } from '@/types/partsindex';
import LoadingSpinner from '@/components/LoadingSpinner';
import ArticleCard from '@/components/ArticleCard';
import CatalogEmptyState from '@/components/CatalogEmptyState';
import { useProductPrices } from '@/hooks/useProductPrices';
import { PriceSkeleton } from '@/components/skeletons/ProductListSkeleton';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';
import CartIcon from '@/components/CartIcon';
import MetaTags from "@/components/MetaTags";
import { getMetaByPath, createCategoryMeta } from "@/lib/meta-config";
import JsonLdScript from "@/components/JsonLdScript";
import { generateBreadcrumbSchema, generateWebSiteSchema } from "@/lib/schema";

const mockData = Array(12).fill({
  image: "",
  discount: "-35%",
  price: "от 17 087 ₽",
  oldPrice: "22 347 ₽",
  title: 'Аккумуляторная батарея TYUMEN BATTERY "STANDARD", 6CT-60L, 60',
  brand: "Borsehung",
});

export default function Catalog() {
  const ITEMS_PER_PAGE = 24; // Показывать 12 карточек за раз
  const PARTSINDEX_PAGE_SIZE = 25; // Синхронизировано для оптимальной скорости
  const MAX_BRANDS_DISPLAY = 24; // Сколько брендов показывать изначально
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const router = useRouter();
  const { addItem, isInCart: isItemInCart } = useCart();
  const { 
    partsApiCategory: strId, 
    categoryName,
    partsIndexCatalog: catalogId,
    partsIndexCategory: groupId
  } = router.query;
  
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [showSortMobile, setShowSortMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<{[key: string]: string[]}>({});
  
  // Инициализация фильтров из URL при загрузке
  useEffect(() => {
    if (router.isReady) {
      const urlFilters: {[key: string]: string[]} = {};
      const urlSearchQuery = router.query.q as string || '';
      
      // Восстанавливаем фильтры из URL
      Object.keys(router.query).forEach(key => {
        if (key.startsWith('filter_')) {
          const filterName = key.replace('filter_', '');
          const filterValue = router.query[key];
          if (typeof filterValue === 'string') {
            urlFilters[filterName] = [filterValue];
          } else if (Array.isArray(filterValue)) {
            urlFilters[filterName] = filterValue;
          }
        }
      });
      
      console.log('🔗 Восстанавливаем фильтры из URL:', { urlFilters, urlSearchQuery });
      
      if (Object.keys(urlFilters).length > 0) {
        setSelectedFilters(urlFilters);
      }
      if (urlSearchQuery) {
        setSearchQuery(urlSearchQuery);
      }
    }
  }, [router.isReady]);
  const [visibleArticles, setVisibleArticles] = useState<PartsAPIArticle[]>([]);
  const [visibleEntities, setVisibleEntities] = useState<PartsIndexEntity[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entitiesPage, setEntitiesPage] = useState(1); // Страница для PartsIndex
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreEntities, setHasMoreEntities] = useState(true); // Есть ли еще товары на сервере
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [catalogFilters, setCatalogFilters] = useState<FilterConfig[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [sortActive, setSortActive] = useState(0);
  const [visibleProductsCount, setVisibleProductsCount] = useState(0); // Счетчик товаров с предложениями
  const [filtersGenerating, setFiltersGenerating] = useState(false); // Состояние генерации фильтров
  const [targetVisibleCount, setTargetVisibleCount] = useState(ITEMS_PER_PAGE); // Целевое количество видимых товаров
  const [loadedArticlesCount, setLoadedArticlesCount] = useState(ITEMS_PER_PAGE); // Количество загруженных артикулов
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [partsIndexPage, setPartsIndexPage] = useState(1); // Текущая страница для PartsIndex
  const [totalPages, setTotalPages] = useState(1); // Общее количество страниц
  
  // Новые состояния для логики автоподгрузки PartsIndex
  const [accumulatedEntities, setAccumulatedEntities] = useState<PartsIndexEntity[]>([]); // Все накопленные товары
  const [entitiesWithOffers, setEntitiesWithOffers] = useState<PartsIndexEntity[]>([]); // Товары с предложениями
  const [isAutoLoading, setIsAutoLoading] = useState(false); // Автоматическая подгрузка в процессе
  const [currentUserPage, setCurrentUserPage] = useState(1); // Текущая пользовательская страница
  const [entitiesCache, setEntitiesCache] = useState<Map<number, PartsIndexEntity[]>>(new Map()); // Кэш страниц
  const [isFilterChanging, setIsFilterChanging] = useState(false); // Флаг изменения фильтров

  // Карта видимости товаров по индексу
  const [visibilityMap, setVisibilityMap] = useState<Map<number, boolean>>(new Map());

  // Обработчик изменения видимости товара
  const handleVisibilityChange = useCallback((index: number, isVisible: boolean) => {
    setVisibilityMap(prev => {
      const currentVisibility = prev.get(index);
      // Обновляем только если значение действительно изменилось
      if (currentVisibility === isVisible) {
        return prev;
      }
      const newMap = new Map(prev);
      newMap.set(index, isVisible);
      return newMap;
    });
  }, []);

  // Пересчитываем количество видимых товаров при изменении карты видимости
  useEffect(() => {
    const visibleCount = Array.from(visibilityMap.values()).filter(Boolean).length;
    setVisibleProductsCount(visibleCount);
  }, [visibilityMap]);

  // Определяем режим работы
  const isPartsAPIMode = Boolean(strId && categoryName);
  const isPartsIndexMode = Boolean(catalogId && categoryName && groupId); // Требуем groupId для PartsIndex
  const isPartsIndexCatalogOnly = Boolean(catalogId && categoryName && !groupId); // Каталог без группы

  // Отладочная информация
  console.log('🔍 Режимы работы каталога:', {
    catalogId,
    groupId,
    categoryName,
    isPartsAPIMode,
    isPartsIndexMode,
    isPartsIndexCatalogOnly,
    'router.query': router.query
  });

  // Загружаем артикулы PartsAPI
  const { data: articlesData, loading: articlesLoading, error: articlesError } = useQuery<PartsAPIArticlesData, PartsAPIArticlesVariables>(
    GET_PARTSAPI_ARTICLES,
    {
      variables: {
        strId: parseInt(strId as string),
        carId: 9877,
        carType: 'PC'
      },
      skip: !isPartsAPIMode,
      fetchPolicy: 'cache-first'
    }
  );

  const allArticles = articlesData?.partsAPIArticles || [];

  // Загружаем товары PartsIndex
  const { data: entitiesData, loading: entitiesLoading, error: entitiesError, refetch: refetchEntities } = useQuery<PartsIndexEntitiesData, PartsIndexEntitiesVariables>(
    GET_PARTSINDEX_CATALOG_ENTITIES,
    {
      variables: {
        catalogId: catalogId as string,
        groupId: groupId as string,
        lang: 'ru',
        limit: PARTSINDEX_PAGE_SIZE,
        page: partsIndexPage,
        q: searchQuery || undefined,
        params: undefined // Будем обновлять через refetch
      },
      skip: !isPartsIndexMode || !groupId, // Пропускаем запрос если нет groupId
      fetchPolicy: 'cache-and-network'
    }
  );

  // Загружаем параметры фильтрации для PartsIndex
  const { data: paramsData, loading: paramsLoading, error: paramsError, refetch: refetchParams } = useQuery<PartsIndexParamsData, PartsIndexParamsVariables>(
    GET_PARTSINDEX_CATALOG_PARAMS,
    {
      variables: {
        catalogId: catalogId as string,
        groupId: groupId as string,
        lang: 'ru',
        q: searchQuery || undefined,
        params: undefined // Будем обновлять через refetch
      },
      skip: !isPartsIndexMode || !groupId, // Пропускаем запрос если нет groupId
      fetchPolicy: 'cache-first'
    }
  );

  // allEntities больше не используется - используем allLoadedEntities

  // Хук для загрузки цен товаров PartsIndex
  const { getPrice, isLoadingPrice, ensurePriceLoaded } = useProductPrices();

  // Загружаем цены для видимых товаров PartsIndex (для отображения конкретных цен)
  useEffect(() => {
    if (isPartsIndexMode && visibleEntities.length > 0) {
      // Загружаем цены только для видимых товаров для отображения точных цен
      visibleEntities.forEach((entity, index) => {
        const productForPrice = {
          id: entity.id,
          code: entity.code,
          brand: entity.brand.name
        };
        // Загружаем с небольшой задержкой
        setTimeout(() => {
          ensurePriceLoaded(productForPrice);
        }, index * 50);
      });
    }
  }, [isPartsIndexMode, visibleEntities, ensurePriceLoaded]);

  useEffect(() => {
    if (articlesData?.partsAPIArticles) {
      // Загружаем изначально только ITEMS_PER_PAGE товаров
      const initialLoadCount = Math.min(ITEMS_PER_PAGE, articlesData.partsAPIArticles.length);
      setVisibleArticles(articlesData.partsAPIArticles.slice(0, initialLoadCount));
      setLoadedArticlesCount(initialLoadCount);
      setTargetVisibleCount(ITEMS_PER_PAGE);
      setCurrentPage(1);
    }
  }, [articlesData]);

  useEffect(() => {
    if (entitiesData?.partsIndexCatalogEntities?.list) {
      console.log('📊 Обновляем entitiesData:', {
        listLength: entitiesData.partsIndexCatalogEntities.list.length,
        pagination: entitiesData.partsIndexCatalogEntities.pagination,
        currentPage: entitiesData.partsIndexCatalogEntities.pagination?.page?.current || 1,
        isFilterChanging
      });
      
      // Если изменяются фильтры, сбрасываем флаг после получения новых данных
      if (isFilterChanging) {
        setIsFilterChanging(false);
        console.log('🔄 Сброшен флаг isFilterChanging - получены новые отфильтрованные данные');
      }
      
      const newEntities = entitiesData.partsIndexCatalogEntities.list;
      const pagination = entitiesData.partsIndexCatalogEntities.pagination;
      
      // Обновляем информацию о пагинации
      const currentPage = pagination?.page?.current || 1;
      const hasNext = pagination?.page?.next !== null;
      const hasPrev = pagination?.page?.prev !== null;
      
      setPartsIndexPage(currentPage);
      setHasMoreEntities(hasNext);
      
      // Сохраняем в кэш
      setEntitiesCache(prev => new Map(prev).set(currentPage, newEntities));
      
      // Если это первая страница или сброс, заменяем накопленные товары
      if (currentPage === 1) {
        setAccumulatedEntities(newEntities);
        // Устанавливаем visibleEntities сразу, только если не идет изменение фильтров
        if (!isFilterChanging) {
          setVisibleEntities(newEntities);
          console.log('✅ Установлены visibleEntities для первой страницы:', newEntities.length);
        } else {
          console.log('🔄 Пропускаем установку visibleEntities - фильтры изменяются');
        }
      } else {
        // Добавляем к накопленным товарам
        setAccumulatedEntities(prev => [...prev, ...newEntities]);
      }
      
      // Вычисляем общее количество страниц (приблизительно)
      if (hasNext) {
        setTotalPages(currentPage + 1); // Минимум еще одна страница
      } else {
        setTotalPages(currentPage); // Это последняя страница
      }
      
      console.log('✅ Пагинация обновлена:', { currentPage, hasNext, hasPrev });
    }
  }, [entitiesData, isFilterChanging]);

  // Преобразование выбранных фильтров в формат PartsIndex API
  const convertFiltersToPartsIndexParams = useMemo((): Record<string, any> => {
    if (!paramsData?.partsIndexCatalogParams?.list || Object.keys(selectedFilters).length === 0) {
      return {};
    }

    const apiParams: Record<string, any> = {};

    paramsData.partsIndexCatalogParams.list.forEach((param: any) => {
      const selectedValues = selectedFilters[param.name];
      if (selectedValues && selectedValues.length > 0) {
        // Находим соответствующие значения из API данных
        const matchingValues = param.values.filter((value: any) => 
          selectedValues.includes(value.title || value.value)
        );

        if (matchingValues.length > 0) {
          // Используем ID параметра из API и значения
          apiParams[param.id] = matchingValues.map((v: any) => v.value);
        }
      }
    });

    return apiParams;
  }, [paramsData, selectedFilters]);

  // Функция автоматической подгрузки дополнительных страниц PartsIndex
  const autoLoadMoreEntities = useCallback(async () => {
    if (isAutoLoading || !hasMoreEntities || !isPartsIndexMode) {
      return;
    }

    console.log('🔄 Автоподгрузка: проверяем товары с предложениями...');
    
    // Восстанавливаем автоподгрузку
    console.log('🔄 Автоподгрузка активна');

    // Подсчитываем текущее количество товаров (все уже отфильтрованы на сервере)
    const currentEntitiesCount = accumulatedEntities.length;

    console.log('📊 Автоподгрузка: текущее состояние:', {
      накопленоТоваров: currentEntitiesCount,
      целевоеКоличество: ITEMS_PER_PAGE,
      естьЕщеТовары: hasMoreEntities
    });

    // Даем время на загрузку цен товаров, если их слишком много загружается
    const loadingCount = accumulatedEntities.filter(entity => {
      const productForPrice = { id: entity.id, code: entity.code, brand: entity.brand.name };
      return isLoadingPrice(productForPrice);
    }).length;

    // Ждем только если загружается больше 5 товаров одновременно
    if (loadingCount > 5) {
      console.log('⏳ Автоподгрузка: ждем загрузки цен для', loadingCount, 'товаров (больше 5)');
      return;
    }

    // Если накопили уже много товаров, но мало с предложениями - прекращаем попытки
    if (accumulatedEntities.length >= ITEMS_PER_PAGE * 8) { // Увеличили лимит с 4 до 8 страниц
      console.log('⚠️ Автоподгрузка: достигли лимита попыток, прекращаем');
      return;
    }

    setIsAutoLoading(true);
    
    try {
      console.log('🔄 Автоподгрузка: загружаем следующую страницу PartsIndex...');
      
      const apiParams = convertFiltersToPartsIndexParams;
      const paramsString = Object.keys(apiParams).length > 0 ? JSON.stringify(apiParams) : undefined;
      
      const result = await refetchEntities({
        catalogId: catalogId as string,
        groupId: groupId as string,
        lang: 'ru',
        limit: PARTSINDEX_PAGE_SIZE,
        page: partsIndexPage + 1,
        q: searchQuery || undefined,
        params: paramsString
      });

      console.log('✅ Автоподгрузка: страница загружена, результат:', result.data?.partsIndexCatalogEntities?.list?.length || 0);
      
    } catch (error) {
      console.error('❌ Автоподгрузка: ошибка загрузки следующей страницы:', error);
    } finally {
      setIsAutoLoading(false);
    }
  }, [isAutoLoading, hasMoreEntities, isPartsIndexMode, accumulatedEntities.length, partsIndexPage, refetchEntities, catalogId, groupId, searchQuery]);

  // Генерация фильтров для PartsIndex на основе параметров API
  const generatePartsIndexFilters = useCallback((): FilterConfig[] => {
    if (!paramsData?.partsIndexCatalogParams?.list) {
      return [];
    }

    return paramsData.partsIndexCatalogParams.list.map((param: any) => {
      if (param.type === 'range') {
        // Для range фильтров ищем min и max значения
        const numericValues = param.values
          .map((v: any) => parseFloat(v.value))
          .filter((v: number) => !isNaN(v));
        
        const min = numericValues.length > 0 ? Math.min(...numericValues) : 0;
        const max = numericValues.length > 0 ? Math.max(...numericValues) : 100;

        return {
          type: 'range' as const,
          title: param.name,
          min,
          max,
          defaultOpen: false,
        };
      } else {
        // Для dropdown фильтров
        return {
          type: 'dropdown' as const,
          title: param.name,
          options: param.values
            .filter((value: any) => value.available) // Показываем только доступные
            .map((value: any) => value.title || value.value),
          multi: true,
          showAll: true,
          defaultOpen: false,
        };
      }
    });
  }, [paramsData]);



  useEffect(() => {
    if (isPartsIndexMode) {
      // Для PartsIndex генерируем фильтры на основе параметров API
      const filters = generatePartsIndexFilters();
      setCatalogFilters(filters);
      setFiltersLoading(paramsLoading);
    } else {
      // Для других режимов убираем запрос на catalog-filters
      setFiltersLoading(false);
    }
  }, [isPartsIndexMode, generatePartsIndexFilters, paramsLoading]);

  // Автоматическая подгрузка товаров с задержкой для загрузки цен
  useEffect(() => {
    if (!isPartsIndexMode || accumulatedEntities.length === 0 || isAutoLoading) {
      return;
    }

    // Даем время на загрузку цен (3 секунды после последнего изменения)
    const timer = setTimeout(() => {
      autoLoadMoreEntities();
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPartsIndexMode, accumulatedEntities.length, isAutoLoading]);

  // Дополнительный триггер автоподгрузки при изменении количества товаров с предложениями
  useEffect(() => {
    console.log('🔍 Проверка триггера автоподгрузки:', {
      isPartsIndexMode,
      entitiesWithOffersLength: entitiesWithOffers.length,
      isAutoLoading,
      hasMoreEntities,
      targetItemsPerPage: ITEMS_PER_PAGE
    });

    if (!isPartsIndexMode || entitiesWithOffers.length === 0 || isAutoLoading) {
      return;
    }

    // Если товаров с предложениями мало, запускаем автоподгрузку через 1 секунду
    if (entitiesWithOffers.length < ITEMS_PER_PAGE && hasMoreEntities) {
      console.log('🚀 Запускаем автоподгрузку: товаров', entitiesWithOffers.length, 'из', ITEMS_PER_PAGE);
      const timer = setTimeout(() => {
        console.log('🚀 Дополнительная автоподгрузка: недостаточно товаров с предложениями');
        autoLoadMoreEntities();
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      console.log('✅ Автоподгрузка не нужна: товаров достаточно или нет больше данных');
    }
  }, [isPartsIndexMode, entitiesWithOffers.length, hasMoreEntities, isAutoLoading]);

  // Обновляем список товаров при изменении накопленных товаров (серверная фильтрация)
  useEffect(() => {
    if (!isPartsIndexMode) {
      return;
    }

    // Если фильтры изменяются, не обновляем отображение старых данных
    if (isFilterChanging) {
      console.log('🔄 Пропускаем обновление entitiesWithOffers - фильтры изменяются');
      return;
    }

    // Все товары уже отфильтрованы на сервере - показываем все накопленные
    const entitiesWithOffers = accumulatedEntities;

    console.log('📊 Обновляем entitiesWithOffers (серверная фильтрация):', {
      накопленоТоваров: accumulatedEntities.length,
      отображаемыхТоваров: entitiesWithOffers.length,
      целевоеКоличество: ITEMS_PER_PAGE,
      isFilterChanging
    });

    setEntitiesWithOffers(entitiesWithOffers);
    
    // Показываем товары для текущей пользовательской страницы
    const startIndex = (currentUserPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const visibleForCurrentPage = entitiesWithOffers.slice(startIndex, endIndex);
    
    console.log('📊 Обновляем visibleEntities:', {
      currentUserPage,
      startIndex,
      endIndex,
      visibleForCurrentPage: visibleForCurrentPage.length,
      entitiesWithOffers: entitiesWithOffers.length
    });
    
    setVisibleEntities(visibleForCurrentPage);
    
  }, [isPartsIndexMode, accumulatedEntities, currentUserPage, isFilterChanging]);



  // Генерируем динамические фильтры для PartsAPI
  const generatePartsAPIFilters = useCallback((): FilterConfig[] => {
    if (!allArticles.length) return [];

    // Получаем список видимых товаров из карты видимости
    const visibleIndices = Array.from(visibilityMap.entries())
      .filter(([_, isVisible]) => isVisible)
      .map(([index]) => index);

    // Если еще нет данных о видимости, используем все товары (для начальной загрузки)
    const articlesToProcess = visibilityMap.size === 0 ? allArticles : 
      visibleIndices.map(index => allArticles[index]).filter(Boolean);

    const brandCounts = new Map<string, number>();
    const productGroups = new Set<string>();

    // Подсчитываем количество товаров для каждого бренда (только видимые)
    articlesToProcess.forEach(article => {
      if (article?.artSupBrand) {
        brandCounts.set(article.artSupBrand, (brandCounts.get(article.artSupBrand) || 0) + 1);
      }
      if (article?.productGroup) productGroups.add(article.productGroup);
    });

    const filters: FilterConfig[] = [];

    if (brandCounts.size > 1) {
      // Сортируем бренды по количеству товаров (по убыванию)
      const sortedBrands = Array.from(brandCounts.entries())
        .sort((a, b) => b[1] - a[1]) // Сортируем по количеству товаров
        .map(([brand]) => brand);

      // Показываем либо первые N брендов, либо все (если нажата кнопка "Показать еще")
      const brandsToShow = showAllBrands ? sortedBrands : sortedBrands.slice(0, MAX_BRANDS_DISPLAY);

              filters.push({
          type: "dropdown",
          title: "Бренд",
          options: brandsToShow.sort(), // Сортируем по алфавиту для удобства
          multi: true,
          showAll: true,
          defaultOpen: false,
          hasMore: !showAllBrands && sortedBrands.length > MAX_BRANDS_DISPLAY,
          onShowMore: () => setShowAllBrands(true)
        });
    }

    if (productGroups.size > 1) {
      filters.push({
        type: "dropdown",
        title: "Группа товаров",
        options: Array.from(productGroups).sort(),
        multi: true,
        showAll: true,
        defaultOpen: false,
      });
    }

    return filters;
  }, [allArticles, showAllBrands, visibilityMap]);

  const dynamicFilters = useMemo(() => {
    if (isPartsIndexMode) {
      return generatePartsIndexFilters();
    } else if (isPartsAPIMode) {
      return generatePartsAPIFilters();
    }
    return [];
  }, [isPartsIndexMode, isPartsAPIMode, generatePartsIndexFilters, generatePartsAPIFilters]);

  // Отдельный useEffect для управления состоянием загрузки фильтров
  useEffect(() => {
    if ((isPartsAPIMode && allArticles.length > 0) || (isPartsIndexMode && visibleEntities.length > 0)) {
      setFiltersGenerating(true);
      const timer = setTimeout(() => {
        setFiltersGenerating(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setFiltersGenerating(false);
    }
  }, [isPartsAPIMode, allArticles.length, isPartsIndexMode, visibleEntities.length]);



  // Функция для обновления URL с фильтрами
  const updateUrlWithFilters = useCallback((filters: {[key: string]: string[]}, search: string) => {
    const query: any = { ...router.query };
    
    // Удаляем старые фильтры из URL
    Object.keys(query).forEach(key => {
      if (key.startsWith('filter_') || key === 'q') {
        delete query[key];
      }
    });
    
    // Добавляем новые фильтры
    Object.entries(filters).forEach(([filterName, values]) => {
      if (values.length > 0) {
        query[`filter_${filterName}`] = values.length === 1 ? values[0] : values;
      }
    });
    
    // Добавляем поисковый запрос
    if (search.trim()) {
      query.q = search;
    }
    
    // Обновляем URL без перезагрузки страницы
    router.push({
      pathname: router.pathname,
      query
    }, undefined, { shallow: true });
  }, [router]);

  const handleDesktopFilterChange = (filterTitle: string, value: string | string[]) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      
      // Если значение пустое (пустой массив или пустая строка), удаляем фильтр
      if (Array.isArray(value) && value.length === 0) {
        delete newFilters[filterTitle];
      } else if (!value || (typeof value === 'string' && value.trim() === '')) {
        delete newFilters[filterTitle];
      } else {
        // Иначе устанавливаем значение
        newFilters[filterTitle] = Array.isArray(value) ? value : [value];
      }
      
      // Обновляем URL
      updateUrlWithFilters(newFilters, searchQuery);
      
      return newFilters;
    });
  };

  const handleMobileFilterChange = (type: string, value: any) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      
      // Если значение пустое (пустой массив или пустая строка), удаляем фильтр
      if (Array.isArray(value) && value.length === 0) {
        delete newFilters[type];
      } else if (!value || (typeof value === 'string' && value.trim() === '')) {
        delete newFilters[type];
      } else {
        // Иначе устанавливаем значение
        newFilters[type] = Array.isArray(value) ? value : [value];
      }
      
      // Обновляем URL
      updateUrlWithFilters(newFilters, searchQuery);
      
      return newFilters;
    });
  };

  // Обработчик изменения поискового запроса
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    updateUrlWithFilters(selectedFilters, value);
  }, [selectedFilters, updateUrlWithFilters]);

  // Функция для сброса всех фильтров
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedFilters({});
    setShowAllBrands(false);
    setPartsIndexPage(1); // Сбрасываем страницу PartsIndex на первую
    
    // Очищаем URL от фильтров
    updateUrlWithFilters({}, '');
  }, [updateUrlWithFilters]);

  // Фильтрация по поиску и фильтрам для PartsAPI
  const filteredArticles = useMemo(() => {
    return allArticles.filter(article => {
      // Фильтрация по поиску
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        const articleTitle = [
          article.artSupBrand || '',
          article.artArticleNr || '',
          article.productGroup || ''
        ].join(' ').toLowerCase();
        
        if (!articleTitle.includes(searchLower)) {
          return false;
        }
      }
      
      // Фильтрация по выбранным фильтрам
      const brandFilter = selectedFilters['Бренд'] || [];
      if (brandFilter.length > 0 && !brandFilter.includes(article.artSupBrand || '')) {
        return false;
      }
      
      const groupFilter = selectedFilters['Группа товаров'] || [];
      if (groupFilter.length > 0 && !groupFilter.includes(article.productGroup || '')) {
        return false;
      }
      
      return true;
    });
  }, [allArticles, searchQuery, selectedFilters]);

  // Обновляем видимые артикулы при изменении поиска или фильтров для PartsAPI
  useEffect(() => {
    if (isPartsAPIMode) {
      setVisibleArticles(filteredArticles.slice(0, ITEMS_PER_PAGE));
      setCurrentPage(1);
      setIsLoadingMore(false);
      setVisibilityMap(new Map()); // Сбрасываем карту видимости при изменении фильтров
      setVisibleProductsCount(0); // Сбрасываем счетчик
      setLoadedArticlesCount(ITEMS_PER_PAGE); // Сбрасываем счетчик загруженных
      setShowEmptyState(false); // Сбрасываем пустое состояние
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPartsAPIMode, searchQuery, JSON.stringify(selectedFilters), filteredArticles.length]);

  // Обновляем видимые товары при изменении поиска или фильтров для PartsIndex
  useEffect(() => {
    if (isPartsIndexMode) {
      // При изменении поиска или фильтров сбрасываем пагинацию
      setShowEmptyState(false);
      
      // Если изменился поисковый запрос или фильтры, нужно перезагрузить данные с сервера
      if (searchQuery.trim() || Object.keys(selectedFilters).length > 0) {
        console.log('🔍 Поисковый запрос или фильтры изменились, сбрасываем пагинацию');
        
        // Устанавливаем флаг изменения фильтров
        setIsFilterChanging(true);
        
        setPartsIndexPage(1);
        setCurrentUserPage(1);
        setHasMoreEntities(true);
        setAccumulatedEntities([]);
        setEntitiesWithOffers([]);
        setEntitiesCache(new Map());
        
        // Вычисляем параметры фильтрации прямо здесь, чтобы избежать зависимости от useMemo
        let apiParams: Record<string, any> = {};
        if (paramsData?.partsIndexCatalogParams?.list && Object.keys(selectedFilters).length > 0) {
          paramsData.partsIndexCatalogParams.list.forEach((param: any) => {
            const selectedValues = selectedFilters[param.name];
            if (selectedValues && selectedValues.length > 0) {
              // Находим соответствующие значения из API данных
              const matchingValues = param.values.filter((value: any) => 
                selectedValues.includes(value.title || value.value)
              );

              if (matchingValues.length > 0) {
                // Используем ID параметра из API и значения
                apiParams[param.id] = matchingValues.map((v: any) => v.value);
              }
            }
          });
        }
        
        const paramsString = Object.keys(apiParams).length > 0 ? JSON.stringify(apiParams) : undefined;
        
        console.log('🔄 Запуск refetch с новыми фильтрами:', { 
          searchQuery, 
          selectedFilters, 
          apiParams, 
          paramsString,
          catalogId,
          groupId 
        });
        
        // Также обновляем параметры фильтрации
        refetchParams({
          catalogId: catalogId as string,
          groupId: groupId as string,
          lang: 'ru',
          q: searchQuery || undefined,
          params: paramsString
        }).then(result => {
          console.log('✅ refetchParams результат:', result);
        }).catch(error => {
          console.error('❌ refetchParams ошибка:', error);
        });
        
        refetchEntities({
          catalogId: catalogId as string,
          groupId: groupId as string,
          lang: 'ru',
          limit: PARTSINDEX_PAGE_SIZE,
          page: 1,
          q: searchQuery || undefined,
          params: paramsString
        }).then(result => {
          console.log('✅ refetchEntities результат:', result.data?.partsIndexCatalogEntities?.list?.length || 0, 'товаров');
        }).catch(error => {
          console.error('❌ refetchEntities ошибка:', error);
        });
      } else {
        // Если нет активных фильтров, сбрасываем флаг
        if (isFilterChanging) {
          setIsFilterChanging(false);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPartsIndexMode, searchQuery, JSON.stringify(selectedFilters), paramsData]);

  // Управляем показом пустого состояния с задержкой
  useEffect(() => {
    if (isPartsAPIMode && !articlesLoading && !articlesError) {
      // Если товаров вообще нет - показываем сразу
      if (allArticles.length === 0) {
        setShowEmptyState(true);
        return;
      }
      
      // Если товары есть, но нет видимых - ждем 2 секунды
      const timer = setTimeout(() => {
        setShowEmptyState(visibleProductsCount === 0 && allArticles.length > 0);
      }, 2000); // Даем 2 секунды на загрузку данных о предложениях
      
      return () => clearTimeout(timer);
    } else if (isPartsIndexMode && !entitiesLoading && !entitiesError) {
      // Для PartsIndex показываем пустое состояние если нет товаров И данные уже загружены
      const hasLoadedData = accumulatedEntities.length > 0 || Boolean(entitiesData?.partsIndexCatalogEntities?.list);
      
      // Показываем пустое состояние если данные загружены и нет видимых товаров
      // (товары уже отфильтрованы на сервере, поэтому не нужно ждать загрузки цен)
      const shouldShowEmpty = hasLoadedData && visibleEntities.length === 0;
      setShowEmptyState(shouldShowEmpty);
      
      console.log('📊 Определяем showEmptyState для PartsIndex (серверная фильтрация):', {
        hasLoadedData,
        visibleEntitiesLength: visibleEntities.length,
        accumulatedEntitiesLength: accumulatedEntities.length,
        shouldShowEmpty,
        showEmptyState: shouldShowEmpty
      });
    } else {
      setShowEmptyState(false);
    }
  }, [isPartsAPIMode, articlesLoading, articlesError, visibleProductsCount, allArticles.length, 
      isPartsIndexMode, entitiesLoading, entitiesError, visibleEntities.length, accumulatedEntities.length, entitiesData]);

  // Функции для навигации по пользовательским страницам
  const handleNextPage = useCallback(() => {
    const maxUserPage = Math.ceil(accumulatedEntities.length / ITEMS_PER_PAGE);
    console.log('🔄 Нажата кнопка "Вперед":', {
      currentUserPage,
      maxUserPage,
      accumulatedEntitiesLength: accumulatedEntities.length,
      ITEMS_PER_PAGE
    });
    if (currentUserPage < maxUserPage) {
      setCurrentUserPage(prev => {
        console.log('✅ Переходим на страницу:', prev + 1);
        return prev + 1;
      });
    } else {
      console.log('⚠️ Нельзя перейти вперед: уже на последней странице');
    }
  }, [currentUserPage, accumulatedEntities.length]);

  const handlePrevPage = useCallback(() => {
    console.log('🔄 Нажата кнопка "Назад":', {
      currentUserPage,
      accumulatedEntitiesLength: accumulatedEntities.length
    });
    if (currentUserPage > 1) {
      setCurrentUserPage(prev => {
        const newPage = prev - 1;
        console.log('✅ Переходим на страницу:', newPage);
        return newPage;
      });
    } else {
      console.log('⚠️ Нельзя перейти назад: уже на первой странице');
    }
  }, [currentUserPage, accumulatedEntities.length]);

  // Функция для загрузки следующей порции товаров по кнопке (только для PartsAPI)
  const handleLoadMorePartsAPI = useCallback(async () => {
    if (isLoadingMore || !isPartsAPIMode) {
      return;
    }

    setIsLoadingMore(true);
    
    try {
      const additionalCount = Math.min(ITEMS_PER_PAGE, filteredArticles.length - loadedArticlesCount);
      
      if (additionalCount > 0) {
        const newArticles = filteredArticles.slice(loadedArticlesCount, loadedArticlesCount + additionalCount);
        setVisibleArticles(prev => [...prev, ...newArticles]);
        setLoadedArticlesCount(prev => prev + additionalCount);
        setTargetVisibleCount(prev => prev + ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки дополнительных товаров:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isPartsAPIMode, loadedArticlesCount, filteredArticles, isLoadingMore]);

  // Определяем есть ли еще товары для загрузки (только для PartsAPI)
  const hasMoreItems = useMemo(() => {
    if (isPartsAPIMode) {
      return loadedArticlesCount < filteredArticles.length;
    }
    return false;
  }, [isPartsAPIMode, loadedArticlesCount, filteredArticles.length]);

  useEffect(() => {
    // Сбросить все состояния при смене каталога или подкатегории
    setAccumulatedEntities([]);
    setVisibleEntities([]);
    setEntitiesWithOffers([]);
    setEntitiesCache(new Map());
    setCurrentUserPage(1);
    setPartsIndexPage(1);
    setHasMoreEntities(true);
    setShowEmptyState(false);
    setIsFilterChanging(false);
    setVisibleCount(ITEMS_PER_PAGE);
  }, [catalogId, groupId]);

  if (filtersLoading) {
    return <div className="py-8 text-center">Загрузка фильтров...</div>;
  }

  // Определяем meta-теги для каталога
  const categoryNameDecoded = decodeURIComponent(categoryName as string || 'Каталог');
  const metaData = createCategoryMeta(categoryNameDecoded, visibleProductsCount || undefined);

  // Генерируем микроразметку для каталога
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Главная", url: "https://protek.ru/" },
    { name: "Каталог", url: "https://protek.ru/catalog" },
    ...(categoryName ? [{ name: categoryNameDecoded, url: `https://protek.ru/catalog?categoryName=${categoryName}` }] : [])
  ]);

  const websiteSchema = generateWebSiteSchema(
    "Protek - Каталог автозапчастей",
    "https://protek.ru",
    "https://protek.ru/search"
  );

  return (
    <>
      <MetaTags {...metaData} />
      <JsonLdScript schema={breadcrumbSchema} />
      <JsonLdScript schema={websiteSchema} />
      <CatalogInfoHeader
        title={
          isPartsAPIMode ? decodeURIComponent(categoryName as string || 'Запчасти') :
          isPartsIndexMode ? decodeURIComponent(categoryName as string || 'Товары') :
          "Аккумуляторы"
        }
        count={
          isPartsAPIMode ? 
            (visibilityMap.size === 0 && allArticles.length > 0 ? undefined : visibleProductsCount) :
          isPartsIndexMode ?
            entitiesWithOffers.length :
            3587
        }
        productName={
          isPartsAPIMode ? "запчасть" :
          isPartsIndexMode ? "товар" :
          "аккумулятор"
        }
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Каталог" },
          ...((isPartsAPIMode || isPartsIndexMode) ? [{ label: decodeURIComponent(categoryName as string || 'Товары') }] : [])
        ]}
        showCount={true}
        showProductHelp={true}
      />
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-hflex flex-block-13">
            <div className="w-layout-hflex flex-block-84">
              <div className="w-layout-hflex flex-block-85" onClick={() => setShowFiltersMobile((v) => !v)}>
              <div className="code-embed-9 w-embed">
                  <svg width="currentwidth" height="currentheight" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                </div>
                <div>Фильтры</div>
              </div>
            </div>
            {isPartsAPIMode ? (
                <div className="filters-desktop" style={{ width: '300px', marginRight: '20px', marginBottom: '80px' }}>
                  <Filters
                    filters={dynamicFilters}
                    onFilterChange={handleDesktopFilterChange}
                    filterValues={selectedFilters}
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    isLoading={filtersGenerating}
                  />
                </div>
            ) : isPartsIndexMode ? (
                <div className="filters-desktop" style={{ width: '300px', marginRight: '20px', marginBottom: '80px' }}>
                  <Filters
                    filters={catalogFilters}
                    onFilterChange={handleDesktopFilterChange}
                    filterValues={selectedFilters}
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    isLoading={filtersLoading}
                  />
                </div>
            ) : (
                <div className="filters-desktop" style={{ width: '300px', marginRight: '20px', marginBottom: '80px' }}>
                    <Filters
                        filters={catalogFilters}
                        onFilterChange={handleDesktopFilterChange}
                        filterValues={selectedFilters}
                        searchQuery={searchQuery}
                        onSearchChange={handleSearchChange}
                        isLoading={filtersLoading}
                    />
                </div>
            )}
            <FiltersPanelMobile
              open={showFiltersMobile}
              onClose={() => setShowFiltersMobile(false)}
              filters={isPartsAPIMode ? dynamicFilters : catalogFilters}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              filterValues={selectedFilters}
              onFilterChange={handleMobileFilterChange}
            />
            
            <div className="w-layout-vflex flex-block-14-copy-copy">
              {/* Индикатор загрузки для PartsAPI */}
              {isPartsAPIMode && articlesLoading && (
                <div className="flex justify-center items-center py-8">
                  <LoadingSpinner size="lg" text="Загружаем артикулы..." />
                </div>
              )}
              
              {/* Индикатор загрузки для PartsIndex */}
              {isPartsIndexMode && entitiesLoading && (
                <div className="flex justify-center items-center py-8">
                  <LoadingSpinner size="lg" text="Загружаем товары..." />
                </div>
              )}
              

              
              {/* Сообщение об ошибке */}
              {isPartsAPIMode && articlesError && (
                <div className="flex justify-center items-center py-8">
                  <div className="text-lg text-red-600">Ошибка загрузки артикулов: {articlesError.message}</div>
                </div>
              )}

              {/* Сообщение об ошибке для PartsIndex */}
              {isPartsIndexMode && entitiesError && (
                <div className="flex justify-center items-center py-8">
                  <div className="text-lg text-red-600">Ошибка загрузки товаров: {entitiesError.message}</div>
                </div>
              )}
              
              {/* Отображение артикулов PartsAPI */}
              {isPartsAPIMode && visibleArticles.length > 0 && (
                <>
                  {visibleArticles.map((article, idx) => (
                    <ArticleCard
                      key={`${article.artId}_${idx}`}
                      article={article}
                      index={idx}
                      onVisibilityChange={handleVisibilityChange}
                    />
                  ))}
                  
                  {/* Кнопка "Показать еще" */}
                  {hasMoreItems && (
                    <div className="w-layout-hflex pagination">
                      <button
                        onClick={handleLoadMorePartsAPI}
                        disabled={isLoadingMore}
                        className="button_strock w-button"
                      >
                        {isLoadingMore ? (
                          <>
                            Загружаем...
                          </>
                        ) : (
                          <>
                            Показать еще
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
              
              {/* Показываем индикатор загрузки при изменении фильтров */}
              {isPartsIndexMode && isFilterChanging && (
                <div className="flex flex-col items-center justify-center py-12">
                  <LoadingSpinner />
                  <div className="text-gray-500 text-lg mt-4">Применяем фильтры...</div>
                </div>
              )}

              {/* Отображение товаров PartsIndex */}
              {isPartsIndexMode && !isFilterChanging && accumulatedEntities.length > 0 && (
                <>
                  {accumulatedEntities.slice(0, visibleCount).map((entity, idx) => {
                    const productForPrice = { id: entity.id, code: entity.code, brand: entity.brand.name };
                    const priceData = getPrice(productForPrice);
                    const isLoadingPriceData = isLoadingPrice(productForPrice);
  // Fallback cart check via frontend context
  const inCartFallback = isItemInCart(entity.id, priceData?.offerKey, entity.code, entity.brand.name);
                    
                    // Определяем цену для отображения (все товары уже отфильтрованы на сервере)
                    let displayPrice = "";
                    let displayCurrency = "RUB";
                    let priceElement;
                    
                    if (isLoadingPriceData) {
                      // Показываем скелетон загрузки вместо текста
                      priceElement = <PriceSkeleton />;
                    } else if (priceData && priceData.price) {
                      displayPrice = `${priceData.price.toLocaleString('ru-RU')} ₽`;
                      displayCurrency = priceData.currency || "RUB";
                    } else {
                      // Если нет данных о цене, показываем скелетон (товар должен загрузиться)
                      priceElement = <PriceSkeleton />;
                    }

                    return (
                      <CatalogProductCard
                        key={`${entity.id}_${idx}`}
                        title={entity.originalName || entity.name?.name || 'Товар без названия'}
                        brand={entity.brand.name}
                        articleNumber={entity.code}
                        brandName={entity.brand.name}
                        image={entity.images?.[0] || ''}
                        price={priceElement ? "" : displayPrice}
                        priceElement={priceElement}
                        oldPrice=""
                        discount=""
                        currency={displayCurrency}
                        productId={entity.id}
                        artId={entity.id}
                        offerKey={priceData?.offerKey}
                        isInCart={priceData?.isInCart || inCartFallback}
                        onAddToCart={async () => {
                          // Если цена не загружена, загружаем её и добавляем в корзину
                          if (!priceData && !isLoadingPriceData) {
                            ensurePriceLoaded(productForPrice);
                            console.log('🔄 Загружаем цену для:', entity.code, entity.brand.name);
                            return;
                          }

                          // Если цена есть, добавляем в корзину
                          if (priceData && priceData.price) {
                            const itemToAdd = {
                              productId: entity.id,
                              offerKey: priceData.offerKey,
                              name: entity.originalName || entity.name?.name || 'Товар без названия',
                              description: `${entity.brand.name} ${entity.code}`,
                              brand: entity.brand.name,
                              article: entity.code,
                              price: priceData.price,
                              currency: priceData.currency || 'RUB',
                              quantity: 1,
                              stock: undefined, // информация о наличии не доступна для PartsIndex
                              deliveryTime: '1-3 дня',
                              warehouse: 'Parts Index',
                              supplier: 'Parts Index',
                              isExternal: true,
                              image: entity.images?.[0] || '',
                            };

                            const result = await addItem(itemToAdd);
                            
                            if (result.success) {
                              // Показываем уведомление
                              toast.success(
                                <div>
                                  <div className="font-semibold" style={{ color: '#fff' }}>Товар добавлен в корзину!</div>
                                  <div className="text-sm" style={{ color: '#fff', opacity: 0.9 }}>{`${entity.brand.name} ${entity.code} за ${priceData.price.toLocaleString('ru-RU')} ₽`}</div>
                                </div>,
                                {
                                  duration: 3000,
                                  icon: <CartIcon size={20} color="#fff" />,
                                }
                              );
                            } else {
                              toast.error(result.error || 'Ошибка при добавлении товара в корзину');
                            }
                          } else {
                            toast.error('Цена товара еще загружается. Попробуйте снова через несколько секунд.');
                          }
                        }}
                      />
                    );
                  })}
                  
                  {/* Кнопка "Показать еще" */}
                  {visibleCount < accumulatedEntities.length && (
                    <div className="w-layout-hflex pagination">
                      <button
                        onClick={() => setVisibleCount(c => Math.min(c + ITEMS_PER_PAGE, accumulatedEntities.length))}
                        className="button_strock w-button"
                      >
                        Показать еще
                      </button>
                    </div>
                  )}
                  
                  {/* Отладочная информация
                  {isPartsIndexMode && (
                    <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-100 rounded">
                      <div>🔍 Отладка PartsIndex (исправленная логика):</div>
                      <div>• accumulatedEntities: {accumulatedEntities.length}</div>
                      <div>• entitiesWithOffers: {entitiesWithOffers.length}</div>
                      <div>• visibleEntities: {visibleEntities.length}</div>
                      <div>• currentUserPage: {currentUserPage}</div>
                      <div>• partsIndexPage (API): {partsIndexPage}</div>
                      <div>• isAutoLoading: {isAutoLoading ? 'да' : 'нет'}</div>
                      <div>• hasMoreEntities: {hasMoreEntities ? 'да' : 'нет'}</div>
                      <div>• entitiesLoading: {entitiesLoading ? 'да' : 'нет'}</div>
                      <div>• groupId: {groupId || 'отсутствует'}</div>
                      <div>• Target: {ITEMS_PER_PAGE} товаров на страницу</div>
                      <div>• showEmptyState: {showEmptyState ? 'да' : 'нет'}</div>
                      <button 
                        onClick={() => {
                          console.log('🔧 Ручной запуск автоподгрузки');
                          autoLoadMoreEntities();
                        }}
                        className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded"
                        disabled={isAutoLoading}
                      >
                        {isAutoLoading ? 'Загружаем...' : 'Загрузить еще'}
                      </button>
                    </div>
                  )} */}
                </>
              )}

              {/* Пустое состояние для PartsAPI */}
              {isPartsAPIMode && !articlesLoading && !articlesError && showEmptyState && (
                <CatalogEmptyState 
                  categoryName={decodeURIComponent(categoryName as string || 'товаров')}
                  hasFilters={searchQuery.trim() !== '' || Object.keys(selectedFilters).some(key => selectedFilters[key].length > 0)}
                  onResetFilters={handleResetFilters}
                />
              )}

              {/* Пустое состояние для PartsIndex */}
              {isPartsIndexMode && !entitiesLoading && !entitiesError && (() => {
                console.log('🎯 Проверяем пустое состояние PartsIndex:', {
                  isPartsIndexMode,
                  entitiesLoading,
                  entitiesError,
                  showEmptyState,
                  visibleEntitiesLength: visibleEntities.length
                });
                return showEmptyState;
              })() && (
                <CatalogEmptyState 
                  categoryName={decodeURIComponent(categoryName as string || 'товаров')}
                  hasFilters={searchQuery.trim() !== '' || Object.keys(selectedFilters).some(key => selectedFilters[key].length > 0)}
                  onResetFilters={handleResetFilters}
                />
              )}
              
              {/* Каталог PartsIndex без группы */}
              {isPartsIndexCatalogOnly && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-gray-500 text-lg mb-4">Выберите подкатегорию</div>
                  <div className="text-gray-400 text-sm">Для просмотра товаров необходимо выбрать конкретную подкатегорию из меню.</div>
                </div>
              )}

              {/* Обычные товары (не PartsAPI/PartsIndex) */}
              {!isPartsAPIMode && !isPartsIndexMode && !isPartsIndexCatalogOnly && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-gray-500 text-lg mb-4">Раздел в разработке</div>
                  <div className="text-gray-400 text-sm">Данные для этой категории скоро появятся.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {!isPartsAPIMode && !isPartsIndexMode && <CatalogPagination />}
      <section className="section-3">
        <CatalogSubscribe />
      </section>
      <Footer />
      <MobileMenuBottomSection />
    </>
  );
} 