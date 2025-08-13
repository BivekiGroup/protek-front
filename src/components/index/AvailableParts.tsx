import React from "react";
import Link from "next/link";

const AvailableParts = () => (
<section>
  <div className="w-layout-blockcontainer container w-container">
    <div className="w-layout-vflex flex-block-5">
      <div className="w-layout-hflex flex-block-31">
        <h2 className="heading-4">Автозапчасти в наличии</h2>
        <div className="w-layout-hflex flex-block-29">
          <Link href="/catalog" className="text-block-18">
            Ко всем автозапчастям
          </Link>
          <img src="/images/Arrow_right.svg" loading="lazy" alt="" />
        </div>
      </div>
      <div className="w-layout-hflex flex-block-6">
        <Link href="/catalog" className="div-block-12">
          <h1 className="heading-7">Аксессуары</h1>
          <img src="/images/IMG_1.png" loading="lazy" alt="" className="image-22" />
        </Link>
        <Link href="/catalog" className="div-block-12-copy">
          <h1 className="heading-7">Воздушные фильтры</h1>
          <img src="/images/IMG_2.png" loading="lazy" alt="" className="image-22" />
        </Link>
        <Link href="/catalog" className="div-block-12">
          <h1 className="heading-7">Шины</h1>
          <img src="/images/IMG_3.png" loading="lazy" alt="" className="image-22" />
        </Link>
        <Link href="/catalog" className="div-block-123">
          <h1 className="heading-7-white">Аккумуляторы</h1>
          <img src="/images/IMG_4.png" loading="lazy" alt="" className="image-22" />
        </Link>
        <Link href="/catalog" className="div-block-12 small">
          <h1 className="heading-7">Диски</h1>
          <img src="/images/IMG_5.png" loading="lazy" alt="" className="image-22" />
        </Link>
        <Link href="/catalog" className="div-block-12 small">
          <h1 className="heading-7">Свечи</h1>
          <img src="/images/IMG_6.png" loading="lazy" alt="" className="image-22" />
        </Link>
        <Link href="/catalog" className="div-block-red small">
          <h1 className="heading-7-white">Масла</h1>
          <img src="/images/IMG_7.png" loading="lazy" alt="" className="image-22" />
        </Link>
        <Link href="/catalog" className="div-block-12 small">
          <h1 className="heading-7">Диски</h1>
          <img src="/images/IMG_5.png" loading="lazy" alt="" className="image-22" />
        </Link>
      </div>
    </div>
  </div>
</section>
);

export default AvailableParts;