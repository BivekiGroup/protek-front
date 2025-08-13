import React, { useRef, useState } from "react";
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { GET_LAXIMO_UNIT_INFO, GET_LAXIMO_UNIT_IMAGE_MAP } from '@/lib/graphql';
import BrandSelectionModal from '../BrandSelectionModal';

interface KnotInProps {
  catalogCode?: string;
  vehicleId?: string;
  ssd?: string;
  unitId?: string;
  unitName?: string;
  parts?: Array<{
    detailid?: string;
    codeonimage?: string | number;
    oem?: string;
    name?: string;
    price?: string | number;
    brand?: string;
    availability?: string;
    note?: string;
    attributes?: Array<{ key: string; name?: string; value: string }>;
  }>;
  onPartSelect?: (codeOnImage: string | number | null) => void; // Коллбек для уведомления KnotParts о выделении детали
  onPartsHighlight?: (codeOnImage: string | number | null) => void; // Коллбек для подсветки при hover
  selectedParts?: Set<string | number>; // Выбранные детали (множественный выбор)
}

// Функция для корректного формирования URL изображения
const getImageUrl = (baseUrl: string, size: string) => {
  if (!baseUrl) return '';
  return baseUrl
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace('%size%', size);
};

const KnotIn: React.FC<KnotInProps> = ({ 
  catalogCode, 
  vehicleId, 
  ssd, 
  unitId, 
  unitName, 
  parts,
  onPartSelect,
  onPartsHighlight,
  selectedParts = new Set()
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageScale, setImageScale] = useState({ x: 1, y: 1 });
  const selectedImageSize = 'source';
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<{ oem: string; name: string } | null>(null);
  const [hoveredCodeOnImage, setHoveredCodeOnImage] = useState<string | number | null>(null);
  const router = useRouter();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Получаем инфо об узле (для картинки)
  console.log('🔍 KnotIn - GET_LAXIMO_UNIT_INFO запрос:', {
    catalogCode,
    vehicleId,
    unitId,
    ssd: ssd ? `${ssd.substring(0, 50)}...` : 'отсутствует',
    ssdLength: ssd?.length,
    skipCondition: !catalogCode || !vehicleId || !unitId || !ssd || ssd.trim() === ''
  });
  
  const { data: unitInfoData, loading: unitInfoLoading, error: unitInfoError } = useQuery(
    GET_LAXIMO_UNIT_INFO,
    {
      variables: { 
        catalogCode, 
        vehicleId, 
        unitId, 
        ssd 
      },
      skip: !catalogCode || !vehicleId || !unitId || !ssd || ssd.trim() === '',
      errorPolicy: 'all',
    }
  );
  
  // Получаем карту координат
  console.log('🔍 KnotIn - GET_LAXIMO_UNIT_IMAGE_MAP запрос:', {
    catalogCode,
    vehicleId,
    unitId,
    ssd: ssd ? `${ssd.substring(0, 50)}...` : 'отсутствует',
    ssdLength: ssd?.length,
    skipCondition: !catalogCode || !vehicleId || !unitId || !ssd || ssd.trim() === ''
  });
  
  const { data: imageMapData, loading: imageMapLoading, error: imageMapError } = useQuery(
    GET_LAXIMO_UNIT_IMAGE_MAP,
    {
      variables: { 
        catalogCode, 
        vehicleId, 
        unitId, 
        ssd 
      },
      skip: !catalogCode || !vehicleId || !unitId || !ssd || ssd.trim() === '',
      errorPolicy: 'all',
    }
  );

  // Если нет необходимых данных, показываем заглушку
  if (!catalogCode || !vehicleId || !unitId || !ssd || ssd.trim() === '') {
    console.log('⚠️ KnotIn: отсутствуют необходимые данные:', {
      catalogCode: !!catalogCode,
      vehicleId: !!vehicleId,
      unitId: !!unitId,
      ssd: !!ssd,
      ssdValid: ssd ? ssd.trim() !== '' : false
    });
    
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-lg font-medium mb-2">Схема узла</div>
        <div className="text-sm">Выберите узел для отображения схемы</div>
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-red-500 mt-2">
            Debug: catalogCode={catalogCode}, vehicleId={vehicleId}, unitId={unitId}, ssd={ssd ? 'есть' : 'нет'}
          </div>
        )}
      </div>
    );
  }

  const unitInfo = unitInfoData?.laximoUnitInfo;
  const coordinates = imageMapData?.laximoUnitImageMap?.coordinates || [];
  const imageUrl = unitInfo?.imageurl ? getImageUrl(unitInfo.imageurl, selectedImageSize) : '';

  // Логируем успешную загрузку данных
  React.useEffect(() => {
    if (unitInfo) {
      console.log('✅ KnotIn: данные узла загружены:', {
        unitName: unitInfo.name,
        hasImage: !!unitInfo.imageurl,
        imageUrl: unitInfo.imageurl,
        processedImageUrl: imageUrl
      });
    }
  }, [unitInfo, imageUrl]);

  React.useEffect(() => {
    if (coordinates.length > 0) {
      console.log('✅ KnotIn: координаты карты загружены:', {
        coordinatesCount: coordinates.length,
        firstCoordinate: coordinates[0]
      });
    } else if (imageMapData) {
      console.log('⚠️ KnotIn: карта изображений загружена, но координаты пустые:', imageMapData);
    }
  }, [coordinates, imageMapData]);

  // Масштабируем точки после загрузки картинки
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img.naturalWidth || !img.naturalHeight) return;
    setImageScale({
      x: img.offsetWidth / img.naturalWidth,
      y: img.offsetHeight / img.naturalHeight,
    });
  };

  // Обработчик клика по картинке (zoom)
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    // Если клик был по точке, не открываем модалку (точки выше по z-index)
    setIsImageModalOpen(true);
  };

  // Обработчик наведения на точку
  const handlePointHover = (coord: any) => {
    // Попробуем использовать разные поля для связи
    const identifierToUse = coord.detailid || coord.codeonimage || coord.code;
    
    console.log('🔍 KnotIn - hover на точку:', {
      coord,
      detailid: coord.detailid,
      codeonimage: coord.codeonimage,
      code: coord.code,
      identifierToUse,
      type: typeof identifierToUse,
      coordinatesLength: coordinates.length,
      partsLength: parts?.length || 0,
      firstCoord: coordinates[0],
      firstPart: parts?.[0]
    });
    
    setHoveredCodeOnImage(identifierToUse);
    if (onPartsHighlight) {
      onPartsHighlight(identifierToUse);
    }
  };

  // Клик по точке: выделить в списке деталей
  const handlePointClick = (coord: any) => {
    if (!parts) return;
    
    const identifierToUse = coord.detailid || coord.codeonimage || coord.code;
    console.log('Клик по точке:', identifierToUse, 'Координата:', coord, 'Все детали:', parts);
    
    // Уведомляем родительский компонент о выборе детали для выделения в списке
    if (onPartSelect) {
      onPartSelect(identifierToUse);
    }
  };

  // Двойной клик по точке: переход на страницу выбора бренда
  const handlePointDoubleClick = (coord: any) => {
    if (!parts) return;
    
    const identifierToUse = coord.detailid || coord.codeonimage || coord.code;
    console.log('Двойной клик по точке:', identifierToUse, 'Координата:', coord);
    
    const part = parts.find(
      (p) =>
        (p.detailid && p.detailid.toString() === identifierToUse?.toString()) ||
        (p.codeonimage && p.codeonimage.toString() === identifierToUse?.toString())
    );
    
    if (part?.oem) {
      // Переходим на страницу выбора бренда вместо модального окна
      const url = `/vehicle-search/${catalogCode}/${vehicleId}/part/${part.oem}/brands?detailName=${encodeURIComponent(part.name || '')}`;
      router.push(url);
    } else {
      console.warn('Нет артикула (oem) для выбранной точки:', identifierToUse, part);
    }
  };

  // Для отладки: вывести детали и координаты
  React.useEffect(() => {
    console.log('KnotIn parts:', parts);
    console.log('KnotIn coordinates:', coordinates);
    if (coordinates.length > 0) {
      console.log('🔍 Первые 5 координат:', coordinates.slice(0, 5).map((c: any) => ({
        code: c.code,
        codeonimage: c.codeonimage, 
        detailid: c.detailid,
        x: c.x, 
        y: c.y
      })));
    }
    if (parts && parts.length > 0) {
      console.log('🔍 Первые 5 деталей:', parts.slice(0, 5).map(p => ({
        name: p.name,
        codeonimage: p.codeonimage,
        detailid: p.detailid,
        oem: p.oem
      })));
    }
    
    // Попытка связать координаты с деталями
    if (coordinates.length > 0 && parts && parts.length > 0) {
      console.log('🔗 Попытка связать координаты с деталями:');
      coordinates.forEach((coord: any, idx: number) => {
        const matchingPart = parts.find(part => 
          part.detailid === coord.detailid || 
          part.codeonimage === coord.codeonimage ||
          part.codeonimage === coord.code
        );
        if (matchingPart) {
          console.log(`  ✅ Координата ${idx}: detailid=${coord.detailid}, codeonimage=${coord.codeonimage} -> Деталь: ${matchingPart.name}`);
        } else {
          console.log(`  ❌ Координата ${idx}: detailid=${coord.detailid}, codeonimage=${coord.codeonimage} -> НЕ НАЙДЕНА`);
        }
      });
    }
  }, [parts, coordinates]);

  if (unitInfoLoading || imageMapLoading) {
    console.log('🔄 KnotIn: загрузка данных...', {
      unitInfoLoading,
      imageMapLoading,
      unitInfoError: unitInfoError?.message,
      imageMapError: imageMapError?.message
    });
    return <div className="text-center py-8 text-gray-500">Загружаем схему узла...</div>;
  }
  
  if (unitInfoError) {
    console.error('❌ KnotIn: ошибка загрузки информации об узле:', unitInfoError);
    return (
      <div className="text-center py-8 text-red-600">
        Ошибка загрузки схемы: {unitInfoError.message}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs mt-2 text-gray-500">
            GraphQL Error: {JSON.stringify(unitInfoError, null, 2)}
          </div>
        )}
      </div>
    );
  }
  
  if (imageMapError) {
    console.error('❌ KnotIn: ошибка загрузки карты изображений:', imageMapError);
  }
  
  if (!imageUrl) {
    console.log('⚠️ KnotIn: нет URL изображения:', {
      unitInfo: !!unitInfo,
      imageurl: unitInfo?.imageurl,
      unitInfoData: !!unitInfoData
    });
    return (
      <div className="text-center py-8 text-gray-400">
        Нет изображения для этого узла
        {process.env.NODE_ENV === 'development' && unitInfo && (
          <div className="text-xs mt-2 text-gray-500">
            Debug: unitInfo.imageurl = {unitInfo.imageurl || 'отсутствует'}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="relative inline-block">
        <img
          ref={imgRef}
          src={imageUrl}
          loading="lazy"
          alt={unitName || unitInfo?.name || "Изображение узла"}
          onLoad={handleImageLoad}
          className="max-w-full h-auto mx-auto rounded cursor-zoom-in"
          style={{ maxWidth: 400, display: 'block' }}
          onClick={handleImageClick}
        />
        {/* Точки/области */}
        {coordinates.map((coord: any, idx: number) => {
          // Кружки всегда 32x32px, центрируем по координате
          const size = 22;
          const scaledX = coord.x * imageScale.x - size / 2;
          const scaledY = coord.y * imageScale.y - size / 2;
          
          // Используем code или codeonimage в зависимости от структуры данных
          const codeValue = coord.code || coord.codeonimage;
          
          // Определяем состояние точки
          const isSelected = selectedParts.has(codeValue);
          const isHovered = hoveredCodeOnImage === codeValue;
          
          // Определяем цвета на основе состояния
          let backgroundColor = '#B7CAE2'; // Базовый цвет
          let textColor = '#000';
          
          if (isSelected) {
            backgroundColor = '#22C55E'; // Зеленый для выбранных
            textColor = '#fff';
          } else if (isHovered) {
            backgroundColor = '#EC1C24'; // Красный при наведении
            textColor = '#fff';
          }
          
          return (
            <div
              key={`coord-${unitId}-${idx}-${coord.x}-${coord.y}`}
              tabIndex={0}
              aria-label={`Деталь ${codeValue}`}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') handlePointClick(coord);
              }}
              className="absolute flex items-center justify-center cursor-pointer transition-all duration-200 ease-in-out"
              style={{
                left: scaledX,
                top: scaledY,
                width: size,
                height: size,
                backgroundColor,
                borderRadius: '50%',
                border: isSelected ? '2px solid #16A34A' : 'none',
                transform: isHovered || isSelected ? 'scale(1.1)' : 'scale(1)',
                zIndex: isHovered || isSelected ? 10 : 1,
                pointerEvents: 'auto',
              }}
              title={`${codeValue} (Клик - выделить в списке, двойной клик - перейти к выбору бренда)`}
              onClick={e => { e.stopPropagation(); handlePointClick(coord); }}
              onDoubleClick={e => { e.stopPropagation(); handlePointDoubleClick(coord); }}
              onMouseEnter={() => handlePointHover(coord)}
              onMouseLeave={() => {
                setHoveredCodeOnImage(null);
                if (onPartsHighlight) {
                  onPartsHighlight(null);
                }
              }}
            >
              <span 
                className="flex items-center justify-center w-full h-full text-sm font-bold select-none pointer-events-none transition-colors duration-200" 
                style={{ color: textColor }}
              >
                {codeValue}
              </span>
            </div>
          );
        })}
      </div>
      {/* Модалка увеличенного изображения */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 bg-opacity-70"
          onClick={() => setIsImageModalOpen(false)}
          style={{ cursor: 'zoom-out' }}
        >
          <div className="relative">
            <img
              src={imageUrl}
              alt={unitName || unitInfo?.name || "Изображение узла"}
              className="max-h-[90vh] max-w-[90vw] rounded shadow-lg"
              onClick={e => e.stopPropagation()}
              style={{ background: '#fff' }}
            />
            {/* Убираем интерактивные точки в модальном окне */}
          </div>
          <button
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-4 right-4 text-white text-3xl font-bold bg-black bg-opacity-40 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black hover:bg-opacity-60 transition-colors"
            aria-label="Закрыть"
            style={{ zIndex: 10000 }}
          >
            ×
          </button>
        </div>
      )}
      {/* Модалка выбора бренда */}
      <BrandSelectionModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        articleNumber={selectedDetail?.oem || ''}
        detailName={selectedDetail?.name || ''}
      />
    </>
  );
};

export default KnotIn; 