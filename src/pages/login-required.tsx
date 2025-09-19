import MetaTags from "@/components/MetaTags";
import { getMetaByPath } from "@/lib/meta-config";
import CatalogSubscribe from "@/components/CatalogSubscribe";
import Footer from "@/components/Footer";
import type { GetServerSideProps } from 'next';
import { getServerMetaProps } from '@/lib/seo-ssr';
import LoginRequiredPrompt from '@/components/auth/LoginRequiredPrompt';

export default function LoginRequired({ metaFromCms }: { metaFromCms?: any }) {
  const meta = metaFromCms ?? getMetaByPath('/login-required');

  return (
    <div className="page-wrapper">
      <MetaTags {...meta} />
      <section className="main bg-gray-50/50">
        <div className="w-layout-blockcontainer container w-container">
          <LoginRequiredPrompt />
        </div>
      </section>
      <section className="section-3">
        <CatalogSubscribe />
      </section>
      <Footer />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = getServerMetaProps;
