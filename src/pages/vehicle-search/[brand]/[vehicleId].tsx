import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';

import Footer from '@/components/Footer';
import Layout from '@/components/Layout';
import VehiclePartsSearchSection from '@/components/VehiclePartsSearchSection';
import LaximoDiagnostic from '@/components/LaximoDiagnostic';
import { GET_LAXIMO_VEHICLE_INFO, GET_LAXIMO_CATALOG_INFO, GET_LAXIMO_UNIT_DETAILS } from '@/lib/graphql';
import { LaximoCatalogInfo } from '@/types/laximo';
import InfoVin from '@/components/vin/InfoVin';
import VinLeftbar from '@/components/vin/VinLeftbar';
import VinKnot from '@/components/vin/VinKnot';
import VinCategory from '@/components/vin/VinCategory';
import PartDetailCard from '@/components/PartDetailCard';
import VinPartCard from '@/components/vin/VinPartCard';
import KnotIn from '@/components/vin/KnotIn';
import KnotParts from '@/components/vin/KnotParts';
import VinQuick from '@/components/vin/VinQuick';
import CatalogSubscribe from '@/components/CatalogSubscribe';
import MobileMenuBottomSection from '@/components/MobileMenuBottomSection';
import MetaTags from '@/components/MetaTags';
import { getMetaByPath } from '@/lib/meta-config';


interface LaximoVehicleInfo {
  vehicleid: string;
  name: string;
  ssd: string;
  brand: string;
  catalog: string;
  attributes: Array<{
    key: string;
    name: string;
    value: string;
  }>;
}

const VehicleDetailsPage = () => {
  const router = useRouter();
  const { brand, vehicleId, oemNumber, searchType: searchTypeParam } = router.query;
  
  // Устанавливаем тип поиска из URL или по умолчанию
  // Важно: согласно документации Laximo, для групп быстрого поиска используется ListQuickGroup
  // Если в URL передан searchType=categories, мы интерпретируем это как запрос на quickgroups
  let defaultSearchType: 'quickgroups' | 'categories' | 'fulltext' = 'quickgroups';
  
  if (searchTypeParam === 'categories') {
    // В URL categories, но мы используем quickgroups для групп быстрого поиска
    defaultSearchType = 'quickgroups';

  } else if (searchTypeParam === 'quickgroups') {
    defaultSearchType = 'quickgroups';
  } else if (searchTypeParam === 'fulltext') {
    defaultSearchType = 'fulltext';
  }
  
  // ====== ВСЕ ХУКИ В НАЧАЛЕ КОМПОНЕНТА ======
  const [searchType, setSearchType] = useState<'quickgroups' | 'categories' | 'fulltext'>(defaultSearchType);
  const [showKnot, setShowKnot] = useState(false);
  const [foundParts, setFoundParts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'uzly' | 'manufacturer'>('uzly');
  const [openedPath, setOpenedPath] = useState<string[]>([]);
  const [searchState, setSearchState] = useState<{
    loading: boolean;
    error: any;
    query: string;
    isSearching: boolean;
  }>({
    loading: false,
    error: null,
    query: '',
    isSearching: false
  });
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [selectedQuickGroup, setSelectedQuickGroup] = useState<any | null>(null);
  const [selectedParts, setSelectedParts] = useState<Set<string | number>>(new Set());
  const [highlightedPart, setHighlightedPart] = useState<string | number | null>(null);
  
  // Получаем информацию о выбранном автомобиле
  const ssdFromQuery = Array.isArray(router.query.ssd) ? router.query.ssd[0] : router.query.ssd;
  const useStorage = router.query.use_storage === '1';
  const ssdLengthFromUrl = router.query.ssd_length ? parseInt(router.query.ssd_length as string) : 0;
  
  // Если указано use_storage, пытаемся получить SSD из localStorage
  let finalSsd = '';
  if (useStorage && typeof window !== 'undefined') {
    const vehicleKey = `vehicle_ssd_${brand}_${vehicleId}`;
    const storedSsd = localStorage.getItem(vehicleKey);
    if (storedSsd) {
      finalSsd = storedSsd;
      // НЕ ОЧИЩАЕМ SSD сразу, оставляем на случай перезагрузки страницы
      // localStorage.removeItem(vehicleKey);
    }
  } else if (ssdFromQuery && ssdFromQuery.trim() !== '') {
    finalSsd = ssdFromQuery;
  }

  // Получаем информацию о каталоге
  const { data: catalogData } = useQuery<{ laximoCatalogInfo: LaximoCatalogInfo }>(
    GET_LAXIMO_CATALOG_INFO,
    {
      variables: { catalogCode: brand },
      skip: !brand
    }
  );

  const { data: vehicleData, loading: vehicleLoading, error: vehicleError } = useQuery<{ laximoVehicleInfo: LaximoVehicleInfo }>(
    GET_LAXIMO_VEHICLE_INFO,
    {
      variables: { 
        catalogCode: brand,
        vehicleId: vehicleId,
        ...(finalSsd && { ssd: finalSsd }),
        localized: true
      },
      skip: !brand || vehicleId === undefined || vehicleId === null,
      errorPolicy: 'all',
      onCompleted: (data) => {
        console.log('🔍 VehicleInfo GraphQL completed:', {
          requestedVehicleId: vehicleId,
          returnedVehicleId: data?.laximoVehicleInfo?.vehicleid,
          vehicleName: data?.laximoVehicleInfo?.name,
          ssdUsed: finalSsd?.substring(0, 50) + '...',
          fullData: data
        });
        
        if (data?.laximoVehicleInfo?.vehicleid !== vehicleId) {
          console.log('🚨 ОБНАРУЖЕНО НЕСООТВЕТСТВИЕ VEHICLE ID!');
          console.log(`📍 URL vehicleId: ${vehicleId}`);
          console.log(`📍 API vehicleId: ${data?.laximoVehicleInfo?.vehicleid}`);
        } else {
          console.log('✅ Vehicle ID соответствует URL');
        }
      },
      onError: (error) => {
        console.error('❌ VehicleInfo GraphQL error:', error);
      }
    }
  );

  // Получаем детали выбранного узла, если он выбран
  console.log('🔍 [vehicleId].tsx - Проверка условий для GET_LAXIMO_UNIT_DETAILS:', {
    selectedNode: selectedNode ? {
      unitid: selectedNode.unitid,
      name: selectedNode.name,
      hasSsd: !!selectedNode.ssd
    } : null,
    skipCondition: !selectedNode,
    catalogCode: selectedNode?.catalogCode || selectedNode?.catalog || brand,
    vehicleId: selectedNode?.vehicleId || vehicleId,
    unitId: selectedNode?.unitid || selectedNode?.unitId,
    ssd: selectedNode?.ssd || finalSsd || '',
    finalSsd: finalSsd ? `${finalSsd.substring(0, 50)}...` : 'отсутствует'
  });

  const {
    data: unitDetailsData,
    loading: unitDetailsLoading,
    error: unitDetailsError
  } = useQuery(
    GET_LAXIMO_UNIT_DETAILS,
    {
      variables: selectedNode
        ? {
            catalogCode: selectedNode.catalogCode || selectedNode.catalog || brand,
            vehicleId: selectedNode.vehicleId || vehicleId,
            unitId: selectedNode.unitid || selectedNode.unitId,
            ssd: selectedNode.ssd || finalSsd || '',
          }
        : { catalogCode: '', vehicleId: '', unitId: '', ssd: '' },
      skip: !selectedNode,
      errorPolicy: 'all',
      fetchPolicy: 'no-cache',
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        console.log('🔍 [vehicleId].tsx - GET_LAXIMO_UNIT_DETAILS completed:', {
          detailsCount: data?.laximoUnitDetails?.length || 0,
          firstDetail: data?.laximoUnitDetails?.[0],
          allDetails: data?.laximoUnitDetails?.map((detail: any) => ({
            name: detail.name,
            oem: detail.oem,
            codeonimage: detail.codeonimage,
            attributesCount: detail.attributes?.length || 0
          }))
        });
      },
      onError: (error) => {
        console.error('❌ [vehicleId].tsx - GET_LAXIMO_UNIT_DETAILS error:', error);
      }
    }
  );

  // Автоматическое перенаправление на правильный vehicleId если API вернул другой ID
  useEffect(() => {
    if (vehicleData?.laximoVehicleInfo && vehicleData.laximoVehicleInfo.vehicleid !== vehicleId) {
      const correctVehicleId = vehicleData.laximoVehicleInfo.vehicleid;
      console.log(`🔄 Автоматическое перенаправление: ${vehicleId} -> ${correctVehicleId}`);
      
      // Обновляем localStorage с правильным ключом
      if (finalSsd && typeof window !== 'undefined') {
        const oldKey = `vehicle_ssd_${brand}_${vehicleId}`;
        const newKey = `vehicle_ssd_${brand}_${correctVehicleId}`;
        
        // Перемещаем SSD на правильный ключ
        localStorage.setItem(newKey, finalSsd);
        localStorage.removeItem(oldKey);
        console.log(`💾 SSD перемещен: ${oldKey} -> ${newKey}`);
      }
      
      // Строим новый URL с правильным vehicleId
      const currentParams = new URLSearchParams(window.location.search);
      const newUrl = `/vehicle-search/${brand}/${correctVehicleId}?${currentParams.toString()}`;
      
      // Перенаправляем на правильный URL
      router.replace(newUrl);
      return;
    }
  }, [vehicleData, vehicleId, brand, finalSsd, router]);

  // Следим за изменением quickgroup в URL и обновляем selectedQuickGroup
  useEffect(() => {
    const quickgroupId = router.query.quickgroup as string;
    if (quickgroupId) {
      // Используем функциональное обновление состояния для избежания dependency
      setSelectedQuickGroup((prev: any) => {
        if (prev && prev.quickgroupid === quickgroupId) return prev;
        return { quickgroupid: quickgroupId };
      });
    } else {
      setSelectedQuickGroup(null);
    }
  }, [router.query.quickgroup]);

  // Следить за изменением unitid в URL и обновлять selectedNode
  useEffect(() => {
    const unitid = router.query.unitid as string;
    if (unitid) {
      // Используем функциональное обновление состояния для избежания dependency
      setSelectedNode((prev: any) => {
        if (prev && (prev.unitid === unitid || prev.id === unitid)) return prev;
        return { unitid };
      });
    } else {
      setSelectedNode(null);
    }
  }, [router.query.unitid]);

  const handleCategoryClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setShowKnot(true);
  };
  
  useEffect(() => {
    const handler = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('link-2')) {
        e.preventDefault();
        setShowKnot(true);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);
  // ====== КОНЕЦ ХУКОВ ======


  const unitDetails = unitDetailsData?.laximoUnitDetails || [];
  
  // Детальное логирование данных от API
  React.useEffect(() => {
    if (unitDetailsData?.laximoUnitDetails) {
      console.log('🔍 [vehicleId].tsx - Полные данные unitDetails от API:', {
        totalParts: unitDetailsData.laximoUnitDetails.length,
        firstPart: unitDetailsData.laximoUnitDetails[0],
        allCodeOnImages: unitDetailsData.laximoUnitDetails.map((part: any) => ({
          name: part.name,
          codeonimage: part.codeonimage,
          detailid: part.detailid,
          oem: part.oem
        }))
      });
    }
  }, [unitDetailsData]);
  
  // Логируем ошибки
  if (vehicleError) {
    console.error('Vehicle GraphQL error:', vehicleError);
  }

  if (vehicleLoading) {
    return (
      <>
        <MetaTags 
          title="Загрузка автомобиля..."
          description="Загружаем информацию об автомобиле..."
        />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Загружаем информацию об автомобиле...</p>
          </div>
        </div>
      </>
    );
  }

  // Если информация о каталоге недоступна, показываем ошибку
  if (!catalogData?.laximoCatalogInfo) {
    return (
      <>
        <MetaTags 
          title="Каталог не найден"
          description="Информация о каталоге недоступна"
        />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Каталог не найден</h1>
            <p className="text-gray-600 mb-8">Информация о каталоге недоступна</p>
            <button
              onClick={() => router.back()}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Назад к поиску
            </button>
          </div>
        </main>
      </>
    );
  }

  // Если vehicleId отсутствует или пустой, показываем предупреждение
  // Важно: vehicleId может быть '0' для некоторых автомобилей, найденных по VIN
  if (!vehicleId || vehicleId === '') {
    return (
      <main className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yellow-900 mb-4">Автомобиль не выбран</h1>
          <p className="text-yellow-700 mb-8">Для поиска по деталям необходимо выбрать конкретный автомобиль через VIN или мастер подбора.</p>
          <button
            onClick={() => router.back()}
            className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Назад к поиску
          </button>
        </div>
      </main>
    );
  }

  // Гарантируем, что vehicleId — строка
  const vehicleIdStr = Array.isArray(vehicleId) ? (vehicleId[0] || '') : (vehicleId || '');
  // Для Laximo API vehicleId может быть '0' для автомобилей, найденных по VIN
  const fallbackVehicleId = vehicleIdStr;

  let vehicleInfo = vehicleData?.laximoVehicleInfo || {
    vehicleid: fallbackVehicleId,
    name: `Автомобиль ${catalogData.laximoCatalogInfo.name}`,
    ssd: finalSsd,
    brand: catalogData.laximoCatalogInfo.brand,
    catalog: catalogData.laximoCatalogInfo.code,
    attributes: [] as never[]
  };

  // Убеждаемся, что vehicleid соответствует параметру из URL
  if (vehicleInfo.vehicleid !== fallbackVehicleId && fallbackVehicleId) {
    vehicleInfo = { ...vehicleInfo, vehicleid: fallbackVehicleId };
  }



  // Если нет данных автомобиля и есть ошибка, показываем предупреждение
  const hasError = vehicleError && !vehicleData?.laximoVehicleInfo;
  const catalogInfo = catalogData.laximoCatalogInfo;

  // Создаем динамические meta-теги
  const vehicleName = vehicleInfo.brand && vehicleInfo.name 
    ? (vehicleInfo.name.indexOf(vehicleInfo.brand) !== 0 
        ? `${vehicleInfo.brand} ${vehicleInfo.name}` 
        : vehicleInfo.name)
    : 'Автомобиль';
  
  const metaData = {
    title: `Запчасти для ${vehicleName} - Поиск по каталогу Protek`,
    description: `Найдите и купите запчасти для ${vehicleName}. Широкий выбор оригинальных и аналоговых запчастей с быстрой доставкой.`,
    keywords: `запчасти ${vehicleName}, ${vehicleInfo.brand} запчасти, автозапчасти, каталог запчастей`,
    ogTitle: `Запчасти для ${vehicleName} - Protek`,
    ogDescription: `Найдите и купите запчасти для ${vehicleName}. Широкий выбор оригинальных и аналоговых запчастей.`
  };

  // --- Синхронизация selectedQuickGroup с URL ---
  // Функция для открытия VinQuick и добавления quickgroup в URL
  const openQuickGroup = (group: any) => {
    // Проверяем что group не null и имеет quickgroupid
    if (!group || !group.quickgroupid) {
      console.warn('⚠️ openQuickGroup: получен null или группа без quickgroupid:', group);
      return;
    }
    
    setSelectedQuickGroup(group);
    router.push(
      { pathname: router.pathname, query: { ...router.query, quickgroup: group.quickgroupid } },
      undefined,
      { shallow: true }
    );
  };
  // --- Сброс VinQuick (selectedQuickGroup) и quickgroup в URL ---
  const closeQuickGroup = () => {
    setSelectedQuickGroup(null);
    const { quickgroup, ...rest } = router.query;
    if (quickgroup) {
      router.push(
        { pathname: router.pathname, query: rest },
        undefined,
        { shallow: true }
      );
    }
  };

  // --- Синхронизация selectedNode (KnotIn) с URL ---
  // Открыть KnotIn и добавить unitid в URL
  const openKnot = (node: any) => {
    // ОТЛАДКА: Логируем узел который получили
    console.log('🔍 [vehicleId].tsx openKnot получил узел:', {
      unitId: node.unitid,
      unitName: node.name,
      hasSsd: !!node.ssd,
      nodeSsd: node.ssd ? `${node.ssd.substring(0, 50)}...` : 'отсутствует',
      vehicleSsd: vehicleInfo.ssd ? `${vehicleInfo.ssd.substring(0, 50)}...` : 'отсутствует',
      ssdLength: node.ssd?.length || 0
    });
    
    setSelectedNode(node);
    // Сброс состояния выбранных деталей при открытии нового узла
    setSelectedParts(new Set());
    setHighlightedPart(null);
    router.push(
      { pathname: router.pathname, query: { ...router.query, unitid: node.unitid || node.id } },
      undefined,
      { shallow: true }
    );
  };
  // Закрыть KnotIn и удалить unitid из URL
  const closeKnot = () => {
    setSelectedNode(null);
    // Сброс состояния выбранных деталей при закрытии узла
    setSelectedParts(new Set());
    setHighlightedPart(null);
    const { unitid, ...rest } = router.query;
    router.push(
      { pathname: router.pathname, query: rest },
      undefined,
      { shallow: true }
    );
  };

  // Обработчик выбора детали (множественный выбор)
  const handlePartSelect = (codeOnImage: string | number | null) => {
    if (codeOnImage === null) return; // Игнорируем null значения
    setSelectedParts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(codeOnImage)) {
        newSet.delete(codeOnImage); // Убираем если уже выбрана
      } else {
        newSet.add(codeOnImage); // Добавляем если не выбрана
      }
      return newSet;
    });
  };

  // Обработчик подсветки детали при наведении
  const handlePartHighlight = (codeOnImage: string | number | null) => {
    setHighlightedPart(codeOnImage);
  };

  return (
    <>
      <MetaTags {...metaData} />
      
        {/* ====== ВРЕМЕННЫЙ МАКЕТ ДЛЯ ВЕРСТКИ (начало) ====== */}
        <InfoVin 
          vehicleName={
            vehicleInfo.brand && vehicleInfo.name && vehicleInfo.name.indexOf(vehicleInfo.brand) !== 0
              ? `${vehicleInfo.brand} ${vehicleInfo.name}`
              : vehicleInfo.name
          }
          vehicleInfo={
            vehicleInfo.attributes && vehicleInfo.attributes.length > 0
              ? vehicleInfo.attributes.map(attr => attr.value).join(' · ')
              : ''
          }
          vehicleAttributes={vehicleInfo.attributes || []}
        />

          <div className="w-layout-blockcontainer container-vin w-container">
            {!selectedNode ? (
              <div className="w-layout-hflex flex-block-13">
                {vehicleInfo && vehicleInfo.catalog && vehicleInfo.vehicleid && vehicleInfo.ssd && (
                  <>
                    <VinLeftbar 
                      vehicleInfo={vehicleInfo}
                      onSearchResults={({ results, loading, error, query, isSearching }) => {
                        setFoundParts(results);
                        setSearchState({ loading, error, query, isSearching: isSearching || false });
                      }}
                      onNodeSelect={openKnot}
                      onActiveTabChange={(tab) => {
                        setActiveTab(tab);
                        // Сбрасываем состояние при смене вкладки
                        setSelectedQuickGroup(null);
                        setSelectedNode(null);
                        setOpenedPath([]);
                        // Очищаем URL от параметров quickgroup и unitid
                        const { quickgroup, unitid, ...rest } = router.query;
                        if (quickgroup || unitid) {
                          router.push(
                            { pathname: router.pathname, query: rest },
                            undefined,
                            { shallow: true }
                          );
                        }
                      }}
                      onQuickGroupSelect={openQuickGroup}
                      activeTab={activeTab}
                      openedPath={openedPath}
                      setOpenedPath={setOpenedPath}
                      onCloseQuickGroup={closeQuickGroup}
                    />
                    {searchState.isSearching ? (
                      <div className="knot-parts">
                        {searchState.loading ? (
                          <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Выполняется поиск...</p>
                          </div>
                        ) : searchState.error ? (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-3">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                  Ошибка поиска
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                  <p>{searchState.error.message}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : foundParts.length > 0 ? (
                          foundParts.map((detail, idx) => (
                            <VinPartCard
                              key={detail.oem + idx}
                              n={idx + 1}
                              name={detail.name}
                              oem={detail.oem}
                              catalogCode={vehicleInfo.catalog}
                              vehicleId={vehicleInfo.vehicleid}
                            />
                          ))
                        ) : (
                          <div className="text-center py-12">
                            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-600">
                              По запросу "{searchState.query}" ничего не найдено
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Попробуйте изменить поисковый запрос
                            </p>
                          </div>
                        )}
                      </div>
                    ) : showKnot ? (
                      <VinKnot />
                    ) : selectedQuickGroup ? (
                      <VinQuick
                        quickGroup={selectedQuickGroup}
                        catalogCode={vehicleInfo.catalog}
                        vehicleId={vehicleInfo.vehicleid}
                        ssd={vehicleInfo.ssd}
                        onBack={closeQuickGroup}
                        onNodeSelect={openKnot}
                      />
                    ) : (
                      <VinCategory
                        catalogCode={vehicleInfo.catalog}
                        vehicleId={vehicleInfo.vehicleid}
                        ssd={vehicleInfo.ssd}
                        onNodeSelect={openKnot}
                        activeTab={activeTab}
                        onQuickGroupSelect={openQuickGroup}
                        openedPath={openedPath}
                        setOpenedPath={setOpenedPath}
                      />
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="w-layout-hflex flex-block-13">
                <div className="w-layout-vflex flex-block-14-copy-copy">
                  {/* <button onClick={() => setSelectedNode(null)} style={{ marginBottom: 16 }}>Назад</button> */}
                  {/* ОТЛАДКА: Логируем передачу SSD в KnotIn */}
                  {(() => {
                    const knotSsd = selectedNode.ssd || vehicleInfo.ssd;
                    console.log('🔍 [vehicleId].tsx передает в KnotIn:', {
                      selectedNodeSsd: selectedNode.ssd ? `${selectedNode.ssd.substring(0, 50)}...` : 'отсутствует',
                      vehicleInfoSsd: vehicleInfo.ssd ? `${vehicleInfo.ssd.substring(0, 50)}...` : 'отсутствует',
                      finalSsd: knotSsd ? `${knotSsd.substring(0, 50)}...` : 'отсутствует',
                      unitId: selectedNode.unitid,
                      unitName: selectedNode.name
                    });
                    return null;
                  })()}
                  <KnotIn
                    catalogCode={vehicleInfo.catalog}
                    vehicleId={vehicleInfo.vehicleid}
                    ssd={selectedNode.ssd || vehicleInfo.ssd}
                    unitId={selectedNode.unitid}
                    unitName={selectedNode.name}
                    parts={unitDetails}
                    onPartSelect={handlePartSelect}
                    onPartsHighlight={handlePartHighlight}
                    selectedParts={selectedParts}
                  />
                  {unitDetailsLoading ? (
                    <div style={{ padding: 24, textAlign: 'center' }}>Загружаем детали узла...</div>
                  ) : unitDetailsError ? (
                    <div style={{ color: 'red', padding: 24 }}>Ошибка загрузки деталей: {unitDetailsError.message}</div>
                  ) : unitDetails.length > 0 ? (
                    <KnotParts 
                      parts={unitDetails} 
                      catalogCode={vehicleInfo.catalog}
                      vehicleId={vehicleInfo.vehicleid}
                      highlightedCodeOnImage={highlightedPart}
                      selectedParts={selectedParts}
                      onPartSelect={handlePartSelect}
                      onPartHover={handlePartHighlight}
                    />
                  ) : (
                    <div style={{ padding: 24, textAlign: 'center' }}>Детали не найдены</div>
                  )}
                </div>
              </div>
            )}
          </div>
            <section className="section-3">
        <CatalogSubscribe />
      </section>
      <Footer />
      <MobileMenuBottomSection />   

        {/* ====== ВРЕМЕННЫЙ МАКЕТ ДЛЯ ВЕРСТКИ (конец) ====== */}

        {/* Навигация
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="text-gray-500 hover:text-gray-700 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Назад</span>
                </button>
                <div className="text-sm text-gray-500">
                  <span>Главная</span>
                  <span className="mx-2">/</span>
                  <span>Каталог</span>
                  <span className="mx-2">/</span>
                  <span>{catalogInfo.name}</span>
                  <span className="mx-2">/</span>
                  <span className="text-gray-900 font-medium">{vehicleInfo.name}</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        Информация об автомобиле
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-4 mb-6">
              {catalogInfo.icon && (
                <img 
                  src={`/images/brands/${catalogInfo.icon}`} 
                  alt={catalogInfo.name}
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{vehicleInfo.name}</h1>
                <p className="text-lg text-gray-600">{catalogInfo.name}</p>
              </div>
            </div>

            Предупреждение об ошибке
            {hasError && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Предупреждение
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Не удалось загрузить полную информацию об автомобиле. Отображается базовая информация.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            Отладочная информация
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                🔧 Отладочная информация
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Использовать localStorage:</span>
                  <span className="ml-2 font-medium">{useStorage ? 'Да' : 'Нет'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Длина SSD из URL:</span>
                  <span className="ml-2 font-medium">{ssdLengthFromUrl || 'не указана'}</span>
                </div>
                <div>
                  <span className="text-gray-500">SSD получен:</span>
                  <span className="ml-2 font-medium">{finalSsd ? 'Да' : 'Нет'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Длина SSD:</span>
                  <span className="ml-2 font-medium">{finalSsd.length}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-gray-500">SSD (первые 100 символов):</span>
                  <span className="ml-2 font-mono text-xs break-all">
                    {finalSsd ? finalSsd.substring(0, 100) + '...' : 'отсутствует'}
                  </span>
                </div>
              </div>
            </div>

            Характеристики автомобиля
            {vehicleInfo.attributes && vehicleInfo.attributes.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {vehicleInfo.attributes.map((attr, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <dt className="text-sm font-medium text-gray-500">{attr.name}</dt>
                    <dd className="text-sm text-gray-900 mt-1">{attr.value}</dd>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        Способы поиска запчастей
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Поиск запчастей</h2>
            <p className="text-gray-600">
              Выберите способ поиска запчастей для вашего автомобиля
            </p>
          </div>

          Диагностический компонент
          <LaximoDiagnostic
            catalogCode={vehicleInfo.catalog}
            vehicleId={vehicleInfo.vehicleid}
            ssd={vehicleInfo.ssd}
          />

          <VehiclePartsSearchSection
            catalogInfo={catalogInfo}
            vehicleInfo={vehicleInfo}
            searchType={searchType}
            onSearchTypeChange={setSearchType}
          />
        </div> */}
    </>
  );
};

export default VehicleDetailsPage; 