import MetaTags from "../components/MetaTags";
import { getMetaByPath } from "../lib/meta-config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatalogSubscribe from "@/components/CatalogSubscribe";
import InfoNews from "@/components/news/InfoNews";
import NewsMenu from "@/components/news/NewsMenu";
import NewsCard from "@/components/news/NewsCard";
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import { useQuery } from "@apollo/client";
import { GET_NEWS_LIST } from "@/lib/graphql";

export default function News() {
  const metaConfig = getMetaByPath('/news');
  const { data } = useQuery(GET_NEWS_LIST, { variables: { limit: 24, offset: 0 } });
  const items = data?.newsList || [];
  
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
              {items.map((n: any) => (
                <NewsCard
                  key={n.id}
                  title={n.title}
                  description={n.shortDescription}
                  category={n.category}
                  date={(n.publishedAt ? new Date(n.publishedAt) : new Date(n.createdAt)).toLocaleDateString('ru-RU')}
                  image={n.coverImageUrl}
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
