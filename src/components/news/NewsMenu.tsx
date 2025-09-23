import React, { useState, useMemo } from "react";

interface NewsMenuProps {
  categories: string[];
}

const NewsMenu: React.FC<NewsMenuProps> = ({ categories }) => {
  const menuCategories = useMemo(() => {
    return categories.length ? categories : ["Все"];
  }, [categories]);

  const [active, setActive] = useState<number | null>(
    menuCategories.length ? 0 : null
  );

  const handleClick = (idx: number) => {
    setActive(active === idx ? null : idx);
  };

  return (
    <div className="w-layout-hflex menu-category">
      {menuCategories.map((cat, idx) => (
        <div
          key={cat}
          className={
            idx === active
              ? "tab-menu-category-activ"
              : "tab-menu-category"
          }
          onClick={() => handleClick(idx)}
          style={{ cursor: "pointer" }}
        >
          {cat}
        </div>
      ))}
    </div>
  );
};

export default NewsMenu; 
