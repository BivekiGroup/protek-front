import React, { useState } from 'react';
import Head from 'next/head';
import Footer from '@/components/Footer';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '@/lib/graphql';
import Link from 'next/link';
import {
  ChevronRight, Package, Wrench, Zap, Droplet, Settings,
  Battery, Sparkles, Tag, Cog, Gauge, Car, Circle, CircleDot,
  Square, Filter, GitBranch, Radio, Puzzle, Box
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
  _count?: {
    products: number;
  };
}

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

const CatalogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Category[]>([]);

  const { data, loading, error } = useQuery(GET_CATEGORIES, {
    variables: { includeHidden: false }
  });

  // Функция для поиска категории по ID (рекурсивно по всему дереву)
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

  // Функция для получения всех родительских категорий до корня
  const getCategoryPath = (categoryId: string, allCategories: Category[]): Category[] => {
    const category = findCategoryById(allCategories, categoryId);
    if (!category) return [];

    if (category.parentId) {
      const parentPath = getCategoryPath(category.parentId, allCategories);
      return [...parentPath, category];
    }
    return [category];
  };

  const handleCategoryClick = (category: Category) => {
    const allCategories = data?.categories || [];
    const path = getCategoryPath(category.id, allCategories);
    console.log('🍞 Catalog Breadcrumbs Path:', path.map(c => c.name).join(' → '));
    setBreadcrumbs(path);
    setSelectedCategory(category);
  };

  const handleBackClick = () => {
    if (breadcrumbs.length > 1) {
      const newBreadcrumbs = breadcrumbs.slice(0, -1);
      setBreadcrumbs(newBreadcrumbs);
      setSelectedCategory(newBreadcrumbs[newBreadcrumbs.length - 1]);
    } else {
      setBreadcrumbs([]);
      setSelectedCategory(null);
    }
  };

  const currentCategories = selectedCategory?.children ||
    (data?.categories?.filter((cat: Category) => !cat.parentId) || []);

  const hasSubcategories = selectedCategory?.children && selectedCategory.children.length > 0;

  if (loading) {
    return (
      <>
        <Head>
          <title>Каталог - Protek</title>
          <meta name="description" content="Каталог автозапчастей и товаров для автомобилей" />
        </Head>
        <section style={{ padding: '40px 0', background: '#F9FAFB', minHeight: 'calc(100vh - 200px)' }}>
          <div style={{ maxWidth: '1580px', margin: '0 auto', padding: '0 20px' }}>
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#EC1C24]"></div>
              <p className="mt-4 text-gray-600 font-onest">Загрузка каталога...</p>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Каталог - Protek</title>
          <meta name="description" content="Каталог автозапчастей и товаров для автомобилей" />
        </Head>
        <section style={{ padding: '40px 0', background: '#F9FAFB', minHeight: 'calc(100vh - 200px)' }}>
          <div style={{ maxWidth: '1580px', margin: '0 auto', padding: '0 20px' }}>
            <div className="text-center py-20">
              <p className="text-red-600 font-onest">Ошибка загрузки каталога</p>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Каталог - Protek</title>
        <meta name="description" content="Каталог автозапчастей и товаров для автомобилей" />
      </Head>

      {/* Хлебные крошки и заголовок */}
      <section className="section-info">
        <div className="w-layout-blockcontainer container info w-container">
          <div className="w-layout-vflex flex-block-9">
            <div className="w-layout-hflex flex-block-7">
              <a href="/" className="link-block w-inline-block">
                <div>Главная</div>
              </a>
              <div className="text-block-3">→</div>
              {breadcrumbs.length === 0 ? (
                <a href="/catalog" className="link-block-2 w-inline-block">
                  <div>Каталог</div>
                </a>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setBreadcrumbs([]);
                      setSelectedCategory(null);
                    }}
                    className="link-block w-inline-block"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    <div>Каталог</div>
                  </button>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.id}>
                      <div className="text-block-3">→</div>
                      <button
                        onClick={() => {
                          const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
                          setBreadcrumbs(newBreadcrumbs);
                          setSelectedCategory(crumb);
                        }}
                        className={index === breadcrumbs.length - 1 ? "link-block-2 w-inline-block" : "link-block w-inline-block"}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                      >
                        <div>{crumb.name}</div>
                      </button>
                    </React.Fragment>
                  ))}
                </>
              )}
            </div>
            <div className="w-layout-hflex flex-block-8">
              <div className="w-layout-hflex flex-block-10">
                <h1 className="heading">
                  {selectedCategory ? selectedCategory.name : 'Каталог'}
                </h1>
                {selectedCategory && selectedCategory._count && selectedCategory._count.products > 0 && (
                  <div className="text-block-4">
                    {selectedCategory._count.products} {
                      selectedCategory._count.products === 1 ? 'товар' :
                      selectedCategory._count.products < 5 ? 'товара' :
                      'товаров'
                    } в категории
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '40px 0', background: '#F9FAFB', minHeight: 'calc(100vh - 200px)' }}>
        <div style={{ maxWidth: '1580px', margin: '0 auto', padding: '0 20px' }}>
          {/* Кнопка "Назад" */}
          {selectedCategory && (
            <div className="mb-6">
              <button
                onClick={handleBackClick}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg font-onest text-sm text-gray-700 hover:border-[#EC1C24] hover:text-[#EC1C24] transition-all shadow-sm hover:shadow"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Назад
              </button>
            </div>
          )}

          {/* Grid с категориями */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {currentCategories.map((category: Category) => {
              const hasChildren = category.children && category.children.length > 0;

              return (
                <div
                  key={category.id}
                  onClick={() => {
                    if (hasChildren) {
                      handleCategoryClick(category);
                    } else {
                      // Переход на страницу категории с товарами
                      window.location.href = `/catalog/${category.slug}`;
                    }
                  }}
                  className="group relative bg-white rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-[#EC1C24] overflow-hidden h-[85px] flex items-center justify-center"
                >
                  {/* Название категории */}
                  <h3 className="font-onest font-medium text-sm text-[#041124] group-hover:text-[#EC1C24] transition-colors text-center leading-snug">
                    {category.name}
                  </h3>

                  {/* Индикатор активности */}
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#EC1C24] group-hover:w-full transition-all duration-300"></div>
                </div>
              );
            })}
          </div>

          {/* Пустое состояние */}
          {currentCategories.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="font-onest font-semibold text-xl text-gray-700 mb-2">
                Категории не найдены
              </h3>
              <p className="font-onest text-sm text-gray-500 mb-6">
                В этом разделе пока нет доступных категорий
              </p>
              {selectedCategory && (
                <button
                  onClick={handleBackClick}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#EC1C24] text-white rounded-lg font-onest font-medium hover:bg-[#d91919] transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Вернуться назад
                </button>
              )}
            </div>
          )}

          {/* Специальные разделы (если на главной странице каталога) */}
          {!selectedCategory && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="font-onest font-bold text-2xl text-[#041124] mb-6">
                Специальные предложения
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Лучшая цена */}
                <Link
                  href="/best-price"
                  className="group relative bg-gradient-to-br from-[#0D336C] to-[#1a4a8f] rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-onest font-bold text-xl text-white">
                        Лучшая цена
                      </h3>
                      <Tag className="w-6 h-6 text-white/80" />
                    </div>
                    <p className="font-onest text-sm text-white/70 mb-4">
                      Самые выгодные предложения на автозапчасти
                    </p>
                    <div className="flex items-center gap-2 text-white font-onest text-sm font-medium">
                      Перейти
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>

                {/* Новые поступления */}
                <Link
                  href="/new-arrivals"
                  className="group relative bg-gradient-to-br from-[#4DB45E] to-[#3d9e4d] rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-onest font-bold text-xl text-white">
                        Новые поступления
                      </h3>
                      <Sparkles className="w-6 h-6 text-white/80" />
                    </div>
                    <p className="font-onest text-sm text-white/70 mb-4">
                      Последние новинки в нашем ассортименте
                    </p>
                    <div className="flex items-center gap-2 text-white font-onest text-sm font-medium">
                      Перейти
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>

                {/* Распродажа */}
                <Link
                  href="/sale"
                  className="group relative bg-gradient-to-br from-[#FF5F00] to-[#e65500] rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-onest font-bold text-xl text-white">
                        Распродажа
                      </h3>
                      <div className="flex items-center gap-1">
                        <span className="font-onest font-black text-sm text-white bg-white/20 px-2 py-1 rounded-lg">-30%</span>
                      </div>
                    </div>
                    <p className="font-onest text-sm text-white/70 mb-4">
                      Скидки до 70% на избранные товары
                    </p>
                    <div className="flex items-center gap-2 text-white font-onest text-sm font-medium">
                      Перейти
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default CatalogPage;
