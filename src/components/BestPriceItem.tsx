import React, { useCallback, useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import toast from "react-hot-toast";

interface BestPriceItemProps {
  image: string;
  salePercent?: number;
  newPrice: string;
  oldPrice?: string;
  title: string;
  brand: string;
  article?: string;
  productId?: string;
  onAddToCart?: (e: React.MouseEvent) => void;
  isInCart?: boolean;
}

const BestPriceItem: React.FC<BestPriceItemProps> = ({
  image,
  salePercent,
  newPrice,
  oldPrice,
  title,
  brand,
  article,
  productId,
  onAddToCart,
  isInCart = false,
}) => {
  const { addItem, isInCart: isItemInCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite, favorites } = useFavorites();
  const [localInCart, setLocalInCart] = useState(false);

  const inCartContext = isItemInCart(productId, undefined, article, brand);
  const inCart = isInCart || inCartContext;

  const isItemFavorite = isFavorite(productId, undefined, article, brand);
  const cartDisabled = inCart;

  const parsePrice = (priceStr: string): number => {
    const cleanPrice = priceStr.replace(/[^\d.,]/g, "").replace(",", ".");
    return parseFloat(cleanPrice) || 0;
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (cartDisabled || localInCart) {
      return;
    }

    if (onAddToCart) {
      onAddToCart(e);
      return;
    }

    try {
      const numericPrice = parsePrice(newPrice);

      if (numericPrice <= 0) {
        toast.error("Цена товара не найдена");
        return;
      }

      const result = await addItem({
        productId,
        name: title,
        description: `${brand} - ${title}`,
        brand,
        article,
        price: numericPrice,
        currency: "RUB",
        quantity: 1,
        image,
        supplier: "Protek",
        deliveryTime: "1 день",
        isExternal: false,
      });

      if (result.success) {
        setLocalInCart(true);
        toast.success(
          <div>
            <div className="font-semibold" style={{ color: "#fff" }}>
              Товар добавлен в корзину!
            </div>
            <div className="text-sm" style={{ color: "#fff", opacity: 0.9 }}>
              {`${brand} - ${title}`}
            </div>
          </div>,
          { duration: 3000 }
        );
      } else {
        toast.error(result.error || "Ошибка при добавлении товара в корзину");
      }
    } catch (error) {
      console.error("Ошибка добавления в корзину:", error);
      toast.error("Ошибка при добавлении товара в корзину");
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isItemFavorite) {
      const favoriteItem = favorites.find((fav: any) => {
        if (productId && fav.productId === productId) return true;
        if (fav.article === article && fav.brand === brand) return true;
        return false;
      });

      if (favoriteItem) {
        removeFromFavorites(favoriteItem.id);
      }
    } else {
      const numericPrice = parsePrice(newPrice);
      addToFavorites({
        productId,
        name: title,
        brand,
        article: article || "",
        price: numericPrice,
        currency: "RUB",
        image,
      });
    }
  };

  const cardUrl =
    article && brand
      ? `/card?article=${encodeURIComponent(article)}&brand=${encodeURIComponent(brand)}${
          productId ? `&artId=${encodeURIComponent(productId)}` : ""
        }`
      : productId
      ? `/card?artId=${encodeURIComponent(productId)}`
      : "/card";

  const handleOpenCard = useCallback(() => {
    window.location.href = cardUrl;
  }, [cardUrl]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenCard();
    }
  };

  const favoriteLabel = isItemFavorite ? "Удалить из избранного" : "Добавить в избранное";
  const cartLabel = cartDisabled ? "Товар уже в корзине" : localInCart ? "Товар добавлен" : "Добавить в корзину";

  return (
    <div
      className="best-price-card relative flex flex-col"
      onClick={handleOpenCard}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
      style={{ cursor: "pointer" }}
    >
      <button
        type="button"
        className={`favcardcat${isItemFavorite ? " favorite-active" : ""}`}
        onClick={handleFavoriteClick}
        aria-label={favoriteLabel}
        title={favoriteLabel}
        style={{ position: "absolute", top: 14, right: 14, border: "none", padding: 0 }}
      >
        <Heart
          className="w-[20px] h-[20px]"
          strokeWidth={1.6}
          fill={isItemFavorite ? "#EC1C24" : "none"}
          color={isItemFavorite ? "#EC1C24" : "#0F172A"}
        />
      </button>

      <div className="div-block-4">
        <img src={image} loading="lazy" alt={title} className="image-5" />
        {typeof salePercent === "number" && salePercent > 0 ? (
          <div className="text-block-7 best-price-discount">-{salePercent}%</div>
        ) : null}
      </div>

      <div className="div-block-3 flex flex-col gap-3 flex-1">
        <div className="w-layout-hflex flex-block-16 best-price-price-row">
          <div className="text-block-8">{newPrice}</div>
          {oldPrice ? <div className="text-block-9 best-price-old-price">{oldPrice}</div> : null}
        </div>
        <div className="w-layout-vflex">
          <div className="text-block-10">{title}</div>
        </div>
      </div>

      <button
        type="button"
        className={`button-icon w-inline-block ${cartDisabled ? "in-cart" : ""}`}
        onClick={cartDisabled ? undefined : handleAddToCart}
        disabled={cartDisabled || localInCart}
        aria-label={cartLabel}
        title={cartLabel}
        style={{
          position: "absolute",
          bottom: 18,
          right: 18,
          border: "none",
          padding: 0,
          cursor: cartDisabled ? "default" : localInCart ? "default" : "pointer",
          opacity: cartDisabled || localInCart ? 0.65 : 1,
          background: cartDisabled ? "#94A3B8" : localInCart ? "#2563eb" : undefined,
        }}
      >
        <ShoppingCart className="w-4 h-4 text-white" strokeWidth={1.6} />
      </button>
    </div>
  );
};

export default BestPriceItem;
