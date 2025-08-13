import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showPageInfo?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  showPageInfo = true
}) => {
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 2; // Количество страниц вокруг текущей

    if (totalPages <= 7) {
      // Если страниц мало, показываем все
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Всегда показываем первую страницу
      pages.push(1);

      if (currentPage > delta + 2) {
        pages.push('...');
      }

      // Показываем страницы вокруг текущей
      const start = Math.max(2, currentPage - delta);
      const end = Math.min(totalPages - 1, currentPage + delta);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - delta - 1) {
        pages.push('...');
      }

      // Всегда показываем последнюю страницу
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      {/* Основные кнопки пагинации */}
      <div className="flex items-center justify-center space-x-2">
        {/* Предыдущая страница */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Номера страниц */}
        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="flex items-center justify-center w-10 h-10 text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="3" cy="10" r="1.5" />
                  <circle cx="10" cy="10" r="1.5" />
                  <circle cx="17" cy="10" r="1.5" />
                </svg>
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`flex items-center justify-center w-10 h-10 text-sm font-medium border rounded-lg transition-colors ${
                  currentPage === page
                    ? 'text-white bg-[#ec1c24] border-[#ec1c24] hover:bg-[#d91920]'
                    : 'text-gray-500 bg-white border-gray-200 hover:bg-gray-50 hover:text-gray-700'
                }`}
                style={{ cursor: 'pointer' }}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Следующая страница */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Информация о страницах */}
      {showPageInfo && (
        <div className="text-sm text-gray-500">
          Страница {currentPage} из {totalPages}
        </div>
      )}
    </div>
  );
};

export default Pagination; 