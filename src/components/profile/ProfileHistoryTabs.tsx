import React, { useState, useRef } from "react";
import { PartsSearchHistoryItem } from '@/lib/graphql/search-history';

interface ProfileHistoryTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  historyItems: PartsSearchHistoryItem[];
  selectedManufacturer: string;
  onManufacturerChange: (manufacturer: string) => void;
}

const ProfileHistoryTabs: React.FC<ProfileHistoryTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  historyItems,
  selectedManufacturer,
  onManufacturerChange,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Получаем уникальных производителей из истории поиска
  const getUniqueManufacturers = () => {
    const manufacturersSet = new Set<string>();
    
    historyItems.forEach(item => {
      // Добавляем бренд из поля brand
      if (item.brand) {
        manufacturersSet.add(item.brand);
      }
      // Добавляем бренд из информации об автомобиле
      if (item.vehicleInfo?.brand) {
        manufacturersSet.add(item.vehicleInfo.brand);
      }
    });

    const uniqueManufacturers = Array.from(manufacturersSet).sort();
    return ["Все", ...uniqueManufacturers];
  };

  const manufacturers = getUniqueManufacturers();

  // Закрытие дропдауна при клике вне
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleManufacturerSelect = (manufacturer: string) => {
    onManufacturerChange(manufacturer);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex flex-wrap gap-5 w-full max-md:max-w-full">
      {tabs.map((tab) => (
        <div
          key={tab}
          className={`flex flex-1 shrink gap-5 items-center h-full text-center rounded-xl basis-12 min-w-[160px] text-[14px] ${
            activeTab === tab
              ? "text-white"
              : "bg-slate-200 text-gray-950"
          }`}
          style={{ cursor: "pointer" }}
          onClick={() => onTabChange(tab)}
        >
          <div
            className={`flex-1 shrink gap-5 self-stretch px-6 py-3.5 my-auto w-full rounded-xl basis-0 min-w-[160px] text-[14px] max-md:px-5 ${
              activeTab === tab
                ? "text-white bg-red-600"
                : "bg-slate-200 text-gray-950"
            }`}
          >
            {tab}
          </div>
        </div>
      ))}
      <div
        className="relative w-[300px] max-w-full max-sm:w-full"
        ref={dropdownRef}
        tabIndex={0}
      >
        <div
          className="flex justify-between items-center px-6 py-3 text-sm leading-snug bg-white rounded border border-solid border-stone-300 text-neutral-500 cursor-pointer select-none w-full min-w-[200px]"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
        >
          <span className="truncate">{selectedManufacturer}</span>
          <span className="ml-2 flex-shrink-0 flex items-center">
            <svg 
              width="20" 
              height="20" 
              fill="none" 
              viewBox="0 0 20 20"
              className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
            >
              <path d="M6 8l4 4 4-4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
        {isDropdownOpen && (
          <ul className="absolute px-0 pb-2 pl-0 list-none left-0 top-full z-10 bg-white border-x border-b border-stone-300 rounded-b-lg shadow-lg w-full max-h-60 overflow-y-auto dropdown-scroll-invisible">
            {manufacturers.length === 0 ? (
              <li className="py-2 text-xs text-gray-400 text-center">
                Нет данных
              </li>
            ) : (
              manufacturers.map((manufacturer) => (
                <li
                  key={manufacturer}
                  className={`py-2 px-5 text-sm cursor-pointer hover:bg-blue-100 transition-colors ${manufacturer === selectedManufacturer ? 'bg-blue-50 text-red-600 font-normal' : 'text-neutral-500 font-medium'}`}
                  onMouseDown={() => handleManufacturerSelect(manufacturer)}
                >
                  {manufacturer}
                  {manufacturer !== "Все" && (
                    <span className="ml-2 text-[10px] text-gray-400">
                      ({historyItems.filter(item => 
                        item.brand === manufacturer || item.vehicleInfo?.brand === manufacturer
                      ).length})
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProfileHistoryTabs; 