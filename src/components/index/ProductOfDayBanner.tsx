import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { GET_HERO_BANNERS } from '@/lib/graphql';
import Link from 'next/link';

interface HeroBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

// Добавим CSS для стрелок
const arrowStyles = `
.pod-slider-arrow {
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  padding: 0;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  transition: opacity 0.2s;
  cursor: pointer;
}
.pod-slider-arrow-left { left: 12px; }
.pod-slider-arrow-right { right: 12px; }
.pod-slider-arrow .arrow-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.pod-slider-arrow:hover .arrow-circle,
.pod-slider-arrow:focus .arrow-circle {
  background: #ec1c24;
}
.pod-slider-arrow .arrow-svg {
  width: 20px;
  height: 20px;
  display: block;
  transition: stroke 0.2s;
  stroke: #222;
}
.pod-slider-arrow:hover .arrow-svg,
.pod-slider-arrow:focus .arrow-svg {
  stroke: #fff;
}
`;

const slideStyles = `
.pod-slider-slide {
  position: absolute;
  top: 0; left: 0; 
  opacity: 0;
  transform: translateX(40px) scale(0.98);
  transition: opacity 0.5s cubic-bezier(.4,0,.2,1), transform 0.5s cubic-bezier(.4,0,.2,1);
  pointer-events: none;
  z-index: 1;
}
.pod-slider-slide.active {
  opacity: 1;
  transform: translateX(0) scale(1);
  pointer-events: auto;
  z-index: 2;
}
.pod-slider-slide.prev {
  opacity: 0;
  transform: translateX(-40px) scale(0.98);
  z-index: 1;
}
.pod-slider-slide.next {
  opacity: 0;
  transform: translateX(40px) scale(0.98);
  z-index: 1;
}
.mask.w-slider-mask { position: relative; }
`;

const ProductOfDayBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showArrows, setShowArrows] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { data } = useQuery(GET_HERO_BANNERS, { errorPolicy: 'all' });

  const banners: HeroBanner[] = data?.heroBanners
    ?.filter((banner: HeroBanner) => banner.isActive)
    ?.slice()
    ?.sort((a: HeroBanner, b: HeroBanner) => a.sortOrder - b.sortOrder) || [];

  const allBanners = banners.length > 0 ? banners : [{
    id: 'default',
    title: 'ДОСТАВИМ БЫСТРО!',
    subtitle: 'Дополнительная скидка на товары с местного склада',
    imageUrl: '/images/imgfb.png',
    linkUrl: '',
    isActive: true,
    sortOrder: 0
  }];

  useEffect(() => {
    if (allBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % allBanners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [allBanners.length]);

  useEffect(() => {
    if (currentSlide >= allBanners.length) {
      setCurrentSlide(0);
    }
  }, [allBanners.length, currentSlide]);

  const handlePrevSlide = () => {
    setCurrentSlide(prev => prev === 0 ? allBanners.length - 1 : prev - 1);
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % allBanners.length);
  };

  const handleSlideIndicator = (index: number) => {
    setCurrentSlide(index);
  };

  // Показывать стрелки при наведении на слайдер или стрелки
  const handleMouseEnter = () => setShowArrows(true);
  const handleMouseLeave = () => setShowArrows(false);

  return (
    <div
      className="slider w-slider"
      ref={sliderRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      style={{ position: 'relative' }}
    >
      {/* Вставляем стили для стрелок */}
      <style>{arrowStyles}{slideStyles}</style>
      <div className="mask w-slider-mask">
        {allBanners.map((banner, idx) => {
          let slideClass = 'pod-slider-slide';
          if (idx === currentSlide) slideClass += ' active';
          else if (idx === (currentSlide === 0 ? allBanners.length - 1 : currentSlide - 1)) slideClass += ' prev';
          else if (idx === (currentSlide + 1) % allBanners.length) slideClass += ' next';
          const slideContent = (
            <div
              className="div-block-128"
              style={{
                backgroundImage: `url(${banner.imageUrl})`,
                // backgroundSize: 'cover',
                // backgroundPosition: 'center',
                // backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Можно добавить текст поверх баннера, если нужно */}
            </div>
          );
          return (
            <div
              className={slideClass + ' slide w-slide'}
              key={banner.id}
              // style={{ display: idx === currentSlide ? 'block' : 'none', position: 'relative' }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            >
              {banner.linkUrl ? (
                <Link href={banner.linkUrl} style={{ display: 'block', width: '100%', height: '100%' }}>{slideContent}</Link>
              ) : slideContent}
            </div>
          );
        })}
      </div>
      {/* SVG-стрелки как в Webflow, поверх баннера, с hover-эффектом */}
      <button
        className="pod-slider-arrow pod-slider-arrow-left"
        onClick={handlePrevSlide}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          opacity: showArrows ? 1 : 0,
          pointerEvents: showArrows ? 'auto' : 'none',
        }}
        tabIndex={-1}
        aria-label="Предыдущий баннер"
      >
        <span className="arrow-circle">
          <svg className="arrow-svg" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.6673 10H3.33398M3.33398 10L8.33398 5M3.33398 10L8.33398 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      <button
        className="pod-slider-arrow pod-slider-arrow-right"
        onClick={handleNextSlide}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          opacity: showArrows ? 1 : 0,
          pointerEvents: showArrows ? 'auto' : 'none',
        }}
        tabIndex={-1}
        aria-label="Следующий баннер"
      >
        <span className="arrow-circle">
          <svg className="arrow-svg" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.33398 10H16.6673M16.6673 10L11.6673 5M16.6673 10L11.6673 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      <div className="slide-nav w-slider-nav w-slider-nav-invert w-round">
        {allBanners.map((_, idx) => (
          <div
            key={idx}
            className="w-slider-dot"
            style={{
              background: idx === currentSlide ? 'white' : 'rgba(255,255,255,0.5)',
              borderRadius: '50%',
              width: 10,
              height: 10,
              margin: 4,
              display: 'inline-block',
              cursor: 'pointer'
            }}
            onClick={() => handleSlideIndicator(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductOfDayBanner; 