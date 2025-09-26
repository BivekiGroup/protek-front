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
  const setOpenedPathAndUrl = (newPath: string[], options: { closeQuickGroup?: boolean } = {}) => {
    const { closeQuickGroup = true } = options;
    setOpenedPath(newPath);
    if (closeQuickGroup && onCloseQuickGroup) onCloseQuickGroup();
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

  type TreeMode = 'manufacturer' | 'quickGroups';

  const renderCategoryTree = (
    nodes: any[],
    options: { path?: string[]; level?: number; searchMode?: boolean; mode?: TreeMode } = {}
  ): React.ReactNode => {
    if (!nodes || nodes.length === 0) return null;

    const { path = [], level = 0, searchMode = false, mode = 'manufacturer' } = options;

    return (
      <ul className={`vin-tree${level === 0 ? ' vin-tree--root' : ''}`}>
        {nodes.map((category: any) => {
          const categoryId = category.quickgroupid || category.categoryid || category.id;
          const currentPath = [...path, categoryId];
          const childrenFromData = mode === 'manufacturer'
            ? (category.children && category.children.length > 0
                ? category.children
                : unitsByCategory[categoryId] || [])
            : (category.children || []);
          const hasChildren = childrenFromData.length > 0;
          const isOpen = searchMode ? true : openedPath[level] === categoryId;
          const isActive = searchMode ? false : openedPath.includes(categoryId);
          const isCurrentLevelActive = !searchMode && openedPath[level] === categoryId;
          const labelContent = searchMode ? highlightMatch(category.name, searchQuery) : category.name;

          const handleBranchToggle = (event: React.MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            if (searchMode) {
              setOpenedPathAndUrl(currentPath, { closeQuickGroup: mode !== 'quickGroups' });
              return;
            }
            if (mode === 'manufacturer') {
              handleToggle(categoryId, level);
            } else {
              handleQuickGroupToggle(categoryId, level);
            }
          };

          const handleLabelActivate = (event: React.MouseEvent<HTMLButtonElement>) => {
            if (event) {
              event.preventDefault();
              event.stopPropagation();
            }
            if (hasChildren) {
              if (searchMode) {
                setOpenedPathAndUrl(currentPath, { closeQuickGroup: mode !== 'quickGroups' });
              } else {
                if (mode === 'manufacturer') {
                  handleToggle(categoryId, level);
                } else {
                  handleQuickGroupToggle(categoryId, level);
                }
              }
            } else if (mode === 'quickGroups') {
              if (typeof category.link !== 'undefined' && category.link && onQuickGroupSelect) {
                onQuickGroupSelect(category);
                setOpenedPathAndUrl(currentPath, { closeQuickGroup: false });
                setSearchQuery('');
              } else if (!searchMode) {
                setOpenedPathAndUrl(currentPath, { closeQuickGroup: false });
              }
            } else if (onNodeSelect) {
              const nodeToSelect = {
                ...category,
                unitid: category.unitid || category.quickgroupid || category.categoryid || category.id
              };
              onNodeSelect(nodeToSelect);
              setOpenedPathAndUrl(currentPath);
            }
          };

          return (
            <li
              key={categoryId}
              className={`vin-tree__item${hasChildren ? ' vin-tree__item--branch' : ' vin-tree__item--leaf'}${isActive ? ' vin-tree__item--active' : ''}`}
            >
              <div className={`vin-tree__row${level > 0 ? ' vin-tree__row--child' : ''}${isCurrentLevelActive ? ' vin-tree__row--active' : ''}`}>
                {hasChildren ? (
                  <button
                    type="button"
                    className={`vin-tree__toggle${isOpen ? ' vin-tree__toggle--open' : ''}`}
                    onClick={handleBranchToggle}
                    aria-expanded={isOpen}
                    aria-label={isOpen ? 'Свернуть категорию' : 'Развернуть категорию'}
                  >
                    <svg className="vin-tree__chevron" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M4.5 2.5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : (
                  <span className="vin-tree__toggle vin-tree__toggle--placeholder" />
                )}
                <button
                  type="button"
                  className={`vin-tree__label-button${hasChildren ? ' vin-tree__label-button--branch' : ''}${isCurrentLevelActive ? ' vin-tree__label-button--active' : ''}`}
                  onClick={handleLabelActivate}
                >
                  <span className={`vin-tree__label${isActive ? ' vin-tree__label--active' : ''}`}>
                    {labelContent}
                  </span>
                </button>
              </div>
              {hasChildren && isOpen && (
                <div className="vin-tree__children">
                  {renderCategoryTree(childrenFromData, { path: currentPath, level: level + 1, searchMode, mode })}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

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
                  return (
                    <div className="vin-tree-wrapper">
                      {renderCategoryTree(filtered, { searchMode: true, mode: 'quickGroups' })}
                    </div>
                  );
                } else {
                  if (!quickGroups || quickGroups.length === 0) {
                    return <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>Группы отсутствуют</div>;
                  }
                  return (
                    <div className="vin-tree-wrapper">
                      {renderCategoryTree(quickGroups, { mode: 'quickGroups' })}
                    </div>
                  );
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
                  return (
                    <div className="vin-tree-wrapper">
                      {renderCategoryTree(filtered, { searchMode: true })}
                    </div>
                  );
                } else {
                  if (!categories || categories.length === 0) {
                    return <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>Категории отсутствуют</div>;
                  }
                  return (
                    <div className="vin-tree-wrapper">
                      {renderCategoryTree(categories)}
                    </div>
                  );
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
