import React, { memo, useState, useEffect } from 'react';
import CatalogProductCard from './CatalogProductCard';
import CatalogProductCardSkeleton from './CatalogProductCardSkeleton';
import { useArticleImage } from '@/hooks/useArticleImage';
import { useCatalogPrices } from '@/hooks/useCatalogPrices';
import { PartsAPIArticle } from '@/types/partsapi';
import toast from 'react-hot-toast';
import { useCart } from '@/contexts/CartContext';

interface ArticleCardProps {
  article: PartsAPIArticle;
  index: number;
  onVisibilityChange?: (index: number, isVisible: boolean) => void;
  image?: string; // optional image override
}

const ArticleCard: React.FC<ArticleCardProps> = memo(({ article, index, onVisibilityChange, image }) => {
  const [shouldShow, setShouldShow] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Cart context
  const { isInCart: isItemInCart } = useCart();

  // Используем хук для получения изображения
  // Если передано изображение явно, отключаем загрузку изображения из PartsAPI
  const { imageUrl, isLoading: imageLoading, error } = useArticleImage(article.artId, {
    enabled: !image && !!article.artId
  });

  // MOCK: fallback image if none loaded
  const fallbackImage =
    image || // use prop if provided
    imageUrl ||
    '/images/162615.webp'; // путь к картинке из public или любой другой

  // Проверяем и очищаем данные артикула и бренда
  const articleNumber = article.artArticleNr?.trim();
  const brandName = article.artSupBrand?.trim();

  // Используем хук для получения цен только если есть и артикул, и бренд
  const { getPriceData, addToCart } = useCatalogPrices();
  const shouldFetchPrices = articleNumber && brandName && articleNumber !== '' && brandName !== '';
  // MOCK: fallback price data
  const priceData = shouldFetchPrices
    ? getPriceData(articleNumber, brandName)
    : { minPrice: 17087, cheapestOffer: null, isLoading: false, hasOffers: true };

  // Определяем, должен ли отображаться товар
  useEffect(() => {
    if (!shouldFetchPrices) {
      // Если нет данных для поиска, не показываем товар
      setShouldShow(false);
      setIsChecking(false);
      onVisibilityChange?.(index, false);
      console.log('❌ ArticleCard: скрываем товар без данных:', { articleNumber, brandName });
      return;
    }

    if (priceData.isLoading) {
      // Если данные загружаются, ждем
      setIsChecking(true);
      return;
    }

    // Данные загружены - проверяем результат
    if (priceData.hasOffers) {
      setShouldShow(true);
      setIsChecking(false);
      onVisibilityChange?.(index, true);
      console.log('✅ ArticleCard: показываем товар с предложениями:', { articleNumber, brandName, hasPrice: !!priceData.minPrice });
    } else {
      setShouldShow(false);
      setIsChecking(false);
      onVisibilityChange?.(index, false);
      console.log('❌ ArticleCard: скрываем товар без предложений:', { articleNumber, brandName });
    }
  }, [shouldFetchPrices, priceData.isLoading, priceData.hasOffers, articleNumber, brandName, priceData.minPrice, index, onVisibilityChange]);

  // Показываем скелетон если данные загружаются или проверяются
  if (isChecking || (shouldShow && (priceData.isLoading || imageLoading))) {
    return <CatalogProductCardSkeleton />;
  }

  // MOCK: всегда показывать карточку для демо
  if (!shouldShow) {
    // return null;
    // MOCK: показываем карточку даже если не должен
    // (можно убрать это после подключения реальных данных)
    // Формируем название товара
    const title = [brandName || 'N/A', articleNumber || 'N/A'].filter(part => part !== 'N/A').join(', ');
    const brand = brandName || 'Unknown';
    let priceText = 'от 17 087 ₽';
    const isInCartFlag = isItemInCart(undefined, undefined, articleNumber, brandName);

    return (
      <CatalogProductCard
        image={fallbackImage}
        discount="-35%"
        price={priceText}
        oldPrice="22 347 ₽"
        title={title}
        brand={brand}
        articleNumber={articleNumber}
        brandName={brandName}
        artId={article.artId}
        onAddToCart={() => {}}
        isInCart={isInCartFlag}
      />
    );
  }

  // Формируем название товара
  const title = [
    brandName || 'N/A',
    articleNumber || 'N/A',
  ].filter(part => part !== 'N/A').join(', ');

  const brand = brandName || 'Unknown';

  const isInCartFlag = isItemInCart(undefined, undefined, articleNumber, brandName);

  // Формируем цену для отображения
  let priceText = '';
  if (priceData.isLoading) {
    priceText = 'Загрузка...';
  } else if (priceData.minPrice && priceData.minPrice > 0) {
    priceText = `от ${priceData.minPrice.toLocaleString('ru-RU')} ₽`;
  } else {
    priceText = 'По запросу';
  }

  // Обработчик добавления в корзину
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!shouldFetchPrices) {
      toast.error('Недостаточно данных для добавления товара в корзину');
      return;
    }
    
    await addToCart(articleNumber!, brandName!);
  };

  return (
    <CatalogProductCard
      image={fallbackImage}
      discount="Новинка"
      price={priceText}
      oldPrice=""
      title={title}
      brand={brand}
      articleNumber={articleNumber}
      brandName={brandName}
      artId={article.artId}
      onAddToCart={handleAddToCart}
      isInCart={isInCartFlag}
    />
  );
});

ArticleCard.displayName = 'ArticleCard';

export default ArticleCard; 
