import React from "react";
import CatalogProductCard from "./CatalogProductCard";
import { useArticleImage } from "@/hooks/useArticleImage";
import { useCart } from "@/contexts/CartContext";
import { toast } from "react-hot-toast";
import CartIcon from "./CartIcon";

interface CartRecommendedProps {
  recommendedProducts?: any[];
  isLoadingPrices?: boolean;
}

// Компонент для отдельной карточки рекомендуемого товара с реальным изображением
const RecommendedProductCard: React.FC<{
  item: any;
  isLoadingPrice: boolean;
  formatPrice: (price: number | null, isLoading: boolean) => string;
}> = ({ item, isLoadingPrice, formatPrice }) => {
  const { imageUrl } = useArticleImage(item.artId, { enabled: !!item.artId });
  const { addItem } = useCart();

  // Если нет изображения, используем заглушку с иконкой (но не мокап-фотку)
  const displayImage = imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEwIiBoZWlnaHQ9IjE5MCIgdmlld0JveD0iMCAwIDIxMCAxOTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMTAiIGhlaWdodD0iMTkwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NSA5NUw5NSA4NUwxMjUgMTE1TDE0MCA5NUwxNjUgMTIwSDE2NVY5MEg0NVY5MEw4NSA5NVoiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iNzUiIGN5PSI3NSIgcj0iMTAiIGZpbGw9IiNEMUQ1REIiLz4KPHRleHQgeD0iMTA1IiB5PSIxNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gaW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';

  // Обработчик добавления в корзину с тоастером
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Извлекаем цену как число
      const numericPrice = item.minPrice || 0;

      if (numericPrice <= 0) {
        toast.error('Цена товара не найдена');
        return;
      }

      // Добавляем товар в корзину
      const result = await addItem({
        productId: String(item.artId) || undefined,
        name: item.name || `${item.brand} ${item.articleNumber}`,
        description: item.name || `${item.brand} ${item.articleNumber}`,
        price: numericPrice,
        currency: 'RUB',
        quantity: 1,
        stock: undefined, // информация о наличии не доступна для рекомендуемых товаров
        image: displayImage,
        brand: item.brand,
        article: item.articleNumber,
        supplier: 'AutoEuro',
        deliveryTime: '1 день',
        isExternal: true
      });

      if (result.success) {
        // Показываем успешный тоастер
        toast.success(
          <div>
            <div className="font-semibold" style={{ color: '#fff' }}>Товар добавлен в корзину!</div>
            <div className="text-sm" style={{ color: '#fff', opacity: 0.9 }}>{item.name || `${item.brand} ${item.articleNumber}`}</div>
          </div>,
          {
            duration: 3000,
            icon: <CartIcon size={20} color="#fff" />,
          }
        );
      } else {
        // Показываем ошибку
        toast.error(result.error || 'Ошибка при добавлении товара в корзину');
      }
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      toast.error('Ошибка при добавлении товара в корзину');
    }
  };

  return (
    <CatalogProductCard 
      image={displayImage}
      discount=""
      price={formatPrice(item.minPrice, isLoadingPrice && item.minPrice === undefined)}
      oldPrice=""
      title={item.name || `${item.brand} ${item.articleNumber}`}
      brand={item.brand}
      articleNumber={item.articleNumber}
      brandName={item.brand}
      artId={item.artId}
      productId={item.artId ? String(item.artId) : undefined} // Добавляем productId для работы избранного
      currency="RUB"
      onAddToCart={handleAddToCart} // Передаем обработчик добавления в корзину
    />
  );
};

const CartRecommended: React.FC<CartRecommendedProps> = ({ 
  recommendedProducts = [], 
  isLoadingPrices = false 
}) => {
  // Фильтруем и ограничиваем количество рекомендаций
  const validRecommendations = recommendedProducts
    .filter(item => item && item.brand && item.articleNumber) // Фильтруем только валидные товары
    .slice(0, 5); // Ограничиваем до 5 товаров

  // Если нет валидных рекомендаций, не показываем блок
  if (validRecommendations.length === 0) {
    return null;
  }

  const formatPrice = (price: number | null, isLoading: boolean = false) => {
    if (isLoading) return "Загрузка...";
    if (!price) return "По запросу";
    return `от ${price.toLocaleString('ru-RU')} ₽`;
  };

  return (
    <>
      <h2 className="heading-11">Рекомендуемые</h2>
      <div className="w-layout-hflex core-product-search">
        {validRecommendations.map((item, idx) => (
          <RecommendedProductCard 
            key={`${item.brand}-${item.articleNumber}-${idx}`}
            item={item}
            isLoadingPrice={isLoadingPrices}
            formatPrice={formatPrice}
          />
        ))}
      </div>
    </>
  );
};

export default CartRecommended; 