import React, { useState } from "react";
import AddressForm from "./AddressForm";
import AddressDetails from "./AddressDetails";

interface ProfileAddressWayProps {
  onBack: () => void;
}

const ProfileAddressWay = ({ onBack }: ProfileAddressWayProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [address, setAddress] = useState("");

  return (
    <div className="flex relative gap-8 items-start bg-white rounded-2xl flex-[1_0_0] min-h-[860px]  max-md:flex-col max-md:gap-5  ">
      {/* Левая часть */}
      {showDetails ? (
        <AddressDetails
          onClose={() => setShowDetails(false)}
          onBack={onBack}
          address={address}
          setAddress={setAddress}
        />
      ) : (
        <AddressForm onDetectLocation={() => setShowDetails(true)} address={address} setAddress={setAddress} onBack={onBack} />
      )}
      {/* Правая часть: карта */}
      <div className="flex-1  rounded-2xl overflow-hidden shadow-lg md:w-full ">
        <iframe
          src="https://yandex.ru/map-widget/v1/?ll=37.410879%2C55.834057&mode=search&ol=geo&ouri=ymapsbm1%3A%2F%2Fgeo%3Fdata%3DCgg1Njc3NjUxNxI_0KDQvtGB0YHQuNGPLCDQnNC-0YHQutCy0LAsINCf0L7RhdC-0LTQvdGL0Lkg0L_RgNC-0LXQt9C0LCA00LoxIgoNvaQVQhUTVl9C&z=16.93"
          className="w-full h-full min-h-[990px] max-md:min-h-[300px] "
          frameBorder="0"
          allowFullScreen
          title="Карта"
        ></iframe>
      </div>
    </div>
    
  );
};

export default ProfileAddressWay; 
