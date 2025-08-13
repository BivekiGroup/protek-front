import MetaTags from "../components/MetaTags";
import { getMetaByPath } from "../lib/meta-config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatalogSubscribe from "@/components/CatalogSubscribe";
import InfoNews from "@/components/news/InfoNews";
import NewsMenu from "@/components/news/NewsMenu";
import NewsCard from "@/components/news/NewsCard";
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";

export default function News() {
  const metaConfig = getMetaByPath('/news');
  
  return (
    <>
      <MetaTags 
        title={metaConfig.title}
        description={metaConfig.description}
        keywords={metaConfig.keywords}
        ogTitle={metaConfig.ogTitle}
        ogDescription={metaConfig.ogDescription}
      />
      <InfoNews />
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-vflex">
            <NewsMenu />
            <div className="w-layout-hflex main-news">
              {Array(12).fill(0).map((_, i) => (
                <NewsCard
                  key={i}
                  title="Kia Syros будет выделяться необычным стилем"
                  description="Компания Kia готова представить новый кроссовер Syros"
                  category="Новости компании"
                  date="17.12.2024"
                  image="/images/news_img.png"
                />
              ))}
              <div className="w-layout-hflex pagination">
                  <a href="#" className="button_strock w-button">Показать ещё</a>
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