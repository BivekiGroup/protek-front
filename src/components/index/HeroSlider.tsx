import React, { useEffect } from "react";
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

const HeroSlider = () => {
  const { data, loading, error } = useQuery(GET_HERO_BANNERS, {
    errorPolicy: 'all'
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.Webflow && window.Webflow.require) {
      if (window.Webflow.destroy) {
        window.Webflow.destroy();
      }
      if (window.Webflow.ready) {
        window.Webflow.ready();
      }
    }
  }, []);

  // Фильтруем только активные баннеры и сортируем их
  const banners: HeroBanner[] = data?.heroBanners
    ?.filter((banner: HeroBanner) => banner.isActive)
    ?.slice()
    ?.sort((a: HeroBanner, b: HeroBanner) => a.sortOrder - b.sortOrder) || [];

  // Если нет данных или происходит загрузка, показываем дефолтный баннер
  if (loading || error || banners.length === 0) {
    return (
      <section className="section-5" style={{ overflow: 'hidden' }}>
        <div className="w-layout-blockcontainer container w-container">
          <div data-delay="4000" data-animation="slide" className="slider w-slider" data-autoplay="false" data-easing="ease"
            data-hide-arrows="false" data-disable-swipe="false" data-autoplay-limit="0" data-nav-spacing="3"
            data-duration="500" data-infinite="true">
            <div className="mask w-slider-mask">
              <div className="slide w-slide">
                <div className="w-layout-vflex flex-block-100">
                  <div className="div-block-35">
                    <img src="/images/imgfb.png" loading="lazy"
                      sizes="(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px"
                      srcSet="/images/imgfb-p-500.png 500w, /images/imgfb-p-800.png 800w, /images/imgfb.png 1027w" 
                      alt="Автозапчасти ProteK"
                      className="image-21" />
                  </div>
                  <div className="w-layout-vflex flex-block-99">
                    <h2 className="heading-17">ШИРОКИЙ ВЫБОР АВТОЗАПЧАСТЕЙ</h2>
                    <div className="text-block-51">
                      Сотрудничаем только с проверенными поставщиками. Постоянно обновляем
                      ассортимент, чтобы предложить самые лучшие и актуальные детали.
                    </div>
                  </div>
                  <div className="w-layout-hflex flex-block-101">
                    <div className="w-layout-hflex flex-block-102">
                      <img src="/images/1.png" loading="lazy" alt="" className="image-20" />
                      <div className="text-block-52">Быстрая доставка по всей стране</div>
                    </div>
                    <div className="w-layout-hflex flex-block-102">
                      <img src="/images/2.png" loading="lazy" alt="" className="image-20" />
                      <div className="text-block-52">Высокое качество продукции</div>
                    </div>
                    <div className="w-layout-hflex flex-block-102">
                      <img src="/images/3.png" loading="lazy" alt="" className="image-20" />
                      <div className="text-block-52">Выгодные цены</div>
                    </div>
                    <div className="w-layout-hflex flex-block-102">
                      <img src="/images/4.png" loading="lazy" alt="" className="image-20" />
                      <div className="text-block-52">Профессиональная консультация</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="left-arrow w-slider-arrow-left">
              <div className="div-block-34">
                <div className="icon-2 w-icon-slider-left"></div>
              </div>
            </div>
            <div className="right-arrow w-slider-arrow-right">
              <div className="div-block-34">
                <div className="icon-2 w-icon-slider-right"></div>
              </div>
            </div>
            <div className="slide-nav w-slider-nav w-slider-nav-invert w-round"></div>
          </div>
        </div>
      </section>
    );
  }

  const renderSlide = (banner: HeroBanner) => {
    const slideContent = (
      <div className="w-layout-vflex flex-block-100">
        <div className="div-block-35">
          <img 
            src={banner.imageUrl} 
            loading="lazy"
            sizes="(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px"
            alt={banner.title}
            className="image-21" 
          />
        </div>
        <div className="w-layout-vflex flex-block-99">
          <h2 className="heading-17">{banner.title}</h2>
          {banner.subtitle && (
            <div className="text-block-51">{banner.subtitle}</div>
          )}
        </div>
      </div>
    );

    // Если есть ссылка, оборачиваем в Link
    if (banner.linkUrl) {
      return (
        <Link href={banner.linkUrl} className="slide w-slide" style={{ cursor: 'pointer' }}>
          {slideContent}
        </Link>
      );
    }

    return (
      <div className="slide w-slide">
        {slideContent}
      </div>
    );
  };

  return (
    <section className="section-5" style={{ overflow: 'hidden' }}>
      <div className="w-layout-blockcontainer container w-container">
        <div 
          data-delay="4000" 
          data-animation="slide" 
          className="slider w-slider" 
          data-autoplay="true" 
          data-easing="ease"
          data-hide-arrows="false" 
          data-disable-swipe="false" 
          data-autoplay-limit="0" 
          data-nav-spacing="3"
          data-duration="500" 
          data-infinite="true"
        >
          <div className="mask w-slider-mask">
            {banners.map((banner) => (
              <React.Fragment key={banner.id}>
                {renderSlide(banner)}
              </React.Fragment>
            ))}
          </div>
          
          {/* Показываем стрелки и навигацию только если баннеров больше одного */}
          {banners.length > 1 && (
            <>
              <div className="left-arrow w-slider-arrow-left">
                <div className="div-block-34">
                  <div className="icon-2 w-icon-slider-left"></div>
                </div>
              </div>
              <div className="right-arrow w-slider-arrow-right">
                <div className="div-block-34">
                  <div className="icon-2 w-icon-slider-right"></div>
                </div>
              </div>
              <div className="slide-nav w-slider-nav w-slider-nav-invert w-round"></div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;