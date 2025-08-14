import MetaTags from "@/components/MetaTags";
import { getMetaByPath } from "@/lib/meta-config";
import CatalogSubscribe from "@/components/CatalogSubscribe";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useRouter } from "next/router";

export default function LoginRequired() {
  const meta = getMetaByPath('/login-required');
  const router = useRouter();

  const openAuth = () => {
    // Добавляем параметр, чтобы Layout открыл модалку авторизации
    router.push({ pathname: router.pathname, query: { ...router.query, openAuth: '1' } }, undefined, { shallow: true });
  };

  return (
    <div className="page-wrapper">
      <MetaTags {...meta} />
      <section className="main bg-gray-50/50">
        <div className="w-layout-blockcontainer container w-container">
          <div className="py-12 md:py-20">
            <div className="mx-auto max-w-3xl">
              <div className="bg-white/80 backdrop-blur border border-gray-100 shadow-xl rounded-2xl p-6 md:p-10">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="shrink-0 rounded-xl bg-[#EC1C24]/10 p-3 md:p-4 text-[#EC1C24] flex items-center justify-center">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm-3 8V6a3 3 0 116 0v3H9z"></path>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Войдите, чтобы продолжить</h1>
                    <p className="mt-2 text-gray-600 md:text-lg">Эта страница доступна только авторизованным пользователям. После входа вы сможете пользоваться всеми возможностями сервиса.</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <FeatureItem title="Добавляйте авто в гараж" subtitle="Сохраняйте свои машины для быстрого подбора" />
                  <FeatureItem title="Сохраняйте избранное" subtitle="Не теряйте важные товары и подборки" />
                  <FeatureItem title="Отслеживайте заказы" subtitle="Статусы, история и повторные покупки" />
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
                  <button onClick={openAuth} className="inline-flex justify-center items-center gap-2 rounded-xl bg-[#EC1C24] px-5 py-3 font-semibold text-white hover:text-white shadow-sm hover:bg-[#DC1C24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EC1C24]/30 transition">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="opacity-90 text-white">
                      <path d="M10 17l5-5-5-5v10zM4 4h8v2H6v12h6v2H4V4z"></path>
                    </svg>
                    Войти или зарегистрироваться
                  </button>
                  <Link href="/" className="inline-flex justify-center items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition">
                    На главную
                  </Link>
                </div>

                <p className="mt-4 text-sm text-gray-500">Нет аккаунта? Зарегистрируйтесь в пару кликов — доступ откроется сразу после подтверждения.</p>
              </div>
            </div>
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

function FeatureItem({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="text-[#EC1C24]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M9 16.2l-3.5-3.5 1.4-1.4L9 13.4l7.1-7.1 1.4 1.4L9 16.2z"></path>
        </svg>
      </div>
      <div>
        <div className="font-semibold text-gray-900">{title}</div>
        <div className="text-sm text-gray-600">{subtitle}</div>
      </div>
    </div>
  );
}
