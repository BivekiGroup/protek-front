import Head from 'next/head';
import ThankInfo from "@/components/ThankInfo";
import Header from "@/components/Header";
import CatalogSubscribe from "@/components/CatalogSubscribe";
import Footer from "@/components/Footer";
import MobileMenuBottomSection from "@/components/MobileMenuBottomSection";
import Link from 'next/link';
import MetaTags from "@/components/MetaTags";
import { getMetaByPath } from "@/lib/meta-config";
import type { GetServerSideProps } from 'next';
import { getServerMetaProps } from '@/lib/seo-ssr';

export default function ThankYouPage({ metaFromCms }: { metaFromCms?: any }) {
  const metaData = metaFromCms ?? getMetaByPath('/thankyoupage');

  return (
    <>
      <MetaTags {...metaData} />
      <Head>
        <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js" type="text/javascript"></script>
        <script type="text/javascript" dangerouslySetInnerHTML={{__html: `WebFont.load({  google: {    families: [\"Onest:regular,600,700,800,900:cyrillic-ext,latin\"]  }});`}} />
        <script type="text/javascript" dangerouslySetInnerHTML={{__html: `!function(o,c){var n=c.documentElement,t=\" w-mod-\";n.className+=t+\"js\",(\"ontouchstart\"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+\"touch\")}(window,document);`}} />
      </Head>
      
      <ThankInfo />
      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-hflex flex-block-67">
            <div className="w-layout-vflex flex-block-72">
              <div className="w-layout-vflex image-thx"></div>
              <div className="w-layout-vflex desc-wholesale">
                <div className="w-layout-hflex thxcontent">
                  <h3 className="heading-14">Ваш заказ <span className="text-span-4">№2024ABCD123</span> успешно оплачен ✅ </h3>
                  <div className="w-layout-vflex flex-block-103">
                    <div className="w-layout-hflex flex-block-75">
                      <div className="txtpthx">Номер вашего заказа</div>
                      <div className="text-block-36">№2024ABCD123</div>
                    </div>
                    <div className="w-layout-hflex flex-block-75">
                      <div className="txtpthx">Дата и время заказа</div>
                      <div className="text-block-36">16:33 | 5 апреля 2025</div>
                    </div>
                    <div className="w-layout-hflex flex-block-75">
                      <div className="txtpthx">Сумма заказа</div>
                      <div className="text-block-36">18 000 ₽</div>
                    </div>
                  </div>
                  <h3 className="thxsubtitle">📦 Что дальше?</h3>
                  <div className="text-block-36">✅ Мы уже обрабатываем ваш заказ.<br />🚚 Отправка ожидается в течение 1–3 рабочих дней.<br />📬 Как только посылка будет передана в службу доставки, вы получите уведомление с трек-номером.</div>
                  <div className="w-layout-hflex flex-block-104">
                    <Link href="/cart" legacyBehavior><a className="submit-button-s w-button">Продолжить покупки</a></Link>
                    <Link href="/cart" legacyBehavior><a className="button_strock-s w-button">К списку заказазов</a></Link>
                  </div>
                </div>
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
  );
} 

export const getServerSideProps: GetServerSideProps = getServerMetaProps;
