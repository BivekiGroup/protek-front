import React, { useRef } from "react";
import NewsCard from "@/components/news/NewsCard";
import Link from "next/link";

const SCROLL_AMOUNT = 340; // px, ширина одной карточки + отступ

const NewsAndPromos = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
    }
  };
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
    }
  };

  return (
    <section className="main">
      <div className="w-layout-blockcontainer container w-container">
        <div className="w-layout-vflex news-index-block">
          <div className="w-layout-hflex flex-block-31">
            <h2 className="heading-4">Новости и акции</h2>
            <div className="w-layout-hflex flex-block-29">
              <Link href="/news" className="text-block-18" style={{display: 'flex', alignItems: 'center'}}>
                Ко всем новостям
                <img src="/images/Arrow_right.svg" loading="lazy" alt="" style={{marginLeft: 8}} />
              </Link>
            </div>
          </div>
          <div className="carousel-row">
            {/* Стили для стрелок как в других секциях */}
            <style>{`
              .carousel-arrow {
                width: 40px;
                height: 40px;
                border: none;
                background: none;
                padding: 0;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                opacity: 1;
                transition: opacity 0.2s;
                cursor: pointer;
                margin: 0 8px;
              }
              .carousel-arrow-left {}
              .carousel-arrow-right {}
              .carousel-arrow .arrow-circle {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: rgba(255,255,255,0.85);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
              }
              .carousel-arrow:hover .arrow-circle,
              .carousel-arrow:focus .arrow-circle {
                background: #ec1c24;
              }
              .carousel-arrow .arrow-svg {
                width: 20px;
                height: 20px;
                display: block;
                transition: stroke 0.2s;
                stroke: #222;
              }
              .carousel-arrow:hover .arrow-svg,
              .carousel-arrow:focus .arrow-svg {
                stroke: #fff;
              }
              .carousel-row {
                display: flex;
                align-items: center;
                justify-content: flex-start;
              }
            `}</style>
            <button className="carousel-arrow carousel-arrow-left" onClick={scrollLeft} aria-label="Прокрутить влево">
              <span className="arrow-circle">
                <svg className="arrow-svg" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.6673 10H3.33398M3.33398 10L8.33398 5M3.33398 10L8.33398 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            <div className="w-layout-hflex flex-block-6-copy-copy carousel-scroll" ref={scrollRef}>
              <NewsCard
                title="Kia Syros будет выделяться необычным стилем"
                description="Компания Kia готова представить новый кроссовер Syros"
                category="Новости компании"
                date="17.12.2024"
                image="/images/news_img.png"
              />
              <NewsCard
                title="Kia Syros будет выделяться необычным стилем"
                description="Компания Kia готова представить новый кроссовер Syros"
                category="Новости компании"
                date="17.12.2024"
                image="/images/news_img.png"
              />
              <NewsCard
                title="Kia Syros будет выделяться необычным стилем"
                description="Компания Kia готова представить новый кроссовер Syros"
                category="Новости компании"
                date="17.12.2024"
                image="/images/news_img.png"
              />
              <NewsCard
                title="Kia Syros будет выделяться необычным стилем"
                description="Компания Kia готова представить новый кроссовер Syros"
                category="Новости компании"
                date="17.12.2024"
                image="/images/news_img.png"
              />
            </div>
            <button className="carousel-arrow carousel-arrow-right" onClick={scrollRight} aria-label="Прокрутить вправо">
              <span className="arrow-circle">
                <svg className="arrow-svg" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.33398 10H16.6673M16.6673 10L11.6673 5M16.6673 10L11.6673 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsAndPromos; 