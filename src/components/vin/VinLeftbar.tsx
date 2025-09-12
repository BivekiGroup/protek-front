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
  // 1. Удаляем все, что связано с executeFulltextSearch, fulltextQuery, handleFulltextSearch, useLazyQuery(GET_LAXIMO_FULLTEXT_SEARCH), и onSearchResults для поиска
  // 2. Используем только searchQuery и setSearchQuery для фильтрации
  // 3. Добавляем функцию фильтрации дерева

  const filterTree = (tree: any[], query: string, getName: (n: any) => string = (n: any) => n.name, getChildren: (n: any) => any[] = (n: any) => n.children) => {
    if (!query.trim()) return tree;
    const lowerQuery = query.trim().toLowerCase();
    const filterFn = (node: any): any | null => {
      const nameMatch = getName(node)?.toLowerCase().includes(lowerQuery);
      const children = getChildren(node) || [];
      const filteredChildren = children.map(filterFn).filter(Boolean);
      if (nameMatch || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
      return null;
    };
    return tree.map(filterFn).filter(Boolean);
  };

  // Функция для подсветки совпавшего текста
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span style={{ fontWeight: 600, color: '#222' }}>{text.slice(idx, idx + query.length)}</span>
        {text.slice(idx + query.length)}
      </>
    );
  };

  // Универсальный renderTree для поиска с поддержкой передачи пути
  const renderTree = (nodes: any[], path: string[] = [], level = 0): React.ReactNode => nodes.map((node: any) => {
    const id = node.quickgroupid || node.categoryid || node.id;
    const hasChildren = node.children && node.children.length > 0;
    const currentPath = [...path, id];
    return (
      <a
        href="#"
        key={id}
        className="dropdown-link-3 w-dropdown-link"
        onClick={e => {
          e.preventDefault();
          // Для quickGroups: если есть link, вызываем onQuickGroupSelect, иначе onNodeSelect
          if (typeof node.link !== 'undefined' && node.link && onQuickGroupSelect) {
            onQuickGroupSelect(node);
          } else if (onNodeSelect) {
            // Для onNodeSelect всегда передаем unitid и name
            const nodeToSelect = {
              ...node,
              unitid: node.unitid || node.quickgroupid || node.categoryid || node.id,
              name: node.name,
            };
            onNodeSelect(nodeToSelect);
          }
          setSearchQuery('');
          setOpenedPath(currentPath);
        }}
        style={{
          fontWeight: hasChildren ? 500 : undefined,
          paddingLeft: level > 0 ? 16 * level : undefined,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {hasChildren && (
          <span style={{ display: 'inline-block', marginRight: 6, width: 12 }}>
            <svg width="10" height="10" viewBox="0 0 20 20" fill="none" style={{ verticalAlign: 'middle' }}>
              <path d="M6 8l4 4 4-4" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
        {highlightMatch(node.name, searchQuery)}
      </a>
    );
  });

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
      {/* === Форма поиска === */}
      <div className="div-block-2">
        <div className="form-block w-form">
          <form id="vin-form-search" name="vin-form-search" data-name="vin-form-search" action="#" method="post" className="form" onSubmit={e => { e.preventDefault(); }}>
            <a href="#" className="link-block-3 w-inline-block" onClick={e => { e.preventDefault(); }}>
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
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
          </form>
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
          quickGroupsLoading ? (
            <div style={{ padding: 16, textAlign: 'center' }}>Загружаем группы быстрого поиска...</div>
          ) : quickGroupsError ? (
            <div style={{ color: 'red', padding: 16 }}>Ошибка загрузки групп: {quickGroupsError.message}</div>
          ) : (
            <>
              {(() => {
                if (searchQuery) {
                  const filtered = filterTree(quickGroups, searchQuery);
                  if (filtered.length === 0) {
                    return <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>Ничего не найдено</div>;
                  }
                  // Рекурсивный рендер с раскрытием всех веток
                  const renderTree = (nodes: any[], path: string[] = [], level = 0): React.ReactNode => nodes.map((group: any) => {
                    const hasChildren = group.children && group.children.length > 0;
                    const currentPath = [...path, group.quickgroupid];
                    return hasChildren ? (
                      <div
                        key={group.quickgroupid}
                        data-hover="false"
                        data-delay="0"
                        className={`dropdown-4 w-dropdown w--open`}
                      >
                        <div
                          className={`dropdown-toggle-3 w-dropdown-toggle w--open active`}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="w-icon-dropdown-toggle"></div>
                          <div className="text-block-56">{highlightMatch(group.name, searchQuery)}</div>
                        </div>
                        <nav className={`dropdown-list-4 w-dropdown-list w--open`}>
                          {renderTree(group.children, currentPath, level + 1)}
                        </nav>
                      </div>
                    ) : (
                      <a
                        href="#"
                        key={group.quickgroupid}
                        className="dropdown-link-3 w-dropdown-link"
                        onClick={(e) => {
                          e.preventDefault();
                          if (group.link && onQuickGroupSelect) {
                            onQuickGroupSelect(group);
                          }
                        }}
                      >
                        {highlightMatch(group.name, searchQuery)}
                      </a>
                    );
                  });
                  return renderTree(filtered);
                } else {
                  // Обычный рендер с openedPath (старое поведение)
                  return quickGroups.map((group: any) => {
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
                          {group.children?.map((child: any) => {
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
                                  {child.children?.map((subChild: any) => (
                                    <a
                                      href="#"
                                      key={subChild.quickgroupid}
                                      className="dropdown-link-3 w-dropdown-link"
                                      onClick={(e) => {
                                        e.preventDefault();
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
                  });
                }
              })()}
            </>
          )
        ) : (
          categoriesLoading ? (
            <div style={{ padding: 16, textAlign: 'center' }}>Загружаем категории...</div>
          ) : categoriesError ? (
            <div style={{ color: 'red', padding: 16 }}>Ошибка загрузки категорий: {categoriesError.message}</div>
          ) : (
            <>
              {(() => {
                if (searchQuery) {
                  const filtered = filterTree(categories, searchQuery);
                  if (filtered.length === 0) {
                    return <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>Ничего не найдено</div>;
                  }
                  const renderTree = (nodes: any[], path: string[] = [], level = 0): React.ReactNode => nodes.map((category: any) => {
                    const categoryId = category.quickgroupid || category.categoryid || category.id;
                    const subcategories = category.children && category.children.length > 0
                      ? category.children
                      : unitsByCategory[categoryId] || [];
                    const hasChildren = subcategories.length > 0;
                    const currentPath = [...path, categoryId];
                    return hasChildren ? (
                      <div
                        key={categoryId}
                        data-hover="false"
                        data-delay="0"
                        className={`dropdown-4 w-dropdown w--open`}
                      >
                        <div
                          className={`dropdown-toggle-3 w-dropdown-toggle w--open`}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="w-icon-dropdown-toggle"></div>
                          <div className="text-block-56">{highlightMatch(category.name, searchQuery)}</div>
                        </div>
                        <nav className={`dropdown-list-4 w-dropdown-list w--open`}>
                          {renderTree(subcategories, currentPath, level + 1)}
                        </nav>
                      </div>
                    ) : (
                      <a
                        href="#"
                        key={categoryId}
                        className="dropdown-link-3 w-dropdown-link pl-0"
                        onClick={e => {
                          e.preventDefault();
                          if (onNodeSelect) {
                            const nodeToSelect = {
                              ...category,
                              unitid: category.unitid || category.quickgroupid || category.id
                            };
                            onNodeSelect(nodeToSelect);
                          }
                        }}
                      >
                        {highlightMatch(category.name, searchQuery)}
                      </a>
                    );
                  });
                  return renderTree(filtered);
                } else {
                  return categories.map((category: any, idx: number) => {
                    const categoryId = category.quickgroupid || category.categoryid || category.id;
                    const isOpen = openedPath.includes(categoryId);
                    const subcategories = category.children && category.children.length > 0
                      ? category.children
                      : unitsByCategory[categoryId] || [];
                    const hasChildren = subcategories.length > 0;
                    return hasChildren ? (
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
                                  if (onNodeSelect) {
                                    const nodeToSelect = {
                                      ...subcat,
                                      unitid: subcat.unitid || subcat.quickgroupid || subcat.id
                                    };
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
                    ) : (
                      <a
                        href="#"
                        key={categoryId}
                        className="dropdown-link-3 w-dropdown-link pl-0"
                        onClick={e => {
                          e.preventDefault();
                          if (onNodeSelect) {
                            const nodeToSelect = {
                              ...category,
                              unitid: category.unitid || category.quickgroupid || category.id
                            };
                            onNodeSelect(nodeToSelect);
                          }
                        }}
                      >
                        {category.name}
                      </a>
                    );
                  });
                }
              })()}
            </>
          )
        )}
        {/* Tab content end */}
      </div>
    </div>
  );
};

export default VinLeftbar; 