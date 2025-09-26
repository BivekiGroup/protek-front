import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ApolloProvider, useMutation, gql } from "@apollo/client";
import toast from "react-hot-toast";
import Footer from "@/components/Footer";
import MetaTags from "@/components/MetaTags";
import { apolloClient } from "@/lib/apollo";
import { getMetaByPath } from "@/lib/meta-config";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Headset,
  Info,
  Loader2,
  Mail,
  PackageCheck,
} from "@/components/icons";

const CONFIRM_PAYMENT = gql`
  mutation ConfirmPayment($orderId: ID!) {
    confirmPayment(orderId: $orderId) {
      id
      orderNumber
      status
    }
  }
`;

type ConfirmationStatus = "idle" | "pending" | "success" | "error" | "skipped";

const NEXT_STEPS = [
  {
    title: "Проверка заказа",
    description:
      "Менеджер подтвердит наличие и свяжется с вами, если понадобится уточнить детали доставки или оплаты.",
    icon: Clock,
  },
  {
    title: "Комплектация и упаковка",
    description:
      "Мы соберём заказ на складе, подготовим документы и передадим в доставку или на пункт выдачи.",
    icon: PackageCheck,
  },
  {
    title: "Уведомление о готовности",
    description:
      "Получите письмо и пуш в личном кабинете, когда заказ будет готов к выдаче или отправлен курьером.",
    icon: Mail,
  },
] as const;

const SUPPORT_INFO = {
  phone: "+7 (495) 260-20-60",
  schedule: "Ежедневно 9:00 — 21:00",
  email: "info@protekauto.ru",
};

const getQueryValue = (value: string | string[] | undefined): string | null => {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value) && value.length > 0) {
    return value[0] ?? null;
  }
  return null;
};

function PaymentSuccessContent() {
  const router = useRouter();
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [confirmationStatus, setConfirmationStatus] = useState<ConfirmationStatus>("idle");
  const [confirmationError, setConfirmationError] = useState<string | null>(null);
  const [confirmPayment] = useMutation(CONFIRM_PAYMENT);
  const hasAttemptedConfirmation = useRef(false);
  const previousOrderId = useRef<string | null>(null);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const paymentIdValue = getQueryValue(router.query.payment_id);
    const orderIdValue = getQueryValue(router.query.orderId);
    const orderNumberValue = getQueryValue(router.query.orderNumber);
    const paymentMethodValue = getQueryValue(router.query.paymentMethod);

    setPaymentId(paymentIdValue);
    setOrderId(orderIdValue);
    setOrderNumber(orderNumberValue);
    setPaymentMethod(paymentMethodValue);

    if (orderIdValue && orderIdValue !== previousOrderId.current) {
      previousOrderId.current = orderIdValue;
      hasAttemptedConfirmation.current = false;
      setConfirmationStatus("idle");
      setConfirmationError(null);
    }

    if (!orderIdValue || hasAttemptedConfirmation.current) {
      return;
    }

    hasAttemptedConfirmation.current = true;

    const userData = typeof window !== "undefined" ? window.localStorage.getItem("userData") : null;

    if (!userData) {
      setConfirmationStatus("skipped");
      return;
    }

    setConfirmationStatus("pending");

    confirmPayment({
      variables: {
        orderId: orderIdValue,
      },
    })
      .then(() => {
        setConfirmationStatus("success");
        setConfirmationError(null);
        toast.success("Оплата успешно подтверждена");
      })
      .catch((error: any) => {
        console.error("Ошибка подтверждения оплаты:", error);
        setConfirmationStatus("error");
        setConfirmationError(error?.message ?? "Не удалось подтвердить оплату");
        toast.error("Не удалось обновить статус заказа");
      });
  }, [
    router.isReady,
    router.query.payment_id,
    router.query.orderId,
    router.query.orderNumber,
    router.query.paymentMethod,
    confirmPayment,
  ]);

  const paymentMethodLabel = useMemo(() => {
    if (!paymentMethod) {
      return null;
    }

    const normalized = paymentMethod.toLowerCase();
    const dictionary: Record<string, string> = {
      balance: "Оплата с баланса",
      card: "Банковская карта",
      sbp: "Система быстрых платежей",
      invoice: "Безналичный расчёт",
      cash: "Наличный расчёт",
      "bank-transfer": "Банковский перевод",
    };

    return dictionary[normalized] ?? paymentMethod;
  }, [paymentMethod]);

  const detailItems = useMemo(() => {
    const items: { label: string; value: string }[] = [];

    if (orderNumber) {
      items.push({ label: "Номер заказа", value: orderNumber });
    }
    if (paymentMethodLabel) {
      items.push({ label: "Способ оплаты", value: paymentMethodLabel });
    }
    if (paymentId) {
      items.push({ label: "ID платежа", value: paymentId });
    }
    if (orderId) {
      items.push({ label: "ID заказа в системе", value: orderId });
    }

    return items;
  }, [orderId, orderNumber, paymentId, paymentMethodLabel]);

  const renderConfirmationBanner = () => {
    switch (confirmationStatus) {
      case "pending":
        return (
          <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Обновляем статус заказа…</span>
          </div>
        );
      case "success":
        return (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            <span>Статус заказа обновлён. Можно отслеживать его в личном кабинете.</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-none" />
            <div>
              <p className="font-medium">Не удалось автоматически обновить статус заказа.</p>
              {confirmationError ? (
                <p className="mt-1 text-xs text-rose-600 sm:text-sm">{confirmationError}</p>
              ) : null}
            </div>
          </div>
        );
      case "skipped":
        return (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <Info className="mt-0.5 h-5 w-5 flex-none" />
            <p>
              Войдите в личный кабинет, чтобы мы подтвердили оплату и показали актуальный статус заказа.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const handleContinueShopping = () => {
    router.push("/");
  };

  const handleViewOrders = () => {
    router.push("/profile-orders");
  };

  return (
    <>
      <section className="section-info">
        <div className="w-layout-blockcontainer container info w-container">
          <div className="w-layout-vflex flex-block-9">
            <div className="w-layout-hflex flex-block-7">
              <Link href="/" className="link-block w-inline-block">
                <div>Главная</div>
              </Link>
              <div className="text-block-3">→</div>
              <div className="text-block-3">Оплата завершена</div>
            </div>
            <div className="w-layout-hflex flex-block-8">
              <div className="w-layout-hflex flex-block-10">
                <h1 className="heading">Оплата прошла успешно</h1>
                <div className="text-block-4">
                  {orderNumber
                    ? `Заказ №${orderNumber} уже передан в обработку. Статус можно отслеживать в личном кабинете.`
                    : "Заказ передан в обработку. Статус можно отслеживать в личном кабинете."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="main">
        <div className="w-layout-blockcontainer container w-container">
          <div className="grid gap-8 pb-16 lg:grid-cols-[minmax(0,1fr),360px]">
            <section className="rounded-3xl border border-slate-100 bg-white px-6 py-8 shadow-lg shadow-slate-900/5 sm:px-10 sm:py-12">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-6">
                  <span className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-emerald-500 text-white sm:h-20 sm:w-20">
                    <CheckCircle2 className="h-8 w-8" />
                  </span>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                        Оплата получена
                      </p>
                      <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                        {orderNumber ? `Заказ №${orderNumber} принят в работу` : "Заказ принят в работу"}
                      </h1>
                    </div>
                    <p className="text-base text-slate-600 sm:text-lg lg:max-w-none">
                      {paymentMethodLabel
                        ? `Мы зафиксировали оплату (${paymentMethodLabel}) и уже начинаем подготовку заказа.`
                        : "Мы зафиксировали оплату и уже начинаем подготовку заказа."}
                      {" "}
                      Все обновления появятся в личном кабинете и придут на указанную при оформлении почту.
                    </p>
                  </div>
                </div>

                {renderConfirmationBanner()}

                {detailItems.length > 0 && (
                  <dl className="grid gap-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-6 sm:grid-cols-2">
                    {detailItems.map((item) => (
                      <div key={item.label}>
                        <dt className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                          {item.label}
                        </dt>
                        <dd className="mt-2 break-all text-lg font-semibold text-slate-900">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-900/5">
                  <h2 className="text-lg font-semibold text-slate-900">Документы и уведомления</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Мы отправили чек и подтверждение заказа на указанную вами электронную почту. Если письмо не
                    пришло, проверьте папку «Спам» или обратитесь в поддержку.
                  </p>
                  {orderNumber ? (
                    <p className="mt-4 text-sm text-slate-500">
                      В переписке и платежных документах указывайте номер заказа:
                      <span className="ml-1 font-semibold text-slate-800">№{orderNumber}</span>.
                    </p>
                  ) : null}
                </div>

                <div className="payment-success__actions">
                  <button
                    type="button"
                    onClick={handleViewOrders}
                    className="payment-success__button payment-success__button--primary"
                  >
                    Перейти к заказам
                  </button>
                  <button
                    type="button"
                    onClick={handleContinueShopping}
                    className="payment-success__button payment-success__button--secondary"
                  >
                    Вернуться на главную
                  </button>
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-900/5">
                <h2 className="text-lg font-semibold text-slate-900">Что дальше</h2>
                <ul className="mt-4 space-y-4">
                  {NEXT_STEPS.map(({ title, description, icon: Icon }) => (
                    <li key={title} className="flex gap-4">
                      <span className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-base font-medium text-slate-900">{title}</p>
                        <p className="mt-1 text-sm text-slate-600">{description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl bg-[#0d336c] p-6 text-white shadow-lg shadow-slate-900/10">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-white/10">
                    <Headset className="h-6 w-6" />
                  </span>
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold">Нужна помощь?</h2>
                    <p className="text-sm text-white/80">
                      Команда поддержки подскажет по статусу заказа, доставке и документам.
                    </p>
                    <div className="space-y-2 text-sm">
                      <a
                        href={`tel:${SUPPORT_INFO.phone.replace(/[^+\d]/g, "")}`}
                        className="block font-semibold text-white transition-opacity hover:opacity-80"
                      >
                        {SUPPORT_INFO.phone}
                      </a>
                      <div className="text-white/70">{SUPPORT_INFO.schedule}</div>
                      <a
                        href={`mailto:${SUPPORT_INFO.email}`}
                        className="block text-white transition-opacity hover:opacity-80"
                      >
                        {SUPPORT_INFO.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default function PaymentSuccess() {
  const metaConfig = getMetaByPath('/payment/success');

  return (
    <>
      <MetaTags 
        title={metaConfig.title}
        description={metaConfig.description}
        keywords={metaConfig.keywords}
        ogTitle={metaConfig.ogTitle}
        ogDescription={metaConfig.ogDescription}
      />
      <ApolloProvider client={apolloClient}>
        <PaymentSuccessContent />
      </ApolloProvider>
    </>
  );
}
