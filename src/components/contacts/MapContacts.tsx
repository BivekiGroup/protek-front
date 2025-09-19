import React from "react";

const MapContacts = () => (
  <div className="w-layout-vflex map-contacts">
    <div className="map w-widget w-widget-map" style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
      <iframe
        src="https://yandex.ru/map-widget/v1/?ll=37.410879%2C55.834057&mode=search&ol=geo&ouri=ymapsbm1%3A%2F%2Fgeo%3Fdata%3DCgg1Njc3NjUxNxI_0KDQvtGB0YHQuNGPLCDQnNC-0YHQutCy0LAsINCf0L7RhdC-0LTQvdGL0Lkg0L_RgNC-0LXQt9C0LCA00LoxIgoNvaQVQhUTVl9C&z=16.93"
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        style={{ position: 'absolute', top: 0, left: 0 }}
        title="Карта"
      ></iframe>
    </div>
  </div>
);

export default MapContacts; 
