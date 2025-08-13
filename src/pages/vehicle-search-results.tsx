import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useLazyQuery } from '@apollo/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FIND_LAXIMO_VEHICLE, FIND_LAXIMO_VEHICLE_BY_PLATE_GLOBAL } from '@/lib/graphql';
import { LaximoVehicleSearchResult } from '@/types/laximo';
import Link from 'next/link';

interface VehicleSearchResultsPageProps {}

const VehicleSearchResultsPage: React.FC<VehicleSearchResultsPageProps> = () => {
  const router = useRouter();
  const { query: routerQuery } = router;
  const [vehicles, setVehicles] = useState<LaximoVehicleSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'vin' | 'plate' | ''>('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Query для поиска по VIN
  const [findVehicleByVin] = useLazyQuery(FIND_LAXIMO_VEHICLE, {
    onCompleted: (data) => {
      const results = data.laximoFindVehicle || [];
      setVehicles(results);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('❌ Ошибка поиска по VIN:', error);
      setVehicles([]);
      setIsLoading(false);
    }
  });

  // Query для поиска по госномеру
  const [findVehicleByPlate] = useLazyQuery(FIND_LAXIMO_VEHICLE_BY_PLATE_GLOBAL, {
    onCompleted: (data) => {
      const results = data.laximoFindVehicleByPlateGlobal || [];
      setVehicles(results);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('❌ Ошибка поиска по госномеру:', error);
      setVehicles([]);
      setIsLoading(false);
    }
  });

  // Проверяем тип поиска
  const isVinNumber = (query: string): boolean => {
    const cleanQuery = query.trim().toUpperCase();
    return /^[A-HJ-NPR-Z0-9]{17}$/.test(cleanQuery);
  };

  const isPlateNumber = (query: string): boolean => {
    const cleanQuery = query.trim().toUpperCase().replace(/\s+/g, '');
    const platePatterns = [
      /^[АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2}\d{2,3}$/,
      /^[АВЕКМНОРСТУХ]{2}\d{3}[АВЕКМНОРСТУХ]\d{2,3}$/,
      /^[АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2}\d{2,3}$/,
    ];
    return platePatterns.some(pattern => pattern.test(cleanQuery));
  };

  // Выполняем поиск при загрузке страницы
  useEffect(() => {
    if (routerQuery.q && typeof routerQuery.q === 'string') {
      const query = routerQuery.q.trim();
      setSearchQuery(query);
      setIsLoading(true);

      if (isVinNumber(query)) {
        setSearchType('vin');
        findVehicleByVin({
          variables: {
            catalogCode: '', // Глобальный поиск
            vin: query.toUpperCase()
          }
        });
      } else if (isPlateNumber(query)) {
        setSearchType('plate');
        findVehicleByPlate({
          variables: {
            plateNumber: query.toUpperCase().replace(/\s+/g, '')
          }
        });
      } else {
        setIsLoading(false);
      }
    }
  }, [routerQuery.q, findVehicleByVin, findVehicleByPlate]);

  const handleVehicleSelect = useCallback((vehicle: LaximoVehicleSearchResult, skipToCategories = false) => {
    console.log('🚗 handleVehicleSelect вызвана для автомобиля:', vehicle, 'skipToCategories:', skipToCategories);
    
    // Переходим к выбору групп запчастей для найденного автомобиля
    const catalogCode = vehicle.catalog || vehicle.brand?.toLowerCase() || '';
    const vehicleId = vehicle.vehicleid || '';
    const ssd = vehicle.ssd || '';
    
    console.log('🔧 Выбранные параметры:', {
      catalogCode,
      vehicleId, 
      ssd: ssd ? `${ssd.substring(0, 50)}...` : 'отсутствует',
      ssdLength: ssd.length
    });
    
    // Создаем базовые параметры URL
    const urlParams = new URLSearchParams();
    
    // Добавляем VIN-номер в URL, если он есть
    if (searchQuery && searchType === 'vin') {
      urlParams.set('vin', searchQuery);
    }
    
    // Если есть SSD, сохраняем его в localStorage для безопасной передачи
    if (ssd && ssd.trim() !== '') {
      const vehicleKey = `vehicle_ssd_${catalogCode}_${vehicleId}`;
      console.log('💾 Сохраняем SSD в localStorage, ключ:', vehicleKey);
      
      // Очищаем все предыдущие SSD для других автомобилей
      const keysToRemove = Object.keys(localStorage).filter(key => key.startsWith('vehicle_ssd_'));
      keysToRemove.forEach(key => {
        if (key !== vehicleKey) {
          console.log('🗑️ Удаляем старый SSD ключ:', key);
          localStorage.removeItem(key);
        }
      });
      
      localStorage.setItem(vehicleKey, ssd);
      
      urlParams.set('use_storage', '1');
      urlParams.set('ssd_length', ssd.length.toString());
    }
    
    if (skipToCategories) {
      urlParams.set('searchType', 'categories');
    }
    
    // Формируем URL с параметрами
    const baseUrl = `/vehicle-search/${catalogCode}/${vehicleId}`;
    const url = urlParams.toString() ? `${baseUrl}?${urlParams.toString()}` : baseUrl;
    
    console.log('🔗 Переходим на URL:', url);
    // Используем replace вместо push для моментального перехода
    router.replace(url);
  }, [router, searchQuery, searchType]);

  // Предзагрузка и автоматический переход при поиске по VIN, если найден только один автомобиль
  useEffect(() => {
    if (!isLoading && searchType === 'vin' && vehicles.length === 1 && !isRedirecting) {
      console.log('🚗 Найден один автомобиль по VIN, подготавливаем мгновенный переход');
      
      const vehicle = vehicles[0];
      const catalogCode = vehicle.catalog || vehicle.brand?.toLowerCase() || '';
      const vehicleId = vehicle.vehicleid || '';
      
      // Предзагружаем целевую страницу для ускорения перехода (сразу с категориями)
      const targetUrl = `/vehicle-search/${catalogCode}/${vehicleId}?searchType=categories`;
      router.prefetch(targetUrl);
      console.log('🔄 Предзагружаем страницу с категориями:', targetUrl);
      
      setIsRedirecting(true);
      
      // Мгновенный переход сразу к категориям
      handleVehicleSelect(vehicle, true);
    }
  }, [isLoading, searchType, vehicles, handleVehicleSelect, isRedirecting, router]);

  const handleCancelRedirect = () => {
    setIsRedirecting(false);
  };

  return (
    <>

      
      <main className="bg-[#F5F8FB] min-h-screen">
        {/* Breadcrumb (InfoSearch style) */}
        <section className="section-info">
          <div className="w-layout-blockcontainer container info w-container">
            <div className="w-layout-vflex flex-block-9">
              <div className="w-layout-hflex flex-block-7">
                <a href="/" className="link-block w-inline-block">
                  <div>Главная</div>
                </a>
                <div className="text-block-3">→</div>
                <a href="#" className="link-block-2 w-inline-block">
                  <div>Найденные автомобили</div>
                </a>
              </div>
              <div className="w-layout-hflex flex-block-8">
                <div className="w-layout-hflex flex-block-10">
                  <h1 className="heading">{searchType === 'vin' ? 'Поиск по VIN номеру' : 'Поиск по государственному номеру'}</h1>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Results Header */}
        <div className="flex flex-col items-center pt-10 pb-16 max-md:px-5">
          <div className="w-full max-w-[1580px]">
            {/* <div className="mb-6">
              <p className="text-lg text-gray-600">
                Запрос: <span className="font-mono font-bold">{searchQuery}</span>
              </p>
              {!isLoading && vehicles.length > 0 && !isRedirecting && (
                <p className="text-sm text-gray-500 mt-2">
                  Найдено {vehicles.length} автомобилей
                </p>
              )}
            </div> */}

            {/* Loading State */}
            {isLoading && (
              <div className="bg-white rounded-2xl shadow p-10 flex flex-col items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-red-600 mb-6"></div>
                <p className="text-lg text-gray-600">Поиск автомобилей...</p>
              </div>
            )}

            {/* Auto-redirect notification for VIN search with single result */}
            {!isLoading && searchType === 'vin' && vehicles.length === 1 && isRedirecting && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <svg className="animate-spin h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div>
                      <h3 className="text-lg font-medium text-green-900">✅ Автомобиль найден!</h3>
                      <p className="text-green-700">
                        <strong>{vehicles[0]?.brand} {vehicles[0]?.name}</strong> 
                        {vehicles[0]?.year && ` (${vehicles[0].year} г.)`}
                        {vehicles[0]?.engine && `, двигатель: ${vehicles[0].engine}`}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        🚀 Переходим сразу к категориям запчастей...
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.back()}
                    className="text-green-600 hover:text-green-800 border border-green-300 hover:border-green-400 px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Назад
                  </button>
                </div>
              </div>
            )}

            {/* Results List (Search-like style, not table) */}
            {!isLoading && vehicles.length > 0 && !isRedirecting && (
              <div className="bg-white rounded-2xl shadow p-10">
                <div className="flex flex-wrap items-center gap-6 font-bold text-gray-900 text-base mb-2 px-2">
                  <div className="min-w-[100px] flex-1 break-words">Бренд</div>
                  <div className="min-w-[120px] flex-1 break-words">Название</div>
                  <div className="min-w-[120px] flex-1 break-words">Модель</div>
                  <div className="min-w-[60px] flex-1 break-words">Год</div>
                  <div className="min-w-[120px] flex-1 break-words">Двигатель</div>
                  <div className="min-w-[80px] flex-1 break-words">КПП</div>
                  <div className="min-w-[80px] flex-1 break-words">Рынок</div>
                  <div className="min-w-[100px] flex-1 break-words">Дата выпуска</div>
                  <div className="min-w-[140px] flex-1 break-words">Период производства</div>
                </div>
                <div className="space-y-0">
                  {vehicles.map((vehicle, index) => (
                    <div
                      key={vehicle.vehicleid || index}
                      className="flex flex-wrap items-center gap-6 bg-white border-b border-gray-200 px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors max-w-full"
                      onClick={() => handleVehicleSelect(vehicle)}
                      style={{ minWidth: 0 }}
                    >
                      <div className="font-bold text-gray-900 text-base min-w-[100px] flex-1 break-words">{vehicle.brand}</div>
                      <div className="text-gray-900 text-base min-w-[120px] flex-1 break-words">{vehicle.name}</div>
                      <div className="text-gray-900 text-base min-w-[120px] flex-1 break-words">{vehicle.model}</div>
                      <div className="text-gray-900 text-base min-w-[60px] flex-1 break-words">{vehicle.year || '-'}</div>
                      <div className="text-gray-900 text-base min-w-[120px] flex-1 break-words">{vehicle.engine || '-'}</div>
                      <div className="text-gray-900 text-base min-w-[80px] flex-1 break-words">{vehicle.transmission || '-'}</div>
                      <div className="text-gray-900 text-base min-w-[80px] flex-1 break-words">{vehicle.market || '-'}</div>
                      <div className="text-gray-900 text-base min-w-[100px] flex-1 break-words">{vehicle.date || vehicle.manufactured || '-'}</div>
                      <div className="text-gray-900 text-base min-w-[140px] flex-1 break-words">{vehicle.prodRange || vehicle.prodPeriod || ((vehicle.datefrom && vehicle.dateto) ? `${vehicle.datefrom} - ${vehicle.dateto}` : (vehicle.modelyearfrom && vehicle.modelyearto) ? `${vehicle.modelyearfrom} - ${vehicle.modelyearto}` : '-')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {!isLoading && vehicles.length === 0 && searchQuery && (
              <div className="bg-[#eaf0fa] border border-[#b3c6e6] rounded-2xl shadow p-10 text-center">
                <svg className="w-16 h-16 mx-auto mb-4" style={{ color: '#0d336c' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#0d336c' }}>
                  Автомобили не найдены
                </h3>
                <p className="mb-4" style={{ color: '#0d336c' }}>
                  По запросу <span className="font-mono font-semibold">{searchQuery}</span> автомобили не найдены.
                </p>
                <p className="text-sm" style={{ color: '#3b5a99' }}>
                  Попробуйте изменить запрос или проверьте правильность написания.
                </p>
              </div>
            )}

            {/* Invalid Search Query */}
            {!isLoading && !searchQuery && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Введите поисковый запрос
                </h3>
                <p className="text-gray-600 mb-6">
                  Используйте поле поиска в шапке сайта для поиска автомобилей по VIN номеру или государственному номеру
                </p>
                <Link 
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Вернуться на главную
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default VehicleSearchResultsPage; 