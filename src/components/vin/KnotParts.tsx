  import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

interface KnotPartsProps {
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
  selectedCodeOnImage?: string | number;
  catalogCode?: string;
  vehicleId?: string;
  highlightedCodeOnImage?: string | number | null; // Деталь подсвеченная при hover на изображении
  selectedParts?: Set<string | number>; // Выбранные детали (множественный выбор)
  onPartSelect?: (codeOnImage: string | number | null) => void; // Коллбек для выбора детали
  onPartHover?: (codeOnImage: string | number | null) => void; // Коллбек для подсветки при hover
}

const KnotParts: React.FC<KnotPartsProps> = ({ 
  parts = [], 
  selectedCodeOnImage, 
  catalogCode, 
  vehicleId,
  highlightedCodeOnImage,
  selectedParts = new Set(),
  onPartSelect,
  onPartHover
}) => {
  const router = useRouter();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipPart, setTooltipPart] = useState<any>(null);
  const [clickedPart, setClickedPart] = useState<string | number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Отладочные логи для проверки данных
  React.useEffect(() => {
    console.log('🔍 KnotParts получил данные:', {
      partsCount: parts.length,
      firstPart: parts[0],
      firstPartAttributes: parts[0]?.attributes?.length || 0,
      allPartsWithAttributes: parts.map(part => ({
        name: part.name,
        oem: part.oem,
        attributesCount: part.attributes?.length || 0,
        attributes: part.attributes
      }))
    });
  }, [parts]);

  const handlePriceClick = (part: any) => {
    if (part.oem && catalogCode && vehicleId !== undefined) {
      // Переходим на страницу выбора бренда
      const url = `/vehicle-search/${catalogCode}/${vehicleId}/part/${part.oem}/brands?detailName=${encodeURIComponent(part.name || '')}`;
      router.push(url);
    }
  };

  // Обработчик клика по детали в списке
  const handlePartClick = (part: any) => {
    const codeOnImage = part.codeonimage || part.detailid;
    if (codeOnImage && onPartSelect) {
      onPartSelect(codeOnImage);
    }
    
    // Также подсвечиваем деталь на схеме при клике
    if (codeOnImage && onPartHover) {
      // Очищаем предыдущий таймер, если он есть
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      
      // Устанавливаем состояние кликнутой детали
      setClickedPart(codeOnImage);
      
      // Подсвечиваем на схеме
      onPartHover(codeOnImage);
      
      // Убираем подсветку через интервал
      clickTimeoutRef.current = setTimeout(() => {
        setClickedPart(null);
        if (onPartHover) {
          onPartHover(null);
        }
      }, 1500); // Подсветка будет видна 1.5 секунды
    }
  };

  // Обработчики наведения
  const handlePartMouseEnter = (part: any) => {
    if (part.codeonimage && onPartHover) {
      onPartHover(part.codeonimage);
    }
  };

  const handlePartMouseLeave = () => {
    if (onPartHover) {
      onPartHover(null);
    }
  };

  // Вычисляем позицию tooltip
  const calculateTooltipPosition = (iconElement: HTMLElement) => {
    if (!iconElement) {
      console.error('❌ calculateTooltipPosition: элемент не найден');
      return;
    }
    
    const rect = iconElement.getBoundingClientRect();
    const tooltipWidth = 400;
    const tooltipHeight = 300; // примерная высота
    
    let x = rect.left + rect.width / 2 - tooltipWidth / 2;
    let y = rect.bottom + 8;
    
    // Проверяем, не выходит ли tooltip за границы экрана
    if (x < 10) x = 10;
    if (x + tooltipWidth > window.innerWidth - 10) {
      x = window.innerWidth - tooltipWidth - 10;
    }
    
    // Если tooltip не помещается снизу, показываем сверху
    if (y + tooltipHeight > window.innerHeight - 10) {
      y = rect.top - tooltipHeight - 8;
    }
    
    setTooltipPosition({ x, y });
  };

  const handleInfoIconMouseEnter = (event: React.MouseEvent, part: any) => {
    event.stopPropagation();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Сохраняем ссылку на элемент до setTimeout
    const target = event.currentTarget as HTMLElement;
    
    timeoutRef.current = setTimeout(() => {
      if (target && typeof target.getBoundingClientRect === 'function') {
        calculateTooltipPosition(target);
        setTooltipPart(part);
        setShowTooltip(true);
        console.log('🔍 Показываем тултип для детали:', part.name, 'Атрибуты:', part.attributes?.length || 0);
      } else {
        console.error('❌ handleInfoIconMouseEnter: элемент не поддерживает getBoundingClientRect:', target);
      }
    }, 300); // Задержка 300ms
  };

  const handleInfoIconMouseLeave = (event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
      setTooltipPart(null);
    }, 100); // Небольшая задержка перед скрытием
  };

  // Очищаем таймеры при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  // Если нет деталей, показываем заглушку
  if (!parts || parts.length === 0) {
    return (
      <div className="knot-parts">
        <div className="text-center py-8 text-gray-500">
          <div className="text-lg font-medium mb-2">Список деталей</div>
          <div className="text-sm">Выберите узел для отображения деталей</div>
        </div>
      </div>
    );
  }

  // Эффект для отслеживания изменений подсветки
  useEffect(() => {
    console.log('🔍 KnotParts - подсветка изменилась:', {
      highlightedCodeOnImage,
      highlightedType: typeof highlightedCodeOnImage,
      partsCodeOnImages: parts.map(p => p.codeonimage),
      partsDetailIds: parts.map(p => p.detailid),
      willHighlight: parts.some(part => 
        (part.codeonimage && part.codeonimage.toString() === highlightedCodeOnImage?.toString()) ||
        (part.detailid && part.detailid.toString() === highlightedCodeOnImage?.toString())
      ),
      willHighlightStrict: parts.some(part => 
        part.codeonimage === highlightedCodeOnImage ||
        part.detailid === highlightedCodeOnImage
      ),
      firstPartWithCodeOnImage: parts.find(p => p.codeonimage)
    });
    
    // Детальная информация о всех деталях
    console.log('📋 Все детали с их codeonimage и detailid:');
    parts.forEach((part, idx) => {
      console.log(`  Деталь ${idx}: "${part.name}" codeonimage="${part.codeonimage}" (${typeof part.codeonimage}) detailid="${part.detailid}" (${typeof part.detailid})`);
    });
    
    console.log('🎯 Ищем подсветку для:', `"${highlightedCodeOnImage}" (${typeof highlightedCodeOnImage})`);
  }, [highlightedCodeOnImage, parts]);

  return (
    <>
      {/* Статус выбранных деталей */}
      {/* {selectedParts.size > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-800 font-medium">
              Выбрано деталей: {selectedParts.size}
            </span>
            <span className="text-green-600 text-sm ml-2">
              (Кликните по детали, чтобы убрать из выбранных)
            </span>
          </div>
        </div>
      )} */}
      
      <div className="knot-parts">
        {parts.map((part, idx) => {
          const codeOnImage = part.codeonimage || part.detailid;
          const isHighlighted = highlightedCodeOnImage !== null && highlightedCodeOnImage !== undefined && (
            (part.codeonimage && part.codeonimage.toString() === highlightedCodeOnImage.toString()) ||
            (part.detailid && part.detailid.toString() === highlightedCodeOnImage.toString())
          );
          
          const isSelected = selectedParts.has(part.detailid || part.codeonimage || idx.toString());
          const isClicked = clickedPart !== null && (
            (part.codeonimage && part.codeonimage.toString() === clickedPart.toString()) ||
            (part.detailid && part.detailid.toString() === clickedPart.toString())
          );
          
          // Создаем уникальный ключ
          const uniqueKey = `part-${idx}-${part.detailid || part.oem || part.name || 'unknown'}`;
          
          return (
            <div
              key={uniqueKey}
              className={`w-layout-hflex knotlistitem  rounded-lg cursor-pointer transition-all duration-300 ${
                isSelected 
                  ? 'bg-green-100 border-green-500' 
                  : isClicked
                    ? 'bg-red-100 border-red-400 shadow-md'
                    : isHighlighted 
                      ? 'bg-slate-200' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handlePartClick(part)}
              onMouseEnter={() => handlePartMouseEnter(part)}
              onMouseLeave={handlePartMouseLeave}
              style={{ cursor: 'pointer' }}
            >
              <div className="w-layout-hflex flex-block-116">
                <div 
                  className={`nuberlist ${
                    isSelected 
                      ? 'text-green-700 font-bold' 
                      : isClicked 
                        ? 'text-red-700 font-bold' 
                        : isHighlighted 
                          ? 'font-bold' 
                          : ''
                  }`}
                >
                  {part.codeonimage || idx + 1}
                </div>
                <div className={`oemnuber ${
                  isSelected 
                    ? 'text-green-800 font-semibold' 
                    : isClicked 
                      ? 'text-red-800 font-semibold' 
                      : isHighlighted 
                        ? 'font-semibold' 
                        : ''
                }`}>{part.oem}</div>
              </div>
              <div className={`partsname ${
                isSelected 
                  ? 'text-green-800 font-semibold' 
                  : isClicked 
                    ? 'text-red-800 font-semibold' 
                    : isHighlighted 
                      ? 'font-semibold' 
                      : ''
              }`}>
                {part.name}
              </div>
              <div className="w-layout-hflex flex-block-117">
                <button
                  className="button-3 w-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Предотвращаем срабатывание onClick родительского элемента
                    handlePriceClick(part);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  Цена
                </button>
                <div 
                  className="code-embed-16 w-embed cursor-pointer hover:opacity-70 transition-opacity"
                  onMouseEnter={(e) => handleInfoIconMouseEnter(e, part)}
                  onMouseLeave={handleInfoIconMouseLeave}
                  style={{ cursor: 'pointer' }}
                >
                  <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.1 13.5H9.89999V8.1H8.1V13.5ZM8.99999 6.3C9.25499 6.3 9.46889 6.2136 9.64169 6.0408C9.81449 5.868 9.90059 5.6544 9.89999 5.4C9.89939 5.1456 9.81299 4.932 9.64079 4.7592C9.46859 4.5864 9.25499 4.5 8.99999 4.5C8.745 4.5 8.53139 4.5864 8.35919 4.7592C8.187 4.932 8.1006 5.1456 8.1 5.4C8.0994 5.6544 8.1858 5.8683 8.35919 6.0417C8.53259 6.2151 8.74619 6.3012 8.99999 6.3ZM8.99999 18C7.755 18 6.585 17.7636 5.49 17.2908C4.395 16.818 3.4425 16.1769 2.6325 15.3675C1.8225 14.5581 1.1814 13.6056 0.709201 12.51C0.237001 11.4144 0.000601139 10.2444 1.13924e-06 9C-0.00059886 7.7556 0.235801 6.5856 0.709201 5.49C1.1826 4.3944 1.8237 3.4419 2.6325 2.6325C3.4413 1.8231 4.3938 1.182 5.49 0.7092C6.5862 0.2364 7.7562 0 8.99999 0C10.2438 0 11.4138 0.2364 12.51 0.7092C13.6062 1.182 14.5587 1.8231 15.3675 2.6325C16.1763 3.4419 16.8177 4.3944 17.2917 5.49C17.7657 6.5856 18.0018 7.7556 18 9C17.9982 10.2444 17.7618 11.4144 17.2908 12.51C16.8198 13.6056 16.1787 14.5581 15.3675 15.3675C14.5563 16.1769 13.6038 16.8183 12.51 17.2917C11.4162 17.7651 10.2462 18.0012 8.99999 18Z" fill="currentcolor" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Красивый тултип с информацией о детали */}
      {showTooltip && tooltipPart && (
        <div 
          className="flex overflow-hidden flex-col items-center px-8 py-8 bg-slate-50 shadow-[0px_0px_20px_rgba(0,0,0,0.15)] rounded-2xl w-[350px] min-h-[220px] max-w-full fixed z-[9999]"
          style={{
            position: 'fixed',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            pointerEvents: 'none',
          }}
        >
          <div className="flex relative flex-col w-full">
            {/* Заголовок и OEM */}
            <div className="mb-4">
              <div className="font-semibold text-lg text-black mb-1 truncate">{tooltipPart.name}</div>
              {tooltipPart.oem && (
                <div className="inline-block bg-gray-100 text-gray-700 text-xs font-mono px-2 py-1 rounded mb-1">OEM: {tooltipPart.oem}</div>
              )}
            </div>
            {/* Характеристики */}
            {tooltipPart.attributes && tooltipPart.attributes.length > 0 ? (
              tooltipPart.attributes.map((attr: any, idx: number) => (
                <div key={idx} className="flex gap-5 items-center mt-2 w-full whitespace-normal first:mt-0">
                  <div className="self-stretch my-auto text-gray-400 w-[150px] break-words">
                    {attr.name || attr.key}
                  </div>
                  <div className="self-stretch my-auto font-medium text-black break-words">
                    {attr.value}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center w-full py-8">
                <div className="text-gray-400 mb-2">Дополнительная информация недоступна</div>
              </div>
            )}
            {tooltipPart.note && (
              <div className="flex flex-col mt-6 w-full">
                <div className="text-gray-400 text-xs mb-1">Примечание</div>
                <div className="font-medium text-black text-sm">{tooltipPart.note}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default KnotParts; 