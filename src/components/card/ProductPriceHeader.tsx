import React from "react";
import { useCart } from "@/contexts/CartContext";

interface ProductPriceHeaderProps {
  offers: any[];
  brand: string;
  articleNumber: string;
  name: string;
}

const ProductPriceHeader = ({ offers, brand, articleNumber, name }: ProductPriceHeaderProps) => {
  const { addItem } = useCart();

  // Filter valid offers with prices, prioritizing database (internal) offers
  const validOffers = offers.filter(offer => offer && offer.price && offer.price > 0);
  
  // PRIORITIZE DATABASE OFFERS: Use only internal offers (from database) first
  const databaseOffers = validOffers.filter(offer => offer.type === 'internal');
  
  // Only use external API offers if no database offers are available
  const offersToUse = databaseOffers.length > 0 ? databaseOffers : validOffers;
  
  console.log('ProductPriceHeader: Using offers from', databaseOffers.length > 0 ? 'DATABASE' : 'API', {
    databaseOffers: databaseOffers.length,
    totalOffers: validOffers.length,
    usingOffers: offersToUse.length
  });

  if (offersToUse.length === 0) {
    return null;
  }

  // Get minimum price from database offers first, then fallback to all offers
  const minPrice = Math.min(...offersToUse.map(offer => offer.price || Infinity));
  
  // Calculate total stock from database offers first
  const totalStock = offersToUse.reduce((total, offer) => {
    const stock = typeof offer.quantity === 'number' ? offer.quantity : 0;
    return total + stock;
  }, 0);

  // Handle add to cart - add cheapest database offer first
  const handleAddToCart = async () => {
    const cheapestOffer = offersToUse.reduce((min, offer) => 
      (offer.price || Infinity) < (min.price || Infinity) ? offer : min
    );

    await addItem({
      productId: cheapestOffer.id ? String(cheapestOffer.id) : undefined,
      offerKey: cheapestOffer.offerKey || undefined,
      name: name || `${brand} ${articleNumber}`,
      description: name || `${brand} ${articleNumber}`,
      price: cheapestOffer.price,
      currency: 'RUB',
      quantity: 1,
      stock: cheapestOffer.quantity,
      image: cheapestOffer.image || undefined,
      brand: brand,
      article: articleNumber,
      supplier: cheapestOffer.supplier || (cheapestOffer.type === 'external' ? 'AutoEuro' : 'Внутренний'),
      deliveryTime: cheapestOffer.deliveryTime || cheapestOffer.deliveryDays || 0,
      isExternal: cheapestOffer.type === 'external'
    });
  };

  return (
    <div 
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '20px 40px',
        margin: '0 0 16px 0',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '85px',
        width: '1028px'
      } as React.CSSProperties}
    >
      {/* Price on the left */}
      <div style={{ display: 'flex', alignItems: 'center' } as React.CSSProperties}>
        <span
          style={{
            fontFamily: 'Onest',
            fontWeight: 800,
            fontSize: '40px',
            lineHeight: '1.4em',
            color: '#000814'
          } as React.CSSProperties}
        >
          {minPrice !== Infinity ? 
            new Intl.NumberFormat('ru-RU', { 
              minimumFractionDigits: 0,
              maximumFractionDigits: 0 
            }).format(minPrice) + ' ₽' : '—'}
        </span>
      </div>

      {/* Stock and delivery info in the middle */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' } as React.CSSProperties}>
        <span
          style={{
            fontFamily: 'Onest',
            fontWeight: 500,
            fontSize: '16px',
            lineHeight: '1.4em',
            color: '#000814'
          } as React.CSSProperties}
        >
          В наличии {totalStock}
        </span>
        <span
          style={{
            fontFamily: 'Onest',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '1.4em',
            color: '#8893A1'
          } as React.CSSProperties}
        >
          Доставим сегодня с 18:00
        </span>
      </div>

      {/* Add to cart button */}
      <button
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 30px',
          backgroundColor: '#EC1C24',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontFamily: 'Onest',
          fontWeight: 600,
          fontSize: '16px',
          lineHeight: '1.3em',
          color: '#FFFFFF'
        } as React.CSSProperties}
        onClick={handleAddToCart}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M2 2H3.5L6.6 12.4C6.7 12.8 7.1 13 7.5 13H15.5C15.9 13 16.3 12.8 16.4 12.4L18 6H5" 
            stroke="#FFFFFF" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <circle cx="8" cy="17" r="1" fill="#FFFFFF"/>
          <circle cx="15" cy="17" r="1" fill="#FFFFFF"/>
        </svg>
        Добавить в корзину
      </button>

      {/* Green icons on the right */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        } as React.CSSProperties}
      >
        {/* First icon - checkmark */}
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: '#4DB45E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          } as React.CSSProperties}
        >
          <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 6L5 10L13 2" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        {/* Second icon - approve */}
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: '#4DB45E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          } as React.CSSProperties}
        >
          <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 6.5L5 10.5L13 2.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        {/* Third icon - refund */}
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: '#4DB45E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          } as React.CSSProperties}
        >
          <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 8L5.5 12.5L14 4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ProductPriceHeader;
