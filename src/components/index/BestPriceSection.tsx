import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const VISIBLE_CARDS = 5;

const formatCurrency = (value?: number | null) => {
  if (value == null) {
    return undefined;
  }
  return new Intl.NumberFormat("ru-RU").format(Math.round(value));
};

const BestPriceSection: React.FC = () => {
  const { data, loading, error } = useQuery(GET_BEST_PRICE_PRODUCTS, { errorPolicy: "all" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const bestPriceProducts: BestPriceProductData[] = data?.bestPriceProducts ?? [];

  const bestPriceItems = useMemo(() => {
    return bestPriceProducts
      .filter((item) => item.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .slice(0, 16)
      .map((item) => {
        const basePrice =
          item.product.retailPrice ?? item.product.wholesalePrice ?? null;
        const effectiveDiscount =
          item.discount && item.discount > 0
            ? item.discount
            : basePrice
              ? 35
              : 0;

        const priceValue = basePrice ?? null;
        const priceLabel =
          priceValue != null ? `от ${formatCurrency(priceValue)} ₽` : "—";

        const oldPriceValue =
          priceValue != null && effectiveDiscount > 0
            ? priceValue / (1 - effectiveDiscount / 100)
            : null;

        return {
          image: item.product.images?.[0]?.url || "images/162615.webp",
          discount: effectiveDiscount > 0 ? `-${effectiveDiscount}%` : "",
          price: priceLabel,
          oldPrice:
            oldPriceValue != null ? `${formatCurrency(oldPriceValue)} ₽` : undefined,
          title: item.product.name,
          brand: item.product.brand || "",
          article: item.product.article,
          productId: item.product.id,
        };
      });
  }, [bestPriceProducts]);

  const hasOverflow = bestPriceItems.length > VISIBLE_CARDS;

  const updateScrollState = useCallback(() => {
    const container = scrollRef.current;
    if (!container) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  const scrollByOneItem = useCallback(
    (direction: 1 | -1) => {
      const container = scrollRef.current;
      if (!container) return;

      const children = Array.from(container.children) as HTMLElement[];
      if (children.length === 0) return;

      let step = children[0].getBoundingClientRect().width;
      if (children.length > 1) {
        const delta = children[1].offsetLeft - children[0].offsetLeft;
        if (delta > 0) {
          step = delta;
        }
      }

      container.scrollBy({ left: step * direction, behavior: "smooth" });
    },
    []
  );

  const handleScrollLeft = useCallback(() => {
    if (!hasOverflow || !canScrollLeft) return;
    scrollByOneItem(-1);
  }, [hasOverflow, canScrollLeft, scrollByOneItem]);

  const handleScrollRight = useCallback(() => {
    if (!hasOverflow || !canScrollRight) return;
    scrollByOneItem(1);
  }, [hasOverflow, canScrollRight, scrollByOneItem]);

  useEffect(() => {
    updateScrollState();
  }, [updateScrollState, bestPriceItems.length]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => updateScrollState();
    container.addEventListener("scroll", handleScroll, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => updateScrollState());
      resizeObserver.observe(container);
    }

    return () => {
      container.removeEventListener("scroll", handleScroll);
      resizeObserver?.disconnect();
    };
  }, [updateScrollState]);

  useEffect(() => {
    if (!hasOverflow) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
    } else {
      updateScrollState();
    }
  }, [hasOverflow, updateScrollState]);

  if (loading) {
    return (
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-hflex flex-block-118 best-price-hero">
            <div className="w-layout-vflex flex-block-119">
              <h1 className="heading-20">ЛУЧШАЯ ЦЕНА!</h1>
              <div className="text-block-58">Подборка лучших предложений по цене</div>
              <a href="#" className="button-24 w-button best-price-cta">
                Показать все
              </a>
              <div className="best-price-loading">Загрузка...</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error("Ошибка загрузки товаров с лучшей ценой:", error);
    return (
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-hflex flex-block-118 best-price-hero">
            <div className="w-layout-vflex flex-block-119">
              <h1 className="heading-20">ЛУЧШАЯ ЦЕНА!</h1>
              <div className="text-block-58">Ошибка загрузки данных</div>
              <a href="#" className="button-24 w-button best-price-cta">
                Показать все
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (bestPriceItems.length === 0) {
    return null;
  }

  const leftArrowClass = `best-price-arrow best-price-arrow-left${canScrollLeft ? " is-visible" : ""}`;
  const rightArrowClass = `best-price-arrow best-price-arrow-right${canScrollRight ? " is-visible" : ""}`;

  return (
    <section className="main">
      <div className="w-layout-blockcontainer container w-container">
        <div className="w-layout-hflex flex-block-118 best-price-hero">
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

          <div className="w-layout-vflex flex-block-119 best-price-hero__text">
            <h1 className="heading-20">
              ЛУЧШАЯ <span className="best-price-hero__accent">ЦЕНА!</span>
            </h1>
            <div className="text-block-58">Подборка лучших предложений по цене</div>
            <a href="#" className="button-24 w-button best-price-cta">
              Показать все
            </a>
          </div>

          <div className="best-price-carousel-wrapper">
            <div
              className="w-layout-hflex flex-block-121 carousel-scroll-top best-price-carousel"
              ref={scrollRef}
            >
              {bestPriceItems.map((item, index) => (
                <BestPriceItem key={`${item.productId}-${index}`} {...item} />
              ))}
            </div>
            {hasOverflow && (
              <>
                <button
                  type="button"
                  className={leftArrowClass}
                  onClick={handleScrollLeft}
                  aria-label="Прокрутить влево"
                  disabled={!canScrollLeft}
                  aria-hidden={!canScrollLeft}
                  tabIndex={canScrollLeft ? 0 : -1}
                >
                  <span className="best-price-arrow-circle">
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
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
                <button
                  type="button"
                  className={rightArrowClass}
                  onClick={handleScrollRight}
                  aria-label="Прокрутить вправо"
                  disabled={!canScrollRight}
                  aria-hidden={!canScrollRight}
                  tabIndex={canScrollRight ? 0 : -1}
                >
                  <span className="best-price-arrow-circle">
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
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestPriceSection;
