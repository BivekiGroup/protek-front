import React from "react";
import FilterDropdown from "./filters/FilterDropdown";
import FilterRange from "./filters/FilterRange";

// Типизация для фильтра
export type FilterConfig =
  | {
      type: "dropdown";
      title: string;
      options: string[];
      multi?: boolean;
      showAll?: boolean;
      defaultOpen?: boolean;
      alwaysOpen?: boolean;
      hasMore?: boolean;
      onShowMore?: () => void;
    }
  | {
      type: "range";
      title: string;
      min: number;
      max: number;
    };

interface FiltersProps {
  filters: FilterConfig[];
  onFilterChange: (type: string, value: any) => void;
  filterValues?: {
    [key: string]: any;
  };
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  isLoading?: boolean;
}

const Filters: React.FC<FiltersProps> = ({ 
  filters, 
  onFilterChange, 
  filterValues = {},
  searchQuery = '',
  onSearchChange,
  isLoading = false
}) => (
  <div className="w-layout-vflex flex-block-12">
    {/* Поиск - показываем только если есть обработчик */}
    {onSearchChange && (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '12px 30px',
          gap: '20px',
          width: '280px',
          height: '58px',
          background: '#FFFFFF',
          borderRadius: '8px',
          marginBottom: '4px',
          cursor: 'text',
          transition: 'box-shadow 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <input
          style={{
            width: '100%',
            height: '24px',
            fontFamily: 'Onest',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '140%',
            display: 'flex',
            alignItems: 'center',
            color: searchQuery ? '#000814' : '#747474',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            flex: 1
          }}
          maxLength={256}
          name="Search"
          placeholder="Поиск по названию, бренду или артикулу"
          type="text"
          id="Search-4"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
        <div style={{ width: '24px', height: '24px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="7" stroke="#8893A2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 15L20 20" stroke="#8893A2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    )}
    {/* Фильтры из пропса */}
    {filters.map((filter, idx) => {
      if (filter.type === "dropdown") {
        return (
          <FilterDropdown
            key={filter.title + idx}
            title={filter.title}
            options={filter.options}
            multi={filter.multi}
            showAll={filter.showAll}
            defaultOpen={filter.defaultOpen}
            alwaysOpen={filter.alwaysOpen}
            selectedValues={(filterValues && filterValues[filter.title]) || []}
            onChange={(values) => onFilterChange(filter.title, values)}
          />
        );
      }
      if (filter.type === "range") {
        return (
          <FilterRange
            key={filter.title + idx + JSON.stringify((filterValues && filterValues[filter.title]) || null)}
            title={filter.title}
            min={filter.min}
            max={filter.max}
            value={(filterValues && filterValues[filter.title]) || null}
            onChange={(value) => onFilterChange(filter.title, value)}
          />
        );
      }
      return null;
    })}
  </div>
);

export default Filters; 