import React from "react";

const SupportVinSection: React.FC = () => (
  <section className="main">
    <div className="w-layout-blockcontainer container-copy w-container">
    <img 
  src="images/support_img.png" 
  loading="lazy" 
  alt="" 
  className="image-27" 
/>
      <div className="div-block-11">
        <div className="w-layout-vflex flex-block-30">
          <h3 className="supportheading">МЫ ВСЕГДА РАДЫ ПОМОЧЬ</h3>
          <div className="text-block-19">
            Если вам нужна помощь с подбором автозапчастей, то воспользуйтесь формой VIN-запроса. Введите идентификационный номер (VIN) вашего автомобиля — и мы найдём нужную деталь.
          </div>
        </div>
        <a href="#" className="submit-button-copy w-button">Отправить VIN-запрос</a>
      </div>
    </div>
  </section>
);

export default SupportVinSection; 