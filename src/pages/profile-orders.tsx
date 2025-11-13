import CatalogSubscribe from '@/components/CatalogSubscribe';
import Footer from '@/components/Footer';
import LKMenu from '@/components/LKMenu';
import MetaTags from '@/components/MetaTags';
import MobileMenuBottomSection from '@/components/MobileMenuBottomSection';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfileOrdersMain from '@/components/profile/ProfileOrdersMain';
import { getMetaByPath } from '@/lib/meta-config';

const ProfileOrdersPage = () => {
  const metaData = getMetaByPath('/profile-orders');

  return (
    <div className="page-wrapper">
      <MetaTags {...metaData} />
      <ProfileInfo />
      <div className="flex flex-col pt-10 pb-16 max-md:px-5">
        <div className="flex relative gap-8 items-start self-stretch max-md:gap-5 max-sm:flex-col max-sm:gap-4 justify-center mx-auto max-w-[1580px] w-full h-full">
          <LKMenu />
          <ProfileOrdersMain />
        </div>
      </div>
      <section className="section-3">
        <CatalogSubscribe />
      </section>
      <MobileMenuBottomSection />
      <Footer />
    </div>
  );
};

export default ProfileOrdersPage;
