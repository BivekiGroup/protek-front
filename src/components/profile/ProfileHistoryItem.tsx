import React from "react";
import { useRouter } from "next/router";

interface VehicleInfo {
  brand?: string;
  model?: string;
  year?: number;
}

interface ProfileHistoryItemProps {
  id: string;
  date: string;
  manufacturer: string;
  article: string;
  name: string;
  vehicleInfo?: VehicleInfo;
  resultCount?: number;
  onDelete?: (id: string) => void;
  // Добавляем новые пропсы для поиска
  searchType?: 'TEXT' | 'ARTICLE' | 'OEM' | 'VIN' | 'PLATE' | 'WIZARD' | 'PART_VEHICLES';
  articleNumber?: string;
  brand?: string;
}

const ProfileHistoryItem: React.FC<ProfileHistoryItemProps> = ({
  id,
  date,
  manufacturer,
  article,
  name,
  vehicleInfo,
  resultCount,
  onDelete,
  searchType,
  articleNumber,
  brand,
}) => {
  const router = useRouter();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  const handleItemClick = () => {
    // Определяем куда перенаправлять в зависимости от типа поиска
    if (searchType === 'VIN' || searchType === 'PLATE') {
      // Для VIN и госномера перенаправляем на vehicle-search-results
      router.push(`/vehicle-search-results?q=${encodeURIComponent(name)}`);
    } else if (searchType === 'ARTICLE' || searchType === 'OEM' || (searchType === 'TEXT' && articleNumber)) {
      // Для поиска по артикулу/OEM или текстового поиска с артикулом
      const searchBrand = brand || manufacturer || '';
      const searchArticle = articleNumber || name;
      router.push(`/search-result?article=${encodeURIComponent(searchArticle)}&brand=${encodeURIComponent(searchBrand)}`);
    } else if (searchType === 'TEXT') {
      // Для обычного текстового поиска
      router.push(`/search?q=${encodeURIComponent(name)}&mode=parts`);
    } else if (searchType === 'PART_VEHICLES') {
      // Для поиска автомобилей по детали
      router.push(`/vehicles-by-part?partNumber=${encodeURIComponent(name)}`);
    } else {
      // По умолчанию - обычный поиск
      router.push(`/search?q=${encodeURIComponent(name)}&mode=parts`);
    }
  };

  const getSearchTypeDisplay = (article: string) => {
    if (article.includes('TEXT')) return 'Текстовый поиск';
    if (article.includes('ARTICLE')) return 'По артикулу';
    if (article.includes('OEM')) return 'По OEM';
    if (article.includes('VIN')) return 'Поиск по VIN';
    if (article.includes('PLATE')) return 'Поиск по госномеру';
    if (article.includes('WIZARD')) return 'Поиск по параметрам';
    if (article.includes('PART_VEHICLES')) return 'Поиск авто по детали';
    return article;
  };

  return (
    <>
      <div className="mt-1.5 w-full border border-gray-200 border-solid min-h-[1px] max-md:max-w-full" />
      <div 
        className="flex justify-between items-center px-5 pt-1.5 pb-2 mt-1.5 w-full bg-white rounded-lg max-md:max-w-full max-md:flex-col max-md:min-w-0 hover:bg-gray-50 transition-colors"
        onClick={handleItemClick}
        style={{ cursor: 'pointer' }}
      >
        <div className="flex flex-wrap flex-1 shrink gap-5 items-center self-stretch pr-5 my-auto w-full basis-0  max-md:max-w-full max-md:flex-col max-md:gap-2 max-md:p-0 max-md:min-w-0">
          <div className="self-stretch my-auto w-40 max-md:w-full text-sm">
            <div className="font-medium text-gray-900">{date}</div>
            {vehicleInfo && (
              <div className="text-xs text-gray-500 mt-1">
                {vehicleInfo.brand} {vehicleInfo.model} {vehicleInfo.year}
              </div>
            )}
          </div>
          
          <div className="self-stretch my-auto w-40 font-bold leading-snug text-gray-950 max-md:w-full">
            {manufacturer}
          </div>
          
          <div className="self-stretch my-auto font-medium leading-snug text-gray-700 w-[180px] max-md:w-full text-sm">
            {getSearchTypeDisplay(article)}
            {resultCount !== undefined && (
              <div className="text-xs text-gray-500 mt-1">
                Найдено: {resultCount} шт.
              </div>
            )}
          </div>
          
          <div className="flex-1 shrink self-stretch my-auto basis-0 max-md:max-w-full max-md:w-full">
            <div className="font-medium text-gray-900">{name}</div>
          </div>
          
          {onDelete && (
            <div className="w-16 text-center max-md:w-full">
              <button
                onClick={handleDeleteClick}
                className="flex items-center p-2 group"
                title="Удалить из истории"
                aria-label="Удалить из истории"
                tabIndex={0}
                onMouseEnter={e => {
                  const path = e.currentTarget.querySelector('path');
                  if (path) path.setAttribute('fill', '#ec1c24');
                }}
                onMouseLeave={e => {
                  const path = e.currentTarget.querySelector('path');
                  if (path) path.setAttribute('fill', '#D0D0D0');
                }}
                >
                <svg width="16" height="16" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4.625 17.5C4.14375 17.5 3.73192 17.3261 3.3895 16.9782C3.04708 16.6304 2.87558 16.2117 2.875 15.7222V4.16667H2V2.38889H6.375V1.5H11.625V2.38889H16V4.16667H15.125V15.7222C15.125 16.2111 14.9538 16.6298 14.6114 16.9782C14.269 17.3267 13.8568 17.5006 13.375 17.5H4.625ZM6.375 13.9444H8.125V5.94444H6.375V13.9444ZM9.875 13.9444H11.625V5.94444H9.875V13.9444Z"
                    fill="#D0D0D0"
                    style={{ transition: 'fill 0.2s' }}
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileHistoryItem; 