import CatalogSubscribe from "@/components/CatalogSubscribe";
import Header from "@/components/Header";
import Head from "next/head";
import Footer from "@/components/Footer";
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import InfoNewsOpen from "@/components/news-open/InfoNewsOpen";
import ContentNews from "@/components/news-open/ContentNews";
import NewsCard from "@/components/news/NewsCard";
import MetaTags from "@/components/MetaTags";
import { getMetaByPath } from "@/lib/meta-config";

export default function NewsOpen() {
  const metaData = getMetaByPath('/news-open');

  return (
    <>
      <MetaTags {...metaData} />
      <Head>
        <link href="/css/normalize.css" rel="stylesheet" type="text/css" />
        <link href="/css/webflow.css" rel="stylesheet" type="text/css" />
        <link href="/css/protekproject.webflow.css" rel="stylesheet" type="text/css" />
      </Head>
      <InfoNewsOpen />
        <section className="main">
          <div className="w-layout-blockcontainer container w-container">
            <div className="w-layout-hflex flex-block-67">
              <div className="w-layout-vflex flex-block-72">
                <div className="w-layout-vflex flex-block-97">
                    <ContentNews />
                </div>
                <div className="w-layout-vflex lastnews">
                <NewsCard
                  key={1}
                  title="Kia Syros будет выделяться необычным стилем"
                  description="Компания Kia готова представить новый кроссовер Syros"
                  category="Новости компании"
                  date="17.12.2024"
                  image="/images/news_img.png"
                />
                <NewsCard
                  key={2}
                  title="Kia Syros будет выделяться необычным стилем"
                  description="Компания Kia готова представить новый кроссовер Syros"
                  category="Новости компании"
                  date="17.12.2024"
                  image="/images/news_img.png"
                />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section-3">
        <CatalogSubscribe />
      </section>
      <Footer />
      <MobileMenuBottomSection />
    </>
  );
} 