import React, { useState, useEffect, useRef } from "react";
import VehicleAttributesTooltip from './VehicleAttributesTooltip';

interface VehicleAttribute {
  key: string;
  name: string;
  value: string;
}

interface InfoVinProps {
  vehicleName?: string;
  vehicleInfo?: string;
  vehicleAttributes?: VehicleAttribute[];
}

const InfoVin: React.FC<InfoVinProps> = ({ 
  vehicleName = "VIN декодирование", 
  vehicleInfo = "Поиск запчастей по VIN номеру автомобиля",
  vehicleAttributes = []
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  // Отладочный вывод атрибутов
  useEffect(() => {
    if (vehicleAttributes.length > 0) {
      console.log('🚗 Атрибуты автомобиля:', vehicleAttributes);
      console.log('🔍 Ключи атрибутов:', vehicleAttributes.map(attr => ({ key: attr.key, name: attr.name })));
    }
  }, [vehicleAttributes]);

  // Определяем основные параметры для отображения
  const getMainParameters = (attributes: VehicleAttribute[]) => {
    // Приоритетные ключи для основных параметров
    const priorityKeys = [
      // Двигатель
      { 
        keys: ['engine', 'enginetype', 'engine_type', 'двигатель', 'тип двигателя', 'motor'], 
        priority: 1 
      },
      // VIN
      { 
        keys: ['vin', 'вин', 'vin_code'], 
        priority: 2 
      },
      // Год выпуска
      { 
        keys: ['year', 'год', 'год выпуска', 'production_year', 'model_year'], 
        priority: 3 
      },
      // Топливо
      { 
        keys: ['fuel', 'топливо', 'тип топлива', 'fuel_type', 'fueltype'], 
        priority: 4 
      },
      // Коробка передач
      { 
        keys: ['transmission', 'коробка', 'кпп', 'gearbox', 'transmissiontype'], 
        priority: 5 
      }
    ];

    const foundParams: Array<{ attr: VehicleAttribute; priority: number }> = [];

    // Ищем атрибуты по приоритетным ключам
    for (const priorityGroup of priorityKeys) {
      const foundAttr = attributes.find(attr => 
        priorityGroup.keys.some(key => 
          attr.key.toLowerCase().includes(key.toLowerCase()) || 
          attr.name.toLowerCase().includes(key.toLowerCase())
        )
      );
      
      if (foundAttr) {
        foundParams.push({ attr: foundAttr, priority: priorityGroup.priority });
      }
    }

    // Сортируем по приоритету и берем максимум 4 параметра
    foundParams.sort((a, b) => a.priority - b.priority);
    const mainParams = foundParams.slice(0, 4).map(item => item.attr);

    // Если основных параметров меньше 3, добавляем первые доступные
    if (mainParams.length < 3) {
      const additionalParams = attributes
        .filter(attr => !mainParams.includes(attr))
        .slice(0, 3 - mainParams.length);
      return [...mainParams, ...additionalParams];
    }

    return mainParams;
  };

  const mainParameters = getMainParameters(vehicleAttributes);
  const displayText = mainParameters.length > 0 
    ? mainParameters.map(attr => attr.value).join(' · ')
    : vehicleInfo;

  // Отладочный вывод выбранных параметров
  useEffect(() => {
    if (mainParameters.length > 0) {
      console.log('✅ Выбранные основные параметры:', mainParameters);
      console.log('📝 Отображаемый текст:', displayText);
    }
  }, [mainParameters, displayText]);

  // Вычисляем позицию tooltip
  const calculateTooltipPosition = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      const tooltipWidth = 500;
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
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      calculateTooltipPosition();
      setShowTooltip(true);
    }, 300); // Задержка 300ms
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 100); // Небольшая задержка перед скрытием
  };

  // Очищаем таймеры при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <section className="section-info">
        <div className="w-layout-blockcontainer container info w-container">
          <div className="w-layout-vflex flex-block-9">
            <div className="w-layout-hflex flex-block-7">
              <a href="#" className="link-block w-inline-block">
                <div>Главная</div>
              </a>
              <div className="text-block-3">→</div>
              <a href="/brands" className="link-block w-inline-block">
                <div>Оригинальный каталог</div>
              </a>
              <div className="text-block-3">→</div>
              <a href="#" className="link-block-2 w-inline-block">
                <div>{vehicleName}</div>
              </a>
            </div>
            <div className="w-layout-hflex flex-block-8">
              <div className="w-layout-hflex flex-block-10">
                <h1 className="heading">{vehicleName}</h1>
              </div>
            </div>
          </div>
          <div className="w-layout-hflex flex-block-112">
            <div className="text-block-55">{displayText}</div>
            <div className="relative inline-block">
              <div 
                ref={iconRef}
                className="w-embed cursor-pointer hover:opacity-70 transition-opacity"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                role="button"
                tabIndex={0}
                aria-label="Показать полную информацию об автомобиле"
                onFocus={handleMouseEnter}
                onBlur={handleMouseLeave}
              >
                <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.1 13.5H9.89999V8.1H8.1V13.5ZM8.99999 6.3C9.25499 6.3 9.46889 6.2136 9.64169 6.0408C9.81449 5.868 9.90059 5.6544 9.89999 5.4C9.89939 5.1456 9.81299 4.932 9.64079 4.7592C9.46859 4.5864 9.25499 4.5 8.99999 4.5C8.745 4.5 8.53139 4.5864 8.35919 4.7592C8.187 4.932 8.1006 5.1456 8.1 5.4C8.0994 5.6544 8.1858 5.8683 8.35919 6.0417C8.53259 6.2151 8.74619 6.3012 8.99999 6.3ZM8.99999 18C7.755 18 6.585 17.7636 5.49 17.2908C4.395 16.818 3.4425 16.1769 2.6325 15.3675C1.8225 14.5581 1.1814 13.6056 0.709201 12.51C0.237001 11.4144 0.000601139 10.2444 1.13924e-06 9C-0.00059886 7.7556 0.235801 6.5856 0.709201 5.49C1.1826 4.3944 1.8237 3.4419 2.6325 2.6325C3.4413 1.8231 4.3938 1.182 5.49 0.7092C6.5862 0.2364 7.7562 0 8.99999 0C10.2438 0 11.4138 0.2364 12.51 0.7092C13.6062 1.182 14.5587 1.8231 15.3675 2.6325C16.1763 3.4419 16.8177 4.3944 17.2917 5.49C17.7657 6.5856 18.0018 7.7556 18 9C17.9982 10.2444 17.7618 11.4144 17.2908 12.51C16.8198 13.6056 16.1787 14.5581 15.3675 15.3675C14.5563 16.1769 13.6038 16.8183 12.51 17.2917C11.4162 17.7651 10.2462 18.0012 8.99999 18Z" fill="currentcolor" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tooltip с фиксированным позиционированием */}
      <VehicleAttributesTooltip
        show={showTooltip && vehicleAttributes.length > 0}
        position={tooltipPosition}
        vehicleName={vehicleName}
        vehicleAttributes={vehicleAttributes}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    </>
  );
};

export default InfoVin; 