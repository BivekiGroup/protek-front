import React from 'react';
import { PartsSearchHistoryItem } from '@/lib/graphql/search-history';

interface SearchHistoryDropdownProps {
  isVisible: boolean;
  historyItems: PartsSearchHistoryItem[];
  onItemClick: (searchQuery: string) => void;
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
              onClick={() => {
                if ((item.searchType === 'ARTICLE' || item.searchType === 'OEM') && item.articleNumber) {
                  onItemClick(item.articleNumber);
                } else {
                  onItemClick(item.searchQuery);
                }
              }}
              className="search-history-item-custom"
              style={{ cursor: 'pointer' }}
            >
              <div className="flex items-center gap-3">
                <span className="search-history-icon-custom">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                </span>
                <span className="search-history-inline">
                  <span className="search-history-query-custom">{item.searchQuery}</span>
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
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(44,62,80,0.10), 0 1.5px 4px rgba(44,62,80,0.08);
          margin-top: 12px;
          z-index: 50;
          max-height: 260px;
          overflow-y: auto;
          border: 1px solid #f0f0f0;
          padding: 6px 0;
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
          padding: 12px 20px;
          border-radius: 0;
          transition: background 0.18s;
          display: block;
        }
        .search-history-item-custom:hover, .search-history-item-custom:focus {
          background: #e5e7eb;
        }
        .search-history-item-custom .flex {
          flex-direction: row-reverse;
        }
        .search-history-icon-custom {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f3f4f6;
          color: #222;
          flex-shrink: 0;
          margin-left: 12px;
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
          gap: 8px;
        }
        .search-history-query-custom {
          font-size: 15px;
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
          font-size: 12px;
          color: #8e9aac;
          margin: 0 0 0 8px;
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