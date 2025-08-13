import React from 'react';
import { useRouter } from 'next/router';
import { LaximoVehicleSearchResult, LaximoCatalogInfo } from '@/types/laximo';

interface VehicleSearchResultsProps {
  results: LaximoVehicleSearchResult[];
  catalogInfo: LaximoCatalogInfo;
}

const VehicleSearchResults: React.FC<VehicleSearchResultsProps> = ({
  results,
  catalogInfo
}) => {
  const router = useRouter();

  const handleSelectVehicle = (vehicle: LaximoVehicleSearchResult) => {
    console.log('🚗 handleSelectVehicle вызвана для:', vehicle);
    
    // Формируем SSD из данных vehicle или берем из router query
    const routerSsd = Array.isArray(router.query.ssd) ? router.query.ssd[0] : router.query.ssd;
    const ssd = vehicle.ssd || routerSsd || '';
    const brand = router.query.brand || catalogInfo.code;
    
    console.log('🚗 Selected vehicle:', vehicle);
    console.log('🔧 Vehicle SSD:', vehicle.ssd ? `${vehicle.ssd.substring(0, 50)}...` : 'отсутствует');
    console.log('🔧 Router SSD:', routerSsd ? `${routerSsd.substring(0, 50)}...` : 'отсутствует');
    console.log('🔧 Final SSD to pass:', ssd ? `${ssd.substring(0, 50)}...` : 'отсутствует');
    console.log('🔧 SSD length:', ssd.length);
    console.log('🔧 Brand для навигации:', brand);
    console.log('🔧 Vehicle ID:', vehicle.vehicleid);
    
    // Переходим на страницу автомобиля с SSD
    if (ssd && ssd.trim() !== '') {
      // Всегда используем localStorage для SSD, так как VW SSD очень длинные
      console.log('💾 Сохраняем SSD в localStorage для безопасной передачи');
      const vehicleKey = `vehicle_ssd_${brand}_${vehicle.vehicleid}`;
      console.log('💾 Ключ localStorage:', vehicleKey);
      localStorage.setItem(vehicleKey, ssd);
      console.log('💾 SSD сохранен в localStorage');
      
      const targetUrl = `/vehicle-search/${brand}/${vehicle.vehicleid}?use_storage=1&ssd_length=${ssd.length}`;
      console.log('🔗 Переходим по URL:', targetUrl);
      router.push(targetUrl);
    } else {
      console.log('⚠️ SSD отсутствует, переходим без него');
      router.push(`/vehicle-search/${brand}/${vehicle.vehicleid}`);
    }
  };

  // Функция для условного отображения атрибута
  const renderAttribute = (label: string, value: string | undefined) => {
    if (!value || value === '' || value === 'undefined') return null
    return (
      <div className="flex justify-between py-1 border-b border-gray-100">
        <span className="text-sm text-gray-600 font-medium">{label}:</span>
        <span className="text-sm text-gray-900">{value}</span>
      </div>
    )
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Найдено автомобилей: {results.length}
      </h3>
      
      <div className="flex flex-wrap flex-1 gap-5 size-full max-md:max-w-full">
        {results.map((vehicle, index) => (
          <div
            key={`${vehicle.vehicleid}-${index}`}
           className="flex flex-col flex-1 shrink p-8 bg-white rounded-lg border border-solid basis-0 border-stone-300 max-w-[504px] md:min-w-[370px] sm:min-w-[340px] min-w-[200px] max-md:px-5 cursor-pointer transition-shadow hover:shadow-lg"
            onClick={() => handleSelectVehicle(vehicle)}
          >
            {/* Заголовок автомобиля */}
            <div className="">
              <h4 className="text-lg font-semibold text-red-600 mb-1 truncate">
                {vehicle.name || `${vehicle.brand} ${vehicle.model}`}
              </h4>
              {/* <p className="text-sm text-gray-500 truncate">
                {vehicle.modification} ({vehicle.year})
              </p> */}
            </div>

            {/* Основные характеристики */}
            <div className="space-y-1 mb-4">
              <h5 className="text-base font-semibold text-gray-900 mb-2">Основные характеристики</h5>
              {renderAttribute('Марка', vehicle.brand)}
              {renderAttribute('Модель', vehicle.model)}
              {renderAttribute('Двигатель', vehicle.engine)}
            </div>

            {/* Все атрибуты из API */}
            {vehicle.attributes && vehicle.attributes.length > 0 && (
              <div className="space-y-1 mb-4">
                <h5 className="text-base font-semibold text-gray-900 mb-2">Дополнительные характеристики</h5>
                {vehicle.attributes.map((attr, attrIndex) => (
                  <div key={attrIndex} className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium">{attr.name || attr.key}:</span>
                    <span className="text-sm text-gray-900">{attr.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Технические характеристики (fallback для старых данных) */}
            {(!vehicle.attributes || vehicle.attributes.length === 0) && (
              <>
                <div className="space-y-1 mb-4">
                  <h5 className="text-base font-semibold text-gray-900 mb-2">Дополнительные характеристики</h5>
                  {renderAttribute('Год', vehicle.year)}
                  {renderAttribute('Кузов', vehicle.bodytype)}
                  {renderAttribute('Трансмиссия', vehicle.transmission)}
                  {renderAttribute('Класс', vehicle.grade)}
                  {renderAttribute('Цвет кузова', vehicle.framecolor)}
                  {renderAttribute('Цвет салона', vehicle.trimcolor)}
                  {renderAttribute('Рынок', vehicle.market)}
                  {renderAttribute('Регион производства', vehicle.creationregion)}
                  {renderAttribute('Регион назначения', vehicle.destinationregion)}
                </div>

                <div className="space-y-1 mb-4">
                  <h5 className="text-base font-semibold text-gray-900 mb-2">Технические характеристики</h5>
                  {renderAttribute('Информация о двигателе', vehicle.engine_info)}
                  {renderAttribute('Номер двигателя', vehicle.engineno)}
                  {renderAttribute('Дата производства', vehicle.date)}
                  {renderAttribute('Произведен', vehicle.manufactured)}
                  {renderAttribute('Период производства', vehicle.prodPeriod)}
                  {renderAttribute('Диапазон производства', vehicle.prodRange)}
                </div>

                <div className="space-y-1 mb-4">
                  <h5 className="text-base font-semibold text-gray-900 mb-2">Даты и периоды</h5>
                  {renderAttribute('Дата с', vehicle.datefrom)}
                  {renderAttribute('Дата по', vehicle.dateto)}
                  {renderAttribute('Модельный год с', vehicle.modelyearfrom)}
                  {renderAttribute('Модельный год по', vehicle.modelyearto)}
                </div>

                {/* Опции и описание */}
                {(vehicle.options || vehicle.description || vehicle.notes) && (
                  <div className="space-y-1 mb-4">
                    <h5 className="text-base font-semibold text-gray-900 mb-2">Опции и описание</h5>
                    {renderAttribute('Опции', vehicle.options)}
                    {renderAttribute('Описание', vehicle.description)}
                    {renderAttribute('Примечания', vehicle.notes)}
                  </div>
                )}
              </>
            )}

            {/* Системная информация */}

          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleSearchResults; 