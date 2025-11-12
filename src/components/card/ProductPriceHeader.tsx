import React from "react";
import toast from "react-hot-toast";
import { useCart } from "@/contexts/CartContext";

interface ProductPriceHeaderProps {
  offers: any[];
  brand: string;
  articleNumber: string;
  name: string;
}

const ProductPriceHeader = ({ offers, brand, articleNumber, name }: ProductPriceHeaderProps) => {
  const { addItem } = useCart();

  // Filter valid offers with prices - use ALL valid offers (both internal and external)
  const validOffers = offers.filter(offer => offer && offer.price && offer.price > 0);

  // Use all valid offers instead of prioritizing only database offers
  const offersToUse = validOffers;

  const databaseOffers = validOffers.filter(offer => offer.type === 'internal');
  const externalOffers = validOffers.filter(offer => offer.type === 'external');

  console.log('ProductPriceHeader: Using ALL valid offers', {
    databaseOffers: databaseOffers.length,
    externalOffers: externalOffers.length,
    totalOffers: validOffers.length
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

  // Calculate delivery time based on the fastest available offer
  const getDeliveryText = () => {
    if (offersToUse.length === 0) return "Доставим сегодня с 18:00";
    
    // Find the fastest delivery time among available offers
    const minDeliveryDays = Math.min(...offersToUse.map(offer => {
      // For internal offers, use deliveryDays; for external offers, use deliveryTime
      const days = offer.deliveryDays || offer.deliveryTime || 0;
      return days;
    }));

    // Calculate delivery date
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + Math.max(minDeliveryDays, 1)); // At least 1 day (24h minimum)
    
    // Format delivery text
    if (minDeliveryDays <= 1) {
      // Same day or next day delivery - show time
      return "Доставим завтра с 18:00";
    } else {
      // Multiple days - show date
      const options: Intl.DateTimeFormatOptions = { 
        day: 'numeric', 
        month: 'long'
      };
      const formattedDate = deliveryDate.toLocaleDateString('ru-RU', options);
      return `Доставим ${formattedDate}`;
    }
  };

  // Determine if button should be disabled
  const isDisabled = totalStock === 0 || minPrice === 0 || minPrice === Infinity;

  // Handle add to cart - add cheapest database offer first
  const handleAddToCart = async () => {
    if (isDisabled) return;

    const cheapestOffer = offersToUse.reduce((min, offer) =>
      (offer.price || Infinity) < (min.price || Infinity) ? offer : min
    );

    try {
      const result = await addItem({
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
        deliveryTime: String(cheapestOffer.deliveryTime || cheapestOffer.deliveryDays || 0),
        isExternal: cheapestOffer.type === 'external'
      });

      if (result.success) {
        const productName = name || `${brand} ${articleNumber}`;
        toast.success(`${productName} добавлен в корзину`);
      }
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      const productName = name || `${brand} ${articleNumber}`;
      toast.error(`Не удалось добавить ${productName} в корзину`);
    }
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
        width: '100%',
      } as React.CSSProperties}
    >
      {/* Price on the left */}
      <div style={{ display: 'flex', alignItems: 'center' } as React.CSSProperties}>
        <span
          style={{
            fontFamily: 'Onest',
            fontWeight: 800,
            fontSize: '34px',
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

      {/* Add to cart button */}
      <button
        disabled={isDisabled}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 30px',
          backgroundColor: isDisabled ? '#CCCCCC' : '#EC1C24',
          border: 'none',
          borderRadius: '13px',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          fontFamily: 'Onest',
          fontWeight: 600,
          fontSize: '16px',
          lineHeight: '1.3em',
          color: '#FFFFFF',
          opacity: isDisabled ? 0.6 : 1
        } as React.CSSProperties}
        onClick={handleAddToCart}
      >
        <svg width="20" height="20" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M10.1998 22.2C8.8798 22.2 7.81184 23.28 7.81184 24.6C7.81184 25.92 8.8798 27 10.1998 27C11.5197 27 12.5997 25.92 12.5997 24.6C12.5997 23.28 11.5197 22.2 10.1998 22.2ZM3 3V5.4H5.39992L9.71977 14.508L8.09982 17.448C7.90783 17.784 7.79984 18.18 7.79984 18.6C7.79984 19.92 8.8798 21 10.1998 21H24.5993V18.6H10.7037C10.5357 18.6 10.4037 18.468 10.4037 18.3L10.4397 18.156L11.5197 16.2H20.4594C21.3594 16.2 22.1513 15.708 22.5593 14.964L26.8552 7.176C26.9542 6.99286 27.004 6.78718 26.9997 6.57904C26.9955 6.37089 26.9373 6.16741 26.8309 5.98847C26.7245 5.80952 26.5736 5.66124 26.3927 5.55809C26.2119 5.45495 26.0074 5.40048 25.7992 5.4H8.05183L6.92387 3H3ZM22.1993 22.2C20.8794 22.2 19.8114 23.28 19.8114 24.6C19.8114 25.92 20.8794 27 22.1993 27C23.5193 27 24.5993 25.92 24.5993 24.6C24.5993 23.28 23.5193 22.2 22.1993 22.2Z" 
            fill="#FFFFFF" 
          />
        </svg>
        Добавить в корзину
      </button>
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
          {getDeliveryText()}
        </span>
      </div>

      {/* Green icons on the right */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        } as React.CSSProperties}
      >
        {/* First icon - refund icon 1 */}
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 15C0 6.71573 6.71573 0 15 0C23.2843 0 30 6.71573 30 15C30 23.2843 23.2843 30 15 30C6.71573 30 0 23.2843 0 15Z" fill="#4DB45E"/>
          <path d="M22 20.333C22 20.5098 21.9262 20.6797 21.7949 20.8047C21.6636 20.9297 21.4855 21 21.2998 21H8.7002C8.51454 21 8.33635 20.9297 8.20508 20.8047C8.0738 20.6797 8 20.5098 8 20.333V13.2861H22V20.333ZM11.5 17.1426L14.3877 20.1426L15.3496 19.1426L14.1055 17.8496H18.5V16.4355H14.1055L15.3496 15.1426L14.3877 14.1426L11.5 17.1426ZM21.2998 9C21.4855 9 21.6636 9.07029 21.7949 9.19531C21.9262 9.32034 22 9.49018 22 9.66699V11.5713H8V9.66699C8 9.49018 8.0738 9.32034 8.20508 9.19531C8.33635 9.07029 8.51454 9 8.7002 9H21.2998Z" fill="white"/>
        </svg>
        
        {/* Second icon - approve */}
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 15C0 6.71573 6.71573 0 15 0C23.2843 0 30 6.71573 30 15C30 23.2843 23.2843 30 15 30C6.71573 30 0 23.2843 0 15Z" fill="#4DB45E"/>
          <path d="M22 14.9969L20.4473 13.2702L20.6636 10.9845L18.3664 10.4752L17.1636 8.5L15 9.40683L12.8364 8.5L11.6336 10.4752L9.33636 10.9783L9.55273 13.264L8 14.9969L9.55273 16.7236L9.33636 19.0155L11.6336 19.5248L12.8364 21.5L15 20.587L17.1636 21.4938L18.3664 19.5186L20.6636 19.0093L20.4473 16.7236L22 14.9969ZM13.7273 18.1025L11.1818 15.618L12.0791 14.7422L13.7273 16.3447L17.9209 12.2516L18.8182 13.1335L13.7273 18.1025Z" fill="white"/>
        </svg>
        
        {/* Third icon - refund icon 2 */}
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 15C0 6.71573 6.71573 0 15 0C23.2843 0 30 6.71573 30 15C30 23.2843 23.2843 30 15 30C6.71573 30 0 23.2843 0 15Z" fill="#4DB45E"/>
          <path d="M16.5912 21.1914L21.3526 16.3712L23.136 18.1798L18.3746 23L16.5912 21.1914ZM19.2832 14.2554L16.6754 11.6277C16.5757 11.5291 16.4623 11.4457 16.3389 11.3803L15.3967 7.72038C15.3362 7.50738 15.1965 7.32655 15.007 7.21611C14.8175 7.10567 14.5931 7.07427 14.3812 7.12855C14.1693 7.18282 13.9865 7.31853 13.8715 7.50697C13.7564 7.69542 13.7181 7.92185 13.7647 8.13841L14.6564 11.6107L12.6963 7.4815C12.5028 7.05493 11.9981 6.89284 11.5775 7.072C11.1569 7.27675 10.9802 7.78863 11.1821 8.2152L12.6038 11.2353L9.76884 8.38582C9.44076 8.0531 8.90237 8.0531 8.57429 8.38582C8.24621 8.72708 8.25462 9.26455 8.5827 9.59727L11.7121 12.7539L11.1232 12.9842L10.2147 13.3511L8.60794 14.4772C8.60794 14.4772 7.92654 15.373 7.86765 15.7569C7.80035 16.1408 8.53223 18.0689 8.53223 18.0689H8.54064C8.67524 18.359 8.96125 18.5637 9.29775 18.5637C9.52086 18.5637 9.73483 18.4738 9.89259 18.3138C10.0503 18.1538 10.139 17.9368 10.139 17.7106C10.139 17.6253 10.1137 17.557 10.0885 17.4802L10.1053 17.4717L9.609 15.9958L10.6437 15.1597C11.0391 15.1768 11.8887 15.245 12.3009 15.2706C14.5975 17.3608 12.4271 18.1798 12.4271 18.1798L9.51647 19.0841L9.37346 19.2036C9.28714 19.2845 9.2197 19.3839 9.17605 19.4946C9.13239 19.6053 9.11362 19.7244 9.12109 19.8434L9.13791 20.7563L14.547 20.3297C14.8667 20.3382 15.1695 20.2188 15.4051 19.9884L19.2832 16.064C19.729 15.6033 19.7458 14.7417 19.2832 14.2554Z" fill="white"/>
        </svg>
      </div>
    </div>
  );
};

export default ProductPriceHeader;
