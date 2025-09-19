import { useRouter } from 'next/router'
import Head from 'next/head'
import MetaTags from '@/components/MetaTags'
import { getMetaByPath } from '@/lib/meta-config'
import CatalogSubscribe from '@/components/CatalogSubscribe'
import Footer from '@/components/Footer'
import MobileMenuBottomSection from '@/components/MobileMenuBottomSection'
import NewsCard from '@/components/news/NewsCard'
import { useQuery } from '@apollo/client'
import { GET_NEWS_BY_SLUG, GET_NEWS_LIST } from '@/lib/graphql'

export default function NewsBySlugPage() {
  const router = useRouter()
  const { slug } = router.query as { slug: string }
  const metaData = getMetaByPath('/news-open')

  const { data } = useQuery(GET_NEWS_BY_SLUG, { variables: { slug }, skip: !slug })
  const { data: other } = useQuery(GET_NEWS_LIST, { variables: { limit: 6, offset: 0 } })
  const item = data?.newsBySlug
  const latest = (other?.newsList || []).filter((n: any) => n.slug !== slug).slice(0, 2)

  const displayDate = item ? (item.publishedAt ? new Date(item.publishedAt) : new Date(item.createdAt)).toLocaleDateString('ru-RU') : ''

  return (
    <>
      <MetaTags {...metaData} />
      <Head>
        <link href="/css/normalize.css" rel="stylesheet" type="text/css" />
        <link href="/css/webflow.css" rel="stylesheet" type="text/css" />
        <link href="/css/protekproject.webflow.css" rel="stylesheet" type="text/css" />
      </Head>
      {/* Info header */}
      <section className="section-info">
        <div className="w-layout-blockcontainer container info w-container">
          <div className="w-layout-vflex flex-block-9">
            <div className="w-layout-hflex flex-block-7">
              <a href="/" className="link-block w-inline-block"><div>Главная</div></a>
              <div className="text-block-3">→</div>
              <a href="/news" className="link-block w-inline-block"><div>Новости</div></a>
              <div className="text-block-3">→</div>
              <a href="#" className="link-block-2 w-inline-block"><div>{item?.title || 'Новость'}</div></a>
            </div>
            <div className="w-layout-hflex flex-block-8">
              <div className="w-layout-hflex flex-block-10">
                <h1 className="heading">{item?.title || ''}</h1>
              </div>
            </div>
            <div className="w-layout-hflex flex-block-98">
              <div className="w-layout-hflex flex-block-33">
                <div className="w-layout-hflex flex-block-32">
                  <div className="div-block-13"></div>
                  <div className="text-block-20">{item?.category || ''}</div>
                </div>
                <div className="w-layout-hflex flex-block-34">
                  <div className="div-block-14"></div>
                  <img src="/images/time-line.svg" loading="lazy" alt="" className="image-6" />
                  <div className="text-block-20">{displayDate}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-hflex flex-block-67">
            <div className="w-layout-vflex flex-block-72">
              <div className="w-layout-vflex flex-block-97">
                {/* Content */}
                {item && (
                  <div className="w-layout-vflex contentnews">
                    <div className="w-layout-hflex flex-block-74-copy">
                      <div className="w-layout-vflex" style={{ gap: '24px' }}>
                        {item.coverImageUrl && (
                          <div className="news-open-cover" style={{ width: '100%' }}>
                            <img
                              src={item.coverImageUrl}
                              alt={item.title || 'Изображение новости'}
                              style={{ width: '100%', height: 'auto', borderRadius: '16px' }}
                            />
                          </div>
                        )}
                        {item.shortDescription && (
                          <div className="text-block-20 description" style={{ fontSize: '18px', lineHeight: '28px' }}>
                            {item.shortDescription}
                          </div>
                        )}
                        <div dangerouslySetInnerHTML={{ __html: item.contentHtml }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="w-layout-vflex lastnews">
                {latest.map((n: any) => (
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
        </div>
      </section>
      <section className="section-3">
        <CatalogSubscribe />
      </section>
      <Footer />
      <MobileMenuBottomSection />
    </>
  )
}
