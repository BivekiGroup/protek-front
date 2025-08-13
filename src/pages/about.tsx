import Head from "next/head";

import Footer from "@/components/Footer";
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import CatalogInfoHeader from "@/components/CatalogInfoHeader";
import CatalogSubscribe from "@/components/CatalogSubscribe";
import AboutIntro from "@/components/about/AboutIntro";
import AboutOffers from "@/components/about/AboutOffers";
import AboutProtekInfo from "@/components/about/AboutProtekInfo";
import AboutHelp from "@/components/about/AboutHelp";
import MetaTags from "@/components/MetaTags";
import { getMetaByPath } from "@/lib/meta-config";
import JsonLdScript from "@/components/JsonLdScript";
import { generateOrganizationSchema, generateBreadcrumbSchema, PROTEK_ORGANIZATION } from "@/lib/schema";

export default function About() {
  const metaData = getMetaByPath('/about');
  
  // Генерируем микроразметку Organization для страницы "О компании"
  const organizationSchema = generateOrganizationSchema(PROTEK_ORGANIZATION);
  
  // Генерируем микроразметку BreadcrumbList
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Главная", url: "https://protek.ru/" },
    { name: "О компании", url: "https://protek.ru/about" }
  ]);

  return (
    <>
      <MetaTags {...metaData} />
      <JsonLdScript schema={organizationSchema} />
      <JsonLdScript schema={breadcrumbSchema} />
      <CatalogInfoHeader
        title="О компании"
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "О компании" }
        ]}
      />
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-hflex flex-block-67">
            <AboutIntro />
            <AboutOffers />
            <AboutProtekInfo />
            <AboutHelp />
          </div>
        </div>
      </section>
      <section className="section-3">
        <CatalogSubscribe />
      </section>
      <Footer />
      <MobileMenuBottomSection />
      <style jsx>{`
        .text-block-36 { font-size: 14px; }
        .submit-button.w-button { font-size: 16px; }
        .heading-14 { font-size: 20px; }
        .heading-13 { font-size: 24px; }
        .text-block-37 { font-size: 14px; }
        .text-block-38 { font-size: 14px; }
        .text-block-19 { font-size: 16px; }
      `}</style>
    </>
  );
} 