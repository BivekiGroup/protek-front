import React from 'react';
import Head from 'next/head';
import CatalogSubscribe from "@/components/CatalogSubscribe";
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import NewsAndPromos from "@/components/index/NewsAndPromos";
import Footer from "@/components/Footer";
import IndexTopMenuNav from "@/components/index/IndexTopMenuNav";
import MetaTags from "@/components/MetaTags";
import { getMetaByPath } from "@/lib/meta-config";
import JsonLdScript from "@/components/JsonLdScript";
import { generateOrganizationSchema, generateWebSiteSchema, PROTEK_ORGANIZATION } from "@/lib/schema";


export default function Confidentiality() {
  const metaData = getMetaByPath('/');

  // Добавьте эти строки:
  const organizationSchema = generateOrganizationSchema(PROTEK_ORGANIZATION);
  const websiteSchema = generateWebSiteSchema(
    "Protek - Автозапчасти и аксессуары", 
    "https://protek.ru",
    "https://protek.ru/search"
  );

  return (
    <>
      <MetaTags {...metaData} />
      <JsonLdScript schema={organizationSchema} />
      <JsonLdScript schema={websiteSchema} />
      <section className="section-info">
        <div className="w-layout-blockcontainer container info w-container">
            <div className="w-layout-vflex flex-block-9">
            <div className="w-layout-hflex flex-block-7">
                <a href="#" className="link-block w-inline-block">
                <div>Главная</div>
                </a>
                <div className="text-block-3">→</div>
                <a href="#" className="link-block-2 w-inline-block">
                <div>Политика конфиденциальности</div>
                </a>
            </div>
            <div className="w-layout-hflex flex-block-8">
                <div className="w-layout-hflex flex-block-10">
                <h1 className="heading">Политика конфиденциальности</h1>
                </div>
            </div>
            </div>
        </div>
        </section>
        <div className="flex relative gap-8 items-start self-stretch pt-10 pb-20  max-md:p-8 max-sm:gap-5 max-sm:p-5">
        <div className="flex relative flex-col gap-8 items-start p-10 bg-white rounded-3xl flex-[1_0_0] max-w-[1580px] mx-auto max-md:p-8 max-sm:gap-5 max-sm:p-5">
          <div className="flex relative flex-col gap-5 items-start self-stretch max-sm:gap-4">
            <div
              layer-name="Объявлен старт продаж электрических насосов"
              className="relative self-stretch text-3xl font-bold leading-9 text-gray-950"
            >
              Объявлен старт продаж электрических насосов
            </div>
            <div
              layer-name="Бренд вывел на рынок сразу широкий ассортимент, уже на старте продаж - более 100 артикулов и включает в себя позиции для брендов-лидеров автомобильного рынка, например: артикул 77WPE080 для Mercedes-Benz S-CLASS (W221, C216), артикул 77WPE096 – Land Rover DISCOVERY V (L462) / Jaguar F-PACE (X761), артикул 77WPE014 – Audi Q5 (8RB) / Volkswagen TOUAREG (7P5, 7P6)."
              className="relative self-stretch text-base leading-6 text-gray-600 max-sm:text-sm"
            >
              Бренд вывел на рынок сразу широкий ассортимент, уже на старте
              продаж - более 100 артикулов и включает в себя позиции для
              брендов-лидеров автомобильного рынка, например: артикул 77WPE080
              для Mercedes-Benz S-CLASS (W221, C216), артикул 77WPE096 – Land
              Rover DISCOVERY V (L462) / Jaguar F-PACE (X761), артикул 77WPE014
              – Audi Q5 (8RB) / Volkswagen TOUAREG (7P5, 7P6).
            </div>
          </div>
          <div className="flex relative flex-col gap-8 items-start self-stretch max-sm:gap-5">
            <div
              layer-name="Преимущества электрических насосов охлаждающей жидкости MasterKit Electro:"
              className="relative self-stretch text-3xl font-medium leading-9 text-gray-950"
            >
              Преимущества электрических насосов охлаждающей жидкости MasterKit
              Electro:
            </div>
            <div className="flex relative flex-col gap-3.5 items-start self-stretch">
              <div className="flex relative gap-10 items-start w-full max-md:gap-5 max-sm:gap-4">
                <div className="relative shrink-0 mt-2 w-2 h-2 bg-gray-600 rounded-full" />
                <div
                  layer-name="Отличная производительность за счёт применения компонентов известных мировых брендов."
                  className="relative text-base leading-6 text-gray-600 flex-[1_0_0] max-sm:text-sm"
                >
                  Отличная производительность за счёт применения компонентов
                  известных мировых брендов.
                </div>
              </div>
              <div className="flex relative gap-10 items-start w-full max-md:gap-5 max-sm:gap-4">
                <div className="relative shrink-0 mt-2 w-2 h-2 bg-gray-600 rounded-full" />
                <div
                  layer-name="Герметичность и устойчивость к коррозии"
                  className="relative text-base leading-6 text-gray-600 flex-[1_0_0] max-sm:text-sm"
                >
                  Герметичность и устойчивость к коррозии
                </div>
              </div>
              <div className="flex relative gap-10 items-start w-full max-md:gap-5 max-sm:gap-4">
                <div className="relative shrink-0 mt-2 w-2 h-2 bg-gray-600 rounded-full" />
                <div
                  layer-name="Высококачественные материалы компонентов, обеспечивающие долгий срок службы"
                  className="relative text-base leading-6 text-gray-600 flex-[1_0_0] max-sm:text-sm"
                >
                  Высококачественные материалы компонентов, обеспечивающие
                  долгий срок службы
                </div>
              </div>
              <div className="flex relative gap-10 items-start w-full max-md:gap-5 max-sm:gap-4">
                <div className="relative shrink-0 mt-2 w-2 h-2 bg-gray-600 rounded-full" />
                <div
                  layer-name="Широкий ассортимент – более 100 артикулов"
                  className="relative text-base leading-6 text-gray-600 flex-[1_0_0] max-sm:text-sm"
                >
                  Широкий ассортимент – более 100 артикулов
                </div>
              </div>
            </div>
            <div
              layer-name="На электрические насосы системы охлаждения MasterKit Electro предоставляется гарантия 1 год или 30.000 км пробега, в зависимости от того, что наступит раньше. Все новинки уже внесены в каталог подбора продукции и доступны для заказа."
              className="relative self-stretch text-base leading-6 text-gray-600 max-sm:text-sm"
            >
              На электрические насосы системы охлаждения MasterKit Electro
              предоставляется гарантия 1 год или 30.000 км пробега, в
              зависимости от того, что наступит раньше. Все новинки уже внесены
              в каталог подбора продукции и доступны для заказа.
            </div>
            <div
              layer-name="ABig_Button"
              data-component-name="ABig_Button"
              data-variant-name="Button big=Default"
              className="relative gap-2.5 px-10 py-6 text-lg font-medium leading-5 text-center text-white no-underline bg-red-600 rounded-xl transition-all cursor-pointer border-[none] duration-[0.2s] ease-[ease] w-fit max-sm:px-8 max-sm:py-5 max-sm:w-full hover:bg-red-700"
            >
              Перейти к товару
            </div>
          </div>
        </div>
      </div>
      <section className="section-3">
        <CatalogSubscribe />
      </section>
      <Footer />
      <MobileMenuBottomSection />
    </>
  );
}
