import MetaTags from "../components/MetaTags";
import { getMetaByPath, createProductMeta } from "../lib/meta-config";
import JsonLdScript from "@/components/JsonLdScript";
import { generateProductSchema, convertAvailability, type SchemaOrgProduct } from "@/lib/schema";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import { useQuery, useLazyQuery } from "@apollo/client";
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import CatalogSubscribe from "@/components/CatalogSubscribe";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CartRecommended from "@/components/CartRecommended";
import InfoCard from "@/components/card/InfoCard";
import ProductImageGallery from "@/components/card/ProductImageGallery";
import ProductList from "@/components/card/ProductList";
import ProductPriceHeader from "@/components/card/ProductPriceHeader";
import ProductCharacteristics from "@/components/card/ProductCharacteristics";
import ProductDescriptionTabs from "@/components/card/ProductDescriptionTabs";
import CatalogInfoHeader from "@/components/CatalogInfoHeader";
import { SEARCH_PRODUCT_OFFERS, PARTS_INDEX_SEARCH_BY_ARTICLE, GET_ANALOG_OFFERS, GET_CATEGORIES } from "@/lib/graphql";
import { useArticleImage } from "@/hooks/useArticleImage";
import { useRecommendedProducts } from "../hooks/useRecommendedProducts";
import { emitAnalyticsView } from "@/lib/utils";

const INITIAL_OFFERS_COUNT = 4;

const pluralizeDays = (count: number): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'дней';
  if (lastDigit === 1) return 'день';
  if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
  return 'дней';
};

export default function CardPage() {
  const router = useRouter();
  const { article, brand, q, artId } = router.query;
  
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [brandQuery, setBrandQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("price"); // price, quantity, delivery
  const [visibleOffersCount, setVisibleOffersCount] = useState(INITIAL_OFFERS_COUNT);
  const [analogsWithOffers, setAnalogsWithOffers] = useState<any[]>([]);

  useEffect(() => {
    if (article && typeof article === 'string') {
      setSearchQuery(article.trim().toUpperCase());
    }
    if (brand && typeof brand === 'string') {
      setBrandQuery(brand.trim());
    }
    setVisibleOffersCount(INITIAL_OFFERS_COUNT);
  }, [article, brand]);

  const { data, loading, error } = useQuery(SEARCH_PRODUCT_OFFERS, {
    variables: {
      articleNumber: searchQuery,
      brand: brandQuery || ''
    },
    skip: !searchQuery,
    errorPolicy: 'all'
  });

  // Запрос для получения категорий
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES, {
    errorPolicy: 'ignore'
  });

  // УБИРАЕМ ЗАПРОС К PARTSINDEX ДЛЯ ОПТИМИЗАЦИИ
  // Теперь данные PartsIndex будут получаться только по требованию
  // const { data: partsIndexData, loading: partsIndexLoading } = useQuery(PARTS_INDEX_SEARCH_BY_ARTICLE, {
  //   variables: {
  //     articleNumber: searchQuery,
  //     brandName: brandQuery || '',
  //     lang: 'ru'
  //   },
  //   skip: !searchQuery || !brandQuery,
  //   errorPolicy: 'ignore'
  // });
  
  const { imageUrl: mainImageUrl } = useArticleImage(artId as string, { enabled: !!artId });

  const result = data?.searchProductOffers;

  // Функция для поиска категории по ID (рекурсивно по всему дереву)
  const findCategoryById = (categories: any[], targetId: string): any | null => {
    if (!categories) return null;
    for (const cat of categories) {
      if (cat.id === targetId) return cat;
      if (cat.children && cat.children.length > 0) {
        const found = findCategoryById(cat.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  // Функция для получения всех родительских категорий до корня
  const getCategoryPath = (categoryId: string, allCategories: any[]): any[] => {
    const category = findCategoryById(allCategories, categoryId);
    if (!category) return [];

    if (category.parentId) {
      const parentPath = getCategoryPath(category.parentId, allCategories);
      return [...parentPath, category];
    }
    return [category];
  };

  // Получаем полный путь категорий для продукта
  const categoryPath = useMemo(() => {
    console.log('🔍 Card Page - Building category path:', {
      hasResult: !!result,
      hasCategoriesData: !!categoriesData,
      resultCategories: result?.categories,
      allCategoriesCount: categoriesData?.categories?.length
    });

    if (!result?.categories || !categoriesData?.categories) {
      console.log('⚠️ Card Page - Missing data for category path');
      return [];
    }

    // Используем первую категорию продукта
    const productCategory = result.categories[0];
    if (!productCategory) {
      console.log('⚠️ Card Page - No product category found');
      return [];
    }

    console.log('📍 Card Page - Product category:', productCategory);

    // Строим полный путь от корня до текущей категории
    const path = getCategoryPath(productCategory.id, categoriesData.categories);
    console.log('🗺️ Card Page - Category path built:', path.map(c => c.name).join(' → '));
    return path;
  }, [result, categoriesData]);

  // Генерируем breadcrumbs
  const breadcrumbs = useMemo(() => {
    console.log('🍞 Card Page - Building breadcrumbs:', {
      categoryPathLength: categoryPath.length,
      categoryPathNames: categoryPath.map(c => c.name),
      resultName: result?.name
    });

    const crumbs = [
      { label: "Главная", href: "/" },
      { label: "Каталог", href: "/catalog" }
    ];

    // Добавляем все категории как ссылки (включая последнюю)
    categoryPath.forEach((cat) => {
      crumbs.push({
        label: cat.name,
        href: `/catalog/${cat.slug}`
      });
    });

    // Добавляем название товара в конце БЕЗ ссылки
    if (result?.name) {
      crumbs.push({
        label: result.name,
        href: ''
      });
    }

    console.log('🍞 Card Page - Breadcrumbs built:', crumbs.map(c => c.label).join(' → '));
    return crumbs;
  }, [categoryPath, result]);

  // Аналитика: просмотр карточки товара (на клиенте)
  useEffect(() => {
    if (!result) return
    const pid = typeof artId === 'string' ? artId : (Array.isArray(artId) ? artId[0] : undefined)
    emitAnalyticsView({
      productId: pid ? String(pid) : undefined,
      article: result?.articleNumber,
      brand: result?.brand,
    })
  }, [result, artId])

  // Запрос для получения предложений аналогов
  const [getAnalogOffers, { loading: analogsLoading }] = useLazyQuery(GET_ANALOG_OFFERS, {
    onCompleted: (analogsData) => {
      if (analogsData?.getAnalogOffers) {
        setAnalogsWithOffers(analogsData.getAnalogOffers);
      }
    },
    errorPolicy: 'ignore'
  });

  // Автоматически загружаем предложения для аналогов
  useEffect(() => {
    if (result?.analogs && result.analogs.length > 0) {
      const analogsToLoad = result.analogs.slice(0, 5).map((analog: any) => ({
        articleNumber: analog.articleNumber,
        brand: analog.brand,
        name: analog.name,
        type: analog.type
      }));
      
      getAnalogOffers({ variables: { analogs: analogsToLoad } });
    }
  }, [result?.analogs, getAnalogOffers]);

  // Рекомендуемые товары из той же категории с AutoEuro предложениями
  const { recommendedProducts, isLoading: isLoadingRecommendedPrices } = useRecommendedProducts(
    result?.name || '', 
    result?.articleNumber || searchQuery || '', 
    result?.brand || brandQuery || ''
  );

  // Если это поиск по параметру q, используем q как article
  useEffect(() => {
    if (q && typeof q === 'string' && !article) {
      setSearchQuery(q.trim().toUpperCase());
      const catalogFromUrl = router.query.catalog as string;
      
      if (catalogFromUrl) {
        const catalogToBrandMap: { [key: string]: string } = {
          'AU1587': 'AUDI',
          'VW1587': 'VOLKSWAGEN',
          'BMW1587': 'BMW',
          'MB1587': 'MERCEDES-BENZ',
        };
        
        setBrandQuery(catalogToBrandMap[catalogFromUrl] || '');
      } else {
        setBrandQuery('');
      }
    }
  }, [q, article, router.query]);

  // Собираем ВСЕ предложения (включая внутренние) для ProductPriceHeader
  const allOffersWithInternal = useMemo(() => {
    if (!result) return [];

    const offers: any[] = [];

    // Внутренние предложения из базы данных
    if (result.internalOffers) {
      result.internalOffers.forEach((offer: any) => {
        if (offer.price && offer.price > 0) {
          offers.push({
            ...offer,
            type: 'internal',
            brand: offer.brand || result.brand,
            articleNumber: offer.code || result.articleNumber,
            name: offer.name || result.name,
            isAnalog: false,
            deliveryTime: offer.deliveryTime || 0,
            sortPrice: offer.price
          });
        }
      });
    }

    // Внешние предложения
    if (result.externalOffers) {
      result.externalOffers.forEach((offer: any) => {
        if (offer.price && offer.price > 0) {
          offers.push({
            ...offer,
            type: 'external',
            brand: offer.brand || result.brand,
            articleNumber: offer.code || result.articleNumber,
            name: offer.name || result.name,
            isAnalog: false,
            deliveryTime: offer.deliveryTime,
            sortPrice: offer.price
          });
        }
      });
    }

    return offers;
  }, [result]);

  // Собираем предложения ТОЛЬКО ДЛЯ ТАБЛИЦЫ (БЕЗ внутренних - они показываются в ProductPriceHeader)
  const allOffers = useMemo(() => {
    if (!result) return [];

    const offers: any[] = [];

    // Добавляем только внешние предложения (external)
    if (result.externalOffers) {
      result.externalOffers.forEach((offer: any) => {
        // Показываем только предложения с ценой больше 0
        if (offer.price && offer.price > 0) {
          offers.push({
            ...offer,
            type: 'external',
            brand: offer.brand || result.brand,
            articleNumber: offer.code || result.articleNumber,
            name: offer.name || result.name,
            isAnalog: false,
            deliveryTime: offer.deliveryTime,
            sortPrice: offer.price
          });
        }
      });
    }

    const offersWithRecommendation = offers.map((offer) => ({
      ...offer,
      recommended: offer.type !== 'external',
    }));

    // Сортировка предложений
    const sortedOffers = [...offersWithRecommendation].sort((a, b) => {
      if (a.recommended && !b.recommended) return -1;
      if (!a.recommended && b.recommended) return 1;
      if (a.type !== 'external' && b.type === 'external') return -1;
      if (a.type === 'external' && b.type !== 'external') return 1;

      switch (sortBy) {
        case 'price':
          return a.sortPrice - b.sortPrice;
        case 'quantity':
          return (b.quantity || 0) - (a.quantity || 0);
        case 'delivery':
          return (a.deliveryTime || 999) - (b.deliveryTime || 999);
        default:
          return a.sortPrice - b.sortPrice;
      }
    });

    return sortedOffers;
  }, [result, sortBy]);

  // Видимые предложения
  const visibleOffers = allOffers.slice(0, visibleOffersCount);
  const hasMoreOffers = allOffers.length > visibleOffersCount;

  const handleShowMoreOffers = () => {
    setVisibleOffersCount(prev => Math.min(prev + 4, allOffers.length));
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setVisibleOffersCount(INITIAL_OFFERS_COUNT); // Сбрасываем к начальному количеству
  };

  // Создаем meta-теги
  const metaConfig = result ? createProductMeta({
    name: result.name,
    brand: result.brand,
    articleNumber: result.articleNumber,
    price: allOffersWithInternal.length > 0 ? Math.min(...allOffersWithInternal.map(offer => offer.sortPrice)) : undefined
  }) : getMetaByPath('/card');

  // Генерируем микроразметку Product
  const productSchema = useMemo(() => {
    if (!result || allOffersWithInternal.length === 0) return null;

    const schemaProduct: SchemaOrgProduct = {
      name: result.name,
      description: `${result.brand} ${result.articleNumber} - ${result.name}`,
      brand: result.brand,
      sku: result.articleNumber,
      image:
        (result?.images && result.images.length > 0 ? result.images[0].url : undefined)
        || mainImageUrl
        || (result?.partsIndexImages && result.partsIndexImages.length > 0 ? result.partsIndexImages[0].url : undefined),
      category: "Автозапчасти",
      offers: allOffersWithInternal.map(offer => ({
        price: offer.sortPrice,
        currency: "RUB",
        availability: convertAvailability(offer.quantity || 0),
        seller: offer.type === 'internal' ? 'Protek' : 'AutoEuro',
        deliveryTime: offer.deliveryTime ? `${offer.deliveryTime} ${pluralizeDays(offer.deliveryTime)}` : undefined,
        warehouse: offer.warehouse || 'Склад'
      }))
    };

    return generateProductSchema(schemaProduct);
  }, [result, allOffersWithInternal, mainImageUrl]);

  if (loading) {
    return (
      <>
        <MetaTags 
          title="Загрузка товара - Protek"
          description="Загрузка информации о товаре..."
        />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Загрузка данных товара...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <MetaTags 
        title={metaConfig.title}
        description={metaConfig.description}
        keywords={metaConfig.keywords}
        ogTitle={metaConfig.ogTitle}
        ogDescription={metaConfig.ogDescription}
      />
      {productSchema && <JsonLdScript schema={productSchema} />}
      <InfoCard
        brand={result ? result.brand : brandQuery}
        articleNumber={result ? result.articleNumber : searchQuery}
        name={result ? result.name : "деталь"}
        productId={artId ? String(artId) : undefined}
        price={allOffersWithInternal.length > 0 ? Math.min(...allOffersWithInternal.map(offer => offer.sortPrice)) : 0}
        currency="RUB"
        image={(() => {
          const isPlaceholder = (url?: string) => {
            if (!url) return true;
            const u = url.toLowerCase();
            return (
              u.includes('image-10') ||
              u.includes('162615') ||
              u.includes('noimage') ||
              u.includes('placeholder') ||
              u.includes('mock') ||
              u.includes('mockup') ||
              u.includes('akum') ||
              u.includes('akkum') ||
              u.includes('akku') ||
              u.includes('accum') ||
              u.includes('accumulator') ||
              u.includes('battery') ||
              u.includes('/akb')
            );
          };
          const cms = (result?.images?.map((img: any) => img.url) || []).filter(Boolean);
          const cmsReal = cms.find((u: string) => !isPlaceholder(u));
          if (cmsReal) return cmsReal;
          if (mainImageUrl && !isPlaceholder(mainImageUrl)) return mainImageUrl;
          const pidx = (result?.partsIndexImages || []).map((img: any) => img.url).find((u: string) => !isPlaceholder(u));
          return pidx || mainImageUrl || undefined;
        })()}
      />
      {/* Аналитика отправляется в useEffect выше */}
      {!loading && !categoriesLoading && breadcrumbs.length > 2 && categoryPath.length > 0 && (
        <CatalogInfoHeader
          title={result?.name || "Товар"}
          breadcrumbs={breadcrumbs}
          showCount={false}
          showProductHelp={false}
        />
      )}
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-vflex flex-block-14">
            <div className="w-layout-hflex core-product-card-copy">
              <ProductImageGallery 
                imageUrl={mainImageUrl}
                images={(result?.images?.map((img: any) => img.url)) || []}
              />
              <div className=" flex-block-48">
                <ProductPriceHeader
                  offers={allOffersWithInternal}
                  brand={result ? result.brand : brandQuery}
                  articleNumber={result ? result.articleNumber : searchQuery}
                  name={result ? result.name : "деталь"}
                />
                <ProductList 
                  offers={visibleOffers}
                  isLoading={loading}
                  hasMoreOffers={hasMoreOffers}
                  onShowMore={handleShowMoreOffers}
                  remainingCount={allOffers.length - visibleOffersCount}
                />
                <div className="w-layout-vflex description-item">
                  <ProductCharacteristics 
                    result={result}
                  />
                </div>
              </div>
            </div>
            <CartRecommended 
              recommendedProducts={recommendedProducts}
              isLoadingPrices={analogsLoading || isLoadingRecommendedPrices}
            />
          </div>
        </div>
      </section>
      <section className="section-3">
        <CatalogSubscribe />
      </section>
      <Footer />
      <MobileMenuBottomSection />
    </>
  );
} 
