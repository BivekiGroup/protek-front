import React from 'react';
import Head from 'next/head';
import CatalogSubscribe from "@/components/CatalogSubscribe";
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import NewsAndPromos from "@/components/index/NewsAndPromos";
import Footer from "@/components/Footer";
import IndexTopMenuNav from "@/components/index/IndexTopMenuNav";
import ProductOfDaySection from "@/components/index/ProductOfDaySection";
// import CategoryNavSection from "@/components/index/CategoryNavSection";
import BrandSelectionSection from "@/components/index/BrandSelectionSection";
import BestPriceSection from "@/components/index/BestPriceSection";
import TopSalesSection from "@/components/index/TopSalesSection";
import PromoImagesSection from "@/components/index/PromoImagesSection";
import NewArrivalsSection from '@/components/index/NewArrivalsSection';
import SupportVinSection from '@/components/index/SupportVinSection';
import MetaTags from "@/components/MetaTags";
import { getMetaByPath } from "@/lib/meta-config";
import JsonLdScript from "@/components/JsonLdScript";
import { generateOrganizationSchema, generateWebSiteSchema, PROTEK_ORGANIZATION } from "@/lib/schema";
import HeroSlider from "@/components/index/HeroSlider";
import type { GetServerSideProps } from 'next';
import { getServerMetaProps } from '@/lib/seo-ssr';

export default function Home({ metaFromCms }: { metaFromCms?: any }) {
  const metaData = metaFromCms ?? getMetaByPath('/');
  
  // Генерируем микроразметку для главной страницы
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
      {/* <IndexTopMenuNav /> */}
      <ProductOfDaySection />
      {/** <CategoryNavSection /> */}
      <BrandSelectionSection />
      <BestPriceSection />
      <TopSalesSection />
      <PromoImagesSection />
      <NewArrivalsSection />
      <SupportVinSection />
      <NewsAndPromos />
      <section className="section-3">
        <CatalogSubscribe />
      </section>
      <Footer />
      <MobileMenuBottomSection />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = getServerMetaProps;
