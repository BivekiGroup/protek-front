import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '@/lib/graphql';

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

interface CategoriesData {
  categories: Category[];
}

interface TabData {
  label: string;
  heading: string;
  links: string[];
  categoryId: string;
  categorySlug?: string;
  image?: string;
  children?: Category[];
}

// Fallback статичные данные
const fallbackTabData: TabData[] = [
  {
    label: "Масла и технические жидкости",
    heading: "Масла и технические жидкости",
    links: ["Моторные масла", "Трансмиссионные масла", "Тормозные жидкости"],
    categoryId: "fallback_1"
  },
  {
    label: "Фильтры",
    heading: "Фильтры",
    links: ["Воздушные фильтры", "Масляные фильтры", "Топливные фильтры"],
    categoryId: "fallback_2"
  },
];

// Преобразуем категории из БД в формат меню
const transformCategoriesToTabData = (categories: Category[]): TabData[] => {
  console.log('🔄 Преобразуем категории из БД:', categories.length, 'элементов');

  return categories.map(category => {
    const visibleChildren = category.children.filter(child => !child.isHidden);

    console.log(`🔗 Категория "${category.name}": ${visibleChildren.length} подкатегорий`);

    return {
      label: category.name,
      heading: category.name,
      links: visibleChildren.map(child => child.name),
      categoryId: category.id,
      categorySlug: category.slug,
      image: category.image,
      children: visibleChildren
    };
  });
};

const BottomHead = ({ menuOpen, onClose }: { menuOpen: boolean; onClose: () => void }) => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [mobileCategory, setMobileCategory] = useState<null | TabData>(null);
  const [tabData, setTabData] = useState<TabData[]>(fallbackTabData);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // --- Overlay animation state ---
  const [showOverlay, setShowOverlay] = useState(false);

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };
  useEffect(() => {
    if (menuOpen) {
      setShowOverlay(true);
    } else {
      const timeout = setTimeout(() => setShowOverlay(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [menuOpen]);

  // Получаем категории из БД
  const { data: categoriesData, loading, error } = useQuery<CategoriesData>(
    GET_CATEGORIES,
    {
      errorPolicy: 'all',
      onCompleted: (data) => {
        console.log('🎉 Категории получены из БД:', data);
      },
      onError: (error) => {
        console.error('❌ Ошибка загрузки категорий:', error);
      }
    }
  );

  console.log('🔄 BottomHead render:', {
    menuOpen,
    tabDataLength: tabData.length,
    activeTabIndex,
    isMobile,
    showOverlay,
    categoriesCount: categoriesData?.categories?.length || 0
  });

  // Обновляем данные табов когда получаем данные от API
  useEffect(() => {
    if (categoriesData?.categories && categoriesData.categories.length > 0) {
      console.log('✅ Обновляем меню с категориями из БД:', categoriesData.categories.length);

      // Фильтруем только корневые категории (level === 0) и не скрытые
      console.log('🔍 Проверяем level у категорий:', categoriesData.categories.slice(0, 3).map(c => ({ name: c.name, level: c.level, childrenCount: c.children?.length || 0 })));
      const rootCategories = categoriesData.categories.filter(cat => cat.level === 0 && !cat.isHidden);
      console.log('📋 Корневых категорий после фильтрации:', rootCategories.length);
      console.log('📋 Первые 3 категории:', rootCategories.slice(0, 3).map(c => ({ name: c.name, childrenCount: c.children?.length || 0 })));
      const apiTabData = transformCategoriesToTabData(rootCategories);
      setTabData(apiTabData);
      setActiveTabIndex(0);
    } else if (error) {
      console.warn('⚠️ Используем fallback данные из-за ошибки:', error);
      setTabData(fallbackTabData);
      setActiveTabIndex(0);
    }
  }, [categoriesData, error]);

  // Обработка клика по категории для перехода в каталог
  const handleCategoryClick = (categorySlug: string) => {
    console.log('🔍 Клик по категории:', { categorySlug });

    // Закрываем меню
    onClose();

    // Переходим на страницу каталога
    router.push(`/catalog/${categorySlug}`);
  };

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
              {mobileCategory.links.length === 1 ? (
                <div
                  className="mobile-subcategory"
                  onClick={() => {
                    const categorySlug = mobileCategory.categorySlug || '';
                    handleCategoryClick(categorySlug);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  Показать все
                </div>
              ) : (
                mobileCategory.links.map((link: string) => {
                  const subcategory = mobileCategory.children?.find((child: Category) => child.name === link);
                  return (
                    <div
                      className="mobile-subcategory"
                      key={link}
                      onClick={() => {
                        if (subcategory?.slug) {
                          handleCategoryClick(subcategory.slug);
                        }
                      }}
                    >
                      {link}
                    </div>
                  );
                })
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
              {tabData.map((cat) => (
                <div
                  className="mobile-subcategory"
                  key={cat.label}
                  onClick={() => setMobileCategory(cat)}
                  style={{ cursor: "pointer" }}
                >
                  {cat.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  // Десктоп версия
  console.log('🖥️ Десктоп меню:', { menuOpen, showOverlay, willDisplay: menuOpen ? "block" : "none" });

  return (
    <>
      {showOverlay && (
        <>
          <div
            className={`fixed inset-0 bg-black/7 z-40 transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
            aria-label="Закрыть меню"
          />
          <div
            className={`fixed inset-0 bg-black/7 z-1900 transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
            aria-label="Закрыть меню"
          />
        </>
      )}
      <nav
        role="navigation"
        className="nav-menu-3 w-nav-menu z-2000"
        style={{
          display: menuOpen ? "block" : "none",
          position: "absolute",
          top: "100%",
          left: 0,
          width: "100%",
          backgroundColor: "white",
          zIndex: 99999,
          minHeight: "200px"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="div-block-28" style={{ backgroundColor: "white", padding: "20px" }}>
          <div className="w-layout-hflex flex-block-90" style={{ backgroundColor: "#fff", display: "flex", gap: "0", height: "600px" }}>
            <div className="w-layout-vflex flex-block-88" style={{ height: "100%", overflowY: "auto", width: "280px", flex: "0 0 280px", backgroundColor: "#f8f8f8", padding: "20px 10px" }}>
              {/* Меню с иконками */}
              {tabData.map((tab, idx) => {
                const category = categoriesData?.categories.find(c => c.id === tab.categoryId);
                const icon = category?.image;
                if (idx === 0) console.log('🎨 Первая категория:', tab.label, 'icon:', icon);

                return (
                  <a
                    href="#"
                    className={`link-block-7 w-inline-block${activeTabIndex === idx ? " w--current" : ""}`}
                    key={tab.label}
                    onClick={() => setActiveTabIndex(idx)}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      padding: "12px 16px",
                      backgroundColor: activeTabIndex === idx ? "#f0f0f0" : "transparent",
                      borderRadius: "8px",
                      marginBottom: "8px",
                      textDecoration: "none",
                      color: "#333"
                    }}
                  >
                    <div style={{ marginRight: "12px", display: "flex", alignItems: "center" }}>
                      {icon ? (
                        <img
                          src={icon}
                          alt={tab.label}
                          width="24"
                          height="24"
                        />
                      ) : (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 21 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M10.3158 0.643914C10.4674 0.365938 10.8666 0.365938 11.0182 0.643914L14.0029 6.11673C14.0604 6.22222 14.1623 6.29626 14.2804 6.31838L20.4077 7.46581C20.7189 7.52409 20.8423 7.9037 20.6247 8.13378L16.3421 12.6636C16.2595 12.7509 16.2206 12.8707 16.2361 12.9899L17.0382 19.1718C17.079 19.4858 16.7561 19.7204 16.47 19.5847L10.8385 16.9114C10.73 16.8599 10.604 16.8599 10.4955 16.9114L4.86394 19.5847C4.5779 19.7204 4.25499 19.4858 4.29573 19.1718L5.0979 12.9899C5.11336 12.8707 5.07444 12.7509 4.99189 12.6636L0.709252 8.13378C0.491728 7.9037 0.615069 7.52409 0.926288 7.46581L7.05357 6.31838C7.17168 6.29626 7.27358 6.22222 7.33112 6.11673L10.3158 0.643914Z" fill="CurrentColor"></path>
                        </svg>
                      )}
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: 500 }}>{tab.label}</div>
                  </a>
                );
              })}
            </div>
            {/* Правая часть меню с подкатегориями */}
            <div style={{ flex: 1, padding: "30px 40px", backgroundColor: "#fff", height: "100%", overflowY: "auto", borderLeft: "1px solid #e0e0e0" }}>
              <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "30px", color: "#000" }}>
                {tabData[activeTabIndex]?.heading || tabData[0].heading}
              </h2>

              {/* Подкатегории с раскрывающимися группами */}
              <div style={{ display: "flex", gap: "60px" }}>
                <div style={{ flex: 1, maxWidth: "700px" }}>
                  {(tabData[activeTabIndex]?.children || []).map((child: Category) => {
                    const hasSubchildren = child.children && child.children.filter((c: Category) => !c.isHidden).length > 0;
                    const isExpanded = expandedGroups.has(child.id);
                    const visibleSubchildren = child.children ? child.children.filter((c: Category) => !c.isHidden) : [];

                    return (
                      <div key={child.id} style={{ marginBottom: "16px", borderBottom: "1px solid #f0f0f0", paddingBottom: "16px" }}>
                        <div
                          onClick={() => hasSubchildren ? toggleGroup(child.id) : handleCategoryClick(child.slug)}
                          style={{
                            cursor: "pointer",
                            fontSize: "16px",
                            fontWeight: 600,
                            marginBottom: isExpanded && hasSubchildren ? "12px" : "0",
                            color: "#000",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 0"
                          }}
                        >
                          <span>{child.name}</span>
                          {hasSubchildren && (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              style={{
                                transition: "transform 0.2s",
                                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)"
                              }}
                            >
                              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>

                        {/* Вложенные подкатегории */}
                        {hasSubchildren && isExpanded && (
                          <div style={{ paddingLeft: "0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
                            {visibleSubchildren.map((subchild: Category) => (
                              <div
                                key={subchild.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCategoryClick(subchild.slug);
                                }}
                                style={{
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  color: "#666",
                                  padding: "6px 0",
                                  transition: "color 0.2s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = "#000"}
                                onMouseLeave={(e) => e.currentTarget.style.color = "#666"}
                              >
                                {subchild.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Баннеры справа */}
                <div style={{ width: "300px", display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ width: "100%", height: "180px", backgroundColor: "#e0e0e0", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
                    Баннер 1
                  </div>
                  <div style={{ width: "100%", height: "180px", backgroundColor: "#e0e0e0", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
                    Баннер 2
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default BottomHead;
