import React, { useState } from "react";

const CatalogSubscribe: React.FC = () => {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const trimmed = email.trim().toLowerCase();
    const rx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!rx.test(trimmed)) {
      setError("Укажите корректный E-mail");
      return;
    }
    if (!consent) {
      setError("Необходимо согласие на обработку данных");
      return;
    }
    try {
      setLoading(true);
      const cmsGraphql = process.env.NEXT_PUBLIC_CMS_GRAPHQL_URL || "http://localhost:3000/api/graphql";
      const url = cmsGraphql.replace(/\/api\/graphql.*/, "/api/newsletter/subscribe");
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || `Ошибка ${res.status}`);
      }
      setMessage("Спасибо! Вы подписаны на рассылку.");
      setEmail("");
      setConsent(false);
    } catch (err: any) {
      setError(err?.message || "Не удалось оформить подписку");
    } finally {
      setLoading(false);
    }
  };

  return (
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
          <form className="form-3" onSubmit={subscribe}>
            <input
              className="text-field-3 w-input"
              maxLength={256}
              placeholder="Введите E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="submit"
              className="submit-button-copy w-button"
              value={loading ? "Отправка..." : "Подписаться"}
              disabled={loading}
            />
          </form>
          {message && <div className="mt-2 text-green-600 text-sm">{message}</div>}
          {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
        </div>
        <div className="flex flex-row items-center mt-2 pl-0 justify-start">
          <div
            className={`h-[24px] w-[24px] border border-[#8893A1] rounded-sm flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors duration-150 mr-4 ${consent ? 'bg-[#EC1C24]' : 'bg-transparent'}`}
            onClick={() => setConsent((v) => !v)}
            role="checkbox"
            aria-checked={consent}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') setConsent((v) => !v); }}
          >
            <svg
              className={`w-5 h-5 text-white transition-opacity duration-150 ${consent ? 'opacity-100' : 'opacity-0'}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[#8893A1] text-[12px] leading-snug select-none">
            Я даю свое согласие на обработку персональных данных<br />
            и соглашаюсь с условиями <a href="/privacy-policy" className="underline hover:text-[#6c7684]">Политики конфиденциальности</a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default CatalogSubscribe;
