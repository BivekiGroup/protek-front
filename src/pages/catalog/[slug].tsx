import { useMemo, useState } from "react";
import { useRouter } from "next/router";
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
import { GET_PRODUCTS_BY_CATEGORY, GET_CATEGORIES } from "@/lib/graphql";
import { getMetaByPath } from "@/lib/meta-config";
import { useCart } from "@/contexts/CartContext";
import toast from "react-hot-toast";

interface CategoryProduct {
  id: string;
  name: string;
  slug?: string;
  article?: string;
  brand?: string;
  retailPrice?: number;
  wholesalePrice?: number;
  stock?: number;
  createdAt?: string;
  images?: Array<{
    id: string;
    url: string;
    alt?: string;
    order?: number;
  }>;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isHidden: boolean;
  parentId?: string;
  level: number;
  children: Category[];
}

const PAGE_SIZE = 24;

const formatPrice = (price?: number | null) => {
  if (!price && price !== 0) {
    return "По запросу";
  }
  return `${price.toLocaleString("ru-RU")} ₽`;
};

const getPrimaryImage = (product: CategoryProduct) => {
  const isPlaceholder = (url?: string) => {
    if (!url) return true;
    const u = url.toLowerCase();
    return (
      u.includes('image-10') ||
      u.includes('162615') ||
      u.includes('noimage') ||
      u.includes('placeholder') ||
      u.includes('mock')
    );
  };

  const imageUrl = product.images?.[0]?.url;
  return imageUrl && !isPlaceholder(imageUrl) ? imageUrl : "/images/no-photo.svg";
};

const SORT_OPTIONS = [
  { key: "popular", label: "По популярности" },
  { key: "price_asc", label: "Сначала дешевле" },
  { key: "price_desc", label: "Сначала дороже" },
  { key: "newest", label: "Новинки" },
];

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;
  const metaConfig = useMemo(() => getMetaByPath(`/catalog/${slug}`), [slug]);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [activeSortIndex, setActiveSortIndex] = useState(0);
  const [filterValues, setFilterValues] = useState<{ [key: string]: any }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const { addItem, isInCart } = useCart();

  const sortBy = SORT_OPTIONS[activeSortIndex].key;

  // Получаем категории для хлебных крошек
  const { data: categoriesData } = useQuery<{ categories: Category[] }>(GET_CATEGORIES);

  // Получаем товары категории
  const { data, loading, previousData, error } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: { categorySlug: slug, limit },
    skip: !slug,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  // Логирование для отладки
  if (error) {
    console.error('Ошибка загрузки товаров категории:', error);
  }
  if (data?.productsByCategory) {
    console.log('Загружено товаров:', data.productsByCategory.length, data.productsByCategory);
  }

  const rawProducts: CategoryProduct[] = (data?.productsByCategory ?? previousData?.productsByCategory ?? []) as CategoryProduct[];

  // Находим текущую категорию для заголовка
  const findCategoryBySlug = (categories: Category[], targetSlug: string): Category | null => {
    for (const cat of categories) {
      if (cat.slug === targetSlug) return cat;
      if (cat.children && cat.children.length > 0) {
        const found = findCategoryBySlug(cat.children, targetSlug);
        if (found) return found;
      }
    }
    return null;
  };

  const currentCategory = useMemo(() => {
    if (!categoriesData?.categories || !slug) return null;
    return findCategoryBySlug(categoriesData.categories, slug as string);
  }, [categoriesData, slug]);

  // Фильтрация и сортировка
  const products = useMemo(() => {
    let filtered = [...rawProducts];

    // Фильтрация по поисковому запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.article?.toLowerCase().includes(query)
      );
    }

    // Применяем фильтр по цене
    if (filterValues["Цена"] && Array.isArray(filterValues["Цена"])) {
      const [minPrice, maxPrice] = filterValues["Цена"];
      filtered = filtered.filter(p => {
        const price = p.retailPrice ?? p.wholesalePrice ?? 0;
        return price >= minPrice && price <= maxPrice;
      });
    }

    // Применяем фильтры по брендам
    if (filterValues["Производитель"] && filterValues["Производитель"].length > 0) {
      filtered = filtered.filter(p =>
        filterValues["Производитель"].includes(p.brand)
      );
    }

    // Сортировка
    if (sortBy === "price_asc") {
      filtered.sort((a, b) => {
        const priceA = a.retailPrice ?? a.wholesalePrice ?? 0;
        const priceB = b.retailPrice ?? b.wholesalePrice ?? 0;
        return priceA - priceB;
      });
    } else if (sortBy === "price_desc") {
      filtered.sort((a, b) => {
        const priceA = a.retailPrice ?? a.wholesalePrice ?? 0;
        const priceB = b.retailPrice ?? b.wholesalePrice ?? 0;
        return priceB - priceA;
      });
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    return filtered;
  }, [rawProducts, filterValues, sortBy, searchQuery]);

  // Создаем фильтры на основе доступных товаров
  const filters: FilterConfig[] = useMemo(() => {
    const brands = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = 0;

    rawProducts.forEach(p => {
      if (p.brand) brands.add(p.brand);

      const price = p.retailPrice ?? p.wholesalePrice ?? 0;
      if (price > 0) {
        if (price < minPrice) minPrice = price;
        if (price > maxPrice) maxPrice = price;
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
  }, [rawProducts]);

  const isInitialLoading = loading && !previousData;
  const isLoadingMore = loading && !!previousData;
  const canLoadMore = !isInitialLoading && rawProducts.length >= limit;

  const handleLoadMore = () => {
    setLimit((prev) => prev + PAGE_SIZE);
  };

  const handleFilterChange = (title: string, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [title]: value
    }));
  };

  const handleAddToCart = (product: CategoryProduct) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (!product.article || !product.brand) {
        toast.error('Недостаточно данных для добавления товара в корзину');
        return;
      }

      const price = product.retailPrice ?? product.wholesalePrice ?? 0;

      addItem({
        name: product.name,
        brand: product.brand,
        article: product.article,
        description: product.name,
        price: price,
        quantity: 1,
        currency: 'RUB',
        image: getPrimaryImage(product),
        isExternal: true
      });

      toast.success('Товар добавлен в корзину');
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      toast.error('Ошибка добавления товара в корзину');
    }
  };

  // Хлебные крошки
  const breadcrumbs = [
    { label: "Главная", href: "/" },
    { label: currentCategory?.name || "Каталог" }
  ];

  return (
    <>
      <MetaTags
        title={currentCategory?.name ? `${currentCategory.name} - Каталог` : metaConfig.title}
        description={currentCategory?.description || metaConfig.description}
        keywords={metaConfig.keywords}
        ogTitle={metaConfig.ogTitle}
        ogDescription={metaConfig.ogDescription}
      />
      <CatalogInfoHeader
        title={currentCategory?.name || "Каталог"}
        breadcrumbs={breadcrumbs}
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
                    <Loader text="Загружаем товары" size="large" />
                  </div>
                ) : products.length ? (
                  products.map((product: CategoryProduct) => {
                    const primaryPrice = product.retailPrice ?? product.wholesalePrice ?? null;
                    // Проверяем реальное наличие из поля stock (из БД)
                    const hasStock = (product.stock ?? 0) > 0;

                    return (
                      <CatalogProductCard
                        key={product.id}
                        image={getPrimaryImage(product)}
                        discount=""
                        price={formatPrice(primaryPrice)}
                        oldPrice=""
                        title={product.name}
                        brand={product.brand || "Неизвестный бренд"}
                        articleNumber={product.article}
                        brandName={product.brand}
                        artId={product.id}
                        productId={product.id}
                        onAddToCart={hasStock ? handleAddToCart(product) : undefined}
                        outOfStock={!hasStock}
                      />
                    );
                  })
                ) : (
                  <div className="col-span-full py-20 px-10 text-center flex flex-col items-center gap-6">
                    {/* Иконка */}
                    <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 7H4C2.9 7 2 7.9 2 9V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V9C22 7.9 21.1 7 20 7ZM20 19H4V9H20V19ZM12 12C10.9 12 10 12.9 10 14C10 15.1 10.9 16 12 16C13.1 16 14 15.1 14 14C14 12.9 13.1 12 12 12ZM16 3H8V5H16V3Z" fill="#EC1C24"/>
                      </svg>
                    </div>

                    {/* Текст */}
                    <div className="max-w-[480px]">
                      <h2 className="font-onest font-bold text-2xl leading-[130%] text-[#000814] mb-3">
                        {filterValues["Производитель"]?.length > 0 || searchQuery.trim()
                          ? "По заданным фильтрам ничего не найдено"
                          : "В этой категории пока нет товаров"}
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

              {/* Кнопка показать ещё */}
              {canLoadMore && (
                <div className="w-layout-hflex pagination justify-center">
                  <button
                    type="button"
                    className={`button_strock w-button showall-btn ${isLoadingMore ? 'opacity-70 cursor-wait' : ''}`}
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? 'Загрузка…' : 'Показать ещё'}
                  </button>
                </div>
              )}
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
