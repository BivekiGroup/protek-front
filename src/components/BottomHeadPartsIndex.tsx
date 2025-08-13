import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_PARTSINDEX_CATEGORIES } from '@/lib/graphql';

function useIsMobile(breakpoint = 767) {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

// Типы данных
interface PartsIndexTabData {
  label: string;
  heading: string;
  links: string[];
  catalogId: string;
  group?: any;
  groupsLoaded?: boolean; // флаг что группы загружены
}

interface PartsIndexCatalog {
  id: string;
  name: string;
  image?: string;
  groups?: PartsIndexGroup[];
}

interface PartsIndexGroup {
  id: string;
  name: string;
  image?: string;
  entityNames?: { id: string; name: string }[];
  subgroups?: { id: string; name: string }[];
}

// GraphQL типы
interface PartsIndexCatalogsData {
  partsIndexCategoriesWithGroups: PartsIndexCatalog[];
}

interface PartsIndexCatalogsVariables {
  lang?: 'ru' | 'en';
}

// Fallback статичные данные
const fallbackTabData: PartsIndexTabData[] = [
  {
    label: "Детали ТО",
    heading: "Детали ТО",
    catalogId: "parts_to",
    links: ["Детали ТО"],
    groupsLoaded: false,
  },
  {
    label: "Масла",
    heading: "Масла",
    catalogId: "oils",
    links: ["Масла"],
    groupsLoaded: false,
  },
  {
    label: "Шины",
    heading: "Шины", 
    catalogId: "tyres",
    links: ["Шины"],
    groupsLoaded: false,
  },
];

// Создаем базовые табы только с названиями каталогов
const createBaseTabData = (catalogs: PartsIndexCatalog[]): PartsIndexTabData[] => {
  console.log('🔄 Создаем базовые табы из каталогов:', catalogs.length, 'элементов');
  
  return catalogs.map(catalog => ({
    label: catalog.name,
    heading: catalog.name,
    links: [catalog.name], // Изначально показываем только название каталога
    catalogId: catalog.id,
    groupsLoaded: false, // Группы еще не загружены
  }));
};

// Преобразуем данные PartsIndex в формат нашего меню с группами
const transformPartsIndexToTabData = (catalog: PartsIndexCatalog): string[] => {
  console.log(`📝 Обрабатываем группы каталога: "${catalog.name}"`);
  
  let links: string[] = [];
  
  if (catalog.groups && catalog.groups.length > 0) {
    // Для каждой группы проверяем есть ли подгруппы
    catalog.groups.forEach(group => {
      if (group.subgroups && group.subgroups.length > 0) {
        // Если есть подгруппы, добавляем их названия
        links.push(...group.subgroups.slice(0, 9 - links.length).map(subgroup => subgroup.name));
      } else {
        // Если подгрупп нет, добавляем название самой группы
        if (links.length < 9) {
          links.push(group.name);
        }
      }
    });
  }
  
  // Если подкатегорий нет, показываем название категории
  if (links.length === 0) {
    links = [catalog.name];
  }
  
  console.log(`🔗 Подкатегории для "${catalog.name}":`, links);
  return links.slice(0, 9); // Ограничиваем максимум 9 элементов
};

const BottomHeadPartsIndex = ({ menuOpen, onClose }: { menuOpen: boolean; onClose: () => void }) => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [mobileCategory, setMobileCategory] = useState<null | any>(null);
  const [tabData, setTabData] = useState<PartsIndexTabData[]>(fallbackTabData);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [loadingGroups, setLoadingGroups] = useState<Set<number>>(new Set());
  
  // Пагинация категорий
  const [currentPage, setCurrentPage] = useState(0);
  const categoriesPerPage = 6; // Количество категорий на странице

  // --- Overlay animation state ---
  const [showOverlay, setShowOverlay] = useState(false);
  useEffect(() => {
    if (menuOpen) {
      setShowOverlay(true);
    } else {
      const timeout = setTimeout(() => setShowOverlay(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [menuOpen]);

  // Получаем только каталоги PartsIndex (без групп для начальной загрузки)
  const { data: catalogsData, loading, error } = useQuery<PartsIndexCatalogsData, PartsIndexCatalogsVariables>(
    GET_PARTSINDEX_CATEGORIES,
    {
      variables: { 
        lang: 'ru'
      },
      errorPolicy: 'all',
      fetchPolicy: 'cache-first', // Используем кэширование агрессивно
      nextFetchPolicy: 'cache-first', // Продолжаем использовать кэш
      notifyOnNetworkStatusChange: false,
      onCompleted: (data) => {
        console.log('🎉 PartsIndex каталоги получены через GraphQL (базовые):', data);
      },
      onError: (error) => {
        console.error('❌ Ошибка загрузки PartsIndex каталогов:', error);
      }
    }
  );

  // Ленивый запрос для загрузки групп конкретного каталога
  const [loadCatalogGroups, { loading: groupsLoading }] = useLazyQuery<PartsIndexCatalogsData, PartsIndexCatalogsVariables>(
    GET_PARTSINDEX_CATEGORIES,
    {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-first',
      notifyOnNetworkStatusChange: false,
      onCompleted: (data) => {
        console.log('🎉 Группы каталога загружены:', data);
      },
      onError: (error) => {
        console.error('❌ Ошибка загрузки групп каталога:', error);
      }
    }
  );

  // Обновляем базовые данные табов когда получаем каталоги
  useEffect(() => {
    if (catalogsData?.partsIndexCategoriesWithGroups && catalogsData.partsIndexCategoriesWithGroups.length > 0) {
      console.log('✅ Обновляем базовое меню PartsIndex:', catalogsData.partsIndexCategoriesWithGroups.length, 'каталогов');
      
      const baseTabData = createBaseTabData(catalogsData.partsIndexCategoriesWithGroups);
      setTabData(baseTabData);
      setActiveTabIndex(0);
    } else if (error) {
      console.warn('⚠️ Используем fallback данные из-за ошибки PartsIndex:', error);
      setTabData(fallbackTabData);
      setActiveTabIndex(0);
    }
  }, [catalogsData, error]);

  // Функция для ленивой загрузки групп при наведении на таб
  const loadGroupsForTab = async (tabIndex: number) => {
    const tab = tabData[tabIndex];
    if (!tab || tab.groupsLoaded || loadingGroups.has(tabIndex)) {
      return; // Группы уже загружены или загружаются
    }

    console.log('🔄 Загружаем группы для каталога:', tab.catalogId);
    setLoadingGroups(prev => new Set([...prev, tabIndex]));

    try {
      const result = await loadCatalogGroups({
        variables: {
          lang: 'ru'
        }
      });

      if (result.data?.partsIndexCategoriesWithGroups) {
        const catalog = result.data.partsIndexCategoriesWithGroups.find(c => c.id === tab.catalogId);
        if (catalog) {
          const links = transformPartsIndexToTabData(catalog);
          
          // Обновляем конкретный таб с загруженными группами
          setTabData(prevTabs => {
            const newTabs = [...prevTabs];
            newTabs[tabIndex] = {
              ...newTabs[tabIndex],
              links,
              group: catalog.groups?.[0],
              groupsLoaded: true
            };
            return newTabs;
          });
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки групп для каталога:', tab.catalogId, error);
    } finally {
      setLoadingGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(tabIndex);
        return newSet;
      });
    }
  };

  // Обработчик наведения на таб - загружаем группы
  const handleTabHover = (tabIndex: number) => {
    loadGroupsForTab(tabIndex);
  };

  // Обработчик клика на таб
  const handleTabClick = (tabIndex: number) => {
    setActiveTabIndex(tabIndex);
    
    // Загружаем группы если еще не загружены
    loadGroupsForTab(tabIndex);
  };

  // Обработка клика по категории для перехода в каталог
  const handleCategoryClick = (catalogId: string, categoryName: string, entityId?: string) => {
    console.log('🔍 Клик по категории Parts Index:', { catalogId, categoryName, entityId });
    
    onClose();
    
    router.push({
      pathname: '/catalog',
      query: {
        partsIndexCatalog: catalogId,
        categoryName: encodeURIComponent(categoryName),
        ...(entityId && { partsIndexCategory: entityId })
      }
    });
  };

  // Получаем текущие категории для отображения с пагинацией
  const getCurrentPageCategories = () => {
    const startIndex = currentPage * categoriesPerPage;
    const endIndex = startIndex + categoriesPerPage;
    return tabData.slice(startIndex, endIndex);
  };

  // Проверяем, есть ли следующая/предыдущая страница
  const hasNextPage = (currentPage + 1) * categoriesPerPage < tabData.length;
  const hasPrevPage = currentPage > 0;

  // Обработчики пагинации
  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
      setActiveTabIndex(0);
    }
  };

  const handlePrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
      setActiveTabIndex(0);
    }
  };

  const currentPageCategories = getCurrentPageCategories();

  // Только мобильный UX
  if (isMobile && menuOpen) {
    return (
      <>
        {showOverlay && (
          <div
            className={`fixed inset-0 bg-black/7 z-40 transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
            aria-label="Закрыть меню"
          />
        )}
        {/* Экран подкатегорий */}
        {mobileCategory ? (
          <div className="mobile-category-overlay z-50">
            <div className="mobile-header">
              <button className="mobile-back-btn" onClick={() => setMobileCategory(null)}>
                ←
              </button>
              <span>{mobileCategory.label}</span>
            </div>
            <div className="mobile-subcategories">
              {mobileCategory.links.map((link: string, index: number) => (
                <div 
                  className="mobile-subcategory" 
                  key={link} 
                  onClick={() => {
                    const entityId = mobileCategory.group?.entityNames?.[index]?.id;
                    handleCategoryClick(mobileCategory.catalogId, link, entityId);
                  }}
                >
                  {link}
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Экран выбора категории
          <div className="mobile-category-overlay z-50">
            <div className="mobile-header">
              <button className="mobile-back-btn" onClick={onClose} aria-label="Закрыть меню">
                <svg width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.11 2.697L2.698 4.11 6.586 8l-3.89 3.89 1.415 1.413L8 9.414l3.89 3.89 1.413-1.415L9.414 8l3.89-3.89-1.415-1.413L8 6.586l-3.89-3.89z" fill="currentColor"></path>
                </svg>
              </button>
              <span>Категории Parts Index</span>
              {loading && <span className="text-sm text-gray-500 ml-2">(загрузка...)</span>}
            </div>
            
            {/* Пагинация для мобильной версии */}
            {tabData.length > categoriesPerPage && (
              <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b">
                <button 
                  onClick={handlePrevPage}
                  disabled={!hasPrevPage}
                  className="text-sm text-blue-600 disabled:text-gray-400"
                >
                  ← Предыдущие
                </button>
                <span className="text-sm text-gray-600">
                  {currentPage + 1} из {Math.ceil(tabData.length / categoriesPerPage)}
                </span>
                <button 
                  onClick={handleNextPage}
                  disabled={!hasNextPage}
                  className="text-sm text-blue-600 disabled:text-gray-400"
                >
                  Следующие →
                </button>
              </div>
            )}
            
            <div className="mobile-subcategories">
              {currentPageCategories.map((cat) => (
                <div
                  className="mobile-subcategory"
                  key={cat.catalogId}
                  onClick={() => {
                    // Загружаем группы для категории если нужно
                    const catIndex = tabData.findIndex(tab => tab.catalogId === cat.catalogId);
                    if (catIndex !== -1) {
                      loadGroupsForTab(catIndex);
                    }
                    
                    const categoryWithData = {
                      ...cat,
                      catalogId: cat.catalogId,
                      group: cat.group
                    };
                    setMobileCategory(categoryWithData);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {cat.label}
                  {loadingGroups.has(tabData.findIndex(tab => tab.catalogId === cat.catalogId)) && (
                    <span className="text-xs text-gray-500 ml-2">(загрузка...)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  // Если не мобильный или меню закрыто, возвращаем пустой элемент
  if (!menuOpen) {
    return null;
  }

  // Desktop версия
  return (
    <>
      {showOverlay && (
        <div
          className={`fixed inset-0 bg-black/7 z-40 transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
          aria-label="Закрыть меню"
        />
      )}
      <div className="menu-all">
        <div className="div-block-28">
          <div className="w-layout-hflex flex-block-90">
            <div className="w-layout-vflex flex-block-88">
              {/* Кнопки пагинации */}
              {tabData.length > categoriesPerPage && (
                <div className="flex justify-between items-center mb-4 px-3">
                  <button 
                    onClick={handlePrevPage}
                    disabled={!hasPrevPage}
                    className="flex items-center space-x-1 text-sm text-blue-600 disabled:text-gray-400 hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Назад</span>
                  </button>
                  <span className="text-sm text-gray-600">
                    {currentPage + 1} / {Math.ceil(tabData.length / categoriesPerPage)}
                  </span>
                  <button 
                    onClick={handleNextPage}
                    disabled={!hasNextPage}
                    className="flex items-center space-x-1 text-sm text-blue-600 disabled:text-gray-400 hover:underline"
                  >
                    <span>Далее</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Меню с иконками - показываем текущую страницу категорий */}
              {currentPageCategories.map((tab, idx) => (
                <a
                  href="#"
                  className={`link-block-7 w-inline-block${activeTabIndex === idx ? " w--current" : ""}`}
                  key={tab.catalogId}
                  onClick={() => handleTabClick(idx)}
                  onMouseEnter={() => handleTabHover(idx)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="div-block-29">
                    <div className="code-embed-12 w-embed">
                      <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.3158 0.643914C10.4674 0.365938 10.8666 0.365938 11.0182 0.643914L14.0029 6.11673C14.0604 6.22222 14.1623 6.29626 14.2804 6.31838L20.4077 7.46581C20.7189 7.52409 20.8423 7.9037 20.6247 8.13378L16.3421 12.6636C16.2595 12.7509 16.2206 12.8707 16.2361 12.9899L17.0382 19.1718C17.079 19.4858 16.7561 19.7204 16.47 19.5847L10.8385 16.9114C10.73 16.8599 10.604 16.8599 10.4955 16.9114L4.86394 19.5847C4.5779 19.7204 4.25499 19.4858 4.29573 19.1718L5.0979 12.9899C5.11336 12.8707 5.07444 12.7509 4.99189 12.6636L0.709252 8.13378C0.491728 7.9037 0.615069 7.52409 0.926288 7.46581L7.05357 6.31838C7.17168 6.29626 7.27358 6.22222 7.33112 6.11673L10.3158 0.643914Z" fill="CurrentColor"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="text-block-47">{tab.label}</div>
                </a>
              ))}
            </div>
            {/* Правая часть меню с подкатегориями и картинками */}
            <div className="w-layout-vflex flex-block-89">
              <h3 className="heading-16">
                {currentPageCategories[activeTabIndex]?.heading || currentPageCategories[0]?.heading}
                {loading && <span className="text-sm text-gray-500 ml-2">(обновление...)</span>}
                {loadingGroups.has(activeTabIndex) && <span className="text-sm text-gray-500 ml-2">(загрузка групп...)</span>}
              </h3>
              <div className="w-layout-hflex flex-block-92">
                <div className="w-layout-vflex flex-block-91">
                  {(currentPageCategories[activeTabIndex]?.links || currentPageCategories[0]?.links || []).map((link, index) => {
                    const activeCategory = currentPageCategories[activeTabIndex] || currentPageCategories[0];
                    const entityId = activeCategory?.group?.entityNames?.[index]?.id;
                    return (
                      <div
                        className="link-2"
                        key={link}
                        onClick={() => handleCategoryClick(activeCategory.catalogId, link, entityId)}
                        style={{ cursor: "pointer" }}
                      >
                        {link}
                      </div>
                    );
                  })}
                </div>
                <div className="w-layout-vflex flex-block-91-copy">
                  <img src="https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg" loading="lazy" alt="" className="image-17" />
                  <img src="https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg" loading="lazy" alt="" className="image-17" />
                </div>
              </div>
            </div>
          </div>
          {/* Табы */}
          <div className="w-layout-hflex flex-block-93">
            <div className="w-layout-vflex flex-block-95">
              <div className="w-layout-hflex flex-block-94">
                <div className="text-block-48">Parts Index API</div>
                <div className="text-block-48">Каталоги ТО</div>
                <div className="text-block-48">Каталоги запчастей</div>
              </div>
              <div className="w-layout-hflex flex-block-96">
                <div className="text-block-49">Все каталоги</div>
                <img src="/images/Arrow_right.svg" loading="lazy" alt="" className="image-19" />
              </div>
            </div>
            <div className="w-layout-vflex flex-block-97">
              <img src="/images/img3.png" loading="lazy" alt="" className="image-18" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomHeadPartsIndex;