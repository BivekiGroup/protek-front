import React, { useState } from 'react';

interface CatalogSortTabsProps {
  active: number;
  onChange: (index: number) => void;
  options?: string[];
}

const CatalogSortTabs: React.FC<CatalogSortTabsProps> = ({
  active,
  onChange,
  options = ['Популярные', 'Сначала дешевле', 'Сначала дороже', 'Высокий рейтинг']
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 0,
        gap: '18px',
        height: '40px',
      }}
    >
      {options.map((option, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            padding: 0,
            height: '40px',
            cursor: 'pointer',
          }}
          onClick={() => onChange(index)}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0px 20px 18px',
              gap: '10px',
              height: '40px',
              borderBottom: `3px solid ${active === index ? '#EC1C24' : hoveredIndex === index ? '#EC1C24' : '#D0D0D0'}`,
              borderRadius: '0px',
              transition: 'border-bottom-color 0.2s',
            }}
          >
            <span
              style={{
                fontFamily: 'Onest',
                fontStyle: 'normal',
                fontWeight: active === index ? 700 : 500,
                fontSize: '16px',
                lineHeight: '140%',
                textAlign: 'center',
                color: active === index ? '#000814' : hoveredIndex === index ? '#EC1C24' : '#8893A2',
                whiteSpace: 'nowrap',
                transition: 'color 0.2s, font-weight 0.2s',
              }}
            >
              {option}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CatalogSortTabs;
