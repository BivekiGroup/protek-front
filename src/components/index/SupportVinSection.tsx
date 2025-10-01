import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useAuthPrompt } from "@/contexts/AuthPromptContext";
import { onAuthChanged } from "@/lib/authEvents";

const SUPPORT_SUBJECT = "VIN-запрос";

const SupportVinSection: React.FC = () => {
  const router = useRouter();
  const { openAuthPrompt } = useAuthPrompt();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const evaluate = () => {
      const token = localStorage.getItem("authToken");
      setIsAuthenticated(Boolean(token));
    };

    evaluate();
    const unsubscribe = onAuthChanged((detail) => {
      setIsAuthenticated(detail.status === "login");
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  const handleVinRequest = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      const hasToken = typeof window !== "undefined" ? Boolean(localStorage.getItem("authToken")) : isAuthenticated;

      if (!hasToken) {
        toast.error("Авторизуйтесь, чтобы отправить VIN-запрос");
        openAuthPrompt({ targetPath: `/profile-support?subject=${encodeURIComponent(SUPPORT_SUBJECT)}` });
        return;
      }

      router.push({
        pathname: "/profile-support",
        query: { subject: SUPPORT_SUBJECT },
      });
    },
    [isAuthenticated, openAuthPrompt, router]
  );

  return (
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
          <button type="button" className="submit-button-copy w-button" onClick={handleVinRequest}>
            Отправить VIN-запрос
          </button>
        </div>
      </div>
    </section>
  );
};

export default SupportVinSection;
