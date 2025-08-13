import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { GET_LAXIMO_QUICK_GROUPS, GET_LAXIMO_QUICK_DETAIL } from '@/lib/graphql';
import { LaximoQuickGroup, LaximoQuickDetail, LaximoUnit } from '@/types/laximo';
import BrandSelectionModal from './BrandSelectionModal';
import UnitDetailsSection from './UnitDetailsSection';

interface QuickGroupsSectionProps {
  catalogCode: string;
  vehicleId: string;
  ssd?: string;
}

interface QuickGroupItemProps {
  group: LaximoQuickGroup;
  level: number;
  onGroupClick: (group: LaximoQuickGroup) => void;
}

const QuickGroupItem: React.FC<QuickGroupItemProps> = ({ group, level, onGroupClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = group.children && group.children.length > 0;
  const canShowDetails = group.link; // Только группы с link=true могут показывать детали

  const handleGroupClick = () => {
    if (canShowDetails) {
      // Если это конечная группа с поиском деталей - переходим к просмотру деталей
      onGroupClick(group);
    } else if (hasChildren) {
      // Если это родительская группа с подгруппами
      if (group.children?.some(child => child.link)) {
        // Есть подгруппы с активным поиском - показываем пользователю выбор
        setIsExpanded(!isExpanded);
      } else {
        // Все подгруппы неактивны - просто разворачиваем
      setIsExpanded(!isExpanded);
      }
    }
  };

  return (
    <div className="w-full">
      <div
        onClick={handleGroupClick}
        className={`
          flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors
          ${canShowDetails 
            ? 'bg-white hover:bg-red-50 border-gray-200 hover:border-red-300' 
            : hasChildren 
              ? 'bg-gray-50 hover:bg-gray-100 border-gray-200' 
              : 'bg-gray-100 border-gray-200 cursor-not-allowed'
          }
          ${level > 0 ? 'ml-4' : ''}
        `}
      >
        <div className="flex items-center space-x-3">
          {hasChildren && (
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          
          <div>
            <h3 className={`font-medium ${canShowDetails ? 'text-gray-900' : 'text-gray-600'}`}>
              {group.name}
            </h3>
            <p className="text-sm text-gray-500">
              ID: {group.quickgroupid}
              {canShowDetails && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Доступен поиск
                </span>
              )}
              {hasChildren && !canShowDetails && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {group.children?.filter(child => child.link).length || 0} подгрупп
                </span>
              )}
            </p>
          </div>
        </div>

        {canShowDetails && (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>

      {/* Дочерние группы */}
      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-2">
          {group.children!.map((childGroup) => (
            <QuickGroupItem
              key={childGroup.quickgroupid}
              group={childGroup}
              level={level + 1}
              onGroupClick={onGroupClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface QuickDetailSectionProps {
  catalogCode: string;
  vehicleId: string;
  selectedGroup: LaximoQuickGroup;
  ssd: string;
  onBack: () => void;
}

const QuickDetailSection: React.FC<QuickDetailSectionProps> = ({
  catalogCode,
  vehicleId,
  selectedGroup,
  ssd,
  onBack
}) => {
  console.log('🚀 QuickDetailSection рендерится с параметрами:', { catalogCode, vehicleId, selectedGroup, ssd });
  const router = useRouter();
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [selectedUnit, setSelectedUnit] = useState<LaximoUnit | null>(null);

  const handleDetailClick = (detail: any) => {
    const articleNumber = detail.oem;
    
    console.log('🔍 Клик по детали из QuickGroups для выбора бренда:', { articleNumber, name: detail.name });
    setSelectedDetail(detail);
    setIsBrandModalOpen(true);
  };

  const handleCloseBrandModal = () => {
    setIsBrandModalOpen(false);
    setSelectedDetail(null);
  };

  const toggleUnitExpansion = (unitId: string) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId);
    } else {
      newExpanded.add(unitId);
    }
    setExpandedUnits(newExpanded);
  };

  const handleUnitClick = (unit: LaximoUnit) => {
    // ИСПРАВЛЕНИЕ: Сохраняем SSD узла из API ответа
    console.log('🔍 handleUnitClick - сохраняем узел с SSD:', {
      unitId: unit.unitid,
      unitName: unit.name,
      unitSsd: unit.ssd ? `${unit.ssd.substring(0, 50)}...` : 'отсутствует',
      unitSsdLength: unit.ssd?.length
    });
    
    setSelectedUnit(unit); // Сохраняем полный объект узла с его SSD
  };

  const handleBackFromUnit = () => {
    setSelectedUnit(null);
  };

  const { data: quickDetailData, loading: quickDetailLoading, error: quickDetailError } = useQuery<{ laximoQuickDetail: LaximoQuickDetail }>(
    GET_LAXIMO_QUICK_DETAIL,
    {
      variables: selectedGroup?.quickgroupid ? {
        catalogCode,
        vehicleId,
        quickGroupId: selectedGroup.quickgroupid,
        ssd
      } : undefined,
      skip: !catalogCode || vehicleId === undefined || vehicleId === null || !selectedGroup?.quickgroupid || !ssd || ssd.trim() === '',
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network' // Принудительно запрашиваем данные
    }
  );

  const quickDetail = quickDetailData?.laximoQuickDetail;

  // Добавляем отладочную информацию
  console.log('🔍 QuickDetailSection Debug:', {
    catalogCode,
    vehicleId,
    vehicleIdType: typeof vehicleId,
    quickGroupId: selectedGroup?.quickgroupid,
    quickGroupIdType: typeof selectedGroup?.quickgroupid,
    ssd: ssd ? `${ssd.substring(0, 30)}...` : 'отсутствует',
    ssdType: typeof ssd,
    ssdLength: ssd?.length,
    hasData: !!quickDetailData,
    hasQuickDetail: !!quickDetail,
    unitsCount: quickDetail?.units?.length || 0,
    loading: quickDetailLoading,
    error: quickDetailError?.message,
    skipCondition: !catalogCode || vehicleId === undefined || vehicleId === null || !selectedGroup?.quickgroupid || !ssd,
    skipDetails: {
      noCatalogCode: !catalogCode,
      noVehicleId: vehicleId === undefined || vehicleId === null,
      noQuickGroupId: !selectedGroup?.quickgroupid,
      noSsd: !ssd
    }
  });

  // Если выбран узел для детального просмотра, показываем UnitDetailsSection
  if (selectedUnit) {
    // ИСПРАВЛЕНИЕ: Используем SSD узла из API ответа, а не родительский SSD
    // API Laximo возвращает для каждого узла свой собственный SSD
    console.log('🔍 QuickDetailSection передает в UnitDetailsSection:', {
      parentSsd: ssd ? `${ssd.substring(0, 50)}...` : 'отсутствует',
      parentSsdLength: ssd?.length,
      selectedUnitSsd: selectedUnit.ssd ? `${selectedUnit.ssd.substring(0, 50)}...` : 'отсутствует',
      selectedUnitSsdLength: selectedUnit.ssd?.length,
      unitId: selectedUnit.unitid,
      unitName: selectedUnit.name,
      note: 'Используем SSD УЗЛА из API ответа'
    });
    
    return (
      <UnitDetailsSection
        catalogCode={catalogCode}
        vehicleId={vehicleId}
        ssd={selectedUnit.ssd || ssd}  // Используем SSD узла, fallback на родительский SSD
        unitId={selectedUnit.unitid}
        unitName={selectedUnit.name}
        onBack={handleBackFromUnit}
      />
    );
  }

  if (quickDetailLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Назад к группам</span>
          </button>
        </div>
        
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Загружаем детали...</p>
        </div>
      </div>
    );
  }

  if (quickDetailError) {
    console.error('🚨 QuickDetailSection Error Details:', {
      message: quickDetailError.message,
      graphQLErrors: quickDetailError.graphQLErrors,
      networkError: quickDetailError.networkError,
      extraInfo: quickDetailError.extraInfo,
      selectedGroup: selectedGroup,
      variables: selectedGroup?.quickgroupid ? {
        catalogCode,
        vehicleId,
        quickGroupId: selectedGroup.quickgroupid,
        ssd
      } : 'undefined (no variables sent)'
    });

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Назад к группам</span>
          </button>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-600 mb-2">Ошибка загрузки деталей</h3>
          <p className="text-red-700">Не удалось загрузить детали для группы "{selectedGroup.name}"</p>
          <p className="text-sm text-red-600 mt-2">Ошибка: {quickDetailError.message}</p>
          
          {/* Отладочная информация */}
          <details className="mt-4">
            <summary className="text-sm text-red-700 cursor-pointer hover:text-red-800">
              🔧 Показать отладочную информацию
            </summary>
            <div className="mt-2 p-3 bg-red-100 rounded text-xs">
              <div><strong>Catalog Code:</strong> {catalogCode}</div>
              <div><strong>Vehicle ID:</strong> {vehicleId} (type: {typeof vehicleId})</div>
              <div><strong>Quick Group ID:</strong> {selectedGroup?.quickgroupid} (type: {typeof selectedGroup?.quickgroupid})</div>
              <div><strong>SSD:</strong> {ssd ? `${ssd.substring(0, 100)}...` : 'отсутствует'} (length: {ssd?.length})</div>
              <div className="mt-2">
                <strong>GraphQL Errors:</strong>
                <pre className="mt-1 text-xs overflow-auto">
                  {JSON.stringify(quickDetailError.graphQLErrors, null, 2)}
                </pre>
              </div>
              {quickDetailError.networkError && (
                <div className="mt-2">
                  <strong>Network Error:</strong>
                  <pre className="mt-1 text-xs overflow-auto">
                    {JSON.stringify(quickDetailError.networkError, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Навигация */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Назад к группам</span>
        </button>
        
        <div className="text-sm text-gray-500">
          Группа: {selectedGroup.quickgroupid}
        </div>
      </div>

      {/* Заголовок */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {selectedGroup.name}
        </h2>
        <p className="text-gray-600">
          Детали и узлы в группе быстрого поиска
        </p>
      </div>

      {/* Детали */}
      {quickDetail && quickDetail.units ? (
        <div className="space-y-4">
          {quickDetail.units.map((unit) => (
            <div key={unit.unitid} className="bg-white rounded-lg border p-6">
              <div className="flex items-start space-x-6 mb-4">
                {/* Изображение узла */}
                {(unit.imageurl || unit.largeimageurl) && (() => {
                  const finalImageUrl = unit.largeimageurl ? unit.largeimageurl.replace('%size%', '250') : unit.imageurl?.replace('%size%', '250') || '';
                  console.log('🖼️ Загружаем изображение:', finalImageUrl);
                  console.log('🔍 Raw URLs:', { imageurl: unit.imageurl, largeimageurl: unit.largeimageurl });
                  
                  return (
                    <div className="flex-shrink-0">
                      <div className="text-xs text-gray-500 mb-2 p-2 bg-yellow-100 rounded">
                        Debug: {finalImageUrl}
                      </div>
                      <img 
                        src={finalImageUrl}
                        alt={unit.name}
                        className="w-48 h-48 object-contain bg-gray-50 rounded-lg border border-gray-200 hover:border-red-300 transition-colors cursor-pointer"
                        onLoad={() => {
                          console.log('✅ Изображение загружено успешно:', finalImageUrl);
                        }}
                        onError={(e) => {
                          console.error('❌ Ошибка загрузки изображения:', finalImageUrl);
                          console.error('❌ Event:', e);
                          const img = e.target as HTMLImageElement;
                          img.style.border = '2px solid red';
                          img.alt = 'Ошибка загрузки';
                        }}
                        onClick={() => {
                          // Открываем изображение в новой вкладке
                          const imageUrl = unit.largeimageurl ? unit.largeimageurl.replace('%size%', '400') : unit.imageurl?.replace('%size%', '400') || '';
                          if (imageUrl) {
                            window.open(imageUrl, '_blank');
                          }
                        }}
                      />
                    </div>
                  );
                })()}
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <button
                      onClick={() => toggleUnitExpansion(unit.unitid)}
                      className="flex-1 text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            {unit.name}
                            {unit.details && unit.details.length > 0 && (
                              <svg 
                                className={`w-5 h-5 ml-2 transform transition-transform ${
                                  expandedUnits.has(unit.unitid) ? 'rotate-90' : ''
                                }`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </h3>
                          {unit.code && (
                            <p className="text-sm text-gray-500">Код: {unit.code}</p>
                          )}
                          {unit.details && unit.details.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              {unit.details.length} деталей • Нажмите для {expandedUnits.has(unit.unitid) ? 'скрытия' : 'показа'}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col space-y-2">
                          {unit.unitid && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              ID: {unit.unitid}
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Предотвращаем всплытие события
                              handleUnitClick(unit);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            Подробнее
                          </button>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {unit.details && unit.details.length > 0 && expandedUnits.has(unit.unitid) && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Детали узла "{unit.name}":</h4>
                  <div className="space-y-3">
                    {unit.details.map((detail) => (
                      <div key={detail.detailid} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-red-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 mb-2">{detail.name}</h5>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">OEM:</span> 
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono ml-2">
                                  {detail.oem}
                                </span>
                              </p>
                              {detail.brand && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Бренд:</span> 
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium ml-2">
                                    {detail.brand}
                                  </span>
                                </p>
                              )}
                              {detail.note && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Примечание:</span> {detail.note}
                                </p>
                              )}
                            </div>
                            
                            {detail.attributes && detail.attributes.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {detail.attributes.map((attr, index) => (
                                  <p key={index} className="text-xs text-gray-500">
                                    <span className="font-medium">{attr.name || attr.key}:</span> {attr.value}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col space-y-2 ml-4">
                            <button
                              onClick={() => handleDetailClick(detail)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                              Найти предложения
                            </button>
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-800 text-center">
                              {detail.detailid}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8v2m0 6v2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Нет доступных деталей</h3>
          <p className="mt-1 text-sm text-gray-500">
            В данной группе не найдено деталей или узлов.
          </p>
        </div>
      )}
      
      {selectedDetail && (
        <BrandSelectionModal
          isOpen={isBrandModalOpen}
          onClose={handleCloseBrandModal}
          articleNumber={selectedDetail.oem}
          detailName={selectedDetail.name}
        />
      )}
    </div>
  );
};

const QuickGroupsSection: React.FC<QuickGroupsSectionProps> = ({
  catalogCode,
  vehicleId,
  ssd
}) => {
  const [selectedGroup, setSelectedGroup] = useState<LaximoQuickGroup | null>(null);

  // Получаем список групп быстрого поиска
  const { data: quickGroupsData, loading: quickGroupsLoading, error: quickGroupsError } = useQuery<{ laximoQuickGroups: LaximoQuickGroup[] }>(
    GET_LAXIMO_QUICK_GROUPS,
    {
      variables: { 
        catalogCode,
        vehicleId,
        ...(ssd && ssd.trim() !== '' && { ssd })
      },
      skip: !catalogCode || vehicleId === undefined || vehicleId === null,
      errorPolicy: 'all'
    }
  );

  const handleGroupClick = (group: LaximoQuickGroup) => {
    if (!ssd || ssd.trim() === '') {
      alert('Ошибка: Для поиска деталей необходимы данные автомобиля (SSD). Пожалуйста, выберите автомобиль заново.');
      return;
    }
    
    console.log('🔍 Открываем детали группы быстрого поиска:', group.quickgroupid);
    setSelectedGroup(group);
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
  };

  // Если выбрана группа для просмотра деталей
  if (selectedGroup && ssd) {
    return (
      <QuickDetailSection
        catalogCode={catalogCode}
        vehicleId={vehicleId}
        selectedGroup={selectedGroup}
        ssd={ssd}
        onBack={handleBackToGroups}
      />
    );
  }

  if (quickGroupsLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg border p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quickGroupsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Ошибка загрузки групп быстрого поиска
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Не удалось загрузить группы быстрого поиска для данного автомобиля.</p>
              <p className="mt-1">Ошибка: {quickGroupsError.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const quickGroups = quickGroupsData?.laximoQuickGroups || [];

  if (quickGroups.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Группы быстрого поиска недоступны</h3>
        <p className="mt-1 text-sm text-gray-500">
          Для данного автомобиля не найдено групп быстрого поиска.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Группы быстрого поиска
        </h2>
        <p className="text-gray-600 text-sm">
          Выберите группу для поиска запчастей. Доступны только группы с активным поиском деталей.
        </p>
      </div>

      <div className="space-y-3">
        {quickGroups.map((group) => (
          <QuickGroupItem
            key={group.quickgroupid}
            group={group}
            level={0}
            onGroupClick={handleGroupClick}
          />
        ))}
      </div>

      {/* Информационная панель */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Информация о группах быстрого поиска
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Зеленая метка "Доступен поиск" указывает на возможность поиска деталей в группе</li>
                <li>Группы без метки служат для организации структуры каталога</li>
                <li>Нажмите на группу с активным поиском для просмотра деталей</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickGroupsSection; 