import Head from 'next/head';
import { useRouter } from 'next/router';

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
  const baseUrl = 'https://protek.ru'; // Замените на ваш домен
  
  const currentUrl = ogUrl || `${baseUrl}${router.asPath}`;
  const canonicalUrl = canonical || currentUrl;
  
  const finalOgTitle = ogTitle || title;
  const finalOgDescription = ogDescription || description;
  const finalTwitterTitle = twitterTitle || title;
  const finalTwitterDescription = twitterDescription || description;
  const finalTwitterImage = twitterImage || ogImage;

  return (
    <Head>
      {/* Базовые meta-теги */}
      <meta charSet={charset} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="viewport" content={viewport} />
      <meta name="robots" content={robots} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph теги */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:image" content={ogImage} />
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