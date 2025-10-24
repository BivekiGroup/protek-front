import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import MetaTags from "@/components/MetaTags";
import CatalogInfoHeader from "@/components/CatalogInfoHeader";
import CatalogProductCard from "@/components/CatalogProductCard";
import Loader from "@/components/Loader";
import CatalogSubscribe from "@/components/CatalogSubscribe";
import CatalogSortTabs from "@/components/CatalogSortTabs";
import Filters, { FilterConfig } from "@/components/Filters";
import Footer from "@/components/Footer";
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import { GET_BEST_PRICE_PRODUCTS } from "@/lib/graphql";
import { getMetaByPath } from "@/lib/meta-config";
import { useCart } from "@/contexts/CartContext";
import toast from "react-hot-toast";

interface BestPriceProductData {
  id: string;
  productId: string;
  discount: number;
  isActive: boolean;
  sortOrder: number;
  product: {
    id: string;
    name: string;
    slug?: string;
    article?: string;
    brand?: string;
    retailPrice?: number;
    wholesalePrice?: number;
    stock?: number;
    images?: Array<{
      id?: string;
      url: string;
      alt?: string;
      order?: number;
    }>;
  };
}

const formatPrice = (price?: number | null) => {
  if (!price && price !== 0) {
    return "По запросу";
  }
  return `${price.toLocaleString("ru-RU")} ₽`;
};

const getPrimaryImage = (product: BestPriceProductData["product"]) => {
  if (product.images && product.images.length > 0) {
    return product.images[0]?.url || "/images/162615.webp";
  }
  return "/images/162615.webp";
};

const calculateDiscountedPrice = (price?: number | null, discount?: number | null) => {
  if (!price || !discount) {
    return price ?? null;
  }
  return price * (1 - discount / 100);
};

const SORT_OPTIONS = [
  { key: "popular", label: "По популярности" },
  { key: "price_asc", label: "Сначала дешевле" },
  { key: "price_desc", label: "Сначала дороже" },
  { key: "discount", label: "По размеру скидки" },
];

export default function BestPricePage() {
  const metaConfig = useMemo(() => getMetaByPath('/best-price'), []);
  const [activeSortIndex, setActiveSortIndex] = useState(0);
  const [filterValues, setFilterValues] = useState<{ [key: string]: any }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const { addItem, isInCart } = useCart();

  const sortBy = SORT_OPTIONS[activeSortIndex].key;

  const { data, loading, previousData, error } = useQuery(GET_BEST_PRICE_PRODUCTS, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  // Логирование для отладки
  if (error) {
    console.error('Ошибка загрузки товаров с лучшими ценами:', error);
  }
  if (data?.bestPriceProducts) {
    console.log('Загружено товаров:', data.bestPriceProducts.length, data.bestPriceProducts);
  }

  const rawProductsData: BestPriceProductData[] = (data?.bestPriceProducts ?? previousData?.bestPriceProducts ?? []) as BestPriceProductData[];

  // Фильтруем только активные товары
  const activeProducts = rawProductsData.filter(item => item.isActive);

  // Фильтрация и сортировка
  const products = useMemo(() => {
    let filtered = [...activeProducts];

    // Фильтрация по поисковому запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.product.name?.toLowerCase().includes(query) ||
        item.product.brand?.toLowerCase().includes(query) ||
        item.product.article?.toLowerCase().includes(query)
      );
    }

    // Применяем фильтр по цене
    if (filterValues["Цена"] && Array.isArray(filterValues["Цена"])) {
      const [minPrice, maxPrice] = filterValues["Цена"];
      filtered = filtered.filter(item => {
        const basePrice = item.product.retailPrice ?? item.product.wholesalePrice ?? 0;
        const discountedPrice = calculateDiscountedPrice(basePrice, item.discount);
        const finalPrice = discountedPrice ?? basePrice;
        return finalPrice >= minPrice && finalPrice <= maxPrice;
      });
    }

    // Применяем фильтры по брендам
    if (filterValues["Производитель"] && filterValues["Производитель"].length > 0) {
      filtered = filtered.filter(item =>
        filterValues["Производитель"].includes(item.product.brand)
      );
    }

    // Сортировка
    if (sortBy === "price_asc") {
      filtered.sort((a, b) => {
        const priceA = calculateDiscountedPrice(a.product.retailPrice ?? a.product.wholesalePrice, a.discount) ?? 0;
        const priceB = calculateDiscountedPrice(b.product.retailPrice ?? b.product.wholesalePrice, b.discount) ?? 0;
        return priceA - priceB;
      });
    } else if (sortBy === "price_desc") {
      filtered.sort((a, b) => {
        const priceA = calculateDiscountedPrice(a.product.retailPrice ?? a.product.wholesalePrice, a.discount) ?? 0;
        const priceB = calculateDiscountedPrice(b.product.retailPrice ?? b.product.wholesalePrice, b.discount) ?? 0;
        return priceB - priceA;
      });
    } else if (sortBy === "discount") {
      filtered.sort((a, b) => {
        return (b.discount ?? 0) - (a.discount ?? 0);
      });
    } else {
      // По популярности - используем sortOrder
      filtered.sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return filtered;
  }, [activeProducts, filterValues, sortBy, searchQuery]);

  // Создаем фильтры на основе доступных товаров
  const filters: FilterConfig[] = useMemo(() => {
    const brands = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = 0;

    activeProducts.forEach(item => {
      if (item.product.brand) brands.add(item.product.brand);

      const basePrice = item.product.retailPrice ?? item.product.wholesalePrice ?? 0;
      const discountedPrice = calculateDiscountedPrice(basePrice, item.discount);
      const finalPrice = discountedPrice ?? basePrice;

      if (finalPrice > 0) {
        if (finalPrice < minPrice) minPrice = finalPrice;
        if (finalPrice > maxPrice) maxPrice = finalPrice;
      }
    });

    const filtersList: FilterConfig[] = [];

    // Фильтр по производителю (сначала)
    if (brands.size > 0) {
      filtersList.push({
        type: "dropdown",
        title: "Производитель",
        options: Array.from(brands).sort(),
        multi: true,
        showAll: true,
        defaultOpen: true,
      });
    }

    // Фильтр по цене (потом)
    if (minPrice !== Infinity && maxPrice > 0) {
      filtersList.push({
        type: "range",
        title: "Цена",
        min: Math.floor(minPrice),
        max: Math.ceil(maxPrice),
      });
    }

    return filtersList;
  }, [activeProducts]);

  const isInitialLoading = loading && !previousData;

  const handleFilterChange = (title: string, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [title]: value
    }));
  };

  const handleAddToCart = (item: BestPriceProductData) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (!item.product.article || !item.product.brand) {
        toast.error('Недостаточно данных для добавления товара в корзину');
        return;
      }

      const basePrice = item.product.retailPrice ?? item.product.wholesalePrice ?? 0;
      const discountedPrice = calculateDiscountedPrice(basePrice, item.discount);
      const finalPrice = discountedPrice ?? basePrice;

      addItem({
        name: item.product.name,
        brand: item.product.brand,
        article: item.product.article,
        description: item.product.name,
        price: finalPrice,
        quantity: 1,
        currency: 'RUB',
        image: getPrimaryImage(item.product),
        isExternal: true
      });

      toast.success('Товар добавлен в корзину');
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      toast.error('Ошибка добавления товара в корзину');
    }
  };

  return (
    <>
      <MetaTags
        title={metaConfig.title}
        description={metaConfig.description}
        keywords={metaConfig.keywords}
        ogTitle={metaConfig.ogTitle}
        ogDescription={metaConfig.ogDescription}
      />
      <CatalogInfoHeader
        title="Лучшие цены"
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Лучшие цены" }
        ]}
        count={products.length}
      />
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          {/* Layout с фильтрами слева и товарами справа */}
          <div className="flex gap-6 items-start">
            {/* Фильтры слева */}
            {filters.length > 0 && (
              <div className="w-[280px] flex-shrink-0 relative z-10">
                <Filters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  filterValues={filterValues}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  isLoading={isInitialLoading}
                />
              </div>
            )}

            {/* Товары справа */}
            <div className="flex-1 min-w-0">
              {/* Сортировка */}
              <div className="mb-10">
                <CatalogSortTabs
                  active={activeSortIndex}
                  onChange={setActiveSortIndex}
                  options={SORT_OPTIONS.map(o => o.label)}
                />
              </div>

              {/* Сетка товаров */}
              <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(200px,1fr))] mb-8">
                {isInitialLoading ? (
                  <div className="col-span-full">
                    <Loader text="Загружаем лучшие цены" size="large" />
                  </div>
                ) : products.length ? (
                  products.map((item: BestPriceProductData) => {
                    const basePrice = item.product.retailPrice ?? item.product.wholesalePrice ?? null;
                    const discountedPrice = calculateDiscountedPrice(basePrice, item.discount);
                    const hasDiscount = !!item.discount && item.discount > 0 && basePrice != null;
                    // Проверяем реальное наличие из поля stock (из БД)
                    const hasStock = (item.product.stock ?? 0) > 0;

                    return (
                      <CatalogProductCard
                        key={item.id}
                        image={getPrimaryImage(item.product)}
                        discount={hasDiscount ? `-${item.discount}%` : undefined}
                        price={formatPrice(hasDiscount ? discountedPrice : basePrice)}
                        oldPrice={hasDiscount ? formatPrice(basePrice) : ""}
                        title={item.product.name}
                        brand={item.product.brand || "Неизвестный бренд"}
                        articleNumber={item.product.article}
                        brandName={item.product.brand}
                        artId={item.product.id}
                        productId={item.product.id}
                        onAddToCart={hasStock ? handleAddToCart(item) : undefined}
                        outOfStock={!hasStock}
                      />
                    );
                  })
                ) : (
                  <div className="col-span-full py-20 px-10 text-center flex flex-col items-center gap-6">
                    {/* Иконка */}
                    <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#EC1C24"/>
                      </svg>
                    </div>

                    {/* Текст */}
                    <div className="max-w-[480px]">
                      <h2 className="font-onest font-bold text-2xl leading-[130%] text-[#000814] mb-3">
                        {filterValues["Производитель"]?.length > 0 || searchQuery.trim()
                          ? "По заданным фильтрам ничего не найдено"
                          : "Скоро здесь появятся товары с лучшими ценами"}
                      </h2>
                      <p className="font-onest font-normal text-base leading-[140%] text-slate-500">
                        {filterValues["Производитель"]?.length > 0 || searchQuery.trim()
                          ? "Попробуйте изменить параметры фильтрации или поиска, чтобы найти нужные товары"
                          : "Мы активно работаем над пополнением ассортимента. Следите за обновлениями!"}
                      </p>
                    </div>

                    {/* Кнопка */}
                    {(filterValues["Производитель"]?.length > 0 || searchQuery.trim()) && (
                      <button
                        type="button"
                        onClick={() => {
                          setFilterValues({});
                          setSearchQuery("");
                        }}
                        className="mt-2 px-6 py-3 bg-[#EC1C24] hover:bg-[#D81B21] rounded-lg border-none font-onest font-semibold text-base text-white cursor-pointer transition-colors duration-200"
                      >
                        Сбросить фильтры
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
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
