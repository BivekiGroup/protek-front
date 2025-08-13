import MetaTags from "@/components/MetaTags";
import { getMetaByPath } from "@/lib/meta-config";
import CatalogSubscribe from "@/components/CatalogSubscribe";
import Footer from "@/components/Footer";

export default function LoginRequired() {
  const meta = getMetaByPath('/login-required');

  return (
    <div className="page-wrapper">
      <MetaTags {...meta} />
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="py-20 text-center">
            <h1 className="text-2xl font-bold mb-4">Требуется авторизация</h1>
            <p className="text-lg">Бро, нажми сверху на кнопочку «Вход» и авторизуйся, чтобы получить доступ к этой странице.</p>
          </div>
        </div>
      </section>
      <section className="section-3">
        <CatalogSubscribe />
      </section>
      <Footer />
    </div>
  );
}

