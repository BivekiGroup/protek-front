import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  robots?: string;
  author?: string;
  viewport?: string;
  charset?: string;
}

const MetaTags: React.FC<MetaTagsProps> = ({
  title = 'Protek - Автозапчасти и аксессуары',
  description = 'Protek - широкий ассортимент автозапчастей и аксессуаров для всех марок автомобилей. Быстрая доставка, гарантия качества.',
  keywords = 'автозапчасти, запчасти, автомобили, аксессуары, доставка, protek',
  ogTitle,
  ogDescription,
  ogImage = '/images/og-image.jpg',
  ogUrl,
  twitterTitle,
  twitterDescription,
  twitterImage,
  canonical,
  robots = 'index, follow',
  author = 'Protek',
  viewport = 'width=device-width, initial-scale=1',
  charset = 'utf-8'
}) => {
  const router = useRouter();
  const [override, setOverride] = React.useState<Partial<MetaTagsProps> & { noIndex?: boolean; noFollow?: boolean; structuredData?: any }>({});
  const baseUrl = 'https://protek.ru'; // Замените на ваш домен
  
  const currentUrl = ogUrl || `${baseUrl}${router.asPath}`;
  const canonicalUrl = (override.canonical as string) || canonical || currentUrl;
  
  const finalTitle = (override.title as string) || title;
  const finalDescription = (override.description as string) || description;
  const finalKeywords = (override.keywords as string) || keywords;
  const finalOgTitle = (override.ogTitle as string) || ogTitle || finalTitle;
  const finalOgDescription = (override.ogDescription as string) || ogDescription || finalDescription;
  const finalOgImage = (override.ogImage as string) || ogImage;
  const finalTwitterTitle = twitterTitle || finalTitle;
  const finalTwitterDescription = twitterDescription || finalDescription;
  const finalTwitterImage = twitterImage || finalOgImage;
  const finalRobots = (() => {
    if (override.noIndex || override.noFollow) {
      return `${override.noIndex ? 'noindex' : 'index'}, ${override.noFollow ? 'nofollow' : 'follow'}`;
    }
    return robots;
  })();

  React.useEffect(() => {
    const controller = new AbortController();
    const fetchMeta = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_CMS_BASE_URL;
        if (!base) return;
        const path = router.asPath?.split('?')[0] || '/';
        const res = await fetch(`${base.replace(/\/$/, '')}/api/seo-meta?path=${encodeURIComponent(path)}`, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        const meta = data?.meta;
        if (meta) {
          setOverride({
            title: meta.title || undefined,
            description: meta.description || undefined,
            keywords: meta.keywords || undefined,
            ogTitle: meta.ogTitle || undefined,
            ogDescription: meta.ogDescription || undefined,
            ogImage: meta.ogImage || undefined,
            canonical: meta.canonicalUrl || undefined,
            noIndex: !!meta.noIndex,
            noFollow: !!meta.noFollow,
            structuredData: meta.structuredData,
          });
        }
      } catch { /* ignore */ }
    };
    if (router.isReady) fetchMeta();
    return () => controller.abort();
  }, [router.isReady, router.asPath]);

  return (
    <Head>
      {/* Базовые meta-теги */}
      <meta charSet={charset} />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content={author} />
      <meta name="viewport" content={viewport} />
      <meta name="robots" content={finalRobots} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph теги */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="Protek" />
      <meta property="og:locale" content="ru_RU" />
      
      {/* Twitter Card теги */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTwitterTitle} />
      <meta name="twitter:description" content={finalTwitterDescription} />
      <meta name="twitter:image" content={finalTwitterImage} />
      
      {/* Favicon и иконки */}
      <link href="/images/favicon.png" rel="shortcut icon" type="image/x-icon" />
      <link href="/images/webclip.png" rel="apple-touch-icon" />
      
      {/* Preconnect для производительности */}
      <link href="https://fonts.googleapis.com" rel="preconnect" />
      <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="anonymous" />
      
      {/* Дополнительные meta-теги для SEO */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#dc2626" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Protek" />
    </Head>
  );
};

export default MetaTags; 
