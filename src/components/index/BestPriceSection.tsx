import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import BestPriceItem from "../BestPriceItem";
import { GET_BEST_PRICE_PRODUCTS } from "../../lib/graphql";

interface BestPriceProductData {
  id: string;
  productId: string;
  discount: number;
  isActive: boolean;
  sortOrder: number;
  product: {
    id: string;
    name: string;
    article?: string;
    brand?: string;
    retailPrice?: number;
    wholesalePrice?: number;
    images: { url: string; alt?: string }[];
  };
}

const SCROLL_AMOUNT = 214; // 196px card width + 18px gap

const formatPrice = (price?: number | null) => {
  if (price == null) {
    return "—";
  }
  return `от ${Math.round(price).toLocaleString("ru-RU")} ₽`;
};

const formatOldPrice = (price?: number | null) => {
  if (price == null) {
    return undefined;
  }
  return `${Math.round(price).toLocaleString("ru-RU")} ₽`;
};

const calculateDiscountedPrice = (price?: number | null, discount?: number | null) => {
  if (!price || !discount) {
    return price ?? null;
  }
  return price * (1 - discount / 100);
};

const BestPriceDecor = () => (
  <div className="best-price-hero__decor" aria-hidden="true">
    <span className="best-price-hero__blur best-price-hero__blur--xl" />
    <span className="best-price-hero__blur best-price-hero__blur--lg" />
    <span className="best-price-hero__blur best-price-hero__blur--md" />
    <span className="best-price-hero__blur best-price-hero__blur--sm" />
    <span className="best-price-hero__disc best-price-hero__disc--1" />
    <span className="best-price-hero__disc best-price-hero__disc--2" />
    <span className="best-price-hero__disc best-price-hero__disc--3" />
    <span className="best-price-hero__disc best-price-hero__disc--4" />
    <span className="best-price-hero__disc best-price-hero__disc--5" />
    <span className="best-price-hero__disc best-price-hero__disc--6" />
    <span className="best-price-hero__disc best-price-hero__disc--7" />
    <span className="best-price-hero__disc best-price-hero__disc--8" />
  </div>
);

const renderHero = (content: ReactNode) => (
  <section className="main">
    <div className="w-layout-blockcontainer container w-container">
      <div className="best-price-hero w-layout-hflex flex-block-118">
        <BestPriceDecor />
        <div className="w-layout-vflex flex-block-119 best-price-hero__text">
          <h2 className="heading-20">ЛУЧШАЯ ЦЕНА!</h2>
          <p className="text-block-58">Подборка лучших предложений по цене</p>
          <Link href="/search" className="best-price-cta w-inline-block">
            Показать все
          </Link>
        </div>
        {content}
      </div>
    </div>
  </section>
);

const BestPriceSection: React.FC = () => {
  const { data, loading, error } = useQuery(GET_BEST_PRICE_PRODUCTS);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const container = scrollRef.current;

    if (!container) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScrollLeft = scrollWidth - clientWidth;

    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(maxScrollLeft - scrollLeft > 8);
  }, []);

  const scrollLeft = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
    setTimeout(updateScrollState, 300);
  }, [updateScrollState]);

  const scrollRight = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
    setTimeout(updateScrollState, 300);
  }, [updateScrollState]);

  const bestPriceProducts: BestPriceProductData[] = data?.bestPriceProducts ?? [];

  const bestPriceItems = useMemo(
    () =>
      bestPriceProducts
        .filter((item) => item.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .slice(0, 8)
        .map((item) => {
          const basePrice = item.product.retailPrice ?? item.product.wholesalePrice ?? null;
          const discountedPrice = calculateDiscountedPrice(basePrice, item.discount);
          const hasDiscount = !!item.discount && item.discount > 0 && basePrice != null;

          return {
            image: item.product.images?.[0]?.url || "images/162615.webp",
            salePercent: hasDiscount ? item.discount : undefined,
            newPrice: formatPrice(hasDiscount ? discountedPrice : basePrice),
            oldPrice: hasDiscount ? formatOldPrice(basePrice) : undefined,
            title: item.product.name,
            brand: item.product.brand || "",
            article: item.product.article,
            productId: item.product.id,
          };
        }),
    [bestPriceProducts]
  );

  useEffect(() => {
    const container = scrollRef.current;
    const handleChange = () => updateScrollState();

    updateScrollState();

    if (!container) {
      window.addEventListener("resize", handleChange);

      return () => {
        window.removeEventListener("resize", handleChange);
      };
    }

    container.addEventListener("scroll", handleChange);
    window.addEventListener("resize", handleChange);

    return () => {
      container.removeEventListener("scroll", handleChange);
      window.removeEventListener("resize", handleChange);
    };
  }, [updateScrollState]);

  useEffect(() => {
    updateScrollState();
  }, [bestPriceItems.length, updateScrollState]);

  if (loading) {
    return renderHero(
      <div className="best-price-carousel-wrapper">
        <div className="w-layout-hflex flex-block-121 carousel-scroll-top best-price-carousel">
          {/* Empty during loading */}
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Ошибка загрузки товаров с лучшей ценой:", error);
    return renderHero(
      <div className="best-price-carousel-wrapper flex items-center justify-center">
        <div className="best-price-loading">Ошибка загрузки данных</div>
      </div>
    );
  }

  if (bestPriceItems.length === 0) {
    return null;
  }

  return renderHero(
    <div className="best-price-carousel-wrapper">
      <button
        className={`best-price-arrow best-price-arrow-left${canScrollLeft ? " is-visible" : ""}`}
        onClick={scrollLeft}
        aria-label="Прокрутить влево"
        disabled={!canScrollLeft}
        type="button"
      >
        <svg
          className="best-price-arrow-icon"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.6673 10H3.33398M3.33398 10L8.33398 5M3.33398 10L8.33398 15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        className="w-layout-hflex flex-block-121 carousel-scroll-top best-price-carousel"
        ref={scrollRef}
        data-hide-scrollbar
      >
        {bestPriceItems.map((item, index) => (
          <BestPriceItem key={`${item.productId ?? index}`} {...item} />
        ))}
      </div>
      <button
        className={`best-price-arrow best-price-arrow-right${canScrollRight ? " is-visible" : ""}`}
        onClick={scrollRight}
        aria-label="Прокрутить вправо"
        disabled={!canScrollRight}
        type="button"
      >
        <svg
          className="best-price-arrow-icon"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.33398 10H16.6673M16.6673 10L11.6673 5M16.6673 10L11.6673 15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default BestPriceSection;
