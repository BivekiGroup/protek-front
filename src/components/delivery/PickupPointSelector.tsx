import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { 
  YANDEX_PICKUP_POINTS_BY_CITY, 
  YANDEX_PICKUP_POINTS_BY_COORDINATES,
  YandexPickupPoint 
} from '@/lib/graphql/yandex-delivery';

interface PickupPointSelectorProps {
  selectedPoint?: YandexPickupPoint;
  onPointSelect: (point: YandexPickupPoint) => void;
  onCityChange?: (cityName: string) => void;
  placeholder?: string;
  className?: string;
  typeFilter?: string;
  initialCity?: string; // Начальный город для редактирования
}

const PickupPointSelector: React.FC<PickupPointSelectorProps> = ({
  selectedPoint,
  onPointSelect,
  onCityChange,
  placeholder = "Выберите пункт выдачи",
  className = "",
  typeFilter,
  initialCity
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [cityName, setCityName] = useState(initialCity || ''); // Инициализация из пропа
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState(''); // Поисковый запрос для городов
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Обновляем город если пришел новый initialCity
  useEffect(() => {
    if (initialCity && initialCity !== cityName) {
      console.log('📍 PickupPointSelector: устанавливаем город из пропа:', initialCity);
      setCityName(initialCity);
    }
  }, [initialCity]);

  // Запрос ПВЗ по городу (только если город выбран)
  const { data: cityData, loading: cityLoading, error: cityError } = useQuery(YANDEX_PICKUP_POINTS_BY_CITY, {
    variables: { cityName },
    skip: !cityName, // Пропускаем запрос, если город не выбран
    errorPolicy: 'all' // Продолжаем работу даже при ошибках
  });

  // Запрос ПВЗ по координатам (если есть геолокация)
  const { data: coordinatesData, loading: coordinatesLoading, error: coordinatesError } = useQuery(YANDEX_PICKUP_POINTS_BY_COORDINATES, {
    variables: {
      latitude: location?.lat,
      longitude: location?.lng,
      radiusKm: 10
    },
    skip: !location,
    errorPolicy: 'all' // Продолжаем работу даже при ошибках
  });

  // Определяем какие данные использовать
  const pickupPoints = coordinatesData?.yandexPickupPointsByCoordinates || 
                      cityData?.yandexPickupPointsByCity || 
                      [];

  const loading = cityLoading || coordinatesLoading;
  const hasError = cityError || coordinatesError;

  // Координаты городов для центрирования карты
  const cityCoordinates: Record<string, [number, number]> = {
    'Москва': [55.7558, 37.6176],
    'Санкт-Петербург': [59.9311, 30.3609],
    'Новосибирск': [55.0084, 82.9357],
    'Екатеринбург': [56.8431, 60.6454],
    'Казань': [55.8304, 49.0661],
    'Нижний Новгород': [56.2965, 43.9361],
    'Челябинск': [55.1644, 61.4368],
    'Самара': [53.2001, 50.15],
    'Омск': [54.9885, 73.3242],
    'Ростов-на-Дону': [47.2357, 39.7015],
    'Уфа': [54.7388, 55.9721],
    'Красноярск': [56.0184, 92.8672],
    'Воронеж': [51.6720, 39.1843],
    'Пермь': [58.0105, 56.2502],
    'Волгоград': [48.7080, 44.5133],
    'Краснодар': [45.0355, 38.9753],
    'Саратов': [51.5924, 46.0348],
    'Тюмень': [57.1522, 65.5272],
    'Тольятти': [53.5303, 49.3461],
    'Ижевск': [56.8527, 53.2118],
    'Барнаул': [53.3606, 83.7636],
    'Ульяновск': [54.3142, 48.4031],
    'Иркутск': [52.2978, 104.2964],
    'Хабаровск': [48.4827, 135.0839],
    'Ярославль': [57.6261, 39.8845],
    'Владивосток': [43.1056, 131.8735],
    'Махачкала': [42.9849, 47.5047],
    'Томск': [56.4977, 84.9744],
    'Оренбург': [51.7727, 55.0988],
    'Кемерово': [55.3331, 86.0833],
    'Новокузнецк': [53.7557, 87.1099],
    'Рязань': [54.6269, 39.6916],
    'Набережные Челны': [55.7558, 52.4069],
    'Астрахань': [46.3497, 48.0408],
    'Пенза': [53.2001, 45.0000],
    'Липецк': [52.6031, 39.5708],
    'Тула': [54.1961, 37.6182],
    'Киров': [58.6035, 49.6679],
    'Чебоксары': [56.1439, 47.2517],
    'Калининград': [54.7065, 20.5110],
    'Брянск': [53.2434, 34.3640],
    'Курск': [51.7373, 36.1873],
    'Иваново': [57.0000, 40.9737],
    'Магнитогорск': [53.4078, 59.0647],
    'Тверь': [56.8587, 35.9176],
    'Ставрополь': [45.0428, 41.9734],
    'Симферополь': [44.9572, 34.1108],
    'Белгород': [50.5951, 36.5804],
    'Архангельск': [64.5401, 40.5433],
    'Владимир': [56.1366, 40.3966],
    'Сочи': [43.6028, 39.7342],
    'Курган': [55.4500, 65.3333],
    'Смоленск': [54.7818, 32.0401],
    'Калуга': [54.5293, 36.2754],
    'Чита': [52.0307, 113.5006],
    'Орёл': [52.9651, 36.0785],
    'Волжский': [48.7854, 44.7759],
    'Череповец': [59.1374, 37.9097],
    'Владикавказ': [43.0370, 44.6830],
    'Мурманск': [68.9792, 33.0925],
    'Сургут': [61.2500, 73.4167],
    'Вологда': [59.2239, 39.8840],
    'Тамбов': [52.7319, 41.4520],
    'Стерлитамак': [53.6241, 55.9504],
    'Грозный': [43.3181, 45.6942],
    'Якутск': [62.0355, 129.6755],
    'Кострома': [57.7665, 40.9265],
    'Комсомольск-на-Амуре': [50.5496, 137.0067],
    'Петрозаводск': [61.7849, 34.3469],
    'Таганрог': [47.2362, 38.8969],
    'Нижневартовск': [60.9344, 76.5531],
    'Йошкар-Ола': [56.6372, 47.8753],
    'Братск': [56.1326, 101.6140],
    'Новороссийск': [44.7209, 37.7677],
    'Дзержинск': [56.2342, 43.4582],
    'Шахты': [47.7090, 40.2060],
    'Нижнекамск': [55.6367, 51.8209],
    'Орск': [51.2045, 58.5434],
    'Ангарск': [52.5406, 103.8887],
    'Старый Оскол': [51.2965, 37.8411],
    'Великий Новгород': [58.5218, 31.2756],
    'Благовещенск': [50.2941, 127.5405],
    'Прокопьевск': [53.9058, 86.7194],
    'Химки': [55.8970, 37.4296],
    'Энгельс': [51.4827, 46.1124],
    'Рыбинск': [58.0446, 38.8486],
    'Балашиха': [55.7969, 37.9386],
    'Подольск': [55.4297, 37.5547],
    'Королёв': [55.9226, 37.8251],
    'Петропавловск-Камчатский': [53.0446, 158.6483],
    'Мытищи': [55.9116, 37.7307],
    'Люберцы': [55.6758, 37.8939],
    'Магадан': [59.5638, 150.8063],
    'Норильск': [69.3558, 88.1893],
    'Южно-Сахалинск': [46.9588, 142.7386]
  };

  // Популярные города с ПВЗ Яндекса (расширенный список)
  const availableCities = Object.keys(cityCoordinates).sort();

  // Фильтрация городов по поисковому запросу
  const filteredCities = availableCities.filter(city =>
    city.toLowerCase().includes(citySearchTerm.toLowerCase())
  );

  // Фильтрация ПВЗ по поисковому запросу и типу
  const filteredPoints = pickupPoints.filter((point: YandexPickupPoint) => {
    const matchesSearch = point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      point.address.fullAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !typeFilter || point.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Получение геолокации
  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Ошибка получения геолокации:', error);
          // Fallback на Калининград
          setLocation({ lat: 54.7104, lng: 20.4522 });
        }
      );
    } else {
      // Fallback на Калининград
      setLocation({ lat: 54.7104, lng: 20.4522 });
    }
  };

  // Закрытие дропдаунов при клике вне них
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCitySelector(false);
        setCitySearchTerm(''); // Очищаем поиск при закрытии
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Автоматическая загрузка геолокации убрана - пользователь может выбрать город или нажать кнопку геолокации

  const handlePointSelect = (point: YandexPickupPoint) => {
    onPointSelect(point);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Выбор города */}
      <div className="mb-3">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          1. Выберите город доставки
        </label>
        {!cityName && (
          <p className="text-sm text-gray-500 mb-2">
            Сначала укажите город, чтобы увидеть доступные пункты выдачи
          </p>
        )}
        <div className="relative">
          <input
            type="text"
            value={showCitySelector ? citySearchTerm : (cityName || '')}
            onChange={(e) => {
              setCitySearchTerm(e.target.value);
              if (!showCitySelector) {
                setShowCitySelector(true);
                setIsOpen(false);
              }
            }}
            onFocus={() => {
              setShowCitySelector(true);
              setIsOpen(false); // Закрываем дропдаун ПВЗ
            }}
            placeholder="Выберите город"
            className="w-full gap-2.5 px-6 py-4 text-lg leading-6 bg-white rounded border border-solid border-stone-300 h-[55px] text-neutral-500 outline-none pr-20"
          />

          {/* Дропдаун с городами */}
          {showCitySelector && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <div
                    key={city}
                    onClick={() => {
                      setCityName(city);
                      setShowCitySelector(false);
                      setCitySearchTerm(''); // Очищаем поиск
                      setLocation(null); // Сбрасываем геолокацию при выборе города
                      onCityChange?.(city); // Уведомляем родительский компонент
                    }}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                      cityName === city ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {city}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  Город не найден
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Поле ввода */}
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          2. Выберите пункт выдачи
        </label>
        <input
          type="text"
          value={selectedPoint ? selectedPoint.name : searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) {
              setIsOpen(true);
              setShowCitySelector(false); // Закрываем селектор города
            }
          }}
          onFocus={() => {
            setIsOpen(true);
            setShowCitySelector(false); // Закрываем селектор города
          }}
          placeholder={cityName ? `${placeholder} в г. ${cityName}` : 'Сначала выберите город'}
          className="w-full gap-2.5 px-6 py-4 text-lg leading-6 bg-white rounded border border-solid border-stone-300 h-[55px] text-neutral-500 outline-none pr-20"
        />
        
        {/* Кнопка геолокации */}
        <button
          onClick={() => {
            handleGetLocation();
            setIsOpen(true);
            setShowCitySelector(false); // Закрываем селектор города
          }}
          className="absolute right-2 top-[32px] p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Определить местоположение"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </button>
      </div>

      {/* Дропдаун с ПВЗ */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Загрузка пунктов выдачи...
            </div>
          ) : hasError ? (
            <div className="p-4 text-center text-red-500">
              <div className="mb-2">Ошибка загрузки пунктов выдачи</div>
              <div className="text-sm text-gray-500 mb-2">
                {cityError?.message || coordinatesError?.message || 'Неизвестная ошибка'}
              </div>
              <button
                onClick={() => {
                  // Перезагружаем данные
                  window.location.reload();
                }}
                className="text-red-600 hover:text-red-700 underline text-sm"
              >
                Попробовать снова
              </button>
            </div>
          ) : filteredPoints.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {!cityName && !location ? (
                <div>
                  <div className="mb-2">Выберите город или используйте геолокацию</div>
                  <div className="text-xs text-gray-400">
                    Для поиска пунктов выдачи сначала укажите местоположение
                  </div>
                </div>
              ) : searchTerm ? (
                `Пункты выдачи не найдены по запросу "${searchTerm}"`
              ) : (
                <div>
                  <div className="mb-2">Нет доступных пунктов выдачи{cityName ? ` в г. ${cityName}` : ''}</div>
                  <div className="text-xs text-gray-400">
                    Попробуйте выбрать другой город или использовать геолокацию
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-2">
              {/* Заголовок с количеством */}
              <div className="px-4 py-2 bg-gray-50 border-b text-sm text-gray-600 font-medium">
                {location 
                  ? `Найдено ${filteredPoints.length} ПВЗ рядом с вами`
                  : `Найдено ${filteredPoints.length} ПВЗ в г. ${cityName}`
                }
              </div>
              
              {filteredPoints.map((point: YandexPickupPoint) => (
                <div
                  key={point.id}
                  onClick={() => handlePointSelect(point)}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedPoint?.id === point.id ? 'bg-red-50 border-l-4 border-red-500' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900 mb-1">
                    {point.name}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {point.address.fullAddress}
                  </div>
                  <div className="text-xs text-gray-500">
                    {point.contact.phone} • {point.typeLabel}
                  </div>
                  {point.formattedSchedule && (
                    <div className="text-xs text-gray-500 mt-1">
                      {point.formattedSchedule}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PickupPointSelector; 