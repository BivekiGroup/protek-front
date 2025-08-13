import React, { useState } from "react";

const CatalogSubscribe: React.FC = () => (
  <div className="w-layout-blockcontainer container subscribe w-container">
    <div className="w-layout-hflex flex-block-18">
      <img
          src="/images/resource2.png"
          alt="Ресурс 2"
          className="mt-[-18px] hide-on-991"
        />
      <div className="div-block-9">
        {/* <h3 className="heading-3 sub">Подпишитесь на новостную рассылку</h3> */}

        <div className="text-block-14">Оставайтесь в курсе акций, <br />новинок и специальных предложений</div>
      </div>
      <div className="form-block-3 w-form">
        <form className="form-3" onSubmit={e => e.preventDefault()}>
          <input className="text-field-3 w-input" maxLength={256} name="name-6" placeholder="Введите E-mail" type="text" id="name-6" />
          <input type="submit" className="submit-button-copy w-button" value="Подписаться" />
        </form>
      </div>
      <div className="flex flex-row items-center mt-2 pl-0 justify-start">
        {/* Кастомный чекбокс без input/label */}
        {(() => {
          const [checked, setChecked] = useState(false);
          return (
            <>
              <span className="text-[#8893A1] text-[12px] leading-snug select-none mr-4">
                Я даю свое согласие на обработку персональных данных<br />
                и соглашаюсь с условиями <a href="/privacy-policy" className="underline hover:text-[#6c7684]">Политики конфиденциальности</a>
              </span>
              <div
                className={`h-[24px] w-[24px] border border-[#8893A1] rounded-sm flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors duration-150 ${checked ? 'bg-[#EC1C24]' : 'bg-transparent'}`}
                onClick={() => setChecked(v => !v)}
                role="checkbox"
                aria-checked={checked}
                tabIndex={0}
                onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') setChecked(v => !v); }}
              >
                <svg
                  className={`w-5 h-5 text-white transition-opacity duration-150 ${checked ? 'opacity-100' : 'opacity-0'}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  </div>
);

export default CatalogSubscribe; 