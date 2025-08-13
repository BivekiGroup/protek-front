import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_LAXIMO_CATEGORIES, GET_LAXIMO_QUICK_GROUPS, GET_LAXIMO_UNITS } from '@/lib/graphql/laximo';
import { useRouter } from 'next/router';

interface VinCategoryProps {
  catalogCode?: string;
  vehicleId?: string;
  ssd?: string;
  onNodeSelect?: (node: any) => void;
  activeTab?: 'uzly' | 'manufacturer';
  onQuickGroupSelect?: (group: any) => void;
  onCategoryClick?: (e?: React.MouseEvent) => void;
  openedPath?: string[];
  setOpenedPath?: (path: string[]) => void;
}

const VinCategory: React.FC<VinCategoryProps> = ({ catalogCode, vehicleId, ssd, onNodeSelect, activeTab = 'uzly', onQuickGroupSelect, onCategoryClick, openedPath = [], setOpenedPath = () => {} }) => {
  const router = useRouter();
  const [unitsByCategory, setUnitsByCategory] = useState<{ [key: string]: any[] }>({});
  const lastCategoryIdRef = useRef<string | null>(null);

  // Запрос для "Общие" (QuickGroups)
  const { data: quickGroupsData, loading: quickGroupsLoading, error: quickGroupsError } = useQuery(GET_LAXIMO_QUICK_GROUPS, {
    variables: { catalogCode: catalogCode || '', vehicleId: vehicleId || '', ssd: ssd || '' },
    skip: !catalogCode || !vehicleId || activeTab !== 'uzly',
    errorPolicy: 'all'
  });

  // Запрос для "От производителя" (Categories)
  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useQuery(GET_LAXIMO_CATEGORIES, {
    variables: { catalogCode: catalogCode || '', vehicleId: vehicleId || '', ssd: ssd || '' },
    skip: !catalogCode || !vehicleId || activeTab !== 'manufacturer',
    errorPolicy: 'all'
  });

  // Запрос для получения units (подкатегорий) в режиме "От производителя"
  const [getUnits] = useLazyQuery(GET_LAXIMO_UNITS, {
    onCompleted: (data) => {
      if (data && data.laximoUnits && lastCategoryIdRef.current) {
        setUnitsByCategory(prev => ({
          ...prev,
          [lastCategoryIdRef.current!]: data.laximoUnits || []
        }));
      }
    },
    onError: (error) => {
      console.error('Error loading units:', error);
    }
  });

  // categories теперь зависят от activeTab
  let categories = activeTab === 'uzly' ? (quickGroupsData?.laximoQuickGroups || []) : (categoriesData?.laximoCategories || []);
  let selectedCategory: any = null;
  let currentLevel = 0;
  let currentList = categories;
  while (openedPath[currentLevel]) {
    const found = currentList.find((cat: any) => (cat.quickgroupid || cat.categoryid || cat.id) === openedPath[currentLevel]);
    if (!found) break;
    selectedCategory = found;
    currentList = found.children || [];
    currentLevel++;
  }

  const loading = activeTab === 'uzly' ? quickGroupsLoading : categoriesLoading;
  const error = activeTab === 'uzly' ? quickGroupsError : categoriesError;

  // Загружаем units для категории если нет children (аналогично VinLeftbar)
  useEffect(() => {
    if (selectedCategory && activeTab === 'manufacturer') {
      const categoryId = selectedCategory.categoryid || selectedCategory.quickgroupid || selectedCategory.id;
      
      // Если нет children и нет загруженных units - загружаем units
      if ((!selectedCategory.children || selectedCategory.children.length === 0) && 
          !unitsByCategory[categoryId]) {
        console.log('🔄 VinCategory: Загружаем units для категории', categoryId);
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
  }, [selectedCategory, activeTab, catalogCode, vehicleId, ssd, getUnits, unitsByCategory]);

  // Функция для обновления openedPath и catpath в URL
  const updatePath = (newPath: string[]) => {
    console.log('🔄 VinCategory: updatePath вызван с newPath:', newPath);
    setOpenedPath(newPath);
    if (router) {
      router.push(
        { pathname: router.pathname, query: { ...router.query, catpath: newPath.join(',') } },
        undefined,
        { shallow: true }
      );
    }
  };

  const handleBack = () => {
    updatePath(openedPath.slice(0, openedPath.length - 1));
  };

  const handleCategoryClick = (category: any, level: number) => {
    if (onCategoryClick) {
      onCategoryClick();
      return;
    }
    
    const categoryId = category.quickgroupid || category.categoryid || category.id;
    
    // Если это режим "От производителя", всегда пытаемся войти в категорию
    if (activeTab === 'manufacturer') {
      // Проверяем, открыта ли уже эта категория
      if (openedPath[level] === categoryId) {
        // Если уже открыта - закрываем
        updatePath(openedPath.slice(0, level));
      } else {
        // Если не открыта - открываем (добавляем в path)
        updatePath([...openedPath.slice(0, level), categoryId]);
        
        // Если у категории нет children, загружаем units
        if ((!category.children || category.children.length === 0) && !unitsByCategory[categoryId]) {
          console.log('🔄 VinCategory: handleCategoryClick загружает units для категории', categoryId);
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
    } else {
      // Режим "Общие" - используем старую логику
      if (category.children && category.children.length > 0) {
        if (openedPath[level] === categoryId) {
          updatePath(openedPath.slice(0, level));
        } else {
          updatePath([...openedPath.slice(0, level), categoryId]);
        }
      } else if (category.link && onQuickGroupSelect) {
        // Для вкладки "Общие" с link=true используем QuickGroup
        onQuickGroupSelect(category);
      }
    }
  };

  const handleSubcategoryClick = (subcat: any) => {
    if (activeTab === 'manufacturer' && onNodeSelect) {
      // Для режима "От производителя" при клике на подкатегорию открываем KnotIn
      onNodeSelect({
        ...subcat,
        unitid: subcat.unitid || subcat.categoryid || subcat.quickgroupid || subcat.id
      });
    } else {
      handleCategoryClick(subcat, 0);
    }
  };

  // Если нет данных о транспортном средстве, показываем заглушку
  if (!catalogCode || !vehicleId) {
    return (
      <div className="w-layout-vflex flex-block-14-copy-copy">
        <div className="text-center py-8 text-gray-500">
          <div className="text-lg font-medium mb-2">Каталог запчастей</div>
          <div className="text-sm">Выберите автомобиль для просмотра каталога</div>
        </div>
      </div>
    );
  }

  if (loading) return <div>Загрузка категорий...</div>;
  if (error) return <div style={{ color: "red" }}>Ошибка: {error.message}</div>;

  // Определяем, какие подкатегории показывать
  let subcategories: any[] = [];
  if (selectedCategory) {
    if (activeTab === 'uzly') {
      // Для вкладки "Общие" используем children
      subcategories = selectedCategory.children || [];
    } else {
      // Для вкладки "От производителя" используем либо children, либо units
      if (selectedCategory.children && selectedCategory.children.length > 0) {
        subcategories = selectedCategory.children;
      } else {
        const categoryId = selectedCategory.categoryid || selectedCategory.quickgroupid || selectedCategory.id;
        subcategories = unitsByCategory[categoryId] || [];
      }
    }
  }

  return (
    <div className="w-layout-vflex flex-block-14-copy-copy">
      {!selectedCategory ? (
        // Список категорий
        categories.map((cat: any, idx: number) => (
          <div
            className="div-block-131"
            key={cat.quickgroupid || cat.categoryid || cat.id || idx}
            onClick={() => handleCategoryClick(cat, 0)}
            style={{ cursor: "pointer" }}
          >
            <div className="text-block-57">{cat.name}</div>
            <div className="w-embed">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="24" width="24" height="24" rx="12" transform="rotate(90 24 0)" fill="currentcolor"></rect>
                <path fillRule="evenodd" clipRule="evenodd" d="M10.9303 17L10 16.0825L14.1395 12L10 7.91747L10.9303 7L16 12L10.9303 17Z" fill="white"></path>
              </svg>
            </div>
          </div>
        ))
      ) : (
        // Список подкатегорий
        <>
          {(() => {
            // Найти текущий уровень вложенности для selectedCategory
            let level = 0;
            let list = categories;
            while (openedPath[level] && list) {
              const found = list.find((cat: any) => (cat.quickgroupid || cat.categoryid || cat.id) === openedPath[level]);
              if (!found) break;
              if (found === selectedCategory) break;
              list = found.children || [];
              level++;
            }
            
            // Показываем либо children, либо units
            if (subcategories.length === 0) {
              // Если загружаются units для категории без children
              const categoryId = selectedCategory.categoryid || selectedCategory.quickgroupid || selectedCategory.id;
              if (activeTab === 'manufacturer' && 
                  (!selectedCategory.children || selectedCategory.children.length === 0) &&
                  !unitsByCategory[categoryId]) {
                return <div style={{ color: "#888", padding: 8 }}>Загружаем узлы...</div>;
              }
              return <div style={{ color: "#888", padding: 8 }}>Нет подкатегорий</div>;
            }
            
            return subcategories.map((subcat: any, idx: number) => (
              <div
                className="div-block-131"
                key={subcat.quickgroupid || subcat.categoryid || subcat.unitid || subcat.id || idx}
                onClick={() => {
                  // Для узлов (units) из режима "От производителя" сразу открываем KnotIn
                  if (activeTab === 'manufacturer' && subcat.unitid && onNodeSelect) {
                    console.log('🔍 VinCategory: Открываем узел напрямую:', subcat);
                    onNodeSelect({
                      ...subcat,
                      unitid: subcat.unitid || subcat.quickgroupid || subcat.categoryid || subcat.id
                    });
                  } else {
                    handleCategoryClick(subcat, level + 1);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="text-block-57">{subcat.name}</div>
                <div className="w-embed">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="24" width="24" height="24" rx="12" transform="rotate(90 24 0)" fill="currentcolor"></rect>
                    <path fillRule="evenodd" clipRule="evenodd" d="M10.9303 17L10 16.0825L14.1395 12L10 7.91747L10.9303 7L16 12L10.9303 17Z" fill="white"></path>
                  </svg>
                </div>
              </div>
            ));
          })()}
        </>
      )}
    </div>
  );
};

export default VinCategory; 