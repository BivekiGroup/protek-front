import React from "react";
import { useQuery } from '@apollo/client';
import { useRouter } from "next/router";
import TopSalesItem from "../TopSalesItem";
import { GET_NEW_ARRIVALS } from "@/lib/graphql";
import { useCart } from "@/contexts/CartContext";

// Интерфейс для товара из GraphQL
interface Product {
  id: string;
  name: string;
  slug: string;
  article?: string;
  brand?: string;
  retailPrice?: number;
  wholesalePrice?: number;
  createdAt: string;
  images: Array<{
    id: string;
    url: string;
    alt?: string;
    order: number;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

const NewArrivalsSection: React.FC = () => {
  const { data, loading, error } = useQuery(GET_NEW_ARRIVALS, {
    variables: { limit: 6 }
  });
  const { isInCart: isItemInCart } = useCart();
  const router = useRouter();

  const handleNavigateToNewArrivals = () => {
    router.push('/new-arrivals');
  };

  // Получаем изображения для товаров
  const getProductImage = (product: Product): string => {
    if (product.images && product.images.length > 0) {
      return product.images[0].url;
    }
    return "/images/162615.webp"; // fallback изображение
  };

  const activeNewArrivals = data?.newArrivals?.slice(0, 6) || [];

  if (loading) {
    return (
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-vflex inbt">
            <button
              className="w-layout-hflex flex-block-31 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleNavigateToNewArrivals}
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <h2 className="heading-4">Новое поступление</h2>
              <img src="/images/Arrow_right.svg" loading="lazy" alt="Стрелка вправо" />
            </button>
            <div className="new-arrivals-grid">
              {/* Loading state - empty grid */}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error('Ошибка загрузки новых поступлений:', error);
    return (
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-vflex inbt">
            <button
              className="w-layout-hflex flex-block-31 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleNavigateToNewArrivals}
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <h2 className="heading-4">Новое поступление</h2>
              <img src="/images/Arrow_right.svg" loading="lazy" alt="Стрелка вправо" />
            </button>
            <div className="new-arrivals-grid">
              <div className="text-block-58">Ошибка загрузки</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (activeNewArrivals.length === 0) {
    return (
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-vflex inbt">
            <button
              className="w-layout-hflex flex-block-31 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleNavigateToNewArrivals}
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <h2 className="heading-4">Новое поступление</h2>
              <img src="/images/Arrow_right.svg" loading="lazy" alt="Стрелка вправо" />
            </button>
            <div className="new-arrivals-grid">
              <div className="text-block-58">Пока нет новых поступлений</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="main">
      <div className="w-layout-blockcontainer container w-container">
        <div className="w-layout-vflex inbt">
          <button
            className="w-layout-hflex flex-block-31 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleNavigateToNewArrivals}
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <h2 className="heading-4">Новое поступление</h2>
            <img src="/images/Arrow_right.svg" loading="lazy" alt="Стрелка вправо" />
          </button>
          <div className="new-arrivals-grid">
            {activeNewArrivals.map((product: Product) => {
              const price = product.retailPrice ?? product.wholesalePrice ?? null;
              const priceText = price ? `от ${price.toLocaleString('ru-RU')} ₽` : 'По запросу';
              const image = getProductImage(product);
              const brand = product.brand || 'Неизвестный бренд';
              const isInCart = isItemInCart(product.id, undefined, product.article, brand);

              return (
                <TopSalesItem
                  key={product.id}
                  image={image}
                  price={priceText}
                  title={product.name}
                  brand={brand}
                  article={product.article}
                  productId={product.id}
                  isInCart={isInCart}
                  isNew={true} // Mark new arrivals as "NEW"
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrivalsSection; 
