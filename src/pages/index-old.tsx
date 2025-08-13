import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatalogSubscribe from "@/components/CatalogSubscribe";
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import HeroSlider from "@/components/index/HeroSlider";
import CatalogSection from "@/components/index/CatalogSection";
import AvailableParts from "@/components/index/AvailableParts";
import NewsAndPromos from "@/components/index/NewsAndPromos";
import AboutHelp from "@/components/about/AboutHelp";
import MetaTags from "@/components/MetaTags";
import { getMetaByPath } from "@/lib/meta-config";
import JsonLdScript from "@/components/JsonLdScript";
import { generateOrganizationSchema, generateWebSiteSchema, PROTEK_ORGANIZATION } from "@/lib/schema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function HomeOld() {
  const metaData = getMetaByPath('/');
  
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
      <HeroSlider />
      <CatalogSection />
      <div className="w-layout-blockcontainer container w-container">
      <AboutHelp />
      </div>
      <AvailableParts />
      <NewsAndPromos />
      <section className="section-3">
        <CatalogSubscribe />
      </section>
      <Footer />
      <MobileMenuBottomSection />
    </>
  );
} 