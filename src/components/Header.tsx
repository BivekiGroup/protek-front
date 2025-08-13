import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useLazyQuery } from '@apollo/client';
// import BottomHead from "@/components/BottomHead";
import AuthModal from "@/components/auth/AuthModal";
import type { Client } from "@/types/auth";
import { useIsClient } from "@/lib/useIsomorphicLayoutEffect";
import { FIND_LAXIMO_VEHICLE, DOC_FIND_OEM, FIND_LAXIMO_VEHICLE_BY_PLATE_GLOBAL, FIND_LAXIMO_VEHICLES_BY_PART_NUMBER } from '@/lib/graphql';
import { LaximoVehicleSearchResult, LaximoDocFindOEMResult, LaximoVehiclesByPartResult } from '@/types/laximo';
import Link from "next/link";
import CartButton from './CartButton';
import SearchHistoryDropdown from './SearchHistoryDropdown';
import { GET_RECENT_SEARCH_QUERIES, PartsSearchHistoryItem } from '@/lib/graphql/search-history';

interface HeaderProps {
  onOpenAuthModal?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenAuthModal = () => console.log('Auth modal action not provided') }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<LaximoVehicleSearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [oemSearchResults, setOemSearchResults] = useState<LaximoDocFindOEMResult | null>(null);
  const [vehiclesByPartResults, setVehiclesByPartResults] = useState<LaximoVehiclesByPartResult | null>(null);
  const [searchType, setSearchType] = useState<'vin' | 'oem' | 'plate' | 'text'>('text');
  const [oemSearchMode, setOemSearchMode] = useState<'parts' | 'vehicles'>('parts');
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [searchHistoryItems, setSearchHistoryItems] = useState<PartsSearchHistoryItem[]>([]);
  const [inputFocused, setInputFocused] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const router = useRouter();
  const searchFormRef = useRef<HTMLFormElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isClient = useIsClient();

  // Эффект для восстановления поискового запроса из URL
  useEffect(() => {
    if (!router.isReady) return;

    // Если мы находимся на странице search-result, восстанавливаем поисковый запрос
    if (router.pathname === '/search-result') {
      const { article, brand } = router.query;
      if (article && typeof article === 'string') {
        // Отображаем только артикул, без бренда
        setSearchQuery(article);
      }
    }
    // Если мы находимся на странице search, восстанавливаем поисковый запрос
    else if (router.pathname === '/search') {
      const { q } = router.query;
      if (q && typeof q === 'string') {
        setSearchQuery(q);
      }
    }
    // Если мы находимся на странице vehicle-search-results, восстанавливаем поисковый запрос
    else if (router.pathname === '/vehicle-search-results') {
      const { q } = router.query;
      if (q && typeof q === 'string') {
        setSearchQuery(q);
      }
    }
    // Если мы находимся на странице деталей автомобиля, восстанавливаем VIN из URL
    else if (router.pathname === '/vehicle-search/[brand]/[vehicleId]') {
      const { vin } = router.query;
      if (vin && typeof vin === 'string') {
        setSearchQuery(vin);
      } else {
        setSearchQuery('');
      }
    }
    // Для других страниц очищаем поисковый запрос
    else {
      setSearchQuery('');
    }
  }, [router.isReady, router.pathname, router.query]);

  // Query для поиска по артикулу через Doc FindOEM
  const [findOEMParts] = useLazyQuery(DOC_FIND_OEM, {
    onCompleted: (data) => {
      const result = data.laximoDocFindOEM;
      console.log('🔍 Найдено деталей по артикулу:', result?.details?.length || 0);
      setOemSearchResults(result);
      setSearchResults([]);
      setIsSearching(false);
      setShowResults(true);
    },
    onError: (error) => {
      console.error('❌ Ошибка поиска по артикулу:', error);
      setOemSearchResults(null);
      setSearchResults([]);
      setIsSearching(false);
      setShowResults(true);
    }
  });

  // Query для поиска автомобилей по артикулу
  const [findVehiclesByPartNumber] = useLazyQuery(FIND_LAXIMO_VEHICLES_BY_PART_NUMBER, {
    onCompleted: (data) => {
      const result = data.laximoFindVehiclesByPartNumber;
      console.log('🔍 Найдено автомобилей по артикулу:', result?.totalVehicles || 0);
      setVehiclesByPartResults(result);
      setSearchResults([]);
      setOemSearchResults(null);
      setIsSearching(false);
      setShowResults(true);
    },
    onError: (error) => {
      console.error('❌ Ошибка поиска автомобилей по артикулу:', error);
      setVehiclesByPartResults(null);
      setSearchResults([]);
      setOemSearchResults(null);
      setIsSearching(false);
      setShowResults(true);
    }
  });

  // Запрос для получения истории поиска
  const [getSearchHistory, { loading: historyLoading }] = useLazyQuery(GET_RECENT_SEARCH_QUERIES, {
    onCompleted: (data) => {
      setSearchHistoryItems(data.partsSearchHistory?.items || []);
    },
    onError: (error) => {
      console.error('❌ Ошибка загрузки истории поиска:', error);
      setSearchHistoryItems([]);
    }
  });

  // Закрытие результатов при клике вне области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowSearchHistory(false);
        setInputFocused(false);
        // Показываем placeholder обратно только если поле пустое
        if (searchQuery.trim() === '') {
          setShowPlaceholder(true);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Проверяем авторизацию при загрузке компонента (только на клиенте)
  useEffect(() => {
    if (!isClient) return;
    
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } catch (error) {
        console.error('Ошибка парсинга данных пользователя:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
  }, [isClient]);

  useEffect(() => {
    const bottomHead = document.querySelector('.bottom_head');
    if (!bottomHead) return;
    const onScroll = () => {
      if (window.scrollY > 0) {
        bottomHead.classList.add('scrolled');
      } else {
        bottomHead.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Скрытие top_head при скролле
  // useEffect(() => {
  //   const topHead = document.querySelector('.top_head');
  //   if (!topHead) return;
  //   const onScroll = () => {
  //     if (window.scrollY > 0) {
  //       topHead.classList.add('hide-top-head');
  //     } else {
  //       topHead.classList.remove('hide-top-head');
  //     }
  //   };
  //   window.addEventListener('scroll', onScroll);
  //   onScroll();
  //   return () => window.removeEventListener('scroll', onScroll);
  // }, []);

  // Проверяем, является ли строка VIN номером
  const isVinNumber = (query: string): boolean => {
    const cleanQuery = query.trim().toUpperCase();
    // VIN состоит из 17 символов, содержит буквы и цифры, исключая I, O, Q
    return /^[A-HJ-NPR-Z0-9]{17}$/.test(cleanQuery);
  };

  // Проверяем, является ли строка артикулом (OEM номером)
  const isOEMNumber = (query: string): boolean => {
    const cleanQuery = query.trim().toUpperCase();
    // Артикул обычно содержит буквы и цифры, может содержать дефисы, точки
    // Длина от 3 до 20 символов, не должен быть VIN номером или госномером
    return /^[A-Z0-9\-\.]{3,20}$/.test(cleanQuery) && !isVinNumber(cleanQuery) && !isPlateNumber(cleanQuery);
  };

  // Проверяем, является ли строка госномером РФ
  const isPlateNumber = (query: string): boolean => {
    const cleanQuery = query.trim().toUpperCase().replace(/\s+/g, '');
    // Российские госномера: А123БВ77, А123БВ777, АА123А77, АА123А777, А123АА77, А123АА777
    // Убираем пробелы и дефисы для проверки
    const platePatterns = [
      /^[АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2}\d{2,3}$/, // А123БВ77, А123БВ777
      /^[АВЕКМНОРСТУХ]{2}\d{3}[АВЕКМНОРСТУХ]\d{2,3}$/, // АА123А77, АА123А777
      /^[АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2}\d{2,3}$/, // А123АА77, А123АА777
    ];
    
    return platePatterns.some(pattern => pattern.test(cleanQuery));
  };

  // Определяем тип поиска
  const getSearchType = (query: string): 'vin' | 'oem' | 'plate' | 'text' => {
    if (isVinNumber(query)) return 'vin';
    if (isPlateNumber(query)) return 'plate';
    if (isOEMNumber(query)) return 'oem';
    return 'text';
  };

  // Список популярных каталогов для поиска по VIN
  const popularCatalogs = ['VW', 'AUDI', 'BMW', 'MERCEDES', 'FORD', 'TOYOTA', 'NISSAN', 'HYUNDAI', 'KIA'];

  // Обработчик поиска по VIN больше не используется (переходим на отдельную страницу)
  /*
  const handleVinSearch = async (vin: string) => {
    setIsSearching(true);
    setSearchResults([]);
    setOemSearchResults(null);
    setVehiclesByPartResults(null);
    
    console.log('🔍 Поиск по VIN глобально:', vin);
    
    // Выполняем глобальный поиск без указания каталога
    try {
      await findVehicleInCatalogs({
        variables: {
          catalogCode: '', // Пустой код каталога для глобального поиска
          vin: vin
        }
      });
    } catch (error) {
      console.error('❌ Ошибка глобального поиска по VIN:', error);
    }
  };
  */

  const handleOEMSearch = async (oemNumber: string) => {
    setIsSearching(true);
    setSearchResults([]);
    setOemSearchResults(null);
    setVehiclesByPartResults(null);
    
    console.log('🔍 Поиск по артикулу через Doc FindOEM:', oemNumber);
    
    try {
      await findOEMParts({
        variables: {
          oemNumber: oemNumber.trim().toUpperCase()
        }
      });
    } catch (error) {
      console.error('❌ Ошибка поиска по артикулу:', error);
    }
  };

  // Обработчик поиска по госномеру больше не используется (переходим на отдельную страницу)
  /*
  const handlePlateSearch = async (plateNumber: string) => {
    setIsSearching(true);
    setSearchResults([]);
    setOemSearchResults(null);
    setVehiclesByPartResults(null);
    
    // Очищаем госномер от пробелов и приводим к верхнему регистру
    const cleanPlateNumber = plateNumber.trim().toUpperCase().replace(/\s+/g, '');
    console.log('🔍 Поиск по госномеру:', cleanPlateNumber);
    
    try {
      await findVehicleByPlate({
        variables: {
          plateNumber: cleanPlateNumber
        }
      });
    } catch (error) {
      console.error('❌ Ошибка поиска по госномеру:', error);
    }
  };
  */

  const handlePartVehicleSearch = async (partNumber: string) => {
    setIsSearching(true);
    setSearchResults([]);
    setOemSearchResults(null);
    setVehiclesByPartResults(null);
    
    console.log('🔍 Поиск автомобилей по артикулу:', partNumber);
    
    try {
      await findVehiclesByPartNumber({
        variables: {
          partNumber: partNumber.trim().toUpperCase()
        }
      });
    } catch (error) {
      console.error('❌ Ошибка поиска автомобилей по артикулу:', error);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    const currentSearchType = getSearchType(searchQuery);
    setSearchType(currentSearchType);
    
    if (currentSearchType === 'vin') {
      // Переходим на страницу результатов поиска по VIN
      router.push(`/vehicle-search-results?q=${encodeURIComponent(searchQuery.trim().toUpperCase())}`);
    } else if (currentSearchType === 'plate') {
      // Переходим на страницу результатов поиска по госномеру
      router.push(`/vehicle-search-results?q=${encodeURIComponent(searchQuery.trim().toUpperCase())}`);
    } else if (currentSearchType === 'oem') {
      // Если это артикул, переходим на новую страницу поиска с режимом запчастей
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim().toUpperCase())}&mode=parts`);
    } else {
      // Для текстового поиска также перенаправляем на новую страницу поиска
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}&mode=parts`);
    }
  };

  const handleVehicleSelect = (vehicle: LaximoVehicleSearchResult) => {
    setShowResults(false);
    
    // Переходим на страницу автомобиля - используем catalog вместо brand
    const catalogCode = (vehicle as any).catalog || vehicle.brand.toLowerCase();
    console.log('🚗 Переход на страницу автомобиля:', { catalogCode, vehicleId: vehicle.vehicleid, ssd: vehicle.ssd });
    
    // Создаем параметры URL
    const urlParams = new URLSearchParams();
    
    // Добавляем SSD если есть
    if (vehicle.ssd) {
      urlParams.set('ssd', vehicle.ssd);
    }
    
    // Добавляем VIN-номер в URL, если поиск был по VIN
    if (searchType === 'vin' && searchQuery) {
      urlParams.set('vin', searchQuery);
    }
    
    // Если переход происходит из поиска автомобилей по артикулу, передаем артикул для автоматического поиска
    const currentOEMNumber = oemSearchMode === 'vehicles' ? searchQuery.trim().toUpperCase() : '';
    if (currentOEMNumber) {
      urlParams.set('oemNumber', currentOEMNumber);
    }
    
    // Формируем URL
    const baseUrl = `/vehicle-search/${catalogCode}/${vehicle.vehicleid}`;
    const url = urlParams.toString() ? `${baseUrl}?${urlParams.toString()}` : baseUrl;
    
    // НЕ очищаем поисковый запрос, чтобы он остался в строке поиска
    // setSearchQuery('');
    router.push(url);
  };

  // Обработчик фокуса на поле ввода
  const handleInputFocus = () => {
    setInputFocused(true);
    setShowResults(false);
    setShowPlaceholder(false);
    if (searchQuery.trim() === '') {
      setShowSearchHistory(true);
      getSearchHistory({ variables: { limit: 5 } });
    }
  };

  // Обработчик изменения значения поля ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Управляем placeholder в зависимости от наличия текста
    if (value.trim() === '') {
      setShowPlaceholder(false); // Скрываем placeholder пока в фокусе
      setShowSearchHistory(true);
      setShowResults(false);
      getSearchHistory({ variables: { limit: 5 } });
    } else {
      setShowPlaceholder(false); // Скрываем placeholder когда есть текст
      setShowSearchHistory(false);
    }
  };

  // Обработчик потери фокуса
  const handleInputBlur = () => {
    // Показываем placeholder обратно только если поле пустое
    if (searchQuery.trim() === '') {
      setShowPlaceholder(true);
    }
  };

  // Обработчик клика по элементу истории
  const handleHistoryItemClick = (searchQuery: string) => {
    setSearchQuery(searchQuery);
    setShowSearchHistory(false);
    setInputFocused(false);
    setShowPlaceholder(false); // Скрываем placeholder так как теперь есть текст
    // Фокусируем поле ввода для возможности редактирования
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <>
      {/* <section className="top_head">
        <div className="w-layout-blockcontainer container nav w-container">
          <div data-animation="default" data-collapse="medium" data-duration="400" data-easing="ease" data-easing2="ease" role="banner" className="navbar w-nav">
          <Link href="/" className="brand w-nav-brand"><img src="/images/logo.svg" loading="lazy" alt="" className="image-24" /></Link>
            <nav role="navigation" className="nav-menu w-nav-menu">
              <Link href="/about" className="nav-link w-nav-link">О компании</Link>
              <Link href="/payments-method" className="nav-link w-nav-link">Оплата и доставка</Link>
              <Link href="/" className="nav-link w-nav-link">Гарантия и возврат</Link>
              <Link href="/payments-method" className="nav-link w-nav-link">Покупателям</Link>
              <Link href="/wholesale" className="nav-link w-nav-link">Оптовым клиентам</Link>
              <Link href="/contacts" className="nav-link w-nav-link">Контакты</Link>
            </nav>
            <div className="w-layout-hflex flex-block-2">
              <div className="w-layout-hflex flex-block-3">
                <div className="w-layout-hflex flex-block-77-copy">
                  <div className="code-embed-4 w-embed"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.51667 8.99167C6.71667 11.35 8.65 13.275 11.0083 14.4833L12.8417 12.65C13.0667 12.425 13.4 12.35 13.6917 12.45C14.625 12.7583 15.6333 12.925 16.6667 12.925C17.125 12.925 17.5 13.3 17.5 13.7583V16.6667C17.5 17.125 17.125 17.5 16.6667 17.5C8.84167 17.5 2.5 11.1583 2.5 3.33333C2.5 2.875 2.875 2.5 3.33333 2.5H6.25C6.70833 2.5 7.08333 2.875 7.08333 3.33333C7.08333 4.375 7.25 5.375 7.55833 6.30833C7.65 6.6 7.58333 6.925 7.35 7.15833L5.51667 8.99167Z" fill="currentColor" /></svg></div>
                  <div className="phone-copy">+7 (495) 260-20-60</div>
                </div>
              </div>
              <div className="w-layout-hflex flex-block"><img src="/images/tg_icon.svg" loading="lazy" alt="" className="icon_messenger" /><img src="/images/wa_icon.svg" loading="lazy" alt="" className="icon_messenger" /></div>
            </div>
          </div>
        </div>
      </section> */}
      <section className="bottom_head">
        <div className="w-layout-blockcontainer container nav w-container">
            <div className="w-layout-hflex flex-block-93">
              <Link href="/" className="code-embed-15 w-embed protekauto-logo" style={{ display: 'block', cursor: 'pointer'}}>
                <svg width="190" height="72" viewBox="0 0 190 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M138.377 29.5883V23.1172H112.878V29.5883H138.377Z" fill="white"></path>
                  <path d="M107.423 18.1195C109.21 18.1195 110.658 16.6709 110.658 14.884C110.658 13.097 109.21 11.6484 107.423 11.6484L88.395 11.6484C86.6082 11.6484 85.1596 13.097 85.1596 14.884C85.1596 16.6709 86.6082 18.1195 88.395 18.1195H107.423Z" fill="white"></path>
                  <path d="M130.288 34.2491C128.773 35.3865 126.89 36.0628 124.852 36.0628C119.849 36.0628 115.791 32.0052 115.791 27.0013C115.791 21.9974 119.849 17.9399 124.852 17.9399C129.856 17.9399 133.913 21.9974 133.913 27.0013C133.913 27.9022 133.779 28.7696 133.536 29.5893H140.169C140.31 28.7481 140.384 27.8831 140.384 27.0013C140.384 18.4226 133.431 11.4688 124.852 11.4688C116.274 11.4688 109.32 18.4226 109.32 27.0013C109.32 35.5801 116.274 42.5339 124.852 42.5339C129.249 42.5339 133.218 40.7058 136.045 37.769L130.288 34.2491Z" fill="white"></path>
                  <path d="M148.633 11.4531H148.631C146.629 11.4531 145.006 13.0761 145.006 15.0782V38.9075C145.006 40.9096 146.629 42.5326 148.631 42.5326H148.633C150.635 42.5326 152.258 40.9096 152.258 38.9075V15.0782C152.258 13.0761 150.635 11.4531 148.633 11.4531Z" fill="white"></path>
                  <path d="M168.935 36.3511L154.515 21.9297L149.387 27.0578L163.807 41.4792C164.489 42.1603 165.411 42.5402 166.371 42.5402C169.602 42.5402 171.22 38.6356 168.935 36.3511Z" fill="white"></path>
                  <path d="M168.937 17.7751L154.733 31.979L149.605 26.8509L163.809 12.6469C164.49 11.9659 165.412 11.5859 166.373 11.5859C169.603 11.5859 171.221 15.4906 168.937 17.7751Z" fill="white"></path>
                  <path d="M186.029 36.3511L171.608 21.9297L166.48 27.0578L180.901 41.4792C181.582 42.1603 182.505 42.5402 183.465 42.5402C186.696 42.5402 188.314 38.6356 186.029 36.3511Z" fill="#EC1C24"></path>
                  <path d="M186.029 17.7751L171.587 32.218L166.459 27.0898L180.901 12.6469C181.582 11.9659 182.505 11.5859 183.465 11.5859C186.696 11.5859 188.314 15.4906 186.029 17.7751Z" fill="#EC1C24"></path>
                  <path d="M3.6249 50.4184C1.62248 50.4184 0 48.7958 0 46.7933V11.4531L7.2522 14.3207V46.7933C7.2522 48.7958 5.62971 50.4184 3.62729 50.4184H3.6249Z" fill="white"></path>
                  <path d="M97.9491 42.5353C95.9467 42.5353 94.3242 40.9128 94.3242 38.9103V0L101.576 2.86755V38.9103C101.576 40.9128 99.9539 42.5353 97.9515 42.5353H97.9491Z" fill="white"></path>
                  <path d="M38.578 42.5326C36.5756 42.5326 34.9531 40.91 34.9531 38.9075V11.4531L42.2053 14.3207V38.9075C42.2053 40.91 40.5828 42.5326 38.5804 42.5326H38.578Z" fill="white"></path>
                  <path d="M51.334 11.4555C42.7508 11.4555 35.7949 18.4141 35.7949 26.9953H42.2705C42.2705 21.989 46.3279 17.929 51.3364 17.929C52.0102 17.929 52.6649 18.0055 53.2958 18.1441C54.2301 16.0723 55.4798 14.1749 56.9876 12.5141C55.2361 11.8307 53.3316 11.4531 51.3364 11.4531L51.334 11.4555Z" fill="white"></path>
                  <path d="M70.4707 11.4531C61.8875 11.4531 54.9316 18.4117 54.9316 26.9929C54.9316 35.574 61.8899 42.5326 70.4707 42.5326C79.0515 42.5326 86.0098 35.574 86.0098 26.9929C86.0098 18.4117 79.0515 11.4531 70.4707 11.4531ZM70.4707 36.0591C65.4647 36.0591 61.4049 32.0015 61.4049 26.9929C61.4049 21.9842 65.4623 17.9266 70.4707 17.9266C75.4791 17.9266 79.5365 21.9842 79.5365 26.9929C79.5365 32.0015 75.4791 36.0591 70.4707 36.0591Z" fill="white"></path>
                  <path d="M16.2309 11.4531C7.64774 11.4531 0.689453 18.4093 0.689453 26.9929C0.689453 35.5764 7.64774 42.5326 16.2285 42.5326C24.8093 42.5326 31.7676 35.574 31.7676 26.9929C31.7676 18.4117 24.8117 11.4531 16.2309 11.4531ZM16.2309 36.0591C11.2249 36.0591 7.16506 32.0015 7.16506 26.9929C7.16506 21.9842 11.2225 17.9266 16.2309 17.9266C21.2393 17.9266 25.2967 21.9842 25.2967 26.9929C25.2967 32.0015 21.2393 36.0591 16.2309 36.0591Z" fill="white"></path>
                  <rect width="53.354" height="21.8647" rx="8" transform="matrix(0.991808 -0.127739 0.127728 0.991809 134.291 50.3047)" fill="#EC1C24"></rect>
                  <path d="M141.15 66.1413L144.154 54.4607L146.879 54.1098L152.697 64.6542L149.925 65.0112L149.085 63.3647L144.317 63.9787L143.906 65.7864L141.15 66.1413ZM144.828 61.5681L147.98 61.1621L145.874 57.0626L144.828 61.5681Z" fill="white"></path>
                  <path d="M153.767 64.5163L152.337 53.4068L157.579 52.7316C158.076 52.6677 158.536 52.6615 158.962 52.7131C159.396 52.7528 159.781 52.868 160.117 53.0587C160.462 53.2376 160.749 53.5038 160.977 53.8573C161.203 54.2003 161.353 54.6542 161.426 55.2191C161.481 55.648 161.433 56.0689 161.283 56.4818C161.132 56.8947 160.885 57.2296 160.543 57.4864C161.063 57.6108 161.499 57.8736 161.852 58.2749C162.213 58.6643 162.438 59.2043 162.527 59.8947C162.615 60.5746 162.561 61.1559 162.365 61.6383C162.179 62.109 161.886 62.5029 161.487 62.8202C161.097 63.1257 160.634 63.366 160.099 63.5414C159.563 63.7167 158.994 63.8431 158.392 63.9206L153.767 64.5163ZM156.032 61.8478L158.345 61.55C158.609 61.516 158.844 61.4645 159.049 61.3954C159.264 61.3146 159.44 61.2228 159.577 61.12C159.724 61.0055 159.824 60.8702 159.879 60.7143C159.944 60.5465 159.963 60.3632 159.937 60.1644C159.91 59.9552 159.851 59.7874 159.76 59.6609C159.679 59.5331 159.565 59.4361 159.416 59.3701C159.267 59.2937 159.095 59.252 158.901 59.2451C158.706 59.2277 158.487 59.2347 158.244 59.266L155.741 59.5883L156.032 61.8478ZM155.472 57.5013L157.516 57.2382C157.769 57.2055 157.987 57.1508 158.171 57.074C158.365 56.9959 158.519 56.9016 158.634 56.7911C158.748 56.6806 158.828 56.5533 158.874 56.4092C158.931 56.2637 158.947 56.102 158.924 55.9242C158.893 55.6836 158.811 55.5027 158.677 55.3817C158.553 55.2489 158.387 55.1692 158.18 55.1427C157.971 55.1058 157.724 55.1057 157.439 55.1424L155.206 55.43L155.472 57.5013Z" fill="white"></path>
                  <path d="M166.971 62.8158L165.843 54.06L162.469 54.4945L162.166 52.1408L171.511 50.9373L171.814 53.291L168.409 53.7296L169.536 62.4854L166.971 62.8158Z" fill="white"></path>
                  <path d="M178.85 61.4134C177.699 61.5617 176.671 61.4548 175.766 61.0929C174.87 60.7191 174.14 60.1378 173.577 59.3489C173.012 58.5496 172.658 57.5903 172.514 56.471C172.366 55.3203 172.469 54.2913 172.825 53.3842C173.189 52.4652 173.764 51.7159 174.548 51.1364C175.331 50.5464 176.297 50.1773 177.448 50.029C178.578 49.8835 179.591 49.9924 180.485 50.3557C181.391 50.7176 182.13 51.2924 182.704 52.0799C183.287 52.8555 183.652 53.8135 183.799 54.9537C183.943 56.073 183.839 57.0968 183.486 58.0248C183.132 58.9425 182.559 59.7022 181.767 60.304C180.984 60.894 180.012 61.2638 178.85 61.4134ZM178.588 59.0065C179.306 58.914 179.866 58.6771 180.268 58.2957C180.67 57.9143 180.939 57.4596 181.075 56.9316C181.211 56.4037 181.245 55.8782 181.178 55.3551C181.128 54.9681 181.02 54.5885 180.854 54.2164C180.698 53.843 180.478 53.5097 180.194 53.2167C179.92 52.9223 179.58 52.7003 179.174 52.5505C178.768 52.4007 178.286 52.3618 177.726 52.4339C177.018 52.525 176.464 52.7613 176.062 53.1427C175.659 53.5136 175.384 53.9637 175.238 54.4931C175.102 55.021 175.07 55.5622 175.141 56.1167C175.212 56.6711 175.386 57.1858 175.662 57.6607C175.938 58.1356 176.318 58.5014 176.801 58.7581C177.296 59.0135 177.892 59.0963 178.588 59.0065Z" fill="white"></path>
                </svg>
              </Link>
          <div data-animation="default" data-collapse="all" data-duration="400" data-easing="ease-in" data-easing2="ease" role="banner" className="topnav w-nav">
            {/* Хамбургер-меню временно отключено */}
            {/**
            <div
              className={`menu-button w-nav-button${menuOpen ? " w--open" : ""}`}
              onClick={() => setMenuOpen((open) => !open)}
              style={{ cursor: "pointer" }}
            >
              <div className="code-embed-5 w-embed"><svg width="currentwidth" height="currenthieght" viewBox="0 0 30 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0H30V3H0V0Z" fill="currentColor"></path>
                <path d="M0 7.5H30V10.5H0V7.5Z" fill="currentColor"></path>
                <path d="M0 15H30V18H0V15Z" fill="currentColor"></path>
              </svg></div>
            </div>
            */}
          </div>
              <div className="searcj w-form" style={{ position: 'relative' }} ref={searchDropdownRef}>
                <form
                  id="custom-search-form"
                  name="custom-search-form"
                  data-custom-form="true"
                  className="form"
                  autoComplete="off"
                  onSubmit={handleSearchSubmit}
                  ref={searchFormRef}
                >
                  <div className="link-block-3 w-inline-block" style={{cursor: 'pointer'}} onClick={() => searchFormRef.current?.requestSubmit()}> 
                    <div className="code-embed-6 w-embed">
                      {isSearching ? (
                        <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.5 17.5L13.8834 13.8833" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      )}
                    </div>
                  </div>
                  <input 
                    ref={searchInputRef}
                    className="text-field w-input" 
                    maxLength={256} 
                    name="customSearch" 
                    data-custom-input="true" 
                    placeholder={showPlaceholder ? "Введите код запчасти, VIN номер или госномер автомобиля" : ""} 
                    type="text" 
                    id="customSearchInput" 
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    disabled={isSearching}
                  />
                </form>
                
                {/* История поиска */}
                <SearchHistoryDropdown
                  isVisible={showSearchHistory && !showResults}
                  historyItems={searchHistoryItems}
                  onItemClick={handleHistoryItemClick}
                  loading={historyLoading}
                />
                
                {/* Результаты поиска VIN */}
                {showResults && searchResults.length > 0 && (searchType === 'vin' || searchType === 'plate') && (
                  <div 
                    className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-50 max-h-80 overflow-y-auto"
                  >
                    <div className="p-3 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-900">
                        {searchType === 'vin' ? 'Найденные автомобили по VIN' : 'Найденные автомобили по госномеру'}
                      </h3>
                    </div>
                    {searchResults.map((vehicle, index) => (
                      <button
                        key={`${vehicle.vehicleid}-${index}`}
                        onClick={() => handleVehicleSelect(vehicle)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {vehicle.brand} {vehicle.model}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {vehicle.modification} • {vehicle.year} • {vehicle.bodytype}
                            </p>
                            {vehicle.engine && (
                              <p className="text-xs text-gray-500">
                                Двигатель: {vehicle.engine}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Результаты поиска по артикулу */}
                {showResults && searchType === 'oem' && (
                  <div 
                    ref={searchDropdownRef}
                    className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-50 max-h-96 overflow-y-auto"
                  >
                    {/* Переключатель режимов поиска */}
                    <div className="p-3 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900">Поиск по артикулу: {searchQuery}</h3>
                      </div>
                      <div className="flex space-x-1 bg-gray-200 rounded-lg p-1">
                        <button
                          onClick={() => {
                            setOemSearchMode('parts');
                            if (oemSearchMode !== 'parts') {
                              handleOEMSearch(searchQuery.trim().toUpperCase());
                            }
                          }}
                          className={`flex-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                            oemSearchMode === 'parts'
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          🔧 Найти детали
                        </button>
                        <button
                          onClick={() => {
                            setOemSearchMode('vehicles');
                            if (oemSearchMode !== 'vehicles') {
                              handlePartVehicleSearch(searchQuery.trim().toUpperCase());
                            }
                          }}
                          className={`flex-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                            oemSearchMode === 'vehicles'
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          🚗 Найти автомобили
                        </button>
                      </div>
                    </div>

                    {/* Результаты поиска деталей */}
                    {oemSearchMode === 'parts' && oemSearchResults && oemSearchResults.details.length > 0 && (
                      <>
                        <div className="p-3 border-b border-gray-100">
                          <p className="text-xs text-gray-600">Найдено {oemSearchResults.details.length} деталей</p>
                        </div>
                        {oemSearchResults.details.slice(0, 5).map((detail, index) => (
                          <div
                            key={`${detail.detailid}-${index}`}
                            className="p-3 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 text-sm">
                                  {detail.name}
                                </h4>
                                <p className="text-xs text-gray-600 mt-1">
                                  <span className="font-medium">OEM:</span> {detail.formattedoem}
                                </p>
                                <p className="text-xs text-gray-600">
                                  <span className="font-medium">Производитель:</span> {detail.manufacturer}
                                </p>
                                {detail.replacements.length > 0 && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    +{detail.replacements.length} аналогов
                                  </p>
                                )}
                              </div>
                              <div className="text-right ml-2">
                                <button 
                                  onClick={() => {
                                    // Переходим на страницу поиска по артикулу
                                    router.push(`/search?q=${encodeURIComponent(detail.formattedoem)}&mode=parts`);
                                    setShowResults(false);
                                    setSearchQuery('');
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Подробнее
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {oemSearchResults.details.length > 5 && (
                          <div className="p-3 text-center border-t border-gray-100">
                            <button 
                              onClick={() => {
                                router.push(`/search?q=${encodeURIComponent(searchQuery)}&mode=parts`);
                                setShowResults(false);
                                setSearchQuery('');
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Показать все {oemSearchResults.details.length} деталей
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {/* Результаты поиска автомобилей по артикулу */}
                    {oemSearchMode === 'vehicles' && vehiclesByPartResults && vehiclesByPartResults.totalVehicles > 0 && (
                      <>
                        <div className="p-3 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-600">
                              Найдено {vehiclesByPartResults.totalVehicles} автомобилей в {vehiclesByPartResults.catalogs.length} каталогах
                            </p>
                            <button 
                              onClick={() => {
                                // Переходим на страницу со всеми автомобилями по артикулу
                                const cleanPartNumber = searchQuery.trim();
                                router.push(`/vehicles-by-part?partNumber=${encodeURIComponent(cleanPartNumber)}`);
                                setShowResults(false);
                                setSearchQuery('');
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Показать все
                            </button>
                          </div>
                        </div>
                        
                        {vehiclesByPartResults.catalogs.map((catalog, catalogIndex) => (
                          <div key={catalog.catalogCode} className="border-b border-gray-100 last:border-b-0">
                            <div className="p-3 bg-gray-50">
                              <h4 className="text-sm font-medium text-gray-800">
                                {catalog.brand} ({catalog.vehicleCount} автомобилей)
                              </h4>
                            </div>
                            
                            {catalog.vehicles.slice(0, 3).map((vehicle, vehicleIndex) => (
                              <button
                                key={`${vehicle.vehicleid}-${catalogIndex}-${vehicleIndex}`}
                                onClick={() => handleVehicleSelect(vehicle)}
                                className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900 text-sm">
                                      {vehicle.name || `${vehicle.brand} ${vehicle.model}`}
                                    </h5>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {vehicle.modification}
                                    </p>
                                    {vehicle.year && (
                                      <p className="text-xs text-gray-500">
                                        Год: {vehicle.year}
                                      </p>
                                    )}
                                    {vehicle.engine && (
                                      <p className="text-xs text-gray-500">
                                        Двигатель: {vehicle.engine}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </div>
                              </button>
                            ))}
                            
                            {catalog.vehicles.length > 3 && (
                              <div className="p-2 text-center bg-gray-50">
                                <button 
                                  onClick={() => {
                                    // Переходим на страницу со всеми автомобилями по артикулу
                                    console.log('Показать все автомобили в каталоге:', catalog.catalogCode);
                                    // Используем оригинальный артикул без лишних символов
                                    const cleanPartNumber = searchQuery.trim();
                                    router.push(`/vehicles-by-part?partNumber=${encodeURIComponent(cleanPartNumber)}&catalogCode=${catalog.catalogCode}`);
                                    setShowResults(false);
                                    setSearchQuery('');
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Показать все {catalog.vehicles.length} автомобилей в {catalog.brand}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    )}

                    {/* Сообщения об отсутствии результатов */}
                    {oemSearchMode === 'parts' && (!oemSearchResults || oemSearchResults.details.length === 0) && !isSearching && (
                      <div className="p-4 text-center">
                        <div className="text-yellow-400 mb-2">
                          <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 14.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">Детали не найдены</h3>
                        <p className="text-xs text-gray-600">
                          Детали с артикулом {searchQuery} не найдены в базе данных
                        </p>
                      </div>
                    )}

                    {oemSearchMode === 'vehicles' && (!vehiclesByPartResults || vehiclesByPartResults.totalVehicles === 0) && !isSearching && (
                      <div className="p-4 text-center">
                        <div className="text-yellow-400 mb-2">
                          <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 14.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">Автомобили не найдены</h3>
                        <p className="text-xs text-gray-600">
                          Автомобили с артикулом {searchQuery} не найдены в каталогах
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Сообщение о том, что VIN/госномер не найден */}
                {showResults && searchResults.length === 0 && (searchType === 'vin' || searchType === 'plate') && !isSearching && (
                  <div 
                    ref={searchDropdownRef}
                    className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-50"
                  >
                    <div className="p-4 text-center">
                      <div className="text-yellow-400 mb-2">
                        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 14.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        {searchType === 'vin' ? 'VIN не найден' : 'Госномер не найден'}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {searchType === 'vin' 
                          ? `Автомобиль с VIN ${searchQuery} не найден в доступных каталогах`
                          : `Автомобиль с госномером ${searchQuery} не найден в базе данных`
                        }
                      </p>
                    </div>
                  </div>
                )}

                <div className="success-message w-form-done">
                  <div>Thank you! Your submission has been received!</div>
                </div>
                <div className="error-message w-form-fail">
                  <div>Oops! Something went wrong while submitting the form.</div>
                </div>
              </div>
              <div className="w-layout-hflex flex-block-76">
                <Link href="/profile-history" className="button_h w-inline-block">
                
    <img src="/images/union.svg" alt="История заказов" width={20} />

                </Link>
                <Link href="/profile-gar" className="button_h w-inline-block">
                    <div className="code-embed-7 w-embed"><svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M27 10.8V24H24.6V13.2H5.4V24H3V10.8L15 6L27 10.8ZM23.4 14.4H6.6V16.8H23.4V14.4ZM23.4 18H6.6V20.4H23.4V18Z" fill="currentColor" /><path d="M6.6 21.6H23.4V24H6.6V21.6Z" fill="currentColor" /></svg></div>
                    <div className="text-block-2">Добавить в гараж</div>
                </Link>
                <Link href="/favorite" className="button_h w-inline-block">
                  <div className="code-embed-7 w-embed"><svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 25L13.405 23.5613C7.74 18.4714 4 15.1035 4 10.9946C4 7.6267 6.662 5 10.05 5C11.964 5 13.801 5.88283 15 7.26703C16.199 5.88283 18.036 5 19.95 5C23.338 5 26 7.6267 26 10.9946C26 15.1035 22.26 18.4714 16.595 23.5613L15 25Z" fill="currentColor" /></svg></div>
                  <div className="text-block-2">Избранное</div>
                </Link>
                <button 
                  onClick={() => {
                    if (currentUser) {
                      router.push('/profile-orders');
                    } else {
                      onOpenAuthModal();
                    }
                  }}
                  className="button_h login w-inline-block"
                  style={{  cursor: 'pointer' }}
                >
                  <div className="code-embed-8 w-embed"><svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 3C8.376 3 3 8.376 3 15C3 21.624 8.376 27 15 27C21.624 27 27 21.624 27 15C27 8.376 21.624 3 15 3ZM15 7.8C17.316 7.8 19.2 9.684 19.2 12C19.2 14.316 17.316 16.2 15 16.2C12.684 16.2 10.8 14.316 10.8 12C10.8 9.684 12.684 7.8 15 7.8ZM15 24.6C12.564 24.6 9.684 23.616 7.632 21.144C9.73419 19.4955 12.3285 18.5995 15 18.5995C17.6715 18.5995 20.2658 19.4955 22.368 21.144C20.316 23.616 17.436 24.6 15 24.6Z" fill="currentColor" /></svg></div>
                  <div className="text-block-2">{currentUser ? 'Личный кабинет' : 'Войти'}</div>
                </button>
                <CartButton />
              </div>
            </div>
        </div>
      </section>
      {/** <BottomHead menuOpen={menuOpen} onClose={() => setMenuOpen(false)} /> */}
    </>
  );
};

export default Header; 
