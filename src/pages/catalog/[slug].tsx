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
import {
  Package, Wrench, Zap, Droplet, Settings,
  Battery, Sparkles, Tag, Cog, Gauge, Circle, CircleDot,
  Square, Filter, GitBranch, Radio, Puzzle, Box
} from 'lucide-react';

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
  _count?: {
    products: number;
  };
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

// Расширенная система иконок для категорий
const getCategoryIcon = (name: string) => {
  const lowerName = name.toLowerCase();

  // Масла и жидкости
  if (lowerName.includes('масл') || lowerName.includes('жидкост')) return Droplet;

  // Электрика
  if (lowerName.includes('электр') || lowerName.includes('провод') || lowerName.includes('свеч')) return Zap;

  // Инструменты
  if (lowerName.includes('инструмент') || lowerName.includes('техник') || lowerName.includes('оборудован')) return Wrench;

  // АКБ и батареи
  if (lowerName.includes('акб') || lowerName.includes('батаре') || lowerName.includes('аккумулятор')) return Battery;

  // Химия
  if (lowerName.includes('химия') || lowerName.includes('очист') || lowerName.includes('мойк')) return Sparkles;

  // Аксессуары
  if (lowerName.includes('аксессуар') || lowerName.includes('украш')) return Tag;

  // Двигатель
  if (lowerName.includes('двигател') || lowerName.includes('мотор') || lowerName.includes('поршн')) return Cog;

  // Тормозная система
  if (lowerName.includes('тормоз') || lowerName.includes('колодк')) return CircleDot;

  // Подвеска
  if (lowerName.includes('подвеск') || lowerName.includes('амортизатор') || lowerName.includes('стойк')) return GitBranch;

  // Фильтры
  if (lowerName.includes('фильтр')) return Filter;

  // Шины и диски
  if (lowerName.includes('шин') || lowerName.includes('покрышк')) return Radio;
  if (lowerName.includes('диск')) return Circle;

  // Кузов
  if (lowerName.includes('кузов') || lowerName.includes('бампер') || lowerName.includes('крыл')) return Square;

  // Трансмиссия
  if (lowerName.includes('трансмисс') || lowerName.includes('кпп') || lowerName.includes('сцепл')) return Settings;

  // Салон
  if (lowerName.includes('салон') || lowerName.includes('сидень')) return Box;

  // Система охлаждения
  if (lowerName.includes('охлажд') || lowerName.includes('радиатор')) return Gauge;

  // Запчасти и детали
  if (lowerName.includes('деталь') || lowerName.includes('запчаст') || lowerName.includes('комплект')) return Puzzle;

  // ТО
  if (lowerName.includes(' то') || lowerName.includes('обслуж')) return Settings;

  // По умолчанию
  return Package;
};

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

  // Функция для построения пути категории (иерархия от корня до текущей)
  const getCategoryPath = (category: Category | null, categories: Category[]): Category[] => {
    if (!category) return [];

    const buildPath = (cat: Category, allCats: Category[]): Category[] => {
      if (!cat.parentId) {
        return [cat];
      }

      const parent = findCategoryById(allCats, cat.parentId);
      if (parent) {
        return [...buildPath(parent, allCats), cat];
      }

      return [cat];
    };

    return buildPath(category, categories);
  };

  // Функция для поиска категории по ID
  const findCategoryById = (categories: Category[], targetId: string): Category | null => {
    for (const cat of categories) {
      if (cat.id === targetId) return cat;
      if (cat.children && cat.children.length > 0) {
        const found = findCategoryById(cat.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  // Получаем полный путь категории
  const categoryPath = useMemo(() => {
    if (!currentCategory || !categoriesData?.categories) return [];
    const path = getCategoryPath(currentCategory, categoriesData.categories);
    console.log('🍞 Category Path:', path.map(c => c.name).join(' → '));
    return path;
  }, [currentCategory, categoriesData]);

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

  // Хлебные крошки - строим полный путь от Главной через Каталог и все родительские категории
  const breadcrumbs = useMemo(() => {
    const crumbs = [
      { label: "Главная", href: "/" },
      { label: "Каталог", href: "/catalog" }
    ];

    // Добавляем все категории из пути
    categoryPath.forEach((cat, index) => {
      crumbs.push({
        label: cat.name,
        href: index === categoryPath.length - 1 ? '' : `/catalog/${cat.slug}` // Последняя категория без ссылки
      });
    });

    console.log('🍞 Breadcrumbs:', crumbs.map(c => c.label).join(' → '));
    return crumbs;
  }, [categoryPath]);

  // Проверяем, есть ли у категории подкатегории
  const hasSubcategories = currentCategory?.children && currentCategory.children.length > 0;

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
        count={hasSubcategories ? undefined : products.length}
      />

      {/* Если есть подкатегории - показываем их */}
      {hasSubcategories ? (
        <section style={{ padding: '40px 0', background: '#F9FAFB', minHeight: 'calc(100vh - 200px)' }}>
          <div style={{ maxWidth: '1580px', margin: '0 auto', padding: '0 20px' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {currentCategory.children.map((subcategory: Category) => {
                const Icon = getCategoryIcon(subcategory.name);
                const hasChildren = subcategory.children && subcategory.children.length > 0;
                const productCount = subcategory._count?.products || 0;

                return (
                  <a
                    key={subcategory.id}
                    href={`/catalog/${subcategory.slug}`}
                    className="group relative bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-[#EC1C24]/30 overflow-hidden"
                  >
                    {/* Градиентный фон при ховере */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#EC1C24]/0 to-[#EC1C24]/0 group-hover:from-[#EC1C24]/5 group-hover:to-transparent transition-all duration-300 rounded-xl"></div>

                    {/* Декоративные элементы */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#EC1C24]/5 to-transparent rounded-full blur-2xl group-hover:from-[#EC1C24]/10 transition-all duration-300 -mr-12 -mt-12"></div>

                    <div className="relative z-10">
                      {/* Иконка категории */}
                      <div className="mb-3 inline-flex items-center justify-center w-11 h-11 rounded-lg bg-gradient-to-br from-[#EC1C24]/10 to-[#EC1C24]/5 group-hover:from-[#EC1C24]/20 group-hover:to-[#EC1C24]/10 transition-all duration-300">
                        <Icon className="w-5 h-5 text-[#EC1C24]" strokeWidth={2} />
                      </div>

                      {/* Название категории */}
                      <h3 className="font-onest font-semibold text-base text-[#041124] mb-1.5 group-hover:text-[#EC1C24] transition-colors">
                        {subcategory.name}
                      </h3>

                      {/* Счетчик товаров */}
                      <div className="flex items-center justify-between">
                        {productCount > 0 && (
                          <span className="font-onest text-xs text-gray-500">
                            {productCount} {productCount === 1 ? 'товар' : productCount < 5 ? 'товара' : 'товаров'}
                          </span>
                        )}

                        {/* Индикатор подкатегорий или перехода */}
                        <div className="flex items-center gap-1 ml-auto">
                          {hasChildren && (
                            <span className="font-onest text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                              {subcategory.children.length} {subcategory.children.length === 1 ? 'подкат.' : 'подкат.'}
                            </span>
                          )}
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-[#EC1C24] group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Индикатор активности */}
                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-[#EC1C24] to-[#FF3838] group-hover:w-full transition-all duration-300 rounded-b-xl"></div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        /* Если нет подкатегорий - показываем товары */
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
      )}

      <section className="section-3">
        <CatalogSubscribe />
      </section>
      <Footer />
      <MobileMenuBottomSection />
    </>
  );
}
