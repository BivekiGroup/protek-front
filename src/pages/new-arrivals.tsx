import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import MetaTags from "@/components/MetaTags";
import CatalogInfoHeader from "@/components/CatalogInfoHeader";
import CatalogProductCard from "@/components/CatalogProductCard";
import CatalogProductCardSkeleton from "@/components/CatalogProductCardSkeleton";
import CatalogSubscribe from "@/components/CatalogSubscribe";
import Footer from "@/components/Footer";
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import { GET_NEW_ARRIVALS } from "@/lib/graphql";
import { getMetaByPath } from "@/lib/meta-config";

interface NewArrivalProduct {
  id: string;
  name: string;
  slug?: string;
  article?: string;
  brand?: string;
  retailPrice?: number;
  wholesalePrice?: number;
  createdAt?: string;
  images?: Array<{
    id: string;
    url: string;
    alt?: string;
    order?: number;
  }>;
}

const PAGE_SIZE = 24;

const formatPrice = (price?: number | null) => {
  if (!price && price !== 0) {
    return "По запросу";
  }
  return `${price.toLocaleString("ru-RU")} ₽`;
};

const getPrimaryImage = (product: NewArrivalProduct) => {
  if (product.images && product.images.length > 0) {
    return product.images[0]?.url || "/images/162615.webp";
  }
  return "/images/162615.webp";
};

export default function NewArrivalsPage() {
  const metaConfig = useMemo(() => getMetaByPath('/new-arrivals'), []);
  const [limit, setLimit] = useState(PAGE_SIZE);

  const { data, loading, previousData } = useQuery(GET_NEW_ARRIVALS, {
    variables: { limit },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const products: NewArrivalProduct[] = (data?.newArrivals ?? previousData?.newArrivals ?? []) as NewArrivalProduct[];
  const isInitialLoading = loading && !previousData;
  const isLoadingMore = loading && !!previousData;
  const canLoadMore = !isInitialLoading && products.length >= limit;

  const handleLoadMore = () => {
    setLimit((prev) => prev + PAGE_SIZE);
  };

  return (
    <>
      <MetaTags
        title={metaConfig.title}
        description={metaConfig.description}
        keywords={metaConfig.keywords}
        ogTitle={metaConfig.ogTitle}
        ogDescription={metaConfig.ogDescription}
      />
      <CatalogInfoHeader
        title="Новые поступления"
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Новые поступления" }
        ]}
      />
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-vflex" style={{ gap: '24px' }}>
            <div
              style={{
                display: 'grid',
                gap: '24px',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                marginBottom: '32px',
              }}
            >
              {isInitialLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <CatalogProductCardSkeleton key={`new-arrivals-skeleton-${index}`} />
                ))
              ) : products.length ? (
                products.map((product: NewArrivalProduct) => {
                  const primaryPrice = product.retailPrice ?? product.wholesalePrice ?? null;
                  return (
                    <CatalogProductCard
                      key={product.id}
                      image={getPrimaryImage(product)}
                      discount="Новинка"
                      price={formatPrice(primaryPrice)}
                      oldPrice=""
                      title={product.name}
                      brand={product.brand || "Неизвестный бренд"}
                      articleNumber={product.article}
                      brandName={product.brand}
                      artId={product.id}
                      productId={product.id}
                    />
                  );
                })
              ) : (
                <div
                  className="no-products-message"
                  style={{
                    gridColumn: '1 / -1',
                    padding: '40px',
                    textAlign: 'center',
                    color: '#666',
                    background: '#f7f7f7',
                    borderRadius: '16px',
                  }}
                >
                  <h2 className="heading-5" style={{ marginBottom: '12px' }}>Пока что пусто</h2>
                  <p className="text-block-58" style={{ margin: 0 }}>
                    Мы ещё не добавили новые позиции, но скоро они обязательно появятся.
                  </p>
                </div>
              )}
            </div>

            {canLoadMore && (
              <div className="w-layout-hflex pagination" style={{ justifyContent: 'center' }}>
                <button
                  type="button"
                  className="button_strock w-button showall-btn"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  style={isLoadingMore ? { opacity: 0.7, cursor: 'wait' } : undefined}
                >
                  {isLoadingMore ? 'Загрузка…' : 'Показать ещё'}
                </button>
              </div>
            )}
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
