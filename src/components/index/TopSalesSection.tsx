import React from "react";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import TopSalesItem from "../TopSalesItem";
import { GET_TOP_SALES_PRODUCTS } from "../../lib/graphql";
import { useCart } from "@/contexts/CartContext";

interface TopSalesProductData {
  id: string;
  productId: string;
  isActive: boolean;
  sortOrder: number;
  product: {
    id: string;
    name: string;
    article?: string;
    brand?: string;
    retailPrice?: number;
    stock?: number;
    images: { url: string; alt?: string }[];
  };
}

const TopSalesSection: React.FC = () => {
  const { data, loading, error } = useQuery(GET_TOP_SALES_PRODUCTS);
  const { isInCart: isItemInCart } = useCart();
  const router = useRouter();

  const handleNavigateToTopSales = () => {
    router.push('/top-sales');
  };

  if (loading) {
    return (
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-vflex inbt">
            <button
              className="w-layout-hflex flex-block-31 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleNavigateToTopSales}
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <h2 className="heading-4">Топ продаж</h2>
              <img src="/images/Arrow_right.svg" loading="lazy" alt="Стрелка вправо" />
            </button>
            <div className="top-sales-grid">
              {/* Loading state - empty grid */}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error('Ошибка загрузки топ продаж:', error);
    return (
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-vflex inbt">
            <button
              className="w-layout-hflex flex-block-31 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleNavigateToTopSales}
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <h2 className="heading-4">Топ продаж</h2>
              <img src="/images/Arrow_right.svg" loading="lazy" alt="Стрелка вправо" />
            </button>
            <div className="top-sales-grid">
              <div className="text-block-58">Ошибка загрузки</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Фильтруем активные товары и сортируем по sortOrder
  const realTopSalesProducts = (data?.topSalesProducts || [])
    .filter((item: TopSalesProductData) => item.isActive)
    .sort((a: TopSalesProductData, b: TopSalesProductData) => a.sortOrder - b.sortOrder)
    .slice(0, 6); // Ограничиваем до 6 товаров

  // TODO: Remove these mock items after testing
  const mockTopSalesItems = [
    {
      id: "mock-top-1",
      productId: "mock-product-top-1",
      isActive: true,
      sortOrder: 999,
      product: {
        id: "mock-product-top-1",
        name: "Колодки тормозные передние FERODO FDB1562",
        article: "FDB1562",
        brand: "Ferodo",
        retailPrice: 4250,
        images: [{ url: "images/162615.webp", alt: "Ferodo brake pads" }]
      }
    },
    {
      id: "mock-top-2", 
      productId: "mock-product-top-2",
      isActive: true,
      sortOrder: 1000,
      product: {
        id: "mock-product-top-2",
        name: "Фильтр масляный MANN W 712/75",
        article: "W712/75",
        brand: "Mann-Filter",
        retailPrice: 890,
        images: [{ url: "images/162615.webp", alt: "Mann oil filter" }]
      }
    }
  ];

  const activeTopSalesProducts = [...realTopSalesProducts, ...mockTopSalesItems];

  if (activeTopSalesProducts.length === 0) {
    return (
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-vflex inbt">
            <button
              className="w-layout-hflex flex-block-31 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleNavigateToTopSales}
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <h2 className="heading-4">Топ продаж</h2>
              <img src="/images/Arrow_right.svg" loading="lazy" alt="Стрелка вправо" />
            </button>
            <div className="top-sales-grid">
              <div className="text-block-58">Нет товаров в топ продаж</div>
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
            onClick={handleNavigateToTopSales}
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <h2 className="heading-4">Топ продаж</h2>
            <img src="/images/Arrow_right.svg" loading="lazy" alt="Стрелка вправо" />
          </button>
          <div className="top-sales-grid">
            {activeTopSalesProducts.map((item: TopSalesProductData) => {
              const product = item.product;
              const price = product.retailPrice
                ? `от ${product.retailPrice.toLocaleString('ru-RU')} ₽`
                : 'По запросу';

              const image = product.images && product.images.length > 0
                ? product.images[0].url
                : '/images/162615.webp'; // Fallback изображение

              const title = product.name;
              const brand = product.brand || 'Неизвестный бренд';
              const isInCart = isItemInCart(product.id, undefined, product.article, brand);
              const hasStock = (product.stock ?? 0) > 0;

              return (
                <TopSalesItem
                  key={item.id}
                  image={image}
                  price={price}
                  title={title}
                  brand={brand}
                  article={product.article}
                  productId={product.id}
                  isInCart={isInCart}
                  outOfStock={!hasStock}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopSalesSection; 