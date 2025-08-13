  import React, { useState, useEffect } from "react";
  import Link from "next/link";
  import { useRouter } from "next/router";
  import { useQuery } from '@apollo/client';
  import { GET_PARTSINDEX_CATEGORIES, GET_NAVIGATION_CATEGORIES } from '@/lib/graphql';
  import { PartsIndexCatalogsData, PartsIndexCatalogsVariables, PartsIndexCatalog } from '@/types/partsindex';
  import { NavigationCategory } from '@/types';

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



  // Fallback статичные данные
  const fallbackTabData = [
    {
      label: "Оригинальные каталоги",
      heading: "Оригинальные каталоги",
      links: [
        "Моторные масла",
        "Трансмиссионные масла",
        "Тормозные жидкости",
        "Смазки",
        "Дистиллированная вода",
        "Жидкости для стеклоомывателей",
        "Индустриальные жидкости",
        "Антифриз и охлаждающие жидкости",
        "Промывочные жидкости",
      ],
    },
    {
      label: "Масла и технические жидкости",
      heading: "Масла и технические жидкости",
      links: [
        "Моторные масла",
        "Трансмиссионные масла",
        "Тормозные жидкости",
        "Смазки",
        "Дистиллированная вода",
        "Жидкости для стеклоомывателей",
        "Индустриальные жидкости",
        "Антифриз и охлаждающие жидкости",
        "Промывочные жидкости",
      ],
    },
    {
      label: "Оборудование",
      heading: "Оборудование",
      links: [
        "Моторные масла",
        "Трансмиссионные масла",
        "Тормозные жидкости",
        "Смазки",
        "Дистиллированная вода",
        "Жидкости для стеклоомывателей",
        "Индустриальные жидкости",
        "Антифриз и охлаждающие жидкости",
        "Промывочные жидкости",
      ],
    },
  ];

  // Преобразуем данные PartsIndex в формат нашего меню
  const transformPartsIndexToTabData = (catalogs: PartsIndexCatalog[]) => {
    console.log('🔄 Преобразуем каталоги PartsIndex:', catalogs.length, 'элементов');
    
    const transformed = catalogs.map(catalog => {
      const groupsCount = catalog.groups?.length || 0;
      console.log(`📝 Каталог: "${catalog.name}" (${groupsCount} групп)`);
      
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
      
      // Если подкатегорий нет, показываем название категории как указано в требованиях
      if (links.length === 0) {
        links = [catalog.name];
      }
      
      console.log(`🔗 Подкатегории для "${catalog.name}":`, links);
      
      return {
        label: catalog.name,
        heading: catalog.name,
        links: links.slice(0, 9), // Ограничиваем максимум 9 элементов
        catalogId: catalog.id // Сохраняем ID каталога для навигации
      };
    });
    
    console.log('✅ Преобразование завершено:', transformed.length, 'табов');
    return transformed;
  };

  // Функция для поиска иконки для категории
  const findCategoryIcon = (catalogId: string, navigationCategories: NavigationCategory[]): string | null => {
    console.log('🔍 Ищем иконку для catalogId:', catalogId);
    console.log('📋 Доступные навигационные категории:', navigationCategories);
    
    // Ищем навигационную категорию для данного каталога (без группы)
    const categoryIcon = navigationCategories.find(
      nav => nav.partsIndexCatalogId === catalogId && (!nav.partsIndexGroupId || nav.partsIndexGroupId === '')
    );
    
    console.log('🎯 Найденная категория:', categoryIcon);
    console.log('🖼️ Возвращаемая иконка:', categoryIcon?.icon || null);
    
    return categoryIcon?.icon || null;
  };

  const BottomHead = ({ menuOpen, onClose }: { menuOpen: boolean; onClose: () => void }) => {
    const isMobile = useIsMobile();
    const router = useRouter();
    const [mobileCategory, setMobileCategory] = useState<null | any>(null);
    const [tabData, setTabData] = useState(fallbackTabData);
    const [activeTabIndex, setActiveTabIndex] = useState(0);

    console.log('🔄 BottomHead render:', { 
      menuOpen, 
      tabDataLength: tabData.length, 
      activeTabIndex,
      isMobile 
    });

    // --- Overlay animation state ---
    const [showOverlay, setShowOverlay] = useState(false);
    useEffect(() => {
      if (menuOpen) {
        setShowOverlay(true);
      } else {
        // Ждём окончания transition перед удалением из DOM
        const timeout = setTimeout(() => setShowOverlay(false), 300);
        return () => clearTimeout(timeout);
      }
    }, [menuOpen]);
    // --- End overlay animation state ---

    // Получаем каталоги PartsIndex
    const { data: catalogsData, loading, error } = useQuery<PartsIndexCatalogsData, PartsIndexCatalogsVariables>(
      GET_PARTSINDEX_CATEGORIES,
      {
        variables: { 
          lang: 'ru'
        },
        errorPolicy: 'all',
        onCompleted: (data) => {
          console.log('🎉 Apollo Query onCompleted - данные получены:', data);
        },
        onError: (error) => {
          console.error('❌ Apollo Query onError:', error);
        }
      }
    );

    // Получаем навигационные категории с иконками
    const { data: navigationData, loading: navigationLoading, error: navigationError } = useQuery<{ navigationCategories: NavigationCategory[] }>(
      GET_NAVIGATION_CATEGORIES,
      {
        errorPolicy: 'all',
        onCompleted: (data) => {
          console.log('🎉 Навигационные категории получены:', data);
        },
        onError: (error) => {
          console.error('❌ Ошибка загрузки навигационных категорий:', error);
        }
      }
    );

    // Обновляем данные табов когда получаем данные от API
    useEffect(() => {
      if (catalogsData?.partsIndexCategoriesWithGroups && catalogsData.partsIndexCategoriesWithGroups.length > 0) {
        console.log('✅ Обновляем меню с данными PartsIndex:', catalogsData.partsIndexCategoriesWithGroups.length, 'каталогов');
        console.log('🔍 Первые 3 каталога:', catalogsData.partsIndexCategoriesWithGroups.slice(0, 3).map(catalog => ({
          name: catalog.name,
          id: catalog.id,
          groupsCount: catalog.groups?.length || 0,
          groups: catalog.groups?.slice(0, 3).map(group => group.name)
        })));
        
        const apiTabData = transformPartsIndexToTabData(catalogsData.partsIndexCategoriesWithGroups);
        setTabData(apiTabData);
        // Сбрасываем активный таб на первый при обновлении данных
        setActiveTabIndex(0);
      } else if (error) {
        console.warn('⚠️ Используем fallback данные из-за ошибки PartsIndex:', error);
        setTabData(fallbackTabData);
        setActiveTabIndex(0);
      }
    }, [catalogsData, error]);

    // Логирование для отладки
    useEffect(() => {
      if (loading) {
        console.log('🔄 Загружаем каталоги PartsIndex...');
      }
      if (error) {
        console.error('❌ Ошибка загрузки каталогов PartsIndex:', error);
      }
    }, [loading, error]);

    // Обработка клика по категории для перехода в каталог с товарами
    const handleCategoryClick = (catalogId: string, categoryName: string, entityId?: string) => {
      console.log('🔍 Клик по категории:', { catalogId, categoryName, entityId });
      
      // Закрываем меню
      onClose();
      
      // Переходим на страницу каталога с параметрами PartsIndex
      router.push({
        pathname: '/catalog',
        query: {
          partsIndexCatalog: catalogId,
          categoryName: encodeURIComponent(categoryName),
          ...(entityId && { partsIndexCategory: entityId })
        }
      });
    };

    // Только мобильный UX
    if (isMobile && menuOpen) {
      // Оверлей для мобильного меню
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
                {mobileCategory.links.length === 1 ? (
                  <div 
                    className="mobile-subcategory" 
                    onClick={() => {
                      let subcategoryId = `${mobileCategory.catalogId}_0`;
                      if (mobileCategory.groups) {
                        for (const group of mobileCategory.groups) {
                          if (group.subgroups && group.subgroups.length > 0) {
                            const foundSubgroup = group.subgroups.find((subgroup: any) => subgroup.name === mobileCategory.links[0]);
                            if (foundSubgroup) {
                              subcategoryId = foundSubgroup.id;
                              break;
                            }
                          } else if (group.name === mobileCategory.links[0]) {
                            subcategoryId = group.id;
                            break;
                          }
                        }
                      }
                      const catalogId = mobileCategory.catalogId || 'fallback';
                      handleCategoryClick(catalogId, mobileCategory.links[0], subcategoryId);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    Показать все
                  </div>
                ) : (
                  mobileCategory.links.map((link: string, linkIndex: number) => (
                    <div 
                      className="mobile-subcategory" 
                      key={link} 
                      onClick={() => {
                        let subcategoryId = `${mobileCategory.catalogId}_${linkIndex}`;
                        if (mobileCategory.groups) {
                          for (const group of mobileCategory.groups) {
                            if (group.subgroups && group.subgroups.length > 0) {
                              const foundSubgroup = group.subgroups.find((subgroup: any) => subgroup.name === link);
                              if (foundSubgroup) {
                                subcategoryId = foundSubgroup.id;
                                break;
                              }
                            } else if (group.name === link) {
                              subcategoryId = group.id;
                              break;
                            }
                          }
                        }
                        const catalogId = mobileCategory.catalogId || 'fallback';
                        handleCategoryClick(catalogId, link, subcategoryId);
                      }}
                    >
                      {link}
                    </div>
                  ))
                )}
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
                <span>Категории</span>
                {loading && <span className="text-sm text-gray-500 ml-2">(загрузка...)</span>}
              </div>
              <div className="mobile-subcategories" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {tabData.map((cat, index) => {
                  // Получаем ID каталога из данных PartsIndex или создаем fallback ID
                  const catalogId = catalogsData?.partsIndexCategoriesWithGroups?.[index]?.id || `fallback_${index}`;
                  const groups = catalogsData?.partsIndexCategoriesWithGroups?.[index]?.groups || [];
                  return (
                    <div
                      className="mobile-subcategory"
                      key={cat.label}
                      onClick={() => {
                        // Добавляем catalogId и groups для правильной обработки
                        const categoryWithData = {
                          ...cat,
                          catalogId,
                          groups
                        };
                        setMobileCategory(categoryWithData);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {cat.label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      );
    }

    // Десктоп: оставить всё как есть, но добавить оверлей
    return (
      <>
        {showOverlay && (
          <div
            className={`fixed inset-0 bg-black/7 z-40 transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
            aria-label="Закрыть меню"
          />
        )}
        {showOverlay && (
          <div
            className={`fixed inset-0 bg-black/7 z-1900 transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
            aria-label="Закрыть меню"
          />
        )}
        <nav
          role="navigation"
          className="nav-menu-3 w-nav-menu z-2000"
          style={{ display: menuOpen ? "block" : "none" }}
          onClick={e => e.stopPropagation()} // чтобы клик внутри меню не закрывал его
        >
          <div className="div-block-28">
            <div className="w-layout-hflex flex-block-90">
              <div className="w-layout-vflex flex-block-88" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                {/* Меню с иконками - показываем все категории из API */}
                {tabData.map((tab, idx) => {
                  // Получаем catalogId для поиска иконки
                  const catalogId = catalogsData?.partsIndexCategoriesWithGroups?.[idx]?.id || `fallback_${idx}`;
                  console.log(`🏷️ Обрабатываем категорию ${idx}: "${tab.label}" с catalogId: "${catalogId}"`);
                  const icon = navigationData?.navigationCategories ? findCategoryIcon(catalogId, navigationData.navigationCategories) : null;
                  console.log(`🎨 Для категории "${tab.label}" будет показана ${icon ? 'иконка: ' + icon : 'звездочка (fallback)'}`);
                  
                  return (
                    <a
                      href="#"
                      className={`link-block-7 w-inline-block${activeTabIndex === idx ? " w--current" : ""}`}
                      key={tab.label}
                      onClick={() => {
                        setActiveTabIndex(idx);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="div-block-29">
                        <div className="code-embed-12 w-embed">
                          {icon ? (
                            <img 
                              src={icon} 
                              alt={tab.label} 
                              width="21" 
                              height="20" 
                            />
                          ) : (
                            <svg 
                              width="21" 
                              height="20" 
                              viewBox="0 0 21 20" 
                              fill="none" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M10.3158 0.643914C10.4674 0.365938 10.8666 0.365938 11.0182 0.643914L14.0029 6.11673C14.0604 6.22222 14.1623 6.29626 14.2804 6.31838L20.4077 7.46581C20.7189 7.52409 20.8423 7.9037 20.6247 8.13378L16.3421 12.6636C16.2595 12.7509 16.2206 12.8707 16.2361 12.9899L17.0382 19.1718C17.079 19.4858 16.7561 19.7204 16.47 19.5847L10.8385 16.9114C10.73 16.8599 10.604 16.8599 10.4955 16.9114L4.86394 19.5847C4.5779 19.7204 4.25499 19.4858 4.29573 19.1718L5.0979 12.9899C5.11336 12.8707 5.07444 12.7509 4.99189 12.6636L0.709252 8.13378C0.491728 7.9037 0.615069 7.52409 0.926288 7.46581L7.05357 6.31838C7.17168 6.29626 7.27358 6.22222 7.33112 6.11673L10.3158 0.643914Z" fill="CurrentColor"></path>
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="text-block-47">{tab.label}</div>
                    </a>
                  );
                })}
              </div>
              {/* Правая часть меню с подкатегориями и картинками */}
              <div className="w-layout-vflex flex-block-89">
                <h3 className="heading-16">{tabData[activeTabIndex]?.heading || tabData[0].heading}{loading && <span className="text-sm text-gray-500 ml-2">(обновление...)</span>}</h3>
                <div className="w-layout-hflex flex-block-92">
                  <div className="w-layout-vflex flex-block-91">
                    {(tabData[activeTabIndex]?.links || tabData[0].links).map((link, linkIndex) => {
                      const activeCatalog = catalogsData?.partsIndexCategoriesWithGroups?.[activeTabIndex];
                      
                      // Ищем соответствующую подгруппу по названию
                      let subcategoryId = `fallback_${activeTabIndex}_${linkIndex}`;
                      
                      if (activeCatalog?.groups) {
                        for (const group of activeCatalog.groups) {
                          // Проверяем в подгруппах
                          if (group.subgroups && group.subgroups.length > 0) {
                            const foundSubgroup = group.subgroups.find((subgroup: any) => subgroup.name === link);
                            if (foundSubgroup) {
                              subcategoryId = foundSubgroup.id;
                              break;
                            }
                          }
                          // Если нет подгрупп, проверяем саму группу
                          else if (group.name === link) {
                            subcategoryId = group.id;
                            break;
                          }
                        }
                      }
                      
                      return (
                        <div
                          className="link-2"
                          key={link}
                          onClick={() => {
                            const catalogId = activeCatalog?.id || 'fallback';
                            handleCategoryClick(catalogId, link, subcategoryId);
                          }}
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
            <div data-current="Tab 1" data-easing="ease" data-duration-in="300" data-duration-out="100" className="tabs w-tabs">
              <div className="tabs-menu w-tab-menu" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {tabData.map((tab, idx) => (
                  <a
                    key={tab.label}
                    data-w-tab={`Tab ${idx + 1}`}
                    className={`tab-link w-inline-block w-tab-link${activeTabIndex === idx ? " w--current" : ""}`}
                    onClick={() => {
                      setActiveTabIndex(idx);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="div-block-29">
                      <div className="code-embed-12 w-embed">
                        <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10.3158 0.643914C10.4674 0.365938 10.8666 0.365938 11.0182 0.643914L14.0029 6.11673C14.0604 6.22222 14.1623 6.29626 14.2804 6.31838L20.4077 7.46581C20.7189 7.52409 20.8423 7.9037 20.6247 8.13378L16.3421 12.6636C16.2595 12.7509 16.2206 12.8707 16.2361 12.9899L17.0382 19.1718C17.079 19.4858 16.7561 19.7204 16.47 19.5847L10.8385 16.9114C10.73 16.8599 10.604 16.8599 10.4955 16.9114L4.86394 19.5847C4.5779 19.7204 4.25499 19.4858 4.29573 19.1718L5.0979 12.9899C5.11336 12.8707 5.07444 12.7509 4.99189 12.6636L0.709252 8.13378C0.491728 7.9037 0.615069 7.52409 0.926288 7.46581L7.05357 6.31838C7.17168 6.29626 7.27358 6.22222 7.33112 6.11673L10.3158 0.643914Z" fill="CurrentColor"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="text-block-49">{tab.label}</div>
                  </a>
                ))}
              </div>
              <div className="tabs-content w-tab-content">
                {tabData.map((tab, idx) => (
                  <div
                    key={tab.label}
                    data-w-tab={`Tab ${idx + 1}`}
                    className={`tab-pane w-tab-pane${activeTabIndex === idx ? " w--tab-active" : ""}`}
                    style={{ display: activeTabIndex === idx ? "block" : "none" }}
                  >
                    <div className="w-layout-vflex flex-block-89">
                      <h3 className="heading-16">{tab.heading}</h3>
                      <div className="w-layout-hflex flex-block-92">
                        <div className="w-layout-vflex flex-block-91">
                          {tab.links.length === 1 ? (
                            <div
                              className="link-2"
                              onClick={() => {
                                const catalog = catalogsData?.partsIndexCategoriesWithGroups?.[idx];
                                let subcategoryId = `fallback_${idx}_0`;
                                if (catalog?.groups) {
                                  for (const group of catalog.groups) {
                                    if (group.subgroups && group.subgroups.length > 0) {
                                      const foundSubgroup = group.subgroups.find((subgroup: any) => subgroup.name === tab.links[0]);
                                      if (foundSubgroup) {
                                        subcategoryId = foundSubgroup.id;
                                        break;
                                      }
                                    } else if (group.name === tab.links[0]) {
                                      subcategoryId = group.id;
                                      break;
                                    }
                                  }
                                }
                                const catalogId = catalog?.id || 'fallback';
                                handleCategoryClick(catalogId, tab.links[0], subcategoryId);
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              Показать все
                            </div>
                          ) : (
                            tab.links.map((link: string, linkIndex: number) => {
                              const catalog = catalogsData?.partsIndexCategoriesWithGroups?.[idx];
                              let subcategoryId = `fallback_${idx}_${linkIndex}`;
                              if (catalog?.groups) {
                                for (const group of catalog.groups) {
                                  if (group.subgroups && group.subgroups.length > 0) {
                                    const foundSubgroup = group.subgroups.find((subgroup: any) => subgroup.name === link);
                                    if (foundSubgroup) {
                                      subcategoryId = foundSubgroup.id;
                                      break;
                                    }
                                  } else if (group.name === link) {
                                    subcategoryId = group.id;
                                    break;
                                  }
                                }
                              }
                              return (
                                <div
                                  className="link-2"
                                  key={link}
                                  onClick={() => {
                                    const catalogId = catalog?.id || 'fallback';
                                    handleCategoryClick(catalogId, link, subcategoryId);
                                  }}
                                  style={{ cursor: "pointer" }}
                                >
                                  {link}
                                </div>
                              );
                            })
                          )}
                        </div>
                        <div className="w-layout-vflex flex-block-91-copy">
                          <img src="https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg" loading="lazy" alt="" className="image-17" />
                          <img src="https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg" loading="lazy" alt="" className="image-17" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </>
    );
  };

  export default BottomHead; 