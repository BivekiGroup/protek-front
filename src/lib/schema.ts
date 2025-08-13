// Утилиты для генерации микроразметки schema.org
export interface SchemaOrgProduct {
  name: string;
  description?: string;
  brand: string;
  sku: string;
  image?: string;
  category?: string;
  offers: SchemaOrgOffer[];
}

export interface SchemaOrgOffer {
  price: number;
  currency: string;
  availability: string;
  seller: string;
  deliveryTime?: string;
  warehouse?: string;
}

export interface SchemaOrgBreadcrumb {
  name: string;
  url: string;
}

export interface SchemaOrgOrganization {
  name: string;
  description?: string;
  url: string;
  logo?: string;
  contactPoint?: {
    telephone: string;
    email?: string;
    contactType: string;
  };
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
}

export interface SchemaOrgLocalBusiness extends SchemaOrgOrganization {
  openingHours?: string[];
  geo?: {
    latitude: number;
    longitude: number;
  };
}

// Генератор микроразметки для товара
export const generateProductSchema = (product: SchemaOrgProduct): object => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.brand} ${product.sku} - ${product.name}`,
    brand: {
      "@type": "Brand",
      name: product.brand
    },
    sku: product.sku,
    mpn: product.sku,
    image: product.image,
    category: product.category || "Автозапчасти",
    offers: product.offers.map(offer => ({
      "@type": "Offer",
      price: offer.price,
      priceCurrency: offer.currency,
      availability: offer.availability,
      seller: {
        "@type": "Organization",
        name: offer.seller
      },
      deliveryLeadTime: offer.deliveryTime,
      availableAtOrFrom: {
        "@type": "Place",
        name: offer.warehouse || "Склад"
      }
    }))
  };
};

// Генератор микроразметки для организации
export const generateOrganizationSchema = (org: SchemaOrgOrganization): object => {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: org.name,
    url: org.url,
    description: org.description
  };

  if (org.logo) {
    schema.logo = org.logo;
  }

  if (org.contactPoint) {
    schema.contactPoint = {
      "@type": "ContactPoint",
      telephone: org.contactPoint.telephone,
      email: org.contactPoint.email,
      contactType: org.contactPoint.contactType
    };
  }

  if (org.address) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: org.address.streetAddress,
      addressLocality: org.address.addressLocality,
      addressRegion: org.address.addressRegion,
      postalCode: org.address.postalCode,
      addressCountry: org.address.addressCountry
    };
  }

  return schema;
};

// Генератор микроразметки для местного бизнеса
export const generateLocalBusinessSchema = (business: SchemaOrgLocalBusiness): object => {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    url: business.url,
    description: business.description
  };

  if (business.contactPoint) {
    schema.contactPoint = {
      "@type": "ContactPoint",
      telephone: business.contactPoint.telephone,
      email: business.contactPoint.email,
      contactType: business.contactPoint.contactType
    };
  }

  if (business.address) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: business.address.streetAddress,
      addressLocality: business.address.addressLocality,
      addressRegion: business.address.addressRegion,
      postalCode: business.address.postalCode,
      addressCountry: business.address.addressCountry
    };
  }

  if (business.openingHours) {
    schema.openingHours = business.openingHours;
  }

  if (business.geo) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: business.geo.latitude,
      longitude: business.geo.longitude
    };
  }

  return schema;
};

// Генератор микроразметки для хлебных крошек
export const generateBreadcrumbSchema = (breadcrumbs: SchemaOrgBreadcrumb[]): object => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url
    }))
  };
};

// Генератор микроразметки для сайта с поиском
export const generateWebSiteSchema = (name: string, url: string, searchUrl?: string): object => {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: name,
    url: url
  };

  if (searchUrl) {
    schema.potentialAction = {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${searchUrl}?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    };
  }

  return schema;
};

// Утилита для конвертации доступности товара в schema.org формат
export const convertAvailability = (stock: string | number): string => {
  const stockNum = typeof stock === 'string' ? parseInt(stock) || 0 : stock;
  
  if (stockNum > 0) {
    return "https://schema.org/InStock";
  } else {
    return "https://schema.org/OutOfStock";
  }
};

// Утилита для генерации JSON-LD скрипта
export const generateJsonLdScript = (schema: object): string => {
  return JSON.stringify(schema, null, 2);
};

// Интерфейс для компонента JSON-LD (компонент будет в отдельном файле)
export interface JsonLdScriptProps {
  schema: object;
}

// Данные организации Protek
export const PROTEK_ORGANIZATION: SchemaOrgOrganization = {
  name: "Protek",
  description: "Protek - широкий ассортимент автозапчастей и аксессуаров для всех марок автомобилей. Быстрая доставка по России, гарантия качества, низкие цены.",
  url: "https://protek.ru",
  logo: "https://protek.ru/images/logo.svg",
  contactPoint: {
    telephone: "+7-800-555-0123",
    email: "info@protek.ru",
    contactType: "customer service"
  },
  address: {
    streetAddress: "ул. Примерная, 123",
    addressLocality: "Москва",
    addressRegion: "Москва",
    postalCode: "123456",
    addressCountry: "RU"
  }
};

// Данные для LocalBusiness
export const PROTEK_LOCAL_BUSINESS: SchemaOrgLocalBusiness = {
  ...PROTEK_ORGANIZATION,
  openingHours: [
    "Mo-Fr 09:00-18:00",
    "Sa 10:00-16:00"
  ],
  geo: {
    latitude: 55.7558,
    longitude: 37.6176
  }
}; 