import React from 'react';
import { PartsSearchHistoryItem } from '@/lib/graphql/search-history';

interface SearchHistoryDropdownProps {
  isVisible: boolean;
  historyItems: PartsSearchHistoryItem[];
  onItemClick: (item: PartsSearchHistoryItem) => void;
  loading?: boolean;
}

const SearchHistoryDropdown: React.FC<SearchHistoryDropdownProps> = ({
  isVisible,
  historyItems,
  onItemClick,
  loading = false
}) => {
  if (!isVisible) return null;

  // Фильтруем уникальные запросы
  const uniqueQueries = Array.from(
    new Map(
      historyItems.map(item => [item.searchQuery.toLowerCase(), item])
    ).values()
  );

  const getSearchTypeLabel = (type: string) => {
    switch (type) {
      case 'VIN':
        return 'VIN';
      case 'PLATE':
        return 'Госномер';
      case 'OEM':
      case 'ARTICLE':
        return 'Артикул';
      default:
        return 'Поиск';
    }
  };

  return (
    <div className="search-history-dropdown-custom">
      {loading ? (
        <div className="p-4 text-center text-gray-500">
          <div className="flex items-center justify-center">
            <svg className="animate-spin w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Загрузка истории...
          </div>
        </div>
      ) : uniqueQueries.length > 0 ? (
        <>
          {uniqueQueries.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemClick(item)}
              className="search-history-item-custom"
              style={{ cursor: 'pointer' }}
            >
              <div className="flex items-center gap-3">
                <span className="search-history-icon-custom">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                </span>
                <span className="search-history-inline">
                  <span className="search-history-query-custom">
                    {(item.searchType === 'ARTICLE' || item.searchType === 'OEM') && item.articleNumber
                      ? item.articleNumber
                      : item.searchQuery}
                  </span>
                  <span className="search-history-type-custom">{getSearchTypeLabel(item.searchType)}</span>
                </span>
              </div>
            </button>
          ))}
        </>
      ) : (
        <div className="p-4 text-center text-gray-500">
          <p className="text-sm">История поиска пуста</p>
        </div>
      )}
      <style>{`
        .search-history-dropdown-custom {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(44,62,80,0.08), 0 1px 3px rgba(44,62,80,0.06);
          margin-top: 8px;
          z-index: 50;
          max-height: 180px;
          overflow-y: auto;
          border: 1px solid #f0f0f0;
          padding: 4px 0;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE и Edge */
        }
        .search-history-dropdown-custom::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        .search-history-item-custom {
          width: 100%;
          background: none;
          border: none;
          outline: none;
          padding: 8px 14px;
          border-radius: 0;
          transition: background 0.15s;
          display: block;
        }
        .search-history-item-custom:hover, .search-history-item-custom:focus {
          background: #f3f4f6;
        }
        .search-history-item-custom .flex {
          flex-direction: row-reverse;
        }
        .search-history-icon-custom {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f3f4f6;
          color: #666;
          flex-shrink: 0;
          margin-left: 8px;
          margin-right: 0;
        }
        .search-history-item-custom:hover .search-history-icon-custom,
        .search-history-item-custom:focus .search-history-icon-custom {
          background: #ec1c24;
          color: #fff;
        }
        .search-history-inline {
          display: flex;
          flex: 1 1 0%;
          min-width: 0;
          align-items: center;
          gap: 6px;
        }
        .search-history-query-custom {
          font-size: 13px;
          font-weight: 500;
          color: #222;
          margin: 0;
          line-height: 1.2;
          letter-spacing: 0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1 1 0%;
          min-width: 0;
        }
        .search-history-type-custom {
          font-size: 11px;
          color: #8e9aac;
          margin: 0 0 0 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};

export default SearchHistoryDropdown; 