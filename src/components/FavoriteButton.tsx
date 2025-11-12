import React from "react";
import Link from "next/link";
import { useFavorites } from "@/contexts/FavoritesContext";

interface FavoriteButtonProps {
  onProtectedNavigation?: (event: React.MouseEvent<HTMLAnchorElement>, path: string) => void;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ onProtectedNavigation }) => {
  const { favorites } = useFavorites();

  const totalItems = favorites.length;

  return (
    <Link
      href="/favorite"
      className="button_h w-inline-block"
      onClick={(event) => onProtectedNavigation && onProtectedNavigation(event, '/favorite')}
    >
      <div className="code-embed-7 w-embed">
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 25L13.405 23.5613C7.74 18.4714 4 15.1035 4 10.9946C4 7.6267 6.662 5 10.05 5C11.964 5 13.801 5.88283 15 7.26703C16.199 5.88283 18.036 5 19.95 5C23.338 5 26 7.6267 26 10.9946C26 15.1035 22.26 18.4714 16.595 23.5613L15 25Z" fill="currentColor" />
        </svg>
      </div>
      <div className="text-block-2">Избранное</div>
      {totalItems > 0 && (
        <div className="pcs-info">
          <div className="text-block-39">{totalItems}</div>
        </div>
      )}
    </Link>
  );
};

export default FavoriteButton;
