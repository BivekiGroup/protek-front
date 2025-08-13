import React, { useState, useEffect } from "react";
import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_LAXIMO_FULLTEXT_SEARCH, GET_LAXIMO_CATEGORIES, GET_LAXIMO_UNITS, GET_LAXIMO_QUICK_GROUPS, GET_LAXIMO_QUICK_DETAIL } from '@/lib/graphql/laximo';
import { useRouter } from 'next/router';

interface VinLeftbarProps {
  vehicleInfo?: {
    catalog: string;
    vehicleid: string;
    ssd: string;
    [key: string]: any;
  };
  onSearchResults?: (data: {
    results: any[];
    loading: boolean;
    error: any;
    query: string;
    isSearching?: boolean;
  }) => void;
  onNodeSelect?: (node: any) => void;
  onActiveTabChange?: (tab: 'uzly' | 'manufacturer') => void;
  onQuickGroupSelect?: (group: any) => void;
  activeTab?: 'uzly' | 'manufacturer';
  openedPath?: string[];
  setOpenedPath?: (path: string[]) => void;
  onCloseQuickGroup?: () => void;
}

interface QuickGroup {
  quickgroupid: string;
  name: string;
  link?: boolean;
  children?: QuickGroup[];
}

const VinLeftbar: React.FC<VinLeftbarProps> = ({ vehicleInfo, onSearchResults, onNodeSelect, onActiveTabChange, onQuickGroupSelect, activeTab: activeTabProp, openedPath = [], setOpenedPath = () => {}, onCloseQuickGroup }) => {
  const router = useRouter();
  const catalogCode = vehicleInfo?.catalog || '';
  const vehicleId = vehicleInfo?.vehicleid || '';
  const ssd = vehicleInfo?.ssd || '';
  const [searchQuery, setSearchQuery] = useState('');
  const [executeSearch, { data, loading, error }] = useLazyQuery(GET_LAXIMO_FULLTEXT_SEARCH, { errorPolicy: 'all' });

  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useQuery(GET_LAXIMO_CATEGORIES, {
    variables: { catalogCode, vehicleId, ssd },
    skip: !catalogCode || vehicleId === undefined || vehicleId === null,
    errorPolicy: 'all'
  });
  const categories = categoriesData?.laximoCategories || [];

  const [unitsByCategory, setUnitsByCategory] = useState<{ [key: string]: any[] }>({});
  const [getUnits] = useLazyQuery(GET_LAXIMO_UNITS, {
    onCompleted: (data) => {
      if (data && data.laximoUnits && lastCategoryIdRef.current) {
        setUnitsByCategory(prev => ({
          ...prev,
          [lastCategoryIdRef.current!]: data.laximoUnits || []
        }));
      }
    }
  });

  const lastCategoryIdRef = React.useRef<string | null>(null);

  // --- Синхронизация openedPath с URL ---
  // Обновляем openedPath и URL
  const setOpenedPathAndUrl = (newPath: string[]) => {
    setOpenedPath(newPath);
    if (onCloseQuickGroup) onCloseQuickGroup();
    const params = new URLSearchParams(router.query as any);
    if (newPath.length > 0) {
      params.set('catpath', newPath.join(','));
    } else {
      params.delete('catpath');
    }
    router.push(
      { pathname: router.pathname, query: { ...router.query, catpath: newPath.join(',') } },
      undefined,
      { shallow: true }
    );
  };

  // Восстанавливаем openedPath из URL
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const catpath = (router.query.catpath as string) || '';
    if (catpath) {
      setOpenedPath(catpath.split(',').filter(Boolean));
    } else {
      setOpenedPath([]);
    }
  }, [router.query.catpath]);

  const handleToggle = (categoryId: string, level: number) => {
    console.log('🔄 VinLeftbar: handleToggle вызван для categoryId:', categoryId, 'level:', level, 'текущий openedPath:', openedPath);
    
    if (openedPath[level] === categoryId) {
      const newPath = openedPath.slice(0, level);
      console.log('🔄 VinLeftbar: Закрываем категорию, новый path:', newPath);
      setOpenedPathAndUrl(newPath);
    } else {
      const newPath = [...openedPath.slice(0, level), categoryId];
      console.log('🔄 VinLeftbar: Открываем категорию, новый path:', newPath);
      setOpenedPathAndUrl(newPath);
      
      // Загружаем units для категории, если они еще не загружены
      if (activeTabProp === 'manufacturer' && !unitsByCategory[categoryId]) {
        console.log('🔄 VinLeftbar: Загружаем units для categoryId:', categoryId);
        lastCategoryIdRef.current = categoryId;
        getUnits({
          variables: {
            catalogCode,
            vehicleId,
            ssd,
            categoryId
          }
        });
      }
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    if (!ssd || ssd.trim() === '') {
      console.error('SSD обязателен для поиска по названию');
      return;
    }
    executeSearch({
      variables: {
        catalogCode,
        vehicleId,
        searchQuery: searchQuery.trim(),
        ssd
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const searchResults = data?.laximoFulltextSearch;

  useEffect(() => {
    if (onSearchResults) {
      onSearchResults({
        results: searchResults?.details || [],
        loading: loading,
        error: error,
        query: searchQuery
      });
    }
  }, [searchResults, loading, error, searchQuery]);

  // --- Новый блок: вычисляем доступность поиска ---
  const isSearchAvailable = !!catalogCode && vehicleId !== undefined && vehicleId !== null && !!ssd && ssd.trim() !== '';
  const showWarning = !isSearchAvailable;
  const showError = !!error && isSearchAvailable && searchQuery.trim();
  const showNotFound = isSearchAvailable && searchQuery.trim() && !loading && data && searchResults && searchResults.details && searchResults.details.length === 0;
  const showTips = isSearchAvailable && !searchQuery.trim() && !loading;

  // --- QuickGroups (от производителя) ---
  const { data: quickGroupsData, loading: quickGroupsLoading, error: quickGroupsError } = useQuery(GET_LAXIMO_QUICK_GROUPS, {
    variables: { catalogCode, vehicleId, ssd },
    skip: !catalogCode || vehicleId === undefined || vehicleId === null,
    errorPolicy: 'all'
  });
  const quickGroups = quickGroupsData?.laximoQuickGroups || [];

  const handleQuickGroupToggle = (groupId: string, level: number) => {
    if (openedPath[level] === groupId) {
      setOpenedPathAndUrl(openedPath.slice(0, level));
    } else {
      setOpenedPathAndUrl([...openedPath.slice(0, level), groupId]);
    }
  };

  // === Полнотекстовый поиск деталей (аналогично FulltextSearchSection) ===
  const [fulltextQuery, setFulltextQuery] = useState('');
  const [executeFulltextSearch, { data: fulltextData, loading: fulltextLoading, error: fulltextError }] = useLazyQuery(GET_LAXIMO_FULLTEXT_SEARCH, { errorPolicy: 'all' });

  const handleFulltextSearch = () => {
    if (!fulltextQuery.trim()) {
      if (onSearchResults) {
        onSearchResults({
          results: [],
          loading: false,
          error: null,
          query: '',
          isSearching: false
        });
      }
      return;
    }
    if (!ssd || ssd.trim() === '') {
      console.error('SSD обязателен для поиска по названию');
      return;
    }
    // Отправляем начальное состояние поиска родителю
    if (onSearchResults) {
      onSearchResults({
        results: [],
        loading: true,
        error: null,
        query: fulltextQuery.trim(),
        isSearching: true
      });
    }
    executeFulltextSearch({
      variables: {
        catalogCode,
        vehicleId,
        searchQuery: fulltextQuery.trim(),
        ssd
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setFulltextQuery(newValue);
  };

  useEffect(() => {
    if (onSearchResults && (fulltextData || fulltextLoading || fulltextError)) {
      onSearchResults({
        results: fulltextData?.laximoFulltextSearch?.details || [],
        loading: fulltextLoading,
        error: fulltextError,
        query: fulltextQuery,
        isSearching: true
      });
    }
  }, [fulltextData, fulltextLoading, fulltextError, fulltextQuery]);

  const handleFulltextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFulltextSearch();
    }
  };

  const fulltextResults = fulltextData?.laximoFulltextSearch?.details || [];

  // Если нет данных о транспортном средстве, показываем заглушку
  if (!vehicleInfo) {
    return (
      <div className="w-layout-vflex vinleftbar">
        <div className="text-center py-8 text-gray-500">
          <div className="text-lg font-medium mb-2">Поиск запчастей</div>
          <div className="text-sm">Выберите автомобиль для поиска запчастей</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-layout-vflex vinleftbar">
      {/* === Форма полнотекстового поиска === */}
      <div className="div-block-2">
        <div className="form-block w-form">
          <form id="vin-form-search" name="vin-form-search" data-name="vin-form-search" action="#" method="post" className="form" onSubmit={e => { e.preventDefault(); handleFulltextSearch(); }}>
            <a href="#" className="link-block-3 w-inline-block" onClick={e => { e.preventDefault(); handleFulltextSearch(); }}>
              <div className="code-embed-6 w-embed">
                {/* SVG */}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.5 17.5L13.8834 13.8833" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
            </a>
            <input
              className="text-field w-input"
              maxLength={256}
              name="VinSearch"
              data-name="VinSearch"
              placeholder="Поиск по названию детали"
              type="text"
              id="VinSearchInput"
              required
              value={fulltextQuery}
              onChange={handleInputChange}
              onKeyDown={handleFulltextKeyDown}
              disabled={fulltextLoading}
            />
          </form>
          {(!ssd || ssd.trim() === '') && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex">
                <svg className="h-5 w-5 text-yellow-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Полнотекстовый поиск недоступен
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Для поиска по названию деталей необходимо сначала выбрать конкретный автомобиль через поиск по VIN или мастер подбора.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="w-layout-vflex flex-block-113">
        <div className="w-layout-hflex flex-block-114">
          <a
            href="#"
            className={
              searchQuery
                ? 'button-23 w-button'
                : activeTabProp === 'uzly'
                  ? 'button-3 w-button'
                  : 'button-23 w-button'
            }
            onClick={e => {
              e.preventDefault();
              if (searchQuery) setSearchQuery('');
              if (onActiveTabChange) onActiveTabChange('uzly');
              if (onQuickGroupSelect) onQuickGroupSelect(null);
              if (onCloseQuickGroup) onCloseQuickGroup();
            }}
          >
            Узлы
          </a>
          <a
            href="#"
            className={
              searchQuery
                ? 'button-23 w-button'
                : activeTabProp === 'manufacturer'
                  ? 'button-3 w-button'
                  : 'button-23 w-button'
            }
            onClick={e => {
              e.preventDefault();
              if (searchQuery) setSearchQuery('');
              if (onActiveTabChange) onActiveTabChange('manufacturer');
              if (onQuickGroupSelect) onQuickGroupSelect(null);
              if (onCloseQuickGroup) onCloseQuickGroup();
            }}
          >
            От производителя
          </a>
        </div>
        {/* Tab content start */}
        {activeTabProp === 'uzly' ? (
          // Общие (QuickGroups - бывшие "От производителя")
          quickGroupsLoading ? (
            <div style={{ padding: 16, textAlign: 'center' }}>Загружаем группы быстрого поиска...</div>
          ) : quickGroupsError ? (
            <div style={{ color: 'red', padding: 16 }}>Ошибка загрузки групп: {quickGroupsError.message}</div>
          ) : (
            <>
              {(quickGroups as QuickGroup[]).map((group: QuickGroup) => {
                const hasChildren = group.children && group.children.length > 0;
                const isOpen = openedPath.includes(group.quickgroupid);

                if (!hasChildren) {
                  return (
                    <a
                      href="#"
                      key={group.quickgroupid}
                      className="dropdown-link-3 w-dropdown-link"
                      onClick={(e) => {
                        e.preventDefault();
                        // Если это конечная группа с link=true, открываем QuickGroup
                        if (group.link && onQuickGroupSelect) {
                          onQuickGroupSelect(group);
                        } else {
                          handleQuickGroupToggle(group.quickgroupid, 0);
                        }
                      }}
                    >
                      {group.name}
                    </a>
                  );
                }

                return (
                  <div
                    key={group.quickgroupid}
                    data-hover="false"
                    data-delay="0"
                    className={`dropdown-4 w-dropdown${isOpen ? " w--open" : ""}`}
                  >
                    <div
                      className={`dropdown-toggle-3 w-dropdown-toggle${isOpen ? " w--open active" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleQuickGroupToggle(group.quickgroupid, 0);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="w-icon-dropdown-toggle"></div>
                      <div className="text-block-56">{group.name}</div>
                    </div>
                    <nav className={`dropdown-list-4 w-dropdown-list${isOpen ? " w--open" : ""}`}>
                      {group.children?.map((child: QuickGroup) => {
                        const hasSubChildren = child.children && child.children.length > 0;
                        const isChildOpen = openedPath.includes(child.quickgroupid);

                        if (!hasSubChildren) {
                          return (
                            <a
                              href="#"
                              key={child.quickgroupid}
                              className="dropdown-link-3 w-dropdown-link"
                              onClick={(e) => {
                                e.preventDefault();
                                // Если это конечная группа с link=true, открываем QuickGroup
                                if (child.link && onQuickGroupSelect) {
                                  onQuickGroupSelect(child);
                                } else {
                                  handleQuickGroupToggle(child.quickgroupid, 1);
                                }
                              }}
                            >
                              {child.name}
                            </a>
                          );
                        }

                        return (
                          <div
                            key={child.quickgroupid}
                            data-hover="false"
                            data-delay="0"
                            className={`dropdown-4 w-dropdown pl-0${isChildOpen ? " w--open" : ""}`}
                          >
                            <div
                              className={`dropdown-toggle-card w-dropdown-toggle pl-0${isChildOpen ? " w--open active" : ""}`}
                              onClick={(e) => {
                                e.preventDefault();
                                handleQuickGroupToggle(child.quickgroupid, 2);
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              <div className="w-icon-dropdown-toggle"></div>
                              <div className="text-block-56">{child.name}</div>
                            </div>
                            <nav className={`dropdown-list-4 w-dropdown-list pl-0${isChildOpen ? " w--open" : ""}`}>
                              {child.children?.map((subChild: QuickGroup) => (
                                <a
                                  href="#"
                                  key={subChild.quickgroupid}
                                  className="dropdown-link-3 w-dropdown-link"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    // Если это конечная группа с link=true, открываем QuickGroup
                                    if (subChild.link && onQuickGroupSelect) {
                                      onQuickGroupSelect(subChild);
                                    } else {
                                      handleQuickGroupToggle(subChild.quickgroupid, 3);
                                    }
                                  }}
                                >
                                  {subChild.name}
                                </a>
                              ))}
                            </nav>
                          </div>
                        );
                      })}
                    </nav>
                  </div>
                );
              })}


            </>
          )
        ) : (
          // От производителя (Categories - узлы)
          categoriesLoading ? (
            <div style={{ padding: 16, textAlign: 'center' }}>Загружаем категории...</div>
          ) : categoriesError ? (
            <div style={{ color: 'red', padding: 16 }}>Ошибка загрузки категорий: {categoriesError.message}</div>
          ) : (
            <>
              {categories.map((category: any, idx: number) => {
                // ИСПРАВЛЕНИЕ: Используем тот же приоритет ID, что и в VinCategory
                const categoryId = category.quickgroupid || category.categoryid || category.id;
                const isOpen = openedPath.includes(categoryId);
                const subcategories = category.children && category.children.length > 0
                  ? category.children
                  : unitsByCategory[categoryId] || [];
                return (
                  <div
                    key={categoryId}
                    data-hover="false"
                    data-delay="0"
                    className={`dropdown-4 w-dropdown${isOpen ? " w--open" : ""}`}
                  >
                    <div
                      className={`dropdown-toggle-3 w-dropdown-toggle${isOpen ? " w--open" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleToggle(categoryId, 0);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="w-icon-dropdown-toggle"></div>
                      <div className="text-block-56">{category.name}</div>
                    </div>
                    <nav className={`dropdown-list-4 w-dropdown-list${isOpen ? " w--open" : ""}`}>
                      {subcategories.length > 0 ? (
                        subcategories.map((subcat: any) => (
                          <a
                            href="#"
                            key={subcat.quickgroupid || subcat.unitid}
                            className="dropdown-link-3 w-dropdown-link pl-0"
                            onClick={e => {
                              e.preventDefault();
                              // Для вкладки "От производителя" всегда открываем узел, не используем QuickGroup
                              if (onNodeSelect) {
                                const nodeToSelect = {
                                  ...subcat,
                                  unitid: subcat.unitid || subcat.quickgroupid || subcat.id
                                };
                                
                                // ОТЛАДКА: Логируем передачу узла
                                console.log('🔍 VinLeftbar передает узел:', {
                                  unitId: nodeToSelect.unitid,
                                  unitName: nodeToSelect.name,
                                  hasOriginalSsd: !!subcat.ssd,
                                  originalSsd: subcat.ssd ? `${subcat.ssd.substring(0, 50)}...` : 'отсутствует',
                                  finalSsd: nodeToSelect.ssd ? `${nodeToSelect.ssd.substring(0, 50)}...` : 'отсутствует'
                                });
                                
                                onNodeSelect(nodeToSelect);
                              }
                            }}
                          >
                            {subcat.name}
                          </a>
                        ))
                      ) : (
                        <span style={{ color: '#888', padding: 8 }}>Нет подкатегорий</span>
                      )}
                    </nav>
                  </div>
                );
              })}
            </>
          )
        )}
        {/* Tab content end */}
      </div>
    </div>
  );
};

export default VinLeftbar; 