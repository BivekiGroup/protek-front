import React from "react";
import NewsCard from "@/components/news/NewsCard";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { GET_NEWS_LIST } from "@/lib/graphql";

const NewsAndPromos = () => {
  const router = useRouter();
  
  const handleNavigateToNews = () => {
    router.push('/news');
  };

  const { data } = useQuery(GET_NEWS_LIST, { variables: { limit: 4, offset: 0 } });
  const items = data?.newsList?.slice(0, 4) || [];

  return (
    <section className="main">
      <div className="w-layout-blockcontainer container w-container">
        <div className="w-layout-vflex news-index-block">
          <button
            className="w-layout-hflex flex-block-31 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleNavigateToNews}
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <h2 className="heading-4">Новости и акции</h2>
            <img src="/images/Arrow_right.svg" loading="lazy" alt="Стрелка вправо" />
          </button>
          <div className="news-grid">
            {items.map((n: any) => (
              <NewsCard
                key={n.id}
                title={n.title}
                description={n.shortDescription}
                category={n.category}
                date={(n.publishedAt ? new Date(n.publishedAt) : new Date(n.createdAt)).toLocaleDateString('ru-RU')}
                image={n.coverImageUrl}
                slug={n.slug}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsAndPromos; 
