
import React from "react";
import { useFavorites } from "@/contexts/FavoritesContext";

interface InfoCardProps {
  brand?: string;
  articleNumber?: string;
  name?: string;
  productId?: string;
  offerKey?: string;
  price?: number;
  currency?: string;
  image?: string;
}

export default function InfoCard({ 
  brand, 
  articleNumber, 
  name, 
  productId, 
  offerKey, 
  price = 0, 
  currency = 'RUB', 
  image 
}: InfoCardProps) {
  const { addToFavorites, removeFromFavorites, isFavorite, favorites } = useFavorites();

  // Проверяем, есть ли товар в избранном
  const isItemFavorite = isFavorite(productId, offerKey, articleNumber, brand);

  // Обработчик клика по сердечку
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isItemFavorite) {
      // Находим товар в избранном по правильному ID
      const favoriteItem = favorites.find((fav: any) => {
        // Проверяем по разным комбинациям идентификаторов
        if (productId && fav.productId === productId) return true;
        if (offerKey && fav.offerKey === offerKey) return true;
        if (fav.article === articleNumber && fav.brand === brand) return true;
        return false;
      });
      
      if (favoriteItem) {
        removeFromFavorites(favoriteItem.id);
      }
    } else {
      // Добавляем в избранное
      addToFavorites({
        productId,
        offerKey,
        name: name || "Название товара",
        brand: brand || "БРЕНД",
        article: articleNumber || "АРТИКУЛ",
        price,
        currency,
        image
      });
    }
  };

  // InfoCard больше не рендерит breadcrumbs и заголовок - это делает CatalogInfoHeader
  return null;
} 