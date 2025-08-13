import MetaTags from "../components/MetaTags";
import { getMetaByPath } from "../lib/meta-config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function OrderConfirmation() {
  const metaConfig = getMetaByPath('/order-confirmation');

  return (
    <>
      <MetaTags 
        title={metaConfig.title}
        description={metaConfig.description}
        keywords={metaConfig.keywords}
        ogTitle={metaConfig.ogTitle}
        ogDescription={metaConfig.ogDescription}
      />
      <Header />
      {/* Вставь сюда содержимое <body> из order-confirmation.html, преобразовав в JSX. Все пути к картинкам и svg поменяй на /images/... */}
      {/* Пример: <img src="/images/logo.svg" ... /> */}
      {/* Сохрани все классы для стилей. */}
      {/* TODO: Перевести формы и интерактив на React позже */}
      <Footer />
    </>
  );
} 